# PortifyCV 1.0.1 pre-release audit

**Date:** 2026-08-11
**Scope:** Fixes for the post-1.0.0 UI review (`../todo.md`, findings dated
2026-08-10), plus additional bugs found and fixed during the same pass that
were not on that list. Extended the same day with a release-readiness
follow-up pass (findings 11, the "Follow-up" section, and CI/e2e tooling) —
see the "Release readiness" section at the bottom for how the verdict moved
across both passes. No changes to the share-link codec or the CV data
schema.

This document records what was checked, what was found, how each fix was
verified, and which behaviours are deliberate rather than defects, in the same
format as [`audit-1.0.0.md`](audit-1.0.0.md). `../todo.md` is the working
punch list this audit closes out; no CHANGELOG entry for 1.0.1 has been
written yet.

---

## How the audit was run

| Area | Method |
| --- | --- |
| UI review | Interactive walkthrough of the running app, evidence from what rendered — not from reading code first (`../todo.md`) |
| Root-cause tracing | Reading the relevant component/reducer/util for each finding before writing a fix, to fix the cause rather than the symptom |
| Interaction | Driving the app in Chrome — nav rail, template switching, section toggling, form filling, screenshots at each step |
| DOM verification | `javascript_tool` queries against the live page (element counts, computed layout) wherever a screenshot alone was ambiguous or the capture tool misbehaved |
| Reducer/state logic | `npm run check:reducers` (54 assertions) run after every state-touching change |
| Share-link codec | `npm run check:share` (15 assertions) — untouched by this pass, run to confirm no regression |
| Build health | `npm run lint`, `npm run build`, `npm run dev` + manual smoke test |
| Dead-code verification | Script cross-referencing every top-level CSS class selector against all `.jsx`/`.js` source before removing anything, then a visual pass over the templates most affected |
| End-to-end coverage | `npm run test:e2e` (Playwright, 10 assertions across 4 spec files), added this pass and now part of the regression suite |
| Dependency audit | `npm audit` / `npm audit fix` (finding 11) |

---

## Findings

Ordered by severity.

### 1. Template gallery didn't show the templates

**Severity:** high — users picked a layout by reading a paragraph, not by seeing it.

All 10 cards rendered the same abstract skeleton, differing only in whether a
placeholder line was `w-10/12` or `w-11/12`. Seven of the ten descriptions
opened with a "two visual modes" preamble describing a global ATS toggle, not
anything specific to the template.

**Fix:** thumbnails render a real, scaled `CVPreview` of the user's own CV
(falling back to demo data when empty), trimmed to ~238 DOM nodes so ten
previews stay cheap. Descriptions cut to one line in both locales.

**Verified:** each of the 10 gallery cards renders visibly distinct content
matching its template's actual layout.

---

### 2. The editor buried the form under 2,751px of preamble

**Severity:** high — the first form field was more than two viewport heights
down, below Quick import, Export mode, ATS score, Smart suggestions, and the
"Visible sections" panel, while the nav rail simultaneously highlighted
"Personal Information" as active.

**Fix:** Quick import, Export mode, ATS score, and Smart suggestions moved
into a collapsed `<details>` whose summary keeps the ATS score and suggestion
count visible. `PanelSection` — the wrapper every numbered CV section (00
through 20) is built on — gained its own collapse/expand toggle (chevron
button, self-contained `useState`, the same CSS grid-row collapse animation
already used for individual entries in `SortableItemCard`). "Section 00 —
Visible sections" defaults collapsed, with its X/Y-visible count moved into
the existing `badge` slot; every other section defaults open.

**Verified:** preamble 2,751px → 779px; Section 01 is on the opening screen.
Nav-rail scrolling lands correctly whether the target section is expanded or
collapsed.

---

### 3. Landing page had no picture of the product

**Severity:** high — headline, two lines, one button, roughly half the
viewport empty. Named none of the ten templates, the ATS scoring, the live
preview, or the export formats, and showed no image of the output — the
strongest conversion element for a visual product.

