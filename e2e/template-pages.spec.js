import { test, expect } from '@playwright/test'

// Per-template pages: /free-cv-templates/<slug>. One page component renders
// all 18; routing comes from the VIEW_HEAD entries generated in pageMeta.js.

test.describe('Template pages', () => {
  test('a template page loads directly at its own URL', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Developer CV template')
    await expect(page).toHaveTitle('Developer CV Template - Free, No Login - PortifyCV')
    await expect(page.locator('.template-page__preview [data-export-header]').first()).toBeVisible()

    const breadcrumbBox = await page.locator('.template-page__breadcrumb').boundingBox()
    const headingBox = await page.getByRole('heading', { level: 1 }).boundingBox()
    expect(Math.abs(breadcrumbBox.x - headingBox.x)).toBeLessThanOrEqual(2)
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

  test('the example switcher changes the preview and the URL', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    const examples = page.getByRole('radiogroup', { name: 'Examples' })
    await expect(examples.getByRole('radio', { name: 'Frontend developer' })).toBeChecked()
    await expect(page.locator('.template-page__preview')).toContainText('Mikael Laine')

    await examples.getByRole('radio', { name: 'Data engineer' }).click()
    await expect(page).toHaveURL(/\?example=data-engineer$/)

    await page.reload()
    await expect(page.getByRole('radiogroup', { name: 'Examples' }).getByRole('radio', { name: 'Data engineer' })).toBeChecked()
  })

  test('an unknown ?example= falls back to the first example', async ({ page }) => {
    await page.goto('/free-cv-templates/developer?example=nope')
    await expect(page.getByRole('radiogroup', { name: 'Examples' }).getByRole('radio', { name: 'Frontend developer' })).toBeChecked()
  })

  test('the ATS view toggle switches the preview to ATS rendering', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    const preview = page.locator('.template-page__preview')
    const before = await preview.innerHTML()
    await page.getByRole('checkbox', { name: 'ATS view' }).check()
    await expect.poll(() => preview.innerHTML()).not.toBe(before)
  })

  test('previous and next wrap around the template list', async ({ page }) => {
    await page.goto('/free-cv-templates/minimalist')
    await page.getByRole('link', { name: /Previous template/ }).click()
    await expect(page).toHaveURL(/\/free-cv-templates\/european$/)
    await page.getByRole('link', { name: /Next template/ }).click()
    await expect(page).toHaveURL(/\/free-cv-templates\/minimalist$/)
  })
})
