# Translation Files Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every interface-text language pair and every per-language page-copy object in `src/` into per-language files under `src/i18n/`, read through our own small module, with no visible change.

**Architecture:** `src/i18n/index.js` creates namespaces (`createNamespace(name, { en, fi })`), each a folder with `en.js`/`fi.js`, imported statically by the code that uses it so text stays in its chunk. Components translate with `useT(ns)` / `<T>`; plain code with `ns.t(locale, key, vars)`; structured pages with `ns.copy(locale)`. `scripts/check-i18n.mjs` enforces parity, shapes, usage and that no inline language branch for text is left; `scripts/compare-prerender.mjs` proves the pre-rendered pages read the same as before.

**Deviation from the spec's wording (planner's call):** the spec's `translate(locale, key)` is `ns.t(locale, key)` on a namespace object, so a key lookup can never reach a namespace that isn't in the caller's chunk; and there is no `useCvT`, because `CvLanguageContext` is only provided in the builder: CV components keep using the locale they are passed (`ns.t(locale, …)`).

**Tech Stack:** React 19, Vite, Node `check:*` scripts, Playwright, `Intl.PluralRules`.

**Spec:** `docs/superpowers/specs/2026-11-25-translation-files-design.md`

## Global Constraints

- Branch `v1.7.0`, release 1.7.13. Version bump is its own commit: `npm version 1.7.13 --no-git-tag-version`, message "Bump version to 1.7.13".
- Commits carry only the user's name: no `Co-Authored-By`, no Claude attribution. Never push without the user's "Push branch".
- No new dependency. No JSON build step, no runtime fetching of language files.
- Every moved string is byte-identical to the pair it replaces, in both languages. Typos found are listed in the task report, not fixed.
- A sentence stays whole: Finnish is never assembled from fragments. Joining existing fragments into one string with `{placeholders}` is allowed (and preferred) when the rendered text is identical.
- Each language's text keeps the locale it receives today: a component that drew text with the app's locale still does, one that drew with the CV's locale (`cvLocale`, or `locale` passed into `CVPreview`/Showcases/exports) still does. Mismatches found are listed in the report, not fixed.
- No page text in the entry chunk: a namespace is imported only by the modules that use it. Entry chunk gzip growth ≤ 2 KB over the baseline.
- Out of scope (stay where they are, allowlisted): `pageMeta.js`/`routes.js`/sitemap per-language fields; example CVs (`src/utils/examples/`, `exampleCvs.js` data); `templatePageCopy.js`; `templateMetaDescriptionsFi.js`; `landingFaq.js`; `cvTextImport.js`/`linkedInImport.js` tables; `jobTerms.js`/`jobMatch.js`; `bulletIdeas.js`; the registry label maps `{ en, fi }` in `templateVariants.js`, `templateAccents.js`, `templateFields.js`, `cvHeadingColors.js`, `cvTemplates.js` (shared with checks and e2e that read `.label.en`); `worker/`; `index.html`.
- Every commit leaves `npm run check:i18n`, `npm run lint`, the checks it touches and its e2e specs green.

## Review Focus

1. A merged fragment or moved string renders differently (lost space, `{count}` left unfilled, wrong case ending) — `compare-prerender` after every task, and the task's e2e specs.
2. CV in a different language from the app (Finnish CV, English app and the reverse) — each CV/export task runs `e2e/cv-language.spec.js` and `e2e/export-fields.spec.js`.
3. Counts 0, 1 and 2 in plural strings — every migrated plural key gets a `check:i18n` case asserting the exact former output for 0/1/2 in en and fi.
4. Text produced in Node (the pre-render) or before React mounts — `translate`/`ns.copy` never touch `window`; covered by `npm run build` + `compare-prerender`.
5. Page-copy functions (`minRead: (minutes) => …`) and arrays — shape check in `check:i18n` and the page's e2e spec.

---

### Task 1: The module, the checks and the baseline

**Files:**
- Create: `src/i18n/index.js`, `src/i18n/react.jsx`, `src/i18n/dynamicKeys.js`, `scripts/check-i18n.mjs`, `scripts/compare-prerender.mjs`
- Modify: `package.json` (`"check:i18n": "node scripts/check-i18n.mjs"`), `.github/workflows/ci.yml` (a `check:i18n` step beside the others)

**Interfaces (produces):**
- `LOCALES = ['en', 'fi']`, `DEFAULT_LOCALE = 'en'`, `normalizeLocale(locale) -> 'en'|'fi'` (unknown → `'en'`).
- `createNamespace(name: string, { en, fi }, { kind = 'strings' | 'page' } = {}) -> Namespace` where `Namespace = { name, kind, messages, t(locale, key, vars?) -> string, copy(locale) -> object }`.
  - `t`: dotted key lookup in `messages[normalizeLocale(locale)]`, else in `en`, else returns the key. A value `{ one, other }` (optionally `zero`, `two`, `few`, `many`) is chosen with `new Intl.PluralRules(locale).select(vars.count)`. A function value is called with `vars`. `{name}` placeholders are filled from `vars`; a missing var leaves `{name}` as is.
  - `copy`: returns `messages[normalizeLocale(locale)]` (the whole object; `kind: 'page'` namespaces).