**Fix:** rebuilt as a two-column hero — headline/subtitle/CTA and a four-line
feature list on the left, a real scaled `CVPreview` (Minimalist template, demo
data) on the right. Stacks to one column under 1023px. `CVPreview` is
lazy-loaded (`React.lazy` + `Suspense`) so the landing page's own bundle stays
at its original ~14KB gzip; the preview's ~29KB gzip chunk loads async and is
shared with the builder view.

**Verified:** confirmed in the browser in both locales; a build check caught
and fixed a regression where the first implementation pulled `CVPreview` and
all eight template-showcase components into the landing page's eager bundle
(14KB → 43KB gzip) before the lazy-load fix brought it back down.

**Superseded later the same day:** the live `CVPreview` mockup was replaced
with `PortifyCV2.jpg`, a pre-built marketing shot supplied for this purpose
(logo, wordmark, styled CV on a flat-lay background), re-encoded from a 1.5MB
PNG to an 85%-quality, 136KB JPEG first. It's a plain `<img>` now — the
`.landing-preview__frame`/`__page` scale trick and the lazy `CVPreview`
import are gone from the landing page. The bundle-size point above no longer
applies to the landing page specifically, though `CVPreview` remains
lazy-loaded for the builder view, its only consumer now.

---

### 4. Nav rail section order silently disagreed with the actual form order

**Severity:** medium — the nav rail is the primary way to navigate the editor,
and for 4 of its 10 entries the order it presented did not match where
scrolling would actually land.

**Root cause:** `NAV_SECTIONS` in `ResumeBuilderPage.jsx` is a hardcoded array
maintained separately from the actual JSX order of the `PanelSection` cards in
`CVForm.jsx`. Nothing keeps the two in sync. The nav rail listed Experience →
Education → Projects → Skills → Certificates → Languages → Links → Interests;
the form actually rendered Skills → Experience → Education → Certificates →
Projects → Languages → Interests → Links. Skills, Experience, Projects, and
Links were each in a different relative position.

Not the same bug as the 1.0.0-era "section numbering skipped from 05 to 07"
fix (`../CHANGELOG.md`) — that was a stray index; this is two independently
hardcoded orderings that drifted apart over time.

**Fix:** reordered `NAV_SECTIONS` to match `CVForm.jsx`'s real order, with a
comment recording that the two must be kept in sync by hand.

**Verified:** clicking "Skills" in the nav rail now lands directly above
"Section 03 — Experience," matching the rail's listed order.

---

### 5. Sections were editable even when the selected template couldn't render them

**Severity:** medium — a user could fill in content (e.g. Testimonials, Core
Strengths) that would silently never appear in their chosen template's output,
with no indication why.

**Root cause:** `CVForm.jsx` rendered all 21 `PanelSection` blocks
unconditionally. Only the "Visible sections" toggle list and the live
preview/export (`CVPreview.jsx`) already filtered by
`templateSectionKeySet` — the union of a template's `primarySections` and
`secondarySections` in `cvTemplates.js`. Coverage varies widely: Minimalist
supports 5 section types, Developer 11.

**Fix:** wrapped each of the 19 optional `PanelSection` blocks in a
`templateSectionKeySet.has('key')` check (Personal and Visible-sections stay
unconditional). `NAV_SECTIONS` items gained a `sectionKey` field so the nav
rail filters the same set. The scroll-spy `IntersectionObserver` effect —
previously `[]`-dependency, querying the DOM once at mount — now re-runs on
`selectedTemplate` change, so a section revealed by a later template switch is
still tracked for active-highlighting.

**Verified:** switching Minimalist (5 supported sections) → Developer (11
supported sections) shows/hides the matching cards and nav items in the same
pass, confirmed interactively and by screenshot. `npm run check:reducers`
unaffected (54/54; this change is purely presentational).

---

### 6. Four smaller visual inconsistencies

**Severity:** low, grouped.

- **"No login. No data saved." appeared three times** — landing body, landing
  footer, builder footer. Removed the landing hero's inline copy; the sticky
  footer (rendered on every view) is now the one, persistent instance.
