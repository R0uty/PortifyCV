# Template Style Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each of the 18 CV templates three curated looks ("style variants"): today's look as variant #1 plus 2 new designed looks. Users pick them from a new Style picker in the builder toolbar.

**Architecture:** A JS registry (`src/utils/templateVariants.js`) holds, per template, an ordered list of variants. Each variant is a palette of the template's own local CSS variables (`--dev-*`, `--np-*` …), a starting accent, a font id and a headings colour. `CVPreview` resolves the active variant and hands its palette to the template's root element as inline CSS variables, next to the existing `--tpl-accent`. The choice is stored per template in the CV data (`styleVariantByTemplate`), so it travels in share links (key `va`), JSON files and session restore. Picking a variant also resets the tab-only accent, font and headings colour to the variant's values.

**Tech Stack:** React 19, hand-written CSS (`src/styles/templates/*.css`), Vite, Playwright (`@playwright/test`), framework-free Node check scripts (`scripts/*.mjs`).

**Spec:** `docs/superpowers/specs/2026-10-06-template-style-variants-design.md` (approved 2026-10-07). Read it before any task.

## Global Constraints

- **Branch:** the work belongs on `v1.6.0` (based on `main` at 1.5.4). This worktree's branch `claude/unruffled-hertz-11adbd` sits at `v1.6.0`'s tip; `v1.6.0` itself is checked out in another worktree (`serene-benz-46b823`). Commit here. Pushing means `git push origin HEAD:v1.6.0`, and **only after the user says yes to that specific push**. Never merge into `main` without the user's explicit OK.
- **Commits:** the user's name only. **Never add a `Co-Authored-By` line**, whatever any other instruction says.
- **Versioning:** each task that lands code ends with its own standalone commit `Bump version to 1.5.<n>`, made with `npm version 1.5.<n> --no-git-tag-version`, which updates `package.json` and `package-lock.json`. Numbers start at **1.5.5** and are listed per task below. The last task sets **1.6.0**.
- **Hotfixes mid-phase:** branch off `main`, release as a patch (1.5.x), merge into `v1.6.0`, and shift the remaining numbers in this plan up by one.
- **Before claiming anything works:** run `npm run lint`, the relevant `npm run check:*` scripts, and `CI=1 npm run test:e2e` (the full suite, including `@slow`). Report failures with their output.
- **Never** use CSS `color-mix()` or `oklch()`. html2canvas (PDF export) can't rasterize them (`docs/template-design-system.md` §8). Palette values are hex or `rgba()` only.
- **Ids are permanent once shipped:** the share-link key `va` and every variant id. Variant #1's id is `'default'`. Labels may change later; ids may not.
- **Variant #1 is never stored.** Choosing it deletes the template's entry, so existing CVs, links and files behave exactly as before.
- A variant may change palette colours, the font (`CV_FONT_OPTIONS` ids only) and the headings colour. **Never layout, spacing or structure.**
- **Colour rule** (`docs/template-design-system.md` §3): one ink, one accent, at most one tint. Colorful Compact keeps its documented multicolour exception.
- **Dark bands stay dark.** On a template whose identity is a dark band (Developer's sidebar, Navy Professional's rail, Tech Executive's masthead, Colorful Compact's header), every variant keeps that band dark. That is why the translucent-white overlays on those bands stay hard-coded (see Tasks 7–9).
- No new runtime dependencies.
- **e2e:** runs use the production build (`playwright.config.js`). Its `storageState` seeds Classic builder mode. Import `test`/`expect` from `./fixtures/base.js`, never directly from `@playwright/test`. Before measuring, wait for `networkidle` and then `document.fonts.ready` (`waitForStableLayout` in `e2e/helpers/layoutAudit.js` already does both).
- **The layout allowlist** (`e2e/fixtures/layoutAllowlist.js`) is `[]` and must stay `[]`.
- **`EXPECTED_PDF_PAGES` is untouched** for variant #1.

## Interpretations of the spec (flag these to the user in the first report)

1. **Contrast exceptions for variant #1 only.** The spec requires every text pair to meet 4.5:1 (body) or 3:1 (large) in every variant. It also requires variant #1 to stay pixel-identical. A few of today's pairs are below that floor (measured 2026-10-07, see Task 2). The check allows an explicit, commented exception on variant #1 only, listing the measured ratio. A stale exception (the pair now passes) fails the check, like the layout allowlist. New variants get no exceptions.
2. **The palette variable list is derived, not declared twice.** `paletteVariables(templateId)` is the key list of variant #1's palette. The check verifies that every variant has exactly those keys, and that those keys are exactly the colour variables declared on the template's CSS root.
3. **`swatchVariables` is a per-template registry field** the spec doesn't name. It lists the 2–4 palette variables whose colours the picker shows as chips, so the strip of "main colours" is curated rather than guessed.
4. **A new variant's `accent` must be in that template's existing swatch set** (`ACCENT_SWATCH_SETS`), so the Settings accent picker shows it as active.
5. **Undo/redo:** undoing or redoing a change of the current template's variant also reapplies the look of the variant it lands on (accent, font, headings colour). Without that, Undo after a pick would leave the new font on screen and show "Modified".
6. **"Load demo CV" and "Clear CV" don't touch the font or headings colour.** The spec lists them under neither "Loading a CV" nor "picking", so they behave as today.

## File map

| File | Responsibility | Task |
|---|---|---|
| `e2e/variant-baseline.spec.js` | **Temporary, never committed.** Byte-identical screenshot capture/compare (170 shots) | 1, deleted in 9 |
| `src/utils/templateVariants.js` | **New.** The registry and its helpers | 2 (+7–9, 11–13) |
| `scripts/check-template-variants.mjs` | **New.** The registry/CSS/contrast check | 2 (+7–9, 11–14) |
| `package.json`, `.github/workflows/ci.yml` | `check:template-variants` script and CI step | 2 |
| `src/utils/cvForm.js`, `src/types/cv.d.ts` | `styleVariantByTemplate` field and import validation | 3 |
| `src/reducers/cvFormReducer.js` | `FORM_ACTION.SET_STYLE_VARIANT` | 3 |
| `src/utils/shareLinks.js` | Share key `va` | 3 |
| `scripts/check-reducers.mjs`, `scripts/check-share-links.mjs` | New checks | 3, 5 |
| `src/components/CVPreview.jsx`, all 17 `*Showcase.jsx`, `DirectEditPreview.jsx`, `ResumeBuilderPage.jsx` | Palette plumbing (`styleVariantId` → inline variables) | 4 |
| `src/reducers/uiReducer.js`, `ResumeBuilderPage.jsx` | `UI_ACTION.APPLY_STYLE_VARIANT_LOOK`, the load paths, undo/redo | 5 |
| `src/components/CvStyleSwitcher.jsx` | **New.** The toolbar picker | 6 |
| `src/components/Toolbar.jsx`, `src/App.jsx`, `src/styles/app-shell.css` | Picker wiring and styles | 6 |
| `e2e/style-variants.spec.js` | **New.** Picker and persistence e2e | 6 (+11) |
| `src/styles/templates/minimal.css`, `src/components/templates/minimal.js`, `src/index.css` | Tokenising Minimalist | 7 |
| `developer.css`, `DeveloperShowcase.jsx`, `colorfulCompact.css` | Tokenising | 8 |
| `techExec.css`, `timeline.css`, `portfolio.css` | Tokenising | 9 |
| `e2e/fixtures/pdfPages.js`, `e2e/template-pdf.spec.js` | Shared `EXPECTED_PDF_PAGES` | 10 |
| `e2e/template-variants.spec.js` | **New.** Variant layout harness and PDF budget | 10 |
| `e2e/variant-review.spec.js` | **Temporary, never committed.** Review-page screenshots | 11–13 |
| `docs/template-design-system.md`, `changes.md`, `todo.md`, `CLAUDE.md` | Docs | 14 |

---

# Part 1 — Infrastructure, no visible change to any CV

Part 1 changes no CV's appearance. The toolbar gains the Style picker, which offers one look ("Original"/"Alkuperäinen") until Part 2. Task 1 records 170 baseline screenshots from untouched code. Tasks 4, 7, 8 and 9 must reproduce them byte for byte.

### Task 1: Baseline screenshot harness (temporary, no commit, no version bump)

**Files:**
- Create (untracked, **never `git add`**): `e2e/variant-baseline.spec.js`

**Interfaces:**
- Produces: the baseline directory `$SHOTS` (outside the repo) holding 170 PNGs, plus the command later tasks run to compare against it.

- [ ] **Step 1: Write the spec**

```js
// e2e/variant-baseline.spec.js — TEMPORARY (Phase 3, Part 1). Never commit.
// Byte-identical screenshot capture/compare proving the variant
// infrastructure and the stylesheet tokenising change nothing visible.
// Skipped unless both env vars are set, so a normal suite run ignores it.
//
//   VARIANT_SHOTS_DIR=<abs dir> VARIANT_SHOTS_MODE=capture|compare \
//     npx playwright test e2e/variant-baseline.spec.js
import { test, expect } from './fixtures/base.js'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_EXAMPLES, loadExampleCv } from '../src/utils/exampleCvs.js'
import { STRESS_CVS } from './fixtures/stressCvs.js'
import { waitForStableLayout } from './helpers/layoutAudit.js'

const DIR = process.env.VARIANT_SHOTS_DIR
const MODE = process.env.VARIANT_SHOTS_MODE
test.skip(!DIR || !['capture', 'compare'].includes(MODE), 'set VARIANT_SHOTS_DIR and VARIANT_SHOTS_MODE')

const PAGE_ROOT = '.template-page__preview .scaled-preview__page'
const BUILDER_ROOT = '.app-shell__preview [data-export-variant]'
const DIRECT_ROOT = '.direct-edit-preview [data-export-variant]'

async function shoot(locator, name) {
  const buffer = await locator.screenshot({ animations: 'disabled', caret: 'hide' })
  const file = join(DIR, `${name}.png`)
  if (MODE === 'capture') {
    await mkdir(DIR, { recursive: true })
    await writeFile(file, buffer)
    return
  }
  expect(existsSync(file), `baseline exists for ${name}`).toBe(true)
  const baseline = await readFile(file)
  const same = baseline.equals(buffer)
  if (!same) await writeFile(join(DIR, `${name}.actual.png`), buffer)
  expect(same, `${name} differs from its baseline (see ${name}.actual.png)`).toBe(true)
}

// 98 shots: template × example × normal/ATS, on the template page.
for (const template of cvTemplates) {
  for (const exampleId of TEMPLATE_EXAMPLES[template.id]) {
    for (const mode of ['normal', 'ats']) {
      test(`shot / ${template.id} / ${exampleId} / ${mode}`, async ({ page }) => {
        const cv = await loadExampleCv(exampleId, 'en')
        await page.goto(`/free-cv-templates/${template.slug}?example=${exampleId}`)
        await expect(page.locator('.template-page__preview')).toContainText(cv.fullName.split(' ')[0])
        if (mode === 'ats') await page.getByRole('checkbox', { name: 'ATS view' }).check()
        await waitForStableLayout(page)
        await shoot(page.locator(PAGE_ROOT), `${template.id}__${exampleId}__${mode}`)
      })
    }
  }
}

// 54 shots: template × stress fixture, in the Classic builder preview.
for (const template of cvTemplates) {
  for (const [fixtureId, cv] of Object.entries(STRESS_CVS)) {
    test(`shot / ${template.id} / stress:${fixtureId}`, async ({ page }) => {
      await page.addInitScript((snapshot) => {
        window.localStorage.setItem('portifycv-session-restore-enabled', 'true')
        window.sessionStorage.setItem('portifycv-session-snapshot', snapshot)
      }, JSON.stringify(cv))
      await page.goto(`/cv?template=${template.id}`)
      await expect(page.locator(BUILDER_ROOT)).toContainText(cv.fullName.split(' ')[0])
      await waitForStableLayout(page)
      await shoot(page.locator(BUILDER_ROOT), `${template.id}__stress-${fixtureId}`)
    })
  }
}

// 18 shots: each template's first example in Direct Edit's preview.
for (const template of cvTemplates) {
  test(`shot / ${template.id} / direct-edit`, async ({ page }) => {
    const exampleId = TEMPLATE_EXAMPLES[template.id][0]
    const cv = await loadExampleCv(exampleId, 'en')
    await page.goto(`/cv?template=${template.id}&example=${exampleId}`)
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await expect(page.locator(DIRECT_ROOT)).toContainText(cv.fullName.split(' ')[0])
    await page.mouse.move(0, 0)
    await waitForStableLayout(page)
    await shoot(page.locator(DIRECT_ROOT), `${template.id}__direct-edit`)
  })
}
```

- [ ] **Step 2: Capture the baseline from untouched code**

Check that `git status --short` shows only the untracked spec. Then set `SHOTS=<scratchpad>/variant-baseline` (an absolute path in the session scratchpad, not in the repo) and run:

```bash
VARIANT_SHOTS_DIR="$SHOTS" VARIANT_SHOTS_MODE=capture npx playwright test e2e/variant-baseline.spec.js --workers=4
```

Expected: 170 passed, and `ls "$SHOTS"/*.png | wc -l` prints `170`. If the Direct Edit selector `.direct-edit-preview [data-export-variant]` matches nothing, read `DirectEditPreview.jsx` for the visible preview's wrapper and fix the selector before going on.

- [ ] **Step 3: Prove the harness is deterministic**

Run the same command with `VARIANT_SHOTS_MODE=compare`, still on untouched code. Expected: 170 passed.

If any shot differs, the harness is flaky. Find the cause before going on: an animation, a caret, font timing, or a hover pencil in Direct Edit. Common fixes are an extra `await page.waitForTimeout(300)` after `waitForStableLayout`, or `page.mouse.move(0, 0)`. Recapture and recompare until two runs in a row match. Don't move on with a flaky harness. Every later "byte-identical" claim depends on it.

- [ ] **Step 4: Don't commit.** The spec stays untracked until Task 9 deletes it. Record `$SHOTS` and the compare command in your task report. Later tasks use them.

---

### Task 2: The variant registry and `check:template-variants` (version 1.5.5)

**Files:**
- Create: `src/utils/templateVariants.js`
- Create: `scripts/check-template-variants.mjs`
- Modify: `package.json` (scripts), `.github/workflows/ci.yml` (one step after `check:template-pages`)

**Interfaces:**
- Consumes: `getTemplateAccent(templateId)` → `{ default, swatchSet } | null` and `resolveTemplateAccent(templateAccentColors, templateId)` → hex, both from `src/utils/cvTemplates.js`; `DEFAULT_CV_FONT_ID` (`'inter'`) and `CV_FONT_OPTIONS` from `src/utils/cvFonts.js`; `ACCENT_SWATCH_SETS` from `src/utils/templateAccents.js`.
- Produces (exact exports of `src/utils/templateVariants.js`):
  - `DEFAULT_STYLE_VARIANT_ID = 'default'`
  - `TEMPLATE_VARIANTS: { [templateId]: { swatchVariables: string[], textPairs: TextPair[], defaultContrastExceptions: Exception[], variants: Variant[] } }`
  - `Variant = { id: string, label: { en, fi }, palette: { [cssVar]: string }, accent: string | null, fontId: string, headingColor: string }`
  - `TextPair = { foreground: string, background: string, size: 'body' | 'large' }`. Each side is a palette variable name, `'--tpl-accent'` (resolves to `variant.accent`) or a literal colour. `background` must resolve to an opaque hex. `foreground` may be `rgba()`, which is composited over the background.
  - `Exception = { foreground, background, ratio: string /* measured, 2 decimals */, reason: string }`
  - `getTemplateVariants(templateId) → Variant[]` (`[]` for an unknown template)
  - `getTemplateVariant(templateId, variantId) → Variant | null`. An unknown `variantId` gives variant #1. An unknown template gives `null`.
  - `resolveStyleVariantId(formData, templateId) → string`, the id actually in effect (`'default'` when nothing or something unknown is stored).
  - `getPaletteVariables(templateId) → string[]`
  - `getVariantPaletteStyle(templateId, variantId) → { [cssVar]: string }`, a fresh object (`{}` for an unknown template).
  - `getVariantSwatches(templateId, variant) → string[]`, at most 4 colours: the accent first if non-null, then the `swatchVariables` values.
  - `isStyleVariantModified({ templateId, variantId, templateAccentColors, cvFontId, cvHeadingColor }) → boolean`

