# Word (`.docx`) export — C2/C3: styled per-template layout

**Date:** 2026-09-13
**Branch:** `v1.2.0`
**Status:** design — awaiting review before an implementation plan is written
**Parent:** `docs/superpowers/specs/2026-09-09-v1.2.0-roadmap-design.md`, sub-project C

C1 shipped v1.2.16–17: a one-column, monochrome, guaranteed-to-parse `.docx`
export, identical regardless of the user's chosen template. This spec is
C2+C3 — giving that export template-specific *layout* and *accent color* —
now that A.3 (the last new templates) has settled the app's final 8
structural families, which the roadmap doc flagged as the reason C2 had to
wait.

---

## Scope decision (confirmed with the user, 2026-09-13)

Three options were presented — structure-only, structure-plus-light-
decorative-approximation, or accent-only-no-tables. The user chose
**structure + accent color, no decorative approximation**:

- Each template's `.docx` gets a **layout** (columns, rail-vs-flow, grid,
  label/value table) that echoes its on-screen structural family, and the
  template's currently-resolved **accent color** on section headings.
- Bespoke *decorative* treatments — icon badges, numbered ordinals,
  left-tick marks, gradients, timelines, dot-ratings — are **not**
  approximated. Every template keeps C1's real Word `HEADING_2` style
  uniformly. This is a layout change, not a heading-treatment change.

This directly follows the parent roadmap's own framing ("recognizably the
same template, not pixel-matching") and its explicit warning that C2/C3 is
"an unbounded per-template bug tail" needing "a timebox and an explicit
good-enough bar" — ruling out decorative approximation *is* that bar.

## C2 vs. C3, revised

The original roadmap scoped C2 (layout mapper) and C3 (open-ended
per-template refinement, timeboxed) as two phases. With decorative
approximation ruled out, there isn't a meaningful open-ended tail left:
once every template has a correct layout archetype and its accent color,
there's nothing left to "refine" at this fidelity bar. **C2 and C3 ship as
one phase**: build the archetype mapper, apply it to all 18 templates, and
verify each renders correctly — a bounded QA pass, not iteration on visual
fidelity. If a genuine bug turns up in review (wrong section in the wrong
cell, a color that doesn't read as intended), that's a C2 bug to fix, not
a separate C3 polish item.

## Non-goals

- Decorative treatment approximation (see Scope decision above)
- Any change to C1's document shape for templates that land on the
  `one-column` archetype (below) — they keep exactly what C1 already ships
- Cover-letter `.docx` (still a separate future follow-up, per C1's own
  "out of scope" list)
- A Word template/theme system, table of contents, or headers/footers

---

## Archetype mapping

Every template maps to exactly one of 5 layout archetypes, derived from
`docs/template-design-system.md` §5's 8 structural families (several
families collapse onto the same `.docx` mechanism, since Word has no
flex/grid to distinguish them further):

