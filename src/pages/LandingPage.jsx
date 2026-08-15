import { lazy, Suspense } from 'react'

// Lazy-loaded so the landing page's critical-path bundle doesn't carry
// CVPreview + the template registry just for this one below-the-fold
// section — same reasoning as ResumeBuilderPage's own lazy-loading (see
// App.jsx and CVPreview.jsx). It imports the same TemplateThumbnail the
// builder's template gallery uses, so the bundler hoists that shared code
// (and CVPreview beneath it) into a common chunk — a visitor who goes on
// to "Start building" isn't re-downloading it from scratch.
const LandingTemplatesPreview = lazy(() => import('../components/LandingTemplatesPreview'))

function getLandingCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'CV-rakentaja',
      startButton: 'Aloita rakentaminen',
      title: 'Rakenna CV',
      subtitle: 'Selkeä CV-rakentaja, joka toimii kokonaan selaimessasi.',
      previewAlt: 'Esimerkki PortifyCV:llä rakennetusta CV:stä',
      highlights: [
        'Ei tiliä, ei palvelinta — mitään kirjoittamastasi ei koskaan lähetetä selaimestasi',
        '12 pohjaa — vaihda milloin vain sisältöä menettämättä',
        'Live-esikatselu kirjoittaessasi',
        'ATS-pisteytys ja avainsanaehdotukset',
        'Vie PDF-, HTML- tai JSON-muodossa',
      ],
      whyTitle: 'Miksi PortifyCV',
      why: [
        {
          heading: 'Mikään ei koskaan päädy palvelimelle',
          body: 'Jokainen vienti (PDF, HTML, JSON) ja jakolinkki muodostetaan kokonaan selaimessasi. Toisin kuin tiliä vaativat CV-työkalut, tietojasi ei koskaan ladata, tallenneta tai näe kukaan muu — koska ne eivät koskaan poistu laitteeltasi.',
        },
        {
          heading: 'Ei tiliä eikä kirjautumista',
          body: 'Aloita kirjoittaminen heti — CV rakentuu live-esikatselussa ilman rekisteröitymistä tai sähköpostivahvistusta.',
        },
        {
          heading: 'Rakennettu rekrytointijärjestelmiä varten',
          body: 'ATS-tila muotoilee CV:n järjestelmien luettavaksi ilman sarakkeita tai grafiikkaa, ja avainsanapisteytys näyttää mitä puuttuu.',
        },
      ],
      templatesTitle: 'Katso pohjat',
      templatesSubtitle: 'Kaikki 12 asettelua yhdellä silmäyksellä — vaihda milloin tahansa rakentaessasi, ilman että sisältösi katoaa.',
      faqTitle: 'Usein kysytyt kysymykset',
      faq: [
        {
          q: 'Onko PortifyCV oikeasti ilmainen?',
          a: 'Kyllä. Ei tilausmaksua, ei vesileimaa, ei piilotettuja rajoituksia — kaikki 12 pohjaa ja kaikki vientimuodot ovat käytössä ilmaiseksi.',
        },
        {
          q: 'Tarvitsenko tilin?',
          a: 'Ei. Avaa sivu ja aloita kirjoittaminen — kirjautumista tai sähköpostia ei kysytä.',
        },
        {
          q: 'Läpäiseekö CV:ni hakijaseurantajärjestelmät (ATS)?',
          a: 'ATS-tila poistaa asettelut, joita jäsentäjät eivät osaa lukea (sarakkeet, kuvakkeet, taulukot) ja avainsanapisteytys ehdottaa työpaikkailmoituksesta puuttuvia termejä.',
        },
        {
          q: 'Mihin muotoihin voin viedä CV:ni?',
          a: 'PDF, HTML tai JSON — PDF tulostukseen ja hakemuksiin, HTML jaettavaksi verkossa, JSON varmuuskopioksi tai myöhempää muokkausta varten.',
        },
        {
          q: 'Voinko jakaa CV:ni ilman tiedoston lähettämistä?',
          a: 'Kyllä — jakolinkki koodaa koko CV:n URL-osoitteen fragmenttiin, jota ei koskaan lähetetä palvelimelle. Kuvat eivät mahdu linkkiin, joten vie JSON, jos kuvien pitää säilyä.',
        },
        {
          q: 'Mitä tietoja PortifyCV tallentaa selaimeeni?',
          a: 'Oletuksena vain neljä pientä asetusta (kielivalinta, oletko nähnyt opastuksen, mainosevästevalintasi ja onko istunnon palautus päällä) tallennetaan paikallisesti — mikään niistä ei sisällä osaa CV:stäsi. Jos otat käyttöön valinnaisen "Palauta viimeisin istunto" -toiminnon Asetuksista, CV:stäsi pidetään työkopiota vain kyseisessä selainvälilehdessä, jotta vahinkopäivitys ei tuhoa työtäsi — kopio poistuu automaattisesti heti kun suljet välilehden, eikä sitä koskaan lähetetä minnekään. Katso tietosuojaseloste.',
        },
      ],
    }
  }

  return {
    kicker: 'CV builder',
    startButton: 'Start building',
    title: 'Build a CV',
    subtitle: 'A focused CV builder that runs entirely in your browser.',
    previewAlt: 'Example CV built with PortifyCV',
    highlights: [
      'No account, no server — nothing you type ever leaves your browser',
      '12 templates — swap anytime without losing your content',
      'Live preview as you type',
      'ATS scoring with keyword suggestions',
      'Export to PDF, HTML, or JSON',
    ],
    whyTitle: 'Why use PortifyCV',
    why: [
      {
        heading: 'Nothing ever touches a server',
        body: 'Every export (PDF, HTML, JSON) and every share link is generated entirely in your browser. Unlike CV builders that require an account, your data is never uploaded, stored, or seen by anyone — because it never leaves your device.',
      },
      {
        heading: 'No account required',
        body: 'Skip the sign-up. Start typing and your CV takes shape in the live preview — no registration, no email confirmation.',
      },
      {
        heading: 'Built for applicant tracking systems',
        body: 'Toggle ATS mode for a layout parsers can actually read — no columns, icons, or tables to trip them up — plus keyword scoring that shows what your CV is missing.',
      },
    ],
    templatesTitle: 'See the templates',
    templatesSubtitle: 'All 12 layouts at a glance — swap between them any time while you build, without losing your content.',
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'Is PortifyCV really free?',
        a: 'Yes. No subscription, no watermark, no hidden limits — all 12 templates and every export format are free to use.',
      },
      {
        q: 'Do I need to create an account?',
        a: 'No. Open the page and start typing — there is no login and no email required.',
      },
      {
        q: 'Will my CV pass applicant tracking systems (ATS)?',
        a: 'ATS mode strips out layouts that parsers struggle with (columns, icons, tables), and keyword scoring suggests terms missing from the job description.',
      },
      {
        q: 'What formats can I export to?',
        a: 'PDF, HTML, or JSON — PDF for printing and applications, HTML for sharing online, JSON as a backup or to keep editing later.',
      },
      {
        q: 'Can I share my CV without sending a file?',
        a: 'Yes — a share link encodes the whole CV in the URL fragment, which is never sent to a server. Images do not fit in the link, so export JSON if images need to travel too.',
      },
      {
        q: 'What data does PortifyCV store in my browser?',
        a: "By default, only four small preferences (your language choice, whether you have seen the onboarding tip, your advertising-cookie choice, and whether session restore is on) are stored locally — none of them contain any part of your CV. If you turn on the optional \"Restore last session\" feature in Settings, a working copy of your CV is kept in that browser tab only, so an accidental refresh doesn't lose your work — it's cleared automatically the moment you close the tab and is never sent anywhere. See the privacy policy for details.",
      },
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

        <div className="landing-preview">
          <img
            src="/PortifyCV2.jpg"
            alt={copy.previewAlt}
            className="landing-preview__image"
          />
        </div>
      </div>

      <div className="landing-section">
        <h2 className="landing-section__title">{copy.whyTitle}</h2>
        <div className="landing-why-grid">
          {copy.why.map((item) => (
            <div className="landing-why-card" key={item.heading}>
              <h3 className="landing-why-card__heading">{item.heading}</h3>
              <p className="landing-why-card__body">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-section">
        <h2 className="landing-section__title">{copy.templatesTitle}</h2>
        <p className="landing-section__subtitle">{copy.templatesSubtitle}</p>
        <Suspense fallback={null}>
          <LandingTemplatesPreview locale={locale} />
        </Suspense>
      </div>

      <div className="landing-section">
        <h2 className="landing-section__title">{copy.faqTitle}</h2>
        <dl className="landing-faq">
          {copy.faq.map((item) => (
            <div className="landing-faq__item" key={item.q}>
              <dt className="landing-faq__question">{item.q}</dt>
              <dd className="landing-faq__answer">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default LandingPage
