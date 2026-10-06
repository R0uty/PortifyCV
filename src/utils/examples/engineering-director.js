import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: executive, techExec.
const shared = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '0123456789',
  links: {
    github: 'https://github.example.com/john-doe',
    linkedin: 'https://linkedin.example.com/in/john-doe',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Engineering Director',
  location: 'Joensuu, Finland',
  about:
    'Engineering director with 15 years in software, the last 7 leading a 60-engineer organization across 7 teams. I care about predictable delivery and engineers who can explain what they shipped and why it mattered.',
  skills: ['Engineering leadership', 'Org design', 'Cloud architecture (AWS)', 'Hiring & mentoring', 'Agile delivery', 'Budget planning', 'Cross-functional strategy', 'Technical due diligence'],
  experience: [
    {
      role: 'Engineering Director',
      company: 'Example Oy',
      location: 'Joensuu, Finland',
      employmentType: 'Full-time',
      startDate: 'Jan 2019',
      endDate: '',
      isCurrent: true,
      description: 'Lead 7 product engineering teams (60 engineers) building a logistics SaaS platform.',
      achievements: [
        'Grew the engineering org from 22 to 60 while holding voluntary attrition under 8% a year, against an industry average of 17%.',
        'Cut release cycle time from 6 weeks to 2 by moving all teams to trunk-based development with feature flags.',
        'Reduced cloud infrastructure spend by 31% (about 740,000 EUR a year) through a right-sizing and reserved-capacity program.',
      ],
      technologies: [],
    },
    {
      role: 'Engineering Manager',
      company: 'Example Oy',
      location: 'Joensuu, Finland',
      employmentType: 'Full-time',
      startDate: 'Mar 2014',
      endDate: 'Dec 2018',
      isCurrent: false,
      description: 'Managed 3 backend teams (18 engineers) for an industrial IoT platform.',
      achievements: [
        'Led the migration from a monolith to 12 services, cutting the average deploy time from 40 minutes to 6.',
        'Built the first on-call rotation and incident process, cutting mean time to resolution from 4 hours to 45 minutes.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'M.Sc. Computer Science',
      location: 'Joensuu, Finland',
      startDate: '2004',
      endDate: '2009',
      honors: '',
      coursework: 'Distributed systems, Software architecture, Organizational behavior',
      grade: '',
    },
  ],
  leadership: [
    {
      role: 'Advisory Board Member',
      organization: 'Example Oy',
      description: 'Advise early-stage founders on building and scaling engineering teams.',
      startDate: '2022',
      endDate: '',
    },
  ],
  projects: [
    {
      name: 'Trunk-based development rollout',
      description: 'Led the move of 7 teams from long-lived feature branches to trunk-based development with feature flags.',
      stack: 'AWS, feature flags',
      githubUrl: '',
      demoUrl: '',
      organization: 'Example Oy',
      impact: 'Release cycle time cut from 6 weeks to 2.',
      date: '2021',
      teamSize: '60',
      contribution: 'Executive sponsor; set the rollout plan and training.',
      image: '',
    },
  ],
  achievements: [
    { title: 'Speaker, Example Conference', description: 'Talk: "Scaling an engineering org without scaling attrition".', year: '2023' },
  ],
  certificates: [
    { name: 'Certified Solutions Architect – Professional', issuer: 'Example Oy', year: '2020', credentialUrl: '', expiry: '2026' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Kehitysjohtaja',
  location: 'Joensuu',
  about:
    'Kehitysjohtaja, jolla on 15 vuoden kokemus ohjelmistoalalta, viimeiset 7 vuotta 60 insinöörin organisaation johtamisesta seitsemässä tiimissä. Minulle tärkeintä on ennustettava toimituskyky ja insinöörit, jotka osaavat kertoa mitä toimittivat ja miksi se oli tärkeää.',
  skills: ['Teknologiajohtaminen', 'Organisaatiosuunnittelu', 'Pilviarkkitehtuuri (AWS)', 'Rekrytointi ja mentoroin', 'Agile-toimitus', 'Budjettisuunnittelu', 'Monialainen strategia', 'Tekninen due diligence'],
  experience: [
    {
      role: 'Kehitysjohtaja',
      company: 'Example Oy',
      location: 'Joensuu',
      employmentType: 'Full-time',
      startDate: '01/2019',
      endDate: '',
      isCurrent: true,
      description: 'Johdan 7 tuotekehitystiimiä (60 insinööriä), jotka rakentavat logistiikka-SaaS-alustaa.',
      achievements: [
        'Kasvatin kehitysorganisaation 22:sta 60:een pitäen vapaaehtoisen vaihtuvuuden alle 8 %:ssa vuodessa, kun alan keskiarvo on 17 %.',
        'Lyhensin julkaisusyklin 6 viikosta 2 viikkoon siirtämällä kaikki tiimit trunk-based-kehitykseen feature flageilla.',
        'Vähensin pilvi-infran kustannuksia 31 % (noin 740 000 euroa vuodessa) oikeankokoistamis- ja varauskapasiteettiohjelmalla.',
      ],
      technologies: [],
    },
    {
      role: 'Kehityspäällikkö',
      company: 'Example Oy',
      location: 'Joensuu',
      employmentType: 'Full-time',
      startDate: '03/2014',
      endDate: '12/2018',
      isCurrent: false,
      description: 'Johdin 3 backend-tiimiä (18 insinööriä) teolliselle IoT-alustalle.',
      achievements: [
        'Johdin siirtymisen monoliitista 12 palveluun, lyhentäen keskimääräisen julkaisuajan 40 minuutista 6 minuuttiin.',
        'Rakensin ensimmäisen päivystyskierron ja häiriöprosessin, lyhentäen keskimääräisen ratkaisuajan 4 tunnista 45 minuuttiin.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'Filosofian maisteri, tietojenkäsittelytiede',
      location: 'Joensuu',
      startDate: '2004',
      endDate: '2009',
      honors: '',
      coursework: 'Hajautetut järjestelmät, ohjelmistoarkkitehtuuri, organisaatiopsykologia',
      grade: '',
    },
  ],
  leadership: [
    {
      role: 'Neuvonantaja',
      organization: 'Example Oy',
      description: 'Neuvon alkuvaiheen yrittäjiä kehitystiimien rakentamisessa ja skaalauksessa.',
      startDate: '2022',
      endDate: '',
    },
  ],
  projects: [
    {
      name: 'Trunk-based-kehityksen käyttöönotto',
      description: 'Johdin 7 tiimin siirtymisen pitkäikäisistä feature-branchista trunk-based-kehitykseen feature flageilla.',
      stack: 'AWS, feature flagit',
      githubUrl: '',
      demoUrl: '',
      organization: 'Example Oy',
      impact: 'Julkaisusykli lyheni 6 viikosta 2 viikkoon.',
      date: '2021',
      teamSize: '60',
      contribution: 'Johdon sponsori; laadin käyttöönottosuunnitelman ja koulutuksen.',
      image: '',
    },
  ],
  achievements: [
    { title: 'Puhuja, Example Conference', description: 'Esitys: "Kehitysorganisaation kasvattaminen vaihtuvuutta kasvattamatta".', year: '2023' },
  ],
  certificates: [
    { name: 'Certified Solutions Architect – Professional', issuer: 'Example Oy', year: '2020', credentialUrl: '', expiry: '2026' },
  ],
})

export default { en, fi }
