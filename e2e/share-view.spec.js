import { test, expect } from './fixtures/base.js'
import { copyLinkFromBuilder, shareEditUrl } from './helpers/shareLinks.js'

// The read-only share page (1.7.12): a copied link opens /view, not the
// builder; an old /cv#data= link opened fresh moves there too, while a
// reload of an old builder tab stays in the builder.

test('a share link opens /view, noindex, with no builder', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)
  expect(url).toMatch(/\/view#data=/)

  const viewer = await context.newPage()
  await viewer.goto(url)
  await expect(viewer).toHaveURL(/\/view#data=/)
  await expect(viewer.getByTestId('shared-cv-stub')).toHaveText('John Doe')
  await expect(viewer.getByRole('tab', { name: 'Direct Edit' })).toHaveCount(0)
  await expect(viewer.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  await expect(viewer.locator('.site-footer')).toHaveCount(0)
  await expect(viewer.locator('.project-header')).toHaveCount(0)
})

test('an old /cv#data= link opened fresh lands on /view', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)

  const viewer = await context.newPage()
  await viewer.goto(url.replace('/view#', '/cv#'))
  await expect(viewer).toHaveURL(/\/view#data=/)
  await expect(viewer.getByTestId('shared-cv-stub')).toHaveText('John Doe')
  await expect(viewer.getByRole('tab', { name: 'Direct Edit' })).toHaveCount(0)
})

test('an edit link opens the builder', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)

  const viewer = await context.newPage()
  await viewer.goto(shareEditUrl(url))
  await expect(viewer).toHaveURL(/\/cv#data=.*&edit=1/)
  await expect(viewer.getByRole('tab', { name: 'Direct Edit' })).toBeVisible()
})

test('reloading an old /cv#data= tab stays in the builder', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)

  const viewer = await context.newPage()
  await viewer.goto(shareEditUrl(url))
  await expect(viewer.getByRole('tab', { name: 'Direct Edit' })).toBeVisible()
  await viewer.evaluate(() => history.replaceState(history.state, '', location.href.replace('&edit=1', '')))
  await viewer.reload()
  await expect(viewer).toHaveURL(/\/cv#data=/)
  await expect(viewer.getByRole('tab', { name: 'Direct Edit' })).toBeVisible()
})

test('reloading /view keeps the page', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)

  const viewer = await context.newPage()
  await viewer.goto(url)
  await expect(viewer.getByTestId('shared-cv-stub')).toHaveText('John Doe')
  await viewer.reload()
  await expect(viewer).toHaveURL(url)
  await expect(viewer.getByTestId('shared-cv-stub')).toHaveText('John Doe')
})

test('a corrupt link shows the message', async ({ page }) => {
  await page.goto('/view#data=not-a-cv')
  await expect(page.getByRole('heading', { name: "This CV link can't be opened" })).toBeVisible()
  await expect(page.getByText('The link may have been cut short or changed. Ask the sender for a new one.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Go to PortifyCV' })).toHaveAttribute('href', '/')
})

test('/view with no data shows the message', async ({ page }) => {
  await page.goto('/view')
  await expect(page.getByRole('heading', { name: "This CV link can't be opened" })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Go to PortifyCV' })).toHaveAttribute('href', '/')
})
