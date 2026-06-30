import { safeStorageGet } from '../utils/cvForm'
import { defaultTemplateId } from '../utils/cvTemplates'

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
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] }

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) }

    case 'SET_ACTIVE_EXPORT':
      return { ...state, activeExport: action.value }

    case 'SET_IMPORTING':
      return { ...state, isImporting: action.value }

    case 'TOGGLE_ATS_MODE':
      return { ...state, atsFriendlyMode: !state.atsFriendlyMode }

    case 'TOGGLE_MOBILE_PREVIEW':
      return { ...state, mobilePreviewVisible: !state.mobilePreviewVisible }

    case 'SET_SELECTED_TEMPLATE':
      return { ...state, selectedTemplate: action.templateId }

    case 'SET_LOCALE':
      return { ...state, locale: action.locale }

    case 'SET_PASTED_CV_TEXT':
      return { ...state, pastedCvText: action.value }

    default:
      return state
  }
}
