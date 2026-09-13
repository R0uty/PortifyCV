# Direct Edit builder — design spec

**Branch:** `v1.3.0` (forked from `v1.2.0` at `d4e25b2`, 2026-09-13)

## Problem

The builder has one layout: a form rail on the left, a live preview on the
right. It works, but it's busy — every field lives in a second place, away
from where it actually appears. The ask: a new mode where the preview
itself is the editor — click the name, the role line, a bullet, and type
right there, in the template's own type. Single section, not two.

**The existing split-pane builder is not going away.** It becomes one of
two modes, not the fallback of a broken one. Users who prefer a form
keep it exactly as it is today.

## Goals

- A new "Direct Edit" mode: the live-styled preview is the entire
  workspace, and its text is directly editable in place.
- Switching between Direct Edit and Classic, or switching templates in
  either mode, never loses data — both modes read and write the same
  `formData`.
- Repeatable entries (experience, education, projects, skills, …) can be
  added, edited, reordered, and removed without leaving the preview.
- Classic mode is unchanged, byte-for-byte, and stays fully supported.

## Non-goals

- Rebuilding the Classic form. It is not touched by this project.
- New CV data fields, new reducer actions, or new validation rules —
  every action Direct Edit needs already exists in `cvFormReducer.js`
  (confirmed below). This is a new *surface*, not new *state*.
- Real-time collaborative editing, comments, or version history beyond
  the existing undo/redo.
- Making the ATS-friendly flat renderer (`shared.jsx`) editable — see
  "ATS mode" below.

## Why this is safe to build on: the state layer already separates cleanly

`ResumeBuilderPage.jsx` already holds `formData` (via `cvFormReducer`) and
`selectedTemplate` (via `uiReducer`) as two independent pieces of state.
`CVForm` (the rail) and `CVPreview` (the live preview) are two *views* over
the same state — neither owns it. That's exactly the shape a second view
needs: Direct Edit is a third consumer of the same `formData`/
`dispatchFormData`, not a fork of the data model.

Confirmed every mutation Direct Edit needs is already a `FORM_ACTION` in
`src/reducers/cvFormReducer.js`, with these exact shapes:

| Action | Payload | Used for |
|---|---|---|
| `SET_ROOT_FIELD` | `{ field, value }` | Name, title, tagline, email, phone, location, about |
| `SET_LINK_FIELD` | `{ field, value }` | LinkedIn/GitHub/portfolio etc. |
| `UPDATE_ARRAY_ITEM` | `{ section, index, field, value }` | A single field inside one experience/education/project/… entry |
| `ADD_ARRAY_ITEM` | `{ section }` | "+ Add experience" — uses the existing `ARRAY_ITEM_FACTORIES[section]` |
| `REMOVE_ARRAY_ITEM` | `{ section, index }` | Deleting an entry |
| `MOVE_ARRAY_ITEM_TO_INDEX` | `{ section, fromIndex, toIndex }` | Drag-to-reorder entries (dnd-kit friendly, not just ±1) |
| `ADD_SKILL` / `REMOVE_SKILL` / `MOVE_SKILL` | `{ skill }` / `{ skill }` / `{ index, direction }` | Skills are a flat string array, not objects — separate actions |
| `TOGGLE_SECTION_VISIBILITY` | `{ section }` | Sections menu (below) |
| `MOVE_SECTION_ORDER` | `{ section, direction }` | Sections menu (below) |

No new reducer code. `npm run check:reducers` stays the regression net for
all of it, unchanged.

## Architecture

### 1. Mode toggle

New `uiReducer` slot, following the exact pattern `atsFriendlyMode`/
`selectedTemplate` already use:

- `builderMode: 'classic' | 'direct'`, new `UI_ACTION.SET_BUILDER_MODE`
  (`{ mode }`).
- **Persisted** in `localStorage` under a new
  `UI_BUILDER_MODE_STORAGE_KEY` (`src/utils/designSystem.js`, next to
  `UI_LOCALE_STORAGE_KEY`/`UI_NAV_RAIL_COLLAPSED_STORAGE_KEY`) — this is a
  real workflow choice, not an ephemeral per-session toggle like the
  accent swatch.
