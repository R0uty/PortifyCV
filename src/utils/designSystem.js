export const UI_THEME_STORAGE_KEY = 'portifycv-ui-theme'
export const UI_ACCENT_STORAGE_KEY = 'portifycv-ui-accent'
export const defaultAccentId = 'indigo'

const accentThemeMap = {
  indigo: {
    id: 'indigo',
    label: 'Indigo',
    swatchClassName: 'from-indigo-600 to-indigo-500',
    dark: {
      solid: '#6366f1',
      text: '#c7d2fe',
      textStrong: '#e0e7ff',
      border: 'rgba(99, 102, 241, 0.34)',
      soft: 'rgba(99, 102, 241, 0.14)',
      softStrong: 'rgba(99, 102, 241, 0.2)',
      ring: 'rgba(99, 102, 241, 0.24)',
      glow: 'rgba(99, 102, 241, 0.18)',
    },
    light: {
      solid: '#4f46e5',
      text: '#4338ca',
      textStrong: '#3730a3',
      border: 'rgba(79, 70, 229, 0.28)',
      soft: 'rgba(79, 70, 229, 0.08)',
      softStrong: 'rgba(79, 70, 229, 0.14)',
      ring: 'rgba(79, 70, 229, 0.22)',
      glow: 'rgba(79, 70, 229, 0.1)',
    },
  },
}

export const accentOptions = Object.values(accentThemeMap)

export function getAccentOption(accentId) {
  return accentThemeMap[accentId] ?? accentThemeMap[defaultAccentId]
}

export function getAccentThemeStyles(theme, accentId) {
  const palette = getAccentOption(accentId)[theme === 'dark' ? 'dark' : 'light']

  return {
    '--accent-solid': palette.solid,
    '--accent-text': palette.text,
    '--accent-text-strong': palette.textStrong,
    '--accent-border': palette.border,
    '--accent-soft': palette.soft,
    '--accent-soft-strong': palette.softStrong,
    '--accent-ring': palette.ring,
    '--accent-glow': palette.glow,
  }
}

export function getUiTheme(theme = 'dark') {
  const isDark = theme === 'dark'

  return {
    isDark,
    pageText: isDark ? 'text-gray-100' : 'text-gray-900',
    shell: isDark
      ? 'border-gray-700 bg-black'
      : 'border-[#E5E7EB] bg-white',
    sidebar: isDark
      ? 'border-gray-700 bg-black'
      : 'border-[#E5E7EB] bg-white',
    main: isDark ? 'bg-black' : 'bg-white',
    surface: isDark
      ? 'border-gray-700 bg-black'
      : 'border-[#E5E7EB] bg-white',
    surfaceMuted: isDark
      ? 'border-gray-700 bg-gray-900'
      : 'border-[#E5E7EB] bg-gray-50',
    surfaceStrong: isDark
      ? 'border-gray-700 bg-black'
      : 'border-[#E5E7EB] bg-white',
    button: isDark
      ? 'border-gray-600 bg-gray-900 text-gray-100 hover:bg-gray-800'
      : 'border-[#E5E7EB] bg-white text-gray-800 hover:bg-gray-50',
    buttonActive:
      'border-indigo-300 bg-indigo-50 text-indigo-700',
    buttonDanger: isDark
      ? 'border-gray-600 bg-gray-900 text-gray-100 hover:bg-gray-800'
      : 'border-[#E5E7EB] bg-white text-gray-800 hover:bg-gray-50',
    input: isDark
      ? 'border-gray-600 bg-black text-white placeholder:text-gray-500'
      : 'border-[#E5E7EB] bg-white text-black placeholder:text-gray-500',
    inputShell: isDark
      ? 'border-gray-600 bg-black'
      : 'border-[#E5E7EB] bg-white',
    textPrimary: isDark ? 'text-white' : 'text-black',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-700',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    textSoft: isDark ? 'text-gray-300' : 'text-gray-800',
    toastOffset: 'bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-4',
  }
}
