# Template pages — design (v1.4, Phase 1)

**Date:** 2026-10-01
**Branch:** `v1.4.0` (cut from `v1.3.0`; rebase onto `main` once the 1.3.0 PR merges)
**Status:** draft, awaiting review

## Goal

Give each of the 18 templates its own public page at
`/free-cv-templates/<slug>`. The page shows the template filled with 2–3
realistic example CVs the visitor can switch between, explains who the
template suits, and opens the builder with that template and example
loaded. Both locales (en/fi) use the same URL, switched by the existing
locale toggle, like every other page.

Why: today `/free-cv-templates` is the only place a template can be
discovered from search, and every card shows the same demo person. A page
per template gives search engines 18 distinct landing pages, and gives
visitors a realistic picture of their own role in that layout. The example
CVs also become the stress data for Phase 2 (template polish).

## Non-goals

- Separate Finnish URLs or `hreflang` (decided: one bilingual URL).
- Colour/font variants and gallery filters (Phases 3 and 4). The page may
  show the template's existing accent swatches if that comes for free, but
  nothing new is built for it.
- Changing any template's visual design (Phase 2).
- Server-side rendering. Crawlers get per-page metadata from the worker,
  as for every existing page.

## User-facing behaviour

### The template page

```
┌─ shared static-page shell (header, locale toggle, footer) ─────────────┐
│ Templates › Developer                                    (breadcrumb)  │
│                                                                        │
│ ┌ left column ───────────────┐  ┌ right column ──────────────────────┐ │
│ │ H1  Developer CV template  │  │                                    │ │
│ │ one-line description       │  │  full CVPreview of the selected    │ │
│ │ Best for: …                │  │  example, scaled to fit the column │ │
│ │ Layout facts (chips):      │  │  (normal mode; "ATS view" toggle   │ │
│ │  2 columns · photo · N     │  │   flips it to the ATS rendering)   │ │
│ │  sections · ATS mode       │  │                                    │ │
│ │ Examples: [Frontend dev]   │  │                                    │ │
│ │  [Data engineer] [Junior]  │  │                                    │ │
│ │ [ Use this example ]       │  │                                    │ │
│ │ [ Start blank with it ]    │  │                                    │ │
│ └────────────────────────────┘  └────────────────────────────────────┘ │
│ Tips for this template (3 bullets, unique per template)                │
│ ← Previous template          All templates          Next template →   │
└────────────────────────────────────────────────────────────────────────┘
```

Under 1024px the columns stack: text and buttons first, then the preview.

- **Example switcher:** a segmented control (`role="radiogroup"`) with one
  option per example, labelled by role ("Frontend developer"). Switching
  re-renders the preview. The selected example is kept in the URL as
  `?example=<exampleId>` (via `history.replaceState`, so it doesn't add a
  back-button entry), so a link to a specific example can be shared. An
  unknown or missing `?example=` falls back to the template's first
  example.
- **ATS view toggle:** shows the same example in ATS-friendly mode, which
  makes it obvious what that mode does on this template.
- **"Use this example"** opens `/cv?template=<id>&example=<exampleId>`
  (builder handoff below).
- **"Start blank with this template"** opens `/cv?template=<id>`, which
  already works today.
- **Previous/next** follow the order in `cvTemplates.js` and wrap around.
- **Breadcrumb** links back to `/free-cv-templates`.

### The hub page (`/free-cv-templates`)

