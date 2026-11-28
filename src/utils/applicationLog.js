import { INTL_LOCALES, normalizeLocale } from '../i18n/index.js'
// Job applications the visitor chose to log on this device (1.7.11): one
// IndexedDB record per application, holding the exact PDF (and cover letter)
// that was sent, page images for viewing, and the CV data it was made from.
// Stays in this browser, never sent anywhere.
//
// This is its own database (`portifycv-applications`), not a second store in
// the saved-CV one (`portifycv`), on purpose: the two have separate upgrade
// paths and clearing one never touches the other (spec, Approaches B).
//
// Nothing here runs on its own: every write traces back to the visitor
// pressing "Mark as applied".

/** @typedef {import('../types/cv').CvData} CvData */
/**
 * @typedef {object} ApplicationFile
 * @property {Blob} pdf
 * @property {string} fileName
 * @property {string} paper
 * @property {string} [fit]
 * @property {{ image: Blob }[]} pages
 */
/**
 * @typedef {object} ApplicationRecord
 * @property {string} id
 * @property {string} company
 * @property {string} role
 * @property {string} appliedOn  YYYY-MM-DD
 * @property {string} adUrl
 * @property {string} status
 * @property {string} note
 * @property {ApplicationFile} cv
 * @property {Omit<ApplicationFile, 'fit'> | null} letter
 * @property {{ data: CvData, templateId: string, look: object }} source
 * @property {number} createdAt
 * @property {number} updatedAt
 */

const DATABASE_NAME = 'portifycv-applications'
const DATABASE_VERSION = 1
const STORE = 'applications'

