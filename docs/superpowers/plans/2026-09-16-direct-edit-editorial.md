# Direct Edit Phase 2 Round 2: Editorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Editorial template's bespoke Showcase into the Direct
Edit inline-editing system — identity (name/title/contact) + About +
Experience + Skills, the same scope Phase 1 (Minimalist) and Phase 2
Round 1 (Classic Professional) each covered — and add it to
`DIRECT_EDIT_SUPPORTED_TEMPLATES`.

**Architecture:** Same shape as Round 1. `src/components/templates/EditorialShowcase.jsx`
is a fully bespoke, hand-written component — none of Phase 1's shared
flat-renderer wiring reaches it. Each task wires one part of it directly
with `EditableField`/`EditableList`/`EditableChip` (`src/components/EditableField.jsx`,
`src/components/EditableList.jsx`), gated by a `DirectEditProvider`
wrapped locally around this one Showcase's call site in `CVPreview.jsx`
(Task 1) — not a global refactor. No new `cvFormReducer` actions anywhere.

**Tech Stack:** React 19, hand-written utility CSS (no Tailwind, no CSS
framework). Existing `@dnd-kit` for `EditableList`'s drag-to-reorder.
Playwright for e2e.

**Spec:** `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`
(Phase 2 roadmap — read this first, especially "The real shape of the
work" and "Known risk to fix proactively" sections) +
`docs/superpowers/specs/2026-09-13-direct-edit-builder-design.md`
(original Phase 1 architecture, still binding).

## Global Constraints

- No new `cvFormReducer` actions — every new call site dispatches one of
  the existing `FORM_ACTION` cases: `SET_ROOT_FIELD`, `UPDATE_ARRAY_ITEM`,
  `ADD_ARRAY_ITEM`, `REMOVE_ARRAY_ITEM`, `MOVE_ARRAY_ITEM_TO_INDEX`,
  `ADD_SKILL`, `REMOVE_SKILL`.
- Same section scope as every prior round: identity (name/title/phone/
  email/location) + About + Experience (role/company/description only —
  dates and location's own text stay read-only) + Skills. Education,
  Projects, Links, Languages, Certificates stay completely untouched and
  read-only — a deliberate, consistent boundary, not scope creep.
- `EditableField`'s `value` prop is always the RAW `formData.x` (never a
  locally-combined `snapshot.x || fallback` variable) — its own read-only
  branch already trims and falls back to `placeholder` internally. Where
  an existing local variable (e.g. `fullName`) is ALSO used somewhere
  else in the file untouched by this plan (Editorial's photo `alt` text —
  see Task 1), keep that local variable for that other use; only the
  specific JSX spot named in each task switches to the raw-value
  `EditableField`.
- `linkedinUrl` stays completely read-only in every task, exactly as it
  did for Classic Professional in Round 1 — never wrapped in an
  `EditableField`.
- **Any task that introduces a new CSS class name for an "editing state"
  variant (e.g. `<something>--editing`) MUST add the matching stylesheet
  rule in the SAME task**, including an explicit `white-space: pre-line`
  if the class replaces a bulleted `<ul>`/`<li>` layout with a plain
  editable text node. This is a hard requirement, not a suggestion — Round
  1's final whole-branch review found a Critical bug (multi-line
  Experience descriptions silently collapsing to one line in the user's
  actual saved data) caused by exactly this gap: a task invented a class
  name and no task ever styled it. Before marking any task complete that
  touches `.css`, grep the touched `.jsx` file's new/changed class names
  against the matching `.css` file and confirm each one has a rule.
- Commits carry only the repo's own git identity
  (`r0uty <yasa.sheva@gmail.com>`) — never a Claude/AI co-authorship
  trailer.
- Two gating-convention styles coexist in this codebase (unconditional
  `<EditableField>` relying on its own no-op vs. explicit
  `directEditDispatch ? <EditableField/> : (raw)` ternaries) — prefer the
  unconditional form unless the raw fallback needs a materially different
  expression (a different source array, a structurally different
  read-only render like a bulleted list). Each task below says explicitly
  which form to use and why.
