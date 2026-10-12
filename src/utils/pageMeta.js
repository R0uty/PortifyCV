// Single source of truth for per-route <head> metadata (title, description,
// article schema). Shared by src/App.jsx (client-side patching after
// hydration) and worker/index.js (edge-side HTML rewriting for crawlers
// that never run JS) — the two exist to solve the same problem in the two
// places a page's HTML actually gets read, so importing one object into
// both keeps them from drifting apart.
import { ROUTES, templatePath } from './routes.js'
import { cvTemplates, getTemplateSlug } from './cvTemplates.js'
import { TEMPLATE_META_DESCRIPTIONS } from './templateMetaDescriptions.js'

export const SITE_ORIGIN = 'https://portifycv.app'

// Read off the template registry instead of a hardcoded number in the
// freeTemplates description below — this previously drifted out of sync
// with cvTemplates.js after a template was added without this file being
// updated to match (same issue LandingPage.jsx had).
const TEMPLATE_COUNT = cvTemplates.length

const STATIC_VIEW_HEAD = {
  landing: {
    title: 'PortifyCV - CV Builder',
    path: ROUTES.landing,
    description:
      'Build a free CV in minutes. No login, no data saved. Live preview, ATS-friendly mode, and PDF/Word/HTML/JSON export.',
  },
  builder: {
    title: 'PortifyCV - Build Your CV Online',
    path: ROUTES.builder,
    description:
      'Build and edit your CV online for free. Live preview, ATS-friendly mode, and PDF/Word/HTML/JSON export — no login required.',
  },
  privacy: {
    title: 'Privacy Policy - PortifyCV',
    path: ROUTES.privacy,
    description:
      'How PortifyCV handles your data: no server, no account, and what cookies apply if advertising is enabled.',
  },
  about: {
    title: 'About PortifyCV',
    path: ROUTES.about,
    description:
      'What PortifyCV is, how it works, who makes it, how it is funded, and how to get in touch.',
  },
  freeTemplates: {
    title: 'Free CV Templates - PortifyCV',
    path: ROUTES.freeTemplates,
    description:
      `${TEMPLATE_COUNT} free CV templates, no watermark and no account required. Preview each one with your own content and swap between them any time.`,
  },
  atsGuide: {
    title: 'ATS-Friendly CV Guide - PortifyCV',
    path: ROUTES.atsGuide,
    description:
      'How applicant tracking systems actually read a CV, the formatting mistakes that break parsing, and how to check your own CV against real keyword scoring.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-12',
  },
  howToWrite: {
    title: 'How to Write a CV - PortifyCV',
    path: ROUTES.howToWrite,
    description:
      'A practical, structural guide to writing a CV: what sections to include, how to write experience bullets that show impact, and mistakes to avoid.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-08-29',
  },
  howToUse: {
    title: 'How to Use the CV Builder - PortifyCV',
    path: ROUTES.howToUse,
    description:
      'A step-by-step walkthrough of PortifyCV: editing right on the CV, the Classic form, templates and looks, ATS keyword checks, and exporting or sharing your CV.',
    isArticle: true,
    datePublished: '2026-09-01',
    dateModified: '2026-10-12',
  },
  coverLetterExamples: {
    title: 'Cover Letter Examples - PortifyCV',
    path: ROUTES.coverLetterExamples,
    description:
      'Real weak-vs-strong cover letter examples for the opening, experience paragraph, and closing, plus how PortifyCV drafts the first version from your CV.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-06',
  },
  cvSkills: {
    title: 'CV Skills Examples - PortifyCV',
    path: ROUTES.cvSkills,
    description:
      'How to choose, group, and phrase the skills section of your CV, with example groupings and how many skills is actually the right number.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-08-21',
  },
  cvExamples: {
    title: 'CV Examples by Field - PortifyCV',
    path: ROUTES.cvExamples,
    description:
      'CV examples by field: developer, IT, cybersecurity, and Finnish CVs, each with real weak-vs-strong bullet examples and field-specific advice.',
  },
  developerCv: {
    title: 'Developer CV Examples - PortifyCV',
    path: ROUTES.developerCv,
    description:
      'How to write a developer CV: project entries, experience bullets that show impact, and skills that read as technical rather than generic.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-12',
  },
  itCv: {
    title: 'IT CV Examples - PortifyCV',
    path: ROUTES.itCv,
    description:
      'How to write an IT CV: certifications, systems and tools worth naming precisely, and why IT applications need ATS-friendly formatting.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-11',
  },
  cybersecurityCv: {
    title: 'Cybersecurity CV Examples - PortifyCV',
    path: ROUTES.cybersecurityCv,
    description:
      'How to write a cybersecurity CV: certifications, real tools like SIEM platforms, and where a Hack The Box or TryHackMe profile belongs.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-12',
  },
  finnishCv: {
    title: 'Finnish CV Examples - PortifyCV',
    path: ROUTES.finnishCv,
    description:
      'How a Finnish CV differs from international norms: what to leave out, the languages section, and a bilingual example of the same content.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-12',
  },
}

