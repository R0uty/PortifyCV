import { lazy, Suspense, useEffect, useMemo, useState } from 'react'

import InternalNavLink from '../components/InternalNavLink'
import StyleSwatchGroup from '../components/StyleSwatchGroup'
import { cvTemplates, getCvTemplate } from '../utils/cvTemplates'
import { DEFAULT_STYLE_VARIANT_ID, getVariantLook, parseStyleVariantParam } from '../utils/templateVariants'
import { TEMPLATE_PAGE_COPY } from '../utils/templatePageCopy'
import { getTemplateExamples, isTemplateExample, loadExampleCv, peekExampleCv } from '../utils/exampleCvs'
import { ROUTES, templatePath } from '../utils/routes'
import { fieldSearch, parseFieldParam } from '../utils/templateFields'
import { TEMPLATE_VIEW_PREFIX } from '../utils/pageMeta'
import { demoCvData } from '../utils/cvForm'
import { withPlaceholderPhoto } from '../utils/thumbnailCv'
import { hideEmptySections } from '../utils/sectionContent'

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
      style: 'Tyyli',
      atsView: 'ATS-näkymä',
      useExample: 'Käytä tätä esimerkkiä',
      useTemplate: 'Aloita tyhjästä tällä pohjalla',
      tipsTitle: 'Vinkkejä tähän pohjaan',
      previous: 'Edellinen pohja',
      next: 'Seuraava pohja',
      all: 'Kaikki pohjat',
      pagerNav: 'Pohjien selaus',
      previewCaption: (role, label) => `Esikatselu: ${role}-esimerkki ${label}-pohjassa`,
      facts: { split: '2 palstaa', single: '1 palsta', sections: (n) => `${n} osiota` },
    }
  }

  return {
    breadcrumb: 'Templates',
    heading: (label) => `${label} CV template`,
    bestFor: 'Best for:',
    examples: 'Examples',
    style: 'Style',
    atsView: 'ATS view',
    useExample: 'Use this example',
    useTemplate: 'Start blank with this template',
    tipsTitle: 'Tips for this template',
    previous: 'Previous template',
    next: 'Next template',
    all: 'All templates',
    pagerNav: 'Template navigation',
    previewCaption: (role, label) => `Preview: ${role} example in the ${label} template`,
    facts: { split: '2 columns', single: '1 column', sections: (n) => `${n} sections` },
  }
}

function readExampleParam() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('example')
}

// ?style= (Phase 4): the look to open the page on, from a Free CV
// Templates card or a builder gallery card's "View examples". An unknown
// id is Original. The page remounts per template (App's key={view}), so
// moving to another template reads its own URL afresh.
function readStyleParam(templateId) {
  if (typeof window === 'undefined') return DEFAULT_STYLE_VARIANT_ID
  return parseStyleVariantParam(templateId, new URLSearchParams(window.location.search).get('style'))
}

