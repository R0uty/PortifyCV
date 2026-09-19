// Regression check for src/utils/directEdit.js's supported-template
// allowlist. Framework-free, run directly:
//
//   node scripts/check-direct-edit.mjs

import { registerHooks } from 'node:module'
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

const srcDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '../src')
const importSrc = (relativePath) => import(pathToFileURL(resolvePath(srcDir, relativePath)).href)

const { INLINE_EDIT_SUPPORTED_TEMPLATES, isInlineEditSupported } = await importSrc('utils/directEdit.js')
const { cvTemplates } = await importSrc('utils/cvTemplates.js')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

console.log('\ndirectEdit: supported-template allowlist\n')

{
  const registryIds = new Set(cvTemplates.map((template) => template.id))
  const unknownIds = INLINE_EDIT_SUPPORTED_TEMPLATES.filter((id) => !registryIds.has(id))
  check(
    'every id in INLINE_EDIT_SUPPORTED_TEMPLATES is a real template id',
    unknownIds.length === 0,
    `unknown ids: ${unknownIds.join(', ')}`,
  )
  check(
    'INLINE_EDIT_SUPPORTED_TEMPLATES has no duplicate entries',
    new Set(INLINE_EDIT_SUPPORTED_TEMPLATES).size === INLINE_EDIT_SUPPORTED_TEMPLATES.length,
  )
  check('Minimalist (the Phase 1 reference template) is supported', isInlineEditSupported('minimal'))
  check('an unknown template id is not supported', isInlineEditSupported('not-a-real-template') === false)
}

console.log(`\n${failures === 0 ? 'All direct-edit checks passed.' : `${failures} check(s) failed.`}`)
process.exit(failures === 0 ? 0 : 1)
