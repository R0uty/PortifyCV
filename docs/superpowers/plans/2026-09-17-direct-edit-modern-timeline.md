# Direct Edit Phase 2 Round 4: Modern Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Modern Timeline template's bespoke Showcase into the
Direct Edit inline-editing system (Tasks 1-4) — identity + About +
Experience + Skills, the same scope every prior round has covered — AND
extract the near-identical `renderExperienceEntry` pattern and e2e
smoke-test shape that now exist four times across templates into shared
code (Tasks 5-6), per the ruling recorded at the end of Round 3.

**Architecture:** Same local-`DirectEditProvider`-wrap shape as Rounds
1-3 for Tasks 1-4. **Modern Timeline is structurally the most different
template wired so far** — its Experience/Education entries render inside
a `TimelineRow` wrapper (date as an external prop, a connecting-line
rail, no inline `entry-row` div), its name splits into two visually
distinct spans (`{nameFirst}<span accent>{nameRest}</span>`), and it's
the only bespoke Showcase that does **not** bypass itself in ATS mode
(`CVPreview.jsx`'s `variant === 'timeline'` branch has no `&&
!atsFriendlyMode` guard, unlike every other bespoke Showcase). None of
these differences block wiring it — they just mean Tasks 1-2 need their
own careful handling rather than a mechanical copy of Round 3's Portrait
plan.

**Tech Stack:** React 19, hand-written utility CSS. Existing `@dnd-kit`
for `EditableList`'s drag-to-reorder. Playwright for e2e.

**Spec:** `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`
(Phase 2 roadmap) + `docs/superpowers/specs/2026-09-13-direct-edit-builder-design.md`
(original Phase 1 architecture, still binding).

## Why this round also extracts shared code (read before Task 5)

Round 3's final whole-branch review normalized (prefix-substituted) and
diffed Classic Professional's, Editorial's, and Portrait's
`renderExperienceEntry` functions against each other and found them
**character-identical** apart from a CSS class prefix and — it turned
out, verified again while writing THIS plan by reading all three files
directly — the company/location separator glyph (Editorial and Portrait
both use `' · '`; Classic Professional actually uses `', '`, expressed in
a differently-shaped but behaviorally-identical JSX snippet). That
review recommended extracting a shared helper in this round rather than
deferring a fourth time, since three data points is now enough evidence.

**Writing this round's own Task 2 revealed that recommendation was only
half right.** Modern Timeline's Experience entries do **not** share the
other three templates' shape at all — they render inside a `TimelineRow`
component with the date passed as an external prop and a rail/marker/line
for the vertical-timeline visual, not a plain `<div className="…__entry">`
with an inline `entry-row` flex header. Forcing Modern Timeline into the
same shared function would mean either bending the abstraction around a
structural difference it was never designed for, or adding a "wrapper"
parameter that only one of four call sites would ever use.

**Ruling for this round:** extract the shared helper for the three
templates that genuinely share one shape (Classic Professional, Editorial,
Portrait — Task 5), and let Modern Timeline keep its own
`renderExperienceEntry` local to `TimelineShowcase.jsx` (Task 2), exactly
as every prior round did. This is not "deferring again" — it's extracting
now, for the actual proven-identical subset, rather than guessing a wider
abstraction into existence for a fourth template that doesn't fit it. The
e2e smoke-test shape (Task 6) genuinely does generalize across all four
templates without this complication (it only needs a class prefix and a
contact-row class suffix, both cheap to parameterize), so that extraction
covers all four.

## Global Constraints

- No new `cvFormReducer` actions — every new call site dispatches one of
  the existing `FORM_ACTION` cases: `SET_ROOT_FIELD`, `UPDATE_ARRAY_ITEM`,
  `ADD_ARRAY_ITEM`, `REMOVE_ARRAY_ITEM`, `MOVE_ARRAY_ITEM_TO_INDEX`,
  `ADD_SKILL`, `REMOVE_SKILL`.
- Same section scope as every prior round: identity (name/title/phone/
  email/location) + About + Experience (role/company/description only —
  dates stay read-only) + Skills. Education, Projects, Links, Languages,
  Certificates stay completely untouched and read-only. Modern Timeline's
  `linkContactItems` (linkedin/website/github) are link-type contact info,
  same category as every prior round's read-only LinkedIn — they stay
  completely untouched and read-only too; only `personalContactItems`
  (phone/email/location) become editable.
- `EditableField`'s `value` prop is always the RAW `formData.x`. Where an
  existing local variable is ALSO used elsewhere in the file untouched by
  this plan, keep it; only the specific JSX spot named in each task
  switches to the raw-value `EditableField`. Modern Timeline's `fullName`
  has TWO other uses beyond the `<h1>` this plan touches: the photo `alt`
  text, and the `nameFirst`/`nameRest` split that still drives the
  READ-ONLY branch of Task 1's name ternary (see Task 1 — this is a
  ternary, not an unconditional `EditableField`, specifically because the
  read-only rendering has a materially different visual treatment
  `EditableField` can't reproduce on its own).
- `linkContactItems`, and `linkedinUrl`/equivalent in every other
  template, stay completely read-only — never wrapped in `EditableField`.
- **Never pass `className` directly into `EditableField`.** Always wrap
  it in a plain `<span>` and put the template class on that wrapper
  instead — see Round 2's `::before`-collision bug for why.
- **Any task that introduces a new CSS class name for an "editing state"
  variant MUST add the matching stylesheet rule in the SAME task**,
  including `white-space: pre-line` where a bulleted `<ul>`/`<li>` layout
  is replaced by a plain editable text node. Grep the touched `.jsx`
  file's new class names against the matching `.css` file before marking
  the task complete.
- Commits carry only the repo's own git identity
  (`r0uty <yasa.sheva@gmail.com>`) — never a Claude/AI co-authorship
  trailer.
- `DIRECT_EDIT_SUPPORTED_TEMPLATES` (`src/utils/directEdit.js`) gets
  exactly one new entry, `'timeline'`, added in Task 4 — after Tasks 1-3
  have wired the template but before Tasks 5-6's extraction work, which
  only touches already-shipped code and carries no half-finished-wiring
  risk.
- **Testing a multi-line description regression**: seed the multi-line
  value through Classic mode's own `<textarea>` (a real `\n` character)
  BEFORE switching to Direct Edit, then force a dispatch via
  `Control+End` — never by typing "line one, press Enter, line two"
  inside the Direct Edit field itself (a typed Enter inserts a real
  `<br>`, and `innerText` — what `EditableField` dispatches on — always
  reports a `<br>` as a line break regardless of `white-space` CSS).
- **Testing an empty-field placeholder**: check the RENDERED `::before`
  content (`getComputedStyle(el, '::before').content`), never just the
  `data-placeholder` attribute's presence, which is always set on the
  element regardless of whether the CSS actually renders it.
- Bump `package.json`'s patch version by one, ONCE, as the final
  standalone commit of the WHOLE round (Task 6, not Task 4) — currently
  `1.2.38` → `1.2.39`.
- Add ONE `changes.md` entry (Task 6, covering both the Modern Timeline
  wiring and the extraction) — every prior unit of Direct Edit work has
  one; this round gets one entry, not two, since both halves ship
  together.

---

## Part A — Wire Modern Timeline

### Task 1: Identity block, contact fields, and About

**Files:**
- Modify: `src/components/CVPreview.jsx` (Modern Timeline delegation
  branch, currently at line 183 — note this branch has NO
  `&& !atsFriendlyMode` guard, unlike every other bespoke Showcase; leave
  that as-is, just add the `DirectEditProvider` wrap around the whole
  existing branch)
- Modify: `src/components/templates/TimelineShowcase.jsx`

**Interfaces:**
- Consumes: `EditableField` (default export,
  `src/components/EditableField.jsx`) — props `as`, `path`, `value`
  (raw), `placeholder`, `multiline`. Never pass `className` into it.
  `DirectEditProvider` (named export, `src/components/DirectEditContext.jsx`)
  — already imported in `CVPreview.jsx`.
- Produces: `TimelineShowcase` gains a `directEditDispatch = null` prop.
  Tasks 2 and 3 read this same prop from the same component signature —
  do not rename it.

- [ ] **Step 1: Wrap Modern Timeline's call site in `CVPreview.jsx` with `DirectEditProvider` and pass `directEditDispatch`**

Find the Modern Timeline delegation branch (currently lines 183-198):

```jsx
  if (variant === 'timeline') {
    return (
      <Suspense fallback={null}>
        <TimelineShowcase
          formData={formData}
          locale={locale}
          previewRef={previewRef}
          templateConfig={templateConfig}
          showcaseConfig={t}
          accentColor={accentColor}
          atsFriendlyMode={atsFriendlyMode}
          headingColor={headingColor}
        />
      </Suspense>
    )
  }
```

Replace with:

```jsx
  if (variant === 'timeline') {
    return (
      <DirectEditProvider isEditing={Boolean(directEditDispatch)} dispatchFormData={directEditDispatch}>
        <Suspense fallback={null}>
          <TimelineShowcase
            formData={formData}
            locale={locale}
            previewRef={previewRef}
            templateConfig={templateConfig}
            showcaseConfig={t}
            accentColor={accentColor}
            atsFriendlyMode={atsFriendlyMode}
            headingColor={headingColor}
            directEditDispatch={directEditDispatch}
          />
        </Suspense>
      </DirectEditProvider>
    )
  }
```

This branch has no `!atsFriendlyMode` guard because Modern Timeline
renders in both designer and ATS modes from the same component — that's
fine and needs no special handling here: Direct Edit mode always forces
`atsFriendlyMode={false}` (via `ResumeBuilderPage.jsx`'s
`effectiveAtsFriendlyMode`, unchanged by this plan), so `directEditDispatch`
is only ever truthy when `atsFriendlyMode` is already false in practice.
`DirectEditProvider` is already imported at the top of `CVPreview.jsx` —
no new import needed.

- [ ] **Step 2: Import `EditableField` in `TimelineShowcase.jsx` and add the `directEditDispatch` prop**

At the top of `src/components/templates/TimelineShowcase.jsx`, add:

```js
import EditableField from '../EditableField'
```

Change the component signature from:

```jsx
export default function TimelineShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  accentColor = TIMELINE_DEFAULT_ACCENT_COLOR,
  atsFriendlyMode = false,
  headingColor = null,
}) {
```

to:

```jsx
export default function TimelineShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  accentColor = TIMELINE_DEFAULT_ACCENT_COLOR,
  atsFriendlyMode = false,
  headingColor = null,
  directEditDispatch = null,
}) {
```

- [ ] **Step 3: Wire the name field — a ternary, not an unconditional `EditableField`**

Find (inside the `<header>`, currently):

```jsx
          <h1 className="timeline-showcase__name">
            {nameFirst}<span className="timeline-showcase__name-accent">{nameRest}</span>
          </h1>
```

Replace with:

```jsx
          <h1 className="timeline-showcase__name">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            ) : (
              <>{nameFirst}<span className="timeline-showcase__name-accent">{nameRest}</span></>
            )}
          </h1>
