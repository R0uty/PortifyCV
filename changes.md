# Changes

Running log of notable work, newest first. Fuller reasoning and verification
notes for each item live in `todo.md`; per-commit detail is in git history.
(This file replaces the old `CHANGELOG.md`, folded in below.)

## Template style variants — 1.6.0, 2026-10-08

Every one of the 18 templates now comes in three looks, so a CV no longer
has to wear a template's one default colour scheme. Pick a look from the new
"Style" ("Tyyli") button in the toolbar, right after Template, in both
Classic and Direct Edit. Under 1600px wide the button shows only the look's
colour strip (a dot appears when the look is modified) with the name in its
tooltip and label; wider, it shows the name and a "Modified" ("Muokattu")
pill.

A look changes the template's own palette, its font and its headings
colour. It never changes the type ramp, density, layout or page count
(a new variant layout and PDF-budget suite guards that). Picking a look,
even the one already active, resets accent, font and headings colour to that
look's values, and the same applies when a CV is loaded or an undo/redo
crosses a look change. Tweaking the accent, font or headings colour after
that stays tab-only and marks the look as Modified; it is not saved
anywhere. The first look of every template is the template's existing
design, so old CVs, share links and exported JSON look exactly as before.
The chosen look is stored per template in the CV (`styleVariantByTemplate`)
and travels in share links under the new `va` key.

Under the hood each template's colours became CSS variables (Minimalist
gets its own stylesheet, and Developer, Colorful Compact, Tech Executive,
Timeline and Portfolio were tokenised) and the looks live in
`src/utils/templateVariants.js`. The new `check:template-variants` makes
sure the first look matches the stylesheet defaults, every variable is
declared once, and text pairs meet WCAG contrast, traced from real CSS
usage. While testing, Portrait's language row was found overflowing the page
in the builder; it now wraps between languages (1.5.16).

Known gaps, kept as first-look-only `defaultContrastExceptions` because they
predate this work and changing them would change the original designs:
Minimalist amber project names on white (3.19), Developer teal cert link on
white (2.49), Creative faint meta on the sidebar (4.25) and coral accent on
page, sidebar and cards (3.35, 2.97, 3.64), Modern Professional slate
contact text (4.45), Compact sky accent text (3.83), Portfolio Hybrid grey on
the sidebar tint (4.48), Modern Orange accent on page and sidebar (2.42,
2.30) and white title text on orange (2.46), and Colorful Compact grey on
the sidebar (4.39). The other two looks of each template pass.

## Clear CV in Direct Edit — 1.5.4, 2026-10-07

Direct Edit gets a "Clear CV" button under "Load demo CV". It works like
Classic's "Reset form": the first click turns it into a red "Confirm
clear", a second click within a few seconds clears the CV, and the
toolbar's Undo brings it back.

## Visible edit pencils and Load demo CV in Direct Edit — 1.5.3, 2026-10-07

Every section's edit pencil is now always visible in Direct Edit, not
only while the pointer is over the section, and it's drawn in Direct
Edit's teal with a white pencil and rim so it reads as an editing tool on
any template, light or dark. The hovered section's pencil grows slightly.
Pencils are re-measured after every edit and whenever the preview
resizes, so they follow their sections. The smaller per-entry pencils stay
hover-only, in the same teal. Direct Edit also gets its own "Load demo
CV" button, under "Sections" at the preview's top right. Undo now
records a change made in the last moment before undoing it, so Undo
straight after "Load demo CV" (or any other change) undoes just that
change instead of also the one before it.

## Editable skills — 1.5.2, 2026-10-07

Skills can now be renamed, not just added and removed. In Direct Edit each
skill chip on the CV has its text (click to edit in place) and a separate
×; a click on the chip used to delete the skill outright. "+ Add" opens an
empty chip to type into instead of inserting "New skill 3", and adds
nothing if left empty. The Skills popup's rows are editable text boxes, and
Classic mode's skill and technology tags edit in place too. Everywhere,
Enter or clicking away saves, Escape cancels, a duplicate of another skill
is refused with a note, and emptying a skill removes it (new
`UPDATE_SKILL` form action, covered by `check:reducers`).

## No real information in example CVs — 1.5.1, 2026-10-06

