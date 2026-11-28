import {
  createEmptyEducation,
  createEmptyExperience,
  createEmptyLanguage,
  createEmptyLinks,
  createInitialCvData,
  parseImportedCvData,
} from './cvForm'
import { feedback } from '../i18n/feedback/index.js'

// Turns the text lines of someone's existing CV (read out of a PDF or Word
// file by cvFileText.js) into CV data. Rule-based on purpose: it runs in the
// browser, costs nothing, and never sends the CV anywhere.
//
// The one rule every heuristic here follows: a field the parser is unsure
// of stays empty. An imported CV is a starting point the user corrects, and
// a blank field is easier to notice and fix than a wrong one.
//
// Pure (no DOM, no dependencies) so scripts/check-cv-import.mjs can run it
// in Node. Add a case there with any layout this starts handling.

/** @typedef {import('../types/cv').CvData} CvData */

// Section headings, English and Finnish, by the section they open. `other`
// is every heading the importer recognises but does not fill: its lines are
// dropped instead of running on into the section before it.
const HEADINGS = {
  summary: [
    'summary', 'professional summary', 'executive summary', 'career summary', 'profile', 'professional profile',
    'personal profile', 'executive profile', 'about', 'about me', 'objective', 'career objective', 'personal statement',
    'profiili', 'yhteenveto', 'tiivistelmä', 'esittely', 'kuvaus', 'minusta', 'tietoja minusta',
  ],
  experience: [
    'experience', 'work experience', 'professional experience', 'relevant experience', 'employment',
    'employment history', 'work history', 'career history', 'work',
    'työkokemus', 'työhistoria', 'kokemus', 'työura', 'ansiotyö',
  ],
  education: [
    'education', 'education and training', 'academic background', 'qualifications', 'academic qualifications',
    'koulutus', 'opinnot', 'tutkinnot', 'koulutus ja tutkinnot',
  ],
  skills: [
    'skills', 'technical skills', 'key skills', 'core skills', 'core competencies', 'competencies', 'expertise',
    'areas of expertise', 'technologies', 'tools', 'skills and tools',
    'taidot', 'osaaminen', 'tekniset taidot', 'erityisosaaminen', 'avaintaidot', 'it-taidot', 'atk-taidot',
    'teknologiat', 'työkalut', 'ydinosaaminen', 'tech stack', 'toolkit', 'stack',
  ],
  languages: ['languages', 'language skills', 'kielet', 'kielitaito'],
  // Contact details under a heading of their own, often in a sidebar.
  contact: [
    'contact', 'contact details', 'contact information', 'personal details', 'personal information',
    'personal info', 'details', 'links', 'find me', 'yhteystiedot', 'henkilötiedot', 'linkit',
  ],
  other: [
    'projects', 'case studies', 'open source', 'research', 'leadership', 'speaking', 'testimonials',
    'core strengths', 'strengths', 'internships', 'leadership experience', 'board roles', 'summary of qualifications',
    'avoin lähdekoodi', 'tutkimus', 'johtaminen', 'puheet', 'suositukset', 'vahvuudet', 'harjoittelut', 'certifications', 'certificates', 'licenses', 'licences', 'courses',
    'training', 'references', 'interests', 'hobbies', 'hobbies and interests', 'awards', 'honors', 'honours',
    'achievements', 'publications', 'volunteering', 'volunteer experience', 'volunteer work',
    'additional information', 'activities', 'memberships', 'positions of trust',
    'projektit', 'sertifikaatit', 'kurssit', 'lisäkoulutus', 'suosittelijat', 'harrastukset', 'saavutukset',
    'julkaisut', 'vapaaehtoistyö', 'lisätiedot', 'luottamustoimet',
    'muu toiminta', 'palkinnot', 'jäsenyydet',
  ],
}

const HEADING_KIND = new Map(
  Object.entries(HEADINGS).flatMap(([kind, names]) => names.map((name) => [name, kind])),
)

