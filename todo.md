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

- [x] **2. The editor buries the form under 2,751px of preamble.** — done 2026-08-10,
      completed 2026-08-11. Quick import, Export mode, ATS score, and Smart suggestions
      sit in a collapsed `<details>` whose summary keeps the ATS score and suggestion
      count visible. `PanelSection` (`src/components/PanelSection.jsx`) — the wrapper
      every numbered CV section (00 through 20) is built on — now owns its own
      collapse/expand toggle (a chevron button, self-contained `useState`, same
      grid-row collapse animation as `SortableItemCard`'s per-entry collapse), so every
      section is individually foldable, not just the utility panels. "Section 00 —
      Visible sections" defaults collapsed (`defaultCollapsed` prop) with its X/Y
      visible count moved into the existing `badge` slot; every other section defaults
      open, matching prior behavior. Preamble 2,751px → 779px, so the first form field
      (Section 01) is on the opening screen. Nav-rail scrolling still lands correctly
      whether the target section is expanded or collapsed.

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
- [x] **11. `src/index.css` is 7,879 lines / 135KB** (21KB gz) of hand-written
      Tailwind-alike utilities. Works today; most likely file to rot. Low priority.
      — done 2026-08-14. Pure reorganization, no behavior change: split into
      `src/styles/tokens.css` (`:root` vars + base element reset),
      `src/styles/app-shell.css` (shared chrome — form fields, modals,
      toolbar, nav rail, landing page, etc.), `src/styles/utilities.css`
      (the Tailwind-alike atomic class layer, used by the app shell and by
      the Minimalist/Tech Executive templates, which render through the
      generic `CVPreview` path rather than a bespoke Showcase), and one file
      per bespoke template under `src/styles/templates/` (developer,
      creative, modern, executive, timeline, graduate, compact, portfolio —
      the 8 templates with their own `*Showcase.jsx`). `src/index.css` is now
      an 18-line list of `@import`s in the original cascade order. Verified
      byte-for-byte identical output: building from the pre-split file and
      the post-split files produced the exact same content hash
      (`index-CJ4KOjpo.css`) for the bundled CSS. `npm run lint`,
      `check:share`, `check:reducers`, and `npm run build` all pass;
      spot-checked the landing page, builder (Minimalist), and Developer
      Showcase in a real browser post-split.

## Backlog — 2026-08-14

Brainstormed candidates for the next pass, not yet verified against the running
app (unlike the numbered findings above, which came from an interactive
walkthrough — these are ideas to investigate, not confirmed defects). Priority
call from the same session: **templates visual polish first**, everything else
after.

### Priority: templates visual polish

- [x] **12. Audit how visually distinct the 10 templates actually are
      side-by-side.** — audited 2026-08-14 against the running dev server with
      the demo CV loaded; Executive/Graduate part fixed same day.
      **Confirmed real:** Modern Professional, Executive, Timeline, and
      Graduate all read as pale-blue-on-white at a glance in the gallery. Root
      cause, found by reading `ExecutiveShowcase.jsx`'s CSS (`.executive-showcase__*`
      in `index.css`), not just its JSX (an earlier pass of this same audit
      wrongly concluded the component was "grayscale except a gold Awards
      icon" — that was a false negative from grepping the JSX file only;
      colors there are pulled from CSS custom properties, not literal
      Tailwind-alike classes, so the grep found nothing): `--ex-indigo:
      #4338ca` was used for the role text, section icons, contact icons,
      metrics, tags, project text, and link icons — i.e. Executive's *entire*
      accent system, not just a stray value — and that indigo is the same hue
      family Graduate uses for its own accent. Gold (`--ex-gold`) really was
      real but confined to one trophy icon and one bullet dot in Awards, per
      an explicit design spec quoted in the file's own header comment ("Gold
      should only be used for subtle highlights").
      **Fixed:** retired `--ex-indigo` entirely, replaced its 10 usages with
      `--ex-gold` (recolored from `#c9a227` to `#b45309` — the original value
      was ~2.4:1 contrast on white, failing WCAG AA for text; `#b45309` clears
      ~5:1). `executive.js`'s ATS-mode config (`accentColor`, `sectionTitle`,
      `skillTag`, etc.) swapped from `indigo` to `amber` Tailwind classes to
      match. Removed the now-redundant `tone="gold"` prop plumbing in
      `ExecutiveShowcase.jsx` (every section icon is gold now, not just
      Awards, so the conditional class was dead code). Verified in-browser:
      Executive's tags/icons/metrics now read warm gold/bronze, clearly
      distinct from Graduate's indigo/purple, confirmed side-by-side in the
      template gallery thumbnails. `npm run lint` and `npm run build` both
      pass.
      **Still open, not addressed this pass:** `modern` and `techExec` both
      key off blue (`#2563eb`) — lower-priority than the Executive/Graduate
      pair since techExec also carries a distinct deep-navy identity
      (heading, footer band) that Modern doesn't have, so they may already
      read as distinct enough; wasn't verified in-browser. Also unaddressed:
      Modern's and Timeline's header *name* text both render in a plain dark
      neutral (`--ms-navy` / `--tl-slate`) regardless of the template's accent
      hue — only the smaller role/subtitle text picks up color — which is a
      more structural, cross-template pattern than the Executive/Graduate fix
      and would need its own follow-up if the gallery still feels
      insufficiently distinct after this fix.
