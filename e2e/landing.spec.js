import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('shows the hero, a picture of the output, and the trust line', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Build a CV' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Example CV built with PortifyCV' })).toBeVisible()
    await expect(page.getByText('No login. No data saved.')).toBeVisible()
  })

  test('Start building opens the CV editor', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Start building' }).click()

    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Section navigation' })).toBeVisible()
  })
})
