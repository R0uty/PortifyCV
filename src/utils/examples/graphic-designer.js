import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: creative, colorfulCompact.
const shared = {
  fullName: 'Aleksi Hakkarainen',
  email: 'aleksi.hakkarainen@example.com',
  phone: '+358 40 000 1601',
  links: {
    linkedin: 'https://linkedin.com/in/example-ahakkarainen',
    behance: 'https://behance.net/example-ahakkarainen',
    portfolio: 'https://ahakkarainen.example.com',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Graphic Designer',
  location: 'Lahti, Finland',
  about:
    'Graphic designer with 10 years of brand identity and print work for retail and events clients. I like projects that need a system, not just a one-off poster.',
  skills: ['Adobe Illustrator', 'Adobe InDesign', 'Adobe Photoshop', 'Figma', 'Brand identity', 'Typography', 'Print production', 'Packaging design'],
  experience: [
    {
      role: 'Senior Graphic Designer',
      company: 'Kuvapaja Oy',
      location: 'Lahti, Finland',
      employmentType: 'Full-time',
      startDate: 'May 2019',
      endDate: '',
      isCurrent: true,
      description: 'Lead brand and campaign design for retail and consumer clients.',
      achievements: [
        'Led a rebrand for a 120-store retail chain, rolled out across packaging, signage, and e-commerce in 4 months.',
        'Designed a modular poster system reused across 25+ campaigns, cutting production time per campaign by 30%.',
        'Mentored 2 junior designers who now run their own client accounts.',
      ],
      technologies: ['Adobe Illustrator', 'Adobe InDesign', 'Figma'],
    },
    {
      role: 'Graphic Designer (Freelance)',
      company: 'Studio Kuusi',
      location: 'Lahti, Finland',
      employmentType: 'Freelance',
      startDate: 'Jan 2016',
      endDate: 'Apr 2019',
      isCurrent: false,
      description: 'Designed brand identities and marketing materials for small businesses.',
      achievements: [
        'Designed brand identities for 20+ small businesses, including logo, packaging, and social templates.',
        'Grew a client’s social engagement 3x with a redesigned visual template set.',
      ],
      technologies: ['Adobe Photoshop', 'Adobe Illustrator'],
    },
  ],
  education: [
    {
      school: 'Lahti University of Applied Sciences',
      degree: 'B.A. Graphic Design',
      location: 'Lahti, Finland',
      startDate: '2012',
      endDate: '2016',
      honors: '',
      coursework: 'Typography, Branding, Print production',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Kuvapaja rebrand toolkit',
      description: 'Modular brand toolkit (templates, icon set, grid system) used across 25+ campaigns.',
      stack: 'Illustrator, Figma',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Cut campaign production time by 30%.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Nordic Craft Market identity',
      description: 'Full visual identity for an annual craft fair, from logo to signage and merchandise.',
      stack: 'Illustrator, InDesign',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Fair attendance grew 22% year over year.',
      date: '2021',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Graafinen suunnittelija',
  location: 'Lahti',
  about:
    'Graafinen suunnittelija, jolla on 10 vuoden kokemus brändi-identiteetti- ja painotuotetyöstä vähittäiskaupan ja tapahtumien asiakkaille. Pidän projekteista, jotka vaativat järjestelmän, ei vain yksittäisen julisteen.',
  skills: ['Adobe Illustrator', 'Adobe InDesign', 'Adobe Photoshop', 'Figma', 'Brändi-identiteetti', 'Typografia', 'Painotuotanto', 'Pakkaussuunnittelu'],
  experience: [
    {
      role: 'Senior graafinen suunnittelija',
      company: 'Kuvapaja Oy',
      location: 'Lahti',
      employmentType: 'Full-time',
      startDate: '05/2019',
      endDate: '',
      isCurrent: true,
      description: 'Vastaan brändi- ja kampanjasuunnittelusta vähittäiskaupan ja kuluttaja-asiakkaille.',
      achievements: [
        'Johdin 120 myymälän ketjun brändiuudistuksen, joka julkaistiin pakkauksissa, opasteissa ja verkkokaupassa 4 kuukaudessa.',
        'Suunnittelin modulaarisen julistejärjestelmän, jota käytettiin yli 25 kampanjassa, lyhentäen tuotantoaikaa kampanjaa kohden 30 %.',
        'Mentoroin 2 junior-suunnittelijaa, jotka vetävät nyt omia asiakkuuksiaan.',
      ],
      technologies: ['Adobe Illustrator', 'Adobe InDesign', 'Figma'],
    },
    {
      role: 'Graafinen suunnittelija (freelancer)',
      company: 'Studio Kuusi',
      location: 'Lahti',
      employmentType: 'Freelance',
      startDate: '01/2016',
      endDate: '04/2019',
      isCurrent: false,
      description: 'Suunnittelin brändi-identiteettejä ja markkinointimateriaaleja pienyrityksille.',
      achievements: [
        'Suunnittelin brändi-identiteetit yli 20 pienyritykselle, mukaan lukien logo, pakkaukset ja sosiaalisen median mallit.',
        'Kasvatin asiakkaan sosiaalisen median sitoutumisen kolminkertaiseksi uudistetulla visuaalisella mallistolla.',
      ],
      technologies: ['Adobe Photoshop', 'Adobe Illustrator'],
    },
  ],
  education: [
    {
      school: 'Lahden ammattikorkeakoulu',
      degree: 'Medianomi (AMK), graafinen suunnittelu',
      location: 'Lahti',
      startDate: '2012',
      endDate: '2016',
      honors: '',
      coursework: 'Typografia, brändäys, painotuotanto',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Kuvapajan brändityökalupakki',
      description: 'Modulaarinen brändityökalupakki (mallit, ikonisto, ruudukkojärjestelmä), käytössä yli 25 kampanjassa.',
      stack: 'Illustrator, Figma',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Lyhensi kampanjoiden tuotantoaikaa 30 %.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Nordic Craft Market -ilme',
      description: 'Täysi visuaalinen ilme vuosittaiselle käsityömarkkinoille, logosta opasteisiin ja oheistuotteisiin.',
      stack: 'Illustrator, InDesign',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Markkinoiden kävijämäärä kasvoi 22 % vuodessa.',
      date: '2021',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
})

export default { en, fi }
