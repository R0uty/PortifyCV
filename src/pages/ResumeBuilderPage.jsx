import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'

import AppShell from '../components/AppShell'
import AppErrorBoundary from '../components/AppErrorBoundary'
import CVForm from '../components/CVForm'
import CVPreview from '../components/CVPreview'
import ProjectHeader from '../components/ProjectHeader'
import ToastStack from '../components/ToastStack'
import {
  defaultAccentId,
  getAccentOption,
  getAccentThemeStyles,
  getUiTheme,
  UI_ACCENT_STORAGE_KEY,
  UI_THEME_STORAGE_KEY,
} from '../utils/designSystem'
import {
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
  evaluateCvFeedback,
  improveAboutText,
  improveExperienceText,
} from '../utils/cvFeedback'

const TemplateGallery = lazy(() => import('../components/TemplateGallery'))
const UI_LOCALE_STORAGE_KEY = 'ui-locale'

function createToast(message, type = 'success') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    type,
  }
}

function SurfaceFallback({ theme = 'dark', title = 'Loading panel...' }) {
  const ui = useMemo(() => getUiTheme(theme), [theme])

  return (
    <section
      className={`fade-in-soft surface-shadow rounded-[var(--radius-card)] border p-5 sm:p-6 ${ui.surface}`}
      aria-hidden="true"
    >
      <p className={`ds-kicker ${ui.textMuted}`}>{title}</p>
      <div className={`mt-4 h-3 w-2/3 rounded-full ${ui.surfaceMuted}`} />
      <div className={`mt-3 h-3 w-full rounded-full ${ui.surfaceMuted}`} />
      <div className={`mt-3 h-3 w-5/6 rounded-full ${ui.surfaceMuted}`} />
    </section>
  )
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
      theme: 'dark',
      accent: defaultAccentId,
      initialToast: null,
      clearShareParam: false,
      storageIssue: false,
    }
  }

  try {
    const storedDraftState = safeStorageGet(CV_DRAFT_STORAGE_KEY)
    const onboardingState = safeStorageGet(CV_ONBOARDING_SEEN_STORAGE_KEY, 'false')
    const storedThemeState = safeStorageGet(UI_THEME_STORAGE_KEY)
    const storedAccentState = safeStorageGet(UI_ACCENT_STORAGE_KEY)
    const storedDraft = storedDraftState.value
    const hasSeenOnboarding = onboardingState.value === 'true'
    const storedTheme = storedThemeState.value
    const storedAccent = storedAccentState.value
    const hasStorageIssue =
      !storedDraftState.ok ||
      !onboardingState.ok ||
      !storedThemeState.ok ||
      !storedAccentState.ok
    const nextTheme = storedTheme === 'light' ? 'light' : 'dark'
    const nextAccent = getAccentOption(storedAccent).id
    const markOnboardingSeen = () => {
      safeStorageSet(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
    }

    try {
      const sharedFormData = readCvStateFromLocation()

      if (sharedFormData) {
        markOnboardingSeen()
        return {
          formData: sharedFormData,
          theme: nextTheme,
          accent: nextAccent,
          initialToast: createToast('Loaded CV from share link.', 'success'),
          clearShareParam: false,
          storageIssue: hasStorageIssue,
        }
      }
    } catch (error) {
      const fallbackFormData = storedDraft
        ? parseImportedCvData(JSON.parse(storedDraft))
        : createInitialCvData()

      markOnboardingSeen()

      return {
        formData: fallbackFormData,
        theme: nextTheme,
        accent: nextAccent,
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
          theme: nextTheme,
          accent: nextAccent,
          initialToast: createToast('Loaded a sample CV to help you get started.', 'success'),
          clearShareParam: false,
          storageIssue: hasStorageIssue,
        }
      }

      return {
        formData: initialCvData,
        theme: nextTheme,
        accent: nextAccent,
        initialToast: null,
        clearShareParam: false,
        storageIssue: hasStorageIssue,
      }
    }

    markOnboardingSeen()

    return {
      formData: parseImportedCvData(JSON.parse(storedDraft)),
      theme: nextTheme,
      accent: nextAccent,
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
    }

    const storedThemeState = safeStorageGet(UI_THEME_STORAGE_KEY)
    const storedAccentState = safeStorageGet(UI_ACCENT_STORAGE_KEY)

    return {
      formData: createInitialCvData(),
      theme: storedThemeState.value === 'light' ? 'light' : 'dark',
      accent: getAccentOption(storedAccentState.value).id,
      initialToast: createToast(message, 'error'),
      clearShareParam: shouldClearShareParam,
      storageIssue: !storedThemeState.ok || !storedAccentState.ok,
    }
  }
}

