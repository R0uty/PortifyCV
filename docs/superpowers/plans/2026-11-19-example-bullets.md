# Example bullets ("Get ideas") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Under each job's achievements, offer the example CVs' bullets for the closest role, with the numbers turned into `[__]` blanks; flag blanks left in, both beside the bullet and on export.

**Architecture:** A pure module (`src/utils/bulletIdeas.js`) blanks numbers, ranks roles and lazily loads every example's achievements through `EXAMPLES[id].load()`. One panel component (`fields/BulletIdeas.jsx`) is placed in Classic's achievements list and Direct Edit's popup list. `cvFeedback.js` gets the `[__]` constant, a `blank` hint and a count used by the export toasts.

**Tech Stack:** React 19, plain JS modules, framework-free Node check scripts, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-11-19-example-bullets-design.md`

## Global Constraints

- The blank is exactly `[__]` (open bracket, two underscores, close bracket).
- Hint copy: EN "Fill in the blank: [__] is still in this bullet." FI "Täytä aukko: kohdassa on vielä [__]."
- Ideas come in the CV's language (`CvLanguageContext`, else the UI locale); the panel's own labels follow the UI locale.
- The example modules load only when a panel is first opened. Never import `src/utils/examples/*` statically.
- Bilingual inline strings (`isFinnish ? … : …`); no i18n library.
- Commits carry only the user's name, with no co-author line. The version bump to 1.7.8 is its own commit: `npm version 1.7.8 --no-git-tag-version`, message "Bump version to 1.7.8".
- Don't push without asking.

## Review Focus

1. **Tech names with digits stay intact.** "WCAG 2.1", "ISO 27001", "HTML5", "Q3", "B2B" and "S3" are not blanked. A person expects only the facts to be blanked, not product names. The test goes in Task 1.
2. **Finnish number formats.** "35 %", "1,2 M€" and "1 200" each become a single `[__]`. The test goes in Task 1.
3. **A role that matches nothing** ("Florist"): no example's bullets are pushed on the person; the panel asks them to pick a role. The test goes in Task 1 (rank) and Task 2 (panel).
4. **Hidden experience entries** don't count toward the export warning, because they aren't exported. The test goes in Task 3.
5. **A blanked bullet doesn't also get "Add a number".** The blank hint replaces it. The test goes in Task 3.

---

### Task 1: `bulletIdeas.js` and its checks

**Files:**
- Modify: `src/utils/cvFeedback.js`: export `BULLET_BLANK = '[__]'` near the hint constants.
- Create: `src/utils/bulletIdeas.js`
- Create: `scripts/check-bullet-ideas.mjs` (same `registerHooks`/`importSrc` header as `check-cv-feedback.mjs`)
- Modify: `package.json` (`"check:bullet-ideas": "node scripts/check-bullet-ideas.mjs"`), `.github/workflows/ci.yml` (a run step after `check:job-match`), `CLAUDE.md` (command list, and "twelve" becomes "thirteen")

**Interfaces:**
- Produces:
  - `blankNumbers(text: string) => string`
  - `rankIdeaRoles(roleText: string, roles: IdeaRole[], locale) => IdeaRole[]`: roles with `score > 0` first, by score descending, ties in registry order, then the rest in registry order. Each role in the result carries `score`.
  - `loadBulletIdeas(locale: 'en'|'fi') => Promise<IdeaRole[]>`: cached per locale.
  - `IdeaRole = { roleId, roleLabel, jobRoles: string[], bullets: string[] }`. `bullets` are already blanked and de-duplicated, in example order.

- [ ] **Step 1: Write the failing checks.** Write them in `scripts/check-bullet-ideas.mjs` with exact expected values:
  - `blankNumbers('Cut the monthly close from 10 days to 5 by automating reconciliations.')` → `'Cut the monthly close from [__] days to [__] by automating reconciliations.'`
  - `'Raised NPS to 4.6/5 across 25+ accounts.'` → `'Raised NPS to [__] across [__] accounts.'`
  - `'Grew revenue by 35% to €1.2M in 2023.'` → `'Grew revenue by [__] to [__] in [__].'`
  - `'Kasvatin myyntiä 35 % ja 1,2 M€ vuonna 2023.'` → `'Kasvatin myyntiä [__] ja [__] vuonna [__].'`
  - `'Käsittelin 1 200 laskua kuukaudessa.'` → `'Käsittelin [__] laskua kuukaudessa.'`
  - `'Made checkout WCAG 2.1 AA compliant and ISO 27001 ready in Q3 using HTML5 and S3.'` comes back unchanged.
  - `'Cut build time 3x.'` → `'Cut build time [__].'`
  - Ranking (with `loadBulletIdeas`):
    - en: `'Senior Frontend Developer'` → first `roleId` is `'frontend-developer'`
    - en: `'Staff nurse'` → `'nurse'`
    - fi: `'Sairaanhoitaja'` → `'nurse'`
    - fi: `'Frontend-kehittäjänä'` → `'frontend-developer'`
    - `'Florist'` → every score is 0
    - `''` → every score is 0
  - Loading:
    - every example registered in `EXAMPLES` gives one role per locale
    - each role's `bullets` equal `blankNumbers` of that example's achievements, in order, de-duplicated
    - every digit left in any loaded bullet sits in a word listed in the check's own `KEPT_TOKENS` array. Fill that list while implementing, with tech names only, and fail on anything else, so a missed fact can't hide.
    - the English and Finnish bullet counts are equal per role.
- [ ] **Step 2:** `npm run check:bullet-ideas` → FAIL (module missing).
- [ ] **Step 3: Implement the module.**
  - **Blanking.** A number token starts at a non-letter boundary: digits with `.`/`,` decimals and space-separated thousands groups (a group of exactly 3 digits). It swallows an adjacent currency sign (`€ $ £`), a trailing `%`/` %`, `+`, `x`/`×`, `k`/`K`/`M`/`m€`/`M€`, and `/<digits>`. It is kept when glued to letters (`Q3`, `HTML5`) or when the previous word is an all-caps acronym of 2+ letters (`WCAG 2.1`, `ISO 27001`).
  - **Ranking.** Lowercase words split on non-letters (Finnish letters included). Drop the stopwords `senior junior lead principal staff head chief and of the ja vanhempi`. Two words match when they are equal or one is a prefix of the other and the shorter has at least 5 letters. The score is the count of matched words against the role label plus that example's job titles.
  - **Loading.** `Promise.all` over `Object.entries(EXAMPLES)` with `entry.load()`, reading `module.default[locale].experience[*]`.
- [ ] **Step 4:** `npm run check:bullet-ideas` → all `ok`. `npm run lint` is clean.
- [ ] **Step 5: Commit.** "Add bullet ideas from the example CVs".

### Task 2: The ideas panel in both modes

**Files:**
- Create: `src/components/fields/BulletIdeas.jsx`
- Modify:
  - `src/components/fields/ReorderableListInput.jsx`: optional prop `ideas = null` (`{ roleText }`); when set, render `<BulletIdeas>` after the Add button, with `onAdd={(text) => { setIds([...ids, nextId]); setNextId(nextId + 1); onChange([...items, text]) }}`
  - `src/components/CVForm.jsx`, at the experience achievements (around line 802): `ideas={{ roleText: item.role || formData.title }}`
  - `src/components/SectionEditorPopup.jsx`: `FieldInput` takes `ideas`. `renderRecordArray` passes `{ roleText: item.role || formData.title }` when `sectionKey === 'experience'`. The list branch renders `<BulletIdeas>` after its Add button when `field.key === 'achievements' && ideas`.
  - `src/styles/app-shell.css`: `.bullet-ideas*` beside `.bullet-hints`.
- Test: `e2e/bullet-ideas.spec.js`

**Interfaces:**
- Consumes: `loadBulletIdeas`, `rankIdeaRoles` (Task 1); `CvLanguageContext`.
- Produces: `<BulletIdeas roleText items onAdd locale />`, where `items` is the job's current achievements, `onAdd(text: string)` appends, and `locale` is the UI locale used for labels.

Behaviour:
- **Closed state.** A disclosure button, "Get ideas" / "Hae ideoita", with `aria-expanded`. Opening it loads the ideas (and shows "Loading ideas…" / "Ladataan ideoita…"). A failed load shows "Couldn't load ideas." / "Ideoita ei voitu ladata."
- **Role picker.** A `<select>` labelled "Ideas from" / "Ideat roolista", holding the ranked roles. It starts on the top role when its score is above 0. Otherwise it starts on an empty "Choose a role" / "Valitse rooli" option and shows no bullets.
- **Bullet list.** Up to 6 bullets, with "Show more" / "Näytä lisää" revealing the rest. Each bullet has an Add button, `aria-label` "Add: <bullet>" / "Lisää: <bullet>". Bullets already in `items` (exact text) are left out. Once a role has nothing left: "All ideas from this role are in this job." / "Kaikki tämän roolin ideat ovat jo tässä työssä."
- **Language.** Ideas use `useContext(CvLanguageContext) ?? locale`.

- [ ] **Step 1: Write `e2e/bullet-ideas.spec.js`.** The suite opens Classic.
  - "Classic: ideas for the job's role add a blanked bullet". Load the demo CV and open Experience. The demo role is "Senior Product Designer", so the picker shows a design role first. Click "Get ideas" in the first job, then the first "Add:" button. The last "Achievement N" textbox contains `[__]`, and that bullet is no longer offered.
  - "Direct Edit: the entry popup offers the same ideas". Open the experience popup as in `bullet-hints.spec.js`, click "Get ideas", Add one, and expect the list's last input to have a value containing `[__]`.
  - "a role that matches nothing asks for a role". Set the first job's Role to "Florist" in Classic and open ideas. The select's value is `''`, there are no "Add:" buttons, and choosing "Registered nurse" shows them.
  - "ideas follow the CV language". Set the CV language to Suomi (`chooseCvLanguage` pattern from `cv-language.spec.js`). The English UI still says "Get ideas", and the ideas are Finnish: the picker has the option "Sairaanhoitaja".
- [ ] **Step 2:** `npx playwright test e2e/bullet-ideas.spec.js` → FAIL.
- [ ] **Step 3:** Implement the component, the two placements and the styles.
- [ ] **Step 4:** The spec passes, along with `e2e/bullet-hints.spec.js` and `e2e/direct-edit.spec.js`. Lint is clean.
- [ ] **Step 5: Commit.** "Offer example bullets under each job".

### Task 3: Blank hint and export warning

**Files:**
- Modify:
  - `src/utils/cvFeedback.js`: in `getBulletHints`, when `text.includes(BULLET_BLANK)` push `{ id: 'blank', message }` (copy in Global Constraints) first and skip `no-number`. Add `countBlankBullets(formData) => number`, which counts achievements containing `BULLET_BLANK` across experience entries visible in the export (use the same item-visibility rule the renderer uses: `sectionItemVisibility.experience[String(index)] !== false`).
  - `src/pages/ResumeBuilderPage.jsx`: both download toasts (`handleDownloadPdfPreview`, `handleExport` for every type) append the blank warning when the count is above 0. EN: ` [n] bullet(s) still hold [__].`, as "1 bullet still holds [__]." / "3 bullets still hold [__]." FI: "1 kohdassa on vielä [__]." / "3 kohdassa on vielä [__]." The toast type becomes `'info'` when blanks remain, so it isn't shown as a plain success.
  - `scripts/check-cv-feedback.mjs`: the cases below.
- Test: add to `e2e/bullet-ideas.spec.js`.

- [ ] **Step 1: Write the failing checks.**
  - `ids(['Cut the monthly close from [__] days to [__].'])` → `[['blank']]`.
  - In Finnish, the message equals the FI copy.
  - `countBlankBullets` returns 2 for two blanked bullets in one visible job.
  - It returns 0 when that job is hidden via `sectionItemVisibility: { experience: { '0': false } }`.
  - It returns 0 on `createInitialCvData()`.
- [ ] **Step 2:** `npm run check:feedback` → FAIL.
- [ ] **Step 3:** Implement the hint, the count and the toasts.
- [ ] **Step 4: Add the e2e test** "export warns about blanks left in". Add one idea, export JSON (no preview modal), and expect the toast text to contain "1 bullet still holds [__]." Then run `npm run check:feedback` and the spec; both pass.
- [ ] **Step 5: Commit.** "Flag blanks left in a bullet".

### Task 4: Docs, full verification, version

- [ ] **Step 1: Add a "Bullet ideas (1.7.8)" paragraph to `CLAUDE.md`'s Architecture** (where the ideas come from, the lazy load, the blank rule, `check:bullet-ideas`). Check whether any marketing copy claims phrase suggestions; if a builder guide lists builder features, add one line there in both languages, only if the feature now exists as stated.
- [ ] **Step 2: Run the checks.**
  - `npm run lint` and `npm run build`
  - all 13 `check:*`. If `check:thumbnails` fails, run `npm run thumbnails` with the preview server stopped and commit the images.
- [ ] **Step 3: Run the e2e suites.** `npm run test:e2e:fast` and `npm run test:e2e:slow` both pass.
- [ ] **Step 4: Commit.** Commit the docs, then run `npm version 1.7.8 --no-git-tag-version` and commit it as "Bump version to 1.7.8".
- [ ] **Step 5: Wrap up.** Update the memory file `portifycv-current-state.md` and ask whether to push.