- **Default: `'classic'`.** Direct Edit ships opt-in first. See Phasing —
  promoting the default is a decision for after the rollout, not part of
  this build.
- Toolbar gains the mode switcher (mockup:
  [Direct edit builder](https://claude.ai/code/artifact/60b374b3-f50d-4aaa-ba4a-f799935b5c2a)).
  `ResumeBuilderPage.jsx` renders `CVForm` + `CVPreview` side by side for
  `'classic'`, or a new full-width `DirectEditPreview` for `'direct'` — a
  render branch at the same level that already exists for fullscreen
  preview, not a rewrite of the page's state.

### 2. The core mechanism: one shared editable-field primitive, not per-template forks

The real risk in this project is 18 bespoke Showcase components, each with
its own JSX printing `formData` fields as plain text. Two ways to make
that editable, and only one scales:

- **Rejected: a parallel `*DirectShowcase.jsx` per template.** Doubles
  the maintenance surface this project has spent this whole session
  trying to keep at "three files per template," not six. A change to
  Creative's bullet styling would need updating twice, with no check
  that both stayed in sync. Not proposed.
- **Chosen: a shared `EditableField` primitive, threaded into the
  existing Showcase files in place.** One new component,
  `src/components/EditableField.jsx`, reads a `DirectEditContext`
  (`{ isEditing: boolean, dispatchFormData }`) provided once by
  `DirectEditPreview` (and *not* provided — so it silently no-ops to
  plain read-only — in every other render path: Classic mode, the PDF/
  html2canvas export pass, the thumbnail gallery, and the print
  stylesheet). Call sites replace a literal text expression with the
  primitive:

  ```jsx
  // before (every Showcase today)
  <h1 className="portrait-showcase__name">{formData.fullName}</h1>

  // after
  <EditableField as="h1" className="portrait-showcase__name"
    path={{ kind: 'root', field: 'fullName' }} value={formData.fullName} />
  ```

  `EditableField` resolves `path.kind` (`root` / `link` / `arrayItem`) to
  the matching `FORM_ACTION` from the table above and dispatches on
  `onInput` (matching Classic mode's existing controlled-input feel — no
  per-keystroke debounce; `ResumeBuilderPage`'s existing 600ms history
  commit already debounces the *undo-history snapshot*, not the
  dispatch itself, so this needs no new debounce logic). Outside an
  active `DirectEditContext`, it renders the identical plain node
  (`<h1 className={className}>{value}</h1>`) it replaced — a no-op for
  every existing render path.

  This still means touching every Showcase file once per text field —
  that IS the Phase 2 rollout work (below). What it buys: after that
  one-time wrap, a template's own text/JSX changes automatically stay
  editable with no separate "direct" code path to drift out of sync.

- **`EditableList`** (new, `src/components/EditableList.jsx`) wraps a
  section's array render. It does not re-implement each template's entry
  JSX — it wraps the *existing* per-entry markup (already passed as
  `children`) with, in editing mode only: a hover-revealed drag handle
  (using `@dnd-kit`, the same library `SortableItemCard` already uses in
  Classic mode — dragging dispatches `MOVE_ARRAY_ITEM_TO_INDEX`) and a
  delete control (`REMOVE_ARRAY_ITEM`), plus a trailing "+ Add" affordance
  (`ADD_ARRAY_ITEM`) styled to the template's own list rhythm.
- **`EditableChip`** (new, small, in the same file) — skills' distinct
  `ADD_SKILL`/`REMOVE_SKILL`/`MOVE_SKILL` actions don't fit
  `EditableList`'s array-item shape, so they get their own thin wrapper.
- **Photo:** not a text field. In editing mode, clicking the rendered
  photo/monogram opens the same file picker `CVForm`'s existing "Choose
  image" button already triggers (reuses that upload handler directly,
  no new upload code).

### 3. What stays out of the preview: the Sections menu

A hidden section has no position in the rendered page to attach an inline
control to, and per-item visibility (`sectionItemVisibility`) has the same
problem for a single hidden entry. These, plus whole-section reordering,
move into one small toolbar popover ("Sections") that dispatches the exact
`TOGGLE_SECTION_VISIBILITY`/`MOVE_SECTION_ORDER`/
`TOGGLE_SECTION_ITEM_VISIBILITY` actions the Classic nav rail already
calls — same state, a different trigger.

Settings that aren't CV content at all (accent color swatch, ATS mode,
photo on/off) stay exactly where Classic mode already puts them: the
Settings modal and the toolbar, reachable from both modes identically.

