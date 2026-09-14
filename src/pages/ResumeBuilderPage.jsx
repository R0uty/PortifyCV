import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  Award,
  Briefcase,
  BookOpen,
  Building2,
  FileSearch,
  FileText,
  FolderKanban,
  GitBranch,
  GraduationCap,
  HandHeart,
  Heart,
  IdCard,
  Languages as LanguagesIcon,
  Link2,
  Mail,
  Mic,
  Minus,
  Plus,
  Quote,
  Settings as SettingsIcon,
  Sparkles,
  StretchHorizontal,
  StretchVertical,
  Target,
  Trophy,
  User,
  Users,
  X,
  LayoutTemplate,
} from 'lucide-react'

import AppShell from '../components/AppShell'
import AppErrorBoundary from '../components/AppErrorBoundary'
import ATSScorePanel from '../components/ATSScorePanel'
import BadgeModal from '../components/BadgeModal'
import CoverLetterModal from '../components/CoverLetterModal'
import CVForm from '../components/CVForm'
import CVPreview from '../components/CVPreview'
import CVSuggestionsPanel from '../components/CVSuggestionsPanel'
import DirectEditPreview from '../components/DirectEditPreview'
import NavRail from '../components/NavRail'
import SettingsModal from '../components/SettingsModal'
import TemplateGalleryModal from '../components/TemplateGalleryModal'
import ToastStack from '../components/ToastStack'
import {
  getUiTheme,
  UI_BUILDER_MODE_STORAGE_KEY,
  UI_LOCALE_STORAGE_KEY,
  UI_NAV_RAIL_COLLAPSED_STORAGE_KEY,
} from '../utils/designSystem'
import {
  CV_ONBOARDING_SEEN_STORAGE_KEY,
  CV_SESSION_RESTORE_ENABLED_STORAGE_KEY,
  CV_SESSION_SNAPSHOT_STORAGE_KEY,
  createInitialCvData,
  demoCvData,
  initialCvData,
  parsePastedCvText,
  parseImportedCvData,
  safeSessionStorageGet,
  safeSessionStorageRemove,
  safeSessionStorageSet,
  safeStorageGet,
  safeStorageSet,
} from '../utils/cvForm'
import {
  getCvTemplates,
  getCvTemplate,
  resolveTemplateAccent,
} from '../utils/cvTemplates'
import { prefetchTemplateShowcases } from '../components/templates'
import { getCvFontStack, loadCvFont } from '../utils/cvFonts'
import { APP_VERSION_RAW } from '../utils/appVersion'
import { cvFormReducer, FORM_ACTION } from '../reducers/cvFormReducer'
import { uiReducer, createInitialUiState, UI_ACTION } from '../reducers/uiReducer'
import {
  createExportFileName,
} from '../utils/cvSnapshot'
import {
  buildShareUrl,
  readCvStateFromLocation,
  removeShareDataParamFromCurrentUrl,
  shareLinkOmitsImages,
} from '../utils/shareLinks'
import {
  analyzeJobDescription,
  evaluateAtsScore,
} from '../utils/atsScore'
import { evaluateCvFeedback } from '../utils/cvFeedback'
import { generateCoverLetterDraft } from '../utils/coverLetter'

const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024
const HISTORY_COMMIT_DELAY_MS = 600
const RESET_CONFIRM_WINDOW_MS = 4000