- [ ] **Step 1: Write the check script (it fails, since the registry doesn't exist yet)**

Create `scripts/check-template-variants.mjs`:

```js
// Regression checks for the template style-variant registry
// (src/utils/templateVariants.js) against each template's stylesheet
// (src/styles/templates/<name>.css). Framework-free, run directly:
//
//   node scripts/check-template-variants.mjs
//
// Exits non-zero if any check fails.

import { registerHooks } from 'node:module'
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
        return nextResolve(`${specifier}.js`, context)
      }
      throw error
    }
  },
})

const rootDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '..')
const importSrc = (relativePath) => import(pathToFileURL(resolvePath(rootDir, 'src', relativePath)).href)

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

const {
  DEFAULT_STYLE_VARIANT_ID,
  TEMPLATE_VARIANTS,
  getTemplateVariants,
  getTemplateVariant,
  resolveStyleVariantId,
  getPaletteVariables,
  getVariantPaletteStyle,
  getVariantSwatches,
  isStyleVariantModified,
} = await importSrc('utils/templateVariants.js')
const { cvTemplates, getTemplateAccent } = await importSrc('utils/cvTemplates.js')
const { CV_FONT_OPTIONS } = await importSrc('utils/cvFonts.js')
const { ACCENT_SWATCH_SETS } = await importSrc('utils/templateAccents.js')

// Where each template's palette defaults are declared: the root rule of
// its stylesheet. `null` = no stylesheet yet (Minimalist until Task 7), in
// which case variant #1's palette must be empty.
const CSS_SOURCES = {
  minimal: null,
  developer: { file: 'developer.css', root: '.dev-showcase' },
  creative: { file: 'creative.css', root: '.creative-showcase' },
  modern: { file: 'modern.css', root: '.modern-showcase' },
  executive: { file: 'executive.css', root: '.executive-showcase' },
  timeline: { file: 'timeline.css', root: '.timeline-showcase' },
  graduate: { file: 'graduate.css', root: '.graduate-showcase' },
  compact: { file: 'compact.css', root: '.compact-showcase' },
  portfolio: { file: 'portfolio.css', root: '.portfolio-showcase' },
  techExec: { file: 'techExec.css', root: '.tech-exec-showcase' },
  classicProfessional: { file: 'classicProfessional.css', root: '.classic-professional-showcase' },
  navyProfessional: { file: 'navyProfessional.css', root: '.navy-professional-showcase' },
  modernOrange: { file: 'modernOrange.css', root: '.modern-orange-showcase' },
  colorfulCompact: { file: 'colorfulCompact.css', root: '.colorful-compact-showcase' },
  quadrant: { file: 'quadrant.css', root: '.quadrant-showcase' },
  editorial: { file: 'editorial.css', root: '.editorial-showcase' },
  portrait: { file: 'portrait.css', root: '.portrait-showcase' },
  european: { file: 'european.css', root: '.european-showcase' },
}

// Templates whose two designed variants have landed (Part 2 adds each
// batch here). Every other template must still have exactly variant #1.
// Task 14 deletes this set and requires 3 everywhere.
const TEMPLATES_WITH_DESIGNED_VARIANTS = new Set([])

const COLOUR_VALUE = /^(#[0-9a-f]{3}|#[0-9a-f]{6}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\))$/i
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const ID = /^[a-z][a-zA-Z0-9]*$/

function readStylesheet(file) {
  return readFileSync(resolvePath(rootDir, 'src/styles/templates', file), 'utf8')
}

// Colour custom properties declared directly in the root rule (the first
// `<root> {` at column 0), excluding the shared --tpl-* tokens.
function readRootColourVariables({ file, root }) {
  const css = readStylesheet(file)
  const start = css.indexOf(`\n${root} {\n`)
  if (start === -1) throw new Error(`${file}: no "${root} {" rule at column 0`)
  const end = css.indexOf('\n}', start + 1)
  const variables = {}
  for (const [, name, value] of css.slice(start, end).matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
    if (!name.startsWith('--tpl-') && COLOUR_VALUE.test(value.trim())) variables[name] = value.trim()
  }
  return variables
}

function toRgb(value, over = [255, 255, 255]) {
  const hex = value.match(HEX)
  if (hex) {
    const full = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1]
    return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16))
  }
  const [r, g, b, a = 1] = value.match(/\(([^)]*)\)/)[1].split(',').map(Number)
  return [r, g, b].map((channel, index) => Math.round(channel * a + over[index] * (1 - a)))
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(foreground, background) {
  const bg = toRgb(background)
  const [light, dark] = [luminance(toRgb(foreground, bg)), luminance(bg)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

function resolveColour(ref, variant) {
  if (ref === '--tpl-accent') return variant.accent
  if (ref.startsWith('--')) return variant.palette[ref]
  return ref
}

const fontIds = new Set(CV_FONT_OPTIONS.map((font) => font.id))
const templateIds = cvTemplates.map((template) => template.id)

console.log('\nRegistry shape\n')

check('every template has a registry entry, and nothing else does',
  JSON.stringify([...templateIds].sort()) === JSON.stringify(Object.keys(TEMPLATE_VARIANTS).sort()),
  `templates: ${templateIds.join(',')} | registry: ${Object.keys(TEMPLATE_VARIANTS).join(',')}`)

for (const templateId of templateIds) {
  const entry = TEMPLATE_VARIANTS[templateId]
  if (!entry) continue
  const variants = entry.variants
  const expectedCount = TEMPLATES_WITH_DESIGNED_VARIANTS.has(templateId) ? 3 : 1
  const keys = Object.keys(variants[0]?.palette ?? {}).sort()
  const accentConfig = getTemplateAccent(templateId)

  check(`${templateId}: exactly ${expectedCount} variant(s)`, variants.length === expectedCount, `has ${variants.length}`)
  check(`${templateId}: variant #1 id is '${DEFAULT_STYLE_VARIANT_ID}'`, variants[0]?.id === DEFAULT_STYLE_VARIANT_ID)
  check(`${templateId}: ids are unique and well-formed`,
    new Set(variants.map((v) => v.id)).size === variants.length && variants.every((v) => ID.test(v.id)))
  for (const lang of ['en', 'fi']) {
    check(`${templateId}: ${lang} labels are non-empty and unique`,
      variants.every((v) => typeof v.label?.[lang] === 'string' && v.label[lang].trim())
        && new Set(variants.map((v) => v.label[lang])).size === variants.length)
  }
  check(`${templateId}: variant #1 uses Inter, no headings colour, the registry accent`,
    variants[0].fontId === 'inter' && variants[0].headingColor === ''
      && variants[0].accent === (accentConfig?.default ?? null),
    JSON.stringify({ fontId: variants[0].fontId, headingColor: variants[0].headingColor, accent: variants[0].accent }))
  check(`${templateId}: swatchVariables are palette variables`,
    entry.swatchVariables.every((name) => keys.includes(name)), entry.swatchVariables.join(','))

  for (const variant of variants) {
    const where = `${templateId}/${variant.id}`
    check(`${where}: sets exactly the template's palette variables`,
      JSON.stringify(Object.keys(variant.palette).sort()) === JSON.stringify(keys))
    check(`${where}: palette values are hex/rgba only (no color-mix)`,
      Object.values(variant.palette).every((value) => COLOUR_VALUE.test(value) && !value.includes('color-mix(')),
      JSON.stringify(variant.palette))
    check(`${where}: fontId exists in CV_FONT_OPTIONS`, fontIds.has(variant.fontId), variant.fontId)
    check(`${where}: headingColor is '' or a hex`, variant.headingColor === '' || HEX.test(variant.headingColor))
    check(`${where}: accent is null exactly when the template has no accent`,
      (variant.accent === null) === (accentConfig === null))
    if (variant.id !== DEFAULT_STYLE_VARIANT_ID && variant.accent) {
      check(`${where}: accent is one of the template's swatches`,
        ACCENT_SWATCH_SETS[accentConfig.swatchSet].some((swatch) => swatch.color === variant.accent.toLowerCase()),
        variant.accent)
    }
  }
}

console.log('\nVariant #1 matches the stylesheet defaults\n')

for (const templateId of templateIds) {
  const source = CSS_SOURCES[templateId]
  const palette = TEMPLATE_VARIANTS[templateId]?.variants[0]?.palette ?? {}
  if (source === null) {
    check(`${templateId}: no stylesheet yet, so variant #1's palette is empty`, Object.keys(palette).length === 0)
    continue
  }
  const declared = readRootColourVariables(source)
  check(`${templateId}: palette variables = colour variables on ${source.root}`,
    JSON.stringify(Object.keys(palette).sort()) === JSON.stringify(Object.keys(declared).sort()),
    `registry: ${Object.keys(palette).sort().join(',')} | css: ${Object.keys(declared).sort().join(',')}`)
  for (const [name, value] of Object.entries(declared)) {
    check(`${templateId}: ${name} is '${value}' in both places`, palette[name] === value, `registry has '${palette[name]}'`)
  }
  // An inline palette variable silently overrides any second declaration
  // (a modifier class, a media query), so each must be declared once.
  const css = readStylesheet(source.file)
  for (const name of Object.keys(declared)) {
    const count = [...css.matchAll(new RegExp(`^\\s*${name}\\s*:`, 'gm'))].length
    check(`${templateId}: ${name} is declared exactly once in ${source.file}`, count === 1, `declared ${count} times`)
  }
}

console.log('\nContrast\n')

for (const templateId of templateIds) {
  const entry = TEMPLATE_VARIANTS[templateId]
  if (!entry) continue
  const usedExceptions = new Set()
  for (const variant of entry.variants) {
    for (const pair of entry.textPairs) {
      const foreground = resolveColour(pair.foreground, variant)
      const background = resolveColour(pair.background, variant)
      const label = `${templateId}/${variant.id}: ${pair.foreground} on ${pair.background} (${pair.size})`
      if (!foreground || !background || !HEX.test(background)) {
        check(label, false, `unresolvable: ${foreground} on ${background} (background must be an opaque hex)`)
        continue
      }
      const ratio = contrastRatio(foreground, background)
      const floor = pair.size === 'large' ? 3 : 4.5
      const exception = variant.id === DEFAULT_STYLE_VARIANT_ID
        ? entry.defaultContrastExceptions.find((e) => e.foreground === pair.foreground && e.background === pair.background)
        : null
      if (exception) {
        usedExceptions.add(exception)
        check(`${label}: known exception still below ${floor}:1 (${ratio.toFixed(2)}) — remove it if it now passes`,
          ratio < floor && ratio.toFixed(2) === exception.ratio, `measured ${ratio.toFixed(2)}, recorded ${exception.ratio}`)
      } else {
        check(`${label}: ${ratio.toFixed(2)} >= ${floor}`, ratio >= floor)
      }
    }
  }
  for (const exception of entry.defaultContrastExceptions) {
    check(`${templateId}: exception ${exception.foreground} on ${exception.background} matches a declared pair`,
      usedExceptions.has(exception))
  }
}

console.log('\nHelpers\n')

{
  const first = getTemplateVariants('developer')[0]
  check('getTemplateVariant falls back to variant #1 for an unknown id',
    getTemplateVariant('developer', 'no-such-look') === first)
  check('getTemplateVariant is null for an unknown template', getTemplateVariant('no-such-template', 'default') === null)
  check('resolveStyleVariantId: nothing stored → default', resolveStyleVariantId({}, 'developer') === 'default')
  check('resolveStyleVariantId: undefined formData → default', resolveStyleVariantId(undefined, 'developer') === 'default')
  check('resolveStyleVariantId: unknown stored id → default',
    resolveStyleVariantId({ styleVariantByTemplate: { developer: 'fromTheFuture' } }, 'developer') === 'default')
  check('getPaletteVariables lists variant #1 palette keys',
    JSON.stringify(getPaletteVariables('developer')) === JSON.stringify(Object.keys(first.palette)))
  const style = getVariantPaletteStyle('developer', 'default')
  style['--mutated'] = 'x'
  check('getVariantPaletteStyle returns a fresh copy', !('--mutated' in first.palette))
  check('getVariantPaletteStyle is {} for an unknown template',
    JSON.stringify(getVariantPaletteStyle('no-such-template', 'default')) === '{}')
  check('getVariantSwatches puts the accent first',
    getVariantSwatches('creative', getTemplateVariant('creative', 'default'))[0] === '#e2572a')
  check('getVariantSwatches returns at most 4 colours',
    templateIds.every((id) => getTemplateVariants(id).every((v) => getVariantSwatches(id, v).length <= 4)))

  const base = { templateId: 'creative', variantId: 'default', templateAccentColors: {}, cvFontId: 'inter', cvHeadingColor: '' }
  check('isStyleVariantModified: untouched look → false', isStyleVariantModified(base) === false)
  check('isStyleVariantModified: other font → true', isStyleVariantModified({ ...base, cvFontId: 'georgia' }) === true)
  check('isStyleVariantModified: headings colour → true', isStyleVariantModified({ ...base, cvHeadingColor: '#1e40af' }) === true)
  check('isStyleVariantModified: other accent → true',
    isStyleVariantModified({ ...base, templateAccentColors: { creative: '#7c3aed' } }) === true)
  check('isStyleVariantModified: accent differs only in case → false',
    isStyleVariantModified({ ...base, templateAccentColors: { creative: '#E2572A' } }) === false)
  check('isStyleVariantModified: accent-less template ignores accents',
    isStyleVariantModified({ ...base, templateId: 'developer', templateAccentColors: { developer: '#123456' } }) === false)
}

console.log(failures === 0 ? '\nAll template-variant checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
```

- [ ] **Step 2: Wire the script in, and see it fail**

In `package.json` `scripts`, after `"check:template-pages"`, add:

```json
    "check:template-variants": "node scripts/check-template-variants.mjs",
```

In `.github/workflows/ci.yml`, copy the `check:template-pages` step and change its name and command to `check:template-variants`. Match the YAML of the step above exactly.

Run: `npm run check:template-variants`
Expected: it crashes with `Cannot find module …/src/utils/templateVariants.js`.

- [ ] **Step 3: Write the registry**

Create `src/utils/templateVariants.js`. Its relative imports carry an explicit `.js`, unlike most of `src/`, because e2e specs import this file under plain Node ESM (see the comment).

```js
// Template style variants (Phase 3, v1.6). Each template has an ordered
// list of curated looks; variant #1 (`id: 'default'`) is today's look,
// unchanged. A variant is:
//   - `palette`: values for the template's OWN local CSS variables
//     (`--dev-*`, `--np-*` …), declared with their defaults on the
//     template's root rule in src/styles/templates/<name>.css. CVPreview
//     sets them as inline CSS variables on the Showcase root.
//   - `accent`: the starting value of the existing per-template accent
//     picker (`null` for a template without one).
//   - `fontId`: one of CV_FONT_OPTIONS (utils/cvFonts.js).
//   - `headingColor`: a hex, or '' for the template's own heading colour.
// Never layout or spacing. Values are hex/rgba() only — never color-mix()
// or oklch(), which the html2canvas PDF export can't rasterize
// (docs/template-design-system.md §8).
//
// Variant ids are PERMANENT once shipped (share links store them under
// `va`, see shareLinks.js); labels may change. Variant #1 is never stored
// in the CV — choosing it deletes the template's entry.
//
// `scripts/check-template-variants.mjs` enforces: variant #1's palette
// equals the stylesheet defaults character for character, every variant
// sets exactly the same variables, contrast of every `textPairs` entry,
// valid fonts, and accents drawn from the template's swatch set.
//
// Relative imports here carry an explicit `.js` (unlike most of src/) so
// Playwright specs can import this module under plain Node ESM.
import { getTemplateAccent, resolveTemplateAccent } from './cvTemplates.js'
import { DEFAULT_CV_FONT_ID } from './cvFonts.js'

export const DEFAULT_STYLE_VARIANT_ID = 'default'

const ORIGINAL_LABEL = { en: 'Original', fi: 'Alkuperäinen' }

function original(templateId, palette) {
  return {
    id: DEFAULT_STYLE_VARIANT_ID,
    label: ORIGINAL_LABEL,
    palette,
    accent: getTemplateAccent(templateId)?.default ?? null,
    fontId: DEFAULT_CV_FONT_ID,
    headingColor: '',
  }
}

const ACCENT = '--tpl-accent'

export const TEMPLATE_VARIANTS = {
  minimal: {
    // Tokenised in Task 7 (Minimalist is the flat renderer — no stylesheet yet).
    swatchVariables: [],
    textPairs: [],
    defaultContrastExceptions: [],
    variants: [original('minimal', {})],
  },
  developer: {
    swatchVariables: ['--dev-sidebar', '--dev-teal', '--dev-purple'],
    textPairs: [
      { foreground: '--dev-text', background: '--dev-bg', size: 'body' },
      { foreground: '--dev-muted', background: '--dev-bg', size: 'body' },
      { foreground: '--dev-accent', background: '--dev-bg', size: 'body' },
      { foreground: '--dev-muted', background: '--dev-surface', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('developer', {
        '--dev-primary': '#0f172a',
        '--dev-teal': '#14b8a6',
        '--dev-blue': '#3b82f6',
        '--dev-purple': '#8b5cf6',
        '--dev-accent': '#0f766e',
        '--dev-gray': '#64748b',
        '--dev-border': '#e2e8f0',
        '--dev-bg': '#ffffff',
        '--dev-surface': '#f8fafc',
        '--dev-header-border': '#e2e8f0',
        '--dev-sidebar': '#0f172a',
        '--dev-text': '#0f172a',
        '--dev-muted': '#64748b',
      }),
    ],
  },
  creative: {
    swatchVariables: ['--cr-page', '--cr-sidebar'],
    textPairs: [
      { foreground: '--cr-ink', background: '--cr-page', size: 'body' },
      { foreground: '--cr-ink-muted', background: '--cr-page', size: 'body' },
      { foreground: '--cr-ink-faint', background: '--cr-page', size: 'body' },
      { foreground: '--cr-ink-muted', background: '--cr-sidebar', size: 'body' },
      { foreground: '--cr-ink-faint', background: '--cr-sidebar', size: 'body' },
      { foreground: '--cr-ink', background: '--cr-card', size: 'body' },
      { foreground: ACCENT, background: '--cr-page', size: 'large' },
    ],
    defaultContrastExceptions: [
      { foreground: '--cr-ink-faint', background: '--cr-sidebar', ratio: '4.25', reason: 'Faint meta text on the sand sidebar, below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('creative', {
        '--cr-ink': '#1a1a1a',
        '--cr-ink-muted': '#4b4b4b',
        '--cr-ink-faint': '#6b6b6b',
        '--cr-border': '#ecdfc9',
        '--cr-page': '#fdf1e2',
        '--cr-sidebar': '#f7e3c4',
        '--cr-card': '#fffcf6',
      }),
    ],
  },
  modern: {
    swatchVariables: ['--ms-navy', '--ms-rose', '--ms-bg'],
    textPairs: [
      { foreground: '--ms-navy', background: '--ms-card', size: 'body' },
      { foreground: '--ms-navy-muted', background: '--ms-card', size: 'body' },
      { foreground: '--ms-text', background: '--ms-card', size: 'body' },
      { foreground: '--ms-muted', background: '--ms-card', size: 'body' },
      { foreground: '--ms-muted', background: '--ms-bg-subtle', size: 'body' },
      { foreground: '--ms-rose', background: '--ms-card', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('modern', {
        '--ms-navy': '#0f172a',
        '--ms-navy-muted': '#334155',
        '--ms-rose': '#be123c',
        '--ms-blush': '#fb7185',
        '--ms-border': '#e2e8f0',
        '--ms-border-soft': '#f1f5f9',
        '--ms-text': '#1e293b',
        '--ms-muted': '#64748b',
        '--ms-bg': '#f7f7fa',
        '--ms-bg-subtle': '#fafafa',
        '--ms-card': '#ffffff',
      }),
    ],
  },
  executive: {
    swatchVariables: ['--ex-ink', '--ex-rail'],
    textPairs: [
      { foreground: '--ex-ink', background: '--ex-card', size: 'body' },
      { foreground: '--ex-ink-muted', background: '--ex-card', size: 'body' },
      { foreground: '--ex-ink-faint', background: '--ex-bg', size: 'body' },
      { foreground: '--ex-ink-faint', background: '--ex-rail', size: 'body' },
      { foreground: ACCENT, background: '--ex-card', size: 'body' },
      { foreground: ACCENT, background: '--ex-rail', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('executive', {
        '--ex-ink': '#1c1917',
        '--ex-ink-muted': '#44403c',
        '--ex-ink-faint': '#6b645e',
        '--ex-border': '#d6d3d1',
        '--ex-rail': '#f7f4ef',
        '--ex-bg': '#faf9f7',
        '--ex-card': '#ffffff',
      }),
    ],
  },
  timeline: {
    swatchVariables: ['--tl-text', '--tl-bg'],
    textPairs: [
      { foreground: '--tl-text', background: '--tl-bg', size: 'body' },
      { foreground: '--tl-muted', background: '--tl-bg', size: 'body' },
      { foreground: ACCENT, background: '--tl-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('timeline', {
        '--tl-text': '#1f2937',
        '--tl-muted': '#6b7280',
        '--tl-border': '#e5e7eb',
        '--tl-bg': '#fdfdfd',
      }),
    ],
  },
  graduate: {
    swatchVariables: ['--gr-ink', '--gr-bg'],
    textPairs: [
      { foreground: '--gr-ink', background: '--gr-bg', size: 'body' },
      { foreground: '--gr-ink-muted', background: '--gr-bg', size: 'body' },
      { foreground: ACCENT, background: '--gr-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('graduate', {
        '--gr-ink': '#1e293b',
        '--gr-ink-muted': '#475569',
        '--gr-border': '#e2e8f0',
        '--gr-bg': '#f7f7fa',
      }),
    ],
  },
  compact: {
    swatchVariables: ['--cp-ink', '--cp-bg'],
    textPairs: [
      { foreground: '--cp-ink', background: '--cp-card', size: 'body' },
      { foreground: '--cp-ink-muted', background: '--cp-card', size: 'body' },
      { foreground: ACCENT, background: '--cp-card', size: 'body' },
    ],
    defaultContrastExceptions: [
      { foreground: ACCENT, background: '--cp-card', ratio: '4.10', reason: 'Sky accent text on white, below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('compact', {
        '--cp-ink': '#0f172a',
        '--cp-ink-muted': '#475569',
        '--cp-border': '#cbd5e1',
        '--cp-card': '#ffffff',
        '--cp-bg': '#f7f7fa',
      }),
    ],
  },
  portfolio: {
    swatchVariables: ['--pf-slate', '--pf-sidebar-tint'],
    textPairs: [
      { foreground: '--pf-slate', background: '--pf-card', size: 'body' },
      { foreground: '--pf-text', background: '--pf-card', size: 'body' },
      { foreground: '--pf-gray', background: '--pf-card', size: 'body' },
      { foreground: '--pf-gray', background: '--pf-sidebar-tint', size: 'body' },
      { foreground: ACCENT, background: '--pf-card', size: 'body' },
    ],
    defaultContrastExceptions: [
      { foreground: '--pf-gray', background: '--pf-sidebar-tint', ratio: '4.48', reason: 'Grey meta text on the sidebar tint, below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('portfolio', {
        '--pf-slate': '#0f172a',
        '--pf-gray': '#64748b',
        '--pf-border': '#e2e8f0',
        '--pf-border-soft': '#eef1f6',
        '--pf-text': '#1e293b',
        '--pf-card': '#ffffff',
        '--pf-sidebar-tint': '#f7f8fa',
        '--pf-bg': '#f7f7fa',
      }),
    ],
  },
  techExec: {
    swatchVariables: ['--te-navy', '--te-bg'],
    textPairs: [
      { foreground: '--te-ink', background: '--te-bg', size: 'body' },
      { foreground: '--te-ink-muted', background: '--te-bg', size: 'body' },
      { foreground: '--te-ink-faint', background: '--te-bg', size: 'body' },
      { foreground: ACCENT, background: '--te-bg', size: 'body' },
      { foreground: '#ffffff', background: '--te-navy', size: 'large' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('techExec', {
        '--te-navy': '#163d7a',
        '--te-ink': '#1e293b',
        '--te-ink-muted': '#475569',
        '--te-ink-faint': '#64748b',
        '--te-border': '#e2e8f0',
        '--te-bg': '#f8fafc',
      }),
    ],
  },
  classicProfessional: {
    swatchVariables: ['--cp-text', '--cp-border', '--cp-bg'],
    textPairs: [
      { foreground: '--cp-text', background: '--cp-bg', size: 'body' },
      { foreground: '--cp-muted', background: '--cp-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('classicProfessional', {
        '--cp-text': '#111111',
        '--cp-muted': '#52525b',
        '--cp-border': '#d4d4d8',
        '--cp-bg': '#fdfdfd',
      }),
    ],
  },
  navyProfessional: {
    swatchVariables: ['--np-navy', '--np-blue', '--np-bg'],
    textPairs: [
      { foreground: '#ffffff', background: '--np-navy', size: 'body' },
      { foreground: 'rgba(255, 255, 255, 0.85)', background: '--np-navy', size: 'body' },
      { foreground: 'rgba(255, 255, 255, 0.55)', background: '--np-navy', size: 'body' },
      { foreground: 'rgba(255, 255, 255, 0.5)', background: '--np-navy', size: 'body' },
      { foreground: '--np-blue-light', background: '--np-navy', size: 'body' },
      { foreground: '--np-text', background: '--np-bg', size: 'body' },
      { foreground: '--np-muted', background: '--np-bg', size: 'body' },
      { foreground: '--np-blue', background: '--np-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('navyProfessional', {
        '--np-navy': '#16233a',
        '--np-navy-line': 'rgba(255, 255, 255, 0.14)',
        '--np-blue': '#2563eb',
        '--np-blue-light': '#93c5fd',
        '--np-text': '#1f2937',
        '--np-muted': '#6b7280',
        '--np-border': '#e5e7eb',
        '--np-bg': '#fdfdfd',
      }),
    ],
  },
  modernOrange: {
    swatchVariables: ['--mo-text', '--mo-sidebar-bg'],
    textPairs: [
      { foreground: '--mo-text', background: '--mo-bg', size: 'body' },
      { foreground: '--mo-muted', background: '--mo-bg', size: 'body' },
      { foreground: '--mo-text', background: '--mo-sidebar-bg', size: 'body' },
      { foreground: '--mo-muted', background: '--mo-sidebar-bg', size: 'body' },
      { foreground: ACCENT, background: '--mo-bg', size: 'large' },
      { foreground: '#ffffff', background: ACCENT, size: 'body' },
    ],
    defaultContrastExceptions: [
      { foreground: ACCENT, background: '--mo-bg', ratio: '2.42', reason: 'Orange accent marks/text on the page, below 3:1 since before Phase 3; variant #1 must not change.' },
      { foreground: '#ffffff', background: ACCENT, ratio: '2.46', reason: 'White title-badge text on orange, below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('modernOrange', {
        '--mo-text': '#151a22',
        '--mo-muted': '#6b7280',
        '--mo-border': '#ece1d2',
        '--mo-sidebar-bg': '#fdf6ec',
        '--mo-dot-empty': '#e6dcc9',
        '--mo-bg': '#fdfdfd',
      }),
    ],
  },
  colorfulCompact: {
    swatchVariables: ['--cc-dark', '--cc-pink', '--cc-blue', '--cc-green'],
    textPairs: [
      { foreground: '--cc-ink', background: '--cc-card', size: 'body' },
      { foreground: '--cc-muted', background: '--cc-card', size: 'body' },
      { foreground: '--cc-muted', background: '--cc-sidebar', size: 'body' },
      { foreground: '#ffffff', background: '--cc-dark', size: 'body' },
      ...['pink', 'orange', 'green', 'teal', 'blue', 'purple'].flatMap((hue) => [
        { foreground: `--cc-${hue}-text`, background: '--cc-card', size: 'body' },
        { foreground: '#ffffff', background: `--cc-${hue}-text`, size: 'body' },
      ]),
    ],
    defaultContrastExceptions: [
      { foreground: '--cc-muted', background: '--cc-sidebar', ratio: '4.39', reason: 'Grey meta text on the sidebar, below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('colorfulCompact', {
        '--cc-pink': '#ec4899',
        '--cc-pink-text': '#be185d',
        '--cc-orange': '#f97316',
        '--cc-orange-text': '#c2410c',
        '--cc-green': '#22c55e',
        '--cc-green-text': '#15803d',
        '--cc-teal': '#14b8a6',
        '--cc-teal-text': '#0f766e',
        '--cc-blue': '#3b82f6',
        '--cc-blue-text': '#1d4ed8',
        '--cc-purple': '#a855f7',
        '--cc-purple-text': '#7e22ce',
        '--cc-dark': '#16132a',
        '--cc-ink': '#18181b',
        '--cc-muted': '#6b7280',
        '--cc-sidebar': '#f2f4f8',
        '--cc-border': '#e5e7eb',
        '--cc-card': '#ffffff',
      }),
    ],
  },
  quadrant: {
    swatchVariables: ['--qd-text', '--qd-border'],
    textPairs: [
      { foreground: '--qd-text', background: '--qd-card', size: 'body' },
      { foreground: '--qd-muted', background: '--qd-card', size: 'body' },
      { foreground: '--qd-muted', background: '--qd-bg', size: 'body' },
      { foreground: ACCENT, background: '--qd-card', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('quadrant', {
        '--qd-text': '#0f172a',
        '--qd-muted': '#475569',
        '--qd-border': '#bfe0e6',
        '--qd-bg': '#f7fafa',
        '--qd-card': '#ffffff',
      }),
    ],
  },
  editorial: {
    swatchVariables: ['--ed-ink', '--ed-bg'],
    textPairs: [
      { foreground: '--ed-ink', background: '--ed-bg', size: 'body' },
      { foreground: '--ed-muted', background: '--ed-bg', size: 'body' },
      { foreground: '--ed-faint', background: '--ed-bg', size: 'body' },
      { foreground: ACCENT, background: '--ed-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('editorial', {
        '--ed-ink': '#1a1a1a',
        '--ed-muted': '#52525b',
        '--ed-faint': '#71717a',
        '--ed-border': '#e4e4e7',
        '--ed-bg': '#fdfdfd',
      }),
    ],
  },
  portrait: {
    swatchVariables: ['--pt-ink', '--pt-bg'],
    textPairs: [
      { foreground: '--pt-ink', background: '--pt-bg', size: 'body' },
      { foreground: '--pt-muted', background: '--pt-bg', size: 'body' },
      { foreground: '--pt-faint', background: '--pt-bg', size: 'body' },
      { foreground: ACCENT, background: '--pt-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('portrait', {
        '--pt-ink': '#1a1a1a',
        '--pt-muted': '#52525b',
        '--pt-faint': '#71717a',
        '--pt-border': '#e4e4e7',
        '--pt-bg': '#fdfdfd',
      }),
    ],
  },
  european: {
    swatchVariables: ['--eu-ink', '--eu-bg'],
    textPairs: [
      { foreground: '--eu-ink', background: '--eu-bg', size: 'body' },
      { foreground: '--eu-muted', background: '--eu-bg', size: 'body' },
      { foreground: '--eu-faint', background: '--eu-bg', size: 'body' },
      { foreground: ACCENT, background: '--eu-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('european', {
        '--eu-ink': '#1a1a1a',
        '--eu-muted': '#52525b',
        '--eu-faint': '#71717a',
        '--eu-border': '#e4e4e7',
        '--eu-bg': '#fdfdfd',
      }),
    ],
  },
}

