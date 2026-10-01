# Styled Word (`.docx`) Export (C2/C3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the existing Word export template-specific layout (a table-based
archetype mirroring the template's on-screen structural family) and accent
color, instead of every template producing the identical one-column
monochrome document C1 ships today.

**Architecture:** A new `src/utils/docxArchetypes.js` holds 3 layout-assembly
functions (`buildRailTableBody`, `buildGridTableBody`, `buildLabelGridBody`)
and the `DOCX_ARCHETYPES` mapping table. `docxExport.js`'s `buildDocxDocument`
dispatches to one of them (or its own unchanged one-column loop) based on the
current template's archetype, and wraps section-building in a small
color-palette primitive so headings pick up the template's accent color
without touching any of the 20 existing section builders' signatures.

**Tech Stack:** `docx` (already a dependency), Node ESM (`scripts/check-docx-export.mjs`), Playwright (`e2e/export.spec.js`, unchanged).

**Spec:** `docs/superpowers/specs/2026-09-13-word-export-c2-c3-design.md`

## Global Constraints

- Structure + accent color only — no decorative-treatment approximation
  (icon badges, numbered ordinals, left-tick marks, gradients, timelines).
  Every archetype keeps real Word `HEADING_2` style for section headings.
- The 20 existing section-builder functions (`buildAboutSection`, etc.) keep
  their exact current signatures `(snapshot, copy) => docx node[]` — no
  changes to their bodies or call sites within them.
- `accent: null` templates (Minimalist, Developer, Modern Professional,
  Classic Professional, Navy Professional, Colorful Compact) get no accent
  color threaded — headings stay `INK` (`1A1A1A`), matching C1's current
  behavior exactly for those 6.
