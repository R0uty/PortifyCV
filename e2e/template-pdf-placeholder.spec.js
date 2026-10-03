import { test, expect } from '@playwright/test'
import { STRESS_CVS } from './fixtures/stressCvs.js'
import { waitForStableLayout } from './helpers/layoutAudit.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { createInitialCvData, createEmptyExperience, createEmptyCoreStrength } from '../src/utils/cvForm.js'

const base = () => createInitialCvData()

// F12 (docs/template-audit-phase2.md G9, Task 9): the PDF export used to
// clone the live preview DOM verbatim, so a visible-but-empty section's
// "… will appear here" editing-affordance placeholder reached the exported
// PDF. The fix (I-1, reworked so section numbering stays consecutive — see
// below) renders the export source from `hideEmptySections(formData)`
// instead of pruning empty sections out of a clone after render.
//
// The PDF itself is image-based (html2canvas), so this can't assert on the
// final file's text. Instead it captures the export sandbox's clone DOM —
// the exact node html2canvas rasterizes — by polling
// `document.querySelector('.pdf-export-page')` from the Node side on a short
// interval (there is no MutationObserver involved) until it appears, and
// asserts the placeholder copy never appears in it. Covers both builder
// modes, since Classic mode's dedicated off-screen export-source CVPreview
// (ResumeBuilderPage.jsx) and Direct Edit's (DirectEditPreview.jsx) both
// resolve through the same `createExportSandbox()` call.
const PLACEHOLDER_RE = /will appear here|näky\S* tässä/i