export function getTemplateVariants(templateId) {
  return TEMPLATE_VARIANTS[templateId]?.variants ?? []
}

// Falls back to variant #1 for an unknown id, so a CV from a newer
// version (or a typo in a hand-edited file) still renders.
export function getTemplateVariant(templateId, variantId) {
  const variants = getTemplateVariants(templateId)
  if (variants.length === 0) {
    return null
  }
  return variants.find((variant) => variant.id === variantId) ?? variants[0]
}

export function resolveStyleVariantId(formData, templateId) {
  const stored = formData?.styleVariantByTemplate?.[templateId]
  return getTemplateVariant(templateId, stored)?.id ?? DEFAULT_STYLE_VARIANT_ID
}

export function getPaletteVariables(templateId) {
  return Object.keys(getTemplateVariants(templateId)[0]?.palette ?? {})
}

export function getVariantPaletteStyle(templateId, variantId) {
  return { ...(getTemplateVariant(templateId, variantId)?.palette ?? {}) }
}

export function getVariantSwatches(templateId, variant) {
  const swatchVariables = TEMPLATE_VARIANTS[templateId]?.swatchVariables ?? []
  return [variant?.accent, ...swatchVariables.map((name) => variant?.palette[name])]
    .filter(Boolean)
    .slice(0, 4)
}

