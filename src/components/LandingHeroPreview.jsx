import { useMemo } from 'react'

import TemplateThumbnail from './TemplateThumbnail'
import { buildThumbnailCv } from '../utils/thumbnailCv'

// A fanned stack of 3 real, live-rendered templates (same TemplateThumbnail
// the gallery and the marquee below use) — the hero's "picture of the
// result," not a pre-built marketing mockup. Minimalist sits on top and
// dead-center (black-on-white, so it doesn't fight the hero's own
// monochrome type); Developer and Creative peek out behind it specifically
// to show the range — dark/technical and warm/colorful — a single template
// can't.
const STACK_TEMPLATES = [
  { id: 'creative', modifier: 'back-left' },
  { id: 'developer', modifier: 'back-right' },
  { id: 'minimal', modifier: 'front' },
]

function LandingHeroPreview({ locale = 'en', label = '' }) {
  const thumbnailCv = useMemo(() => buildThumbnailCv(), [])

  return (
    <div className="landing-preview__stack" role="img" aria-label={label}>
      {STACK_TEMPLATES.map(({ id, modifier }) => (
        <div key={id} className={`landing-preview__thumb landing-preview__thumb--${modifier}`}>
          <TemplateThumbnail templateId={id} formData={thumbnailCv} locale={locale} />
        </div>
      ))}
    </div>
  )
}

export default LandingHeroPreview
