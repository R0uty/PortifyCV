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
import { ROUTES } from './utils/routes'

const ResumeBuilderPage = lazy(() => import('./pages/ResumeBuilderPage'))
const FreeCvTemplatesPage = lazy(() => import('./pages/FreeCvTemplatesPage'))
const AtsFriendlyCvGuidePage = lazy(() => import('./pages/AtsFriendlyCvGuidePage'))
const HowToWriteACvPage = lazy(() => import('./pages/HowToWriteACvPage'))
const CoverLetterExamplesPage = lazy(() => import('./pages/CoverLetterExamplesPage'))
const CvSkillsExamplesPage = lazy(() => import('./pages/CvSkillsExamplesPage'))

const SITE_ORIGIN = 'https://portifycv.app'

const VIEW_HEAD = {
  landing: {
    title: 'PortifyCV - CV Builder',
    path: ROUTES.landing,
    description:
      'Build a free CV in minutes. No login, no data saved. Live preview, ATS-friendly mode, and PDF/HTML/JSON export.',
  },
  builder: {
    title: 'PortifyCV - Build Your CV Online',
    path: ROUTES.builder,
    description:
      'Build and edit your CV online for free. Live preview, ATS-friendly mode, and PDF/HTML/JSON export — no login required.',
  },
  privacy: {
    title: 'Privacy Policy - PortifyCV',
    path: ROUTES.privacy,
    description:
      'How PortifyCV handles your data: no server, no account, and what cookies apply if advertising is enabled.',
  },
  freeTemplates: {
    title: 'Free CV Templates - PortifyCV',
    path: ROUTES.freeTemplates,
    description:
      '13 free CV templates, no watermark and no account required. Preview each one with your own content and swap between them any time.',
  },
  atsGuide: {
    title: 'ATS-Friendly CV Guide - PortifyCV',
    path: ROUTES.atsGuide,
    description:
      'How applicant tracking systems actually read a CV, the formatting mistakes that break parsing, and how to check your own CV against real keyword scoring.',
    isArticle: true,
    datePublished: '2026-08-20',
  },
  howToWrite: {
    title: 'How to Write a CV - PortifyCV',
    path: ROUTES.howToWrite,
    description:
      'A practical, structural guide to writing a CV: what sections to include, how to write experience bullets that show impact, and mistakes to avoid.',
    isArticle: true,
    datePublished: '2026-08-20',
  },
  coverLetterExamples: {
    title: 'Cover Letter Examples - PortifyCV',
    path: ROUTES.coverLetterExamples,
    description:
      'Real weak-vs-strong cover letter examples for the opening, experience paragraph, and closing, plus how PortifyCV drafts the first version from your CV.',
    isArticle: true,
    datePublished: '2026-08-20',
  },
  cvSkills: {
    title: 'CV Skills Examples - PortifyCV',
    path: ROUTES.cvSkills,
    description:
      'How to choose, group, and phrase the skills section of your CV, with example groupings and how many skills is actually the right number.',
    isArticle: true,
    datePublished: '2026-08-20',
  },
}

// Static content pages (everything except the builder) share one shell:
// header with logo + locale toggle, the page itself, then footer/consent/ads.
// Keyed the same as VIEW_HEAD so adding a new page is one map entry plus one
// VIEW_HEAD entry, not a new copy of the shell.
const STATIC_PAGES = {
  landing: LandingPage,
  privacy: PrivacyPolicyPage,
  freeTemplates: FreeCvTemplatesPage,
  atsGuide: AtsFriendlyCvGuidePage,
  howToWrite: HowToWriteACvPage,
  coverLetterExamples: CoverLetterExamplesPage,
  cvSkills: CvSkillsExamplesPage,
}

function getInitialView() {
  if (typeof window === 'undefined') {
    return 'landing'
  }
  const currentUrl = new URL(window.location.href)
  const matchedView = Object.entries(VIEW_HEAD).find(([, head]) => head.path === currentUrl.pathname)
  if (matchedView) {
    return matchedView[0]
  }
  if (currentUrl.searchParams.has(SHARE_QUERY_PARAM)) {
    return 'builder'
  }
  return 'landing'
}

function setMetaContent(selector, content) {
  const element = document.querySelector(selector)
  if (element) {
    element.setAttribute('content', content)
  }
}

const VIEW_STRUCTURED_DATA_SCRIPT_ID = 'view-structured-data'

