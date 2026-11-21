# LinkedIn PDF Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A LinkedIn "Save to PDF" file picked in the existing CV import is recognised and read with LinkedIn's own layout rules; every other file imports exactly as today.

**Architecture:** A new lazy module `src/utils/linkedInImport.js` (`isLinkedInPdf`, `parseLinkedInText`) works on the same lines `extractCvFileText` already returns (main column, `COLUMN_BREAK`, sidebar). `handleImportCvFile` picks it when detected and falls back to `parseCvText` when it finds nothing. It reuses `cvTextImport.js`'s date and language helpers through new named exports, without changing their behaviour.

**Tech Stack:** React 19 + Vite, framework-free Node check scripts (`scripts/check-cv-import.mjs`), Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-11-20-linkedin-pdf-import-design.md`

## Global Constraints

- Ships as **1.7.10** on `v1.7.0`; version bump is its own last commit: `npm version 1.7.10 --no-git-tag-version`, message "Bump version to 1.7.10".
- No commit carries a `Co-Authored-By` or any Claude attribution line. Plain imperative messages.
- `linkedInImport.js` is imported only through the dynamic `import()` in `handleImportCvFile`, never statically (same rule as `cvTextImport.js`).
- `parseCvText`'s output for every existing case must not change: all existing `check:cv-import` cases and `e2e/cv-file-import*.spec.js` stay green untouched.
- The importer's rule holds: a field it is unsure of stays empty.
- Fixtures are made-up people (`Alex Example`, `example.com`); the user's real `Profile.pdf` is never copied into the repo.
- Bilingual copy (en/fi) as inline `isFinnish ? … : …`.

## Review Focus

1. A role whose company line was on the previous page: the company carries across the "Page 1 of 2" footer (case `LINKEDIN_TWO_PAGE_LINES`).
2. An ordinary two-column CV with a "Top Skills" heading only, or with a LinkedIn link only, must not be detected (negative cases).
3. A detected file where the reader finds no role and no degree must fall back to `parseCvText` (handled by the caller; check the return of `parseLinkedInText` is `null`).
4. A company with several roles: the bare duration line under the company is dropped and every role keeps the company.
5. A role with no location and no description must not take the next company's name as its location or description — add to Task 1 Step 2: a copy of `LINKEDIN_PROFILE_LINES` with `'Contoso Web Oy'` renamed `'Contoso, Inc.'` and the first role's location line removed still yields companies `['Northwind Oy', 'Contoso, Inc.']` and locations `['', '']`.

---

### Task 1: LinkedIn reader

**Files:**
- Create: `src/utils/linkedInImport.js`
- Modify: `src/utils/cvTextImport.js` (add named exports only: `readDates`, `parseLanguages`, `squashKeepingGaps`; no behaviour change)
- Modify: `scripts/fixtures/cvImportSamples.mjs` (add the LinkedIn fixtures below)
- Test: `scripts/check-cv-import.mjs`

**Interfaces:**
- Consumes: `COLUMN_BREAK` (`'\f'`) from `cvFileText.js`; `readDates(line, { allowSingle })` → `{ start, end, isCurrent, isSingle?, rest } | null`; `parseLanguages(lines)` → `[{ language, level }]`; `parseImportedCvData`, `createInitialCvData`, `createEmptyLinks`, `createEmptyExperience`, `createEmptyEducation`, `createEmptyCertificate`, `createEmptyAchievement`, `createEmptyPublication` from `cvForm.js`.
- Produces:
  - `isLinkedInPdf(lines: string[]) => boolean`
  - `parseLinkedInText(lines: string[], { locale }) => { data: CvData, summary: { source: 'linkedin', hasName: boolean, experience: number, education: number, skills: number, languages: number } } | null` — `null` when it found no role and no degree.

- [ ] **Step 1: Add fixtures to `scripts/fixtures/cvImportSamples.mjs`**

The first is line for line the shape of the real export checked in the spec:

```js
export const LINKEDIN_PROFILE_LINES = [
  'Alex Example',
  'Backend Developer & Security | Go, SQL | Cloud',
  'Infrastructure | Open Source Contributor &',
  'Mentor @ Example Academy',
  'Tampere, Pirkanmaa, Finland',
  'Summary',
  'Backend developer by day,',
  'open source maintainer by night.',
  'Experience',
  'Northwind Oy',
  'Backend Developer Go/SQL',
  'March 2021 - Present (5 years 9 months)',
  'Tampere, Pirkanmaa, Finland',
  'Contoso Web Oy',
  'Web Developer',
  'May 2018 - February 2021 (2 years 10 months)',
  'Education',
  'Tampere University',
  '· (June 2023)',
  'Page 1 of 1',
  '\f',
  'Contact',
  'alex@example.com',
  'www.linkedin.com/in/alex-',
  'example-12ab34 (LinkedIn)',
  'Top Skills',
  'Go',
  'PostgreSQL',
  'Threat Modeling',
]
```

And `LINKEDIN_TWO_PAGE_LINES`: main column — `'Sam Example'`, `'Product Manager at Fabrikam'`, `'Helsinki, Uusimaa, Finland'`, `'Experience'`, `'Fabrikam'`, `'4 years 2 months'`, `'Senior Product Manager'`, `'January 2023 - Present (2 years 11 months)'`, `'Helsinki, Uusimaa, Finland'`, `'• Led the pricing redesign across 3 markets'`, `'Owned the roadmap for the billing team.'`, `'Page 1 of 2'`, `'Product Manager'`, `'October 2021 - December 2022 (1 year 3 months)'`, `'Adatum Oy'`, `'Analyst'`, `'2019 - 2021 (2 years)'`, `'Education'`, `'Aalto University'`, `'Master of Science, Industrial Engineering · (2014 - 2019)'`, `'Page 2 of 2'`, `'\f'`, sidebar — `'Contact'`, `'+358 40 555 0101 (Mobile)'`, `'sam@example.com'`, `'www.linkedin.com/in/samexample (LinkedIn)'`, `'samexample.dev (Portfolio)'`, `'fabrikam.com (Company)'`, `'Top Skills'`, `'Roadmapping'`, `'SQL'`, `'User Research'`, `'Languages'`, `'English (Native or Bilingual)'`, `'Finnish (Professional Working Proficiency)'`, `'Certifications'`, `'Certified Scrum Product Owner'`, `'Honors-Awards'`, `'Product of the Year 2022'`, `'Publications'`, `'Pricing in Small Markets'`.

- [ ] **Step 2: Write the failing checks in `scripts/check-cv-import.mjs`**

Import `isLinkedInPdf`, `parseLinkedInText` via `importSrc('utils/linkedInImport.js')`. Assertions (use the file's `same`/`check`):

```js
// sample-shaped profile
same('li: detected', isLinkedInPdf(LINKEDIN_PROFILE_LINES), true)
const li = parseLinkedInText(LINKEDIN_PROFILE_LINES, { locale: 'en' })
same('li: source', li.summary.source, 'linkedin')
same('li: name', li.data.fullName, 'Alex Example')
same('li: title from wrapped headline', li.data.title, 'Backend Developer & Security')
same('li: location', li.data.location, 'Tampere, Pirkanmaa, Finland')
same('li: summary', li.data.about, 'Backend developer by day, open source maintainer by night.')
same('li: email', li.data.email, 'alex@example.com')
same('li: wrapped profile link', li.data.links.linkedin, 'https://www.linkedin.com/in/alex-example-12ab34')
same('li: roles', li.data.experience.map((e) => [e.role, e.company, e.startDate, e.endDate, e.isCurrent, e.location]), [
  ['Backend Developer Go/SQL', 'Northwind Oy', 'March 2021', '', true, 'Tampere, Pirkanmaa, Finland'],
  ['Web Developer', 'Contoso Web Oy', 'May 2018', 'February 2021', false, ''],
])
same('li: no description', li.data.experience.map((e) => e.description), ['', ''])
same('li: education', li.data.education.map((e) => [e.school, e.degree, e.startDate, e.endDate]), [['Tampere University', '', '', 'June 2023']])
same('li: top skills', li.data.skills, ['Go', 'PostgreSQL', 'Threat Modeling'])

