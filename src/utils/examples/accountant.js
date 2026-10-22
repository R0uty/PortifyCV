import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: classicProfessional (minimal until 1.6.40).
const shared = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '0123456789',
  links: {
    linkedin: 'https://linkedin.example.com/in/john-doe',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Accountant',
  location: 'Kotka, Finland',
  about:
    'Accountant with 12 years in SME bookkeeping, tax compliance, and month-end close. I keep the books clean enough that audits are a formality, not a fire drill.',
  skills: [
    'Bookkeeping', 'VAT & tax compliance', 'Month-end close', 'Financial reporting (FAS/IFRS)',
    'Payroll processing', 'Excel & Power Query', 'Procountor & Netvisor', 'Internal controls',
  ],
  experience: [
    {
      role: 'Senior Accountant',
      company: 'Example Oy',
      location: 'Kotka, Finland',
      employmentType: 'Full-time',
      startDate: 'Jan 2019',
      endDate: '',
      isCurrent: true,
      description: 'Handle full-cycle bookkeeping and tax compliance for a portfolio of 45 SME client accounts.',
      achievements: [
        'Cut the monthly close from 10 days to 5 by automating reconciliations across all 45 client accounts.',
        'Managed VAT and tax filings for 60+ SME clients with zero late-filing penalties for 4 consecutive years.',
        'Trained 3 junior bookkeepers, cutting their onboarding time from 6 weeks to 3.',
      ],
      technologies: [],
    },
    {
      role: 'Accountant',
      company: 'Example Oy',
      location: 'Kotka, Finland',
      employmentType: 'Full-time',
      startDate: 'Jun 2014',
      endDate: 'Dec 2018',
      isCurrent: false,
      description: 'Processed payroll and invoicing for a mixed portfolio of client companies.',
      achievements: [
        'Processed monthly payroll for 220 employees across 8 client companies without a single error.',
        'Cut invoice processing time by 35% by introducing an automated matching tool.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'B.B.A. Accounting',
      location: 'Kotka, Finland',
      startDate: '2011',
      endDate: '2014',
      honors: '',
      coursework: 'Financial accounting, Taxation, Business law',
      grade: '',
    },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Swedish', level: 'Intermediate' },
  ],
  certificates: [
    { name: 'KLT – Certified Bookkeeper', issuer: 'Example Oy', year: '2017', credentialUrl: '', expiry: '' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Kirjanpitäjä',
  location: 'Kotka',
  about:
    'Kirjanpitäjä, jolla on 12 vuoden kokemus pk-yritysten kirjanpidosta, verotuksesta ja kuukausikatkojen tekemisestä. Pidän kirjat niin siistissä kunnossa, että tilintarkastukset ovat muodollisuus, ei sammutustyötä.',
  skills: [
    'Kirjanpito', 'ALV ja verotus', 'Kuukausikatkot', 'Talousraportointi (FAS/IFRS)',
    'Palkanlaskenta', 'Excel ja Power Query', 'Procountor ja Netvisor', 'Sisäinen valvonta',
  ],
  experience: [
    {
      role: 'Senior-kirjanpitäjä',
      company: 'Example Oy',
      location: 'Kotka',
      employmentType: 'Full-time',
      startDate: '01/2019',
      endDate: '',
      isCurrent: true,
      description: 'Vastaan 45 pk-yritysasiakkaan koko kirjanpitoprosessista ja verotuksesta.',
      achievements: [
        'Lyhensin kuukausikatkon 10 päivästä 5 päivään automatisoimalla täsmäytykset kaikille 45 asiakastilille.',
        'Hoidin ALV- ja veroilmoitukset 60+ pk-asiakkaalle ilman yhtään myöhästynyttä ilmoitusta neljänä peräkkäisenä vuonna.',
        'Koulutin 3 nuorempaa kirjanpitäjää ja lyhensin heidän perehdytysaikansa 6 viikosta 3 viikkoon.',
      ],
      technologies: [],
    },
    {
      role: 'Kirjanpitäjä',
      company: 'Example Oy',
      location: 'Kotka',
      employmentType: 'Full-time',
      startDate: '06/2014',
      endDate: '12/2018',
      isCurrent: false,
      description: 'Vastasin palkanlaskennasta ja laskutuksesta useille asiakasyrityksille.',
      achievements: [
        'Laskin kuukausittaisen palkanlaskennan 220 työntekijälle 8 asiakasyrityksessä ilman virheitä.',
        'Lyhensin laskujen käsittelyaikaa 35 % ottamalla käyttöön automaattisen täsmäytystyökalun.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'Tradenomi (AMK), laskentatoimi',
      location: 'Kotka',
      startDate: '2011',
      endDate: '2014',
      honors: '',
      coursework: 'Kirjanpito, verotus, yritysjuridiikka',
      grade: '',
    },
  ],
  languages: [
    { language: 'Suomi', level: 'Äidinkieli' },
    { language: 'Englanti', level: 'Sujuva' },
    { language: 'Ruotsi', level: 'Keskitaso' },
  ],
  certificates: [
    { name: 'KLT – Kirjanpidon ja laskentatoimen tutkinto', issuer: 'Example Oy', year: '2017', credentialUrl: '', expiry: '' },
  ],
})

export default { en, fi }
