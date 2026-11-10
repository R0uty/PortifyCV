import { readFile } from 'node:fs/promises'
import JSZip from 'jszip'
import { test, expect } from './fixtures/base.js'
import { createEveryFieldCv } from './fixtures/everyFieldCv.js'
import { pdfText } from './helpers/pdfFile.js'
import { pickTemplate } from './helpers/templateGallery.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { downloadFromPdfPreview } from './helpers/pdfPreview.js'

// What a person typed has to reach the file they send (1.6.73). ATS mode used
// to lose employment type, tagline and the detail lines of education,
// certificates and projects, and every format lost employment type.
const { cv, fields, basics } = createEveryFieldCv()

const banner = (page) => page.getByRole('banner')
const toast = (page) => page.getByRole('status').filter({ hasText: /./ }).last()

async function openWithCv(page, templateId) {
  await page.goto(`/cv?template=${templateId}`)
  await page.getByRole('tab', { name: 'Classic' }).click()
  await page.locator('input[type="file"][accept=".json,application/json"]').setInputFiles({
    name: 'cv.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(cv)),
  })
  await expect(page.locator('.app-shell__preview [data-export-variant]').first()).toContainText(cv.title)
  await page.waitForLoadState('networkidle')
}

async function download(page, item, path) {
  await banner(page).getByRole('button', { name: 'Export', exact: true }).click()
  const downloadPromise = item === 'PDF' ? null : page.waitForEvent('download', { timeout: 90_000 })
  await page.getByRole('menuitem', { name: item }).click()
  await (await (downloadPromise ?? downloadFromPdfPreview(page, { timeout: 90_000 }))).saveAs(path)
}

async function turnOnAts(page) {
  await banner(page).getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: 'Settings' }).click()
  await page.getByRole('dialog', { name: 'Settings' }).locator('.toggle-switch').first().click()
  await page.keyboard.press('Escape')
}

async function readDocx(path) {
  const zip = await JSZip.loadAsync(await readFile(path))
  const parts = Object.keys(zip.files).filter((name) => /document\.xml|\.rels$/.test(name))
  return (await Promise.all(parts.map((name) => zip.files[name].async('string')))).join('')
}

const missingFrom = (text, expected) => {
  const haystack = text.toLowerCase()
  return expected.filter(({ value }) => !haystack.includes(value.toLowerCase())).map(({ path }) => path)
}

for (const template of cvTemplates) {
  test(`no field is lost / ${template.id} @slow`, async ({ page }, testInfo) => {
    test.setTimeout(240_000)
    const supported = new Set([...basics, ...template.primarySections, ...template.secondarySections])
    const supportedFields = fields.filter(({ section }) => supported.has(section))
    await openWithCv(page, template.id)

    const htmlPath = testInfo.outputPath('cv.html')
    await download(page, 'HTML', htmlPath)
    expect(missingFrom(await readFile(htmlPath, 'utf8'), fields), 'HTML').toEqual([])

    // European's Word layout only has rows for its own sections.
    const docxPath = testInfo.outputPath('cv.docx')
    await download(page, 'Word', docxPath)
    const wordFields = template.id === 'european' ? supportedFields : fields
    expect(missingFrom(await readDocx(docxPath), wordFields), 'Word').toEqual([])

    const jsonPath = testInfo.outputPath('cv.json')
    await download(page, 'JSON', jsonPath)
    const exported = JSON.parse(await readFile(jsonPath, 'utf8'))
    Object.keys(cv).forEach((key) => expect(exported[key], `JSON ${key}`).toEqual(cv[key]))

    await turnOnAts(page)
    const pdfPath = testInfo.outputPath('cv-ats.pdf')
    await download(page, 'PDF', pdfPath)
    const pdf = pdfText(new TextDecoder('windows-1252').decode(await readFile(pdfPath)))
    expect(missingFrom(pdf, supportedFields), 'ATS PDF').toEqual([])
  })
}

test.describe('Sections a template leaves out', () => {
  test('switching templates, and exporting, name the filled sections that won\'t show', async ({ page }, testInfo) => {
    test.setTimeout(120_000)
    await openWithCv(page, 'minimal')

    await pickTemplate(page, 'European')
    await expect(page.getByText(/This template doesn't show: .*Testimonials.*Your data is kept\./)).toBeVisible()

    await download(page, 'PDF', testInfo.outputPath('cv.pdf'))
    await expect(page.getByText(/PDF export downloaded\. This template doesn't show: .*Testimonials/)).toBeVisible()

    // European's Word file leaves them out too; HTML keeps every section.
    await download(page, 'Word', testInfo.outputPath('cv.docx'))
    await expect(page.getByText(/Word export downloaded\. This template doesn't show: .*Testimonials/)).toBeVisible()

    await download(page, 'HTML', testInfo.outputPath('cv.html'))
    await expect(toast(page)).toContainText('HTML export downloaded.')
    await expect(toast(page)).not.toContainText("doesn't show")
  })

  test('a template showing every filled section says nothing', async ({ page }, testInfo) => {
    await page.goto('/cv?template=minimal')
    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.getByLabel('Full name').fill('Test Person')
    await pickTemplate(page, 'European')
    await expect(page.getByText("This template doesn't show")).toHaveCount(0)
    await download(page, 'PDF', testInfo.outputPath('cv.pdf'))
    await expect(page.getByText('PDF export downloaded.')).toBeVisible()
    await expect(page.getByText("This template doesn't show")).toHaveCount(0)
  })
})

test('the Export menu says which PDF layout you\'ll get', async ({ page }) => {
  await page.goto('/cv?template=minimal')
  await banner(page).getByRole('button', { name: 'Export', exact: true }).click()
  await expect(page.getByRole('menuitem', { name: /PDF/ })).toContainText('Your design, ready to send')
  await page.keyboard.press('Escape')

  await turnOnAts(page)
  await banner(page).getByRole('button', { name: 'Export', exact: true }).click()
  await expect(page.getByRole('menuitem', { name: /PDF/ })).toContainText('ATS layout: plain and easy to parse')
})
