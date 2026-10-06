import { test, expect } from './fixtures/base.js'
import { waitForStableLayout } from './helpers/layoutAudit.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_EXAMPLES, loadExampleCv } from '../src/utils/exampleCvs.js'

// Phase 2 content-coverage harness (F14 / G8a,
// docs/template-audit-phase2.md): every template × each of its example
// CVs, in both normal and ATS view, must actually render every
// non-blank `achievements` string and every `technologies` string of
// every experience entry — not just `description`. This is the
// regression guard for the "17 of 18 Showcases silently drop
// achievements/technologies" bug; it checks content completeness, not
// layout, so it is a sibling of template-layout.spec.js rather than an
// addition to it.

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim()
}

const ROOT = '.template-page__preview .scaled-preview__page'

for (const template of cvTemplates) {
  for (const exampleId of TEMPLATE_EXAMPLES[template.id]) {
    for (const mode of ['normal', 'ats']) {
      test(`content / ${template.id} / ${exampleId} / ${mode}`, async ({ page }) => {
        const cv = await loadExampleCv(exampleId, 'en')
        await page.goto(`/free-cv-templates/${template.slug}?example=${exampleId}`)

        const nameWords = cv.fullName.split(' ').filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        await expect(page.locator('.template-page__preview')).toContainText(new RegExp(nameWords.join('\\s*')))
        if (mode === 'ats') {
          await page.getByRole('checkbox', { name: 'ATS view' }).check()
        }
        await waitForStableLayout(page)

        const rawText = await page.locator(ROOT).innerText()
        const previewText = normalizeWhitespace(rawText)

        const missing = []
        for (const item of cv.experience ?? []) {
          for (const achievement of item.achievements ?? []) {
            const needle = normalizeWhitespace(achievement)
            if (needle && !previewText.includes(needle)) {
              missing.push(`achievement: "${needle}"`)
            }
          }
          for (const technology of item.technologies ?? []) {
            const needle = normalizeWhitespace(technology)
            if (needle && !previewText.includes(needle)) {
              missing.push(`technology: "${needle}"`)
            }
          }
        }

        expect(missing, 'missing achievements/technologies in preview text').toEqual([])
      })
    }
  }
}
