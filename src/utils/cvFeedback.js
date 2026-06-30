// @ts-check
import { createCvSnapshot } from './cvSnapshot'

/** @typedef {import('../types/cv').CvData} CvData */

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

function createSectionBadge(items, locale = 'en') {
  if (items.length === 0) {
    return null
  }

  const warningCount = items.filter((item) => item.type === 'warning').length

  return {
    label:
      warningCount > 0
        ? locale === 'fi'
          ? `${warningCount} varoitus${warningCount > 1 ? 'ta' : ''}`
          : `${warningCount} warning${warningCount > 1 ? 's' : ''}`
        : locale === 'fi'
          ? `${items.length} vinkkiä`
          : `${items.length} tip${items.length > 1 ? 's' : ''}`,
    tone: warningCount > 0 ? 'warning' : 'tip',
  }
}

/**
 * @param {CvData} formData
 * @param {{ locale?: 'en' | 'fi' }} [options]
 */
export function evaluateCvFeedback(formData, options = {}) {
  const locale = options.locale === 'fi' ? 'fi' : 'en'
  const isFinnish = locale === 'fi'
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
        title: isFinnish ? 'Lisää vahvempi yhteenveto' : 'Add a stronger summary',
        message: isFinnish
          ? 'Kirjoita 2-3 riviä vahvuuksistasi, painotuksestasi ja tuottamastasi arvosta.'
          : 'Write 2-3 lines about your strengths, focus, and the kind of value you deliver.',
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
        title: isFinnish ? 'Tiivistä yhteenvetoa' : 'Tighten your summary',
        message: isFinnish
          ? 'Pidä esittelyosio tiiviinä, jotta rekrytoija pystyy silmäilemään sen nopeasti.'
          : 'Keep the About section concise so recruiters can scan it quickly.',
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
        title: isFinnish ? 'Lisää mitattava tulos' : 'Add a quantified outcome',
        message: isFinnish
          ? 'Mainitse esimerkiksi kasvu, säästetty aika tai konversioparannus vahvistaaksesi yhteenvetoa.'
          : 'Mention a result such as growth, time saved, or conversion lift to make the summary stronger.',
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
        title: isFinnish ? 'Lisää ydintaidot' : 'Add core skills',
        message: isFinnish
          ? 'CV tarvitsee näkyvän taito-osion, jotta rekrytointi voi kohdistaa sinut rooleihin nopeammin.'
          : 'Your CV needs a visible skills section so hiring teams can match you to roles faster.',
      }),
    )
  } else if (snapshot.skills.length < MIN_SKILL_COUNT) {
    skillsItems.push(
      createFeedbackItem({
        id: 'skills-thin',
        type: 'warning',
        section: 'skills',
        title: isFinnish ? 'Laajenna taitolistaa' : 'Expand your skills list',
        message: isFinnish
          ? `Pyri vähintään ${MIN_SKILL_COUNT} relevanttiin taitoon osaamisen laajuuden ja avainsanojen kattavuuden parantamiseksi.`
          : `Aim for at least ${MIN_SKILL_COUNT} relevant skills to show range and improve keyword coverage.`,
      }),
    )
  }

  if (snapshot.experience.length === 0) {
    experienceItems.push(
      createFeedbackItem({
        id: 'experience-empty',
        type: 'warning',
        section: 'experience',
        title: isFinnish ? 'Lisää työkokemusta' : 'Add work experience',
        message: isFinnish
          ? 'Jo yksi vahva rooli tuloskeskeisellä kuvauksella tekee CV:stä uskottavamman.'
          : 'Even one strong role with a result-focused description makes the CV more credible.',
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
          title: isFinnish ? `Lisää vaikutus rooliin ${index + 1}` : `Add impact for role ${index + 1}`,
          message: isFinnish
            ? 'Kuvaa mitä toimitit, paransit tai omistit, jotta rooli näkyy aidosti kokemuksena.'
            : 'Describe what you shipped, improved, or owned so this role reads as real experience.',
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
          title: isFinnish ? `Tiivistä kokemus ${index + 1}` : `Trim experience ${index + 1}`,
          message: isFinnish
            ? 'Lyhyet saavutuksia kuvaavat lauseet ovat helpommin silmäiltäviä kuin pitkät kappaleet.'
            : 'Shorter accomplishment statements are easier to scan than long paragraphs.',
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
          title: isFinnish ? `Lisää lukuja kokemukseen ${index + 1}` : `Add numbers to experience ${index + 1}`,
          message: isFinnish
            ? 'Lisää mittari, kuten käyttöönotto, liikevaihto, säästetty aika tai kasvu, osoittamaan mitattava vaikutus.'
            : 'Include a metric like adoption, revenue, time saved, or growth to show measurable impact.',
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
    profile: createSectionBadge(profileItems, locale),
    skills: createSectionBadge(skillsItems, locale),
    experience: createSectionBadge([...experienceItems, ...flattenedExperienceItems], locale),
    },
  }
}

export function improveAboutText(formData, options = {}) {
  const locale = options.locale === 'fi' ? 'fi' : 'en'
  const isFinnish = locale === 'fi'
  const snapshot = createCvSnapshot(formData)
  const title = snapshot.title || (isFinnish ? 'Ammattilainen' : 'Professional')
  const skillsText =
  snapshot.skills.length > 0
    ? snapshot.skills.slice(0, 3).join(', ')
    : isFinnish ? 'strategia, toteutus ja yhteistyö' : 'strategy, execution, and collaboration'

  if (!snapshot.about) {
  return isFinnish
    ? `${title}, painotus ${skillsText}, monialainen yhteistyö ja mitattava liiketoimintavaikutus.`
    : `${title} focused on ${skillsText}, cross-functional delivery, and measurable business impact.`
  }

  const shortenedText = limitWordCount(snapshot.about, 38)

  return ensureSentence(shortenedText)
}

export function improveExperienceText(item, options = {}) {
  const locale = options.locale === 'fi' ? 'fi' : 'en'
  const isFinnish = locale === 'fi'
  const role = trimValue(item.role)
  const company = trimValue(item.company)
  const description = trimValue(item.description)

  if (!description) {
    if (role && company) {
      return isFinnish
        ? `Johdin ${role.toLowerCase()}-työtä yrityksessä ${company}, yhteistyössä eri tiimien kanssa selkeän liiketoimintavaikutuksen saavuttamiseksi.`
        : `Led ${role.toLowerCase()} work at ${company}, partnering across teams to ship improvements with clear business impact.`
    }

    if (role) {
      return isFinnish
        ? `Toteutin ${role.toLowerCase()}-työtä suunnittelusta toteutukseen ja mitattaviin tuloksiin asti.`
        : `Delivered ${role.toLowerCase()} work across planning, execution, and measurable outcome tracking.`
    }

    if (company) {
      return isFinnish
        ? `Tuin keskeisiä hankkeita yrityksessä ${company} ja autoin tiimiä saavuttamaan parempia tuloksia sujuvammin.`
        : `Supported key initiatives at ${company}, helping the team deliver stronger results and smoother execution.`
    }

    return isFinnish
      ? 'Johdin monialaista työtä, paransin toteutusta ja saavutimme tiiminä parempia tuloksia.'
      : 'Led cross-functional work, improved execution, and delivered stronger outcomes for the team.'
  }

  return ensureSentence(limitWordCount(description, 30))
}
