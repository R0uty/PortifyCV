// Known layout failures, recorded by the Phase 2 audit (docs/template-audit-phase2.md)
// so CI stays green while the fix pass works through them. Each fix task
// removes its entries; the harness fails on stale entries. Must be empty
// at the end of Phase 2.
//
// Task 9 fix round 1: this briefly held 7 "accepted exception" entries for
// a 44-character unbreakable skill token that was wider than seven
// templates' flush-right skill-chip columns. Two controller rulings
// removed the need for them: (1) `.tpl-chip-wrappable`
// (src/styles/templates/_system.css) replaced each template's
// `overflow-wrap: anywhere` with `overflow-wrap: break-word` +
// `max-width: 100%`, which still lets the token break but no longer
// fractures an ordinary crowded-row skill word the same way; (2) the
// layout harness's mid-word-break rule (e2e/helpers/layoutAudit.js) now
// exempts a word whose unbroken width genuinely exceeds its own
// container's content width — breaking it is then unavoidable, not a
// layout defect, so it no longer needs recording here at all.
export const LAYOUT_ALLOWLIST = []
