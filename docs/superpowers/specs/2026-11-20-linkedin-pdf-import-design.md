# LinkedIn PDF import — design

Draft 2026-11-20, for 1.7.10 on `v1.7.0`. Next item from the 2026-11-19
competitor review (Kickresume, Resume.io and Enhancv let a person start from
their LinkedIn profile).

## Intent

Someone with a LinkedIn profile but no CV file should get a filled-in CV
without retyping it. PortifyCV has no server, so it cannot fetch a profile
from its address (LinkedIn does not allow it either). What every LinkedIn
member can do is open their profile › More › **Save to PDF**, and the 1.7.0
file import already reads PDFs in the browser. Today that import reads a
LinkedIn PDF badly, because LinkedIn's layout breaks the general parser's
assumptions.

The user wants a **quick start from the PDF** (2026-11-20), not the fuller
but slower LinkedIn data export (.zip of CSVs).

## How a LinkedIn "Save to PDF" file is laid out

Two columns; `cvFileText.js`'s `pdfPagesToLines` already splits them.

- **Left column:** `Contact` (email, phone with "(Mobile)", the profile
  address labelled "(LinkedIn)" and often wrapped over two lines, other
  sites labelled "(Company)", "(Portfolio)", "(Personal)", "(Blog)",
  "(Other)"); `Top Skills` (three skills only); `Languages` ("English
  (Native or Bilingual)", "Finnish (Professional Working Proficiency)");
  `Certifications`; `Honors-Awards`; `Publications`; sometimes `Patents`.
- **Main column:** name, headline ("Senior Engineer at Acme | React |
  TypeScript"), location; `Summary`; `Experience`: company line, then for a
  company with several roles a total ("3 years 2 months"), then per role:
  title, "January 2020 - Present (3 years 2 months)", location, description
  lines; `Education`: school, then "Degree, Field · (2014 - 2018)".
- Footer "Page 1 of 3" on every page.

### Checked against a real export (2026-11-21)

The user's own English `Profile.pdf` (Apache FOP 2.3, one page, A4) was run
through `extractPdfLines`'s path (`pdfPagesToLines`). Confirmed:

- `pdfPagesToLines` puts the main column first (name 26pt), then
  `COLUMN_BREAK`, then the sidebar. No change to `cvFileText.js` needed.
- The headline **wraps over several lines** (three in the sample) between
  the name and the location line; the location is the last line before
  `Summary` (or before `Experience` when there is no summary).
- Company line, then title, then one line "September 2020 - Present
  (6 years 3 months)" (the duration is joined onto the date line), then an
  optional location line. A role can have no location and no description.
- Education: school, then "· (August 2024)" — the degree part before "·"
  can be empty, and the years can be a single month and year.
- The footer arrives as one line "Page 1 of 1" (already dropped by
  `parseCvText`'s cleaner).
- Sidebar: `Contact` with the email and the wrapped address
  "www.linkedin.com/in/name-" + "rest (LinkedIn)"; `Top Skills` with three
  lines. The member chose the skills; they may be languages.
- All three detection marks (call 1) are present.

What today's import makes of it: name, first headline segment, location and
summary are right, but the second job is swallowed into the first job's
description, the first job is not marked current, the email, the LinkedIn
link and all skills are lost.

Not in the sample, so still from LinkedIn's known layout: a company with
several roles, a second page, `Languages`, `Certifications`,
`Honors-Awards`, `Publications`, descriptions under a role, a Finnish
interface. Fixtures for those follow the same line shapes as the sample.

## Goals

1. A LinkedIn PDF picked in the existing import fills: name, title, location,
   email, phone, LinkedIn and other links, summary, every role (one
   experience entry per role, same company repeated), education, the top
   skills, languages with LinkedIn's level, certifications (name), honours
   (achievement titles) and publications (titles).
2. Every other PDF or Word file imports exactly as it does today.
3. People know the option exists: the import dialog says how to get the PDF.
4. Works for a profile in English; a Finnish LinkedIn PDF works as far as its
   headings are known (see call 5).

## Non-goals

- Import from a profile address, or any server.
- LinkedIn's data export (.zip/CSV). Possible later.
- Skills beyond the three LinkedIn puts in the PDF.
- Recommendations, volunteering dates, courses, projects (LinkedIn's PDF
  rarely has them; their lines are dropped, like unknown sections today).
- A profile photo (the PDF has none).

## Anti-goals

- An ordinary CV that imports worse than today because it was mistaken for a
  LinkedIn PDF.
- A field filled with the wrong thing (a duration as a location, a company as
  a job title). The importer's rule stays: unsure → empty.
- The visitor's LinkedIn details in any test fixture or commit.

## Approaches (decided)

The user chose **A** (2026-11-20):

- **A. Recognise a LinkedIn PDF, read it with its own rules (chosen).** The
  same import button; detection on LinkedIn's marks; a separate LinkedIn
  reader; everything else untouched.
- B. Teach the general parser LinkedIn's habits. Rejected: LinkedIn puts the
  company above the title, most CVs the reverse; changing that for every
  import risks regressions.
- C. A separate "Import from LinkedIn" button. Rejected: two import buttons,
  and a LinkedIn PDF picked through the ordinary one still reads badly.

## Shape

- `src/utils/linkedInImport.js` (new, lazy, imported only beside
  `cvTextImport.js` in `handleImportCvFile`): `isLinkedInPdf(lines)` and
  `parseLinkedInText(lines, { locale })`, returning the same
  `{ data, summary }` shape as `parseCvText` plus `summary.source:
  'linkedin'`. It may reuse `cvTextImport.js`'s date, contact and list
  helpers (export what it needs), but must not change their behaviour for
  `parseCvText`.
- `handleImportCvFile`: after `extractCvFileText`, LinkedIn reader when
  `isLinkedInPdf`, else `parseCvText`. Same `SET_FORM_DATA`, `detach()`,
  undo and error toasts.
- `ImportCvModal.jsx`: one line under the PDF/Word row — "From LinkedIn:
  open your profile, choose More › Save to PDF, then pick that file here." /
  Finnish.
- Result toast for a LinkedIn import names the source and the skills limit:
  "Imported your LinkedIn profile: N jobs, N degrees, N skills. LinkedIn's
  PDF lists only your top 3 skills; add the rest under Skills." / Finnish.

## Calls (mine, for the user to check)

1. **Detection needs two marks of three:** a line ending "(LinkedIn)" with a
   linkedin.com address, the `Top Skills` heading, a "Page N of M" footer.
   One mark alone is common in ordinary CVs.
2. **Title from the headline:** the headline's wrapped lines are joined
   first; then the text before the first " | ", then before
   " at " / " @ "; empty if what is left is over 60 characters. The full
   headline is not put in the summary.
3. **Dates:** the "(3 years 2 months)" duration and the company total line
   are dropped; "Present" sets `isCurrent`. Start/end use the same date
   strings the general parser produces.
4. **Languages keep LinkedIn's own level words** ("Native or Bilingual"); no
   mapping to other scales.
5. **Finnish LinkedIn PDFs:** LinkedIn writes the headings in the profile's
   interface language. English headings are certain; Finnish ones are
   added from a real Finnish LinkedIn PDF if the user provides one,
   otherwise left out and the file falls back to the general parser (which
   already knows "Yhteystiedot", "Kokemus", "Koulutus", "Kielet").
6. **Fixtures are made-up people** with LinkedIn's exact structure; a real
   PDF, if the user shares one, is used only to check the layout and is
   never committed.
7. **Experience description:** lines starting with a bullet ("•", "-", "–")
   become achievements, the rest the description, as the general parser
   does.

## Calls made after the builder check (mine)

8. **Where fields land:** "Degree, Field" → `education.degree` as written
   (no field-of-study field exists); the "(2014 - 2018)" years →
   start/end. A certification line → `certificates[].name` (LinkedIn's PDF
   shows the name only). An honour → `achievements[].title`, a publication →
   `publications[].title`. A language's level → `languages[].level`. Links:
   "(LinkedIn)" → `links.linkedin`, "(Portfolio)" → `portfolio`, "(Blog)" →
   `blog`, "(Company)", "(Personal)", "(Other)" → `website` (first one
   wins; the rest dropped). "(Mobile)", "(Home)", "(Work)" phone → `phone`.
9. **Fallback:** if the LinkedIn reader finds no role and no degree, the
   import runs `parseCvText` on the same lines instead, so a wrongly
   detected file is never worse than today.
10. **Company vs title** is decided by looking ahead: a line followed by a
    date line is a role title; the line above the first title is the
    company; a line followed directly by a bare duration ("3 years 2
    months") is a company with several roles, and each following title
    belongs to it until the next company. The open company carries across
    a page footer.
11. **"Present"** uses the general parser's existing word list, which
    already includes the Finnish words.

## Tests

- `check:cv-import` gains LinkedIn cases, the first one line for line the
  shape of the checked sample (made-up person: wrapped three-line headline,
  two single-role companies, one without location, "· (August 2024)"
  education, wrapped profile address, three Top Skills); then a one-page and a two-page profile
  (page footers, a role split by the page break), a company with several
  roles, a wrapped profile address, languages with levels, certifications
  and honours, a headline with " | " and " at ", and the negative cases: an
  ordinary CV with a "Top Skills" heading, and one with a LinkedIn link,
  still go to `parseCvText` and import as before.
- The existing `check:cv-import` cases and `e2e/cv-file-import-roundtrip.spec.js`
  (@slow) stay green unchanged.
- `e2e/cv-file-import.spec.js` (or a new spec): a two-column PDF laid out
  like LinkedIn's, generated in the test, imports through the dialog; name,
  a role with its company, the skills toast note and the dialog's LinkedIn
  line are checked.

## Left to the builder

Exact copy beyond the strings above, how the reader is split into functions,
and where in the dialog the LinkedIn line sits.
