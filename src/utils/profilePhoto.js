// Image upload pipeline shared by Classic mode (CVForm.jsx — profile
// photo *and* project images) and the Direct Edit section popup
// (SectionEditorPopup.jsx). Extracted here rather than duplicated: the
// pipeline does MIME validation, a 2MB source check, a canvas resize to
// 480px, a JPEG re-encode and a post-encode 450KB ceiling, and a second
// copy would drift until one surface accepted images the other rejects.

export const MAX_PROFILE_PHOTO_SIZE_BYTES = 2 * 1024 * 1024
export const MAX_PROFILE_PHOTO_EDGE_PX = 480
export const MAX_PROFILE_PHOTO_DATA_URL_LENGTH = 450_000

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read the selected image file.'))
    reader.readAsDataURL(file)
  })
}

function loadImageElement(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not process the selected image file.'))
    image.src = dataUrl
  })
}

export async function buildProfilePhotoDataUrl(file) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Select a valid image file.')
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE_BYTES) {
    throw new Error('Image must be 2MB or smaller.')
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
    throw new Error('Could not process the selected image file.')
  }

  canvas.width = width
  canvas.height = height
  context.drawImage(sourceImage, 0, 0, width, height)

  const normalizedDataUrl = canvas.toDataURL('image/jpeg', 0.86)

  if (normalizedDataUrl.length > MAX_PROFILE_PHOTO_DATA_URL_LENGTH) {
    throw new Error('Image is too large after processing. Try a smaller image.')
  }

  return normalizedDataUrl
}

export function localizePhotoErrorMessage(message, locale = 'en') {
  if (locale !== 'fi') {
    return message
  }

  const map = {
    'Could not read the selected image file.': 'Valittua kuvatiedostoa ei voitu lukea.',
    'Could not process the selected image file.': 'Valittua kuvatiedostoa ei voitu käsitellä.',
    'Select a valid image file.': 'Valitse kelvollinen kuvatiedosto.',
    'Image must be 2MB or smaller.': 'Kuvan on oltava enintään 2 Mt.',
    'Image is too large after processing. Try a smaller image.': 'Kuva on käsittelyn jälkeen liian suuri. Kokeile pienempää kuvaa.',
  }

  return map[message] ?? message
}