// ?field= (1.6.16): the Free CV Templates filter this page was opened
// from. The page never shows it; it only passes it on, so the links back
// to the grid and to the previous/next template keep that filter.
function readFieldParam() {
  if (typeof window === 'undefined') return null
  return parseFieldParam(new URLSearchParams(window.location.search).get('field'))
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
  // Already loaded (always in the build-time pre-render), so the first
  // render shows the example rather than a placeholder.
  const [loadedExample, setLoadedExample] = useState(() => {
    const cv = exampleId ? peekExampleCv(exampleId, resolvedLocale) : undefined
    return cv === undefined ? null : { id: exampleId, locale: resolvedLocale, cv }
  })
  const [atsView, setAtsView] = useState(false)
  const [styleId, setStyleId] = useState(() => readStyleParam(templateId))
  const [field] = useState(readFieldParam)
  const fieldQuery = fieldSearch(field)

  useEffect(() => {
    let cancelled = false
    loadExampleCv(exampleId, resolvedLocale).then((cv) => {
      if (!cancelled) setLoadedExample({ id: exampleId, locale: resolvedLocale, cv })
    })
    return () => { cancelled = true }
  }, [exampleId, resolvedLocale])

  // Only trust the loaded result when it matches what's currently
  // selected — otherwise the previous example's CV would briefly show
  // under the newly-selected radio while the new one is still loading.
  // Distinguish "still loading" (loadedExample doesn't match yet, so the
  // caller should show a placeholder) from "loaded, but resolved to null"
  // (a missing/failed example file — the only case that falls back to the
  // demo CV). Without this, the demo CV (John Doe) would flash under
  // the selected radio while a real example is still in flight.
  const exampleMatchesSelection = Boolean(
    loadedExample && loadedExample.id === exampleId && loadedExample.locale === resolvedLocale,
  )
  const isLoadingExample = !exampleMatchesSelection
  const exampleCv = exampleMatchesSelection ? loadedExample.cv : null

  const selectExample = (nextId) => {
    setExampleId(nextId)
    const url = new URL(window.location.href)
    url.searchParams.set('example', nextId)
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`)
  }

  // Like selectExample: the look lives in the URL, so a reload or a shared
  // link keeps it. Original is the absence of ?style=.
  const selectStyle = (nextId) => {
    setStyleId(nextId)
    const url = new URL(window.location.href)
    if (nextId === DEFAULT_STYLE_VARIANT_ID) {
      url.searchParams.delete('style')
    } else {
      url.searchParams.set('style', nextId)
    }
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`)
  }

  // A not-yet-written or failed example falls back to the demo CV rather
  // than an empty frame. Empty sections are hidden here, page-preview only
  // (hideEmptySections), so an unfilled section's placeholder text never
  // shows on the marketing page — the builder and the example data itself
  // are untouched.
  const previewCv = useMemo(
    () => withPlaceholderPhoto(hideEmptySections(exampleCv ?? demoCvData)),
    [exampleCv],
  )

  const index = cvTemplates.findIndex((entry) => entry.id === templateId)
  const neighbour = (offset) => cvTemplates[(index + offset + cvTemplates.length) % cvTemplates.length]
  const previous = getCvTemplate(neighbour(-1).id, resolvedLocale)
  const next = getCvTemplate(neighbour(1).id, resolvedLocale)
  const goToTemplate = (target) => onNavigateToView(`${TEMPLATE_VIEW_PREFIX}${target.id}`, { search: fieldQuery })
  const goToGrid = () => onNavigateToView('freeTemplates', { search: fieldQuery })

  const selectedExampleRole = examples.find((example) => example.id === exampleId)?.role ?? ''
  const sectionCount = template.primarySections.length + (template.secondarySections?.length ?? 0)
  const facts = [
    template.layout === 'split' ? copy.facts.split : copy.facts.single,
    copy.facts.sections(sectionCount),
  ]

  return (
    <div className="landing-page template-page">
      <nav className="template-page__breadcrumb" aria-label={copy.breadcrumb}>
        <InternalNavLink to={`${ROUTES.freeTemplates}${fieldQuery}`} onNavigate={goToGrid}>
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
          <StyleSwatchGroup
            templateId={templateId}
            value={styleId}
            onChange={selectStyle}
            locale={resolvedLocale}
            name="template-style"
            label={copy.style}
            size="page"
          />

          <label className="template-page__ats-toggle">
            <input type="checkbox" checked={atsView} onChange={(event) => setAtsView(event.target.checked)} />
            <span>{copy.atsView}</span>
          </label>

          <div className="template-page__actions">
            <button type="button" className="landing-cta" onClick={() => onGetStarted(templateId, exampleId, { style: styleId })}>
              {copy.useExample}
            </button>
            <button
              type="button"
              className="templates-page-card__cta"
              onClick={() => onGetStarted(templateId, undefined, { blank: true, style: styleId })}
            >
              {copy.useTemplate}
            </button>
          </div>
        </div>

        <div className="template-page__preview" aria-busy={isLoadingExample}>
          <span className="sr-only">
            {copy.previewCaption(selectedExampleRole, template.label)}
          </span>
          {isLoadingExample ? (
            <div className="template-page__preview-placeholder" aria-hidden="true" />
          ) : (
            <Suspense fallback={<div className="template-page__preview-placeholder" aria-hidden="true" />}>
              <ScaledPreview
                formData={previewCv}
                template={templateId}
                locale={resolvedLocale}
                atsFriendlyMode={atsView}
                {...getVariantLook(templateId, styleId)}
              />
            </Suspense>
          )}
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

      <nav className="template-page__pager" aria-label={copy.pagerNav}>
        <InternalNavLink to={`${templatePath(previous.slug)}${fieldQuery}`} onNavigate={() => goToTemplate(previous)}>
          ← {copy.previous}: {previous.label}
        </InternalNavLink>
        <InternalNavLink to={`${ROUTES.freeTemplates}${fieldQuery}`} onNavigate={goToGrid}>
          {copy.all}
        </InternalNavLink>
        <InternalNavLink to={`${templatePath(next.slug)}${fieldQuery}`} onNavigate={() => goToTemplate(next)}>
          {copy.next}: {next.label} →
        </InternalNavLink>
      </nav>
    </div>
  )
}

export default TemplateDetailPage
