import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Menu } from 'lucide-react'

import LandingPage from './pages/LandingPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import Toolbar from './components/Toolbar'
import LocaleFlagIcon from './components/LocaleFlagIcon'
import Modal from './components/Modal'
import { UI_LOCALE_STORAGE_KEY } from './utils/designSystem'
import { safeStorageGet, safeStorageSet } from './utils/cvForm'
import { SHARE_QUERY_PARAM } from './utils/shareLinks'
import { ROUTES, localizePath, pathLocale, templatePath } from './utils/routes'
import { getCvTemplates } from './utils/cvTemplates'
import { VIEW_HEAD, SITE_ORIGIN, buildViewSchema, localizedHead, PATH_TO_VIEW, TEMPLATE_VIEW_PREFIX } from './utils/pageMeta'
import { LocaleContext } from './components/localeContext'
import { APP_VERSION } from './utils/appVersion'

const ResumeBuilderPage = lazy(() => import('./pages/ResumeBuilderPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const FreeCvTemplatesPage = lazy(() => import('./pages/FreeCvTemplatesPage'))
const AtsFriendlyCvGuidePage = lazy(() => import('./pages/AtsFriendlyCvGuidePage'))
const HowToWriteACvPage = lazy(() => import('./pages/HowToWriteACvPage'))
const HowToUseTheBuilderPage = lazy(() => import('./pages/HowToUseTheBuilderPage'))
const CoverLetterExamplesPage = lazy(() => import('./pages/CoverLetterExamplesPage'))
const CvSkillsExamplesPage = lazy(() => import('./pages/CvSkillsExamplesPage'))
const CvExamplesHubPage = lazy(() => import('./pages/CvExamplesHubPage'))
const DeveloperCvExamplesPage = lazy(() => import('./pages/DeveloperCvExamplesPage'))
const ItCvExamplesPage = lazy(() => import('./pages/ItCvExamplesPage'))
const CybersecurityCvExamplesPage = lazy(() => import('./pages/CybersecurityCvExamplesPage'))
const FinnishCvExamplesPage = lazy(() => import('./pages/FinnishCvExamplesPage'))
const TemplateDetailPage = lazy(() => import('./pages/TemplateDetailPage'))

function NotFoundView({ locale, onNavigateToView }) {
  const isFinnish = locale === 'fi'

  return (
    <div className="landing-section" style={{ textAlign: 'center' }}>
      <h1 className="landing-section__title">
        {isFinnish ? 'Sivua ei löytynyt' : 'Page not found'}
      </h1>
      <p className="landing-section__subtitle">
        {isFinnish
          ? 'Etsimääsi sivua ei ole olemassa tai se on siirretty.'
          : "The page you're looking for doesn't exist or has moved."}
      </p>
      <a
        href={isFinnish ? localizePath(ROUTES.landing, 'fi') : ROUTES.landing}
        onClick={(event) => {
          event.preventDefault()
          onNavigateToView('landing')
        }}
      >
        {isFinnish ? 'Takaisin etusivulle' : 'Back to the homepage'}
      </a>
    </div>
  )
}

// Static content pages (everything except the builder) share one shell:
// header with logo + locale toggle, the page itself, then the footer.
// Keyed the same as VIEW_HEAD so adding a new page is one map entry plus one
// VIEW_HEAD entry, not a new copy of the shell.
const STATIC_PAGES = {
  landing: LandingPage,
  privacy: PrivacyPolicyPage,
  about: AboutPage,
  freeTemplates: FreeCvTemplatesPage,
  atsGuide: AtsFriendlyCvGuidePage,
  howToWrite: HowToWriteACvPage,
  howToUse: HowToUseTheBuilderPage,
  coverLetterExamples: CoverLetterExamplesPage,
  cvSkills: CvSkillsExamplesPage,
  cvExamples: CvExamplesHubPage,
  developerCv: DeveloperCvExamplesPage,
  itCv: ItCvExamplesPage,
  cybersecurityCv: CybersecurityCvExamplesPage,
  finnishCv: FinnishCvExamplesPage,
  notFound: NotFoundView,
}

// The view and language the address asks for (1.6.35: /fi/… is Finnish,
// other content addresses English; the builder's /cv has no language of
// its own, `locale: null`).
function readRoute() {
  if (typeof window === 'undefined') {
    return { view: 'landing', locale: 'en' }
  }
  const currentUrl = new URL(window.location.href)
  if (currentUrl.searchParams.has(SHARE_QUERY_PARAM)) {
    return { view: 'builder', locale: null }
  }
  const matched = PATH_TO_VIEW.get(currentUrl.pathname)
  if (matched) {
    return matched
  }
  return { view: 'notFound', locale: pathLocale(currentUrl.pathname) }
}

// A view's address in `locale`, e.g. '/fi/tietoa' for about in Finnish.
function viewPath(view, locale) {
  return localizedHead(VIEW_HEAD[view], locale)?.path ?? (locale === 'fi' ? '/fi' : '/')
}

function setMetaContent(selector, content) {
  const element = document.querySelector(selector)
  if (element) {
    element.setAttribute('content', content)
  }
}

// Not a real route (no ROUTES/VIEW_HEAD entry) — worker/index.js already
// serves this path with a real 404 status and a noindex robots meta before
// React ever mounts; this is only reached client-side, e.g. via an in-app
// link that itself points at a stale/typo'd path.
const NOT_FOUND_HEAD = {
  title: 'Page Not Found - PortifyCV',
  description: "The page you're looking for doesn't exist or has moved.",
  robots: 'noindex, follow',
}

const VIEW_STRUCTURED_DATA_SCRIPT_ID = 'view-structured-data'

// The <link rel="alternate" hreflang> trio for a page that exists in both
// languages (1.6.35); removed on a page that doesn't.
function setLanguageAlternates(alternates) {
  for (const hreflang of ['en', 'fi', 'x-default']) {
    const selector = `link[rel="alternate"][hreflang="${hreflang}"]`
    const existing = document.head.querySelector(selector)
    if (!alternates) {
      existing?.remove()
      continue
    }
    const link = existing ?? document.createElement('link')
    link.rel = 'alternate'
    link.hreflang = hreflang
    link.href = `${SITE_ORIGIN}${hreflang === 'fi' ? alternates.fi : alternates.en}`
    if (!existing) {
      document.head.appendChild(link)
    }
  }
}

function useDocumentHead(view, locale) {
  useEffect(() => {
    const head = view === 'notFound' ? NOT_FOUND_HEAD : localizedHead(VIEW_HEAD[view] ?? VIEW_HEAD.landing, locale)
    const url = head.path ? `${SITE_ORIGIN}${head.path}` : window.location.href

    document.title = head.title
    setLanguageAlternates(head.alternates ?? null)
    setMetaContent('meta[property="og:locale"]', locale === 'fi' ? 'fi_FI' : 'en_US')

    const canonicalLink = document.querySelector('link[rel="canonical"]')
    if (canonicalLink) {
      canonicalLink.setAttribute('href', url)
    }

    setMetaContent('meta[name="description"]', head.description)
    setMetaContent('meta[name="robots"]', head.robots ?? 'index, follow')

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
    const schema = buildViewSchema(head)
    if (schema) {
      const script = existingScript ?? document.createElement('script')
      script.type = 'application/ld+json'
      script.id = VIEW_STRUCTURED_DATA_SCRIPT_ID
      script.textContent = JSON.stringify(schema)
      if (!existingScript) {
        document.head.appendChild(script)
      }
    } else if (existingScript) {
      existingScript.remove()
    }
  }, [view, locale])
}

// Pushes a new history entry for the given view so the address bar, the
// canonical link (see useDocumentHead), and browser back/forward all agree
// with what's on screen. Previously view switches only called setView(),
// leaving the URL frozen at whatever it was on first load — the canonical
// tag would claim /cv while the address bar still read /, and the back
// button had nothing to go back to.
// `search` (Phase 4) carries a query string into the new view, e.g. a
// template page's ?style=; without it the view opens at its bare path.
// A navigation without `search` compares paths only, as before, so
// clicking the current view's own link from e.g. `?utm_source=` doesn't
// push a duplicate entry.
function pushViewUrl(nextView, search = '', locale = 'en') {
  if (typeof window === 'undefined') {
    return
  }

  const url = `${viewPath(nextView, locale)}${search}`
  const current = search
    ? `${window.location.pathname}${window.location.search}`
    : window.location.pathname

  if (current !== url) {
    window.history.pushState({ view: nextView }, '', url)
  }
}

function readStoredLocale() {
  const storedLocale = safeStorageGet(UI_LOCALE_STORAGE_KEY).value
  return storedLocale === 'fi' ? 'fi' : 'en'
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// The header nav on every static page (landing included); the builder's
// Toolbar is a different, task-focused header. Two top-level links, the
// guides in one menu, and FAQ (the landing page's #faq section), 1.6.31.
// Template pages count as Templates, the field example pages as Examples.
const PRIMARY_LINKS = [
  { view: 'freeTemplates', en: 'Templates', fi: 'CV-pohjat', activeFor: (view) => view === 'freeTemplates' || view.startsWith(TEMPLATE_VIEW_PREFIX) },
  { view: 'cvExamples', en: 'Examples', fi: 'Esimerkit', activeFor: (view) => ['cvExamples', 'developerCv', 'itCv', 'cybersecurityCv', 'finnishCv'].includes(view) },
]

const GUIDE_LINKS = [
  { view: 'howToUse', en: 'How to use the builder', fi: 'Näin käytät CV-editoria' },
  { view: 'howToWrite', en: 'How to write a CV', fi: 'Näin kirjoitat CV:n' },
  { view: 'atsGuide', en: 'ATS-friendly CV guide', fi: 'ATS-ystävällinen CV-opas' },
  { view: 'cvSkills', en: 'CV skills examples', fi: 'Taito-osion esimerkkejä' },
  { view: 'coverLetterExamples', en: 'Cover letter examples', fi: 'Saatekirje-esimerkkejä' },
]

// The landing page's FAQ: scroll there, from the landing page or after
// navigating to it (LandingPage scrolls to #faq on mount).
function goToFaq(event, activeView, onNavigate, locale) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return
  }
  event.preventDefault()
  const faqUrl = localizePath('/#faq', locale)
  if (activeView === 'landing') {
    window.history.replaceState(window.history.state, '', faqUrl)
    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  onNavigate('landing')
  window.history.replaceState(window.history.state, '', faqUrl)
}

function handleInAppLinkClick(event, view, onNavigate) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return
  }
  event.preventDefault()
  onNavigate(view)
}

