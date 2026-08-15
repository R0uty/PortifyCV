// Template registry — imports all template config objects and provides a lookup function.
// Each template config defines CSS class getters, layout flags, and rendering options
// for a specific CV template variant. The registry maps variant names to their configs.

import minimal from './minimal'
import developer from './developer'
import creative from './creative'
import executive from './executive'
import timeline from './timeline'
import modern from './modern'
import graduate from './graduate'
import compact from './compact'
import portfolio from './portfolio'
import techExec from './techExec'
import classicProfessional from './classicProfessional'
import navyProfessional from './navyProfessional'

// Map of variant name → template config object
const templates = {
  minimal,
  developer,
  creative,
  executive,
  timeline,
  modern,
  graduate,
  compact,
  portfolio,
  techExec,
  classicProfessional,
  navyProfessional,
}

// Returns the template config for a given variant string.
// Falls back to 'minimal' if the variant is not found (defensive default).
export function getTemplateConfig(variant) {
  return templates[variant] || templates.minimal
}

let showcasesPrefetched = false

/**
 * Warms every bespoke *Showcase.jsx chunk (CVPreview.jsx lazy-loads them
 * per template) so switching templates or opening the gallery — which
 * renders all 12 at once as thumbnails — doesn't pay for 10 dynamic imports
 * at that moment. Safe to call speculatively: it only downloads and
 * evaluates the modules, same pattern as prefetchPdfExportAssets in
 * exporters.js.
 */
export function prefetchTemplateShowcases() {
  if (showcasesPrefetched) {
    return
  }

  showcasesPrefetched = true

  // Literal specifiers (not a templated/looped path) so bundlers can
  // statically analyze each one and reuse the same chunk React.lazy()
  // requests in CVPreview.jsx, instead of a separate duplicate chunk.
  import('./DeveloperShowcase')
  import('./CreativeShowcase')
  import('./ModernShowcase')
  import('./ExecutiveShowcase')
  import('./TimelineShowcase')
  import('./GraduateShowcase')
  import('./CompactShowcase')
  import('./PortfolioShowcase')
  import('./ClassicProfessionalShowcase')
  import('./NavyProfessionalShowcase')
}

// Export the full map for cases where iteration over all templates is needed
export default templates
