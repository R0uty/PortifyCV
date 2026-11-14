# Builder review, second pass (Phase 5)

Started 2026-11-14 on `builder-review-2`, which sits on 1.6.87 (main plus
open PRs #24, #25 and #26). It covers what the first pass
(`docs/audit-builder-1.6.74.md`) listed as not covered.

Method, same as the first pass: review first, write the findings here,
then fix what is picked. Nothing in the review steps changes the app.

## Review steps

- [x] **A. The other 17 templates in the builder.** The first pass walked
      Minimalist only. For each template, in Direct Edit and in Classic:
      load the demo CV, open a section popup, toggle ATS view, and check
      for overflow, clipped text, broken popups and console errors.
- [x] **B. Finnish UI.** Builder chrome, menus and dialogs in `fi`:
      strings left in English, labels that are cut off or wrap badly.
- [x] **C. Word and HTML export.** Export the demo CV from several
      templates and read the files: missing sections or fields, wrong
      order, placeholder text that leaks into the file.
- [x] **D. Keyboard only.** Build a CV with no mouse in both modes: focus
      order, visible focus, traps, controls that cannot be reached.
- [x] **E. Phone.** 375 px wide with touch emulation, both modes. A real
      phone is still not covered.

## Carried over from the first pass

- [ ] **F. Footer and guide-page slogan.** "No login. No data saved." and
      "Nothing saved until you export." predate session restore being on
      by default (1.6.82). Owner's decision.
- [ ] **G. Split `CVForm.jsx`** (2,673 lines, item 15 of the first pass).
      Mechanical; best done after the open PRs are merged.

## Findings

Reviewed 2026-11-14 with scripted Playwright sweeps against the dev build
(1.6.87), plus reading the screenshots and exported files. Numbered in the
order I would fix them.

What came back clean: all 18 templates in Direct Edit with the demo CV
(every section popup opens with the right title and fields, no console
errors, no horizontal overflow, no text outside its column), ATS view on
all 18, no unlabelled form control in Classic, the popup's focus trap and
focus return, and no page overflow at 375 px in either mode.

### Bugs

- [x] **1. A section popup can open off-screen.** From the second popup
      onwards it is first drawn where the previous one was, the page
      scrolls to that stale spot, and only then does it move to its
      section. Measured at 1440x900: Developer, open Languages (bottom of
      the sidebar), close, open About: the popup sits 571 px above the
      top of the window. In single-column templates the same fault leaves
      a 630 px popup with about 230 px showing (Minimalist, Education).
      `SectionEditOverlay.jsx`: the scroll-into-view effect runs before
      `popupPosition` is recomputed.
- [x] **2. Collapsed Classic panels keep their controls in the Tab
      order.** With "Visible sections" closed (`aria-expanded="false"`,
      body 0 px high) Tab still walks its 16 hidden move buttons and
      switches, so focus disappears for 16 presses. Applies to every
      collapsed `.panel-section`.
- [x] **3. HTML export scrolls sideways on a phone.** 38 px of overflow at
      375 px: the experience date line (`.xp-date`, `white-space: nowrap`
      in `exporters.js`) cannot wrap.

Items 1 to 3 fixed in 1.6.88, each with an e2e test.

### Finnish

The Finnish UI is otherwise complete: 678 strings checked across the
toolbar, menus, gallery, Settings, Import, ATS and every section popup.

- [ ] **4. Three English leftovers.** The dialog close button's label is
      always "Close" (`Modal.jsx:90`); the ATS hint lists field names in
      English ("Lisää tai laajenna: full name, title, about",
      `atsScore.js`); achievement row buttons read "Move saavutus 1 up",
      "Remove saavutus 1".
- [ ] **5. One cut-off label.** "Kiinnostuksen kohteet" is clipped in the
      section rail at 1024 px.

### Keyboard and screen reader

- [ ] **6. Inline fields in Direct Edit have no name.** The nine
      click-to-type fields in the CV (name, title, email, phone,
      location, summary, role, company, description) are reachable with
      Tab and show a focus ring, but have no role or label, so a screen
      reader announces nothing for them.

### Phone

- [ ] **7. Small reorder buttons.** "Move section up/down" in Classic's
      Visible sections panel are 29x19 px.
- [ ] **8. "Back to editor" duplicates the bottom "Editor" tab** in
      Classic's phone preview, with an intro box above it. Same kind of
      duplicate as "Show preview", removed in 1.6.83.

### Worth a decision, not clearly bugs

- [ ] **9. Skills in Direct Edit do not look like the template.** Every
      template shows the same green editing chips while editing, whatever
      the template's own skill styling is.
- [ ] **10. European warns about length on the demo CV.** The red
      "Content may not fit one page" note shows as soon as the demo CV is
      loaded. It is not exported. Compact has the same note in its code
      but did not show it for the demo CV.
- [ ] **11. HTML export looks the same for every template.** One plain
      layout, with every filled section, whatever template is selected.
      Word also includes every filled section, in the template's order
      and column layout.

### Still not covered

- Word files were read as text and structure only; nothing on this
  machine can render a .docx.
- A real phone. Touch emulation only.
- Classic mode per template was left to the existing e2e layout harness
  (`template-layout.spec.js`, `template-content.spec.js`), which already
  walks all 18.
