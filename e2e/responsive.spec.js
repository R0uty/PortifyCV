import { test, expect } from '@playwright/test'

// Regression guard for audit-1.0.2.md: .app-toolbar__group had no
// flex-wrap, so its ~7 children (template select, locale, print,
// responsive/fullscreen toggles, copy-link, export) stayed in one
// unbreakable row and pushed the whole page wider than the viewport on a
// phone-sized screen — a horizontal scrollbar on the one page (the editor)
// most likely to be used on mobile. A plain narrow viewport is enough to
// catch this — no need for full device emulation (touch, UA, a second
// browser engine to install) just to check for horizontal overflow.
test.use({ viewport: { width: 390, height: 844 } })

// Overflow from the self-hosted Inter font (uppercase, letter-spaced button
// text especially) only shows up once the font has actually swapped in —
// measuring too early gives a false negative on the fallback system font's
// narrower metrics, which is exactly how this bug went unnoticed.
// `document.fonts.ready` alone resolved inconsistently in testing (still
// racy immediately after `page.goto`'s 'load' event); waiting for
// `networkidle` first — so the font files have actually finished
// downloading — made it reproduce reliably across repeated runs.
async function hasHorizontalOverflow(page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
}

test.describe('Mobile layout', () => {
  test('the builder has no horizontal overflow', async ({ page }) => {
    await page.goto('/cv')

    expect(await hasHorizontalOverflow(page)).toBe(false)
  })

  test('the landing page has no horizontal overflow', async ({ page }) => {
    await page.goto('/')

    expect(await hasHorizontalOverflow(page)).toBe(false)
  })

  // Regression guard: below the `lg` breakpoint, the editor and preview are
  // one long page-scrolled column (AppShell's showContentOnMobile), not two
  // independently-scrolling panes like on desktop. The Editor/Preview tabs
  // in the mobile bottom bar only toggled which pane was in the DOM — they
  // never scrolled to it, so tapping "Preview" while scrolled into a long
  // form produced no visible change at all (the preview section just got
  // appended thousands of pixels below the current scroll position).
  test('tapping Preview in the mobile tab bar scrolls the preview into view', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    await page.getByRole('tab', { name: 'Preview' }).click()
    await expect(page.locator('.app-shell__preview')).toBeInViewport()

    await page.getByRole('tab', { name: 'Editor' }).click()
    await expect(page.locator('.app-shell__editor')).toBeInViewport()
  })

  // Regression guard: .app-shell__surface had a leftover `height: 100%;
  // overflow: auto;` below the `lg` breakpoint, turning it into its own
  // internally-scrolling box stacked on top of the normal page instead of
  // just flowing into it (it's a flex item of .one-pager, so it still gets
  // a definite computed height from flexbox even with no height of its own
  // — that's enough for `height: 100%` to "work" and start clipping). The
  // practical symptom: touches over most of the screen hit that box's
  // cramped internal touch-scroll region instead of the page, so scrolling
  // only worked very close to the top or bottom of the screen. The fix is
  // that this element must NOT be its own scroll container on mobile — the
  // page itself (documentElement) should be, with the surface just flowing
  // to its natural (taller-than-viewport) content height.
  test('the builder scrolls the page, not an inner box, on mobile', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    const overflowsPage = await page.evaluate(
      () => document.documentElement.scrollHeight > document.documentElement.clientHeight,
    )
    expect(overflowsPage).toBe(true)

    const surfaceIsNotItsOwnScrollbox = await page.evaluate(() => {
      const surface = document.querySelector('.app-shell__surface')
      return surface.scrollHeight <= surface.clientHeight + 1
    })
    expect(surfaceIsNotItsOwnScrollbox).toBe(true)
  })

  // Regression guard: the CSS `zoom` property (used by .preview-zoom-wrapper
  // to scale the CV preview — app-shell.css) is well known to break native
  // touch-drag scrolling in WebKit/iOS, even at zoom:1 — an element with
  // `zoom` applied gets its own hit-testing context that touch-scroll
  // gestures starting inside it don't reliably escape, while gestures
  // starting outside it (e.g. right at the screen's top/bottom edge) scroll
  // the page fine. That produced the "only scrolls near the top or bottom
  // of the screen" bug. There's no visual cost to disabling it below the
  // `lg` breakpoint: the zoom bar is hidden there (see the next rule down in
  // utilities.css) so zoomPercent never leaves its 100% default anyway.
  // getComputedStyle().zoom isn't a reliable check here — Chromium reports
  // "1" for both `zoom: 1` and `zoom: normal` — so this checks the actual
  // cascade winner in the stylesheets instead.
  test('the CSS zoom property is disabled on the preview wrapper on mobile', async ({ page }) => {
    await page.goto('/cv')
    await page.locator('.preview-zoom-wrapper').waitFor({ state: 'attached' })

    const mobileZoomIsNormal = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        let rules
        try { rules = sheet.cssRules } catch { continue }
        for (const rule of rules) {
          if (rule.media?.mediaText === '(max-width: 1023px)') {
            for (const inner of rule.cssRules) {
              if (inner.selectorText === '.preview-zoom-wrapper' && inner.style.zoom === 'normal') {
                return true
              }
            }
          }
        }
      }
      return false
    })
    expect(mobileZoomIsNormal).toBe(true)
  })

  // Regression guard: Settings only lived in the desktop nav-rail
  // (app-shell__nav, display: none below the lg breakpoint) with no
  // equivalent anywhere in the mobile bottom bar — mobile users had no way
  // to reach ATS-friendly mode, section visibility, or session restore.
  test('Settings is reachable via the toolbar gear icon on mobile', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})

test.describe('Desktop toolbar dropdowns', () => {
  // Regression guard: the toolbar's last group (Template/Font/Color pickers
  // plus locale/print/export controls) wraps onto its own row via flex-wrap
  // at plenty of real desktop widths — 1280px reproduces it reliably. Each
  // picker's dropdown panel used to be `position: absolute; right: 0`
  // relative to its own trigger, assuming the trigger always had room to its
  // left; once a wrapped row pushed a trigger toward the screen's left edge
  // instead, that assumption broke and the panel rendered mostly off-screen
  // to the left — clicking any option inside it was impossible. Panels now
  // position themselves in fixed viewport coordinates via
  // useAnchoredPanelPosition, clamped to stay fully on-screen regardless of
  // where the toolbar wrapping puts the trigger.
  test.use({ viewport: { width: 1280, height: 800 } })

  async function expectPanelOnScreen(page, triggerNamePattern, panelRole = 'dialog') {
    const viewport = page.viewportSize()
    await page.getByRole('button', { name: triggerNamePattern }).click()
    const panel = page.getByRole(panelRole)
    const box = await panel.boundingBox()
    expect(box).not.toBeNull()
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
  }

  test('the template picker panel stays on-screen when the toolbar wraps', async ({ page }) => {
    await page.goto('/cv')
    await expectPanelOnScreen(page, /^Select template:/)
  })

  test('the font picker panel stays on-screen when the toolbar wraps', async ({ page }) => {
    await page.goto('/cv')
    await expectPanelOnScreen(page, /^Select font:/, 'listbox')
  })

  test('the heading color picker panel stays on-screen when the toolbar wraps', async ({ page }) => {
    await page.goto('/cv')
    await expectPanelOnScreen(page, /^Select heading color:/)
  })
})
