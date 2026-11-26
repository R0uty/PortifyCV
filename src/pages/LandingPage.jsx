import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import BuilderWalkthroughFigure from '../components/BuilderWalkthroughFigure'
import InternalNavLink from '../components/InternalNavLink'
import { LANDING_FAQ } from '../utils/landingFaq'
import { VIEW_HEAD } from '../utils/pageMeta'
import { ROUTES } from '../utils/routes'
import { landingPage } from '../i18n/pages/landing'

// The hero's picture (1.6.32): the builder itself, in Direct Edit with a
// section's popup open, captured by `npm run thumbnails`. Its intrinsic
// size reserves the space, so nothing shifts while it loads.
const PRODUCT_SHOT_WIDTH = 1280
const PRODUCT_SHOT_HEIGHT = 800

// Lazy-loaded: the templates section sits below the fold and brings the
// look registry and field filter with it, which the hero doesn't need.
const LandingTemplatesByField = lazy(() => import('../components/LandingTemplatesByField'))


function LandingPage({
  locale = 'en',
  onGetStarted = () => {},
  onNavigateToView = () => {},
}) {
  const copy = landingPage.copy(locale)
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
