# Template style variants — design (v1.6, Phase 3)

**Date:** 2026-10-06
**Branch:** `v1.6.0`, stacked on `v1.5.0` (rebase onto `main` once 1.5.0 merges)
**Status:** draft, awaiting review

## Goal

Give every template three curated looks ("style variants") that a user can
switch between in one click. A variant is a designed combination of the
template's own colour palette and a font, so all 18 templates get genuinely
different looks: Developer's dark sidebar, Navy Professional's rail, a
header band or tint, not only an accent swap.

Today's look of each template becomes its variant #1, unchanged. Nobody's
existing CV, share link or JSON file looks any different after this phase.

## Decisions (made 2026-10-05/06)

- **What a variant is:** curated looks, not more customisation controls.
- **What it may change:** the template's palette (its own local CSS
  variables: sidebar, header band, tint, accent, ink…) plus a font and a
  headings colour. Never spacing, structure or layout.
- **Existing pickers stay:** picking a variant applies its whole look; the
  accent, headings-colour and font pickers still fine-tune on top. Picking a
  variant again resets those tweaks to the variant's values.
- **Where it's pickable:** the builder toolbar only. The gallery, template
  pages and the Free CV Templates grid stay as they are (a possible Phase 4
  follow-up).
- **How many:** 3 per template — today's look as #1 plus 2 new — so 36 new
  looks.
- **Where it's stored:** in the CV data, per template, so it travels in share
  links, JSON export and session restore. Tweaks on top stay tab-only, as
  today.
- **Implementation approach:** a JS variant registry whose palettes are
  applied as inline CSS variables on each Showcase root (approach A of
  three considered — see "Alternatives considered").
- **Versioning:** 1.5.1, 1.5.2, … per unit of work, with 1.6.0 at the end;
  its own PR after 1.5.0 merges.

## Non-goals

- Variants anywhere but the builder toolbar (gallery cards, template pages,
  the Free CV Templates grid).
- New fonts, a separate heading font, or new colour controls.
- Moving the accent, headings-colour or font tweaks into the CV data. They
  stay tab-only, as today.
- Layout or spacing changes per variant, or new templates.
- Variants in the HTML export, which never used template styling.

## 1. Data and storage

### The registry — `src/utils/templateVariants.js`

For each template, an ordered list of exactly 3 variants. Each variant has:

- `id` — permanent once shipped (share links store it), unique within its
  template. Variant #1's id is `'default'`.
- `label` — `{ en, fi }`, a short colour or mood word ("Sage" / "Salvia").
  Labels may change later; ids may not.
- `palette` — `{ '--<prefix>-<name>': '<colour>' }`, setting exactly the
  template's declared palette variables (see §2). Values are hex or `rgba()`
  only — never `color-mix()`, which html2canvas cannot render.
- `accent` — the starting value for the existing per-template accent picker,
  or `null` for a template without an accent.
- `fontId` — one of the existing `CV_FONT_OPTIONS` ids.
- `headingColor` — a hex, or `''` for "the template's own heading colour".

Plus, per template:

- `paletteVariables` — the full list of CSS variables a variant controls.
- `textPairs` — the colour pairs that carry text, each
  `{ foreground, background, size: 'body' | 'large' }`, naming palette
  variables. Used by the contrast check.

