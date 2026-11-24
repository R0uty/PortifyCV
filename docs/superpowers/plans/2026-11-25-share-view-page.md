# Read-only Share Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every share link opens a view-only `/view` page showing the CV in the sender's template and look, with Download PDF and a small "Edit a copy" link.

**Architecture:** `shareLinks.js` gains optional look/PDF keys and writes `/view#data=…`; a pure resolver (`sharedCvLook.js`) turns a decoded link into the props a `CVPreview` needs. A new lazy `SharedCvPage.jsx` route renders a scaled preview plus an off-screen inert export copy and downloads through the existing `renderCvPdf`/`saveRenderedCvPdf`. `App.jsx` sends a freshly opened `/cv#data=…` (no `edit=1`, navigation type `navigate`) to `/view` with `history.replaceState`.

**Tech Stack:** React 19, Vite, Playwright, Node `check:*` scripts, Cloudflare Worker.

**Spec:** `docs/superpowers/specs/2026-11-25-share-view-page-design.md`

## Global Constraints

- Branch `v1.7.0`; release 1.7.12. Version bump is its own commit: `npm version 1.7.12 --no-git-tag-version`, message "Bump version to 1.7.12".
- Commits carry only the user's name: no `Co-Authored-By` line, no Claude attribution.
- Never push without the user's explicit "Push branch".
- Share-link short keys are permanent: never rename or reuse one. New keys: `ac` accent, `fo` font id, `hc` headings colour, `na` name alignment (`'left'` only), `at` ATS mode (`1` only), `pp` paper (`'letter'` only), `pf` fit (non-`'auto'` only). Each is written only when it differs from its constant default (A4, auto, centre, ATS off, empty headings colour); `ac`/`fo` are written whenever non-empty.
- The fragment stays the carrier (`#data=…`); nothing new goes in the query string or to a server. `#data=` stays in the address after load (deliberate).
- The view page writes nothing: no `sessionStorage` snapshot, no saved-CV library, no locale write.
- `/view`: English path only (like `/cv`), `robots` `noindex, nofollow`, in `AD_FREE_VIEWS`, not in the sitemap, not pre-rendered.
- Photos and the cover letter never travel in links (unchanged).
- Bilingual `isFinnish ? … : …` copy; every copy claim checked against the code.
- Exact copy (EN / FI):
  - Download button: "Download PDF" / "Lataa PDF"; while busy: "Preparing PDF…" / "Valmistellaan PDF:ää…"
  - Download error: "The PDF could not be made. Try again." / "PDF:ää ei voitu tehdä. Yritä uudelleen."
  - Edit link: "Edit a copy" / "Muokkaa kopiota", `title` "Opens the CV in the builder in a new tab" / "Avaa CV:n muokattavaksi uuteen välilehteen"
  - Footer: "Made with PortifyCV" / "Tehty PortifyCV:llä" (link to `/`, or `/fi` in Finnish)
  - Bad link heading: "This CV link can't be opened" / "Tätä CV-linkkiä ei voi avata"; text: "The link may have been cut short or changed. Ask the sender for a new one." / "Linkki on voinut katketa tai muuttua. Pyydä lähettäjältä uusi linkki."; link "Go to PortifyCV" / "Siirry PortifyCV:hen"
  - Document title: "<Full name> — CV" when the CV has a name, else "Shared CV - PortifyCV" / "Jaettu CV - PortifyCV"
  - Copy-link success toast: "Share link copied. It opens a view-only page with a PDF download." / "Jakolinkki kopioitu. Se avaa CV:n katselusivun, josta voi ladata PDF:n."; the images variant appends " Images are left out of the link — share the JSON export if they are needed." / " Kuvat jäävät linkin ulkopuolelle — jaa JSON, jos ne tarvitaan."

## Review Focus

1. A link made before 1.7.12 (no look keys, `/cv#data=…`) opened fresh → lands on `/view` in the template's stored look, A4, auto fit; nothing crashes.
2. A junk value in a new key (`fo: 'comic'`, `ac: 'red;}'`, `pp: 'a3'`) → that one value falls back to its default; the CV still opens. A CSS-injecting accent must never reach a style.
3. Reloading `/view#data=…` shows the same page; reloading an old `/cv#data=…` tab stays in the builder.
4. A CV whose `cvLanguage` is `fi` opened by an English visitor → the CV and the page's own copy are Finnish; the visitor's saved app locale isn't changed.
5. Download pressed twice quickly → one PDF, button disabled while busy; capture failure → the text-only fallback PDF still downloads.

