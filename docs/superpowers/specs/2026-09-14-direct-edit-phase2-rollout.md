# Direct Edit builder — Phase 2 rollout roadmap

**Status update (2026-09-19):** the per-template inline rollout this doc
plans is no longer the critical path for editability — the universal
popup section editor (spec:
`docs/superpowers/specs/2026-09-19-direct-edit-universal-sections-design.md`)
reaches every field on all 18 templates with zero per-template code.
This doc's plan and its per-template inline wiring remain a valid
incremental enhancement (inline editing feels lighter-weight than a
popup for the fields it covers), but nothing here is required for a
template to be fully editable.

**Status:** planning. Phase 1 (spec:
`docs/superpowers/specs/2026-09-13-direct-edit-builder-design.md`, plan:
`docs/superpowers/plans/2026-09-13-direct-edit-builder-phase1.md`) shipped
one reference template (Minimalist) end-to-end and is live on `v1.3.0`.

## What Phase 2 is

Extend Direct Edit's inline editing to the other 17 templates, and lock
in two standing rules for every round:

1. **Sections only ever appear if the template actually uses them.**
   Already true by construction, not new work: `SectionsMenu` takes
   `templateConfig` as a prop and filters `normalizeSectionOrder(...)`
   down to `[...primarySections, ...secondarySections]` before rendering
   a single checkbox — this generalizes to any template automatically,
   confirmed working for Minimalist's 5-section set in Phase 1. Verify
   this per template as part of its round, don't re-implement it.
2. **Every template must be usable in Classic and/or Direct Edit.**
   Classic already works for all 18 (untouched by this whole effort).
   "Usable in Direct Edit" means: in `INLINE_EDIT_SUPPORTED_TEMPLATES`
   (`src/utils/directEdit.js`), its identity/About/Experience/Skills (at
   minimum — see scope per round below) are genuinely editable in place,
   and it has its own e2e test — not just "doesn't crash when selected."

## The real shape of the work (corrected understanding — read before planning a round)

Phase 1's wiring lives in `src/components/CVPreview.jsx`'s **shared flat
renderer** — the code Task 6/7 touched (`t.experienceLayout === 'clean'`,
`t.skillsLayout === 'flat'`, `t.headerContactMode === 'piped'`, the
identity block). That code path is reached by exactly two things:

- Minimalist, whose *only* visual is the flat renderer (no bespoke
  Showcase file exists for it).
- ANY template when the app's separate ATS-friendly toggle is on
  (`!atsFriendlyMode` guards every bespoke branch).

**Every other template has its own bespoke Showcase component**
(`DeveloperShowcase.jsx`, `CreativeShowcase.jsx`, `ExecutiveShowcase.jsx`,
…, 17 files) with its own hand-written JSX, reading `snapshot.fullName`/
`snapshot.about`/etc. directly — none of it shares code with the flat
renderer's `'clean'`/`'flat'`/`'piped'` branches. Confirmed directly: a
grep of every template's `experienceLayout`/`skillsLayout`/
`headerContactMode` config values looked promising at first (many
templates share `'clean'`/`'flat'` with Minimalist), but those config
values only govern the flat renderer, and Direct Edit always renders with
`atsFriendlyMode={false}` (per Phase 1's own spec — Direct Edit shows the
bespoke look, never the ATS-flat one), so a shared config value does
**not** mean a template's Direct Edit wiring is any cheaper. There is no
shortcut here — do not assume a template is "mostly free" without
opening its actual Showcase file.

**Two structural things, corrected after actually reading the file (the
first pass of this roadmap got the right problem but the wrong fix):**

1. `DirectEditProvider` currently wraps only the flat renderer's own
   `return` — none of the 17 bespoke-Showcase early-return branches in
   `CVPreview.jsx` are inside it. `useDirectEdit()` called from inside any
   bespoke Showcase today gets the inert default
   (`{isEditing:false, dispatchFormData:null}`) regardless of what's
   passed in, because no Provider wraps that render path.
   **Originally this doc suggested relocating the wrap to cover the
   entire `CVPreview` function in one refactor — don't do that.**
   `CVPreview.jsx` is ~2000 lines with 17 sequential early returns; a
   single top-level wrap would mean restructuring every one of them
   (early returns can't sit inside a wrapping element without either
   converting the whole function to a variable-then-render-once shape,
   or duplicating the wrap 17 times anyway) — a large, high-blast-radius
   change touching templates that aren't even part of the round doing
   it, for a one-time convenience. **Instead: wrap `DirectEditProvider`
   locally around just the Showcase branch being wired, each round.**
   It's one JSX element added around one `<Suspense><XShowcase .../></Suspense>`
   call — cheap, mechanical, and the diff for a round stays scoped to
   the template that round actually touches, matching this project's
   own minimal-diff convention. Repeating it 17 times costs one line
   each; refactoring the whole function to avoid that costs a much
   larger, riskier diff for no real benefit.
