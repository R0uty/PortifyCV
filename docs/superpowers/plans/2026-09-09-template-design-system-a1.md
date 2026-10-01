# Template Design System (A.1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up PortifyCV's shared template design language — a written
system doc, shared CSS tokens, and the two cross-cutting primitives
(URL formatting, per-template accent color) applied consistently — so the
later per-template rework has a bar to build to.

**Architecture:** One reference doc in `docs/`. One shared CSS token file
imported into the cascade. The URL fix is four call-sites adopting an
existing helper. The accent generalization replaces two hardcoded
per-template state slots / UI blocks with one registry-driven mechanism:
each template declares its accent config in `cvTemplates.js`, `uiReducer`
holds a `{ templateId: color }` map, and `SettingsModal` renders one
generic swatch block. Only `timeline` and `modernOrange` are migrated onto
it in this plan (proof); the other 14 opt in during the per-template A-fix
batch.

**Tech Stack:** React 19, hand-rolled reducers (no Redux), hand-written
utility CSS (no Tailwind build), Vite, Playwright e2e, framework-free Node
check scripts (`scripts/check-*.mjs`).

**Spec:** `docs/superpowers/specs/2026-09-09-v1.2.0-roadmap-design.md`
(section A.1). Read it alongside this plan.

## Global Constraints

- **No backend, no new runtime dependencies.** Everything ships in the
  static bundle.
- **Bilingual `en`/`fi`.** Every user-facing string is an inline
  `isFinnish ? '…' : '…'` pair (or a `{ en, fi }` object). No i18n library.
- **CSS is hand-authored utility CSS.** No Tailwind config exists; only
  the exact utility classes a file references are defined (`src/styles/utilities.css`).
  Add classes there if you need new ones — using real Tailwind hex values —
  rather than assuming a class exists.
- **html2canvas export safety:** hex colors only in `*.css` and in inline
  SVG `stop-color` (never `var()` inside an SVG); no `background-clip:text`;
  no `clip-path`; `filter:blur()` only on `data-export-ignore="true"`
  elements; `.pdf-export-root` duplicates for any `@media print` fallback.
- **`src/index.css` @import order is load-bearing** — later files override
  earlier at equal specificity. Do not reorder existing imports.
- **Commit style:** imperative subject; **no `Co-Authored-By` / Claude
  trailer** (project rule). Commit under the configured git identity only.
- **Verification gates** for any code task: `npm run lint`, `npm run build`,
  and the relevant `npm run check:*` / `npx playwright test` all pass, and
  the change is confirmed in the running app or a rendered export — not just
  by reading source (project's hard-won rule; see the
  `portifycv-modern-orange-template` memory).

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `docs/template-design-system.md` | **Create.** The written design language: type ramp, color rule, section-heading menu, structural families, content edge-case checklist, export-safety checklist, scoring rubric. Outlives this cycle. | 1 |
| `src/styles/templates/_system.css` | **Create.** Shared custom properties: the type-ramp scale for the 3 density classes, and the `--tpl-accent` convention. Consumed by templates during A-fix, not here. | 2 |
| `src/index.css` | **Modify.** Add one `@import './styles/templates/_system.css'` line, immediately after `utilities.css`. | 2 |
| `src/components/templates/CompactShowcase.jsx` | **Modify.** Render link values through `formatLinkDisplayValue()`. | 3 |
| `src/components/templates/NavyProfessionalShowcase.jsx` | **Modify.** Same. | 3 |
| `src/components/templates/TimelineShowcase.jsx` | **Modify.** Same (link values only — its accent already uses `--tl-accent`). | 3 |
| `src/components/CVPreview.jsx` | **Modify.** Flat renderer: link values through `formatLinkDisplayValue()` (Task 3); resolve + pass per-template accent (Task 5). | 3, 5 |
| `e2e/templates.spec.js` | **Modify.** Add a regression test: no raw `https://` in a template's rendered link list. | 3 |
| `src/utils/templateAccents.js` | **Create.** Named accent swatch sets (`warm`, `cool`, …) migrated from `SettingsModal.jsx`, plus `getAccentSwatches(setName)`. | 4 |
| `src/utils/cvTemplates.js` | **Modify.** Add an `accent` field to each `templateMap` entry (`{ default, swatchSet }` or `null`); populate `timeline` + `modernOrange`, `null` for the rest. Export `getTemplateAccent(templateId)`. | 4 |
| `src/reducers/uiReducer.js` | **Modify.** Replace `timelineAccentColor` / `modernOrangeAccentColor` slots + their two actions with a single `templateAccentColors` map and `SET_TEMPLATE_ACCENT_COLOR`. | 4 |
| `scripts/check-reducers.mjs` | **Modify.** Replace the `SET_TIMELINE_ACCENT_COLOR` assertions with `SET_TEMPLATE_ACCENT_COLOR` map assertions. | 4 |
| `src/pages/ResumeBuilderPage.jsx` | **Modify.** One `handleTemplateAccentColorChange` handler; pass `templateAccentColors` + handler down; drop the two old handlers/props. | 5 |
| `src/components/SettingsModal.jsx` | **Modify.** One generic accent-swatch block (shown when the selected template declares an `accent`), replacing the two hardcoded `selectedTemplate === '…'` blocks; drop the two local swatch constants. | 5 |

