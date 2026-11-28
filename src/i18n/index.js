// Translation module (1.7.13). Each namespace is a folder with one file per
// language (src/i18n/<namespace>/en.js, fi.js) and an index.js that calls
// createNamespace; the code that shows the text imports its namespace, so a
// page's text stays in that page's chunk. Plain functions only: this runs in
// the Node pre-render and in scripts/check-i18n.mjs, so no React and no
// window here (React helpers are in react.jsx).

export const LOCALES = ['en', 'fi', 'sv']
export const DEFAULT_LOCALE = 'en'

export function normalizeLocale(locale) {
  return LOCALES.includes(locale) ? locale : DEFAULT_LOCALE
}

const PLURAL_CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other']

// `{ one, other }` (plus any of zero/two/few/many) and nothing else.
export function isPluralValue(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return keys.length > 0 && keys.every((key) => PLURAL_CATEGORIES.includes(key))
}

const pluralRules = new Map()
function pluralCategory(locale, count) {
  if (!pluralRules.has(locale)) pluralRules.set(locale, new Intl.PluralRules(locale))
  return pluralRules.get(locale).select(Number(count))
}

function lookup(messages, key) {
  let value = messages
  for (const part of key.split('.')) {
    if (value === null || typeof value !== 'object') return undefined
    value = value[part]
  }
  return value
}

const PLACEHOLDER_RE = /\{(\w+)\}/g

function fill(text, vars) {
  return text.replace(PLACEHOLDER_RE, (match, name) =>
    (vars && vars[name] !== undefined && vars[name] !== null ? String(vars[name]) : match))
}

// t(locale, 'toolbar.save', vars): the string in that language, else in
// English, else the key itself. A plural value picks its form by
// vars.count; a function value is called with vars; `{name}` is filled from
// vars and left as is when vars has no `name`. Rich-text tags (`<0>…</0>`)
// are returned untouched for <T> to render.
function translate(messages, locales, locale, key, vars) {
  let used = normalizeLocale(locale)
  if (!locales.includes(used)) used = DEFAULT_LOCALE
  let value = lookup(messages[used], key)
  if (value === undefined && used !== DEFAULT_LOCALE) {
    used = DEFAULT_LOCALE
    value = lookup(messages[used], key)
  }
  if (value === undefined) return key
  if (typeof value === 'function') return value(vars ?? {})
  if (isPluralValue(value)) {
    value = value[pluralCategory(used, vars?.count)] ?? value.other
  }
  return typeof value === 'string' ? fill(value, vars) : value
}

// kind 'strings': keys read one at a time with t(), each checked for use in
// src/. kind 'page': a page's whole copy object, read with copy(locale).
// `locales` are the languages the namespace has files for (default: all of
// LOCALES); t/copy for any other language use English. Content pages are
// English and Finnish only (1.7.14).
export function createNamespace(name, messages, { kind = 'strings', locales = LOCALES } = {}) {
  const resolve = (locale) => {
    const used = normalizeLocale(locale)
    return locales.includes(used) ? used : DEFAULT_LOCALE
  }
  return {
    name,
    kind,
    locales,
    messages,
    t: (locale, key, vars) => translate(messages, locales, locale, key, vars),
    copy: (locale) => messages[resolve(locale)] ?? messages[DEFAULT_LOCALE],
  }
}

const TAG_RE = /<\/?(\d+)>/g

function tokens(text, re) {
  return [...new Set([...text.matchAll(re)].map((match) => match[0].replace('/', '')))].sort().join(' ')
}

function pluralText(value) {
  return Object.values(value).filter((form) => typeof form === 'string').join(' ')
}

function describe(value) {
  if (Array.isArray(value)) return 'array'
  if (isPluralValue(value)) return 'plural'
  return value === null ? 'null' : typeof value
}

function compareShapes(base, other, path, locale, errors) {
  const where = path || '(root)'
  const baseType = describe(base)
  const otherType = describe(other)
  if (baseType !== otherType) {
    errors.push(`${where}: ${DEFAULT_LOCALE} has ${baseType}, ${locale} has ${otherType}`)
    return
  }
  if (baseType === 'array') {
    if (base.length !== other.length) {
      errors.push(`${where}: ${DEFAULT_LOCALE} has ${base.length} item(s), ${locale} has ${other.length}`)
      return
    }
    base.forEach((item, index) => compareShapes(item, other[index], `${path}[${index}]`, locale, errors))
    return
  }
  if (baseType === 'object') {
    const keys = new Set([...Object.keys(base), ...Object.keys(other)])
    for (const key of keys) {
      const childPath = path ? `${path}.${key}` : key
      if (!(key in base)) errors.push(`${childPath}: only in ${locale}`)
      else if (!(key in other)) errors.push(`${childPath}: missing in ${locale}`)
      else compareShapes(base[key], other[key], childPath, locale, errors)
    }
    return
  }
  if (baseType === 'plural' || baseType === 'string') {
    const missingForms = baseType === 'plural'
      ? [[DEFAULT_LOCALE, base], [locale, other]].filter(([, value]) => !('one' in value && 'other' in value))
      : []
    if (missingForms.length > 0) {
      errors.push(`${where}: plural without one/other in ${missingForms.map(([name]) => name).join(', ')}`)
      return
    }
    const baseText = baseType === 'plural' ? pluralText(base) : base
    const otherText = baseType === 'plural' ? pluralText(other) : other
    const [basePlaceholders, otherPlaceholders] = [baseText, otherText].map((text) => tokens(text, PLACEHOLDER_RE))
    const [baseTags, otherTags] = [baseText, otherText].map((text) => tokens(text, TAG_RE))
    if (basePlaceholders !== otherPlaceholders || baseTags !== otherTags) {
      errors.push(`${where}: placeholders/tags differ (${DEFAULT_LOCALE}: ${basePlaceholders} ${baseTags} | ${locale}: ${otherPlaceholders} ${otherTags})`)
    }
  }
}

// Every language against English: the same keys at every level, arrays of
// the same length, a function where English has one, plurals with one and
// other, and the same {placeholders} and <n> tags in each pair of strings.
export function parityErrors(namespace) {
  const errors = []
  const base = namespace.messages[DEFAULT_LOCALE]
  for (const locale of namespace.locales) {
    if (!namespace.messages[locale]) {
      errors.push(`${namespace.name}: no ${locale} messages`)
      continue
    }
    if (locale === DEFAULT_LOCALE) continue
    compareShapes(base, namespace.messages[locale], '', locale, errors)
  }
  return errors.map((error) => (error.startsWith(`${namespace.name}:`) ? error : `${namespace.name}: ${error}`))
}
