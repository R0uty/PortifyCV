# Template Field Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single-choice row of field chips (All, Tech, Creative, Business, Leadership, Graduate, Any field) to the Free CV Templates page and the builder's template gallery, showing only the templates tagged with the chosen field.

**Architecture:** Each template in `src/utils/cvTemplates.js` gets a hand-picked `fields` array. A new `src/utils/templateFields.js` holds the field list, labels and two pure helpers. A new `TemplateFieldFilter` component renders the chips plus a live status line and is used by both pages: the grid keeps the choice in `?field=` via `history.replaceState`, the gallery in local state that resets on every open.

**Tech Stack:** React 19, Vite, hand-written utility CSS (`src/styles/app-shell.css`), framework-free Node check scripts (`scripts/*.mjs`), Playwright e2e (`e2e/`).

**Spec:** `docs/superpowers/specs/2026-10-11-template-field-filters-design.md`

## Global Constraints

- Work on a branch based on `origin/v1.6.0` (1.6.11, `50936f3`); release as **1.6.12**. Push only with `git push origin HEAD:v1.6.0`, and only after the user says yes. Never merge into `main`.
- Commits carry only the user's name: **no `Co-Authored-By` or any attribution trailer.**
- One standalone `Bump version to 1.6.12` commit at the end (`npm version 1.6.12 --no-git-tag-version`, commit `package.json` and `package-lock.json`).
- Field ids are public and permanent once shipped: `tech`, `creative`, `business`, `leadership`, `graduate`, `any`. Labels may change.
- Labels, exactly: All / Kaikki; Tech / Tekniikka ja IT; Creative / Luova ala; Business / Liiketoiminta; Leadership / Johto; Graduate / Vastavalmistuneet; Any field / Kaikki alat.
- Radio group name: "Field" / "Ala". Status line: `All 18 templates` / `Kaikki 18 pohjaa` on All; `Showing N of 18 templates` / `Näytetään N/18 pohjaa` otherwise (18 is `totalCount`, never hard-coded).
- "Any field" templates appear only under Any field (and All), never under other chips.
- Grid: `?field=<id>` updated with `history.replaceState` (no new history entry); All deletes the parameter; other query parameters are kept. Gallery: local state, opens on All every time.
- Don't import `templateFields.js` or the chip component from the entry graph (`App.jsx`, `pageMeta.js`, `routes.js`).
- Bilingual strings follow the codebase idiom: inline `en`/`fi` pairs, no i18n library.
- Before asking to push: `npm run lint`, all 8 `npm run check:*` (share, reducers, feedback, docx-export, section-schema, section-columns, template-pages, template-variants), `CI=1 npm run test:e2e` (852 passed at 1.6.11, so expect 852 + the new tests), `npm run build`. Never edit `e2e/fixtures/pdfPages.js` or `layoutAllowlist.js` to make a run pass.
- Never use bare `git stash`.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `src/utils/templateFields.js` | Create | Field list, labels, `parseFieldParam`, `filterTemplatesByField` |
| `src/utils/cvTemplates.js` | Modify | `fields` on each of the 18 templates |
| `scripts/check-template-pages.mjs` | Modify | Field data and helper checks |
| `CLAUDE.md` | Modify | `check:template-pages` description mentions fields |
| `src/components/TemplateFieldFilter.jsx` | Create | Chip radio group + live status line |
| `src/styles/app-shell.css` | Modify | `.template-fields*` chip styles, filter spacing |
| `src/pages/FreeCvTemplatesPage.jsx` | Modify | Chip row, `?field=` state, filtered grid |
| `src/components/TemplateGalleryModal.jsx` | Modify | Chip row, local state reset on open, filtered grid |
| `e2e/template-filters.spec.js` | Create | Grid and gallery behaviour |
| `changes.md`, `todo.md` | Modify | 1.6.12 entry; mark filters done, photo flag dropped |

---

### Task 1: Field data, helpers and checks

