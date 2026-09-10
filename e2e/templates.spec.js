import { test, expect } from '@playwright/test'

// Regression guard for audit-1.0.1.md finding 5: sections used to stay
// editable (and listed in the nav rail) even when the selected template
// couldn't render them at all. Minimalist supports 5 section types;
// Developer supports 11, including Certificates.
//
// The template picker is TemplateQuickSwitcher (see src/components/), a
// button that opens a scrollable strip of thumbnail cards rather than a
// native <select> — selecting a template means opening that panel and
// clicking the card with the matching name.
async function selectTemplate(page, label) {
  await page.getByRole('button', { name: /^Select template:/ }).click()
  const panel = page.getByRole('dialog', { name: 'Select template' })
  await panel.getByRole('button', { name: label, exact: true }).click()
}

test.describe('Template-gated sections', () => {
  test('switching templates shows and hides matching nav rail sections', async ({ page }) => {
    await page.goto('/cv')

    const nav = page.getByRole('navigation', { name: 'Section navigation' })

    // Minimalist is the default template and does not support Certificates.
    await expect(page.locator('.template-quick-switcher__trigger-label')).toHaveText('Minimalist')
    await expect(nav.getByRole('button', { name: 'Certificates' })).toBeHidden()

    await selectTemplate(page, 'Developer')
    await expect(page.locator('.template-quick-switcher__trigger-label')).toHaveText('Developer')
    await expect(nav.getByRole('button', { name: 'Certificates' })).toBeVisible()

    await selectTemplate(page, 'Minimalist')
    await expect(nav.getByRole('button', { name: 'Certificates' })).toBeHidden()
  })

  test('a section hidden by the template is not rendered in the form either', async ({ page }) => {
    await page.goto('/cv')

    // Scoped to the editor form panel, not the live preview — the bespoke
    // Showcase templates render their own "Certificates" section heading in
    // the preview whenever the section is visible, which is expected and a
    // separate concern from whether the form side renders the section.
    const formPanel = page.locator('.editor-panel')

    await expect(formPanel.getByRole('heading', { name: 'Certificates', exact: true })).toBeHidden()

    await selectTemplate(page, 'Developer')

    await expect(formPanel.getByRole('heading', { name: 'Certificates', exact: true })).toBeVisible()
  })
})

test.describe('Template accent color', () => {
  test('choosing a swatch recolors the Modern Timeline preview', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'Modern Timeline')

    await page.getByRole('button', { name: 'Settings' }).first().click()
    // 'Blue' is the 2nd swatch in the 'cool' set (#2563eb)
    await page.getByRole('button', { name: 'Blue', exact: true }).click()
    await page.getByRole('button', { name: 'Close' }).click()

    const root = page.locator('.timeline-showcase').first()
    // `--tl-accent` is an inline CSS custom property; browsers return it as
    // authored (`#2563eb`), not normalized to rgb().
    const accent = await root.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--tl-accent').trim(),
    )
    expect(accent.toLowerCase()).toBe('#2563eb')
  })

  test('choosing a swatch recolors the Creative preview', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'Creative')

    await page.getByRole('button', { name: 'Settings' }).first().click()
    // 'Teal' is the 6th swatch in the 'warmCoral' set (#1f7a6c)
    await page.getByRole('button', { name: 'Teal', exact: true }).click()
    await page.getByRole('button', { name: 'Close' }).click()

    const root = page.locator('.creative-showcase').first()
    const accent = await root.evaluate((el) => ({
      accent: el.style.getPropertyValue('--tpl-accent').trim(),
      soft: el.style.getPropertyValue('--tpl-accent-soft').trim(),
    }))
    expect(accent.accent.toLowerCase()).toBe('#1f7a6c')
    // the soft fill is derived in JS from the chosen accent, not a static hue
    expect(accent.soft).toBe('rgba(31, 122, 108, 0.12)')
  })
})

test.describe('Link URL formatting', () => {
  test('templates render link values without the https:// scheme', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    for (const label of ['Compact', 'Navy Professional', 'Modern Timeline']) {
      await selectTemplate(page, label)
      const preview = page.locator('[data-export-root]')
      // Positive: the Links section shows the scheme-stripped value.
      await expect(preview.getByText('linkedin.com/in/alexmorgan', { exact: false }).first()).toBeVisible()
      // Negative: the raw stored value (with scheme) is gone from the Links
      // section. Exact match so the demo CV's Project entries — which
      // legitimately render full URLs like
      // https://github.com/alexmorgan/atlas-design-system and are out of
      // scope here — don't trip the assertion.
      await expect(preview.getByText('https://linkedin.com/in/alexmorgan', { exact: true })).toHaveCount(0)
      await expect(preview.getByText('https://github.com/alexmorgan', { exact: true })).toHaveCount(0)
    }
  })
})
