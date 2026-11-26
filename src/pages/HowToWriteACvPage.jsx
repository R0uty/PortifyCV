import GuideLayout from '../components/GuideLayout'
import { howToWritePage } from '../i18n/pages/howToWrite'

function HowToWriteACvPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = howToWritePage.copy(locale)

  return (
    <GuideLayout
      view="howToWrite"
      locale={locale}
      kicker={copy.kicker}
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
      cta={{ label: copy.ctaLabel, note: copy.ctaNote }}
      related={[{ view: 'atsGuide' }, { view: 'cvSkills' }, { view: 'coverLetterExamples' }]}
      onGetStarted={onGetStarted}
      onNavigateToView={onNavigateToView}
    ></GuideLayout>
  )
}

export default HowToWriteACvPage
