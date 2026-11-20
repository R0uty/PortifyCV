# Matching cover letter — design

Draft 2026-11-20, for 1.7.9 on `v1.7.0`. Next item from the 2026-11-19
competitor review (Kickresume, Enhancv, Novoresume, Resume.io, FlowCV all sell
a cover letter "that matches your CV").

## Intent

Today's cover letter is a side tool that doesn't belong to the CV:

- `CoverLetterModal.jsx` + `utils/coverLetter.js` draft plain text from the
  CV (company, role, hiring-manager fields; `generateCoverLetterDraft`).
- The text lives in UI state (`uiReducer`'s `coverLetterCompany/Role/
  HiringManager/Body`), so Save, share links, JSON export and session
  restore all drop it.
- The PDF (`exporters.js`'s `exportCoverLetterAsPdf`) is black Helvetica on
  A4 with no name or contact details: nothing like the CV beside it.
- It ignores the job ad pasted into the ATS panel (`jobDescription`, UI
  state), and drafts in the app's language, not the CV's (1.7.5).

The goal: the letter becomes part of the CV, written for the job, and its PDF
looks like the CV it is sent with.

## Goals

1. **Kept with the CV.** The letter is CV data, so Save (IndexedDB), JSON
   export/import and session restore carry it, and Undo covers its edits
   like any other field. **Share links leave it out** (user's decision,
   2026-11-20): a link is often sent for feedback on the CV alone, and the
   letter names the company and the hiring manager.
2. **Looks like the CV.** One shared letter layout takes the selected
   template's look: its font, its heading colour and its accent, in the
   chosen style variant. Name header, contact line, date, recipient, body,
   sign-off.
3. **PDF through the CV's own pipeline.** The letter is rendered as a page
   in the app and exported with the same machinery as the CV PDF: the PDF
   preview dialog (A4 / US Letter), the invisible text layer and clickable
   links.
4. **Written for the job.** When a job ad is pasted in the ATS panel, the
   draft uses it: the role from the ad, and the ad's requirements that the CV
   already shows (`matchJobAd(...).found`) named in the skills paragraph.
5. **In the CV's language.** The draft, the date and the letter's fixed words
   follow `resolveCvLocale(formData, locale)`; the dialog's own labels follow
   the app's language.

## Non-goals

- A letter drawn in each template's own design (sidebars, photos). Rejected
  for 18 separate layouts.
- AI writing, or any server.
- Word (.docx) or HTML export of the letter (copy and .txt stay).
- Several letters per CV. One CV, one letter; "Save a copy for this job"
  (1.7.2) already gives a CV per job, and its copy takes the letter along.
- Changes to the public Cover letter examples page beyond a true sentence.

## Anti-goals

- A letter whose look visibly disagrees with the CV it goes with (different
  font, wrong colour) after the visitor changes template or style.
- Losing a letter someone wrote: a regenerate that silently overwrites an
  edited body, or a CV switch that leaves the previous CV's letter on screen.
- A letter PDF that an applicant system reads worse than today's plain one.

## Approaches (decided)

The user chose **A** over **B**: a shared letter layout borrowing each
template's look (A), not a per-template letter design (B, 18 layouts).

For the PDF the user chose **1**:

1. **Render the letter as a page in the app and reuse the CV PDF pipeline
   (chosen).** Exact template fonts; the preview dialog, paper sizes, text
   layer and links come with it. A picture with text over it, like the CV
   PDF; a second or two to build.
2. Draw the PDF directly with jsPDF as vector text (today's way, plus a
   coloured header). Rejected: jsPDF has only Helvetica/Times/Courier, so
   font-led templates (Editorial, Portrait, Creative) wouldn't match, and it
   would need its own paper handling outside the preview dialog.

## Shape

### Data

- `formData.coverLetter = { company, role, hiringManager, body }`, all
  strings, empty by default (`cvForm.js` factory and validation, `cv.d.ts`
  typedef). A CV or JSON file without it gets the empty letter.
- Edits go through `cvFormReducer` (a root object field set, like other
  nested root data) so they join Undo history and auto-save.
- The four `coverLetter*` fields leave `uiReducer`. The one-time move of
  whatever is in them on first load is not needed: UI state never survived a
  reload.
- Share links: `shareLinks.js` never encodes `coverLetter`; a decoded link
  opens with an empty letter. `check:share` asserts a CV with a full letter
  encodes to the same link as without it. The share dialog needs no new
  copy.
- Everything that replaces the whole CV (clear, demo, `?example=`, New CV,
  JSON/file import, opening a saved CV, a share link) replaces the letter
  with it: the incoming CV's letter, or the empty one. File import
  (PDF/Word) and pasted text never fill the letter. (My call: it follows
  from the letter being CV data.)
- `check:reducers` covers the new action/field.

### Drafting (`utils/coverLetter.js`)

- `generateCoverLetterDraft(formData, { locale, companyName, roleTitle,
  hiringManagerName, jobAd })` keeps its paragraph-dropping rules and gains
  `jobAd`. With an ad, the skills paragraph names up to 4 of
  `matchJobAd(formData, jobAd).found` (ad order), falling back to the CV's
  top skills when none are found.
- The role field is prefilled from the ad's first line when the role is
  empty and that line reads like a title (the same rule as "Save a copy for
  this job": trimmed, trailing punctuation dropped, ≤ 40 characters). Company
  stays typed: ads don't name the company reliably.
- `locale` is the CV language.
- **Regenerate never overwrites edits silently.** When the body has been
  edited since it was generated, Regenerate asks first ("Replace your edited
  letter?" / Finnish). Builder's call how "edited" is tracked.

### The letter page

- A new component (e.g. `CoverLetterPage.jsx` + `styles/cover-letter.css`)
  renders the letter at paper width, off-screen like the CV's export source,
  marked so the export pipeline finds it.
- Look, from the builder's current state for the selected template: the CV
  font (`cvFontId`/the look's `fontId`), the name in exactly the colour the
  CV paints its name (`cvHeadingColor` where the CV's name takes it, else the
  template's own name colour from the look's palette — `cvHeadingColors.js`,
  settled in the final review), the accent (`resolveTemplateAccent(
  templateAccentColors, template)`) on the rule only. In ATS-friendly mode the letter is
  plain: default font, black text, no colour, matching the ATS CV.
- Content, top to bottom: name (as a heading through `CvHeading`-style
  rules, so marketing pages keep one `<h1>` if it is ever shown there),
  professional title, one contact line (email, phone, location, the first
  link), a thin accent rule, the date (today, CV-language format), the
  recipient ("hiring manager, company", omitted parts dropped), the body
  paragraphs, and the sign-off already in the body. No photo.
- Text uses the template system's wrap primitives (`.tpl-text-wrappable`,
  `.tpl-value-breakable` for contact values).

### Export

- Download PDF in the dialog opens the PDF preview dialog for the letter:
  the same `renderCvPdf`/`saveRenderedCvPdf` path, pointed at the letter
  page, A4/US Letter honoured; the "What a parser reads" tab is not offered
  for a letter. File name `<cv file name>-cover-letter.pdf` (Finnish:
  `-hakemuskirje`). If the shared renderer needs a small, letter-specific
  switch (no section breakpoints, one column), that switch is part of this
  work; the CV's behaviour must not change (`template-pdf*`/`pdf-page-*`
  specs stay green).
- Copy and Download .txt stay as they are, now reading the stored body.
- The old `exportCoverLetterAsPdf` (jsPDF text) stays as the fallback (call 3
  below), with the name and contact line added.

### Dialog

- Same dialog, fields bound to `formData.coverLetter`. Above the fields, a
  line when a job ad is pasted: "Using the job ad from the ATS check" (FI),
  with the role prefilled as above.
- Visible empty-state behaviour stays: copy/download disabled until there is
  a body.

## Tests

- `check:reducers`, `check:share` (the letter is left out); a check for the drafting with and
  without a job ad, both languages (extend an existing script or add cases;
  builder's call where).
- `e2e/cover-letter.spec.js`: the letter survives a reload (session restore)
  and Save/reopen; it is in JSON export and re-import; a Finnish CV in the
  English builder drafts in Finnish; a pasted ad prefills the role and names
  found requirements; Regenerate asks before replacing an edited body; the
  PDF downloads through the preview dialog and its text layer contains the
  name, the company and a body sentence.
- `e2e/export-fields.spec.js` already demands that every CV field reach the
  HTML/Word/JSON/ATS PDF exports. The letter is not CV content: its fields
  must be excluded there deliberately (JSON still carries it), with a comment
  saying why.

## Calls made after the builder check (mine, for the user to check)

1. **Preview dialog for a letter: paper only.** A4 / US Letter; no Fit
   options and no parser tab. A long letter is never shrunk: it continues on
   a second page, broken between lines (the existing
   `keepPageBreaksOutOfText` pass), preferably between paragraphs.
2. **One letter page, mounted once in the builder,** outside Classic and
   Direct Edit, drawn live from `formData` and the current template/look, so
   a template or style change shows on the next export with no re-sync.
   Download PDF closes the letter dialog and opens the PDF preview; closing
   the preview returns to the letter dialog.
3. **Fallback.** When the picture capture fails (`renderCvPdf`'s
   `{ fallback: true }`), the letter falls back to a text PDF: today's
   jsPDF letter plus the name and contact line. So `exportCoverLetterAsPdf`
   stays as that fallback rather than being removed, and a letter PDF is
   never worse than today's.
4. **The job ad is used when drafting, not stored.** The draft reads the ad
   pasted now; the letter keeps only its result (role, body). An empty role
   still falls back to the CV title, as today.
5. **The body keeps the greeting and sign-off,** as today's draft does. The
   page adds the header, date and recipient line above it, nothing below.
6. **"Edited since generated" without a fifth field.** Regenerate asks first
   whenever the body is not empty and differs from what Regenerate would
   produce now. It may ask when only the CV or ad changed; asking too often
   is cheaper than overwriting someone's letter.

## Left to the builder

Exact copy, dialog layout, and the letter's spacing and type sizes.
