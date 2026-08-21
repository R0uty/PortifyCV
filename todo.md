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
- [x] **16. Two-column (`split`) template balance.** — audited 2026-08-14.
      8 of 10 templates use `layout: 'split'` (not 7 — recount while
      auditing: developer, creative, modern, executive, timeline, graduate,
      portfolio, techExec). Built a synthetic CV via a hand-encoded share
      link — dense main-column content (3 experience entries, 2 education,
      3 projects, plus achievements/leadership/openSource/publications/
      volunteering/internships/caseStudies/testimonials/speaking so every
      template's primary-section mix is exercised) paired with deliberately
      sparse secondary sections (2-8 skills, 0 certificates, 1 language, 1
      link, 0 interests) — and screenshotted all 8 in a real browser.
      **Confirmed real, not fixed (inherent to design, no safe fix
      identified):** every split template's sidebar is visibly shorter than
      its main column under sparse-secondary conditions, ranging from
      Tech Executive (~1.25x, best balanced — its primary list is only 4
      sections) to Timeline (~4x, worst — sidebar ends after ~600px while
      the single continuous main timeline, which absorbs 9 possible section
      types, runs to ~2460px, leaving a long bare-page gutter beside it).
      This tracks section-count ratio between each template's
      `primarySections`/`secondarySections`, not a rendering defect: no
      sidebar is stretched, clipped, or given an empty styled box — it
      simply ends where its content ends, which is the more honest choice
      versus padding a section with nothing in it. Timeline is the standout
      case worth a second look if real user CVs show the same gap, but
      there's no fix here that doesn't fight the template's own concept (a
      long unified timeline paired with a compact reference sidebar).
      Checked for a repeat of the Executive Achievements bug (a section
      hardcoded into the wrong column, commit `d496499`) specifically:
      confirmed clean across all 7 bespoke split Showcases — each derives
      `mainSectionKeys`/`sidebarSectionKeys` from
      `templateConfig.primarySections`/`secondarySections` via `Set`
      membership, no hardcoded lists remain anywhere.
      **Found and fixed a real, unrelated bug along the way:** Tech
      Executive's sparse sidebar surfaced a stray bullet point in front of
      the Certificates section's empty-state text ("• Certificates will
      appear here.") that doesn't appear on any of the other 14 empty-state
      placeholders in `CVPreview.jsx` (the generic path used by Minimalist,
      Tech Executive, and every template in ATS mode). Root cause:
      certificates was the only section whose empty-state placeholder was
      still a bare `<li className="text-sm text-gray-500">` nested in a
      `<ul>`, left over from being adapted from the populated-item markup —
      every other section's placeholder is a plain `<p>`. Populated
      `<li>` rows suppress the browser's native list marker because their
      class sets `display: flex`; this one bare `<li>` doesn't, so the UA
      stylesheet's default disc marker rendered for just that one row.
      Fixed by only rendering the `<ul>` when `certificates.length > 0` and
      rendering the placeholder as a sibling `<p>`, matching every other
      section's pattern (and better accessibility too — assistive tech no
      longer announces "list, 1 item" for an empty section).
      `npm run lint`, `npm run build`, `check:share`, and `check:reducers`
      all pass; the fix was verified by re-screenshotting Tech Executive
      before/after.
- [x] **17. PDF export fidelity vs on-screen preview.** — audited and fixed
      2026-08-14. Loaded the demo CV, exported real PDFs (`html2canvas` →
      `jsPDF`, not the text fallback) for Minimalist, Developer, Executive,
      and Modern Professional, rendered the PDF pages back to images with
      PyMuPDF, and diffed them against screenshots of the live preview for
      the same templates.
      **Found and fixed a real, structural bug, not just a style nit:** the
      Minimalist export dropped the "JAN 2022 - PRESENT" date from its
      on-screen position (top-right, inline with the job title) onto its
      own line below the skill tags — a genuine layout reflow, not a minor
      spacing drift. Root cause: `createExportSandbox` sizes the capture
      clone to the live preview pane's actual width (`previewWidthPx` —
      only ~616px at 100% zoom in the split-pane layout, since the pane is
      much narrower than the full browser window), and
      `renderCaptureCanvas` passed that same narrow width as `html2canvas`'s
      `windowWidth`. `html2canvas` uses `windowWidth` as the virtual
      browser-window size it evaluates `@media` queries against before
      cropping to the requested `width`/`height` — so every `sm:`/`md:`/
      `lg:` responsive utility class used across the CV templates (this one
      was `sm:flex-row` on the experience-entry header, `src/components/
      CVPreview.jsx:502`) evaluated against ~616px in the export and
      silently fell back to its mobile/stacked layout, while on screen the
      exact same classes evaluate against the real browser window (almost
      always well over any breakpoint), so the desktop layout held. Same
      root cause would affect any other `sm:`/`md:`/`lg:` usage in any
      template whenever the live preview pane is narrower than that
      breakpoint — this wasn't a one-off, it was systemic.
      **Fixed** by decoupling the two: `windowWidth`/`windowHeight` now use
      `Math.max(captureWidth, window.innerWidth)` (and the height
      equivalent) instead of reusing `captureWidth`/`captureHeight`, so
      `@media` queries evaluate against a window at least as wide as the
      real one the user was looking at, while the crop region
      (`width`/`height`, unchanged) still captures only the clone's actual
      content — this is a standard, documented `html2canvas` pattern for
      exactly this class of problem. Verified in a real browser:
      re-exported all 4 templates post-fix — Minimalist's date is back
      inline; Developer, Executive, and Modern Professional (which weren't
      visibly broken, since their info rows aren't as tight against the
      `sm:` breakpoint) still match the live preview with no regressions.
      Also spot-checked that an ATS-mode export still renders correctly
      (loads, paginates, no blank/corrupted output) — the fix only widens
      the virtual capture window, it doesn't touch `width`/`height` (the
      actual crop dimensions), which ATS mode depends on for its fixed A4
      content width.
      `npm run lint`, `npm run build`, `check:share`, and `check:reducers`
      all pass.

### Other ideas (lower priority than the above)

