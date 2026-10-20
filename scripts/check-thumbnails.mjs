// Checks public/thumbnails/ (1.6.30) against what it was made from:
// every template × look × locale has its image, each image is the one
// recorded in manifest.json, and no template code or style the
// thumbnails depend on has changed since (scripts/thumbnails/inputs.mjs).
// If this fails after a template change, run `npm run thumbnails` and
// commit the new images. Framework-free, run directly:
//
//   node scripts/check-thumbnails.mjs
import { registerHooks } from 'node:module'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { computeThumbnailInputsHash } from './thumbnails/inputs.mjs'

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

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(rootDir, 'public/thumbnails')
const importSrc = (p) => import(pathToFileURL(resolve(rootDir, 'src', p)).href)
const { cvTemplates } = await importSrc('utils/cvTemplates.js')
const { getTemplateVariants } = await importSrc('utils/templateVariants.js')
const { thumbnailImagePath } = await importSrc('utils/thumbnailImages.js')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

const manifestPath = resolve(outDir, 'manifest.json')
check('public/thumbnails/manifest.json exists', existsSync(manifestPath))
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { files: {} }

check('thumbnails are up to date with the template code and styles',
  manifest.inputsHash === computeThumbnailInputsHash(rootDir),
  'a template, its styles, the demo CV or the look registry changed: run `npm run thumbnails` and commit public/thumbnails/')

const expected = new Set()
for (const template of cvTemplates) {
  for (const variant of getTemplateVariants(template.id)) {
    for (const locale of ['en', 'fi']) {
      expected.add(thumbnailImagePath(template.id, variant.id, locale).replace(/^thumbnails\//, ''))
    }
  }
}

const missing = [...expected].filter((file) => !existsSync(join(outDir, file)))
check(`all ${expected.size} thumbnails (template × look × locale) exist`, missing.length === 0, missing.join(', '))

const mismatched = [...expected].filter((file) => existsSync(join(outDir, file))
  && manifest.files[file] !== createHash('sha256').update(readFileSync(join(outDir, file))).digest('hex'))
check('every image matches manifest.json', mismatched.length === 0, mismatched.join(', '))

const onDisk = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (name !== 'manifest.json') onDisk.push(relative(outDir, full))
  }
}
if (existsSync(outDir)) walk(outDir)
const extra = onDisk.filter((file) => !expected.has(file))
check('no leftover images for templates or looks that no longer exist', extra.length === 0, extra.join(', '))

if (failures > 0) {
  console.log(`\n${failures} thumbnail check(s) failed.`)
  process.exit(1)
}
console.log('\nAll thumbnail checks passed.')
