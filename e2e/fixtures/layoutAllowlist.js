// Known layout failures, recorded by the Phase 2 audit (docs/template-audit-phase2.md)
// so CI stays green while the fix pass works through them. Each fix task
// removes its entries; the harness fails on stale entries. Must be empty
// at the end of Phase 2.
export const LAYOUT_ALLOWLIST = [
  { template: 'portfolio', subject: 'frontend-developer', mode: 'normal', rule: 'length', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portfolio', subject: 'ux-designer', mode: 'normal', rule: 'length', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portfolio', subject: 'product-manager', mode: 'normal', rule: 'length', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },

  // Task 8a (G8a): rendering achievements/technologies lengthened these two
  // examples past the 2.0-page floor. Fixed in Task 8 (G8 density).
  { template: 'executive', subject: 'finance-director', mode: 'normal', rule: 'length', reason: 'G8a lengthened the CV — fixed in Task 8 (G8 density)' },
  { template: 'classicProfessional', subject: 'finance-director', mode: 'normal', rule: 'length', reason: 'G8a lengthened the CV — fixed in Task 8 (G8 density)' },

  // Stress tier (Task 3): synthetic edge-case CVs through the builder
  // (long-single-word, ten-jobs, sparse) — same baseline-and-fix-later
  // posture as the example tier above.
  { template: 'minimal', subject: 'stress:long-single-word', mode: 'stress', rule: 'mid-word-break', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'graduate', subject: 'stress:long-single-word', mode: 'stress', rule: 'beyond-page', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'graduate', subject: 'stress:ten-jobs', mode: 'stress', rule: 'beyond-page', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'graduate', subject: 'stress:sparse', mode: 'stress', rule: 'beyond-page', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
]
