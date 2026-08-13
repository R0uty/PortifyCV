import { test, expect } from '@playwright/test'

test.describe('Export menu', () => {
  test('lists PDF, HTML, and JSON, and closes on outside click', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()

    const menu = page.getByRole('menu')
    await expect(menu.getByRole('menuitem', { name: 'PDF' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'HTML' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'JSON' })).toBeVisible()

    await page.getByRole('heading', { name: 'Profile', exact: true }).click()
    await expect(menu).toBeHidden()
  })

  test('JSON export downloads a .json file', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'JSON' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.json$/)
  })

  test('HTML export downloads an .html file', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'HTML' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.html$/)
  })
})
