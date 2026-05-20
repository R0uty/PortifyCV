import { createCvSnapshot } from './exporters'

const MIN_SKILL_COUNT = 4
const ABOUT_WORD_LIMIT = 60
const EXPERIENCE_WORD_LIMIT = 42
const METRIC_PATTERN = /\b\d+(?:[.,]\d+)?\s?(?:%|x|k|m)?\b/i

function trimValue(value) {
  return value.trim()
}

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim()
}

function countWords(text) {
  const normalizedText = normalizeText(text)

  if (!normalizedText) {
    return 0
  }

  return normalizedText.split(/\s+/).length
}

function hasMetric(text) {
  return METRIC_PATTERN.test(text)
}

function ensureSentence(text) {
  const normalizedText = normalizeText(text)

  if (!normalizedText) {
    return ''
  }

  const withCapitalizedStart =
    normalizedText.charAt(0).toUpperCase() + normalizedText.slice(1)

  return /[.!?]$/.test(withCapitalizedStart)
    ? withCapitalizedStart
    : `${withCapitalizedStart}.`
}

function limitWordCount(text, maxWords) {
  const words = normalizeText(text).split(/\s+/)

  if (words.length <= maxWords) {
    return normalizeText(text)
  }

  return `${words.slice(0, maxWords).join(' ')}...`
}

function createFeedbackItem({
  id,
  type,
  section,
  title,
  message,
  action = null,
  category = 'quality',
}) {
  return { id, type, section, title, message, action, category }
}

function createSectionBadge(items) {
  if (items.length === 0) {
    return null
  }

  const warningCount = items.filter((item) => item.type === 'warning').length

  return {
    label:
      warningCount > 0
        ? `${warningCount} warning${warningCount > 1 ? 's' : ''}`
        : `${items.length} tip${items.length > 1 ? 's' : ''}`,
    tone: warningCount > 0 ? 'warning' : 'tip',
  }
}

