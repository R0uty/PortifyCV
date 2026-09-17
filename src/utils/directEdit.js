// Templates wired for Direct Edit's inline-editable preview. Grows one
// entry at a time as Phase 2 rolls the shared EditableField/EditableList
// primitives out to each remaining template — see
// docs/superpowers/specs/2026-09-13-direct-edit-builder-design.md.
// A template NOT in this list still renders in Direct Edit mode, just
// read-only, until it's added here.
export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional', 'editorial', 'portrait', 'timeline']

export function isDirectEditSupported(templateId) {
  return DIRECT_EDIT_SUPPORTED_TEMPLATES.includes(templateId)
}
