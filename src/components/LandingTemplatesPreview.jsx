import { useMemo, useState } from 'react'
import { Pause, Play } from 'lucide-react'

import TemplateThumbnail from './TemplateThumbnail'
import { buildThumbnailCv } from '../utils/thumbnailCv'
import { getCvTemplates } from '../utils/cvTemplates'
import { cvFontNeedsDownload } from '../utils/cvFonts'
import { getTemplateVariants, getVariantLook } from '../utils/templateVariants'

// A quick visual look at every template, right on the landing page — the
// same real, scaled CVPreview thumbnails the in-builder template gallery
// uses (via the shared TemplateThumbnail), filled with the demo CV since
// there's no in-progress CV to show yet at this point in the flow.
//
// To show that templates come in several looks, card n (gallery order)
// renders its template's look n mod 3 and names it under the template
// name. A rule, not a hand-picked list, so a new template is covered; the
// loop copy repeats the same looks, so the seam stays invisible. A look
// whose font is a download (Calibri, Lato) gives way to the next look in
// the rotation (1.6.18), so the landing page never fetches ~90 KB of font
// for one small thumbnail.
//
// The loop copy is aria-hidden: screen readers get each card once.
//
// The track auto-scrolls (CSS animation, paused on :hover) and loops
// forever — hover only helps a mouse user who happens to be pointed at it,
// so this button gives every input method (touch, keyboard-adjacent mouse
// users, anyone who wants it still) an explicit, persistent way to stop it.
function pickStripLook(variants, index) {
  for (let step = 0; step < variants.length; step += 1) {
    const look = variants[(index + step) % variants.length]
    if (!cvFontNeedsDownload(look.fontId)) {
      return look
    }
  }
  return variants[0]
}

function LandingTemplatesPreview({ locale = 'en' }) {
  const [isPaused, setIsPaused] = useState(false)
  const templates = useMemo(() => getCvTemplates(locale).map((template, index) => {
    const variants = getTemplateVariants(template.id)
    return { ...template, look: pickStripLook(variants, index) }
  }), [locale])
  const thumbnailCv = useMemo(() => buildThumbnailCv(), [])
  // Duplicated so the track can scroll a full pass and loop back to an
  // identical second copy — the seam is invisible mid-scroll.
  const marqueeTemplates = useMemo(() => [...templates, ...templates], [templates])
  const toggleLabel = locale === 'fi'
    ? (isPaused ? 'Jatka vieritystä' : 'Pysäytä vieritys')
    : (isPaused ? 'Resume scrolling' : 'Pause scrolling')

  return (
    <div className="landing-templates-wrap">
      <div className="landing-templates-toolbar">
        <button
          type="button"
          className="landing-templates-marquee__toggle"
          onClick={() => setIsPaused((prev) => !prev)}
          aria-pressed={isPaused}
          aria-label={toggleLabel}
          title={toggleLabel}
        >
          {isPaused ? (
            <Play size={14} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Pause size={14} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>
      <div className="landing-templates-marquee">
        <div className={`landing-templates-track${isPaused ? ' landing-templates-track--paused' : ''}`}>
          {marqueeTemplates.map((template, index) => (
            <div
              key={`${template.id}-${index}`}
              className="landing-templates-card"
              aria-hidden={index >= templates.length ? 'true' : undefined}
            >
              <div className="landing-templates-card__thumb">
                <TemplateThumbnail
                  templateId={template.id}
                  formData={thumbnailCv}
                  locale={locale}
                  {...getVariantLook(template.id, template.look.id)}
                />
              </div>
              <p className="landing-templates-card__name">{template.label}</p>
              <p className="landing-templates-card__look">
                {template.look.label[locale === 'fi' ? 'fi' : 'en']}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LandingTemplatesPreview
