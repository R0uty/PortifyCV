import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: creative, portfolio, modernOrange.
const shared = {
  fullName: 'Sofia Nieminen',
  email: 'sofia.nieminen@example.com',
  phone: '+358 40 000 1501',
  links: {
    linkedin: 'https://linkedin.com/in/example-snieminen',
    portfolio: 'https://snieminen.example.com',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'UX Designer',
  location: 'Turku, Finland',
  about:
    'UX designer with 8 years of research-led product design across fintech and logistics. I spend as much time watching people struggle with a flow as I do drawing the fix.',
  skills: ['Figma', 'User research', 'Usability testing', 'Design systems', 'Prototyping', 'Information architecture'],
  experience: [
    {
      role: 'Senior UX Designer',
      company: 'Lumio Studios',
      location: 'Turku, Finland',
      employmentType: 'Full-time',
      startDate: 'Feb 2021',
      endDate: '',
      isCurrent: true,
      description: 'Lead UX for a fintech client portfolio and maintain the studio’s shared design system.',
      achievements: [
        'Redesigned the onboarding flow for a fintech client, lifting trial-to-paid conversion by 18%.',
        'Ran 30+ moderated usability tests over two years, directly shaping 3 major releases.',
        'Built and maintain a shared design system now used by 4 product teams.',
      ],
      technologies: ['Figma', 'Design systems', 'User research'],
    },
    {
      role: 'UX Designer',
      company: 'Rantapolku Design',
      location: 'Helsinki, Finland',
      employmentType: 'Full-time',
      startDate: 'Mar 2018',
      endDate: 'Jan 2021',
      isCurrent: false,
      description: 'Designed logistics and booking tools for industrial clients.',
      achievements: [
        'Led the redesign of a logistics booking tool, cutting task completion time from 4 minutes to 90 seconds.',
        'Introduced a shared research repository that cut duplicate user interviews by about 50%.',
      ],
      technologies: ['Sketch', 'Usability testing'],
    },
  ],
  education: [
    {
      school: 'Turku University of Applied Sciences',
      degree: 'B.A. Industrial Design',
      location: 'Turku, Finland',
      startDate: '2014',
      endDate: '2018',
      honors: '',
      coursework: 'Interaction design, Visual design, Research methods',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Design tokens generator',
      description: 'Internal tool that generates Figma and CSS design tokens from one source file.',
      stack: 'Figma API, Node.js',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Adopted by 4 product teams.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Accessible color contrast checker',
      description: 'Browser extension that flags low-contrast text while designers work in Figma.',
      stack: 'Figma plugin API, TypeScript',
      githubUrl: 'https://github.com/example-snieminen/contrast-checker',
      demoUrl: '',
      organization: '',
      impact: '900+ installs.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  caseStudies: [
    {
      title: 'Redesigning fintech onboarding',
      problem: 'Only 61% of new users finished account setup, and support tickets about "getting stuck" were common.',
      solution: 'Cut the flow from 9 steps to 4, added inline validation, and tested each step with 5 users per round.',
      technologies: 'Figma, Maze, UserTesting',
      outcome: 'Onboarding completion rose from 61% to 84%; trial-to-paid conversion rose 18%.',
      lessons: 'Testing with real users after every step change caught problems that heuristic review missed entirely.',
    },
  ],
  openSource: [
    { name: 'Storybook', description: 'Improved the accessibility addon documentation with clearer setup examples.', language: 'TypeScript', stars: '84k', forks: '9k', url: 'https://github.com/storybookjs/storybook' },
  ],
  testimonials: [
    { quote: 'Sofia turned a confusing onboarding flow into the thing our sales team now demos first.', author: 'Head of Product', role: 'Lumio Studios' },
  ],
  certificates: [
    { name: 'Certified Usability Analyst (CUA)', issuer: 'Human Factors International', year: '2020', credentialUrl: '', expiry: '' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'UX-suunnittelija',
  location: 'Turku',
  about:
    'UX-suunnittelija, jolla on 8 vuoden kokemus tutkimuslähtöisestä tuotesuunnittelusta fintech- ja logistiikka-alalla. Käytän yhtä paljon aikaa seuraamiseen, kun käyttäjät kompastuvat johonkin näkymään, kuin itse korjauksen piirtämiseen.',
  skills: ['Figma', 'Käyttäjätutkimus', 'Käytettävyystestaus', 'Design-järjestelmät', 'Prototypointi', 'Informaatioarkkitehtuuri'],
  experience: [
    {
      role: 'Senior UX-suunnittelija',
      company: 'Lumio Studios',
      location: 'Turku',
      employmentType: 'Full-time',
      startDate: '02/2021',
      endDate: '',
      isCurrent: true,
      description: 'Vastaan fintech-asiakassalkun UX-työstä ja ylläpidän studion yhteistä design-järjestelmää.',
      achievements: [
        'Uudistin fintech-asiakkaan onboarding-polun, nostaen kokeilusta maksavaksi käyttäjäksi siirtymisen 18 %.',
        'Toteutin kahden vuoden aikana yli 30 ohjattua käytettävyystestiä, jotka vaikuttivat suoraan 3 isoon julkaisuun.',
        'Rakensin ja ylläpidän yhteistä design-järjestelmää, jota käyttää nyt 4 tuotetiimiä.',
      ],
      technologies: ['Figma', 'Design-järjestelmät', 'Käyttäjätutkimus'],
    },
    {
      role: 'UX-suunnittelija',
      company: 'Rantapolku Design',
      location: 'Helsinki',
      employmentType: 'Full-time',
      startDate: '03/2018',
      endDate: '01/2021',
      isCurrent: false,
      description: 'Suunnittelin logistiikka- ja varaustyökaluja teollisuusasiakkaille.',
      achievements: [
        'Johdin logistiikan varaustyökalun uudistuksen, lyhentäen tehtävän suoritusajan 4 minuutista 90 sekuntiin.',
        'Otin käyttöön yhteisen tutkimusarkiston, joka vähensi päällekkäisiä käyttäjähaastatteluja noin 50 %.',
      ],
      technologies: ['Sketch', 'Käytettävyystestaus'],
    },
  ],
  education: [
    {
      school: 'Turun ammattikorkeakoulu',
      degree: 'Muotoilija (AMK), teollinen muotoilu',
      location: 'Turku',
      startDate: '2014',
      endDate: '2018',
      honors: '',
      coursework: 'Vuorovaikutussuunnittelu, visuaalinen suunnittelu, tutkimusmenetelmät',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Design tokens -generaattori',
      description: 'Sisäinen työkalu, joka luo Figma- ja CSS-design-tokenit yhdestä lähdetiedostosta.',
      stack: 'Figma API, Node.js',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Käytössä 4 tuotetiimillä.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Saavutettavuuden kontrastintarkistin',
      description: 'Selainlaajennus, joka merkitsee heikosti kontrastoidun tekstin suunnittelijan työskennellessä Figmassa.',
      stack: 'Figma-lisäosa-API, TypeScript',
      githubUrl: 'https://github.com/example-snieminen/contrast-checker',
      demoUrl: '',
      organization: '',
      impact: 'Yli 900 asennusta.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  caseStudies: [
    {
      title: 'Fintech-onboardingin uudistus',
      problem: 'Vain 61 % uusista käyttäjistä sai tilin käyttöönoton loppuun, ja "jumissa oleminen" -tukipyynnöt olivat yleisiä.',
      solution: 'Lyhensin polun 9 vaiheesta 4:ään, lisäsin reaaliaikaisen validoinnin ja testasin joka vaiheen 5 käyttäjällä per kierros.',
      technologies: 'Figma, Maze, UserTesting',
      outcome: 'Onboardingin läpivienti nousi 61 %:sta 84 %:iin; kokeilusta maksavaksi siirtyminen nousi 18 %.',
      lessons: 'Oikeiden käyttäjien testaaminen joka vaihemuutoksen jälkeen löysi ongelmia, jotka heuristinen arviointi olisi kokonaan jättänyt huomaamatta.',
    },
  ],
  openSource: [
    { name: 'Storybook', description: 'Paransin saavutettavuuslisäosan dokumentaatiota selkeämmillä käyttöönotto-esimerkeillä.', language: 'TypeScript', stars: '84k', forks: '9k', url: 'https://github.com/storybookjs/storybook' },
  ],
  testimonials: [
    { quote: 'Sofia muutti sekavan onboarding-polun asiaksi, jota myyntitiimimme nyt esittelee ensimmäisenä.', author: 'Tuotejohtaja', role: 'Lumio Studios' },
  ],
  certificates: [
    { name: 'Certified Usability Analyst (CUA)', issuer: 'Human Factors International', year: '2020', credentialUrl: '', expiry: '' },
  ],
})

export default { en, fi }
