import { test, expect } from './fixtures/base.js'
import { ROUTES, ROUTES_FI } from '../src/utils/routes.js'

// 1.6.38: the guide and example pages share one layout: breadcrumb, updated
// date and reading time, a link to the other language, "On this page"
// linking every section, related pages as cards, and Article plus
// BreadcrumbList structured data.
const GUIDES = ['howToWrite', 'howToUse', 'atsGuide', 'cvSkills', 'coverLetterExamples', 'developerCv', 'itCv', 'cybersecurityCv', 'finnishCv']

for (const view of GUIDES) {
  for (const [lang, path, twin] of [['en', ROUTES[view], ROUTES_FI[view]], ['fi', ROUTES_FI[view], ROUTES[view]]]) {
    test(`${path} has the guide layout`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('.guide__breadcrumb [aria-current="page"]')).toHaveText(await page.locator('h1').textContent())
      await expect(page.locator('.guide__meta time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/)
      await expect(page.locator('.guide__meta')).toContainText(lang === 'fi' ? 'min lukuaika' : 'min read')
      await expect(page.locator(`.guide__meta a[hreflang="${lang === 'fi' ? 'en' : 'fi'}"]`)).toHaveAttribute('href', twin)

      // Every "On this page" entry points at a section on the page.
      const targets = await page.locator('.guide__toc .guide__toc-list a').evaluateAll((links) => links.map((a) => a.getAttribute('href')))
      expect(targets.length).toBeGreaterThan(1)
      for (const target of targets) {
        await expect(page.locator(target)).toHaveCount(1)
      }

      expect(await page.locator('.guide__related .examples-hub-card').count()).toBeGreaterThanOrEqual(3)

      const schema = JSON.parse(await page.locator('#view-structured-data').textContent())
      expect(schema['@graph'].map((node) => node['@type'])).toEqual(['Article', 'BreadcrumbList'])
      expect(schema['@graph'][0].inLanguage).toBe(lang)
    })
  }
}

test('weak and strong examples are side-by-side cards, and a "try it" box sits mid-page', async ({ page }) => {
  await page.goto('/how-to-write-a-cv')
  const pair = page.locator('.guide-pair--compare').first()
  await expect(pair.locator('.guide-pair__card')).toHaveCount(2)
  await expect(page.locator('.guide__try')).toHaveCount(1)
  await page.locator('.guide__try').getByRole('button', { name: 'Start building' }).click()
  await expect(page).toHaveURL(/\/cv$/)
})

test('a field example page sits under CV examples in its breadcrumb', async ({ page }) => {
  await page.goto('/fi/kehittajan-cv-esimerkit')
  const crumbs = page.locator('.guide__breadcrumb a')
  await expect(crumbs).toHaveText(['Etusivu', 'CV-esimerkit aloittain'])
  await expect(crumbs.nth(1)).toHaveAttribute('href', '/fi/cv-esimerkit')
})

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('"On this page" is a disclosure above the text', async ({ page }) => {
    await page.goto('/ats-friendly-cv-guide')
    await expect(page.locator('.guide__toc')).toBeHidden()
    const toc = page.locator('.guide__toc-mobile')
    await toc.locator('summary').click()
    await toc.getByRole('link').first().click()
    await expect(page).toHaveURL(/#section-1$/)
  })
})