### 4. ATS mode

Direct Edit always renders the bespoke Showcase, never the ATS-flat
renderer (`shared.jsx`). ATS-friendly mode is an *export* concern —
what gets rasterized/exported — not an editing surface; editing always
happens against the real template. Toggling ATS mode while in Direct
Edit has no visible effect on the editor itself, only on what a
subsequent export produces (matching today's already-existing "ATS mode
is a rendering choice, not a data choice" behavior).

### 5. Open risk to verify in Phase 1, not assumed here

`html2canvas`-based PDF export reads `data-export-section`/
`data-export-header`/`data-export-placement` attributes off Showcase DOM
nodes. Whether Direct Edit's `contenteditable` attributes and any
browser-injected editing chrome (`-webkit-user-modify`, spellcheck
underlines, the caret) can leak into an export taken while a user is
actively in Direct Edit mode needs a real spike against the actual
pipeline before Phase 1 is called done — this project has hit fragile
html2canvas behavior before (`filter: blur()` hanging exports, documented
in `docs/template-design-system.md` §8). If it's an issue, the fix is
narrow: export always reads from a plain (non-editing-context) render
pass, which the `DirectEditContext`-gated `EditableField` design above
already makes trivial (render the export snapshot without the context
provider).

## Testing plan

- `npm run check:reducers` — unchanged, still the net for every action in
  the table above; Direct Edit adds zero new cases.
- New `check:reducers`-style coverage is not needed for `EditableField`/
  `EditableList` themselves (they're UI, not state) — cover them with e2e
  instead, one spec file (`e2e/direct-edit.spec.js`) exercising: typing
  into a scalar field persists on blur and survives a template switch;
  adding/removing/reordering an experience entry; the Sections popover
  toggling a section's visibility; switching back to Classic mode shows
  the same data the Direct Edit session produced.
- Per-template coverage follows the same "one test per template" pattern
  already established for accent swatches (`e2e/templates.spec.js`) —
  added incrementally as each template is wired in Phase 2, not all at
  once.

## Phasing

This cannot land in one pass — it's an editable variant of every text
field across ~20 section types and 18 bespoke templates. Phased like the
A.3/A-fix batches earlier on this branch's parent:

1. **Infrastructure (this project's first implementation plan).**
   `uiReducer`'s `builderMode` + persistence, the toolbar mode switcher,
   `DirectEditContext`, `EditableField`/`EditableList`/`EditableChip`,
   the Sections popover, and the html2canvas risk spike above — all
   wired end-to-end against **one reference template**. Minimalist is
   the natural choice: it's the flat/simplest template (no bespoke
   Showcase, renders through `shared.jsx` directly), so it exercises the
   primitives against the simplest possible DOM before any bespoke
   template's CSS is in the mix.
2. **Rollout.** Wire the same primitives into the other 17 templates,
   grouped by structural family (`docs/template-design-system.md` §5) —
   the 6 `oneColumn` members share the most DOM shape, so they're the
   next cheapest batch; `labelGridTable`'s European and `gridTable`'s
   Quadrant are the most structurally distinct and likely the most
   expensive per-template. One template (or family) per implementation
   round, matching this branch's parent's own per-template cadence.
3. **Polish.** Keyboard tab order matching visual reading order; mobile
   `contenteditable` behavior (a real, separate risk — iOS Safari's
   `contenteditable` handling has known quirks this project hasn't had
   to deal with yet); screen-reader behavior on a page that's mostly
   `contenteditable` regions; a decision on promoting `direct` to the
   default `builderMode` once enough templates are covered.

Phase 1 gets its own implementation plan next (`writing-plans`). Phases 2
and 3 get their own plans when Phase 1 ships, the same way A.3's three
templates were each their own round rather than one giant plan.
