# Word (`.docx`) export — C1: ATS-friendly one-column

**Date:** 2026-09-11
**Branch:** `v1.2.0`
**Status:** design — awaiting review before an implementation plan is written
**Parent:** `docs/superpowers/specs/2026-09-09-v1.2.0-roadmap-design.md`, sub-project C

This is C1 of the three-phase Word-export effort the roadmap scoped:
**C1 — ATS-friendly one-column `.docx`** (this doc) → C2 — styled per-template
layout mapper → C3 — per-template refinement (timeboxed). The roadmap doc
already fixed C1's library and its place in the export menu; this spec fixes
everything else needed to build it.

---

## Goal

A fourth export option, **Word**, that produces a real, genuinely-editable
`.docx` file: one column, real Word paragraph/heading styles, monochrome,
built straight from the same CV data every other export reads — no DOM, no
screenshot, no CSS. It should open cleanly in Word, Google Docs and
LibreOffice, show a proper outline in Word's Navigation Pane, and parse
reliably in any ATS. This is explicitly *not* a rendering of the user's
chosen template — `.docx` has no flex/grid, and C1 doesn't attempt to
approximate one. Template fidelity is C2/C3's job, once A.3's new templates
settle the final structural families C2's layout archetypes need to mirror.

## Non-goals (this spec)

- Styled/per-template `.docx` (C2/C3 — separate future spec)
- Cover-letter `.docx` (small follow-up once this ships, reusing its
  paragraph-writing helpers)
- Any change to the existing PDF/HTML/JSON export paths
- A Word template/theme system, table of contents, page numbers, or
  headers/footers beyond the content itself

## Why this is easy: reuse, not new plumbing

Every piece of data-shaping this needs already exists, because it's
*exactly* what `exportCvAsPdfTextFallback` in `src/utils/exporters.js`
already does — a DOM-independent, pure-data render of the CV used when the
canvas-capture PDF path fails. C1 is that function's sibling, aimed at
`docx.Paragraph` objects instead of `jsPDF` draw calls:

| Need | Existing source | Reused as-is |
|---|---|---|
| Normalized field values | `createCvSnapshot(formData)` (`src/utils/cvSnapshot.js`) | yes |
| Which sections this template supports, in what order | `getCvTemplate(templateId, locale).primarySections` + `.secondarySections`, `normalizeSectionOrder(formData.sectionOrder, …)` | yes |
| Which sections/items the user has hidden | `formData.sectionVisibility`, `createSectionVisibility()` defaults | yes |
| Bilingual section labels + microcopy | `createExportCopy(locale)` (~20 section labels already, `src/utils/exporters.js`) | yes |
| Date formatting | `formatDateRange(startDate, endDate, isCurrent, presentLabel)` | yes |
| Photo show/hide for this template | `isPhotoVisibleForTemplate(formData.photoVisibilityByTemplate, templateConfig.id)` | yes |
| Download | `saveAs` from `file-saver` (already a dependency) | yes |

No new data-layer code. The only new code is a `docx`-flavored renderer for
each of the ~20 section types the text-fallback already enumerates, plus the
menu/handler wiring.

## Library

**`docx`** (npm, MIT, pure JS, browser-safe via `Packer.toBlob()`) — already
decided in the parent roadmap doc. Add as a normal dependency.

**Loading:** dynamic `import('docx')` inside `exporters.js`, the same lazy
pattern `html2canvas`/`jspdf` already use. **Not** added to
`vite.config.js`'s `manualChunks` — for the same reason spelled out in that
file's existing comment: a named vendor chunk gets an eager
`<link rel="modulepreload">` injected into every page's `<head>`, undoing
the lazy-load. Leave it to Rollup's default async-chunk splitting, reached
only through `exporters.js`'s dynamic import.

**No worker.** The PDF path uses a worker because `html2canvas` rasterizes
a full-resolution page image — genuinely CPU-heavy. `docx` generation for a
CV's few KB of text is pure string/XML assembly, done in single-digit
milliseconds. A worker here would be message-passing plumbing for no
measurable benefit, and it breaks the pattern every other non-PDF export
(`exportCvAsJson`, `exportCvAsHtml`) already uses successfully: a plain
(async) function in `exporters.js`, called directly from the page.

## New function

```js
// src/utils/exporters.js
export async function exportCvAsDocx(formData, fileName, options = {}) {
  // options: { template = defaultTemplateId, locale = 'en' }
}
```

