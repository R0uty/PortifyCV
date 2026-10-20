// Pre-rendered template thumbnails (1.6.30): public/thumbnails/<template>/
// <look>-<locale>.webp, made by `npm run thumbnails` from the live
// TemplateThumbnail. The front page and the Free CV Templates grid show
// these images instead of 36 live CVs, which kept the pages heavy (7,000+
// DOM nodes) and full of placeholder CV text. `npm run check:thumbnails`
// fails when a template's code or styles change without regenerating them.

// The cell width the images are rendered at, in CSS px; they're captured
// at 2x, so a ~300px card stays sharp on a high-density screen.
export const THUMBNAIL_CSS_WIDTH = 300
export const THUMBNAIL_PIXEL_RATIO = 2
// .template-gallery__thumb-frame's aspect-ratio (1 / 1.16).
export const THUMBNAIL_WIDTH = THUMBNAIL_CSS_WIDTH * THUMBNAIL_PIXEL_RATIO
export const THUMBNAIL_HEIGHT = Math.round(THUMBNAIL_WIDTH * 1.16)

export function thumbnailImagePath(templateId, variantId = 'default', locale = 'en') {
  return `thumbnails/${templateId}/${variantId}-${locale === 'fi' ? 'fi' : 'en'}.webp`
}

export function thumbnailImageSrc(templateId, variantId = 'default', locale = 'en') {
  return `/${thumbnailImagePath(templateId, variantId, locale)}`
}
