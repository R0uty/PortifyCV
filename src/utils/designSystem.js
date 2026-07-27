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

const THEME_PREFERENCES = ['light', 'dark', 'system']

// Reads the user's stored theme preference ('light' | 'dark' | 'system'),
// defaulting to 'system' when nothing is stored or storage is unavailable.
export function getThemePreference() {
  if (typeof window === 'undefined') {
    return 'system'
  }

  try {
    const stored = window.localStorage.getItem(UI_THEME_STORAGE_KEY)
    return THEME_PREFERENCES.includes(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

// Persists the preference and immediately (re)applies it to the document.
export function setThemePreference(preference) {
  const nextPreference = THEME_PREFERENCES.includes(preference) ? preference : 'system'

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(UI_THEME_STORAGE_KEY, nextPreference)
    } catch {
      // Ignore storage failures (private browsing, quota, disabled storage, etc).
    }
  }

  return applyTheme(nextPreference)
}

// Resolves a preference to an actual 'light' | 'dark' value, following the
// OS setting when the preference is 'system'.
export function resolveTheme(preference) {
  if (preference === 'light' || preference === 'dark') {
    return preference
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return 'light'
}

// Applies the resolved theme to <html data-theme="..."> (consumed by the
// :root[data-theme='dark'] tokens in index.css) and, when the preference is
// 'system', keeps it live-synced to OS theme changes. Returns an unsubscribe
// function. Safe to call during SSR/tests (no-ops without a document).
export function applyTheme(preference = getThemePreference()) {
  if (typeof document === 'undefined') {
    return () => {}
  }

  document.documentElement.dataset.theme = resolveTheme(preference)

  if (preference !== 'system' || typeof window === 'undefined' || !window.matchMedia) {
    return () => {}
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    document.documentElement.dataset.theme = mediaQuery.matches ? 'dark' : 'light'
  }

  mediaQuery.addEventListener('change', handleChange)
  return () => mediaQuery.removeEventListener('change', handleChange)
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
