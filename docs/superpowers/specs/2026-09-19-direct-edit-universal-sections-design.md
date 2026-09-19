# Direct Edit: universal section editing — design spec

**Status:** approved design, not yet planned or implemented.
**Date:** 2026-09-19
**Supersedes as critical path:** `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`
(the per-template inline rollout, Rounds 1-8 shipped). That rollout is not
cancelled — it is demoted to optional enhancement. See "Impact on the
existing roadmap" below.

## Goal

Every section on every template is editable in Direct Edit mode, sections
can be reordered and toggled on/off, and clicking a section opens a small
popup editor for it. The stated product aim is the most editable CV
builder available, with usability and quality as the priority.

Today only 4 section types (identity, About, Experience, Skills) are
editable, on 9 of 18 templates, via inline `contentEditable`. The
remaining ~16 section types are read-only everywhere, and 9 templates
show a "Direct Edit isn't available yet" notice.

## Decisions

These were settled during brainstorming and are binding for the plan.

1. **Hybrid editing, not replacement.** Inline `contentEditable` editing
   stays exactly as shipped on the 9 wired templates. The popup is added
   as the *complete* editor for every section — including fields a
   template never displays. Inline serves quick typo fixes; the popup
   serves complete record editing.
2. **Hover-revealed pencils, two levels.** A section shows a pencil on
   hover; the pencil is its own hit target, so it never competes with an
   inline click on the text. Entry-level pencils are Phase B (below).
3. **Popup layer first.** The per-template inline rollout pauses. The
   popup delivers editability for all 18 templates in one project rather
   than 9 more per-template rounds.
4. **Reorder within a column only.** Moving a section between the main
   column and the sidebar is explicitly out of scope — column placement
   comes from `templateConfig.primarySections`/`secondarySections`
   (template config), not user data, and making it user data would
   require per-template override state plus changes to all 17 bespoke
   Showcase files.

## Why a delegated overlay rather than per-template wiring

All 17 bespoke Showcase files **and** the shared flat renderer
(`shared.jsx`) already tag every section wrapper with
`data-export-section="<key>"`, an attribute added for the PDF exporter.
That is a universal, already-present, per-section hook on every template.

The identity block is not a `sectionOrder` section and has no
`data-export-section`; it carries `data-export-header="true"` instead.
That attribute was verified present in **all 17** Showcase files, none
missing. So the overlay resolves a hover to a section key by looking for
the nearest `[data-export-section]` **or** `[data-export-header]`
ancestor, mapping the latter to the synthetic key `identity`.

An overlay that reads it via event delegation reaches **all 18 templates
× all 20 section types with zero per-template JSX changes**. Continuing
the inline pattern instead would mean roughly 18 templates × ~16 further
section types of hand-written bespoke JSX.

Two alternatives were considered and rejected:

- **Shared `EditableSection` React wrapper** replacing each Showcase's
  local `Section` component: solves entry indexing for free and needs no
  geometry math, but every template's local `Section` has a different
  signature (Creative's is `{id, placement, number, title, children}`;
  others differ), making it exactly the 17-template refactor this design
  exists to avoid, with visual-regression risk on all of them.
- **Extending `SectionsMenu` into a full section editor**: nearly free,
  but abandons direct manipulation — it becomes a settings panel, not
  clicking the thing on the page.

## Architecture

Four new files, five modified, **zero template files touched in Phase A**:

- New: `SectionEditOverlay.jsx`, `SectionEditorPopup.jsx`,
  `src/utils/sectionSchema.js`, `scripts/check-section-schema.mjs`.
- Modified: `DirectEditPreview.jsx` (mounts the overlay, drops the
  "not available yet" notice), `src/utils/directEdit.js`,
  `scripts/check-direct-edit.mjs`, `e2e/direct-edit.spec.js`,
  `src/index.css`, `package.json` (the new check script and a patch
  version bump).

