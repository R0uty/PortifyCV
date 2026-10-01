/** @typedef {import('../types/cv').CvData} CvData */
/** @typedef {import('../types/cv').Locale} Locale */

export const CV_ONBOARDING_SEEN_STORAGE_KEY = 'portifycv-onboarding-seen'
export const CV_SESSION_RESTORE_ENABLED_STORAGE_KEY = 'portifycv-session-restore-enabled'
export const CV_SESSION_SNAPSHOT_STORAGE_KEY = 'portifycv-session-snapshot'

export const EMPLOYMENT_TYPE_OPTIONS = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
]

export const createEmptyExperience = () => ({
  role: '',
  company: '',
  location: '',
  employmentType: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
  achievements: [],
  technologies: [],
})

export const createEmptyEducation = () => ({
  school: '',
  degree: '',
  location: '',
  startDate: '',
  endDate: '',
  honors: '',
  coursework: '',
  grade: '',
})

export const createEmptyLinks = () => ({
  github: '',
  linkedin: '',
  portfolio: '',
  website: '',
  behance: '',
  dribbble: '',
  medium: '',
  devto: '',
  scholar: '',
  boardProfile: '',
  blog: '',
  researchGate: '',
  hackTheBox: '',
  tryHackMe: '',
  youtube: '',
})

export const createEmptyCoreStrength = () => ({
  title: '',
  description: '',
})

export const createEmptyCertificate = () => ({
  name: '',
  issuer: '',
  year: '',
  credentialUrl: '',
  expiry: '',
})

export const createEmptyProject = () => ({
  name: '',
  description: '',
  stack: '',
  githubUrl: '',
  demoUrl: '',
  organization: '',
  impact: '',
  date: '',
  teamSize: '',
  contribution: '',
  image: '',
})

export const createEmptyLanguage = () => ({
  language: '',
  level: '',
})

export const createEmptyInterest = () => ({
  name: '',
})

export const createEmptyAchievement = () => ({
  title: '',
  description: '',
  year: '',
})

export const createEmptyOpenSource = () => ({
  name: '',
  description: '',
  language: '',
  stars: '',
  forks: '',
  url: '',
})

export const createEmptyPublication = () => ({
  title: '',
  publisher: '',
  year: '',
  url: '',
})

export const createEmptyLeadership = () => ({
  role: '',
  organization: '',
  description: '',
  startDate: '',
  endDate: '',
})

export const createEmptyMembership = () => ({
  organization: '',
  role: '',
  year: '',
})

export const createEmptySpeaking = () => ({
  conference: '',
  topic: '',
  audience: '',
  date: '',
})

export const createEmptyVolunteer = () => ({
  organization: '',
  role: '',
  description: '',
})

export const createEmptyInternship = () => ({
  role: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
  technologies: '',
})

export const createEmptyCaseStudy = () => ({
  title: '',
  problem: '',
  solution: '',
  technologies: '',
  outcome: '',
  lessons: '',
})

export const createEmptyTestimonial = () => ({
  quote: '',
  author: '',
  role: '',
})

export const createSectionVisibility = () => ({
  about: true,
  skills: true,
  experience: true,
  education: true,
  links: true,
  coreStrengths: true,
  certificates: true,
  projects: true,
  languages: true,
  interests: true,
  achievements: true,
  openSource: true,
  publications: true,
  leadership: true,
  memberships: true,
  speaking: true,
  volunteering: true,
  internships: true,
  caseStudies: true,
  testimonials: true,
})

export const CV_SECTION_ORDER_KEYS = [
  'about',
  'experience',
  'education',
  'skills',
  'links',
  'coreStrengths',
  'certificates',
  'projects',
  'languages',
  'interests',
  'achievements',
  'openSource',
  'publications',
  'leadership',
  'memberships',
  'speaking',
  'volunteering',
  'internships',
  'caseStudies',
  'testimonials',
]

export const createSectionOrder = () => []

export const createSectionItemVisibility = () => ({
  skills: {},
  experience: {},
  education: {},
  links: {},
  coreStrengths: {},
  certificates: {},
  projects: {},
  languages: {},
  interests: {},
  achievements: {},
  openSource: {},
  publications: {},
  leadership: {},
  memberships: {},
  speaking: {},
  volunteering: {},
  internships: {},
  caseStudies: {},
  testimonials: {},
})

export const createTemplatePhotoVisibility = () => ({})

export function isPhotoVisibleForTemplate(photoVisibilityByTemplate, templateId) {
  if (typeof templateId !== 'string' || !templateId.trim()) {
    return true
  }

  if (!isPlainObject(photoVisibilityByTemplate)) {
    return true
  }

  return photoVisibilityByTemplate[templateId] !== false
}

const sectionVisibilityFieldsEn = [
  { key: 'about', label: 'About' },
  { key: 'skills', label: 'Skills' },
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'links', label: 'Links' },
  { key: 'coreStrengths', label: 'Core Strengths' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'projects', label: 'Projects' },
  { key: 'languages', label: 'Languages' },
  { key: 'interests', label: 'Interests' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'openSource', label: 'Open Source' },
  { key: 'publications', label: 'Publications' },
  { key: 'leadership', label: 'Leadership Experience' },
  { key: 'memberships', label: 'Professional Memberships' },
  { key: 'speaking', label: 'Speaking' },
  { key: 'volunteering', label: 'Volunteering' },
  { key: 'internships', label: 'Internships' },
  { key: 'caseStudies', label: 'Case Studies' },
  { key: 'testimonials', label: 'Testimonials' },
]

const sectionVisibilityFieldsFi = [
  { key: 'about', label: 'Esittely' },
  { key: 'skills', label: 'Taidot' },
  { key: 'experience', label: 'Kokemus' },
  { key: 'education', label: 'Koulutus' },
  { key: 'links', label: 'Linkit' },
  { key: 'coreStrengths', label: 'Vahvuudet' },
  { key: 'certificates', label: 'Sertifikaatit' },
  { key: 'projects', label: 'Projektit' },
  { key: 'languages', label: 'Kielet' },
  { key: 'interests', label: 'Kiinnostuksen kohteet' },
  { key: 'achievements', label: 'Saavutukset' },
  { key: 'openSource', label: 'Avoin lähdekoodi' },
  { key: 'publications', label: 'Julkaisut' },
  { key: 'leadership', label: 'Johtamiskokemus' },
  { key: 'memberships', label: 'Ammattijäsenyydet' },
  { key: 'speaking', label: 'Esiintymiset' },
  { key: 'volunteering', label: 'Vapaaehtoistyö' },
  { key: 'internships', label: 'Harjoittelut' },
  { key: 'caseStudies', label: 'Tapaustutkimukset' },
  { key: 'testimonials', label: 'Suositukset' },
]

