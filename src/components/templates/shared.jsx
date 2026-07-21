// Shared utilities, icons, and helpers used by all CV templates.
// Re-exports formatDateRange and formatLinkLabel from the project-wide shared utils.

import { formatDateRange, formatLinkLabel } from '../../utils/shared'

// Base CSS classes for section title text — tiny, uppercase, wide letter-spacing.
// Individual templates override the color via their sectionTitle() config method.
const previewSectionTitleClasses = 'text-xs font-semibold uppercase tracking-[0.24em]'

// SVG icon components for each supported link type.
// Used in header contact lines and sidebar link lists.
// Each icon is sized at 3.5x3.5 (h-3.5 w-3.5) with gray-400 default color.
const devIcons = {
  // GitHub octocat logo
  github: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  ),
  // LinkedIn "in" logo
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  // Portfolio / folder icon (stroke-based)
  portfolio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  // Website / globe icon (stroke-based)
  website: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
}

// Groups an array of skill strings into categorized buckets using regex pattern matching.
// Returns an array of { label, items } objects sorted by category definition order.
// Supports Finnish and English category labels and matching patterns.
// Skills that don't match any pattern fall into the "Other" bucket.
function parseSkillCategories(skills, isFinnish) {
  // Accumulator object — keys are category names, values are arrays of matching skill strings
  const categories = {}

  // Regex patterns for each skill category, with Finnish and English variants.
  // The first matching pattern determines the category assignment.
  const categoryPatterns = isFinnish
    ? { languages: /kiel|ohjelmointikiel|programming/i, frameworks: /framework|kehyk|library|kirjasto/i, databases: /tietokanta|database|db|sql/i, cloud: /pilvi|cloud|aws|azure|gcp/i, devops: /devops|ci\/cd|docker|kubernetes|k8s|jenkins|pipeline/i, security: /turva|security|tietoturva/i }
    : { languages: /language|programming|lang/i, frameworks: /framework|library/i, databases: /database|db|sql/i, cloud: /cloud|aws|azure|gcp/i, devops: /devops|ci\/cd|docker|kubernetes|k8s|jenkins|pipeline/i, security: /security/i }

  // Iterate each skill and test against category patterns in order
  for (const skill of skills) {
    let placed = false
    for (const [, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(skill)) {
        // Find the key name for this pattern to use as the category bucket
        const catKey = Object.keys(categoryPatterns).find(k => categoryPatterns[k] === pattern)
        if (!categories[catKey]) categories[catKey] = []
        categories[catKey].push(skill)
        placed = true
        break
      }
    }
    // If no pattern matched, place in the "other" catch-all bucket
    if (!placed) {
      if (!categories.other) categories.other = []
      categories.other.push(skill)
    }
  }

  // Human-readable labels for each category key, with Finnish translations
  const categoryLabels = isFinnish
    ? { languages: 'Kielet', frameworks: 'Kehykset', databases: 'Tietokannat', cloud: 'Pilvi', devops: 'DevOps', security: 'Turvallisuus', other: 'Muut' }
    : { languages: 'Languages', frameworks: 'Frameworks', databases: 'Databases', cloud: 'Cloud', devops: 'DevOps', security: 'Security', other: 'Other' }

  // Convert the categories object into a sorted array of { label, items } pairs
  return Object.entries(categories).map(([key, items]) => ({
    label: categoryLabels[key] || key,
    items,
  }))
}

// Renders a <section> wrapper element with data-export attributes for PDF/ATS export.
// Used by all section renderers (about, experience, education, skills, links).
function renderSectionCard({ section, placement, children, classes }) {
  return (
    <section
      key={section}
      className={classes}
      data-export-section={section}
      data-export-placement={placement}
    >
      {children}
    </section>
  )
}

// Export all shared utilities for use by CVPreview.jsx and template configs
export {
  devIcons,            // SVG icon components for link types
  parseSkillCategories, // Skill categorization function
  previewSectionTitleClasses, // Base CSS for section titles
  renderSectionCard,   // Section wrapper component
  formatDateRange,     // Re-exported from utils/shared
  formatLinkLabel,     // Re-exported from utils/shared
}
