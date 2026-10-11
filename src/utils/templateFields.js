// Field / career-stage filters for the template gallery and the Free CV
// Templates grid (1.6.12, see
// docs/superpowers/specs/2026-10-11-template-field-filters-design.md).
// Each template lists its fields in cvTemplates.js (`fields`), hand-picked
// for its main audience. Field ids are PERMANENT once shipped (the grid
// keeps them in ?field=); labels may change. "Any field" is a field of its
// own: its templates don't also appear under the other chips.

export const TEMPLATE_FIELDS = [
  { id: 'tech', label: { en: 'Tech', fi: 'Tekniikka ja IT' } },
  { id: 'creative', label: { en: 'Creative', fi: 'Luova ala' } },
  { id: 'business', label: { en: 'Business', fi: 'Liiketoiminta' } },
  { id: 'leadership', label: { en: 'Leadership', fi: 'Johto' } },
  { id: 'graduate', label: { en: 'Graduate', fi: 'Vastavalmistuneet' } },
  { id: 'any', label: { en: 'Any field', fi: 'Kaikki alat' } },
]

export const ALL_FIELDS_LABEL = { en: 'All', fi: 'Kaikki' }

const FIELD_IDS = new Set(TEMPLATE_FIELDS.map((field) => field.id))

// A ?field= value: a known id, else null (All). Case-sensitive, like
// parseStyleVariantParam.
export function parseFieldParam(raw) {
  return typeof raw === 'string' && FIELD_IDS.has(raw) ? raw : null
}

// The templates tagged with `fieldId`, in their original order; every
// template for null (All).
export function filterTemplatesByField(templates, fieldId) {
  if (!fieldId) {
    return templates
  }
  return templates.filter((template) => template.fields?.includes(fieldId))
}
