import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: modern, portfolio.
const shared = {
  fullName: 'Essi Laaksonen',
  email: 'essi.laaksonen@example.com',
  phone: '+358 40 000 1901',
  links: {
    linkedin: 'https://linkedin.com/in/example-elaaksonen',
    portfolio: 'https://elaaksonen.example.com',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Product Manager',
  location: 'Helsinki, Finland',
  about:
    'Product manager with 8 years of shipping B2B SaaS features that customers actually ask for. I run discovery interviews every sprint and kill roadmap items that don\'t move a metric.',
  skills: ['Product discovery', 'Roadmapping', 'SQL', 'A/B testing', 'Jira & Confluence', 'Stakeholder management', 'User interviews', 'Pricing strategy'],
  experience: [
    {
      role: 'Senior Product Manager',
      company: 'Nordiq Software',
      location: 'Helsinki, Finland',
      employmentType: 'Full-time',
      startDate: 'Apr 2021',
      endDate: '',
      isCurrent: true,
      description: 'Own the billing and subscriptions product area for a B2B SaaS platform with 2,200 customers.',
      achievements: [
        'Launched usage-based billing, growing expansion revenue from existing accounts by 24% in the first year.',
        'Cut subscription churn from 6.8% to 4.1% monthly by shipping a self-serve downgrade flow instead of forcing a support call.',
        'Ran 90+ customer discovery interviews across 3 segments to reprioritize the roadmap around the top 2 unmet needs.',
      ],
      technologies: [],
    },
    {
      role: 'Product Manager',
      company: 'Kanttiini Analytics',
      location: 'Tampere, Finland',
      employmentType: 'Full-time',
      startDate: 'Jun 2017',
      endDate: 'Mar 2021',
      isCurrent: false,
      description: 'Led the reporting and dashboards product line for a mid-market analytics tool.',
      achievements: [
        'Shipped a custom-dashboard builder that became the #1 reason cited in win/loss interviews for choosing us over competitors.',
        'Grew weekly active usage of the reporting module from 31% to 58% of the customer base in 18 months.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Aalto University',
      degree: 'M.Sc. Industrial Engineering and Management',
      location: 'Espoo, Finland',
      startDate: '2013',
      endDate: '2017',
      honors: '',
      coursework: 'Product management, Strategy, Applied statistics',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Usage-based billing launch',
      description: 'Led the end-to-end launch of metered billing, from pricing model design to migration of 2,200 existing accounts.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Nordiq Software',
      impact: '24% growth in expansion revenue in the first year.',
      date: '2022',
      teamSize: '6',
      contribution: 'Product lead; partnered with engineering, finance, and 2 design researchers.',
      image: '',
    },
    {
      name: 'Custom dashboard builder',
      description: 'Scoped and shipped a drag-and-drop dashboard builder replacing 14 fixed report templates.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Kanttiini Analytics',
      impact: 'Weekly active usage of reporting rose from 31% to 58%.',
      date: '2020',
      teamSize: '5',
      contribution: 'Sole product owner; ran discovery and wrote the full spec.',
      image: '',
    },
  ],
  achievements: [
    { title: 'Internal "Product Launch of the Year"', description: 'Awarded for the usage-based billing launch at Nordiq Software.', year: '2022' },
  ],
  caseStudies: [
    {
      title: 'Turning churn around with self-serve downgrades',
      problem: 'Monthly subscription churn sat at 6.8%, and exit interviews showed most cancellations happened after a frustrating support call to simply downgrade a plan.',
      solution: 'Designed and shipped a self-serve downgrade flow with clear plan-comparison messaging, backed by in-app nudges before the renewal date.',
      technologies: 'In-app messaging, billing API, customer segmentation',
      outcome: 'Monthly churn dropped from 6.8% to 4.1% within two quarters, with no increase in support ticket volume.',
      lessons: 'Most "retention" problems were actually friction problems; removing the forced support call mattered more than any discount we tried first.',
    },
  ],
  openSource: [
    { name: 'Metabase', description: 'Filed and triaged a reproducible bug report for a dashboard export edge case; fix shipped in the next release.', language: 'Clojure', stars: '38k', forks: '4.9k', url: 'https://github.com/metabase/metabase' },
  ],
  testimonials: [
    {
      quote: 'Essi is the rare PM who can run a pricing workshop in the morning and read a SQL query in the afternoon.',
      author: 'VP of Engineering',
      role: 'Nordiq Software',
    },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Tuotepäällikkö',
  location: 'Helsinki',
  about:
    'Tuotepäällikkö, jolla on 8 vuoden kokemus B2B SaaS -ominaisuuksien toimittamisesta, joita asiakkaat oikeasti pyytävät. Pidän asiakashaastatteluja joka sprintissä ja karsin roadmapista kohdat, jotka eivät liikuta mitään mittaria.',
  skills: ['Tuotekehityksen discovery', 'Roadmapin suunnittelu', 'SQL', 'A/B-testaus', 'Jira ja Confluence', 'Sidosryhmien johtaminen', 'Käyttäjähaastattelut', 'Hinnoittelustrategia'],
  experience: [
    {
      role: 'Senior tuotepäällikkö',
      company: 'Nordiq Software',
      location: 'Helsinki',
      employmentType: 'Full-time',
      startDate: '04/2021',
      endDate: '',
      isCurrent: true,
      description: 'Vastaan laskutuksen ja tilausten tuotealueesta B2B SaaS -alustalla, jolla on 2 200 asiakasta.',
      achievements: [
        'Lanseerasin käyttöperusteisen laskutuksen, kasvattaen nykyasiakkaiden laajennusmyyntiä 24 % ensimmäisenä vuonna.',
        'Laskin tilauspoistuman 6,8 %:sta 4,1 %:iin kuukaudessa julkaisemalla itsepalvelullisen alennusprosessin tukipyynnön sijaan.',
        'Tein 90+ asiakashaastattelua kolmessa segmentissä ja priorisoin roadmapin uudelleen kahden suurimman tyydyttämättömän tarpeen ympärille.',
      ],
      technologies: [],
    },
    {
      role: 'Tuotepäällikkö',
      company: 'Kanttiini Analytics',
      location: 'Tampere',
      employmentType: 'Full-time',
      startDate: '06/2017',
      endDate: '03/2021',
      isCurrent: false,
      description: 'Johdin raportoinnin ja hallintapaneelien tuotelinjaa keskisuurelle analytiikkatyökalulle.',
      achievements: [
        'Julkaisin räätälöitävän hallintapaneelityökalun, jota mainittiin useimmin win/loss-haastatteluissa syynä valita meidät kilpailijoiden sijaan.',
        'Kasvatin raportointimoduulin viikoittaista aktiivikäyttöä 31 %:sta 58 %:iin 18 kuukaudessa.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Aalto-yliopisto',
      degree: 'Kauppatieteiden maisteri, tuotantotalous',
      location: 'Espoo',
      startDate: '2013',
      endDate: '2017',
      honors: '',
      coursework: 'Tuotejohtaminen, strategia, soveltava tilastotiede',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Käyttöperusteisen laskutuksen lanseeraus',
      description: 'Johdin käyttöperusteisen laskutuksen lanseerauksen kokonaisuudessaan, hinnoittelumallista 2 200 nykyasiakkaan migraatioon.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Nordiq Software',
      impact: '24 % kasvu laajennusmyynnissä ensimmäisenä vuonna.',
      date: '2022',
      teamSize: '6',
      contribution: 'Tuotevastaava; yhteistyössä kehityksen, talouden ja 2 tutkijan kanssa.',
      image: '',
    },
    {
      name: 'Räätälöitävä hallintapaneelityökalu',
      description: 'Rajasin ja julkaisin raahaa-ja-pudota-hallintapaneelityökalun, joka korvasi 14 kiinteää raporttipohjaa.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Kanttiini Analytics',
      impact: 'Raportoinnin viikoittainen aktiivikäyttö nousi 31 %:sta 58 %:iin.',
      date: '2020',
      teamSize: '5',
      contribution: 'Ainoa tuotevastaava; vastasin discoverysta ja koko spesifikaatiosta.',
      image: '',
    },
  ],
  achievements: [
    { title: 'Sisäinen "Vuoden tuotelanseeraus"', description: 'Palkittu käyttöperusteisen laskutuksen lanseerauksesta Nordiq Softwarella.', year: '2022' },
  ],
  caseStudies: [
    {
      title: 'Poistuman kääntäminen itsepalvelualennuksilla',
      problem: 'Kuukausittainen tilauspoistuma oli 6,8 %, ja irtisanomishaastattelut osoittivat, että suurin osa peruutuksista tapahtui turhauttavan tukipuhelun jälkeen, kun asiakas halusi vain alentaa tilaustasoaan.',
      solution: 'Suunnittelin ja julkaisin itsepalvelullisen alennusprosessin selkeällä tasovertailuviestinnällä, tuettuna sovelluksen sisäisillä muistutuksilla ennen uusimispäivää.',
      technologies: 'Sovelluksen sisäinen viestintä, laskutusrajapinta, asiakassegmentointi',
      outcome: 'Kuukausittainen poistuma laski 6,8 %:sta 4,1 %:iin kahdessa vuosineljänneksessä, tukipyyntöjen määrän kasvamatta.',
      lessons: 'Useimmat "sitouttamisongelmat" olivat oikeasti kitkaongelmia; pakollisen tukipuhelun poistaminen vaikutti enemmän kuin mikään alennus, jota kokeilimme ensin.',
    },
  ],
  openSource: [
    { name: 'Metabase', description: 'Raportoin toistettavan virheen hallintapaneelin vientitoiminnon reunatapauksesta; korjaus julkaistiin seuraavassa versiossa.', language: 'Clojure', stars: '38k', forks: '4.9k', url: 'https://github.com/metabase/metabase' },
  ],
  testimonials: [
    {
      quote: 'Essi on harvinainen tuotepäällikkö, joka vetää hinnoitteluworkshopin aamulla ja lukee SQL-kyselyn iltapäivällä.',
      author: 'Kehitysjohtaja',
      role: 'Nordiq Software',
    },
  ],
})

export default { en, fi }
