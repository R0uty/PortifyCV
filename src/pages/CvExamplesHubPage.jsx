import ExampleCvLinks from '../components/ExampleCvLinks'
import InternalNavLink from '../components/InternalNavLink'
import { CONTENT_PAGE_EXAMPLES } from '../utils/exampleCvs'
import { getCvTemplate } from '../utils/cvTemplates'
import { TEMPLATE_VIEW_PREFIX } from '../utils/pageMeta'
import { ROUTES, templatePath } from '../utils/routes'
import { cvExamplesPage } from '../i18n/pages/cvExamples'

// What changes from field to field (1.6.55), with the templates that suit
// each. Text per language below; the template ids are shared.
const FIELD_TEMPLATES = {
  software: ['developer', 'portfolio'],
  it: ['minimal', 'compact'],
  security: ['minimal', 'compact'],
  healthcare: ['minimal', 'european'],
  education: ['timeline', 'european'],
  sales: ['modern', 'quadrant', 'modernOrange'],
  creative: ['creative', 'colorfulCompact', 'portrait'],
  finance: ['classicProfessional', 'executive'],
  graduates: ['graduate'],
}

function CvExamplesHubPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = cvExamplesPage.copy(locale)

  return (
    <div className="landing-page">
      <div className="landing-section" style={{ paddingTop: 0 }}>
        <p className="landing-kicker">{copy.kicker}</p>
        <h1 className="landing-section__title">{copy.title}</h1>
        <p className="landing-section__subtitle">{copy.intro}</p>
      </div>

      <div className="landing-section">
        <div className="examples-hub-grid">
          {copy.cards.map((card) => (
            <InternalNavLink
              key={card.view}
              to={card.path}
              className="examples-hub-card"
              onNavigate={() => onNavigateToView(card.view)}
            >
              <p className="examples-hub-card__title">{card.title}</p>
              <p className="examples-hub-card__body">{card.body}</p>
            </InternalNavLink>
          ))}
        </div>
      </div>

      <div className="landing-section examples-hub-prose">
        <h2 className="landing-section__title">{copy.sharedTitle}</h2>
        <p>{copy.sharedIntro}</p>
        <ul>
          {copy.shared.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      <div className="landing-section">
        <h2 className="landing-section__title">{copy.fieldsTitle}</h2>
        <p className="landing-section__subtitle">{copy.fieldsIntro}</p>
        <div className="examples-hub-grid examples-hub-grid--fields">
          {Object.entries(FIELD_TEMPLATES).map(([field, templateIds]) => {
            const [title, body] = copy.fields[field]
            return (
              <div key={field} className="examples-hub-field">
                <h3 className="examples-hub-card__title">{title}</h3>
                <p className="examples-hub-card__body">{body}</p>
                <p className="examples-hub-field__templates">
                  <span>{copy.templatesLabel}</span>{' '}
                  {templateIds.map((templateId, index) => {
                    const template = getCvTemplate(templateId, locale)
                    return (
                      <span key={templateId}>
                        {index > 0 ? ', ' : null}
                        <InternalNavLink
                          to={templatePath(template.slug)}
                          onNavigate={() => onNavigateToView(`${TEMPLATE_VIEW_PREFIX}${templateId}`)}
                        >
                          {template.label}
                        </InternalNavLink>
                      </span>
                    )
                  })}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="landing-section">
        <h2 className="landing-section__title">{copy.fullExamplesTitle}</h2>
        <p className="landing-section__subtitle">{copy.fullExamplesIntro}</p>
        <ExampleCvLinks examples={CONTENT_PAGE_EXAMPLES.cvExamples} locale={locale} onNavigateToView={onNavigateToView} />
      </div>

      <div className="landing-section examples-hub-prose">
        <h2 className="landing-section__title">{copy.useTitle}</h2>
        {copy.use.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

        <button type="button" className="landing-cta" onClick={() => onGetStarted()}>
          {copy.ctaLabel}
        </button>
        <div className="templates-page-links">
          <span>{copy.linksLabel}</span>
          <InternalNavLink to={ROUTES.howToWrite} onNavigate={() => onNavigateToView('howToWrite')}>
            {copy.howToWriteLink}
          </InternalNavLink>
          <InternalNavLink to={ROUTES.freeTemplates} onNavigate={() => onNavigateToView('freeTemplates')}>
            {copy.templatesLink}
          </InternalNavLink>
        </div>
        <p className="legal-page__cta-note" style={{ marginTop: 'var(--space-2)' }}>{copy.ctaNote}</p>
      </div>
    </div>
  )
}

export default CvExamplesHubPage
