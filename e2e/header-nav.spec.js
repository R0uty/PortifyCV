import { test, expect } from './fixtures/base.js'

// 1.6.31: the header has Templates, Examples, a Guides menu and FAQ, then
// the language switch and a "Build my CV" button (was seven equal links).
test.describe('Header navigation', () => {
  test('shows four entries and a Build my CV button', async ({ page }) => {
    await page.goto('/how-to-write-a-cv')
    const nav = page.getByRole('navigation', { name: 'Site menu' })
    await expect(nav.getByRole('link', { name: 'Templates' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Examples', exact: true })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'Guides' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'FAQ' })).toBeVisible()
    // The current guide marks the Guides menu active.
    await expect(nav.getByRole('button', { name: 'Guides' })).toHaveClass(/project-header__link--active/)

    await page.getByRole('banner').getByRole('button', { name: 'Build my CV' }).click()
    await expect(page).toHaveURL(/\/cv$/)
  })

  test('the Guides menu opens, closes on Escape, and its links navigate', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('button', { name: 'Guides' })
    const menu = page.locator('#header-guides-menu')
    await expect(menu).toBeHidden()

    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(menu.getByRole('link')).toHaveCount(5)
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(button).toBeFocused()

    await button.click()
    await menu.getByRole('link', { name: 'ATS-friendly CV guide' }).click()
    await expect(page).toHaveURL(/\/ats-friendly-cv-guide$/)
    await expect(menu).toBeHidden()
  })

  test('a template page marks Templates active; FAQ scrolls to the landing FAQ', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    const nav = page.getByRole('navigation', { name: 'Site menu' })
    await expect(nav.getByRole('link', { name: 'Templates' })).toHaveClass(/project-header__link--active/)

    await nav.getByRole('link', { name: 'FAQ' }).click()
    await expect(page).toHaveURL(/\/#faq$/)
    await expect.poll(() => page.locator('#faq').evaluate((el) => Math.round(el.getBoundingClientRect().top)))
      .toBeLessThan(200)
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('the menu lists Build my CV, the main links and every guide', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: 'Site menu' }).click()
      const dialog = page.getByRole('dialog', { name: 'Site menu' })
      await expect(dialog.getByRole('button', { name: 'Build my CV' })).toBeVisible()
      for (const name of ['Templates', 'Examples', 'FAQ', 'How to use the builder', 'How to write a CV',
        'ATS-friendly CV guide', 'CV skills examples', 'Cover letter examples']) {
        await expect(dialog.getByRole('link', { name, exact: true })).toHaveCount(1)
      }
      await dialog.getByRole('link', { name: 'Examples', exact: true }).click()
      await expect(page).toHaveURL(/\/cv-examples$/)
    })
  })
})
