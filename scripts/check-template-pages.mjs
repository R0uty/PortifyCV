// Regression checks for the per-template pages (/free-cv-templates/<slug>):
// slugs, routes, metadata, example CVs, and page copy. Framework-free,
// run directly:
//
//   node scripts/check-template-pages.mjs

import { registerHooks } from 'node:module'
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
        return nextResolve(`${specifier}.js`, context)
      }
      throw error
    }
  },
})

const rootDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = resolvePath(rootDir, 'src')
const importSrc = (relativePath) => import(pathToFileURL(resolvePath(srcDir, relativePath)).href)

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

const { cvTemplates, getTemplateSlug } = await importSrc('utils/cvTemplates.js')
const { templatePath } = await importSrc('utils/routes.js')

// --- Slugs -----------------------------------------------------------------
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const slugs = cvTemplates.map((template) => template.slug)
const badSlugs = cvTemplates.filter((template) => !SLUG_RE.test(template.slug ?? ''))
check('every template has a kebab-case slug', badSlugs.length === 0, badSlugs.map((t) => t.id).join(', '))
check('slugs are unique', new Set(slugs).size === slugs.length)
check(
  'getTemplateSlug resolves every template id',
  cvTemplates.every((template) => getTemplateSlug(template.id) === template.slug),
)
check('getTemplateSlug returns null for an unknown id', getTemplateSlug('nope') === null)
check(
  'templatePath nests under /free-cv-templates',
  templatePath('developer') === '/free-cv-templates/developer',
)

// --- Metadata -----------------------------------------------------------------
const { VIEW_HEAD, buildTemplatePageSchema, TEMPLATE_VIEW_PREFIX } = await importSrc('utils/pageMeta.js')
const { TEMPLATE_PAGE_COPY } = await importSrc('utils/templatePageCopy.js')
const { TEMPLATE_META_DESCRIPTIONS } = await importSrc('utils/templateMetaDescriptions.js')

for (const template of cvTemplates) {
  const head = VIEW_HEAD[`${TEMPLATE_VIEW_PREFIX}${template.id}`]
  check(`${template.id}: has a VIEW_HEAD entry`, Boolean(head))
  if (!head) continue
  check(`${template.id}: path is templatePath(slug)`, head.path === templatePath(template.slug), head.path)
  check(
    `${template.id}: description is 50–160 chars`,
    head.description.length >= 50 && head.description.length <= 160,
    `${head.description.length} chars`,
  )
  const schema = buildTemplatePageSchema(head)
  check(
    `${template.id}: breadcrumb ends at its own page`,
    schema['@type'] === 'BreadcrumbList'
      && schema.itemListElement.length === 3
      && schema.itemListElement[2].item === `https://portifycv.app${head.path}`,
  )
}

const titles = Object.values(VIEW_HEAD).map((head) => head.title)
check('every VIEW_HEAD title is unique', new Set(titles).size === titles.length)

// --- Page copy ------------------------------------------------------------------
for (const template of cvTemplates) {
  const copy = TEMPLATE_PAGE_COPY[template.id]
  check(`${template.id}: has a templatePageCopy entry`, Boolean(copy))
  for (const locale of ['en', 'fi']) {
    const localized = copy?.[locale]
    check(
      `${template.id}/${locale}: bestFor and exactly 3 non-empty tips`,
      Boolean(localized?.bestFor?.trim())
        && Array.isArray(localized.tips)
        && localized.tips.length === 3
        && localized.tips.every((tip) => tip.trim().length > 0),
    )
  }

  const metaDescription = TEMPLATE_META_DESCRIPTIONS[template.id]
  check(`${template.id}: has a templateMetaDescriptions entry`, Boolean(metaDescription))
  check(
    `${template.id}: metaDescription is 50–160 chars`,
    typeof metaDescription === 'string' && metaDescription.length >= 50 && metaDescription.length <= 160,
    `${metaDescription?.length ?? 0} chars`,
  )
  check(
    `${template.id}: metaDescription starts with "Free ${template.label} CV template:" and ends with "no login"`,
    (metaDescription ?? '').startsWith(`Free ${template.label} CV template:`)
      && /no login\.?$/.test((metaDescription ?? '').trim()),
    metaDescription,
  )
}
const allTips = Object.values(TEMPLATE_PAGE_COPY).flatMap((copy) => copy.en.tips)
check('no English tip is copy-pasted between templates', new Set(allTips).size === allTips.length)

