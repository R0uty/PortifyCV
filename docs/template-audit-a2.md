# Template audit & triage (roadmap A.2)

**Date:** 2026-09-09
**Scores against:** `docs/template-design-system.md` §9 rubric (7 axes, 0–3;
≥2 on every axis = keep, any 1 = polish, any 0 = rework, 3+ rework axes or
"only differs by hue" = merge/retire).
**Sign-off required before any template is touched.**

## Method & evidence

- **Typography / colour / structural / density** — scored from this
  session's 16 desktop renders (demo CV, ~1400px, non-ATS) plus CSS
  forensics: distinct `#rrggbb` count per `src/styles/templates/*.css`,
  `grid-template-columns`, name-element `font-size` + wrap rules.
- **Content edge-cases** — scored primarily on **§7.1 (name fragmentation)**
  from code: does the name live in a column with a `min-width` floor, and
  how large is the name font. This is the exact failure the Modern Orange
  post-mortem diagnosed (unfloored column + large font, not font size
  alone). Full 8-item matrix is **provisional** — confirmed per template
  during its A-fix.
- **ATS-fallback parity** — from `CVPreview.jsx`'s delegation: 13 templates
  fall through to the generic flat renderer in ATS mode (which has complete
  monochrome overrides — same content, same order); timeline / navyProfessional
  / modernOrange render their own simplified ATS pass; minimal / techExec are
  flat-native. Parity is structurally sound across the board — **2 for all**
  unless a config references an undefined utility class (the `modern.js`
  `rose-*` trap, already fixed).
- **Export fidelity** — from `docs/template-design-system.md` §8 + the
  `portifycv-modern-orange-template` work-log (every known hang / vanish /
  clipped-name bug and its fix status). Marked **provisional (2)** — a real
  rendered-back-PDF check happens during each template's A-fix, per the
  rubric's "score from evidence" rule.

Browser stress-testing (live narrow-width fragmentation, per-template PDF
export) was blocked this session by the `resize_window` no-op — the window
stuck in mobile layout. The code-level evidence for §7.1 is strong enough
to score; the live confirmation moves into A-fix.

## Scores

T = typography · C = colour · S = structural clarity · D = density ·
E = content edge-cases (§7.1-weighted) · A = ATS parity · X = export (provisional)