- `src/i18n/react.jsx`: `useT(ns) -> (key, vars?) => string` (locale from `LocaleContext`); `<T ns k vars? parts? locale? />` renders `ns.t(...)` and replaces numbered tags `<0>…</0>` with `parts[0](innerText)`; with no `locale` prop it reads `LocaleContext`.
- `src/i18n/dynamicKeys.js`: `export const DYNAMIC_KEYS = [ /* { namespace, prefix, ids: string[] } */ ]` (empty now; later tasks add entries with `ids` imported from the app module that owns them).
- `scripts/check-i18n.mjs`: imports every `src/i18n/*/index.js` and runs:
  1. `translate` unit cases (below).
  2. Parity: for each namespace, `en` and `fi` have the same key paths; arrays the same length; a function where the other has a function; the same set of `{placeholders}` and `<n>` tags in each pair of strings; plural objects have `one` and `other`.
  3. Usage (`kind: 'strings'` only): each key path appears as a string literal somewhere in `src/` outside `src/i18n/`, or matches a `DYNAMIC_KEYS` prefix (and every listed id has a key).
  4. Source scan of `src/**/*.{js,jsx}` (excluding `src/i18n/`) for inline language branches: `isFinnish ?`, `isFinnish` at line end followed by `?`, `=== 'fi' ?`, `=== 'fi'` at line end followed by `?`, `if (locale === 'fi')` returning an object, and `fi: '`/`fi: \``/`fi: [`/`fi: {` maps. Each hit must be in `ALLOWLIST` (`{ file, reason }`, file-level for the out-of-scope files in Global Constraints, plus line-pattern entries for logic such as date-format locale choice) or in `MIGRATION_PENDING` (a set of files; starts as every file the scan hits today minus the allowlist; each task removes its files; Task 8 empties and deletes it).
  5. Plural regression cases added by later tasks (`pluralCases` array: `{ ns, key, locale, count, expected }`).
- `scripts/compare-prerender.mjs <baselineDir> <dir>`: for every `.html` in either dir, normalises (remove `<!-- -->`, replace `>\s+<` with `><`, trim) and compares; prints each differing file with the first 200-character window around the first difference; exits 1 on any difference or missing file.

- [ ] **Step 1: Take the baseline before touching code.**

```bash
npm run build
rm -rf .superpowers/i18n-baseline && mkdir -p .superpowers/i18n-baseline
cp -r dist/prerendered .superpowers/i18n-baseline/prerendered
gzip -c $(ls dist/assets/index-*.js) | wc -c > .superpowers/i18n-baseline/entry-gz.txt
```
(`.superpowers/` is git-ignored. Every later task compares against this.)

- [ ] **Step 2: Write `scripts/check-i18n.mjs`'s `translate` cases first**, against a test namespace built inside the script:

```js
const ns = createNamespace('test', {
  en: { a: 'Save', g: 'Hi {name}', p: { one: '{count} page', other: '{count} pages' }, f: (v) => `${v.n} min`, r: 'Read the <0>guide</0>.' },
  fi: { a: 'Tallenna', g: 'Hei {name}', p: { one: '{count} sivu', other: '{count} sivua' }, f: (v) => `${v.n} min`, r: 'Lue <0>opas</0>.' },
})
same('plain', ns.t('fi', 'a'), 'Tallenna')
same('unknown locale falls back to en', ns.t('sv', 'a'), 'Save')
same('placeholder', ns.t('en', 'g', { name: 'Ada' }), 'Hi Ada')
same('missing var stays', ns.t('en', 'g'), 'Hi {name}')
same('plural 0/1/2 en', [0, 1, 2].map((count) => ns.t('en', 'p', { count })), ['0 pages', '1 page', '2 pages'])
same('plural 0/1/2 fi', [0, 1, 2].map((count) => ns.t('fi', 'p', { count })), ['0 sivua', '1 sivu', '2 sivua'])
same('function value', ns.t('en', 'f', { n: 5 }), '5 min')
same('missing key returns the key', ns.t('en', 'nope'), 'nope')
same('copy', ns.copy('fi').a, 'Tallenna')
// parity detector on a broken pair
check('parity flags a missing key', parityErrors(createNamespace('bad', { en: { a: 'x', b: 'y' }, fi: { a: 'x' } })).length === 1)
check('parity flags a placeholder mismatch', parityErrors(createNamespace('bad2', { en: { a: '{n} x' }, fi: { a: 'x' } })).length === 1)
```

- [ ] **Step 3: Run** `node scripts/check-i18n.mjs` — expected: FAIL (module missing).
- [ ] **Step 4: Implement** the Interfaces above; `<T>` is tested by Task 2's first use (e2e). Seed `MIGRATION_PENDING` from the scan's current hits minus `ALLOWLIST`.
- [ ] **Step 5: Run** `npm run check:i18n && npm run lint` — PASS. `npm run build && node scripts/compare-prerender.mjs .superpowers/i18n-baseline/prerendered dist/prerendered` — PASS (nothing migrated yet).
- [ ] **Step 6: Commit** "Add the translation module and its check".

## Migration steps (shared by Tasks 2–7)

Each migration task follows these steps; only its files, namespaces and verification set differ.

- [ ] **Step 1:** For each file in the task, move its inline pairs (and `{ en, fi }` UI maps) into the task's namespaces (`src/i18n/<ns>/en.js`, `fi.js`, `index.js` exporting `createNamespace('<ns>', { en, fi })`), keys dotted by place (`toolbar.save`). Replace each branch with `t('…')` / `ns.t(locale, '…')` / `<T>` using **the same locale variable the branch tested**. Add `DYNAMIC_KEYS` entries for keys built from ids. Add a `pluralCases` entry (0/1/2 × en/fi, expected = the exact former output) for every plural key.
- [ ] **Step 2:** Remove the task's files from `MIGRATION_PENDING`.
- [ ] **Step 3: Run** `npm run check:i18n && npm run lint`, the task's checks, `npm run build && node scripts/compare-prerender.mjs .superpowers/i18n-baseline/prerendered dist/prerendered`, and the task's e2e specs. Expected: all pass with no change to any test's expected text.
- [ ] **Step 4: Commit** "Move <area> text into translation files". List any typos and locale mismatches found in the task report.

