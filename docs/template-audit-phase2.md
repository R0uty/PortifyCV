# Phase 2 template audit — layout harness findings → fix list

**Date:** 2026-10-03
**Scores against:** `docs/template-design-system.md` §9 rubric (7 axes, 0–3;
same scale and anchors as `docs/template-audit-a2.md`).
**Feeds:** fix tasks 6 (G6), 7 (G7), 8a (content coverage — F14, its own
task, carved out of G9), 8 (G8 density), 9 (G9, the remainder). Each fix
task removes its allowlist entries from `e2e/fixtures/layoutAllowlist.js`;
the harness fails on stale entries, so this doc's `F#` → allowlist mapping
is the checklist for "done."

**Controller-ruled task order: T6 (G6) → T7 (G7) → T8a (F14) → T8 (G8) →
T9 (G9).** F14's fix (rendering experience `achievements` as further
bullets and `technologies` as a meta line, per each template's existing
style) necessarily *lengthens* every affected CV, so it must land and have
its `EXPECTED_PDF_PAGES` fallout settled **before** T8's density work
(G8/F13, Portfolio's page-count fix) — doing it the other way round would
have T8 tune Portfolio's spacing against a page count that T8a then
invalidates.

## Method & evidence

- **Source data:** `e2e/fixtures/layoutAllowlist.js` (54 entries: 24
  example-tier, 30 stress-tier — the Phase 2 baseline recorded by Tasks
  2–3), the full violation detail in
  `.superpowers/sdd/2026-10-02-template-polish/layout-baseline.txt`, the PDF
  pagination/export work in `task-4-report.md`, and the controller's
  `controller-findings.md`.
- **Root-cause diagnosis** was done by reading the actual failing element's
  JSX/CSS (file:line cited per finding below), not by re-running the
  harness — the harness already told us *what* fails; this doc explains
  *why*, so the same bug isn't fixed 12 times under 12 different class
  names.
- **Content-coverage** (controller finding 2) was checked by reading every
  bespoke Showcase's experience-entry renderer and the shared flat
  renderer in `CVPreview.jsx`, cross-referenced against `CVForm.jsx`'s
  actual input controls (confirms `achievements`/`technologies` are real,
  user-editable fields, not dead schema) and `src/utils/cvSnapshot.js`
  (confirms the snapshot normalizes them). No throwaway Playwright render
  was needed — the renderer code is unambiguous (see the table below).
- **Rubric** is re-scored from this audit's evidence, replacing the
  provisional/baseline scores in `template-audit-a2.md` (2026-09-09) where
  this audit found something that doc's session didn't have evidence for
  (chiefly: live-DOM clipped-text/name-wrap behavior, and the
  export/content-coverage check `template-audit-a2.md` explicitly deferred
  as "provisional").

---

## 1. Finding counts

### Example tier (24 entries, 21 failing tests)

| Template | clipped-text | length | name-lines | mid-word-break |
|---|:-:|:-:|:-:|:-:|
| developer | 3 | | | |
| creative | 2 | | | |
| modern | 3 | | | |
| executive | 3 | | | |
| portfolio | 3 | 3 | | |
| techExec | 2 | | | |
| navyProfessional | | | 1 | |
| modernOrange | 2 | | | |
| portrait | | | | 2 |

### Stress tier (30 entries, 19 failing tests, fixture `stress:long-single-word` unless noted)

| Template | clipped-text | name-lines | mid-word-break | beyond-page |
|---|:-:|:-:|:-:|:-:|
| minimal | | 1 | 1 | |
| developer | 1 | | | |
| creative | 1 | 1 | | |
| modern | 1 | | | |
| executive | 1 | 1 | 1 | |
| timeline | | 1 | | |
| graduate | 1 | 1 | | 3 (also `ten-jobs`, `sparse`) |
| portfolio | 1 | | | |
| techExec | 1 | | | |
| classicProfessional | | 1 | | |
| navyProfessional | | 1 | | |
| modernOrange | 1 | 1 | 1 | |
| colorfulCompact | 1 | | | |
| quadrant | 1 | 1 | | |
| editorial | 1 | 1 | | |
| portrait | 1 | 1 | | |
| european | 1 | | | |

### PDF results (Task 4)

All 18 templates now export with an exact, deterministic page-count guard
(`EXPECTED_PDF_PAGES` in `e2e/template-pdf.spec.js`) — that work is closed,
not part of this doc's fix list. The one PDF-related item still open is the
**placeholder-text-in-export** finding (controller finding 1, below), which
no committed test catches yet.

---

## 2. Fix groups

Each item: root cause (file:line), affected templates, the exact allowlist
entries it clears, and its group. "Clears N entries" counts rows in
`LAYOUT_ALLOWLIST` whose `(template, subject, mode, rule)` match — not raw
violations, since several violations under one rule share one allowlist row.

### G6 — long unbreakable values (links/emails/skills clipped or overflowing)

**F1 — `*__link-value` sidebar rows truncate instead of wrap.**
Root cause: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`
on the link-value element, identical pattern copy-pasted across templates:
`src/styles/templates/developer.css:414`,
`src/styles/templates/modern.css:610`,
`src/styles/templates/executive.css:568`,
`src/styles/templates/portfolio.css:683`,
`src/styles/templates/techExec.css:444`,
`src/styles/templates/graduate.css:541`,
`src/styles/templates/european.css:295`. A URL/email that doesn't fit the
sidebar column on one line is silently cut to "…" instead of wrapping,
which is exactly the behavior §7.6 says must not happen for long values.
Templates: developer, modern, executive, portfolio, techExec, graduate,
european (7 templates). Clears 21 entries (14 example + 7 stress). Group:
**G6**. **Fixed (1.4.6):** replaced the ellipsis rule with the shared
`.tpl-value-breakable` primitive (`overflow-wrap: anywhere; min-width: 0`,
`src/styles/templates/_system.css`), applied in each Showcase's JSX
alongside the existing `*__link-value` class.

**F2 — `*__arrow-item` / `*__link-item` plain link lists, same truncation.**
Same root cause as F1, different class name because these templates render
links as a plain list rather than a label+value card:
`src/styles/templates/creative.css:421` (`.creative-showcase__arrow-item`),
`src/styles/templates/colorfulCompact.css:464`
(`.colorful-compact-showcase__link-item`),
`src/styles/templates/editorial.css:297`
(`.editorial-showcase__link-item`),
`src/styles/templates/portrait.css:306`
(`.portrait-showcase__link-item`). Templates: creative, colorfulCompact,
editorial, portrait. Clears 6 entries (2 example + 4 stress). Group: **G6**.
**Fixed (1.4.6):** same `.tpl-value-breakable` primitive applied to each
template's arrow-item/link-item class.

**F3 — Quadrant's `link-value` clips with no ellipsis at all.**
`src/styles/templates/quadrant.css:453` has `overflow: hidden; white-space:
nowrap` but — unlike every other `link-value`, see F1 — no
`text-overflow: ellipsis`, so the cut is silent (no "…" cue that content is
missing), a strictly worse variant of the same bug. Template: quadrant.
Clears 1 entry (stress). Group: **G6**. **Fixed (1.4.6):** same
`.tpl-value-breakable` primitive applied to `.quadrant-showcase__link-value`.

**F4 — Modern Orange skill-name rows truncate long skill strings.**
`src/styles/templates/modernOrange.css:148`
(`.modern-orange-showcase__skill-name`): same `overflow:hidden;
text-overflow:ellipsis; white-space:nowrap` pattern as F1, applied to the
skill label instead of a link, inside a flex row shared with the dot-rating
(`modernOrange.css:163`). §7.6 ("one very long single skill string") names
this exact case. Template: modernOrange. Clears 3 entries (2 example + 1
stress). Group: **G6**. **Fixed (1.4.6):** same `.tpl-value-breakable`
primitive applied to `.modern-orange-showcase__skill-name`; the dot-rating
sibling keeps `flex-shrink: 0` so a wrapped skill name doesn't crowd it.

G6 total: **4 fix items, 31 allowlist entries, 13 templates** (developer,
modern, executive, portfolio, techExec, graduate, european, creative,
colorfulCompact, editorial, portrait, quadrant, modernOrange). (Fix-round-1
correction: the first pass of this doc omitted graduate from this rollup
line even though F1's own template list and the §6 index already counted
it — graduate's `clipped-text` entries, rows 35 and 40 in §6, were always
mapped to F1.)

### G7 — names in narrow columns

**F5 — The stress fixture's compound name exceeds every density class's
2-line budget, independent of per-template bugs.**
`stress:long-single-word`'s name ("Kristiansen-Vandenberghe
Oyelaran-Lindqvist") is two hyphenated compounds (24 and 19 characters)
with **no space inside either compound** — the only break opportunities in
the whole string are 1 space + 2 hyphens. At every density class's declared
name size and floor width (§2: 210–240px), that budget produces 3–6 line
boxes, not 2, even where the column is sized exactly per spec and nothing
else is wrong. This is a synthetic-fixture-vs-threshold mismatch, not a
discovered per-template defect. Templates affected (name-lines only, no
mid-word fragmentation): minimal, creative, executive, timeline, graduate,
classicProfessional, quadrant, editorial, portrait. Clears 9 entries
(stress).

**Controller ruling (fix round 1):** the fixture's name
("Kristiansen-Vandenberghe Oyelaran-Lindqvist") is harsher than §7.1's
stated case ("a long two-part name and a single long word") — it's two
*already-compound* long words, not one. **Resolution, owned by Task 7:**
change `stress:long-single-word`'s `fullName` in
`e2e/fixtures/stressCvs.js` to a §7.1-faithful long two-part name (e.g.
"Maximiliana Kristiansen") and re-baseline this fixture's expectations.
The real 4-part name in the example tier (navyProfessional's `cto`, F7
below) is a genuine, non-synthetic case and stays the extreme one this
group must actually handle. Group: **G7**. **Fixed (1.4.7):** fixture
renamed to "Maximiliana Kristiansen"
(`e2e/fixtures/stressCvs.js`); the spec doc's "Stress tier" bullet
(`docs/superpowers/specs/2026-10-02-template-polish-design.md`) amended
with the same rationale. Cleared all 9 name-lines entries this fixture
rename alone made stale.

**F6 — Executive and Modern Orange: the per-segment width is tight enough
that a single hyphen-segment itself fragments mid-word.**
Executive's rail floor is `minmax(212px, 0.33fr)`
(`src/styles/templates/executive.css:44`) feeding
`.executive-showcase__name` (`executive.css:97`); Modern Orange's is
`minmax(210px, 0.71fr)` (`src/styles/templates/modernOrange.css:38`)
feeding `.modern-orange-showcase__name` (`modernOrange.css:297`). Both
floors match §2's 210px `standard` number on paper, but neither accounts
for the identity block's own internal padding, which eats into the
column's content width before the name ever sees it — so the single
11–12-character sub-token left after the browser breaks at the fixture's
hyphen ("Kristiansen", "Vandenberghe") still doesn't fit, and breaks again,
mid-word. Every other template in F5 only gets *extra line wraps*, not a
character-level fracture, which is the tell that these two specifically
have a floor-vs-padding shortfall rather than a budget shortfall. Templates:
executive, modernOrange. Clears 2 entries (stress mid-word-break). Group:
**G7**. **Fixed (1.4.7):** widening the floor to cover the padding was
tried and reverted for both — it competes with the other grid track for
the card's fixed total width, and on Executive it pushed an example CV to
2.23 A4 pages (over the §7.1 budget), on Modern Orange it starved the
sidebar enough to mid-word-break its own long skill string (see F4's
note below). Fixed instead, on both templates, by cutting the
identity block's own horizontal padding and stepping the name down to the
*compact* row (§2) rather than funding the full standard floor —
`src/styles/templates/executive.css` (`__sidebar`, `__name`,
`grid-template-columns`) and `src/styles/templates/modernOrange.css`
(`__header`, `__main`, `__name`, `grid-template-columns`), floors
unchanged at 212px/210px. One side effect surfaced: fixing Modern
Orange's title-badge mid-word-break (same root cause, see F6 above)
unmasked an *already-accepted* G6/F4 mid-word-break on the sidebar's
60-char skill string — the layout harness dedupes a broken word
globally per page, so the skill-name's identical "Infrastructure" break
was silently absorbed by the title-badge's report until the title-badge
was fixed. That's `.tpl-value-breakable`'s intended `overflow-wrap:
anywhere` doing its job (fixed 1.4.6), not a new bug; recorded as its own
allowlist entry (`e2e/fixtures/layoutAllowlist.js`) rather than "fixed"
away.

**F7 — Navy Professional's identity rail is narrower than its own density
floor, and it's a known, already-documented gap.**
`src/styles/templates/navyProfessional.css:32`:
`grid-template-columns: minmax(180px, 0.31fr) minmax(0, 0.69fr)` — 180px,
not the 210px `standard`-class floor the template is nominally on.
`docs/template-design-system.md` §2 "Adoption state" already names this
exact deviation ("Navy Professional's sidebar identity block … narrower
than any density's name-column floor") as an accepted, unresolved gap. It
produces a real 4-line wrap on the **example-tier** `cto` CV ("Maximilian
Alexander Vandenberg-Lindqvist" — a real name, not synthetic), plus the
stress fixture. Template: navyProfessional. Clears 2 entries (1 example +
1 stress). Group: **G7**. **Fixed (1.4.7):** the stress-fixture entry
went stale on its own once F5's fixture rename landed (the new 2-part
name already fit). The example-tier `cto` 4-line wrap needed its own fix:
`src/styles/templates/navyProfessional.css`'s `__sidebar` padding cut
from 1.75rem to 1rem each side (180px floor unchanged — widening it was
not attempted, having just seen on Executive/Modern Orange above that it
trades for page-length or sidebar regressions elsewhere) and
`__name` stepped to 1.2rem/1.1 — smaller than every §2 density's name
row, the documented gap this finding describes, but confirmed still
bigger than this rail's own role (0.8rem) and the main column's section
headings (0.75rem standard) so it stays the dominant line. No structural
change (letting the name span the header) was needed.

**F8 — Modern Orange's name markup glues `nameFirst`/`nameRest` into one
unspaced string.**
`src/components/templates/ModernOrangeShowcase.jsx:249-251` splits
`fullName` at the first space into `nameFirst`/`nameRest`, then renders
`<span>{nameFirst}</span><br/><span>{nameRest}</span>`
(`ModernOrangeShowcase.jsx:562-566`) — the `<br>` gives a *visual* line
break but there is no literal space character between the two spans, so
`el.textContent` (what copy-paste, screen readers, and this harness's
line-counter all read) is `"FirstRest"` with no separator. Under the
stress fixture this is what makes the name read as one 42-character
unbroken-except-for-hyphens run and wrap to 6 lines instead of 2 shorter,
independently-wrapped halves. Template: modernOrange. Clears 1 entry
(stress name-lines). Group: **G7** (per the brief's note — grouped with
name sizing/spacing rather than filed as a cosmetic G9 one-off, since the
fix is the same component and the same visit). **Fixed (1.4.7):** a
literal space (`{' '}`) added before the `<br/>` in
`src/components/templates/ModernOrangeShowcase.jsx`, so `el.textContent`
reads "First Rest" while the visual two-line layout is unchanged
(trailing whitespace before a line break collapses visually).

G7 total: **4 fix items, 14 allowlist entries, 11 templates** (minimal,
creative, executive, timeline, graduate, classicProfessional, quadrant,
editorial, portrait, navyProfessional, modernOrange). **All fixed
(1.4.7)** — see each finding above. One new, already-accepted allowlist
entry was added (Modern Orange's long-skill-string break, unmasked by the
title-badge fix, F6's note), so the net allowlist count for this group is
14 removed, 1 added.

### G8a — content coverage (its own fix task, scheduled after G7, before G8)

**Controller ruling (fix round 1):** F14 (below) is carved out of G9 into
its own fix task, **Task 8a**, run after Task 7 (G7) and before Task 8
(G8/density) — see the task-order note at the top of this doc. The fix
approach: render `achievements` as further bullets in each template's
existing bullet style, and `technologies` as a meta line in each
template's existing style (not a redesign of either), in all 17 affected
Showcases; add an example-tier e2e content-coverage check so this can't
regress silently again; update `EXPECTED_PDF_PAGES` deliberately once
rendering these fields lengthens the affected example CVs' exports.

**F14 — fixed (1.4.8).** Every bespoke Showcase except three drop the
experience entry's `achievements` and `technologies` fields in
normal/non-ATS-bypass rendering. This is the single largest finding in
this audit — see the content-coverage table below for the full matrix.

Root cause, one pattern, confirmed in **17 separate files** (fix-round-1
correction: only **3** of the 17 actually import the shared helper; the
other **14** each carry their own independent copy of the identical
pattern, not a single shared bug):

```js
const bullets = item.description ? splitToBullets(item.description) : []
```
— never reads `item.achievements` or `item.technologies`.

- **3 templates import the shared helper**,
  `src/components/templates/directEditExperienceEntry.jsx:33`:
  ClassicProfessional, Editorial, Portrait.
- **14 templates have their own local copy** of the exact same
  `item.description`-only pattern:
  - `CreativeShowcase.jsx:55`
  - `ColorfulCompactShowcase.jsx:65`
  - `NavyProfessionalShowcase.jsx:57`
  - `CompactShowcase.jsx:72`
  - `ExecutiveShowcase.jsx:97`
  - `DeveloperShowcase.jsx:58`
  - `PortfolioShowcase.jsx:82`
  - `GraduateShowcase.jsx:58`
  - `ModernShowcase.jsx:82`
  - `ModernOrangeShowcase.jsx:175`
  - `QuadrantShowcase.jsx:61`
  - `TechExecShowcase.jsx:61`
  - `TimelineShowcase.jsx:99`
  - `EuropeanShowcase.jsx:76`

3 + 14 = 17 of the app's 18 templates (every one except Minimal, which has
no bespoke Showcase at all).

Meanwhile the shared flat renderer (`src/components/CVPreview.jsx`'s
`renderExtras()`, lines 806-825) *does* render both fields correctly (an
achievements `<ul>` and a technologies tag row) — which is why Minimal
(always flat-rendered) is clean, and why the 14 templates that bypass to
the flat renderer in ATS mode (`CVPreview.jsx`'s `variant === '…' &&
!atsFriendlyMode` delegations) show the content correctly **only in ATS
mode**, not in their own bespoke normal-mode view. `achievements`/
`technologies` are real, user-facing fields (`CVForm.jsx:793` and `:805`
wire separate list-editor controls for them, distinct from the
`description` textarea at `:782`; `createEmptyExperience()` in
`cvForm.js:16-27` and `CvExperienceItem` in `types/cv.d.ts:3-14` both
declare them), and `cvSnapshot.js:97-102` normalizes them into every
Showcase's `snapshot.experience` — the data reaches every renderer; every
renderer except the flat one ignores it. This explains the PDFs the
controller flagged (executive/navyProfessional/modernOrange showing ~1
line per job despite 2–3 achievements in the source data): the PDF is a
clone of the normal-mode preview, which has this bug for every one of
those three (and 14 others). No allowlist entries — the layout harness
checks layout, not content completeness, so nothing in Tasks 2–3 could
have caught this; it surfaced from this audit's content-coverage pass, per
the task-5 ruling. Group: **G8a** (fix-round-1 correction — was G9).

G8a total: **1 fix item, 0 allowlist entries, 17 templates** (all but
minimal). Two new `length` allowlist entries were added as a direct,
deliberate input of this fix — rendering more content lengthens a CV —
and are carried into G8's table below (`executive`/`finance-director`,
`classicProfessional`/`finance-director`, reason: "G8a lengthened the CV
— fixed in Task 8 (G8 density)").

**Fix-round-1 addition: F10 (below, filed under G9) was fixed early, as
part of G8a, not deferred to Task 9.** G8a's content-coverage test
exposed a *different* example CV (`portrait`/`chef`) hitting the exact
same glued-separator defect F10 describes, because rendering the new
technologies line shifted the page's content height and, with it, which
example's language row happened to wrap at the separator. Per this task's
own constraint ("fix new mid-word/clipping/overflow violations here, not
allowlist them"), the actual defect — `.portrait-showcase__language-sep`
rendering with no real whitespace character, compounded by `display:
inline-block` making the audit treat it as its own text container and
drop it (and any space inside it) from the surrounding `<p>` entirely —
was fixed directly: the separator's text content is now `" · "` (real
spaces) and `display: inline-block` was removed. All three Portrait
examples (`brand-specialist`, `chef`, `architect`) now pass the
`mid-word-break` check in normal mode; the two baseline allowlist entries
for `brand-specialist`/`architect` were removed as stale. F10's own G9
entry below is retained for the record, but its fix already shipped in
1.4.8 — Task 9 should skip it.

### G8 — density (length)

**F13 — Portfolio Hybrid's example CVs run past the 2.0-page cap.**
`portfolio/frontend-developer` (2.26 pages), `portfolio/ux-designer` (2.15),
`portfolio/product-manager` (2.25) — all three of Portfolio's example CVs,
not an edge case. Portfolio is on `roomy` density (§2) with a project-card
layout (cards + tech-badge rows) that costs more vertical space per section
than the flat list/card layouts most other templates use for the same
content; `template-audit-a2.md` scored Portfolio's density axis 2
("solid") before this measurement existed. Root cause is structural
(roomy spacing × card chrome × badge rows, multiplied across 3+ projects
and 3+ experience entries in the example data) rather than one fixable
element — Task 8 needs to either tighten Portfolio's card chrome/spacing
within the `roomy` ramp (not invent an ad-hoc size per §2) or move it to
`standard`. Template: portfolio. Clears 3 entries. Group: **G8**.

**Fix-round-1 addition: two more `length` entries, carried in from G8a.**
Rendering `achievements`/`technologies` (F14's fix, task 8a, 1.4.8) added
real content to every experience entry, which pushed two more example CVs
past the 2.0-page floor:
- `executive` / `finance-director` — 2.34 A4 pages.
- `classicProfessional` / `finance-director` — 2.03 A4 pages.

Same root cause class as F13 (density, not a markup bug) — carried into
this group as direct inputs rather than filed as a new F#, since G8a's own
task explicitly flagged them as "fixed in Task 8 (G8 density)" at the
moment they were added. Templates: executive, classicProfessional. Clears
2 entries.

G8 total: **1 fix item, 5 allowlist entries, 3 templates** (portfolio,
executive, classicProfessional).

**F13 — fixed (1.4.9), along with the fix-round-1 `executive`/
`classicProfessional` additions above.** Re-measured before fixing (8a had
lengthened every example further than the numbers quoted above, since this
group was written before 8a landed):
`portfolio/frontend-developer` 2.54, `portfolio/ux-designer` 2.45,
`portfolio/product-manager` 2.60, `executive/finance-director` 2.34,
`classicProfessional/finance-director` 2.03 A4 pages.

Per-section `offsetHeight` on `.scaled-preview__page [data-export-section]`
(the harness's own root) at each template's worst example, before any fix:

| Template / example | Dominant section(s) | Density before |
|---|---|---|
| portfolio / product-manager (2865px, 2.60 pages) | projects 434, experience 677, caseStudies 573, skills 355 | `roomy` |
| executive / finance-director (2576px, 2.34 pages) | experience 1624 (63% of total) | `standard` (already reclassified from the doc's `roomy` starting assignment in the 1.2.11 rework, for an unrelated name-floor reason) |
| classicProfessional / finance-director (2239px, 2.03 pages) | experience 1335 (60%) | `roomy` |

Fix chosen per template, smallest-first:

- **classicProfessional** — only 1.5% over. A density step would have
  overshot badly and moved every other Classic Professional example for a
  rounding error. Fix: a single ~10% trim of this file's own margin-top/
  gap/padding vertical-rhythm values (header padding, section-gap margins,
  entry/list gaps) — no font-size or line-height change.
  `finance-director` → 1.96 pages.
- **portfolio** — 20–23% over on all three examples; not reachable by
  rhythm trimming alone within `roomy` (tried first: `roomy`→`standard`
  alone only bought ~5%, since the template is dominated by wrapped body
  text, not whitespace). Moved one more step, `standard`→`compact` (the
  class design-system §2 names as exactly the one a "fit two pages" fix
  switches into), updated the handful of body/meta line-heights this file
  sets directly from `standard`'s 1.55/1.40 to `compact`'s 1.45/1.35 (§2:
  only `name` carries a line-height token — the rest are normative per
  role/class and this file had still been carrying `roomy`'s numbers mid-
  fix; fix-round-1 found 5 more rows still on `standard`'s/`roomy`'s
  line-height — `__role` (title, 1.35→1.30), `__section-title`/
  `__project-name`/`__role-title` (entry-title, 1.3→1.25), and
  `__testimonial-quote` (body, 1.5→1.45) — all now `compact`-correct),
  then one clean ~25% trim of the remaining margin-top/gap/padding.
  `frontend-developer` → 1.97, `ux-designer` → 1.90, `product-manager` →
  1.98 pages (re-measured after the fix-round-1 line-height corrections,
  which trimmed these slightly further than the numbers first reported).
- **executive** — 14.5% over, already on `standard` (not `roomy` — see
  table above). A vertical-rhythm trim alone plateaued around 2.12–2.20
  pages even after three compounding passes (~30% cumulative), because
  Experience's bullet text (not whitespace) is 60%+ of the page. Reverted
  that trial, then: `standard`→`compact` + the same body/meta line-height
  correction as Portfolio, plus one clean ~15% rhythm trim. (Executive's
  title/entry-title rows set no explicit line-height of their own — they
  inherit the default — so there was nothing to correct there in
  fix-round-1.)
  `finance-director` → 1.99 pages.

**Re-ran the full example tier for all three templates** (a density change
moves every example, not just the one that failed): all pass, including
the ATS variant and the stress tier (`stress:long-single-word`,
`stress:ten-jobs`, `stress:sparse`) for each. No other example newly
tripped `name-lines`, `clipped-text`, `mid-word-break`, or `beyond-page` —
confirmed with the full `template-layout.spec.js`/`template-content.spec.js`
run (305/305 passing after the fix).

PDF export page counts updated in `EXPECTED_PDF_PAGES`
(`e2e/template-pdf.spec.js`): `executive` 3→2, `portfolio` 3→2 — both a
direct, intended consequence of the density fix, not a regression.
`classicProfessional` stayed at 2 (the fix only pulled it back under the
on-screen page-count budget, not across a PDF page boundary).

All 5 `length` allowlist entries removed from
`e2e/fixtures/layoutAllowlist.js`; 4 entries remain (G9's stress-tier
items — out of this task's scope).

**On the rhythm-trim numbers themselves (fix-round-1 ruling):** none of
the three templates' margin-top/gap/padding values land on the app's
`--space-*` grid (`src/styles/tokens.css`'s 0.25rem-step scale) — they
were converged on iteratively, one small percentage trim at a time against
each template's worst example's measured page height, stopping once it
cleared the 2.0-page budget with a small safety margin, not read off that
or any other fixed scale. This matches how these three templates' rhythm
values already looked before this task (e.g. Portfolio's pre-fix
`0.375rem`/`1.125rem` gaps, Executive's pre-fix `1.1rem` gaps) — none of
the bespoke Showcase CSS files use `--space-*`; §2 only normalizes the six
type-ramp roles, not spacing. Final representative values, post-fix:

| Template | Header padding | Main content padding | Section-separator margin-top | Entry/bullet gap |
|---|---|---|---|---|
| classicProfessional | `2.7rem 3rem 1.35rem` | `1.55rem 3rem 2.7rem` | `1.55rem` | `0.55rem 1.35rem` (contact row), `0.45rem` (chip row) |
| portfolio | `1.85rem 2.75rem 1.1rem` | `1.35rem 2.75rem 2.05rem` (main), `1.35rem 1.75rem 2.05rem 1.5rem` (sidebar) | `1.5rem` | `0.3rem`–`0.35rem` (chip/badge/bullet rows) |
| executive | n/a (no separate header block — identity rail padding `2.2rem 1rem`) | `2.2rem 2.5rem 2.2rem 2.25rem` (main column) | `1.75rem` (section separator) | `0.35rem` (bullets), `1.05rem` padding-bottom per entry |

(Full values are in each file's diff — `src/styles/templates/
classicProfessional.css`, `portfolio.css`, `executive.css` — these are the
header/body-level numbers that most directly drive page count.)

### G9 — everything else

**F9 — fixed (1.4.10).** Minimal's flat-renderer link row lets a whole short word fragment,
via a blanket CSS override.
`src/styles/app-shell.css:3046-3052`:
```css
.preview-document h3, .preview-document h4, .preview-document p, .preview-document span {
  overflow-wrap: break-word;
  word-break: break-word;
  min-width: 0;
}
```
This applies `word-break: break-word` + `min-width: 0` to **every** `span`
inside the flat-rendered preview — not just long unbreakable tokens — so
when the builder's narrower preview column flex-shrinks the link-label span
(`src/components/CVPreview.jsx:1195`, `<span className="text-xs …">` /
`<span className="text-gray-600">`, rendered by `minimal.js`'s
`linksLayout: 'minimal-inline'`) below its own content width, the label
itself ("LinkedIn", "Portfolio" — 8–9 plain characters, nothing long or
unbreakable) is permitted to break mid-character to fit. This is the flat
renderer's analog of the Modern Orange name-floor bug the design system §2
is named after: a permissive wrap rule with no floor on the element it's
applied to. Template: minimal. Clears 1 entry (stress mid-word-break).
Group: **G9**.

**F10 — fixed early (1.4.8, as part of G8a — see that section's note).**
Portrait's language separator is glued to the next item with no
space.
`src/components/templates/PortraitShowcase.jsx:289`:
```jsx
{index > 0 ? <span className="portrait-showcase__language-sep" aria-hidden="true">·</span> : null}
{item.language}
```
No whitespace character between the `·` and the next language's text node,
and `.portrait-showcase__language-sep` (`src/styles/templates/portrait.css:327`)
carries no margin to fake one visually either. `el.textContent` reads
`"…Native·English…"` with nothing separating "Native" from "English", so
when the row wraps, the harness (correctly) finds a 7+10-character run
split across two lines and reports it as a broken word — content-wise this
is the exact §7 failure mode (a glued token), the walker didn't
mis-detect anything. Controller finding 5. Template: portrait (example
tier). Clears 2 entries. Group: **G9**.

**F11 — fixed (1.4.10).** Graduate's sidebar section heading overflows the card's right edge,
on every stress fixture, regardless of content.
`.graduate-showcase__section-title` (`src/styles/templates/graduate.css:185`)
has no `min-width: 0` or width constraint inside its flex row
`.graduate-showcase__section-head` (`graduate.css:160`), which sits in the
sidebar track of `.graduate-showcase__body`'s
`grid-template-columns: minmax(0, 1.86fr) minmax(0, 1fr)`
(`graduate.css:141`). A long, tracked (`letter-spacing: 0.16em`), uppercase
label — "Extracurricular Activities" (the `memberships` section's label,
`GraduateShowcase.jsx:219`) — doesn't fit the ~1fr sidebar column next to
its icon badge, and because `.graduate-showcase__body` sets no
`overflow: hidden` anywhere, nothing clips it: it visibly protrudes past
the card's right edge. This fires on **all three** stress fixtures
(`long-single-word`, `ten-jobs`, `sparse`) because all three include a
`memberships` entry and the heading's own label text is the only input
that matters — confirms the controller's "structural, content-independent"
read. Template: graduate. Clears 3 entries. Group: **G9**.

**F12 — fixed (1.4.10).** Placeholder "… will appear here" text reaches the exported PDF for
every template (controller finding 1).
Confirmed by Task 4's investigation: `createExportSandbox()`
(`src/utils/exporters.js:~715-723`) calls `resolveExportRoot(previewElement)`
then `exportRoot.cloneNode(true)` — a verbatim deep clone of whatever
`previewElement` (i.e. `previewRef.current`) currently contains, with no
DOM filtering before or after.

**Fix-round-1 addition: verified the export source in both builder modes,
not just Classic's.** `previewRef` does **not** point at the same kind of
node in both modes:

- **Classic mode** — `src/pages/ResumeBuilderPage.jsx:~1921`: there is one
  `<CVPreview formData={formData} previewRef={previewRef} … />` and it is
  both the visible live preview *and* the export source.
- **Direct Edit mode** — `src/components/DirectEditPreview.jsx:53-61`:
  there are **two** `<CVPreview>` instances. The visible, editable one
  (`directEditDispatch={dispatchFormData}`) is what the user interacts
  with and **does not** carry `previewRef`. A second, inert, off-screen
  copy — `<div className="direct-edit-export-source" … inert><CVPreview
  {...previewProps} directEditDispatch={null} previewRef={previewRef}
  /></div>` — is rendered purely as "the same CV read-only … exactly as
  Classic mode would" (the file's own comment, lines 53-58), and
  `previewRef` points at *that* copy, not the editable one.

Both of these — Classic's single CVPreview and Direct Edit's dedicated
inert export-source CVPreview — receive `formData` as a plain prop and
render it with the live placeholder text (same `CVPreview.jsx` code path
either way), so **neither mode has anything upstream of `previewRef.current`
that already filters empty sections.** `hideEmptySections()`
(`src/utils/sectionContent.js`) would solve it, but its own header comment
says it is wired **only** into `TemplateDetailPage.jsx` and explicitly
"never imported by `ResumeBuilderPage.jsx`" (which also covers
`DirectEditPreview.jsx`, a child it renders).

**The single place that covers both modes is still `createExportSandbox()`
in `exporters.js` — confirmed, not just assumed.** Because `previewRef`
resolves to a *different* CVPreview instance depending on mode, a fix
applied at the `formData`-prop level would need two separate call sites
(one in `ResumeBuilderPage.jsx`, one in `DirectEditPreview.jsx`) and would
risk also changing Direct Edit's *editable* preview if wired to the wrong
instance. `exportCvAsPdf(previewRef.current, …)` (`ResumeBuilderPage.jsx`,
call site at line ~860), by contrast, is the **one call site both modes
already funnel through**, regardless of which CVPreview `previewRef`
happens to point at — so the fix belongs inside `createExportSandbox()`,
operating on the resolved `clone` DOM node itself (immediately after
`const clone = exportRoot.cloneNode(true)`, `exporters.js:723`, before the
clone is styled/appended): walk the clone's `[data-export-section]` nodes
(every section wrapper already carries this attribute per §8) and
remove/hide any whose corresponding `formData` section has no real
content, using the same visibility predicate `hasSectionContent()` already
implements in `sectionContent.js`. This never touches Direct Edit's
editable preview (which isn't in the clone's ancestry) and never touches
Classic's live preview either, since it only prunes the detached clone
`html2canvas` captures — not `exportRoot` itself. Affects every template.
No allowlist entries (the stress-tier harness explicitly skips the
`placeholder` rule — see `e2e/template-layout.spec.js`'s comment — so this
was never caught by Phase 2's own harness, only by Task 4's separate
investigation). Group: **G9**.

**Task 9 fix:** `pruneEmptySectionsFromClone(clone, formData)`
(`src/utils/exporters.js`), called from `createExportSandbox()` immediately
after `const clone = exportRoot.cloneNode(true)` exactly as this finding
proposed — walks every `clone.querySelectorAll('[data-export-section]')`
node and removes any whose section key fails `hasSectionContent(formData,
sectionKey)` (`src/utils/sectionContent.js`). `createExportSandbox()`
gained a fourth `formData` parameter, threaded from `exportCvAsPdf`'s
`options.formData` — already passed at the one call site
(`ResumeBuilderPage.jsx`'s `exportCvAsPdf(previewRef.current, …, {
formData, … })`) for the existing text-fallback path, so no new plumbing
was needed there. Verified this is the single fix point needed: the HTML
export (`exportCvAsHtml`, same file) was independently checked and never
had this bug — it builds its markup directly from `formData`'s snapshot
arrays (`snapshot.skills.length > 0 && isVisible('skills') && …`), never
clones the live DOM, so an empty section was already omitted outright.
New test: `e2e/template-pdf-placeholder.spec.js` — loads the `sparse`
stress fixture into the builder and asserts the export sandbox's clone DOM
(the exact node `html2canvas` rasterizes, captured via polling for
`.pdf-export-page` in the live DOM) never contains "will appear here" /
"näkyvät tässä", for minimal/modern/graduate × Classic/Direct Edit (6
cases). Confirmed RED by temporarily disabling the prune call — the clone
carried the placeholder text — then GREEN once restored.

G9 total: **4 fix items (F9, F10, F11, F12), 6 allowlist entries, 18
templates** (F12 is app-wide; F9/F10/F11 are template-specific — see table
below for the full template list per item). (Fix-round-1 correction: the
first pass of this doc miscounted this as "6 fix items" by listing F9–F11
twice and including F14, which fix round 1 moved to its own task, G8a,
above.) This "6 allowlist entries" is this group's **original Phase 2
baseline count** (F9 1, F10 2, F11 3), not a running total of G9's current
state — all 6 are cleared as of Task 9 (1.4.10); see §4 "Accepted
exceptions" below for the one additional, later complication (Task 9's
own controller item C, resolved without needing any new allowlist entry
either) and the final, current `LAYOUT_ALLOWLIST` state.

| F# | one-line cause | templates | allowlist entries |
|---|---|---|---|
| F9 | blanket `word-break` on every flat-rendered span | minimal | 1 |
| F10 | unspaced `·` separator glued to next language | portrait | 2 |
| F11 | unfloored sidebar heading overflows the card edge | graduate | 3 |
| F12 | export clone keeps "will appear here" placeholder text | all 18 | 0 |

---

## 3. Content-coverage table (controller finding 2)

Per template × field, whether the Experience section's per-entry
`description`, `achievements`, and `technologies` render, in normal mode
and in ATS mode. "Flat" = this view falls through to `CVPreview.jsx`'s
shared renderer (`renderExtras()`), which is correct for all three fields.
"Own" = the template's own bespoke Showcase renders this view (only
`description`, via `splitToBullets`, per F14).

| Template | description (normal) | achievements (normal) | technologies (normal) | ATS mode uses | achievements/technologies (ATS) |
|---|:-:|:-:|:-:|---|:-:|
| minimal | yes | yes | yes | flat (always) | yes |
| developer | yes | **no** | **no** | flat (bypass) | yes |
| creative | yes | **no** | **no** | flat (bypass) | yes |
| modern | yes | **no** | **no** | flat (bypass) | yes |
| executive | yes | **no** | **no** | flat (bypass) | yes |
| timeline | yes | **no** | **no** | own Showcase | **no** |
| graduate | yes | **no** | **no** | flat (bypass) | yes |
| compact | yes | **no** | **no** | flat (bypass) | yes |
| portfolio | yes | **no** | **no** | flat (bypass) | yes |
| techExec | yes | **no** | **no** | flat (bypass) | yes |
| classicProfessional | yes | **no** | **no** | flat (bypass) | yes |
| navyProfessional | yes | **no** | **no** | own Showcase | **no** |
| modernOrange | yes | **no** | **no** | own Showcase | **no** |
| colorfulCompact | yes | **no** | **no** | flat (bypass) | yes |
| quadrant | yes | **no** | **no** | flat (bypass) | yes |
| editorial | yes | **no** | **no** | flat (bypass) | yes |
| portrait | yes | **no** | **no** | flat (bypass) | yes |
| european | yes | **no** | **no** | flat (bypass) | yes |

**Verdict: this is a bug, not a deliberate condensed form.** No template's
design rationale (per `template-design-system.md` or the template's own
file comments) says "experience bullets are summarized into the
description field only" — `achievements`/`technologies` are first-class
`CvExperienceItem` fields with their own form controls specifically because
a free-text `description` and a bullet-list `achievements` serve different
purposes (narrative vs. scannable impact bullets). Dropping the latter
silently loses real user content per §7.7's standard ("losing content … is
a bug, not a simplification") — the fact that the loss happens in normal
mode rather than ATS mode doesn't change the verdict, it just means the
rubric axis it shows up on is Export fidelity / Content edge-cases rather
than ATS-fallback parity for 14 of the 17. For timeline, navyProfessional
and modernOrange, the loss *is* consistent between normal and ATS mode
(both wrong the same way), so — unusually — their ATS parity axis is not
the one that catches it; their Export fidelity and Content edge-cases axes
are. Filed as **F14** above, group **G8a** (its own fix task — see the
task-order note at the top of this doc).

---

## 4. Re-scored §9 rubric

Same 7 axes and 0–3 scale as `template-audit-a2.md`. "Before" reflects this
audit's evidence (supersedes `template-audit-a2.md`'s provisional
export/content-edge-case scores, which that session flagged as pending
exactly this kind of live/PDF evidence). "After" is left for Task 10, once
fixes land.

T = typography · C = colour · S = structural · D = density · E = content
edge-cases · A = ATS parity · X = export fidelity

| Template | T | C | S | D | E (before) | A (before) | X (before) | Verdict | Driving axis |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|---|
| Minimal | 2 | 3 | 2 | 2 | 2 | 3 | 2 | keep | — only template passing content-coverage cleanly (F14 doesn't apply — it's always flat-rendered, so normal and ATS mode are literally the same code path, no asymmetry possible); A restored to A.2's 3 (fix-round-1 correction — the first pass of this doc dropped it to 2 with no stated reason); still the flat-renderer `--tpl-*` gap from A.2 |
| Developer | 2 | 2 | 2 | 2 | **1** | **1** | **0** | rework | X=0 — F14 (no achievements/tech in normal mode); E=1 — F1 clipped links on 3/3 example CVs; A=1 — ATS now shows *more* content than normal (parity break, just inverted) |
| Creative | 2 | 2 | 2 | 2 | **1** | **1** | **0** | rework | X=0 — F14; E=1 — F2 clipped links (2/2 example CVs) + F5/F6 name-wrap on stress |
| Modern | 3 | 3 | 2 | 2 | **1** | **1** | **0** | rework | X=0 — F14; E=1 — F1 clipped links (3/3 example CVs) |
| Executive | 2 | 2 | 2 | 2 | **1** | **1** | **0** | rework | X=0 — F14; E=1 — F1 clipped links (3/3 example CVs) + F6 mid-word name break |
| Timeline | 2 | 3 | 3 | 2 | **1** | 2 | **0** | rework | X=0 — F14 (both modes equally wrong, so A stays 2); E=1 — F5 name-wrap on stress |
| Graduate | 2 | 2 | **1** | 2 | **0** | **1** | **0** | rework | X=0 — F14; S=1 — F11 structural heading overflow on every stress fixture; E=0 — F11 is content-independent (fires on realistic CVs, not just the synthetic name) |
| Compact | 2 | 2 | 2 | **1** | 2 | **1** | **0** | rework | X=0 — F14; D=1 carried from A.2 (ad-hoc, not on the `compact` class) |
| Portfolio | 2 | 3 | 2 | **1** | **1** | **1** | **0** | rework | X=0 — F14; D=1 — F13, all 3 example CVs exceed the 2.0-page cap; E=1 — F1 clipped links (3/3 example CVs) |
| TechExec | 2 | 2 | 2 | 2 | **1** | **1** | **0** | rework | X=0 — F14; E=1 — F1 clipped links (2/2 example CVs) |
| ClassicProfessional | 3 | 3 | 2 | 2 | **1** | **1** | **0** | rework | X=0 — F14; E=1 — F5 name-wrap on stress |
| NavyProfessional | 2 | 2 | 2 | 2 | **0** | 2 | **0** | rework | X=0 — F14 (A stays 2, same reasoning as Timeline); E=0 — F7, a **real example CV** (`cto`) wraps the name to 4 lines, a documented unresolved §2 gap |
| ModernOrange | 3 | 3 | 3 | 2 | **0** | 2 | **0** | rework | X=0 — F14 (A stays 2); E=0 — F4 clipped skills (2/2 example CVs) + F6/F8 name mid-word-break and gluing |
| ColorfulCompact | 2 | 2 | 2 | 2 | **1** | **1** | **0** | rework | X=0 — F14; E=1 — F2 clipped links on stress |
| Quadrant | 2 | 2 | 2 | 2 | **1** | **1** | **0** | rework | X=0 — F14; E=1 — F3 clipped links (worse variant, no ellipsis) + F5 name-wrap on stress |
| Editorial\* | 2 | 2 | 2 | 2 | **1** | **1** | **0** | rework | X=0 — F14; E=1 — F2 clipped links + F5 name-wrap on stress |
| Portrait\* | 2 | 2 | **3** | 2 | **0** | **1** | **0** | rework | X=0 — F14; S=3 — sole occupant of the `photo-rail + main` family (§5), structure that serves a real use case; E=0 — F10 glued language separator is an **example-tier** failure (real CVs, not stress) + F2/F5 on stress |
| European\* | 2 | 2 | **3** | **3** | **1** | **1** | **0** | rework | X=0 — F14; S=3 — sole occupant of `label-grid` (§5), a genuinely different reading pattern; D=3 — its own-density-switching (`tpl-density-standard`→`compact`) one-page mechanism is fully realized, per §5's note; E=1 — F1 clipped links on stress |

**Everything except Minimal is "rework" once F14 (the universal
achievements/technologies drop) is scored on Export fidelity, where its own
0-anchor ("content missing/invisible in an exported PDF") is a literal,
exact match** — this is not rubric-gaming; `template-audit-a2.md`'s X
column was explicitly "provisional (2)" pending exactly this check, which
that session's resize-window tooling couldn't do and this one could by
reading the renderer code directly.

For the 15 templates `template-audit-a2.md` (2026-09-09) already scored,
the T/C/D columns are carried forward unchanged since this audit found no
new evidence against them — only S (Graduate), E, A and X changed.
**\*Editorial, Portrait and European are not in `template-audit-a2.md` at
all** (that doc predates all three — Editorial and Portrait shipped
v1.2.20–21, European v1.2.22, after that 2026-09-09 session). Fix-round-1
correction: the first pass of this doc's table implicitly presented their
T/C/S/D as carried forward too, which was never true because there was
nothing to carry forward. Their T/C/S/D cells above are scored fresh from
this audit's own evidence: all three read their six type-ramp roles from
`--tpl-*` with a declared `tpl-density-*` class (T=2) —
`src/styles/templates/editorial.css:19-20` (`roomy`),
`portrait.css:25-26` (`standard`), `european.css:22-23`
(`standard`↔`compact`, switching); all three run exactly one ink set + one
`--tpl-accent` hex with no second decorative hue in their own CV-content
CSS (C=2) — editorial `#9f1239`, portrait `#0f766e`, european `#1d4ed8`
(european's `#b91c1c`/`#fecaca`/`#fef2f2` triplet at
`european.css:309-311` is an editor-only one-page overflow *warning*
banner, not CV content, so it doesn't count against §3); structural
family placement per §5's table — editorial is `numbered` heading +
`single-column-flow` (shares the family with 3 others, S=2); portrait and
european are each the **sole occupant** of their family
(`photo-rail + main`, `label-grid` respectively — §5 explicitly says both
are genuinely distinct reading patterns, not repaints), matching the
rubric's S=3 anchor ("sole occupant of one, with structure that serves a
real use case"); density spacing matches each one's declared class (D=2
for editorial/portrait), and european's dynamic `standard`→`compact`
one-page mechanism (reusing Compact's measure-and-step technique per §5's
note) is fully realized, matching D=3's anchor.

**After-fix column:** left for Task 10, once G6, G7, G8a, G8 and G9 fixes
land and F14 in particular is resolved (which should move every
template's X back toward 2–3 and several E scores back toward 2).

---

## 5. Out-of-scope follow-ups (redesign-level, not fixed here)

1. ~~The `stress:long-single-word` 2-line threshold~~ — **resolved, not
   out-of-scope.** Fix round 1 moved this into G7/F5 above: the controller
   ruled the fixture's name is harsher than §7.1 intends and Task 7 will
   change it and re-baseline, rather than this being an open question for
   the harness owner.
2. **Navy Professional's 180px identity rail (F7) is a layout decision, not
   a bug fix.** Widening it to the 210px floor changes the rail's visual
   proportion against the rest of the dark sidebar — a redesign call for
   whoever owns that template's look, not a one-line CSS change. Flagged
   here per F7; Task 7 should decide between widening the rail or further
   shrinking the identity type inside it.
3. **Portfolio's density (F13) may need more than spacing tightening.**
   All three of Portfolio's own example CVs run long on `roomy` — pushing
   it to `standard` is a valid Task 8 option per the ruling, but changing a
   template's declared density class is itself a design call (§2's
   "starting density assignment" table), not just a CSS edit under the
   existing class. Flagging the choice rather than making it here.
4. **Quadrant's grid family (2×2 cells) may structurally fight long
   content regardless of the link-truncation fix (F3).** `template-audit-
   a2.md` already noted "dead space top-right quadrant, uneven fill" as a
   pre-existing structural note; this audit's F3/F5 findings are
   consistent with that same cramped-cell problem rather than new evidence
   of a different issue. Not re-litigated here.
5. **The flat renderer's blanket `word-break: break-word` rule (F9's root
   cause, `app-shell.css:3046-3052`) applies app-wide, to every `h3`/`h4`/
   `p`/`span` under `.preview-document` — not just Minimal's link row.**
   F9 only files the one violation the harness actually caught (Minimal's
   stress case), but the same permissive rule is live for every template's
   ATS-mode render too (ATS mode uses `.preview-document`). It didn't
   surface elsewhere in Phase 2's matrix, but a future stress fixture or a
   real CV with an unusually narrow ATS column could trip it anywhere the
   flat renderer runs. Worth a floor-based fix (per the §2 Modern-Orange
   lesson: a floor on the shrinking element, not just permission to break)
   rather than a Minimal-only patch — flagging the scope for Task 9 to
   decide, not fixing the global rule here.

