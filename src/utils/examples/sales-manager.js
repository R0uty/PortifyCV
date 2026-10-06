import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: navyProfessional, quadrant.
const shared = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '0123456789',
  links: {
    linkedin: 'https://linkedin.example.com/in/john-doe',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Sales Manager',
  location: 'Kokkola, Finland',
  about:
    'B2B sales manager with 12 years growing recurring revenue and leading sales teams. I build pipelines that forecast accurately and reps who hit quota without burning out.',
  skills: [
    'B2B sales', 'Sales leadership', 'CRM (Salesforce, HubSpot)', 'Negotiation',
    'Forecasting & pipeline management', 'Key account management', 'Channel partnerships', 'Sales coaching',
  ],
  experience: [
    {
      role: 'Sales Manager',
      company: 'Example Oy',
      location: 'Kokkola, Finland',
      employmentType: 'Full-time',
      startDate: 'Apr 2019',
      endDate: '',
      isCurrent: true,
      description: 'Lead a 12-person B2B sales team across the Nordic region.',
      achievements: [
        'Grew annual recurring revenue from 4.2 million to 9.8 million EUR over 5 years.',
        'Exceeded quarterly sales targets in 16 of the last 20 quarters, averaging 112% of quota.',
        'Built a new partner-channel program that now generates 25% of total new business.',
      ],
      technologies: [],
    },
    {
      role: 'Senior Account Executive',
      company: 'Example Oy',
      location: 'Kokkola, Finland',
      employmentType: 'Full-time',
      startDate: 'Feb 2014',
      endDate: 'Mar 2019',
      isCurrent: false,
      description: 'Managed a growing territory of mid-market distribution accounts.',
      achievements: [
        'Closed the company\'s largest-ever single contract at 1.1 million EUR, a 60% increase over the prior record.',
        'Grew a 40-account territory to 95 accounts, increasing territory revenue by 85%.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'B.B.A. International Business',
      location: 'Kokkola, Finland',
      startDate: '2010',
      endDate: '2014',
      honors: '',
      coursework: 'Sales management, International trade, Marketing',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Partner channel program launch',
      description: 'Designed and launched a reseller partner program to open a second revenue channel alongside direct sales.',
      stack: 'Salesforce',
      githubUrl: '',
      demoUrl: '',
      organization: 'Example Oy',
      impact: 'Now generates 25% of total new business.',
      date: '2022',
      teamSize: '4',
      contribution: 'Led the program design and partner onboarding.',
      image: '',
    },
    {
      name: 'CRM migration to HubSpot',
      description: 'Migrated the sales team from spreadsheets to HubSpot CRM and built the reporting dashboards.',
      stack: 'HubSpot',
      githubUrl: '',
      demoUrl: '',
      organization: 'Example Oy',
      impact: 'Forecast accuracy improved; adopted by all 12 reps within 6 weeks.',
      date: '2021',
      teamSize: '12',
      contribution: 'Owned the migration plan and rep training.',
      image: '',
    },
  ],
  certificates: [
    { name: 'Strategic Selling Certification', issuer: 'Example Oy', year: '2018', credentialUrl: '', expiry: '' },
    { name: 'Sales Software Certification', issuer: 'Example Oy', year: '2021', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Swedish', level: 'Intermediate' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Myyntipäällikkö',
  location: 'Kokkola',
  about:
    'B2B-myyntipäällikkö, jolla on 12 vuoden kokemus toistuvan liikevaihdon kasvattamisesta ja myyntitiimien johtamisesta. Rakennan myyntiputkia, jotka ennustavat tarkasti, ja myyjiä, jotka saavuttavat tavoitteensa uupumatta.',
  skills: [
    'B2B-myynti', 'Myynnin johtaminen', 'CRM (Salesforce, HubSpot)', 'Neuvottelutaidot',
    'Ennustaminen ja myyntiputken hallinta', 'Avainasiakashallinta', 'Kanavakumppanuudet', 'Myynnin valmennus',
  ],
  experience: [
    {
      role: 'Myyntipäällikkö',
      company: 'Example Oy',
      location: 'Kokkola',
      employmentType: 'Full-time',
      startDate: '04/2019',
      endDate: '',
      isCurrent: true,
      description: 'Johdan 12 hengen B2B-myyntitiimiä Pohjoismaiden alueella.',
      achievements: [
        'Kasvatin toistuvaa vuosittaista liikevaihtoa 4,2 miljoonasta 9,8 miljoonaan euroon 5 vuodessa.',
        'Ylitin kvartaalimyyntitavoitteet 16 kertaa viimeisten 20 kvartaalin aikana, keskimäärin 112 % tavoitteesta.',
        'Rakensin uuden kumppanikanavaohjelman, joka tuottaa nyt 25 % kaikesta uudesta liiketoiminnasta.',
      ],
      technologies: [],
    },
    {
      role: 'Senior-asiakasvastaava',
      company: 'Example Oy',
      location: 'Kokkola',
      employmentType: 'Full-time',
      startDate: '02/2014',
      endDate: '03/2019',
      isCurrent: false,
      description: 'Vastasin kasvavasta keskikokoisten jakeluasiakkaiden alueesta.',
      achievements: [
        'Solmin yrityksen suurimman yksittäisen sopimuksen, 1,1 miljoonaa euroa, 60 % edellistä ennätystä suuremman.',
        'Kasvatin 40 asiakkaan alueen 95 asiakkaaseen, nostaen alueen liikevaihtoa 85 %.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'Tradenomi (AMK), kansainvälinen kauppa',
      location: 'Kokkola',
      startDate: '2010',
      endDate: '2014',
      honors: '',
      coursework: 'Myynnin johtaminen, kansainvälinen kauppa, markkinointi',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Kumppanikanavaohjelman käynnistys',
      description: 'Suunnittelin ja käynnistin jälleenmyyjäkumppaniohjelman avatakseni toisen myyntikanavan suoramyynnin rinnalle.',
      stack: 'Salesforce',
      githubUrl: '',
      demoUrl: '',
      organization: 'Example Oy',
      impact: 'Tuottaa nyt 25 % kaikesta uudesta liiketoiminnasta.',
      date: '2022',
      teamSize: '4',
      contribution: 'Vedin ohjelman suunnittelun ja kumppanien perehdytyksen.',
      image: '',
    },
    {
      name: 'CRM-siirtyminen HubSpotiin',
      description: 'Siirsin myyntitiimin taulukkolaskelmista HubSpot CRM:ään ja rakensin raportointinäkymät.',
      stack: 'HubSpot',
      githubUrl: '',
      demoUrl: '',
      organization: 'Example Oy',
      impact: 'Ennustetarkkuus parani; käyttöön otti kaikki 12 myyjää 6 viikossa.',
      date: '2021',
      teamSize: '12',
      contribution: 'Vastasin siirtymäsuunnitelmasta ja myyjien koulutuksesta.',
      image: '',
    },
  ],
  certificates: [
    { name: 'Strategisen myynnin sertifikaatti', issuer: 'Example Oy', year: '2018', credentialUrl: '', expiry: '' },
    { name: 'Myyntiohjelmistojen sertifikaatti', issuer: 'Example Oy', year: '2021', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Suomi', level: 'Äidinkieli' },
    { language: 'Englanti', level: 'Sujuva' },
    { language: 'Ruotsi', level: 'Keskitaso' },
  ],
})

export default { en, fi }
