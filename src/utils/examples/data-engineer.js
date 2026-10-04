import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: developer, compact. Stress case: 20+ skills.
const shared = {
  fullName: 'Elina Virtanen',
  email: 'elina.virtanen@example.com',
  phone: '+358 40 000 1301',
  links: {
    github: 'https://github.com/example-evirtanen',
    linkedin: 'https://linkedin.com/in/example-evirtanen',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Data Engineer',
  location: 'Oulu, Finland',
  about:
    'Data engineer with 8 years of building and operating pipelines that keep analytics and ML teams fed with trustworthy data. I favor boring, observable infrastructure over clever one-offs.',
  skills: [
    'Python', 'SQL', 'Apache Airflow', 'Apache Spark', 'dbt', 'Snowflake', 'AWS (S3, Glue, Redshift)',
    'Kafka', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Data modeling', 'ETL/ELT pipelines',
    'Data warehousing', 'Great Expectations', 'Airbyte', 'PostgreSQL', 'Scala', 'Git', 'Linux', 'Data governance',
  ],
  experience: [
    {
      role: 'Senior Data Engineer',
      company: 'Arcticom Data Oy',
      location: 'Oulu, Finland',
      employmentType: 'Full-time',
      startDate: 'Jan 2021',
      endDate: '',
      isCurrent: true,
      description: 'Build and operate the data platform powering real-time analytics for 15 industrial clients.',
      achievements: [
        'Redesigned the ingestion pipeline with Kafka and Spark, cutting end-to-end latency from 45 minutes to under 3 minutes.',
        'Migrated 40+ legacy batch jobs to Airflow and dbt, reducing pipeline failures by 65%.',
        'Built a data-quality framework with Great Expectations that catches roughly 98% of schema issues before they reach production.',
      ],
      technologies: ['Python', 'Apache Airflow', 'Apache Spark'],
    },
    {
      role: 'Data Engineer',
      company: 'Polarnet Analytics',
      location: 'Helsinki, Finland',
      employmentType: 'Full-time',
      startDate: 'Jun 2018',
      endDate: 'Dec 2020',
      isCurrent: false,
      description: "Owned the ETL pipelines feeding the company's marketing analytics warehouse.",
      achievements: [
        'Rebuilt the nightly ETL suite in dbt, cutting runtime from 6 hours to 50 minutes.',
        'Introduced automated data tests that cut data-quality incidents reported by analysts by 80%.',
      ],
      technologies: ['SQL', 'Python', 'Snowflake'],
    },
  ],
  education: [
    {
      school: 'University of Oulu',
      degree: 'M.Sc. Computer Science',
      location: 'Oulu, Finland',
      startDate: '2016',
      endDate: '2018',
      honors: '',
      coursework: 'Distributed systems, Databases, Machine learning',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'realtime-pipeline-metrics',
      description: 'Open-source Grafana dashboard templates for monitoring Airflow and Spark pipeline health, used by 15+ teams.',
      stack: 'Python, Grafana, Prometheus',
      githubUrl: 'https://github.com/example-evirtanen/realtime-pipeline-metrics',
      demoUrl: '',
      organization: '',
      impact: 'Adopted by 15+ data teams.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Weather anomaly detector',
      description: 'Streaming pipeline that flags anomalous sensor readings from 200 weather stations within seconds.',
      stack: 'Kafka, Spark Streaming, Python',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Processes 2 million events per day.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  achievements: [
    { title: 'Speaker, Data Engineering Nordics 2023', description: 'Talk: "Taming late-arriving data".', year: '2023' },
  ],
  openSource: [
    { name: 'Apache Airflow', description: 'Fixed a race condition in the Kubernetes executor task cleanup.', language: 'Python', stars: '37k', forks: '15k', url: 'https://github.com/apache/airflow' },
  ],
  publications: [
    { title: 'Cutting pipeline latency without rewriting everything', publisher: 'dev.to', year: '2023', url: 'https://dev.to/example-evirtanen' },
  ],
  certificates: [
    { name: 'AWS Certified Data Analytics – Specialty', issuer: 'Amazon Web Services', year: '2022', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
  ],
  interests: [
    { name: 'Orienteering' },
    { name: 'Home automation' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Data Engineer',
  location: 'Oulu',
  about:
    'Data engineer, jolla on 8 vuoden kokemus putkistojen rakentamisesta ja ylläpidosta, jotka pitävät analytiikka- ja ML-tiimit luotettavan datan varassa. Suosin tylsää, tarkkailtavaa infraa näppärien kertaratkaisujen sijaan.',
  skills: [
    'Python', 'SQL', 'Apache Airflow', 'Apache Spark', 'dbt', 'Snowflake', 'AWS (S3, Glue, Redshift)',
    'Kafka', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Tietomallinnus', 'ETL/ELT-putket',
    'Tietovarastointi', 'Great Expectations', 'Airbyte', 'PostgreSQL', 'Scala', 'Git', 'Linux', 'Tiedonhallinta',
  ],
  experience: [
    {
      role: 'Senior Data Engineer',
      company: 'Arcticom Data Oy',
      location: 'Oulu',
      employmentType: 'Full-time',
      startDate: '01/2021',
      endDate: '',
      isCurrent: true,
      description: 'Rakennan ja ylläpidän dataplatformia, joka tuottaa reaaliaikaista analytiikkaa 15 teollisuusasiakkaalle.',
      achievements: [
        'Uudistin syöttöputken Kafkalla ja Sparkilla, lyhentäen päästä-päähän-viiveen 45 minuutista alle 3 minuuttiin.',
        'Siirsin 40+ vanhaa eräajoa Airflow- ja dbt-pohjaisiksi, vähentäen putkien virhetilanteita 65 %.',
        'Rakensin Great Expectations -pohjaisen tietolaadun kehyksen, joka löytää noin 98 % skeemaongelmista ennen tuotantoa.',
      ],
      technologies: ['Python', 'Apache Airflow', 'Apache Spark'],
    },
    {
      role: 'Data Engineer',
      company: 'Polarnet Analytics',
      location: 'Helsinki',
      employmentType: 'Full-time',
      startDate: '06/2018',
      endDate: '12/2020',
      isCurrent: false,
      description: 'Vastasin yrityksen markkinointianalytiikan tietovarastoa ruokkivista ETL-putkista.',
      achievements: [
        'Rakensin yöllisen ETL-kokonaisuuden uudelleen dbt:llä, lyhentäen ajoaikaa 6 tunnista 50 minuuttiin.',
        'Otin käyttöön automaattiset datatestit, jotka vähensivät analyytikkojen raportoimia tietolaatuongelmia 80 %.',
      ],
      technologies: ['SQL', 'Python', 'Snowflake'],
    },
  ],
  education: [
    {
      school: 'Oulun yliopisto',
      degree: 'Filosofian maisteri, tietojenkäsittelytiede',
      location: 'Oulu',
      startDate: '2016',
      endDate: '2018',
      honors: '',
      coursework: 'Hajautetut järjestelmät, tietokannat, koneoppiminen',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'realtime-pipeline-metrics',
      description: 'Avoimen lähdekoodin Grafana-paneelimallit Airflow- ja Spark-putkien terveyden seurantaan, käytössä 15+ tiimillä.',
      stack: 'Python, Grafana, Prometheus',
      githubUrl: 'https://github.com/example-evirtanen/realtime-pipeline-metrics',
      demoUrl: '',
      organization: '',
      impact: 'Käytössä yli 15 datatiimillä.',
      date: '2023',
      teamSize: '',
      contribution: '',
      image: '',
    },
    {
      name: 'Säähäiriöiden tunnistin',
      description: 'Striimauspohjainen putki, joka havaitsee poikkeavat anturilukemat 200 säähavaintoasemalta sekunneissa.',
      stack: 'Kafka, Spark Streaming, Python',
      githubUrl: '',
      demoUrl: '',
      organization: '',
      impact: 'Käsittelee 2 miljoonaa tapahtumaa päivässä.',
      date: '2022',
      teamSize: '',
      contribution: '',
      image: '',
    },
  ],
  achievements: [
    { title: 'Puhuja, Data Engineering Nordics 2023', description: 'Esitys: "Myöhässä saapuvan datan hallinta".', year: '2023' },
  ],
  openSource: [
    { name: 'Apache Airflow', description: 'Korjasin kilpailutilanteen Kubernetes-suorittajan tehtäväsiivouksessa.', language: 'Python', stars: '37k', forks: '15k', url: 'https://github.com/apache/airflow' },
  ],
  publications: [
    { title: 'Putkien viiveen lyhentäminen ilman kaiken uudelleenkirjoittamista', publisher: 'dev.to', year: '2023', url: 'https://dev.to/example-evirtanen' },
  ],
  certificates: [
    { name: 'AWS Certified Data Analytics – Specialty', issuer: 'Amazon Web Services', year: '2022', credentialUrl: '', expiry: '' },
  ],
  languages: [
    { language: 'Suomi', level: 'Äidinkieli' },
    { language: 'Englanti', level: 'Sujuva' },
  ],
  interests: [
    { name: 'Suunnistus' },
    { name: 'Kotiautomaatio' },
  ],
})

export default { en, fi }
