# Direct Edit Phase 2 Round 3: Portrait Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Portrait template's bespoke Showcase into the Direct
Edit inline-editing system — identity (name/title/contact) + About +
Experience + Skills, the same scope every prior round has covered — and
add it to `DIRECT_EDIT_SUPPORTED_TEMPLATES`.

**Architecture:** Same shape as Rounds 1-2. `src/components/templates/PortraitShowcase.jsx`
is a fully bespoke, hand-written component structurally almost identical
to Round 2's Editorial (single main column, no accent numbering, same
`metaItems`/contact-row shape, same experience-entry shape) — the main
new element is a read-only photo/monogram rail (`<aside>`), completely
out of this round's scope. Each task wires one part of the main column
directly with `EditableField`/`EditableList`/`EditableChip`
(`src/components/EditableField.jsx`, `src/components/EditableList.jsx`),
gated by a `DirectEditProvider` wrapped locally around this one
Showcase's call site in `CVPreview.jsx` (Task 1). No new
`cvFormReducer` actions anywhere.

**Tech Stack:** React 19, hand-written utility CSS. Existing `@dnd-kit`
for `EditableList`'s drag-to-reorder. Playwright for e2e.

**Spec:** `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`
(Phase 2 roadmap) + `docs/superpowers/specs/2026-09-13-direct-edit-builder-design.md`
(original Phase 1 architecture, still binding).

## A note on two deferred decisions before this round's tasks

Round 2's final whole-branch review flagged two near-duplicate patterns
across templates and explicitly deferred acting on them: an ~30-line
near-identical e2e "smoke test" per template, and a `renderExperienceEntry`
function that now exists twice (Classic Professional, Editorial) differing
only in class-name prefix and separator glyph — with the note "flag this
explicitly if Round 3 would be a third near-identical copy." This round
IS that third copy of both patterns.

**Ruling for this round: keep copying, don't extract yet.** Reasoning:
extracting a shared JSX-rendering helper (for `renderExperienceEntry`) or
a shared e2e test helper is a genuine architectural decision, not a
mechanical refactor — and this `oneColumn` family still has one more
template after Portrait (Modern Timeline) before it's done, plus Compact
as a deliberately-different, categorized-skills outlier. Extracting now,
with only 3 data points instead of the family's full 4-5, risks guessing
the wrong shape for the abstraction (e.g. assuming every template's
separator is a single glyph, when a later template might need something
structurally different) and having to redo it. Defer the actual
extraction decision to Modern Timeline's own plan (the last
`oneColumn`-family round before Compact), when the full shape of the
variation across the family is visible. This round's Tasks 2 and 4 below
still copy the proven Round-1/Round-2 pattern — not a regression, a
deliberate one-more-round deferral, recorded here so it isn't silently
repeated forever.

## Global Constraints

- No new `cvFormReducer` actions — every new call site dispatches one of
  the existing `FORM_ACTION` cases: `SET_ROOT_FIELD`, `UPDATE_ARRAY_ITEM`,
  `ADD_ARRAY_ITEM`, `REMOVE_ARRAY_ITEM`, `MOVE_ARRAY_ITEM_TO_INDEX`,
  `ADD_SKILL`, `REMOVE_SKILL`.
- Same section scope as every prior round: identity (name/title/phone/
  email/location) + About + Experience (role/company/description only —
  dates and location's own text stay read-only) + Skills. Education,
  Projects, Links, Languages, Certificates stay completely untouched and
  read-only.
- `EditableField`'s `value` prop is always the RAW `formData.x` (never a
  locally-combined `snapshot.x || fallback` variable). Where an existing
  local variable is ALSO used somewhere else in the file untouched by
  this plan, keep that local variable for that other use; only the
  specific JSX spot named in each task switches to the raw-value
  `EditableField`. Portrait's `fullName` local has THREE uses today (the
  `<h1>` this plan replaces, the photo `alt` text, AND the no-photo
  monogram's first-letter computation) — keep it; only `title` and
  `about` (each used exactly once, at the spot being replaced) get
  deleted.
- `linkedinUrl` stays completely read-only in every task — never wrapped
  in an `EditableField`.
