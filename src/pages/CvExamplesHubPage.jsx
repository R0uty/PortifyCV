import ExampleCvLinks from '../components/ExampleCvLinks'
import InternalNavLink from '../components/InternalNavLink'
import { CONTENT_PAGE_EXAMPLES } from '../utils/exampleCvs'
import { getCvTemplate } from '../utils/cvTemplates'
import { TEMPLATE_VIEW_PREFIX } from '../utils/pageMeta'
import { ROUTES, templatePath } from '../utils/routes'

// What changes from field to field (1.6.55), with the templates that suit
// each. Text per language below; the template ids are shared.
const FIELD_TEMPLATES = {
  software: ['developer', 'portfolio'],
  it: ['minimal', 'compact'],
  security: ['minimal', 'compact'],
  healthcare: ['minimal', 'european'],
  education: ['timeline', 'european'],
  sales: ['modern', 'quadrant', 'modernOrange'],
  creative: ['creative', 'colorfulCompact', 'portrait'],
  finance: ['classicProfessional', 'executive'],
  graduates: ['graduate'],
}

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
      sharedTitle: 'Mitä jokaisessa vahvassa CV:ssä on',
      sharedIntro: 'Alasta riippumatta CV yleensä silmäillään ennen kuin se luetaan, ja samat neljä asiaa kantavat sen ensimmäisen silmäyksen yli.',
      shared: [
        'Yhteenveto, joka kertoo roolisi, kokemusvuotesi ja sen, missä olet parhaimmillasi, kahdessa tai kolmessa lauseessa.',
        'Kokemuskohdat, jotka alkavat verbillä, kertovat mitä teit ja päättyvät tulokseen: lukuun, säästettyyn aikaan tai ongelmaan, joka loppui.',
        'Taidot, jotka vastaavat työpaikkailmoituksen omia sanoja, jotta sekä hakijaseurantajärjestelmä että ihminen löytävät ne.',
        'Yksi tai kaksi sivua. Vanhemmat tai vähemmän olennaiset tehtävät tiivistyvät yhdelle riville, jotta tuoreimmat mahtuvat ensimmäiselle sivulle.',
      ],
      fieldsTitle: 'Mikä muuttuu alalta toiselle',
      fieldsIntro: 'Rakenne pysyy samana, mutta se, mikä lasketaan näytöksi, vaihtelee. Tässä kunkin alan lukijoiden ensimmäiseksi etsimät asiat ja niihin sopivat pohjat.',
      templatesLabel: 'Sopivat pohjat:',
      fields: {
        software: ['Ohjelmistokehitys', 'Projektit painavat yhtä paljon kuin tehtävänimikkeet. Mainitse teknologiat jokaisessa kohdassa, linkitä koodiin tai demoon kun voit, ja mittaa tuloksia käyttäjinä, nopeutena tai luotettavuutena, ei koodiriveinä.'],
        it: ['IT-tuki ja järjestelmät', 'Kerro ympäristön koko (käyttäjät, laitteet, toimipisteet), ylläpitämäsi järjestelmät ja tiketit, jotka sait loppumaan. Sertifikaatit kuuluvat omaan osioonsa vuosilukuineen.'],
        security: ['Tietoturva', 'Nimeä työkalut (SIEM, EDR, haavoittuvuusskannerit), käsittelemäsi poikkeamat tai löydökset ja käytännön näyttö, kuten harjoitusympäristöjen sijoitukset tai julkaistut kirjoitukset. Ympäripyöreä "tietoturvaosaaminen" ei kerro mitään.'],
        healthcare: ['Terveydenhuolto', 'Aloita ammattioikeudesta tai laillistuksesta sekä osastoista ja erikoisaloista, joilla olet työskennellyt. Potilasmäärät, vuorot ja kehittämäsi käytännöt ovat mitattava osa.'],
        education: ['Opetus', 'Ensin aineet, ikäryhmät ja asteet, sitten tulokset: koetulokset, rakentamasi ohjelmat, ohjaamasi oppilaat. Koulun nimi merkitsee vähemmän kuin se, mikä luokassasi muuttui.'],
        sales: ['Myynti, markkinointi ja asiakkuudet', 'Luvuilla on tässä enemmän painoa kuin useimmilla aloilla. Liikevaihto, myyntiputki, tavoitteet, konversio, asiakaspysyvyys ja kampanjoiden tulokset kuuluvat lähes jokaiseen kohtaan, aikajänteen kera.'],
        creative: ['Suunnittelu ja luova työ', 'CV ohjaa portfolioon, se ei korvaa sitä. Laita linkki lähelle alkua, kerro, minkä ongelman kukin projekti ratkaisi, ja anna asettelun näyttää makua peittämättä tekstiä.'],
        finance: ['Talous ja johtaminen', 'Vastuun laajuus on pääasia: budjetin koko, tiimin koko, yhtiöiden tai markkinoiden määrä. Lukija odottaa hillittyä asettelua ja tarkkoja lukuja.'],
        graduates: ['Vastavalmistuneet ja uran alkuvaihe', 'Koulutus tulee ensin, ja projektit, harjoittelut, osa-aikatyöt ja kurssit hoitavat työkokemuksen tehtävää. Yksi vahva projekti tuloksineen voittaa pitkän kurssilistan.'],
      },
      useTitle: 'Näin käytät esimerkkejä',
      use: [
        'Esimerkki-CV:t on kirjoitettu kuvitteellisille henkilöille, mutta jokainen kohta noudattaa yllä olevaa kaavaa, joten ne ovat malli rakenteelle ja sävylle, eivät kopioitavaa tekstiä: kopioitu sanamuoto kuvaa jonkun toisen työtä, ei sinun.',
        'Käytännössä: avaa esimerkki editoriin, pidä osioiden järjestys ja kohtien muoto, ja vaihda jokainen väite ja luku omaksesi. Jos kohdalle ei löydy vastinetta omasta työstäsi, poista se äläkä keksi tilalle.',
        'Tarkista lopuksi luonnoksesi oikeaa työpaikkailmoitusta vasten. Klassinen-tilan ATS-pisteet ja ehdotukset -paneeli vertaa CV:täsi liitettyyn ilmoitukseen ja listaa avainsanat, jotka siitä vielä puuttuvat.',
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
    sharedTitle: 'What every strong CV has in common',
    sharedIntro: 'Whatever the field, a CV is usually skimmed before it is read, and the same four things carry it through that first look.',
    shared: [
      'A summary that names your role, your years of experience and the one thing you do best, in two or three sentences.',
      'Experience bullets that start with a verb, say what you did, and end with a result: a number, time saved, a problem that stopped.',
      "Skills in the job posting's own words, so both an applicant tracking system and a person find them.",
      'One or two pages. Older or less relevant roles shrink to a line each instead of pushing the recent ones off the first page.',
    ],
    fieldsTitle: 'What changes from field to field',
    fieldsIntro: "The structure stays the same; what counts as evidence doesn't. These are the details each field's readers look for first, and the templates that suit them.",
    templatesLabel: 'Templates that suit it:',
    fields: {
      software: ['Software development', 'Projects carry as much weight as job titles. Name the stack in each entry, link to code or a live demo where you can, and measure outcomes in users, speed or reliability rather than lines of code.'],
      it: ['IT support and systems', 'Show the size of the environment (users, devices, sites), the systems you administer, and the tickets you made disappear. Certifications belong in their own section, with the year.'],
      security: ['Cybersecurity', 'Name the tools (SIEM, EDR, vulnerability scanners), the incidents or findings you handled, and hands-on proof such as lab rankings or published write-ups. A vague "security awareness" adds nothing.'],
      healthcare: ['Healthcare', 'Lead with your licence or registration and the units or specialities you have worked in. Patient numbers, shift patterns and the protocols you improved are the measurable part.'],
      education: ['Education', 'Subjects, age groups and levels first, then results: exam outcomes, programmes you built, students you mentored. The school matters less than what changed in your classroom.'],
      sales: ['Sales, marketing and customer success', 'Numbers carry more weight here than in most fields. Revenue, pipeline, quota, conversion, retention and campaign results belong in nearly every bullet, with the time frame.'],
      creative: ['Design and creative work', "The CV points to the portfolio; it doesn't replace it. Put the link near the top, say what problem each project solved, and let the layout show some taste without hiding the text."],
      finance: ['Finance and management', 'Scope is the headline: budget, team size, the number of entities or markets you covered. Readers expect a conservative layout and exact figures.'],
      graduates: ['Graduates and career starters', 'Education goes first, with projects, internships, part-time work and coursework doing the job of experience. One strong project with a result beats a long list of modules.'],
    },
    useTitle: 'How to use these examples',
    use: [
      "The example CVs are written for fictional people, but every bullet follows the pattern above, so they're a reference for structure and tone, not text to copy: copied phrasing describes someone else's work, not yours.",
      "A practical way to use one: open it in the builder, keep the section order and the shape of each bullet, and replace every claim and number with your own. If a bullet has no equivalent in your work, delete it rather than inventing one.",
      "Then check your draft against a real job posting. In Classic mode, the ATS score & suggestions panel compares your CV with a pasted posting and lists the keywords it still lacks.",
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

      <div className="landing-section examples-hub-prose">
        <h2 className="landing-section__title">{copy.sharedTitle}</h2>
        <p>{copy.sharedIntro}</p>
        <ul>
          {copy.shared.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      <div className="landing-section">
        <h2 className="landing-section__title">{copy.fieldsTitle}</h2>
        <p className="landing-section__subtitle">{copy.fieldsIntro}</p>
        <div className="examples-hub-grid examples-hub-grid--fields">
          {Object.entries(FIELD_TEMPLATES).map(([field, templateIds]) => {
            const [title, body] = copy.fields[field]
            return (
              <div key={field} className="examples-hub-field">
                <h3 className="examples-hub-card__title">{title}</h3>
                <p className="examples-hub-card__body">{body}</p>
                <p className="examples-hub-field__templates">
                  <span>{copy.templatesLabel}</span>{' '}
                  {templateIds.map((templateId, index) => {
                    const template = getCvTemplate(templateId, locale)
                    return (
                      <span key={templateId}>
                        {index > 0 ? ', ' : null}
                        <InternalNavLink
                          to={templatePath(template.slug)}
                          onNavigate={() => onNavigateToView(`${TEMPLATE_VIEW_PREFIX}${templateId}`)}
                        >
                          {template.label}
                        </InternalNavLink>
                      </span>
                    )
                  })}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="landing-section">
        <h2 className="landing-section__title">{copy.fullExamplesTitle}</h2>
        <p className="landing-section__subtitle">{copy.fullExamplesIntro}</p>
        <ExampleCvLinks examples={CONTENT_PAGE_EXAMPLES.cvExamples} locale={locale} onNavigateToView={onNavigateToView} />
      </div>

      <div className="landing-section examples-hub-prose">
        <h2 className="landing-section__title">{copy.useTitle}</h2>
        {copy.use.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

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
