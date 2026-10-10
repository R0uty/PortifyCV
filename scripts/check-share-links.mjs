// Regression check for the share-link codec (src/utils/shareLinks.js).
//
// The codec is the one place where CV data is compressed to short keys and back,
// so a mistyped key silently drops a field from every link ever generated. This
// script exercises the round trip without a browser.
//
//   node scripts/check-share-links.mjs
//
// Exits non-zero if any check fails.

import { registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

// The app's source uses extensionless relative imports, which Vite resolves and
// bare Node does not.
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

// shareLinks.js reaches for the browser's base64 helpers.
globalThis.window = {
  btoa: (value) => Buffer.from(value, 'binary').toString('base64'),
  atob: (value) => Buffer.from(value, 'base64').toString('binary'),
  location: { href: 'https://portifycv.app/cv' },
}

const utilsDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '../src/utils')
const importUtil = (name) => import(pathToFileURL(resolvePath(utilsDir, name)).href)

const { demoCvData, createInitialCvData, parseImportedCvData } = await importUtil('cvForm.js')
const share = await importUtil('shareLinks.js')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

// Compare field by field so a mismatch names the field instead of dumping blobs.
function diff(a, b, path = '', out = []) {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return out.push(`${path}: array/non-array`), out
    if (a.length !== b.length) out.push(`${path}: length ${a.length} -> ${b.length}`)
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) diff(a[i], b[i], `${path}[${i}]`, out)
    return out
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      diff(a[key], b[key], path ? `${path}.${key}` : key, out)
    }
    return out
  }
  if (JSON.stringify(a) !== JSON.stringify(b)) out.push(`${path}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`)
  return out
}

// The decoder always runs its output through parseImportedCvData, so the
// baseline has to as well for the comparison to be meaningful.
const demo = parseImportedCvData(structuredClone(demoCvData))
const demoEncoded = share.encodeCvStateForUrl(demo)

console.log(`\ndemo CV payload: ${demoEncoded.length} chars (limit ${share.MAX_SHARE_DATA_LENGTH})\n`)
check('demo CV fits within the share limit', demoEncoded.length <= share.MAX_SHARE_DATA_LENGTH)

const demoDiffs = diff(demo, share.decodeCvStateFromUrl(demoEncoded))
check('demo CV survives the round trip', demoDiffs.length === 0, demoDiffs.slice(0, 20).join('\n        '))

const empty = parseImportedCvData(createInitialCvData())
const emptyDiffs = diff(empty, share.decodeCvStateFromUrl(share.encodeCvStateForUrl(empty)))
check('empty CV survives the round trip', emptyDiffs.length === 0, emptyDiffs.slice(0, 15).join('\n        '))

const unicode = parseImportedCvData({ ...createInitialCvData(), fullName: 'Ääkkös Öö 日本語 🎉', about: 'Ω≈ç√' })
const unicodeBack = share.decodeCvStateFromUrl(share.encodeCvStateForUrl(unicode))
check(
  'non-ASCII text survives the base64 hop',
  unicodeBack.fullName === unicode.fullName && unicodeBack.about === unicode.about,
  `${JSON.stringify(unicodeBack.fullName)} / ${JSON.stringify(unicodeBack.about)}`,
)

// Images are deliberately excluded: one photo is many times larger than a URL
// can carry, so including it would make the link impossible to build at all.
const withImages = parseImportedCvData({
  ...structuredClone(demoCvData),
  photo: `data:image/jpeg;base64,${'A'.repeat(80_000)}`,
})
withImages.projects[0].image = `data:image/jpeg;base64,${'A'.repeat(80_000)}`
const imageEncoded = share.encodeCvStateForUrl(withImages)
check('a photo does not change the payload size', imageEncoded.length === demoEncoded.length,
  `${imageEncoded.length} vs ${demoEncoded.length}`)
check('shareLinkOmitsImages flags a CV carrying images', share.shareLinkOmitsImages(withImages) === true)
check('shareLinkOmitsImages is false without images', share.shareLinkOmitsImages(demo) === false)
const imagesBack = share.decodeCvStateFromUrl(imageEncoded)
check('images decode to the schema default', imagesBack.photo === '' && imagesBack.projects[0].image === '')
check('text is unaffected by dropping images', imagesBack.fullName === withImages.fullName)

// sectionColumnsByTemplate travels under its own short key ('sc').
const withColumns = parseImportedCvData({
  ...structuredClone(demoCvData),
  sectionColumnsByTemplate: { creative: { skills: 'main' }, developer: { education: 'main' } },
})
const columnsBack = share.decodeCvStateFromUrl(share.encodeCvStateForUrl(withColumns))
check('sectionColumnsByTemplate survives the round trip',
  JSON.stringify(columnsBack.sectionColumnsByTemplate) === JSON.stringify(withColumns.sectionColumnsByTemplate),
  JSON.stringify(columnsBack.sectionColumnsByTemplate))
check('an empty sectionColumnsByTemplate adds nothing to the payload',
  share.encodeCvStateForUrl(demo) === demoEncoded)

