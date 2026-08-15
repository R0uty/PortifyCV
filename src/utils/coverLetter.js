// @ts-check
import { createCvSnapshot } from './cvSnapshot'

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
 * @param {{ locale: 'en' | 'fi', companyName: string, roleTitle: string, hiringManagerName: string }} options
 */
function buildParagraphs(snapshot, options) {
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

  if (topSkills.length > 0) {
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
 * @param {{ locale?: 'en' | 'fi', companyName?: string, roleTitle?: string, hiringManagerName?: string }} [options]
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
  })

  return paragraphs.join('\n\n')
}
