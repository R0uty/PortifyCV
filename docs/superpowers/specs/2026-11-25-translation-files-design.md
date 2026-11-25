# Translation files — design

Draft 2026-11-25, for 1.7.13 on `v1.7.0`. Groundwork for Swedish, the last
item from the 2026-11-19 competitor review.

## Intent

Every piece of interface text is an inline pair today: about 1,450
`isFinnish ? '…' : '…'` / `locale === 'fi' ? …` expressions in 95 files.
A third language would turn each into a three-way branch. The user wants
the text moved into files of its own "for better localization" (2026-11-25),
with **our own small module, no library** (user's choice, 2026-11-25), so
that adding Swedish, or any later language, means adding files rather than
editing 95 components.

This release changes no visible text. Swedish comes after it, as its own
design.

## Goals

1. **A translation module** in `src/i18n/`:
   - `translate(locale, key, vars?)`: a pure function, usable anywhere
     (utils, exporters, reducers, the Node pre-render, the worker if needed).
   - `useT()`: a hook returning `t(key, vars?)` for the app's language
     (`LocaleContext`).
   - CV-page text uses the CV's language (`cvLocale` / `CvLanguageContext`),
     never the app's: components drawing the CV call
     `translate(cvLocale, …)` or a `useCvT()`.
   - Placeholders `{name}`. Plurals as `{ one, other }` values chosen with
     `Intl.PluralRules(locale)`. Rich text (a link or `<strong>` inside a
     sentence) as numbered tags in the string, `'Read the <0>guide</0>.'`,
     rendered by a small `<T k="…" parts={[…]} />` (or `tRich`) component.
   - One list of languages, `LOCALES = ['en', 'fi']`, and English as the
     fallback for a missing key at runtime (never reached when the check
     below passes).
2. **Files per language, split by where the text is used.** Each namespace
   is a folder with one file per language, `src/i18n/<namespace>/en.js` and
   `fi.js`, plain objects of whole sentences. The code that uses a namespace
   imports it statically, so each page's text stays in that page's lazy
   chunk. The entry chunk carries only what the entry already shows
   (header, footer, consent banner, toasts).
3. **Move every inline interface-text pair** in `src/` into those files,
   unchanged character for character, Finnish and English.
4. **A `check:i18n` script** (the 15th check, added to CI and CLAUDE.md):
   - every key exists in every language;
   - the same placeholders and rich-text tags in every language;
   - plural values have `one` and `other`;
   - no unused keys;
   - no inline language branch for text left in `src/` (a source scan for
     `isFinnish ?`, `locale === 'fi' ?` and the like), with an explicit,
     commented allowlist for branches that are logic, not text (address
     choice, date order, which data file to load).
5. **Proof that nothing visible changed:**
   - every page in `dist/prerendered/` is byte-identical before and after;
   - all fourteen existing checks and both e2e suites pass with no change
     to an expected string;
   - the entry chunk's gzipped size grows by no more than about 2 KB.

## Non-goals

- Swedish strings, a Swedish route, a language switch with three options.
- Changing any wording. Typos or awkward copy found on the way are listed
  in the release notes for later, not fixed here.
- Route metadata: `pageMeta.js` (`titleFi`, `descriptionFi`, `pathFi`),
  `routes.js` and the sitemap keep their per-language fields and their
  own checks. Swedish will extend them in its own release.
- Content data that is already per-language data, not interface text:
  the example CVs, `templatePageCopy.js`, `templateMetaDescriptionsFi.js`,
  the CV import's heading tables, `jobTerms.js`, the bullet ideas, the
  landing FAQ data. They stay where they are.
- A library, a JSON build step, runtime fetching of language files.

## Anti-goals

- Any visible text change, in either language, on any page, toast, CV
  template or export (PDF, Word, HTML, cover letter).
- Pulling a page's text into the entry chunk (the same mistake CLAUDE.md
  warns about for `templatePageCopy.js`).
- Building Finnish sentences from fragments: a sentence whose Finnish word
  order or case endings differ stays one string with placeholders.
- A half-migrated tree: each commit leaves every check and test green.

## Approaches (decided)

User chose **our own module** (2026-11-25):
- **1. Own module (chosen).** No dependency; matches the project's
  hand-rolled routing and CSS; works in the Node pre-render and the worker
  as plain imports. Costs ~100 lines we maintain.
