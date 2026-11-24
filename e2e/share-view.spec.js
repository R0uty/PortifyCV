import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { copyLinkFromBuilder, shareEditUrl } from './helpers/shareLinks.js'
import { pdfText } from './helpers/pdfFile.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { getTemplateVariants } from '../src/utils/templateVariants.js'

// The read-only share page (1.7.12): a copied link opens /view, not the
// builder; an old /cv#data= link opened fresh moves there too, while a
// reload of an old builder tab stays in the builder.

test('a share link opens /view, noindex, with no builder', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)
  expect(url).toMatch(/\/view#data=/)

  const viewer = await context.newPage()
  await viewer.goto(url)
  await expect(viewer).toHaveURL(/\/view#data=/)
  await expect(viewer.getByRole('heading', { level: 1 })).toHaveText('John Doe')
  await expect(viewer.getByRole('tab', { name: 'Direct Edit' })).toHaveCount(0)
  await expect(viewer.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  await expect(viewer.locator('.site-footer')).toHaveCount(0)
  await expect(viewer.locator('.project-header')).toHaveCount(0)
})

test('an old /cv#data= link opened fresh lands on /view', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)

  const viewer = await context.newPage()
  await viewer.goto(url.replace('/view#', '/cv#'))
  await expect(viewer).toHaveURL(/\/view#data=/)
  await expect(viewer.getByRole('heading', { level: 1 })).toHaveText('John Doe')
  await expect(viewer.getByRole('tab', { name: 'Direct Edit' })).toHaveCount(0)
})

test('an edit link opens the builder', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)

  const viewer = await context.newPage()
  await viewer.goto(shareEditUrl(url))
  await expect(viewer).toHaveURL(/\/cv#data=.*&edit=1/)
  await expect(viewer.getByRole('tab', { name: 'Direct Edit' })).toBeVisible()
})

test('reloading an old /cv#data= tab stays in the builder', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)

  const viewer = await context.newPage()
  await viewer.goto(shareEditUrl(url))
  await expect(viewer.getByRole('tab', { name: 'Direct Edit' })).toBeVisible()
  await viewer.evaluate(() => history.replaceState(history.state, '', location.href.replace('&edit=1', '')))
  await viewer.reload()
  await expect(viewer).toHaveURL(/\/cv#data=/)
  await expect(viewer.getByRole('tab', { name: 'Direct Edit' })).toBeVisible()
})

test('reloading /view keeps the page', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)

  const viewer = await context.newPage()
  await viewer.goto(url)
  await expect(viewer.getByRole('heading', { level: 1 })).toHaveText('John Doe')
  await viewer.reload()
  await expect(viewer).toHaveURL(url)
  await expect(viewer.getByRole('heading', { level: 1 })).toHaveText('John Doe')
})

test('a corrupt link shows the message', async ({ page }) => {
  await page.goto('/view#data=not-a-cv')
  await expect(page.getByRole('heading', { name: "This CV link can't be opened" })).toBeVisible()
  await expect(page.getByText('The link may have been cut short or changed. Ask the sender for a new one.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Go to PortifyCV' })).toHaveAttribute('href', '/')
})