---

## Task 1: Write the design-system doc

**Files:**
- Create: `docs/template-design-system.md`

**Interfaces:**
- Produces: the vocabulary later tasks and the A-fix batch cite — density
  class names (`roomy` / `standard` / `compact`), the `--tpl-*` token
  names Task 2 defines, the section-heading treatment names, the structural
  family names, and the rubric axes.

- [ ] **Step 1: Draft the doc with these sections, filled in (no placeholders):**

  1. **Purpose & scope** — one paragraph: this is the bar every template
     is built and scored against; it supersedes eyeball judgement.
  2. **Type ramp.** A table with columns `roomy | standard | compact` and
     rows `name`, `title`, `section-heading`, `entry-title`, `body`, `meta`.
     Fill every cell with a concrete `rem` value and line-height. Starting
     point (adjust with judgement, but every cell must have a number):
     name 2.6/2.1/1.7rem, title 1.05/0.95/0.85rem, section-heading
     0.8/0.75/0.7rem (uppercase, tracked), entry-title 1.05/1.0/0.9rem,
     body 0.95/0.9/0.82rem, meta 0.8/0.75/0.7rem. Note that the Modern
     Orange name-fragmentation bug (see
     `portifycv-modern-orange-template` memory) came from an unconstrained
     2.4rem name — the ramp's job is to prevent that.
  3. **Color rule.** "Every template = 1 ink + 1 accent + ≤1 neutral tint.
     Accent is wayfinding only — dates, rules, section markers, icons,
     the professional-title line. Never body text, never role/company
     text." Then the **one documented exception**: a template whose
     concept *is* multicolor (Colorful Compact) may use a named capped
     palette — define that palette here as a fixed 6-swatch list.
  4. **Section-heading treatments.** A closed menu, each with a one-line
     description and which existing template uses it: `rule-under`,
     `icon-badge`, `left-tick`, `eyebrow-caps`, `numbered`. Rule: each
     template picks exactly one. Note `icon-badge` is currently on 9 of 16
     by default, not by choice.
  5. **Structural families.** `single-column-flow`, `single-column-timeline`,
     `left-rail + main`, `right-rail + main`, `dark-sidebar + main`,
     `grid`. One line each + current members. Rule: a template must be
     distinguishable by structure or a distinct typographic voice, not
     accent hue alone.
  6. **Shared primitives** (cross-reference, don't re-specify): URL
     formatting via `formatLinkDisplayValue()` everywhere; one date
     formatter (`formatDateRange`); one contact-row icon set + order;
     skills rendering (chips / inline-list / dot-rating) chosen per density
     class; accent color via the `--tpl-accent` custom property with a
     per-template default declared in `cvTemplates.js`. **Note for A-fix:**
     `formatLinkDisplayValue()` is applied to the Links section in A.1;
     Project and Certificate URL display (currently raw `https://…` in
     several templates) is a per-template A-fix task, not A.1.
  7. **Content edge-case checklist** every template must pass: long name
     (with the narrow-column-floor note from memory), no photo, 1 job, 10
     jobs, missing optional sections, one very long single skill string,
     ATS-fallback parity, PDF export rendered-back-to-image check.
  8. **Export-safety checklist** — copy the Global Constraints
     html2canvas list here verbatim, plus: no entrance animations not
     covered by the global `.pdf-export-root *{animation:none}` rule; test
     any never-before-used CSS property with a real export before trusting
     a screenshot.
  9. **Quality rubric.** A 0–3 scored sheet, one row per axis: typography
     discipline, color discipline, structural clarity, density handling,
     content edge-cases, ATS-fallback parity, export fidelity. 0 = fails,
     3 = exemplary. A template scoring ≥2 on every axis is "keep"; any 0 or
     1 flags "polish" or "rework".

- [ ] **Step 2: Self-check the doc** — every type-ramp cell has a number;
  the color rule names its one exception; the heading menu and structural
  families each list current members; the rubric has a pass threshold.

- [ ] **Step 3: Commit**

```bash
git add docs/template-design-system.md
git commit -m "Add the template design-system reference doc"
```

---

## Task 2: Shared CSS design tokens

**Files:**
- Create: `src/styles/templates/_system.css`
- Modify: `src/index.css` (add one `@import`)

**Interfaces:**
- Produces: CSS custom properties on `:root` — `--tpl-name-size`,
  `--tpl-name-lh`, `--tpl-title-size`, `--tpl-heading-size`,
  `--tpl-entry-title-size`, `--tpl-body-size`, `--tpl-meta-size` for the
  `standard` density (bare `:root`), overridden under
  `.tpl-density-roomy` / `.tpl-density-compact` scoping classes. Plus the
  documented `--tpl-accent` convention (no value set here — each Showcase
  root sets it inline, mirroring the existing `--tl-accent` pattern in
  `TimelineShowcase.jsx`).
- Consumed by: nothing in this plan. Templates adopt these during A-fix.

- [ ] **Step 1: Create `src/styles/templates/_system.css`** with the
  `standard` values on `:root` and `roomy`/`compact` overrides on scoping
  classes, using the exact numbers from the Task 1 doc's type-ramp table.
  Include a top comment: "Shared template type ramp — see
  docs/template-design-system.md. Templates opt in by setting
  font-size: var(--tpl-…) and adding a density class to their root.
  Not yet adopted by every template (A-fix)."

- [ ] **Step 2: Add the import to `src/index.css`** on the line
  immediately after `@import './styles/utilities.css';`:

```css
@import './styles/templates/_system.css';
```

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: succeeds; `dist/assets/*.css` contains `--tpl-name-size`.

- [ ] **Step 4: Verify tokens resolve in the browser**

Run: `npm run dev`, open `http://localhost:5173/cv`, in the console:
`getComputedStyle(document.documentElement).getPropertyValue('--tpl-body-size')`
Expected: the `standard` value from the doc (non-empty).

- [ ] **Step 5: Commit**

```bash
git add src/styles/templates/_system.css src/index.css
git commit -m "Add shared template type-ramp CSS tokens"
```

---

## Task 3: Apply the URL-formatting primitive everywhere

**Files:**
- Modify: `src/components/templates/CompactShowcase.jsx`
- Modify: `src/components/templates/NavyProfessionalShowcase.jsx`
- Modify: `src/components/templates/TimelineShowcase.jsx`
- Modify: `src/components/CVPreview.jsx`
- Test: `e2e/templates.spec.js`

**Interfaces:**
- Consumes: `formatLinkDisplayValue(value: string): string` from
  `src/utils/shared.js` — strips `^https?://` and trailing slashes.
  Already re-exported from `src/components/templates/shared.jsx`.
- Produces: nothing new; a behavior fix.

- [ ] **Step 1: Write the failing e2e test** in `e2e/templates.spec.js`,
  reusing the file's existing `selectTemplate(page, label)` helper:

```js
test.describe('Link URL formatting', () => {
  test('templates render link values without the https:// scheme', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).click()

    for (const label of ['Compact', 'Navy Professional', 'Modern Timeline']) {
      await selectTemplate(page, label)
      const preview = page.locator('[data-export-root]')
      // Target the exact raw link strings, not a blanket /https:\/\// —
      // the demo CV's Project entries legitimately render full project URLs
      // (out of scope for A.1; those become a per-template A-fix item).
      await expect(preview.getByText('linkedin.com/in/alexmorgan', { exact: false })).toBeVisible()
      await expect(preview.getByText('https://linkedin.com/in/alexmorgan')).toHaveCount(0)
      await expect(preview.getByText('https://github.com/alexmorgan')).toHaveCount(0)
    }
  })
})
```

If the demo CV's stored link values turn out not to carry the `https://`
prefix (check `src/utils/cvForm.js` demo data), assert instead that each
`<template>` renders `github.com/alexmorgan` with no leading scheme by
reading the link element's text directly. The point of the test is: the
Links section shows scheme-stripped values.

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx playwright test e2e/templates.spec.js -g "without the https"`
Expected: FAIL — `https://` still present in Compact / Navy / Timeline.
(First run downloads Chromium if needed: `npx playwright install chromium`.)

- [ ] **Step 3: Fix `CompactShowcase.jsx`** — find where link entries
  render their value (grep the file for `links` / `linkEntries` / the
  value expression) and wrap the displayed value in
  `formatLinkDisplayValue(value)`. Import it from `../../utils/shared`
  (match the import style already in the file; `DeveloperShowcase.jsx`
  line ~4 shows the pattern). Keep the real value for any `href`.

- [ ] **Step 4: Fix `NavyProfessionalShowcase.jsx`** — same change at its
  sidebar link rows.

- [ ] **Step 5: Fix `TimelineShowcase.jsx`** — same change at its
  header/contact link rows. (Do **not** touch its `--tl-accent` wiring.)

- [ ] **Step 6: Fix `CVPreview.jsx`** — the flat renderer's links block
  (grep for `formatLinkLabel` — the value renders next to it, ~line 957).
  Wrap the value in `formatLinkDisplayValue`; add it to the existing
  `import { … } from` block that already pulls `formatLinkLabel`.

- [ ] **Step 7: Run the test and confirm it passes**

Run: `npx playwright test e2e/templates.spec.js -g "without the https"`
Expected: PASS.

- [ ] **Step 8: Full checks**

Run: `npm run lint && npm run build && npm run check:share && npx playwright test e2e/templates.spec.js`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/templates/CompactShowcase.jsx src/components/templates/NavyProfessionalShowcase.jsx src/components/templates/TimelineShowcase.jsx src/components/CVPreview.jsx e2e/templates.spec.js
git commit -m "Render link URLs without the scheme in every template"
```

---

## Task 4: Generalize accent-color state into a registry + map

**Files:**
- Create: `src/utils/templateAccents.js`
- Modify: `src/utils/cvTemplates.js`
- Modify: `src/reducers/uiReducer.js`
- Modify: `scripts/check-reducers.mjs`

**Interfaces:**
- Produces:
  - `src/utils/templateAccents.js`:
    - `ACCENT_SWATCH_SETS: Record<string, Array<{ color: string, label: { en: string, fi: string } }>>`
      — at minimum keys `'warm'` (the current `MODERN_ORANGE_ACCENT_SWATCHES`
      list) and `'cool'` (the current `TIMELINE_ACCENT_SWATCHES` list),
      copied verbatim from `SettingsModal.jsx` lines ~7–28.
    - `getAccentSwatches(setName: string): Array<{ color, label }>` —
      returns `ACCENT_SWATCH_SETS[setName]` or `ACCENT_SWATCH_SETS.cool`
      as a fallback.
  - `src/utils/cvTemplates.js`:
    - each `templateMap[id]` gains `accent: { default: string, swatchSet: string } | null`.
      `timeline` → `{ default: '#6d28d9', swatchSet: 'cool' }`,
      `modernOrange` → `{ default: '#f28c00', swatchSet: 'warm' }`,
      **every other entry → `null`**.
    - `getTemplateAccent(templateId: string): { default: string, swatchSet: string } | null`
      — `templateMap[templateId]?.accent ?? null`.
  - `src/reducers/uiReducer.js`:
    - `UI_ACTION.SET_TEMPLATE_ACCENT_COLOR = 'SET_TEMPLATE_ACCENT_COLOR'`
      (the `SET_TIMELINE_ACCENT_COLOR` and `SET_MODERN_ORANGE_ACCENT_COLOR`
      keys are **removed**).
    - `createInitialUiState` returns `templateAccentColors: Record<string, string>`
      built as `{ [id]: entry.accent.default }` for every `templateMap`
      entry whose `accent` is non-null (drop the `timelineAccentColor` /
      `modernOrangeAccentColor` scalar fields).
    - reducer handles `SET_TEMPLATE_ACCENT_COLOR` with
      `action.templateId` + `action.color`:
      `{ ...state, templateAccentColors: { ...state.templateAccentColors, [action.templateId]: action.color } }`.
- Consumes: `TIMELINE_DEFAULT_ACCENT_COLOR` / `MODERN_ORANGE_DEFAULT_ACCENT_COLOR`
  imports in `uiReducer.js` are **removed** — the defaults now come from
  `cvTemplates.js` (already eagerly bundled, already imported for
  `defaultTemplateId`), so the lazy-chunk concern in that file's header
  comment no longer applies. Leave `TIMELINE_DEFAULT_ACCENT_COLOR` exported
  from `timeline.js` (TimelineShowcase still uses it as a prop default);
  same for `modernOrange.js`.

- [ ] **Step 1: Create `src/utils/templateAccents.js`** with
  `ACCENT_SWATCH_SETS` (`warm` = the 6 Modern Orange swatches, `cool` =
  the 6 Timeline swatches, copied exactly incl. `{ en, fi }` labels) and
  `getAccentSwatches`.

- [ ] **Step 2: Add `accent` to `cvTemplates.js`** — one field per
  `templateMap` entry (`timeline` and `modernOrange` populated as above,
  all others `null`), and the `getTemplateAccent` export at the bottom
  near `getCvTemplate`.

- [ ] **Step 3: Update the failing reducer check** in
  `scripts/check-reducers.mjs` — replace lines ~396–398:

```js
check(
  'createInitialUiState seeds templateAccentColors for accent-capable templates',
  typeof state.templateAccentColors === 'object'
    && typeof state.templateAccentColors.timeline === 'string'
    && typeof state.templateAccentColors.modernOrange === 'string',
)
const nextAccent = uiReducer(state, {
  type: UI_ACTION.SET_TEMPLATE_ACCENT_COLOR,
  templateId: 'timeline',
  color: '#2563eb',
})
check(
  'SET_TEMPLATE_ACCENT_COLOR updates only the named template',
  nextAccent.templateAccentColors.timeline === '#2563eb'
    && nextAccent.templateAccentColors.modernOrange === state.templateAccentColors.modernOrange,
)
```

- [ ] **Step 4: Run the check and confirm it fails**

Run: `npm run check:reducers`
Expected: FAIL — `templateAccentColors` / `SET_TEMPLATE_ACCENT_COLOR` don't
exist yet.

- [ ] **Step 5: Refactor `uiReducer.js`** — remove the two old action
  keys, the two scalar state fields, the two `SET_*_ACCENT_COLOR` cases,
  and the two `import { *_DEFAULT_ACCENT_COLOR }` lines and their header
  comment. Import `templateMap` accessor: add `getTemplateAccent` and a
  way to iterate — simplest is to `import { cvTemplates } from '../utils/cvTemplates'`
  (already the `en` list) and build the map from it. Add
  `templateAccentColors` to `createInitialUiState` and the
  `SET_TEMPLATE_ACCENT_COLOR` case.

- [ ] **Step 6: Run the check and confirm it passes**

Run: `npm run check:reducers`
Expected: PASS (all assertions, including the pre-existing ones).

- [ ] **Step 7: Build (will surface the now-broken consumers)**

Run: `npm run build`
Expected: **may fail** in `ResumeBuilderPage.jsx` / `SettingsModal.jsx` /
`CVPreview.jsx` — those are fixed in Task 5. If the build fails *only*
there, that's expected; note it and continue. `npm run lint` should still
pass for the files touched in this task.

- [ ] **Step 8: Commit**

```bash
git add src/utils/templateAccents.js src/utils/cvTemplates.js src/reducers/uiReducer.js scripts/check-reducers.mjs
git commit -m "Move template accent color into a per-template registry"
```

---

## Task 5: Wire the generalized accent through the UI and render path

**Files:**
- Modify: `src/pages/ResumeBuilderPage.jsx`
- Modify: `src/components/SettingsModal.jsx`
- Modify: `src/components/CVPreview.jsx`
- Test: `e2e/templates.spec.js` (or a new `e2e/appearance.spec.js`)

**Interfaces:**
- Consumes: `templateAccentColors` (map) and
  `UI_ACTION.SET_TEMPLATE_ACCENT_COLOR` from Task 4; `getTemplateAccent`,
  `getAccentSwatches` from Task 4.
- Produces:
  - `ResumeBuilderPage.jsx`: `handleTemplateAccentColorChange(color: string)`
    → `dispatchUi({ type: UI_ACTION.SET_TEMPLATE_ACCENT_COLOR, templateId: selectedTemplate, color })`.
    Passes `templateAccentColors` + `onTemplateAccentColorChange` to
    `SettingsModal`; passes the *resolved* accent for the current template
    to `CVPreview` as `accentColor` (single prop, replacing
    `timelineAccentColor` / `modernOrangeAccentColor`).
  - `SettingsModal.jsx`: one `accentConfig = getTemplateAccent(selectedTemplate)`;
    when non-null, render one `settings-row` with
    `getAccentSwatches(accentConfig.swatchSet)`, the active check driven by
    `templateAccentColors[selectedTemplate] ?? accentConfig.default`,
    `onClick={() => onTemplateAccentColorChange(swatch.color)}`. Generic
    label/hint: EN "Accent color" / "Colors the name, headings, and
    accents." — FI "Aksenttiväri" / "Väri näkyy nimessä, otsikoissa ja
    aksenteissa." The two hardcoded `selectedTemplate === 'timeline'` /
    `=== 'modernOrange'` blocks and the two local swatch `const`s are
    **removed**.
  - `CVPreview.jsx`: takes one `accentColor` prop; passes it to
    `TimelineShowcase` and `ModernOrangeShowcase` where it currently passes
    `timelineAccentColor` / `modernOrangeAccentColor` (lines ~168, ~314).

- [ ] **Step 1: Write the failing e2e test** — accent choice reaches the
  preview. Add to `e2e/templates.spec.js`:

```js
test.describe('Template accent color', () => {
  test('choosing a swatch recolors the Modern Timeline preview', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).click()
    await selectTemplate(page, 'Modern Timeline')

    await page.getByRole('button', { name: 'Settings' }).click()
    // 'Blue' is the 2nd swatch in the 'cool' set (#2563eb)
    await page.getByRole('button', { name: 'Blue' }).click()
    await page.getByRole('button', { name: /close/i }).click()

    const root = page.locator('.timeline-showcase')
    await expect(root).toHaveCSS('--tl-accent', 'rgb(37, 99, 235)')
  })
})
```

  Adjust selectors to the real Settings-open control and the Showcase root
  class if they differ (grep `TimelineShowcase.jsx` for the root
  `className` and the `--tl-accent` line, ~386).

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx playwright test e2e/templates.spec.js -g "recolor the Modern Timeline"`
Expected: FAIL (build is currently broken from Task 4, or the swatch does
nothing).