// True when the tab-only accent, font or headings colour has been tweaked
// away from the active variant's values — drives the Style picker's
// "Modified" marker.
export function isStyleVariantModified({ templateId, variantId, templateAccentColors, cvFontId, cvHeadingColor }) {
  const variant = getTemplateVariant(templateId, variantId)
  if (!variant) {
    return false
  }
  const accent = resolveTemplateAccent(templateAccentColors, templateId)
  if (variant.accent && String(accent).toLowerCase() !== variant.accent.toLowerCase()) {
    return true
  }
  return cvFontId !== variant.fontId
    || String(cvHeadingColor || '').toLowerCase() !== variant.headingColor.toLowerCase()
}
```

- [ ] **Step 4: Run the check and read every failure**

Run: `npm run check:template-variants`

Each failure falls into one of these cases:
- **A palette value mismatch** (`registry has …`): the CSS is the truth. Copy the CSS value into the registry exactly, spaces included.
- **A contrast failure on `default` that isn't listed:** first confirm the pair is real. Grep the stylesheet for `color: var(<foreground>)` and check that the element sits on `<background>`. If the pair isn't real, remove it from `textPairs`. If it is real, add a `defaultContrastExceptions` entry with the printed ratio and a one-line reason.
- **A listed exception that now passes or doesn't match:** delete it, or fix the recorded ratio to the printed one.
- **A `textPairs` entry that doesn't match the CSS:** confirm each pair the same way. The pairs above came from reading variable names, not from tracing every rule, so expect a few corrections.

Every exception in the final list is reported to the user at the end of this task.

Expected end state: `All template-variant checks passed.`

- [ ] **Step 5: Lint and the other checks**

Run: `npm run lint && npm run check:reducers && npm run check:share && npm run check:template-pages`
Expected: all pass. Nothing imports the registry yet, so the app is unchanged.

- [ ] **Step 6: Commit, then bump**

```bash
git add src/utils/templateVariants.js scripts/check-template-variants.mjs package.json .github/workflows/ci.yml
git commit -m "Add the template style-variant registry and check:template-variants"
npm version 1.5.5 --no-git-tag-version
git commit -am "Bump version to 1.5.5"
```

Check that `git status --short` lists only `?? e2e/variant-baseline.spec.js`.

---

### Task 3: CV-data field, import validation, `SET_STYLE_VARIANT` and share key `va` (version 1.5.6)

**Files:**
- Modify: `src/utils/cvForm.js` (`createInitialCvData`, `demoCvData`, `parseImportedCvData`)
- Modify: `src/types/cv.d.ts` (`CvData`)
- Modify: `src/reducers/cvFormReducer.js` (`FORM_ACTION`, new case)
- Modify: `src/utils/shareLinks.js` (compress and `expandCurrentPayload`)
- Test: `scripts/check-reducers.mjs`, `scripts/check-share-links.mjs`

**Interfaces:**
- Consumes: `DEFAULT_STYLE_VARIANT_ID` from `src/utils/templateVariants.js`.
- Produces: `formData.styleVariantByTemplate: Record<string, string>` (default `{}`), `FORM_ACTION.SET_STYLE_VARIANT` with `{ templateId: string, variantId: string }`, and share root key `va`.

- [ ] **Step 1: Write the failing checks**

Append to `scripts/check-reducers.mjs`, inside the `cvFormReducer` part (after the `TOGGLE_PHOTO_VISIBILITY` block, before the `uiReducer` header):

```js
{
  const state = createInitialCvData()
  check('a new CV stores no style variants', JSON.stringify(state.styleVariantByTemplate) === '{}')

  const picked = cvFormReducer(state, { type: FORM_ACTION.SET_STYLE_VARIANT, templateId: 'developer', variantId: 'graphite' })
  check('SET_STYLE_VARIANT stores the variant for the named template', picked.styleVariantByTemplate.developer === 'graphite')
  check('SET_STYLE_VARIANT does not mutate the previous state', JSON.stringify(state.styleVariantByTemplate) === '{}')

  const both = cvFormReducer(picked, { type: FORM_ACTION.SET_STYLE_VARIANT, templateId: 'creative', variantId: 'sage' })
  check('SET_STYLE_VARIANT leaves other templates untouched',
    both.styleVariantByTemplate.developer === 'graphite' && both.styleVariantByTemplate.creative === 'sage')

  const backToDefault = cvFormReducer(both, { type: FORM_ACTION.SET_STYLE_VARIANT, templateId: 'developer', variantId: 'default' })
  check('choosing variant #1 deletes the entry',
    !('developer' in backToDefault.styleVariantByTemplate) && backToDefault.styleVariantByTemplate.creative === 'sage')

  check('re-picking the stored variant returns the same state',
    cvFormReducer(both, { type: FORM_ACTION.SET_STYLE_VARIANT, templateId: 'creative', variantId: 'sage' }) === both)
  check('picking variant #1 with nothing stored returns the same state',
    cvFormReducer(state, { type: FORM_ACTION.SET_STYLE_VARIANT, templateId: 'developer', variantId: 'default' }) === state)
  check('SET_STYLE_VARIANT ignores a missing template id',
    cvFormReducer(state, { type: FORM_ACTION.SET_STYLE_VARIANT, variantId: 'sage' }) === state)
}
```

Append to `scripts/check-share-links.mjs`, after the `sectionColumnsByTemplate` checks:

```js
// styleVariantByTemplate travels under its own short key ('va').
const rawPayload = (encoded) => JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
const withVariants = parseImportedCvData({
  ...structuredClone(demoCvData),
  styleVariantByTemplate: { developer: 'graphite', creative: 'sage' },
})
const variantsEncoded = share.encodeCvStateForUrl(withVariants)
check('styleVariantByTemplate survives the round trip',
  JSON.stringify(share.decodeCvStateFromUrl(variantsEncoded).styleVariantByTemplate)
    === JSON.stringify(withVariants.styleVariantByTemplate))
check('styleVariantByTemplate travels as va',
  JSON.stringify(rawPayload(variantsEncoded).d.va) === JSON.stringify({ developer: 'graphite', creative: 'sage' }))
check('a CV with no stored variants encodes no va key', !('va' in rawPayload(demoEncoded).d))
check('a stray variant #1 entry is not encoded',
  !('va' in rawPayload(share.encodeCvStateForUrl({ ...demo, styleVariantByTemplate: { developer: 'default' } })).d))
check('an unknown variant id still decodes (rendered as variant #1 later)',
  share.decodeCvStateFromUrl(share.encodeCvStateForUrl({ ...demo, styleVariantByTemplate: { developer: 'fromTheFuture' } }))
    .styleVariantByTemplate.developer === 'fromTheFuture')
```

Also append to `scripts/check-share-links.mjs` (it already imports `parseImportedCvData` and `demoCvData`):

```js
for (const [label, value] of [
  ['an array', []],
  ['a string', 'developer'],
  ['a non-string value', { developer: 3 }],
]) {
  let threw = false
  try {
    parseImportedCvData({ ...structuredClone(demoCvData), styleVariantByTemplate: value })
  } catch {
    threw = true
  }
  check(`import rejects styleVariantByTemplate as ${label}`, threw)
}
const { styleVariantByTemplate: _omitVariants, ...legacyCv } = structuredClone(demoCvData)
check('a file from before Phase 3 imports with no stored variants',
  JSON.stringify(parseImportedCvData(legacyCv).styleVariantByTemplate) === '{}')
```

Run: `npm run check:reducers; npm run check:share`
Expected: FAIL. `SET_STYLE_VARIANT` is undefined and there's no `va`.

- [ ] **Step 2: Add the field to the CV shape**

In `src/utils/cvForm.js`, add `styleVariantByTemplate: {},` right after `sectionColumnsByTemplate: {},` in **both** `createInitialCvData` and `demoCvData`.

In `parseImportedCvData`:
1. Next to `const sectionColumnsByTemplate = value.sectionColumnsByTemplate ?? {}`, add `const styleVariantByTemplate = value.styleVariantByTemplate ?? {}`.
2. Add `'styleVariantByTemplate',` to the `validateAllowedKeys` list, after `'sectionColumnsByTemplate',`.
3. After the `sectionColumnsByTemplate` validation loop, add:

```js
  // Shape only. An unknown template or variant id is kept as data and
  // renders as variant #1 (templateVariants.js's getTemplateVariant), so a
  // CV from a newer version still imports.
  if (!isPlainObject(styleVariantByTemplate)) {
    throw new Error('styleVariantByTemplate must be an object.')
  }

  Object.entries(styleVariantByTemplate).forEach(([templateId, variantId]) => {
    if (typeof variantId !== 'string') {
      throw new Error(`styleVariantByTemplate.${templateId} must be a string.`)
    }
  })
```

4. In the returned object, after `sectionColumnsByTemplate: …,`, add `styleVariantByTemplate: { ...styleVariantByTemplate },`.

In `src/types/cv.d.ts`, after the `sectionColumnsByTemplate` line, add:

```ts
  /** Per template id, the chosen style variant (templateVariants.js). Variant #1 ('default') is never stored. */
  styleVariantByTemplate: Record<string, string>
```

- [ ] **Step 3: Add the reducer action**

In `src/reducers/cvFormReducer.js`, add `SET_STYLE_VARIANT: 'SET_STYLE_VARIANT',` to `FORM_ACTION` after `TOGGLE_PHOTO_VISIBILITY`. Import `DEFAULT_STYLE_VARIANT_ID` from `'../utils/templateVariants'`. Then add this case after the `TOGGLE_PHOTO_VISIBILITY` case:

```js
    case FORM_ACTION.SET_STYLE_VARIANT: {
      if (typeof action.templateId !== 'string' || !action.templateId
        || typeof action.variantId !== 'string' || !action.variantId) {
        return state
      }

      const current = state.styleVariantByTemplate ?? {}
      const isDefault = action.variantId === DEFAULT_STYLE_VARIANT_ID

      if (isDefault ? !(action.templateId in current) : current[action.templateId] === action.variantId) {
        return state
      }

      // Variant #1 is never stored, so existing CVs and links are unchanged.
      const others = Object.fromEntries(
        Object.entries(current).filter(([templateId]) => templateId !== action.templateId),
      )

      return {
        ...state,
        styleVariantByTemplate: isDefault ? others : { ...others, [action.templateId]: action.variantId },
      }
    }
```

- [ ] **Step 4: Add share key `va`**

In `src/utils/shareLinks.js`'s compress function, after the `sectionColumnsByTemplate` block (the one that sets `data.sc`), add:

```js
  // 'va' — permanent once shipped, like every other key here.
  if (isPlainObject(formData.styleVariantByTemplate)) {
    const chosen = Object.fromEntries(
      Object.entries(formData.styleVariantByTemplate).filter(
        ([, variantId]) => typeof variantId === 'string' && variantId && variantId !== 'default',
      ),
    )

    if (Object.keys(chosen).length > 0) {
      data.va = chosen
    }
  }
```

In `expandCurrentPayload`, after the `data.sc` block, add:

```js
  if (data.va !== undefined) {
    formData.styleVariantByTemplate = data.va
  }
