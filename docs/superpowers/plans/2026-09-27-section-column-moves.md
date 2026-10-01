# Section Column Moves Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user move a CV section between the main column and the sidebar of a two-column template, from the Direct Edit section popup. The move should hold in the preview, ATS mode, PDF/DOCX export, share links and JSON.

**Architecture:** A per-template override map, `formData.sectionColumnsByTemplate`, is folded into the template config by one pure helper, `getEffectiveCvTemplate`, at every place that resolves a template. Showcases render a moved section through its *home* renderer (the column the template designed it for), with `data-export-placement` taken from the column it is actually in and a `data-moved-from` hook for a small per-template CSS block. Each template opts in through a `columnMoves: true` flag, so the work ships one template at a time.

**Tech Stack:** Vite + React 19, hand-written CSS, Playwright e2e, framework-free Node check scripts (`scripts/*.mjs`).

**Spec:** `docs/superpowers/specs/2026-09-27-section-column-moves-design.md`, which executors read alongside this plan.

## Global Constraints

- Commits carry **only** `r0uty <yasa.sheva@gmail.com>`: **no** `Co-Authored-By` trailer and no mention of AI in any message. The git config is already set, so plain `git commit` is correct.
- **No new `cvFormReducer` actions.** Column writes use the existing `FORM_ACTION.SET_ROOT_FIELD`.
- User-facing strings are inline bilingual pairs (`isFinnish ? '…' : '…'`). There is no i18n library.
- One unit of work is one feature commit, then **one standalone commit** for the patch bump (`npm version patch --no-git-tag-version`, then commit `package.json` + `package-lock.json` as "Bump version to 1.2.N").
- Every unit gets a `changes.md` entry (newest first, under the `# Changes` intro), in the same commit as the feature.
- TDD: write the failing test first and watch it fail for the right reason before writing production code.
- Full verification before a unit is called done: `npm run lint`, `npm run check:reducers`, `npm run check:share`, `npm run check:direct-edit`, `npm run check:section-schema`, `npm run check:section-columns` (from Task 2 on), `npm run build`, `npm run test:e2e`. The test `'the footer never overlaps the CV preview in Direct Edit mode'` has a known flake under parallel workers only. Re-run it with `--workers=1` to confirm, and do not paper over any other failure.
- **Push nothing and merge nothing.** The user pushes `origin/v1.3.0` only after confirming, and `main` is off limits.
- Share-link short keys are never repurposed. `sc` is confirmed unused: the current keys are `f t a tg em ph lo p x e cs ct pr lg in ah os pb ld mb sp vl it cst ts s l so sv siv pv v d`.
- `src/utils/shareLinks.js`'s decoder always runs output through `parseImportedCvData`, so any new formData field must be accepted there or every share link and JSON import fails.

## Corrections to the spec, found while planning

These deviate from the spec. Each is small and flagged for the user in the handoff.

1. **The effective config is applied at five sites, not one.** `currentTemplate` in `ResumeBuilderPage.jsx` is not the only resolver. `CVPreview.jsx:89`, `CVForm.jsx:92`, `docxExport.js:504` and `exporters.js:1716` each call `getCvTemplate(id)` themselves. All five switch to one helper, `getEffectiveCvTemplate(templateId, locale, formData)`, which the spec anticipated ("any call site that re-derives the base config must switch").
2. **Quadrant is excluded (10 templates, not 11).** Quadrant is a fixed 2×2 grid, not main + sidebar:
   - `about` lives in the identity cell;
   - `skills` and `languages` are pinned to their own cell;
   - `links` is pinned last in the extras cell (see the header comment in `QuadrantShowcase.jsx`).

   "Move to the other column" has no coherent meaning there. Quadrant gets no `columnMoves` flag, so `canMoveSection` stays false and it behaves as today.
3. **Share-link persistence is covered by `check:share`, not e2e.** No e2e test exercises share links today, and building one needs clipboard access. The codec round trip in `check:share` is the real guard for the `sc` key.

## File structure

- **Create** `src/utils/sectionColumns.js`: all column rules and pure helpers. It is the single source of truth.
- **Create** `scripts/check-section-columns.mjs`: framework-free checks for the module and for import normalisation.
- **Modify** `package.json`: add the `check:section-columns` script.
- **Modify** `src/utils/cvForm.js`: default value, demo value and import validation for `sectionColumnsByTemplate`.
- **Modify** `src/types/cv.d.ts`: typedef.
- **Modify** `src/utils/shareLinks.js`: the `sc` key.
- **Modify** `scripts/check-share-links.mjs`: round trip with a non-empty map.
- **Modify** the five resolver sites listed in correction 1.
- **Modify** `src/components/SectionEditorPopup.jsx` and `src/styles/direct-edit-popup.css`: the Main/Sidebar control.
- **Modify** `src/utils/cvTemplates.js`: a `columnMoves: true` flag per template, as it lands.
- **Modify** 9 Showcases plus their CSS: Creative, Modern, Executive, Graduate, Portfolio, TechExec, ColorfulCompact, Developer, NavyProfessional, ModernOrange. NavyProfessional and ModernOrange are also touched in Task 1.
- **Modify** `e2e/direct-edit.spec.js`: new tests and the growing sweep.
- **Modify** `changes.md` and `todo.md` per unit.

---

### Task 1: Direct Edit pencils for Navy Professional and Modern Orange sidebar sections (unit 1, v1.2.53)

The overlay finds sections by `[data-export-section]`. `SidebarBlock` in these two templates renders none, so Navy's Skills/Languages and Modern Orange's Skills/Languages/Education have no pencil today.

**Files:**
- Modify: `src/components/templates/NavyProfessionalShowcase.jsx:54-61` (`SidebarBlock`), `:215`, `:233`
- Modify: `src/components/templates/ModernOrangeShowcase.jsx:114-121` (`SidebarBlock`), `:426`, `:450`, `:474`
- Test: `e2e/direct-edit.spec.js`

**Interfaces:**
- Produces: `SidebarBlock({ id, title, children })`. When `id` is given it renders `data-export-section={id}` and `data-export-placement="side"`. The contact/personal-info blocks (Navy `:301`, Modern Orange `:578`) pass no `id` and stay untagged.

- [ ] **Step 1: Write the failing test.** Add inside `test.describe('Direct Edit builder', …)`, after the test `'an inline-unwired template is still fully editable through the popup'`:

```js
  // SidebarBlock in these two templates rendered no data-export-section,
  // so the overlay (which finds sections by that attribute) gave their
  // sidebar sections no pencil at all.
  for (const [label, sectionKey, title] of [
    ['Navy Professional', 'skills', 'Skills'],
    ['Navy Professional', 'languages', 'Languages'],
    ['Modern Orange', 'education', 'Education'],
  ]) {
    test(`${label}'s sidebar ${sectionKey} section opens the popup`, async ({ page }) => {
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
      await selectTemplate(page, label)

      await page.locator(`[data-export-section="${sectionKey}"]`).first().hover()
      await page.locator('.direct-edit-pencil').click()

      const popup = page.locator('.direct-edit-popup')
      await expect(popup).toBeVisible()
      await expect(popup.locator('.direct-edit-popup__title')).toHaveText(title)
    })
  }
```

- [ ] **Step 2: Run it and watch it fail.**

Run: `npm run build && npx playwright test e2e/direct-edit.spec.js -g "sidebar .* section opens the popup" --reporter=line`
Expected: 3 failed, timing out on `locator.hover` waiting for `[data-export-section="skills"]` and the others.

- [ ] **Step 3: Tag `SidebarBlock` in both files.** In `NavyProfessionalShowcase.jsx`, replace the component:

```jsx
// `id` is set only for real CV sections: it is what the PDF exporter and
// Direct Edit's overlay find a section by. The contact block passes none
// and stays untagged.
function SidebarBlock({ id, title, children }) {
  return (
    <div
      className="navy-professional-showcase__sidebar-block"
      data-export-section={id}
      data-export-placement={id ? 'side' : undefined}
    >
      <p className="navy-professional-showcase__sidebar-heading">{title}</p>
      {children}
    </div>
  )
}
```

Then change `<SidebarBlock key={key} title={copy.skills}>` to `<SidebarBlock key={key} id="skills" title={copy.skills}>`, and `<SidebarBlock key={key} title={copy.languages}>` to `<SidebarBlock key={key} id="languages" title={copy.languages}>`.

In `ModernOrangeShowcase.jsx`, make the identical component change with class `modern-orange-showcase__sidebar-block` and heading class `modern-orange-showcase__sidebar-heading`, then add `id="skills"`, `id="languages"` and `id="education"` to the three `<SidebarBlock key={key} …>` sites (lines 426, 450, 474). Leave `<SidebarBlock title={copy.personalInfo}>` alone.

- [ ] **Step 4: Run the tests and watch them pass.**

Run: `npm run build && npx playwright test e2e/direct-edit.spec.js -g "sidebar .* section opens the popup" --reporter=line`
Expected: 3 passed.

- [ ] **Step 5: Check that PDF export on both templates is unaffected.** The exporter now sees sidebar sections it did not see before, so export both templates in designer and ATS mode. Add this test next to the Step 1 loop:

```js
  test('Navy Professional and Modern Orange still export to PDF with tagged sidebar sections', async ({ page }) => {
    test.setTimeout(90_000)
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    for (const label of ['Navy Professional', 'Modern Orange']) {
      await selectTemplate(page, label)
      await exportPdfAndExpectSuccess(page)
    }
  })
