// Example bullets: the example CVs' achievement bullets, with every number
// blanked to [__], offered under a job in the builder. The numbers belong to
// a fictional person, so the visitor must supply their own.
//
// Imports only the registry (exampleCvs.js); the example modules themselves
// load on demand through each entry's load().

import { EXAMPLES } from './exampleCvs'
import { BULLET_BLANK } from './cvFeedback'

// A number: digits with decimals and space-separated thousands groups,
// optionally with a currency sign, a unit suffix and a "/5" style tail.
// Starts at a non-letter, non-digit boundary, so Q3, HTML5 and S3 stay.
const NUMBER_PATTERN = new RegExp(
  '(?<![\\p{L}\\d])' +
    '[€$£]?' +
    '(?:\\d{1,3}(?:[ \\u00a0]\\d{3}(?!\\d))+(?:[.,]\\d+)*|\\d+(?:[.,]\\d+)*)' +
    '(?:\\s?M€|\\s?k€|\\s?€|\\s?%|\\+|[x×](?![\\p{L}\\d])|[kKM](?![\\p{L}\\d]))?' +
    '(?:/\\d+(?:[.,]\\d+)*)?',
  'gu',
)

// "WCAG 2.1", "ISO 27001": a number after an acronym names a standard.
const ACRONYM_BEFORE = /(?:^|[^\p{L}])\p{Lu}{2,}\s$/u

export function blankNumbers(text) {
  return String(text ?? '').replace(NUMBER_PATTERN, (match, offset, whole) => {
    if (ACRONYM_BEFORE.test(whole.slice(Math.max(0, offset - 24), offset))) return match
    return BULLET_BLANK
  })
}

const STOPWORDS = new Set(['senior', 'junior', 'lead', 'principal', 'staff', 'head', 'chief', 'and', 'of', 'the', 'ja', 'vanhempi'])

function words(text) {
  return String(text ?? '')
    .toLowerCase()
    .split(/[^\p{L}]+/u)
    .filter((word) => word && !STOPWORDS.has(word))
}

function wordsMatch(a, b) {
  if (a === b) return true
  const [short, long] = a.length <= b.length ? [a, b] : [b, a]
  return short.length >= 5 && long.startsWith(short)
}

// Roles with a score above 0 first, best first, ties in registry order; the
// rest follow in registry order. `locale` is kept for symmetry: each role's
// labels are already in that locale.
// eslint-disable-next-line no-unused-vars
export function rankIdeaRoles(roleText, roles, locale) {
  const typed = words(roleText)
  const scored = roles.map((role, index) => {
    const labelWords = words([role.roleLabel, ...(role.jobRoles || [])].join(' '))
    const score = typed.filter((word) => labelWords.some((label) => wordsMatch(word, label))).length
    return { ...role, score, index }
  })
  const strip = ({ index, ...role }) => (void index, role)
  const hits = scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.index - b.index)
  const rest = scored.filter((item) => item.score === 0)
  return [...hits, ...rest].map(strip)
}

const cache = new Map()

export function loadBulletIdeas(locale) {
  const key = locale === 'fi' ? 'fi' : 'en'
  if (!cache.has(key)) {
    const promise = Promise.all(
      Object.entries(EXAMPLES).map(async ([roleId, entry]) => {
        const module = await entry.load()
        const experience = module.default[key]?.experience || []
        const bullets = []
        for (const job of experience) {
          for (const achievement of job.achievements || []) {
            const blanked = blankNumbers(achievement)
            if (blanked.trim() && !bullets.includes(blanked)) bullets.push(blanked)
          }
        }
        return {
          roleId,
          roleLabel: entry.role[key],
          jobRoles: experience.map((job) => job.role).filter(Boolean),
          bullets,
        }
      }),
    )
    promise.catch(() => cache.delete(key))
    cache.set(key, promise)
  }
  return cache.get(key)
}