Each line's test is in the owning task below.

---

### Task 1: Link format and look resolver

**Files:**
- Modify: `src/utils/shareLinks.js` (`buildShareUrl`, `encodeCvStateForUrl`, `readCvStateFromLocation`, new helpers)
- Create: `src/utils/sharedCvLook.js`
- Test: `scripts/check-share-links.mjs`

**Interfaces:**
- Produces:
  - `encodeCvStateForUrl(formData, templateId = null, extras = {})` where `extras = { look?: SharedLook, pdf?: { paper, fit } }`.
  - `buildShareUrl(formData, { templateId, look, pdf, currentHref })` → `'<origin>/view#data=<encoded>'` (throws as today when too long).
  - `readCvStateFromLocation(href)` → `null | { formData, templateId, look: SharedLook, pdf: { paper: 'a4'|'letter', fit: 'auto'|'one-page'|'two-pages'|'actual' }, isEdit: boolean }`. `look` holds only the keys the link carried and that validated; `pdf` is always complete (defaults filled). `isEdit` is true when the fragment has `edit=1`.
  - `shareEditUrl(shareUrl: string)` → same origin, pathname `/cv`, hash `data=<same>&edit=1`.
  - `SharedLook = { accent?: string, fontId?: string, headingColor?: string, nameAlignment?: 'left'|'center', atsFriendlyMode?: boolean }`.
  - `src/utils/sharedCvLook.js`: `resolveSharedCvLook(formData, templateId, look = {})` → `{ template, accentColor, cvFontId, cvHeadingColor, classicNameAlignment, atsFriendlyMode, styleVariantId }`. `template` is `resolveTemplateId(templateId) ?? defaultTemplateId`; each look field is the link's value when present, otherwise what `applyStoredLooks` would give for that CV and template (variant accent, else `getAllTemplateAccents()[template]`; variant `fontId`/`headingColor`), `'center'`, `false`; `styleVariantId = resolveStyleVariantId(formData, template)`.

- [ ] **Step 1: Write the failing checks in `scripts/check-share-links.mjs`**

```js
const look = { accent: '#0f766e', fontId: 'arial', headingColor: '#1f2937', nameAlignment: 'left', atsFriendlyMode: true }
const pdf = { paper: 'letter', fit: 'one-page' }
const url = share.buildShareUrl(demo, { templateId: 'developer', look, pdf, currentHref: 'https://portifycv.app/cv' })
check('share links open /view', new URL(url).pathname === '/view')
const back = share.readCvStateFromLocation(url)
check('look round-trips', JSON.stringify(back.look) === JSON.stringify(look))
check('pdf settings round-trip', back.pdf.paper === 'letter' && back.pdf.fit === 'one-page')
check('a fresh link is not an edit link', back.isEdit === false)
const edit = share.shareEditUrl(url)
check('edit url is /cv with edit=1', new URL(edit).pathname === '/cv' && share.readCvStateFromLocation(edit).isEdit === true)
check('edit url keeps the same CV', diff(back.formData, share.readCvStateFromLocation(edit).formData).length === 0)
// defaults are not written
const plain = share.encodeCvStateForUrl(demo, 'developer', { look: { nameAlignment: 'center', atsFriendlyMode: false, headingColor: '' }, pdf: { paper: 'a4', fit: 'auto' } })
check('defaults add no keys', plain === share.encodeCvStateForUrl(demo, 'developer'))
// an old link (no look keys, /cv path)
const old = share.readCvStateFromLocation(`https://portifycv.app/cv#data=${share.encodeCvStateForUrl(demo, 'developer')}`)
check('old link: empty look, default pdf', Object.keys(old.look).length === 0 && old.pdf.paper === 'a4' && old.pdf.fit === 'auto')
// junk values fall back one by one (Review Focus 2)
const junk = rawLink({ ac: 'red;}body{x', fo: 'comic', hc: 'blue', na: 'right', at: 'yes', pp: 'a3', pf: 'huge' })
check('junk look values are dropped', Object.keys(junk.look).length === 0 && junk.pdf.paper === 'a4' && junk.pdf.fit === 'auto')
check('junk look values keep the CV', junk.formData.fullName === demo.fullName)
// resolver
const { resolveSharedCvLook } = await importUtil('sharedCvLook.js')
const resolvedOld = resolveSharedCvLook(demo, 'retired-id', {})
check('unknown template → default template', resolvedOld.template === defaultTemplateId)
check('resolver uses link values first', resolveSharedCvLook(demo, 'developer', look).cvFontId === 'arial')
check('resolver falls back to the stored look', resolveSharedCvLook(demo, 'developer', {}).cvFontId === expectedVariantFont)
```

`rawLink(extraKeys)` builds a payload with `encodeCvStateForUrl(demo, 'developer')`, decodes it to JSON, merges `extraKeys` into `d`, re-encodes base64url and reads it back with `readCvStateFromLocation`. `expectedVariantFont` is `getTemplateVariant('developer', resolveStyleVariantId(demo, 'developer')).fontId`. Accent validates as `/^#[0-9a-f]{6}$/i`, headings colour with `isValidCvHeadingColor`, font against `CV_FONT_OPTIONS` ids.

