# CV File Import (PDF and Word) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A visitor uploads their existing CV as `.pdf` or `.docx` in the Import modal and gets a filled, editable CV, with nothing leaving the browser.

**Architecture:** Two new modules behind one dynamic import: `cvFileText.js` turns a file into text lines (pdfjs-dist for PDF, jszip + DOMParser for Word), and the pure `cvTextImport.js` turns lines into `CvData`. `ResumeBuilderPage.jsx` applies the result with the same `SET_FORM_DATA` action JSON import uses, so undo restores the previous CV.

**Tech Stack:** React 19, Vite 8, `pdfjs-dist` (new), `jszip` (promoted to a direct dependency), Playwright, Node check scripts.

**Spec:** `docs/superpowers/specs/2026-11-15-cv-file-import-design.md`

## Global Constraints

- No network request may carry CV content; the pdf.js worker is bundled by Vite (`?url` import), never a CDN.
- `pdfjs-dist`, `jszip` and both new modules must stay out of the entry chunk: reached only through `import()` in the upload handler. No `manualChunks` entry for them (see the comment in `vite.config.js`).
- File size limit: the existing `MAX_IMPORT_FILE_SIZE_BYTES` (5 MB).
- A field the parser is unsure of stays empty. Nothing detected → throw, current CV untouched.
- Every user-facing string exists in `en` and `fi`, inline `isFinnish ? … : …`.
- The paste box and `MERGE_FORM_DATA` are left as they are (spec amended: a pasted snippet must keep merging, not replace the CV).
- Commits carry only the user's name; no co-author lines.

## Review Focus

1. A two-column PDF: lines from both columns interleave. Expected: no crash, name and contact still found, user told what was found.
2. A scanned PDF or an empty `.docx`: no text. Expected: a clear "looks scanned / no text" error, CV untouched.
3. A file renamed to `.pdf`/`.docx` that is not one, or a corrupt zip. Expected: an error toast, CV untouched, the input usable again.
4. Dates in forms other than `Jan 2020 – Present`: `2019–2021`, `03/2018 - 06/2020`, `1/2020 – nykyinen`, a single year. Expected: split into start and end, `isCurrent` set for present/nykyinen/current.
5. A CV with no recognised headings at all. Expected: name, title and contact from the top block; the rest goes nowhere rather than into a wrong section.

---

### Task 1: Text-to-CV parser

**Files:**
- Create: `src/utils/cvTextImport.js`
- Create: `scripts/check-cv-import.mjs`
- Modify: `package.json` (add `"check:cv-import": "node scripts/check-cv-import.mjs"`), `.github/workflows/ci.yml` (run it beside the other checks)

**Interfaces:**
- Consumes: `createInitialCvData`, `createEmptyExperience`, `createEmptyEducation`, `createEmptyLanguage`, `parseImportedCvData` from `src/utils/cvForm.js`.
- Produces: `parseCvText(lines: string[], options?: { locale?: 'en'|'fi' }): { data: CvData, summary: { hasName: boolean, experience: number, education: number, skills: number, languages: number } }`. Throws `Error` with a localized message when nothing is detected.

- [ ] **Step 1: Write the failing check script**, modelled on `scripts/check-cv-feedback.mjs` (same `registerHooks` resolver and `check()` helper). Cases:
  - English sample (name, title, `jane@example.com`, `+358 40 123 4567`, `Helsinki, Finland`, `linkedin.com/in/janedoe`, `github.com/janedoe`, Summary, Experience with two jobs each with `•` bullets and `Jan 2020 – Present` / `2017 – 2019`, Education, Skills comma list, Languages `English – Native`): asserts `fullName`, `title`, `email`, `phone`, `location`, `links.linkedin`, `links.github`, `about`, `experience.length === 2`, first job `role`/`company`/`startDate`/`isCurrent === true`/`achievements.length`, `education[0].school` and `degree`, `skills` contents, `languages[0]`, and the `summary` counts.
  - Finnish sample with `Työkokemus`, `Koulutus`, `Taidot`, `Kielitaito`, `Profiili`, `1/2020 – nykyinen`: same assertions.
  - Review Focus 4: one case per date form listed there.
  - Review Focus 5: headingless text → name/title/email found, `experience` is the single empty entry.
  - Review Focus 1: interleaved two-column lines do not throw and still yield `email`.
  - Empty input and whitespace-only lines throw.
  - `data` round-trips through `parseImportedCvData` without throwing.
- [ ] **Step 2: Run** `npm run check:cv-import` — expected: fails on the missing module.
- [ ] **Step 3: Implement `parseCvText`.** Heading table maps normalized heading text to `summary | experience | education | skills | languages | other` for both locales (`other` covers known headings the importer does not fill, e.g. projects, certificates, references, so their lines are dropped rather than appended to the previous section). Top block before the first heading: first line that is not contact data is the name, the next such line the title. Contact by regex anywhere in the text; URLs mapped by host to the matching `links` key, anything else to `links.website`. An experience/education entry starts at a line containing a date range; role and company come from that line and its neighbours (`Role at Company`, `Role, Company`, `Role | Company`, or two adjacent lines); bullet lines go to `achievements`, other lines to `description`. Build on `createInitialCvData()` and return through `parseImportedCvData`.
- [ ] **Step 4: Run** `npm run check:cv-import` and `npm run lint` — expected: all `ok`, lint clean.
- [ ] **Step 5: Commit** — `Add the CV text parser and check:cv-import`.

