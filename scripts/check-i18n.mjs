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
//    `locale === 'fi' ? …`, `{ en: …, fi: … }`) outside ALLOWLIST.
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
same('locales', [LOCALES, DEFAULT_LOCALE], [['en', 'fi', 'sv'], 'en'])
same('normalizeLocale', ['en', 'fi', 'sv', 'de', undefined, 'fi-FI'].map(normalizeLocale), ['en', 'fi', 'sv', 'en', 'en', 'en'])

// Namespaces below that only have English and Finnish say so.
const EN_FI = { locales: ['en', 'fi'] }

const ns = createNamespace('test', {
  en: { a: 'Save', g: 'Hi {name}', p: { one: '{count} page', other: '{count} pages' }, f: (v) => `${v.n} min`, r: 'Read the <0>guide</0>.' },
  fi: { a: 'Tallenna', g: 'Hei {name}', p: { one: '{count} sivu', other: '{count} sivua' }, f: (v) => `${v.n} min`, r: 'Lue <0>opas</0>.' },
}, EN_FI)
same('plain', ns.t('fi', 'a'), 'Tallenna')
same('a language the namespace lacks falls back to en', ns.t('sv', 'a'), 'Save')
same('unknown locale falls back to en', ns.t('de', 'a'), 'Save')
same('placeholder', ns.t('en', 'g', { name: 'Ada' }), 'Hi Ada')
same('missing var stays', ns.t('en', 'g'), 'Hi {name}')
same('plural 0/1/2 en', [0, 1, 2].map((count) => ns.t('en', 'p', { count })), ['0 pages', '1 page', '2 pages'])
same('plural 0/1/2 fi', [0, 1, 2].map((count) => ns.t('fi', 'p', { count })), ['0 sivua', '1 sivu', '2 sivua'])
same('function value', ns.t('en', 'f', { n: 5 }), '5 min')
same('missing key returns the key', ns.t('en', 'nope'), 'nope')
same('copy', ns.copy('fi').a, 'Tallenna')
same('copy of a missing language is the English object', ns.copy('sv'), ns.messages.en)
same('rich tags are left for <T>', ns.t('fi', 'r'), 'Lue <0>opas</0>.')
same('a key missing in fi falls back to en', createNamespace('fb', { en: { x: { y: 'Yes' } }, fi: { x: {} } }, EN_FI).t('fi', 'x.y'), 'Yes')
same('namespace shape', [ns.name, ns.kind, createNamespace('pg', { en: {}, fi: {} }, { kind: 'page', locales: ['en', 'fi'] }).kind], ['test', 'strings', 'page'])
// parity detector on a broken pair
check('parity passes a good pair', parityErrors(ns).length === 0, parityErrors(ns).join('; '))
check('parity flags a missing key', parityErrors(createNamespace('bad', { en: { a: 'x', b: 'y' }, fi: { a: 'x' } }, EN_FI)).length === 1)
check('parity flags a placeholder mismatch', parityErrors(createNamespace('bad2', { en: { a: '{n} x' }, fi: { a: 'x' } }, EN_FI)).length === 1)
check('parity flags a tag mismatch', parityErrors(createNamespace('bad3', { en: { a: '<0>x</0>' }, fi: { a: 'x' } }, EN_FI)).length === 1)
check('parity flags an array length', parityErrors(createNamespace('bad4', { en: { a: ['x', 'y'] }, fi: { a: ['x'] } }, EN_FI)).length === 1)
check('parity flags a function on one side', parityErrors(createNamespace('bad5', { en: { a: () => 'x' }, fi: { a: 'x' } }, EN_FI)).length === 1)
check('parity flags a plural without other', parityErrors(createNamespace('bad6', { en: { a: { one: 'x', other: 'y' } }, fi: { a: { one: 'x' } } }, EN_FI)).length === 1)
check('parity flags a missing language', parityErrors(createNamespace('bad7', { en: { a: 'x' } }, EN_FI)).length === 1)
same('a namespace without sv: parity is clean, t and copy use English', [parityErrors(createNamespace('two', { en: { a: 'x' }, fi: { a: 'y' } }, EN_FI)).length, createNamespace('two', { en: { a: 'x' }, fi: { a: 'y' } }, EN_FI).t('sv', 'a')], [0, 'x'])
check('parity flags a missing sv', parityErrors(createNamespace('bad8', { en: { a: 'x' }, fi: { a: 'y' } })).join() === 'bad8: no sv messages')
check('a plural value is recognised', isPluralValue({ one: 'a', other: 'b' }) && !isPluralValue({ title: 'a' }) && !isPluralValue({}))