Each card's thumbnail and name become a link to that template's page
(using `InternalNavLink`, so it's a real `<a href>` crawlers can follow).
The card's existing "Use this template" button stays as it is.

### Builder handoff (`/cv?template=x&example=y`)

`ResumeBuilderPage`'s `loadInitialCvSession` gets one new step. Priority
order, highest first:

1. Share link (`?data=` / `#data=`): unchanged.
2. **Session-restore snapshot, if one exists:** restore it, apply the
   `?template=`, and **do not** load the example. Toast: "Kept your restored
   CV. Use 'Load demo CV' to start over." This means an example link can
   never silently overwrite a CV the user is working on.
3. **`?example=` that matches a known example for the selected template:**
   load that example in the current UI locale, mark onboarding as seen,
   toast "Loaded the <role> example." The user can undo with the existing
   toolbar undo arrow.
4. Onboarding demo / blank: unchanged.

After loading, the `example` query param is removed from the URL (same as
`clearShareParam` does for share links), so a reload doesn't re-apply it
on top of edits.

Unknown example ids, or an id that isn't listed for that template, are
ignored and fall through to step 4. No error is shown.

## Architecture

### Template slugs: `src/utils/cvTemplates.js`

Each template entry gets a `slug` field: kebab-case and permanent, e.g.
`developer`, `modern-timeline`, `tech-executive`, `classic-professional`,
`modern-orange`. A comment above the registry states that slugs are public
URLs and must never be renamed. If a template is ever retired, its slug
redirects to its replacement, the same way `?template=classic` does now.

### Routes and metadata: `routes.js` / `pageMeta.js`

Routing stays exact-match, so there are no route parameters to add.

- `routes.js` adds `templatePath(slug)` → `/free-cv-templates/${slug}`.
- `pageMeta.js` generates one `VIEW_HEAD` entry per template, keyed
  `template:<templateId>`, from `cvTemplates`:
  - `title`: `"<Label> CV Template – Free, No Login - PortifyCV"`
  - `description`: from the per-template copy (below), at most 160 characters
  - `path`: `templatePath(slug)`
  - `templateId`
  - `schema: 'template'`

Because `App.jsx`'s `getInitialView` and the worker's `PATH_TO_HEAD` both
iterate over `VIEW_HEAD`, all 18 paths resolve on the client and at the
edge with no further routing code. That includes the worker's
lowercase/trailing-slash redirects and the real 404 for unknown slugs.

### Structured data

`pageMeta.js` gains `buildTemplatePageSchema(head)`, which returns a
`BreadcrumbList` (Home › Free CV templates › <Label>). Both places that
currently branch on `head.isArticle` get a matching `head.schema ===
'template'` branch: `App.jsx`'s `useDocumentHead` and `worker/index.js`'s
`rewriteForRoute`. Each existing branch is a few lines, so the new one
follows the same pattern rather than adding a generic schema abstraction.

### App shell: `App.jsx`

- `STATIC_PAGES` lookup: when `view` starts with `template:`, render the
  lazy-loaded `TemplateDetailPage` with `templateId` taken from
  `VIEW_HEAD[view].templateId`.
- `goToBuilder(templateId, exampleId?)` gains an optional second argument
  that adds `&example=`.
- The page receives the existing `onGetStarted` / `onNavigateToView` props.

### New page: `src/pages/TemplateDetailPage.jsx`

A single component for all 18 pages. It reads:

- the template from `getCvTemplates(locale)` (label, description,
  `primarySections`/`secondarySections` for the section count, `layout` for
  the column fact, photo capability),
- the per-template copy from `templatePageCopy.js`,
- the example list from `exampleCvs.js`.

The selected example's CV data is loaded with a dynamic `import()`, so a
visitor only downloads the examples they actually view. The preview
renders the full `CVPreview` (lazy, the same chunk the landing page and
builder share) inside a new small `ScaledPreview` wrapper. `ScaledPreview`
measures its container width and applies a CSS `transform: scale()` to an
A4-width page. The Suspense fallback is a same-sized placeholder, so the
layout doesn't jump.

### Per-template copy: `src/utils/templatePageCopy.js`

`{ [templateId]: { en: { bestFor, metaDescription, tips: [3] }, fi: {…} } }`.
Each template's text is written for that template specifically: who it
suits, and three concrete tips about its layout (e.g. "the sidebar fits
~12 skills before it pushes the next section onto page 2"). Unique text
per page is what keeps 18 near-identical pages from reading as thin or
duplicate content to search engines and AdSense review.

### Example CVs: `src/utils/examples/`

- **`src/utils/examples/<exampleId>.js`:** one file per example person.
  Each exports `{ en: CvData, fi: CvData }`. The Finnish version is
  translated and adapted to Finnish CV conventions (see
  `FinnishCvExamplesPage`), not a word-for-word translation. Each version
  is a complete `CvData` built over `createInitialCvData()`, and
  `parseImportedCvData` accepts it without dropping any content (the same
  path a JSON import takes).
- **`src/utils/exampleCvs.js`:** the registry.
  - `EXAMPLES`: `{ [exampleId]: { role: { en, fi }, load: () => import('./examples/<id>.js') } }`
  - `TEMPLATE_EXAMPLES`: `{ [templateId]: [exampleId, …] }`, with 2–3
    entries per template.
  - Helpers `getTemplateExamples(templateId)` and
    `loadExampleCv(exampleId, locale)`.
- **Shared pool:** an example person can be listed under more than one
  template when the fit is real. For instance, the senior frontend
  developer works for both Developer and Tech Executive. The target is
  about 24 people covering 18 × 2–3 slots, not 45 separate ones. Each
  person fills every section that any of their templates renders, so no
  template shows an empty section.
- **Fictional people only:** invented names, `example.com` emails, and
  `+358 40 000 xxxx`-style numbers. Photo templates use the existing
  `PLACEHOLDER_PROFILE_PHOTO` silhouette from `thumbnailCv.js` (moved into
  a shared export). There are no real-looking photos and no real
  companies' branding beyond generic employer names.
- **Lengths vary deliberately across the pool:** one long name, one
  junior with thin experience, one with many skills, and one with a
  two-page history. That way Phase 2 gets real stress cases for free.

### Sitemap: `public/sitemap.xml`

Add 18 `<url>` entries by hand, matching the file's existing style. Drift
is caught by the check script below.

## Testing

### New `npm run check:template-pages`: `scripts/check-template-pages.mjs`

A framework-free Node script like the other checks, added to CI. It
asserts:

1. Every template has a slug. Slugs are unique, kebab-case, and match
   `/^[a-z0-9]+(-[a-z0-9]+)*$/`.
2. Every template has 2–3 examples. Every listed example id exists in
   `EXAMPLES`, and every example in `EXAMPLES` is used by at least one
   template.
3. Every example loads in both `en` and `fi`, is accepted by
   `parseImportedCvData` with the same section entry counts before and
   after parsing, and has a non-empty `fullName`,
   `title`, and at least one experience or education entry.
4. For each template × example pair, every section in the template's
   `primarySections` is non-empty in that example (both locales).
5. Every template has `templatePageCopy` in both locales: exactly 3 tips,
   and an English `metaDescription` of 50–160 characters (English-only,
   like every `VIEW_HEAD` description).
6. Every template page path appears in `public/sitemap.xml`. Every
   `VIEW_HEAD` title is unique.
7. Example emails end in `@example.com`.

### E2E: new `e2e/template-pages.spec.js`

- Opening `/free-cv-templates/developer` directly shows the H1, and the
  preview shows the first example's name.
- Clicking another example updates the preview name and the URL's
  `?example=`. Reloading keeps that example.
- The ATS view toggle switches the preview to ATS rendering.
- "Use this example" lands on `/cv` with Developer selected, the example's
  name in the preview, and no `example` param left in the URL.
- With session restore on and a snapshot present, "Use this example"
  keeps the snapshot and applies only the template.
- A hub card link navigates to the template page. Previous/next wrap
  around.
- `/free-cv-templates/not-a-template` shows the not-found view.
- Finnish locale: the page copy and example content are in Finnish.
- Every one of the 18 pages renders without console errors (one
  parametrised test).

### Manual check before PR

`npm run worker:dev`, then `curl` two template paths and confirm the edge
rewrote the title, description, canonical, and breadcrumb JSON-LD. Also
confirm an unknown slug returns a real 404 and an uppercase slug redirects.

## Build order

1. Slugs, routes, metadata, worker/App wiring, and the page skeleton
   rendering the current demo CV. Lands the routing end to end.
2. `ScaledPreview`, example switcher, ATS toggle, prev/next, breadcrumb,
   hub links.
3. Example registry plus the check script, then the example content
   itself (en first, then fi), in batches of about 6 people.
4. Builder handoff (`?example=`) with the session-snapshot guard.
5. Per-template copy (en/fi), sitemap, and the e2e spec.
6. Version bump, changes.md, PR into `main`.

## Risks

- **Content volume:** about 24 people × 2 locales of full CVs, plus 18 × 2
  sets of page copy. This is the bulk of the work. Quality matters more
  than speed: weak examples on an SEO page do more harm than no page.
- **Bundle:** example files are dynamically imported per person, and the
  page itself is lazy, so the entry chunk doesn't grow. Verified by
  comparing `vite build` output before and after.
- **Thin-content risk** across 18 similar pages is mitigated by
  per-template copy and different example people. Worth checking in Search
  Console after deploy.
