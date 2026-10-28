import { test, expect } from './fixtures/base.js'

test.describe('CV editor', () => {
  test('typing a name updates the live preview', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('textbox', { name: /Full name/ }).fill('Ada Lovelace')

    await expect(page.locator('.preview-panel')).toContainText('Ada Lovelace')
  })

  test('Load demo CV fills the form and the preview', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('John Doe')
    await expect(page.locator('.preview-panel')).toContainText('John Doe')
    await expect(page.locator('.preview-panel')).toContainText('Senior Product Designer')
  })

  test('Reset form clears a filled-in field', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('John Doe')

    // "Reset form" is a two-step button: first click arms it, second click clears.
    await page.getByRole('button', { name: 'Reset form' }).click()
    await page.getByRole('button', { name: 'Confirm reset' }).click()

    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('')
  })

  // The demo CV carries no sectionVisibility map; the first toggle from that
  // state used to be a no-op, so hiding a section took two clicks.
  test('one click on a Visible sections toggle hides the section right after Load demo CV', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    const previewSkills = page.locator('.app-shell__preview [data-export-section="skills"]')
    await expect(previewSkills).toBeVisible()

    await page.getByRole('button', { name: 'Visible sections' }).click()
    const skillsToggle = page.getByRole('checkbox', { name: 'Skills: On' })
    await skillsToggle.locator('xpath=..').click()

    await expect(page.getByRole('checkbox', { name: 'Skills: Off' })).not.toBeChecked()
    await expect(previewSkills).toHaveCount(0)
  })

  // Fit Page must size the zoom from the CV the user actually sees, not
  // from previewRef's off-screen export source — that copy hides empty
  // sections' placeholders and carries .pdf-export-root's PDF-only spacing,
  // so its height diverges from the visible preview's (most of all on a
  // blank form, where nearly every section is a placeholder).
  for (const withDemo of [false, true]) {
    test(`Fit Page scales the visible preview to fit the preview panel (${withDemo ? 'demo CV' : 'blank form'})`, async ({ page }) => {
      // Tall enough that the fitted zoom lands above handleFitPage's 40%
      // floor — at the default 720px height a full CV clamps there, and the
      // test would only exercise the clamp, not the fit.
      await page.setViewportSize({ width: 1280, height: 1400 })
      await page.goto('/cv')
      if (withDemo) {
        await page.getByRole('button', { name: 'Load demo CV' }).first().click()
      }
      const visibleCv = page.locator('.preview-zoom-wrapper [data-export-variant]')
      await expect(visibleCv).toBeVisible()

      // Fit from two different starting zooms: the CV reflows to its zoomed
      // width, so a fit computed from the current zoom's height alone lands
      // somewhere different depending on where it started.
      const fittedZooms = []
      for (const startPreset of ['150%', '100%']) {
        await page.getByRole('button', { name: startPreset, exact: true }).click()
        await page.getByRole('button', { name: 'Fit page' }).click()

        const geometry = await page.evaluate(() => {
          const viewport = document.querySelector('.preview-panel')
          const wrapper = document.querySelector('.preview-zoom-wrapper')
          const cv = wrapper.querySelector('[data-export-variant]')
          const zoom = Number(wrapper.style.getPropertyValue('--preview-zoom'))
          const renderedHeight = cv.getBoundingClientRect().height
          // One percent more must overflow, or Fit Page left room unused.
          wrapper.style.setProperty('--preview-zoom', String(zoom + 0.01))
          const heightOneStepUp = cv.getBoundingClientRect().height
          wrapper.style.setProperty('--preview-zoom', String(zoom))
          return {
            zoom,
            renderedHeight,
            heightOneStepUp,
            // Mirrors handleFitPage's availableHeight.
            availableHeight: viewport.clientHeight - 48,
          }
        })

        expect(geometry.zoom).toBeGreaterThan(0.4)
        expect(geometry.zoom).toBeLessThan(2)
        expect(geometry.renderedHeight).toBeLessThanOrEqual(geometry.availableHeight)
        expect(geometry.heightOneStepUp).toBeGreaterThan(geometry.availableHeight)
        fittedZooms.push(geometry.zoom)
      }

      expect(fittedZooms[1]).toBe(fittedZooms[0])
    })
  }
})

// 1.6.61: at a 1024px window the Classic form column is ~220px wide. Field
// rows switched to 2–3 columns on window width, so Email / Phone / Location
// got ~63px each, the Location label overflowed the panel, and focusing it
// scrolled the panel sideways, cutting off its left edge. Rows now follow
// the form column's width, and the Visible sections badge wraps instead of
// running under its toggle.
test.describe('Classic form in a narrow column', () => {
  test.use({ viewport: { width: 1024, height: 900 } })

  test('no form panel is wider than its box, and focusing a field never shifts it', async ({ page }) => {
    await page.goto('/cv?template=executive&example=finance-director')
    await page.getByRole('tab', { name: 'Classic' }).click()
    const location = page.getByRole('textbox', { name: /^Location/ }).first()
    await location.focus()
    const panels = await page.locator('.editor-panel .panel-section__body-inner').evaluateAll((els) => els
      .filter((el) => el.clientWidth > 0)
      .map((el) => ({ extra: el.scrollWidth - el.clientWidth, shifted: el.scrollLeft })))
    expect(panels.length).toBeGreaterThan(0)
    for (const panel of panels) {
      expect(panel.extra).toBeLessThanOrEqual(0)
      expect(panel.shifted).toBe(0)
    }

    const badge = page.getByText(/^\d+\/\d+ visible$/i).first()
    const toggle = page.locator('.editor-panel .panel-section__toggle').first()
    const [b, t] = await Promise.all([badge.boundingBox(), toggle.boundingBox()])
    const overlaps = b.x < t.x + t.width && b.x + b.width > t.x && b.y < t.y + t.height && b.y + b.height > t.y
    expect(overlaps).toBe(false)
  })

  // 1.6.62: the Classic preview lays the CV out at its 220mm paper width and
  // scales it to the pane, instead of reflowing it to the pane's width —
  // which squeezed Executive's main column to about 110px at this size.
  test('the preview is a scaled paper-width page, and zooming past the pane scrolls only the page', async ({ page }) => {
    await page.goto('/cv?template=executive&example=finance-director')
    await page.getByRole('tab', { name: 'Classic' }).click()
    const wrapper = page.locator('.preview-zoom-wrapper')
    const layout = () => wrapper.evaluate((el) => {
      const zoom = Number(el.style.getPropertyValue('--preview-zoom'))
      const stage = el.closest('.preview-stage')
      const panel = el.closest('.preview-panel')
      return {
        zoom,
        main: el.querySelector('[data-export-primary]').getBoundingClientRect().width / zoom,
        stageExtra: stage.scrollWidth - stage.clientWidth,
        panelExtra: panel.scrollWidth - panel.clientWidth,
      }
    })

    await expect.poll(async () => (await layout()).zoom).toBeLessThan(1)
    const fitted = await layout()
    expect(fitted.main).toBeGreaterThan(500)
    expect(fitted.stageExtra).toBeLessThanOrEqual(0)

    await page.getByRole('button', { name: '150%' }).click()
    await expect.poll(async () => (await layout()).zoom).toBe(1.5)
    const zoomed = await layout()
    expect(zoomed.stageExtra).toBeGreaterThan(0)
    expect(zoomed.panelExtra).toBeLessThanOrEqual(0)

    await page.getByRole('button', { name: 'Fit width' }).click()
    await expect.poll(async () => (await layout()).zoom).toBe(fitted.zoom)
  })
})