export function getSectionVisibilityFields(locale = 'en') {
  return locale === 'fi' ? sectionVisibilityFieldsFi : sectionVisibilityFieldsEn
}

export const sectionVisibilityFields = getSectionVisibilityFields('en')

/** @returns {CvData} */
export const createInitialCvData = () => ({
  fullName: '',
  title: '',
  about: '',
  tagline: '',
  email: '',
  phone: '',
  location: '',
  photo: '',
  photoVisibilityByTemplate: createTemplatePhotoVisibility(),
  sectionColumnsByTemplate: {},
  sectionOrder: createSectionOrder(),
  skills: [],
  experience: [createEmptyExperience()],
  education: [createEmptyEducation()],
  links: createEmptyLinks(),
  coreStrengths: [createEmptyCoreStrength()],
  certificates: [createEmptyCertificate()],
  projects: [createEmptyProject()],
  languages: [createEmptyLanguage()],
  interests: [createEmptyInterest()],
  achievements: [createEmptyAchievement()],
  openSource: [createEmptyOpenSource()],
  publications: [createEmptyPublication()],
  leadership: [createEmptyLeadership()],
  memberships: [createEmptyMembership()],
  speaking: [createEmptySpeaking()],
  volunteering: [createEmptyVolunteer()],
  internships: [createEmptyInternship()],
  caseStudies: [createEmptyCaseStudy()],
  testimonials: [createEmptyTestimonial()],
  sectionVisibility: createSectionVisibility(),
  sectionItemVisibility: createSectionItemVisibility(),
})

export const initialCvData = createInitialCvData()

export const demoCvData = {
  fullName: 'Alex Morgan',
  title: 'Senior Product Designer',
  about:
    'Product designer with 7+ years of experience shaping SaaS workflows, design systems, and portfolio-ready product storytelling across startup and enterprise teams.',
  tagline: 'Helping ideas become reality.',
  email: 'alex@alexmorgan.dev',
  phone: '+358 40 123 4567',
  location: 'Helsinki, Finland',
  photo: '',
  photoVisibilityByTemplate: createTemplatePhotoVisibility(),
  sectionColumnsByTemplate: {},
  sectionOrder: createSectionOrder(),
  skills: [
    'Product Strategy',
    'Design Systems',
    'User Research',
    'Figma',
    'Accessibility',
    'Prototyping',
  ],
  experience: [
    {
      role: 'Senior Product Designer',
      company: 'Studio North',
      location: 'Helsinki, Finland',
      employmentType: 'Full-time',
      startDate: 'Jan 2022',
      endDate: '',
      isCurrent: true,
      description:
        'Led end-to-end design for a B2B collaboration suite, improving activation by 21% and building a reusable component library for cross-team delivery.',
      achievements: [
        'Grew activation by 21% through a redesigned onboarding flow.',
        'Built a shared component library adopted by 6 product teams.',
      ],
      technologies: ['Figma', 'Design Systems', 'Storybook'],
    },
    {
      role: 'Product Designer',
      company: 'Atlas Labs',
      location: 'Remote',
      employmentType: 'Full-time',
      startDate: 'Jun 2019',
      endDate: 'Dec 2021',
      isCurrent: false,
      description:
        'Partnered with engineering and product teams to redesign onboarding flows, launch customer interview loops, and ship data-informed UX improvements.',
      achievements: [
        'Ran a recurring customer interview loop that shaped the 2020 roadmap.',
      ],
      technologies: ['Figma', 'User Research'],
    },
  ],
  education: [
    {
      school: 'University of the Arts',
      degree: 'B.A. Graphic Design',
      location: 'Helsinki, Finland',
      startDate: '2014',
      endDate: '2018',
      honors: 'Graduated with Distinction',
      coursework: 'Typography, Interaction Design, Design Systems',
      grade: 'First Class Honours',
    },
  ],
  links: {
    github: 'https://github.com/alexmorgan',
    linkedin: 'https://linkedin.com/in/alexmorgan',
    portfolio: 'https://alexmorgan.design',
    website: 'https://alexmorgan.dev',
    behance: 'https://behance.net/alexmorgan',
    dribbble: 'https://dribbble.com/alexmorgan',
    medium: 'https://medium.com/@alexmorgan',
    devto: 'https://dev.to/alexmorgan',
    scholar: '',
    boardProfile: '',
    blog: '',
    researchGate: '',
    hackTheBox: '',
    tryHackMe: '',
    youtube: '',
  },
  coreStrengths: [
    {
      title: 'Systems Thinking',
      description: 'Design for scale first. Ship for clarity always.',
    },
    {
      title: 'Cross-Team Delivery',
      description: 'Bridge product, engineering, and research into one roadmap.',
    },
  ],
  certificates: [
    {
      name: 'Certified Scrum Product Owner (CSPO)',
      issuer: 'Scrum Alliance',
      year: '2023',
      credentialUrl: '',
      expiry: '',
    },
    {
      name: 'Google UX Design Professional Certificate',
      issuer: 'Google',
      year: '2021',
      credentialUrl: '',
      expiry: '',
    },
  ],
  projects: [
    {
      name: 'Atlas Design System',
      description: 'A shared component library adopted across six product teams.',
      stack: 'Figma, React, Storybook',
      githubUrl: 'https://github.com/alexmorgan/atlas-design-system',
      demoUrl: 'https://atlas-design-system.alexmorgan.design',
      organization: 'Studio North',
      impact: 'Cut cross-team design handoff time by 35%.',
      date: '2023',
      teamSize: 'Team of 4',
      contribution: 'Led the component API design and Storybook documentation.',
      image: '',
    },
  ],
  languages: [
    { language: 'English', level: 'Fluent' },
    { language: 'Finnish', level: 'Professional' },
  ],
  interests: [
    { name: 'Typography' },
    { name: 'Photography' },
    { name: 'Hiking' },
  ],
  achievements: [
    {
      title: 'Awwwards Site of the Day',
      description: 'Recognized for the Atlas onboarding redesign.',
      year: '2023',
    },
  ],
  openSource: [
    {
      name: 'storybook-a11y-kit',
      description: 'Accessibility addons and presets for Storybook design systems.',
      language: 'TypeScript',
      stars: '412',
      forks: '38',
      url: 'https://github.com/alexmorgan/storybook-a11y-kit',
    },
  ],
  publications: [
    {
      title: 'Designing Systems That Scale With Teams, Not Against Them',
      publisher: 'UX Collective',
      year: '2022',
      url: '',
    },
  ],
  leadership: [
    {
      role: 'Design Guild Chair',
      organization: 'Studio North',
      description: 'Set design-quality standards and ran quarterly critique sessions for 20+ designers.',
      startDate: '2022',
      endDate: 'Present',
    },
  ],
  memberships: [
    {
      organization: 'AIGA',
      role: 'Member',
      year: '2020',
    },
  ],
  speaking: [
    {
      conference: 'Config',
      topic: 'Design Systems at Scale',
      audience: '400+ product designers',
      date: '2023',
    },
  ],
  volunteering: [
    {
      organization: 'Design for Good',
      role: 'Volunteer Mentor',
      description: 'Mentored early-career designers transitioning into product roles.',
    },
  ],
  internships: [
    {
      role: 'Design Intern',
      company: 'Atlas Labs',
      location: 'Remote',
      startDate: 'Jun 2018',
      endDate: 'Aug 2018',
      description: 'Supported the product team on onboarding flow research and prototyping.',
      technologies: 'Figma, Sketch, InVision',
    },
  ],
  caseStudies: [
    {
      title: 'Scaling Atlas Design System',
      problem: 'Six product teams were shipping inconsistent UI with duplicated components, slowing releases.',
      solution: 'Designed a token-based component library with Storybook documentation and a contribution workflow.',
      technologies: 'Figma, React, Storybook',
      outcome: 'Cut cross-team design handoff time by 35% within two quarters.',
      lessons: 'Adoption depends more on documentation and support than on component quality alone.',
    },
  ],
  testimonials: [
    {
      quote: 'Alex turned a chaotic component library into the backbone of our entire product suite.',
      author: 'Jordan Lee',
      role: 'Engineering Manager, Studio North',
    },
  ],
}