// styleVariantByTemplate travels under its own short key ('va').
const rawPayload = (encoded) => JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
const withVariants = parseImportedCvData({
  ...structuredClone(demoCvData),
  styleVariantByTemplate: { developer: 'graphite', creative: 'sage' },
})
const variantsEncoded = share.encodeCvStateForUrl(withVariants)
check('styleVariantByTemplate survives the round trip',
  JSON.stringify(share.decodeCvStateFromUrl(variantsEncoded).styleVariantByTemplate)
    === JSON.stringify(withVariants.styleVariantByTemplate))
check('styleVariantByTemplate travels as va',
  JSON.stringify(rawPayload(variantsEncoded).d.va) === JSON.stringify({ developer: 'graphite', creative: 'sage' }))
check('a CV with no stored variants encodes no va key', !('va' in rawPayload(demoEncoded).d))
check('a stray variant #1 entry is not encoded',
  !('va' in rawPayload(share.encodeCvStateForUrl({ ...demo, styleVariantByTemplate: { developer: 'default' } })).d))
check('an unknown variant id still decodes (rendered as variant #1 later)',
  share.decodeCvStateFromUrl(share.encodeCvStateForUrl({ ...demo, styleVariantByTemplate: { developer: 'fromTheFuture' } }))
    .styleVariantByTemplate.developer === 'fromTheFuture')

for (const [label, value] of [
  ['an array', []],
  ['a string', 'developer'],
  ['a non-string value', { developer: 3 }],
]) {
  let threw = false
  try {
    parseImportedCvData({ ...structuredClone(demoCvData), styleVariantByTemplate: value })
  } catch {
    threw = true
  }
  check(`import rejects styleVariantByTemplate as ${label}`, threw)
}
const { styleVariantByTemplate: _omitVariants, ...legacyCv } = structuredClone(demoCvData)
check('a file from before Phase 3 imports with no stored variants',
  JSON.stringify(parseImportedCvData(legacyCv).styleVariantByTemplate) === '{}')

for (const [label, value] of [
  ['unparseable input', '!!!not-base64!!!'],
  ['an empty string', ''],
  ['valid base64 that is not JSON', 'aGVsbG8'],
  ['a non-string', null],
]) {
  let message = null
  try { share.decodeCvStateFromUrl(value) } catch (error) { message = error.message }
  check(`rejects ${label}`, Boolean(message), 'no error was thrown')
}

// Version 2 links were generated before the payload covered the whole CV.
const legacyV2 = Buffer.from(JSON.stringify({
  v: 2,
  d: { f: 'Old Name', t: 'Old Title', x: [{ r: 'Dev', c: 'Acme', s: '2020', e: '2021', d: 'stuff' }] },
}), 'utf8').toString('base64url')
const legacyBack = share.decodeCvStateFromUrl(legacyV2)
check('legacy v2 links still decode',
  legacyBack.fullName === 'Old Name' && legacyBack.experience[0]?.role === 'Dev')

const url = share.buildShareUrl(demo, { currentHref: 'https://portifycv.app/?stale=1#stale' })
const fromUrl = share.readCvStateFromLocation(url)
check('buildShareUrl output can be read back', fromUrl.formData.fullName === demo.fullName,
  `url length ${url.length}, path ${new URL(url).pathname}`)
check('a link built without a template reads back templateId null', fromUrl.templateId === null)

// The sender's selected template travels under its own key ('tp', 1.6.8).
const templateUrl = share.buildShareUrl(demo, { templateId: 'developer', currentHref: 'https://portifycv.app/cv' })
const fromTemplateUrl = share.readCvStateFromLocation(templateUrl)
check('the selected template survives the round trip', fromTemplateUrl.templateId === 'developer')
check('the CV is unchanged when a template travels too',
  diff(demo, fromTemplateUrl.formData).length === 0, diff(demo, fromTemplateUrl.formData).join('; '))
const templateEncoded = new URLSearchParams(new URL(templateUrl).hash.slice(1)).get('data')
check('the template travels as tp', rawPayload(templateEncoded).d.tp === 'developer')
check('decodeCvStateFromUrl still returns only the CV',
  diff(demo, share.decodeCvStateFromUrl(templateEncoded)).length === 0)
check('no template encodes no tp key', !('tp' in rawPayload(share.encodeCvStateForUrl(demo)).d))
check('an empty template encodes no tp key', !('tp' in rawPayload(share.encodeCvStateForUrl(demo, '')).d))

// A link made before 1.6.8 has no tp; a hand-built one may carry junk.
const oldLink = `https://portifycv.app/cv#data=${demoEncoded}`
check('an old link (no tp) reads back templateId null',
  share.readCvStateFromLocation(oldLink).templateId === null
    && diff(demo, share.readCvStateFromLocation(oldLink).formData).length === 0)
const junkPayload = { ...rawPayload(demoEncoded) }
junkPayload.d = { ...junkPayload.d, tp: 42 }
const junkLink = `https://portifycv.app/cv#data=${Buffer.from(JSON.stringify(junkPayload), 'utf8').toString('base64url')}`
check('a non-string tp reads back templateId null', share.readCvStateFromLocation(junkLink).templateId === null)
check('a URL without share data reads back null', share.readCvStateFromLocation('https://portifycv.app/cv') === null)

console.log(`\n${failures === 0 ? 'All share-link checks passed.' : `${failures} check(s) failed.`}`)
process.exit(failures === 0 ? 0 : 1)
