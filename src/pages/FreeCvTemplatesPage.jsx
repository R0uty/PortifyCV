import { useMemo, useState } from 'react'

import StyleSwatchGroup from '../components/StyleSwatchGroup'
import TemplateFieldFilter from '../components/TemplateFieldFilter'
import TemplateThumbnailImage from '../components/TemplateThumbnailImage'
import InternalNavLink from '../components/InternalNavLink'
import { getCvTemplates } from '../utils/cvTemplates'
import { ROUTES, templatePath } from '../utils/routes'
import { TEMPLATE_VIEW_PREFIX } from '../utils/pageMeta'
import { DEFAULT_STYLE_VARIANT_ID, getTemplateVariant, styleVariantSearch } from '../utils/templateVariants'
import { filterTemplatesByField, parseFieldParam } from '../utils/templateFields'
import { freeTemplatesPage } from '../i18n/pages/freeTemplates'

// A template page link's query: the card's ?style= plus the grid's
// ?field=, either of which may be absent.
function cardSearch(styleSearch, field) {
  const params = new URLSearchParams(styleSearch)
  if (field) {
    params.set('field', field)
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

// The field filter lives in ?field= (1.6.12), so a reload, a shared link
// and Back from a template page all keep it. Read once, on mount.
function readFieldParam() {
  if (typeof window === 'undefined') {
    return null
  }
  return parseFieldParam(new URLSearchParams(window.location.search).get('field'))
}

function FreeCvTemplatesPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const resolvedLocale = locale === 'fi' ? 'fi' : 'en'
  const copy = freeTemplatesPage.copy(resolvedLocale)
  const templates = useMemo(() => getCvTemplates(resolvedLocale), [resolvedLocale])
  // The look previewed on each card (Phase 4); every card starts on
  // Original. It carries into the card's links and "Use this template".
  const [looks, setLooks] = useState({})
  const [field, setField] = useState(readFieldParam)
  const shownTemplates = useMemo(() => filterTemplatesByField(templates, field), [templates, field])

  // Like the template page's selectStyle: replace, don't push, so Back
  // leaves the page instead of stepping through chips. All is the absence
  // of ?field=.
  const selectField = (nextField) => {
    setField(nextField)
    const url = new URL(window.location.href)
    if (nextField) {
      url.searchParams.set('field', nextField)
    } else {
      url.searchParams.delete('field')
    }
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`)
  }

  return (
    <div className="landing-page">
      <div className="landing-section" style={{ paddingTop: 0 }}>
        <p className="landing-kicker">{copy.kicker}</p>
        <h1 className="landing-section__title">{copy.title}</h1>
        <p className="landing-section__subtitle">{copy.intro}</p>
      </div>

      <div className="landing-section">
        <div className="templates-page-filter">
          <TemplateFieldFilter
            value={field}
            onChange={selectField}
            locale={resolvedLocale}
            shownCount={shownTemplates.length}
            totalCount={templates.length}
            name="grid-field"
          />
        </div>
        <div className="templates-page-grid">
          {shownTemplates.map((template) => {
            const look = looks[template.id] ?? DEFAULT_STYLE_VARIANT_ID
            // The card's look and the grid's filter (1.6.16), so the
            // template page can link back to this same filtered grid.
            const search = cardSearch(styleVariantSearch(look), field)
            const openTemplatePage = () => onNavigateToView(`${TEMPLATE_VIEW_PREFIX}${template.id}`, { search })

            return (
              <div className="templates-page-card" key={template.id}>
                {/* The look's pre-rendered image (1.6.30). Clicking it opens
                    the template page; keyboard and screen-reader users get
                    the name link and "View examples" below, so it stays
                    aria-hidden and out of the tab order. Its alt text is
                    still read by search engines and image search. */}
                <div
                  className="templates-page-card__thumb"
                  aria-hidden="true"
                  onClick={openTemplatePage}
                >
                  <TemplateThumbnailImage
                    templateId={template.id}
                    styleVariantId={look}
                    locale={resolvedLocale}
                    alt={`${template.label} CV template, ${getTemplateVariant(template.id, look).label[resolvedLocale]}`}
                  />
                </div>
                <div className="templates-page-card__looks">
                  <StyleSwatchGroup
                    templateId={template.id}
                    value={look}
                    onChange={(variantId) => setLooks((current) => ({ ...current, [template.id]: variantId }))}
                    locale={resolvedLocale}
                    name={`grid-look-${template.id}`}
                    label={`${copy.style}: ${template.label}`}
                  />
                </div>
                <InternalNavLink
                  to={`${templatePath(template.slug)}${search}`}
                  onNavigate={openTemplatePage}
                  className="templates-page-card__name"
                >
                  {template.label}
                </InternalNavLink>
                <p className="templates-page-card__description">{template.description}</p>
                <div className="templates-page-card__actions">
                  <button
                    type="button"
                    className="templates-page-card__cta"
                    onClick={() => onGetStarted(template.id, undefined, { style: look })}
                  >
                    {copy.useTemplate}
                  </button>
                  {/* Same destination as the thumbnail and name links above,
                      spelled out: the template's page shows its example CVs. */}
                  <InternalNavLink
                    to={`${templatePath(template.slug)}${search}`}
                    onNavigate={openTemplatePage}
                    className="templates-page-card__examples"
                    aria-label={`${copy.viewExamples}: ${template.label}`}
                  >
                    {copy.viewExamples}
                  </InternalNavLink>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="landing-section">
        <h2 className="landing-section__title" style={{ fontSize: 'var(--text-title)' }}>
          {copy.notSureTitle}
        </h2>
        <p className="landing-section__subtitle">{copy.notSureBody}</p>
        <button type="button" className="landing-cta" onClick={() => onGetStarted()}>
          {copy.ctaLabel}
        </button>
        <div className="templates-page-links">
          <span>{copy.linksLabel}</span>
          <InternalNavLink to={ROUTES.howToWrite} onNavigate={() => onNavigateToView('howToWrite')}>
            {copy.howToWriteLink}
          </InternalNavLink>
          <InternalNavLink to={ROUTES.cvSkills} onNavigate={() => onNavigateToView('cvSkills')}>
            {copy.cvSkillsLink}
          </InternalNavLink>
          <InternalNavLink to={ROUTES.atsGuide} onNavigate={() => onNavigateToView('atsGuide')}>
            {copy.atsGuideLink}
          </InternalNavLink>
          <InternalNavLink to={ROUTES.coverLetterExamples} onNavigate={() => onNavigateToView('coverLetterExamples')}>
            {copy.coverLetterLink}
          </InternalNavLink>
          <InternalNavLink to={ROUTES.cvExamples} onNavigate={() => onNavigateToView('cvExamples')}>
            {copy.cvExamplesLink}
          </InternalNavLink>
        </div>
      </div>
    </div>
  )
}

export default FreeCvTemplatesPage