- `docxArchetypes.js` imports only from `src/utils/*.js` (plain JS) — never
  from `src/components/**` (`.jsx`). `src/components/templates/shared.jsx`
  contains inline JSX and cannot be imported by
  `scripts/check-docx-export.mjs`, which runs under plain Node with no JSX
  transform. This is why the `labelGridTable` Skills row uses a flat
  comma-joined list (matching C1's own `buildSkillsSection`) rather than
  `parseSkillCategories`-grouped categories — a correction to the spec's
  wording, found during planning, not a scope change.
- Every new/changed code path gets a check in `scripts/check-docx-export.mjs`
  before the task is considered done — this project has no other automated
  coverage for `docxExport.js`.

---

### Task 1: Accent-color palette primitive + threading through `buildDocxDocument`

**Files:**
- Modify: `src/utils/docxExport.js`
- Modify: `src/pages/ResumeBuilderPage.jsx:760-763`
- Modify: `scripts/check-docx-export.mjs`

**Interfaces:**
- Produces: `withPalette(palette, fn)` — exported from `docxExport.js`.
  `palette: { ink: string, inkSubtle: string, heading: string }` (6-hex-digit
  strings, no `#`). Calls `fn()` with `currentPalette` set to `palette` for
  the duration of the call (synchronous), restores the previous palette
  afterward, returns `fn()`'s return value.
- Produces: `sectionHeading`, `boldLine`, `plainLine`, `bulletLines`,
  `emptyNotice`, `descriptionLines`, `NO_CELL_BORDERS`, `INK`, `INK_SUBTLE`,
  `META_SIZE` — all now exported from `docxExport.js` (previously
  module-private) for `docxArchetypes.js` to import in later tasks. Same
  signatures as today (see the file's current source) — only their `export`
  keyword and internal color reference change in this task.
- Produces: `buildDocxDocument(formData, { template, locale, accentColor })`
  — same signature as today, `accentColor` is a new optional option, a
  6-hex-digit string with a leading `#` (as `resolveTemplateAccent` already
  returns) or `undefined`.

- [ ] **Step 1: Read the current file to confirm line numbers before editing**

Run: `grep -n "^const INK\|^const INK_SUBTLE\|^function sectionHeading\|^function boldLine\|^function plainLine\|^function bulletLines\|^function emptyNotice\|^function descriptionLines\|^const NO_CELL_BORDERS\|^export async function buildDocxDocument" src/utils/docxExport.js`

Expected: one line number per symbol, matching the current file (no other
changes have landed since the design spec was written).

- [ ] **Step 2: Add the palette primitive and switch the 5 paragraph helpers to read it**

In `src/utils/docxExport.js`, immediately after the `NO_CELL_BORDERS`
constant, add:

```js
// A small color-override mechanism so buildDocxDocument can recolor
// section headings (and, later, a whole rail cell's text) to a
// template's accent without changing any of the 20 section-builder
// functions below — they all go through sectionHeading/boldLine/
// plainLine/bulletLines/emptyNotice, which read this instead of the
// INK/INK_SUBTLE constants directly. Module-level state is safe here
// only because buildDocxDocument is the sole caller of these helpers
// and the app's export UI disables every export button while one is
// in flight (Toolbar.jsx's `disabled={isActionBusy}`), so two calls
// can never interleave.
let currentPalette = { ink: INK, inkSubtle: INK_SUBTLE, heading: INK }

export function withPalette(palette, fn) {
  const previous = currentPalette
  currentPalette = palette
  try {
    return fn()
  } finally {
    currentPalette = previous
  }
}
```

Then change the 5 helper functions to read `currentPalette` instead of the
constants. `sectionHeading`:

```js
function sectionHeading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: HEADING_SIZE, color: currentPalette.heading })],
  })
}
```

`boldLine`:

```js
function boldLine(text, opts = {}) {
  if (!text) {
    return null
  }
  return new Paragraph({
    spacing: { after: opts.after ?? 40 },
    children: [new TextRun({ text, bold: true, size: opts.size ?? SUBHEAD_SIZE, color: currentPalette.ink })],
  })
}
```

`plainLine`:

```js
function plainLine(text, opts = {}) {
  if (!text) {
    return null
  }
  return new Paragraph({
    spacing: { after: opts.after ?? 160 },
    children: [new TextRun({
      text,
      size: opts.size ?? BODY_SIZE,
      color: opts.subtle ? currentPalette.inkSubtle : currentPalette.ink,
      italics: opts.italics ?? false,
    })],
  })
}
```

`bulletLines`:

```js
function bulletLines(items) {
  return items.map((item) => new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text: item, size: BODY_SIZE, color: currentPalette.ink })],
  }))
}
```

`emptyNotice`:

```js
function emptyNotice(text) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text, size: BODY_SIZE, color: currentPalette.inkSubtle, italics: true })],
  })
}
```

`descriptionLines` is unchanged (it only calls `bulletLines`/`plainLine`,
already fixed above).

- [ ] **Step 3: Export the primitives `docxArchetypes.js` will need later**

Add `export` to `function sectionHeading`, `function boldLine`,
`function plainLine`, `function bulletLines`, `function emptyNotice`,
`function descriptionLines`, `const NO_CELL_BORDERS`, `const INK`,
`const INK_SUBTLE`, `const META_SIZE` (all currently declared without
`export` — just add the keyword in place, no other changes).

- [ ] **Step 4: Thread `accentColor` through `buildDocxDocument`**

In `buildDocxDocument`, change the options destructure and wrap the
existing section-building loop:

```js
export async function buildDocxDocument(formData, options = {}) {
  const { template = defaultTemplateId, locale = 'en', accentColor } = options
  const snapshot = createCvSnapshot(formData)
  const copy = createExportCopy(locale)
  const templateConfig = getCvTemplate(template)
  const sectionVisibility = { ...createSectionVisibility(), ...(formData.sectionVisibility ?? {}) }
  const templateSectionOrder = [...templateConfig.primarySections, ...templateConfig.secondarySections]
  const sectionOrder = normalizeSectionOrder(formData.sectionOrder, templateSectionOrder)
  const isVisible = (section) => sectionVisibility[section] !== false
  const includePhoto = isPhotoVisibleForTemplate(formData.photoVisibilityByTemplate, templateConfig.id)
  const headingColor = accentColor ? accentColor.replace('#', '').toUpperCase() : INK

  const sectionBuilders = {
    // ...unchanged...
  }

  const renderedSections = new Set()
  const children = [...(await buildIdentityBlock(snapshot, copy, includePhoto))]

  withPalette({ ink: INK, inkSubtle: INK_SUBTLE, heading: headingColor }, () => {
    const appendSection = (section) => {
      const build = sectionBuilders[section]
      if (build && !renderedSections.has(section) && isVisible(section)) {
        children.push(...build())
        renderedSections.add(section)
      }
    }
    sectionOrder.forEach(appendSection)
    Object.keys(sectionBuilders).forEach(appendSection)
  })

  return new Document({
    // ...unchanged...
  })
}
```

(Everything else in the function — the `sectionBuilders` map, the
`Document(...)` construction — is unchanged; only the destructure, the new
`headingColor` line, and wrapping the two `forEach` calls in `withPalette`
are new.)

- [ ] **Step 5: Thread `accentColor` from the page into the export call**

In `src/pages/ResumeBuilderPage.jsx`, the existing `type === 'docx'` branch
(around line 760):

```js
if (type === 'docx') {
  const { exportCvAsDocx } = await import('../utils/docxExport')
  await exportCvAsDocx(formData, exportFileName, {
    template: selectedTemplate,
    locale,
    accentColor: resolveTemplateAccent(templateAccentColors, selectedTemplate),
  })
}
```

`resolveTemplateAccent` and `templateAccentColors` are already in scope in
this file (both used a few lines below for the live `CVPreview` — confirm
with `grep -n "resolveTemplateAccent\|templateAccentColors" src/pages/ResumeBuilderPage.jsx`
before editing).

- [ ] **Step 6: Update the existing "monochrome by design" check for the new accent path**

`scripts/check-docx-export.mjs` currently asserts every color in the
generated document is exactly `1A1A1A` or `666666` — this is still true
when no `accentColor` is passed, but no longer true once one is. Replace
the existing check block (`console.log('\ndocxExport: monochrome by
design...')` through the end of that block) with:

```js
console.log('\ndocxExport: heading color (monochrome by default, accent when provided)\n')

{
  // No accentColor passed — headings stay the two monochrome tokens,
  // exactly C1's original guarantee.
  const doc = await buildDocxDocument(demoCvData, { template: 'modern', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)

  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const documentXmlFile = zip.file('word/document.xml')
  check('word/document.xml is present in the packed .docx', documentXmlFile !== null)

  if (documentXmlFile) {
    const documentXml = await documentXmlFile.async('string')
    const colorMatches = [...documentXml.matchAll(/w:color w:val="([0-9A-Fa-f]{6})"/g)]
    const colorsUsed = new Set(colorMatches.map(([, hex]) => hex.toUpperCase()))

    check('found at least one w:color in the generated document', colorMatches.length > 0)
    check(
      'with no accentColor, every text color is one of the two monochrome tokens (1A1A1A / 666666)',
      colorsUsed.size > 0 && [...colorsUsed].every((hex) => hex === '1A1A1A' || hex === '666666'),
      `colors found: ${[...colorsUsed].join(', ')}`,
    )
  }
}

{
  // accentColor passed — headings use it; body text stays monochrome.
  const doc = await buildDocxDocument(demoCvData, { template: 'creative', locale: 'en', accentColor: '#e2572a' })
  const buffer = await Packer.toBuffer(doc)

  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const documentXml = await zip.file('word/document.xml').async('string')
  const colorMatches = [...documentXml.matchAll(/w:color w:val="([0-9A-Fa-f]{6})"/g)]
  const colorsUsed = new Set(colorMatches.map(([, hex]) => hex.toUpperCase()))

  check('with accentColor #e2572a, the accent hex E2572A appears in the document', colorsUsed.has('E2572A'))
  check(
    'with accentColor set, every color is still one of the three expected tokens (1A1A1A / 666666 / E2572A) — no stray hues',
    [...colorsUsed].every((hex) => hex === '1A1A1A' || hex === '666666' || hex === 'E2572A'),
    `colors found: ${[...colorsUsed].join(', ')}`,
  )
}

{
  // accent: null template (Modern Professional) — accentColor omitted by
  // the caller in practice, but confirm passing one anyway has no special
  // handling needed here (buildDocxDocument doesn't know about the
  // registry's accent:null — that's ResumeBuilderPage.jsx's job, tested
  // manually in Task 5). This check just documents the contract: omitting
  // accentColor is what keeps a template monochrome.
  const doc = await buildDocxDocument(demoCvData, { template: 'modern', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const documentXml = await zip.file('word/document.xml').async('string')
  check('omitting accentColor entirely still produces a valid document', documentXml.includes('<w:document'))
}
```

- [ ] **Step 7: Run the check script**

Run: `npm run check:docx-export`
Expected: all checks pass, including the 3 new ones from Step 6. If the
"omitting accentColor" or "monochrome" checks fail, re-read Step 4's
`headingColor` line — it must fall back to `INK` when `accentColor` is
falsy.

- [ ] **Step 8: Run lint and the existing e2e Word export test**

Run: `npm run lint`
Expected: clean.

Run: `npx playwright test e2e/export.spec.js -g "Word export"`
Expected: passes unchanged — this task doesn't touch the export menu or
file-download mechanics, only the document's internal styling.

- [ ] **Step 9: Commit**

```bash
git add src/utils/docxExport.js src/pages/ResumeBuilderPage.jsx scripts/check-docx-export.mjs
git commit -m "Add accent-color palette to Word export headings"
```

---

### Task 2: `buildRailTableBody` — light rail-table and dark-sidebar-table

**Files:**
- Create: `src/utils/docxArchetypes.js`
- Modify: `scripts/check-docx-export.mjs`

**Interfaces:**
- Consumes (from `docxExport.js`, exported in Task 1): `NO_CELL_BORDERS`.
- Produces: `buildRailTableBody(mainChildren, railChildren, { railSide = 'right', dark = false } = {})` → `docx.Table[]` (an array containing exactly one `Table`). `mainChildren`/`railChildren` are arrays of already-built docx nodes (the output of calling existing section builders) — this function only wraps them in a 2-cell table, it does not build or recolor any content itself. Column order: `railSide: 'left'` puts the rail cell first (33%... **32%** per the spec) then main (68%); `railSide: 'right'` puts main first, rail second. `dark: true` adds `shading: { fill: '1F2937', type: ShadingType.CLEAR }` to the rail cell only — it does **not** recolor any text (the caller is responsible for building `railChildren` under a light-text palette via `withPalette` when `dark` is true — see Task 5).

- [ ] **Step 1: Write the failing check**

Add to `scripts/check-docx-export.mjs`, after the existing "monochrome
by design" section from Task 1 (add the new imports this needs at the top
of the file alongside the existing `docx`/`docxExport.js` imports):

```js
const { Document } = await import('docx')
const { buildRailTableBody } = await importSrc('utils/docxArchetypes.js')
```

```js
console.log('\ndocxArchetypes: buildRailTableBody\n')

async function packAndReadDocumentXml(children) {
  const doc = new Document({ sections: [{ children }] })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  return zip.file('word/document.xml').async('string')
}

{
  const main = [new Paragraph({ children: [new TextRun('Main content')] })]
  const rail = [new Paragraph({ children: [new TextRun('Rail content')] })]

  const result = buildRailTableBody(main, rail, { railSide: 'left', dark: false })
  check('returns an array with exactly one Table', Array.isArray(result) && result.length === 1)

  const xml = await packAndReadDocumentXml(result)
  check('produced exactly one table', (xml.match(/<w:tbl>/g) ?? []).length === 1)
  check('produced exactly two cells in that table', (xml.match(/<w:tc>/g) ?? []).length === 2)
  const railIndex = xml.indexOf('Rail content')
  const mainIndex = xml.indexOf('Main content')
  check('railSide "left" places rail content before main content in document order', railIndex > -1 && mainIndex > -1 && railIndex < mainIndex)
}

{
  const main = [new Paragraph({ children: [new TextRun('Main content')] })]
  const rail = [new Paragraph({ children: [new TextRun('Rail content')] })]

  const result = buildRailTableBody(main, rail, { railSide: 'right', dark: false })
  const xml = await packAndReadDocumentXml(result)
  const railIndex = xml.indexOf('Rail content')
  const mainIndex = xml.indexOf('Main content')
  check('railSide "right" places main content before rail content in document order', mainIndex > -1 && railIndex > -1 && mainIndex < railIndex)
  check('no cell shading when dark is false', !xml.includes('w:fill="1F2937"'))
}

{
  const main = [new Paragraph({ children: [new TextRun('Main content')] })]
  const rail = [new Paragraph({ children: [new TextRun('Rail content')] })]

  const result = buildRailTableBody(main, rail, { railSide: 'left', dark: true })
  const xml = await packAndReadDocumentXml(result)
  check('dark:true shades the rail cell with the expected fill', xml.includes('w:fill="1F2937"'))
}
```

This needs `Paragraph`/`TextRun` already imported at the top of the check
script — confirm with
`grep -n "^const { Paragraph, Packer }" scripts/check-docx-export.mjs`
and change that line to also import `TextRun`:
`const { Paragraph, TextRun, Packer } = await import('docx')`.

- [ ] **Step 2: Run the check to confirm it fails**

Run: `npm run check:docx-export`
Expected: fails with an import error (`docxArchetypes.js` doesn't exist
yet) or `buildRailTableBody is not a function`.

- [ ] **Step 3: Create `src/utils/docxArchetypes.js` with `buildRailTableBody`**

```js
// Layout-assembly functions for styled Word export (C2/C3) — each template
// maps to one of these via DOCX_ARCHETYPES (added in a later task once
// buildGridTableBody and buildLabelGridBody also exist). Every function
// here takes already-built docx nodes (the output of docxExport.js's
// existing 20 section builders) and wraps them in a table-based layout —
// none of them build or recolor section content themselves; that stays
// docxExport.js's job (see its withPalette primitive for text color).
// See docs/superpowers/specs/2026-09-13-word-export-c2-c3-design.md.

import { Table, TableRow, TableCell, WidthType, ShadingType } from 'docx'
import { NO_CELL_BORDERS } from './docxExport'

const RAIL_WIDTH_PERCENT = 32
const MAIN_WIDTH_PERCENT = 68
const DARK_SIDEBAR_FILL = '1F2937'

export function buildRailTableBody(mainChildren, railChildren, { railSide = 'right', dark = false } = {}) {
  const mainCell = new TableCell({
    width: { size: MAIN_WIDTH_PERCENT, type: WidthType.PERCENTAGE },
    borders: NO_CELL_BORDERS,
    children: mainChildren,
  })
  const railCell = new TableCell({
    width: { size: RAIL_WIDTH_PERCENT, type: WidthType.PERCENTAGE },
    borders: NO_CELL_BORDERS,
    ...(dark ? { shading: { fill: DARK_SIDEBAR_FILL, type: ShadingType.CLEAR } } : null),
    children: railChildren,
  })

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: railSide === 'left' ? [railCell, mainCell] : [mainCell, railCell],
        }),
      ],
    }),
  ]
}
```

- [ ] **Step 4: Run the check to confirm it passes**

Run: `npm run check:docx-export`
Expected: all checks pass, including the new `buildRailTableBody` ones.

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/utils/docxArchetypes.js scripts/check-docx-export.mjs
git commit -m "Add buildRailTableBody for styled Word export rail layouts"
```

---

### Task 3: `buildGridTableBody` — 2×2 grid layout (Quadrant)

**Files:**
- Modify: `src/utils/docxArchetypes.js`
- Modify: `scripts/check-docx-export.mjs`

**Interfaces:**
- Produces: `buildGridTableBody(cellChildrenArrays)` → `docx.Table[]`
  (array containing exactly one `Table`). `cellChildrenArrays` is exactly
  `[topLeft, topRight, bottomLeft, bottomRight]`, each an array of
  already-built docx nodes (possibly empty). Unlike `buildRailTableBody`,
  cells get a visible thin light-gray border (`BorderStyle.SINGLE`, `size:
  4`, `color: 'D4D4D8'`) on all sides — the one archetype that keeps
  borders, since a borderless 2×2 table is visually indistinguishable from
  `buildRailTableBody`'s wrapped rows.

- [ ] **Step 1: Write the failing check**

Add to `scripts/check-docx-export.mjs`:

```js
const { buildGridTableBody } = await importSrc('utils/docxArchetypes.js')
```

```js
console.log('\ndocxArchetypes: buildGridTableBody\n')

{
  const cell = (text) => [new Paragraph({ children: [new TextRun(text)] })]
  const result = buildGridTableBody([cell('TL'), cell('TR'), cell('BL'), cell('BR')])

  check('returns an array with exactly one Table', Array.isArray(result) && result.length === 1)

  const xml = await packAndReadDocumentXml(result)
  check('produced exactly one table', (xml.match(/<w:tbl>/g) ?? []).length === 1)
  check('produced exactly 2 rows', (xml.match(/<w:tr>/g) ?? []).length === 2)
  check('produced exactly 4 cells', (xml.match(/<w:tc>/g) ?? []).length === 4)
  check('cells have a visible border (unlike railTable)', xml.includes('w:val="single"'))

  const positions = ['TL', 'TR', 'BL', 'BR'].map((label) => xml.indexOf(label))
  check('all 4 labels present and in reading order (TL, TR, BL, BR)', positions.every((p) => p > -1) && positions[0] < positions[1] && positions[1] < positions[2] && positions[2] < positions[3])
}

{
  // An empty cell (a quadrant with no assigned sections) must not throw —
  // docx.js requires at least one paragraph per cell.
  const cell = (text) => [new Paragraph({ children: [new TextRun(text)] })]
  const result = buildGridTableBody([cell('Only content'), [], [], []])
  check('an empty quadrant does not throw and still produces one table', Array.isArray(result) && result.length === 1)
}
```

- [ ] **Step 2: Run the check to confirm it fails**

Run: `npm run check:docx-export`
Expected: fails, `buildGridTableBody is not a function`.

- [ ] **Step 3: Add `buildGridTableBody` to `src/utils/docxArchetypes.js`**

Add these imports to the top of the file (extending the existing `docx`
import line): `Paragraph, BorderStyle` alongside the existing `Table,
TableRow, TableCell, WidthType, ShadingType`.

```js
const GRID_BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'D4D4D8' }
const GRID_CELL_BORDERS = { top: GRID_BORDER, bottom: GRID_BORDER, left: GRID_BORDER, right: GRID_BORDER }
const GRID_CELL_MARGINS = { top: 120, bottom: 120, left: 120, right: 120 }

