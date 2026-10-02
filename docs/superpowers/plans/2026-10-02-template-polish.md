# Template Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit all 18 CV templates against realistic and stress content with a deterministic layout harness, fix every defect it finds by root cause, and keep the harness in CI as a regression net.

**Architecture:** A browser-side `auditLayout()` function, exposed through a Playwright helper, measures a rendered CV for clipped text, overflow past the page, placeholders, name line count, mid-word breaks and length.

The harness has three tiers:
- **Example tier:** the 49 template × example pairs, rendered on the Phase 1 template pages, in normal and ATS view.
- **Stress tier:** 3 synthetic CVs × 18 templates, injected into the builder through the session-restore snapshot.
- **PDF tier:** one export per template.

An allowlist of known failures keeps CI green while root-cause fix tasks empty it.

**Tech Stack:** Playwright (`@playwright/test`), React 19 + hand-written CSS (`src/styles/templates/*.css`, `--tpl-*` design tokens), Vite production build.

**Spec:** `docs/superpowers/specs/2026-10-02-template-polish-design.md`

## Global Constraints

- Branch `v1.5.0` (stacked on `v1.4.0`). Never push, rebase or merge without the user's explicit approval.
- Commit messages carry the user's name only, with **no `Co-Authored-By` line**.
- Each task ends with a standalone version-bump commit, `Bump version to 1.4.<n>` (`npm version 1.4.<n> --no-git-tag-version`), starting at 1.4.1. The final task sets `1.5.0`.
- Thresholds, copied from the spec: name ≤ **2** lines; example CVs ≤ **2.0** A4 pages (page height ÷ (page width × 1.414)); overflow tolerance **2px** unscaled.
- Fixes follow `docs/template-design-system.md`: §2 type ramp tokens (`--tpl-*`, density classes `roomy`/`standard`/`compact`), §3 colour rule, §4 heading treatment and §5 family. No ad-hoc font sizes. Amend the design-system doc in the same commit if a rule must change.
- Never change example CV content to dodge a layout bug.
- No new runtime dependencies.
- All e2e runs use the production build (`playwright.config.js` already does). Its `storageState` seeds Classic builder mode for every test.
- Before measuring, wait for `networkidle`, then `document.fonts.ready`.

## File map

| File | Status | Responsibility |
|---|---|---|
| `e2e/helpers/layoutAudit.js` | create | `LAYOUT_THRESHOLDS`, `waitForStableLayout(page)`, `auditLayout(page, rootSelector, opts)`, `filterAllowlisted(...)` |
| `e2e/layout-audit-helper.spec.js` | create | unit tests for each audit rule against hand-made HTML (`page.setContent`) |
| `e2e/fixtures/layoutAllowlist.js` | create | `LAYOUT_ALLOWLIST` known-failure entries (empty by the end) |
| `e2e/template-layout.spec.js` | create | example tier (49 × normal/ATS) + stress tier (3 × 18) |
| `e2e/fixtures/stressCvs.js` | create | `STRESS_CVS` — 3 synthetic CvData objects |
| `e2e/template-pdf.spec.js` | create | PDF smoke, 18 exports |
| `src/components/templates/*Showcase.jsx` (17) + `src/components/CVPreview.jsx` | modify | `data-cv-name` on the name element; `data-decorative` on decorative elements |
| `src/styles/templates/*.css` | modify | fixes (Tasks 6–9) |
| `docs/template-audit-phase2.md` | create | audit results, re-scored rubric, fix list |
| `docs/template-design-system.md` | modify (if needed) | amendments that fixes require |
| `todo.md`, `changes.md`, `CLAUDE.md` | modify | final docs |

---

### Task 1: The audit helper, unit-tested

**Files:**
- Create: `e2e/helpers/layoutAudit.js`
- Create: `e2e/layout-audit-helper.spec.js`

**Interfaces:**
- Produces:
  - `LAYOUT_THRESHOLDS = { maxNameLines: 2, maxPages: 2.0, overflowTolerancePx: 2 }`
  - `waitForStableLayout(page): Promise<void>`
  - `auditLayout(page, rootSelector: string, opts?: { checkLength?: boolean }): Promise<Array<{ rule: string, detail: string }>>`
  - `filterAllowlisted(violations, allowlist, key: { template, subject, mode }): { remaining, staleEntries }`

  Rule ids are `clipped-text`, `beyond-page`, `placeholder`, `name-lines`, `mid-word-break` and `length`.

- [ ] **Step 1: Write the failing tests**

Create `e2e/layout-audit-helper.spec.js`. Each test builds a tiny page with `page.setContent`, then asserts on `auditLayout` output:

```js
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
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx playwright test e2e/layout-audit-helper.spec.js`
Expected: every test fails on the import (`layoutAudit.js` doesn't exist).

- [ ] **Step 3: Implement `e2e/helpers/layoutAudit.js`**

```js
// Layout audit for rendered CVs (Phase 2 template polish). auditLayout runs
// in the browser against one rendered CV root and returns rule violations;
// the template harness (template-layout.spec.js) treats any violation that
// is not allowlisted as a failure. Rules map to docs/template-design-system.md
// §7 (content edge cases). Thresholds live here and nowhere else.

export const LAYOUT_THRESHOLDS = {
  maxNameLines: 2, // §7.1
  maxPages: 2.0, // Phase 2 decision: typical CV ≤ 2 A4 pages
  overflowTolerancePx: 2,
}

// Fonts change line breaks; measure only after they've loaded.
export async function waitForStableLayout(page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}

export async function auditLayout(page, rootSelector, opts = {}) {
  return page.evaluate(
    ({ rootSelector, thresholds, checkLength }) => {
      const root = document.querySelector(rootSelector)
      if (!root) return [{ rule: 'missing-root', detail: rootSelector }]

      const violations = []
      const add = (rule, detail) => violations.push({ rule, detail })
      const scale = root.getBoundingClientRect().width / root.offsetWidth || 1
      const rootRect = root.getBoundingClientRect()
      const isDecorative = (el) => Boolean(el.closest('[data-decorative]'))
      const label = (el) => `${el.tagName.toLowerCase()}.${String(el.className).trim().split(/\s+/)[0] || ''} "${(el.textContent || '').trim().slice(0, 40)}"`
      const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())

      for (const el of root.querySelectorAll('*')) {
        if (isDecorative(el)) continue
        const rect = el.getBoundingClientRect()
        if (!rect.width || !rect.height) continue

        if ((rect.right - rootRect.right) / scale > thresholds.overflowTolerancePx) {
          add('beyond-page', label(el))
        }

        if (ownText(el)) {
          const cs = getComputedStyle(el)
          const hidesX = ['hidden', 'clip'].includes(cs.overflowX) || cs.textOverflow === 'ellipsis'
          const hidesY = ['hidden', 'clip'].includes(cs.overflowY)
          if ((hidesX && el.scrollWidth > el.clientWidth + 1) || (hidesY && el.scrollHeight > el.clientHeight + 1)) {
            add('clipped-text', label(el))
          }
        }
      }

      if (/will appear here|näky\S* tässä/i.test(root.innerText)) {
        add('placeholder', (root.innerText.match(/[^\n]*(will appear here|näky\S* tässä)[^\n]*/i) || [''])[0].slice(0, 60))
      }

      // Distinct line boxes = distinct rounded `top` values of the text's client rects.
      const lineCount = (el) => {
        const range = document.createRange()
        range.selectNodeContents(el)
        const tops = []
        for (const r of range.getClientRects()) {
          if (r.width < 1) continue
          if (!tops.some((t) => Math.abs(t - r.top) < 3 * scale)) tops.push(r.top)
        }
        return tops.length
      }

      const names = [...root.querySelectorAll('[data-cv-name]')].filter((el) => el.getBoundingClientRect().width)
      if (names.length === 0) {
        add('name-lines', 'no visible [data-cv-name] element')
      } else {
        for (const el of names) {
          const lines = lineCount(el)
          if (lines > thresholds.maxNameLines) add('name-lines', `${lines} lines: "${el.textContent.trim()}"`)
        }
      }

      // A word whose glyphs land on two line boxes was broken mid-word.
      // URL/email-like tokens may break anywhere (that's the fix for clipped
      // links), and hyphens/slashes are legitimate break points.
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      const reported = new Set()
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.parentElement || isDecorative(node.parentElement)) continue
        const text = node.textContent
        const tokens = /\S+/g
        for (let t = tokens.exec(text); t; t = tokens.exec(text)) {
          // URL/email-like tokens (any of @ . : /) may break anywhere.
          if (/[@.:/]/.test(t[0])) continue
          const parts = /[^\-–—]+/g
          for (let m = parts.exec(t[0]); m; m = parts.exec(t[0])) {
          const word = m[0]
          if (word.length < 4 || reported.has(word)) continue
          const start = t.index + m.index
          const range = document.createRange()
          range.setStart(node, start)
          range.setEnd(node, start + word.length)
          const tops = []
          for (const r of range.getClientRects()) {
            if (r.width >= 1 && !tops.some((t) => Math.abs(t - r.top) < 3 * scale)) tops.push(r.top)
          }
          if (tops.length > 1) {
            reported.add(word)
            add('mid-word-break', `"${word}" in ${label(node.parentElement)}`)
          }
          }
        }
      }

      if (checkLength) {
        const pages = root.offsetHeight / (root.offsetWidth * 1.414)
        if (pages > thresholds.maxPages) add('length', `${pages.toFixed(2)} A4 pages`)
      }

      return violations
    },
    { rootSelector, thresholds: LAYOUT_THRESHOLDS, checkLength: Boolean(opts.checkLength) },
  )
}

// Splits violations into those not covered by the allowlist, and reports
// allowlist entries for this key that no longer match anything (stale), so
// a fixed defect forces its entry to be removed.
export function filterAllowlisted(violations, allowlist, key) {
  const entries = allowlist.filter((e) => e.template === key.template && e.subject === key.subject && e.mode === key.mode)
  const remaining = violations.filter((v) => !entries.some((e) => e.rule === v.rule))
  const staleEntries = entries.filter((e) => !violations.some((v) => v.rule === e.rule))
  return { remaining, staleEntries }
}
```

- [ ] **Step 4: Run the tests**

Run: `npx playwright test e2e/layout-audit-helper.spec.js && npm run -s lint`
Expected: 10 passed, lint clean. If the eslint config doesn't cover `e2e/helpers`, note it in the report; don't change the config.

- [ ] **Step 5: Commit**

```bash
git add e2e/helpers/layoutAudit.js e2e/layout-audit-helper.spec.js
git commit -m "Add a unit-tested layout audit for rendered CVs"
npm version 1.4.1 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.4.1"
```

---

### Task 2: Name and decoration markers + the example tier

**Files:**
- Modify: the 17 `src/components/templates/*Showcase.jsx` name elements (`<h1 className="<x>-showcase__name">`), and `src/components/CVPreview.jsx` ~line 1918 (the flat renderer's name `<h3>`)
- Modify: `CreativeShowcase.jsx:480-481`, `DeveloperShowcase.jsx:632-634` (blobs), plus any other purely decorative element the first run reports as `beyond-page`
- Create: `e2e/fixtures/layoutAllowlist.js`
- Create: `e2e/template-layout.spec.js`

**Interfaces:**
- Consumes: `auditLayout`, `waitForStableLayout`, `filterAllowlisted`, `LAYOUT_THRESHOLDS` (Task 1); `cvTemplates`, `slug` (`src/utils/cvTemplates.js`); `TEMPLATE_EXAMPLES`, `loadExampleCv` (`src/utils/exampleCvs.js`).
- Produces:
  - `LAYOUT_ALLOWLIST: Array<{ template: string, subject: string, mode: 'normal'|'ats'|'stress', rule: string, reason: string }>`
  - the example-tier tests, named `<templateId> / <exampleId> / <mode>`

- [ ] **Step 1: Write the example-tier spec (fails first: no markers yet)**

```js
import { test, expect } from '@playwright/test'
import { auditLayout, waitForStableLayout, filterAllowlisted } from './helpers/layoutAudit.js'
import { LAYOUT_ALLOWLIST } from './fixtures/layoutAllowlist.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_EXAMPLES, loadExampleCv } from '../src/utils/exampleCvs.js'

// Phase 2 layout harness, example tier: every template × each of its example
// CVs, rendered on the template page (/free-cv-templates/<slug>), audited in
// normal and ATS view. Known failures live in fixtures/layoutAllowlist.js
// until the fix pass removes them; a stale allowlist entry also fails.

const ROOT = '.template-page__preview .scaled-preview__page'

for (const template of cvTemplates) {
  for (const exampleId of TEMPLATE_EXAMPLES[template.id]) {
    for (const mode of ['normal', 'ats']) {
      test(`${template.id} / ${exampleId} / ${mode}`, async ({ page }) => {
        const cv = await loadExampleCv(exampleId, 'en')
        await page.goto(`/free-cv-templates/${template.slug}?example=${exampleId}`)
        await expect(page.locator('.template-page__preview')).toContainText(cv.fullName)
        if (mode === 'ats') {
          await page.getByRole('checkbox', { name: 'ATS view' }).check()
        }
        await waitForStableLayout(page)

        const violations = await auditLayout(page, ROOT, { checkLength: mode === 'normal' })
        const { remaining, staleEntries } = filterAllowlisted(violations, LAYOUT_ALLOWLIST, {
          template: template.id, subject: exampleId, mode,
        })
        expect(remaining, 'layout violations').toEqual([])
        expect(staleEntries, 'allowlist entries that no longer fail — remove them').toEqual([])
      })
    }
  }
}
```

Create `e2e/fixtures/layoutAllowlist.js`:

```js
// Known layout failures, recorded by the Phase 2 audit (docs/template-audit-phase2.md)
// so CI stays green while the fix pass works through them. Each fix task
// removes its entries; the harness fails on stale entries. Must be empty
// at the end of Phase 2.
export const LAYOUT_ALLOWLIST = []
```

The `loadExampleCv` import runs the real example modules in Node. If Playwright's loader rejects the extension-less imports inside `src/`, fall back to reading the person's name in the browser instead: wait for the selected radio, then for the `aria-busy` attribute on `.template-page__preview` to be `false`. Note in the report which approach you used.

- [ ] **Step 2: Run it and confirm the marker failure**

Run: `npx playwright test e2e/template-layout.spec.js`
Expected: all 98 tests fail on `name-lines: no visible [data-cv-name] element`.

- [ ] **Step 3: Add the markers**

On each of the 17 Showcase name elements, add the attribute to the existing tag. For example, in `ModernShowcase.jsx`:

```jsx
          <h1 className="modern-showcase__name" data-cv-name>
```

In `CVPreview.jsx` (flat renderer, used for Minimalist and by most templates in ATS mode):

```jsx
            <h3
              data-cv-name
              className={`leading-none ${
```

If a Showcase renders a second name element (in an ATS sub-branch, or a sidebar plus a header), mark every visible one. The rule checks each.

Decorative blobs get `data-decorative` (and `aria-hidden="true"` if missing):

```jsx
        <span className="creative-showcase__blob creative-showcase__blob--top" data-decorative aria-hidden="true" />
```

- [ ] **Step 4: Run again and record the audit baseline**

Run: `npx playwright test e2e/template-layout.spec.js --reporter=line 2>&1 | tee /tmp/layout-baseline.txt`

Every remaining failure is now a real finding. Look at each `beyond-page` result before going further. Only an element that is purely decorative (no text, no information) may get `data-decorative`; anything else is a finding. Then add one allowlist entry per failing (template, subject, mode, rule), with `reason: 'Phase 2 baseline — see docs/template-audit-phase2.md'`. Generate the entries from the output rather than typing them by hand; a short Node snippet that parses the line-reporter output is fine, as long as it isn't committed.

Re-run: all 98 pass (allowlisted), and nothing is stale.

- [ ] **Step 5: Run the existing suite (the markers must not change rendering)**

Run: `npx playwright test e2e/templates.spec.js e2e/template-pages.spec.js e2e/direct-edit.spec.js && npm run -s lint`
Expected: all pass.

- [ ] **Step 6: Commit**

Save the baseline failure list (rule counts per template) to `/tmp/layout-baseline.txt`. Task 5 reads it, so paste its summary into the report.

```bash
git add src/components/templates src/components/CVPreview.jsx e2e/template-layout.spec.js e2e/fixtures/layoutAllowlist.js
git commit -m "Mark CV names and decorations, and audit every template example's layout"
npm version 1.4.2 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.4.2"
```

---

### Task 3: Stress tier

**Files:**
- Create: `e2e/fixtures/stressCvs.js`
- Modify: `e2e/template-layout.spec.js` (append the stress tier)
- Modify: `e2e/fixtures/layoutAllowlist.js` (stress baseline entries)

**Interfaces:**
- Consumes: Task 1 helpers; `createInitialCvData`, `createEmptyLinks`, the `createEmpty*` factories (`src/utils/cvForm.js`, which has no imports); `CV_SESSION_RESTORE_ENABLED_STORAGE_KEY = 'portifycv-session-restore-enabled'` and `CV_SESSION_SNAPSHOT_STORAGE_KEY = 'portifycv-session-snapshot'`.
- Produces: `STRESS_CVS: { 'long-single-word': CvData, 'ten-jobs': CvData, sparse: CvData }`, and stress tests named `<templateId> / stress:<fixtureId>` with `mode: 'stress'`.

**Why the snapshot:** `loadInitialCvSession` restores `sessionStorage['portifycv-session-snapshot']` (through `parseImportedCvData`) when session restore is enabled. Seeding both keys with `page.addInitScript` loads an arbitrary CV without the browser-only share-link encoder. `?template=<id>` selects the template. The suite's `storageState` puts the builder in Classic mode.

- [ ] **Step 1: Find the builder's preview root**

On `/cv` in Classic mode, find the element the PDF export renders from. It has `data-export-root` on the flat renderer; Showcases set `data-export-variant`. Pick a selector that matches exactly one visible CV root for every template, e.g. `.app-shell__preview [data-export-variant]`. Check it with a quick throwaway Playwright script, and write the chosen selector and the evidence in the report.

- [ ] **Step 2: Write `e2e/fixtures/stressCvs.js`**

```js
import {
  createInitialCvData, createEmptyLinks, createEmptyExperience, createEmptyEducation,
} from '../../src/utils/cvForm.js'

// Synthetic CVs for docs/template-design-system.md §7 cases the 24 example
// people don't cover. Fictional data only.
const base = () => createInitialCvData()

const job = (i) => ({
  ...createEmptyExperience(),
  role: `Senior Operations Specialist ${i}`,
  company: `Example Company ${i} Oy`,
  location: 'Helsinki, Finland',
  employmentType: 'Full-time',
  startDate: `Jan ${2024 - i * 2}`,
  endDate: i === 0 ? '' : `Dec ${2025 - i * 2}`,
  isCurrent: i === 0,
  description: 'Ran day-to-day operations for a regional team and owned the quarterly planning cycle.',
  achievements: [
    'Cut order lead time from 9 days to 4 across 3 warehouses.',
    'Introduced a weekly KPI review adopted by 6 teams.',
    'Reduced supplier escalations by 35% in 12 months.',
  ],
  technologies: ['SAP', 'Power BI'],
})

export const STRESS_CVS = {
  'long-single-word': {
    ...base(),
    fullName: 'Kristiansen-Vandenberghe Oyelaran-Lindqvist',
    title: 'Principal Infrastructure Reliability Engineer',
    email: 'kristiansen-vandenberghe.oyelaran-lindqvist@example.com',
    phone: '+358 40 000 9901',
    location: 'Espoo, Finland',
    about: 'Infrastructure engineer focused on reliability and incident response.',
    skills: ['Kubernetes', 'Infrastructure-as-code governance and policy-as-code tooling', 'Terraform', 'Go'],
    experience: [job(0), job(1)],
    education: [{ ...createEmptyEducation(), school: 'Aalto University', degree: 'M.Sc. (Tech.) Computer Science', startDate: '2012', endDate: '2017' }],
    links: {
      ...createEmptyLinks(),
      github: 'https://github.com/example-kristiansen-vandenberghe-oyelaran',
      linkedin: 'https://linkedin.com/in/example-kristiansen-vandenberghe-oyelaran-lindqvist',
      portfolio: 'https://kristiansen-vandenberghe.example.com/portfolio/infrastructure',
    },
  },
  'ten-jobs': {
    ...base(),
    fullName: 'Taina Example',
    title: 'Operations Director',
    email: 'taina.example@example.com',
    phone: '+358 40 000 9902',
    location: 'Tampere, Finland',
    about: 'Operations leader with a long, steady career across logistics and retail.',
    skills: ['Operations', 'Lean', 'Budgeting', 'SAP'],
    experience: Array.from({ length: 10 }, (_, i) => job(i)),
    education: [{ ...createEmptyEducation(), school: 'University of Tampere', degree: 'M.Sc. Economics', startDate: '1998', endDate: '2003' }],
  },
  sparse: {
    ...base(),
    fullName: 'Ada Example',
    title: 'Accountant',
    experience: [{ ...createEmptyExperience(), role: 'Accountant', company: 'Example Oy', startDate: 'Jan 2020', isCurrent: true }],
  },
}
```

Verify every key against `cvForm.js`'s factories before relying on it. `parseImportedCvData` drops unknown keys silently.

- [ ] **Step 3: Append the stress tier to `e2e/template-layout.spec.js`**

```js
import { STRESS_CVS } from './fixtures/stressCvs.js'

// Stress tier: §7 edge cases through the builder. The CV is injected as a
// session-restore snapshot (the same path a reload takes), so no share-link
// encoding is needed. Length is not checked here — ten-jobs is meant to be long.
const BUILDER_ROOT = /* the selector chosen in Step 1 */ '.app-shell__preview [data-export-variant]'

for (const template of cvTemplates) {
  for (const [fixtureId, cv] of Object.entries(STRESS_CVS)) {
    test(`${template.id} / stress:${fixtureId}`, async ({ page }) => {
      await page.addInitScript((snapshot) => {
        window.localStorage.setItem('portifycv-session-restore-enabled', 'true')
        window.sessionStorage.setItem('portifycv-session-snapshot', snapshot)
      }, JSON.stringify(cv))
      await page.goto(`/cv?template=${template.id}`)
      await expect(page.locator(BUILDER_ROOT)).toContainText(cv.fullName.split(' ')[0])
      await waitForStableLayout(page)

      const violations = await auditLayout(page, BUILDER_ROOT)
      const { remaining, staleEntries } = filterAllowlisted(violations, LAYOUT_ALLOWLIST, {
        template: template.id, subject: `stress:${fixtureId}`, mode: 'stress',
      })
      expect(remaining, 'layout violations').toEqual([])
      expect(staleEntries, 'allowlist entries that no longer fail — remove them').toEqual([])
    })
  }
}
```

`addInitScript` runs on every navigation. Check that the builder's own snapshot writer doesn't immediately overwrite or clear the injected snapshot before it's read. It's read synchronously at mount, so it shouldn't.

- [ ] **Step 4: Run, record the stress baseline, re-run green**

Run: `npx playwright test e2e/template-layout.spec.js -g "stress:"`. Add allowlist entries (`mode: 'stress'`, same reason text) for every finding after triage. Treat `beyond-page` the same way as in Task 2. Re-run until green with nothing stale.

- [ ] **Step 5: Commit**

```bash
git add e2e/fixtures/stressCvs.js e2e/template-layout.spec.js e2e/fixtures/layoutAllowlist.js
git commit -m "Audit every template against synthetic stress CVs"
npm version 1.4.3 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.4.3"
```

---

### Task 4: PDF smoke per template

**Files:**
- Create: `e2e/template-pdf.spec.js`

**Interfaces:**
- Consumes: `cvTemplates`, `TEMPLATE_EXAMPLES`, `loadExampleCv`; the builder handoff `/cv?template=<id>&example=<exampleId>` (Phase 1); the export menu (banner → "Export" → menuitem "PDF", as in `e2e/direct-edit.spec.js:31`).
- Produces: tests named `pdf / <templateId>`.

- [ ] **Step 1: Write the spec**

```js
import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_EXAMPLES, loadExampleCv } from '../src/utils/exampleCvs.js'
import { waitForStableLayout } from './helpers/layoutAudit.js'

// PDF smoke per template (Phase 2): the real export path must finish, produce
// a non-blank file, and paginate close to what the preview shows. The PDF is
// image-based (html2canvas), so text isn't checked here — the plan's manual
// step renders page 1 of each to an image.

const PREVIEW_ROOT = /* same selector as the stress tier */ '.app-shell__preview [data-export-variant]'

for (const template of cvTemplates) {
  test(`pdf / ${template.id}`, async ({ page }, testInfo) => {
    test.setTimeout(90_000)
    const exampleId = TEMPLATE_EXAMPLES[template.id][0]
    const cv = await loadExampleCv(exampleId, 'en')
    await page.goto(`/cv?template=${template.id}&example=${exampleId}`)
    await expect(page.locator(PREVIEW_ROOT)).toContainText(cv.fullName.split(' ')[0])
    await waitForStableLayout(page)

    const expectedPages = await page.locator(PREVIEW_ROOT).evaluate((el) => Math.ceil(el.offsetHeight / (el.offsetWidth * 1.414)))

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })
    await page.getByRole('menuitem', { name: 'PDF' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.pdf$/)

    const path = testInfo.outputPath(`${template.id}.pdf`)
    await download.saveAs(path)
    const bytes = await readFile(path)
    expect(bytes.length, 'PDF should not be blank').toBeGreaterThan(30_000)

    const pageCount = (bytes.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length
    expect(Math.abs(pageCount - expectedPages), `pdf pages ${pageCount} vs preview ${expectedPages}`).toBeLessThanOrEqual(1)
  })
}
```

Calibrate the 30 KB floor against a real export of the sparsest template. Set it at about a third of the smallest observed size, and record the observed sizes in the report.

- [ ] **Step 2: Run it**

Run: `npx playwright test e2e/template-pdf.spec.js`
Expected: 18 pass. Treat a failure as a finding: record it in the report and the audit doc, and mark that test with `test.fixme` plus a comment naming the finding. Task 9 removes it.

- [ ] **Step 3: Keep the PDFs for the manual check**

Copy the 18 PDFs from `test-results/**/<id>.pdf` to `/tmp/phase2-pdfs/`. The controller renders page 1 of each to an image for §7.8.

- [ ] **Step 4: Commit**

```bash
git add e2e/template-pdf.spec.js
git commit -m "Smoke-test PDF export for every template"
npm version 1.4.4 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.4.4"
```

---

### Task 5: Audit doc and fix grouping

**Files:**
- Create: `docs/template-audit-phase2.md`

**Interfaces:**
- Consumes: the allowlist (Tasks 2–3), the Task 4 report, the controller's §7.8 PDF image findings, `docs/template-audit-a2.md` (format and rubric axes), `docs/template-design-system.md` §9.
- Produces: the fix list that Tasks 6–9 work from. Each item has an id (`F1`, `F2`, …), a root cause, templates, allowlist entries, and the fix group it belongs to (6, 7, 8 or 9).

- [ ] **Step 1: Count findings**

Build a table of template × rule, with counts from `LAYOUT_ALLOWLIST`, plus the PDF results.

- [ ] **Step 2: Diagnose each finding's root cause**

Read the template's CSS/JSX at the failing element (the violation `detail` names the element). Group findings by cause, not by template, using these groups:
- **G6 long unbreakable values:** URLs, emails or long skills clipped or overflowing.
- **G7 names in narrow columns:** `name-lines`, or `mid-word-break` in names.
- **G8 density:** `length`.
- **G9 everything else:** sparse layouts, PDF findings, one-offs.

- [ ] **Step 3: Re-score the §9 rubric**

Use the same seven axes and 0–3 scale as `template-audit-a2.md`, scored from this evidence. Note the before-fix score now; Task 10 fills in after-fix scores.

- [ ] **Step 4: List out-of-scope follow-ups**

Record redesign-level problems found during diagnosis here, and don't fix them.

- [ ] **Step 5: Commit**

```bash
git add docs/template-audit-phase2.md
git commit -m "Add the Phase 2 template audit"
npm version 1.4.5 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.4.5"
```

---

### Task 6: Fix G6, long unbreakable values

**Files:** the CSS (and, only where unavoidable, JSX) of the templates the audit doc lists under G6; `e2e/fixtures/layoutAllowlist.js`.

**Interfaces:** consumes the G6 items from `docs/template-audit-phase2.md`.

**Fix pattern:** never truncate an information-bearing value. For link/email/URL value elements, replace an ellipsis rule:

```css
/* before */
.modern-showcase__link-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* after: URLs have no spaces; let them break anywhere rather than hide. */
.modern-showcase__link-value {
  overflow-wrap: anywhere;
  min-width: 0;
}
```

For skill chips and pills, allow wrapping inside the chip (`white-space: normal; overflow-wrap: break-word;`), and keep the chip's padding and radius. If a flex/grid child still overflows, the missing piece is usually `min-width: 0` on the child. If the same pattern repeats across 3 or more templates, add a shared primitive class per §6 of the design system (e.g. `.tpl-value-breakable`), add it to the design-system doc, and use it everywhere.

- [ ] **Step 1:** Remove the G6 entries from the allowlist. Run `npx playwright test e2e/template-layout.spec.js` and confirm exactly those tests fail.
- [ ] **Step 2:** Apply the fixes, one template at a time.
- [ ] **Step 3:** Re-run `e2e/template-layout.spec.js` (all tiers), `e2e/templates.spec.js` (link formatting, chip contrast) and `e2e/template-pdf.spec.js`. Everything passes, with nothing stale.
- [ ] **Step 4:** Mark each fixed item "fixed (1.4.6)" in the audit doc.
- [ ] **Step 5:** Commit `Wrap long links and skills instead of clipping them`, then `Bump version to 1.4.6`.

---

### Task 7: Fix G7, names in narrow columns

**Files:** the templates under G7; possibly `src/styles/tokens.css` (if a shared rule is added); `docs/template-design-system.md`; the allowlist.

**Fix pattern** (§2: the name is the row that changes most between density classes; no ad-hoc sizes). When the name sits in a column narrower than about 260px (sidebar headers such as Navy Professional), step that template's name down one density class, using the next class's token values:

```css
/* Navy Professional's name sits in a ~186px sidebar; the standard-class name
   wraps to 4 lines for long names. Use the compact-class name row (§2). */
.navy-professional-showcase__name {
  font-size: 1.65rem; /* §2 compact name */
  line-height: 1.15;
  overflow-wrap: break-word;
}
```

If the template already uses the compact class and still fails, make a §2 amendment rather than inventing a size. Add a "narrow-column name" row to §2 (e.g. `1.40rem / 1.15`), document why, and use it. `mid-word-break` in a name is fixed by giving its column a `min-width` floor (§7.1's Modern Orange lesson), not by `overflow-wrap: anywhere`.

- [ ] **Step 1:** Remove the G7 entries; confirm they fail.
- [ ] **Step 2:** Apply the fixes. Amend the design-system doc if a new ramp row is needed.
- [ ] **Step 3:** Re-run the layout, template, template-pages and PDF specs. All pass.
- [ ] **Step 4:** Update the audit doc.
- [ ] **Step 5:** Commit `Keep long names within two lines in narrow columns`, then `Bump version to 1.4.7`.

---

### Task 8: Fix G8, density

**Files:** the templates under G8 (Portfolio Hybrid expected); the allowlist; the audit doc.

**Fix pattern:** first measure where the height goes. Section heights come from `[data-export-section]` `offsetHeight` (the Phase 1 audit did this). Then pick the smallest fix that holds the template's identity:
1. move to the next denser §2 class (`tpl-density-roomy` → `tpl-density-standard`, or `standard` → `compact`), which changes the class on the Showcase root;
2. or reduce the template's own vertical rhythm (section gap, entry gap, card padding) by token-sized steps.

Record which one you chose and why in the audit doc.

- [ ] **Step 1:** Remove the G8 entries; confirm they fail.
- [ ] **Step 2:** Apply the fix. Re-run the full example tier, because a density change moves every example on that template.
- [ ] **Step 3:** The layout, template, template-pages and PDF specs pass. Check that the PDF page count dropped accordingly.
- [ ] **Step 4:** Update the audit doc.
- [ ] **Step 5:** Commit `Tighten <template> density to fit two pages`, then `Bump version to 1.4.8`.

---

### Task 9: Fix G9, everything else

**Files:** per the audit doc's G9 list; the allowlist; `e2e/template-pdf.spec.js` (remove any `test.fixme`).

Work through each G9 item using the same loop: remove its allowlist entry or `fixme`, see it fail, fix it following the design system, see it pass. Sparse-layout fixes (§7.5): an empty sidebar or rail collapses or hides its container. Dividers next to an empty section don't render.

- [ ] **Step 1–4:** The same loop as Tasks 6–8, one item at a time.
- [ ] **Step 5:** `LAYOUT_ALLOWLIST` is `[]`. Any entry that can't be fixed in scope stays, with its justification in the audit doc ("Accepted exceptions") and a note for the PR. No `test.fixme` remains, except the same way, with a justification.
- [ ] **Step 6:** Commit `Fix remaining template layout findings`, then `Bump version to 1.4.9`.

---

### Task 10: Close-out

**Files:** `docs/template-audit-phase2.md` (after-fix scores), `todo.md` (Phase 2 inputs → resolved, with pointers), `changes.md`, `CLAUDE.md` (the layout harness, its allowlist, and the `data-cv-name` / `data-decorative` markers a new template must carry), `README.md` (test list), the PR description.

- [ ] **Step 1: Runtime check.** Time the full `npm run test:e2e` and compare it with ~1.1 minutes before Phase 2. If it's more than 2×, tag the stress tier and the PDF spec `@slow`, add a second CI job that runs `--grep @slow`, and have the main job run `--grep-invert @slow`. Record the times.
- [ ] **Step 2: Full verification.** Lint, all seven check scripts, and the full e2e suite pass. Record the counts.
- [ ] **Step 3: Docs.** Re-score the rubric with after-fix values, resolve the Phase 2 inputs in `todo.md`, add a `changes.md` entry dated on the day, and update CLAUDE.md (a new template must carry `data-cv-name`, mark decorations `data-decorative`, and pass `template-layout.spec.js` with no allowlist entries).
- [ ] **Step 4: Version.** Commit `Document the Phase 2 template polish`, then run `npm version 1.5.0 --no-git-tag-version` and commit `Bump version to 1.5.0`.
- [ ] **Step 5: PR description.** Write it (v1.5.0 → main, noting that it depends on v1.4.0 merging first) to the scratchpad, ending with the 🤖 Claude Code line. **Do not push, rebase or open a PR.**

---

## Self-review notes

- **Spec coverage:**
  - harness rules → T1
  - example tier → T2
  - stress tier → T3
  - markers → T2
  - allowlist and stale detection → T1, T2
  - PDF smoke and manual image check → T4 (+ controller)
  - audit doc → T5, T10
  - fix groups → T6–T9
  - empty allowlist → T9
  - runtime budget → T10
  - design-system amendments → T6, T7
- **Deviations from the spec:**
  - The `mid-word-break` rule applies to all text, not just names and entry titles. URL/email-like tokens are exempt, and hyphens and slashes count as legitimate breaks. This is a superset of the spec's rule with no extra markers needed.
  - The stress tier loads CVs through the session-restore snapshot instead of share links. The share encoder needs `window.btoa`, and the snapshot path goes through the same `parseImportedCvData`.
- **Version map:** T1 1.4.1 … T9 1.4.9, T10 1.5.0.
