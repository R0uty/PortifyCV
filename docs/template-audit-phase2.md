# Phase 2 template audit — layout harness findings → fix list

**Date:** 2026-10-03
**Scores against:** `docs/template-design-system.md` §9 rubric (7 axes, 0–3;
same scale and anchors as `docs/template-audit-a2.md`).
**Feeds:** fix tasks 6 (G6), 7 (G7), 8 (G8), 9 (G9). Each fix task removes
its allowlist entries from `e2e/fixtures/layoutAllowlist.js`; the harness
fails on stale entries, so this doc's `F#` → allowlist mapping is the
checklist for "done."

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
european. Clears 21 entries (14 example + 7 stress). Group: **G6**.

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

**F3 — Quadrant's `link-value` clips with no ellipsis at all.**
`src/styles/templates/quadrant.css:453` has `overflow: hidden; white-space:
nowrap` but — unlike every other `link-value`, see F1 — no
`text-overflow: ellipsis`, so the cut is silent (no "…" cue that content is
missing), a strictly worse variant of the same bug. Template: quadrant.
Clears 1 entry (stress). Group: **G6**.

**F4 — Modern Orange skill-name rows truncate long skill strings.**
`src/styles/templates/modernOrange.css:148`
(`.modern-orange-showcase__skill-name`): same `overflow:hidden;
text-overflow:ellipsis; white-space:nowrap` pattern as F1, applied to the
skill label instead of a link, inside a flex row shared with the dot-rating
(`modernOrange.css:163`). §7.6 ("one very long single skill string") names
this exact case. Template: modernOrange. Clears 3 entries (2 example + 1
stress). Group: **G6**.

G6 total: **4 fix items, 31 allowlist entries, 12 templates** (developer,
modern, executive, portfolio, techExec, european, creative, colorfulCompact,
editorial, portrait, quadrant, modernOrange).

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
discovered per-template defect — see "Out of scope" below for the
threshold question. Templates affected (name-lines only, no mid-word
fragmentation): minimal, creative, executive, timeline, graduate,
classicProfessional, quadrant, editorial, portrait. Clears 9 entries
(stress). Group: **G7**.

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
**G7**.

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
1 stress). Group: **G7**.

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
fix is the same component and the same visit).

G7 total: **4 fix items, 14 allowlist entries, 11 templates** (minimal,
creative, executive, timeline, graduate, classicProfessional, quadrant,
editorial, portrait, navyProfessional, modernOrange).

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

G8 total: **1 fix item, 3 allowlist entries, 1 template** (portfolio).

### G9 — everything else

**F9 — Minimal's flat-renderer link row lets a whole short word fragment,
via a blanket CSS override.**
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

**F10 — Portrait's language separator is glued to the next item with no
space.**
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

**F11 — Graduate's sidebar section heading overflows the card's right edge,
on every stress fixture, regardless of content.**
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

**F12 — Placeholder "… will appear here" text reaches the exported PDF for
every template (controller finding 1).**
Confirmed by Task 4's investigation (not re-verified here, taken as given):
`createExportSandbox()` (`src/utils/exporters.js:~715-723`) calls
`resolveExportRoot(previewElement)` then `exportRoot.cloneNode(true)` — a
verbatim deep clone of whatever `previewRef.current` currently contains,
with no DOM filtering before or after. `hideEmptySections()`
(`src/utils/sectionContent.js`) already solves exactly this problem, but
its own header comment says it is wired **only** into
`TemplateDetailPage.jsx` (the marketing template-gallery page) and
explicitly "never imported by `ResumeBuilderPage.jsx`" — so the builder's
live preview (and therefore every export, which clones that same preview)
keeps the visible-but-empty section's editing-affordance placeholder text.
**Proposed fix location:** inside `createExportSandbox()`, immediately
after `const clone = exportRoot.cloneNode(true)` (`exporters.js:723`) and
before the clone is styled/appended — walk the clone's
`[data-export-section]` nodes (every section wrapper already carries this
attribute per §8) and remove/hide any whose corresponding `formData`
section has no real content, using the same visibility predicate
`hasSectionContent()`/`hideEmptySections()` already implements in
`sectionContent.js` (that function operates on CV data and returns a CV
with `sectionVisibility` turned off per-section — it would need either a
DOM-level sibling that checks `formData` directly against each clone
node's `data-export-section` id, or `exportCvAsPdf()`'s caller
(`ResumeBuilderPage.jsx`, call site at line ~860) could pass the already-
computed visible-section set down into `createExportSandbox()` so it never
needs to re-derive it from the DOM). Either way, the fix is **export-time
DOM pruning of the clone**, not a change to the live builder preview (which
intentionally keeps the placeholder as an editing affordance). Affects
every template. No allowlist entries (the stress-tier harness explicitly
skips the `placeholder` rule — see `e2e/template-layout.spec.js`'s comment
— so this was never caught by Phase 2's own harness, only by Task 4's
separate investigation). Group: **G9**.

