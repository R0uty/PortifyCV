# Changes

Running log of notable work, newest first. Fuller reasoning and verification
notes for each item live in `todo.md`; per-commit detail is in git history.
(This file replaces the old `CHANGELOG.md`, folded in below.)

## Direct Edit: Modern Timeline is now editable, and a shared pattern replaces three near-identical copies — 2026-09-17

Modern Timeline is now editable in Direct Edit mode (Phase 2 Round 4),
with the same scope every prior round has used:
identity, About, Experience, and Skills are all inline-editable in the
live preview. Its Experience entries render inside a distinct
`TimelineRow` component (a vertical-timeline visual with the date in its
own column), so this round also extracted the `renderExperienceEntry`
pattern — previously copied nearly identically across Classic
Professional, Editorial, and Portrait — into one shared function those
three templates now call, and collapsed five near-duplicate e2e "smoke
tests" into two shared, parameterized checks covering all four
templates (Modern Timeline included). Classic Professional's contact
row gains automated empty-placeholder coverage it never had, as a side
effect of the shared test shape.

Writing that shared test shape surfaced a genuine, pre-existing bug:
Modern Timeline's name and title fields sit inside elements styled
`text-transform: uppercase`, and `EditableField` dispatches a field's
new value from `event.currentTarget.innerText`, which (unlike
`textContent`) reports CSS-transformed text — so editing the name in
Direct Edit mode was silently saving it in all caps into formData (and
from there into Classic mode, exports, and share links). Fixed by
overriding `text-transform: none` on the live `.direct-edit-field` span
only (`src/styles/templates/timeline.css`); the read-only, all-caps
look is unchanged everywhere Direct Edit isn't active. Classic
Professional's title field uses the same uppercase-styling pattern and
is a candidate for the same latent bug, but no current test exercises
it — flagged separately rather than fixed here.

## Direct Edit: Portrait is now editable — 2026-09-16

Portrait is the fourth template wired into Direct Edit mode (Phase 2
Round 3), with the same scope every prior round has used: identity,
About, Experience, and Skills are all inline-editable in the live
preview. LinkedIn stays read-only, matching every prior round. The
photo/monogram rail is unaffected — it's out of this round's scope.

## Direct Edit: Editorial is now editable — 2026-09-16

Editorial is the third template wired into Direct Edit mode (Phase 2
Round 2), with the same scope every prior round has used: identity,
About, Experience, and Skills are all inline-editable in the live
preview. LinkedIn stays read-only, matching every prior round.

## Direct Edit: fixed the footer genuinely overlapping long CVs — 2026-09-15

A real regression that survived an earlier "footer overlap" investigation
this same week: `.builder-section`'s `flex: 1; min-height: 0` sizing
(needed so Classic mode's own panels can scroll inside a viewport-bounded
box) meant Direct Edit's preview — which has no such internal scroll and
is meant to grow the whole page — never forced its container to actually
grow past a single viewport height. For any CV long enough to overflow
one screen (most real CVs), the tail of the preview just overflowed
visually past `.builder-section`'s boundary, and the footer, positioned
in normal flow right after that box, ended up sitting partway down the
page instead of after the real content — visually overlapping straight
through the rest of the CV, not just its very bottom edge. The earlier
`position: sticky` → `static` fix on the footer was necessary but not
sufficient; this is the actual root cause. Fixed by restoring the default
`min-height: auto` on `.builder-section` for Direct Edit mode specifically
(`.one-pager--direct-edit .builder-section`), which still lets it grow to
fill the viewport for a short CV (the standard flexbox sticky-footer
pattern) while now also growing past one viewport for a longer one.
Verified live (before/after DOM measurement) and added a permanent e2e
regression test.

## Direct Edit: Classic Professional is now editable — 2026-09-15

Classic Professional is the second template wired into Direct Edit mode
(Phase 2 Round 1), with the same scope as Minimalist's Phase 1 wiring:
identity, About, Experience, and Skills are all inline-editable in the
live preview. A final whole-branch review of this round also caught and
fixed two real bugs before it shipped: a missing CSS rule on the
Experience description's editing state that silently collapsed multi-line
descriptions into one line (real data loss, not just a rendering glitch),
and a leading-comma display regression in Classic mode for experience
entries that have a location but no company.

## Direct Edit: more bottom padding, still read as cramped — 2026-09-14

Follow-up to the padding fix below — 2rem all around wasn't enough
specifically at the bottom (the site footer has no padding of its own
above its border/text, so the same gap that read as fine above the card
read as cramped below it). Bottom padding on `.direct-edit-preview`
bumped to 3.5rem; top/sides unchanged at 2rem/1.5rem.

## Direct Edit: breathing room around the preview — 2026-09-14

`.direct-edit-preview` had zero padding — the CV's white "paper" card sat
flush against the toolbar above and the footer below with no gap.
Added 2rem vertical / 1.5rem horizontal padding on the wrapper.

## Direct Edit: the width fix didn't actually apply, and a real footer-overlap bug — 2026-09-14

Follow-up to the same-day "primary mode" change below — the user reported
the preview still wasn't wider and the footer still overlapped, and both
turned out to be real bugs the previous fix missed, not the same issues
described again:

- `.direct-edit-preview`'s `max-width` bump never actually took visual
  effect. It's a flex item of `.builder-section` (`flex-direction:
  column`), and a flex item with `margin: 0 auto` + `width: auto` doesn't
  stretch to the container's cross size the way a plain block element
  would — the auto side-margins suppress flex stretch and the item
  shrink-wraps to its content's own preferred width instead, well below
  whatever `max-width` allows. Fixed with an explicit `width: 100%`
  alongside the existing `max-width`/`margin: 0 auto`.
- The overlap wasn't the mobile Editor/Preview/Export tab bar (already
  fixed) — it was the site-wide footer (`position: sticky; bottom: 0`),
  correct for Classic mode and every static page where content never
  grows taller than the viewport, but wrong for Direct Edit's preview,
  which is an unbounded block that can genuinely exceed viewport height
  for a real CV — the sticky footer stayed pinned over whatever was in
  view for the entire scroll, not just at the true end of the page.
  Dropped to `position: static` specifically in Direct Edit mode.

## Direct Edit made the primary builder mode — 2026-09-14

Follow-up to Phase 1 below, per direct feedback: Direct Edit now defaults
on for a fresh visitor (`builderMode` was `'classic'`, now `'direct'`; an
explicit stored `'classic'` choice is still respected), the toolbar's
mode switcher shows Direct Edit first, its preview's max-width grew from
the printed-page metaphor it shared with Classic/PDF sizing (220mm) to a
genuinely wider `68rem` now that there's no competing form column to
share space with, and the mobile bottom action bar (an Editor/Preview/
Export tab switcher, a Classic-only concept) no longer renders in Direct
Edit mode, where it was overlapping the preview's content with nothing
for its own tabs to control. The existing e2e suite predates Direct Edit
and assumed Classic's form UI was on screen by default — rather than
touch ~35 call sites across 7 spec files, seeded `builderMode` to
`'classic'` for the whole test run via Playwright's `storageState`
instead.

## Direct Edit builder, Phase 1 — 2026-09-14

New "Direct Edit" toolbar toggle alongside the existing (now "Classic")
split-pane builder: a single full-width live preview where CV text is
directly editable in place — click the name, role, About paragraph, an
experience entry's role/company/description, or a skill, and type. Classic
mode is untouched and stays the default; Direct Edit is opt-in and its
choice is remembered (`localStorage`).

Architecturally, both modes read and write the exact same CV data — no
new reducer actions anywhere in this phase. Every Direct Edit keystroke
dispatches one of the pre-existing `cvFormReducer` actions Classic mode's
form already uses (`SET_ROOT_FIELD`, `UPDATE_ARRAY_ITEM`, `ADD_ARRAY_ITEM`,
`REMOVE_ARRAY_ITEM`, `MOVE_ARRAY_ITEM_TO_INDEX`, `ADD_SKILL`,
`REMOVE_SKILL`, `TOGGLE_SECTION_VISIBILITY`). The core new primitive,
`EditableField` (`src/components/EditableField.jsx`), solves a real
`contentEditable`-in-React correctness problem: passing the field's value
as JSX children would let React's re-render diff reset the browser's
caret mid-keystroke, so instead the value is seeded/updated imperatively
via a `textContent` write that's skipped entirely while the field is
focused — an external re-render can never clobber an in-progress edit.
`EditableList`/`EditableChip` extend the same gating (via a
`DirectEditContext`, inert everywhere except an active Direct Edit render)
to repeatable entries, reusing this project's existing `@dnd-kit`
drag-to-reorder machinery rather than a new one. A `SectionsMenu` popover
handles whole-section show/hide, since a hidden section has no position
in the live preview to attach an inline control to.

**This is explicitly Phase 1**, wiring the whole mechanism end-to-end
against exactly one reference template (Minimalist) and 4 section types
(identity/About/Experience/Skills) — the other 17 templates fall back to
a read-only preview with a "not available yet" notice, gated by a
`DIRECT_EDIT_SUPPORTED_TEMPLATES` allowlist (`src/utils/directEdit.js`)
with its own regression check (`scripts/check-direct-edit.mjs`). The
remaining templates and section types are deliberate Phase 2/3 scope, not
gaps.

Built via `superpowers:brainstorming` → `superpowers:writing-plans` →
`superpowers:subagent-driven-development` (10 tasks, each reviewed
individually, then one final whole-branch review, one fix wave, one
scoped re-review — all clean). Real bugs found and fixed along the way,
almost all caught by implementers verifying the plan's own prescribed
code against the live codebase rather than transcribing it blindly:
- A wrong CSS branch reference (Minimalist's contact row uses
  `headerContactMode: 'piped'`, not `'personal'` as first assumed).
- A wrong reducer payload shape (`REMOVE_SKILL` takes `{index}`, not
  `{skill}` — dispatching the latter would have been a silent no-op).
- A missing section-key filter in `SectionsMenu` that would have listed
  all 20 possible CV sections instead of just the current template's.
- A missing `z-index` that made the Sections popover's trigger button
  genuinely unclickable in the real browser DOM.
- **Most seriously:** `DirectEditPreview` never forwarded a `previewRef`
  prop, so PDF export was completely broken in Direct Edit mode for every
  user — found only because Task 10's own spec-mandated html2canvas
  export-safety spike couldn't run without a working export.
- The final whole-branch review then caught two more, both invisible to
  any single task's own narrow diff: every skill rendered twice (an
  ungated plain tag list alongside the new removable chips), and PDF
  export was *separately* broken whenever ATS mode was on while in Direct
  Edit (the preview always rendered in designer mode but the export
  pipeline waited for a sync signal from ATS mode, which could never
  arrive) — plus real gaps in multiline editing (Enter/Shift+Enter
  inserted nothing, since every editable field is an inline `<span>`),
  Settings being unreachable on desktop in Direct Edit mode, the chosen
  CV font not applying to the Direct Edit preview or its exports, and no
  error boundary around the new full-page preview. All fixed in one
  consolidated fix wave, re-verified clean.
- **Deliberately deferred to Phase 2** (documented, not silently
  dropped): `EditableField`'s read-only branch trimmed to match the old
  snapshot-based behavior, but `EditableList` still reads raw `formData`
  rather than respecting a per-item hidden flag from Classic mode's
  own per-entry visibility toggle; a duplicate-skill-name collision can
  make "+ Add" silently no-op; and the Skills `'categorized'` layout
  (used by Developer/Creative/Executive/Timeline) has the same
  double-render risk the final review's Critical #1 fixed for the `'flat'`
  layout — unreachable today since only Minimalist is wired up, but a
  fix to apply proactively whenever the first categorized-layout template
  joins the rollout.

## Portrait: photo capped to a normal size, not full page height — 2026-09-13

Follow-up to the same-day column-width narrowing below — narrower width
alone wasn't the fix, since the photo was still stretched the full page
height and still read as dominating the whole template regardless of
column width. The real problem was the full-bleed-to-page-bottom
stretch itself. Changed `.portrait-showcase__photo`/`__monogram` from
`height: min(100%, var(--preview-paper-min-height))` to
`aspect-ratio: 3/4` (capped `max-height: 46%` as a safety net) — the
photo is now a normal portrait-proportioned box anchored to the top of
the rail, with the rail's own accent-colour background filling the rest
of the column beneath it (previously that only happened below the
one-page cap for an overflowing CV; now it's the normal case for every
CV). Monogram `font-size` reduced again (`4.5rem`→`3rem`) to match the
now-much-smaller box.

## Portrait: narrower photo column — 2026-09-13

The photo-rail column dominated the page — full page height at ~38% of
the page width, full-bleed. Narrowed to ~27% (`grid-template-columns`
`0.38fr`→`0.27fr` on `.portrait-showcase` in
`src/styles/templates/portrait.css`), with the no-photo monogram's
`font-size` scaled down to match (`6rem`→`4.5rem`). Still full-height/
full-bleed — the structural identity that distinguishes Portrait's
`photo-rail + main` family from Executive/Modern Orange's rail-with-text —
just a more typical proportion. Mobile's separate breakpoint (fixed
220px photo band) was already reasonable and is untouched.

## Styled Word export (C2/C3) — 2026-09-13

Released as v1.2.23. Completes the Word-export sub-project — C1 shipped
one-column, C2/C3 now ships per-template styled layout; nothing further is
planned for Word export in this roadmap cycle. Adds table-based layouts
mirroring each template's on-screen structure, plus the template's accent
color on section headings.

- **5-archetype mapping** via `DOCX_ARCHETYPES` in `src/utils/docxArchetypes.js`,
  covering all 18 templates: `oneColumn` (Minimalist, Compact, Classic
  Professional, Editorial, Modern Timeline, Portrait — C1's original
  one-column shape, unchanged), `railTable` (a borderless 2-cell table —
  left-rail: Executive, Modern Orange; right-rail: Creative, Modern
  Professional, Graduate, Portfolio Hybrid, Tech Executive, Colorful
  Compact), `darkSidebarTable` (Developer, Navy Professional — same
  mechanism as `railTable`, plus a dark cell fill and light rail text),
  `gridTable` (Quadrant — a 2×2 table, the one archetype that keeps
  visible borders), `labelGridTable` (European — a label/value table per
  section, genuinely faithful to its on-screen reading pattern, not an
  approximation).
- **Accent color via a `withPalette(palette, fn)` mechanism** in
  `src/utils/docxExport.js`: a small module-level color-override primitive
  the existing paragraph-building helpers (`sectionHeading`, `boldLine`,
  etc.) read instead of hardcoded ink constants, letting `buildDocxDocument`
  recolor section headings to a template's resolved accent (via
  `options.accentColor`) without touching any of the 20 existing section
  builders' signatures or bodies. The 6 `accent: null` templates get no
  accent threaded and stay monochrome, matching their real on-screen
  identity.
- **`parseSkillCategories`-avoidance correction, found during planning**:
  the design spec's original wording called for European's Skills row to
  group items by category (reusing `parseSkillCategories`), but that
  function lives in `src/components/templates/shared.jsx` (JSX) — not
  importable from the plain-JS `docxArchetypes.js`, nor from the Node-run
  `check-docx-export.mjs` (no JSX transform in plain Node). European's
  Skills row uses a flat comma-joined list instead, matching C1's own
  `buildSkillsSection`.
- **Two real bugs found and fixed during review:**
  1. `buildLabelGridProjects`'s empty-state branch returned a bare section
     heading with nothing at all below it when there were no project
     entries — an orphan heading, the exact defect class already found
     and fixed once this session in C1's original 20 builders. Fixed to
     omit the section entirely when empty, matching its sibling functions.
  2. The `darkSidebarTable` check only verified table count and that the
     dark-fill hex appeared somewhere in the document — not document
     order (whether the shaded/rail content genuinely comes before the
     main content, confirming `railSide: 'left'` through the real
     dispatch path) or that the rail's text actually uses the light
     palette needed for legibility against the dark fill. Fixed by adding
     both assertions.
- **`scripts/check-docx-export.mjs`** grew checks across all 5 tasks:
  per-archetype table/cell-structure assertions on real packed-and-unzipped
  `.docx` XML (via `jszip`), accent-color presence, the two fixes above,
  and the pre-existing monochrome/heading-color checks from C1 extended
  for the accent path.

**Follow-up fix wave — 2026-09-13, v1.2.24.** The final whole-branch review
caught 3 real defects the per-task reviews missed:
1. `railTable`/`darkSidebarTable`'s main-column predicate filtered to
   `primarySections` only, silently dropping any populated section not
   declared in either `primarySections` or `secondarySections` for the
   current template — as few as 6 of 20 possible sections survived under
   some templates. Fixed by inverting the predicate to
   `!secondarySections.has(section)`, so only declared-secondary content
   routes to the rail and everything else (declared-primary or
   undeclared) stays in main — no section is ever dropped again.
2. `gridTable` (Quadrant) split section keys into quarters by array
   position before checking which sections actually had content, so a
   realistic sparse CV could render 2 of 4 grid cells completely empty
   with visible borders. Fixed by building each section's content first
   and quarter-splitting only the sections that produced real output.
3. `DOCX_ARCHETYPES` had no validity check beyond a bare count — a
   typo'd or renamed template id would silently fall back to plain
   one-column with no failing check. Added key-set, archetype-name, and
   `railSide`-presence checks against the real template registry.

Also corrected a stale comment overclaiming ordering parity with the PDF
export, a safety comment on `withPalette` that cited the wrong reason
(UI-button disabling instead of the callbacks' actual synchronicity), and
European's label-grid Experience/Education rows repeating company/school
text in both the heading and the meta line.

## New template: European — 2026-09-13

Released as v1.2.22. Third and final of roadmap A.3's new templates
(European one-page direction, Europass-adjacent). Opens a new `label-grid`
family: every section reads as a label/value table (a date, skill
category, link type, or language level in a narrow left column; the
content in a wider right column) instead of flowing prose — nothing else
in the app uses this reading pattern. Roadmap A.3 is now complete.

- New `src/components/templates/european.js` (ATS flat-renderer fallback +
  `EUROPEAN_DEFAULT_ACCENT_COLOR`) and `EuropeanShowcase.jsx`: `left-tick`
  heading treatment (until now only Colorful Compact), one customizable
  accent used sparingly — new `civicBlue` swatch set (default `#1d4ed8`).
  The label/value grid applies to *every* section, not just Experience/
  Education — About becomes "(blank) | paragraph", Skills becomes
  "category | items", Links becomes "type | URL", Languages becomes
  "level | language", Certificates becomes "year | name – issuer".
  A small square ID-style photo (not the circular avatar every other
  template uses) is the one deliberate nod to the Europass passport-photo
  convention. Name deliberately isn't "Europass" itself — that's a
  specific EU Commission program, not something to imply affiliation with.
