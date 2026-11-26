// CVs the visitor chose to keep on this device (1.7.1): one IndexedDB
// record per CV, in this browser only, never sent anywhere.
//
// The product's promise is "nothing saved unless you choose to", so nothing
// here runs on its own: every write traces back to the visitor pressing
// Save on a CV (and, from then on, editing that CV). Reading the list is
// the one thing the builder does unasked, to say that saved CVs exist.
//
// IndexedDB rather than localStorage because a CV with a photo and project
// images can exceed localStorage's ~5 MB by itself.

import { dialogs } from '../i18n/dialogs/index.js'

/** @typedef {import('../types/cv').CvData} CvData */
/**
 * @typedef {object} CvRecord
 * @property {string} id
 * @property {string} name
 * @property {CvData} data
 * @property {string} templateId
 * @property {number} createdAt
 * @property {number} updatedAt
 */

const DATABASE_NAME = 'portifycv'
const DATABASE_VERSION = 1
const STORE = 'cvs'

export const MAX_CV_NAME_LENGTH = 60
// Which saved CV this tab has open, so a reload (session restore) stays
// attached to it. sessionStorage: it ends with the tab, like the snapshot.
export const ACTIVE_CV_SESSION_KEY = 'portifycv-active-cv'

export function normalizeCvName(name) {
  return String(name ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_CV_NAME_LENGTH).trim()
}

/** The name offered in the Save prompt. */
export function defaultCvName(data, locale = 'en') {
  const fullName = normalizeCvName(data?.fullName)

  if (!fullName) return dialogs.t(locale, 'library.defaultName')
  return normalizeCvName(`${fullName.slice(0, MAX_CV_NAME_LENGTH - 3)} CV`)
}

/** "Name (copy)", then "Name (copy 2)", … — whichever is not taken yet. */
export function nextCopyName(name, existingNames = [], locale = 'en') {
  // Copying a copy numbers on from the original instead of nesting
  // "(copy) (copy)".
  const base = normalizeCvName(name).replace(/\s*\((?:copy|kopio)(?: \d+)?\)$/i, '') || normalizeCvName(name)
  const taken = new Set(existingNames.map((existing) => normalizeCvName(existing).toLowerCase()))

  for (let number = 1; ; number += 1) {
    const suffix = number === 1
      ? dialogs.t(locale, 'library.copySuffix')
      : dialogs.t(locale, 'library.copySuffixNumbered', { number })
    const candidate = `${base.slice(0, MAX_CV_NAME_LENGTH - suffix.length).trim()}${suffix}`
    if (!taken.has(candidate.toLowerCase())) return candidate
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `cv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * @param {{ name: string, data: CvData, templateId: string, now?: number, id?: string, createdAt?: number }} input
 * @returns {CvRecord}
 */
export function createCvRecord({ name, data, templateId, now = Date.now(), id = createId(), createdAt = now }) {
  return { id, name: normalizeCvName(name), data, templateId, createdAt, updatedAt: now }
}

export function isCvLibraryAvailable() {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null
  } catch {
    // Reading the property itself can throw where storage is blocked.
    return false
  }
}

function libraryError(code, cause) {
  const error = new Error(`Saved CVs: ${code}`, cause ? { cause } : undefined)
  error.code = code
  return error
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!isCvLibraryAvailable()) {
      reject(libraryError('unavailable'))
      return
    }

    let request

    try {
      request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    } catch (error) {
      reject(libraryError('unavailable', error))
      return
    }

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(libraryError('unavailable', request.error))
    request.onblocked = () => reject(libraryError('unavailable'))
  })
}

// One transaction per call, the connection closed after it: the library is
// touched a few times a minute at most, and an open connection would block
// a future version upgrade in another tab.
async function withStore(mode, run) {
  const database = await openDatabase()

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, mode)
      let result

      transaction.oncomplete = () => resolve(result)
      // 'full': the browser's storage quota; anything else is 'failed'.
      const failure = () => libraryError(transaction.error?.name === 'QuotaExceededError' ? 'full' : 'failed', transaction.error)
      transaction.onerror = () => reject(failure())
      transaction.onabort = () => reject(failure())

      try {
        run(transaction.objectStore(STORE), (value) => {
          result = value
        }, (error) => {
          // A rule of ours failed (conflict, missing): abort with it.
          transaction.onabort = () => reject(error)
          transaction.abort()
        })
      } catch (error) {
        reject(libraryError('unavailable', error))
      }
    })
  } finally {
    database.close()
  }
}

const toSummary = ({ id, name, templateId, createdAt, updatedAt }) => ({ id, name, templateId, createdAt, updatedAt })

/** Saved CVs without their data, most recently edited first. */
export function listSavedCvs() {
  return withStore('readonly', (store, resolve) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result.map(toSummary).sort((a, b) => b.updatedAt - a.updatedAt))
  })
}

export function countSavedCvs() {
  return withStore('readonly', (store, resolve) => {
    const request = store.count()
    request.onsuccess = () => resolve(request.result)
  })
}

/** @returns {Promise<CvRecord | null>} */
export function getSavedCv(id) {
  return withStore('readonly', (store, resolve) => {
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result ?? null)
  })
}

/**
 * Write a record. `expectedUpdatedAt` is the version this tab believes is
 * stored: `null` for a record that must not exist yet, a number for an
 * update, `undefined` to overwrite whatever is there. A mismatch means
 * another tab saved in between and rejects with `code: 'conflict'`; an
 * expected record that is gone rejects with `code: 'missing'`. Every call
 * can also reject with 'unavailable' (no IndexedDB), 'full' (quota) or 'failed'.
 * @param {CvRecord} record
 * @param {{ expectedUpdatedAt?: number | null }} [options]
 * @returns {Promise<CvRecord>}
 */
export function saveCv(record, { expectedUpdatedAt } = {}) {
  return withStore('readwrite', (store, resolve, fail) => {
    const existing = store.get(record.id)

    existing.onsuccess = () => {
      const stored = existing.result

      if (expectedUpdatedAt !== undefined) {
        if (!stored && expectedUpdatedAt !== null) {
          fail(libraryError('missing'))
          return
        }
        if (stored && stored.updatedAt !== expectedUpdatedAt) {
          fail(libraryError('conflict'))
          return
        }
      }

      const next = { ...record, createdAt: stored?.createdAt ?? record.createdAt }
      store.put(next)
      resolve(next)
    }
  })
}

export function renameSavedCv(id, name) {
  return withStore('readwrite', (store, resolve, fail) => {
    const existing = store.get(id)

    existing.onsuccess = () => {
      if (!existing.result) {
        fail(libraryError('missing'))
        return
      }
      // updatedAt is left alone: it is the version of the CV's content, and
      // a tab that has this CV open must not see a rename as a conflict.
      const next = { ...existing.result, name: normalizeCvName(name) || existing.result.name }
      store.put(next)
      resolve(toSummary(next))
    }
  })
}

export function deleteSavedCv(id) {
  return withStore('readwrite', (store) => {
    store.delete(id)
  })
}

export function clearSavedCvs() {
  return withStore('readwrite', (store) => {
    store.clear()
  })
}