test('/view with no data shows the message', async ({ page }) => {
  await page.goto('/view')
  await expect(page.getByRole('heading', { name: "This CV link can't be opened" })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Go to PortifyCV' })).toHaveAttribute('href', '/')
})

test('a corrupt old /cv#data= link opened fresh lands on /view with the message', async ({ page }) => {
  await page.goto('/cv#data=not-a-cv')
  await expect(page).toHaveURL(/\/view#data=not-a-cv/)
  await expect(page.getByRole('heading', { name: "This CV link can't be opened" })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Direct Edit' })).toHaveCount(0)
})

// The page itself (1.7.12): the sender's CV in their template and look,
// read-only, with a PDF download in their paper size and an Edit a copy
// link into the builder.
const DEMO_NAME = 'John Doe'
const developerLabel = cvTemplates.find((template) => template.id === 'developer').label
const developerLooks = getTemplateVariants('developer')
// The storage keys' values (designSystem.js, cvForm.js).
const UI_LOCALE_KEY = 'ui-locale'
const SESSION_SNAPSHOT_KEY = 'portifycv-session-snapshot'

const developerLink = (page, context, options = {}) => copyLinkFromBuilder(page, context, {
  template: developerLabel, variants: developerLooks, variantIndex: 1, font: 'Arial', ...options,
})

async function downloadPdf(viewer, testInfo) {
  const button = viewer.getByRole('button', { name: 'Download PDF' })
  const [download] = await Promise.all([viewer.waitForEvent('download', { timeout: 60_000 }), button.click()])
  const path = testInfo.outputPath(download.suggestedFilename())
  await download.saveAs(path)
  return { download, bytes: await readFile(path) }
}

test('the view shows the CV in the sender\'s template and look', async ({ page, context }) => {
  const url = await developerLink(page, context)
  const viewer = await context.newPage()
  await viewer.goto(url)
  await expect(viewer.getByRole('heading', { level: 1 })).toHaveText(DEMO_NAME)
  await expect(viewer.locator('.shared-cv__preview [data-export-variant="developer"]').first()).toBeVisible()
  await expect.poll(() => viewer.locator('.shared-cv__preview [data-export-variant]').first()
    .evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Arial')
  await expect(viewer.getByRole('textbox')).toHaveCount(0)
  await expect(viewer).toHaveTitle(`${DEMO_NAME} — CV`)
  await expect(viewer.getByRole('link', { name: 'Made with PortifyCV' })).toHaveAttribute('href', '/')
})

test('Download PDF saves a PDF in the sender\'s paper size', async ({ page, context }, testInfo) => {
  const url = await copyLinkFromBuilder(page, context, { paper: 'letter' })
  const viewer = await context.newPage()
  await viewer.goto(url)
  const { download, bytes } = await downloadPdf(viewer, testInfo)
  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  // jsPDF writes US Letter as e.g. [0 0 612.0000000000001137 792.]; A4 is 595.28 × 841.89.
  const [, width, height] = bytes.toString('latin1').match(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/)
  expect(Number(width)).toBeCloseTo(612, 1)
  expect(Number(height)).toBeCloseTo(792, 1)
})

test('Download PDF can\'t start twice', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)
  const viewer = await context.newPage()
  await viewer.goto(url)
  let downloads = 0
  viewer.on('download', () => { downloads += 1 })
  // Its name changes while busy, so it's found by both names.
  const button = viewer.getByRole('button', { name: /^(Download PDF|Preparing PDF…)$/ })
  const firstDownload = viewer.waitForEvent('download', { timeout: 60_000 })
  await button.click()
  await expect(button).toBeDisabled()
  await expect(button).toHaveText('Preparing PDF…')
  await button.click({ force: true })
  await firstDownload
  await expect(button).toBeEnabled()
  await expect(button).toHaveText('Download PDF')
  expect(downloads).toBe(1)
})

test('Edit a copy opens the builder in a new tab with the CV', async ({ page, context }) => {
  const url = await developerLink(page, context)
  const viewer = await context.newPage()
  await viewer.goto(url)
  const link = viewer.getByRole('link', { name: 'Edit a copy' })
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAttribute('title', 'Opens the CV in the builder in a new tab')
  const [tab] = await Promise.all([context.waitForEvent('page'), link.click()])
  await expect(tab).toHaveURL(/\/cv#data=.*edit=1/)
  await expect(tab.locator('.app-toolbar__template-trigger-label')).toHaveText(developerLabel)
})

test('a Finnish CV opens in Finnish without changing the visitor\'s language', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context, { cvLanguage: 'Suomi' })
  const viewer = await context.newPage()
  await viewer.goto(url)
  await expect(viewer.getByRole('button', { name: 'Lataa PDF' })).toBeVisible()
  await expect(viewer.getByRole('link', { name: 'Muokkaa kopiota' })).toBeVisible()
  await expect(viewer.getByRole('link', { name: 'Tehty PortifyCV:llä' })).toHaveAttribute('href', '/fi')
  await expect(viewer.locator('.shared-cv__preview')).toContainText('Kokemus')
  expect(await viewer.evaluate((key) => localStorage.getItem(key), UI_LOCALE_KEY)).not.toBe('fi')
})

test('opening a link writes nothing to this browser', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)
  // Google's ad script (index.html's AdSense snippet) keeps its own
  // google_* keys; only the app's own are compared.
  const appStorage = (target) => target.evaluate(() => Object.fromEntries(
    Object.entries(localStorage).filter(([key]) => !key.startsWith('google')),
  ))
  const before = await appStorage(page)
  await page.close()

  const viewer = await context.newPage()
  await viewer.goto(url)
  await expect(viewer.getByRole('heading', { level: 1 })).toHaveText(DEMO_NAME)
  await expect(viewer.getByRole('button', { name: 'Download PDF' })).toBeEnabled()
  expect(await viewer.evaluate((key) => sessionStorage.getItem(key), SESSION_SNAPSHOT_KEY)).toBeNull()
  expect(await viewer.evaluate(() => sessionStorage.length)).toBe(0)
  expect(await appStorage(viewer)).toEqual(before)
})

test('the downloaded PDF\'s text has the name and a job title @slow', async ({ page, context }, testInfo) => {
  const url = await copyLinkFromBuilder(page, context)
  const viewer = await context.newPage()
  await viewer.goto(url)
  const { bytes } = await downloadPdf(viewer, testInfo)
  const text = pdfText(new TextDecoder('windows-1252').decode(bytes))
  expect(text).toContain(DEMO_NAME)
  expect(text).toContain('Senior Product Designer')
})

test('at phone width the page has no sideways scroll', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)
  const viewer = await context.newPage()
  await viewer.setViewportSize({ width: 375, height: 812 })
  await viewer.goto(url)
  await expect(viewer.getByRole('heading', { level: 1 })).toHaveText(DEMO_NAME)
  await expect(viewer.locator('.shared-cv__preview .scaled-preview')).toBeVisible()
  expect(await viewer.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
  const box = await viewer.locator('.shared-cv__preview .scaled-preview').boundingBox()
  expect(box.x).toBeGreaterThanOrEqual(16)
  expect(box.x + box.width).toBeLessThanOrEqual(375 - 16 + 0.5)
})
