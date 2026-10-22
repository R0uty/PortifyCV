import GuideLayout from '../components/GuideLayout'
import { ROUTES } from '../utils/routes'
import { fieldSearch } from '../utils/templateFields'

// "See also" opens the templates grid on the Tech chip (1.6.14).
const TECH_SEARCH = fieldSearch('tech')

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Esimerkkejä',
      title: 'IT-alan CV-esimerkkejä',
      intro:
        'Järjestelmänvalvojasta tukihenkilöön: IT-rekrytoija etsii tiettyjä järjestelmiä ja sertifikaatteja, ei yleisiä "tietokonetaitoja". Näin kirjoitat sen näkyviin.',
      sections: [
        {
          heading: 'Kokemuskohta, joka näyttää mittarin',
          examplePair: {
            weakLabel: 'Heikko',
            weak: '"Vastasin yrityksen IT-infrastruktuurista ja autoin työntekijöitä tietokoneongelmissa."',
            strongLabel: 'Vahva',
            strong: '"Lyhensin tukipyyntöjen keskimääräisen ratkaisuajan 48 tunnista 6 tuntiin rakentamalla sisäisen tietopankin uudelleen ja automatisoimalla salasanan nollauspyynnöt."',
          },
        },
        {
          heading: 'Sertifikaatit kuuluvat omaan kohtaansa, tarkasti nimettynä',
          paragraphs: [
            'CompTIA A+, Network+, Security+, Cisco CCNA, Microsoft-sertifikaatit — PortifyCV:n Sertifikaatit-osiossa on oma kenttä myöntäjälle, vuodelle ja vanhenemispäivälle, joten voimassaoloaika näkyy suoraan eikä jää arvailun varaan.',
          ],
        },
        {
          heading: 'Taidot, jotka lukevat IT-alalta — ei toimistotaidoista',
          list: [
            'Active Directory, Windows Server, Linux-järjestelmänhallinta',
            'Verkot: TCP/IP, DNS, DHCP, VPN',
            'Työkalut: Jira, ServiceNow, muut lippujärjestelmät',
            'Virtualisointi: VMware, Hyper-V',
          ],
          paragraphsAfter: [
            '"Microsoft Office" ei erotu joukosta. "Active Directory -käyttäjähallinta 500 käyttäjän ympäristössä" erottuu.',
          ],
        },
        {
          heading: 'IT-hakemukset kulkevat usein ATS:n läpi',
          paragraphs: [
            'Isommat yritykset seulovat IT-hakemuksia automaattisesti erityisen usein — yksipalstainen, selkeästi otsikoitu asettelu kannattaa tässä alalla enemmän kuin useimmissa.',
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
    title: 'IT CV Examples',
    intro:
      'From sysadmin to service desk: IT hiring managers look for specific systems and certifications, not generic "computer skills." Here’s how to make that visible.',
    sections: [
      {
        heading: 'An experience bullet that shows a metric',
        examplePair: {
          weakLabel: 'Weak',
          weak: '"Responsible for maintaining company IT infrastructure and helping employees with computer issues."',
          strongLabel: 'Strong',
          strong: '"Reduced average helpdesk ticket resolution time from 48 hours to 6 hours by rebuilding the internal knowledge base and automating password-reset requests."',
        },
      },
      {
        heading: 'Certifications belong in their own section, named precisely',
        paragraphs: [
          'CompTIA A+/Network+/Security+, Cisco CCNA, Microsoft certifications — PortifyCV’s Certificates section has dedicated fields for issuer, year, and expiry date, so validity shows up directly instead of being left to guesswork.',
        ],
      },
      {
        heading: 'Skills that read as IT, not office skills',
        list: [
          'Active Directory, Windows Server, Linux system administration',
          'Networking: TCP/IP, DNS, DHCP, VPN',
          'Tools: Jira, ServiceNow, other ticketing systems',
          'Virtualization: VMware, Hyper-V',
        ],
        paragraphsAfter: [
          '"Microsoft Office" doesn’t stand out. "Active Directory user management across a 500-seat environment" does.',
        ],
      },
      {
        heading: 'IT applications go through an ATS more often than most',
        paragraphs: [
          'Larger companies screen IT applications automatically especially often — a single-column, clearly-headed layout earns more here than in most fields.',
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
    ctaNote: 'No login. Nothing saved until you export.',
    seeAlso: [
      { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV Skills Examples' },
      { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
      { to: `${ROUTES.freeTemplates}${TECH_SEARCH}`, view: 'freeTemplates', search: TECH_SEARCH, text: 'Tech CV templates' },
      { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV Examples by Field' },
    ],
  }
}

function ItCvExamplesPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = getCopy(locale === 'fi' ? 'fi' : 'en')

  return (
    <GuideLayout
      view="itCv"
      locale={locale}
      kicker={copy.kicker}
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
      cta={{ label: copy.ctaLabel, note: copy.ctaNote }}
      related={copy.seeAlso.map((link) => ({ view: link.view, search: link.search, title: link.text }))}
      onGetStarted={onGetStarted}
      onNavigateToView={onNavigateToView}
    ></GuideLayout>
  )
}

export default ItCvExamplesPage
