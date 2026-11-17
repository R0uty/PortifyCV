import { test, expect } from './fixtures/base.js'

// Writing hints under each achievement bullet (1.7.3,
// utils/cvFeedback.js's getBulletHints; the rules themselves are checked by
// scripts/check-cv-feedback.mjs). The hint shows once the caret leaves the
// bullet, is read with it (aria-describedby), and goes when the bullet is
// fixed. The suite opens the builder in Classic mode (playwright.config.js).

const WEAK = 'Responsible for the design system'
const STRONG = 'Built a design system adopted by 6 product teams.'

test.describe('Bullet hints', () => {
  test('Classic: a hint appears under the bullet after leaving it, and goes once it is fixed', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await page.getByRole('navigation').getByRole('button', { name: 'Experience' }).first().click()

    const bullet = page.getByRole('textbox', { name: 'Achievement 1' }).first()
    await bullet.fill(WEAK)
    // Not while typing.
    await expect(bullet).not.toHaveAttribute('aria-describedby')

    await bullet.blur()
    const hintId = await bullet.getAttribute('aria-describedby')
    expect(hintId).toBeTruthy()
    const hints = page.locator(`[id="${hintId}"]`)
    await expect(hints).toContainText('"responsible for" reads like a duty list.')

    await bullet.fill(STRONG)
    await bullet.blur()
    await expect(bullet).not.toHaveAttribute('aria-describedby')
    await expect(hints).toHaveCount(0)
  })

  test('Direct Edit: the entry popup shows the same hints', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await page.locator('.direct-edit-actions').getByRole('button', { name: 'Load demo CV' }).click()

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil--active').click()
    const list = page.locator('.direct-edit-popup .direct-edit-popup__entry').first()
      .locator('.direct-edit-popup__list[data-field="achievements"]')

    const first = list.locator('input').first()
    await first.fill('Led the 2024 checkout migration for 3 markets.')
    const second = list.locator('input').nth(1)
    await second.fill('Led a team of 5 engineers.')
    await first.focus()

    await expect(list.locator('[data-hint="repeated-opener"]')).toHaveText('Starts with the same word as bullet 1. Vary the verb.')
    await expect(second).toHaveAttribute('aria-describedby', /.+/)
  })

  test('hints follow the Finnish UI', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('ui-locale', 'fi'))
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Lataa demo-CV' }).first().click()
    await page.getByRole('navigation').getByRole('button', { name: 'Kokemus' }).first().click()

    const bullet = page.getByRole('textbox', { name: 'Saavutus 1' }).first()
    await bullet.fill('Osallistuin 12 hengen projektiin.')
    await bullet.blur()
    await expect(page.locator(`[id="${await bullet.getAttribute('aria-describedby')}"]`))
      .toContainText('kuulostaa tehtävälistalta')
  })
})
