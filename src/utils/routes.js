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

// The Finnish pages (1.6.35): the same content at its own address, so
// search engines can find and rank it. The address decides the language
// (/fi/… is Finnish, everything else English). Permanent once shipped,
// like every path here. The builder has no Finnish path: /cv is the app,
// in whichever language the visitor last used.
export const ROUTES_FI = {
  landing: '/fi',
  privacy: '/fi/tietosuoja',
  about: '/fi/tietoa',
  freeTemplates: '/fi/ilmaiset-cv-pohjat',
  atsGuide: '/fi/ats-ystavallinen-cv',
  howToWrite: '/fi/nain-kirjoitat-cvn',
  howToUse: '/fi/cv-editorin-kayttoopas',
  coverLetterExamples: '/fi/hakemuskirje-esimerkit',
  cvSkills: '/fi/cv-taidot-esimerkit',
  cvExamples: '/fi/cv-esimerkit',
  developerCv: '/fi/kehittajan-cv-esimerkit',
  itCv: '/fi/it-alan-cv-esimerkit',
  cybersecurityCv: '/fi/tietoturva-alan-cv-esimerkit',
  finnishCv: '/fi/suomalainen-cv',
}

// Per-template pages (one per cvTemplates entry, keyed by its permanent
// slug, the same in both languages). Not in ROUTES because the list is
// generated from the template registry. See pageMeta.js for the matching
// VIEW_HEAD entries.
export function templatePath(slug, locale = 'en') {
  return `${locale === 'fi' ? ROUTES_FI.freeTemplates : ROUTES.freeTemplates}/${slug}`
}

const EN_TO_FI = new Map(Object.entries(ROUTES_FI).map(([view, path]) => [ROUTES[view], path]))
const FI_TO_EN = new Map(Object.entries(ROUTES_FI).map(([view, path]) => [path, ROUTES[view]]))

// The same page's address in `locale`, given either language's address
// (with or without a ?query or #hash, which are kept). Addresses with no
// Finnish counterpart (the builder, outside links) come back unchanged.
export function localizePath(path, locale) {
  if (typeof path !== 'string' || !path.startsWith('/')) {
    return path
  }
  const cut = path.search(/[?#]/)
  const pathname = cut === -1 ? path : path.slice(0, cut)
  const rest = cut === -1 ? '' : path.slice(cut)
  const enTemplatePrefix = `${ROUTES.freeTemplates}/`
  const fiTemplatePrefix = `${ROUTES_FI.freeTemplates}/`

  let english = FI_TO_EN.get(pathname) ?? pathname
  if (pathname.startsWith(fiTemplatePrefix)) {
    english = `${enTemplatePrefix}${pathname.slice(fiTemplatePrefix.length)}`
  }
  if (locale !== 'fi') {
    return `${english}${rest}`
  }
  if (english.startsWith(enTemplatePrefix)) {
    return `${fiTemplatePrefix}${english.slice(enTemplatePrefix.length)}${rest}`
  }
  // The front page's FAQ anchor: "/#faq" becomes "/fi#faq".
  return `${EN_TO_FI.get(english) ?? english}${rest}`
}

// The language an address is in: 'fi' under /fi, otherwise 'en'.
export function pathLocale(pathname) {
  return pathname === ROUTES_FI.landing || pathname.startsWith(`${ROUTES_FI.landing}/`) ? 'fi' : 'en'
}
