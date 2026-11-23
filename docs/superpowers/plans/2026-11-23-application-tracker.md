# Application Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a visitor mark the CV on screen as sent to a company, keeping the exact PDF (and letter PDF) in this browser, and list, view, reuse and delete those applications.

**Architecture:** A new IndexedDB database (`portifycv-applications`) behind `src/utils/applicationLog.js`, modelled on `cvLibrary.js`. Marking renders through the builder's existing `renderCvPdf` paths and stores the blob plus page images. My CVs gains an Applications tab, a read-only View sent dialog shows the stored pages, and Start new CV puts the stored data back in the builder as one undo step.

**Tech Stack:** React 19, IndexedDB, existing `exporters.js` PDF pipeline, Node `check:*` scripts, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-23-application-tracker-design.md`

## Global Constraints

- Branch `v1.7.0`; release 1.7.11. Last task bumps with `npm version 1.7.11 --no-git-tag-version`, its own commit "Bump version to 1.7.11".
- No Co-Authored-By or any Claude attribution in commits.
- Database `portifycv-applications`, store `applications`, `keyPath: 'id'`, version 1. Never open or change the `portifycv` database.
- Statuses exactly `'applied' | 'interview' | 'offer' | 'rejected' | 'no-reply'`; new records start `'applied'`.
- `appliedOn` is `'YYYY-MM-DD'`.
- Saved CVs, the builder's CV PDF and the letter PDF behave exactly as before (`e2e/saved-cvs.spec.js`, `e2e/cover-letter.spec.js`, PDF specs unchanged and green).
- Every user-facing string in English and Finnish (`isFinnish ? … : …`); copy claims checked against the code.
- No import of `exporters.js` or `applicationLog.js` from the entry graph statically beyond what `cvLibrary.js` already does (dynamic `import('../utils/exporters')` as today).
- Fixed copy: dialog line "A PDF of this CV and its cover letter, as they look now, is kept with the application in this browser." Delete confirm "Delete the application to {company}? The PDF that was sent goes with it." Toast "Saved to Applications".

## Review Focus

1. Pressing Save in Mark as applied twice (or Enter twice) while it renders → exactly one application. Test in Task 3.
2. Typing a note and closing the dialog at once → the note is stored. Test in Task 4.
3. A cover letter whose body is only spaces → no letter stored, View sent has no CV/letter switch. Test in Task 3.
4. An application added in another tab → shown when this tab opens the Applications tab. Test in Task 4.
5. A record whose `templateId` no longer exists (or is the legacy `classic`) → Start new CV opens it in the aliased or default template, no crash. e2e case in Task 5, writing such a record straight into IndexedDB.

---

### Task 1: The applications store

**Files:**
- Create: `src/utils/applicationLog.js`
- Create: `scripts/check-applications.mjs`
- Modify: `package.json` (script `check:applications`), `.github/workflows/ci.yml` (step after `check:cv-library`), `CLAUDE.md` (Commands list, the "thirteen" count → fourteen, and the check list sentence)

**Interfaces:**
- Produces:
  - `APPLICATION_STATUSES: readonly string[]` (the five, in that order)
  - `isApplicationLogAvailable(): boolean`
  - `createApplicationRecord({ company, role, appliedOn, adUrl = '', cv, letter = null, source, now = Date.now(), id }) → ApplicationRecord` (status `'applied'`, note `''`, `createdAt = updatedAt = now`; trims company/role/adUrl; company/role cut to 120 chars, note to 2000)
  - `isValidApplicationRecord(record): boolean` (id string, company and role non-empty, `appliedOn` matches `/^\d{4}-\d{2}-\d{2}$/`, status in list, `cv.pdf` present, `source.data` object, `source.templateId` string)
  - `sortApplications(records) → records` (by `appliedOn` desc, then `createdAt` desc; does not mutate)
  - `applyApplicationUpdate(record, changes, now) → record` (only `company, role, appliedOn, adUrl, status, note`; ignores any other key; invalid status or date or empty company/role keeps the old value; bumps `updatedAt`)
  - `listApplications() → Promise<ApplicationSummary[]>` (records without `cv`, `letter`, `source` blobs/data but with `hasLetter: boolean`, sorted)
  - `countApplications() → Promise<number>`
  - `getApplication(id) → Promise<ApplicationRecord|null>`
  - `addApplication(record) → Promise<ApplicationRecord>` (rejects `code: 'invalid'` if not valid)
  - `updateApplication(id, changes) → Promise<ApplicationSummary>` (`code: 'missing'` if gone)
  - `deleteApplication(id)`, `clearApplications()`
  - Errors carry `code` `'unavailable' | 'full' | 'failed' | 'missing' | 'invalid'`, as `cvLibrary.js`.

- [ ] **Step 1: Write `scripts/check-applications.mjs`** in `check-cv-library.mjs`'s style (`check`/`same`, exit non-zero on failure), with cases:
  - `createApplicationRecord` keys are exactly `adUrl, appliedOn, company, createdAt, cv, id, letter, note, role, source, status, updatedAt`; status `'applied'`; note `''`; `'  Acme  Oy '` → `'Acme  Oy'` trimmed (spaces inside kept); 200-char company → 120.
  - `isValidApplicationRecord`: a full record true; each of empty company, empty role, `appliedOn: '23.11.2026'`, `status: 'ghosted'`, missing `cv.pdf`, missing `source` → false.
  - `sortApplications`: `[{appliedOn:'2026-11-02',createdAt:5},{appliedOn:'2026-11-12',createdAt:1},{appliedOn:'2026-11-12',createdAt:3}]` → createdAt order `[3,1,5]`; input array unchanged.
  - `applyApplicationUpdate`: `{ status:'interview', note:'Call Tue' }` applied, `updatedAt` = now; `{ cv: null, source: null, letter: null, id:'x', createdAt: 0 }` leaves those untouched; `{ status:'ghosted' }`, `{ appliedOn:'tomorrow' }`, `{ company:'  ' }` keep the old values.
  - `APPLICATION_STATUSES` equals `['applied','interview','offer','rejected','no-reply']`.
  - `isApplicationLogAvailable()` is false in Node, and `listApplications()` rejects with `code: 'unavailable'`.
- [ ] **Step 2: Run `node scripts/check-applications.mjs`** — Expected: fails (module missing).
- [ ] **Step 3: Implement `src/utils/applicationLog.js`** with the interfaces above; IndexedDB plumbing copied in shape from `cvLibrary.js` (one connection per call, closed after; `QuotaExceededError` → `'full'`; `onblocked` → `'unavailable'`). A header comment saying what it stores and that it is separate from the saved-CV database on purpose (spec, Approaches B).
- [ ] **Step 4: Run `npm run check:applications` and `npm run check:cv-library`** — Expected: all `ok`.
- [ ] **Step 5: Commit** — "Keep applications in their own browser database"

### Task 2: A rendered PDF as stored files

**Files:**
- Modify: `src/utils/exporters.js`

**Interfaces:**
- Produces: `renderedCvPdfToStoredFiles(rendered) → Promise<{ pdf: Blob, fileName: string, paper: string, fit: string, pages: { image: Blob }[] }>`
  - Normal: `pdf` = `buildRenderedPdfBlob(rendered)` (same bytes `saveRenderedCvPdf` saves), `fileName` = `${rendered.exportName}.pdf`, `pages[i].image` = the page's `imageDataUrl` turned into a Blob (fetch the data URL; no re-encode).
  - Fallback (`rendered.fallback`): `pdf` = the text-only PDF as a Blob, `pages: []`, `fileName` as the fallback download would name it.
  - `paper`/`fit` from the render (`fit` is `'actual'` for a letter).
- Consumes: nothing new.

- [ ] **Step 1: Refactor the two fallback writers** (`exportCoverLetterAsPdf`, `exportCvAsPdfTextFallback`) so each has a blob-returning core (`…Blob(…) → Promise<Blob>`) and the existing functions call it then `saveAs` it. `saveRenderedCvPdf`'s downloads must be unchanged.
- [ ] **Step 2: Implement `renderedCvPdfToStoredFiles`** next to `renderedCvPdfToBlob`, with a comment naming its caller (Mark as applied, 1.7.11).
- [ ] **Step 3: Run `npm run lint && npm run check:docx-export && npx playwright test e2e/cover-letter.spec.js e2e/pdf-preview.spec.js`** — Expected: green. Behaviour is tested end to end in Tasks 3 and 6.
- [ ] **Step 4: Commit** — "Turn a rendered PDF into files to keep"

### Task 3: Mark as applied

**Files:**
- Create: `src/components/MarkAppliedModal.jsx`
- Modify: `src/components/Toolbar.jsx` (a "Mark as applied" / "Merkitse haetuksi" item in the More menu right after My CVs, icon `Send`; prop `onMarkApplied`), `src/pages/ResumeBuilderPage.jsx`
- Test: `e2e/applications.spec.js` (new)

**Interfaces:**
- Consumes: Task 1 `createApplicationRecord`, `addApplication`, `isApplicationLogAvailable`; Task 2 `renderedCvPdfToStoredFiles`; `jobTitleFromAd` (`src/utils/jobMatch.js`); the builder's `renderPdfPreview({ paper, fit })` and `renderLetterPdf({ paper })`.
- Produces: `MarkAppliedModal` props `{ isOpen, onClose, locale, initialCompany, initialRole, initialPaper, initialFit, onSubmit: ({ company, role, appliedOn, adUrl, paper, fit }) => Promise<void>, isAvailable }`. Builder state `applicationsVersion` (a counter bumped after each add/delete, read by Task 4's hook to refresh). Builder opens My CVs on the Applications tab through `openSavedCvs('applications')`.

- [ ] **Step 1: Write e2e tests** in `e2e/applications.spec.js` (reuse `e2e/saved-cvs.spec.js`'s builder setup helpers; open the menu the way that spec opens My CVs):
  - `mark as applied stores an application from Classic mode`: load demo, open Mark as applied, fill company "Acme Oy", role "Frontend Developer", Save → toast "Saved to Applications"; one stored record with "Acme Oy", "Frontend Developer", today's date, status "Applied". Until Task 4 lands, Task 3's tests assert the stored record through `page.evaluate` on IndexedDB `portifycv-applications`; Task 4 adds the row assertions.
  - `…from Direct Edit mode`: same, in Direct Edit.
  - `company and role are prefilled from the cover letter, else from the pasted ad`: letter company "Globex", role "UI Engineer" → both prefilled; with an empty letter role and an ATS ad starting "Senior React Developer\n…" → role "Senior React Developer".
  - `company and role are required`: Save with empty company shows an inline error and stores nothing.
  - `pressing Save twice stores one application` (Review Focus 1): double-click Save → one row.
  - `a letter of only spaces is not stored` (Review Focus 3): set letter body to "   ", mark → row's View sent later has no CV/letter switch (assert through the stored record: `page.evaluate` reading IndexedDB `portifycv-applications` → `letter === null`).
  - `IndexedDB blocked shows the unavailable message`: same `addInitScript` blocking as `saved-cvs.spec.js`; the menu item opens the dialog with the saved-CVs unavailable wording and no Save.
- [ ] **Step 2: Run `npx playwright test e2e/applications.spec.js`** — Expected: FAIL (no menu item).
- [ ] **Step 3: Implement `MarkAppliedModal`** (uses `Modal`; fields company, role, date `<input type="date">` default today in local time, ad link, paper radio A4/US Letter, Fit select of the four `PDF_FIT_MODES` with the same labels as `PdfPreviewModal`'s `FIT_OPTIONS` (export them from there rather than copying); the fixed copy line; a busy state that disables Save and shows "Saving the PDF…"/"Tallennetaan PDF:ää…"; an error line on failure, "full" → browser storage is full).
- [ ] **Step 4: Wire it in `ResumeBuilderPage.jsx`**: `handleMarkApplied` renders the CV with `renderPdfPreview({ paper, fit })` and, when `coverLetterBody.trim()` is non-empty, the letter with `renderLetterPdf({ paper })`; converts both with `renderedCvPdfToStoredFiles`; builds `source = { data: structuredClone(formData), templateId: selectedTemplate, look: { atsFriendlyMode, cvFontId, cvHeadingColor, accentColor: resolveTemplateAccent(templateAccentColors, selectedTemplate), classicNameAlignment } }`; `addApplication(createApplicationRecord(…))`; on success closes, bumps `applicationsVersion`, toasts with an action opening Applications; a ref guard makes a second submit while busy a no-op. Prefill: company `formData.coverLetter.company`, role `formData.coverLetter.role || jobTitleFromAd(jobDescription) || ''`.
- [ ] **Step 5: Run `npx playwright test e2e/applications.spec.js e2e/saved-cvs.spec.js`** — Expected: PASS.
- [ ] **Step 6: Commit** — "Mark a CV as sent to a company"

### Task 4: The Applications tab, Settings and privacy

**Files:**
- Create: `src/hooks/useApplications.js`
- Modify: `src/components/SavedCvsModal.jsx` (tabs), `src/components/SettingsModal.jsx` (row), `src/pages/ResumeBuilderPage.jsx`, `src/pages/PrivacyPolicyPage.jsx` (both languages, the IndexedDB paragraphs near lines 89 and 272)
- Test: `e2e/applications.spec.js`

**Interfaces:**
- Consumes: Task 1 list/update/delete/clear/count; Task 3 `applicationsVersion`.
- Produces: `useApplications({ version }) → { isAvailable, applications: ApplicationSummary[], count, refresh(), update(id, changes), remove(id), removeAll() }` (refreshes on mount, when `version` changes, and on `refresh()`). `SavedCvsModal` new props `{ applications, onUpdateApplication, onDeleteApplication, onViewApplication(id), onStartFromApplication(id) }` and `view` value `'applications'`. `SettingsModal` props `{ applicationCount, onDeleteAllApplications }`.

- [ ] **Step 1: Write e2e tests:**
  - `status and note survive a reload`: mark one, set status "Interview", type note "Call on Tuesday", blur; reload; reopen → both kept.
  - `a note typed just before closing is kept` (Review Focus 2): type a note, press Escape immediately, reopen → note there.
  - `an application from another tab shows when the tab opens` (Review Focus 4): two pages in one context; mark in page B; open Applications in page A → row present.
  - `delete asks first`: Delete → confirm text "Delete the application to Acme Oy? The PDF that was sent goes with it."; Cancel keeps it; confirm removes it.
  - `Delete all applications clears only applications`: one saved CV + one application; Settings › Delete all applications (confirm) → Applications empty, My CVs still lists the CV. Then Delete all saved CVs → the CV gone, (re-mark first) an application stays.
  - Finnish: tab label "Haut" with count, status labels shown in Finnish.
- [ ] **Step 2: Run them** — Expected: FAIL.
- [ ] **Step 3: Implement `useApplications`** and the tab: "My CVs" / "Applications (N)" ("Omat CV:t" / "Haut (N)") as a tablist; rows newest first: company, role, date (`toLocaleDateString` in the app locale from `appliedOn`), status `<select>` (Applied/Haettu, Interview/Haastattelu, Offer/Tarjous, Rejected/Hylätty, No reply/Ei vastausta), note `<textarea>` saving 600 ms after typing stops and on blur and on unmount (flush pending), buttons View sent, Start new CV from it, Delete (confirm). Empty state: "Mark a CV as applied from the menu to keep the PDF you sent here." / Finnish. Opening the modal on Applications calls `refresh()`.
- [ ] **Step 4: Settings row** "Delete all applications" / "Poista kaikki haut" shown when `applicationCount > 0`, with a confirm, next to "Delete all saved CVs" and styled like it.
- [ ] **Step 5: Privacy policy**: add to both languages' IndexedDB paragraph that applications (company, role, dates, notes, the PDFs and the CV data they were made from) are kept in a separate database in this browser after Mark as applied, never sent anywhere, deleted per application from My CVs or all at once from Settings.
- [ ] **Step 6: Run `npx playwright test e2e/applications.spec.js e2e/saved-cvs.spec.js `** (no Settings spec exists; Settings is covered here) — Expected: PASS.
- [ ] **Step 7: Commit** — "List applications in My CVs"

### Task 5: View sent and Start new CV

**Files:**
- Create: `src/components/ApplicationViewModal.jsx`
- Modify: `src/pages/ResumeBuilderPage.jsx`, `src/components/PdfPreviewModal.jsx` (export the page-frame component for reuse if it fits; otherwise copy only its CSS class names)
- Test: `e2e/applications.spec.js`

**Interfaces:**
- Consumes: Task 1 `getApplication`; Task 4's `onViewApplication`/`onStartFromApplication`; `recordTemplateLookStep`, `resolveTemplateId`, `parseImportedCvData` (`src/utils/cvForm.js`, the JSON import's validation), `UI_ACTION.RESTORE_TEMPLATE_LOOK`, `TOGGLE_ATS_MODE`, `SET_CLASSIC_NAME_ALIGNMENT`, `detachSavedCv`.
- Produces: `ApplicationViewModal` props `{ application: ApplicationRecord | null, locale, onClose, onStartNewCv(id) }`.

- [ ] **Step 1: Write e2e tests:**
  - `View sent shows the pages that were stored, not today's CV`: mark with name "Jane Example"; change the name to "Changed Name" and switch template; View sent → page images count ≥ 1, header shows company/role/date; the downloaded PDF (Download button) text layer contains "Jane Example" and not "Changed Name" (read it with the same helper `pdf-parser-view`/`cover-letter` specs use).
  - `CV / Cover letter switch appears only with a letter`.
  - `Start new CV puts the sent CV back and Undo restores the previous one`: mark in template A; switch to template B and edit the name; Start new CV from it → name and template A back; Undo → template B and the edited name.
  - `an application in a retired template opens in its replacement` (Review Focus 5): write a record with `source.templateId: 'classic'` into IndexedDB via `page.evaluate`, then Start new CV → template is Classic Professional; with `'no-such-template'` → default template, no error toast.
  - `a fallback PDF shows a note instead of pages`: write a record with `cv.pages: []` → View sent shows "There's no picture of this PDF. Download it to see it." / Finnish, and Download works.