**Files:**
- Create: `src/utils/templateFields.js`
- Modify: `src/utils/cvTemplates.js` (each template's block, after its `layout:` line)
- Modify: `scripts/check-template-pages.mjs` (new block before the final `if (failures > 0)`)
- Modify: `CLAUDE.md:20`, `CLAUDE.md:40`

**Interfaces:**
- Produces:
  - `TEMPLATE_FIELDS: Array<{ id: string, label: { en: string, fi: string } }>` (6 entries, order: tech, creative, business, leadership, graduate, any)
  - `ALL_FIELDS_LABEL: { en: 'All', fi: 'Kaikki' }`
  - `parseFieldParam(raw: unknown): string | null`
  - `filterTemplatesByField<T extends { fields?: string[] }>(templates: T[], fieldId: string | null): T[]`
  - every template object from `getCvTemplates(locale)` / `cvTemplates` has `fields: string[]`

- [ ] **Step 1: Write the failing checks**

In `scripts/check-template-pages.mjs`, add this block immediately before the final `if (failures > 0) {`:

```js
// --- Field filters (1.6.12) -------------------------------------------------
const { TEMPLATE_FIELDS, ALL_FIELDS_LABEL, parseFieldParam, filterTemplatesByField } =
  await importSrc('utils/templateFields.js')

const fieldIds = TEMPLATE_FIELDS.map((field) => field.id)
check('field ids are unique', new Set(fieldIds).size === fieldIds.length, fieldIds.join(', '))
const badFields = cvTemplates.filter((template) => !Array.isArray(template.fields)
  || template.fields.length === 0
  || new Set(template.fields).size !== template.fields.length
  || template.fields.some((field) => !fieldIds.includes(field)))
check('every template has known, non-duplicate fields', badFields.length === 0, badFields.map((t) => t.id).join(', '))
for (const field of TEMPLATE_FIELDS) {
  const count = cvTemplates.filter((template) => template.fields?.includes(field.id)).length
  check(`field ${field.id} has at least two templates`, count >= 2, `has ${count}`)
}
for (const lang of ['en', 'fi']) {
  const labels = [ALL_FIELDS_LABEL, ...TEMPLATE_FIELDS.map((field) => field.label)].map((label) => label?.[lang])
  check(`field labels are non-empty and unique in ${lang}`,
    labels.every((label) => typeof label === 'string' && label.trim()) && new Set(labels).size === labels.length,
    labels.join(' | '))
}
check('parseFieldParam accepts a known id', parseFieldParam('tech') === 'tech')
check('parseFieldParam: unknown, empty, missing or wrong-case → null',
  ['nope', '', null, undefined, 'Tech'].every((raw) => parseFieldParam(raw) === null))
const techIds = filterTemplatesByField(cvTemplates, 'tech').map((template) => template.id)
check('filterTemplatesByField keeps gallery order',
  techIds.length > 0
    && JSON.stringify(techIds) === JSON.stringify(cvTemplates.map((t) => t.id).filter((id) => techIds.includes(id))))
check('filterTemplatesByField(null) returns every template',
  filterTemplatesByField(cvTemplates, null).length === cvTemplates.length)
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run check:template-pages`
Expected: FAIL — Node throws `ERR_MODULE_NOT_FOUND` for `utils/templateFields.js` (the module doesn't exist yet).

- [ ] **Step 3: Create `src/utils/templateFields.js`**

```js
// Field / career-stage filters for the template gallery and the Free CV
// Templates grid (1.6.12, see
// docs/superpowers/specs/2026-10-11-template-field-filters-design.md).
// Each template lists its fields in cvTemplates.js (`fields`), hand-picked
// for its main audience. Field ids are PERMANENT once shipped (the grid
// keeps them in ?field=); labels may change. "Any field" is a field of its
// own: its templates don't also appear under the other chips.

export const TEMPLATE_FIELDS = [
  { id: 'tech', label: { en: 'Tech', fi: 'Tekniikka ja IT' } },
  { id: 'creative', label: { en: 'Creative', fi: 'Luova ala' } },
  { id: 'business', label: { en: 'Business', fi: 'Liiketoiminta' } },
  { id: 'leadership', label: { en: 'Leadership', fi: 'Johto' } },
  { id: 'graduate', label: { en: 'Graduate', fi: 'Vastavalmistuneet' } },
  { id: 'any', label: { en: 'Any field', fi: 'Kaikki alat' } },
]

export const ALL_FIELDS_LABEL = { en: 'All', fi: 'Kaikki' }

const FIELD_IDS = new Set(TEMPLATE_FIELDS.map((field) => field.id))

// A ?field= value: a known id, else null (All). Case-sensitive, like
// parseStyleVariantParam.
export function parseFieldParam(raw) {
  return typeof raw === 'string' && FIELD_IDS.has(raw) ? raw : null
}

// The templates tagged with `fieldId`, in their original order; every
// template for null (All).
export function filterTemplatesByField(templates, fieldId) {
  if (!fieldId) {
    return templates
  }
  return templates.filter((template) => template.fields?.includes(fieldId))
}
```

- [ ] **Step 4: Add `fields` to every template in `src/utils/cvTemplates.js`**

In each template's object inside `templateMap`, add a `fields` line directly after its `layout: '...',` line, with exactly these values (the approved table):

```js
// minimal
    fields: ['any'],
// developer
    fields: ['tech', 'graduate'],
// creative
    fields: ['creative'],
// modern
    fields: ['business'],
// executive
    fields: ['leadership'],
// timeline
    fields: ['business'],
// graduate
    fields: ['graduate'],
// compact
    fields: ['tech', 'graduate'],
// portfolio
    fields: ['tech', 'creative'],
// techExec
    fields: ['leadership', 'tech'],
// classicProfessional
    fields: ['any'],
// navyProfessional
    fields: ['leadership', 'business'],
// modernOrange
    fields: ['creative', 'business'],
// colorfulCompact
    fields: ['creative'],
// quadrant
    fields: ['business'],
// editorial
    fields: ['creative'],
// portrait
    fields: ['creative'],
// european
    fields: ['any'],
```

Also extend the comment block above `const templateMap = {` with:

```js
// `fields` are the template's main audiences for the gallery and grid
// filters (ids from templateFields.js), hand-picked rather than derived
// from its example people, so each filter stays narrow.
```

`localizeTemplate` spreads the template, so `fields` passes through `getCvTemplates('fi')` unchanged; no change there.

- [ ] **Step 5: Run the check to verify it passes**

Run: `npm run check:template-pages`
Expected: PASS, ending `All template-page checks passed.`, with `ok` lines for each new check, including `field graduate has at least two templates` (3) and `field leadership has at least two templates` (3).

Then confirm the counts match the spec (Tech 4, Creative 6, Business 5, Leadership 3, Graduate 3, Any field 3):

Run: `node -e "import('./src/utils/cvTemplates.js').then(({cvTemplates})=>{const c={};cvTemplates.forEach(t=>t.fields.forEach(f=>c[f]=(c[f]||0)+1));console.log(c)})"`
Expected: `{ any: 3, tech: 4, graduate: 3, creative: 6, business: 5, leadership: 3 }` (key order may differ).

- [ ] **Step 6: Update `CLAUDE.md`**

Line 20, replace:
```
npm run check:template-pages   # validates per-template page slugs, examples, and copy (src/utils/templatePageCopy.js, src/utils/templateMetaDescriptions.js, src/utils/exampleCvs.js)
```
with:
```
npm run check:template-pages   # validates per-template page slugs, examples, copy, and field tags (src/utils/templatePageCopy.js, src/utils/templateMetaDescriptions.js, src/utils/exampleCvs.js, src/utils/templateFields.js)
```
Line 40, replace `per-template pages' slugs, examples, and copy (\`check:template-pages\`), or` with `per-template pages' slugs, examples, copy, and field tags (\`check:template-pages\`), or`.

- [ ] **Step 7: Run lint, then commit**

Run: `npm run lint` — expected: no errors.

```bash
git add src/utils/templateFields.js src/utils/cvTemplates.js scripts/check-template-pages.mjs CLAUDE.md
git commit -m "Add field tags to every template"
```

---

### Task 2: Chip row and the Free CV Templates page filter

**Files:**
- Create: `src/components/TemplateFieldFilter.jsx`
- Create: `e2e/template-filters.spec.js`
- Modify: `src/pages/FreeCvTemplatesPage.jsx` (imports, state near `const [looks, setLooks]`, the grid `landing-section`)
- Modify: `src/styles/app-shell.css` (after the `.templates-page-card` rule, ~line 2907)

**Interfaces:**
- Consumes (Task 1): `TEMPLATE_FIELDS`, `ALL_FIELDS_LABEL`, `parseFieldParam`, `filterTemplatesByField` from `../utils/templateFields`; `template.fields`.
- Produces: `TemplateFieldFilter({ value: string | null, onChange: (fieldId: string | null) => void, locale: 'en' | 'fi', shownCount: number, totalCount: number, name: string })`, rendering `.template-fields` > `[role=radiogroup][aria-label=Field|Ala].template-fields__chips` > `label.template-fields__chip` > `input[type=radio]`, plus `p.template-fields__status[aria-live=polite]`.

- [ ] **Step 1: Write the failing grid tests**

Create `e2e/template-filters.spec.js`:

```js
import { test, expect } from './fixtures/base.js'
import { cvTemplates, getCvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_FIELDS } from '../src/utils/templateFields.js'
import { getTemplateVariants } from '../src/utils/templateVariants.js'

// Field filters (1.6.12) on the Free CV Templates grid and the builder's
// template gallery. Expected sets come from the template data, never
// hard-coded, so a retag only needs cvTemplates.js.

const labelsFor = (fieldId, locale = 'en') => getCvTemplates(locale)
  .filter((template) => fieldId === null || template.fields.includes(fieldId))
  .map((template) => template.label)
const fieldGroup = (scope, groupName = 'Field') => scope.getByRole('radiogroup', { name: groupName, exact: true })
const chip = (scope, text, groupName = 'Field') => fieldGroup(scope, groupName).getByRole('radio', { name: text, exact: true })
const status = (scope) => scope.locator('.template-fields__status')
const gridNames = (page) => page.locator('a.templates-page-card__name')
const developer = getTemplateVariants('developer')

test.describe('Free CV Templates field filter', () => {
  test('each chip shows exactly its templates, in gallery order', async ({ page }) => {
    await page.goto('/free-cv-templates')
    await expect(chip(page, 'All')).toBeChecked()
    await expect(gridNames(page)).toHaveText(labelsFor(null))

    for (const field of TEMPLATE_FIELDS) {
      await chip(page, field.label.en).check()
      await expect(gridNames(page)).toHaveText(labelsFor(field.id))
    }

    await chip(page, 'All').check()
    await expect(gridNames(page)).toHaveCount(cvTemplates.length)
  })

  test('the address follows the chip without adding history', async ({ page }) => {
    await page.goto('/free-cv-templates')
    const historyLength = await page.evaluate(() => window.history.length)

    await chip(page, 'Tech').check()
    await expect(page).toHaveURL(/\/free-cv-templates\?field=tech$/)
    await chip(page, 'Creative').check()
    await expect(page).toHaveURL(/\/free-cv-templates\?field=creative$/)
    await chip(page, 'All').check()
    await expect(page).toHaveURL(/\/free-cv-templates$/)

    expect(await page.evaluate(() => window.history.length)).toBe(historyLength)
  })

  test('?field= opens on that chip; an unknown value opens on All', async ({ page }) => {
    await page.goto('/free-cv-templates?field=tech')
    await expect(chip(page, 'Tech')).toBeChecked()
    await expect(gridNames(page)).toHaveText(labelsFor('tech'))

    await page.goto('/free-cv-templates?field=nope')
    await expect(chip(page, 'All')).toBeChecked()
    await expect(gridNames(page)).toHaveCount(cvTemplates.length)
  })

  test('the status line counts the shown templates, in Finnish too', async ({ page }) => {
    const total = cvTemplates.length
    const shown = labelsFor('leadership').length
    await page.goto('/free-cv-templates?field=leadership')
    await expect(status(page)).toHaveText(`Showing ${shown} of ${total} templates`)

    await page.getByRole('button', { name: 'Switch language' }).click()
    await expect(chip(page, 'Johto', 'Ala')).toBeChecked()
    await expect(status(page)).toHaveText(`Näytetään ${shown}/${total} pohjaa`)
    await expect(gridNames(page)).toHaveText(labelsFor('leadership', 'fi'))

    await chip(page, 'Kaikki', 'Ala').check()
    await expect(status(page)).toHaveText(`Kaikki ${total} pohjaa`)
  })

  test('a look picked on a card survives filtering it away and back', async ({ page }) => {
    await page.goto('/free-cv-templates')
    const developerLook = page.getByRole('radiogroup', { name: 'Style: Developer', exact: true })
      .getByRole('radio', { name: developer[1].label.en, exact: true })
    await developerLook.check()

    await chip(page, 'Creative').check()
    await expect(developerLook).toHaveCount(0)
    await chip(page, 'Tech').check()
    await expect(developerLook).toBeChecked()
  })

  test('Back from a template page returns to the same filter', async ({ page }) => {
    await page.goto('/free-cv-templates?field=graduate')
    await gridNames(page).first().click()
    await expect(page).toHaveURL(/\/free-cv-templates\/[a-z-]+$/)

    await page.goBack()
    await expect(page).toHaveURL(/\/free-cv-templates\?field=graduate$/)
    await expect(chip(page, 'Graduate')).toBeChecked()
    await expect(gridNames(page)).toHaveText(labelsFor('graduate'))
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx playwright test e2e/template-filters.spec.js --reporter=line`
Expected: all 6 FAIL (no radiogroup named "Field" exists yet; e.g. `element(s) not found`).

- [ ] **Step 3: Create `src/components/TemplateFieldFilter.jsx`**

```jsx
import { ALL_FIELDS_LABEL, TEMPLATE_FIELDS } from '../utils/templateFields'

// The field chips (1.6.12) above the Free CV Templates grid and the
// builder's template gallery. Native radios styled as chips, the same
// pattern as StyleSwatchGroup: Tab enters the group, the arrow keys move
// between fields, and each input covers its whole chip at opacity 0. The
// caller owns the value (the grid keeps it in ?field=, the gallery in
// local state); `null` is All. The status line is announced politely after
// each change.
function TemplateFieldFilter({ value, onChange, locale = 'en', shownCount, totalCount, name }) {
  const lang = locale === 'fi' ? 'fi' : 'en'
  const options = [{ id: null, label: ALL_FIELDS_LABEL }, ...TEMPLATE_FIELDS]

  let statusText
  if (value === null) {
    statusText = lang === 'fi' ? `Kaikki ${totalCount} pohjaa` : `All ${totalCount} templates`
  } else {
    statusText = lang === 'fi'
      ? `Näytetään ${shownCount}/${totalCount} pohjaa`
      : `Showing ${shownCount} of ${totalCount} templates`
  }

  return (
    <div className="template-fields">
      <div role="radiogroup" aria-label={lang === 'fi' ? 'Ala' : 'Field'} className="template-fields__chips">
        {options.map((option) => (
          <label key={option.id ?? 'all'} className="template-fields__chip">
            <input
              type="radio"
              name={name}
              value={option.id ?? ''}
              checked={option.id === value}
              onChange={() => onChange(option.id)}
            />
            <span>{option.label[lang]}</span>
          </label>
        ))}
      </div>
      <p className="template-fields__status" aria-live="polite">{statusText}</p>
    </div>
  )
}

export default TemplateFieldFilter
```

- [ ] **Step 4: Add the chip styles to `src/styles/app-shell.css`**

Insert after the `.templates-page-card { ... }` rule (~line 2907):

```css
/* Field chips (1.6.12) above the templates grid and the builder gallery.
   Same structure as .style-swatches: the radio covers the whole chip. */
.template-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.template-fields__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.template-fields__chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0.35rem 0.8rem;
  border: 1.5px solid var(--app-border);
  border-radius: 999px;
  background: var(--app-surface);
  color: var(--app-text);
  font-size: var(--text-body-sm);
  cursor: pointer;
}

.template-fields__chip input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.template-fields__chip:has(input:checked) {
  border-color: var(--app-text);
  background: var(--app-text);
  color: var(--app-surface);
}

.template-fields__chip:has(input:focus-visible) {
  outline: 2px solid var(--app-text);
  outline-offset: 2px;
}

.template-fields__status {
  color: var(--app-text-muted);
  font-size: var(--text-body-sm);
}

.templates-page-filter {
  margin-bottom: var(--space-8);
}
```

- [ ] **Step 5: Wire the filter into `src/pages/FreeCvTemplatesPage.jsx`**

Add imports (after the `StyleSwatchGroup` import, and after the `templateVariants` import respectively):

```jsx
import TemplateFieldFilter from '../components/TemplateFieldFilter'
```
```jsx
import { filterTemplatesByField, parseFieldParam } from '../utils/templateFields'
```

Add above `function FreeCvTemplatesPage(`:

```jsx
// The field filter lives in ?field= (1.6.12), so a reload, a shared link
// and Back from a template page all keep it. Read once, on mount.
function readFieldParam() {
  if (typeof window === 'undefined') {
    return null
  }
  return parseFieldParam(new URLSearchParams(window.location.search).get('field'))
}
```

Inside the component, after `const [looks, setLooks] = useState({})`:

```jsx
  const [field, setField] = useState(readFieldParam)
  const shownTemplates = useMemo(() => filterTemplatesByField(templates, field), [templates, field])

  // Like the template page's selectStyle: replace, don't push, so Back
  // leaves the page instead of stepping through chips. All is the absence
  // of ?field=.
  const selectField = (nextField) => {
    setField(nextField)
    const url = new URL(window.location.href)
    if (nextField) {
      url.searchParams.set('field', nextField)
    } else {
      url.searchParams.delete('field')
    }
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`)
  }
