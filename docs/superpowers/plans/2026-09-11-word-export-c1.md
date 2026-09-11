# Word (.docx) Export — C1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fourth export option, **Word**, that produces a real, editable, ATS-friendly one-column `.docx` file built directly from CV data — no DOM, no screenshot, no template styling.

**Architecture:** A new pure-data module, `src/utils/docxExport.js`, walks the same `createCvSnapshot`/section-order/visibility machinery the existing PDF text-fallback (`exportCvAsPdfTextFallback` in `src/utils/exporters.js`) already uses, building `docx` library `Paragraph`/`Table` objects instead of `jsPDF` draw calls. Three small helpers already living in `exporters.js` (`createExportCopy`, `cropPhotoDataUrlToSquare`, `getPhotoDataUrl`) get exported so the new module can reuse them instead of duplicating bilingual copy or photo-cropping logic. The new module is wired into the export menu (`Toolbar.jsx` + `ResumeBuilderPage.jsx`) as a fourth, independently-lazy-loaded option — no worker, matching how JSON/HTML export already work (this is text/XML assembly, not the CPU-heavy rasterization PDF export needs a worker for).

**Tech Stack:** `docx` (npm, MIT, pinned to whatever `^9.x` `npm install docx` resolves — confirmed `9.7.1` as of this plan), reusing the app's existing `file-saver`, `createCvSnapshot`, `cvForm.js` helpers.

**Spec:** `docs/superpowers/specs/2026-09-11-word-export-c1-design.md` — read it alongside this plan; this plan is the spec's task breakdown, not a restatement of its reasoning.

## Global Constraints

- **No accent color, anywhere.** Every run's `color` is one of three near-black/gray tones defined once in Task 2 (`INK`, `INK_SUBTLE`) — no hue, matching the user's "fully monochrome" call in brainstorming. Word's default Heading/Title *styles* are still applied (for the Navigation Pane outline benefit) but every paragraph also carries an explicit `run`/`TextRun` color override, so the visual result is monochrome regardless of the installed Word theme.
- **CV export only, this plan.** No cover-letter `.docx` (tracked as a future follow-up in the spec).
- **No worker.** `docxExport.js` does a plain top-level `import { ... } from 'docx'`; laziness comes entirely from `ResumeBuilderPage.jsx`'s dynamic `import('../utils/docxExport')`, never a static import from the entry graph — the same principle `vite.config.js`'s existing comment documents for `html2canvas`/`jspdf`.
- **Multi-line description fields render as real Word bullets**, not one wrapped paragraph — a deliberate improvement over the PDF text-fallback, matching how every DOM Showcase in this app already treats `\n`-separated description text (`splitToBullets`-style).
- **Skills render as individual bullets** (one per skill), matching the PDF text-fallback's `drawFallbackBullets(pdf, snapshot.skills, ...)` precedent exactly — not a comma-joined line.
- **Page:** A4 (210 × 297mm), margins top 16mm / right 16mm / bottom 18mm / left 16mm — identical to the PDF export's ATS-mode margins (`PDF_MODES.ats.marginMm` in `exporters.js`), for consistency across export formats.
- Every new/modified file must pass `npm run lint`.
- Commit messages: plain, no `Co-Authored-By` trailer — this repo's commits carry only the user's own identity (an established, standing convention on this branch; every commit so far on `v1.2.0` follows it).

---

### Task 1: Add the `docx` dependency and export three reusable helpers from `exporters.js`

**Files:**
- Modify: `package.json`
- Modify: `src/utils/exporters.js:172` (`createExportCopy`), `src/utils/exporters.js:215` (`getPhotoDataUrl`), `src/utils/exporters.js:246` (`cropPhotoDataUrlToSquare`)

**Interfaces:**
- Produces: `export function createExportCopy(locale = 'en')` → the existing bilingual copy dictionary (`about`, `experience`, `skills`, … all ~25 keys), now importable from `./exporters`.
- Produces: `export function getPhotoDataUrl(value)` → returns the trimmed `data:image/(png|jpe?g);base64,...` string or `''`.
- Produces: `export async function cropPhotoDataUrlToSquare(dataUrl)` → returns a center-cropped, square `data:image/jpeg;base64,...` string (or the original `dataUrl` on any failure).

- [ ] **Step 1: Install `docx`**

Run:
```bash
npm install docx
```
This adds a `"docx": "^9.x.x"` line to `package.json`'s `dependencies` (alphabetically, between `@fontsource/lato` and `file-saver`) and updates `package-lock.json`.

- [ ] **Step 2: Export the three helpers**

In `src/utils/exporters.js`, change:
```js
function createExportCopy(locale = 'en') {
```
to:
```js
export function createExportCopy(locale = 'en') {
```

Change:
```js
function getPhotoDataUrl(value) {
```
to:
```js
export function getPhotoDataUrl(value) {
```

Change:
```js
async function cropPhotoDataUrlToSquare(dataUrl) {
```
to:
```js
export async function cropPhotoDataUrlToSquare(dataUrl) {
```

No other lines in `exporters.js` change — these three functions are unchanged internally, only newly exported.

- [ ] **Step 3: Verify nothing broke**

Run:
```bash
npm run lint && npm run build
```
Expected: both succeed with no errors (adding `export` to an already-defined function cannot break any existing caller inside the same file).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/utils/exporters.js
git commit -m "Add docx dependency, export createExportCopy/getPhotoDataUrl/cropPhotoDataUrlToSquare"
```

---

### Task 2: Create `docxExport.js` — the identity block

**Files:**
- Create: `src/utils/docxExport.js`
- Create: `scripts/check-docx-export.mjs`
- Modify: `package.json` (add a `check:docx-export` script)

**Interfaces:**
- Consumes: `getPhotoDataUrl`, `cropPhotoDataUrlToSquare` from `./exporters` (Task 1); `createExportCopy` from `./exporters` (Task 1, used only by the check script, not by this task's own source code); `createCvSnapshot` from `./cvSnapshot` (check script only); `demoCvData` from `./cvForm` (check script only).
- Produces (module-private, used by later tasks in this same file — not exported): the constants `INK`, `INK_SUBTLE`, `META_SIZE`, `NAME_SIZE`, `ROLE_SIZE`, `NO_BORDER`, `NO_CELL_BORDERS`, and the function `buildIdentityText(snapshot, copy)`.
- Produces (exported): `async function buildIdentityBlock(snapshot, copy, includePhoto)`.
- Produces: `async function buildIdentityBlock(snapshot, copy, includePhoto)` → `Promise<(Paragraph|Table)[]>`, used by Task 8's dispatcher.

- [ ] **Step 1: Write the failing check script**

Create `scripts/check-docx-export.mjs`:
```js
// Regression check for the docx export builders (src/utils/docxExport.js).
// Pure data-in, docx-object-out functions — no browser, no download — so
// they run the same way scripts/check-reducers.mjs does: import the real
// source module in plain Node and assert on its output.
//
//   node scripts/check-docx-export.mjs
//
// Exits non-zero if any check fails.

import { registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

// The app's source uses extensionless relative imports, which Vite resolves
// and bare Node does not.
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

const srcDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '../src')
const importSrc = (relativePath) => import(pathToFileURL(resolvePath(srcDir, relativePath)).href)

const { Paragraph } = await import('docx')
const { buildIdentityBlock } = await importSrc('utils/docxExport.js')
const { createExportCopy } = await importSrc('utils/exporters.js')
const { demoCvData } = await importSrc('utils/cvForm.js')
const { createCvSnapshot } = await importSrc('utils/cvSnapshot.js')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

console.log('\ndocxExport: identity block\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')
  const block = await buildIdentityBlock(snapshot, copy, false)
  check('returns an array', Array.isArray(block))
  check('has no photo table when includePhoto is false', block.length === 3)
  check('every entry is a real docx Paragraph', block.every((entry) => entry instanceof Paragraph))
}

{
  const snapshot = createCvSnapshot({ ...demoCvData, email: '', phone: '', location: '' })
  const copy = createExportCopy('en')
  const block = await buildIdentityBlock(snapshot, copy, false)
  check('drops the contact line entirely when there is no contact info', block.length === 2)
}

console.log(`\n${failures === 0 ? 'All docx export checks passed.' : `${failures} check(s) failed.`}`)
process.exit(failures === 0 ? 0 : 1)
```

- [ ] **Step 2: Add the npm script**

In `package.json`'s `"scripts"` block, add (alphabetically among the other `check:*` entries):
```json
    "check:docx-export": "node scripts/check-docx-export.mjs",
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm run check:docx-export`
Expected: FAIL — `Cannot find module '.../src/utils/docxExport.js'` (the module doesn't exist yet).

- [ ] **Step 4: Create `docxExport.js` with the identity block**

Create `src/utils/docxExport.js`. This task's own code only needs the identity/header block, so only the imports and constants that block actually uses are included here — `no-unused-vars` (part of this repo's `eslint.config.js` → `js.configs.recommended`) flags unused top-level bindings, imports included, so every task in this plan that touches this file adds only the imports/constants/functions its own new code exercises. Task 3 adds the shared paragraph-building primitives (`sectionHeading`, `boldLine`, etc.) at the point they're first used, rather than here.

```js
// Word (.docx) export — the ATS-friendly, one-column, monochrome document
// described in docs/superpowers/specs/2026-09-11-word-export-c1-design.md.
// Every section builder here is a pure function: (snapshot, copy) => a flat
// array of docx Paragraph/Table objects. No DOM, no screenshot, no template
// CSS — the document is assembled straight from the same CvData shape every
// other export reads, via createCvSnapshot. Section coverage, ordering and
// visibility rules mirror exportCvAsPdfTextFallback in exporters.js exactly
// (that function is this module's closest sibling — same data walk, aimed
// at docx objects instead of jsPDF draw calls).

import {
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
} from 'docx'
import { cropPhotoDataUrlToSquare, getPhotoDataUrl } from './exporters'

// Monochrome by design (see the spec) — no hue anywhere, just tonal
// hierarchy within near-black/gray, the same way the PDF text-fallback uses
// a few shades of one slate tone rather than one flat value.
const INK = '1A1A1A'
const INK_SUBTLE = '666666'

// Run sizes are in half-points (docx convention): 21 = 10.5pt.
const META_SIZE = 20
const NAME_SIZE = 40
const ROLE_SIZE = 24

const NO_BORDER = { style: BorderStyle.NONE }
const NO_CELL_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }

function buildIdentityText(snapshot, copy) {
  const nameText = snapshot.fullName || copy.yourName
  const titleText = snapshot.title || copy.professionalTitle
  const contactParts = [snapshot.email, snapshot.phone, snapshot.location].filter(Boolean)

  const paragraphs = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 40 },
      children: [new TextRun({ text: nameText, bold: true, size: NAME_SIZE, color: INK })],
    }),
    new Paragraph({
      spacing: { after: contactParts.length > 0 ? 120 : 240 },
      children: [new TextRun({ text: titleText, size: ROLE_SIZE, color: INK_SUBTLE })],
    }),
  ]

  if (contactParts.length > 0) {
    paragraphs.push(new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun({ text: contactParts.join('  ·  '), size: META_SIZE, color: INK_SUBTLE })],
    }))
  }

  return paragraphs
}

function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// Photo, when the template shows one: a borderless 2-cell table (identity
// text left, photo right) — docx has no flex/grid, this is the standard
// way to float an image beside text without fighting older Word layout
// engines. Skipped entirely (plain paragraphs only) when there's no photo.
export async function buildIdentityBlock(snapshot, copy, includePhoto) {
  const identityParagraphs = buildIdentityText(snapshot, copy)
  const rawPhotoDataUrl = includePhoto ? getPhotoDataUrl(snapshot.photo) : ''

  if (!rawPhotoDataUrl) {
    return identityParagraphs
  }

  const croppedDataUrl = await cropPhotoDataUrlToSquare(rawPhotoDataUrl)
  const photoBytes = dataUrlToUint8Array(croppedDataUrl)

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              borders: NO_CELL_BORDERS,
              children: identityParagraphs,
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: NO_CELL_BORDERS,
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new ImageRun({
                  type: 'jpg',
                  data: photoBytes,
                  transformation: { width: 79, height: 79 },
                })],
              })],
            }),
          ],
        }),
      ],
    }),
  ]
}
```

- [ ] **Step 5: Run lint and the check script to verify both pass**

Run: `npm run lint && npm run check:docx-export`
Expected: lint passes (every import/constant/function this step added is used by `buildIdentityText`/`buildIdentityBlock`); check output:
```
docxExport: identity block

ok    returns an array
ok    has no photo table when includePhoto is false
ok    every entry is a real docx Paragraph
ok    drops the contact line entirely when there is no contact info

