# Template design system

**Date:** 2026-09-09
**Status:** normative — this is the bar, not a suggestion
**Applies to:** every CV template in `src/components/templates/` and every
template config in `src/utils/cvTemplates.js`

---

## 1. Purpose & scope

Every one of PortifyCV's templates (16 at the time of this doc; 15
after the v1.2.10 Classic merge) was authored by eye and patched
reactively — type sizes, accent usage, section-heading treatment, skills
rendering and URL formatting were each decided per template, by whoever was
working that day. The result is a set that varies mostly by *accent hue*
and barely by structure, plus a class of bugs (an unconstrained `2.4rem`
name shattering into `Ale/x/Mo/rga/n` at ordinary desktop widths) that only
existed because nothing constrained it. This document replaces eyeball
judgement with a written bar: a shared type ramp, a color rule, a closed
menu of section-heading treatments, a closed list of structural families,
one set of shared primitives, and a content, export and scoring checklist.
A template that does not satisfy this document is not "a matter of taste" —
it is unfinished. It applies to templates that already ship (scored in the
A.2 triage, then fixed) and to every new template, which must clear the
rubric in §9 *before* it ships. This doc outlives the v1.2.0 cycle; when it
and a template disagree, the template is wrong until this doc is amended.

---

## 2. Type ramp

Three density classes: **`roomy`**, **`standard`**, **`compact`**. A
template picks exactly one and inherits every size from it. A template does
**not** set ad-hoc font sizes for these six roles; it may still set weight,
case, tracking and color freely.

`compact` is not "the same design, shrunk". It is the class the Compact
template should be rebuilt on, and the class a future "fit one page" toggle
on any other template switches into.

| Role | `roomy` | `standard` | `compact` |
|---|---|---|---|
| **name** | 2.30rem / 1.10 | 1.95rem / 1.12 | 1.65rem / 1.15 |
| **title** (professional-title line) | 1.05rem / 1.35 | 0.95rem / 1.35 | 0.85rem / 1.30 |
| **section-heading** (uppercase, tracked) | 0.80rem / 1.20 | 0.75rem / 1.20 | 0.70rem / 1.20 |
| **entry-title** (job title, degree, project name) | 1.05rem / 1.30 | 1.00rem / 1.30 | 0.90rem / 1.25 |
| **body** | 0.95rem / 1.60 | 0.90rem / 1.55 | 0.82rem / 1.45 |
| **meta** (dates, location, employer line, captions) | 0.80rem / 1.40 | 0.75rem / 1.40 | 0.70rem / 1.35 |

Section-heading tracking, since these are always uppercase and small:
`roomy` `0.14em`, `standard` `0.16em`, `compact` `0.18em`. Tracking goes
**up** as size goes down — small caps set solid are unreadable.

### Token names

These are the shared CSS custom properties the ramp is implemented as, set
once per density class on the showcase root. Template CSS reads the token;
it does not restate the number:

```
--tpl-name-size
--tpl-name-lh
--tpl-title-size
--tpl-heading-size
--tpl-entry-title-size
--tpl-body-size
--tpl-meta-size
```

Only `name` carries an explicit line-height token, because it is the row
that changes most between classes and the row a template is most tempted to
override. The other five rows' line-heights in the table above are still
normative — set them directly in the rule that sets the size.

### Why these numbers

- **The `name` row is a bug fix, not a preference.** Modern Orange shipped a
  `2.4rem` name — the largest in the app — in a grid column with no width
  floor (`minmax(0, 0.71fr)` while the *sidebar* got `minmax(180px, …)`).
  Below ~620px of card width the floored column won and the name column
  collapsed to ~148px, fragmenting "Alex Morgan" mid-word at a completely
  ordinary 1024–1300px browser width. The fix was a 200px floor **plus**
  dropping the name to `2.05rem`; changing `overflow-wrap: anywhere` to
  `break-word` alone did nothing, because a box narrower than the word
  cannot help wrapping. So the ramp caps `roomy` at **2.30rem**, below the
  size that broke, and pairs every class with a hard floor:

  | Class | Name size | Minimum content width of the name-bearing column |
  |---|---|---|
  | `roomy` | 2.30rem | **240px** |
  | `standard` | 1.95rem | **210px** |
  | `compact` | 1.65rem | **180px** |

  Rule of thumb behind the floors: **≥ 6.5em of the name's own font-size**,
  which fits an 11-character single word without breaking. **The floor goes
  on whichever column holds the name — not automatically "the sidebar."**
  Creative and Executive never hit this bug only because their name happens
  to live in the floored column.