// two pages, several roles at one company, every sidebar section
const two = parseLinkedInText(LINKEDIN_TWO_PAGE_LINES, { locale: 'en' })
same('li2: title before " at "', two.data.title, 'Product Manager')
same('li2: roles', two.data.experience.map((e) => [e.role, e.company, e.startDate, e.endDate, e.isCurrent]), [
  ['Senior Product Manager', 'Fabrikam', 'January 2023', '', true],
  ['Product Manager', 'Fabrikam', 'October 2021', 'December 2022', false],
  ['Analyst', 'Adatum Oy', '2019', '2021', false],
])
same('li2: bullet and text', [two.data.experience[0].achievements, two.data.experience[0].description],
  [['Led the pricing redesign across 3 markets'], 'Owned the roadmap for the billing team.'])
same('li2: education', two.data.education.map((e) => [e.school, e.degree, e.startDate, e.endDate]),
  [['Aalto University', 'Master of Science, Industrial Engineering', '2014', '2019']])
same('li2: phone', two.data.phone, '+358 40 555 0101')
same('li2: links', [two.data.links.linkedin, two.data.links.portfolio, two.data.links.website],
  ['https://www.linkedin.com/in/samexample', 'https://samexample.dev', 'https://fabrikam.com'])
same('li2: languages', two.data.languages, [
  { language: 'English', level: 'Native or Bilingual' },
  { language: 'Finnish', level: 'Professional Working Proficiency' },
])
same('li2: certificate', two.data.certificates.map((c) => c.name), ['Certified Scrum Product Owner'])
same('li2: honour', two.data.achievements.map((a) => a.title), ['Product of the Year 2022'])
same('li2: publication', two.data.publications.map((p) => p.title), ['Pricing in Small Markets'])

