import { parseImportedCvData } from './cvForm'

export const SHARE_QUERY_PARAM = 'data'
export const MAX_SHARE_DATA_LENGTH = 6000
export const MAX_SHARE_URL_LENGTH = 8000
const SHARE_PAYLOAD_VERSION = 2

function compressCvData(formData) {
  return {
    v: SHARE_PAYLOAD_VERSION,
    d: {
      f: formData.fullName,
      t: formData.title,
      a: formData.about,
      p: formData.photo,
      pv: formData.photoVisibilityByTemplate,
      s: formData.skills,
      x: formData.experience.map((item) => ({
        r: item.role,
        c: item.company,
        s: item.startDate,
        e: item.endDate,
        d: item.description,
      })),
      e: formData.education.map((item) => ({
        s: item.school,
        d: item.degree,
        a: item.startDate,
        b: item.endDate,
      })),
      l: formData.links,
      sv: formData.sectionVisibility,
      siv: formData.sectionItemVisibility,
    },
  }
}

function expandCvData(value) {
  if (!value || typeof value !== 'object') {
    return value
  }

  const payload = value

  if (payload.v !== SHARE_PAYLOAD_VERSION || !payload.d) {
    return value
  }

  return {
    fullName: payload.d.f,
    title: payload.d.t,
    about: payload.d.a,
    photo: payload.d.p,
    photoVisibilityByTemplate: payload.d.pv,
    skills: payload.d.s,
    experience: Array.isArray(payload.d.x)
      ? payload.d.x.map((item) => ({
          role: item.r,
          company: item.c,
          startDate: item.s,
          endDate: item.e,
          description: item.d,
        }))
      : [],
    education: Array.isArray(payload.d.e)
      ? payload.d.e.map((item) => ({
          school: item.s,
          degree: item.d,
          startDate: item.a,
          endDate: item.b,
        }))
      : [],
    links: payload.d.l,
    sectionVisibility: payload.d.sv,
    sectionItemVisibility: payload.d.siv,
  }
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

export function readCvStateFromLocation(currentHref = window.location.href) {
  const currentUrl = new URL(currentHref)
  const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ''))
  const encodedValue = currentUrl.searchParams.get(SHARE_QUERY_PARAM)
    || hashParams.get(SHARE_QUERY_PARAM)

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
