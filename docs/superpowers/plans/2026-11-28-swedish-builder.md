# Swedish in the builder and on the CV (1.7.14) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `sv` a third app language for the builder and a third CV language, with every builder text, CV text and export in Swedish, while content pages stay English/Finnish.

**Architecture:** `src/i18n` gains `sv` in `LOCALES` and a per-namespace `locales` option (content-page namespaces declare `['en', 'fi']`). Every place that collapses a locale to `'fi' | 'en'` is re-read: text/Intl/`lang` uses go through `normalizeLocale`; per-language data tables without Swedish fall back to English explicitly. A toolbar language menu and Settings › CV language expose Swedish.

**Tech Stack:** Vite + React 19, plain-JS i18n module (`src/i18n/`), framework-free `scripts/check-*.mjs`, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-11-28-swedish-builder-design.md`

## Global Constraints

- Branch `v1.7.0`. Commits carry only the user's name: **no Co-Authored-By or any Claude attribution line**.
- Version bump to 1.7.14 is its own commit: `npm version 1.7.14 --no-git-tag-version`, message `Bump version to 1.7.14`.
- No push (the user pushes on request).
- `LOCALES = ['en', 'fi', 'sv']`, `DEFAULT_LOCALE = 'en'`. `CV_LANGUAGES = ['en', 'fi', 'sv']`.
- Swedish vocabulary: standard written Swedish usable in Finland and Sweden ("CV", "personligt brev", "arbetserfarenhet", "utbildning", "kompetenser", "språk", "nuvarande"/"pågående" for Present). Never "meritförteckning". Keep sentences whole with `{placeholders}`; never build Swedish from fragments.
- Each language's own name in its own language: `English`, `Suomi`, `Svenska`.
- Content pages, routes, `pageMeta.js`, sitemap, worker, pre-render, thumbnails, `index.html`: no Swedish, no change in behaviour.
- Nothing an English or Finnish user sees changes, except the toolbar's language control becoming a menu and Settings › CV language gaining Svenska.
- Per-language data without Swedish (example CVs, bullet ideas, `templatePageCopy.js`, `landingFaq.js`, import tables, `jobTerms.js`/`jobMatch.js`, paste parser) uses English for `sv`.
- Share key `cl` accepts `'sv'`; no new share keys.
- After touching i18n run `npm run check:i18n`; after the CV schema/reducers `check:reducers`; share codec `check:share`; feedback `check:feedback`; registries `check:template-variants` + `check:template-pages`; Word export `check:docx-export`.

## Review Focus

1. A visitor with `sv` stored opens a content page (`/`, `/free-cv-templates`): they get English, `<html lang="en">`; the header switch takes them to the `/fi/…` twin and from there back to English, never to a non-existent Swedish page. (Task 2 e2e.)
2. A Swedish CV comes back in: JSON import, session restore and a saved CV with `cvLanguage: 'sv'` keep `'sv'` (the import validator at `cvForm.js` ~1344 reads `CV_LANGUAGES`). (Task 2 check:reducers case.)
3. English app, Settings › CV language › Svenska: interface stays English, CV page and HTML/Word/PDF exports are Swedish, the HTML file has `lang="sv"`. (Task 7 e2e.)
4. Bullet ideas and the cover-letter draft with a pasted ad on a Swedish CV: no crash, ideas are the English ones, the letter's sentences are Swedish. (Task 2 check:bullet-ideas case, Task 4 check:job-match/letter case.)
5. A share link from a Swedish CV (`cl: 'sv'`) opens `/view` in Swedish, and Edit a copy keeps the CV language Swedish. (Task 2 check:share case, Task 7 e2e.)

---

### Task 1: `sv` in the i18n module and its check

**Files:**
- Modify: `src/i18n/index.js`
- Modify: every `src/i18n/pages/*/index.js` (add `locales: ['en', 'fi']`)
- Modify: `scripts/check-i18n.mjs`

**Interfaces:**
- Produces: `LOCALES = ['en', 'fi', 'sv']`; `createNamespace(name, messages, { kind = 'strings', locales = LOCALES } = {})` returning `{ name, kind, locales, messages, t, copy }`; `t`/`copy` for a locale not in `namespace.locales` use English; `parityErrors(namespace)` iterates `namespace.locales`.
- Produces (temporary): `SWEDISH_PENDING` in `scripts/check-i18n.mjs`, a list of namespace names still lacking `sv.js`; parity skips `sv` for them and the check prints them. Tasks 4–6 remove names from it; Task 7 deletes the list and requires it gone.

- [ ] **Step 1: Write the failing checks** in `scripts/check-i18n.mjs`:
  - `same('locales', [LOCALES, DEFAULT_LOCALE], [['en', 'fi', 'sv'], 'en'])` (replaces the existing one).
  - A namespace `createNamespace('two', { en: { a: 'x' }, fi: { a: 'y' } }, { locales: ['en', 'fi'] })`: `parityErrors` is empty; `t('sv', 'a') === 'x'`; `copy('sv')` is the English object.
  - `parityErrors(createNamespace('bad8', { en: { a: 'x' }, fi: { a: 'y' } }))` has 1 error (`no sv messages`).
  - `normalizeLocale('sv') === 'sv'`, `normalizeLocale('de') === 'en'`.
  - `CONTENT_ONLY_NAMESPACES` (constant in the script): every namespace whose `locales` is shorter than `LOCALES` must be in it, and every entry must be such a namespace (stale fails). Its contents: every `pages/<page>` namespace name, reason "content pages have no Swedish address yet (1.7.14)".
  - Scan: `same('scan: sv branches', ["locale === 'sv' ? 'Ja' : 'Yes'", "isSwedish ? 'Ja' : 'Yes'", "{ en: 'Yes', sv: 'Ja' }"].map((s) => scanSource(s).length), [1, 1, 1])`.
  - `pluralCases`: for every existing `fi` case add an `sv` case with the same key and count; expected Swedish text is filled in by the task that writes that namespace's `sv.js` (Tasks 4–6). In Task 1 only the mechanism matters: a case whose namespace is in `SWEDISH_PENDING` is skipped.
- [ ] **Step 2: Run `npm run check:i18n`** — expect FAIL on `locales` and the new parity case.
- [ ] **Step 3: Implement** the `locales` option and per-namespace parity in `src/i18n/index.js`; add `locales: ['en', 'fi']` to each `pages/*` namespace; add `SWEDISH_PENDING` = every other namespace name (`common`, `builderShell`, `cvForm`, `formInline`, `fieldFilter`, `cv`, `exports`, `letter`, `builder`, `form`, `dialogs`, `feedback`, `share`); extend `SCAN_PATTERNS` with `isSwedish`, `=== 'sv'`/`!== 'sv'` and `sv:` map keys mirroring the existing Finnish ones.
- [ ] **Step 4: Run `npm run check:i18n`** — expect PASS (pending list printed).
- [ ] **Step 5: Commit** `Add Swedish to the translation module`.

### Task 2: Let `sv` through the locale plumbing

**Files (each normalisation listed in the spec's ~30; classify every hit of `grep -rnE "\? ?'fi' ?: ?'en'|fi-FI'|fi_FI|isFinnish \?" src --include=*.js --include=*.jsx | grep -v src/i18n`):**
- Modify (text/Intl/lang → `normalizeLocale`): `src/App.jsx` (256 `readStoredLocale`, 512 `SiteMap` lang, 189 og:locale → `{ en: 'en_US', fi: 'fi_FI', sv: 'sv_SE' }` lookup), `src/reducers/uiReducer.js:121`, `src/pages/ResumeBuilderPage.jsx:1692`, `src/utils/cvForm.js` (`CV_LANGUAGES`, `resolveCvLocale`, 1600 paste parser text), `src/components/CVForm.jsx:788-789`, `src/components/SectionEditorPopup.jsx:58,112`, `src/utils/coverLetter.js:100,162`, `src/utils/exporters.js:236,503,2929,2958`, `src/utils/cvFeedback.js:141`, `src/utils/atsScore.js:224`, `src/components/SavedCvsModal.jsx:284` and `src/utils/applicationLog.js:238` (Intl locale map `{ en: 'en-GB', fi: 'fi-FI', sv: 'sv-FI' }`), `src/components/CvStyleSwitcher.jsx:22`, `src/components/StyleSwatchGroup.jsx:15`, `src/components/TemplateFieldFilter.jsx:12`, Word export document language in `src/utils/docxExport.js` if it sets one.
- Modify (table pick → explicit English fallback, keep `en`/`fi` behaviour): `src/utils/exampleCvs.js:99,124,136`, `src/utils/bulletIdeas.js:86`, `src/pages/ResumeBuilderPage.jsx:787`, `src/utils/cvTextImport.js`/`linkedInImport.js`/`jobMatch.js` if they normalise.
- Leave (content pages, by address): `LandingPage.jsx`, `FreeCvTemplatesPage.jsx`, `TemplateDetailPage.jsx`, `ExampleCvLinks.jsx`, `LandingTemplatesByField.jsx`, `GuideLayout.jsx`, `routes.js`, `pageMeta.js`, `thumbnailImages.js` (images exist for en/fi only: map `sv` to `en`).
- Modify: `App.jsx:629` header toggle: `next = current === 'fi' ? 'en' : 'fi'` stays (so `sv` → `fi`), and content views keep their address-decided locale.
- Modify: `src/utils/shareLinks.js:280` accept `CV_LANGUAGES`.
- Modify: `src/components/LocaleFlagIcon.jsx` — Swedish flag (blue `#006AA7`, yellow cross `#FECC02`) for `'sv'`.
- Modify: `scripts/check-i18n.mjs` ALLOWLIST — drop entries that no longer match; add `{ pattern, reason }` entries for the explicit-fallback table picks and the Intl/og maps.
- Test: `scripts/check-reducers.mjs`, `scripts/check-share.mjs`, `scripts/check-bullet-ideas.mjs`, `scripts/check-cv-library.mjs` (if it round-trips cvLanguage), `e2e/finnish-urls.spec.js` (or `e2e/cv-language.spec.js`).

**Interfaces:**
- Produces: `resolveCvLocale(formData, uiLocale) -> 'en' | 'fi' | 'sv'`; `CV_LANGUAGES = ['en', 'fi', 'sv']`; `uiState.locale` may be `'sv'`; `LocaleFlagIcon` accepts `'sv'`.

- [ ] **Step 1: Failing checks:**
  - check:reducers: `SET_LOCALE` with `'sv'` stores `'sv'`; with `'de'` stores `'en'`; `createInitialUiState` with stored `'sv'` gives `'sv'`; `resolveCvLocale({ cvLanguage: '' }, 'sv') === 'sv'`, `resolveCvLocale({ cvLanguage: 'sv' }, 'fi') === 'sv'`; importing CV JSON with `cvLanguage: 'sv'` keeps `'sv'`, with `'de'` gives `''`.
  - check:share: a CV with `cvLanguage: 'sv'` round-trips with `cl` `'sv'`.
  - check:bullet-ideas: `await loadBulletIdeas('sv')` deep-equals `await loadBulletIdeas('en')`.
  - e2e (`e2e/cv-language.spec.js`, new test "a stored Swedish locale leaves content pages English"): set `localStorage` UI locale key to `'sv'`, open `/` → `html[lang="en"]`, English heading; click header language switch → URL `/fi`, `html[lang="fi"]`; click again → `/`, `lang="en"`.
- [ ] **Step 2: Run** `npm run check:reducers && npm run check:share && npm run check:bullet-ideas` — expect FAIL.
- [ ] **Step 3: Implement** per the file list. Builder views now pass `'sv'` down; until Tasks 4–6 land, `t('sv', …)` shows English, which is the intended fallback.
- [ ] **Step 4: Run** the three checks, `npm run check:i18n`, `npm run check:cv-library`, `npm run check:feedback`, `npm run check:docx-export`, `npm run lint`, and the new e2e test — expect PASS.
- [ ] **Step 5: Commit** `Let Swedish through the locale plumbing`.

### Task 3: Choosing Swedish (toolbar menu, Settings)

**Files:**
- Modify: `src/components/Toolbar.jsx:416-425` — the locale button becomes a menu button (`aria-haspopup="menu"`, `aria-expanded`) using `useToolbarPopover('[role="menuitemradio"]')`; menu items `role="menuitemradio"`, `aria-checked`, `lang`, labels `English` / `Suomi` / `Svenska` (literal names, not translated), each with its `LocaleFlagIcon`; choosing calls `onLocaleChange(code)` and closes the menu. The button keeps the current flag and `builderShell.t(locale, 'language.code')`; its `aria-label` is `builderShell.t(locale, 'language.menu')` (new key, en "Language", fi "Kieli"); remove the now-unused `language.switch` key if nothing else uses it.
- Modify: `src/components/SettingsModal.jsx:81-85` — add `['sv', 'Svenska']`.
- Modify: `src/i18n/builderShell/en.js`, `fi.js` (`language.code` stays 'EN'/'FI'; Swedish file comes in Task 5).
- Modify: e2e specs that click the old toggle (`grep -rln "Switch language\|Vaihda kieli\|locale-flag" e2e`): open the menu, pick the language.
- Test: `e2e/builder-toolbar.spec.js` (new test), `e2e/cv-language.spec.js` (new test).

- [ ] **Step 1: Failing e2e tests:**
  - "the language menu switches the builder to Swedish": open `/cv`, click the language button, menu has three `menuitemradio` with names `English`, `Suomi`, `Svenska` and English checked; press `Escape` closes and returns focus to the button; reopen, choose `Svenska` → `html[lang="sv"]`, button shows the Swedish flag; reload → still `lang="sv"`.
  - "Settings offers Swedish as the CV language": Settings › CV language has a `Svenska` button; pressing it sets `aria-pressed="true"`.
- [ ] **Step 2: Run** `npx playwright test e2e/builder-toolbar.spec.js e2e/cv-language.spec.js` — expect FAIL.
- [ ] **Step 3: Implement** per the file list.
- [ ] **Step 4: Run** the two specs plus every spec edited for the toggle, `npm run check:i18n`, `npm run lint` — expect PASS.
- [ ] **Step 5: Commit** `Add a language menu with Swedish to the builder`.

### Task 4: Swedish on the CV page, exports and cover letter

**Files:**
- Create: `src/i18n/{cv,exports,letter,cvForm,formInline}/sv.js`; modify each `index.js` to pass `sv`; remove those names from `SWEDISH_PENDING`; fill their `sv` `pluralCases`.
- Modify: `src/components/templates/shared.jsx` — `parseSkillCategories(skills, locale)` (locale, not boolean) with a Swedish pattern set: `languages: /språk|programmering|programming|language/i`, `frameworks: /ramverk|bibliotek|framework|library/i`, `databases: /databas|database|db|sql/i`, `cloud: /moln|cloud|aws|azure|gcp/i`, `devops: /devops|ci\/cd|docker|kubernetes|k8s|jenkins|pipeline/i`, `security: /säkerhet|security/i`; update every caller (CVPreview.jsx:1114, ModernShowcase.jsx:224-231, others found by grep) and the ALLOWLIST entry's pattern.
- Modify: every Showcase's `isFinnish` (grep `const isFinnish` in `src/components/templates/` and `CVPreview.jsx`) — each use either goes through `cv.t(locale, …)` or passes `locale`; none may treat `sv` as English text.
- Modify: registries the builder shows — add `sv` to every label map in `src/utils/templateVariants.js`, `templateAccents.js`, `templateFields.js`, `cvHeadingColors.js`, and `templateLocalization.sv` in `src/utils/cvTemplates.js` (label, description, chips for all 18 templates), with `localizeTemplate` picking `templateLocalization[locale]`; readers use `label[lang] ?? label.en`.
- Test: `scripts/check-template-variants.mjs`, `scripts/check-template-pages.mjs` (every builder-shown label map has a non-empty `sv`), `scripts/check-docx-export.mjs`, `scripts/check-job-match.mjs` (cover letter draft).

- [ ] **Step 1: Failing checks:**
  - check:template-variants: every variant/accent/heading-colour label has non-empty `label.sv`.
  - check:template-pages: every `templateFields` label and `getCvTemplates('sv')` entry has a Swedish label/description differing from English for at least the label of one template (sanity that localisation applied).
  - check:docx-export: a Swedish CV's Word export (`locale: 'sv'`) has the Swedish experience heading from `exports`/`cv` `sv.js` and no English section heading.
  - check:job-match (letter cases): `generateCoverLetterDraft(cv, { locale: 'sv', jobAd: <existing English ad case> })` returns a body whose greeting is the `letter/sv.js` greeting and which lists the same found requirements as the English case.
  - A new check in check:i18n's `pluralCases` for the `sv` entries of these namespaces (exact Swedish text for counts 0, 1, 2).
- [ ] **Step 2: Run** the checks — expect FAIL.
- [ ] **Step 3: Implement** the five `sv.js` files (mirroring `en.js` keys exactly), the skill patterns, the Showcase locale uses and the registry labels.
- [ ] **Step 4: Run** `npm run check:i18n && npm run check:template-variants && npm run check:template-pages && npm run check:docx-export && npm run check:job-match && npm run check:thumbnails && npm run lint` — expect PASS (`check:thumbnails` must still pass; if a thumbnail input hash changes because a Showcase file changed, run `npm run thumbnails` and commit the manifest/images in this task).
- [ ] **Step 5: Commit** `Draw the CV and its exports in Swedish`.

### Task 5: Swedish builder interface

**Files:**
- Create: `src/i18n/{builder,builderShell,form,dialogs,share,common,fieldFilter}/sv.js`; modify each `index.js`; remove from `SWEDISH_PENDING`; fill `sv` `pluralCases`.
- Test: `scripts/check-i18n.mjs`.

- [ ] **Step 1:** Add the `sv` `pluralCases` for these namespaces (exact Swedish for 0, 1, 2), so `check:i18n` fails once their names leave `SWEDISH_PENDING`.
- [ ] **Step 2: Run** `npm run check:i18n` after removing the names — expect FAIL (no sv messages).
- [ ] **Step 3: Implement** the seven `sv.js` files, keys mirroring `en.js` exactly; `builderShell` `language.code: 'SV'`, `language.menu: 'Språk'`.
- [ ] **Step 4: Run** `npm run check:i18n && npm run lint` and `npx playwright test e2e/builder-toolbar.spec.js e2e/saved-cvs.spec.js e2e/share-view.spec.js` — expect PASS.
- [ ] **Step 5: Commit** `Translate the builder into Swedish`.

### Task 6: Swedish bullet hints and feedback

**Files:**
- Create: `src/i18n/feedback/sv.js`; modify `index.js`; remove `feedback` from `SWEDISH_PENDING`; `sv` `pluralCases`.
- Modify: `src/utils/cvFeedback.js` — Swedish entries in `WEAK_PHRASES` (at least: "ansvarade för", "ansvarig för", "arbetade med", "deltog i", "var med och"), `WEAK_OPENERS` (`'jag', 'vi', 'var', 'arbetade', 'hjälpte', 'deltog', 'assisterade'`), `FILLER_WORDS` (`'framgångsrikt', 'diverse', 'olika', 'm.m.', 'osv', 'med mera'`); `firstWordOf` keeps `å`. Check that no Swedish word collides with an English/Finnish one already in the list in a way that changes en/fi results (run check:feedback).
- Test: `scripts/check-feedback.mjs`.

- [ ] **Step 1: Failing cases** in check:feedback with `{ locale: 'sv' }`:
  - `'Ansvarade för kundsupporten i Norden'` → a duty-phrase hint.
  - `'Jag ledde ett team på 5 personer'` → weak-opener hint.
  - `'Framgångsrikt lanserade 3 nya tjänster'` → filler hint.
  - `'Minskade svarstiden med 40 % genom att införa en ny ärendekö'` → no phrasing hint.
  - Hint text equals the `feedback/sv.js` string for that rule.
- [ ] **Step 2: Run** `npm run check:feedback` — expect FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm run check:feedback && npm run check:i18n && npx playwright test e2e/bullet-hints.spec.js` — expect PASS.
- [ ] **Step 5: Commit** `Give Swedish bullets their own hints`.

### Task 7: End-to-end, docs and version

**Files:**
- Create: `e2e/swedish.spec.js`.
- Modify: `scripts/check-i18n.mjs` — delete `SWEDISH_PENDING` and its skips, so parity and every `sv` plural case run for all namespaces' declared locales.
- Modify: `CLAUDE.md` ("Bilingual throughout": three builder languages, the `locales` option, `CONTENT_ONLY_NAMESPACES`, English fallbacks for data tables; "The CV has its own language": `'sv'`; command list unchanged).
- Create: `docs/superpowers/notes/2026-11-28-swedish-review.md` — the Swedish was written without a native reviewer; list the files (`src/i18n/*/sv.js`, registry `sv` labels, Swedish hint lists) for a fluent reader before the `/sv/` pages release.
- Modify: `package.json`/`package-lock.json` via `npm version 1.7.14 --no-git-tag-version`.

- [ ] **Step 1: Write `e2e/swedish.spec.js`:**
  - "the builder in Swedish": `/cv`, language menu → Svenska; toolbar Save button text is `builderShell` sv `toolbar.save`; the CV's experience heading is the `cv` sv text; Settings dialog title is Swedish.
  - "a Swedish CV in an English app": English app, Settings › CV language › Svenska; toolbar still English; CV headings Swedish; Export → HTML download has `<html lang="sv"` and the Swedish experience heading.
  - "a Swedish share link": with the CV language Swedish, copy share link (helper in `e2e/helpers/shareLinks.js`), open it → `/view` CV headings Swedish; Edit a copy opens the builder with Settings › CV language Svenska pressed.
- [ ] **Step 2: Run** `npx playwright test e2e/swedish.spec.js` — expect PASS (the features exist; failures mean a gap in Tasks 2–6, fix there).
- [ ] **Step 3:** Delete `SWEDISH_PENDING`, update CLAUDE.md, write the review note; commit `Document Swedish in the builder`.
- [ ] **Step 4: Run every check** (`for s in share reducers feedback docx-export section-schema section-columns template-pages template-variants cv-library applications job-match bullet-ideas cv-import i18n thumbnails; do npm run check:$s || break; done`), `npm run lint`, `npm run build` — expect all PASS.
- [ ] **Step 5:** `npm version 1.7.14 --no-git-tag-version`; commit `Bump version to 1.7.14`.
- [ ] **Step 6: Run** `npm run test:e2e:fast` then `npm run test:e2e:slow` (background; slow tier ~ long) — expect PASS; any failure is fixed in its own commit before reporting.
