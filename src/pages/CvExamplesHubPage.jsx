import ExampleCvLinks from '../components/ExampleCvLinks'
import InternalNavLink from '../components/InternalNavLink'
import { CONTENT_PAGE_EXAMPLES } from '../utils/exampleCvs'
import { ROUTES } from '../utils/routes'

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Esimerkkejä',
      title: 'CV-esimerkkejä alan mukaan',
      intro:
        'Sama rakenne — vahva yhteenveto, tuloskeskeiset kokemuskohdat, oikeat taidot — toimii joka alalla, mutta yksityiskohdat vaihtelevat. Valitse omasi alta.',
      cards: [
        {
          view: 'developerCv',
          path: ROUTES.developerCv,
          title: 'Kehittäjän CV-esimerkkejä',
          body: 'Projektikohtien rakenne, tekninen taitolista ja miksi Kehittäjä-pohja on rakennettu juuri tälle.',
        },
        {
          view: 'itCv',
          path: ROUTES.itCv,
          title: 'IT-alan CV-esimerkkejä',
          body: 'Sertifikaatit, järjestelmät ja taidot, jotka erottuvat yleisistä "tietokonetaidoista".',
        },
        {
          view: 'cybersecurityCv',
          path: ROUTES.cybersecurityCv,
          title: 'Tietoturva-alan CV-esimerkkejä',
          body: 'SIEM-työkalut, sertifikaatit ja Hack The Box / TryHackMe -profiilit omalla paikallaan.',
        },
        {
          view: 'finnishCv',
          path: ROUTES.finnishCv,
          title: 'Suomalaisen CV:n esimerkkejä',
          body: 'Mitä jätetään pois, kielitaidon merkitys, ja kaksikielinen esimerkki samasta sisällöstä.',
        },
      ],
      fullExamplesTitle: 'Kokonaisia CV-esimerkkejä',
      fullExamplesIntro: 'Valmiita esimerkki-CV:itä eri aloilta, kukin omassa pohjassaan. "Käytä tätä esimerkkiä" lataa esimerkin editoriin muokattavaksi, ja jokaisen pohjan sivulla on lisää esimerkkejä.',
      linksLabel: 'Katso myös:',
      howToWriteLink: 'Näin kirjoitat CV:n',
      templatesLink: 'Ilmaiset CV-pohjat',
      ctaLabel: 'Aloita CV:si rakentaminen',
      ctaNote: 'Ei kirjautumista. Ei mitään tallennettua ennen kuin viet CV:n.',
    }
  }

  return {
    kicker: 'Examples',
    title: 'CV Examples by Field',
    intro:
      'The same structure — a strong summary, results-focused experience bullets, the right skills — works across every field, but the details differ. Pick yours below.',
    cards: [
      {
        view: 'developerCv',
        path: ROUTES.developerCv,
        title: 'Developer CV Examples',
        body: 'How to structure project entries, a technical skills list, and why the Developer template is built for exactly this.',
      },
      {
        view: 'itCv',
        path: ROUTES.itCv,
        title: 'IT CV Examples',
        body: 'Certifications, systems, and skills that stand out from generic "computer skills."',
      },
      {
        view: 'cybersecurityCv',
        path: ROUTES.cybersecurityCv,
        title: 'Cybersecurity CV Examples',
        body: 'SIEM tools, certifications, and where a Hack The Box or TryHackMe profile belongs.',
      },
      {
        view: 'finnishCv',
        path: ROUTES.finnishCv,
        title: 'Finnish CV Examples',
        body: 'What to leave out, why the languages section matters more, and a bilingual example of the same content.',
      },
    ],
    fullExamplesTitle: 'Full example CVs',
    fullExamplesIntro: 'Complete example CVs from different fields, each in its own template. "Use this example" loads one into the builder to edit, and every template page has more.',
    linksLabel: 'See also:',
    howToWriteLink: 'How to Write a CV',
    templatesLink: 'Free CV Templates',
    ctaLabel: 'Start building your CV',
    ctaNote: 'No login. Nothing saved until you export.',
  }
}

function CvExamplesHubPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = getCopy(locale === 'fi' ? 'fi' : 'en')

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

      <div className="landing-section">
        <h2 className="landing-section__title">{copy.fullExamplesTitle}</h2>
        <p className="landing-section__subtitle">{copy.fullExamplesIntro}</p>
        <ExampleCvLinks examples={CONTENT_PAGE_EXAMPLES.cvExamples} locale={locale} onNavigateToView={onNavigateToView} />

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
