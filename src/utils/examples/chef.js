import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: portrait, european. Lives abroad (Denmark)
// per the brief's allowance for chef/architect.
const shared = {
  fullName: 'Markus Ahonen',
  email: 'markus.ahonen@example.com',
  phone: '+358 40 000 2510',
  links: {
    website: 'https://ahonen.example.com',
    linkedin: 'https://linkedin.com/in/example-mahonen',
    youtube: 'https://youtube.com/@example-mahonen',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Head Chef',
  location: 'Copenhagen, Denmark',
  about:
    'Head chef with 13 years in Nordic kitchens, 5 of them running the pass at a 60-cover tasting-menu restaurant. I build menus around what the season actually gives us and run a kitchen where the food cost line and the staff turnover line both stay low.',
  skills: [
    'Menu development', 'Nordic cuisine', 'Kitchen management', 'Food cost control',
    'HACCP food safety', 'Supplier negotiation', 'Staff training', 'Plating & presentation',
  ],
  experience: [
    {
      role: 'Head Chef',
      company: 'Nordisk Kökshus',
      location: 'Copenhagen, Denmark',
      employmentType: 'Full-time',
      startDate: 'Apr 2021',
      endDate: '',
      isCurrent: true,
      description: 'Run the kitchen for a 60-cover seasonal tasting-menu restaurant, leading a brigade of 9.',
      achievements: [
        'Cut food cost from 34% to 27% of revenue by redesigning the menu around whole-animal and whole-vegetable use.',
        'Held a 4.7/5 average guest rating across more than 3,000 covers a year.',
        'Cut kitchen staff turnover from 60% to 25% annually by restructuring shift rotations and training.',
      ],
      technologies: [],
    },
    {
      role: 'Sous Chef',
      company: 'Kustaankartano Ravintola',
      location: 'Helsinki, Finland',
      employmentType: 'Full-time',
      startDate: 'May 2016',
      endDate: 'Mar 2021',
      isCurrent: false,
      description: 'Second-in-command in a 45-cover Nordic a la carte kitchen.',
      achievements: [
        'Developed a seasonal menu rotation that lifted average check size by 18%.',
        'Trained 12 junior cooks, 5 of whom were promoted to chef de partie under my supervision.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Perho Culinary, Tourism and Business College',
      degree: 'Vocational Qualification in Catering, Chef',
      location: 'Helsinki, Finland',
      startDate: '2012',
      endDate: '2015',
      honors: '',
      coursework: 'Classical technique, Kitchen management, Food hygiene',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Seasonal tasting-menu relaunch',
      description: 'Rebuilt the restaurant\'s 7-course tasting menu around whole-animal butchery and root-to-leaf vegetable use.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Nordisk Kökshus',
      impact: 'Food cost dropped from 34% to 27% of revenue.',
      date: '2022',
      teamSize: '9',
      contribution: 'Designed the menu and retrained the brigade on new techniques.',
      image: '',
    },
    {
      name: 'Pop-up dinner series',
      description: 'A quarterly 4-course pop-up dinner collaborating with local foragers and small producers.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Nordisk Kökshus',
      impact: 'Sold out all 8 editions, 40 covers each.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'HACCP Food Safety Certification', issuer: 'Danish Veterinary and Food Administration', year: '2021', credentialUrl: '', expiry: '' },
    { name: 'Nordic Chef Competition, Regional Finalist', issuer: 'Nordic Chefs Association', year: '2019', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Danish', level: 'Intermediate' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Keittiöpäällikkö',
  location: 'Kopenhamina, Tanska',
  about:
    'Keittiöpäällikkö, jolla on 13 vuoden kokemus pohjoismaisista keittiöistä, viisi niistä 60 asiakaspaikan maistelumenuravintolan liedellä. Rakennan menut sen mukaan, mitä kausi todella tarjoaa, ja pidän ruokakustannukset sekä henkilöstön vaihtuvuuden alhaalla.',
  skills: [
    'Menusuunnittelu', 'Pohjoismainen keittiö', 'Keittiön johtaminen', 'Ruokakustannusten hallinta',
    'HACCP-elintarviketurvallisuus', 'Tavarantoimittajaneuvottelut', 'Henkilöstön koulutus', 'Annosten esillepano',
  ],
  experience: [
    {
      role: 'Keittiöpäällikkö',
      company: 'Nordisk Kökshus',
      location: 'Kopenhamina, Tanska',
      employmentType: 'Full-time',
      startDate: '04/2021',
      endDate: '',
      isCurrent: true,
      description: 'Johdan keittiötä 60 asiakaspaikan kausittaisessa maistelumenuravintolassa, vastuullani 9 hengen tiimi.',
      achievements: [
        'Laskin ruokakustannukset 34 %:sta 27 %:iin liikevaihdosta suunnittelemalla menun uudelleen koko eläimen ja koko kasviksen hyödyntämisen pohjalta.',
        'Pidin asiakasarvion keskiarvossa 4,7/5 yli 3 000 vuosittaisen asiakkaan yli.',
        'Laskin keittiöhenkilöstön vuosittaisen vaihtuvuuden 60 %:sta 25 %:iin uudistamalla vuorojärjestelyt ja koulutuksen.',
      ],
      technologies: [],
    },
    {
      role: 'Apulaiskeittiöpäällikkö',
      company: 'Kustaankartano Ravintola',
      location: 'Helsinki',
      employmentType: 'Full-time',
      startDate: '05/2016',
      endDate: '03/2021',
      isCurrent: false,
      description: 'Keittiöpäällikön varamies 45 asiakaspaikan pohjoismaisessa à la carte -keittiössä.',
      achievements: [
        'Kehitin kausittaisen menukierron, joka nosti keskimääräistä laskun loppusummaa 18 %.',
        'Koulutin 12 nuorempaa kokkia, joista 5 ylennettiin osastonvastaavaksi ohjauksessani.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Perho Liiketalousopisto',
      degree: 'Ammattitutkinto, kokki',
      location: 'Helsinki',
      startDate: '2012',
      endDate: '2015',
      honors: '',
      coursework: 'Klassinen tekniikka, keittiön johtaminen, elintarvikehygienia',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Kausittaisen maistelumenun uudistus',
      description: 'Rakensin ravintolan 7-ruokalajin maistelumenun uudelleen koko eläimen hyödyntämisen ja juuresta lehteen -kasvisten pohjalta.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Nordisk Kökshus',
      impact: 'Ruokakustannukset laskivat 34 %:sta 27 %:iin liikevaihdosta.',
      date: '2022',
      teamSize: '9',
      contribution: 'Suunnittelin menun ja koulutin tiimin uusiin tekniikoihin.',
      image: '',
    },
    {
      name: 'Pop-up-illallissarja',
      description: 'Neljännesvuosittainen 4-ruokalajin pop-up-illallinen yhteistyössä paikallisten keräilijöiden ja pienten tuottajien kanssa.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Nordisk Kökshus',
      impact: 'Kaikki 8 kertaa loppuunmyyty, 40 asiakaspaikkaa kerrallaan.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'HACCP-elintarviketurvallisuussertifikaatti', issuer: 'Danish Veterinary and Food Administration', year: '2021', credentialUrl: '', expiry: '' },
    { name: 'Pohjoismainen kokkikilpailu, aluefinalisti', issuer: 'Nordic Chefs Association', year: '2019', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Danish', level: 'Intermediate' },
  ],
})

export default { en, fi }
