import { test, expect } from '@playwright/test'
import { STRESS_CVS } from './fixtures/stressCvs.js'
import { waitForStableLayout } from './helpers/layoutAudit.js'

// F12 (docs/template-audit-phase2.md G9, Task 9): the PDF export used to
// clone the live preview DOM verbatim, so a visible-but-empty section's
// "… will appear here" editing-affordance placeholder reached the exported
// PDF. The fix prunes any `[data-export-section]` node from the export
// clone whose formData section has no real content
// (pruneEmptySectionsFromClone, src/utils/exporters.js, called from
// createExportSandbox right after cloneNode).
//
// The PDF itself is image-based (html2canvas), so this can't assert on the
// final file's text. Instead it captures the export sandbox's clone DOM —
// the exact node html2canvas rasterizes — via a MutationObserver patched in
// before the app loads, and asserts the placeholder copy never appears in
// it. Covers both builder modes, since Classic's `previewRef` and Direct
// Edit's dedicated off-screen export-source CVPreview
// (DirectEditPreview.jsx) both resolve through the same
// `createExportSandbox()` call.
const PLACEHOLDER_RE = /will appear here|näky\S* tässä/i

const TEMPLATES = ['minimal', 'modern', 'graduate']

// Polls from the Node side (short, repeated evaluate() calls) rather than
// handing the browser a single long-lived Promise to resolve later — a
// Promise returned from page.evaluate() can be garbage-collected if the
// export flow's own DOM churn invalidates the handle while it's still
// pending, which showed up as a flaky "Resulting promise was garbage
// collected" error here.
async function captureExportSandboxHtml(page, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const html = await page.evaluate(() => document.querySelector('.pdf-export-page')?.outerHTML ?? null)
    if (html) return html
    await page.waitForTimeout(100)
  }
  return null
}

for (const template of TEMPLATES) {
  for (const builderMode of ['classic', 'direct']) {
    test(`pdf export has no placeholder text / ${template} / ${builderMode}`, async ({ page }) => {
      test.setTimeout(60_000)
      const cv = STRESS_CVS.sparse
      await page.addInitScript((snapshot) => {
        window.localStorage.setItem('portifycv-session-restore-enabled', 'true')
        window.sessionStorage.setItem('portifycv-session-snapshot', snapshot)
      }, JSON.stringify(cv))
      await page.goto(`/cv?template=${template}`)
      await expect(page.locator('.app-shell__preview [data-export-variant]')).toContainText(cv.fullName.split(' ')[0])

      if (builderMode === 'direct') {
        await page.getByRole('tab', { name: 'Direct Edit' }).click()
      }
      await waitForStableLayout(page)

      // Confirm the on-screen builder preview DOES show the placeholder —
      // it's a deliberate editing affordance, not something this test wants
      // to remove. If this assertion ever fails, the sandbox-DOM assertion
      // below would be vacuous (nothing to prune).
      const liveRoot = builderMode === 'direct'
        ? page.locator('.direct-edit-preview')
        : page.locator('.app-shell__preview [data-export-variant]')
      await expect(liveRoot).toContainText(PLACEHOLDER_RE)

      const capturePromise = captureExportSandboxHtml(page)
      await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
      await page.getByRole('menuitem', { name: 'PDF' }).click()
      const sandboxHtml = await capturePromise

      expect(sandboxHtml, 'export sandbox clone should have been captured').toBeTruthy()
      expect(sandboxHtml).not.toMatch(PLACEHOLDER_RE)
    })
  }
}