- [ ] **Step 2: Run** `npm run check:share` — expected: the new checks FAIL (`buildShareUrl` still writes `/cv`, `look` undefined).

- [ ] **Step 3: Implement** the Interfaces above in `shareLinks.js` and `sharedCvLook.js`. The new keys sit beside `tp` in `payload.d` (not in `compressCvData`, like `tp`). Comment each key "permanent once shipped". Update the comment block above `readCvStateFromLocation`.

- [ ] **Step 4: Run** `npm run check:share && npm run check:reducers && npm run lint` — expected: all pass.

- [ ] **Step 5: Commit** — `git add src/utils/shareLinks.js src/utils/sharedCvLook.js scripts/check-share-links.mjs && git commit -m "Carry the sender's look and PDF settings in share links"`

### Task 2: The `/view` route and the old-link redirect

**Files:**
- Modify: `src/utils/routes.js` (`ROUTES.shareView = '/view'`), `src/utils/pageMeta.js` (`VIEW_HEAD.shareView`, `AD_FREE_VIEWS`, new `APP_VIEWS`, `PATH_TO_VIEW` locale `null` for app views), `src/App.jsx` (`readRoute`, render branch, `useDocumentHead`), `worker/index.js` (robots from `head.robots`; no pre-render for `APP_VIEWS`), `scripts/prerender.mjs`, `scripts/check-template-pages.mjs`, `e2e/prerender.spec.js`
- Create: `src/pages/SharedCvPage.jsx` (stub in this task: renders the bad-link message or `<p data-testid="shared-cv-stub">` with the name)
- Test: `e2e/share-view.spec.js`

**Interfaces:**
- Produces: view id `'shareView'`; `APP_VIEWS = new Set(['builder', 'shareView'])` exported from `pageMeta.js` (views with no Finnish path, no pre-render, no sitemap entry; replaces each `view === 'builder'` skip in `prerender.mjs`, the worker's `prerenderedBody`, `check-template-pages.mjs`'s sitemap filter and `e2e/prerender.spec.js`). `VIEW_HEAD.shareView = { title: 'Shared CV - PortifyCV', titleFi: 'Jaettu CV - PortifyCV', description: 'A CV shared with PortifyCV.', descriptionFi: 'PortifyCV:llä jaettu CV.', path: '/view', robots: 'noindex, nofollow' }`. `SharedCvPage` props: `{ locale }` (the app's locale; it resolves the CV's own).
- `App.jsx`'s `readRoute()`: if the path is `/cv`, the fragment has `data`, `readCvStateFromLocation` says `isEdit === false`, and `performance.getEntriesByType('navigation')[0]?.type` is `'navigate'` (or the entry is missing), then `history.replaceState(null, '', '/view' + location.hash)` and return `{ view: 'shareView', locale: null }`. The shareView branch renders `SharedCvPage` without the static shell's header nav, footer and consent banner, inside `LocaleContext`.

