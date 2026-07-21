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
}

// Returns the template config for a given variant string.
// Falls back to 'minimal' if the variant is not found (defensive default).
export function getTemplateConfig(variant) {
  return templates[variant] || templates.minimal
}

// Export the full map for cases where iteration over all templates is needed
export default templates
