import GuideLayout from '../components/GuideLayout'
import ExampleCvLinks from '../components/ExampleCvLinks'
import { CONTENT_PAGE_EXAMPLES } from '../utils/exampleCvs'
import { ROUTES } from '../utils/routes'
import { fieldSearch } from '../utils/templateFields'

// "See also" opens the templates grid on the Tech chip (1.6.14).
const TECH_SEARCH = fieldSearch('tech')

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Esimerkkejä',
      title: 'Tietoturva-alan CV-esimerkkejä',
      intro:
        'Tietoturva-CV:n pitää näyttää sekä leveyttä (viitekehykset, vaatimustenmukaisuus) että kädet-savessa-erikoisuutta (työkalut, oikeat tapaukset) — "tietoturva-ammattilainen" ei kerro kummastakaan mitään.',
      sections: [
        {
          heading: 'Kokemuskohta, joka näyttää mitä oikeasti teit',
          examplePair: {
            weakLabel: 'Heikko',
            weak: '"Vastasin yrityksen tietoturvasta ja uhkien seurannasta."',
            strongLabel: 'Vahva',
            strong: '"Johdin tietojenkalastelukampanjan häiriövastetta 400 työntekijän laajuudessa, rajaten tunkeutumisen 3 tunnissa ja rakentaen SIEM:iin uudet tunnistussäännöt saman kaavan varalle."',
          },
        },
        {
          heading: 'Sertifikaatit, jotka kannattaa nimetä tarkasti',
          paragraphs: [
            'CompTIA Security+, CEH, OSCP, CISSP, CISM — kirjoita ne omaan Sertifikaatit-osioonsa myöntäjän ja vuoden kanssa. Osa näistä vanhenee, joten PortifyCV:n vanhenemispäivä-kenttä on tässä alalla erityisen hyödyllinen.',
          ],
        },
        {
          heading: 'Taidot, jotka näyttävät konkreettisia työkaluja',
          list: [
            'SIEM: Splunk, QRadar, Microsoft Sentinel',
            'Haavoittuvuuksien hallinta ja tunkeutumistestaus',
            'Häiriövaste ja rikostekninen analyysi',
            'Vaatimustenmukaisuus: NIST, ISO 27001',
            'Identiteetin- ja pääsynhallinta (IAM)',
          ],
        },
        {
          heading: 'Käytännön näyttö: Hack The Box, TryHackMe, CTF-tulokset',
          paragraphs: [
            'PortifyCV:n Linkit-osiossa on omat kentät suoraan Hack The Boxille ja TryHackMelle — jos sinulla on profiili jommassakummassa, se kuuluu tähän omana rivinään, ei upotettuna tekstiin.',
          ],
        },
        {
          heading: 'Nämä hakemukset kulkevat lähes aina ATS:n läpi',
          paragraphs: [
            'Isot yritykset ja julkishallinto seulovat tietoturvahakemuksia automaattisesti käytännössä aina — yksipalstainen asettelu ilman sarakkeita tai kuvakkeita on tällä alalla erityisen tärkeä.',
          ],
          linkParagraphs: [
            {
              before: 'Lue ',
              linkText: 'ATS-ystävällinen CV-opas',
              linkTo: ROUTES.atsGuide,
              view: 'atsGuide',
              after: ' ja tarkista oma pisteesi ennen lähettämistä.',
            },
          ],
        },
      ],
      ctaLabel: 'Aloita CV:si rakentaminen',
      fullExamples: {
        heading: 'Kokonainen tietoturva-analyytikon CV',
        intro: 'Sama esimerkkihenkilö kahdessa pohjassa. Kumpikin avautuu valmiina CV:nä, ja "Käytä tätä esimerkkiä" lataa sen editoriin muokattavaksi.',
      },
      ctaNote: 'Ei kirjautumista. Ei mitään tallennettua ennen kuin viet CV:n.',
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
    title: 'Cybersecurity CV Examples',
    intro:
      'A security CV needs to show both breadth (frameworks, compliance) and hands-on specificity (tools, real incidents) — "cybersecurity professional" tells a recruiter neither.',
    sections: [
      {
        heading: 'An experience bullet that shows what you actually did',
        examplePair: {
          weakLabel: 'Weak',
          weak: '"Responsible for company cybersecurity and monitoring threats."',
          strongLabel: 'Strong',
          strong: '"Led incident response for a phishing campaign affecting 400 employees, containing the breach within 3 hours and rebuilding SIEM detection rules to catch the same pattern going forward."',
        },
      },
      {
        heading: 'Certifications worth naming precisely',
        paragraphs: [
          'CompTIA Security+, CEH, OSCP, CISSP, CISM — write them into their own Certificates section with issuer and year. Several of these expire, so PortifyCV’s expiry-date field is especially useful in this field.',
        ],
      },
      {
        heading: 'Skills that show real tools',
        list: [
          'SIEM: Splunk, QRadar, Microsoft Sentinel',
          'Vulnerability management and penetration testing',
          'Incident response and forensic analysis',
          'Compliance: NIST, ISO 27001',
          'Identity and access management (IAM)',
        ],
      },
      {
        heading: 'Hands-on proof: Hack The Box, TryHackMe, CTF results',
        paragraphs: [
          'PortifyCV’s Links section has dedicated fields for Hack The Box and TryHackMe specifically — if you have a profile on either, it belongs there as its own line, not buried in prose.',
        ],
      },
      {
        heading: 'These applications go through an ATS almost every time',
        paragraphs: [
          'Large companies and public-sector employers screen security applications automatically almost universally — a single-column layout with no columns or icons matters more here than in most fields.',
        ],
        linkParagraphs: [
          {
            before: 'Read the ',
            linkText: 'ATS-Friendly CV Guide',
            linkTo: ROUTES.atsGuide,
            view: 'atsGuide',
            after: ' and check your own score before you apply.',
          },
        ],
      },
    ],
    ctaLabel: 'Start building your CV',
    fullExamples: {
      heading: 'A full cybersecurity analyst CV',
      intro: 'The same example person in two templates. Each opens as a complete CV, and "Use this example" loads it into the builder to edit.',
    },
    ctaNote: 'No login. Nothing saved until you export.',
    seeAlso: [
      { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV Skills Examples' },
      { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
      { to: `${ROUTES.freeTemplates}${TECH_SEARCH}`, view: 'freeTemplates', search: TECH_SEARCH, text: 'Tech CV templates' },
      { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV Examples by Field' },
    ],
  }
}

function CybersecurityCvExamplesPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = getCopy(locale === 'fi' ? 'fi' : 'en')

  return (
    <GuideLayout
      view="cybersecurityCv"
      locale={locale}
      kicker={copy.kicker}
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
      cta={{ label: copy.ctaLabel, note: copy.ctaNote }}
      related={copy.seeAlso.map((link) => ({ view: link.view, search: link.search, title: link.text }))}
      onGetStarted={onGetStarted}
      onNavigateToView={onNavigateToView}
    >
      <div className="guide__section">
        <h2>{copy.fullExamples.heading}</h2>
        <p>{copy.fullExamples.intro}</p>
        <ExampleCvLinks examples={CONTENT_PAGE_EXAMPLES.cybersecurityCv} locale={locale} onNavigateToView={onNavigateToView} />
      </div>
    </GuideLayout>
  )
}

export default CybersecurityCvExamplesPage
