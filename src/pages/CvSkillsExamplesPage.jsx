import InternalNavLink from '../components/InternalNavLink'
import { ROUTES } from '../utils/routes'

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Esimerkit',
      title: 'CV:n taito-osion esimerkkejä',
      intro:
        'Taito-osio on lyhin osa CV:täsi ja usein se, jota rekrytoija ja hakijaseurantajärjestelmä lukevat ensimmäisenä avainsanoja etsiessään. Näin valitset ja järjestät taidot, joilla on oikeasti merkitystä.',
      sections: [
        {
          heading: 'Kaksi tyyppiä taitoja — ja miksi vain toinen kuuluu listaan',
          paragraphs: [
            'Kovat taidot ovat tarkistettavissa: työkalut, ohjelmointikielet, menetelmät, sertifikaatit. Ne kuuluvat taito-osioon sellaisenaan. Pehmeät taidot ("johtajuus", "viestintä", "tiimipelaaja") eivät todista mitään pelkkänä sanana kelluvana listassa — ne kannattaa näyttää kokemuskohdissa konkreettisen saavutuksen vieressä, ei nimetä erikseen taitolistassa.',
          ],
        },
        {
          heading: 'Esimerkkejä taitoryhmistä',
          paragraphs: [
            'Nämä ovat havainnollistavia ryhmittelyjä, eivät tyhjentäviä listoja — poimi ja muokkaa oman alasi mukaan:',
          ],
          list: [
            'Suunnittelutyökalut: Figma, Sketch, Adobe XD, Webflow, Suunnittelujärjestelmät, Prototyypitys',
            'Kehitys: Python, SQL, JavaScript, React, Git, Docker, AWS',
            'Prosessit ja menetelmät: Agile/Scrum, Käyttäjätutkimus, A/B-testaus, Sidosryhmien johtaminen',
          ],
          paragraphsAfter: [
            'PortifyCV ryhmittelee taitosi automaattisesti näihin kaltaisiin kategorioihin (Kehykset, Tietokannat, Pilvi, DevOps, Turvallisuus) useissa pohjissa — riittää, että listaat taidot, avainsanantunnistus hoitaa ryhmittelyn puolestasi.',
          ],
        },
        {
          heading: 'Kielitaito kuuluu omaan osioonsa',
          paragraphs: [
            'Puhuttu ja kirjoitettu kielitaito (Englanti — Sujuva, Suomi — Äidinkieli) ei kuulu taito-osioon — PortifyCV:ssä sillä on oma "Kielet"-osionsa, jossa jokaiselle kielelle voi merkitä tason erikseen. Sekoittaminen taitolistaan hukkaa molemmat: kielitaso ei näy selkeästi rivissä muiden taitojen joukossa.',
          ],
        },
        {
          heading: 'Kuinka monta taitoa — ei liikaa, ei liian vähän',
          paragraphs: [
            'Alle neljä taitoa lukee ohuelta; PortifyCV:n sisäänrakennettu tarkistus merkitsee taito-osion, jossa on alle neljä kohtaa. Toisessa päässä: 30 taidon tyhjentävä lista ei erotu joukosta — rekrytoija ei tiedä mitkä niistä ovat oikeasti vahvuuksiasi. 8–15 tarkkaan valittua taitoa, jotka pystyt perustelemaan haastattelussa, on useimmiten oikea väli.',
          ],
        },
        {
          heading: 'Kohdista taidot työpaikkailmoitukseen',
          paragraphs: [
            'Sama taito voidaan kirjoittaa monella tavalla ("UX-tutkimus" vs. "Käyttäjätutkimus") — jos ilmoitus käyttää tiettyä termiä ja sinulla on kyseinen osaaminen, käytä samaa sanamuotoa.',
          ],
          linkParagraph: {
            before: 'PortifyCV:n ',
            linkText: 'ATS-paneeli',
            linkTo: ROUTES.atsGuide,
            after: ' näyttää liittämääsi työpaikkailmoitukseen verrattuna, mitkä termit puuttuvat CV:stäsi — ei arvausta.',
          },
        },
        {
          heading: 'Virheet, jotka kannattaa välttää',
          list: [
            'Ohuet yleistermit ilman todistetta ("Microsoft Office", "tiimipelaaja", "ahkera")',
            'Taitojen listaaminen, joita et pystyisi perustelemaan haastattelussa',
            'Yksi erottelematon tekstimössö erillisten, selattavien kohtien sijaan',
            'Kielitaidon sekoittaminen taitolistaan oman osion sijaan',
          ],
        },
      ],
      ctaLabel: 'Lisää taitosi nyt',
      ctaNote: 'Ei kirjautumista. Automaattinen ryhmittely useissa pohjissa.',
      seeAlsoLabel: 'Katso myös:',
      seeAlso: [
        { to: ROUTES.howToWrite, view: 'howToWrite', text: 'Näin kirjoitat CV:n' },
        { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-ystävällinen CV-opas' },
        { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Ilmaiset CV-pohjat' },
        { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV-esimerkkejä aloittain' },
      ],
    }
  }

  return {
    kicker: 'Examples',
    title: 'CV Skills Examples',
    intro:
      'The skills section is the shortest part of your CV, and often the first place a recruiter — or an applicant tracking system — looks for keywords. Here’s how to choose and organize skills that actually matter.',
    sections: [
      {
        heading: 'Two kinds of skills — and why only one belongs in the list',
        paragraphs: [
          'Hard skills are verifiable: tools, programming languages, methods, certifications. These belong in the skills section as-is. Soft skills ("leadership," "communication," "team player") don’t prove anything floating alone in a list — show them inside your experience bullets next to a concrete achievement instead of naming them separately in a skills list.',
        ],
      },
      {
        heading: 'Example skill groupings',
        paragraphs: [
          'These are illustrative groupings, not exhaustive lists — pick and adapt what fits your own field:',
        ],
        list: [
          'Design tools: Figma, Sketch, Adobe XD, Webflow, Design Systems, Prototyping',
          'Engineering: Python, SQL, JavaScript, React, Git, Docker, AWS',
          'Process and methodology: Agile/Scrum, User Research, A/B Testing, Stakeholder Management',
        ],
        paragraphsAfter: [
          'PortifyCV automatically groups your skills into categories like these (Frameworks, Databases, Cloud, DevOps, Security) in several templates — just list them, keyword detection handles the grouping for you.',
        ],
      },
      {
        heading: 'Language proficiency belongs in its own section',
        paragraphs: [
          'Spoken and written language ability (English — Fluent, Finnish — Native) doesn’t belong in the skills section — PortifyCV has a dedicated "Languages" section where each language gets its own proficiency level. Mixing it into the skills list loses both: proficiency doesn’t read clearly buried among other skills.',
        ],
      },
      {
        heading: 'How many skills — not too many, not too few',
        paragraphs: [
          'Fewer than four reads thin; PortifyCV’s built-in check flags a skills section with under four entries. At the other end: an exhaustive list of 30 skills doesn’t stand out — a recruiter can’t tell which ones are actually your strengths. 8-15 carefully chosen skills you can defend in an interview is usually the right range.',
        ],
      },
      {
        heading: 'Match your skills to the job posting',
        paragraphs: [
          'The same skill can be phrased different ways ("UX research" vs. "User research") — if the posting uses a specific term and you have that skill, match its wording.',
        ],
        linkParagraph: {
          before: 'PortifyCV’s ',
          linkText: 'ATS panel',
          linkTo: ROUTES.atsGuide,
          after: ' shows exactly which terms from a pasted job posting are missing from your CV — no guessing.',
        },
      },
      {
        heading: 'Mistakes to avoid',
        list: [
          'Vague filler with nothing to back it up ("Microsoft Office," "team player," "hard worker")',
          'Listing skills you couldn’t defend in an interview',
          'One undifferentiated wall of text instead of separate, scannable entries',
          'Mixing language proficiency into the skills list instead of its own section',
        ],
      },
    ],
    ctaLabel: 'Add your skills now',
    ctaNote: 'No login. Auto-grouped in several templates.',
    seeAlsoLabel: 'See also:',
    seeAlso: [
      { to: ROUTES.howToWrite, view: 'howToWrite', text: 'How to Write a CV' },
      { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
      { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Free CV Templates' },
      { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV Examples by Field' },
    ],
  }
}

function CvSkillsExamplesPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
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
            {section.list ? (
              <ul>
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.paragraphsAfter?.map((paragraph, index) => (
              <p key={`after-${index}`}>{paragraph}</p>
            ))}
            {section.linkParagraph ? (
              <p>
                {section.linkParagraph.before}
                <InternalNavLink to={section.linkParagraph.linkTo} onNavigate={() => onNavigateToView('atsGuide')}>
                  {section.linkParagraph.linkText}
                </InternalNavLink>
                {section.linkParagraph.after}
              </p>
            ) : null}
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

export default CvSkillsExamplesPage
