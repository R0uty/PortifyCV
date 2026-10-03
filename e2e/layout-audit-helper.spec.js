import { test, expect } from '@playwright/test'
import { auditLayout, filterAllowlisted } from './helpers/layoutAudit.js'

// Unit tests for the layout audit itself, against hand-made HTML, so the
// template harness can trust a clean result. One positive and one negative
// case per rule.

const page780 = (inner, style = '') => `
  <html><body style="margin:0;font:16px/1.5 sans-serif">
    <div id="root" style="width:780px;${style}">${inner}</div>
  </body></html>`

const rules = (violations) => violations.map((v) => v.rule)

test.describe('auditLayout', () => {
  test('clean content has no violations', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada Lovelace</h1><p>Short line.</p>'))
    expect(await auditLayout(page, '#root')).toEqual([])
  })

  test('flags ellipsis-clipped text', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><p style="width:80px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">linkedin.com/in/someone-long</p>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('clipped-text')
  })

  test('flags content beyond the page edge', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="width:900px">wide</div>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('beyond-page')
  })

  test('ignores decorative elements', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><span data-decorative style="display:block;width:900px;height:4px"></span>', 'overflow:hidden'))
    expect(await auditLayout(page, '#root')).toEqual([])
  })

  test('flags placeholder text in English and Finnish', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><p>Languages will appear here.</p>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('placeholder')
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><p>Kielet näkyvät tässä.</p>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('placeholder')
  })

  test('flags a name on more than two lines', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name style="width:120px">Maximilian Alexander Vandenberg Lindqvist</h1>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('name-lines')
  })

  test('flags a missing name marker', async ({ page }) => {
    await page.setContent(page780('<h1>Ada</h1>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('name-lines')
  })

  test('flags a word broken mid-word but not a URL', async ({ page }) => {
    // "Kristiansen" (~79px unbroken) fits easily inside this 150px flex row —
    // it's only forced to break because a flex-shrink:0 sibling eats 100px,
    // leaving a ~50px leftover `overflow-wrap:anywhere` shrinks it into.
    // Narrower-than-its-row but still broken: a real defect, must be flagged
    // (Task 9 fix round 2 — see the "mid-word-break: exempts/flags by
    // available width" describe block below for the full before/after proof).
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="display:flex;width:150px;justify-content:space-between;align-items:center"><span style="overflow-wrap:anywhere">Kristiansen</span><span style="flex-shrink:0;width:100px;height:10px"></span></div>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('mid-word-break')
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="display:flex;width:150px;justify-content:space-between;align-items:center"><span style="overflow-wrap:anywhere">github.com/example-person</span><span style="flex-shrink:0;width:100px;height:10px"></span></div>'))
    expect(rules(await auditLayout(page, '#root'))).not.toContain('mid-word-break')
  })

  test('flags length over two A4 pages only when asked', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="height:2300px"></div>'))
    expect(rules(await auditLayout(page, '#root', { checkLength: true }))).toContain('length')
    expect(rules(await auditLayout(page, '#root'))).not.toContain('length')
  })

  test('works on a CSS-scaled root', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><p>ok</p>', 'transform:scale(0.4);transform-origin:top left'))
    expect(await auditLayout(page, '#root')).toEqual([])
  })

  test('skipRules option suppresses specified rule violations', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><p>Languages will appear here.</p>'))
    const violations = await auditLayout(page, '#root')
    expect(rules(violations)).toContain('placeholder')
    const filtered = await auditLayout(page, '#root', { skipRules: ['placeholder'] })
    expect(rules(filtered)).not.toContain('placeholder')
    expect(rules(filtered)).toEqual([])
  })

  // Fix round 1 tests
  test('flags clipped text by ancestor overflow', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="width:80px;overflow:hidden"><span style="white-space:nowrap">linkedin.com/in/someone-long</span></div>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('clipped-text')
  })

  test('ignores beyond-page when clipped by intermediate ancestor', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="width:300px;overflow:hidden"><div style="width:900px">wide</div></div>'))
    expect(rules(await auditLayout(page, '#root'))).not.toContain('beyond-page')
  })

  test('flags beyond-page for wide element in overflow:hidden root', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="width:900px">wide</div>', 'overflow:hidden'))
    expect(rules(await auditLayout(page, '#root'))).toContain('beyond-page')
  })

  test('flags mid-word-break across text nodes', async ({ page }) => {
    // Same squeeze shape as above — the word is split across a <b> sibling
    // (Kristian + sen) but still narrower than its row, so still a defect.
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="display:flex;width:150px;justify-content:space-between;align-items:center"><span style="overflow-wrap:anywhere">Kristian<b>sen</b></span><span style="flex-shrink:0;width:100px;height:10px"></span></div>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('mid-word-break')
  })

  test('filterAllowlisted matches and identifies stale entries', () => {
    const violations = [{ rule: 'clipped-text', detail: 'test' }]
    const allowlist = [
      { template: 'modern', subject: 'example', mode: 'screen', rule: 'clipped-text' },
      { template: 'modern', subject: 'example', mode: 'screen', rule: 'placeholder' },
      { template: 'other', subject: 'example', mode: 'screen', rule: 'clipped-text' }
    ]
    const key = { template: 'modern', subject: 'example', mode: 'screen' }

    const result = filterAllowlisted(violations, allowlist, key)
    // Only placeholder should remain (clipped-text is covered by allowlist)
    expect(result.remaining).toEqual([])
    // placeholder entry is stale (no matching violation)
    expect(result.staleEntries.map(e => e.rule)).toContain('placeholder')
  })

  test('name-lines: two spans on one line is ok', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name><span style="display:inline">Ada</span> <span style="display:inline">Lovelace</span></h1>'))
    expect(rules(await auditLayout(page, '#root'))).not.toContain('name-lines')
  })

  test('name-lines: two spans forced to three lines is a violation', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name style="width:50px;overflow-wrap:break-word"><span style="display:inline">Ada</span> <span style="display:inline">Lovelace</span></h1>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('name-lines')
  })

  // Fix round 2 tests
  test('flags clipped text by ancestor vertical overflow', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="height:20px;overflow:hidden"><p>Line 1<br>Line 2<br>Line 3</p></div>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('clipped-text')
  })

  test('ignores mid-word-break across block boundaries', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="width:70px;overflow-wrap:anywhere">Senior<div style="display:block">Engineer</div></div>'))
    expect(rules(await auditLayout(page, '#root'))).not.toContain('mid-word-break')
  })

  test('ignores mid-word-break with line break between words', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><p style="width:60px;overflow-wrap:anywhere">here<br>Line</p>'))
    expect(rules(await auditLayout(page, '#root'))).not.toContain('mid-word-break')
  })

  test('mid-word-break still catches Kristian<b>sen</b> across nodes', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="display:flex;width:150px;justify-content:space-between;align-items:center"><span style="overflow-wrap:anywhere">Kristian<b>sen</b></span><span style="flex-shrink:0;width:100px;height:10px"></span></div>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('mid-word-break')
  })

  test('ignores mid-word-break with flex items wrapping to separate lines', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="display:flex;flex-wrap:wrap;width:70px"><span>Senior</span><span>Engineer</span></div>'))
    expect(rules(await auditLayout(page, '#root'))).not.toContain('mid-word-break')
  })

  // Fix round 1 for Task 2: a real single-space text node between two inline
  // elements used to get dropped (textContent.trim() === '' skipped it
  // entirely), gluing the words on either side into one fake token that
  // could then spuriously trip mid-word-break. Reproduces
  // NavyProfessionalShowcase.jsx's `{label} {'Template'}` kicker shape:
  // two adjacent inline spans with a lone whitespace text node between them.
  test('does not glue words across a real inter-element space', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><p style="width:90px;overflow-wrap:anywhere"><span>Navy Professional</span> <span>Template</span></p>'))
    expect(rules(await auditLayout(page, '#root'))).not.toContain('mid-word-break')
  })

  // Task 9 fix round 2 (controller ruling 2): a word wider than its own
  // containing block can't avoid breaking no matter what CSS the page
  // uses, so that's not a layout defect — the mid-word-break rule now
  // measures the word's natural (unbroken) width and exempts it when that
  // exceeds the content width of the widest line it could ever occupy
  // (the nearest flex/grid row ancestor, not the word's own possibly-
  // shrunk flex item — see `widestAvailableWidth` in layoutAudit.js for
  // why the item's own current box isn't the right measure). This
  // directly replaced the 7 "accepted exception" allowlist entries Task 9
  // fix round 1 added for a 44-char unbreakable skill token — those
  // entries are gone; LAYOUT_ALLOWLIST is `[]` again.
  test.describe('mid-word-break: exempts only genuinely-too-wide words', () => {
    test('a 44-char token wider than its 60px box is exempt — not a defect', async ({ page }) => {
      await page.setContent(page780('<h1 data-cv-name>Ada</h1><p style="width:60px;overflow-wrap:anywhere">Kubernetesoperatorreconciliationloopsdesign</p>'))
      expect(rules(await auditLayout(page, '#root'))).not.toContain('mid-word-break')
    })

    test('the same 44-char token in a box wide enough to hold it does not break at all', async ({ page }) => {
      // Sanity check for the fixture above: the token itself is ~330px
      // unbroken, so a 600px box — comfortably wider — renders it on one
      // line with no break, confirming the 60px case above was exempted
      // for being genuinely too wide, not because this helper never
      // flags anything for that token.
      await page.setContent(page780('<h1 data-cv-name>Ada</h1><p style="width:600px;overflow-wrap:anywhere">Kubernetesoperatorreconciliationloopsdesign</p>'))
      expect(rules(await auditLayout(page, '#root'))).not.toContain('mid-word-break')
    })

    test('a word narrower than its row, but broken by a shrunk flex sibling, is flagged', async ({ page }) => {
      // "Kristiansen" (~79px unbroken) fits easily inside this 150px row —
      // only the flex-shrink:0 100px sibling forces the word's own flex
      // item down to a ~50px leftover, where `overflow-wrap: anywhere`
      // breaks it. This is the real defect class (Task 7's original
      // Modern Orange bug, and Task 9 fix round 1's `anywhere`-on-chips
      // mistake): avoidable by better CSS, so it must still be flagged.
      await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="display:flex;width:150px;justify-content:space-between;align-items:center"><span style="overflow-wrap:anywhere">Kristiansen</span><span style="flex-shrink:0;width:100px;height:10px"></span></div>'))
      expect(rules(await auditLayout(page, '#root'))).toContain('mid-word-break')
    })

    test('.tpl-chip-wrappable (break-word + max-width:100%) does not reproduce the shrunk-sibling break', async ({ page }) => {
      // Exact same squeeze geometry as the previous test — only the word's
      // own wrap CSS changes, from `overflow-wrap: anywhere` (Task 9 fix
      // round 1's mistake on 7 templates' skill chips) to
      // `.tpl-chip-wrappable`'s `overflow-wrap: break-word; max-width:
      // 100%` (src/styles/templates/_system.css). `break-word` doesn't
      // lower min-content the way `anywhere` does, so the word's flex item
      // keeps its own min-content floor (its full width) and is never
      // shrunk small enough to need a mid-word break.
      await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="display:flex;width:150px;justify-content:space-between;align-items:center"><span style="overflow-wrap:break-word;max-width:100%">Kristiansen</span><span style="flex-shrink:0;width:100px;height:10px"></span></div>'))
      expect(rules(await auditLayout(page, '#root'))).not.toContain('mid-word-break')
    })
  })

  test('filterAllowlisted distinguishes by template, subject, and mode', () => {
    const violations = [{ rule: 'clipped-text', detail: 'test' }]
    const allowlist = [
      { template: 'modern', subject: 'example', mode: 'screen', rule: 'clipped-text' },
      { template: 'modern', subject: 'example', mode: 'screen', rule: 'beyond-page' }, // This key matches but rule doesn't, so stale
      { template: 'other', subject: 'example', mode: 'screen', rule: 'clipped-text' }, // Different template, not in result
      { template: 'modern', subject: 'other', mode: 'screen', rule: 'clipped-text' }, // Different subject, not in result
      { template: 'modern', subject: 'example', mode: 'print', rule: 'clipped-text' } // Different mode, not in result
    ]

    const key = { template: 'modern', subject: 'example', mode: 'screen' }
    const result = filterAllowlisted(violations, allowlist, key)
    // Only clipped-text violation is covered by matching entry
    expect(result.remaining).toEqual([])
    // Only the beyond-page entry with matching key is stale (no beyond-page violation)
    expect(result.staleEntries.length).toBe(1)
    expect(result.staleEntries[0].rule).toBe('beyond-page')
  })
})
