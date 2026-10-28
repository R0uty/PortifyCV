import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_EXAMPLES, loadExampleCv } from '../src/utils/exampleCvs.js'
import { installPdfProbe, findCutLines, pdfPageSizes } from './helpers/pdfTextCuts.js'

// 1.6.59: a PDF page break must never run through a line of text. Page
// breaks were chosen from the main column only, so a sidebar line could be
// sliced in half across two pages (Graduate's "Interests" heading with the
// business-graduate example; sidebar lines on Graduate and Modern Orange with
// a long CV). Every template is exported with its first example and with a
// long CV, and every page must also be A4.

// A long CV: four example people's sections joined into one, so every
// template runs to several pages and its sidebar fills up.
async function buildLongCv() {
  const people = await Promise.all(
    ['project-manager', 'frontend-developer', 'finance-director', 'research-scientist'].map((id) => loadExampleCv(id, 'en')),
  )
  const cv = structuredClone(people[0])
  for (const person of people.slice(1)) {
    for (const [key, value] of Object.entries(person)) {
      if (Array.isArray(value) && Array.isArray(cv[key])) cv[key] = [...cv[key], ...value]
    }
  }
  cv.skills = [...new Set(cv.skills)]
  cv.about = people.map((person) => person.about).join(' ')
  return cv
}

async function exportPdf(page, testInfo, name) {
  await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
  const downloadPromise = page.waitForEvent('download', { timeout: 90_000 })
  await page.getByRole('menuitem', { name: 'PDF' }).click()
  const path = testInfo.outputPath(`${name}.pdf`)
  await (await downloadPromise).saveAs(path)
  return readFile(path)
}

async function expectCleanA4Pages(page, bytes) {
  const { pages, cut } = await findCutLines(page)
  expect(cut, 'lines cut by a page break').toEqual([])
  const sizes = pdfPageSizes(bytes)
  expect(sizes).toHaveLength(pages)
  for (const [width, height] of sizes) {
    expect(Math.abs(width - 595.28)).toBeLessThan(0.5)
    expect(Math.abs(height - 841.89)).toBeLessThan(0.5)
  }
}

const exampleCases = [
  ...cvTemplates.map((template) => [template.id, TEMPLATE_EXAMPLES[template.id][0]]),
  ['graduate', 'business-graduate'],
]

for (const [templateId, exampleId] of exampleCases) {
  test(`pdf page breaks / ${templateId} / ${exampleId} @slow`, async ({ page }, testInfo) => {
    test.setTimeout(120_000)
    await installPdfProbe(page)
    const cv = await loadExampleCv(exampleId, 'en')
    await page.goto(`/cv?template=${templateId}&example=${exampleId}`)
    await expect(page.locator('.direct-edit-export-source [data-export-header]')).toContainText(cv.title)
    await page.waitForLoadState('networkidle')
    const bytes = await exportPdf(page, testInfo, `${templateId}-${exampleId}`)
    await expectCleanA4Pages(page, bytes)
  })
}

for (const template of cvTemplates) {
  test(`pdf page breaks / ${template.id} / long CV @slow`, async ({ page }, testInfo) => {
    test.setTimeout(120_000)
    await installPdfProbe(page)
    await page.goto(`/cv?template=${template.id}`)
    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.locator('input[type="file"][accept=".json,application/json"]').setInputFiles({
      name: 'long-cv.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(await buildLongCv())),
    })
    await expect(page.locator('.app-shell__preview [data-export-variant]').first()).toContainText('Finance Director')
    await page.waitForLoadState('networkidle')
    const bytes = await exportPdf(page, testInfo, `${template.id}-long`)
    await expectCleanA4Pages(page, bytes)
  })
}