`SectionsMenu.jsx` is **unchanged**: the popup's hide control dispatches
the same `TOGGLE_SECTION_VISIBILITY` the menu already uses, and section
reordering lives in the popup, so nothing in that file needs to move.

### `src/components/SectionEditOverlay.jsx` (new)

Mounts inside `.direct-edit-preview`, layered above `CVPreview`. Owns:

- One delegated `pointerover`/`click` listener on the preview root (not
  per-section handlers).
- Resolving the hovered element's nearest `[data-export-section]`
  ancestor to a section key.
- Measuring that one section and rendering the hover pencil.
- Opening `SectionEditorPopup` for the active section key.

This is the only component that touches DOM geometry. Everything
downstream operates on data.

**It must mount outside `previewRef`** (which is on the `<article>`
inside `CVPreview`), so `html2canvas` never captures overlay chrome
during PDF export.

### `src/components/SectionEditorPopup.jsx` (new)

The popup editor. Anchors beside its section and flips side when it would
cover the content being edited. Renders inputs from the schema and reads
`formData[sectionKey]` **directly** — never from the DOM, never from
`snapshot`.

Uses real `<input>`/`<textarea>` elements, not `contentEditable`.

Dismissal: Escape, click-outside, or an explicit Done button.

### `src/utils/sectionSchema.js` (new)

Per-section field descriptors: field keys, bilingual (`en`/`fi`) labels,
and input type (`text` / `textarea` / `month` / `url`). Derived from the
empty-entry factories already in `cvForm.js`, so one file stays in sync
with the data model instead of 17 templates' worth of assumptions.

It also encodes each section's shape. There are exactly five:

| Shape | Sections | Existing actions used |
|---|---|---|
| root group | identity: `fullName`, `title`, `email`, `phone`, `location`, `tagline`, photo visibility | `SET_ROOT_FIELD`, `TOGGLE_PHOTO_VISIBILITY` |
| root scalar | `about` | `SET_ROOT_FIELD` |
| string array | `skills` | `ADD_SKILL`, `REMOVE_SKILL`, `MOVE_SKILL` |
| link map | `links` | `SET_LINK_FIELD` |
| record array | the other 17 (`experience`, `education`, `certificates`, `projects`, `languages`, `achievements`, `openSource`, `publications`, `interests`, `leadership`, `memberships`, `speaking`, `volunteering`, `internships`, `caseStudies`, `testimonials`, `coreStrengths`) | `UPDATE_ARRAY_ITEM`, `ADD_ARRAY_ITEM`, `REMOVE_ARRAY_ITEM`, `DUPLICATE_ARRAY_ITEM`, `MOVE_ARRAY_ITEM_TO_INDEX`, `TOGGLE_SECTION_ITEM_VISIBILITY` |

**No new `cvFormReducer` actions.** Every action above already exists —
the same constraint that has held for all 8 rounds of the inline rollout.

### `src/components/SectionsMenu.jsx` (unchanged)

Keeps its bulk show/hide checkbox list exactly as shipped. Section
*reordering* lives in the popup instead, at the point of use, and the
popup's hide control dispatches the same `TOGGLE_SECTION_VISIBILITY`
action the menu already uses — so no edit to this file is required.

### `src/utils/directEdit.js` (modified)

`DIRECT_EDIT_SUPPORTED_TEMPLATES` changes meaning: it currently gates
*all* editing and drives the "Direct Edit isn't available yet for X"
notice in `DirectEditPreview.jsx`. After this project it gates only the
*inline* bonus layer, because popup editing works on all 18 templates.
The notice is removed — every template becomes genuinely editable.

Rename the export to `INLINE_EDIT_SUPPORTED_TEMPLATES` (and
`isDirectEditSupported` to `isInlineEditSupported`) so the narrowed
meaning is explicit at every call site, and update
`scripts/check-direct-edit.mjs` to match. Leaving the old name in place
would mislead every future reader into thinking unlisted templates are
uneditable, which is precisely what stops being true.

## Data flow

