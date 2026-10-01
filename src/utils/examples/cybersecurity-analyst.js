import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: minimal, compact.
const shared = {
  fullName: 'Antti Salminen',
  email: 'antti.salminen@example.com',
  phone: '+358 40 000 2502',
  links: {
    linkedin: 'https://linkedin.com/in/example-asalminen',
    github: 'https://github.com/example-asalminen',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Cybersecurity Analyst',
  location: 'Lappeenranta, Finland',
  about:
    'Cybersecurity analyst with 8 years in SOC operations, incident response, and vulnerability management. I turn noisy alert queues into detections people actually trust.',
  skills: [
    'SIEM (Splunk)', 'Incident response', 'Vulnerability management', 'Network security',
    'Threat intelligence', 'SOC operations', 'Python scripting', 'Firewall/IDS/IPS', 'Cloud security (AWS)',
  ],
  experience: [
    {
      role: 'Senior Cybersecurity Analyst',
      company: 'Rajavalli Security',
      location: 'Lappeenranta, Finland',
      employmentType: 'Full-time',
      startDate: 'Mar 2021',
      endDate: '',
      isCurrent: true,
      description: 'Lead SOC monitoring and incident response for 1,200 monitored endpoints across 20 client accounts.',
      achievements: [
        'Led incident response for 50+ security incidents a year, cutting mean containment time from 6 hours to 90 minutes.',
        'Built a Splunk detection ruleset that cut false positives by 60% across 1,200 monitored endpoints.',
        'Ran a phishing-simulation program across 900 employees, cutting the click-through rate from 18% to 4%.',
      ],
      technologies: ['Splunk', 'Python'],
    },
    {
      role: 'Security Operations Analyst',
      company: 'Itäportti IT Services',
      location: 'Lappeenranta, Finland',
      employmentType: 'Full-time',
      startDate: 'Aug 2017',
      endDate: 'Feb 2021',
      isCurrent: false,
      description: 'Monitored and triaged security alerts for 15 client networks.',
      achievements: [
        'Triaged 200+ security alerts a week across 15 client networks.',
        'Patched vulnerabilities across 300 servers, cutting outstanding critical CVEs from 40 to under 5 a month.',
      ],
      technologies: ['Nessus'],
    },
  ],
  education: [
    {
      school: 'Lappeenranta University of Technology',
      degree: 'B.Sc. Information Technology (Cybersecurity)',
      location: 'Lappeenranta, Finland',
      startDate: '2013',
      endDate: '2017',
      honors: '',
      coursework: 'Network security, Cryptography, Secure software development',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Home-lab SOC',
      description: 'Personal detection lab built on an ELK stack to practice building and tuning SIEM detections outside work.',
      stack: 'Elasticsearch, Logstash, Kibana, Suricata',
      githubUrl: 'https://github.com/example-asalminen/home-lab-soc',
      demoUrl: '',
      organization: '',
      impact: 'Used to prototype 12 detection rules before they went into production at work.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Phishing simulation toolkit',
      description: 'Internal tool for running and scoring phishing-awareness campaigns across the client base.',
      stack: 'Python, GoPhish',
      githubUrl: '',
      demoUrl: '',
      organization: 'Rajavalli Security',
      impact: 'Rolled out to 900 employees across 5 client companies.',
      date: '2023',
      teamSize: '2',
      contribution: 'Built the scoring and reporting backend.',
      image: '',
    },
  ],
  certificates: [
    { name: 'CompTIA Security+', issuer: 'CompTIA', year: '2018', credentialUrl: '', expiry: '' },
    { name: 'Splunk Core Certified Power User', issuer: 'Splunk', year: '2021', credentialUrl: '', expiry: '' },
    { name: 'OSCP – Offensive Security Certified Professional', issuer: 'Offensive Security', year: '2023', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
  ],
  interests: [
    { name: 'Capture the flag competitions' },
    { name: 'Home-lab tinkering' },
    { name: 'Running' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Kyberturvallisuusanalyytikko',
  location: 'Lappeenranta',
  about:
    'Kyberturvallisuusanalyytikko, jolla on 8 vuoden kokemus SOC-toiminnasta, häiriötilanteiden hoidosta ja haavoittuvuuksien hallinnasta. Muutan meluisat hälytysjonot havainnoiksi, joihin ihmiset oikeasti luottavat.',
  skills: [
    'SIEM (Splunk)', 'Häiriötilanteiden hoito', 'Haavoittuvuuksien hallinta', 'Verkkoturvallisuus',
    'Uhkatiedustelu', 'SOC-toiminta', 'Python-skriptaus', 'Palomuurit/IDS/IPS', 'Pilviturvallisuus (AWS)',
  ],
  experience: [
    {
      role: 'Senior-kyberturvallisuusanalyytikko',
      company: 'Rajavalli Security',
      location: 'Lappeenranta',
      employmentType: 'Full-time',
      startDate: '03/2021',
      endDate: '',
      isCurrent: true,
      description: 'Vastaan SOC-valvonnasta ja häiriötilanteiden hoidosta 1 200 valvotulle päätelaitteelle 20 asiakastilillä.',
      achievements: [
        'Johdin yli 50 tietoturvahäiriön vuosittaisen hoidon ja lyhensin rajaamisajan 6 tunnista 90 minuuttiin.',
        'Rakensin Splunk-havaintosäännöstön, joka vähensi vääriä hälytyksiä 60 % 1 200 valvotulla päätelaitteella.',
        'Vedin tietojenkalastelusimulaatio-ohjelman 900 työntekijälle ja laskin klikkausprosentin 18 %:sta 4 %:iin.',
      ],
      technologies: ['Splunk', 'Python'],
    },
    {
      role: 'Security Operations -analyytikko',
      company: 'Itäportti IT Services',
      location: 'Lappeenranta',
      employmentType: 'Full-time',
      startDate: '08/2017',
      endDate: '02/2021',
      isCurrent: false,
      description: 'Valvoin ja luokittelin tietoturvahälytyksiä 15 asiakasverkolle.',
      achievements: [
        'Luokittelin yli 200 tietoturvahälytystä viikossa 15 asiakasverkolle.',
        'Paikkasin haavoittuvuuksia 300 palvelimella ja laskin avoimet kriittiset CVE:t 40:stä alle 5:een kuukaudessa.',
      ],
      technologies: ['Nessus'],
    },
  ],
  education: [
    {
      school: 'Lappeenrannan teknillinen yliopisto',
      degree: 'Tekniikan kandidaatti, tietotekniikka (kyberturvallisuus)',
      location: 'Lappeenranta',
      startDate: '2013',
      endDate: '2017',
      honors: '',
      coursework: 'Verkkoturvallisuus, kryptografia, turvallinen ohjelmistokehitys',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Kotilabra-SOC',
      description: 'Henkilökohtainen havaintolaboratorio ELK-pinolla, jolla harjoittelin SIEM-havaintojen rakentamista ja viritystä työn ulkopuolella.',
      stack: 'Elasticsearch, Logstash, Kibana, Suricata',
      githubUrl: 'https://github.com/example-asalminen/home-lab-soc',
      demoUrl: '',
      organization: '',
      impact: 'Käytetty 12 havaintosäännön prototypointiin ennen tuotantoon viemistä.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Tietojenkalastelusimulaation työkalu',
      description: 'Sisäinen työkalu tietoturvatietoisuuskampanjoiden ajamiseen ja pisteyttämiseen asiakaskunnassa.',
      stack: 'Python, GoPhish',
      githubUrl: '',
      demoUrl: '',
      organization: 'Rajavalli Security',
      impact: 'Käytössä 900 työntekijälle 5 asiakasyrityksessä.',
      date: '2023',
      teamSize: '2',
      contribution: 'Rakensin pisteytys- ja raportointijärjestelmän taustan.',
      image: '',
    },
  ],
  certificates: [
    { name: 'CompTIA Security+', issuer: 'CompTIA', year: '2018', credentialUrl: '', expiry: '' },
    { name: 'Splunk Core Certified Power User', issuer: 'Splunk', year: '2021', credentialUrl: '', expiry: '' },
    { name: 'OSCP – Offensive Security Certified Professional', issuer: 'Offensive Security', year: '2023', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Suomi', level: 'Äidinkieli' },
    { language: 'Englanti', level: 'Sujuva' },
  ],
  interests: [
    { name: 'Capture the flag -kilpailut' },
    { name: 'Kotilaboratoriot' },
    { name: 'Juoksu' },
  ],
})

export default { en, fi }