// --- Namespaces -----------------------------------------------------------------
// Every index.js under src/i18n/ except the module's own (src/i18n/<ns>/index.js,
// and nested page namespaces such as src/i18n/pages/<page>/index.js).
const namespaceFiles = walkFiles(i18nDir, (path) => path.endsWith(`${sep}index.js`) && path !== resolvePath(i18nDir, 'index.js'))
const namespaces = new Map()
const namespaceByExport = new Map() // `${repo path}#${export name}` -> namespace
for (const file of namespaceFiles) {
  const moduleExports = await importFile(file)
  for (const [exportName, value] of Object.entries(moduleExports)) {
    if (value && typeof value.t === 'function' && value.messages) namespaceByExport.set(`${toRepoPath(file)}#${exportName}`, value)
  }
  const exported = Object.values(moduleExports).filter((value) => value && typeof value.t === 'function' && value.messages)
  check(`${toRepoPath(file)} exports a namespace`, exported.length > 0)
  for (const namespace of exported) {
    check(`namespace "${namespace.name}" is defined once`, !namespaces.has(namespace.name), `also in ${namespaces.get(namespace.name)?.file}`)
    namespaces.set(namespace.name, { namespace, file: toRepoPath(file) })
  }
}
console.log(`      ${namespaces.size} namespace(s)`)