```

Run: `npx playwright test e2e/direct-edit.spec.js -g "still export to PDF with tagged" --reporter=line`
Expected: PASS. This guards a refactor rather than new behaviour, so it passes before and after, and the commit message must say so.

- [ ] **Step 6: Record it.** Add a `changes.md` entry at the top: "Direct Edit: Navy Professional and Modern Orange sidebar sections get a pencil — 2026-09-27". Explain that `SidebarBlock` carried no `data-export-section`, so the overlay could not see those sections, and that the contact/personal-info blocks stay untagged on purpose.

In `todo.md`, directly under item 60 in the "## Next session — handoff, 2026-09-24" section, add:

```markdown
- [x] **61. Navy/Modern Orange sidebar sections had no Direct Edit pencil.**
      DONE 2026-09-27, v1.2.53. `SidebarBlock` rendered no
      `data-export-section`; it now takes an optional `id`. Found while
      designing item 60.
```

- [ ] **Step 7: Run the full verification suite** (Global Constraints list, without `check:section-columns`, which does not exist yet). Expected: all green, with e2e at 114 passed (110 + 4).

- [ ] **Step 8: Commit, then bump.**

```bash
git add src/components/templates/NavyProfessionalShowcase.jsx src/components/templates/ModernOrangeShowcase.jsx e2e/direct-edit.spec.js changes.md todo.md
git commit -m "Give Navy and Modern Orange sidebar sections a Direct Edit pencil

SidebarBlock rendered no data-export-section, so the overlay, which finds
sections by that attribute, never offered a pencil for Navy's Skills and
Languages or Modern Orange's Skills, Languages and Education. It now takes
an optional id; the contact and personal-info blocks pass none and stay
untagged. The PDF export test guards the change rather than new behaviour
and passes before and after."
npm version patch --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 1.2.53"
```

---

### Task 2: The column rules module and its check script (unit 2, part 1)

**Files:**
- Create: `src/utils/sectionColumns.js`
- Create: `scripts/check-section-columns.mjs`
- Modify: `package.json` (scripts)

**Interfaces:**
- Consumes: `getCvTemplate(templateId, locale)` from `src/utils/cvTemplates.js`, which returns a localized config with `id`, `layout`, `primarySections`, `secondarySections` and, once flagged, `columnMoves`.
- Produces (exact exports):
  - `MOVABLE_TO_SIDEBAR: readonly string[]`
  - `canMoveSection(baseTemplateConfig, sectionKey): boolean`
  - `getSectionColumn(templateConfig, sectionKey): 'main' | 'sidebar' | null`
  - `setSectionColumn(overridesByTemplate, baseTemplateConfig, sectionKey, column): object`, which returns the next whole map
  - `getEffectiveTemplateConfig(baseTemplateConfig, overridesByTemplate): object`, the config plus `defaultSecondarySections: string[]` and `baseConfig: object`
  - `getEffectiveCvTemplate(templateId, locale, formData): object`

- [ ] **Step 1: Write the failing check script** at `scripts/check-section-columns.mjs`:

```js
// Regression checks for src/utils/sectionColumns.js — the rules for moving
// a section between a two-column template's main column and sidebar.
// Framework-free, run directly:
//
//   node scripts/check-section-columns.mjs

import { registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
        return nextResolve(`${specifier}.js`, context)
      }
      throw error
    }
  },
})

const srcDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '../src')
const importSrc = (relativePath) => import(pathToFileURL(resolvePath(srcDir, relativePath)).href)

const columns = await importSrc('utils/sectionColumns.js')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

// Fixtures, not the real registry: these checks pin the RULES, and must not
// start failing because a real template's section lists were edited.
const split = {
  id: 'fixtureSplit',
  layout: 'split',
  columnMoves: true,
  primarySections: ['about', 'experience', 'projects', 'education'],
  secondarySections: ['skills', 'links', 'languages'],
}
const unflagged = { ...split, id: 'fixtureUnflagged', columnMoves: undefined }
const stacked = { ...split, id: 'fixtureStacked', layout: 'stacked', secondarySections: [] }

console.log('\nsectionColumns: canMoveSection\n')
check('a sidebar section can move to main', columns.canMoveSection(split, 'skills') === true)
check('a proven main section can move to the sidebar', columns.canMoveSection(split, 'education') === true)
check('projects is in the proven set', columns.canMoveSection(split, 'projects') === true)
check('experience cannot move', columns.canMoveSection(split, 'experience') === false)
check('about cannot move', columns.canMoveSection(split, 'about') === false)
check('a section the template does not support cannot move', columns.canMoveSection(split, 'interests') === false)
check('nothing moves on an unflagged template', columns.canMoveSection(unflagged, 'skills') === false)
check('nothing moves on a stacked template', columns.canMoveSection(stacked, 'education') === false)

console.log('\nsectionColumns: setSectionColumn\n')
{
  const moved = columns.setSectionColumn({}, split, 'skills', 'main')
  check('moving away from home stores an override',
    JSON.stringify(moved) === JSON.stringify({ fixtureSplit: { skills: 'main' } }), JSON.stringify(moved))

  const back = columns.setSectionColumn(moved, split, 'skills', 'sidebar')
  check('moving home deletes the entry and the empty template map',
    JSON.stringify(back) === '{}', JSON.stringify(back))

  const other = { otherTemplate: { links: 'main' } }
  const kept = columns.setSectionColumn(other, split, 'education', 'sidebar')
  check('other templates\' overrides are kept',
    JSON.stringify(kept) === JSON.stringify({ otherTemplate: { links: 'main' }, fixtureSplit: { education: 'sidebar' } }),
    JSON.stringify(kept))

  check('a non-object map is treated as empty',
    JSON.stringify(columns.setSectionColumn(null, split, 'skills', 'main')) === JSON.stringify({ fixtureSplit: { skills: 'main' } }))
}

console.log('\nsectionColumns: getEffectiveTemplateConfig\n')
{
  const none = columns.getEffectiveTemplateConfig(split, {})
  check('no overrides keeps both columns',
    JSON.stringify(none.primarySections) === JSON.stringify(split.primarySections) &&
    JSON.stringify(none.secondarySections) === JSON.stringify(split.secondarySections))
  check('defaultSecondarySections is always attached',
    JSON.stringify(none.defaultSecondarySections) === JSON.stringify(split.secondarySections))
  check('baseConfig points at the input', none.baseConfig === split)

  const moved = columns.getEffectiveTemplateConfig(split, { fixtureSplit: { skills: 'main', education: 'sidebar' } })
  check('skills moves to main, keeping combined relative order',
    JSON.stringify(moved.primarySections) === JSON.stringify(['about', 'experience', 'projects', 'skills']),
    JSON.stringify(moved.primarySections))
  check('education moves to the sidebar, keeping combined relative order',
    JSON.stringify(moved.secondarySections) === JSON.stringify(['education', 'links', 'languages']),
    JSON.stringify(moved.secondarySections))
  check('the base config is not mutated',
    JSON.stringify(split.primarySections) === JSON.stringify(['about', 'experience', 'projects', 'education']))

  const junk = columns.getEffectiveTemplateConfig(split, {
    fixtureSplit: { experience: 'sidebar', interests: 'main', skills: 'left', links: 'main' },
  })
  check('disallowed, unsupported and invalid entries are ignored; valid ones apply',
    JSON.stringify(junk.primarySections) === JSON.stringify(['about', 'experience', 'projects', 'education', 'links']) &&
    JSON.stringify(junk.secondarySections) === JSON.stringify(['skills', 'languages']),
    `${JSON.stringify(junk.primarySections)} / ${JSON.stringify(junk.secondarySections)}`)

  const foreign = columns.getEffectiveTemplateConfig(split, { someOtherTemplate: { skills: 'main' } })
  check('another template\'s overrides are ignored',
    JSON.stringify(foreign.secondarySections) === JSON.stringify(split.secondarySections))

  const off = columns.getEffectiveTemplateConfig(unflagged, { fixtureUnflagged: { skills: 'main' } })
  check('overrides are ignored while a template is unflagged',
    JSON.stringify(off.secondarySections) === JSON.stringify(split.secondarySections))

  check('a malformed overrides value is ignored',
    JSON.stringify(columns.getEffectiveTemplateConfig(split, 'nope').secondarySections) === JSON.stringify(split.secondarySections))
}

console.log('\nsectionColumns: getSectionColumn\n')
{
  const moved = columns.getEffectiveTemplateConfig(split, { fixtureSplit: { skills: 'main' } })
  check('reports main for a moved section', columns.getSectionColumn(moved, 'skills') === 'main')
  check('reports sidebar for a sidebar section', columns.getSectionColumn(moved, 'links') === 'sidebar')
  check('reports null for an unsupported section', columns.getSectionColumn(moved, 'interests') === null)
}

console.log(failures === 0 ? '\nAll section-columns checks passed.' : `\n${failures} section-columns check(s) FAILED.`)
process.exit(failures === 0 ? 0 : 1)
```

Add the script to `package.json` after `check:section-schema`:

```json
    "check:section-columns": "node scripts/check-section-columns.mjs",
```

- [ ] **Step 2: Run it and watch it fail.**

Run: `npm run check:section-columns`
Expected: a crash with `ERR_MODULE_NOT_FOUND` for `utils/sectionColumns.js`.

- [ ] **Step 3: Write the module** at `src/utils/sectionColumns.js`:

```js
// Rules for moving a section between a two-column template's main column
// and its sidebar. Column placement is template config
// (primarySections/secondarySections); the user's moves are stored as
// per-template OVERRIDES in formData.sectionColumnsByTemplate and folded
// back into a config here, so every consumer that already reads those two
// arrays follows a move with no change of its own.
//
// Design: docs/superpowers/specs/2026-09-27-section-column-moves-design.md

import { getCvTemplate } from './cvTemplates'

// A section may go into a sidebar only if some template already designs
// it for one: the union of every template's secondarySections. Long
// narrative sections (about, experience, …) stay in main: cramped in a
// ~250px rail, and the PDF exporter picks page breaks from the main
// column only.
export const MOVABLE_TO_SIDEBAR = Object.freeze([
  'skills',
  'links',
  'certificates',
  'education',
  'languages',
  'interests',
  'coreStrengths',
  'memberships',
  'achievements',
  'projects',
])

