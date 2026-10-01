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
}
const allTips = Object.values(TEMPLATE_PAGE_COPY).flatMap((copy) => copy.en.tips)
check('no English tip is copy-pasted between templates', new Set(allTips).size === allTips.length)

// --- Sitemap ------------------------------------------------------------------
const sitemap = readFileSync(resolvePath(rootDir, 'public/sitemap.xml'), 'utf8')
const missingFromSitemap = cvTemplates.filter(
  (template) => !sitemap.includes(`<loc>https://portifycv.app${templatePath(template.slug)}</loc>`),
)
check('every template page is in sitemap.xml', missingFromSitemap.length === 0, missingFromSitemap.map((t) => t.slug).join(', '))

if (failures > 0) {
  console.log(`\n${failures} template-page check(s) failed.`)
  process.exit(1)
}
console.log('\nAll template-page checks passed.')
