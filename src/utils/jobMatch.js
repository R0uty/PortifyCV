// @ts-check
// What a job ad asks for, and what of it the CV already says (1.7.2).
//
// Replaces the old word-frequency count, which listed words like "team",
// "looking" and "helsinki." as missing keywords, dropped short terms like
// CSS, and broke Finnish words apart at every "ä". A requirement here is
// one of three things found in the ad:
//   1. a term from jobTerms.js (skills, tools, methods; English and Finnish)
//   2. a tech name or acronym by its shape: TypeScript, Next.js, CI/CD, C#, WCAG
//   3. one of the CV's own skills, so a nurse's "Triage" counts too
// Plain capitalised words (cities, company names) are never requirements.
//
// Finnish inflects words ("Reactista", "saavutettavuuden", "CSS-osaamista");
// a word matches a term when it is the term plus a known ending, and a
// hyphenated compound is also read part by part.

import { createCvSnapshot } from './cvSnapshot'
import { IGNORED_NAMES, JOB_TERMS, NAME_ONLY_TERMS } from './jobTerms'

/** @typedef {import('../types/cv').CvData} CvData */

const MAX_REQUIREMENTS = 30

// Case endings (Finnish) and plurals (English) a term may carry in the ad
// or the CV. Kept as a closed list so "Java" never matches "JavaScript".
const ENDINGS = new Set([
  's', 'es', 'n', 'a', 'ä', 't', 'ta', 'tä', 'na', 'nä', 'ia', 'iä', 'in', 'ja', 'jä',
  'ssa', 'ssä', 'sta', 'stä', 'lla', 'llä', 'lta', 'ltä', 'lle', 'ksi', 'iin', 'ien', 'jen',
  'ista', 'istä', 'issa', 'issä', 'ihin', 'ille', 'illa', 'illä', 'ilta', 'iltä', 'ita', 'itä',
  'iksi', 'ina', 'inä', 'ineen', 'aan', 'ään', 'een', 'den', 'tta', 'ttä', 'tten', 'iden',
  'en', 'ellä', 'eltä', 'elle', 'eksi', 'essä', 'estä',
  'desta', 'destä', 'dessa', 'dessä', 'delle', 'deksi', 'teen',
  'ksen', 'ksesta', 'ksessa', 'kseen', 'kset', 'ksia', 'ksiä', 'ksella', 'ksellä',
])

// Endings a tech name with no list entry may lose ("Kotlinista"): only the
// unmistakable ones, so "TypeScript" never becomes "TypeScrip".
const TECH_NAME_ENDINGS = ['istä', 'ista', 'ssa', 'ssä', 'sta', 'stä', 'lla', 'llä', 'lle', 'iin']

