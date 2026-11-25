// Checks for the translation files (src/i18n/, 1.7.13). Framework-free,
// run directly:
//
//   node scripts/check-i18n.mjs
//
// 1. The module's own cases (lookup, fallback, placeholders, plurals).
// 2. Parity: every namespace's languages have the same keys, array lengths,
//    functions, placeholders and rich-text tags.
// 3. Usage: every key of a `kind: 'strings'` namespace is used somewhere in
//    src/ (as a string literal) or sits under a DYNAMIC_KEYS prefix.
// 4. Source scan: no inline language branch (`isFinnish ? … : …`,
//    `locale === 'fi' ? …`, `{ en: …, fi: … }`) outside ALLOWLIST and
//    MIGRATION_PENDING.
// 5. Plural regression cases (pluralCases), the exact former output.
//
// Exits non-zero if any check fails.

import { registerHooks } from 'node:module'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, relative, resolve as resolvePath, sep } from 'node:path'

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
const i18nDir = resolvePath(srcDir, 'i18n')
const importFile = (absolutePath) => import(pathToFileURL(absolutePath).href)
const toRepoPath = (absolutePath) => relative(rootDir, absolutePath).split(sep).join('/')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}
const same = (label, actual, expected) =>
  check(label, JSON.stringify(actual) === JSON.stringify(expected), `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`)

function walkFiles(dir, accept) {
  const found = []
  for (const name of readdirSync(dir).sort()) {
    const path = resolvePath(dir, name)
    if (statSync(path).isDirectory()) found.push(...walkFiles(path, accept))
    else if (accept(path)) found.push(path)
  }
  return found
}

const { LOCALES, DEFAULT_LOCALE, normalizeLocale, createNamespace, parityErrors, isPluralValue } =
  await importFile(resolvePath(i18nDir, 'index.js'))
const { DYNAMIC_KEYS } = await importFile(resolvePath(i18nDir, 'dynamicKeys.js'))

// --- 1. The module's own cases ----------------------------------------------
same('locales', [LOCALES, DEFAULT_LOCALE], [['en', 'fi'], 'en'])
same('normalizeLocale', ['en', 'fi', 'sv', undefined, 'fi-FI'].map(normalizeLocale), ['en', 'fi', 'en', 'en', 'en'])

const ns = createNamespace('test', {
  en: { a: 'Save', g: 'Hi {name}', p: { one: '{count} page', other: '{count} pages' }, f: (v) => `${v.n} min`, r: 'Read the <0>guide</0>.' },
  fi: { a: 'Tallenna', g: 'Hei {name}', p: { one: '{count} sivu', other: '{count} sivua' }, f: (v) => `${v.n} min`, r: 'Lue <0>opas</0>.' },
})
same('plain', ns.t('fi', 'a'), 'Tallenna')
same('unknown locale falls back to en', ns.t('sv', 'a'), 'Save')
same('placeholder', ns.t('en', 'g', { name: 'Ada' }), 'Hi Ada')
same('missing var stays', ns.t('en', 'g'), 'Hi {name}')
same('plural 0/1/2 en', [0, 1, 2].map((count) => ns.t('en', 'p', { count })), ['0 pages', '1 page', '2 pages'])
same('plural 0/1/2 fi', [0, 1, 2].map((count) => ns.t('fi', 'p', { count })), ['0 sivua', '1 sivu', '2 sivua'])
same('function value', ns.t('en', 'f', { n: 5 }), '5 min')
same('missing key returns the key', ns.t('en', 'nope'), 'nope')
same('copy', ns.copy('fi').a, 'Tallenna')
same('rich tags are left for <T>', ns.t('fi', 'r'), 'Lue <0>opas</0>.')
same('a key missing in fi falls back to en', createNamespace('fb', { en: { x: { y: 'Yes' } }, fi: { x: {} } }).t('fi', 'x.y'), 'Yes')
same('namespace shape', [ns.name, ns.kind, createNamespace('pg', { en: {}, fi: {} }, { kind: 'page' }).kind], ['test', 'strings', 'page'])
// parity detector on a broken pair
check('parity passes a good pair', parityErrors(ns).length === 0, parityErrors(ns).join('; '))
check('parity flags a missing key', parityErrors(createNamespace('bad', { en: { a: 'x', b: 'y' }, fi: { a: 'x' } })).length === 1)
check('parity flags a placeholder mismatch', parityErrors(createNamespace('bad2', { en: { a: '{n} x' }, fi: { a: 'x' } })).length === 1)
check('parity flags a tag mismatch', parityErrors(createNamespace('bad3', { en: { a: '<0>x</0>' }, fi: { a: 'x' } })).length === 1)
check('parity flags an array length', parityErrors(createNamespace('bad4', { en: { a: ['x', 'y'] }, fi: { a: ['x'] } })).length === 1)
check('parity flags a function on one side', parityErrors(createNamespace('bad5', { en: { a: () => 'x' }, fi: { a: 'x' } })).length === 1)
check('parity flags a plural without other', parityErrors(createNamespace('bad6', { en: { a: { one: 'x', other: 'y' } }, fi: { a: { one: 'x' } } })).length === 1)
check('parity flags a missing language', parityErrors(createNamespace('bad7', { en: { a: 'x' } })).length === 1)
check('a plural value is recognised', isPluralValue({ one: 'a', other: 'b' }) && !isPluralValue({ title: 'a' }) && !isPluralValue({}))

