// @ts-check
import { createEmptyLinks } from './cvForm'
import { createCvSnapshot } from './cvSnapshot'
import { matchJobAd } from './jobMatch'
import { formatLinkDisplayValue } from './shared'

/** @typedef {import('../types/cv').CvData} CvData */

function trimValue(value = '') {
  return String(value ?? '').trim()
}

function joinWithAnd(items, locale) {
  if (items.length <= 1) {
    return items[0] ?? ''
  }

  if (items.length === 2) {
    return locale === 'fi' ? `${items[0]} ja ${items[1]}` : `${items[0]} and ${items[1]}`
  }

  const head = items.slice(0, -1).join(', ')
  const last = items[items.length - 1]

  return locale === 'fi' ? `${head} ja ${last}` : `${head}, and ${last}`
}

/**
 * Builds a paragraph-by-paragraph draft, dropping any paragraph whose source
 * data is missing rather than emitting an empty or grammatically broken line.
 * @param {CvSnapshot} snapshot
 * (`snapshotSource` is the CV the snapshot came from, for matching the ad)
 * @param {{ locale: 'en' | 'fi', companyName: string, roleTitle: string, hiringManagerName: string, jobAd?: string }} options
 */
function buildParagraphs(snapshot, options, snapshotSource) {
  const isFinnish = options.locale === 'fi'
  const companyName = trimValue(options.companyName)
  const roleTitle = trimValue(options.roleTitle) || snapshot.title
  const hiringManagerName = trimValue(options.hiringManagerName)
  const latestExperience = snapshot.experience[0]
  const topSkills = snapshot.skills.slice(0, 6)

  const greeting = isFinnish
    ? `Hyvä ${hiringManagerName || 'rekrytoija'},`
    : `Dear ${hiringManagerName || 'Hiring Manager'},`

  const openingRole = isFinnish
    ? roleTitle
      ? `avoinna olevaa ${roleTitle} -tehtävää`
      : 'avoinna olevaa tehtävää'
    : roleTitle
      ? `the ${roleTitle} position`
      : 'this position'
  const openingCompany = companyName
    ? isFinnish
      ? ` yrityksessä ${companyName}`
      : ` at ${companyName}`
    : ''
  const openingIntro = isFinnish
    ? `Haen ${openingRole}${openingCompany}.`
    : `I'm writing to apply for ${openingRole}${openingCompany}.`
  const opening = [openingIntro, snapshot.about].filter(Boolean).join(' ')

  let experienceParagraph = ''

  if (latestExperience && (latestExperience.role || latestExperience.company)) {
    const roleCompany = [latestExperience.role, latestExperience.company].filter(Boolean).join(isFinnish ? ' yrityksessä ' : ' at ')
    const detail = latestExperience.achievements[0] || latestExperience.description

    if (roleCompany && detail) {
      const lead = isFinnish
        ? latestExperience.isCurrent
          ? `Nykyisessä roolissani ${roleCompany}`
          : `Edellisessä roolissani ${roleCompany}`
        : latestExperience.isCurrent
          ? `In my current role as ${roleCompany}`
          : `In my most recent role as ${roleCompany}`

      experienceParagraph = `${lead}: ${detail}`
    }
  }

  let skillsParagraph = ''
  const adTerms = trimValue(options.jobAd)
    ? matchJobAd(snapshotSource, options.jobAd).found.slice(0, 4).map((item) => item.label)
    : []

  if (adTerms.length > 0) {
    skillsParagraph = isFinnish
      ? `Kokemukseni kattaa sen, mitä tehtävässä haetaan: ${joinWithAnd(adTerms, 'fi')}.`
      : `My experience covers what this role asks for: ${joinWithAnd(adTerms, 'en')}.`
  } else if (topSkills.length > 0) {
    skillsParagraph = isFinnish
      ? `Osaamiseeni kuuluu muun muassa ${joinWithAnd(topSkills, 'fi')}.`
      : `My background includes ${joinWithAnd(topSkills, 'en')}.`
  }

  const closingCompany = companyName
    ? isFinnish
      ? `yritystänne ${companyName}`
      : companyName
    : isFinnish
      ? 'tiimiänne'
      : 'your team'
  const closing = isFinnish
    ? `Keskustelen mielelläni siitä, miten kokemukseni voisi hyödyttää ${closingCompany}. Kiitos ajastanne ja harkinnastanne.`
    : `I'd welcome the opportunity to discuss how my experience could contribute to ${closingCompany}. Thank you for your time and consideration.`

  const signOff = isFinnish
    ? `Ystävällisin terveisin,\n${snapshot.fullName}`
    : `Sincerely,\n${snapshot.fullName}`

  return [greeting, ...[opening, experienceParagraph, skillsParagraph, closing].filter(Boolean), signOff]
}

/**
 * Generates a template-based cover letter draft from the CV's own data plus
 * a few letter-specific fields (target company/role, hiring manager name).
 * Deliberately stays offline/deterministic — no server call, matching the
 * app's "nothing ever touches a server" story — so quality is bounded by
 * template phrasing rather than free-form generation.
 * @param {CvData} formData
 * @param {{ locale?: 'en' | 'fi', companyName?: string, roleTitle?: string, hiringManagerName?: string, jobAd?: string }} [options]
 * @returns {string}
 */
export function generateCoverLetterDraft(formData, options = {}) {
  const snapshot = createCvSnapshot(formData)
  const locale = options.locale === 'fi' ? 'fi' : 'en'
  const paragraphs = buildParagraphs(snapshot, {
    locale,
    companyName: options.companyName ?? '',
    roleTitle: options.roleTitle ?? '',
    hiringManagerName: options.hiringManagerName ?? '',
    jobAd: options.jobAd ?? '',
  }, formData)

  return paragraphs.join('\n\n')
}

/**
 * The letter's header (1.7.9): the CV's name, title and one contact line
 * (email, phone, location, the first link). The letter page and the
 * text-only fallback PDF both draw it from here.
 * @param {CvData} formData
 * @returns {{ name: string, title: string, contacts: string[] }}
 */
export function getCoverLetterHeader(formData) {
  const links = formData?.links ?? {}
  const linkKeys = [...new Set([...Object.keys(createEmptyLinks()), ...Object.keys(links)])]
  const firstLink = linkKeys.map((key) => trimValue(links[key])).find(Boolean) ?? ''

  return {
    name: trimValue(formData?.fullName),
    title: trimValue(formData?.title),
    contacts: [
      trimValue(formData?.email),
      trimValue(formData?.phone),
      trimValue(formData?.location),
      formatLinkDisplayValue(firstLink),
    ].filter(Boolean),
  }
}

/**
 * "Hiring manager, Company", leaving out whichever is empty.
 * @param {{ hiringManager?: string, company?: string }} letter
 */
export function getCoverLetterRecipient(letter) {
  return [trimValue(letter?.hiringManager), trimValue(letter?.company)].filter(Boolean).join(', ')
}

/**
 * The body's paragraphs: split on blank lines, line breaks inside one kept.
 * @param {string} body
 */
export function splitCoverLetterParagraphs(body) {
  return String(body ?? '')
    .trim()
    .split(/\n[ \t]*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

/**
 * Today's date in the letter's language ("November 20, 2026", "20. marraskuuta 2026").
 * @param {string} locale
 * @param {Date} [date]
 */
export function formatCoverLetterDate(locale, date = new Date()) {
  return new Intl.DateTimeFormat(locale === 'fi' ? 'fi' : 'en', { dateStyle: 'long' }).format(date)
}
