// Skills and requirements a job ad may ask for, as the matcher in
// jobMatch.js should display them. Matching ignores case, so only the
// label's casing matters. Multi-word terms match as a phrase; Finnish
// case endings are handled by the matcher, so list each term once, in its
// base form.
//
// Plain capitalised words are never treated as requirements by
// themselves (that would pick up cities and company names), so a skill
// that looks like an ordinary word has to be listed here to be found.
// Tech names with an inner capital, a dot, a slash or a # (TypeScript,
// Next.js, CI/CD, C#) and acronyms (CSS, WCAG) are found without a list.

export const JOB_TERMS = [
  // Software
  'React', 'React Native', 'Angular', 'Vue', 'Svelte', 'Next.js', 'Node.js', 'Express',
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Kotlin', 'Swift', 'Ruby', 'Rails', 'PHP',
  'Laravel', 'Django', 'Flask', 'Spring', 'Rust', 'Golang', 'Scala', 'Elixir', 'Dart', 'Flutter',
  'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap', 'Redux', 'Webpack', 'Vite',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Kafka', 'RabbitMQ',
  'GraphQL', 'REST', 'APIs', 'microservices', 'serverless',
  'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Ansible',
  'Linux', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'Jenkins', 'DevOps', 'observability',
  'Jest', 'Vitest', 'Playwright', 'Cypress', 'Selenium', 'unit testing', 'test automation',
  'testing', 'QA', 'TDD', 'agile', 'Scrum', 'Kanban', 'Jira', 'Confluence',
  'machine learning', 'deep learning', 'data science', 'data analysis', 'data engineering',
  'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Spark', 'Airflow', 'dbt', 'Snowflake',
  'Power BI', 'Tableau', 'Looker', 'Excel', 'statistics', 'ETL',
  'cybersecurity', 'information security', 'penetration testing', 'SIEM', 'SOC', 'IAM',
  'networking', 'firewalls', 'Active Directory', 'Microsoft 365', 'Intune', 'ITIL',
  'technical support', 'troubleshooting', 'mobile development', 'iOS', 'Android',
  'performance optimization', 'security', 'architecture', 'system design',
  'frontend', 'backend', 'full stack', 'web development', 'API design',

  // Design and product
  'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects',
  'UX', 'UI', 'user research', 'usability testing', 'design systems', 'prototyping',
  'wireframing', 'interaction design', 'visual design', 'accessibility', 'WCAG',
  'A/B testing', 'product management', 'product strategy', 'roadmapping', 'analytics',
  'Google Analytics', 'SEO', 'SEM', 'content marketing', 'social media', 'copywriting',
  'digital marketing', 'marketing automation', 'HubSpot', 'Salesforce', 'CRM',

  // Business
  'project management', 'program management', 'stakeholder management', 'budgeting',
  'forecasting', 'financial analysis', 'accounting', 'bookkeeping', 'payroll', 'auditing',
  'SAP', 'ERP', 'procurement', 'supply chain', 'logistics', 'sales', 'B2B', 'B2C',
  'account management', 'business development', 'negotiation', 'customer service',
  'customer success', 'recruitment', 'onboarding', 'HR', 'compliance', 'GDPR',
  'risk management', 'change management', 'process improvement', 'Lean', 'Six Sigma',
  'leadership', 'team leadership', 'mentoring', 'coaching', 'communication', 'presentation',
  'training', 'reporting', 'documentation', 'English', 'Finnish', 'Swedish',

  // Health and care
  'nursing', 'patient care', 'triage', 'medication administration', 'first aid',

  // Finnish
  'ohjelmistokehitys', 'testaus', 'testausautomaatio', 'saavutettavuus', 'käytettävyys',
  'tietoturva', 'kyberturvallisuus', 'pilvipalvelut', 'tietokannat', 'verkot',
  'projektinhallinta', 'projektipäällikkö', 'sidosryhmäyhteistyö', 'budjetointi',
  'kirjanpito', 'palkanlaskenta', 'taloushallinto', 'hankinta', 'logistiikka', 'myynti',
  'asiakaspalvelu', 'asiakkuudenhallinta', 'markkinointi', 'sisältömarkkinointi',
  'rekrytointi', 'perehdytys', 'esihenkilötyö', 'johtaminen', 'valmentaminen',
  'viestintä', 'raportointi', 'dokumentointi', 'suomen kieli', 'ruotsin kieli', 'englannin kieli', 'sairaanhoito', 'hoitotyö', 'lääkehoito',
  'potilasohjaus', 'ensiapu', 'kotihoito', 'vanhustyö', 'varhaiskasvatus', 'opetus',
  'lähihoitaja', 'sairaanhoitaja', 'ajokortti', 'B-ajokortti', 'hygieniapassi',
  'työturvallisuuskortti', 'tulityökortti', 'anniskelupassi',
]

// Ordinary words too: these count only where the ad writes them as a name
// ("Spring", "REST"), never in plain prose ("in spring", "the rest").
export const NAME_ONLY_TERMS = new Set([
  'Spring', 'Swift', 'Express', 'Lean', 'Spark', 'Rails', 'Ruby', 'Dart', 'Rust', 'Sketch',
  'Excel', 'Flask', 'Java', 'Vue', 'Vite', 'Looker', 'Jest', 'Git', 'Kanban', 'Scrum',
  'Confluence', 'Jira', 'Linux', 'Docker', 'React', 'Angular', 'Elixir', 'Kafka', 'Spark',
  'Snowflake', 'Airflow', 'Pandas', 'Express', 'Cypress', 'Selenium', 'Playwright',
])

// Acronyms and names that look like tech but are never a requirement on
// their own (compared in capitals).
export const IGNORED_NAMES = new Set([
  'LINKEDIN', 'YOUTUBE', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'WHATSAPP', 'IPHONE', 'IPAD',
  'CV', 'OY', 'OYJ', 'AB', 'LTD', 'INC', 'LLC', 'GMBH', 'EU', 'EEA', 'USA', 'UK', 'FI',
  'CET', 'EET', 'ASAP', 'FAQ', 'PS', 'NB', 'II', 'III', 'IV', 'TBD', 'ETC', 'OK',
  'ABOUT', 'ROLE', 'JOB', 'TEAM', 'WHO', 'WHAT', 'HOW', 'WHY', 'NEW', 'OFFER', 'APPLY',
  'IT', 'ICT', 'WE', 'YOU', 'OUR', 'AND', 'OR', 'THE', 'JA', 'TAI', 'SEKÄ',
])
