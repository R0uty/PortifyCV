import {
  createEmptyAchievement,
  createEmptyCertificate,
  createEmptyEducation,
  createEmptyExperience,
  createEmptyLinks,
  createEmptyPublication,
  createInitialCvData,
  parseImportedCvData,
} from './cvForm'
import { parseLanguages, readDates, squashKeepingGaps } from './cvTextImport'

// A LinkedIn profile saved with More › Save to PDF (1.7.10). Its layout breaks
// the general parser's habits (company above the job title, a duration on
// every date line, the profile address wrapped over two lines), so it gets
// its own reader. The lines come from cvFileText.js's pdfPagesToLines: the
// main column (name, headline, Summary, Experience, Education), a column
// break, then the sidebar (Contact, Top Skills, Languages, Certifications,
// Honors-Awards, Publications). Checked against a real export; cases live in
// scripts/check-cv-import.mjs. Like the general parser, a field it is unsure
// of stays empty, and when it finds no job and no degree it returns null so
// the caller can fall back to parseCvText.

/** @typedef {import('../types/cv').CvData} CvData */

const COLUMN_BREAK = '\f'
const PAGE_FOOTER = /^page\s+\d+\s+of\s+\d+$/i
const LINKEDIN_LABEL = /\(LinkedIn\)\s*$/
const LINK_LABEL = /\s*\((LinkedIn|Portfolio|Blog|Company|Personal|Other|RSS Feed)\)\s*$/i
const PHONE_LABEL = /^(\+?[\d ()-]{6,}?)\s*\((Mobile|Home|Work)\)$/i
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/
const BULLET = /^(?:[•●▪■‣◦·*–—-])\s+/u
const DURATION = /^(?:less than a year|\d+\s+(?:years?|months?)(?:\s+\d+\s+months?)?)$/i
const TRAILING_DURATION = /\s*\(\s*(?:less than a year|\d+\s+(?:years?|months?)(?:\s+\d+\s+months?)?)\s*\)$/i
const LOCATION = /^[\p{L} .'-]+(?:,\s*[\p{L} .'-]+)+$/u
const TITLE_MAX = 60

const MAIN_HEADINGS = new Map([
  ['summary', 'summary'],
  ['experience', 'experience'],
  ['education', 'education'],
  // Seen on some exports; not read.
  ['volunteer experience', 'other'],
  ['projects', 'other'],
  ['courses', 'other'],
  ['recommendations', 'other'],
])

const SIDE_HEADINGS = new Map([
  ['contact', 'contact'],
  ['top skills', 'skills'],
  ['languages', 'languages'],
  ['certifications', 'certifications'],
  ['honors-awards', 'honors'],
  ['publications', 'publications'],
  ['patents', 'other'],
])

const squash = (value) => value.replace(/\s+/g, ' ').trim()

/**
 * True when the lines carry at least two of LinkedIn's three marks: the
 * profile address labelled "(LinkedIn)", the "Top Skills" heading, and a
 * "Page N of M" footer. One alone is common in ordinary CVs.
 * @param {string[]} lines
 * @returns {boolean}
 */
export function isLinkedInPdf(lines) {
  if (!Array.isArray(lines)) return false
  const text = lines.filter((line) => typeof line === 'string').map((line) => squash(line))
  const hasProfileLink = text.some((line, index) =>
    LINKEDIN_LABEL.test(line) && /linkedin\.com/i.test(`${text[index - 1] ?? ''} ${line}`))
  const hasTopSkills = text.some((line) => line.toLowerCase() === 'top skills')
  const hasFooter = text.some((line) => PAGE_FOOTER.test(line))
  return [hasProfileLink, hasTopSkills, hasFooter].filter(Boolean).length >= 2
}

function readDateLine(line) {
  if (!line) return null
  const dates = readDates(line.replace(TRAILING_DURATION, ''), { allowSingle: true })
  return dates && !dates.rest ? dates : null
}

function splitSections(lines, headings) {
  const sections = { head: [] }
  let current = 'head'

  for (const line of lines) {
    const kind = headings.get(line.toLowerCase())
    if (kind) {
      current = kind
      sections[current] ??= []
      continue
    }
    ;(sections[current] ??= []).push(line)
  }

  return sections
}