- **Display compresses harder than text.** `name` steps ~0.85 between
  classes; every text row steps ~0.90. Shrinking body copy at the same rate
  as a headline destroys readability long before it saves a page.

- **`title` and `entry-title` are the same size at `roomy` on purpose.**
  They are separated by weight, case and color, not size — the professional
  title is the accent-colored line under the name, the entry title is bold
  ink. Sizing them apart makes the header look like a mistake.

- **`section-heading` and `meta` share a size in every class.** Both are the
  smallest tier; the heading reads larger anyway because it is uppercase,
  tracked and bold.

### Starting density assignment

Where each template starts. The A.2 triage confirms or changes these; a
template that fights its class is a density-handling finding, not a reason
to invent a fourth class:

- **`roomy`** — Classic Professional, Minimalist, Creative,
  Executive, Portfolio Hybrid
- **`standard`** — Modern Professional, Modern Orange, Navy Professional,
  Modern Timeline, Developer, Graduate, Tech Executive
- **`compact`** — Compact, Colorful Compact, Quadrant

**Adoption state (v1.2.13–1.2.14):** every bespoke Showcase now carries a
`tpl-density-*` class on its root and reads the six roles from `--tpl-*`.
Two documented size overrides remain: Navy Professional's sidebar identity
block (kicker/name/role — white knockout in a ~180px rail, narrower than any
density's name-column floor) and per-template mobile tweaks. Minimalist is
the lone exception — it has no bespoke Showcase (it *is* the flat renderer),
so its ramp adoption waits on teaching the flat path to read `--tpl-*`.

---

## 3. Color rule

> **Every template = 1 ink + 1 accent + ≤1 neutral tint.**

- **Ink** — one hue for text. Up to three tonal steps of that one hue
  (`ink`, `ink-muted`, `ink-faint`). Anything that is content — role,
  company, institution, bullet text, summary, skill names — is ink.
- **Accent** — one hue, up to two tonal steps (a solid and a soft
  fill/border derivative). **Accent is wayfinding only**: dates, rules and
  dividers, section markers and icon badges, timeline dots and spines,
  bullet markers, the professional-title line under the name.
  **Never body text. Never role/company/institution text.** If removing the
  accent would make a line unreadable rather than merely plainer, the accent
  is doing content's job.
- **Neutral tint** — at most one very light background wash, applied to at
  most one region (a sidebar, a card type, or a header band — not all
  three). Dark sidebars count as the tint, not as a second accent.

Nothing else. No second decorative hue, no per-item colors, no "just this
one" gradient in a third color. The A-fix rework batch and polish pass
brought every template here: the last multi-hue holdouts — Creative,
Executive, Graduate, Portfolio Hybrid (seven emerald/teal/sky/violet/pink/
orange/green tints, capped to one emerald accent v1.2.11) — now run a single
accent. The one deliberate multicolour template is Colorful Compact, under
the capped, named exception below.

Deriving a per-element check: recolor the accent to pure black in your head.
Everything that goes from "colored" to "black" should still be *findable*
(it was a marker), and nothing should become *ambiguous* (it was content).

### Accent expressed as a gradient: Developer

Developer's one accent is a **fixed teal→blue→purple cool-spectrum
gradient**, used only for decorative wayfinding marks — the name text, the
photo ring, the section-icon badges, the timeline marker. Never on body,
role, company or any content text; never a per-item colour. It is one
coherent cool sweep, not multiple competing hues, and it is the template's
stated concept — so it counts as Developer's single accent, not a §3
violation. Developer opts out of the Settings accent swatch (§6) for the
same reason. Its solid-accent moments (dates, links, bullet markers, icons)
use `#0f766e` (teal-700), contrast-safe on white.

### The one full multicolour exception: Colorful Compact

Colorful Compact's stated concept **is** multicolor — one hue per section.
It is the only template allowed more than one accent, and only from this
fixed, capped, named palette. Six swatches, no more, ever:

| # | Name | Marker (dot / rule / fill) | Text |
|---|---|---|---|
| 1 | pink | `#ec4899` | `#be185d` |
| 2 | orange | `#f97316` | `#c2410c` |
| 3 | green | `#22c55e` | `#15803d` |
| 4 | teal | `#14b8a6` | `#0f766e` |
| 5 | blue | `#3b82f6` | `#1d4ed8` |
| 6 | purple | `#a855f7` | `#7e22ce` |

Rules for the exception:

- Swatches are assigned to **sections**, in the order above, and a section
  keeps its swatch. Never per skill chip, per project card, or per bullet —
  "each item a random hue" is exactly what this exception does not license.
  Everything decorative inside a section (dot, heading label, date, tag,
  skill pill, level badge) takes that section's one colour.
- Within a section, the marker hex is for the dot/rule/fill and the text hex
  is for the heading label. Body copy in a colorful section is still ink.
- The palette does not grow. The seventh and eighth hues (`--cc-yellow:
  #eab308` / `--cc-yellow-text: #854d0e`, and `--cc-charcoal`) were
  **retired v1.2.12**: the yellow dot was the only one in the set that fails
  against a white card at the size it is drawn, and its text pair read brown
  rather than yellow.
- Every other template, including the ink-only ones, follows §3's main rule
  with no exceptions.

*Realized v1.2.12:* the exception's rules above are now met exactly — the
per-item colour cycles (`SKILL_COLORS`, `TAG_COLORS`, `EXP_DATE_COLORS`,
`LANG_LEVEL_COLORS`, `CONTACT_DOT_COLORS`) collapsed to the section colour,
yellow/charcoal removed, and the template adopted the `compact` type ramp.
The dark header's contact dots use one fixed swatch (orange, matching the
two-tone name's accent half).

---

## 4. Section-heading treatments

A closed menu of five. **Each template picks exactly one and uses it for
every section, main column and sidebar alike.** Adding a sixth treatment
means amending this document, not adding a variant to one template.

| Treatment | What it is | Current members |
|---|---|---|
| `rule-under` | Tracked uppercase label with a hairline rule directly beneath, spanning the column. No glyph, no marker. | Classic Professional (centre or left name), Compact, Executive, Tech Executive |
| `icon-badge` | A small circular/rounded accent-filled badge holding a monochrome stroke glyph (`sectionIcons` in `shared.jsx`), label to its right. | Developer, Modern Professional, Graduate, Modern Orange, Modern Timeline, Navy Professional, Portfolio Hybrid, Quadrant |
| `left-tick` | A small solid accent mark — a short vertical bar or a dot — immediately left of the label. No glyph. | Colorful Compact (dot form) |
| `eyebrow-caps` | Small tracked uppercase label, no rule and no marker; separation is whitespace alone. | Minimalist |
| `numbered` | A two-digit ordinal (`01`, `02`, …) in the accent, preceding the label. | Creative, Editorial |

**`icon-badge` was on 10 of 16 by default, not by choice** — the house
cliché. The v1.2.0 A-fix batch moved Executive and Tech Executive onto
`rule-under` and Creative onto `numbered`, bringing it down to 8. Pick it
because the template's voice wants a glyph, not because it is what the last
template did.

**Members lists in this section reflect the post-A-fix state** (Creative /
Graduate / Executive / Developer / Compact / Quadrant / Tech Executive
reworked, v1.2.3–1.2.9). They are kept current as each rework lands.
It scores **0** on structural clarity in §9 — that axis's 0 anchor names
off-menu heading treatments explicitly — until it is moved onto one of the
five, or until its treatment is added to this menu deliberately, given a
name, and made available to every template.

---

## 5. Structural families

Six families. **A template must be distinguishable from every other
template by *structure* or by a genuinely distinct typographic voice — never
by accent hue alone.** Two templates in the same family with the same
heading treatment and the same density class are duplicates whatever their
accents are; that is how Modern Professional and Tech Executive became
near-twins in August (resolved v1.2.9 — Tech Executive got a bespoke
navy-masthead/footer Showcase). Classic and Classic Professional were
near-identical (only the name alignment differed); v1.2.10 retired `classic`
and folded its left-aligned letterhead into Classic Professional as a
`classicNameAlignment` Settings option.

A **new** template must either open a new family or be clearly the
best-in-class of an existing one. "Another right-rail template in a
different color" is not a new template.

| Family | One line | Current members |
|---|---|---|
| `single-column-flow` | No sidebar. Header, then sections flowing full width, top to bottom. | Minimalist, Classic Professional, Compact, Editorial |
| `single-column-timeline` | Single column whose spine is a vertical timeline running through the career sections. | Modern Timeline |
| `left-rail + main` | Light full-height rail on the left carrying identity and/or secondary sections; primary sections on the right. | Executive, Modern Orange |
| `right-rail + main` | Primary sections on the left, secondary sections in a narrower right column. | Modern Professional, Creative, Graduate, Portfolio Hybrid, Colorful Compact, Tech Executive (with a distinguishing deep-navy masthead + footer band, v1.2.9) |
| `dark-sidebar + main` | As `left-rail + main`, but the rail is a dark, saturated field with knocked-out white type. | Navy Professional, Developer |
| `grid` | Neither a rail nor a flow — content partitioned into cells that read at a glance rather than in order. | Quadrant |

Notes on the current distribution, for the A.2 triage:

- **`right-rail + main` holds 6 of 16** — the crowded family, and the one
  where "distinct or duplicate" bites hardest.
- **`dark-sidebar + main` holds two: Navy Professional and Developer.**
  (An earlier draft of this note claimed Developer's rail had "been light
  for weeks" — that was wrong, written from a session where desktop renders
  were unavailable. Developer's Aug 2026 restyle made it a full-bleed dark
  navy column; the "Dark sidebar" metadata is accurate.) Navy is a flat
  navy field with identity in the sidebar; Developer is a navy gradient
  holding only the secondary sections, identity in a top header — distinct.
- **`numbered` heading treatment + `single-column-flow`** was the open
  combination named here for the planned editorial one-column template,
  rather than it becoming a seventh right-rail — filled by Editorial
  (v1.2.20, 2026-09-13).

---

## 6. Shared primitives

These are decided once, for every template, and are **not** a per-template
design choice. Cross-references only — the implementations live in the files
named.

- **URLs — `formatLinkDisplayValue()`** (`src/utils/shared.js`, re-exported
  from `templates/shared.jsx`). Strips the `http(s)://` scheme and any
  trailing slashes. **Every template and the flat renderer call it for every
  displayed URL**, so a link reads `linkedin.com/in/alex` and not a raw
  `https://linkedin.com/in/alex/` that wraps across two or three lines.
  Never hand-roll the strip.
  *Current state:* Compact, Navy Professional, Modern Timeline and
  `CVPreview.jsx`'s flat renderer do not call it at all — fixed in A.1 for
  the **Links** section. Project and Certificate URL display (raw `https://…`
  in several templates) is a per-template A-fix item, not part of A.1.
- **Dates — `formatDateRange(startDate, endDate, isCurrent, presentLabel)`**
  (`src/utils/shared.js`). One formatter, one separator, one "Present"
  handling, everywhere — including sidebars, education, certificates and
  projects. No template composes its own `start + ' – ' + end`.
- **Contact row — one icon set, one order.** Icons come from `contactIcons`
  in `templates/shared.jsx` (`email`, `phone`, `location`); a website/portfolio
  entry uses the matching `devIcons` glyph. Canonical order:
  **email → phone → location → website**, with empty fields filtered out and
  the remainder closing up. Email leads because it is the field a recruiter
  acts on. *Current deviations:* Classic Professional and Navy
  Professional lead with phone; Colorful Compact orders email → location →
  phone → website.
- **Skills rendering — chosen by density class, not by taste.**
  - `roomy` → **chips** (bordered or soft-filled tags). Room to breathe;
    chips are the most scannable form and the least dense.
  - `standard` → **chips**, or a **grouped inline list** (category label +
    comma-separated items) where the template already groups skills.
  - `compact` → **inline comma-separated list**. Chips at compact sizes
    waste 30–40% of the line to padding and borders, which defeats the
    class.
  - **dot-rating** is opt-in and rare: only where the template's stated
    concept supports it (today, Modern Orange). `CvData.skills` is
    `string[]` with **no per-skill rating field** — a dot rating is derived
    from list order (first-listed most emphasized, tapering 5→3) and must
    carry the same honesty framing the language-dot heuristic already uses:
    a stylized flourish, not a literal claim. Never invent a rating field to
    feed one.
  - One very long single skill string must wrap inside its chip or line, not
    push the column (see §7).
- **Accent color — one custom property, one per-template default.** Each
  template's CSS reads its accent from **`--tpl-accent`**, and declares its
  default value in that template's entry in `src/utils/cvTemplates.js`. The
  Settings accent swatch writes the property; **exposing the swatch is the
  default**, and a template opts *out* explicitly when its concept is a fixed
  palette (Colorful Compact's capped rainbow; the ink-only Classic Professional and
  Minimalist), in which case the swatch hides for it.

  **`accent.default` must be the lowercase hex of that template's
  `*_DEFAULT_ACCENT_COLOR` constant** in `src/components/templates/<id>.js` —
  same colour, exact string match, not merely case-insensitively equal.
  `SettingsModal` still compares case-insensitively as a guard against a
  future typo, but with this rule an exact match is the norm.

  **Wiring a template's accent is a 3-step opt-in.** Adding the registry
  entry alone ships a swatch that renders but recolors nothing — only step 1
  is discoverable from `SettingsModal`:
  1. Add the `accent: { default, swatchSet }` entry in `cvTemplates.js`.
  2. In `CVPreview.jsx`, make that template's delegation forward
     `accentColor={accentColor}` to its Showcase.
  3. In the Showcase, accept the prop, write `--tpl-accent` (plus the
     JS-computed soft derivative as a second inline property), and define an
     ATS-mode override.

  `resolveTemplateAccent(templateAccentColors, templateId)` in
  `cvTemplates.js` is the single resolver both call sites use
  (`ResumeBuilderPage.jsx`'s CVPreview `accentColor` prop and
  `SettingsModal`'s active swatch): the user's per-template override, else
  the registry default.

  **The flat renderer (Minimalist, and every template's ATS-mode) does not
  consume `--tpl-accent`.** Its `t.accentColor()` returns Tailwind colour
  *names*, not hex, and it ignores `accentColor` entirely. Minimalist (no
  `*Showcase.jsx`) **opts out** — `accent: null`. Every other template now
  has a bespoke Showcase that consumes `--tpl-accent` in non-ATS mode.
  (Tech Executive was the last flat-only template; v1.2.9 gave it
  `TechExecShowcase.jsx`.) Teaching the flat path to consume a hex
  `--tpl-accent` is still a candidate for a later pass.

  Every configurable Showcase now writes the shared `--tpl-accent` inline
  (Modern Timeline and Modern Orange, wired since A.1 under private
  `--tl-accent` / `--mo-accent` names, were renamed onto `--tpl-accent` in
  v1.2.15; their other private tokens — `--tl-text`, `--mo-border`, … —
  stay). The accent's soft/tonal derivative is **computed in JS at render
  time from the chosen accent and written as a second inline custom
  property** where a template needs one — Timeline and Modern Orange use
  only the solid accent, so they set just `--tpl-accent`. It is never a second hardcoded
  hue, and never `color-mix()`/`oklch()`, which the export pipeline cannot
  rasterize (§8). Templates also need an ATS-mode accent value: Timeline's
  `TIMELINE_ATS_ACCENT_COLOR` is the precedent — a user-chosen accent must
  not survive into ATS-friendly output unchanged if it hurts contrast.
- **Heading color override — `--cv-heading-color`** already exists
  (`src/utils/cvHeadingColors.js`) and every section-title rule reads it with
  its own color as the fallback: `color: var(--cv-heading-color, <default>)`.
  Keep that pattern. Text knocked out on a dark field (e.g. Navy
  Professional's sidebar name) is deliberately left *out* of the override —
  a user-chosen heading color on a dark navy rail can be unreadable.

---

## 7. Content edge-case checklist

Every template passes all eight, in the live preview **and** in a real PDF
export, before it is called done. These are the shapes real CVs actually
take, not exotic input.

1. **Long name.** A long two-part name and a single long word (e.g.
   "Kristiansen"). Must wrap cleanly to at most two lines with no mid-word
   fragmentation. **Check the width floor on the column that holds the
   name** (§2) — and verify at a narrow preview, not just full width. The
   reliable way to test this: set an inline `width`/`maxWidth` override on
   `.app-shell__preview` (the ancestor that actually constrains the card)
   and read `getBoundingClientRect()` on the name; window resizing is
   unreliable in this environment.
2. **No photo.** The header/rail must not leave a photo-shaped hole or
   collapse its alignment. Some templates hide the photo by config
   (`isPhotoVisibleForTemplate`) — the no-photo layout is the *normal* case
   for those, not a fallback.
3. **One job.** A single Experience entry with no timeline neighbours. A
   timeline spine with one dot must not look like a rendering error, and the
   page must not end in a column of dead space.
4. **Ten jobs.** Pagination across 3+ PDF pages. No section heading orphaned
   at the foot of a page, no entry sliced mid-card.
5. **Missing optional sections.** Every optional section empty (no projects,
   no certificates, no languages, no links). No empty headings, no stranded
   dividers, no sidebar that is now 40px of tinted nothing.
6. **One very long single skill string.** A 60-character skill must wrap
   inside its chip or inline run and must not widen the column or force a
   horizontal overflow.
7. **ATS-fallback parity.** With ATS-friendly mode on, the template's flat
   config (`src/components/templates/<id>.js`) must render *the same content*
   — same sections, same order, same fields, same URL/date formatting. Losing
   or reordering content in ATS mode is a bug, not a simplification. Note
   that a bespoke template either bypasses to the shared flat renderer in ATS
   mode or renders a simplified version of its own Showcase (Modern Timeline,
   Navy Professional, Modern Orange do the latter) — check the branch the
   template actually takes in `CVPreview.jsx`.
8. **PDF export, rendered back to an image.** Export, then open the produced
   PDF as an image (`Read` with a `pages` range) and *look at it*. A
   resolved `exportCvAsPdf()` promise is necessary and **not sufficient** —
   Developer shipped a PDF with the name entirely invisible while the export
   completed cleanly every time.

---

## 8. Export-safety checklist

The PDF export is html2canvas + jsPDF rasterizing a **clone** of the preview
DOM (`src/utils/exporters.js`, assembly in `src/workers/pdfExportWorker.js`).
It is not a browser print, and the clone does not inherit everything the live
page has. Each rule below cost a real debugging session.

- **No `background-clip: text`.** html2canvas paints the background rect and
  the transparent text never shows through — the element renders as a solid
  block. This is what made Developer's gradient name vanish from every
  export.
- **No `clip-path`.** It hangs the export indefinitely, with *zero*
  html2canvas debug output — it never reaches the capture call at all. Use
  the border-triangle trick or an inline SVG shape instead.
- **Hex colors only** in `src/styles/templates/*.css` and in inline SVG
  `stop-color`. **No `oklch()`, no `color-mix()`** — html2canvas does not
  rasterize them reliably.
- **No `var()` inside an SVG `stop-color`** (or anywhere else in an inline
  SVG's paint). html2canvas serializes an SVG to a standalone
  `data:image/svg+xml` URI, which loses the page's custom-property scope, so
  the `var()` silently fails to resolve in the export while looking perfect
  live. Hardcode the hex.
- **`filter: blur()` only on elements carrying `data-export-ignore="true"`.**
  Ignored elements are stripped from the clone before capture, so their blur
  is never rasterized — that is precisely why Developer's blurred background
  blobs are safe. Blur on captured content is a hang risk.
- **Any `@media print` fallback needs a `.pdf-export-root` duplicate.**
  `@media print` is the browser's Ctrl+P path and never fires for this app's
  html2canvas export; `exporters.js` adds the class `pdf-export-root` to the
  clone. The two paths are unrelated despite looking similar. Existing
  precedent: `.pdf-export-root.modern-showcase`,
  `.pdf-export-root.dev-showcase .dev-showcase__name`.
- **No entrance animation that is not covered by the global rule.**
  `app-shell.css` carries
  `.pdf-export-root *, .pdf-export-root *::before, .pdf-export-root *::after { animation: none !important }`.
  A cloned node re-triggers its animation from the "from" keyframe the
  instant it is inserted, and the pipeline waits ~2 animation frames before
  capturing — sections were being captured mid-fade at near-zero opacity and
  vanishing *intermittently*, depending on system load. Any new animation
  must be an `animation` (covered by that rule); do not reach for a
  `transition`-driven entrance, which the rule does not cover.
- **Test any never-before-used CSS property with a real export before
  trusting a screenshot.** Grep the repo first: if a property appears
  nowhere else in `src/styles/templates/`, treat it as an export risk and
  prove it with an actual exported PDF, not a preview screenshot. `clip-path`
  and `filter: blur()` were both found exactly this way.
- **Every section wrapper renders `data-export-section="<id>"` and
  `data-export-placement="main" | "side"`, and the identity header renders
  `data-export-header="true"`.** Page-break placement reads these; a section
  that omits them is invisible to pagination. `placement` matters
  specifically: main-column breakpoints drive the page-break decision and
  sidebar content is deliberately filtered out of that calculation, because
  the two columns are independent content streams that only share a Y-axis.
- **Unique SVG gradient/filter ids via `useId()`.** The template gallery
  mounts several Showcases on one page at once; duplicate ids collide and
  the wrong gradient wins.
- **Known, accepted artifact:** contact rows with an icon beside text can
  rasterize with a stray thin horizontal line under the row. App-wide
  export-pipeline quirk, reproducible on templates that predate any given
  change — not something a new template introduces, and not a reason to fail
  export fidelity in §9.

---

## 9. Quality rubric

Seven axes, scored 0–3. Every template is scored against this sheet in the
A.2 triage, and every new template is scored before it ships.

**Pass threshold: a template must score ≥ 2 on *every* axis to be "keep".**
Any axis at 1 flags **polish**; any axis at 0 flags **rework**. A template
that would need rework on three or more axes, or whose only distinguishing
feature from another template is its accent hue, is a **merge/retire**
candidate — the point of this rubric is to make those calls defensible, not
to protect every existing template.

| Axis | 0 — fails | 1 — weak | 2 — solid | 3 — exemplary |
|---|---|---|---|---|
| **Typography discipline** | Ad-hoc sizes throughout; no recognizable ramp; a size outside the ramp causes a layout bug | Roughly one density class but 2+ roles set off-ramp; hierarchy muddled between two adjacent roles | Every role on-ramp for its declared class; hierarchy legible at a glance | On-ramp, plus weight/case/tracking used deliberately so the template has a voice of its own |
| **Color discipline** | More than one accent hue, or accent on body/role/company text | One accent, but leaking onto content in places, or a second decorative hue "just here" | 1 ink + 1 accent + ≤1 tint, accent confined to wayfinding | As 2, and the accent placement actively aids scanning (dates, spine, markers read as one system) |
| **Structural clarity** | Indistinguishable from another template except by hue; or off-menu heading treatment | Same family + same heading treatment as another template, differing only in small details | Clearly identifiable family, exactly one on-menu heading treatment used consistently | Best-in-class of its family, or the sole occupant of one, with structure that serves a real use case |
| **Density handling** | Declares no class; spacing arbitrary | Declares a class but spacing/rhythm contradicts it (compact template with roomy gutters, or vice versa) | Class declared and spacing consistent with it | Class fully realized — line lengths, gutters and section rhythm all reinforce it; a `compact` template genuinely earns its page |
| **Content edge-cases** | Fails §7.1 (name fragments) or §7.5 (empty sections leave stranded chrome) | Passes the common cases; 1–2 of the eight fail cosmetically | All eight pass | All eight pass and degrade gracefully — 1 job and 10 jobs both look intentional, not merely non-broken |
| **ATS-fallback parity** | Content lost or reordered in ATS mode; or ATS mode renders unstyled (undefined utility classes) | All content present but formatting primitives diverge (raw URLs, different date format) | Same content, same order, same primitives; plain but correct | As 2, and the ATS rendering is a deliberate, readable document in its own right |
| **Export fidelity** | An §8 violation present, or content missing/invisible in an exported PDF | Exports, but with orphaned headings, sliced cards, or visible drift from the preview | Clean multi-page export, verified by rendering the PDF back to an image | As 2 across the full §7 matrix — 1 job, 10 jobs, no photo, empty sections all export cleanly |

Scoring rules:

- **Score from evidence, not from memory.** Export fidelity is scored from a
  rendered-back PDF image, edge-cases from actually entering the data.
- **A 3 is not a participation grade.** Most solid templates should score
  2s. A column of 3s means either an exemplary template or a lenient scorer.
- **Record the verdict, not just the number** — `keep` / `polish` /
  `rework` / `merge` / `retire`, with the axis that drove it.