- [ ] **Step 1: Write the failing e2e tests** in `e2e/share-view.spec.js` (link built in the test with `page.evaluate` importing nothing: copy it from the builder via `copyShareLink`):

```js
test('a share link opens /view, noindex, with no builder', async ({ page, context }) => {
  const url = await copyLinkFromBuilder(page, context)          // helper: /cv, demo CV, copyShareLink, read clipboard
  const viewer = await context.newPage()
  await viewer.goto(url)
  await expect(viewer).toHaveURL(/\/view#data=/)
  await expect(viewer.getByRole('tab', { name: 'Direct Edit' })).toHaveCount(0)
  await expect(viewer.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
})
test('an old /cv#data= link opened fresh lands on /view', async (…) => {
  await viewer.goto(url.replace('/view#', '/cv#'))
  await expect(viewer).toHaveURL(/\/view#data=/)
})
test('reloading an old /cv#data= tab stays in the builder', async (…) => {
  // open via the edit url so the builder loads, then strip edit=1 with replaceState and reload
  await viewer.goto(shareEditUrl(url))
  await viewer.evaluate(() => history.replaceState(null, '', location.href.replace('&edit=1', '')))
  await viewer.reload()
  await expect(viewer).toHaveURL(/\/cv#data=/)
  await expect(viewer.getByRole('tab', { name: 'Direct Edit' })).toBeVisible()
})
test('reloading /view keeps the page', …)                     // Review Focus 3
test('a corrupt link shows the message', async ({ page }) => {
  await page.goto('/view#data=not-a-cv')
  await expect(page.getByRole('heading', { name: "This CV link can't be opened" })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Go to PortifyCV' })).toHaveAttribute('href', '/')
})
test('/view with no data shows the message', …)
```

`shareEditUrl` for e2e lives in `e2e/helpers/shareLinks.js` (string replace of `/view#data=X` → `/cv#data=X&edit=1`), so specs don't import app code.

- [ ] **Step 2: Run** `npx playwright test e2e/share-view.spec.js` — expected: FAIL (no `/view` route, link still `/cv`).

- [ ] **Step 3: Implement** the Interfaces above. The stub page reads `readCvStateFromLocation()` in an effect (never during render, it is lazy and not pre-rendered, but keep `window` out of render anyway).

- [ ] **Step 4: Run** `npx playwright test e2e/share-view.spec.js e2e/prerender.spec.js e2e/site-map.spec.js e2e/seo-headings.spec.js e2e/builder-ad-boundary.spec.js && npm run check:template-pages && npm run lint` — expected: all pass. Add to `check-template-pages.mjs`: `shareView` is in `AD_FREE_VIEWS`, its `robots` starts with `noindex`, and `/view` is not in the sitemap.

- [ ] **Step 5: Commit** — `git commit -m "Open share links on a /view page"` (stage the files listed above).

### Task 3: The view page

**Files:**
- Modify: `src/pages/SharedCvPage.jsx` (replace the stub), `src/components/ScaledPreview.jsx` (optional `classicNameAlignment` prop passed to `CVPreview`), `src/styles/app-shell.css` (a `.shared-cv` block)
- Test: `e2e/share-view.spec.js`

**Interfaces:**
- Consumes: `readCvStateFromLocation`, `shareEditUrl` (Task 1), `resolveSharedCvLook` (Task 1), `hideEmptySections`, `resolveCvLocale`, `createExportFileName`, `loadCvFont`/`getCvFontStack`, `renderCvPdf`/`saveRenderedCvPdf` (dynamic `import('../utils/exporters')`).
- Layout: a top bar with the full name (`<h1>`), "Download PDF" button and "Edit a copy" link (`target="_blank" rel="noopener"`, `href = shareEditUrl(location.href)`); below it `ScaledPreview` of `hideEmptySections(formData)` with the resolved look; an off-screen inert export copy exactly like the builder's (`.direct-edit-export-source`, `aria-hidden`, `inert`, `--font-sans`), whose `previewRef` the download uses; the footer line. Copy follows `resolveCvLocale(formData, locale)`. `document.title` set in an effect.
- Download: disabled while busy; `await loadCvFont(cvFontId); await document.fonts.ready;` two animation frames; then `renderCvPdf(ref, createExportFileName(formData) || 'cv', { mode: ats ? 'ats' : 'designer', formData, template, variant: template, atsFriendlyMode: ats, locale: cvLocale, paper, fit })` and `saveRenderedCvPdf(rendered)` (which already writes the text fallback). On error show the download error copy in a `role="alert"` line.