---

## 6. Allowlist entry → fix item index

For Tasks 6–9's bookkeeping: every one of the 54 `LAYOUT_ALLOWLIST` entries,
by file order, mapped to the `F#` that clears it.

| # | template | subject | rule | F# |
|--:|---|---|---|:-:|
| 1 | developer | frontend-developer | clipped-text | F1 |
| 2 | developer | data-engineer | clipped-text | F1 |
| 3 | developer | junior-developer | clipped-text | F1 |
| 4 | creative | graphic-designer | clipped-text | F2 |
| 5 | creative | ux-designer | clipped-text | F2 |
| 6 | modern | marketing-manager | clipped-text | F1 |
| 7 | modern | project-manager | clipped-text | F1 |
| 8 | modern | product-manager | clipped-text | F1 |
| 9 | executive | finance-director | clipped-text | F1 |
| 10 | executive | operations-manager | clipped-text | F1 |
| 11 | executive | engineering-director | clipped-text | F1 |
| 12 | portfolio | frontend-developer | clipped-text | F1 |
| 13 | portfolio | frontend-developer | length | F13 |
| 14 | portfolio | ux-designer | clipped-text | F1 |
| 15 | portfolio | ux-designer | length | F13 |
| 16 | portfolio | product-manager | clipped-text | F1 |
| 17 | portfolio | product-manager | length | F13 |
| 18 | techExec | engineering-director | clipped-text | F1 |
| 19 | techExec | cto | clipped-text | F1 |
| 20 | navyProfessional | cto | name-lines | F7 |
| 21 | modernOrange | ux-designer | clipped-text | F4 |
| 22 | modernOrange | customer-success | clipped-text | F4 |
| 23 | portrait | brand-specialist | mid-word-break | F10 |
| 24 | portrait | architect | mid-word-break | F10 |
| 25 | minimal | stress:long-single-word | name-lines | F5 |
| 26 | minimal | stress:long-single-word | mid-word-break | F9 |
| 27 | developer | stress:long-single-word | clipped-text | F1 |
| 28 | creative | stress:long-single-word | clipped-text | F2 |
| 29 | creative | stress:long-single-word | name-lines | F5 |
| 30 | modern | stress:long-single-word | clipped-text | F1 |
| 31 | executive | stress:long-single-word | clipped-text | F1 |
| 32 | executive | stress:long-single-word | name-lines | F5 |
| 33 | executive | stress:long-single-word | mid-word-break | F6 |
| 34 | timeline | stress:long-single-word | name-lines | F5 |
| 35 | graduate | stress:long-single-word | clipped-text | F1 |
| 36 | graduate | stress:long-single-word | beyond-page | F11 |
| 37 | graduate | stress:long-single-word | name-lines | F5 |
| 38 | graduate | stress:ten-jobs | beyond-page | F11 |
| 39 | graduate | stress:sparse | beyond-page | F11 |
| 40 | portfolio | stress:long-single-word | clipped-text | F1 |
| 41 | techExec | stress:long-single-word | clipped-text | F1 |
| 42 | classicProfessional | stress:long-single-word | name-lines | F5 |
| 43 | navyProfessional | stress:long-single-word | name-lines | F7 |
| 44 | modernOrange | stress:long-single-word | clipped-text | F4 |
| 45 | modernOrange | stress:long-single-word | name-lines | F8 |
| 46 | modernOrange | stress:long-single-word | mid-word-break | F6 |
| 47 | colorfulCompact | stress:long-single-word | clipped-text | F2 |
| 48 | quadrant | stress:long-single-word | clipped-text | F3 |
| 49 | quadrant | stress:long-single-word | name-lines | F5 |
| 50 | editorial | stress:long-single-word | clipped-text | F2 |
| 51 | editorial | stress:long-single-word | name-lines | F5 |
| 52 | portrait | stress:long-single-word | clipped-text | F2 |
| 53 | portrait | stress:long-single-word | name-lines | F5 |
| 54 | european | stress:long-single-word | clipped-text | F1 |

