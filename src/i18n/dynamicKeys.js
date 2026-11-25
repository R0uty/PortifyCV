// Keys built at runtime, e.g. ns.t(locale, `sections.${id}`). check:i18n
// counts every key under `${prefix}.` as used, and requires a key
// `${prefix}.${id}` in `namespace` for every id. Import `ids` from the app
// module that owns them (section ids, template ids), so a new id without a
// key fails the check.
//
//   { namespace: 'cv', prefix: 'sections', ids: SECTION_IDS }
import { CV_SECTION_ORDER_KEYS, createEmptyLinks } from '../utils/cvForm.js'
import { SECTION_SCHEMA } from '../utils/sectionSchema.js'

const LINK_KEYS = Object.keys(createEmptyLinks())
// '<section>.<field>' for every field of the Direct Edit popup's schema,
// and for its list fields only (their single item's name).
const SCHEMA_FIELDS = Object.entries(SECTION_SCHEMA)
  .flatMap(([section, entry]) => entry.fields.map((field) => ({ section, field })))
const SCHEMA_FIELD_IDS = SCHEMA_FIELDS.map(({ section, field }) => `${section}.${field.key}`)
const SCHEMA_ITEM_IDS = SCHEMA_FIELDS
  .filter(({ field }) => field.type === 'list')
  .map(({ section, field }) => `${section}.${field.key}`)

export const DYNAMIC_KEYS = [
  // cvForm.js's getSectionVisibilityFields and getLinkFields.
  { namespace: 'cvForm', prefix: 'sections', ids: CV_SECTION_ORDER_KEYS },
  { namespace: 'cvForm', prefix: 'linkLabels', ids: LINK_KEYS },
  { namespace: 'cvForm', prefix: 'linkPlaceholders', ids: LINK_KEYS },
  // sectionSchema.js's getFieldLabel and getFieldItemLabel.
  { namespace: 'form', prefix: 'schema.fields', ids: SCHEMA_FIELD_IDS },
  { namespace: 'form', prefix: 'schema.items', ids: SCHEMA_ITEM_IDS },
]
