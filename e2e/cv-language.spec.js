import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'

// The CV's own language (1.7.5, formData.cvLanguage): Settings › CV language
// sets the language of the CV's headings and exports, while the builder
// stays in the app's language. The data side (import, share link 'cl') is
// checked by scripts/check-share-links.mjs. The suite opens the builder in
// Classic mode (playwright.config.js), whose template is Minimal.

const preview = (page) => page.locator('.app-shell__preview [data-export-variant]').first()

async function chooseCvLanguage(page, settingsName, menuName, moreName, label) {
  await page.getByRole('banner').getByRole('button', { name: moreName }).click()
  await page.getByRole('menuitem', { name: menuName }).click()
  const dialog = page.getByRole('dialog', { name: settingsName })
  await dialog.getByRole('button', { name: label, exact: true }).click()
  await expect(dialog.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Escape')
}

test.describe('CV language', () => {
  test('a Finnish CV in the English builder: Finnish headings and export, English editor', async ({ page }, testInfo) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await expect(preview(page)).toContainText('Experience')

    await chooseCvLanguage(page, 'Settings', 'Settings', 'More actions', 'Suomi')

    await expect(preview(page)).toContainText('Kokemus')
    await expect(preview(page)).not.toContainText(/^Experience$/m)
    // The builder itself stays English.
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Experience' }).first()).toBeVisible()

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'HTML' }).click()
    const path = testInfo.outputPath('cv.html')
    await (await downloadPromise).saveAs(path)
    const html = await readFile(path, 'utf8')
    expect(html).toContain('lang="fi"')
    expect(html).toContain('Kokemus')

    // Back to following the app.
    await chooseCvLanguage(page, 'Settings', 'Settings', 'More actions', 'Same as the app')
    await expect(preview(page)).toContainText('Experience')
  })

  test('an English CV in the Finnish builder', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('ui-locale', 'fi'))
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Lataa demo-CV' }).first().click()
    await expect(preview(page)).toContainText('Kokemus')

    await chooseCvLanguage(page, 'Asetukset', 'Asetukset', 'Lisää toimintoja', 'English')

    await expect(preview(page)).toContainText('Experience')
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Kokemus' }).first()).toBeVisible()
  })
})
