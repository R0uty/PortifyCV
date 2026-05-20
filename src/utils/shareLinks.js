import { parseImportedCvData } from './cvForm'

export const SHARE_QUERY_PARAM = 'data'
export const MAX_SHARE_DATA_LENGTH = 6000
export const MAX_SHARE_URL_LENGTH = 8000

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
  const json = JSON.stringify(formData)
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

    return parseImportedCvData(JSON.parse(json))
  } catch {
    throw new Error('Shared CV link is invalid or corrupted.')
  }
}

export function buildShareUrl(formData, currentHref = window.location.href) {
  const encodedValue = encodeCvStateForUrl(formData)
  const nextUrl = new URL(currentHref)

  nextUrl.pathname = '/cv'
  nextUrl.search = ''
  nextUrl.searchParams.set(SHARE_QUERY_PARAM, encodedValue)
  nextUrl.hash = ''

  const shareUrl = nextUrl.toString()

  if (encodedValue.length > MAX_SHARE_DATA_LENGTH || shareUrl.length > MAX_SHARE_URL_LENGTH) {
    throw new Error('This CV is too large to fit in a shareable link. Export JSON instead.')
  }

  return shareUrl
}

export function readCvStateFromLocation(currentHref = window.location.href) {
  const currentUrl = new URL(currentHref)
  const encodedValue = currentUrl.searchParams.get(SHARE_QUERY_PARAM)

  if (!encodedValue) {
    return null
  }

  return decodeCvStateFromUrl(encodedValue)
}

export function removeShareDataParamFromCurrentUrl() {
  const currentUrl = new URL(window.location.href)

  if (!currentUrl.searchParams.has(SHARE_QUERY_PARAM)) {
    return
  }

  currentUrl.searchParams.delete(SHARE_QUERY_PARAM)
  const nextSearch = currentUrl.searchParams.toString()
  const nextUrl = `${currentUrl.pathname}${nextSearch ? `?${nextSearch}` : ''}${currentUrl.hash}`

  window.history.replaceState({}, '', nextUrl)
}