- **Never pass `className` directly into `EditableField`.** Round 2's
  final review found a real, live bug: Editorial's contact row was the
  only call site in the codebase doing this, and it collided the
  template's own class with `EditableField`'s internal
  `direct-edit-field--empty` class on the same element — two `::before`
  rules (the template's meta-item separator, and `direct-edit.css`'s
  placeholder text) fought at equal specificity, and the placeholder
  silently lost, blanking Email/Phone's labels on an empty CV. Always
  wrap `EditableField` in a plain `<span>` and put the template class on
  that wrapper instead (this is what Round 1's Classic Professional
  already did, by luck rather than design — Task 1 below follows that
  same wrapper-span shape from the start, deliberately this time).
- **Any task that introduces a new CSS class name for an "editing state"
  variant (e.g. `<something>--editing`) MUST add the matching stylesheet
  rule in the SAME task**, including an explicit `white-space: pre-line`
  if the class replaces a bulleted `<ul>`/`<li>` layout with a plain
  editable text node. Round 1's final review found a Critical bug from
  skipping exactly this (multi-line Experience descriptions silently
  collapsing to one line in the user's actual saved data). Before marking
  any task complete that touches `.css`, grep the touched `.jsx` file's
  new/changed class names against the matching `.css` file and confirm
  each one has a rule.
- Commits carry only the repo's own git identity
  (`r0uty <yasa.sheva@gmail.com>`) — never a Claude/AI co-authorship
  trailer.
- `DIRECT_EDIT_SUPPORTED_TEMPLATES` (`src/utils/directEdit.js`) gets
  exactly one new entry, `'portrait'`, added ONLY in Task 4 (last) — not
  before, so the template is never reachable in Direct Edit mode with
  half-finished wiring at any intermediate commit.
- **Testing a multi-line description regression**: if any task writes an
  e2e test for the Experience description's multi-line behavior, it MUST
  seed the multi-line value through Classic mode's own `<textarea>` (a
  real `\n` character) BEFORE switching to Direct Edit and force a
  dispatch by appending at the field's true end (`Control+End`, not the
  line-relative `End` key) — never by typing "line one, press Enter, line
  two" inside the Direct Edit field itself (a typed Enter inserts a real
  `<br>`, and `innerText` — what `EditableField` dispatches on — always
  reports a `<br>` as a line break regardless of `white-space` CSS, so a
  typed-Enter test passes whether or not the underlying bug is present).
- **Testing an empty-field placeholder**: if any task's manual or e2e
  verification checks a placeholder label, check the RENDERED `::before`
  content (e.g. via `getComputedStyle(el, '::before').content` in an e2e
  test, or visually in a browser) — never just the `data-placeholder`
  attribute's presence, which is always set on the element regardless of
  whether the CSS actually renders it (this was the exact gap in Round 2
  that let the contact-row bug through undetected).
- Bump `package.json`'s patch version by one as the final standalone
  commit (currently `1.2.37` → `1.2.38`).
- Add a `changes.md` entry (repo root, newest entry at the top) — every
  prior unit of Direct Edit work has one.

---

### Task 1: Identity block, contact fields, and About

**Files:**
- Modify: `src/components/CVPreview.jsx` (Portrait delegation branch,
  currently at line 420)
- Modify: `src/components/templates/PortraitShowcase.jsx`

**Interfaces:**
- Consumes: `EditableField` (default export, `src/components/EditableField.jsx`)
  — props `as`, `path` (`{kind:'root', field}`), `value` (raw),
  `placeholder`, `multiline` (boolean). Never pass `className` into it
  (see Global Constraints) — wrap in a plain `<span>` instead wherever a
  template class is needed. `DirectEditProvider` (named export,
  `src/components/DirectEditContext.jsx`) — already imported in
  `CVPreview.jsx`.
- Produces: `PortraitShowcase` gains a `directEditDispatch = null` prop.
  Tasks 2 and 3 read this same prop from the same component signature —
  do not rename it.

- [ ] **Step 1: Wrap Portrait's call site in `CVPreview.jsx` with `DirectEditProvider` and pass `directEditDispatch`**

Find the Portrait delegation branch (currently lines 420-433):