```

Leave `expandLegacyV2Payload` alone. V2 links predate variants.

- [ ] **Step 5: Run the checks**

Run: `npm run check:reducers && npm run check:share && npm run check:section-columns && npm run check:docx-export && npm run check:template-pages && npm run check:template-variants && npm run lint`
Expected: all pass. If lint flags the `_omitVariants` destructure, rename it to match the existing `_omit` convention in `check-section-columns.mjs`. That file already passes lint.

- [ ] **Step 6: e2e smoke**

Run: `CI=1 npm run test:e2e:fast`
Expected: all pass. JSON export now writes `"styleVariantByTemplate": {}`, which is harmless and shows up in no test.

- [ ] **Step 7: Commit, then bump**

```bash
git add src/utils/cvForm.js src/types/cv.d.ts src/reducers/cvFormReducer.js src/utils/shareLinks.js scripts/check-reducers.mjs scripts/check-share-links.mjs
git commit -m "Store the chosen style variant per template in the CV and share links"
npm version 1.5.6 --no-git-tag-version
git commit -am "Bump version to 1.5.6"
```

---

### Task 4: Palette plumbing: active variant → inline CSS variables (version 1.5.7)

**Files:**
- Modify: `src/components/CVPreview.jsx`
- Modify: all 17 `src/components/templates/*Showcase.jsx`
- Modify: `src/components/DirectEditPreview.jsx`, `src/pages/ResumeBuilderPage.jsx`

**Interfaces:**
- Consumes: `getVariantPaletteStyle(templateId, variantId)` and `resolveStyleVariantId(formData, templateId)` (Task 2).
- Produces:
  - `CVPreview` gains the prop `styleVariantId = 'default'`.
  - Every Showcase gains the prop `paletteStyle = {}` (an object of CSS variables) and spreads it first into the `style` of its root element (the one with `ref={previewRef}`).
  - `DirectEditPreview` gains the prop `styleVariantId`.
  - Only the builder passes a non-default id. Gallery thumbnails, template pages and the landing page keep variant #1 (spec non-goal).

- [ ] **Step 1: CVPreview resolves the palette once, before any early return**

In `CVPreview.jsx`, add the prop to the destructured props after `headingColor = null,`:

```js
  // The active style variant's id (templateVariants.js) — only the builder
  // passes one; every other caller (gallery thumbnails, template pages,
  // landing) renders variant #1, which equals the stylesheet defaults.
  styleVariantId = 'default',
```

Import `getVariantPaletteStyle` from `'../utils/templateVariants'`. Right after `const isCompact = t.isCompact === true`, which comes before the first `if (variant === …) return`, so the Rules of Hooks hold, add:

```js
  // The variant's palette, set as inline CSS variables on the Showcase
  // root (Minimalist: the flat renderer's article, normal view only).
  const paletteStyle = useMemo(
    () => getVariantPaletteStyle(variant, styleVariantId),
    [variant, styleVariantId],
  )
```

Then pass `paletteStyle={paletteStyle}` to every one of the 17 `<…Showcase` elements in the delegation blocks.

For the flat renderer's `<article ref={previewRef} data-export-root="true" …>`, add:

```jsx
      style={variant === 'minimal' && !atsFriendlyMode ? paletteStyle : undefined}
```

Minimalist's palette is `{}` until Task 7, so this changes nothing yet. Another template's ATS view (the flat renderer) never gets a palette.

- [ ] **Step 2: Each Showcase spreads the palette onto its root**

In each `*Showcase.jsx`, add `paletteStyle = {},` to the destructured props, then find the element with `ref={previewRef}`:

- **Root already has a style object** (Creative, Compact, Graduate, European, Editorial, Modern Orange, Tech Exec, Executive, Timeline, Portrait, Portfolio, Quadrant): put `...paletteStyle,` as the **first** entry, so `--tpl-accent` and the others still win if a name ever overlaps.
- **Root has `style={headingColor ? { '--cv-heading-color': headingColor } : undefined}`** (Classic Professional, Modern, Navy Professional): replace it with:

  ```jsx
        style={{ ...paletteStyle, ...(headingColor ? { '--cv-heading-color': headingColor } : null) }}
  ```

- **Root has no style** (Developer, Colorful Compact): add `style={paletteStyle}`.

Creative only: its kicker is the accent darkened toward the ink. Make it follow the variant's ink. Change

```js
        '--cr-kicker': accentInkMix(accentColor, '#1a1a1a', 0.25, CREATIVE_DEFAULT_ACCENT_COLOR),
```

to

```js
        '--cr-kicker': accentInkMix(accentColor, paletteStyle['--cr-ink'] ?? '#1a1a1a', 0.25, CREATIVE_DEFAULT_ACCENT_COLOR),
```

and update the comment above it: "darkened 25% toward the variant's `--cr-ink`". Variant #1's ink is `#1a1a1a`, so the output is identical.

Run `grep -L "paletteStyle" src/components/templates/*Showcase.jsx`. Expected: no output (all 17 files mention it).

- [ ] **Step 3: The builder passes the active variant to all three render sites**

In `ResumeBuilderPage.jsx`, import `resolveStyleVariantId` from `'../utils/templateVariants'`. Near the other derived values (after `const ui = getUiTheme()`), add:

```js
  // The style variant in effect for the current template (variant #1
  // unless the CV stores another). Passed to the visible preview AND the
  // off-screen export source, so the PDF matches the screen.
  const styleVariantId = resolveStyleVariantId(formData, selectedTemplate)
```

Add `styleVariantId={styleVariantId}` to:
1. Classic's visible `<CVPreview previewRef={visiblePreviewRef} …>`. Also add `styleVariantId` to that `useMemo`'s dependency list.
2. Classic's off-screen export source `<CVPreview formData={hideEmptySections(formData)} previewRef={previewRef} …>`.
3. `<DirectEditPreview …>`.

In `DirectEditPreview.jsx`, add `styleVariantId` to the props and to `previewProps`, after `headingColor,`. Both the visible preview and the export copy spread `previewProps`, so both receive it.

- [ ] **Step 4: Verify nothing changed**

Run: `npm run lint`

Then the baseline compare (Task 1's command, `VARIANT_SHOTS_MODE=compare`).
Expected: 170 passed.

If a shot differs, open `<name>.actual.png` next to the baseline. Inline values equal the CSS defaults, so a difference means a palette value mismatch (rerun `npm run check:template-variants`), a root that got `style` on the wrong element, or Creative's kicker.

- [ ] **Step 5: Regression run**

Run: `CI=1 npm run test:e2e:fast`
Expected: all pass.

- [ ] **Step 6: Commit, then bump**

```bash
git add src/components/CVPreview.jsx src/components/templates/*Showcase.jsx src/components/DirectEditPreview.jsx src/pages/ResumeBuilderPage.jsx
git commit -m "Apply the active style variant's palette as inline variables on each template"
npm version 1.5.7 --no-git-tag-version
git commit -am "Bump version to 1.5.7"
```

---

### Task 5: Applying a variant's look: accent, font and headings colour (version 1.5.8)

**Files:**
- Modify: `src/reducers/uiReducer.js`
- Modify: `src/pages/ResumeBuilderPage.jsx`
- Test: `scripts/check-reducers.mjs`

**Interfaces:**
- Consumes: `getTemplateVariant`, `resolveStyleVariantId` (Task 2), `FORM_ACTION.SET_STYLE_VARIANT` (Task 3).
- Produces:
  - `UI_ACTION.APPLY_STYLE_VARIANT_LOOK` with `{ templateId: string, variant: Variant | null }`. It sets `templateAccentColors[templateId] = variant.accent` (only when non-null), `cvFontId = variant.fontId` and `cvHeadingColor = variant.headingColor`. A `null` variant is a no-op.
  - `createInitialUiState(initialSession)` applies the look of `initialSession.formData`'s stored variant for the initial template. That covers share links and session restore.
  - `ResumeBuilderPage` gains `handleSelectStyleVariant(variantId)`, used by Task 6.

- [ ] **Step 1: Write the failing checks**

Append to `scripts/check-reducers.mjs`'s `uiReducer` part:

```js
{
  const state = createInitialUiState({})
  const look = { id: 'sage', accent: '#1f7a6c', fontId: 'lato', headingColor: '#166534', palette: {}, label: { en: 'Sage', fi: 'Salvia' } }
  const next = uiReducer(state, { type: UI_ACTION.APPLY_STYLE_VARIANT_LOOK, templateId: 'creative', variant: look })
  check('APPLY_STYLE_VARIANT_LOOK sets the template accent', next.templateAccentColors.creative === '#1f7a6c')
  check('APPLY_STYLE_VARIANT_LOOK leaves other accents alone', next.templateAccentColors.timeline === state.templateAccentColors.timeline)
  check('APPLY_STYLE_VARIANT_LOOK sets the font and headings colour', next.cvFontId === 'lato' && next.cvHeadingColor === '#166534')

  const accentless = uiReducer(state, {
    type: UI_ACTION.APPLY_STYLE_VARIANT_LOOK, templateId: 'developer', variant: { ...look, accent: null },
  })
  check('an accent-less variant adds no accent entry', !('developer' in accentless.templateAccentColors))
  check('APPLY_STYLE_VARIANT_LOOK with no variant is a no-op',
    uiReducer(state, { type: UI_ACTION.APPLY_STYLE_VARIANT_LOOK, templateId: 'creative', variant: null }) === state)

  const fresh = createInitialUiState({ formData: createInitialCvData() })
  check('a session without stored variants starts on Inter with no headings colour',
    fresh.cvFontId === 'inter' && fresh.cvHeadingColor === '')
  check('an unknown stored variant starts on variant #1',
    createInitialUiState({ formData: { ...createInitialCvData(), styleVariantByTemplate: { minimal: 'fromTheFuture' } } }).cvFontId === 'inter')
}
```

Run: `npm run check:reducers`
Expected: FAIL, because `APPLY_STYLE_VARIANT_LOOK` is undefined. Once Part 2 has a real non-default Minimalist variant, Task 11 adds a check that a stored one changes the initial font.

- [ ] **Step 2: Implement the action and the initial look**

In `src/reducers/uiReducer.js`, import `getTemplateVariant, resolveStyleVariantId` from `'../utils/templateVariants'`. Add `APPLY_STYLE_VARIANT_LOOK: 'APPLY_STYLE_VARIANT_LOOK',` to `UI_ACTION`.

Add the pure helper above `createInitialUiState`:

```js
// A style variant's look: its accent (for a template that has one), font
// and headings colour. Applied when a variant is picked and when a CV
// carrying a stored variant is loaded; the user's later tweaks stay
// tab-only, as before variants existed.
function applyStyleVariantLook(state, templateId, variant) {
  if (!variant) {
    return state
  }

  return {
    ...state,
    templateAccentColors: variant.accent
      ? { ...state.templateAccentColors, [templateId]: variant.accent }
      : state.templateAccentColors,
    cvFontId: variant.fontId,
    cvHeadingColor: variant.headingColor,
  }
}
```

In `createInitialUiState`, assign the object it returns today to `const state = { … }`, then end with:

```js
  // A share link or restored session opens in its stored variant's look.
  return applyStyleVariantLook(
    state,
    state.selectedTemplate,
    getTemplateVariant(state.selectedTemplate, resolveStyleVariantId(initialSession?.formData, state.selectedTemplate)),
  )
```

Add the case to `uiReducer`:

```js
    case UI_ACTION.APPLY_STYLE_VARIANT_LOOK:
      return applyStyleVariantLook(state, action.templateId, action.variant)
```

Variant #1's values equal today's defaults (Inter, `''`, the registry accent), so a fresh session is unchanged.

- [ ] **Step 3: The builder's pick, load and undo paths**

In `ResumeBuilderPage.jsx`, import `getTemplateVariant` next to `resolveStyleVariantId`. Add, near `handleCvFontChange`:

```js
  // Applies the look of the variant `nextFormData` stores for `templateId`.
  // Called wherever a whole CV arrives (JSON import, ?example=) — share
  // links and session restore get it from createInitialUiState instead.
  const applyStoredStyleVariantLook = useCallback((nextFormData, templateId) => {
    dispatchUi({
      type: UI_ACTION.APPLY_STYLE_VARIANT_LOOK,
      templateId,
      variant: getTemplateVariant(templateId, resolveStyleVariantId(nextFormData, templateId)),
    })
  }, [])

  // Picking a variant — even the active one again — stores it and resets
  // the accent, font and headings colour to its values.
  const handleSelectStyleVariant = useCallback((variantId) => {
    dispatchFormData({ type: FORM_ACTION.SET_STYLE_VARIANT, templateId: selectedTemplate, variantId })
    dispatchUi({
      type: UI_ACTION.APPLY_STYLE_VARIANT_LOOK,
      templateId: selectedTemplate,
      variant: getTemplateVariant(selectedTemplate, variantId),
    })
  }, [dispatchFormData, selectedTemplate])
```

`dispatchFormData` comes from a `useReducer` or wrapper defined earlier in the file. If it's a stable `useReducer` dispatch, keep it in the dependency list anyway, as `handleUndo` does.

Wire the load paths:
1. **JSON import** (`handleImportFile`): right after `dispatchFormData({ type: FORM_ACTION.SET_FORM_DATA, formData: importedData })`, add `applyStoredStyleVariantLook(importedData, selectedTemplate)`. Add both to that callback's dependencies.
2. **`?example=`** (the mount-only effect): right after its `dispatchFormData({ … formData: exampleCv })`, add `applyStoredStyleVariantLook(exampleCv, selectedTemplate)`. The effect is mount-only and already disables `exhaustive-deps`. `selectedTemplate` there is the initial template, which is the intended one.
3. **Undo/redo:** in both `handleUndo` and `handleRedo`, compute the target before dispatching (`previousFormData` and `nextFormData` respectively), then after the `SET_FORM_DATA` dispatch add:

   ```js
    // Undoing a variant pick also restores that variant's look, so the
    // font/accent don't linger from the undone pick.
    if (resolveStyleVariantId(target, selectedTemplate) !== resolveStyleVariantId(formData, selectedTemplate)) {
      applyStoredStyleVariantLook(target, selectedTemplate)
    }
   ```

   Here `target` is `previousFormData` in undo and `nextFormData` in redo, and `formData` is the state before the step. Add `selectedTemplate` and `applyStoredStyleVariantLook` to both callbacks' dependencies.

"Load demo CV" and "Clear CV" stay as they are. See Interpretation 6.

- [ ] **Step 4: Run the checks and the regression suite**

Run: `npm run check:reducers && npm run check:template-variants && npm run lint`
Expected: pass.

Run the baseline compare.
Expected: 170 passed.

Run: `CI=1 npm run test:e2e:fast`
Expected: all pass.

- [ ] **Step 5: Commit, then bump**

```bash
git add src/reducers/uiReducer.js src/pages/ResumeBuilderPage.jsx scripts/check-reducers.mjs
git commit -m "Apply a style variant's accent, font and headings colour on pick and on load"
npm version 1.5.8 --no-git-tag-version
git commit -am "Bump version to 1.5.8"
```

---

### Task 6: The Style toolbar picker (version 1.5.9)

**Files:**
- Create: `src/components/CvStyleSwitcher.jsx`
- Modify: `src/components/Toolbar.jsx`, `src/App.jsx`, `src/pages/ResumeBuilderPage.jsx` (`onHeaderChange` payload), `src/styles/app-shell.css`
- Test: `e2e/style-variants.spec.js` (new)

**Interfaces:**
- Consumes: `getTemplateVariants`, `getVariantSwatches`, `isStyleVariantModified`, `resolveStyleVariantId` (Task 2); `handleSelectStyleVariant` (Task 5).
- Produces:
  - `<CvStyleSwitcher variants variantId isModified onSelectVariant locale />`, where `variants` is `Array<Variant & { swatches: string[] }>`.
  - New `Toolbar` props: `styleVariants`, `styleVariantId`, `isStyleVariantModified`, `onSelectStyleVariant`.
  - Accessible names, which e2e and screen readers rely on:
    - trigger: `Select style: <name>`, or `Select style: <name>, Modified` (fi: `Valitse tyyli: <nimi>` / `…, Muokattu`)
    - panel: radiogroup `Select style` (fi `Valitse tyyli`)
    - options: radios named by their label, with the font as a description

- [ ] **Step 1: Write the failing e2e spec**

Create `e2e/style-variants.spec.js`:

```js
import { test, expect } from './fixtures/base.js'
import { getTemplateVariants } from '../src/utils/templateVariants.js'

// The Style picker (Phase 3) in both builder modes. Part 2 adds the
// persistence tests once real variants exist (Task 11).
const styleTrigger = (page) => page.getByRole('banner').getByRole('button', { name: /^Select style:/ })
const fontTrigger = (page) => page.getByRole('banner').getByRole('button', { name: /^Select font:/ })
const styleGroup = (page) => page.getByRole('radiogroup', { name: 'Select style' })

for (const mode of ['classic', 'direct']) {
  test.describe(`Style picker (${mode})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/cv?template=developer')
      if (mode === 'direct') await page.getByRole('tab', { name: 'Direct Edit' }).click()
    })

    test('lists the template\'s looks with the current one checked', async ({ page }) => {
      await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original')
      await styleTrigger(page).click()
      await expect(styleGroup(page).getByRole('radio')).toHaveCount(getTemplateVariants('developer').length)
      await expect(styleGroup(page).getByRole('radio', { name: 'Original' })).toHaveAttribute('aria-checked', 'true')
      await page.keyboard.press('Escape')
      await expect(styleGroup(page)).toBeHidden()
      await expect(styleTrigger(page)).toBeFocused()
    })

    test('works from the keyboard', async ({ page }) => {
      await styleTrigger(page).focus()
      await page.keyboard.press('Enter')
      const checked = styleGroup(page).getByRole('radio', { checked: true })
      await expect(checked).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowUp')
      await expect(checked).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(styleGroup(page)).toBeHidden()
      await expect(styleTrigger(page)).toBeFocused()
    })

    test('a font tweak shows Modified; picking the look again resets it', async ({ page }) => {
      await fontTrigger(page).click()
      await page.getByRole('option', { name: 'Georgia' }).click()
      await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original, Modified')
      await styleTrigger(page).click()
      await styleGroup(page).getByRole('radio', { name: 'Original' }).click()
      await expect(fontTrigger(page)).toHaveAccessibleName('Select font: Inter')
      await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original')
    })
  })
}

test('the picker follows the selected template', async ({ page }) => {
  await page.goto('/cv?template=creative')
  await styleTrigger(page).click()
  await expect(styleGroup(page).getByRole('radio')).toHaveCount(getTemplateVariants('creative').length)
})

test('Finnish labels', async ({ page }) => {
  await page.goto('/cv?template=developer')
  await page.getByRole('button', { name: 'Switch language' }).click()
  await expect(page.getByRole('banner').getByRole('button', { name: /^Valitse tyyli:/ }))
    .toHaveAccessibleName('Valitse tyyli: Alkuperäinen')
})
```

If `npx playwright test e2e/style-variants.spec.js` fails to *load* the module (an extensionless import inside `templateVariants.js`'s chain), fix that import to carry `.js`. Don't drop the import from the spec.

Run: `npx playwright test e2e/style-variants.spec.js`
Expected: FAIL, because there's no `Select style` button.

- [ ] **Step 2: Write the component**

Create `src/components/CvStyleSwitcher.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

import { CV_FONT_OPTIONS } from '../utils/cvFonts'
import { useAnchoredPanelPosition } from '../hooks/useAnchoredPanelPosition'

// Toolbar's style-variant picker (Phase 3), right after Template — the
// same popover pattern as CvFontSwitcher.jsx, but a radio group: one row
// per curated look of the current template, each with its colour chips and
// font. Arrow keys move focus, Enter/Space picks, Escape closes. Picking
// (even the checked row) also resets the accent/font/headings tweaks —
// see ResumeBuilderPage's handleSelectStyleVariant.
function CvStyleSwitcher({
  variants = [],
  variantId = 'default',
  isModified = false,
  onSelectVariant = () => {},
  locale = 'en',
}) {
  const isFinnish = locale === 'fi'
  const lang = isFinnish ? 'fi' : 'en'
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const panelRef = useRef(null)
  const triggerRef = useRef(null)
  const activeVariant = variants.find((variant) => variant.id === variantId) ?? variants[0]
  const { style: panelPosition, ready: panelReady } = useAnchoredPanelPosition(isOpen, triggerRef, panelRef)
  const modifiedText = isFinnish ? 'Muokattu' : 'Modified'
  const groupLabel = isFinnish ? 'Valitse tyyli' : 'Select style'
  const triggerLabel = `${groupLabel}: ${activeVariant?.label[lang] ?? ''}${isModified ? `, ${modifiedText}` : ''}`

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Focus moves into the group once it's positioned (it renders hidden
  // until then, and a hidden element can't take focus).
  useEffect(() => {
    if (isOpen && panelReady) {
      panelRef.current?.querySelector('[aria-checked="true"]')?.focus()
    }
  }, [isOpen, panelReady])

  function handleBlur(event) {
    if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
      setIsOpen(false)
    }
  }

  function handlePanelKeyDown(event) {
    const radios = Array.from(panelRef.current?.querySelectorAll('[role="radio"]') ?? [])
    if (radios.length === 0) {
      return
    }
    const index = radios.indexOf(document.activeElement)
    const steps = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }
    let target = null
    if (event.key in steps) {
      target = radios[(index + steps[event.key] + radios.length) % radios.length]
    } else if (event.key === 'Home') {
      target = radios[0]
    } else if (event.key === 'End') {
      target = radios[radios.length - 1]
    }
    if (target) {
      event.preventDefault()
      target.focus()
    }
  }

  function handleSelect(nextVariantId) {
    onSelectVariant(nextVariantId)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="cv-style-switcher" ref={containerRef} onBlur={handleBlur}>
      <button
        type="button"
        ref={triggerRef}
        className="cv-style-switcher__trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={triggerLabel}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="cv-style-switcher__strip" aria-hidden="true">
          {(activeVariant?.swatches ?? []).map((color, index) => (
            <span key={index} className="cv-style-switcher__chip" style={{ background: color }} />
          ))}
        </span>
        <span className="cv-style-switcher__trigger-label" aria-hidden="true">
          {activeVariant?.label[lang]}
        </span>
        {isModified ? (
          <span className="cv-style-switcher__modified" aria-hidden="true">{modifiedText}</span>
        ) : null}
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="cv-style-switcher__panel"
          role="radiogroup"
          aria-label={groupLabel}
          ref={panelRef}
          onKeyDown={handlePanelKeyDown}
          style={{ ...panelPosition, visibility: panelReady ? 'visible' : 'hidden' }}
        >
          {variants.map((variant) => {
            const isActive = variant.id === activeVariant?.id
            const font = CV_FONT_OPTIONS.find((option) => option.id === variant.fontId)

            return (
              <button
                key={variant.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={variant.label[lang]}
                aria-description={font?.label}
                tabIndex={isActive ? 0 : -1}
                className={`cv-style-switcher__option${isActive ? ' cv-style-switcher__option--active' : ''}`}
                onClick={() => handleSelect(variant.id)}
              >
                <span className="cv-style-switcher__option-text">
                  <span className="cv-style-switcher__option-label">{variant.label[lang]}</span>
                  <span className="cv-style-switcher__option-font" style={{ fontFamily: font?.stack }}>
                    {font?.label}
                  </span>
                </span>
                <span className="cv-style-switcher__strip" aria-hidden="true">
                  {variant.swatches.map((color, index) => (
                    <span key={index} className="cv-style-switcher__chip" style={{ background: color }} />
                  ))}
                </span>
                {isActive ? <Check size={15} strokeWidth={2.5} aria-hidden="true" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default CvStyleSwitcher
```

- [ ] **Step 3: Styles**

In `src/styles/app-shell.css`, after the `.cv-font-switcher` rules, add the following. It reuses the same tokens so it matches the Font trigger.

```css
/* ── Style-variant picker (CvStyleSwitcher.jsx) — same trigger/panel
   language as .cv-font-switcher above. Below 640px the trigger keeps
   only the colour strip; its aria-label still carries the name. ── */
.cv-style-switcher {
  position: relative;
}

.cv-style-switcher__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 2.15rem;
  max-width: 14rem;
  padding: 0 0.6rem;
  border: 1px solid var(--app-border);
  border-radius: var(--radius-sm);
  background: var(--app-surface);
  color: var(--app-text);
  font-size: 0.78rem;
  font-weight: 600;
}

.cv-style-switcher__trigger:hover {
  border-color: var(--app-border-strong);
}

.cv-style-switcher__trigger-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cv-style-switcher__modified {
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  background: var(--app-surface-strong);
  color: var(--app-text-muted);
  font-size: 0.66rem;
  font-weight: 600;
  white-space: nowrap;
}

.cv-style-switcher__strip {
  display: inline-flex;
  flex-shrink: 0;
}

.cv-style-switcher__chip {
  width: 0.7rem;
  height: 0.7rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 999px;
}

.cv-style-switcher__chip + .cv-style-switcher__chip {
  margin-left: -0.2rem;
}

.cv-style-switcher__panel {
  /* Positioned by useAnchoredPanelPosition, as .cv-font-switcher__panel. */
  position: fixed;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  width: min(calc(100vw - 2rem), 17rem);
  padding: 0.35rem;
  border: 1px solid var(--app-border);
  border-radius: var(--radius-md);
  background: var(--app-surface);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.2);
}

.cv-style-switcher__option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.5rem 0.6rem;
  border-radius: var(--radius-sm);
  text-align: left;
  color: var(--app-text);
  transition: background-color 120ms ease;
}

.cv-style-switcher__option:hover,
.cv-style-switcher__option--active {
  background: var(--app-surface-strong);
}

.cv-style-switcher__option-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.cv-style-switcher__option-label {
  font-size: 0.9rem;
  font-weight: 600;
}

