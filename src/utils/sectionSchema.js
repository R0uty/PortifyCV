// Field descriptors for Direct Edit's popup section editor.
//
// This is the single source of truth for "what fields does section X
// have, and how should each be rendered". It exists because the popup is
// template-agnostic: it cannot read field names off a template's JSX the
// way inline editing does, so it needs the data model described in one
// place. scripts/check-section-schema.mjs validates it against
// cvForm.js's factories in both directions on every run, so a renamed or
// removed factory field fails the build rather than silently dropping a
// user's edit.

export const SECTION_SHAPE = Object.freeze({
  rootGroup: 'rootGroup',
  rootScalar: 'rootScalar',
  stringArray: 'stringArray',
  linkMap: 'linkMap',
  recordArray: 'recordArray',
})

const text = (key, labelEn, labelFi) => ({ key, labelEn, labelFi, type: 'text' })
const area = (key, labelEn, labelFi) => ({ key, labelEn, labelFi, type: 'textarea' })
const month = (key, labelEn, labelFi) => ({ key, labelEn, labelFi, type: 'month' })
const url = (key, labelEn, labelFi) => ({ key, labelEn, labelFi, type: 'url' })
const check = (key, labelEn, labelFi) => ({ key, labelEn, labelFi, type: 'checkbox' })