// --- Sitemap ------------------------------------------------------------------
const sitemap = readFileSync(resolvePath(rootDir, 'public/sitemap.xml'), 'utf8')
const missingFromSitemap = cvTemplates.filter(
  (template) => !sitemap.includes(`<loc>https://portifycv.app${templatePath(template.slug)}</loc>`),
)
check('every template page is in sitemap.xml', missingFromSitemap.length === 0, missingFromSitemap.map((t) => t.slug).join(', '))

// --- Example CVs -------------------------------------------------------------
const { EXAMPLES, TEMPLATE_EXAMPLES, loadExampleCv } = await importSrc('utils/exampleCvs.js')
const { parseImportedCvData, createInitialCvData, CV_SECTION_ORDER_KEYS, demoCvData } = await importSrc('utils/cvForm.js')

// Example and demo CVs must contain no real information: one placeholder
// identity, placeholder organisations, and links that can only ever resolve
// to the reserved example.com domain — never a real person's profile, a real
// company or school, or a real open-source project.
const PLACEHOLDER = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '0123456789',
  organisation: 'Example Oy',
  school: 'Example University',
  openSource: 'Example project',
}
const ORGANISATION_FIELDS = ['company', 'organization', 'publisher', 'issuer']

function collectStrings(value, out = []) {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out))
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, out))
  return out
}

