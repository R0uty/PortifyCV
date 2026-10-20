import { test, expect } from './fixtures/base.js'

// Template thumbnails and template-page previews render a whole CV. Its
// name and section titles used to be real <h1>/<h2>s, so a crawler read
// the front page as 36 CVs for "John Doe" (1.6.26). The front page and the
// templates grid now show pre-rendered images (1.6.30); a template page's
// live preview renders them as styled divs (CvHeading). Each page keeps
// exactly one real <h1>.
for (const [path, h1] of [
  ['/', 'Free CV builder. Build it, take it, done.'],
  ['/free-cv-templates', 'Free CV Templates'],
]) {
  test(`${path} has one <h1> and shows thumbnails as images`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('img.template-gallery__thumb-image').first()).toBeAttached()
    await expect(page.locator('[data-export-variant]')).toHaveCount(0)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText(h1)
  })
}

for (const [path, h1] of [
  ['/free-cv-templates/developer', 'Developer CV template'],
  ['/free-cv-templates/european', 'European CV template'],
]) {
  test(`${path} has one <h1> and no headings inside its CV preview`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('[data-cv-heading]').first()).toBeAttached()
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText(h1)
    const previewHeadings = await page
      .locator('.template-gallery__thumb-page, .scaled-preview__page')
      .evaluateAll((pages) => pages.reduce((n, p) => n + p.querySelectorAll('h1, h2, h3, h4, h5, h6').length, 0))
    expect(previewHeadings).toBe(0)
  })
}

// The builder's own preview is the user's CV, which exports to HTML/PDF
// with real headings; it must keep them.
test('the builder preview keeps real CV headings', async ({ page }) => {
  await page.goto('/cv?template=developer')
  await page.getByRole('tab', { name: 'Classic' }).click()
  await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  await expect(page.locator('.app-shell__preview h1[data-cv-name]')).toHaveCount(1)
  await expect(page.locator('.app-shell__preview [data-cv-heading]')).toHaveCount(0)
})