- `DIRECT_EDIT_SUPPORTED_TEMPLATES` (`src/utils/directEdit.js`) gets
  exactly one new entry, `'editorial'`, added ONLY in Task 4 (last) — not
  before, so the template is never reachable in Direct Edit mode with
  half-finished wiring at any intermediate commit.
- **Testing a multi-line description regression**: if any task writes an
  e2e test for the Experience description's multi-line behavior, it MUST
  seed the multi-line value through Classic mode's own `<textarea>` (a
  real `\n` character) BEFORE switching to Direct Edit and force a
  dispatch by appending at the field's true end (`Control+End`, not the
  line-relative `End` key) — never by typing "line one, press Enter, line
  two" inside the Direct Edit field itself. Round 1 proved a
  keyboard-typed Enter inserts a real `<br>` element (via
  `execCommand('insertText', '\n')`), and `innerText` (what
  `EditableField` dispatches) always reports a `<br>` as a line break
  regardless of the element's `white-space` CSS — so a typed-Enter test
  passes whether or not the underlying CSS bug is present, providing
  false assurance. Only a description that already contains a literal
  `\n` BEFORE the field mounts (which `EditableField` seeds via a direct
  `el.textContent = text` DOM write, not `execCommand`) is subject to the
  bug this kind of test needs to catch.
- Bump `package.json`'s patch version by one as the final standalone
  commit of the round (currently `1.2.35` → `1.2.36`).
- Add a `changes.md` entry (repo root, newest entry at the top, see the
  existing entries for format) summarizing the round — every prior unit
  of Direct Edit work has one.

---

### Task 1: Identity block, contact fields, and About

**Files:**
- Modify: `src/components/CVPreview.jsx` (Editorial delegation branch,
  currently at line 398)
- Modify: `src/components/templates/EditorialShowcase.jsx`

**Interfaces:**
- Consumes: `EditableField` (default export, `src/components/EditableField.jsx`)
  — props `as`, `path` (`{kind:'root', field}` for every field this task
  touches), `value` (raw), `placeholder`, `className` (optional),
  `multiline` (boolean). `DirectEditProvider` (named export,
  `src/components/DirectEditContext.jsx`) — already imported in
  `CVPreview.jsx`.
- Produces: `EditorialShowcase` gains a `directEditDispatch = null` prop.
  Tasks 2 and 3 read this same prop from the same component signature —
  do not rename it.

- [ ] **Step 1: Wrap Editorial's call site in `CVPreview.jsx` with `DirectEditProvider` and pass `directEditDispatch`**

Find the Editorial delegation branch (currently lines 398-411):

```jsx
  if (variant === 'editorial' && !atsFriendlyMode) {
    return (
      <Suspense fallback={null}>
        <EditorialShowcase
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
  if (variant === 'editorial' && !atsFriendlyMode) {
    return (
      <DirectEditProvider isEditing={Boolean(directEditDispatch)} dispatchFormData={directEditDispatch}>
        <Suspense fallback={null}>
          <EditorialShowcase
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

`DirectEditProvider` is already imported at the top of `CVPreview.jsx`
(`import { DirectEditProvider } from './DirectEditContext'`) — no new
import needed. `directEditDispatch` is already a prop `CVPreview` itself
receives (used identically by the Classic Professional branch just above
this one) — no new prop-drilling needed at this layer.

- [ ] **Step 2: Import `EditableField` in `EditorialShowcase.jsx` and add the `directEditDispatch` prop**

At the top of `src/components/templates/EditorialShowcase.jsx`, add:

```js
import EditableField from '../EditableField'
```

Change the component signature from:

```jsx
export default function EditorialShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  headingColor = null,
  accentColor = EDITORIAL_DEFAULT_ACCENT_COLOR,
}) {
```

to:

```jsx
export default function EditorialShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  headingColor = null,
  accentColor = EDITORIAL_DEFAULT_ACCENT_COLOR,
  directEditDispatch = null,
}) {
```

- [ ] **Step 3: Wire the name and title fields**

Find (inside the `<header>`, currently):

```jsx
          <h1 className="editorial-showcase__name">{fullName}</h1>
          <p className="editorial-showcase__role">{title}</p>
```

Replace with:

```jsx
          <h1 className="editorial-showcase__name">
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'fullName' }}
              value={formData.fullName}
              placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
            />
          </h1>
          <p className="editorial-showcase__role">
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'title' }}
              value={formData.title}
              placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
            />
          </p>
