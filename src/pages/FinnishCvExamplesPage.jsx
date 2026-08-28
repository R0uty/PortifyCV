import InternalNavLink from '../components/InternalNavLink'
import { cvTemplates } from '../utils/cvTemplates'
import { ROUTES } from '../utils/routes'

// Read off the template registry instead of a hardcoded number — see
// LandingPage.jsx for why this drifted before.
const TEMPLATE_COUNT = cvTemplates.length

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Esimerkkejä',
      title: 'Suomalaisen CV:n esimerkkejä',
      intro:
        'Suomalainen CV eroaa monesta kansainvälisestä käytännöstä muutamalla konkreettisella tavalla. Tässä on mitä kannattaa sisällyttää, mitä jättää pois, ja miten PortifyCV tukee kaksikielistä hakua.',
      sections: [
        {
          heading: 'Mitä jätetään pois',
          paragraphs: [
            'Henkilötunnusta, siviilisäätyä tai muita arkaluontoisia henkilötietoja ei kuulu laittaa CV:hen — ne eivät liity osaamiseesi, ja monissa maissa niiden pyytäminen olisi jopa kiellettyä. PortifyCV:n Henkilötiedot-osio kysyy vain nimen, tehtävänimikkeen ja yhteystiedot — ei tilaa, jonne tällaista tietoa voisi vahingossa raapustaa.',
          ],
        },
        {
          heading: 'Pituus ja rakenne',
          paragraphs: [
            'Yksi tai kaksi sivua riittää useimmille — pidempi CV ei näytä kokeneemmalta, se näyttää editoimattomalta. Rakenne on lähellä muuta Eurooppaa: yhteystiedot, lyhyt yhteenveto, työkokemus, koulutus, taidot, ja usein kielitaito omana osionaan.',
          ],
        },
        {
          heading: 'Kielitaito-osio on tavallista tärkeämpi',
          paragraphs: [
            'Suomalaisilla työpaikoilla kysytään usein sekä suomen että ruotsin taitoa englannin lisäksi. PortifyCV:n Kielet-osiossa jokaiselle kielelle merkitään oma taso — tämä kannattaa täyttää huolella, se on yksi ensimmäisistä asioista, joita moni rekrytoija Suomessa katsoo.',
          ],
        },
        {
          heading: 'Rakenna se suomeksi — tai molemmilla kielillä',
          paragraphs: [
            'PortifyCV toimii kokonaan suomeksi kielivalitsimen kautta: koko rakentaja, esikatselu ja viennit kääntyvät, joten voit kirjoittaa CV:n suoraan suomalaiselle työnantajalle sopivalla kielellä sen sijaan, että kirjoittaisit sen englanniksi ja kääntäisit jälkikäteen.',
          ],
        },
        {
          heading: 'Sama sisältö kahdella kielellä',
          examplePair: {
            weakLabel: 'Suomeksi',
            weak: '"Johdin B2B-yhteistyöalustan päästä päähän -suunnittelun, parantaen aktivointia 21 %."',
            strongLabel: 'Englanniksi',
            strong: '"Led end-to-end design for a B2B collaboration suite, improving activation by 21%."',
          },
          paragraphsAfter: [
            'Rakenne ja luvut pysyvät samoina — vain kieli vaihtuu. Vältä suoraa sanasta sanaan -käännöstä, joka usein kuulostaa kömpelöltä; kirjoita lause uudelleen kohdekielellä.',
          ],
        },
        {
          heading: 'Turvallinen, ammattimainen pohjavalinta',
          paragraphs: [
            `Minimalisti, Classic Professional ja Navy Professional lukevat siistin ja asiallisen, mikä sopii suomalaisten työnantajien yleensä maltillisiin odotuksiin — mutta mikä tahansa ${TEMPLATE_COUNT} pohjasta toimii, ja vaihtaminen ei koske tekstiäsi.`,
          ],
          linkParagraphs: [
            {
              before: 'Katso kaikki ',
              linkText: `${TEMPLATE_COUNT} ilmaista pohjaa`,
              linkTo: ROUTES.freeTemplates,
              view: 'freeTemplates',
              after: '.',
            },
          ],
        },
      ],
      ctaLabel: 'Aloita CV:si rakentaminen',
      ctaNote: 'Ei kirjautumista. Saatavilla suomeksi ja englanniksi.',
      seeAlsoLabel: 'Katso myös:',
      seeAlso: [
        { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV:n taito-osion esimerkkejä' },
        { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-ystävällinen CV-opas' },
        { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Ilmaiset CV-pohjat' },
        { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV-esimerkkejä aloittain' },
      ],
    }
  }

  return {
    kicker: 'Examples',
    title: 'Finnish CV Examples',
    intro:
      'A Finnish CV differs from a lot of international practice in a few concrete ways. Here’s what to include, what to leave out, and how PortifyCV supports a bilingual application.',
    sections: [
      {
        heading: 'What to leave out',
        paragraphs: [
          'A national ID number, marital status, or other sensitive personal details don’t belong on a CV — they have nothing to do with your qualifications, and in many countries asking for them would even be illegal. PortifyCV’s Personal Information section only asks for name, title, and contact details — there’s no field where this kind of data could accidentally end up.',
        ],
      },
      {
        heading: 'Length and structure',
        paragraphs: [
          'One or two pages is enough for most people — a longer CV doesn’t read as more experienced, it reads as unedited. The structure is close to the rest of Europe: contact details, a short summary, work experience, education, skills, and often a dedicated languages section.',
        ],
      },
      {
        heading: 'The languages section matters more than usual',
        paragraphs: [
          'Finnish employers often ask about both Finnish and Swedish proficiency in addition to English. PortifyCV’s Languages section lets you mark a proficiency level for each — worth filling in carefully, since it’s one of the first things many recruiters in Finland check.',
        ],
      },
      {
        heading: 'Build it in Finnish — or both languages',
        paragraphs: [
          'PortifyCV runs entirely in Finnish through the language toggle: the whole builder, preview, and exports switch, so you can write a CV directly in the language your target employer expects instead of writing it in English and translating afterward.',
        ],
      },
      {
        heading: 'The same content in both languages',
        examplePair: {
          weakLabel: 'English',
          weak: '"Led end-to-end design for a B2B collaboration suite, improving activation by 21%."',
          strongLabel: 'Finnish',
          strong: '"Johdin B2B-yhteistyöalustan päästä päähän -suunnittelun, parantaen aktivointia 21 %."',
        },
        paragraphsAfter: [
          'The structure and numbers stay the same — only the language changes. Avoid a direct word-for-word translation, which often reads awkwardly; rewrite the sentence naturally in the target language instead.',
        ],
      },
      {
        heading: 'A safe, professional template choice',
        paragraphs: [
          `Minimalist, Classic Professional, and Navy Professional read clean and understated, matching the generally restrained expectations of Finnish employers — but any of the ${TEMPLATE_COUNT} templates works, and switching never touches your text.`,
        ],
        linkParagraphs: [
          {
            before: 'See all ',
            linkText: `${TEMPLATE_COUNT} free templates`,
            linkTo: ROUTES.freeTemplates,
            view: 'freeTemplates',
            after: '.',
          },
        ],
      },
    ],
    ctaLabel: 'Start building your CV',
    ctaNote: 'No login. Available in Finnish and English.',
    seeAlsoLabel: 'See also:',
    seeAlso: [
      { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV Skills Examples' },
      { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
      { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Free CV Templates' },
      { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV Examples by Field' },
    ],
  }
}

function FinnishCvExamplesPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = getCopy(locale === 'fi' ? 'fi' : 'en')

  return (
    <section className="legal-page">
      <div className="legal-page__inner">
        <p className="legal-page__kicker">{copy.kicker}</p>
        <h1 className="legal-page__title">{copy.title}</h1>
        <p>{copy.intro}</p>

        {copy.sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {section.examplePair ? (
              <ul>
                <li>
                  <strong>{section.examplePair.weakLabel}:</strong> {section.examplePair.weak}
                </li>
                <li>
                  <strong>{section.examplePair.strongLabel}:</strong> {section.examplePair.strong}
                </li>
              </ul>
            ) : null}
            {section.paragraphsAfter?.map((paragraph, index) => (
              <p key={`after-${index}`}>{paragraph}</p>
            ))}
            {section.linkParagraphs?.map((linkParagraph, index) => (
              <p key={`link-${index}`}>
                {linkParagraph.before}
                <InternalNavLink to={linkParagraph.linkTo} onNavigate={() => onNavigateToView(linkParagraph.view)}>
                  {linkParagraph.linkText}
                </InternalNavLink>
                {linkParagraph.after}
              </p>
            ))}
          </div>
        ))}

        <div className="legal-page__cta">
          <button type="button" className="landing-cta" onClick={() => onGetStarted()}>
            {copy.ctaLabel}
          </button>
          <span className="legal-page__cta-note">{copy.ctaNote}</span>
        </div>
        <div className="templates-page-links">
          <span>{copy.seeAlsoLabel}</span>
          {copy.seeAlso.map((link) => (
            <InternalNavLink key={link.view} to={link.to} onNavigate={() => onNavigateToView(link.view)}>
              {link.text}
            </InternalNavLink>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FinnishCvExamplesPage