// Order must match the section cards' actual JSX order in CVForm.jsx (personal,
// summary, skills, experience, education, coreStrengths, certificates,
// projects, languages, interests, achievements, openSource, publications,
// links, leadership, memberships, speaking, volunteering, internships,
// caseStudies, testimonials) — this list is a separate hardcoded array, not
// derived from that layout, so it drifts silently if one changes without the
// other.
// sectionKey maps each nav item to the CV_SECTION_ORDER_KEYS entry that
// gates whether CVForm actually renders that section for the selected
// template — null means always rendered (not template-gated). Keep this in
// sync with the section-key checks CVForm.jsx wraps each PanelSection in.
// Every template-gated section CVForm can render needs an entry here — a
// section with no nav item (as achievements/openSource/publications/etc once
// had) is reachable only by scrolling past everything else with no shortcut
// and no search hit, on templates where it's a primary section.
const NAV_SECTIONS = [
  { id: 'personal', anchor: 'section-personal', icon: User, kind: 'scroll', sectionKey: null, label: { en: 'Personal Information', fi: 'Henkilötiedot' } },
  { id: 'summary', anchor: 'section-summary', icon: FileText, kind: 'scroll', sectionKey: 'about', label: { en: 'Summary', fi: 'Yhteenveto' } },
  { id: 'skills', anchor: 'section-skills', icon: Sparkles, kind: 'scroll', sectionKey: 'skills', label: { en: 'Skills', fi: 'Taidot' } },
  { id: 'experience', anchor: 'section-experience', icon: Briefcase, kind: 'scroll', sectionKey: 'experience', label: { en: 'Experience', fi: 'Kokemus' } },
  { id: 'education', anchor: 'section-education', icon: GraduationCap, kind: 'scroll', sectionKey: 'education', label: { en: 'Education', fi: 'Koulutus' } },
  { id: 'coreStrengths', anchor: 'section-coreStrengths', icon: Target, kind: 'scroll', sectionKey: 'coreStrengths', label: { en: 'Core Strengths', fi: 'Vahvuudet' } },
  { id: 'certificates', anchor: 'section-certificates', icon: Award, kind: 'scroll', sectionKey: 'certificates', label: { en: 'Certificates', fi: 'Sertifikaatit' } },
  { id: 'projects', anchor: 'section-projects', icon: FolderKanban, kind: 'scroll', sectionKey: 'projects', label: { en: 'Projects', fi: 'Projektit' } },
  { id: 'languages', anchor: 'section-languages', icon: LanguagesIcon, kind: 'scroll', sectionKey: 'languages', label: { en: 'Languages', fi: 'Kielet' } },
  { id: 'interests', anchor: 'section-interests', icon: Heart, kind: 'scroll', sectionKey: 'interests', label: { en: 'Interests', fi: 'Kiinnostuksen kohteet' } },
  { id: 'achievements', anchor: 'section-achievements', icon: Trophy, kind: 'scroll', sectionKey: 'achievements', label: { en: 'Achievements', fi: 'Saavutukset' } },
  { id: 'openSource', anchor: 'section-openSource', icon: GitBranch, kind: 'scroll', sectionKey: 'openSource', label: { en: 'Open Source', fi: 'Avoin lähdekoodi' } },
  { id: 'publications', anchor: 'section-publications', icon: BookOpen, kind: 'scroll', sectionKey: 'publications', label: { en: 'Publications', fi: 'Julkaisut' } },
  { id: 'links', anchor: 'section-links', icon: Link2, kind: 'scroll', sectionKey: 'links', label: { en: 'Links', fi: 'Linkit' } },
  { id: 'leadership', anchor: 'section-leadership', icon: Users, kind: 'scroll', sectionKey: 'leadership', label: { en: 'Leadership', fi: 'Johtaminen' } },
  { id: 'memberships', anchor: 'section-memberships', icon: IdCard, kind: 'scroll', sectionKey: 'memberships', label: { en: 'Memberships', fi: 'Jäsenyydet' } },
  { id: 'speaking', anchor: 'section-speaking', icon: Mic, kind: 'scroll', sectionKey: 'speaking', label: { en: 'Speaking', fi: 'Esiintymiset' } },
  { id: 'volunteering', anchor: 'section-volunteering', icon: HandHeart, kind: 'scroll', sectionKey: 'volunteering', label: { en: 'Volunteering', fi: 'Vapaaehtoistyö' } },
  { id: 'internships', anchor: 'section-internships', icon: Building2, kind: 'scroll', sectionKey: 'internships', label: { en: 'Internships', fi: 'Harjoittelut' } },
  { id: 'caseStudies', anchor: 'section-caseStudies', icon: FileSearch, kind: 'scroll', sectionKey: 'caseStudies', label: { en: 'Case Studies', fi: 'Tapaustutkimukset' } },
  { id: 'testimonials', anchor: 'section-testimonials', icon: Quote, kind: 'scroll', sectionKey: 'testimonials', label: { en: 'Testimonials', fi: 'Suositukset' } },
]

// Export deliberately has no entry here: the toolbar's Export control offers
// PDF/HTML/JSON via a menu, and a rail shortcut previously bypassed that
// choice and always triggered PDF-only, which looked like a second, buggier
// export button next to the real one instead of a shortcut to it.
const NAV_UTILITY_ITEMS = [
  { id: 'settings', icon: SettingsIcon, kind: 'action', label: { en: 'Settings', fi: 'Asetukset' } },
  { id: 'templates', icon: LayoutTemplate, kind: 'action', label: { en: 'Templates', fi: 'Pohjat' } },
  { id: 'coverLetter', icon: Mail, kind: 'action', label: { en: 'Cover letter', fi: 'Hakemuskirje' } },
]

const ALL_SCROLL_NAV_ITEMS = [...NAV_SECTIONS, ...NAV_UTILITY_ITEMS].filter((item) => item.kind === 'scroll')

function createToast(message, type = 'success') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    type,
  }
}

function getScrollBehavior() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'smooth'
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