```

Do **not** delete the existing `fullName`/`title` local variables

```js
  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Professional Title')
```

`title` becomes unused after this step and **should** be removed (grep
confirms its only other use was the `<p className="...role">` line just
replaced). `fullName` stays — it's also used at the photo's `alt` text
(`alt={`${fullName} profile`}`, unaffected by this plan, photo editing is
out of scope) — removing it would break that line.

- [ ] **Step 4: Wire the editable contact fields, keeping LinkedIn read-only**

Find the existing `metaItems` construction (near the top of the
component body):

```js
  const linkedinUrl = snapshot.links.linkedin
  const metaItems = [
    ['location', snapshot.location],
    ['email', snapshot.email],
    ['phone', snapshot.phone],
    ['linkedin', linkedinUrl ? formatLinkDisplayValue(linkedinUrl) : ''],
  ].filter(([, value]) => value)
```

Leave this exactly as-is (it's still what read-only/Classic mode uses
unchanged) and add a new array right after it, in the same
`location, email, phone` order, WITHOUT linkedin (linkedin is handled
separately, read-only, in Step 5):

```js
  const directEditMetaFields = [
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
  ]
```

- [ ] **Step 5: Render the contact row, switching between the two arrays**

Find:

```jsx
          {metaItems.length > 0 ? (
            <div className="editorial-showcase__meta">
              {metaItems.map(([key, value]) => (
                <span key={key} className="editorial-showcase__meta-item">{value}</span>
              ))}
            </div>
          ) : null}
```

Replace with:

```jsx
          {directEditDispatch || metaItems.length > 0 ? (
            <div className="editorial-showcase__meta">
              {(directEditDispatch ? directEditMetaFields : metaItems).map(([key, value, placeholderLabel]) => (
                directEditDispatch ? (
                  <EditableField
                    key={key}
                    as="span"
                    className="editorial-showcase__meta-item"
                    path={{ kind: 'root', field: key }}
                    value={value}
                    placeholder={placeholderLabel}
                  />
                ) : (
                  <span key={key} className="editorial-showcase__meta-item">{value}</span>
                )
              ))}
              {directEditDispatch && linkedinUrl ? (
                <span className="editorial-showcase__meta-item">{formatLinkDisplayValue(linkedinUrl)}</span>
              ) : null}
            </div>
          ) : null}
```

Read-only rendering is byte-identical to before (still driven entirely by
the untouched `metaItems`, which already includes linkedin). In Direct
Edit mode, `location`/`email`/`phone` become editable spans and linkedin
(if present) renders read-only right after them, carrying the same
`editorial-showcase__meta-item` class so the existing
`.editorial-showcase__meta-item + .editorial-showcase__meta-item::before`
separator rule (editorial.css) keeps working automatically regardless of
how many items actually render.

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
        <Section key={key} id="about" number={sectionNumber(key)} title={copy.about}>
          <p className="editorial-showcase__intro">{about}</p>
        </Section>
```

Delete the `about` local variable entirely (grep confirms it's used
nowhere else in the file) and replace the JSX with:

```jsx
        <Section key={key} id="about" number={sectionNumber(key)} title={copy.about}>
          <p className="editorial-showcase__intro">
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

`.editorial-showcase__intro` (editorial.css) already carries
`white-space: pre-line` — no CSS change needed for this step; a
multi-line About survives editing correctly as-is (unlike Experience's
bulleted description in Task 2, which needs a new rule).

- [ ] **Step 7: Manual verification**

`DIRECT_EDIT_SUPPORTED_TEMPLATES` doesn't include `'editorial'` yet
(that's Task 4), so temporarily add it locally to
`src/utils/directEdit.js` to test, then revert before committing (same
pattern every prior task in this whole rollout has used):

1. `npm run dev`, open the app, select the Editorial template.
2. Temporarily edit `DIRECT_EDIT_SUPPORTED_TEMPLATES` to include
   `'editorial'`, switch to Direct Edit mode.
3. Confirm the name, title, location, email, and phone fields are each
   directly editable in the live preview, LinkedIn is NOT editable
   (clicking it does nothing), and the About paragraph is editable and
   accepts multiple lines (Enter/Shift+Enter both work — `multiline`
   already handles this per Phase 1).
4. Edit the name, switch to Classic mode, confirm the "Full name" form
   field shows the edited value.
5. Revert the temporary `directEdit.js` edit
   (`git diff src/utils/directEdit.js` must be empty before committing).

- [ ] **Step 8: Verify and commit**

```bash
npm run lint
npm run check:reducers
npm run build
git status  # confirm src/utils/directEdit.js is unchanged
git add src/components/CVPreview.jsx src/components/templates/EditorialShowcase.jsx
git commit -m "Wire Editorial's identity block and About into Direct Edit"
```

---

### Task 2: Experience section

**Files:**
- Modify: `src/components/templates/EditorialShowcase.jsx`
- Modify: `src/styles/templates/editorial.css`

**Interfaces:**
- Consumes: `EditableField`, `directEditDispatch` prop (Task 1).
  `EditableList` (default export, `src/components/EditableList.jsx`) —
  props `section` (string), `items` (array), `addLabel` (string),
  `children` (render-prop: `(item, index) => ReactNode`).
- Produces: a module-level `renderExperienceEntry(item, index, { directEditDispatch, copy })`
  function, alongside the existing module-level `splitToBullets` helper —
  declared OUTSIDE the component, so it does not close over component
  state. Task 4's e2e test relies on this task's exact class names
  (`.direct-edit-entry`, from `EditableList`, and the description field
  being the LAST `.direct-edit-field` inside each entry).

- [ ] **Step 1: Extract `renderExperienceEntry` as a module-level function**

Add new `copy` entries (find the existing `copy` object in the component
body and add two keys — see Step 3 for the exact object). Then, above the
`EditorialShowcase` component's own `export default function` line (next
to the existing `splitToBullets` helper), add:

```jsx
function renderExperienceEntry(item, index, { directEditDispatch, copy }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <div key={`${item.role}-${item.company}-${index}`} className="editorial-showcase__entry" data-export-card="true">
      <div className="editorial-showcase__entry-row">
        <p className="editorial-showcase__entry-role">
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
        <p className="editorial-showcase__entry-dates">{dateRange || copy.datesPending}</p>
      </div>
      {directEditDispatch || item.company || item.location ? (
        <p className="editorial-showcase__entry-meta">
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
        <p className="editorial-showcase__bullets editorial-showcase__bullets--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="editorial-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
```

Note the `{item.company && item.location ? ` · ${item.location}` : item.location || null}`
line: this is the SAME expression regardless of `directEditDispatch`
(only prepends the ` · ` separator when both company and location are
present — never a leading separator for a location-only entry), so unlike
the `role`/`company`/`description` fields above it, it does not need a
ternary on `directEditDispatch` at all. This is a deliberate fix for a
real Round-1 regression (Classic Professional shipped, then had to
correct, an unconditional `` `, ${item.location}` `` that produced a
stray leading comma for company-less entries) — get it right here the
first time.

- [ ] **Step 2: Add the matching CSS rule for the editing-state bullets class — REQUIRED, not optional**

In `src/styles/templates/editorial.css`, find the existing rules:

```css
.editorial-showcase__bullets li {
  font-size: var(--tpl-body-size);
  line-height: 1.6;
  color: var(--ed-ink);
}

.editorial-showcase__bullets li::marker {
  color: var(--tpl-accent);
}
```

Immediately after the `li::marker` rule, add:

```css
.editorial-showcase__bullets--editing {
  display: block;
  padding-left: 0;
  white-space: pre-line;
  font-size: var(--tpl-body-size);
  line-height: 1.6;
  color: var(--ed-ink);
}
```

This is the exact class this task's JSX (Step 1) renders on the editing
branch's `<p>`. Without this rule, the element inherits
`.editorial-showcase__bullets`'s base styles (`padding-left: 1.1rem;
display: flex; flex-direction: column` — written for a `<ul>`) with no
`white-space` declaration, meaning a multi-line description silently
collapses to one line in the user's actual saved data the first time the
field is edited (`EditableField` dispatches via
`event.currentTarget.innerText`, which reports an embedded `\n` character
as collapsed whitespace under the default `white-space: normal`). This is
precisely the Critical bug Round 1's final review found and fixed for
Classic Professional — `white-space: pre-line` is the load-bearing
property here.

Both classes are single-class selectors on the same element (equal
specificity); since this new rule is declared textually AFTER the base
`.editorial-showcase__bullets` rule, it correctly wins on the shared
`padding-left`/`display` properties via source order.

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

(leave every other existing key in the object untouched).

- [ ] **Step 4: Route the Experience section through `EditableList`, reusing the extracted function**

Find the `'experience'` branch of `renderSection`:

```jsx
    if (key === 'experience') {
      return (
        <Section key={key} id="experience" number={sectionNumber(key)} title={copy.experience}>
          <div className="editorial-showcase__entry-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []
                const metaLine = [item.company, item.location].filter(Boolean).join(' · ')

                return (
                  <div key={`${item.role}-${item.company}-${index}`} className="editorial-showcase__entry" data-export-card="true">
                    <div className="editorial-showcase__entry-row">
                      <p className="editorial-showcase__entry-role">{item.role || copy.untitledRole}</p>
                      <p className="editorial-showcase__entry-dates">{dateRange || copy.datesPending}</p>
                    </div>
                    {metaLine ? <p className="editorial-showcase__entry-meta">{metaLine}</p> : null}
                    {bullets.length > 0 ? (
                      <ul className="editorial-showcase__bullets">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="editorial-showcase__empty">
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
        <Section key={key} id="experience" number={sectionNumber(key)} title={copy.experience}>
          <div className="editorial-showcase__entry-list">
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
              <p className="editorial-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }
```

Add the `EditableList` import at the top of the file (combine with the
`EditableField` import already added in Task 1 if that import statement
is still a single-line default import — otherwise add a new line):

```js
import EditableList from '../EditableList'
```

- [ ] **Step 5: Manual verification**

Temporarily add `'editorial'` to `DIRECT_EDIT_SUPPORTED_TEMPLATES` (same
pattern as Task 1's Step 7), then in a real browser:

1. Load the demo CV, select Editorial, switch to Direct Edit.
2. Confirm role, company, and description are each editable per
   Experience entry; dates and the entry's own location text remain
   read-only (unclickable).
3. Edit an entry's description to two lines (type, press Enter, type
   more) — confirm it visually shows as two lines while editing (this
   only proves the CSS rule renders correctly; it does NOT prove the
   `innerText`-collapse bug is fixed, since a fresh typed Enter inserts a
   `<br>` that isn't subject to the bug either way — see the Global
   Constraints note on testing this specific regression, which Task 4
   covers properly).
4. Confirm "+ Add experience" adds a new empty entry.
5. Attempt drag-reorder via the handle. If it doesn't visibly reorder in
   this environment, this is a known, previously-confirmed
   browser-automation/sandbox limitation with `@dnd-kit`'s sensors (not
   specific to this template) — do not treat it as a blocking finding;
   note it in your report instead and move on. If genuinely unsure
   whether it's the same known limitation, cross-check by attempting the
   identical interaction on Minimalist or Classic Professional (both
   already shipped, both use the exact same `EditableList` component) —
   if it fails identically there too, it's the same environment
   limitation, not a defect in this task's code.
6. Revert the temporary `directEdit.js` edit before committing.

- [ ] **Step 6: Grep-verify the CSS rule you added actually matches the class you rendered**

```bash
grep -n "editorial-showcase__bullets--editing" src/components/templates/EditorialShowcase.jsx src/styles/templates/editorial.css
```

Both files must show a match. This is the exact mechanical check that
would have caught Round 1's Critical bug — do not skip it.

- [ ] **Step 7: Verify and commit**

```bash
npm run lint
npm run check:reducers
npm run build
git status  # confirm src/utils/directEdit.js is unchanged
git add src/components/templates/EditorialShowcase.jsx src/styles/templates/editorial.css
git commit -m "Wire Editorial's Experience section into Direct Edit"
```

---

### Task 3: Skills section

**Files:**
- Modify: `src/components/templates/EditorialShowcase.jsx`

**Interfaces:**
- Consumes: `EditableChip` (named export, `src/components/EditableList.jsx`)
  — props `skills` (array), `addLabel` (string). Renders nothing when
  `!isEditing` (its own internal no-op via `useDirectEdit()`).
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
        <Section key={key} id="skills" number={sectionNumber(key)} title={copy.skills}>
          {snapshot.skills.length > 0 ? (
            <div className="editorial-showcase__tag-row">
              {snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="editorial-showcase__tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="editorial-showcase__empty">
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
        <Section key={key} id="skills" number={sectionNumber(key)} title={copy.skills}>
          {directEditDispatch ? (
            <div className="editorial-showcase__tag-row">
              <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
            </div>
          ) : snapshot.skills.length > 0 ? (
            <div className="editorial-showcase__tag-row">
              {snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="editorial-showcase__tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="editorial-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }
```

This uses a three-way mutually-exclusive ternary (editing /
populated-read-only / empty-read-only) rather than one persistent
`.tag-row` wrapper holding all three states — a deliberate choice for
THIS template: `.editorial-showcase__tag-row` carries its own
`margin-top: 0.9rem` and `.editorial-showcase__empty` carries its own
`margin-top: 0.8rem`; nesting the empty-state `<p>` inside a
persistently-rendered `.tag-row` div would stack both margins (flex-item
margins never collapse), adding an extra ~0.8rem gap above the empty
state that isn't there today. Keeping the three states as fully separate
branches (matching this file's own original structure, which already
kept the populated and empty states as separate siblings, not nested)
avoids introducing that regression. Every skill still renders exactly
once: `directEditDispatch` being truthy is the FIRST condition checked,
so the read-only branches (populated or empty) only ever evaluate when
`!directEditDispatch` — the same mutual-exclusion guarantee Round 1
established for Classic Professional, expressed as a three-way ternary
instead of two independent `directEditDispatch ? null : ...` /
`directEditDispatch ? ... : null` checks.

- [ ] **Step 3: Manual verification**

Temporarily add `'editorial'` to `DIRECT_EDIT_SUPPORTED_TEMPLATES` (same
pattern as prior tasks):

1. Load the demo CV, select Editorial, switch to Direct Edit.
2. Confirm the Skills section shows each demo skill exactly once, as a
   removable chip (click the × on one, confirm it's removed and doesn't
   reappear).
3. Confirm zero plain `data-export-skill="true"` tags exist in the DOM
   while editing (open devtools, or just visually confirm no
   non-removable-looking tags sit alongside the chips).
4. Click "+ Add", confirm a new "New skill N" chip appears.
5. Switch to Classic mode, confirm the Skills section still renders
   exactly as it did before this task (plain tags, no chips, no
   duplicates).
6. Revert the temporary `directEdit.js` edit before committing.

- [ ] **Step 4: Verify and commit**

```bash
npm run lint
npm run check:reducers
npm run build
git status  # confirm src/utils/directEdit.js is unchanged
git add src/components/templates/EditorialShowcase.jsx
git commit -m "Wire Editorial's Skills section into Direct Edit"
```

---

### Task 4: Allowlist, e2e coverage, changes.md, version bump

**Files:**
- Modify: `src/utils/directEdit.js`
- Modify: `e2e/direct-edit.spec.js`
- Modify: `changes.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: everything wired in Tasks 1-3. `DEMO_SKILLS` (already defined
  at the top of `e2e/direct-edit.spec.js`) and `selectTemplate` (already
  defined in the same file) — reuse both, do not redefine.
- Produces: nothing consumed by later work (this is the round's final
  task).

- [ ] **Step 1: Add `'editorial'` to the allowlist**

In `src/utils/directEdit.js`, change:

```js
export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional']
```

to:

```js
export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional', 'editorial']
```

- [ ] **Step 2: Add the e2e test**

In `e2e/direct-edit.spec.js`, inside the `test.describe('Direct Edit
builder', ...)` block, add a new test (placed after the existing Classic
Professional test, before the closing `})` of the describe block):

```js
  // Second template added to DIRECT_EDIT_SUPPORTED_TEMPLATES after Classic
  // Professional — Phase 2 Round 2. Mirrors that round's final test shape:
  // a name round-trip, a Skills-dedup guard (Editorial has its own
  // separate gating in EditorialShowcase.jsx, needs its own guard), and a
  // multi-line-description regression guard seeded through Classic mode's
  // own textarea — NOT typed via Enter in the Direct Edit field itself
  // (see this plan's Global Constraints for why that doesn't work as a
  // test).
  test('Editorial: name persists, skills render once as chips, and a multi-line description survives editing', async ({ page }) => {
    await selectTemplate(page, 'Editorial')

    const descriptionInput = page.getByLabel('Description', { exact: true }).first()
    await descriptionInput.fill('Seeded line A\nSeeded line B')

    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    // Name round-trips to Classic mode's form.
    const nameField = page.locator('.editorial-showcase__name .direct-edit-field')
    await nameField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Jordan Rivera')
    await nameField.blur()

    // Regression guard for the same Critical-bug class Classic
    // Professional's Round 1 final review found (every skill rendered
    // twice) — Editorial's Skills section has its own separate gating and
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
```

- [ ] **Step 3: Verify the new test is a genuine regression guard, not a false positive**

This step is required, not optional — Round 1's fix-wave implementer
found the hard way that a test which LOOKS like it covers the CSS
collapse bug can still pass regardless of whether the bug is present.

1. Run the new test alone: `npx playwright test e2e/direct-edit.spec.js -g "Editorial"` — confirm it passes.
2. Temporarily remove the `.editorial-showcase__bullets--editing` CSS
   rule added in Task 2 (comment it out or delete it).
3. Re-run the same test — it MUST fail, with a value-mismatch on the
   final `descriptionInput` assertion showing the two seeded lines
   collapsed into one (e.g. `"Seeded line A Seeded line B X"` instead of
   `"Seeded line A\nSeeded line B X"`).
4. Restore the CSS rule exactly as Task 2 left it (`git diff` against
   `src/styles/templates/editorial.css` must be empty once restored).
5. Re-run the test once more — confirm it passes again.

If step 3 does NOT fail, the test is not actually exercising the bug —
stop and re-examine the test's selectors/sequencing against Task 2's
actual JSX before proceeding; do not mark this task done with a test that
can't fail.

- [ ] **Step 4: Add the `changes.md` entry**

At the very top of `changes.md` (above the current top-most entry), add:

```markdown
## Direct Edit: Editorial is now editable — 2026-09-16

Editorial is the third template wired into Direct Edit mode (Phase 2
Round 2), with the same scope every prior round has used: identity,
About, Experience, and Skills are all inline-editable in the live
preview. LinkedIn stays read-only, matching every prior round.

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
npx playwright test   # FULL suite — not just the new test
```

Every command must be clean/green. The full e2e suite must show one more
passing test than the pre-Task-4 baseline.

- [ ] **Step 6: Bump the version and commit**

```bash
git add src/utils/directEdit.js e2e/direct-edit.spec.js
git commit -m "Add Editorial to the Direct Edit allowlist, with e2e coverage"

git add changes.md
git commit -m "Document Editorial's Direct Edit wiring in changes.md"
```

Then bump `package.json`'s version from `1.2.35` to `1.2.36`:

```bash
git add package.json
git commit -m "Bump version to 1.2.36"
```

Confirm all three commits carry only `r0uty <yasa.sheva@gmail.com>`
attribution, no AI/Claude co-authorship trailer.
