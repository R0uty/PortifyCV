import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { CV_ONBOARDING_SEEN_STORAGE_KEY, demoCvData } from '../src/utils/cvForm.js'

// How a designer PDF's pages sit on the paper (1.6.72): each page image fills
// the whole A4 sheet, with no white frame. ATS pages keep their margins. And
// a capture with very little ink in it is still the real design: judging it
// blank from a few sample points used to swap it for the text-only PDF.

// jsPDF writes each image's size and position as `w 0 0 h x y cm`, in pt.
function pageImagePlacements(bytes) {
  return [...bytes.toString('latin1').matchAll(/([\d.]+) 0 0 ([\d.]+) ([\d.]+) ([\d.]+) cm\s*\/I\d+ Do/g)]
    .map((match) => match.slice(1, 5).map(Number))
}

async function importCv(page, cv) {
  await page.getByRole('tab', { name: 'Classic' }).click()
  await page.locator('input[type="file"][accept=".json,application/json"]').setInputFiles({
    name: 'cv.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(cv)),
  })
  await expect(page.locator('.app-shell__preview [data-export-variant]').first()).toContainText(cv.fullName.split(' ')[0])
  await page.waitForLoadState('networkidle')
}

async function exportPdf(page, testInfo, name) {
  await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
  const downloadPromise = page.waitForEvent('download', { timeout: 90_000 })
  await page.getByRole('menuitem', { name: 'PDF' }).click()
  const path = testInfo.outputPath(`${name}.pdf`)
  await (await downloadPromise).saveAs(path)
  return readFile(path)
}

test('designer pages fill the whole sheet @slow', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await page.goto('/cv?template=creative')
  await importCv(page, demoCvData)
  const placements = pageImagePlacements(await exportPdf(page, testInfo, 'creative'))
  expect(placements.length).toBeGreaterThan(1)
  for (const [width, height, x, y] of placements) {
    expect(Math.abs(width - 595.28)).toBeLessThan(0.5)
    expect(Math.abs(height - 841.89)).toBeLessThan(0.5)
    expect(x).toBe(0)
    expect(y).toBeLessThan(0.5)
  }
})

test('ATS pages keep their margins @slow', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await page.goto('/cv?template=creative')
  await importCv(page, demoCvData)
  await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: 'Settings' }).click()
  await page.getByRole('dialog', { name: 'Settings' }).locator('.toggle-switch').first().click()
  await page.keyboard.press('Escape')
  const placements = pageImagePlacements(await exportPdf(page, testInfo, 'creative-ats'))
  expect(placements.length).toBeGreaterThan(0)
  for (const [width, , x] of placements) {
    expect(width).toBeLessThan(520)
    expect(x).toBeGreaterThan(40)
  }
})

test('a sparse white design is not swapped for the text-only PDF @slow', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await page.goto('/cv?template=editorial')
  await importCv(page, demoCvData)
  const bytes = await exportPdf(page, testInfo, 'editorial')
  expect(pageImagePlacements(bytes).length).toBeGreaterThan(0)
})

test('a blank CV explains itself instead of downloading an empty page', async ({ page }) => {
  // A first visit opens on the sample CV; a returning one starts blank.
  await page.addInitScript((key) => window.localStorage.setItem(key, 'true'), CV_ONBOARDING_SEEN_STORAGE_KEY)
  await page.goto('/cv?template=minimal')
  await expect(page.locator('.app-shell__preview [data-export-variant]').first()).toBeVisible()
  let downloaded = false
  page.on('download', () => { downloaded = true })
  await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
  await page.getByRole('menuitem', { name: 'PDF' }).click()
  await expect(page.getByText('Your CV is still empty.')).toBeVisible()
  expect(downloaded).toBe(false)
})
