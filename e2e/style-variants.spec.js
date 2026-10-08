import { test, expect } from './fixtures/base.js'
import { getTemplateVariants } from '../src/utils/templateVariants.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'

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

// Acceptance for the Style control's width: at 1280x720 it must not add a
// toolbar row for any template in either mode, even in its widest state
// below 1600px (Modified, via a font tweak). Compares the toolbar's height
// with and without the Style control (hidden via an injected style tag).
const HIDE_STYLE_CONTROL = '.cv-style-switcher, .app-toolbar__labeled-control--style { display: none !important }'

// Reads the toolbar height once it has held still for a few frames.
const settledToolbarHeight = (page) => page.evaluate(async () => {
  const toolbar = document.querySelector('.app-toolbar')
  const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))
  let last = -1
  let stable = 0
  for (let i = 0; i < 60 && stable < 3; i += 1) {
    await frame()
    const height = toolbar.getBoundingClientRect().height
    stable = height === last ? stable + 1 : 0
    last = height
  }
  return last
})

for (const mode of ['classic', 'direct']) {
  test(`at 1280px the Style control adds no toolbar row (${mode}, every template, Modified) @slow`, async ({ page }) => {
    test.setTimeout(90_000)
    await page.setViewportSize({ width: 1280, height: 720 })
    const mismatches = []
    for (const { id } of cvTemplates) {
      await page.goto(`/cv?template=${id}`)
      await page.getByRole('tab', { name: mode === 'direct' ? 'Direct Edit' : 'Classic' }).click()
      await fontTrigger(page).click()
      await page.getByRole('option', { name: 'Times New Roman' }).click()
      await expect(styleTrigger(page)).toHaveAccessibleName(/, Modified$/)
      const withStyle = await settledToolbarHeight(page)
      const tag = await page.addStyleTag({ content: HIDE_STYLE_CONTROL })
      const withoutStyle = await settledToolbarHeight(page)
      await tag.evaluate((node) => node.remove())
      if (withStyle !== withoutStyle) mismatches.push(`${id}: ${withStyle}px with Style vs ${withoutStyle}px without`)
    }
    expect(mismatches).toEqual([])
  })
}
