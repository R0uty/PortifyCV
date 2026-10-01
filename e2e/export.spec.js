import { test, expect } from '@playwright/test'

test.describe('Export menu', () => {
  test('lists PDF, HTML, JSON, and Word, and closes on outside click', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()

    const menu = page.getByRole('menu')
    await expect(menu.getByRole('menuitem', { name: 'PDF' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'HTML' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'JSON' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'Word' })).toBeVisible()

    await page.getByRole('heading', { name: 'Profile', exact: true }).click()
    await expect(menu).toBeHidden()
  })

  test('opens with focus on the first item and supports arrow-key navigation', async ({ page }) => {
    await page.goto('/cv')

    const trigger = page.getByRole('banner').getByRole('button', { name: 'Export', exact: true })
    await trigger.click()

    const menu = page.getByRole('menu')
    const items = menu.getByRole('menuitem')
    await expect(items.nth(0)).toBeFocused()

    await page.keyboard.press('ArrowDown')
    await expect(items.nth(1)).toBeFocused()

    await page.keyboard.press('ArrowDown')
    await expect(items.nth(2)).toBeFocused()

    await page.keyboard.press('ArrowDown')
    await expect(items.nth(3)).toBeFocused()

    // Wraps back to the first item.
    await page.keyboard.press('ArrowDown')
    await expect(items.nth(0)).toBeFocused()

    await page.keyboard.press('ArrowUp')
    await expect(items.nth(3)).toBeFocused()

    await page.keyboard.press('Home')
    await expect(items.nth(0)).toBeFocused()

    await page.keyboard.press('End')
    await expect(items.nth(3)).toBeFocused()
  })

  test('Escape closes the menu and returns focus to the trigger', async ({ page }) => {
    await page.goto('/cv')

    const trigger = page.getByRole('banner').getByRole('button', { name: 'Export', exact: true })
    await trigger.click()
    await expect(page.getByRole('menu')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('menu')).toBeHidden()
    await expect(trigger).toBeFocused()
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

  test('Word export downloads a .docx file', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'Word' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.docx$/)
  })
})