**F14 — Every bespoke Showcase drops the experience entry's `achievements`
and `technologies` fields in normal/non-ATS-bypass rendering. This is the
single largest finding in this audit — see the content-coverage table
below for the full matrix.** Root cause, one shared pattern repeated 17
times: every bespoke experience-entry renderer computes its bullet list as
```js
const bullets = item.description ? splitToBullets(item.description) : []
```
and never reads `item.achievements` or `item.technologies` at all —
confirmed identically in `src/components/templates/directEditExperienceEntry.jsx:33`
(shared by Creative, ColorfulCompact, NavyProfessional, Editorial, Compact,
ClassicProfessional, Executive, Developer, Portfolio, Portrait — 10
templates) and in each template's own local copy of the same pattern:
`GraduateShowcase.jsx:58`, `ModernShowcase.jsx:82`,
`ModernOrangeShowcase.jsx:175`, `QuadrantShowcase.jsx:61`,
`TechExecShowcase.jsx:61`, `TimelineShowcase.jsx:99`,
`EuropeanShowcase.jsx:76`. That's all 17 bespoke Showcases. Meanwhile the
shared flat renderer (`src/components/CVPreview.jsx`'s `renderExtras()`,
lines 806-825) *does* render both fields correctly (an achievements
`<ul>` and a technologies tag row) — which is why Minimal (always
flat-rendered) is clean, and why the 14 templates that bypass to the flat
renderer in ATS mode (`CVPreview.jsx`'s `variant === '…' &&
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
the task-5 ruling. Group: **G9**.

G9 total: **6 fix items (F9–F12, F14 + the allowlist-covered trio F9/F10/F11),
6 allowlist entries, 18 templates** (F14 and F12 are app-wide; F9/F10/F11
are template-specific — see table below for the full template list per
item).

| F# | one-line cause | templates | allowlist entries |
|---|---|---|---|
| F9 | blanket `word-break` on every flat-rendered span | minimal | 1 |
| F10 | unspaced `·` separator glued to next language | portrait | 2 |
| F11 | unfloored sidebar heading overflows the card edge | graduate | 3 |
| F12 | export clone keeps "will appear here" placeholder text | all 18 | 0 |
| F14 | experience `achievements`/`technologies` never rendered outside the flat path | 17 of 18 (all but minimal) | 0 |

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
are. Filed as **F14** above, group **G9**.

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
| Minimal | 2 | 3 | 2 | 2 | 2 | 2 | 2 | keep | — only template passing content-coverage cleanly; still the flat-renderer `--tpl-*` gap from A.2 |
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
| Editorial | 2 | 2 | 2 | 2 | **1** | **1** | **0** | rework | X=0 — F14; E=1 — F2 clipped links + F5 name-wrap on stress |
| Portrait | 2 | 2 | 2 | 2 | **0** | **1** | **0** | rework | X=0 — F14; E=0 — F10 glued language separator is an **example-tier** failure (real CVs, not stress) + F2/F5 on stress |
| European | 2 | 2 | 2 | 2 | **1** | **1** | **0** | rework | X=0 — F14; E=1 — F1 clipped links on stress |

**Everything except Minimal is "rework" once F14 (the universal
achievements/technologies drop) is scored on Export fidelity, where its own
0-anchor ("content missing/invisible in an exported PDF") is a literal,
exact match** — this is not rubric-gaming; `template-audit-a2.md`'s X
column was explicitly "provisional (2)" pending exactly this check, which
that session's resize-window tooling couldn't do and this one could by
reading the renderer code directly. The T/C/D columns are carried forward
unchanged from `template-audit-a2.md` (2026-09-09) since this audit found
no new evidence against them — only S (Graduate), E, A and X changed.

**After-fix column:** left for Task 10, once G6–G9 fixes land and F14 in
particular is resolved (which should move every template's X back toward
2–3 and several E scores back toward 2).

---

## 5. Out-of-scope follow-ups (redesign-level, not fixed here)

1. **The `stress:long-single-word` 2-line threshold itself may be the wrong
   bar for a double-compound name with no internal spaces.** F5 shows 9
   templates landing at 3–6 lines through no fault of their own CSS — every
   floor and font size matches §2 exactly. Either the threshold needs an
   explicit exception for names with zero space-separated "words" longer
   than some length, or the fixture itself is more adversarial than real
   CVs ever are and the bar should move. This is a test-design question for
   whoever owns the harness, not a template fix — flagging it rather than
   quietly loosening `maxNameLines` in `layoutAudit.js` ourselves.
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
F6 2, F7 2, F8 1) · G8 = 3 entries (F13 3) · G9 = 6 entries (F9 1, F10 2,
F11 3) + 2 non-allowlist items (F12, F14). 31 + 14 + 3 + 6 = 54.**