export function buildGridTableBody(cellChildrenArrays) {
  const [topLeft, topRight, bottomLeft, bottomRight] = cellChildrenArrays

  const cell = (children) => new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    borders: GRID_CELL_BORDERS,
    margins: GRID_CELL_MARGINS,
    children: children.length > 0 ? children : [new Paragraph({})],
  })

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [cell(topLeft), cell(topRight)] }),
        new TableRow({ children: [cell(bottomLeft), cell(bottomRight)] }),
      ],
    }),
  ]
}
```

- [ ] **Step 4: Run the check to confirm it passes**

Run: `npm run check:docx-export`
Expected: all checks pass.

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/utils/docxArchetypes.js scripts/check-docx-export.mjs
git commit -m "Add buildGridTableBody for styled Word export 2x2 grid layout"
```

---

### Task 4: `buildLabelGridBody` — label/value table layout (European)

**Files:**
- Modify: `src/utils/docxArchetypes.js`
- Modify: `scripts/check-docx-export.mjs`

**Interfaces:**
- Consumes (from `docxExport.js`, exported in Task 1): `sectionHeading`,
  `boldLine`, `plainLine`, `bulletLines`, `emptyNotice`, `descriptionLines`,
  `NO_CELL_BORDERS`, `META_SIZE`.
