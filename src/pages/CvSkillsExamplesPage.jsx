import GuideLayout from '../components/GuideLayout'
import { cvSkillsPage } from '../i18n/pages/cvSkills'

function CvSkillsExamplesPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = cvSkillsPage.copy(locale)

  return (
    <GuideLayout
      view="cvSkills"
      locale={locale}
      kicker={copy.kicker}
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
      cta={{ label: copy.ctaLabel, note: copy.ctaNote }}
      related={copy.seeAlso.map((link) => ({ view: link.view, search: link.search, title: link.text }))}
      onGetStarted={onGetStarted}
      onNavigateToView={onNavigateToView}
    ></GuideLayout>
  )
}

export default CvSkillsExamplesPage
