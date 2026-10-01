import { lazy, Suspense, useEffect, useMemo, useState } from 'react'

import InternalNavLink from '../components/InternalNavLink'
import { cvTemplates, getCvTemplate, resolveTemplateAccent } from '../utils/cvTemplates'
import { TEMPLATE_PAGE_COPY } from '../utils/templatePageCopy'
import { getTemplateExamples, isTemplateExample, loadExampleCv } from '../utils/exampleCvs'
import { ROUTES, templatePath } from '../utils/routes'
import { TEMPLATE_VIEW_PREFIX } from '../utils/pageMeta'
import { demoCvData } from '../utils/cvForm'
import { withPlaceholderPhoto } from '../utils/thumbnailCv'

// CVPreview is the heaviest import here; lazy so the page's own chunk
// stays small. It shares the CVPreview chunk with the landing page and
// the builder.
const ScaledPreview = lazy(() => import('../components/ScaledPreview'))

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      breadcrumb: 'Pohjat',
      heading: (label) => `${label} – CV-pohja`,
      bestFor: 'Sopii:',
      examples: 'Esimerkit',
      atsView: 'ATS-näkymä',
      useExample: 'Käytä tätä esimerkkiä',
      useTemplate: 'Aloita tyhjästä tällä pohjalla',
      tipsTitle: 'Vinkkejä tähän pohjaan',
      previous: 'Edellinen pohja',
      next: 'Seuraava pohja',
      all: 'Kaikki pohjat',
      facts: { split: '2 palstaa', single: '1 palsta', sections: (n) => `${n} osiota` },
    }
  }

  return {
    breadcrumb: 'Templates',
    heading: (label) => `${label} CV template`,
    bestFor: 'Best for:',
    examples: 'Examples',
    atsView: 'ATS view',
    useExample: 'Use this example',
    useTemplate: 'Start blank with this template',
    tipsTitle: 'Tips for this template',
    previous: 'Previous template',
    next: 'Next template',
    all: 'All templates',
    facts: { split: '2 columns', single: '1 column', sections: (n) => `${n} sections` },
  }
}

function readExampleParam() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('example')
}

function TemplateDetailPage({ templateId, locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const resolvedLocale = locale === 'fi' ? 'fi' : 'en'
  const copy = getCopy(resolvedLocale)
  const template = getCvTemplate(templateId, resolvedLocale)
  const pageCopy = TEMPLATE_PAGE_COPY[templateId]?.[resolvedLocale]
  const examples = useMemo(() => getTemplateExamples(templateId, resolvedLocale), [templateId, resolvedLocale])

  const [exampleId, setExampleId] = useState(() => {
    const requested = readExampleParam()
    return isTemplateExample(templateId, requested) ? requested : examples[0]?.id ?? null
  })
  const [exampleCv, setExampleCv] = useState(null)
  const [atsView, setAtsView] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadExampleCv(exampleId, resolvedLocale).then((cv) => {
      if (!cancelled) setExampleCv(cv)
    })
    return () => { cancelled = true }
  }, [exampleId, resolvedLocale])

  const selectExample = (nextId) => {
    setExampleId(nextId)
    const url = new URL(window.location.href)
    url.searchParams.set('example', nextId)
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`)
  }

  // A not-yet-written or failed example falls back to the demo CV rather
  // than an empty frame.
  const previewCv = useMemo(() => withPlaceholderPhoto(exampleCv ?? demoCvData), [exampleCv])

  const index = cvTemplates.findIndex((entry) => entry.id === templateId)
  const neighbour = (offset) => cvTemplates[(index + offset + cvTemplates.length) % cvTemplates.length]
  const previous = getCvTemplate(neighbour(-1).id, resolvedLocale)
  const next = getCvTemplate(neighbour(1).id, resolvedLocale)
  const goToTemplate = (target) => onNavigateToView(`${TEMPLATE_VIEW_PREFIX}${target.id}`)

  const sectionCount = template.primarySections.length + (template.secondarySections?.length ?? 0)
  const facts = [
    template.layout === 'split' ? copy.facts.split : copy.facts.single,
    copy.facts.sections(sectionCount),
  ]

  return (
    <div className="landing-page template-page">
      <nav className="template-page__breadcrumb" aria-label={copy.breadcrumb}>
        <InternalNavLink to={ROUTES.freeTemplates} onNavigate={() => onNavigateToView('freeTemplates')}>
          {copy.breadcrumb}
        </InternalNavLink>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">{template.label}</span>
      </nav>

      <div className="template-page__layout">
        <div className="template-page__info">
          <h1 className="landing-section__title">{copy.heading(template.label)}</h1>
          <p className="landing-section__subtitle">{template.description}</p>
          {pageCopy && (
            <p className="template-page__best-for">
              <strong>{copy.bestFor}</strong> {pageCopy.bestFor}
            </p>
          )}
          <ul className="template-page__facts">
            {facts.map((fact) => <li key={fact}>{fact}</li>)}
          </ul>

          {examples.length > 0 && (
            <div className="template-page__examples" role="radiogroup" aria-label={copy.examples}>
              {examples.map((example) => (
                <label key={example.id} className="template-page__example">
                  <input
                    type="radio"
                    name="template-example"
                    value={example.id}
                    checked={example.id === exampleId}
                    onChange={() => selectExample(example.id)}
                  />
                  <span>{example.role}</span>
                </label>
              ))}
            </div>
          )}

          <label className="template-page__ats-toggle">
            <input type="checkbox" checked={atsView} onChange={(event) => setAtsView(event.target.checked)} />
            <span>{copy.atsView}</span>
          </label>

          <div className="template-page__actions">
            <button type="button" className="landing-cta" onClick={() => onGetStarted(templateId, exampleId)}>
              {copy.useExample}
            </button>
            <button type="button" className="templates-page-card__cta" onClick={() => onGetStarted(templateId)}>
              {copy.useTemplate}
            </button>
          </div>
        </div>

        <div className="template-page__preview">
          <Suspense fallback={<div className="template-page__preview-placeholder" aria-hidden="true" />}>
            <ScaledPreview
              formData={previewCv}
              template={templateId}
              locale={resolvedLocale}
              atsFriendlyMode={atsView}
              accentColor={resolveTemplateAccent(null, templateId)}
            />
          </Suspense>
        </div>
      </div>

      {pageCopy && (
        <div className="landing-section">
          <h2 className="landing-section__title" style={{ fontSize: 'var(--text-title)' }}>{copy.tipsTitle}</h2>
          <ul className="template-page__tips">
            {pageCopy.tips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        </div>
      )}

      <nav className="template-page__pager" aria-label={copy.all}>
        <InternalNavLink to={templatePath(previous.slug)} onNavigate={() => goToTemplate(previous)}>
          ← {copy.previous}: {previous.label}
        </InternalNavLink>
        <InternalNavLink to={ROUTES.freeTemplates} onNavigate={() => onNavigateToView('freeTemplates')}>
          {copy.all}
        </InternalNavLink>
        <InternalNavLink to={templatePath(next.slug)} onNavigate={() => goToTemplate(next)}>
          {copy.next}: {next.label} →
        </InternalNavLink>
      </nav>
    </div>
  )
}

export default TemplateDetailPage
