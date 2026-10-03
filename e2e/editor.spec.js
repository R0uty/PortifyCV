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

    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('Alex Morgan')
    await expect(page.locator('.preview-panel')).toContainText('Alex Morgan')
    await expect(page.locator('.preview-panel')).toContainText('Senior Product Designer')
  })

  test('Reset form clears a filled-in field', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('Alex Morgan')

    // "Reset form" is a two-step button: first click arms it, second click clears.
    await page.getByRole('button', { name: 'Reset form' }).click()
    await page.getByRole('button', { name: 'Confirm reset' }).click()

    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('')
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
