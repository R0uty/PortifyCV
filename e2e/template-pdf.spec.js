import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_EXAMPLES, loadExampleCv } from '../src/utils/exampleCvs.js'
import { waitForStableLayout } from './helpers/layoutAudit.js'
import { EXPECTED_PDF_PAGES } from './fixtures/pdfPages.js'

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
