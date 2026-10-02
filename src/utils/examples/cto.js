import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: techExec, navyProfessional.
// Stress case: long name.
const shared = {
  fullName: 'Maximilian Alexander Vandenberg-Lindqvist',
  email: 'maximilian.vandenberg-lindqvist@example.com',
  phone: '+358 40 000 2301',
  links: {
    github: 'https://github.com/example-mvlindqvist',
    linkedin: 'https://linkedin.com/in/example-mvlindqvist',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Chief Technology Officer',
  location: 'Stockholm, Sweden',
  about:
    'CTO with 16 years in software, the last 6 as CTO of a 90-person fintech scale-up. I split my time between the architecture review and the hiring plan, because a good platform decays fast under a bad org chart.',
  skills: ['Technology strategy', 'Cloud architecture (AWS, GCP)', 'Platform security', 'Engineering leadership', 'Fundraising technical diligence', 'Microservices', 'Kubernetes', 'Vendor & build-vs-buy decisions'],
  experience: [
    {
      role: 'Chief Technology Officer',
      company: 'Nordkredit Technologies',
      location: 'Stockholm, Sweden',
      employmentType: 'Full-time',
      startDate: 'Jun 2020',
      endDate: '',
      isCurrent: true,
      description: 'Own technology strategy and a 90-person engineering and security organization for a lending platform.',
      achievements: [
        'Led the platform through SOC 2 Type II and ISO 27001 certification in 11 months, unlocking 3 enterprise contracts worth 6 million EUR combined.',
        'Cut infrastructure cost per transaction by 44% by moving the core ledger service to a multi-tenant architecture.',
        'Scaled engineering from 28 to 90 while holding system uptime at 99.95% through two funding-driven growth spurts.',
      ],
      technologies: [],
    },
    {
      role: 'VP Engineering',
      company: 'Fjordline Payments',
      location: 'Helsinki, Finland',
      employmentType: 'Full-time',
      startDate: 'Jan 2016',
      endDate: 'May 2020',
      isCurrent: false,
      description: 'Led platform and payments engineering for a cross-border payments provider.',
      achievements: [
        'Rebuilt the payments core on an event-driven architecture, cutting transaction processing latency from 800ms to 90ms.',
        'Ran technical due diligence for a 14 million EUR Series B round, with no technical risk items flagged by investors.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'KTH Royal Institute of Technology',
      degree: 'M.Sc. Computer Science and Engineering',
      location: 'Stockholm, Sweden',
      startDate: '2004',
      endDate: '2009',
      honors: '',
      coursework: 'Distributed systems, Cryptography, Software architecture',
      grade: '',
    },
  ],
  certificates: [
    { name: 'AWS Certified Solutions Architect – Professional', issuer: 'Amazon Web Services', year: '2019', credentialUrl: '', expiry: '2025' },
    { name: 'CISSP – Certified Information Systems Security Professional', issuer: '(ISC)²', year: '2021', credentialUrl: '', expiry: '2027' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Teknologiajohtaja',
  location: 'Tukholma, Ruotsi',
  about:
    'Teknologiajohtaja, jolla on 16 vuoden kokemus ohjelmistoalalta, viimeiset 6 vuotta CTO:na 90 hengen fintech-kasvuyhtiössä. Jaan aikani arkkitehtuurikatselmusten ja rekrytointisuunnitelman välillä, koska hyvä alusta rapautuu nopeasti huonon organisaatiorakenteen alla.',
  skills: ['Teknologiastrategia', 'Pilviarkkitehtuuri (AWS, GCP)', 'Alustaturvallisuus', 'Teknologiajohtaminen', 'Rahoituskierrosten tekninen due diligence', 'Mikropalvelut', 'Kubernetes', 'Toimittaja- ja build-vs-buy-päätökset'],
  experience: [
    {
      role: 'Teknologiajohtaja',
      company: 'Nordkredit Technologies',
      location: 'Tukholma, Ruotsi',
      employmentType: 'Full-time',
      startDate: '06/2020',
      endDate: '',
      isCurrent: true,
      description: 'Vastaan teknologiastrategiasta ja 90 hengen kehitys- ja tietoturvaorganisaatiosta luotonantoalustalle.',
      achievements: [
        'Johdin alustan SOC 2 Type II- ja ISO 27001 -sertifiointiin 11 kuukaudessa, mikä avasi 3 yritysasiakassopimusta, yhteisarvo 6 miljoonaa euroa.',
        'Vähensin infrastruktuurikustannusta per transaktio 44 % siirtämällä ydinkirjanpitopalvelun monivuokralaisarkkitehtuuriin.',
        'Kasvatin kehitysorganisaation 28:sta 90:een pitäen järjestelmän käytettävyyden 99,95 %:ssa kahden rahoituskierroksen kasvupiikin aikana.',
      ],
      technologies: [],
    },
    {
      role: 'Kehitysjohtaja (VP Engineering)',
      company: 'Fjordline Payments',
      location: 'Helsinki',
      employmentType: 'Full-time',
      startDate: '01/2016',
      endDate: '05/2020',
      isCurrent: false,
      description: 'Johdin alusta- ja maksukehitystä rajat ylittävien maksujen palveluntarjoajalle.',
      achievements: [
        'Uudistin maksujen ytimen tapahtumapohjaiseen arkkitehtuuriin, lyhentäen transaktion käsittelyviiveen 800 millisekunnista 90 millisekuntiin.',
        'Vedin teknisen due diligencen 14 miljoonan euron B-sarjan rahoituskierrokselle; sijoittajat eivät nostaneet yhtään teknistä riskikohtaa.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Kungliga Tekniska Högskolan (KTH)',
      degree: 'Filosofian maisteri, tietotekniikka',
      location: 'Tukholma, Ruotsi',
      startDate: '2004',
      endDate: '2009',
      honors: '',
      coursework: 'Hajautetut järjestelmät, kryptografia, ohjelmistoarkkitehtuuri',
      grade: '',
    },
  ],
  certificates: [
    { name: 'AWS Certified Solutions Architect – Professional', issuer: 'Amazon Web Services', year: '2019', credentialUrl: '', expiry: '2025' },
    { name: 'CISSP – Certified Information Systems Security Professional', issuer: '(ISC)²', year: '2021', credentialUrl: '', expiry: '2027' },
  ],
})

export default { en, fi }
