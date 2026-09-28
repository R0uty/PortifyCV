import { parseImportedCvData } from './cvForm'

export const SHARE_QUERY_PARAM = 'data'
export const MAX_SHARE_DATA_LENGTH = 16000
export const MAX_SHARE_URL_LENGTH = 18000
const SHARE_PAYLOAD_VERSION = 3

// Short keys keep share URLs as small as possible. Never repurpose a key that is
// already in use: links generated earlier decode against these exact tables.
const ROOT_STRING_KEYS = {
  fullName: 'f',
  title: 't',
  about: 'a',
  tagline: 'tg',
  email: 'em',
  phone: 'ph',
  location: 'lo',
  photo: 'p',
}

// Uploaded images are data URLs that run to tens of kilobytes each — a single
// 20KB photo already pushes the payload several times past MAX_SHARE_DATA_LENGTH,
// so a link carrying one could never be built. They are dropped on the way out
// and the caller tells the user. The keys stay in the tables above and below so
// that a link which somehow does contain one still decodes.
const IMAGE_ROOT_FIELDS = ['photo']
const IMAGE_ITEM_FIELDS = { projects: ['image'] }

const LIST_KEYS = {
  experience: 'x',
  education: 'e',
  coreStrengths: 'cs',
  certificates: 'ct',
  projects: 'pr',
  languages: 'lg',
  interests: 'in',
  achievements: 'ah',
  openSource: 'os',
  publications: 'pb',
  leadership: 'ld',
  memberships: 'mb',
  speaking: 'sp',
  volunteering: 'vl',
  internships: 'it',
  caseStudies: 'cst',
  testimonials: 'ts',
}

