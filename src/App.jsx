import { useCallback, useEffect, useState } from 'react'

import LandingPage from './pages/LandingPage'
import { safeStorageGet, safeStorageSet } from './utils/cvForm'
import { UI_THEME_STORAGE_KEY } from './utils/designSystem'
import { SHARE_QUERY_PARAM } from './utils/shareLinks'
import ResumeBuilderPage from './pages/ResumeBuilderPage'

const UI_LOCALE_STORAGE_KEY = 'ui-locale'

function shouldOpenBuilderByDefault() {
  if (typeof window === 'undefined') {
    return false
  }

  const currentUrl = new URL(window.location.href)
  return currentUrl.pathname === '/cv' || currentUrl.searchParams.has(SHARE_QUERY_PARAM)
}

function readStoredTheme() {
  const storedTheme = safeStorageGet(UI_THEME_STORAGE_KEY).value
  return storedTheme === 'light' ? 'light' : 'dark'
}

function readStoredLocale() {
  const storedLocale = safeStorageGet(UI_LOCALE_STORAGE_KEY).value
  return storedLocale === 'fi' ? 'fi' : 'en'
}

function App() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(() => shouldOpenBuilderByDefault())
  const [theme, setTheme] = useState(() => readStoredTheme())
  const [locale, setLocale] = useState(() => readStoredLocale())

  useEffect(() => {
    safeStorageSet(UI_THEME_STORAGE_KEY, theme)
    if (typeof document !== 'undefined') {
      document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
    }
  }, [theme])

  useEffect(() => {
    safeStorageSet(UI_LOCALE_STORAGE_KEY, locale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const handleToggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const handleToggleLocale = () => {
    setLocale((currentLocale) => (currentLocale === 'fi' ? 'en' : 'fi'))
  }

  const handleReturnToLanding = () => {
    setIsBuilderOpen(false)
  }

  const handleEditorThemeChange = useCallback((nextTheme) => {
    setTheme((currentTheme) => (currentTheme === nextTheme ? currentTheme : nextTheme))
  }, [])

  const handleEditorLocaleChange = useCallback((nextLocale) => {
    setLocale((currentLocale) => (currentLocale === nextLocale ? currentLocale : nextLocale))
  }, [])

  if (isBuilderOpen) {
    return (
      <ResumeBuilderPage
        onReturnToLanding={handleReturnToLanding}
        initialTheme={theme}
        initialLocale={locale}
        onThemeChange={handleEditorThemeChange}
        onLocaleChange={handleEditorLocaleChange}
      />
    )
  }

  return (
    <LandingPage
      theme={theme}
      locale={locale}
      onToggleTheme={handleToggleTheme}
      onToggleLocale={handleToggleLocale}
      onGetStarted={() => setIsBuilderOpen(true)}
    />
  )
}

export default App