2. None of the 17 bespoke Showcase call sites in `CVPreview.jsx` pass
   `directEditDispatch` as a prop (confirmed: `DeveloperShowcase`'s call
   site only passes `formData, locale, previewRef, templateConfig,
   showcaseConfig`). Each template's round adds this prop to its own
   call site (mechanical, one line) and threads it into that Showcase's
   own top-level props.

## Known risk to fix proactively, not rediscover

The final whole-branch review's Critical #1 (every skill rendered twice)
was specifically a flat-skills bug. A Showcase that renders skills grouped
under category headings via `parseSkillCategories` has a different code
shape, and the categorized-aware chip it needs **already exists**:
`EditableCategorizedChip` (`src/components/EditableList.jsx`), designed in
Round 5 (Compact) and reused in Round 6 (Executive). It groups chips for
display and dispatches against each skill's original `formData.skills`
index via `buildEditableSkillCategories` (`templates/shared.jsx`). A new
categorized round reuses it rather than designing a new one.

**Actual skills rendering, verified 2026-09-29 by reading each Showcase
file** (the `skillsLayout` config value is shown only to prove it is
unreliable; it governs the flat ATS renderer, not the Showcase):

| Template | Showcase renders | Config says | Inline chip to reuse |
|---|---|---|---|
| Compact (wired) | categorized chips | `flat` | `EditableCategorizedChip` |
| Executive (wired) | categorized chips | `categorized` | `EditableCategorizedChip` |
| Creative (wired) | **flat** (categories used only for display order) | `categorized` | `EditableChip` |
| Modern Professional | categorized chips | `flat` | `EditableCategorizedChip` |
| Graduate | categorized chips | `flat` | `EditableCategorizedChip` |
| Portfolio Hybrid | categorized badges | `flat` | `EditableCategorizedChip` |
| Developer | categorized chips | `categorized` | `EditableCategorizedChip` |
| Quadrant | categorized chips | `categorized` | `EditableCategorizedChip` |
| Tech Executive | categorized **comma-joined text**, one `Label: a, b, c` line per group, no chips | `categorized` | neither fits as-is (see below) |
| European | categorized **comma-joined text** in label/value rows, no chips | `flat` | neither fits as-is (see below) |
| Navy Professional | flat chips | `flat` | `EditableChip` |
| Colorful Compact | flat chips | `flat` | `EditableChip` |

So the earlier version of this section had it wrong in two ways: Creative
is flat (Round 8), and Modern Professional, Graduate, Portfolio Hybrid and
European all render categorized despite a `flat` config. **Tech Executive
and European are the genuinely new design problem**: their skills are
plain comma-separated text, not chips, so dropping `EditableCategorizedChip`
in would change the read-only look of the section. Their round has to
decide between editing each group's text as a delimited field (which
cannot map back onto `formData.skills` cleanly, since categories are
derived by regex, not stored) and showing chips only while editing. Budget
real design time for that one; it is not "the same as Skills, reskinned."

A template's `skillsLayout` config value has been proven wrong in BOTH
directions (Compact and four others: said `'flat'`, render categorized;
Creative: said `'categorized'`, renders flat). The config value predicts
nothing about a bespoke Showcase — always read the actual Showcase file
before planning a round, and re-check this table against it.

Round 4's final whole-branch review found a second standing risk, of the
same "will recur unless checked proactively" shape: `EditableField`
(`src/components/EditableField.jsx`) dispatches a field's edited value
via `event.currentTarget.innerText`, and `innerText` — unlike
`textContent` — reflects CSS `text-transform`. Any template whose new
`EditableField` sits inside an element styled `text-transform: uppercase`
(or any other transform) with no override will silently SAVE the
transformed text instead of what the user actually typed, corrupting
`formData` on the very first edit — not a display bug, a data-loss bug,
and the original casing is unrecoverable once overwritten. Confirmed
live in production twice already: Modern Timeline's name/title (Round 4,
caught and fixed) and Classic Professional's title (shipped since
Round 1, undetected for three rounds because no e2e test had ever
round-tripped a *title* field, only names — fixed in Round 4's final fix
wave once found). **Before wiring any identity/title field in any future
round, grep that template's stylesheet for `text-transform` on the class
hosting the new `EditableField`, in the SAME task that wires it** —
exactly parallel to the existing "style the CSS class in the same task"
rule above for the categorized-skills case. The `railTable` family
(Executive, Modern Orange, Creative, Modern Professional, Graduate,
Portfolio Hybrid, Tech Executive, Colorful Compact) uses uppercase
kickers/rail labels heavily — expect this to recur there specifically.
Fix pattern, already proven twice: `.template__field .direct-edit-field
{ text-transform: none; }`, scoped to the editable span only so the
read-only render (Classic mode, exports, share links) is untouched.

Executive's final whole-branch review (Round 6) found a third standing
risk of the same shape: `EditableList` wraps every entry in a
`.direct-edit-entry` div, which breaks any stylesheet rule that targets
its entry class with `:first-child`/`:last-child` (the wrapper, not the
entry, is now the positional sibling) — silently killing inter-entry
dividers/spacing in Direct Edit mode while read-only mode still looks
correct.

**The originally-recommended fix here — re-anchoring onto
`.direct-edit-entry` with `:first-of-type`/`:last-of-type` — does NOT
work and has now shipped broken twice (Modern Orange Round 7, and
retroactively found already-shipped on Executive Round 6).**
`EditableList`'s `DndContext` (no `accessibility.container` configured)
mounts an un-portaled accessibility live-region — two extra untyped
`<div>` siblings (`HiddenText`, `LiveRegion` from
`@dnd-kit/accessibility`) — after the last `.direct-edit-entry` once
mounted, so `:last-of-type` never actually matches the true-last
wrapper. Do not use this pattern.

**Correct fix**: drive "is this the first/last entry" from the JS
`isFirst`/`isLast` index computation (already correct, computed the
same way every round: `index === 0` / `index === items.length - 1`) via
a CSS **modifier class** applied directly in the component's
`className` — never a CSS positional pseudo-class.

**Partition requirement (found on Executive)**: if the entry's CSS
class is *also* used by another, still-unwired (read-only-only) section
on the same template (Executive's case: Leadership and Education both
reuse `.executive-showcase__entry`), the modifier-class approach needs
an explicit "opt-out" marker — e.g. a `--wired` class applied
unconditionally to every entry that goes through the wired render
function — so the position-based rules can be scoped to exclude it
(`:not(.entry--wired)`). The two mechanisms must be mutually exclusive
by selector, not by relying on CSS specificity or source-order
tie-breaking, which is fragile.

**Before wiring `EditableList` into any future template, grep its
stylesheet for `:first-child`/`:last-child`/`:first-of-type`/
`:last-of-type` on the entry class, in the same task**, and re-anchor
any match onto the entry class itself using an `isFirst`/`isLast`
modifier class (per above), not a positional pseudo-class on any
wrapper. `src/styles/templates/navyProfessional.css` carried the identical
`:not(:first-child)`/`:last-child` pair on an entry class shared with
Education; fixed in the Navy Professional round (v1.2.69) without a
partition marker, by having BOTH sections set `--first`/`--last` and
deleting the positional rules outright. When every user of a shared entry
class can compute its own index, that is simpler than Executive's
`--wired` opt-out.

## Rollout order — one structural family at a time

Per `docs/template-design-system.md` §5's archetype table (also the exact
grouping `DOCX_ARCHETYPES` in `src/utils/docxArchetypes.js` already uses
for a different feature, C2/C3 — reuse the same mental model, not the
same code):

| Order | Family | Templates | Why this order |
|---|---|---|---|
| 1 | `oneColumn` (5 remaining) | Classic Professional, Editorial, Portrait, Modern Timeline, then Compact last | Closest visual shape to Minimalist (single column, no rail) — cheapest to verify the "bespoke Showcase, not flat renderer" wiring pattern generalizes correctly before tackling a structurally different family. Checked each Showcase's actual skills rendering directly (config values don't reflect it — see above): Classic Professional/Editorial/Portrait/Modern Timeline all render a genuinely flat `snapshot.skills.map(...)` list, reusable with the existing `EditableChip` unchanged. **Compact is the outlier** — despite `skillsLayout: 'flat'` in its config, `CompactShowcase.jsx` always renders skills grouped via `parseSkillCategories`, the same categorized-chip design problem flagged above. Sequence Compact last in this family, after the categorized-chip design is actually settled (ideally during this family's own work, once a flat-skills round or two has proven the wiring pattern) — not first, where it would force that design decision before anything else has landed. |
| 2 | `railTable` (8) | Left rail: Executive, Modern Orange. Right rail: Creative, Modern Professional, Graduate, Portfolio Hybrid, Tech Executive, Colorful Compact | Largest family — once the first one's rail+main wiring pattern is proven, the rest should move faster. Done so far: Executive, Modern Orange, Creative, Colorful Compact, Modern Professional, Graduate, Portfolio Hybrid. Modern Professional and Portfolio Hybrid both needed the timeline connector's `:last-child` replaced with a `--last` class (Graduate's rail is on Internships, so it never hit this). The one remaining, Tech Executive, renders comma-joined text that needs its own design decision — see the verified table above. |
| 3 | `darkSidebarTable` (2) | Developer, Navy Professional | Same rail mechanism as `railTable` plus a dark-fill/light-text palette swap — do after `railTable` so the rail pattern is already proven, not simultaneously. Navy Professional done (v1.2.69): its identity and contact live on the dark sidebar, and Direct Edit's generic "+ Add" chip needed a light override there (it read ~3:1); its uppercase role needed the `text-transform: none` override. Developer done (v1.2.70): its dark rail needed the same "+ Add" override plus one for the chip-group labels, and its gradient-text name (`color: transparent`) left the inline field with an invisible caret until given a `caret-color`. |
| 4 | `gridTable` (1) | Quadrant | Structurally distinct (2×2 grid, `categorized` skills) — no family to amortize cost across, budget it as its own round. Done (v1.2.71): each section stays in its fixed cell (no column router), so it needed only the usual entry `--first`/`--last` and `pre-line` fixes. |
| 5 | `labelGridTable` (1) | European | Most distinct reading pattern (label/value rows, not flowing prose) — last, and expect it to need the most novel `EditableField` usage of any template so far. |

This order is a recommendation, not a hard rule — if a specific template
turns out to need design decisions that stall a round, skip to the next
and come back, the same way this project's earlier template-rework
batches handled blockers.

## What each round covers (per template or family)

Matching Phase 1's own scope boundary, not expanding it: each round wires
identity (name/title/contact) + About + Experience + Skills for its
template(s) — the same 4 section types Phase 1 covered for Minimalist.
Education/Links/Languages/Certificates/etc. remain read-only across every
template until a later pass, exactly as they are for Minimalist today —
this is a deliberate, consistent boundary, not scope creep per round.

Each round:
1. Adds the template's id to `INLINE_EDIT_SUPPORTED_TEMPLATES` (named
   `DIRECT_EDIT_SUPPORTED_TEMPLATES` when this doc was written; renamed
   in v1.2.47 once the popup made every template editable).
2. Threads `directEditDispatch` into that template's Showcase call site
   and component signature.
3. Wires `EditableField`/`EditableList`/`EditableChip` into that
   Showcase's own JSX for the 4 section types above, following the exact
   same no-op-when-not-editing contract Phase 1 established (read the
   `EditableField.jsx`/`EditableList.jsx`/`SectionsMenu.jsx` header
   comments — they're already written as the contract for this).
4. Verifies the trim/no-op/caret-preservation properties hold — these are
   properties of the shared primitives, not re-proven each time, but
   confirm the new call sites use the primitives correctly (e.g. don't
   reintroduce Critical #1's class of bug by leaving a plain read-only
   render un-gated next to a new `EditableChip`).
5. Adds one e2e test for that template (mirrors the existing "choosing a
   swatch recolors the `<template>` preview" one-test-per-template pattern
   in `e2e/templates.spec.js` — same file, same convention, a Direct Edit
   equivalent).
6. Full verification pass (lint, `check:reducers`, `check:direct-edit`,
   build, full `test:e2e`) before the round is called done.

Get an implementation plan (via `superpowers:writing-plans`) for each
round before starting it — do not write one plan covering multiple
templates at once; each is reviewed on its own, matching how Editorial/
Portrait/European were each their own round in the parent roadmap.

## Standing constraints carried from Phase 1 (still binding for every round)

- No new `cvFormReducer` actions — every new call site dispatches one of
  the existing `FORM_ACTION` cases Phase 1's primitives already use.
- Commits carry only the repo's own git identity, no AI/Claude
  co-authorship trailer.
- `formData` (raw) vs `snapshot` (trimmed) — `EditableField`'s read-only
  branch already trims internally (fixed in Phase 1's final review), so
  passing raw `formData.x` as `value` is correct and safe at every new
  call site; don't re-derive a trimmed value before passing it in.
- Two gating-convention styles currently coexist in the codebase
  (unconditional `<EditableField>` relying on its own no-op vs. explicit
  `directEditDispatch ? <EditableField/> : (raw)` ternaries) — prefer the
  unconditional form for new call sites unless the raw fallback needs a
  materially different expression (e.g. a different source array, as
  Task 6's contact-row ternary needed).
