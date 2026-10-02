import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: developer (default), portfolio.
const shared = {
  fullName: 'Mikael Laine',
  email: 'mikael.laine@example.com',
  phone: '+358 40 000 1201',
  links: {
    github: 'https://github.com/example-mlaine',
    linkedin: 'https://linkedin.com/in/example-mlaine',
    portfolio: 'https://mlaine.example.com',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Frontend Developer',
  location: 'Tampere, Finland',
  about:
    'Frontend developer with 7 years of building accessible React applications for fintech and e-commerce. I care about fast pages, readable components, and shipping small changes often.',
  skills: ['React', 'TypeScript', 'Next.js', 'CSS architecture', 'Accessibility (WCAG 2.2)', 'Playwright', 'Vite', 'Storybook', 'GraphQL', 'Web performance'],
  experience: [
    {
      role: 'Frontend Developer',
      company: 'Northpay Oy',
      location: 'Tampere, Finland',
      employmentType: 'Full-time',
      startDate: 'Mar 2022',
      endDate: '',
      isCurrent: true,
      description: 'Own the customer-facing payments dashboard used by 40,000 merchants.',
      achievements: [
        'Cut dashboard load time from 4.1 s to 1.6 s by splitting bundles and moving charts to a worker.',
        'Led the WCAG 2.2 AA audit and fixed 120+ issues; zero accessibility complaints since.',
        'Introduced Playwright visual tests that catch ~5 regressions a month before release.',
      ],
      technologies: ['React', 'TypeScript', 'Playwright'],
    },
    {
      role: 'Junior Frontend Developer',
      company: 'Kauppakatu Digital',
      location: 'Helsinki, Finland',
      employmentType: 'Full-time',
      startDate: 'Aug 2019',
      endDate: 'Feb 2022',
      isCurrent: false,
      description: 'Built storefront features for three Nordic retail clients.',
      achievements: [
        'Rebuilt the product listing page as a reusable component set used across all three storefronts.',
        'Raised mobile conversion 9% with a simplified checkout flow.',
      ],
      technologies: ['React', 'Next.js', 'GraphQL'],
    },
  ],
  education: [
    {
      school: 'Tampere University of Applied Sciences',
      degree: 'B.Eng. Software Engineering',
      location: 'Tampere, Finland',
      startDate: '2015',
      endDate: '2019',
      honors: '',
      coursework: 'Web development, Human–computer interaction, Databases',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'a11y-lint-action',
      description: 'GitHub Action that runs axe-core on preview deployments and comments the diff on the PR. 600+ stars.',
      stack: 'TypeScript, axe-core, GitHub Actions',
      githubUrl: 'https://github.com/example-mlaine/a11y-lint-action',
      demoUrl: '',
      organization: '',
      impact: '600+ stars, adopted by 40+ repositories.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Tram times widget',
      description: 'Offline-first PWA showing live Tampere tram departures; 3,000 weekly users.',
      stack: 'Preact, Service Workers',
      githubUrl: '',
      demoUrl: 'https://trams.mlaine.example.com',
      organization: '',
      impact: '3,000 weekly active users.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  achievements: [
    { title: 'Speaker, React Finland 2024', description: 'Talk: "Shipping accessible charts".', year: '2024' },
  ],
  openSource: [
    { name: 'Vite', description: 'Fixed CSS source-map handling for nested imports.', language: 'TypeScript', stars: '66k', forks: '6k', url: 'https://github.com/vitejs/vite' },
  ],
  publications: [
    { title: 'Making dashboards fast without a rewrite', publisher: 'dev.to', year: '2023', url: 'https://dev.to/example-mlaine' },
  ],
  caseStudies: [
    {
      title: 'Rebuilding the merchant payments dashboard',
      problem: 'The dashboard took over 4 seconds to become interactive, and support tickets about "the page is stuck" were a top-5 complaint.',
      solution: 'Split the bundle by route, moved chart rendering into a Web Worker, and replaced a heavy table library with a virtualized list.',
      technologies: 'React, TypeScript, Web Workers, Vite',
      outcome: 'Time to interactive dropped from 4.1 s to 1.6 s; related support tickets fell by about 70%.',
      lessons: 'Measuring real user timings before optimizing saved weeks of guessing which part was actually slow.',
    },
  ],
  testimonials: [
    {
      quote: 'Mikael turned a dashboard nobody wanted to touch into the fastest part of our product.',
      author: 'Head of Engineering',
      role: 'Northpay Oy',
    },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Frontend-kehittäjä',
  location: 'Tampere',
  about:
    'Frontend-kehittäjä, jolla on seitsemän vuoden kokemus saavutettavien React-sovellusten rakentamisesta fintech- ja verkkokauppa-alalla. Minulle tärkeintä ovat nopeat sivut, selkeät komponentit ja pienet, usein julkaistavat muutokset.',
  skills: ['React', 'TypeScript', 'Next.js', 'CSS-arkkitehtuuri', 'Saavutettavuus (WCAG 2.2)', 'Playwright', 'Vite', 'Storybook', 'GraphQL', 'Verkkosuorituskyky'],
  experience: [
    {
      role: 'Frontend-kehittäjä',
      company: 'Northpay Oy',
      location: 'Tampere',
      employmentType: 'Full-time',
      startDate: '03/2022',
      endDate: '',
      isCurrent: true,
      description: 'Vastaan 40 000 kauppiaan käyttämästä maksujen hallintanäkymästä.',
      achievements: [
        'Lyhensin näkymän latausajan 4,1 sekunnista 1,6 sekuntiin pilkkomalla paketit ja siirtämällä kaaviot workeriin.',
        'Johdin WCAG 2.2 AA -auditoinnin ja korjasin yli 120 ongelmaa; saavutettavuudesta ei ole tullut yhtään valitusta sen jälkeen.',
        'Otin käyttöön Playwright-visuaalitestit, jotka löytävät noin viisi regressiota kuukaudessa ennen julkaisua.',
      ],
      technologies: ['React', 'TypeScript', 'Playwright'],
    },
    {
      role: 'Nuorempi frontend-kehittäjä',
      company: 'Kauppakatu Digital',
      location: 'Helsinki',
      employmentType: 'Full-time',
      startDate: '08/2019',
      endDate: '02/2022',
      isCurrent: false,
      description: 'Rakensin verkkokauppatoimintoja kolmelle pohjoismaiselle vähittäiskauppa-asiakkaalle.',
      achievements: [
        'Uudistin tuotelistaussivun uudelleenkäytettäviksi komponenteiksi, jotka otettiin käyttöön kaikissa kolmessa verkkokaupassa.',
        'Nostin mobiilikonversiota 9 % yksinkertaistetulla kassaprosessilla.',
      ],
      technologies: ['React', 'Next.js', 'GraphQL'],
    },
  ],
  education: [
    {
      school: 'Tampereen ammattikorkeakoulu',
      degree: 'Insinööri (AMK), ohjelmistotekniikka',
      location: 'Tampere',
      startDate: '2015',
      endDate: '2019',
      honors: '',
      coursework: 'Web-kehitys, ihminen–tietokone-vuorovaikutus, tietokannat',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'a11y-lint-action',
      description: 'GitHub Action, joka ajaa axe-corea esikatseluympäristöissä ja kommentoi muutokset pull requestiin. Yli 600 tähteä.',
      stack: 'TypeScript, axe-core, GitHub Actions',
      githubUrl: 'https://github.com/example-mlaine/a11y-lint-action',
      demoUrl: '',
      organization: '',
      impact: 'Yli 600 tähteä, käytössä 40+ repositoriossa.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Ratikka-aikataulut',
      description: 'Offline-tilassa toimiva PWA, joka näyttää Tampereen ratikoiden lähtöajat reaaliajassa; 3 000 käyttäjää viikossa.',
      stack: 'Preact, Service Workers',
      githubUrl: '',
      demoUrl: 'https://trams.mlaine.example.com',
      organization: '',
      impact: '3 000 viikoittaista aktiivista käyttäjää.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  achievements: [
    { title: 'Puhuja, React Finland 2024', description: 'Esitys: "Saavutettavat kaaviot tuotannossa".', year: '2024' },
  ],
  openSource: [
    { name: 'Vite', description: 'Korjasin CSS-lähdekarttojen käsittelyn sisäkkäisille importeille.', language: 'TypeScript', stars: '66k', forks: '6k', url: 'https://github.com/vitejs/vite' },
  ],
  publications: [
    { title: 'Nopeampi hallintanäkymä ilman uudelleenkirjoitusta', publisher: 'dev.to', year: '2023', url: 'https://dev.to/example-mlaine' },
  ],
  caseStudies: [
    {
      title: 'Kauppiaiden maksunäkymän uudistus',
      problem: 'Näkymän latautuminen käytettävään tilaan kesti yli 4 sekuntia, ja "sivu on jumissa" -tukipyynnöt olivat top-5-valitusten joukossa.',
      solution: 'Pilkoin paketin reiteittäin, siirsin kaavioiden piirtämisen Web Workeriin ja korvasin raskaan taulukkokirjaston virtualisoidulla listalla.',
      technologies: 'React, TypeScript, Web Workers, Vite',
      outcome: 'Käytettävään tilaan latautuminen laski 4,1 sekunnista 1,6 sekuntiin; aiheeseen liittyvät tukipyynnöt vähenivät noin 70 %.',
      lessons: 'Oikeiden käyttäjien latausaikojen mittaaminen ennen optimointia säästi viikkoja arvailua siitä, mikä osa oli oikeasti hidas.',
    },
  ],
  testimonials: [
    {
      quote: 'Mikael muutti näkymän, jota kukaan ei halunnut koskea, tuotteemme nopeimmaksi osaksi.',
      author: 'Kehitysjohtaja',
      role: 'Northpay Oy',
    },
  ],
})

export default { en, fi }
