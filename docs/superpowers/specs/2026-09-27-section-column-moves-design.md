# Direct Edit: moving sections between columns — design spec

**Status:** approved design, not yet planned or implemented.
**Date:** 2026-09-27
**Closes:** `todo.md` item 60. Also closes a pre-existing gap found during
design: Navy Professional's and Modern Orange's sidebar sections have no
Direct Edit pencil (see "Unit 1").

## Goal

On a two-column template, the user can move a section from the main column
to the sidebar or back, from the Direct Edit section popup. The result shows
everywhere the CV is rendered: the preview in both builder modes, ATS mode,
PDF and DOCX export, share links, JSON export/import and session restore.

Today column placement is template config (`primarySections` /
`secondarySections` in `src/utils/cvTemplates.js`), not user data. Reordering
within a column already works (`getColumnNeighbourSection`,
`MOVE_SECTION_ORDER`).

## Decisions

These were settled during brainstorming and are binding for the plan.

1. **Proven set, not free movement.** Any section may move into the main
   column. A section may move into the sidebar only if some template already
   designs it for a sidebar. That set is the union of every template's
   `secondarySections`: `skills`, `links`, `certificates`, `education`,
   `languages`, `interests`, `coreStrengths`, `memberships`, `achievements`,
   `projects`. `about`, `experience` and the other long narrative sections
   stay in main. They would be cramped in a ~250px rail and would paginate
   badly, because the PDF exporter picks page breaks from the main column
   only (see `collectCanvasPageBreakpoints` in `src/utils/exporters.js`).
2. **The control lives in the Direct Edit popup only.** There is no Classic
   mode control, no Sections-menu control and no drag between columns.
   Classic mode and every export still *show* the result.
3. **Approach B: reuse the home renderer and let CSS adapt it.** A moved
   section renders with the markup its home column already uses, placed in
   the other column's container. This is not bespoke per-column markup,
   which would mean 77 new section renderings across 11 templates, and not a
   generic fallback renderer, which would look off-brand everywhere.
4. **Scope is the 11 `layout: 'split'` templates:** Developer, Creative,
   Modern Professional, Executive, Graduate, Portfolio Hybrid, Tech Executive,
   Navy Professional, Modern Orange, Colorful Compact, Quadrant. The 7
   `stacked` templates have no second column, and the control never appears
   on them.
5. **Placement is per template**, like `photoVisibilityByTemplate`. Each
   template's sidebar is a different design, so Skills moved to main on
   Creative does not follow the user to Developer.
6. **No new `cvFormReducer` action.** Writes go through the existing generic
   `SET_ROOT_FIELD`.

## Data model

A new root formData field:

```js
sectionColumnsByTemplate: {
  [templateId]: { [sectionKey]: 'main' | 'sidebar' },
}
```

- It stores **overrides only**. A missing entry means the template default,
  and the default value is `{}`.
- Choosing a section's home column **deletes** its entry, rather than storing
  a value equal to the default. A move and its reverse therefore leave
  formData byte-identical to where it started, and share links never carry
  no-op entries.
- Order within a column is untouched. `sectionOrder` stays one global array,
  so a moved section slots into its new column by its existing relative
  position, and the popup's ↑/↓ then move it within that column.

Typedef in `src/types/cv.d.ts` alongside `photoVisibilityByTemplate`.

## Module: `src/utils/sectionColumns.js`

Pure functions with no React. They are the single source of the rules.

- `MOVABLE_TO_SIDEBAR`: the proven set from Decision 1, as a frozen array.
- `canMoveSection(baseTemplateConfig, sectionKey)`: true only when all of
  these hold:
  - the template's `layout === 'split'`;
  - the template's `columnMoves === true` (the rollout flag, see below);
  - the section is in the template's `primarySections` or `secondarySections`;
  - the section's home column is the sidebar, or the section is in
    `MOVABLE_TO_SIDEBAR`.
- `getSectionColumn(effectiveTemplateConfig, sectionKey)` returns
  `'main' | 'sidebar' | null`.
- `setSectionColumn(overridesByTemplate, baseTemplateConfig, sectionKey,
  column)` returns the next whole `sectionColumnsByTemplate` map. It deletes
  the entry when `column` is the home column, and deletes the template's key
  when its map becomes empty.
- `getEffectiveTemplateConfig(baseTemplateConfig, overridesByTemplate)`
  returns a new config with `primarySections` / `secondarySections` rebuilt
  from the overrides, plus two additions:
  - `defaultSecondarySections`, the untouched original `secondarySections`,
    which the Showcases use for routing;
  - `baseConfig`, a reference to the unmodified input config, which the popup
    passes to `canMoveSection` / `setSectionColumn`.

  It **ignores** any entry that `canMoveSection` rejects, any value other
  than `'main'`/`'sidebar'`, and any key whose template is not the current
  one. A hand-edited JSON file, an old share link or a flag being switched off
  can therefore never corrupt a template. Relative order inside each rebuilt
  array follows the base config's combined order.

