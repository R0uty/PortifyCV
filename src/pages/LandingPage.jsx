import { lazy, Suspense } from 'react'

import { demoCvData } from '../utils/cvForm'

// Lazy so the heavy CVPreview + template-showcase bundle loads as a
// non-blocking chunk behind the headline/CTA, instead of adding its weight
// to the landing page's critical path (mirrors the ResumeBuilderPage split
// in App.jsx).
const CVPreview = lazy(() => import('../components/CVPreview'))

function getLandingCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'CV-rakentaja',
      startButton: 'Aloita rakentaminen',
      title: 'Rakenna CV',
      subtitle: 'Selkeä CV-rakentaja, joka toimii kokonaan selaimessasi.',
      highlights: [
        '10 pohjaa — vaihda milloin vain sisältöä menettämättä',
        'Live-esikatselu kirjoittaessasi',
        'ATS-pisteytys ja avainsanaehdotukset',
        'Vie PDF-, HTML- tai JSON-muodossa',
      ],
    }
  }

  return {
    kicker: 'CV builder',
    startButton: 'Start building',
    title: 'Build a CV',
    subtitle: 'A focused CV builder that runs entirely in your browser.',
    highlights: [
      '10 templates — swap anytime without losing your content',
      'Live preview as you type',
      'ATS scoring with keyword suggestions',
      'Export to PDF, HTML, or JSON',
    ],
  }
}

function LandingPage({
  locale = 'en',
  onGetStarted = () => {},
}) {
  const copy = getLandingCopy(locale)

  return (
    <section className="landing-page">
      <div className="landing-grid">
        <div className="landing-hero">
          <p className="landing-kicker">{copy.kicker}</p>
          <h1 className="landing-title">{copy.title}</h1>
          <p className="landing-subtitle">{copy.subtitle}</p>
          <ul className="landing-highlights">
            {copy.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
          <button type="button" className="landing-cta" onClick={onGetStarted}>
            {copy.startButton}
          </button>
        </div>

        <div className="landing-preview" aria-hidden="true">
          <div className="landing-preview__frame">
            <Suspense fallback={null}>
              <div className="landing-preview__page">
                <CVPreview formData={demoCvData} template="minimal" locale={locale} />
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingPage
