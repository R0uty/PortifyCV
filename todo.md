# PortifyCV — improvement backlog

Findings from a UI review of the running app on 2026-08-10, after the 1.0.0 audit
(`docs/audit-1.0.0.md`). Ordered by impact. Evidence is from the running app, not
from reading code.

## High impact

- [x] **1. Template gallery doesn't show the templates.** — done 2026-08-10.
      Thumbnails now render a real scaled `CVPreview` of the user's own CV (falling back
      to the demo CV when empty), trimmed to what survives thumbnail size (~238 DOM nodes
      each). Descriptions cut to one line in both locales, dropping the "two visual modes /
      ATS layout" preamble that opened seven of the ten — ATS mode is a global toggle, not
      a per-template feature.
      All 10 cards render the same abstract skeleton (`template-gallery__thumb-line`),
      differing only in whether a line is `w-10/12` or `w-11/12`. Users pick a layout by
      reading a 5–6 line paragraph instead of seeing it. The fix is already in the repo:
      eight `src/components/templates/*Showcase.jsx` components render real styled
      layouts for `CVPreview`. Render each scaled down as its own thumbnail, then cut the
      descriptions to one line each.

- [x] **2. The editor buries the form under 2,751px of preamble.** — done 2026-08-10.
      Quick import, Export mode, ATS score, and Smart suggestions now sit in a collapsed
      `<details>` whose summary keeps the ATS score and suggestion count visible.
      Preamble 2,751px → 779px (0.79 viewport), so the first form field is on the opening
      screen. Nav-rail scrolling still lands at offset 0 with the disclosure collapsed.
      Not done: "Section 00 — Visible sections" still precedes Section 01. Collapsing it
      too would cut the preamble to roughly 200px, but it is genuinely part of the form,
      so that is a judgement call left open.
      2.6 viewport heights of Quick import → Export mode → ATS score → Smart suggestions →
      Section 00 sit above `#section-personal`, while the nav rail highlights "Personal
      Information" as active. A first run opens on import tooling and an ATS score for a
      CV the user hasn't written. Move the utility panels behind a collapsed
      "Import & tools" disclosure (or into the Settings modal) and open on Section 01.

- [x] **3. Landing page is a wireframe.** — done 2026-08-11. Rebuilt as a two-column
      hero: headline/subtitle/CTA on the left, a real scaled `CVPreview` (Minimalist
      template, demo data) on the right — an actual picture of the output, not a
      mockup. Added a four-line highlight list naming the ten templates, live
      preview, ATS scoring, and PDF/HTML/JSON export, closing the "names none of
      the features" gap. Stacks to one column under 1023px (existing breakpoint).
      `CVPreview` is lazy-loaded (`React.lazy` + `Suspense`) so the landing page's
      critical-path bundle stays at its original ~14KB gzip; the preview's ~29KB gzip
      chunk loads async and is shared with the builder view, so it isn't
      re-downloaded on "Start building". Also deleted dead CSS (`.landing-controls`,
      `.landing-logo`, the empty `.landing-features { display: none; }`) left over
      from an earlier design, and repurposed the already-unused `.landing-kicker`
      class for the new eyebrow label instead of adding a new one.

## Smaller visual fixes

- [x] **4. "NO LOGIN. NO DATA SAVED." appears three times** — done 2026-08-11.
      Removed the landing hero's inline trust line (`LandingPage.jsx`); the sticky
      `SiteFooter` (`App.jsx`) already renders the same line on every view — landing
      and builder alike — so it stays as the one, persistently-visible copy instead of
      three.
- [x] **5. "NOTHING SAVED ANYWHERE" is styled like a button** — done 2026-08-11.
      Was a plain `<div>` sharing the buttons' bold/uppercase/tracked text styling and
      box padding, so it read as a third action beside `LOAD DEMO CV` / `RESET FORM`.
      Added `.editor-status-pill` (rounded, normal-case, a `currentColor` dot prefix,
      `role="status"`) so it now reads as a status indicator, not a clickable control.
