// Validates sectionSchema.js against the real data model in cvForm.js.
// A schema field naming a key no factory produces would dispatch
// UPDATE_ARRAY_ITEM into a field nothing reads — a silent data loss with
// no crash to notice. This is the same cheap insurance check:share gives
// the share-link short keys.
//
//   node scripts/check-section-schema.mjs

import { registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

// src/ modules import siblings without file extensions; Node's ESM
// resolver needs this shim to follow them. Same preamble as
// scripts/check-section-columns.mjs.
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

const { SECTION_SCHEMA, SECTION_SHAPE, getSectionLabel } = await importSrc('utils/sectionSchema.js')
const cvForm = await importSrc('utils/cvForm.js')
const { form } = await importSrc('i18n/form/index.js')
const { cvFormText } = await importSrc('i18n/cvForm/index.js')

// The names live in the translation files (1.7.13). A label exists when
// the key is there in that language itself, not through the English
// fallback or the key-as-text fallback.
const LOCALES = ['en', 'fi']
function messageIn(namespace, locale, key) {
  const value = key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), namespace.messages[locale])
  return typeof value === 'string' && value.length > 0 ? value : null
}
const sectionNameKey = (section) => (section === 'identity' ? [form, 'schema.identity'] : [cvFormText, `sections.${section}`])

const FACTORY_BY_SECTION = {
  experience: cvForm.createEmptyExperience,
  education: cvForm.createEmptyEducation,
  coreStrengths: cvForm.createEmptyCoreStrength,
  certificates: cvForm.createEmptyCertificate,
  projects: cvForm.createEmptyProject,
  languages: cvForm.createEmptyLanguage,
  achievements: cvForm.createEmptyAchievement,
  openSource: cvForm.createEmptyOpenSource,
  publications: cvForm.createEmptyPublication,
  interests: cvForm.createEmptyInterest,
  leadership: cvForm.createEmptyLeadership,
  memberships: cvForm.createEmptyMembership,
  speaking: cvForm.createEmptySpeaking,
  volunteering: cvForm.createEmptyVolunteer,
  internships: cvForm.createEmptyInternship,
  caseStudies: cvForm.createEmptyCaseStudy,
  testimonials: cvForm.createEmptyTestimonial,
}

// Fields deliberately NOT exposed in the Phase A popup. Listing them here
// (rather than silently omitting them) makes each exclusion a recorded
// decision: experience.achievements/technologies are nested arrays needing
// their own sub-editor, and *.image is an upload, not a text field.
const INTENTIONALLY_EXCLUDED = {
  // experience.achievements/technologies used to live here; they are now
  // schema fields of type "list". projects.image stays out by an explicit
  // scope decision - it is an image upload, not an array sub-field.
  projects: ['image'],
}

const failures = []

function check(condition, message) {
  if (!condition) {
    failures.push(message)
  }
}

// 1. Every section in createSectionVisibility() has a schema entry.
for (const section of Object.keys(cvForm.createSectionVisibility())) {
  check(SECTION_SCHEMA[section], `missing schema entry for section "${section}"`)
}

// 2. identity is a synthetic section with no sectionVisibility entry.
check(SECTION_SCHEMA.identity, 'missing schema entry for synthetic section "identity"')

// 3. Every schema entry is well formed.
for (const [section, entry] of Object.entries(SECTION_SCHEMA)) {
  check(
    Object.values(SECTION_SHAPE).includes(entry.shape),
    `section "${section}" has unknown shape "${entry.shape}"`,
  )
  for (const locale of LOCALES) {
    const [namespace, key] = sectionNameKey(section)
    check(messageIn(namespace, locale, key), `section "${section}" has no ${locale} name (${namespace.name}: ${key})`)
  }

  for (const field of entry.fields) {
    check(typeof field.key === 'string' && field.key.length > 0, `section "${section}" has a field with no key`)
    check(
      ['text', 'textarea', 'month', 'url', 'checkbox', 'list'].includes(field.type),
      `section "${section}" field "${field.key}" has unknown type "${field.type}"`,
    )
    for (const locale of LOCALES) {
      check(
        messageIn(form, locale, `schema.fields.${section}.${field.key}`),
        `section "${section}" field "${field.key}" has no ${locale} label (form: schema.fields.${section}.${field.key})`,
      )

      if (field.type === 'list') {
        check(
          messageIn(form, locale, `schema.items.${section}.${field.key}`),
          `section "${section}" list field "${field.key}" has no ${locale} item label (form: schema.items.${section}.${field.key})`,
        )
      }
    }
  }
}

// 4. Record-array schemas match their factory in BOTH directions.
for (const [section, factory] of Object.entries(FACTORY_BY_SECTION)) {
  const entry = SECTION_SCHEMA[section]

  if (!entry) {
    continue
  }

  check(
    entry.shape === SECTION_SHAPE.recordArray,
    `section "${section}" has a factory but shape "${entry.shape}"`,
  )

  const factoryKeys = Object.keys(factory())
  const schemaKeys = entry.fields.map((field) => field.key)
  const excluded = INTENTIONALLY_EXCLUDED[section] ?? []

  for (const key of schemaKeys) {
    check(factoryKeys.includes(key), `section "${section}" schema field "${key}" does not exist on its factory`)
  }

  for (const key of factoryKeys) {
    check(
      schemaKeys.includes(key) || excluded.includes(key),
      `section "${section}" factory field "${key}" is neither in the schema nor in INTENTIONALLY_EXCLUDED`,
    )
  }
}

// 5. linkMap schema matches createEmptyLinks().
const linkKeys = Object.keys(cvForm.createEmptyLinks())
const linkSchemaKeys = SECTION_SCHEMA.links.fields.map((field) => field.key)

for (const key of linkSchemaKeys) {
  check(linkKeys.includes(key), `links schema field "${key}" does not exist on createEmptyLinks()`)
}

for (const key of linkKeys) {
  check(linkSchemaKeys.includes(key), `createEmptyLinks() field "${key}" is missing from the links schema`)
}

// 6. A section has one name. The Direct Edit popup reads it through
// sectionSchema.js's getSectionLabel; the Sections menu, Classic's
// "Visible sections" panel and its nav rail read cvForm's table. Five
// English labels differed in capitals (1.6.85); since 1.7.13 both read
// cvForm's sections.* keys, and this keeps them that way.
for (const locale of ['en', 'fi']) {
  for (const { key, label } of cvForm.getSectionVisibilityFields(locale)) {
    const schemaLabel = SECTION_SCHEMA[key] ? getSectionLabel(key, locale) : undefined
    check(
      schemaLabel === label,
      `section "${key}" is "${label}" in cvForm's ${locale} labels but "${schemaLabel}" in the schema`,
    )
  }
}

if (failures.length > 0) {
  console.error(`check:section-schema FAILED with ${failures.length} problem(s):`)
  failures.forEach((message) => console.error(`  - ${message}`))
  process.exit(1)
}

console.log(`check:section-schema passed (${Object.keys(SECTION_SCHEMA).length} sections validated)`)