// A word: letters and digits, with . / & ' - kept inside it and + # at the
// end (Next.js, CI/CD, C++, C#). A trailing full stop is not part of it.
const WORD = /[\p{L}\p{N}](?:[\p{L}\p{N}]|[./&'-](?=[\p{L}\p{N}]))*[+#]*/gu

/**
 * @param {string} text
 * @returns {{ raw: string, word: string, index: number }[]} one entry per
 *   word, plus one per part of a hyphenated word, all at the same index.
 */
function toWords(text) {
  const words = []
  let index = 0

  for (const match of String(text ?? '').matchAll(WORD)) {
    const raw = match[0].replace(/'s$/i, '')
    words.push({ raw, word: raw.toLowerCase(), index })

    if (raw.includes('-')) {
      for (const part of raw.split('-').filter(Boolean)) {
        words.push({ raw: part, word: part.toLowerCase(), index })
      }
    }
    index += 1
  }

  return words
}

// The forms a word can take before an ending: "testaus" → "testau-ksesta",
// "kieli" → "kiel-en". Only for lowercase (Finnish) list entries.
function termStems(termWord, isFinnishStyle) {
  const stems = [termWord]

  if (isFinnishStyle && termWord.length >= 5) {
    if (/[uy]s$/.test(termWord)) stems.push(termWord.slice(0, -1))
    if (/i$/.test(termWord)) stems.push(termWord.slice(0, -1))
  }

  return stems
}

function wordMatches(word, termWord, isFinnishStyle) {
  if (word === termWord) return true

  return termStems(termWord, isFinnishStyle).some(
    (stem) => word.startsWith(stem) && ENDINGS.has(word.slice(stem.length)),
  )
}

/**
 * A term as the matcher uses it.
 * @param {string} label
 */
function createTerm(label) {
  const words = []
  let lastIndex = -1

  // One entry per position: a hyphenated term ("B-ajokortti") stays whole.
  for (const entry of toWords(label)) {
    if (entry.index !== lastIndex) words.push(entry.word)
    lastIndex = entry.index
  }

  return {
    key: label.toLowerCase(),
    label,
    words,
    isFinnishStyle: label === label.toLowerCase(),
    // REST, SOC, HR: only as written in capitals. Spring, Swift: only capitalised.
    caseRule: /^[\p{Lu}\d/&+#]+s?$/u.test(label) && label.length <= 6
      ? 'upper'
      : NAME_ONLY_TERMS.has(label) ? 'capital' : null,
  }
}

const DICTIONARY = JOB_TERMS.map(createTerm)
  // Longest first, so "unit testing" claims its words before "testing".
  .sort((a, b) => b.words.length - a.words.length)

function caseAllows(term, raw, isAd) {
  if (!isAd || !term.caseRule) return true
  if (term.caseRule === 'upper') {
    const head = raw.slice(0, term.label.replace(/s$/, '').length)
    return head === head.toUpperCase()
  }
  return /^\p{Lu}/u.test(raw)
}

/**
 * Positions where `term` occurs among `words`.
 * @returns {number[]}
 */
function findTerm(words, term, isAd) {
  const byIndex = new Map()

  for (const entry of words) {
    if (!byIndex.has(entry.index)) byIndex.set(entry.index, [])
    byIndex.get(entry.index).push(entry)
  }

  const hits = []

  for (const [index, entries] of byIndex) {
    const matchesAt = (offset) => {
      const candidates = byIndex.get(index + offset) ?? []
      return candidates.some((entry) =>
        wordMatches(entry.word, term.words[offset], term.isFinnishStyle) && caseAllows(term, entry.raw, isAd))
    }

    if (entries.length > 0 && term.words.every((_, offset) => matchesAt(offset))) {
      hits.push(index)
    }
  }

  return hits
}

// A tech name or acronym by its shape, as the ad wrote it, or null.
function techName(raw) {
  // "CSS-osaamista", "CI/CD-putkista": the name before a Finnish word.
  const hyphenated = raw.match(/^([^-]+)-\p{Ll}+$/u)
  const value = hyphenated ? hyphenated[1] : raw

  if (/^[\p{Lu}][\p{Lu}\d]{1,5}s?$/u.test(value)) {
    const acronym = value.replace(/(?<=\p{Lu})s$/u, '')
    return IGNORED_NAMES.has(acronym.toUpperCase()) ? null : acronym
  }
  // CI/CD, A/B, TCP/IP: capitals on both sides of the slash.
  if (/^[\p{Lu}\d]{1,5}\/[\p{Lu}\d]{1,5}$/u.test(value)) return value
  // C#, C++, F#
  if (/^[\p{Lu}][\p{L}]?[+#]+$/u.test(value)) return value
  // Next.js, ASP.NET, Vue.js
  if (/^[\p{L}\d]+\.(js|ts|net|NET|io)$/u.test(value)) return value
  // TypeScript, GraphQL, iOS, PyTorch: a capital inside the word.
  if (/^\p{L}[\p{Ll}\d]*\p{Lu}[\p{L}\d]*$/u.test(value) && /\p{Ll}/u.test(value)) {
    const ending = TECH_NAME_ENDINGS.find((end) => value.endsWith(end) && /\p{Lu}/u.test(value.slice(1, -end.length)))
    const name = ending ? value.slice(0, -ending.length) : value
    return IGNORED_NAMES.has(name.toUpperCase()) ? null : name
  }

  return null
}

// The CV's text, by where a visitor would look for it.
function collectStrings(value, out) {
  if (typeof value === 'string') {
    if (value) out.push(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, out))
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (!/url|photo|email|phone|date|year|isCurrent|stars|forks/i.test(key)) collectStrings(item, out)
    }
  }
  return out
}

function cvSections(formData) {
  const snapshot = createCvSnapshot(formData)
  const skills = [
    ...snapshot.skills,
    ...snapshot.experience.flatMap((item) => item.technologies),
    ...snapshot.coreStrengths.map((item) => item.title),
  ]
  const experience = snapshot.experience.flatMap((item) => [item.role, item.description, ...item.achievements])
  const summary = [snapshot.title, snapshot.tagline, snapshot.about]
  // Everything else the CV says: education, projects, certificates and so on.
  const rest = { ...snapshot }
  for (const key of ['fullName', 'title', 'about', 'tagline', 'email', 'phone', 'location', 'photo', 'skills', 'experience', 'coreStrengths', 'links', 'sourceIndices']) {
    delete rest[key]
  }
  const other = [
    ...collectStrings(rest, []),
    ...snapshot.experience.map((item) => item.company),
    ...snapshot.coreStrengths.map((item) => item.description),
  ]

  return {
    skillList: skills,
    sections: {
      skills: toWords(skills.join(' · ')),
      experience: toWords(experience.join(' · ')),
      summary: toWords(summary.join(' · ')),
      other: toWords(other.join(' · ')),
    },
  }
}

/**
 * @typedef {object} JobMatch
 * @property {boolean} hasInput
 * @property {number} coverageScore percent of the ad's requirements the CV mentions
 * @property {number} total
 * @property {{ label: string, where: string[] }[]} found in ad order;
 *   `where` lists 'skills' | 'experience' | 'summary' | 'other'
 * @property {string[]} missing in ad order
 * @property {string[]} skillsOnly found, but only in the skills list
 */

/**
 * @param {CvData} formData
 * @param {string} [jobAd='']
 * @returns {JobMatch}
 */
export function matchJobAd(formData, jobAd = '') {
  if (!String(jobAd ?? '').trim()) {
    return { hasInput: false, coverageScore: 0, total: 0, found: [], missing: [], skillsOnly: [] }
  }

  const adWords = toWords(jobAd)
  const { skillList, sections } = cvSections(formData)
  /** @type {Map<string, { label: string, term: ReturnType<typeof createTerm>, position: number }>} */
  const requirements = new Map()
  const claimed = new Set()

  const add = (term, hits) => {
    const free = hits.filter((index) => term.words.every((_, offset) => !claimed.has(index + offset)))
    if (free.length === 0 || requirements.has(term.key)) return

    free.forEach((index) => term.words.forEach((_, offset) => claimed.add(index + offset)))
    requirements.set(term.key, { label: term.label, term, position: free[0] })
  }

  for (const term of DICTIONARY) add(term, findTerm(adWords, term, true))

  // The CV's own skills, longest first, where the ad names them too.
  const cvTerms = [...new Set(skillList)]
    .filter((skill) => skill.split(/\s+/).length <= 4)
    .map(createTerm)
    .filter((term) => term.words.length > 0)
    .sort((a, b) => b.words.length - a.words.length)

  for (const term of cvTerms) {
    if (!DICTIONARY.some((entry) => entry.key === term.key)) add(term, findTerm(adWords, term, true))
  }

  for (const entry of adWords) {
    if (claimed.has(entry.index)) continue
    const name = techName(entry.raw)
    if (!name) continue
    const term = createTerm(name)
    add(term, [entry.index])
  }

  const ordered = [...requirements.values()]
    .sort((a, b) => a.position - b.position)
    .slice(0, MAX_REQUIREMENTS)

  const found = []
  const missing = []
  // A skill the CV has is shown the way the CV writes it.
  const cvSpelling = new Map(skillList.map((skill) => [skill.toLowerCase(), skill]))

  for (const { term } of ordered) {
    // List terms are lowercase; shown, and added to skills, as a skill reads.
    const label = cvSpelling.get(term.key)
      ?? (term.label === term.label.toLowerCase() ? term.label.charAt(0).toUpperCase() + term.label.slice(1) : term.label)
    const where = Object.entries(sections)
      .filter(([, words]) => findTerm(words, term, false).length > 0)
      .map(([section]) => section)

    if (where.length > 0) found.push({ label, where })
    else missing.push(label)
  }

  return {
    hasInput: true,
    coverageScore: ordered.length > 0 ? Math.round((found.length / ordered.length) * 100) : 0,
    total: ordered.length,
    found,
    missing,
    skillsOnly: found.filter((item) => item.where.length === 1 && item.where[0] === 'skills').map((item) => item.label),
  }
}
