import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { downloadFromPdfPreview } from './helpers/pdfPreview.js'

// The most varied set of real CV layouts at hand is this app's own: 18
// templates with sidebars, date columns, chips and timelines. Each one's
// PDF export of the demo CV must import back with its name and both jobs.
// This is what found the import's layout rules in the first place
// (1.7.0): row-by-row reading got 3 of the 18 right.
//
// A template change that fails this has changed how its PDF reads to a
// parser, which is worth knowing; fix the importer if the new layout is
// one a real CV could have.

for (const template of cvTemplates) {
  test(`${template.id}: its exported PDF imports back with the name and both jobs @slow`, async ({ page }, testInfo) => {
    test.setTimeout(180_000)
    await page.goto(`/cv?template=${template.id}`)
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await page.getByRole('banner').getByRole('button', { name: /^(Export|Vie)$/ }).click()
    await page.getByRole('menuitem', { name: 'PDF' }).click()
    const path = testInfo.outputPath('cv.pdf')
    await (await downloadFromPdfPreview(page, { timeout: 120_000 })).saveAs(path)
    await page.keyboard.press('Escape')

    await page.locator('input[type="file"][accept^=".pdf,.docx"]').setInputFiles({
      name: 'cv.pdf',
      mimeType: 'application/pdf',
      buffer: await readFile(path),
    })

    await expect(page.getByText(/Imported from cv\.pdf: 2 jobs, /)).toBeVisible({ timeout: 30_000 })
    const preview = page.locator('.direct-edit-preview')
    await expect(preview.locator('[data-cv-name]').first()).toHaveText('John Doe')
    await expect(preview).toContainText('Senior Product Designer')
    await expect(preview).toContainText('john.doe@example.com')
  })
}
