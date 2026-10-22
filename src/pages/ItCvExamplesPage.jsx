import ExampleCvLinks from '../components/ExampleCvLinks'
import GuideLayout from '../components/GuideLayout'
import { CONTENT_PAGE_EXAMPLES } from '../utils/exampleCvs'
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
        'Järjestelmänvalvojasta tukihenkilöön: IT-rekrytoija etsii tiettyjä järjestelmiä, ympäristön kokoa ja sertifikaatteja, ei yleisiä "tietokonetaitoja". Näin kirjoitat ne näkyviin, ja lopussa on kokonainen esimerkki-CV.',
      sections: [
        {
          heading: 'Mitä IT-rekrytoija katsoo ensimmäiseksi',
          paragraphs: [
            'Ensimmäisellä silmäyksellä rekrytoija etsii neljää asiaa: minkä kokoista ympäristöä olet tukenut, millä tasolla (1., 2. vai 3. taso), mitä järjestelmiä ja työkaluja käytit ja mitä muuttui, koska olit siellä. Jos nämä löytyvät viimeisimmän tehtäväsi kolmesta ensimmäisestä rivistä, CV on jo parempi kuin useimmat.',
          ],
        },
        {
          heading: 'Kokemuskohta, joka näyttää mittarin',
          examplePair: {
            weakLabel: 'Heikko',
            weak: '"Vastasin yrityksen IT-infrastruktuurista ja autoin työntekijöitä tietokoneongelmissa."',
            strongLabel: 'Vahva',
            strong: '"Lyhensin palvelupisteen tikettien keskimääräisen ratkaisuajan 48 tunnista 6 tuntiin uudistamalla sisäisen tietopankin ja automatisoimalla salasanojen nollaukset."',
          },
          paragraphsAfter: [
            'Samaa mallia voi käyttää IT:n eri tehtävissä:',
          ],
          list: [
            'Järjestelmänvalvonta. Heikko: "Ylläpidin palvelimia." Vahva: "Ylläpidin 40 Windows- ja Linux-palvelinta 99,9 %:n käytettävyydellä ja automatisoin kuukausipäivitykset, mikä säästi noin 10 työtuntia kuukaudessa."',
            'Verkot. Heikko: "Hoidin yrityksen verkkoa." Vahva: "Uudistin kolmen toimipisteen verkon ja VPN:n; verkkokatkoista johtuvat tiketit vähenivät noin 70 %."',
            'Palvelupiste. Heikko: "Autoin käyttäjiä ongelmissa." Vahva: "Käsittelin noin 40 tikettiä päivässä, ja niistä 92 % ratkesi ensimmäisellä yhteydenotolla."',
          ],
        },
        {
          heading: 'Kerro ympäristöstäsi luvuin',
          paragraphs: [
            'Sama tehtävänimike voi tarkoittaa 20 tai 2 000 käyttäjän ympäristöä. Kerro koko, niin lukija näkee heti, millaiseen työhön olet tottunut:',
          ],
          list: [
            'käyttäjien määrä ("900 käyttäjää kolmessa toimipisteessä")',
            'laitteet ja palvelimet ("450 kannettavaa, 40 palvelinta")',
            'tikettimäärät ja tavoiteajat ("noin 40 tikettiä päivässä, SLA 8 tuntia")',
            'käytettävyys tai katkot ("99,9 %:n käytettävyys", "nolla suunnittelematonta katkoa vuonna 2024")',
          ],
        },
        {
          heading: 'Kerro taso, kun nimikkeet vaihtelevat',
          paragraphs: [
            'IT-nimikkeet tarkoittavat eri yrityksissä eri asioita: "IT-tuki" voi olla puhelinpalvelua tai palvelinylläpitoa. Lisää taso nimikkeen perään sulkuihin, esimerkiksi "IT-tukihenkilö (2. taso)", niin rekrytoijan ei tarvitse arvata. Jos olet siirtynyt tasolta toiselle saman työnantajan palveluksessa, listaa tehtävät erikseen, jotta eteneminen näkyy.',
          ],
        },
        {
          heading: 'Sertifikaatit omaan osioonsa ja tarkalla nimellä',
          paragraphs: [
            'CompTIA A+/Network+/Security+, Cisco CCNA, Microsoftin sertifikaatit: kirjoita ne omaan osioonsa tarkalla nimellä, myöntäjällä ja vuodella. PortifyCV:n Sertifikaatit-osiossa on kentät myöntäjälle, vuodelle ja vanhenemispäivälle, joten voimassaolo näkyy suoraan. Moni IT-sertifikaatti vanhenee, ja rekrytoija tarkistaa sen.',
          ],
        },
        {
          heading: 'Taidot, jotka kuulostavat IT:ltä, eivät toimistotaidoilta',
          paragraphs: [
            'Ryhmittele taidot alueittain, niin lukija löytää omansa nopeasti:',
          ],
          list: [
            'Järjestelmät: Active Directory, Microsoft 365, Windows Server, Linux',
            'Laitehallinta: Intune, SCCM, Jamf',
            'Verkot: TCP/IP, DNS, DHCP, VPN, palomuurit',
            'Työkalut ja prosessit: ServiceNow, Jira, ITIL',
            'Virtualisointi ja pilvi: VMware, Hyper-V, Azure',
          ],
          paragraphsAfter: [
            '"Microsoft Office" ei erotu. "Active Directoryn käyttäjähallinta 500 työaseman ympäristössä" erottuu.',
          ],
        },
        {
          heading: 'Näytä automatisointi ja dokumentointi',
          paragraphs: [
            'Parhaat IT-hakijat eivät vain korjaa samaa vikaa uudelleen, vaan estävät sen. Jos kirjoitit skriptin, joka poisti toistuvan työn, tai ohjeen, joka vähensi kysymyksiä, kerro se luvun kanssa: "PowerShell-skripti uusien tunnusten luontiin poisti noin 35 tikettiä viikossa." Tällainen rivi kertoo enemmän kuin pitkä lista työkaluja.',
          ],
        },
        {
          heading: 'Uran alussa: kotilabra ja projektit',
          paragraphs: [
            'Jos työkokemusta on vähän, oma testiympäristö on hyvä näyttö: virtuaalikoneilla rakennettu toimialue, kotiverkon VLANit tai pieni skripti, joka hoitaa jonkin arkisen tehtävän. Kirjaa ne Projektit-osioon kuten työtehtävät: mitä rakensit, millä välineillä ja mitä opit tai mikä parani.',
          ],
        },
        {
          heading: 'IT-hakemukset kulkevat ATS:n läpi useammin kuin useimmat',
          paragraphs: [
            'Suuret yritykset seulovat IT-hakemukset automaattisesti erityisen usein. Yksipalstainen asettelu ja selkeät osio-otsikot hyödyttävät tällä alalla enemmän kuin monella muulla.',
          ],
          linkParagraphs: [
            {
              before: 'Lue ',
              linkText: 'ATS-ystävällinen CV-opas',
              linkTo: ROUTES.atsGuide,
              view: 'atsGuide',
              after: ' ja tarkista oma CV:si ennen kuin haet.',
            },
          ],
        },
      ],
      ctaLabel: 'Aloita CV:si rakentaminen',
      ctaNote: 'Ei kirjautumista. Mitään ei tallenneta ennen kuin viet CV:n.',
      fullExamples: {
        heading: 'Kokonainen IT-tukihenkilön CV',
        intro: 'Sama esimerkkihenkilö kahdessa pohjassa: kuuden vuoden palvelupistekokemus, ympäristön koko luvuin, automatisointi ja voimassaolevat sertifikaatit. "Käytä tätä esimerkkiä" lataa sen editoriin muokattavaksi.',
      },
      seeAlso: [
        { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV:n taito-osion esimerkit' },
        { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-ystävällinen CV-opas' },
        { to: `${ROUTES.freeTemplates}${TECH_SEARCH}`, view: 'freeTemplates', search: TECH_SEARCH, text: 'Tekniikan ja IT-alan CV-pohjat' },
        { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV-esimerkit aloittain' },
      ],
    }
  }

  return {
    kicker: 'Examples',
    title: 'IT CV Examples',
    intro:
      'From sysadmin to service desk: IT hiring managers look for specific systems, the size of the environment and certifications, not generic "computer skills." Here’s how to make that visible, with a full example CV at the end.',
    sections: [
      {
        heading: 'What an IT hiring manager looks for first',
        paragraphs: [
          'In the first scan a hiring manager looks for four things: how big an environment you supported, at what level (first, second or third line), which systems and tools you used, and what changed because you were there. If those show up in the first three lines of your latest role, your CV is already ahead of most.',
        ],
      },
      {
        heading: 'An experience bullet that shows a metric',
        examplePair: {
          weakLabel: 'Weak',
          weak: '"Responsible for maintaining company IT infrastructure and helping employees with computer issues."',
          strongLabel: 'Strong',
          strong: '"Reduced average helpdesk ticket resolution time from 48 hours to 6 hours by rebuilding the internal knowledge base and automating password-reset requests."',
        },
        paragraphsAfter: [
          'The same pattern works across IT roles:',
        ],
        list: [
          'Systems administration. Weak: "Maintained servers." Strong: "Ran 40 Windows and Linux servers at 99.9% availability and automated monthly patching, saving about 10 hours of work a month."',
          'Networking. Weak: "Looked after the company network." Strong: "Rebuilt the network and VPN for three offices; tickets caused by network outages fell by about 70%."',
          'Service desk. Weak: "Helped users with their problems." Strong: "Handled about 40 tickets a day at a 92% first-contact resolution rate."',
        ],
      },
      {
        heading: 'Describe your environment in numbers',
        paragraphs: [
          'The same job title can mean an environment of 20 users or 2,000. Give the size, and a reader sees straight away what kind of work you’re used to:',
        ],
        list: [
          'users ("900 users across three offices")',
          'devices and servers ("450 laptops, 40 servers")',
          'ticket volumes and targets ("about 40 tickets a day, 8-hour SLA")',
          'availability or outages ("99.9% availability", "no unplanned outages in 2024")',
        ],
      },
      {
        heading: 'Name the level when titles vary',
        paragraphs: [
          'IT titles mean different things at different companies: "IT support" can be phone support or server administration. Add the level in brackets after the title, like "IT Support Specialist (2nd line)", so a recruiter doesn’t have to guess. If you moved up a level with the same employer, list the roles separately so the progression shows.',
        ],
      },
      {
        heading: 'Certifications belong in their own section, named precisely',
        paragraphs: [
          'CompTIA A+/Network+/Security+, Cisco CCNA, Microsoft certifications: give each its exact name, issuer and year in a section of its own. PortifyCV’s Certificates section has fields for issuer, year and expiry date, so validity shows directly. Many IT certifications expire, and recruiters check.',
        ],
      },
      {
        heading: 'Skills that read as IT, not office skills',
        paragraphs: [
          'Group skills by area so a reader finds theirs quickly:',
        ],
        list: [
          'Systems: Active Directory, Microsoft 365, Windows Server, Linux',
          'Device management: Intune, SCCM, Jamf',
          'Networking: TCP/IP, DNS, DHCP, VPN, firewalls',
          'Tools and process: ServiceNow, Jira, ITIL',
          'Virtualization and cloud: VMware, Hyper-V, Azure',
        ],
        paragraphsAfter: [
          '"Microsoft Office" doesn’t stand out. "Active Directory user management across a 500-seat environment" does.',
        ],
      },
      {
        heading: 'Show automation and documentation',
        paragraphs: [
          'The strongest IT candidates don’t just fix the same fault again; they stop it happening. If you wrote a script that removed repetitive work, or a guide that cut down questions, say so with a number: "PowerShell script for new-starter accounts removed about 35 tickets a week." A line like that says more than a long list of tools.',
        ],
      },
      {
        heading: 'Early in your career: a home lab and projects',
        paragraphs: [
          'With little work experience, a test environment of your own is good evidence: a domain built on virtual machines, VLANs on your home network, or a small script that handles an everyday task. Put them in the Projects section the way you’d describe a job: what you built, with what, and what you learned or what improved.',
        ],
      },
      {
        heading: 'IT applications go through an ATS more often than most',
        paragraphs: [
          'Larger companies screen IT applications automatically especially often, so a single-column layout with clear section headings pays off more here than in most fields.',
        ],
        linkParagraphs: [
          {
            before: 'Read the ',
            linkText: 'ATS-friendly CV guide',
            linkTo: ROUTES.atsGuide,
            view: 'atsGuide',
            after: ' and check your own CV before you apply.',
          },
        ],
      },
    ],
    ctaLabel: 'Start building your CV',
    ctaNote: 'No login. Nothing saved until you export.',
    fullExamples: {
      heading: 'A full IT support specialist CV',
      intro: 'The same example person in two templates: six years on service desks, the environment in numbers, automation and certificates with their expiry dates. "Use this example" loads it into the builder to edit.',
    },
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
    >
      <div className="guide__section">
        <h2>{copy.fullExamples.heading}</h2>
        <p>{copy.fullExamples.intro}</p>
        <ExampleCvLinks examples={CONTENT_PAGE_EXAMPLES.itCv} locale={locale} onNavigateToView={onNavigateToView} />
      </div>
    </GuideLayout>
  )
}

export default ItCvExamplesPage