A popup input's `onChange` dispatches an existing `FORM_ACTION` →
`formData` updates → the preview behind the popup re-renders live → the
popup's controlled inputs re-read from `formData`.

No commit/cancel model and no staging buffer: edits land as typed,
consistent with an app that has never had a save step.

### Index correctness by construction

For record-array sections the popup maps over `formData[section]`, and
each row carries its true array index into the dispatch. Nothing derives
an index from DOM position.

This matters because `createCvSnapshot` filters entries by
`sectionItemVisibility` (`src/utils/cvSnapshot.js:36`), so DOM entry order
can diverge from `formData` indices. Deriving indices from the DOM is the
hazard that produced Round 5's duplicate-index bug; this design does not
expose itself to it.

### It closes a bug parked since Phase 1

Today an entry hidden via Classic mode's per-item toggle reappears and is
editable in Direct Edit, then vanishes again on switching back —
documented as an accepted trade-off across 8 rounds because
`EditableList` needs raw indices.

The popup resolves it: it lists every entry *including hidden ones*, each
with an explicit visibility toggle. Hidden state becomes visible and
controllable rather than invisible and confusing.

### Three standing risk classes cannot occur in this layer

Because the popup uses real form inputs outside the preview DOM:

1. **`text-transform` corrupting saved data** — impossible; nothing reads
   `innerText`. (Bit Modern Timeline and Classic Professional.)
2. **Multi-line text collapsing under `white-space: normal`** —
   impossible; a `<textarea>` holds real `\n`. (Bit Classic Professional.)
3. **`EditableList`'s wrapper breaking `:first-child`/`:last-child`
   rules** — impossible; the popup injects nothing into template markup.
   (Bit Executive and Modern Orange.)

These have cost the inline rollout a Critical or near-Critical finding in
four separate rounds.

## Geometry

The overlay is `position: absolute` inside a `position: relative`
`.direct-edit-preview`. The pencil is placed at
`sectionRect − containerRect`. Both elements scroll together, so that
offset is scroll-invariant: no scroll listener and no persistent rect map.

Only the currently hovered section shows a pencil, so exactly one element
is measured per `pointerover`, re-measured in a `useLayoutEffect` keyed on
`formData` so the pencil follows content that reflows while typing.

**Zoom was investigated and does not apply.** `DirectEditPreview` renders
directly inside an `AppErrorBoundary` in `ResumeBuilderPage.jsx`, not
inside Classic mode's scaled `.preview-zoom-wrapper`. There is no CSS
transform between overlay and preview. If a zoom control is ever added to
Direct Edit, this assumption must be re-verified, because
`getBoundingClientRect` returns scaled coordinates while an overlay inside
the transformed container positions in unscaled ones.

## Section reordering

`MOVE_SECTION_ORDER` takes `{ fromSection, toSection, fallbackOrder }` —
a **key-to-key** move, not an index move (`cvFormReducer.js:323`). The
popup header's Move up / Move down dispatch it.

**The trap to avoid:** `sectionOrder` is a single flat array, but what the
user sees is that array filtered down to one column. On a rail template,
the section visually above Skills in the sidebar may be several positions
away in the flat array with main-column sections in between. `toSection`
must therefore be **the neighbour in the column-filtered list**, not the
flat-array neighbour.

`CVForm.jsx`'s own `moveSectionByDirection` uses the flat neighbour, which
is correct there because Classic's nav rail shows one flat list. Copying
it into Direct Edit would produce moves that appear to do nothing. This
gets a dedicated test.

## Edge cases

- **Empty sections become reachable.** Templates render empty-state text
  *inside* the `Section` wrapper, so `data-export-section` is present at
  zero entries — the pencil works and a first entry can be added from the
  page. Today an empty CV often offers nothing to click.
- **Fields no template displays** become editable for the first time —
  `tagline` (out of scope in all 8 rounds because no template inline-wired
  it) and per-template omissions.
- **ATS mode / export / print:** Direct Edit already forces
  `atsFriendlyMode={false}`, and the overlay mounts only in Direct Edit,
  so ATS output is untouched. The overlay sitting outside `previewRef`
  keeps it out of `html2canvas` captures.