```

This is a ternary rather than the unconditional `<EditableField>` form
most fields in this rollout use, because the read-only rendering here has
a materially different visual treatment (the name split into a plain
span plus an accent-colored span at the first space) that `EditableField`'s
own internal read-only branch can't reproduce — it only ever renders one
plain text node. While editing, the name shows as one plain (unsplit,
unaccented) editable field; the accent-split treatment returns once
editing ends. Do **not** delete `fullName`, `nameFirst`, or `nameRest` —
`fullName` is also used for the photo's `alt` text (unaffected by this
plan) and `nameFirst`/`nameRest` (both derived from `fullName`) are what
the read-only branch above still needs.

- [ ] **Step 4: Wire the title field**

Find:

```jsx
          <p className="timeline-showcase__role">{title}</p>
```

Replace with:

```jsx
          <p className="timeline-showcase__role">
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'title' }}
              value={formData.title}
              placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
            />
          </p>
```

Delete the now-unused `title` local variable (grep confirms its only
other use was this line):

```js
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Professional Title')
```

- [ ] **Step 5: Wire the editable personal-contact fields (phone/email/location) — `EditableField` wrapped in a `<span>`, never given `className` directly**

Find the existing `personalContactItems` construction:

```js
  const personalContactItems = [
    ['phone', snapshot.phone],
    ['email', snapshot.email],
    ['location', snapshot.location],
  ].filter(([, value]) => value)
