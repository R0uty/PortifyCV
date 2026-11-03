import { test, expect } from './fixtures/base.js'
import { fontTrigger, openDesign } from './helpers/builderToolbar.js'

// 1.6.67: the builder toolbar keeps the mode switch, Template, Design,
// language, More and Export in one row on a laptop. Style, Font and
// Headings share the Design panel; the narrow/fullscreen previews, Cover
// letter, Settings and Clear CV share the More menu; Copy share link ends
// the Export menu. On a phone the toolbar is two rows and Classic's tab bar
// one.

// Each control's vertical middle: controls on one row share it, while
// their top edges differ with their heights.
const middles = (page, selectors) => page.evaluate((list) => list.map((selector) => {
  const box = document.querySelector(selector).getBoundingClientRect()
  return Math.round(box.top + box.height / 2)
}), selectors)

test.describe('Builder toolbar', () => {
  for (const mode of ['Classic', 'Direct Edit']) {
    test(`is one row at 1280px (${mode})`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('/cv')
      await page.getByRole('tab', { name: mode }).click()
      const rowMiddles = await middles(page, [
        '[aria-label="Return to landing"]', '.app-toolbar__mode-switch', '.app-toolbar__template-trigger', '.app-toolbar__primary',
      ])
      expect(new Set(rowMiddles).size).toBe(1)
    })
  }

  test('Escape closes an open dropdown in the Design panel before the panel', async ({ page }) => {
    await page.goto('/cv')
    await (await fontTrigger(page)).click()
    await expect(page.getByRole('listbox', { name: 'Select font' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('listbox', { name: 'Select font' })).toBeHidden()
    await expect(page.getByRole('group', { name: 'Design' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('group', { name: 'Design' })).toBeHidden()
    await expect(page.getByRole('banner').getByRole('button', { name: 'Design' })).toBeFocused()
  })

  test('a click on a caption inside the Design panel keeps it open', async ({ page }) => {
    await page.goto('/cv')
    await openDesign(page)
    const panel = page.getByRole('group', { name: 'Design' })
    await panel.getByText('Font', { exact: true }).click()
    await expect(panel).toBeVisible()
  })

  test('the More menu toggles the narrow preview and shows it checked', async ({ page }) => {
    await page.goto('/cv')
    const more = page.getByRole('banner').getByRole('button', { name: 'More actions' })
    await more.click()
    await page.getByRole('menuitemcheckbox', { name: 'Narrow preview' }).click()
    await expect(page.getByRole('menu')).toBeHidden()
    await more.click()
    await expect(page.getByRole('menuitemcheckbox', { name: 'Narrow preview' })).toHaveAttribute('aria-checked', 'true')
  })

  test('Copy share link is in the Export menu', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/cv')
    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    await page.getByRole('menuitem', { name: /^Copy share link/ }).click()
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#data=')
  })
})

test.describe('Builder toolbar on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })

  for (const mode of ['Classic', 'Direct Edit']) {
    test(`is two rows, without sideways scroll (${mode})`, async ({ page }) => {
      await page.goto('/cv')
      await page.getByRole('tab', { name: mode }).click()
      const [back, exportMiddle, modeSwitch, template, design] = await middles(page, [
        '[aria-label="Return to landing"]', '.app-toolbar__primary',
        '.app-toolbar__mode-switch', '.app-toolbar__template-trigger', '.app-toolbar__design-trigger',
      ])
      expect(exportMiddle).toBe(back)
      expect(modeSwitch).toBeGreaterThan(back)
      expect(new Set([modeSwitch, template, design]).size).toBe(1)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
    })
  }

  test('the Design panel opens on screen', async ({ page }) => {
    await page.goto('/cv')
    await openDesign(page)
    const box = await page.getByRole('group', { name: 'Design' }).boundingBox()
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(375)
  })

  test('Classic\'s tab bar is one row of three tabs', async ({ page }) => {
    await page.goto('/cv')
    const tabs = page.getByRole('tablist', { name: 'View selector' }).getByRole('tab')
    await expect(tabs).toHaveCount(3)
    const tabTops = await tabs.evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().top)))
    expect(new Set(tabTops).size).toBe(1)
    const bar = await page.getByRole('tablist', { name: 'View selector' }).locator('xpath=..').boundingBox()
    expect(bar.height).toBeLessThan(70)
  })
})