### Task 2: File text extraction

**Files:**
- Create: `src/utils/cvFileText.js`
- Modify: `package.json` / `package-lock.json` (`npm install pdfjs-dist jszip`)

**Interfaces:**
- Produces: `extractCvFileText(file: File): Promise<string[]>` (trimmed, non-empty lines, reading order) and `getCvFileKind(file: File): 'pdf' | 'docx' | null` (by extension, falling back to MIME type). Throws `Error` with `code: 'unsupported' | 'no-text' | 'unreadable'`; the caller localizes.

- [ ] **Step 1: Implement.** PDF: `import('pdfjs-dist')`, `GlobalWorkerOptions.workerSrc` from `pdfjs-dist/build/pdf.worker.min.mjs?url`, `getTextContent()` per page, group items whose baseline `y` differs by less than half the item height into one line, sort by `y` descending then `x`, join items with a space where the gap exceeds a quarter of the font size. Word: `import('jszip')`, read `word/document.xml`, `DOMParser`, one line per `w:p`, `w:tab` → space, `w:br` → line break. Zero lines → `no-text`; a load failure → `unreadable`.
- [ ] **Step 2: Run** `npm run lint` and `npm run build`; confirm in the build output that pdf.js lands in its own async chunk and the entry chunk size is unchanged from `main`.
- [ ] **Step 3: Commit** — `Add PDF and Word text extraction for CV import`.

(Tested end to end in Task 3: pdf.js needs a browser, and the e2e spec uploads real files.)

### Task 3: Upload in the builder

**Files:**
- Modify: `src/pages/ResumeBuilderPage.jsx` (second hidden input `accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"`, `handleImportCvFileClick`, `handleImportCvFile`, Classic import block button, props to the modal)
- Modify: `src/components/ImportCvModal.jsx` (new first row; props `onImportCvFile`, `isImporting` reused)
- Create: `e2e/cv-file-import.spec.js`

**Interfaces:**
- Consumes: `extractCvFileText`, `getCvFileKind` (Task 2); `parseCvText` (Task 1); `FORM_ACTION.SET_FORM_DATA`.

- [ ] **Step 1: Write the failing e2e spec.** Fixtures are generated in the test: a PDF with `jspdf` and a `.docx` with `docx` (both already dependencies), from the same sample text as Task 1's English case. Tests:
  - PDF upload from the Direct Edit Import dialog: toast matches `/Imported .* 2 jobs/`, `[data-cv-name]` shows the name, an experience company is visible, the dialog closed.
  - `.docx` upload: same assertions.
  - No request to a non-localhost origin during an import (collect `page.on('request')`).
  - Undo after import restores the previous name.
  - Review Focus 2 and 3: a text file renamed `broken.pdf` → error toast, name unchanged, a second valid upload then succeeds.
  - Classic mode's import block has the same button and it works.
- [ ] **Step 2: Run** `npx playwright test e2e/cv-file-import.spec.js` — expected: fails, no upload control.
- [ ] **Step 3: Implement the handler and UI.** Handler mirrors `handleImportFile` (size check, `SET_IMPORTING`, reset `event.target.value` in `finally`) but dynamically imports both modules, dispatches `SET_FORM_DATA`, calls `applyStoredStyleVariantLook`, sets the onboarding flag, closes the modal, and does **not** call `markCvSaved`. Modal row label: `Upload your CV` / `Lataa oma CV`; hint: `A PDF or Word file. It replaces the current CV; the undo arrow brings that back. Check the result — layouts with columns may import partly.` (and its Finnish equivalent); button `Choose file` / `Valitse tiedosto`. Success toast: `Imported from <name>: N jobs, N degrees, N skills. Check the details.` Error toasts for `unsupported`, `no-text` (`No text found. The file looks scanned.`), `unreadable`.
- [ ] **Step 4: Run** the new spec, `e2e/direct-edit.spec.js -g "Import"`, `e2e/json-import.spec.js`, `e2e/dialog-focus-trap.spec.js`, `npm run lint` — expected: all pass.
- [ ] **Step 5: Commit** — `Import a CV from a PDF or Word file`.

### Task 4: Docs and version

**Files:**
- Modify: `CLAUDE.md` (commands list: `check:cv-import`; a short "CV file import" architecture paragraph), `README.md` (feature list), `src/pages/HowToUseTheBuilderPage.jsx` only if it describes import today (verify the copy against the code first).
- Modify: `package.json` version → `1.7.0` (standalone commit).

- [ ] **Step 1:** Update docs. **Step 2:** Run all `check:*` scripts and `npm run test:e2e:fast`. **Step 3:** Commit docs, then commit `Bump version to 1.7.0`.