- [ ] **Step 2: Run them** — Expected: FAIL.
- [ ] **Step 3: Implement `ApplicationViewModal`**: loads nothing itself (the builder passes the full record from `getApplication`); object URLs for page images and the PDF created on open and revoked on close; pages at the stored paper's proportions; Download saves `pdf` as `fileName` (`file-saver`'s `saveAs`, as `exporters.js` uses); Start new CV from it button.
- [ ] **Step 4: Implement `handleStartFromApplication(id)`** in the builder: get the record, `parseImportedCvData(source.data)` (invalid → error toast, nothing changes), `detachSavedCv()`, `recordTemplateLookStep({ skipNextCommit: false })`, `SET_FORM_DATA`, `RESTORE_TEMPLATE_LOOK` with `{ selectedTemplate: resolveTemplateId(templateId) ?? defaultTemplateId, templateAccentColors: { ...templateAccentColors, [that template]: look.accentColor }, cvFontId: look.cvFontId, cvHeadingColor: look.cvHeadingColor }` (`defaultTemplateId` from `src/utils/cvTemplates.js`), then ATS mode and name alignment set to the stored values (not undone, per spec call 1); `markCvSaved` not called (it is unsaved). Close both dialogs and toast "Started a new CV from the application to {company}." / Finnish.
- [ ] **Step 5: Run `npx playwright test e2e/applications.spec.js e2e/saved-cvs.spec.js`** — Expected: PASS.
- [ ] **Step 6: Commit** — "View the PDF that was sent and start a CV from it"