```

In the JSX, in the second `<div className="landing-section">` (the one holding `templates-page-grid`), insert before `<div className="templates-page-grid">`:

```jsx
        <div className="templates-page-filter">
          <TemplateFieldFilter
            value={field}
            onChange={selectField}
            locale={resolvedLocale}
            shownCount={shownTemplates.length}
            totalCount={templates.length}
            name="grid-field"
          />
        </div>
```

and change the grid's `{templates.map((template) => {` to `{shownTemplates.map((template) => {`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx playwright test e2e/template-filters.spec.js --reporter=line`
Expected: 6 passed.

Also run the existing grid specs, which must still pass unchanged:
Run: `npx playwright test e2e/template-pages.spec.js e2e/template-looks.spec.js --reporter=line`
Expected: all passed.

- [ ] **Step 7: Check the layout at phone width**

Start the dev server (`npm run dev`) and open `/free-cv-templates` at 375px wide (built-in browser `resize_window` preset `mobile`, then reset to `desktop`). Expected: the seven chips wrap onto two or three lines, no horizontal page scroll (`document.documentElement.scrollWidth <= window.innerWidth`), the checked chip filled dark, the status line below. Remove any temporary `.claude/launch.json` you created for this.

- [ ] **Step 8: Run lint, then commit**

Run: `npm run lint` — expected: no errors.

```bash
git add src/components/TemplateFieldFilter.jsx src/pages/FreeCvTemplatesPage.jsx src/styles/app-shell.css e2e/template-filters.spec.js
git commit -m "Filter the Free CV Templates grid by field"
```

---

### Task 3: Builder gallery filter

**Files:**
- Modify: `src/components/TemplateGalleryModal.jsx` (imports; state block after `const [wasOpen, setWasOpen]`; JSX between the ATS banner and `template-gallery__grid`)
- Modify: `src/styles/app-shell.css` (append next to `.templates-page-filter`)
- Modify: `e2e/template-filters.spec.js` (append a describe block)

**Interfaces:**
- Consumes: `TemplateFieldFilter` (Task 2), `filterTemplatesByField` (Task 1). The modal's `templates` prop already comes from `getCvTemplates(locale)` in `ResumeBuilderPage.jsx:562`, so it carries `fields`.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Write the failing gallery test**

Append to `e2e/template-filters.spec.js`:

```js
test.describe('Template gallery field filter', () => {
  const openGallery = async (page) => {
    await page.getByRole('button', { name: /^Select template:/ }).click()
    return page.getByRole('dialog', { name: 'Template gallery' })
  }
  const galleryNames = (dialog) => dialog.locator('.template-gallery__name')

  test('a chip filters the cards; reopening the gallery starts on All', async ({ page }) => {
    await page.goto('/cv')
    let dialog = await openGallery(page)
    await expect(chip(dialog, 'All')).toBeChecked()
    await expect(status(dialog)).toHaveText(`All ${cvTemplates.length} templates`)

    await chip(dialog, 'Leadership').check()
    await expect(galleryNames(dialog)).toHaveText(labelsFor('leadership'))
    await expect(status(dialog)).toHaveText(`Showing ${labelsFor('leadership').length} of ${cvTemplates.length} templates`)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    dialog = await openGallery(page)
    await expect(chip(dialog, 'All')).toBeChecked()
    await expect(galleryNames(dialog)).toHaveCount(cvTemplates.length)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test e2e/template-filters.spec.js -g "gallery" --reporter=line`
Expected: FAIL (`element(s) not found` for the "Field" radiogroup in the dialog).

- [ ] **Step 3: Wire the filter into `src/components/TemplateGalleryModal.jsx`**

Add imports after the `StyleSwatchGroup` import and after the `templateVariants` import respectively:

```jsx
import TemplateFieldFilter from './TemplateFieldFilter'
```
```jsx
import { filterTemplatesByField } from '../utils/templateFields'
```

Replace the existing reset block:

```jsx
  const [previewedLooks, setPreviewedLooks] = useState({})
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setPreviewedLooks({})
    }
  }
```

with:

```jsx
  const [previewedLooks, setPreviewedLooks] = useState({})
  // The field filter (1.6.12) is local and starts on All at every open:
  // the gallery is for switching, not a page to link to.
  const [field, setField] = useState(null)
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setPreviewedLooks({})
      setField(null)
    }
  }
  const shownTemplates = filterTemplatesByField(templates, field)
```

Update the comment above it so it still reads correctly: the existing comment ("Looks previewed on a card since the modal opened … Reset on every open …") stays as is, directly above `const [previewedLooks, ...]`.

In the JSX, insert between the ATS banner's closing `) : null}` and `<div className="template-gallery__grid">`:

```jsx
      <div className="template-gallery__filter">
        <TemplateFieldFilter
          value={field}
          onChange={setField}
          locale={locale}
          shownCount={shownTemplates.length}
          totalCount={templates.length}
          name="gallery-field"
        />
      </div>
```

and change the grid's `{templates.map((template) => {` to `{shownTemplates.map((template) => {`.

- [ ] **Step 4: Add the spacing rule**

In `src/styles/app-shell.css`, directly after `.templates-page-filter { ... }`:

```css
.template-gallery__filter {
  margin-bottom: var(--space-4);
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx playwright test e2e/template-filters.spec.js e2e/template-looks.spec.js e2e/style-variants.spec.js --reporter=line`
Expected: all passed (7 in `template-filters.spec.js`).

- [ ] **Step 6: Run lint, then commit**

Run: `npm run lint` — expected: no errors.

```bash
git add src/components/TemplateGalleryModal.jsx src/styles/app-shell.css e2e/template-filters.spec.js
git commit -m "Filter the builder template gallery by field"
```

---

### Task 4: Docs, full verification, version bump

**Files:**
- Modify: `changes.md` (new entry at the top, above `## Template looks on the landing page — 1.6.11`)
- Modify: `todo.md` (the Phase 4 "Still open" paragraph, ~line 2240)
- Modify: `docs/superpowers/specs/2026-10-11-template-field-filters-design.md` (Status line)
- Modify: `package.json`, `package-lock.json` (version)

**Interfaces:**
- Consumes: everything from Tasks 1–3.

- [ ] **Step 1: Add the `changes.md` entry**

Insert above `## Template looks on the landing page — 1.6.11, 2026-10-11`:

```markdown
## Field filters for templates — 1.6.12, 2026-10-11

The Free CV Templates page and the builder's template gallery have a row
of field chips: All, Tech, Creative, Business, Leadership, Graduate and
Any field (in Finnish: Kaikki, Tekniikka ja IT, Luova ala, Liiketoiminta,
Johto, Vastavalmistuneet, Kaikki alat). Picking one shows only the
templates meant for that field, with a line saying how many are shown.
Each template's fields are hand-picked for its main audience (in
`cvTemplates.js`); "Any field" holds the three templates that suit
anyone (Minimalist, Classic Professional, European) and they don't also
appear under every other chip. On the Free CV Templates page the choice
is kept in the address (`?field=tech`), so a reload, a shared link and
Back from a template page keep it; changing it doesn't add history
entries. The gallery opens on All every time. A per-template photo flag,
planned alongside, was dropped: 17 of 18 templates already show a photo
when you upload one.

```

- [ ] **Step 2: Update `todo.md`**

In the Phase 4 "Still open (not in this phase):" paragraph, replace `gallery filters and a per-template photo
flag (the original roadmap's Phase 4);` with:

```markdown
~~gallery filters and a per-template photo
flag (the original roadmap's Phase 4)~~ — filters done 1.6.12 (field
chips on the grid and in the gallery, spec
`docs/superpowers/specs/2026-10-11-template-field-filters-design.md`); the
photo flag was dropped (17 of 18 templates already show an uploaded photo,
so it wouldn't filter anything);
```

(Read the paragraph first; the exact line wrap may differ — match the existing text, not this wrap.)

- [ ] **Step 3: Mark the spec implemented**

In the spec, replace `**Status:** approved in conversation 2026-10-11; spec awaiting review` with `**Status:** approved 2026-10-11; implemented in 1.6.12`.

- [ ] **Step 4: Run the full verification**

Run each, and read the output:
- `npm run lint` — no errors.
- `for c in share reducers feedback docx-export section-schema section-columns template-pages template-variants; do npm run -s check:$c >/dev/null 2>&1 && echo "OK $c" || echo "FAIL $c"; done` — 8 × OK.
- `npm run build` — succeeds. Then confirm the new code stayed out of the entry chunk: `grep -l "Tekniikka ja IT" dist/assets/*.js` must not list the entry chunk (`index-*.js`, the one `dist/index.html` references with `<script type="module" src=...>`).
- `CI=1 npm run test:e2e` — 859 passed (852 + 7 new), 0 failed.

If anything fails, fix the cause (superpowers:systematic-debugging), never an assertion or a fixture.

- [ ] **Step 5: Commit the docs, then bump the version**

```bash
git add changes.md todo.md docs/superpowers/specs/2026-10-11-template-field-filters-design.md
git commit -m "Document the template field filters"
npm version 1.6.12 --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 1.6.12"
```

- [ ] **Step 6: Ask the user before pushing**

Report the commits and verification results, then ask: push with `git push origin HEAD:v1.6.0`? Do not push without a yes. Do not merge into `main`.
