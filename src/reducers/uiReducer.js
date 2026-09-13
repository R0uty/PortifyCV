import { CV_SESSION_RESTORE_ENABLED_STORAGE_KEY, safeStorageGet } from '../utils/cvForm'
import { defaultTemplateId, getAllTemplateAccents, isValidTemplateId } from '../utils/cvTemplates'
import { UI_LOCALE_STORAGE_KEY, UI_NAV_RAIL_COLLAPSED_STORAGE_KEY, UI_BUILDER_MODE_STORAGE_KEY } from '../utils/designSystem'
import { DEFAULT_CV_FONT_ID } from '../utils/cvFonts'
import { DEFAULT_CV_HEADING_COLOR } from '../utils/cvHeadingColors'

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
}

// Retired template ids that map onto a surviving template, so an old
// `?template=` deep link or bookmark still opens something sensible.
// `classic` merged into `classicProfessional` (v1.2.10) — its distinguishing
// left-aligned name lives on as the `classicNameAlignment` option.
const LEGACY_TEMPLATE_ALIASES = { classic: 'classicProfessional' }

// A "Use this template" link from the Free CV Templates page (or any other
// deep link) can pass ?template=<id> to open the builder with that template
// already selected instead of always landing on the default. Only trusted
// once the id is checked against the real template map - an unrecognized or
// missing id falls back to defaultTemplateId exactly like before.
function readInitialTemplateId() {
  if (typeof window === 'undefined') {
    return defaultTemplateId
  }

  const raw = new URLSearchParams(window.location.search).get('template')
  const requestedTemplateId = LEGACY_TEMPLATE_ALIASES[raw] ?? raw
  return isValidTemplateId(requestedTemplateId) ? requestedTemplateId : defaultTemplateId
}

// Whether a legacy `?template=classic` link should also start left-aligned.
function readInitialClassicNameAlignment() {
  if (typeof window === 'undefined') return 'center'
  return new URLSearchParams(window.location.search).get('template') === 'classic'
    ? 'left'
    : 'center'
}

export function createInitialUiState(initialSession) {
  const storedLocale = safeStorageGet(UI_LOCALE_STORAGE_KEY).value
  const storedSessionRestore = safeStorageGet(CV_SESSION_RESTORE_ENABLED_STORAGE_KEY, 'false').value
  const storedNavRailCollapsed = safeStorageGet(UI_NAV_RAIL_COLLAPSED_STORAGE_KEY, 'false').value
  const storedBuilderMode = safeStorageGet(UI_BUILDER_MODE_STORAGE_KEY, 'classic').value

  return {
    selectedTemplate: readInitialTemplateId(),
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
    builderMode: storedBuilderMode === 'direct' ? 'direct' : 'classic',
    toasts: initialSession.initialToast ? [initialSession.initialToast] : [],
  }
}

export function uiReducer(state, action) {
  switch (action.type) {
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