```

Leave this exactly as-is (still what read-only/Classic mode uses) and add
a new array right after it, same `phone, email, location` order:

```js
  const directEditPersonalFields = [
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
  ]
```

Do **not** touch `linkContactItems` (the linkedin/website/github array
right after it) — it stays completely untouched, always read-only, for
the rest of this plan.

Find the personal-contact row JSX:

```jsx
          {personalContactItems.length > 0 ? (
            <div className="timeline-showcase__contact">
              {personalContactItems.map(([key, value]) => (
                <span key={key} className="timeline-showcase__contact-item">
                  <span className="timeline-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {value}
                </span>
              ))}
            </div>
          ) : null}
```

Replace with:

```jsx
          {directEditDispatch || personalContactItems.length > 0 ? (
            <div className="timeline-showcase__contact">
              {(directEditDispatch ? directEditPersonalFields : personalContactItems).map(([key, value, placeholderLabel]) => (
                <span key={key} className="timeline-showcase__contact-item">
                  <span className="timeline-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {directEditDispatch ? (
                    <EditableField
                      as="span"
                      path={{ kind: 'root', field: key }}
                      value={value}
                      placeholder={placeholderLabel}
                    />
                  ) : (
                    value
                  )}
                </span>
              ))}
            </div>
          ) : null}
```

`EditableField` here receives NO `className` — the wrapper `<span>`
carries `timeline-showcase__contact-item`, and there's no `::before`
separator rule on this class in `timeline.css` at all (contact items are
spaced with a flex `gap`, not a separator glyph), so there's no collision
risk here regardless — the wrapper-span shape is still followed for
consistency with the hardened Global Constraint, not because this
specific template needs it to avoid a bug. The immediately-following
`linkContactItems` block (linkedin/website/github) is untouched — leave
it exactly as it is.

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
        <Section key={key} id="about" icon="about" title={copy.profile}>
          <p className="timeline-showcase__summary">{about}</p>
        </Section>
```

Delete the `about` local variable entirely (grep confirms it's used
nowhere else) and replace the JSX with:

```jsx
        <Section key={key} id="about" icon="about" title={copy.profile}>
          <p className="timeline-showcase__summary">
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

`.timeline-showcase__summary` (timeline.css) already carries
`white-space: pre-line` — no CSS change needed for this step.

- [ ] **Step 7: Manual verification**

`DIRECT_EDIT_SUPPORTED_TEMPLATES` doesn't include `'timeline'` yet
(that's Task 4), so temporarily add it locally to
`src/utils/directEdit.js` to test, then revert before committing:

1. `npm run dev`, open the app, select the Modern Timeline template.
2. Temporarily edit `DIRECT_EDIT_SUPPORTED_TEMPLATES` to include
   `'timeline'`, switch to Direct Edit mode.
3. Confirm the name field is editable (shows as plain text while
   editing, no accent split), and that the accent-split styling returns
   once you click away / blur.
4. Confirm title, phone, email, location are each directly editable;
   confirm linkedin/website/github (whichever the demo CV has) are NOT
   editable (clicking them does nothing).
5. Confirm About is editable and accepts multiple lines.
6. **Reset the form to empty** (Reset form → Confirm reset), confirm
   phone/email/location each show their placeholder label correctly
   while empty in Direct Edit mode (visually — the automated check for
   this arrives in Task 6, but a quick look now costs nothing and this
   template's contact row uses the same icon+wrapper-span shape as
   Classic Professional's, which has never had this bug).
7. Reload demo CV, edit the name, switch to Classic mode, confirm the
   "Full name" form field shows the edited value.
8. Confirm the ATS-friendly toggle still works correctly in Classic mode
   (unaffected by this task, but this is the one template where
   `atsFriendlyMode` and this Showcase's own rendering logic interact
   directly — worth a quick sanity check given Step 1's note above).
9. Revert the temporary `directEdit.js` edit
   (`git diff src/utils/directEdit.js` must be empty before committing).

- [ ] **Step 8: Verify and commit**

```bash
npm run lint
npm run check:reducers
npm run build
git status  # confirm src/utils/directEdit.js is unchanged
git add src/components/CVPreview.jsx src/components/templates/TimelineShowcase.jsx
git commit -m "Wire Modern Timeline's identity block and About into Direct Edit"
```

---

### Task 2: Experience section

**Files:**
- Modify: `src/components/templates/TimelineShowcase.jsx`
- Modify: `src/styles/templates/timeline.css`

**Interfaces:**
- Consumes: `EditableField`, `directEditDispatch` prop (Task 1).
  `EditableList` (default export, `src/components/EditableList.jsx`).
  The existing `TimelineRow` component (defined earlier in this same
  file) — unchanged, still takes `date`/`isLast`/`children` props.
- Produces: a module-level `renderExperienceEntry(item, index, { directEditDispatch, copy, isLast })`
  function local to THIS file — deliberately NOT shared with the module
  Task 5 creates (see this plan's "Why this round also extracts shared
  code" section — Modern Timeline's `TimelineRow`-wrapped shape is
  genuinely different from the other three templates').

- [ ] **Step 1: Add a module-level `renderExperienceEntry` function**

Above the `TimelineShowcase` component's own `export default function`
line (after the existing `TimelineRow` component), add:

```jsx
function renderExperienceEntry(item, index, { directEditDispatch, copy, isLast }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <TimelineRow
      key={`${item.role}-${item.company}-${index}`}
      date={dateRange || copy.datesPending}
      isLast={isLast}
    >
      <p className="timeline-showcase__entry-role">
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
      {directEditDispatch || item.company || item.location ? (
        <p className="timeline-showcase__entry-meta">
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
        <p className="timeline-showcase__bullets timeline-showcase__bullets--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="timeline-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
    </TimelineRow>
  )
}
```

Note `date` is passed to `TimelineRow` as a prop — read-only and
untouched by editing, exactly like every prior round's date handling,
just structurally external here rather than inline. `isLast` is also a
caller-supplied parameter (Step 3 computes it) rather than something this
function derives itself, since the correct "is this the last row"
depends on which array (raw `formData.experience` while editing, filtered
`snapshot.experience` otherwise) the caller is iterating — this function
doesn't know which one it's being called from.

- [ ] **Step 2: Add the matching CSS rule for the editing-state bullets class — REQUIRED, not optional**

In `src/styles/templates/timeline.css`, find the existing rules:

```css
.timeline-showcase__bullets li {
  font-size: var(--tpl-body-size);
  line-height: 1.6;
  color: var(--tl-text);
}

.timeline-showcase__bullets li::marker {
  color: var(--tpl-accent);
}
```

Immediately after the `li::marker` rule, add:

```css
.timeline-showcase__bullets--editing {
  display: block;
  padding-left: 0;
  white-space: pre-line;
  font-size: var(--tpl-body-size);
  line-height: 1.6;
  color: var(--tl-text);
}
```

`white-space: pre-line` is load-bearing — see this plan's Global
Constraints for why.

- [ ] **Step 3: Add the two new `copy` entries**

Find the `copy` object in the component body:

```js
  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    profile: isFinnish ? 'Profiili' : 'Profile',
```

Add two keys right after `datesPending`:

```js
  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
    profile: isFinnish ? 'Profiili' : 'Profile',
```

(leave every other existing key untouched).

- [ ] **Step 4: Route the Experience section through `EditableList`, computing `isLast` per branch**

Find the `'experience'` branch of `renderSection`:

```jsx
    if (key === 'experience') {
      return (
        <Section key={key} id="experience" icon="experience" title={copy.experience}>
          <div className="timeline-showcase__timeline">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []
                const metaLine = [item.company, item.location].filter(Boolean).join(' · ')

                return (
                  <TimelineRow
                    key={`${item.role}-${item.company}-${index}`}
                    date={dateRange || copy.datesPending}
                    isLast={index === snapshot.experience.length - 1}
                  >
                    <p className="timeline-showcase__entry-role">{item.role || copy.untitledRole}</p>
                    {metaLine ? <p className="timeline-showcase__entry-meta">{metaLine}</p> : null}
                    {bullets.length > 0 ? (
                      <ul className="timeline-showcase__bullets">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </TimelineRow>
                )
              })
            ) : (
              <p className="timeline-showcase__empty">
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
        <Section key={key} id="experience" icon="experience" title={copy.experience}>
          <div className="timeline-showcase__timeline">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
              >
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  isLast: index === formData.experience.length - 1,
                })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, {
                directEditDispatch,
                copy,
                isLast: index === snapshot.experience.length - 1,
              }))
            ) : (
              <p className="timeline-showcase__empty">
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

Temporarily add `'timeline'` to `DIRECT_EDIT_SUPPORTED_TEMPLATES`:

1. Load the demo CV, select Modern Timeline, switch to Direct Edit.
2. Confirm role, company, and description are each editable per
   Experience entry; the date (in its own left column) and the
   connecting rail/line stay visually intact and read-only.
3. Confirm "+ Add experience" adds a new empty entry and the timeline's
   connecting line correctly stops being drawn after the new last entry
   (i.e. `isLast` recomputes correctly).
4. Attempt drag-reorder via the handle. This environment has shown
   inconsistent results for `@dnd-kit` drag interactions across
   sessions — if it doesn't visibly reorder, cross-check by attempting
   the identical interaction on an already-shipped template; note
   whatever you find in your report either way, don't treat it alone as
   blocking.
5. Revert the temporary `directEdit.js` edit before committing.

- [ ] **Step 6: Grep-verify the CSS rule you added actually matches the class you rendered**

```bash
grep -n "timeline-showcase__bullets--editing" src/components/templates/TimelineShowcase.jsx src/styles/templates/timeline.css
```

Both files must show a match.

- [ ] **Step 7: Verify and commit**

```bash
npm run lint
npm run check:reducers
npm run build
git status  # confirm src/utils/directEdit.js is unchanged
git add src/components/templates/TimelineShowcase.jsx src/styles/templates/timeline.css
git commit -m "Wire Modern Timeline's Experience section into Direct Edit"
```

---

### Task 3: Skills section

**Files:**
- Modify: `src/components/templates/TimelineShowcase.jsx`

**Interfaces:**
- Consumes: `EditableChip` (named export, `src/components/EditableList.jsx`).
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
        <Section key={key} id="skills" icon="skills" title={copy.skills}>
          <div className="timeline-showcase__tag-row">
            {snapshot.skills.length > 0 ? (
              snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="timeline-showcase__tag">{skill}</span>
              ))
            ) : (
              <p className="timeline-showcase__empty">
                {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }
```

Replace with:

```jsx
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" icon="skills" title={copy.skills}>
          {/* Three-way ternary rather than one persistent .tag-row wrapper:
              .tag-row's own margin-top (1rem) would stack with .empty's
              margin-top (0.8rem) if the empty state were nested inside it —
              flex-item margins don't collapse — adding an unwanted extra
              gap. Keeping the three states as fully separate branches
              avoids that regression while still guaranteeing mutual
              exclusion (a single chained ternary can only ever select one
              branch), same pattern Round 2/3 used for Editorial/Portrait. */}
          {directEditDispatch ? (
            <div className="timeline-showcase__tag-row">
              <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
            </div>
          ) : snapshot.skills.length > 0 ? (
            <div className="timeline-showcase__tag-row">
              {snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="timeline-showcase__tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="timeline-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }
```

Note this round's plan includes the rationale comment directly in the
code from the start — Round 3's final review flagged Portrait's copy of
this same pattern for missing it (a parked Minor, not yet fixed).

- [ ] **Step 3: Manual verification**

Temporarily add `'timeline'` to `DIRECT_EDIT_SUPPORTED_TEMPLATES`:

1. Load the demo CV, select Modern Timeline, switch to Direct Edit.
2. Confirm the Skills section shows each demo skill exactly once, as a
   removable chip; click the × on one, confirm it's removed.
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
git add src/components/templates/TimelineShowcase.jsx
git commit -m "Wire Modern Timeline's Skills section into Direct Edit"
```

---

### Task 4: Allowlist and manual end-to-end verification

**Files:**
- Modify: `src/utils/directEdit.js`

**Interfaces:**
- Consumes: everything wired in Tasks 1-3.
- Produces: Modern Timeline becomes reachable in Direct Edit mode for
  real users for the first time. Tasks 5-6 (below) only touch
  already-shipped code after this point — no more "half-finished wiring"
  risk from here on.

Unlike every prior round, this task does **not** add the round's e2e
coverage or `changes.md` entry or version bump — those all move to Task 6,
after the extraction work, so the whole round gets one coherent set of
each rather than throwaway per-template versions written now and
replaced later. This task is deliberately small: flip the allowlist,
verify manually that the real (non-temporary) allowlist entry works
end-to-end, commit.

- [ ] **Step 1: Add `'timeline'` to the allowlist**

In `src/utils/directEdit.js`, change:

```js
export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional', 'editorial', 'portrait']
```

to:

```js
export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional', 'editorial', 'portrait', 'timeline']
```

- [ ] **Step 2: Manual end-to-end verification against the real allowlist entry**

No temporary edit-and-revert this time — this IS the real change:

1. `npm run dev`, load the demo CV, select Modern Timeline from the
   template gallery, switch to Direct Edit mode (no manual allowlist
   edit needed now).
2. Edit the name, title, phone, email, location, About, an experience
   entry's role/company/description, and the skills list. Confirm every
   edit round-trips correctly to Classic mode's form.
3. Confirm LinkedIn/website/github (whichever the demo CV has) stayed
   read-only throughout.
4. Switch to an unsupported template (e.g. Executive) and back to Modern
   Timeline — confirm the read-only notice appears for the unsupported
   template and Modern Timeline's edits survive the round-trip.

- [ ] **Step 3: Verify and commit**

```bash
npm run lint
npm run check:reducers
npm run check:direct-edit
npm run build
git add src/utils/directEdit.js
git commit -m "Add Modern Timeline to the Direct Edit allowlist"
```

---

## Part B — Extract the shared pattern across all four wired templates

### Task 5: Extract `renderExperienceEntry` into a shared module for the three identical-shape templates

**Files:**
- Create: `src/components/templates/directEditExperienceEntry.jsx`
- Modify: `src/components/templates/ClassicProfessionalShowcase.jsx`
- Modify: `src/components/templates/EditorialShowcase.jsx`
- Modify: `src/components/templates/PortraitShowcase.jsx`

**Interfaces:**
- Consumes: `EditableField` (`../EditableField`), `formatDateRange`
  (`./shared`) — both already used identically by all three templates
  being migrated.
- Produces: `renderExperienceEntry(item, index, { directEditDispatch, copy, classPrefix, separator })`
  (named export). `classPrefix` is required (e.g. `'classic-professional-showcase'`).
  `separator` defaults to `' · '` (Editorial's and Portrait's glyph);
  Classic Professional's call site passes `separator: ', '` explicitly,
  since that template's original (pre-Direct-Edit) separator was a comma,
  not a middle dot — confirmed by reading its current file directly
  before writing this task, not assumed from the other two.

This task does **not** touch `TimelineShowcase.jsx` — Modern Timeline's
own `renderExperienceEntry` (Task 2) stays local to that file, per this
plan's "Why this round also extracts shared code" section above.

- [ ] **Step 1: Create the shared module**

Create `src/components/templates/directEditExperienceEntry.jsx`:

```jsx
// Shared Experience-entry renderer for the oneColumn-family templates
// whose entry markup is identical apart from a CSS class prefix and the
// company/location separator glyph: Classic Professional, Editorial,
// Portrait. Confirmed identical (down to the exact conditional shapes,
// not just the visible output) by directly comparing all three files
// before this module was written — see the Direct Edit Phase 2 roadmap
// and the Round 4 plan for the full reasoning.
//
// Modern Timeline (Phase 2 Round 4) does NOT use this — its entries
// render inside a `TimelineRow` wrapper with the date as an external
// prop, a genuinely different DOM shape discovered while wiring that
// round. See `TimelineShowcase.jsx`'s own local `renderExperienceEntry`
// instead. Any future template whose entry shape doesn't match the one
// below should do the same — get its own local copy, not a forced fit
// into this one.

import EditableField from '../EditableField'
import { formatDateRange } from './shared'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

// `index` is always formData.experience-relative (only ever read inside
// directEditDispatch-gated branches below) — never assume it lines up with
// snapshot.experience's own (filtered) indices in the read-only call site.
export function renderExperienceEntry(item, index, { directEditDispatch, copy, classPrefix, separator = ' · ' }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <div key={`${item.role}-${item.company}-${index}`} className={`${classPrefix}__entry`} data-export-card="true">
      <div className={`${classPrefix}__entry-row`}>
        <p className={`${classPrefix}__entry-role`}>
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
        <p className={`${classPrefix}__entry-dates`}>{dateRange || copy.datesPending}</p>
      </div>
      {directEditDispatch || item.company || item.location ? (
        <p className={`${classPrefix}__entry-meta`}>
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
          {item.company && item.location ? `${separator}${item.location}` : item.location || null}
        </p>
      ) : null}
      {directEditDispatch ? (
        <p className={`${classPrefix}__bullets ${classPrefix}__bullets--editing`}>
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className={`${classPrefix}__bullets`}>
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 2: Migrate `ClassicProfessionalShowcase.jsx`**

Delete the local `splitToBullets` and `renderExperienceEntry` functions
(currently lines 33-95 — the `function splitToBullets(text) {...}` block
through the closing `}` of `renderExperienceEntry`, including the
`index`-relative comment above it, which now lives in the shared module
instead).

Add an import (alongside the existing `EditableField`/`EditableList`
imports near the top):

```js
import { renderExperienceEntry } from './directEditExperienceEntry'
```

In the `'experience'` branch of `renderSection`, change both call sites
from:

```jsx
                {(item, index) => renderExperienceEntry(item, index, { directEditDispatch, copy })}
```

and:

```jsx
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, { directEditDispatch, copy }))
```

to:

```jsx
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  classPrefix: 'classic-professional-showcase',
                  separator: ', ',
                })}