const HEADING_DECORATION = /^(?:featured|selected|key|relevant|professional|additional|other|technical|personal|my|core|main|recent|notable)\s+/

// A document title above the name, not the name itself.
const DOCUMENT_TITLES = new Set(['cv', 'curriculum vitae', 'resume', 'résumé', 'ansioluettelo'])

// "Technologies: Python, SQL" inside a job is that job's stack, not the
// start of the Skills section.
const TECH_LABEL = /^(technologies|tech stack|stack|tools|teknologiat|työkalut|tekniikat)$/i
const CONTACT_LABEL = /^(e-?mail|email address|phone|mobile|tel|telephone|address|location|linkedin|github|website|web|portfolio|sähköposti|puhelin|puh|gsm|osoite|sijainti|kotisivu|verkkosivu)\.?$/i
const LOCATION_LABEL = /^(address|location|osoite|sijainti)$/i
const GRADE_LABEL = /^(gpa|grade|final grade|keskiarvo|arvosana)$/i

// Used only to tell "Languages: English, Swedish" from a developer's
// "Languages: Python, Go", which is a skills line.
const HUMAN_LANGUAGE = /\b(english|finnish|swedish|german|french|spanish|italian|russian|estonian|norwegian|danish|dutch|polish|portuguese|chinese|mandarin|japanese|korean|arabic|hindi|turkish|ukrainian|suomi|englanti|ruotsi|saksa|ranska|espanja|italia|venäjä|viro|norja|tanska|hollanti|puola|portugali|kiina|japani|korea|arabia|turkki|ukraina)\b/i

const BULLET = /^(?:[•●▪■‣◦·*➢➤►▸✓–—-])\s+/u

