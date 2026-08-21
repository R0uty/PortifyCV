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
