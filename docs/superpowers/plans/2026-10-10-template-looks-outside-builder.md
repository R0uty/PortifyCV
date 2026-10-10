# Template Looks Outside the Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show each template's three style looks (Phase 3) on the builder's template gallery, the Free CV Templates grid and the per-template pages, and carry a chosen look into the builder.

**Architecture:**
- A pure resolver, `getVariantLook`, plus two URL helpers in `src/utils/templateVariants.js` feed a new `StyleSwatchGroup` radio component.
- `TemplateThumbnail`/`ScaledPreview` gain look props.
- Each surface keeps its own "previewed look" state.
- The builder gallery's Use applies template and look through the same dispatch pair the toolbar Style picker uses.
- Public pages pass the look as `?style=<variantId>`, which the builder's initial session applies like `?example=`.

**Tech Stack:**
- React 19 + Vite, with hand-written utility CSS (no Tailwind).
- Playwright e2e against a production build.
- Framework-free Node `check:*` scripts.

**Spec:** `docs/superpowers/specs/2026-10-10-template-looks-outside-builder-design.md`. Read it before starting any task.

## Global Constraints

- Work on the worktree branch that tracks `origin/v1.6.0`. Push only with the user's OK (`git push origin HEAD:v1.6.0`). Never merge into `main`.
- Commits carry only the user's name: **no `Co-Authored-By` line and no attribution trailer of any kind**.
- Each unit of work ends with a standalone commit, `Bump version to X`, made with `npm version X --no-git-tag-version` (it touches `package.json` and `package-lock.json`). The units are 1.6.1 (Task 2), 1.6.2 (Task 3), 1.6.3 (Task 4) and 1.6.4 (Task 5).
- Variant ids are permanent; only use ids from `TEMPLATE_VARIANTS`. Variant #1's id is `'default'` (`DEFAULT_STYLE_VARIANT_ID`). Never write `?style=default` into a URL.
- `App.jsx`, `pageMeta.js` and `routes.js` (the entry graph) must not import `templateVariants.js`.
- No layout, density or page-count change. `e2e/fixtures/pdfPages.js` and `e2e/fixtures/layoutAllowlist.js` stay untouched.
- Bilingual copy (`en`/`fi`) as inline `isFinnish ? … : …` pairs: "Style"/"Tyyli", "Use this style"/"Käytä tyyliä".
- Relative imports inside `src/utils/templateVariants.js` keep their explicit `.js` (Playwright and the check scripts import it under plain Node ESM).
- Before claiming the phase works: `npm run lint`, all 8 `npm run check:*` scripts, `CI=1 npm run test:e2e`, and `npm run build`.
- The scratchpad for temporary files is `/tmp/claude-1000/-run-media-yan-e3ba5476-73a2-4d71-899c-ab2f5918769c-projects-PortifyCV--claude-worktrees-gifted-herschel-2a6c2f/a85da5c6-2662-49db-b5d2-2784dc174630/scratchpad` (call it `$SCRATCH` below).

---

### Task 1: Look helpers in `templateVariants.js`

**Files:**
- Modify: `src/utils/templateVariants.js` (the `cvFonts.js` import at the top, plus new exports after `getVariantSwatches`)
- Modify: `scripts/check-template-variants.mjs` (the imports near line 37, and the `Helpers` block before the final `console.log`)

**Interfaces:**
- Produces:
  - `getVariantLook(templateId: string, variantId?: string) => { styleVariantId: string, accentColor: string|undefined, fontId: string, fontStack: string, headingColor: string }`
  - `parseStyleVariantParam(templateId: string, raw: string|null|undefined) => string`: a valid variant id of that template, else `'default'`.
  - `styleVariantSearch(variantId?: string) => string`: `''` for `'default'`/empty, else `?style=<id>`.