- [x] **18. Extend `cvFeedback.js`'s rule-based suggestions.** — the
      action-verb and weak-phrase pieces landed 2026-08-14; the "readiness
      %" piece was deliberately not built (see below).
      **Weak-phrase flagging:** a small substring list ("responsible for",
      "was responsible", "duties included/include", "in charge of", "tasked
      with", "worked on", "helped with/to", "assisted with/in") is checked
      across each experience entry's description and every achievement
      bullet. A hit produces one inline tip naming the offending phrase and
      suggesting a swap for a specific outcome ("Reduced...", "Led...",
      "Built...").
      **Action-verb detection:** checks whether the opening word of each
      bullet is on a ~70-word list of common strong resume verbs (Led,
      Built, Reduced, Shipped, ...). The tip only fires when *every* bullet
      in the entry opens weakly — if even one of several bullets already
      opens strongly, the entry isn't flagged, so a single deliberately
      plain description line doesn't get dinged when the achievement list
      right below it is already doing the job.
      Both checks feed into the existing `experienceItemTips[index]` array
      (same place `experience-description-missing` and
      `experience-too-long` already live), so they show up exactly where
      the existing tips do — inline next to the entry in the form, in its
      tip-count badge, and in the "Smart suggestions" panel's priority
      list — with no changes needed to `CVSuggestionsPanel.jsx` or
      `CVForm.jsx`. Verified against the demo CV first (its own copy
      already opens with "Led"/"Partnered"-style verbs and has no weak
      phrases, so it correctly produces zero new tips — confirmed in
      `check:feedback` and by loading it in a real browser), then verified
      the tip actually renders live by typing a deliberately weak
      description into the form and watching the inline tip and badge
      appear.
      Added `scripts/check-cv-feedback.mjs` (`npm run check:feedback`),
      matching the existing `check:share`/`check:reducers` pattern (16
      checks: existing profile/skills/experience rules plus the two new
      ones, including the "at least one strong bullet suppresses the tip"
      case and the "weak phrase and weak opener can both fire on the same
      bullet" case).
      **"A single per-template readiness % instead of scattered tips" —
      deliberately not built.** The app already ships a prominent 0-100
      "ATS Score" ("Parser-readiness overview") in the same collapsed
      panel as these suggestions. A second, differently-computed score
      sitting right next to it risks reading as redundant or contradictory
      ("ATS 78" next to, say, "Readiness 64" — same CV, different numbers,
      no explanation of why) rather than clarifying anything, and replacing
      the detailed per-entry tips with just a score would throw away the
      inline you-are-here pointers) that make the existing panel
      actionable. Whether to add a second score, what it should weigh
      differently from the ATS score, and whether it replaces or
      supplements the tip list are product calls, not implementation
      details — flagging for a real product decision rather than guessing.
      `npm run lint`, `npm run build`, `check:share`, `check:reducers`, and
      the new `check:feedback` all pass.
- [x] **19. ATS keyword match breakdown** — done 2026-08-15. The "Keyword
      density" card in `ATSScorePanel.jsx` (part of the main ATS score, not
      the separate job-description-paste feature below it, which already had
      matched/missing) previously showed only a `7/25`-style score and a
      generic sentence ("Repeat important keywords from your target role...")
      with no way to tell *which* keywords were responsible for the number.
      `scoreKeywordDensity()` in `src/utils/atsScore.js` already computed a
      matched/missing split internally to derive the score but discarded the
      two arrays — now it returns them (`matchedKeywords`/`missingKeywords`),
      threaded through `evaluateAtsScore()`'s `breakdown.keywordDensity`
      unchanged for the other three breakdown items (section completeness,
      length, formatting), which have no keyword concept.
      `ATSScorePanel.jsx` renders them as two chip lists ("Matched keywords" /
      "Missing keywords", capped at 12 each, same chip styling already used
      by the job-description-match section lower in the panel) directly
      under the Keyword density card's summary line, only when at least one
      keyword exists — verified in a real browser with the demo CV loaded
      (Keyword density 7/25: matched `product, designer, design, systems`;
      missing `senior, strategy, user, research, figma, accessibility,
      prototyping, studio, north, atlas, labs`). `npm run lint` and
      `npm run build` both pass.