- 2. i18next + react-i18next. Rejected: ~20 KB on every load and setup in
  the pre-render and worker, for features a two- or three-language site
  doesn't need yet. Keeping each language a plain object keeps a later move
  cheap if outside translators join.
- 3. Lingui. Rejected: a compile step in the Vite build for little gain.

## Shape

- `src/i18n/index.js`: `LOCALES`, `translate`, plural and placeholder
  handling. `src/i18n/react.jsx`: `useT`, `useCvT`, `<T>`.
- Namespaces (names are the builder's call), roughly: `common` (shell,
  header, footer, consent, toasts), `builder` (toolbar, menus, dialogs,
  form), `cv` (section names and labels drawn on the CV, in every
  template), `exports` (PDF/Word/HTML copy, `createExportCopy`), one per
  content page, `share` (the /view page).
- Keys are dotted, by place: `toolbar.save`, `markApplied.title`.
- Strings stay byte-identical; a key's English and Finnish come from the
  same pair they replace.

## Migration

- Snapshot first: build, copy `dist/prerendered/` and the entry chunk's
  size aside, outside the repo.
- Then area by area (module + check script first, then the CV and
  exports, the builder, the content pages, the rest), one commit per
  area, each running the checks it touches and the e2e specs for that area.
- Finish with the full proof (goal 5), CLAUDE.md (the "Bilingual
  throughout" paragraph rewritten: how to add a string, how to add a
  language), and the version bump.

## Tests

- `check:i18n` (above), with its own cases for `translate`: placeholder
  filling, plurals in en and fi, fallback to English, rich tags.
- The byte-identical pre-render comparison, run as a script during the
  release (not kept in CI; the e2e suites keep guarding text).
- Both e2e suites and all checks, unchanged.

## Structured page copy moves too (user's decision, 2026-11-25)

17 files keep their copy as per-language objects rather than inline pairs
(`getCopy(locale)` with `if (locale === 'fi') return {…}`, or
`COPY = { en, fi }`): every guide and examples page, `LandingPage`,
`FreeCvTemplatesPage`, `TemplateDetailPage`'s own UI copy, Privacy, About,
`GuideLayout` and the like. They move as well: each page's English and
Finnish objects go into `src/i18n/<page>/en.js` and `fi.js` **with their
shape unchanged** (nested `sections`, `paragraphs`, `list` arrays; small
functions such as `minRead: (minutes) => …` stay functions). The page reads
its object through one accessor (e.g. `getPageCopy(namespace, locale)`), so
Swedish later only adds `sv.js` files.

- `check:i18n` also compares these objects' shapes across languages: the
  same keys at every level, arrays of the same length, functions where the
  other language has a function, and the same placeholders/tags in matching
  strings.
- The source scan therefore also flags `locale === 'fi'` returns of copy
  objects and `{ en: …, fi: … }` copy maps in `src/` (allowlist as above).
- Still out of scope, as data rather than page copy: the example CVs,
  `templatePageCopy.js`, `templateMetaDescriptionsFi.js`, the landing FAQ
  data (`landingFaq.js`, which also feeds JSON-LD), the import tables,
  `jobTerms.js`, the bullet ideas, route metadata.

## Calls made after the builder check (mine)

1. **"Byte-identical" means the same text, not the same bytes.** The
   pre-render comparison strips React's `<!-- -->` text separators and
   collapses whitespace between tags before comparing, so joining
   `{count} {isFinnish ? 'mallia' : 'templates'}` into one sentence with a
   placeholder (which the anti-goal wants) passes. Any other difference
   fails.
2. **CV text that today reaches the app's language instead of the CV's**
   is kept exactly as it behaves now (no visible change) and listed in the
   release notes as found; fixing it is a later, visible change.
3. **Text outside `src/`** (the worker's `fallbackBody` Finnish heading,
   `index.html`'s no-JS English copy) stays where it is, named in the
   allowlist; Swedish picks it up with the route metadata.
4. **Keys built at runtime** (`` t(`sections.${id}`) ``) are allowed only
   under prefixes declared in one list in `src/i18n/`; `check:i18n` then
   requires a key for every id in the source the prefix names (section
   ids, template ids) instead of flagging them unused.

## Left to the builder

Namespace names and boundaries, key names, the `<T>` API, the allowlist's
exact entries, migration order within the plan.
