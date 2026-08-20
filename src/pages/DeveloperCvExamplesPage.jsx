import InternalNavLink from '../components/InternalNavLink'
import { ROUTES } from '../utils/routes'

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Esimerkkejä',
      title: 'Kehittäjän CV-esimerkkejä',
      intro:
        'Kehittäjän CV:tä ei arvioida tehtävänimikkeen vaan sen perusteella, mitä olet rakentanut ja millä vaikutuksella. Näin rakennat kokemuskohdat ja projektit, jotka näyttävät sen.',
      sections: [
        {
          heading: 'Kokemuskohta, joka näyttää vaikutuksen',
          examplePair: {
            weakLabel: 'Heikko',
            weak: '"Työskentelin backend-järjestelmien parissa ja korjasin virheitä."',
            strongLabel: 'Vahva',
            strong: '"Migroin monoliittisen Rails-API:n mikropalveluiksi, pudottaen p95-vasteajan 800 ms:sta 120 ms:iin ja vähentäen päivystyshälytyksiä 60 %."',
          },
          paragraphsAfter: [
            'Nimeä järjestelmä, mittari ja luku. "Korjasin virheitä" ei kerro mitään mitattavaa — "vähensin päivystyshälytyksiä 60 %" kertoo.',
          ],
        },
        {
          heading: 'Projektikohta, joka kannattaa muotoilla samalla tavalla joka kerta',
          paragraphs: [
            'Nimi, yhden lauseen kuvaus, teknologiapino ja linkit — PortifyCV:n Projektit-osiossa on omat kentät kaikille näille (myös GitHub- ja demolinkille), joten tätä rakennetta ei tarvitse väkisin sovittaa muuhun tekstiin.',
          ],
          examplePair: {
            weakLabel: 'Esimerkki',
            weak: '"Atlas Design System" — jaettu komponenttikirjasto, jonka kuusi tuotetiimiä ottivat käyttöön.',
            strongLabel: 'Pino',
            strong: 'React, TypeScript, Storybook · github.com/... · demo-linkki',
          },
        },
        {
          heading: 'Taidot: listaa, älä ryhmittele käsin',
          paragraphs: [
            'PortifyCV tunnistaa taitosi avainsanoilla ja ryhmittelee ne automaattisesti (Kehykset, Tietokannat, Pilvi, DevOps, Turvallisuus) useissa pohjissa, mukaan lukien Developer-pohjassa — riittää, että listaat taidot oikeilla nimillä.',
          ],
          linkParagraphs: [
            {
              before: 'Katso ',
              linkText: 'CV:n taito-osion esimerkkejä',
              linkTo: ROUTES.cvSkills,
              view: 'cvSkills',
              after: ' tarkemmin.',
            },
          ],
        },
        {
          heading: 'Linkit-osio on osa tarinaa, ei jälkiajatus',
          paragraphs: [
            'GitHub, portfolio ja henkilökohtainen sivu kuuluvat omaan Linkit-osioonsa — ei upotettuina yhteenvetoon. Rekrytoija, joka haluaa nähdä koodisi, löytää sen suoraan.',
          ],
        },
        {
          heading: 'Pohja, joka on rakennettu juuri tälle',
          paragraphs: [
            'Developer-pohjassa on tumma sivupalkki sekä projekti- ja saavutuskortit — rakennettu nimenomaan projektipohjaiselle uralle.',
          ],
        },
      ],
      ctaLabel: 'Aloita Developer-pohjalla',
      ctaNote: 'Ei kirjautumista. Vaihda pohjaa milloin tahansa.',
    }
  }

  return {
    kicker: 'Examples',
    title: 'Developer CV Examples',
    intro:
      'A developer CV doesn’t get judged on job title — it gets judged on what you’ve built and what happened because you built it. Here’s how to write experience bullets and project entries that actually show that.',
    sections: [
      {
        heading: 'An experience bullet that shows impact',
        examplePair: {
          weakLabel: 'Weak',
          weak: '"Worked on backend systems and fixed bugs."',
          strongLabel: 'Strong',
          strong: '"Migrated a monolithic Rails API to microservices, cutting p95 latency from 800ms to 120ms and reducing on-call incidents by 60%."',
        },
        paragraphsAfter: [
          'Name the system, the metric, and the number. "Fixed bugs" doesn’t tell anyone anything measurable — "reduced on-call incidents by 60%" does.',
        ],
      },
      {
        heading: 'A project entry worth structuring the same way every time',
        paragraphs: [
          'Name, one-sentence description, tech stack, and links — PortifyCV’s Projects section has dedicated fields for all of this (including GitHub and demo links), so you don’t have to force this structure into free-text.',
        ],
        examplePair: {
          weakLabel: 'Example',
          weak: '"Atlas Design System" — a shared component library adopted by six product teams.',
          strongLabel: 'Stack',
          strong: 'React, TypeScript, Storybook · github.com/... · demo link',
        },
      },
      {
        heading: 'Skills: list them, don’t hand-group them',
        paragraphs: [
          'PortifyCV detects your skills by keyword and automatically groups them (Frameworks, Databases, Cloud, DevOps, Security) in several templates, including Developer — just list them by their real name.',
        ],
        linkParagraphs: [
          {
            before: 'See ',
            linkText: 'CV skills examples',
            linkTo: ROUTES.cvSkills,
            view: 'cvSkills',
            after: ' for more.',
          },
        ],
      },
      {
        heading: 'The Links section is part of the story, not an afterthought',
        paragraphs: [
          'GitHub, portfolio, and personal site belong in their own Links section — not buried in your summary. A recruiter who wants to see your code should be able to find it directly.',
        ],
      },
      {
        heading: 'A template built for exactly this',
        paragraphs: [
          'The Developer template has a dark sidebar plus project and achievement cards — built specifically for a project-based career.',
        ],
      },
    ],
    ctaLabel: 'Start with the Developer template',
    ctaNote: 'No login. Switch templates any time.',
  }
}

function DeveloperCvExamplesPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
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
          <button type="button" className="landing-cta" onClick={() => onGetStarted('developer')}>
            {copy.ctaLabel}
          </button>
          <span className="legal-page__cta-note">{copy.ctaNote}</span>
        </div>
      </div>
    </section>
  )
}

export default DeveloperCvExamplesPage
