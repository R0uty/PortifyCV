export const CV_DRAFT_STORAGE_KEY = 'portifycv-draft'
export const CV_ONBOARDING_SEEN_STORAGE_KEY = 'portifycv-onboarding-seen'

export const createEmptyExperience = () => ({
  role: '',
  company: '',
  startDate: '',
  endDate: '',
  description: '',
})

export const createEmptyEducation = () => ({
  school: '',
  degree: '',
  startDate: '',
  endDate: '',
})

export const createEmptyLinks = () => ({
  github: '',
  linkedin: '',
  portfolio: '',
  website: '',
})

export const createSectionVisibility = () => ({
  about: true,
  skills: true,
  experience: true,
  education: true,
  links: true,
})

export const createSectionItemVisibility = () => ({
  skills: {},
  experience: {},
  education: {},
  links: {},
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

export const sectionVisibilityFields = [
  { key: 'about', label: 'About' },
  { key: 'skills', label: 'Skills' },
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'links', label: 'Links' },
]

export const createInitialCvData = () => ({
  fullName: '',
  title: '',
  about: '',
  photo: '',
  photoVisibilityByTemplate: createTemplatePhotoVisibility(),
  skills: [],
  experience: [createEmptyExperience()],
  education: [createEmptyEducation()],
  links: createEmptyLinks(),
  sectionVisibility: createSectionVisibility(),
  sectionItemVisibility: createSectionItemVisibility(),
})

export const initialCvData = createInitialCvData()

export const demoCvData = {
  fullName: 'Alex Morgan',
  title: 'Senior Product Designer',
  about:
    'Product designer with 7+ years of experience shaping SaaS workflows, design systems, and portfolio-ready product storytelling across startup and enterprise teams.',
  photo: '',
  photoVisibilityByTemplate: createTemplatePhotoVisibility(),
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
      startDate: 'Jan 2022',
      endDate: 'Present',
      description:
        'Led end-to-end design for a B2B collaboration suite, improving activation by 21% and building a reusable component library for cross-team delivery.',
    },
    {
      role: 'Product Designer',
      company: 'Atlas Labs',
      startDate: 'Jun 2019',
      endDate: 'Dec 2021',
      description:
        'Partnered with engineering and product teams to redesign onboarding flows, launch customer interview loops, and ship data-informed UX improvements.',
    },
  ],
  education: [
    {
      school: 'University of the Arts',
      degree: 'B.A. Graphic Design',
      startDate: '2014',
      endDate: '2018',
    },
  ],
  links: {
    github: 'https://github.com/alexmorgan',
    linkedin: 'https://linkedin.com/in/alexmorgan',
    portfolio: 'https://alexmorgan.design',
    website: 'https://alexmorgan.dev',
  },
}

export const linkFields = [
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
]

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

export function safeStorageRemove(key) {
  if (typeof window === 'undefined') {
    return {
      ok: false,
      error: new Error('Window is unavailable.'),
    }
  }

  try {
    window.localStorage.removeItem(key)

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
  const sectionVisibility = value.sectionVisibility ?? defaultState.sectionVisibility
  const sectionItemVisibility = value.sectionItemVisibility ?? defaultState.sectionItemVisibility
  const photoVisibilityByTemplate =
    value.photoVisibilityByTemplate ?? defaultState.photoVisibilityByTemplate

  validateAllowedKeys(
    value,
    [
      'fullName',
      'title',
      'about',
      'photo',
      'photoVisibilityByTemplate',
      'skills',
      'experience',
      'education',
      'links',
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
      ['role', 'company', 'startDate', 'endDate', 'description'],
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
      ['school', 'degree', 'startDate', 'endDate'],
      `education[${index}]`,
    )
  })

  if (!isPlainObject(links)) {
    throw new Error('links must be an object.')
  }

  validateAllowedKeys(links, ['github', 'linkedin', 'portfolio', 'website'], 'links')

  if (!isPlainObject(sectionVisibility)) {
    throw new Error('sectionVisibility must be an object.')
  }

  validateAllowedKeys(
    sectionVisibility,
    ['about', 'skills', 'experience', 'education', 'links'],
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
    ['skills', 'experience', 'education', 'links'],
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

  return {
    fullName: readOptionalString(value.fullName, 'fullName'),
    title: readOptionalString(value.title, 'title'),
    about: readOptionalString(value.about, 'about'),
    photo: readOptionalString(value.photo, 'photo'),
    photoVisibilityByTemplate: {
      ...createTemplatePhotoVisibility(),
      ...photoVisibilityByTemplate,
    },
    skills: skills.map((skill, index) => readOptionalString(skill, `skills[${index}]`)),
    experience:
      experience.length > 0
        ? experience.map((item, index) => ({
            role: readOptionalString(item.role, `experience[${index}].role`),
            company: readOptionalString(item.company, `experience[${index}].company`),
            startDate: readOptionalString(item.startDate, `experience[${index}].startDate`),
            endDate: readOptionalString(item.endDate, `experience[${index}].endDate`),
            description: readOptionalString(
              item.description,
              `experience[${index}].description`,
            ),
          }))
        : [createEmptyExperience()],
    education:
      education.length > 0
        ? education.map((item, index) => ({
            school: readOptionalString(item.school, `education[${index}].school`),
            degree: readOptionalString(item.degree, `education[${index}].degree`),
            startDate: readOptionalString(item.startDate, `education[${index}].startDate`),
            endDate: readOptionalString(item.endDate, `education[${index}].endDate`),
          }))
        : [createEmptyEducation()],
    links: {
      github: readOptionalString(links.github, 'links.github'),
      linkedin: readOptionalString(links.linkedin, 'links.linkedin'),
      portfolio: readOptionalString(links.portfolio, 'links.portfolio'),
      website: readOptionalString(links.website, 'links.website'),
    },
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

export function parsePastedCvText(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Paste CV text before importing it.')
  }

  const lines = normalizeLines(value)

  if (lines.length === 0) {
    throw new Error('Paste CV text before importing it.')
  }

  const nextState = createInitialCvData()
  let currentSection = 'about'
  const summaryLines = []
  const collectedSkills = []

  nextState.fullName = lines[0] ?? ''
  const startIndex = lines[1] && !isHeading(lines[1]) ? 2 : 1

  if (lines[1] && !isHeading(lines[1])) {
    nextState.title = lines[1]
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

  nextState.about = summaryLines.slice(0, 3).join(' ')
  nextState.skills = Array.from(
    new Set(collectedSkills.map((skill) => skill.trim()).filter(Boolean)),
  ).slice(0, 16)

  if (!nextState.fullName && !nextState.title && nextState.skills.length === 0) {
    throw new Error('Could not detect a name, title, or skills from the pasted CV text.')
  }

  return nextState
}