// negatives: one mark alone is not LinkedIn; ordinary CVs unchanged
same('not li: ordinary CV', isLinkedInPdf(ENGLISH_CV_LINES), false)
same('not li: Top Skills only', isLinkedInPdf(['Jane Example', 'Top Skills', 'Go', 'Experience', 'Dev, Acme', '2020 - 2021']), false)
same('not li: LinkedIn link only', isLinkedInPdf(['Jane Example', 'www.linkedin.com/in/jane (LinkedIn)', 'Experience']), false)
same('li: nothing found → null', parseLinkedInText(['Top Skills', 'Go', 'Page 1 of 1'], { locale: 'en' }), null)
```

- [ ] **Step 3: Run and see them fail**

Run: `npm run check:cv-import`
Expected: fails on the missing module `linkedInImport.js`.

- [ ] **Step 4: Export the three helpers from `cvTextImport.js`**

Add `export` to `readDates`, `parseLanguages` and `squashKeepingGaps` only.

- [ ] **Step 5: Implement `src/utils/linkedInImport.js`**

- **Detection** (spec call 1): true when at least two of: a line matching `/\(LinkedIn\)\s*$/` with `linkedin.com` on it or the line before it; a line equal (case-insensitive) to `top skills`; a line matching `/^page \d+ of \d+$/i`.
- **Lines:** squash with `squashKeepingGaps`; drop `Page N of M` lines; split at `COLUMN_BREAK` into main and sidebar.
- **Main column:** first line is the name. Lines up to the first heading (`summary`, `experience`, `education`) are the header: the last header line is the location, the lines between name and location are the headline, joined with a space. Title (call 2): headline before the first ` | `, then before ` at ` / ` @ `; empty if over 60 characters.
- **Experience** (call 10): strip a trailing `\(\d+ (years?|months?)( \d+ months?)?\)` from a date line before `readDates(line, { allowSingle: true })`. Walk the section: a line followed by a date line is a role title; the line before the first role title (not a date, not a duration) is the open company; a line matching `/^\d+ (years?|months?)( \d+ months?)?$/` is a total and is dropped. After a date line, the next line is the location when it matches `/^[\p{L} .'-]+(, [\p{L} .'-]+)+$/u` and is not followed by a date line, a bare duration, or a line that is itself followed by a date line (so a company named "Acme, Inc." above its role is never taken for a location); remaining lines until the next role/company are bullets (`•`, `-`, `–` → `achievements`) or description text. The open company carries across the dropped page footer.
- **Education:** school line, then a line `<degree> · (<years>)` or `· (<years>)`; degree is the text before ` · ` (empty when nothing), dates from `readDates(inner, { allowSingle: true })` — a single date is the end date.
- **Sidebar sections** by heading: `Contact`, `Top Skills`, `Languages`, `Certifications`, `Honors-Awards`, `Publications`; other headings (`Patents`, …) dropped. Contact (call 8): a line ending `-` followed by a line ending `(LinkedIn)` is one address joined without a space; `(LinkedIn)` → `links.linkedin`, `(Portfolio)` → `portfolio`, `(Blog)` → `blog`, `(Company)`/`(Personal)`/`(Other)` → `website` (first wins); prefix `https://` when missing and drop a trailing `/`. Email by the usual pattern; a phone line with `(Mobile)`/`(Home)`/`(Work)` → `phone` without the label. Languages through `parseLanguages`.
- Build with `parseImportedCvData({ ...createInitialCvData(), … })` like `parseCvText`, only including arrays that have items. Return `null` when no role and no degree.

- [ ] **Step 6: Run the checks**

Run: `npm run check:cv-import && npm run lint`
Expected: every line `ok`, including all pre-existing cases; lint clean.

- [ ] **Step 7: Commit**

```bash
git add src/utils/linkedInImport.js src/utils/cvTextImport.js scripts/fixtures/cvImportSamples.mjs scripts/check-cv-import.mjs
git commit -m "Read a LinkedIn profile PDF with its own layout rules"
```

### Task 2: Import wiring, dialog line, e2e, docs, version

