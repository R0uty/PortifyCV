import { test, expect } from './fixtures/base.js'

// "What a parser reads" (1.7.4): the PDF preview's second tab reads the PDF
// it is about to download back through the CV import's text reader and
// parser (utils/parserView.js; the comparison itself is checked by
// scripts/check-cv-import.mjs) and lists what came out right.

async function openParserTab(page) {
  await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
  await page.getByRole('menuitem', { name: 'PDF' }).click()
  const dialog = page.getByRole('dialog', { name: 'PDF preview' })
  await expect(dialog.getByRole('button', { name: 'Download PDF' })).toBeEnabled({ timeout: 60_000 })
  await dialog.getByRole('tab', { name: 'What a parser reads' }).click()
  return dialog
}

test.describe('PDF parser view', () => {
  test('reads the demo CV back and shows the text in reading order', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    const fullName = (await page.locator('.app-shell__preview [data-cv-name]').first().innerText()).trim()

    const dialog = await openParserTab(page)
    await expect(dialog.getByRole('tab', { name: 'What a parser reads' })).toHaveAttribute('aria-selected', 'true')

    const view = dialog.locator('[data-parser-view]')
    await expect(view).toBeVisible({ timeout: 60_000 })
    await expect(view.locator('[data-parser-field="name"]')).toHaveAttribute('data-parser-status', 'ok')
    await expect(view.locator('[data-parser-field="email"]')).toHaveAttribute('data-parser-status', 'ok')
    await expect(view.getByRole('status')).toHaveText(/^\d+ of \d+ read correctly$/)

    await view.getByText('Show the text in reading order').click()
    await expect(view.locator('.pdf-parser__lines')).toContainText(fullName)

    // Back to the pages, and the download is still there.
    await dialog.getByRole('tab', { name: 'Pages' }).click()
    await expect(dialog.locator('[data-pdf-preview-page]').first()).toBeVisible()
  })

  test('follows the Finnish UI', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('ui-locale', 'fi'))
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Lataa demo-CV' }).first().click()
    await page.getByRole('banner').getByRole('button', { name: 'Vie', exact: true }).click()
    await page.getByRole('menuitem', { name: 'PDF' }).click()
    const dialog = page.getByRole('dialog', { name: 'PDF-esikatselu' })
    await expect(dialog.getByRole('button', { name: 'Lataa PDF' })).toBeEnabled({ timeout: 60_000 })
    await dialog.getByRole('tab', { name: 'Mitä jäsennin lukee' }).click()

    const view = dialog.locator('[data-parser-view]')
    await expect(view.getByRole('status')).toHaveText(/^\d+\/\d+ kohtaa luettiin oikein$/, { timeout: 60_000 })
    await expect(view.locator('[data-parser-field="name"]')).toHaveAttribute('data-parser-status', 'ok')
  })
})
