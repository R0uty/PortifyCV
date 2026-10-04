import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: developer, graduate. Stress case: thin
// experience — one part-time/summer role plus one internship, no full-time job.
const shared = {
  fullName: 'Joonas Mäkelä',
  email: 'joonas.makela@example.com',
  phone: '+358 40 000 1401',
  links: {
    github: 'https://github.com/example-jmakela',
    linkedin: 'https://linkedin.com/in/example-jmakela',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Junior Developer',
  location: 'Jyväskylä, Finland',
  about:
    'Recent computer science graduate looking for my first full-time developer role. I taught myself React and Node.js through personal projects, and a summer job and internship gave me a taste of working in a real codebase.',
  skills: ['JavaScript', 'React', 'Node.js', 'HTML & CSS', 'SQL', 'Git'],
  experience: [
    {
      role: 'Junior Developer (Summer)',
      company: 'CodeCamp Jyväskylä',
      location: 'Jyväskylä, Finland',
      employmentType: 'Part-time',
      startDate: 'Jun 2023',
      endDate: 'Aug 2023',
      isCurrent: false,
      description: "Summer role on a 6-person team maintaining the company's internal coding-course platform.",
      achievements: [
        'Built a small internal tool that automated weekly report generation, saving the team about 3 hours a week.',
        'Fixed 25+ bugs in the ticket queue during the 3-month placement.',
      ],
      technologies: ['JavaScript', 'React'],
    },
  ],
  internships: [
    {
      role: 'Software Engineering Intern',
      company: 'Vaaka Software',
      location: 'Jyväskylä, Finland',
      startDate: 'Jan 2024',
      endDate: 'Apr 2024',
      description: 'Worked with a 4-person team building features for an internal inventory tool, under a senior developer’s review.',
      technologies: 'React, Node.js, PostgreSQL',
    },
  ],
  education: [
    {
      school: 'University of Jyväskylä',
      degree: 'B.Sc. Computer Science',
      location: 'Jyväskylä, Finland',
      startDate: '2021',
      endDate: '2024',
      honors: '',
      coursework: 'Web development, Data structures, Databases',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'habit-tracker-cli',
      description: 'Command-line habit tracker with local SQLite storage, built to learn Node.js.',
      stack: 'Node.js, SQLite',
      githubUrl: 'https://github.com/example-jmakela/habit-tracker-cli',
      demoUrl: '',
      organization: '',
      impact: '40+ GitHub stars.',
      date: '2024',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Campus bus times widget',
      description: 'Small React widget showing live bus departures for the university campus.',
      stack: 'React, Public transport API',
      githubUrl: '',
      demoUrl: 'https://bus.jmakela.example.com',
      organization: '',
      impact: 'Used by about 150 students weekly.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  achievements: [
    { title: '1st place, Jyväskylä Student Hackathon', description: 'Built a campus bus-tracking widget with a 3-person team in 24 hours.', year: '2023' },
  ],
  openSource: [
    { name: 'Node.js', description: 'Fixed a documentation example that did not compile in the stream API guide.', language: 'JavaScript', stars: '108k', forks: '29k', url: 'https://github.com/nodejs/node' },
  ],
  publications: [
    { title: 'What I learned building my first CLI tool', publisher: 'dev.to', year: '2024', url: 'https://dev.to/example-jmakela' },
  ],
  volunteering: [
    { organization: 'Jyväskylä Code Club', role: 'Volunteer mentor', description: 'Taught basic HTML and CSS to teenagers at a weekly after-school coding club.' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Juniorikehittäjä',
  location: 'Jyväskylä',
  about:
    'Vastavalmistunut tietojenkäsittelytieteen opiskelija, etsin ensimmäistä kokoaikaista kehittäjän paikkaa. Opin Reactia ja Node.js:ää itse omien projektien kautta, ja kesätyö sekä harjoittelu antoivat maistiaisen oikean koodikannan parissa työskentelystä.',
  skills: ['JavaScript', 'React', 'Node.js', 'HTML ja CSS', 'SQL', 'Git'],
  experience: [
    {
      role: 'Juniorikehittäjä (kesätyö)',
      company: 'CodeCamp Jyväskylä',
      location: 'Jyväskylä',
      employmentType: 'Part-time',
      startDate: '06/2023',
      endDate: '08/2023',
      isCurrent: false,
      description: 'Kesätyö 6 hengen tiimissä, joka ylläpitää yrityksen sisäistä koodauskurssialustaa.',
      achievements: [
        'Rakensin pienen sisäisen työkalun, joka automatisoi viikkoraporttien laadinnan ja säästi tiimiltä noin 3 tuntia viikossa.',
        'Korjasin yli 25 virhettä tiketöintijärjestelmässä kolmen kuukauden harjoittelun aikana.',
      ],
      technologies: ['JavaScript', 'React'],
    },
  ],
  internships: [
    {
      role: 'Ohjelmistoharjoittelija',
      company: 'Vaaka Software',
      location: 'Jyväskylä',
      startDate: '01/2024',
      endDate: '04/2024',
      description: 'Työskentelin 4 hengen tiimissä sisäisen varastonhallintatyökalun ominaisuuksien parissa senior-kehittäjän ohjauksessa.',
      technologies: 'React, Node.js, PostgreSQL',
    },
  ],
  education: [
    {
      school: 'Jyväskylän yliopisto',
      degree: 'Luonnontieteiden kandidaatti, tietojenkäsittelytiede',
      location: 'Jyväskylä',
      startDate: '2021',
      endDate: '2024',
      honors: '',
      coursework: 'Web-kehitys, tietorakenteet, tietokannat',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'habit-tracker-cli',
      description: 'Komentorivipohjainen tapaseurantatyökalu paikallisella SQLite-tallennuksella, rakennettu Node.js:n oppimiseksi.',
      stack: 'Node.js, SQLite',
      githubUrl: 'https://github.com/example-jmakela/habit-tracker-cli',
      demoUrl: '',
      organization: '',
      impact: 'Yli 40 tähteä GitHubissa.',
      date: '2024',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Kampuksen bussiaikataulu-widget',
      description: 'Pieni React-widgetti, joka näyttää yliopiston kampuksen bussien lähtöajat reaaliajassa.',
      stack: 'React, joukkoliikenteen API',
      githubUrl: '',
      demoUrl: 'https://bus.jmakela.example.com',
      organization: '',
      impact: 'Noin 150 opiskelijaa käyttää viikoittain.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  achievements: [
    { title: '1. sija, Jyväskylän opiskelijahackathon', description: 'Rakensin kampuksen bussiwidgetin 3 hengen tiimissä 24 tunnissa.', year: '2023' },
  ],
  openSource: [
    { name: 'Node.js', description: 'Korjasin dokumentaatioesimerkin, joka ei kääntynyt stream-API-oppaassa.', language: 'JavaScript', stars: '108k', forks: '29k', url: 'https://github.com/nodejs/node' },
  ],
  publications: [
    { title: 'Mitä opin rakentaessani ensimmäisen CLI-työkaluni', publisher: 'dev.to', year: '2024', url: 'https://dev.to/example-jmakela' },
  ],
  volunteering: [
    { organization: 'Jyväskylän Code Club', role: 'Vapaaehtoinen mentori', description: 'Opetin teini-ikäisille HTML:n ja CSS:n perusteita viikoittaisessa koulun jälkeisessä koodauskerhossa.' },
  ],
})

export default { en, fi }