- Consumes (from `src/utils/shared.js` — plain JS, safe for Node): `formatDateRange`, `formatLinkLabel`, `formatLinkDisplayValue`.
- Produces: `buildLabelGridBody(sectionOrder, snapshot, copy, isVisible)` →
  `docx node[]` (a flat array — heading `Paragraph`s and row `Table`s
  interleaved, exactly like every other archetype's body). `sectionOrder`
  is the already-resolved order array `buildDocxDocument` computes today;
  this function internally only acts on the 8 keys European's registry
  supports (`about`, `experience`, `education`, `skills`, `projects`,
  `links`, `languages`, `certificates`) and silently ignores any other key
  in `sectionOrder` (defensive — no template other than European uses this
  archetype, so this should never matter in practice, but it must not
  throw if it did). `isVisible(section) => boolean` — same predicate
  `buildDocxDocument` already computes for the other archetypes.

- [ ] **Step 1: Write the failing check**

Add to `scripts/check-docx-export.mjs`:

```js
const { buildLabelGridBody } = await importSrc('utils/docxArchetypes.js')
```

```js
console.log('\ndocxArchetypes: buildLabelGridBody\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')
  const order = ['about', 'experience', 'education', 'skills', 'projects', 'links', 'languages', 'certificates']
  const result = buildLabelGridBody(order, snapshot, copy, () => true)

  check('returns a non-empty array', Array.isArray(result) && result.length > 0)

  const xml = await packAndReadDocumentXml(result)
  check('produced 8 section headings', (xml.match(new RegExp(copy.about.toUpperCase(), 'g')) ?? []).length >= 1)
  check('produced at least one table (label/value rows)', (xml.match(/<w:tbl>/g) ?? []).length > 0)
  check('each table row has exactly 2 cells (label + value)', [...xml.matchAll(/<w:tr>[\s\S]*?<\/w:tr>/g)].every((row) => (row[0].match(/<w:tc>/g) ?? []).length === 2))
}

{
  // Empty CV — every section must still show its heading + an empty-state
  // row, matching every other archetype's "no orphan heading, but no
  // silently-missing section either" behavior from the C1 fix.
  const snapshot = createCvSnapshot(createInitialCvData())
  const copy = createExportCopy('en')
  const order = ['about', 'experience', 'education', 'skills', 'projects', 'links', 'languages', 'certificates']
  const result = buildLabelGridBody(order, snapshot, copy, () => true)
  check('an empty CV does not throw', Array.isArray(result))

  const xml = await packAndReadDocumentXml(result)
  check('empty CV still produces valid document.xml', xml.includes('<w:document'))
}

{
  // isVisible predicate is respected — hiding a section drops it entirely.
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')
  const order = ['about', 'experience']
  const result = buildLabelGridBody(order, snapshot, copy, (section) => section !== 'experience')
  const xml = await packAndReadDocumentXml(result)
  check('a hidden section is excluded entirely', !xml.includes(copy.experience.toUpperCase()))
}
```

- [ ] **Step 2: Run the check to confirm it fails**

Run: `npm run check:docx-export`
Expected: fails, `buildLabelGridBody is not a function`.

- [ ] **Step 3: Add `buildLabelGridBody` to `src/utils/docxArchetypes.js`**

Add to the top-of-file imports:

```js
import { sectionHeading, boldLine, plainLine, bulletLines, emptyNotice, descriptionLines, NO_CELL_BORDERS, META_SIZE } from './docxExport'
import { formatDateRange, formatLinkLabel, formatLinkDisplayValue } from './shared'
```

```js
const LABEL_GRID_LABEL_WIDTH = 22
const LABEL_GRID_VALUE_WIDTH = 78

function buildLabelGridRow(labelText, valueChildren) {
  const filteredValue = valueChildren.filter(Boolean)
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: LABEL_GRID_LABEL_WIDTH, type: WidthType.PERCENTAGE },
            borders: NO_CELL_BORDERS,
            children: labelText ? [boldLine(labelText, { size: META_SIZE })] : [new Paragraph({})],
          }),
          new TableCell({
            width: { size: LABEL_GRID_VALUE_WIDTH, type: WidthType.PERCENTAGE },
            borders: NO_CELL_BORDERS,
            children: filteredValue.length > 0 ? filteredValue : [new Paragraph({})],
          }),
        ],
      }),
    ],
  })
}

function buildLabelGridAbout(snapshot, copy) {
  if (!snapshot.about) {
    return [sectionHeading(copy.about), emptyNotice(copy.addSummary)]
  }
  return [sectionHeading(copy.about), buildLabelGridRow('', [plainLine(snapshot.about)])]
}

function buildLabelGridExperience(snapshot, copy) {
  if (snapshot.experience.length === 0) {
    return [sectionHeading(copy.experience), emptyNotice(copy.noExperience)]
  }
  const rows = snapshot.experience.map((item) => {
    const heading = [item.role, item.company].filter(Boolean).join(' @ ') || copy.untitledRole
    const metaLine = [item.company, item.location].filter(Boolean).join(' · ')
    const dateRange = formatDateRange(item.startDate, item.endDate)
    const value = [
      boldLine(heading),
      metaLine ? plainLine(metaLine, { subtle: true, size: META_SIZE }) : null,
      ...descriptionLines(item.description),
    ]
    return buildLabelGridRow(dateRange, value)
  })
  return [sectionHeading(copy.experience), ...rows]
}

function buildLabelGridEducation(snapshot, copy) {
  if (snapshot.education.length === 0) {
    return [sectionHeading(copy.education), emptyNotice(copy.noEducation)]
  }
  const rows = snapshot.education.map((item) => {
    const heading = [item.degree, item.school].filter(Boolean).join(', ') || copy.educationEntry
    const metaLine = [item.school, item.location].filter(Boolean).join(' · ')
    const dateRange = formatDateRange(item.startDate, item.endDate)
    const value = [
      boldLine(heading),
      metaLine ? plainLine(metaLine, { subtle: true, size: META_SIZE }) : null,
    ]
    return buildLabelGridRow(dateRange, value)
  })
  return [sectionHeading(copy.education), ...rows]
}

function buildLabelGridSkills(snapshot, copy) {
  if (snapshot.skills.length === 0) {
    return [sectionHeading(copy.skills), emptyNotice(copy.addSkills)]
  }
  // Flat, not category-grouped — parseSkillCategories lives in
  // src/components/templates/shared.jsx (JSX, not importable from this
  // plain-JS file or from the Node-run check script). See this plan's
  // Global Constraints.
  return [sectionHeading(copy.skills), buildLabelGridRow('', [plainLine(snapshot.skills.join(', '))])]
}

function buildLabelGridProjects(snapshot, copy) {
  if (snapshot.projects.length === 0) {
    return [sectionHeading(copy.projects)]
  }
  const rows = snapshot.projects.map((item) => {
    const value = [
      item.name ? boldLine(item.name) : null,
      item.description ? plainLine(item.description) : null,
      item.stack ? plainLine(item.stack, { subtle: true, size: META_SIZE }) : null,
    ]
    return buildLabelGridRow(item.date ?? '', value)
  })
  return [sectionHeading(copy.projects), ...rows]
}

function buildLabelGridLinks(snapshot, copy) {
  const links = Object.entries(snapshot.links)
  if (links.length === 0) {
    return [sectionHeading(copy.links), emptyNotice(copy.noLinks)]
  }
  const rows = links.map(([key, value]) => buildLabelGridRow(formatLinkLabel(key), [plainLine(formatLinkDisplayValue(value))]))
  return [sectionHeading(copy.links), ...rows]
}

function buildLabelGridLanguages(snapshot, copy) {
  if (snapshot.languages.length === 0) {
    return []
  }
  const rows = snapshot.languages.map((item) => buildLabelGridRow(item.level ?? '', [plainLine(item.language)]))
  return [sectionHeading(copy.languages), ...rows]
}

function buildLabelGridCertificates(snapshot, copy) {
  if (snapshot.certificates.length === 0) {
    return []
  }
  const rows = snapshot.certificates.map((item) => {
    const text = [item.name, item.issuer].filter(Boolean).join(' – ')
    return buildLabelGridRow(item.year ?? '', [plainLine(text)])
  })
  return [sectionHeading(copy.certificates), ...rows]
}

const LABEL_GRID_SECTION_BUILDERS = {
  about: buildLabelGridAbout,
  experience: buildLabelGridExperience,
  education: buildLabelGridEducation,
  skills: buildLabelGridSkills,
  projects: buildLabelGridProjects,
  links: buildLabelGridLinks,
  languages: buildLabelGridLanguages,
  certificates: buildLabelGridCertificates,
}

export function buildLabelGridBody(sectionOrder, snapshot, copy, isVisible) {
  const rendered = new Set()
  const children = []

  const append = (section) => {
    const build = LABEL_GRID_SECTION_BUILDERS[section]
    if (build && !rendered.has(section) && isVisible(section)) {
      children.push(...build(snapshot, copy))
      rendered.add(section)
    }
  }

  sectionOrder.forEach(append)
  Object.keys(LABEL_GRID_SECTION_BUILDERS).forEach(append)

  return children
}
```

- [ ] **Step 4: Run the check to confirm it passes**

Run: `npm run check:docx-export`
Expected: all checks pass. If the "8 section headings" check fails, confirm
`copy.about`/etc. aren't already uppercase in `createExportCopy`'s output
(the regex uppercases the expected label to match `sectionHeading`'s own
`.toUpperCase()` call).

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/utils/docxArchetypes.js scripts/check-docx-export.mjs
git commit -m "Add buildLabelGridBody for styled Word export label/value layout"
```

---

### Task 5: Wire `DOCX_ARCHETYPES` into `buildDocxDocument` — full integration

**Files:**
- Modify: `src/utils/docxArchetypes.js`
- Modify: `src/utils/docxExport.js`
- Modify: `scripts/check-docx-export.mjs`

**Interfaces:**
- Produces: `DOCX_ARCHETYPES` — exported from `docxArchetypes.js`, `{
  [templateId]: { archetype: 'oneColumn' | 'railTable' | 'darkSidebarTable'
  | 'gridTable' | 'labelGridTable', railSide?: 'left' | 'right' } }`.
- Consumes: everything produced by Tasks 1–4 (`withPalette`,
  `buildRailTableBody`, `buildGridTableBody`, `buildLabelGridBody`).

- [ ] **Step 1: Add `DOCX_ARCHETYPES` to `src/utils/docxArchetypes.js`**

```js
export const DOCX_ARCHETYPES = {
  minimal: { archetype: 'oneColumn' },
  compact: { archetype: 'oneColumn' },
  classicProfessional: { archetype: 'oneColumn' },
  editorial: { archetype: 'oneColumn' },
  timeline: { archetype: 'oneColumn' },
  portrait: { archetype: 'oneColumn' },
  executive: { archetype: 'railTable', railSide: 'left' },
  modernOrange: { archetype: 'railTable', railSide: 'left' },
  creative: { archetype: 'railTable', railSide: 'right' },
  modern: { archetype: 'railTable', railSide: 'right' },
  graduate: { archetype: 'railTable', railSide: 'right' },
  portfolio: { archetype: 'railTable', railSide: 'right' },
  techExec: { archetype: 'railTable', railSide: 'right' },
  colorfulCompact: { archetype: 'railTable', railSide: 'right' },
  developer: { archetype: 'darkSidebarTable', railSide: 'left' },
  navyProfessional: { archetype: 'darkSidebarTable', railSide: 'left' },
  quadrant: { archetype: 'gridTable' },
  european: { archetype: 'labelGridTable' },
}
```

- [ ] **Step 2: Write the failing checks for the dispatch**

Add to `scripts/check-docx-export.mjs`:

```js
const { DOCX_ARCHETYPES } = await importSrc('utils/docxArchetypes.js')
```

```js
console.log('\ndocxExport: archetype dispatch (buildDocxDocument)\n')

{
  check('DOCX_ARCHETYPES has an entry for all 18 known templates', Object.keys(DOCX_ARCHETYPES).length === 18)
}

{
  // oneColumn: unchanged shape — no tables except the identity block's own.
  const doc = await buildDocxDocument(demoCvData, { template: 'minimal', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml').async('string')
  check('oneColumn (minimal) produces exactly 1 table (the identity/photo table)', (xml.match(/<w:tbl>/g) ?? []).length === 1)
}

{
  // railTable, left (Executive) — 2 tables: identity + the rail table.
  const doc = await buildDocxDocument(demoCvData, { template: 'executive', locale: 'en', accentColor: '#b45309' })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml').async('string')
  check('railTable (executive) produces exactly 2 tables', (xml.match(/<w:tbl>/g) ?? []).length === 2)
  check('accent color B45309 present', xml.includes('w:val="B45309"') || xml.includes('w:val="b45309"'.toUpperCase()))
}

{
  // darkSidebarTable (Developer) — 2 tables, and the dark fill present.
  const doc = await buildDocxDocument(demoCvData, { template: 'developer', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml').async('string')
  check('darkSidebarTable (developer) produces exactly 2 tables', (xml.match(/<w:tbl>/g) ?? []).length === 2)
  check('dark sidebar fill present', xml.includes('w:fill="1F2937"'))
}

{
  // gridTable (Quadrant) — 2 tables: identity + the 2x2 grid.
  const doc = await buildDocxDocument(demoCvData, { template: 'quadrant', locale: 'en', accentColor: '#0e7490' })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml').async('string')
  check('gridTable (quadrant) produces exactly 2 tables', (xml.match(/<w:tbl>/g) ?? []).length === 2)
  check('gridTable has 4 cells in its grid (+1 in the identity table = 5 total)', (xml.match(/<w:tc>/g) ?? []).length === 5)
}

{
  // labelGridTable (European) — identity table + one table per visible section.
  const doc = await buildDocxDocument(demoCvData, { template: 'european', locale: 'en', accentColor: '#1d4ed8' })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml').async('string')
  check('labelGridTable (european) produces more than 2 tables (identity + one per row)', (xml.match(/<w:tbl>/g) ?? []).length > 2)
  check('accent color 1D4ED8 present', xml.toUpperCase().includes('W:VAL="1D4ED8"'.toUpperCase()) || xml.includes('1D4ED8'))
}
```

- [ ] **Step 3: Run the check to confirm it fails**

Run: `npm run check:docx-export`
Expected: fails — `buildDocxDocument` doesn't yet consult
`DOCX_ARCHETYPES`, so every template still produces the old flat
one-column shape (the `oneColumn` check passes by coincidence, the rest
fail on table count).

- [ ] **Step 4: Wire the dispatch into `buildDocxDocument`**

In `src/utils/docxExport.js`, add the import at the top of the file:

```js
import { DOCX_ARCHETYPES, buildRailTableBody, buildGridTableBody, buildLabelGridBody } from './docxArchetypes'
```

Replace the body of `buildDocxDocument` from `const renderedSections = new
Set()` through the `withPalette(...)` call (added in Task 1) with:

```js
  const archetypeConfig = DOCX_ARCHETYPES[templateConfig.id] ?? { archetype: 'oneColumn' }
  const identityBlock = await buildIdentityBlock(snapshot, copy, includePhoto)
  let bodyChildren = []

  withPalette({ ink: INK, inkSubtle: INK_SUBTLE, heading: headingColor }, () => {
    if (archetypeConfig.archetype === 'oneColumn') {
      const rendered = new Set()
      const append = (section) => {
        const build = sectionBuilders[section]
        if (build && !rendered.has(section) && isVisible(section)) {
          bodyChildren.push(...build())
          rendered.add(section)
        }
      }
      sectionOrder.forEach(append)
      Object.keys(sectionBuilders).forEach(append)
      return
    }

    if (archetypeConfig.archetype === 'railTable' || archetypeConfig.archetype === 'darkSidebarTable') {
      const dark = archetypeConfig.archetype === 'darkSidebarTable'
      const primarySet = new Set(templateConfig.primarySections)
      const secondarySet = new Set(templateConfig.secondarySections)
      const rendered = new Set()

      const buildGroup = (predicate) => {
        const out = []
        const append = (section) => {
          const build = sectionBuilders[section]
          if (build && !rendered.has(section) && isVisible(section) && predicate(section)) {
            out.push(...build())
            rendered.add(section)
          }
        }
        sectionOrder.forEach(append)
        Object.keys(sectionBuilders).forEach(append)
        return out
      }

      const mainChildren = buildGroup((section) => primarySet.has(section))
      const railChildren = dark
        ? withPalette({ ink: 'F5F5F5', inkSubtle: 'D4D4D8', heading: 'FFFFFF' }, () => buildGroup((section) => secondarySet.has(section)))
        : buildGroup((section) => secondarySet.has(section))

      bodyChildren = buildRailTableBody(mainChildren, railChildren, { railSide: archetypeConfig.railSide, dark })
      return
    }

    if (archetypeConfig.archetype === 'gridTable') {
      const rendered = new Set()
      const visibleOrdered = [...sectionOrder, ...Object.keys(sectionBuilders)]
        .filter((section, index, all) => all.indexOf(section) === index)
        .filter((section) => sectionBuilders[section] && isVisible(section))
      const quarterSize = Math.max(1, Math.ceil(visibleOrdered.length / 4))
      const groups = [[], [], [], []]

      visibleOrdered.forEach((section, index) => {
        if (rendered.has(section)) return
        const quarterIndex = Math.min(Math.floor(index / quarterSize), 3)
        groups[quarterIndex].push(...sectionBuilders[section]())
        rendered.add(section)
      })

      bodyChildren = buildGridTableBody(groups)
      return
    }

    if (archetypeConfig.archetype === 'labelGridTable') {
      bodyChildren = buildLabelGridBody(sectionOrder, snapshot, copy, isVisible)
    }
  })

  const children = [...identityBlock, ...bodyChildren]
```

(The `Document({ sections: [{ ... children }] })` return statement below
this is unchanged — `children` is still the final variable name it reads.)

- [ ] **Step 5: Run the check to confirm it passes**

Run: `npm run check:docx-export`
Expected: all checks pass, across every task so far (re-run the whole
suite, not just the new block, since this step changes shared code every
earlier check also exercises).

- [ ] **Step 6: Run lint, build, and the full e2e suite**

Run: `npm run lint`
Expected: clean.

Run: `npm run build`
Expected: succeeds (confirms the new `docxArchetypes.js` module bundles
correctly alongside the existing lazy `docxExport.js` chunk).

Run: `npm run test:e2e`
Expected: all tests pass, including the existing "Word export downloads a
.docx file" test — unaffected by which archetype the default template
(Minimalist) resolves to (`oneColumn`, unchanged from C1).

- [ ] **Step 7: Manual verification — one template per archetype**

Start the dev server (`npm run dev`), open the builder, load the demo CV,
and for each of these 5 templates: select it, export Word, open the
downloaded file in Word/LibreOffice/Google Docs (whichever is available):

- Minimalist (`oneColumn`) — confirm it looks identical to C1's original
  output (no regression).
- Executive (`railTable`, left) — confirm a real 2-column table, gold
  accent color on headings, secondary sections (skills etc.) in the left
  cell.
- Developer (`darkSidebarTable`) — confirm the left cell has a dark fill
  and its text is legible (not black-on-dark).
- Quadrant (`gridTable`) — confirm a real 2×2 grid with visible borders,
  cyan accent color on headings.
- European (`labelGridTable`) — confirm each section is a real label/value
  table, blue accent color on headings.

Also, for the Executive or Developer export specifically, temporarily add
a few extra Experience entries in the builder (enough to push past one
page) before exporting, to check the spec's "table page-break behavior"
risk — confirm the rail/main table doesn't produce a visibly broken page
break (a cell's content cut off mid-line, or one giant blank page). If it
looks fine, no further action is needed — the spec explicitly says not to
add `cantSplit`/row-height handling unless this shows it's actually
needed.

If any of these looks broken (not just "approximate," but genuinely wrong
— overlapping text, a missing section, an unreadable color), fix it before
continuing; this is a C2 bug per the spec's "C2 vs. C3, revised" section,
not deferred work.

- [ ] **Step 8: Commit**

```bash
git add src/utils/docxArchetypes.js src/utils/docxExport.js scripts/check-docx-export.mjs
git commit -m "Wire DOCX_ARCHETYPES into buildDocxDocument (styled Word export, C2/C3)"
```

---

### Task 6: Docs, changelog, version bump

**Files:**
- Modify: `changes.md`
- Modify: `docs/superpowers/specs/2026-09-09-v1.2.0-roadmap-design.md`
- Modify: `package.json`

**Interfaces:** none (docs/version only).

- [ ] **Step 1: Add a changes.md entry**

Add a new top entry to `changes.md`, above the most recent one, following
the file's established format (see the "New template: European" entry for
the exact style/depth expected) — summarize: the 5-archetype mapping, the
`withPalette` mechanism, the `parseSkillCategories`-avoidance correction
found during planning, and the check-script coverage added across Tasks
1–5.

- [ ] **Step 2: Mark C2/C3 done in the roadmap doc**

In `docs/superpowers/specs/2026-09-09-v1.2.0-roadmap-design.md`, find the
`## C. Word (`.docx`) export` section's C2/C3 bullets (added when C1
shipped) and add a `**DONE (v1.2.23, 2026-09-13).**` note, mirroring how
A.3's three sub-items were each marked done in this same file.

- [ ] **Step 3: Bump the version**

In `package.json`, bump `"version"` from the current value to the next
patch (confirm the current value first with `grep '"version"'
package.json` — do not assume it's still `1.2.22`, since this plan may run
after other work has landed).

- [ ] **Step 4: Commit**

```bash
git add changes.md docs/superpowers/specs/2026-09-09-v1.2.0-roadmap-design.md
git commit -m "Document styled Word export (C2/C3) in changes.md and the roadmap"
git add package.json
git commit -m "Bump version to 1.2.23"
```

(Two commits, matching this project's established convention of a
standalone version-bump commit separate from the feature/doc commit — see
`git log --oneline` for the pattern every prior roadmap item in this
session followed.)
