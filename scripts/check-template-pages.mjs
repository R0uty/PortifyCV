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

if (failures > 0) {
  console.log(`\n${failures} template-page check(s) failed.`)
  process.exit(1)
}
console.log('\nAll template-page checks passed.')