Helpers: `getTemplateVariants(templateId)`, `getTemplateVariant(templateId,
variantId)` (falls back to variant #1 for an unknown id), and
`resolveStyleVariantId(formData, templateId)`.

### The CV data

- New field `styleVariantByTemplate: { [templateId]: variantId }`, default
  `{}`, added to the `CvData` shape (`src/utils/cvForm.js`,
  `src/types/cv.d.ts`) alongside `photoVisibilityByTemplate` and
  `sectionColumnsByTemplate`.
- Variant #1 is never stored: choosing it deletes the template's entry. So
  every existing CV, share link and JSON file is unchanged.
- New action `FORM_ACTION.SET_STYLE_VARIANT { templateId, variantId }` in
  `cvFormReducer.js`.

### Share links

- New root key `va` (unused today), encoding only non-default entries, in the
  same filtered-object style as `pv`/`sc`. Permanent once shipped.

### Import and validation

- A non-object `styleVariantByTemplate`, or a non-string value inside it, is
  rejected on JSON import the same way other malformed fields are
  (`cvForm.js`'s import validation).
- An unknown template id or variant id is kept as data but renders as
  variant #1 (`getTemplateVariant`'s fallback), so a CV from a newer version
  or with a typo still imports and renders.

Session restore and JSON export need no changes: both save the CV data.

## 2. Tokenising the templates

- Each template's palette is its **own existing local variables**
  (`--dev-*`, `--np-*`, `--cr-*`, …), declared on its Showcase root in
  `src/styles/templates/<name>.css`. No cross-template naming scheme.
- One pass per stylesheet replaces the remaining hard-coded colours that
  should change with a variant by those variables. Colours that never vary
  (print white, shadows, the PDF blank-canvas guard) stay hard-coded.
- Derived colours (soft tints, borders mixed from a base) are computed in JS
  with the existing `accentSoftFill` / `accentInkMix` helpers
  (`src/utils/templateAccents.js`) and set as variables too, never with CSS
  `color-mix()`.
- Each Showcase root sets the active variant's palette as inline variables,
  next to the existing inline `--tpl-accent`. The off-screen PDF export
  source gets the same props, so PDFs match the screen.
- For a template with an accent, the variant's `accent` seeds that
  template's entry in the existing `templateAccentColors` (§4); the accent
  picker keeps working on top.
- The six templates without an accent (Minimalist, Developer, Modern
  Professional, Classic Professional, Navy Professional, Colorful Compact)
  get variants purely through their palette variables.

Minimalist has no bespoke Showcase: it *is* the flat renderer, the same
renderer every template's ATS view falls back to. So Minimalist's palette
variables are set on the flat renderer's root only when the template is
Minimalist and ATS view is off. Another template's ATS view, and
Minimalist's own, never receive a variant palette (§5).

## 3. The toolbar picker

- A **Style** / **Tyyli** picker in the toolbar right after Template, in both
  Classic and Direct Edit (`src/components/Toolbar.jsx`), following
  `CvFontSwitcher.jsx`'s popover pattern.
- Trigger: the current variant's name plus a small strip of its main colours.
  On narrow screens it shrinks to the colour strip, with the name kept as its
  accessible label.
- Panel: the current template's 3 variants as a radio group. Each row shows
  the name, 3–4 colour chips and the variant's font name; the active one is
  checked. Arrow keys move, Enter/Space picks, Escape closes.
- Picking dispatches `SET_STYLE_VARIANT`; the preview updates immediately,
  and undo/redo covers it like any form change.
- Switching templates shows that template's variants and its stored choice.

## 4. Interaction with the accent, headings-colour and font pickers

- **Picking a variant** (even the active one again) applies its palette
  (stored in the CV), and resets the template's accent in
  `templateAccentColors`, the global `cvFontId` and the global
  `cvHeadingColor` to the variant's values.
- **Tweaking afterwards** works as today and changes only that setting. The
  variant stays selected; the Style trigger shows a **Modified** /
  **Muokattu** marker whenever the current accent, font or headings colour
  differs from the variant's.
- **Loading a CV** (share link, JSON import, session restore, a template-page
  example) applies the stored variant's accent, font and headings colour, so
  a shared CV opens in its variant's full look.
- **Switching templates** applies that template's palette and accent (both
  already per template) but leaves the global font and headings colour
  alone, as today.
- Variant #1's `fontId` is `'inter'`, its `headingColor` is `''` and its
  `accent` is the template's current registry default, so a CV without a
  stored variant renders exactly as before.

## 5. ATS view and exports

- **PDF:** the export source copy renders with the same variant props as the
  visible CV.
- **ATS view:** unchanged behaviour. Templates that fall back to the shared
  flat renderer ignore template colours, so variants don't show there.
  Timeline, Navy Professional and Modern Orange render a simplified version
  of their own Showcase in ATS view; whatever colours they show there today
  come from the variant instead.
- **Word export:** unchanged mechanism. It already takes the template's
  accent for headings, and that accent now starts from the variant.
  Accent-less templates keep black text in Word.
- **HTML export:** unaffected.

## 6. Designing the 36 new variants

- **Same layout, different look.** Only palette and font change; each
  template keeps its character.
- **Colour rule:** `docs/template-design-system.md` §3 — one ink, one accent,
  at most one tint. Colorful Compact keeps its documented multicolour
  exception; its variants are alternative sets of section colours.
- **Fonts:** only the existing `CV_FONT_OPTIONS`.
- **Distinct pairs:** a template's two new variants should differ clearly,
  typically one lighter or cooler and one deeper or warmer.
- **Names:** short, bilingual, unique within the template.
- **User approval:** once designed, every template in all 3 looks (demo CV)
  is published as a review page. The user approves or rejects each variant
  before its batch is finalised.

## Testing

- **`check:reducers`:** `SET_STYLE_VARIANT` sets a variant, choosing
  variant #1 deletes the entry, and other templates' entries are untouched.
- **`check:share`:** `va` round-trips; a CV with no stored variants encodes
  no `va` key.
- **New `check:template-variants`** (`scripts/check-template-variants.mjs`,
  added to `package.json`, CI and `CLAUDE.md`):
  - every template has exactly 3 variants with unique ids, variant #1 id
    `'default'`;
  - every variant sets exactly its template's `paletteVariables`;
  - variant #1's values equal the defaults declared in that template's CSS,
    character for character;
  - no value uses `color-mix(`;
  - every `textPairs` pair meets 4.5:1 (body) or 3:1 (large) in every
    variant;
  - every `fontId` exists in `CV_FONT_OPTIONS`.
- **No visible change from the infrastructure step:** the template ×
  example × normal/ATS and stress-fixture screenshot comparison (170 shots)
  stays byte-identical for variant #1.
- **e2e:**
  - the Style picker in both builder modes, by mouse and keyboard;
  - a variant survives a share link, a JSON export/import round trip and a
    session restore;
  - picking a variant resets the accent, font and headings colour; a
    tweak shows the Modified marker;
  - switching templates keeps each template's own variant.
- **Layout harness:** every variant's example CVs run through
  `template-layout.spec.js` (no clipped text, no mid-word breaks).
- **PDF:** variant #1 keeps the exact `EXPECTED_PDF_PAGES`. Variants #2 and
  #3 get a slow-tier test that their example PDFs stay within the
  template's budget (1 page for one-page templates, 2 for the rest). A
  variant that breaks its budget gets a different font or a density tweak,
  not a looser test.

## Build order

1. **Infrastructure, no visible change:** registry with only variant #1 per
   template, the CV-data field, `va`, the reducer action, the toolbar picker,
   `check:template-variants`, and the tokenising pass over all 18
   stylesheets. Verified by the byte-identical screenshot comparison.
2. **The 36 new variants,** in batches of about 6 templates, each with the
   user's approval of its review page, contrast checks, layout-harness runs
   and PDF budget tests.
3. **Docs:** a variants note in `docs/template-design-system.md` (§2/§3),
   `changes.md`, `todo.md` and `CLAUDE.md` (the new check script and the
   registry as part of a template's files).

## Alternatives considered

- **B. Variant classes in CSS** (`.creative-showcase--sage` with variables
  under it). Less JS, but every colour would live twice — in CSS for the CV
  and in JS for the picker's swatches and the Word export — and could drift.
- **C. Only what's already a variable** (accent and tint). Fast, but the six
  accent-less templates couldn't really change, and sidebars and header
  bands would stay fixed. Doesn't meet the "genuinely different looks" goal.

## Risks

- **Tokenising regresses today's look.** Mitigated by the exact-match check
  on variant #1 and the byte-identical screenshot comparison before any new
  variant lands.
- **A font pushes a variant onto an extra page.** Caught by the PDF budget
  test; fixed with a different font or a density tweak.
- **Contrast in dark-sidebar variants.** Caught by the contrast check over
  every declared text pair.
- **Share-link key and variant ids are permanent.** Reviewed once in step 1;
  ids never renamed afterwards.
