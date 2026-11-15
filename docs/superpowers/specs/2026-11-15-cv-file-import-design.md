# CV file import (PDF and Word) — design

Date: 2026-11-15. Branch: `v1.7.0`. Approved in conversation on 2026-11-15.

## Intent

A new visitor almost always has a CV already, as a PDF or a Word file.
Today the only ways in are PortifyCV's own JSON export and a paste box
that detects a name, a title, skills and a three-line summary
(`parsePastedCvText`, `src/utils/cvForm.js`), so everyone retypes their
experience and education. Importing the existing file removes the largest
piece of first-use work.

## Goals

- Upload a `.pdf` or `.docx` in the Import modal and get a filled CV.
- Detect: name, title, email, phone, location, links, summary, skills,
  experience (role, company, dates, bullets), education, languages.
- English and Finnish section headings.
- Everything happens in the browser. Nothing is uploaded.
- The user is told what was found, so they know to check the result.

## Non-goals

- Legacy `.doc`, `.odt`, `.rtf`, images.
- OCR. A scanned PDF has no text and gets a clear message.
- Recreating the source file's design, fonts, photo or column layout.
- Perfect parsing. Two-column PDFs and unusual layouts will import
  partially; the result is a starting point the user edits.

## Anti-goals

- Any network request carrying CV content.
- `pdfjs-dist` or the parser in the entry chunk. Both load only when a
  file is picked.
- A parse that silently invents data. A field the parser is unsure of
  stays empty.

## Approaches

1. **Client-side extraction plus a rule-based parser (picked).** `pdfjs-dist`
   for PDF text, `jszip` plus `DOMParser` for `.docx`, then one
   heading-and-pattern parser. Keeps the no-server promise, costs nothing
   to run, and is testable from a Node check script.
2. **A server or LLM parses the file.** Better accuracy on odd layouts,
   but it sends the CV off the device, which is the one thing the product
   says it never does. Rejected.
3. **Improve only the paste box.** No new dependency, but the user still
   has to copy text out of a PDF by hand, and PDF copy order is often
   scrambled. Does not remove the friction. Rejected.

## Design

**Extraction** — `src/utils/cvFileText.js`, dynamically imported.
`extractCvFileText(file)` returns an array of text lines.

- PDF: `pdfjs-dist` (new dependency, its worker bundled by Vite, no CDN).
  Text items are grouped into lines by baseline `y`, sorted top to bottom
  then left to right, page by page.
- Word: `jszip` (added as a direct dependency; already installed through
  `docx`) reads `word/document.xml`; each `w:p` becomes a line, `w:tab`
  and `w:br` become whitespace and line breaks.
- Size limit: the existing 5 MB `MAX_IMPORT_FILE_SIZE_BYTES`.
- No extractable text → an error saying the file looks scanned.

Added while building: a two-column PDF read row by row interleaves its
sidebar with its main column, and re-importing this app's own exports
showed that is the common case, not the exception. The extractor splits
each page at its gutter (the vertical line almost no text crosses, with
at least 15% of the page's text on each side) and emits the name's column,
a `COLUMN_BREAK` line, then the other column. Page one decides whether the
CV has columns.

**Parsing** — `src/utils/cvTextImport.js`, pure, no DOM, no dependencies.
`parseCvText(lines, { locale })` returns `{ data, summary }`:

- `data` is a full `CvData`, built on `createInitialCvData()` and passed
  through `parseImportedCvData` so it obeys the same validation as JSON.
- `summary` counts what was found (`experience`, `education`, `skills`,
  `languages`, and whether a name was found) for the toast.
- Section headings are matched from an English and Finnish table.
  Contact details are found by pattern (email, phone, URLs mapped to the
  matching `links` key). Experience and education entries are split on
  date ranges.
- Nothing detected at all → throws, and the current CV is left alone.

**Applying** — `ResumeBuilderPage.jsx`. A second hidden file input
(`.pdf,.docx`) and a `handleImportCvFile` handler dispatch
`FORM_ACTION.SET_FORM_DATA`, the same action JSON import uses, so the
toolbar undo arrow restores the previous CV. Unlike JSON import it does
not call `markCvSaved`: an imported file is unsaved work.

**UI** — `ImportCvModal.jsx` gets a first row, "Upload your CV (PDF or
Word)", above the JSON row; Classic's import block gets the same button.
The paste box and `MERGE_FORM_DATA` stay as they are: a pasted snippet
merges into the current CV, and replacing the whole CV from three pasted
lines would be a regression (amended while planning).

**Checks**

- `scripts/check-cv-import.mjs` (`npm run check:cv-import`, added to CI):
  English and Finnish sample CV texts through `parseCvText`.
- `e2e/cv-file-import.spec.js`: uploads a generated PDF and a generated
  `.docx`, asserts the name, an experience entry and the toast, asserts
  no request leaves the origin, and checks undo restores the old CV.
- `e2e/cv-file-import-roundtrip.spec.js` (`@slow`): every template's PDF
  export of the demo CV imports back with the name and both jobs.

## Left to the builder

- The exact heading table and date patterns.
- How PDF lines are clustered (tolerance on `y`).
- Toast wording, in both locales.