const linkFieldsEn = [
  {
    key: 'github',
    label: 'GitHub',
    placeholder: 'https://github.com/username',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    placeholder: 'https://portfolio.dev',
  },
  {
    key: 'website',
    label: 'Website',
    placeholder: 'https://yourwebsite.com',
  },
  {
    key: 'behance',
    label: 'Behance',
    placeholder: 'https://behance.net/username',
  },
  {
    key: 'dribbble',
    label: 'Dribbble',
    placeholder: 'https://dribbble.com/username',
  },
  {
    key: 'medium',
    label: 'Medium',
    placeholder: 'https://medium.com/@username',
  },
  {
    key: 'devto',
    label: 'Dev.to',
    placeholder: 'https://dev.to/username',
  },
  {
    key: 'scholar',
    label: 'Google Scholar',
    placeholder: 'https://scholar.google.com/citations?user=...',
  },
  {
    key: 'boardProfile',
    label: 'Board Profile',
    placeholder: 'https://boardprospects.com/profile/username',
  },
  {
    key: 'blog',
    label: 'Blog',
    placeholder: 'https://blog.yourname.dev',
  },
  {
    key: 'researchGate',
    label: 'ResearchGate',
    placeholder: 'https://researchgate.net/profile/username',
  },
  {
    key: 'hackTheBox',
    label: 'Hack The Box',
    placeholder: 'https://app.hackthebox.com/profile/username',
  },
  {
    key: 'tryHackMe',
    label: 'TryHackMe',
    placeholder: 'https://tryhackme.com/p/username',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    placeholder: 'https://youtube.com/@username',
  },
]

const linkFieldsFi = [
  {
    key: 'github',
    label: 'GitHub',
    placeholder: 'https://github.com/kayttajatunnus',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/kayttajatunnus',
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    placeholder: 'https://portfolio.dev',
  },
  {
    key: 'website',
    label: 'Verkkosivu',
    placeholder: 'https://omatkotisivut.fi',
  },
  {
    key: 'behance',
    label: 'Behance',
    placeholder: 'https://behance.net/kayttajatunnus',
  },
  {
    key: 'dribbble',
    label: 'Dribbble',
    placeholder: 'https://dribbble.com/kayttajatunnus',
  },
  {
    key: 'medium',
    label: 'Medium',
    placeholder: 'https://medium.com/@kayttajatunnus',
  },
  {
    key: 'devto',
    label: 'Dev.to',
    placeholder: 'https://dev.to/kayttajatunnus',
  },
  {
    key: 'scholar',
    label: 'Google Scholar',
    placeholder: 'https://scholar.google.com/citations?user=...',
  },
  {
    key: 'boardProfile',
    label: 'Hallitusprofiili',
    placeholder: 'https://boardprospects.com/profile/kayttajatunnus',
  },
  {
    key: 'blog',
    label: 'Blogi',
    placeholder: 'https://blog.nimesi.dev',
  },
  {
    key: 'researchGate',
    label: 'ResearchGate',
    placeholder: 'https://researchgate.net/profile/kayttajatunnus',
  },
  {
    key: 'hackTheBox',
    label: 'Hack The Box',
    placeholder: 'https://app.hackthebox.com/profile/kayttajatunnus',
  },
  {
    key: 'tryHackMe',
    label: 'TryHackMe',
    placeholder: 'https://tryhackme.com/p/kayttajatunnus',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    placeholder: 'https://youtube.com/@kayttajatunnus',
  },
]

/**
 * @param {Locale} [locale='en']
 */
export function getLinkFields(locale = 'en') {
  return locale === 'fi' ? linkFieldsFi : linkFieldsEn
}

export const linkFields = getLinkFields('en')

// The handful of platforms most CVs actually use — shown by default in the
// Links section; the other ~11 (Behance, ResearchGate, Hack The Box, …)
// stay behind a "show more" toggle unless they already hold a value.
export const PRIMARY_LINK_KEYS = ['github', 'linkedin', 'portfolio', 'website']

function createStorageError(error) {
  return error instanceof Error ? error : new Error('Storage access failed.')
}

