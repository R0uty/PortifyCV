import GuideLayout from '../components/GuideLayout'
import ExampleCvLinks from '../components/ExampleCvLinks'
import { CONTENT_PAGE_EXAMPLES } from '../utils/exampleCvs'
import { templatePageLink } from '../utils/pageMeta'
import { ROUTES } from '../utils/routes'
import { fieldSearch } from '../utils/templateFields'

// "See also" opens the templates grid on the Tech chip (1.6.14).
const TECH_SEARCH = fieldSearch('tech')
const DEVELOPER_TEMPLATE = templatePageLink('developer')

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
            'PortifyCV tunnistaa taitosi avainsanoilla ja ryhmittelee ne automaattisesti (Kehykset, Tietokannat, Pilvi, DevOps, Turvallisuus) useissa pohjissa, mukaan lukien Kehittäjä-pohjassa — riittää, että listaat taidot oikeilla nimillä.',
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
          linkParagraphs: [
            {
              before: '',
              linkText: 'Kehittäjä-pohjassa',
              linkTo: DEVELOPER_TEMPLATE.to,
              view: DEVELOPER_TEMPLATE.view,
              after: ' on tumma sivupalkki sekä projekti- ja saavutuskortit — rakennettu nimenomaan projektipohjaiselle uralle.',
            },
          ],
        },
      ],
      ctaLabel: 'Aloita Kehittäjä-pohjalla',
      fullExamples: {
        heading: 'Kokonaisia kehittäjän CV-esimerkkejä',
        intro: 'Jokainen avautuu valmiina CV:nä omassa pohjassaan, ja "Käytä tätä esimerkkiä" lataa sen editoriin muokattavaksi.',
      },
      ctaNote: 'Ei kirjautumista. Vaihda pohjaa milloin tahansa.',
      seeAlso: [
        { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV:n taito-osion esimerkkejä' },
        { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-ystävällinen CV-opas' },
        { to: `${ROUTES.freeTemplates}${TECH_SEARCH}`, view: 'freeTemplates', search: TECH_SEARCH, text: 'Tekniikan ja IT-alan CV-pohjat' },
        { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV-esimerkkejä aloittain' },
      ],
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
        linkParagraphs: [
          {
            before: 'The ',
            linkText: 'Developer template',
            linkTo: DEVELOPER_TEMPLATE.to,
            view: DEVELOPER_TEMPLATE.view,
            after: ' has a dark sidebar plus project and achievement cards — built specifically for a project-based career.',
          },
        ],
      },
    ],
    ctaLabel: 'Start with the Developer template',
    fullExamples: {
      heading: 'Full developer CV examples',
      intro: 'Each one opens as a complete CV in its template, and "Use this example" loads it into the builder to edit.',
    },
    ctaNote: 'No login. Switch templates any time.',
    seeAlso: [
      { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV Skills Examples' },
      { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
      { to: `${ROUTES.freeTemplates}${TECH_SEARCH}`, view: 'freeTemplates', search: TECH_SEARCH, text: 'Tech CV templates' },
      { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV Examples by Field' },
    ],
  }
}

function DeveloperCvExamplesPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = getCopy(locale === 'fi' ? 'fi' : 'en')

  return (
    <GuideLayout
      view="developerCv"
      locale={locale}
      kicker={copy.kicker}
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
      cta={{ label: copy.ctaLabel, note: copy.ctaNote, onClick: () => onGetStarted('developer') }}
      related={copy.seeAlso.map((link) => ({ view: link.view, search: link.search, title: link.text }))}
      onGetStarted={onGetStarted}
      onNavigateToView={onNavigateToView}
    >
      <div className="guide__section">
        <h2>{copy.fullExamples.heading}</h2>
        <p>{copy.fullExamples.intro}</p>
        <ExampleCvLinks examples={CONTENT_PAGE_EXAMPLES.developerCv} locale={locale} onNavigateToView={onNavigateToView} />
      </div>
    </GuideLayout>
  )
}

export default DeveloperCvExamplesPage
