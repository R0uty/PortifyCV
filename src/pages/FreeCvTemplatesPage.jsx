import { useMemo } from 'react'

import TemplateThumbnail from '../components/TemplateThumbnail'
import InternalNavLink from '../components/InternalNavLink'
import { buildThumbnailCv } from '../utils/thumbnailCv'
import { getCvTemplates } from '../utils/cvTemplates'
import { ROUTES } from '../utils/routes'

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Pohjat',
      title: 'Ilmaiset CV-pohjat',
      intro:
        'Kaikki 13 pohjaa ovat täysin ilmaisia, ilman vesileimaa ja ilman tiliä. Vaihda pohjaa milloin tahansa rakentaessasi — sisältösi säilyy, vain asettelu vaihtuu.',
      useTemplate: 'Käytä tätä pohjaa',
      notSureTitle: 'Et ole varma mistä aloittaa?',
      notSureBody:
        'Valitse mikä tahansa pohja — voit vaihtaa toiseen milloin tahansa menettämättä yhtään kirjoittamaasi tekstiä. Jos hait rooliin, jossa hakemus kulkee hakijaseurantajärjestelmän läpi, kytke ATS-ystävällinen tila päälle mistä tahansa pohjasta ennen vientiä.',
      ctaLabel: 'Aloita ilman pohjan valintaa',
      linksLabel: 'Katso myös:',
      howToWriteLink: 'Näin kirjoitat CV:n',
      atsGuideLink: 'ATS-ystävällinen CV-opas',
      cvSkillsLink: 'CV:n taito-osion esimerkkejä',
      coverLetterLink: 'Saatekirje-esimerkkejä',
      cvExamplesLink: 'CV-esimerkkejä aloittain',
    }
  }

  return {
    kicker: 'Templates',
    title: 'Free CV Templates',
    intro:
      'All 13 templates are completely free, with no watermark and no account. Swap templates any time while you build — your content stays, only the layout changes.',
    useTemplate: 'Use this template',
    notSureTitle: 'Not sure where to start?',
    notSureBody:
      'Pick any template — you can switch to another one at any point without losing a single word you’ve written. If you’re applying somewhere your application goes through an applicant tracking system, switch on ATS-friendly mode from any template before exporting.',
    ctaLabel: 'Start without picking a template',
    linksLabel: 'See also:',
    howToWriteLink: 'How to Write a CV',
    atsGuideLink: 'ATS-Friendly CV Guide',
    cvSkillsLink: 'CV Skills Examples',
    coverLetterLink: 'Cover Letter Examples',
    cvExamplesLink: 'CV Examples by Field',
  }
}

function FreeCvTemplatesPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const resolvedLocale = locale === 'fi' ? 'fi' : 'en'
  const copy = getCopy(resolvedLocale)
  const templates = useMemo(() => getCvTemplates(resolvedLocale), [resolvedLocale])
  const thumbnailCv = useMemo(() => buildThumbnailCv(), [])

  return (
    <div className="landing-page">
      <div className="landing-section" style={{ paddingTop: 0 }}>
        <p className="landing-kicker">{copy.kicker}</p>
        <h1 className="landing-section__title">{copy.title}</h1>
        <p className="landing-section__subtitle">{copy.intro}</p>
      </div>

      <div className="landing-section">
        <div className="templates-page-grid">
          {templates.map((template) => (
            <div className="templates-page-card" key={template.id}>
              <div className="templates-page-card__thumb">
                <TemplateThumbnail templateId={template.id} formData={thumbnailCv} locale={resolvedLocale} />
              </div>
              <p className="templates-page-card__name">{template.label}</p>
              <p className="templates-page-card__description">{template.description}</p>
              <button
                type="button"
                className="templates-page-card__cta"
                onClick={() => onGetStarted(template.id)}
              >
                {copy.useTemplate}
              </button>
            </div>
          ))}
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