- **"Nothing saved anywhere" was styled like a button**, sitting beside two
  real buttons (`Load demo CV`, `Reset form`). Restyled as a rounded pill with
  a status dot and `role="status"` so it reads as an indicator, not a control.
- **"Load demo CV" appeared twice on one screen** — the top action row and
  inside the (collapsed-by-default) Quick Import card. Removed the duplicate.
- **`HTML`/`JSON` were bare text buttons in an icon toolbar**, a seam left
  from the 1.0.0 audit fix. Collapsed PDF/HTML/JSON into a single "Export"
  menu with a dropdown, closing on outside click or Escape.

---

### 7. First export paid for a 1.4MB download on click

**Severity:** medium (performance) — `vendor-pdf` (~177KB gz) and
`pdfExportWorker` (~238KB gz) lazy-load correctly, so first paint is
unaffected, but the first PDF export always waited on that download.

**Fix:** `ResumeBuilderPage` warms the bundle on `requestIdleCallback`
(falling back to a 2s `setTimeout`) shortly after mount.
`prefetchPdfExportAssets()` in `src/utils/exporters.js` triggers the existing
dynamic imports and spins up a throwaway, never-terminated instance of the PDF
export worker so its own nested `jspdf` import also runs to completion in the
background.

**Verified:** in a built preview, both chunks finish downloading within ~4s of
the builder mounting, well before any export click, with no change to first
paint.

---

### 8. Google Fonts was the app's only third-party request

**Severity:** low — no CV data was involved, but it was the one thing
contradicting "everything runs in your browser," and it added a network
round-trip.

**Fix:** replaced the Google Fonts `<link>`/preconnect tags with
`@fontsource-variable/inter`, imported once in `src/main.jsx`. Vite bundles
the variable-font `woff2` files (split by unicode range, matching Google's own
subsetting) as hashed same-origin assets.

**Verified:** network capture on a built preview shows zero requests to
`fonts.googleapis.com`/`fonts.gstatic.com`.

---

### 9. The favicon reference was broken and the in-app logo was a placeholder

**Severity:** low — cosmetic, but the browser tab showed no icon at all.

`index.html` pointed `<link rel="icon">` at `/favicon.svg`, which did not
exist on disk (confirmed by directly checking `public/`); the in-app `Logo`
component was a generic hand-drawn document glyph unrelated to the project's
actual `public/PortifyCV.png` brand mark.

**Fix:** extracted an icon-only mark from `PortifyCV.png` (crop, transparent
background, 512×512) via ImageMagick, saved as `public/logo-mark.png`.
`Logo.jsx` now renders it; `index.html`'s favicon and `apple-touch-icon`
point to it; `og:image`/`twitter:image` point at the full lockup. The landing
page header uses the full lockup (icon + "PortifyCV" wordmark) at a size where
the wordmark is legible, since it has room the compact toolbar/nav rail don't.

**Verified:** `logo-mark.png` returns `200 image/png`; rendering confirmed in
the toolbar, nav rail, and landing header via screenshot.

---

### 10. No regression coverage for form/UI state

**Severity:** low (process) — `cvFormReducer` and `uiReducer` are pure
functions and cheap to cover; the share codec already had `npm run
check:share`.

**Fix:** added `scripts/check-reducers.mjs` (`npm run check:reducers`, 54
assertions), covering every action in both reducers — field updates,
skill/array-item add/remove/duplicate/move with visibility-map bookkeeping,
section reordering, merge/reset/import, unknown-action no-ops, and
`createInitialUiState`. Framework-free, matching `check-share-links.mjs`.

