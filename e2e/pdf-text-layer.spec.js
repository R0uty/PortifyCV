import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_EXAMPLES, loadExampleCv } from '../src/utils/exampleCvs.js'
import { pdfLinks, pdfText } from './helpers/pdfFile.js'

// 1.6.71: a PDF page is a picture, so nothing could read it: an ATS got an
// empty document. Every line is now also real, invisible text, and URLs and
// emails are links. jsPDF leaves its content streams uncompressed, so both
// can be read straight out of the file.
async function exportPdf(page, testInfo, name) {
  await page.getByRole('banner').getByRole('button', { name: /^(Export|Vie)$/ }).click()
  const downloadPromise = page.waitForEvent('download', { timeout: 90_000 })
  await page.getByRole('menuitem', { name: /PDF/ }).first().click()
  const path = testInfo.outputPath(`${name}.pdf`)
  await (await downloadPromise).saveAs(path)
  return new TextDecoder('windows-1252').decode(await readFile(path))
}

const normalized = (value) => value.replace(/\s+/g, ' ').trim()

for (const template of cvTemplates) {
  test(`pdf text and links / ${template.id} @slow`, async ({ page }, testInfo) => {
    test.setTimeout(120_000)
    const exampleId = TEMPLATE_EXAMPLES[template.id][0]
    const cv = await loadExampleCv(exampleId, 'en')
    await page.goto(`/cv?template=${template.id}&example=${exampleId}`)
    await expect(page.locator('.direct-edit-export-source [data-export-header]')).toContainText(cv.title)
    await page.waitForLoadState('networkidle')

    const pdf = await exportPdf(page, testInfo, template.id)
    const text = pdfText(pdf)

    for (const part of cv.fullName.split(' ')) {
      expect(text).toContain(part)
    }
    expect(text).toContain(cv.title)
    expect(text).toContain(normalized(cv.experience[0].title ?? cv.experience[0].role))
    expect(pdfLinks(pdf)).toContain(`mailto:${cv.email}`)
  })
}

test('Finnish keeps its letters, and only real addresses become links @slow', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await page.addInitScript(() => window.localStorage.setItem('portifycv-builder-mode', 'classic'))
  await page.goto('/cv')
  await page.getByRole('tab', { name: 'Classic' }).click()
  await page.getByLabel('Full name').fill('Äijä Šimo Łukasz Иван')
  await page.getByLabel('Location').first().fill('Käytän Node.js ja ASP.NET, www.example.com.')

  const pdf = await exportPdf(page, testInfo, 'finnish')
  const text = pdfText(pdf)
  const links = pdfLinks(pdf)

  expect(text).toContain('Äijä Šimo Lukasz')
  expect(text).not.toContain('Иван')
  expect(links).toContain('https://www.example.com')
  expect(links.filter((link) => /node\.js|asp\.net/i.test(link))).toEqual([])
})

// Compact, Graduate, Modern and Portfolio had no contact line in their ATS
// layout, so their ATS PDFs had no email, phone or location at all.
for (const template of cvTemplates) {
  test(`ats pdf text and contact details / ${template.id} @slow`, async ({ page }, testInfo) => {
    test.setTimeout(120_000)
    const exampleId = TEMPLATE_EXAMPLES[template.id][0]
    const cv = await loadExampleCv(exampleId, 'en')
    await page.goto(`/cv?template=${template.id}&example=${exampleId}`)
    await expect(page.locator('.direct-edit-export-source [data-export-header]')).toContainText(cv.title)
    await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
    await page.getByRole('menuitem', { name: 'Settings' }).click()
    await page.getByRole('dialog', { name: 'Settings' }).locator('.toggle-switch').first().click()
    await page.keyboard.press('Escape')

    const pdf = await exportPdf(page, testInfo, `ats-${template.id}`)
    const text = pdfText(pdf)

    expect(text).toContain(cv.title)
    expect(text).toContain(cv.email)
    expect(pdfLinks(pdf)).toContain(`mailto:${cv.email}`)
  })
}
