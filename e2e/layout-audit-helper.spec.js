import { test, expect } from '@playwright/test'
import { auditLayout } from './helpers/layoutAudit.js'

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
})
