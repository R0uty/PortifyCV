# Template field filters — design (v1.6)

**Date:** 2026-10-11
**Branch:** `v1.6.0` (PR R0uty/PortifyCV#2), based on 1.6.11 (`50936f3`)
**Status:** approved 2026-10-11; implemented in 1.6.12

## Goal

With 18 templates, a visitor has no quick way to see which ones suit their
field. This adds a row of field chips (Tech, Creative, Business,
Leadership, Graduate, Any field) to the Free CV Templates page and the
builder's template gallery. Picking a chip shows only the templates meant
for that field.

## Decisions (made 2026-10-11)

- **What the filters decide:** field / career stage only. Photo, layout,
  length and style filters were considered and not chosen.
- **Per-template photo flag:** dropped. 17 of 18 templates already show a
  photo when one is uploaded and hide it when not (only Classic
  Professional never does), so a plain flag would not filter anything.
- **Placement:** both the Free CV Templates page and the builder gallery,
  one shared component.
- **Interaction:** one chip at a time (approach A). Multi-select (B) and
  "sort, don't hide" (C) were rejected: with 18 templates two chips cover
  most of the list, and a reordering grid feels random.
- **Tags are hand-picked, not derived from the example people.** Deriving
  them from `TEMPLATE_EXAMPLES` would tag 12 of 18 templates Business and
  8 Tech, because the examples were chosen to show range, not to define
  each template's main audience. The table below is each template's main
  audience, read from its description and examples.
- **"Any field" is its own chip.** Its three templates don't also appear
  under every other chip (that would add 3 to every filter). Nurses,
  teachers and similar roles are served by it; a seventh "Healthcare &
  education" chip was considered and not chosen.
- **Address:** the public page keeps the choice in `?field=<id>`, replacing
  the history entry (Back leaves the page, it doesn't step through chips).
  The builder gallery keeps it in local state and opens on All every time.

## Non-goals

- Showing a template's tags on its card.
- Filters on the landing page strip or on a template's own page.
- The per-template photo flag (see Decisions).
- Linking the per-field example pages (e.g. Developer CV examples) to
  `?field=`. An easy follow-up once this ships.
- Pinning the template in use so the gallery filter never hides it.

## 1. Fields and tags

### Field list (`src/utils/templateFields.js`, new)

Ordered as the chips appear. Ids are public once shipped (they appear in
`?field=`), so never rename one; labels may change.

| id | English | Finnish |
|---|---|---|
| (All, no id) | All | Kaikki |
| `tech` | Tech | Tekniikka ja IT |
| `creative` | Creative | Luova ala |
| `business` | Business | Liiketoiminta |
| `leadership` | Leadership | Johto |
| `graduate` | Graduate | Vastavalmistuneet |
| `any` | Any field | Kaikki alat |

The module exports:

- `TEMPLATE_FIELDS`: `[{ id, label: { en, fi } }]` in the order above,
  without All.
- `ALL_FIELDS_LABEL`: `{ en: 'All', fi: 'Kaikki' }`.
- `parseFieldParam(raw)`: the field id if `raw` is a known id, else `null`
  (All). Case-sensitive, like `parseStyleVariantParam`.
- `filterTemplatesByField(templates, fieldId)`: `templates` unchanged for
  `null`, else those whose `fields` include `fieldId`, order kept.

(No `fieldSearch()` helper: the grid edits `URLSearchParams` directly, like
`selectStyle` in `TemplateDetailPage.jsx`, and nothing else builds a
`?field=` URL yet. Add one with the example-page links follow-up.)

Relative imports carry an explicit `.js`, as in `templateVariants.js`, so
Playwright specs can import the module under plain Node ESM.

### Tags (`fields` on each template in `src/utils/cvTemplates.js`)

| Template (id) | `fields` |
|---|---|
| Developer (`developer`) | `tech`, `graduate` |
| Compact (`compact`) | `tech`, `graduate` |
| Portfolio Hybrid (`portfolio`) | `tech`, `creative` |
| Tech Executive (`techExec`) | `leadership`, `tech` |
| Creative (`creative`) | `creative` |
| Colorful Compact (`colorfulCompact`) | `creative` |
| Editorial (`editorial`) | `creative` |
| Portrait (`portrait`) | `creative` |
| Modern Orange (`modernOrange`) | `creative`, `business` |
| Modern Professional (`modern`) | `business` |
| Modern Timeline (`timeline`) | `business` |
| Quadrant (`quadrant`) | `business` |
| Navy Professional (`navyProfessional`) | `leadership`, `business` |
| Executive (`executive`) | `leadership` |
| Graduate (`graduate`) | `graduate` |
| Minimalist (`minimal`) | `any` |
| Classic Professional (`classicProfessional`) | `any` |
| European (`european`) | `any` |

Resulting counts: Tech 4, Creative 6, Business 5, Leadership 3, Graduate 3,
Any field 3. `getCvTemplates(locale)` passes `fields` through unchanged.

## 2. The chip row (`src/components/TemplateFieldFilter.jsx`, new)

Props: `value` (field id or `null`), `onChange(fieldId | null)`, `locale`,
`shownCount`, `totalCount`, `name` (radio group name, unique per page).

- A `role="radiogroup"` labelled "Field" / "Ala" holding seven native
  radio inputs (All first) styled as chips, the same accessible pattern as
  `StyleSwatchGroup`. Arrow keys move between chips; the checked chip is
  visibly filled.
- Below it, a status line with `aria-live="polite"`: "Showing 4 of 18
  templates" / "Näytetään 4/18 pohjaa"; on All, "All 18 templates" /
  "Kaikki 18 pohjaa".
- Chips wrap onto more lines on a narrow screen; no horizontal scrolling.
- Styles in `src/styles/app-shell.css`, next to the existing pill styles,
  using the existing tokens; no new colours.

## 3. Free CV Templates page (`src/pages/FreeCvTemplatesPage.jsx`)

- The chip row sits between the intro section and the grid.
- Initial state: `parseFieldParam(new URLSearchParams(window.location.search).get('field'))`,
  read once on mount (an unknown or missing value starts on All).
- On change: set the state and update the address with
  `window.history.replaceState(window.history.state, '', url)`, where `url`
  is the current URL with `field` set (or deleted for All), keeping any
  other query parameters. Same pattern as the template page's `?style=`
  (`TemplateDetailPage.jsx`). No change to `App.jsx`'s `pushViewUrl`.
- The grid renders `filterTemplatesByField(templates, field)`. The `looks`
  state stays keyed by template id, so a look picked on a card survives the
  card being hidden and shown again.
- Opening a template page from a filtered grid and pressing Back returns to
  `/free-cv-templates?field=<id>`, which reads the filter on mount again.
- The worker builds the canonical URL from the path only, so
  `?field=` never creates a duplicate page for search engines. No worker
  change.

## 4. Builder gallery (`src/components/TemplateGalleryModal.jsx`)

- The same chip row sits above the gallery grid.
- The filter is local `useState(null)` in the modal, so it opens on All
  every time it opens.
- The grid renders `filterTemplatesByField(templates, field)`. The
  `previewedLooks` state stays keyed by template id, so a previewed look
  survives a hide-and-show while the modal is open.
- The template in use is filtered like any other.

## 5. Testing, performance, units of work

### Checks (`scripts/check-template-pages.mjs`)

- Every template has a non-empty `fields` array of known ids, without
  duplicates.
- Every field in `TEMPLATE_FIELDS` has at least two templates.
- Every field label is non-empty in English and Finnish, and labels are
  unique per language.
- `parseFieldParam`: known id → id; unknown, empty, missing, wrong case →
  `null`.
- `filterTemplatesByField` keeps order; `null` returns everything.
- `CLAUDE.md`'s description of `check:template-pages` mentions fields.

### End-to-end (`e2e/template-filters.spec.js`, new)

Expected sets are read from `cvTemplates` and `TEMPLATE_FIELDS`, not
hard-coded.

- Grid: each chip shows exactly its templates, in gallery order; All shows
  all 18.
- Grid: picking a chip writes `?field=<id>` without adding a history entry
  (`history.length` unchanged); All removes it.
- Grid: opening `?field=tech` starts on Tech; `?field=nope` starts on All.
- Grid: the status line reads "Showing N of 18 templates", and its Finnish
  form after switching language, with Finnish chip labels.
- Grid: a look picked on a card is still checked after filtering it away
  and back.
- Grid: Back from a template page opened from a filtered grid returns to
  the same filter.
- Gallery: a chip filters the cards; closing and reopening the gallery
  shows All again.

### Performance and bundle

`fields` adds about 18 short arrays to `cvTemplates.js`, already in the
entry graph. `templateFields.js` and the chip component are imported only
by the lazy-loaded grid page and by the gallery modal, which only the
lazy-loaded builder page imports, so they stay out of the entry chunk; the
build output is checked to confirm it.

### Units of work

One release, 1.6.12, on `v1.6.0`: this spec, then the plan, then the
feature commit(s), then `Bump version to 1.6.12`. Before asking to push:
`npm run lint`, all 8 `check:*` scripts, `CI=1 npm run test:e2e`,
`npm run build`. `changes.md` gets a 1.6.12 entry; `todo.md` marks gallery
filters done and the photo flag dropped (with the reason above).