- [ ] **Step 0: Record the bundle baseline** (used in Task 5's `changes.md` entry)

Run: `npm run build 2>&1 | grep -E 'dist/assets/.*\.js' > "$SCRATCH/bundle-before.txt"; wc -l "$SCRATCH/bundle-before.txt"`
Expected: a non-zero line count.

- [ ] **Step 1: Write the failing checks**

In `scripts/check-template-variants.mjs`, extend the destructured `templateVariants.js` import and the other imports:

```js
const {
  DEFAULT_STYLE_VARIANT_ID,
  TEMPLATE_VARIANTS,
  getTemplateVariants,
  getTemplateVariant,
  resolveStyleVariantId,
  getPaletteVariables,
  getVariantPaletteStyle,
  getVariantSwatches,
  isStyleVariantModified,
  getVariantLook,
  parseStyleVariantParam,
  styleVariantSearch,
} = await importSrc('utils/templateVariants.js')
const { cvTemplates, getTemplateAccent, resolveTemplateAccent } = await importSrc('utils/cvTemplates.js')
const { CV_FONT_OPTIONS, getCvFontStack } = await importSrc('utils/cvFonts.js')
```

Add this block just before the final `console.log(failures === 0 ? …)` line:

```js
console.log('\nLooks outside the builder (Phase 4)\n')

{
  const creativeFirst = getTemplateVariant('creative', 'default')
  const fallback = getVariantLook('creative', 'no-such-look')
  check('getVariantLook falls back to variant #1 for an unknown id',
    fallback.styleVariantId === 'default' && fallback.accentColor === creativeFirst.accent)
  check('getVariantLook falls back to variant #1 for an undefined id',
    getVariantLook('creative').styleVariantId === 'default')
  const mismatches = []
  templateIds.forEach((id) => getTemplateVariants(id).forEach((variant) => {
    const look = getVariantLook(id, variant.id)
    const expected = {
      styleVariantId: variant.id,
      accentColor: variant.accent ?? resolveTemplateAccent(null, id),
      fontId: variant.fontId,
      fontStack: getCvFontStack(variant.fontId),
      headingColor: variant.headingColor,
    }
    if (JSON.stringify(look) !== JSON.stringify(expected)) mismatches.push(`${id}/${variant.id}`)
  }))
  check('getVariantLook returns each look\'s own id, accent, font and headings colour',
    mismatches.length === 0, mismatches.join(', '))
  check('getVariantLook: an accent-less template has no accent',
    getVariantLook('developer', 'default').accentColor === undefined)

  const developerIds = getTemplateVariants('developer').map((variant) => variant.id)
  check('parseStyleVariantParam accepts the template\'s own look',
    parseStyleVariantParam('developer', developerIds[1]) === developerIds[1])
  check('parseStyleVariantParam: missing → default', parseStyleVariantParam('developer', null) === DEFAULT_STYLE_VARIANT_ID)
  check('parseStyleVariantParam: unknown id → default', parseStyleVariantParam('developer', 'nope') === DEFAULT_STYLE_VARIANT_ID)
  check('parseStyleVariantParam: unknown template → default', parseStyleVariantParam('no-such-template', developerIds[1]) === DEFAULT_STYLE_VARIANT_ID)
  const foreignId = templateIds
    .flatMap((id) => getTemplateVariants(id).map((variant) => variant.id))
    .find((variantId) => !developerIds.includes(variantId))
  check('parseStyleVariantParam: another template\'s look id → default',
    foreignId === undefined || parseStyleVariantParam('developer', foreignId) === DEFAULT_STYLE_VARIANT_ID)

  check('styleVariantSearch: variant #1 writes nothing', styleVariantSearch(DEFAULT_STYLE_VARIANT_ID) === '')
  check('styleVariantSearch: no id writes nothing', styleVariantSearch(undefined) === '')
  check('styleVariantSearch: a look writes ?style=', styleVariantSearch(developerIds[1]) === `?style=${developerIds[1]}`)
}
```

`templateIds` already exists in the script; confirm with `grep -n "const templateIds" scripts/check-template-variants.mjs`. If it doesn't, add `const templateIds = Object.keys(TEMPLATE_VARIANTS)` above this block.

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run check:template-variants`
Expected: it fails with `TypeError: getVariantLook is not a function` (or FAIL lines), and exits non-zero.

- [ ] **Step 3: Implement the helpers**

In `src/utils/templateVariants.js`, change the font import to:

```js
import { DEFAULT_CV_FONT_ID, getCvFontStack } from './cvFonts.js'
```

Add these right after `getVariantSwatches`:

```js
// What a thumbnail or preview outside the builder (gallery cards, the Free
// CV Templates grid, template pages; Phase 4) needs to render one look:
// its palette id, accent, font and headings colour. An unknown id falls
// back to variant #1, like getTemplateVariant.
export function getVariantLook(templateId, variantId) {
  const variant = getTemplateVariant(templateId, variantId)
  const fontId = variant?.fontId ?? DEFAULT_CV_FONT_ID
  return {
    styleVariantId: variant?.id ?? DEFAULT_STYLE_VARIANT_ID,
    accentColor: variant?.accent ?? resolveTemplateAccent(null, templateId),
    fontId,
    fontStack: getCvFontStack(fontId),
    headingColor: variant?.headingColor ?? '',
  }
}

// A `?style=` value (template page, builder deep link) checked against the
// template's own looks; anything else (missing, unknown, another
// template's id) is variant #1.
export function parseStyleVariantParam(templateId, raw) {
  return getTemplateVariants(templateId).find((variant) => variant.id === raw)?.id
    ?? DEFAULT_STYLE_VARIANT_ID
}

// The query string that carries a look to another page. Variant #1 is
// never written into a URL: it's the absence of `?style=`.
export function styleVariantSearch(variantId) {
  return variantId && variantId !== DEFAULT_STYLE_VARIANT_ID
    ? `?style=${encodeURIComponent(variantId)}`
    : ''
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npm run check:template-variants`
Expected: `All template-variant checks passed.`, exit 0.

- [ ] **Step 5: Lint and commit**

Run: `npm run lint`
Expected: no errors.

```bash
git add src/utils/templateVariants.js scripts/check-template-variants.mjs
git commit -m "Add look helpers for showing style variants outside the builder"
```

---

### Task 2: `StyleSwatchGroup`, and look props on the thumbnail and preview (1.6.1)

**Files:**
- Create: `src/components/StyleSwatchGroup.jsx`
- Modify: `src/components/TemplateThumbnail.jsx`
- Modify: `src/components/ScaledPreview.jsx`
- Modify: `src/styles/app-shell.css` (append the new block after the `.cv-style-switcher__chip + .cv-style-switcher__chip` rule, near line 1866)

**Interfaces:**
- Consumes: `getTemplateVariants`, `getVariantSwatches` (existing), and Task 1's `getVariantLook` shape.
- Produces:
  - `<StyleSwatchGroup templateId value onChange(variantId) locale name label size="card"|"page" />`. It renders `role="radiogroup"` with `aria-label={label}`, and one native radio per look whose accessible name is the look's label (`variant.label[en|fi]`). It returns `null` for a template with fewer than 2 looks.
  - `TemplateThumbnail` props: `styleVariantId`, `accentColor`, `fontId`, plus the existing `fontStack`, `headingColor`. `{...getVariantLook(id, look)}` can be spread straight in.
  - `ScaledPreview` props: `styleVariantId`, `fontId`, `fontStack`, `headingColor`, plus the existing `accentColor`, `atsFriendlyMode`.

There's no behaviour change in this task. Nothing renders `StyleSwatchGroup` yet, and the new props default to today's values. Its tests arrive with the first consumer (Task 3).

- [ ] **Step 1: Create the component**

`src/components/StyleSwatchGroup.jsx`:

```jsx
import { getTemplateVariants, getVariantSwatches } from '../utils/templateVariants'

// A template's looks (Phase 3) as a row of colour strips, for the places
// outside the builder that show them: gallery cards, the Free CV Templates
// grid and the template pages (Phase 4). Native radios, so Tab enters the
// group and the arrow keys move between looks; each input covers its whole
// option at opacity 0, so the strip itself is the click target. Choosing
// only reports the id: the caller decides what it means (a card preview,
// a URL, the builder).
function StyleSwatchGroup({ templateId, value, onChange, locale = 'en', name, label, size = 'card' }) {
  const lang = locale === 'fi' ? 'fi' : 'en'
  const variants = getTemplateVariants(templateId)

  if (variants.length < 2) {
    return null
  }

  return (
    <div role="radiogroup" aria-label={label} className={`style-swatches style-swatches--${size}`}>
      {variants.map((variant) => (
        <label key={variant.id} className="style-swatches__option" title={variant.label[lang]}>
          <input
            type="radio"
            name={name}
            value={variant.id}
            checked={variant.id === value}
            onChange={() => onChange(variant.id)}
            aria-label={variant.label[lang]}
          />
          <span className="style-swatches__strip" aria-hidden="true">
            {getVariantSwatches(templateId, variant).map((color, index) => (
              <span key={index} className="style-swatches__chip" style={{ background: color }} />
            ))}
          </span>
          {size === 'page' ? (
            <span className="style-swatches__label" aria-hidden="true">{variant.label[lang]}</span>
          ) : null}
        </label>
      ))}
    </div>
  )
}

export default StyleSwatchGroup
```

- [ ] **Step 2: Add the styles**

Append to `src/styles/app-shell.css`, right after the `.cv-style-switcher__chip + .cv-style-switcher__chip { … }` rule:

```css
/* StyleSwatchGroup (Phase 4): a template's looks as colour strips on the
   gallery cards, the Free CV Templates grid and the template pages. The
   radio covers its whole option at opacity 0 (not display:none), so it
   stays focusable and clickable and the strip is the hit target. */
.style-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.style-swatches__option {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 1.75rem;
  padding: 0.3rem 0.55rem;
  border: 1.5px solid var(--app-border);
  border-radius: 999px;
  background: var(--app-surface);
  cursor: pointer;
}

.style-swatches__option input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.style-swatches__option:has(input:checked) {
  border-color: var(--app-text);
}

.style-swatches__option:has(input:focus-visible) {
  outline: 2px solid var(--app-text);
  outline-offset: 2px;
}

.style-swatches__strip {
  display: inline-flex;
}

.style-swatches__chip {
  width: 0.85rem;
  height: 0.85rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 999px;
}

.style-swatches__chip + .style-swatches__chip {
  margin-left: -0.25rem;
}

/* The template page's picker matches its Examples radios beside it. */
.style-swatches--page .style-swatches__option {
  border-radius: 0;
  padding: 0.4rem 0.8rem;
  font-size: var(--text-body-sm);
}

.style-swatches--page .style-swatches__option:has(input:checked) {
  border-color: #111111;
}

.style-swatches--page .style-swatches__option:has(input:focus-visible) {
  outline-color: #111111;
}
```

Confirm the tokens exist before relying on them: `grep -n -- "--app-border:\|--app-surface:\|--app-text:\|--space-2:\|--text-body-sm:" src/styles/tokens.css src/styles/app-shell.css | head`. Every one should match at least once. If one is missing, use the token its neighbours in `app-shell.css` use for the same purpose.

- [ ] **Step 3: Add the look props to `TemplateThumbnail`**

In `src/components/TemplateThumbnail.jsx`, import `loadCvFont`, and change the signature, effect and `CVPreview` call:

```jsx
import { memo, useEffect, useRef, useState } from 'react'

import CVPreview from './CVPreview'
import { loadCvFont } from '../utils/cvFonts'
```

```jsx
const TemplateThumbnail = memo(function TemplateThumbnail({
  templateId,
  formData,
  locale,
  fontId,
  fontStack,
  headingColor,
  accentColor,
  styleVariantId = 'default',
}) {
```

Add this effect after the existing ResizeObserver effect:

```jsx
  // A look's font may be a lazily loaded one (Calibri/Carlito, Lato);
  // outside the builder nothing else loads it (Phase 4). A failed chunk
  // just leaves the fallback face.
  useEffect(() => {
    if (fontId) {
      loadCvFont(fontId).catch(() => {})
    }
  }, [fontId])
```

Replace the `CVPreview` line with:

```jsx
        <CVPreview
          formData={formData}
          template={templateId}
          locale={locale}
          headingColor={headingColor}
          accentColor={accentColor}
          styleVariantId={styleVariantId}
        />
```

- [ ] **Step 4: Add the look props to `ScaledPreview`**

In `src/components/ScaledPreview.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'

import CVPreview from './CVPreview'
import { loadCvFont } from '../utils/cvFonts'
```

```jsx
function ScaledPreview({
  formData,
  template,
  locale,
  atsFriendlyMode = false,
  accentColor,
  styleVariantId = 'default',
  fontId,
  fontStack,
  headingColor,
}) {
```

Add after the existing ResizeObserver effect:

```jsx
  // Same reason as TemplateThumbnail: a look's lazily loaded font.
  useEffect(() => {
    if (fontId) {
      loadCvFont(fontId).catch(() => {})
    }
  }, [fontId])
```

Change the page `div`'s `style` and the `CVPreview` call:

```jsx
        style={{
          ...(scale ? { transform: `scale(${scale})` } : null),
          // The look's font, as TemplateThumbnail's --font-sans override.
          ...(fontStack ? { '--font-sans': fontStack } : null),
        }}
      >
        <CVPreview
          formData={formData}
          template={template}
          locale={locale}
          atsFriendlyMode={atsFriendlyMode}
          accentColor={accentColor}
          headingColor={headingColor}
          styleVariantId={styleVariantId}
        />
```

`CVPreview`'s `headingColor` defaults to `null`; passing `undefined` keeps that default.

- [ ] **Step 5: Verify nothing changed**

Run: `npm run lint && npm run build`
Expected: lint is clean and the build succeeds.

Run: `CI=1 npx playwright test e2e/templates.spec.js e2e/template-pages.spec.js e2e/landing.spec.js`
Expected: all pass. Every existing caller still renders Original.

- [ ] **Step 6: Commit, then bump to 1.6.1**

```bash
git add src/components/StyleSwatchGroup.jsx src/components/TemplateThumbnail.jsx src/components/ScaledPreview.jsx src/styles/app-shell.css
git commit -m "Add StyleSwatchGroup and look props on template thumbnails and previews"
npm version 1.6.1 --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 1.6.1"
```

---

### Task 3: Looks in the builder's template gallery (1.6.2)

**Files:**
- Modify: `src/components/TemplateGalleryModal.jsx`
- Modify: `src/pages/ResumeBuilderPage.jsx` (`handleSelectTemplate`/`handleSelectStyleVariant` near line 1196, and the `<TemplateGalleryModal>` props near line 2435)
- Modify: `src/styles/app-shell.css` (a `.template-gallery__looks` rule after `.template-gallery__thumb`)
- Create: `e2e/template-looks.spec.js`
- Modify: `e2e/style-variants.spec.js` (the test `switching templates keeps each template's own variant`)

**Interfaces:**
- Consumes: Task 1's `getVariantLook`, `styleVariantSearch`; Task 2's `StyleSwatchGroup` and `TemplateThumbnail` props; the existing `resolveStyleVariantId`, `resolveTemplateAccent`, `getCvFontStack`, `getTemplateVariant`, `FORM_ACTION.SET_STYLE_VARIANT`, `UI_ACTION.APPLY_STYLE_VARIANT_LOOK`, `UI_ACTION.SET_SELECTED_TEMPLATE`.
- Produces:
  - `onSelectTemplate(templateId: string, variantId?: string)`: with a variant the builder ends up exactly as the card. Without one it's a plain switch (today's behaviour).
  - The new modal prop `templateAccentColors`.
  - `e2e/template-looks.spec.js` with shared helpers that Tasks 4 and 5 extend.

- [ ] **Step 1: Write the failing e2e tests**

Create `e2e/template-looks.spec.js`:

```js
import { test, expect } from './fixtures/base.js'
import { getTemplateVariants, getVariantLook } from '../src/utils/templateVariants.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { CV_FONT_OPTIONS, getCvFontStack } from '../src/utils/cvFonts.js'

// Phase 4: the style looks outside the builder's Style picker. These are
// the builder's template gallery, the Free CV Templates grid, the template
// pages, and the ?style= handoff into the builder. Assertions read the
// palette variables, --font-sans and the Style picker's label, not
// screenshots.

const label = (id) => cvTemplates.find((template) => template.id === id).label
const fontLabel = (fontId) => CV_FONT_OPTIONS.find((font) => font.id === fontId).label
const styleTrigger = (page) => page.getByRole('banner').getByRole('button', { name: /^Select style:/ })
const fontTrigger = (page) => page.getByRole('banner').getByRole('button', { name: /^Select font:/ })
const templateLabel = (page) => page.locator('.app-toolbar__template-trigger-label')

// The first palette variable whose value differs between two looks, so
// a read of it proves which look is rendered.
const differingVar = (a, b) => Object.keys(a.palette)
  .find((name) => a.palette[name].toLowerCase() !== b.palette[name].toLowerCase())

// Read on the name (every Showcase's <h1 data-cv-name>), which inherits
// the palette from the Showcase root. toHaveCSS can't read custom
// properties.
const paletteVar = (scope, name) => scope.locator('[data-cv-name]').first()
  .evaluate((el, variable) => getComputedStyle(el).getPropertyValue(variable).trim(), name)

const lookGroup = (scope, groupName) => scope.getByRole('radiogroup', { name: groupName, exact: true })
const lookRadio = (scope, groupName, variant) => lookGroup(scope, groupName)
  .getByRole('radio', { name: variant.label.en, exact: true })

const developer = getTemplateVariants('developer')
const creative = getTemplateVariants('creative')
const developerVar = differingVar(developer[0], developer[1])
const creativeVar = differingVar(creative[0], creative[1])

test.describe('Template gallery looks', () => {
  const openGallery = async (page) => {
    await page.getByRole('button', { name: /^Select template:/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Template gallery' })
    await expect(dialog.locator('.template-gallery__thumb [data-export-variant]')).toHaveCount(cvTemplates.length)
    return dialog
  }
  const card = (dialog, id) => dialog.locator('.template-gallery__card')
    .filter({ has: lookGroup(dialog.page(), `Style: ${label(id)}`) })
  const thumbFont = (scope) => scope.locator('.template-gallery__thumb-page')
    .evaluate((el) => el.style.getPropertyValue('--font-sans'))

  test('cards open on each template\'s stored look; a swatch previews only its own card', async ({ page }) => {
    await page.goto('/cv?template=developer')
    await styleTrigger(page).click()
    await page.getByRole('radiogroup', { name: 'Select style' }).getByRole('radio', { name: developer[1].label.en }).click()
    await page.getByRole('button', { name: /^Select template:/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Template gallery' })
    await expect(lookRadio(dialog, `Style: ${label('developer')}`, developer[1])).toBeChecked()
    await expect(lookRadio(dialog, `Style: ${label('creative')}`, creative[0])).toBeChecked()

    await lookRadio(dialog, `Style: ${label('creative')}`, creative[1]).check()
    await expect.poll(() => paletteVar(card(dialog, 'creative'), creativeVar)).toBe(creative[1].palette[creativeVar])
    await expect.poll(() => thumbFont(card(dialog, 'creative'))).toBe(getVariantLook('creative', creative[1].id).fontStack)
    // Only that card changed, and nothing was selected.
    expect(await paletteVar(card(dialog, 'developer'), developerVar)).toBe(developer[1].palette[developerVar])
    await expect(dialog).toBeVisible()
    await expect(templateLabel(page)).toHaveText(label('developer'))
  })

  test('the open template\'s card mirrors live tweaks until another look is previewed', async ({ page }) => {
    await page.goto('/cv?template=developer')
    await fontTrigger(page).click()
    await page.getByRole('option', { name: 'Georgia' }).click()
    const dialog = await openGallery(page)
    const developerCard = card(dialog, 'developer')
    await expect.poll(() => thumbFont(developerCard)).toBe(getCvFontStack('georgia'))
    await expect(developerCard.locator('.template-gallery__use')).toHaveText('In use')

    await lookRadio(dialog, `Style: ${label('developer')}`, developer[1]).check()
    await expect.poll(() => thumbFont(developerCard)).toBe(getVariantLook('developer', developer[1].id).fontStack)
    await expect(developerCard.locator('.template-gallery__use')).toHaveText('Use this style')

    await lookRadio(dialog, `Style: ${label('developer')}`, developer[0]).check()
    await expect.poll(() => thumbFont(developerCard)).toBe(getCvFontStack('georgia'))
    await expect(developerCard.locator('.template-gallery__use')).toHaveText('In use')
  })

  test('Use applies the template and the shown look; Undo restores the stored look', async ({ page }) => {
    await page.goto('/cv?template=minimal')
    const dialog = await openGallery(page)
    await lookRadio(dialog, `Style: ${label('developer')}`, developer[1]).check()
    await card(dialog, 'developer').getByRole('button').click()
    await expect(dialog).toBeHidden()
    await expect(templateLabel(page)).toHaveText(label('developer'))
    await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${developer[1].label.en}`)
    await expect(fontTrigger(page)).toHaveAccessibleName(`Select font: ${fontLabel(developer[1].fontId)}`)
    await expect.poll(() => paletteVar(page.locator('.app-shell__preview'), developerVar)).toBe(developer[1].palette[developerVar])

    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original')
    await expect(fontTrigger(page)).toHaveAccessibleName('Select font: Inter')
  })

  test('Use on the open template\'s stored look keeps the tweaks', async ({ page }) => {
    await page.goto('/cv?template=developer')
    await fontTrigger(page).click()
    await page.getByRole('option', { name: 'Georgia' }).click()
    const dialog = await openGallery(page)
    await card(dialog, 'developer').getByRole('button').click()
    await expect(dialog).toBeHidden()
    await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original, Modified')
    await expect(fontTrigger(page)).toHaveAccessibleName('Select font: Georgia')
  })

  test('View examples carries the previewed look', async ({ page }) => {
    await page.goto('/cv')
    const dialog = await openGallery(page)
    const link = dialog.getByRole('link', { name: `View examples: ${label('developer')}` })
    const slug = cvTemplates.find((template) => template.id === 'developer').slug
    await expect(link).toHaveAttribute('href', `/free-cv-templates/${slug}`)
    await lookRadio(dialog, `Style: ${label('developer')}`, developer[1]).check()
    await expect(link).toHaveAttribute('href', `/free-cv-templates/${slug}?style=${developer[1].id}`)
    await lookRadio(dialog, `Style: ${label('developer')}`, developer[0]).check()
    await expect(link).toHaveAttribute('href', `/free-cv-templates/${slug}`)
  })

  test('the looks are a keyboard radio group', async ({ page }) => {
    await page.goto('/cv')
    const dialog = await openGallery(page)
    const group = `Style: ${label('developer')}`
    await expect(lookGroup(dialog, group).getByRole('radio')).toHaveCount(developer.length)
    await lookRadio(dialog, group, developer[0]).focus()
    await page.keyboard.press('ArrowRight')
    await expect(lookRadio(dialog, group, developer[1])).toBeFocused()
    await expect(lookRadio(dialog, group, developer[1])).toBeChecked()
  })
})
```

In `e2e/style-variants.spec.js`, replace the whole test `switching templates keeps each template's own variant` with:

```js
test('switching templates from the gallery applies each template\'s stored look', async ({ page }) => {
  const developerVariant = getTemplateVariants('developer')[2]
  const label = (id) => cvTemplates.find((template) => template.id === id).label
  await page.goto('/cv?template=minimal')
  await styleTrigger(page).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  // A gallery card's Use applies the look the card shows (Phase 4): the
  // other template's stored look, here Original, font included.
  await pickTemplate(page, label('developer'))
  await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original')
  await expect(fontTrigger(page)).toHaveAccessibleName('Select font: Inter')
  await styleTrigger(page).click()
  await styleGroup(page).getByRole('radio', { name: developerVariant.label.en }).click()
  await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${developerVariant.label.en}`)
  await pickTemplate(page, label('minimal'))
  await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
  await pickTemplate(page, label('developer'))
  await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${developerVariant.label.en}`)
})
```

- [ ] **Step 2: Run them and watch them fail**

Run: `CI=1 npx playwright test e2e/template-looks.spec.js e2e/style-variants.spec.js`
Expected:
- The `Template gallery looks` tests fail: there's no radiogroup `Style: Developer`.
- The rewritten style-variants test fails at `Select style: Original` (it reads `Original, Modified`).

- [ ] **Step 3: Implement the gallery**

Replace the top of `src/components/TemplateGalleryModal.jsx` (imports through the `fontStack` line) with:

```jsx
import { useMemo, useState } from 'react'

import Modal from './Modal'
import StyleSwatchGroup from './StyleSwatchGroup'
import TemplateThumbnail from './TemplateThumbnail'
import { buildThumbnailCv } from '../utils/thumbnailCv'
import { getCvFontStack } from '../utils/cvFonts'
import { resolveTemplateAccent } from '../utils/cvTemplates'
import { templatePath } from '../utils/routes'
import { getVariantLook, resolveStyleVariantId, styleVariantSearch } from '../utils/templateVariants'

function TemplateGalleryModal({
  isOpen,
  onClose,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  atsScore,
  formData = null,
  templateAccentColors = null,
  cvFontId = '',
  cvHeadingColor = '',
  locale = 'en',
  onOpenBadge = null,
}) {
  const isFinnish = locale === 'fi'
  const thumbnailCv = useMemo(() => buildThumbnailCv(formData), [formData])
  // Looks previewed on a card since the modal opened (Phase 4). A card
  // without one shows the look this CV stores for its template. Reset on
  // every open, during render (React's "adjust state on a prop change"
  // pattern), so a reopened gallery never shows a stale preview.
  const [previewedLooks, setPreviewedLooks] = useState({})
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setPreviewedLooks({})
    }
  }
```

Inside `templates.map((template) => { … })`, replace everything from `const isActive = …` through the closing `</a>` of the examples link with:

```jsx
          const isActive = template.id === selectedTemplateId
          const storedLook = resolveStyleVariantId(formData, template.id)
          const look = previewedLooks[template.id] ?? storedLook
          // The open template on its stored look mirrors the builder
          // preview, Modified tweaks included; any other card shows the
          // look's own accent, font and headings colour.
          const showsLivePreview = isActive && look === storedLook
          const thumbnailLook = showsLivePreview
            ? {
                styleVariantId: look,
                accentColor: resolveTemplateAccent(templateAccentColors, template.id),
                fontId: cvFontId,
                fontStack: getCvFontStack(cvFontId),
                headingColor: cvHeadingColor,
              }
            : getVariantLook(template.id, look)

          // The builder ends up exactly as the card shows: this template
          // in this look (ResumeBuilderPage's handleSelectTemplate).
          const selectTemplate = () => {
            onSelectTemplate(template.id, look)
            onClose()
          }

          let useLabel = isFinnish ? 'Käytä pohjaa' : 'Use template'
          if (showsLivePreview) {
            useLabel = isFinnish ? 'Käytössä' : 'In use'
          } else if (isActive) {
            useLabel = isFinnish ? 'Käytä tyyliä' : 'Use this style'
          }

          // The card is a container, not one big button: a <button> can't
          // contain links or the look radios, and the thumbnail (a real
          // CV — several templates render <a> links in it), the looks and
          // the examples link all need to live in the card.
          return (
            <div
              key={template.id}
              className={`template-gallery__card${isActive ? ' template-gallery__card--active' : ''}`}
            >
              {/* Clickable, but aria-hidden and out of the tab order: the
                  select button below is the accessible control. */}
              <div className="template-gallery__thumb" aria-hidden="true" onClick={selectTemplate}>
                <TemplateThumbnail
                  templateId={template.id}
                  formData={thumbnailCv}
                  locale={locale}
                  {...thumbnailLook}
                />
              </div>
              <div className="template-gallery__looks">
                <StyleSwatchGroup
                  templateId={template.id}
                  value={look}
                  onChange={(variantId) => setPreviewedLooks((current) => ({ ...current, [template.id]: variantId }))}
                  locale={locale}
                  name={`gallery-look-${template.id}`}
                  label={`${isFinnish ? 'Tyyli' : 'Style'}: ${template.label}`}
                />
              </div>
              <button
                type="button"
                className="template-gallery__select"
                onClick={selectTemplate}
              >
                <div className="template-gallery__meta">
                  {isActive ? (
                    <span className="template-gallery__active-badge">
                      {isFinnish ? 'Käytössä' : 'Active'}
                    </span>
                  ) : null}
                  <p className="template-gallery__name">{template.label}</p>
                  <p className="template-gallery__desc">{template.description}</p>
                  <span className="template-gallery__use">{useLabel}</span>
                </div>
              </button>
              {/* Opens the template's own page, on the previewed look,
                  which shows every example CV for it, in a new tab — the
                  builder and the user's CV stay exactly as they are. */}
              <a
                className="template-gallery__examples"
                href={`${templatePath(template.slug)}${styleVariantSearch(look)}`}
                target="_blank"
                rel="noopener"
                aria-label={`${isFinnish ? 'Katso esimerkit' : 'View examples'}: ${template.label}`}
              >
                {isFinnish ? 'Katso esimerkit' : 'View examples'}
              </a>
            </div>
          )
```

