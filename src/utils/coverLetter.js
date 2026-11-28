// @ts-check
import { createEmptyLinks } from './cvForm'
import { createCvSnapshot } from './cvSnapshot'
import { matchJobAd } from './jobMatch'
import { formatLinkDisplayValue } from './shared'
import { letterText } from '../i18n/letter/index.js'
import { normalizeLocale } from '../i18n/index.js'

/** @typedef {import('../types/cv').CvData} CvData */

function trimValue(value = '') {
  return String(value ?? '').trim()
}

function joinWithAnd(items, locale) {
  if (items.length <= 1) {
    return items[0] ?? ''
  }

  if (items.length === 2) {
    return letterText.t(locale, 'join.pair', { first: items[0], second: items[1] })
  }

  const head = items.slice(0, -1).join(', ')
  const last = items[items.length - 1]

  return letterText.t(locale, 'join.series', { head, last })
}

/**
 * Builds a paragraph-by-paragraph draft, dropping any paragraph whose source
 * data is missing rather than emitting an empty or grammatically broken line.
 * @param {CvSnapshot} snapshot
 * (`snapshotSource` is the CV the snapshot came from, for matching the ad)
 * @param {{ locale: 'en' | 'fi' | 'sv', companyName: string, roleTitle: string, hiringManagerName: string, jobAd?: string }} options
 */
function buildParagraphs(snapshot, options, snapshotSource) {
  const { locale } = options
  const t = (key, vars) => letterText.t(locale, key, vars)
  const companyName = trimValue(options.companyName)
  const roleTitle = trimValue(options.roleTitle) || snapshot.title
  const hiringManagerName = trimValue(options.hiringManagerName)
  const latestExperience = snapshot.experience[0]
  const topSkills = snapshot.skills.slice(0, 6)

  const greeting = hiringManagerName
    ? t('greeting.named', { name: hiringManagerName })
    : t('greeting.unnamed')

  const openingVars = { role: roleTitle, company: companyName }
  const openingIntro = roleTitle
    ? t(companyName ? 'opening.roleAtCompany' : 'opening.role', openingVars)
    : t(companyName ? 'opening.company' : 'opening.plain', openingVars)
  const opening = [openingIntro, snapshot.about].filter(Boolean).join(' ')

  let experienceParagraph = ''

  if (latestExperience && (latestExperience.role || latestExperience.company)) {
    const roleCompany = latestExperience.role && latestExperience.company
      ? t('experience.roleAtCompany', { role: latestExperience.role, company: latestExperience.company })
      : latestExperience.role || latestExperience.company
    const detail = latestExperience.achievements[0] || latestExperience.description

    if (roleCompany && detail) {
      experienceParagraph = t(latestExperience.isCurrent ? 'experience.current' : 'experience.previous', { roleCompany, detail })
    }
  }

  let skillsParagraph = ''
  const adTerms = trimValue(options.jobAd)
    ? matchJobAd(snapshotSource, options.jobAd).found.slice(0, 4).map((item) => item.label)
    : []

  if (adTerms.length > 0) {
    skillsParagraph = t('skills.fromAd', { terms: joinWithAnd(adTerms, locale) })
  } else if (topSkills.length > 0) {
    skillsParagraph = t('skills.fromCv', { skills: joinWithAnd(topSkills, locale) })
  }

  const closing = companyName
    ? t('closing.company', { company: companyName })
    : t('closing.team')

  const signOff = t('signOff', { name: snapshot.fullName })

  return [greeting, ...[opening, experienceParagraph, skillsParagraph, closing].filter(Boolean), signOff]
}

/**
 * Generates a template-based cover letter draft from the CV's own data plus
 * a few letter-specific fields (target company/role, hiring manager name).
 * Deliberately stays offline/deterministic — no server call, matching the
 * app's "nothing ever touches a server" story — so quality is bounded by
 * template phrasing rather than free-form generation.
 * @param {CvData} formData
 * @param {{ locale?: 'en' | 'fi' | 'sv', companyName?: string, roleTitle?: string, hiringManagerName?: string, jobAd?: string }} [options]
 * @returns {string}
 */
export function generateCoverLetterDraft(formData, options = {}) {
  const snapshot = createCvSnapshot(formData)
  const locale = normalizeLocale(options.locale)
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
  return new Intl.DateTimeFormat(normalizeLocale(locale), { dateStyle: 'long' }).format(date)
}
