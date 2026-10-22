import { buildExampleCv } from './buildExampleCv.js'

// Fictional person (1.6.40), the IT CV examples page's own full example.
// Listed under: minimal, compact.
const shared = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '0123456789',
  links: {
    linkedin: 'https://linkedin.example.com/in/john-doe',
    github: 'https://github.example.com/john-doe',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'IT Support Specialist',
  location: 'Tampere, Finland',
  about:
    'IT support specialist with 6 years on service desks for 300-900 users. I fix the problem in front of me, then fix whatever keeps causing it: most of my best work is tickets that stopped coming in.',
  skills: [
    'Microsoft 365 administration', 'Active Directory', 'Intune device management', 'Windows 10/11',
    'macOS', 'ITIL incident and request management', 'ServiceNow', 'PowerShell scripting',
    'Networking (DHCP, DNS, VPN)', 'Hardware troubleshooting',
  ],
  experience: [
    {
      role: 'IT Support Specialist (2nd line)',
      company: 'Example Oy',
      location: 'Tampere, Finland',
      employmentType: 'Full-time',
      startDate: 'Jan 2022',
      endDate: '',
      isCurrent: true,
      description: 'Second-line support for 900 users across three offices, plus device management and onboarding.',
      achievements: [
        'Cut average resolution time for second-line tickets from 48 to 6 hours by building a 120-article knowledge base and a triage checklist for first line.',
        'Automated password resets and new-starter accounts with PowerShell, removing about 35 tickets a week.',
        'Moved 450 laptops to Intune management in four months with no missed working days for users.',
      ],
      technologies: ['Microsoft 365', 'Intune', 'PowerShell'],
    },
    {
      role: 'Service Desk Analyst',
      company: 'Example Oy',
      location: 'Tampere, Finland',
      employmentType: 'Full-time',
      startDate: 'Aug 2019',
      endDate: 'Dec 2021',
      isCurrent: false,
      description: 'First-line phone, chat and walk-in support for 300 users.',
      achievements: [
        'Handled about 40 tickets a day at a 92% first-contact resolution rate.',
        'Wrote the step-by-step guides that halved repeat questions about VPN and printers.',
      ],
      technologies: ['ServiceNow', 'Active Directory'],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'Bachelor of Engineering, Information Technology',
      location: 'Tampere, Finland',
      startDate: '2015',
      endDate: '2019',
      honors: '',
      coursework: 'Networks, Operating systems, Service management',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Self-service password reset',
      description: 'A self-service reset flow with identity checks, replacing phone resets for most users.',
      stack: 'PowerShell, Microsoft 365',
      githubUrl: '',
      demoUrl: '',
      organization: 'Example Oy',
      impact: 'Removed about 25 calls a week from the service desk.',
      date: '2023',
      teamSize: '2',
      contribution: 'Wrote the scripts and the user guide.',
      image: '',
    },
    {
      name: 'Laptop setup checklist',
      description: 'A shared checklist and script for preparing new laptops, used by the whole support team.',
      stack: 'PowerShell, Intune',
      githubUrl: 'https://github.example.com/john-doe/laptop-setup',
      demoUrl: '',
      organization: '',
      impact: 'Cut setup time per laptop from 2 hours to 25 minutes.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'IT Support Fundamentals Certificate', issuer: 'Example Oy', year: '2024', credentialUrl: '', expiry: '2027' },
    { name: 'Certified Endpoint Administrator', issuer: 'Example Oy', year: '2025', credentialUrl: '', expiry: '2028' },
    { name: 'IT Service Management Foundation', issuer: 'Example Oy', year: '2021', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Swedish', level: 'Basic' },
  ],
  interests: [
    { name: 'Repairing old laptops' },
    { name: 'Home networking' },
    { name: 'Floorball' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'IT-tukihenkilö',
  location: 'Tampere',
  about:
    'IT-tukihenkilö, jolla on 6 vuoden kokemus 300–900 käyttäjän palvelupisteistä. Korjaan edessä olevan ongelman ja sen jälkeen sen, mikä sitä aiheuttaa: parhaat työni ovat tikettejä, jotka lakkasivat tulemasta.',
  skills: [
    'Microsoft 365 -ylläpito', 'Active Directory', 'Intune-laitehallinta', 'Windows 10/11',
    'macOS', 'ITIL-häiriön- ja palvelupyyntöjen hallinta', 'ServiceNow', 'PowerShell-skriptaus',
    'Verkot (DHCP, DNS, VPN)', 'Laitteiston vianetsintä',
  ],
  experience: [
    {
      role: 'IT-tukihenkilö (2. taso)',
      company: 'Example Oy',
      location: 'Tampere',
      employmentType: 'Full-time',
      startDate: '01/2022',
      endDate: '',
      isCurrent: true,
      description: 'Toisen tason tuki 900 käyttäjälle kolmessa toimipisteessä sekä laitehallinta ja uusien työntekijöiden aloitukset.',
      achievements: [
        'Lyhensin toisen tason tikettien keskimääräisen ratkaisuajan 48 tunnista 6 tuntiin rakentamalla 120 artikkelin tietopankin ja luokittelulistan ensimmäiselle tasolle.',
        'Automatisoin salasanojen nollaukset ja uusien tunnusten luonnin PowerShellillä, mikä poisti noin 35 tikettiä viikossa.',
        'Siirsin 450 kannettavaa Intune-hallintaan neljässä kuukaudessa ilman yhtään käyttäjien menetettyä työpäivää.',
      ],
      technologies: ['Microsoft 365', 'Intune', 'PowerShell'],
    },
    {
      role: 'Palvelupisteen asiantuntija',
      company: 'Example Oy',
      location: 'Tampere',
      employmentType: 'Full-time',
      startDate: '08/2019',
      endDate: '12/2021',
      isCurrent: false,
      description: 'Ensimmäisen tason puhelin-, chat- ja lähituki 300 käyttäjälle.',
      achievements: [
        'Käsittelin noin 40 tikettiä päivässä, ja niistä 92 % ratkesi ensimmäisellä yhteydenotolla.',
        'Kirjoitin vaiheittaiset ohjeet, jotka puolittivat VPN:ää ja tulostimia koskevat toistuvat kysymykset.',
      ],
      technologies: ['ServiceNow', 'Active Directory'],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'Insinööri (AMK), tieto- ja viestintätekniikka',
      location: 'Tampere',
      startDate: '2015',
      endDate: '2019',
      honors: '',
      coursework: 'Tietoverkot, käyttöjärjestelmät, palvelunhallinta',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Salasanan itsepalvelunollaus',
      description: 'Itsepalveluna toimiva salasanan nollaus henkilöllisyyden tarkistuksineen, joka korvasi useimpien käyttäjien puhelinnollaukset.',
      stack: 'PowerShell, Microsoft 365',
      githubUrl: '',
      demoUrl: '',
      organization: 'Example Oy',
      impact: 'Poisti palvelupisteeltä noin 25 puhelua viikossa.',
      date: '2023',
      teamSize: '2',
      contribution: 'Kirjoitin skriptit ja käyttöohjeen.',
      image: '',
    },
    {
      name: 'Kannettavien käyttöönoton tarkistuslista',
      description: 'Yhteinen tarkistuslista ja skripti uusien kannettavien valmisteluun, koko tukitiimin käytössä.',
      stack: 'PowerShell, Intune',
      githubUrl: 'https://github.example.com/john-doe/laptop-setup',
      demoUrl: '',
      organization: '',
      impact: 'Lyhensi kannettavan käyttöönoton 2 tunnista 25 minuuttiin.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'IT Support Fundamentals Certificate', issuer: 'Example Oy', year: '2024', credentialUrl: '', expiry: '2027' },
    { name: 'Certified Endpoint Administrator', issuer: 'Example Oy', year: '2025', credentialUrl: '', expiry: '2028' },
    { name: 'IT Service Management Foundation', issuer: 'Example Oy', year: '2021', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Suomi', level: 'Äidinkieli' },
    { language: 'Englanti', level: 'Sujuva' },
    { language: 'Ruotsi', level: 'Perustaso' },
  ],
  interests: [
    { name: 'Vanhojen kannettavien korjaaminen' },
    { name: 'Kotiverkot' },
    { name: 'Salibandy' },
  ],
})

export default { en, fi }
