// Regression check for the saved-CV library's rules (src/utils/cvLibrary.js):
// names, copy numbering and the record shape. The IndexedDB calls need a
// browser and are covered by e2e/saved-cvs.spec.js.
//
//   node scripts/check-cv-library.mjs
//
// Exits non-zero if any check fails.

import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

const srcDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '../src')
const {
  MAX_CV_NAME_LENGTH,
  createCvRecord,
  defaultCvName,
  isCvLibraryAvailable,
  listSavedCvs,
  nextCopyName,
  normalizeCvName,
} = await import(pathToFileURL(resolvePath(srcDir, 'utils/cvLibrary.js')).href)

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}
const same = (label, actual, expected) =>
  check(label, JSON.stringify(actual) === JSON.stringify(expected), `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`)

same('a name is trimmed and its whitespace collapsed', normalizeCvName('  Acme \n  application  '), 'Acme application')
same('a name is cut to the limit', normalizeCvName('x'.repeat(200)).length, MAX_CV_NAME_LENGTH)
same('a name that is not a string becomes empty', [normalizeCvName(null), normalizeCvName(undefined)], ['', ''])

same('the default name uses the person\'s name', defaultCvName({ fullName: 'Jane Example' }), 'Jane Example CV')
same('the default name without a person', [defaultCvName({ fullName: ' ' }), defaultCvName({}, 'fi')], ['My CV', 'Oma CV'])
check('the default name fits the limit', defaultCvName({ fullName: 'y'.repeat(200) }).length <= MAX_CV_NAME_LENGTH)

same('the first copy', nextCopyName('Master CV', ['Master CV']), 'Master CV (copy)')
same('the second copy', nextCopyName('Master CV', ['Master CV', 'Master CV (copy)']), 'Master CV (copy 2)')
same('a copy of a copy numbers on, it does not nest', nextCopyName('Master CV (copy)', ['Master CV', 'Master CV (copy)']), 'Master CV (copy 2)')
same('a copy of a numbered copy', nextCopyName('Master CV (copy 2)', ['Master CV', 'Master CV (copy)', 'Master CV (copy 2)']), 'Master CV (copy 3)')
same('taken names are compared without case', nextCopyName('Master CV', ['master cv (COPY)']), 'Master CV (copy 2)')
same('a gap in the numbering is reused', nextCopyName('Master CV', ['Master CV (copy 2)']), 'Master CV (copy)')
same('Finnish copies', [nextCopyName('Oma CV', [], 'fi'), nextCopyName('Oma CV (kopio)', ['Oma CV (kopio)'], 'fi')], ['Oma CV (kopio)', 'Oma CV (kopio 2)'])
check('a copy of a long name still fits the limit', nextCopyName('z'.repeat(60), []).length <= MAX_CV_NAME_LENGTH)
check('a copy of a long name still ends in the suffix', nextCopyName('z'.repeat(60), []).endsWith(' (copy)'))

{
  const data = { fullName: 'Jane Example' }
  const record = createCvRecord({ name: '  Acme  application ', data, templateId: 'modern', now: 1000 })
  same('a record has exactly the stored fields', Object.keys(record).sort(), ['createdAt', 'data', 'id', 'name', 'templateId', 'updatedAt'])
  same('a record\'s name is normalized', record.name, 'Acme application')
  same('a new record is created and updated at the same time', [record.createdAt, record.updatedAt], [1000, 1000])
  check('a record keeps the CV data as given', record.data === data)
  check('a record gets an id', typeof record.id === 'string' && record.id.length >= 8)
  check('two records get different ids', createCvRecord({ name: 'a', data, templateId: 'modern' }).id !== record.id)

  const updated = createCvRecord({ ...record, now: 2000 })
  same('an update keeps the id and creation time', [updated.id, updated.createdAt, updated.updatedAt], [record.id, 1000, 2000])
}

same('no IndexedDB (Node, or blocked storage) reads as unavailable', isCvLibraryAvailable(), false)
{
  let code = ''
  try {
    await listSavedCvs()
  } catch (error) {
    code = error.code
  }
  same('a call without IndexedDB rejects as unavailable instead of throwing something else', code, 'unavailable')
}

console.log()
if (failures > 0) {
  console.log(`${failures} check(s) failed.`)
  process.exit(1)
}

console.log('All saved-CV library checks passed.')
