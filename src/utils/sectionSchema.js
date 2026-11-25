// Field descriptors for Direct Edit's popup section editor.
//
// This is the single source of truth for "what fields does section X
// have, and how should each be rendered". It exists because the popup is
// template-agnostic: it cannot read field names off a template's JSX the
// way inline editing does, so it needs the data model described in one
// place. scripts/check-section-schema.mjs validates it against
// cvForm.js's factories in both directions on every run, so a renamed or
// removed factory field fails the build rather than silently dropping a
// user's edit.
//
// Names are text, kept in the translation files (1.7.13): a section's
// name is cvForm's `sections.<key>` (one name per section, the same the
// Sections menu and Classic's panels show), the header's is
// `form`'s schema.identity, and a field's is `form`'s
// `schema.fields.<section>.<field>` (a list field's single item:
// `schema.items.<section>.<field>`). Read them with the helpers below.

import { cvFormText } from '../i18n/cvForm/index.js'
import { form } from '../i18n/form/index.js'

export const SECTION_SHAPE = Object.freeze({
  rootGroup: 'rootGroup',
  rootScalar: 'rootScalar',
  stringArray: 'stringArray',
  linkMap: 'linkMap',
  recordArray: 'recordArray',
})

const text = (key) => ({ key, type: 'text' })
const area = (key) => ({ key, type: 'textarea' })
const month = (key) => ({ key, type: 'month' })
const url = (key) => ({ key, type: 'url' })
const check = (key) => ({ key, type: 'checkbox' })
// A string[] living INSIDE a record-array entry (only experience has any:
// achievements and technologies). Rendered as a small add/remove list
// rather than one input, and written back through UPDATE_ARRAY_ITEM with
// the whole next array - exactly what Classic's ReorderableListInput and
// TagsInput already do for these same two fields.
const list = (key) => ({ key, type: 'list' })

export const SECTION_SCHEMA = {
  // Synthetic section: the header block, which has no sectionOrder entry
  // and is reached via [data-export-header] rather than
  // [data-export-section]. `photo` is handled separately by the popup
  // (TOGGLE_PHOTO_VISIBILITY needs a template id, not a field value), so
  // it is not listed as a field here.
  identity: {
    shape: SECTION_SHAPE.rootGroup,
    fields: [
      text('fullName'),
      text('title'),
      text('tagline'),
      text('email'),
      text('phone'),
      text('location'),
    ],
  },

  about: {
    shape: SECTION_SHAPE.rootScalar,
    fields: [area('about')],
  },

  skills: {
    shape: SECTION_SHAPE.stringArray,
    fields: [text('skill')],
  },

  links: {
    shape: SECTION_SHAPE.linkMap,
    fields: [
      url('github'),
      url('linkedin'),
      url('portfolio'),
      url('website'),
      url('behance'),
      url('dribbble'),
      url('medium'),
      url('devto'),
      url('scholar'),
      url('boardProfile'),
      url('blog'),
      url('researchGate'),
      url('hackTheBox'),
      url('tryHackMe'),
      url('youtube'),
    ],
  },

  experience: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('role'),
      text('company'),
      text('location'),
      text('employmentType'),
      month('startDate'),
      month('endDate'),
      check('isCurrent'),
      area('description'),
      list('achievements'),
      list('technologies'),
    ],
  },

  education: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('school'),
      text('degree'),
      text('location'),
      month('startDate'),
      month('endDate'),
      text('honors'),
      area('coursework'),
      text('grade'),
    ],
  },

  coreStrengths: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('title'),
      area('description'),
    ],
  },

  certificates: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('name'),
      text('issuer'),
      text('year'),
      url('credentialUrl'),
      text('expiry'),
    ],
  },

  projects: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('name'),
      area('description'),
      text('stack'),
      url('githubUrl'),
      url('demoUrl'),
      text('organization'),
      text('impact'),
      text('date'),
      text('teamSize'),
      area('contribution'),
    ],
  },

  languages: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('language'),
      text('level'),
    ],
  },

  interests: {
    shape: SECTION_SHAPE.recordArray,
    fields: [text('name')],
  },

  achievements: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('title'),
      area('description'),
      text('year'),
    ],
  },

  openSource: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('name'),
      area('description'),
      text('language'),
      text('stars'),
      text('forks'),
      url('url'),
    ],
  },

  publications: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('title'),
      text('publisher'),
      text('year'),
      url('url'),
    ],
  },

  leadership: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('role'),
      text('organization'),
      area('description'),
      month('startDate'),
      month('endDate'),
    ],
  },

  memberships: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('organization'),
      text('role'),
      text('year'),
    ],
  },

  speaking: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('conference'),
      text('topic'),
      text('audience'),
      text('date'),
    ],
  },

  volunteering: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('organization'),
      text('role'),
      area('description'),
    ],
  },

  internships: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('role'),
      text('company'),
      text('location'),
      month('startDate'),
      month('endDate'),
      area('description'),
      text('technologies'),
    ],
  },

  caseStudies: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      text('title'),
      area('problem'),
      area('solution'),
      text('technologies'),
      area('outcome'),
      area('lessons'),
    ],
  },

  testimonials: {
    shape: SECTION_SHAPE.recordArray,
    fields: [
      area('quote'),
      text('author'),
      text('role'),
    ],
  },
}

export function getSectionSchema(sectionKey) {
  return SECTION_SCHEMA[sectionKey]
}

// A section's name in `locale` (the popup's title, the keyboard
// triggers, the template-switch toast).
export function getSectionLabel(sectionKey, locale) {
  return sectionKey === 'identity'
    ? form.t(locale, 'schema.identity')
    : cvFormText.t(locale, `sections.${sectionKey}`)
}

// A field's label in `locale`, and for a list field the name of one item.
export function getFieldLabel(sectionKey, fieldKey, locale) {
  return form.t(locale, `schema.fields.${sectionKey}.${fieldKey}`)
}

export function getFieldItemLabel(sectionKey, fieldKey, locale) {
  return form.t(locale, `schema.items.${sectionKey}.${fieldKey}`)
}

// Returns the section key that sits `direction` away from `sectionKey`
// WITHIN ITS OWN COLUMN, or null at the end of that column.
//
// sectionOrder is one flat array, but a rail template splits it into a
// main column (primarySections) and a sidebar (secondarySections). The
// flat neighbour of a sidebar section is frequently a main-column section,
// so moving toward it looks like nothing happened. Callers must pass the
// key returned here as MOVE_SECTION_ORDER's `toSection`.
export function getColumnNeighbourSection(sectionKey, direction, orderedSections, templateConfig) {
  const primary = new Set(templateConfig.primarySections)
  const column = primary.has(sectionKey)
    ? orderedSections.filter((key) => primary.has(key))
    : orderedSections.filter((key) => new Set(templateConfig.secondarySections).has(key))
  const position = column.indexOf(sectionKey)

  if (position < 0) {
    return null
  }

  return column[position + direction] ?? null
}
