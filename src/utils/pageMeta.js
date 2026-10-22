// Single source of truth for per-route <head> metadata (title, description,
// article schema). Shared by src/App.jsx (client-side patching after
// hydration) and worker/index.js (edge-side HTML rewriting for crawlers
// that never run JS) — the two exist to solve the same problem in the two
// places a page's HTML actually gets read, so importing one object into
// both keeps them from drifting apart.
import { ROUTES, ROUTES_FI, templatePath } from './routes.js'
import { cvTemplates, getCvTemplate, getTemplateSlug } from './cvTemplates.js'
import { TEMPLATE_META_DESCRIPTIONS } from './templateMetaDescriptions.js'
import { TEMPLATE_META_DESCRIPTIONS_FI } from './templateMetaDescriptionsFi.js'

export const SITE_ORIGIN = 'https://portifycv.app'

// Read off the template registry instead of a hardcoded number in the
// freeTemplates description below — this previously drifted out of sync
// with cvTemplates.js after a template was added without this file being
// updated to match (same issue LandingPage.jsx had).
const TEMPLATE_COUNT = cvTemplates.length

const STATIC_VIEW_HEAD = {
  landing: {
    title: 'Free CV Builder, No Sign-Up - PortifyCV',
    path: ROUTES.landing,
    pathFi: ROUTES_FI.landing,
    titleFi: 'Ilmainen CV-työkalu ilman kirjautumista - PortifyCV',
    descriptionFi:
      'Tee CV ilmaiseksi muutamassa minuutissa. Ei kirjautumista, mitään ei tallenneta. 18 pohjaa, ATS-näkymä sekä vienti PDF-, Word-, HTML- ja JSON-muotoon.',
    description:
      'Build a free CV in minutes. No login, no data saved. Live preview, ATS-friendly mode, and PDF/Word/HTML/JSON export.',
  },
  builder: {
    title: 'PortifyCV - Build Your CV Online',
    path: ROUTES.builder,
    titleFi: 'Tee CV verkossa ilmaiseksi - PortifyCV',
    descriptionFi:
      'Muokkaa CV:tä suoraan sivulla, valitse pohja ja vie se PDF- tai Word-tiedostoksi. Ilmainen, ei kirjautumista.',
    description:
      'Build and edit your CV online for free. Live preview, ATS-friendly mode, and PDF/Word/HTML/JSON export — no login required.',
  },
  privacy: {
    title: 'Privacy Policy - PortifyCV',
    path: ROUTES.privacy,
    pathFi: ROUTES_FI.privacy,
    titleFi: 'Tietosuojaseloste - PortifyCV',
    descriptionFi:
      'Miten PortifyCV käsittelee tietojasi: ei palvelinta, ei tiliä, ja mitä evästeitä mainonta käyttää.',
    description:
      'How PortifyCV handles your data: no server, no account, and what cookies apply if advertising is enabled.',
  },
  about: {
    title: 'About PortifyCV',
    path: ROUTES.about,
    pathFi: ROUTES_FI.about,
    titleFi: 'Tietoa PortifyCV:stä',
    descriptionFi:
      'Mikä PortifyCV on, miten se toimii, kuka sen tekee, miten se rahoitetaan ja miten saat yhteyden.',
    description:
      'What PortifyCV is, how it works, who makes it, how it is funded, and how to get in touch.',
  },
  freeTemplates: {
    title: 'Free CV Templates - PortifyCV',
    path: ROUTES.freeTemplates,
    pathFi: ROUTES_FI.freeTemplates,
    titleFi: 'Ilmaiset CV-pohjat - PortifyCV',
    descriptionFi:
      `${TEMPLATE_COUNT} ilmaista CV-pohjaa ilman vesileimaa ja ilman tiliä. Esikatsele omalla sisällölläsi ja vaihda pohjaa milloin vain.`,
    description:
      `${TEMPLATE_COUNT} free CV templates, no watermark and no account required. Preview each one with your own content and swap between them any time.`,
  },
  atsGuide: {
    title: 'ATS-Friendly CV Guide - PortifyCV',
    path: ROUTES.atsGuide,
    pathFi: ROUTES_FI.atsGuide,
    titleFi: 'ATS-ystävällinen CV-opas - PortifyCV',
    descriptionFi:
      'Miten hakijaseurantajärjestelmät lukevat CV:n, mitkä muotoiluvirheet rikkovat jäsentämisen ja miten tarkistat oman CV:si avainsanat.',
    description:
      'How applicant tracking systems actually read a CV, the formatting mistakes that break parsing, and how to check your own CV against real keyword scoring.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-22',
  },
  howToWrite: {
    title: 'How to Write a CV - PortifyCV',
    path: ROUTES.howToWrite,
    pathFi: ROUTES_FI.howToWrite,
    titleFi: 'Näin kirjoitat CV:n - PortifyCV',
    descriptionFi:
      'Käytännön opas CV:n kirjoittamiseen: mitkä osiot ottaa mukaan, miten kirjoitat tuloksia näyttävät kokemuskohdat ja mitä välttää.',
    description:
      'A practical, structural guide to writing a CV: what sections to include, how to write experience bullets that show impact, and mistakes to avoid.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-22',
  },
  howToUse: {
    title: 'How to Use the CV Builder - PortifyCV',
    path: ROUTES.howToUse,
    pathFi: ROUTES_FI.howToUse,
    titleFi: 'CV-editorin käyttöopas - PortifyCV',
    descriptionFi:
      'Vaihe vaiheelta PortifyCV:n käyttöön: muokkaus suoraan CV:ssä, lomaketila, pohjat ja tyylit, ATS-tarkistus sekä vienti ja jakaminen.',
    description:
      'A step-by-step walkthrough of PortifyCV: editing right on the CV, the Classic form, templates and looks, ATS keyword checks, and exporting or sharing your CV.',
    isArticle: true,
    datePublished: '2026-09-01',
    dateModified: '2026-10-17',
  },
  coverLetterExamples: {
    title: 'Cover Letter Examples - PortifyCV',
    path: ROUTES.coverLetterExamples,
    pathFi: ROUTES_FI.coverLetterExamples,
    titleFi: 'Hakemuskirje-esimerkit - PortifyCV',
    descriptionFi:
      'Heikot ja vahvat esimerkit hakemuskirjeen aloitukseen, kokemuskappaleeseen ja lopetukseen sekä miten PortifyCV luo ensimmäisen version CV:stäsi.',
    description:
      'Real weak-vs-strong cover letter examples for the opening, experience paragraph, and closing, plus how PortifyCV drafts the first version from your CV.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-22',
  },
  cvSkills: {
    title: 'CV Skills Examples - PortifyCV',
    path: ROUTES.cvSkills,
    pathFi: ROUTES_FI.cvSkills,
    titleFi: 'Taito-osion esimerkit CV:hen - PortifyCV',
    descriptionFi:
      'Miten valitset, ryhmittelet ja muotoilet CV:n taito-osion, esimerkkiryhmittelyt ja kuinka monta taitoa on sopiva määrä.',
    description:
      'How to choose, group, and phrase the skills section of your CV, with example groupings and how many skills is actually the right number.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-22',
  },
  cvExamples: {
    title: 'CV Examples by Field - PortifyCV',
    path: ROUTES.cvExamples,
    pathFi: ROUTES_FI.cvExamples,
    titleFi: 'CV-esimerkit aloittain - PortifyCV',
    descriptionFi:
      'CV-esimerkkejä aloittain: kehittäjä, IT, tietoturva ja suomalainen CV, kukin heikkojen ja vahvojen kohtien esimerkein.',
    description:
      'CV examples by field: developer, IT, cybersecurity, and Finnish CVs, each with real weak-vs-strong bullet examples and field-specific advice.',
  },
  developerCv: {
    title: 'Developer CV Examples - PortifyCV',
    parent: 'cvExamples',
    path: ROUTES.developerCv,
    pathFi: ROUTES_FI.developerCv,
    titleFi: 'Kehittäjän CV-esimerkit - PortifyCV',
    descriptionFi:
      'Näin kirjoitat kehittäjän CV:n: projektit, tuloksia näyttävät kokemuskohdat ja tekniset taidot, jotka eivät kuulosta yleisiltä.',
    description:
      'How to write a developer CV: project entries, experience bullets that show impact, and skills that read as technical rather than generic.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-12',
  },
  itCv: {
    title: 'IT CV Examples - PortifyCV',
    parent: 'cvExamples',
    path: ROUTES.itCv,
    pathFi: ROUTES_FI.itCv,
    titleFi: 'IT-alan CV-esimerkit - PortifyCV',
    descriptionFi:
      'Näin kirjoitat IT-alan CV:n: sertifikaatit, tarkasti nimetyt järjestelmät ja työkalut, ja miksi ATS-ystävällinen muotoilu on tärkeää.',
    description:
      'How to write an IT CV: certifications, systems and tools worth naming precisely, and why IT applications need ATS-friendly formatting.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-22',
  },
  cybersecurityCv: {
    title: 'Cybersecurity CV Examples - PortifyCV',
    parent: 'cvExamples',
    path: ROUTES.cybersecurityCv,
    pathFi: ROUTES_FI.cybersecurityCv,
    titleFi: 'Tietoturva-alan CV-esimerkit - PortifyCV',
    descriptionFi:
      'Näin kirjoitat tietoturva-alan CV:n: sertifikaatit, oikeat työkalut kuten SIEM-alustat ja mihin Hack The Box- tai TryHackMe-profiili kuuluu.',
    description:
      'How to write a cybersecurity CV: certifications, real tools like SIEM platforms, and where a Hack The Box or TryHackMe profile belongs.',
    isArticle: true,
    datePublished: '2026-08-20',
    dateModified: '2026-10-12',
  },
  finnishCv: {
    title: 'Finnish CV Examples - PortifyCV',
    parent: 'cvExamples',
    path: ROUTES.finnishCv,
    pathFi: ROUTES_FI.finnishCv,
    titleFi: 'Suomalaisen CV:n esimerkit - PortifyCV',
    descriptionFi:
      'Miten suomalainen CV eroaa kansainvälisestä: mitä jättää pois, kielitaito-osion merkitys ja kaksikielinen esimerkki samasta sisällöstä.',
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
      // Under 60 characters for every label (search results cut longer
      // titles); "Classic Professional" is the longest at 51.
      title: `${template.label} CV Template (Free) - PortifyCV`,
      templateLabel: template.label,
      path: templatePath(template.slug),
      description: TEMPLATE_META_DESCRIPTIONS[template.id] ?? template.description,
      // Finnish (1.6.35): "Laivastonsininen ammattilainen", the longest
      // label, fits in 51 characters; "ilmainen" is in every description.
      pathFi: templatePath(template.slug, 'fi'),
      titleFi: `${getCvTemplate(template.id, 'fi').label} – CV-pohja - PortifyCV`,
      templateLabelFi: getCvTemplate(template.id, 'fi').label,
      descriptionFi: TEMPLATE_META_DESCRIPTIONS_FI[template.id] ?? getCvTemplate(template.id, 'fi').description,
      templateId: template.id,
      schema: 'template',
    },
  ]),
)