- **One-page auto-fit** reuses Compact's proven measure-and-step
  technique (own 2-tier scale: `standard` → `compact`, not Compact's own
  finer-grained cozy/snug/tight sub-scale) — with a quiet "may not fit one
  page" notice at the floor, matching Compact's own fallback.
- **Two real bugs found and fixed while verifying in the browser**, both
  in the auto-fit mechanism:
  1. The original "reset to standard on content change" guard compared
     the CV snapshot's object *identity* (copied from Compact's original
     pattern) — but that identity isn't stable across every re-render on
     this render path, so the guard kept firing and resetting density
     back to `standard` before the step-down could stick. Fixed by
     comparing a cheap content fingerprint (string) instead of reference
     identity.
  2. Even after that fix, density still never stepped down: the
     `useLayoutEffect` is one-shot (runs once per dependency change), but
     this template is normally reached by selecting it from the gallery
     modal, whose close transition can still be resizing the preview
     panel at the exact moment that effect fires — it measured a
     transient zero-width box (confirmed via direct instrumentation:
     `scrollHeight: 0`, `clientWidth: 0`, despite real content already in
     the DOM) and nothing ever re-checked once the panel's width settled.
     Fixed the same way as this session's earlier `AutoGrowTextarea` bug:
     a `ResizeObserver` on the root re-triggers the measurement whenever
     its real box size changes, not just once at mount.
- Verified end-to-end after the fix: `standard` → `compact` step-down
  confirmed via direct DOM measurement, and — since the demo CV's 8 links
  genuinely don't fit even at the tightest tier — the overflow warning
  correctly appears with its exact intended copy, demonstrating the
  mechanism degrades honestly instead of silently failing. Long-name wrap
  verified with no overflow, both locales. `npm run lint` clean, e2e 46/46
  (new "choosing a swatch recolors the European preview" test).

## New template: Portrait — 2026-09-13

Released as v1.2.21. Second of roadmap A.3's three new templates
(photo-forward direction). Opens a new structural family the design
system didn't have: `photo-rail + main` — a full-height, full-bleed photo
fills the left column (no crop-circle, no border, no text sharing the
column), while identity and every section flow in the main column. Every
existing photo-capable template (Executive, Modern Orange, etc.) treats
the photo as a modest circular avatar (largest today: Portfolio Hybrid's
7.75rem) alongside rail text — Portrait is the first to make the photo the
structure itself, not an accent.

- New `src/components/templates/portrait.js` (ATS flat-renderer fallback +
  `PORTRAIT_DEFAULT_ACCENT_COLOR`) and `PortraitShowcase.jsx`: `rule-under`
  heading treatment (deliberately quiet, so the photo stays the focal
  point), one customizable accent used sparingly — role line, section
  rules — new `quietTeal` swatch set (default `#0f766e`). Same 8-section
  breadth as Editorial.
- **No-photo state is a real design, not an omission**: most templates
  just skip the photo-wrap when there's none; Portrait's whole structure
  depends on that column, so it falls back to a solid accent-tinted panel
  carrying a large single-letter monogram instead.
- **Fixed a real bug found while verifying in the browser**: the photo
  column initially stretched to match the full document height via CSS
  Grid's row-stretch, meaning `object-fit: cover` cropped a real photo (or
  the monogram) down to a barely-visible sliver for any CV longer than
  about one page — the "A" test monogram was invisible until
  scrolled to the exact vertical middle of a 2246px-tall column. Fixed by
  capping the photo/monogram height at one page (`var(--preview-paper-
  min-height)`, 297mm) with `object-position: 50% 18%` biased toward
  where a headshot's face usually sits, and letting the rail's own accent
  background continue as a solid color below the cap for longer CVs —
  verified by direct `getBoundingClientRect()` measurement before and
  after, not just eyeballing.
- Registered like every other bespoke template (9-file pattern); design
  system's `rule-under` member list and structural-family table both
  updated with the new family + a distinguishing note vs. `left-rail +
  main`.
- Verified: long-name wrap (no overflow, measured directly), the no-photo
  monogram state (now visible near the top of the page, not buried mid-
  document), live accent-swatch switching, both locales. `npm run lint`
  clean, e2e 45/45 (new "choosing a swatch recolors the Portrait preview"
  test).

## New template: Editorial — 2026-09-13