// The Guides menu: a disclosure button and a short list of links. Closes
// on a link, Escape (focus back to the button), or a click outside.
function GuidesMenu({ locale, activeView, onNavigate }) {
  const isFinnish = locale === 'fi'
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const isActive = GUIDE_LINKS.some((link) => link.view === activeView)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="project-header__menu" ref={rootRef}>
      <button
        type="button"
        ref={buttonRef}
        className={`project-header__link project-header__menu-button${isActive ? ' project-header__link--active' : ''}`}
        aria-expanded={isOpen}
        aria-controls="header-guides-menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isFinnish ? 'Oppaat' : 'Guides'}
        <ChevronDown size={12} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <div id="header-guides-menu" className="project-header__menu-panel" hidden={!isOpen}>
        {GUIDE_LINKS.map((link) => (
          <a
            key={link.view}
            href={localizePath(VIEW_HEAD[link.view].path, locale)}
            className="project-header__menu-link"
            aria-current={link.view === activeView ? 'page' : undefined}
            onClick={(event) => {
              setIsOpen(false)
              handleInAppLinkClick(event, link.view, onNavigate)
            }}
          >
            {isFinnish ? link.fi : link.en}
          </a>
        ))}
      </div>
    </div>
  )
}

// Below 640px the pill is hidden by CSS and this hamburger button takes its
// place, opening the same links as a plain vertical list in the shared
// Modal component instead of building a bespoke drawer.
function HeaderNav({ locale = 'en', activeView, onNavigate = () => {}, onGetStarted = () => {} }) {
  const isFinnish = locale === 'fi'
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const navLabel = isFinnish ? 'Sivuston valikko' : 'Site menu'
  const faqLabel = isFinnish ? 'UKK' : 'FAQ'

  function handleMobileNavigate(event, view) {
    handleInAppLinkClick(event, view, onNavigate)
    setIsMobileNavOpen(false)
  }

  return (
    <>
      <nav className="project-header__nav" aria-label={navLabel}>
        {PRIMARY_LINKS.map((link) => (
          <a
            key={link.view}
            href={localizePath(VIEW_HEAD[link.view].path, locale)}
            className={`project-header__link${link.activeFor(activeView) ? ' project-header__link--active' : ''}`}
            aria-current={link.view === activeView ? 'page' : undefined}
            onClick={(event) => handleInAppLinkClick(event, link.view, onNavigate)}
          >
            {isFinnish ? link.fi : link.en}
          </a>
        ))}
        <GuidesMenu locale={locale} activeView={activeView} onNavigate={onNavigate} />
        <a href={localizePath('/#faq', locale)} className="project-header__link" onClick={(event) => goToFaq(event, activeView, onNavigate, locale)}>
          {faqLabel}
        </a>
      </nav>

      <button
        type="button"
        className="project-header__nav-toggle"
        onClick={() => setIsMobileNavOpen(true)}
        aria-label={navLabel}
        title={navLabel}
      >
        <Menu size={18} strokeWidth={2} aria-hidden="true" />
      </button>

      <Modal isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} title={navLabel}>
        <nav className="project-header__mobile-nav" aria-label={navLabel}>
          <button
            type="button"
            className="landing-cta project-header__mobile-cta"
            onClick={() => {
              setIsMobileNavOpen(false)
              onGetStarted()
            }}
          >
            {isFinnish ? 'Tee CV' : 'Build my CV'}
          </button>
          {PRIMARY_LINKS.map((link) => (
            <a
              key={link.view}
              href={localizePath(VIEW_HEAD[link.view].path, locale)}
              className="project-header__mobile-nav-link"
              aria-current={link.view === activeView ? 'page' : undefined}
              onClick={(event) => handleMobileNavigate(event, link.view)}
            >
              {isFinnish ? link.fi : link.en}
            </a>
          ))}
          <a
            href={localizePath('/#faq', locale)}
            className="project-header__mobile-nav-link"
            onClick={(event) => {
              setIsMobileNavOpen(false)
              goToFaq(event, activeView, onNavigate, locale)
            }}
          >
            {faqLabel}
          </a>
          <p className="project-header__mobile-nav-group">{isFinnish ? 'Oppaat' : 'Guides'}</p>
          {GUIDE_LINKS.map((link) => (
            <a
              key={link.view}
              href={localizePath(VIEW_HEAD[link.view].path, locale)}
              className="project-header__mobile-nav-link"
              aria-current={link.view === activeView ? 'page' : undefined}
              onClick={(event) => handleMobileNavigate(event, link.view)}
            >
              {isFinnish ? link.fi : link.en}
            </a>
          ))}
        </nav>
      </Modal>
    </>
  )
}

