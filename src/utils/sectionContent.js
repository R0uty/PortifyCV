// Two callers, neither of which mutates the CV:
// - The per-template marketing pages (TemplateDetailPage.jsx) use
//   `hideEmptySections()` to hide a CV section that has no real content in
//   its preview, instead of showing a template's "<Section> will appear
//   here." placeholder.
// - The PDF export path renders from a dedicated off-screen, read-only
//   `CVPreview` (Classic mode: ResumeBuilderPage.jsx; Direct Edit: the
//   existing inert copy in DirectEditPreview.jsx) whose `formData` is
//   already run through `hideEmptySections()` before it ever reaches the
//   DOM `previewRef` export captures — see F12/I-1,
//   docs/template-audit-phase2.md. That keeps section numbering (Creative,
//   Editorial) consistent with what's actually rendered, instead of
//   numbering every visible section and only then stripping empty ones
//   from a clone after the fact.
// The builder's own on-screen preview is unaffected by either caller —
// `ResumeBuilderPage.jsx` and `DirectEditPreview.jsx` still render the live
// placeholder text as an editing affordance in their visible copy; only the
// exported artifact (PDF) and the read-only marketing-page preview have it
// stripped.

import { CV_SECTION_ORDER_KEYS } from './cvForm'

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function arrayHasContent(values) {
  return values.some((entry) => {
    if (typeof entry === 'string') return hasText(entry)
    if (entry && typeof entry === 'object') return Object.values(entry).some(hasText)
    return Boolean(entry)
  })
}

function itemHasContent(item) {
  if (typeof item === 'string') return hasText(item)
  if (!item || typeof item !== 'object') return false
  return Object.values(item).some(
    (field) => hasText(field) || (Array.isArray(field) && arrayHasContent(field)),
  )
}

function isItemVisible(cv, sectionKey, index) {
  const visibility = cv?.sectionItemVisibility?.[sectionKey]
  if (!visibility) return true
  return visibility[String(index)] !== false
}

/**
 * Same semantics as the example-CV content check: a string is filled when
 * non-blank; an array (section list, or the `links` object's values) is
 * filled when some item — not hidden via
 * `cv.sectionItemVisibility[sectionKey][index] === false` — is a non-blank
 * string, or an object item with a non-blank string field or an array
 * field containing at least one non-blank entry (M-1: an item whose only
 * populated field is an array of blank strings, e.g. `achievements: ['']`,
 * does not count as content).
 *
 * `about` is also treated as non-empty when `coreStrengths` has content:
 * Creative renders the coreStrengths pills inside its About section rather
 * than a separate section, so pruning an empty About would drop pills the
 * preview shows (I-1).
 *
 * @param {object} cv
 * @param {string} sectionKey
 * @returns {boolean}
 */
export function hasSectionContent(cv, sectionKey) {
  const value = cv?.[sectionKey]
  let contentful
  if (typeof value === 'string') {
    contentful = hasText(value)
  } else if (Array.isArray(value)) {
    contentful = value.some(
      (item, index) => isItemVisible(cv, sectionKey, index) && itemHasContent(item),
    )
  } else if (value && typeof value === 'object') {
    contentful = Object.values(value).some(hasText)
  } else {
    contentful = false
  }

  if (!contentful && sectionKey === 'about') {
    return hasSectionContent(cv, 'coreStrengths')
  }

  return contentful
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
