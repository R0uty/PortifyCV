import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import AppShell from '../components/AppShell'
import AppErrorBoundary from '../components/AppErrorBoundary'
import CVForm from '../components/CVForm'
import CVPreview from '../components/CVPreview'
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
  cvTemplates,
  defaultTemplateId,
  getCvTemplate,
} from '../utils/cvTemplates'
import {
  createExportFileName,
  exportCvAsJson,
  exportCvAsPdf,
  exportCvAsHtml,
} from '../utils/exporters'
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
import { analyzeJobDescription, evaluateAtsScore } from '../utils/atsScore'

const TemplateGallery = lazy(() => import('../components/TemplateGallery'))
const CVSuggestionsPanel = lazy(() => import('../components/CVSuggestionsPanel'))
const ATSScorePanel = lazy(() => import('../components/ATSScorePanel'))
const JOB_DESCRIPTION_STORAGE_KEY = 'portifycv-job-description'
const DEBUG_PDF_EXPORT = true

function createToast(message, type = 'success') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    type,
  }
}

function SurfaceFallback({ theme = 'dark', title = 'Loading panel...' }) {
  const ui = getUiTheme(theme)

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

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
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
  const initialJobDescriptionState = useMemo(
    () => safeStorageGet(JOB_DESCRIPTION_STORAGE_KEY, ''),
    [],
  )
  const [formData, setFormData] = useState(initialSession.formData)
  const [theme] = useState('light')
  const [accent] = useState(initialSession.accent)
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplateId)
  const [atsFriendlyMode, setAtsFriendlyMode] = useState(false)
  const [mobilePreviewVisible, setMobilePreviewVisible] = useState(false)
  const [activeExport, setActiveExport] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [showShortcutHelp, setShowShortcutHelp] = useState(false)
  const [jobDescription, setJobDescription] = useState(initialJobDescriptionState.value)
  const [pastedCvText, setPastedCvText] = useState('')
  const [toasts, setToasts] = useState(
    initialSession.initialToast ? [initialSession.initialToast] : [],
  )
  const ui = getUiTheme(theme)
  const previewRef = useRef(null)
  const importInputRef = useRef(null)
  const toastTimeoutsRef = useRef(new Map())
  const storageWarningShownRef = useRef(false)

  const errors = useMemo(
    () => ({
      fullName: formData.fullName.trim() ? '' : 'Full name is required.',
      title: formData.title.trim() ? '' : 'Professional title is required.',
    }),
    [formData.fullName, formData.title],
  )

  const completedRequiredFields = Object.values(errors).filter((value) => !value).length
  const populatedSkills = formData.skills.filter((skill) => skill.trim()).length
  const populatedExperience = formData.experience.filter(
    (item) => item.role.trim() || item.company.trim() || item.description.trim(),
  ).length
  const exportFileName = createExportFileName(formData) || 'cv'
  const currentTemplate = useMemo(
    () => getCvTemplate(selectedTemplate),
    [selectedTemplate],
  )
  const shellStyle = useMemo(() => getAccentThemeStyles(theme, accent), [theme, accent])
  const feedback = useMemo(() => evaluateCvFeedback(formData), [formData])
  const atsScore = useMemo(
    () =>
      evaluateAtsScore(formData, {
        template: selectedTemplate,
        atsFriendly: atsFriendlyMode,
      }),
    [atsFriendlyMode, formData, selectedTemplate],
  )
  const jobDescriptionAnalysis = useMemo(
    () => analyzeJobDescription(formData, jobDescription),
    [formData, jobDescription],
  )
  const showToast = (message, type = 'success') => {
    const nextToast = createToast(message, type)

    setToasts((current) => [...current, nextToast])

    const timeoutId = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== nextToast.id))
      toastTimeoutsRef.current.delete(nextToast.id)
    }, 2800)

    toastTimeoutsRef.current.set(nextToast.id, timeoutId)
  }

  const reportStorageIssue = useCallback(() => {
    if (storageWarningShownRef.current) {
      return
    }

    storageWarningShownRef.current = true
    showToast('Storage access is limited. Your changes may not persist after refresh.', 'error')
  }, [])

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
    if (!initialJobDescriptionState.ok) {
      reportStorageIssue()
    }
  }, [initialJobDescriptionState.ok, reportStorageIssue])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setStorageValue(JOB_DESCRIPTION_STORAGE_KEY, jobDescription)
    }, 180)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [jobDescription, setStorageValue])

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
        setToasts((current) => current.filter((entry) => entry.id !== toast.id))
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
  const primaryActionButtonClassName =
    'action-button action-button--primary rounded-full border px-4 py-2.5 text-sm font-semibold transition'
  const secondaryActionButtonClassName =
    'action-button action-button--secondary rounded-full border px-4 py-2.5 text-sm font-semibold transition'
  const checklistItemClassName = `rounded-2xl border px-4 py-3.5 transition-colors ${ui.surfaceMuted}`
  const panelSurfaceClassName = `fade-in-up surface-shadow rounded-[var(--radius-card)] border p-5 sm:p-6 print:hidden ${ui.surface}`

  useEffect(() => {
    if (!DEBUG_PDF_EXPORT) {
      return
    }

    const previewVariant =
      previewRef.current?.querySelector('[data-export-variant]')?.getAttribute('data-export-variant')
      || previewRef.current?.getAttribute('data-export-variant')
      || null
    console.debug('[PDF DEBUG] selectedTemplate state changed', {
      selectedTemplate,
      previewVariant,
    })
  }, [selectedTemplate])

  const handleExport = useCallback(async (type) => {
    setActiveExport(type)

    const toastLabel =
      type === 'pdf-designer'
        ? 'Preparing PDF export...'
        : type === 'html'
          ? 'Preparing HTML export...'
          : 'Preparing JSON export...'

    showToast(toastLabel)

    const shouldForceDesignerPreview = type === 'pdf-designer' && atsFriendlyMode

    try {
      if (type === 'pdf-designer') {
        const expectedVariant = getCvTemplate(selectedTemplate).variant
        const initialPreviewVariant =
          previewRef.current?.querySelector('[data-export-variant]')?.getAttribute('data-export-variant')
          || previewRef.current?.getAttribute('data-export-variant')
          || null

        if (DEBUG_PDF_EXPORT) {
          console.debug('[PDF DEBUG] before PDF export', {
            selectedTemplate,
            expectedVariant,
            optionsTemplate: selectedTemplate,
            optionsVariant: expectedVariant,
            previewElementVariant: initialPreviewVariant,
            hasPreviewRef: Boolean(previewRef.current),
          })
        }

        if (shouldForceDesignerPreview) {
          setAtsFriendlyMode(false)

          const didSyncDesignerMode = await waitForPreviewModeSync(
            previewRef.current,
            'designer',
          )

          if (!didSyncDesignerMode) {
            showToast(
              'Preview mode is still in ATS layout. Try exporting again in a moment.',
              'error',
            )
            return
          }
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
            `Template preview is not synced yet (expected ${expectedVariant}, got ${activeVariant}). Try again.`,
            'error',
          )
          return
        }

        await exportCvAsPdf(previewRef.current, exportFileName, {
          mode: 'designer',
          formData,
          theme,
          template: selectedTemplate,
          variant: selectedTemplate,
          atsFriendlyMode: false,
        })
      }

      if (type === 'json') {
        exportCvAsJson(formData, exportFileName)
      }

      if (type === 'html') {
        exportCvAsHtml(formData, exportFileName)
      }

      const exportLabel =
        type === 'pdf-designer' ? 'Designer PDF' : type === 'html' ? 'HTML' : 'JSON'

      showToast(`${exportLabel} export downloaded.`)
    } catch (error) {
      const exportLabel =
        type === 'pdf-designer' ? 'Designer PDF' : type === 'html' ? 'HTML' : 'JSON'

      showToast(
        error instanceof Error
          ? error.message
          : `Failed to export ${exportLabel}.`,
        'error',
      )
    } finally {
      if (shouldForceDesignerPreview) {
        setAtsFriendlyMode(true)
      }

      setActiveExport('')
    }
  }, [atsFriendlyMode, exportFileName, formData, previewRef, selectedTemplate, theme])

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleImportFile = useCallback(async (event) => {
    const [file] = event.target.files ?? []

    if (!file) {
      return
    }

    setIsImporting(true)

    try {
      showToast(`Importing ${file.name}...`)
      const fileText = await file.text()
      const parsedValue = JSON.parse(fileText)
      const importedData = parseImportedCvData(parsedValue)

      setFormData(importedData)
      setStorageValue(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
      showToast(`Imported CV data from ${file.name}.`)
    } catch (error) {
      if (error instanceof SyntaxError) {
        showToast(
          'Invalid JSON file. Upload a valid PortifyCV export with fullName, title, skills, experience, education, and links.',
          'error',
        )
      } else {
        showToast(
          error instanceof Error ? error.message : 'Failed to import the selected file.',
          'error',
        )
      }
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }, [setStorageValue])

  const handleResetForm = useCallback(() => {
    setFormData(createInitialCvData())
    removeStorageValue(CV_DRAFT_STORAGE_KEY)
    showToast('Form reset to a blank CV.')
  }, [removeStorageValue])

  const handleLoadDemo = useCallback(() => {
    setFormData(structuredClone(demoCvData))
    setStorageValue(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
    showToast('Demo CV loaded.')
  }, [setStorageValue])

  const handlePasteCvImport = useCallback(() => {
    try {
      const parsedData = parsePastedCvText(pastedCvText)

      setFormData((current) => ({
        ...current,
        ...parsedData,
      }))
      setPastedCvText('')
      setStorageValue(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
      showToast('Pasted CV text imported.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to parse pasted CV text.', 'error')
    }
  }, [pastedCvText, setStorageValue])

  const handleCopySummary = useCallback(async () => {
    const summary = [formData.fullName.trim(), formData.title.trim(), formData.about.trim()]
      .filter(Boolean)
      .join('\n')

    if (!summary) {
      showToast('Add a name, title, or about text before copying the summary.', 'error')
      return
    }

    try {
      await window.navigator.clipboard.writeText(summary)
      showToast('CV summary copied to clipboard.')
    } catch {
      showToast('Clipboard access failed. Please try again.', 'error')
    }
  }, [formData.about, formData.fullName, formData.title])

  const handleCopyShareLink = useCallback(async () => {
    try {
      const shareUrl = buildShareUrl(formData)

      await window.navigator.clipboard.writeText(shareUrl)
      showToast('Share link copied to clipboard.')
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to create a shareable link for this CV.',
        'error',
      )
    }
  }, [formData])

  const handleImproveAboutText = useCallback(() => {
    const nextAbout = improveAboutText(formData)

    if (nextAbout === formData.about.trim()) {
      showToast('About text already looks concise.', 'success')
      return
    }

    setFormData((current) => ({
      ...current,
      about: nextAbout,
    }))
    showToast('About text improved.')
  }, [formData])

  const handleImproveExperienceText = useCallback((index) => {
    const currentItem = formData.experience[index]

    if (!currentItem) {
      return
    }

    const nextDescription = improveExperienceText(currentItem)

    if (nextDescription === currentItem.description.trim()) {
      showToast(`Experience ${index + 1} already looks concise.`, 'success')
      return
    }

    setFormData((current) => ({
      ...current,
      experience: current.experience.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              description: nextDescription,
            }
          : item,
      ),
    }))
    showToast(`Experience ${index + 1} text improved.`)
  }, [formData.experience])

  const handleToggleAtsFriendlyMode = useCallback(() => {
    setAtsFriendlyMode((current) => !current)
  }, [])

  const handleToggleMobilePreview = useCallback(() => {
    setMobilePreviewVisible((current) => !current)
  }, [])

  const handleSelectTemplate = useCallback((templateId) => {
    if (DEBUG_PDF_EXPORT) {
      console.debug('[PDF DEBUG] template selected', {
        previousTemplate: selectedTemplate,
        nextTemplate: templateId,
      })
    }

    setSelectedTemplate(templateId)
  }, [selectedTemplate])

  const handleToggleShortcutHelp = useCallback(() => {
    setShowShortcutHelp((current) => !current)
  }, [])

  const handleAddMissingKeywordToSkills = useCallback((keyword) => {
    const normalizedKeyword = keyword.trim()

    if (!normalizedKeyword) {
      return
    }

    let wasAdded = false

    setFormData((current) => {
      if (
        current.skills.some(
          (skill) => skill.toLowerCase() === normalizedKeyword.toLowerCase(),
        )
      ) {
        return current
      }

      wasAdded = true

      return {
        ...current,
        skills: [...current.skills, normalizedKeyword],
      }
    })

    showToast(
      wasAdded
        ? `Added "${normalizedKeyword}" to skills.`
        : `"${normalizedKeyword}" is already in skills.`,
    )
  }, [])

  const handleCopyMissingKeywords = useCallback(async () => {
    const missingKeywords = jobDescriptionAnalysis.missingKeywords

    if (missingKeywords.length === 0) {
      showToast('No missing keywords to copy.', 'error')
      return
    }

    try {
      await window.navigator.clipboard.writeText(missingKeywords.join(', '))
      showToast('Missing keywords copied.')
    } catch {
      showToast('Clipboard access failed. Please try again.', 'error')
    }
  }, [jobDescriptionAnalysis.missingKeywords])

  const handleClearJobDescription = useCallback(() => {
    if (!jobDescription.trim()) {
      return
    }

    setJobDescription('')
    showToast('Job description cleared.')
  }, [jobDescription])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isEditableTarget(event.target) || isActionBusy) {
        return
      }

      if (!(event.ctrlKey || event.metaKey)) {
        return
      }

      const key = event.key.toLowerCase()

      if (key === 'e') {
        event.preventDefault()
        handleExport('pdf-designer')
        return
      }

      if (key === 'j') {
        event.preventDefault()
        handleExport('json')
        return
      }

      if (key === 'i') {
        event.preventDefault()
        handleImportClick()
        return
      }

      if (key === 'p' && event.shiftKey) {
        event.preventDefault()
        handleToggleMobilePreview()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [
    handleExport,
    handleImportClick,
    handleToggleMobilePreview,
    isActionBusy,
  ])

  return (
    <>
      <AppShell
        theme={theme}
        shellStyle={shellStyle}
        showContentOnMobile={mobilePreviewVisible}
        sidebar={
          <div className="editor-panel p-4 sm:p-6 lg:p-8">
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFile}
            />
            <div className="stack-5">
              <div className="stack-4">
                <div>
                  <p className="brand-mark accent-text">PortifyCV</p>
                  <h1
                    className={`mt-4 max-w-[14ch] text-[clamp(1.05rem,0.95rem+0.4vw,1.35rem)] font-normal leading-[1.05] tracking-[-0.02em] ${ui.textPrimary}`}
                  >
                    Build your CV
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className={secondaryButtonClassName}
                  disabled={isActionBusy}
                  onClick={handleLoadDemo}
                >
                  Load demo CV
                </button>
                <button
                  type="button"
                  className={secondaryButtonClassName}
                  disabled={isActionBusy}
                  onClick={handleCopySummary}
                >
                  Copy summary
                </button>
                <button
                  type="button"
                  className={`${secondaryButtonClassName} ${showShortcutHelp ? ui.buttonActive : ''}`}
                  onClick={handleToggleShortcutHelp}
                >
                  {showShortcutHelp ? 'Hide shortcuts' : 'Show shortcuts'}
                </button>
                <button
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition lg:hidden ${
                    mobilePreviewVisible ? ui.buttonActive : ui.button
                  }`}
                  onClick={handleToggleMobilePreview}
                >
                  {mobilePreviewVisible ? 'Hide preview' : 'Show preview'}
                </button>
                <button
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${ui.buttonDanger}`}
                  disabled={isActionBusy}
                  onClick={handleResetForm}
                >
                  Reset form
                </button>
                <div
                  className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-medium ${ui.surfaceMuted} ${ui.textMuted}`}
                >
                  Autosave enabled
                </div>
              </div>

              <section className={`surface-shadow rounded-[var(--radius-card)] border p-4 sm:p-5 ${ui.surface}`}>
                <p className={`ds-kicker ${ui.textMuted}`}>Quick import</p>
                <p className={`mt-3 text-sm ${ui.textSecondary}`}>
                  Paste a resume snippet to detect a name, title, skills, and a short summary.
                </p>
                <textarea
                  className={`mt-4 min-h-32 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-ring)] ${ui.input}`}
                  value={pastedCvText}
                  disabled={isActionBusy}
                  onChange={(event) => setPastedCvText(event.target.value)}
                  placeholder={`Alex Morgan\nSenior Product Designer\nSkills: Figma, User Research, Design Systems`}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`}
                    disabled={isActionBusy}
                    onClick={handlePasteCvImport}
                  >
                    Paste CV text
                  </button>
                  <button
                    type="button"
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`}
                    disabled={isActionBusy}
                    onClick={handleImportClick}
                  >
                    {isImporting ? 'Importing JSON...' : 'Import JSON'}
                  </button>
                  <button
                    type="button"
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`}
                    disabled={isActionBusy}
                    onClick={handleLoadDemo}
                  >
                    Load demo CV
                  </button>
                </div>
              </section>

              <section className={`surface-shadow rounded-[var(--radius-card)] border p-4 sm:p-5 ${ui.surface}`}>
                <p className={`ds-kicker ${ui.textMuted}`}>Export mode</p>
                <p className={`mt-3 text-sm ${ui.textSecondary}`}>
                  ATS mode simplifies formatting for parsers. Leave it off for fully styled template exports.
                </p>
                <button
                  type="button"
                  className={`mt-4 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    atsFriendlyMode ? ui.buttonActive : ui.button
                  }`}
                  disabled={isActionBusy}
                  onClick={handleToggleAtsFriendlyMode}
                >
                  {atsFriendlyMode ? 'ATS mode enabled' : 'Enable ATS mode'}
                </button>
              </section>

              <AppErrorBoundary theme={theme} panelTitle="Template gallery">
                <Suspense fallback={<SurfaceFallback theme={theme} title="Loading templates" />}>
                  <TemplateGallery
                    templates={cvTemplates}
                    selectedTemplateId={selectedTemplate}
                    onSelectTemplate={handleSelectTemplate}
                    theme={theme}
                  />
                </Suspense>
              </AppErrorBoundary>

              <p className={`ds-kicker lg:hidden ${ui.textMuted}`}>
                Mobile layout stacks the form above the preview.
              </p>
              {showShortcutHelp ? (
                <section className={`rounded-2xl border p-4 ${ui.surfaceMuted}`}>
                  <p className={`ds-kicker ${ui.textMuted}`}>Keyboard shortcuts</p>
                  <ul className={`mt-3 space-y-2 text-sm ${ui.textSecondary}`}>
                    <li>Ctrl/Cmd+E: Export PDF</li>
                    <li>Ctrl/Cmd+J: Export JSON</li>
                    <li>Ctrl/Cmd+I: Open import</li>
                    <li>Ctrl/Cmd+Shift+P: Toggle preview</li>
                  </ul>
                </section>
              ) : null}
            </div>

            <CVForm
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              theme={theme}
              feedback={feedback}
              onImproveAboutText={handleImproveAboutText}
              onImproveExperienceText={handleImproveExperienceText}
            />
          </div>
        }
        content={
          <div className="preview-panel pb-28 sm:pb-6 print:p-0">
            <div className="preview-action-bar print:hidden">
              <div className="preview-action-bar__inner">
                <div className="preview-action-bar__heading">
                  <h2 className={`preview-action-bar__title mt-0 ${ui.textPrimary}`}>Preview</h2>
                </div>
                <div className="preview-action-bar__actions">
                  <button
                    type="button"
                    className={`${primaryActionButtonClassName} accent-border accent-surface accent-text-strong`}
                    disabled={isActionBusy}
                    onClick={() => handleExport('pdf-designer')}
                  >
                    {activeExport === 'pdf-designer' ? 'Exporting PDF...' : 'Export PDF'}
                  </button>
                  <button
                    type="button"
                    className={`${secondaryActionButtonClassName} ${ui.button}`}
                    disabled={isActionBusy}
                    onClick={() => handleExport('html')}
                  >
                    {activeExport === 'html' ? 'Exporting HTML...' : 'Export HTML'}
                  </button>
                  <button
                    type="button"
                    className={`${secondaryActionButtonClassName} ${ui.button}`}
                    disabled={isActionBusy}
                    onClick={() => handleExport('json')}
                  >
                    {activeExport === 'json' ? 'Exporting JSON...' : 'Export JSON'}
                  </button>
                  <button
                    type="button"
                    className={`${secondaryActionButtonClassName} ${ui.button}`}
                    disabled={isActionBusy}
                    onClick={handleCopyShareLink}
                  >
                    Copy Link
                  </button>
                  <button
                    type="button"
                    className={`${secondaryActionButtonClassName} ${showShortcutHelp ? ui.buttonActive : ui.button}`}
                    onClick={handleToggleShortcutHelp}
                  >
                    Shortcuts
                  </button>
                </div>
              </div>
            </div>

            <div className="preview-scroll px-3 pb-6 pt-4 sm:px-5 lg:px-6 print:px-0">
              <div className="mb-4 lg:hidden print:hidden">
                <div className={`surface-shadow rounded-[var(--radius-card)] border p-4 ${ui.surface}`}>
                  <p className={`ds-kicker ${ui.textMuted}`}>Preview panel</p>
                  <h2 className={`ds-section-title mt-2 font-semibold ${ui.textPrimary}`}>
                    Resume document view
                  </h2>
                  <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
                    Switch back to the editor any time or keep this view open while you polish the layout.
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
                  Back to editor
                </button>
                <CVPreview
                  formData={formData}
                  theme={theme}
                  previewRef={previewRef}
                  template={selectedTemplate}
                  atsFriendlyMode={atsFriendlyMode}
                />
              </div>

              <div className="mt-6 flex flex-col gap-5 print:hidden">
                <section className={panelSurfaceClassName}>
                  <p className={`ds-kicker ${ui.textMuted}`}>Project checklist</p>
                  <ul className={`mt-5 grid gap-3 text-sm sm:grid-cols-2 ${ui.textSecondary}`}>
                    <li className={checklistItemClassName}>
                      Required fields completed: {completedRequiredFields}/2
                    </li>
                    <li className={checklistItemClassName}>
                      Skills added: {populatedSkills}
                    </li>
                    <li className={checklistItemClassName}>
                      Experience entries started: {populatedExperience}
                    </li>
                    <li className={checklistItemClassName}>
                      Export base filename: {exportFileName}
                    </li>
                    <li className={checklistItemClassName}>
                      Active template: {currentTemplate.label}
                    </li>
                  </ul>
                </section>

                <AppErrorBoundary theme={theme} panelTitle="Smart suggestions">
                  <Suspense fallback={<SurfaceFallback theme={theme} title="Loading suggestions" />}>
                    <CVSuggestionsPanel
                      feedback={feedback}
                      theme={theme}
                      onImproveAboutText={handleImproveAboutText}
                      onImproveExperienceText={handleImproveExperienceText}
                    />
                  </Suspense>
                </AppErrorBoundary>

                <AppErrorBoundary theme={theme} panelTitle="ATS score">
                  <Suspense fallback={<SurfaceFallback theme={theme} title="Loading ATS score" />}>
                    <ATSScorePanel
                      atsScore={atsScore}
                      theme={theme}
                      atsFriendlyMode={atsFriendlyMode}
                      onToggleAtsFriendlyMode={handleToggleAtsFriendlyMode}
                      jobDescription={jobDescription}
                      onJobDescriptionChange={setJobDescription}
                      jobDescriptionAnalysis={jobDescriptionAnalysis}
                      onAddMissingKeyword={handleAddMissingKeywordToSkills}
                      onCopyMissingKeywords={handleCopyMissingKeywords}
                      onClearJobDescription={handleClearJobDescription}
                    />
                  </Suspense>
                </AppErrorBoundary>
              </div>
            </div>
          </div>
        }
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t px-3 py-3 backdrop-blur md:px-4 lg:hidden print:hidden ${ui.surfaceStrong}`}
      >
        <div className="mx-auto flex max-w-[110rem] items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            className={`${compactButtonClassName} accent-border accent-surface accent-text-strong`}
            onClick={() => handleExport('pdf-designer')}
          >
            {activeExport === 'pdf-designer' ? 'PDF...' : 'PDF'}
          </button>
          <button
            type="button"
            className={compactButtonClassName}
            onClick={() => handleExport('html')}
          >
            {activeExport === 'html' ? 'HTML...' : 'HTML'}
          </button>
          <button
            type="button"
            className={compactButtonClassName}
            onClick={() => handleExport('json')}
          >
            {activeExport === 'json' ? 'JSON...' : 'JSON'}
          </button>
          <button
            type="button"
            className={compactButtonClassName}
            onClick={handleCopyShareLink}
          >
            Link
          </button>
          <button
            type="button"
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              mobilePreviewVisible ? ui.buttonActive : ui.button
            }`}
            onClick={handleToggleMobilePreview}
          >
            {mobilePreviewVisible ? 'Editor' : 'Preview'}
          </button>
        </div>
      </div>

      <ToastStack toasts={toasts} theme={theme} />
    </>
  )
}

export default ResumeBuilderPage
