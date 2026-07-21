import { lazy, Suspense, useCallback, useRef, useState } from 'react'

import LandingPage from './pages/LandingPage'
import Logo from './components/Logo'
import ProjectHeader from './components/ProjectHeader'
import { UI_LOCALE_STORAGE_KEY } from './utils/designSystem'
import { safeStorageGet } from './utils/cvForm'
import { SHARE_QUERY_PARAM } from './utils/shareLinks'

const ResumeBuilderPage = lazy(() => import('./pages/ResumeBuilderPage'))

function shouldAutoStart() {
  if (typeof window === 'undefined') {
    return false
  }
  const currentUrl = new URL(window.location.href)
  return currentUrl.pathname === '/cv' || currentUrl.searchParams.has(SHARE_QUERY_PARAM)
}

function readStoredLocale() {
  const storedLocale = safeStorageGet(UI_LOCALE_STORAGE_KEY).value
  return storedLocale === 'fi' ? 'fi' : 'en'
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span>No login. No data saved.</span>
      </div>
    </footer>
  )
}

function App() {
  const [locale, setLocale] = useState(() => readStoredLocale())
  const [view, setView] = useState(() => (shouldAutoStart() ? 'builder' : 'landing'))
  const [headerProps, setHeaderProps] = useState(null)
  const headerPropsRef = useRef(null)

  const handleToggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'fi' ? 'en' : 'fi'))
  }, [])

  const handleEditorLocaleChange = useCallback((nextLocale) => {
    setLocale((prev) => (prev === nextLocale ? prev : nextLocale))
  }, [])

  const handleHeaderChange = useCallback((nextProps) => {
    headerPropsRef.current = nextProps
    setHeaderProps({ ...nextProps })
  }, [])

  const goToBuilder = useCallback(() => {
    setView('builder')
    scrollToTop()
  }, [])

  const goToLanding = useCallback(() => {
    setView('landing')
    scrollToTop()
  }, [])

  if (view === 'landing') {
    return (
      <div className="one-pager">
        <header className="project-header print:hidden">
          <div className="project-header__container">
            <div className="project-header__content">
              <Logo size={24} />
              <button
                type="button"
                className="action-button action-button--secondary border px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition"
                onClick={handleToggleLocale}
              >
                {locale === 'fi' ? 'EN' : 'FI'}
              </button>
            </div>
          </div>
        </header>

        <LandingPage
          locale={locale}
          onGetStarted={goToBuilder}
        />

        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="one-pager">
      {headerProps && (
        <ProjectHeader
          locale={headerProps.locale}
          activeExport={headerProps.activeExport}
          isActionBusy={headerProps.isActionBusy}
          canUndo={headerProps.canUndo}
          canRedo={headerProps.canRedo}
          onReturn={goToLanding}
          onLocaleChange={headerProps.onLocaleChange}
          onUndo={headerProps.onUndo}
          onRedo={headerProps.onRedo}
          onExport={headerProps.onExport}
        />
      )}

      <section id="builder" className="builder-section">
        <Suspense fallback={null}>
          <ResumeBuilderPage
            initialLocale={locale}
            onLocaleChange={handleEditorLocaleChange}
            onHeaderChange={handleHeaderChange}
          />
        </Suspense>
      </section>

      <SiteFooter />
    </div>
  )
}

export default App