Released as v1.2.20. First of roadmap A.3's three new templates (editorial
one-column / photo-forward / European one-page). Fills the gap the design
system (§5) named directly: the `numbered` heading treatment (until now
only Creative) combined with the `single-column-flow` family (until now
Minimalist and Classic Professional's `eyebrow-caps`/`rule-under`) — a
magazine-style single column, no sidebar.

- New `src/components/templates/editorial.js` (ATS flat-renderer fallback
  + `EDITORIAL_DEFAULT_ACCENT_COLOR`) and `EditorialShowcase.jsx` (the
  bespoke visual): an oversized masthead name, an accent-colored
  professional title, a middle-dot-separated contact line, a single accent
  rule under the masthead, and two-digit numbered section ordinals. One
  customizable accent (`--tpl-accent`) used sparingly — the title, the
  ordinals, and the rule; section labels and body text stay ink, unlike
  Creative which also tints dates/tags. An optional modest photo (user
  toggle, like Creative — unlike Classic Professional, which never shows
  one). Sections: about, experience, education, skills, projects, links,
  languages, certificates — a fuller stacked set than Minimalist (5) or
  Classic Professional (6), matching the "generous measure" brief.
- New `inkCrimson` accent swatch set in `templateAccents.js` (Crimson
  default `#9f1239`, plus Brick/Navy/Slate/Teal/Indigo) — verified 8:1
  contrast on white for the default, comfortably clears AA on text roles.
- Registered like every other bespoke template: `templates/index.js`
  (registry + prefetch), `cvTemplates.js` (EN + FI entries), `index.css`
  (`@import`), `CVPreview.jsx` (lazy import + delegation block). No
  hardcoded template-count strings anywhere needed updating — `cvTemplates
  .js`'s exports and `LandingPage.jsx`/`FreeCvTemplatesPage.jsx` are fully
  dynamic (confirmed before starting, not assumed).
- Verified: the design-system's long-name edge case (a single very long
  word wraps cleanly, no overflow, via direct DOM measurement in the live
  app), the no-photo default state, live accent-swatch switching (numbered
  ordinals + bullet markers + rule all track the chosen color), both
  locales. `npm run lint` clean, e2e 44/44 (new "choosing a swatch
  recolors the Editorial preview" test added, matching every other
  accent-configurable template).

## Template quick-switcher retired — 2026-09-13

Released as v1.2.19. Roadmap item A.4 (also closes B1): the toolbar's
`TEMPLATE` control was a carousel-like dropdown with its own scrollable
thumbnail strip — a second, weaker template picker alongside the nav rail's
full gallery modal. Collapsed to one: the toolbar control now just opens
`TemplateGalleryModal` directly (same modal as the nav rail's Templates
item and the mobile "Templates" tab).

- Deleted `TemplateQuickSwitcher.jsx` and its `.template-quick-switcher__*`
  CSS. `Toolbar.jsx`'s template control is now a plain button (same visual
  slot, current template name + chevron) wired to a new
  `onOpenTemplateGallery` prop.
- Removed `templateSelectRef` and `formDataRef`, both dead once nothing
  reads them (they existed only to feed the quick-switcher's own trigger
  ref and its live thumbnail-strip snapshot).
- `e2e/templates.spec.js`'s `selectTemplate()` helper (and two other
  direct copies of the same pattern) now open the gallery modal and click
  a card by name instead of the old mini-panel. Deleted
  `e2e/responsive.spec.js`'s "template picker panel stays on-screen when
  the toolbar wraps" test — it guarded an anchored-dropdown positioning
  bug that can't happen once the trigger opens a centered modal instead.

## Builder usability polish — 2026-09-12

Released as v1.2.18. Roadmap item B (builder usability), scoped to B3-B5
per `docs/superpowers/specs/2026-09-09-v1.2.0-roadmap-design.md` — small
polish, not a project (B1/B2 were already covered by earlier roadmap work).

- Experience's per-entry Achievement bullets (`ReorderableListInput`) now
  auto-grow like every other long-form field instead of staying single-line
  and clipping text.
- Experience's Description field grows from a taller default (160px vs the
  112px baseline every other `AutoGrowTextarea` still uses), since a
  paragraph-length description rarely fit in one screen's worth of space.
- `SortableItemCard` entry headers (Experience/Education/Certificates/
  Projects) now carry a native `title` tooltip, so a title too long for the
  card header's ellipsis is still readable on hover.
- Experience's and Education's `startDate`/`endDate` fields gained a format
  hint placeholder (`e.g. Jan 2022` / `esim. tammikuu 2022`), since the
  field was otherwise unlabeled free text with no cue about expected style.
- Fixed a real bug surfaced while building the above: `AutoGrowTextarea`
  measured `scrollHeight` once on mount, which is wrong when a field first
  renders while an ancestor (a collapsible card, a panel entrance
  animation) is still mid-layout — it now also re-measures via a
  `ResizeObserver` on its row once layout actually settles, and skips
  measuring an empty value entirely (some browsers factor a long
  placeholder into `scrollHeight` for an empty field, ballooning the box).

## Word (.docx) export — 2026-09-11

Released as v1.2.16. Ships the C1 phase of the roadmap's Word export plan
(`docs/superpowers/specs/2026-09-11-word-export-c1-design.md`): an
ATS-friendly, one-column `.docx` download, available for every template
regardless of the ATS/Designer toggle.

- New `exportCvAsDocx`/`buildDocxDocument` in `src/utils/docxExport.js`,
  dynamically imported directly by `ResumeBuilderPage.jsx` (its own
  standalone `await import('../utils/docxExport')` statement) — lazy the
  same way `exporters.js` already lazy-loads html2canvas/jsPDF for the
  other export paths, just via a separate import site rather than through
  `exporters.js` itself. Adds `docx` as a normal dependency (pure-JS OOXML
  generation, no headless-office conversion, no worker — unlike the PDF
  path, assembling a CV's text into a `.docx` is fast enough to run
  synchronously on the main thread).
- 20 section builders (About, Skills, Experience, Education, Links, Core
  Strengths, Certificates, Achievements, Memberships, Publications,
  Projects, Open Source, Leadership, Speaking, Volunteering, Internships,
  Case Studies, Testimonials, Languages, Interests) plus an identity block,
  all reusing the same data-shaping the PDF text-fallback already
  established rather than inventing new field logic: `createCvSnapshot`,
  `createExportCopy`, `normalizeSectionOrder`, `formatDateRange`, and
  `formatLinkLabel`/`formatLinkDisplayValue`.
- Deliberately monochrome, one-column, and real-Word-styled (Heading 1/2,
  genuine bullet paragraphs, no `•` characters or color/shading) — the
  guaranteed-to-parse fallback every template gets today; a styled,
  per-template `.docx` layout is future work (C2/C3 in the roadmap).
- New `Word` item in the export menu alongside PDF/HTML/JSON, wired into
  `Toolbar.jsx` and `ResumeBuilderPage.jsx`'s export handler.
- New `scripts/check-docx-export.mjs` (`npm run check:docx-export`) —
  framework-free checks covering every section builder, empty/blank-CV
  fallback copy, Finnish locale, a non-default section order, and that the
  assembled buffer is a real `.docx` (ZIP-signature) file.

lint / build / check:docx-export (35) / check:reducers / check:share /
e2e (44) all green.

## Consolidate Timeline/Modern Orange accent onto --tpl-accent — 2026-09-10

Released as v1.2.15. Modern Timeline and Modern Orange were swatch-wired
since A.1 but still wrote their accent under private `--tl-accent` /
`--mo-accent` names. Renamed both to the shared `--tpl-accent` (CSS +
inline style + the Timeline e2e assertion). Their other private tokens
(`--tl-text`, `--mo-border`, …) are unchanged. Now every configurable
bespoke Showcase reads its accent from `--tpl-accent`.

## Modern Professional back to standard density — 2026-09-10

Released as v1.2.14. The v1.2.13 `roomy` reclassification made the
benchmark's body copy noticeably airier (0.95rem vs the hand-authored
0.80rem), costing one-page density. Reverted to `standard`: name 1.95rem,
body 0.90rem, section-heading tracking back to 0.16em. Still fully on the
`--tpl-*` ramp — just the class it points at changed.

## Keep-template type-ramp adoption (roadmap A-fix) — 2026-09-10

Released as v1.2.13. The five "keep" templates with bespoke Showcases —
**Modern Professional, Modern Orange, Modern Timeline, Navy Professional,
Classic Professional** — scored *keep* in A.2 but still set ad-hoc font
sizes, the one §2 gap left after the rework batch.

- Each root now carries a `tpl-density-*` class and every one of the six
  type roles (name / title / section-heading / entry-title / body / meta)
  reads the shared `--tpl-*` tokens. Weight, case, tracking and colour are
  untouched; line-heights kept as authored.
- **Modern Professional** was reclassified `standard` → `roomy` here, then
  reverted to `standard` in v1.2.14 (the roomy body copy cost too much
  one-page density).
- **Navy Professional**'s sidebar identity block (kicker / name / role)
  keeps its own small sizes — white knockout in a ~180px rail, narrower than
  any density's name-column floor. Documented in the CSS.
