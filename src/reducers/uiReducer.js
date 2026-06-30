import { safeStorageGet } from '../utils/cvForm'
import { defaultTemplateId } from '../utils/cvTemplates'

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
}

const UI_LOCALE_STORAGE_KEY = 'ui-locale'

export function createInitialUiState(initialSession) {
  const storedLocale = safeStorageGet(UI_LOCALE_STORAGE_KEY).value

  return {
    selectedTemplate: defaultTemplateId,
    atsFriendlyMode: false,
    locale: storedLocale === 'fi' ? 'fi' : 'en',
    mobilePreviewVisible: false,
    activeExport: '',
    isImporting: false,
    pastedCvText: '',
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

    default:
      return state
  }
}