- [x] **13. `creative` template's description promises "one accent colour you
      can change"** — checked 2026-08-14: false, no such control exists. The
      Settings modal (`ResumeBuilderPage.jsx`) has exactly two controls —
      "ATS-friendly mode" toggle and "Section order & visibility" — no color
      picker anywhere in Settings, the template gallery, or per-template. Each
      template's `accentColor()` (in its own `src/components/templates/*.js`
      config, e.g. `creative.js`: `{ light: 'violet', dark: 'violet' }`) is a
      hardcoded single value, consumed by `CVPreview.jsx` for ATS-friendly
      mode's flattened rendering — not exposed to the user at all. **Fixed
      2026-08-14**, alongside the item 12b description rewrite below: the
      copy now names the actual fixed color ("a violet accent") instead of
      claiming it's changeable.

Separately, 2026-08-14: rewrote all 10 templates' descriptions (EN + FI,
`cvTemplates.js`) to drop "For CEOs/CTOs/VPs", "For software engineers,
DevOps...", "For students, graduates..." style job-title gatekeeping — user
feedback was that PortifyCV is for everyone, no template should read as
off-limits based on job title. Descriptions now describe layout/content fit
("a strong fit if your work is naturally project-based") instead of
profession. Template *names* (Developer, Tech Executive, etc.) were
deliberately left unchanged — user chose description-only scope over a full
rename pass.
- [x] **14. Typography variety across templates.** — audited and fixed
      2026-08-14, verified in-browser with Playwright against the running
      dev server (demo CV, all 10 templates screenshotted and diffed).
      **Found a real bug, not just a style gap:** 8 of the 10 templates'
      `*Showcase.jsx` components (Compact, Creative, Developer, Executive,
      Graduate, Modern, Portfolio, Timeline) had their showcase-root CSS
      rule (`.dev-showcase`, `.creative-showcase`, etc. in `index.css`)
      hardcoded to `font-family: ui-sans-serif, system-ui, -apple-system,
      "Segoe UI", sans-serif` — a generic system-font stack with no mention
      of Inter at all. This predates item 9 (self-hosting Inter): it was
      written when the Showcase components were first added, and never
      updated afterward. Confirmed via `getComputedStyle(...).fontFamily`
      in a headless browser: `Minimalist` and `Tech Executive` (the two
      templates that render through the generic `CVPreview` path, not a
      bespoke Showcase) correctly resolved to `"Inter Variable", "Inter
      var", Inter, ...`; `Executive` and `Modern Professional` resolved to
      the bare system stack with no Inter reference whatsoever. So 8 of 10
      templates were silently never using the self-hosted font item 9
      shipped — falling back to whatever sans the OS provides (San
      Francisco, Segoe UI, Roboto, DejaVu Sans on this Linux box), varying
      by platform in a way the app's "everything is self-contained" story
      doesn't intend. **Fixed:** all 8 rules changed to `font-family:
      var(--font-sans)`, matching the one other template family and the
      rest of the app. Verified post-fix: all 10 templates now resolve to
      the same Inter Variable stack.
      **Then addressed the actual "same voice" question:** with the font
      bug fixed, compared each template's section-title and name-heading
      CSS. Two families of literal duplication turned up:
      Executive/Graduate/Modern shared byte-for-byte identical
      section-title styling (`0.6875rem / 700 / uppercase / 0.16em`
      tracking) despite stated personas of "restrained boardroom"
      (executive) vs. approachable/energetic (graduate) vs. plain
      professional (modern); Graduate and Modern also shared an identical
      name-heading (`2.875rem / 700 / -0.01em`). Differentiated within the
      existing single-typeface constraint (Inter only, per item 9 — no new
      font files):
      Executive's section-title now `600 / 0.22em` tracking (quieter,
      more formally spaced — restraint over volume); Graduate's now
      `700 / 0.7rem / 0.09em` (tighter, less severe) and its name heading
      `800 / letter-spacing 0` (open, warmer, more confident than tight
      negative tracking); Modern kept as the unchanged baseline
      (`700 / 0.16em`, name `700 / -0.01em`) since nothing in its brief
      calls for a strong voice. Creative and Portfolio also share a
      typographic pattern (sentence-case section titles + small italic
      subtitle line) but were left alone — their layouts, card treatments,
      and color systems already read as clearly distinct in the gallery,
      unlike the Executive/Graduate/Modern trio which looked like the same
      template recolored. Developer, Timeline, and Compact were confirmed
      already structurally distinct (dark sidebar + gradient name; literal
      timeline with dots; dense single-column) and untouched.
      `npm run lint` and `npm run build` both pass.
- [x] **15. Photo/avatar treatment.** — audited 2026-08-14. Checked all 10
      templates' photo configs (`src/components/templates/*.js`) and their
      rendered CSS in `src/styles/`.
      **Confirmed real, fixed:** the PDF export's text-based fallback
      (`drawFallbackHeader` in `exporters.js`, used when `html2canvas`
      produces a blank canvas or hits an unsupported-color error) drew the
      profile photo straight into `jsPDF`'s `addImage(data, format, x, y,
      21, 21)`. `addImage` stretches the source to exactly fill the given
      box — it does not crop. Every other rendering surface (on-screen
      preview, HTML export, the normal `html2canvas`-based PDF) instead uses
      CSS `object-fit: cover`, which center-crops. There is no crop step on
      upload (`buildProfilePhotoDataUrl` in `CVForm.jsx` only downscales,
      preserving the original aspect ratio), so any non-square photo — the
      common case — would render visibly squished specifically in this one
      fallback path, while looking correct everywhere else. **Fixed:** added
      `cropPhotoDataUrlToSquare()`, which center-crops the photo to a square
      on an offscreen canvas (matching `object-fit: cover`'s crop
      geometry) before it reaches `addImage`, falling back to the
      uncropped image if cropping fails for any reason (this is already a
      last-resort fallback path — it should degrade, not throw). Verified
      the crop math directly in a real browser: a synthetic 400×200 image
      with red/lime strips outside the center 200×200 window cropped to
      exactly that 200×200 center region, confirming a true center-crop
      rather than a full-image squish.
      **Checked and left alone:** sizes vary by template (5.75rem Compact up
      to 8.75rem Executive/Creative) and border treatments vary (thin
      accent-color rings, gradient rings, glow shadows) — read as
      intentional per-template variety, not inconsistency, and every
      description that specifically names the photo shape (`modern`'s
      "circular photo") matches what's actually rendered. `creative`'s photo
      is a rounded square (`border-radius: 28px`) while every other
      template with a bespoke Showcase renders a full circle (`9999px`) —
      flagged but *not* changed: Creative's own CSS deliberately uses
      moderate rounded corners everywhere (cards, tags, sidebar) as part of
      its "magazine-style" identity, unlike the app's normal sharp-corner
      utility layer, so the squarer photo reads as consistent with that
      template's own visual language rather than a copy-paste miss — same
      judgment call as leaving Creative/Portfolio's shared typographic
      pattern alone in item 14. Worth a second look only if the gallery
      still feels like Creative doesn't fit once other items land.
      `npm run lint`, `npm run build`, `check:share`, and `check:reducers`
      all pass.
- [ ] **16. Two-column (`split`) template balance.** 7 of 10 templates use
      `layout: 'split'` with a `primarySections`/`secondarySections` divide —
      worth a pass checking sidebar-vs-main visual weight doesn't look
      lopsided when a user fills in only a few of the secondary sections
      (sparse sidebar next to a dense main column), similar in spirit to the
      Executive Achievements-placement bug already fixed this session
      (commit `d496499`).
- [ ] **17. PDF export fidelity vs on-screen preview**, template by template —
      spacing, color, and font-weight can drift between the live `CVPreview`
      render and the `html2canvas`-captured PDF; worth a visual diff pass now
      that PDF export quality work just landed (commit `0ddc644`).

### Other ideas (lower priority than the above)

- [ ] **18. Extend `cvFeedback.js`'s rule-based suggestions** — action-verb
      detection, weak-phrase flagging ("responsible for" → suggest
      impact-framing), a single per-template readiness % instead of scattered
      tips.
- [ ] **19. ATS keyword match breakdown** — show matched/missing keywords
      explicitly instead of just a score.
- [ ] **20. Cover letter generator** reusing the same CV data, keeping the
      no-server privacy story intact.
- [ ] **21. Lean harder into the privacy differentiator on the landing page**
      ("nothing ever touches a server" vs. account-required competitors) —
      currently a footer trust line, could be a stronger primary hook.
- [ ] **22. Shareable/embeddable "made with PortifyCV" badge** off the
      template gallery, for organic growth.
- [ ] **23. Lock the new Playwright e2e suite into branch protection** now
      that it's in CI (`.github/workflows/ci.yml`), so it actually gates
      merges rather than just running.
- [ ] **24. Optional session-only "restore last session" via `sessionStorage`**
      — reduces accidental-refresh data loss without breaking the "nothing
      persists once the tab closes" promise (would need explicit opt-in
      copy so it doesn't quietly contradict that claim).
- [ ] **25. Per-template code-splitting** — only one template renders at a
      time; lazy-loading each `*Showcase.jsx` could trim the initial bundle
      further now that the PDF libs are already lazy.

## Checked and fine — don't re-investigate

- Responsive layout is handled (breakpoints at 1023 / 860 / 560px).
- The builder's three-pane layout, live preview, and zoom controls read well.
