// Regression check for the application log's rules (src/utils/applicationLog.js):
// the record shape, validation, sorting and the editable fields. The IndexedDB
// calls need a browser and are covered by the tracker's e2e spec.
//
//   node scripts/check-applications.mjs
//
// Exits non-zero if any check fails.

import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

const srcDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '../src')
const {
  APPLICATION_STATUSES,
  applyApplicationUpdate,
  createApplicationRecord,
  isApplicationLogAvailable,
  isValidApplicationRecord,
  listApplications,
  sortApplications,
} = await import(pathToFileURL(resolvePath(srcDir, 'utils/applicationLog.js')).href)

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}
const same = (label, actual, expected) =>
  check(label, JSON.stringify(actual) === JSON.stringify(expected), `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`)

const cv = { pdf: { size: 1 }, fileName: 'cv.pdf', paper: 'a4', fit: 'auto', pages: [{ image: { size: 1 } }] }
const source = { data: { fullName: 'Jane Example' }, templateId: 'modern', look: { styleVariantId: 'original' } }
const base = { company: 'Acme', role: 'Developer', appliedOn: '2026-11-23', cv, source }

same('the statuses', APPLICATION_STATUSES, ['applied', 'interview', 'offer', 'rejected', 'no-reply'])

{
  const record = createApplicationRecord({ ...base, company: '  Acme  Oy ', now: 1000 })
  same('a record has exactly the stored fields', Object.keys(record).sort(), ['adUrl', 'appliedOn', 'company', 'createdAt', 'cv', 'id', 'letter', 'note', 'role', 'source', 'status', 'updatedAt'])
  same('a new record is applied with an empty note', [record.status, record.note], ['applied', ''])
  same('a company is trimmed, inner spaces kept', record.company, 'Acme  Oy')
  same('created and updated at the same time', [record.createdAt, record.updatedAt], [1000, 1000])
  same('the letter defaults to null and the ad URL to empty', [record.letter, record.adUrl], [null, ''])
  same('a 200-character company is cut to 120', createApplicationRecord({ ...base, company: 'c'.repeat(200) }).company.length, 120)
  same('a long role is cut to 120', createApplicationRecord({ ...base, role: ' ' + 'r'.repeat(200) }).role.length, 120)
  check('two records get different ids', createApplicationRecord(base).id !== createApplicationRecord(base).id)
  same('an ad URL is trimmed', createApplicationRecord({ ...base, adUrl: ' https://x.fi/a ' }).adUrl, 'https://x.fi/a')

  check('a full record is valid', isValidApplicationRecord(record))
  check('empty company is invalid', !isValidApplicationRecord({ ...record, company: '' }))
  check('empty role is invalid', !isValidApplicationRecord({ ...record, role: '' }))
  check('a Finnish-format date is invalid', !isValidApplicationRecord({ ...record, appliedOn: '23.11.2026' }))
  check('an unknown status is invalid', !isValidApplicationRecord({ ...record, status: 'ghosted' }))
  check('a missing cv.pdf is invalid', !isValidApplicationRecord({ ...record, cv: { ...cv, pdf: null } }))
  check('a missing source is invalid', !isValidApplicationRecord({ ...record, source: undefined }))
  check('null is invalid', !isValidApplicationRecord(null))

  const updated = applyApplicationUpdate(record, { status: 'interview', note: 'Call Tue' }, 5000)
  same('status and note apply', [updated.status, updated.note, updated.updatedAt], ['interview', 'Call Tue', 5000])
  same('createdAt and the original are untouched', [updated.createdAt, record.status, record.updatedAt], [1000, 'applied', 1000])

  const untouched = applyApplicationUpdate(record, { cv: null, source: null, letter: null, id: 'x', createdAt: 0 }, 6000)
  check('cv, source, letter, id and createdAt cannot be changed', untouched.cv === record.cv && untouched.source === record.source && untouched.letter === record.letter && untouched.id === record.id && untouched.createdAt === 1000)

  same('an unknown status keeps the old one', applyApplicationUpdate(record, { status: 'ghosted' }, 2).status, 'applied')
  same('a bad date keeps the old one', applyApplicationUpdate(record, { appliedOn: 'tomorrow' }, 2).appliedOn, '2026-11-23')
  same('a blank company keeps the old one', applyApplicationUpdate(record, { company: '  ' }, 2).company, record.company)
  same('a valid date, company and ad URL apply', (({ appliedOn, company, adUrl }) => [appliedOn, company, adUrl])(applyApplicationUpdate(record, { appliedOn: '2026-12-01', company: ' Beta ', adUrl: ' u ' }, 2)), ['2026-12-01', 'Beta', 'u'])
}

{
  const input = [
    { appliedOn: '2026-11-02', createdAt: 5 },
    { appliedOn: '2026-11-12', createdAt: 1 },
    { appliedOn: '2026-11-12', createdAt: 3 },
  ]
  same('sorted by applied date, then newest first', sortApplications(input).map((record) => record.createdAt), [3, 1, 5])
  same('the input is not mutated', input.map((record) => record.createdAt), [5, 1, 3])
}

same('no IndexedDB (Node, or blocked storage) reads as unavailable', isApplicationLogAvailable(), false)
{
  let code = ''
  try {
    await listApplications()
  } catch (error) {
    code = error.code
  }
  same('a call without IndexedDB rejects as unavailable', code, 'unavailable')
}

console.log()
if (failures > 0) {
  console.log(`${failures} check(s) failed.`)
  process.exit(1)
}

console.log('All application log checks passed.')
