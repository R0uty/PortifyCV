import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'

import LandingPage from './pages/LandingPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import Toolbar from './components/Toolbar'
import AdSenseLoader from './components/AdSenseLoader'
import ConsentBanner from './components/ConsentBanner'
import { UI_LOCALE_STORAGE_KEY } from './utils/designSystem'
import { safeStorageGet } from './utils/cvForm'
import { SHARE_QUERY_PARAM } from './utils/shareLinks'
import { getAdConsent, setAdConsent } from './utils/consent'

const ResumeBuilderPage = lazy(() => import('./pages/ResumeBuilderPage'))

function getInitialView() {
  if (typeof window === 'undefined') {
    return 'landing'
  }
  const currentUrl = new URL(window.location.href)
  if (currentUrl.pathname === '/privacy') {
    return 'privacy'
  }
  if (currentUrl.pathname === '/cv' || currentUrl.searchParams.has(SHARE_QUERY_PARAM)) {
    return 'builder'
  }
  return 'landing'
}

const SITE_ORIGIN = 'https://portifycv.app'

const VIEW_HEAD = {
  landing: {
    title: 'PortifyCV - CV Builder',
    path: '/',
    description:
      'Build a free CV in minutes. No login, no data saved. Live preview, ATS-friendly mode, and PDF/HTML/JSON export.',
  },
  builder: {
    title: 'PortifyCV - Build Your CV Online',
    path: '/cv',
    description:
      'Build and edit your CV online for free. Live preview, ATS-friendly mode, and PDF/HTML/JSON export — no login required.',
  },
  privacy: {
    title: 'Privacy Policy - PortifyCV',
    path: '/privacy',
    description:
      'How PortifyCV handles your data: no server, no account, and what cookies apply if advertising is enabled.',
  },
}

function useDocumentHead(view) {
  useEffect(() => {
    const head = VIEW_HEAD[view] ?? VIEW_HEAD.landing
    document.title = head.title

    const canonicalLink = document.querySelector('link[rel="canonical"]')
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${SITE_ORIGIN}${head.path}`)
    }

    const descriptionMeta = document.querySelector('meta[name="description"]')
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', head.description)
    }
  }, [view])
}

function readStoredLocale() {
  const storedLocale = safeStorageGet(UI_LOCALE_STORAGE_KEY).value
  return storedLocale === 'fi' ? 'fi' : 'en'
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function SiteFooter({ locale = 'en' }) {
  const isFinnish = locale === 'fi'

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span>
          {isFinnish ? 'Ei kirjautumista. Ei tallennettua dataa.' : 'No login. No data saved.'}
        </span>
        <a href="/privacy" className="site-footer__link">
          {isFinnish ? 'Tietosuojaseloste' : 'Privacy policy'}
        </a>
      </div>
    </footer>
  )
}

function App() {
  const [locale, setLocale] = useState(() => readStoredLocale())
  const [view, setView] = useState(() => getInitialView())
  const [headerProps, setHeaderProps] = useState(null)
  const headerPropsRef = useRef(null)
  const [adConsent, setAdConsentState] = useState(() => getAdConsent())

  useDocumentHead(view)

  const handleAdConsentDecision = useCallback((value) => {
    setAdConsent(value)
    setAdConsentState(value)
  }, [])

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

  if (view === 'privacy') {
    return (
      <div className="one-pager">
        <header className="project-header print:hidden">
          <div className="project-header__container">
            <div className="project-header__content">
              <a href="/">
                <img
                  src="/PortifyCV.jpg"
                  alt="PortifyCV"
                  className="project-header__logo"
                />
              </a>
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

        <PrivacyPolicyPage locale={locale} />

        <SiteFooter locale={locale} />
        <ConsentBanner locale={locale} consent={adConsent} onDecide={handleAdConsentDecision} />
        <AdSenseLoader consent={adConsent} />
      </div>
    )
  }

  if (view === 'landing') {
    return (
      <div className="one-pager">
        <header className="project-header print:hidden">
          <div className="project-header__container">
            <div className="project-header__content">
              <img
                src="/PortifyCV.jpg"
                alt="PortifyCV"
                className="project-header__logo"
              />
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

        <SiteFooter locale={locale} />
        <ConsentBanner locale={locale} consent={adConsent} onDecide={handleAdConsentDecision} />
        <AdSenseLoader consent={adConsent} />
      </div>
    )
  }

  return (
    <div className="one-pager">
      {headerProps && (
        <Toolbar
          locale={headerProps.locale}
          onReturn={goToLanding}
          onLocaleChange={headerProps.onLocaleChange}
          canUndo={headerProps.canUndo}
          canRedo={headerProps.canRedo}
          onUndo={headerProps.onUndo}
          onRedo={headerProps.onRedo}
          templates={headerProps.templates}
          selectedTemplateId={headerProps.selectedTemplateId}
          onSelectTemplate={headerProps.onSelectTemplate}
          templateSelectRef={headerProps.templateSelectRef}
          searchQuery={headerProps.searchQuery}
          onSearchChange={headerProps.onSearchChange}
          onPrint={headerProps.onPrint}
          isFullscreenPreview={headerProps.isFullscreenPreview}
          onToggleFullscreenPreview={headerProps.onToggleFullscreenPreview}
          isResponsivePreview={headerProps.isResponsivePreview}
          onToggleResponsivePreview={headerProps.onToggleResponsivePreview}
          activeExport={headerProps.activeExport}
          isActionBusy={headerProps.isActionBusy}
          onExport={headerProps.onExport}
          onCopyShareLink={headerProps.onCopyShareLink}
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

      <SiteFooter locale={locale} />
      <ConsentBanner locale={locale} consent={adConsent} onDecide={handleAdConsentDecision} />
      <AdSenseLoader consent={adConsent} />
    </div>
  )
}

export default App
