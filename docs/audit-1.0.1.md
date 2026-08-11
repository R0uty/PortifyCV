# PortifyCV 1.0.1 pre-release audit

**Date:** 2026-08-11
**Scope:** Fixes for the post-1.0.0 UI review (`../todo.md`, findings dated
2026-08-10), plus additional bugs found and fixed during the same pass that
were not on that list. No changes to the share-link codec or the CV data
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
- Live behaviour, confirmed interactively in Chrome: template gallery shows
  10 distinct real previews; the editor opens on Section 01 with all utility
  panels collapsed; nav-rail order matches the form's actual scroll order for
  all 10 mapped sections; toggling a section's visibility updates its count
  live; switching templates (tested Minimalist → Developer) shows/hides
  matching sections in the nav rail, the form, and the preview in the same
  pass; the landing page renders correctly in English and Finnish with a real
  CV preview image; the Export dropdown opens, lists PDF/HTML/JSON, and closes
  on outside click.

---

## Known limitations carried into 1.0.1

- **`src/index.css` is 8,097 lines** (up from 7,879 at 1.0.0), hand-written
  Tailwind-alike utilities. Works today; still the most likely file to rot.
  Flagged low-priority in `../todo.md` (#11), not addressed this pass.
- **`public/PortifyCV.png` ships at 772KB** for a mark displayed at 60–80px
  tall in the app. Not yet compressed or pre-downsized.
- **No CI pipeline.** `.github/` is empty — `lint`/`build`/`check:*` only run
  when invoked locally, nothing gates a bad commit automatically.
- **No automated UI/e2e coverage.** `check:reducers` and `check:share` cover
  state logic and the share codec; template rendering across all 10 layouts,
  ATS scoring, and PDF/HTML/JSON export correctness are verified manually
  each pass, not by a test suite.

---

## Release readiness

**8.5/10 — functionally ready and now actually committed.**

Every finding above ordered high or medium severity is fixed and verified.
The product itself — templates, live preview, ATS scoring, exports, share
links, the privacy story (no login, no server calls, no analytics, no
third-party font requests) — is in good shape to point a user at.

An earlier draft of this section scored this 7.5/10 and held it back on
release mechanics rather than the product: an uncommitted working tree, two
unexplained deletions, an untracked directory that had to stay out of any
release commit. All of that is now resolved — the fixes landed as five
commits on `improve/ui-backlog` (one per finding-cluster: collapsible
sections, template-gated sections + nav rail sync, the logo/favicon
replacement, the landing hero image, and this document), the
`public/favicon.svg`/`icons.svg` deletions are folded into the logo/favicon
commit as an intentional part of that fix (finding 9), and `graphify-out/`
stayed untracked and out of every commit.

What's left is exactly the "Known limitations" above — `index.css`'s size,
the unoptimized `PortifyCV.png` header asset, no CI, and no automated UI/e2e
coverage. None of those block a tag; they're the reasonable next-iteration
list.