## Plumbing: one application point

`currentTemplate` in `src/pages/ResumeBuilderPage.jsx` (currently
`getCvTemplate(selectedTemplate, locale)`) becomes the effective config,
memoised on the base config and `formData.sectionColumnsByTemplate`. Every
consumer inherits it without per-consumer changes:

- CVPreview and every Showcase (they read `templateConfig.primarySections` /
  `secondarySections`)
- CVPreview's flat ATS renderer (`CVPreview.jsx`, the
  `primarySections`/`secondarySections` split)
- the PDF exporter (`exporters.js`) and the DOCX exporter (`docxExport.js`,
  which reads `secondarySections`)
- `SectionsMenu`, `CVForm`, and the popup's `getColumnNeighbourSection`, so
  ↑/↓ follow a moved section into its new column with no change

The plan must confirm each exporter's `templateConfig` really comes from
`currentTemplate`. Any call site that re-derives the base config (e.g. via
`getCvTemplate`) must switch to the effective one.

Template gallery thumbnails are out of scope and keep showing each template's
default layout.

## Persistence

- **JSON import/export.** `src/utils/cvForm.js` validates and normalises
  `sectionColumnsByTemplate` with the same shape checks
  `photoVisibilityByTemplate` gets: it must be a plain object of plain
  objects, and values must be `'main'`/`'sidebar'`. A missing field imports
  as `{}`. Rule-level validity (the proven set etc.) is not enforced at
  import. `getEffectiveTemplateConfig` ignores anything invalid at render
  time, so a rule changing later never makes an old file un-importable.
- **Share links.** `src/utils/shareLinks.js` gets a new short key, `sc`, for
  this field, omitted when empty. The key must be unused: current keys are
  `a e f l p pv s so sv t x`, and existing keys are never repurposed.
  `check:share`'s full-CV round trip includes a non-empty
  `sectionColumnsByTemplate`.
- **Session restore** snapshots formData, so it needs no change. The plan
  should verify that rather than assume it.

## Rendering: per template

In each of the 11 templates:

1. **Routing.** A section renders through its **home** renderer, whichever
   column it is displayed in:
   ```js
   const homeSidebar = new Set(templateConfig.defaultSecondarySections)
   const renderSection = (key, placement) =>
     (homeSidebar.has(key) ? renderSidebarSection : renderMainSection)(key, placement)
   ```
   Both column lists (`mainSectionKeys` / `sidebarSectionKeys`) map through
   `renderSection` with their own placement. Quadrant's renderers are named
   `renderNarrativeSection` / `renderExtraSection`, and the plan maps them
   accordingly. Developer's existing `!showSidebar` branch already renders
   sidebar markup in the main flow, which is evidence the markup survives
   the move.
2. **Placement follows the real column.** Every `placement="main"` /
   `placement="side"` literal passed to a template's `Section` becomes the
   `placement` parameter. The wrapper's `data-export-placement` is then
   correct for the PDF exporter:
   - a section moved into main takes part in page-break decisions;
   - one moved into the sidebar is excluded, like other sidebar content.

   Where a `Section` derives styling from placement (Developer's
   `dev-showcase__section--sidebar` / `--main` tone class), that styling
   follows too.
3. **Moved marker.** When the displayed column differs from the home column,
   the section wrapper gets `data-moved-from="side"` or `"main"`. It is the
   only hook the CSS below needs.
4. **CSS adaptation.** One scoped block per template in
   `src/styles/templates/<name>.css`, keyed on `[data-moved-from]`, adapts a
   moved section to its new surface. The expected work is mostly colour
   context:
   - Developer, Navy Professional and Modern Orange have dark or coloured
     sidebars, so sidebar-styled text needs main-column colours when moved
     out, and main-styled text needs sidebar colours when moved in.
   - The other 8 templates have light-tinted sidebars and are expected to
     need only spacing tweaks.

   Each template is checked by screenshot in both directions and by a PDF
   export.
5. **Rollout flag.** `columnMoves: true` on the template's entry in
   `cvTemplates.js` is set in the same unit that lands its CSS block. Until
   then `canMoveSection` is false for that template and it behaves exactly
   as today.

### Unit 1 prerequisite: Navy / Modern Orange sidebar tagging

