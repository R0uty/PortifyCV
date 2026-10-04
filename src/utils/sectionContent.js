// Used only by the per-template marketing pages (TemplateDetailPage.jsx) to
// hide a CV section that has no real content in its preview, instead of
// showing a template's "<Section> will appear here." placeholder. Example
// data files and the builder are unaffected — this never mutates a CV and
// is never imported by ResumeBuilderPage.jsx.

import { CV_SECTION_ORDER_KEYS } from './cvForm'

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function itemHasContent(item) {
  if (typeof item === 'string') return hasText(item)
  if (!item || typeof item !== 'object') return false
  return Object.values(item).some(
    (field) => hasText(field) || (Array.isArray(field) && field.length > 0),
  )
}

/**
 * Same semantics as the example-CV content check: a string is filled when
 * non-blank; an array (section list, or the `links` object's values) is
 * filled when some item is a non-blank string, or an object item with a
 * non-blank string field or a non-empty array field.
 *
 * @param {object} cv
 * @param {string} sectionKey
 * @returns {boolean}
 */
export function hasSectionContent(cv, sectionKey) {
  const value = cv?.[sectionKey]
  if (typeof value === 'string') return hasText(value)
  if (Array.isArray(value)) return value.some(itemHasContent)
  if (value && typeof value === 'object') return Object.values(value).some(hasText)
  return false
}

/**
 * Returns a copy of `cv` whose sectionVisibility hides every section (among
 * CV_SECTION_ORDER_KEYS) that has no content. Does not mutate `cv`.
 *
 * @param {object} cv
 * @returns {object}
 */
export function hideEmptySections(cv) {
  const sectionVisibility = { ...cv.sectionVisibility }
  CV_SECTION_ORDER_KEYS.forEach((key) => {
    if (!hasSectionContent(cv, key)) {
      sectionVisibility[key] = false
    }
  })
  return { ...cv, sectionVisibility }
}