Exported alongside `exportCvAsJson`/`exportCvAsHtml`/`exportCvAsPdf`,
dynamically imported by the page the same way those three already are
(`const { exportCvAsDocx } = await import('../utils/exporters')`).

No `mode`/`atsFriendlyMode` parameter — unlike the PDF path, `.docx` has
exactly one shape regardless of the toolbar's ATS/Designer toggle. The
format itself *is* the ATS-friendly choice; the toggle doesn't apply to it.

### Document shape

- `new Document({ sections: [{ properties: { page: { margin } }, children }] })`,
  one section, implicit A4 (docx defaults to Letter; set `page.size` to A4 —
  210 × 297 mm, matching every other export). Margins ~16mm on all sides
  (`convertMillimetersToTwip(16)`), matching the PDF ATS mode's margins
  (`{ top: 16, right: 16, bottom: 18, left: 16 }` — reuse those exact
  numbers for consistency across export formats).
- **Header block:**
  - Name → a `Paragraph` with `heading: HeadingLevel.TITLE`
  - Role/title line → plain bold `Paragraph` directly under it
  - Photo, if `isPhotoVisibleForTemplate(...)` says yes for this template →
    `ImageRun` from the snapshot's `photo` data URL (already base64;
    `docx.ImageRun` takes a `Uint8Array`/`ArrayBuffer` — decode the data URL
    the same way `cropPhotoDataUrlToSquare` already does elsewhere in this
    file), sized small (~25mm square), floated top-right via a borderless
    2-cell `Table` (photo cell + identity cell) so it doesn't fight the
    following paragraphs in older Word layout engines. If no photo: skip
    the table, identity block is plain paragraphs.
  - Contact line → one `Paragraph`, pieces (email · phone · location ·
    each link) joined with ` · `, each link's display value going through
    `formatLinkDisplayValue()` like every other export already does (no
    raw `https://…`).
- **Section heading** → `Paragraph` with `heading: HeadingLevel.HEADING_2`
  and the label from `createExportCopy(locale)`. This is the one place
  `.docx` beats PDF for free: Word's Navigation Pane and any
  auto-generated table of contents pick these up as real outline entries.
