import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  Award,
  Briefcase,
  Download,
  FileText,
  FolderKanban,
  GraduationCap,
  Heart,
  Languages as LanguagesIcon,
  Link2,
  Minus,
  Plus,
  Settings as SettingsIcon,
  Sparkles,
  StretchHorizontal,
  StretchVertical,
  User,
  X,
  LayoutTemplate,
} from 'lucide-react'

import AppShell from '../components/AppShell'
import AppErrorBoundary from '../components/AppErrorBoundary'
import ATSScorePanel from '../components/ATSScorePanel'
import CVForm from '../components/CVForm'
import CVPreview from '../components/CVPreview'
import CVSuggestionsPanel from '../components/CVSuggestionsPanel'
import NavRail from '../components/NavRail'
import ToastStack from '../components/ToastStack'
import {
  getThemePreference,
  getUiTheme,
  setThemePreference,
  UI_LOCALE_STORAGE_KEY,
} from '../utils/designSystem'
import {
  CV_DRAFT_PHOTO_STORAGE_KEY,
  CV_DRAFT_STORAGE_KEY,
  CV_ONBOARDING_SEEN_STORAGE_KEY,
  createInitialCvData,
  demoCvData,
  initialCvData,
  parsePastedCvText,
  parseImportedCvData,
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from '../utils/cvForm'
import {
  getCvTemplates,
  getCvTemplate,
} from '../utils/cvTemplates'
import { cvFormReducer, FORM_ACTION } from '../reducers/cvFormReducer'
import { uiReducer, createInitialUiState, UI_ACTION } from '../reducers/uiReducer'
import {
  createExportFileName,
} from '../utils/cvSnapshot'
import {
  buildShareUrl,
  readCvStateFromLocation,
  removeShareDataParamFromCurrentUrl,
} from '../utils/shareLinks'
import {
  analyzeJobDescription,
  evaluateAtsScore,
} from '../utils/atsScore'
import {
  evaluateCvFeedback,
  improveAboutText,
  improveExperienceText,
} from '../utils/cvFeedback'

const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024
const HISTORY_COMMIT_DELAY_MS = 600
const THEME_PREFERENCE_CYCLE = ['light', 'dark', 'system']

const NAV_SECTIONS = [
  { id: 'personal', anchor: 'section-personal', icon: User, kind: 'scroll', label: { en: 'Personal Information', fi: 'Henkilötiedot' } },
  { id: 'summary', anchor: 'section-summary', icon: FileText, kind: 'scroll', label: { en: 'Summary', fi: 'Yhteenveto' } },
  { id: 'experience', anchor: 'section-experience', icon: Briefcase, kind: 'scroll', label: { en: 'Experience', fi: 'Kokemus' } },
  { id: 'education', anchor: 'section-education', icon: GraduationCap, kind: 'scroll', label: { en: 'Education', fi: 'Koulutus' } },
  { id: 'projects', anchor: 'section-projects', icon: FolderKanban, kind: 'scroll', label: { en: 'Projects', fi: 'Projektit' } },
  { id: 'skills', anchor: 'section-skills', icon: Sparkles, kind: 'scroll', label: { en: 'Skills', fi: 'Taidot' } },
  { id: 'certificates', anchor: 'section-certificates', icon: Award, kind: 'scroll', label: { en: 'Certificates', fi: 'Sertifikaatit' } },
  { id: 'languages', anchor: 'section-languages', icon: LanguagesIcon, kind: 'scroll', label: { en: 'Languages', fi: 'Kielet' } },
  { id: 'links', anchor: 'section-links', icon: Link2, kind: 'scroll', label: { en: 'Links', fi: 'Linkit' } },
  { id: 'interests', anchor: 'section-interests', icon: Heart, kind: 'scroll', label: { en: 'Interests', fi: 'Kiinnostuksen kohteet' } },
]

const NAV_UTILITY_ITEMS = [
  { id: 'settings', anchor: 'section-settings', icon: SettingsIcon, kind: 'scroll', label: { en: 'Settings', fi: 'Asetukset' } },
  { id: 'templates', icon: LayoutTemplate, kind: 'action', label: { en: 'Templates', fi: 'Pohjat' } },
  { id: 'export', icon: Download, kind: 'action', label: { en: 'Export', fi: 'Vie' } },
]

const ALL_SCROLL_NAV_ITEMS = [...NAV_SECTIONS, ...NAV_UTILITY_ITEMS].filter((item) => item.kind === 'scroll')

function createToast(message, type = 'success') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    type,
  }
}

function waitForFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

async function waitForPreviewRefresh() {
  await waitForFrame()
  await waitForFrame()
}

async function waitForPreviewVariantSync(previewElement, expectedVariant, maxFrames = 60) {
  if (!previewElement || !expectedVariant) {
    await waitForPreviewRefresh()
    return true
  }

  for (let frame = 0; frame < maxFrames; frame += 1) {
    const activeVariant =
      previewElement.querySelector('[data-export-variant]')?.getAttribute('data-export-variant')
      || previewElement.getAttribute('data-export-variant')

    if (activeVariant === expectedVariant) {
      await waitForPreviewRefresh()
      return true
    }

    await waitForFrame()
  }

  return false
}

async function waitForPreviewModeSync(previewElement, expectedMode, maxFrames = 60) {
  if (!previewElement || !expectedMode) {
    await waitForPreviewRefresh()
    return true
  }

  const expectedClassName =
    expectedMode === 'ats' ? 'preview-document--ats' : 'preview-document--designer'

  for (let frame = 0; frame < maxFrames; frame += 1) {
    if (previewElement.classList.contains(expectedClassName)) {
      await waitForPreviewRefresh()
      return true
    }

    await waitForFrame()
  }

  return false
}

