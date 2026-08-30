import { useMemo } from 'react'

import TemplateThumbnail from './TemplateThumbnail'
import { buildThumbnailCv } from '../utils/thumbnailCv'

// The hero's "picture of the result" — a real, live-rendered Minimalist
// template (same TemplateThumbnail the gallery and the marquee below use),
// not a pre-built marketing mockup. Minimalist specifically: black-on-white,
// no accent color, so it sits next to the hero's own monochrome type without
// fighting it the way a colorful bespoke template would.
function LandingHeroPreview({ locale = 'en', label = '' }) {
  const thumbnailCv = useMemo(() => buildThumbnailCv(), [])

  return (
    <div className="landing-preview__thumb" role="img" aria-label={label}>
      <TemplateThumbnail templateId="minimalist" formData={thumbnailCv} locale={locale} />
    </div>
  )
}

export default LandingHeroPreview