export const VIEW_HEAD = { ...STATIC_VIEW_HEAD, ...TEMPLATE_VIEW_HEAD }

// A view's head in one language (1.6.35): its title, description, path
// and (template pages) label in `locale`, which pages without a Finnish
// version fall back to English for, plus `alternates` ({ en, fi } paths)
// for the hreflang links when the page exists in both languages.
export function localizedHead(head, locale) {
  if (!head) {
    return head
  }
  const fi = locale === 'fi'
  return {
    ...head,
    locale: fi ? 'fi' : 'en',
    title: fi ? head.titleFi ?? head.title : head.title,
    description: fi ? head.descriptionFi ?? head.description : head.description,
    path: fi && head.pathFi ? head.pathFi : head.path,
    templateLabel: fi ? head.templateLabelFi ?? head.templateLabel : head.templateLabel,
    alternates: head.pathFi ? { en: head.path, fi: head.pathFi } : null,
  }
}

// Every real path in either language → its view and language. The
// builder's /cv has no language of its own (`locale: null`): it opens in
// the one the visitor last used.
export const PATH_TO_VIEW = new Map(Object.entries(VIEW_HEAD).flatMap(([view, head]) => [
  [head.path, { view, locale: view === 'builder' ? null : 'en' }],
  ...(head.pathFi ? [[head.pathFi, { view, locale: 'fi' }]] : []),
]))

