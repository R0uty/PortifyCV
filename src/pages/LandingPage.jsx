import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import BuilderWalkthroughFigure from '../components/BuilderWalkthroughFigure'
import InternalNavLink from '../components/InternalNavLink'
import { cvTemplates } from '../utils/cvTemplates'
import { LANDING_FAQ } from '../utils/landingFaq'
import { VIEW_HEAD } from '../utils/pageMeta'
import { ROUTES } from '../utils/routes'

// The hero's picture (1.6.32): the builder itself, in Direct Edit with a
// section's popup open, captured by `npm run thumbnails`. Its intrinsic
// size reserves the space, so nothing shifts while it loads.
const PRODUCT_SHOT_WIDTH = 1280
const PRODUCT_SHOT_HEIGHT = 800

// Lazy-loaded: the templates section sits below the fold and brings the
// look registry and field filter with it, which the hero doesn't need.
const LandingTemplatesByField = lazy(() => import('../components/LandingTemplatesByField'))


// Read off the template registry instead of a hardcoded number — this
// count previously drifted out of sync with cvTemplates.js (copy said 13,
// the registry had grown to 14) after a template was added without the
// landing page being updated to match.
const TEMPLATE_COUNT = cvTemplates.length

function getLandingCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Ei kirjautumista. Ei tallennettua dataa.',
      startButton: 'Aloita rakentaminen',
      viewTemplatesButton: 'Katso pohjat',
      howItWorksLink: 'Katso miten se toimii',
      title: 'Ilmainen CV-työkalu. Tee CV, ota se mukaan, valmis.',
      subtitle: 'Napsauta CV:tä ja kirjoita. Valitse pohja ja ota CV mukaan PDF- tai Word-tiedostona tai jakolinkkinä.',
      previewAlt: 'PortifyCV-editori: CV, jonka Esittely-osio on auki muokattavaksi sen vieressä.',
      chipsLabel: 'Mukana',
      chips: [
        { label: `${TEMPLATE_COUNT} pohjaa × 3 tyyliä`, view: 'freeTemplates' },
        { label: 'ATS-näkymä', view: 'atsGuide' },
        { label: 'Suomi ja englanti', view: 'finnishCv' },
        { label: 'Hakemuskirje mukana', view: 'coverLetterExamples' },
      ],
      whyTitle: 'Miksi PortifyCV',
      why: [
        {
          heading: 'Ei tiliä. Ei kirjautumista. Siinä koko juttu.',
          body: 'Ei rekisteröitymistä, ei sähköpostivahvistusta, ei tiliä ylläpidettäväksi. Avaa sivu, ala kirjoittaa ja vie CV kun olet valmis — muuta ei tarvita.',
        },
        {
          heading: 'Mikään ei koskaan päädy palvelimelle',
          body: 'Jokainen vienti (PDF, Word, HTML, JSON) ja jakolinkki muodostetaan kokonaan selaimessasi. Toisin kuin tiliä vaativat CV-työkalut, tietojasi ei koskaan ladata, tallenneta tai näe kukaan muu — koska ne eivät koskaan poistu laitteeltasi.',
        },
        {
          heading: 'Rakennettu rekrytointijärjestelmiä varten',
          body: 'ATS-tila muotoilee CV:n järjestelmien luettavaksi ilman sarakkeita tai grafiikkaa, ja avainsanapisteytys näyttää mitä puuttuu.',
        },
      ],
      howTitle: 'Näin se toimii',
      steps: [
        { step: 'template', title: 'Valitse pohja', body: `${TEMPLATE_COUNT} asettelua, kolme tyyliä kussakin. Vaihda milloin vain, tekstisi säilyy.`, figureLabel: 'Pohjagalleria: alasuodattimet pohjakorttien yllä, kullakin kortilla kolme tyyliä.' },
        { step: 'edit', title: 'Muokkaa suoraan CV:ssä', body: 'Napsauta mitä tahansa tekstiä ja kirjoita, tai avaa osion kynä nähdäksesi kaikki sen kentät.', figureLabel: 'Editori Suora muokkaus -tilassa: demo-CV, jonka yhteenvedon kentät ovat auki ponnahdusikkunassa sen vieressä.' },
        { step: 'export', title: 'Vie tai jaa', body: 'Lataa PDF- tai Word-tiedosto tai kopioi jakolinkki. Mitään ei ladata palvelimelle.', figureLabel: 'Avattu Vie-valikko: PDF, HTML, JSON, Word ja jakolinkki.' },
      ],
      howLink: 'Lue koko käyttöopas',
      templatesTitle: 'Katso pohjat',
      templatesSubtitle: 'Valitse alasi nähdäksesi siihen sopivat pohjat, kukin yhdessä kolmesta tyylistään.',
      templatesCta: `Selaa kaikkia ${TEMPLATE_COUNT} pohjaa`,
      guidesTitle: 'Oppaat ja esimerkit',
      guides: [
        { view: 'howToWrite', path: ROUTES.howToWrite, title: 'Näin kirjoitat CV:n', body: 'Osiot, yhteenveto joka sanoo jotain, ja kohdat jotka näyttävät tuloksia.' },
        { view: 'atsGuide', path: ROUTES.atsGuide, title: 'ATS-ystävällinen CV-opas', body: 'Mitä hakijaseurantajärjestelmät lukevat, mikä ne rikkoo ja mikä vientimuoto valita.' },
        { view: 'cvExamples', path: ROUTES.cvExamples, title: 'CV-esimerkkejä aloittain', body: 'Kehittäjän, IT-alan, tietoturva-alan ja suomalaisen CV:n esimerkit sekä kokonaiset CV:t.' },
        { view: 'coverLetterExamples', path: ROUTES.coverLetterExamples, title: 'Saatekirje-esimerkkejä', body: 'Heikot ja vahvat aloitukset, keskiosat ja lopetukset sekä luonnos CV:si pohjalta.' },
      ],
      faqTitle: 'Usein kysytyt kysymykset',
    }
  }

  return {
    kicker: 'No login. No data saved.',
    startButton: 'Start building',
    viewTemplatesButton: 'View templates',
    howItWorksLink: 'See how it works',
    title: 'Free CV builder. Build it, take it, done.',
    subtitle: 'Click your CV and type. Pick a template, then take it with you as a PDF, a Word file or a share link.',
    previewAlt: 'The PortifyCV editor: a CV with its About section open for editing beside it.',
    chipsLabel: 'Included',
    chips: [
      { label: `${TEMPLATE_COUNT} templates × 3 looks`, view: 'freeTemplates' },
      { label: 'ATS view', view: 'atsGuide' },
      { label: 'English & Finnish', view: 'finnishCv' },
      { label: 'Cover letter included', view: 'coverLetterExamples' },
    ],
    whyTitle: 'Why use PortifyCV',
    why: [
      {
        heading: 'No account. No login. That’s the whole point.',
        body: 'Skip the sign-up, the email confirmation, the account to manage. Open the page, start typing, and export when you’re done — there is nothing else to it.',
      },
      {
        heading: 'Nothing ever touches a server',
        body: 'Every export (PDF, Word, HTML, JSON) and every share link is generated entirely in your browser. Unlike CV builders that require an account, your data is never uploaded, stored, or seen by anyone — because it never leaves your device.',
      },
      {
        heading: 'Built for applicant tracking systems',
        body: 'Toggle ATS mode for a layout that parsers can actually read — no columns, icons, or tables to trip them up — plus keyword scoring that shows what your CV is missing.',
      },
    ],
    howTitle: 'How it works',
    steps: [
      { step: 'template', title: 'Pick a template', body: `${TEMPLATE_COUNT} layouts, three looks each. Switch any time; your text stays.`, figureLabel: 'The template gallery: field filters above the template cards, each with its three looks.' },
      { step: 'edit', title: 'Edit right on the CV', body: 'Click any text and type, or open a section’s pencil for all its fields.', figureLabel: 'The builder in Direct Edit: the demo CV, with its summary\'s fields open in a popup beside it.' },
      { step: 'export', title: 'Export or share', body: 'Download a PDF or Word file, or copy a share link. Nothing is uploaded.', figureLabel: 'The open Export menu: PDF, HTML, JSON, Word and a share link.' },
    ],
    howLink: 'Read the full walkthrough',
    templatesTitle: 'See the templates',
    templatesSubtitle: 'Pick your field to see the templates that suit it, each in one of its three looks.',
    templatesCta: `Browse all ${TEMPLATE_COUNT} templates`,
    guidesTitle: 'Guides and examples',
    guides: [
      { view: 'howToWrite', path: ROUTES.howToWrite, title: 'How to write a CV', body: 'Sections, a summary that says something, and bullets that show impact.' },
      { view: 'atsGuide', path: ROUTES.atsGuide, title: 'ATS-friendly CV guide', body: 'What applicant tracking systems read, what breaks them, and which export to use.' },
      { view: 'cvExamples', path: ROUTES.cvExamples, title: 'CV examples by field', body: 'Developer, IT, cybersecurity and Finnish CVs, with full example CVs.' },
      { view: 'coverLetterExamples', path: ROUTES.coverLetterExamples, title: 'Cover letter examples', body: 'Weak and strong openings, middles and closings, and a draft from your CV.' },
    ],
    faqTitle: 'Frequently asked questions',
  }
}