export function safeStorageGet(key, fallback = null) {
  if (typeof window === 'undefined') {
    return {
      ok: false,
      value: fallback,
      error: new Error('Window is unavailable.'),
    }
  }

  try {
    const value = window.localStorage.getItem(key)

    return {
      ok: true,
      value: value === null ? fallback : value,
      error: null,
    }
  } catch (error) {
    return {
      ok: false,
      value: fallback,
      error: createStorageError(error),
    }
  }
}

export function safeStorageSet(key, value) {
  if (typeof window === 'undefined') {
    return {
      ok: false,
      error: new Error('Window is unavailable.'),
    }
  }

  try {
    window.localStorage.setItem(key, value)

    return {
      ok: true,
      error: null,
    }
  } catch (error) {
    return {
      ok: false,
      error: createStorageError(error),
    }
  }
}

// Session storage (not local storage) is used for the opt-in "restore last
// session" feature specifically because it's cleared when the tab closes —
// that's what keeps the feature from contradicting the app's "nothing
// persists once you close the tab" promise.
export function safeSessionStorageGet(key, fallback = null) {
  if (typeof window === 'undefined') {
    return {
      ok: false,
      value: fallback,
      error: new Error('Window is unavailable.'),
    }
  }

  try {
    const value = window.sessionStorage.getItem(key)

    return {
      ok: true,
      value: value === null ? fallback : value,
      error: null,
    }
  } catch (error) {
    return {
      ok: false,
      value: fallback,
      error: createStorageError(error),
    }
  }
}

export function safeSessionStorageSet(key, value) {
  if (typeof window === 'undefined') {
    return {
      ok: false,
      error: new Error('Window is unavailable.'),
    }
  }

  try {
    window.sessionStorage.setItem(key, value)

    return {
      ok: true,
      error: null,
    }
  } catch (error) {
    return {
      ok: false,
      error: createStorageError(error),
    }
  }
}

