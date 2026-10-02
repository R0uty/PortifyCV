// Known layout failures, recorded by the Phase 2 audit (docs/template-audit-phase2.md)
// so CI stays green while the fix pass works through them. Each fix task
// removes its entries; the harness fails on stale entries. Must be empty
// at the end of Phase 2.
export const LAYOUT_ALLOWLIST = [
  { template: 'developer', subject: 'frontend-developer', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'developer', subject: 'data-engineer', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'developer', subject: 'junior-developer', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'creative', subject: 'graphic-designer', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'creative', subject: 'ux-designer', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'modern', subject: 'marketing-manager', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'modern', subject: 'project-manager', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'modern', subject: 'product-manager', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'executive', subject: 'finance-director', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'executive', subject: 'operations-manager', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'executive', subject: 'engineering-director', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portfolio', subject: 'frontend-developer', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portfolio', subject: 'frontend-developer', mode: 'normal', rule: 'length', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portfolio', subject: 'ux-designer', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portfolio', subject: 'ux-designer', mode: 'normal', rule: 'length', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portfolio', subject: 'product-manager', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portfolio', subject: 'product-manager', mode: 'normal', rule: 'length', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'techExec', subject: 'engineering-director', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'techExec', subject: 'cto', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'navyProfessional', subject: 'cto', mode: 'normal', rule: 'name-lines', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'navyProfessional', subject: 'cto', mode: 'normal', rule: 'mid-word-break', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'navyProfessional', subject: 'sales-manager', mode: 'normal', rule: 'mid-word-break', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'navyProfessional', subject: 'research-scientist', mode: 'normal', rule: 'mid-word-break', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'modernOrange', subject: 'ux-designer', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'modernOrange', subject: 'customer-success', mode: 'normal', rule: 'clipped-text', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portrait', subject: 'brand-specialist', mode: 'normal', rule: 'mid-word-break', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
  { template: 'portrait', subject: 'architect', mode: 'normal', rule: 'mid-word-break', reason: 'Phase 2 baseline — see docs/template-audit-phase2.md' },
]
