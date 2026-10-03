import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_EXAMPLES, loadExampleCv } from '../src/utils/exampleCvs.js'
import { waitForStableLayout } from './helpers/layoutAudit.js'

// PDF smoke per template (Phase 2): the real export path must finish, produce
// a non-blank file, and paginate deterministically. The PDF is image-based
// (html2canvas), so text isn't checked here — the plan's manual step renders
// page 1 of each to an image.
//
// Size floor: rounded down from ~⅓ of the smallest observed export (european,
// 193,261 bytes), chosen that far below the smallest real export so the
// floor only catches a genuinely blank/near-blank render (an empty white
// page compresses far smaller than any populated one) rather than flagging
// a legitimately short, sparse CV.
const MIN_PDF_BYTES = 60_000

// Fix round 1 (Task 4): the original spec estimated `expectedPages` from the
// live builder preview's rendered height (offsetHeight ÷ (offsetWidth ×
// 1.414)) and allowed ±1 page of slack against the real PDF. That estimate
// is biased on every template, not just the split-layout ones originally
// flagged: the live preview is width-clamped to the viewport
// (`--preview-paper-width: min(100%, 220mm)`, src/styles/tokens.css:82) while
// the PDF always renders at a fixed 220mm designer width regardless of
// viewport (`DESIGNER_PAPER_WIDTH_MM`, src/utils/exporters.js:21-29) — so the
// preview's on-screen aspect ratio doesn't match the exported page's aspect
// ratio, and the estimate overshoots. On top of that, split-layout templates
// (executive, graduate, portfolio, techExec, navyProfessional, modernOrange,
// quadrant) compound the error: the preview root's height reflects the
// taller of its two equal-height columns, while PDF pagination is driven by
// the main column alone (sidebar content "falls wherever it lands" — see the
// comment above collectCanvasPageBreakpoints in exporters.js) — so those
// seven previously exceeded even a generous tolerance and were test.fixme'd.
//
// Replaced with an explicit expected-page-count map instead of an estimate:
// this is a regression net for pagination, not a layout predictor. A
// deliberate layout change (e.g. a density fix) that shifts a template's
// real page count updates this map in the same commit, and that commit must
// say why the count changed.
// Task 8a (G8a, 1.4.8): rendering achievements/technologies that every
// bespoke Showcase was previously dropping made four templates' PDFs
// genuinely longer — their experience entries now have more content, not a
// layout regression. executive 2→3, techExec 1→2, classicProfessional 1→2,
// quadrant 1→2.
// Task 8 (G8 density, 1.4.9): tightening Portfolio Hybrid and Executive's
// density to pull their example CVs back under the 2.0-A4-page budget
// (both had been pushed over by 8a's added content) dropped their PDF
// export page counts back down. executive 3→2, portfolio 3→2 — a
// deliberate layout change, not a regression.
// I-2 (final fix wave, Phase 2 template polish): techExec (engineering-
// director) and quadrant (marketing-manager) each spilled one line/card
// onto a second page — a knife-edge overage, not more content. Fix:
// techExec stepped tpl-density-standard→compact (plus the same compact-
// correct line-height corrections the standard→compact precedent above
// made for executive/portfolio) and both templates got a template-local
// rhythm trim (src/styles/templates/techExec.css, quadrant.css). The
// trim also caught a real bug feeding the overage in both files: their
// `.{template}-showcase__bullets` is a bare <ul>, and tokens.css's reset
// only clears p/h1-6 margins, not ul/ol — so each bullet list carried an
// invisible ~1em UA-default margin-bottom on top of its own margin-top,
// which (via margin collapsing) also swallowed any margin-top trim on
// whatever followed it. Both now export at 1 page with real measured
// margin (main column content bottom vs printable page height, at the
// exact 831px-wide designer export clone html2canvas rasterizes):
// techExec/engineering-director ~7.4%, quadrant/marketing-manager ~5.2%.
// techExec 2→1, quadrant 2→1.
const EXPECTED_PDF_PAGES = {
  minimal: 2,
  developer: 2,
  creative: 2,
  modern: 2,
  executive: 2,
  timeline: 2,
  graduate: 2,
  compact: 1,
  portfolio: 2,
  techExec: 1,
  classicProfessional: 2,
  navyProfessional: 1,
  modernOrange: 2,
  colorfulCompact: 1,
  quadrant: 1,
  editorial: 2,
  portrait: 2,
  european: 2,
}

const PREVIEW_ROOT = '.app-shell__preview [data-export-variant]'

for (const template of cvTemplates) {
  test(`pdf / ${template.id} @slow`, async ({ page }, testInfo) => {
    test.setTimeout(90_000)
    const exampleId = TEMPLATE_EXAMPLES[template.id][0]
    const cv = await loadExampleCv(exampleId, 'en')
    await page.goto(`/cv?template=${template.id}&example=${exampleId}`)
    await expect(page.locator(PREVIEW_ROOT)).toContainText(cv.fullName.split(' ')[0])
    await waitForStableLayout(page)

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })
    await page.getByRole('menuitem', { name: 'PDF' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.pdf$/)

    const path = testInfo.outputPath(`${template.id}.pdf`)
    await download.saveAs(path)
    const bytes = await readFile(path)
    expect(bytes.length, 'PDF should not be blank').toBeGreaterThan(MIN_PDF_BYTES)

    const pageCount = (bytes.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length
    expect(pageCount, `pdf pages for ${template.id}`).toBe(EXPECTED_PDF_PAGES[template.id])
  })
}