- [ ] **Step 3: Fix `ResumeBuilderPage.jsx`** — replace the two
  `handleTimelineAccentColorChange` / `handleModernOrangeAccentColorChange`
  callbacks (~lines 950–956) with one `handleTemplateAccentColorChange`.
  Replace the destructured `timelineAccentColor` / `modernOrangeAccentColor`
  (~lines 363–364, 1821–1822) with `templateAccentColors`. At the
  `CVPreview` call sites (~1796, ~1970) pass
  `accentColor={templateAccentColors[selectedTemplate] ?? getTemplateAccent(selectedTemplate)?.default}`
  instead of the two separate props. At the `SettingsModal` call site
  (~1970–1973) pass `templateAccentColors={templateAccentColors}` and
  `onTemplateAccentColorChange={handleTemplateAccentColorChange}`, dropping
  the four old props. Import `getTemplateAccent` from `../utils/cvTemplates`.

- [ ] **Step 4: Fix `SettingsModal.jsx`** — delete
  `TIMELINE_ACCENT_SWATCHES` / `MODERN_ORANGE_ACCENT_SWATCHES` and their
  comments; import `getAccentSwatches` from `../utils/templateAccents` and
  `getTemplateAccent` from `../utils/cvTemplates`. Replace the two
  conditional blocks (~lines 93–147) with one:

