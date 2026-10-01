import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: graduate, compact. Stress case: thin
// experience — a part-time retail job plus one internship, no full-time role.
const shared = {
  fullName: 'Noora Aaltonen',
  email: 'noora.aaltonen@example.com',
  phone: '+358 40 000 2504',
  links: {
    linkedin: 'https://linkedin.com/in/example-naaltonen',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Business Graduate',
  location: 'Hämeenlinna, Finland',
  about:
    "Recent Master's graduate in Economics and Business Administration, looking for my first full-time role in strategy or finance. A finance internship and three years of part-time retail work taught me how numbers and customers actually connect.",
  skills: [
    'Financial analysis', 'Market research', 'Excel & Power BI', 'Project coordination',
    'Pricing strategy', 'Stakeholder communication', 'SQL basics', 'PowerPoint',
  ],
  experience: [
    {
      role: 'Sales Assistant (Part-time)',
      company: 'Vaskikello Boutique',
      location: 'Hämeenlinna, Finland',
      employmentType: 'Part-time',
      startDate: 'Sep 2021',
      endDate: 'May 2024',
      isCurrent: false,
      description: 'Worked part-time in retail sales throughout my studies, alongside 11 other sales staff.',
      achievements: [
        'Consistently ranked in the top 3 of 12 sales staff by monthly revenue for 2 straight years.',
        'Trained 5 new part-time hires on the POS system and customer service standards.',
      ],
      technologies: [],
    },
  ],
  internships: [
    {
      role: 'Finance Intern',
      company: 'Vaskikello Consulting',
      location: 'Hämeenlinna, Finland',
      startDate: 'Jun 2023',
      endDate: 'Aug 2023',
      description: 'Assisted the finance team with budget variance analysis for 10 business units over a 3-month internship.',
      technologies: 'Excel, Power BI, SAP',
    },
  ],
  education: [
    {
      school: 'Hanken School of Economics',
      degree: "M.Sc. (Econ.) Economics and Business Administration",
      location: 'Helsinki, Finland',
      startDate: '2022',
      endDate: '2024',
      honors: '',
      coursework: 'Corporate finance, Marketing strategy, Business analytics',
      grade: '',
    },
    {
      school: 'Hanken School of Economics',
      degree: 'B.Sc. (Econ.) Economics and Business Administration',
      location: 'Helsinki, Finland',
      startDate: '2019',
      endDate: '2022',
      honors: '',
      coursework: 'Microeconomics, Accounting, Statistics',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Nordic Case Competition — Retail Pricing Strategy',
      description: 'Developed a pricing-strategy recommendation for a Nordic retail chain as part of a 4-person team in a regional case competition.',
      stack: 'Excel, PowerPoint',
      githubUrl: '',
      demoUrl: '',
      organization: 'Nordic Student Case Competition',
      impact: 'Placed 2nd out of 18 teams.',
      date: '2023',
      teamSize: '4',
      contribution: 'Led the pricing model and financial projections.',
      image: '',
    },
    {
      name: "Master's thesis — Customer churn in subscription retail",
      description: 'Analyzed churn drivers across 3 Nordic subscription retailers using survey and transaction data.',
      stack: 'SPSS, Excel',
      githubUrl: '',
      demoUrl: '',
      organization: 'Hanken School of Economics',
      impact: 'Findings presented to 2 partner companies.',
      date: '2024',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  publications: [
    {
      title: 'Customer churn drivers in subscription retail: a Nordic case study',
      publisher: "Hanken School of Economics (Master's thesis)",
      year: '2024',
      url: 'https://example.com/thesis/aaltonen-2024',
    },
  ],
  volunteering: [
    {
      organization: 'Hanken Student Union',
      role: 'Treasurer',
      description: 'Managed an annual budget of 25,000 EUR for 15 student clubs and events over 3 years.',
    },
  ],
  certificates: [
    { name: 'Bloomberg Market Concepts', issuer: 'Bloomberg', year: '2023', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'Swedish', level: 'Fluent' },
    { language: 'English', level: 'Fluent' },
  ],
  interests: [
    { name: 'Case competitions' },
    { name: 'Running' },
    { name: 'Volunteering' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Kauppatieteiden vastavalmistunut',
  location: 'Hämeenlinna',
  about:
    'Vastavalmistunut kauppatieteiden maisteri, etsin ensimmäistä kokoaikaista paikkaa strategian tai talouden parista. Talousharjoittelu ja kolme vuotta osa-aikaista vähittäiskauppatyötä opettivat, miten luvut ja asiakkaat oikeasti kohtaavat.',
  skills: [
    'Talousanalyysi', 'Markkinatutkimus', 'Excel ja Power BI', 'Projektikoordinaatio',
    'Hinnoittelustrategia', 'Sidosryhmäviestintä', 'SQL-perusteet', 'PowerPoint',
  ],
  experience: [
    {
      role: 'Myyjä (osa-aikainen)',
      company: 'Vaskikello Boutique',
      location: 'Hämeenlinna',
      employmentType: 'Part-time',
      startDate: '09/2021',
      endDate: '05/2024',
      isCurrent: false,
      description: 'Työskentelin osa-aikaisena myyjänä opintojen ohella, osana 12 hengen myyntitiimiä.',
      achievements: [
        'Sijoituin kahtena vuotena peräkkäin kolmen parhaan joukkoon 12 myyjästä kuukausittaisessa myynnissä.',
        'Koulutin 5 uutta osa-aikaista työntekijää kassajärjestelmän ja asiakaspalvelun käytäntöihin.',
      ],
      technologies: [],
    },
  ],
  internships: [
    {
      role: 'Talousharjoittelija',
      company: 'Vaskikello Consulting',
      location: 'Hämeenlinna',
      startDate: '06/2023',
      endDate: '08/2023',
      description: 'Avustin talousosastoa 10 liiketoimintayksikön budjettipoikkeama-analyyseissä 3 kuukauden harjoittelun aikana.',
      technologies: 'Excel, Power BI, SAP',
    },
  ],
  education: [
    {
      school: 'Svenska handelshögskolan (Hanken)',
      degree: 'Kauppatieteiden maisteri (KTM)',
      location: 'Helsinki',
      startDate: '2022',
      endDate: '2024',
      honors: '',
      coursework: 'Yritysrahoitus, markkinointistrategia, liiketoiminta-analytiikka',
      grade: '',
    },
    {
      school: 'Svenska handelshögskolan (Hanken)',
      degree: 'Kauppatieteiden kandidaatti (KTK)',
      location: 'Helsinki',
      startDate: '2019',
      endDate: '2022',
      honors: '',
      coursework: 'Mikrotaloustiede, laskentatoimi, tilastotiede',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Pohjoismainen case-kilpailu — vähittäiskaupan hinnoittelustrategia',
      description: 'Kehitin hinnoittelustrategiasuosituksen pohjoismaiselle vähittäiskauppaketjulle 4 hengen tiimissä alueellisessa case-kilpailussa.',
      stack: 'Excel, PowerPoint',
      githubUrl: '',
      demoUrl: '',
      organization: 'Nordic Student Case Competition',
      impact: 'Sijoitus 2. sija 18 joukkueesta.',
      date: '2023',
      teamSize: '4',
      contribution: 'Vastasin hinnoittelumallista ja talousennusteista.',
      image: '',
    },
    {
      name: 'Pro gradu -tutkielma — asiakaspoistuma tilausvähittäiskaupassa',
      description: 'Analysoin asiakaspoistuman syitä kolmessa pohjoismaisessa tilauspalveluyrityksessä kysely- ja transaktiodatan avulla.',
      stack: 'SPSS, Excel',
      githubUrl: '',
      demoUrl: '',
      organization: 'Svenska handelshögskolan (Hanken)',
      impact: 'Tulokset esiteltiin 2 yhteistyöyritykselle.',
      date: '2024',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  publications: [
    {
      title: 'Asiakaspoistuman syyt tilausvähittäiskaupassa: pohjoismainen tapaustutkimus',
      publisher: 'Svenska handelshögskolan (Hanken), pro gradu -tutkielma',
      year: '2024',
      url: 'https://example.com/thesis/aaltonen-2024',
    },
  ],
  volunteering: [
    {
      organization: 'Hankenin ylioppilaskunta',
      role: 'Rahastonhoitaja',
      description: 'Vastasin 25 000 euron vuosibudjetista 15 opiskelijakerholle ja tapahtumalle kolmen vuoden ajan.',
    },
  ],
  certificates: [
    { name: 'Bloomberg Market Concepts', issuer: 'Bloomberg', year: '2023', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Suomi', level: 'Äidinkieli' },
    { language: 'Ruotsi', level: 'Sujuva' },
    { language: 'Englanti', level: 'Sujuva' },
  ],
  interests: [
    { name: 'Case-kilpailut' },
    { name: 'Juoksu' },
    { name: 'Vapaaehtoistyö' },
  ],
})

export default { en, fi }