const COLUMNS = new Set(['main', 'sidebar'])

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function homeColumn(baseTemplateConfig, sectionKey) {
  return baseTemplateConfig.secondarySections.includes(sectionKey) ? 'sidebar' : 'main'
}

export function canMoveSection(baseTemplateConfig, sectionKey) {
  if (baseTemplateConfig?.layout !== 'split' || baseTemplateConfig.columnMoves !== true) {
    return false
  }

  const supported =
    baseTemplateConfig.primarySections.includes(sectionKey) ||
    baseTemplateConfig.secondarySections.includes(sectionKey)

  if (!supported) {
    return false
  }

  return homeColumn(baseTemplateConfig, sectionKey) === 'sidebar' || MOVABLE_TO_SIDEBAR.includes(sectionKey)
}

export function getSectionColumn(templateConfig, sectionKey) {
  if (templateConfig.primarySections.includes(sectionKey)) {
    return 'main'
  }

  return templateConfig.secondarySections.includes(sectionKey) ? 'sidebar' : null
}

// Returns the next WHOLE map. Choosing a section's home column deletes its
// entry rather than storing a value equal to the default, so a move and
// its reverse leave formData exactly as it was and share links never
// carry no-op entries.
export function setSectionColumn(overridesByTemplate, baseTemplateConfig, sectionKey, column) {
  const all = isPlainObject(overridesByTemplate) ? overridesByTemplate : {}
  const current = { ...(isPlainObject(all[baseTemplateConfig.id]) ? all[baseTemplateConfig.id] : {}) }

  if (column === homeColumn(baseTemplateConfig, sectionKey)) {
    delete current[sectionKey]
  } else {
    current[sectionKey] = column
  }

  const next = { ...all }

  if (Object.keys(current).length > 0) {
    next[baseTemplateConfig.id] = current
  } else {
    delete next[baseTemplateConfig.id]
  }

  return next
}

// Invalid, stale or foreign entries are ignored here rather than rejected
// at import, so a rule changing later can never make an old JSON file or
// share link unreadable, and can never corrupt a template.
export function getEffectiveTemplateConfig(baseTemplateConfig, overridesByTemplate) {
  const overrides = isPlainObject(overridesByTemplate) ? overridesByTemplate[baseTemplateConfig.id] : null
  const combined = [...baseTemplateConfig.primarySections, ...baseTemplateConfig.secondarySections]

  const columnOf = (sectionKey) => {
    const requested = isPlainObject(overrides) ? overrides[sectionKey] : undefined

    return COLUMNS.has(requested) && canMoveSection(baseTemplateConfig, sectionKey)
      ? requested
      : homeColumn(baseTemplateConfig, sectionKey)
  }

  return {
    ...baseTemplateConfig,
    primarySections: combined.filter((key) => columnOf(key) === 'main'),
    secondarySections: combined.filter((key) => columnOf(key) === 'sidebar'),
    // Showcases route a section through its HOME renderer (the column the
    // template designed it for) whichever column it lands in.
    defaultSecondarySections: baseTemplateConfig.secondarySections,
    // The popup needs the unmodified config to evaluate the rules above.
    baseConfig: baseTemplateConfig,
  }
}

// The one call every template resolver uses, so a move is seen by the
// preview, both builder modes, ATS mode and every exporter alike.
export function getEffectiveCvTemplate(templateId, locale, formData) {
  return getEffectiveTemplateConfig(getCvTemplate(templateId, locale), formData?.sectionColumnsByTemplate)
}
```

- [ ] **Step 4: Run it and watch it pass.**

Run: `npm run check:section-columns`
Expected: every line `ok`, ending `All section-columns checks passed.`

- [ ] **Step 5: Commit** (the bump comes at the end of Task 3, which completes unit 2).

```bash
git add src/utils/sectionColumns.js scripts/check-section-columns.mjs package.json
git commit -m "Add the section-column rules module and its check script

