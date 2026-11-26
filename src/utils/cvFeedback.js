// @ts-check
import { createCvSnapshot } from './cvSnapshot'
import { feedback } from '../i18n/feedback/index.js'

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
  // Finnish (1.6.51): the same passive, duty-list phrasing. "Vastasin" ("I
  // was in charge of") is not on it: it's the usual active way to open a
  // Finnish role description.
  'vastuussa',
  'vastuualue',
  'tehtäviin kuului',
  'tehtäviini kuului',
  'olin mukana',
  'osallistuin',
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
  'monitored', 'triaged', 'patched', 'handled', 'wrote', 'broke', 'produced',
  'coauthored',
  // Finnish (1.6.51), first person: past tense, plus the present for a
  // current role ("Johdan", "Vastaan").
  'johdin', 'rakensin', 'lyhensin', 'vastasin', 'kasvatin', 'vähensin', 'uudistin',
  'otin', 'laskin', 'vedin', 'suunnittelin', 'pidin', 'koulutin', 'nostin',
  'toteutin', 'ohjasin', 'siirsin', 'lanseerasin', 'toimitin', 'julkaisin', 'kehitin',
  'tuotin', 'korjasin', 'mentoroin', 'neuvottelin', 'löysin', 'tuin', 'hoidin',
  'valvoin', 'luokittelin', 'automatisoin', 'käsittelin', 'kirjoitin', 'opetin',
  'tutkin', 'ylitin', 'solmin', 'paljastin', 'paransin', 'loin', 'perustin',
  'koordinoin', 'nopeutin', 'puolitin', 'kaksinkertaistin', 'laajensin', 'käynnistin',
  'ratkaisin', 'skaalasin', 'yksinkertaistin', 'standardoin', 'vahvistin', 'päivitin',
  'voitin', 'analysoin', 'yhdistin', 'keskitin', 'modernisoin', 'määrittelin',
  'pienensin', 'tehostin', 'perehdytin', 'esittelin', 'optimoin', 'integroin',
  'organisoin', 'myin', 'hankin', 'säästin', 'hallinnoin', 'sijoituin', 'avustin',
  'johdan', 'vastaan', 'rakennan', 'kehitän', 'suunnittelen', 'ohjaan', 'opetan',
  'koulutan', 'valvon', 'hoidan', 'seuraan', 'annan',
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
        ? feedback.t(locale, 'sectionBadge.warnings', { count: warningCount })
        : feedback.t(locale, 'sectionBadge.tips', { count: items.length }),
    tone: warningCount > 0 ? 'warning' : 'tip',
  }
}

/**
 * @param {CvData} formData
 * @param {{ locale?: 'en' | 'fi' }} [options]
 */