// --- Namespaces -----------------------------------------------------------------
// Every index.js under src/i18n/ except the module's own (src/i18n/<ns>/index.js,
// and nested page namespaces such as src/i18n/pages/<page>/index.js).
const namespaceFiles = walkFiles(i18nDir, (path) => path.endsWith(`${sep}index.js`) && path !== resolvePath(i18nDir, 'index.js'))
const namespaces = new Map()
for (const file of namespaceFiles) {
  const exported = Object.values(await importFile(file)).filter((value) => value && typeof value.t === 'function' && value.messages)
  check(`${toRepoPath(file)} exports a namespace`, exported.length > 0)
  for (const namespace of exported) {
    check(`namespace "${namespace.name}" is defined once`, !namespaces.has(namespace.name), `also in ${namespaces.get(namespace.name)?.file}`)
    namespaces.set(namespace.name, { namespace, file: toRepoPath(file) })
  }
}
console.log(`      ${namespaces.size} namespace(s)`)

// --- 2. Parity ------------------------------------------------------------------
for (const { namespace } of namespaces.values()) {
  const errors = parityErrors(namespace)
  check(`parity: ${namespace.name}`, errors.length === 0, errors.join('\n        '))
}

// --- 3. Usage -------------------------------------------------------------------
const sourceFiles = walkFiles(srcDir, (path) => /\.(js|jsx)$/.test(path) && !path.startsWith(`${i18nDir}${sep}`))
const sources = new Map(sourceFiles.map((path) => [toRepoPath(path), readFileSync(path, 'utf8')]))
const corpus = [...sources.values()].join('\n')

function leafKeys(value, prefix = '') {
  if (value && typeof value === 'object' && !Array.isArray(value) && !isPluralValue(value)) {
    return Object.entries(value).flatMap(([key, child]) => leafKeys(child, prefix ? `${prefix}.${key}` : key))
  }
  return prefix ? [prefix] : []
}

for (const entry of DYNAMIC_KEYS) {
  const owner = namespaces.get(entry.namespace)
  check(`DYNAMIC_KEYS ${entry.namespace}:${entry.prefix} names a namespace`, Boolean(owner))
  if (!owner) continue
  const keys = new Set(leafKeys(owner.namespace.messages[DEFAULT_LOCALE]))
  const missing = entry.ids.filter((id) => !keys.has(`${entry.prefix}.${id}`))
  check(`DYNAMIC_KEYS ${entry.namespace}:${entry.prefix} has a key for every id`, missing.length === 0, `missing: ${missing.join(', ')}`)
}