// Every content page in one place, below each static page (not the
// builder): the footer bar itself only links About and Privacy, and on
// phones the guides were otherwise reachable only through the menu.
const SITE_MAP_COLUMNS = [
  {
    title: { en: 'Build', fi: 'Rakenna' },
    links: [
      { view: 'builder', en: 'Start building', fi: 'Aloita rakentaminen' },
      { view: 'howToUse', en: 'How to use the builder', fi: 'Näin käytät CV-editoria' },
      { view: 'freeTemplates', en: 'Free CV templates', fi: 'Ilmaiset CV-pohjat' },
    ],
  },
  { title: { en: 'CV templates', fi: 'CV-pohjat' }, templates: true },
  {
    title: { en: 'Guides', fi: 'Oppaat' },
    links: [
      { view: 'howToWrite', en: 'How to write a CV', fi: 'Näin kirjoitat CV:n' },
      { view: 'atsGuide', en: 'ATS-friendly CV guide', fi: 'ATS-ystävällinen CV-opas' },
      { view: 'cvSkills', en: 'CV skills examples', fi: 'Taito-osion esimerkkejä' },
      { view: 'coverLetterExamples', en: 'Cover letter examples', fi: 'Saatekirje-esimerkkejä' },
    ],
  },
  {
    title: { en: 'Examples', fi: 'Esimerkit' },
    links: [
      { view: 'cvExamples', en: 'CV examples by field', fi: 'CV-esimerkkejä aloittain' },
      { view: 'developerCv', en: 'Developer CV examples', fi: 'Kehittäjän CV-esimerkkejä' },
      { view: 'itCv', en: 'IT CV examples', fi: 'IT-alan CV-esimerkkejä' },
      { view: 'cybersecurityCv', en: 'Cybersecurity CV examples', fi: 'Tietoturva-alan CV-esimerkkejä' },
      { view: 'finnishCv', en: 'Finnish CV examples', fi: 'Suomalaisen CV:n esimerkkejä' },
    ],
  },
  {
    title: { en: 'PortifyCV', fi: 'PortifyCV' },
    links: [
      { view: 'about', en: 'About', fi: 'Tietoa' },
      { view: 'privacy', en: 'Privacy policy', fi: 'Tietosuojaseloste' },
    ],
  },
]

