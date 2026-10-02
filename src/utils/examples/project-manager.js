import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: modern, timeline.
const shared = {
  fullName: 'Juha Rantanen',
  email: 'juha.rantanen@example.com',
  phone: '+358 40 000 1801',
  links: {
    linkedin: 'https://linkedin.com/in/example-jrantanen',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Project Manager',
  location: 'Kuopio, Finland',
  about:
    'Project manager with 11 years of delivering construction and logistics projects on budget and on schedule. I run weekly risk reviews so surprises surface in week one, not month three.',
  skills: ['Project planning', 'Risk management', 'Budgeting & cost control', 'Stakeholder management', 'Agile & Waterfall methods', 'Contract negotiation', 'MS Project', 'Resource planning'],
  experience: [
    {
      role: 'Senior Project Manager',
      company: 'Savolinna Construction',
      location: 'Kuopio, Finland',
      employmentType: 'Full-time',
      startDate: 'Mar 2019',
      endDate: '',
      isCurrent: true,
      description: 'Manage a portfolio of commercial construction projects across central Finland.',
      achievements: [
        'Delivered 12 commercial construction projects worth a combined 38 million EUR, all within 5% of original budget.',
        'Cut average project delay from 6 weeks to 9 days by introducing weekly risk reviews across 4 site teams.',
        'Managed vendor contracts worth 9 million EUR annually across 20+ subcontractors.',
      ],
      technologies: [],
    },
    {
      role: 'Project Manager',
      company: 'Pohjanmaa Logistics',
      location: 'Vaasa, Finland',
      employmentType: 'Full-time',
      startDate: 'Jan 2015',
      endDate: 'Feb 2019',
      isCurrent: false,
      description: 'Managed infrastructure and systems rollouts across the company’s distribution network.',
      achievements: [
        'Led the rollout of a new warehouse management system across 3 distribution centers, on schedule.',
        'Reduced average shipment processing time by 22% by redesigning the intake workflow.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Savonia University of Applied Sciences',
      degree: 'B.Eng. Construction Management',
      location: 'Kuopio, Finland',
      startDate: '2011',
      endDate: '2015',
      honors: '',
      coursework: 'Project scheduling, Cost estimation, Contract law',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Kuopio Logistics Hub expansion',
      description: 'Led planning and delivery of a 14,000 m² warehouse expansion, coordinating 6 subcontractors.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Delivered 3 weeks ahead of schedule, 1.2 million EUR under budget.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'WMS rollout program',
      description: 'Oversaw rollout of a new warehouse management system across 3 distribution centers.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Shipment processing time cut by 22%.',
      date: '2018',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  achievements: [
    { title: 'PMI Project of the Year (regional nominee)', description: 'Nominated for the Kuopio Logistics Hub expansion.', year: '2023' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Swedish', level: 'Intermediate' },
  ],
  certificates: [
    { name: 'PMP – Project Management Professional', issuer: 'Project Management Institute', year: '2020', credentialUrl: '', expiry: '2026' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Projektipäällikkö',
  location: 'Kuopio',
  about:
    'Projektipäällikkö, jolla on 11 vuoden kokemus rakennus- ja logistiikkaprojektien toimittamisesta budjetissa ja aikataulussa. Pidän viikoittaiset riskikatsaukset, jotta yllätykset näkyvät ensimmäisellä viikolla, ei kolmannessa kuukaudessa.',
  skills: ['Projektisuunnittelu', 'Riskienhallinta', 'Budjetointi ja kustannusten hallinta', 'Sidosryhmien johtaminen', 'Agile- ja vesiputousmenetelmät', 'Sopimusneuvottelut', 'MS Project', 'Resurssisuunnittelu'],
  experience: [
    {
      role: 'Senior projektipäällikkö',
      company: 'Savolinna Construction',
      location: 'Kuopio',
      employmentType: 'Full-time',
      startDate: '03/2019',
      endDate: '',
      isCurrent: true,
      description: 'Johdan Keski-Suomen alueen rakennusprojektisalkkua.',
      achievements: [
        'Toimitin 12 rakennusprojektia, yhteisarvoltaan 38 miljoonaa euroa, kaikki alkuperäisen budjetin 5 %:n sisällä.',
        'Lyhensin projektien keskimääräisen viiveen 6 viikosta 9 päivään ottamalla käyttöön viikoittaiset riskikatsaukset 4 työmaatiimissä.',
        'Vastasin vuosittain 9 miljoonan euron alihankintasopimuksista yli 20 alihankkijan kanssa.',
      ],
      technologies: [],
    },
    {
      role: 'Projektipäällikkö',
      company: 'Pohjanmaa Logistics',
      location: 'Vaasa',
      employmentType: 'Full-time',
      startDate: '01/2015',
      endDate: '02/2019',
      isCurrent: false,
      description: 'Johdin infrastruktuuri- ja järjestelmäprojekteja yrityksen jakeluverkostossa.',
      achievements: [
        'Johdin uuden varastonhallintajärjestelmän käyttöönoton 3 jakelukeskuksessa aikataulussa.',
        'Lyhensin keskimääräistä lähetysten käsittelyaikaa 22 % uudistamalla vastaanottoprosessin.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Savonia-ammattikorkeakoulu',
      degree: 'Insinööri (AMK), rakennustuotanto',
      location: 'Kuopio',
      startDate: '2011',
      endDate: '2015',
      honors: '',
      coursework: 'Projektien aikataulutus, kustannusarviointi, sopimusoikeus',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Kuopion logistiikkakeskuksen laajennus',
      description: 'Johdin 14 000 m² varastolaajennuksen suunnittelua ja toimitusta, koordinoiden 6 alihankkijaa.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Toimitettiin 3 viikkoa etuajassa, 1,2 miljoonaa euroa alle budjetin.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Varastonhallintajärjestelmän käyttöönotto-ohjelma',
      description: 'Vastasin uuden varastonhallintajärjestelmän käyttöönotosta 3 jakelukeskuksessa.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Lähetysten käsittelyaika lyheni 22 %.',
      date: '2018',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  achievements: [
    { title: 'PMI Vuoden projekti (alueellinen ehdokas)', description: 'Ehdokkaana Kuopion logistiikkakeskuksen laajennuksesta.', year: '2023' },
  ],
  languages: [
    { language: 'Suomi', level: 'Äidinkieli' },
    { language: 'Englanti', level: 'Sujuva' },
    { language: 'Ruotsi', level: 'Keskitaso' },
  ],
  certificates: [
    { name: 'PMP – Project Management Professional', issuer: 'Project Management Institute', year: '2020', credentialUrl: '', expiry: '2026' },
  ],
})

export default { en, fi }
