export const UI_ACCENT_STORAGE_KEY = 'portifycv-ui-accent'
export const UI_LOCALE_STORAGE_KEY = 'ui-locale'
export const UI_NAV_RAIL_COLLAPSED_STORAGE_KEY = 'portifycv-nav-rail-collapsed'
export const UI_BUILDER_MODE_STORAGE_KEY = 'portifycv-builder-mode'
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
  }
}