Pure helpers for moving a section between a two-column template's main
column and sidebar: which sections may move, the next override map for
a move, and a template config with the overrides folded in. No caller
yet, so no visible change."
```

---

### Task 3: Plumbing and persistence (unit 2, part 2, v1.2.54)

**Files:**
- Modify: `src/utils/cvForm.js`: `createInitialCvData` (~line 314), `demoCvData` (~line 351), `parseImportedCvData` (~lines 972-990, 1370-1392)
- Modify: `src/types/cv.d.ts` (`CvData`)
- Modify: `src/utils/shareLinks.js` (encode near `data.pv`, `expandCurrentPayload`)
- Modify: `scripts/check-share-links.mjs`, `scripts/check-section-columns.mjs`
- Modify: `src/pages/ResumeBuilderPage.jsx:427-430`, `src/components/CVPreview.jsx:89`, `src/components/CVForm.jsx:92`, `src/utils/docxExport.js:504`, `src/utils/exporters.js:1716`

**Interfaces:**
- Consumes: `getEffectiveCvTemplate(templateId, locale, formData)` from Task 2.
- Produces: `formData.sectionColumnsByTemplate` exists on every CV (default `{}`), survives JSON import and share links, and every template resolver returns the effective config, which includes `defaultSecondarySections` and `baseConfig`.

- [ ] **Step 1: Write the failing checks.** In `scripts/check-share-links.mjs`, directly before the `for (const [label, value] of [` rejection loop, add:

```js
// sectionColumnsByTemplate travels under its own short key ('sc').
const withColumns = parseImportedCvData({
  ...structuredClone(demoCvData),
  sectionColumnsByTemplate: { creative: { skills: 'main' }, developer: { education: 'main' } },
})
const columnsBack = share.decodeCvStateFromUrl(share.encodeCvStateForUrl(withColumns))
check('sectionColumnsByTemplate survives the round trip',
  JSON.stringify(columnsBack.sectionColumnsByTemplate) === JSON.stringify(withColumns.sectionColumnsByTemplate),
  JSON.stringify(columnsBack.sectionColumnsByTemplate))
check('an empty sectionColumnsByTemplate adds nothing to the payload',
  share.encodeCvStateForUrl(demo) === demoEncoded)
```

In `scripts/check-section-columns.mjs`, before the final `console.log(failures === 0 …`, add:

```js
console.log('\nsectionColumns: JSON import\n')
{
  const { parseImportedCvData, createInitialCvData } = await importSrc('utils/cvForm.js')

  check('a fresh CV defaults to an empty map',
    JSON.stringify(createInitialCvData().sectionColumnsByTemplate) === '{}')

  const imported = parseImportedCvData({
    ...createInitialCvData(),
    sectionColumnsByTemplate: { creative: { skills: 'main' } },
  })
  check('a valid map imports unchanged',
    JSON.stringify(imported.sectionColumnsByTemplate) === JSON.stringify({ creative: { skills: 'main' } }))

  const { sectionColumnsByTemplate: _omit, ...legacy } = createInitialCvData()
  check('a file without the field imports as an empty map',
    JSON.stringify(parseImportedCvData(legacy).sectionColumnsByTemplate) === '{}')

  for (const [label, value] of [
    ['a non-object map', 'main'],
    ['a non-object template entry', { creative: 'main' }],
    ['an unknown column value', { creative: { skills: 'left' } }],
  ]) {
    let message = null
    try {
      parseImportedCvData({ ...createInitialCvData(), sectionColumnsByTemplate: value })
    } catch (error) {
      message = error.message
    }
    check(`import rejects ${label}`, Boolean(message), 'no error was thrown')
  }
}
```

- [ ] **Step 2: Run both and watch them fail.**

Run: `npm run check:share; npm run check:section-columns`
Expected:
- `check:share`: `FAIL  sectionColumnsByTemplate survives the round trip`. The parser rejects the unknown key, so `parseImportedCvData` throws `Imported CV JSON contains unsupported field(s)` or similar, which is also a valid red.
- `check:section-columns`: `FAIL  a fresh CV defaults to an empty map`.

- [ ] **Step 3: Add the field to `cvForm.js`.**

(a) In `createInitialCvData`, after `photoVisibilityByTemplate: createTemplatePhotoVisibility(),`:

```js
  sectionColumnsByTemplate: {},
```

(b) In `demoCvData`, after its `photoVisibilityByTemplate: createTemplatePhotoVisibility(),`, add the same line.

(c) In `parseImportedCvData`, after the `const photoVisibilityByTemplate =` statement:

```js
  const sectionColumnsByTemplate = value.sectionColumnsByTemplate ?? {}
```

(d) In the `validateAllowedKeys(value, [ … ])` list, after `'photoVisibilityByTemplate',`:

```js
      'sectionColumnsByTemplate',
```

(e) After the `photoVisibilityByTemplate` validation block (the `Object.entries(photoVisibilityByTemplate).forEach(…)` that throws `must be true or false`):

```js
  // Shape only. Whether a given move is still ALLOWED is decided at render
  // time (sectionColumns.js ignores stale entries), so a rule changing
  // later never makes an old file un-importable.
  if (!isPlainObject(sectionColumnsByTemplate)) {
    throw new Error('sectionColumnsByTemplate must be an object.')
  }

  Object.entries(sectionColumnsByTemplate).forEach(([templateId, columns]) => {
    if (!isPlainObject(columns)) {
      throw new Error(`sectionColumnsByTemplate.${templateId} must be an object.`)
    }

    Object.entries(columns).forEach(([sectionKey, column]) => {
      if (column !== 'main' && column !== 'sidebar') {
        throw new Error(`sectionColumnsByTemplate.${templateId}.${sectionKey} must be "main" or "sidebar".`)
      }
    })
  })
```

(f) In the returned object, after the `photoVisibilityByTemplate: { … },` block:

```js
    sectionColumnsByTemplate: Object.fromEntries(
      Object.entries(sectionColumnsByTemplate).map(([templateId, columns]) => [templateId, { ...columns }]),
    ),
```

- [ ] **Step 4: Add the typedef.** In `src/types/cv.d.ts`, inside `export interface CvData`, after the `photoVisibilityByTemplate` line:

```ts
  /** Per template id, the sections the user moved out of their home column. Overrides only. */
  sectionColumnsByTemplate: Record<string, Record<string, 'main' | 'sidebar'>>
```

- [ ] **Step 5: Add the `sc` share key.** In `src/utils/shareLinks.js`, after the `photoVisibilityByTemplate` encode block (`data.pv = hiddenPhotos`):

```js
  if (isPlainObject(formData.sectionColumnsByTemplate)) {
    const moved = Object.fromEntries(
      Object.entries(formData.sectionColumnsByTemplate).filter(
        ([, columns]) => isPlainObject(columns) && Object.keys(columns).length > 0,
      ),
    )

    if (Object.keys(moved).length > 0) {
      data.sc = moved
    }
  }
```

In `expandCurrentPayload`, after the `data.pv` block:

```js
  if (data.sc !== undefined) {
    formData.sectionColumnsByTemplate = data.sc
  }
```

- [ ] **Step 6: Run both checks and watch them pass.**

Run: `npm run check:share && npm run check:section-columns`
Expected: all `ok`.

- [ ] **Step 7: Switch the five resolvers to the effective config.** At each site, import `getEffectiveCvTemplate` from `'../utils/sectionColumns'` (or `'./sectionColumns'` from `src/utils`), and drop the `getCvTemplate` import where it becomes unused.

`src/pages/ResumeBuilderPage.jsx:427-430`:

```js
  const currentTemplate = useMemo(
    () => getEffectiveCvTemplate(selectedTemplate, locale, formData),
    // Only the overrides matter here, not every keystroke in formData.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, selectedTemplate, formData.sectionColumnsByTemplate],
  )
```

Leave `ResumeBuilderPage.jsx:716` (`getCvTemplate(selectedTemplate, locale).variant`) as is, because the variant never changes with column moves. `getCvTemplate` stays imported there.

`src/components/CVPreview.jsx:89`:

```js
  const templateConfig = useMemo(
    () => getEffectiveCvTemplate(template, locale, formData),
    // Only the overrides matter here, not every keystroke in formData.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, template, formData.sectionColumnsByTemplate],
  )
```

`src/components/CVForm.jsx:92`:

```js
  const templateConfig = getEffectiveCvTemplate(selectedTemplate, locale, formData)
```

(CVForm receives `formData` as a prop; confirm the name with `grep -n "formData" src/components/CVForm.jsx | head -3`.)

`src/utils/docxExport.js:504`:

```js
  const templateConfig = getEffectiveCvTemplate(template, 'en', formData)
```

(The old call `getCvTemplate(template)` used the default locale `'en'`; only section lists are read here, so the locale is irrelevant.)

`src/utils/exporters.js:1716`:

```js
  const templateConfig = getEffectiveCvTemplate(templateId, 'en', formData)
```

(Same reasoning. Confirm `formData` is the in-scope name with `sed -n 1700,1716p src/utils/exporters.js`.)

If lint's `react-hooks/exhaustive-deps` rule is not configured and the disable comment is reported as unused, drop the comment. Run `npm run lint` to find out.

- [ ] **Step 8: Verify session restore needs nothing.** Run: `grep -n "parseImportedCvData\|SESSION" src/utils/cvForm.js src/pages/ResumeBuilderPage.jsx | head`. Confirm that session restore serialises the whole formData object and reads it back through `parseImportedCvData`, which now accepts the field. Record the finding in the commit message. If restore instead picks fields by name, add `sectionColumnsByTemplate` to that list and say so.

- [ ] **Step 9: Run the full verification suite.** Expected: all green, e2e unchanged at 114, because no template is flagged yet.

- [ ] **Step 10: Record, commit, bump.** `changes.md` entry "Section column moves: the data model and plumbing (no visible change yet) — 2026-09-27". Explain the override map, the five resolver sites, `sc`, and that nothing is flagged yet.

```bash
git add src/utils/cvForm.js src/types/cv.d.ts src/utils/shareLinks.js scripts/check-share-links.mjs scripts/check-section-columns.mjs src/pages/ResumeBuilderPage.jsx src/components/CVPreview.jsx src/components/CVForm.jsx src/utils/docxExport.js src/utils/exporters.js changes.md
git commit -m "Carry section-column overrides through formData, JSON and share links

Adds formData.sectionColumnsByTemplate (overrides only, default empty),
validates its shape on import, and carries it in share links under the
new short key sc. Every template resolver - the builder, CVPreview,
CVForm and both exporters - now asks getEffectiveCvTemplate, so a move
will be seen everywhere at once. No template opts in yet, so nothing
changes visibly."
npm version patch --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 1.2.54"
```

---

### Task 4: The popup control and Creative, end to end (unit 3, v1.2.55)

**Files:**
- Modify: `src/components/SectionEditorPopup.jsx` (imports; new row after `direct-edit-popup__header`)
- Modify: `src/styles/direct-edit-popup.css`
- Modify: `src/components/templates/CreativeShowcase.jsx` (`Section` ~line 124; `renderMainSection` ~213; `renderSidebarSection` ~314; layout ~534-538)
- Modify: `src/styles/templates/creative.css`
- Modify: `src/utils/cvTemplates.js` (`creative` entry)
- Test: `e2e/direct-edit.spec.js`

**Interfaces:**
- Consumes: `canMoveSection`, `getSectionColumn`, `setSectionColumn` (Task 2); `templateConfig.baseConfig` and `templateConfig.defaultSecondarySections` (Task 3).
- Produces:
  - The popup row `.direct-edit-popup__columns`, with two `button.direct-edit-popup__column-option[data-column="main"|"sidebar"]` using `aria-pressed`.
  - The per-template convention used by Tasks 5-9: the renderers take `(key, placement, movedFrom)`; the section wrapper renders `data-export-placement={placement}` and `data-moved-from={movedFrom ?? undefined}`; a `renderSection(key, placement)` router.
  - The e2e helpers `COLUMN_MOVE_TEMPLATES` and `sectionColumnState(page, key)`.

- [ ] **Step 1: Write the failing tests.** Add at file scope in `e2e/direct-edit.spec.js`, after `popupGeometry`:

```js
// Templates that have opted into section column moves (cvTemplates.js
// `columnMoves: true`). The sweep test below walks every one of them;
// each template's rollout task appends its label here.
const COLUMN_MOVE_TEMPLATES = ['Creative']

// Where a section currently renders: inside the sidebar container
// (every two-column template marks it data-export-secondary) or not,
// plus the placement the PDF exporter will read.
async function sectionColumnState(page, sectionKey) {
  return page.evaluate((key) => {
    const section = document.querySelector(`.direct-edit-preview [data-export-section="${key}"]`)

    if (!section) {
      return null
    }

    return {
      inSidebar: Boolean(section.closest('[data-export-secondary]')),
      placement: section.getAttribute('data-export-placement'),
      movedFrom: section.getAttribute('data-moved-from'),
      height: section.getBoundingClientRect().height,
    }
  }, sectionKey)
}

// Opens a section's popup through its keyboard trigger, which exists for
// every section whether or not a pointer can reach it.
async function openSectionPopup(page, sectionKey) {
  await page.locator(`[data-direct-edit-trigger="${sectionKey}"]`).evaluate((button) => button.click())
  await expect(page.locator('.direct-edit-popup')).toBeVisible()
}
```

Then add these tests inside `test.describe('Direct Edit builder', …)`:

```js
  test('Creative: Skills moves to the main column from the popup and back', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Creative')

    expect(await sectionColumnState(page, 'skills')).toMatchObject({ inSidebar: true, placement: 'side' })

    await openSectionPopup(page, 'skills')
    const group = page.getByRole('group', { name: 'Column' })
    await expect(group.getByRole('button', { name: 'Sidebar' })).toHaveAttribute('aria-pressed', 'true')

    await group.getByRole('button', { name: 'Main' }).click()
    await expect(group.getByRole('button', { name: 'Main' })).toHaveAttribute('aria-pressed', 'true')
    await expect(group.getByRole('button', { name: 'Main' })).toBeFocused()
    expect(await sectionColumnState(page, 'skills')).toMatchObject({
      inSidebar: false,
      placement: 'main',
      movedFrom: 'side',
    })

    // The popup stays open on the moved section.
    await expect(page.locator('.direct-edit-popup')).toBeVisible()

    await group.getByRole('button', { name: 'Sidebar' }).click()
    expect(await sectionColumnState(page, 'skills')).toMatchObject({
      inSidebar: true,
      placement: 'side',
      movedFrom: null,
    })
  })

  test('Creative: section ↑/↓ follow a moved section into its new column', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Creative')

    await openSectionPopup(page, 'skills')
    await page.getByRole('group', { name: 'Column' }).getByRole('button', { name: 'Main' }).click()

    // The global sectionOrder puts skills after experience and before
    // projects (CV_SECTION_ORDER_KEYS in cvForm.js), so in Creative's main
    // column it lands between them. Moving it up must swap it with
    // experience, a MAIN-column neighbour, not with a sidebar section.
    const mainOrder = () =>
      page.evaluate(() =>
        Array.from(
          document.querySelectorAll('.direct-edit-preview [data-export-primary] [data-export-section]'),
          (el) => el.getAttribute('data-export-section'),
        ),
      )
    expect(await mainOrder()).toEqual(['about', 'experience', 'skills', 'projects'])

    await page.locator('.direct-edit-popup__move-up').click()
    expect(await mainOrder()).toEqual(['about', 'skills', 'experience', 'projects'])
  })

  test('Creative: a column move survives switching to Classic and back', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Creative')

    await openSectionPopup(page, 'education')
    await page.getByRole('group', { name: 'Column' }).getByRole('button', { name: 'Main' }).click()
    await page.keyboard.press('Escape')

    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    expect(await sectionColumnState(page, 'education')).toMatchObject({ inSidebar: false, placement: 'main' })
  })

  test('Creative: PDF export succeeds with a section moved to the main column', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Creative')

    await openSectionPopup(page, 'skills')
    await page.getByRole('group', { name: 'Column' }).getByRole('button', { name: 'Main' }).click()
    await page.keyboard.press('Escape')

    await exportPdfAndExpectSuccess(page)
  })

  test('no column control for sections that cannot move', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Creative')

    await openSectionPopup(page, 'experience')
    await expect(page.getByRole('group', { name: 'Column' })).toHaveCount(0)
    await page.keyboard.press('Escape')

    await selectTemplate(page, 'Minimalist')
    await openSectionPopup(page, 'skills')
    await expect(page.getByRole('group', { name: 'Column' })).toHaveCount(0)
  })


  // Walks every opted-in template and every section its popup offers to
  // move, in both directions. The contrast check is the automated guard
  // against the one thing reusing home markup can get wrong: text styled
  // for one column's surface landing unreadable on the other's.
  test('every opted-in template moves each movable section into a readable column', async ({ page }) => {
    test.setTimeout(240_000)
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    for (const label of COLUMN_MOVE_TEMPLATES) {
      await selectTemplate(page, label)
      const keys = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[data-direct-edit-trigger]'), (b) => b.dataset.directEditTrigger),
      )
      let movedAny = false

      for (const key of keys) {
        await openSectionPopup(page, key)
        const group = page.locator('.direct-edit-popup__columns')

        if ((await group.count()) === 0) {
          await page.keyboard.press('Escape')
          continue
        }

        movedAny = true
        const before = await sectionColumnState(page, key)
        const target = before.inSidebar ? 'main' : 'sidebar'
        await group.locator(`[data-column="${target}"]`).click()

        const after = await sectionColumnState(page, key)
        const where = `${label} / ${key} -> ${target}`
        expect(after.inSidebar, `${where}: container`).toBe(target === 'sidebar')
        expect(after.placement, `${where}: placement`).toBe(target === 'sidebar' ? 'side' : 'main')
        expect(after.height, `${where}: height`).toBeGreaterThan(0)

        const contrast = await page.evaluate((sectionKey) => {
          const section = document.querySelector(`.direct-edit-preview [data-export-section="${sectionKey}"]`)
          const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => (node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
          })
          const textElement = walker.nextNode()?.parentElement

          if (!textElement) {
            return null
          }

          const parse = (value) => {
            const parts = value.match(/[\d.]+/g).map(Number)
            return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 }
          }
          const backgroundOf = (element) => {
            for (let node = element; node; node = node.parentElement) {
              const style = getComputedStyle(node)
              const gradient = style.backgroundImage.includes('gradient')
                ? style.backgroundImage.match(/rgba?\([^)]+\)/)
                : null

              if (gradient) {
                return parse(gradient[0])
              }

              const color = parse(style.backgroundColor)

              if (color.a >= 0.9) {
                return color
              }
            }

            return { r: 255, g: 255, b: 255, a: 1 }
          }
          const luminance = ({ r, g, b }) => {
            const channel = (v) => {
              const c = v / 255
              return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
            }
            return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
          }
          const fg = luminance(parse(getComputedStyle(textElement).color))
          const bg = luminance(backgroundOf(textElement))

          return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)
        }, key)

        expect(contrast, `${where}: text contrast`).toBeGreaterThanOrEqual(3)

        // Put it back so the next section starts from the template default.
        await group.locator(`[data-column="${before.inSidebar ? 'sidebar' : 'main'}"]`).click()
        await page.keyboard.press('Escape')
      }

      expect(movedAny, `${label}: offered at least one move`).toBe(true)
    }
  })
