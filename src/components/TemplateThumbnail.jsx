import { memo } from 'react'

import CVPreview from './CVPreview'

// memo keeps sibling previews from re-rendering while the user hovers around
// the grid — the trimmed CV (see utils/thumbnailCv.js) is a stable reference
// for the caller's lifetime.
const TemplateThumbnail = memo(function TemplateThumbnail({ templateId, formData, locale }) {
  return (
    <div className="template-gallery__thumb-frame">
      <div className="template-gallery__thumb-page" aria-hidden="true">
        <CVPreview formData={formData} template={templateId} locale={locale} />
      </div>
    </div>
  )
})

export default TemplateThumbnail