- [ ] **Step 1: Write the failing e2e tests** (add to `e2e/share-view.spec.js`):

```js
test('the view shows the CV in the sender\'s template and look', async ({ page, context }) => {
  // in the builder: pick Developer, its second look, then font Arial and accent swatch #2
  const url = await copyLinkFromBuilder(page, context, { template: 'developer', variantIndex: 1, font: 'Arial' })
  const viewer = await context.newPage(); await viewer.goto(url)
  await expect(viewer.getByRole('heading', { level: 1 })).toHaveText(DEMO_NAME)
  await expect(viewer.locator('.shared-cv [data-export-variant="developer"]').first()).toBeVisible()
  await expect.poll(() => viewer.locator('.shared-cv__preview .pdf-export-root, .shared-cv__preview [data-export-variant]').first()
    .evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Arial')
  await expect(viewer.getByRole('textbox')).toHaveCount(0)
  await expect(viewer).toHaveTitle(`${DEMO_NAME} — CV`)
})
test('Download PDF saves a PDF in the sender\'s paper size', async (…) => {
  // sender: open the PDF preview, choose US Letter, close; copy link
  const download = await Promise.all([viewer.waitForEvent('download'), viewer.getByRole('button', { name: 'Download PDF' }).click()]).then(([d]) => d)
  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  // first page MediaBox is 612×792 (read the bytes with pdf-lib-free regex /MediaBox\s*\[0 0 612(\.0+)? 792/)
})
test('Download PDF can\'t start twice', async (…) => {            // Review Focus 5
  await button.click(); await expect(button).toBeDisabled(); await expect(button).toHaveText('Preparing PDF…')
})
test('Edit a copy opens the builder in a new tab with the CV and look', async (…) => {
  const [tab] = await Promise.all([context.waitForEvent('page'), viewer.getByRole('link', { name: 'Edit a copy' }).click()])
  await expect(tab).toHaveURL(/\/cv#data=.*edit=1/)
  await expect(tab.locator('.app-toolbar__template-trigger-label')).toHaveText(developerLabel)
  await expect(await fontTrigger(tab)).toHaveAccessibleName('Select font: Arial')
})
test('a Finnish CV opens in Finnish without changing the visitor\'s language', async (…) => {   // Review Focus 4
  // sender sets Settings › CV language: Suomi; viewer's localStorage locale stays 'en'
  await expect(viewer.getByRole('button', { name: 'Lataa PDF' })).toBeVisible()
  expect(await viewer.evaluate(() => localStorage.getItem(UI_LOCALE_STORAGE_KEY_VALUE))).not.toBe('fi')
})
test('opening a link writes nothing to this browser', async (…) => {
  // viewer page: sessionStorage snapshot key absent; localStorage keys unchanged before/after
})
test('@slow the downloaded PDF\'s text has the name and a job title', …)   // reuse e2e/helpers/pdfText (as applications.spec does)
```

Use the storage key constants' literal values in the spec (read them from `src/utils/cvForm.js` / `designSystem.js`). `DEMO_NAME` is the demo CV's `fullName`.

- [ ] **Step 2: Run** `npx playwright test e2e/share-view.spec.js` — expected: the new tests FAIL against the stub.

- [ ] **Step 3: Implement** the page per Interfaces. Phone width: the scaled preview fills the width with a 16px gutter; the bar wraps.

- [ ] **Step 4: Run** `npx playwright test e2e/share-view.spec.js e2e/templates.spec.js && npm run check:thumbnails && npm run lint` — expected: pass (`check:thumbnails` only fails if a thumbnail input changed; `ScaledPreview` is not one — if it is, run `npm run thumbnails` and commit the images).

- [ ] **Step 5: Commit** — `git commit -m "Show a shared CV with a PDF download"`

### Task 4: The sender's side and the builder's Edit-a-copy open

