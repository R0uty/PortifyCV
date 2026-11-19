import { test, expect } from './fixtures/base.js'

// The "Get ideas" panel under each job's achievements (1.7.8,
// components/fields/BulletIdeas.jsx, utils/bulletIdeas.js): example bullets
// for the job's role, blanked to [__], added with one click. The suite opens
// the builder in Classic mode (playwright.config.js).

async function openClassicExperience(page) {
  await page.goto('/cv')
  await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  await page.getByRole('navigation').getByRole('button', { name: 'Experience' }).first().click()
}

async function chooseCvLanguage(page, label) {
  await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: 'Settings' }).click()
  const dialog = page.getByRole('dialog', { name: 'Settings' })
  await dialog.getByRole('button', { name: label, exact: true }).click()
  await expect(dialog.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Escape')
}

test.describe('Bullet ideas', () => {
  test("Classic: ideas for the job's role add a blanked bullet", async ({ page }) => {
    await openClassicExperience(page)
    const toggle = page.getByRole('button', { name: 'Get ideas' }).first()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    const picker = page.getByLabel('Ideas from').first()
    await expect(picker).not.toHaveValue('')
    const add = page.getByRole('button', { name: /^Add: / }).first()
    await expect(add).toBeVisible()
    const label = await add.getAttribute('aria-label')
    await add.click()

    const last = page.locator('.reorderable-list').first().getByRole('textbox', { name: /^Achievement \d+$/ }).last()
    await expect(last).toHaveValue(/\[__\]/)
    await expect(page.getByRole('button', { name: label, exact: true })).toHaveCount(0)
  })

  test('Direct Edit: the entry popup offers the same ideas', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await page.locator('.direct-edit-actions').getByRole('button', { name: 'Load demo CV' }).click()

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil--active').click()
    const entry = page.locator('.direct-edit-popup .direct-edit-popup__entry').first()
    await entry.getByRole('button', { name: 'Get ideas' }).click()
    await entry.getByRole('button', { name: /^Add: / }).first().click()

    const list = entry.locator('.direct-edit-popup__list[data-field="achievements"]')
    await expect(list.locator('input').last()).toHaveValue(/\[__\]/)
  })

  test('a role that matches nothing asks for a role', async ({ page }) => {
    await openClassicExperience(page)
    await page.getByLabel('Role', { exact: true }).first().fill('Florist')
    await page.getByRole('button', { name: 'Get ideas' }).first().click()

    const picker = page.getByLabel('Ideas from').first()
    await expect(picker).toHaveValue('')
    await expect(page.getByRole('button', { name: /^Add: / })).toHaveCount(0)

    await picker.selectOption({ label: 'Registered nurse' })
    await expect(page.getByRole('button', { name: /^Add: / }).first()).toBeVisible()
  })

  test('ideas follow the CV language', async ({ page }) => {
    await openClassicExperience(page)
    await chooseCvLanguage(page, 'Suomi')
    await page.getByRole('button', { name: 'Get ideas' }).first().click()
    await expect(page.getByLabel('Ideas from').first().locator('option', { hasText: 'Sairaanhoitaja' })).toHaveCount(1)
  })

  test('export warns about blanks left in', async ({ page }) => {
    await openClassicExperience(page)
    await page.getByRole('button', { name: 'Get ideas' }).first().click()
    await page.getByRole('button', { name: /^Add: / }).first().click()

    await page.getByRole('banner').getByRole('button', { name: 'Export' }).click()
    await page.getByRole('menuitem', { name: 'JSON' }).click()
    await expect(page.getByText('1 bullet still holds [__].')).toBeVisible()
  })
})
