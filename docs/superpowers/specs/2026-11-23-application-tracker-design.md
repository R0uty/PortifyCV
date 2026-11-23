# Application tracker — design

Draft 2026-11-23, for 1.7.11 on `v1.7.0`. Next item from the 2026-11-19
competitor review (Teal, Huntr and Kickresume all have a job tracker).

## Intent

During a job hunt people lose track of **which CV went where**: which
version, with which letter, went to which company. That is what the user
wants fixed (2026-11-22). Statuses come second.

PortifyCV already has most of the pieces: saved CVs in IndexedDB (1.7.1),
"Save a copy for this job" in the ATS panel (1.7.2), and a cover letter that
is part of the CV (1.7.9). But a saved CV keeps auto-saving, so a week later
it no longer shows what a company received. The tracker keeps a **frozen
copy** of what was sent (user's decision, 2026-11-22), and that copy is
**the PDF itself** (user's decision, 2026-11-23), so it can't drift when
templates are redesigned or retired later.

## Goals

1. **Mark as applied.** From the builder, record an application: company,
   role, date, an optional link to the ad, and the PDF's paper and fit. It
   renders the CV, and the letter if it has a body, to PDF exactly as
   Download does and stores those files with the CV's data.
2. **A list of applications,** newest first, as a second tab of the My CVs
   dialog ("My CVs | Applications (N)"). Each row shows the company, the
   role, the date, a status you can change, a note, and three actions: View
   sent, Start new CV from it, and Delete.
3. **View sent** shows the stored pages of the CV (and of the letter, behind
   a switch), and Download gives back the stored files byte for byte.
4. **Start new CV from it** puts the stored CV data in the builder as a new,
   unsaved CV, in the template and look it was sent in.
5. **In this browser only,** like saved CVs. The dialog, Settings and the
   privacy policy say so.

## Non-goals

- Reminders, contacts, salary, interview dates, a drag-and-drop board
  (user agreed, 2026-11-22).
- Editing a stored application's CV or PDF. It is a record. Company, role,
  date, link, status and note stay editable.
- Sync, accounts, export of the application list.
- Linking an application to a saved CV.
- Share links never carry applications.
- Attaching a PDF made elsewhere (only what PortifyCV renders is stored).

## Anti-goals

- View sent showing anything other than the file the visitor would have
  downloaded at that moment.
- Any change to how saved CVs, the builder's CV PDF or the letter PDF
  behave. "Delete all saved CVs" doesn't touch applications.
- An application that changes when the CV it came from is edited, saved
  or deleted.
- Losing applications without warning: deleting always asks first.

## Approaches (decided)

User chose **B + 1** (2026-11-23), then **keep the PDF** (2026-11-23).

Storage:
- A. A second store in the existing `portifycv` database (version 2).
  Rejected: after deploy, a tab still running the old code can't open a
  version-2 database and would show saved CVs as unavailable until reloaded.
- **B. Its own database (chosen),** e.g. `portifycv-applications`, store
  `applications`, `keyPath: 'id'`. It never touches saved CVs.

View sent:
- **1. A read-only viewer dialog (chosen).**
- 2. Open it in the builder as a new unsaved CV. Rejected: it replaces the
  screen and is editable at once.

What the viewer shows:
- Redraw the stored data with today's template code. Rejected: templates
  are redesigned and retired (`LEGACY_TEMPLATE_ALIASES`), so the picture
  would drift from what was sent.
- **Store the PDF at marking time (chosen).** Marking takes the seconds a
  PDF takes, and each application holds about 2–5 MB (files plus page
  images).

## Shape

### Record

```
{
  id, company, role, appliedOn /* 'YYYY-MM-DD' */, adUrl,
  status /* 'applied' | 'interview' | 'offer' | 'rejected' | 'no-reply' */,
  note,
  cv:     { pdf: Blob, fileName, paper, fit, pages: [{ image: Blob }] },
  letter: { pdf: Blob, fileName, paper, pages: [{ image: Blob }] } | null,
  source: { data /* CvData, letter included */, templateId,
            look: { atsFriendlyMode, cvFontId, cvHeadingColor, accentColor,
                    classicNameAlignment } },
  createdAt, updatedAt,
}
```

- `pdf` is exactly what `renderedCvPdfToBlob(rendered)` returns, the same
  bytes Download saves.
- `pages[].image` is each rendered page's `imageDataUrl` as a Blob (as
  rendered; no re-encode needed), used only for display.
- `source` serves only Start new CV. The look fields live in `uiState`,
  not `CvData`, so they are copied here. The style variant and CV language
  travel inside `data`.
- When `renderCvPdf` returns `{ fallback: true }` (capture failed), the
  text-only fallback PDF is stored as `pdf` and `pages` is empty. View sent
  then says that there is no picture of this PDF, with Download still
  there. That needs a blob-returning form of the fallback writers in
  `exporters.js`, without changing what `saveRenderedCvPdf` downloads.

### Module

`src/utils/applicationLog.js` (name is the builder's call), modelled on
`cvLibrary.js`: availability check, one connection per call, closed after
it; `createApplicationRecord`, `listApplications` (newest `appliedOn`
first, then `createdAt`; the list reads without the blobs if the store
layout allows it, else the rows ignore them), `getApplication`,
`addApplication`, `updateApplication(id, { company, role, appliedOn, adUrl,
status, note })` (never touches `cv`, `letter`, `source`),
`deleteApplication`, `clearApplications`. A new check script covers
records, ordering, updates that can't touch the stored files, and
rejection of bad records.

### Mark as applied

- A "Mark as applied" button in the builder toolbar near Save (Classic and
  Direct Edit), opening a dialog: company, role, date (today, editable),
  link to the ad (optional), paper (A4 / US Letter) and Fit (the four
  options), both starting from the tab's current `pdfPaper`/`pdfFit`, and a
  line saying "A PDF of this CV and its cover letter, as they look now, is
  kept with the application in this browser."
- Prefill: company from `formData.coverLetter.company`; role from
  `coverLetter.role`, else `jobTitleFromAd(jobDescription)`, else empty.
  Company and role are required.
- Save renders with the builder's existing export sources (`previewRef`,
  `letterRef`) through `renderCvPdf`, the same options Download uses, then
  stores. The dialog shows progress and can't be submitted twice. On a
  render or storage error (quota included) nothing is stored and the
  dialog says why.
- After saving: a toast "Saved to Applications" with a button that opens
  the Applications tab.

### Applications tab

- In `SavedCvsModal.jsx`, tabs "My CVs" / "Applications (N)". The ATS
  panel's "Save a copy for this job" still opens My CVs.
- Each row: company, role, date (locale format), a status select, a note
  field (saves on blur or after a short pause), and View sent, Start new CV
  from it, Delete (confirm: "Delete the application to Acme? The PDF that
  was sent goes with it.").
- Empty state: one line on what Mark as applied does.
- IndexedDB unavailable (private window, blocked storage): the same message
  saved CVs show; the toolbar button explains it on click.

### View sent

- A dialog: company, role, date, the ad link; a "CV / Cover letter" switch
  when a letter is stored; the stored page images at paper proportions
  (reusing `PdfPreviewModal`'s page frame styling is fine); Download PDF
  saving the stored blob under its stored file name.
- No re-render, no Fit or paper options, no parser tab (the parser tab may
  come later; the stored PDF makes it possible).

### Start new CV from it

From the row or from View sent: `detach()` first, then `SET_FORM_DATA` with
a copy of `source.data`, switch to `source.templateId` (through
`LEGACY_TEMPLATE_ALIASES`; unknown → default template), apply the look.
Undo restores the previous CV, template and look together, through the
same history step template/look changes use. `atsFriendlyMode` and
`classicNameAlignment` are applied but not undone, as everywhere today.
`source.data` goes through the same validation JSON import uses, so an old
record still opens after `CvData` changes.

### Settings, privacy, copy

- Settings gets its own "Delete all applications" row (confirm first),
  next to "Delete all saved CVs", which keeps its meaning.
- The privacy policy's IndexedDB paragraph (both languages) adds the
  applications database: what it holds (company, role, dates, notes, the
  PDFs, the CV data), that it stays in this browser, and how to delete it
  (per row, or all from Settings).
- Bilingual throughout. Copy claims checked against the code.

## Tests

- The check script above.
- `e2e/applications.spec.js`: mark as applied from both modes; prefill
  from the letter and from a pasted ad; the row appears; status and note
  survive a reload; editing the CV and switching template after marking
  leaves View sent's pages and download unchanged; Start new CV loads the
  stored CV in its template and Undo restores the previous one; delete
  asks first; "Delete all applications" clears only applications and
  "Delete all saved CVs" leaves them; blocked IndexedDB shows the
  unavailable message. `@slow`: the downloaded PDF equals the stored blob
  and its text layer has the name and a field's value as it was when
  marked; a letter is stored when it has a body and not otherwise.
- `e2e/saved-cvs.spec.js`, `e2e/cover-letter.spec.js` and the PDF specs stay
  green unchanged.

## Calls made after the builder check (mine)

1. **Undo** after Start new CV restores CV, template and look together;
   ATS mode and name alignment aren't undone, as nowhere today.
2. **Deleting:** a separate "Delete all applications" in Settings; deleting
   saved CVs never touches applications.
3. **Paper and Fit** are chosen in the Mark as applied dialog, starting
   from the tab's current values, and stored with the PDF.
4. **Page images and PDF both stored**, so View sent needs no PDF reader
   and Download is byte for byte.
5. **Fallback PDF** is stored too, with no page images.

## Left to the builder

Exact copy, module and script names (a new `check:*` script goes into CI
and CLAUDE.md), dialog layout, the note's save timing, whether the list
loads without blobs.