// Scroll the editor panel itself rather than using scrollIntoView, which walks
// every scrollable ancestor and drags the whole page along with it.
function scrollSectionIntoView(container, target) {
  const top = Math.max(
    0,
    target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop,
  )
  const behavior = getScrollBehavior()
  const startTop = container.scrollTop

  container.scrollTo({ top, behavior })

  if (behavior !== 'smooth' || Math.round(top) === Math.round(startTop)) {
    return
  }

  // Some browser configurations accept a smooth scroll and then never animate
  // it, which would leave every nav-rail entry dead. A real smooth scroll has
  // always moved well before this point, so a position that has not budged
  // means the animation is never coming — jump there instead.
  window.setTimeout(() => {
    if (container.scrollTop === startTop) {
      container.scrollTo({ top, behavior: 'auto' })
    }
  }, 100)
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

  const onboardingState = safeStorageGet(CV_ONBOARDING_SEEN_STORAGE_KEY, 'false')
  const hasSeenOnboarding = onboardingState.value === 'true'
  const hasStorageIssue = !onboardingState.ok
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
    markOnboardingSeen()

    return {
      formData: createInitialCvData(),
      initialToast: createToast(
        error instanceof Error ? error.message : 'Shared CV link could not be loaded.',
        'error',
      ),
      clearShareParam: true,
      storageIssue: hasStorageIssue,
    }
  }

  markOnboardingSeen()

  const sessionRestoreEnabled = safeStorageGet(CV_SESSION_RESTORE_ENABLED_STORAGE_KEY, 'false').value === 'true'

  if (sessionRestoreEnabled) {
    const snapshotState = safeSessionStorageGet(CV_SESSION_SNAPSHOT_STORAGE_KEY)

    if (snapshotState.value) {
      try {
        const restoredFormData = parseImportedCvData(JSON.parse(snapshotState.value))

        return {
          formData: restoredFormData,
          initialToast: createToast('Restored your last session.', 'success'),
          clearShareParam: false,
          storageIssue: hasStorageIssue,
        }
      } catch {
        // Snapshot is corrupted or from an incompatible app version — fall
        // through to the normal demo/blank behavior below rather than
        // surface a scary error for a background convenience feature.
        safeSessionStorageRemove(CV_SESSION_SNAPSHOT_STORAGE_KEY)
      }
    }
  }

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
    coverLetterCompany,
    coverLetterRole,
    coverLetterHiringManager,
    coverLetterBody,
    sessionRestoreEnabled,
    templateAccentColors,
    cvFontId,
    cvHeadingColor,
    classicNameAlignment,
    navRailCollapsed,
    builderMode,
    toasts,
  } = uiState
  const ui = getUiTheme()
  const previewRef = useRef(null)
  const importInputRef = useRef(null)
  const toastTimeoutsRef = useRef(new Map())
  const storageWarningShownRef = useRef(false)
  const sessionRestoreWarningShownRef = useRef(false)
  const shareWarningShownRef = useRef(false)
  const editorScrollRef = useRef(null)
  const previewViewportRef = useRef(null)
  const resetConfirmTimeoutRef = useRef(null)

  // Non-default CV fonts are fetched on demand (see utils/cvFonts.js) rather
  // than bundled upfront. PDF export snapshots the live DOM, so it has to
  // wait for this fetch — and for the browser to actually finish painting
  // with it — or it can capture a fallback font instead; see handleExport's
  // use of this ref below.
  const cvFontLoadPromiseRef = useRef(Promise.resolve())
  useEffect(() => {
    cvFontLoadPromiseRef.current = loadCvFont(cvFontId)
  }, [cvFontId])

  const [activeSectionId, setActiveSectionId] = useState('personal')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false)
  const [isResponsivePreview, setIsResponsivePreview] = useState(false)
  const [zoomPercent, setZoomPercent] = useState(100)
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false)
  const [isBadgeOpen, setIsBadgeOpen] = useState(false)
  // "Reset form" is a two-step button: the first click arms it, a second
  // click within RESET_CONFIRM_WINDOW_MS actually clears the form. Nothing
  // is persisted, so an accidental single click next to "Load demo CV"
  // would otherwise wipe real work with no dialog.
  const [resetConfirmArmed, setResetConfirmArmed] = useState(false)
  // Bumped by "Manage" in Settings to force-expand the (collapsed-by-default)
  // "Visible sections" panel it scrolls the user to.
  const [sectionSettingsExpandSignal, setSectionSettingsExpandSignal] = useState(0)

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

  const isActionBusy = Boolean(activeExport) || isImporting

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
    onLocaleChange(locale)
  }, [locale, onLocaleChange, setStorageValue])

  useEffect(() => {
    setStorageValue(UI_NAV_RAIL_COLLAPSED_STORAGE_KEY, navRailCollapsed ? 'true' : 'false')
  }, [navRailCollapsed, setStorageValue])

  useEffect(() => {
    setStorageValue(UI_BUILDER_MODE_STORAGE_KEY, builderMode)
  }, [builderMode, setStorageValue])

  useEffect(() => {
    setStorageValue(CV_SESSION_RESTORE_ENABLED_STORAGE_KEY, sessionRestoreEnabled ? 'true' : 'false')

    // Turning the feature off clears any saved copy immediately, rather than
    // waiting for the tab to close — an explicit "stop and forget" action.
    if (!sessionRestoreEnabled) {
      safeSessionStorageRemove(CV_SESSION_SNAPSHOT_STORAGE_KEY)
    }
  }, [sessionRestoreEnabled, setStorageValue])

  useEffect(() => {
    if (!sessionRestoreEnabled) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      const result = safeSessionStorageSet(CV_SESSION_SNAPSHOT_STORAGE_KEY, JSON.stringify(formData))

      if (!result.ok && !sessionRestoreWarningShownRef.current) {
        sessionRestoreWarningShownRef.current = true
        showToast(
          locale === 'fi'
            ? 'Istunnon palautusta ei voitu tallentaa (tila on täynnä tai estetty). CV on silti tallella tässä välilehdessä.'
            : 'Could not save a session-restore copy (storage full or blocked). Your CV is still fine in this tab.',
          'error',
        )
      }
    }, HISTORY_COMMIT_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [formData, locale, sessionRestoreEnabled])

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
    if (typeof window === 'undefined') {
      return undefined
    }

    // The PDF export bundle (html2canvas + jsPDF + the export worker) is
    // ~1.4MB and only loads on the first export, so that click pays for the
    // download on top of the render work. Warm it once the browser is idle
    // so it's already cached by the time the user reaches for it.
    const requestIdle = window.requestIdleCallback ?? ((callback) => window.setTimeout(callback, 2000))
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout

    const idleId = requestIdle(() => {
      import('../utils/exporters').then(({ prefetchPdfExportAssets }) => {
        prefetchPdfExportAssets()
      })
    })

    return () => cancelIdle(idleId)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    // Each bespoke template's Showcase component (CVPreview.jsx) is now
    // lazy-loaded so the initial builder bundle only carries the one the
    // user actually has selected. Warm the rest on idle so switching
    // templates, or opening the gallery (which renders all 12 as
    // thumbnails at once), rarely hits the loading fallback.
    const requestIdle = window.requestIdleCallback ?? ((callback) => window.setTimeout(callback, 2000))
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout

    const idleId = requestIdle(() => {
      prefetchTemplateShowcases()
    })

    return () => cancelIdle(idleId)
  }, [])

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
      // The map has to be emptied too. Leaving cleared ids behind makes the
      // effect above think those toasts are still scheduled, so they would
      // never be dismissed after a remount.
      timeouts.clear()
    }
  }, [])

  const secondaryButtonClassName = `border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`
  const compactButtonClassName = `shrink-0 border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`

  const handleExport = useCallback(async (type) => {
    dispatchUi({ type: UI_ACTION.SET_ACTIVE_EXPORT, value: type })

    // Direct Edit always renders the bespoke/flat Showcase with ATS mode
    // forced off (DirectEditPreview hardcodes atsFriendlyMode={false} on its
    // CVPreview call — see that file) — ATS mode is an export concern, not
    // an editing surface. So the export must agree: a PDF exported from
    // Direct Edit always uses the designer/bespoke rendering that's actually
    // on screen, regardless of the app's real ATS toggle state, or
    // waitForPreviewModeSync below polls for a `--ats` class the DOM will
    // never produce and times out every single time.
    const effectiveAtsFriendlyMode = builderMode === 'direct' ? false : atsFriendlyMode

    const exportLabel =
      type === 'pdf-designer'
        ? effectiveAtsFriendlyMode
          ? 'ATS PDF'
          : 'Designer PDF'
        : type === 'html'
          ? 'HTML'
          : type === 'docx'
            ? 'Word'
            : 'JSON'

    const toastLabel =
      type === 'pdf-designer'
        ? locale === 'fi' ? 'Valmistellaan PDF-vientiä...' : 'Preparing PDF export...'
        : type === 'html'
          ? locale === 'fi' ? 'Valmistellaan HTML-vientiä...' : 'Preparing HTML export...'
          : type === 'docx'
            ? locale === 'fi' ? 'Valmistellaan Word-vientiä...' : 'Preparing Word export...'
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
        const exportPdfMode = effectiveAtsFriendlyMode ? 'ats' : 'designer'
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

        // The chosen CV font may still be an in-flight dynamic import (see
        // cvFontLoadPromiseRef above) — capturing before its @font-face rules
        // are registered and painted would bake the fallback font into the PDF.
        await cvFontLoadPromiseRef.current
        await window.document.fonts.ready

        await exportCvAsPdf(previewRef.current, exportFileName, {
          mode: exportPdfMode,
          formData,
          template: selectedTemplate,
          variant: selectedTemplate,
          atsFriendlyMode: effectiveAtsFriendlyMode,
          locale,
        })
      }

      if (type === 'json') {
        exportCvAsJson(formData, exportFileName)
      }

      if (type === 'html') {
        exportCvAsHtml(formData, exportFileName, { locale })
      }

      if (type === 'docx') {
        const { exportCvAsDocx } = await import('../utils/docxExport')
        await exportCvAsDocx(formData, exportFileName, {
          template: selectedTemplate,
          locale,
          accentColor: resolveTemplateAccent(templateAccentColors, selectedTemplate),
        })
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
  }, [atsFriendlyMode, builderMode, exportFileName, formData, locale, previewRef, selectedTemplate, templateAccentColors, zoomPercent])

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
    window.clearTimeout(resetConfirmTimeoutRef.current)

    if (!resetConfirmArmed) {
      setResetConfirmArmed(true)
      resetConfirmTimeoutRef.current = window.setTimeout(() => {
        setResetConfirmArmed(false)
      }, RESET_CONFIRM_WINDOW_MS)
      return
    }

    setResetConfirmArmed(false)
    dispatchFormData({ type: FORM_ACTION.RESET_FORM })
    showToast(
      locale === 'fi'
        ? 'Lomake nollattu. Palauta työkalupalkin kumoa-nuolella.'
        : 'Form reset. Restore it with the toolbar undo arrow.',
    )
  }, [dispatchFormData, locale, resetConfirmArmed])

  useEffect(() => () => window.clearTimeout(resetConfirmTimeoutRef.current), [])

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
    let shareUrl

    try {
      shareUrl = buildShareUrl(formData)
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : locale === 'fi'
            ? 'Tälle CV:lle ei voitu luoda jaettavaa linkkiä.'
            : 'Failed to create a shareable link for this CV.',
        'error',
      )
      return
    }

    // The Clipboard API is unavailable outside a secure context and can be
    // blocked by permissions, so a failure here is about copying, not about the
    // link itself.
    try {
      await window.navigator.clipboard.writeText(shareUrl)
    } catch {
      showToast(
        locale === 'fi'
          ? 'Leikepöydälle kopiointi epäonnistui. Kopioi linkki selaimen osoiterivilta.'
          : 'Could not copy to the clipboard. Copy the link from your browser address bar instead.',
        'error',
      )
      return
    }

    if (!shareWarningShownRef.current) {
      shareWarningShownRef.current = true
      showToast(
        locale === 'fi'
          ? 'Huom: jakolinkki sisältää CV-tietosi URL:ssa. Jaa vain luotetuille vastaanottajille.'
          : 'Note: the share link embeds your CV data in the URL. Share it only with trusted recipients.',
        'info',
      )
    }

    if (shareLinkOmitsImages(formData)) {
      showToast(
        locale === 'fi'
          ? 'Jakolinkki kopioitu. Kuvat jäävät linkin ulkopuolelle — jaa JSON, jos ne tarvitaan.'
          : 'Share link copied. Images are left out of the link — share the JSON export if they are needed.',
        'info',
      )
      return
    }

    showToast(locale === 'fi' ? 'Jakolinkki kopioitu leikepöydälle.' : 'Share link copied to clipboard.')
  }, [formData, locale])

  const handleToggleAtsFriendlyMode = useCallback(() => {
    dispatchUi({ type: UI_ACTION.TOGGLE_ATS_MODE })
  }, [])

  const handleToggleSessionRestore = useCallback(() => {
    dispatchUi({ type: UI_ACTION.TOGGLE_SESSION_RESTORE })
  }, [])

  const handleTemplateAccentColorChange = useCallback((color) => {
    dispatchUi({ type: UI_ACTION.SET_TEMPLATE_ACCENT_COLOR, templateId: selectedTemplate, color })
  }, [selectedTemplate])

  const handleClassicNameAlignmentChange = useCallback((alignment) => {
    dispatchUi({ type: UI_ACTION.SET_CLASSIC_NAME_ALIGNMENT, alignment })
  }, [])

  const handleToggleMobilePreview = useCallback(() => {
    dispatchUi({ type: UI_ACTION.TOGGLE_MOBILE_PREVIEW })
  }, [])

  const skipMobilePreviewScrollRef = useRef(true)

  // Below the `lg` breakpoint, AppShell stacks the editor and preview as one
  // long page-scrolled column (see app-shell.css's .app-shell__nav / the
  // showContentOnMobile prop) instead of two independently-scrolling panes.
  // Toggling mobilePreviewVisible only changed which pane was in the DOM —
  // it never scrolled to it, so tapping "Preview" while scrolled deep into a
  // long form produced no visible change at all (the ~2400px preview section
  // just got appended far below the current scroll position). Bring the
  // newly-shown pane to the top of the viewport so the tap does something.
  useEffect(() => {
    if (skipMobilePreviewScrollRef.current) {
      skipMobilePreviewScrollRef.current = false
      return
    }

    if (typeof window === 'undefined' || window.matchMedia('(min-width: 1024px)').matches) {
      return
    }

    const target = document.querySelector(mobilePreviewVisible ? '.app-shell__preview' : '.app-shell__editor')
    target?.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' })
  }, [mobilePreviewVisible])

  const handleSelectTemplate = useCallback((templateId) => {
    dispatchUi({ type: UI_ACTION.SET_SELECTED_TEMPLATE, templateId })
  }, [])

  const handleCvFontChange = useCallback((fontId) => {
    dispatchUi({ type: UI_ACTION.SET_CV_FONT, fontId })
  }, [])

  const handleCvHeadingColorChange = useCallback((color) => {
    dispatchUi({ type: UI_ACTION.SET_CV_HEADING_COLOR, color })
  }, [])

  const handleToggleNavRail = useCallback(() => {
    dispatchUi({ type: UI_ACTION.TOGGLE_NAV_RAIL_COLLAPSED })
  }, [])

  const handleSetBuilderMode = useCallback(
    (mode) => dispatchUi({ type: UI_ACTION.SET_BUILDER_MODE, mode }),
    [dispatchUi],
  )

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true)
  }, [])

  const handleLocaleChange = useCallback((nextLocale) => {
    dispatchUi({ type: UI_ACTION.SET_LOCALE, locale: nextLocale === 'fi' ? 'fi' : 'en' })
  }, [])

  const handleNavigate = useCallback((item) => {
    if (item.kind === 'action') {
      if (item.id === 'templates') {
        setIsTemplateGalleryOpen(true)
      } else if (item.id === 'settings') {
        setIsSettingsOpen(true)
      } else if (item.id === 'coverLetter') {
        setIsCoverLetterOpen(true)
      }
      return
    }

    const container = editorScrollRef.current
    const target = container?.querySelector(`#${item.anchor}`)

    if (container && target) {
      scrollSectionIntoView(container, target)
      setActiveSectionId(item.id)
    }
  }, [])

  const handleManageSections = useCallback(() => {
    setIsSettingsOpen(false)
    setSectionSettingsExpandSignal((value) => value + 1)

    const container = editorScrollRef.current
    const target = container?.querySelector('#section-settings')

    if (container && target) {
      window.requestAnimationFrame(() => {
        scrollSectionIntoView(container, target)
      })
    }
  }, [])

  const handleOpenTemplateGallery = useCallback(() => {
    setIsTemplateGalleryOpen(true)
  }, [])

  const handleCloseTemplateGallery = useCallback(() => {
    setIsTemplateGalleryOpen(false)
  }, [])

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false)
  }, [])

  const handleCloseCoverLetter = useCallback(() => {
    setIsCoverLetterOpen(false)
  }, [])

  const handleOpenBadge = useCallback(() => {
    setIsTemplateGalleryOpen(false)
    setIsBadgeOpen(true)
  }, [])

  const handleCloseBadge = useCallback(() => {
    setIsBadgeOpen(false)
  }, [])

  const handleCopyBadgeSnippet = useCallback(async (snippet) => {
    try {
      await window.navigator.clipboard.writeText(snippet)
      showToast(locale === 'fi' ? 'Tunnuksen HTML kopioitu leikepöydälle.' : 'Badge HTML copied to clipboard.')
    } catch {
      showToast(
        locale === 'fi'
          ? 'Kopiointi epäonnistui. Kopioi HTML manuaalisesti.'
          : 'Could not copy to the clipboard. Copy the HTML manually instead.',
        'error',
      )
    }
  }, [locale])

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
    // A callback only receives the sections whose intersection changed, so the
    // set of currently visible ones has to be tracked across callbacks —
    // otherwise scrolling a section out of view leaves the old item highlighted.
    const visibleTops = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleTops.set(entry.target.id, entry.boundingClientRect.top)
          } else {
            visibleTops.delete(entry.target.id)
          }
        })

        const topmost = [...visibleTops.entries()].sort((a, b) => a[1] - b[1])[0]

        if (topmost) {
          const navId = idToNavId.get(topmost[0])

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
    // Re-query on template switches: a section's anchor can appear/disappear
    // from the DOM (CVForm only renders sections the template supports), so a
    // mount-only observer would miss anchors that show up after a later switch.
  }, [selectedTemplate])

  // A template switch can add or remove editor sections; if the user was
  // scrolled deep into the form, those changes happen off-screen with no
  // cue. Jump the editor back to the top so the (possibly new) section list
  // is visible from the start.
  const skipTemplateScrollResetRef = useRef(true)
  useEffect(() => {
    if (skipTemplateScrollResetRef.current) {
      skipTemplateScrollResetRef.current = false
      return
    }

    // Instant, not smooth: a template switch is a context change, and some
    // browser setups silently no-op a programmatic smooth scroll anyway.
    editorScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    setActiveSectionId('personal')
  }, [selectedTemplate])

  useEffect(() => {
    if (!onHeaderChange) return
    onHeaderChange({
      activeExport,
      isActionBusy,
      locale,
      onExport: handleExport,
      onCopyShareLink: handleCopyShareLink,
      onLocaleChange: handleLocaleChange,
      canUndo,
      canRedo,
      onUndo: handleUndo,
      onRedo: handleRedo,
      templates,
      selectedTemplateId: selectedTemplate,
      onOpenTemplateGallery: handleOpenTemplateGallery,
      cvFontId,
      onCvFontChange: handleCvFontChange,
      cvHeadingColor,
      onCvHeadingColorChange: handleCvHeadingColorChange,
      searchQuery,
      onSearchChange: setSearchQuery,
      isFullscreenPreview,
      onToggleFullscreenPreview: handleToggleFullscreenPreview,
      isResponsivePreview,
      onToggleResponsivePreview: handleToggleResponsivePreview,
      onOpenSettings: handleOpenSettings,
      builderMode,
      onSetBuilderMode: handleSetBuilderMode,
    })
  }, [
    activeExport, isActionBusy, locale,
    handleExport, handleCopyShareLink, handleLocaleChange,
    canUndo, canRedo, handleUndo, handleRedo,
    templates, selectedTemplate, handleOpenTemplateGallery,
    cvFontId, handleCvFontChange,
    cvHeadingColor, handleCvHeadingColorChange,
    searchQuery,
    isFullscreenPreview, handleToggleFullscreenPreview,
    isResponsivePreview, handleToggleResponsivePreview,
    handleOpenSettings,
    builderMode, handleSetBuilderMode,
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

  const handleCoverLetterCompanyChange = useCallback((value) => {
    dispatchUi({ type: UI_ACTION.SET_COVER_LETTER_COMPANY, value })
  }, [])

  const handleCoverLetterRoleChange = useCallback((value) => {
    dispatchUi({ type: UI_ACTION.SET_COVER_LETTER_ROLE, value })
  }, [])

  const handleCoverLetterHiringManagerChange = useCallback((value) => {
    dispatchUi({ type: UI_ACTION.SET_COVER_LETTER_HIRING_MANAGER, value })
  }, [])

  const handleCoverLetterBodyChange = useCallback((value) => {
    dispatchUi({ type: UI_ACTION.SET_COVER_LETTER_BODY, value })
  }, [])

  const handleGenerateCoverLetter = useCallback(() => {
    const draft = generateCoverLetterDraft(formData, {
      locale,
      companyName: coverLetterCompany,
      roleTitle: coverLetterRole,
      hiringManagerName: coverLetterHiringManager,
    })
    dispatchUi({ type: UI_ACTION.SET_COVER_LETTER_BODY, value: draft })
  }, [coverLetterCompany, coverLetterHiringManager, coverLetterRole, formData, locale])

  const handleCopyCoverLetter = useCallback(async () => {
    if (!coverLetterBody.trim()) {
      return
    }

    try {
      await window.navigator.clipboard.writeText(coverLetterBody)
      showToast(locale === 'fi' ? 'Hakemuskirje kopioitu leikepöydälle.' : 'Cover letter copied to clipboard.')
    } catch {
      showToast(
        locale === 'fi'
          ? 'Kopiointi epäonnistui. Kopioi teksti manuaalisesti.'
          : 'Could not copy to the clipboard. Copy the text manually instead.',
        'error',
      )
    }
  }, [coverLetterBody, locale])

  const handleDownloadCoverLetterText = useCallback(async () => {
    if (!coverLetterBody.trim()) {
      return
    }

    const { exportCoverLetterAsText } = await import('../utils/exporters')
    exportCoverLetterAsText(coverLetterBody, `${exportFileName}-cover-letter`)
  }, [coverLetterBody, exportFileName])

  const handleDownloadCoverLetterPdf = useCallback(async () => {
    if (!coverLetterBody.trim()) {
      return
    }

    try {
      const { exportCoverLetterAsPdf } = await import('../utils/exporters')
      await exportCoverLetterAsPdf(coverLetterBody, `${exportFileName}-cover-letter`)
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : locale === 'fi'
            ? 'PDF-vienti epäonnistui.'
            : 'PDF export failed.',
        'error',
      )
    }
  }, [coverLetterBody, exportFileName, locale])

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
            style={resetConfirmArmed
              ? { backgroundColor: '#b91c1c', borderColor: '#b91c1c', color: '#ffffff' }
              : undefined}
            disabled={isActionBusy}
            aria-live="polite"
            onClick={handleResetForm}
          >
            {resetConfirmArmed
              ? locale === 'fi' ? 'Vahvista nollaus' : 'Confirm reset'
              : locale === 'fi' ? 'Nollaa lomake' : 'Reset form'}
          </button>
          <div
            className={`editor-status-pill ${ui.surfaceMuted} ${ui.textMuted}`}
            role="status"
          >
            {locale === 'fi' ? 'Ei tallenneta minnekään' : 'Nothing saved anywhere'}
          </div>
        </div>

        {/* Import: paste a plain-text snippet or load a JSON export to fill the
            form. Its own disclosure, collapsed by default so it doesn't push
            the first form field off-screen. */}
        <details className="editor-tools">
          <summary className="editor-tools__summary">
            <span className="editor-tools__label">
              {locale === 'fi' ? 'Tuo CV' : 'Import CV'}
            </span>
          </summary>

          <div className="editor-tools__body stack-5">
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
                aria-label={locale === 'fi' ? 'Liitetty CV-teksti' : 'Pasted CV text'}
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
              </div>
            </section>
          </div>
        </details>

        {/* ATS score, keyword match, and writing suggestions — analysis of the
            CV rather than part of it. Its own disclosure, collapsed by default;
            the summary keeps the score and suggestion count visible so nothing
            is hidden, only folded. */}
        <details className="editor-tools">
          <summary className="editor-tools__summary">
            <span className="editor-tools__label">
              {locale === 'fi' ? 'ATS-pisteet ja ehdotukset' : 'ATS score & suggestions'}
            </span>
            <span className="editor-tools__stats">
              {atsScore ? (
                <span className="editor-tools__stat">
                  ATS {atsScore.score}
                </span>
              ) : null}
              {feedback?.length ? (
                <span className="editor-tools__stat">
                  {feedback.length} {locale === 'fi' ? 'ehdotusta' : 'suggestions'}
                </span>
              ) : null}
            </span>
          </summary>

          <div className="editor-tools__body stack-5">
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
            />
          </div>
        </details>

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
          onPhotoError={(message) => showToast(message, 'error')}
          selectedTemplate={selectedTemplate}
          selectedTemplateLabel={currentTemplate.label}
          sectionSettingsExpandSignal={sectionSettingsExpandSignal}
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
    resetConfirmArmed,
    secondaryButtonClassName,
    sectionSettingsExpandSignal,
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

  const templateSectionKeySet = useMemo(
    () => new Set([...currentTemplate.primarySections, ...currentTemplate.secondarySections]),
    [currentTemplate],
  )

  const filteredNavSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const supportedByTemplate = NAV_SECTIONS.filter(
      (item) => item.sectionKey === null || templateSectionKeySet.has(item.sectionKey),
    )

    if (!query) {
      return supportedByTemplate
    }

    return supportedByTemplate.filter((item) => (item.label[locale] ?? item.label.en).toLowerCase().includes(query))
  }, [searchQuery, locale, templateSectionKeySet])

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
      version={APP_VERSION_RAW}
      isCollapsed={navRailCollapsed}
      onToggleCollapsed={handleToggleNavRail}
    />
  ), [
    filteredNavSections,
    filteredNavUtilityItems,
    activeSectionId,
    handleNavigate,
    locale,
    navRailCollapsed,
    handleToggleNavRail,
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
          <div
            className="preview-zoom-wrapper"
            style={{
              '--preview-zoom': zoomPercent / 100,
              // Shadows the --font-sans token (tokens.css) for this subtree only
              // — every template's CSS already reads font-family from that
              // token, so redefining it here changes the CV document's body
              // font everywhere without touching each template's stylesheet,
              // and without affecting the app's own chrome outside this wrapper.
              '--font-sans': getCvFontStack(cvFontId),
            }}
          >
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
                accentColor={resolveTemplateAccent(templateAccentColors, selectedTemplate)}
                headingColor={cvHeadingColor}
                classicNameAlignment={classicNameAlignment}
              />
            </AppErrorBoundary>
          </div>
        </div>

      </div>
    </div>
  ), [
    atsFriendlyMode,
    classicNameAlignment,
    cvFontId,
    cvHeadingColor,
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
    templateAccentColors,
    zoomPercent,
    ui.button,
    ui.surface,
    ui.textMuted,
    ui.textPrimary,
    ui.textSecondary,
  ])

  const mobileBottomActions = useMemo(() => (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t px-3 py-2 backdrop-blur md:px-4 lg:hidden print:hidden ${ui.surfaceStrong}`}
    >
      <div
        className="mx-auto mb-2 grid max-w-[110rem] grid-cols-3 gap-1.5"
        role="tablist"
        aria-label={locale === 'fi' ? 'Näkymän valinta' : 'View selector'}
      >
        <button
          type="button"
          role="tab"
          aria-selected={!mobilePreviewVisible}
          className={`border px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${
            !mobilePreviewVisible ? ui.buttonActive : ui.button
          }`}
          onClick={() => {
            if (mobilePreviewVisible) handleToggleMobilePreview()
          }}
        >
          {locale === 'fi' ? 'Editori' : 'Editor'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePreviewVisible}
          className={`border px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${
            mobilePreviewVisible ? ui.buttonActive : ui.button
          }`}
          onClick={() => {
            if (!mobilePreviewVisible) handleToggleMobilePreview()
          }}
        >
          {locale === 'fi' ? 'Esikatselu' : 'Preview'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={false}
          className={`border px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`}
          onClick={() => setIsTemplateGalleryOpen(true)}
        >
          {locale === 'fi' ? 'Pohjat' : 'Templates'}
        </button>
      </div>
      <div className="mx-auto flex max-w-[110rem] items-center gap-2 overflow-x-auto no-scrollbar quick-actions-scroll-fade">
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
          className={compactButtonClassName}
          onClick={() => setIsCoverLetterOpen(true)}
        >
          {locale === 'fi' ? 'Hakemuskirje' : 'Cover letter'}
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
      <h1 className="sr-only">{locale === 'fi' ? 'Rakenna CV:si' : 'Build Your CV'}</h1>
      {builderMode === 'direct' ? (
        <AppErrorBoundary
          panelTitle={locale === 'fi' ? 'Suoran muokkauksen esikatselu' : 'Direct Edit preview'}
          locale={locale}
        >
          <DirectEditPreview
            formData={formData}
            dispatchFormData={dispatchFormData}
            selectedTemplate={selectedTemplate}
            templateConfig={currentTemplate}
            locale={locale}
            accentColor={resolveTemplateAccent(templateAccentColors, selectedTemplate)}
            headingColor={cvHeadingColor}
            classicNameAlignment={classicNameAlignment}
            previewRef={previewRef}
            cvFontId={cvFontId}
          />
        </AppErrorBoundary>
      ) : (
        <AppShell
          shellStyle={shellStyle}
          showContentOnMobile={mobilePreviewVisible}
          nav={navRailContent}
          sidebar={sidebarContent}
          content={previewContent}
          navCollapsed={navRailCollapsed}
        />
      )}

      {builderMode === 'direct' ? null : mobileBottomActions}

      <TemplateGalleryModal
        isOpen={isTemplateGalleryOpen}
        onClose={handleCloseTemplateGallery}
        templates={templates}
        selectedTemplateId={selectedTemplate}
        onSelectTemplate={handleSelectTemplate}
        atsScore={atsScore}
        formData={formData}
        cvFontId={cvFontId}
        cvHeadingColor={cvHeadingColor}
        locale={locale}
        onOpenBadge={handleOpenBadge}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        locale={locale}
        atsFriendlyMode={atsFriendlyMode}
        onToggleAtsFriendlyMode={handleToggleAtsFriendlyMode}
        onManageSections={handleManageSections}
        sessionRestoreEnabled={sessionRestoreEnabled}
        onToggleSessionRestore={handleToggleSessionRestore}
        selectedTemplate={selectedTemplate}
        templateAccentColors={templateAccentColors}
        onTemplateAccentColorChange={handleTemplateAccentColorChange}
        classicNameAlignment={classicNameAlignment}
        onClassicNameAlignmentChange={handleClassicNameAlignmentChange}
      />

      <BadgeModal
        isOpen={isBadgeOpen}
        onClose={handleCloseBadge}
        locale={locale}
        onCopy={handleCopyBadgeSnippet}
      />

      <CoverLetterModal
        isOpen={isCoverLetterOpen}
        onClose={handleCloseCoverLetter}
        locale={locale}
        fullName={formData.fullName}
        companyName={coverLetterCompany}
        roleTitle={coverLetterRole}
        hiringManagerName={coverLetterHiringManager}
        letterBody={coverLetterBody}
        onCompanyNameChange={handleCoverLetterCompanyChange}
        onRoleTitleChange={handleCoverLetterRoleChange}
        onHiringManagerNameChange={handleCoverLetterHiringManagerChange}
        onLetterBodyChange={handleCoverLetterBodyChange}
        onGenerate={handleGenerateCoverLetter}
        onCopy={handleCopyCoverLetter}
        onDownloadText={handleDownloadCoverLetterText}
        onDownloadPdf={handleDownloadCoverLetterPdf}
      />

      <ToastStack toasts={toasts} />
    </>
  )
}

export default ResumeBuilderPage
