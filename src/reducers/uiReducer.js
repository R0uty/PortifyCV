import { CV_SESSION_RESTORE_ENABLED_STORAGE_KEY, safeStorageGet } from '../utils/cvForm'
import { defaultTemplateId, getAllTemplateAccents, isValidTemplateId } from '../utils/cvTemplates'
import { UI_LOCALE_STORAGE_KEY, UI_NAV_RAIL_COLLAPSED_STORAGE_KEY, UI_BUILDER_MODE_STORAGE_KEY } from '../utils/designSystem'
import { DEFAULT_CV_FONT_ID } from '../utils/cvFonts'
import { DEFAULT_CV_HEADING_COLOR } from '../utils/cvHeadingColors'
import { TEMPLATE_VARIANTS, getTemplateVariant, resolveStyleVariantId } from '../utils/templateVariants'

export const UI_ACTION = {
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  SET_ACTIVE_EXPORT: 'SET_ACTIVE_EXPORT',
  SET_IMPORTING: 'SET_IMPORTING',
  TOGGLE_ATS_MODE: 'TOGGLE_ATS_MODE',
  TOGGLE_MOBILE_PREVIEW: 'TOGGLE_MOBILE_PREVIEW',
  SET_SELECTED_TEMPLATE: 'SET_SELECTED_TEMPLATE',
  SET_LOCALE: 'SET_LOCALE',
  SET_PASTED_CV_TEXT: 'SET_PASTED_CV_TEXT',
  SET_JOB_DESCRIPTION: 'SET_JOB_DESCRIPTION',
  SET_COVER_LETTER_COMPANY: 'SET_COVER_LETTER_COMPANY',
  SET_COVER_LETTER_ROLE: 'SET_COVER_LETTER_ROLE',
  SET_COVER_LETTER_HIRING_MANAGER: 'SET_COVER_LETTER_HIRING_MANAGER',
  SET_COVER_LETTER_BODY: 'SET_COVER_LETTER_BODY',
  TOGGLE_SESSION_RESTORE: 'TOGGLE_SESSION_RESTORE',
  SET_TEMPLATE_ACCENT_COLOR: 'SET_TEMPLATE_ACCENT_COLOR',
  SET_CV_FONT: 'SET_CV_FONT',
  SET_CV_HEADING_COLOR: 'SET_CV_HEADING_COLOR',
  TOGGLE_NAV_RAIL_COLLAPSED: 'TOGGLE_NAV_RAIL_COLLAPSED',
  SET_CLASSIC_NAME_ALIGNMENT: 'SET_CLASSIC_NAME_ALIGNMENT',
  SET_BUILDER_MODE: 'SET_BUILDER_MODE',
  APPLY_STYLE_VARIANT_LOOK: 'APPLY_STYLE_VARIANT_LOOK',
  APPLY_STORED_STYLE_LOOKS: 'APPLY_STORED_STYLE_LOOKS',
  RESTORE_TEMPLATE_LOOK: 'RESTORE_TEMPLATE_LOOK',
}

// Retired template ids that map onto a surviving template, so an old
// `?template=` deep link or bookmark still opens something sensible.
// `classic` merged into `classicProfessional` (v1.2.10) — its distinguishing
// left-aligned name lives on as the `classicNameAlignment` option.
const LEGACY_TEMPLATE_ALIASES = { classic: 'classicProfessional' }

// A template id from outside — a `?template=<id>` deep link (e.g. "Use this
// template" on the Free CV Templates page) or a share link's 'tp' (1.6.8) —
// trusted only once checked against the real template map, after mapping a
// retired id onto its successor. Null for anything unrecognized.
export function resolveTemplateId(raw) {
  const templateId = LEGACY_TEMPLATE_ALIASES[raw] ?? raw
  return isValidTemplateId(templateId) ? templateId : null
}

