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
  const metaDescription = copy?.metaDescription ?? ''
  check(
    `${template.id}: metaDescription starts with "Free ${template.label} CV template:" and ends with "no login"`,
    metaDescription.startsWith(`Free ${template.label} CV template:`)
      && /no login\.?$/.test(metaDescription.trim()),
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
const { parseImportedCvData, CV_SECTION_ORDER_KEYS } = await importSrc('utils/cvForm.js')
// Flip to true in Task 8, once all 24 example files exist. Until then a
// person whose loader still points at the _pending stub is reported as
// pending, not as a failure. Reads the registry, not the filesystem, so it
// agrees with what Vite builds.
const REQUIRE_ALL_EXAMPLES = false

function isSectionFilled(cv, key) {
  const value = cv[key]
  const hasText = (item) => typeof item === 'string'
    ? item.trim().length > 0
    : Boolean(item) && Object.values(item).some((field) => (typeof field === 'string' ? field.trim() : Array.isArray(field) && field.length))
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.some(hasText)
  if (value && typeof value === 'object') return Object.values(value).some((field) => typeof field === 'string' && field.trim())
  return false
}

for (const template of cvTemplates) {
  const ids = TEMPLATE_EXAMPLES[template.id] ?? []
  check(`${template.id}: lists 2–3 examples`, ids.length >= 2 && ids.length <= 3, `${ids.length}`)
  check(`${template.id}: every listed example is registered`, ids.every((id) => EXAMPLES[id]), ids.filter((id) => !EXAMPLES[id]).join(', '))
}

const usedIds = new Set(Object.values(TEMPLATE_EXAMPLES).flat())
const unused = Object.keys(EXAMPLES).filter((id) => !usedIds.has(id))
check('every registered example is used by a template', unused.length === 0, unused.join(', '))

const pending = []
for (const [exampleId, entry] of Object.entries(EXAMPLES)) {
  check(`${exampleId}: has en and fi role labels`, Boolean(entry.role?.en && entry.role?.fi))
  if (entry.load.toString().includes('_pending')) {
    pending.push(exampleId)
    continue
  }

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
    check(`${tag}: no photo baked in`, !cv.photo)
    const missing = requiredSections.filter((key) => !isSectionFilled(cv, key))
    check(`${tag}: fills every primary section of ${templatesUsingIt.map((t) => t.id).join(', ')}`, missing.length === 0, `missing: ${missing.join(', ')}`)
  }
}

if (pending.length > 0) {
  console.log(`pend  ${pending.length} example file(s) not written yet: ${pending.join(', ')}`)
}
check('all example files exist', !REQUIRE_ALL_EXAMPLES || pending.length === 0, pending.join(', '))

if (failures > 0) {
  console.log(`\n${failures} template-page check(s) failed.`)
  process.exit(1)
}
console.log('\nAll template-page checks passed.')
