import { test, expect } from './fixtures/base.js'

// 1.6.48: no ads in the builder. The edge worker serves /cv (and 404s)
// without the AdSense script, and moving into or out of the builder is a
// full page load, so a script a content page loaded never carries into the
// builder. A marker on `window` survives an in-app switch but not a load.
const mark = (page) => page.evaluate(() => { window.__sameDocument = true })
const sameDocument = (page) => page.evaluate(() => window.__sameDocument === true)

test('"Start building" opens the builder with a full page load', async ({ page }) => {
  await page.goto('/')
  await mark(page)
  await page.locator('.landing-hero__actions').getByRole('button', { name: 'Start building' }).click()
  await expect(page).toHaveURL(/\/cv$/)
  await expect(page.getByRole('tab', { name: 'Direct Edit' })).toBeVisible()
  expect(await sameDocument(page)).toBe(false)
})

test('a template page opens the builder on its template and look, in its language, with a full page load', async ({ page }) => {
  await page.goto('/fi/ilmaiset-cv-pohjat/developer')
  await mark(page)
  await page.getByRole('button', { name: 'Aloita tyhjästä tällä pohjalla' }).click()
  await expect(page.getByRole('tab', { name: 'Suora muokkaus' })).toBeVisible()
  await expect(page.locator('.app-toolbar__template-trigger')).toContainText('Kehittäjä')
  expect(await sameDocument(page)).toBe(false)
})

test('leaving the builder is a full page load, and Back across its edge reloads', async ({ page }) => {
  await page.goto('/about')
  await page.locator('.landing-hero__actions, .project-header__actions').getByRole('button', { name: 'Build my CV' }).click()
  await expect(page.getByRole('tab', { name: 'Direct Edit' })).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.locator('h1')).toHaveText('About PortifyCV')

  await page.goForward()
  await expect(page.getByRole('tab', { name: 'Direct Edit' })).toBeVisible()
  await mark(page)
  await page.locator('.site-footer').getByRole('link', { name: 'Privacy policy' }).click()
  await expect(page).toHaveURL(/\/privacy$/)
  expect(await sameDocument(page)).toBe(false)
})
