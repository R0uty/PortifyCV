# Matching cover letter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the cover letter part of the CV, drafted in the CV's language and for the pasted job ad, and export it as a PDF in the selected template's look through the CV's own PDF pipeline.

**Architecture:** `formData.coverLetter` (four strings) replaces the four `coverLetter*` UI-state fields. The draft generator gains the job ad and the CV locale. A new off-screen `CoverLetterPage` is drawn live from `formData` and the builder's current look. It is exported with `renderCvPdf`/`saveRenderedCvPdf` in a letter mode through `PdfPreviewModal` (paper only), and falls back to the existing jsPDF text letter.

**Tech Stack:** React 19, hand-written CSS, html2canvas + jsPDF (lazy), framework-free Node checks, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-20-matching-cover-letter-design.md`

## Global Constraints

- Share links never carry `coverLetter`: a CV with a full letter encodes to exactly the same link as without it.
- The letter is drafted, dated and labelled in the CV's language (`resolveCvLocale(formData, locale)`). The dialog's own labels follow the app's language.
- The letter PDF offers paper only (A4 / US Letter): no Fit options and no "What a parser reads" tab. A long letter continues on page 2 and is never shrunk.
- The CV's PDF behaviour must not change: `template-pdf*`, `pdf-page-*` and `pdf-preview` specs stay green.
- File names: `<exportFileName>-cover-letter.pdf`, and `<exportFileName>-hakemuskirje.pdf` when the CV language is Finnish.
- Bilingual inline strings; no i18n library. Commits carry the user's name only, with no Co-Authored-By line. The version bump to 1.7.9 is its own commit, "Bump version to 1.7.9". Don't push.

## Review Focus

1. **Switching CV replaces the letter.** Opening a saved CV or loading the demo after writing a letter must not leave the old letter. Test in Task 1 (reducer) and Task 3 (e2e: write a letter, load the demo, and the letter is empty).
2. **A style change shows in the next letter export.** Change the template's look, and the letter page's font and heading colour follow. Test in Task 4 (e2e: compare computed `font-family` and colour on `[data-cover-letter]` before and after choosing another look).
3. **Finnish letters keep ä/ö in the PDF text.** Test in Task 4: the text layer of a Finnish letter's PDF contains "Ystävällisin terveisin".
4. **A long letter makes two pages, unshrunk.** Test in Task 4: a body of 40 paragraphs gives a PDF with 2 or more pages.
5. **ATS mode makes the letter plain.** Test in Task 4: with ATS-friendly on, the letter header's computed colour is black-ish (`rgb(0, 0, 0)`/near) and the font is the default.

---

### Task 1: The letter is CV data

**Files:**
- Modify:
  - `src/utils/cvForm.js`: `createEmptyCoverLetter()`, a `coverLetter` field in the initial and empty CV, normalisation in the validator near `cvLanguage` (line ~1474): a non-object or missing value becomes empty, and each of the four keys is coerced to a string.
  - `src/types/cv.d.ts`: a `CoverLetter` typedef.
  - `src/reducers/uiReducer.js`: remove `coverLetterCompany/Role/HiringManager/Body` and their actions.
  - `src/pages/ResumeBuilderPage.jsx`: the dialog props read `formData.coverLetter`, and the change handlers dispatch `SET_ROOT_FIELD` with `field: 'coverLetter'` and the whole next object.
  - `scripts/check-reducers.mjs` and `scripts/check-share-links.mjs`.
  - `src/utils/shareLinks.js`: only if the encoder doesn't already ignore unknown root keys.
- Test: the check scripts above.

**Interfaces:**
- Produces:
  - `createEmptyCoverLetter(): { company: '', role: '', hiringManager: '', body: '' }`, exported from `cvForm.js`
  - `formData.coverLetter` always has that shape after normalisation
  - The letter is updated with `dispatchFormData({ type: FORM_ACTION.SET_ROOT_FIELD, field: 'coverLetter', value: nextLetter })`

- [ ] **Step 1: Write the failing checks.**
  - **check:reducers:**
    - `SET_ROOT_FIELD` with `coverLetter` stores the object.
    - `SET_FORM_DATA` with a CV that has no `coverLetter` gives `createEmptyCoverLetter()` after normalisation (use the same normaliser JSON import uses).
    - A CV carrying `{ company: 5, body: 'x' }` normalises to `{ company: '', role: '', hiringManager: '', body: 'x' }`.
    - The four UI actions no longer exist.
  - **check:share:** `encodeShareLink(cvWithLetter) === encodeShareLink(cvWithoutLetter)`, using the module's real encode function. The decoded CV's `coverLetter` deep-equals `createEmptyCoverLetter()`.
- [ ] **Step 2:** Run `npm run check:reducers` and `npm run check:share`. Expected: both FAIL.
- [ ] **Step 3:** Implement. Keep the dialog working on the new data; drafting changes come in Task 2.
- [ ] **Step 4:** Run `npm run check:reducers`, `check:share`, `check:cv-library`, `npm run lint` and `npx playwright test e2e/cover-letter.spec.js`. Expected: all pass. The existing cover-letter specs still pass because the behaviour is unchanged.
- [ ] **Step 5: Commit.** "Keep the cover letter with the CV".

### Task 2: Drafting for the job, in the CV's language

**Files:**
- Modify:
  - `src/utils/coverLetter.js`
  - `src/utils/jobMatch.js`: export `jobTitleFromAd`
  - `src/pages/ResumeBuilderPage.jsx`: `handleSaveCopyForJob` uses `jobTitleFromAd`; `handleGenerateCoverLetter` passes `locale: cvLocale` and `jobAd: jobDescription`
  - `scripts/check-job-match.mjs`: the cases below, with a header line saying they also cover the cover-letter draft

**Interfaces:**
- Produces:
  - `jobTitleFromAd(ad: string): string`. Returns the ad's first non-empty line with trailing `.:;,` removed, when it is 40 characters or fewer; otherwise `''`.
  - `generateCoverLetterDraft(formData, { locale, companyName, roleTitle, hiringManagerName, jobAd? }): string`. With a non-empty `jobAd` whose `matchJobAd(formData, jobAd).found` is non-empty, the skills paragraph names the first 4 found terms in ad order. Otherwise it keeps today's top-6 skills.

- [ ] **Step 1: Write the failing cases.**
  - `jobTitleFromAd('Senior Frontend Developer.\nWe are…')` → `'Senior Frontend Developer'`.
  - A first line over 40 characters → `''`.
  - `jobTitleFromAd('')` → `''`.
  - With the demo-like CV from `createInitialCvData` filled with skills `['React','TypeScript','Figma','SQL']`, an ad mentioning "TypeScript and React, WCAG": the EN draft contains "TypeScript" and "React" and does not contain "Figma". The FI draft (`locale: 'fi'`) contains "Ystävällisin terveisin".
  - No ad → the draft names the CV's skills as today.
- [ ] **Step 2:** Run `npm run check:job-match`. Expected: FAIL.
- [ ] **Step 3:** Implement. For an ad with found terms, the EN line is "My experience covers what this role asks for: X, Y and Z." and the FI line is "Kokemukseni kattaa sen, mitä tehtävässä haetaan: X, Y ja Z." (use `joinWithAnd`).
- [ ] **Step 4:** Run `npm run check:job-match`, `npm run lint` and `npx playwright test e2e/cover-letter.spec.js e2e/job-match.spec.js`. Expected: all pass.
- [ ] **Step 5: Commit.** "Draft the cover letter for the job ad, in the CV's language".

### Task 3: The dialog

**Files:**
- Modify:
  - `src/components/CoverLetterModal.jsx`
  - `src/pages/ResumeBuilderPage.jsx`: open handler, Regenerate confirm
  - `e2e/cover-letter.spec.js`

Behaviour:
- **Prefilling the role.** On open, when `jobDescription` is non-empty and `coverLetter.role` is empty, set the role to `jobTitleFromAd(jobDescription)` if that isn't empty. When an ad is pasted, show a note above the fields: "Using the job ad from the ATS check." / "Käytössä ATS-tarkistuksen työpaikkailmoitus."
- **Regenerate.** Before replacing a non-empty body that differs from `generateCoverLetterDraft(...)` with the current inputs, ask with `window.confirm`: "Replace your edited letter with a new draft?" / "Korvataanko muokattu kirje uudella luonnoksella?" Cancel keeps the body.
- **Inputs.** Every letter input spreads `useCvTextProps()` (company and hiring manager with `field: 'company'` / `'organization'` so spell check is off).

- [ ] **Step 1: Add e2e tests to `e2e/cover-letter.spec.js`.**
  - "the letter survives a reload": generate, reload with session restore, open the dialog, and the draft is unchanged.
  - "the letter travels in JSON export": export JSON, and the file has `coverLetter.body` containing "John Doe".
  - "loading the demo replaces the letter": type a body, Load demo CV, reopen the dialog, and the body is empty.
  - "a Finnish CV in the English builder drafts in Finnish": set CV language to Suomi (pattern from `cv-language.spec.js`) and generate; the draft contains "Ystävällisin terveisin" and the dialog title is "Cover letter".
  - "a pasted job ad fills the role": paste "Senior Product Designer\nFigma, user research…" into the ATS panel's job box, then open the letter; the Role field is "Senior Product Designer" and the note shows.
  - "Regenerate asks before replacing an edited letter": generate, edit the body, Regenerate, and dismiss the dialog (`page.once('dialog', d => d.dismiss())`); the body is unchanged.
- [ ] **Step 2:** Run `npx playwright test e2e/cover-letter.spec.js`. Expected: the new tests FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npx playwright test e2e/cover-letter.spec.js e2e/session-restore.spec.js e2e/saved-cvs.spec.js` and `npm run lint`. Expected: all pass.
- [ ] **Step 5: Commit.** "Bind the cover letter dialog to the CV and the job ad".