function LandingPage({
  locale = 'en',
  onGetStarted = () => {},
  onNavigateToView = () => {},
}) {
  const copy = getLandingCopy(locale)
  const actionsRef = useRef(null)
  // Phones only (CSS): once the hero's buttons have scrolled up out of
  // view, a slim bar at the bottom offers "Start building" again.
  const [showStickyCta, setShowStickyCta] = useState(false)

  // The header's FAQ link lands here as /#faq. The lazy sections above the
  // FAQ grow after the first paint, so keep it in place while the page
  // settles (up to 1.5s), unless the visitor starts scrolling first.
  useEffect(() => {
    if (window.location.hash !== '#faq' || typeof ResizeObserver === 'undefined') {
      return undefined
    }
    const snap = () => document.getElementById('faq')?.scrollIntoView({ block: 'start' })
    const observer = new ResizeObserver(snap)
    const stop = () => {
      observer.disconnect()
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', stop)
    }
    snap()
    observer.observe(document.body)
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', stop)
    const timer = window.setTimeout(stop, 1500)
    return () => {
      window.clearTimeout(timer)
      stop()
    }
  }, [])

  useEffect(() => {
    const actions = actionsRef.current
    if (!actions || typeof IntersectionObserver === 'undefined') {
      return undefined
    }
    const observer = new IntersectionObserver(([entry]) => {
      setShowStickyCta(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(actions)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="landing-page">
      <div className="landing-grid">
        <div className="landing-hero">
          <p className="landing-kicker">{copy.kicker}</p>
          <h1 className="landing-title">{copy.title}</h1>
          <p className="landing-subtitle">{copy.subtitle}</p>
          <div className="landing-hero__actions" ref={actionsRef}>
            <button type="button" className="landing-cta" onClick={() => onGetStarted()}>
              {copy.startButton}
            </button>
            <InternalNavLink
              to={ROUTES.freeTemplates}
              onNavigate={() => onNavigateToView('freeTemplates')}
              className="landing-hero__templates"
            >
              {copy.viewTemplatesButton}
            </InternalNavLink>
            <InternalNavLink
              to={ROUTES.howToUse}
              onNavigate={() => onNavigateToView('howToUse')}
              className="landing-hero__link"
            >
              {copy.howItWorksLink}
            </InternalNavLink>
          </div>
          {/* Each chip links to the page about it (1.6.66): they looked
              like buttons and did nothing. */}
          <ul className="landing-chips" aria-label={copy.chipsLabel}>
            {copy.chips.map((chip) => (
              <li key={chip.view}>
                <InternalNavLink to={ROUTES[chip.view]} onNavigate={() => onNavigateToView(chip.view)}>
                  {chip.label}
                </InternalNavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="landing-preview">
          <figure className="landing-product-shot">
            <img
              src={`/thumbnails/product/direct-edit-${locale === 'fi' ? 'fi' : 'en'}.webp`}
              width={PRODUCT_SHOT_WIDTH}
              height={PRODUCT_SHOT_HEIGHT}
              alt={copy.previewAlt}
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        </div>
      </div>

      <div className="landing-section">
        <h2 className="landing-section__title">{copy.howTitle}</h2>
        <ol className="landing-steps">
          {copy.steps.map((item, index) => (
            <li className="landing-step" key={item.step}>
              <div className="landing-step__figure">
                <BuilderWalkthroughFigure step={item.step} label={item.figureLabel} number={String(index + 1)} />
              </div>
              <h3 className="landing-step__title">{item.title}</h3>
              <p className="landing-step__body">{item.body}</p>
            </li>
          ))}
        </ol>
        <InternalNavLink to={ROUTES.howToUse} onNavigate={() => onNavigateToView('howToUse')} className="landing-hero__link">
          {copy.howLink}
        </InternalNavLink>
      </div>

      <div className="landing-section">
        <h2 className="landing-section__title">{copy.templatesTitle}</h2>
        <p className="landing-section__subtitle">{copy.templatesSubtitle}</p>
        <Suspense fallback={null}>
          <LandingTemplatesByField locale={locale} browseLabel={copy.templatesCta} onNavigateToView={onNavigateToView} />
        </Suspense>
      </div>

      <div className="landing-section">
        <h2 className="landing-section__title">{copy.whyTitle}</h2>
        <div className="landing-why-grid">
          {copy.why.map((item) => (
            <div className="landing-why-card" key={item.heading}>
              <h3 className="landing-why-card__heading">{item.heading}</h3>
              <p className="landing-why-card__body">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-section">
        <h2 className="landing-section__title">{copy.guidesTitle}</h2>
        <div className="landing-guides">
          {copy.guides.map((guide) => (
            <InternalNavLink
              key={guide.view}
              to={guide.path}
              onNavigate={() => onNavigateToView(guide.view)}
              className="examples-hub-card"
            >
              <span className="examples-hub-card__title">{guide.title}</span>
              <span className="examples-hub-card__body">{guide.body}</span>
            </InternalNavLink>
          ))}
        </div>
      </div>

      <div className="landing-section landing-faq-section" id="faq">
        <h2 className="landing-section__title">{copy.faqTitle}</h2>
        <div className="landing-faq">
          {LANDING_FAQ[locale === 'fi' ? 'fi' : 'en'].map((item) => (
            <details className="landing-faq__item" key={item.q}>
              <summary className="landing-faq__question">{item.q}</summary>
              <p className="landing-faq__answer">
                {item.before}
                {item.link ? (
                  <InternalNavLink to={VIEW_HEAD[item.link.view].path} onNavigate={() => onNavigateToView(item.link.view)}>
                    {item.link.text}
                  </InternalNavLink>
                ) : null}
                {item.after}
              </p>
            </details>
          ))}
        </div>
      </div>

      <div className="landing-sticky-cta print:hidden" hidden={!showStickyCta}>
        <button type="button" className="landing-cta" onClick={() => onGetStarted()}>
          {copy.startButton}
        </button>
      </div>
    </section>
  )
}

export default LandingPage