export function evaluateCvFeedback(formData, options = {}) {
  const locale = options.locale === 'fi' ? 'fi' : 'en'
  const t = (key, vars) => feedback.t(locale, key, vars)
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
        title: t('tips.aboutMissingTitle'),
        message: t('tips.aboutMissing'),
      }),
    )
  }

  if (countWords(snapshot.about) > ABOUT_WORD_LIMIT) {
    profileItems.push(
      createFeedbackItem({
        id: 'about-too-long',
        type: 'warning',
        section: 'profile',
        title: t('tips.aboutTooLongTitle'),
        message: t('tips.aboutTooLong'),
      }),
    )
  }

  if (snapshot.about && !hasMetric(snapshot.about)) {
    metricsItems.push(
      createFeedbackItem({
        id: 'about-metrics',
        type: 'tip',
        section: 'profile',
        title: t('tips.aboutMetricsTitle'),
        message: t('tips.aboutMetrics'),
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
        title: t('tips.skillsMissingTitle'),
        message: t('tips.skillsMissing'),
      }),
    )
  } else if (snapshot.skills.length < MIN_SKILL_COUNT) {
    skillsItems.push(
      createFeedbackItem({
        id: 'skills-thin',
        type: 'warning',
        section: 'skills',
        title: t('tips.skillsThinTitle'),
        message: t('tips.skillsThin', { min: MIN_SKILL_COUNT }),
      }),
    )
  }

  if (snapshot.experience.length === 0) {
    experienceItems.push(
      createFeedbackItem({
        id: 'experience-empty',
        type: 'warning',
        section: 'experience',
        title: t('tips.experienceEmptyTitle'),
        message: t('tips.experienceEmpty'),
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
          title: t('tips.descriptionTitle', { number: index + 1 }),
          message: t('tips.description'),
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
          title: t('tips.tooLongTitle', { number: index + 1 }),
          message: t('tips.tooLong'),
        }),
      )
    }

    if (!hasMetric(description)) {
      metricsItems.push(
        createFeedbackItem({
          id: `experience-metrics-${index}`,
          type: 'tip',
          section: 'experience',
          title: t('tips.metricsTitle', { number: index + 1 }),
          message: t('tips.metrics'),
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
          title: t('tips.weakPhraseTitle', { number: index + 1 }),
          message: t('tips.weakPhrase', { phrase: weakPhrase }),
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
          title: t('tips.actionVerbTitle', { number: index + 1 }),
          message: t('tips.actionVerb'),
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

// ── Bullet hints (1.7.3) ──
// One achievement bullet at a time, shown under that bullet where it is
// edited (Classic's Achievements list, Direct Edit's entry popup). The
// role-level tips above say a role needs work; these say which bullet and
// why. Every rule is a closed list or a count, so a bullet the lists don't
// cover gets no hint rather than a wrong one.

// Stands in for a figure in an example bullet the visitor has to fill in.
export const BULLET_BLANK = '[__]'

const BULLET_WORD_LIMIT = 30
const MAX_HINTS_PER_BULLET = 2
// A bullet this short is still being written, or a label; no number hint.
const NUMBER_HINT_MIN_WORDS = 6

// Openers that describe the person or a duty, not what they did.
const WEAK_OPENERS = new Set([
  'i', 'my', 'we', 'our', 'was', 'were', 'did', 'worked', 'helped', 'assisted',
  'participated', 'involved', 'tasked', 'took',
  // Not "tein": "Tein 90+ asiakashaastattelua" is how Finnish says "Ran".
  'minä', 'me', 'olin', 'olen', 'työskentelin', 'autoin', 'osallistuin',
])

// Words that take space without saying anything a reader can check.
const FILLER_WORDS = [
  'successfully', 'various', 'a variety of', 'etc', 'and more', 'and so on',
  'menestyksekkäästi', 'onnistuneesti', 'erilaisia', 'erilaisten', 'yms', 'jne',
]

function firstWordOf(text) {
  const word = text.trim().replace(/^[-•*–\d.)\s]+/, '').split(/\s+/)[0] ?? ''
  return word.toLowerCase().replace(/[^a-zäöå]/g, '')
}

function findFiller(text) {
  const lowerText = ` ${text.toLowerCase().replace(/[.,;:!?()]/g, ' ')} `
  return FILLER_WORDS.find((word) => lowerText.includes(` ${word} `)) ?? null
}

/**
 * Hints for each bullet of one experience entry, in the bullets' order.
 * @param {string[]} bullets the entry's achievements
 * @param {{ locale?: 'en' | 'fi' }} [options] the UI language of the hints
 * @returns {{ id: string, message: string }[][]}
 */
export function getBulletHints(bullets, options = {}) {
  const t = (key, vars) => feedback.t(options.locale, key, vars)
  const openers = (Array.isArray(bullets) ? bullets : []).map((bullet) => firstWordOf(String(bullet ?? '')))

  return (Array.isArray(bullets) ? bullets : []).map((bullet, index) => {
    const text = normalizeText(String(bullet ?? ''))
    if (!text) return []

    const hints = []
    const words = countWords(text)
    const opener = openers[index]
    const hasBlank = text.includes(BULLET_BLANK)

    if (hasBlank) {
      hints.push({
        id: 'blank',
        message: t('hints.blank', { blank: BULLET_BLANK }),
      })
    }
    const weakPhrase = findWeakPhrase(text)

    if (weakPhrase) {
      hints.push({
        id: 'weak-phrase',
        message: t('hints.weakPhrase', { phrase: weakPhrase }),
      })
    } else if (WEAK_OPENERS.has(opener)) {
      hints.push({
        id: 'weak-opener',
        message: t('hints.weakOpener'),
      })
    }

    const filler = findFiller(text)
    if (filler) {
      hints.push({
        id: 'filler',
        message: t('hints.filler', { filler }),
      })
    }

    if (words > BULLET_WORD_LIMIT) {
      hints.push({
        id: 'too-long',
        message: t('hints.tooLong', { words, limit: BULLET_WORD_LIMIT }),
      })
    }

    const earlier = opener ? openers.slice(0, index).indexOf(opener) : -1
    if (earlier !== -1 && !WEAK_OPENERS.has(opener)) {
      hints.push({
        id: 'repeated-opener',
        message: t('hints.repeatedOpener', { number: earlier + 1 }),
      })
    }

    if (!hasBlank && words >= NUMBER_HINT_MIN_WORDS && !/\d/.test(text)) {
      hints.push({
        id: 'no-number',
        message: t('hints.noNumber'),
      })
    }

    return hints.slice(0, MAX_HINTS_PER_BULLET)
  })
}

/**
 * How many achievements in the exported jobs still hold a blank.
 * A switched-off Experience section exports no jobs, so it counts 0, like a
 * hidden job (the exporters' `sectionVisibility[key] !== false` rule).
 * @param {{ experience?: { achievements?: string[] }[], sectionVisibility?: Record<string, boolean>, sectionItemVisibility?: { experience?: Record<string, boolean> } }} formData
 * @returns {number}
 */
export function countBlankBullets(formData) {
  if (formData?.sectionVisibility?.experience === false) return 0
  const visibility = formData?.sectionItemVisibility?.experience
  return (Array.isArray(formData?.experience) ? formData.experience : []).reduce((total, job, index) => {
    if (visibility?.[String(index)] === false) return total
    const bullets = Array.isArray(job?.achievements) ? job.achievements : []
    return total + bullets.filter((bullet) => String(bullet ?? '').includes(BULLET_BLANK)).length
  }, 0)
}
