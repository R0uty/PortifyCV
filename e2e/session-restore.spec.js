import { test, expect } from './fixtures/base.js'

// "Restore last session": on by default since 1.6.82 (it was opt-in). A
// debounced effect writes an edited CV to sessionStorage so an accidental
// reload doesn't lose it. An untouched demo, example or blank CV is not
// kept. Turning the switch off clears the snapshot immediately.

const SNAPSHOT_KEY = 'portifycv-session-snapshot'
const fullName = (page) => page.getByRole('textbox', { name: /Full name/ })
const snapshot = (page) => page.evaluate((k) => window.sessionStorage.getItem(k), SNAPSHOT_KEY)

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
  test('is on by default, and an edited CV survives a reload', async ({ page }) => {
    await page.goto('/cv')

    const settings = await openSettings(page)
    await expect(restoreToggle(settings).getByRole('checkbox')).toBeChecked()
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Kept in this tab only' })).toBeVisible()

    await fullName(page).fill('Grace Hopper')
    await expect.poll(() => snapshot(page)).toContain('Grace Hopper')

    await page.reload()

    await expect(page.getByText('Restored your last session.')).toBeVisible()
    await expect(fullName(page)).toHaveValue('Grace Hopper')
  })

  // A kept copy wins over ?example= (template-pages.spec.js). If the
  // sample CV a first visit opens with were kept, every "Use this example"
  // link followed afterwards would be refused.
  test('an untouched sample or demo CV is not kept, so an example link still loads', async ({ page }) => {
    await page.goto('/cv')
    await expect(fullName(page)).toHaveValue('John Doe')
    await page.waitForTimeout(900)
    expect(await snapshot(page)).toBeNull()

    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await page.waitForTimeout(900)
    expect(await snapshot(page)).toBeNull()

    await page.goto('/cv?template=developer&example=frontend-developer')
    await expect(page.getByText(/^Loaded the .+ example\.$/)).toBeVisible()
    await expect(page.locator('.app-toolbar__template-trigger-label')).toHaveText('Developer')
  })

  test('an edit that is undone back to the untouched CV drops the kept copy', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Grace Hopper')
    await expect.poll(() => snapshot(page)).toContain('Grace Hopper')

    await page.getByRole('banner').getByRole('button', { name: 'Undo' }).click()
    await expect(fullName(page)).toHaveValue('John Doe')
    await expect.poll(() => snapshot(page)).toBeNull()
  })

  test('an edit made just before the page goes is still kept', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Grace Hopper')
    // No wait for the debounce: pagehide writes the copy.
    await page.reload()
    await expect(fullName(page)).toHaveValue('Grace Hopper')
  })

  test('turned off, nothing is kept and a reload loses the CV', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Grace Hopper')
    await expect.poll(() => snapshot(page)).toContain('Grace Hopper')

    const settings = await openSettings(page)
    await restoreToggle(settings).locator('.toggle-switch').click()
    await expect(restoreToggle(settings).getByRole('checkbox')).not.toBeChecked()
    await page.getByRole('button', { name: 'Close' }).click()

    expect(await snapshot(page)).toBeNull()
    await expect(page.getByRole('status').filter({ hasText: 'Nothing saved anywhere' })).toBeVisible()
    await fullName(page).fill('Ada Lovelace')
    await page.waitForTimeout(900)
    expect(await snapshot(page)).toBeNull()

    await page.reload()
    await expect(fullName(page)).not.toHaveValue('Ada Lovelace')
    // The choice itself is remembered.
    const settingsAgain = await openSettings(page)
    await expect(restoreToggle(settingsAgain).getByRole('checkbox')).not.toBeChecked()
  })
})