**Totals: G6 = 31 entries (F1 21, F2 6, F3 1, F4 3) · G7 = 14 entries (F5 9,
F6 2, F7 2, F8 1) · G8a = 0 entries (F14 — its own task, no allowlist
coverage) · G8 = 3 entries (F13 3) · G9 = 6 entries (F9 1, F10 2, F11 3) +
1 non-allowlist item (F12). 31 + 14 + 0 + 3 + 6 = 54.** This is the
**original Phase 2 baseline** (the 54 entries this doc's "Method &
evidence" section cites as the starting point) — every one of these 54
is cleared as of Task 9 (1.4.10). It does not include the 7 entries Task
9 fix round 1 briefly added and fix round 2 then removed again (§4
"Accepted exceptions" has the full story) — those were never part of this
baseline. Current `LAYOUT_ALLOWLIST`: `[]`.

---

## 4. Accepted exceptions

None. `LAYOUT_ALLOWLIST` (`e2e/fixtures/layoutAllowlist.js`) is `[]` as of
1.4.10. All findings above (F1–F14) are fixed; see "Task 9 fix round 2"
below for how the one group of entries this doc previously carried here
was resolved away rather than accepted.

### Task 9 fix round 1→2: the 44-char skill-chip token

Task 9's controller item C added a deliberately adversarial stress case —
`e2e/fixtures/stressCvs.js`'s `long-single-word` fixture skills array
gained `'Kubernetesoperatorreconciliationloopsdesign'`, a 44-character
single token with no spaces — so every one of the 18 templates'
skill-chip rendering gets checked against an unbreakable token, not just
Modern Orange's dot-rating row it was first found on (§6, G7 fix round 1).

**Fix round 1** found seven templates (modern, creative, executive,
graduate, portfolio, colorfulCompact, quadrant) whose skill-chip column
sits flush against the card's own right edge with no outer margin, where
the token (~250–280px unbroken) is 2–3x the column's own width
(~106–136px) — and gave each chip class `overflow-wrap: anywhere` plus a
"this is unavoidable" allowlist entry, reasoning that the only choice was
break-it-to-fit or run-it-off-the-page.

**Fix round 2 found that reasoning incomplete in two ways**, both per
controller ruling, and resolved all seven without any allowlist entry:

1. `overflow-wrap: anywhere` lowers the element's min-content size the
   same way `.tpl-value-breakable` does — it doesn't just fix the one
   44-char token, it also re-opens the door to fracturing an *ordinary*
   skill word if a crowded row ever squeezes its flex item narrower than
   the word's own natural width (the exact Task 7/G7 defect this doc's §6
   primitives exist to prevent, now reintroduced one level down, on the
   chip itself). Replaced with a new primitive,
   `.tpl-chip-wrappable` (`overflow-wrap: break-word` + `max-width: 100%`,
   `src/styles/templates/_system.css`): `break-word` doesn't lower
   min-content, so an ordinary crowded chip wraps to the next line intact;
   `max-width: 100%` still clamps the *automatic minimum* down to the
   row's own width for a token that's wider than the whole row, so that
   one case still breaks rather than running off the page. Applied to all
   seven templates' chip classes in place of `overflow-wrap: anywhere`.
2. The layout harness's `mid-word-break` rule didn't distinguish "this
   word is being fractured because something squeezed it narrower than
   its own content" (an avoidable defect) from "this word genuinely
   cannot fit anywhere in this column, full stop" (not fixable by any
   CSS, not a defect) — it flagged both the same way, which is why fix
   round 1 reached for an allowlist entry instead of a real fix.
   `e2e/helpers/layoutAudit.js` now measures each broken word's natural
   (unbroken) width against the content width of the widest line it could
   ever occupy — its nearest flex/grid row ancestor, not its own
   (possibly squeezed) flex item — and only flags the break when the word
   would have fit. The 44-char token still breaks inside these seven
   templates' chips (it's still too wide for the column even with the
   fix), but the harness no longer reports it, since that's accepted by
   construction rather than needing a recorded exception.

Both are verified with RED/GREEN fixtures in `e2e/layout-audit-helper.spec.js`
(the `mid-word-break: exempts only genuinely-too-wide words` block) and a
real-render regression case, `e2e/fixtures/stressCvs.js`'s
`crowded-skills` fixture (several ordinary longish skills, checked across
all 18 templates for any mid-word break). Full RED/GREEN transcript in
`task-9-report.md`.