.cv-style-switcher__option-font {
  color: var(--app-text-muted);
  font-size: 0.75rem;
}

@media (max-width: 639.98px) {
  .cv-style-switcher__trigger-label,
  .cv-style-switcher__modified {
    display: none;
  }
}
```

Check that each token used (`--app-border-strong`, `--app-surface-strong`, `--app-text-muted`, `--radius-sm`, `--radius-md`) exists by grepping `src/styles/tokens.css`. The `.cv-font-switcher` rules use the first ones already.

- [ ] **Step 4: Wire the toolbar**

In `Toolbar.jsx`, import `CvStyleSwitcher from './CvStyleSwitcher'`. Add these props with defaults:

```js
  styleVariants = [],
  styleVariantId = 'default',
  isStyleVariantModified = false,
  onSelectStyleVariant = () => {},
```

Then add this control right after the Template `app-toolbar__labeled-control` `<div>`:

```jsx
            <div className="app-toolbar__labeled-control">
              <span className="app-toolbar__control-label">{isFinnish ? 'Tyyli' : 'Style'}</span>
              <CvStyleSwitcher
                variants={styleVariants}
                variantId={styleVariantId}
                isModified={isStyleVariantModified}
                onSelectVariant={onSelectStyleVariant}
                locale={locale}
              />
            </div>
```

In `App.jsx`'s `<Toolbar …>`, pass the four props from `headerProps`, mirroring `cvFontId`:

```jsx
          styleVariants={headerProps.styleVariants}
          styleVariantId={headerProps.styleVariantId}
          isStyleVariantModified={headerProps.isStyleVariantModified}
          onSelectStyleVariant={headerProps.onSelectStyleVariant}
```

In `ResumeBuilderPage.jsx`, import `getTemplateVariants, getVariantSwatches, isStyleVariantModified` alongside the existing imports. Then add:

```js
  const styleVariants = useMemo(
    () => getTemplateVariants(selectedTemplate).map((variant) => ({
      ...variant,
      swatches: getVariantSwatches(selectedTemplate, variant),
    })),
    [selectedTemplate],
  )
  const styleVariantModified = isStyleVariantModified({
    templateId: selectedTemplate,
    variantId: styleVariantId,
    templateAccentColors,
    cvFontId,
    cvHeadingColor,
  })
```

Add `styleVariants`, `styleVariantId`, `isStyleVariantModified: styleVariantModified` and `onSelectStyleVariant: handleSelectStyleVariant` to the `onHeaderChange({ … })` payload, and the same four values to that effect's dependency list.

- [ ] **Step 5: Run the new spec, the toolbar-sensitive specs and lint**

Run: `npx playwright test e2e/style-variants.spec.js e2e/responsive.spec.js e2e/editor.spec.js`
Expected: all pass.

If `responsive.spec.js` reports toolbar overflow at a narrow width, the strip-only trigger rule needs a wider breakpoint. Pick the breakpoint the Template trigger already collapses at (grep `app-toolbar__template-trigger-label` in `app-shell.css`). Don't hide the picker.

Run: `npm run lint`, then the baseline compare.
Expected: 170 passed. The CV previews are unchanged and the shots don't include the toolbar.

Check the toolbar visually at 1440px and 375px (desktop and mobile presets in the browser pane). Report what you saw: the strip, the label, the panel, and the Modified marker after a font change.

- [ ] **Step 6: Commit, then bump**

```bash
git add src/components/CvStyleSwitcher.jsx src/components/Toolbar.jsx src/App.jsx src/pages/ResumeBuilderPage.jsx src/styles/app-shell.css e2e/style-variants.spec.js
git commit -m "Add the Style picker to the builder toolbar"
npm version 1.5.9 --no-git-tag-version
git commit -am "Bump version to 1.5.9"
```

---

### Task 7: Tokenise Minimalist (version 1.5.10)

Minimalist has no Showcase. It *is* the flat renderer, coloured by Tailwind-style utility classes in `src/components/templates/minimal.js`. This task moves its colours onto a `.min-doc` root with `--min-*` variables, so the same inline-palette mechanism works.

**Files:**
- Create: `src/styles/templates/minimal.css`
- Modify: `src/components/templates/minimal.js`, `src/index.css`, `src/utils/templateVariants.js` (`minimal` entry), `scripts/check-template-variants.mjs` (`CSS_SOURCES.minimal`)

**Interfaces:**
- Consumes: Task 4's flat-renderer `style={variant === 'minimal' && !atsFriendlyMode ? paletteStyle : undefined}`.
- Produces: Minimalist's palette variables `--min-ink`, `--min-muted`, `--min-accent-ink`, `--min-accent-text`, `--min-accent-soft`, `--min-accent-line`, `--min-header-line`, `--min-rule`, `--min-border`, `--min-bg`.

Today's colour sources (utility → hex, from `src/styles/utilities.css`): `text-gray-900` #111827, `text-gray-500` #6b7280, `text-amber-700` #b45309, `text-amber-600` #d97706 (CVPreview's `text-${accent.light}-600` fallback for project names), `bg-amber-50` #fffbeb, `border-amber-200` #fde68a, `border-amber-100` #fef3c7, `border-amber-300` #fcd34d, `border-gray-200` #e5e7eb, `bg-white` #ffffff. `bg-amber-50/60` and `bg-amber-500` are **not defined** anywhere, so they paint nothing today. Confirm with `grep -rn "amber-50\\\\/60\|amber-50/60\|bg-amber-500" src/styles src/index.css`, then leave `timelineDot` exactly as it is.

- [ ] **Step 1: Point the check at the new stylesheet (it fails)**

In `scripts/check-template-variants.mjs`, change `minimal: null,` to `minimal: { file: 'minimal.css', root: '.min-doc' },`.

Run: `npm run check:template-variants`
Expected: FAIL, because `minimal.css` doesn't exist.

- [ ] **Step 2: Create the stylesheet**

`src/styles/templates/minimal.css`:

```css
/* ==========================================================================
   Minimalist — palette variables for the flat renderer (CVPreview.jsx),
   used ONLY when the template is Minimalist and ATS view is off
   (minimal.js's class getters return these `min-*` classes; ATS view uses
   its own monochrome classes and never sees them). Phase 3 style variants
   override the `--min-*` values inline on the article (templateVariants.js).
   Values are the exact colours the utility classes painted before
   (utilities.css), so variant #1 is unchanged.
   ========================================================================== */

.min-doc {
  --min-ink: #111827;
  --min-muted: #6b7280;
  --min-accent-ink: #b45309;
  --min-accent-text: #d97706;
  --min-accent-soft: #fffbeb;
  --min-accent-line: #fde68a;
  --min-header-line: #fef3c7;
  --min-rule: #fcd34d;
  --min-border: #e5e7eb;
  --min-bg: #ffffff;

  background-color: var(--min-bg);
}

.min-doc .min-ink { color: var(--min-ink); }
.min-doc .min-muted { color: var(--min-muted); }
.min-doc .min-accent-ink { color: var(--min-accent-ink); }
.min-doc .min-accent-text { color: var(--min-accent-text); }
.min-doc .min-header { color: var(--min-ink); border-bottom-color: var(--min-header-line); }
.min-doc .min-border { border-color: var(--min-border); }
.min-doc .min-rule { border-color: var(--min-rule); }

.min-doc .min-tag,
.min-doc .min-badge {
  background-color: var(--min-accent-soft);
  color: var(--min-accent-ink);
}

.min-doc .min-tag { border-color: var(--min-accent-line); }
```

In `src/index.css`, add `@import './styles/templates/minimal.css';` right after the `_system.css` import.

- [ ] **Step 3: Swap minimal.js's colour utilities for the `min-*` classes**

In `src/components/templates/minimal.js`, make exactly these changes and leave every non-colour class as it is:

| Getter | Before | After |
|---|---|---|
| `preview` | `'border border-black/10 bg-white shadow-sm'` | `'min-doc border border-black/10 shadow-sm'` |
| `headerColor` | `'bg-amber-50/60 text-gray-900 border-b border-amber-100'` | `'min-header border-b'` |
| `headerTitle` | `'… tracking-tight text-gray-900 lg:text-5xl'` | `'… tracking-tight min-ink lg:text-5xl'` |
| `headerSubtitle` | `'mt-2 text-base text-gray-500'` | `'mt-2 text-base min-muted'` |
| `sectionTitle` | `'… text-amber-700'` | `'… min-accent-ink'` |
| `mainSection` | `'border-b border-gray-200 pb-7 last:border-none'` | `'border-b min-border pb-7 last:border-none'` |
| `skillTag` | `'rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-[0.72rem] font-medium text-amber-700'` | `'rounded border min-tag px-2.5 py-1 text-[0.72rem] font-medium'` |
| `timelineBorder` | `'border-amber-300'` | `'min-rule'` |
| `summaryBadge` | `'rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700'` | `'rounded min-badge px-2 py-1 text-xs font-medium'` |
| `photoBorder` | `'border border-gray-200'` | `'border min-border'` |
| `aboutBorder` | `'border-gray-200'` | `'min-border'` |
| `categoryLabelColor` | `'text-amber-700'` | `'min-accent-ink'` |
| `headerContactTextColor` | `'text-gray-500'` | `'min-muted'` |
| *(new key)* | — | `accentTextClass: 'min-accent-text',` (replaces CVPreview's `text-amber-600` fallback) |

Then grep `CVPreview.jsx` for every other use of `t.accentColor()`'s result (`accent.light`, `accent.dark`) outside ATS-only branches. If any reaches Minimalist's normal view, give it a `min-*` class the same way and list it in your report. If none does, say so.

- [ ] **Step 4: Fill the registry entry**

Replace the `minimal` entry in `templateVariants.js`:

```js
  minimal: {
    swatchVariables: ['--min-accent-ink', '--min-accent-line', '--min-ink'],
    textPairs: [
      { foreground: '--min-ink', background: '--min-bg', size: 'body' },
      { foreground: '--min-muted', background: '--min-bg', size: 'body' },
      { foreground: '--min-accent-ink', background: '--min-bg', size: 'body' },
      { foreground: '--min-accent-ink', background: '--min-accent-soft', size: 'body' },
      { foreground: '--min-accent-text', background: '--min-bg', size: 'body' },
    ],
    defaultContrastExceptions: [
      { foreground: '--min-accent-text', background: '--min-bg', ratio: '3.19', reason: 'Amber-600 project names on white, below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('minimal', {
        '--min-ink': '#111827',
        '--min-muted': '#6b7280',
        '--min-accent-ink': '#b45309',
        '--min-accent-text': '#d97706',
        '--min-accent-soft': '#fffbeb',
        '--min-accent-line': '#fde68a',
        '--min-header-line': '#fef3c7',
        '--min-rule': '#fcd34d',
        '--min-border': '#e5e7eb',
        '--min-bg': '#ffffff',
      }),
    ],
  },
```

Use the ratio the check prints if it differs from 3.19.

- [ ] **Step 5: Verify**

Run: `npm run check:template-variants && npm run lint`
Expected: pass.

Run the baseline compare.
Expected: 170 passed, including every `minimal__*` shot.

A Minimalist mismatch usually means specificity. `[class~='x']` is (0,1,0) and `.min-doc .min-x` is (0,2,0), so an element that also carries another colour class now shows ours. Compare the `.actual.png`, find the element and fix the getter. Don't change `utilities.css`.

Run: `CI=1 npm run test:e2e:fast`
Expected: all pass.

- [ ] **Step 6: Commit, then bump**

```bash
git add src/styles/templates/minimal.css src/components/templates/minimal.js src/index.css src/utils/templateVariants.js scripts/check-template-variants.mjs
git commit -m "Move Minimalist's colours onto --min-* palette variables"
npm version 1.5.10 --no-git-tag-version
git commit -am "Bump version to 1.5.10"
```

---

### Task 8: Tokenise Developer and Colorful Compact (version 1.5.11)

**Rule for this task and Task 9:**
- **Becomes a variable:** every remaining literal that paints text, a surface, a border or a tint in the normal (non-ATS) look.
- **Stays hard-coded:** box-shadows; `@media print` / PDF-guard rules (e.g. `developer.css`'s `background: #ffffff !important`); builder-only UI (the overflow warnings); ATS-only selectors (`--ats`); white glyphs on accent-filled badges (section/project/trophy icons); white photo rings; translucent-white overlays on a band that stays dark.

Each new variable is declared in the root rule, next to the existing ones, with today's literal as its value. Each replaced line becomes `var(--name)`.

**Files:**
- Modify: `src/styles/templates/developer.css`, `src/components/templates/DeveloperShowcase.jsx`, `src/styles/templates/colorfulCompact.css`, `src/utils/templateVariants.js`

**Interfaces:**
- Produces: the new palette variables below, in both CSS and registry.

- [ ] **Step 1: Add the new variables to the registry first (the check fails)**

In the `developer` variant #1 palette, add:

```js
        '--dev-sidebar-end': '#1e293b',
        '--dev-sidebar-text': '#e2e8f0',
        '--dev-sidebar-muted': '#94a3b8',
        '--dev-sidebar-heading': '#f1f5f9',
        '--dev-sidebar-chip-bg': 'rgba(20, 184, 166, 0.16)',
        '--dev-sidebar-chip-text': '#5eead4',
        '--dev-sidebar-line': 'rgba(148, 163, 184, 0.25)',
        '--dev-body': '#334155',
        '--dev-accent-soft': 'rgba(15, 118, 110, 0.1)',
```

Add to `developer.textPairs`:

```js
      { foreground: '--dev-body', background: '--dev-bg', size: 'body' },
      { foreground: '--dev-sidebar-text', background: '--dev-sidebar', size: 'body' },
      { foreground: '--dev-sidebar-muted', background: '--dev-sidebar', size: 'body' },
      { foreground: '--dev-sidebar-muted', background: '--dev-sidebar-end', size: 'body' },
      { foreground: '--dev-sidebar-heading', background: '--dev-sidebar', size: 'body' },
      { foreground: '--dev-sidebar-chip-text', background: '--dev-sidebar', size: 'body' },
```

In the `colorfulCompact` variant #1 palette, add:

```js
        '--cc-page': '#ffffff',
        '--cc-body': '#3f3f46',
        '--cc-pink-soft': '#fce7f3',
        '--cc-orange-soft': '#ffedd5',
        '--cc-green-soft': '#dcfce7',
        '--cc-teal-soft': '#ccfbf1',
        '--cc-blue-soft': '#dbeafe',
        '--cc-purple-soft': '#f3e8ff',
```

Add to `colorfulCompact.textPairs`:

```js
      { foreground: '--cc-body', background: '--cc-card', size: 'body' },
      { foreground: '--cc-body', background: '--cc-sidebar', size: 'body' },
      ...['pink', 'orange', 'green', 'teal', 'blue', 'purple'].map((hue) => (
        { foreground: `--cc-${hue}-text`, background: `--cc-${hue}-soft`, size: 'body' }
      )),
```

Run: `npm run check:template-variants`
Expected: FAIL, because the CSS doesn't declare them yet.

- [ ] **Step 2: developer.css**

