import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: classicProfessional, navyProfessional, editorial.
// Lives abroad (Netherlands), after a PhD and postdoc in Finland.
const shared = {
  fullName: 'Elisa Rantala',
  email: 'elisa.rantala@example.com',
  phone: '+358 40 000 2505',
  links: {
    scholar: 'https://scholar.example.com/citations?user=example-erantala',
    linkedin: 'https://linkedin.com/in/example-erantala',
    researchGate: 'https://researchgate.example.com/profile/example-erantala',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Research Scientist',
  location: 'Delft, Netherlands',
  about:
    'Research scientist in battery materials with 8 years in solid-state electrolytes and electrode coatings. I lead small teams that publish and that get their findings into products, not just journals.',
  skills: [
    'Materials characterization', 'Battery electrochemistry', 'XRD/SEM/TEM', 'Scientific writing',
    'Grant writing', 'Python & MATLAB data analysis', 'Team leadership', 'Peer review',
  ],
  experience: [
    {
      role: 'Senior Research Scientist',
      company: 'Delft Materials Institute',
      location: 'Delft, Netherlands',
      employmentType: 'Full-time',
      startDate: 'Sep 2020',
      endDate: '',
      isCurrent: true,
      description: 'Lead a 6-person team developing solid-state battery electrolytes for next-generation cells.',
      achievements: [
        'Led a 6-person team that improved ionic conductivity of a solid-state electrolyte by 3x over the baseline material.',
        'Published 14 peer-reviewed papers and secured 2.1 million EUR in competitive research grants since joining.',
        'Supervised 5 PhD students and 3 postdocs through thesis and project completion.',
      ],
      technologies: [],
    },
    {
      role: 'Postdoctoral Researcher',
      company: 'Nordic Battery Materials Lab',
      location: 'Espoo, Finland',
      employmentType: 'Full-time',
      startDate: 'Jan 2017',
      endDate: 'Aug 2020',
      isCurrent: false,
      description: 'Researched electrode coating processes to improve battery cycle life.',
      achievements: [
        'Developed a novel electrode coating process that increased battery cycle life by 40% over 500 charge cycles.',
        'Co-authored 9 publications cited over 300 times combined.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Aalto University',
      degree: 'D.Sc. (Tech.) Materials Science',
      location: 'Espoo, Finland',
      startDate: '2013',
      endDate: '2017',
      honors: '',
      coursework: 'Electrochemistry, Solid-state materials, Research methods',
      grade: '',
    },
    {
      school: 'Helsinki University of Technology',
      degree: 'M.Sc. (Tech.) Materials Science',
      location: 'Espoo, Finland',
      startDate: '2005',
      endDate: '2010',
      honors: '',
      coursework: 'Materials engineering, Physical chemistry, Thermodynamics',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Solid-state electrolyte scale-up',
      description: 'Took a lab-scale solid-state electrolyte formulation to a pilot-line process for an industry partner.',
      stack: 'XRD, SEM, Python',
      githubUrl: '',
      demoUrl: '',
      organization: 'Delft Materials Institute',
      impact: 'Ionic conductivity improved 3x; adopted by 1 industry partner for pilot cells.',
      date: '2023',
      teamSize: '6',
      contribution: 'Principal investigator; designed the experimental program.',
      image: '',
    },
  ],
  publications: [
    { title: 'High-conductivity solid-state electrolytes via sulfide doping', publisher: 'Journal of Materials Chemistry (example)', year: '2023', url: 'https://example.com/doi/10.0000/jmat-2023-0147' },
    { title: 'Electrode coating strategies for extended battery cycle life', publisher: 'Energy Storage Materials (example)', year: '2019', url: 'https://example.com/doi/10.0000/esm-2019-0098' },
  ],
  certificates: [
    { name: 'EU Horizon Grant Writing Certificate', issuer: 'European Research Council Academy', year: '2021', credentialUrl: '', expiry: '' },
    { name: 'Battery Safety & Handling (UN38.3)', issuer: 'TÜV Rheinland', year: '2019', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Dutch', level: 'Basic' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Tutkija',
  location: 'Delft, Alankomaat',
  about:
    'Akkumateriaalien tutkija, jolla on 8 vuoden kokemus kiinteän olomuodon elektrolyyteistä ja elektrodipinnoitteista. Johdan pieniä tiimejä, jotka julkaisevat ja saavat löydöksensä myös tuotteisiin, ei vain lehtiin.',
  skills: [
    'Materiaalikarakterisointi', 'Akkujen sähkökemia', 'XRD/SEM/TEM', 'Tieteellinen kirjoittaminen',
    'Rahoitushakemukset', 'Python- ja MATLAB-data-analyysi', 'Tiiminjohtaminen', 'Vertaisarviointi',
  ],
  experience: [
    {
      role: 'Senior-tutkija',
      company: 'Delft Materials Institute',
      location: 'Delft, Alankomaat',
      employmentType: 'Full-time',
      startDate: '09/2020',
      endDate: '',
      isCurrent: true,
      description: 'Johdan 6 hengen tiimiä, joka kehittää kiinteän olomuodon akkuelektrolyyttejä seuraavan sukupolven kennoihin.',
      achievements: [
        'Johdin 6 hengen tiimiä, joka paransi kiinteän olomuodon elektrolyytin ionijohtavuutta 3-kertaiseksi perusmateriaaliin verrattuna.',
        'Julkaisin 14 vertaisarvioitua artikkelia ja hankin 2,1 miljoonaa euroa kilpailtua tutkimusrahoitusta liittymisen jälkeen.',
        'Ohjasin 5 tohtorikoulutettavaa ja 3 tutkijatohtoria väitöskirjan ja projektin loppuun.',
      ],
      technologies: [],
    },
    {
      role: 'Tutkijatohtori',
      company: 'Nordic Battery Materials Lab',
      location: 'Espoo',
      employmentType: 'Full-time',
      startDate: '01/2017',
      endDate: '08/2020',
      isCurrent: false,
      description: 'Tutkin elektrodipinnoitusprosesseja akkujen kestoiän parantamiseksi.',
      achievements: [
        'Kehitin uuden elektrodipinnoitusprosessin, joka kasvatti akun kestoikää 40 % 500 latauskerran yli.',
        'Olin mukana kirjoittamassa 9 julkaisua, joihin on viitattu yhteensä yli 300 kertaa.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Aalto-yliopisto',
      degree: 'Tekniikan tohtori (TkT), materiaalitekniikka',
      location: 'Espoo',
      startDate: '2013',
      endDate: '2017',
      honors: '',
      coursework: 'Sähkökemia, kiinteän olomuodon materiaalit, tutkimusmenetelmät',
      grade: '',
    },
    {
      school: 'Teknillinen korkeakoulu',
      degree: 'Diplomi-insinööri (DI), materiaalitekniikka',
      location: 'Espoo',
      startDate: '2005',
      endDate: '2010',
      honors: '',
      coursework: 'Materiaalitekniikka, fysikaalinen kemia, termodynamiikka',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'Kiinteän olomuodon elektrolyytin skaalaus',
      description: 'Vein laboratoriomittakaavan kiinteän olomuodon elektrolyyttiformulaation pilottilinjan prosessiksi teollisuuskumppanille.',
      stack: 'XRD, SEM, Python',
      githubUrl: '',
      demoUrl: '',
      organization: 'Delft Materials Institute',
      impact: 'Ionijohtavuus parani 3-kertaiseksi; käytössä 1 teollisuuskumppanin pilottikennoissa.',
      date: '2023',
      teamSize: '6',
      contribution: 'Vastuullinen tutkija; suunnittelin koeohjelman.',
      image: '',
    },
  ],
  publications: [
    { title: 'Korkean johtavuuden kiinteän olomuodon elektrolyytit sulfidiseostuksella', publisher: 'Journal of Materials Chemistry (esimerkki)', year: '2023', url: 'https://example.com/doi/10.0000/jmat-2023-0147' },
    { title: 'Elektrodien pinnoitusstrategiat akun kestoiän pidentämiseksi', publisher: 'Energy Storage Materials (esimerkki)', year: '2019', url: 'https://example.com/doi/10.0000/esm-2019-0098' },
  ],
  certificates: [
    { name: 'EU Horizon -rahoitushakemuskoulutus', issuer: 'European Research Council Academy', year: '2021', credentialUrl: '', expiry: '' },
    { name: 'Akkujen turvallinen käsittely (UN38.3)', issuer: 'TÜV Rheinland', year: '2019', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Suomi', level: 'Äidinkieli' },
    { language: 'Englanti', level: 'Sujuva' },
    { language: 'Hollanti', level: 'Perustaso' },
  ],
})

export default { en, fi }