```

and:

```jsx
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, {
                directEditDispatch,
                copy,
                classPrefix: 'classic-professional-showcase',
                separator: ', ',
              }))
```

Keep the `EditableField` import (still used elsewhere in this file for
name/title/about/contact fields) — do not remove it.

- [ ] **Step 3: Migrate `EditorialShowcase.jsx`**

Same shape as Step 2: delete the local `splitToBullets` and
`renderExperienceEntry` functions (including the `index`-relative
comment above the latter — already present in this file from Round 2's
own fix wave, now redundant here since it lives in the shared module).

Add the import:

```js
import { renderExperienceEntry } from './directEditExperienceEntry'
```

Change both call sites the same way as Step 2, but with
`classPrefix: 'editorial-showcase'` and **no** `separator` override
(Editorial already uses the shared default, `' · '`):

```jsx
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  classPrefix: 'editorial-showcase',
                })}
```

and:

```jsx
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, {
                directEditDispatch,
                copy,
                classPrefix: 'editorial-showcase',
              }))
```

- [ ] **Step 4: Migrate `PortraitShowcase.jsx`, and fix its parked Minor while touching this file**

Same shape again: delete the local `splitToBullets` and
`renderExperienceEntry` functions (this file's copy has NO preceding
`index`-relative comment — a Minor Round 3's final review parked; the
comment now exists once, in the shared module, closing that gap without
a separate fix).

Add the import:

```js
import { renderExperienceEntry } from './directEditExperienceEntry'
```

Change both call sites with `classPrefix: 'portrait-showcase'`, no
`separator` override:

```jsx
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  classPrefix: 'portrait-showcase',
                })}
