# Swedish in the builder and on the CV (1.7.14) — design

## Intent

Swedish-speaking Finns, and Swedish speakers elsewhere, should be able to
build a CV entirely in Swedish: the builder's interface, the CV page, every
export and the cover letter. This is the first of three steps the user laid
out; it deliberately stops short of public Swedish pages (`/sv/…`, step 2)
and Swedish reading (examples, import, job-ad match; step 3).

The Swedish is standard written Swedish that reads naturally in Finland and
in Sweden: words both use ("CV", "personligt brev", "arbetserfarenhet"),
nothing Sweden-only ("meritförteckning") or Finland-Swedish-only. Dates and
numbers follow `Intl` with the `sv` locale.

## Goals

- `sv` is a third app language. The builder (`/cv`) can be switched to
  Svenska and remembers it like English/Finnish (`UI_LOCALE_STORAGE_KEY`).
- `sv` is a third CV language (`formData.cvLanguage = 'sv'`, Settings › CV
  language › Svenska). A CV following a Swedish app is Swedish.
- Everything drawn on the CV and in exports is Swedish for a Swedish CV:
  section headings, labels, "Present"-style words, skill category labels,
  the PDF/HTML/Word/JSON exports' text, the PDF preview, the parser view's
  labels, the cover letter page and its generated draft.
- Every builder dialog, toast, hint and panel is Swedish when the app is.
- Bullet hints work on Swedish bullets (Swedish duty phrases, weak openers,
  filler words added to the existing closed lists).
- The skill-category grouping some templates use recognises Swedish
  category words.
- Template, look, accent, headings-colour and field labels the builder shows
  have Swedish.
- Share links carry `cl: 'sv'`; `/view` shows a Swedish CV in Swedish.

## Non-goals (this release)

- No `/sv/` addresses, no Swedish route metadata, sitemap, worker or
  pre-render changes. Content pages stay English/Finnish, decided by their
  address. A visitor whose saved locale is `sv` sees content pages in
  English (they have no `/fi/` address).
- The header's language switch on content pages stays an English↔Finnish
  toggle.
- The demo CV ("Load demo") stays English. Example CVs, bullet ideas, the
  PDF/Word/LinkedIn import, the paste parser and the job-ad match have no
  Swedish tables; for `sv` they use English (the same fallback `t()` uses).
- No Swedish template pages, FAQ, guides or template page copy.

## Anti-goals

- Swedish built from fragments, or Finnish-flavoured machine Swedish. Keep
  sentences whole with `{placeholders}`, as `check:i18n` requires.
- `sv` silently collapsing to English somewhere the user chose Swedish
  (the ~30 `locale === 'fi' ? 'fi' : 'en'` normalisations in `src/` are the
  risk).
- A builder namespace shipping without Swedish by accident.
- Any change to what an English or Finnish user sees.

## Constraints

- i18n module rules from 1.7.13 (CLAUDE.md "Bilingual throughout"): a
  namespace's text stays in its chunk; `src/i18n/index.js` stays free of
  `window`/React.
- The PDF text layer's font is Windows-1252: å, ä, ö, é are covered.
- Share-link keys are permanent; `cl` already exists and gains a value.
  An older deployed version decoding `cl: 'sv'` falls back to its default,
  which is acceptable.
- `check:*` scripts and e2e must stay green; new behaviour gets cases in the
  matching check and e2e coverage.
- Version 1.7.14, bump as its own commit.

## Approaches

- **A. Swedish as a third full app language (chosen).** `LOCALES` gains
  `sv`, builder namespaces get `sv.js`, content-page namespaces declare
  they are English/Finnish only. Gives a Swedish builder and CV, which is
  what was asked for.
- **B. Swedish only as a CV language.** CV, exports and letter in Swedish,
  interface English/Finnish. About a quarter of the text, but no Swedish
  builder; dropped.