- **Modern Orange** floors its name column at 210px (§2 standard rule).
- Accent handling unchanged this pass: Modern Timeline / Modern Orange keep
  their swatch-wired `--tl-accent` / `--mo-accent`; Modern Professional /
  Navy stay accent-fixed; Classic Professional stays ink-only.
- **Minimalist excluded** — it has no bespoke Showcase (it is the flat
  renderer); teaching that path to read `--tpl-*` is a separate pass (§6).

lint / build / e2e (43) green; html2canvas rasterises each showcase clean.
Design-system §2 and audit-a2 updated. This closes cross-cutting fix #3 for
every template but Minimalist.

## Colorful Compact polish (roadmap A-fix polish pass) — 2026-09-10

Released as v1.2.12. A.2 verdict "polish" (C=1, E=1). The template ran ~29
hexes: a fixed six-colour section palette (fine — it's the one design-system
§3 multicolour exception) *plus* independent per-item colour cycles on skill
pills (8 hues), project tags (5), experience dates (3), language badges (3)
and header contact dots (3), and a 7th/8th hue (`--cc-yellow`,
`--cc-charcoal`).

- **Capped to the named 6, one hue per section.** `SKILL_COLORS` /
  `TAG_COLORS` / `EXP_DATE_COLORS` / `LANG_LEVEL_COLORS` /
  `CONTACT_DOT_COLORS` removed — every decorative mark in a section (dot,
  label, date, tag, pill, badge) now takes that section's assigned colour,
  exactly as §3's exception requires. `SECTION_COLORS` reordered to the
  spec's table order (pink / orange / green / teal / blue / purple).
- **Yellow + charcoal retired** — vars, `skill-pill--yellow/--charcoal`, and
  the yellow stop in the header rainbow bars (7 stops → 6).
- **Header contact dots** unified to one fixed swatch (orange, matching the
  two-tone name's accent half) — the header is not a section.
- **Compact type ramp adopted** — root carries `tpl-density-compact`; ~20
  ad-hoc font sizes now read `--tpl-*`. Section-heading tracking bumped to
  the compact `0.18em`.
- E=1: the name's `overflow-wrap` was already `break-word` (cross-cutting
  fix, 2026-09-09) — confirmed.

Stays swatch-opt-out (`accent: null`) — the fixed palette is its concept.
lint / build / check:reducers / check:share / e2e (43) green; html2canvas
rasterises the showcase DOM clean (389 ms). Design-system §3 and audit-a2
updated — the A-fix batch + polish pass is now complete (15 templates, all
at bar).

## Portfolio Hybrid polish (roadmap A-fix polish pass) — 2026-09-10

Released as v1.2.11. A.2 verdict "polish" (C=1): the template ran a
seven-hue palette (`emerald/teal/sky/violet/pink/orange/green`) — a gradient
top hairline, per-section two-colour gradient icon badges, six-colour
project chips, seven-colour tech-stack badges, a gradient "Live Demo"
button, gradient photo ring and project-card stripe.

- **Colour capped to §3** — one ink + **one emerald accent** (`--tpl-accent`)
  + the sidebar tint. All the gradients collapse to solid `--tpl-accent`
  (hairline, icon badges, photo ring, card stripe, timeline marker); chips
  and badges become one `--tpl-accent-soft` style; the "Live Demo" button is
  now a plain text link identical to "GitHub" (per the A.2 note).
- **Accent now user-customizable** (§6 3-step wire) — new
  `PORTFOLIO_DEFAULT_ACCENT_COLOR = '#047857'`, registry
  `accent: { default, swatchSet: 'forestGreen' }` (new swatch set: Emerald /
  Forest / Teal / Sky / Moss / Slate, all AA-safe on white), `CVPreview`
  forwards `accentColor`, the Showcase writes `--tpl-accent` +
  JS-computed `--tpl-accent-soft`. ATS mode is unaffected (bypasses to the
  monochrome flat renderer).
- **Type ramp adopted** — root carries `tpl-density-roomy`; the ad-hoc
  `2.7rem` serif name drops to `--tpl-name-size` (2.30rem, still Instrument
  Serif), every other size reads `--tpl-*`.

One new Playwright spec (swatch recolours the preview). lint / build /
check:reducers / check:share / e2e green; PDF export verified (no hang,
~455 KB). Design-system §2/§3/§4 and audit-a2 updated.

## Classic → Classic Professional merge (roadmap A) — 2026-09-10

Released as v1.2.10. A.2 §Decisions #3: Classic and Classic Professional
were near-identical (single-column, serif name, uppercase `rule-under`
headings, icon contact row) — the only real difference was **name
alignment** (Classic left, Classic Professional centred).

- **`classic` retired.** Removed from the registry / prefetch / `CVPreview`
  delegation / `index.css`; `ClassicShowcase.jsx`, `classic.js`,
  `classic.css` deleted. Template count **16 → 15** (the landing page reads
  the count off the registry, so no copy changes needed).
- **Classic Professional gains a "Name alignment" Settings option** —
  *Centre* (default) / *Left*. New ephemeral `classicNameAlignment`
  UI-reducer slot + `SET_CLASSIC_NAME_ALIGNMENT` action (same tier as the
  accent swatch — not persisted). The row shows only when Classic
  Professional is active; `ClassicProfessionalShowcase` sets
  `data-name-align`, and `classicProfessional.css` has a
  `[data-name-align="left"]` block (header + contact flush left).
- **Legacy redirect** — a `?template=classic` deep link now resolves to
  Classic Professional *and* starts left-aligned (`LEGACY_TEMPLATE_ALIASES`
  in `uiReducer.js`), so old bookmarks / "Use this template" links still
  land on the Classic look.
- Not carried over: Classic's slightly warmer ivory palette and its
  standalone Links section (Classic Professional keeps LinkedIn in the
  contact row).

Four new `check:reducers` cases, three new Playwright specs (gallery no
longer lists Classic; the Settings toggle flips `data-name-align`; the
legacy link opens left-aligned). Full e2e suite: 42 passed. Design-system
§2/§4/§5 and audit-a2 updated.

## Tech Executive bespoke Showcase (roadmap A-fix batch) — 2026-09-10

Released as v1.2.9. Last of the seven-template A-fix rework batch. Tech
Executive scored **rework** on **S=1** — it had no bespoke Showcase, so
non-ATS mode rendered through the shared flat renderer (dressed up with
config) and read as a near-twin of Modern Professional.

- **New `src/components/templates/TechExecShowcase.jsx` +
  `src/styles/templates/techExec.css`** — an "annual-report / navy
  leadership" design: a deep-navy (`#163D7A`) full-width **masthead** with
  knocked-out white identity, a `right-rail + main` two-column body (65/35),
  and a deep-navy **footer band** carrying the user's tagline as the
  document's sign-off (only rendered when they have one). Navy Professional
  puts navy in a *sidebar*; Tech Executive puts it in *bands top and
  bottom* — that's the distinguishing structure.
- §3: one ink + one royal-blue accent (`--tpl-accent`) + the navy bands as
  the single tint region. §4 heading: `rule-under` (a royal-blue hairline,
  no icon-badge). §2: `tpl-density-standard` + `--tpl-*`. Skills render as
  grouped inline lists.
- **Accent user-customizable** (§6 3-step) — `TECHEXEC_DEFAULT_ACCENT_COLOR
  = '#2563eb'`, a new `royalBlue` swatch set. Wired through `CVPreview.jsx`
  (lazy import + delegation), `templates/index.js` (prefetch),
  `src/index.css` (`@import`). `techExec.js` stays as the ATS-mode flat
  fallback.
- Docs updated: design-system §4 (Tech Executive → `rule-under`; icon-badge
  down to 8 of 16), §5 (no longer a Modern Professional near-twin; also
  fixed Developer's family: `left-rail` → `dark-sidebar`), §6 (no more
  "flat-renderer-only" templates besides Minimalist), and the audit-a2 row.

New Playwright spec for the Tech Executive accent swatch; full suite 39
passed. Verified in-app and in a rendered-back 2-page PDF.

