import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: modernOrange, colorfulCompact.
const shared = {
  fullName: 'Emilia Rautio',
  email: 'emilia.rautio@example.com',
  phone: '+358 40 000 2507',
  links: {
    linkedin: 'https://linkedin.com/in/example-erautio',
    website: 'https://erautio.example.com',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Customer Success Manager',
  location: 'Kerava, Finland',
  about:
    'Customer success manager with 8 years retaining and growing B2B SaaS accounts. I turn onboarding into a repeatable playbook, read churn risk before it shows up in the numbers, and get support, product, and sales pointed at the same renewal.',
  skills: [
    'Customer onboarding', 'Churn analysis', 'Renewal negotiation', 'Account expansion',
    'Salesforce', 'Zendesk', 'Voice-of-customer programs', 'Cross-functional collaboration',
  ],
  experience: [
    {
      role: 'Customer Success Manager',
      company: 'Pilvikumpu Oy',
      location: 'Kerava, Finland',
      employmentType: 'Full-time',
      startDate: 'Jun 2021',
      endDate: '',
      isCurrent: true,
      description: 'Own a portfolio of 60 mid-market SaaS accounts worth 3.4 million EUR in annual recurring revenue.',
      achievements: [
        'Cut annual churn in my portfolio from 14% to 6% by rebuilding the onboarding playbook around a 30-60-90 day plan.',
        'Grew net revenue retention to 118% through upsell and expansion conversations tied to usage data.',
        'Built a health-score dashboard that flags at-risk accounts 6 weeks before renewal, now used by 8 other CSMs.',
      ],
      technologies: [],
    },
    {
      role: 'Customer Success Specialist',
      company: 'Kajala Software',
      location: 'Helsinki, Finland',
      employmentType: 'Full-time',
      startDate: 'Jan 2018',
      endDate: 'May 2021',
      isCurrent: false,
      description: 'Managed onboarding and support for 150+ small-business customers.',
      achievements: [
        'Shortened time-to-first-value from 21 days to 9 days by redesigning the onboarding email sequence.',
        'Maintained a 96% customer satisfaction score across more than 2,000 support tickets.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Haaga-Helia University of Applied Sciences',
      degree: 'B.B.A. International Business',
      location: 'Helsinki, Finland',
      startDate: '2014',
      endDate: '2017',
      honors: '',
      coursework: 'Customer relationship management, Service design, B2B marketing',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Customer health-score dashboard',
      description: 'A scoring model combining product usage, support ticket volume, and NPS to flag renewal risk early.',
      stack: 'Looker, Salesforce, SQL',
      githubUrl: '',
      demoUrl: '',
      organization: 'Pilvikumpu Oy',
      impact: 'Adopted by 8 CSMs; flags risk 6 weeks before renewal on average.',
      date: '2023',
      teamSize: '3',
      contribution: 'Designed the scoring model and built the dashboard.',
      image: '',
    },
    {
      name: 'Onboarding playbook redesign',
      description: 'Rebuilt the new-customer onboarding process into a structured 30-60-90 day plan with clear milestones.',
      stack: 'Notion, Zendesk',
      githubUrl: '',
      demoUrl: '',
      organization: 'Pilvikumpu Oy',
      impact: 'Cut portfolio churn from 14% to 6% within a year.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'Certified Customer Success Manager (CCSM)', issuer: 'SuccessCOACHING', year: '2021', credentialUrl: '', expiry: '' },
    { name: 'HubSpot Customer Success Certification', issuer: 'HubSpot Academy', year: '2019', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Swedish', level: 'Intermediate' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Asiakkuuspäällikkö',
  location: 'Kerava',
  about:
    'Asiakkuuspäällikkö, jolla on 8 vuoden kokemus B2B SaaS -asiakkuuksien säilyttämisestä ja kasvattamisesta. Rakennan käyttöönotosta toistettavan mallin, huomaan irtisanomisriskin ennen kuin se näkyy luvuissa ja saan tuen, tuotteen ja myynnin tähtäämään samaan jatkoon.',
  skills: [
    'Asiakkaan käyttöönotto', 'Churn-analyysi', 'Sopimusten uusintaneuvottelut', 'Asiakkuuksien kasvattaminen',
    'Salesforce', 'Zendesk', 'Asiakaspalauteohjelmat', 'Toimintojen välinen yhteistyö',
  ],
  experience: [
    {
      role: 'Asiakkuuspäällikkö',
      company: 'Pilvikumpu Oy',
      location: 'Kerava',
      employmentType: 'Full-time',
      startDate: '06/2021',
      endDate: '',
      isCurrent: true,
      description: 'Vastaan 60 keskisuuren SaaS-asiakkuuden salkusta, jonka vuosittainen toistuva liikevaihto on 3,4 miljoonaa euroa.',
      achievements: [
        'Laskin salkkuni vuosittaisen asiakaspoistuman 14 %:sta 6 %:iin uudistamalla käyttöönottomallin 30-60-90 päivän suunnitelmaksi.',
        'Nostin nettoliikevaihdon pysyvyyden 118 %:iin lisämyynti- ja laajennuskeskusteluilla, jotka perustuivat käyttödataan.',
        'Rakensin asiakasterveyspisteytyksen, joka havaitsee riskiasiakkaat keskimäärin 6 viikkoa ennen sopimuksen uusintaa; käytössä 8 muulla asiakkuuspäälliköllä.',
      ],
      technologies: [],
    },
    {
      role: 'Asiakkuusasiantuntija',
      company: 'Kajala Software',
      location: 'Helsinki',
      employmentType: 'Full-time',
      startDate: '01/2018',
      endDate: '05/2021',
      isCurrent: false,
      description: 'Vastasin yli 150 pienyritysasiakkaan käyttöönotosta ja tuesta.',
      achievements: [
        'Lyhensin ensimmäisen hyödyn saamiseen kuluvan ajan 21 päivästä 9 päivään uudistamalla käyttöönoton sähköpostisarjan.',
        'Pidin asiakastyytyväisyyden 96 %:ssa yli 2 000 tukipyynnön yli.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Haaga-Helia ammattikorkeakoulu',
      degree: 'Tradenomi, kansainvälinen liiketoiminta',
      location: 'Helsinki',
      startDate: '2014',
      endDate: '2017',
      honors: '',
      coursework: 'Asiakkuudenhallinta, palvelumuotoilu, B2B-markkinointi',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Asiakasterveyspisteytys',
      description: 'Pisteytysmalli, joka yhdistää tuotteen käytön, tukipyyntömäärän ja NPS:n havaitakseen uusintariskin ajoissa.',
      stack: 'Looker, Salesforce, SQL',
      githubUrl: '',
      demoUrl: '',
      organization: 'Pilvikumpu Oy',
      impact: 'Käytössä 8 asiakkuuspäälliköllä; havaitsee riskin keskimäärin 6 viikkoa etukäteen.',
      date: '2023',
      teamSize: '3',
      contribution: 'Suunnittelin pisteytysmallin ja rakensin näkymän.',
      image: '',
    },
    {
      name: 'Käyttöönottomallin uudistus',
      description: 'Uudistin uuden asiakkaan käyttöönottoprosessin selkeäksi 30-60-90 päivän suunnitelmaksi.',
      stack: 'Notion, Zendesk',
      githubUrl: '',
      demoUrl: '',
      organization: 'Pilvikumpu Oy',
      impact: 'Laski salkun asiakaspoistuman 14 %:sta 6 %:iin vuodessa.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'Certified Customer Success Manager (CCSM)', issuer: 'SuccessCOACHING', year: '2021', credentialUrl: '', expiry: '' },
    { name: 'HubSpot Customer Success Certification', issuer: 'HubSpot Academy', year: '2019', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Swedish', level: 'Intermediate' },
  ],
})

export default { en, fi }
