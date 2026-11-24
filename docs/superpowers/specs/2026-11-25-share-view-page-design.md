# Read-only share page — design

Draft 2026-11-25, for 1.7.12 on `v1.7.0`. Next item from the 2026-11-19
competitor review (most builders give the recipient of a link a clean,
view-only page).

## Intent

A share link goes to **a recruiter**, who should **just view the CV and
download a PDF** (user, 2026-11-24). Today a link (`/cv#data=…`) opens the
whole builder with the sender's CV loaded as the recipient's own editable
CV: toolbar, editing, the recipient's screen replaced. That is the wrong
first impression for a recruiter.

## Goals

1. **Every share link opens a view page** (user's choice, 2026-11-25),
   links already sent included: the CV in its template and look, a
   Download PDF button, and nothing else to do.
2. **The recipient sees the sender's look.** The link starts carrying the
   hand-picked accent, font and headings colour, plus the sender's PDF
   paper and fit, so the view and its download match what the sender would
   download.
3. **"Edit a copy"** on the page, small and secondary, opens the CV in the
   builder exactly as a link does today. Moving a CV between devices with a
   link keeps working, one click longer.
4. Bilingual like every page; the page follows the CV's language
   (`cvLanguage`, else the visitor's saved locale).

## Non-goals

- A server, short links, link expiry, view counts, "who opened it".
- Photos in links (unchanged, on purpose).
- The cover letter in links (unchanged, on purpose).
- Word/HTML/JSON downloads on the view page, a paper or fit picker, or the
  "What a parser reads" tab.
- A second kind of link (an "editable link" button). Rejected by the user.

## Anti-goals

- A recruiter landing in the editor from any link, old or new.
- The view page writing anything: no session restore, no saved-CV
  auto-save, no change to the visitor's own CV in this browser. Opening a
  link must not overwrite what the visitor has in the builder unless they
  press Edit a copy.
- The CV data reaching a server: it stays in the fragment, which browsers
  don't send.
- Search engines indexing a shared CV, or ads beside it.
- Breaking a link generated before this release.

## Approaches (decided)

User chose **every link opens the view page** (2026-11-25):
- **1. All links → view page, "Edit a copy" button (chosen).** No recruiter
  ever reaches the editor; one extra click for the sender's own device
  moves.
- 2. Two buttons for the sender ("link for recruiters" / "editable link"),
  old links still open the builder. Rejected: more to explain, and a wrong
  pick sends a recruiter into the editor.

Where the view lives (my call):
- **A new path, `/view`, and `buildShareUrl` writes `/view#data=…`.** Old
  links are `/cv#data=…`: the builder, on finding `#data=` at load, sends
  the visitor to `/view` with the same fragment (`location.replace`, so
  Back doesn't bounce) before loading anything. Edit a copy goes to
  `/cv#data=…&edit=1` (or an equivalent marker), which loads as today.
- Rejected: a view mode inside `/cv`. The builder page is the heaviest
  chunk and assumes editing everywhere; a separate small page keeps the
  recruiter's download fast and can't edit by construction.

## Shape

### Link format (`shareLinks.js`)

New optional keys, permanent once shipped, never reusing an old key; all
absent when the sender kept the template's defaults:

- `ac` accent colour for the sender's template, `fo` font id, `hc` headings
  colour, `na` Classic name alignment, `at` ATS-friendly mode on,
  `pp` paper (`a4`/`letter`), `pf` fit (`auto`/`one-page`/`two-pages`/
  `actual`). Exact key names are the builder's call; `check:share` must
  cover each.
- Decoding validates each (known font id, hex colour, known paper/fit),
  dropping a bad value to the default rather than failing the link.
- `readCvStateFromLocation` returns them beside `formData` and
  `templateId`, e.g. `look: { … }` and `pdf: { paper, fit }`.
- An old link without them shows the template's own look, A4, auto fit.
- Opening a link in the builder (Edit a copy) applies the look too, so the
  sender's device move keeps it — today it is lost.

### The view page

- Route `/view` in `routes.js`/`pageMeta.js`: English path only (like
  `/cv`), `noindex`, in `AD_FREE_VIEWS`, not in the sitemap, not
  pre-rendered beyond an empty shell (the data is client-side only). The
  worker treats it like `/cv` (served, metadata rewritten, ads removed).
- Lazy page component. Renders a read-only `CVPreview` through
  `hideEmptySections()` (as the template pages and the export source do),
  in the link's template and look, scaled to fit the screen on phones.
- Above the CV: the person's name, a **Download PDF** button, and a small
  **Edit a copy** link. One line at the foot: "Made with PortifyCV" with a
  link to the front page.
- Download renders with `renderCvPdf` from the page's own off-screen
  preview with the link's paper and fit, and saves with
  `saveRenderedCvPdf` under the same file name the builder uses. Straight
  download, no preview dialog. Shows progress; falls back to the text PDF
  like the builder when capture fails.
- Photo templates: the photo is simply absent, the same as a CV without a
  photo in the builder's PDF. No note to the recruiter.
- Bad link (corrupt, too long, missing data): a short message and a link
  to the front page; no builder.
- Page title: "<Name> — CV" (else "Shared CV"), set client-side; the
  worker serves a generic noindex title.

### Sender's side

- Copy share link keeps its place and one-time warning; the toast now says
  the link opens a view-only page with a PDF download. The images warning
  stays.
- The builder's How-to/guide copy that describes links is updated, checked
  against the code.

### Privacy policy

The share-link paragraph (both languages) says the recipient sees a
view-only page and that the link also carries the look and PDF settings.

## Tests

- `check:share`: round-trip of every new key; bad values fall back; an old
  payload without them decodes as before.
- `e2e/share-view.spec.js`: a link from the builder opens `/view` with the
  name, template and look (accent/font/headings applied); no editor
  controls; Download PDF produces a PDF with the right page size; an old
  `/cv#data=` link lands on `/view`; Edit a copy opens the builder with the
  CV and look; opening a link leaves the visitor's own restored session
  and saved CVs untouched; a corrupt link shows the message; `/view` has
  `noindex` and no ad script. `@slow`: the downloaded PDF's text layer has
  the name and a field's value.
- Existing share-link e2e tests updated to the new path; everything else
  green unchanged.

## Calls made (mine)

1. `/view` as its own lightweight page; old `/cv#data=` links redirect to
   it client-side.
2. The link carries accent, font, headings colour, name alignment, ATS
   mode, paper and fit.
3. Download is direct (no preview dialog), with the sender's paper and fit.
4. No ads, `noindex`, no session or library writes on the view page.
5. Photos just absent, no note.

## Calls made after the builder check (mine)

6. **Paper and fit come from the sender's tab** (`pdfPaper`/`pdfFit`, A4
   and auto until the PDF preview changes them), the same values the
   sender's own Download would start from. No new stored setting.
7. **An already-open `/cv#data=…` tab isn't thrown out.** The redirect to
   `/view` runs only on a fresh navigation; when the navigation is a
   reload or back/forward (`performance.getEntriesByType('navigation')`)
   the builder loads as today, so someone who opened a link last week and
   kept editing doesn't lose their tab. The `#data=` fragment still stays
   in the address after load (deliberate, unchanged).
8. **Edit a copy opens the builder in a new tab** (`noopener`), whose
   session storage starts empty, so it never replaces a CV the visitor has
   open elsewhere, and it never attaches to a saved CV. No confirm dialog
   needed; the view page reads and writes nothing of the visitor's.

## Left to the builder

Exact key names, the Edit-a-copy marker, page layout and copy, whether the
page reuses `ScaledPreview`, the worker details, test names.