`fontStack`/`getCvFontStack` was previously computed once above the grid. Delete the old `const fontStack = getCvFontStack(cvFontId)` line.

Add to `src/styles/app-shell.css`, right after the `.template-gallery__thumb { … }` rule:

```css
/* The card's look swatches (Phase 4), between the thumbnail and the
   select button; a radiogroup can't sit inside the button. */
.template-gallery__looks {
  padding: 0.6rem 0.85rem 0;
}
```

- [ ] **Step 4: Wire the builder**

In `src/pages/ResumeBuilderPage.jsx`, replace `handleSelectTemplate` and `handleSelectStyleVariant` (near line 1196) with the block below. `resolveStyleVariantId` and `getTemplateVariant` are already imported from `../utils/templateVariants` (line 77).

```jsx
  // Stores `variantId` for `templateId` and resets the accent, font and
  // headings colour to its values. The toolbar's Style picker and a
  // gallery card's Use (Phase 4) share it.
  const selectStyleVariant = useCallback((templateId, variantId) => {
    dispatchFormData({ type: FORM_ACTION.SET_STYLE_VARIANT, templateId, variantId })
    dispatchUi({
      type: UI_ACTION.APPLY_STYLE_VARIANT_LOOK,
      templateId,
      variant: getTemplateVariant(templateId, variantId),
    })
  }, [dispatchFormData])

  // A gallery card's Use passes the look its thumbnail shows, and the
  // builder ends up exactly as the card (Phase 4): the open template on
  // its stored look changes nothing (tab-only tweaks survive); anything
  // else switches template and applies the look. Without a variant it's a
  // plain template switch, as before.
  const handleSelectTemplate = useCallback((templateId, variantId) => {
    if (variantId === undefined) {
      dispatchUi({ type: UI_ACTION.SET_SELECTED_TEMPLATE, templateId })
      return
    }
    if (templateId === selectedTemplate && variantId === resolveStyleVariantId(formData, templateId)) {
      return
    }
    dispatchUi({ type: UI_ACTION.SET_SELECTED_TEMPLATE, templateId })
    selectStyleVariant(templateId, variantId)
  }, [formData, selectedTemplate, selectStyleVariant])

  // Picking a variant — even the active one again — stores it and resets
  // the accent, font and headings colour to its values.
  const handleSelectStyleVariant = useCallback((variantId) => {
    selectStyleVariant(selectedTemplate, variantId)
  }, [selectStyleVariant, selectedTemplate])
```

If `selectedTemplate` or `formData` is declared *after* line 1196, move this block below those declarations. Check with `grep -n "selectedTemplate,\|const \[formData" src/pages/ResumeBuilderPage.jsx | head`. In the current file both come from the reducers near line 401, so no move is needed.

In the `<TemplateGalleryModal>` element (near line 2435), add `templateAccentColors={templateAccentColors}` after `formData={formData}`.

- [ ] **Step 5: Run the tests and watch them pass**

Run: `CI=1 npx playwright test e2e/template-looks.spec.js e2e/style-variants.spec.js e2e/templates.spec.js e2e/direct-edit.spec.js e2e/badge.spec.js`
Expected: all pass.

`templates.spec.js`'s `no thumbnail sits inside a button or link` also guards the new markup: the radios sit outside the button.

- [ ] **Step 6: Lint, commit, bump to 1.6.2**

Run: `npm run lint`
Expected: clean.

If ESLint's react-hooks rules object to the render-time `setWasOpen`/`setPreviewedLooks`, don't disable the rule. Move the reset into `ResumeBuilderPage` instead by mounting the modal with `key={isTemplateGalleryOpen ? 'open' : 'closed'}`, and drop `wasOpen`.

```bash
git add src/components/TemplateGalleryModal.jsx src/pages/ResumeBuilderPage.jsx src/styles/app-shell.css e2e/template-looks.spec.js e2e/style-variants.spec.js
git commit -m "Show and pick style looks on the builder's template gallery cards"
npm version 1.6.2 --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 1.6.2"
```

---

### Task 4: Looks on the Free CV Templates grid and the template pages (1.6.3)

**Files:**
- Modify: `src/App.jsx` (`pushViewUrl` near line 160, `goToView` near line 375)
- Modify: `src/pages/FreeCvTemplatesPage.jsx`
- Modify: `src/pages/TemplateDetailPage.jsx`
- Modify: `src/styles/app-shell.css` (a `.templates-page-card__looks` rule after `.templates-page-card__thumb`)
- Modify: `e2e/template-looks.spec.js` (append two `describe` blocks)

**Interfaces:**
- Consumes: Task 1's `getVariantLook`, `parseStyleVariantParam`, `styleVariantSearch`, `DEFAULT_STYLE_VARIANT_ID`; Task 2's `StyleSwatchGroup`, `TemplateThumbnail` and `ScaledPreview` props.
- Produces:
  - `goToView(view: string, options?: { search?: string })`, i.e. `onNavigateToView` with an optional second argument.
  - Pages call `onGetStarted(templateId, exampleId?, { style?: string, blank?: boolean })`. Task 5 makes `goToBuilder` forward `style`; until then it's ignored.

- [ ] **Step 1: Write the failing e2e tests**

Append to `e2e/template-looks.spec.js`:

```js
const developerSlug = cvTemplates.find((template) => template.id === 'developer').slug

test.describe('Free CV Templates grid looks', () => {
  const gridCard = (page, id) => page.locator('.templates-page-card')
    .filter({ has: lookGroup(page, `Style: ${label(id)}`) })

  test('a swatch previews only its own card and carries into its links', async ({ page }) => {
    await page.goto('/free-cv-templates')
    await expect(page.locator('.templates-page-card [data-export-variant]')).toHaveCount(cvTemplates.length)
    const developerCard = gridCard(page, 'developer')
    const nameLink = developerCard.locator('a.templates-page-card__name')
    const examplesLink = developerCard.getByRole('link', { name: `View examples: ${label('developer')}` })
    await expect(nameLink).toHaveAttribute('href', `/free-cv-templates/${developerSlug}`)

    await lookRadio(page, `Style: ${label('developer')}`, developer[1]).check()
    await expect.poll(() => paletteVar(developerCard, developerVar)).toBe(developer[1].palette[developerVar])
    expect(await paletteVar(gridCard(page, 'creative'), creativeVar)).toBe(creative[0].palette[creativeVar])
    await expect(nameLink).toHaveAttribute('href', `/free-cv-templates/${developerSlug}?style=${developer[1].id}`)
    await expect(examplesLink).toHaveAttribute('href', `/free-cv-templates/${developerSlug}?style=${developer[1].id}`)

    await developerCard.locator('.templates-page-card__thumb').click()
    await expect(page).toHaveURL(new RegExp(`/free-cv-templates/${developerSlug}\\?style=${developer[1].id}$`))
    await expect(lookRadio(page, 'Style', developer[1])).toBeChecked()
  })
})

test.describe('Template page looks', () => {
  test('?style= opens the page on that look; an unknown one on Original', async ({ page }) => {
    await page.goto(`/free-cv-templates/${developerSlug}?style=${developer[2].id}`)
    await expect(lookRadio(page, 'Style', developer[2])).toBeChecked()
    await expect.poll(() => paletteVar(page.locator('.template-page__preview'), differingVar(developer[0], developer[2])))
      .toBe(developer[2].palette[differingVar(developer[0], developer[2])])

    await page.goto(`/free-cv-templates/${developerSlug}?style=no-such-look`)
    await expect(lookRadio(page, 'Style', developer[0])).toBeChecked()
  })

  test('the picker updates the URL and keeps ?example=', async ({ page }) => {
    await page.goto(`/free-cv-templates/${developerSlug}?example=data-engineer`)
    await lookRadio(page, 'Style', developer[1]).check()
    await expect(page).toHaveURL(new RegExp(`\\?example=data-engineer&style=${developer[1].id}$`))
    await expect.poll(() => paletteVar(page.locator('.template-page__preview'), developerVar)).toBe(developer[1].palette[developerVar])
    await lookRadio(page, 'Style', developer[0]).check()
    await expect(page).toHaveURL(/\?example=data-engineer$/)
  })

  test('moving to another template starts it on Original', async ({ page }) => {
    await page.goto(`/free-cv-templates/${developerSlug}?style=${developer[1].id}`)
    await page.getByRole('link', { name: /^Next template:/ }).click()
    await expect(page).not.toHaveURL(/style=/)
    await expect(lookGroup(page, 'Style').getByRole('radio').first()).toBeChecked()
  })

  test('Finnish label', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('ui-locale', 'fi'))
    await page.goto(`/free-cv-templates/${developerSlug}`)
    await expect(page.getByRole('radiogroup', { name: 'Tyyli', exact: true })).toBeVisible()
  })
})
```