**Note:** pinned down (not "fixed," since it wasn't asked for) a pre-existing
quirk in `TOGGLE_SECTION_VISIBILITY` — toggling a section whose
`sectionVisibility` map is completely missing negates the raw (absent) value
instead of the merged default, always landing on `true`. Harmless today only
because every section defaults to visible.

---

### 11. Three dependency vulnerabilities, one of them in the PDF export path

**Severity:** high — `dompurify` (patched to `<=3.4.12`, then vulnerable) is
not a direct dependency but ships inside the production PDF export bundle:
`jspdf` → `canvg` → `dompurify`, sanitizing SVG content during `html2canvas`
rendering. The disclosed issue lets an `IN_PLACE` hook removal leave a
detached subtree executable, causing XSS
([GHSA-55q2-fjhq-7xh7](https://github.com/advisories/GHSA-55q2-fjhq-7xh7)).
The other two (`brace-expansion`, a DoS via unbounded intermediate arrays;
`nanoid`, an infinite loop on a zero-size custom generator) are dev-tooling
transitive dependencies (ESLint/Vite chain), not shipped to users, but still
worth clearing.

Found incidentally while adding `@playwright/test` (finding below) — `npm
install` surfaces `npm audit` results, and these three were already present
before that install, not introduced by it.

**Fix:** `npm audit fix`. All three resolved to non-vulnerable versions with
no dependency-tree changes requiring a breaking-version bump; `dompurify`
landed on `3.4.13`.

**Verified:** `npm audit` reports 0 vulnerabilities; `npm run lint`, `npm run
build`, and both regression-check scripts still pass after the update.

---

## Enhancements added beyond the original findings

Not defects — functionality added while addressing the findings above.

- **Every section is individually collapsible**, not just the utility
  panels — see finding 2. `PanelSection` owns its own toggle; nothing else in
  the app needs to read or control that state.
- **Sections are now template-aware end to end** — see finding 5. The
  "Visible sections" panel already filtered by template; the form and nav
  rail now match it.

---

## Deliberate behaviours, not defects

### Visible section numbers can skip again

A template that doesn't support a given section (e.g. Minimalist has no
"Core Strengths") correctly omits it, which means the visible sequence can
jump from 04 to 06. This looks identical to the bug the 1.0.0-era CHANGELOG
recorded as fixed ("section numbering skipped from 05 to 07"), but the cause
is different and, this time, intentional: the numbers are stable per-section
labels, not a resequenced display counter, and a template genuinely not
rendering a section means that section correctly does not appear. Not a
regression of the earlier fix.

---

## Verification results

- `npm run lint` — clean.
- `npm run build` — succeeds. The >500KB chunk warning is the lazily loaded
  PDF vendor bundle, same as in the 1.0.0 audit and expected.
- `npm run check:reducers` — 54/54 pass.
- `npm run check:share` — 15/15 pass (untouched by this pass; run to confirm
  no regression).
- `npm run test:e2e` — 10/10 pass, twice in a row (checked for flakiness).
  Runs against `npm run build` + `npm run preview`, not the dev server, so
  the lazy-loaded `CVPreview` chunk, the manual vendor chunking, and the idle
  PDF-bundle prefetch are exercised the way a real user hits them.
- `npm audit` — 0 vulnerabilities (was 3; see finding 11).
- Live behaviour, confirmed interactively in Chrome: template gallery shows
  10 distinct real previews; the editor opens on Section 01 with all utility
  panels collapsed; nav-rail order matches the form's actual scroll order for
  all 10 mapped sections; toggling a section's visibility updates its count
  live; switching templates (tested Minimalist → Developer) shows/hides
  matching sections in the nav rail, the form, and the preview in the same
  pass; the landing page renders correctly in English and Finnish with a real
  CV preview image; the Export dropdown opens, lists PDF/HTML/JSON, and closes
  on outside click; the Creative and Developer templates — the two showcases
  most affected by the `index.css` dead-rule removal below — render fully
  populated demo data with no missing styling.

---

## Follow-up: the four limitations above, now closed

All four items this document previously carried as open limitations were
addressed in a second pass the same day, as part of getting 1.0.1 ready to
tag. Recorded here rather than silently deleted, so the "known limitations"
pattern this document (and `audit-1.0.0.md` before it) uses stays honest
about what was actually outstanding at each point in time.

- **`src/index.css` dead-code cleanup.** 8,097 → 7,876 lines (221 removed).
  Not a rewrite — a verified-unused pass: every top-level class selector was
  checked against all `.jsx`/`.js` source with a script, filtering out false
  positives from dynamically built class names (e.g.
  `` `dev-showcase__chip--${color}` ``) before removing anything. Confirmed
  dead: `.preview-action-bar*` (superseded by `.preview-zoom-bar*`, never
  updated when that rename happened), `.project-header__heading/__left`
  (from a pre-logo header layout), `.site-footer__link/__sep` (from a
  multi-segment footer since simplified to one line), `.brand-mark*`,
  `.ds-title`, `.ds-display`, `.ds-caption`, `.stack-4`, `.stack-6`,
  `.surface-shadow`, `.page-shadow`, `.action-button--primary`,
  `.dev-showcase__tagline`, and the `.creative-showcase__quickfact*`/
  `__edu-desc` cluster — plus 3 CSS custom properties left orphaned once
  their only consumer rules were gone. Verified with a full build and a
  visual pass over the Creative and Developer templates (the two showcases
  the removed rules mostly belonged to).
- **`public/PortifyCV.png` optimization.** Same treatment `PortifyCV2.jpg`
  already got: re-encoded to an 85%-quality JPEG, renamed to
  `PortifyCV.jpg`. 772KB → 76KB (90% smaller), no visible quality loss at
  the sizes it's actually displayed (a 60px header mark, a social-preview
  card). All references updated: `index.html` (`og:image`/`twitter:image`),
  `App.jsx`, `README.md`.
- **CI pipeline added.** `.github/workflows/ci.yml`, two jobs on push to
  `main` and on every PR: `checks` (lint, build, both regression scripts)
  and `e2e` (Playwright, see below), with the HTML report uploaded as an
  artifact on failure.
- **Automated UI/e2e smoke coverage added.** `@playwright/test`, 10 tests
  across 4 spec files in `e2e/`, run with `npm run test:e2e` against a real
  production build: the landing page's hero and CTA; typing into a field
  live-updating the preview; loading/resetting the demo CV; the Export menu
  listing PDF/HTML/JSON, closing on outside click, and actually downloading
  a `.json`/`.html` file; and — the highest-value case, since it's a direct
  regression guard for finding 5 — switching templates showing and hiding
  the matching nav-rail entries and form sections. This does not replace
  manual verification for template *rendering* correctness (all 10 visual
  layouts, ATS scoring nuance) or PDF export specifically (skipped as
  higher-risk/slower for a smoke suite — canvas rendering plus a Web
  Worker); it closes the gap for the app's core interaction paths breaking
  silently.

---

## Release readiness

**9.5/10 — every finding closed, verified, and covered going forward; the
only thing left is to commit it.**

This score has moved twice in one document, which is worth being explicit
about rather than just editing the number in place:

- **7.5/10** (first draft): the product was fixed and verified, but the
  fixes existed only in a dirty working tree — uncommitted, with two
  unexplained file deletions and an untracked directory that had to stay out
  of any release commit.
- **8.5/10** (second draft): release mechanics resolved — five commits on
  `improve/ui-backlog`, one per finding-cluster, `graphify-out/` correctly
  never staged — but the "Known limitations" section above still listed four
  open items: `index.css`'s size, an unoptimized logo asset, no CI, no
  automated UI coverage.
- **9.5/10** (this pass): all four of those are closed — see "Follow-up"
  above — plus one more finding (11) neither draft anticipated: three
  dependency vulnerabilities, one of them (`dompurify`) in the actual PDF
  export path, found incidentally and fixed with `npm audit fix`.

The half-point held back is procedural, not a defect: this pass's fixes
(the PortifyCV.png swap, the `index.css` cleanup, `.github/workflows/ci.yml`,
`e2e/`, and the `npm audit fix`) are verified in the working tree but not
yet committed. Once they land as commits the same way the previous round
did, there is nothing left on this document's list, known or found, blocking
a 1.0.1 tag.