function SiteMap({ locale = 'en', onNavigate = () => {}, onGetStarted = () => {} }) {
  const lang = locale === 'fi' ? 'fi' : 'en'
  const templates = getCvTemplates(lang)

  return (
    <nav className="site-map print:hidden" aria-label={lang === 'fi' ? 'Sivukartta' : 'Site map'}>
      <div className="site-map__inner">
        {SITE_MAP_COLUMNS.map((column) => (
          <div key={column.title.en} className={`site-map__column${column.templates ? ' site-map__column--templates' : ''}`}>
            <p className="site-map__title">{column.title[lang]}</p>
            <ul className="site-map__list">
              {column.templates
                ? templates.map((template) => (
                  <li key={template.id}>
                    <a
                      href={templatePath(template.slug, lang)}
                      onClick={(event) => handleInAppLinkClick(event, `${TEMPLATE_VIEW_PREFIX}${template.id}`, onNavigate)}
                    >
                      {template.label}
                    </a>
                  </li>
                ))
                : column.links.map((link) => (
                  <li key={link.view}>
                    <a
                      href={localizePath(VIEW_HEAD[link.view].path, locale)}
                      onClick={(event) => (link.view === 'builder'
                        ? handleInAppLinkClick(event, link.view, () => onGetStarted())
                        : handleInAppLinkClick(event, link.view, onNavigate))}
                    >
                      {link[lang]}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}

function SiteFooter({ locale = 'en', onNavigate = () => {} }) {
  const isFinnish = locale === 'fi'

  return (
    <footer className="site-footer print:hidden">
      <div className="site-footer__inner">
        <span>
          {isFinnish ? 'Ei kirjautumista. Ei tallennettua dataa.' : 'No login. No data saved.'}
          {' '}
          <span className="site-footer__version">{APP_VERSION}</span>
        </span>
        <nav className="site-footer__links" aria-label={isFinnish ? 'Oikeudellinen' : 'Legal'}>
          <a
            href={localizePath(VIEW_HEAD.about.path, locale)}
            className="site-footer__link"
            onClick={(event) => handleInAppLinkClick(event, 'about', onNavigate)}
          >
            {isFinnish ? 'Tietoa' : 'About'}
          </a>
          <a
            href={localizePath(VIEW_HEAD.privacy.path, locale)}
            className="site-footer__link"
            onClick={(event) => handleInAppLinkClick(event, 'privacy', onNavigate)}
          >
            {isFinnish ? 'Tietosuojaseloste' : 'Privacy policy'}
          </a>
        </nav>
      </div>
    </footer>
  )
}

function App() {
  const [initialRoute] = useState(() => readRoute())
  // The address decides the language (1.6.35); only the builder's /cv,
  // which has none, falls back to the visitor's last choice.
  const [locale, setLocale] = useState(() => initialRoute.locale ?? readStoredLocale())
  const [view, setView] = useState(initialRoute.view)
  // Read by the navigation callbacks at click time.
  const localeRef = useRef(locale)
  useEffect(() => {
    localeRef.current = locale
  }, [locale])
  const [headerProps, setHeaderProps] = useState(null)
  const headerPropsRef = useRef(null)

  useDocumentHead(view, locale)

  // Previously only ResumeBuilderPage synced this, so toggling to Finnish
  // anywhere else (landing, the 10 content pages) left `lang="en"` on
  // `<html>` while Finnish text rendered — a screen reader would apply
  // English pronunciation rules to it. Owning this in App means it stays
  // correct regardless of which view is mounted.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // The header's language switch: the same page at the other language's
  // address (query kept), remembered for the builder.
  const handleToggleLocale = useCallback(() => {
    const next = localeRef.current === 'fi' ? 'en' : 'fi'
    safeStorageSet(UI_LOCALE_STORAGE_KEY, next)
    if (view !== 'builder' && view !== 'notFound') {
      pushViewUrl(view, window.location.search, next)
    }
    setLocale(next)
  }, [view])

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
  // exampleId is also optional — passed by a template page's "Use this
  // example" button so the builder loads that example's CV instead of the
  // blank/demo default. uiReducer's createInitialUiState reads templateId
  // back off the URL on mount; ResumeBuilderPage reads exampleId.
  // options.blank is set by a template page's "Start blank with this
  // template" button: it must NOT fall into the onboarding-demo branch of
  // loadInitialCvSession just because this is a first-time visitor — the
  // visitor explicitly asked for blank, not a demo.
  // options.style is the look picked on a template page or Free CV Templates
  // card; the builder applies it to whatever CV it starts with, exactly like
  // ?example=.
  const goToBuilder = useCallback((templateId, exampleId, options = {}) => {
    setView('builder')

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams()
      if (typeof templateId === 'string' && templateId) params.set('template', templateId)
      if (typeof exampleId === 'string' && exampleId) params.set('example', exampleId)
      if (options.blank) params.set('blank', '1')
      // A template page's or grid card's look (Phase 4). 'default' is
      // variant #1's id and never goes into a URL; App deliberately doesn't
      // import the variant registry (it would join the entry chunk), so the
      // builder validates the id.
      if (typeof options.style === 'string' && options.style && options.style !== 'default') {
        params.set('style', options.style)
      }
      const query = params.toString() ? `?${params}` : ''
      const nextPath = `${VIEW_HEAD.builder.path}${query}`

      if (`${window.location.pathname}${window.location.search}` !== nextPath) {
        window.history.pushState({ view: 'builder' }, '', nextPath)
      }
    }

    scrollToTop()
  }, [])

  const goToLanding = useCallback(() => {
    setView('landing')
    pushViewUrl('landing', '', localeRef.current)
    scrollToTop()
  }, [])

  // Generic version of goToLanding for any non-builder static page (footer
  // guide links, etc.) — builder goes through goToBuilder since it also
  // supports the optional ?template= id.
  const goToView = useCallback((nextView, { search = '' } = {}) => {
    setView(nextView)
    pushViewUrl(nextView, search, localeRef.current)
    scrollToTop()
  }, [])

  // Keep view state in sync when the user navigates with the browser's
  // back/forward buttons rather than an in-app link — those change the URL
  // without going through goToBuilder/goToLanding.
  useEffect(() => {
    function handlePopState() {
      const route = readRoute()
      setView(route.view)
      if (route.locale) {
        setLocale(route.locale)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (view !== 'builder') {
    const templatePageId = view.startsWith(TEMPLATE_VIEW_PREFIX) ? VIEW_HEAD[view]?.templateId : null
    const PageComponent = templatePageId ? TemplateDetailPage : (STATIC_PAGES[view] ?? LandingPage)

    return (
      <LocaleContext.Provider value={locale}>
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
                  href={viewPath('landing', locale)}
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
              <HeaderNav locale={locale} activeView={view} onNavigate={goToView} onGetStarted={goToBuilder} />
              <div className="project-header__actions">
                <button
                  type="button"
                  className="action-button action-button--secondary flex items-center gap-1.5 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition"
                  onClick={handleToggleLocale}
                  aria-label={locale === 'fi' ? 'Vaihda kieli' : 'Switch language'}
                  title={locale === 'fi' ? 'Vaihda kieli' : 'Switch language'}
                >
                  <LocaleFlagIcon locale={locale} />
                  {locale === 'fi' ? 'FI' : 'EN'}
                </button>
                <button type="button" className="project-header__cta" onClick={() => goToBuilder()}>
                  {locale === 'fi' ? 'Tee CV' : 'Build my CV'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <Suspense fallback={null}>
          <PageComponent
            key={view}
            locale={locale}
            templateId={templatePageId ?? undefined}
            onGetStarted={goToBuilder}
            onNavigateToView={goToView}
          />
        </Suspense>

        <SiteMap locale={locale} onNavigate={goToView} onGetStarted={goToBuilder} />
        <SiteFooter locale={locale} onNavigate={goToView} />
      </div>
      </LocaleContext.Provider>
    )
  }

  return (
    <LocaleContext.Provider value={locale}>
    <div
      className={`one-pager one-pager--builder${
        headerProps?.builderMode === 'direct' ? ' one-pager--direct-edit' : ''
      }`}
    >
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
          onOpenTemplateGallery={headerProps.onOpenTemplateGallery}
          styleVariants={headerProps.styleVariants}
          styleVariantId={headerProps.styleVariantId}
          isStyleVariantModified={headerProps.isStyleVariantModified}
          onSelectStyleVariant={headerProps.onSelectStyleVariant}
          cvFontId={headerProps.cvFontId}
          onCvFontChange={headerProps.onCvFontChange}
          cvHeadingColor={headerProps.cvHeadingColor}
          onCvHeadingColorChange={headerProps.onCvHeadingColorChange}
          searchQuery={headerProps.searchQuery}
          onSearchChange={headerProps.onSearchChange}
          isFullscreenPreview={headerProps.isFullscreenPreview}
          onToggleFullscreenPreview={headerProps.onToggleFullscreenPreview}
          isResponsivePreview={headerProps.isResponsivePreview}
          onToggleResponsivePreview={headerProps.onToggleResponsivePreview}
          activeExport={headerProps.activeExport}
          isActionBusy={headerProps.isActionBusy}
          onExport={headerProps.onExport}
          onCopyShareLink={headerProps.onCopyShareLink}
          onOpenSettings={headerProps.onOpenSettings}
          builderMode={headerProps.builderMode}
          onSetBuilderMode={headerProps.onSetBuilderMode}
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
    </div>
    </LocaleContext.Provider>
  )
}

export default App