- [x] **20. Cover letter generator** — done 2026-08-15. Added a new
      "Cover letter" entry to the desktop nav rail (`NAV_UTILITY_ITEMS` in
      `ResumeBuilderPage.jsx`, same tier as Settings/Templates — so, like
      Settings, it's not currently reachable from the mobile bottom action
      bar; that bar was deliberately left alone in item 7 and mobile has
      never had a Settings entry point either, so this isn't a new gap)
      opening a `CoverLetterModal`. The letter body is generated by a new
      `generateCoverLetterDraft()` (`src/utils/coverLetter.js`) — a
      deterministic, paragraph-by-paragraph template filled from the CV's
      own snapshot data (about, most recent experience entry's achievement/
      description, top 6 skills, full name) plus three letter-only fields
      (company, target role — defaults to the CV's own title when left
      blank, hiring manager name). No network call anywhere in the path,
      matching the app's "nothing ever touches a server" story; the letter
      state (`coverLetterCompany/Role/HiringManager/Body`) lives in
      `uiReducer.js` alongside the already-ephemeral `jobDescription` field
      (not persisted, not part of the CV data or share link, same as the
      rest of the app's "nothing saved anywhere" behavior).
      **Considered and rejected: weaving in the JD-keyword-match feature
      already in `ATSScorePanel`.** `analyzeJobDescription()`'s matched
      keywords are single lowercase tokens (≥4 chars, crude stopword
      filter) meant for a "did you use this word" checklist, not prose —
      tried it, and it surfaces fragments like "atlas"/"labs" torn out of
      an employer's own name ("Atlas Labs") and stray verbs, which read as
      broken English/Finnish when spliced into a sentence. Left the letter
      generation scoped to the CV's own clean, user-curated fields instead
      (skills array, experience text) rather than risk visibly bad output;
      flagging keyword-aware phrasing as a real product idea if the JD
      paste feature's extraction ever gets upgraded past single-token
      matching.
      Paragraphs are dropped (not left blank) when their source data is
      missing — no experience entries, no skills, or no company name still
      produces a coherent, ungrammatical-free letter, just a shorter one.
      Localized end-to-end (EN/FI), including Finnish-specific phrasing
      choices to dodge the need to grammatically inflect arbitrary
      user-typed proper nouns: "yrityksessä {Company}" / "yritystänne
      {Company}" appositive constructions instead of guessing a case
      ending, and a space before the `-tehtävää` suffix per Finnish
      orthography for multi-word/foreign terms (`Lead Product Designer
      -tehtävää`, not `Lead Product Designer-tehtävää` — caught and fixed
      after eyeballing the first real Finnish draft in-browser). Export via
      `exportCoverLetterAsText`/`exportCoverLetterAsPdf` (new functions in
      `exporters.js`, dynamically imported inside the click handlers — same
      lazy-loading pattern `handleExport` already uses for the CV's own
      exporters — so the jsPDF-dependent code doesn't join the main bundle)
      plus a clipboard-copy button reusing the existing toast pattern.
      Verified end-to-end in a real browser with the demo CV: generated an
      English draft (company "Northwind Labs", role "Lead Product
      Designer") and confirmed the full text read as a coherent, correctly
      assembled letter; switched locale to Finnish, regenerated, and
      confirmed the Finnish draft (including the `-tehtävää` fix); copy
      and both downloads fired with zero console errors in either locale.
      Added 4 new `check:reducers` cases (one per new UI action).
      `npm run lint`, `npm run build`, `check:share`, `check:reducers`, and
      `check:feedback` all pass.
- [x] **21. Lean harder into the privacy differentiator on the landing page**
      — done 2026-08-15. Before this pass, privacy only showed up as the
      sticky footer trust line and as the third of three equal-weight "Why
      use PortifyCV" cards, titled "Your data stays yours" — nothing about
      it above the fold. (Note for future audits: item 3's write-up above
      describes the hero as a lazy-loaded live `CVPreview`; that was later
      replaced by a static marketing image — see the `.landing-preview`
      comment in `app-shell.css` — so item 3's description is stale
      against the current `LandingPage.jsx`; not touched in this pass.)
      **Changed two things in `LandingPage.jsx`** (`getLandingCopy()`, both
      EN and FI):
      1. Added a new first-position hero highlight bullet — "No account,
         no server — nothing you type ever leaves your browser" — so the
         claim appears above the fold, next to the CTA, not just in a
         footer line a scroll away.
      2. Reordered the "Why use PortifyCV" cards so the privacy card leads
         (was 3rd of 3) and reworded it from the vague "Your data stays
         yours" to "Nothing ever touches a server," explicitly naming the
         comparison the todo item called for: "Unlike CV builders that
         require an account, your data is never uploaded, stored, or seen
         by anyone — because it never leaves your device."
      Left the footer trust line, the FAQ section (already covers data
      storage/privacy in detail at FAQ #2 and #6), and the privacy policy
      page untouched — this was about raising prominence, not adding new
      claims. Verified both locales in a real browser: the new highlight
      bullet and reordered/reworded lead card render correctly in EN and
      FI, including the Finnish elative-case phrasing ("ei koskaan
      lähetetä selaimestasi" — never sent out of your browser).
      `npm run lint` and `npm run build` both pass.
- [x] **22. Shareable/embeddable "made with PortifyCV" badge** — done
      2026-08-15. Added a "Get the badge" CTA row (`.template-gallery__badge-cta`)
      below the grid in `TemplateGalleryModal.jsx` — reachable straight off
      the template gallery, per the todo's own wording — that opens a new
      `BadgeModal.jsx`: a live preview of the badge plus a readonly HTML
      snippet and a copy-to-clipboard button (same clipboard/toast pattern
      already used for the share link and the cover letter draft).
      The snippet itself (`buildPortifyCvBadgeSnippet()` in
      `src/utils/badge.js`) is a single self-contained, inline-styled
      `<a>` tag — no dependency on this app's own CSS classes, since it has
      to survive being pasted onto an arbitrary external site.
      **Deliberately text-only, no logo mark, after actually testing an
      image version:** first pass included a 16×16 `<img>` pointing at the
      app's hosted `/logo-mark.png`. Testing it live (with the dev server
      running and a real browser) showed `naturalWidth`/`naturalHeight: 0`
      — the image never loaded. Traced it to the root cause with `curl -v`:
      `portifycv.app` doesn't resolve to anything yet ("Could not resolve
      host") — the domain used as the canonical origin throughout the app
      (`SITE_ORIGIN` in `App.jsx`, `sitemap.xml`, `robots.txt`, the privacy
      contact email) isn't live. That's a pre-existing fact about the
      project, not something this pass caused, but it meant a badge
      built around that image would ship broken today and stay fragile
      even once the domain launches (external network request on every
      page load of whoever embeds it, one DNS or CDN hiccup away from a
      broken-image icon on someone else's site). The repo also has no SVG
      logo asset to inline instead — only a 512×512 raster PNG, too heavy
      to base64 into a copy-paste snippet. Dropped the image; the badge is
      now a plain black text pill, verified rendering correctly and
      copying successfully in the browser with zero console errors.
      Localized (EN "Made with PortifyCV" / FI "Tehty PortifyCV:llä").
      `npm run lint`, `npm run build`, `check:share`, `check:reducers`, and
      `check:feedback` all pass.
- [ ] **23. Lock the new Playwright e2e suite into branch protection** now
      that it's in CI (`.github/workflows/ci.yml`), so it actually gates
      merges rather than just running.
- [x] **24. Optional session-only "restore last session" via `sessionStorage`**
      — done 2026-08-15. Added a fourth Settings row, off by default:
      "Restore last session." When on, a debounced effect in
      `ResumeBuilderPage.jsx` (same 600ms `HISTORY_COMMIT_DELAY_MS` already
      used for undo-history commits) writes `formData` to
      `sessionStorage` — deliberately `sessionStorage`, not `localStorage`,
      since only the former is guaranteed cleared the moment the tab
      closes, which is what keeps the feature from contradicting "nothing
      persists once you close the tab." `loadInitialCvSession()` checks for
      a saved snapshot on mount (only when the preference is on, and only
      after the existing share-link check, which still always wins) and
      restores it through the same `parseImportedCvData()` validator
      already used for JSON import, so a corrupted or schema-mismatched
      snapshot fails closed into the normal blank/demo behavior instead of
      crashing the app. Turning the toggle back off clears the saved copy
      immediately (`safeSessionStorageRemove`), rather than waiting for tab
      close — explicit revocation, not just eventual expiry. A quota/blocked
      write failure surfaces one toast (not one per keystroke) via a
      `sessionRestoreWarningShownRef` guard, mirroring the existing
      `storageWarningShownRef` pattern for local storage.
      New `safeSessionStorageGet/Set/Remove` helpers added to `cvForm.js`
      alongside the existing `safeStorageGet/Set` (local storage) — same
      shape, different backing store.
      **Copy audit, since this was the todo's own explicit condition for
      doing this at all:** the landing page FAQ and the privacy policy both
      previously made an absolute claim — "only three small preferences,
      none of them your CV" / "your CV content itself is never saved."
      Both would have become quietly false the moment this feature shipped,
      regardless of whether any given user turns it on. Updated both (EN +
      FI): the preference count is now four (adding "whether session
      restore is on"), and a new explicit paragraph/section explains the
      opt-in feature, names `sessionStorage` specifically, and states it's
      cleared on tab close and never transmitted. Bumped the privacy
      policy's effective date (11 → 15 August 2026) since its own "Changes
      to this policy" section promises the date updates when the policy
      does. Left the footer's short "NO LOGIN. NO DATA SAVED." trust line
      as-is — still true for the default (off) state every visitor gets,
      and the longer, precise claims living in the FAQ/privacy policy are
      the ones that needed to stay accurate, not the marketing shorthand.
      Verified end-to-end in a real browser: enabled the toggle, typed a
      name, confirmed `sessionStorage` held it, reloaded the page, and
      confirmed both the restored name and a "Restored your last session"
      toast; toggled off and confirmed the snapshot was gone from
      `sessionStorage` immediately; confirmed the new privacy policy
      section renders. Added 2 new `check:reducers` cases (default-off
      state, toggle-and-reverse). `npm run lint`, `npm run build`,
      `check:share`, `check:reducers`, and `check:feedback` all pass.
- [x] **25. Per-template code-splitting** — done 2026-08-15. All 8 bespoke
      `*Showcase.jsx` imports in `CVPreview.jsx` (Developer, Creative,
      Modern, Executive, Timeline, Graduate, Compact, Portfolio) converted
      from static imports to `React.lazy()`, each delegation wrapped in its
      own `<Suspense fallback={null}>` — `fallback={null}` matches the
      existing precedent for the lazy-loaded `ResumeBuilderPage` itself in
      `App.jsx`, rather than inventing a new loading-skeleton style.
      Measured before/after with `npm run build`: the `ResumeBuilderPage`
      chunk dropped from 365.96 KB / 79.57 KB gzip to 250.77 KB / 64.21 KB
      gzip — each Showcase now its own ~11-16 KB (~3 KB gzip) chunk, split
      out of the bundle every builder session used to pay for regardless of
      which template (if any bespoke one) was actually selected.
      **Prefetch, so this doesn't trade bundle size for a visible loading
      flicker on the common path:** added `prefetchTemplateShowcases()`
      (`src/components/templates/index.js`) — 8 literal (not templated/
      looped, so bundlers can statically analyze and dedupe them against
      React.lazy's own imports) `import()` calls — wired into
      `ResumeBuilderPage.jsx` via a `requestIdleCallback` effect, the exact
      same pattern `prefetchPdfExportAssets()` already established for the
      PDF export bundle (item 8). By the time a user deliberately opens the
      template gallery or switches templates, the chunks are almost always
      already warm.
      Verified in a real browser: opened the gallery immediately after
      page load (worst case for hitting the fallback) — all 10 thumbnails,
      including every bespoke Showcase, rendered fully styled with no blank
      gaps; selected the Developer template and confirmed its full
      dark-sidebar/gradient layout rendered correctly in the live preview;
      zero console errors throughout. `npm run lint`, `npm run build`,
      `check:share`, `check:reducers`, and `check:feedback` all pass.

## Backlog — 2026-08-15, from the 1.0.3 audit

- [x] **26a. Cover letter generator had no mobile entry point** — found and
      fixed during the `audit-1.0.3.md` pass, 2026-08-15. See that doc's
      finding 1 for the full writeup; short version: added a "Cover letter"
      button to the mobile bottom action bar alongside PDF/HTML/JSON/Link,
      since the nav rail (its only previous entry point) is hidden below
      1024px. Verified via DOM query and a passing `test:e2e` run.
- [x] **26b. `check:feedback` wasn't wired into CI** — found and fixed
      during the same audit pass. `.github/workflows/ci.yml`'s `checks` job
      now runs it alongside `check:reducers`/`check:share`.
- [ ] **26. Zero e2e coverage for the six features shipped in the
      2026-08-15 session** (items 19-25: ATS keyword breakdown, cover
      letter generator, badge, session restore, per-template
      code-splitting, plus the landing-page privacy rewrite). Each has
      `check:reducers` coverage for its state transitions and was manually
      verified in a real browser at implementation time, but none has a
      Playwright spec — unlike the core editor/export/landing/template/
      responsive flows in `e2e/`, all of which do. Flagged as a real gap in
      `audit-1.0.3.md`'s "Known limitations," not yet closed. Candidates
      for new specs: cover letter generate/copy/download, badge
      copy-to-clipboard, session-restore survives a reload, mobile Cover
      letter button opens the modal (already verified once via DOM query
      during the audit, but not locked in as a regression test).

## New templates — 2026-08-15

- [x] **27. Two new templates: Classic Professional and Navy Professional**
      — done 2026-08-15, requested with a reference image
      (`docs/Classical Professional.png`) showing both layouts side by
      side. Brings the template count from 10 to 12 (landing page hero
      highlights and FAQ copy, EN+FI, updated to match; `todo.md`/comment
      references to "10 templates" elsewhere left as historical text where
      they describe past states, only live-copy counts were bumped).
      **Naming collision caught before writing any code:** the request's
      exact name for the sidebar template, "Modern Professional," is
      already the label of the existing `modern` template
      (`src/utils/cvTemplates.js`) — a different-looking layout (top
      header with photo, light-blue right sidebar) but an identical name,
      which would have shipped as two gallery cards both reading "Modern
      Professional." Asked the user; they chose to keep the existing
      template's name and rename the new one — landed as **Navy
      Professional**.
      Both are full bespoke Showcase components (`ClassicProfessionalShowcase.jsx`,
      `NavyProfessionalShowcase.jsx`), not the generic config-only path —
      matching the precedent of 8 of the prior 10 templates, since neither
      design fit the generic renderer's existing option surface (a
      centered serif header; a full-height sidebar with identity baked in,
      rather than the shared top-header-then-two-columns shape every other
      bespoke Showcase uses). Both go through the standard
      `variant && !atsFriendlyMode` Suspense-delegated lazy-load added in
      item 25, so they don't add to the initial bundle, and both got added
      to `prefetchTemplateShowcases()`.
      **Classic Professional:** single column, `layout: 'stacked'` (no
      secondary sections), white background, no photo, no accent color —
      the entire design pulls from grayscale plus one deliberate exception:
      the name renders in a system serif stack (`Georgia, 'Times New
      Roman', Times, serif`) rather than the app's self-hosted Inter, since
      the reference image's traditional look depends on it and a system
      font costs nothing (no new font file, no network request) unlike
      adding a webfont would. Contact row (phone/email/location/LinkedIn)
      uses the same icon set every other template's header already uses.
      Languages render as an inline "English – Fluent | Finnish –
      Advanced" row (a one-off format not shared with any existing
      template) rather than a stacked list, matching the reference image.
      **Navy Professional:** `layout: 'split'`, full-height dark-navy
      (`#16233a`) left sidebar carrying photo + name + title + contact +
      skills + languages, white main column with filled-blue-circle
      section-icon badges (Profile/Experience/Education/Certifications) —
      structurally different from every other bespoke Showcase in this
      app, which put identity in a shared top header above a two-column
      body; here the sidebar *is* the header, so there's no separate
      `<header>` element, just `<aside>` before `<main>` inside the
      article (same DOM-order trick `DeveloperShowcase.jsx` already uses
      to put its sidebar on the left).
      Both configs (`classicProfessional.js`, `navyProfessional.js`)
      supply a full generic-path fallback (used whenever ATS-friendly mode
      is on, bypassing both Showcases) so ATS mode doesn't break for
      either — verified live, not assumed: toggled ATS mode on and off for
      both templates in a real browser with no console errors or crashes.
      **Navy Professional's ATS behavior changed in item 30:** it no
      longer bypasses to the generic renderer in ATS mode — it keeps its
      own layout, single-columned and recolored. Classic Professional is
      unaffected and still bypasses to the generic fallback as described
      above.
      Verified end-to-end: both render correctly in the template gallery
      (12 thumbnails, no blank Suspense gaps), in the live preview
      (Finnish and English), in ATS-mode fallback, and export cleanly to
      PDF (`html2canvas` → `jsPDF` path, not the text fallback — confirmed
      via `preview-document--designer` sync and a completed export with no
      hung "exporting…" button state) with zero console errors throughout.
      `npm run lint`, `npm run build`, `check:share`, `check:reducers`,
      `check:feedback`, and `test:e2e` (14/14) all pass.
- [x] **28. Visible template preview on the landing page, next to the FAQ**
      — done 2026-08-16, requested after item 27 shipped. A new "See the
      templates" section (`src/components/LandingTemplatesPreview.jsx`)
      sits between "Why use PortifyCV" and the FAQ, showing all 12
      templates as small real thumbnails with their names — not an
      abstract mockup, the same live-`CVPreview`-scaled-down approach the
      in-builder template gallery already uses (item 1), filled with the
      demo CV since the landing page has no in-progress CV of its own to
      show.
      **Refactor along the way:** the thumbnail-rendering logic
      (`TemplateThumbnail` component, `buildThumbnailCv` trimming
      function) lived only inside `TemplateGalleryModal.jsx` before this;
      extracted into `src/components/TemplateThumbnail.jsx` and
      `src/utils/thumbnailCv.js` respectively so both the modal and the
      new landing section share one implementation instead of duplicating
      it. (The split into two files, not one, is a lint requirement, not a
      style choice — `react-refresh/only-export-components` rejects a file
      that exports both a component and a plain function.)
      **Lazy-loaded**, matching this app's established bundle-hygiene
      pattern (items 8, 25): `LandingPage.jsx` only `React.lazy()`-imports
      `LandingTemplatesPreview`, so a first-time visitor's critical-path
      bundle doesn't carry `CVPreview` + the template registry just for a
      below-the-fold section. Confirmed via `npm run build` output: a new
      standalone `LandingTemplatesPreview` chunk (0.64 KB) plus a shared
      `thumbnailCv` chunk (83 KB / 16.6 KB gzip, containing `CVPreview` and
      the template registry) that both the landing page and
      `ResumeBuilderPage` now depend on — confirmed by `ResumeBuilderPage`'s
      own chunk shrinking by roughly that same amount, meaning a visitor
      who previews templates and then clicks "Start building" isn't
      re-downloading that code.
      Verified in a real browser, both locales: all 12 thumbnails
      (including the two from item 27) render with correct real layouts
      and correctly localized names, the section sits directly before the
      FAQ, the in-builder template gallery modal still works unchanged
      after the extraction, and there are zero console errors. `npm run
      lint`, `npm run build`, `check:share`, `check:reducers`,
      `check:feedback`, and `test:e2e` (14/14) all pass.
- [x] **29. Reworked the Timeline template into Modern Timeline** — done
      2026-08-16, requested with a reference image
      (`docs/MODERN-TIMELINE.png`). A full redesign in place, not a new
      13th template: `id`/`variant` stay `'timeline'` (existing share
      links or exported JSON encoding `template: 'timeline'` still resolve
      correctly), only the label ("Timeline" → "Modern Timeline"),
      description, layout, and every visual file changed.
      **Structural change:** was `layout: 'split'` with a sidebar (skills/
      links/languages/interests) and a merged single timeline mixing
      *every* section type (experience, education, certificates, projects,
      achievements, speaking, publications, volunteering) into one
      continuous chronological list. Now `layout: 'stacked'` — no sidebar
      at all — with 7 fixed, separately-headed sections (Profile,
      Experience, Education, Projects, Skills, Languages, Certifications),
      matching the reference image exactly. This also happens to close the
      sidebar/main imbalance flagged against the old Timeline design in
      item 16's audit (worst case of the 8 split-layout templates, ~4x) —
      not the point of this pass, but a side effect of removing the
      sidebar entirely.
      Only Experience and Education use the actual timeline visual (date
      in its own left column, hollow accent-ringed dot, connecting line to
      the next entry — reused the same absolutely-positioned-line-in-a-flex-rail
      technique `ModernShowcase.jsx` already established for its own
      timeline, adapted to put the date in a third column instead of
      inline with the content). Projects render as clean bordered cards
      (icon badge, name, description, comma-split `stack` tags matching
      `PortfolioShowcase.jsx`'s existing parsing, an optional "View
      project" link). Languages get a small proficiency-dot row (1-5 dots)
      via a best-effort keyword heuristic on the free-text level field
      (EN+FI: native/fluent/c2→5 ... beginner/a1→1, unrecognized text
      defaults to a neutral 3 rather than guessing high or low, since it's
      a stylized flourish, not a claim about the CV's real content). The
      name is two-tone (first name dark, rest of the name in the accent
      color) via a naive first-space split — a deliberate, disclosed
      simplification, not a real name-parser.
      **New capability, not present anywhere else in the app: a real,
      working user-customizable accent color** — the spec asked for this
      explicitly. Checked first whether this already existed in any form:
      it doesn't (`getAccentOption()`/`getAccentThemeStyles()` in
      `designSystem.js` are vestigial stubs from a removed feature, and
      item 13 already found and corrected a template description that
      falsely claimed "changeable accent colour"). Built it real rather
      than faking the claim a second time: `timelineAccentColor` lives in
      `uiReducer.js` (ephemeral UI state, same tier as `selectedTemplate`
      and `atsFriendlyMode` — not part of `CvData`, so not persisted
      through share links, consistent with how template selection itself
      already isn't). A conditional "Timeline accent color" row appears in
      Settings *only* when Modern Timeline is the active template — 6
      preset swatches (violet default, blue, teal, emerald, amber, rose),
      not a free-form picker, so every choice stays "subtle" per the
      template's own brief. Applied via one CSS custom property
      (`--tl-accent`) set inline on the Showcase's root element from the
      `accentColor` prop threaded through `CVPreview.jsx`; the stylesheet
      never hardcodes the color, so PDF export (which screenshots the live
      DOM) picks up the chosen color automatically with no export-pipeline
      changes needed. Deliberately did not thread the custom color into
      the template gallery or landing-page thumbnails (both keep the
      default violet) — a defensible, disclosed scope cut, consistent with
      those thumbnails already using the demo CV instead of live form data.
      **A real near-circular-import bug caught before it shipped:** the
      accent color's default value needed to be readable from
      `uiReducer.js` (for `createInitialUiState`) without pulling
      `TimelineShowcase.jsx` — a `React.lazy()`-loaded component (item
      25's code-splitting) — into the eagerly-bundled reducer. Moved the
      constant into `timeline.js` (the plain, always-eager config object)
      instead, imported from both sides. Confirmed via `npm run build`
      that `TimelineShowcase` still gets its own lazy chunk (9.78 KB)
      rather than being absorbed into the main bundle.
      Verified end-to-end in a real browser: matches the reference image's
      structure closely in both locales (two-tone name, contact rows,
      timeline dots/line, project cards, language dots, certifications);
      the accent-color swatches restyle the entire live preview instantly;
      ATS-mode fallback renders correctly (flat, monochrome, no crash);
      PDF export completes with no hung "Exporting…" state and zero
      console errors; the template gallery and landing-page preview both
      still render all 12 templates including the reworked one with no
      layout breaks. Added 2 new `check:reducers` cases. `npm run lint`,
      `npm run build`, `check:share`, `check:reducers`, `check:feedback`,
      and `test:e2e` (14/14) all pass.
      **Superseded by item 30 below:** the "ATS-mode fallback" described
      here meant bypassing to the app's generic renderer, which no longer
      happens for this template — see item 30.
- [x] **30. Modern Timeline and Navy Professional keep their own layout in
      ATS mode instead of bypassing to the generic renderer** — done
      2026-08-16, requested as a refinement to items 27 and 29: "modern
      timeline and navy profession should keep placement of a template
      after ats enabled only removing necessary stuff." Before this, every
      template except `minimal`/`techExec` rendered its bespoke Showcase
      normally and only fell back to the app's shared generic renderer
      when ATS mode was on — including these two, despite their Showcases
      already being ATS-safe in spirit. That meant enabling ATS mode swapped
      Modern Timeline or Navy Professional out for a visually unrelated
      generic layout, rather than the same template minus what a parser
      actually needs stripped.
      `CVPreview.jsx`'s `variant === 'timeline'` and
      `variant === 'navyProfessional'` branches no longer gate on
      `!atsFriendlyMode` — both now always render their own Showcase, which
      each received a new `atsFriendlyMode` prop to react to internally.
      **Modern Timeline:** ATS mode only recolors the user's chosen accent
      down to a fixed neutral gray (`TIMELINE_ATS_ACCENT_COLOR = '#374151'`,
      overriding `--tl-accent`) — the layout itself (single column, no
      sidebar) was already ATS-flat from item 29's rework, so there was
      nothing structural left to remove.
      **Navy Professional:** two necessary changes, both because this
      template's non-ATS layout is exactly what this app's own ATS
      messaging promises to strip. (1) The 2-column
      `grid-template-columns` (navy sidebar beside white main column)
      collapses to one column (`.navy-professional-showcase--ats`) — a
      side-by-side column can scramble a parser's left-to-right text
      extraction, which is precisely the "no columns" claim the app's ATS
      copy already makes elsewhere. (2) ~15 CSS rules recolor the sidebar
      background, text, tags, icons, and bullet markers from navy/blue to
      the same neutral grayscale every other template's ATS mode already
      uses. Everything else — section order, icon badges, pill tags,
      language markers, entry structure — stays in the same relative place.
      Both Showcases' root `<article>` className now computes the
      `preview-document--ats`/`--designer` marker dynamically off the live
      `atsFriendlyMode` prop (previously hardcoded to `--designer`), which
      the export pipeline's `waitForPreviewModeSync` polls via
      `classList.contains(...)` before capture — verified correct via a
      direct DOM query in a real browser (right class, right computed
      colors, right `grid-template-columns`) for both templates.
      **A PDF-export "hang" investigated and ruled out as a real bug:**
      triggering Navy Professional's ATS PDF export through the actual UI
      button in this session's browser-automation environment took
      70-100+ seconds and looked stuck. Root-caused with the browser tab's
      own `document.hidden`/`document.visibilityState` — the automation
      tab runs backgrounded, and Chrome throttles `requestAnimationFrame`
      to near-zero for hidden tabs. `ResumeBuilderPage.jsx`'s
      `waitForPreviewModeSync`/`waitForPreviewVariantSync` each poll for
      up to 60 rAF frames *before* the actual `html2canvas` capture runs,
      so a throttled tab stalls there for a long time — confirmed
      directly: `window.__rafLog` only grew by a handful of frames per
      minute while `document.hidden === true`, and once the capture itself
      finally ran it completed in ~1 second (`isCanvasLikelyBlank` false on
      the first pass). Calling `exportCvAsPdf()` directly (bypassing the
      two rAF-gated pre-checks, which are UI sync guards, not the export
      itself) completed in ~3 seconds for both Navy Professional and Modern
      Timeline in ATS mode. This is the same class of environment quirk as
      the already-documented Chrome `resize_window`/smooth-scroll no-ops
      in this project's memory, not an application defect — a
      foregrounded, real user's tab does not experience rAF throttling.
      `npm run lint`, `npm run build`, `check:share`, `check:reducers`,
      `check:feedback`, and `test:e2e` (14/14) all pass.

- [x] **31. Full SEO/content audit and Phase 1-6 fixes** — done 2026-08-20,
      on branch `seo-audit-content-polish`. Given a large brief (audit +
      content-gap analysis + technical SEO + content pages + polish across
      the whole site). Ran a 3-agent parallel audit first (technical SEO,
      page/content inventory, analytics/privacy/ads), then fixed what came
      back broken, then — after confirming scope with the user rather than
      guessing — built 3 of the 10 requested content topics.
      **Broken, fixed:**
      - `public/_redirects` (Netlify/Cloudflare Pages SPA-fallback file)
        had been deleted in a standalone commit ("Removed rederect").
        Without it, a direct visit or refresh on `/cv` or `/privacy` 404s.
        Confirmed with the user the site is actually on Cloudflare (which
        reads the same `_redirects` syntax) before restoring it — the
        deletion was a deliberate, single-purpose commit, not accidental
        debris, so it wasn't restored blindly.
      - In-app navigation never updated the URL — clicking "Start
        building" swapped views and patched `document.title`/canonical via
        `useDocumentHead`, but never touched `window.location`, so the
        canonical tag could claim `/cv` while the address bar still read
        `/`, and the back button had nothing to go back to. Added
        `history.pushState` on every view switch plus a `popstate`
        listener, verified with real multi-hop back/forward through both
        the original 3 views and the 3 new pages added later in this pass.
      - Open Graph/Twitter meta tags stayed frozen on `index.html`'s
        homepage values for every route — only title/canonical/description
        were patched per-route. Extended `useDocumentHead` to patch
        `og:url`/`og:title`/`og:description`/`twitter:title`/
        `twitter:description` too.
      - Two leftover "all 10 templates" references in `index.html` (the
        FAQPage JSON-LD and the noscript-fallback FAQ) — the app has 13
        templates now; exactly the content a crawler or non-JS bot reads,
        so a stale count there is a real accuracy bug.
      **Needs-polish, fixed:** the cover letter generator (a complete,
      working feature) had zero mention anywhere on the landing page —
      only discoverable from inside the builder. Added one FAQ entry
      (EN + FI, mirrored into the JSON-LD and noscript fallback) rather
      than a new hero highlight, since the hero list was already at a
      reasonable density and the brief explicitly warns against
      overcrowding the homepage.
      **Missing, partially addressed (by design, not oversight):**
      PortifyCV had zero content-marketing pages against the brief's 10
      target topics (CV Examples, How to Write a CV, IT/Developer/
      Cybersecurity/Finnish CV Examples, CV Skills Examples, ATS-Friendly
      CV Guide, Free CV Templates, Cover Letter Examples). Rather than
      guess at scope on a brief that explicitly warns against overbuilding
      ("do NOT create dozens of thin SEO pages"), asked the user to pick:
      they chose starting with the 3 highest-leverage topics (the ones
      that tie to real product features, lowest risk of reading thin/
      generic) over all 10 at once, and flat keyword-rich URLs
      (`/free-cv-templates`, `/how-to-write-a-cv`,
      `/ats-friendly-cv-guide`) over nesting under `/resources`.
      Built all 3:
      - **Free CV Templates** — a real grid of all 13 templates using the
        existing `TemplateThumbnail`/`getCvTemplates` infrastructure (not
        a new preview system), each with its actual description and a
        "Use this template" CTA that now actually pre-selects that
        template in the builder (new `?template=` param, validated against
        the real template map via new `isValidTemplateId` in
        `cvTemplates.js` — previously no such deep link existed at all).
      - **How to Write a CV** — structural guide with concrete weak/strong
        rewrite examples (not generic listicle advice), cross-linked to
        the other two new pages.
      - **ATS-Friendly CV Guide** — what an ATS parser actually does, what
        breaks it, and how PortifyCV's real ATS mode + keyword-match
        scoring help. **Found a real, honest limitation while writing this
        one and did not paper over it:** even ATS-mode PDF export still
        goes through the same `html2canvas` → image-in-`jsPDF` pipeline as
        the styled export (`exporters.js` — the genuinely text-based path,
        `exportCvAsPdfTextFallback`, only runs as a last-resort fallback
        for a blank-canvas or unsupported-color capture, not as ATS mode's
        normal behavior). So an ATS-mode PDF isn't inherently more
        machine-text-extractable than the styled one — both are a picture
        of the page. The guide says this plainly and recommends HTML
        export (which does preserve real selectable text) when a target
        system needs a genuine text layer, instead of overclaiming what
        the PDF does. **Flagging, not fixing:** making ATS-mode PDF export
        actually produce real extractable text would be a real product
        improvement (the text-fallback path exists but covers noticeably
        fewer sections/layout fidelity than the canvas path today) — out
        of scope for a content-audit pass, worth its own pass if the ATS
        story matters enough to invest in.
      **Supporting engineering, done as part of shipping the 3 pages, not
      speculative:** generalized `App.jsx` routing from 3 hardcoded view
      branches to a `VIEW_HEAD`/`STATIC_PAGES` map (adding a page is now
      one map entry, not a new copy of the header/footer shell — this
      already removed real duplication between the old landing/privacy
      branches); new `src/utils/routes.js` as the one place path strings
      live (avoids a circular import between `App.jsx` and the pages it
      renders); new `src/components/InternalNavLink.jsx` (real `href` +
      intercepted click for an SPA transition) reused across the 3 pages'
      cross-links and the footer. Footer now links to all 3 new pages so
      none are orphaned. Deliberately did not add a router library
      (react-router etc.) — the brief explicitly warns against
      unnecessary dependencies, and the hand-rolled map scales fine for a
      handful of static pages.
      `npm run lint`, `npm run build`, `check:share`, `check:reducers`,
      and `check:feedback` all pass. Verified end to end in a real browser
      per the details above — screenshots at desktop and 390px mobile
      width, zero horizontal scroll.
      **Follow-up, same day:** shipped 2 more of the content backlog —
      **Cover Letter Examples** (weak/strong opening, experience paragraph,
      and closing examples, plus a description of the real cover letter
      generator checked against `coverLetter.js`'s actual paragraph-
      building logic before writing it — it's a deterministic template
      pulling from CV data, not AI, and the page says so) and **CV Skills
      Examples** (hard vs. soft skills, example groupings, and two claims
      verified against the real product before writing them: skills
      auto-categorize by keyword regex — frameworks/databases/cloud/
      DevOps/security — in several templates per `shared.jsx`'s
      `parseSkillCategories`, and the "at least 4 skills" guidance matches
      `cvFeedback.js`'s own `MIN_SKILL_COUNT` rather than being invented
      advice). That's 5 of the original 10 topics shipped; remaining
      backlog is IT/Developer/Cybersecurity/Finnish CV Examples and a
      general "CV Examples" page — same reasoning as before, each needs
      real, specific example content to avoid reading thin.
      Also added: structured data (`Article` JSON-LD) for all 4 guide-type
      pages via a new `isArticle` flag on `VIEW_HEAD` entries — one script
      tag upserted/removed by `useDocumentHead` as the view changes,
      verified present only on the 4 guide pages and absent elsewhere.
      Strengthened internal linking per the audit's own "no orphan pages"
      finding — footer now has 6 links; added cross-links between all 5
      content pages (How to Write a CV ↔ CV Skills Examples, ↔ Cover
      Letter Examples; ATS Guide ↔ CV Skills Examples, ↔ How to Write a
      CV; Free CV Templates → both new pages) rather than leaving them
      reachable only from the footer. Refactored the per-section link
      rendering from a single `linkParagraph` with a fragile "guess the
      view from the URL" ternary to a `linkParagraphs` array with an
      explicit `view` field, needed once a section could reasonably link
      to more than one other page.
      **Still not done** (explicitly scoped out, not silently dropped):
      the remaining 5 content topics above; template-specific landing
      pages (only where there's real search/user value — not done pending
      evidence any single template needs one beyond the Free CV Templates
      grid); a deeper mobile/visual audit of the pre-existing builder UI
      (out of scope for a *content* pass); Search Console verification
      (needs an account this session doesn't have).
      `npm run lint`, `npm run build`, `check:share`, `check:reducers`,
      and `check:feedback` all pass. Verified end to end in a real
      browser: direct visits, per-route canonical/title, structured data
      appearing only on article pages, cross-links actually navigating,
      and no horizontal scroll at 390px.
      **Follow-up, same day:** shipped the remaining 5 content topics,
      closing out all 10 from the original brief. **Developer CV
      Examples** (weak/strong experience bullet, a project-entry example
      matching the real Projects schema — `githubUrl`/`demoUrl`/`stack`/
      `impact`/`teamSize` from `cvForm.js`'s `createEmptyProject` — and why
      the Developer template fits; CTA pre-selects it via
      `onGetStarted('developer')`). **IT CV Examples** (helpdesk-style
      ticket-time bullet, certifications tied to the real Certificates
      schema fields, an IT-specific skills list). **Cybersecurity CV
      Examples** (incident-response bullet, certifications, SIEM/IAM
      tools, and a callout that the Links section has dedicated Hack The
      Box and TryHackMe fields — verified against `createEmptyLinks` in
      `cvForm.js` before writing it). **Finnish CV Examples** (what
      Finnish CVs omit vs. US ones, why the languages section carries more
      weight, and a side-by-side EN/FI example of the same bullet — framed
      around PortifyCV's real bilingual EN/FI support). **CV Examples**
      hub page (`/cv-examples`, `.landing-page` layout, a 2×2 card grid
      linking to the 4 field-specific pages) so the 4 new pages aren't
      only reachable by guessing URLs; linked from Free CV Templates' "see
      also" row and added to the footer in place of listing all 4
      individually (avoids footer clutter while keeping everything at
      most 2 clicks from anywhere). All 4 field pages get `Article`
      JSON-LD (`isArticle: true`); the hub page correctly does not, since
      it's a directory, not an article. `routes.js` and `sitemap.xml`
      grown accordingly (hub at priority 0.7, field pages at 0.6).
      One visual bug found and fixed during in-browser verification: the
      hub page's cards are each a full `InternalNavLink` (an `<a>` tag),
      and without a style reset the browser's default blue/underlined
      link styling bled through onto the card title and body text —
      fixed with `color: inherit; text-decoration: none;` on
      `.examples-hub-card`, confirmed with a before/after screenshot.
      `npm run lint`, `npm run build`, `check:share`, `check:reducers`,
      and `check:feedback` all pass.
      **Still not done** (explicitly scoped out, not silently dropped):
      template-specific landing pages (only where there's real search/user
      value — not done pending evidence any single template needs one
      beyond the Free CV Templates grid); a deeper mobile/visual audit of
      the pre-existing builder UI (out of scope for a *content* pass);
      Search Console verification (needs an account this session doesn't
      have).
      **Follow-up, same day — mobile polish pass:** audited every route at
      a 390px viewport with a Playwright script that flags any element
      wider than the viewport. All 9 content pages plus privacy came back
      clean — zero horizontal overflow. Two real, non-cosmetic findings on
      the builder, both fixed:
      1. The mobile bottom action bar's format-switcher row (PDF/HTML/
      JSON/Link/Cover letter) is a horizontal-scroll strip with
      `no-scrollbar` hiding the native scrollbar — on a 390px screen the
      row doesn't fit and "Cover letter" was cut off with zero visual hint
      that scrolling reveals it. Added a right-edge opacity-mask fade
      (`.quick-actions-scroll-fade`, pure CSS, no JS) so the cut-off
      button visibly fades to transparent instead of ending in a hard
      clip. Verified it's inert (no visible effect) when the row isn't
      overflowing, since it fades an opacity mask over whatever's
      actually painted rather than painting a color overlay.
      2. Real bug, not mobile-specific but found via the mobile tap-target
      sweep: every skill/technology tag's "remove" (×) button was
      rendering as an empty circle — the icon SVG was being flex-shrunk
      to under 1px wide (height stayed 12px) because `.tags-input__tag`
      had no `flex-shrink: 0`, so the last tag on a wrapped line could get
      squeezed by the flex algorithm. The × was there in the DOM the whole
      time, just invisible, on desktop and mobile alike — a real, live bug
      previously undetected. Fixed with `flex-shrink: 0` on the tag pill
      and the remove button, plus an explicit CSS size on the icon so it's
      no longer subject to the parent's flex-shrink math. Confirmed all 11
      tag remove-icons on a sample CV now render at a consistent width on
      both a 390px and a 1440px viewport.
      Also checked and found already solid, no changes needed: the
      landing page's template marquee (already has proper edge-fade
      masking, hover-to-pause, and `prefers-reduced-motion` handling —
      it's a deliberate CSS-only ticker, not a bug); the template gallery
      and cover letter modals on mobile (proper backdrop, close button,
      scrollable content, no overflow); bottom-of-form spacing above the
      fixed mobile action bar (already has enough padding that the last
      field isn't hidden behind it). Icon-only buttons inside experience/
      education cards (duplicate/delete/drag, ~30px) are smaller than the
      44px touch-target guideline but left as-is — they're dense-editor
      secondary actions with a low mis-tap cost, and enlarging them would
      require restructuring the accordion header row for a marginal gain;
      not worth it under "don't overbuild."
      `npm run lint`, `check:share`, `check:reducers`, and `check:feedback`
      all pass; `npm run build` succeeds.
      **Follow-up, same day — PDF export bugs (user-reported):** two real
      fixes to `src/utils/exporters.js`.
      1. **Mobile Designer-PDF export was captured at the phone's screen
      width instead of the resume's designed page width.** Root cause:
      `createExportSandbox` set the capture width to
      `exportRoot.getBoundingClientRect().width` — the live on-screen
      preview pane's *current* rendered width. On desktop that's close
      enough to look right by coincidence; on mobile the preview pane is
      clamped to the phone's screen (`.preview-document`'s own CSS is
      `width: min(100%, var(--preview-paper-width))`, and
      `--preview-paper-width: min(100%, 220mm)` in `tokens.css`), so the
      whole resume got laid out and captured at ~350–390px instead of its
      designed width, baking a cramped mobile-style reflow into the PDF.
      Fixed by capturing Designer-mode PDFs at a fixed
      `DESIGNER_PAPER_WIDTH_MM = 220` (matching `--preview-paper-width`)
      converted to px, regardless of device — the same value ATS mode
      already used a fixed A4-based width for. Verified with Playwright:
      instrumented the sandbox's capture width and confirmed it's now a
      constant 831px on both a 390px and a 1440px viewport (previously
      the two produced different sandbox widths). Downloaded a real
      Designer PDF from both viewports and rendered both to PNG — the two
      are now visually identical, same layout, same line breaks, same 2
      pages; previously the mobile one would have reflowed at the narrow
      capture width.
      2. **Firefox export could fail outright** — reported by the user,
      not independently reproduced (no Firefox binary in this sandbox to
      test against; Chromium only). Found a real flow bug on code
      inspection: the capture pipeline already had a 3-step recovery
      chain (retry with `foreignObjectRendering` toggled, then retry
      again after copying computed color/background values onto the
      clone) for when html2canvas returns a *blank* canvas — but that
      chain only ran on a blank result, not on a *thrown* error. If
      html2canvas rejects synchronously (e.g. hitting a CSS color syntax
      it can't parse — html2canvas 1.4.1 predates CSS Color 4 and throws
      on `oklch()`/`lab()`/`color-mix()`, which Firefox's
      `getComputedStyle` can report for a `color-mix()`-authored value
      even when Chromium reports the same rule as a plain `rgb()`), the
      first attempt's rejection skipped the entire recovery chain and
      jumped straight to a hard-degraded text-only PDF or a raw error
      toast. Fixed in three parts: (a) wrapped each capture attempt so a
      thrown error is treated the same as a blank canvas, letting every
      attempt go through the full recovery chain instead of only the
      first one mattering; (b) made the existing "copy computed colors
      onto the clone" fallback actually useful for this case by
      round-tripping any `oklch`/`oklab`/`lch`/`lab`/`color`/`color-mix`
      value through a canvas 2D context's `fillStyle` (which any browser
      normalizes to plain `rgb()`/`rgba()`) before applying it — previously
      it copied the computed value verbatim, which would have re-copied
      the same unparseable Firefox-reported value and fixed nothing; (c)
      hardened `isCanvasLikelyBlank` against a tainted-canvas
      `SecurityError` from `getImageData` (another known cross-browser
      html2canvas failure mode) so it's treated as "not usable yet"
      rather than crashing the whole export. None of this was found in
      `color-mix()` usage inside the actual captured resume template CSS
      (checked — templates are plain hex/rgba on purpose, per existing
      comments in `modernOrange.css`/`developer.css`); the two
      `color-mix()` uses in the codebase are both in `app-shell.css`
      builder chrome (`.app-toolbar`, `.preview-zoom-bar`) outside the
      captured export root, so this is a defensive/robustness fix for
      the general failure mode rather than a fix targeting a located
      `color-mix()` call. **This should be verified against real Firefox**
      before being treated as fully resolved — flagged to the user as
      not independently confirmed.
      `npm run lint`, `check:share`, `check:reducers`, `check:feedback`,
      and `npm run build` all pass.

## Checked and fine — don't re-investigate

- Responsive layout is handled (breakpoints at 1023 / 860 / 560px).
- The builder's three-pane layout, live preview, and zoom controls read well.
