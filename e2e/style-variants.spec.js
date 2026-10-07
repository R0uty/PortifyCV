import { test, expect } from './fixtures/base.js'
import { getTemplateVariants } from '../src/utils/templateVariants.js'

// The Style picker (Phase 3) in both builder modes. Part 2 adds the
// persistence tests once real variants exist (Task 11).
const styleTrigger = (page) => page.getByRole('banner').getByRole('button', { name: /^Select style:/ })
const fontTrigger = (page) => page.getByRole('banner').getByRole('button', { name: /^Select font:/ })
const styleGroup = (page) => page.getByRole('radiogroup', { name: 'Select style' })

for (const mode of ['classic', 'direct']) {
  test.describe(`Style picker (${mode})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/cv?template=developer')
      if (mode === 'direct') await page.getByRole('tab', { name: 'Direct Edit' }).click()
    })

    test('lists the template\'s looks with the current one checked', async ({ page }) => {
      await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original')
      await styleTrigger(page).click()
      await expect(styleGroup(page).getByRole('radio')).toHaveCount(getTemplateVariants('developer').length)
      await expect(styleGroup(page).getByRole('radio', { name: 'Original' })).toHaveAttribute('aria-checked', 'true')
      await page.keyboard.press('Escape')
      await expect(styleGroup(page)).toBeHidden()
      await expect(styleTrigger(page)).toBeFocused()
    })

    test('works from the keyboard', async ({ page }) => {
      await styleTrigger(page).focus()
      await page.keyboard.press('Enter')
      const checked = styleGroup(page).getByRole('radio', { checked: true })
      await expect(checked).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowUp')
      await expect(checked).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(styleGroup(page)).toBeHidden()
      await expect(styleTrigger(page)).toBeFocused()
    })

    test('a font tweak shows Modified; picking the look again resets it', async ({ page }) => {
      await fontTrigger(page).click()
      await page.getByRole('option', { name: 'Georgia' }).click()
      await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original, Modified')
      await styleTrigger(page).click()
      await styleGroup(page).getByRole('radio', { name: 'Original' }).click()
      await expect(fontTrigger(page)).toHaveAccessibleName('Select font: Inter')
      await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original')
    })
  })
}

test('the picker follows the selected template', async ({ page }) => {
  await page.goto('/cv?template=creative')
  await styleTrigger(page).click()
  await expect(styleGroup(page).getByRole('radio')).toHaveCount(getTemplateVariants('creative').length)
})

test('Finnish labels', async ({ page }) => {
  await page.goto('/cv?template=developer')
  await page.getByRole('button', { name: 'Switch language' }).click()
  await expect(page.getByRole('banner').getByRole('button', { name: /^Valitse tyyli:/ }))
    .toHaveAccessibleName('Valitse tyyli: Alkuperäinen')
})
