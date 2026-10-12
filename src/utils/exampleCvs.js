// Example CVs for the per-template pages, and the builder's ?example= deep
// link. A shared pool: one fictional person can appear under several
// templates when the fit is real. Each person's content lives in its own
// module (./examples/<id>.js, exporting { en, fi }) and is loaded with a
// dynamic import, so a visitor only downloads the examples they view.
//
// TEMPLATE_EXAMPLES order matters: the first id is the page's default.
// Every person must fill every primary section of every template they're
// listed under; check:template-pages enforces that.

const role = (en, fi) => ({ en, fi })

export const EXAMPLES = {
  'frontend-developer': { role: role('Frontend developer', 'Frontend-kehittäjä'), load: () => import('./examples/frontend-developer.js') },
  'data-engineer': { role: role('Data engineer', 'Data engineer'), load: () => import('./examples/data-engineer.js') },
  'junior-developer': { role: role('Junior developer', 'Juniorikehittäjä'), load: () => import('./examples/junior-developer.js') },
  'ux-designer': { role: role('UX designer', 'UX-suunnittelija'), load: () => import('./examples/ux-designer.js') },
  'graphic-designer': { role: role('Graphic designer', 'Graafinen suunnittelija'), load: () => import('./examples/graphic-designer.js') },
  'marketing-manager': { role: role('Marketing manager', 'Markkinointipäällikkö'), load: () => import('./examples/marketing-manager.js') },
  'project-manager': { role: role('Project manager', 'Projektipäällikkö'), load: () => import('./examples/project-manager.js') },
  'product-manager': { role: role('Product manager', 'Tuotepäällikkö'), load: () => import('./examples/product-manager.js') },
  'finance-director': { role: role('Finance director', 'Talousjohtaja'), load: () => import('./examples/finance-director.js') },
  'operations-manager': { role: role('Operations manager', 'Operatiivinen päällikkö'), load: () => import('./examples/operations-manager.js') },
  'engineering-director': { role: role('Engineering director', 'Kehitysjohtaja'), load: () => import('./examples/engineering-director.js') },
  cto: { role: role('Chief technology officer', 'Teknologiajohtaja'), load: () => import('./examples/cto.js') },
  nurse: { role: role('Registered nurse', 'Sairaanhoitaja'), load: () => import('./examples/nurse.js') },
  accountant: { role: role('Accountant', 'Kirjanpitäjä'), load: () => import('./examples/accountant.js') },
  'cybersecurity-analyst': { role: role('Cybersecurity analyst', 'Kyberturvallisuusanalyytikko'), load: () => import('./examples/cybersecurity-analyst.js') },
  teacher: { role: role('Teacher', 'Opettaja'), load: () => import('./examples/teacher.js') },
  'business-graduate': { role: role('Business graduate', 'Kauppatieteiden vastavalmistunut'), load: () => import('./examples/business-graduate.js') },
  'research-scientist': { role: role('Research scientist', 'Tutkija'), load: () => import('./examples/research-scientist.js') },
  'sales-manager': { role: role('Sales manager', 'Myyntipäällikkö'), load: () => import('./examples/sales-manager.js') },
  'customer-success': { role: role('Customer success manager', 'Asiakkuuspäällikkö'), load: () => import('./examples/customer-success.js') },
  journalist: { role: role('Journalist', 'Toimittaja'), load: () => import('./examples/journalist.js') },
  'brand-specialist': { role: role('Brand specialist', 'Brändiasiantuntija'), load: () => import('./examples/brand-specialist.js') },
  chef: { role: role('Head chef', 'Keittiöpäällikkö'), load: () => import('./examples/chef.js') },
  architect: { role: role('Architect', 'Arkkitehti'), load: () => import('./examples/architect.js') },
}

export const TEMPLATE_EXAMPLES = {
  minimal: ['nurse', 'accountant', 'cybersecurity-analyst'],
  developer: ['frontend-developer', 'data-engineer', 'junior-developer'],
  creative: ['ux-designer', 'graphic-designer'],
  modern: ['marketing-manager', 'project-manager', 'product-manager'],
  executive: ['finance-director', 'operations-manager', 'engineering-director'],
  timeline: ['project-manager', 'teacher', 'operations-manager'],
  graduate: ['junior-developer', 'business-graduate'],
  compact: ['data-engineer', 'cybersecurity-analyst', 'business-graduate'],
  portfolio: ['frontend-developer', 'ux-designer', 'product-manager'],
  techExec: ['engineering-director', 'cto'],
  classicProfessional: ['accountant', 'finance-director', 'research-scientist'],
  navyProfessional: ['cto', 'sales-manager', 'research-scientist'],
  modernOrange: ['marketing-manager', 'ux-designer', 'customer-success'],
  colorfulCompact: ['graphic-designer', 'customer-success'],
  quadrant: ['marketing-manager', 'sales-manager', 'journalist'],
  editorial: ['journalist', 'research-scientist'],
  portrait: ['brand-specialist', 'chef', 'architect'],
  european: ['nurse', 'teacher', 'chef'],
}

// Full example CVs linked from the content pages ("CV examples by field"
// and its field pages), as [templateId, exampleId] pairs: each opens that
// template's page on that example. Only real fits — check:template-pages
// fails if a pair isn't in TEMPLATE_EXAMPLES.
export const CONTENT_PAGE_EXAMPLES = {
  cvExamples: [
    ['developer', 'frontend-developer'],
    ['minimal', 'cybersecurity-analyst'],
    ['modern', 'marketing-manager'],
    ['classicProfessional', 'accountant'],
    ['timeline', 'project-manager'],
    ['european', 'nurse'],
  ],
  developerCv: [
    ['developer', 'frontend-developer'],
    ['developer', 'data-engineer'],
    ['graduate', 'junior-developer'],
  ],
  cybersecurityCv: [
    ['minimal', 'cybersecurity-analyst'],
    ['compact', 'cybersecurity-analyst'],
  ],
  finnishCv: [
    ['european', 'nurse'],
    ['european', 'teacher'],
  ],
}

export function getTemplateExamples(templateId, locale = 'en') {
  const resolvedLocale = locale === 'fi' ? 'fi' : 'en'
  return (TEMPLATE_EXAMPLES[templateId] ?? [])
    .filter((id) => EXAMPLES[id])
    .map((id) => ({ id, role: EXAMPLES[id].role[resolvedLocale] }))
}

export function isTemplateExample(templateId, exampleId) {
  return typeof exampleId === 'string' && (TEMPLATE_EXAMPLES[templateId] ?? []).includes(exampleId)
}

// Resolves to null (never throws) for an unknown id, or an example whose
// file isn't written yet, so a stale ?example= link degrades to the
// default instead of breaking the page or the builder.
export async function loadExampleCv(exampleId, locale = 'en') {
  const entry = EXAMPLES[exampleId]
  if (!entry) {
    return null
  }

  try {
    const module = await entry.load()
    return structuredClone(module.default[locale === 'fi' ? 'fi' : 'en'])
  } catch {
    return null
  }
}
