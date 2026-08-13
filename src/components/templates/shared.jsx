// Shared utilities, icons, and helpers used by all CV templates.
// Re-exports formatDateRange and formatLinkLabel from the project-wide shared utils.

import { formatDateRange, formatLinkLabel, formatLinkDisplayValue, getSafeHref } from '../../utils/shared'

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
  // Behance "Bē" logo (simplified)
  behance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <path d="M2 6h6a3 3 0 010 6H2z" />
      <path d="M2 12h6.5a3.5 3.5 0 010 7H2z" />
      <path d="M15 8h6M14.5 14.5h7a3.5 3.5 0 00-3.5-4 3.5 3.5 0 00-3.5 4 3.5 3.5 0 003.5 3.5c1.4 0 2.6-.7 3.2-1.8" />
    </svg>
  ),
  // Dribbble basketball-seam logo (simplified)
  dribbble: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <circle cx="12" cy="12" r="10" />
      <path d="M3.5 9c5 1.5 10.5 1.2 15.8-.8M4.7 17c3-4 7-6.3 14.4-6.2M9 3c3 4 4.5 8.7 4.7 18" />
    </svg>
  ),
  // Medium "M" logo (simplified)
  medium: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.38-2.87-3.38-6.42s1.51-6.42 3.38-6.42c1.87 0 3.38 2.87 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.57-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  ),
  // Dev.to "DEV" logo (simplified)
  devto: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 9v6M6 9h1.5a1.5 1.5 0 011.5 1.5v3A1.5 1.5 0 017.5 15H6M12 9v6M12 9h2M12 12h1.6M12 15h2M16 9l1.5 6L19 9" />
    </svg>
  ),
  // Google Scholar mortarboard/cap glyph (simplified)
  scholar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <path d="M2 9l10-5 10 5-10 5-10-5z" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
      <path d="M22 9v6" />
    </svg>
  ),
  // Board profile — briefcase glyph (simplified)
  boardProfile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <rect x="2" y="7" width="20" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M2 12h20" />
    </svg>
  ),
  // Blog — pencil/document glyph (simplified)
  blog: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <path d="M4 4.5A2.5 2.5 0 016.5 2H17l3 3v14.5a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 19.5v-15z" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  ),
  // ResearchGate "RG" logo (simplified)
  researchGate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 16V9.5a2.5 2.5 0 015 0c0 1.4-1.1 2.5-2.5 2.5H9M12 12l3 4" />
    </svg>
  ),
  // Hack The Box — hexagon/cube glyph (simplified)
  hackTheBox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2z" />
      <path d="M12 2v20M4 6.5l8 4.5 8-4.5" />
    </svg>
  ),
  // TryHackMe — terminal/flag glyph (simplified)
  tryHackMe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9l3 2.5L7 14M13 15h4" />
    </svg>
  ),
  // YouTube play-button glyph (simplified)
  youtube: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-gray-400">
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" />
    </svg>
  ),
}

// Monochrome outline glyphs used inside the small circular section icon (opt-in via
// template config's `showSectionIcons` flag). Each glyph is a plain stroke icon sized
// to fill a ~12x12 box so it centers cleanly inside a circular badge.
const sectionIcons = {
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  ),
  experience: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  education: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="M2 9l10-5 10 5-10 5-10-5z" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
    </svg>
  ),
  skills: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12" />
    </svg>
  ),
  links: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="M9 15l6-6" />
      <path d="M10 6l1-1a4 4 0 015.5 5.8L15 12" />
      <path d="M14 18l-1 1a4 4 0 01-5.5-5.8L9 12" />
    </svg>
  ),
  coreStrengths: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9.5 12l1.8 1.8L15 10" />
    </svg>
  ),
  certificates: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="M6 3h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="M3 7a1 1 0 011-1h4l2 2h10a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" />
    </svg>
  ),
  languages: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>
  ),
  interests: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="M12 3l2.2 5.6L20 10l-4.4 3.8L17 20l-5-3.2L7 20l1.4-6.2L4 10l5.8-1.4L12 3z" />
    </svg>
  ),
  achievements: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="M8 21h8M12 17v4M6 4h12v3a6 6 0 01-12 0V4z" />
      <path d="M6 5H3v2a3 3 0 003 3M18 5h3v2a3 3 0 01-3 3" />
    </svg>
  ),
  openSource: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
      <path d="M6 8.5V15.5M8.3 7.2L15.7 10.8M8.3 16.8L15.7 13.2" />
    </svg>
  ),
  publications: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="M4 4.5A2.5 2.5 0 016.5 2H20v17H6.5A2.5 2.5 0 004 21.5v-17z" />
      <path d="M4 19a2.5 2.5 0 012.5-2.5H20" />
    </svg>
  ),
  leadership: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 21c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />
      <path d="M12 3.5V2M8.5 4.2l-.7-1M15.5 4.2l.7-1" />
    </svg>
  ),
  memberships: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M3 20c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5M11 20c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" />
    </svg>
  ),
  speaking: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0014 0M12 18v4M9 22h6" />
    </svg>
  ),
  volunteering: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="M12 21s-7-4.4-9.5-8.6C.7 8.8 2.4 5 6 5c2 0 3.3 1 4 2 .7-1 2-2 4-2 3.6 0 5.3 3.8 3.5 7.4C19 16.6 12 21 12 21z" />
    </svg>
  ),
  caseStudies: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21M8 11h6M11 8v6" />
    </svg>
  ),
  testimonials: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="M7 15H5a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v4c0 3-1.5 5-4 6" />
      <path d="M17 15h-2a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v4c0 3-1.5 5-4 6" />
    </svg>
  ),
}

// Icons for the header's personal contact line (email, phone, location) — kept
// separate from `devIcons` (which is for the Links section: GitHub/LinkedIn/etc).
const contactIcons = {
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A16 16 0 015 5a2 2 0 010-1z" />
    </svg>
  ),
  location: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
      <path d="M12 21s-7-6.1-7-11a7 7 0 0114 0c0 4.9-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
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

  // Convert the categories object into a sorted array of { key, label, items } pairs
  return Object.entries(categories).map(([key, items]) => ({
    key,
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
  contactIcons,        // Icons for the header personal contact line (email/phone/location)
  sectionIcons,        // Monochrome glyphs for the circular section icon badge
  parseSkillCategories, // Skill categorization function
  previewSectionTitleClasses, // Base CSS for section titles
  renderSectionCard,   // Section wrapper component
  formatDateRange,     // Re-exported from utils/shared
  formatLinkLabel,     // Re-exported from utils/shared
  formatLinkDisplayValue, // Re-exported from utils/shared
  getSafeHref,         // Re-exported from utils/shared
}