export function evaluateCvFeedback(formData) {
  const snapshot = createCvSnapshot(formData)
  const profileItems = []
  const skillsItems = []
  const experienceItems = []
  const experienceItemTips = formData.experience.map(() => [])
  const metricsItems = []

  if (!snapshot.about) {
    profileItems.push(
      createFeedbackItem({
        id: 'about-missing',
        type: 'tip',
        section: 'profile',
        title: 'Add a stronger summary',
        message: 'Write 2-3 lines about your strengths, focus, and the kind of value you deliver.',
        action: { type: 'about' },
      }),
    )
  }

  if (countWords(snapshot.about) > ABOUT_WORD_LIMIT) {
    profileItems.push(
      createFeedbackItem({
        id: 'about-too-long',
        type: 'warning',
        section: 'profile',
        title: 'Tighten your summary',
        message: 'Keep the About section concise so recruiters can scan it quickly.',
        action: { type: 'about' },
      }),
    )
  }

  if (snapshot.about && !hasMetric(snapshot.about)) {
    metricsItems.push(
      createFeedbackItem({
        id: 'about-metrics',
        type: 'tip',
        section: 'profile',
        title: 'Add a quantified outcome',
        message: 'Mention a result such as growth, time saved, or conversion lift to make the summary stronger.',
        category: 'metrics',
      }),
    )
  }

  if (snapshot.skills.length === 0) {
    skillsItems.push(
      createFeedbackItem({
        id: 'skills-missing',
        type: 'warning',
        section: 'skills',
        title: 'Add core skills',
        message: 'Your CV needs a visible skills section so hiring teams can match you to roles faster.',
      }),
    )
  } else if (snapshot.skills.length < MIN_SKILL_COUNT) {
    skillsItems.push(
      createFeedbackItem({
        id: 'skills-thin',
        type: 'warning',
        section: 'skills',
        title: 'Expand your skills list',
        message: `Aim for at least ${MIN_SKILL_COUNT} relevant skills to show range and improve keyword coverage.`,
      }),
    )
  }

  if (snapshot.experience.length === 0) {
    experienceItems.push(
      createFeedbackItem({
        id: 'experience-empty',
        type: 'warning',
        section: 'experience',
        title: 'Add work experience',
        message: 'Even one strong role with a result-focused description makes the CV more credible.',
      }),
    )
  }

  formData.experience.forEach((item, index) => {
    const role = trimValue(item.role)
    const company = trimValue(item.company)
    const description = trimValue(item.description)
    const hasEntryContent =
      role ||
      company ||
      trimValue(item.startDate) ||
      trimValue(item.endDate) ||
      description

    if (!hasEntryContent) {
      return
    }

    if (!description) {
      experienceItemTips[index].push(
        createFeedbackItem({
          id: `experience-description-${index}`,
          type: 'warning',
          section: 'experience',
          title: `Add impact for role ${index + 1}`,
          message: 'Describe what you shipped, improved, or owned so this role reads as real experience.',
          action: { type: 'experience', index },
        }),
      )

      return
    }

    if (countWords(description) > EXPERIENCE_WORD_LIMIT) {
      experienceItemTips[index].push(
        createFeedbackItem({
          id: `experience-too-long-${index}`,
          type: 'warning',
          section: 'experience',
          title: `Trim experience ${index + 1}`,
          message: 'Shorter accomplishment statements are easier to scan than long paragraphs.',
          action: { type: 'experience', index },
        }),
      )
    }

    if (!hasMetric(description)) {
      metricsItems.push(
        createFeedbackItem({
          id: `experience-metrics-${index}`,
          type: 'tip',
          section: 'experience',
          title: `Add numbers to experience ${index + 1}`,
          message: 'Include a metric like adoption, revenue, time saved, or growth to show measurable impact.',
          category: 'metrics',
        }),
      )
    }
  })

  const flattenedExperienceItems = experienceItemTips.flat()
  const allPriorityItems = [...profileItems, ...skillsItems, ...experienceItems, ...flattenedExperienceItems]

  return {
    warningCount: [...allPriorityItems, ...metricsItems].filter((item) => item.type === 'warning').length,
    tipCount: [...allPriorityItems, ...metricsItems].filter((item) => item.type === 'tip').length,
    metricsCount: metricsItems.length,
    priorityItems: allPriorityItems,
    metricsItems,
    inlineTips: {
      profile: profileItems,
      skills: skillsItems,
      experience: experienceItems,
      experienceItems: experienceItemTips,
    },
    sectionBadges: {
      profile: createSectionBadge(profileItems),
      skills: createSectionBadge(skillsItems),
      experience: createSectionBadge([...experienceItems, ...flattenedExperienceItems]),
    },
  }
}

export function improveAboutText(formData) {
  const snapshot = createCvSnapshot(formData)
  const title = snapshot.title || 'Professional'
  const skillsText =
    snapshot.skills.length > 0
      ? snapshot.skills.slice(0, 3).join(', ')
      : 'strategy, execution, and collaboration'

  if (!snapshot.about) {
    return `${title} focused on ${skillsText}, cross-functional delivery, and measurable business impact.`
  }

  const shortenedText = limitWordCount(snapshot.about, 38)

  return ensureSentence(shortenedText)
}

export function improveExperienceText(item) {
  const role = trimValue(item.role)
  const company = trimValue(item.company)
  const description = trimValue(item.description)

  if (!description) {
    if (role && company) {
      return `Led ${role.toLowerCase()} work at ${company}, partnering across teams to ship improvements with clear business impact.`
    }

    if (role) {
      return `Delivered ${role.toLowerCase()} work across planning, execution, and measurable outcome tracking.`
    }

    if (company) {
      return `Supported key initiatives at ${company}, helping the team deliver stronger results and smoother execution.`
    }

    return 'Led cross-functional work, improved execution, and delivered stronger outcomes for the team.'
  }

  return ensureSentence(limitWordCount(description, 30))
}
