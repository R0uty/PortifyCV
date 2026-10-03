// Known layout failures, recorded by the Phase 2 audit (docs/template-audit-phase2.md)
// so CI stays green while the fix pass works through them. Each fix task
// removes its entries; the harness fails on stale entries. Must be empty
// at the end of Phase 2.
export const LAYOUT_ALLOWLIST = [
  { template: 'portfolio', subject: 'frontend-developer', mode: 'normal', rule: 'length', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portfolio', subject: 'ux-designer', mode: 'normal', rule: 'length', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portfolio', subject: 'product-manager', mode: 'normal', rule: 'length', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portrait', subject: 'brand-specialist', mode: 'normal', rule: 'mid-word-break', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portrait', subject: 'architect', mode: 'normal', rule: 'mid-word-break', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },

  // Stress tier (Task 3): synthetic edge-case CVs through the builder
  // (long-single-word, ten-jobs, sparse) — same baseline-and-fix-later
  // posture as the example tier above.
  { template: 'minimal', subject: 'stress:long-single-word', mode: 'stress', rule: 'mid-word-break', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  // Not a G7 name bug: this is G6/F4's already-accepted `.tpl-value-breakable`
  // break on the 60-char skill string in the sidebar (fixed 1.4.6 — overflow
  // -wrap: anywhere is deliberate there). It only became visible once Task 7
  // fixed Modern Orange's title-badge mid-word-break (also "Infrastructure"):
  // the layout harness dedupes a broken word globally per page, so the
  // skill-name's identical break was silently absorbed by the title-badge's
  // report until that one was fixed. See docs/template-audit-phase2.md G7/F6.
  { template: 'modernOrange', subject: 'stress:long-single-word', mode: 'stress', rule: 'mid-word-break', reason: 'Task 7 (1.4.7) — accepted G6/F4 break on the 60-char skill string, unmasked by the title-badge fix; see docs/template-audit-phase2.md G7/F6' },
  { template: 'graduate', subject: 'stress:long-single-word', mode: 'stress', rule: 'beyond-page', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'graduate', subject: 'stress:ten-jobs', mode: 'stress', rule: 'beyond-page', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'graduate', subject: 'stress:sparse', mode: 'stress', rule: 'beyond-page', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
]