// ?template=<id> opens the builder on that template; an unrecognized or
// missing id falls back to defaultTemplateId exactly like before.
export function readInitialTemplateId() {
  if (typeof window === 'undefined') {
    return defaultTemplateId
  }

  return resolveTemplateId(new URLSearchParams(window.location.search).get('template')) ?? defaultTemplateId
}

// Whether a legacy `?template=classic` link should also start left-aligned.
function readInitialClassicNameAlignment() {
  if (typeof window === 'undefined') return 'center'
  return new URLSearchParams(window.location.search).get('template') === 'classic'
    ? 'left'
    : 'center'
}

// A style variant's look: its accent (for a template that has one), font
// and headings colour. Applied when a variant is picked and when a CV
// carrying a stored variant is loaded; the user's later tweaks stay
// tab-only, as before variants existed.
function applyStyleVariantLook(state, templateId, variant) {
  if (!variant) {
    return state
  }

  return {
    ...state,
    templateAccentColors: variant.accent
      ? { ...state.templateAccentColors, [templateId]: variant.accent }
      : state.templateAccentColors,
    cvFontId: variant.fontId,
    cvHeadingColor: variant.headingColor,
  }
}

// The looks a whole CV stores (share link, session restore, JSON import,
// ?example=, Load demo CV, Clear CV): every template in `templateIds`
// (default: all) gets its stored variant's accent — variant #1's, the
// registry default, when nothing is stored — and, when the selected
// template is among them, its variant's font and headings colour, which
// are global (spec §4). Undo/redo pass only the templates whose stored
// variant changed, so other templates' tab-only accent tweaks survive.
export function applyStoredLooks(state, formData, selectedTemplate, templateIds = Object.keys(TEMPLATE_VARIANTS)) {
  const templateAccentColors = { ...state.templateAccentColors }
  templateIds.forEach((templateId) => {
    const accent = getTemplateVariant(templateId, resolveStyleVariantId(formData, templateId))?.accent
    if (accent) {
      templateAccentColors[templateId] = accent
    }
  })

  const next = { ...state, templateAccentColors }
  const selected = templateIds.includes(selectedTemplate)
    ? getTemplateVariant(selectedTemplate, resolveStyleVariantId(formData, selectedTemplate))
    : null
  return selected
    ? { ...next, cvFontId: selected.fontId, cvHeadingColor: selected.headingColor }
    : next
}

// The part of the UI state a template-gallery Use replaces: the template
// and the tab-only accent, font and headings colour. ResumeBuilderPage
// keeps it on that Use's undo step, so Undo/Redo can put it back exactly,
// Modified tweaks included (RESTORE_TEMPLATE_LOOK).
export function pickTemplateLook(state) {
  return {
    selectedTemplate: state.selectedTemplate,
    templateAccentColors: state.templateAccentColors,
    cvFontId: state.cvFontId,
    cvHeadingColor: state.cvHeadingColor,
  }
}

export function createInitialUiState(initialSession) {
  const storedLocale = safeStorageGet(UI_LOCALE_STORAGE_KEY).value
  const storedSessionRestore = safeStorageGet(CV_SESSION_RESTORE_ENABLED_STORAGE_KEY, 'false').value
  const storedNavRailCollapsed = safeStorageGet(UI_NAV_RAIL_COLLAPSED_STORAGE_KEY, 'false').value
  const storedBuilderMode = safeStorageGet(UI_BUILDER_MODE_STORAGE_KEY, 'direct').value

  const state = {
    // A share link opens on the sender's template (1.6.8), ahead of a
    // ?template= in the same URL; otherwise ?template=, then the default.
    selectedTemplate: resolveTemplateId(initialSession?.sharedTemplateId) ?? readInitialTemplateId(),
    atsFriendlyMode: false,
    locale: storedLocale === 'fi' ? 'fi' : 'en',
    mobilePreviewVisible: false,
    activeExport: '',
    isImporting: false,
    pastedCvText: '',
    jobDescription: '',
    coverLetterCompany: '',
    coverLetterRole: '',
    coverLetterHiringManager: '',
    coverLetterBody: '',
    sessionRestoreEnabled: storedSessionRestore === 'true',
    templateAccentColors: getAllTemplateAccents(),
    cvFontId: DEFAULT_CV_FONT_ID,
    cvHeadingColor: DEFAULT_CV_HEADING_COLOR,
    classicNameAlignment: readInitialClassicNameAlignment(),
    navRailCollapsed: storedNavRailCollapsed === 'true',
    builderMode: storedBuilderMode === 'classic' ? 'classic' : 'direct',
    toasts: initialSession.initialToast ? [initialSession.initialToast] : [],
  }

  // A share link or restored session opens in its stored looks.
  return applyStoredLooks(state, initialSession?.formData, state.selectedTemplate)
}