### Task 4: The letter page and its PDF

**Files:**
- Create: `src/components/CoverLetterPage.jsx` and `src/styles/cover-letter.css` (imported from `src/index.css`).
- Modify:
  - `src/pages/ResumeBuilderPage.jsx`: mount one off-screen, inert `CoverLetterPage` with a `letterRef`, outside both modes, next to the PDF preview; add `renderLetterPdf({ paper })` and the letter download; Download PDF closes the letter dialog and opens `PdfPreviewModal` with `kind="letter"`, and closing returns to the letter dialog.
  - `src/components/PdfPreviewModal.jsx`: a `kind` prop, `'cv'` by default; `'letter'` hides the Fit control and the parser tab, and the title says "Cover letter PDF" / "Hakemuskirjeen PDF".
  - `src/utils/exporters.js`: `renderCvPdf(…, { document: 'letter' })` takes a letter root, with fit fixed to `actual` and the page breaks still kept out of text lines; the CV path is unchanged. `exportCoverLetterAsPdf(letterText, fileName, { header })` becomes the fallback and gains the name and contact line.
- Test: `e2e/cover-letter.spec.js`, plus `e2e/helpers/pdfPreview.js`'s `downloadFromPdfPreview`.

**Interfaces:**
- Consumes: `formData.coverLetter` (Task 1); `cvLocale`; and the builder state `selectedTemplate`, `atsFriendlyMode`, `cvFontId`, `cvHeadingColor`, `templateAccentColors`, `formData.styleVariantByTemplate`.
- Produces: `<CoverLetterPage formData letter template atsFriendlyMode fontStack headingColor accent locale />`. Its root has `data-cover-letter` and `data-export-variant="cover-letter"`. The name element carries `data-cv-name`; contact values use `.tpl-value-breakable` and paragraphs use `.tpl-text-wrappable`.