### Task 2: The CV and its templates
- Steps: the shared migration steps above.
- Files: `src/components/CVPreview.jsx`, `src/components/templates/*Showcase.jsx` (17), `templates/shared.jsx`, `templates/techExec.js`, `src/utils/atsDetails.js`, the label parts of `src/utils/cvForm.js`.
- Namespace: `cv` (section names and labels drawn on the CV; one key set shared by all templates where today's strings are identical, per-template keys where they differ).
- Checks: `check:reducers`, `check:template-pages`, `check:thumbnails` (regenerate with `npm run thumbnails` and commit if the inputs hash moved but the images are unchanged in content).
- E2E: `templates.spec.js`, `template-content.spec.js`, `template-pages.spec.js`, `cv-language.spec.js`, `direct-edit.spec.js`.

### Task 3: Exports and the cover letter
- Steps: the shared migration steps above.
- Files: `src/utils/exporters.js` (`createExportCopy` and the rest), `src/utils/coverLetter.js`, `src/components/CoverLetterPage.jsx` if it holds pairs, `src/utils/thumbnailImages.js`.
- Namespaces: `exports`, `letter`.
- Checks: `check:docx-export`, `check:job-match`.
- E2E: `export.spec.js`, `cover-letter.spec.js`, `cv-language.spec.js`; plus `npx playwright test e2e/export-fields.spec.js` (@slow, run it).

### Task 4: The builder's frame
- Steps: the shared migration steps above.
- Files: `src/pages/ResumeBuilderPage.jsx`, `src/components/Toolbar.jsx`, `NavRail.jsx`, `SectionsMenu.jsx`, `SectionEditOverlay.jsx`, `DirectEditPreview.jsx`, `CvFontSwitcher.jsx`, `CvHeadingColorSwitcher.jsx`, `CvStyleSwitcher.jsx`, `StyleSwatchGroup.jsx`, `EntryBadge.jsx`, `LeaveConfirmDialog.jsx`, `src/hooks/useApplications.js`, `useCvLibrary.js`, `useCvSafekeeping.js`, `src/reducers/uiReducer.js`.
- Namespace: `builder`.
- E2E: `builder-toolbar.spec.js`, `editor.spec.js`, `direct-edit.spec.js`, `usability.spec.js`, `session-restore.spec.js`, `saved-cvs.spec.js`.

### Task 5: The form and editing popups
- Steps: the shared migration steps above.
- Files: `src/components/CVForm.jsx`, `SectionEditorPopup.jsx`, `EditableList.jsx`, `src/components/fields/*` (`BulletIdeas`, `ReorderableListInput`, `TagsInput`, `BulletHints` if it holds pairs).
- Namespace: `form`.
- Checks: `check:section-schema`, `check:bullet-ideas`.
- E2E: `editor.spec.js`, `direct-edit.spec.js`, `bullet-hints.spec.js`, `bullet-ideas.spec.js`.

### Task 6: Dialogs, panels and their messages
- Steps: the shared migration steps above.
- Files: `SettingsModal.jsx`, `SavedCvsModal.jsx`, `MarkAppliedModal.jsx`, `ApplicationViewModal.jsx`, `CoverLetterModal.jsx`, `PdfPreviewModal.jsx`, `PdfParserView.jsx`, `pdfPreviewOptions.js`, `ImportCvModal.jsx`, `AtsCheckModal.jsx`, `ATSScorePanel.jsx`, `CVSuggestionsPanel.jsx`, `BadgeModal.jsx`, `TemplateGalleryModal.jsx`, `TemplateFieldFilter.jsx`, `src/utils/cvFeedback.js`, `atsScore.js`, `badge.js`, `cvLibrary.js`, `applicationLog.js`, `bulletIdeas.js`'s UI strings only, `cvTextImport.js`'s messages only (not its heading tables).
- Namespaces: `dialogs`, `feedback`.
- Checks: `check:feedback`, `check:cv-library`, `check:applications`, `check:cv-import`, `check:bullet-ideas`.
- E2E: `applications.spec.js`, `cover-letter.spec.js`, `pdf-preview.spec.js`, `pdf-parser-view.spec.js`, `cv-file-import.spec.js`, `job-match.spec.js`, `badge.spec.js`, `template-filters.spec.js`, `bullet-hints.spec.js`.

### Task 7: The site shell, the share page and the content pages
- Steps: the shared migration steps above.
- Files: `src/App.jsx` (header nav map, footer, consent), `AppErrorBoundary.jsx`, `src/pages/SharedCvPage.jsx`, `LandingTemplatesByField.jsx`, `ExampleCvLinks.jsx`, `LocaleFlagIcon.jsx`, `GuideLayout.jsx`, and the page-copy objects of `LandingPage`, `AboutPage`, `PrivacyPolicyPage`, `FreeCvTemplatesPage`, `TemplateDetailPage` (its own UI copy, not `templatePageCopy.js`), `AtsFriendlyCvGuidePage`, `HowToWriteACvPage`, `HowToUseTheBuilderPage`, `CoverLetterExamplesPage`, `CvSkillsExamplesPage`, `CvExamplesHubPage`, `DeveloperCvExamplesPage`, `ItCvExamplesPage`, `CybersecurityCvExamplesPage`, `FinnishCvExamplesPage`.
- Namespaces: `common` (shell: imported by `App.jsx`, so keep it to what the shell shows), `share`, and one `kind: 'page'` namespace per page (`pages/<page>`), each imported only by its page; the page reads `ns.copy(locale)` where it called `getCopy(locale)` / `COPY[locale]` before. Shapes unchanged; functions stay functions.
- Checks: `check:template-pages`.
- E2E: `landing.spec.js`, `header-nav.spec.js`, `site-map.spec.js`, `finnish-urls.spec.js`, `guide-layout.spec.js`, `template-pages.spec.js`, `seo-headings.spec.js`, `prerender.spec.js`, `share-view.spec.js`, `builder-ad-boundary.spec.js`.
- Also: compare the entry chunk now: `gzip -c $(ls dist/assets/index-*.js) | wc -c` ≤ baseline + 2048.

### Task 8: Finish

**Files:** `scripts/check-i18n.mjs` (drop `MIGRATION_PENDING`), `CLAUDE.md`, `package.json`, `package-lock.json`

- [ ] **Step 1:** Remove `MIGRATION_PENDING`; `npm run check:i18n` must pass with only `ALLOWLIST` entries left. If a file still hits the scan, migrate it here.
- [ ] **Step 2:** Rewrite CLAUDE.md's "Bilingual throughout" paragraph: the module, namespaces per chunk, `useT`/`<T>`/`ns.t`/`ns.copy`, which locale CV text uses, `DYNAMIC_KEYS`, the allowlist and what is deliberately outside (Global Constraints list), how to add a string, how to add a language (a file per namespace + `LOCALES` + the out-of-scope places). Add `check:i18n` to the Commands block and the checks paragraph ("all fifteen"). Commit "Document the translation files".
- [ ] **Step 3:** `npm version 1.7.13 --no-git-tag-version`; commit `package.json package-lock.json` "Bump version to 1.7.13".
- [ ] **Step 4: Run** all fifteen `check:*`, `npm run lint`, `npm run build`, `node scripts/compare-prerender.mjs .superpowers/i18n-baseline/prerendered dist/prerendered`, the entry-size comparison, `npm run test:e2e:fast`, `npm run test:e2e:slow`. Expected: all green. Report the counts and the collected typo / locale-mismatch list.
- [ ] **Step 5:** Don't push; ask the user.