- [ ] **Step 2: Run them and watch them fail**

Run: `CI=1 npx playwright test e2e/template-looks.spec.js -g "grid looks|Template page looks"`
Expected: FAIL. Neither page has a `Style` radiogroup yet.

- [ ] **Step 3: Let `goToView` carry a query string**

In `src/App.jsx`, replace `pushViewUrl` with:

```js
// `search` (Phase 4) carries a query string into the new view, e.g. a
// template page's ?style=; without it the view opens at its bare path.
function pushViewUrl(nextView, search = '') {
  if (typeof window === 'undefined') {
    return
  }

  const url = `${VIEW_HEAD[nextView]?.path ?? '/'}${search}`

  if (`${window.location.pathname}${window.location.search}` !== url) {
    window.history.pushState({ view: nextView }, '', url)
  }
}
```

Replace `goToView` with:

```js
  const goToView = useCallback((nextView, { search = '' } = {}) => {
    setView(nextView)
    pushViewUrl(nextView, search)
    scrollToTop()
  }, [])
```

Every existing caller passes only a view (checked: `App.jsx:201` and the page `onNavigateToView(view)` calls), so their behaviour is unchanged. One difference: navigating from `/x?foo` to the bare `/x` now pushes. That's correct, because the URL really does change.

- [ ] **Step 4: The Free CV Templates grid**

In `src/pages/FreeCvTemplatesPage.jsx`:

Imports:

```jsx
import { useMemo, useState } from 'react'

import StyleSwatchGroup from '../components/StyleSwatchGroup'
import TemplateThumbnail from '../components/TemplateThumbnail'
import InternalNavLink from '../components/InternalNavLink'
import { buildThumbnailCv } from '../utils/thumbnailCv'
import { cvTemplates, getCvTemplates } from '../utils/cvTemplates'
import { ROUTES, templatePath } from '../utils/routes'
import { TEMPLATE_VIEW_PREFIX } from '../utils/pageMeta'
import { DEFAULT_STYLE_VARIANT_ID, getVariantLook, styleVariantSearch } from '../utils/templateVariants'
```

Add `style: 'Tyyli',` to the Finnish copy object and `style: 'Style',` to the English one, next to `viewExamples`.

In the component, after `thumbnailCv`:

```jsx
  // The look previewed on each card (Phase 4); every card starts on
  // Original. It carries into the card's links and "Use this template".
  const [looks, setLooks] = useState({})
```

Replace the `templates.map(…)` body (the whole `<div className="templates-page-card" …>…</div>`) with:

```jsx
          {templates.map((template) => {
            const look = looks[template.id] ?? DEFAULT_STYLE_VARIANT_ID
            const search = styleVariantSearch(look)
            const openTemplatePage = () => onNavigateToView(`${TEMPLATE_VIEW_PREFIX}${template.id}`, { search })

            return (
              <div className="templates-page-card" key={template.id}>
                {/* Not a link: the thumbnail is a real CV, and several
                    templates render <a> links inside it, which can't be
                    nested in another <a>. Clicking it still opens the
                    template page; keyboard and screen-reader users get the
                    name link and "View examples" below, so it stays
                    aria-hidden and out of the tab order. */}
                <div
                  className="templates-page-card__thumb"
                  aria-hidden="true"
                  onClick={openTemplatePage}
                >
                  <TemplateThumbnail
                    templateId={template.id}
                    formData={thumbnailCv}
                    locale={resolvedLocale}
                    {...getVariantLook(template.id, look)}
                  />
                </div>
                <div className="templates-page-card__looks">
                  <StyleSwatchGroup
                    templateId={template.id}
                    value={look}
                    onChange={(variantId) => setLooks((current) => ({ ...current, [template.id]: variantId }))}
                    locale={resolvedLocale}
                    name={`grid-look-${template.id}`}
                    label={`${copy.style}: ${template.label}`}
                  />
                </div>
                <InternalNavLink
                  to={`${templatePath(template.slug)}${search}`}
                  onNavigate={openTemplatePage}
                  className="templates-page-card__name"
                >
                  {template.label}
                </InternalNavLink>
                <p className="templates-page-card__description">{template.description}</p>
                <div className="templates-page-card__actions">
                  <button
                    type="button"
                    className="templates-page-card__cta"
                    onClick={() => onGetStarted(template.id, undefined, { style: look })}
                  >
                    {copy.useTemplate}
                  </button>
                  {/* Same destination as the thumbnail and name links above,
                      spelled out: the template's page shows its example CVs. */}
                  <InternalNavLink
                    to={`${templatePath(template.slug)}${search}`}
                    onNavigate={openTemplatePage}
                    className="templates-page-card__examples"
                    aria-label={`${copy.viewExamples}: ${template.label}`}
                  >
                    {copy.viewExamples}
                  </InternalNavLink>
                </div>
              </div>
            )
          })}
```

Add to `src/styles/app-shell.css`, right after the `.templates-page-card__thumb { … }` rule:

```css
/* The card's look swatches (Phase 4), under the thumbnail. */
.templates-page-card__looks {
  margin-top: var(--space-2);
}
```

- [ ] **Step 5: The template page**

In `src/pages/TemplateDetailPage.jsx`:

Imports: add `StyleSwatchGroup`, and the helpers. Drop `resolveTemplateAccent` from the `cvTemplates` import, since nothing else in the file uses it (confirm with `grep -n resolveTemplateAccent src/pages/TemplateDetailPage.jsx` after the edit).

```jsx
import InternalNavLink from '../components/InternalNavLink'
import StyleSwatchGroup from '../components/StyleSwatchGroup'
import { cvTemplates, getCvTemplate } from '../utils/cvTemplates'
import { DEFAULT_STYLE_VARIANT_ID, getVariantLook, parseStyleVariantParam } from '../utils/templateVariants'
```

Copy: add `style: 'Tyyli',` (fi) and `style: 'Style',` (en) after `examples`.

After `readExampleParam`:

```jsx
// ?style= (Phase 4): the look to open the page on, from a Free CV
// Templates card or a builder gallery card's "View examples". An unknown
// id is Original. The page remounts per template (App's key={view}), so
// moving to another template reads its own URL afresh.
function readStyleParam(templateId) {
  if (typeof window === 'undefined') return DEFAULT_STYLE_VARIANT_ID
  return parseStyleVariantParam(templateId, new URLSearchParams(window.location.search).get('style'))
}
```

In the component, after the `atsView` state:

```jsx
  const [styleId, setStyleId] = useState(() => readStyleParam(templateId))
```

After `selectExample`:

```jsx
  // Like selectExample: the look lives in the URL, so a reload or a shared
  // link keeps it. Original is the absence of ?style=.
  const selectStyle = (nextId) => {
    setStyleId(nextId)
    const url = new URL(window.location.href)
    if (nextId === DEFAULT_STYLE_VARIANT_ID) {
      url.searchParams.delete('style')
    } else {
      url.searchParams.set('style', nextId)
    }
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`)
  }
```

Right after the closing `)}` of the `examples.length > 0 && (…)` block, add:

```jsx
          <StyleSwatchGroup
            templateId={templateId}
            value={styleId}
            onChange={selectStyle}
            locale={resolvedLocale}
            name="template-style"
            label={copy.style}
            size="page"
          />
```

Change the two action buttons' handlers:

```jsx
            <button type="button" className="landing-cta" onClick={() => onGetStarted(templateId, exampleId, { style: styleId })}>
```

```jsx
              onClick={() => onGetStarted(templateId, undefined, { blank: true, style: styleId })}
```

Replace the `ScaledPreview`'s `accentColor={resolveTemplateAccent(null, templateId)}` line with:

```jsx
                {...getVariantLook(templateId, styleId)}