All docx export checks passed.
```

- [ ] **Step 6: Commit**

```bash
git add src/utils/docxExport.js scripts/check-docx-export.mjs package.json
git commit -m "Add the docx identity/header block"
```

---

### Task 3: Core narrative sections — About, Skills, Experience, Education

**Files:**
- Modify: `src/utils/docxExport.js`
- Modify: `scripts/check-docx-export.mjs`

**Interfaces:**
- Consumes: `INK`, `INK_SUBTLE` (Task 2, same file); `formatDateRange` from `./shared` (newly imported this task).
- Produces (module-private, used by later tasks in this same file — not exported): `sectionHeading(text)`, `boldLine(text, opts)`, `plainLine(text, opts)`, `bulletLines(items)`, `emptyNotice(text)`, `descriptionLines(text)`, the constants `BODY_SIZE`, `SUBHEAD_SIZE`, `HEADING_SIZE`. These six primitives are introduced in this task rather than Task 2 because this is the first task whose section builders actually use all of them — an unused top-level function is exactly as lint-flagged as an unused import, so every primitive is added in the task that first calls it.
- Produces (exported): `buildAboutSection(snapshot, copy)`, `buildSkillsSection(snapshot, copy)`, `buildExperienceSection(snapshot, copy)`, `buildEducationSection(snapshot, copy)` — each `(CvSnapshot, ExportCopy) => Paragraph[]`.

- [ ] **Step 1: Extend the check script**

Add to `scripts/check-docx-export.mjs`, after the identity-block imports, add:
```js
const {
  buildAboutSection,
  buildSkillsSection,
  buildExperienceSection,
  buildEducationSection,
} = await importSrc('utils/docxExport.js')
```
(Fold this into the existing `docxExport.js` import statement rather than a second one.)

Then, before the final `console.log`/`process.exit` lines, add:
```js
console.log('\ndocxExport: core narrative sections\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')

  const about = buildAboutSection(snapshot, copy)
  check('About: heading + one body paragraph for the demo CV', about.length === 2)

  const skills = buildSkillsSection(snapshot, copy)
  check('Skills: heading + one bullet per skill', skills.length === 1 + demoCvData.skills.length)

  const experience = buildExperienceSection(snapshot, copy)
  check('Experience: at least a heading plus one entry', experience.length > 1)

  const education = buildEducationSection(snapshot, copy)
  check('Education: at least a heading plus one entry', education.length > 1)
}

{
  const blankSnapshot = createCvSnapshot(createInitialCvData())
  const copy = createExportCopy('en')

  const about = buildAboutSection(blankSnapshot, copy)
  check('About falls back to "Add a professional summary" placeholder copy', about.length === 2)

  const skills = buildSkillsSection(blankSnapshot, copy)
  check('Skills falls back to a single placeholder line when empty', skills.length === 2)

  const experience = buildExperienceSection(blankSnapshot, copy)
  check('Experience falls back to a single placeholder line when empty', experience.length === 2)

  const education = buildEducationSection(blankSnapshot, copy)
  check('Education falls back to a single placeholder line when empty', education.length === 2)
}
```

Also add `createInitialCvData` to the existing `cvForm.js` import line:
```js
const { demoCvData, createInitialCvData } = await importSrc('utils/cvForm.js')
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run check:docx-export`
Expected: FAIL — `buildAboutSection is not a function` (not exported yet).

- [ ] **Step 3: Implement the six shared primitives and the four section builders**

In `src/utils/docxExport.js`, add a new import line for `formatDateRange`:
```js
import { formatDateRange } from './shared'
```

Add three more size constants, right after the existing `META_SIZE`/`NAME_SIZE`/`ROLE_SIZE` block:
```js
const BODY_SIZE = 21
const SUBHEAD_SIZE = 22
const HEADING_SIZE = 24
```

Append the six shared primitives after `buildIdentityBlock` (every section builder in Tasks 3–7 is built out of these five plus `descriptionLines`):
```js
function sectionHeading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: HEADING_SIZE, color: INK })],
  })
}

function boldLine(text, opts = {}) {
  if (!text) {
    return null
  }
  return new Paragraph({
    spacing: { after: opts.after ?? 40 },
    children: [new TextRun({ text, bold: true, size: opts.size ?? SUBHEAD_SIZE, color: INK })],
  })
}

function plainLine(text, opts = {}) {
  if (!text) {
    return null
  }
  return new Paragraph({
    spacing: { after: opts.after ?? 160 },
    children: [new TextRun({
      text,
      size: opts.size ?? BODY_SIZE,
      color: opts.subtle ? INK_SUBTLE : INK,
      italics: opts.italics ?? false,
    })],
  })
}

function bulletLines(items) {
  return items.map((item) => new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text: item, size: BODY_SIZE, color: INK })],
  }))
}

function emptyNotice(text) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text, size: BODY_SIZE, color: INK_SUBTLE, italics: true })],
  })
}

// Multi-line fields (experience/internship descriptions, etc.) render as
// real bullets when they have more than one line, matching how every DOM
// Showcase already treats these \n-separated fields — a deliberate
// improvement over the PDF text-fallback's single-wrapped-paragraph
// approach (see Global Constraints in the plan).
function descriptionLines(text) {
  if (!text) {
    return []
  }
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  return lines.length > 1 ? bulletLines(lines) : [plainLine(lines[0])]
}
```

Then append the four section builders:
```js
export function buildAboutSection(snapshot, copy) {
  const body = snapshot.about ? plainLine(snapshot.about) : emptyNotice(copy.addSummary)
  return [sectionHeading(copy.about), body]
}

export function buildSkillsSection(snapshot, copy) {
  if (snapshot.skills.length === 0) {
    return [sectionHeading(copy.skills), emptyNotice(copy.addSkills)]
  }
  return [sectionHeading(copy.skills), ...bulletLines(snapshot.skills)]
}

export function buildExperienceSection(snapshot, copy) {
  if (snapshot.experience.length === 0) {
    return [sectionHeading(copy.experience), emptyNotice(copy.noExperience)]
  }
  const entries = snapshot.experience.flatMap((item) => {
    const heading = [item.role, item.company].filter(Boolean).join(' @ ') || copy.untitledRole
    const dateRange = formatDateRange(item.startDate, item.endDate)
    return [
      boldLine(heading),
      dateRange ? plainLine(dateRange, { subtle: true, size: META_SIZE, after: 120 }) : null,
      ...descriptionLines(item.description),
    ].filter(Boolean)
  })
  return [sectionHeading(copy.experience), ...entries]
}