for (const { namespace } of namespaces.values()) {
  if (namespace.kind !== 'strings') continue
  const dynamicPrefixes = DYNAMIC_KEYS.filter((entry) => entry.namespace === namespace.name).map((entry) => `${entry.prefix}.`)
  const unused = leafKeys(namespace.messages[DEFAULT_LOCALE]).filter((key) =>
    !dynamicPrefixes.some((prefix) => key.startsWith(prefix))
    && !["'", '"', '`'].some((quote) => corpus.includes(`${quote}${key}${quote}`)))
  check(`usage: every key of ${namespace.name} is used`, unused.length === 0, `unused: ${unused.join(', ')}`)
}

// --- 4. Source scan ---------------------------------------------------------------
// A hit is an inline language branch for text, or text kept per language in
// code (a `labelFi` field, a `.fi` read, a map indexed by the locale, an
// English-to-Finnish string map). Comment lines are skipped. The patterns
// marked `code` run on the line with the insides of its string literals
// blanked, so a domain such as 'example.fi' in a string is not a hit.
const SCAN_PATTERNS = [
  { name: 'isFinnish ?', re: /\bisFinnish\s*\?(?![.?])/g },
  { name: "=== 'fi' ?", re: /[!=]==\s*['"]fi['"]\s*\)?\s*\?(?![.?])/g },
  { name: "if (x === 'fi')", re: /\bif\s*\(\s*[\w.]+\s*[!=]==\s*['"]fi['"]\s*\)/g },
  { name: 'fi: map', re: /(?:^|[\s{,])fi\s*:\s*['"`[{]/g },
  { name: 'xFi field', re: /\b[a-z][\w$]*Fi\b/g, code: true },
  { name: '.fi read', re: /[\w$]+(?:\??\.[\w$]+)*\??\.fi\b/g, code: true },
  { name: '[locale] index', re: /(?:[\w$\])]|\?\.)\[\s*(?:[\w$]+\.)*(?:locale|cvLocale|uiLocale|lang|language|resolvedLocale|appLocale)\s*\]/g, code: true },
  { name: "'English': 'Finnish' map", re: /^\s*(['"])[^'"]*\s[^'"]*\1\s*:\s*['"]/g },
]
// The condition at the end of a line, the `?` starting the next one.
const LINE_END_PATTERNS = [
  { name: 'isFinnish ⏎ ?', re: /\bisFinnish\s*\)?\s*$/ },
  { name: "=== 'fi' ⏎ ?", re: /[!=]==\s*['"]fi['"]\s*\)?\s*$/ },
]

// The line with every character inside a '…', "…" or `…` literal turned
// into a space, so indexes still line up with the original line.
function blankStrings(line) {
  return line.replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g, (match, quote, inner) => `${quote}${' '.repeat(inner.length)}${quote}`)
}

// Each hit carries `window`: the line from the start of the match onward
// (for a line-end hit, plus the next line), which is what a pattern entry
// in ALLOWLIST is tested against, anchored at the hit. A logic branch on
// the same line as a text branch then can't absorb the text one's hit.
function scanSource(text) {
  const hits = []
  const lines = text.split('\n')
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return
    const code = blankStrings(line)
    for (const { name, re, code: onCode } of SCAN_PATTERNS) {
      for (const match of (onCode ? code : line).matchAll(re)) {
        hits.push({ line: index + 1, text: trimmed, pattern: name, window: line.slice(match.index) })
      }
    }
    const next = lines.slice(index + 1).find((candidate) => candidate.trim() !== '')
    if (next && /^\?(?![.?])/.test(next.trim())) {
      for (const { name, re } of LINE_END_PATTERNS) {
        const match = line.match(re)
        if (match) hits.push({ line: index + 1, text: trimmed, pattern: name, window: `${line.slice(match.index)} ${next.trim()}` })
      }
    }
  })
  return hits
}

same('scan: isFinnish ?', scanSource("const a = isFinnish ? 'Kyllä' : 'Yes'").length, 1)
same('scan: two on a line', scanSource("x(isFinnish ? 'a' : 'b', isFinnish ? 'c' : 'd')").length, 2)
same('scan: isFinnish at line end', scanSource("const a = isFinnish\n  ? 'Kyllä'\n  : 'Yes'").length, 1)
same('scan: (isFinnish at line end', scanSource("{(isFinnish\n  ? 'Kyllä'\n  : 'Yes')}").length, 1)
same('scan: other locale names', ["cvLocale === 'fi' ? 1 : 2", "uiLocale === 'fi' ? 1 : 2", "lang === \"fi\" ? 1 : 2", "(locale === 'fi') ? 1 : 2"].map((s) => scanSource(s).length), [1, 1, 1, 1])
same('scan: === fi at line end', scanSource("const a = cvLocale === 'fi'\n  ? 'x'\n  : 'y'").length, 1)
same('scan: if returning copy', scanSource("if (locale === 'fi') {\n  return { a: 'x' }\n}").length, 1)
same('scan: fi maps', ["{ en: 'Yes', fi: 'Kyllä' }", 'fi: `x`', 'fi: [', '  fi: {'].map((s) => scanSource(s).length), [1, 1, 1, 1])
same('scan: Fi fields', ["  labelFi: 'Nimi',", 'const t = field.titleFi', "hintFi ? a : b"].map((s) => scanSource(s).length), [1, 1, 1])
same('scan: .fi reads', ['const c = COPY.fi', 'x(copy?.fi.title)', 'map.fi[id]'].map((s) => scanSource(s).length), [1, 1, 1])
same('scan: locale-indexed maps', ['label[lang]', 'COPY[locale].title', 'x[ cvLocale ]', 'EXAMPLES[id].role[uiLocale]', 'a[options.locale]', 'PAGE_COPY[id]?.[resolvedLocale]'].map((s) => scanSource(s).length), [1, 1, 1, 1, 1, 1])
same('scan: English-to-Finnish map', scanSource("    'Could not read the file.': 'Tiedostoa ei voitu lukea.',").length, 1)
same('scan: not a hit', ["const isFinnish = locale === 'fi'", 'a ?? isFinnish', "// isFinnish ? 'a' : 'b'", 'isFinnish && x', "wifi: 'x'", "url: 'https://example.fi/x'", "const ROUTES_FI = {}", "x[localeIndex]", "{ id: 'a', label: 'b' }", "const Fi = 1", '}, [locale])', 'useMemo(() => f(lang), [lang])', 'return [locale]'].map((s) => scanSource(s).length), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
same('scan: window starts at the hit', scanSource("f(lang === 'fi' ? 'fi' : 'en', isFinnish ? 'Kyllä' : 'Yes')").map((hit) => hit.window.slice(0, 9)).sort(), ["=== 'fi' ", 'isFinnish'])

// Branches that stay (out of scope, or logic rather than text):
// { file, reason } covers every hit in that file; { pattern, reason } the
// hits whose line matches it, in any file (or only in `file` when given).
// The first matching entry takes the hit, so file entries come first. Each
// entry must still match a hit, so a stale one fails.
const ALLOWLIST = [
  // Out of scope for 1.7.13 (route metadata, content data, registry labels).
  { file: 'src/utils/pageMeta.js', reason: 'route metadata: titleFi/descriptionFi/pathFi/ogImageFi per route (out of scope)' },
  { file: 'src/utils/routes.js', reason: 'route table: per-language paths (ROUTES_FI), route metadata stays per language' },
  { file: 'src/utils/templatePageCopy.js', reason: 'per-template page copy, content data kept as { en, fi } (out of scope)' },
  { file: 'src/utils/landingFaq.js', reason: 'landing FAQ data, also feeds JSON-LD (out of scope)' },
  { file: 'src/utils/exampleCvs.js', reason: 'example CV registry: which language file to load (out of scope)' },
  { file: 'src/utils/templateVariants.js', reason: 'registry label maps { en, fi }, read as .label.en by checks and e2e' },
  { file: 'src/utils/templateAccents.js', reason: 'registry label maps { en, fi }, read as .label.en by checks and e2e' },
  { file: 'src/utils/templateFields.js', reason: 'registry label maps { en, fi }, read as .label.en by checks and e2e' },
  { file: 'src/utils/cvHeadingColors.js', reason: 'registry label maps { en, fi }, read as .label.en by checks and e2e' },
  { file: 'src/utils/cvTemplates.js', reason: 'template registry: labels/descriptions per language (templateLocalization) and the gate that applies them' },
  { file: 'src/components/LocaleFlagIcon.jsx', reason: 'logic: draws the Finnish or British flag SVG, no text' },
  { file: 'src/components/templates/shared.jsx', pattern: /^isFinnish\s*\?\s*\{\s*languages:\s*\//, reason: 'logic: parseSkillCategories matches skills with per-language regexes (its labels are in the cv namespace)' },
  // Logic, not text, in any file: the hit's own ternary (up to its first
  // `?`, so a pattern can't reach a later branch on the line) picks a
  // locale code, a formatting locale or an address.
  { pattern: /^[^?]*\?\s*['"]fi['"]\s*:\s*['"]en['"]/, reason: "logic: normalises a locale to the code 'fi' or 'en'" },
  { pattern: /^[^?]*\?\s*['"]fi-FI['"]\s*:\s*['"]en-(GB|US)['"]/, reason: 'logic: date/number formatting locale for Intl' },
  { pattern: /^[^?]*\?\s*['"]fi_FI['"]\s*:\s*['"]en_US['"]/, reason: 'logic: og:locale value' },
  { pattern: /^[^?]*\?\s*(?:ROUTES_FI\.|alternates\.fi\b|['"]\/fi['"]|localizePath\(ROUTES\.\w+,\s*['"]fi['"]\))/, reason: 'logic: picks the Finnish or English address' },
]

// Files whose text is still inline and will move in a later task of the
// 1.7.13 migration. Each task removes its files; the last one empties and
// deletes this list.
const MIGRATION_PENDING = new Set([
  'src/App.jsx',
  'src/components/AppErrorBoundary.jsx',
  'src/components/ApplicationViewModal.jsx',
  'src/components/AtsCheckModal.jsx',
  'src/components/ATSScorePanel.jsx',
  'src/components/BadgeModal.jsx',
  'src/components/CoverLetterModal.jsx',
  'src/components/CvFontSwitcher.jsx',
  'src/components/CVForm.jsx',
  'src/components/CvHeadingColorSwitcher.jsx',
  'src/components/CvStyleSwitcher.jsx',
  'src/components/CVSuggestionsPanel.jsx',
  'src/components/DirectEditPreview.jsx',
  'src/components/EditableList.jsx',
  'src/components/EntryBadge.jsx',
  'src/components/fields/BulletIdeas.jsx',
  'src/components/fields/ReorderableListInput.jsx',
  'src/components/fields/TagsInput.jsx',
  'src/components/GuideLayout.jsx',
  'src/components/ImportCvModal.jsx',
  'src/components/LandingTemplatesByField.jsx',
  'src/components/LeaveConfirmDialog.jsx',
  'src/components/MarkAppliedModal.jsx',
  'src/components/NavRail.jsx',
  'src/components/PdfParserView.jsx',
  'src/components/PdfPreviewModal.jsx',
  'src/components/pdfPreviewOptions.js',
  'src/components/SavedCvsModal.jsx',
  'src/components/SectionEditorPopup.jsx',
  'src/components/SectionEditOverlay.jsx',
  'src/components/SectionsMenu.jsx',
  'src/components/StyleSwatchGroup.jsx',
  'src/components/SettingsModal.jsx',
  'src/components/TemplateFieldFilter.jsx',
  'src/components/TemplateGalleryModal.jsx',
  'src/components/Toolbar.jsx',
  'src/hooks/useApplications.js',
  'src/hooks/useCvLibrary.js',
  'src/hooks/useCvSafekeeping.js',
  'src/pages/AboutPage.jsx',
  'src/pages/AtsFriendlyCvGuidePage.jsx',
  'src/pages/CoverLetterExamplesPage.jsx',
  'src/pages/CvExamplesHubPage.jsx',
  'src/pages/CvSkillsExamplesPage.jsx',
  'src/pages/CybersecurityCvExamplesPage.jsx',
  'src/pages/DeveloperCvExamplesPage.jsx',
  'src/pages/FinnishCvExamplesPage.jsx',
  'src/pages/FreeCvTemplatesPage.jsx',
  'src/pages/HowToUseTheBuilderPage.jsx',
  'src/pages/HowToWriteACvPage.jsx',
  'src/pages/ItCvExamplesPage.jsx',
  'src/pages/LandingPage.jsx',
  'src/pages/PrivacyPolicyPage.jsx',
  'src/pages/ResumeBuilderPage.jsx',
  'src/pages/SharedCvPage.jsx',
  'src/pages/TemplateDetailPage.jsx',
  'src/utils/atsScore.js',
  'src/utils/badge.js',
  'src/utils/cvFeedback.js',
  'src/utils/cvLibrary.js',
  'src/utils/cvTextImport.js',
  'src/utils/profilePhoto.js',
  'src/utils/sectionSchema.js',
])

const allowlistEntry = (file, hit) => ALLOWLIST.find((candidate) => (!candidate.file || candidate.file === file)
  && (!candidate.pattern || candidate.pattern.test(hit.window)))
same('allowlist: a logic branch does not absorb a text branch on its line',
  scanSource("f(lang === 'fi' ? 'fi' : 'en', isFinnish ? 'Kyllä' : 'Yes')").map((hit) => Boolean(allowlistEntry('src/x.js', hit))).sort(), [false, true])
same('allowlist: nor one before it',
  scanSource("f(isFinnish ? 'Kyllä' : 'Yes', lang === 'fi' ? 'fi' : 'en')").map((hit) => Boolean(allowlistEntry('src/x.js', hit))).sort(), [false, true])

const allowlistUse = new Map(ALLOWLIST.map((entry) => [entry, 0]))
const pendingHits = new Map()
const unexpected = []
let allowlistedHits = 0
for (const [file, text] of sources) {
  for (const hit of scanSource(text)) {
    const entry = allowlistEntry(file, hit)
    if (entry) {
      allowlistUse.set(entry, allowlistUse.get(entry) + 1)
      allowlistedHits += 1
    } else if (MIGRATION_PENDING.has(file)) {
      pendingHits.set(file, (pendingHits.get(file) ?? 0) + 1)
    } else {
      unexpected.push(`${file}:${hit.line}  [${hit.pattern}]  ${hit.text.slice(0, 120)}`)
    }
  }
}
check('scan: no inline language branch outside the allowlist and pending files', unexpected.length === 0,
  `${unexpected.length} hit(s):\n        ${unexpected.join('\n        ')}`)
const staleAllowlist = [...allowlistUse].filter(([, count]) => count === 0).map(([entry]) => `${entry.file}${entry.pattern ? ` ${entry.pattern}` : ''}`)
check('scan: every ALLOWLIST entry still matches a hit', staleAllowlist.length === 0, `stale: ${staleAllowlist.join(', ')}`)
const clearedPending = [...MIGRATION_PENDING].filter((file) => !pendingHits.has(file))
check('scan: every MIGRATION_PENDING file still has a hit (remove the cleared ones)', clearedPending.length === 0, `cleared: ${clearedPending.join(', ')}`)
if (process.argv.includes('--list')) {
  for (const [file, count] of [...pendingHits].sort()) console.log(`      ${String(count).padStart(4)}  ${file}`)
}
const pendingTotal = [...pendingHits.values()].reduce((sum, count) => sum + count, 0)
console.log(`      scan: ${MIGRATION_PENDING.size} file(s) pending migration with ${pendingTotal} hit(s); ${allowlistedHits} allowlisted hit(s) (--list for per-file counts)`)

// --- 5. Plural cases -------------------------------------------------------------
// { ns, key, locale, count, expected, vars? }: the exact text the inline pair
// produced for that count before it moved. Added by each migration task.
const pluralCases = [
]
for (const { ns: name, key, locale, count, expected, vars = {} } of pluralCases) {
  const owner = namespaces.get(name)
  same(`plural ${name}:${key} ${locale} ${count}`, owner ? owner.namespace.t(locale, key, { ...vars, count }) : `(no namespace ${name})`, expected)
}

if (failures > 0) {
  console.error(`\n${failures} i18n check(s) failed.`)
  // exitCode, not exit(): exit() can cut off a long report written to a pipe.
  process.exitCode = 1
} else {
  console.log('\nAll i18n checks passed.')
}