```

Original's `getVariantLook` accent is the registry default, the same value `resolveTemplateAccent(null, templateId)` gave, so the default page is unchanged.

- [ ] **Step 6: Run the tests and watch them pass**

Run: `CI=1 npx playwright test e2e/template-looks.spec.js e2e/template-pages.spec.js e2e/landing.spec.js`
Expected: all pass. The existing `the example switcher changes the preview and the URL` test (URL `…?example=data-engineer$`) still passes, because Original writes no `style`.

- [ ] **Step 7: Lint, commit, bump to 1.6.3**

Run: `npm run lint`
Expected: clean.

```bash
git add src/App.jsx src/pages/FreeCvTemplatesPage.jsx src/pages/TemplateDetailPage.jsx src/styles/app-shell.css e2e/template-looks.spec.js
git commit -m "Show and pick style looks on the Free CV Templates grid and template pages"
npm version 1.6.3 --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 1.6.3"
```

---

### Task 5: The `?style=` handoff into the builder, docs and full verification (1.6.4)

**Files:**
- Modify: `src/App.jsx` (`goToBuilder` near line 346)
- Modify: `src/reducers/uiReducer.js` (export `readInitialTemplateId`)
- Modify: `src/pages/ResumeBuilderPage.jsx` (`loadInitialCvSession` lines ~256-390, the param-strip and example-load effect near line 722, and the templateVariants import at line 77)
- Modify: `e2e/template-looks.spec.js` (append the handoff `describe`)
- Modify: `changes.md`, `todo.md`, `CLAUDE.md`

**Interfaces:**
- Consumes: Task 1's `parseStyleVariantParam`, `DEFAULT_STYLE_VARIANT_ID`; Task 4's `onGetStarted(templateId, exampleId?, { style?, blank? })`; the existing `cvFormReducer`, `FORM_ACTION.SET_STYLE_VARIANT`, and `createInitialUiState` (which already applies the initial CV's stored looks).
- Produces:
  - Builder URLs `/cv?template=<id>[&example=<id>|&blank=1]&style=<variantId>`.
  - `export function readInitialTemplateId()` from `uiReducer.js`.

- [ ] **Step 1: Write the failing e2e tests**

Append to `e2e/template-looks.spec.js`:

```js
test.describe('?style= handoff into the builder', () => {
  test('"Use this example" opens the builder on the page\'s look', async ({ page }) => {
    await page.goto(`/free-cv-templates/${developerSlug}`)
    await lookRadio(page, 'Style', developer[1]).check()
    await page.getByRole('button', { name: 'Use this example' }).click()
    await expect(page.getByText(/^Loaded the .+ example\.$/)).toBeVisible()
    await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${developer[1].label.en}`)
    await expect(fontTrigger(page)).toHaveAccessibleName(`Select font: ${fontLabel(developer[1].fontId)}`)
    await expect(page).toHaveURL(/\/cv\?template=developer$/)
  })

  test('"Start blank" opens the builder on the page\'s look', async ({ page }) => {
    await page.goto(`/free-cv-templates/${developerSlug}?style=${developer[2].id}`)
    await page.getByRole('button', { name: 'Start blank with this template' }).click()
    await expect(page).toHaveURL(/\/cv\?template=developer$/)
    await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${developer[2].label.en}`)
  })

  test('a grid card\'s "Use this template" opens the builder on the card\'s look', async ({ page }) => {
    await page.goto('/free-cv-templates')
    await lookRadio(page, `Style: ${label('developer')}`, developer[2]).check()
    await page.locator('.templates-page-card')
      .filter({ has: lookGroup(page, `Style: ${label('developer')}`) })
      .getByRole('button', { name: 'Use this template' })
      .click()
    await expect(templateLabel(page)).toHaveText(label('developer'))
    await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${developer[2].label.en}`)
    await expect(page).toHaveURL(/\/cv\?template=developer$/)
  })

  test('an unknown ?style= opens on Original and is stripped', async ({ page }) => {
    await page.goto('/cv?template=developer&style=no-such-look')
    await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original')
    await expect(page).toHaveURL(/\/cv\?template=developer$/)
  })

  test('a restored session ignores ?style= and says so', async ({ page }) => {
    await page.goto('/cv')
    await page.evaluate(() => window.localStorage.setItem('portifycv-session-restore-enabled', 'true'))
    await page.reload()
    await page.getByRole('textbox', { name: /Full name/ }).fill('Grace Hopper')
    await expect
      .poll(() => page.evaluate(() => window.sessionStorage.getItem('portifycv-session-snapshot')))
      .toContain('Grace Hopper')

    await page.goto(`/cv?template=developer&style=${developer[1].id}`)
    await expect(page.getByText("Kept your restored CV. Use 'Load demo CV' to start over.")).toBeVisible()
    await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original')
    await expect(page).toHaveURL(/\/cv\?template=developer$/)
  })
})
```

- [ ] **Step 2: Run them and watch them fail**

Run: `CI=1 npx playwright test e2e/template-looks.spec.js -g "handoff"`
Expected:
- The first three tests fail at `Select style: …`, which reads `Original`.
- The restored-session test fails on the missing toast.
- The unknown-style test fails on the URL, which still carries `style=`.

- [ ] **Step 3: Forward `style` from `goToBuilder`**

In `src/App.jsx`'s `goToBuilder`, after the `blank` line:

```js
      // A template page's or grid card's look (Phase 4). 'default' is
      // variant #1's id and never goes into a URL; App deliberately doesn't
      // import the variant registry (it would join the entry chunk), so the
      // builder validates the id.
      if (typeof options.style === 'string' && options.style && options.style !== 'default') {
        params.set('style', options.style)
      }
```

Also extend the comment above `goToBuilder`. After the `options.blank` sentence, add: "options.style is the look picked on a template page or Free CV Templates card; the builder applies it to whatever CV it starts with, exactly like ?example=."

- [ ] **Step 4: Export the template reader**

In `src/reducers/uiReducer.js`, change `function readInitialTemplateId()` to `export function readInitialTemplateId()`.

- [ ] **Step 5: Apply `?style=` in the builder's initial session**

In `src/pages/ResumeBuilderPage.jsx`:

Extend line 77's import with `DEFAULT_STYLE_VARIANT_ID` and `parseStyleVariantParam`. Change line 80 to `import { uiReducer, createInitialUiState, readInitialTemplateId, UI_ACTION } from '../reducers/uiReducer'`.

Add this module-level helper directly above `function loadInitialCvSession()`:

```js
// Opens `formData` in look `variantId` for `templateId` (a template page's
// ?style=, Phase 4) by storing it the way the Style picker does.
// createInitialUiState / applyStoredStyleVariantLook then apply its
// accent, font and headings colour like any other stored look.
function withStyleVariant(formData, templateId, variantId) {
  return variantId === DEFAULT_STYLE_VARIANT_ID
    ? formData
    : cvFormReducer(formData, { type: FORM_ACTION.SET_STYLE_VARIANT, templateId, variantId })
}
```

Inside `loadInitialCvSession`, directly after the `markOnboardingSeen()` call that follows the share-link `try/catch`, add the lines below. Then delete the later `const params = new URLSearchParams(window.location.search)` line, since `params` now comes from here.

```js
  const params = new URLSearchParams(window.location.search)
  // ?style= (Phase 4): the look a template page or Free CV Templates card
  // asked to open the template in. Like ?example=, a share link (returned
  // above) or a restored session (below) ignores it.
  const requestedTemplateId = readInitialTemplateId()
  const requestedStyleId = parseStyleVariantParam(requestedTemplateId, params.get('style'))
```

In the session-restore branch:
- Replace `const restoreParams = new URLSearchParams(window.location.search)` and its use with `params`.
- Make the toast condition cover a pending look too.

```js
        const hasPendingExample = isTemplateExample(params.get('template'), params.get('example'))
        const hasPendingStyle = requestedStyleId !== DEFAULT_STYLE_VARIANT_ID

        return {
          formData: restoredFormData,
          initialToast: createToast(
            hasPendingExample || hasPendingStyle
              ? "Kept your restored CV. Use 'Load demo CV' to start over."
              : 'Restored your last session.',
            'success',
          ),
```

Also update the comment above it ("A valid ?example= for the selected template would otherwise be silently dropped …") so it reads "A valid ?example= or ?style= …".

Then change the four remaining start branches:

- `?blank=1` branch: `formData: withStyleVariant(initialCvData, requestedTemplateId, requestedStyleId),`
- `?example=` branch: `formData: withStyleVariant(initialCvData, requestedTemplateId, requestedStyleId),` and add `pendingStyleVariantId: requestedStyleId,` after `pendingExampleId: requestedExampleId,`.
- Onboarding-demo branch: `formData: withStyleVariant(structuredClone(demoCvData), requestedTemplateId, requestedStyleId),`
- Final default return: `formData: withStyleVariant(initialCvData, requestedTemplateId, requestedStyleId),`

`withStyleVariant` returns `initialCvData` itself when there's no look, so the default path still shares the same object as today.

In the effect that strips params (near line 722), add after the `blank` deletion:

```js
    if (url.searchParams.has('style')) {
      url.searchParams.delete('style')
      paramsChanged = true
    }
```

Update its comment to "Strip ?example=/?blank=/?style= …".

In the same effect's example `.then`, replace the `dispatchFormData`/`applyStoredStyleVariantLook` pair with:

```js
      // ?style= wins over any look the example stores for this template.
      const startCv = withStyleVariant(exampleCv, selectedTemplate, initialSession.pendingStyleVariantId ?? DEFAULT_STYLE_VARIANT_ID)
      dispatchFormData({ type: FORM_ACTION.SET_FORM_DATA, formData: startCv })
      applyStoredStyleVariantLook(startCv, selectedTemplate)
```

- [ ] **Step 6: Run the tests and watch them pass**

Run: `CI=1 npx playwright test e2e/template-looks.spec.js e2e/template-pages.spec.js e2e/session-restore.spec.js e2e/style-variants.spec.js`
Expected: all pass.

Run: `npm run check:reducers`
Expected: pass. The reducers didn't change behaviour, only `readInitialTemplateId`'s export.

- [ ] **Step 7: Docs**

**`changes.md`.** Add a new top entry above `## Template style variants — 1.6.0, 2026-10-08`. Fill in the bundle line from Step 9.

```markdown
## Template looks outside the builder — 1.6.1-1.6.4, 2026-10-10

The three looks of every template can now be seen and picked outside the
builder's Style picker:

- **Builder's template gallery.** Each card has three look swatches. A
  card opens on the look your CV has stored for that template, and the
  open template's card shows exactly what the preview shows, tweaks
  included. A swatch only previews the look on that card. "Use template"
  then opens the template in that look (its accent, font and headings
  colour), and an open template previewed in another look offers "Use
  this style" ("Käytä tyyliä").
- **Free CV Templates grid.** Each card has the same swatches.
- **Template pages.** A "Style" ("Tyyli") picker sits beside the
  examples, and the choice is kept in the URL as `?style=`.

A look picked on a template page or grid card travels into the builder:
"Use this example", "Start blank" and "Use this template" all open it in
that look. As with `?example=`, a restored session or a share link wins
and ignores it. Original is never written into a URL.

Switching templates from the gallery now always matches the card. The
font and headings colour come from the new template's stored look
instead of carrying over from the previous template (1.6.0 carried
them). Known limit: using another template on the look it already has
stored resets the font and headings colour without an undo step,
because no stored look changed.

Bundle: <before → after for the CVPreview, FreeCvTemplatesPage and
TemplateDetailPage chunks, from Step 9>.
```

**`todo.md`.** Replace the `### Phase 4 follow-up (not started)` section with:

```markdown
### Phase 4: template looks outside the builder — DONE (1.6.4, 2026-10-10)

Spec: `docs/superpowers/specs/2026-10-10-template-looks-outside-builder-design.md`;
plan: `docs/superpowers/plans/2026-10-10-template-looks-outside-builder.md`.
The looks show on the builder gallery cards, the Free CV Templates grid
and the template pages, and `?style=` carries a look into the builder
(1.6.1 shared pieces, 1.6.2 gallery, 1.6.3 grid and pages, 1.6.4
handoff). Tests: `e2e/template-looks.spec.js`.

Still open (not in this phase): gallery filters and a per-template photo
flag (the original roadmap's Phase 4); the selected template in share
links; the 13 first-look contrast exceptions; moving
`textPairs`/`defaultContrastExceptions` out of the runtime registry; looks
on the landing page's marquee and hero.

Verification (1.6.4): <fill in from Step 8: lint, the 8 check:* results,
the CI=1 npm run test:e2e pass count and duration, and npm run build>.
```

**`CLAUDE.md`.** In the "Per-template pages" paragraph, after the sentence that ends "…shared across templates where the fit is real rather than duplicated.", add:

```markdown
A template page also takes `?style=<variantId>` (one of that template's
looks in `templateVariants.js`; an unknown id is Original, which is never
written into a URL), set from its Style picker or a gallery/grid card,
and passes it to the builder, which applies it to whatever CV it starts
with, like `?example=`, and strips it.
```

- [ ] **Step 8: Full verification**

Run each command and keep its output for the `todo.md` line:

```bash
npm run lint
```

```bash
for s in share reducers feedback docx-export section-schema section-columns template-pages template-variants; do npm run -s check:$s > /dev/null && echo "ok $s" || echo "FAIL $s"; done
```

```bash
CI=1 npm run test:e2e
```

```bash
npm run build
```

Expected:
- lint is clean;
- 8 × `ok`;
- the e2e run ends `N passed` with 0 failed;
- the build succeeds.

If anything fails, stop and fix it (superpowers:systematic-debugging) before continuing. Don't edit `pdfPages.js` or `layoutAllowlist.js` to make a run pass.

- [ ] **Step 9: Bundle delta**

Run: `npm run build 2>&1 | grep -E 'dist/assets/.*\.js' > "$SCRATCH/bundle-after.txt"; diff "$SCRATCH/bundle-before.txt" "$SCRATCH/bundle-after.txt"`

Then:
- Fill the `Bundle:` line in `changes.md` with the gzip sizes before and after for the changed chunks.
- Confirm the entry chunk (`index-*.js`) changed by less than 0.5 KB gzip. If it grew more, `templateVariants.js` leaked into the entry graph; find the import and fix it.

- [ ] **Step 10: Commit, bump to 1.6.4**

```bash
git add src/App.jsx src/reducers/uiReducer.js src/pages/ResumeBuilderPage.jsx e2e/template-looks.spec.js changes.md todo.md CLAUDE.md
git commit -m "Carry a template page's style look into the builder with ?style="
npm version 1.6.4 --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 1.6.4"
```

Then report to the user with the verification evidence. **Don't push.** Ask first: "OK to push to `origin v1.6.0` (PR R0uty/PortifyCV#2)?"
