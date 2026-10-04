// Single source of truth for the app's real URL paths, shared between
// App.jsx (which builds VIEW_HEAD/title/description around these) and any
// page component that needs to link to another page — importing App.jsx
// directly from a page it renders would be a circular import.
export const ROUTES = {
  landing: '/',
  builder: '/cv',
  privacy: '/privacy',
  about: '/about',
  freeTemplates: '/free-cv-templates',
  atsGuide: '/ats-friendly-cv-guide',
  howToWrite: '/how-to-write-a-cv',
  howToUse: '/how-to-use-the-cv-builder',
  coverLetterExamples: '/cover-letter-examples',
  cvSkills: '/cv-skills-examples',
  cvExamples: '/cv-examples',
  developerCv: '/developer-cv-examples',
  itCv: '/it-cv-examples',
  cybersecurityCv: '/cybersecurity-cv-examples',
  finnishCv: '/finnish-cv-examples',
}

// Per-template pages (one per cvTemplates entry, keyed by its permanent
// slug). Not in ROUTES because the list is generated from the template
// registry. See pageMeta.js for the matching VIEW_HEAD entries.
export function templatePath(slug) {
  return `${ROUTES.freeTemplates}/${slug}`
}
