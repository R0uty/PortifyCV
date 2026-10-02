import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: portrait.
const shared = {
  fullName: 'Saara Vainio',
  email: 'saara.vainio@example.com',
  phone: '+358 40 000 2511',
  links: {
    portfolio: 'https://vainio.example.com',
    behance: 'https://behance.net/example-svainio',
    linkedin: 'https://linkedin.com/in/example-svainio',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Architect',
  location: 'Rauma, Finland',
  about:
    'Architect with 9 years designing residential and public buildings, from concept sketch through building-permit drawings. I care about buildings that work for the people using them 20 years from now, not just the rendering.',
  skills: [
    'Building Information Modeling (BIM)', 'Revit', 'AutoCAD', 'Sustainable design',
    'Urban planning', 'Construction documentation', 'Client presentations', 'Permit applications',
  ],
  experience: [
    {
      role: 'Architect',
      company: 'Kaarisilta Architects',
      location: 'Rauma, Finland',
      employmentType: 'Full-time',
      startDate: 'May 2019',
      endDate: '',
      isCurrent: true,
      description: 'Lead design on residential and public-building projects from concept through construction documentation.',
      achievements: [
        'Led design of a 42-unit waterfront housing development, delivered 8% under the client\'s construction budget.',
        'Cut permit-approval time from an average of 9 months to 5 months by restructuring the drawing package to match the municipality\'s review checklist.',
        'Designed a community library renovation that increased daily visitor count by 55% after reopening.',
      ],
      technologies: [],
    },
    {
      role: 'Junior Architect',
      company: 'Rantakivi Design Studio',
      location: 'Turku, Finland',
      employmentType: 'Full-time',
      startDate: 'Aug 2015',
      endDate: 'Apr 2019',
      isCurrent: false,
      description: 'Supported senior architects on residential and small commercial projects.',
      achievements: [
        'Produced construction documentation for 14 completed residential projects.',
        'Built a reusable detail library that cut drawing-production time by 20% across the studio.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Aalto University',
      degree: 'M.Sc. (Architecture)',
      location: 'Espoo, Finland',
      startDate: '2010',
      endDate: '2015',
      honors: '',
      coursework: 'Urban design, Structural systems, Sustainable building design',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Rauma waterfront housing development',
      description: '42-unit residential development on a former industrial waterfront site, with shared courtyard and public shoreline access.',
      stack: 'Revit, Rhino',
      githubUrl: '',
      demoUrl: '',
      organization: 'Kaarisilta Architects',
      impact: 'Delivered 8% under budget; sold out within 4 months of completion.',
      date: '2023',
      teamSize: '6',
      contribution: 'Led design development and coordinated structural and MEP consultants.',
      image: '',
    },
    {
      name: 'Community library renovation',
      description: 'Renovation and extension of a 1970s public library to improve accessibility and add a children\'s wing.',
      stack: 'AutoCAD, Revit',
      githubUrl: '',
      demoUrl: '',
      organization: 'Kaarisilta Architects',
      impact: 'Daily visitor count rose 55% after reopening.',
      date: '2021',
      teamSize: '4',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'LEED Green Associate', issuer: 'U.S. Green Building Council', year: '2020', credentialUrl: '', expiry: '' },
    { name: 'Qualified Principal Designer (pääsuunnittelija)', issuer: 'Finnish Association of Architects (SAFA)', year: '2019', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Swedish', level: 'Intermediate' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Arkkitehti',
  location: 'Rauma',
  about:
    'Arkkitehti, jolla on 9 vuoden kokemus asuin- ja julkisten rakennusten suunnittelusta konseptiluonnoksesta rakennuslupakuviin. Minulle tärkeintä on, että rakennus toimii käyttäjilleen 20 vuoden kuluttua, ei vain havainnekuvassa.',
  skills: [
    'Tietomallinnus (BIM)', 'Revit', 'AutoCAD', 'Kestävä suunnittelu',
    'Kaupunkisuunnittelu', 'Rakennuslupa-asiakirjat', 'Asiakasesitykset', 'Lupahakemukset',
  ],
  experience: [
    {
      role: 'Arkkitehti',
      company: 'Kaarisilta Architects',
      location: 'Rauma',
      employmentType: 'Full-time',
      startDate: '05/2019',
      endDate: '',
      isCurrent: true,
      description: 'Johdan asuin- ja julkisten rakennusten suunnittelua konseptista rakennuslupa-asiakirjoihin.',
      achievements: [
        'Johdin 42 asunnon rantahankkeen suunnittelua, joka valmistui 8 % asiakkaan rakennusbudjetin alle.',
        'Lyhensin lupaprosessin keskimääräisen keston 9 kuukaudesta 5 kuukauteen järjestämällä piirustuspaketin vastaamaan kunnan tarkastuslistaa.',
        'Suunnittelin kirjaston peruskorjauksen, joka nosti päivittäistä kävijämäärää 55 % uudelleenavauksen jälkeen.',
      ],
      technologies: [],
    },
    {
      role: 'Nuorempi arkkitehti',
      company: 'Rantakivi Design Studio',
      location: 'Turku',
      employmentType: 'Full-time',
      startDate: '08/2015',
      endDate: '04/2019',
      isCurrent: false,
      description: 'Avustin vanhempia arkkitehtejä asuin- ja pienissä liikerakennushankkeissa.',
      achievements: [
        'Tuotin rakennuslupa-asiakirjat 14 valmistuneeseen asuinrakennushankkeeseen.',
        'Rakensin uudelleenkäytettävän detaljikirjaston, joka lyhensi piirustustuotantoa 20 % koko toimistossa.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Aalto-yliopisto',
      degree: 'Arkkitehti',
      location: 'Espoo',
      startDate: '2010',
      endDate: '2015',
      honors: '',
      coursework: 'Kaupunkisuunnittelu, rakennejärjestelmät, kestävä rakennussuunnittelu',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Rauman rantahanke',
      description: '42 asunnon rakennushanke entiselle teollisuustontille rannassa, yhteispiha ja julkinen rantapääsy.',
      stack: 'Revit, Rhino',
      githubUrl: '',
      demoUrl: '',
      organization: 'Kaarisilta Architects',
      impact: 'Valmistui 8 % budjetin alle; myytiin loppuun 4 kuukaudessa valmistumisesta.',
      date: '2023',
      teamSize: '6',
      contribution: 'Johdin suunnittelun kehitystä ja koordinoin rakenne- ja talotekniikkakonsultit.',
      image: '',
    },
    {
      name: 'Kirjaston peruskorjaus',
      description: '1970-luvun kirjaston peruskorjaus ja laajennus, joka paransi esteettömyyttä ja lisäsi lastenosaston.',
      stack: 'AutoCAD, Revit',
      githubUrl: '',
      demoUrl: '',
      organization: 'Kaarisilta Architects',
      impact: 'Päivittäinen kävijämäärä nousi 55 % uudelleenavauksen jälkeen.',
      date: '2021',
      teamSize: '4',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'LEED Green Associate', issuer: 'U.S. Green Building Council', year: '2020', credentialUrl: '', expiry: '' },
    { name: 'Pääsuunnittelijakelpoisuus', issuer: 'Suomen Arkkitehtiliitto (SAFA)', year: '2019', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Swedish', level: 'Intermediate' },
  ],
})

export default { en, fi }