function checkNoRealInformation(tag, cv) {
  check(`${tag}: placeholder name`, cv.fullName === PLACEHOLDER.fullName, cv.fullName)
  check(`${tag}: placeholder email`, cv.email === PLACEHOLDER.email, cv.email)
  check(`${tag}: placeholder phone`, cv.phone === PLACEHOLDER.phone, cv.phone)

  const realHosts = collectStrings(cv)
    .flatMap((text) => [...text.matchAll(/https?:\/\/([^/\s'")]+)/g)].map((match) => match[1].toLowerCase()))
    .filter((host) => host !== 'example.com' && !host.endsWith('.example.com'))
  check(`${tag}: every link is on example.com`, realHosts.length === 0, realHosts.join(', '))

  const entries = Object.values(cv).filter(Array.isArray).flat().filter((item) => item && typeof item === 'object')
  const realOrganisations = entries
    .flatMap((item) => ORGANISATION_FIELDS.map((field) => item[field]))
    .filter((value) => typeof value === 'string' && value.trim() && value !== PLACEHOLDER.organisation)
  check(`${tag}: every organisation is ${PLACEHOLDER.organisation}`, realOrganisations.length === 0, realOrganisations.join(', '))
  const realSchools = entries
    .map((item) => item.school)
    .filter((value) => typeof value === 'string' && value.trim() && value !== PLACEHOLDER.school)
  check(`${tag}: every school is ${PLACEHOLDER.school}`, realSchools.length === 0, realSchools.join(', '))
  const realProjects = (cv.openSource ?? []).map((item) => item.name).filter((name) => name && name !== PLACEHOLDER.openSource)
  check(`${tag}: every open-source project is ${PLACEHOLDER.openSource}`, realProjects.length === 0, realProjects.join(', '))
}

checkNoRealInformation('demo CV', demoCvData)
const { hasSectionContent, hideEmptySections } = await importSrc('utils/sectionContent.js')

for (const template of cvTemplates) {
  const ids = TEMPLATE_EXAMPLES[template.id] ?? []
  check(`${template.id}: lists 2–3 examples`, ids.length >= 2 && ids.length <= 3, `${ids.length}`)
  check(`${template.id}: every listed example is registered`, ids.every((id) => EXAMPLES[id]), ids.filter((id) => !EXAMPLES[id]).join(', '))
}

const usedIds = new Set(Object.values(TEMPLATE_EXAMPLES).flat())
const unused = Object.keys(EXAMPLES).filter((id) => !usedIds.has(id))
check('every registered example is used by a template', unused.length === 0, unused.join(', '))

for (const [exampleId, entry] of Object.entries(EXAMPLES)) {
  check(`${exampleId}: has en and fi role labels`, Boolean(entry.role?.en && entry.role?.fi))

  const templatesUsingIt = cvTemplates.filter((template) => (TEMPLATE_EXAMPLES[template.id] ?? []).includes(exampleId))
  const requiredSections = [...new Set(templatesUsingIt.flatMap((template) => template.primarySections))]

  for (const locale of ['en', 'fi']) {
    const cv = await loadExampleCv(exampleId, locale)
    const tag = `${exampleId}/${locale}`
    check(`${tag}: loads`, Boolean(cv))
    if (!cv) continue

    let parsed = null
    try { parsed = parseImportedCvData(JSON.parse(JSON.stringify(cv))) } catch (error) {
      check(`${tag}: accepted by parseImportedCvData`, false, error.message)
    }
    if (parsed) {
      const changed = CV_SECTION_ORDER_KEYS.filter((key) => Array.isArray(cv[key]) && cv[key].length !== parsed[key]?.length)
      check(`${tag}: parsing keeps every entry`, changed.length === 0, changed.join(', '))
    }

    check(`${tag}: has fullName and title`, Boolean(cv.fullName?.trim() && cv.title?.trim()))
    check(`${tag}: email is @example.com`, /@example\.com$/.test(cv.email ?? ''), cv.email)
    checkNoRealInformation(tag, cv)
    check(`${tag}: no photo baked in`, !cv.photo)
    const missing = requiredSections.filter((key) => !hasSectionContent(cv, key))
    check(`${tag}: fills every primary section of ${templatesUsingIt.map((t) => t.id).join(', ')}`, missing.length === 0, `missing: ${missing.join(', ')}`)
  }
}

// --- sectionContent (template-page-only empty-section hiding) --------------
const blankCv = createInitialCvData()
check(
  'hasSectionContent is false for every section of a blank CV',
  CV_SECTION_ORDER_KEYS.every((key) => !hasSectionContent(blankCv, key)),
  CV_SECTION_ORDER_KEYS.filter((key) => hasSectionContent(blankCv, key)).join(', '),
)

const blankCvJson = JSON.stringify(blankCv)
const hiddenBlank = hideEmptySections(blankCv)
check(
  'hideEmptySections hides every section on a blank CV',
  CV_SECTION_ORDER_KEYS.every((key) => hiddenBlank.sectionVisibility[key] === false),
)
check('hideEmptySections does not mutate its input', JSON.stringify(blankCv) === blankCvJson)

const frontendDeveloperEn = await loadExampleCv('frontend-developer', 'en')
const hiddenFrontendDeveloper = hideEmptySections(frontendDeveloperEn)
check(
  'hideEmptySections keeps about/experience visible for frontend-developer/en',
  hiddenFrontendDeveloper.sectionVisibility.about === true
    && hiddenFrontendDeveloper.sectionVisibility.experience === true,
)
check(
  'hideEmptySections hides languages for frontend-developer/en',
  hiddenFrontendDeveloper.sectionVisibility.languages === false,
)

// --- Field filters (1.6.12) -------------------------------------------------
const { TEMPLATE_FIELDS, ALL_FIELDS_LABEL, parseFieldParam, filterTemplatesByField } =
  await importSrc('utils/templateFields.js')

const fieldIds = TEMPLATE_FIELDS.map((field) => field.id)
check('field ids are unique', new Set(fieldIds).size === fieldIds.length, fieldIds.join(', '))
const badFields = cvTemplates.filter((template) => !Array.isArray(template.fields)
  || template.fields.length === 0
  || new Set(template.fields).size !== template.fields.length
  || template.fields.some((field) => !fieldIds.includes(field)))
check('every template has known, non-duplicate fields', badFields.length === 0, badFields.map((t) => t.id).join(', '))
for (const field of TEMPLATE_FIELDS) {
  const count = cvTemplates.filter((template) => template.fields?.includes(field.id)).length
  check(`field ${field.id} has at least two templates`, count >= 2, `has ${count}`)
}
for (const lang of ['en', 'fi']) {
  const labels = [ALL_FIELDS_LABEL, ...TEMPLATE_FIELDS.map((field) => field.label)].map((label) => label?.[lang])
  check(`field labels are non-empty and unique in ${lang}`,
    labels.every((label) => typeof label === 'string' && label.trim()) && new Set(labels).size === labels.length,
    labels.join(' | '))
}
check('parseFieldParam accepts a known id', parseFieldParam('tech') === 'tech')
check('parseFieldParam: unknown, empty, missing or wrong-case → null',
  ['nope', '', null, undefined, 'Tech'].every((raw) => parseFieldParam(raw) === null))
const techIds = filterTemplatesByField(cvTemplates, 'tech').map((template) => template.id)
check('filterTemplatesByField keeps gallery order',
  techIds.length > 0
    && JSON.stringify(techIds) === JSON.stringify(cvTemplates.map((t) => t.id).filter((id) => techIds.includes(id))))
check('filterTemplatesByField(null) returns every template',
  filterTemplatesByField(cvTemplates, null).length === cvTemplates.length)

if (failures > 0) {
  console.log(`\n${failures} template-page check(s) failed.`)
  process.exit(1)
}
console.log('\nAll template-page checks passed.')
