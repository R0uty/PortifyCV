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
    '(?:\\s?M€|\\s?k€|\\s?M(?![\\p{L}\\d])|\\s?€|\\s?%|\\+|[x×](?![\\p{L}\\d])|[kKM](?![\\p{L}\\d]))?' +
    '(?:/\\d+(?:[.,]\\d+)*)?',
  'gu',
)

// "WCAG 2.1", "ISO 27001": after one of these, the number is part of the
// standard's name. A closed list, so "AWS 3 regions" still gets blanked.
const STANDARD_NAMES = ['WCAG', 'ISO', 'IEC', 'SOC', 'PCI', 'GDPR', 'IFRS', 'ITIL']
const STANDARD_BEFORE = new RegExp(`(?:^|[^\\p{L}])(?:${STANDARD_NAMES.join('|')})\\s$`, 'u')

export function blankNumbers(text) {
  return String(text ?? '').replace(NUMBER_PATTERN, (match, offset, whole) => {
    if (STANDARD_BEFORE.test(whole.slice(Math.max(0, offset - 24), offset))) return match
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

// Finnish compounds put the role in the tail: "Ohjelmistokehittäjä" and
// "Frontend-kehittäjä" share "kehittäjä", "Lähihoitaja" and "Sairaanhoitaja"
// share "hoitaja". A shared tail of at least 6 letters counts, so endings
// like "-ja" or "-ttaja" never do. English titles are separate words, and a
// shared tail there is just a suffix ("operations"/"relations"), so this is
// Finnish only.
const MIN_SHARED_TAIL = 6

function sharedTailLength(a, b) {
  let length = 0
  while (length < a.length && length < b.length && a[a.length - 1 - length] === b[b.length - 1 - length]) length += 1
  return length
}

// 2 for the same word (or one a 5+ letter start of the other, which covers
// Finnish case endings), 1 for a shared compound tail, 0 otherwise.
function matchStrength(a, b, locale) {
  if (a === b) return 2
  const [short, long] = a.length <= b.length ? [a, b] : [b, a]
  if (short.length >= 5 && long.startsWith(short)) return 2
  if (locale === 'fi' && sharedTailLength(a, b) >= MIN_SHARED_TAIL) return 1
  return 0
}

// Roles with a score above 0 first, best first, ties in registry order; the
// rest follow in registry order. Each typed word scores its best match
// against the role's labels, which are already in `locale`.
export function rankIdeaRoles(roleText, roles, locale) {
  const typed = words(roleText)
  const scored = roles.map((role, index) => {
    const labelWords = words([role.roleLabel, ...(role.jobRoles || [])].join(' '))
    const score = typed.reduce((sum, word) => sum + Math.max(0, ...labelWords.map((label) => matchStrength(word, label, locale))), 0)
    return { ...role, score, index }
  })
  const hits = scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.index - b.index)
  const rest = scored.filter((item) => item.score === 0)
  return [...hits, ...rest].map(({ score, roleId, roleLabel, jobRoles, bullets }) => ({ roleId, roleLabel, jobRoles, bullets, score }))
}

const cache = new Map()

export function loadBulletIdeas(locale) {
  // Example CVs exist in English and Finnish only; Swedish reads the English ones.
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
