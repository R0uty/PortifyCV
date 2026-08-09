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

- [ ] **2. The editor buries the form under 2,751px of preamble.**
      2.6 viewport heights of Quick import → Export mode → ATS score → Smart suggestions →
      Section 00 sit above `#section-personal`, while the nav rail highlights "Personal
      Information" as active. A first run opens on import tooling and an ATS score for a
      CV the user hasn't written. Move the utility panels behind a collapsed
      "Import & tools" disclosure (or into the Settings modal) and open on Section 01.

- [ ] **3. Landing page is a wireframe.**
      Headline, two lines, one button, ~half the viewport empty. Names none of the ten
      templates, the ATS scoring, the live preview, or the export formats, and shows no
      image of the output. For a visual product the strongest conversion element is a
      picture of the result.

## Smaller visual fixes

- [ ] **4. "NO LOGIN. NO DATA SAVED." appears three times** — landing body, landing
      footer, builder footer. Good differentiator, but three repeats read as filler.
      Keep one, prominently.
- [ ] **5. "NOTHING SAVED ANYWHERE" is styled like a button** but is a status pill, and
      sits beside two real buttons (`LOAD DEMO CV`, `RESET FORM`). Give it a
      non-clickable treatment.
- [ ] **6. "Load demo CV" appears twice on one screen** — the top action row and inside
      the Quick Import card.
- [ ] **7. `HTML` / `JSON` are bare text buttons in an icon toolbar** (the seam from the
      1.0.0 audit fix). Group PDF/HTML/JSON under a single "Export" menu.

## Non-visual

- [ ] **8. First export stalls on a large download.** `vendor-pdf` is 602KB (~177KB gz)
      and `pdfExportWorker` 794KB. Both lazy-load correctly so first paint is unaffected,
      but the first export pays the cost. Prefetch on builder idle.
- [ ] **9. Self-host Inter.** Google Fonts is the app's only third-party request — no CV
      data involved, but it's the one thing contradicting "everything runs in your
      browser". Removes a network round-trip too.
- [ ] **10. Add tests for the reducers.** `cvFormReducer` and `uiReducer` are pure
      functions and cheap to cover. The share codec already has `npm run check:share`.
- [ ] **11. `src/index.css` is 7,879 lines / 135KB** (21KB gz) of hand-written
      Tailwind-alike utilities. Works today; most likely file to rot. Low priority.

## Checked and fine — don't re-investigate

- Responsive layout is handled (breakpoints at 1023 / 860 / 560px).
- The builder's three-pane layout, live preview, and zoom controls read well.