| Archetype | Mechanism | Structural families it covers | Templates |
|---|---|---|---|
| `oneColumn` | C1's existing body, unchanged | `single-column-flow`, `single-column-timeline` (timeline spine drops), `photo-rail + main` (full-bleed photo drops — C1's existing small header photo stands in) | Minimalist, Compact, Classic Professional, Editorial, Modern Timeline, Portrait |
| `railTable` | A borderless 2-cell `Table` — the same mechanism `buildIdentityBlock` already uses for the header photo. Primary sections in one cell, secondary in the other (the registry's existing `primarySections`/`secondarySections` split — no new data). `railSide: 'left' \| 'right'` controls column order | `left-rail + main` (`railSide: 'left'`) | Executive, Modern Orange |
| | | `right-rail + main` (`railSide: 'right'`) | Creative, Modern Professional, Graduate, Portfolio Hybrid, Tech Executive, Colorful Compact |
| `darkSidebarTable` | Same mechanism as `railTable`, `railSide: 'left'`, plus cell `shading` (fill) on the rail cell and white text in it | `dark-sidebar + main` | Developer, Navy Professional |
| `gridTable` | A 2×2 borderless-except-thin-gray-border `Table` — the one archetype that keeps visible borders, since without them a 2×2 table reads identically to `railTable`'s wrapped rows and the "grid" structure is lost | `grid` | Quadrant |
| `labelGridTable` | A 2-column `Table` **per section**, one row per entry (label cell + value cell) — genuinely faithful here, not an approximation, since this is exactly European's on-screen reading pattern | `label-grid` | European |

18 templates, 5 code paths — not 18 one-offs.

## Accent color

Thread the template's *currently resolved* accent color — the same value
`resolveTemplateAccent(templateAccentColors, selectedTemplate)` already
produces for the live preview and PDF export — into `options.accentColor`.
Its only use in this spec is **section heading text color** (replaces
C1's fixed `INK` for headings only; body text stays `INK`/`INK_SUBTLE`
regardless of archetype). It does not drive table border color (`gridTable`'s
borders are a fixed light gray, not accent-tinted, to avoid a colored grid
reading as gaudy) and does not drive `darkSidebarTable`'s cell shading
(that's a fixed dark neutral — see `buildRailTableBody` below — since both
templates on that archetype, Developer and Navy Professional, are
`accent: null` anyway).

The 6 `accent: null` templates (Minimalist, Developer, Modern Professional,
Classic Professional, Navy Professional, Colorful Compact) pass no accent
color — headings stay `INK`, matching their real on-screen identity as
intentionally accent-free, not a gap. The archetype lookup and the accent
lookup both key off `templateConfig.id`, already available wherever
`buildDocxDocument` runs.

## Why extend the existing dispatcher, not a per-template config layer

The Showcase system uses one config file per template (`editorial.js`,
`portrait.js`, …) because each Showcase's *visual* differs meaningfully
enough to warrant a dedicated file. `.docx` doesn't have that variance —
there are 5 real layout mechanisms, and every template that shares an
archetype produces genuinely identical document structure (only the accent
color and which sections land in which cell differ, and both already come
from existing registry data). A per-template config layer here would be
18 near-empty files pointing at 5 shared functions — pure ceremony. One
small mapping table (`DOCX_ARCHETYPES: { [templateId]: { archetype,
railSide? } }`) in `docxExport.js` plus the accent lookup above is the
whole "config" surface this needs.

---

## New code surface (all in `src/utils/docxExport.js`)

### `DOCX_ARCHETYPES` — the mapping table

```js
const DOCX_ARCHETYPES = {
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
  developer: { archetype: 'darkSidebarTable' },
  navyProfessional: { archetype: 'darkSidebarTable' },
  quadrant: { archetype: 'gridTable' },
  european: { archetype: 'labelGridTable' },
}
```

A template id missing from this table falls back to `oneColumn` (defensive
default — matches the existing `getTemplateConfig` fallback pattern in
`components/templates/index.js`, and means a future new template that
forgets to register here degrades to C1's behavior instead of throwing).

### `buildRailTableBody(mainChildren, railChildren, { railSide, dark, accentColor })`

Replaces the current flat `children.push(...build())` loop for
`railTable`/`darkSidebarTable`. Builds section content for
`primarySections` and `secondarySections` exactly as today (same
`sectionBuilders` map, same per-section functions — no changes to any of
the 20 existing builders), then wraps the two resulting arrays in a
borderless `Table`/`TableRow`/two `TableCell`s, ordered by `railSide`.
`dark: true` sets `shading: { fill: '1F2937', type: ShadingType.CLEAR }`
on the rail cell and forces every `TextRun` color inside it to a light
color (`'F5F5F5'`) instead of `INK`/`INK_SUBTLE` — the existing builder
functions take a `copy`/`snapshot` pair, not a color, so this needs a
small color-override pass on the rail cell's paragraphs after building
them, not a new parallel set of builders.

Width split: fixed `32% / 68%` for the rail/main pair regardless of each
template's actual on-screen ratio (Executive's rail is closer to 33%,
Modern Orange's closer to 28%) — one consistent number across every
`railTable` template, not an attempt to mirror each one exactly.

### `buildGridTableBody(sectionOrder, { accentColor })`

Splits the resolved `sectionOrder` into 4 roughly-even groups in order
(first quarter → top-left cell, second quarter → top-right, etc.) — a
simple deterministic rule, not an attempt to mirror Quadrant's specific
on-screen cell assignment (identity/about top-right, work history
elsewhere — see `docs/template-audit-a2.md`'s Quadrant rework notes). Cell
borders: thin light gray (`BorderStyle.SINGLE`, `size: 4`, `color:
'D4D4D8'`) on all 4 cells — the one archetype that keeps visible borders,
since a borderless 2×2 table is visually indistinguishable from
`railTable`'s wrapped rows.

### `buildLabelGridBody(sectionOrder, snapshot, copy, { accentColor })`

New section-renderer variants, scoped to exactly the 8 sections European's
registry actually supports (`about`, `experience`, `education`, `skills`,
`projects`, `links`, `languages`, `certificates` — not all 20; a template
can only ever request sections its own registry entry lists as primary/
secondary). One row per entry in a 2-column `Table` (label cell ~22%
width, value cell ~78%), mirroring `EuropeanShowcase.jsx`'s own label
mapping exactly:

| Section | Label cell | Value cell |
|---|---|---|
| About | *(blank)* | Paragraph |
| Experience | Date range | Role (bold) / company · location (italic) / bullets |
| Education | Date range | Degree (bold) / school · location (italic) |
| Skills | Category name (from `parseSkillCategories`, reused as-is) | Comma-joined items |
| Projects | `item.date` (if present) | Name (bold) / description / stack tags (comma-joined) |
| Links | `formatLinkLabel(key)` | `formatLinkDisplayValue(value)` |
| Languages | `item.level` | `item.language` |
| Certificates | `item.year` | `name – issuer` |

Section heading (`HEADING_2`, same as every other archetype) still
precedes each section's table — the label/value grid is the section
*body*, not a replacement for the section heading.

---

## Wiring

**`src/pages/ResumeBuilderPage.jsx`**'s existing `type === 'docx'` branch
gains one argument:

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

`resolveTemplateAccent` is already imported in this file (used by the live
`CVPreview` a few lines below) — no new import.

**`buildDocxDocument`** reads `options.accentColor`, looks up
`DOCX_ARCHETYPES[templateConfig.id]` (falling back to `{ archetype:
'oneColumn' }`), and dispatches to the matching body-builder instead of
today's single flat loop. `buildIdentityBlock` (header: name, title,
photo, contact line) is unchanged and runs identically for every
archetype — only the *body* (sections after the header) differs.

---

## Testing

- **`scripts/check-docx-export.mjs`**: one new check per archetype —
  generate a `.docx` for one representative template from each row of the
  mapping table (e.g. Executive for `railTable`-left, Creative for
  `railTable`-right, Developer for `darkSidebarTable`, Quadrant for
  `gridTable`, European for `labelGridTable`), unzip it (the existing
  `jszip`-based approach the C1 monochrome check already established),
  and assert: the expected number of top-level tables exist in
  `word/document.xml`, the accent hex (for accent-configurable templates)
  appears in at least one `w:color`, and the dark-sidebar template's rail
  cell shading fill matches the expected hex. Plus the existing "every
  section builder covers empty/populated CV" checks extended to the new
  `labelGridTable` renderers.
- **`e2e/export.spec.js`**: no new tests needed — Word export already has
  a passing "downloads a .docx file" test from C1, unaffected by which
  archetype the currently-selected template resolves to.
- **Manual, per archetype (not per template — 5 checks, not 18)**: open
  the downloaded `.docx` in Word/LibreOffice for one template from each
  archetype row, confirm the table renders as a real table (not text that
  merely looks like one), the accent color is visible where expected, and
  the dark-sidebar cell's white text is actually readable against the
  shaded fill.
- **`npm run lint` / `npm run build`** as usual.

## Risks / open questions carried into implementation

- **Cell shading + white text contrast**: `1F2937` (a dark slate) with
  `F5F5F5` text should clear AA comfortably, but confirm by eye once
  rendered — Word's own shading rasterization can read slightly lighter
  than the requested hex on some renderers.
- **Table page-break behavior in Word**: a `railTable`/`darkSidebarTable`
  row is one giant table row spanning the whole document — if either
  cell's content is long enough to push past one page, Word's default
  table behavior keeps the row together in a way that can leave one cell
  needing to break; docx.js's `Table` supports per-row
  `cantSplit`/`TableRow` height rules if this looks wrong in manual
  testing, but the plan should verify before adding that complexity
  rather than assuming it's needed.
- **`gridTable`'s deterministic quarter-split** may put a short section
  (Links, 3 items) in the same visual weight as a long one (Experience, 4
  jobs) — acceptable per "not pixel-matching," but worth a glance during
  manual verification in case it reads as obviously broken rather than
  merely approximate.

## Out of scope, tracked for later

- **Cover-letter `.docx`** — unchanged from C1's own "out of scope" note;
  still a small standalone follow-up whenever it's prioritized.
- Any further visual refinement beyond this spec's bar — per the "C2 vs.
  C3, revised" section above, there is no separate future phase for this;
  a real bug found in review gets fixed as part of this work, anything
  beyond "correct archetype + correct accent" is out of scope by design,
  not deferred.
