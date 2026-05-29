import { createCvSnapshot } from './exporters'

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

function scoreKeywordDensity(snapshot) {
  const keywords = extractKeywords(snapshot)
  const content = [snapshot.about, ...snapshot.experience.map((item) => item.description)]
    .join(' ')
    .toLowerCase()

  if (keywords.length === 0) {
    return {
      score: 8,
      summary: 'Add more role-specific keywords in your title, skills, and experience.',
    }
  }

  const matchedKeywordCount = keywords.filter((keyword) => content.includes(keyword)).length
  const coverage = matchedKeywordCount / keywords.length
  const score = Math.round(coverage * 25)

  return {
    score: clamp(score, 0, 25),
    summary:
      coverage >= 0.7
        ? 'Good keyword coverage across your summary and experience.'
        : 'Repeat important keywords from your target role inside your summary and experience bullets.',
  }
}

function scoreSectionCompleteness(snapshot) {
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
        ? 'Core ATS sections are present.'
        : `Add or expand: ${missingSections.slice(0, 3).join(', ')}.`,
  }
}

function scoreLength(snapshot) {
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
        ? 'Section lengths are concise enough for fast ATS and recruiter scanning.'
        : 'Shorten long paragraphs and keep each experience entry focused on one result.',
  }
}

function scoreFormattingSimplicity({ atsFriendly }) {
  if (atsFriendly) {
    return {
      score: 20,
      summary: 'ATS-friendly mode is using a simplified, parser-safe layout.',
    }
  }

  return {
    score: 16,
    summary: 'All templates use a minimal styling system. Enable ATS-friendly mode for maximum parser compatibility.',
  }
}

function createImprovementTips(breakdown, options) {
  const tips = []

  if (breakdown.keywordDensity.score < 18) {
    tips.push('Mirror the job description by repeating core role keywords in your About section and experience bullets.')
  }

  if (breakdown.sectionCompleteness.score < 24) {
    tips.push('Complete every major section: title, summary, skills, experience, education, and at least one link.')
  }

  if (breakdown.length.score < 18) {
    tips.push('Keep summaries under 70-80 words and trim each experience description into a focused accomplishment statement.')
  }

  if (breakdown.formattingSimplicity.score < 16) {
    tips.push(
      options.atsFriendly
        ? 'Keep the current simplified layout for applications that rely heavily on ATS parsing.'
        : 'Enable ATS-friendly mode to remove decorative layout choices and improve parser compatibility.',
    )
  }

  if (tips.length === 0) {
    tips.push('Your CV is in strong ATS shape. Tailor keywords to each application for even better alignment.')
  }

  return tips
}

export function evaluateAtsScore(formData, options = {}) {
  const snapshot = createCvSnapshot(formData)
  const keywordDensity = scoreKeywordDensity(snapshot)
  const sectionCompleteness = scoreSectionCompleteness(snapshot)
  const length = scoreLength(snapshot)
  const formattingSimplicity = scoreFormattingSimplicity(options)
  const totalScore =
    keywordDensity.score +
    sectionCompleteness.score +
    length.score +
    formattingSimplicity.score

  const breakdown = {
    keywordDensity: {
      label: 'Keyword density',
      maxScore: 25,
      ...keywordDensity,
    },
    sectionCompleteness: {
      label: 'Section completeness',
      maxScore: 30,
      ...sectionCompleteness,
    },
    length: {
      label: 'Length scoring',
      maxScore: 25,
      ...length,
    },
    formattingSimplicity: {
      label: 'Formatting simplicity',
      maxScore: 20,
      ...formattingSimplicity,
    },
  }

  return {
    score: clamp(totalScore, 0, 100),
    rating:
      totalScore >= 85
        ? 'Strong'
        : totalScore >= 70
          ? 'Solid'
          : totalScore >= 55
            ? 'Needs polish'
            : 'Needs work',
    breakdown,
    improvementTips: createImprovementTips(breakdown, options),
  }
}