const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec|tammi|helmi|maalis|huhti|touko|kesä|heinä|elo|syys|loka|marras|joulu)[a-zäö]*\\.?'
const DATE = `(?:${MONTH}\\s+(?:19|20)\\d{2}|\\d{1,2}[/.](?:19|20)\\d{2}|(?:19|20)\\d{2})`
const PRESENT = '(?:present|current|now|ongoing|today|nykyinen|nykyhetki|jatkuu|edelleen|nyt|toistaiseksi|tähän päivään)'
const BEFORE_DATE = '(?<![\\p{L}\\d/.])'
const DATE_RANGE = new RegExp(
  `${BEFORE_DATE}(${DATE})(?:\\s*[–—-]\\s*|\\s+(?:to|until)\\s+)(?:(${DATE})(?![\\d/])|(${PRESENT})(?!\\p{L}))`,
  'iu',
)
// "5/2022 –" with nothing after the dash: still in the job.
const OPEN_DATE_RANGE = new RegExp(`${BEFORE_DATE}(${DATE})\\s*[–—-]\\s*$`, 'iu')
const SINGLE_DATE = new RegExp(`${BEFORE_DATE}(${DATE})(?![\\d/.])`, 'iu')

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/
const PHONE = /\+?\(?\d[\d ()-]{5,}\d/g
const URL = /(?<![@\w.-])(https?:\/\/)?((?:[a-z0-9-]+\.)+[a-z]{2,})(\/[^\s,;|<>()]*)?/gi
// A bare "name.tld" is only trusted as a link where contact details live
// (the top of the CV or a Contact section); in body text it is far more
// likely to be "ASP.NET" than a website.
const BARE_LINK_TLDS = new Set(['com', 'fi', 'net', 'org', 'io', 'dev', 'app', 'me', 'co', 'eu', 'se', 'de', 'uk', 'design', 'tech', 'info', 'xyz', 'page'])
const LINK_HOSTS = [
  [/(^|\.)github\.com$/, 'github'],
  [/(^|\.)linkedin\.com$/, 'linkedin'],
  [/(^|\.)behance\.net$/, 'behance'],
  [/(^|\.)dribbble\.com$/, 'dribbble'],
  [/(^|\.)medium\.com$/, 'medium'],
  [/(^|\.)dev\.to$/, 'devto'],
  [/^scholar\.google\./, 'scholar'],
  [/(^|\.)researchgate\.net$/, 'researchGate'],
  [/(^|\.)hackthebox\.(com|eu)$/, 'hackTheBox'],
  [/(^|\.)tryhackme\.com$/, 'tryHackMe'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'],
]

const COMPANY_LIKE = /\b(oy|oyj|ab|ltd|limited|inc|llc|gmbh|corp|corporation|plc|group|ry|company|co)\.?$/i
const SCHOOL_LIKE = /university|college|school|institute|academy|polytechnic|yliopisto|korkeakoulu|opisto|lukio|koulu|instituutti/i
const DEGREE_LIKE = /\b(bachelor|master|b\.?sc|m\.?sc|b\.?a|m\.?a|b\.?eng|m\.?eng|ph\.?d|mba|doctor|degree|diploma|certificate|kandidaatti|maisteri|tutkinto|insinööri|tradenomi|ylioppilas|tohtori|diplomi|amk|yamk|merkonomi|lähihoitaja|ammattitutkinto)\b/i

// cvFileText.js puts this between the columns of a two-column PDF.
const COLUMN_BREAK = '\f'

// "Role    Jan 2022": a lone date counts as the entry's date only when it
// ends the line after a real gap or separator. "…shipped the roadmap in
// 2020" is a sentence that happens to end in a year.
const TRAILING_DATE = new RegExp(`(?:\\s{2,}|[|·•,(]\\s*)(${DATE})\\)?$`, 'iu')

// The same on the other side: "Jan 2022    Role", as timeline layouts set it.
const LEADING_DATE = new RegExp(`^(${DATE})(?:\\s{2,}|\\s*[|·•,]\\s*)(?=\\S)`, 'iu')

const EMPLOYMENT_TYPES = [
  [/^(full[- ]time|kokoaikainen|kokopäiväinen|vakituinen)$/i, 'Full-time'],
  [/^(part[- ]time|osa-aikainen)$/i, 'Part-time'],
  [/^(contract|fixed[- ]term|määräaikainen)$/i, 'Contract'],
  [/^(internship|intern|harjoittelu|harjoittelija)$/i, 'Internship'],
  [/^(freelance|freelancer)$/i, 'Freelance'],
]

const squash = (value) => value.replace(/\s+/g, ' ').trim()
const stripBullet = (line) => line.replace(BULLET, '').trim()
const trimSeparators = (value) => value.replace(/^[\s,;:|•·–—-]+|[\s,;:|•·–—-]+$/gu, '').trim()
const digitCount = (value) => value.replace(/\D/g, '').length
const wordCount = (value) => value.split(/\s+/).filter(Boolean).length

function headingKind(line) {
  const normalized = line
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')
    .replace(/\s+/g, ' ')

  // "Featured Projects", "Key Skills", "Relevant Experience": the heading
  // is the last word(s), the first is decoration.
  return HEADING_KIND.get(normalized) ?? HEADING_KIND.get(normalized.replace(HEADING_DECORATION, '')) ?? null
}

// "Skills: SQL, Excel" — a heading with its content on the same line.
function splitLabel(line) {
  const match = /^([^:]{2,32}):\s*(\S.*)$/.exec(line)
  return match ? { label: match[1].trim(), rest: match[2].trim() } : null
}

// Lines a wrapped paragraph or bullet continues onto start lower-case; a
// role, company or school name does not.
function isHeaderLike(line) {
  if (!line || BULLET.test(line)) return false
  if (!/^[\p{Lu}\d]/u.test(line)) return false
  if (/[.!?]$/.test(line) && wordCount(line) > 6) return false
  // A role, company or school line is short. A longer one is only a header
  // when it is visibly a row of fields ("Acme Oy · Helsinki · Full-time"),
  // not the first line of a wrapped paragraph.
  return (line.length <= 60 && wordCount(line) <= 8) || (line.length <= 110 && /\s[|·•]\s|\s{2,}/u.test(line))
}

function splitParts(text) {
  return text
    .split(/\s+(?:at|@)\s+|\s*[|•·]\s*|\s+[–—-]\s+|\t|\s{2,}/u)
    .map(trimSeparators)
    .filter(Boolean)
}

function splitCommaParts(text) {
  return text.split(/,\s+/).map(trimSeparators).filter(Boolean)
}

const fieldParts = (line) => line.split(/\s*[|·•]\s*|\s{2,}/u).filter(Boolean)

// "Figma · Storybook · React": short items in a row, the stack a job used.
function isChipRow(line) {
  if (BULLET.test(line) || /[.!?]$/.test(line)) return false
  const parts = fieldParts(line)
  return parts.length >= 2 && parts.every((part) => wordCount(part) <= 3 && part.length <= 30)
}

// "Acme Oy · Helsinki, Finland · Full-time": a row of fields that names a
// company or a place.
function isCompanyRow(line) {
  const parts = fieldParts(line)
  return parts.some((part) => COMPANY_LIKE.test(part) || LOCATION_LIKE.test(part) || /^(remote|etätyö|hybrid|hybridi)$/i.test(part)) ||
    (parts.length === 1 && COMPANY_LIKE.test(line))
}

// A chip row that is not a company row: the end of the previous entry, not
// the header of the next one.
const isTechRow = (line) => isChipRow(line) && !isCompanyRow(line)

/** Find a date or a date range on a line and return what is left of the line. */
export function readDates(line, { allowSingle }) {
  const range = DATE_RANGE.exec(line)

  if (range) {
    return {
      start: squash(range[1]),
      end: range[2] ? squash(range[2]) : '',
      isCurrent: Boolean(range[3]),
      rest: trimSeparators(line.replace(range[0], ' ')),
    }
  }

  const open = OPEN_DATE_RANGE.exec(line)

  if (open) {
    return { start: squash(open[1]), end: '', isCurrent: true, rest: trimSeparators(line.replace(open[0], ' ')) }
  }

  const single = SINGLE_DATE.exec(line)

  if (single) {
    const rest = trimSeparators(line.replace(single[0], ' '))

    if (!rest || allowSingle) {
      return { start: squash(single[1]), end: '', isCurrent: false, isSingle: true, rest }
    }
  }

  const leading = LEADING_DATE.exec(line)

  if (leading) {
    return { start: squash(leading[1]), end: '', isCurrent: false, isSingle: true, rest: trimSeparators(line.slice(leading[0].length)) }
  }

  const trailing = TRAILING_DATE.exec(line)

  if (trailing) {
    return {
      start: squash(trailing[1]),
      end: '',
      isCurrent: false,
      isSingle: true,
      rest: trimSeparators(line.slice(0, trailing.index)),
    }
  }

  return null
}

// A narrow date column wraps the range over two rows, each row followed by
// the main column's text:
//   "Jun 2019 - Dec    Product Designer"
//   "2021    Acme Oy · Remote"
// Put the date back together on the first row.
const WRAPPED_DATE_START = new RegExp(`^(${DATE}\\s*[–—-](?:\\s*${MONTH})?)(?:\\s{2,}(.+))?$`, 'iu')
const WRAPPED_DATE_END = new RegExp(`^((?:${MONTH}\\s+)?(?:19|20)\\d{2}|${PRESENT})(?:\\s{2,}(.+))?$`, 'iu')

function joinWrappedDates(lines) {
  const joined = []

  for (let index = 0; index < lines.length; index += 1) {
    const start = WRAPPED_DATE_START.exec(lines[index])
    const end = start && index + 1 < lines.length ? WRAPPED_DATE_END.exec(lines[index + 1]) : null

    if (start && end && !DATE_RANGE.test(lines[index])) {
      joined.push(`${start[1]} ${end[1]}${start[2] ? `  ${start[2]}` : ''}`)
      if (end[2]) joined.push(end[2])
      index += 1
    } else {
      joined.push(lines[index])
    }
  }

  return joined
}

/**
 * Split a section into dated entries. Each entry gets its header texts (the
 * role/company or degree/school lines) and its body lines.
 */
function splitEntries(sectionLines, { allowSingle }) {
  const lines = joinWrappedDates(sectionLines)
  const dated = []

  lines.forEach((line, index) => {
    if (BULLET.test(line)) return
    const dates = readDates(line, { allowSingle })
    if (dates && (!dates.rest || isHeaderLike(dates.rest))) dated.push({ index, dates })
  })

  const isPlainHeader = (index) =>
    index < lines.length && isHeaderLike(lines[index]) && !dated.some((entry) => entry.index === index)

  if (dated.length === 0) {
    // No dates anywhere: at most one entry, read from the first lines.
    const texts = []
    while (texts.length < 2 && isPlainHeader(texts.length)) texts.push(lines[texts.length])
    return texts.length > 0 ? [{ texts, dates: null, body: lines.slice(texts.length) }] : []
  }

  let lowerBound = 0
  const entries = dated.map(({ index, dates }) => {
    const restParts = dates.rest ? splitParts(dates.rest) : []
    const before = []
    const after = []

    // The role is on the date line; the company is on the line above or the
    // line below. Below wins when that line looks like a company row
    // ("Acme Oy · Helsinki"); otherwise above, then below.
    const nextIsHeader = restParts.length === 1 && isPlainHeader(index + 1)
    const canLookAbove = index - 1 >= lowerBound && isPlainHeader(index - 1) && !isTechRow(lines[index - 1])

    if (nextIsHeader && (isCompanyRow(lines[index + 1]) || !canLookAbove)) {
      after.push(lines[index + 1])
    } else if (restParts.length < 2) {
      const wanted = dates.rest ? 1 : 2
      let cursor = index - 1
      while (before.length < wanted && cursor >= lowerBound && isPlainHeader(cursor) && !isTechRow(lines[cursor])) {
        before.unshift(lines[cursor])
        cursor -= 1
      }
    }

    // Dates on their own line above the role ("2018 – 2020" / "Role, Company").
    if (!dates.rest && before.length === 0 && isPlainHeader(index + 1)) {
      after.push(lines[index + 1])
      const first = lines[index + 1]
      if (splitParts(first).length === 1 && !first.includes(',') && isPlainHeader(index + 2)) {
        after.push(lines[index + 2])
      }
    }

    const entry = {
      texts: [...before, ...(dates.rest ? [dates.rest] : []), ...after],
      dates,
      headerStart: index - before.length,
      bodyStart: index + 1 + after.length,
    }
    lowerBound = entry.bodyStart
    return entry
  })

  return entries.map((entry, position) => ({
    texts: entry.texts,
    dates: entry.dates,
    body: lines.slice(entry.bodyStart, entries[position + 1]?.headerStart ?? lines.length),
  }))
}

function readList(value) {
  return value.split(/[,;|•·]|\t|\s{2,}/u).map((item) => trimSeparators(stripBullet(item))).filter(Boolean)
}


function parseExperienceEntry({ texts, dates, body }) {
  const entry = createEmptyExperience()
  const [first = '', second = ''] = texts
  let parts = splitParts(first)

  if (parts.length < 2 && second) {
    const secondParts = splitParts(second)
    parts = [...parts, ...(secondParts.length > 1 ? secondParts : splitCommaParts(second))]
  } else if (parts.length < 2) {
    parts = splitCommaParts(first)
  }

  let [role = '', company = '', ...rest] = parts

  if (company && COMPANY_LIKE.test(role) && !COMPANY_LIKE.test(company)) {
    ;[role, company] = [company, role]
  }

  entry.role = role
  entry.company = company
  entry.location = rest
    .filter((part) => {
      const type = EMPLOYMENT_TYPES.find(([pattern]) => pattern.test(part))?.[1]
      if (type) entry.employmentType = type
      return !type
    })
    .join(', ')

  if (dates) {
    entry.startDate = dates.start
    entry.endDate = dates.end
    entry.isCurrent = dates.isCurrent
  }

  const description = []
  let lastWasBullet = false

  for (const line of body) {
    const labelled = splitLabel(line)

    if (labelled && TECH_LABEL.test(labelled.label)) {
      entry.technologies.push(...readList(labelled.rest))
      lastWasBullet = false
    } else if (isTechRow(line)) {
      entry.technologies.push(...readList(line))
      lastWasBullet = false
    } else if (BULLET.test(line)) {
      entry.achievements.push(squash(stripBullet(line)))
      lastWasBullet = true
    } else if (lastWasBullet && /^[\p{Ll}(]/u.test(line)) {
      // A bullet that wrapped onto the next line of the PDF.
      entry.achievements[entry.achievements.length - 1] += ` ${line}`
    } else {
      description.push(line)
      lastWasBullet = false
    }
  }

  entry.description = squash(description.join(' '))
  return entry
}

function parseEducationEntry({ texts, dates, body }) {
  const entry = createEmptyEducation()
  const parts = texts.flatMap((text) => {
    const split = splitParts(text)
    return split.length > 1 ? split : splitCommaParts(text)
  })
  const unassigned = []

  for (const part of parts) {
    if (!entry.school && SCHOOL_LIKE.test(part)) entry.school = part
    else if (!entry.degree && DEGREE_LIKE.test(part)) entry.degree = part
    else unassigned.push(part)
  }

  const location = unassigned.findIndex((part) => LOCATION_LIKE.test(part))
  if (location >= 0) [entry.location] = unassigned.splice(location, 1)
  if (!entry.degree && unassigned.length > 0) entry.degree = unassigned.shift()
  if (!entry.school && unassigned.length > 0) entry.school = unassigned.shift()

  if (dates?.isSingle) {
    entry.endDate = dates.start
  } else if (dates) {
    entry.startDate = dates.start
    entry.endDate = dates.end
  }

  for (const line of body) {
    const labelled = splitLabel(stripBullet(line))
    if (labelled && GRADE_LABEL.test(labelled.label) && !entry.grade) entry.grade = labelled.rest
  }

  return entry
}

function parseSkills(lines) {
  const seen = new Set()
  const skills = []

  for (const line of lines) {
    const text = stripBullet(line)
    const labelled = splitLabel(text)

    for (const skill of readList(labelled ? labelled.rest : text)) {
      const key = skill.toLowerCase()
      if (skill.length <= 50 && !seen.has(key) && !/^(other|others|muut|muu)$/.test(key)) {
        seen.add(key)
        skills.push(skill)
      }
    }
  }

  return skills.slice(0, 40)
}

export function parseLanguages(lines) {
  const languages = []

  for (const line of lines) {
    for (const item of stripBullet(line).split(/[,;|•·]/u).map((value) => value.trim()).filter(Boolean)) {
      const match = /^(.+?)(?:\s+[–—-]\s+|:\s*|\s*\(|\s{2,})(.+?)\)?$/u.exec(item)
      const language = trimSeparators(match ? match[1] : item)
      if (language && language.length <= 30) {
        languages.push({ ...createEmptyLanguage(), language, level: match ? trimSeparators(match[2]) : '' })
      }
    }
  }

  return languages
}

/** Pull e-mail, phone and links out of the text; returns the line without them. */
function takeContact(line, contact, { trustBareLinks }) {
  let text = line
  const email = EMAIL.exec(text)

  if (email) {
    if (!contact.email) contact.email = email[0]
    text = text.replace(email[0], ' ')
  }

  text = text.replace(URL, (match, scheme, host, path = '') => {
    const lowerHost = host.toLowerCase()
    const bareHost = lowerHost.replace(/^www\./, '')
    const key = LINK_HOSTS.find(([pattern]) => pattern.test(bareHost))?.[1]
    const isExplicit = Boolean(scheme) || lowerHost.startsWith('www.')
    const isTrustedBare = trustBareLinks && BARE_LINK_TLDS.has(bareHost.split('.').pop())

    if (!key && !isExplicit && !isTrustedBare) return match

    const url = `${scheme ? scheme.toLowerCase() : 'https://'}${lowerHost}${path.replace(/[.)]+$/, '')}`
    const target = key ?? 'website'
    if (!contact.links[target]) contact.links[target] = url
    return ' '
  })

  if (!BULLET.test(line) && !DATE_RANGE.test(line)) {
    for (const candidate of text.match(PHONE) ?? []) {
      const digits = digitCount(candidate)
      const looksLikePhone = digits <= 15 && (digits >= 9 || (candidate.startsWith('+') && digits >= 8))
      if (looksLikePhone) {
        if (!contact.phone) contact.phone = squash(candidate)
        text = text.replace(candidate, ' ')
      }
    }
  }

  return { text, found: text !== line }
}

const LOCATION_LIKE = /^(?:\d{5}\s+)?\p{L}[\p{L} .'-]*(?:,\s*\p{L}[\p{L} .'-]*)+$/u
const isNameLike = (value) =>
  /\p{L}/u.test(value) && !/\d/.test(value) && wordCount(value) <= 5 && value.length <= 60 &&
  !DOCUMENT_TITLES.has(value.toLowerCase()) && !/[@:,]/.test(value)
const isTitleLike = (value) => /\p{L}/u.test(value) && wordCount(value) <= 8 && value.length <= 80 && !/[.!?]$/.test(value)

/** Name, title and location from the lines above the first heading. */
function parseTopBlock(lines, contact, hasHeadings, { loneLocation = false } = {}) {
  const top = { fullName: '', title: '', location: '', about: [] }

  for (const line of lines) {
    const { text, found } = takeContact(line, contact, { trustBareLinks: true })
    const fragments = text
      .split(/\s*[|•·]\s*|\t|\s{2,}/u)
      .map((fragment) => {
        const labelled = /^([^:]{2,20}):\s*(.*)$/.exec(fragment.trim())
        if (!labelled || !CONTACT_LABEL.test(labelled[1].trim())) return trimSeparators(fragment)
        if (LOCATION_LABEL.test(labelled[1].trim()) && labelled[2] && !top.location) top.location = trimSeparators(labelled[2])
        return ''
      })
      .filter((fragment) => fragment && !CONTACT_LABEL.test(fragment))

    for (const fragment of fragments) {
      const besideOtherDetails = found || fragments.length > 1

      if (DOCUMENT_TITLES.has(fragment.toLowerCase())) continue
      if (!top.fullName && isNameLike(fragment)) top.fullName = fragment
      else if (!top.location && LOCATION_LIKE.test(fragment) && fragment.length <= 40 && (besideOtherDetails || top.title || loneLocation)) top.location = fragment
      // A name set on two lines, one word each ("JANE" / "EXAMPLE").
      else if (!top.title && wordCount(top.fullName) === 1 && wordCount(fragment) === 1 && !found && /^\p{Lu}/u.test(fragment) && isNameLike(fragment)) top.fullName += ` ${fragment}`
      else if (!top.title && top.fullName && !found && isTitleLike(fragment)) top.title = fragment
      // An unheaded paragraph under the name is the summary, but only in a
      // CV that has headings: without any, everything is "above the first
      // heading" and a job description would land here.
      else if (hasHeadings && !found && fragment.length >= 60) top.about.push(fragment)
    }
  }

  return top
}

/**
 * Parse the text lines of a CV into CV data.
 * @param {string[]} lines Lines in reading order.
 * @param {{ locale?: 'en' | 'fi' | 'sv' }} [options] Only picks the error language.
 * @returns {{ data: CvData, summary: { hasName: boolean, experience: number, education: number, skills: number, languages: number } }}
 */
export function parseCvText(lines, options = {}) {
  const nothingFound = feedback.t(options.locale, 'import.nothingFound')

  const cleaned = (Array.isArray(lines) ? lines : [])
    .map((line) => (line === COLUMN_BREAK ? line : typeof line === 'string' ? squashKeepingGaps(line) : ''))
    .filter((line) => line && !/^(?:page|sivu)?\s*\d+\s*(?:\/|of|\/\s*)\s*\d+$/i.test(line) && !/^(?:page|sivu)\s+\d+$/i.test(line))

  if (cleaned.length === 0) throw new Error(nothingFound)

  const sections = { top: [], aside: [], contact: [], summary: [], experience: [], education: [], skills: [], languages: [], other: [] }
  let current = 'top'
  let hasHeadings = false

  for (const line of cleaned) {
    if (line === COLUMN_BREAK) {
      // The other column starts: whatever section was open is over. What
      // comes before that column's first heading is usually contact details.
      current = 'aside'
      continue
    }

    const kind = headingKind(line)

    if (kind) {
      current = kind
      hasHeadings = true
      continue
    }

    const labelled = splitLabel(line)
    const labelKind = labelled ? headingKind(labelled.label) : null

    if (labelKind && labelKind !== 'other' && labelKind !== 'contact') {
      const insideEntry = current === 'experience' || current === 'education'

      if (labelKind === 'languages' && !HUMAN_LANGUAGE.test(labelled.rest)) {
        sections.skills.push(labelled.rest)
        continue
      }

      if (!(insideEntry && TECH_LABEL.test(labelled.label))) {
        current = labelKind
        hasHeadings = true
        sections[current].push(labelled.rest)
        continue
      }
    }

    sections[current].push(line)
  }

  const contact = { email: '', phone: '', links: createEmptyLinks() }
  const top = parseTopBlock(sections.top, contact, hasHeadings)
  const aside = parseTopBlock(sections.aside, contact, hasHeadings)

  // The name and title sit above the first heading of whichever column
  // holds them; the extractor tries to put that column first, and this
  // covers the page where it could not tell.
  top.fullName ||= aside.fullName
  top.title ||= aside.title
  top.location ||= aside.location || parseTopBlock(sections.contact, contact, hasHeadings, { loneLocation: true }).location
  if (top.about.length === 0) top.about = aside.about

  // Contact details can sit anywhere (a sidebar, a footer, a Contact
  // section), so the rest of the text is scanned too.
  for (const line of sections.other) takeContact(line, contact, { trustBareLinks: true })
  for (const kind of ['summary', 'experience', 'education', 'skills', 'languages']) {
    for (const line of sections[kind]) takeContact(line, contact, { trustBareLinks: false })
  }

  const experience = splitEntries(sections.experience, { allowSingle: false })
    .map(parseExperienceEntry)
    .filter((entry) => entry.role || entry.company)
  const education = splitEntries(sections.education, { allowSingle: true })
    .map(parseEducationEntry)
    .filter((entry) => entry.school || entry.degree)
  const skills = parseSkills(sections.skills)
  const languages = parseLanguages(sections.languages)
  const about = squash((sections.summary.length > 0 ? sections.summary.map(stripBullet) : top.about).join(' '))

  const foundAnything =
    top.fullName || contact.email || about || experience.length > 0 || education.length > 0 || skills.length > 0

  if (!foundAnything) throw new Error(nothingFound)

  const data = parseImportedCvData({
    ...createInitialCvData(),
    fullName: top.fullName,
    title: top.title,
    about,
    email: contact.email,
    phone: contact.phone,
    location: top.location,
    links: contact.links,
    skills,
    ...(experience.length > 0 ? { experience } : {}),
    ...(education.length > 0 ? { education } : {}),
    ...(languages.length > 0 ? { languages } : {}),
  })

  return {
    data,
    summary: {
      hasName: Boolean(top.fullName),
      experience: experience.length,
      education: education.length,
      skills: skills.length,
      languages: languages.length,
    },
  }
}

// Collapses runs of spaces to two, not one: a wide gap inside a line is how
// a PDF shows a column break ("Acme Oy      2019 – 2021"), and the splitters
// above read two spaces as that separator.
export function squashKeepingGaps(line) {
  return line.replace(/\u00a0/g, ' ').replace(/[ \t]{2,}/g, '  ').trim()
}