| Template | T | C | S | D | E | A | X | Verdict | Driving axis |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|---|
| **Modern Orange** | 3 | 3 | 3 | 2 | 2 | 2 | 2 | **keep** | — benchmark; name-floor already fixed |
| **Modern Timeline** | 2 | 3 | 3 | 2 | 2 | 2 | 2 | **keep** | — sole occupant of single-column-timeline, serves a real use |
| **Navy Professional** | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **keep** | — dark-sidebar family, genuine contrast; URL wrap fixed in A.1 |
| **Classic Professional** | 3 | 3 | 2 | 2 | 2 | 2 | 2 | **keep** | — the "safe traditional" slot, does its job |
| **Minimalist** | 2 | 3 | 2 | 2 | 2 | 3 | 2 | **keep** | — honest baseline / default; it *is* the flat renderer |
| **Modern Professional** | 3 | 3 | 2 | 2 | **1** | 2 | 2 | **polish** | E — name `2.875rem` in unfloored `minmax(0,1.85fr)` column (larger than the Modern Orange bug) |
| **Portfolio Hybrid** | 2 | **1** | 2 | 2 | **1** | 2 | 2 | **polish** | C — teal + a second green leaking (25 hexes); E — name `2.7rem` unfloored |
| **Colorful Compact** | 2 | **1** | 2 | 2 | **1** | 2 | 2 | **polish** | C — 29 hexes, far past §3's capped-6 exception; E — `2.1rem` + `overflow-wrap:anywhere` unfloored |
| **Tech Executive** | 2 | 2 | **1** | 2 | 2 | 3 | 2 | **polish** | S — no bespoke Showcase, "flat renderer + sidebar"; flat path can't take `--tpl-accent` (opts out, see design-system §6) |
| **Developer** | 2 | **1** | 2 | 2 | **1** | 2 | 2 | **rework** | C — 28 hexes (teal+green+blue); E — name `2.5rem` unfloored; metadata still says "dark sidebar" (it's light) |
| **Creative** | 2 | **1** | **0** | 2 | **1** | 2 | 2 | **rework** | S=0 — off-menu heading treatment (design-system §4/§9); C — 24 hexes, multicolour chips + rainbow bar; E — worst §7.1 case (`2.7rem` + `overflow-wrap:anywhere`) |
| **Graduate** | 2 | **1** | **1** | 2 | **1** | 2 | 2 | **rework** | 3 axes ≤1 — 4 accent hues (indigo/violet/blue/green); SaaS card-grid look, right-rail family shared with modern/creative/portfolio; name `2.875rem` unfloored |
| **Executive** | 2 | **1** | 2 | 2 | 2 | 2 | 2 | **rework** | C — gold accent barely visible AND a residual second hue (`#4338ca` indigo + `#eef2ff`, incompletely removed in the Aug indigo→gold pass) |
| **Compact** | 2 | **1** | **1** | **1** | 2 | 2 | 2 | **rework or retire** | D=1 — the compact-concept template, but built ad-hoc, not on the `compact` density class; S=1 — visually weakest, differs from the two Classics mainly by thin blue rules; C=1 — blue + a red accent |
| **Quadrant** | 2 | 2 | 2 | 2 | **1** | 2 | 2 | **rework or retire** | E — dead space in the top-right quadrant, uneven quadrant fill, name in an unfloored 50%-width cell; cyan accent reads near-invisible |
| **Classic** | 2 | 3 | **1** | 2 | 2 | 2 | 2 | **merge/retire** | S=1 — near-identical to Classic Professional (serif name, uppercase-rule headings, icon contact row); only difference is name alignment (left vs centred) |

## Summary

| | Count | Templates |
|---|---|---|
| **keep** (light polish only) | 5 | Modern Orange, Modern Timeline, Navy Professional, Classic Professional, Minimalist |
| **polish** | 4 | Modern Professional, Portfolio Hybrid, Colorful Compact, Tech Executive |
| **rework** | 5 | Developer, Creative, Executive, Graduate, Compact* |
| **merge/retire** | 2 | Classic → fold into Classic Professional; Quadrant* |

\* Compact and Quadrant are "rework **or** retire" — your call (see decisions below).

**Net:** if Classic merges and Quadrant is cut → **13 strong templates**; if
Quadrant is reworked → **14**. A.3 then adds up to 3 new ones (editorial
one-column, photo-forward, European one-page) → **16–17 strong** overall.

## Cross-cutting shared fixes (do once, not per-template)

1. **Name-column floor — the single highest-value A-fix.** Seven templates
   have the unfloored-name-column + large-name-font setup that caused the
   documented Modern Orange fragmentation bug, and only Modern Orange was
   fixed: **Modern Professional, Graduate, Developer, Creative, Portfolio,
   Colorful Compact, Quadrant**. One technique for all seven: floor the
   name's grid column (`minmax(<Npx>, …)` per §2's width-floor table), cap
   the name to `--tpl-name-size`, and swap `overflow-wrap: anywhere` →
   `break-word` on the name element. One PR.
2. **Palette capping to the §3 colour rule** — Developer, Creative,
   Portfolio, Graduate (4 accent hues), Executive (residual indigo),
   Colorful Compact (cap to the §3 named-6 exception).
3. **Adopt the `--tpl-*` type ramp + a density class** — every template,
   during its own A-fix.
4. **Adopt `--tpl-accent`** — the 14 templates not migrated in A.1 (Tech
   Executive opts out — flat-renderer-only).

## Recommended attack order

1. **Name-floor shared fix** (7 templates, one PR) — biggest risk reduction, smallest change.
2. **Rework batch**, one PR each, adopting ramp + colour rule + `--tpl-accent`:
   Creative → Graduate → Executive → Developer.
3. **Compact & Quadrant decision** (below), then act on it.
4. **Classic → Classic Professional merge** (retire the `classic` variant; optionally add a left-align option to Classic Professional).
5. **Polish pass**: Modern Professional (name floor covers most of it), Portfolio, Colorful Compact, Tech Executive, plus the 5 keepers' light polish (URL primitive already done; mostly ramp adoption).
6. Then **B** (builder usability) and **A.4** (template picker) fold in, then **A.3** (new templates).

## Decisions needed from you

1. **Compact** — rework it (rebuild on the real `compact` density class with
   genuine compact-typography craft) or **retire** it (its "fits one page"
   value becomes a density toggle on other templates later)?
2. **Quadrant** — rework it (fix the dead-space / quadrant-alignment / weak
   cyan) or **retire** it (the 2×2 concept is distinctive but the execution
   isn't landing)?
3. **Classic** — confirm the merge into Classic Professional (retire the
   separate `classic` variant). Add its left-aligned letterhead as an option
   on Classic Professional, or drop that treatment entirely?
4. **Tech Executive** — keep as a distinct polish target, or accept that
   "flat renderer + a sidebar" isn't really its own template and merge its
   identity with Minimalist / retire?
5. **Attack order** — agree with the above, or reprioritise?