- (Step 2's `/sv/` pages were considered and deferred by the user.)

## Design

### Locales

- `src/i18n/index.js`: `LOCALES = ['en', 'fi', 'sv']`. A namespace may
  declare its languages: `createNamespace(name, messages, { kind, locales })`,
  default `LOCALES`. `normalizeLocale` is unchanged (any of `LOCALES`);
  `t`/`copy` for a locale the namespace lacks fall back to English, as a
  missing key already does.
- `pages/*` namespaces (including `pages/landing`, `pages/privacy`,
  `pages/templateDetail`, `pages/guideLayout`, `pages/freeTemplates`)
  declare `locales: ['en', 'fi']`. Every other namespace (`common`,
  `builderShell`, `cvForm`, `formInline`, `fieldFilter`, `cv`, `exports`,
  `letter`, `builder`, `form`, `dialogs`, `feedback`, `share`) gets `sv.js`
  and uses the default.
- `check:i18n`: parity runs over each namespace's declared locales; a
  namespace declaring fewer than `LOCALES` must be on a short list in the
  script (the `pages/*` folders) with the reason "content pages have no
  Swedish address yet", so a builder namespace can't drop Swedish. Plural
  cases get `sv` entries (Swedish plural rules are one/other like English).
  The inline-branch scan also catches `=== 'sv'` / `isSwedish` forms.
- `common` is the shell's text on every page; it gets `sv` because the
  builder's shell uses it, even though content pages never show Swedish.

### Choosing Swedish

- Builder toolbar: the flag button that flips en↔fi becomes a language
  menu button (current flag + code) opening a small menu: English, Suomi,
  Svenska, each in its own language with `lang`, the current one marked
  (`aria-checked` menu items, keyboard and focus as the toolbar's other
  menus). `LocaleFlagIcon` gets a Swedish flag.
- Settings › CV language: Follow the app / English / Suomi / Svenska.
  `CV_LANGUAGES = ['en', 'fi', 'sv']`; `resolveCvLocale` returns the app
  locale through `normalizeLocale`.
- `App.jsx` `readStoredLocale` and `uiReducer`'s initial locale accept
  `sv`. On a content page, a stored `sv` renders English (the address
  decides; only `/fi/…` is Finnish). The header's toggle on content pages
  treats `sv` as "not Finnish": it goes to the Finnish twin, and from
  Finnish back to English. Entering the builder with `sv` stored shows
  Swedish.
- `<html lang>` is `sv` while the builder is Swedish. `og:locale` becomes
  `sv_SE` there (the builder is `noindex, nofollow`, so this is cosmetic);
  `hreflang` alternates are unchanged (no Swedish page exists).

### Swedish on the CV and exports

- Every `locale === 'fi' ? 'fi' : 'en'` / `options.locale === 'fi' ? …`
  normalisation in `src/` becomes `normalizeLocale(locale)` where the value
  feeds `t()`, `Intl`, `lang` or a document's language, so `sv` reaches
  them. Where the value selects a per-language *table* that has no Swedish
  (import, job match, bullet ideas, example CVs, `templatePageCopy`,
  `templateLocalization` in `cvTemplates.js` for content pages), the code
  picks the table with an explicit English fallback.
- Showcases' `isFinnish` flags: each use is re-read. Text goes through
  `cv.t(locale, …)`; skill grouping passes the locale, not a boolean.
- `parseSkillCategories(skills, locale)` gets a Swedish pattern set
  (språk/programmering, ramverk/bibliotek, databas, moln, devops,
  säkerhet), English words kept in it as the Finnish set does.
- Exports: HTML `lang`, Word document language, PDF metadata language and
  the cover-letter date (`Intl.DateTimeFormat('sv', { dateStyle: 'long' })`)
  all follow `sv`.
- Cover letter draft (`generateCoverLetterDraft`): Swedish `letter/sv.js`.
  With a pasted ad, `jobTitleFromAd`/`matchJobAd` still read the ad with
  their English/Finnish tables; the draft sentence around them is Swedish.

### Labels in registries

- The `{ en, fi }` label maps the builder shows (`templateVariants.js`,
  `templateAccents.js`, `templateFields.js`, `cvHeadingColors.js`,
  `cvTemplates.js` labels/descriptions/chips used by the builder's gallery)
  gain `sv`. Their readers pick `label[locale] ?? label.en`. Checks that
  read `.label.en` keep working; `check:template-variants` /
  `check:template-pages` additionally require a non-empty `sv` label where
  the builder shows the map (not for content-page-only copy).

### Bullet hints

- `cvFeedback.js`: Swedish entries in `WEAK_PHRASES` (e.g. "ansvarade
  för", "arbetade med", "deltog i"), `WEAK_OPENERS` ("jag", "vi", "var",
  "arbetade", "hjälpte", "deltog"), `FILLER_WORDS` ("framgångsrikt",
  "diverse", "olika", "m.m.", "osv"). Hint text in `feedback/sv.js`.
  `check:feedback` gets Swedish cases (each rule fires on a Swedish bullet,
  a strong Swedish bullet gets no phrasing hint).

### Share page

- `shareLinks.js` encodes/decodes `cl: 'sv'`; `/view` renders a Swedish
  CV in Swedish and its own chrome (share namespace) in Swedish when the
  CV is Swedish, as it follows the CV's language today. `check:share`
  round-trips a Swedish CV.

### Testing

- `check:i18n`, `check:feedback`, `check:share`, `check:reducers`
  (locale/cvLanguage `sv`), `check:template-variants`/`check:template-pages`
  label cases.
- A new `e2e/swedish.spec.js`: switch the builder to Svenska via the
  toolbar menu, see Swedish toolbar/form text, the CV's section headings in
  Swedish, reload keeps Swedish, Settings › CV language Svenska on an
  English app gives a Swedish CV with an English interface, HTML export has
  `lang="sv"` and Swedish headings, a content page with `sv` stored is
  English and its header toggle goes to `/fi/…`.
- Thumbnails/pre-render unaffected (English/Finnish only); run
  `check:thumbnails` to confirm.

### Docs

- CLAUDE.md: "Bilingual throughout" becomes three languages for the
  builder; record the `locales` option, the content-page exception and the
  English fallbacks; "The CV has its own language" gains `sv`.
- A note that the Swedish was written without a native reviewer and should
  be read by a fluent speaker before step 2 (`/sv/` pages).

## Left to the builder

- Exact Swedish wording (within the vocabulary rule above).
- Menu component structure for the toolbar language menu, following the
  toolbar's existing menus.
- Which of the ~30 normalisations are "text/Intl" vs "table" — each is
  read and classified.
- Task order and commit split.
