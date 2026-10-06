import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: modern, modernOrange, quadrant.
const shared = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '0123456789',
  links: {
    linkedin: 'https://linkedin.example.com/in/john-doe',
    website: 'https://johndoe.example.com',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Marketing Manager',
  location: 'Vaasa, Finland',
  about:
    'Marketing manager with 10 years of building growth programs for retail brands, from content and SEO to paid media and loyalty. I measure everything I ship against a number, not a feeling.',
  skills: ['SEO', 'Content strategy', 'Paid media', 'Marketing analytics', 'Email marketing', 'Brand strategy', 'Team leadership'],
  experience: [
    {
      role: 'Marketing Manager',
      company: 'Example Oy',
      location: 'Vaasa, Finland',
      employmentType: 'Full-time',
      startDate: 'Apr 2020',
      endDate: '',
      isCurrent: true,
      description: 'Lead marketing strategy and a 5-person team across content, paid media, and lifecycle campaigns.',
      achievements: [
        'Grew organic traffic 85% in two years by rebuilding the content and SEO strategy from scratch.',
        'Managed a 450,000 EUR annual paid-media budget across 6 channels, improving ROAS from 2.1x to 3.4x.',
        'Built and led a 5-person marketing team, cutting campaign turnaround time from 3 weeks to 8 days.',
      ],
      technologies: [],
    },
    {
      role: 'Marketing Specialist',
      company: 'Example Oy',
      location: 'Vaasa, Finland',
      employmentType: 'Full-time',
      startDate: 'Jun 2016',
      endDate: 'Mar 2020',
      isCurrent: false,
      description: 'Ran email and lifecycle marketing for a regional retail chain.',
      achievements: [
        'Launched the company’s first email marketing program, growing the list to 40,000 subscribers.',
        'Ran A/B tests that lifted checkout-email click rate by 35%.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'M.Sc. Marketing',
      location: 'Vaasa, Finland',
      startDate: '2014',
      endDate: '2016',
      honors: '',
      coursework: 'Consumer behavior, Digital marketing, Brand strategy',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Content engine relaunch',
      description: 'Rebuilt the company blog and content calendar, publishing 3 times a week consistently.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Organic traffic grew 85% in two years.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Loyalty program launch',
      description: 'Designed and launched a tiered loyalty program for Example Oy’s 40,000 subscribers.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Repeat purchase rate rose 12%.',
      date: '2019',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  achievements: [
    { title: 'Marketer of the Year (regional), Vaasa Chamber of Commerce', description: 'Recognized for the organic-traffic turnaround campaign.', year: '2023' },
  ],
  certificates: [
    { name: 'Web Analytics Certification', issuer: 'Example Oy', year: '2021', credentialUrl: '', expiry: '' },
    { name: 'Content Marketing Certification', issuer: 'Example Oy', year: '2020', credentialUrl: '', expiry: '' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Markkinointipäällikkö',
  location: 'Vaasa',
  about:
    'Markkinointipäällikkö, jolla on 10 vuoden kokemus kasvuohjelmien rakentamisesta vähittäiskaupan brändeille sisällöstä ja hakukoneoptimoinnista maksettuun mediaan ja kanta-asiakkuuteen. Mittaan kaiken julkaisemani luvulla, ei fiiliksellä.',
  skills: ['Hakukoneoptimointi (SEO)', 'Sisältöstrategia', 'Maksettu media', 'Markkinoinnin analytiikka', 'Sähköpostimarkkinointi', 'Brändistrategia', 'Tiiminjohtaminen'],
  experience: [
    {
      role: 'Markkinointipäällikkö',
      company: 'Example Oy',
      location: 'Vaasa',
      employmentType: 'Full-time',
      startDate: '04/2020',
      endDate: '',
      isCurrent: true,
      description: 'Vastaan markkinointistrategiasta ja 5 hengen tiimistä sisällön, maksetun median ja elinkaarikampanjoiden osalta.',
      achievements: [
        'Kasvatin organista liikennettä 85 % kahdessa vuodessa rakentamalla sisältö- ja SEO-strategian uudelleen alusta.',
        'Vastasin 450 000 euron vuosittaisesta maksetun median budjetista 6 kanavalla, parantaen ROASia 2,1x:stä 3,4x:ään.',
        'Rakensin ja johdin 5 hengen markkinointitiimiä, lyhentäen kampanjoiden läpimenoajan 3 viikosta 8 päivään.',
      ],
      technologies: [],
    },
    {
      role: 'Markkinointiasiantuntija',
      company: 'Example Oy',
      location: 'Vaasa',
      employmentType: 'Full-time',
      startDate: '06/2016',
      endDate: '03/2020',
      isCurrent: false,
      description: 'Vastasin alueellisen vähittäiskauppaketjun sähköposti- ja elinkaarimarkkinoinnista.',
      achievements: [
        'Lanseerasin yrityksen ensimmäisen sähköpostimarkkinointiohjelman, kasvattaen listan 40 000 tilaajaan.',
        'Toteutin A/B-testejä, jotka nostivat kassavaiheen sähköpostien klikkausprosenttia 35 %.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'Kauppatieteiden maisteri, markkinointi',
      location: 'Vaasa',
      startDate: '2014',
      endDate: '2016',
      honors: '',
      coursework: 'Kuluttajakäyttäytyminen, digitaalinen markkinointi, brändistrategia',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Sisältömoottorin uudistus',
      description: 'Rakensin yrityksen blogin ja sisältökalenterin uudelleen, julkaisten tasaisesti 3 kertaa viikossa.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Organinen liikenne kasvoi 85 % kahdessa vuodessa.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Kanta-asiakasohjelman lanseeraus',
      description: 'Suunnittelin ja lanseerasin tasoihin perustuvan kanta-asiakasohjelman Example Oyin 40 000 tilaajalle.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Uusintaostojen osuus nousi 12 %.',
      date: '2019',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  achievements: [
    { title: 'Vuoden markkinoija (alueellinen), Vaasan kauppakamari', description: 'Tunnustus organisen liikenteen kääntämisestä kasvuun.', year: '2023' },
  ],
  certificates: [
    { name: 'Web Analytics Certification', issuer: 'Example Oy', year: '2021', credentialUrl: '', expiry: '' },
    { name: 'Content Marketing Certification', issuer: 'Example Oy', year: '2020', credentialUrl: '', expiry: '' },
  ],
})

export default { en, fi }
