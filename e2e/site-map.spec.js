import { test, expect } from './fixtures/base.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'

// 1.6.29: every static page ends with a site map, so each guide, example
// page and template page is one link away from every other page (the
// footer bar links About, Privacy and Contact). The builder has none.
test('static pages link every guide, example page and template page', async ({ page }) => {
  await page.goto('/how-to-write-a-cv')
  const map = page.getByRole('navigation', { name: 'Site map' })
  for (const template of cvTemplates) {
    await expect(map.locator(`a[href="/free-cv-templates/${template.slug}"]`)).toHaveCount(1)
  }
  for (const path of ['/cv', '/how-to-use-the-cv-builder', '/free-cv-templates', '/ats-friendly-cv-guide', '/cv-skills-examples',
    '/cover-letter-examples', '/cv-examples', '/developer-cv-examples', '/it-cv-examples', '/cybersecurity-cv-examples',
    '/finnish-cv-examples', '/about', '/privacy']) {
    await expect(map.locator(`a[href="${path}"]`)).toHaveCount(1)
  }

  await map.getByRole('link', { name: 'Quadrant' }).click()
  await expect(page).toHaveURL(/\/free-cv-templates\/quadrant$/)
  await expect(page.locator('h1')).toHaveText('Quadrant CV template')
})

test('the builder has no site map', async ({ page }) => {
  await page.goto('/cv')
  await expect(page.locator('.app-toolbar, .direct-edit-preview').first()).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Site map' })).toHaveCount(0)
})

// 1.6.56: the contact address is one click away on every page, the
// builder included, not only at the bottom of About and the privacy policy.
test('the footer and the site map link the contact address', async ({ page }) => {
  for (const path of ['/how-to-write-a-cv', '/fi/tietoa', '/cv']) {
    await page.goto(path)
    const label = path.startsWith('/fi') ? 'Yhteystiedot' : 'Contact'
    await expect(page.locator('.site-footer').getByRole('link', { name: label }))
      .toHaveAttribute('href', 'mailto:portifycv@gmail.com')
  }
  await page.goto('/about')
  await expect(page.getByRole('navigation', { name: 'Site map' }).getByRole('link', { name: 'Contact' }))
    .toHaveAttribute('href', 'mailto:portifycv@gmail.com')
})