- [x] **6. "Load demo CV" appears twice on one screen** — done 2026-08-11. Removed the
      duplicate button inside the (collapsed-by-default) Quick Import card; the
      always-visible top action row keeps the one instance.
- [x] **7. `HTML` / `JSON` are bare text buttons in an icon toolbar** — done 2026-08-11.
      Collapsed the desktop toolbar's separate PDF/HTML/JSON buttons into a single
      "Export" button (`app-toolbar__primary` + chevron) that opens a small dropdown
      menu listing PDF / HTML / JSON, closing on outside click or Escape. The mobile
      bottom action bar (`ResumeBuilderPage.jsx`, `lg:hidden`) already renders all four
      export/share actions with uniform text-button styling — no icon-vs-text seam
      there — so it was left as-is.

## Non-visual

- [x] **8. First export stalls on a large download.** — done 2026-08-10.
      `ResumeBuilderPage` now warms the PDF export bundle on a `requestIdleCallback`
      (falling back to a 2s `setTimeout` where unsupported) shortly after mount:
      `prefetchPdfExportAssets()` in `src/utils/exporters.js` triggers the existing
      `html2canvas`/`jsPDF` dynamic imports and spins up (and deliberately never
      terminates) a throwaway instance of the PDF export worker, so its script fetch —
      including its own nested `import { jsPDF } from 'jspdf'` — runs to completion in
      the background. Verified in a built preview: `vendor-pdf` and `pdfExportWorker`
      both finish downloading (174KB / 238KB gz) within ~4s of the builder mounting,
      well before any export click, with no change to first paint.
      `vendor-pdf` is 602KB (~177KB gz) and `pdfExportWorker` 794KB. Both lazy-load
      correctly so first paint is unaffected, but the first export pays the cost.
      Prefetch on builder idle.
- [x] **9. Self-host Inter.** — done 2026-08-10. Replaced the Google Fonts `<link>`/
      preconnect tags in `index.html` with the `@fontsource-variable/inter` package,
      imported once in `src/main.jsx`. Vite bundles the variable-font `woff2` files
      (split by unicode range, same as Google's own subsetting) as hashed same-origin
      assets, so only the subset the active locale actually uses downloads. Verified
      via network capture on a built preview: zero requests to `fonts.googleapis.com`
      or `fonts.gstatic.com`, only `inter-latin-wght-normal-*.woff2` from `/assets/`.
      Google Fonts was the app's only third-party request — no CV data involved, but
      it's the one thing contradicting "everything runs in your browser". Removes a
      network round-trip too.
- [x] **10. Add tests for the reducers.** — done 2026-08-10. Added
      `scripts/check-reducers.mjs` (`npm run check:reducers`), covering every action
      in `cvFormReducer` and `uiReducer` — field updates, skill/array-item add/remove/
      duplicate/move with visibility-map bookkeeping, section reordering, merge/reset/
      import, and unknown-action no-ops — plus `createInitialUiState`. Framework-free,
      matching the existing `check-share-links.mjs` pattern. Along the way it pinned
      down (rather than "fixed", since it wasn't asked for) a pre-existing quirk in
      `TOGGLE_SECTION_VISIBILITY`: toggling a section whose `sectionVisibility` map is
      completely missing negates the raw (absent) value instead of the merged default,
      so it always lands on `true` regardless of that section's real default —
      harmless today only because every section defaults to visible.
      `cvFormReducer` and `uiReducer` are pure functions and cheap to cover. The share
      codec already has `npm run check:share`.
- [ ] **11. `src/index.css` is 7,879 lines / 135KB** (21KB gz) of hand-written
      Tailwind-alike utilities. Works today; most likely file to rot. Low priority.

## Checked and fine — don't re-investigate

- Responsive layout is handled (breakpoints at 1023 / 860 / 560px).
- The builder's three-pane layout, live preview, and zoom controls read well.
