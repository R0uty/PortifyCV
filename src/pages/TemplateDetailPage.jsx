import { lazy, Suspense, useMemo } from 'react'

import InternalNavLink from '../components/InternalNavLink'
import { getCvTemplate, resolveTemplateAccent } from '../utils/cvTemplates'
import { TEMPLATE_PAGE_COPY } from '../utils/templatePageCopy'
import { ROUTES } from '../utils/routes'
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
      useTemplate: 'Aloita tyhjästä tällä pohjalla',
    }
  }

  return {
    breadcrumb: 'Templates',
    heading: (label) => `${label} CV template`,
    bestFor: 'Best for:',
    useTemplate: 'Start blank with this template',
  }
}

function TemplateDetailPage({ templateId, locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const resolvedLocale = locale === 'fi' ? 'fi' : 'en'
  const copy = getCopy(resolvedLocale)
  const template = getCvTemplate(templateId, resolvedLocale)
  const pageCopy = TEMPLATE_PAGE_COPY[templateId]?.[resolvedLocale]
  const previewCv = useMemo(() => withPlaceholderPhoto(demoCvData), [])

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
          <div className="template-page__actions">
            <button type="button" className="landing-cta" onClick={() => onGetStarted(templateId)}>
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
              accentColor={resolveTemplateAccent(null, templateId)}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default TemplateDetailPage