**Files:**
- Modify: `src/pages/ResumeBuilderPage.jsx` (`handleCopyShareLink` passes `look` and `pdf`; new toast copy; `loadInitialCvSession` returns `sharedLook: shared.look`), `src/reducers/uiReducer.js` (`createInitialUiState` applies `initialSession.sharedLook` after `applyStoredLooks`), `src/pages/PrivacyPolicyPage.jsx`, `src/pages/HowToUseTheBuilderPage.jsx`, any other share-link copy found by `grep -rn -i "share link\|jakolink" src` that says or implies the link opens an editable copy, `e2e/style-variants.spec.js`, `e2e/builder-toolbar.spec.js`, `e2e/export.spec.js` as needed, `scripts/check-reducers.mjs`
- Test: those specs and `check:reducers`

**Interfaces:**
- Consumes: Task 1's `buildShareUrl(formData, { templateId, look, pdf })`; sender values: `look = { accent: resolveTemplateAccent(templateAccentColors, selectedTemplate), fontId: cvFontId, headingColor: cvHeadingColor, nameAlignment: classicNameAlignment, atsFriendlyMode }`, `pdf = { paper: pdfPaper, fit: pdfFit }`.
- `createInitialUiState`: `sharedLook.accent` → `templateAccentColors[selectedTemplate]`; `fontId` → `cvFontId`; `headingColor` → `cvHeadingColor`; `nameAlignment` → `classicNameAlignment`; `atsFriendlyMode` → `atsFriendlyMode`. Absent fields leave the stored look.

- [ ] **Step 1: Write the failing checks.** In `check-reducers.mjs`: `createInitialUiState({ formData: demo, sharedTemplateId: 'developer', sharedLook: { fontId: 'arial', atsFriendlyMode: true } })` has `cvFontId === 'arial'`, `atsFriendlyMode === true`, and the developer variant's headings colour. In `e2e/style-variants.spec.js`, every `fresh.goto(url)` becomes `fresh.goto(shareEditUrl(url))` (helper from Task 2), the `?template=creative` test replaces `'/cv#'` in the edit URL, and add:

```js
test('Edit a copy keeps a hand-picked font and accent', async ({ page, context }) => {
  // sender: font Arial + an accent swatch, copy link; open shareEditUrl(url)
  await expect(await fontTrigger(fresh)).toHaveAccessibleName('Select font: Arial')
})
```

In `builder-toolbar.spec.js`, the clipboard assertion becomes `toMatch(/\/view#data=/)` and the toast text is the new copy.

- [ ] **Step 2: Run** `npm run check:reducers && npx playwright test e2e/style-variants.spec.js e2e/builder-toolbar.spec.js` — expected: new checks FAIL.

- [ ] **Step 3: Implement** per Interfaces; update the privacy policy's share-link paragraph (both languages: the recipient sees a view-only page with a PDF download, and the link also carries the chosen font, colours, ATS mode and PDF paper/fit) and the guide's Export-menu paragraph (both languages: the link opens a view-only page where the recipient can download a PDF or open an editable copy). Check each sentence against the code.

- [ ] **Step 4: Run** `npm run check:reducers && npm run check:share && npx playwright test e2e/style-variants.spec.js e2e/builder-toolbar.spec.js e2e/export.spec.js e2e/session-restore.spec.js e2e/share-view.spec.js && npm run lint` — expected: pass.

- [ ] **Step 5: Commit** — `git commit -m "Send the look with share links and open Edit a copy in it"`

### Task 5: Docs, version, full suites

**Files:**
- Modify: `CLAUDE.md` (a "The share page (1.7.12)" paragraph: `/view`, the new keys and their defaults, `APP_VIEWS`, the fresh-navigation redirect and why reloads stay, Edit a copy in a new tab, nothing written; update the Share links paragraph's "the link opens on it" sentence), `package.json`

- [ ] **Step 1:** Write the CLAUDE.md paragraph; commit "Document the share page".
- [ ] **Step 2:** `npm version 1.7.12 --no-git-tag-version`; commit `package.json package-lock.json` as "Bump version to 1.7.12".
- [ ] **Step 3: Run** all fourteen `check:*` scripts, `npm run lint`, `npm run build`, `npm run test:e2e:fast`, `npm run test:e2e:slow` — expected: all green. Report counts; fix anything red in the task that owns it.
- [ ] **Step 4:** Don't push. Ask the user ("Push branch").
