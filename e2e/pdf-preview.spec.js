import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { loadExampleCv } from '../src/utils/exampleCvs.js'
import { pdfPageSizes } from './helpers/pdfTextCuts.js'
import { downloadFromPdfPreview } from './helpers/pdfPreview.js'

// The PDF preview (1.6.74): Export → PDF shows the pages before anything
// downloads, with paper (A4 / US Letter) and fit (Auto / 1 page / 2 pages /
// Actual size) options, and the download is exactly what it showed.

const A4_PT = [595.28, 841.89]

// Four example people's sections in one CV: several pages on any template.
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
  return cv
}
const LETTER_PT = [612, 792]

async function openWithCv(page, cv, template = 'creative') {
  await page.addInitScript((snapshot) => {
    window.localStorage.setItem('portifycv-session-restore', 'true')
    window.sessionStorage.setItem('portifycv-session-snapshot', snapshot)
  }, JSON.stringify(cv))
  await page.goto(`/cv?template=${template}`)
  await expect(page.locator('.app-shell__preview [data-export-variant]').first()).toContainText(cv.fullName.split(' ')[0])
  await page.waitForLoadState('networkidle')
}

async function openPreview(page) {
  await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
  await page.getByRole('menuitem', { name: 'PDF' }).click()
  const dialog = page.getByRole('dialog', { name: 'PDF preview' })
  await expect(dialog.getByRole('button', { name: 'Download PDF' })).toBeEnabled({ timeout: 60_000 })
  return dialog
}

async function previewPageCount(dialog) {
  await expect(dialog.getByRole('button', { name: 'Download PDF' })).toBeEnabled({ timeout: 60_000 })
  return dialog.locator('[data-pdf-preview-page]').count()
}

async function savePdf(page, testInfo, name, options) {
  const download = await downloadFromPdfPreview(page, { timeout: 90_000, ...options })
  const path = testInfo.outputPath(`${name}.pdf`)
  await download.saveAs(path)
  return readFile(path)
}

function expectPageSize(sizes, [width, height]) {
  for (const [pageWidth, pageHeight] of sizes) {
    expect(pageWidth).toBeCloseTo(width, 0)
    expect(pageHeight).toBeCloseTo(height, 0)
  }
}

test('Export → PDF opens a preview and downloads nothing until asked', async ({ page }) => {
  test.setTimeout(90_000)
  await openWithCv(page, await loadExampleCv('engineering-director', 'en'))
  let downloaded = false
  page.on('download', () => { downloaded = true })

  const dialog = await openPreview(page)
  await expect(dialog.getByRole('radio', { name: /A4/ })).toBeChecked()
  await expect(dialog.getByRole('radio', { name: /Auto/ })).toBeChecked()
  expect(await previewPageCount(dialog)).toBeGreaterThan(0)
  await expect(dialog.getByRole('status')).toContainText(/\d+ pages? · A4 · text at \d+%/)

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  expect(downloaded).toBe(false)
})

test('the download matches the preview, on A4 and on US Letter @slow', async ({ page }, testInfo) => {
  test.setTimeout(180_000)
  await openWithCv(page, await loadExampleCv('engineering-director', 'en'))

  const dialog = await openPreview(page)
  const a4Pages = await previewPageCount(dialog)
  const a4 = pdfPageSizes(await savePdf(page, testInfo, 'a4'))
  expect(a4).toHaveLength(a4Pages)
  expectPageSize(a4, A4_PT)
  await expect(dialog).toHaveCount(0)
  await expect(page.getByText(/PDF export downloaded\./)).toBeVisible()

  const letterDialog = await openPreview(page)
  // The paper picked last time is still picked.
  await letterDialog.getByRole('radio', { name: /US Letter/ }).check()
  await expect(letterDialog.getByRole('status')).toContainText('US Letter', { timeout: 60_000 })
  const letterPages = await previewPageCount(letterDialog)
  const letter = pdfPageSizes(await savePdf(page, testInfo, 'letter'))
  expect(letter).toHaveLength(letterPages)
  expectPageSize(letter, LETTER_PT)
})

test('Fit to 1 page shrinks a two-page CV onto one @slow', async ({ page }, testInfo) => {
  test.setTimeout(180_000)
  await openWithCv(page, await loadExampleCv('engineering-director', 'en'))

  const dialog = await openPreview(page)
  await dialog.getByRole('radio', { name: /Actual size/ }).check()
  await expect(dialog.getByRole('status')).toContainText('2 pages', { timeout: 60_000 })

  await dialog.getByRole('radio', { name: /Fit to 1 page/ }).check()
  await expect(dialog.getByRole('status')).toContainText('1 page ·', { timeout: 60_000 })
  expect(await previewPageCount(dialog)).toBe(1)
  await expect(dialog.locator('.pdf-preview__notice')).toHaveCount(0)

  const pdf = await savePdf(page, testInfo, 'one-page')
  expect(pdfPageSizes(pdf)).toHaveLength(1)
})

test('Fit to 1 page says so when a long CV can\'t fit readably @slow', async ({ page }) => {
  test.setTimeout(120_000)
  await openWithCv(page, await buildLongCv(), 'modern')

  const dialog = await openPreview(page)
  await dialog.getByRole('radio', { name: /Fit to 1 page/ }).check()
  await expect(dialog.getByText(/doesn't fit on one page/)).toBeVisible({ timeout: 60_000 })
  expect(await previewPageCount(dialog)).toBeGreaterThan(1)
})

test('an ATS PDF previews with its margins and downloads on the chosen paper @slow', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await openWithCv(page, await loadExampleCv('engineering-director', 'en'))
  await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: 'Settings' }).click()
  await page.getByRole('dialog', { name: 'Settings' }).locator('.toggle-switch').first().click()
  await page.keyboard.press('Escape')

  const dialog = await openPreview(page)
  await expect(dialog).toContainText('Your ATS layout')
  const pages = await previewPageCount(dialog)
  const pdf = pdfPageSizes(await savePdf(page, testInfo, 'ats-letter', { paper: 'letter' }))
  expect(pdf.length).toBeGreaterThanOrEqual(1)
  expect(pages).toBeGreaterThanOrEqual(1)
  expectPageSize(pdf, LETTER_PT)
})
