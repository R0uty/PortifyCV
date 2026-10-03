// Known layout failures, recorded by the Phase 2 audit (docs/template-audit-phase2.md)
// so CI stays green while the fix pass works through them. Each fix task
// removes its entries; the harness fails on stale entries. Must be empty
// at the end of Phase 2, except for a small set of deliberately accepted
// exceptions — see docs/template-audit-phase2.md's "Accepted exceptions"
// section and task-9-report.md for the full reasoning.
//
// Accepted exceptions (Task 9, G9 controller item C): a single 44-character
// unbreakable skill token ('Kubernetesoperatorreconciliationloopsdesign',
// e2e/fixtures/stressCvs.js's long-single-word fixture) added to check every
// template's skill chip for clipping/overflow. For these seven, the chip's
// column sits flush against the card's own right edge with no outer margin,
// and the token (~250-280px unbroken) is 2-3x wider than the column
// (~106-136px) — no CSS can both keep it on one line *and* keep it from
// running off the page, so each carries `overflow-wrap: anywhere` (the
// single-token exception documented in docs/template-design-system.md §6)
// and breaks mid-word rather than overflowing past the page edge. This is
// the deliberate, documented trade-off, not an unfixed bug — every other
// template's skill chip handles the same token cleanly (full line, natural
// overflow within the page, or a break-free fit).
export const LAYOUT_ALLOWLIST = [
  { template: 'modern', subject: 'stress:long-single-word', mode: 'stress', rule: 'mid-word-break', reason: 'Accepted exception (Task 9, G9 item C) — unbreakable 44-char skill token wider than the flush-right sidebar column; see docs/template-audit-phase2.md' },
  { template: 'creative', subject: 'stress:long-single-word', mode: 'stress', rule: 'mid-word-break', reason: 'Accepted exception (Task 9, G9 item C) — unbreakable 44-char skill token wider than the flush-right sidebar column; see docs/template-audit-phase2.md' },
  { template: 'executive', subject: 'stress:long-single-word', mode: 'stress', rule: 'mid-word-break', reason: 'Accepted exception (Task 9, G9 item C) — unbreakable 44-char skill token wider than the flush-right sidebar column; see docs/template-audit-phase2.md' },
  { template: 'graduate', subject: 'stress:long-single-word', mode: 'stress', rule: 'mid-word-break', reason: 'Accepted exception (Task 9, G9 item C) — unbreakable 44-char skill token wider than the flush-right sidebar column; see docs/template-audit-phase2.md' },
  { template: 'portfolio', subject: 'stress:long-single-word', mode: 'stress', rule: 'mid-word-break', reason: 'Accepted exception (Task 9, G9 item C) — unbreakable 44-char skill token wider than the flush-right sidebar column; see docs/template-audit-phase2.md' },
  { template: 'colorfulCompact', subject: 'stress:long-single-word', mode: 'stress', rule: 'mid-word-break', reason: 'Accepted exception (Task 9, G9 item C) — unbreakable 44-char skill token wider than the flush-right sidebar column; see docs/template-audit-phase2.md' },
  { template: 'quadrant', subject: 'stress:long-single-word', mode: 'stress', rule: 'mid-word-break', reason: 'Accepted exception (Task 9, G9 item C) — unbreakable 44-char skill token wider than the flush-right sidebar column; see docs/template-audit-phase2.md' },
]