function titleFromHeadline(headline) {
  const title = squash(headline.split(' | ')[0].split(/\s+(?:at|@)\s+/)[0])
  return title.length <= TITLE_MAX ? title : ''
}

// A line that can be a company name rather than description text: short, and
// not a sentence ("Contoso, Inc." is a name; "Owned the roadmap." is not).
function looksLikeCompany(line) {
  const isSentence = /[,;:]$/.test(line) || (/[.!?]$/.test(line) && line.split(/\s+/).length > 4)
  return line.length <= TITLE_MAX && !BULLET.test(line) && !isSentence && !readDateLine(line)
}

function parseExperience(lines, knownLocations) {
  const isTitle = (index) =>
    index < lines.length - 1
    && !readDateLine(lines[index])
    && !DURATION.test(lines[index])
    && !BULLET.test(lines[index])
    && Boolean(readDateLine(lines[index + 1]))

  const titles = []
  for (let index = 0; index < lines.length; index += 1) {
    if (isTitle(index)) {
      titles.push(index)
      index += 1
    }
  }

  const consumed = new Set()
  const entries = []
  let company = ''

  titles.forEach((titleIndex, position) => {
    const before = titleIndex - 1
    const previousDate = position > 0 ? titles[position - 1] + 1 : -1

    if (before >= 0 && DURATION.test(lines[before])) {
      // A company with several roles: its name, then the total time there.
      company = before - 1 > previousDate ? lines[before - 1] : company
      consumed.add(before).add(before - 1)
    } else if (before > previousDate && before >= 0) {
      const line = lines[before]
      const rightAfterDate = before === previousDate + 1
      // Right after the previous role's dates, a place-like line is that
      // role's location unless it can only be this role's company. LinkedIn
      // writes places as "City, Region, Country"; a two-part name like
      // "Contoso, Inc." is taken for the company unless it is a place this
      // profile already uses.
      const isPlace = rightAfterDate && LOCATION.test(line)
        && (line.split(',').length >= 3 || knownLocations.has(line))
      if (!isPlace && looksLikeCompany(line)) {
        company = line
        consumed.add(before)
      }
    }

    const entry = createEmptyExperience()
    const dates = readDateLine(lines[titleIndex + 1])
    entry.role = lines[titleIndex]
    entry.company = company
    entry.startDate = dates.isSingle ? '' : dates.start
    entry.endDate = dates.isSingle ? dates.start : dates.end
    entry.isCurrent = dates.isCurrent
    entries.push({ entry, from: titleIndex + 2 })
  })

  entries.forEach(({ entry, from }, position) => {
    const to = position + 1 < titles.length ? titles[position + 1] : lines.length
    const body = []
    for (let index = from; index < to; index += 1) {
      if (!consumed.has(index)) body.push(lines[index])
    }

    if (body.length > 0 && LOCATION.test(body[0]) && body[0].length <= TITLE_MAX) {
      entry.location = body.shift()
      knownLocations.add(entry.location)
    }

    const description = []
    let lastWasBullet = false
    for (const line of body) {
      if (BULLET.test(line)) {
        entry.achievements.push(squash(line.replace(BULLET, '')))
        lastWasBullet = true
      } else if (lastWasBullet && /^[\p{Ll}(]/u.test(line)) {
        entry.achievements[entry.achievements.length - 1] += ` ${line}`
      } else {
        description.push(line)
        lastWasBullet = false
      }
    }
    entry.description = squash(description.join(' '))
  })

  return entries.map(({ entry }) => entry)
}

function parseEducation(lines) {
  const education = []

  for (let index = 0; index < lines.length; index += 1) {
    const entry = createEmptyEducation()
    entry.school = lines[index]
    const next = lines[index + 1]

    if (next && /(?:^|\s)·(?:\s|$)/.test(next)) {
      index += 1
      const match = /^(.*?)\s*·\s*(?:\((.*)\))?$/.exec(next)
      entry.degree = squash(match ? match[1] : next)
      const dates = match?.[2] ? readDates(match[2], { allowSingle: true }) : null
      if (dates) {
        entry.startDate = dates.isSingle ? '' : dates.start
        entry.endDate = dates.isSingle ? dates.start : dates.end
      }
    }

    education.push(entry)
  }

  return education
}

function toUrl(value) {
  const address = value.trim().replace(/\/+$/, '')
  return /^https?:\/\//i.test(address) ? address : `https://${address}`
}

function parseContact(lines) {
  const contact = { email: '', phone: '', links: createEmptyLinks() }
  const joined = []

  // An address too long for the sidebar wraps: "www.linkedin.com/in/alex-"
  // then "example-12ab34 (LinkedIn)".
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const next = lines[index + 1]
    if (next && !/\s/.test(line) && !EMAIL.test(line) && !LINK_LABEL.test(line) && LINK_LABEL.test(next)) {
      joined.push(`${line}${next}`)
      index += 1
    } else {
      joined.push(line)
    }
  }

  for (const line of joined) {
    const email = EMAIL.exec(line)
    const phone = PHONE_LABEL.exec(line)
    const link = LINK_LABEL.exec(line)

    if (phone) {
      contact.phone ||= squash(phone[1])
    } else if (link) {
      const url = toUrl(line.replace(LINK_LABEL, ''))
      const key = { linkedin: 'linkedin', portfolio: 'portfolio', blog: 'blog' }[link[1].toLowerCase()] ?? 'website'
      contact.links[key] ||= url
    } else if (email) {
      contact.email ||= email[0]
    }
  }

  return contact
}

