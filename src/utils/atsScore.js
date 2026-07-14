// @ts-check
import { createCvSnapshot } from './cvSnapshot'

/** @typedef {import('../types/cv').CvData} CvData */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

const COMMON_STOP_WORDS = new Set([
  'about', 'after', 'also', 'and', 'any', 'are', 'but', 'can', 'for', 'from', 'have',
  'into', 'its', 'job', 'more', 'not', 'our', 'role', 'such', 'that', 'the', 'their',
  'them', 'then', 'this', 'use', 'using', 'with', 'your', 'you', 'will', 'who',
])

function countWords(text) {
  const normalized = text.trim()

  if (!normalized) {
    return 0
  }

  return normalized.split(/\s+/).length
}

function extractKeywords(snapshot) {
  const rawKeywords = [
    snapshot.title,
    ...snapshot.skills,
    ...snapshot.experience.flatMap((item) => [item.role, item.company]),
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

function extractTextTokens(text) {
  if (!text.trim()) {
    return []
  }

  return text
    .toLowerCase()
    .split(/[^a-z0-9+#/.%-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4 && !COMMON_STOP_WORDS.has(token))
}

function sortByFrequency(tokens) {
  const frequencyMap = new Map()

  tokens.forEach((token) => {
    frequencyMap.set(token, (frequencyMap.get(token) ?? 0) + 1)
  })

  return [...frequencyMap.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([token]) => token)
}

function createAtsCopy(locale = 'en') {
  const isFinnish = locale === 'fi'

  return {
    keywordDensityLabel: isFinnish ? 'Avainsanatiheys' : 'Keyword density',
    sectionCompletenessLabel: isFinnish ? 'Osioiden kattavuus' : 'Section completeness',
    lengthLabel: isFinnish ? 'Pituuspisteytys' : 'Length scoring',
    formattingLabel: isFinnish ? 'Muotoilun yksinkertaisuus' : 'Formatting simplicity',
    strong: isFinnish ? 'Vahva' : 'Strong',
    solid: isFinnish ? 'Hyvä' : 'Solid',
    needsPolish: isFinnish ? 'Kaipaa hiomista' : 'Needs polish',
    needsWork: isFinnish ? 'Kaipaa työtä' : 'Needs work',
    keywordMissing: isFinnish
      ? 'Lisää roolikohtaisia avainsanoja otsikkoon, taitoihin ja kokemukseen.'
      : 'Add more role-specific keywords in your title, skills, and experience.',
    keywordGood: isFinnish
      ? 'Avainsanojen kattavuus on hyvä yhteenvedossa ja kokemuksessa.'
      : 'Good keyword coverage across your summary and experience.',
    keywordImprove: isFinnish
      ? 'Toista kohderoolin tärkeät avainsanat yhteenvedossa ja kokemuskohdissa.'
      : 'Repeat important keywords from your target role inside your summary and experience bullets.',
    sectionsReady: isFinnish
      ? 'Keskeiset ATS-osiot ovat mukana.'
      : 'Core ATS sections are present.',
    sectionsMissingPrefix: isFinnish ? 'Lisää tai laajenna: ' : 'Add or expand: ',
    lengthGood: isFinnish
      ? 'Osioiden pituus on riittävän tiivis ATS:lle ja rekrytoijan silmäilyyn.'
      : 'Section lengths are concise enough for fast ATS and recruiter scanning.',
    lengthImprove: isFinnish
      ? 'Lyhennä pitkiä kappaleita ja pidä jokainen kokemuskohde yhteen tulokseen fokusoituna.'
      : 'Shorten long paragraphs and keep each experience entry focused on one result.',
    atsModeOn: isFinnish
      ? 'ATS-tila käyttää yksinkertaista ja jäsentäjäystävällistä asettelua.'
      : 'ATS-friendly mode is using a simplified, parser-safe layout.',
    atsModeOff: isFinnish
      ? 'Kaikki pohjat ovat minimalistisia. Ota ATS-tila käyttöön maksimaalista yhteensopivuutta varten.'
      : 'All templates use a minimal styling system. Enable ATS-friendly mode for maximum parser compatibility.',
    tipKeyword: isFinnish
      ? 'Peilaa työpaikkailmoitusta toistamalla ydintermit yhteenvedossa ja kokemuskohdissa.'
      : 'Mirror the job description by repeating core role keywords in your About section and experience bullets.',
    tipSections: isFinnish
      ? 'Täydennä kaikki pääosiot: titteli, yhteenveto, taidot, kokemus, koulutus ja vähintään yksi linkki.'
      : 'Complete every major section: title, summary, skills, experience, education, and at least one link.',
    tipLength: isFinnish
      ? 'Pidä yhteenveto noin 70-80 sanassa ja tiivistä kokemuskohdat yhteen saavutukseen.'
      : 'Keep summaries under 70-80 words and trim each experience description into a focused accomplishment statement.',
    tipAtsOn: isFinnish
      ? 'Pidä nykyinen yksinkertainen asettelu hakuihin, joissa ATS-jäsennys on kriittinen.'
      : 'Keep the current simplified layout for applications that rely heavily on ATS parsing.',
    tipAtsOff: isFinnish
      ? 'Ota ATS-tila käyttöön, jotta koristeelliset elementit vähenevät ja jäsennys paranee.'
      : 'Enable ATS-friendly mode to remove decorative layout choices and improve parser compatibility.',
    tipStrong: isFinnish
      ? 'CV on ATS-näkökulmasta vahva. Räätälöi avainsanat jokaiseen hakemukseen.'
      : 'Your CV is in strong ATS shape. Tailor keywords to each application for even better alignment.',
  }
}

/**
 * @param {CvData} formData
 * @param {string} [jobDescription='']
 */
export function analyzeJobDescription(formData, jobDescription = '') {
  const snapshot = createCvSnapshot(formData)
  const normalizedDescription = jobDescription.trim()

  if (!normalizedDescription) {
    return {
      hasInput: false,
      coverageScore: 0,
      totalKeywords: 0,
      matchedKeywords: [],
      missingKeywords: [],
    }
  }

  const jobTokens = sortByFrequency(extractTextTokens(normalizedDescription)).slice(0, 30)
  const cvKeywordSet = new Set([
    ...extractKeywords(snapshot),
    ...extractTextTokens(snapshot.about),
    ...snapshot.experience.flatMap((item) => extractTextTokens(item.description)),
  ])
  const matchedKeywords = jobTokens.filter((token) => cvKeywordSet.has(token))
  const missingKeywords = jobTokens.filter((token) => !cvKeywordSet.has(token))
  const coverageScore =
    jobTokens.length > 0 ? Math.round((matchedKeywords.length / jobTokens.length) * 100) : 0

  return {
    hasInput: true,
    coverageScore,
    totalKeywords: jobTokens.length,
    matchedKeywords,
    missingKeywords,
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
    }
  }

  const matchedKeywordCount = keywords.filter((keyword) => content.includes(keyword)).length
  const coverage = matchedKeywordCount / keywords.length
  const score = Math.round(coverage * 25)

  return {
    score: clamp(score, 0, 25),
    summary:
      coverage >= 0.7
        ? copy.keywordGood
        : copy.keywordImprove,
  }
}

function scoreSectionCompleteness(snapshot, copy) {
  let score = 0
  const missingSections = []

  if (snapshot.fullName) score += 4
  else missingSections.push('full name')

  if (snapshot.title) score += 4
  else missingSections.push('title')

  if (snapshot.about) score += 5
  else missingSections.push('about')

  if (snapshot.skills.length > 0) score += 5
  else missingSections.push('skills')

  if (snapshot.experience.length > 0) score += 7
  else missingSections.push('experience')

  if (snapshot.education.length > 0) score += 3
  else missingSections.push('education')

  if (Object.keys(snapshot.links).length > 0) score += 2
  else missingSections.push('links')

  return {
    score,
    summary:
      missingSections.length === 0
        ? copy.sectionsReady
        : `${copy.sectionsMissingPrefix}${missingSections.slice(0, 3).join(', ')}.`,
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