**Files:**
- Modify: `src/pages/ResumeBuilderPage.jsx` (`handleImportCvFile`, ~line 1134)
- Modify: `src/components/ImportCvModal.jsx` (~line 36)
- Modify: `e2e/cv-file-import.spec.js`
- Modify: `src/pages/HowToUseTheBuilderPage.jsx` (only if it describes the file import: add one true sentence, en + fi)
- Modify: `CLAUDE.md` (one paragraph), `package.json` (version)

**Interfaces:**
- Consumes: Task 1's `isLinkedInPdf`, `parseLinkedInText`; `LINKEDIN_TWO_PAGE_LINES`; `makeTwoColumnPdf({ name, main, sidebar })` from `e2e/helpers/cvImportFiles.js`.

- [ ] **Step 1: Write the failing e2e in `e2e/cv-file-import.spec.js`**

```js
test('a LinkedIn profile PDF is read with LinkedIn's layout', async ({ page }) => {
  const at = LINKEDIN_TWO_PAGE_LINES.indexOf('\f')
  const [fullName, ...main] = LINKEDIN_TWO_PAGE_LINES.slice(0, at)
  const dialog = await openImportDialog(page)
  await expect(dialog).toContainText('From LinkedIn: open your profile, choose More › Save to PDF, then pick that file here.')
  await chooseFile(page, dialog, { name: 'Profile.pdf', mimeType: PDF_MIME,
    buffer: makeTwoColumnPdf({ name: fullName, main, sidebar: LINKEDIN_TWO_PAGE_LINES.slice(at + 1) }) })
  await expect(page.getByText("Imported your LinkedIn profile: 3 jobs, 1 degree, 3 skills. LinkedIn's PDF lists only your top 3 skills; add the rest under Skills.")).toBeVisible()
  await expect(name(page)).toHaveText('Sam Example')
  const preview = page.locator('.direct-edit-preview')
  await expect(preview).toContainText('Senior Product Manager')
  await expect(preview).toContainText('Fabrikam')
  await expect(preview).toContainText('Adatum Oy')
})
```

Also extend `'the upload is offered in Finnish'` to expect the Finnish LinkedIn line.

- [ ] **Step 2: Run it and see it fail**

Run: `npx playwright test e2e/cv-file-import.spec.js -g "LinkedIn"`
Expected: FAIL (dialog line missing).

- [ ] **Step 3: Wire the import**

In `handleImportCvFile`, also `import('../utils/linkedInImport')` in the same `Promise.all`; `const lines = await extractCvFileText(file)`; `const result = (isLinkedInPdf(lines) && parseLinkedInText(lines, { locale })) || parseCvText(lines, { locale })`. Everything after (detach, `SET_FORM_DATA`, look, onboarding flag, closing) unchanged. Toast when `summary.source === 'linkedin'`, same `found` list:
- en: `` `Imported your LinkedIn profile: ${found.join(', ')}. LinkedIn's PDF lists only your top 3 skills; add the rest under Skills.` ``
- fi: `` `LinkedIn-profiilisi tuotiin: ${found.join(', ')}. LinkedInin PDF:ssä on vain kolme kärkitaitoasi; lisää muut Taidot-osioon.` ``

- [ ] **Step 4: Add the dialog line**

In `ImportCvModal.jsx`, a second `settings-row__hint` paragraph under the PDF/Word hint:
- en: "From LinkedIn: open your profile, choose More › Save to PDF, then pick that file here."
- fi: "LinkedInistä: avaa profiilisi, valitse Lisää › Tallenna PDF-muodossa ja valitse se tiedosto tästä."

- [ ] **Step 5: Run the spec**

Run: `npx playwright test e2e/cv-file-import.spec.js`
Expected: all pass.

- [ ] **Step 6: Docs and commit**

CLAUDE.md: one paragraph "**LinkedIn PDF import (1.7.10)**" after the CV file import paragraph: `linkedInImport.js`'s `isLinkedInPdf` (two of three marks) and `parseLinkedInText` (null → `parseCvText`), lazy beside `cvTextImport.js`, cases in `check:cv-import` shaped after a real export. Builder guide sentence only if the page already explains the file import.

```bash
git add src/pages/ResumeBuilderPage.jsx src/components/ImportCvModal.jsx e2e/cv-file-import.spec.js CLAUDE.md src/pages/HowToUseTheBuilderPage.jsx
git commit -m "Import a LinkedIn profile PDF through the CV import"
```

- [ ] **Step 7: Full verification**

Run: `npm run lint && npm run build`, every `check:*` (13), `npm run test:e2e:fast`, `npm run test:e2e:slow` (background, 600000 ms).
Expected: all green; `check:thumbnails` unaffected (no hashed input touched).

- [ ] **Step 8: Version bump**

```bash
npm version 1.7.10 --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 1.7.10"
```
