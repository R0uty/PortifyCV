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
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><p style="width:60px;overflow-wrap:anywhere">Kristiansen</p>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('mid-word-break')
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><p style="width:60px;overflow-wrap:anywhere">github.com/example-person</p>'))
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
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><p style="width:60px;overflow-wrap:anywhere">Kristian<b>sen</b></p>'))
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
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><p style="width:60px;overflow-wrap:anywhere">Kristian<b>sen</b></p>'))
    expect(rules(await auditLayout(page, '#root'))).toContain('mid-word-break')
  })

  test('ignores mid-word-break with flex items wrapping to separate lines', async ({ page }) => {
    await page.setContent(page780('<h1 data-cv-name>Ada</h1><div style="display:flex;flex-wrap:wrap;width:70px"><span>Senior</span><span>Engineer</span></div>'))
    expect(rules(await auditLayout(page, '#root'))).not.toContain('mid-word-break')
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
