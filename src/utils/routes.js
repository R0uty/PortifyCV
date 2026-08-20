// Single source of truth for the app's real URL paths, shared between
// App.jsx (which builds VIEW_HEAD/title/description around these) and any
// page component that needs to link to another page — importing App.jsx
// directly from a page it renders would be a circular import.
export const ROUTES = {
  landing: '/',
  builder: '/cv',
  privacy: '/privacy',
  freeTemplates: '/free-cv-templates',
  atsGuide: '/ats-friendly-cv-guide',
  howToWrite: '/how-to-write-a-cv',
}
