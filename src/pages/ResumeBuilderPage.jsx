import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import AppShell from '../components/AppShell'
import CVForm from '../components/CVForm'
import CVPreview from '../components/CVPreview'
import ToastStack from '../components/ToastStack'
import {
  accentOptions,
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
} from '../utils/cvForm'
import {
  cvTemplates,
  defaultTemplateId,
  getCvTemplate,
} from '../utils/cvTemplates'
import {
  createExportFileName,
  exportCvAsJson,
  exportCvAsMarkdown,
  exportCvAsPdf,
  exportCvAsText,
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
import { evaluateAtsScore } from '../utils/atsScore'

const TemplateGallery = lazy(() => import('../components/TemplateGallery'))
const CVSuggestionsPanel = lazy(() => import('../components/CVSuggestionsPanel'))
const ATSScorePanel = lazy(() => import('../components/ATSScorePanel'))

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

function loadInitialCvSession() {
  if (typeof window === 'undefined') {
    return {
      formData: initialCvData,
      theme: 'dark',
      accent: defaultAccentId,
      initialToast: null,
      clearShareParam: false,
    }
  }

  try {
    const storedDraft = window.localStorage.getItem(CV_DRAFT_STORAGE_KEY)
    const hasSeenOnboarding =
      window.localStorage.getItem(CV_ONBOARDING_SEEN_STORAGE_KEY) === 'true'
    const storedTheme = window.localStorage.getItem(UI_THEME_STORAGE_KEY)
    const storedAccent = window.localStorage.getItem(UI_ACCENT_STORAGE_KEY)
    const nextTheme = storedTheme === 'light' ? 'light' : 'dark'
    const nextAccent = getAccentOption(storedAccent).id
    const markOnboardingSeen = () => {
      window.localStorage.setItem(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
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
        }
      }

      return {
        formData: initialCvData,
        theme: nextTheme,
        accent: nextAccent,
        initialToast: null,
        clearShareParam: false,
      }
    }

    markOnboardingSeen()

    return {
      formData: parseImportedCvData(JSON.parse(storedDraft)),
      theme: nextTheme,
      accent: nextAccent,
      initialToast: createToast('Restored your saved draft.', 'success'),
      clearShareParam: false,
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Saved draft was invalid and has been cleared.'
    const shouldClearShareParam =
      error instanceof Error && error.message.startsWith('Shared CV link')

    if (!shouldClearShareParam) {
      window.localStorage.removeItem(CV_DRAFT_STORAGE_KEY)
    }

    return {
      formData: createInitialCvData(),
      theme: window.localStorage.getItem(UI_THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark',
      accent: getAccentOption(window.localStorage.getItem(UI_ACCENT_STORAGE_KEY)).id,
      initialToast: createToast(message, 'error'),
      clearShareParam: shouldClearShareParam,
    }
  }
}

function ResumeBuilderPage() {
  const initialSession = useMemo(() => loadInitialCvSession(), [])
  const [formData, setFormData] = useState(initialSession.formData)
  const [theme, setTheme] = useState(initialSession.theme)
  const [accent, setAccent] = useState(initialSession.accent)
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplateId)
  const [atsFriendlyMode, setAtsFriendlyMode] = useState(false)
  const [mobilePreviewVisible, setMobilePreviewVisible] = useState(false)
  const [activeExport, setActiveExport] = useState('')
  const [pastedCvText, setPastedCvText] = useState('')
  const [toasts, setToasts] = useState(
    initialSession.initialToast ? [initialSession.initialToast] : [],
  )
  const ui = getUiTheme(theme)
  const isDark = ui.isDark
  const previewRef = useRef(null)
  const importInputRef = useRef(null)
  const toastTimeoutsRef = useRef(new Map())

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
  const showToast = (message, type = 'success') => {
    const nextToast = createToast(message, type)

    setToasts((current) => [...current, nextToast])

    const timeoutId = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== nextToast.id))
      toastTimeoutsRef.current.delete(nextToast.id)
    }, 2800)

    toastTimeoutsRef.current.set(nextToast.id, timeoutId)
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(CV_DRAFT_STORAGE_KEY, JSON.stringify(formData))
    }, 180)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [formData])

  useEffect(() => {
    window.localStorage.setItem(UI_THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem(UI_ACCENT_STORAGE_KEY, accent)
  }, [accent])

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

  const handleExport = useCallback(async (type) => {
    setActiveExport(type)

    try {
      if (type === 'pdf-designer') {
        await exportCvAsPdf(previewRef.current, exportFileName, { mode: 'designer' })
      }

      if (type === 'pdf-ats') {
        await exportCvAsPdf(previewRef.current, exportFileName, { mode: 'ats' })
      }

      if (type === 'json') {
        exportCvAsJson(formData, exportFileName)
      }

      if (type === 'markdown') {
        exportCvAsMarkdown(formData, exportFileName)
      }

      if (type === 'txt') {
        exportCvAsText(formData, exportFileName)
      }

      showToast(
        `${
          type === 'pdf-designer'
            ? 'Designer PDF'
            : type === 'pdf-ats'
              ? 'ATS PDF'
              : type.toUpperCase()
        } export downloaded.`,
      )
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : `Failed to export ${
              type === 'pdf-designer'
                ? 'Designer PDF'
                : type === 'pdf-ats'
                  ? 'ATS PDF'
                  : type.toUpperCase()
            }.`,
        'error',
      )
    } finally {
      setActiveExport('')
    }
  }, [exportFileName, formData, previewRef])

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleImportFile = useCallback(async (event) => {
    const [file] = event.target.files ?? []

    if (!file) {
      return
    }

    try {
      const fileText = await file.text()
      const parsedValue = JSON.parse(fileText)
      const importedData = parseImportedCvData(parsedValue)

      setFormData(importedData)
      window.localStorage.setItem(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
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
      event.target.value = ''
    }
  }, [])

  const handleResetForm = useCallback(() => {
    setFormData(createInitialCvData())
    window.localStorage.removeItem(CV_DRAFT_STORAGE_KEY)
    showToast('Form reset to a blank CV.')
  }, [])

  const handleLoadDemo = useCallback(() => {
    setFormData(structuredClone(demoCvData))
    window.localStorage.setItem(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
    showToast('Demo CV loaded.')
  }, [])

  const handlePasteCvImport = useCallback(() => {
    try {
      const parsedData = parsePastedCvText(pastedCvText)

      setFormData((current) => ({
        ...current,
        ...parsedData,
      }))
      setPastedCvText('')
      window.localStorage.setItem(CV_ONBOARDING_SEEN_STORAGE_KEY, 'true')
      showToast('Pasted CV text imported.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to parse pasted CV text.', 'error')
    }
  }, [pastedCvText])

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
    setSelectedTemplate(templateId)
  }, [])

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
                  <p className="ds-kicker accent-text">PortifyCV</p>
                  <h1
                    className={`mt-4 max-w-[14ch] text-[clamp(2rem,1.55rem+1.55vw,3.25rem)] font-semibold leading-[0.96] tracking-[-0.04em] ${ui.textPrimary}`}
                  >
                    Build your portfolio-ready CV
                  </h1>
                </div>
                <div className={`hidden w-fit rounded-full border p-1 sm:flex ${ui.surfaceMuted}`}>
                  {['dark', 'light'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                        theme === mode ? ui.buttonActive : ui.button
                      }`}
                      onClick={() => setTheme(mode)}
                    >
                      {mode === 'dark' ? 'Dark' : 'Light'}
                    </button>
                  ))}
                </div>
              </div>

              <p className={`ds-body max-w-xl ${ui.textSecondary}`}>
                Starter workspace for collecting candidate details, shaping project
                highlights, and preparing a polished export experience.
              </p>

              <div className="flex flex-wrap gap-3">
                <div className={`flex rounded-full border p-1 sm:hidden ${ui.surfaceMuted}`}>
                  {['dark', 'light'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                        theme === mode ? ui.buttonActive : ui.button
                      }`}
                      onClick={() => setTheme(mode)}
                    >
                      {mode === 'dark' ? 'Dark' : 'Light'}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className={secondaryButtonClassName}
                  onClick={handleLoadDemo}
                >
                  Load demo CV
                </button>
                <button
                  type="button"
                  className={secondaryButtonClassName}
                  onClick={handleCopySummary}
                >
                  Copy summary
                </button>
                <button
                  type="button"
                  className={secondaryButtonClassName}
                  onClick={handleCopyShareLink}
                >
                  Copy share link
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
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isDark
                      ? 'border-rose-400/20 bg-rose-400/10 text-rose-100 hover:border-rose-300/50'
                      : 'border-rose-300 bg-rose-50 text-rose-700 hover:border-rose-400'
                  }`}
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
                  onChange={(event) => setPastedCvText(event.target.value)}
                  placeholder={`Alex Morgan\nSenior Product Designer\nSkills: Figma, User Research, Design Systems`}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`}
                    onClick={handlePasteCvImport}
                  >
                    Paste CV text
                  </button>
                  <button
                    type="button"
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`}
                    onClick={handleImportClick}
                  >
                    Import JSON
                  </button>
                  <button
                    type="button"
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`}
                    onClick={handleLoadDemo}
                  >
                    Load demo CV
                  </button>
                </div>
              </section>

              <section className={`surface-shadow rounded-[var(--radius-card)] border p-4 sm:p-5 ${ui.surface}`}>
                <p className={`ds-kicker ${ui.textMuted}`}>Theme settings</p>
                <div className="mt-4">
                  <p className={`text-sm font-medium ${ui.textSoft}`}>Accent color</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {accentOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                          accent === option.id ? ui.buttonActive : ui.button
                        }`}
                        onClick={() => setAccent(option.id)}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${option.swatchClassName}`}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-5">
                  <p className={`text-sm font-medium ${ui.textSoft}`}>ATS-friendly mode</p>
                  <button
                    type="button"
                    className={`mt-3 rounded-full border px-4 py-2 text-sm font-medium transition ${
                      atsFriendlyMode ? ui.buttonActive : ui.button
                    }`}
                    onClick={handleToggleAtsFriendlyMode}
                  >
                    {atsFriendlyMode ? 'ATS mode enabled' : 'Enable ATS mode'}
                  </button>
                </div>
              </section>

              <Suspense fallback={<SurfaceFallback theme={theme} title="Loading templates" />}>
                <TemplateGallery
                  templates={cvTemplates}
                  selectedTemplateId={selectedTemplate}
                  onSelectTemplate={handleSelectTemplate}
                  theme={theme}
                />
              </Suspense>

              <p className={`ds-kicker lg:hidden ${ui.textMuted}`}>
                Mobile layout stacks the form above the preview.
              </p>
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
                  <p className={`ds-kicker ${ui.textMuted}`}>Live Preview</p>
                  <h2 className={`preview-action-bar__title ${ui.textPrimary}`}>
                    Resume preview
                  </h2>
                </div>
                <div className="preview-action-bar__actions">
                  <button
                    type="button"
                    className={`${primaryActionButtonClassName} accent-border accent-surface accent-text-strong`}
                    onClick={() => handleExport('pdf-designer')}
                  >
                    {activeExport === 'pdf-designer' ? 'Exporting PDF...' : 'Export PDF'}
                  </button>
                  <button
                    type="button"
                    className={`${secondaryActionButtonClassName} ${ui.button}`}
                    onClick={() => handleExport('json')}
                  >
                    {activeExport === 'json' ? 'Exporting JSON...' : 'Export JSON'}
                  </button>
                  <button
                    type="button"
                    className={`${secondaryActionButtonClassName} ${ui.button}`}
                    onClick={handleCopyShareLink}
                  >
                    Copy Link
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
                    <li className={checklistItemClassName}>
                      Theme mode: {isDark ? 'Dark' : 'Light'}
                    </li>
                    <li className={checklistItemClassName}>
                      Accent color: {getAccentOption(accent).label}
                    </li>
                  </ul>
                </section>

                <Suspense fallback={<SurfaceFallback theme={theme} title="Loading suggestions" />}>
                  <CVSuggestionsPanel
                    feedback={feedback}
                    theme={theme}
                    onImproveAboutText={handleImproveAboutText}
                    onImproveExperienceText={handleImproveExperienceText}
                  />
                </Suspense>

                <Suspense fallback={<SurfaceFallback theme={theme} title="Loading ATS score" />}>
                  <ATSScorePanel
                    atsScore={atsScore}
                    theme={theme}
                    atsFriendlyMode={atsFriendlyMode}
                    onToggleAtsFriendlyMode={handleToggleAtsFriendlyMode}
                  />
                </Suspense>
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