- **Entry sub-heading** (job title, degree, project/case-study name) →
  bold `Paragraph`, not a heading style (keeps the outline to
  section-level only, matching the PDF fallback's visual hierarchy).
  Company/school + location on the line under it, plain; dates on their
  own line under that, matching `formatDateRange`'s output exactly as the
  PDF fallback renders it.
- **Body text** (about, descriptions) → plain `Paragraph`(s), split on the
  same `\n` handling the snapshot already does.
- **Bullets** (experience/education/case-study description lines that are
  multi-line) → real `Paragraph({ bullet: { level: 0 } })` — genuine Word
  bullets, not `•` characters typed into the text.
- **Skills** → one comma-joined `Paragraph` under the Skills heading (not a
  bulleted list) — the single most ATS-parser-friendly shape for a flat
  keyword list, and avoids a wall of one-word bullets.
- **Links / certificates / languages / interests / achievements /
  everything else** → the same field-by-field shape the PDF fallback
  already establishes per section, just as `Paragraph`s instead of
  `pdf.text()` calls. No new content decisions — this spec is a format
  port, not a redesign.
- **Colour:** none. Every run is default black. No shading, no borders
  (except the invisible photo layout table, whose borders are explicitly
  set to `none`), no accent color. This is the "guaranteed to work"
  version — C2 is where a template's accent shows up.

### Section coverage & ordering — mirrors the PDF fallback exactly

Same 20 section renderers the text-fallback already has
(`renderAbout`, `renderSkills`, `renderExperience`, `renderEducation`,
`renderLinks`, `renderCoreStrengths`, `renderCertificates`,
`renderProjects`, `renderLanguages`, `renderInterests`,
`renderAchievements`, `renderOpenSource`, `renderPublications`,
`renderLeadership`, `renderMemberships`, `renderSpeaking`,
`renderVolunteering`, `renderInternships`, `renderCaseStudies`,
`renderTestimonials`), each producing `Paragraph[]` instead of drawing to a
`jsPDF` instance. Same dispatch pattern:

```js
const templateSectionOrder = [...templateConfig.primarySections, ...templateConfig.secondarySections]
const sectionOrder = normalizeSectionOrder(formData.sectionOrder, templateSectionOrder)
const isVisible = (section) => sectionVisibility[section] !== false

const renderedSections = new Set()
const children = [...headerBlock]

sectionOrder.forEach((section) => {
  const render = sectionRenderers[section]
  if (render && !renderedSections.has(section) && isVisible(section)) {
    children.push(...render())
    renderedSections.add(section)
  }
})
// then any remaining visible-but-unordered sections, same fallback the PDF path has
```

### Filename & download

```js
const blob = await Packer.toBlob(doc)
saveAs(blob, `${fileName}.docx`)
```

Same `fileName` the other three formats already receive from
`ResumeBuilderPage.jsx`'s `exportFileName`.

## Wiring

**`src/components/Toolbar.jsx`** — a 4th `role="menuitem"` button in the
export menu, after JSON:

```jsx
<button type="button" role="menuitem" className="app-toolbar__export-item"
  disabled={isActionBusy} onClick={() => handleExportSelect('docx')}>
  Word
  <span className="app-toolbar__export-item-hint">
    {isFinnish ? 'Muokattava .docx, toimii kaikkien ATS-järjestelmien kanssa'
                : 'Editable .docx, works with any ATS'}
  </span>
</button>
```

**`src/pages/ResumeBuilderPage.jsx`**'s `handleExport` — a `'docx'` branch
alongside the existing `'json'`/`'html'` ones (same shape, no preview-sync
waiting since there's no DOM to capture):

```js
if (type === 'docx') {
  await exportCvAsDocx(formData, exportFileName, { template: selectedTemplate, locale })
}
```

Plus: add `'docx'` to the `exportLabel`/`toastLabel` ternaries just above
(`'Word'`, `'Preparing Word export...'` / `'Valmistellaan Word-vientiä...'`),
and the `import('../utils/exporters')` destructure gets `exportCvAsDocx`
alongside the other three.

## Testing

- **`e2e/export.spec.js`**:
  - `'lists PDF, HTML, and JSON, and closes on outside click'` → add the
    `Word` menuitem assertion (rename the test or leave the name — it's
    describing behavior, a 4th item doesn't invalidate it).
  - `'opens with focus on the first item and supports arrow-key navigation'`
    → item count goes from 3 to 4; `Home`/`End`/wrap-around assertions move
    from `items.nth(2)` to `items.nth(3)`.
  - New: `'Word export downloads a .docx file'`, same
    `page.waitForEvent('download')` + `suggestedFilename()` pattern as the
    JSON/HTML tests.
- **Manual:** open the downloaded file in Word (or LibreOffice/Google Docs
  if Word isn't available in this environment) after loading the demo CV;
  confirm the Navigation Pane shows real section headings, skim for
  garbled/missing text, confirm the photo (if the active template shows
  one) renders and isn't stretched.
- **`npm run lint` / `npm run build`** as usual — no reducer, share-link, or
  feedback-engine surface touched, so `check:reducers`/`check:share`/
  `check:cv-feedback` don't apply here.

## Risks / open questions carried into implementation

- **`docx`'s browser bundle size** — unverified until it's actually
  installed; if it turns out unexpectedly large, that's still fine since
  it's lazy-loaded exactly like `html2canvas`+`jspdf` (~600KB combined)
  already are, but worth a glance at the built chunk size once it's in.
- **Photo decoding** — `ImageRun` needs raw bytes, not a data URL string;
  confirm the same decode approach `cropPhotoDataUrlToSquare` uses ports
  cleanly (it's already handling this exact "data URL → bytes" conversion
  for the PDF path, so this should be a reuse, not new work).
- **Long unbroken tokens** (a long URL/email with no natural break point)
  — Word wraps text automatically inside a paragraph, so this is expected
  to be a non-issue unlike the DOM/CSS export paths that had to special-case
  `overflow-wrap`. Worth a quick check during manual verification with the
  demo CV's `github.com/alexmorgan/atlas-design-system`-style long URLs.

## Out of scope, tracked for later

- **C2** — styled `.docx`: 3–4 layout archetypes (one-column,
  left-rail-table, right-rail-table, dark-sidebar-table) mirroring the now-
  finalized A structural families, each bespoke template mapping onto one
  and carrying its accent color + heading treatment. Waits on A.3 (new
  templates) per the parent roadmap's sequencing, since new templates could
  still add a structural family C2 needs to account for.
- **C3** — per-template refinement, timeboxed, "approximate" is an accepted
  outcome, per the parent roadmap doc.
- **Cover-letter `.docx`** — same paragraph-writing shape as C1's body
  text, no sections/headings needed; small standalone follow-up.
