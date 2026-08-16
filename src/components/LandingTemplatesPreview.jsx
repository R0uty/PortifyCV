import { useMemo } from 'react'

import TemplateThumbnail from './TemplateThumbnail'
import { buildThumbnailCv } from '../utils/thumbnailCv'
import { getCvTemplates } from '../utils/cvTemplates'

// A quick visual look at every template, right on the landing page — the
// same real, scaled CVPreview thumbnails the in-builder template gallery
// uses (via the shared TemplateThumbnail), filled with the demo CV since
// there's no in-progress CV to show yet at this point in the flow.
function LandingTemplatesPreview({ locale = 'en' }) {
  const templates = useMemo(() => getCvTemplates(locale), [locale])
  const thumbnailCv = useMemo(() => buildThumbnailCv(), [])
  // Duplicated so the track can scroll a full pass and loop back to an
  // identical second copy — the seam is invisible mid-scroll.
  const marqueeTemplates = useMemo(() => [...templates, ...templates], [templates])

  return (
    <div className="landing-templates-marquee">
      <div className="landing-templates-track">
        {marqueeTemplates.map((template, index) => (
          <div key={`${template.id}-${index}`} className="landing-templates-card">
            <div className="landing-templates-card__thumb">
              <TemplateThumbnail templateId={template.id} formData={thumbnailCv} locale={locale} />
            </div>
            <p className="landing-templates-card__name">{template.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LandingTemplatesPreview
