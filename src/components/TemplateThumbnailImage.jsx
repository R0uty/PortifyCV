import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH, thumbnailImageSrc } from '../utils/thumbnailImages'

// A template thumbnail as its pre-rendered image (1.6.30), in the same
// frame the live TemplateThumbnail uses, so cards keep their size, border
// and A4 crop. For the marketing pages; the builder's gallery shows the
// user's own CV and stays live.
function TemplateThumbnailImage({
  templateId,
  styleVariantId = 'default',
  locale = 'en',
  alt = '',
  loading = 'lazy',
  fetchPriority,
}) {
  return (
    <div className="template-gallery__thumb-frame">
      <img
        className="template-gallery__thumb-image"
        src={thumbnailImageSrc(templateId, styleVariantId, locale)}
        width={THUMBNAIL_WIDTH}
        height={THUMBNAIL_HEIGHT}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
      />
    </div>
  )
}

export default TemplateThumbnailImage
