// @ts-check
import { createCvSnapshot } from './cvSnapshot'

/** @typedef {import('../types/cv').CvData} CvData */

const MIN_SKILL_COUNT = 4
const ABOUT_WORD_LIMIT = 60
const EXPERIENCE_WORD_LIMIT = 42
const METRIC_PATTERN = /\b\d+(?:[.,]\d+)?\s?(?:%|x|k|m)?\b/i

// Classic passive/vague resume openers. Matched as a substring anywhere in the
// text (not just the start) since "duties included..." and similar phrases as
// often show up mid-sentence as they do at the front of a bullet.
const WEAK_PHRASES = [
  'responsible for',
  'was responsible',
  'duties included',
  'duties include',
  'in charge of',
  'tasked with',
  'worked on',
  'helped with',
  'helped to',
  'assisted with',
  'assisted in',
]

// Common strong resume action verbs, past tense. Used to check the opening
// word of a description or bullet — not exhaustive, just enough to catch the
// common weak openers ("Was...", "Did...", "Worked...") without flagging
// reasonable phrasing this list doesn't happen to include.
const STRONG_ACTION_VERBS = new Set([
  'led', 'built', 'launched', 'reduced', 'increased', 'grew', 'improved', 'designed',
  'shipped', 'delivered', 'managed', 'created', 'implemented', 'streamlined',
  'architected', 'automated', 'negotiated', 'mentored', 'spearheaded', 'optimized',
  'established', 'drove', 'directed', 'coordinated', 'developed', 'engineered',
  'executed', 'achieved', 'accelerated', 'boosted', 'cut', 'decreased', 'doubled',
  'expanded', 'founded', 'generated', 'headed', 'initiated', 'introduced',
  'overhauled', 'pioneered', 'redesigned', 'refactored', 'resolved', 'restructured',
  'revamped', 'scaled', 'secured', 'simplified', 'standardized', 'strengthened',
  'transformed', 'upgraded', 'won', 'authored', 'analyzed', 'consolidated',
  'deployed', 'enhanced', 'facilitated', 'owned', 'partnered', 'presented',
  'trained', 'unified', 'migrated', 'centralized', 'modernized', 'devised',
  'championed', 'orchestrated', 'formulated', 'cultivated', 'defined', 'planned',
])

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

function findWeakPhrase(text) {
  const lowerText = text.toLowerCase()

  return WEAK_PHRASES.find((phrase) => lowerText.includes(phrase)) ?? null
}

function startsWithActionVerb(text) {
  const firstWord = text.trim().replace(/^[-•*\d.)\s]+/, '').split(/\s+/)[0] ?? ''
  const normalizedWord = firstWord.toLowerCase().replace(/[^a-zäöå]/g, '')

  return STRONG_ACTION_VERBS.has(normalizedWord)
}

function createFeedbackItem({
  id,
  type,
  section,
  title,
  message,
  category = 'quality',
}) {
  return { id, type, section, title, message, category }
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

    const bulletTexts = [description, ...item.achievements.map(trimValue)].filter(Boolean)
    const weakPhrase = bulletTexts.map(findWeakPhrase).find(Boolean)

    if (weakPhrase) {
      experienceItemTips[index].push(
        createFeedbackItem({
          id: `experience-weak-phrase-${index}`,
          type: 'tip',
          section: 'experience',
          title: isFinnish ? `Vahvista sanamuotoa roolissa ${index + 1}` : `Strengthen the wording in role ${index + 1}`,
          message: isFinnish
            ? `Korvaa passiivinen ilmaisu kuten "${weakPhrase}" konkreettisella tuloksella, esim. "Paransin..." tai "Toteutin...".`
            : `Swap passive phrasing like "${weakPhrase}" for a specific outcome, e.g. "Reduced...", "Led...", or "Built...".`,
          category: 'phrasing',
        }),
      )
    }

    if (bulletTexts.length > 0 && bulletTexts.every((text) => !startsWithActionVerb(text))) {
      experienceItemTips[index].push(
        createFeedbackItem({
          id: `experience-action-verb-${index}`,
          type: 'tip',
          section: 'experience',
          title: isFinnish ? `Aloita toimintaverbillä roolissa ${index + 1}` : `Open with an action verb in role ${index + 1}`,
          message: isFinnish
            ? 'Aloita kuvaus tai luetelmakohta vahvalla verbillä, kuten "Johdin", "Rakensin" tai "Paransin", passiivisen kielen sijaan.'
            : 'Start the description or bullet with a strong verb like "Led," "Built," or "Improved" instead of a passive opener.',
          category: 'phrasing',
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
