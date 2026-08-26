import { CV_SESSION_RESTORE_ENABLED_STORAGE_KEY, safeStorageGet } from '../utils/cvForm'
import { defaultTemplateId, isValidTemplateId } from '../utils/cvTemplates'
import { UI_LOCALE_STORAGE_KEY } from '../utils/designSystem'
// Imported from the plain config object, not TimelineShowcase.jsx itself —
// that component is React.lazy()-loaded (see CVPreview.jsx / item 25's
// code-splitting), and a reducer importing it directly would pull it into
// the eager bundle, defeating the split. timeline.js is cheap and already
// imported eagerly everywhere via components/templates/index.js.
import { TIMELINE_DEFAULT_ACCENT_COLOR } from '../components/templates/timeline'
import { MODERN_ORANGE_DEFAULT_ACCENT_COLOR } from '../components/templates/modernOrange'
import { DEFAULT_CV_FONT_ID } from '../utils/cvFonts'

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
  SET_TIMELINE_ACCENT_COLOR: 'SET_TIMELINE_ACCENT_COLOR',
  SET_MODERN_ORANGE_ACCENT_COLOR: 'SET_MODERN_ORANGE_ACCENT_COLOR',
  SET_CV_FONT: 'SET_CV_FONT',
}

// A "Use this template" link from the Free CV Templates page (or any other
// deep link) can pass ?template=<id> to open the builder with that template
// already selected instead of always landing on the default. Only trusted
// once the id is checked against the real template map - an unrecognized or
// missing id falls back to defaultTemplateId exactly like before.
function readInitialTemplateId() {
  if (typeof window === 'undefined') {
    return defaultTemplateId
  }

  const requestedTemplateId = new URLSearchParams(window.location.search).get('template')
  return isValidTemplateId(requestedTemplateId) ? requestedTemplateId : defaultTemplateId
}

export function createInitialUiState(initialSession) {
  const storedLocale = safeStorageGet(UI_LOCALE_STORAGE_KEY).value
  const storedSessionRestore = safeStorageGet(CV_SESSION_RESTORE_ENABLED_STORAGE_KEY, 'false').value

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
    timelineAccentColor: TIMELINE_DEFAULT_ACCENT_COLOR,
    modernOrangeAccentColor: MODERN_ORANGE_DEFAULT_ACCENT_COLOR,
    cvFontId: DEFAULT_CV_FONT_ID,
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

    case UI_ACTION.SET_TIMELINE_ACCENT_COLOR:
      return { ...state, timelineAccentColor: action.color }

    case UI_ACTION.SET_MODERN_ORANGE_ACCENT_COLOR:
      return { ...state, modernOrangeAccentColor: action.color }

    case UI_ACTION.SET_CV_FONT:
      return { ...state, cvFontId: action.fontId }

    default:
      return state
  }
}
