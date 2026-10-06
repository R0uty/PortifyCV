import { test, expect } from './fixtures/base.js'

// Regression guard for audit-1.0.1.md finding 5: sections used to stay
// editable (and listed in the nav rail) even when the selected template
// couldn't render them at all. Minimalist supports 5 section types;
// Developer supports 11, including Certificates.
//
// The template picker is the toolbar's "Template" trigger, which opens
// TemplateGalleryModal (the same modal the nav rail's Templates item and
// the mobile "Templates" tab use) — selecting a template means opening
// that dialog and clicking the card with the matching name.
async function selectTemplate(page, label) {
  await page.getByRole('button', { name: /^Select template:/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Template gallery' })
  await dialog.getByText(label, { exact: true }).click()
}

test.describe('Template-gated sections', () => {
  test('switching templates shows and hides matching nav rail sections', async ({ page }) => {
    await page.goto('/cv')

    const nav = page.getByRole('navigation', { name: 'Section navigation' })

    // Minimalist is the default template and does not support Certificates.
    await expect(page.locator('.app-toolbar__template-trigger-label')).toHaveText('Minimalist')
    await expect(nav.getByRole('button', { name: 'Certificates' })).toBeHidden()

    await selectTemplate(page, 'Developer')
    await expect(page.locator('.app-toolbar__template-trigger-label')).toHaveText('Developer')
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
    // `--tpl-accent` is an inline CSS custom property; browsers return it as
    // authored (`#2563eb`), not normalized to rgb().
    const accent = await root.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--tpl-accent').trim(),
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

  test('choosing a swatch recolors the Graduate preview', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'Graduate')

    await page.getByRole('button', { name: 'Settings' }).first().click()
    // 'Emerald' is the 5th swatch in the 'coolIndigo' set (#059669)
    await page.getByRole('button', { name: 'Emerald', exact: true }).click()
    await page.getByRole('button', { name: 'Close' }).click()

    const root = page.locator('.graduate-showcase').first()
    const accent = await root.evaluate((el) => ({
      accent: el.style.getPropertyValue('--tpl-accent').trim(),
      soft: el.style.getPropertyValue('--tpl-accent-soft').trim(),
    }))
    expect(accent.accent.toLowerCase()).toBe('#059669')
    expect(accent.soft).toBe('rgba(5, 150, 105, 0.12)')
  })

  test('choosing a swatch recolors the Executive preview', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'Executive')

    await page.getByRole('button', { name: 'Settings' }).first().click()
    // 'Teal' is the 4th swatch in the 'warmGold' set (#0f766e)
    await page.getByRole('button', { name: 'Teal', exact: true }).click()
    await page.getByRole('button', { name: 'Close' }).click()

    const root = page.locator('.executive-showcase').first()
    const accent = await root.evaluate((el) => ({
      accent: el.style.getPropertyValue('--tpl-accent').trim(),
      soft: el.style.getPropertyValue('--tpl-accent-soft').trim(),
    }))
    expect(accent.accent.toLowerCase()).toBe('#0f766e')
    expect(accent.soft).toBe('rgba(15, 118, 110, 0.12)')
  })

  test('choosing a swatch recolors the Compact preview', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'Compact')

    await page.getByRole('button', { name: 'Settings' }).first().click()
    // 'Rose' is the 6th swatch in the 'coolBlue' set (#be123c)
    await page.getByRole('button', { name: 'Rose', exact: true }).click()
    await page.getByRole('button', { name: 'Close' }).click()

    const root = page.locator('.compact-showcase').first()
    const accent = await root.evaluate((el) => ({
      accent: el.style.getPropertyValue('--tpl-accent').trim(),
      soft: el.style.getPropertyValue('--tpl-accent-soft').trim(),
    }))
    expect(accent.accent.toLowerCase()).toBe('#be123c')
    expect(accent.soft).toBe('rgba(190, 18, 60, 0.1)')
  })

  test('choosing a swatch recolors the Quadrant preview', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'Quadrant')

    await page.getByRole('button', { name: 'Settings' }).first().click()
    // 'Emerald' is the 4th swatch in the 'coolCyan' set (#059669)
    await page.getByRole('button', { name: 'Emerald', exact: true }).click()
    await page.getByRole('button', { name: 'Close' }).click()

    const root = page.locator('.quadrant-showcase').first()
    const accent = await root.evaluate((el) => ({
      accent: el.style.getPropertyValue('--tpl-accent').trim(),
      soft: el.style.getPropertyValue('--tpl-accent-soft').trim(),
    }))
    expect(accent.accent.toLowerCase()).toBe('#059669')
    expect(accent.soft).toBe('rgba(5, 150, 105, 0.12)')
  })

  test('choosing a swatch recolors the Portfolio Hybrid preview', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'Portfolio Hybrid')

    await page.getByRole('button', { name: 'Settings' }).first().click()
    // 'Teal' is the 3rd swatch in the 'forestGreen' set (#0f766e)
    await page.getByRole('button', { name: 'Teal', exact: true }).click()
    await page.getByRole('button', { name: 'Close' }).click()

    const root = page.locator('.portfolio-showcase').first()
    const accent = await root.evaluate((el) => ({
      accent: el.style.getPropertyValue('--tpl-accent').trim(),
      soft: el.style.getPropertyValue('--tpl-accent-soft').trim(),
    }))
    expect(accent.accent.toLowerCase()).toBe('#0f766e')
    expect(accent.soft).toBe('rgba(15, 118, 110, 0.1)')
  })

  test('choosing a swatch recolors the Tech Executive preview', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'Tech Executive')

    await page.getByRole('button', { name: 'Settings' }).first().click()
    // 'Teal' is the 4th swatch in the 'royalBlue' set (#0f766e)
    await page.getByRole('button', { name: 'Teal', exact: true }).click()
    await page.getByRole('button', { name: 'Close' }).click()

    const root = page.locator('.tech-exec-showcase').first()
    const accent = await root.evaluate((el) => ({
      accent: el.style.getPropertyValue('--tpl-accent').trim(),
      soft: el.style.getPropertyValue('--tpl-accent-soft').trim(),
    }))
    expect(accent.accent.toLowerCase()).toBe('#0f766e')
    expect(accent.soft).toBe('rgba(15, 118, 110, 0.12)')
  })

  test('choosing a swatch recolors the Editorial preview', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'Editorial')

    await page.getByRole('button', { name: 'Settings' }).first().click()
    // 'Teal' is the 5th swatch in the 'inkCrimson' set (#0f766e)
    await page.getByRole('button', { name: 'Teal', exact: true }).click()
    await page.getByRole('button', { name: 'Close' }).click()

    const root = page.locator('.editorial-showcase').first()
    const accent = await root.evaluate((el) => ({
      accent: el.style.getPropertyValue('--tpl-accent').trim(),
      soft: el.style.getPropertyValue('--tpl-accent-soft').trim(),
    }))
    expect(accent.accent.toLowerCase()).toBe('#0f766e')
    expect(accent.soft).toBe('rgba(15, 118, 110, 0.12)')
  })

  test('choosing a swatch recolors the Portrait preview', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'Portrait')

    await page.getByRole('button', { name: 'Settings' }).first().click()
    // 'Slate' is the 3rd swatch in the 'quietTeal' set (#334155)
    await page.getByRole('button', { name: 'Slate', exact: true }).click()
    await page.getByRole('button', { name: 'Close' }).click()

    const root = page.locator('.portrait-showcase').first()
    const accent = await root.evaluate((el) => ({
      accent: el.style.getPropertyValue('--tpl-accent').trim(),
      soft: el.style.getPropertyValue('--tpl-accent-soft').trim(),
    }))
    expect(accent.accent.toLowerCase()).toBe('#334155')
    expect(accent.soft).toBe('rgba(51, 65, 85, 0.12)')
  })

  test('choosing a swatch recolors the European preview', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'European')

    await page.getByRole('button', { name: 'Settings' }).first().click()
    // 'Forest' is the 4th swatch in the 'civicBlue' set (#15803d)
    await page.getByRole('button', { name: 'Forest', exact: true }).click()
    await page.getByRole('button', { name: 'Close' }).click()

    const root = page.locator('.european-showcase').first()
    const accent = await root.evaluate((el) => ({
      accent: el.style.getPropertyValue('--tpl-accent').trim(),
      soft: el.style.getPropertyValue('--tpl-accent-soft').trim(),
    }))
    expect(accent.accent.toLowerCase()).toBe('#15803d')
    expect(accent.soft).toBe('rgba(21, 128, 61, 0.12)')
  })
})