// Compact fix (Phase 2 final fix wave, after I-1): Compact and European
// pick a density tier in the browser (CompactShowcase/EuropeanShowcase's
// useLayoutEffect auto-fit) by measuring the export-source copy previewRef
// points at — but the PDF sandbox then lays a clone of it out under the
// `.pdf-export-root` rules (src/styles/app-shell.css), which add spacing
// under every `[data-export-section]` and hide `[data-export-ignore]`. If
// the export source doesn't lay out under those same rules, the auto-fit
// measures a shorter document than the one actually paginated and settles
// on a too-loose tier: Compact's data-engineer example "fit" at snug in
// the export source (1123px) but grew to ~1230px in the clone, so its PDF
// went 1→2 pages. (Before I-1 Classic only exported 1 page by accident —
// its narrow on-screen preview, ~506px wide on a 1280px window, wrapped
// enough to force the tight tier; on a 1920px window, or in Direct Edit,
// it already exported 2.) The export source now shares those layout rules,
// so these guards assert it measures the same height the PDF clone has —
// in both builder modes, on a window wide enough that the visible preview
// no longer happens to be narrower than the paper.
const SELF_MEASURING_TEMPLATES = ['compact', 'european']
const EXPORT_SOURCE_ROOT = '.direct-edit-export-source [data-export-root="true"]'

for (const templateId of SELF_MEASURING_TEMPLATES) {
  for (const builderMode of ['classic', 'direct']) {
    test(`export source lays out like the PDF clone / ${templateId} / ${builderMode}`, async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      const exampleId = TEMPLATE_EXAMPLES[templateId][0]
      const cv = await loadExampleCv(exampleId, 'en')
      await page.goto(`/cv?template=${templateId}&example=${exampleId}`)
      await expect(page.locator(PREVIEW_ROOT)).toContainText(cv.fullName.split(' ')[0])
      if (builderMode === 'direct') {
        await page.getByRole('tab', { name: 'Direct Edit' }).click()
      }
      await waitForStableLayout(page)
      await expect(page.locator(EXPORT_SOURCE_ROOT)).toHaveCount(1)

      // Mirrors createExportSandbox() (src/utils/exporters.js) for designer
      // mode: same wrapper/root classes, same forced paper width.
      const { sourceHeight, cloneHeight } = await page.evaluate((selector) => {
        const source = document.querySelector(selector)
        const widthPx = source.offsetWidth
        const sandbox = document.createElement('div')
        sandbox.style.cssText = `position:fixed;left:-10000px;top:0;width:${widthPx}px`
        const captureRoot = document.createElement('div')
        captureRoot.className = 'pdf-export-page pdf-mode-designer'
        captureRoot.style.width = `${widthPx}px`
        const clone = source.cloneNode(true)
        clone.classList.add('pdf-export-root', 'pdf-mode-designer')
        clone.style.width = `${widthPx}px`
        clone.style.maxWidth = 'none'
        clone.style.margin = '0'
        captureRoot.appendChild(clone)
        sandbox.appendChild(captureRoot)
        document.body.appendChild(sandbox)
        const result = { sourceHeight: source.scrollHeight, cloneHeight: clone.scrollHeight }
        sandbox.remove()
        return result
      }, EXPORT_SOURCE_ROOT)
      expect(Math.abs(cloneHeight - sourceHeight), `clone ${cloneHeight}px vs source ${sourceHeight}px`).toBeLessThanOrEqual(1)
    })
  }
}

for (const builderMode of ['classic', 'direct']) {
  test(`pdf / compact on a wide window / ${builderMode} @slow`, async ({ page }, testInfo) => {
    test.setTimeout(90_000)
    await page.setViewportSize({ width: 1920, height: 1080 })
    const exampleId = TEMPLATE_EXAMPLES.compact[0]
    const cv = await loadExampleCv(exampleId, 'en')
    await page.goto(`/cv?template=compact&example=${exampleId}`)
    await expect(page.locator(PREVIEW_ROOT)).toContainText(cv.fullName.split(' ')[0])
    if (builderMode === 'direct') {
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
    }
    await waitForStableLayout(page)

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })
    await page.getByRole('menuitem', { name: 'PDF' }).click()
    const download = await downloadPromise
    const path = testInfo.outputPath(`compact-${builderMode}-wide.pdf`)
    await download.saveAs(path)
    const bytes = await readFile(path)
    const pageCount = (bytes.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length
    expect(pageCount, `pdf pages for compact (${builderMode}, 1920px window)`).toBe(EXPECTED_PDF_PAGES.compact)
  })
}