```

and:

```jsx
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, {
                directEditDispatch,
                copy,
                classPrefix: 'portrait-showcase',
              }))
```

**Also fix Round 3's second parked Minor while this file is already
open**: the Skills section's three-way ternary (added in Round 3's
Task 3) is missing the margin-stacking rationale comment Modern
Timeline's Task 3 (this round) now carries from the start. Find the
`'skills'` branch of `renderSection` in `PortraitShowcase.jsx`:

```jsx
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" title={copy.skills}>
          {directEditDispatch ? (
```

Add the same comment used in this round's own Task 3, directly above the
ternary, inside the `Section`:

```jsx
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" title={copy.skills}>
          {/* Three-way ternary rather than one persistent .tag-row wrapper:
              .tag-row's own margin-top (0.9rem) would stack with .empty's
              margin-top (0.8rem) if the empty state were nested inside it —
              flex-item margins don't collapse — adding an unwanted extra
              gap. Keeping the three states as fully separate branches
              avoids that regression while still guaranteeing mutual
              exclusion (a single chained ternary can only ever select one
              branch). */}
          {directEditDispatch ? (
```

- [ ] **Step 5: Manual verification — confirm zero behavior change across all three migrated templates**

1. `npm run dev`, and for EACH of Classic Professional, Editorial, and
   Portrait: load the demo CV, switch to Direct Edit, confirm role/
   company/description are still editable, dates/location still
   read-only, the company/location separator still renders correctly
   (comma for Classic Professional, middle dot for the other two) in
   both edit and read-only modes, and multi-line descriptions still
   survive editing (type two lines via Enter, confirm visually two
   lines).
2. Switch each template to Classic mode and confirm nothing changed
   visually in the read-only render (this is the highest-risk check —
   the whole point of this task is zero behavior change for existing,
   shipped templates).
3. For Portrait specifically, confirm the Skills section still shows one
   chip per skill with no duplicates (unrelated to this task's own
   change, but this file's Skills section was also touched in Step 4 —
   worth confirming the comment-only edit didn't disturb anything).

- [ ] **Step 6: Verify and commit**

```bash
npm run lint
npm run check:reducers
npm run check:direct-edit
npm run build
npx playwright test   # full suite — this task touches 3 already-shipped templates
```

The full suite must stay green — every existing test for Classic
Professional, Editorial, and Portrait must still pass unchanged, since
this task is a pure refactor with no intended behavior change.

```bash
git add src/components/templates/directEditExperienceEntry.jsx \
        src/components/templates/ClassicProfessionalShowcase.jsx \
        src/components/templates/EditorialShowcase.jsx \
        src/components/templates/PortraitShowcase.jsx
git commit -m "Extract shared renderExperienceEntry for the oneColumn-family templates"
```

---

### Task 6: Extract the e2e smoke-test shape, cover all four templates, document the round, bump the version

**Files:**
- Modify: `e2e/direct-edit.spec.js`
- Modify: `changes.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: `DEMO_SKILLS` and `selectTemplate` (already defined near the
  top of `e2e/direct-edit.spec.js`) — reuse both, do not redefine.
- Produces: nothing consumed by later work (this round's final task).

**What this task removes**: 5 existing per-template test blocks — the
single Classic Professional test (lines ~219-280), both Editorial tests
(~290-358), and both Portrait tests (~367-431) — replaced by 2 shared
functions invoked once per template (4 templates × 2 = 8 test
invocations). This is a net INCREASE in real coverage: Classic
Professional never had an empty-contact-placeholder test (its contact
row happens to already use the safe wrapper-span shape from Round 1, so
this is new, currently-passing coverage, not a retrofit for a known bug),
and Modern Timeline gets both checks from day one.

- [ ] **Step 1: Replace the 5 per-template test blocks with 2 shared functions plus a parameterized invocation loop**

In `e2e/direct-edit.spec.js`, find the comment-and-test block that starts
at `// First template added to DIRECT_EDIT_SUPPORTED_TEMPLATES after
Minimalist...` (introducing the Classic Professional test) and ends at
the closing `})` of the second Portrait test (`'Portrait: an empty
contact field shows its placeholder label...'`) — this is everything from
that first comment through the end of the file's test content, right
before the `test.describe`'s own closing `})`. Delete that entire span
(5 tests + their comments) and replace it with:

```js
  // Shared smoke-test shape for every Direct-Edit-supported oneColumn-
  // family template. Two separate test functions, not one combined test:
  // the demo-data checks (name/skills/description) need the beforeEach's
  // already-loaded demo CV, while the placeholder check needs a
  // genuinely empty form — the two states can't coexist in a single
  // test. (Phase 2 Round 3's final review found a combined test whose
  // NAME claimed both checks but whose body only contained the demo-data
  // ones — this split is the fix, and the reason it's a hard split, not
  // a style preference.)
  function runDirectEditDemoDataChecks(label, classPrefix) {
    // Regression guard for the final whole-branch review's Fix 1
    // (2026-09-15, Classic Professional): the Experience description's
    // editing branch can reference a CSS class with no `white-space:
    // pre-line` rule, silently collapsing a multi-line description to
    // one line in the user's actual saved data on its first edit. Typing
    // a fresh "line 1, Enter, line 2" via the keyboard does NOT reproduce
    // this — a typed Enter inserts a real `<br>`, and `innerText` always
    // reports a `<br>` as a line break regardless of `white-space` CSS.
    // The real trigger is a description that already contains a literal
    // "\n" before the field is ever focused (seeded here through Classic
    // mode's own textarea, which stores a real "\n", same as a user
    // pressing Enter in a plain `<textarea>`), then edited to force a
    // dispatch via `Control+End` — never a typed newline.
    test(`${label}: name persists, skills render once as chips, and a multi-line description survives editing`, async ({ page }) => {
      await selectTemplate(page, label)

      const descriptionInput = page.getByLabel('Description', { exact: true }).first()
      await descriptionInput.fill('Seeded line A\nSeeded line B')

      await page.getByRole('tab', { name: 'Direct Edit' }).click()

      const nameField = page.locator(`.${classPrefix}__name .direct-edit-field`)
      await nameField.click()
      await page.keyboard.press('Control+A')
      await page.keyboard.type('Jordan Rivera')
      await nameField.blur()

      // Regression guard for Critical #1 (final whole-branch review,
      // Phase 1): every skill used to render twice in Direct Edit mode —
      // once as a plain, non-interactive span (never gated on
      // directEditDispatch) and once as a removable chip. Each
      // Direct-Edit-supported template has its own separate Skills
      // gating and needs its own guard.
      const skillsSection = page.locator('[data-export-section="skills"]')
      await expect(skillsSection.locator('[data-export-skill="true"]')).toHaveCount(0)
      await expect(skillsSection.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length)

      // Force a dispatch against the seeded multi-line description
      // without disturbing its existing content: focus the field, jump
      // to its true end (Control+End, not the line-relative End key),
      // and append a marker.
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
  }

  // Regression guard for the final whole-branch review's Important #1
  // (2026-09-16, Editorial): a template's contact row that passes
  // `className` directly into `EditableField` collides the template's
  // own class with `EditableField`'s internal `direct-edit-field--empty`
  // class on the same element — two ::before rules (the template's own
  // separator rule, direct-edit.css's placeholder-text rule) fight at
  // equal specificity, and the placeholder can silently lose, blanking
  // the label for any empty contact field. This only shows up on a
  // genuinely empty value, which `runDirectEditDemoDataChecks` above
  // never exercises (it always starts from the loaded demo CV). Checking
  // the computed ::before content (not just the `data-placeholder`
  // attribute, which is always present regardless of whether the CSS
  // actually renders it) is what makes this a real regression guard.
  function runDirectEditEmptyPlaceholderCheck(label, classPrefix, contactRowSuffix = 'meta') {
    test(`${label}: an empty contact field shows its placeholder label, not a stray separator, in Direct Edit mode`, async ({ page }) => {
      await page.getByRole('button', { name: 'Reset form' }).click()
      await page.getByRole('button', { name: 'Confirm reset' }).click()

      await selectTemplate(page, label)
      await page.getByRole('tab', { name: 'Direct Edit' }).click()

      const metaFields = page.locator(`.${classPrefix}__${contactRowSuffix} .direct-edit-field`)
      await expect(metaFields).toHaveCount(3)

      const labels = ['Location', 'Email', 'Phone']
      for (let i = 0; i < labels.length; i++) {
        const content = await metaFields.nth(i).evaluate((el) => getComputedStyle(el, '::before').content)
        expect(content).toContain(labels[i])
      }
    })
  }

  // One row per Direct-Edit-supported oneColumn-family template.
  // `contactRowSuffix` defaults to 'meta' (Editorial, Portrait); Classic
  // Professional and Modern Timeline both name their contact-row wrapper
  // class `__contact` instead — a naming choice from each template's
  // original (pre-Direct-Edit) authoring, unrelated to this rollout.
  const DIRECT_EDIT_TEMPLATES = [
    { label: 'Classic Professional', classPrefix: 'classic-professional-showcase', contactRowSuffix: 'contact' },
    { label: 'Editorial', classPrefix: 'editorial-showcase' },
    { label: 'Portrait', classPrefix: 'portrait-showcase' },
    { label: 'Modern Timeline', classPrefix: 'timeline-showcase', contactRowSuffix: 'contact' },
  ]

  for (const { label, classPrefix, contactRowSuffix } of DIRECT_EDIT_TEMPLATES) {
    runDirectEditDemoDataChecks(label, classPrefix)
    runDirectEditEmptyPlaceholderCheck(label, classPrefix, contactRowSuffix)
  }
```

This goes inside the existing `test.describe('Direct Edit builder', () => { ... })` block, in the same position the deleted tests occupied
(after the `beforeEach`, after the other non-per-template tests like the
Sections-popover and PDF-export ones — those stay completely untouched).
Calling `test(...)` synchronously inside a plain `for...of` loop at the
describe-block body level is standard, supported Playwright usage for
parameterized tests — this is not inside any `async` callback or
`test.beforeEach`.

- [ ] **Step 2: Verify the full test count and that every test is a genuine check, not tautological**

```bash
npx playwright test e2e/direct-edit.spec.js --list
```

Confirm you see 8 new per-template test names (4 templates × 2 each),
and that the 8 old ones are gone. Then run them:

```bash
npx playwright test e2e/direct-edit.spec.js -g "Classic Professional|Editorial|Portrait|Modern Timeline"
```

All 8 must pass. Specifically confirm the Classic Professional placeholder
test passes (this is new coverage that never existed before this task —
if it fails, that's a genuine regression to investigate, not a test bug,
since Classic Professional's contact row was already using the safe
wrapper-span shape before this round).

- [ ] **Step 3: Prove the multi-line-description check is still a real regression guard for the newly-touched files**

This task didn't change any CSS, but Task 5 DID restructure how three
templates' `renderExperienceEntry` gets its class names (via template
literals now, not hardcoded strings) — worth re-confirming the guard
still works after that refactor. Pick ONE of the three migrated templates
(e.g. Portrait), temporarily comment out its
`.portrait-showcase__bullets--editing` CSS rule in
`src/styles/templates/portrait.css`, re-run
`npx playwright test e2e/direct-edit.spec.js -g "Portrait: name persists"`,
confirm it FAILS with the collapsed-line symptom, then restore the CSS
rule exactly (`git diff` on that file must be empty once restored) and
confirm it passes again.

- [ ] **Step 4: Add the `changes.md` entry**

At the very top of `changes.md` (above the current top-most entry), add:

```markdown
## Direct Edit: Modern Timeline is now editable, and a shared pattern replaces three near-identical copies — 2026-09-17

Modern Timeline is the fourth template wired into Direct Edit mode
(Phase 2 Round 4), with the same scope every prior round has used:
identity, About, Experience, and Skills are all inline-editable in the
live preview. Its Experience entries render inside a distinct
`TimelineRow` component (a vertical-timeline visual with the date in its
own column), so this round also extracted the `renderExperienceEntry`
pattern — previously copied nearly identically across Classic
Professional, Editorial, and Portrait — into one shared function those
three templates now call, and collapsed five near-duplicate e2e "smoke
tests" into two shared, parameterized checks covering all four
templates (Modern Timeline included). Classic Professional's contact
row gains automated empty-placeholder coverage it never had, as a side
effect of the shared test shape.

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
npx playwright test   # FULL suite
```

Every command must be clean/green. One pre-existing, unrelated,
intermittently-flaky test may appear (`'the footer never overlaps the CV
preview in Direct Edit mode'`) — a known issue from a prior round's own
bug fix, unrelated to this task; if it fails, re-run it in isolation to
confirm it passes on its own before treating anything as blocking.

- [ ] **Step 6: Bump the version and commit**

```bash
git add e2e/direct-edit.spec.js
git commit -m "Replace five per-template Direct Edit smoke tests with a shared, parameterized check"

git add changes.md
git commit -m "Document Modern Timeline's Direct Edit wiring and the shared-pattern extraction"
```

Then bump `package.json`'s version from `1.2.38` to `1.2.39`:

```bash
git add package.json
git commit -m "Bump version to 1.2.39"
```

Confirm all three commits carry only `r0uty <yasa.sheva@gmail.com>`
attribution, no AI/Claude co-authorship trailer.
