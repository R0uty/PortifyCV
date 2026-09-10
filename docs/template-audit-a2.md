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
| **Modern Professional** | 3 | 3 | 2 | 2 | 2 | 2 | 2 | **keep** | — the benchmark. Name is in a full-width flex header, not a grid column, so no §7.1 risk (see §7.1 correction below) |
| **Portfolio Hybrid** | 2 | **1** | 2 | 2 | 2 | 2 | 2 | **polish** | C — teal + a second green leaking (25 hexes) |
| **Colorful Compact** | 2 | **1** | 2 | 2 | **1** | 2 | 2 | **polish** | C — 29 hexes, far past §3's capped-6 exception; E — `overflow-wrap:anywhere` on the name will char-fragment when tight |
| **Tech Executive** | 2 | 2 | **1** | 2 | 2 | 3 | 2 | **rework** | S — was "flat renderer + sidebar", a near-twin of Modern Professional. **Done v1.2.9:** bespoke `TechExecShowcase.jsx` + `techExec.css` — a deep-navy masthead + footer band around a right-rail body, `rule-under` headings, `--tpl-accent` (royalBlue set). |
| **Developer** | 2 | **1** | 2 | 2 | 2 | 2 | 2 | **rework** | C — ~28 hexes from a 7-colour per-category/per-chip cycle on skill tags + project chips, plus the company line in blue. (The "dark sidebar" note in an earlier draft — "it's light" — was wrong: the Aug restyle made it a full-bleed dark navy column, and the metadata is accurate.) Reworked v1.2.6: one tag style, ink company line, the fixed cool-spectrum gradient kept as the documented accent form (§3). |
| **Creative** | 2 | **1** | **0** | 2 | **1** | 2 | 2 | **rework** | S=0 — off-menu heading treatment (design-system §4/§9); C — 24 hexes, multicolour chips + rainbow bar; E — `overflow-wrap:anywhere` on name + `2.7rem` = worst §7.1 case |
| **Graduate** | 2 | **1** | **1** | 2 | 2 | 2 | 2 | **rework** | C — 4 accent hues (indigo/violet/blue/green); S — SaaS card-grid look, right-rail family shared with modern/creative/portfolio |
| **Executive** | 2 | **1** | 2 | 2 | 2 | 2 | 2 | **rework** | C — gold accent barely visible AND a residual second hue (`#4338ca` indigo + `#eef2ff`, incompletely removed in the Aug indigo→gold pass) |
| **Compact** | 2 | **1** | **1** | **1** | 2 | 2 | 2 | **rework** | D=1 — the compact-concept template, but built ad-hoc, not on the `compact` density class; S=1 — visually weakest, differs from the two Classics mainly by thin blue rules; C=1 — blue + a red accent |
| **Quadrant** | 2 | 2 | 2 | 2 | **1** | 2 | 2 | **rework** | E — `overflow-wrap:anywhere` on the name in a real 50%-width cell (will char-fragment); dead space top-right quadrant, uneven fill; cyan accent reads near-invisible |
| **Classic** | 2 | 3 | **1** | 2 | 2 | 2 | 2 | **merge** | S=1 — near-identical to Classic Professional (serif name, uppercase-rule headings, icon contact row); only difference is name alignment (left vs centred) |

## Summary

| | Count | Templates |
|---|---|---|
| **keep** (light polish only) | 6 | Modern Orange, Modern Timeline, Navy Professional, Classic Professional, Minimalist, Modern Professional |
| **polish** | 2 | Portfolio Hybrid, Colorful Compact |
| **rework** | 7 | Developer, Creative, Executive, Graduate, Compact, Quadrant, Tech Executive |
| **merge** | 1 | Classic → fold into Classic Professional (add left/centre alignment option) |

**Net after A-fix:** 15 template variants (Classic retired, all others kept
and brought to bar). A.3 then adds 3 new ones (editorial one-column,
photo-forward, European one-page) → **~18 strong** overall.

