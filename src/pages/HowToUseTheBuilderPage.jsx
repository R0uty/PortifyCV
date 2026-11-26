import GuideLayout from '../components/GuideLayout'
import BuilderWalkthroughFigure from '../components/BuilderWalkthroughFigure'
import InternalNavLink from '../components/InternalNavLink'
import { howToUsePage } from '../i18n/pages/howToUse'

function HowToUseTheBuilderPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = howToUsePage.copy(locale)

  return (
    <GuideLayout
      view="howToUse"
      locale={locale}
      kicker={copy.kicker}
      title={copy.title}
      intro={(
        <>
          {copy.intro}
          <InternalNavLink
            to={copy.introLink.linkTo}
            onNavigate={() => onNavigateToView(copy.introLink.view)}
          >
            {copy.introLink.linkText}
          </InternalNavLink>
          {copy.introLink.after}
        </>
      )}
      tocItems={copy.steps.map((step) => ({ id: `step-${step.step}`, label: step.heading, caption: step.caption }))}
      cta={{ label: copy.ctaLabel, note: copy.ctaNote }}
      related={[{ view: 'howToWrite' }, { view: 'freeTemplates' }, { view: 'atsGuide' }]}
      onGetStarted={onGetStarted}
      onNavigateToView={onNavigateToView}
    >
      <ol className="builder-walkthrough">
        {copy.steps.map((step, index) => (
          <li key={step.step} id={`step-${step.step}`} className="builder-walkthrough__step guide__section">
            <div className="builder-walkthrough__head">
              <span className="builder-walkthrough__num">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className="builder-walkthrough__heading">{step.heading}</h2>
            </div>
            <div className="builder-walkthrough__figure">
              <BuilderWalkthroughFigure step={step.step} label={step.figureLabel} />
            </div>
            <p className="builder-walkthrough__caption">{step.caption}</p>
            {step.linkParagraph ? (
              <p className="builder-walkthrough__caption">
                {step.linkParagraph.before}
                <InternalNavLink
                  to={step.linkParagraph.linkTo}
                  onNavigate={() => onNavigateToView(step.linkParagraph.view)}
                >
                  {step.linkParagraph.linkText}
                </InternalNavLink>
                {step.linkParagraph.after}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </GuideLayout>
  )
}

export default HowToUseTheBuilderPage
