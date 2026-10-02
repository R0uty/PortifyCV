import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: portrait.
const shared = {
  fullName: 'Venla Kallio',
  email: 'venla.kallio@example.com',
  phone: '+358 40 000 2509',
  links: {
    portfolio: 'https://kallio.example.com',
    behance: 'https://behance.net/example-vkallio',
    linkedin: 'https://linkedin.com/in/example-vkallio',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Brand Specialist',
  location: 'Hyvinkää, Finland',
  about:
    'Brand specialist with 9 years building and defending consistent brand identities for consumer and retail companies. I turn a vague "make it feel premium" brief into guidelines a 20-person team can actually follow.',
  skills: [
    'Brand strategy', 'Visual identity', 'Campaign management', 'Adobe Creative Suite',
    'Market research', 'Social media branding', 'Brand guidelines', 'Stakeholder presentations',
  ],
  experience: [
    {
      role: 'Brand Specialist',
      company: 'Kulkuri Brands',
      location: 'Hyvinkää, Finland',
      employmentType: 'Full-time',
      startDate: 'Feb 2020',
      endDate: '',
      isCurrent: true,
      description: 'Own brand identity and guidelines across 5 consumer product lines.',
      achievements: [
        'Led a full rebrand of the company\'s flagship product line, lifting unaided brand recall from 22% to 41% in post-launch surveys.',
        'Built a brand guideline system adopted by 20+ people across marketing, product, and retail partners.',
        'Cut external agency spend by 35% by bringing campaign asset production in-house.',
      ],
      technologies: [],
    },
    {
      role: 'Marketing Assistant',
      company: 'Metsäpolku Studio',
      location: 'Helsinki, Finland',
      employmentType: 'Full-time',
      startDate: 'Jun 2017',
      endDate: 'Jan 2020',
      isCurrent: false,
      description: 'Supported brand and campaign work for retail clients at a small design studio.',
      achievements: [
        'Delivered visual identity refreshes for 6 retail clients on time and on budget.',
        'Grew one client\'s Instagram following by 180% through a consistent visual content calendar.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Metropolia University of Applied Sciences',
      degree: 'B.B.A. Marketing',
      location: 'Helsinki, Finland',
      startDate: '2013',
      endDate: '2017',
      honors: '',
      coursework: 'Brand management, Visual communication, Consumer behavior',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Flagship product line rebrand',
      description: 'End-to-end rebrand covering logo, packaging, and in-store signage for the company\'s best-selling product line.',
      stack: 'Adobe Illustrator, Adobe InDesign',
      githubUrl: '',
      demoUrl: '',
      organization: 'Kulkuri Brands',
      impact: 'Unaided brand recall rose from 22% to 41%.',
      date: '2023',
      teamSize: '5',
      contribution: 'Led strategy and visual direction; briefed and reviewed all agency work.',
      image: '',
    },
    {
      name: 'Brand guideline system',
      description: 'A single reference system covering logo use, color, typography, and tone of voice for internal and partner teams.',
      stack: 'Figma, Adobe Creative Suite',
      githubUrl: '',
      demoUrl: '',
      organization: 'Kulkuri Brands',
      impact: 'Adopted by 20+ people across 3 teams.',
      date: '2021',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'Certified Brand Strategist', issuer: 'Branding Institute', year: '2022', credentialUrl: '', expiry: '' },
    { name: 'Google Analytics Certification', issuer: 'Google', year: '2020', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Brändiasiantuntija',
  location: 'Hyvinkää',
  about:
    'Brändiasiantuntija, jolla on 9 vuoden kokemus yhtenäisten brändi-identiteettien rakentamisesta ja vaalimisesta kuluttaja- ja vähittäiskauppayrityksille. Muutan epämääräisen "tee siitä premium-tuntuinen" -toimeksiannon ohjeistukseksi, jota 20 hengen tiimi pystyy oikeasti noudattamaan.',
  skills: [
    'Brändistrategia', 'Visuaalinen identiteetti', 'Kampanjanhallinta', 'Adobe Creative Suite',
    'Markkinatutkimus', 'Sosiaalisen median brändäys', 'Brändiohjeistot', 'Sidosryhmäesitykset',
  ],
  experience: [
    {
      role: 'Brändiasiantuntija',
      company: 'Kulkuri Brands',
      location: 'Hyvinkää',
      employmentType: 'Full-time',
      startDate: '02/2020',
      endDate: '',
      isCurrent: true,
      description: 'Vastaan brändi-identiteetistä ja ohjeistuksista viidelle kulutustuotelinjalle.',
      achievements: [
        'Vedin lippulaivatuotelinjan täyden uudelleenbrändäyksen, joka nosti spontaanin brändimuistamisen 22 %:sta 41 %:iin lanseerauksen jälkeisissä kyselyissä.',
        'Rakensin brändiohjeistojärjestelmän, jonka otti käyttöön yli 20 henkilöä markkinoinnissa, tuotteessa ja vähittäiskauppakumppaneilla.',
        'Vähensin ulkoisten toimistojen käyttöä 35 % tuomalla kampanjamateriaalien tuotannon taloon.',
      ],
      technologies: [],
    },
    {
      role: 'Markkinointiassistentti',
      company: 'Metsäpolku Studio',
      location: 'Helsinki',
      employmentType: 'Full-time',
      startDate: '06/2017',
      endDate: '01/2020',
      isCurrent: false,
      description: 'Avustin brändi- ja kampanjatyössä vähittäiskauppa-asiakkaille pienessä suunnittelutoimistossa.',
      achievements: [
        'Toimitin visuaalisen identiteetin uudistukset 6 vähittäiskauppa-asiakkaalle aikataulussa ja budjetissa.',
        'Kasvatin yhden asiakkaan Instagram-seuraajamäärää 180 % yhtenäisen visuaalisen sisältösuunnitelman avulla.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Metropolia ammattikorkeakoulu',
      degree: 'Tradenomi, markkinointi',
      location: 'Helsinki',
      startDate: '2013',
      endDate: '2017',
      honors: '',
      coursework: 'Brändijohtaminen, visuaalinen viestintä, kuluttajakäyttäytyminen',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Lippulaivatuotelinjan uudelleenbrändäys',
      description: 'Täysi uudelleenbrändäys, joka kattoi logon, pakkaukset ja myymälämateriaalit yrityksen myydyimmälle tuotelinjalle.',
      stack: 'Adobe Illustrator, Adobe InDesign',
      githubUrl: '',
      demoUrl: '',
      organization: 'Kulkuri Brands',
      impact: 'Spontaani brändimuistaminen nousi 22 %:sta 41 %:iin.',
      date: '2023',
      teamSize: '5',
      contribution: 'Johdin strategiaa ja visuaalista suuntaa; briiffasin ja hyväksyin kaiken toimistotyön.',
      image: '',
    },
    {
      name: 'Brändiohjeistojärjestelmä',
      description: 'Yksi viitejärjestelmä, joka kattaa logon käytön, värit, typografian ja äänensävyn sisäisille ja kumppanitiimeille.',
      stack: 'Figma, Adobe Creative Suite',
      githubUrl: '',
      demoUrl: '',
      organization: 'Kulkuri Brands',
      impact: 'Käytössä yli 20 henkilöllä kolmessa tiimissä.',
      date: '2021',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'Certified Brand Strategist', issuer: 'Branding Institute', year: '2022', credentialUrl: '', expiry: '' },
    { name: 'Google Analytics -sertifikaatti', issuer: 'Google', year: '2020', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
  ],
})

export default { en, fi }
