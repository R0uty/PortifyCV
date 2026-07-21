export const UI_THEME_STORAGE_KEY = 'portifycv-ui-theme'
export const UI_ACCENT_STORAGE_KEY = 'portifycv-ui-accent'
export const UI_LOCALE_STORAGE_KEY = 'ui-locale'
export const defaultAccentId = 'monochrome'

export const accentOptions = []

export function getAccentOption() {
  return { id: 'monochrome', dark: {}, light: {} }
}

export function getAccentThemeStyles() {
  return {}
}

export function getUiTheme() {
  return {
    isDark: false,
    pageText: 'text-gray-900',
    shell: 'bg-gray-50',
    sidebar: 'bg-gray-50',
    main: 'bg-gray-50',
    surface: 'bg-white',
    surfaceMuted: 'bg-gray-50',
    surfaceStrong: 'bg-gray-50',
    button: 'bg-transparent text-black hover:bg-black/5',
    buttonActive: 'bg-black text-white',
    buttonDanger: 'bg-transparent text-black hover:bg-red-500/10',
    input: 'bg-transparent text-black placeholder:text-gray-500',
    inputShell: 'bg-gray-50',
    textPrimary: 'text-black',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    textSoft: 'text-gray-800',
    toastOffset: 'bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-4',
  }
}