```jsx
  if (variant === 'portrait' && !atsFriendlyMode) {
    return (
      <Suspense fallback={null}>
        <PortraitShowcase
          formData={formData}
          locale={locale}
          previewRef={previewRef}
          templateConfig={templateConfig}
          headingColor={headingColor}
          accentColor={accentColor}
        />
      </Suspense>
    )
  }
```

Replace with:

```jsx
  if (variant === 'portrait' && !atsFriendlyMode) {
    return (
      <DirectEditProvider isEditing={Boolean(directEditDispatch)} dispatchFormData={directEditDispatch}>
        <Suspense fallback={null}>
          <PortraitShowcase
            formData={formData}
            locale={locale}
            previewRef={previewRef}
            templateConfig={templateConfig}
            headingColor={headingColor}
            accentColor={accentColor}
            directEditDispatch={directEditDispatch}
          />
        </Suspense>
      </DirectEditProvider>
    )
  }
```

`DirectEditProvider` is already imported at the top of `CVPreview.jsx` —
no new import needed. `directEditDispatch` is already a prop `CVPreview`
itself receives — no new prop-drilling needed at this layer.

- [ ] **Step 2: Import `EditableField` in `PortraitShowcase.jsx` and add the `directEditDispatch` prop**

At the top of `src/components/templates/PortraitShowcase.jsx`, add:

```js
import EditableField from '../EditableField'
```

Change the component signature from:

```jsx
export default function PortraitShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  headingColor = null,
  accentColor = PORTRAIT_DEFAULT_ACCENT_COLOR,
}) {
```

to:

```jsx
export default function PortraitShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  headingColor = null,
  accentColor = PORTRAIT_DEFAULT_ACCENT_COLOR,
  directEditDispatch = null,
}) {
```

- [ ] **Step 3: Wire the name and title fields**

Find (inside the `<header>`, currently):

```jsx
          <h1 className="portrait-showcase__name">{fullName}</h1>
          <p className="portrait-showcase__role">{title}</p>
```

Replace with:

```jsx
          <h1 className="portrait-showcase__name">
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'fullName' }}
              value={formData.fullName}
              placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
            />
          </h1>
          <p className="portrait-showcase__role">
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'title' }}
              value={formData.title}
              placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
            />
          </p>
```

Do **not** delete the existing `fullName` local variable:

```js
  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
```

It has TWO other uses in this file, both untouched by this plan and both
would break if `fullName` were deleted:

```js
  const monogram = fullName.trim().charAt(0).toUpperCase() || '?'
```

and the photo's `alt` text:

```jsx
  alt={`${fullName} profile`}
```

`title` DOES become unused after this step and **should** be deleted
(grep confirms its only other use was the `<p className="...role">` line
just replaced):

```js
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Professional Title')
```

- [ ] **Step 4: Wire the editable contact fields, keeping LinkedIn read-only**

Find the existing `metaItems` construction:

```js
  const linkedinUrl = snapshot.links.linkedin
  const metaItems = [
    ['location', snapshot.location],
    ['email', snapshot.email],
    ['phone', snapshot.phone],
    ['linkedin', linkedinUrl ? formatLinkDisplayValue(linkedinUrl) : ''],
  ].filter(([, value]) => value)
```

