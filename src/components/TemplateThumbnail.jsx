import { memo, useEffect, useRef, useState } from 'react'

import CVPreview from './CVPreview'

// Matches .template-gallery__thumb-page's fixed width in app-shell.css —
// the live CVPreview renders at this width, then gets scaled down to fit
// whatever frame it's dropped into (see the comment above that rule for why
// scaling, not reflowing, is what keeps each template's real proportions).
const THUMBNAIL_NATIVE_WIDTH = 780

// memo keeps sibling previews from re-rendering while the user hovers around
// the grid — the trimmed CV (see utils/thumbnailCv.js) is a stable reference
// for the caller's lifetime.
const TemplateThumbnail = memo(function TemplateThumbnail({ templateId, formData, locale, fontStack, headingColor }) {
  const frameRef = useRef(null)
  // Falls back to the CSS default (0.29, tuned for the gallery modal's own
  // card size — see .template-gallery__thumb-page) until the very first
  // ResizeObserver callback fires, which happens well before paint in
  // practice. Callers with a differently sized frame (the toolbar's
  // TemplateQuickSwitcher, the landing page marquee) get measured and
  // corrected instead of inheriting a scale tuned for a wider card, which
  // used to clip most of the thumbnail off-frame.
  const [scale, setScale] = useState(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) {
      return undefined
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) {
        setScale(width / THUMBNAIL_NATIVE_WIDTH)
      }
    })
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="template-gallery__thumb-frame" ref={frameRef}>
      <div
        className="template-gallery__thumb-page"
        aria-hidden="true"
        style={{
          ...(scale ? { transform: `scale(${scale})` } : null),
          // Shadows --font-sans for this thumbnail only — see the identical
          // override on ResumeBuilderPage's preview-zoom-wrapper for why this
          // is enough to change every template's body font without touching
          // each template's stylesheet. Callers with no chosen font (the
          // static landing/marketing pages) just leave this unset and get
          // the app default.
          ...(fontStack ? { '--font-sans': fontStack } : null),
        }}
      >
        <CVPreview formData={formData} template={templateId} locale={locale} headingColor={headingColor} />
      </div>
    </div>
  )
})

export default TemplateThumbnail
