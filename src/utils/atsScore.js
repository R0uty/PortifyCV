// @ts-check
import { createCvSnapshot } from './cvSnapshot'
import { feedback } from '../i18n/feedback/index.js'

/** @typedef {import('../types/cv').CvData} CvData */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function countWords(text) {
  const normalized = text.trim()

  if (!normalized) {
    return 0
  }

  return normalized.split(/\s+/).length
}

function extractKeywords(snapshot) {
  // Deliberately excludes employer names. A company name ("Example Oy",
  // "Acme Corp") is not a role-relevant ATS keyword, and splitting it
  // into tokens produced nonsense advice like "your CV is missing the
  // keyword 'labs'". Job titles and skills are the terms worth repeating.
  const rawKeywords = [
    snapshot.title,
    ...snapshot.skills,
    ...snapshot.experience.map((item) => item.role),
  ]

  return Array.from(
    new Set(
      rawKeywords
        .flatMap((value) => value.toLowerCase().split(/[^a-z0-9+#/.%-]+/))
        .map((value) => value.trim())
        .filter((value) => value.length >= 3),
    ),
  )
}

function createAtsCopy(locale = 'en') {
  const t = (key, vars) => feedback.t(locale, key, vars)

  return {
    keywordDensityLabel: t('ats.keywordDensityLabel'),
    sectionCompletenessLabel: t('ats.sectionCompletenessLabel'),
    lengthLabel: t('ats.lengthLabel'),
    formattingLabel: t('ats.formattingLabel'),
    strong: t('ats.strong'),
    solid: t('ats.solid'),
    needsPolish: t('ats.needsPolish'),
    needsWork: t('ats.needsWork'),
    keywordMissing: t('ats.keywordMissing'),
    keywordGood: t('ats.keywordGood'),
    keywordImprove: t('ats.keywordImprove'),
    sectionsReady: t('ats.sectionsReady'),
    sectionsMissing: (sections) => t('ats.sectionsMissing', { sections }),
    // The names the hint above lists (1.6.89: they used to stay English).
    sectionName: (key) => t(key),
    lengthGood: t('ats.lengthGood'),
    lengthImprove: t('ats.lengthImprove'),
    atsModeOn: t('ats.atsModeOn'),
    atsModeOff: t('ats.atsModeOff'),
    tipKeyword: t('ats.tipKeyword'),
    tipSections: t('ats.tipSections'),
    tipLength: t('ats.tipLength'),
    tipAtsOn: t('ats.tipAtsOn'),
    tipAtsOff: t('ats.tipAtsOff'),
    tipStrong: t('ats.tipStrong'),
  }
}

function scoreKeywordDensity(snapshot, copy) {
  const keywords = extractKeywords(snapshot)
  const content = [snapshot.about, ...snapshot.experience.map((item) => item.description)]
    .join(' ')
    .toLowerCase()

  if (keywords.length === 0) {
    return {
      score: 8,
      summary: copy.keywordMissing,
      matchedKeywords: [],
      missingKeywords: [],
    }
  }

  const matchedKeywords = keywords.filter((keyword) => content.includes(keyword))
  const missingKeywords = keywords.filter((keyword) => !content.includes(keyword))
  const coverage = matchedKeywords.length / keywords.length
  const score = Math.round(coverage * 25)

  return {
    score: clamp(score, 0, 25),
    summary:
      coverage >= 0.7
        ? copy.keywordGood
        : copy.keywordImprove,
    matchedKeywords,
    missingKeywords,
  }
}

function scoreSectionCompleteness(snapshot, copy) {
  let score = 0
  const missingSections = []

  if (snapshot.fullName) score += 4
  else missingSections.push('ats.sectionNames.fullName')

  if (snapshot.title) score += 4
  else missingSections.push('ats.sectionNames.title')

  if (snapshot.about) score += 5
  else missingSections.push('ats.sectionNames.about')

  if (snapshot.skills.length > 0) score += 5
  else missingSections.push('ats.sectionNames.skills')

  if (snapshot.experience.length > 0) score += 7
  else missingSections.push('ats.sectionNames.experience')

  if (snapshot.education.length > 0) score += 3
  else missingSections.push('ats.sectionNames.education')

  if (Object.keys(snapshot.links).length > 0) score += 2
  else missingSections.push('ats.sectionNames.links')

  return {
    score,
    summary:
      missingSections.length === 0
        ? copy.sectionsReady
        : copy.sectionsMissing(missingSections.slice(0, 3).map(copy.sectionName).join(', ')),
  }
}

function scoreLength(snapshot, copy) {
  const aboutWords = countWords(snapshot.about)
  const experienceDescriptions = snapshot.experience.map((item) => countWords(item.description))

  let score = 25

  if (aboutWords > 90 || aboutWords === 0) {
    score -= 8
  } else if (aboutWords > 70) {
    score -= 4
  }

  if (experienceDescriptions.length === 0) {
    score -= 10
  } else {
    experienceDescriptions.forEach((words) => {
      if (words === 0) {
        score -= 5
      } else if (words > 55) {
        score -= 4
      } else if (words > 40) {
        score -= 2
      }
    })
  }

  return {
    score: clamp(score, 0, 25),
    summary:
      score >= 20
        ? copy.lengthGood
        : copy.lengthImprove,
  }
}

function scoreFormattingSimplicity({ atsFriendly }, copy) {
  if (atsFriendly) {
    return {
      score: 20,
      summary: copy.atsModeOn,
    }
  }

  return {
    score: 16,
    summary: copy.atsModeOff,
  }
}

function createImprovementTips(breakdown, options, copy) {
  const tips = []

  if (breakdown.keywordDensity.score < 18) {
    tips.push(copy.tipKeyword)
  }

  if (breakdown.sectionCompleteness.score < 24) {
    tips.push(copy.tipSections)
  }

  if (breakdown.length.score < 18) {
    tips.push(copy.tipLength)
  }

  if (breakdown.formattingSimplicity.score < 16) {
    tips.push(
      options.atsFriendly
        ? copy.tipAtsOn
        : copy.tipAtsOff,
    )
  }

  if (tips.length === 0) {
    tips.push(copy.tipStrong)
  }

  return tips
}

/**
 * @param {CvData} formData
 * @param {{ locale?: 'en' | 'fi', jobDescription?: string }} [options]
 */
export function evaluateAtsScore(formData, options = {}) {
  const snapshot = createCvSnapshot(formData)
  const locale = options.locale === 'fi' ? 'fi' : 'en'
  const copy = createAtsCopy(locale)
  const keywordDensity = scoreKeywordDensity(snapshot, copy)
  const sectionCompleteness = scoreSectionCompleteness(snapshot, copy)
  const length = scoreLength(snapshot, copy)
  const formattingSimplicity = scoreFormattingSimplicity(options, copy)
  const totalScore =
    keywordDensity.score +
    sectionCompleteness.score +
    length.score +
    formattingSimplicity.score

  const breakdown = {
    keywordDensity: {
      label: copy.keywordDensityLabel,
      maxScore: 25,
      ...keywordDensity,
    },
    sectionCompleteness: {
      label: copy.sectionCompletenessLabel,
      maxScore: 30,
      ...sectionCompleteness,
    },
    length: {
      label: copy.lengthLabel,
      maxScore: 25,
      ...length,
    },
    formattingSimplicity: {
      label: copy.formattingLabel,
      maxScore: 20,
      ...formattingSimplicity,
    },
  }

  return {
    score: clamp(totalScore, 0, 100),
    rating:
      totalScore >= 85
        ? copy.strong
        : totalScore >= 70
          ? copy.solid
          : totalScore >= 55
            ? copy.needsPolish
            : copy.needsWork,
    breakdown,
    improvementTips: createImprovementTips(breakdown, options, copy),
  }
}