Leave this exactly as-is (it's still what read-only/Classic mode uses)
and add a new array right after it, in the same `location, email, phone`
order, WITHOUT linkedin (linkedin is handled separately, read-only, in
the next step):

```js
  const directEditMetaFields = [
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
  ]
```

- [ ] **Step 5: Render the contact row, switching between the two arrays — `EditableField` wrapped in a `<span>`, never given `className` directly**

Find:

```jsx
          {metaItems.length > 0 ? (
            <div className="portrait-showcase__meta">
              {metaItems.map(([key, value]) => (
                <span key={key} className="portrait-showcase__meta-item">{value}</span>
              ))}
            </div>
          ) : null}
```

Replace with:

```jsx
          {directEditDispatch || metaItems.length > 0 ? (
            <div className="portrait-showcase__meta">
              {(directEditDispatch ? directEditMetaFields : metaItems).map(([key, value, placeholderLabel]) => (
                directEditDispatch ? (
                  <span key={key} className="portrait-showcase__meta-item">
                    <EditableField
                      as="span"
                      path={{ kind: 'root', field: key }}
                      value={value}
                      placeholder={placeholderLabel}
                    />
                  </span>
                ) : (
                  <span key={key} className="portrait-showcase__meta-item">{value}</span>
                )
              ))}
              {directEditDispatch && linkedinUrl ? (
                <span className="portrait-showcase__meta-item">{formatLinkDisplayValue(linkedinUrl)}</span>
              ) : null}
            </div>
          ) : null}
```

Note `EditableField` here receives NO `className` prop — the template
class lives only on the wrapping `<span>`. Read-only rendering is
byte-identical to before (still driven entirely by the untouched
`metaItems`). The `.portrait-showcase__meta-item + .portrait-showcase__meta-item::before`
separator rule (portrait.css) keeps working automatically, since the
wrapper spans are still adjacent siblings, one per contact field.

- [ ] **Step 6: Wire About**

Find:

```js
  const about = snapshot.about
    || (isFinnish
      ? 'Ammatillinen yhteenvetosi näkyy tässä, kun täytät CV-lomaketta.'
      : 'Your professional summary will appear here as you fill out the CV form.')
```

and, inside `renderSection`'s `'about'` branch:

```jsx
        <Section key={key} id="about" title={copy.about}>
          <p className="portrait-showcase__intro">{about}</p>
        </Section>
```

Delete the `about` local variable entirely (grep confirms it's used
nowhere else in the file) and replace the JSX with:

```jsx
        <Section key={key} id="about" title={copy.about}>
          <p className="portrait-showcase__intro">
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'about' }}
              value={formData.about}
              placeholder={
                isFinnish
                  ? 'Ammatillinen yhteenvetosi näkyy tässä, kun täytät CV-lomaketta.'
                  : 'Your professional summary will appear here as you fill out the CV form.'
              }
              multiline
            />
          </p>
        </Section>
```

`.portrait-showcase__intro` (portrait.css) already carries `white-space:
pre-line` — no CSS change needed for this step.

- [ ] **Step 7: Manual verification**

`DIRECT_EDIT_SUPPORTED_TEMPLATES` doesn't include `'portrait'` yet
(that's Task 4), so temporarily add it locally to
`src/utils/directEdit.js` to test, then revert before committing:

1. `npm run dev`, open the app, select the Portrait template.
2. Temporarily edit `DIRECT_EDIT_SUPPORTED_TEMPLATES` to include
   `'portrait'`, switch to Direct Edit mode.
3. Confirm the name, title, location, email, and phone fields are each
   directly editable in the live preview, LinkedIn is NOT editable, and
   the About paragraph is editable and accepts multiple lines.
4. **Reset the form to empty** (Reset form → Confirm reset), confirm
   Location/Email/Phone each show their PLACEHOLDER LABEL, not a stray
   `·` separator or blank space, while empty in Direct Edit mode — this
   is the exact check Round 2 skipped and shipped a real bug because of.
5. Reload demo CV, edit the name, switch to Classic mode, confirm the
   "Full name" form field shows the edited value.
6. Confirm the no-photo monogram (or the actual photo, if one is set)
   still renders correctly in the left rail — this plan doesn't touch it,
   but `fullName` now flows into three separate uses, so a quick sanity
   check costs nothing.
7. Revert the temporary `directEdit.js` edit
   (`git diff src/utils/directEdit.js` must be empty before committing).

- [ ] **Step 8: Verify and commit**

```bash
npm run lint
npm run check:reducers
npm run build
git status  # confirm src/utils/directEdit.js is unchanged
git add src/components/CVPreview.jsx src/components/templates/PortraitShowcase.jsx
git commit -m "Wire Portrait's identity block and About into Direct Edit"
```

---

### Task 2: Experience section

**Files:**
- Modify: `src/components/templates/PortraitShowcase.jsx`
- Modify: `src/styles/templates/portrait.css`

**Interfaces:**
- Consumes: `EditableField`, `directEditDispatch` prop (Task 1).
  `EditableList` (default export, `src/components/EditableList.jsx`) —
  props `section`, `items`, `addLabel`, `children` (render-prop).
- Produces: a module-level `renderExperienceEntry(item, index, { directEditDispatch, copy })`
  function, alongside the existing module-level `splitToBullets` helper —
  declared OUTSIDE the component. Per this plan's preamble, this is a
  deliberate third copy of the same pattern as Classic Professional's and
  Editorial's — not extracted yet, see the ruling above.

- [ ] **Step 1: Extract `renderExperienceEntry` as a module-level function**

Above the `PortraitShowcase` component's own `export default function`
line (next to the existing `splitToBullets` helper), add:

```jsx
function renderExperienceEntry(item, index, { directEditDispatch, copy }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <div key={`${item.role}-${item.company}-${index}`} className="portrait-showcase__entry" data-export-card="true">
      <div className="portrait-showcase__entry-row">
        <p className="portrait-showcase__entry-role">
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'role' }}
              value={item.role}
              placeholder={copy.untitledRole}
            />
          ) : (
            item.role || copy.untitledRole
          )}
        </p>
        <p className="portrait-showcase__entry-dates">{dateRange || copy.datesPending}</p>
      </div>
      {directEditDispatch || item.company || item.location ? (
        <p className="portrait-showcase__entry-meta">
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
              value={item.company}
              placeholder={copy.company}
            />
          ) : (
            item.company
          )}
          {item.company && item.location ? ` · ${item.location}` : item.location || null}
        </p>
      ) : null}
      {directEditDispatch ? (
        <p className="portrait-showcase__bullets portrait-showcase__bullets--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="portrait-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
```

The `{item.company && item.location ? ` · ${item.location}` : item.location || null}`
line does not need a ternary on `directEditDispatch` — it's the same
correct expression regardless (never a leading separator for a
location-only entry).

- [ ] **Step 2: Add the matching CSS rule for the editing-state bullets class — REQUIRED, not optional**

In `src/styles/templates/portrait.css`, find the existing rules:

```css
.portrait-showcase__bullets li {
  font-size: var(--tpl-body-size);
  line-height: 1.6;
  color: var(--pt-ink);
}

.portrait-showcase__bullets li::marker {
  color: var(--tpl-accent);
}
```

Immediately after the `li::marker` rule, add:

```css
.portrait-showcase__bullets--editing {
  display: block;
  padding-left: 0;
  white-space: pre-line;
  font-size: var(--tpl-body-size);
  line-height: 1.6;
  color: var(--pt-ink);
}
```

This is the exact class this task's JSX (Step 1) renders on the editing
branch's `<p>`. `white-space: pre-line` is the load-bearing property —
without it, `EditableField`'s `innerText`-based dispatch would collapse
an embedded newline to a space the first time the field is edited,
exactly the Round-1 Critical bug this Global Constraint exists to
prevent.

- [ ] **Step 3: Add the two new `copy` entries**

Find the `copy` object in the component body:

```js
  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    about: isFinnish ? 'Esittely' : 'About',
```

Add two keys right after `datesPending`:

```js
  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
    about: isFinnish ? 'Esittely' : 'About',
```

(leave every other existing key untouched).

- [ ] **Step 4: Route the Experience section through `EditableList`, reusing the extracted function**

Find the `'experience'` branch of `renderSection`:

```jsx
    if (key === 'experience') {
      return (
        <Section key={key} id="experience" title={copy.experience}>
          <div className="portrait-showcase__entry-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []
                const metaLine = [item.company, item.location].filter(Boolean).join(' · ')

                return (
                  <div key={`${item.role}-${item.company}-${index}`} className="portrait-showcase__entry" data-export-card="true">
                    <div className="portrait-showcase__entry-row">
                      <p className="portrait-showcase__entry-role">{item.role || copy.untitledRole}</p>
                      <p className="portrait-showcase__entry-dates">{dateRange || copy.datesPending}</p>
                    </div>
                    {metaLine ? <p className="portrait-showcase__entry-meta">{metaLine}</p> : null}
                    {bullets.length > 0 ? (
                      <ul className="portrait-showcase__bullets">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="portrait-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }
```

Replace with:

```jsx
    if (key === 'experience') {
      return (
        <Section key={key} id="experience" title={copy.experience}>
          <div className="portrait-showcase__entry-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
              >
                {(item, index) => renderExperienceEntry(item, index, { directEditDispatch, copy })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, { directEditDispatch, copy }))
            ) : (
              <p className="portrait-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }
```

Add the `EditableList` import at the top of the file:

```js
import EditableList from '../EditableList'
```

- [ ] **Step 5: Manual verification**

Temporarily add `'portrait'` to `DIRECT_EDIT_SUPPORTED_TEMPLATES` (same
pattern as Task 1's Step 7), then in a real browser:

1. Load the demo CV, select Portrait, switch to Direct Edit.
2. Confirm role, company, and description are each editable per
   Experience entry; dates and the entry's own location text remain
   read-only.
3. Confirm "+ Add experience" adds a new empty entry.
4. Attempt drag-reorder via the handle. This environment has previously
   shown inconsistent results for `@dnd-kit` drag interactions — if it
   doesn't visibly reorder, cross-check by attempting the identical
   interaction on an already-shipped template (Minimalist, Classic
   Professional, or Editorial) using the same `EditableList` component;
   if it fails identically there too, it's a known environment
   limitation, not a defect in this task's code — note it in your report
   either way, don't treat it alone as blocking.
5. Revert the temporary `directEdit.js` edit before committing.

- [ ] **Step 6: Grep-verify the CSS rule you added actually matches the class you rendered**

```bash
grep -n "portrait-showcase__bullets--editing" src/components/templates/PortraitShowcase.jsx src/styles/templates/portrait.css
```

Both files must show a match.

- [ ] **Step 7: Verify and commit**

```bash
npm run lint
npm run check:reducers
npm run build
git status  # confirm src/utils/directEdit.js is unchanged
git add src/components/templates/PortraitShowcase.jsx src/styles/templates/portrait.css
git commit -m "Wire Portrait's Experience section into Direct Edit"
```

---

### Task 3: Skills section

**Files:**
- Modify: `src/components/templates/PortraitShowcase.jsx`

**Interfaces:**
- Consumes: `EditableChip` (named export, `src/components/EditableList.jsx`)
  — props `skills`, `addLabel`. Renders nothing when `!isEditing`.
- Produces: nothing new consumed by later tasks.

- [ ] **Step 1: Import `EditableChip`**

Combine into the existing `EditableList` import added in Task 2:

```js
import EditableList, { EditableChip } from '../EditableList'
```

- [ ] **Step 2: Replace the Skills branch's mutually-exclusive rendering**

Find the `'skills'` branch of `renderSection`:

```jsx
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" title={copy.skills}>
          {snapshot.skills.length > 0 ? (
            <div className="portrait-showcase__tag-row">
              {snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="portrait-showcase__tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="portrait-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }
```

Replace with:

```jsx
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" title={copy.skills}>
          {directEditDispatch ? (
            <div className="portrait-showcase__tag-row">
              <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
            </div>
          ) : snapshot.skills.length > 0 ? (
            <div className="portrait-showcase__tag-row">
              {snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="portrait-showcase__tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="portrait-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }
```

This is the same three-way mutually-exclusive ternary Round 2 used for
Editorial, for the same reason: `.portrait-showcase__tag-row` carries its
own `margin-top: 0.9rem` and `.portrait-showcase__empty` carries its own
`margin-top: 0.8rem` — nesting the empty-state `<p>` inside a
persistently-rendered `.tag-row` div would stack both margins (flex-item
margins never collapse), adding an unwanted extra gap above the empty
state. Keeping the three states as fully separate branches avoids that.
`directEditDispatch` is checked first, so the read-only branches are
structurally unreachable while editing — every skill renders exactly
once, by construction.

- [ ] **Step 3: Manual verification**

Temporarily add `'portrait'` to `DIRECT_EDIT_SUPPORTED_TEMPLATES`:

1. Load the demo CV, select Portrait, switch to Direct Edit.
2. Confirm the Skills section shows each demo skill exactly once, as a
   removable chip; click the × on one, confirm it's removed and doesn't
   reappear.
3. Confirm zero plain `data-export-skill="true"` tags exist in the DOM
   while editing.
4. Click "+ Add", confirm a new "New skill N" chip appears.
5. Switch to Classic mode, confirm the Skills section still renders
   exactly as it did before this task.
6. Revert the temporary `directEdit.js` edit before committing.

- [ ] **Step 4: Verify and commit**

```bash
npm run lint
npm run check:reducers
npm run build
git status  # confirm src/utils/directEdit.js is unchanged
git add src/components/templates/PortraitShowcase.jsx
git commit -m "Wire Portrait's Skills section into Direct Edit"
```

---

### Task 4: Allowlist, e2e coverage, changes.md, version bump

**Files:**
- Modify: `src/utils/directEdit.js`
- Modify: `e2e/direct-edit.spec.js`
- Modify: `changes.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: everything wired in Tasks 1-3. `DEMO_SKILLS` and
  `selectTemplate` (already defined near the top of
  `e2e/direct-edit.spec.js`) — reuse both, do not redefine.
- Produces: nothing consumed by later work (this round's final task).

- [ ] **Step 1: Add `'portrait'` to the allowlist**

In `src/utils/directEdit.js`, change:

```js
export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional', 'editorial']
```

to:

```js
export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional', 'editorial', 'portrait']
```

- [ ] **Step 2: Add the e2e test**

In `e2e/direct-edit.spec.js`, inside the `test.describe('Direct Edit
builder', ...)` block, add a new test after the existing Editorial test,
before the closing `})` of the describe block. This combines the
proven name/skills/multi-line-description shape from the Classic
Professional and Editorial tests with the empty-contact-field placeholder
check Round 2's final review added retroactively — Portrait gets it from
the start:

```js
  // Third template added to DIRECT_EDIT_SUPPORTED_TEMPLATES after Classic
  // Professional and Editorial — Phase 2 Round 3. Combines this round's
  // own name/skills/multi-line-description checks with the empty-contact-
  // field placeholder check Round 2's final review added retroactively
  // (see e2e/direct-edit.spec.js's Editorial test) — Portrait gets it
  // from the start, since Task 1 already applies the wrapper-span fix
  // for the className/::before collision that check exists to catch.
  test('Portrait: name persists, skills render once as chips, a multi-line description survives editing, and an empty contact field shows its placeholder', async ({ page }) => {
    await selectTemplate(page, 'Portrait')

    const descriptionInput = page.getByLabel('Description', { exact: true }).first()
    await descriptionInput.fill('Seeded line A\nSeeded line B')

    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    // Name round-trips to Classic mode's form.
    const nameField = page.locator('.portrait-showcase__name .direct-edit-field')
    await nameField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Jordan Rivera')
    await nameField.blur()

    // Regression guard for the same Critical-bug class Classic
    // Professional's Round 1 final review found (every skill rendered
    // twice) — Portrait's Skills section has its own separate gating and
    // needs its own guard.
    const skillsSection = page.locator('[data-export-section="skills"]')
    await expect(skillsSection.locator('[data-export-skill="true"]')).toHaveCount(0)
    await expect(skillsSection.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length)

    // Force a dispatch against the seeded multi-line description without
    // disturbing its existing content: focus the field, jump to its true
    // end (Control+End, not the line-relative End key), and append a
    // marker.
    const firstEntry = page.locator('[data-export-section="experience"] .direct-edit-entry').first()
    const descriptionField = firstEntry.locator('.direct-edit-field').last()
    await descriptionField.click()
    await page.keyboard.press('Control+End')
    await page.keyboard.type(' X')
    await descriptionField.blur()

    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(page.getByLabel('Full name')).toHaveValue('Jordan Rivera')
    await expect(descriptionInput).toHaveValue('Seeded line A\nSeeded line B X')
  })

  // Regression guard for the exact class of bug the final whole-branch
  // review found in Round 2 (Editorial): passing `className` directly
  // into `EditableField` collides the template's own class with
  // EditableField's internal `direct-edit-field--empty` class on the
  // same element, and two ::before rules (the template's meta-item
  // separator, direct-edit.css's placeholder text) fight at equal
  // specificity. Checking the computed ::before content (not just the
  // `data-placeholder` attribute, which is always present regardless of
  // whether the CSS actually renders it) is what makes this a real
  // regression guard.
  test('Portrait: an empty contact field shows its placeholder label, not a stray separator, in Direct Edit mode', async ({ page }) => {
    await page.getByRole('button', { name: 'Reset form' }).click()
    await page.getByRole('button', { name: 'Confirm reset' }).click()

    await selectTemplate(page, 'Portrait')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const metaFields = page.locator('.portrait-showcase__meta .direct-edit-field')
    await expect(metaFields).toHaveCount(3)

    const labels = ['Location', 'Email', 'Phone']
    for (let i = 0; i < labels.length; i++) {
      const content = await metaFields.nth(i).evaluate((el) => getComputedStyle(el, '::before').content)
      expect(content).toContain(labels[i])
    }
  })
```

`Reset form` is a two-step button on the same element (first click arms
it, second click within a few seconds confirms) — `ResumeBuilderPage.jsx`
labels it exactly `'Reset form'` then `'Confirm reset'` (English locale).

- [ ] **Step 3: Verify both new tests are genuine regression guards, not false positives**

For the multi-line description test: run
`npx playwright test e2e/direct-edit.spec.js -g "Portrait: name persists"`
and confirm it passes; then temporarily remove the
`.portrait-showcase__bullets--editing` CSS rule added in Task 2, re-run
the same test, and confirm it FAILS with the two seeded lines collapsed
into one (e.g. `"Seeded line A Seeded line B X"`). Restore the CSS rule
exactly (`git diff` against `src/styles/templates/portrait.css` must be
empty once restored) and confirm the test passes again.

For the empty-contact-field test: run
`npx playwright test e2e/direct-edit.spec.js -g "Portrait: an empty contact field"`
and confirm it passes. This test should already be a valid guard given
Task 1's wrapper-span shape — there's no CSS rule to strip for this one
the way there is for the description test, since the fix here is
structural (never passing `className` into `EditableField`), not a
missing stylesheet rule. If this test does NOT pass on the first run,
stop and re-examine Task 1's Step 5 JSX rather than proceeding — it means
the wrapper-span shape wasn't applied correctly.

If either proof doesn't behave as described, stop and re-examine the
test/JSX before proceeding; do not mark this task done with a test that
can't fail when it should.

- [ ] **Step 4: Add the `changes.md` entry**

At the very top of `changes.md` (above the current top-most entry), add:

```markdown
## Direct Edit: Portrait is now editable — 2026-09-16

Portrait is the fourth template wired into Direct Edit mode (Phase 2
Round 3), with the same scope every prior round has used: identity,
About, Experience, and Skills are all inline-editable in the live
preview. LinkedIn stays read-only, matching every prior round. The
photo/monogram rail is unaffected — it's out of this round's scope.

```

(Match the exact spacing/format of the existing entries above it.)

- [ ] **Step 5: Full verification pass**

```bash
npm run lint
npm run check:reducers
npm run check:direct-edit
npm run check:share
npm run check:feedback
npm run build
npx playwright test   # FULL suite — not just the new tests
```

Every command must be clean/green. The full e2e suite must show two more
passing tests than the pre-Task-4 baseline (the name/skills/description
test AND the empty-contact-field test). One pre-existing, unrelated,
intermittently-flaky test may appear
(`'the footer never overlaps the CV preview in Direct Edit mode'`) — this
is a known issue from a prior round's own bug fix, not something this
task's changes touch; if it fails, re-run it in isolation
(`npx playwright test e2e/direct-edit.spec.js -g "footer never overlaps"`)
to confirm it passes on its own before treating anything as blocking.

- [ ] **Step 6: Bump the version and commit**

```bash
git add src/utils/directEdit.js e2e/direct-edit.spec.js
git commit -m "Add Portrait to the Direct Edit allowlist, with e2e coverage"

git add changes.md
git commit -m "Document Portrait's Direct Edit wiring in changes.md"
```

Then bump `package.json`'s version from `1.2.37` to `1.2.38`:

```bash
git add package.json
git commit -m "Bump version to 1.2.38"
```

Confirm all three commits carry only `r0uty <yasa.sheva@gmail.com>`
attribution, no AI/Claude co-authorship trailer.