```

Add a separate `describe` at the end of the file for the Finnish labels. It seeds the UI locale (`UI_LOCALE_STORAGE_KEY` is `'ui-locale'` in `src/utils/designSystem.js`) before the page loads, and uses the Finnish UI labels verified in `Toolbar.jsx`, `TemplateGalleryModal.jsx` and `ResumeBuilderPage.jsx`:

```js
test.describe('Direct Edit column control in Finnish', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ui-locale', 'fi'))
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Lataa demo-CV' }).first().click()
  })

  test('the column control is labelled in Finnish', async ({ page }) => {
    await page.getByRole('tab', { name: 'Suora muokkaus' }).click()
    await page.getByRole('button', { name: /^Valitse pohja:/ }).click()
    await page.getByRole('dialog', { name: 'Pohjagalleria' }).getByText('Luova', { exact: true }).click()

    await openSectionPopup(page, 'skills')
    const group = page.getByRole('group', { name: 'Sarake' })
    await expect(group.getByRole('button', { name: 'Pääsarake' })).toBeVisible()
    await expect(group.getByRole('button', { name: 'Sivupalkki' })).toHaveAttribute('aria-pressed', 'true')
  })
})
```

`'Luova'` is Creative's Finnish label (`cvTemplates.js`). If the gallery shows the localized label under a different element, match it the way `selectTemplate` matches the English one.

- [ ] **Step 2: Run them and watch them fail.**

Run: `npm run build && npx playwright test e2e/direct-edit.spec.js -g "Creative:|no column control|column control is labelled|every opted-in template" --reporter=line`
Expected:
- The Creative tests and the sweep fail on the `Column` group locator (not found) or on `movedAny` being false.
- `no column control…` **passes**, because no control exists yet. That is correct: it guards against the control appearing where it must not, so note that it cannot go red here.

- [ ] **Step 3: Add the popup control.** In `src/components/SectionEditorPopup.jsx`, add an import:

```js
import { canMoveSection, getSectionColumn, setSectionColumn } from '../utils/sectionColumns'
```

After the `canMoveDown` declaration, add:

```js
  // Moving between columns is decided against the template's UNMODIFIED
  // config (see sectionColumns.js); templateConfig here is the effective
  // one, which carries it as baseConfig.
  const baseTemplateConfig = templateConfig.baseConfig ?? templateConfig
  const showColumnControl = isOrderableSection && canMoveSection(baseTemplateConfig, sectionKey)
  const currentColumn = getSectionColumn(templateConfig, sectionKey)

  const moveToColumn = (column) => {
    if (column === currentColumn) {
      return
    }

    dispatchFormData({
      type: FORM_ACTION.SET_ROOT_FIELD,
      field: 'sectionColumnsByTemplate',
      value: setSectionColumn(formData.sectionColumnsByTemplate, baseTemplateConfig, sectionKey, column),
    })
  }
```

In the returned JSX, directly after the closing `</div>` of `direct-edit-popup__header` and before `<div className="direct-edit-popup__body">`:

```jsx
      {/* Hidden rather than disabled where a section cannot move: on the 7
          single-column templates (and Quadrant's fixed grid) that would be
          a dead control on every section. Main/Sidebar, never left/right — sidebars sit on
          different sides in different templates. */}
      {showColumnControl ? (
        <div
          className="direct-edit-popup__columns"
          role="group"
          aria-label={isFinnish ? 'Sarake' : 'Column'}
        >
          <span className="direct-edit-popup__columns-label" aria-hidden="true">
            {isFinnish ? 'Sarake' : 'Column'}
          </span>
          {[
            ['main', 'Main', 'Pääsarake'],
            ['sidebar', 'Sidebar', 'Sivupalkki'],
          ].map(([column, labelEn, labelFi]) => (
            <button
              key={column}
              type="button"
              className="direct-edit-popup__column-option"
              data-column={column}
              aria-pressed={currentColumn === column}
              onClick={() => moveToColumn(column)}
            >
              {isFinnish ? labelFi : labelEn}
            </button>
          ))}
        </div>
      ) : null}
```

In `src/styles/direct-edit-popup.css`, after the `.direct-edit-popup__section-controls button:disabled` rule:

```css
/* Column control: a two-option segmented row under the header, showing
   where the section lives now as well as offering the move. */
.direct-edit-popup__columns {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--color-border, #d4d4d8);
}

.direct-edit-popup__columns-label {
  margin-right: auto;
  font-size: 11px;
  font-weight: 600;
  opacity: 0.7;
}