`SidebarBlock` in `NavyProfessionalShowcase.jsx` and
`ModernOrangeShowcase.jsx` renders no `data-export-section`, so the Direct
Edit overlay (which finds sections by that attribute) shows no pencil for
their sidebar sections: Navy's Skills and Languages, and Modern Orange's
Skills, Languages and Education. `SidebarBlock` gains an `id` prop rendered as
`data-export-section={id}` plus `data-export-placement="side"`, matching every
other template's sidebar sections. The plan must check the PDF exporter's
sidebar handling is unaffected on those two templates (export e2e, both ATS
modes). This ships first, as its own fix.

## The popup control

In `src/components/SectionEditorPopup.jsx`, one row directly under the header,
rendered only when `canMoveSection(baseTemplateConfig, sectionKey)`:

```
Column   [ Main | Sidebar ]            (fi: Sarake  [ Pääsarake | Sivupalkki ])
```

- It is two `<button type="button">`s with `aria-pressed`, in a
  `role="group"` whose `aria-label` is "Column" / "Sarake". Both sit inside
  the existing focus trap.
- Labels say Main/Sidebar, never left/right, because sidebars sit on
  different sides in different templates.
- It is hidden, not disabled, for sections that cannot move, and on stacked
  templates.
- Clicking the unpressed side dispatches one `SET_ROOT_FIELD` with
  `field: 'sectionColumnsByTemplate'` and the map from `setSectionColumn`.
  That is one undo step. Clicking the pressed side does nothing.
- After a move the popup stays open. The overlay's existing
  re-measure-on-formData effect finds the section by key in its new place,
  and the side-flip placement recomputes for the new geometry. Focus stays
  on the pressed button, and ↑/↓ enable according to the new column.
- The popup needs the **base** template config for `canMoveSection` and
  `setSectionColumn`. It reads it from `templateConfig.baseConfig`, which
  `getEffectiveTemplateConfig` attaches (see the module section), so no new
  prop is threaded through the overlay.

## Testing

TDD throughout: each unit starts with a failing test watched failing for the
right reason.

- **`check:section-columns`** (new `scripts/check-section-columns.mjs`,
  framework-free like the other `check:*` scripts, added to `package.json`):
  - `canMoveSection`: split only, flag only, supported sections only, the
    proven set only for main-to-sidebar, any sidebar section to main
  - `setSectionColumn`: a home-column choice deletes the entry, and an empty
    template map is removed
  - `getEffectiveTemplateConfig`: overrides applied, stale/invalid/foreign
    entries ignored, `defaultSecondarySections` preserved, relative order
    kept
- **`check:share`** round-trips `sc`.
- **e2e, unit 1:** the popup opens from Navy's Skills and Modern Orange's
  Education.
- **e2e, Creative end to end (unit 3):**
  - Moving Skills to main puts it outside `[data-export-secondary]` with
    `data-export-placement="main"`.
  - Moving it back restores it and removes the override.
  - ↑/↓ follow the new column.
  - The move survives a Classic round trip and a share link.
  - PDF export succeeds with a moved section.
  - No control shows for Experience on Creative, or for any section on
    Minimalist.
- **e2e sweep, which grows with the rollout.** For every template with
  `columnMoves`, for every movable section, it moves the section to the other
  column and asserts:
  - it is in the right container (`[data-export-secondary]` or not)
  - `data-export-placement` matches the column
  - it has non-zero height
  - its heading's text/background contrast is ≥ 3:1, measured against the
    nearest ancestor with an opaque background

  The contrast assertion is the automated guard against approach B's main
  risk: white sidebar text landing on a white main column, or the reverse.
- Full suite before each unit is called done: `lint`, `check:reducers`,
  `check:share`, `check:direct-edit`, `check:section-schema`,
  `check:section-columns`, `build`, `test:e2e`.

## Rollout order

Each unit is one feature commit, one standalone patch bump and one
`changes.md` entry.

1. Navy / Modern Orange sidebar tagging (the pencil fix).
2. Plumbing: `sectionColumns.js`, the effective config, JSON and share-link
   persistence, `check:section-columns`. No template is flagged, so there is
   no visible change.
3. Popup control plus Creative (flag, routing, placement, CSS), with the
   end-to-end tests and the sweep test's first entry.
4. Light-sidebar templates in two or three units: Modern Professional,
   Executive, Graduate, Portfolio Hybrid, Tech Executive, Colorful Compact,
   Quadrant.
5. Developer.
6. Navy Professional.
7. Modern Orange.

`todo.md` item 60 is marked done in place after unit 7. The sidebar-pencil
gap gets its own todo entry, marked done after unit 1.

## Out of scope

- Moving sections on single-column templates (no second column exists).
- Moving narrative sections (`about`, `experience`, …) into a sidebar.
- Drag-and-drop between columns; any Classic-mode or Sections-menu control.
- A "reset layout" button (moving each section back already does it).
- Reflecting overrides in template gallery thumbnails.
