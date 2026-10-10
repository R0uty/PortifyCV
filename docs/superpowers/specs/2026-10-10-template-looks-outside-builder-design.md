# Template looks outside the builder — design (v1.6, Phase 4)

**Date:** 2026-10-10
**Branch:** `v1.6.0` (PR R0uty/PortifyCV#2), based on 1.6.0 (`b5c0444`)
**Status:** draft, awaiting the user's review

## Goal

Phase 3 gave every template three looks (`src/utils/templateVariants.js`),
but they can only be seen and picked from the builder toolbar's Style
picker. The builder's template gallery, the Free CV Templates grid and the
per-template pages (`/free-cv-templates/<slug>`) always show each template's
first look. This phase lets a visitor see all three looks on those three
surfaces and carry the chosen look into the builder.

## Decisions (made 2026-10-10)

- **Scope:** only "looks outside the builder". Gallery filters and the
  per-template photo flag, the template in share links, the contrast
  hotfixes and slimming the variant registry are not part of this phase.
- **Card interaction:** preview, then Use. A card has three look swatches;
  clicking one re-renders that card's thumbnail only. The card's Use action
  applies the template and the shown look together.
- **Builder gallery start state:** each card starts on the look this CV has
  stored for that template (else Original). The open template's card shows
  the live preview's values, tab-only tweaks included, while it's on its
  stored look.
- **Use result:** exactly what the card shows. Using a card switches the
  template and applies its look (accent, font, headings colour), the same as
  picking it in the Style picker.
- **Template page:** a Style picker beside the Examples radios, kept in the
  URL as `?style=<variantId>`, and carried into the builder by both "Use
  this example" and "Start blank".
- **Landing page:** unchanged (the marquee and hero keep the first look).
- **Versions:** 1.6.1, 1.6.2 … per unit of work, patch bumps only; the PR
  merges whatever 1.6.x is last.

## Non-goals

- The landing page's templates marquee and hero preview.
- Gallery filters, tags or a per-template photo flag.
- Carrying the selected template in share links.
- Changing any look's colours, including the 13 first-look
  `defaultContrastExceptions`.
- Moving `textPairs`/`defaultContrastExceptions` out of the runtime registry.
- Any layout, density or page-count change. `EXPECTED_PDF_PAGES` stays as is.

## 1. Shared pieces

### `getVariantLook(templateId, variantId)` (in `templateVariants.js`)

Resolves through `getTemplateVariant`, so an unknown or missing id falls
back to Original. Returns:

```js
{
  styleVariantId,   // the resolved variant's id
  accentColor,      // the look's accent, or resolveTemplateAccent(null, templateId) when it has none
  fontId,           // variant.fontId
  fontStack,        // getCvFontStack(variant.fontId)
  headingColor,     // variant.headingColor ('' = the template's own)
}
```

`templateVariants.js` keeps its explicit `.js` relative imports so
Playwright specs can still import it under plain Node ESM.

### `StyleSwatchGroup` (new component, `src/components/StyleSwatchGroup.jsx`)

- Props: `templateId`, `value`, `onChange(variantId)`, `locale`, `name`
  (unique per group, for the radio `name`), `size: 'card' | 'page'`.
- Markup: a `role="radiogroup"` with an accessible label ("Style" /
  "Tyyli", plus the template's name on cards). It holds one native
  `<input type="radio">` per look, visually a colour strip built from
  `getVariantSwatches`, whose accessible name is the look's label in the
  current locale.
- `page` size also shows the look's label text next to the strip.
- Keyboard: native radio behaviour (Tab into the group, arrows between
  looks), with a visible focus ring.
- It only ever emits variant ids from the registry. These are already
  permanent, since share links store them under `va`.

### Thumbnail and preview props

- `TemplateThumbnail` gains `styleVariantId`, `accentColor` and `fontId` (it
  already has `fontStack`/`headingColor`) and forwards the first two to
  `CVPreview`.
- `ScaledPreview` gains `styleVariantId`, `fontId`, `fontStack` and
  `headingColor`. `fontStack` is applied as the `--font-sans` override,
  exactly as `TemplateThumbnail` does.
- Both call `loadCvFont(fontId)` in an effect when `fontId` is set, because
  Calibri (Carlito) and Lato are lazy-loaded. Without it, a look using one
  of them would render in the fallback face outside the builder, which
  loads only the CV's current font.
- `CVPreview` already applies `getVariantPaletteStyle(variant,
  styleVariantId)` and takes `accentColor`/`headingColor`, so it is
  unchanged.
- Callers spread `getVariantLook(...)` into these props.

## 2. Builder gallery modal (`TemplateGalleryModal`)

### State

- A `previewedLook` map, `{ [templateId]: variantId }`, rebuilt each time
  the modal opens.
- Each card's initial entry is `resolveStyleVariantId(formData,
  templateId)`.
- The builder additionally passes the live `templateAccentColors`
  (`cvFontId` and `cvHeadingColor` are already passed).

### Rendering

- A card renders `getVariantLook(templateId, previewedLook[templateId])`.
- **The exception is the open template's card while it shows its stored
  look.** It renders the live values instead:
  `resolveTemplateAccent(templateAccentColors, templateId)`,
  `getCvFontStack(cvFontId)` and `cvHeadingColor`. It therefore matches the
  builder preview, Modified tweaks included. Picking another swatch on that
  card shows that look's own values. Picking the stored swatch again goes
  back to the live values.
- This replaces today's behaviour, where every card is painted with the open
  template's font and headings colour on top of its first-look palette.

### Layout

- The `card`-size `StyleSwatchGroup` sits in its own row between the
  thumbnail and the select button.
- It sits outside the clickable thumbnail `<div>` and outside the
  `<button>`, because a radiogroup can't be nested in a button.
- A swatch click only changes `previewedLook`.

### Use

- The select button and the thumbnail click call
  `onSelectTemplate(templateId, variantId)` and close the modal.
- The builder's `handleSelectTemplate(templateId, variantId)` works like
  this:
  - **Same template as open and `variantId` equal to its stored look:**
    nothing changes. The modal just closes, and tweaks are kept.
  - **Otherwise:** dispatch `SET_SELECTED_TEMPLATE`, then
    `FORM_ACTION.SET_STYLE_VARIANT` and `UI_ACTION.APPLY_STYLE_VARIANT_LOOK`
    for `templateId` with `getTemplateVariant(templateId, variantId)`. This
    is the same pair the Style picker's `handleSelectStyleVariant`
    dispatches, factored into one helper that both call.
- When the variant is omitted, any other caller of `onSelectTemplate` keeps
  today's plain template switch.

Button labels:

| Card | Label (en / fi) |
| --- | --- |
| Not the open template | "Use template" / "Käytä pohjaa" |
| Open template, on its stored look | "In use" / "Käytössä" |
| Open template, another look previewed | "Use this style" / "Käytä tyyliä" |

### Undo

- When the stored variant changes, the existing Phase 3 undo path restores
  the previous look.
- The template switch itself stays outside undo, as today.
- **Known limit:** using another template on the look it already has stored
  resets the font and headings colour to that look's values without an undo
  step, because no stored variant changed. This is accepted; no new history
  plumbing.

### "View examples"

The link's `href` carries the card's previewed look as `?style=<id>`,
omitted when it's Original, so the template page opens on the same look.

## 3. Public pages and the builder handoff

### Free CV Templates grid (`FreeCvTemplatesPage`)

- Each card gets a `card`-size `StyleSwatchGroup` under the thumbnail.
  Per-card state starts on Original.
- The thumbnail renders `getVariantLook(id, look)`.
- **"Use this template"** calls `onGetStarted(id, undefined, { style })`.
- **The thumbnail click, the name link and "View examples"** go to the
  template page with `?style=<id>`. The real `href` carries it too, so
  open-in-new-tab and no-JS work.
- Original is never written into a URL: it is the absence of `?style=`.

### Navigation with a query string

`App.jsx`'s `goToView(view, { search } = {})` and
`pushViewUrl(view, search)` accept an optional search string, pushed after
the view's `VIEW_HEAD` path. A call without it behaves exactly as today.

### Template page (`TemplateDetailPage`)

- A `page`-size `StyleSwatchGroup` labelled "Style" / "Tyyli" sits right
  after the Examples radios.
- The initial value comes from `?style=`, validated against
  `getTemplateVariants(templateId)`. An unknown id means Original.
- A change calls `history.replaceState`, keeping `?example=` and other
  params. Choosing Original deletes `style`. This mirrors `selectExample`.
- The `ScaledPreview` renders `getVariantLook(templateId, look)`.
- With "ATS view" on, CVPreview's ATS rendering is unchanged. A look's
  palette, font and headings colour show wherever that template's ATS
  rendering already uses them.
- "Use this example" and "Start blank" pass `{ style }` to `onGetStarted`.
- When the pager or an internal link moves to another template, the look
  re-initialises from the new URL (or Original).
- **SEO:** the worker builds the canonical from the path only
  (`${SITE_ORIGIN}${head.path}`, `worker/index.js`), so a `?style=` URL
  canonicalises to the slug page. No worker change is needed.

### Builder handoff (`?style=<variantId>`)

- `goToBuilder(templateId, exampleId, options)` adds `style` when
  `options.style` is set and isn't Original.
- The builder validates it against `getTemplateVariants(selected
  template)`. An invalid id is ignored.
- **It applies to whatever CV the template-page path starts the builder
  with:** the `?blank=1` CV, the loaded `?example=` CV, the first-visit
  onboarding demo, or the default blank CV.
  - That template's `styleVariantByTemplate` entry is set (or deleted for
    Original).
  - The look's accent, font and headings colour are applied.
  - For an example, `?style=` wins over any look the example stores for
    that template.
- **A share link or a restored session ignores `?style=`**, just as they
  ignore `?example=`.
  - The restored-session toast ("Kept your restored CV…") also fires when
    only a valid `?style=` was pending.
- `?style=` is stripped from the URL together with `?example=`/`?blank=`,
  so a reload doesn't re-apply it.
- It is part of the initial state, not an undoable step, the same as
  `?example=`.

## 4. Testing, performance, units of work

### Tests

New `e2e/template-looks.spec.js`. It asserts on the Showcase root's inline
palette variables, the `--font-sans` override and the Style picker's label,
not on screenshots.

- **Gallery modal:**
  - cards open on the stored looks;
  - the open template's card mirrors live tweaks;
  - a swatch click changes only its own card;
  - Use applies template + look, and Undo restores the stored look;
  - same template + same stored look keeps the tweaks;
  - "View examples" carries `?style=`.
- **Grid:**
  - a swatch changes only its card;
  - the name, thumbnail and "View examples" targets carry `?style=` for
    looks #2/#3 and none for Original;
  - "Use this template" lands in the builder on the look.
- **Template page:**
  - `?style=` is read on load, and an unknown id gives Original;
  - the picker updates the URL while keeping `?example=`;
  - the pager re-initialises the look.
- **Handoff:**
  - "Use this example" and "Start blank" land on the look, and the param is
    stripped;
  - a restored session ignores it and shows the toast.
- **Accessibility:** a named radiogroup with named radios, and arrow keys
  move the selected look.

Other checks:

- `check:template-variants` gains assertions for `getVariantLook`: the
  unknown-id fallback, and each look's own font stack, accent and headings
  colour.
- Existing specs (`style-variants`, `templates`, template-page specs, the
  layout and PDF harness) stay green with no fixture or page-count changes.
- **Before any claim of done:** `npm run lint`, all 8 `npm run check:*`,
  `CI=1 npm run test:e2e`, and `npm run build`.

### Performance and bundle

- A swatch click re-renders one memoised thumbnail, not the grid.
- `templateVariants.js` and `StyleSwatchGroup` stay out of the entry graph.
  `App.jsx` only passes the `style` string through. The builder-side
  `?style=` handling lives in `uiReducer`/`ResumeBuilderPage`, which already
  import the registry inside the lazy builder chunk. `StyleSwatchGroup` is
  imported only by the lazy gallery modal, grid and template-page chunks.
- Compare `npm run build` chunk sizes before and after; record the delta in
  `changes.md`.

### Units of work

Each unit ends with a standalone "Bump version to X" commit
(`npm version X --no-git-tag-version`). Commits carry no attribution
trailers.

1. **1.6.1, shared pieces:** `getVariantLook`, `StyleSwatchGroup`, the new
   `TemplateThumbnail`/`ScaledPreview` props, and the
   `check:template-variants` additions.
2. **1.6.2, builder gallery modal:** per-card looks, the live active card,
   `onSelectTemplate(templateId, variantId)` with the shared
   select-and-apply helper, and the modal's e2e tests.
3. **1.6.3, grid and template page:** both pickers, `?style=` in their links
   and URL, the `goToView` `search` argument, and their e2e tests.
4. **1.6.4, builder handoff and docs:** `?style=` in `goToBuilder` and the
   initial session, the handoff e2e tests, the `changes.md` entry, closing
   `todo.md`'s "Phase 4 follow-up (not started)", and a CLAUDE.md note on
   `?style=`.

Pushes go to `origin v1.6.0` (`git push origin HEAD:v1.6.0`) only with the
user's OK. Nothing merges into `main` without the user's explicit OK.
