// Renders every template × look as the live TemplateThumbnail the site
// used before 1.6.30, one fixed-size cell each, for
// scripts/generate-thumbnails.mjs to screenshot. ?locale=fi for Finnish
// section titles. Dev-only (served by `vite`, never built).
/* eslint-disable react-refresh/only-export-components -- a one-off render
   page with no module consumers, so fast refresh has nothing to keep. */
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '../../src/index.css'
import TemplateThumbnail from '../../src/components/TemplateThumbnail'
import { cvTemplates } from '../../src/utils/cvTemplates'
import { getTemplateVariants, getVariantLook } from '../../src/utils/templateVariants'
import { buildThumbnailCv } from '../../src/utils/thumbnailCv'
import { THUMBNAIL_CSS_WIDTH } from '../../src/utils/thumbnailImages'

const locale = new URLSearchParams(window.location.search).get('locale') === 'fi' ? 'fi' : 'en'
const thumbnailCv = buildThumbnailCv()

function Harness() {
  useEffect(() => {
    // Fonts first (looks use their own), then two frames for the
    // ResizeObserver-driven scale to settle.
    document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      window.__thumbnailsReady = true
    })))
  }, [])

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 16, background: '#ffffff' }}>
      {cvTemplates.flatMap((template) => getTemplateVariants(template.id).map((variant) => (
        <div
          key={`${template.id}/${variant.id}`}
          data-thumb={`${template.id}/${variant.id}`}
          className="thumbnail-harness__cell"
          style={{ width: THUMBNAIL_CSS_WIDTH }}
        >
          <TemplateThumbnail
            templateId={template.id}
            formData={thumbnailCv}
            locale={locale}
            {...getVariantLook(template.id, variant.id)}
          />
        </div>
      )))}
      <style>{'.thumbnail-harness__cell .template-gallery__thumb-frame { border: 0; border-radius: 0; }'}</style>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Harness />
  </StrictMode>,
)
