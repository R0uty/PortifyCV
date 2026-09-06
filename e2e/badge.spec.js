import { test, expect } from '@playwright/test'

// Coverage for the "Made with PortifyCV" badge (todo items 22 / 26). It's
// reachable from the template gallery and produces a self-contained,
// inline-styled HTML snippet the user copies.

async function openBadgeModal(page) {
  await page.goto('/cv')
  await page.getByRole('navigation', { name: 'Section navigation' })
    .getByRole('button', { name: 'Templates' }).click()
  await expect(page.getByRole('dialog', { name: 'Template gallery' })).toBeVisible()
  await page.getByRole('button', { name: 'Get the badge' }).click()
  const dialog = page.getByRole('dialog', { name: 'Embeddable badge' })
  await expect(dialog).toBeVisible()
  return dialog
}

test.describe('Made-with-PortifyCV badge', () => {
  test('opens from the template gallery with a live preview and the snippet', async ({ page }) => {
    const dialog = await openBadgeModal(page)

    // The gallery closes behind it.
    await expect(page.getByRole('dialog', { name: 'Template gallery' })).toBeHidden()

    await expect(dialog.getByRole('link', { name: 'Made with PortifyCV' }))
      .toHaveAttribute('href', 'https://portifycv.app')
    await expect(dialog.getByRole('textbox', { name: 'HTML snippet' }))
      .toHaveValue(/Made with PortifyCV/)
  })

  test('copies the snippet to the clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const dialog = await openBadgeModal(page)

    await dialog.getByRole('button', { name: 'Copy HTML' }).click()
    await expect(page.getByText('Badge HTML copied to clipboard.')).toBeVisible()

    const clip = await page.evaluate(() => navigator.clipboard.readText())
    expect(clip).toContain('href="https://portifycv.app"')
    expect(clip).toContain('Made with PortifyCV')
  })
})