export function safeSessionStorageRemove(key) {
  if (typeof window === 'undefined') {
    return {
      ok: false,
      error: new Error('Window is unavailable.'),
    }
  }

  try {
    window.sessionStorage.removeItem(key)

    return {
      ok: true,
      error: null,
    }
  } catch (error) {
    return {
      ok: false,
      error: createStorageError(error),
    }
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateAllowedKeys(value, allowedKeys, path) {
  const unexpectedKeys = Object.keys(value).filter((key) => !allowedKeys.includes(key))

  if (unexpectedKeys.length > 0) {
    throw new Error(
      `${path} contains unsupported field${unexpectedKeys.length > 1 ? 's' : ''}: ${unexpectedKeys.join(', ')}.`,
    )
  }
}

function readOptionalString(value, path) {
  if (value === undefined) {
    return ''
  }

  if (typeof value !== 'string') {
    throw new Error(`${path} must be a text value.`)
  }

  return value
}

function readOptionalBoolean(value, path) {
  if (value === undefined) {
    return false
  }

  if (typeof value !== 'boolean') {
    throw new Error(`${path} must be true or false.`)
  }

  return value
}

function readOptionalStringArray(value, path) {
  if (value === undefined) {
    return []
  }

  if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string')) {
    throw new Error(`${path} must be a list of text values.`)
  }

  return value
}

export function normalizeSectionOrder(sectionOrder, fallbackOrder = CV_SECTION_ORDER_KEYS) {
  const fallback = Array.isArray(fallbackOrder) && fallbackOrder.length > 0
    ? fallbackOrder
    : CV_SECTION_ORDER_KEYS
  const allowedSections = new Set(CV_SECTION_ORDER_KEYS)
  const dedupe = (values) =>
    values.filter((value, index, list) => list.indexOf(value) === index)
  const normalizedFallback = dedupe(
    fallback.filter((section) => allowedSections.has(section)),
  )
  const normalizedInput = Array.isArray(sectionOrder)
    ? dedupe(sectionOrder.filter((section) => allowedSections.has(section)))
    : []
  const nextOrder = [...normalizedInput]

  normalizedFallback.forEach((section) => {
    if (!nextOrder.includes(section)) {
      nextOrder.push(section)
    }
  })

  CV_SECTION_ORDER_KEYS.forEach((section) => {
    if (!nextOrder.includes(section)) {
      nextOrder.push(section)
    }
  })

  return nextOrder
}

/**
 * Parse imported JSON into a validated CV state.
 * @param {unknown} value
 * @returns {CvData}
 */
export function parseImportedCvData(value) {
  if (!isPlainObject(value)) {
    throw new Error(
      'Imported JSON must be an object with fullName, title, about, skills, experience, education, and links fields.',
    )
  }

  const defaultState = createInitialCvData()
  const skills = value.skills ?? defaultState.skills
  const experience = value.experience ?? defaultState.experience
  const education = value.education ?? defaultState.education
  const links = value.links ?? defaultState.links
  const coreStrengths = value.coreStrengths ?? defaultState.coreStrengths
  const certificates = value.certificates ?? defaultState.certificates
  const projects = value.projects ?? defaultState.projects
  const languages = value.languages ?? defaultState.languages
  const interests = value.interests ?? defaultState.interests
  const achievements = value.achievements ?? defaultState.achievements
  const openSource = value.openSource ?? defaultState.openSource
  const publications = value.publications ?? defaultState.publications
  const leadership = value.leadership ?? defaultState.leadership
  const memberships = value.memberships ?? defaultState.memberships
  const speaking = value.speaking ?? defaultState.speaking
  const volunteering = value.volunteering ?? defaultState.volunteering
  const internships = value.internships ?? defaultState.internships
  const caseStudies = value.caseStudies ?? defaultState.caseStudies
  const testimonials = value.testimonials ?? defaultState.testimonials
  const sectionVisibility = value.sectionVisibility ?? defaultState.sectionVisibility
  const sectionItemVisibility = value.sectionItemVisibility ?? defaultState.sectionItemVisibility
  const photoVisibilityByTemplate =
    value.photoVisibilityByTemplate ?? defaultState.photoVisibilityByTemplate
  const sectionColumnsByTemplate = value.sectionColumnsByTemplate ?? {}
  const sectionOrder = value.sectionOrder ?? defaultState.sectionOrder

  validateAllowedKeys(
    value,
    [
      'fullName',
      'title',
      'about',
      'tagline',
      'email',
      'phone',
      'location',
      'photo',
      'photoVisibilityByTemplate',
      'sectionColumnsByTemplate',
      'skills',
      'experience',
      'education',
      'links',
      'coreStrengths',
      'certificates',
      'projects',
      'languages',
      'interests',
      'achievements',
      'openSource',
      'publications',
      'leadership',
      'memberships',
      'speaking',
      'volunteering',
      'internships',
      'caseStudies',
      'testimonials',
      'sectionOrder',
      'sectionVisibility',
      'sectionItemVisibility',
    ],
    'Imported CV JSON',
  )

  if (!Array.isArray(skills)) {
    throw new Error('skills must be an array of text values.')
  }

  if (!skills.every((skill) => typeof skill === 'string')) {
    throw new Error('skills must contain only text values.')
  }

  if (!Array.isArray(experience)) {
    throw new Error('experience must be an array of objects.')
  }

  if (!experience.every(isPlainObject)) {
    throw new Error('experience must contain only objects.')
  }

  experience.forEach((item, index) => {
    validateAllowedKeys(
      item,
      [
        'role', 'company', 'location', 'employmentType', 'startDate', 'endDate',
        'isCurrent', 'description', 'achievements', 'technologies',
      ],
      `experience[${index}]`,
    )
  })

  if (!Array.isArray(education)) {
    throw new Error('education must be an array of objects.')
  }

  if (!education.every(isPlainObject)) {
    throw new Error('education must contain only objects.')
  }

  education.forEach((item, index) => {
    validateAllowedKeys(
      item,
      ['school', 'degree', 'location', 'startDate', 'endDate', 'honors', 'coursework', 'grade'],
      `education[${index}]`,
    )
  })

  if (!Array.isArray(coreStrengths)) {
    throw new Error('coreStrengths must be an array of objects.')
  }

  if (!coreStrengths.every(isPlainObject)) {
    throw new Error('coreStrengths must contain only objects.')
  }

  coreStrengths.forEach((item, index) => {
    validateAllowedKeys(item, ['title', 'description'], `coreStrengths[${index}]`)
  })

  if (!Array.isArray(certificates)) {
    throw new Error('certificates must be an array of objects.')
  }

  if (!certificates.every(isPlainObject)) {
    throw new Error('certificates must contain only objects.')
  }

  certificates.forEach((item, index) => {
    validateAllowedKeys(item, ['name', 'issuer', 'year', 'credentialUrl', 'expiry'], `certificates[${index}]`)
  })

  if (!Array.isArray(projects)) {
    throw new Error('projects must be an array of objects.')
  }

  if (!projects.every(isPlainObject)) {
    throw new Error('projects must contain only objects.')
  }

  projects.forEach((item, index) => {
    validateAllowedKeys(
      item,
      [
        'name', 'description', 'stack', 'githubUrl', 'demoUrl', 'organization', 'impact', 'date',
        'teamSize', 'contribution', 'image',
      ],
      `projects[${index}]`,
    )
  })

  if (!Array.isArray(languages)) {
    throw new Error('languages must be an array of objects.')
  }

  if (!languages.every(isPlainObject)) {
    throw new Error('languages must contain only objects.')
  }

  languages.forEach((item, index) => {
    validateAllowedKeys(item, ['language', 'level'], `languages[${index}]`)
  })

  if (!Array.isArray(interests)) {
    throw new Error('interests must be an array of objects.')
  }

  if (!interests.every(isPlainObject)) {
    throw new Error('interests must contain only objects.')
  }

  interests.forEach((item, index) => {
    validateAllowedKeys(item, ['name'], `interests[${index}]`)
  })

  if (!Array.isArray(achievements)) {
    throw new Error('achievements must be an array of objects.')
  }

  if (!achievements.every(isPlainObject)) {
    throw new Error('achievements must contain only objects.')
  }

  achievements.forEach((item, index) => {
    validateAllowedKeys(item, ['title', 'description', 'year'], `achievements[${index}]`)
  })

  if (!Array.isArray(openSource)) {
    throw new Error('openSource must be an array of objects.')
  }

  if (!openSource.every(isPlainObject)) {
    throw new Error('openSource must contain only objects.')
  }

  openSource.forEach((item, index) => {
    validateAllowedKeys(
      item,
      ['name', 'description', 'language', 'stars', 'forks', 'url'],
      `openSource[${index}]`,
    )
  })

  if (!Array.isArray(publications)) {
    throw new Error('publications must be an array of objects.')
  }

  if (!publications.every(isPlainObject)) {
    throw new Error('publications must contain only objects.')
  }

  publications.forEach((item, index) => {
    validateAllowedKeys(item, ['title', 'publisher', 'year', 'url'], `publications[${index}]`)
  })

  if (!Array.isArray(leadership)) {
    throw new Error('leadership must be an array of objects.')
  }

  if (!leadership.every(isPlainObject)) {
    throw new Error('leadership must contain only objects.')
  }

  leadership.forEach((item, index) => {
    validateAllowedKeys(
      item,
      ['role', 'organization', 'description', 'startDate', 'endDate'],
      `leadership[${index}]`,
    )
  })

  if (!Array.isArray(memberships)) {
    throw new Error('memberships must be an array of objects.')
  }

  if (!memberships.every(isPlainObject)) {
    throw new Error('memberships must contain only objects.')
  }

  memberships.forEach((item, index) => {
    validateAllowedKeys(item, ['organization', 'role', 'year'], `memberships[${index}]`)
  })

  if (!Array.isArray(speaking)) {
    throw new Error('speaking must be an array of objects.')
  }

  if (!speaking.every(isPlainObject)) {
    throw new Error('speaking must contain only objects.')
  }

  speaking.forEach((item, index) => {
    validateAllowedKeys(item, ['conference', 'topic', 'audience', 'date'], `speaking[${index}]`)
  })

  if (!Array.isArray(volunteering)) {
    throw new Error('volunteering must be an array of objects.')
  }

  if (!volunteering.every(isPlainObject)) {
    throw new Error('volunteering must contain only objects.')
  }

  volunteering.forEach((item, index) => {
    validateAllowedKeys(item, ['organization', 'role', 'description'], `volunteering[${index}]`)
  })

  if (!Array.isArray(internships)) {
    throw new Error('internships must be an array of objects.')
  }

  if (!internships.every(isPlainObject)) {
    throw new Error('internships must contain only objects.')
  }

  internships.forEach((item, index) => {
    validateAllowedKeys(
      item,
      ['role', 'company', 'location', 'startDate', 'endDate', 'description', 'technologies'],
      `internships[${index}]`,
    )
  })

  if (!Array.isArray(caseStudies)) {
    throw new Error('caseStudies must be an array of objects.')
  }

  if (!caseStudies.every(isPlainObject)) {
    throw new Error('caseStudies must contain only objects.')
  }

  caseStudies.forEach((item, index) => {
    validateAllowedKeys(
      item,
      ['title', 'problem', 'solution', 'technologies', 'outcome', 'lessons'],
      `caseStudies[${index}]`,
    )
  })

  if (!Array.isArray(testimonials)) {
    throw new Error('testimonials must be an array of objects.')
  }

  if (!testimonials.every(isPlainObject)) {
    throw new Error('testimonials must contain only objects.')
  }

  testimonials.forEach((item, index) => {
    validateAllowedKeys(item, ['quote', 'author', 'role'], `testimonials[${index}]`)
  })

  if (!isPlainObject(links)) {
    throw new Error('links must be an object.')
  }

  validateAllowedKeys(
    links,
    [
      'github', 'linkedin', 'portfolio', 'website', 'behance', 'dribbble', 'medium', 'devto',
      'scholar', 'boardProfile', 'blog', 'researchGate', 'hackTheBox', 'tryHackMe', 'youtube',
    ],
    'links',
  )

  if (!Array.isArray(sectionOrder)) {
    throw new Error('sectionOrder must be an array of section keys.')
  }

  if (!sectionOrder.every((section) => typeof section === 'string')) {
    throw new Error('sectionOrder must contain only text section keys.')
  }

  if (!sectionOrder.every((section) => CV_SECTION_ORDER_KEYS.includes(section))) {
    throw new Error(
      `sectionOrder supports only: ${CV_SECTION_ORDER_KEYS.join(', ')}.`,
    )
  }

  if (new Set(sectionOrder).size !== sectionOrder.length) {
    throw new Error('sectionOrder must not contain duplicate section keys.')
  }

  if (!isPlainObject(sectionVisibility)) {
    throw new Error('sectionVisibility must be an object.')
  }

  validateAllowedKeys(
    sectionVisibility,
    [
      'about',
      'skills',
      'experience',
      'education',
      'links',
      'coreStrengths',
      'certificates',
      'projects',
      'languages',
      'interests',
      'achievements',
      'openSource',
      'publications',
      'leadership',
      'memberships',
      'speaking',
      'volunteering',
      'internships',
      'caseStudies',
      'testimonials',
    ],
    'sectionVisibility',
  )

  Object.entries(sectionVisibility).forEach(([key, entryValue]) => {
    if (typeof entryValue !== 'boolean') {
      throw new Error(`sectionVisibility.${key} must be true or false.`)
    }
  })

  if (!isPlainObject(sectionItemVisibility)) {
    throw new Error('sectionItemVisibility must be an object.')
  }

  validateAllowedKeys(
    sectionItemVisibility,
    [
      'skills',
      'experience',
      'education',
      'links',
      'coreStrengths',
      'certificates',
      'projects',
      'languages',
      'interests',
      'achievements',
      'openSource',
      'publications',
      'leadership',
      'memberships',
      'speaking',
      'volunteering',
      'internships',
      'caseStudies',
      'testimonials',
    ],
    'sectionItemVisibility',
  )

  Object.entries(sectionItemVisibility).forEach(([sectionKey, sectionValue]) => {
    if (!isPlainObject(sectionValue)) {
      throw new Error(`sectionItemVisibility.${sectionKey} must be an object.`)
    }

    Object.entries(sectionValue).forEach(([itemKey, itemValue]) => {
      if (typeof itemValue !== 'boolean') {
        throw new Error(`sectionItemVisibility.${sectionKey}.${itemKey} must be true or false.`)
      }
    })
  })

  if (!isPlainObject(photoVisibilityByTemplate)) {
    throw new Error('photoVisibilityByTemplate must be an object.')
  }

  Object.entries(photoVisibilityByTemplate).forEach(([key, entryValue]) => {
    if (typeof entryValue !== 'boolean') {
      throw new Error(`photoVisibilityByTemplate.${key} must be true or false.`)
    }
  })

  // Shape only. Whether a given move is still ALLOWED is decided at render
  // time (sectionColumns.js ignores stale entries), so a rule changing
  // later never makes an old file un-importable.
  if (!isPlainObject(sectionColumnsByTemplate)) {
    throw new Error('sectionColumnsByTemplate must be an object.')
  }

  Object.entries(sectionColumnsByTemplate).forEach(([templateId, columns]) => {
    if (!isPlainObject(columns)) {
      throw new Error(`sectionColumnsByTemplate.${templateId} must be an object.`)
    }

    Object.entries(columns).forEach(([sectionKey, column]) => {
      if (column !== 'main' && column !== 'sidebar') {
        throw new Error(`sectionColumnsByTemplate.${templateId}.${sectionKey} must be "main" or "sidebar".`)
      }
    })
  })

  return {
    fullName: readOptionalString(value.fullName, 'fullName'),
    title: readOptionalString(value.title, 'title'),
    about: readOptionalString(value.about, 'about'),
    tagline: readOptionalString(value.tagline, 'tagline'),
    email: readOptionalString(value.email, 'email'),
    phone: readOptionalString(value.phone, 'phone'),
    location: readOptionalString(value.location, 'location'),
    photo: readOptionalString(value.photo, 'photo'),
    photoVisibilityByTemplate: {
      ...createTemplatePhotoVisibility(),
      ...photoVisibilityByTemplate,
    },
    sectionColumnsByTemplate: Object.fromEntries(
      Object.entries(sectionColumnsByTemplate).map(([templateId, columns]) => [templateId, { ...columns }]),
    ),
    skills: skills.map((skill, index) => readOptionalString(skill, `skills[${index}]`)),
    experience:
      experience.length > 0
        ? experience.map((item, index) => ({
            role: readOptionalString(item.role, `experience[${index}].role`),
            company: readOptionalString(item.company, `experience[${index}].company`),
            location: readOptionalString(item.location, `experience[${index}].location`),
            employmentType: readOptionalString(
              item.employmentType,
              `experience[${index}].employmentType`,
            ),
            startDate: readOptionalString(item.startDate, `experience[${index}].startDate`),
            endDate: readOptionalString(item.endDate, `experience[${index}].endDate`),
            isCurrent: readOptionalBoolean(item.isCurrent, `experience[${index}].isCurrent`),
            description: readOptionalString(
              item.description,
              `experience[${index}].description`,
            ),
            achievements: readOptionalStringArray(
              item.achievements,
              `experience[${index}].achievements`,
            ),
            technologies: readOptionalStringArray(
              item.technologies,
              `experience[${index}].technologies`,
            ),
          }))
        : [createEmptyExperience()],
    education:
      education.length > 0
        ? education.map((item, index) => ({
            school: readOptionalString(item.school, `education[${index}].school`),
            degree: readOptionalString(item.degree, `education[${index}].degree`),
            location: readOptionalString(item.location, `education[${index}].location`),
            startDate: readOptionalString(item.startDate, `education[${index}].startDate`),
            endDate: readOptionalString(item.endDate, `education[${index}].endDate`),
            honors: readOptionalString(item.honors, `education[${index}].honors`),
            coursework: readOptionalString(item.coursework, `education[${index}].coursework`),
            grade: readOptionalString(item.grade, `education[${index}].grade`),
          }))
        : [createEmptyEducation()],
    links: {
      github: readOptionalString(links.github, 'links.github'),
      linkedin: readOptionalString(links.linkedin, 'links.linkedin'),
      portfolio: readOptionalString(links.portfolio, 'links.portfolio'),
      website: readOptionalString(links.website, 'links.website'),
      behance: readOptionalString(links.behance, 'links.behance'),
      dribbble: readOptionalString(links.dribbble, 'links.dribbble'),
      medium: readOptionalString(links.medium, 'links.medium'),
      devto: readOptionalString(links.devto, 'links.devto'),
      scholar: readOptionalString(links.scholar, 'links.scholar'),
      boardProfile: readOptionalString(links.boardProfile, 'links.boardProfile'),
      blog: readOptionalString(links.blog, 'links.blog'),
      researchGate: readOptionalString(links.researchGate, 'links.researchGate'),
      hackTheBox: readOptionalString(links.hackTheBox, 'links.hackTheBox'),
      tryHackMe: readOptionalString(links.tryHackMe, 'links.tryHackMe'),
      youtube: readOptionalString(links.youtube, 'links.youtube'),
    },
    coreStrengths:
      coreStrengths.length > 0
        ? coreStrengths.map((item, index) => ({
            title: readOptionalString(item.title, `coreStrengths[${index}].title`),
            description: readOptionalString(
              item.description,
              `coreStrengths[${index}].description`,
            ),
          }))
        : [createEmptyCoreStrength()],
    certificates:
      certificates.length > 0
        ? certificates.map((item, index) => ({
            name: readOptionalString(item.name, `certificates[${index}].name`),
            issuer: readOptionalString(item.issuer, `certificates[${index}].issuer`),
            year: readOptionalString(item.year, `certificates[${index}].year`),
            credentialUrl: readOptionalString(
              item.credentialUrl,
              `certificates[${index}].credentialUrl`,
            ),
            expiry: readOptionalString(item.expiry, `certificates[${index}].expiry`),
          }))
        : [createEmptyCertificate()],
    projects:
      projects.length > 0
        ? projects.map((item, index) => ({
            name: readOptionalString(item.name, `projects[${index}].name`),
            description: readOptionalString(item.description, `projects[${index}].description`),
            stack: readOptionalString(item.stack, `projects[${index}].stack`),
            githubUrl: readOptionalString(item.githubUrl, `projects[${index}].githubUrl`),
            demoUrl: readOptionalString(item.demoUrl, `projects[${index}].demoUrl`),
            organization: readOptionalString(item.organization, `projects[${index}].organization`),
            impact: readOptionalString(item.impact, `projects[${index}].impact`),
            date: readOptionalString(item.date, `projects[${index}].date`),
            teamSize: readOptionalString(item.teamSize, `projects[${index}].teamSize`),
            contribution: readOptionalString(item.contribution, `projects[${index}].contribution`),
            image: readOptionalString(item.image, `projects[${index}].image`),
          }))
        : [createEmptyProject()],
    languages:
      languages.length > 0
        ? languages.map((item, index) => ({
            language: readOptionalString(item.language, `languages[${index}].language`),
            level: readOptionalString(item.level, `languages[${index}].level`),
          }))
        : [createEmptyLanguage()],
    interests:
      interests.length > 0
        ? interests.map((item, index) => ({
            name: readOptionalString(item.name, `interests[${index}].name`),
          }))
        : [createEmptyInterest()],
    achievements:
      achievements.length > 0
        ? achievements.map((item, index) => ({
            title: readOptionalString(item.title, `achievements[${index}].title`),
            description: readOptionalString(
              item.description,
              `achievements[${index}].description`,
            ),
            year: readOptionalString(item.year, `achievements[${index}].year`),
          }))
        : [createEmptyAchievement()],
    openSource:
      openSource.length > 0
        ? openSource.map((item, index) => ({
            name: readOptionalString(item.name, `openSource[${index}].name`),
            description: readOptionalString(item.description, `openSource[${index}].description`),
            language: readOptionalString(item.language, `openSource[${index}].language`),
            stars: readOptionalString(item.stars, `openSource[${index}].stars`),
            forks: readOptionalString(item.forks, `openSource[${index}].forks`),
            url: readOptionalString(item.url, `openSource[${index}].url`),
          }))
        : [createEmptyOpenSource()],
    publications:
      publications.length > 0
        ? publications.map((item, index) => ({
            title: readOptionalString(item.title, `publications[${index}].title`),
            publisher: readOptionalString(item.publisher, `publications[${index}].publisher`),
            year: readOptionalString(item.year, `publications[${index}].year`),
            url: readOptionalString(item.url, `publications[${index}].url`),
          }))
        : [createEmptyPublication()],
    leadership:
      leadership.length > 0
        ? leadership.map((item, index) => ({
            role: readOptionalString(item.role, `leadership[${index}].role`),
            organization: readOptionalString(item.organization, `leadership[${index}].organization`),
            description: readOptionalString(item.description, `leadership[${index}].description`),
            startDate: readOptionalString(item.startDate, `leadership[${index}].startDate`),
            endDate: readOptionalString(item.endDate, `leadership[${index}].endDate`),
          }))
        : [createEmptyLeadership()],
    memberships:
      memberships.length > 0
        ? memberships.map((item, index) => ({
            organization: readOptionalString(item.organization, `memberships[${index}].organization`),
            role: readOptionalString(item.role, `memberships[${index}].role`),
            year: readOptionalString(item.year, `memberships[${index}].year`),
          }))
        : [createEmptyMembership()],
    speaking:
      speaking.length > 0
        ? speaking.map((item, index) => ({
            conference: readOptionalString(item.conference, `speaking[${index}].conference`),
            topic: readOptionalString(item.topic, `speaking[${index}].topic`),
            audience: readOptionalString(item.audience, `speaking[${index}].audience`),
            date: readOptionalString(item.date, `speaking[${index}].date`),
          }))
        : [createEmptySpeaking()],
    volunteering:
      volunteering.length > 0
        ? volunteering.map((item, index) => ({
            organization: readOptionalString(item.organization, `volunteering[${index}].organization`),
            role: readOptionalString(item.role, `volunteering[${index}].role`),
            description: readOptionalString(item.description, `volunteering[${index}].description`),
          }))
        : [createEmptyVolunteer()],
    internships:
      internships.length > 0
        ? internships.map((item, index) => ({
            role: readOptionalString(item.role, `internships[${index}].role`),
            company: readOptionalString(item.company, `internships[${index}].company`),
            location: readOptionalString(item.location, `internships[${index}].location`),
            startDate: readOptionalString(item.startDate, `internships[${index}].startDate`),
            endDate: readOptionalString(item.endDate, `internships[${index}].endDate`),
            description: readOptionalString(item.description, `internships[${index}].description`),
            technologies: readOptionalString(item.technologies, `internships[${index}].technologies`),
          }))
        : [createEmptyInternship()],
    caseStudies:
      caseStudies.length > 0
        ? caseStudies.map((item, index) => ({
            title: readOptionalString(item.title, `caseStudies[${index}].title`),
            problem: readOptionalString(item.problem, `caseStudies[${index}].problem`),
            solution: readOptionalString(item.solution, `caseStudies[${index}].solution`),
            technologies: readOptionalString(item.technologies, `caseStudies[${index}].technologies`),
            outcome: readOptionalString(item.outcome, `caseStudies[${index}].outcome`),
            lessons: readOptionalString(item.lessons, `caseStudies[${index}].lessons`),
          }))
        : [createEmptyCaseStudy()],
    testimonials:
      testimonials.length > 0
        ? testimonials.map((item, index) => ({
            quote: readOptionalString(item.quote, `testimonials[${index}].quote`),
            author: readOptionalString(item.author, `testimonials[${index}].author`),
            role: readOptionalString(item.role, `testimonials[${index}].role`),
          }))
        : [createEmptyTestimonial()],
    sectionOrder:
      value.sectionOrder === undefined
        ? createSectionOrder()
        : normalizeSectionOrder(sectionOrder),
    sectionVisibility: {
      ...createSectionVisibility(),
      ...sectionVisibility,
    },
    sectionItemVisibility: {
      ...createSectionItemVisibility(),
      ...sectionItemVisibility,
    },
  }
}

function normalizeLines(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function isHeading(line) {
  return /^(about|summary|profile|skills?|technical skills?|experience|work experience|education|links?|contact)$/i.test(
    line.replace(/:$/, ''),
  )
}

function extractSkillTokens(value) {
  return value
    .replace(/^(skills?|technical skills?)\s*:\s*/i, '')
    .split(/[,\u2022;|/]+/)
    .map((skill) => skill.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
}

/**
 * Parse freeform CV text and return partial CV fields with detected values.
 * @param {string} value
 * @param {{ locale?: Locale }} [options]
 * @returns {Partial<CvData>}
 */
export function parsePastedCvText(value, options = {}) {
  const locale = options.locale === 'fi' ? 'fi' : 'en'
  const missingPasteMessage = locale === 'fi'
    ? 'Liitä CV-teksti ennen tuontia.'
    : 'Paste CV text before importing it.'
  const detectFailMessage = locale === 'fi'
    ? 'Liitetystä CV-tekstistä ei löytynyt nimeä, titteliä tai taitoja.'
    : 'Could not detect a name, title, or skills from the pasted CV text.'

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(missingPasteMessage)
  }

  const lines = normalizeLines(value)

  if (lines.length === 0) {
    throw new Error(missingPasteMessage)
  }

  let currentSection = 'about'
  const summaryLines = []
  const collectedSkills = []
  const partialData = {}
  const detectedFullName = lines[0] ?? ''
  const startIndex = lines[1] && !isHeading(lines[1]) ? 2 : 1

  if (detectedFullName) {
    partialData.fullName = detectedFullName
  }

  if (lines[1] && !isHeading(lines[1])) {
    partialData.title = lines[1]
  }

  for (const line of lines.slice(startIndex)) {
    const normalizedHeading = line.replace(/:$/, '').toLowerCase()

    if (/^(about|summary|profile)$/i.test(normalizedHeading)) {
      currentSection = 'about'
      continue
    }

    if (/^(skills?|technical skills?)$/i.test(normalizedHeading)) {
      currentSection = 'skills'
      continue
    }

    if (/^(experience|work experience|education|links?|contact)$/i.test(normalizedHeading)) {
      currentSection = 'other'
      continue
    }

    if (/^(skills?|technical skills?)\s*:/i.test(line)) {
      currentSection = 'skills'
      collectedSkills.push(...extractSkillTokens(line))
      continue
    }

    if (currentSection === 'skills') {
      collectedSkills.push(...extractSkillTokens(line))
      continue
    }

    if (currentSection === 'about') {
      summaryLines.push(line)
    }
  }

  const detectedAbout = summaryLines.slice(0, 3).join(' ')
  const detectedSkills = Array.from(
    new Set(collectedSkills.map((skill) => skill.trim()).filter(Boolean)),
  ).slice(0, 16)

  if (detectedAbout) {
    partialData.about = detectedAbout
  }

  if (detectedSkills.length > 0) {
    partialData.skills = detectedSkills
  }

  if (!partialData.fullName && !partialData.title && !partialData.skills) {
    throw new Error(detectFailMessage)
  }

  return partialData
}
