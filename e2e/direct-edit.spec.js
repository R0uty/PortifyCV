import { test, expect } from '@playwright/test'

// Same pattern as e2e/templates.spec.js's selectTemplate helper: the
// toolbar's template trigger exposes "Select template: <name>" to screen
// readers (an sr-only prefix span plus the visible label span), and opens
// the shared TemplateGalleryModal.
async function selectTemplate(page, label) {
  await page.getByRole('button', { name: /^Select template:/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Template gallery' })
  await dialog.getByText(label, { exact: true }).click()
}

test.describe('Direct Edit builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  })

  test('switching to Direct Edit shows one full-width editable preview', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await expect(page.locator('.direct-edit-preview')).toBeVisible()
    await expect(page.locator('.app-toolbar__template-trigger')).toBeVisible()
  })

  test('editing the name in Direct Edit mode persists after switching back to Classic', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    // The full name lives in the header's <h3>, rendered by EditableField as
    // a contentEditable <span class="direct-edit-field"> once Direct Edit's
    // DirectEditProvider is active (see src/components/CVPreview.jsx and
    // src/components/EditableField.jsx).
    const nameField = page.locator('.direct-edit-preview h3 .direct-edit-field')
    await nameField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Jordan Rivera')
    await nameField.blur()

    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('Jordan Rivera')
  })

  test('adding an experience entry in Direct Edit mode adds one to the form', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    const before = await page.locator('.direct-edit-preview .direct-edit-entry').count()
    await page.locator('.direct-edit-add-row', { hasText: 'Add experience' }).click()
    await expect(page.locator('.direct-edit-preview .direct-edit-entry')).toHaveCount(before + 1)
  })

  test('an unsupported template shows the read-only notice and no crash', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Executive')
    await expect(page.locator('.direct-edit-preview__notice')).toBeVisible()
    await expect(page.locator('.direct-edit-preview [contenteditable="true"]')).toHaveCount(0)
  })
})