.direct-edit-popup__column-option {
  border: 1px solid var(--color-border, #d4d4d8);
  border-radius: 6px;
  background: none;
  padding: 0.2rem 0.55rem;
  font-size: 11px;
  cursor: pointer;
  color: inherit;
}

.direct-edit-popup__column-option[aria-pressed='true'] {
  border-color: var(--color-accent, #2563eb);
  background: var(--color-accent, #2563eb);
  color: #ffffff;
}
```

- [ ] **Step 4: Route Creative through home renderers.** In `CreativeShowcase.jsx`:

(a) `Section` (around line 124):

```jsx
function Section({ id, placement, movedFrom = null, number, title, children }) {
  return (
    <section
      className="creative-showcase__section"
      data-export-section={id}
      data-export-placement={placement}
      data-moved-from={movedFrom ?? undefined}
    >
      <SectionHead number={number} title={title} />
      {children}
    </section>
  )
}
```

(b) Renderer signatures: `const renderMainSection = (key) => {` becomes `const renderMainSection = (key, placement = 'main', movedFrom = null) => {`, and `const renderSidebarSection = (key) => {` becomes `const renderSidebarSection = (key, placement = 'side', movedFrom = null) => {`.

(c) Every `placement="main"` and `placement="side"` literal becomes the parameter. There are exactly 9, all on `<Section` lines:

```bash
sed -i 's/placement="\(main\|side\)"/placement={placement} movedFrom={movedFrom}/' src/components/templates/CreativeShowcase.jsx
grep -c 'placement={placement} movedFrom={movedFrom}' src/components/templates/CreativeShowcase.jsx
```

Expected count: `9`.

(d) Add the router directly after `renderSidebarSection`'s closing `}`:

```jsx
  // A section always renders through its HOME renderer — the column the
  // template designed it for — even when the user moved it to the other
  // column. Placement comes from where it actually is (the PDF exporter
  // paginates by it); movedFrom is the CSS hook that adapts it.
  const homeSidebarSet = new Set(templateConfig.defaultSecondarySections ?? templateConfig.secondarySections)
  const renderSection = (key, placement) => {
    const homePlacement = homeSidebarSet.has(key) ? 'side' : 'main'
    const movedFrom = homePlacement === placement ? null : homePlacement

    return homePlacement === 'side'
      ? renderSidebarSection(key, placement, movedFrom)
      : renderMainSection(key, placement, movedFrom)
  }
```

(e) The layout (around lines 534-538): `{mainSectionKeys.map((key) => renderMainSection(key))}` becomes `{mainSectionKeys.map((key) => renderSection(key, 'main'))}`, and `{sidebarSectionKeys.map((key) => renderSidebarSection(key))}` becomes `{sidebarSectionKeys.map((key) => renderSection(key, 'side'))}`.

(f) The flag: in `src/utils/cvTemplates.js`, add `columnMoves: true,` to the `creative` entry directly after `layout: 'split',`.

- [ ] **Step 5: Run the tests.**

Run: `npm run build && npx playwright test e2e/direct-edit.spec.js -g "Creative:|no column control|column control is labelled|every opted-in template" --reporter=line`
Expected: the Creative tests pass. The sweep either passes, or fails on a named `Creative / <key> -> <column>: text contrast` / `height` assertion, which is what Step 6 fixes.

- [ ] **Step 6: Adapt Creative's CSS, guided by the sweep and screenshots.** Start the dev server (`preview_start` with name `dev`), seed `localStorage.setItem('portifycv-builder-mode','classic')`, load the demo CV, switch to Direct Edit and Creative, and move each movable section both ways. Screenshot the result. For every mismatch the sweep names, or that is visible, add a rule scoped by the hook to the end of `src/styles/templates/creative.css`:

```css
/* ── Sections moved between columns (Direct Edit, sectionColumns.js) ──
   A moved section keeps its home column's markup; these rules adapt it
   to the surface it now sits on. Sidebar markup assumes the tan rail
   (--cr-sidebar); main markup assumes the cream page. */
.creative-showcase__main [data-moved-from='side'] {
  /* rules found in Step 6, e.g. spacing that assumed the rail's padding */
}

.creative-showcase__sidebar [data-moved-from='main'] {
  /* rules found in Step 6, e.g. a project card's width inside the rail */
}
```

Write only rules that fix an observed problem. If a block ends up empty, delete it, and say in the commit message that that direction needed no adaptation. Re-run the Step 5 command until everything passes.

- [ ] **Step 7: Run the full verification suite.** Expected: all green, e2e 121 (114 + 7).

- [ ] **Step 8: Record, commit, bump.** `changes.md` entry "Direct Edit: move a section between the main column and the sidebar (Creative first) — 2026-09-27". Cover the popup row, the home-renderer routing, `data-moved-from`, the `columnMoves` rollout flag, the contrast-checking sweep, and what the CSS block needed.

```bash
git add src/components/SectionEditorPopup.jsx src/styles/direct-edit-popup.css src/components/templates/CreativeShowcase.jsx src/styles/templates/creative.css src/utils/cvTemplates.js e2e/direct-edit.spec.js changes.md
git commit -m "Move sections between columns from the Direct Edit popup, on Creative first

The section popup gains a Main/Sidebar row wherever the section may move.
A moved section renders through its home renderer with its placement taken
from the column it actually sits in, so the PDF exporter paginates it
correctly, and a data-moved-from hook lets the template's CSS adapt it.
Creative is the first template to opt in via columnMoves; a sweep test
moves every movable section both ways and checks its text contrast."
npm version patch --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 1.2.55"
```

---

### Task 5: Modern Professional, Executive, Graduate (unit 4a, v1.2.56)

The same conversion as Creative in Task 4 Step 4, applied to three templates whose `Section` already takes `placement`. Do the templates one at a time and run the sweep after each.

**Files:**
- Modify: `src/components/templates/ModernShowcase.jsx`: `Section` line 77 (`{ id, placement, icon, title, children }`), renderers at 149 and 303, layout 479/483
- Modify: `src/components/templates/ExecutiveShowcase.jsx`: `Section` line 167 (`{ id, placement, title, children }`), renderers 266/443, layout 677/683
- Modify: `src/components/templates/GraduateShowcase.jsx`: `Section` line 55 (`{ id, placement, icon, title, children }`), renderers 139/395, layout 625/629
- Modify: `src/styles/templates/modern.css`, `executive.css`, `graduate.css`
- Modify: `src/utils/cvTemplates.js` (`modern`, `executive`, `graduate`)
- Test: `e2e/direct-edit.spec.js` (`COLUMN_MOVE_TEMPLATES`)

**Interfaces:**
- Consumes: the convention from Task 4, which is `renderSection(key, placement)`, renderers `(key, placement, movedFrom)`, and `data-moved-from` on the section wrapper.

- [ ] **Step 1: Write the failing test.** Change the constant to `const COLUMN_MOVE_TEMPLATES = ['Creative', 'Modern Professional', 'Executive', 'Graduate']`.

- [ ] **Step 2: Run the sweep and watch it fail.**

Run: `npm run build && npx playwright test e2e/direct-edit.spec.js -g "every opted-in template" --reporter=line`
Expected: FAIL at `Modern Professional: offered at least one move`, because no flag is set yet.

- [ ] **Step 3: Convert Modern Professional.** In `ModernShowcase.jsx`:

(a) Add `movedFrom = null` to `Section`'s props, and `data-moved-from={movedFrom ?? undefined}` to its `<section …>` element beside `data-export-placement={placement}`.

(b) `const renderMainSection = (key) => {` becomes `(key, placement = 'main', movedFrom = null) => {`, and `const renderSidebarSection = (key) => {` becomes `(key, placement = 'side', movedFrom = null) => {`.

(c) Replace the literals and check the count, which should be `10`:

```bash
sed -i 's/placement="\(main\|side\)"/placement={placement} movedFrom={movedFrom}/' src/components/templates/ModernShowcase.jsx
grep -c 'placement={placement} movedFrom={movedFrom}' src/components/templates/ModernShowcase.jsx
```

(d) Add the router after `renderSidebarSection`'s closing `}`:

```jsx
  // A section always renders through its HOME renderer — the column the
  // template designed it for — even when the user moved it to the other
  // column. Placement comes from where it actually is (the PDF exporter
  // paginates by it); movedFrom is the CSS hook that adapts it.
  const homeSidebarSet = new Set(templateConfig.defaultSecondarySections ?? templateConfig.secondarySections)
  const renderSection = (key, placement) => {
    const homePlacement = homeSidebarSet.has(key) ? 'side' : 'main'
    const movedFrom = homePlacement === placement ? null : homePlacement

    return homePlacement === 'side'
      ? renderSidebarSection(key, placement, movedFrom)
      : renderMainSection(key, placement, movedFrom)
  }
```

(e) Layout: `mainSectionKeys.map((key) => renderMainSection(key))` becomes `mainSectionKeys.map((key) => renderSection(key, 'main'))`, and `sidebarSectionKeys.map((key) => renderSidebarSection(key))` becomes `sidebarSectionKeys.map((key) => renderSection(key, 'side'))`.

Check the sidebar wrapper condition: line 482 renders the `<aside>` conditionally, so run `sed -n 476,486p src/components/templates/ModernShowcase.jsx`. If it is gated on `sidebarSectionKeys.length > 0`, that gate stays correct, because an emptied sidebar simply disappears. Say so in the commit.

(f) Add `columnMoves: true,` after `layout: 'split',` in the `modern` entry of `cvTemplates.js`.

(g) Run the sweep. Fix contrast/height failures with a scoped block at the end of `src/styles/templates/modern.css`, using the Task 4 Step 6 method: screenshots, rules only for observed problems, selectors `.modern-showcase__main [data-moved-from='side']` and `.modern-showcase__sidebar [data-moved-from='main']`, with the same header comment as Creative's naming this template's surfaces.

- [ ] **Step 4: Convert Executive.** Same sub-steps (a) to (g) in `ExecutiveShowcase.jsx`:
  - the literal count after `sed` must be `12`;
  - the layout lines are 677 (`sidebarSectionKeys.map((key) => renderSidebarSection(key))` becomes `renderSection(key, 'side')`) and 683 (`mainSectionKeys.map((key) => renderMainSection(key))` becomes `renderSection(key, 'main')`);
  - the flag goes on the `executive` entry;
  - the CSS selectors are `.executive-showcase__main [data-moved-from='side']` and `.executive-showcase__sidebar [data-moved-from='main']` in `executive.css`.

  Executive's experience entries are not movable (`experience` is not in the proven set), so the `--wired` entry rules in `executive.css` are unaffected.

- [ ] **Step 5: Convert Graduate.** Same sub-steps in `GraduateShowcase.jsx`:
  - the literal count must be `14`;
  - the layout lines are 625/629;
  - the flag goes on `graduate`;
  - the CSS goes in `graduate.css`, with selectors `.graduate-showcase__main [data-moved-from='side']` and `.graduate-showcase__sidebar [data-moved-from='main']`.

- [ ] **Step 6: Run the sweep and watch it pass.**

Run: `npm run build && npx playwright test e2e/direct-edit.spec.js -g "every opted-in template" --reporter=line`
Expected: PASS.

- [ ] **Step 7: Run the full verification suite, then record, commit and bump.** Add a `changes.md` entry naming the three templates and any CSS each needed.

```bash
git add src/components/templates/ModernShowcase.jsx src/components/templates/ExecutiveShowcase.jsx src/components/templates/GraduateShowcase.jsx src/styles/templates/modern.css src/styles/templates/executive.css src/styles/templates/graduate.css src/utils/cvTemplates.js e2e/direct-edit.spec.js changes.md
git commit -m "Open section column moves on Modern Professional, Executive and Graduate"
npm version patch --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 1.2.56"
```

The feature commit's body lists what each template's CSS block needed, or that it needed none.

---

### Task 6: Portfolio Hybrid, Tech Executive, Colorful Compact (unit 4b, v1.2.57)

**Files:**
- Modify: `src/components/templates/PortfolioShowcase.jsx`: `Section` line 84 (`{ id, placement, icon, title, subtitle, children }`), renderers 170/410, layout 618/622
- Modify: `src/components/templates/TechExecShowcase.jsx`: `Section` line 45 (`{ id, placement, title, children }`), renderers 123/224, layout 423/427
- Modify: `src/components/templates/ColorfulCompactShowcase.jsx`: `Section` line 64 (`{ id, placement, title, color, children }`), renderers 130/227 (these take `(key, color)`), layout 402/406-407
- Modify: `src/styles/templates/portfolio.css`, `techExec.css`, `colorfulCompact.css`
- Modify: `src/utils/cvTemplates.js` (`portfolio`, `techExec`, `colorfulCompact`)
- Test: `e2e/direct-edit.spec.js`

**Interfaces:**
- Consumes: the Task 4 convention. Colorful Compact differs because its renderers carry a per-section colour, so its signatures are `(key, color, placement, movedFrom)`.

- [ ] **Step 1: Write the failing test.** Set `COLUMN_MOVE_TEMPLATES` to `['Creative', 'Modern Professional', 'Executive', 'Graduate', 'Portfolio Hybrid', 'Tech Executive', 'Colorful Compact']`.

- [ ] **Step 2: Run the sweep and watch it fail** (`-g "every opted-in template"`). Expected: FAIL at `Portfolio Hybrid: offered at least one move`.

- [ ] **Step 3: Convert Portfolio Hybrid.** In `PortfolioShowcase.jsx`:

(a) Add `movedFrom = null` to `Section`'s props, and `data-moved-from={movedFrom ?? undefined}` on its `<section>` beside `data-export-placement={placement}`.

(b) Change the renderer signatures to `(key, placement = 'main', movedFrom = null)` and `(key, placement = 'side', movedFrom = null)`.

(c) Run `sed -i 's/placement="\(main\|side\)"/placement={placement} movedFrom={movedFrom}/' src/components/templates/PortfolioShowcase.jsx`, then `grep -c 'placement={placement} movedFrom={movedFrom}' …`, which must print `13`.

(d) Add the router after `renderSidebarSection`:

```jsx
  // A section always renders through its HOME renderer — the column the
  // template designed it for — even when the user moved it to the other
  // column. Placement comes from where it actually is (the PDF exporter
  // paginates by it); movedFrom is the CSS hook that adapts it.
  const homeSidebarSet = new Set(templateConfig.defaultSecondarySections ?? templateConfig.secondarySections)
  const renderSection = (key, placement) => {
    const homePlacement = homeSidebarSet.has(key) ? 'side' : 'main'
    const movedFrom = homePlacement === placement ? null : homePlacement

    return homePlacement === 'side'
      ? renderSidebarSection(key, placement, movedFrom)
      : renderMainSection(key, placement, movedFrom)
  }
```

(e) Layout 618/622: use `renderSection(key, 'main')` and `renderSection(key, 'side')`.

(f) Add the flag on `portfolio`.

(g) Run the sweep, then add CSS in `portfolio.css` with selectors `.portfolio-showcase__main [data-moved-from='side']` and `.portfolio-showcase__sidebar [data-moved-from='main']`, rules only for observed problems.

- [ ] **Step 4: Convert Tech Executive.** Same sub-steps in `TechExecShowcase.jsx`:
  - the literal count must be `10`;
  - the layout is 423/427;
  - the flag goes on `techExec`;
  - the CSS selectors are `.tech-exec-showcase__main [data-moved-from='side']` and `.tech-exec-showcase__sidebar [data-moved-from='main']` in `techExec.css`.

  Tech Executive's `interests` renders as one joined line (`snapshot.interests.map((item) => item.name)…join(' · ')`), not as entries. It still moves as a section, so no special case is needed.

- [ ] **Step 5: Convert Colorful Compact.** In `ColorfulCompactShowcase.jsx`:

(a) Change `Section` as in (a) above.

(b) `const renderMainSection = (key, color) => {` becomes `(key, color, placement = 'main', movedFrom = null) => {`, and `const renderSidebarSection = (key, color) => {` becomes `(key, color, placement = 'side', movedFrom = null) => {`.

(c) Run `sed` as above. The count must be `8`.

(d) Add the router, which carries the colour through:

```jsx
  // A section always renders through its HOME renderer — the column the
  // template designed it for — even when the user moved it to the other
  // column. Placement comes from where it actually is (the PDF exporter
  // paginates by it); movedFrom is the CSS hook that adapts it. The
  // per-section colour still comes from the running index in the column
  // the section actually sits in, so the rainbow stays in order.
  const homeSidebarSet = new Set(templateConfig.defaultSecondarySections ?? templateConfig.secondarySections)
  const renderSection = (key, color, placement) => {
    const homePlacement = homeSidebarSet.has(key) ? 'side' : 'main'
    const movedFrom = homePlacement === placement ? null : homePlacement

    return homePlacement === 'side'
      ? renderSidebarSection(key, color, placement, movedFrom)
      : renderMainSection(key, color, placement, movedFrom)
  }
```

(e) Layout:

```jsx
          {mainSectionKeys.map((key, index) => renderSection(key, colorAt(SECTION_COLORS, index), 'main'))}
```

```jsx
          {sidebarSectionKeys.map((key, index) =>
            renderSection(key, colorAt(SECTION_COLORS, mainSectionKeys.length + index), 'side'))}
```

(f) Add the flag on `colorfulCompact`.

(g) Add CSS in `colorfulCompact.css` with selectors `.colorful-compact-showcase__main [data-moved-from='side']` and `.colorful-compact-showcase__sidebar [data-moved-from='main']`.

- [ ] **Step 6: Run the sweep and watch it pass.**

- [ ] **Step 7: Run the full verification suite, then record, commit and bump** to 1.2.57, with a commit subject "Open section column moves on Portfolio Hybrid, Tech Executive and Colorful Compact" and the same `git add` shape as Task 5, using this task's files.

---

### Task 7: Developer (unit 5, v1.2.58)

Developer's sidebar is a dark gradient (`developer.css:257`, `var(--dev-sidebar)` to `#1e293b`), so this is where the CSS work concentrates. Its `Section` already derives a tone class from placement (`dev-showcase__section--sidebar` / `--main`), so passing the real placement switches the tone for free. The CSS block handles whatever the tone class does not.

**Files:**
- Modify: `src/components/templates/DeveloperShowcase.jsx`: `Section` line 62, renderers 140 (sidebar) / 275 (main), layout 566-573
- Modify: `src/styles/templates/developer.css`
- Modify: `src/utils/cvTemplates.js` (`developer`)
- Test: `e2e/direct-edit.spec.js`

- [ ] **Step 1: Write the failing test.** Append `'Developer'` to `COLUMN_MOVE_TEMPLATES`.

- [ ] **Step 2: Run the sweep and watch it fail** at `Developer: offered at least one move`.

- [ ] **Step 3: Convert Developer.**

(a) `Section`:

```jsx
function Section({ id, placement, movedFrom = null, children }) {
  const toneClass = placement === 'side' ? 'dev-showcase__section--sidebar' : 'dev-showcase__section--main'

  return (
    <section
      className={`dev-showcase__section ${toneClass}`}
      data-export-section={id}
      data-export-placement={placement}
      data-moved-from={movedFrom ?? undefined}
    >
      {children}
    </section>
  )
}
```

(b) Change `const renderSidebarSection = (key) => {` to `(key, placement = 'side', movedFrom = null) => {`, and `const renderMainSection = (key) => {` to `(key, placement = 'main', movedFrom = null) => {`.

(c) Run `sed` as in the earlier tasks. The count must be `11`.

(d) Add the router after `renderMainSection`'s closing `}`, because it is the later of the two renderers in this file:

```jsx
  // A section always renders through its HOME renderer — the column the
  // template designed it for — even when the user moved it to the other
  // column. Placement comes from where it actually is (the PDF exporter
  // paginates by it, and Section derives its light/dark tone from it);
  // movedFrom is the CSS hook for anything the tone class doesn't cover.
  const homeSidebarSet = new Set(templateConfig.defaultSecondarySections ?? templateConfig.secondarySections)
  const renderSection = (key, placement) => {
    const homePlacement = homeSidebarSet.has(key) ? 'side' : 'main'
    const movedFrom = homePlacement === placement ? null : homePlacement

    return homePlacement === 'side'
      ? renderSidebarSection(key, placement, movedFrom)
      : renderMainSection(key, placement, movedFrom)
  }
```

(e) Layout. First read `sed -n 560,576p src/components/templates/DeveloperShowcase.jsx`. Then:
  - Line 568: `sidebarSectionKeys.map((key) => renderSidebarSection(key))` becomes `sidebarSectionKeys.map((key) => renderSection(key, 'side'))`.
  - Line 572, the `!showSidebar` branch: `sidebarSectionKeys.map((key) => renderSidebarSection(key))` becomes `sidebarSectionKeys.map((key) => renderSection(key, 'side'))`. This keeps today's behaviour exactly: when a Developer variant hides its sidebar, those sections flowed in main while still passing `placement="side"`. Do not change that in this task.
  - Line 573: `mainSectionKeys.map((key) => renderMainSection(key))` becomes `mainSectionKeys.map((key) => renderSection(key, 'main'))`.

(f) Add the flag on `developer`.

- [ ] **Step 4: Adapt Developer's CSS.** Run the sweep, then screenshot every movable section in both directions using the Task 4 Step 6 method. Expect to adapt:
  - sidebar-home sections (skills, links, certificates, education, languages) moved into the light main column;
  - main-home proven sections (projects, achievements) moved onto the dark rail.

Add the block at the end of `developer.css`:

```css
/* ── Sections moved between columns (Direct Edit, sectionColumns.js) ──
   A moved section keeps its home markup. Section's tone class already
   follows the real placement; these rules cover the rest of the markup
   that assumed the dark rail (sidebar-home cards, chips, link text) or
   the light page (main-home project and achievement cards). */
.dev-showcase__main [data-moved-from='side'] {
  /* observed fixes only */
}

.dev-showcase__sidebar [data-moved-from='main'] {
  /* observed fixes only */
}
```

Fill the blocks with the rules the screenshots and sweep demand. Delete any block that stays empty. Re-run until the sweep passes.

- [ ] **Step 5: Export check.** Run `npx playwright test e2e/direct-edit.spec.js -g "PDF export" --reporter=line`, then export Developer with one section moved each way by hand in the dev server. Open the PDF and confirm nothing is sliced mid-card.

- [ ] **Step 6: Run the full verification suite, then record, commit and bump** to 1.2.58, with a commit subject "Open section column moves on Developer" and a body describing the dark-rail CSS adaptations.

---

### Task 8: Navy Professional (unit 6, v1.2.59)

Navy's main `Section` hard-codes `data-export-placement="main"` and takes no `placement`. Its sidebar sections use `SidebarBlock` (tagged in Task 1). Both wrappers need `placement` and `movedFrom` props, and the renderers pass them.

**Files:**
- Modify: `src/components/templates/NavyProfessionalShowcase.jsx`: `Section` line 45, `SidebarBlock` (Task 1 version), renderers 114/212, layout 319/323
- Modify: `src/styles/templates/navyProfessional.css`
- Modify: `src/utils/cvTemplates.js` (`navyProfessional`)
- Test: `e2e/direct-edit.spec.js`

- [ ] **Step 1: Write the failing test.** Append `'Navy Professional'` to `COLUMN_MOVE_TEMPLATES`.

- [ ] **Step 2: Run the sweep and watch it fail** at `Navy Professional: offered at least one move`.

- [ ] **Step 3: Convert Navy.**

(a) `Section`. Read it first with `sed -n 45,53p`, then make its signature `function Section({ id, icon, title, placement = 'main', movedFrom = null, children })`, and replace `data-export-placement="main"` with `data-export-placement={placement} data-moved-from={movedFrom ?? undefined}`.

(b) `SidebarBlock`:

```jsx
// `id` is set only for real CV sections: it is what the PDF exporter and
// Direct Edit's overlay find a section by. The contact block passes none
// and stays untagged.
function SidebarBlock({ id, title, placement = 'side', movedFrom = null, children }) {
  return (
    <div
      className="navy-professional-showcase__sidebar-block"
      data-export-section={id}
      data-export-placement={id ? placement : undefined}
      data-moved-from={movedFrom ?? undefined}
    >
      <p className="navy-professional-showcase__sidebar-heading">{title}</p>
      {children}
    </div>
  )
}
```

(c) Change `const renderMainSection = (key) => {` to `(key, placement = 'main', movedFrom = null) => {`, and `const renderSidebarSection = (key) => {` to `(key, placement = 'side', movedFrom = null) => {`.

(d) Pass the props at every keyed call site, then check the count, which should be `6` (4 `Section` + 2 keyed `SidebarBlock`; the unkeyed contact block is untouched):

```bash
sed -i 's/<Section key={key} /<Section key={key} placement={placement} movedFrom={movedFrom} /; s/<SidebarBlock key={key} /<SidebarBlock key={key} placement={placement} movedFrom={movedFrom} /' src/components/templates/NavyProfessionalShowcase.jsx
grep -c 'placement={placement} movedFrom={movedFrom}' src/components/templates/NavyProfessionalShowcase.jsx
```

(e) Add the router after `renderSidebarSection`, with the same code and comment as Task 5 Step 3(d).

(f) Layout: `sidebarSectionKeys.map((key) => renderSidebarSection(key))` (line 319) becomes `renderSection(key, 'side')`, and `mainSectionKeys.map((key) => renderMainSection(key))` (line 323) becomes `renderSection(key, 'main')`.

(g) Add the flag on `navyProfessional`.

- [ ] **Step 4: Adapt Navy's CSS.** The sidebar is navy, so sidebar-home `SidebarBlock` sections (skills, languages) moved into main need main-column colours, and main-home `Section`s (education, certificates) moved into the rail need rail colours. Add the block at the end of `navyProfessional.css` using the same header comment pattern, with selectors `.navy-professional-showcase__main [data-moved-from='side']` and `.navy-professional-showcase__sidebar [data-moved-from='main']`, observed fixes only. Re-run the sweep until it passes.

- [ ] **Step 5: Run the full verification suite, then record, commit and bump** to 1.2.59: "Open section column moves on Navy Professional".

---

### Task 9: Modern Orange (unit 7, v1.2.60)

This follows the same structure as Navy: a main `Section` hard-coding `data-export-placement="main"`, and `SidebarBlock` for the sidebar.

**Files:**
- Modify: `src/components/templates/ModernOrangeShowcase.jsx`: `Section` line 105, `SidebarBlock` (Task 1 version), renderers 295/423, layout 611/617, the `EducationRow` call site inside the education sidebar block (unchanged)
- Modify: `src/styles/templates/modernOrange.css`
- Modify: `src/utils/cvTemplates.js` (`modernOrange`)
- Test: `e2e/direct-edit.spec.js`

- [ ] **Step 1: Write the failing test.** Append `'Modern Orange'` to `COLUMN_MOVE_TEMPLATES`.

- [ ] **Step 2: Run the sweep and watch it fail** at `Modern Orange: offered at least one move`.

- [ ] **Step 3: Convert Modern Orange.**

(a) `Section`: signature `function Section({ id, icon, title, placement = 'main', movedFrom = null, children })`, and replace `data-export-placement="main"` with `data-export-placement={placement} data-moved-from={movedFrom ?? undefined}`.

(b) `SidebarBlock`:

```jsx
// `id` is set only for real CV sections: it is what the PDF exporter and
// Direct Edit's overlay find a section by. The personal-info block passes
// none and stays untagged.
function SidebarBlock({ id, title, placement = 'side', movedFrom = null, children }) {
  return (
    <div
      className="modern-orange-showcase__sidebar-block"
      data-export-section={id}
      data-export-placement={id ? placement : undefined}
      data-moved-from={movedFrom ?? undefined}
    >
      <p className="modern-orange-showcase__sidebar-heading">{title}</p>
      {children}
    </div>
  )
}
```

(c) Change the renderer signatures as in Task 8 (c).

(d) Run the Task 8 (d) `sed` against `ModernOrangeShowcase.jsx`. The count must be `7` (4 `Section` + 3 keyed `SidebarBlock`).

(e) Add the router after `renderSidebarSection`, with the same code and comment as Task 5 Step 3(d).

(f) Layout: line 611 becomes `renderSection(key, 'side')` and line 617 becomes `renderSection(key, 'main')`.

(g) Add the flag on `modernOrange`.

- [ ] **Step 4: Adapt Modern Orange's CSS** in `modernOrange.css`, with selectors `.modern-orange-showcase__main [data-moved-from='side']` and `.modern-orange-showcase__sidebar [data-moved-from='main']`, observed fixes only. The education rail markers (`modern-orange-showcase__edu-rail`) are sidebar-home and deserve a specific look when education moves into main. Re-run the sweep until it passes.

- [ ] **Step 5: Run the full verification suite, then record, commit and bump** to 1.2.60: "Open section column moves on Modern Orange".

---

### Task 10: Close out item 60 (no version bump, docs only)

**Files:**
- Modify: `todo.md`, `docs/superpowers/specs/2026-09-27-section-column-moves-design.md`
- Modify: the memory file `portifycv-direct-edit-full-scope-vision.md` and `MEMORY.md` (outside the repo)

- [ ] **Step 1: Mark item 60 done in place** in `todo.md`'s "## Next session — handoff, 2026-09-24" section, following the item 58 wording pattern. Record:
  - the version (1.2.60);
  - the 10 templates;
  - Quadrant's exclusion and why;
  - the five-resolver correction;
  - that `check:section-columns` and the contrast sweep guard it.

- [ ] **Step 2: Update the spec's status line** to `**Status:** implemented (v1.2.53–v1.2.60); see the plan's "Corrections to the spec" for the three deviations.`

- [ ] **Step 3: Refresh the handoff.** Rewrite the state lines at the top of the 2026-09-24 handoff (branch head, version, test count), or add a new dated handoff section if the user prefers. Ask before choosing.

- [ ] **Step 4: Commit.**

```bash
git add todo.md docs/superpowers/specs/2026-09-27-section-column-moves-design.md
git commit -m "Mark section column moves done and refresh the handoff"
```

- [ ] **Step 5: Update memory** so the next session does not re-plan item 60. Record in `portifycv-direct-edit-full-scope-vision.md` that it shipped, plus the two traps worth remembering: `getCvTemplate` is called at five sites, and Quadrant is not a main/sidebar layout.

- [ ] **Step 6: Ask the user before pushing** `origin/v1.3.0`. Never merge to `main`.