Every example CV (the per-template pages' 24 people) and the demo CV now
use one placeholder identity: John Doe, john.doe@example.com, 0123456789.
Employers and organisations are "Example Oy", schools "Example
University", certificate issuers and publishers "Example Oy", open-source
projects "Example project", and events "Example Conference" and similar.
Certificate titles keep their subject without the brand. Every link points
at a reserved example.com host. The demo CV used to link to a real GitHub
user and a real registered domain, and the examples named real
universities, hospitals, certificate bodies and open-source projects.
Skills and tools (React, Figma, SAP…) and cities stay, since they aren't
claims about an organisation or a person. `check:template-pages` now
fails if an example or the demo CV strays from the placeholders or links
anywhere but example.com.

## Builder usability — 2026-10-04

The builder's template gallery gives each template a "View examples" link
to its own page (`/free-cv-templates/<slug>`), opened in a new tab so the
user's CV and chosen template stay as they are. The public Free CV
Templates page (`/free-cv-templates`) gets the same "View examples" button
beside each card's "Use this template", opening the template page in the
same tab. The landing page's hero has a "View templates" button next to
"Start building", leading to that templates page.

Direct Edit now has the same nav rail as Classic mode, from the desktop
breakpoint up, sticky under the toolbar. It lists the sections the
template shows (minus any the user has hidden) plus the Settings,
Templates and Cover letter shortcuts. Clicking a section scrolls the CV to
it and opens its edit popup; Personal Information opens the header popup.
The active item follows scrolling. With Settings reachable from the rail,
the toolbar's Settings icon is now narrow-screen only in both modes.

While the cursor is in any field of an entry (a job, degree, project…),
that whole entry gets a light accent tint and an accent bar on its left
edge. An empty field's placeholder now stays visible after the field is
clicked and disappears on the first character typed, coming back if the
field is emptied again.

## Template polish (Phase 2) — 2026-10-03

A full layout audit of all 18 templates (`docs/template-audit-phase2.md`)
against three new e2e specs — `template-layout.spec.js` (every template
× every example CV, normal and ATS view, plus a stress tier of synthetic
edge-case CVs run through the builder), `template-content.spec.js` (every
achievement/technology string actually reaches the rendered preview), and
a shared `e2e/helpers/layoutAudit.js` harness (clipped text, mid-word
breaks, name-row line limits, page-length budget) — found and fixed 14
distinct findings across 18 templates, tracked through a
`LAYOUT_ALLOWLIST` (`e2e/fixtures/layoutAllowlist.js`) that is empty again
as of this release; a stale allowlist entry fails its own test, so the
list can't silently rot.

**Biggest user-visible fix:** 17 of the 18 bespoke template Showcases were
silently dropping every experience entry's `achievements` and
`technologies` strings — only `description` ever reached the rendered CV
in non-ATS mode (Minimal's always-flat rendering was the one exception).
All 18 templates now render both fields via shared helpers in
`directEditExperienceEntry.jsx`, in both normal and ATS view, and in PDF
exports. A related export-only bug is also fixed: a visible-but-empty
section's "… will appear here" builder placeholder text used to reach the
exported PDF verbatim; PDF export now renders from a separate, off-screen
copy of the CV with empty sections hidden, so the placeholder never
reaches it (and templates that number their sections, Creative and
Editorial, number only the sections the PDF actually contains).

**Other fixes:** sidebar link values that used to truncate with an
ellipsis (or, on Quadrant, clip with no ellipsis at all) now wrap via a
new shared primitive, `.tpl-value-breakable`
(`src/styles/templates/_system.css`); the same file adds
`.tpl-text-wrappable` for ordinary word text and `.tpl-chip-wrappable` for
skill chips, replacing a blunter `overflow-wrap: anywhere` that had been
re-opening the door to fracturing ordinary words once a row got crowded.
Several templates' name rendering is fixed for long/compound names and
narrow sidebar columns (Navy Professional's identity rail padding, Modern
Orange's glued first/last name spans, Executive's and Modern Orange's
mid-word fragmentation under a tight column floor). Executive stepped
from `standard` to `compact` density (with corrected line-heights) to
pull its example CVs back under the 2.0-A4-page budget after the
achievements/technologies fix added real content; Portfolio Hybrid
needed two steps, `roomy`→`standard`→`compact` (the first step alone
only closed ~5% of its 20–23% overage, since its content is dominated by
wrapped body text, not whitespace), plus a rhythm trim within `compact`;
Classic Professional got a smaller rhythm trim within its existing
`roomy` class for the same reason. Net effect on PDF page counts
(`EXPECTED_PDF_PAGES`, `e2e/template-pdf.spec.js`): Executive 2→3→2,
Classic Professional 1→2 (from the content fix), Portfolio 3→2 (from
the density fix), and Tech Executive and Quadrant back at 1 (the content
fix pushed each to 2; a final rhythm trim brought their featured examples
back under one page) — a deliberate, recorded net change, not a
regression.

**Test suite:** the new specs roughly doubled e2e run time (523 tests,
~2.5 min, up from ~1.1 min pre-Phase-2), so CI now splits the suite:
`npm run test:e2e:fast` (`--grep-invert @slow`, 427 tests, ~2.0 min) runs
in the existing `e2e` job, and a new `e2e-slow` job runs
`npm run test:e2e:slow` (`--grep @slow`, 96 tests, ~36s) — the stress
tier, `template-pdf.spec.js`, and `template-pdf-placeholder.spec.js`.
`npm run test:e2e` (no filter) still runs everything locally. Lint and
all seven `check:*` scripts pass; the full suite is 523/523.

## Template pages fix wave — 2026-10-02

Fixes from the final whole-branch review of the `v1.4.0` template pages,
before the PR into `main`. "Start blank with this template" now opens
`/cv?template=<id>&blank=1`, a new branch in `loadInitialCvSession`
(after the share-link and session-snapshot branches) that returns a
blank CV with no onboarding-demo toast, instead of falling into the
first-time-visitor demo branch; the `blank` param is stripped from the
URL on mount the same way `example` is. When a session snapshot is
restored and the URL also carries a valid `?example=` for the selected
template, the init toast now says "Kept your restored CV. Use 'Load demo
CV' to start over." instead of the generic restore toast, so the visitor
knows why the example link didn't take over. On `TemplateDetailPage`, the
preview shows a same-sized loading placeholder (with `aria-busy` on the
preview container) while an example is in flight, including on first
paint — the demo CV only ever shows once a load has resolved to null
(missing/failed example). The builder now shows an error toast
("Couldn't load that example." / fi) when a `?example=` link resolves
null instead of silently staying blank. Accessibility: the preview gets a
visually hidden caption ("Preview: <role> example in the <Label>
template" / fi), and the pager's `<nav aria-label>` is now "Template
navigation" / "Pohjien selaus" instead of duplicating the "All templates"
link text.

## Template pages — 2026-10-02

Closes out the `v1.4.0` branch for its pull request into `main`. Each of
the 18 templates now has its own public page at
`/free-cv-templates/<slug>` (slugs are permanent once shipped): the
template rendered full-size with 2–3 switchable example CVs, per-template
copy (who it suits, three layout tips, an English `metaDescription`), the
breadcrumb structured data the worker now attaches to every template
page, and a "Use this example" link that opens the builder with that template
and example preloaded. 24 fictional example people (`src/utils/examples/`,
registered in `exampleCvs.js`) cover the 18 templates' 2–3 example slots,
shared across templates where the fit is real; each person fills every
`primarySections` entry of every template listing them, in both locales,
so no template page ever shows an empty-section placeholder — the
preview-only `src/utils/sectionContent.js` hides what has no content
instead. A new `npm run check:template-pages` (the seventh `check:*`
script, now in CI) enforces slugs, example coverage, section fill, and
copy bounds; `e2e/template-pages.spec.js` covers the page itself.

Verification on this commit: lint clean, all seven `check:*` scripts pass,
196/196 e2e pass against a production build. Manual worker check
(`npm run build` + `npm run worker:dev`) confirmed `/free-cv-templates/developer`
serves the Developer title, a canonical link ending
`/free-cv-templates/developer`, and the BreadcrumbList JSON-LD; an unknown
slug (`/free-cv-templates/not-a-template`) returns a real `404`; and a
case/trailing-slash variant (`/free-cv-templates/Developer/`) redirects
`301` to the canonical slug.

Bundle check: a first pass found the entry chunk had grown from 35.17 kB
gzip (`v1.3.0`, built from `origin/v1.3.0` in a scratch worktree) to 45.06
kB gzip — about 9.9 kB — because `pageMeta.js`'s `VIEW_HEAD` imported
`templatePageCopy.js` for `metaDescription` alone, dragging every
template's bilingual `bestFor`/tips copy into the entry graph along with
it. Fixed by splitting the English-only `metaDescription` strings out
into their own `src/utils/templateMetaDescriptions.js`
(`{ [templateId]: string }`), which `pageMeta.js` now imports instead;
`templatePageCopy.js` keeps only the bilingual `bestFor`/tips and is read
solely by the lazy-loaded `TemplateDetailPage.jsx`. Re-measured: the entry
chunk is now **36.46 kB gzip**, +1.29 kB over the `v1.3.0` baseline — under
the ~2 KB target. Each example CV is still its own small lazy chunk
(verified via `ls dist/assets`).

Four visual issues were observed in example previews during this work
and deliberately left for Phase 2 template polish rather than fixed here
(sidebar link truncation, a long name wrapping to four lines in Navy
Professional, long previews running to 2+ A4 pages, Modern Orange
clipping long skill names) — see "Phase 2 inputs" in `todo.md` for the
full list and which templates/examples triggered each one.

## 1.3.0 release — 2026-10-01

Closes out the `v1.3.0` branch for its pull request into `main`. The
headline features since 1.2.0 are already logged below: three new bespoke
templates (Editorial, Portrait, European; 18 in total, with Classic retired
into Classic Professional), Word (.docx) export, the Direct Edit builder
(inline editing on every template, photo upload, keyboard access, entry
pencils, section column moves), and three new `check:*` scripts.

Release check on this commit: lint clean, all six `check:*` scripts pass,
181/181 e2e pass against a production build. The README was out of date
(it still listed 10 templates, three of the six check scripts, and no
Cloudflare deploy commands), so it now describes 1.3.0 as it ships.

## Two minor review follow-ups: search box and Finnish entry labels — 2026-09-30

The two minor findings from the whole-branch review:
- **The toolbar's "Search sections" box did nothing in Direct Edit.** It
  only filters Classic mode's nav rail, which Direct Edit does not
  render. It now shows in Classic mode only; Direct Edit's Sections
  popover already lists the sections.
- **`EditableList`'s drag handle and remove button were labelled in
  English only** ("Drag to reorder", "Remove entry"), so a screen reader
  on the Finnish UI announced them in English. `DirectEditContext` now
  carries the locale, passed by all 18 of `CVPreview`'s providers, and the
  Finnish labels are "Järjestä vetämällä" and "Poista kohta".

One test each, both failing first (the search box was still present in
Direct Edit; the handle read "Drag to reorder" in Finnish).

## PDFs exported from Direct Edit no longer contain the editor — 2026-09-30

Found by a whole-branch review of `v1.3.0` against `main`. PDF export
deep-clones whatever `previewRef` points at, and in Direct Edit (the
default mode) that was the live editable CV. So every PDF exported from
Direct Edit carried the editing chrome (the "+ Add experience" row,
removable skill chips with ×, the "+ Add" chip, placeholder text in empty
fields), showed experience entries the user had hidden (`EditableList`
renders formData, not the visibility-filtered snapshot), and on Tech
Executive and European printed chips instead of their comma-joined
skills. It affected every template.

`DirectEditPreview` now also renders the same CV read-only (no dispatch,
exactly as Classic mode would) in an off-screen, `inert`, `aria-hidden`
container, and `previewRef` points at that copy. The copy sits outside
`.direct-edit-preview`, so the section overlay only ever sees the
editable CV. It is moved off-screen rather than hidden, because the
exporter reads computed styles from the source nodes. The cost is a second
render of the CV while in Direct Edit.

A new test hooks the exporter's deep clone and checks what it captured:
before the fix it held 29 editing elements, the hidden entry, and no
comma-joined skill line; now none, not present, and one. Three existing
tests looked sections up page-wide and started matching the off-screen
copy too; they are now scoped to `.direct-edit-preview`, except the check
that a hidden section is gone, which stays page-wide so it also covers the
export copy.

## The inline-edit allowlist is gone — 2026-09-29

With every template inline-editable since v1.2.73,
`INLINE_EDIT_SUPPORTED_TEMPLATES` (`src/utils/directEdit.js`) listed all
18 and no longer excluded anything. It is removed, and
`DirectEditPreview` now passes the dispatch to `CVPreview` in Direct Edit
unconditionally. Classic mode, exports and gallery thumbnails still get
no dispatch, because they never render through `DirectEditPreview`.

Its regression script, `check:direct-edit`, only validated that list, so
it is removed too, from `package.json`, CI and `CLAUDE.md`: there are now
six check scripts. Inline editing on all 18 templates stays covered by
the e2e suite's per-template tests, which pass unchanged; they guard this
refactor rather than new behaviour, so there was no failing test first.

## Executive's secondary text meets AA contrast — 2026-09-29

Executive's tagline and contact details read 4.37:1 on its rail, under
WCAG AA's 4.5:1, and unlike the kicker they are exported. Measuring every
piece of text in the template showed the cause was the shared
`--ex-ink-faint` token, not those two rules: every use of it on the rail
failed the same way (tagline, contact details, core-strength
descriptions, skill-group labels and certificate details), and its uses
on the main column only just passed at 4.56:1.

So the token itself changed, from `#78716c` to `#6b645e`: 5.3:1 on the
rail, and still lighter than `--ex-ink-muted`, so secondary text still
reads as secondary. **This changes exported Executive PDFs**, slightly
darkening all of the template's secondary text, not only the tagline and
contact. The kicker, given `#6b645e` as its own colour in the previous
change, points back at the token again.

A new test checks every piece of text on the rail is at 4.5:1 or better;
it failed at 4.37 first. The old hex had no other copies (the Word export
does not duplicate it).

## Creative and Executive kicker labels meet AA contrast — 2026-09-29

The follow-up to the Tech Executive fix. Each template's "<Template>
Template" kicker is preview-only (left out of exports), and two more sat
under WCAG AA's 4.5:1:
- **Creative, 3.35:1.** The kicker is the user's accent, and the default
  Coral is too light on the peach page; the other five swatches already
  passed. It now uses the accent darkened 25% toward the template's ink:
  Coral reads 4.97:1, the rest 6.3–7.8:1. The darkening is computed in
  JS by a new `accentInkMix` helper (`src/utils/templateAccents.js`,
  beside `accentSoftFill`) and passed as `--cr-kicker`, because the
  templates' stylesheets rule out CSS `color-mix()` (the PDF pipeline
  can't rasterize it).
- **Executive, 4.37:1** on its rail. The kicker now has its own
  `#6b645e` (5.3:1) instead of the shared `--ex-ink-faint`.

**Portfolio Hybrid needed nothing.** The earlier sweep's 1.00:1 was a
measurement artifact: its header gradient starts with a translucent tint,
which the sweep read as the background. Computed properly, its kicker is
5.29:1 at the default Emerald and 4.82:1 at its weakest swatch.

**A test-helper bug surfaced and was fixed.** `minTextContrast` (in
`e2e/direct-edit.spec.js`) parsed every colour as 0–255, but Chrome
reports a `color-mix()` result as `color(srgb r g b)` in 0–1, which it
read as near-black, so a first attempt using `color-mix()` passed
falsely. The helper now scales that form. No other test was affected:
nothing else in the templates used `color-mix()`.

The Tech Executive kicker test is now a loop over all three templates;
Creative's and Executive's rows failed first, at 3.35 and 4.37.

(Executive's tagline and contact details, flagged here as still open,
were fixed in the next change.)

## Tech Executive's masthead label meets AA contrast — 2026-09-29

The "Tech Executive Template" kicker on the navy masthead was `#94a3b8`,
4.13:1 against `#163d7a`, under WCAG AA's 4.5:1 for text that small. It
is now `#a8b5c8`, 5.1:1, still dimmer than the contact line (7.1:1) so it
reads as a secondary label. The kicker is preview-only (left out of
exports), so PDFs are unchanged. A new test checks it; it failed at 4.13
first.

A throwaway sweep of every template's kicker while making this change
found three more below 4.5:1, left alone because they were not asked
about: Creative (3.35:1), Executive (4.37:1), and Portfolio Hybrid, which
measured 1.00:1. That last figure is probably an artifact of how the
sweep resolved its background, and needs a proper look before it is
trusted.

## European entries are spaced apart again — 2026-09-29

European's Experience, Education and Projects entries sat 0px apart in
every mode, exports included. The template spaces its label/value rows
with `.row + .row`, but each dated entry wraps its row in its own card
`div`, so the rule never reached from one entry to the next. That has
been true since the template was added. The entries in each of those
sections now sit in a flex column with a 0.9rem gap, the same rhythm as
the other rows. A gap spaces whatever the list's children are, so it also
holds in Direct Edit, where `EditableList` adds its own wrapper around
each Experience entry.

This changes the exported PDF: entries gain 14.4px each, so a CV right at
the one-page limit may now step down to European's compact density
sooner. A new test measures the gap in Classic and Direct Edit; it failed
at 0px before the fix.

## Inline editing on European — every template is now inline-editable — 2026-09-29

European is the eighteenth and last template to get inline editing, so
the rollout is complete: on every template, the name, title, contact
details, About, Experience and Skills can be edited by clicking into the
text, and everything else through the section popup.

On European, the name, title, contact line (location, email, phone, and
LinkedIn as a link field), About and Experience (role, company,
description, drag to reorder, add) are editable in place, with each
entry's dates staying in the label column. Skills use the agreed option
A, as on Tech Executive: the comma-joined category rows become one row of
grouped chips while editing and come back afterwards.

The contact line's `·` separators are drawn by a
`meta-item + meta-item::before` rule, the same shape that broke
Editorial's placeholders when the template class sat on the editable
field. The class stays on a wrapper span, and the empty-placeholder test
passes. The only CSS needed was `white-space: pre-line` for the
description's editing element, caught by the multi-line test failing
first. European's one-page density auto-fit was checked while editing:
the demo CV renders `compact` in both Classic and Direct Edit.

**Three tests were rewritten**, because each depended on a template
without inline editing, and none is left:
- "an entry pencil still targets the right entry when an earlier entry is
  hidden" now hides a Certificates entry instead of an Experience one.
  Certificates, like every section other than Experience, still renders
  from the visibility-filtered snapshot, so the index mapping it guards
  is still real.
- "an edit in Direct Edit mode survives switching template and back"
  goes through European and now also checks the edit shows up inline
  there.
- "an inline-unwired template is still fully editable through the popup"
  was removed: the per-template loop already opens and edits the popup on
  all 18 templates.

**Noticed, not changed:** European's Experience and Education entries sit
with no space between them (0px, measured) in every mode, including
exports. The row spacing rule is `.row + .row`, and each entry wraps its
row in its own `div`, so the rule never applies between entries. That has
been true since the template was added, so it is a design question, not
an editing one.

## Inline editing on Tech Executive — 2026-09-29

Tech Executive is the seventeenth inline-wired template. The name,
title, contact line (email, phone, location), Profile, Experience (role,
company, description, drag to reorder, add) and Technical Skills are
editable in place.

**Skills: chips while editing (the agreed option A).** Tech Executive
shows skills as one comma-joined line per category, which no chip
reproduces. While editing, that section shows the shared grouped chips
instead (same categories, same order); outside editing the comma lines
are unchanged. Editing each line's text in place was rejected: a typed
skill can jump to another group mid-edit, since groups are worked out
from each skill's text, and writing a line back would need a burst of
remove/add actions.

Three fixes were needed, each caught by a failing test:
- **The title would have been saved in capitals** (the role line is
  `text-transform: uppercase`): "Staff Engineer" was stored as "STAFF
  ENGINEER". The editable span now resets the transform.
- **Entry spacing and dividers used `:not(:first-child)`/`:last-child`**
  on a class shared with Education; both sections now set
  `--first`/`--last` classes, as on Navy Professional.
- **The description's editing element needed `white-space: pre-line`.**

Test changes:
- The dark-header contrast test (Colorful Compact) is now a loop that also
  covers Tech Executive's navy masthead, and measures only the inline
  fields. It failed at 4.13:1 on the template's own "Tech Executive
  Template" kicker label, which reads the same in every mode and is left
  out of exports. That label is a pre-existing design matter, not an
  editing one, so it is noted here and left as is. The narrowed test still
  fails at 1.02:1 if Colorful Compact's name fix is removed.
- The moved-Skills test works in either direction, since Tech Executive's
  Skills start in the main column.
- A new guard checks the comma lines are back outside editing.
- The three tests that need a template without inline editing now use
  European, the last one left.

## Inline editing on Quadrant — 2026-09-29

Quadrant is the sixteenth inline-wired template. The name, title, contact
line (email, phone, location), Profile, Experience (role, company,
description, drag to reorder, add) and Skills (grouped chips, via
`EditableCategorizedChip`) are editable in place, each in its fixed grid
cell. Quadrant has no column moves, so there is no moved-section case.

Two fixes were needed, each caught by a failing test:
- **Experience spacing and dividers used `:not(:first-child)`/
  `:last-child`**, which `EditableList`'s per-entry wrapper makes true for
  every entry. They now come from `--first`/`--last` classes.
- **The description's editing element needed `white-space: pre-line`**
  (and `display: block` against the bullet list's flex column).

Three existing tests used Quadrant as their example of a template without
inline editing, and now use Tech Executive, which still renders from the
snapshot. One of them, "an entry pencil still targets the right entry
when an earlier entry is hidden", failed once Quadrant was wired: it
hides entry #1 and expects the first card to be entry #2. That only holds
on a snapshot-rendered template; inline-wired templates show hidden
entries while editing (the accepted Phase 1 trade-off), and their indices
stay correct (checked by the every-template index test). The test now
says so in its comment.

## Inline editing on Developer — 2026-09-29

Developer is the fifteenth inline-wired template. The name, title,
contact line (email, phone, location), Summary, Experience (role,
company, description, drag to reorder, add) and Skills (grouped chips on
the dark rail, via `EditableCategorizedChip`) are editable in place.

Four things needed more than wiring, each caught by a failing test:
- **The name field had an invisible caret.** The name is gradient text:
  `color: transparent` with the gradient clipped to the glyphs. The
  editable span inherits the transparent colour and the caret follows it,
  so you could type into the name without seeing where. It now has a
  blue `caret-color`; the gradient itself is unchanged.
- **Direct Edit's chip chrome read 3.7:1 on the dark rail.** The grey
  chip-group labels now take the read-only group label's colour, and
  "+ Add" gets the same light override as Navy's. The sidebar-contrast
  test is now a loop covering both dark-sidebar templates.
- **The timeline connector used `:last-child`**, which hid every
  connector once `EditableList` wrapped the entries. It now uses a
  `--last` class, as on Modern Professional and Portfolio Hybrid.
- **The description's editing element needed `white-space: pre-line`.**

Also: the test "an edit in Direct Edit mode survives switching to an
inline-unwired template and back" used Developer as its unwired template.
It now uses Quadrant, which is still unwired.

## Inline editing on Navy Professional — 2026-09-29

Navy Professional is the fourteenth inline-wired template, and the first
whose name, title and contact details sit in a dark sidebar rather than a
header. The name, title, contact list (phone, email, location, and
LinkedIn as a link field), Profile, Experience (role, company,
description, drag to reorder, add) and Skills chips are editable in place.

Four things needed more than wiring, each caught by a failing test:
- **The title would have been saved in capitals.** The role line is
  `text-transform: uppercase`, and `EditableField` saves `innerText`, which
  reflects the transform: typing "Staff Engineer" stored "STAFF
  ENGINEER". The editable span now resets the transform, as on Classic
  Professional and Modern Timeline; the title still shows in capitals
  outside editing.
- **The "+ Add" skill chip was hard to read on the navy sidebar**
  (3.25:1), since Direct Edit's generic chip is styled for a white page.
  It now takes a light border and text inside the sidebar. A new test
  checks every piece of sidebar text stays at 4.5:1 or better while
  editing.
- **Entry spacing and dividers used `:not(:first-child)`/`:last-child`**
  on a class Experience shares with Education. Rather than a partition
  marker (Executive's approach), both sections now set `--first`/`--last`
  classes and the positional rules are gone.
- **The description's editing element needed `white-space: pre-line`.**
  The title failure masked this test, so it was proven separately by
  removing the rule and watching it fail.

The provider wraps Navy unconditionally, as it does Modern Timeline,
because Navy's Showcase also renders in ATS mode; outside Direct Edit it
stays inert. The existing Navy ATS-mode guards still pass.

## Inline editing on Portfolio Hybrid — 2026-09-29

Portfolio Hybrid is the thirteenth inline-wired template, and the last
right-rail template with grouped chips. The name, title, contact line
(email, phone, location), About Me, Professional Experience (role,
company, description, drag to reorder, add) and Tech Stack (grouped chips,
via `EditableCategorizedChip`) are editable in place. The tagline stays
popup-only.

Its Experience has the same timeline rail as Modern Professional, and the
same two fixes were needed, each caught by a test that failed first:
- The connector line was hidden on the last entry with `:last-child`,
  which hid every connector once `EditableList` wrapped the entries. It
  now uses a `--last` modifier class set in JS, in both modes. Measured in
  the browser: the line stops 0.3rem above the next marker, as it does
  outside editing.
- The description's editing element needed `white-space: pre-line` and
  `display: block` against the bullet list's flex column.

As on Modern Professional, bold metric highlighting in the bullets shows
only when not editing.

Tests: Portfolio Hybrid joined the per-template loop, the connector loop,
and the categorized-removal and moved-Skills loops.

## Inline editing on Graduate — 2026-09-29

Graduate is the twelfth inline-wired template. The name, title, contact
line (email, phone, location), Career Objective, Work Experience (role,
company, description, drag to reorder, add) and Technical Skills (grouped
chips, via `EditableCategorizedChip`) are editable in place. The tagline
stays popup-only.

Two template-specific points:
- **An empty Career Objective now shows while editing inline.** Graduate
  is the only template that drops the section entirely when it's empty,
  which left nothing to click into. Outside editing it still disappears.
- **No positional-selector fix was needed.** Work Experience reuses
  Education's accent-ruled cards, spaced by the list's gap. Graduate's
  timeline rail, whose connector does use `:last-child`, belongs to
  Internships, which stays popup-only.

The description's editing element needed `white-space: pre-line` (and
`display: block` against the bullet list's flex column), caught by the
multi-line test failing first.

Tests: a Graduate row in the per-template loop, Graduate added to the
categorized-removal and moved-Skills loops, and a new test that writes an
empty Career Objective inline.

The rollout doc's note on Portfolio Hybrid was corrected: its rail is on
Experience, like Modern Professional's, so its round needs the same
`--last` fix.

## Inline editing on Modern Professional — 2026-09-29

Modern Professional is the eleventh inline-wired template. The name,
title, contact line (email, phone, location), Professional Summary,
Experience (role, company, description, drag to reorder, add) and Skills
are editable in place. It is the first right-rail template with grouped
skills, and reuses `EditableCategorizedChip`, built in the Compact round,
unchanged.

Two things needed more than wiring, each caught by a test that failed
first:
- **The timeline connector vanished in Direct Edit.** The line joining
  each entry's marker to the next was hidden on the last entry with
  `:last-child`, which `EditableList`'s per-entry wrapper makes true for
  every entry. The last entry now carries a `--last` modifier class set
  in JS, in both modes. The connector's reach into the gap is unchanged
  (measured: it stops 0.3rem above the next marker in both modes).
- **The description's editing element needed `white-space: pre-line`**,
  and `display: block` to undo the flex column the bullet list uses.

Bold metric highlighting in the bullets shows only when not editing,
since the description is one plain-text field while editing.

Tests: the categorized-chip removal test (Compact only until now) and the
moved-Skills test (Colorful Compact) became loops that include Modern
Professional, and a new timeline-connector test is written as a loop so
Graduate and Portfolio Hybrid, which share the rail, can join it.

## Inline editing on Colorful Compact — 2026-09-29

Colorful Compact joins the inline-edit allowlist, the tenth template where
the CV text can be clicked and typed into, not only edited through the
popup. The name, title, About, Experience (role, company, description,
drag to reorder, add) and Skills chips are editable in place. So is the
whole contact line, including the website, which is the first inline field
to write a link (`links.website`) rather than a root field. Tagline and
location stay popup-only, as on every other template.

Three things needed more than wiring, each caught by a test that failed
first:
- **The name went dark on the dark header (1.02:1 contrast).** Its white
  came from the two split spans, and the `<h1>` inherits the template's
  dark ink. One editable field replaces the spans, so it now takes the
  lead half's white. The two-tone split is shown only when not editing,
  as on Modern Timeline.
- **The experience divider and edge padding used `:first-child`/
  `:last-child`.** `EditableList`'s per-entry wrapper makes every row both,
  so the dashed divider vanished. The rows now carry `--first`/`--last`
  modifier classes computed in JS, in both modes.
- **The description's editing element needed `white-space: pre-line`**, or
  a stored line break is saved back as a space on the first edit.

Skills is the one inline section that can change column. A new test moves
it into the main column and removes a chip there.

The per-template e2e helper's divider check now accepts any drawn border,
not only `solid`, since this template's is dashed. The empty-placeholder
check now counts the template's own contact fields instead of assuming
three.

Also this session: the rollout doc's skills claims were corrected against
each Showcase file (commit `c06c576`).

## Review fixes for the section column moves — 2026-09-28

A high-effort review of everything since v1.2.52 found nine issues; all
are fixed.

**Bugs.**
- Developer only renders its sidebar when it has sections, but its body
  grid always reserved a narrow first track for it. Moving all five
  sidebar sections into main therefore squeezed the whole CV into that
  track (247px of 829). The grid now collapses to one track whenever the
  rail isn't rendered.
- A popup opened from an entry pencil kept the entry's original height as
  its anchor, so after the section changed column it sat 153px away from
  the entry it edits. The overlay now re-measures the focused entry on
  every change, as it already did for the section.
- In Developer's no-sidebar variant path, sidebar sections flowing in main
  were rendered with the rail's placement and light heading. They now
  render as main content. No current configuration takes that path, so
  this one has no test.

**Tests.**
- `check:docx-export` now exports Developer with Skills moved to main and
  Projects onto the rail, and checks where each lands and that Projects
  takes the rail's palette. It fails if the exporter ignores overrides.
- The column-move sweep walks all 18 templates and asserts the Column
  control appears on exactly the expected ten. A template flagged
  `columnMoves` but missing from the list now fails loudly (proven by
  temporarily dropping Modern Orange) instead of silently going untested.

**Cleanups.**
- The ten copy-pasted column routers became one `createSectionRouter` in
  `templates/shared.jsx`. Colorful Compact's colour now travels as a
  trailing argument, so it needs no variant.
- Developer's `SectionHeading` takes the section's placement and derives
  its tone once, instead of eleven call sites restating the mapping.
- Navy's rule mixing a dot background and a list-marker colour was split
  into two rules, one per selector.
- `CLAUDE.md` now documents all seven check scripts and what triggers CI.

## CI now runs on the v1.3.0 branch and covers every check script — 2026-09-28

`.github/workflows/ci.yml` only ran on pushes to `main` and on pull
requests. `v1.3.0` pushes directly, with no PR, so none of its 263 commits
had ever run CI. The workflow also ran only three of the seven check
scripts, so the checks written for Direct Edit (`check:direct-edit`,
`check:section-schema`, `check:section-columns`) and the Word export check
(`check:docx-export`) guarded nothing in CI, even after a merge. CI now
triggers on pushes to `v1.3.0` as well as `main`, and the checks job runs
all seven scripts. The e2e job is unchanged.

## The Direct Edit footer test no longer flakes — 2026-09-28

`'the footer never overlaps the CV preview in Direct Edit mode'` failed
often enough to be treated as noise: re-run with one worker and moved on.
It failed 15 of 30 under parallel load, and occasionally on one worker.
Every failure reported the same two numbers (footer at 668, preview bottom
at 1732), which pointed to a specific state rather than jitter. The layout
was always correct. The test scrolled with `page.mouse.wheel`, which starts
an asynchronous smooth scroll, and then measured the preview and the
footer in two separate `boundingBox()` calls, so when the scroll landed
between them the preview was measured before it and the footer after.

Both edges are now read in a single `evaluate`, in the same frame, and the
scroll is gone: the footer's position relative to the preview doesn't
depend on scroll. The test now passes 30/30 with parallel workers and 30/30
on one worker. It still catches the regression it guards: with the
`min-height: auto` override in `direct-edit.css` removed, it fails 5/5.

## Colorful Compact skill pills pass WCAG AA contrast — 2026-09-28

The skill pills put white text on each section's bright swatch, and five
of the six hues failed WCAG AA's 4.5:1 for text this small: teal 2.49,
orange 2.80, pink 3.53, blue 3.68, purple 3.96. Green only passed because
it had already fallen back to dark text. Found while building the
section column moves, whose contrast sweep had to carve out an exception
for these pills. The pills are now filled with each hue's deep `-text`
shade, the colour the section's own heading already uses, with white text:
5.02 (green) to 6.98 (purple). All six follow one pattern again, each pill
matches its section's heading, and no new colour enters the template's
capped six-hue palette.

The other colour-cycled elements (tags, language badges, section titles,
dates) were measured too and already pass at 4.52 or better, so they are
unchanged. A new e2e test renders one pill per colour variant inside the
live preview, since any one CV only shows a couple of them, and holds each
to 4.5:1. It failed on pink at 3.53 before the change.

## Section column moves open on Modern Orange — 2026-09-28

The last template. Same wrapper conversion as Navy (`Section` and
`SidebarBlock` take the real placement and a `movedFrom` hook), but
Modern Orange's cream rail is light enough that both directions read
without recolouring. Both its columns space their children uniformly, so
Navy's div/section spacing trap does not apply either (gaps measured before
and after a move each way). Its ATS render, which reuses this Showcase,
is covered by the same ATS-mode guard as Navy, with Certificates moved
into the sidebar.

One adaptation was needed, and only screenshots found it. The skill list
is a column stack sized for the rail. Classic's skill rows (name plus dot
rating) are meant to span it, but Direct Edit's inline chips stretched into
full-width bars in the wider main column. There they now flow and wrap
like every other template's tags. Executive and Creative, the other
inline-wired two-column templates, were checked and already size their
chips to content.

With this, item 60 is done: 10 two-column templates offer the move.
Quadrant is deliberately excluded, since its fixed 2x2 grid has no main
column and sidebar to move between.

## Section column moves open on Navy Professional — 2026-09-28

Navy was the template this plan was most worried about, and rightly:
its sidebar is solid navy and its sidebar sections are `SidebarBlock`
`<div>`s rather than the main column's `<section>`s. Both wrappers now take
the real placement and a `movedFrom` hook (its main `Section` used to
hard-code `data-export-placement="main"`).

The sweep found both directions unreadable at first. Sidebar markup on the
white page read at 1.02 (white pills and language text), and main markup
on the rail read at 1.07 (dark entry text). A scoped block in
`navyProfessional.css` fixes each direction. Sidebar → main reuses the
recolouring the template's own ATS block already applies to put the rail
on white, except that the heading takes the main column's blue and honours
the user's heading colour, like its neighbours. Main → sidebar reuses the
rail's own palette: white text, translucent-white meta, light-blue
accents, the rail's divider line.

Two traps were caught along the way. First, Navy reuses this same
Showcase in ATS mode with a white sidebar, so rail-coloured text would
land white-on-white there. A new e2e guard, which moves a section in
Direct Edit and then checks Classic's ATS render (Direct Edit itself
always renders the designer layout), failed at 1.02 before the colour
rules were scoped away from ATS mode, and passes after. Second, spacing:
the rail spaces its `<div>`s and the main column its `<section>`s by
element type, so a moved section sat flush against its neighbour until
two spacing rules, applied in both modes, filled the gap.

## Section column moves open on Developer — 2026-09-28

Developer is the first template that needed real adaptation, because its
sidebar is a dark gradient and its sidebar markup is written for it. The
sweep caught this immediately: Skills moved onto the light main column
read at 1.10, light text on light.

Two fixes. First, `SectionHeading`'s tone was a hard-coded `tone="sidebar"`
prop on each sidebar section, applied as an inline colour that CSS cannot
reach, so every heading now derives its tone from the real placement, the
same way `Section`'s tone class already did. At home nothing changes.
Second, a scoped `[data-moved-from='side']` block in `developer.css` maps
the rail's text colours onto the main column's palette. It is the same
mapping the template's print styles already use to put the rail on white:
light text to `--dev-primary`, the rail's `#94a3b8` meta to the main
column's slate, the rail's bright link teal to `--dev-teal`. Every moved
sidebar section now reads at 4.76 at worst, up from 1.10. Main-column
sections moved onto the rail (Projects, Achievements) needed nothing
beyond the heading: their cards carry their own white background and read
exactly as at home.

Checked by eye both ways, and with a PDF export with Certificates moved
to main and Projects to the rail: the page break falls after Publications,
the moved Certificates section lands whole on page 2, and nothing is
sliced mid-card.

## Section column moves open on Portfolio Hybrid, Tech Executive and Colorful Compact — 2026-09-28

Same conversion again. Colorful Compact's renderers also take a
per-section colour, so its router passes the colour through, and the colour
still comes from the running index in the column the section actually
sits in, which keeps the rainbow in order across both columns. None of the
three needed CSS. Checked by eye (Certificates and Education on Portfolio
Hybrid, Projects and Education on Tech Executive, Skills and Projects on
Colorful Compact) and by the sweep.

The sweep's contrast bar was refined here. Colorful Compact's skill pills
are white on teal at 2.49 at home, so Skills moved into main could not
meet the main column's baseline. Meanwhile Creative's Projects legitimately
drops from 3.35 to 2.97 in its tan rail, because that is exactly what
Creative's own sidebar sections show. A moved section must now read no
worse than it did at home, or no worse than what the template already ships
in the target column, capped at 3:1. A deliberately broken rule (white text
on moved sections) is still caught at 1.04. The white-on-teal pills are a
pre-existing contrast issue in Colorful Compact, flagged separately and
not changed here.

## Section column moves open on Modern Professional, Executive and Graduate — 2026-09-28

These three follow Creative: their `Section` already took a placement, so
each got the same conversion. The renderers take the real placement and a
`movedFrom` hook, a `renderSection` router sends each section through its
home renderer, and `columnMoves: true` switches them on. None needed CSS
adaptation. Checked by eye with one section moved each way per template
(Skills and Education on Modern Professional, Certificates and Projects on
Executive, Languages and Education on Graduate), and by the sweep test,
which now covers all four templates. Modern's `showSidebar` gate was
checked too: every template that has it hard-codes it to `true`, so no
configuration can hide a section moved into the sidebar.

## Direct Edit: move a section between the main column and the sidebar (Creative first) — 2026-09-28

On a two-column template, the section popup now has a Column row (Main /
Sidebar, fi: Pääsarake / Sivupalkki). It shows where the section lives and
moves it with one click, which is one undo step through the existing
`SET_ROOT_FIELD`. The row appears only where the move is allowed: any
sidebar section can move into the main column, and a main-column section
can move into the sidebar only if some template already designs it for one
(skills, links, certificates, education, languages, interests, core
strengths, memberships, achievements, projects). Experience and About stay
put. The popup stays open on the moved section, and ↑/↓ follow it into its
new column.

A moved section keeps its home column's markup. Its
`data-export-placement` comes from the column it actually sits in, so the
PDF exporter paginates it correctly, and a `data-moved-from` attribute
gives each template's CSS a hook to adapt it. Each template opts in with
`columnMoves: true` in `cvTemplates.js`, so the rollout goes one template
at a time. Creative is first and needed no CSS adaptation either way: its
Skills chips read cleanly on the page and its Projects card fits the tan
rail.

A sweep test walks every opted-in template and moves each movable section
both ways. It checks the section's container, its placement, that it has
height, and its text contrast. The contrast bar is the template's own
design for the target column (the lowest text contrast among the sections
it puts there), capped at 3:1, because Creative's own sidebar headings sit
at 2.97 by design, which a fixed 3:1 bar would have mis-flagged as a move
bug. A deliberately broken rule (white text on moved sections) was caught
at 1.04, so the guard has been seen failing.

## Section column moves: the data model and plumbing (no visible change yet) — 2026-09-28

Groundwork for item 60, moving a section between a two-column template's
main column and its sidebar. formData gains `sectionColumnsByTemplate`, a
per-template map of overrides only (default `{}`), following the pattern
of `photoVisibilityByTemplate`. JSON import checks its shape, share links
carry it under a new short key `sc`, and session restore needed nothing,
since it round-trips the whole formData through the same import parser.

The rules live in one pure module, `src/utils/sectionColumns.js`, with
its own `check:section-columns` script. It covers which sections may move,
the next override map for a move (moving a section home deletes its entry
rather than storing the default), and a template config with the overrides
folded in. Invalid or stale entries are ignored at render time rather than
rejected at import, so a rule changing later never makes an old file
unreadable.

The design spec assumed one place resolved the template config, but five
do: the builder, CVPreview, CVForm, and both exporters each looked a
template up by id. All five now call `getEffectiveCvTemplate`, so a move is
seen everywhere at once. No template has opted in yet (`columnMoves`), so
nothing changes visibly.

## Direct Edit: Navy Professional and Modern Orange sidebar sections get a pencil — 2026-09-28

The Direct Edit overlay finds sections by `data-export-section`, and the
sidebar wrapper these two templates use, `SidebarBlock`, rendered none. So
Navy's Skills and Languages and Modern Orange's Skills, Languages and
Education had no pencil and no keyboard trigger, which contradicted the
claim that every section on every template was editable. `SidebarBlock`
now takes an optional `id` and renders `data-export-section` plus
`data-export-placement="side"`, like every other template's sidebar
sections. The contact block (Navy) and personal-info block (Modern
Orange) pass no `id` and stay untagged, because they are not CV sections.
A PDF export test on both templates guards the change. It passes before
and after, since the exporter treats these as sidebar content either way.
Found while designing the section column moves (item 60).

## Direct Edit: pencils for single entries, not just whole sections — 2026-09-27

Hovering one entry of a list section (one job, one certificate, one
language) now reveals a small pencil of its own, hung in the gutter just
right of the entry. It opens the same section popup, but beside that entry,
with the entry outlined and its first field focused, so a long Experience
list no longer means opening the section and scrolling through it to find
the job you pointed at. The section pencil and keyboard triggers are
unchanged. Entry pencils are pointer-only on purpose: the section trigger
already reaches every entry, and one extra tab stop per entry would bury
the section triggers.

The handoff pictured this as a one-line `data-direct-edit-index={index}`
per template. That would have been wrong on any CV with a hidden or blank
entry. Templates render `createCvSnapshot`'s output, which drops those, so
a template's own map index counts only surviving entries while the popup
and every reducer action address formData. The snapshot now carries
`sourceIndices` (per record-array section, the formData index of each entry
it kept), and every render site across all 18 templates writes the mapped
value. The inline-wired Experience renderers already iterate raw formData
in Direct Edit, so they take a `sourceIndex` option that defaults to
`index` and only the snapshot call site passes the mapped value. An e2e
sweep hides entry #1 and checks on every template that each tagged
Experience entry shows the company of the formData entry its index names.
No reducer changes and no new actions.

## Direct Edit: the popup opens beside a section, not on top of it — 2026-09-23

The section popup anchored its right edge to the section's right edge and
only clamped itself inside the preview, so on a sidebar template it
covered the very content being edited: Creative's right rail is ~248px
wide and the popup is 380px, leaving the whole section hidden behind it
while the ~680px main column sat empty. It now picks a side — right of
the section if that fits inside the preview, otherwise left — and keeps
the old clamped overlap only when neither side has room, which is the
normal case on a full-width template (a ~765px section in a ~1088px
preview leaves ~160px either way, so a 380px popup cannot help but
overlap). No change to the vertical clamp or to `scrollIntoView`.

## Direct Edit: Experience bullets and technologies are editable — 2026-09-23

`experience.achievements` — the bullet list that carries most of a work
entry's substance — and `experience.technologies` were editable nowhere
in Direct Edit: excluded from the popup schema and not inline-editable on
any template either, so an entry created from the popup could never get
bullets without a trip to Classic mode. Both are now schema fields of a
new `list` type, rendered as a small add/remove sub-editor inside the
entry. They are the only two array-typed fields in the whole data model
(`internships.technologies` and `caseStudies.technologies` are plain
strings), so this closes the sub-field gap rather than chipping at it.
The sub-editor writes the whole next array through the existing
`UPDATE_ARRAY_ITEM` action — the same action and the same shape Classic's
`ReorderableListInput`/`TagsInput` already produced for these two fields —
so no new reducer action, and edits round-trip between the two modes.
`check:section-schema` now validates the `list` type and its per-item
labels; only `projects.image` remains intentionally excluded, by an
explicit scope decision, since it is an image upload rather than an array.

## Direct Edit: the section editor is reachable by keyboard — 2026-09-23

The hover pencil rendered only in response to `pointerover`, so there was
no way to reach the popup editor without a pointer on any of the 18
templates, and the popup itself had no focus management. The overlay now
also renders one real "Edit <section>" button per editable section —
visually hidden until focused, the skip-link pattern — so Tab walks the
editable sections of whatever template is on screen. Focusing one points
the visible pencil at its section, so a sighted keyboard user can see
where they are. The popup gained `aria-modal`, takes focus when it opens,
traps Tab and Shift+Tab (without which Tab walked straight out into the
`contentEditable` CV behind it, silently landing the user in a different
editing surface), and returns focus to the trigger on Escape. Closing by
clicking outside deliberately does not move focus. Section enumeration
reads the same `data-export-section`/`data-export-header` attributes the
rest of the overlay uses, so this needed no per-template code either.

## Direct Edit: you can add a profile photo without leaving it — 2026-09-21

The header popup used to render a photo *visibility* checkbox only when
the CV already had a photo, so a photo-less CV got no control at all and
the only way to add one was to switch back to Classic mode. The popup now
always offers "Choose image", plus a preview and "Remove image" once a
photo exists; the visibility checkbox stays gated on a photo existing,
since toggling nothing is meaningless. The upload pipeline moved out of
`CVForm.jsx` into `src/utils/profilePhoto.js` and is now shared rather
than duplicated — MIME validation, the 2MB source check, the 480px canvas
resize, the JPEG re-encode and the 450KB post-encode ceiling are one
implementation, so the popup can never accept an image Classic rejects.
No new reducer action: it dispatches the same `SET_ROOT_FIELD` every other
identity field uses. Project images (`projects.image`) stay out of scope.
A photo still only appears on templates that render one, with that
template's visibility flag on — identical to Classic. Photo upload also
gained its first e2e coverage, on both surfaces.

## Direct Edit: every section on every template is now editable — 2026-09-19

Direct Edit gains a section editor: hovering any section in the live
preview reveals a pencil, and clicking it opens a popup with every scalar
field that section holds — including fields a template never displays
(the `tagline`, an education `location`), which no amount of inline
wiring could reach. Array fields that hold their own sub-structure
(`experience.achievements`, `experience.technologies`,
`projects.image`) are intentionally excluded for now — a later-phase
sub-editor is needed for those, since an entry created from the popup
currently can't get bullets. It works on all 18 templates with no
per-template code,
because it hangs off the `data-export-section`/`data-export-header`
attributes every template already carried for the PDF exporter. Sections
can be reordered within their column and hidden from the same popup, and
entries can be added, duplicated, removed, reordered and individually
hidden. Because the popup uses real form inputs rather than
`contentEditable`, it is structurally immune to the three bug classes the
inline rollout kept hitting — `text-transform` corrupting saved text,
multi-line descriptions collapsing, and `EditableList`'s wrapper breaking
positional CSS. It also fixes a bug parked since Phase 1: entries hidden
in Classic mode are now listed in the popup with an explicit visibility
toggle instead of silently reappearing. The "Direct Edit isn't available
yet for this template" notice is gone, because it is no longer true.

## Direct Edit: Creative is now editable, and clean on both standing CSS risks — 2026-09-19

Creative is now editable in Direct Edit mode (Phase 2 Round 8, the third
`railTable`-family template and the first of its right-rail templates),
with the same scope every prior round has used: identity, About,
Experience, and Skills are all inline-editable in the live preview.
Creative's config claims `skillsLayout: 'categorized'`, but its actual
Showcase deliberately flattens skills with no category labels (confirmed
by reading the real file, not the config) — so this round reuses the
plain `EditableChip` from Round 1, not the categorized component built
for Compact/Executive. Creative is also the first `railTable` template
confirmed clean on both of this family's standing CSS risks: no
`text-transform` on any field this round wires, and — unlike Executive
and Modern Orange — no positional CSS selector on its Experience entries
at all (spacing is `flex; gap`-based, not divider-removal-based), so no
proactive CSS fix was needed this round.

## Fix Executive's Experience divider — the same EditableList/dnd-kit bug Modern Orange just hit, already shipped — 2026-09-19

Round 6 (Executive)'s own Experience-divider fix, already shipped and
pushed, had the identical bug Round 7 (Modern Orange) independently
rediscovered and fixed: the `:last-of-type`-on-`.direct-edit-entry`
selector never matches once `EditableList`'s uncontained `DndContext`
mounts its un-portaled accessibility live-region (two extra untyped
`<div>` siblings) after the last entry. Worse, Executive's *original*
unqualified `:not(:first-child)`/`:last-child` rules were also still
present, and — because they have no wrapper-position awareness at
all — matched every wrapped entry, not just the boundary ones, so in
practice every entry kept its divider in Direct Edit mode (the opposite
symptom from Modern Orange's interim state, same root cause).

Fixed with the same `isLast`-driven modifier-class mechanism Modern
Orange landed on, but partitioned more carefully this time: Leadership
and Education both reuse `.executive-showcase__entry` from their own
separate, still-read-only render code (never wrapped, never passed an
index), so the original position-based CSS rules had to stay — the fix
adds an unconditional `--wired` marker class to every *Experience* entry
specifically, and scopes the position-based rules to exclude it
(`:not(.executive-showcase__entry--wired)`), so the two mechanisms are
mutually exclusive by selector rather than competing on specificity or
source-order ties. Verified with a real Playwright script (not just
`getComputedStyle` in isolation) against a live dev server: 3 Experience
entries correctly keep/lose their divider in the right places, Leadership
and Education's own single-entry lists are unaffected, and the full e2e
suite (70 tests, one pre-existing unrelated flake re-confirmed in
isolation) plus lint/build/check:* all stay clean.

## Direct Edit: Modern Orange is now editable, and the Experience-divider CSS bug took two rounds to actually fix — 2026-09-18

Modern Orange is now editable in Direct Edit mode (Phase 2 Round 7, the
second `railTable`-family template), with the same scope every prior
round has used: identity, About, Experience, and Skills are all
inline-editable in the live preview. Skills stay flat here (unlike
Compact/Executive's categorized display), so this round reuses the plain
`EditableChip` from Round 1 unchanged. This round is the rollout's first
concrete hit on the `text-transform` bug class the roadmap predicted for
this family — the title field sits inside a badge styled `text-transform:
uppercase` with no override — fixed proactively (`.modern-orange-showcase__title-badge
.direct-edit-field { text-transform: none; }`) in the same task that wired
identity, before shipping, rather than discovered afterward.

It's also the second concrete hit on the positional-CSS-selector risk
Round 6's final review found on Executive, and this time the fix needed
two corrective passes to actually land, which is worth recording so a
future round doesn't assume "copy Round 6's pattern" is a one-shot
operation. Modern Orange's Experience rows already carried a pre-existing,
unqualified `.modern-orange-showcase__exp-row:last-child` rule from before
this rollout (harmless in the template's original read-only rendering).
The first fix attempt, when Experience was wired for editing, re-anchored
divider removal onto `.direct-edit-entry:last-of-type` — reasoning that
`EditableList` wraps every entry in its own `.direct-edit-entry`, which
makes `exp-row` the last child of *that* wrapper and defeats plain
`:last-child`. That attempt was itself broken: `EditableList`'s
`DndContext` never sets an `accessibility.container`, so `dnd-kit` mounts
two unclassed, un-portaled `<div>`s (its hidden-text and live-region
a11y nodes) as trailing siblings after the last entry and the "add" row
button — so the *true* last `.direct-edit-entry:last-of-type` selector
never matched what the code assumed. The second pass replaced the
positional selector entirely with an `isLast`-prop-driven
`.modern-orange-showcase__exp-row--last` modifier class (the same pattern
Modern Timeline's Round 4 fix established), which is robust regardless of
what `EditableList`/`dnd-kit` renders around the entry. Even after that
fix landed, the *original* pre-existing unqualified `:last-child` rule was
still sitting in the stylesheet, unqualified and un-scoped to Direct
Edit — and because `.exp-row:last-child` (one class plus one
pseudo-class) has higher CSS specificity than the new `--last` modifier
class alone (one class), the stale rule won deterministically, every
time, not intermittently — it kept stripping the divider from every
entry once Direct Edit wrapped them, not just the true last one. A live
manual browser check
(3+ Experience entries, Direct Edit mode) caught this concretely: every
row lost its divider, the opposite of the intended behavior. Only deleting
that stale original rule, leaving the `isLast`-driven modifier class as
the sole source of truth, actually fixed it — confirmed afterward via
`getComputedStyle` on all three rows (first and middle keep
`border-bottom: solid` / `margin-bottom: 20px`; only the true last row,
carrying the `--last` class, has neither).

## Direct Edit: Executive is now editable, reusing Round 5's categorized-chip design — 2026-09-18

Executive is now editable in Direct Edit mode (Phase 2 Round 6, the first
`railTable`-family template), with the same scope every prior round has
used: identity, About, Experience, and Skills are all inline-editable in
the live preview. Executive's read-only Skills section already rendered
as grouped chips, so this round reuses `EditableCategorizedChip` (built
for Compact in Round 5) completely unchanged — the first proof that
component generalizes across templates as intended. Executive's
Experience entries needed their own local renderer rather than the
three-template shared module, since its DOM nests role and the company/
location line together inside one wrapper div, with dates as a sibling
of that wrapper rather than of role directly — a real structural
difference from the shared module's flat layout, even though the two
look similar on screen.

## Direct Edit: Compact is now editable, with a new categorized-skills chip design — 2026-09-17

Compact is now editable in Direct Edit mode (Phase 2 Round 5, the last
`oneColumn`-family template), with the same scope every prior round has
used: identity, About, Experience, and Skills are all inline-editable in
the live preview. Compact is this rollout's first genuinely categorized-
skills template — its Skills section groups skills under derived category
headings (Languages, Frameworks, Databases, Cloud, DevOps, Security,
Other) rather than one flat list, so this round adds a new shared
primitive, `EditableCategorizedChip`, alongside the existing flat
`EditableChip`: chips render grouped for display while still removing the
correct skill from the underlying flat array regardless of which group
it's shown under. Compact's Experience entries also get their own local
renderer rather than the three-template shared module from Round 4 —
role, company, and location render together in one row (not two), a
genuinely different shape from Classic Professional/Editorial/Portrait.

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
