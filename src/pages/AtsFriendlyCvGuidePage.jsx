import GuideLayout from '../components/GuideLayout'
import { atsGuidePage } from '../i18n/pages/atsGuide'

function AtsFriendlyCvGuidePage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = atsGuidePage.copy(locale)

  return (
    <GuideLayout
      view="atsGuide"
      locale={locale}
      kicker={copy.kicker}
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
      cta={{ label: copy.ctaLabel, note: copy.ctaNote }}
      related={[{ view: 'howToWrite' }, { view: 'cvSkills' }, { view: 'coverLetterExamples' }]}
      onGetStarted={onGetStarted}
      onNavigateToView={onNavigateToView}
    ></GuideLayout>
  )
}

export default AtsFriendlyCvGuidePage
