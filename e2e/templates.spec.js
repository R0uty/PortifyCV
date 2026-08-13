import { test, expect } from '@playwright/test'

// Regression guard for audit-1.0.1.md finding 5: sections used to stay
// editable (and listed in the nav rail) even when the selected template
// couldn't render them at all. Minimalist supports 5 section types;
// Developer supports 11, including Certificates.
test.describe('Template-gated sections', () => {
  test('switching templates shows and hides matching nav rail sections', async ({ page }) => {
    await page.goto('/cv')

    const nav = page.getByRole('navigation', { name: 'Section navigation' })
    const templateSelect = page.getByLabel('Select template')

    // Minimalist is the default template and does not support Certificates.
    await expect(templateSelect).toHaveValue('minimal')
    await expect(nav.getByRole('button', { name: 'Certificates' })).toBeHidden()

    await templateSelect.selectOption({ label: 'Developer' })
    await expect(nav.getByRole('button', { name: 'Certificates' })).toBeVisible()

    await templateSelect.selectOption({ label: 'Minimalist' })
    await expect(nav.getByRole('button', { name: 'Certificates' })).toBeHidden()
  })

  test('a section hidden by the template is not rendered in the form either', async ({ page }) => {
    await page.goto('/cv')

    await expect(page.getByRole('heading', { name: 'Certificates', exact: true })).toBeHidden()

    await page.getByLabel('Select template').selectOption({ label: 'Developer' })

    await expect(page.getByRole('heading', { name: 'Certificates', exact: true })).toBeVisible()
  })
})
