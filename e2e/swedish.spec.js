import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { chooseBuilderLanguage } from './helpers/builderToolbar.js'
import { copyLinkFromBuilder } from './helpers/shareLinks.js'
import builderShell from '../src/i18n/builderShell/sv.js'
import cv from '../src/i18n/cv/sv.js'
import share from '../src/i18n/share/sv.js'

// Swedish in the builder (1.7.14): the app's language, the CV's own
// language and a share link, with the expected texts read from the
// Swedish translation files. The suite opens the builder in Classic mode
// (playwright.config.js), whose template is Minimal.

const preview = (page) => page.locator('.app-shell__preview [data-export-variant]').first()

test.describe('Swedish', () => {
  test('the builder in Swedish: toolbar, CV headings and Settings', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await chooseBuilderLanguage(page, 'Svenska')

    const banner = page.getByRole('banner')
    await expect(banner.getByRole('button', { name: builderShell.save.saveOnDevice })).toHaveText(builderShell.save.save)
    await expect(page.locator('html')).toHaveAttribute('lang', 'sv')
    await expect(preview(page)).toContainText(cv.sections.experience)

    await banner.getByRole('button', { name: builderShell.more.label }).click()
    await page.getByRole('menuitem', { name: builderShell.more.settings }).click()
    await expect(page.getByRole('dialog', { name: builderShell.more.settings })).toBeVisible()
  })

  test('a Swedish CV in an English app: Swedish headings and export, English toolbar', async ({ page }, testInfo) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await expect(preview(page)).toContainText('Experience')

    await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
    await page.getByRole('menuitem', { name: 'Settings' }).click()
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    await dialog.getByRole('button', { name: 'Svenska', exact: true }).click()
    await expect(dialog.getByRole('button', { name: 'Svenska', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('Escape')

    await expect(preview(page)).toContainText(cv.sections.experience)
    await expect(page.getByRole('banner').getByRole('button', { name: 'Export', exact: true })).toBeVisible()

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'HTML' }).click()
    const path = testInfo.outputPath('cv.html')
    await (await downloadPromise).saveAs(path)
    const html = await readFile(path, 'utf8')
    expect(html).toContain('<html lang="sv"')
    expect(html).toContain(cv.sections.experience)
  })

  test('a Swedish share link opens in Swedish and Edit a copy keeps the CV language', async ({ page, context }) => {
    const url = await copyLinkFromBuilder(page, context, { cvLanguage: 'Svenska' })
    const viewer = await context.newPage()
    await viewer.goto(url)
    await expect(viewer.getByRole('button', { name: share.downloadPdf })).toBeVisible()
    await expect(viewer.locator('.shared-cv__preview')).toContainText(cv.sections.experience)

    const link = viewer.getByRole('link', { name: share.editCopy })
    const [tab] = await Promise.all([context.waitForEvent('page'), link.click()])
    await expect(tab).toHaveURL(/\/cv#data=.*edit=1/)
    await tab.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
    await tab.getByRole('menuitem', { name: 'Settings' }).click()
    const dialog = tab.getByRole('dialog', { name: 'Settings' })
    await expect(dialog.getByRole('button', { name: 'Svenska', exact: true })).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('Entering the builder from a content page', () => {
  test('an English page keeps a stored Swedish', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('ui-locale', 'sv'))
    await page.goto('/')
    await page.getByRole('banner').getByRole('button', { name: 'Build my CV' }).click()
    await expect(page).toHaveURL(/\/cv$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'sv')
  })

  test('a Finnish page opens the builder in Finnish', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('ui-locale', 'sv'))
    await page.goto('/fi')
    await page.getByRole('banner').getByRole('button', { name: 'Tee CV' }).click()
    await expect(page).toHaveURL(/\/cv$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fi')
  })
})
