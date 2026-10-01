import { test, expect } from '@playwright/test'

// Per-template pages: /free-cv-templates/<slug>. One page component renders
// all 18; routing comes from the VIEW_HEAD entries generated in pageMeta.js.

test.describe('Template pages', () => {
  test('a template page loads directly at its own URL', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Developer CV template')
    await expect(page).toHaveTitle('Developer CV Template - Free, No Login - PortifyCV')
    await expect(page.locator('.template-page__preview .cv-preview, .template-page__preview [data-export-header]').first()).toBeVisible()
  })

  test('an unknown template slug shows the not-found view', async ({ page }) => {
    await page.goto('/free-cv-templates/not-a-template')
    await expect(page).toHaveTitle('Page Not Found - PortifyCV')
  })

  test('the page carries breadcrumb structured data', async ({ page }) => {
    await page.goto('/free-cv-templates/modern-timeline')
    const schema = JSON.parse(await page.locator('#view-structured-data').textContent())
    expect(schema['@type']).toBe('BreadcrumbList')
    expect(schema.itemListElement[2].item).toBe('https://portifycv.app/free-cv-templates/modern-timeline')
  })
})
