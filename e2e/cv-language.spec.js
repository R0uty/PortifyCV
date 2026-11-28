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

  // Spell check (1.7.7): the fields the CV is typed into carry its language,
  // so the browser checks a Finnish CV in Finnish; names, contact details,
  // organisations and dates are left unchecked.
  test('CV fields carry the CV language and spell check, in both modes', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    const title = page.getByRole('textbox', { name: 'Professional title' })
    await expect(title).toHaveAttribute('lang', 'en')
    await expect(title).toHaveAttribute('spellcheck', 'true')

    await chooseCvLanguage(page, 'Settings', 'Settings', 'More actions', 'Suomi')

    await expect(title).toHaveAttribute('lang', 'fi')
    await expect(page.getByRole('textbox', { name: 'About' })).toHaveAttribute('spellcheck', 'true')
    await expect(page.getByRole('textbox', { name: 'Full name' })).toHaveAttribute('spellcheck', 'false')
    await expect(page.getByRole('textbox', { name: 'Company' }).first()).toHaveAttribute('spellcheck', 'false')
    await expect(page.getByRole('textbox', { name: 'Achievement 1' }).first()).toHaveAttribute('lang', 'fi')

    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    const preview = page.locator('.direct-edit-preview')
    // Its fields' names follow the CV's language, so find them by content.
    const field = (text) => preview.locator('[contenteditable]', { hasText: text }).first()
    await expect(field('Senior Product Designer')).toHaveAttribute('lang', 'fi')
    await expect(field('Senior Product Designer')).toHaveAttribute('spellcheck', 'true')
    await expect(field('John Doe')).toHaveAttribute('spellcheck', 'false')
    await expect(field('john.doe@example.com')).toHaveAttribute('spellcheck', 'false')
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

test('a stored Swedish locale leaves content pages English', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('ui-locale', 'sv'))
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.lang)).toBe('en')
  await expect(page.locator('h1')).toHaveCount(1)
  await page.getByRole('button', { name: 'Switch language' }).click()
  await expect(page).toHaveURL(/\/fi$/)
  expect(await page.evaluate(() => document.documentElement.lang)).toBe('fi')
  await page.getByRole('button', { name: 'Vaihda kieli' }).click()
  await expect(page).toHaveURL(/\/$/)
  expect(await page.evaluate(() => document.documentElement.lang)).toBe('en')
})
