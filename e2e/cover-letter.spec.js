import { test, expect } from './fixtures/base.js'

// Coverage for the cover-letter generator (todo items 20 / 26). It has
// check:reducers coverage for its UI-state transitions but no end-to-end
// spec, unlike the rest of the editor/export flows.

const navRail = (page) =>
  page.getByRole('navigation', { name: 'Section navigation' })

async function openCoverLetter(page) {
  await page.goto('/cv')
  await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
  const dialog = page.getByRole('dialog', { name: 'Cover letter' })
  await expect(dialog).toBeVisible()
  return dialog
}

test.describe('Cover letter', () => {
  test('generates a draft from the CV and enables the export actions', async ({ page }) => {
    const dialog = await openCoverLetter(page)

    const draft = dialog.getByRole('textbox', { name: 'Draft (editable)' })
    await expect(draft).toHaveValue('')
    await expect(dialog.getByRole('button', { name: 'Copy to clipboard' })).toBeDisabled()
    await expect(dialog.getByRole('button', { name: 'Download .txt' })).toBeDisabled()

    await dialog.getByRole('button', { name: 'Generate draft' }).click()

    await expect(draft).toHaveValue(/John Doe/)
    await expect(dialog.getByRole('button', { name: 'Copy to clipboard' })).toBeEnabled()
    await expect(dialog.getByRole('button', { name: 'Download .txt' })).toBeEnabled()
    await expect(dialog.getByRole('button', { name: 'Download PDF' })).toBeEnabled()
    // The button flips to "Regenerate" once there is a draft.
    await expect(dialog.getByRole('button', { name: 'Regenerate draft' })).toBeVisible()
  })

  test('the company field flows into the generated draft', async ({ page }) => {
    const dialog = await openCoverLetter(page)

    await dialog.getByRole('textbox', { name: 'Company' }).fill('Northwind Labs')
    await dialog.getByRole('button', { name: 'Generate draft' }).click()

    await expect(dialog.getByRole('textbox', { name: 'Draft (editable)' })).toHaveValue(/Northwind Labs/)
  })

  test('copies the draft to the clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const dialog = await openCoverLetter(page)

    await dialog.getByRole('button', { name: 'Generate draft' }).click()
    await dialog.getByRole('button', { name: 'Copy to clipboard' }).click()

    await expect(page.getByText('Cover letter copied to clipboard.')).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('John Doe')
  })

  test('downloads the draft as a .txt file', async ({ page }) => {
    const dialog = await openCoverLetter(page)
    await dialog.getByRole('button', { name: 'Generate draft' }).click()

    const downloadPromise = page.waitForEvent('download')
    await dialog.getByRole('button', { name: 'Download .txt' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/cover-letter\.txt$/)
  })
})

test.describe('Cover letter on mobile', () => {
  // The nav rail — the cover letter's only desktop entry point — is hidden
  // below the lg breakpoint, so the mobile bottom action bar carries its own
  // "Cover letter" button (audit-1.0.3.md finding 1 / todo item 26a).
  test.use({ viewport: { width: 390, height: 844 } })

  test('the bottom action bar opens the cover letter modal', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    await expect(navRail(page)).toBeHidden()

    await page.getByRole('button', { name: 'Cover letter' }).click()
    await expect(page.getByRole('dialog', { name: 'Cover letter' })).toBeVisible()
  })
})
