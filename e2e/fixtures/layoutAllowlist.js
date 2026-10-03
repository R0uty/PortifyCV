// Known layout failures, recorded by the Phase 2 audit (docs/template-audit-phase2.md)
// so CI stays green while the fix pass works through them. Each fix task
// removes its entries; the harness fails on stale entries. Must be empty
// at the end of Phase 2.
export const LAYOUT_ALLOWLIST = [
  // Stress tier (Task 3): synthetic edge-case CVs through the builder
  // (long-single-word, ten-jobs, sparse) — same baseline-and-fix-later
  // posture as the example tier above.
  { template: 'minimal', subject: 'stress:long-single-word', mode: 'stress', rule: 'mid-word-break', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'graduate', subject: 'stress:long-single-word', mode: 'stress', rule: 'beyond-page', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'graduate', subject: 'stress:ten-jobs', mode: 'stress', rule: 'beyond-page', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'graduate', subject: 'stress:sparse', mode: 'stress', rule: 'beyond-page', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
]
