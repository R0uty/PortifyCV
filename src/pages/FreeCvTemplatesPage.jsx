import { useMemo, useState } from 'react'

import StyleSwatchGroup from '../components/StyleSwatchGroup'
import TemplateThumbnail from '../components/TemplateThumbnail'
import InternalNavLink from '../components/InternalNavLink'
import { buildThumbnailCv } from '../utils/thumbnailCv'
import { cvTemplates, getCvTemplates } from '../utils/cvTemplates'
import { ROUTES, templatePath } from '../utils/routes'
import { TEMPLATE_VIEW_PREFIX } from '../utils/pageMeta'
import { DEFAULT_STYLE_VARIANT_ID, getVariantLook, styleVariantSearch } from '../utils/templateVariants'

// Read off the template registry instead of a hardcoded number — this
// count previously drifted out of sync with cvTemplates.js after a
// template was added without this page's copy being updated to match.
const TEMPLATE_COUNT = cvTemplates.length

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Pohjat',
      title: 'Ilmaiset CV-pohjat',
      intro:
        `Kaikki ${TEMPLATE_COUNT} pohjaa ovat täysin ilmaisia, ilman vesileimaa ja ilman tiliä. Vaihda pohjaa milloin tahansa rakentaessasi — sisältösi säilyy, vain asettelu vaihtuu.`,
      useTemplate: 'Käytä tätä pohjaa',
      viewExamples: 'Katso esimerkit',
      style: 'Tyyli',
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
      `All ${TEMPLATE_COUNT} templates are completely free, with no watermark and no account. Swap templates any time while you build — your content stays, only the layout changes.`,
    useTemplate: 'Use this template',
    viewExamples: 'View examples',
    style: 'Style',
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
  // The look previewed on each card (Phase 4); every card starts on
  // Original. It carries into the card's links and "Use this template".
  const [looks, setLooks] = useState({})

  return (
    <div className="landing-page">
      <div className="landing-section" style={{ paddingTop: 0 }}>
        <p className="landing-kicker">{copy.kicker}</p>
        <h1 className="landing-section__title">{copy.title}</h1>
        <p className="landing-section__subtitle">{copy.intro}</p>
      </div>

      <div className="landing-section">
        <div className="templates-page-grid">
          {templates.map((template) => {
            const look = looks[template.id] ?? DEFAULT_STYLE_VARIANT_ID
            const search = styleVariantSearch(look)
            const openTemplatePage = () => onNavigateToView(`${TEMPLATE_VIEW_PREFIX}${template.id}`, { search })

            return (
              <div className="templates-page-card" key={template.id}>
                {/* Not a link: the thumbnail is a real CV, and several
                    templates render <a> links inside it, which can't be
                    nested in another <a>. Clicking it still opens the
                    template page; keyboard and screen-reader users get the
                    name link and "View examples" below, so it stays
                    aria-hidden and out of the tab order. */}
                <div
                  className="templates-page-card__thumb"
                  aria-hidden="true"
                  onClick={openTemplatePage}
                >
                  <TemplateThumbnail
                    templateId={template.id}
                    formData={thumbnailCv}
                    locale={resolvedLocale}
                    {...getVariantLook(template.id, look)}
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
