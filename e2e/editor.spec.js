import { test, expect } from './fixtures/base.js'

test.describe('CV editor', () => {
  test('typing a name updates the live preview', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('textbox', { name: /Full name/ }).fill('Ada Lovelace')

    await expect(page.locator('.preview-panel')).toContainText('Ada Lovelace')
  })

  test('Load demo CV fills the form and the preview', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('Alex Morgan')
    await expect(page.locator('.preview-panel')).toContainText('Alex Morgan')
    await expect(page.locator('.preview-panel')).toContainText('Senior Product Designer')
  })

  test('Reset form clears a filled-in field', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('Alex Morgan')

    // "Reset form" is a two-step button: first click arms it, second click clears.
    await page.getByRole('button', { name: 'Reset form' }).click()
    await page.getByRole('button', { name: 'Confirm reset' }).click()

    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('')
  })
})
