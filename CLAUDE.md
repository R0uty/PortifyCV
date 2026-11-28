# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install              # install dependencies
npm run dev               # dev server with HMR
npm run build              # production build to dist/, pre-renders every content page into dist/prerendered/ (1.6.49), copies dist/index.html -> dist/404.html
npm run preview            # serve the production build locally
npm run lint               # ESLint over the whole repo

npm run check:share        # round-trips a full CV through shareLinks.js encode/decode
npm run check:reducers     # exercises every cvFormReducer/uiReducer action
npm run check:feedback     # exercises evaluateCvFeedback (src/utils/cvFeedback.js)
npm run check:docx-export  # exercises the Word export builders and archetypes (src/utils/docxExport.js)
npm run check:section-schema   # validates the Direct Edit popup's section schema (src/utils/sectionSchema.js)
npm run check:section-columns  # exercises the section column-move rules (src/utils/sectionColumns.js)
npm run check:template-pages   # validates per-template page slugs, examples, copy, and field tags (src/utils/templatePageCopy.js, src/utils/templateMetaDescriptions.js, src/utils/exampleCvs.js, src/utils/templateFields.js)
npm run check:template-variants  # validates the style-variant registry against each template's CSS defaults, plus contrast (src/utils/templateVariants.js)
npm run check:cv-library   # exercises the saved-CV library's names, records and save rules (src/utils/cvLibrary.js)
npm run check:applications  # exercises the application log's records, validation, sorting and edits (src/utils/applicationLog.js)
npm run check:job-match    # exercises the ATS panel's job-ad matcher in English and Finnish (src/utils/jobMatch.js, src/utils/jobTerms.js)
npm run check:bullet-ideas  # exercises the example-bullet blanking, role ranking and loading (src/utils/bulletIdeas.js)
npm run check:cv-import    # exercises the PDF/Word import's text parser and column detection (src/utils/cvTextImport.js, src/utils/cvFileText.js)
npm run check:i18n         # translation files: parity, unused keys, plural cases, and no inline language branch outside the allowlist (src/i18n/, scripts/check-i18n.mjs)
npm run check:thumbnails   # the pre-rendered thumbnails in public/thumbnails/ exist, match their manifest, and are up to date with the template code
npm run thumbnails         # regenerate public/thumbnails/ (Vite dev server + Playwright Chromium, ~20s); commit the result

npm run test:e2e           # full Playwright suite in e2e/, against a prod build+preview
npm run test:e2e:fast      # same suite minus the @slow tier (--grep-invert @slow) — what CI's main e2e job runs
npm run test:e2e:slow      # only the @slow tier (--grep @slow) — the stress tier plus the PDF specs, a separate CI job
npx playwright test e2e/templates.spec.js   # run a single e2e spec file
npx playwright test -g "some test name"     # run a single e2e test by name

