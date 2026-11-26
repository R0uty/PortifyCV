// Image upload pipeline shared by Classic mode (CVForm.jsx — profile
// photo *and* project images) and the Direct Edit section popup
// (SectionEditorPopup.jsx). Extracted here rather than duplicated: the
// pipeline does MIME validation, a 2MB source check, a canvas resize to
// 480px, a JPEG re-encode and a post-encode 450KB ceiling, and a second
// copy would drift until one surface accepted images the other rejects.

import { dialogs } from '../i18n/dialogs/index.js'

// The upload's errors are thrown in English (the Error's message) and
// shown through localizePhotoErrorMessage.
const PHOTO_ERROR_KEYS = [
  'photoErrors.readFailed',
  'photoErrors.processFailed',
  'photoErrors.invalid',
  'photoErrors.tooBig',
  'photoErrors.tooLarge',
]
const photoError = (key) => new Error(dialogs.t('en', key))

export const MAX_PROFILE_PHOTO_SIZE_BYTES = 2 * 1024 * 1024
export const MAX_PROFILE_PHOTO_EDGE_PX = 480
export const MAX_PROFILE_PHOTO_DATA_URL_LENGTH = 450_000

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(photoError('photoErrors.readFailed'))
    reader.readAsDataURL(file)
  })
}

function loadImageElement(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(photoError('photoErrors.processFailed'))
    image.src = dataUrl
  })
}

export async function buildProfilePhotoDataUrl(file) {
  if (!file || !file.type.startsWith('image/')) {
    throw photoError('photoErrors.invalid')
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE_BYTES) {
    throw photoError('photoErrors.tooBig')
  }

  const sourceDataUrl = await readFileAsDataUrl(file)
  const sourceImage = await loadImageElement(sourceDataUrl)
  const maxSide = Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight, 1)
  const scale = Math.min(1, MAX_PROFILE_PHOTO_EDGE_PX / maxSide)
  const width = Math.max(1, Math.round(sourceImage.naturalWidth * scale))
  const height = Math.max(1, Math.round(sourceImage.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw photoError('photoErrors.processFailed')
  }

  canvas.width = width
  canvas.height = height
  context.drawImage(sourceImage, 0, 0, width, height)

  const normalizedDataUrl = canvas.toDataURL('image/jpeg', 0.86)

  if (normalizedDataUrl.length > MAX_PROFILE_PHOTO_DATA_URL_LENGTH) {
    throw photoError('photoErrors.tooLarge')
  }

  return normalizedDataUrl
}

// In English (or any other locale, which falls back to it) the key's text
// is the message itself, so it comes back unchanged.
export function localizePhotoErrorMessage(message, locale = 'en') {
  const key = PHOTO_ERROR_KEYS.find((candidate) => dialogs.t('en', candidate) === message)

  return key ? dialogs.t(locale, key) : message
}