- **Pre-existing and not worsened:** PDF export currently captures inline
  editing chrome (drag handles, remove buttons, "+ Add" rows) — flagged by
  the Round 5 and Round 8 reviewers. The popup adds nothing to this, and
  long-term offers a way out, since popup editing needs no in-canvas
  chrome.
- **Hidden sections** have no DOM node and therefore no pencil;
  `SectionsMenu` remains the way to bring one back. That is the right
  division of labour — it is already the bulk show/hide surface.
- **Templates that don't support a section** never render it, so it is
  unreachable — correct, since that data would not display there anyway.

## Testing

### `scripts/check-section-schema.mjs` (new)

Framework-free Node script, joining `check:share` / `check:reducers` /
`check:direct-edit`. Asserts:

- every key in `CV_SECTION_ORDER_KEYS` has a schema entry;
- every field the schema names exists on that section's empty-entry
  factory in `cvForm.js`;
- every schema shape maps to actions that exist in `FORM_ACTION`.

This is the same cheap insurance `check:share` provides for short keys: a
typo'd field name would otherwise dispatch into nothing and silently drop
the user's edit, with no crash to notice.

### e2e (`e2e/direct-edit.spec.js`)

The existing convention is one test per template, but the popup is
template-agnostic, so it inverts into **one parameterized loop over all 18
templates** asserting the pencil appears and the popup opens and edits.

Plus four targeted tests for what reasoning cannot settle:

1. column-filtered section reorder actually moves the section;
2. the hidden-entry visibility toggle round-trips with Classic mode;
3. adding a first entry to an empty section works from the page;
4. export-safety — the overlay never appears in the PDF (reuse the
   existing `exportPdfAndExpectSuccess` helper).

### Full verification

`npm run lint`, `check:reducers`, `check:share`, `check:direct-edit`,
`check:section-schema`, `npm run build`, `npm run test:e2e` — the same
gate every round has used.

## Scope

### Phase A — this project

Overlay, section pencils, popup, schema, all five section shapes,
column-aware section reorder and hide, per-entry add / remove / duplicate
/ reorder / visibility inside the popup, removal of the "not available
yet" notice, and both test layers.

**Outcome: every section on all 18 templates is fully editable.**

### Phase B — later, optional

- Per-entry pencils: add `data-direct-edit-index={index}` alongside the
  existing `data-export-card` in each template (mechanical, ~1 line × 17
  files) so hovering one job opens the popup focused on that entry.
- Resumed inline wiring for the 9 unwired templates, as pure polish.
- Mobile/touch.
- Export-chrome cleanup.

### Explicitly out of scope

- Moving sections between columns.
- Mobile/touch. The pencil needs tap-to-reveal or always-visible
  treatment on touch, and mobile Direct Edit has its own open Phase 3
  deferrals. Popup editing is likely the eventual *fix* for mobile, since
  `contentEditable` on mobile is the root of those problems — but that is
  a later project.
- Any new reducer action.
- Any behaviour change to inline editing on the 9 already-wired
  templates.

## Impact on the existing roadmap

Once Phase A lands, the `railTable` rollout's headline benefit —
editability — arrives everywhere at once, so the remaining 9 template
rounds become optional enhancement rather than the path to the goal. The
inline layer keeps genuine value (typing directly on the page feels
better than a popup for a quick fix) but stops being the critical path.

Two documentation corrections are owed and should be made when the plan
is written:

1. `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md` still
   lists Creative among templates needing "a categorized-aware chip
   treatment" (lines 88-97, 181). Round 8 disproved this — Creative
   renders skills flat. **Tech Executive remains in that stale list** and
   could mislead a future round.
2. The same doc should record the now twice-proven lesson: a template's
   `skillsLayout` config value has been wrong in *both* directions
   (Compact said `flat` and rendered categorized; Creative said
   `categorized` and renders flat). Always read the actual Showcase file.
