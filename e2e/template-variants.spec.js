import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { auditLayout, waitForStableLayout, filterAllowlisted } from './helpers/layoutAudit.js'
import { LAYOUT_ALLOWLIST } from './fixtures/layoutAllowlist.js'
import { EXPECTED_PDF_PAGES } from './fixtures/pdfPages.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_EXAMPLES, loadExampleCv } from '../src/utils/exampleCvs.js'
import { getTemplateVariants } from '../src/utils/templateVariants.js'

// Phase 3: every non-default style variant (#2, #3) of every template,
// through the Phase 2 layout harness and a PDF page budget. Variant #1 is
// covered, exactly, by template-layout.spec.js and template-pdf.spec.js.
//
// The CV arrives as a session-restore snapshot carrying the variant in
// styleVariantByTemplate — the same path a reload takes, which also
// applies the variant's font (uiReducer's createInitialUiState).
const BUILDER_ROOT = '.app-shell__preview [data-export-variant]'
// ATS view only shows template colours on these (CVPreview.jsx).
const ATS_SHOWCASE_TEMPLATES = new Set(['timeline', 'navyProfessional', 'modernOrange'])

async function openWithVariant(page, templateId, variantId, cv) {
  await page.addInitScript((snapshot) => {
    window.localStorage.setItem('portifycv-session-restore-enabled', 'true')
    window.sessionStorage.setItem('portifycv-session-snapshot', snapshot)
  }, JSON.stringify({ ...cv, styleVariantByTemplate: { [templateId]: variantId } }))
  await page.goto(`/cv?template=${templateId}`)
  await expect(page.locator(BUILDER_ROOT)).toContainText(cv.fullName.split(' ')[0])
}

for (const template of cvTemplates) {
  for (const variant of getTemplateVariants(template.id).slice(1)) {
    for (const exampleId of TEMPLATE_EXAMPLES[template.id]) {
      const modes = ATS_SHOWCASE_TEMPLATES.has(template.id) ? ['normal', 'ats'] : ['normal']
      for (const mode of modes) {
        test(`variant layout / ${template.id} / ${variant.id} / ${exampleId} / ${mode} @slow`, async ({ page }) => {
          const cv = await loadExampleCv(exampleId, 'en')
          await openWithVariant(page, template.id, variant.id, cv)
          await expect(page.getByRole('banner').getByRole('button', { name: /^Select style:/ }))
            .toHaveAccessibleName(`Select style: ${variant.label.en}`)
          if (mode === 'ats') {
            await page.getByRole('button', { name: 'Settings' }).click()
            const dialog = page.getByRole('dialog', { name: 'Settings' })
            await dialog.locator('.settings-row', { hasText: 'ATS-friendly mode' }).locator('.toggle-switch').click()
            await page.getByRole('button', { name: 'Close' }).click()
            await expect(page.locator(BUILDER_ROOT)).toHaveClass(/\bpreview-document--ats\b/)
          }
          await waitForStableLayout(page)

          // The builder shows placeholders for empty secondary sections by
          // design (as the stress tier), and length is the PDF test's job.
          const violations = await auditLayout(page, BUILDER_ROOT, { skipRules: ['placeholder'] })
          const { remaining, staleEntries } = filterAllowlisted(violations, LAYOUT_ALLOWLIST, {
            template: template.id, subject: `${variant.id}:${exampleId}`, mode,
          })
          expect(remaining, 'layout violations').toEqual([])
          expect(staleEntries, 'allowlist entries that no longer fail — remove them').toEqual([])
        })
      }
    }

    test(`variant pdf budget / ${template.id} / ${variant.id} @slow`, async ({ page }, testInfo) => {
      test.setTimeout(90_000)
      const exampleId = TEMPLATE_EXAMPLES[template.id][0]
      const cv = await loadExampleCv(exampleId, 'en')
      await openWithVariant(page, template.id, variant.id, cv)
      await expect(page.getByRole('banner').getByRole('button', { name: /^Select style:/ }))
        .toHaveAccessibleName(`Select style: ${variant.label.en}`)
      await waitForStableLayout(page)

      await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
      const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })
      await page.getByRole('menuitem', { name: 'PDF' }).click()
      const download = await downloadPromise
      const path = testInfo.outputPath(`${template.id}-${variant.id}.pdf`)
      await download.saveAs(path)
      const bytes = await readFile(path)
      const pageCount = (bytes.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length
      const budget = EXPECTED_PDF_PAGES[template.id] === 1 ? 1 : 2
      expect(pageCount, `pdf pages for ${template.id}/${variant.id} (budget ${budget})`).toBeLessThanOrEqual(budget)
    })
  }
}
