export const UI_THEME_STORAGE_KEY = 'portifycv-ui-theme'
export const UI_ACCENT_STORAGE_KEY = 'portifycv-ui-accent'
export const defaultAccentId = 'monochrome'

const accentThemeMap = {
  monochrome: {
    id: 'monochrome',
    label: 'Silver',
    swatchClassName: 'from-gray-500 to-gray-300',
    dark: {
      solid: '#d4d4d8',
      text: '#e5e7eb',
      textStrong: '#f8fafc',
      border: 'rgba(212, 212, 216, 0.28)',
      soft: 'rgba(212, 212, 216, 0.1)',
      softStrong: 'rgba(212, 212, 216, 0.18)',
      ring: 'rgba(226, 232, 240, 0.24)',
      glow: 'rgba(255, 255, 255, 0.12)',
    },
    light: {
      solid: '#52525b',
      text: '#52525b',
      textStrong: '#111827',
      border: 'rgba(82, 82, 91, 0.2)',
      soft: 'rgba(82, 82, 91, 0.06)',
      softStrong: 'rgba(82, 82, 91, 0.12)',
      ring: 'rgba(82, 82, 91, 0.18)',
      glow: 'rgba(17, 24, 39, 0.1)',
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
      ? 'border-white/12 bg-black'
      : 'border-black/10 bg-white',
    sidebar: isDark
      ? 'border-white/12 bg-black'
      : 'border-black/10 bg-white',
    main: isDark ? 'bg-black' : 'bg-white',
    surface: isDark
      ? 'border-white/12 bg-black/70'
      : 'border-black/10 bg-white',
    surfaceMuted: isDark
      ? 'border-white/12 bg-white/6'
      : 'border-black/10 bg-gray-50',
    surfaceStrong: isDark
      ? 'border-white/12 bg-black'
      : 'border-black/10 bg-white',
    button: isDark
      ? 'border-white/12 bg-white/6 text-gray-100 hover:bg-white/8'
      : 'border-black/10 bg-white text-gray-800 hover:bg-gray-50',
    buttonActive:
      'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-text-strong)]',
    buttonDanger: isDark
      ? 'border-white/12 bg-white/6 text-gray-100 hover:bg-white/8'
      : 'border-black/10 bg-white text-gray-800 hover:bg-gray-50',
    input: isDark
      ? 'border-white/12 bg-black/70 text-white placeholder:text-gray-500'
      : 'border-black/10 bg-white text-black placeholder:text-gray-500',
    inputShell: isDark
      ? 'border-white/12 bg-black/70'
      : 'border-black/10 bg-white',
    textPrimary: isDark ? 'text-white' : 'text-black',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-700',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    textSoft: isDark ? 'text-gray-300' : 'text-gray-800',
    toastOffset: 'bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-4',
  }
}
