import { lazy, Suspense } from 'react'
import { cvTemplates } from '../utils/cvTemplates'

// Lazy-loaded so the landing page's critical-path bundle doesn't carry
// CVPreview + the template registry just for this one below-the-fold
// section — same reasoning as ResumeBuilderPage's own lazy-loading (see
// App.jsx and CVPreview.jsx). It imports the same TemplateThumbnail the
// builder's template gallery uses, so the bundler hoists that shared code
// (and CVPreview beneath it) into a common chunk — a visitor who goes on
// to "Start building" isn't re-downloading it from scratch.
const LandingTemplatesPreview = lazy(() => import('../components/LandingTemplatesPreview'))

// Same lazy-loading reasoning as LandingTemplatesPreview above, but this one
// is above the fold — the Suspense fallback below is a same-shaped
// placeholder (not null) so there's no layout shift while the shared
// CVPreview chunk downloads.
const LandingHeroPreview = lazy(() => import('../components/LandingHeroPreview'))

// Read off the template registry instead of a hardcoded number — this
// count previously drifted out of sync with cvTemplates.js (copy said 13,
// the registry had grown to 14) after a template was added without the
// landing page being updated to match.
const TEMPLATE_COUNT = cvTemplates.length

function getLandingCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Ei kirjautumista. Ei tallennettua dataa.',
      startButton: 'Aloita rakentaminen',
      title: 'Rakenna CV:si. Ota se mukaan. Siinä kaikki.',
      subtitle: 'Ei tiliä, ei kirjautumista, ei mitään tallennettua — kaikki tapahtuu tässä selaimessasi ja katoaa, kun suljet välilehden.',
      previewAlt: 'Esimerkki PortifyCV:llä rakennetusta CV:stä',
      highlights: [
        'Ei tiliä, ei kirjautumista — aloita kirjoittaminen heti',
        'Mitään kirjoittamastasi ei koskaan lähetetä selaimestasi',
        `${TEMPLATE_COUNT} pohjaa — vaihda milloin vain sisältöä menettämättä`,
        'ATS-pisteytys ja avainsanaehdotukset',
        'Vie PDF-, HTML- tai JSON-muodossa — sitten se on poissa',
      ],
      whyTitle: 'Miksi PortifyCV',
      why: [
        {
          heading: 'Ei tiliä. Ei kirjautumista. Siinä koko juttu.',
          body: 'Ei rekisteröitymistä, ei sähköpostivahvistusta, ei tiliä ylläpidettäväksi. Avaa sivu, ala kirjoittaa ja vie CV kun olet valmis — muuta ei tarvita.',
        },
        {
          heading: 'Mikään ei koskaan päädy palvelimelle',
          body: 'Jokainen vienti (PDF, HTML, JSON) ja jakolinkki muodostetaan kokonaan selaimessasi. Toisin kuin tiliä vaativat CV-työkalut, tietojasi ei koskaan ladata, tallenneta tai näe kukaan muu — koska ne eivät koskaan poistu laitteeltasi.',
        },
        {
          heading: 'Rakennettu rekrytointijärjestelmiä varten',
          body: 'ATS-tila muotoilee CV:n järjestelmien luettavaksi ilman sarakkeita tai grafiikkaa, ja avainsanapisteytys näyttää mitä puuttuu.',
        },
      ],
      templatesTitle: 'Katso pohjat',
      templatesSubtitle: `Kaikki ${TEMPLATE_COUNT} asettelua yhdellä silmäyksellä — vaihda milloin tahansa rakentaessasi, ilman että sisältösi katoaa.`,
      templatesCta: 'Selaa kaikkia pohjia',
      faqTitle: 'Usein kysytyt kysymykset',
      faq: [
        {
          q: 'Onko PortifyCV oikeasti ilmainen?',
          a: `Kyllä. Ei tilausmaksua, ei vesileimaa, ei piilotettuja rajoituksia — kaikki ${TEMPLATE_COUNT} pohjaa ja kaikki vientimuodot ovat käytössä ilmaiseksi.`,
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
        {
          q: 'Voinko luoda myös saatekirjeen?',
          a: 'Kyllä — sisäänrakennettu generaattori luo saatekirjeluonnoksen CV:si yhteenvedon, viimeisimmän roolin ja tärkeimpien taitojen perusteella. Se pysyy selaimessasi kuten kaikki muukin, ja voit kopioida sen, ladata sen tekstinä tai viedä sen PDF-muodossa.',
        },
      ],
    }
  }

  return {
    kicker: 'No login. No data saved.',
    startButton: 'Start building',
    title: 'Build your CV. Take it. That’s it.',
    subtitle: 'No login, no account, nothing saved — everything happens right here in your browser, and disappears the moment you close the tab.',
    previewAlt: 'Example CV built with PortifyCV',
    highlights: [
      'No account, no login — start typing immediately',
      'Nothing you type ever leaves your browser',
      `${TEMPLATE_COUNT} templates — swap anytime without losing your content`,
      'ATS scoring with keyword suggestions',
      'Export to PDF, HTML, or JSON — then it’s gone',
    ],
    whyTitle: 'Why use PortifyCV',
    why: [
      {
        heading: 'No account. No login. That’s the whole point.',
        body: 'Skip the sign-up, the email confirmation, the account to manage. Open the page, start typing, and export when you’re done — there is nothing else to it.',
      },
      {
        heading: 'Nothing ever touches a server',
        body: 'Every export (PDF, HTML, JSON) and every share link is generated entirely in your browser. Unlike CV builders that require an account, your data is never uploaded, stored, or seen by anyone — because it never leaves your device.',
      },
      {
        heading: 'Built for applicant tracking systems',
        body: 'Toggle ATS mode for a layout that parsers can actually read — no columns, icons, or tables to trip them up — plus keyword scoring that shows what your CV is missing.',
      },
    ],
    templatesTitle: 'See the templates',
    templatesSubtitle: `All ${TEMPLATE_COUNT} layouts at a glance — swap between them any time while you build, without losing your content.`,
    templatesCta: 'Browse all templates',
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'Is PortifyCV really free?',
        a: `Yes. No subscription, no watermark, no hidden limits — all ${TEMPLATE_COUNT} templates and every export format are free to use.`,
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
      {
        q: 'Can I also create a cover letter?',
        a: 'Yes — a built-in generator drafts a cover letter from your CV’s summary, most recent role, and top skills. It stays in your browser like everything else, and you can copy it, download it as text, or export it as a PDF.',
      },
    ],
  }
}

function LandingPage({
  locale = 'en',
  onGetStarted = () => {},
  onNavigateToView = () => {},
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
          <button type="button" className="landing-cta" onClick={() => onGetStarted()}>
            {copy.startButton}
          </button>
        </div>

        <div className="landing-preview">
          <Suspense fallback={<div className="landing-preview__placeholder" aria-hidden="true" />}>
            <LandingHeroPreview locale={locale} label={copy.previewAlt} />
          </Suspense>
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
        <button
          type="button"
          className="landing-secondary-cta"
          onClick={() => onNavigateToView('freeTemplates')}
        >
          {copy.templatesCta}
        </button>
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