// --- 2. Parity ------------------------------------------------------------------
// Namespaces whose sv.js is not written yet (1.7.14). Tasks 4-6 remove each
// one as it gets Swedish; Task 7 deletes this list.
const SWEDISH_PENDING = []
// Content pages have no Swedish address, so their namespaces stay en/fi.
const CONTENT_ONLY_NAMESPACES = [
  'pages/about', 'pages/atsGuide', 'pages/coverLetterExamples', 'pages/cvExamples', 'pages/cvSkills',
  'pages/cybersecurityCv', 'pages/developerCv', 'pages/finnishCv', 'pages/freeTemplates', 'pages/guideLayout',
  'pages/howToUse', 'pages/howToWrite', 'pages/itCv', 'pages/landing', 'pages/privacy', 'pages/templateDetail',
] // reason: content pages have no Swedish address yet (1.7.14)
const partial = [...namespaces.values()].filter(({ namespace }) => namespace.locales.length < LOCALES.length).map(({ namespace }) => namespace.name)
const notListed = partial.filter((name) => !CONTENT_ONLY_NAMESPACES.includes(name))
check('namespaces lacking a language are in CONTENT_ONLY_NAMESPACES', notListed.length === 0, `not listed: ${notListed.join(', ')}`)
const staleContentOnly = CONTENT_ONLY_NAMESPACES.filter((name) => !partial.includes(name))
check('every CONTENT_ONLY_NAMESPACES entry still lacks a language', staleContentOnly.length === 0, `stale: ${staleContentOnly.join(', ')}`)
const stalePending = SWEDISH_PENDING.filter((name) => !namespaces.has(name) || namespaces.get(name).namespace.locales.includes('sv') === false)
check('every SWEDISH_PENDING entry is a namespace that takes sv', stalePending.length === 0, `stale: ${stalePending.join(', ')}`)
console.log(`      Swedish pending: ${SWEDISH_PENDING.join(', ') || '(none)'}`)
for (const { namespace } of namespaces.values()) {
  const checked = SWEDISH_PENDING.includes(namespace.name)
    ? { ...namespace, locales: namespace.locales.filter((locale) => locale !== 'sv') }
    : namespace
  const errors = parityErrors(checked)
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

// --- 3b. Missing keys --------------------------------------------------------------
// The reverse of the usage check: `translate()` returns the key itself when no
// language has it, so a mistyped key would show as "toolbar.svae" on screen.
// For each file, the namespaces it imports are found from its import lines;
// every literal key passed to `ns.t(locale, 'key')`, or to a local `t('key')`
// / `tx('key')` wrapper, must resolve in the en messages of one of them (as a
// leaf, or as a prefix of one, for a key naming a group). Keys built at run
// time are not literals and stay covered by DYNAMIC_KEYS.
function keyPaths(namespace) {
  const paths = new Set()
  for (const leaf of leafKeys(namespace.messages[DEFAULT_LOCALE])) {
    const parts = leaf.split('.')
    for (let i = 1; i <= parts.length; i += 1) paths.add(parts.slice(0, i).join('.'))
  }
  return paths
}
const keyPathCache = new Map()
const pathsOf = (namespace) => {
  if (!keyPathCache.has(namespace)) keyPathCache.set(namespace, keyPaths(namespace))
  return keyPathCache.get(namespace)
}

// Resolve an i18n import specifier written in `fromFile` (a repo path) to
// the namespace file's repo path.
function resolveNamespaceFile(fromFile, specifier) {
  const target = toRepoPath(resolvePath(dirname(resolvePath(rootDir, fromFile)), specifier))
  return [target, `${target}.js`, `${target}/index.js`].find((candidate) => namespaceFiles.some((file) => toRepoPath(file) === candidate)) ?? null
}

// Returns the missing literal keys of one source file, as { line, key, via }.
function missingKeysIn(file, text, lookupNamespaceByExport, resolveFile = resolveNamespaceFile) {
  const bound = new Map() // local name -> namespace
  for (const match of text.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]*\bi18n\/[^'"]*)['"]/g)) {
    const target = resolveFile(file, match[2])
    if (!target) continue
    for (const part of match[1].split(',')) {
      const [exportName, localName = exportName] = part.trim().split(/\s+as\s+/)
      const namespace = lookupNamespaceByExport(target, exportName)
      if (namespace) bound.set(localName, namespace)
    }
  }
  if (bound.size === 0) return []
  const all = [...bound.values()]
  const missing = []
  const lines = text.split('\n')
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return
    for (const match of line.matchAll(/\b([A-Za-z_$][\w$]*)\.t\(\s*[\w$.?]+\s*,\s*(['"`])([\w.-]+)\2/g)) {
      const namespace = bound.get(match[1])
      if (namespace && !pathsOf(namespace).has(match[3])) missing.push({ line: index + 1, key: match[3], via: namespace.name })
    }
    for (const match of line.matchAll(/(?<![\w$.])(?:t|tx)\(\s*(['"`])([\w.-]+)\1/g)) {
      if (!all.some((namespace) => pathsOf(namespace).has(match[2]))) missing.push({ line: index + 1, key: match[2], via: all.map((namespace) => namespace.name).join('/') })
    }
  })
  return missing
}

// Self-test on a fake namespace and file.
{
  const fake = createNamespace('fake', { en: { toolbar: { save: 'Save' } }, fi: { toolbar: { save: 'Tallenna' } } })
  const lookup = (target, exportName) => (target === 'src/i18n/fake/index.js' && exportName === 'fake' ? fake : null)
  const probe = (code) => missingKeysIn('src/components/X.jsx', `import { fake } from '../i18n/fake/index.js'\n${code}`, lookup, () => 'src/i18n/fake/index.js').map((m) => m.key)
  const okSource = "const a = fake.t(locale, 'toolbar.save')\nconst t = (key) => fake.t(locale, key)\nt('toolbar.save')\nt('toolbar')"
  same('missing keys: a present key passes', probe(okSource), [])
  same('missing keys: ns.t with a mistyped key', probe("fake.t(locale, 'toolbar.svae')"), ['toolbar.svae'])
  same('missing keys: local t with a mistyped key', probe("t('toolbar.svae')"), ['toolbar.svae'])
  same('missing keys: tx wrapper', probe("tx('nope')"), ['nope'])
  same('missing keys: a runtime key is not a literal', probe('fake.t(locale, `toolbar.${id}`)'), [])
  same('missing keys: a file without an i18n import is skipped', missingKeysIn('src/x.js', "t('nope')", lookup, () => 'src/i18n/fake/index.js'), [])
}

const missingKeys = []
for (const [file, text] of sources) {
  const lookup = (target, exportName) => namespaceByExport.get(`${target}#${exportName}`) ?? null
  for (const miss of missingKeysIn(file, text, lookup)) missingKeys.push(`${file}:${miss.line}  '${miss.key}' not in ${miss.via}`)
}
check('missing keys: every literal key exists in its namespace', missingKeys.length === 0, `${missingKeys.length} key(s):\n        ${missingKeys.join('\n        ')}`)

// --- 4. Source scan ---------------------------------------------------------------
// A hit is an inline language branch for text, or text kept per language in
// code (a `labelFi` field, a `.fi` read, a map indexed by the locale, an
// English-to-Finnish string map). Comment lines are skipped. The patterns
// marked `code` run on the line with the insides of its string literals
// blanked, so a domain such as 'example.fi' in a string is not a hit.
const SCAN_PATTERNS = [
  { name: 'isFinnish ?', re: /\bisFinnish\s*\?(?![.?])/g },
  { name: "=== 'fi' ?", re: /[!=]==\s*['"]fi['"]\s*\)?\s*\?(?![.?])/g },
  { name: "=== 'en' ?", re: /[!=]==\s*['"]en['"]\s*\)?\s*\?(?![.?])/g },
  { name: "if (x === 'fi')", re: /\bif\s*\(\s*[\w.]+\s*[!=]==\s*['"]fi['"]\s*\)/g },
  { name: 'isSwedish ?', re: /\bisSwedish\s*\?(?![.?])/g },
  { name: "=== 'sv' ?", re: /[!=]==\s*['"]sv['"]\s*\)?\s*\?(?![.?])/g },
  { name: "if (x === 'sv')", re: /\bif\s*\(\s*[\w.]+\s*[!=]==\s*['"]sv['"]\s*\)/g },
  { name: 'sv: map', re: /(?:^|[\s{,])sv\s*:\s*['"`[{]/g },
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
  { name: 'isSwedish ⏎ ?', re: /\bisSwedish\s*\)?\s*$/ },
  { name: "=== 'sv' ⏎ ?", re: /[!=]==\s*['"]sv['"]\s*\)?\s*$/ },
  { name: "=== 'en' ⏎ ?", re: /[!=]==\s*['"]en['"]\s*\)?\s*$/ },
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

same('scan: sv branches', ["locale === 'sv' ? 'Ja' : 'Yes'", "isSwedish ? 'Ja' : 'Yes'", "{ en: 'Yes', sv: 'Ja' }"].map((s) => scanSource(s).length), [1, 1, 1])
same('scan: sv at line end and if', [scanSource("const a = locale === 'sv'\n  ? 'Ja'\n  : 'Yes'").length, scanSource("if (locale === 'sv') {\n  x()\n}").length], [1, 1])
same('scan: isFinnish ?', scanSource("const a = isFinnish ? 'Kyllä' : 'Yes'").length, 1)
same('scan: two on a line', scanSource("x(isFinnish ? 'a' : 'b', isFinnish ? 'c' : 'd')").length, 2)
same('scan: isFinnish at line end', scanSource("const a = isFinnish\n  ? 'Kyllä'\n  : 'Yes'").length, 1)
same('scan: (isFinnish at line end', scanSource("{(isFinnish\n  ? 'Kyllä'\n  : 'Yes')}").length, 1)
same('scan: other locale names', ["cvLocale === 'fi' ? 1 : 2", "uiLocale === 'fi' ? 1 : 2", "lang === \"fi\" ? 1 : 2", "(locale === 'fi') ? 1 : 2"].map((s) => scanSource(s).length), [1, 1, 1, 1])
same('scan: === fi at line end', scanSource("const a = cvLocale === 'fi'\n  ? 'x'\n  : 'y'").length, 1)
same('scan: === en ?', ["locale === 'en' ? 'Yes' : 'Kyllä'", "locale !== 'en' ? 'Kyllä' : 'Yes'", "(cvLocale === 'en') ? 1 : 2"].map((s) => scanSource(s).length), [1, 1, 1])
same('scan: === en at line end', scanSource("const a = locale === 'en'\n  ? 'Yes'\n  : 'Kyllä'").length, 1)
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
  { file: 'src/utils/templateVariants.js', reason: 'registry label maps { en, fi, sv }, read as .label.en by checks and e2e' },
  { file: 'src/utils/templateAccents.js', reason: 'registry label maps { en, fi, sv }, read as .label.en by checks and e2e' },
  { file: 'src/utils/templateFields.js', reason: 'registry label maps { en, fi, sv }, read as .label.en by checks and e2e' },
  { file: 'src/utils/cvHeadingColors.js', reason: 'registry label maps { en, fi, sv }, read as .label.en by checks and e2e' },
  { file: 'src/utils/cvTemplates.js', reason: 'template registry: labels/descriptions per language (templateLocalization) and the gate that applies them' },
  { file: 'src/components/LocaleFlagIcon.jsx', reason: 'logic: draws the Finnish, Swedish or British flag SVG, no text' },
  { file: 'src/components/templates/shared.jsx', pattern: /^\s?(?:fi|sv): \{ languages: \/|^S\[locale\] \?\? SKILL_CATEGORY_PATTERNS\.en$/, reason: 'logic: parseSkillCategories matches skills with per-language regexes, SKILL_CATEGORY_PATTERNS (its labels are in the cv namespace)' },
  // Registry label maps read in the builder (the registries stay, see above).
  { file: 'src/components/CvHeadingColorSwitcher.jsx', pattern: /^l\[locale\] \?\? (?:activePreset|preset)\.label\.en\b/, reason: "reads cvHeadingColors.js's preset label map { en, fi, sv }" },
  { file: 'src/components/CvStyleSwitcher.jsx', pattern: /^l\[locale\] \?\? label\.en$/, reason: "reads templateVariants.js's variant label map { en, fi, sv }" },
  { file: 'src/components/StyleSwatchGroup.jsx', pattern: /^l\[locale\] \?\? label\.en$/, reason: "reads templateVariants.js's variant label map { en, fi, sv }" },
  { file: 'src/components/SettingsModal.jsx', pattern: /^l\[locale\] \?\? swatch\.label\.en\b/, reason: "reads templateAccents.js's swatch label map { en, fi, sv }" },
  { file: 'src/components/TemplateFieldFilter.jsx', pattern: /^l\[locale\] \?\? label\.en$/, reason: "reads templateFields.js's field label map { en, fi, sv } (ALL_FIELDS_LABEL included)" },
  { file: 'src/components/LandingTemplatesByField.jsx', pattern: /^l\[lang\]$/, reason: "reads templateVariants.js's variant label map { en, fi } (the card's look name)" },
  { file: 'src/pages/TemplateDetailPage.jsx', pattern: /^\?\.\[resolvedLocale\]$/, reason: "reads templatePageCopy.js's per-template copy { en, fi } (out of scope)" },
  // Logic in one file: the guide pages' updated date, a different Intl
  // locale and date style per language.
  { file: 'src/components/GuideLayout.jsx', pattern: /^=== 'fi' \? parsed\.toLocaleDateString\('fi-FI', /, reason: 'logic: date formatting locale and options for Intl' },
  // Logic, not text, in any file: the hit's own ternary (up to its first
  // `?`, so a pattern can't reach a later branch on the line) picks a
  // locale code, a formatting locale or an address.
  { pattern: /^[^?]*\?\s*['"]fi['"]\s*:\s*['"]en['"]/, reason: "logic: normalises a locale to the code 'fi' or 'en'" },
  { pattern: /^[^?]*\?\s*['"]en['"]\s*:\s*['"]fi['"]/, reason: 'logic: the other locale, for a language switch' },
  { file: 'src/App.jsx', pattern: /^\W?\s*(?:fi|sv): '(?:fi_FI|sv_SE)'/, reason: 'logic: og:locale value per language (OG_LOCALES)' },
  { pattern: /^[^?]*\?\s*(?:ROUTES_FI\.|alternates\.fi\b|['"]\/fi['"]|localizePath\(ROUTES\.\w+,\s*['"]fi['"]\))/, reason: 'logic: picks the Finnish or English address' },
]

const allowlistEntry = (file, hit) => ALLOWLIST.find((candidate) => (!candidate.file || candidate.file === file)
  && (!candidate.pattern || candidate.pattern.test(hit.window)))
same('allowlist: a logic branch does not absorb a text branch on its line',
  scanSource("f(lang === 'fi' ? 'fi' : 'en', isFinnish ? 'Kyllä' : 'Yes')").map((hit) => Boolean(allowlistEntry('src/x.js', hit))).sort(), [false, true])
same('allowlist: nor one before it',
  scanSource("f(isFinnish ? 'Kyllä' : 'Yes', lang === 'fi' ? 'fi' : 'en')").map((hit) => Boolean(allowlistEntry('src/x.js', hit))).sort(), [false, true])

const allowlistUse = new Map(ALLOWLIST.map((entry) => [entry, 0]))
const unexpected = []
let allowlistedHits = 0
for (const [file, text] of sources) {
  for (const hit of scanSource(text)) {
    const entry = allowlistEntry(file, hit)
    if (entry) {
      allowlistUse.set(entry, allowlistUse.get(entry) + 1)
      allowlistedHits += 1
    } else {
      unexpected.push(`${file}:${hit.line}  [${hit.pattern}]  ${hit.text.slice(0, 120)}`)
    }
  }
}
check('scan: no inline language branch outside the allowlist', unexpected.length === 0,
  `${unexpected.length} hit(s):\n        ${unexpected.join('\n        ')}`)
const staleAllowlist = [...allowlistUse].filter(([, count]) => count === 0).map(([entry]) => `${entry.file}${entry.pattern ? ` ${entry.pattern}` : ''}`)
check('scan: every ALLOWLIST entry still matches a hit', staleAllowlist.length === 0, `stale: ${staleAllowlist.join(', ')}`)
console.log(`      scan: ${allowlistedHits} allowlisted hit(s)`)

// --- 5. Plural cases -------------------------------------------------------------
// { ns, key, locale, count, expected, vars? }: the exact text the inline pair
// produced for that count before it moved. Added by each migration task.
const pluralCases = [
  // Task 4 (builder): the former inline output, built here the way the old
  // code built it (count === 1 ? one : other). blankBullets, the tips badge
  // and the saved-CV reminder are never shown for 0 (the caller returns
  // first); their 0 case pins the key's own output.
  { ns: 'builder', key: 'export.blankBullets', locale: 'en', count: 0, expected: ' 0 bullets still hold [__].', vars: { blank: '[__]' } },
  { ns: 'builder', key: 'export.blankBullets', locale: 'fi', count: 0, expected: ' 0 saavutuskohdassa on vielä [__].', vars: { blank: '[__]' } },
  { ns: 'builder', key: 'export.blankBullets', locale: 'en', count: 1, expected: ' 1 bullet still holds [__].', vars: { blank: '[__]' } },
  { ns: 'builder', key: 'export.blankBullets', locale: 'fi', count: 1, expected: ' 1 saavutuskohdassa on vielä [__].', vars: { blank: '[__]' } },
  { ns: 'builder', key: 'export.blankBullets', locale: 'en', count: 2, expected: ' 2 bullets still hold [__].', vars: { blank: '[__]' } },
  { ns: 'builder', key: 'export.blankBullets', locale: 'fi', count: 2, expected: ' 2 saavutuskohdassa on vielä [__].', vars: { blank: '[__]' } },
  { ns: 'builder', key: 'import.counts.jobs', locale: 'en', count: 0, expected: '0 jobs' },
  { ns: 'builder', key: 'import.counts.jobs', locale: 'fi', count: 0, expected: '0 työpaikkaa' },
  { ns: 'builder', key: 'import.counts.jobs', locale: 'en', count: 1, expected: '1 job' },
  { ns: 'builder', key: 'import.counts.jobs', locale: 'fi', count: 1, expected: '1 työpaikka' },
  { ns: 'builder', key: 'import.counts.jobs', locale: 'en', count: 2, expected: '2 jobs' },
  { ns: 'builder', key: 'import.counts.jobs', locale: 'fi', count: 2, expected: '2 työpaikkaa' },
  { ns: 'builder', key: 'import.counts.degrees', locale: 'en', count: 0, expected: '0 degrees' },
  { ns: 'builder', key: 'import.counts.degrees', locale: 'fi', count: 0, expected: '0 tutkintoa' },
  { ns: 'builder', key: 'import.counts.degrees', locale: 'en', count: 1, expected: '1 degree' },
  { ns: 'builder', key: 'import.counts.degrees', locale: 'fi', count: 1, expected: '1 tutkinto' },
  { ns: 'builder', key: 'import.counts.degrees', locale: 'en', count: 2, expected: '2 degrees' },
  { ns: 'builder', key: 'import.counts.degrees', locale: 'fi', count: 2, expected: '2 tutkintoa' },
  { ns: 'builder', key: 'import.counts.skills', locale: 'en', count: 0, expected: '0 skills' },
  { ns: 'builder', key: 'import.counts.skills', locale: 'fi', count: 0, expected: '0 taitoa' },
  { ns: 'builder', key: 'import.counts.skills', locale: 'en', count: 1, expected: '1 skill' },
  { ns: 'builder', key: 'import.counts.skills', locale: 'fi', count: 1, expected: '1 taito' },
  { ns: 'builder', key: 'import.counts.skills', locale: 'en', count: 2, expected: '2 skills' },
  { ns: 'builder', key: 'import.counts.skills', locale: 'fi', count: 2, expected: '2 taitoa' },
  { ns: 'builder', key: 'entryBadge.tips', locale: 'en', count: 0, expected: '0 tips' },
  { ns: 'builder', key: 'entryBadge.tips', locale: 'fi', count: 0, expected: '0 vinkkiä' },
  { ns: 'builder', key: 'entryBadge.tips', locale: 'en', count: 1, expected: '1 tip' },
  { ns: 'builder', key: 'entryBadge.tips', locale: 'fi', count: 1, expected: '1 vinkkiä' },
  { ns: 'builder', key: 'entryBadge.tips', locale: 'en', count: 2, expected: '2 tips' },
  { ns: 'builder', key: 'entryBadge.tips', locale: 'fi', count: 2, expected: '2 vinkkiä' },
  { ns: 'builder', key: 'savedCvs.reminder', locale: 'en', count: 0, expected: 'You have 0 saved CVs. Open them from More actions › My CVs.' },
  { ns: 'builder', key: 'savedCvs.reminder', locale: 'fi', count: 0, expected: 'Sinulla on 0 tallennettua CV:tä. Avaa ne kohdasta Lisää toimintoja › Omat CV:t.' },
  { ns: 'builder', key: 'savedCvs.reminder', locale: 'en', count: 1, expected: 'You have 1 saved CV. Open it from More actions › My CVs.' },
  { ns: 'builder', key: 'savedCvs.reminder', locale: 'fi', count: 1, expected: 'Sinulla on 1 tallennettu CV. Avaa se kohdasta Lisää toimintoja › Omat CV:t.' },
  { ns: 'builder', key: 'savedCvs.reminder', locale: 'en', count: 2, expected: 'You have 2 saved CVs. Open them from More actions › My CVs.' },
  { ns: 'builder', key: 'savedCvs.reminder', locale: 'fi', count: 2, expected: 'Sinulla on 2 tallennettua CV:tä. Avaa ne kohdasta Lisää toimintoja › Omat CV:t.' },
  // Task 5 (form): BulletIdeas' status after an Add (count === 1 ? one :
  // other). The count is items.length + 1, so 0 is never shown; its case
  // pins the key's own output.
  { ns: 'form', key: 'ideas.added', locale: 'en', count: 0, expected: 'Added. This job now has 0 achievements.' },
  { ns: 'form', key: 'ideas.added', locale: 'fi', count: 0, expected: 'Lisätty. Työssä on nyt 0 saavutusta.' },
  { ns: 'form', key: 'ideas.added', locale: 'en', count: 1, expected: 'Added. This job now has 1 achievement.' },
  { ns: 'form', key: 'ideas.added', locale: 'fi', count: 1, expected: 'Lisätty. Työssä on nyt 1 saavutus.' },
  { ns: 'form', key: 'ideas.added', locale: 'en', count: 2, expected: 'Added. This job now has 2 achievements.' },
  { ns: 'form', key: 'ideas.added', locale: 'fi', count: 2, expected: 'Lisätty. Työssä on nyt 2 saavutusta.' },
  // Task 6 (dialogs, feedback). The page summaries (PDF preview, View
  // sent) used count === 1, and are shown only for 1+ pages; their 0 case
  // pins the key's own output. CVSuggestionsPanel's badges used
  // count === 1 and do show 0: exact former output. cvFeedback.js's section
  // badges used count > 1, which for 0 gave '0 warning' / '0 tip', but a
  // badge with 0 items is never made (createSectionBadge returns null and
  // the warning form needs warningCount > 0); their 0 case pins the key's
  // own output ('0 warnings' / '0 tips'). 1 and 2 are the exact former text.
  { ns: 'dialogs', key: 'common.pageSummary', locale: 'en', count: 0, expected: '0 pages · A4', vars: { paper: 'A4' } },
  { ns: 'dialogs', key: 'common.pageSummary', locale: 'fi', count: 0, expected: '0 sivua · A4', vars: { paper: 'A4' } },
  { ns: 'dialogs', key: 'common.pageSummary', locale: 'en', count: 1, expected: '1 page · A4', vars: { paper: 'A4' } },
  { ns: 'dialogs', key: 'common.pageSummary', locale: 'fi', count: 1, expected: '1 sivu · A4', vars: { paper: 'A4' } },
  { ns: 'dialogs', key: 'common.pageSummary', locale: 'en', count: 2, expected: '2 pages · A4', vars: { paper: 'A4' } },
  { ns: 'dialogs', key: 'common.pageSummary', locale: 'fi', count: 2, expected: '2 sivua · A4', vars: { paper: 'A4' } },
  { ns: 'dialogs', key: 'pdfPreview.summaryScaled', locale: 'en', count: 0, expected: '0 pages · A4 · text at 100%', vars: { paper: 'A4', scale: 100 } },
  { ns: 'dialogs', key: 'pdfPreview.summaryScaled', locale: 'fi', count: 0, expected: '0 sivua · A4 · tekstin koko 100 %', vars: { paper: 'A4', scale: 100 } },
  { ns: 'dialogs', key: 'pdfPreview.summaryScaled', locale: 'en', count: 1, expected: '1 page · A4 · text at 100%', vars: { paper: 'A4', scale: 100 } },
  { ns: 'dialogs', key: 'pdfPreview.summaryScaled', locale: 'fi', count: 1, expected: '1 sivu · A4 · tekstin koko 100 %', vars: { paper: 'A4', scale: 100 } },
  { ns: 'dialogs', key: 'pdfPreview.summaryScaled', locale: 'en', count: 2, expected: '2 pages · A4 · text at 100%', vars: { paper: 'A4', scale: 100 } },
  { ns: 'dialogs', key: 'pdfPreview.summaryScaled', locale: 'fi', count: 2, expected: '2 sivua · A4 · tekstin koko 100 %', vars: { paper: 'A4', scale: 100 } },
  { ns: 'feedback', key: 'sectionBadge.warnings', locale: 'en', count: 0, expected: '0 warnings' },
  { ns: 'feedback', key: 'sectionBadge.warnings', locale: 'fi', count: 0, expected: '0 varoitusta' },
  { ns: 'feedback', key: 'sectionBadge.warnings', locale: 'en', count: 1, expected: '1 warning' },
  { ns: 'feedback', key: 'sectionBadge.warnings', locale: 'fi', count: 1, expected: '1 varoitus' },
  { ns: 'feedback', key: 'sectionBadge.warnings', locale: 'en', count: 2, expected: '2 warnings' },
  { ns: 'feedback', key: 'sectionBadge.warnings', locale: 'fi', count: 2, expected: '2 varoitusta' },
  { ns: 'feedback', key: 'sectionBadge.tips', locale: 'en', count: 0, expected: '0 tips' },
  { ns: 'feedback', key: 'sectionBadge.tips', locale: 'fi', count: 0, expected: '0 vinkkiä' },
  { ns: 'feedback', key: 'sectionBadge.tips', locale: 'en', count: 1, expected: '1 tip' },
  { ns: 'feedback', key: 'sectionBadge.tips', locale: 'fi', count: 1, expected: '1 vinkkiä' },
  { ns: 'feedback', key: 'sectionBadge.tips', locale: 'en', count: 2, expected: '2 tips' },
  { ns: 'feedback', key: 'sectionBadge.tips', locale: 'fi', count: 2, expected: '2 vinkkiä' },
  { ns: 'feedback', key: 'suggestions.warnings', locale: 'en', count: 0, expected: '0 warnings' },
  { ns: 'feedback', key: 'suggestions.warnings', locale: 'fi', count: 0, expected: '0 varoitusta' },
  { ns: 'feedback', key: 'suggestions.warnings', locale: 'en', count: 1, expected: '1 warning' },
  { ns: 'feedback', key: 'suggestions.warnings', locale: 'fi', count: 1, expected: '1 varoitus' },
  { ns: 'feedback', key: 'suggestions.warnings', locale: 'en', count: 2, expected: '2 warnings' },
  { ns: 'feedback', key: 'suggestions.warnings', locale: 'fi', count: 2, expected: '2 varoitusta' },
  { ns: 'feedback', key: 'suggestions.metricsHints', locale: 'en', count: 0, expected: '0 metrics hints' },
  { ns: 'feedback', key: 'suggestions.metricsHints', locale: 'fi', count: 0, expected: '0 mittarivinkkiä' },
  { ns: 'feedback', key: 'suggestions.metricsHints', locale: 'en', count: 1, expected: '1 metrics hint' },
  { ns: 'feedback', key: 'suggestions.metricsHints', locale: 'fi', count: 1, expected: '1 mittarivinkki' },
  { ns: 'feedback', key: 'suggestions.metricsHints', locale: 'en', count: 2, expected: '2 metrics hints' },
  { ns: 'feedback', key: 'suggestions.metricsHints', locale: 'fi', count: 2, expected: '2 mittarivinkkiä' },
  // Task 5 (1.7.14, Swedish builder): the sv text for counts 0, 1 and 2.
  // Swedish uses the plural form for 0, as English does.
  { ns: 'builder', key: 'export.blankBullets', locale: 'sv', count: 0, expected: ' 0 punkter innehåller fortfarande [__].', vars: { blank: '[__]' } },
  { ns: 'builder', key: 'export.blankBullets', locale: 'sv', count: 1, expected: ' 1 punkt innehåller fortfarande [__].', vars: { blank: '[__]' } },
  { ns: 'builder', key: 'export.blankBullets', locale: 'sv', count: 2, expected: ' 2 punkter innehåller fortfarande [__].', vars: { blank: '[__]' } },
  { ns: 'builder', key: 'import.counts.jobs', locale: 'sv', count: 0, expected: '0 jobb' },
  { ns: 'builder', key: 'import.counts.jobs', locale: 'sv', count: 1, expected: '1 jobb' },
  { ns: 'builder', key: 'import.counts.jobs', locale: 'sv', count: 2, expected: '2 jobb' },
  { ns: 'builder', key: 'import.counts.degrees', locale: 'sv', count: 0, expected: '0 examina' },
  { ns: 'builder', key: 'import.counts.degrees', locale: 'sv', count: 1, expected: '1 examen' },
  { ns: 'builder', key: 'import.counts.degrees', locale: 'sv', count: 2, expected: '2 examina' },
  { ns: 'builder', key: 'import.counts.skills', locale: 'sv', count: 0, expected: '0 kompetenser' },
  { ns: 'builder', key: 'import.counts.skills', locale: 'sv', count: 1, expected: '1 kompetens' },
  { ns: 'builder', key: 'import.counts.skills', locale: 'sv', count: 2, expected: '2 kompetenser' },
  { ns: 'builder', key: 'entryBadge.tips', locale: 'sv', count: 0, expected: '0 tips' },
  { ns: 'builder', key: 'entryBadge.tips', locale: 'sv', count: 1, expected: '1 tips' },
  { ns: 'builder', key: 'entryBadge.tips', locale: 'sv', count: 2, expected: '2 tips' },
  { ns: 'builder', key: 'savedCvs.reminder', locale: 'sv', count: 0, expected: 'Du har 0 sparade CV. Öppna dem via Fler åtgärder › Mina CV.' },
  { ns: 'builder', key: 'savedCvs.reminder', locale: 'sv', count: 1, expected: 'Du har 1 sparat CV. Öppna det via Fler åtgärder › Mina CV.' },
  { ns: 'builder', key: 'savedCvs.reminder', locale: 'sv', count: 2, expected: 'Du har 2 sparade CV. Öppna dem via Fler åtgärder › Mina CV.' },
  { ns: 'form', key: 'ideas.added', locale: 'sv', count: 0, expected: 'Tillagt. Jobbet har nu 0 prestationer.' },
  { ns: 'form', key: 'ideas.added', locale: 'sv', count: 1, expected: 'Tillagt. Jobbet har nu 1 prestation.' },
  { ns: 'form', key: 'ideas.added', locale: 'sv', count: 2, expected: 'Tillagt. Jobbet har nu 2 prestationer.' },
  { ns: 'dialogs', key: 'common.pageSummary', locale: 'sv', count: 0, expected: '0 sidor · A4', vars: { paper: 'A4' } },
  { ns: 'dialogs', key: 'common.pageSummary', locale: 'sv', count: 1, expected: '1 sida · A4', vars: { paper: 'A4' } },
  { ns: 'dialogs', key: 'common.pageSummary', locale: 'sv', count: 2, expected: '2 sidor · A4', vars: { paper: 'A4' } },
  { ns: 'dialogs', key: 'pdfPreview.summaryScaled', locale: 'sv', count: 0, expected: '0 sidor · A4 · textstorlek 100 %', vars: { paper: 'A4', scale: 100 } },
  { ns: 'dialogs', key: 'pdfPreview.summaryScaled', locale: 'sv', count: 1, expected: '1 sida · A4 · textstorlek 100 %', vars: { paper: 'A4', scale: 100 } },
  { ns: 'dialogs', key: 'pdfPreview.summaryScaled', locale: 'sv', count: 2, expected: '2 sidor · A4 · textstorlek 100 %', vars: { paper: 'A4', scale: 100 } },
  { ns: 'feedback', key: 'sectionBadge.warnings', locale: 'sv', count: 0, expected: '0 varningar' },
  { ns: 'feedback', key: 'sectionBadge.warnings', locale: 'sv', count: 1, expected: '1 varning' },
  { ns: 'feedback', key: 'sectionBadge.warnings', locale: 'sv', count: 2, expected: '2 varningar' },
  { ns: 'feedback', key: 'sectionBadge.tips', locale: 'sv', count: 0, expected: '0 tips' },
  { ns: 'feedback', key: 'sectionBadge.tips', locale: 'sv', count: 1, expected: '1 tips' },
  { ns: 'feedback', key: 'sectionBadge.tips', locale: 'sv', count: 2, expected: '2 tips' },
  { ns: 'feedback', key: 'suggestions.warnings', locale: 'sv', count: 0, expected: '0 varningar' },
  { ns: 'feedback', key: 'suggestions.warnings', locale: 'sv', count: 1, expected: '1 varning' },
  { ns: 'feedback', key: 'suggestions.warnings', locale: 'sv', count: 2, expected: '2 varningar' },
  { ns: 'feedback', key: 'suggestions.metricsHints', locale: 'sv', count: 0, expected: '0 tips om siffror' },
  { ns: 'feedback', key: 'suggestions.metricsHints', locale: 'sv', count: 1, expected: '1 tips om siffror' },
  { ns: 'feedback', key: 'suggestions.metricsHints', locale: 'sv', count: 2, expected: '2 tips om siffror' },
]
// Swedish cases are added with each namespace's sv.js, as { ns, key, locale: 'sv', count, expected }.
for (const { ns: name, key, locale, count, expected, vars = {} } of pluralCases) {
  if (locale === 'sv' && SWEDISH_PENDING.includes(name)) continue
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
