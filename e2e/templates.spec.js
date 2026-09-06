import { test, expect } from '@playwright/test'

// Regression guard for audit-1.0.1.md finding 5: sections used to stay
// editable (and listed in the nav rail) even when the selected template
// couldn't render them at all. Minimalist supports 5 section types;
// Developer supports 11, including Certificates.
//
// The template picker is TemplateQuickSwitcher (see src/components/), a
// button that opens a scrollable strip of thumbnail cards rather than a
// native <select> — selecting a template means opening that panel and
// clicking the card with the matching name.
async function selectTemplate(page, label) {
  await page.getByRole('button', { name: /^Select template:/ }).click()
  const panel = page.getByRole('dialog', { name: 'Select template' })
  await panel.getByRole('button', { name: label, exact: true }).click()
}

test.describe('Template-gated sections', () => {
  test('switching templates shows and hides matching nav rail sections', async ({ page }) => {
    await page.goto('/cv')

    const nav = page.getByRole('navigation', { name: 'Section navigation' })

    // Minimalist is the default template and does not support Certificates.
    await expect(page.locator('.template-quick-switcher__trigger-label')).toHaveText('Minimalist')
    await expect(nav.getByRole('button', { name: 'Certificates' })).toBeHidden()

    await selectTemplate(page, 'Developer')
    await expect(page.locator('.template-quick-switcher__trigger-label')).toHaveText('Developer')
    await expect(nav.getByRole('button', { name: 'Certificates' })).toBeVisible()

    await selectTemplate(page, 'Minimalist')
    await expect(nav.getByRole('button', { name: 'Certificates' })).toBeHidden()
  })

  test('a section hidden by the template is not rendered in the form either', async ({ page }) => {
    await page.goto('/cv')

    // Scoped to the editor form panel, not the live preview — the bespoke
    // Showcase templates render their own "Certificates" section heading in
    // the preview whenever the section is visible, which is expected and a
    // separate concern from whether the form side renders the section.
    const formPanel = page.locator('.editor-panel')

    await expect(formPanel.getByRole('heading', { name: 'Certificates', exact: true })).toBeHidden()

    await selectTemplate(page, 'Developer')

    await expect(formPanel.getByRole('heading', { name: 'Certificates', exact: true })).toBeVisible()
  })
})
