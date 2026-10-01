import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: minimal, european.
const shared = {
  fullName: 'Riikka Hämäläinen',
  email: 'riikka.hamalainen@example.com',
  phone: '+358 40 000 2401',
  links: {
    linkedin: 'https://linkedin.com/in/example-rhamalainen',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Registered Nurse',
  location: 'Rovaniemi, Finland',
  about:
    'Registered nurse with 9 years in acute and emergency care. I keep a calm floor during a surge by triaging early and over-communicating with the team, not by working faster alone.',
  skills: ['Emergency triage', 'Patient assessment', 'IV therapy', 'Electronic health records (EHR)', 'Wound care', 'Medication administration', 'Patient education', 'Infection control'],
  experience: [
    {
      role: 'Registered Nurse, Emergency Department',
      company: 'Lapland Central Hospital',
      location: 'Rovaniemi, Finland',
      employmentType: 'Full-time',
      startDate: 'Aug 2018',
      endDate: '',
      isCurrent: true,
      description: 'Provide emergency care in a department seeing roughly 90 patients a day.',
      achievements: [
        'Reduced average triage-to-treatment time from 38 minutes to 21 minutes by co-designing a fast-track lane for low-acuity cases.',
        'Trained 25+ new nursing staff on the department\'s triage protocol over 3 years.',
        'Maintained a patient satisfaction score above 4.6/5 across 4 consecutive annual surveys.',
      ],
      technologies: [],
    },
    {
      role: 'Staff Nurse, Medical Ward',
      company: 'Kemijoki Health Centre',
      location: 'Rovaniemi, Finland',
      employmentType: 'Full-time',
      startDate: 'Sep 2015',
      endDate: 'Jul 2018',
      isCurrent: false,
      description: 'Delivered inpatient care on a 24-bed general medical ward.',
      achievements: [
        'Cut medication administration errors to zero over 18 months by introducing a double-check checklist adopted ward-wide.',
        'Precepted 6 nursing students through their clinical placements.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Lapland University of Applied Sciences',
      degree: 'B.Sc. Nursing',
      location: 'Rovaniemi, Finland',
      startDate: '2011',
      endDate: '2015',
      honors: '',
      coursework: 'Acute care nursing, Pharmacology, Patient safety',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Emergency fast-track lane',
      description: 'Co-designed and piloted a fast-track lane for low-acuity emergency cases, run with 2 colleagues.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Lapland Central Hospital',
      impact: 'Triage-to-treatment time cut from 38 to 21 minutes.',
      date: '2022',
      teamSize: '3',
      contribution: 'Co-lead; ran the 6-week pilot and presented results to department management.',
      image: '',
    },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Swedish', level: 'Basic' },
  ],
  certificates: [
    { name: 'Advanced Cardiac Life Support (ACLS)', issuer: 'American Heart Association', year: '2023', credentialUrl: '', expiry: '2025' },
    { name: 'Registered Nurse License', issuer: 'Valvira (Finland)', year: '2015', credentialUrl: '', expiry: '' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Sairaanhoitaja',
  location: 'Rovaniemi',
  about:
    'Sairaanhoitaja, jolla on 9 vuoden kokemus akuutti- ja ensihoidosta. Pidän osaston rauhallisena ruuhka-aikana triagaamalla ajoissa ja viestimällä tiimille ylen, en työskentelemällä yksin nopeammin.',
  skills: ['Ensihoidon triage', 'Potilaan arviointi', 'Suonensisäinen hoito', 'Sähköinen potilaskertomus', 'Haavanhoito', 'Lääkehoito', 'Potilasohjaus', 'Infektioiden torjunta'],
  experience: [
    {
      role: 'Sairaanhoitaja, päivystys',
      company: 'Lapland Central Hospital',
      location: 'Rovaniemi',
      employmentType: 'Full-time',
      startDate: '08/2018',
      endDate: '',
      isCurrent: true,
      description: 'Annan ensihoitoa päivystyksessä, jossa käy noin 90 potilasta päivässä.',
      achievements: [
        'Lyhensin triagesta hoitoon kuluvan keskimääräisen ajan 38 minuutista 21 minuuttiin suunnittelemalla yhdessä nopean kaistan matalan kiireellisyyden tapauksille.',
        'Koulutin yli 25 uutta hoitajaa osaston triage-protokollaan 3 vuoden aikana.',
        'Pidin potilastyytyväisyyspisteet yli 4,6/5 neljässä peräkkäisessä vuosikyselyssä.',
      ],
      technologies: [],
    },
    {
      role: 'Sairaanhoitaja, sisätautiosasto',
      company: 'Kemijoki Health Centre',
      location: 'Rovaniemi',
      employmentType: 'Full-time',
      startDate: '09/2015',
      endDate: '07/2018',
      isCurrent: false,
      description: 'Vastasin vuodeosastohoidosta 24-paikkaisella sisätautiosastolla.',
      achievements: [
        'Vähensin lääkityspoikkeamat nollaan 18 kuukaudessa ottamalla käyttöön kaksoistarkistuslistan, jota käytetään koko osastolla.',
        'Ohjasin 6 hoitotyön opiskelijaa heidän harjoittelujaksoillaan.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Lapin ammattikorkeakoulu',
      degree: 'Sairaanhoitaja (AMK)',
      location: 'Rovaniemi',
      startDate: '2011',
      endDate: '2015',
      honors: '',
      coursework: 'Akuuttihoitotyö, farmakologia, potilasturvallisuus',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Päivystyksen nopea kaista',
      description: 'Suunnittelin ja pilotoin matalan kiireellisyyden tapausten nopean kaistan yhdessä 2 kollegan kanssa.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Lapland Central Hospital',
      impact: 'Triagesta hoitoon kuluva aika laski 38 minuutista 21 minuuttiin.',
      date: '2022',
      teamSize: '3',
      contribution: 'Yhteisvastaava; vedin 6 viikon pilotin ja esittelin tulokset osaston johdolle.',
      image: '',
    },
  ],
  languages: [
    { language: 'Suomi', level: 'Äidinkieli' },
    { language: 'Englanti', level: 'Sujuva' },
    { language: 'Ruotsi', level: 'Perustaso' },
  ],
  certificates: [
    { name: 'Advanced Cardiac Life Support (ACLS)', issuer: 'American Heart Association', year: '2023', credentialUrl: '', expiry: '2025' },
    { name: 'Sairaanhoitajan ammatinharjoittamisoikeus', issuer: 'Valvira', year: '2015', credentialUrl: '', expiry: '' },
  ],
})

export default { en, fi }