Look:
- **Designer mode:** the font is the CV's current font stack (`getCvFontStack` of the look's or the chosen `fontId`). The heading colour is `cvHeadingColor`, else the look's `headingColor`, else the accent. The accent is `resolveTemplateAccent(templateAccentColors, template)`, else the heading colour, else `#1f2937`.
- **ATS mode:** the default font stack, `#000` text and no accent rule colour.
- **Page content, top to bottom:** name (heading), professional title, one contact line (email · phone · location · first link), an accent rule, the date (`Intl.DateTimeFormat(cvLocale, { dateStyle: 'long' })`), the recipient line ("hiringManager, company", dropping empty parts), then the body paragraphs split on blank lines. Use no photo and no `<h1>`/`<h2>` tags that would land on marketing pages; this page only mounts in the builder.

- [ ] **Step 1: Write e2e tests**, marked `@slow` because they export PDFs.
  - "the letter PDF looks like the CV and reads as text":
    - load the demo, generate, Download PDF, and get the file via the preview
    - the preview dialog has no "Fit" control and no "What a parser reads" tab
    - the PDF's text (read with the same pdf.js approach `pdf-text-layer.spec.js` uses) contains "John Doe", the company "Northwind Labs" and the first sentence of the body
    - the file name ends `-cover-letter.pdf`
  - Review Focus 2: choose another look in the Style menu; `[data-cover-letter]`'s computed `font-family` or heading `color` changes.
  - Review Focus 3: a Finnish CV's letter PDF text contains "Ystävällisin terveisin".
  - Review Focus 4: a body of 40 paragraphs gives a PDF with ≥ 2 pages.
  - Review Focus 5: with ATS-friendly on, the header colour is `rgb(0, 0, 0)`.
- [ ] **Step 2:** Run `npx playwright test e2e/cover-letter.spec.js`. Expected: the new tests FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npx playwright test e2e/cover-letter.spec.js e2e/pdf-preview.spec.js e2e/pdf-page-breaks.spec.js e2e/template-pdf.spec.js` and `npm run lint`. Expected: all pass.
- [ ] **Step 5: Commit.** "Export the cover letter in the CV's look".

### Task 5: Exports, docs, verification, version

**Files:**
- Modify:
  - `e2e/export-fields.spec.js`: exclude `coverLetter` from the "every field reaches HTML/Word/ATS PDF" sweep, with a comment that it is the letter, not CV content, and travels in JSON only.
  - `CLAUDE.md`: add a "Cover letter (1.7.9)" paragraph after the bullet ideas one.
  - `src/pages/HowToUseTheBuilderPage.jsx` and/or `src/pages/CoverLetterExamplesPage.jsx`: one true EN+FI sentence where the builder's cover letter is described. Check each claim against the code.

- [ ] **Step 1: Edit the files above.**
- [ ] **Step 2: Run the checks.**
  - `npm run lint`, `npm run build` and all 13 `check:*`
  - if `check:thumbnails` fails, run `npm run thumbnails` and commit `public/thumbnails/` as "Regenerate the thumbnails"
- [ ] **Step 3: Run the e2e suites.** `npm run test:e2e:fast` and `npm run test:e2e:slow` both pass.
- [ ] **Step 4: Commit.** Commit as "Describe the cover letter in CLAUDE.md", then run `npm version 1.7.9 --no-git-tag-version` and commit "Bump version to 1.7.9".
