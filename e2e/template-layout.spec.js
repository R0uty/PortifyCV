import { test, expect } from '@playwright/test'
import { auditLayout, waitForStableLayout, filterAllowlisted } from './helpers/layoutAudit.js'
import { LAYOUT_ALLOWLIST } from './fixtures/layoutAllowlist.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_EXAMPLES, loadExampleCv } from '../src/utils/exampleCvs.js'
import { STRESS_CVS } from './fixtures/stressCvs.js'

// Phase 2 layout harness, example tier: every template × each of its example
// CVs, rendered on the template page (/free-cv-templates/<slug>), audited in
// normal and ATS view. Known failures live in fixtures/layoutAllowlist.js
// until the fix pass removes them; a stale allowlist entry also fails.

const ROOT = '.template-page__preview .scaled-preview__page'

for (const template of cvTemplates) {
  for (const exampleId of TEMPLATE_EXAMPLES[template.id]) {
    for (const mode of ['normal', 'ats']) {
      test(`${template.id} / ${exampleId} / ${mode}`, async ({ page }) => {
        const cv = await loadExampleCv(exampleId, 'en')
        await page.goto(`/free-cv-templates/${template.slug}?example=${exampleId}`)
        // A plain substring match on the full name breaks for Modern Orange:
        // its Showcase splits the name into first/last <span>s joined by a
        // <br /> (no literal space character), which Playwright's text
        // extraction does not turn into a separator. Match word-by-word with
        // an optional gap instead, so this sanity check tolerates that split
        // without weakening it for every other template, which does render
        // the name as one contiguous "First Last" string.
        const nameWords = cv.fullName.split(' ').filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        await expect(page.locator('.template-page__preview')).toContainText(new RegExp(nameWords.join('\\s*')))
        if (mode === 'ats') {
          await page.getByRole('checkbox', { name: 'ATS view' }).check()
        }
        await waitForStableLayout(page)

        const violations = await auditLayout(page, ROOT, { checkLength: mode === 'normal' })
        const { remaining, staleEntries } = filterAllowlisted(violations, LAYOUT_ALLOWLIST, {
          template: template.id, subject: exampleId, mode,
        })
        expect(remaining, 'layout violations').toEqual([])
        expect(staleEntries, 'allowlist entries that no longer fail — remove them').toEqual([])
      })
    }
  }
}

// Stress tier: §7 edge cases through the builder. The CV is injected as a
// session-restore snapshot (the same path a reload takes), so no share-link
// encoding is needed. Length is not checked here — ten-jobs is meant to be
// long. The builder preview shows "… will appear here" placeholders for
// visible-but-empty sections as an editing affordance by design, so the
// placeholder rule is skipped here (controller ruling) — whether those
// placeholders reach exported PDFs is checked in Task 4/5.
const BUILDER_ROOT = '.app-shell__preview [data-export-variant]'

for (const template of cvTemplates) {
  for (const [fixtureId, cv] of Object.entries(STRESS_CVS)) {
    test(`${template.id} / stress:${fixtureId}`, async ({ page }) => {
      await page.addInitScript((snapshot) => {
        window.localStorage.setItem('portifycv-session-restore-enabled', 'true')
        window.sessionStorage.setItem('portifycv-session-snapshot', snapshot)
      }, JSON.stringify(cv))
      await page.goto(`/cv?template=${template.id}`)
      await expect(page.locator(BUILDER_ROOT)).toContainText(cv.fullName.split(' ')[0])
      await waitForStableLayout(page)

      const violations = await auditLayout(page, BUILDER_ROOT, { skipRules: ['placeholder'] })
      const { remaining, staleEntries } = filterAllowlisted(violations, LAYOUT_ALLOWLIST, {
        template: template.id, subject: `stress:${fixtureId}`, mode: 'stress',
      })
      expect(remaining, 'layout violations').toEqual([])
      expect(staleEntries, 'allowlist entries that no longer fail — remove them').toEqual([])
    })
  }
}