export const APPLICATION_STATUSES = Object.freeze(['applied', 'interview', 'offer', 'rejected', 'no-reply'])
export const MAX_APPLICATION_NAME_LENGTH = 120
export const MAX_APPLICATION_NOTE_LENGTH = 2000

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const clean = (value, max) => String(value ?? '').trim().slice(0, max).trim()

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `app-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * @returns {ApplicationRecord}
 */
export function createApplicationRecord({
  company,
  role,
  appliedOn,
  adUrl = '',
  cv,
  letter = null,
  source,
  now = Date.now(),
  id = createId(),
}) {
  return {
    id,
    company: clean(company, MAX_APPLICATION_NAME_LENGTH),
    role: clean(role, MAX_APPLICATION_NAME_LENGTH),
    appliedOn,
    adUrl: String(adUrl ?? '').trim(),
    status: 'applied',
    note: '',
    cv,
    letter,
    source,
    createdAt: now,
    updatedAt: now,
  }
}

export function isValidApplicationRecord(record) {
  return Boolean(
    record &&
      typeof record === 'object' &&
      typeof record.id === 'string' &&
      record.id &&
      typeof record.company === 'string' &&
      record.company.trim() &&
      typeof record.role === 'string' &&
      record.role.trim() &&
      typeof record.appliedOn === 'string' &&
      DATE_PATTERN.test(record.appliedOn) &&
      APPLICATION_STATUSES.includes(record.status) &&
      record.cv?.pdf &&
      record.source?.data &&
      typeof record.source.data === 'object' &&
      typeof record.source.templateId === 'string',
  )
}

/** Newest applied date first, then the most recently logged. Does not mutate. */
export function sortApplications(records) {
  return [...records].sort((a, b) => {
    if (a.appliedOn !== b.appliedOn) return a.appliedOn < b.appliedOn ? 1 : -1
    return b.createdAt - a.createdAt
  })
}

/**
 * Apply the fields a visitor may edit; any other key is ignored and an
 * invalid value keeps the old one.
 */
export function applyApplicationUpdate(record, changes = {}, now = Date.now()) {
  const next = { ...record, updatedAt: now }

  if ('company' in changes) {
    const company = clean(changes.company, MAX_APPLICATION_NAME_LENGTH)
    if (company) next.company = company
  }
  if ('role' in changes) {
    const role = clean(changes.role, MAX_APPLICATION_NAME_LENGTH)
    if (role) next.role = role
  }
  if ('appliedOn' in changes && DATE_PATTERN.test(String(changes.appliedOn))) next.appliedOn = changes.appliedOn
  if ('adUrl' in changes) next.adUrl = String(changes.adUrl ?? '').trim()
  if ('status' in changes && APPLICATION_STATUSES.includes(changes.status)) next.status = changes.status
  if ('note' in changes) next.note = String(changes.note ?? '').slice(0, MAX_APPLICATION_NOTE_LENGTH)

  return next
}

export function isApplicationLogAvailable() {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null
  } catch {
    // Reading the property itself can throw where storage is blocked.
    return false
  }
}

function logError(code, cause) {
  const error = new Error(`Application log: ${code}`, cause ? { cause } : undefined)
  error.code = code
  return error
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!isApplicationLogAvailable()) {
      reject(logError('unavailable'))
      return
    }

    let request

    try {
      request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    } catch (error) {
      reject(logError('unavailable', error))
      return
    }

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(logError('unavailable', request.error))
    request.onblocked = () => reject(logError('unavailable'))
  })
}

// One transaction per call, the connection closed after it, so an open
// connection never blocks a future version upgrade in another tab.
async function withStore(mode, run) {
  const database = await openDatabase()

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, mode)
      let result

      transaction.oncomplete = () => resolve(result)
      // 'full': the browser's storage quota; anything else is 'failed'.
      const failure = () => logError(transaction.error?.name === 'QuotaExceededError' ? 'full' : 'failed', transaction.error)
      transaction.onerror = () => reject(failure())
      transaction.onabort = () => reject(failure())

      try {
        run(transaction.objectStore(STORE), (value) => {
          result = value
        }, (error) => {
          // A rule of ours failed (missing): abort with it.
          transaction.onabort = () => reject(error)
          transaction.abort()
        })
      } catch (error) {
        // A put that cannot be cloned or exceeds quota throws synchronously.
        reject(error?.name === 'QuotaExceededError' ? logError('full', error) : logError('failed', error))
      }
    })
  } finally {
    database.close()
  }
}

const toSummary = ({ cv, letter, source, ...rest }) => {
  void cv
  void source
  return { ...rest, hasLetter: Boolean(letter) }
}

/** Applications without their files and CV data, newest applied first. */
export function listApplications() {
  return withStore('readonly', (store, resolve) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(sortApplications(request.result).map(toSummary))
  })
}

export function countApplications() {
  return withStore('readonly', (store, resolve) => {
    const request = store.count()
    request.onsuccess = () => resolve(request.result)
  })
}

// How the dialogs show `appliedOn`. 'YYYY-MM-DD' is a calendar day, not
// an instant: read it in local time.
export function formatAppliedOn(appliedOn, locale) {
  const [year, month, day] = String(appliedOn).split('-').map(Number)
  if (!year || !month || !day) return appliedOn
  return new Date(year, month - 1, day).toLocaleDateString(INTL_LOCALES[normalizeLocale(locale)], {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

/** @returns {Promise<ApplicationRecord | null>} */
export function getApplication(id) {
  return withStore('readonly', (store, resolve) => {
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result ?? null)
  })
}

/** @returns {Promise<ApplicationRecord>} */
export function addApplication(record) {
  if (!isValidApplicationRecord(record)) return Promise.reject(logError('invalid'))

  return withStore('readwrite', (store, resolve) => {
    store.put(record)
    resolve(record)
  })
}

export function updateApplication(id, changes) {
  return withStore('readwrite', (store, resolve, fail) => {
    const existing = store.get(id)

    existing.onsuccess = () => {
      if (!existing.result) {
        fail(logError('missing'))
        return
      }
      const next = applyApplicationUpdate(existing.result, changes)
      store.put(next)
      resolve(toSummary(next))
    }
  })
}

export function deleteApplication(id) {
  return withStore('readwrite', (store) => {
    store.delete(id)
  })
}

export function clearApplications() {
  return withStore('readwrite', (store) => {
    store.clear()
  })
}