function ResumeBuilderPage() {
  const initialSession = useMemo(() => loadInitialCvSession(), [])
  const [formData, dispatchFormData] = useReducer(cvFormReducer, initialSession.formData)
  const [theme] = useState('light')
  const [accent] = useState(initialSession.accent)
  const [uiState, dispatchUi] = useReducer(
    uiReducer,
    initialSession,
    createInitialUiState,
  )
  const {
    selectedTemplate,
    atsFriendlyMode,
    locale,
    mobilePreviewVisible,
    activeExport,
    isImporting,
    pastedCvText,
    toasts,
  } = uiState
  const ui = getUiTheme(theme)
  const previewRef = useRef(null)
  const importInputRef = useRef(null)
  const toastTimeoutsRef = useRef(new Map())
  const storageWarningShownRef = useRef(false)

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
  const shellStyle = useMemo(() => getAccentThemeStyles(theme, accent), [theme, accent])
  const feedback = useMemo(() => evaluateCvFeedback(formData, { locale }), [formData, locale])
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
      setStorageValue(CV_DRAFT_STORAGE_KEY, JSON.stringify(formData))
    }, 180)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [formData, setStorageValue])

  useEffect(() => {
    setStorageValue(UI_ACCENT_STORAGE_KEY, accent)
  }, [accent, setStorageValue])

  useEffect(() => {
    setStorageValue(UI_LOCALE_STORAGE_KEY, locale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale, setStorageValue])

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

  const secondaryButtonClassName = `rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`
  const compactButtonClassName = `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`

  const handleExport = useCallback(async (type) => {
    dispatchUi({ type: UI_ACTION.SET_ACTIVE_EXPORT, value: type })

    const toastLabel =
      type === 'pdf-designer'
        ? locale === 'fi' ? 'Valmistellaan PDF-vientiä...' : 'Preparing PDF export...'
        : type === 'html'
          ? locale === 'fi' ? 'Valmistellaan HTML-vientiä...' : 'Preparing HTML export...'
          : locale === 'fi' ? 'Valmistellaan JSON-vientiä...' : 'Preparing JSON export...'

    showToast(toastLabel)

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
          theme,
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

      const exportLabel =
        type === 'pdf-designer'
          ? atsFriendlyMode
            ? 'ATS PDF'
            : 'Designer PDF'
          : type === 'html'
            ? 'HTML'
            : 'JSON'

      showToast(
        locale === 'fi'
          ? `${exportLabel} on ladattu.`
          : `${exportLabel} export downloaded.`,
      )
    } catch (error) {
      const exportLabel =
        type === 'pdf-designer'
          ? atsFriendlyMode
            ? 'ATS PDF'
            : 'Designer PDF'
          : type === 'html'
            ? 'HTML'
            : 'JSON'

      showToast(
        error instanceof Error
          ? error.message
          : locale === 'fi'
            ? `${exportLabel}-vienti epäonnistui.`
            : `Failed to export ${exportLabel}.`,
        'error',
      )
    } finally {
      dispatchUi({ type: UI_ACTION.SET_ACTIVE_EXPORT, value: '' })
    }
  }, [atsFriendlyMode, exportFileName, formData, locale, previewRef, selectedTemplate, theme])

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
      showToast(locale === 'fi' ? `Tuodaan ${file.name}...` : `Importing ${file.name}...`)
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
  }, [locale, setStorageValue])

  const handleResetForm = useCallback(() => {
    dispatchFormData({ type: FORM_ACTION.RESET_FORM })
    removeStorageValue(CV_DRAFT_STORAGE_KEY)
    showToast(locale === 'fi' ? 'Lomake nollattu tyhjäksi CV:ksi.' : 'Form reset to a blank CV.')
  }, [locale, removeStorageValue])

  const handleLoadDemo = useCallback(() => {
    dispatchFormData({ type: FORM_ACTION.SET_FORM_DATA, formData: structuredClone(demoCvData) })
    setStorageValue(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
    showToast(locale === 'fi' ? 'Demo-CV ladattu.' : 'Demo CV loaded.')
  }, [locale, setStorageValue])

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
  }, [locale, pastedCvText, setStorageValue])

  const handleCopyShareLink = useCallback(async () => {
    try {
      const shareUrl = buildShareUrl(formData)

      await window.navigator.clipboard.writeText(shareUrl)
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
  }, [formData, locale])

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
  }, [formData.experience, locale])

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

  const handlePastedCvTextChange = useCallback((event) => {
    dispatchUi({ type: UI_ACTION.SET_PASTED_CV_TEXT, value: event.target.value })
  }, [])

  const sidebarContent = useMemo(() => (
    <div className="editor-panel p-4 sm:p-6 lg:p-8">
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
            className={`rounded-full border px-4 py-2 text-sm font-medium transition lg:hidden ${
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
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${ui.buttonDanger}`}
            disabled={isActionBusy}
            onClick={handleResetForm}
          >
            {locale === 'fi' ? 'Nollaa lomake' : 'Reset form'}
          </button>
          <div
            className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-medium ${ui.surfaceMuted} ${ui.textMuted}`}
          >
            {locale === 'fi' ? 'Automaattitallennus käytössä' : 'Autosave enabled'}
          </div>
        </div>

        <section className={`surface-shadow rounded-[var(--radius-card)] border p-4 sm:p-5 ${ui.surface}`}>
          <p className={`ds-kicker ${ui.textMuted}`}>{locale === 'fi' ? 'Pikatuonti' : 'Quick import'}</p>
          <p className={`mt-3 text-sm ${ui.textSecondary}`}>
            {locale === 'fi'
              ? 'Liitä CV-katkelma nimen, tittelin, taitojen ja lyhyen yhteenvedon tunnistamiseksi.'
              : 'Paste a resume snippet to detect a name, title, skills, and a short summary.'}
          </p>
          <textarea
            className={`mt-4 min-h-32 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-ring)] ${ui.input}`}
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
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`}
              disabled={isActionBusy}
              onClick={handlePasteCvImport}
            >
              {locale === 'fi' ? 'Tuo liitetty teksti' : 'Paste CV text'}
            </button>
            <button
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`}
              disabled={isActionBusy}
              onClick={handleImportClick}
            >
              {isImporting
                ? locale === 'fi' ? 'Tuodaan JSON...' : 'Importing JSON...'
                : locale === 'fi' ? 'Tuo JSON' : 'Import JSON'}
            </button>
            <button
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`}
              disabled={isActionBusy}
              onClick={handleLoadDemo}
            >
              {locale === 'fi' ? 'Lataa demo-CV' : 'Load demo CV'}
            </button>
          </div>
        </section>

        <section className={`surface-shadow rounded-[var(--radius-card)] border p-4 sm:p-5 ${ui.surface}`}>
          <p className={`ds-kicker ${ui.textMuted}`}>{locale === 'fi' ? 'Vientitila' : 'Export mode'}</p>
          <p className={`mt-3 text-sm ${ui.textSecondary}`}>
            {locale === 'fi'
              ? 'ATS-tila yksinkertaistaa muotoilua jäsennystä varten. Jätä se pois päältä täysin tyyliteltyä vientiä varten.'
              : 'ATS mode simplifies formatting for parsers. Leave it off for fully styled template exports.'}
          </p>
          <button
            type="button"
            className={`mt-4 rounded-full border px-4 py-2 text-sm font-medium transition ${
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

        <AppErrorBoundary
          theme={theme}
          panelTitle={locale === 'fi' ? 'Pohjagalleria' : 'Template gallery'}
          locale={locale}
        >
          <Suspense fallback={<SurfaceFallback theme={theme} title={locale === 'fi' ? 'Ladataan pohjia' : 'Loading templates'} />}>
            <TemplateGallery
              templates={templates}
              selectedTemplateId={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
              theme={theme}
              locale={locale}
            />
          </Suspense>
        </AppErrorBoundary>

        <p className={`ds-kicker lg:hidden ${ui.textMuted}`}>
          {locale === 'fi'
            ? 'Mobiilinäkymässä lomake on esikatselun yläpuolella.'
            : 'Mobile layout stacks the form above the preview.'}
        </p>
      </div>

      <AppErrorBoundary
        theme={theme}
        panelTitle={locale === 'fi' ? 'CV-lomake' : 'CV form'}
        locale={locale}
      >
        <CVForm
          formData={formData}
          dispatchFormData={dispatchFormData}
          errors={errors}
          theme={theme}
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
    atsFriendlyMode,
    currentTemplate.label,
    errors,
    feedback,
    formData,
    handleImportClick,
    handleImportFile,
    handleImproveAboutText,
    handleImproveExperienceText,
    handleLoadDemo,
    handlePasteCvImport,
    handlePastedCvTextChange,
    handleResetForm,
    handleSelectTemplate,
    handleToggleAtsFriendlyMode,
    handleToggleMobilePreview,
    isActionBusy,
    isImporting,
    locale,
    mobilePreviewVisible,
    pastedCvText,
    secondaryButtonClassName,
    selectedTemplate,
    dispatchFormData,
    templates,
    theme,
    ui.button,
    ui.buttonActive,
    ui.buttonDanger,
    ui.input,
    ui.surface,
    ui.surfaceMuted,
    ui.textMuted,
    ui.textSecondary,
  ])

  const previewContent = useMemo(() => (
    <div className="preview-panel pb-28 sm:pb-6 print:p-0">
      <div className="preview-scroll px-3 pb-6 pt-4 sm:px-5 lg:px-6 print:px-0">
        <div className="mb-4 lg:hidden print:hidden">
          <div className={`surface-shadow rounded-[var(--radius-card)] border p-4 ${ui.surface}`}>
            <p className={`ds-kicker ${ui.textMuted}`}>{locale === 'fi' ? 'Esikatselupaneeli' : 'Preview panel'}</p>
            <h2 className={`ds-section-title mt-2 font-semibold ${ui.textPrimary}`}>
              {locale === 'fi' ? 'CV-esikatselu' : 'Resume document view'}
            </h2>
            <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
              {locale === 'fi'
                ? 'Voit palata editoriin milloin tahansa tai pitää tämän näkymän auki viimeistelyn aikana.'
                : 'Switch back to the editor any time or keep this view open while you polish the layout.'}
            </p>
          </div>
        </div>

        <div className="preview-stage">
          <button
            type="button"
            className={`preview-mobile-toggle rounded-full border px-4 py-2 text-sm font-medium transition lg:hidden ${
              ui.button
            }`}
            onClick={handleToggleMobilePreview}
          >
            {locale === 'fi' ? 'Takaisin editoriin' : 'Back to editor'}
          </button>
          <AppErrorBoundary
            theme={theme}
            panelTitle={locale === 'fi' ? 'CV-esikatselu' : 'CV preview'}
            locale={locale}
          >
            <CVPreview
              formData={formData}
              theme={theme}
              previewRef={previewRef}
              template={selectedTemplate}
              locale={locale}
              atsFriendlyMode={atsFriendlyMode}
            />
          </AppErrorBoundary>
        </div>

      </div>
    </div>
  ), [
    atsFriendlyMode,
    formData,
    handleToggleMobilePreview,
    locale,
    selectedTemplate,
    theme,
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
          className={`${compactButtonClassName} accent-border accent-surface accent-text-strong`}
          onClick={() => handleExport('pdf-designer')}
        >
          {activeExport === 'pdf-designer' ? 'PDF...' : locale === 'fi' ? 'Vie PDF' : 'PDF'}
        </button>
        <button
          type="button"
          className={compactButtonClassName}
          onClick={handleCopyShareLink}
        >
          {locale === 'fi' ? 'Linkki' : 'Link'}
        </button>
        <button
          type="button"
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
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
    locale,
    mobilePreviewVisible,
    ui.button,
    ui.buttonActive,
    ui.surfaceStrong,
  ])

  return (
    <>
      <ProjectHeader
        theme={theme}
        activeExport={activeExport}
        isActionBusy={isActionBusy}
        locale={locale}
        onLocaleChange={handleLocaleChange}
        onExport={handleExport}
      />
      <AppShell
        theme={theme}
        shellStyle={shellStyle}
        showContentOnMobile={mobilePreviewVisible}
        sidebar={sidebarContent}
        content={previewContent}
      />

      {mobileBottomActions}

      <ToastStack toasts={toasts} theme={theme} />
    </>
  )
}

export default ResumeBuilderPage