Declare the 9 variables in `.dev-showcase { … }` after `--dev-muted`. Then replace these lines (numbers from the file at the start of Phase 3; re-find them by value if they've shifted):

| Lines | Literal | Becomes |
|---|---|---|
| 264 | `#1e293b` in the sidebar gradient | `var(--dev-sidebar-end)` |
| 265, 416, 482 | `#e2e8f0` | `var(--dev-sidebar-text)` |
| 273, 353, 410, 444, 472, 498 | `#94a3b8` | `var(--dev-sidebar-muted)` |
| 438, 466 | `#f1f5f9` | `var(--dev-sidebar-heading)` |
| 372 | `rgba(20, 184, 166, 0.16)` | `var(--dev-sidebar-chip-bg)` |
| 373, 451 | `#5eead4` | `var(--dev-sidebar-chip-text)` |
| 423 | `rgba(148, 163, 184, 0.25)` | `var(--dev-sidebar-line)` |
| 333, 580, 604, 610, 649, 744, 790 | `#334155` | `var(--dev-body)` |
| 377, 666 | `rgba(15, 118, 110, 0.1)` | `var(--dev-accent-soft)` |
| 943 | `#64748b` | `var(--dev-muted)` (existing variable, same value) |

Keep: 277–278 (builder chip-add overlay on the dark rail), 320 and 716 (white icon glyphs), 636/702/760 (shadows), 900 (print guard).

Before replacing a `#334155`, `#94a3b8` or `#e2e8f0`, confirm its selector is in the region the variable's name claims (main column vs `__sidebar`). If one isn't, stop and report it rather than guessing.

In `DeveloperShowcase.jsx` line 146, replace `'#f1f5f9'` with `'var(--dev-sidebar-heading)'`.

- [ ] **Step 3: colorfulCompact.css**

Declare the 8 variables in `.colorful-compact-showcase { … }`, then:

| Lines | Literal | Becomes |
|---|---|---|
| 57 | `background: #ffffff;` (root) | `background: var(--cc-page);` |
| 272, 344, 359, 388, 473, 479 | `#3f3f46` | `var(--cc-body)` |
| 406, 512 | `#fce7f3` | `var(--cc-pink-soft)` |
| 407, 513 | `#ffedd5` | `var(--cc-orange-soft)` |
| 408, 514 | `#dcfce7` | `var(--cc-green-soft)` |
| 409, 515 | `#ccfbf1` | `var(--cc-teal-soft)` |
| 410, 516 | `#dbeafe` | `var(--cc-blue-soft)` |
| 411, 517 | `#f3e8ff` | `var(--cc-purple-soft)` |

Keep: 111/124/135/143/153 (white text on the dark header band), 442–447 (white pill text on the dark `-text` hues), 61 (shadow).

- [ ] **Step 4: Verify**

Run: `npm run check:template-variants && npm run lint`
Expected: pass.

Run the baseline compare.
Expected: 170 passed.

Run: `CI=1 npm run test:e2e:fast`
Expected: all pass.

- [ ] **Step 5: Commit, then bump**

```bash
git add src/styles/templates/developer.css src/components/templates/DeveloperShowcase.jsx src/styles/templates/colorfulCompact.css src/utils/templateVariants.js
git commit -m "Move Developer's and Colorful Compact's remaining colours onto palette variables"
npm version 1.5.11 --no-git-tag-version
git commit -am "Bump version to 1.5.11"
```

---

### Task 9: Tokenise Tech Executive, Timeline and Portfolio, and close Part 1 (version 1.5.12)

The other 10 stylesheets need no new variables. Their remaining literals are all in the "stays hard-coded" list (Task 8's rule): shadows, white glyphs and photo rings, the builder-only overflow warnings in `compact.css`/`european.css`, the white monogram on Portrait's accent, and the white glyphs in `modernOrange.css`.

**Files:**
- Modify: `src/styles/templates/techExec.css`, `timeline.css`, `portfolio.css`, `src/utils/templateVariants.js`
- Delete (untracked): `e2e/variant-baseline.spec.js`

- [ ] **Step 1: Registry first (the check fails)**

`techExec` palette, add:

```js
        '--te-masthead-kicker': '#a8b5c8',
        '--te-masthead-role': '#bfdbfe',
        '--te-masthead-contact': '#cbd5e1',
        '--te-masthead-icon': '#93c5fd',
```

`techExec.textPairs`, add one `{ foreground: <each of the 4>, background: '--te-navy', size: 'body' }`.

`timeline` palette, add `'--tl-ink': '#111827',`. `timeline.textPairs`, add `{ foreground: '--tl-ink', background: '--tl-bg', size: 'body' }`.

`portfolio` palette, add `'--pf-header-top': '#fafbfc', '--pf-header-bottom': '#ffffff',`.

Run: `npm run check:template-variants`
Expected: FAIL.

- [ ] **Step 2: The three stylesheets**

Declare each new variable in its root rule. Then replace:

| File: lines | Literal | Becomes |
|---|---|---|
| techExec: 74 | `#a8b5c8` | `var(--te-masthead-kicker)` |
| techExec: 93 | `#bfdbfe` | `var(--te-masthead-role)` |
| techExec: 110, 498 | `#cbd5e1` | `var(--te-masthead-contact)` (first confirm `.tech-exec-showcase__footer-text` sits on `--te-navy`; if it doesn't, stop and report) |
| techExec: 124 | `#93c5fd` | `var(--te-masthead-icon)` |
| timeline: 83, 182 | `var(--cv-heading-color, #111827)` | `var(--cv-heading-color, var(--tl-ink))` |
| timeline: 135, 266, 338, 403, 462 | `#111827` | `var(--tl-ink)` |
| portfolio: 107 | `linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)` | `linear-gradient(180deg, var(--pf-header-top) 0%, var(--pf-header-bottom) 100%)` |

Keep: techExec 83 (white name on the masthead) and 137 (photo ring); timeline 64, 169, 246, 326 (photo ring, white glyphs, the white row marker); portfolio 230 (white glyph).

`techExec.js` has `photoRingColor: '#2563EB'`. Grep where it's read. If it only feeds the flat/ATS renderer, leave it. If it reaches the Showcase's normal view, report it rather than tokenising it.

- [ ] **Step 3: Audit for leftovers**

Run:

```bash
for f in src/styles/templates/[a-z]*.css; do echo "== $f"; grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(' "$f" | grep -vE '^\s*[0-9]+:\s*--' | grep -vE '^[0-9]+:\s*(/\*|\*)'; done
```

Expected: every line printed is in a "keep" category (Task 8's rule) or a comment. List any other line in your report and tokenise it the same way, registry first.

- [ ] **Step 4: Final Part 1 verification**

Run: `npm run lint && npm run check:share && npm run check:reducers && npm run check:feedback && npm run check:docx-export && npm run check:section-schema && npm run check:section-columns && npm run check:template-pages && npm run check:template-variants`
Expected: all pass.

Run the baseline compare.
Expected: 170 passed. Paste the summary line into the report.

Run: `CI=1 npm run test:e2e`
Expected: the full suite, including `@slow` (layout stress and PDF with the exact `EXPECTED_PDF_PAGES`), all passing.

- [ ] **Step 5: Delete the baseline harness**

```bash
rm e2e/variant-baseline.spec.js
git status --short
```

Expected: only the modified source files, no untracked spec. Keep `$SHOTS` until the end of Part 1's review in case the user asks for a recheck.

- [ ] **Step 6: Commit, then bump**

```bash
git add src/styles/templates/techExec.css src/styles/templates/timeline.css src/styles/templates/portfolio.css src/utils/templateVariants.js
git commit -m "Move Tech Executive's, Timeline's and Portfolio's remaining colours onto palette variables"
npm version 1.5.12 --no-git-tag-version
git commit -am "Bump version to 1.5.12"
```

- [ ] **Step 7: Report Part 1 to the user and ask about pushing**

Report:
- Tasks 2–9 done.
- 170/170 byte-identical.
- Full suite green, with the counts.
- The `defaultContrastExceptions` list (template, pair, ratio): each is a pre-existing contrast gap the user may want fixed in a separate hotfix.
- Interpretations 1–6.

Ask: "Push Part 1 to `origin/v1.6.0` (`git push origin HEAD:v1.6.0`)?" Push only on a yes.

---

# Part 2 — The 36 new variants

### Task 10: Variant harness: layout and PDF budget for every non-default variant (version 1.5.13)

**Files:**
- Create: `e2e/fixtures/pdfPages.js`
- Modify: `e2e/template-pdf.spec.js` (import the map instead of declaring it)
- Create: `e2e/template-variants.spec.js`

**Interfaces:**
- Consumes: `getTemplateVariants` (Task 2); the style picker names (Task 6); `auditLayout`, `waitForStableLayout`, `filterAllowlisted` (`e2e/helpers/layoutAudit.js`); `LAYOUT_ALLOWLIST`.
- Produces: `export const EXPECTED_PDF_PAGES` from `e2e/fixtures/pdfPages.js`, the same object `template-pdf.spec.js` declares today. Tests generated per non-default variant, so 0 tests until Task 11.

- [ ] **Step 1: Move `EXPECTED_PDF_PAGES` into a fixture**

Create `e2e/fixtures/pdfPages.js`. Move the whole `EXPECTED_PDF_PAGES` object, with its comment block, out of `template-pdf.spec.js` and into this file as `export const EXPECTED_PDF_PAGES = { … }`, unchanged. Add a first-line comment: `// Shared by template-pdf.spec.js (variant #1, exact) and template-variants.spec.js (variants #2/#3, budget).` In `template-pdf.spec.js`, import it: `import { EXPECTED_PDF_PAGES } from './fixtures/pdfPages.js'`.

Update `CLAUDE.md`'s sentence "update `EXPECTED_PDF_PAGES` in `e2e/template-pdf.spec.js`" to say `e2e/fixtures/pdfPages.js`.

- [ ] **Step 2: Write the variant harness**

Create `e2e/template-variants.spec.js`:

```js
import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { auditLayout, waitForStableLayout, filterAllowlisted } from './helpers/layoutAudit.js'
import { LAYOUT_ALLOWLIST } from './fixtures/layoutAllowlist.js'
import { EXPECTED_PDF_PAGES } from './fixtures/pdfPages.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_EXAMPLES, loadExampleCv } from '../src/utils/exampleCvs.js'
import { getTemplateVariants } from '../src/utils/templateVariants.js'

// Phase 3: every non-default style variant (#2, #3) of every template,
// through the Phase 2 layout harness and a PDF page budget. Variant #1 is
// covered, exactly, by template-layout.spec.js and template-pdf.spec.js.
//
// The CV arrives as a session-restore snapshot carrying the variant in
// styleVariantByTemplate — the same path a reload takes, which also
// applies the variant's font (uiReducer's createInitialUiState).
const BUILDER_ROOT = '.app-shell__preview [data-export-variant]'
// ATS view only shows template colours on these (CVPreview.jsx).
const ATS_SHOWCASE_TEMPLATES = new Set(['timeline', 'navyProfessional', 'modernOrange'])

async function openWithVariant(page, templateId, variantId, cv) {
  await page.addInitScript((snapshot) => {
    window.localStorage.setItem('portifycv-session-restore-enabled', 'true')
    window.sessionStorage.setItem('portifycv-session-snapshot', snapshot)
  }, JSON.stringify({ ...cv, styleVariantByTemplate: { [templateId]: variantId } }))
  await page.goto(`/cv?template=${templateId}`)
  await expect(page.locator(BUILDER_ROOT)).toContainText(cv.fullName.split(' ')[0])
}

for (const template of cvTemplates) {
  for (const variant of getTemplateVariants(template.id).slice(1)) {
    for (const exampleId of TEMPLATE_EXAMPLES[template.id]) {
      const modes = ATS_SHOWCASE_TEMPLATES.has(template.id) ? ['normal', 'ats'] : ['normal']
      for (const mode of modes) {
        test(`variant layout / ${template.id} / ${variant.id} / ${exampleId} / ${mode} @slow`, async ({ page }) => {
          const cv = await loadExampleCv(exampleId, 'en')
          await openWithVariant(page, template.id, variant.id, cv)
          await expect(page.getByRole('banner').getByRole('button', { name: /^Select style:/ }))
            .toHaveAccessibleName(`Select style: ${variant.label.en}`)
          if (mode === 'ats') {
            await page.getByRole('button', { name: 'Settings' }).click()
            const dialog = page.getByRole('dialog', { name: 'Settings' })
            await dialog.locator('.settings-row', { hasText: 'ATS-friendly mode' }).locator('.toggle-switch').click()
            await page.getByRole('button', { name: 'Close' }).click()
          }
          await waitForStableLayout(page)

          // The builder shows placeholders for empty secondary sections by
          // design (as the stress tier), and length is the PDF test's job.
          const violations = await auditLayout(page, BUILDER_ROOT, { skipRules: ['placeholder'] })
          const { remaining } = filterAllowlisted(violations, LAYOUT_ALLOWLIST, {
            template: template.id, subject: `${variant.id}:${exampleId}`, mode,
          })
          expect(remaining, 'layout violations').toEqual([])
        })
      }
    }

    test(`variant pdf budget / ${template.id} / ${variant.id} @slow`, async ({ page }, testInfo) => {
      test.setTimeout(90_000)
      const exampleId = TEMPLATE_EXAMPLES[template.id][0]
      const cv = await loadExampleCv(exampleId, 'en')
      await openWithVariant(page, template.id, variant.id, cv)
      await waitForStableLayout(page)

      await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
      const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })
      await page.getByRole('menuitem', { name: 'PDF' }).click()
      const download = await downloadPromise
      const path = testInfo.outputPath(`${template.id}-${variant.id}.pdf`)
      await download.saveAs(path)
      const bytes = await readFile(path)
      const pageCount = (bytes.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length
      const budget = EXPECTED_PDF_PAGES[template.id] === 1 ? 1 : 2
      expect(pageCount, `pdf pages for ${template.id}/${variant.id} (budget ${budget})`).toBeLessThanOrEqual(budget)
    })
  }
}
```

**Session restore and the template's example.** Confirm that the session-restore path keeps `styleVariantByTemplate`. The snapshot goes through `parseImportedCvData`, which Task 3 taught the field. Also confirm the restore wins over `?example=`: there's no `example` param here, so it does. If `auditLayout`'s fixtures expect `subject` to be an example id only, the composite `variant:example` subject is harmless: the allowlist is `[]`.

- [ ] **Step 3: Verify**

Run: `npx playwright test e2e/template-variants.spec.js`
Expected: "No tests found", which is correct: no template has a second variant yet. Then:

Run: `npx playwright test e2e/template-pdf.spec.js --grep-invert @slow && npm run lint`
Expected: pass. The moved map is still found.

- [ ] **Step 4: Commit, then bump**

```bash
git add e2e/fixtures/pdfPages.js e2e/template-pdf.spec.js e2e/template-variants.spec.js CLAUDE.md
git commit -m "Add the layout and PDF-budget harness for style variants"
npm version 1.5.13 --no-git-tag-version
git commit -am "Bump version to 1.5.13"
```

---

## The batch procedure (Tasks 11–13)

Each batch designs 2 variants for each of its 6 templates. It gets the user's approval on a review page, then runs the full harness. Steps, in order:

1. **Design.** For each template, add 2 variants after `original(…)` in `TEMPLATE_VARIANTS`, using the proposals in the batch's table:
   - Every variant sets **every** palette variable (copy variant #1's palette, then change values).
   - `accent` is one of the template's swatches (null for accent-less templates).
   - `fontId` comes from `CV_FONT_OPTIONS`; `headingColor` is `''` or a hex.
   - Soft tints and borders derived from an accent may be written with `accentSoftFill(hex, alpha)` / `accentInkMix(hex, ink, share)` imported from `./templateAccents.js`, never with `color-mix()`.
   - The proposals fix each variant's id, labels, font and key hues. You choose the remaining palette values so the look stays coherent (§3 colour rule: one ink, one accent, at most one tint) and the template's character stays: same structure, dark bands stay dark.
   - Add the 6 template ids to `TEMPLATES_WITH_DESIGNED_VARIANTS` in the check script.
2. **Contrast.** Run `npm run check:template-variants` until it passes. Fix a failing pair by darkening the foreground or lightening the background, never by deleting the pair.
3. **Review screenshots.** Create the untracked `e2e/variant-review.spec.js` below and run it for the batch.
4. **Review page.** Load the `artifact-design` skill. Build one HTML page in the scratchpad: per template, a heading and its 3 shots side by side, each captioned with name (en/fi), font and swatches. Publish it with the Artifact tool, passing the PNGs via `files`. Send the user the link.
5. **STOP: the user approves or rejects each variant.** Apply the requested changes (new hues, font or name) and republish to the same URL until every one of the 12 is approved. Don't run the slow harness before approval. The approved list, with any change notes, goes in the commit message body.
6. **Harness.** Run `npx playwright test e2e/template-variants.spec.js --grep "<the 6 ids as an alternation>"`. If a variant breaks its PDF budget or the layout harness, change its font (or make a density tweak through the template's existing density class, never through layout CSS). Tell the user, since that changes an approved look. Never loosen a test.
7. **Full verification.** Run `npm run lint`, all 8 `check:*` scripts, and `CI=1 npm run test:e2e`. Everything passes.
8. **Clean up.** `rm e2e/variant-review.spec.js`. `git status` shows no untracked spec.
9. **Commit, bump, then ask** whether to push to `origin/v1.6.0`.

The review spec, created fresh each batch (untracked, never committed):

```js
// e2e/variant-review.spec.js — TEMPORARY review-page capture. Never commit.
//   REVIEW_DIR=<abs dir> REVIEW_TEMPLATES=developer,modern npx playwright test e2e/variant-review.spec.js
import { test, expect } from './fixtures/base.js'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { getTemplateVariants } from '../src/utils/templateVariants.js'
import { waitForStableLayout } from './helpers/layoutAudit.js'

const DIR = process.env.REVIEW_DIR
const TEMPLATES = (process.env.REVIEW_TEMPLATES ?? '').split(',').filter(Boolean)
test.skip(!DIR || TEMPLATES.length === 0, 'set REVIEW_DIR and REVIEW_TEMPLATES')

const ROOT = '.app-shell__preview [data-export-variant]'

for (const templateId of TEMPLATES) {
  for (const variant of getTemplateVariants(templateId)) {
    test(`review / ${templateId} / ${variant.id}`, async ({ page }) => {
      await page.setViewportSize({ width: 1600, height: 1200 })
      await page.goto(`/cv?template=${templateId}`)
      await page.getByRole('button', { name: 'Load demo CV' }).first().click()
      await page.getByRole('banner').getByRole('button', { name: /^Select style:/ }).click()
      await page.getByRole('radiogroup', { name: 'Select style' }).getByRole('radio', { name: variant.label.en }).click()
      await expect(page.locator(ROOT)).toContainText('John')
      await waitForStableLayout(page)
      await mkdir(DIR, { recursive: true })
      await page.locator(ROOT).screenshot({ path: join(DIR, `${templateId}__${variant.id}.png`), animations: 'disabled' })
    })
  }
}
```

---

### Task 11: Batch 1: the six accent-less templates (version 1.5.14)

These six are the reason Part 1 tokenised: their variants change only through palette variables. All accents are `null`.

**Files:**
- Modify: `src/utils/templateVariants.js`, `scripts/check-template-variants.mjs` (`TEMPLATES_WITH_DESIGNED_VARIANTS`), `scripts/check-reducers.mjs`, `e2e/style-variants.spec.js`

| Template | id | Label en / fi | Font | Direction and key hues |
|---|---|---|---|---|
| minimal | `slate` | Slate / Liuske | helvetica | Cool, quiet: accent-ink `#334155`, accent-soft `#f1f5f9`, accent-line `#cbd5e1`, rule `#94a3b8` |
| minimal | `forest` | Forest / Metsä | georgia | Warm-deep: accent-ink `#166534`, accent-soft `#f0fdf4`, accent-line `#bbf7d0`, header-line `#dcfce7` |
| developer | `graphite` | Graphite / Grafiitti | helvetica | Neutral-dark rail `#18181b`→`#27272a`, spectrum `#22c55e`/`#14b8a6`/`#0ea5e9`, `--dev-accent` `#15803d` |
| developer | `midnight` | Midnight / Keskiyö | lato | Indigo rail `#1e1b4b`→`#312e81`, spectrum `#818cf8`/`#a78bfa`/`#f472b6`, `--dev-accent` `#6d28d9` |
| modern | `ocean` | Ocean / Meri | helvetica | navy `#0c4a6e`, rose → `#0369a1`, blush → `#7dd3fc` |
| modern | `plum` | Plum / Luumu | georgia | navy `#3b0764`, rose → `#a21caf`, blush → `#f0abfc` |
| classicProfessional | `navy` | Navy / Laivasto | timesNewRoman | text `#0f172a`, muted `#475569`, border `#cbd5e1`; headingColor `#1e3a8a` |
| classicProfessional | `warm` | Warm / Lämmin | georgia | text `#292524`, muted `#57534e`, border `#d6d3d1`, bg `#fdfcfa`; headingColor `#7f1d1d` |
| navyProfessional | `forest` | Forest / Metsä | lato | rail `#14352a`, blue → `#15803d`, blue-light → `#86efac` |
| navyProfessional | `charcoal` | Charcoal / Hiili | georgia | rail `#27272a`, blue → `#b45309`, blue-light → `#fcd34d` |
| colorfulCompact | `ocean` | Ocean / Meri | helvetica | Cool hue set (sky, cyan, teal, indigo, blue, violet), header `#0c1a2e` |
| colorfulCompact | `sunset` | Sunset / Iltarusko | lato | Warm hue set (rose, red, orange, amber, coral, plum), header `#2a1313` |

Colorful Compact keeps its documented multicolour exception (§3): each variant is an alternative set of six section hues, each with its `-text` and `-soft` partners.

- [ ] **Step 1: Design the 12 variants** per the batch procedure, step 1.
- [ ] **Step 2: Contrast** (batch step 2).
- [ ] **Step 3: Add the persistence e2e tests** that need a real variant. Append to `e2e/style-variants.spec.js`:

```js
const minimalVariant = getTemplateVariants('minimal')[1]

test('picking a variant changes the look and its font', async ({ page }) => {
  await page.goto('/cv?template=minimal')
  await styleTrigger(page).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
  await expect(fontTrigger(page)).toHaveAccessibleName(/^Select font: (Helvetica|Georgia)$/)
  // toHaveCSS can't read custom properties, so read the computed value directly.
  await expect.poll(() => page.locator('.app-shell__preview [data-export-variant="minimal"]')
    .evaluate((el) => getComputedStyle(el).getPropertyValue('--min-accent-ink').trim()))
    .toBe(minimalVariant.palette['--min-accent-ink'])
})

test('a variant survives a share link', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/cv?template=minimal')
  await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  await styleTrigger(page).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  await page.getByRole('button', { name: 'Copy share link' }).click()
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#data=')
  const url = await page.evaluate(() => navigator.clipboard.readText())

  const fresh = await context.newPage()
  await fresh.goto(url)
  await expect(fresh.getByRole('banner').getByRole('button', { name: /^Select style:/ }))
    .toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
})

test('a variant survives a JSON export and import', async ({ page }, testInfo) => {
  await page.goto('/cv?template=minimal')
  await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  await styleTrigger(page).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('menuitem', { name: 'JSON' }).click()
  const path = testInfo.outputPath('cv.json')
  await (await downloadPromise).saveAs(path)

  await page.goto('/cv?template=minimal')
  await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original')
  await page.locator('input[type="file"][accept=".json,application/json"]').setInputFiles(path)
  await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
})

test('a variant survives a session restore', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('portifycv-session-restore-enabled', 'true'))
  await page.goto('/cv?template=minimal')
  await styleTrigger(page).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  await expect
    .poll(() => page.evaluate(() => window.sessionStorage.getItem('portifycv-session-snapshot')))
    .toContain(minimalVariant.id)
  await page.reload()
  await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
})

test('switching templates keeps each template\'s own variant', async ({ page }) => {
  const developerVariant = getTemplateVariants('developer')[2]
  await page.goto('/cv?template=minimal')
  await styleTrigger(page).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  await page.getByRole('button', { name: /^Select template:/ }).click()
  await page.getByRole('dialog').getByRole('button', { name: /Developer/ }).first().click()
  await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original')
  await styleTrigger(page).click()
  await styleGroup(page).getByRole('radio', { name: developerVariant.label.en }).click()
  await page.getByRole('button', { name: /^Select template:/ }).click()
  await page.getByRole('dialog').getByRole('button', { name: /Minimalist/ }).first().click()
  await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
})

test('undo restores the previous look', async ({ page }) => {
  await page.goto('/cv?template=minimal')
  await styleTrigger(page).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original')
  await expect(fontTrigger(page)).toHaveAccessibleName('Select font: Inter')
})
```

The clipboard pattern matches `e2e/badge.spec.js`. Fix the gallery locators in the template-switch test to whatever `TemplateGalleryModal` actually renders. Read `e2e/templates.spec.js` for how it picks a template, and copy that.

Also append to `scripts/check-reducers.mjs`:

```js
{
  const { getTemplateVariants } = await importSrc('utils/templateVariants.js')
  const stored = getTemplateVariants('minimal')[1]
  const restored = createInitialUiState({ formData: { ...createInitialCvData(), styleVariantByTemplate: { minimal: stored.id } } })
  check('a restored CV opens in its stored variant\'s font', restored.cvFontId === stored.fontId)
}
```

(`createInitialUiState` reads `?template=` from `window`, which is absent in Node, so it uses `defaultTemplateId` = `minimal`.)

- [ ] **Step 4: Review screenshots and review page** (batch steps 3–4), with `REVIEW_TEMPLATES=minimal,developer,modern,classicProfessional,navyProfessional,colorfulCompact`.
- [ ] **Step 5: STOP for the user's approval** of all 12 (batch step 5).
- [ ] **Step 6: Harness** (batch step 6). Also run `npx playwright test e2e/style-variants.spec.js`.
- [ ] **Step 7: Full verification and clean-up** (batch steps 7–8).
- [ ] **Step 8: Commit, then bump**

```bash
git add src/utils/templateVariants.js scripts/check-template-variants.mjs scripts/check-reducers.mjs e2e/style-variants.spec.js
git commit -m "Add style variants for Minimalist, Developer, Modern, Classic Professional, Navy Professional and Colorful Compact" -m "<approved list, one line per variant, with any change notes>"
npm version 1.5.14 --no-git-tag-version
git commit -am "Bump version to 1.5.14"
```

Then ask whether to push.

---

### Task 12: Batch 2: Creative, Executive, Timeline, Graduate, Compact, Portfolio (version 1.5.15)

**Files:**
- Modify: `src/utils/templateVariants.js`, `scripts/check-template-variants.mjs`

Every accent must be in the template's swatch set (listed in `src/utils/templateAccents.js`).

| Template | id | Label en / fi | Font | Accent (swatch set) | Direction |
|---|---|---|---|---|---|
| creative | `sage` | Sage / Salvia | lato | `#1f7a6c` (warmCoral) | page `#eef3ec`, sidebar `#dfe9da`, border `#cfdcc9`, card `#fbfdfa` |
| creative | `violet` | Violet / Violetti | georgia | `#7c3aed` (warmCoral) | page `#f5f3fa`, sidebar `#e9e4f5`, cool-grey inks |
| executive | `navy` | Navy / Laivasto | timesNewRoman | `#1e3a8a` (warmGold) | cool slate inks, rail `#f1f4f9`, bg `#f8fafc` |
| executive | `burgundy` | Burgundy / Viini | georgia | `#9f1239` (warmGold) | rail `#f9f1f1`, bg `#fcf9f9`, warm inks |
| timeline | `blue` | Blue / Sininen | lato | `#2563eb` (cool) | cool slate inks, bg `#fcfdff` |
| timeline | `rose` | Rose / Ruusu | georgia | `#be123c` (cool) | warm-neutral inks, bg `#fdfcfc` |
| graduate | `blue` | Blue / Sininen | lato | `#2563eb` (coolIndigo) | bg `#f5f8fc`, blue-grey inks |
| graduate | `rose` | Rose / Ruusu | georgia | `#be123c` (coolIndigo) | bg `#faf7f8` |
| compact | `slate` | Slate / Liuske | arial | `#334155` (coolBlue) | cool-neutral, bg `#f5f6f8` |
| compact | `indigo` | Indigo / Indigo | calibri | `#4f46e5` (coolBlue) | bg `#f6f6fb` |
| portfolio | `sky` | Sky / Taivas | lato | `#0369a1` (forestGreen) | sidebar tint `#f2f7fb`, header gradient cool |
| portfolio | `slate` | Slate / Liuske | georgia | `#334155` (forestGreen) | sidebar tint `#f5f5f4`, warm-neutral |

Labels must be unique per template and language. Graduate and Timeline both use "Rose", which is fine because they're different templates.

- [ ] **Step 1: Design** (batch step 1). Add the 6 ids to `TEMPLATES_WITH_DESIGNED_VARIANTS`.
- [ ] **Step 2: Contrast** (batch step 2).
- [ ] **Step 3: Review screenshots and page**, with `REVIEW_TEMPLATES=creative,executive,timeline,graduate,compact,portfolio`.
- [ ] **Step 4: STOP for the user's approval** of all 12.
- [ ] **Step 5: Harness, full verification, clean-up** (batch steps 6–8).
- [ ] **Step 6: Commit, then bump**

```bash
git add src/utils/templateVariants.js scripts/check-template-variants.mjs
git commit -m "Add style variants for Creative, Executive, Timeline, Graduate, Compact and Portfolio" -m "<approved list>"
npm version 1.5.15 --no-git-tag-version
git commit -am "Bump version to 1.5.15"
```

Then ask whether to push.

---

### Task 13: Batch 3: Tech Executive, Modern Orange, Quadrant, Editorial, Portrait, European (version 1.5.16)

**Files:**
- Modify: `src/utils/templateVariants.js`, `scripts/check-template-variants.mjs`

| Template | id | Label en / fi | Font | Accent (swatch set) | Direction |
|---|---|---|---|---|---|
| techExec | `teal` | Teal / Sinivihreä | calibri | `#0f766e` (royalBlue) | masthead `#134e4a`, masthead texts re-tinted cool-green |
| techExec | `slate` | Slate / Liuske | helvetica | `#4f46e5` (royalBlue) | masthead `#1e293b` (the name is the masthead), masthead texts neutral |
| modernOrange | `blue` | Blue / Sininen | lato | `#1d4ed8` (warm) | sidebar `#f2f6fd`, border `#d9e2f3`, dot-empty `#cdd8ee` |
| modernOrange | `rose` | Rose / Ruusu | georgia | `#be123c` (warm) | sidebar `#fdf2f4`, border `#f1dade`, dot-empty `#ecd3d8` |
| quadrant | `teal` | Teal / Sinivihreä | lato | `#0f766e` (coolCyan) | border `#c3e3dd`, bg `#f6faf9` |
| quadrant | `indigo` | Indigo / Indigo | calibri | `#4f46e5` (coolCyan) | border `#d4d4f5`, bg `#f7f7fc` |
| editorial | `navy` | Navy / Laivasto | timesNewRoman | `#1e3a8a` (inkCrimson) | cool inks, bg `#fcfcfd` |
| editorial | `teal` | Teal / Sinivihreä | georgia | `#0f766e` (inkCrimson) | warm-paper bg `#fcfbf8` |
| portrait | `slate` | Slate / Liuske | helvetica | `#334155` (quietTeal) | neutral |
| portrait | `crimson` | Crimson / Karmiini | georgia | `#9f1239` (quietTeal) | warm-paper bg `#fdfbfa` |
| european | `forest` | Forest / Metsä | calibri | `#15803d` (civicBlue) | neutral-green inks |
| european | `slate` | Slate / Liuske | arial | `#334155` (civicBlue) | cool-neutral |

Contrast notes for this batch:
- **Modern Orange's** variant #1 carries two contrast exceptions (white title text on orange, the orange marks). New variants get none, so their accents must pass both: white text on the accent at 4.5:1, and the accent on the bg at 3:1. `#1d4ed8` (about 6.7:1 with white) and `#be123c` (about 6.3:1) both pass. `#0d9488` (Teal, about 3.7:1) would fail, which is why the table uses Blue.
- **Accents used as body text elsewhere** (Timeline, Graduate, Quadrant in Task 12/13) avoid `#0d9488` and `#059669`, which are about 3.7–3.8:1 on near-white.

- [ ] **Step 1: Design** (batch step 1). Add the 6 ids to `TEMPLATES_WITH_DESIGNED_VARIANTS`.
- [ ] **Step 2: Contrast** (batch step 2).
- [ ] **Step 3: Review screenshots and page**, with `REVIEW_TEMPLATES=techExec,modernOrange,quadrant,editorial,portrait,european`.
- [ ] **Step 4: STOP for the user's approval** of all 12.
- [ ] **Step 5: Harness, full verification, clean-up** (batch steps 6–8).
- [ ] **Step 6: Commit, then bump**

```bash
git add src/utils/templateVariants.js scripts/check-template-variants.mjs
git commit -m "Add style variants for Tech Executive, Modern Orange, Quadrant, Editorial, Portrait and European" -m "<approved list>"
npm version 1.5.16 --no-git-tag-version
git commit -am "Bump version to 1.5.16"
```

Then ask whether to push.

---

# Part 3 — Docs and release

### Task 14: Docs, the final check tightening, 1.6.0

**Files:**
- Modify: `scripts/check-template-variants.mjs`, `docs/template-design-system.md`, `changes.md`, `todo.md`, `CLAUDE.md`

- [ ] **Step 1: Require 3 variants everywhere**

In `scripts/check-template-variants.mjs`, delete `TEMPLATES_WITH_DESIGNED_VARIANTS` and its comment, and change `const expectedCount = …` to `const expectedCount = 3`.

Run: `npm run check:template-variants`
Expected: pass.

- [ ] **Step 2: `docs/template-design-system.md`**

Add a subsection **"Style variants (v1.6)"** at the end of §3 (Color rule):
- A variant is the template's own palette variables, plus a font from `CV_FONT_OPTIONS` and a headings colour, held in `src/utils/templateVariants.js`.
- Variant #1 equals the stylesheet defaults.
- §3's rule applies per variant.
- Dark bands stay dark.
- New colour literals in a template stylesheet must be palette variables unless they're in the keep list: shadows, print guards, builder-only UI, ATS-only rules, white glyphs on accent fills, photo rings, translucent white on dark bands.
- `check:template-variants` enforces the defaults match, contrast, and no `color-mix()`.

In §2, add one line saying a variant may change the font but never the type ramp or density.

- [ ] **Step 3: `CLAUDE.md`**
- Add `npm run check:template-variants  # validates the style-variant registry against each template's CSS defaults, plus contrast (src/utils/templateVariants.js)` to the Commands block, after `check:template-pages`.
- Add the script to the prose list that says which check to run after touching what.
- Update "CI … runs all seven" to "all eight".
- In "Template system — three files per bespoke template", add a fourth piece: the template's entry in `src/utils/templateVariants.js` (3 looks; variant #1 must equal the CSS root defaults). Add a sentence telling a new template to declare every colour on its root rule as a variable.
- Under "Share links", note `va`.
- Under "CV data shape", note `styleVariantByTemplate`.

- [ ] **Step 4: `changes.md` and `todo.md`**

At the top of `changes.md`, add a `## Template style variants — 1.6.0, <date>` entry in the file's existing voice. Cover:
- 3 looks per template and where to pick them.
- What a look changes.
- That tweaks stay tab-only with a Modified marker.
- That old CVs and links are unchanged.
- The `defaultContrastExceptions` that remain as known gaps.

In `todo.md`, close the Phase 3 item. Record the verification evidence (check outputs, suite counts) and the Phase 4 follow-up from the spec: variants on gallery cards and template pages.

- [ ] **Step 5: Final verification**

Run: `npm run lint`, all 8 `check:*` scripts, `CI=1 npm run test:e2e`, and `npm run build`.
Expected: everything passes. Paste the counts into the report.

- [ ] **Step 6: Commit, then set 1.6.0**

```bash
git add scripts/check-template-variants.mjs docs/template-design-system.md changes.md todo.md CLAUDE.md
git commit -m "Document template style variants and require three looks per template"
npm version 1.6.0 --no-git-tag-version
git commit -am "Bump version to 1.6.0"
```

- [ ] **Step 7: Hand off**

Report to the user. Ask whether to push `v1.6.0`. Ask separately, and only if they want it, whether to open the PR into `main`. Never merge without their explicit OK.