function loadInitialCvSession() {
  if (typeof window === 'undefined') {
    return {
      formData: initialCvData,
      initialToast: null,
      clearShareParam: false,
      storageIssue: false,
    }
  }

  try {
    const storedDraftState = safeStorageGet(CV_DRAFT_STORAGE_KEY)
    const storedDraftPhotoState = safeStorageGet(CV_DRAFT_PHOTO_STORAGE_KEY, '')
    const onboardingState = safeStorageGet(CV_ONBOARDING_SEEN_STORAGE_KEY, 'false')
    const storedDraft = storedDraftState.value
    const storedDraftPhoto = typeof storedDraftPhotoState.value === 'string'
      ? storedDraftPhotoState.value
      : ''
    const hasSeenOnboarding = onboardingState.value === 'true'
    const hasStorageIssue =
      !storedDraftState.ok ||
      !onboardingState.ok ||
      !storedDraftPhotoState.ok
    const markOnboardingSeen = () => {
      safeStorageSet(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
    }

    try {
      const sharedFormData = readCvStateFromLocation()

      if (sharedFormData) {
        markOnboardingSeen()
        return {
          formData: sharedFormData,
          initialToast: createToast('Loaded CV from share link.', 'success'),
          clearShareParam: false,
          storageIssue: hasStorageIssue,
        }
      }
    } catch (error) {
      const fallbackFormData = storedDraft
        ? parseImportedCvData(JSON.parse(storedDraft))
        : createInitialCvData()
      const restoredFormData = storedDraftPhoto
        ? { ...fallbackFormData, photo: storedDraftPhoto }
        : fallbackFormData

      markOnboardingSeen()

      return {
        formData: restoredFormData,
        initialToast: createToast(
          storedDraft
            ? `${error instanceof Error ? error.message : 'Shared CV link could not be loaded.'} Restored your saved draft instead.`
            : error instanceof Error
              ? error.message
              : 'Shared CV link could not be loaded.',
          'error',
        ),
        clearShareParam: true,
        storageIssue: hasStorageIssue,
      }
    }

    if (!storedDraft) {
      markOnboardingSeen()

      if (!hasSeenOnboarding) {
        return {
          formData: structuredClone(demoCvData),
          initialToast: createToast('Loaded a sample CV to help you get started.', 'success'),
          clearShareParam: false,
          storageIssue: hasStorageIssue,
        }
      }

      return {
        formData: initialCvData,
        initialToast: null,
        clearShareParam: false,
        storageIssue: hasStorageIssue,
      }
    }

    markOnboardingSeen()
    const restoredDraft = parseImportedCvData(JSON.parse(storedDraft))

    return {
      formData: storedDraftPhoto
        ? { ...restoredDraft, photo: storedDraftPhoto }
        : restoredDraft,
      initialToast: createToast('Restored your saved draft.', 'success'),
      clearShareParam: false,
      storageIssue: hasStorageIssue,
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Saved draft was invalid and has been cleared.'
    const shouldClearShareParam =
      error instanceof Error && error.message.startsWith('Shared CV link')

    if (!shouldClearShareParam) {
      safeStorageRemove(CV_DRAFT_STORAGE_KEY)
      safeStorageRemove(CV_DRAFT_PHOTO_STORAGE_KEY)
    }

    return {
      formData: createInitialCvData(),
      initialToast: createToast(message, 'error'),
      clearShareParam: shouldClearShareParam,
      storageIssue: true,
    }
  }
}

function ResumeBuilderPage({
  initialLocale,
  onLocaleChange = () => {},
  onHeaderChange,
}) {
  const initialSession = useMemo(() => loadInitialCvSession(), [])
  const [formData, dispatchFormData] = useReducer(cvFormReducer, initialSession.formData)
  const [uiState, dispatchUi] = useReducer(
    uiReducer,
    initialSession,
    (session) => {
      const nextState = createInitialUiState(session)

      if (initialLocale === 'fi' || initialLocale === 'en') {
        return { ...nextState, locale: initialLocale }
      }

      return nextState
    },
  )
  const {
    selectedTemplate,
    atsFriendlyMode,
    locale,
    mobilePreviewVisible,
    activeExport,
    isImporting,
    pastedCvText,
    jobDescription,
    toasts,
  } = uiState
  const ui = getUiTheme()
  const previewRef = useRef(null)
  const importInputRef = useRef(null)
  const toastTimeoutsRef = useRef(new Map())
  const storageWarningShownRef = useRef(false)
  const shareWarningShownRef = useRef(false)
  const editorScrollRef = useRef(null)
  const templateSelectRef = useRef(null)
  const previewViewportRef = useRef(null)

  const [activeSectionId, setActiveSectionId] = useState('personal')
  const [themePreference, setThemePreferenceState] = useState(() => getThemePreference())
  const [searchQuery, setSearchQuery] = useState('')
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false)
  const [isResponsivePreview, setIsResponsivePreview] = useState(false)
  const [zoomPercent, setZoomPercent] = useState(100)

  const [historyPast, setHistoryPast] = useState([])
  const [historyFuture, setHistoryFuture] = useState([])
  const historyCommittedRef = useRef(initialSession.formData)
  const historySkipNextCommitRef = useRef(false)

  const errors = useMemo(
    () => ({
      fullName: formData.fullName.trim() ? '' : locale === 'fi' ? 'Koko nimi on pakollinen.' : 'Full name is required.',
      title: formData.title.trim() ? '' : locale === 'fi' ? 'Ammattinimike on pakollinen.' : 'Professional title is required.',
    }),
    [formData.fullName, formData.title, locale],
  )

  const exportFileName = createExportFileName(formData) || 'cv'
  const currentTemplate = useMemo(
    () => getCvTemplate(selectedTemplate, locale),
    [locale, selectedTemplate],
  )
  const templates = useMemo(() => getCvTemplates(locale), [locale])
  const shellStyle = {}
  const feedback = useMemo(() => evaluateCvFeedback(formData, { locale }), [formData, locale])
  const atsScore = useMemo(
    () => evaluateAtsScore(formData, { locale, atsFriendly: atsFriendlyMode }),
    [atsFriendlyMode, formData, locale],
  )
  const jobDescriptionAnalysis = useMemo(
    () => analyzeJobDescription(formData, jobDescription),
    [formData, jobDescription],
  )
  const showToast = (message, type = 'success') => {
    const nextToast = createToast(message, type)

    dispatchUi({ type: UI_ACTION.ADD_TOAST, toast: nextToast })

    const timeoutId = window.setTimeout(() => {
      dispatchUi({ type: UI_ACTION.REMOVE_TOAST, toastId: nextToast.id })
      toastTimeoutsRef.current.delete(nextToast.id)
    }, 2800)

    toastTimeoutsRef.current.set(nextToast.id, timeoutId)
  }

  const reportStorageIssue = useCallback(() => {
    if (storageWarningShownRef.current) {
      return
    }

    storageWarningShownRef.current = true
    showToast(
      locale === 'fi'
        ? 'Tallennustila on rajoitettu. Muutokset eivät välttämättä säily päivityksen jälkeen.'
        : 'Storage access is limited. Your changes may not persist after refresh.',
      'error',
    )
  }, [locale])

  const setStorageValue = useCallback((key, value) => {
    const result = safeStorageSet(key, value)

    if (!result.ok) {
      reportStorageIssue()
    }

    return result
  }, [reportStorageIssue])

  const removeStorageValue = useCallback((key) => {
    const result = safeStorageRemove(key)

    if (!result.ok) {
      reportStorageIssue()
    }

    return result
  }, [reportStorageIssue])

  const isActionBusy = Boolean(activeExport) || isImporting

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const draftWithoutPhoto = { ...formData, photo: '' }

      setStorageValue(CV_DRAFT_STORAGE_KEY, JSON.stringify(draftWithoutPhoto))
    }, 520)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [formData, setStorageValue])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setStorageValue(CV_DRAFT_PHOTO_STORAGE_KEY, formData.photo || '')
    }, 1200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [formData.photo, setStorageValue])

  useEffect(() => {
    if (historySkipNextCommitRef.current) {
      historySkipNextCommitRef.current = false
      historyCommittedRef.current = formData
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      if (formData !== historyCommittedRef.current) {
        const committed = historyCommittedRef.current

        historyCommittedRef.current = formData
        setHistoryPast((past) => [...past, committed])
        setHistoryFuture([])
      }
    }, HISTORY_COMMIT_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [formData])

  const canUndo = historyPast.length > 0
  const canRedo = historyFuture.length > 0

  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) {
      return
    }

    const previousFormData = historyPast[historyPast.length - 1]

    setHistoryPast(historyPast.slice(0, -1))
    setHistoryFuture([...historyFuture, historyCommittedRef.current])
    historyCommittedRef.current = previousFormData
    historySkipNextCommitRef.current = true
    dispatchFormData({ type: FORM_ACTION.SET_FORM_DATA, formData: previousFormData })
  }, [dispatchFormData, historyPast, historyFuture])

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) {
      return
    }

    const nextFormData = historyFuture[historyFuture.length - 1]

    setHistoryFuture(historyFuture.slice(0, -1))
    setHistoryPast([...historyPast, historyCommittedRef.current])
    historyCommittedRef.current = nextFormData
    historySkipNextCommitRef.current = true
    dispatchFormData({ type: FORM_ACTION.SET_FORM_DATA, formData: nextFormData })
  }, [dispatchFormData, historyFuture, historyPast])

  useEffect(() => {
    setStorageValue(UI_LOCALE_STORAGE_KEY, locale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
    onLocaleChange(locale)
  }, [locale, onLocaleChange, setStorageValue])

  useEffect(() => {
    if (initialSession.storageIssue) {
      reportStorageIssue()
    }
  }, [initialSession.storageIssue, reportStorageIssue])

  useEffect(() => {
    if (initialSession.clearShareParam) {
      removeShareDataParamFromCurrentUrl()
    }
  }, [initialSession])

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toastTimeoutsRef.current.has(toast.id)) {
        return
      }

      const timeoutId = window.setTimeout(() => {
        dispatchUi({ type: UI_ACTION.REMOVE_TOAST, toastId: toast.id })
        toastTimeoutsRef.current.delete(toast.id)
      }, 2800)

      toastTimeoutsRef.current.set(toast.id, timeoutId)
    })
  }, [toasts])

  useEffect(() => {
    const timeouts = toastTimeoutsRef.current

    return () => {
      timeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
    }
  }, [])

  const secondaryButtonClassName = `border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`
  const compactButtonClassName = `shrink-0 border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`

  const handleExport = useCallback(async (type) => {
    dispatchUi({ type: UI_ACTION.SET_ACTIVE_EXPORT, value: type })

    const exportLabel =
      type === 'pdf-designer'
        ? atsFriendlyMode
          ? 'ATS PDF'
          : 'Designer PDF'
        : type === 'html'
          ? 'HTML'
          : 'JSON'

    const toastLabel =
      type === 'pdf-designer'
        ? locale === 'fi' ? 'Valmistellaan PDF-vientiä...' : 'Preparing PDF export...'
        : type === 'html'
          ? locale === 'fi' ? 'Valmistellaan HTML-vientiä...' : 'Preparing HTML export...'
          : locale === 'fi' ? 'Valmistellaan JSON-vientiä...' : 'Preparing JSON export...'

    showToast(toastLabel, 'info')

    const zoomPercentBeforeExport = type === 'pdf-designer' ? zoomPercent : null

    if (zoomPercentBeforeExport !== null && zoomPercentBeforeExport !== 100) {
      setZoomPercent(100)
      await waitForPreviewRefresh()
    }

    try {
      const {
        exportCvAsJson,
        exportCvAsPdf,
        exportCvAsHtml,
      } = await import('../utils/exporters')

      if (type === 'pdf-designer') {
        const expectedVariant = getCvTemplate(selectedTemplate, locale).variant
        const exportPdfMode = atsFriendlyMode ? 'ats' : 'designer'
        const didSyncPreviewMode = await waitForPreviewModeSync(
          previewRef.current,
          exportPdfMode,
        )

        if (!didSyncPreviewMode) {
          showToast(
            locale === 'fi'
              ? `Esikatselutila ei ole synkronoitu (${exportPdfMode.toUpperCase()}). Yritä hetken kuluttua uudelleen.`
              : `Preview mode is not synced (${exportPdfMode.toUpperCase()}). Try exporting again in a moment.`,
            'error',
          )
          return
        }

        const didSyncVariant = await waitForPreviewVariantSync(
          previewRef.current,
          expectedVariant,
        )

        if (!didSyncVariant) {
          const activeVariant =
            previewRef.current?.querySelector('[data-export-variant]')?.getAttribute('data-export-variant')
            || previewRef.current?.getAttribute('data-export-variant')
            || 'unknown'

          showToast(
            locale === 'fi'
              ? `Pohjan esikatselu ei ole vielä synkronoitu (odotettu ${expectedVariant}, saatu ${activeVariant}). Yritä uudelleen.`
              : `Template preview is not synced yet (expected ${expectedVariant}, got ${activeVariant}). Try again.`,
            'error',
          )
          return
        }

        await exportCvAsPdf(previewRef.current, exportFileName, {
          mode: exportPdfMode,
          formData,
          template: selectedTemplate,
          variant: selectedTemplate,
          atsFriendlyMode,
          locale,
        })
      }

      if (type === 'json') {
        exportCvAsJson(formData, exportFileName)
      }

      if (type === 'html') {
        exportCvAsHtml(formData, exportFileName, { locale })
      }

      showToast(
        locale === 'fi'
          ? `${exportLabel} on ladattu.`
          : `${exportLabel} export downloaded.`,
      )
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : locale === 'fi'
            ? `${exportLabel}-vienti epäonnistui.`
            : `Failed to export ${exportLabel}.`,
        'error',
      )
    } finally {
      if (zoomPercentBeforeExport !== null && zoomPercentBeforeExport !== 100) {
        setZoomPercent(zoomPercentBeforeExport)
      }
      dispatchUi({ type: UI_ACTION.SET_ACTIVE_EXPORT, value: '' })
    }
  }, [atsFriendlyMode, exportFileName, formData, locale, previewRef, selectedTemplate, zoomPercent])

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleImportFile = useCallback(async (event) => {
    const [file] = event.target.files ?? []

    if (!file) {
      return
    }

    dispatchUi({ type: UI_ACTION.SET_IMPORTING, value: true })

    try {
      if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
        showToast(
          locale === 'fi'
            ? 'Tiedosto on liian suuri. Tuetun koko on enintään 5 Mt.'
            : 'File is too large. Maximum supported size is 5MB.',
          'error',
        )
        return
      }

      showToast(locale === 'fi' ? `Tuodaan ${file.name}...` : `Importing ${file.name}...`, 'info')
      const fileText = await file.text()
      const parsedValue = JSON.parse(fileText)
      const importedData = parseImportedCvData(parsedValue)

      dispatchFormData({ type: FORM_ACTION.SET_FORM_DATA, formData: importedData })
      setStorageValue(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
      showToast(locale === 'fi' ? `CV-tiedot tuotu tiedostosta ${file.name}.` : `Imported CV data from ${file.name}.`)
    } catch (error) {
      if (error instanceof SyntaxError) {
        showToast(
          locale === 'fi'
            ? 'Virheellinen JSON-tiedosto. Lataa kelvollinen PortifyCV-vienti, jossa on fullName, title, skills, experience, education ja links.'
            : 'Invalid JSON file. Upload a valid PortifyCV export with fullName, title, skills, experience, education, and links.',
          'error',
        )
      } else {
        showToast(
          error instanceof Error
            ? error.message
            : locale === 'fi' ? 'Valitun tiedoston tuonti epäonnistui.' : 'Failed to import the selected file.',
          'error',
        )
      }
    } finally {
      dispatchUi({ type: UI_ACTION.SET_IMPORTING, value: false })
      event.target.value = ''
    }
  }, [dispatchFormData, locale, setStorageValue])

  const handleResetForm = useCallback(() => {
    dispatchFormData({ type: FORM_ACTION.RESET_FORM })
    removeStorageValue(CV_DRAFT_STORAGE_KEY)
    removeStorageValue(CV_DRAFT_PHOTO_STORAGE_KEY)
    showToast(locale === 'fi' ? 'Lomake nollattu tyhjäksi CV:ksi.' : 'Form reset to a blank CV.')
  }, [dispatchFormData, locale, removeStorageValue])

  const handleLoadDemo = useCallback(() => {
    dispatchFormData({ type: FORM_ACTION.SET_FORM_DATA, formData: structuredClone(demoCvData) })
    setStorageValue(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
    showToast(locale === 'fi' ? 'Demo-CV ladattu.' : 'Demo CV loaded.')
  }, [dispatchFormData, locale, setStorageValue])

  const handlePasteCvImport = useCallback(() => {
    try {
      const parsedData = parsePastedCvText(pastedCvText, { locale })

      dispatchFormData({ type: FORM_ACTION.MERGE_FORM_DATA, partialData: parsedData })
      dispatchUi({ type: UI_ACTION.SET_PASTED_CV_TEXT, value: '' })
      setStorageValue(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
      showToast(locale === 'fi' ? 'Liitetty CV-teksti tuotu.' : 'Pasted CV text imported.')
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : locale === 'fi' ? 'Liitetyn CV-tekstin jäsentäminen epäonnistui.' : 'Failed to parse pasted CV text.',
        'error',
      )
    }
  }, [dispatchFormData, locale, pastedCvText, setStorageValue])

  const handleCopyShareLink = useCallback(async () => {
    try {
      const shareUrl = buildShareUrl(formData)

      await window.navigator.clipboard.writeText(shareUrl)
      if (!shareWarningShownRef.current) {
        shareWarningShownRef.current = true
        showToast(
          locale === 'fi'
            ? 'Huom: jakolinkki sisältää CV-tietosi URL:ssa. Jaa vain luotetuille vastaanottajille.'
            : 'Note: the share link embeds your CV data in the URL. Share it only with trusted recipients.',
          'info',
        )
      }
      showToast(locale === 'fi' ? 'Jakolinkki kopioitu leikepöydälle.' : 'Share link copied to clipboard.')
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : locale === 'fi'
            ? 'Tälle CV:lle ei voitu luoda jaettavaa linkkiä.'
            : 'Failed to create a shareable link for this CV.',
        'error',
      )
    }
  }, [formData, locale])

  const handleImproveAboutText = useCallback(() => {
    const nextAbout = improveAboutText(formData, { locale })

    if (nextAbout === formData.about.trim()) {
      showToast(locale === 'fi' ? 'Esittelyteksti on jo tiivis.' : 'About text already looks concise.', 'success')
      return
    }

    dispatchFormData({ type: FORM_ACTION.SET_ROOT_FIELD, field: 'about', value: nextAbout })
    showToast(locale === 'fi' ? 'Esittelytekstiä parannettu.' : 'About text improved.')
  }, [dispatchFormData, formData, locale])

  const handleImproveExperienceText = useCallback((index) => {
    const currentItem = formData.experience[index]

    if (!currentItem) {
      return
    }

    const nextDescription = improveExperienceText(currentItem, { locale })

    if (nextDescription === currentItem.description.trim()) {
      showToast(
        locale === 'fi'
          ? `Kokemus ${index + 1} on jo riittävän tiivis.`
          : `Experience ${index + 1} already looks concise.`,
        'success',
      )
      return
    }

    dispatchFormData({
      type: FORM_ACTION.UPDATE_ARRAY_ITEM,
      section: 'experience',
      index,
      field: 'description',
      value: nextDescription,
    })
    showToast(
      locale === 'fi'
        ? `Kokemus ${index + 1} -tekstiä parannettu.`
        : `Experience ${index + 1} text improved.`,
    )
  }, [dispatchFormData, formData.experience, locale])

  const handleToggleAtsFriendlyMode = useCallback(() => {
    dispatchUi({ type: UI_ACTION.TOGGLE_ATS_MODE })
  }, [])

  const handleToggleMobilePreview = useCallback(() => {
    dispatchUi({ type: UI_ACTION.TOGGLE_MOBILE_PREVIEW })
  }, [])

  const handleSelectTemplate = useCallback((templateId) => {
    dispatchUi({ type: UI_ACTION.SET_SELECTED_TEMPLATE, templateId })
  }, [])

  const handleLocaleChange = useCallback((nextLocale) => {
    dispatchUi({ type: UI_ACTION.SET_LOCALE, locale: nextLocale === 'fi' ? 'fi' : 'en' })
  }, [])

  const handleNavigate = useCallback((item) => {
    if (item.kind === 'action') {
      if (item.id === 'templates') {
        if (templateSelectRef.current?.showPicker) {
          templateSelectRef.current.showPicker()
        } else {
          templateSelectRef.current?.focus()
        }
      } else if (item.id === 'export') {
        handleExport('pdf-designer')
      }
      return
    }

    const container = editorScrollRef.current
    const target = container?.querySelector(`#${item.anchor}`)

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSectionId(item.id)
    }
  }, [handleExport])

  const handleCycleThemePreference = useCallback(() => {
    const currentIndex = THEME_PREFERENCE_CYCLE.indexOf(themePreference)
    const nextPreference = THEME_PREFERENCE_CYCLE[(currentIndex + 1) % THEME_PREFERENCE_CYCLE.length]

    setThemePreference(nextPreference)
    setThemePreferenceState(nextPreference)
  }, [themePreference])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleToggleFullscreenPreview = useCallback(() => {
    setIsFullscreenPreview((value) => !value)
  }, [])

  const handleToggleResponsivePreview = useCallback(() => {
    setIsResponsivePreview((value) => !value)
  }, [])

  const clampZoomPercent = useCallback((value) => Math.round(Math.min(200, Math.max(40, value))), [])

  const handleSetZoomPercent = useCallback((value) => {
    setZoomPercent(clampZoomPercent(value))
  }, [clampZoomPercent])

  const handleZoomBy = useCallback((delta) => {
    setZoomPercent((value) => clampZoomPercent(value + delta))
  }, [clampZoomPercent])

  const handleFitWidth = useCallback(() => {
    setZoomPercent(100)
  }, [])

  const handleFitPage = useCallback(() => {
    const viewport = previewViewportRef.current
    const content = previewRef.current

    if (!viewport || !content) {
      setZoomPercent(100)
      return
    }

    const currentZoom = zoomPercent / 100
    const naturalHeight = content.offsetHeight / currentZoom
    const availableHeight = viewport.clientHeight - 48

    if (naturalHeight <= 0 || availableHeight <= 0) {
      setZoomPercent(100)
      return
    }

    setZoomPercent(clampZoomPercent((availableHeight / naturalHeight) * 100))
  }, [clampZoomPercent, zoomPercent])

  useEffect(() => {
    const viewport = previewViewportRef.current

    if (!viewport) {
      return undefined
    }

    const handleWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) {
        return
      }

      event.preventDefault()
      setZoomPercent((value) => clampZoomPercent(value - Math.sign(event.deltaY) * 5))
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      viewport.removeEventListener('wheel', handleWheel)
    }
  }, [clampZoomPercent])

  useEffect(() => {
    if (!isFullscreenPreview) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsFullscreenPreview(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreenPreview])

  useEffect(() => {
    const container = editorScrollRef.current

    if (!container) {
      return undefined
    }

    const idToNavId = new Map(ALL_SCROLL_NAV_ITEMS.map((item) => [item.anchor, item.id]))
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visibleEntries.length > 0) {
          const navId = idToNavId.get(visibleEntries[0].target.id)

          if (navId) {
            setActiveSectionId(navId)
          }
        }
      },
      { root: container, rootMargin: '-10% 0px -70% 0px', threshold: [0, 1] },
    )

    ALL_SCROLL_NAV_ITEMS.forEach((item) => {
      const target = container.querySelector(`#${item.anchor}`)

      if (target) {
        observer.observe(target)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!onHeaderChange) return
    onHeaderChange({
      activeExport,
      isActionBusy,
      locale,
      onExport: handleExport,
      onLocaleChange: handleLocaleChange,
      canUndo,
      canRedo,
      onUndo: handleUndo,
      onRedo: handleRedo,
      templates,
      selectedTemplateId: selectedTemplate,
      onSelectTemplate: handleSelectTemplate,
      templateSelectRef,
      searchQuery,
      onSearchChange: setSearchQuery,
      onPrint: handlePrint,
      isFullscreenPreview,
      onToggleFullscreenPreview: handleToggleFullscreenPreview,
      isResponsivePreview,
      onToggleResponsivePreview: handleToggleResponsivePreview,
    })
  }, [
    activeExport, isActionBusy, locale,
    handleExport, handleLocaleChange,
    canUndo, canRedo, handleUndo, handleRedo,
    templates, selectedTemplate, handleSelectTemplate,
    searchQuery, handlePrint,
    isFullscreenPreview, handleToggleFullscreenPreview,
    isResponsivePreview, handleToggleResponsivePreview,
    onHeaderChange,
  ])

  const handlePastedCvTextChange = useCallback((event) => {
    dispatchUi({ type: UI_ACTION.SET_PASTED_CV_TEXT, value: event.target.value })
  }, [])

  const handleJobDescriptionChange = useCallback((value) => {
    dispatchUi({ type: UI_ACTION.SET_JOB_DESCRIPTION, value })
  }, [])

  const handleAddMissingKeyword = useCallback((keyword) => {
    if (formData.skills.some((skill) => skill.toLowerCase() === keyword.toLowerCase())) {
      showToast(
        locale === 'fi'
          ? `"${keyword}" löytyy jo taidoista.`
          : `"${keyword}" is already in your skills.`,
        'info',
      )
      return
    }

    dispatchFormData({ type: FORM_ACTION.ADD_SKILL, skill: keyword })
    showToast(
      locale === 'fi'
        ? `"${keyword}" lisätty taitoihin.`
        : `Added "${keyword}" to skills.`,
    )
  }, [dispatchFormData, formData.skills, locale])

  const handleCopyMissingKeywords = useCallback(async () => {
    if (jobDescriptionAnalysis.missingKeywords.length === 0) {
      return
    }

    try {
      await window.navigator.clipboard.writeText(jobDescriptionAnalysis.missingKeywords.join(', '))
      showToast(
        locale === 'fi'
          ? 'Puuttuvat avainsanat kopioitu.'
          : 'Missing keywords copied.',
      )
    } catch {
      showToast(
        locale === 'fi'
          ? 'Avainsanojen kopiointi epäonnistui.'
          : 'Failed to copy missing keywords.',
        'error',
      )
    }
  }, [jobDescriptionAnalysis.missingKeywords, locale])

  const handleClearJobDescription = useCallback(() => {
    dispatchUi({ type: UI_ACTION.SET_JOB_DESCRIPTION, value: '' })
  }, [])

  const sidebarContent = useMemo(() => (
    <div className="editor-panel p-4 sm:p-6 lg:p-8" ref={editorScrollRef}>
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportFile}
      />
      <div className="stack-5">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={secondaryButtonClassName}
            disabled={isActionBusy}
            onClick={handleLoadDemo}
          >
            {locale === 'fi' ? 'Lataa demo-CV' : 'Load demo CV'}
          </button>
          <button
            type="button"
            className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition lg:hidden ${
              mobilePreviewVisible ? ui.buttonActive : ui.button
            }`}
            onClick={handleToggleMobilePreview}
          >
            {mobilePreviewVisible
              ? locale === 'fi' ? 'Piilota esikatselu' : 'Hide preview'
              : locale === 'fi' ? 'Näytä esikatselu' : 'Show preview'}
          </button>
          <button
            type="button"
            className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.buttonDanger}`}
            disabled={isActionBusy}
            onClick={handleResetForm}
          >
            {locale === 'fi' ? 'Nollaa lomake' : 'Reset form'}
          </button>
          <div
            className={`inline-flex items-center px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] ${ui.surfaceMuted} ${ui.textMuted}`}
          >
            {locale === 'fi' ? 'Automaattitallennus käytössä' : 'Autosave enabled'}
          </div>
        </div>

        <section className={`p-4 sm:p-5 ${ui.surface}`} style={{ border: '1px solid var(--app-border)' }}>
          <p className={`ds-kicker uppercase tracking-[0.14em] ${ui.textMuted}`}>{locale === 'fi' ? 'Pikatuonti' : 'Quick import'}</p>
          <p className={`mt-3 text-sm ${ui.textSecondary}`}>
            {locale === 'fi'
              ? 'Liitä CV-katkelma nimen, tittelin, taitojen ja lyhyen yhteenvedon tunnistamiseksi.'
              : 'Paste a resume snippet to detect a name, title, skills, and a short summary.'}
          </p>
          <textarea
            className={`mt-4 min-h-32 w-full border px-4 py-3 text-sm transition ${ui.input}`}
            value={pastedCvText}
            disabled={isActionBusy}
            onChange={handlePastedCvTextChange}
            placeholder={locale === 'fi'
              ? `Matti Meikäläinen\nSenior Product Designer\nTaidot: Figma, käyttäjätutkimus, design systemit`
              : `Alex Morgan\nSenior Product Designer\nSkills: Figma, User Research, Design Systems`}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`}
              disabled={isActionBusy}
              onClick={handlePasteCvImport}
            >
              {locale === 'fi' ? 'Tuo liitetty teksti' : 'Paste CV text'}
            </button>
            <button
              type="button"
              className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`}
              disabled={isActionBusy}
              onClick={handleImportClick}
            >
              {isImporting
                ? locale === 'fi' ? 'Tuodaan JSON...' : 'Importing JSON...'
                : locale === 'fi' ? 'Tuo JSON' : 'Import JSON'}
            </button>
            <button
              type="button"
              className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`}
              disabled={isActionBusy}
              onClick={handleLoadDemo}
            >
              {locale === 'fi' ? 'Lataa demo-CV' : 'Load demo CV'}
            </button>
          </div>
        </section>

        <section className={`p-4 sm:p-5 ${ui.surface}`} style={{ border: '1px solid var(--app-border)' }}>
          <p className={`ds-kicker uppercase tracking-[0.14em] ${ui.textMuted}`}>{locale === 'fi' ? 'Vientitila' : 'Export mode'}</p>
          <p className={`mt-3 text-sm ${ui.textSecondary}`}>
            {locale === 'fi'
              ? 'ATS-tila yksinkertaistaa muotoilua jäsennystä varten. Jätä se pois päältä täysin tyyliteltyä vientiä varten.'
              : 'ATS mode simplifies formatting for parsers. Leave it off for fully styled template exports.'}
          </p>
          <button
            type="button"
            className={`mt-4 border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${
              atsFriendlyMode ? ui.buttonActive : ui.button
            }`}
            disabled={isActionBusy}
            onClick={handleToggleAtsFriendlyMode}
          >
            {atsFriendlyMode
              ? locale === 'fi' ? 'ATS-tila käytössä' : 'ATS mode enabled'
              : locale === 'fi' ? 'Ota ATS-tila käyttöön' : 'Enable ATS mode'}
          </button>
        </section>

        <ATSScorePanel
          atsScore={atsScore}
          locale={locale}
          atsFriendlyMode={atsFriendlyMode}
          onToggleAtsFriendlyMode={handleToggleAtsFriendlyMode}
          jobDescription={jobDescription}
          onJobDescriptionChange={handleJobDescriptionChange}
          onAddMissingKeyword={handleAddMissingKeyword}
          onCopyMissingKeywords={handleCopyMissingKeywords}
          onClearJobDescription={handleClearJobDescription}
          jobDescriptionAnalysis={jobDescriptionAnalysis}
        />

        <CVSuggestionsPanel
          feedback={feedback}
          locale={locale}
          onImproveAboutText={handleImproveAboutText}
          onImproveExperienceText={handleImproveExperienceText}
        />

        <p className={`ds-kicker lg:hidden ${ui.textMuted}`}>
          {locale === 'fi'
            ? 'Mobiilinäkymässä lomake on esikatselun yläpuolella.'
            : 'Mobile layout stacks the form above the preview.'}
        </p>
      </div>

      <AppErrorBoundary
        panelTitle={locale === 'fi' ? 'CV-lomake' : 'CV form'}
        locale={locale}
      >
        <CVForm
          formData={formData}
          dispatchFormData={dispatchFormData}
          errors={errors}
          feedback={feedback}
          onImproveAboutText={handleImproveAboutText}
          onImproveExperienceText={handleImproveExperienceText}
          onPhotoError={(message) => showToast(message, 'error')}
          selectedTemplate={selectedTemplate}
          selectedTemplateLabel={currentTemplate.label}
          locale={locale}
        />
      </AppErrorBoundary>
    </div>
  ), [
    atsScore,
    atsFriendlyMode,
    currentTemplate.label,
    errors,
    feedback,
    formData,
    handleAddMissingKeyword,
    handleClearJobDescription,
    handleCopyMissingKeywords,
    handleImportClick,
    handleImportFile,
    handleImproveAboutText,
    handleImproveExperienceText,
    handleJobDescriptionChange,
    handleLoadDemo,
    handlePasteCvImport,
    handlePastedCvTextChange,
    handleResetForm,
    handleToggleAtsFriendlyMode,
    handleToggleMobilePreview,
    isActionBusy,
    isImporting,
    jobDescription,
    jobDescriptionAnalysis,
    locale,
    mobilePreviewVisible,
    pastedCvText,
    secondaryButtonClassName,
    selectedTemplate,
    dispatchFormData,
    ui.button,
    ui.buttonActive,
    ui.buttonDanger,
    ui.input,
    ui.surface,
    ui.surfaceMuted,
    ui.textMuted,
    ui.textSecondary,
  ])

  const filteredNavSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return NAV_SECTIONS
    }

    return NAV_SECTIONS.filter((item) => (item.label[locale] ?? item.label.en).toLowerCase().includes(query))
  }, [searchQuery, locale])

  const filteredNavUtilityItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return NAV_UTILITY_ITEMS
    }

    return NAV_UTILITY_ITEMS.filter((item) => (item.label[locale] ?? item.label.en).toLowerCase().includes(query))
  }, [searchQuery, locale])

  const navRailContent = useMemo(() => (
    <NavRail
      sections={filteredNavSections}
      utilityItems={filteredNavUtilityItems}
      activeSectionId={activeSectionId}
      onNavigate={handleNavigate}
      locale={locale}
      themePreference={themePreference}
      onCycleThemePreference={handleCycleThemePreference}
      version="0.2"
    />
  ), [
    filteredNavSections,
    filteredNavUtilityItems,
    activeSectionId,
    handleNavigate,
    locale,
    themePreference,
    handleCycleThemePreference,
  ])

  const previewContent = useMemo(() => (
    <div
      ref={previewViewportRef}
      className={`preview-panel pb-28 sm:pb-6 print:p-0${isFullscreenPreview ? ' preview-panel--fullscreen' : ''}${isResponsivePreview ? ' preview-panel--responsive' : ''}`}
    >
      <div className="preview-scroll px-4 pb-6 pt-4 sm:px-6 lg:px-8 print:px-0">
        <div className="mb-4 lg:hidden print:hidden">
          <div className={`p-4 ${ui.surface}`} style={{ border: '1px solid var(--app-border)' }}>
            <p className={`ds-kicker uppercase tracking-[0.14em] ${ui.textMuted}`}>{locale === 'fi' ? 'Esikatselupaneeli' : 'Preview panel'}</p>
            <h2 className={`ds-section-title mt-2 font-bold uppercase tracking-[-0.02em] ${ui.textPrimary}`}>
              {locale === 'fi' ? 'CV-esikatselu' : 'Resume document view'}
            </h2>
            <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
              {locale === 'fi'
                ? 'Voit palata editoriin milloin tahansa tai pitää tämän näkymän auki viimeistelyn aikana.'
                : 'Switch back to the editor any time or keep this view open while you polish the layout.'}
            </p>
          </div>
        </div>

        <div className="preview-zoom-bar print:hidden">
          <div className="preview-zoom-bar__group">
            <button
              type="button"
              className="preview-zoom-bar__button"
              onClick={handleFitWidth}
              aria-label={locale === 'fi' ? 'Sovita leveyteen' : 'Fit width'}
              title={locale === 'fi' ? 'Sovita leveyteen' : 'Fit width'}
            >
              <StretchHorizontal size={13} strokeWidth={2} aria-hidden="true" style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: '-2px' }} />
              {locale === 'fi' ? 'Leveys' : 'Fit Width'}
            </button>
            <button
              type="button"
              className="preview-zoom-bar__button"
              onClick={handleFitPage}
              aria-label={locale === 'fi' ? 'Sovita sivuun' : 'Fit page'}
              title={locale === 'fi' ? 'Sovita sivuun' : 'Fit page'}
            >
              <StretchVertical size={13} strokeWidth={2} aria-hidden="true" style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: '-2px' }} />
              {locale === 'fi' ? 'Sivu' : 'Fit Page'}
            </button>
          </div>

          <div className="preview-zoom-bar__divider" />

          <div className="preview-zoom-bar__group">
            {[100, 125, 150, 200].map((preset) => (
              <button
                key={preset}
                type="button"
                className={`preview-zoom-bar__button${zoomPercent === preset ? ' preview-zoom-bar__button--active' : ''}`}
                onClick={() => handleSetZoomPercent(preset)}
                aria-pressed={zoomPercent === preset}
              >
                {preset}%
              </button>
            ))}
          </div>

          <div className="preview-zoom-bar__spacer" />

          <div className="preview-zoom-bar__group">
            <button
              type="button"
              className="preview-zoom-bar__button"
              onClick={() => handleZoomBy(-10)}
              aria-label={locale === 'fi' ? 'Loitonna' : 'Zoom out'}
            >
              <Minus size={13} strokeWidth={2.5} aria-hidden="true" />
            </button>
            <span className="preview-zoom-bar__value">{Math.round(zoomPercent)}%</span>
            <button
              type="button"
              className="preview-zoom-bar__button"
              onClick={() => handleZoomBy(10)}
              aria-label={locale === 'fi' ? 'Lähennä' : 'Zoom in'}
            >
              <Plus size={13} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </div>

        {isFullscreenPreview ? (
          <button
            type="button"
            className="preview-zoom-bar__button print:hidden"
            style={{
              position: 'fixed', top: '1rem', right: '1rem', zIndex: 61,
              border: '1px solid var(--app-border)', borderRadius: 'var(--radius-sm)',
              background: 'var(--app-surface)', boxShadow: 'var(--shadow-md)',
            }}
            onClick={handleToggleFullscreenPreview}
            aria-label={locale === 'fi' ? 'Poistu koko näytöstä' : 'Exit fullscreen'}
          >
            <X size={14} strokeWidth={2} aria-hidden="true" style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: '-2px' }} />
            {locale === 'fi' ? 'Poistu' : 'Exit fullscreen'}
          </button>
        ) : null}

        <div className="preview-stage">
          <button
            type="button"
            className={`preview-mobile-toggle border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition lg:hidden ${
              ui.button
            }`}
            onClick={handleToggleMobilePreview}
          >
            {locale === 'fi' ? 'Takaisin editoriin' : 'Back to editor'}
          </button>
          <div className="preview-zoom-wrapper" style={{ '--preview-zoom': zoomPercent / 100 }}>
            <AppErrorBoundary
              panelTitle={locale === 'fi' ? 'CV-esikatselu' : 'CV preview'}
              locale={locale}
            >
              <CVPreview
                formData={formData}
                previewRef={previewRef}
                template={selectedTemplate}
                locale={locale}
                atsFriendlyMode={atsFriendlyMode}
              />
            </AppErrorBoundary>
          </div>
        </div>

      </div>
    </div>
  ), [
    atsFriendlyMode,
    formData,
    handleFitPage,
    handleFitWidth,
    handleSetZoomPercent,
    handleToggleFullscreenPreview,
    handleToggleMobilePreview,
    handleZoomBy,
    isFullscreenPreview,
    isResponsivePreview,
    locale,
    selectedTemplate,
    zoomPercent,
    ui.button,
    ui.surface,
    ui.textMuted,
    ui.textPrimary,
    ui.textSecondary,
  ])

  const mobileBottomActions = useMemo(() => (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t px-3 py-3 backdrop-blur md:px-4 lg:hidden print:hidden ${ui.surfaceStrong}`}
    >
      <div className="mx-auto flex max-w-[110rem] items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          className={`${compactButtonClassName} border-black bg-gray-100 text-black`}
          disabled={isActionBusy}
          onClick={() => handleExport('pdf-designer')}
        >
          {activeExport === 'pdf-designer' ? 'PDF...' : locale === 'fi' ? 'Vie PDF' : 'PDF'}
        </button>
        <button
          type="button"
          className={compactButtonClassName}
          disabled={isActionBusy}
          onClick={() => handleExport('html')}
        >
          {activeExport === 'html' ? 'HTML...' : 'HTML'}
        </button>
        <button
          type="button"
          className={compactButtonClassName}
          disabled={isActionBusy}
          onClick={() => handleExport('json')}
        >
          {activeExport === 'json' ? 'JSON...' : 'JSON'}
        </button>
        <button
          type="button"
          className={compactButtonClassName}
          disabled={isActionBusy}
          onClick={handleCopyShareLink}
        >
          {locale === 'fi' ? 'Linkki' : 'Link'}
        </button>
        <button
          type="button"
          className={`shrink-0 border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${
            mobilePreviewVisible ? ui.buttonActive : ui.button
          }`}
          onClick={handleToggleMobilePreview}
        >
          {mobilePreviewVisible
            ? locale === 'fi' ? 'Editori' : 'Editor'
            : locale === 'fi' ? 'Esikatselu' : 'Preview'}
        </button>
      </div>
    </div>
  ), [
    activeExport,
    compactButtonClassName,
    handleCopyShareLink,
    handleExport,
    handleToggleMobilePreview,
    isActionBusy,
    locale,
    mobilePreviewVisible,
    ui.button,
    ui.buttonActive,
    ui.surfaceStrong,
  ])

  return (
    <>
      <AppShell
        shellStyle={shellStyle}
        showContentOnMobile={mobilePreviewVisible}
        nav={navRailContent}
        sidebar={sidebarContent}
        content={previewContent}
      />

      {mobileBottomActions}

      <ToastStack toasts={toasts} />
    </>
  )
}

export default ResumeBuilderPage