/**
 * Reads a LinkedIn "Save to PDF" profile. Returns null when it finds no job
 * and no degree, so the caller can fall back to parseCvText.
 * @param {string[]} lines
 * @param {{ locale?: string }} [options]
 * @returns {{ data: CvData, summary: { source: 'linkedin', hasName: boolean, experience: number, education: number, skills: number, languages: number } } | null}
 */
// eslint-disable-next-line no-unused-vars
export function parseLinkedInText(lines, options = {}) {
  const cleaned = (Array.isArray(lines) ? lines : [])
    .map((line) => (line === COLUMN_BREAK ? line : typeof line === 'string' ? squashKeepingGaps(line) : ''))
    .filter((line) => line && !PAGE_FOOTER.test(line))

  const breakAt = cleaned.indexOf(COLUMN_BREAK)
  const main = splitSections(breakAt === -1 ? cleaned : cleaned.slice(0, breakAt), MAIN_HEADINGS)
  const side = splitSections(breakAt === -1 ? [] : cleaned.slice(breakAt + 1), SIDE_HEADINGS)

  const [fullName = '', ...headerRest] = main.head
  let location = ''
  let headline = []
  if (headerRest.length >= 2) {
    location = LOCATION.test(headerRest.at(-1)) ? headerRest.at(-1) : ''
    headline = location ? headerRest.slice(0, -1) : headerRest
  } else if (headerRest.length === 1) {
    if (LOCATION.test(headerRest[0])) location = headerRest[0]
    else headline = headerRest
  }

  const knownLocations = new Set(location ? [location] : [])
  const experience = parseExperience(main.experience ?? [], knownLocations)
  const education = parseEducation(main.education ?? [])

  if (experience.length === 0 && education.length === 0) return null

  const contact = parseContact(side.contact ?? [])
  const skills = (side.skills ?? []).map(squash).filter(Boolean)
  const languages = parseLanguages(side.languages ?? [])
  const certificates = (side.certifications ?? []).map((name) => ({ ...createEmptyCertificate(), name }))
  const achievements = (side.honors ?? []).map((title) => ({ ...createEmptyAchievement(), title }))
  const publications = (side.publications ?? []).map((title) => ({ ...createEmptyPublication(), title }))

  const data = parseImportedCvData({
    ...createInitialCvData(),
    fullName,
    title: titleFromHeadline(headline.join(' ')),
    about: squash((main.summary ?? []).join(' ')),
    email: contact.email,
    phone: contact.phone,
    location,
    links: contact.links,
    skills,
    ...(experience.length > 0 ? { experience } : {}),
    ...(education.length > 0 ? { education } : {}),
    ...(languages.length > 0 ? { languages } : {}),
    ...(certificates.length > 0 ? { certificates } : {}),
    ...(achievements.length > 0 ? { achievements } : {}),
    ...(publications.length > 0 ? { publications } : {}),
  })

  return {
    data,
    summary: {
      source: 'linkedin',
      hasName: Boolean(fullName),
      experience: experience.length,
      education: education.length,
      skills: skills.length,
      languages: languages.length,
    },
  }
}