export function uiReducer(state, action) {
  switch (action.type) {
    case UI_ACTION.APPLY_STYLE_VARIANT_LOOK:
      return applyStyleVariantLook(state, action.templateId, action.variant)

    case UI_ACTION.APPLY_STORED_STYLE_LOOKS:
      return applyStoredLooks(state, action.formData, action.templateId, action.templateIds)

    case UI_ACTION.RESTORE_TEMPLATE_LOOK:
      return action.look ? { ...state, ...pickTemplateLook(action.look) } : state

    case UI_ACTION.ADD_TOAST:
      return { ...state, toasts: [...state.toasts, action.toast] }

    case UI_ACTION.REMOVE_TOAST:
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) }

    case UI_ACTION.SET_ACTIVE_EXPORT:
      return { ...state, activeExport: action.value }

    case UI_ACTION.SET_IMPORTING:
      return { ...state, isImporting: action.value }

    case UI_ACTION.TOGGLE_ATS_MODE:
      return { ...state, atsFriendlyMode: !state.atsFriendlyMode }

    case UI_ACTION.TOGGLE_MOBILE_PREVIEW:
      return { ...state, mobilePreviewVisible: !state.mobilePreviewVisible }

    case UI_ACTION.SET_SELECTED_TEMPLATE:
      return { ...state, selectedTemplate: action.templateId }

    case UI_ACTION.SET_LOCALE:
      return { ...state, locale: action.locale }

    case UI_ACTION.SET_PASTED_CV_TEXT:
      return { ...state, pastedCvText: action.value }

    case UI_ACTION.SET_JOB_DESCRIPTION:
      return { ...state, jobDescription: action.value }

    case UI_ACTION.SET_COVER_LETTER_COMPANY:
      return { ...state, coverLetterCompany: action.value }

    case UI_ACTION.SET_COVER_LETTER_ROLE:
      return { ...state, coverLetterRole: action.value }

    case UI_ACTION.SET_COVER_LETTER_HIRING_MANAGER:
      return { ...state, coverLetterHiringManager: action.value }

    case UI_ACTION.SET_COVER_LETTER_BODY:
      return { ...state, coverLetterBody: action.value }

    case UI_ACTION.TOGGLE_SESSION_RESTORE:
      return { ...state, sessionRestoreEnabled: !state.sessionRestoreEnabled }

    case UI_ACTION.SET_TEMPLATE_ACCENT_COLOR:
      return {
        ...state,
        templateAccentColors: {
          ...state.templateAccentColors,
          [action.templateId]: action.color,
        },
      }

    case UI_ACTION.SET_CV_FONT:
      return { ...state, cvFontId: action.fontId }

    case UI_ACTION.SET_CV_HEADING_COLOR:
      return { ...state, cvHeadingColor: action.color }

    case UI_ACTION.TOGGLE_NAV_RAIL_COLLAPSED:
      return { ...state, navRailCollapsed: !state.navRailCollapsed }

    case UI_ACTION.SET_CLASSIC_NAME_ALIGNMENT:
      return { ...state, classicNameAlignment: action.alignment === 'left' ? 'left' : 'center' }

    case UI_ACTION.SET_BUILDER_MODE:
      return { ...state, builderMode: action.mode === 'direct' ? 'direct' : 'classic' }

    default:
      return state
  }
}
