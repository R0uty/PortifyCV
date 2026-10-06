import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: quadrant, editorial.
const shared = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '0123456789',
  links: {
    website: 'https://johndoe.example.com',
    linkedin: 'https://linkedin.example.com/in/john-doe',
    youtube: 'https://youtube.example.com/@john-doe',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Journalist',
  location: 'Mikkeli, Finland',
  about:
    'Journalist with 13 years covering housing, local government, and the environment for regional and national outlets. I build stories on public records and data, not just quotes, and I follow up until the story changes something.',
  skills: [
    'Investigative reporting', 'Data journalism', 'Interviewing', 'Freedom-of-information requests',
    'CMS (WordPress, Drupal)', 'SEO for news', 'Adobe Premiere', 'Multimedia storytelling',
  ],
  experience: [
    {
      role: 'Senior Reporter',
      company: 'Example Oy',
      location: 'Mikkeli, Finland',
      employmentType: 'Full-time',
      startDate: 'Mar 2019',
      endDate: '',
      isCurrent: true,
      description: 'Cover housing, local government, and the environment for a regional daily with 140,000 readers.',
      achievements: [
        'A 6-part investigation into rent increases in municipal housing led the city council to freeze rents for 1,200 tenants.',
        'Grew the housing beat\'s digital readership by 65% after launching a data-driven weekly explainer series.',
        'Filed and won 14 freedom-of-information appeals that forced release of previously withheld planning documents.',
      ],
      technologies: [],
    },
    {
      role: 'Reporter',
      company: 'Example Oy',
      location: 'Jyväskylä, Finland',
      employmentType: 'Full-time',
      startDate: 'Aug 2013',
      endDate: 'Feb 2019',
      isCurrent: false,
      description: 'General-assignment and local government reporter for a regional weekly.',
      achievements: [
        'Broke a story on misused municipal grants that triggered a formal audit of 3 local associations.',
        'Produced a 12-episode local-history podcast that reached 8,000 monthly listeners.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'M.Soc.Sc. Journalism and Mass Communication',
      location: 'Tampere, Finland',
      startDate: '2008',
      endDate: '2013',
      honors: '',
      coursework: 'Investigative reporting, Media law, Data journalism, Media ethics',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Hidden Rents investigation',
      description: 'Six-part series analyzing municipal housing rent data to show systematic above-inflation increases.',
      stack: 'Python, public records requests',
      githubUrl: '',
      demoUrl: '',
      organization: 'Example Oy',
      impact: 'City council froze rents for 1,200 tenants for one year.',
      date: '2022',
      teamSize: '2',
      contribution: 'Reported the series and built the underlying rent-data analysis.',
      image: '',
    },
    {
      name: 'Local history podcast',
      description: 'Twelve-episode narrative podcast on the region\'s industrial history, built from archive interviews.',
      stack: 'Audacity, Adobe Premiere',
      githubUrl: '',
      demoUrl: '',
      organization: 'Example Oy',
      impact: '8,000 monthly listeners at peak.',
      date: '2018',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'Data Journalism Certificate', issuer: 'Example Oy', year: '2021', credentialUrl: '', expiry: '' },
    { name: 'Audio Storytelling Certificate', issuer: 'Example Oy', year: '2017', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Swedish', level: 'Intermediate' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Toimittaja',
  location: 'Mikkeli',
  about:
    'Toimittaja, jolla on 13 vuoden kokemus asumisen, kunnallispolitiikan ja ympäristön uutisoinnista alueellisille ja valtakunnallisille julkaisuille. Rakennan juttuni julkisiin asiakirjoihin ja dataan, en vain sitaatteihin, ja seuraan asiaa kunnes se muuttaa jotain.',
  skills: [
    'Tutkiva journalismi', 'Datajournalismi', 'Haastattelu', 'Tietopyynnöt viranomaisilta',
    'Julkaisujärjestelmät (WordPress, Drupal)', 'Hakukoneoptimointi uutisille', 'Adobe Premiere', 'Multimediakerronta',
  ],
  experience: [
    {
      role: 'Erikoistoimittaja',
      company: 'Example Oy',
      location: 'Mikkeli',
      employmentType: 'Full-time',
      startDate: '03/2019',
      endDate: '',
      isCurrent: true,
      description: 'Seuraan asumista, kunnallispolitiikkaa ja ympäristöä 140 000 lukijan aluelehdessä.',
      achievements: [
        'Kuusiosainen selvitys kunnallisten vuokra-asuntojen vuokrankorotuksista sai kaupunginvaltuuston jäädyttämään vuokrat 1 200 vuokralaiselle.',
        'Kasvatin asumisaiheen digitaalista lukijakuntaa 65 % viikoittaisen data-pohjaisen selitysartikkelisarjan myötä.',
        'Tein ja voitin 14 tietopyyntövalitusta, jotka pakottivat julkistamaan aiemmin salassa pidettyjä kaavoitusasiakirjoja.',
      ],
      technologies: [],
    },
    {
      role: 'Toimittaja',
      company: 'Example Oy',
      location: 'Jyväskylä',
      employmentType: 'Full-time',
      startDate: '08/2013',
      endDate: '02/2019',
      isCurrent: false,
      description: 'Yleistoimittaja ja kunnallispolitiikan seuraaja alueellisessa viikkolehdessä.',
      achievements: [
        'Paljastin kunnallisten avustusten väärinkäytön, joka johti virallisen tarkastuksen käynnistämiseen 3 paikallisyhdistyksessä.',
        'Tuotin 12-osaisen paikallishistoriapodcastin, joka tavoitti 8 000 kuukausittaista kuuntelijaa.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'Valtiotieteiden maisteri, journalistiikka ja viestintä',
      location: 'Tampere',
      startDate: '2008',
      endDate: '2013',
      honors: '',
      coursework: 'Tutkiva journalismi, viestintäoikeus, datajournalismi, median etiikka',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Piilovuokrat-selvitys',
      description: 'Kuusiosainen juttusarja, joka analysoi kunnallisten vuokra-asuntojen dataa ja osoitti systemaattiset inflaatiota suuremmat korotukset.',
      stack: 'Python, tietopyynnöt',
      githubUrl: '',
      demoUrl: '',
      organization: 'Example Oy',
      impact: 'Kaupunginvaltuusto jäädytti vuokrat 1 200 vuokralaiselle vuodeksi.',
      date: '2022',
      teamSize: '2',
      contribution: 'Raportoin sarjan ja rakensin vuokradata-analyysin.',
      image: '',
    },
    {
      name: 'Paikallishistoriapodcast',
      description: 'Kaksitoistaosainen tarinallinen podcast alueen teollisuushistoriasta, rakennettu arkistohaastatteluista.',
      stack: 'Audacity, Adobe Premiere',
      githubUrl: '',
      demoUrl: '',
      organization: 'Example Oy',
      impact: '8 000 kuukausittaista kuuntelijaa huippuhetkellä.',
      date: '2018',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'Datajournalismin sertifikaatti', issuer: 'Example Oy', year: '2021', credentialUrl: '', expiry: '' },
    { name: 'Äänikerronnan sertifikaatti', issuer: 'Example Oy', year: '2017', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Swedish', level: 'Intermediate' },
  ],
})

export default { en, fi }
