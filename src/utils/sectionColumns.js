// Rules for moving a section between a two-column template's main column
// and its sidebar. Column placement is template config
// (primarySections/secondarySections); the user's moves are stored as
// per-template OVERRIDES in formData.sectionColumnsByTemplate and folded
// back into a config here, so every consumer that already reads those two
// arrays follows a move with no change of its own.
//
// Design: docs/superpowers/specs/2026-09-27-section-column-moves-design.md

import { getCvTemplate } from './cvTemplates'

// A section may go into a sidebar only if some template already designs
// it for one: the union of every template's secondarySections. Long
// narrative sections (about, experience, …) stay in main: cramped in a
// ~250px rail, and the PDF exporter picks page breaks from the main
// column only.
export const MOVABLE_TO_SIDEBAR = Object.freeze([
  'skills',
  'links',
  'certificates',
  'education',
  'languages',
  'interests',
  'coreStrengths',
  'memberships',
  'achievements',
  'projects',
])

const COLUMNS = new Set(['main', 'sidebar'])

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function homeColumn(baseTemplateConfig, sectionKey) {
  return baseTemplateConfig.secondarySections.includes(sectionKey) ? 'sidebar' : 'main'
}

export function canMoveSection(baseTemplateConfig, sectionKey) {
  if (baseTemplateConfig?.layout !== 'split' || baseTemplateConfig.columnMoves !== true) {
    return false
  }

  const supported =
    baseTemplateConfig.primarySections.includes(sectionKey) ||
    baseTemplateConfig.secondarySections.includes(sectionKey)

  if (!supported) {
    return false
  }

  return homeColumn(baseTemplateConfig, sectionKey) === 'sidebar' || MOVABLE_TO_SIDEBAR.includes(sectionKey)
}

export function getSectionColumn(templateConfig, sectionKey) {
  if (templateConfig.primarySections.includes(sectionKey)) {
    return 'main'
  }

  return templateConfig.secondarySections.includes(sectionKey) ? 'sidebar' : null
}

// Returns the next WHOLE map. Choosing a section's home column deletes its
// entry rather than storing a value equal to the default, so a move and
// its reverse leave formData exactly as it was and share links never
// carry no-op entries.
export function setSectionColumn(overridesByTemplate, baseTemplateConfig, sectionKey, column) {
  const all = isPlainObject(overridesByTemplate) ? overridesByTemplate : {}
  const current = { ...(isPlainObject(all[baseTemplateConfig.id]) ? all[baseTemplateConfig.id] : {}) }

  if (column === homeColumn(baseTemplateConfig, sectionKey)) {
    delete current[sectionKey]
  } else {
    current[sectionKey] = column
  }

  const next = { ...all }

  if (Object.keys(current).length > 0) {
    next[baseTemplateConfig.id] = current
  } else {
    delete next[baseTemplateConfig.id]
  }

  return next
}

// Invalid, stale or foreign entries are ignored here rather than rejected
// at import, so a rule changing later can never make an old JSON file or
// share link unreadable, and can never corrupt a template.
export function getEffectiveTemplateConfig(baseTemplateConfig, overridesByTemplate) {
  const overrides = isPlainObject(overridesByTemplate) ? overridesByTemplate[baseTemplateConfig.id] : null
  const combined = [...baseTemplateConfig.primarySections, ...baseTemplateConfig.secondarySections]

  const columnOf = (sectionKey) => {
    const requested = isPlainObject(overrides) ? overrides[sectionKey] : undefined

    return COLUMNS.has(requested) && canMoveSection(baseTemplateConfig, sectionKey)
      ? requested
      : homeColumn(baseTemplateConfig, sectionKey)
  }

  return {
    ...baseTemplateConfig,
    primarySections: combined.filter((key) => columnOf(key) === 'main'),
    secondarySections: combined.filter((key) => columnOf(key) === 'sidebar'),
    // Showcases route a section through its HOME renderer (the column the
    // template designed it for) whichever column it lands in.
    defaultSecondarySections: baseTemplateConfig.secondarySections,
    // The popup needs the unmodified config to evaluate the rules above.
    baseConfig: baseTemplateConfig,
  }
}

// The one call every template resolver uses, so a move is seen by the
// preview, both builder modes, ATS mode and every exporter alike.
export function getEffectiveCvTemplate(templateId, locale, formData) {
  return getEffectiveTemplateConfig(getCvTemplate(templateId, locale), formData?.sectionColumnsByTemplate)
}
