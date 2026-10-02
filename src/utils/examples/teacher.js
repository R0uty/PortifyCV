import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: timeline, european.
const shared = {
  fullName: 'Kaisa Niemelä',
  email: 'kaisa.niemela@example.com',
  phone: '+358 40 000 2503',
  links: {
    linkedin: 'https://linkedin.com/in/example-kniemela',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Teacher',
  location: 'Seinäjoki, Finland',
  about:
    'Upper-secondary mathematics teacher with 16 years in the classroom and a track record of redesigning curriculum that actually raises exam results. I mentor trainee teachers and push for digital tools that save time, not add to it.',
  skills: [
    'Curriculum design', 'Classroom management', 'Differentiated instruction', 'Digital learning tools',
    'Assessment & grading', 'Mentoring & coaching', 'Public speaking', 'Wilma & Peda.net',
  ],
  experience: [
    {
      role: 'Senior Subject Teacher (Mathematics)',
      company: 'Seinäjoki Upper Secondary School',
      location: 'Seinäjoki, Finland',
      employmentType: 'Full-time',
      startDate: 'Aug 2015',
      endDate: '',
      isCurrent: true,
      description: 'Teach mathematics to upper-secondary students and lead curriculum development for the department.',
      achievements: [
        'Redesigned the math curriculum for 300+ students, raising the matriculation exam pass rate from 82% to 95%.',
        'Led a digital-learning pilot that was adopted by 12 teachers across the school.',
        'Mentored 6 trainee teachers through their teaching practicum.',
      ],
      technologies: [],
    },
    {
      role: 'Mathematics & Physics Teacher',
      company: 'Kyrönmaa School',
      location: 'Seinäjoki, Finland',
      employmentType: 'Full-time',
      startDate: 'Aug 2010',
      endDate: 'Jun 2015',
      isCurrent: false,
      description: 'Taught mathematics and physics to grades 7–9 and ran extracurricular activities.',
      achievements: [
        'Ran an after-school math club for 40 students that lifted their average grade by half a point.',
        'Introduced a peer-tutoring system that cut failing grades in grade 9 math from 15% to 5%.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'University of Helsinki',
      degree: 'M.Sc. Mathematics',
      location: 'Helsinki, Finland',
      startDate: '2005',
      endDate: '2010',
      honors: '',
      coursework: 'Algebra, Analysis, Statistics, Didactics of mathematics',
      grade: '',
    },
    {
      school: 'University of Helsinki',
      degree: 'Teacher Qualification (Pedagogical Studies)',
      location: 'Helsinki, Finland',
      startDate: '2010',
      endDate: '2011',
      honors: '',
      coursework: 'Pedagogy, Classroom practice, Educational psychology',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Digital learning pilot',
      description: 'Introduced tablet-based practice tools and automated feedback into the math curriculum for one grade level.',
      stack: 'Peda.net, Socrative',
      githubUrl: '',
      demoUrl: '',
      organization: 'Seinäjoki Upper Secondary School',
      impact: 'Adopted by 12 teachers; raised the pass rate from 82% to 95%.',
      date: '2021',
      teamSize: '12',
      contribution: 'Designed the pilot and trained the other teachers.',
      image: '',
    },
    {
      name: 'After-school math club',
      description: 'Weekly voluntary club for students struggling with or wanting to go further in mathematics.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Kyrönmaa School',
      impact: '40 regular students; average grade rose by half a point.',
      date: '2013',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'Special Needs Education Certificate (15 ECTS)', issuer: 'University of Helsinki', year: '2016', credentialUrl: '', expiry: '' },
    { name: 'Google Certified Educator, Level 2', issuer: 'Google for Education', year: '2021', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Swedish', level: 'Intermediate' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Opettaja',
  location: 'Seinäjoki',
  about:
    'Lukion matematiikan opettaja, jolla on 16 vuoden kokemus luokkahuoneesta ja näyttöjä opetussuunnitelman uudistamisesta niin, että tulokset todella paranevat. Ohjaan opettajaharjoittelijoita ja ajan digitaalisia työkaluja, jotka säästävät aikaa eivätkä lisäävät sitä.',
  skills: [
    'Opetussuunnitelmatyö', 'Luokanhallinta', 'Eriyttävä opetus', 'Digitaaliset oppimistyökalut',
    'Arviointi', 'Mentorointi ja valmennus', 'Esiintymistaidot', 'Wilma ja Peda.net',
  ],
  experience: [
    {
      role: 'Lehtori (matematiikka)',
      company: 'Seinäjoen lukio',
      location: 'Seinäjoki',
      employmentType: 'Full-time',
      startDate: '08/2015',
      endDate: '',
      isCurrent: true,
      description: 'Opetan matematiikkaa lukiolaisille ja vedän oppiaineryhmän opetussuunnitelmatyötä.',
      achievements: [
        'Uudistin yli 300 opiskelijan matematiikan opetussuunnitelman ja nostin ylioppilaskirjoitusten läpäisyprosentin 82 %:sta 95 %:iin.',
        'Vedin digitaalisen oppimisen pilotin, jonka otti käyttöön 12 opettajaa koulussa.',
        'Ohjasin 6 opettajaharjoittelijaa heidän opetusharjoittelunsa läpi.',
      ],
      technologies: [],
    },
    {
      role: 'Matematiikan ja fysiikan opettaja',
      company: 'Kyrönmaan koulu',
      location: 'Seinäjoki',
      employmentType: 'Full-time',
      startDate: '08/2010',
      endDate: '06/2015',
      isCurrent: false,
      description: 'Opetin matematiikkaa ja fysiikkaa yläkoulussa ja vedin koulun jälkeisiä kerhoja.',
      achievements: [
        'Vedin koulun jälkeistä matematiikkakerhoa 40 oppilaalle ja nostin heidän keskiarvoaan puolella numerolla.',
        'Otin käyttöön vertaistukiohjelman, joka laski 9. luokan matematiikan hylättyjen arvosanojen osuutta 15 %:sta 5 %:iin.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Helsingin yliopisto',
      degree: 'Filosofian maisteri, matematiikka',
      location: 'Helsinki',
      startDate: '2005',
      endDate: '2010',
      honors: '',
      coursework: 'Algebra, analyysi, tilastotiede, matematiikan didaktiikka',
      grade: '',
    },
    {
      school: 'Helsingin yliopisto',
      degree: 'Opettajan pedagogiset opinnot',
      location: 'Helsinki',
      startDate: '2010',
      endDate: '2011',
      honors: '',
      coursework: 'Pedagogiikka, opetusharjoittelu, kasvatuspsykologia',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Digitaalisen oppimisen pilotti',
      description: 'Otin käyttöön tablettipohjaiset harjoitustyökalut ja automaattisen palautteen yhdelle vuosikurssille.',
      stack: 'Peda.net, Socrative',
      githubUrl: '',
      demoUrl: '',
      organization: 'Seinäjoen lukio',
      impact: 'Käytössä 12 opettajalla; nosti läpäisyprosentin 82 %:sta 95 %:iin.',
      date: '2021',
      teamSize: '12',
      contribution: 'Suunnittelin pilotin ja koulutin muut opettajat.',
      image: '',
    },
    {
      name: 'Koulun jälkeinen matematiikkakerho',
      description: 'Viikoittainen vapaaehtoinen kerho oppilaille, jotka tarvitsivat tukea tai halusivat syventää matematiikan taitojaan.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Kyrönmaan koulu',
      impact: '40 vakio-oppilasta; keskiarvo nousi puolella numerolla.',
      date: '2013',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  certificates: [
    { name: 'Erityisopetuksen opinnot (15 op)', issuer: 'Helsingin yliopisto', year: '2016', credentialUrl: '', expiry: '' },
    { name: 'Google Certified Educator, Level 2', issuer: 'Google for Education', year: '2021', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Suomi', level: 'Äidinkieli' },
    { language: 'Englanti', level: 'Sujuva' },
    { language: 'Ruotsi', level: 'Keskitaso' },
  ],
})

export default { en, fi }
