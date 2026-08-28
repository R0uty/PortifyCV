// Single source of truth for per-route <head> metadata (title, description,
// article schema). Shared by src/App.jsx (client-side patching after
// hydration) and worker/index.js (edge-side HTML rewriting for crawlers
// that never run JS) — the two exist to solve the same problem in the two
// places a page's HTML actually gets read, so importing one object into
// both keeps them from drifting apart.
import { ROUTES } from './routes.js'
import { cvTemplates } from './cvTemplates.js'

export const SITE_ORIGIN = 'https://portifycv.app'

// Read off the template registry instead of a hardcoded number in the
// freeTemplates description below — this previously drifted out of sync
// with cvTemplates.js after a template was added without this file being
// updated to match (same issue LandingPage.jsx had).
const TEMPLATE_COUNT = cvTemplates.length

export const VIEW_HEAD = {
  landing: {
    title: 'PortifyCV - CV Builder',
    path: ROUTES.landing,
    description:
      'Build a free CV in minutes. No login, no data saved. Live preview, ATS-friendly mode, and PDF/HTML/JSON export.',
  },
  builder: {
    title: 'PortifyCV - Build Your CV Online',
    path: ROUTES.builder,
    description:
      'Build and edit your CV online for free. Live preview, ATS-friendly mode, and PDF/HTML/JSON export — no login required.',
  },
  privacy: {
    title: 'Privacy Policy - PortifyCV',
    path: ROUTES.privacy,
    description:
      'How PortifyCV handles your data: no server, no account, and what cookies apply if advertising is enabled.',
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
  },
  howToWrite: {
    title: 'How to Write a CV - PortifyCV',
    path: ROUTES.howToWrite,
    description:
      'A practical, structural guide to writing a CV: what sections to include, how to write experience bullets that show impact, and mistakes to avoid.',
    isArticle: true,
    datePublished: '2026-08-20',
  },
  coverLetterExamples: {
    title: 'Cover Letter Examples - PortifyCV',
    path: ROUTES.coverLetterExamples,
    description:
      'Real weak-vs-strong cover letter examples for the opening, experience paragraph, and closing, plus how PortifyCV drafts the first version from your CV.',
    isArticle: true,
    datePublished: '2026-08-20',
  },
  cvSkills: {
    title: 'CV Skills Examples - PortifyCV',
    path: ROUTES.cvSkills,
    description:
      'How to choose, group, and phrase the skills section of your CV, with example groupings and how many skills is actually the right number.',
    isArticle: true,
    datePublished: '2026-08-20',
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
  },
  itCv: {
    title: 'IT CV Examples - PortifyCV',
    path: ROUTES.itCv,
    description:
      'How to write an IT CV: certifications, systems and tools worth naming precisely, and why IT applications need ATS-friendly formatting.',
    isArticle: true,
    datePublished: '2026-08-20',
  },
  cybersecurityCv: {
    title: 'Cybersecurity CV Examples - PortifyCV',
    path: ROUTES.cybersecurityCv,
    description:
      'How to write a cybersecurity CV: certifications, real tools like SIEM platforms, and where a Hack The Box or TryHackMe profile belongs.',
    isArticle: true,
    datePublished: '2026-08-20',
  },
  finnishCv: {
    title: 'Finnish CV Examples - PortifyCV',
    path: ROUTES.finnishCv,
    description:
      'How a Finnish CV differs from international norms: what to leave out, the languages section, and a bilingual example of the same content.',
    isArticle: true,
    datePublished: '2026-08-20',
  },
}

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