export const SECTION_SCHEMA = {
  // Synthetic section: the header block, which has no sectionOrder entry
  // and is reached via [data-export-header] rather than
  // [data-export-section]. `photo` is handled separately by the popup
  // (TOGGLE_PHOTO_VISIBILITY needs a template id, not a field value), so
  // it is not listed as a field here.
  identity: {
    shape: SECTION_SHAPE.rootGroup,
    labelEn: 'Header',
    labelFi: 'Otsikko',
    fields: [
      text('fullName', 'Full name', 'Koko nimi'),
      text('title', 'Professional title', 'Ammattinimike'),
      text('tagline', 'Tagline', 'Iskulause'),
      text('email', 'Email', 'Sähköposti'),
      text('phone', 'Phone', 'Puhelin'),
      text('location', 'Location', 'Sijainti'),
    ],
  },

  about: {
    shape: SECTION_SHAPE.rootScalar,
    labelEn: 'About',
    labelFi: 'Esittely',
    fields: [area('about', 'Summary', 'Yhteenveto')],
  },

  skills: {
    shape: SECTION_SHAPE.stringArray,
    labelEn: 'Skills',
    labelFi: 'Taidot',
    fields: [text('skill', 'Skill', 'Taito')],
  },

  links: {
    shape: SECTION_SHAPE.linkMap,
    labelEn: 'Links',
    labelFi: 'Linkit',
    fields: [
      url('github', 'GitHub', 'GitHub'),
      url('linkedin', 'LinkedIn', 'LinkedIn'),
      url('portfolio', 'Portfolio', 'Portfolio'),
      url('website', 'Website', 'Verkkosivu'),
      url('behance', 'Behance', 'Behance'),
      url('dribbble', 'Dribbble', 'Dribbble'),
      url('medium', 'Medium', 'Medium'),
      url('devto', 'dev.to', 'dev.to'),
      url('scholar', 'Google Scholar', 'Google Scholar'),
      url('boardProfile', 'Board profile', 'Hallitusprofiili'),
      url('blog', 'Blog', 'Blogi'),
      url('researchGate', 'ResearchGate', 'ResearchGate'),
      url('hackTheBox', 'Hack The Box', 'Hack The Box'),
      url('tryHackMe', 'TryHackMe', 'TryHackMe'),
      url('youtube', 'YouTube', 'YouTube'),
    ],
  },

  experience: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Experience',
    labelFi: 'Kokemus',
    fields: [
      text('role', 'Role', 'Rooli'),
      text('company', 'Company', 'Yritys'),
      text('location', 'Location', 'Sijainti'),
      text('employmentType', 'Employment type', 'Työsuhteen tyyppi'),
      month('startDate', 'Start date', 'Aloituspäivä'),
      month('endDate', 'End date', 'Lopetuspäivä'),
      check('isCurrent', 'Current role', 'Nykyinen rooli'),
      area('description', 'Description', 'Kuvaus'),
    ],
  },

  education: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Education',
    labelFi: 'Koulutus',
    fields: [
      text('school', 'School', 'Oppilaitos'),
      text('degree', 'Degree', 'Tutkinto'),
      text('location', 'Location', 'Sijainti'),
      month('startDate', 'Start date', 'Aloituspäivä'),
      month('endDate', 'End date', 'Lopetuspäivä'),
      text('honors', 'Honors', 'Kunniamaininnat'),
      area('coursework', 'Coursework', 'Opinnot'),
      text('grade', 'Grade', 'Arvosana'),
    ],
  },

  coreStrengths: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Core strengths',
    labelFi: 'Vahvuudet',
    fields: [
      text('title', 'Title', 'Otsikko'),
      area('description', 'Description', 'Kuvaus'),
    ],
  },

  certificates: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Certificates',
    labelFi: 'Sertifikaatit',
    fields: [
      text('name', 'Name', 'Nimi'),
      text('issuer', 'Issuer', 'Myöntäjä'),
      text('year', 'Year', 'Vuosi'),
      url('credentialUrl', 'Credential URL', 'Todistuksen osoite'),
      text('expiry', 'Expiry', 'Voimassaolo'),
    ],
  },

  projects: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Projects',
    labelFi: 'Projektit',
    fields: [
      text('name', 'Name', 'Nimi'),
      area('description', 'Description', 'Kuvaus'),
      text('stack', 'Stack', 'Teknologiat'),
      url('githubUrl', 'GitHub URL', 'GitHub-osoite'),
      url('demoUrl', 'Demo URL', 'Demo-osoite'),
      text('organization', 'Organization', 'Organisaatio'),
      text('impact', 'Impact', 'Vaikutus'),
      text('date', 'Date', 'Päivämäärä'),
      text('teamSize', 'Team size', 'Tiimin koko'),
      area('contribution', 'Contribution', 'Oma panos'),
    ],
  },

  languages: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Languages',
    labelFi: 'Kielet',
    fields: [
      text('language', 'Language', 'Kieli'),
      text('level', 'Level', 'Taso'),
    ],
  },

  interests: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Interests',
    labelFi: 'Kiinnostuksen kohteet',
    fields: [text('name', 'Name', 'Nimi')],
  },

  achievements: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Achievements',
    labelFi: 'Saavutukset',
    fields: [
      text('title', 'Title', 'Otsikko'),
      area('description', 'Description', 'Kuvaus'),
      text('year', 'Year', 'Vuosi'),
    ],
  },

  openSource: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Open source',
    labelFi: 'Avoin lähdekoodi',
    fields: [
      text('name', 'Name', 'Nimi'),
      area('description', 'Description', 'Kuvaus'),
      text('language', 'Language', 'Kieli'),
      text('stars', 'Stars', 'Tähdet'),
      text('forks', 'Forks', 'Haarat'),
      url('url', 'URL', 'Osoite'),
    ],
  },

  publications: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Publications',
    labelFi: 'Julkaisut',
    fields: [
      text('title', 'Title', 'Otsikko'),
      text('publisher', 'Publisher', 'Julkaisija'),
      text('year', 'Year', 'Vuosi'),
      url('url', 'URL', 'Osoite'),
    ],
  },

  leadership: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Leadership experience',
    labelFi: 'Johtamiskokemus',
    fields: [
      text('role', 'Role', 'Rooli'),
      text('organization', 'Organization', 'Organisaatio'),
      area('description', 'Description', 'Kuvaus'),
      month('startDate', 'Start date', 'Aloituspäivä'),
      month('endDate', 'End date', 'Lopetuspäivä'),
    ],
  },

  memberships: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Professional memberships',
    labelFi: 'Ammattijäsenyydet',
    fields: [
      text('organization', 'Organization', 'Organisaatio'),
      text('role', 'Role', 'Rooli'),
      text('year', 'Year', 'Vuosi'),
    ],
  },

  speaking: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Speaking',
    labelFi: 'Esiintymiset',
    fields: [
      text('conference', 'Conference', 'Konferenssi'),
      text('topic', 'Topic', 'Aihe'),
      text('audience', 'Audience', 'Yleisö'),
      text('date', 'Date', 'Päivämäärä'),
    ],
  },

  volunteering: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Volunteering',
    labelFi: 'Vapaaehtoistyö',
    fields: [
      text('organization', 'Organization', 'Organisaatio'),
      text('role', 'Role', 'Rooli'),
      area('description', 'Description', 'Kuvaus'),
    ],
  },

  internships: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Internships',
    labelFi: 'Harjoittelut',
    fields: [
      text('role', 'Role', 'Rooli'),
      text('company', 'Company', 'Yritys'),
      text('location', 'Location', 'Sijainti'),
      month('startDate', 'Start date', 'Aloituspäivä'),
      month('endDate', 'End date', 'Lopetuspäivä'),
      area('description', 'Description', 'Kuvaus'),
      text('technologies', 'Technologies', 'Teknologiat'),
    ],
  },

  caseStudies: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Case studies',
    labelFi: 'Tapaustutkimukset',
    fields: [
      text('title', 'Title', 'Otsikko'),
      area('problem', 'Problem', 'Ongelma'),
      area('solution', 'Solution', 'Ratkaisu'),
      text('technologies', 'Technologies', 'Teknologiat'),
      area('outcome', 'Outcome', 'Lopputulos'),
      area('lessons', 'Lessons', 'Opit'),
    ],
  },

  testimonials: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Testimonials',
    labelFi: 'Suositukset',
    fields: [
      area('quote', 'Quote', 'Lainaus'),
      text('author', 'Author', 'Kirjoittaja'),
      text('role', 'Role', 'Rooli'),
    ],
  },
}

export function getSectionSchema(sectionKey) {
  return SECTION_SCHEMA[sectionKey]
}
