import { test, expect } from './fixtures/base.js'
import { ROUTES, ROUTES_FI } from '../src/utils/routes.js'
import { VIEW_HEAD } from '../src/utils/pageMeta.js'

// 1.6.35: every content page also lives under /fi/…, in Finnish. The address
// decides the language; the header switch moves to the twin page; links on
// a Finnish page stay Finnish; each page names its twin with hreflang.
const alternates = (page) => page.evaluate(() => Object.fromEntries(
  [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((link) => [link.hreflang, new URL(link.href).pathname]),
))

for (const [view, path] of Object.entries(ROUTES_FI)) {
  test(`${path} is the Finnish ${view} page`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page).toHaveTitle(VIEW_HEAD[view].titleFi)
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('fi')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://portifycv.app${path}`)
    expect(await alternates(page)).toEqual({ en: ROUTES[view], fi: path, 'x-default': ROUTES[view] })
  })
}

test('a Finnish page links only to Finnish pages (and the builder)', async ({ page }) => {
  await page.goto('/fi/nain-kirjoitat-cvn')
  const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => links.map((a) => a.getAttribute('href')))
  const english = hrefs.filter((href) => !href.startsWith('/fi') && !href.startsWith('/cv') && !href.startsWith('/thumbnails'))
  expect(english).toEqual([])
  expect(hrefs).toContain('/fi/ilmaiset-cv-pohjat/developer')
})

test('the language switch moves to the twin page and back, keeping the query', async ({ page }) => {
  await page.goto('/free-cv-templates?field=tech')
  await page.getByRole('button', { name: 'Switch language' }).click()
  await expect(page).toHaveURL(/\/fi\/ilmaiset-cv-pohjat\?field=tech$/)
  await expect(page.locator('h1')).toHaveText('Ilmaiset CV-pohjat')
  await page.getByRole('button', { name: 'Vaihda kieli' }).click()
  await expect(page).toHaveURL(/\/free-cv-templates\?field=tech$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/fi\/ilmaiset-cv-pohjat\?field=tech$/)
  await expect(page.locator('h1')).toHaveText('Ilmaiset CV-pohjat')
})

test('a Finnish template page has Finnish metadata and opens the builder in Finnish', async ({ page }) => {
  await page.goto('/fi/ilmaiset-cv-pohjat/developer')
  await expect(page).toHaveTitle('Kehittäjä – CV-pohja - PortifyCV')
  expect(await alternates(page)).toEqual({
    en: '/free-cv-templates/developer', fi: '/fi/ilmaiset-cv-pohjat/developer', 'x-default': '/free-cv-templates/developer',
  })
  await page.getByRole('banner').getByRole('button', { name: 'Tee CV' }).click()
  await expect(page).toHaveURL(/\/cv$/)
  await expect(page.getByRole('tab', { name: 'Suora muokkaus' })).toBeVisible()
})

test('the address wins over a saved language', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('ui-locale', 'fi'))
  await page.goto('/about')
  await expect(page.locator('h1')).toHaveText('About PortifyCV')
  expect(await page.evaluate(() => document.documentElement.lang)).toBe('en')
})

test('the FAQ link on a Finnish page goes to the Finnish FAQ', async ({ page }) => {
  await page.goto('/fi/tietoa')
  await page.getByRole('navigation', { name: 'Sivuston valikko' }).getByRole('link', { name: 'UKK' }).click()
  await expect(page).toHaveURL(/\/fi#faq$/)
  await expect(page.locator('#faq h2')).toHaveText('Usein kysytyt kysymykset')
})

// 1.6.47: each template page shares its own image, in its language; other
// pages share the default, including after an in-app navigation away.
test('template pages set their own share image, and it loads', async ({ page, request }) => {
  for (const [path, image] of [
    ['/free-cv-templates/developer', '/thumbnails/og/developer-en.jpg'],
    ['/fi/ilmaiset-cv-pohjat/developer', '/thumbnails/og/developer-fi.jpg'],
  ]) {
    await page.goto(path)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `https://portifycv.app${image}`)
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', `https://portifycv.app${image}`)
    const response = await request.get(image)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('image/jpeg')
  }
  await page.locator('.template-page__breadcrumb a').first().click()
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://portifycv.app/PortifyCV.jpg')
})
