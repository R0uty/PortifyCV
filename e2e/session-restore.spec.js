import { test, expect } from '@playwright/test'

// Coverage for the opt-in "Restore last session" feature (todo items 24 /
// 26). Off by default; when on, a debounced effect writes formData to
// sessionStorage so an accidental reload doesn't lose the CV. Turning it
// back off clears the snapshot immediately.

const SNAPSHOT_KEY = 'portifycv-session-snapshot'
const fullName = (page) => page.getByRole('textbox', { name: /Full name/ })

function restoreToggle(settingsDialog) {
  return settingsDialog.locator('.settings-row', { hasText: 'Restore last session' })
}

async function openSettings(page) {
  await page.getByRole('button', { name: 'Settings' }).click()
  const dialog = page.getByRole('dialog', { name: 'Settings' })
  await expect(dialog).toBeVisible()
  return dialog
}

test.describe('Restore last session', () => {
  test('is off by default and does not survive a reload', async ({ page }) => {
    await page.goto('/cv')

    const settings = await openSettings(page)
    await expect(restoreToggle(settings).getByRole('checkbox')).not.toBeChecked()
    await page.getByRole('button', { name: 'Close' }).click()

    await fullName(page).fill('Grace Hopper')
    // Give the debounced snapshot effect a chance — it must NOT write.
    await page.waitForTimeout(900)
    expect(await page.evaluate((k) => window.sessionStorage.getItem(k), SNAPSHOT_KEY)).toBeNull()

    await page.reload()
    await expect(fullName(page)).not.toHaveValue('Grace Hopper')
  })

  test('when enabled, the CV survives a reload', async ({ page }) => {
    await page.goto('/cv')

    const settings = await openSettings(page)
    await restoreToggle(settings).locator('.toggle-switch').click()
    await expect(restoreToggle(settings).getByRole('checkbox')).toBeChecked()
    await page.getByRole('button', { name: 'Close' }).click()

    await fullName(page).fill('Grace Hopper')
    await expect
      .poll(() => page.evaluate((k) => window.sessionStorage.getItem(k), SNAPSHOT_KEY))
      .toContain('Grace Hopper')

    await page.reload()

    await expect(page.getByText('Restored your last session.')).toBeVisible()
    await expect(fullName(page)).toHaveValue('Grace Hopper')
  })

  test('turning it back off clears the saved snapshot', async ({ page }) => {
    await page.goto('/cv')

    let settings = await openSettings(page)
    await restoreToggle(settings).locator('.toggle-switch').click()
    await page.getByRole('button', { name: 'Close' }).click()

    await fullName(page).fill('Grace Hopper')
    await expect
      .poll(() => page.evaluate((k) => window.sessionStorage.getItem(k), SNAPSHOT_KEY))
      .toContain('Grace Hopper')

    settings = await openSettings(page)
    await restoreToggle(settings).locator('.toggle-switch').click()
    await expect(restoreToggle(settings).getByRole('checkbox')).not.toBeChecked()
    await page.getByRole('button', { name: 'Close' }).click()

    expect(await page.evaluate((k) => window.sessionStorage.getItem(k), SNAPSHOT_KEY)).toBeNull()

    await page.reload()
    await expect(fullName(page)).not.toHaveValue('Grace Hopper')
  })
})