### Task 6: Slow PDF checks, docs, version

**Files:**
- Modify: `e2e/applications.spec.js`, `CLAUDE.md`, `package.json`

- [ ] **Step 1: Add `@slow` tests:** `the stored PDF is the downloaded PDF @slow` (mark with paper US Letter, fit one-page; the View sent download's bytes equal what the PDF preview's download produces for the same paper/fit at that moment, compared by page count and text layer, since the worker may stamp dates); `a letter is stored as its own PDF @slow` (letter body sentence found in the letter download's text layer, A4/US Letter as chosen).
- [ ] **Step 2: Run `npm run test:e2e:slow -- e2e/applications.spec.js`** — Expected: PASS.
- [ ] **Step 3: CLAUDE.md**: an "**Applications (1.7.11) keep the PDF that was sent.**" paragraph after the LinkedIn one: the separate database and why (an old tab can't open an upgraded `portifycv`), the record's `cv`/`letter`/`source`, that View sent never re-renders, Start new CV's undo step, Settings' separate delete-all, and where the tests are.
- [ ] **Step 4: Run `npm run lint`, all `check:*` scripts, `npm run test:e2e:fast`** — Expected: green.
- [ ] **Step 5: Commit** — "Document the application tracker"
- [ ] **Step 6:** `npm version 1.7.11 --no-git-tag-version`; commit "Bump version to 1.7.11".