// Article schema for guide-type pages (VIEW_HEAD entries with isArticle:
// true) — index.html's own two JSON-LD blocks (SoftwareApplication,
// FAQPage) describe the app itself and stay static across every route;
// this is the per-page equivalent for the guide pages, upserted into one
// script tag that's added/rewritten/removed as the view changes.
function buildArticleSchema(head) {
  const url = `${SITE_ORIGIN}${head.path}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: head.title.replace(/ - PortifyCV$/, ''),
    description: head.description,
    url,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'PortifyCV', url: SITE_ORIGIN },
    publisher: { '@type': 'Organization', name: 'PortifyCV', url: SITE_ORIGIN },
    datePublished: head.datePublished,
    dateModified: head.dateModified ?? head.datePublished,
  }
}

function useDocumentHead(view) {
  useEffect(() => {
    const head = VIEW_HEAD[view] ?? VIEW_HEAD.landing
    const url = `${SITE_ORIGIN}${head.path}`

    document.title = head.title

    const canonicalLink = document.querySelector('link[rel="canonical"]')
    if (canonicalLink) {
      canonicalLink.setAttribute('href', url)
    }

    setMetaContent('meta[name="description"]', head.description)

    // Open Graph / Twitter previously stayed frozen on the homepage's
    // values for every route (only title/canonical/description were
    // patched), so a share-preview crawler hitting /cv or /privacy saw
    // homepage copy and the homepage URL for a page it didn't request.
    setMetaContent('meta[property="og:url"]', url)
    setMetaContent('meta[property="og:title"]', head.title)
    setMetaContent('meta[property="og:description"]', head.description)
    setMetaContent('meta[name="twitter:title"]', head.title)
    setMetaContent('meta[name="twitter:description"]', head.description)

    const existingScript = document.getElementById(VIEW_STRUCTURED_DATA_SCRIPT_ID)
    if (head.isArticle) {
      const script = existingScript ?? document.createElement('script')
      script.type = 'application/ld+json'
      script.id = VIEW_STRUCTURED_DATA_SCRIPT_ID
      script.textContent = JSON.stringify(buildArticleSchema(head))
      if (!existingScript) {
        document.head.appendChild(script)
      }
    } else if (existingScript) {
      existingScript.remove()
    }
  }, [view])
}

// Pushes a new history entry for the given view so the address bar, the
// canonical link (see useDocumentHead), and browser back/forward all agree
// with what's on screen. Previously view switches only called setView(),
// leaving the URL frozen at whatever it was on first load — the canonical
// tag would claim /cv while the address bar still read /, and the back
// button had nothing to go back to.
function pushViewUrl(nextView) {
  if (typeof window === 'undefined') {
    return
  }

  const path = VIEW_HEAD[nextView]?.path ?? '/'

  if (window.location.pathname !== path) {
    window.history.pushState({ view: nextView }, '', path)
  }
}

function readStoredLocale() {
  const storedLocale = safeStorageGet(UI_LOCALE_STORAGE_KEY).value
  return storedLocale === 'fi' ? 'fi' : 'en'
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function SiteFooter({ locale = 'en', onNavigate = () => {} }) {
  const isFinnish = locale === 'fi'
  const guideLinks = [
    { view: 'freeTemplates', label: isFinnish ? 'CV-pohjat' : 'Free CV Templates' },
    { view: 'howToWrite', label: isFinnish ? 'Näin kirjoitat CV:n' : 'How to Write a CV' },
    { view: 'cvSkills', label: isFinnish ? 'Taito-osion esimerkkejä' : 'CV Skills Examples' },
    { view: 'atsGuide', label: isFinnish ? 'ATS-opas' : 'ATS-Friendly CV Guide' },
    { view: 'coverLetterExamples', label: isFinnish ? 'Saatekirje-esimerkkejä' : 'Cover Letter Examples' },
    { view: 'privacy', label: isFinnish ? 'Tietosuojaseloste' : 'Privacy policy' },
  ]

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span>
          {isFinnish ? 'Ei kirjautumista. Ei tallennettua dataa.' : 'No login. No data saved.'}
        </span>
        <nav className="site-footer__links" aria-label={isFinnish ? 'Oppaat' : 'Guides'}>
          {guideLinks.map((link) => (
            <a
              key={link.view}
              href={VIEW_HEAD[link.view].path}
              className="site-footer__link"
              onClick={(event) => {
                event.preventDefault()
                onNavigate(link.view)
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
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

  // templateId is optional — passed when a link should open the builder with
  // a specific template already selected (e.g. "Use this template" on the
  // Free CV Templates page) instead of always landing on the default.
  // uiReducer's createInitialUiState reads it back off the URL on mount.
  const goToBuilder = useCallback((templateId) => {
    setView('builder')

    if (typeof window !== 'undefined') {
      const query = typeof templateId === 'string' && templateId
        ? `?template=${encodeURIComponent(templateId)}`
        : ''
      const nextPath = `${VIEW_HEAD.builder.path}${query}`

      if (`${window.location.pathname}${window.location.search}` !== nextPath) {
        window.history.pushState({ view: 'builder' }, '', nextPath)
      }
    }

    scrollToTop()
  }, [])

  const goToLanding = useCallback(() => {
    setView('landing')
    pushViewUrl('landing')
    scrollToTop()
  }, [])

  // Generic version of goToLanding for any non-builder static page (footer
  // guide links, etc.) — builder goes through goToBuilder since it also
  // supports the optional ?template= id.
  const goToView = useCallback((nextView) => {
    setView(nextView)
    pushViewUrl(nextView)
    scrollToTop()
  }, [])

  // Keep view state in sync when the user navigates with the browser's
  // back/forward buttons rather than an in-app link — those change the URL
  // without going through goToBuilder/goToLanding.
  useEffect(() => {
    function handlePopState() {
      setView(getInitialView())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (view !== 'builder') {
    const PageComponent = STATIC_PAGES[view] ?? LandingPage

    return (
      <div className="one-pager">
        <header className="project-header print:hidden">
          <div className="project-header__container">
            <div className="project-header__content">
              {view === 'landing' ? (
                <img
                  src="/PortifyCV.jpg"
                  alt="PortifyCV"
                  className="project-header__logo"
                />
              ) : (
                <a
                  href="/"
                  onClick={(event) => {
                    event.preventDefault()
                    goToLanding()
                  }}
                >
                  <img
                    src="/PortifyCV.jpg"
                    alt="PortifyCV"
                    className="project-header__logo"
                  />
                </a>
              )}
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

        <Suspense fallback={null}>
          <PageComponent locale={locale} onGetStarted={goToBuilder} onNavigateToView={goToView} />
        </Suspense>

        <SiteFooter locale={locale} onNavigate={goToView} />
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

      <SiteFooter locale={locale} onNavigate={goToView} />
      <ConsentBanner locale={locale} consent={adConsent} onDecide={handleAdConsentDecision} />
      <AdSenseLoader consent={adConsent} />
    </div>
  )
}

export default App