// Article schema for guide-type pages (VIEW_HEAD entries with isArticle:
// true) — index.html's own two JSON-LD blocks (SoftwareApplication, FAQPage)
// describe the app itself and stay static across every route; this is the
// per-page equivalent for the guide pages.
export function buildArticleSchema(head) {
  const url = `${SITE_ORIGIN}${head.path}`
  const fi = head.locale === 'fi'
  const article = {
    '@type': 'Article',
    inLanguage: fi ? 'fi' : 'en',
    headline: head.title.replace(/ - PortifyCV$/, ''),
    description: head.description,
    url,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'PortifyCV', url: SITE_ORIGIN },
    publisher: { '@type': 'Organization', name: 'PortifyCV', url: SITE_ORIGIN },
    datePublished: head.datePublished,
    dateModified: head.dateModified ?? head.datePublished,
  }

  // Its breadcrumb trail, as the page shows it (1.6.38): home, the
  // examples hub for the field example pages, then the page itself.
  const parent = head.parent ? localizedHead(VIEW_HEAD[head.parent], head.locale) : null
  const crumbs = [
    { name: 'PortifyCV', path: fi ? ROUTES_FI.landing : ROUTES.landing },
    ...(parent ? [{ name: parent.title.replace(/ - PortifyCV$/, ''), path: parent.path }] : []),
    { name: article.headline, path: head.path },
  ]
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_ORIGIN}${crumb.path}`,
    })),
  }

  return { '@context': 'https://schema.org', '@graph': [article, breadcrumb] }
}

// BreadcrumbList for a per-template page: Home › Free CV templates › <Label>.
// The template pages aren't articles, so they don't get Article schema.
export function buildTemplatePageSchema(head) {
  const fi = head.locale === 'fi'
  const crumbs = [
    { name: 'PortifyCV', path: fi ? ROUTES_FI.landing : ROUTES.landing },
    { name: fi ? 'Ilmaiset CV-pohjat' : 'Free CV templates', path: fi ? ROUTES_FI.freeTemplates : ROUTES.freeTemplates },
    { name: head.templateLabel, path: head.path },
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
