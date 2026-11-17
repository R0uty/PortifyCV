// @ts-check
// "What a parser reads" (1.7.4): the PDF the visitor is about to download,
// read back the way an applicant tracking system would, and compared with
// what the CV says.
//
// The reading reuses the CV file import (1.7.0): pdf.js pulls the PDF's
// text out in reading order (cvFileText.js) and the rule-based parser turns
// it into fields (cvTextImport.js). Both are imported inside
// readCvPdfAsParser, so this module's comparison stays cheap to import (the
// check script runs it in Node) and pdf.js loads only when the tab opens.
// Nothing leaves the browser.

import { createCvSnapshot } from './cvSnapshot'

/** @typedef {import('../types/cv').CvData} CvData */

/**
 * @typedef {'ok' | 'partial' | 'unrecognised' | 'missing'} ParserRowStatus
 *   ok: read into the right field; partial: some of a list was;
 *   unrecognised: the words are in the PDF's text, not in that field;
 *   missing: not in the PDF's text at all.
 * @typedef {object} ParserRow
 * @property {'name' | 'headline' | 'email' | 'phone' | 'summary' | 'job' | 'education' | 'skills' | 'languages'} field
 * @property {string} value what the CV says
 * @property {ParserRowStatus} status
 * @property {{ found: number, total: number }} [count] for skills and languages
 */

const normalize = (value) => String(value ?? '')
  .toLowerCase()
  .normalize('NFC')
  .replace(/[‐-―−]/g, '-')
  .replace(/\s+/g, ' ')
  .trim()

// For "is it anywhere in the text": punctuation and spacing differ between
// the screen and a PDF's text (bullets, separators, line breaks).
const loose = (value) => normalize(value).replace(/[^\p{L}\p{N}@+#.]+/gu, ' ').trim()

const digits = (value) => String(value ?? '').replace(/\D/g, '')

// Either contains the other: a parsed role may carry a date or a location
// the screen shows elsewhere, and the other way round.
function similar(a, b) {
  const left = loose(a)
  const right = loose(b)
  if (!left || !right) return false
  return left === right || left.includes(right) || right.includes(left)
}

function inText(text, value) {
  const needle = loose(value)
  return needle.length > 0 && text.includes(needle)
}

// The first few words: a summary is re-wrapped in a PDF, and the parser may
// stop it at a line it reads as a heading.
const opening = (value, words = 6) => loose(value).split(' ').slice(0, words).join(' ')

/**
 * @param {CvData} formData the CV as it is in the builder
 * @param {CvData | null} parsed what the parser made of the PDF (null if it found nothing)
 * @param {string[]} lines the PDF's text lines
 * @returns {ParserRow[]} one row per thing the CV says, in CV order
 */
export function compareParsedCv(formData, parsed, lines) {
  const cv = createCvSnapshot(formData)
  const text = ` ${loose((Array.isArray(lines) ? lines : []).join(' '))} `
  const result = parsed ?? null
  /** @type {ParserRow[]} */
  const rows = []

  const single = (field, value, isRead) => {
    if (!value) return
    rows.push({
      field,
      value,
      status: isRead ? 'ok' : inText(text, value) ? 'unrecognised' : 'missing',
    })
  }

  single('name', cv.fullName, Boolean(result) && normalize(result.fullName) === normalize(cv.fullName))
  single('headline', cv.title, Boolean(result) && similar(result.title, cv.title))
  single('email', cv.email, Boolean(result) && normalize(result.email) === normalize(cv.email))
  if (cv.phone) {
    const isRead = Boolean(result) && digits(result.phone).length > 0 && digits(result.phone) === digits(cv.phone)
    rows.push({
      field: 'phone',
      value: cv.phone,
      status: isRead ? 'ok' : digits(text).includes(digits(cv.phone)) ? 'unrecognised' : 'missing',
    })
  }
  if (cv.about) {
    const start = opening(cv.about)
    const isRead = Boolean(result?.about) && loose(result.about).includes(start)
    rows.push({ field: 'summary', value: cv.about, status: isRead ? 'ok' : inText(text, start) ? 'unrecognised' : 'missing' })
  }

  for (const job of cv.experience) {
    const value = [job.role, job.company].filter(Boolean).join(' · ')
    if (!value) continue
    const isRead = (result?.experience ?? []).some((item) =>
      (!job.role || similar(item.role, job.role) || similar(item.company, job.role))
      && (!job.company || similar(item.company, job.company) || similar(item.role, job.company)))
    rows.push({
      field: 'job',
      value,
      status: isRead ? 'ok' : inText(text, job.role || job.company) ? 'unrecognised' : 'missing',
    })
  }

  for (const school of cv.education) {
    const value = [school.degree, school.school].filter(Boolean).join(' · ')
    if (!value) continue
    const isRead = (result?.education ?? []).some((item) =>
      (!school.degree || similar(item.degree, school.degree) || similar(item.school, school.degree))
      && (!school.school || similar(item.school, school.school) || similar(item.degree, school.school)))
    rows.push({
      field: 'education',
      value,
      status: isRead ? 'ok' : inText(text, school.degree || school.school) ? 'unrecognised' : 'missing',
    })
  }

  const listRow = (field, values, parsedValues) => {
    if (values.length === 0) return
    const found = values.filter((value) => parsedValues.some((item) => normalize(item) === normalize(value))).length
    const anyInText = values.some((value) => inText(text, value))
    rows.push({
      field,
      value: values.join(', '),
      count: { found, total: values.length },
      status: found === values.length ? 'ok' : found > 0 ? 'partial' : anyInText ? 'unrecognised' : 'missing',
    })
  }

  listRow('skills', cv.skills, result?.skills ?? [])
  listRow(
    'languages',
    cv.languages.map((item) => item.language).filter(Boolean),
    (result?.languages ?? []).map((item) => item.language),
  )

  return rows
}

/**
 * Reads a PDF the way a parser would and compares it with the CV.
 * @param {Blob} pdfBlob the PDF exactly as it would download
 * @param {CvData} formData
 * @param {'en' | 'fi'} locale
 * @returns {Promise<{ lines: string[], rows: ParserRow[] }>}
 */
export async function readCvPdfAsParser(pdfBlob, formData, locale) {
  const [{ extractCvFileText, COLUMN_BREAK }, { parseCvText }] = await Promise.all([
    import('./cvFileText'),
    import('./cvTextImport'),
  ])
  const file = new File([pdfBlob], 'cv.pdf', { type: 'application/pdf' })
  let lines = []

  try {
    lines = await extractCvFileText(file)
  } catch (error) {
    // No text at all: everything is missing, which is the finding.
    if (error?.code !== 'no-text') throw error
  }

  let parsed = null
  try {
    parsed = parseCvText(lines, { locale }).data
  } catch {
    // The parser found nothing it could place.
  }

  return {
    lines: lines.map((line) => (line === COLUMN_BREAK ? '' : line)),
    rows: compareParsedCv(formData, parsed, lines.filter((line) => line !== COLUMN_BREAK)),
  }
}
