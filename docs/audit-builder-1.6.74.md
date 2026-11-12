# Builder, UI and code review — 1.6.74

Reviewed 2026-11-09 on the `pdf-preview` branch (1.6.74 = main 1.6.72 plus
open PRs #20 and #21). Evidence is from the running dev build at 1024, 1440
and 375 px wide, plus reading the code named in each item.

State at review time: `npm run lint`, all nine `check:*` scripts and
`npm run build` pass.

Not covered: the e2e suite, the other 17 templates (only Minimalist was
walked), the Finnish UI, Word and HTML export, a keyboard-only pass, and a
real phone.

## Phase 1: bugs (small, one version bump each)

- [x] **1. Sections panel never closes.** It ignores Escape and outside
      clicks, and stays open under the More menu and over the section popup.
      `src/components/SectionsMenu.jsx` has only a toggle.
- [x] **2. ATS guide states something false.**
      `src/pages/AtsFriendlyCvGuidePage.jsx:249` still says the PDF is a
      picture with no selectable text; that stopped being true in 1.6.71.
      Check the Finnish copy too.
- [x] **3. Stray "Edit About section" label.** After closing a section popup
      with Escape, the hidden keyboard button
      (`.direct-edit-keyboard-trigger`, `src/styles/direct-edit-popup.css`)
      appears at the top-left of the canvas, away from the section it
      belongs to.
- [x] **4. "Load demo CV" replaces the CV with no confirmation.**
      `handleLoadDemo` in `src/pages/ResumeBuilderPage.jsx`. The button sits
      permanently beside Sections and ATS view. Hide it once the CV has
      content, or move it into the More menu.
- [x] **5. Placeholder text mentions a form that isn't there.** Direct Edit
      shows "…as you fill out the CV form" (found in `CompactShowcase.jsx`,
      `PortraitShowcase.jsx`, `ModernShowcase.jsx`; check the others).

## Phase 2: Direct Edit gaps

- [x] **6. No import in Direct Edit.** The Export menu describes JSON as a
      "backup you can import again later", but import exists only in the
      Classic form.
- [x] **7. No ATS score or suggestions in Direct Edit.** Both live only in
      the Classic form.
- [x] **8. The default template supports only five sections.** Minimalist
      has no Languages, Certificates or Projects
      (`src/utils/cvTemplates.js`), and nothing tells the user other
      templates do. Show unsupported sections greyed out with an "available
      in other templates" hint.
- [x] **9. A reload wipes the CV by default.** Session restore is off unless
      the user finds it in Settings (`uiReducer.js`). **Decision needed:**
      turning it on by default keeps the CV in this tab's `sessionStorage`
      only, cleared on tab close, but the "no data saved" footer and the
      privacy page wording need a check first.

## Phase 3: visual consistency

- [x] **10. Two design languages.** The Direct Edit toolbar is soft and
      rounded; Classic, the cover letter dialog and the landing page use
      square, uppercase buttons and oversized panel titles.
- [x] **11. Classic at 1024 px is cramped.** The toolbar wraps to two rows
      and the form column is roughly 240 px wide. The zoom bar is seven
      heavy grey buttons, with no selected state for Fit Width.
- [x] **12. Phone Classic buries the form.** The first field starts around
      700 px down an 812 px screen, and "Show preview" duplicates the bottom
      "Preview" tab.
- [x] **13. Tiny touch targets.** "Remove skill" is 9×21 px; drag and remove
      handles are 22×22 px.
- [x] **14. "Minimalist Template" label above the name.** It is not exported
      (`data-export-ignore`), but it looks like CV content.

Phase 3 notes (1.6.83-1.6.84):

- Item 10 covers the builder only (Classic, its dialogs, the phone tab
  bar). The landing page keeps its square, uppercase buttons. The heavy
  grey buttons turned out to be a missing reset: buttons with no
  background or border of their own kept the browser's.
- Item 13 was mostly a measuring error: the skill chip's remove button
  already had a 24px hit area and entry handles are 32px on touch
  screens (both 1.6.66). Only Classic's tag remove button got a larger
  hit area.
- Item 14: the label is hidden in the builder's editing previews only.
  Gallery thumbnails and template pages keep it.

## Phase 4: code health (no user-visible change)

- [ ] **15. Split the largest files.**
      `src/pages/ResumeBuilderPage.jsx` is 2,703 lines with 26 effects and
      56 handlers: extract hooks for history, export, zoom and toasts.
      `src/components/CVForm.jsx` is 2,673 lines with 21 panels: move to one
      file per section.
- [ ] **16. Split the CSS.** `src/styles/app-shell.css` is 4,875 lines, and
      everything ships as one 270 KB (uncompressed) stylesheet to every
      landing visitor, including all 18 templates and the builder.
- [x] **17. One source for section labels.** `SectionsMenu.jsx` keeps its
      own copy with a "must stay in sync" comment; `sectionSchema.js`
      already has `labelEn`/`labelFi`.
- [x] **18. Smaller items.** The mode switch claims `role="tablist"` without
      tab keyboard behaviour (`Toolbar.jsx`), and a ResizeObserver
      "Unhandled error" is logged (`main.jsx:41`) when the PDF preview
      opens.

Phase 4 notes (1.6.85-1.6.86):

- Item 15 is started, not finished. Two hooks came out of
  `ResumeBuilderPage.jsx` (2,703 to 2,594 lines): `usePreviewZoom` and
  `useCvSafekeeping` (session restore and the leave guard). Still in the
  page: undo history, export, import, and the template look. `CVForm.jsx`
  is untouched.
- Item 16 is not done, on purpose. The 270 KB figure was uncompressed; the
  stylesheet is about 32 KB over the wire (brotli). Splitting the template
  CSS into the lazy chunks would save roughly half of that on the landing
  page, but it changes the cascade order for all 18 templates and would
  leave the pre-rendered template pages unstyled until their chunk loads.
- Item 17: the five English labels that differed in capitals between the
  popup and the menus now match, and `check:section-schema` fails if they
  drift again.
- Item 18: the ResizeObserver message is the browser's own notice, not a
  failure, and could not be reproduced on demand; it is no longer logged
  as an unhandled error.