const ITEM_FIELD_KEYS = {
  experience: {
    role: 'r',
    company: 'c',
    location: 'l',
    employmentType: 'et',
    startDate: 's',
    endDate: 'e',
    isCurrent: 'ic',
    description: 'd',
    achievements: 'ac',
    technologies: 'tc',
  },
  education: {
    school: 's',
    degree: 'd',
    location: 'l',
    startDate: 'a',
    endDate: 'b',
    honors: 'h',
    coursework: 'cw',
    grade: 'g',
  },
  coreStrengths: { title: 't', description: 'd' },
  certificates: { name: 'n', issuer: 'i', year: 'y', credentialUrl: 'u', expiry: 'x' },
  projects: {
    name: 'n',
    description: 'd',
    stack: 's',
    githubUrl: 'g',
    demoUrl: 'm',
    organization: 'o',
    impact: 'i',
    date: 'dt',
    teamSize: 'z',
    contribution: 'c',
    image: 'im',
  },
  languages: { language: 'l', level: 'v' },
  interests: { name: 'n' },
  achievements: { title: 't', description: 'd', year: 'y' },
  openSource: { name: 'n', description: 'd', language: 'l', stars: 's', forks: 'f', url: 'u' },
  publications: { title: 't', publisher: 'p', year: 'y', url: 'u' },
  leadership: { role: 'r', organization: 'o', description: 'd', startDate: 's', endDate: 'e' },
  memberships: { organization: 'o', role: 'r', year: 'y' },
  speaking: { conference: 'c', topic: 't', audience: 'a', date: 'd' },
  volunteering: { organization: 'o', role: 'r', description: 'd' },
  internships: {
    role: 'r',
    company: 'c',
    location: 'l',
    startDate: 's',
    endDate: 'e',
    description: 'd',
    technologies: 'tc',
  },
  caseStudies: {
    title: 't',
    problem: 'p',
    solution: 's',
    technologies: 'tc',
    outcome: 'o',
    lessons: 'l',
  },
  testimonials: { quote: 'q', author: 'a', role: 'r' },
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Empty values are dropped on the way out and restored to the schema default on
// the way in, so blank fields cost nothing in the URL.
function isEmptyValue(value) {
  if (value === undefined || value === null || value === '' || value === false) {
    return true
  }

  return Array.isArray(value) && value.length === 0
}

function compressItem(item, fieldKeys, skippedFields = []) {
  if (!isPlainObject(item)) {
    return {}
  }

  return Object.entries(fieldKeys).reduce((next, [field, shortKey]) => {
    const value = item[field]

    if (!isEmptyValue(value) && !skippedFields.includes(field)) {
      next[shortKey] = value
    }

    return next
  }, {})
}

function expandItem(item, fieldKeys) {
  if (!isPlainObject(item)) {
    return {}
  }

  return Object.entries(fieldKeys).reduce((next, [field, shortKey]) => {
    if (item[shortKey] !== undefined) {
      next[field] = item[shortKey]
    }

    return next
  }, {})
}

function compressCvData(formData) {
  const data = {}

  Object.entries(ROOT_STRING_KEYS).forEach(([field, shortKey]) => {
    if (!isEmptyValue(formData[field]) && !IMAGE_ROOT_FIELDS.includes(field)) {
      data[shortKey] = formData[field]
    }
  })

  if (!isEmptyValue(formData.skills)) {
    data.s = formData.skills
  }

  Object.entries(LIST_KEYS).forEach(([section, shortKey]) => {
    const items = Array.isArray(formData[section]) ? formData[section] : []
    const compressed = items.map((item) =>
      compressItem(item, ITEM_FIELD_KEYS[section], IMAGE_ITEM_FIELDS[section]),
    )

    // Blank rows are kept so item indexes (and the per-item visibility map that
    // is keyed by them) survive the round trip. A list that is blank throughout
    // carries nothing at all.
    if (compressed.some((item) => Object.keys(item).length > 0)) {
      data[shortKey] = compressed
    }
  })

  if (isPlainObject(formData.links)) {
    const links = Object.fromEntries(
      Object.entries(formData.links).filter(([, value]) => !isEmptyValue(value)),
    )

    if (Object.keys(links).length > 0) {
      data.l = links
    }
  }

  if (!isEmptyValue(formData.sectionOrder)) {
    data.so = formData.sectionOrder
  }

  if (isPlainObject(formData.sectionVisibility)) {
    // Only hidden sections are worth carrying; everything else defaults to visible.
    const hidden = Object.fromEntries(
      Object.entries(formData.sectionVisibility).filter(([, value]) => value === false),
    )

    if (Object.keys(hidden).length > 0) {
      data.sv = hidden
    }
  }

  if (isPlainObject(formData.sectionItemVisibility)) {
    const hiddenItems = Object.entries(formData.sectionItemVisibility).reduce(
      (next, [section, itemMap]) => {
        if (!isPlainObject(itemMap)) {
          return next
        }

        const hidden = Object.fromEntries(
          Object.entries(itemMap).filter(([, value]) => value === false),
        )

        if (Object.keys(hidden).length > 0) {
          next[section] = hidden
        }

        return next
      },
      {},
    )

    if (Object.keys(hiddenItems).length > 0) {
      data.siv = hiddenItems
    }
  }

  if (isPlainObject(formData.photoVisibilityByTemplate)) {
    const hiddenPhotos = Object.fromEntries(
      Object.entries(formData.photoVisibilityByTemplate).filter(([, value]) => value === false),
    )

    if (Object.keys(hiddenPhotos).length > 0) {
      data.pv = hiddenPhotos
    }
  }

  if (isPlainObject(formData.sectionColumnsByTemplate)) {
    const moved = Object.fromEntries(
      Object.entries(formData.sectionColumnsByTemplate).filter(
        ([, columns]) => isPlainObject(columns) && Object.keys(columns).length > 0,
      ),
    )

    if (Object.keys(moved).length > 0) {
      data.sc = moved
    }
  }

  return { v: SHARE_PAYLOAD_VERSION, d: data }
}

function expandCurrentPayload(data) {
  const formData = {}

  Object.entries(ROOT_STRING_KEYS).forEach(([field, shortKey]) => {
    if (data[shortKey] !== undefined) {
      formData[field] = data[shortKey]
    }
  })

  if (data.s !== undefined) {
    formData.skills = data.s
  }

  Object.entries(LIST_KEYS).forEach(([section, shortKey]) => {
    if (Array.isArray(data[shortKey])) {
      formData[section] = data[shortKey].map((item) =>
        expandItem(item, ITEM_FIELD_KEYS[section]),
      )
    }
  })

  if (data.l !== undefined) {
    formData.links = data.l
  }

  if (data.so !== undefined) {
    formData.sectionOrder = data.so
  }

  if (data.sv !== undefined) {
    formData.sectionVisibility = data.sv
  }

  if (data.siv !== undefined) {
    formData.sectionItemVisibility = data.siv
  }

  if (data.pv !== undefined) {
    formData.photoVisibilityByTemplate = data.pv
  }

  if (data.sc !== undefined) {
    formData.sectionColumnsByTemplate = data.sc
  }

  return formData
}

// Version 2 links only carried a subset of the CV. They are still readable so
// previously shared URLs keep working.
function expandLegacyV2Payload(data) {
  return {
    fullName: data.f,
    title: data.t,
    about: data.a,
    photo: data.p,
    photoVisibilityByTemplate: data.pv,
    skills: data.s,
    experience: Array.isArray(data.x)
      ? data.x.map((item) => ({
          role: item.r,
          company: item.c,
          startDate: item.s,
          endDate: item.e,
          description: item.d,
        }))
      : [],
    education: Array.isArray(data.e)
      ? data.e.map((item) => ({
          school: item.s,
          degree: item.d,
          startDate: item.a,
          endDate: item.b,
        }))
      : [],
    links: data.l,
    sectionOrder: data.so,
    sectionVisibility: data.sv,
    sectionItemVisibility: data.siv,
  }
}

function expandCvData(value) {
  if (!isPlainObject(value) || !isPlainObject(value.d)) {
    return value
  }

  if (value.v === SHARE_PAYLOAD_VERSION) {
    return expandCurrentPayload(value.d)
  }

  if (value.v === 2) {
    return expandLegacyV2Payload(value.d)
  }

  return value
}

function encodeBase64Url(bytes) {
  let binary = ''

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return window
    .btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function decodeBase64Url(value) {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalizedValue.length % 4 === 0 ? '' : '='.repeat(4 - (normalizedValue.length % 4))
  const binary = window.atob(`${normalizedValue}${padding}`)

  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export function encodeCvStateForUrl(formData) {
  const json = JSON.stringify(compressCvData(formData))
  const bytes = new TextEncoder().encode(json)

  return encodeBase64Url(bytes)
}

export function decodeCvStateFromUrl(encodedValue) {
  if (typeof encodedValue !== 'string' || !encodedValue.trim()) {
    throw new Error('Shared CV data is missing.')
  }

  if (encodedValue.length > MAX_SHARE_DATA_LENGTH) {
    throw new Error('Shared CV link is too large to restore. Import the JSON file instead.')
  }

  try {
    const bytes = decodeBase64Url(encodedValue)
    const json = new TextDecoder().decode(bytes)

    return parseImportedCvData(expandCvData(JSON.parse(json)))
  } catch {
    throw new Error('Shared CV link is invalid or corrupted.')
  }
}

// True when the CV holds an image that a share link cannot carry, so the caller
// can tell the recipient's copy will arrive without it.
export function shareLinkOmitsImages(formData) {
  if (!isPlainObject(formData)) {
    return false
  }

  if (IMAGE_ROOT_FIELDS.some((field) => !isEmptyValue(formData[field]))) {
    return true
  }

  return Object.entries(IMAGE_ITEM_FIELDS).some(([section, fields]) => {
    const items = Array.isArray(formData[section]) ? formData[section] : []

    return items.some((item) => isPlainObject(item) && fields.some((field) => !isEmptyValue(item[field])))
  })
}

export function buildShareUrl(formData, currentHref = window.location.href) {
  const encodedValue = encodeCvStateForUrl(formData)
  const nextUrl = new URL(currentHref)

  nextUrl.pathname = '/cv'
  nextUrl.search = ''
  nextUrl.hash = `${SHARE_QUERY_PARAM}=${encodedValue}`

  const shareUrl = nextUrl.toString()

  if (encodedValue.length > MAX_SHARE_DATA_LENGTH || shareUrl.length > MAX_SHARE_URL_LENGTH) {
    throw new Error('This CV is too large to fit in a shareable link. Export JSON instead.')
  }

  return shareUrl
}

// Reads share data from the URL fragment ONLY. Unlike the fragment, a query
// string is part of the request line — browsers send it to whatever server
// hosts this page and it can end up in access/CDN logs. buildShareUrl has
// always used the fragment, but this used to also accept `?data=` for
// backward compatibility with pre-1.0 links; that meant opening one of those
// old links would leak the whole CV to server-side logs, contradicting the
// "never sent to a server" privacy promise. Query-string data is no longer
// read — only cleaned out of the visible URL (see below) — so an old link
// just opens an empty builder instead of silently leaking its payload again
// on every subsequent open.
export function readCvStateFromLocation(currentHref = window.location.href) {
  const currentUrl = new URL(currentHref)
  const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ''))
  const encodedValue = hashParams.get(SHARE_QUERY_PARAM)

  if (!encodedValue) {
    return null
  }

  return decodeCvStateFromUrl(encodedValue)
}

export function removeShareDataParamFromCurrentUrl() {
  const currentUrl = new URL(window.location.href)
  const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ''))

  const hasQueryData = currentUrl.searchParams.has(SHARE_QUERY_PARAM)
  const hasHashData = hashParams.has(SHARE_QUERY_PARAM)

  if (!hasQueryData && !hasHashData) {
    return
  }

  currentUrl.searchParams.delete(SHARE_QUERY_PARAM)
  hashParams.delete(SHARE_QUERY_PARAM)
  const nextSearch = currentUrl.searchParams.toString()
  const nextHash = hashParams.toString()
  const nextUrl = `${currentUrl.pathname}${nextSearch ? `?${nextSearch}` : ''}${nextHash ? `#${nextHash}` : ''}`

  window.history.replaceState({}, '', nextUrl)
}