```jsx
{(() => {
  const accentConfig = getTemplateAccent(selectedTemplate)
  if (!accentConfig) return null
  const active = templateAccentColors[selectedTemplate] ?? accentConfig.default
  return (
    <div className="settings-row">
      <div>
        <p className="settings-row__label">{isFinnish ? 'Aksenttiväri' : 'Accent color'}</p>
        <p className="settings-row__hint">
          {isFinnish
            ? 'Väri näkyy nimessä, otsikoissa ja aksenteissa.'
            : 'Colors the name, headings, and accents.'}
        </p>
      </div>
      <div className="settings-swatch-row" role="group" aria-label={isFinnish ? 'Aksenttiväri' : 'Accent color'}>
        {getAccentSwatches(accentConfig.swatchSet).map((swatch) => (
          <button
            key={swatch.color}
            type="button"
            className={`settings-swatch${swatch.color === active ? ' settings-swatch--active' : ''}`}
            style={{ backgroundColor: swatch.color }}
            aria-pressed={swatch.color === active}
            aria-label={swatch.label[locale] ?? swatch.label.en}
            title={swatch.label[locale] ?? swatch.label.en}
            onClick={() => onTemplateAccentColorChange(swatch.color)}
          />
        ))}
      </div>
    </div>
  )
})()}
```

  Update the `SettingsModal` props: drop `timelineAccentColor`,
  `onTimelineAccentColorChange`, `modernOrangeAccentColor`,
  `onModernOrangeAccentColorChange`; add `templateAccentColors`,
  `onTemplateAccentColorChange`.