// M-3: every one of the 18 templates, not just a sample — I-1's fix point
// moved from a single shared prune step to each builder mode's own
// hideEmptySections(formData) call, so a template-specific regression
// (e.g. a Showcase reading formData directly instead of through the
// visibility-filtered snapshot) would not necessarily show up in any one
// template.
const TEMPLATES = cvTemplates.map((template) => template.id)

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
    test(`pdf export has no placeholder text / ${template} / ${builderMode} @slow`, async ({ page }) => {
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

// I-1: Creative and Editorial number sections with one running ordinal
// across every *visible* section (sectionVisibility), computed before this
// fix moved the empty-section check upstream of render. An empty MIDDLE
// section (not first, not last) used to still get numbered, then get
// pruned out of the export clone afterwards, leaving the exported copy's
// numbers skip one (e.g. "01, 02, 04…"). All three fixtures below rely on
// createInitialCvData()'s defaults: every array section starts with a
// single blank placeholder item, which itemHasContent() correctly treats
// as empty, so leaving a section untouched is enough to make it "empty"
// for this test — no need to explicitly null it out.
const MIDDLE_GAP_CV = {
  ...base(),
  fullName: 'Mid Gap Example',
  title: 'Example Title',
  about: 'A short professional summary for the numbering test.',
  experience: [{ ...createEmptyExperience(), role: 'Example Role', company: 'Example Oy', startDate: 'Jan 2022', isCurrent: true }],
  // Creative: primary = about, experience, PROJECTS (left empty by
  // default) — projects is the gap. Editorial: primary = about,
  // experience, EDUCATION (left empty by default), skills… — education is
  // the gap. `skills` is filled for both so there is a section after the
  // gap to carry a number.
  skills: ['Example Skill'],
}

function extractSectionNumbers(html, sectionNumClassName) {
  const re = new RegExp(`class="${sectionNumClassName}"[^>]*>\\s*(\\d{2})\\s*<`, 'g')
  return [...html.matchAll(re)].map((match) => match[1])
}

for (const [template, sectionNumClassName] of [
  ['creative', 'creative-showcase__section-num'],
  ['editorial', 'editorial-showcase__section-num'],
]) {
  test(`pdf export numbers consecutive sections with an empty middle section / ${template} @slow`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.addInitScript((snapshot) => {
      window.localStorage.setItem('portifycv-session-restore-enabled', 'true')
      window.sessionStorage.setItem('portifycv-session-snapshot', snapshot)
    }, JSON.stringify(MIDDLE_GAP_CV))
    await page.goto(`/cv?template=${template}`)
    await expect(page.locator('.app-shell__preview [data-export-variant]')).toContainText('Mid')
    await waitForStableLayout(page)

    const capturePromise = captureExportSandboxHtml(page)
    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    await page.getByRole('menuitem', { name: 'PDF' }).click()
    const sandboxHtml = await capturePromise

    expect(sandboxHtml, 'export sandbox clone should have been captured').toBeTruthy()
    const numbers = extractSectionNumbers(sandboxHtml, sectionNumClassName)
    expect(numbers.length, 'should have numbered at least about/experience/skills').toBeGreaterThanOrEqual(3)
    expect(numbers).toEqual(numbers.map((_, index) => String(index + 1).padStart(2, '0')))
  })
}

// I-1/M-1: a section that is still "visible" (sectionVisibility !== false)
// but whose only item(s) were hidden one-by-one via
// cv.sectionItemVisibility must not reach the export as an empty section
// with its own "… will appear here" placeholder — the whole section should
// disappear, the same as if it had no items at all. Modern's Interests
// section renders exactly that placeholder when snapshot.interests is
// empty (ModernShowcase.jsx).
const ALL_ITEMS_HIDDEN_CV = {
  ...base(),
  fullName: 'Hidden Items Example',
  title: 'Example Title',
  about: 'A short professional summary.',
  experience: [{ ...createEmptyExperience(), role: 'Example Role', company: 'Example Oy', startDate: 'Jan 2022', isCurrent: true }],
  interests: [{ name: 'Chess' }, { name: 'Cycling' }],
  sectionItemVisibility: { interests: { 0: false, 1: false } },
}

test('pdf export drops a visible section whose items are all hidden / modern @slow', async ({ page }) => {
  test.setTimeout(60_000)
  await page.addInitScript((snapshot) => {
    window.localStorage.setItem('portifycv-session-restore-enabled', 'true')
    window.sessionStorage.setItem('portifycv-session-snapshot', snapshot)
  }, JSON.stringify(ALL_ITEMS_HIDDEN_CV))
  await page.goto('/cv?template=modern')
  await expect(page.locator('.app-shell__preview [data-export-variant]')).toContainText('Hidden')
  await waitForStableLayout(page)

  const capturePromise = captureExportSandboxHtml(page)
  await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
  await page.getByRole('menuitem', { name: 'PDF' }).click()
  const sandboxHtml = await capturePromise

  expect(sandboxHtml, 'export sandbox clone should have been captured').toBeTruthy()
  expect(sandboxHtml).not.toMatch(/will appear here|näky\S* tässä/i)
  expect(sandboxHtml).not.toContain('data-export-section="interests"')
})

// I-1: Creative renders coreStrengths pills inside the About section
// instead of a dedicated section. An empty About text must not fall back
// to its "will appear here" placeholder in the export when those pills
// are present — the section has real content, just not summary prose.
const ABOUT_PILLS_ONLY_CV = {
  ...base(),
  fullName: 'Pills Only Example',
  title: 'Example Title',
  about: '',
  coreStrengths: [{ ...createEmptyCoreStrength(), title: 'Stakeholder Leadership' }],
}

test('pdf export keeps coreStrengths pills when About text is empty / creative @slow', async ({ page }) => {
  test.setTimeout(60_000)
  await page.addInitScript((snapshot) => {
    window.localStorage.setItem('portifycv-session-restore-enabled', 'true')
    window.sessionStorage.setItem('portifycv-session-snapshot', snapshot)
  }, JSON.stringify(ABOUT_PILLS_ONLY_CV))
  await page.goto('/cv?template=creative')
  await expect(page.locator('.app-shell__preview [data-export-variant]')).toContainText('Pills')
  await waitForStableLayout(page)

  const capturePromise = captureExportSandboxHtml(page)
  await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
  await page.getByRole('menuitem', { name: 'PDF' }).click()
  const sandboxHtml = await capturePromise

  expect(sandboxHtml, 'export sandbox clone should have been captured').toBeTruthy()
  expect(sandboxHtml).not.toMatch(/will appear here|näky\S* tässä/i)
  expect(sandboxHtml).toContain('Stakeholder Leadership')
  expect(sandboxHtml).toContain('data-export-section="about"')
})