// View key prefix for the per-template pages: `template:developer` etc.
// App.jsx maps every key with this prefix onto TemplateDetailPage.
export const TEMPLATE_VIEW_PREFIX = 'template:'

// A link to one template's page, for InternalNavLink + onNavigateToView:
// `{ to, view, search }`. `example` opens it on that example CV (the page
// reads ?example=; an id it doesn't list falls back to its default).
export function templatePageLink(templateId, { example } = {}) {
  const search = example ? `?example=${encodeURIComponent(example)}` : ''
  return {
    to: `${templatePath(getTemplateSlug(templateId))}${search}`,
    view: `${TEMPLATE_VIEW_PREFIX}${templateId}`,
    search,
  }
}

// One entry per template, generated from the registry so a new template
// gets its page, metadata, worker routing, and 404/redirect handling just
// by being added to cvTemplates.js (plus its copy in
// templateMetaDescriptions.js and templatePageCopy.js, which
// check:template-pages enforces).
const TEMPLATE_VIEW_HEAD = Object.fromEntries(
  cvTemplates.map((template) => [
    `${TEMPLATE_VIEW_PREFIX}${template.id}`,
    {
      title: `${template.label} CV Template - Free, No Login - PortifyCV`,
      path: templatePath(template.slug),
      description: TEMPLATE_META_DESCRIPTIONS[template.id] ?? template.description,
      templateId: template.id,
      schema: 'template',
    },
  ]),
)

export const VIEW_HEAD = { ...STATIC_VIEW_HEAD, ...TEMPLATE_VIEW_HEAD }

// Article schema for guide-type pages (VIEW_HEAD entries with isArticle:
// true) — index.html's own two JSON-LD blocks (SoftwareApplication, FAQPage)
// describe the app itself and stay static across every route; this is the
// per-page equivalent for the guide pages.
export function buildArticleSchema(head) {
  const url = `${SITE_ORIGIN}${head.path}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: head.title.replace(/ - PortifyCV$/, ''),
    description: head.description,
    url,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'PortifyCV', url: SITE_ORIGIN },
    publisher: { '@type': 'Organization', name: 'PortifyCV', url: SITE_ORIGIN },
    datePublished: head.datePublished,
    dateModified: head.dateModified ?? head.datePublished,
  }
}

// BreadcrumbList for a per-template page: Home › Free CV templates › <Label>.
// The template pages aren't articles, so they don't get Article schema.
export function buildTemplatePageSchema(head) {
  const crumbs = [
    { name: 'PortifyCV', path: ROUTES.landing },
    { name: 'Free CV templates', path: ROUTES.freeTemplates },
    { name: head.title.replace(/ CV Template - .*$/, ''), path: head.path },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_ORIGIN}${crumb.path}`,
    })),
  }
}

// The per-view JSON-LD block, or null when a view has none. Shared by
// App.jsx (client) and worker/index.js (edge), like VIEW_HEAD itself.
export function buildViewSchema(head) {
  if (head.isArticle) return buildArticleSchema(head)
  if (head.schema === 'template') return buildTemplatePageSchema(head)
  return null
}
