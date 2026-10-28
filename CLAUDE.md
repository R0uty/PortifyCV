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
or anything a template thumbnail is rendered from (`check:thumbnails`). A
mistyped short key in `shareLinks.js` silently drops a field from every
link the app generates, so `check:share` in particular is cheap insurance.
CI (`.github/workflows/ci.yml`) runs all nine on every push to `main` and
`v1.6.0` (the current long-lived branch) and on every pull request.

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

**No backend, no persistence.** This is a static SPA (Vite + React 19) with
no server and no database. CV data lives only in React state for the life of
the tab — nothing is saved automatically. The only things that survive a
reload are the UI locale, an onboarding-seen flag, and (if the user opts in)
a session-restore snapshot (`sessionStorage`; the rest in `localStorage` — see `src/utils/cvForm.js`
for the storage keys). Sharing a CV means encoding it into a URL (below), not
uploading it anywhere.

**Hand-rolled routing, no react-router.** `src/App.jsx` owns view state
directly (`useState` + `history.pushState`/`popstate`), matching the current
path against `ROUTES`/`VIEW_HEAD` (`src/utils/routes.js`,
`src/utils/pageMeta.js` — the single source of truth for every real path,
title, and description). Static content pages are keyed into one
`STATIC_PAGES` map and share one shell (header, footer, consent banner); the
CV builder (`src/pages/ResumeBuilderPage.jsx`) is the one non-static view.
Every page component is lazy-loaded.

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
`src/workers/pdfExportWorker.js`. Page-break placement reads
`data-export-section`/`data-export-header`/`data-export-placement` attributes
that every Showcase's section wrapper renders, to avoid slicing a page
mid-card or leaving an orphaned section heading — see the block comments
above `collectCanvasPageBreakpoints`/`collectCanvasContentBlocks`/
`collectCanvasSectionHeadingBottoms` in `exporters.js` before changing that
logic, since main-column and sidebar breakpoints are deliberately handled
asymmetrically (main column drives the page-break decision; sidebar content
is filtered out of that calculation and just falls wherever it lands).
Since 1.6.59 a final pass, `keepPageBreaksOutOfText`, moves any break that
would cut a text line or small icon in *either* column up above it and
re-flows the pages after it, so the sidebar can no longer be sliced
mid-line; `e2e/pdf-page-breaks.spec.js` (@slow) fails on any cut line.

**Share links carry the whole CV in the URL, never a server.**
`src/utils/shareLinks.js` encodes CV state with short single/double-letter
keys (`ROOT_STRING_KEYS`, etc.) to keep links short — never repurpose an
existing key, since older generated links decode against the same table.
Uploaded images are stripped from the payload (too large for a URL) with the
recipient told they're missing; export JSON instead when images need to
travel too. The per-template style-variant choice travels under the `va`
key, and the sender's selected template under `tp` (1.6.8; the link opens
on it — older links without it open on the default template).

**CV data shape and mutations** are centralized in `src/utils/cvForm.js`
(the `CvData` shape, including `styleVariantByTemplate`, the chosen look per
template; empty-entry factories, section-visibility helpers) and
`src/types/cv.d.ts` (JSDoc typedefs referenced via `@typedef` comments, no
TypeScript build). All form/UI state changes go through
`src/reducers/cvFormReducer.js` and `src/reducers/uiReducer.js` — add a new
CV array-item type to `ARRAY_ITEM_FACTORIES` there, not ad hoc in a
component.

**Bilingual throughout (`en`/`fi`).** Locale is threaded as a prop from
`App.jsx` down; most user-facing strings are inline `isFinnish ? '...' :
'...'` pairs rather than a translation-file/i18n library.

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