- [ ] **Step 5: Fix `CVPreview.jsx`** — replace the `timelineAccentColor`
  / `modernOrangeAccentColor` props (~54–55) with one `accentColor`; use
  it at both Showcase call sites (~168, ~314).

- [ ] **Step 6: Run lint + build**

Run: `npm run lint && npm run build`
Expected: both pass (Task 4's expected breakage is now resolved).

- [ ] **Step 7: Run the e2e test + confirm it passes**

Run: `npx playwright test e2e/templates.spec.js`
Expected: PASS — including the new accent test and the Task 3 URL test.

- [ ] **Step 8: Manual confirm in the running app** (project rule — don't
  trust source alone). `npm run dev`; on `/cv` with demo CV:
  - Modern Timeline → Settings → pick "Teal" → preview name/timeline/tags
    turn teal; reopen Settings, "Teal" is marked active.
  - Modern Orange → Settings → pick "Rust" → title badge / timeline / dot
    ratings turn rust.
  - Any third template (e.g. Developer) → Settings shows **no** accent row
    (its `accent` is `null`).

- [ ] **Step 9: Full check sweep**

Run: `npm run lint && npm run build && npm run check:reducers && npm run check:share && npm run check:feedback && npx playwright test`
Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add src/pages/ResumeBuilderPage.jsx src/components/SettingsModal.jsx src/components/CVPreview.jsx e2e/templates.spec.js
git commit -m "Drive the Settings accent swatch from the template registry"
```

---

## Self-Review (completed by plan author)

**Spec coverage (A.1 in the roadmap):**
- Design-system doc → Task 1. ✅ (type ramp, color rule, heading menu,
  structural families, edge-case + export-safety checklists, rubric)
- Type-ramp / spacing tokens → Task 2. ✅ (defined + imported; adoption is
  A-fix, as the spec says)
- URL primitive everywhere → Task 3. ✅ (Compact, Navy, Timeline,
  CVPreview — the four the grep found)
- Accent color on every template → Tasks 4–5 deliver the *mechanism* +
  migrate the 2 existing; the roadmap's A.1 line and the "opt out
  explicitly" clause say the other 14 opt in during A-fix. ✅
- Contact-row / date-formatter unification → **documented in Task 1 only**;
  no code task. Matches the spec (A.1 lists them under "shared primitives"
  to define; the date formatter already exists and the contact row is a
  per-template A-fix concern). No gap.
- A.4 (template quick-switcher) → **not in this plan** — the roadmap
  sequences it after A.2, with B. Correct to exclude.

**Placeholder scan:** none — every step has concrete content, code, or an
exact command. Type-ramp values are given as concrete starting numbers
with permission to adjust in Task 1 (the doc *is* where they're decided).

**Type consistency:** `templateAccentColors` (map), `SET_TEMPLATE_ACCENT_COLOR`
(with `templateId` + `color`), `getTemplateAccent` → `{ default, swatchSet } | null`,
`getAccentSwatches(setName)`, `accentColor` (single CVPreview prop),
`onTemplateAccentColorChange(color)` — used consistently across Tasks 4 and 5.

---

## Execution notes

- Tasks 1–3 are independent of 4–5 and of each other; 4 must precede 5
  (5 fixes the consumers 4 breaks).
- Task 4 leaves `npm run build` failing on purpose (consumers not yet
  updated); only Task 5 restores green. If executing task-by-task with a
  review gate, note this in the Task 4 handoff so the reviewer doesn't
  treat the build failure as a defect.