**A-fix batch complete** (7 templates, v1.2.3–1.2.9). Remaining roadmap
A work: the Classic → Classic Professional merge, then the polish pass
(Portfolio Hybrid, Colorful Compact, + the keepers' light ramp adoption).

## Quadrant template rework (roadmap A-fix batch) — 2026-09-10

Released as v1.2.8. Sixth of the A-fix rework batch. Quadrant scored
**rework** — E1 (plus a muted accent and no density ramp).

- **Rebalanced the 2×2.** The About summary moved from the identity cell
  (top-left) to the top-right cell, above Skills, with its own Profile
  icon-badge heading. Top-left is now a tight identity card; top-right
  carries real content (summary + skills + languages) instead of trailing
  whitespace. Measured: the two top-row cells now render the same height.
  (The `overflow-wrap:anywhere` name char-fragmentation E1 flagged was
  already fixed to `break-word` in A-fix #1 / v1.2.2.)
- **Made the cyan present.** Real §4 icon-badges — every section glyph now
  sits in a `1.4rem` soft-cyan rounded badge (were bare glyphs). Skill tags
  → `--tpl-accent-soft` fill + ink text (were a near-white `#ecfeff` wash +
  grey border). The literal grid dividers take a pale cyan (`#bfe0e6`, was
  neutral `#d5e3e6`); the photo gets a 2px cyan ring; the profile-cell tint
  tracks the accent. `--qd-cyan` / `--qd-cyan-strong` / `--qd-cyan-tint`
  collapse to `--tpl-accent` + `--tpl-accent-soft`.
- **`compact` density ramp** — `tpl-density-compact` + `--tpl-*`; name
  `1.7rem → 1.65rem`, body `0.78rem → 0.82rem`. Ink consolidated.
- **Accent user-customizable** (§6 3-step): `--tpl-accent` + JS
  `--tpl-accent-soft`, a new `coolCyan` swatch set (cyan / teal / blue /
  emerald / indigo / slate), `QUADRANT_DEFAULT_ACCENT_COLOR = '#0e7490'`.
- `quadrant.js`'s ATS `cyan-*` classes were **undefined** in `utilities.css`
  — swapped to stocked `teal-*` (near-identical hue).

New Playwright spec for the Quadrant accent swatch; full suite 38 passed.
Verified in-app and in a rendered-back PDF (the 2×2 top row now fills evenly).

## Compact template rework (roadmap A-fix batch) — 2026-09-10

Released as v1.2.7. Fifth of the A-fix rework batch. Compact scored
**rework** on three axes — D1 / S1 / C1.

- **Rebuilt on the `compact` density ramp (D).** Type was ad-hoc — a
  `2.25rem` name over a barely-readable `0.68rem` body. Now `tpl-density-compact`
  + `--tpl-*`: name `1.65rem`, body `0.82rem`, meta `0.70rem`. The
  cozy/snug/tight auto-fit (the `useLayoutEffect` that shrinks density until
  the CV fits one page) still works — the snug/tight tiers now progressively
  override the `--tpl-*` type tokens plus the spacing gaps.
- **Skills → inline comma lists (S / §6).** `Category: item, item, item`
  per row instead of bordered chips — chips waste 30–40% of the line at
  compact sizes. The `.compact-showcase__tag` styling is deleted.
- **One accent (C).** Sky is now `--tpl-accent`; the second blue
  (`--cp-blue`, metric highlight) is gone. The thin section rules take the
  accent (were grey — the reason it read as "the Classic templates with
  blue lines"); the tiny heading label goes to ink. Ink consolidated to
  `--cp-ink` / `--cp-ink-muted`.
- **Accent user-customizable** (§6 3-step): `--tpl-accent` + JS
  `--tpl-accent-soft`, a new `coolBlue` swatch set (sky / blue / indigo /
  teal / slate / rose), `COMPACT_DEFAULT_ACCENT_COLOR = '#0284c7'`.
- The header tint band tracks the accent. Project links now run through
  `formatLinkDisplayValue()` (were raw `https://…`).
- `compact.js`'s ATS `sky-*` classes were **undefined** in `utilities.css`
  (only `blue` is stocked) — swapped to `blue-*`.

New Playwright spec for the Compact accent swatch; full suite 37 passed.
Verified in-app and in a rendered-back PDF that still auto-fits one page.

## Developer template rework (roadmap A-fix batch) — 2026-09-10

Released as v1.2.6. Fourth of the A-fix rework batch. Developer scored
**rework** — colour discipline 1.

- **Killed the 7-colour cycle.** Skill tags cycled a colour per skill
  category and project chips cycled a 6-colour palette per chip — plus the
  company line rendered in blue. All of that is gone: **one** tag/chip style
  (a soft-teal fill, light-teal text on the dark sidebar, darker teal on the
  white main column), and the company line is ink. Distinct hexes in
  `developer.css` drop from ~28 to ~14. `CATEGORY_COLOR` / `CHIP_COLORS`
  maps removed.
- **Kept** the teal→blue→purple cool-spectrum gradient (name, photo ring,
  section-icon badges, timeline marker) — Developer's stated concept, now
  documented in the design system's §3 as its accent form, the way Colorful
  Compact's rainbow is. Developer **opts out** of the Settings accent swatch
  (§6). Solid-accent moments use `#0f766e` (teal-700), contrast-safe on white.
- The name's `background-clip:text` gradient keeps its `.pdf-export-root`
  solid fallback — re-verified: the exported PDF renders the name solid.
- **§4 heading → icon-badge**: the separate gradient `__section-divider` bar
  under each title is removed (one on-menu treatment).
- Project "GitHub" / "Live Demo" bordered + gradient-filled buttons → plain
  teal text links (scheme-stripped URLs).
- **Type ramp**: `tpl-density-standard` + `--tpl-*`; name `2.5rem → 1.95rem`.
- `developer.js`'s ATS `teal-*` classes were **undefined** in the
  hand-authored `utilities.css` (the recurring trap) — added the real ones.
- Corrected the stale "Developer's rail has been light for weeks" claim in
  the design-system doc §5 and the audit-a2 Developer row — the Aug restyle
  made the sidebar a full-bleed dark navy column; Developer holds the 2nd
  `dark-sidebar + main` slot alongside Navy Professional.

Full suite: 36 passed. Verified in-app and in a rendered-back 2-page PDF.

## Executive template rework (roadmap A-fix batch) — 2026-09-10

Released as v1.2.5. Third of the A-fix rework batch. Executive scored
**rework** — colour discipline 1.

- **Colour (C).** The left rail was washed in `#eef2ff` — a pale **indigo**
  the August indigo→gold pass left behind, fighting the warm gold accent.
  The rail is now a warm off-white (`#f7f4ef`) — the single §3 tint region —
  and the ink is warmed from cool slate (`#0f172a` / `#1e293b` / `#64748b`)
  to a stone scale (`#1c1917` / `#44403c` / `#78716c`) so the whole palette
  reads one temperature with the gold.
- **Gold is now present** rather than near-invisible: a 1px gold hairline
  under every section head (the `rule-under` marker), the role line bumped
  to weight 600, gold entry dates, gold bullet/award markers and metrics.
  Skill tags move from outlined-gold-text to a soft-gold fill with ink text.
  Photo ring → gold.
- **§4 heading → `rule-under`.** The bare low-contrast section glyph is
  removed (`sectionIcons` import and the `icon` prop with it); the
  tracked-uppercase label sits over the gold rule.
- **Accent user-customizable** (§6 3-step): `--tpl-accent` + JS
  `--tpl-accent-soft`, a new `warmGold` swatch set (gold / umber / burgundy
  / teal / navy / forest), `EXECUTIVE_DEFAULT_ACCENT_COLOR = '#b45309'`
  (kept — brighter "true golds" fail AA on the role/metric text).
- **Type ramp.** `tpl-density-standard` + `--tpl-*`, reclassified from the
  design-system's `roomy` starting assignment: the name lives in a ~210px
  left rail that can't give roomy's 240px column floor.
- `executive.js`'s ATS-mode `amber-*` classes were **undefined** in the
  hand-authored `utilities.css` (the Modern-Professional-`rose-*` trap
  again) — added the real `amber-*` utilities.

New Playwright spec for the Executive accent swatch; full suite 36 passed.
Verified in-app and in a rendered-back 2-page PDF export.

## Graduate template rework (roadmap A-fix batch) — 2026-09-10

Released as v1.2.4. Second of the A-fix rework batch. Graduate scored
**rework** — colour discipline 1, structural clarity 1.

- **De-boxed (S).** The "SaaS card grid" is gone: every main section was an
  indigo-tinted rounded box and every sidebar section a bordered box, with
  entry cards nested inside. Sections now flow directly on the page with the
  §4 `icon-badge` heading over a hairline rule. Only education entries keep a
  visual treatment (a left accent rule), and internships keep their timeline.
  The header tint band is the single §3 tint region. Project "GitHub" /
  "Live Demo" buttons become plain accent text links (scheme-stripped URLs).
- **One ink + one accent + header tint (C).** Ink `#1e293b` (+ one muted
  step); one indigo accent from `--tpl-accent` on the kicker, role line,
  section badges, education rule, timeline, bullets, dates, links, and the
  "currently studying" badge (recoloured off green). `--gr-blue/-sky/-purple/
  -green` deleted — distinct hexes in `graduate.css` drop from ~11 to 5.
- **Accent is user-customizable** (§6 3-step): `--tpl-accent` from the
  `accentColor` prop, JS `--tpl-accent-soft`, a new `coolIndigo` swatch set
  (indigo default), `GRADUATE_DEFAULT_ACCENT_COLOR` in `graduate.js`.
- **Type ramp.** `tpl-density-standard` + `--tpl-*`; the name drops from
  `2.875rem` (2nd-largest in the app) to the ramp's `1.95rem`, and is now
  ink rather than indigo.

Also extracted the accent→rgba helper Creative introduced into
`accentSoftFill()` in `templateAccents.js` (now shared by both). New
Playwright spec for the Graduate accent swatch; full suite 35 passed.
Verified in-app and in a rendered-back 2-page PDF export.

## Creative template rework (roadmap A-fix batch) — 2026-09-10

Released as v1.2.3. First of the seven-template A-fix rework batch
(`docs/template-audit-a2.md`). Brings Creative to the
`docs/template-design-system.md` bar — it scored **rework** (structural
clarity 0, colour discipline 1).

- **Section headings → the §4 `numbered` treatment** (previously an off-menu
  bold sentence-case title + italic subtitle). A two-digit accent ordinal
  runs once through the whole document — `01`–`03` down the main column,
  continuing `04`+ through the sidebar — before an uppercase tracked label.
  This claims the one unused slot in the heading menu.
- **Colour collapsed to the §3 rule** — one ink (`#1a1a1a` + two muted
  steps), one accent, and the cream page / tan sidebar as the single
  neutral tint. The old five-colour system (coral / teal / violet / gold,
  five pastel tag tints, a four-colour stripe, alternating card borders) is
  gone: distinct hex values in `creative.css` drop from ~24 to 8. Skill
  pills and project tags are one soft-accent style; the stripe is one solid
  accent rule; the name is no longer two-tone.
- **Accent is now user-customizable** (§6 3-step opt-in) — `--tpl-accent`
  read from the `accentColor` prop with a JS-computed `--tpl-accent-soft`
  fill, a `warmCoral` Settings swatch set (coral default), and
  `CREATIVE_DEFAULT_ACCENT_COLOR` in `creative.js`. ATS-mode (flat-renderer)
  accent classes moved off the undefined `violet-*` utilities onto `rose-*`.
- **Type sizes read the shared `--tpl-*` ramp** via `tpl-density-roomy` on
  the showcase root; the name drops from `2.7rem` to the ramp's `2.30rem`.

Verified in the running app and a rendered-back PDF export (name renders,
all content present and ordered, numbered headings intact, URLs
scheme-stripped). One new Playwright spec (Creative accent swatch). Full
suite: 34 passed.

## Template design system foundations (roadmap A.1) — 2026-09-09

Released as v1.2.1. First sub-project of the v1.2.0 template roadmap
(`docs/superpowers/specs/2026-09-09-v1.2.0-roadmap-design.md`).

- **`docs/template-design-system.md`** — the house design language every
  template is now built and scored against: a type ramp with three density
  classes, a 1-ink/1-accent/1-tint colour rule (with one documented
  multicolour exception), a closed section-heading-treatment menu, the
  structural families, content-edge-case and html2canvas export-safety
  checklists, and a 0–3 scoring rubric with a pass threshold.
- **`src/styles/templates/_system.css`** — shared `--tpl-*` type-ramp
  custom properties (`:root` plus `.tpl-density-{roomy,standard,compact}`),
  imported into the cascade. Inert until templates adopt it (the A-fix
  batch).
- **URL formatting** — Compact, Navy Professional, Modern Timeline and the
  flat renderer now strip `https://` from displayed link text via the
  existing `formatLinkDisplayValue()` helper (they were showing raw URLs).
- **Accent colour generalised** — the two hardcoded per-template accent
  state slots become one `templateAccentColors` map + one
  `SET_TEMPLATE_ACCENT_COLOR` action; each template declares an `accent`
  config in `cvTemplates.js`; `SettingsModal` renders one registry-driven
  swatch row. Modern Timeline and Modern Orange are migrated onto it; the
  other 14 opt in as they're reworked. New `resolveTemplateAccent()` helper.

Two new Playwright specs (link URL formatting, accent colour). Full suite:
33 passed.

## Google AdSense integration and an About page — 2026-09-09

Released as v1.2.0.

- **About & contact page** (`/about`, `src/pages/AboutPage.jsx`), bilingual,
  footer-linked: what PortifyCV is, how it works, who makes it, how it's
  funded, and a contact address. AdSense's site review expects a clear
  about + contact route.
- **Real contact address.** `privacy@portifycv.app` (never had a mailbox)
  became `portifycv@gmail.com`, in the privacy policy and on the About page.
- **AdSense wired in.** The `adsbygoogle.js` snippet (publisher
  `ca-pub-4696294951019088`) loads in `index.html`'s `<head>` on every
  route; `public/ads.txt` carries the publisher line. The old
  env-var-gated `AdSenseLoader` and custom `ConsentBanner` (plus
  `src/utils/consent.js` and the `portifycv-ad-consent` key) were removed —
  a consent-gated script isn't discoverable by AdSense's review crawler and
  most visitors never opt in. EEA/UK/CH consent is now Google's certified
  GDPR message, enabled dashboard-side.
- **Privacy policy** rewritten to present tense (the site shows ads now);
  the local-storage list drops to three items.
- Sitemap picks up `/about` and the previously-missing
  `/how-to-use-the-cv-builder`.

Full e2e suite: 31 passed. See `docs/adsense-indexing-readiness.md` for the
history and the remaining dashboard steps.

## E2E coverage for the 2026-08-15 features — 2026-08-30

`todo.md` item 26. Added three Playwright specs (10 tests) for features that
previously only had `check:reducers` state-transition coverage:

- **`e2e/cover-letter.spec.js`** — generate a draft from the demo CV; the
  Company field flows into it; copy-to-clipboard; `.txt` download; and a
  mobile-viewport check that the bottom action bar opens the modal.
- **`e2e/badge.spec.js`** — "Get the badge" opens from the template gallery
  with the live preview + snippet; "Copy HTML" writes the snippet.
- **`e2e/session-restore.spec.js`** — off by default; when on, the CV
  survives a reload with a toast; turning it off clears the snapshot.

Full e2e suite: 31 passed.

> **Gap:** work between 1.0.0 and the 2026-08-29 pass — the 1.0.1/1.0.2/1.0.3
> audits, the template visual pass, and `todo.md` items 1–38 — was never written
> up here. It lives in `todo.md` (marked done, with notes) and in `docs/audit-*.md`.

## Builder usability pass — 2026-08-29 (v1.1.1 → v1.1.16)

From an interactive walkthrough of the running builder (`todo.md` items 39–54).
One commit per item; version bumped one patch per item. All checks green:
`lint`, `build`, `check:share`, `check:reducers`, `check:feedback`,
`test:e2e` (21/21). Branch `v1.1.0`, not pushed.

### High impact

- **v1.1.1 — Duplicate ATS-mode toggle removed.** The editor's disclosure
  showed two near-identical ATS toggles ~400px apart; dropped the standalone
  "Export mode" section. ATS mode is now in two clearly separate contexts (the
  ATS score panel + Settings), not three.
- **v1.1.2 — "Import & export mode" disclosure split.** It hid Quick Import,
  the whole ATS breakdown, JD keyword match, and Smart Suggestions under one
  mislabelled summary. Now two disclosures: **"Import CV"** and **"ATS score &
  suggestions"** (the latter keeps the score + suggestion count in its
  collapsed summary).
- **v1.1.3 — ATS keywords no longer include employer names.** `extractKeywords`
  tokenized every experience entry's company, so the demo CV was told it was
  "missing" the keywords `atlas`, `labs`, `north`, `studio`. Dropped `company`;
  titles and skills remain.
- **v1.1.4 — Cover-letter draft textarea fixed.** It carried `min-h-72` but no
  such utility rule existed, so it fell back to `rows=2`. Added
  `.min-h-72 { min-height: 18rem }`; the whole draft is visible on open.
- **v1.1.5 — "Reset form" is a two-step confirm.** First click arms it (label
  → "Confirm reset", button turns solid red); a second click within 4s clears
  the form, else it disarms. The post-reset toast points at the undo arrow.

### Medium

- **v1.1.6 — "Section NN" numbers dropped.** The 21 panels carried hardcoded
  `Section 00`…`Section 20` eyebrows; templates that hide sections left the
  visible ones non-contiguous ("06" then "13"), reading as missing sections.
- **v1.1.7 — Required-field errors deferred.** `Full name` / `Professional
  title` showed red "is required" on a blank form before any interaction; now
  gated on the field's `onBlur`. The `*` on the label still shows immediately.
- **v1.1.8 — Heading-colour control relabelled + presets.** Toolbar "Color" →
  **"Headings"** (it only ever coloured the name and section titles). The
  picker gained 6 one-click presets (Slate / Ink / Navy / Burgundy / Forest /
  Violet) above the existing wheel + hex field.
- **v1.1.9 — Links section collapsed to platforms in use.** Was 15 mostly-empty
  URL fields, each with a HIDE button. Now shows the 4 common platforms plus
  any field with a value; the rest sit behind "Show more platforms (N)". The
  per-field HIDE button only appears when the field has a value.
- **v1.1.10 — Section order/visibility rows rebuilt.** Each row was
  `[DRAG] [ABOUT: ON] [UP] [DOWN]` with the "toggle" being a button whose label
  doubled as its state. Now: drag handle, plain section name, ChevronUp/Down
  icon buttons, and a real `ToggleSwitch`. Photo row too. `ToggleSwitch` gained
  an `ariaLabel` prop.

### Polish

- **v1.1.11 — Font picker is a plain dropdown list.** Was a horizontal
  filmstrip with nav arrows showing ~3 at a time. Now a vertical list of all 7,
  each name set in its own face, active one checked.
- **v1.1.12 — Export menu items got hints.** PDF / HTML / JSON each carry a
  one-line description (e.g. JSON → "Backup you can import again later").
- **v1.1.13 — Settings → "Manage" expands its target.** It scrolled to the
  collapsed-by-default "Visible sections" panel and left it shut. `PanelSection`
  gained an `expandSignal` prop; `handleManageSections` bumps it.
- **v1.1.14 — Fullscreen zoom stepper no longer hidden.** The fixed
  "Exit fullscreen" button overlapped the zoom bar's +/- group; the bar now
  reserves right padding in fullscreen.
- **v1.1.15 — Editor scrolls to top on a template switch.** A switch can
  add/remove sections; the editor now jumps to the top so the change is
  visible. Instant scroll (smooth is no-op'd in the Chrome test setup).
- **v1.1.16 — "Responsive preview" → "Narrow preview".** The toggle shows the
  template squished, not the HTML export's real mobile layout; renamed with an
  honest tooltip. Feature kept.

### Tests

- Updated `e2e/editor.spec.js` (two-step reset needs a second click) and
  `e2e/responsive.spec.js` (font panel is now `role="listbox"`).

## 1.0.0 — 2026-08-09

First stable release. The app builds, previews, and exports a CV entirely in the
browser, with no account and no CV data leaving the page.

Everything below landed during the run-up to 1.0.0. The reasoning behind the
fixes, and how each was verified, is in [`docs/audit-1.0.0.md`](docs/audit-1.0.0.md).

### Share links

- Rewrote the share payload (version 3). Earlier links carried only name, title,
  about, photo, skills, experience, education, and links; the other twelve
  sections were silently dropped. All twenty sections now travel.
- Empty fields are omitted from the payload and restored to their schema default
  on the way back, which keeps links small despite the wider coverage.
- Version 2 links still decode, so previously shared URLs keep working.
- Raised the size limits to 16,000 characters of data and 18,000 for the whole
  URL. A fully populated demo CV encodes to ~6,100.
- **Uploaded images are excluded from share links.** A profile photo is a data
  URL of tens of kilobytes — a 20KB photo produced a 42,551-character payload
  against a 16,000 limit, so "Copy share link" failed for every user who added
  one. Links now carry the CV text and stay a constant size regardless of image
  size; the app says so when it copies.
- Copy failures caused by the Clipboard API being unavailable (insecure context,
  denied permission) now report a distinct, actionable message instead of
  surfacing a raw `TypeError`.

### Accessibility

- `FloatingField` now ties its label to its control with `id`/`htmlFor`. The
  label was previously a sibling with neither, leaving roughly 27 fields across
  experience, education, certificates, projects, and languages with no
  accessible name and no click-to-focus.
- `AutoGrowTextarea` forwards the props it does not name explicitly. It had been
  dropping the `id` injected by `FloatingField`, orphaning every "Description"
  label.
- Added accessible names to the job-description textarea, the quick-import
  textarea, and the interests inputs.
- The profile-image field is no longer a `<label>`; clicking the hint text or the
  preview image used to reopen the file picker.
- The link fields' hide/show button was moved out of the `<label>`, which had
  folded the button text into each input's accessible name.

### Editing

- Collapsed entry cards track their section and index, and that mapping is now
  remapped when an entry is removed, duplicated, moved, or dragged. Collapsed
  state previously stayed on a position and transferred to a different entry.
- Move actions ignore out-of-range targets rather than reordering past the ends
  of a list.
- Section navigation scrolls the editor panel itself instead of using
  `scrollIntoView`, which dragged the whole page along with it. It falls back to
  an instant jump when a browser accepts a smooth scroll and never performs it,
  which would otherwise leave every nav entry dead.
- The active-section highlight tracks which sections are visible across
  IntersectionObserver callbacks, so scrolling a section out of view no longer
  leaves the previous entry highlighted.
- Section numbering in the editor is contiguous again (it skipped from 05 to 07).
  (Superseded 2026-08-29: the section numbers were removed entirely — see v1.1.6
  above.)

### Exports

- HTML export includes the tagline and the email/phone/location contact line.
- Export filenames fall back to `cv` when a name contains no Latin characters,
  which previously produced files named `.pdf` and `.json`. Accented letters are
  folded rather than dropped, so `Ääkkös Öö` yields `aakkos-oo` instead of the
  lossy `kk-s`.

### Other

- Modals keep their focus trap when a parent re-renders. Passing an inline
  `onClose` used to tear the trap down and bounce focus out of the open dialog.
- Toast timers are cleared from their tracking map on unmount, so toasts are
  still dismissible after a remount.
- Added `npm run check:share`, a browser-free regression check for the share-link
  codec.

### Earlier in the 1.0.0 cycle

- Sanitized project and certificate link hrefs against `javascript:` URIs.
- Updated DOMPurify to a patched version.
- Removed local draft autosave, so nothing persists after the tab closes.
- Removed the dark theme and the Developer template's watermark.