export function buildEducationSection(snapshot, copy) {
  if (snapshot.education.length === 0) {
    return [sectionHeading(copy.education), emptyNotice(copy.noEducation)]
  }
  const entries = snapshot.education.flatMap((item) => {
    const heading = [item.degree, item.school].filter(Boolean).join(', ') || copy.educationEntry
    const dateRange = formatDateRange(item.startDate, item.endDate)
    const gradeLine = [item.grade, item.coursework].filter(Boolean).join(' · ')
    return [
      boldLine(heading),
      dateRange ? plainLine(dateRange, { subtle: true, size: META_SIZE }) : null,
      item.honors ? plainLine(item.honors, { subtle: true, size: META_SIZE }) : null,
      gradeLine ? plainLine(gradeLine, { subtle: true, size: META_SIZE, after: 160 }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.education), ...entries]
}
```

- [ ] **Step 4: Run lint and the check script**

Run: `npm run lint && npm run check:docx-export`
Expected: lint passes (every new import/constant/function is used); check output shows every new check under "docxExport: core narrative sections" printing `ok`, ending with `All docx export checks passed.`

- [ ] **Step 5: Commit**

```bash
git add src/utils/docxExport.js scripts/check-docx-export.mjs
git commit -m "Add the shared docx paragraph primitives and About/Skills/Experience/Education section builders"
```

---

### Task 4: List-shaped sections — Links, Languages, Interests, Core Strengths

**Files:**
- Modify: `src/utils/docxExport.js`
- Modify: `scripts/check-docx-export.mjs`

**Interfaces:**
- Consumes: `sectionHeading`, `boldLine`, `plainLine`, `emptyNotice` (Task 3); `formatLinkLabel`, `formatLinkDisplayValue` (`./shared`, newly imported this task).
- Produces: `export function buildLinksSection`, `buildLanguagesSection`, `buildInterestsSection`, `buildCoreStrengthsSection` — each `(CvSnapshot, ExportCopy) => Paragraph[]`.

- [ ] **Step 1: Extend the check script**

Add to the `docxExport.js` import destructure:
```js
buildLinksSection,
buildLanguagesSection,
buildInterestsSection,
buildCoreStrengthsSection,
```

Add before the final summary lines:
```js
console.log('\ndocxExport: list-shaped sections\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')

  const links = buildLinksSection(snapshot, copy)
  check('Links: heading + one line per link', links.length === 1 + Object.keys(snapshot.links).length)

  const languages = buildLanguagesSection(snapshot, copy)
  check('Languages: heading + one line per language', languages.length === 1 + snapshot.languages.length)

  const interests = buildInterestsSection(snapshot, copy)
  check('Interests: heading + one joined line', interests.length === 2)

  const coreStrengths = buildCoreStrengthsSection(snapshot, copy)
  check('Core Strengths: at least a heading plus one entry', coreStrengths.length > 1)
}

{
  const blankSnapshot = createCvSnapshot(createInitialCvData())
  const copy = createExportCopy('en')

  const links = buildLinksSection(blankSnapshot, copy)
  check('Links falls back to a single placeholder line when empty', links.length === 2)

  const interests = buildInterestsSection(blankSnapshot, copy)
  check('Interests renders just the heading when empty', interests.length === 1)
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run check:docx-export`
Expected: FAIL — `buildLinksSection is not a function`.

- [ ] **Step 3: Implement the four section builders**

Re-add the two link helpers to the `./shared` import (now both are used):
```js
import { formatDateRange, formatLinkLabel, formatLinkDisplayValue } from './shared'
```

Append:
```js
export function buildLinksSection(snapshot, copy) {
  const links = Object.entries(snapshot.links)
  if (links.length === 0) {
    return [sectionHeading(copy.links), emptyNotice(copy.noLinks)]
  }
  const lines = links.map(([key, value]) => plainLine(`${formatLinkLabel(key)}: ${formatLinkDisplayValue(value)}`))
  return [sectionHeading(copy.links), ...lines]
}

export function buildLanguagesSection(snapshot, copy) {
  const lines = snapshot.languages.map((item) => plainLine(item.level ? `${item.language} — ${item.level}` : item.language))
  return [sectionHeading(copy.languages), ...lines]
}

export function buildInterestsSection(snapshot, copy) {
  if (snapshot.interests.length === 0) {
    return [sectionHeading(copy.interests)]
  }
  return [sectionHeading(copy.interests), plainLine(snapshot.interests.map((item) => item.name).join('  ·  '))]
}

export function buildCoreStrengthsSection(snapshot, copy) {
  const entries = snapshot.coreStrengths.flatMap((item) => [
    boldLine(item.title),
    plainLine(item.description),
  ].filter(Boolean))
  return [sectionHeading(copy.coreStrengths), ...entries]
}
```

- [ ] **Step 4: Run lint and the check script**

Run: `npm run lint && npm run check:docx-export`
Expected: both pass, every new check prints `ok`.

- [ ] **Step 5: Commit**

```bash
git add src/utils/docxExport.js scripts/check-docx-export.mjs
git commit -m "Add Links/Languages/Interests/Core Strengths docx section builders"
```

---

### Task 5: Achievement-shaped sections — Certificates, Achievements, Memberships, Publications

**Files:**
- Modify: `src/utils/docxExport.js`
- Modify: `scripts/check-docx-export.mjs`

**Interfaces:**
- Consumes: `sectionHeading`, `boldLine`, `plainLine`, `bulletLines`, `META_SIZE` (Task 3).
- Produces: `export function buildCertificatesSection`, `buildAchievementsSection`, `buildMembershipsSection`, `buildPublicationsSection` — each `(CvSnapshot, ExportCopy) => Paragraph[]`.

- [ ] **Step 1: Extend the check script**

Add to the `docxExport.js` import destructure:
```js
buildCertificatesSection,
buildAchievementsSection,
buildMembershipsSection,
buildPublicationsSection,
```

Add before the final summary lines:
```js
console.log('\ndocxExport: achievement-shaped sections\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')

  const certificates = buildCertificatesSection(snapshot, copy)
  check('Certificates: heading + one bullet per certificate', certificates.length === 1 + demoCvData.certificates.length)

  const achievements = buildAchievementsSection(snapshot, copy)
  check('Achievements: at least a heading plus one entry', achievements.length > 1)

  const memberships = buildMembershipsSection(snapshot, copy)
  check('Memberships: heading + one bullet per membership', memberships.length === 1 + demoCvData.memberships.length)

  const publications = buildPublicationsSection(snapshot, copy)
  check('Publications: at least a heading plus one entry', publications.length > 1)
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run check:docx-export`
Expected: FAIL — `buildCertificatesSection is not a function`.

- [ ] **Step 3: Implement the four section builders**

Append:
```js
export function buildCertificatesSection(snapshot, copy) {
  if (snapshot.certificates.length === 0) {
    return [sectionHeading(copy.certificates)]
  }
  const lines = snapshot.certificates.map((item) => {
    const meta = [item.issuer, item.year].filter(Boolean).join(', ')
    const expiry = item.expiry ? ` (expires ${item.expiry})` : ''
    return (meta ? `${item.name} — ${meta}` : item.name) + expiry
  })
  return [sectionHeading(copy.certificates), ...bulletLines(lines)]
}

export function buildAchievementsSection(snapshot, copy) {
  const entries = snapshot.achievements.flatMap((item) => {
    const heading = item.year ? `${item.title}  —  ${item.year}` : item.title
    return [boldLine(heading), plainLine(item.description)].filter(Boolean)
  })
  return [sectionHeading(copy.achievements), ...entries]
}

export function buildMembershipsSection(snapshot, copy) {
  if (snapshot.memberships.length === 0) {
    return [sectionHeading(copy.memberships)]
  }
  const lines = snapshot.memberships.map((item) => {
    const meta = [item.role, item.year].filter(Boolean).join(', ')
    return meta ? `${item.organization} — ${meta}` : item.organization
  })
  return [sectionHeading(copy.memberships), ...bulletLines(lines)]
}

export function buildPublicationsSection(snapshot, copy) {
  const entries = snapshot.publications.flatMap((item) => {
    const meta = [item.publisher, item.year].filter(Boolean).join(' · ')
    return [
      boldLine(item.title),
      meta ? plainLine(meta, { subtle: true, size: META_SIZE }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.publications), ...entries]
}
```

- [ ] **Step 4: Run lint and the check script**

Run: `npm run lint && npm run check:docx-export`
Expected: both pass, every new check prints `ok`.

- [ ] **Step 5: Commit**

```bash
git add src/utils/docxExport.js scripts/check-docx-export.mjs
git commit -m "Add Certificates/Achievements/Memberships/Publications docx section builders"
```

---

### Task 6: Career-narrative sections — Projects, Open Source, Leadership, Speaking, Volunteering, Internships

**Files:**
- Modify: `src/utils/docxExport.js`
- Modify: `scripts/check-docx-export.mjs`

**Interfaces:**
- Consumes: `sectionHeading`, `boldLine`, `plainLine`, `descriptionLines`, `formatDateRange`, `META_SIZE` (Task 3).
- Produces: `export function buildProjectsSection`, `buildOpenSourceSection`, `buildLeadershipSection`, `buildSpeakingSection`, `buildVolunteeringSection`, `buildInternshipsSection` — each `(CvSnapshot, ExportCopy) => Paragraph[]`.

- [ ] **Step 1: Extend the check script**

Add to the `docxExport.js` import destructure:
```js
buildProjectsSection,
buildOpenSourceSection,
buildLeadershipSection,
buildSpeakingSection,
buildVolunteeringSection,
buildInternshipsSection,
```

Add before the final summary lines:
```js
console.log('\ndocxExport: career-narrative sections\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')

  const sections = [
    ['Projects', buildProjectsSection, demoCvData.projects],
    ['Open Source', buildOpenSourceSection, demoCvData.openSource],
    ['Leadership', buildLeadershipSection, demoCvData.leadership],
    ['Speaking', buildSpeakingSection, demoCvData.speaking],
    ['Volunteering', buildVolunteeringSection, demoCvData.volunteering],
    ['Internships', buildInternshipsSection, demoCvData.internships],
  ]

  sections.forEach(([label, build, sourceData]) => {
    const result = build(snapshot, copy)
    check(`${label}: at least a heading plus one entry per item`, result.length >= 1 + sourceData.length)
  })
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run check:docx-export`
Expected: FAIL — `buildProjectsSection is not a function`.

- [ ] **Step 3: Implement the six section builders**

Append:
```js
export function buildProjectsSection(snapshot, copy) {
  const entries = snapshot.projects.flatMap((item) => {
    const contributionLine = [item.teamSize, item.contribution].filter(Boolean).join(' · ')
    const linkLine = [item.githubUrl, item.demoUrl].filter(Boolean).join('  ·  ')
    return [
      boldLine(item.name),
      item.organization ? plainLine(item.organization, { subtle: true, size: META_SIZE }) : null,
      plainLine(item.description),
      item.impact ? boldLine(item.impact, { size: META_SIZE }) : null,
      contributionLine ? plainLine(contributionLine, { subtle: true, size: META_SIZE }) : null,
      item.stack ? plainLine(item.stack, { subtle: true, size: META_SIZE }) : null,
      linkLine ? plainLine(linkLine, { subtle: true, size: META_SIZE, after: 240 }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.projects), ...entries]
}

export function buildOpenSourceSection(snapshot, copy) {
  const entries = snapshot.openSource.flatMap((item) => {
    const meta = [item.language, item.stars ? `★ ${item.stars}` : '', item.forks ? `⑂ ${item.forks}` : '']
      .filter(Boolean)
      .join('   ')
    return [
      boldLine(item.name),
      meta ? plainLine(meta, { subtle: true, size: META_SIZE }) : null,
      plainLine(item.description),
    ].filter(Boolean)
  })
  return [sectionHeading(copy.openSource), ...entries]
}

export function buildLeadershipSection(snapshot, copy) {
  const entries = snapshot.leadership.flatMap((item) => {
    const heading = [item.role, item.organization].filter(Boolean).join(' — ')
    const dateRange = formatDateRange(item.startDate, item.endDate)
    return [
      boldLine(heading),
      dateRange ? plainLine(dateRange, { subtle: true, size: META_SIZE }) : null,
      plainLine(item.description),
    ].filter(Boolean)
  })
  return [sectionHeading(copy.leadership), ...entries]
}

export function buildSpeakingSection(snapshot, copy) {
  const entries = snapshot.speaking.flatMap((item) => {
    const meta = [item.conference, item.date].filter(Boolean).join(' · ')
    return [
      boldLine(item.topic),
      meta ? plainLine(meta, { subtle: true, size: META_SIZE }) : null,
      item.audience ? plainLine(item.audience, { subtle: true, size: META_SIZE }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.speaking), ...entries]
}

export function buildVolunteeringSection(snapshot, copy) {
  const entries = snapshot.volunteering.flatMap((item) => {
    const heading = [item.role, item.organization].filter(Boolean).join(' — ')
    return [boldLine(heading), plainLine(item.description)].filter(Boolean)
  })
  return [sectionHeading(copy.volunteering), ...entries]
}

export function buildInternshipsSection(snapshot, copy) {
  if (snapshot.internships.length === 0) {
    return [sectionHeading(copy.internships)]
  }
  const entries = snapshot.internships.flatMap((item) => {
    const heading = [item.role, item.company].filter(Boolean).join(' @ ') || copy.untitledRole
    const dateRange = formatDateRange(item.startDate, item.endDate)
    return [
      boldLine(heading),
      dateRange ? plainLine(dateRange, { subtle: true, size: META_SIZE }) : null,
      ...descriptionLines(item.description),
      item.technologies ? plainLine(item.technologies, { subtle: true, size: META_SIZE }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.internships), ...entries]
}
```

- [ ] **Step 4: Run lint and the check script**

Run: `npm run lint && npm run check:docx-export`
Expected: both pass, every new check prints `ok`.

- [ ] **Step 5: Commit**

```bash
git add src/utils/docxExport.js scripts/check-docx-export.mjs
git commit -m "Add Projects/OpenSource/Leadership/Speaking/Volunteering/Internships docx section builders"
```

---

### Task 7: Case Studies and Testimonials

**Files:**
- Modify: `src/utils/docxExport.js`
- Modify: `scripts/check-docx-export.mjs`

**Interfaces:**
- Consumes: `sectionHeading`, `boldLine`, `plainLine`, `META_SIZE` (Task 3).
- Produces: `export function buildCaseStudiesSection`, `buildTestimonialsSection` — each `(CvSnapshot, ExportCopy) => Paragraph[]`.

- [ ] **Step 1: Extend the check script**

Add to the `docxExport.js` import destructure:
```js
buildCaseStudiesSection,
buildTestimonialsSection,
```

Add before the final summary lines:
```js
console.log('\ndocxExport: case studies and testimonials\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')

  const caseStudies = buildCaseStudiesSection(snapshot, copy)
  check('Case Studies: at least a heading plus one entry', caseStudies.length > 1)

  const testimonials = buildTestimonialsSection(snapshot, copy)
  check('Testimonials: at least a heading plus one entry', testimonials.length > 1)
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run check:docx-export`
Expected: FAIL — `buildCaseStudiesSection is not a function`.

- [ ] **Step 3: Implement the two section builders**

Append:
```js
export function buildCaseStudiesSection(snapshot, copy) {
  const entries = snapshot.caseStudies.flatMap((item) => {
    const rows = [
      [copy.problem, item.problem],
      [copy.solution, item.solution],
      [copy.technologies, item.technologies],
      [copy.outcome, item.outcome],
      [copy.lessonsLearned, item.lessons],
    ].filter(([, value]) => value)
    return [
      boldLine(item.title),
      ...rows.map(([label, value]) => plainLine(`${label}: ${value}`)),
    ].filter(Boolean)
  })
  return [sectionHeading(copy.caseStudies), ...entries]
}

export function buildTestimonialsSection(snapshot, copy) {
  const entries = snapshot.testimonials.flatMap((item) => {
    const meta = [item.author, item.role].filter(Boolean).join(', ')
    return [
      item.quote ? plainLine(`“${item.quote}”`, { italics: true }) : null,
      meta ? plainLine(meta, { subtle: true, size: META_SIZE, after: 240 }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.testimonials), ...entries]
}
```

- [ ] **Step 4: Run lint and the check script**

Run: `npm run lint && npm run check:docx-export`
Expected: both pass, every new check prints `ok`.

- [ ] **Step 5: Commit**

```bash
git add src/utils/docxExport.js scripts/check-docx-export.mjs
git commit -m "Add Case Studies and Testimonials docx section builders"
```

---

### Task 8: The document dispatcher and public export functions

**Files:**
- Modify: `src/utils/docxExport.js`
- Modify: `scripts/check-docx-export.mjs`

**Interfaces:**
- Consumes: every `buildXSection` function from Tasks 3–7, plus `buildIdentityBlock` (Task 2); `Document`, `Packer`, `convertMillimetersToTwip` (`docx`); `saveAs` (`file-saver`); `defaultTemplateId`, `getCvTemplate` (`./cvTemplates`); `createSectionVisibility`, `normalizeSectionOrder`, `isPhotoVisibleForTemplate` (`./cvForm`); `createCvSnapshot` (`./cvSnapshot`); `createExportCopy` (`./exporters`).
- Produces: `export async function buildDocxDocument(formData, options = {})` → `Promise<Document>` — `options: { template?: string, locale?: string }`. `export async function exportCvAsDocx(formData, fileName, options = {})` → `Promise<void>`, triggers a `saveAs` download of `${fileName}.docx`.

- [ ] **Step 1: Extend the check script — the full pipeline**

Add `Packer` to the existing `import { Paragraph } from 'docx'` line (make it `import { Paragraph, Packer } from 'docx'`), and add `buildDocxDocument` to the `docxExport.js` destructure.

Add before the final summary lines:
```js
console.log('\ndocxExport: full document assembly\n')

{
  const doc = await buildDocxDocument(demoCvData, { template: 'modern', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)
  check('produces a non-empty buffer for the demo CV', buffer.length > 0)
  check('produces a real ZIP container (.docx magic bytes)', buffer[0] === 0x50 && buffer[1] === 0x4b)
}

{
  const doc = await buildDocxDocument(createInitialCvData(), { template: 'minimal', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)
  check('builds successfully from a blank CV (every section on placeholder copy)', buffer.length > 0)
}

{
  const doc = await buildDocxDocument(demoCvData, { template: 'modern', locale: 'fi' })
  const buffer = await Packer.toBuffer(doc)
  check('builds successfully in Finnish locale', buffer.length > 0)
}

{
  const doc = await buildDocxDocument(demoCvData, { template: 'timeline', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)
  check('builds successfully for a template with a different section order', buffer.length > 0)
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run check:docx-export`
Expected: FAIL — `buildDocxDocument is not a function`.

- [ ] **Step 3: Implement the dispatcher and public functions**

Update the import block at the top of `src/utils/docxExport.js` to add `Document`, `Packer`, and `convertMillimetersToTwip` to the existing `docx` import, and add the four new import lines below it — the full resulting import block reads:
```js
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  convertMillimetersToTwip,
} from 'docx'
import { saveAs } from 'file-saver'
import { defaultTemplateId, getCvTemplate } from './cvTemplates'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from './cvForm'
import { createCvSnapshot } from './cvSnapshot'
import { formatDateRange, formatLinkLabel, formatLinkDisplayValue } from './shared'
import { createExportCopy, cropPhotoDataUrlToSquare, getPhotoDataUrl } from './exporters'
```

Append, at the end of the file:
```js
const PAGE_MARGIN_MM = { top: 16, right: 16, bottom: 18, left: 16 }

export async function buildDocxDocument(formData, options = {}) {
  const { template = defaultTemplateId, locale = 'en' } = options
  const snapshot = createCvSnapshot(formData)
  const copy = createExportCopy(locale)
  const templateConfig = getCvTemplate(template)
  const sectionVisibility = { ...createSectionVisibility(), ...(formData.sectionVisibility ?? {}) }
  const templateSectionOrder = [...templateConfig.primarySections, ...templateConfig.secondarySections]
  const sectionOrder = normalizeSectionOrder(formData.sectionOrder, templateSectionOrder)
  const isVisible = (section) => sectionVisibility[section] !== false
  const includePhoto = isPhotoVisibleForTemplate(formData.photoVisibilityByTemplate, templateConfig.id)

  const sectionBuilders = {
    about: () => buildAboutSection(snapshot, copy),
    skills: () => buildSkillsSection(snapshot, copy),
    experience: () => buildExperienceSection(snapshot, copy),
    education: () => buildEducationSection(snapshot, copy),
    links: () => buildLinksSection(snapshot, copy),
    languages: () => buildLanguagesSection(snapshot, copy),
    interests: () => buildInterestsSection(snapshot, copy),
    coreStrengths: () => buildCoreStrengthsSection(snapshot, copy),
    certificates: () => buildCertificatesSection(snapshot, copy),
    achievements: () => buildAchievementsSection(snapshot, copy),
    memberships: () => buildMembershipsSection(snapshot, copy),
    publications: () => buildPublicationsSection(snapshot, copy),
    projects: () => buildProjectsSection(snapshot, copy),
    openSource: () => buildOpenSourceSection(snapshot, copy),
    leadership: () => buildLeadershipSection(snapshot, copy),
    speaking: () => buildSpeakingSection(snapshot, copy),
    volunteering: () => buildVolunteeringSection(snapshot, copy),
    internships: () => buildInternshipsSection(snapshot, copy),
    caseStudies: () => buildCaseStudiesSection(snapshot, copy),
    testimonials: () => buildTestimonialsSection(snapshot, copy),
  }

  const renderedSections = new Set()
  const children = [...(await buildIdentityBlock(snapshot, copy, includePhoto))]

  const appendSection = (section) => {
    const build = sectionBuilders[section]
    if (build && !renderedSections.has(section) && isVisible(section)) {
      children.push(...build())
      renderedSections.add(section)
    }
  }

  sectionOrder.forEach(appendSection)
  Object.keys(sectionBuilders).forEach(appendSection)

  return new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: convertMillimetersToTwip(210),
            height: convertMillimetersToTwip(297),
          },
          margin: {
            top: convertMillimetersToTwip(PAGE_MARGIN_MM.top),
            right: convertMillimetersToTwip(PAGE_MARGIN_MM.right),
            bottom: convertMillimetersToTwip(PAGE_MARGIN_MM.bottom),
            left: convertMillimetersToTwip(PAGE_MARGIN_MM.left),
          },
        },
      },
      children,
    }],
  })
}

export async function exportCvAsDocx(formData, fileName, options = {}) {
  const doc = await buildDocxDocument(formData, options)
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${fileName}.docx`)
}
```

- [ ] **Step 4: Run lint and the check script**

Run: `npm run lint && npm run check:docx-export`
Expected: both pass; the full check output (all tasks' checks together) ends with `All docx export checks passed.`

- [ ] **Step 5: Commit**

```bash
git add src/utils/docxExport.js scripts/check-docx-export.mjs
git commit -m "Add the docx document dispatcher and exportCvAsDocx/buildDocxDocument"
```

---

### Task 9: Wire "Word" into the export menu

**Files:**
- Modify: `src/components/Toolbar.jsx:344-355` (after the JSON menu item)
- Modify: `src/pages/ResumeBuilderPage.jsx:669-786` (`handleExport`)

**Interfaces:**
- Consumes: `exportCvAsDocx` from `../utils/docxExport` (Task 8).
- Produces: clicking "Word" in the export menu downloads `<fileName>.docx`.

- [ ] **Step 1: Add the menu item**

In `src/components/Toolbar.jsx`, immediately after the JSON `<button>` (the one calling `handleExportSelect('json')`) and before the closing `</div>` of `app-toolbar__export-menu`, add:
```jsx
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__export-item"
                  disabled={isActionBusy}
                  onClick={() => handleExportSelect('docx')}
                >
                  Word
                  <span className="app-toolbar__export-item-hint">
                    {isFinnish
                      ? 'Muokattava .docx, toimii kaikkien ATS-järjestelmien kanssa'
                      : 'Editable .docx, works with any ATS'}
                  </span>
                </button>
```
No other change is needed in this file — `handleExportMenuKeyDown`'s arrow-key/Home/End navigation already reads `items.length` dynamically from `querySelectorAll('[role="menuitem"]')`, so a fourth item needs no extra wiring there.

- [ ] **Step 2: Add the `'docx'` branch to `handleExport`**

In `src/pages/ResumeBuilderPage.jsx`, the `handleExport` callback currently has:
```js
    const exportLabel =
      type === 'pdf-designer'
        ? atsFriendlyMode
          ? 'ATS PDF'
          : 'Designer PDF'
        : type === 'html'
          ? 'HTML'
          : 'JSON'

    const toastLabel =
      type === 'pdf-designer'
        ? locale === 'fi' ? 'Valmistellaan PDF-vientiä...' : 'Preparing PDF export...'
        : type === 'html'
          ? locale === 'fi' ? 'Valmistellaan HTML-vientiä...' : 'Preparing HTML export...'
          : locale === 'fi' ? 'Valmistellaan JSON-vientiä...' : 'Preparing JSON export...'
```
Change to:
```js
    const exportLabel =
      type === 'pdf-designer'
        ? atsFriendlyMode
          ? 'ATS PDF'
          : 'Designer PDF'
        : type === 'html'
          ? 'HTML'
          : type === 'docx'
            ? 'Word'
            : 'JSON'

    const toastLabel =
      type === 'pdf-designer'
        ? locale === 'fi' ? 'Valmistellaan PDF-vientiä...' : 'Preparing PDF export...'
        : type === 'html'
          ? locale === 'fi' ? 'Valmistellaan HTML-vientiä...' : 'Preparing HTML export...'
          : type === 'docx'
            ? locale === 'fi' ? 'Valmistellaan Word-vientiä...' : 'Preparing Word export...'
            : locale === 'fi' ? 'Valmistellaan JSON-vientiä...' : 'Preparing JSON export...'
```

Then, right after:
```js
      if (type === 'html') {
        exportCvAsHtml(formData, exportFileName, { locale })
      }
```
add:
```js

      if (type === 'docx') {
        const { exportCvAsDocx } = await import('../utils/docxExport')
        await exportCvAsDocx(formData, exportFileName, { template: selectedTemplate, locale })
      }
```
This mirrors the `'json'`/`'html'` branches — no preview-sync waiting (those two `waitForPreviewModeSync`/`waitForPreviewVariantSync` calls are scoped to `type === 'pdf-designer'` only, a few lines above; `docx`, like `json`/`html`, doesn't read the DOM at all). `docxExport.js` is dynamically imported here specifically (not folded into the existing `await import('../utils/exporters')` a few lines above it) so its own async chunk — carrying the `docx` package — stays fully independent of the PDF/HTML/JSON chunk, never fetched unless the user actually picks Word.

The existing `try`/`catch`/`finally` around all of this, and the `showToast`/`SET_ACTIVE_EXPORT` calls before and after, need no changes — they already key off the generic `type`/`exportLabel`/`toastLabel` values this step just extended.

- [ ] **Step 3: Manual verification**

Run:
```bash
npm run dev
```
Open the app, load the demo CV, open the export menu (now 4 items: PDF, HTML, JSON, Word), click **Word**. Confirm a `.docx` file downloads, open it in Word/LibreOffice/Google Docs, and confirm:
- The Navigation Pane (or equivalent outline view) shows every visible section as a real heading.
- Name, role, contact line, and every section render with the expected content, all in shades of black/gray — no color anywhere.
- Switch to a template that shows a photo (e.g. Modern Orange with a photo uploaded), export again, confirm the photo renders top-right and isn't stretched.
- Switch the toolbar language to Finnish, export again, confirm section headings and placeholder copy are in Finnish.

- [ ] **Step 4: Commit**

```bash
git add src/components/Toolbar.jsx src/pages/ResumeBuilderPage.jsx
git commit -m "Wire Word (.docx) into the export menu"
```

---

### Task 10: Playwright coverage

**Files:**
- Modify: `e2e/export.spec.js`

**Interfaces:**
- Consumes: the "Word" menu item and its download behavior (Task 9).

- [ ] **Step 1: Update the menu-listing test**

In `e2e/export.spec.js`, change:
```js
  test('lists PDF, HTML, and JSON, and closes on outside click', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()

    const menu = page.getByRole('menu')
    await expect(menu.getByRole('menuitem', { name: 'PDF' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'HTML' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'JSON' })).toBeVisible()
```
to:
```js
  test('lists PDF, HTML, JSON, and Word, and closes on outside click', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()

    const menu = page.getByRole('menu')
    await expect(menu.getByRole('menuitem', { name: 'PDF' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'HTML' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'JSON' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'Word' })).toBeVisible()
```
(The rest of that test — clicking outside and checking the menu hides — is unchanged.)

- [ ] **Step 2: Update the arrow-key navigation test**

Change:
```js
    await page.keyboard.press('ArrowDown')
    await expect(items.nth(1)).toBeFocused()

    await page.keyboard.press('ArrowDown')
    await expect(items.nth(2)).toBeFocused()

    // Wraps back to the first item.
    await page.keyboard.press('ArrowDown')
    await expect(items.nth(0)).toBeFocused()

    await page.keyboard.press('ArrowUp')
    await expect(items.nth(2)).toBeFocused()

    await page.keyboard.press('Home')
    await expect(items.nth(0)).toBeFocused()

    await page.keyboard.press('End')
    await expect(items.nth(2)).toBeFocused()
```
to:
```js
    await page.keyboard.press('ArrowDown')
    await expect(items.nth(1)).toBeFocused()

    await page.keyboard.press('ArrowDown')
    await expect(items.nth(2)).toBeFocused()

    await page.keyboard.press('ArrowDown')
    await expect(items.nth(3)).toBeFocused()

    // Wraps back to the first item.
    await page.keyboard.press('ArrowDown')
    await expect(items.nth(0)).toBeFocused()

    await page.keyboard.press('ArrowUp')
    await expect(items.nth(3)).toBeFocused()

    await page.keyboard.press('Home')
    await expect(items.nth(0)).toBeFocused()

    await page.keyboard.press('End')
    await expect(items.nth(3)).toBeFocused()
```

- [ ] **Step 3: Add the Word download test**

At the end of the file, after the `'HTML export downloads an .html file'` test, add:
```js

  test('Word export downloads a .docx file', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'Word' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.docx$/)
  })
```

- [ ] **Step 4: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: every test passes, including the three touched/added in this task.

- [ ] **Step 5: Commit**

```bash
git add e2e/export.spec.js
git commit -m "Add e2e coverage for the Word export menu item"
```

---

### Task 11: Final verification, docs, and version bump

**Files:**
- Modify: `changes.md`
- Modify: `docs/superpowers/specs/2026-09-09-v1.2.0-roadmap-design.md` (mark C1 done)
- Modify: `package.json` (`version`)

**Interfaces:** none — this task is verification and bookkeeping only.

- [ ] **Step 1: Run the full verification matrix**

Run, in order:
```bash
npm run lint
npm run build
npm run check:docx-export
npm run check:reducers
npm run check:share
npm run test:e2e
```
Expected: every command exits 0. (`check:reducers`/`check:share` aren't touched by this feature but are cheap enough to re-run as a sanity check on a branch that's had several commits land.)

- [ ] **Step 2: Update `changes.md`**

Add a new entry at the top of the file (newest-first, matching the file's existing convention), dated with today's date, summarizing: the new `exportCvAsDocx`/`buildDocxDocument` in `src/utils/docxExport.js`, the `docx` dependency, the 20 section builders reusing the PDF text-fallback's data-shaping (`createCvSnapshot`, `createExportCopy`, `normalizeSectionOrder`, `formatDateRange`, `formatLinkLabel`/`formatLinkDisplayValue`), the monochrome/one-column/no-worker design decisions, the new `Word` export menu item, and the new `scripts/check-docx-export.mjs` + `npm run check:docx-export`. Reference the spec at `docs/superpowers/specs/2026-09-11-word-export-c1-design.md`.

- [ ] **Step 3: Mark C1 done in the parent roadmap doc**

In `docs/superpowers/specs/2026-09-09-v1.2.0-roadmap-design.md`, under the `## C. Word (.docx) export` section's **Phasing** list, add a short "**Done v1.2.X**" note (with the actual version number from Step 4 below) after the **C1** bullet's description, matching how completed roadmap items are annotated elsewhere in this doc's siblings (e.g. `docs/template-audit-a2.md`'s "Done v1.2.9" style notes).

- [ ] **Step 4: Bump the version**

In `package.json`, bump `"version"` to the next patch release (check `git log --oneline -5` for the most recent `Bump version to 1.2.X` commit to find the current number, then increment the patch component by 1).

- [ ] **Step 5: Commit the docs update, separately from the version bump**

```bash
git add changes.md docs/superpowers/specs/2026-09-09-v1.2.0-roadmap-design.md
git commit -m "Document the Word (.docx) export in changes.md and the roadmap"
```

- [ ] **Step 6: Commit the version bump**

```bash
git add package.json
git commit -m "Bump version to <the version from Step 4>"
```

---

## Self-Review Notes

- **Spec coverage:** every element of the C1 spec's "Document shape" section maps to a task — header/photo (Task 2), all 20 section types (Tasks 3–7), no-color/monochrome rule (the `INK`/`INK_SUBTLE` constants defined in Task 2 and reused by every primitive Task 3 adds, applied throughout), menu wiring (Task 9), testing (Tasks 2–8's check-script growth + Task 10's e2e). The spec's two "risks carried into implementation" are resolved: photo decoding reuses `cropPhotoDataUrlToSquare` (Task 1/2) exactly as flagged, and long-token wrapping is left to Word's own automatic wrapping (no special-casing needed, confirmed in this plan's design pass — Word paragraphs wrap by width like any word processor, unlike the DOM/CSS export paths that needed `overflow-wrap` special-casing).
- **Lint-consistency pass:** every task's own code was checked against which imports/constants/functions it actually uses, not just what later tasks will eventually need — an earlier draft of Task 2 imported the full final import list and defined all six shared primitives up front, which would have failed `npm run lint`'s `no-unused-vars` rule (it flags unused top-level functions exactly as it flags unused imports) until Task 8 caught up. Fixed by moving the six primitives into Task 3, the first task that actually calls all of them.
- **One deliberate deviation from the spec's prose**, called out in Global Constraints: skills render as individual bullets (matching the PDF text-fallback's actual precedent) rather than the spec's "single comma-joined line" — discovered while reading the fallback's real implementation during planning. Also, the spec's proposed header contact line ("email · phone · location · each link") is narrowed to just email/phone/location, since links already get their own dedicated section immediately after — including them twice would be redundant, and the PDF fallback's header doesn't include a contact line at all (an apparent pre-existing gap this plan doesn't inherit).
- **Placeholder scan:** no TBD/TODO; every code block is complete, runnable code, not a description of what to write.
- **Type consistency:** `buildXSection(snapshot, copy)` is the one signature every section builder shares, used identically in Tasks 3–7 and consumed identically in Task 8's `sectionBuilders` map. `buildIdentityBlock(snapshot, copy, includePhoto)` (async) is used the same way in Task 2 and Task 8. No function is called under two different names.