### §7.1 correction (from reading the Showcase JSX, not just the CSS grep)

The first pass over-scored name fragmentation. In **Modern Professional,
Graduate, Developer, Portfolio** the `<h1>` is in a **full-width flex
header** (a `min-w-0` div above the `__main`/`__aside` grid), not in a grid
column — so the Modern Orange failure mode (an unfloored grid column
collapsing) does not apply, and with no `overflow-wrap` override the name
wraps at word boundaries. Those four are **E:2**.

The genuine §7.1 risk is the three templates that set **`overflow-wrap:
anywhere` on the name element** — **Creative, Colorful Compact, Quadrant** —
which breaks a long name mid-word ("Aleksan/drina") the instant the box is
tight. Quadrant is worst: its name sits in a real 50%-width `1fr` cell.

## Cross-cutting shared fixes (do once, not per-template)

1. **`overflow-wrap: anywhere` → `break-word`.** `anywhere` is the wrong fix
   for a too-narrow box (the Modern Orange post-mortem's core lesson);
   `break-word` only breaks a word that genuinely can't fit. Applies to the
   **name** on Creative, Colorful Compact, Quadrant, and Executive (`1.9rem`
   name in a 200px-floored sidebar — right at the edge), and to the
   **contact-item** rows on Modern Orange, Navy Professional, Executive
   (Timeline's is deliberately paired with `white-space: nowrap`, left
   alone). For Quadrant also give the identity block room later (span both
   columns, or widen the cell) as part of its rework. **Done 2026-09-09**
   (commit — see git log): 7 rules across 5 files, no desktop-appearance
   change, lint/build/e2e green.
2. **Palette capping to the §3 colour rule** — Developer, Creative,
   Portfolio, Graduate (4 accent hues), Executive (residual indigo),
   Colorful Compact (cap to the §3 named-6 exception).
3. **Adopt the `--tpl-*` type ramp + a density class** — every template,
   during its own A-fix.
4. **Adopt `--tpl-accent`** — the 14 templates not migrated in A.1 (Tech
   Executive opts out — flat-renderer-only).

## Recommended attack order

1. **`overflow-wrap` safety fix** (Creative, Colorful Compact, Quadrant — one small PR). No desktop change; stops name char-fragmentation.
2. **Rework batch**, one PR each, adopting the `--tpl-*` ramp + a density class + the §3 colour rule + `--tpl-accent`:
   Creative → Graduate → Executive → Developer → Compact (rebuild on `compact` density) → Quadrant (fix the grid) → Tech Executive (new bespoke Showcase).
3. **Classic → Classic Professional merge** — retire the `classic` variant; add a left/centre name-alignment option to Classic Professional.
4. **Polish pass**: Portfolio Hybrid, Colorful Compact, plus the keepers' light ramp/`--tpl-accent` adoption.
5. Then **B** (builder usability) and **A.4** (template picker), then **A.3** (new templates).

## Decisions (resolved 2026-09-09)

1. **Compact** → **rework.** Rebuild on the real `compact` density class
   with genuine compact-typography craft. No retirement.
2. **Quadrant** → **rework.** Fix the quadrant sizing/alignment, make the
   cyan present, solve overflow behaviour. Keep the 2×2 concept.
3. **Classic** → **merge into Classic Professional**, adding a left/centre
   **name-alignment option** to Classic Professional so both looks survive
   as one template. The `classic` variant is retired.
4. **Tech Executive** → **rework, promote to a real bespoke template** —
   its own `TechExecShowcase.jsx` + `techExec.css`, "annual-report / navy
   leadership" as a genuine distinct design, accent-configurable like the
   rest. (Moves from "polish" to "rework" in the table.)
5. **Attack order** — as listed above, accepted.

**Net after A-fix:** 15 template variants (Classic retired, all others
kept and brought to bar), then A.3 adds 3 → **~18 strong templates**.