test.describe('Classic Professional name alignment', () => {
  test('the retired Classic template is gone from the gallery', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: /^Select template:/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Template gallery' })
    await expect(dialog.getByText('Classic Professional', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Classic', { exact: true })).toHaveCount(0)
  })

  test('the Settings option toggles the header alignment', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'Classic Professional')

    const root = page.locator('.classic-professional-showcase').first()
    await expect(root).toHaveAttribute('data-name-align', 'center')

    await page.getByRole('button', { name: 'Settings' }).first().click()
    await page.getByRole('button', { name: 'Left', exact: true }).click()
    await page.getByRole('button', { name: 'Close' }).click()

    await expect(root).toHaveAttribute('data-name-align', 'left')
  })

  test('a legacy ?template=classic link opens Classic Professional, left-aligned', async ({ page }) => {
    await page.goto('/cv?template=classic')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    const root = page.locator('.classic-professional-showcase').first()
    await expect(root).toBeVisible()
    await expect(root).toHaveAttribute('data-name-align', 'left')
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

// Colorful Compact colours each section by its running position through
// six hues, so any one CV shows only a couple of skill-pill colours. This
// renders one pill per colour variant inside the live preview, styled by
// the shipped stylesheet, and holds every one to WCAG AA for normal text:
// the pills are small bold labels, so the large-text 3:1 allowance does
// not apply. White text on the old bright fills measured 2.49 (teal) to
// 3.96 (purple).
test.describe('Colorful Compact skill pills', () => {
  test('every colour variant reads at 4.5:1 or better', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await selectTemplate(page, 'Colorful Compact')
    await expect(page.locator('.colorful-compact-showcase').first()).toBeVisible()

    const ratios = await page.evaluate(() => {
      const luminance = (value) => {
        const [r, g, b] = value.match(/[\d.]+/g).map(Number)
        const channel = (v) => {
          const c = v / 255
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
      }
      const host = document.querySelector('.colorful-compact-showcase')

      return Object.fromEntries(
        ['pink', 'orange', 'green', 'teal', 'blue', 'purple'].map((color) => {
          const pill = document.createElement('span')
          pill.className = `colorful-compact-showcase__skill-pill colorful-compact-showcase__skill-pill--${color}`
          pill.textContent = 'Figma'
          host.appendChild(pill)
          const style = getComputedStyle(pill)
          const fg = luminance(style.color)
          const bg = luminance(style.backgroundColor)
          pill.remove()
          return [color, (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)]
        }),
      )
    })

    for (const [color, ratio] of Object.entries(ratios)) {
      expect(ratio, `${color} pill`).toBeGreaterThanOrEqual(4.5)
    }
  })
})

test.describe('Template gallery example links', () => {
  test('every card links to its template page without switching template', async ({ page }) => {
    const { cvTemplates } = await import('../src/utils/cvTemplates.js')
    await page.goto('/cv')
    await expect(page.locator('.app-toolbar__template-trigger-label')).toHaveText('Minimalist')

    await page.getByRole('button', { name: /^Select template:/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Template gallery' })
    const links = dialog.getByRole('link', { name: /^View examples/ })
    await expect(links).toHaveCount(cvTemplates.length)

    for (const template of cvTemplates) {
      const link = dialog.getByRole('link', { name: `View examples: ${template.label}` })
      await expect(link).toHaveAttribute('href', `/free-cv-templates/${template.slug}`)
      await expect(link).toHaveAttribute('target', '_blank')
    }

    const developer = cvTemplates.find((template) => template.id === 'developer')
    const popupPromise = page.waitForEvent('popup')
    await dialog.getByRole('link', { name: `View examples: ${developer.label}` }).click()
    const popup = await popupPromise
    await expect(popup).toHaveURL(new RegExp(`/free-cv-templates/${developer.slug}$`))
    await popup.close()

    // The gallery stays open and the selected template is unchanged.
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.app-toolbar__template-trigger-label')).toHaveText('Minimalist')
  })

  // Thumbnails render real CVs with <a> links in them, so they can't sit
  // inside the card's select <button>; clicking one still selects.
  test('no thumbnail sits inside a button or link, and clicking one selects its template', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: /^Select template:/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Template gallery' })
    // Wait for every thumbnail's Showcase chunk, and confirm Developer's
    // really renders links, so the nesting check below can't pass vacuously.
    await expect(dialog.locator('.template-gallery__thumb [data-export-variant]')).toHaveCount(18)
    await expect(dialog.locator('.template-gallery__card', { hasText: 'Developer' }).locator('.template-gallery__thumb a').first()).toBeAttached()
    expect(await dialog.locator('a a, button a, a button').count()).toBe(0)

    await dialog.locator('.template-gallery__card', { hasText: 'Developer' }).locator('.template-gallery__thumb').click()
    await expect(dialog).toBeHidden()
    await expect(page.locator('.app-toolbar__template-trigger-label')).toHaveText('Developer')
  })
})