npm run worker:dev         # wrangler dev — run the Cloudflare Worker locally
npm run deploy              # wrangler deploy — deploy to Cloudflare Workers
```

The `check:*` scripts are framework-free Node scripts (`scripts/*.mjs`), not
a test runner — run the matching one directly after touching the share-link
codec (`check:share`), the CV schema/reducers (`check:reducers`), the
rule-based feedback engine (`check:feedback`), the Word exporter
(`check:docx-export`), the Direct Edit popup schema
(`check:section-schema`), the section column-move
rules and their import validation (`check:section-columns`), the
per-template pages' slugs, examples, copy, and field tags, plus `index.html`'s static template count (`check:template-pages`), or
a template's style variants or palette variables (`check:template-variants`),
anything a template thumbnail is rendered from (`check:thumbnails`), or the
CV file import's parser or PDF column detection (`check:cv-import`), or the
saved-CV library (`check:cv-library`), or the application log
(`check:applications`), or the job-ad matcher and its term
list (`check:job-match`), or the example bullets' number blanking and
role ranking (`check:bullet-ideas`), or any interface text or a
translation file (`check:i18n`). A
mistyped short key in `shareLinks.js` silently drops a field from every
link the app generates, so `check:share` in particular is cheap insurance.
CI (`.github/workflows/ci.yml`) runs all fifteen on every push to `main` and
`v1.7.0` (the current long-lived branch) and on every pull request.

`test:e2e` (and its `:fast`/`:slow` variants) build and serve the app first
(`playwright.config.js`'s `webServer`), deliberately not the dev server, so
they exercise real lazy chunks and the manual vendor chunking in
`vite.config.js` the way a user's browser actually sees them. First run
downloads Chromium (`npx playwright install chromium`).

The `template-layout.spec.js`/`template-pdf.spec.js`/
`template-pdf-placeholder.spec.js` stress and PDF tests (`@slow` in their
test titles) roughly double full-suite time, so CI (`.github/workflows/
ci.yml`) splits them into their own `e2e-slow` job; the main `e2e` job runs
`test:e2e:fast`. Tag a new slow test the same way (append ` @slow` to the
test title) rather than adding a third script.

## Architecture

**No backend; nothing saved unless the visitor chooses to.** This is a
static SPA (Vite + React 19) with no server and no database. CV data lives
in React state for the life of the tab and is never sent anywhere. The
only things that survive a reload without asking are the UI locale, an
onboarding-seen flag, and a session-restore snapshot of an edited CV (on
by default since 1.6.82, off in Settings; `sessionStorage`, so it goes
when the tab closes; the rest in `localStorage` — see `src/utils/cvForm.js`
for the storage keys). Sharing a CV means encoding it into a URL (below),
not uploading it anywhere.

**Saved CVs (1.7.1) live in IndexedDB, and only after Save.**
`src/utils/cvLibrary.js` is the store (db `portifycv`, store `cvs`, one
record per CV with its template; writes check `updatedAt` so a second tab
can't silently overwrite the first). `src/hooks/useCvLibrary.js` holds
the "active" saved CV: once the visitor presses the toolbar's Save and
names it, edits auto-save after `HISTORY_COMMIT_DELAY_MS`; another tab's
save pauses this tab until Save is pressed again. Anything that replaces
the whole CV on screen (clear, demo, JSON or file import, New CV) must call
`detach()` first, or the replacement would be auto-saved over the saved CV.
Opening a saved CV resets undo history (`useCvHistory`'s `resetHistory`),
so Undo never crosses CVs. A reload reattaches only when session restore
brought the same CV back (`ACTIVE_CV_SESSION_KEY` in `sessionStorage`).
`e2e/saved-cvs.spec.js` covers the flows, the two-tab conflict and a
browser that blocks IndexedDB.

**The job-ad match (1.7.2) is a term list, not word counting.**
`src/utils/jobMatch.js`'s `matchJobAd(formData, ad)` returns the ad's
requirements in ad order, split into `found` (with where in the CV:
skills, experience, summary, other), `missing` and `skillsOnly`. A
requirement is a `jobTerms.js` entry, a tech name or acronym recognised by
its shape (TypeScript, Next.js, CI/CD, C#, WCAG), or one of the CV's own
skills; plain capitalised words (cities, companies) never are. Finnish
endings are a closed list (`ENDINGS`), so "Reactista" is React while
"JavaScript" is never Java. When an ad reads badly, add it as a case to
`scripts/check-job-match.mjs` first. The panel's "Save a copy for this
job" opens the Save dialog with a suggested name; `saveAs` flushes the
open saved CV first, so that one keeps its state and the copy becomes the
active CV.

**Bullet hints (1.7.3) are per achievement, beside the field.**
`cvFeedback.js`'s `getBulletHints(bullets, { locale })` returns up to two
hints per bullet (duty phrase, weak opener, filler, over 30 words, repeated
opening verb, no number), every rule a closed list or a count.
`fields/BulletHints.jsx` renders them under the bullet in Classic's
`ReorderableListInput` and Direct Edit's popup list (`SectionEditorPopup`),
hidden on the bullet being typed in and linked with `aria-describedby`.
`check:feedback` also requires that no example CV bullet gets a phrasing
hint, so a new example has to model the advice.

**Bullet ideas (1.7.8) come from the example CVs, numbers blanked.**
`src/utils/bulletIdeas.js`'s `loadBulletIdeas(locale)` reads every
`EXAMPLES[id].load()` the first time a panel opens (cached per language, so
the example chunks aren't downloaded before then) and returns each role's
bullets with every number turned into `[__]`, except after a closed list of
standard names (`STANDARD_NAMES`: WCAG, ISO, SOC …). `rankIdeaRoles` orders
the roles by word overlap with the job's role, else the CV title (in
Finnish a shared compound tail of 6+ letters, "-kehittäjä", "-hoitaja",
also counts, below an exact match).
`fields/BulletIdeas.jsx` is the panel, used by Classic's
`ReorderableListInput` and Direct Edit's `SectionEditorPopup`.
`getBulletHints` adds a `blank` hint for a bullet still holding `[__]`, and
`countBlankBullets` feeds the PDF/HTML/Word download toasts. Cases live in
`check:bullet-ideas` (which also requires each English idea and its Finnish
twin to blank the same number of figures, and no figure written as a word,
so write example figures as digits) and `check:feedback`; `e2e/bullet-ideas.spec.js` covers
the panel.

**The cover letter (1.7.9) is CV data, drawn in the CV's look.**
`formData.coverLetter` (`{ company, role, hiringManager, body }`, factory
`createEmptyCoverLetter` in `cvForm.js`) is part of `CvData`, so Save, JSON
export/import and session restore keep it and "Load demo"/New CV replace it.
`shareLinks.js` has no key for it on purpose: a link never carries the
letter. `generateCoverLetterDraft(formData, { locale, jobAd, … })` in
`src/utils/coverLetter.js` drafts it in the CV's language (`cvLanguage`);
given the ATS panel's pasted ad it fills the role from `jobTitleFromAd` and
lists up to four requirements `matchJobAd` found in the CV (cases in
`check:job-match`). `CoverLetterModal.jsx` asks before Regenerate replaces
an edited letter. The PDF comes from an off-screen `CoverLetterPage.jsx`
(the template's font, heading colour and accent, resolved by
`coverLetterLook.js`; plain in ATS mode) captured by `renderCvPdf(…,
{ document: 'letter' })` (the `letter` entry of `PDF_MODES`, fit always
`actual`, so a long letter takes a second page) and previewed by
`PdfPreviewModal kind="letter"` (paper size only). The letter's name is
exactly the colour the CV paints its name in: the chosen headings colour,
else the look's own name colour, read from its palette through
`cvHeadingColors.js`'s `NAME_DEFAULT_COLOR_VARIABLES`; the four templates
in `NAME_OWN_COLOR_VARIABLES` give it the solid colour their own name shows.
The accent is only the thin rule under the letter's header.
`check:template-variants` requires every template in one of those tables. If the page can't be captured, `exportCoverLetterAsPdf`
in `exporters.js` writes the jsPDF text letter with the name and contact
line. Covered by `e2e/cover-letter.spec.js` (the all-template colour
comparison and the PDF checks are `@slow`); `e2e/export-fields.spec.js`
doesn't sweep it, since the letter is not CV content.

**"What a parser reads" (1.7.4) reuses the CV import on the exact PDF.**
The PDF preview's second tab (`PdfParserView.jsx`) turns the rendered
pages into the download's bytes (`renderedCvPdfToBlob`), reads them back
with `cvFileText.js` + `cvTextImport.js` and compares the result with the
CV (`src/utils/parserView.js`'s `compareParsedCv`: per field `ok`,
`partial`, `unrecognised` = in the text but not placed, `missing` = not in
the text). It runs only when the tab opens, and again after a paper/fit
change; the browser's text-only fallback PDF shows a note instead. Cases
live in `check:cv-import`; `e2e/pdf-parser-view.spec.js` covers the tab.

**Hand-rolled routing, no react-router.** `src/App.jsx` owns view state
directly (`useState` + `history.pushState`/`popstate`), matching the current
path against `ROUTES`/`VIEW_HEAD` (`src/utils/routes.js`,
`src/utils/pageMeta.js` — the single source of truth for every real path,
title, and description). Static content pages are keyed into one
`STATIC_PAGES` map and share one shell (header, footer, consent banner); the
CV builder (`src/pages/ResumeBuilderPage.jsx`) and the shared-CV page
(`SharedCvPage.jsx`, 1.7.12) are the two non-static views (`APP_VIEWS`).
Every page component except the landing page and the privacy policy
(`LandingPage`, `PrivacyPolicyPage`, imported eagerly by `App.jsx`) is
lazy-loaded.

Production is Cloudflare Workers (`wrangler.jsonc`, `main: worker/index.js`,
serving `dist/` as static assets). `worker/index.js` re-matches the same
route table at the edge and rewrites each response's
title/canonical/description/OG/JSON-LD before it reaches the client, because
this is a client-rendered SPA and a crawler that doesn't execute JS would
otherwise see the landing page's metadata for every route. Since 1.6.46 it
also replaces `index.html`'s no-JS `#seo-landing` body (the English front
page's copy) with each route's own heading, description and same-language
links (`fallbackBody`, checked by `check:template-pages`); since 1.6.49 it
puts each page's full pre-rendered markup there instead
(`src/prerender.jsx` + `scripts/prerender.mjs`, run by `npm run build`,
which renders `App` with a `route` prop in Node), keeping `fallbackBody`
as the fallback. A page component must therefore render without
`window`/`document` (touch them in effects only). `wrangler.jsonc`'s
`run_worker_first` sends `/` and `/prerendered/*` through the worker,
since Cloudflare serves any other path matching a `dist/` file directly,
and the worker may only export functions (the runtime reads each export
as an entry point; shared constants live in their own module, e.g.
`worker/adsense.js`). It also returns a
real 404 (with `noindex`) for unknown paths and redirects case/trailing-slash
variants to the canonical path. If you change a route or its metadata,
`routes.js`/`pageMeta.js` is the one place to edit — both the client
(`App.jsx`'s `useDocumentHead`) and the worker read from it.

**Template system — four pieces per bespoke template.** A template variant
(e.g. `portfolio`, `modern`, `developer`) is assembled from:

1. `src/utils/cvTemplates.js` — the template's identity: label, description,
   which CV sections it supports as `primarySections`/`secondarySections`,
   and its gallery-thumbnail styling. This drives what the editor's nav rail
   shows for that template.
2. `src/components/templates/<name>.js` — a plain config object of CSS
   class-getter functions and layout flags, consumed by the shared flat
   renderer (`CVPreview.jsx` + `shared.jsx`) that ATS-friendly mode always
   uses, and by simpler templates (minimal, techExec) as their only visual.
3. `src/components/templates/<Name>Showcase.jsx` +
   `src/styles/templates/<name>.css` — a fully bespoke, hand-styled non-ATS
   visual (its own header, sidebar, colors, cards). Most templates render
   this instead of the shared flat renderer whenever ATS mode is off;
   `CVPreview.jsx` dispatches to the right one by `variant`, and each
   delegation has its own comment explaining whether that template bypasses
   itself in ATS mode or renders a simplified version of the same Showcase
   (Timeline, Navy Professional, Modern Orange do the latter — see the
   comments beside each `if (variant === ...)` block for why).
4. The template's entry in `src/utils/templateVariants.js` — three looks (a
   palette of the template's own CSS variables, a font, a headings colour).
   Variant #1 must equal the stylesheet's root defaults, so declare every
   colour on the template's root rule as a variable. `check:template-variants`
   checks those root custom properties — variant #1 equals them exactly, each
   is declared once, any non-colour one is on an allowlist — plus contrast;
   it does not scan the rest of a stylesheet for hard-coded colour literals,
   so keep those out by review. The chosen look is stored per
   template as `styleVariantByTemplate` (below).

**Template thumbnails on the marketing pages are images (1.6.30).** The
front page's hero stack and template strip and the Free CV Templates grid
show `public/thumbnails/<template>/<look>-<en|fi>.webp` (via
`TemplateThumbnailImage`), not live CVs, which made those pages 7,000+ DOM
nodes of placeholder text. `npm run thumbnails` renders them from the live
`TemplateThumbnail` in a dev-only harness (`scripts/thumbnails/`, never
built) and records an input hash in `public/thumbnails/manifest.json`;
`check:thumbnails` fails when a file the harness imports (template JSX and
CSS, `CVPreview`, the demo CV, the look registry, the preview rules in
`app-shell.css`) changes without a regeneration. So after changing a
template's design or looks, run `npm run thumbnails` and commit the images.
The builder's gallery and the template pages' own preview stay live. The
same command also captures the front page's builder screenshot
(`product/direct-edit-<en|fi>.webp`, 1.6.32; checked for presence only)
and each template page's 1200 × 630 share image (`og/<template>-<en|fi>.jpg`
from `scripts/thumbnails/og.js`, 1.6.47), which `VIEW_HEAD` points
`og:image`/`twitter:image` at, and the builder walkthrough's screenshots
(`walkthrough/<step>-<en|fi>.webp`, 1.6.50, shown by
`BuilderWalkthroughFigure` on the front page and the builder guide). Like
the product shot, those builder screenshots aren't in the inputs hash:
regenerate them when the builder's look changes.

`src/components/templates/index.js` is the variant→config registry and also
owns `prefetchTemplateShowcases()` (idle-prefetch of every Showcase chunk, so
switching templates or opening the gallery — which thumbnails all templates
at once — doesn't pay for a dynamic import at that moment). Every
`*Showcase.jsx` is `React.lazy()`-loaded from `CVPreview.jsx`; a new bespoke
template should follow the same four-piece pattern and get added to both the
lazy-import list in `CVPreview.jsx` and the prefetch list in
`templates/index.js`.

**A new bespoke Showcase must also satisfy the Phase 2 layout harness**
(`docs/template-audit-phase2.md`, `e2e/template-layout.spec.js`,
`e2e/template-content.spec.js`, `e2e/helpers/layoutAudit.js`): put
`data-cv-name` on the name element (every existing `*Showcase.jsx`'s `<h1>`
has it — the harness's name-line-count rule keys off it), and render the
name and section titles through `CvHeading` (`<CvHeading as="h1">`), never
a bare `<h1>`/`<h2>`: inside a thumbnail or template-page preview it drops
the heading tag so the marketing pages keep one real `<h1>` each
(`e2e/seo-headings.spec.js`, 1.6.26) and `data-decorative`
on any purely-visual background/decoration node (the harness ignores
clipped/overflow violations inside one, since those never carry real
content). Render each experience entry's `achievements` and `technologies`
through the shared helpers in `directEditExperienceEntry.jsx`
(`getExperienceBullets`/`getExperienceAchievements`/
`getExperienceTechnologies`) rather than reading `item.description` alone —
this is the exact bug Task 8a's fix closed for the other 17 templates. Use
the §6 wrap primitives from `src/styles/templates/_system.css`
(`.tpl-value-breakable` for URLs/emails/long values, `.tpl-text-wrappable`
for ordinary word text, `.tpl-chip-wrappable` for skill chips) instead of a
bare `overflow-wrap: anywhere` — the latter lowers an element's min-content
size and can fracture an ordinary word once a row gets crowded. A new
template should pass `template-layout.spec.js`/`template-content.spec.js`
with zero new entries in `e2e/fixtures/layoutAllowlist.js` — that file is
`[]` as of this release, and a stale entry fails its own test, so treat any
addition as a real, temporary finding, not a way to ship around a failure.
If a template's PDF pagination changes (a density/content change, not a
regression), update `EXPECTED_PDF_PAGES` in `e2e/fixtures/pdfPages.js`
deliberately, in the same commit, and say why the count changed.

**Styling is hand-written utility CSS, not Tailwind.** `src/index.css`
imports `src/styles/tokens.css` (design tokens + reset),
`src/styles/app-shell.css` (shared chrome), `src/styles/utilities.css` (the
atomic `px-4`/`flex`/`text-xs`-style class layer), and one
`src/styles/templates/<name>.css` per bespoke Showcase. There is no Tailwind
build step or dependency — utility classes are authored by hand to match
Tailwind's naming.

**PDF export is lazy and worker-based.** `src/utils/exporters.js` dynamically
imports html2canvas + jsPDF only when an export is triggered (not from the
entry graph — see `vite.config.js`'s `manualChunks` comment on why these are
deliberately *not* grouped into a named vendor chunk). Page assembly runs in
`src/workers/pdfExportWorker.js`. Export → PDF never downloads straight away:
it opens `PdfPreviewModal.jsx`, which builds the pages with `renderCvPdf`
(paper `a4`/`letter`, fit `auto`/`one-page`/`two-pages`/`actual`, see
`PDF_PAPER_SIZES`/`PDF_FIT_MODES`) and saves exactly those pages with
`saveRenderedCvPdf` — e2e specs reach the file through
`e2e/helpers/pdfPreview.js`'s `downloadFromPdfPreview`. Page-break placement reads
`data-export-section`/`data-export-header`/`data-export-placement` attributes
that every Showcase's section wrapper renders, to avoid slicing a page
mid-card or leaving an orphaned section heading — see the block comments
above `collectCanvasPageBreakpoints`/`collectCanvasContentBlocks`/
`collectCanvasSectionHeadingBottoms` in `exporters.js` before changing that
logic, since main-column and sidebar breakpoints are deliberately handled
asymmetrically (main column drives the page-break decision; sidebar content
is filtered out of that calculation and just falls wherever it lands).
Cuts are then checked against the painted pixels, and designer pages are
painted full-page by repeating empty rows (`src/utils/pdfPageCanvas.js`), since
html2canvas paints text a few px from where the DOM puts it.
Each page is still a picture; `src/utils/pdfTextLayer.js` writes every line
over it as invisible text and adds the links, which is what an ATS reads. Its
font only has Windows-1252, so other Latin letters lose their accent in that
text and other scripts are left out of it.
Since 1.6.59 a final pass, `keepPageBreaksOutOfText`, moves any break that
would cut a text line or small icon in *either* column up above it and
re-flows the pages after it, so the sidebar can no longer be sliced
mid-line; `e2e/pdf-page-breaks.spec.js` (@slow) fails on any cut line.

**A new CV field has to reach the exports.** `e2e/export-fields.spec.js`
(`@slow`) fills every field the empty-entry factories in `cvForm.js` define and
looks for each in the HTML, Word, JSON and ATS PDF files of every template, so
a new field fails it until the flat renderer in `CVPreview.jsx`, the ATS
branches of Timeline/Navy/Modern Orange (`src/utils/atsDetails.js`), and
`docxExport.js`/`docxArchetypes.js`/`exporters.js` carry it. Designer PDFs
aren't covered: each Showcase chooses what it shows.

**CV file import (PDF and Word) is two lazy modules, and never a server.**
`src/utils/cvFileText.js` reads a `.pdf` (pdf.js, its worker bundled and
served from our own origin) or a `.docx` (jszip + `DOMParser`) into text
lines; `src/utils/cvTextImport.js` turns lines into `CvData` with
heading tables and patterns in English and Finnish. Both are reached only
through the `import()` in `ResumeBuilderPage.jsx`'s `handleImportCvFile`,
so pdf.js (about 1.9 MB with its worker) is downloaded when someone picks a
file and not before; don't import either module statically, and don't give
pdf.js a `manualChunks` entry (same reason as html2canvas/jsPDF, see
`vite.config.js`). The parser's rule is that a field it is unsure of stays
empty. A two-column PDF is split at its gutter before parsing
(`pdfPagesToLines`), with a `COLUMN_BREAK` line between the columns; page
one decides whether a CV has columns. When a layout imports badly, add its
lines as a case in `scripts/check-cv-import.mjs` first, then fix the
parser. `e2e/cv-file-import-roundtrip.spec.js` (`@slow`) exports the demo CV
from every template and imports the PDF back, so a template change that
alters how its PDF reads shows up there. The import applies with
`SET_FORM_DATA`, like JSON import, so undo restores the previous CV; the
paste box is separate and still merges (`parsePastedCvText`).

**A LinkedIn profile PDF (1.7.10) has its own reader.** LinkedIn's "Save to
PDF" puts the company above the job title, a duration on every date line
and the profile address over two lines, so `src/utils/linkedInImport.js`
reads it instead of `parseCvText`. `isLinkedInPdf(lines)` needs two of
three marks (an address labelled "(LinkedIn)", the "Top Skills" heading, a
"Page N of M" footer); `parseLinkedInText` returns `null` when it finds no
job and no degree, and `handleImportCvFile` then falls back to
`parseCvText`. It is lazy like the other import modules (same `import()`),
and reuses `readDates`/`parseLanguages`/`squashKeepingGaps` from
`cvTextImport.js` without changing them. Its cases in `check:cv-import`
follow a real export line for line (made-up people only; never commit a
real profile). The PDF lists only the member's top three skills, which the
import toast says.

**Applications (1.7.11) keep the PDF that was sent.** "Mark as applied"
(More actions; `MarkAppliedModal.jsx`) renders the CV, and the cover letter
when its body isn't blank, the way Download does, and keeps those PDFs with
the CV's data. `src/utils/applicationLog.js` is the store, its own
database `portifycv-applications` and not a second store in `portifycv`,
since a tab still running old code can't open an upgraded `portifycv` and
clearing one never touches the other. One record per application: `cv` and
`letter` (`{ pdf, fileName, paper, pages }`, the CV's with `fit`; `letter`
is `null` without a letter) and `source` (`{ data, templateId, look }`).
`src/hooks/useApplications.js` feeds My CVs' Applications tab (status and
note, kept after a short pause in typing, on blur and on close). `ApplicationViewModal.jsx` (View sent)
never re-renders: it shows the stored page images and downloads the stored
blob, so today's CV or template code can't change it. Its paper and margin
constants are copied from `exporters.js`'s `PDF_PAPER_SIZES`/`PDF_MODES`
(a lazy chunk), so change them together. Start new CV applies `source` in
one undo step (`recordTemplateLookStep`, then `SET_FORM_DATA` and the look;
ATS mode and the Classic name alignment are set but not undone), after
`detach()` like any whole-CV replacement. Settings' "Delete all
applications" is separate from "Delete all saved CVs". Cases live in
`check:applications`; `e2e/applications.spec.js` covers the flows, and its
`@slow` tests compare View sent's download with the PDF preview's
(page count and text layer) and read a stored letter's text.

**Share links carry the whole CV in the URL, never a server.**
`src/utils/shareLinks.js` encodes CV state with short single/double-letter
keys (`ROOT_STRING_KEYS`, etc.) to keep links short — never repurpose an
existing key, since older generated links decode against the same table.
Uploaded images are stripped from the payload (too large for a URL); the
sender is told so in the toast when copying the link (`/view` doesn't
mention missing photos), and JSON export is the way to send images. The per-template style-variant choice travels under the `va`
key, and the sender's selected template under `tp` (1.6.8; the link
opens on it — older links without it open on the default template). Since
1.7.12 a link opens the read-only `/view` page (below), not the builder.

**The share page (1.7.12) is `/view#data=…`, read-only, and writes nothing.**
`shareLinks.js` builds links as `/view#data=…` and also carries the
sender's look and PDF settings under new keys, each written only when it
differs from its default (permanent like the others): `ac` accent, `fo` font
id, `hc` headings colour, `na` name alignment (`'left'` only), `at` ATS mode
(`1` only), `pp` paper (`'letter'` only), `pf` fit (anything but `'auto'`);
`ac`/`fo` are written whenever non-empty. `hc` is written when the sender's
headings colour differs from the stored look's own (`variantHeadingColor`,
passed by `handleCopyShareLink`), and Default on a look that has a colour
travels as `hc: '-'`, which decodes to `headingColor: ''` (an explicit
value: `resolveSharedCvLook` and `createInitialUiState` only fall back when
it is `undefined`). `handleCopyShareLink` sends the resolved CV language
(`cvLocale`), so `cl` is always written: a CV that follows a Finnish app
reaches an English recipient in Finnish, and Edit a copy then has its CV
language pinned. A junk value in one of them falls
back to that one default (accent and headings colour are validated before
they can reach a style). `readCvStateFromLocation` returns `{ formData,
templateId, look, pdf, isEdit }`, `resolveSharedCvLook`
(`sharedCvLook.js`) turns the keys into the CV's look, and
`resolveTemplateId`/`LEGACY_TEMPLATE_ALIASES` live in `cvTemplates.js`.
`shareEditUrl` makes `/cv#data=…&edit=1`, the builder address.
`SharedCvPage.jsx` reads the fragment with `useSyncExternalStore`, shows
the CV in a `ScaledPreview` with the new `interactive` prop (the preview
stays selectable and clickable, and `CvIsPageContext` lets the CV's name
be the page's one `<h1>`; Showcases still render it through `CvHeading`
with `data-cv-name`), and renders a separate off-screen inert copy for
Download PDF (`renderCvPdf`/`saveRenderedCvPdf` with the link's paper and
fit). "Edit a copy" opens the builder in a new tab (`noopener`), where
`createInitialUiState` applies the link's look. The page follows the CV's
own language (`cvLanguage`) without writing the visitor's locale, and writes
no `sessionStorage`, saved CV or other storage. `VIEW_HEAD.shareView` is
`noindex, nofollow` (the worker rewrites robots from `head.robots`), the
view is in `AD_FREE_VIEWS` and `APP_VIEWS` (English path only, no Finnish
twin, never pre-rendered) and not in the sitemap. A link made before 1.7.12
(`/cv#data=…`) opened fresh is replaced with `/view` by `App.jsx`, but only
on the first route read and only without `edit=1`, so a reload or
back/forward of an old `/cv#data=` tab stays in the builder where the
visitor may have been editing. Covered by `e2e/share-view.spec.js` (one
`@slow` test) and `e2e/helpers/shareLinks.js`.

**CV data shape and mutations** are centralized in `src/utils/cvForm.js`
(the `CvData` shape, including `styleVariantByTemplate`, the chosen look per
template; empty-entry factories, section-visibility helpers) and
`src/types/cv.d.ts` (JSDoc typedefs referenced via `@typedef` comments, no
TypeScript build). All form/UI state changes go through
`src/reducers/cvFormReducer.js` and `src/reducers/uiReducer.js` — add a new
CV array-item type to `ARRAY_ITEM_FACTORIES` there, not ad hoc in a
component.

**Trilingual builder (`en`/`fi`/`sv`), from translation files (1.7.13, Swedish 1.7.14).**
Locale is threaded as a prop from `App.jsx` down, and interface text lives
in `src/i18n/`, our own small module, no library. `src/i18n/index.js` has
`LOCALES`, `DEFAULT_LOCALE`, `normalizeLocale` and
`createNamespace(name, { en, fi, sv }, { kind, locales })`, which returns
`ns.t(locale, key, vars)` (a dotted key; the locale's text, else English,
else the key; `{name}` filled from `vars`; a `{ one, other }` value picked
by `Intl.PluralRules` on `vars.count`; a function value called with
`vars`) and `ns.copy(locale)` (a whole copy object). `locales` (default: all of
`LOCALES`) names the languages a namespace has files for; any other
language reads English. The module is plain JS with no `window`, so it
runs in the Node pre-render and in the check scripts (`INTL_LOCALES` there
maps each language to its `Intl` tag). Each namespace is a folder,
`src/i18n/<namespace>/en.js`, `fi.js`, `sv.js` and an
`index.js` that calls `createNamespace`, and only the modules that show
its text import it, so a lazy page's text stays in that page's chunk. The
lazy ones are `cv` (CVPreview, the Showcases, `atsDetails.js`), `exports`
(`createExportCopy`), `letter` (`coverLetter.js`), `builder`, `form`,
`dialogs`, `feedback`, `share` and one `pages/<page>` per content page
except `pages/landing` and `pages/privacy`, which are in the entry because
`App.jsx` imports those two pages eagerly (`kind: 'page'`, read whole with `copy(locale)`, its shape kept: nested
arrays, functions such as `minRead`). The content pages have no Swedish
address, so every `pages/*` namespace passes `locales: ['en', 'fi']` and
is listed in `CONTENT_ONLY_NAMESPACES` in `check-i18n.mjs` (a namespace
lacking a language must be listed, and a listed one must still lack it);
a Swedish app language reading a content page gets English. A few small ones exist only so the
lazy text stays out of the entry or a shared chunk: `common` (App.jsx's
shell), `builderShell` (Toolbar, its switchers, the leave dialog) and
`cvForm` (`cvForm.js`) are in the entry; `formInline` (`EditableList.jsx`,
in the CV preview's shared chunk) and `fieldFilter`
(`TemplateFieldFilter.jsx`, also on the marketing pages) are separate for
the same reason; don't import a lazy namespace from those modules. Text
drawn on the CV or in an export uses the CV's language (a Showcase's
`locale`, `cvLocale`), everything else the app's; the code calls
`ns.t(locale, …)` with the locale it already has. `src/i18n/react.jsx`
also has `useT(ns)` (the page's `LocaleContext`) and `<T ns k parts>`
for a sentence with a link or `<strong>` in it (numbered tags,
`'Read the <0>guide</0>.'`, no nesting); nothing uses them yet. A key
built at runtime (`` `sections.${id}` ``) must sit under a prefix in
`src/i18n/dynamicKeys.js`'s `DYNAMIC_KEYS`, whose `ids` come from the
module that owns them, so a new section without a label fails the check.
`check:i18n` (`scripts/check-i18n.mjs`) checks parity (every language has
English's keys, array lengths, functions, plurals with `one`/`other`,
`{placeholders}` and `<n>` tags), that every key of a `kind: 'strings'`
namespace appears as a literal in `src/`, the plural cases
(`pluralCases`: the exact text for counts 0, 1 and 2 in each language),
and scans `src/` for an inline language branch (`isFinnish ? …`,
`locale === 'fi' ? …`, `{ en: …, fi: … }`, `labelFi`, `x[locale]`).
Its `ALLOWLIST` names the branches that stay, each with a reason (a stale
entry fails): logic (locale codes, Intl formatting locales, Finnish or
English addresses, the flag icon, the skill-category regexes, the date
format in `GuideLayout.jsx`) and the per-language data the scan sees:
route metadata (`pageMeta.js`, `routes.js`), `templatePageCopy.js`,
`landingFaq.js`, `exampleCvs.js`, and the `{ en, fi }` label maps in
`templateVariants.js`, `templateAccents.js`, `templateFields.js`,
`cvHeadingColors.js` and `cvTemplates.js` (now `{ en, fi, sv }`; checks
and e2e read `.label.en`) with their readers. Also per-language data on purpose,
though the scan doesn't see them: the example CVs in
`src/utils/examples/`, `templateMetaDescriptionsFi.js`, the sitemap, the
import tables in `cvTextImport.js`/`linkedInImport.js`,
`jobTerms.js`/`jobMatch.js` and `bulletIdeas.js`, none of which has
Swedish: for `sv` the example CVs, bullet ideas, paste parser and
PDF/Word import, job-ad match, `templatePageCopy.js` and `landingFaq.js`
fall back to English (a Swedish "Kompetenser:" line is not read);
`worker/` and `index.html` are outside `src/` and keep their own copy. To add a string, put the key (dotted by place, `toolbar.save`)
in `en.js`, `fi.js` and `sv.js` of the namespace that chunk already imports, call
`ns.t`, keep a sentence whole with `{placeholders}` (never Finnish or Swedish
built from fragments), give a plural a `pluralCases` entry, and run
`check:i18n`. To add a language, add its file to every namespace folder
and to that `index.js`'s `createNamespace` call (or leave it out of a
content namespace's `locales` and list that in `CONTENT_ONLY_NAMESPACES`),
add it to `LOCALES`, `CV_LANGUAGES` and `INTL_LOCALES` (parity then fails
on any namespace that lacks it), give every registry label map its key,
add the language's lists in `cvFeedback.js` (`WHOLE_WORD_WEAK_PHRASES`
and the other closed phrase lists) and the skill patterns in `shared.jsx`,
and extend the allowlisted places above. Swedish was written without a
native reviewer; `docs/superpowers/notes/2026-11-28-swedish-review.md`
lists what to read. The builder's toolbar has a language menu (English,
Suomi, Svenska) and Settings › CV language offers all three.

**The CV has its own language (1.7.5).** `formData.cvLanguage` (`''` =
follow the app, `'en'`, `'fi'`, `'sv'`; Settings › CV language) decides the
language of everything drawn on the CV page and of every export.
`CVPreview` resolves it itself (`resolveCvLocale` in `cvForm.js`) from its
`locale` prop, which stays the app's language and still feeds
`DirectEditProvider` (popups, menus); the builder page passes `cvLocale`
to the PDF/HTML/Word exports and the parser view. Hints, the ATS panel and
the importer stay in the app's language. Share links carry it as `cl`
(since 1.7.12 always, resolved from the app's language when `''`).
Since 1.7.7 the builder also provides it as `CvLanguageContext`
(`src/components/cvLanguageContext.js`): every control the CV is typed
into (`FloatingField`'s child, `EditableField`, the Direct Edit popup,
list/tag/chip inputs) spreads `useCvTextProps()`, which sets `lang` so the
browser spell-checks in the CV's language, with spell check off for names,
contact details, organisations, tech names and dates (`NO_SPELLING_FIELDS`;
Classic's inputs say `spellCheck={false}` themselves). A new CV text input
should use the hook too.

**Finnish pages have their own addresses (1.6.35).** Every content page and
template page also lives under `/fi/…` (`ROUTES_FI` in `routes.js`;
template pages at `/fi/ilmaiset-cv-pohjat/<same slug>`), and the address
decides the language: `/fi/…` is Finnish, every other content address
English, whatever the visitor saved. Only the builder's `/cv` has no
language of its own (it uses the saved one). Each `VIEW_HEAD` entry carries
`pathFi`/`titleFi`/`descriptionFi` beside the English fields (template
pages read `templateMetaDescriptionsFi.js`); `localizedHead(head, locale)`
picks one language, and `PATH_TO_VIEW` maps every path in both languages to
its view. Link with English paths as before: `InternalNavLink` rewrites
them into the page's language (`LocaleContext`, `localizePath`), so a
Finnish page never links to an English one; a raw `<a href>` must call
`localizePath` itself. The header's language switch moves to the twin page.
App and the worker both emit `<html lang>`, `og:locale` and the
`hreflang` en/fi/x-default links, and `public/sitemap.xml` lists both
languages with their alternates. `check:template-pages` fails if a page
lacks its Finnish fields, a path collides, or the sitemap misses a path or
its alternates. Finnish slugs are permanent like the English ones.

**Per-template pages (`/free-cv-templates/<slug>`).** Each of the 18
templates gets its own public page, generated from `cvTemplates.js` (the
template's slug, section support, layout) plus `VIEW_HEAD`
(`pageMeta.js`, which drives the worker's edge metadata the same way
every other route does). The per-template copy is split in two so the
app's entry chunk doesn't pay for text it never reads: `pageMeta.js`
imports only the small, English-only `templateMetaDescriptions.js`
(`{ [templateId]: string }`) for `VIEW_HEAD`'s description, while the
bilingual `bestFor`/tips copy in `templatePageCopy.js` is read only by
the lazy-loaded `TemplateDetailPage.jsx` — don't import
`templatePageCopy.js` from anything in the entry graph (`App.jsx`,
`pageMeta.js`, `routes.js`), or every template's bilingual copy ships to
every visitor on first load. Slugs are public URLs and are permanent once
shipped — never rename one. Example people live one file per person in
`src/utils/examples/`, registered in `exampleCvs.js`
(`EXAMPLES`/`TEMPLATE_EXAMPLES`), and shared across templates where the
fit is real rather than duplicated. Every example must fill every
`primarySections` entry of each template it's listed under, in both
locales — `check:template-pages` enforces this, so an empty section never
reaches a visitor. A template page also takes `?style=<variantId>` (one
of that template's looks in `templateVariants.js`; an unknown id is
Original, which is never written into a URL), set from its Style picker
or a gallery/grid card, and passes it to the builder, which applies it to
whatever CV it starts with, like `?example=`, and strips it. It also
passes through `?field=` (the Free CV Templates filter it was opened
from, 1.6.16) to its links back to the grid and to the previous/next
template; the page never shows it and the builder never receives it.
`src/utils/sectionContent.js`'s `hideEmptySections()`
hides a section that has no real content instead of rendering its
placeholder text, read by the per-template marketing page (its only
preview) and by the builder's dedicated off-screen, read-only, inert
`CVPreview` that each mode's `previewRef` (the PDF export source) points
at — Classic mode's in `ResumeBuilderPage.jsx`, Direct Edit's in
`DirectEditPreview.jsx` — never mutating the CV and never touching either
mode's visible, editable preview, which still shows the live placeholder
text as an editing affordance.
