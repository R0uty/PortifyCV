# Direct Edit Phase 2 Round 5: Compact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Compact template's identity, About, Experience, and Skills
sections inline-editable in Direct Edit mode — the 5th and last `oneColumn`-
family template, and the first template in the whole rollout with a
genuinely categorized (not flat) Skills display.

**Architecture:** Same shape as every prior round: wrap `DirectEditProvider`
locally around `CVPreview.jsx`'s existing Compact delegation branch, thread
a new `directEditDispatch` prop into `CompactShowcase.jsx`, and wire
`EditableField`/`EditableList` into that component's own JSX using the
existing `FORM_ACTION` cases — no new reducer actions. Compact's two real
deviations from the previous four rounds: (1) Experience entries render as a
single row (role+company+location+dates together, no separate meta line),
structurally different from `directEditExperienceEntry.jsx`'s two-row shape,
so Compact gets its own local `renderExperienceEntry`, matching Modern
Timeline's precedent, not the shared module. (2) Skills render grouped by a
*derived* category (`parseSkillCategories` buckets `formData.skills` by
regex against each skill's own text — there is no stored per-skill category
field), so a new shared primitive, `EditableCategorizedChip`
(`src/components/EditableList.jsx`), renders chips grouped for display while
still dispatching `REMOVE_SKILL`/`ADD_SKILL` against each skill's original
flat-array index — verified safe because `ADD_SKILL` already guarantees
case-insensitive-unique skill text, so a skill string safely round-trips
back to its original index via a `Map`.

**Tech Stack:** React 19, hand-rolled `contentEditable` primitives
(`EditableField`/`EditableList`/`EditableChip`), Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`
(Phase 2 rollout roadmap — see its "Known risk to fix proactively" section
for the categorized-skills and `text-transform` rules this plan follows).

## Global Constraints

- No new `cvFormReducer` actions — every dispatch uses an existing
  `FORM_ACTION` case (`SET_ROOT_FIELD`, `UPDATE_ARRAY_ITEM`,
  `ADD_ARRAY_ITEM`, `REMOVE_ARRAY_ITEM`, `MOVE_ARRAY_ITEM_TO_INDEX`,
  `ADD_SKILL`, `REMOVE_SKILL`).
- Commits carry only the repo's own git identity (`r0uty
  <yasa.sheva@gmail.com>`) — never an AI/Claude co-authorship trailer.
- Scope is identity (name/title/contact) + About + Experience + Skills only
  — Education/Links/Languages/Certificates/Projects/Interests stay
  read-only on Compact, exactly as on every other Direct-Edit-supported
  template so far.
- `formData` (raw) is what gets passed as `EditableField`'s `value` prop at
  every new call site — its read-only branch already trims internally, so
  never pre-trim before passing it in.
- Never pass `className` directly into `EditableField` — always wrap it in
  a plain host element (`<span>`/`<p>`) and put the template's styling
  class on that wrapper instead (Round 2's Editorial lesson: colliding
  `::before` rules can blank an empty field's placeholder).
- Any new CSS class introduced for an editing-only branch must be styled in
  the *same task* that introduces it, with a grep proving the class name in
  the JSX and the CSS match exactly (Round 1's lesson).
- Before wiring any identity/title `EditableField`, grep the template's
  stylesheet for `text-transform` on the class hosting it, in the same task
  (Round 4's lesson — `innerText`, which `EditableField` dispatches with,
  reflects CSS transforms, so an unguarded uppercase class silently
  corrupts the saved value).
- One e2e test per template (reusing the shared parameterized smoke-test
  functions in `e2e/direct-edit.spec.js` where the template's shape allows
  it) plus, for Compact specifically, one new test proving categorized
  chip removal maps back to the correct original skill index.

---

## File structure

- **Modify** `src/components/CVPreview.jsx` — wrap the existing Compact
  delegation branch (`variant === 'compact' && !atsFriendlyMode`) in
  `DirectEditProvider` and pass `directEditDispatch` into `CompactShowcase`.
- **Modify** `src/components/templates/CompactShowcase.jsx` — accept
  `directEditDispatch`, wire identity/contact/About/Experience/Skills, add
  a local `renderExperienceEntry` (module-scope, Compact's own shape, not
  the shared `directEditExperienceEntry.jsx`), compute
  `editableSkillCategories` (categorized-with-original-index skills for the
  editing branch).
- **Modify** `src/components/EditableList.jsx` — add a new export,
  `EditableCategorizedChip`, the categorized-aware sibling of the existing
  flat `EditableChip` in the same file.
- **Modify** `src/styles/direct-edit.css` — add the new
  `.direct-edit-chip-group`/`__label`/`__chips` rules `EditableCategorizedChip`
  needs (global, since future categorized templates — Creative, Tech
  Executive, Developer, Quadrant, Executive — reuse this same primitive).
- **Modify** `src/styles/templates/compact.css` — add
  `.compact-showcase__bullets--editing { white-space: pre-line; }` (Round
  1's multi-line-description lesson) and a Compact-specific label style for
  the editing chip groups (matches the read-only uppercase category-label
  look; the label itself is static text, never an `EditableField`, so this
  carries none of the `text-transform`/`innerText` risk).
- **Modify** `src/utils/directEdit.js` — add `'compact'` to
  `DIRECT_EDIT_SUPPORTED_TEMPLATES`.
- **Modify** `e2e/direct-edit.spec.js` — add Compact's row to the shared
  `DIRECT_EDIT_TEMPLATES` smoke-test loop, plus one new standalone test for
  categorized-chip index correctness.
- **Modify** `changes.md` — one new entry, matching every prior round's
  own changelog entry.
- **Modify** `package.json` — patch version bump (this project's per-unit-
  of-work convention).

---

### Task 1: Identity (name/title/contact) + About

**Files:**
- Modify: `src/components/CVPreview.jsx:223-241` (Compact delegation branch)
- Modify: `src/components/templates/CompactShowcase.jsx`

**Interfaces:**
- Consumes: `DirectEditProvider` (`src/components/DirectEditContext.jsx`,
  props `isEditing`, `dispatchFormData`), `EditableField`
  (`src/components/EditableField.jsx`, props `as`, `path`, `value`,
  `placeholder`, `multiline`).
- Produces: `CompactShowcase` now accepts a `directEditDispatch` prop
  (function or `null`) — Task 2 and Task 3 read the same prop from the same
  component signature.

- [ ] **Step 1: Grep Compact's stylesheet for `text-transform` on the identity classes before wiring anything**

Run:
```bash
grep -n -B3 "text-transform" src/styles/templates/compact.css
```

Expected: five matches, on `.compact-showcase__kicker`,
`.compact-showcase__section-title`, `.compact-showcase__project-stack`,
`.compact-showcase__skill-group-label`, and `.compact-showcase__link-label`
— **not** on `.compact-showcase__name` or `.compact-showcase__role` (the
two classes this task wires as `EditableField` hosts). Confirm this by eye
before continuing; if either class *does* appear, add a scoped
`.compact-showcase__name .direct-edit-field, .compact-showcase__role
.direct-edit-field { text-transform: none; }` rule to
`src/styles/templates/compact.css` as part of this task, matching the fix
already applied to Modern Timeline. As of this plan's writing, neither
class is transformed, so no CSS override is needed — this step exists to
re-verify against the live file, not to skip the check because the answer
is already known.

- [ ] **Step 2: Wrap the Compact delegation branch in `DirectEditProvider` and pass `directEditDispatch`**

In `src/components/CVPreview.jsx`, replace the current Compact branch
(around line 227):

```jsx
  if (variant === 'compact' && !atsFriendlyMode) {
    return (
      <Suspense fallback={null}>
        <CompactShowcase
          formData={formData}
          locale={locale}
          previewRef={previewRef}
          templateConfig={templateConfig}
          showcaseConfig={t}
          headingColor={headingColor}
          accentColor={accentColor}
        />
      </Suspense>
    )
  }
```

with:

```jsx
  if (variant === 'compact' && !atsFriendlyMode) {
    return (
      <DirectEditProvider isEditing={Boolean(directEditDispatch)} dispatchFormData={directEditDispatch}>
        <Suspense fallback={null}>
          <CompactShowcase
            formData={formData}
            locale={locale}
            previewRef={previewRef}
            templateConfig={templateConfig}
            showcaseConfig={t}
            headingColor={headingColor}
            accentColor={accentColor}
            directEditDispatch={directEditDispatch}
          />
        </Suspense>
      </DirectEditProvider>
    )
  }
```

(`DirectEditProvider` is already imported at the top of `CVPreview.jsx` —
every other wired template's branch uses the same import.)

- [ ] **Step 3: Accept `directEditDispatch` in `CompactShowcase`'s signature**

In `src/components/templates/CompactShowcase.jsx`, change the component
signature from:

```jsx
export default function CompactShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  headingColor = null,
  accentColor = COMPACT_DEFAULT_ACCENT_COLOR,
}) {
```

to:

```jsx
export default function CompactShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  headingColor = null,
  accentColor = COMPACT_DEFAULT_ACCENT_COLOR,
  directEditDispatch = null,
}) {
```

- [ ] **Step 4: Import `EditableField` and add the identity-contact placeholder copy**

Add to the top import block:

```jsx
import EditableField from '../EditableField'
```

In the `copy` object (currently lines 111-122), add three entries used by
this task (the other two, `untitledRole`/`company`/`descriptionPlaceholder`,
are added in Task 2):

```jsx
  const copy = {
    datesPending: isFinnish ? 'Pvm puuttuu' : 'Dates pending',
    summary: isFinnish ? 'Yhteenveto' : 'Summary',
    skills: isFinnish ? 'Taidot' : 'Skills',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    projects: isFinnish ? 'Projektit' : 'Projects',
    education: isFinnish ? 'Koulutus' : 'Education',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certificates',
    languages: isFinnish ? 'Kielet' : 'Languages',
    links: isFinnish ? 'Linkit' : 'Links',
    interests: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
  }
```

stays unchanged in this step (Task 2 extends it) — instead add a new
`directEditContactFields` array right after the existing
`personalContactItems` definition:

```jsx
  const personalContactItems = [
    ['email', snapshot.email],
    ['phone', snapshot.phone],
    ['location', snapshot.location],
  ].filter(([, value]) => value)
  const directEditContactFields = [
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
  ]
```

- [ ] **Step 5: Wire the name, title, and contact row**

Replace the header block's name/title/contact JSX (currently):

```jsx
        <h1 className="compact-showcase__name">{fullName}</h1>
        <p className="compact-showcase__role">{title}</p>
        {personalContactItems.length > 0 ? (
          <div className="compact-showcase__contact">
            {personalContactItems.map(([key, value], index) => (
              <span key={key} className="compact-showcase__contact-item">
                {index > 0 ? <span className="compact-showcase__contact-sep" aria-hidden="true">|</span> : null}
                <span className="compact-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                {value}
              </span>
            ))}
          </div>
        ) : null}
```

with:

```jsx
        <h1 className="compact-showcase__name">
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'fullName' }}
              value={formData.fullName}
              placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
            />
          ) : fullName}
        </h1>
        <p className="compact-showcase__role">
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'title' }}
              value={formData.title}
              placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
            />
          ) : title}
        </p>
        {directEditDispatch || personalContactItems.length > 0 ? (
          <div className="compact-showcase__contact">
            {(directEditDispatch ? directEditContactFields : personalContactItems).map(([key, value, placeholderLabel], index) => (
              <span key={key} className="compact-showcase__contact-item">
                {index > 0 ? <span className="compact-showcase__contact-sep" aria-hidden="true">|</span> : null}
                <span className="compact-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                {directEditDispatch ? (
                  <EditableField
                    as="span"
                    path={{ kind: 'root', field: key }}
                    value={value}
                    placeholder={placeholderLabel}
                  />
                ) : value}
              </span>
            ))}
          </div>
        ) : null}
```

Note the destructured triplet now includes `placeholderLabel` even in the
read-only branch (`personalContactItems` entries are 2-tuples, so
`placeholderLabel` is simply `undefined` there and unused) — this keeps one
`.map()` callback shape for both branches, matching Classic Professional's
identical pattern (`ClassicProfessionalShowcase.jsx:284`).

- [ ] **Step 6: Wire About**

Replace the current About block:

```jsx
      {about ? (
        <section className="compact-showcase__section compact-showcase__section--summary" data-export-section="about" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.summary}</h2>
          <p className="compact-showcase__summary">{about}</p>
        </section>
      ) : null}
```

with:

```jsx
      {directEditDispatch || about ? (
        <section className="compact-showcase__section compact-showcase__section--summary" data-export-section="about" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.summary}</h2>
          <p className="compact-showcase__summary">
            {directEditDispatch ? (
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
            ) : about}
          </p>
        </section>
      ) : null}
```

(Compact's About section already sits outside the `sectionKeys`/
`renderSection` loop and isn't gated by `sectionVisibility.about` — this is
pre-existing Compact behavior, unrelated to Direct Edit, and this task
doesn't change it.)

- [ ] **Step 7: Verify no build/lint errors**

Run:
```bash
npm run lint
```
Expected: no new errors in `CVPreview.jsx` or `CompactShowcase.jsx`.

- [ ] **Step 8: Manual smoke check in the dev server**

Run `npm run dev`, open the app, load the demo CV, switch to the Compact
template, switch to Direct Edit mode, and confirm: the name is editable in
place, the title is editable, all three contact fields show (with
placeholders for any that are empty), and About is editable (and shows its
placeholder when the demo CV's About field is empty — it isn't, by
default, so also try clearing it in Classic mode first to see the
placeholder). Also confirm Classic mode is completely unaffected (contact
row still hides empty fields there, matching current behavior).

- [ ] **Step 9: Commit**

```bash
git add src/components/CVPreview.jsx src/components/templates/CompactShowcase.jsx
git commit -m "Wire Compact's identity, contact, and About fields into Direct Edit mode"
```

---

### Task 2: Experience

**Files:**
- Modify: `src/components/templates/CompactShowcase.jsx`

**Interfaces:**
- Consumes: `EditableList` (`src/components/EditableList.jsx`, props
  `section`, `items`, `addLabel`, render-prop `children(item, index)`),
  `EditableField` (imported in Task 1), `directEditDispatch` (from Task 1's
  component signature).
- Produces: none consumed by later tasks — Skills (Task 3) is independent.

- [ ] **Step 1: Confirm Compact's Experience entry does NOT match `directEditExperienceEntry.jsx`'s shape**

Run:
```bash
sed -n '185,222p' src/components/templates/CompactShowcase.jsx
```

Confirm the read-only shape: one row (`.compact-showcase__entry-row`)
containing a `min-w-0` div with role, company, and location all inline,
plus `.compact-showcase__entry-dates` as a sibling on the same row — no
separate company/location "meta" line. This is structurally different
from `directEditExperienceEntry.jsx`'s two-row shape (role+dates row, then
a separate company+location meta row), so this task writes Compact's own
local `renderExperienceEntry`, matching Modern Timeline's precedent
(`src/components/templates/TimelineShowcase.jsx`'s own local copy), not the
shared module.

- [ ] **Step 2: Add the remaining `copy` entries this task needs**

Extend the `copy` object from Task 1 with three more keys (matching Classic
Professional's exact Finnish strings for consistency):

```jsx
  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
    datesPending: isFinnish ? 'Pvm puuttuu' : 'Dates pending',
    summary: isFinnish ? 'Yhteenveto' : 'Summary',
    skills: isFinnish ? 'Taidot' : 'Skills',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    projects: isFinnish ? 'Projektit' : 'Projects',
    education: isFinnish ? 'Koulutus' : 'Education',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certificates',
    languages: isFinnish ? 'Kielet' : 'Languages',
    links: isFinnish ? 'Linkit' : 'Links',
    interests: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
  }
```

- [ ] **Step 3: Import `EditableList` and write the local `renderExperienceEntry`**

Add to the import block:

```jsx
import EditableList from '../EditableList'
```

Add this function at module scope, directly below `highlightMetrics` (both
are pure helpers used by the render function, matching the file's existing
convention of module-scope helpers above the component):

```jsx
// Compact's own Experience-entry renderer — deliberately NOT
// directEditExperienceEntry.jsx (the shared module for Classic
// Professional/Editorial/Portrait). Compact's read-only shape renders
// role+company+location together in ONE row with dates floated right (no
// separate company/location meta line), a genuinely different DOM shape
// from that module's two-row layout — same reasoning Modern Timeline used
// for its own local copy. Location is read-only-appended text, never its
// own EditableField, matching the shared module's own precedent (only
// role and company are independently editable there too).
function renderExperienceEntry(item, index, { directEditDispatch, copy }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <div key={`${item.role}-${item.company}-${index}`} className="compact-showcase__entry" data-export-card="true">
      <div className="compact-showcase__entry-row">
        <div className="min-w-0">
          <span className="compact-showcase__entry-role">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'arrayItem', section: 'experience', index, field: 'role' }}
                value={item.role}
                placeholder={copy.untitledRole}
              />
            ) : item.role}
          </span>
          {directEditDispatch || item.company ? (
            <span className="compact-showcase__entry-company">
              {' · '}
              {directEditDispatch ? (
                <EditableField
                  as="span"
                  path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
                  value={item.company}
                  placeholder={copy.company}
                />
              ) : item.company}
            </span>
          ) : null}
          {item.location ? <span className="compact-showcase__entry-location"> · {item.location}</span> : null}
        </div>
        <span className="compact-showcase__entry-dates">{dateRange || copy.datesPending}</span>
      </div>
      {directEditDispatch ? (
        <p className="compact-showcase__bullets compact-showcase__bullets--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="compact-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{highlightMetrics(line)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 4: Style the new `--editing` class in the same step it's introduced**

Add to `src/styles/templates/compact.css`, directly below the existing
`.compact-showcase__bullets` rule:

```css
.compact-showcase__bullets--editing {
  white-space: pre-line;
}
```

Grep-prove the class name matches exactly between the JSX and the CSS:

```bash
grep -n "bullets--editing" src/components/templates/CompactShowcase.jsx src/styles/templates/compact.css
```

Expected: one match in the JSX (the `className` on the editing `<p>`), one
match in the CSS (the new rule's selector) — both spelled
`compact-showcase__bullets--editing`.

- [ ] **Step 5: Replace the Experience section's render logic**

Replace the current `key === 'experience'` block in `renderSection`:

```jsx
    if (key === 'experience') {
      return (
        <section key={key} className="compact-showcase__section" data-export-section="experience" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.experience}</h2>
          <div className="compact-showcase__entry-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []

                return (
                  <div key={`${item.role}-${item.company}-${index}`} className="compact-showcase__entry" data-export-card="true">
                    <div className="compact-showcase__entry-row">
                      <div className="min-w-0">
                        <span className="compact-showcase__entry-role">{item.role}</span>
                        {item.company ? <span className="compact-showcase__entry-company"> · {item.company}</span> : null}
                        {item.location ? <span className="compact-showcase__entry-location"> · {item.location}</span> : null}
                      </div>
                      <span className="compact-showcase__entry-dates">{dateRange || copy.datesPending}</span>
                    </div>
                    {bullets.length > 0 ? (
                      <ul className="compact-showcase__bullets">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{highlightMetrics(line)}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="compact-showcase__empty">
                {isFinnish ? 'Kokemus näkyy tässä.' : 'Experience will appear here.'}
              </p>
            )}
          </div>
        </section>
      )
    }
```

with:

```jsx
    if (key === 'experience') {
      return (
        <section key={key} className="compact-showcase__section" data-export-section="experience" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.experience}</h2>
          <div className="compact-showcase__entry-list">
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
              <p className="compact-showcase__empty">
                {isFinnish ? 'Kokemus näkyy tässä.' : 'Experience will appear here.'}
              </p>
            )}
          </div>
        </section>
      )
    }
```

- [ ] **Step 6: Verify no build/lint errors**

Run:
```bash
npm run lint
```
Expected: clean.

- [ ] **Step 7: Manual smoke check**

In the dev server, switch to Compact + Direct Edit, confirm: role, company
are editable in place; location and dates stay read-only text (matching
every other wired template's Experience entry); typing a multi-line
description (seed it via Classic mode's textarea, switch to Direct Edit,
append at the end with `Ctrl+End` — never type-then-Enter, per the
project's own proven-safe test pattern) survives the round trip back to
Classic mode without collapsing to one line; adding/removing/dragging
entries works via `EditableList`'s existing add/remove/drag controls.

- [ ] **Step 8: Commit**

```bash
git add src/components/templates/CompactShowcase.jsx src/styles/templates/compact.css
git commit -m "Wire Compact's Experience entries into Direct Edit mode"
```

---

### Task 3: Skills — categorized chip design

**Files:**
- Modify: `src/components/EditableList.jsx`
- Modify: `src/styles/direct-edit.css`
- Modify: `src/styles/templates/compact.css`
- Modify: `src/components/templates/CompactShowcase.jsx`

**Interfaces:**
- Consumes: `parseSkillCategories(skills, isFinnish)` (`src/components/templates/shared.jsx`,
  returns `[{ key, label, items: string[] }]`), `useDirectEdit()`
  (`src/components/DirectEditContext.jsx`), `FORM_ACTION.ADD_SKILL`/
  `REMOVE_SKILL` (`src/reducers/cvFormReducer.js`).
- Produces: `EditableCategorizedChip({ categories, addLabel })` — a new
  named export from `src/components/EditableList.jsx`, sibling to the
  existing `EditableChip`. `categories` shape:
  `[{ key: string, label: string, items: [{ skill: string, index: number }] }]`.
  Consumed only by `CompactShowcase.jsx` in this round; future categorized
  templates (Creative, Tech Executive, Developer, Quadrant, Executive) will
  reuse it unchanged in later rounds.

**Design note (read before implementing):** `parseSkillCategories` derives
categories by regex-matching each skill's own text (languages/frameworks/
databases/cloud/devops/security/other) — there is no stored per-skill
category field in `formData`. This means: (1) the category *label* is never
user-editable — it's computed, not data, so it's rendered as plain static
text, never an `EditableField`, and carries none of the `text-transform`/
`innerText` corruption risk even though `.compact-showcase__skill-group-label`
is styled `uppercase`. (2) A newly added skill (`ADD_SKILL`, always
appended to the end of the flat array with a generic "New skill N" label)
will not match any category regex and will render inside the "Other"/"Muut"
group after the next render, not inside whichever category group the user
clicked "+ Add" near — so this design uses one single "+ Add" button for
the whole Skills section (not one per category), exactly matching every
other wired template's single-add-button convention, rather than implying
a category-scoped add that wouldn't actually land there.

- [ ] **Step 1: Add `EditableCategorizedChip` to `EditableList.jsx`**

Add this new export directly below the existing `EditableChip` function in
`src/components/EditableList.jsx`:

```jsx
// Categorized sibling of EditableChip above, for templates whose Skills
// display groups skills by a DERIVED category (parseSkillCategories in
// templates/shared.jsx buckets by regex against each skill's own text —
// there is no stored per-skill category field). `categories` items carry
// each skill's ORIGINAL formData.skills index (computed by the caller,
// since categorization loses positional order) so REMOVE_SKILL always
// targets the correct flat-array entry regardless of which group it's
// displayed under. One shared "+ Add" button for the whole section, not
// one per category — a newly added skill is appended to the end of the
// flat array and re-categorized on the next render, so a per-category add
// button would misleadingly imply the new chip lands in that group.
export function EditableCategorizedChip({ categories, addLabel = '+ Add' }) {
  const { isEditing, dispatchFormData } = useDirectEdit()

  if (!isEditing) {
    return null
  }

  const handleRemove = (index) => {
    dispatchFormData({ type: FORM_ACTION.REMOVE_SKILL, index })
  }

  const handleAdd = () => {
    const totalSkills = categories.reduce((sum, cat) => sum + cat.items.length, 0)
    const nextLabel = `New skill ${totalSkills + 1}`
    dispatchFormData({ type: FORM_ACTION.ADD_SKILL, skill: nextLabel })
  }

  return (
    <>
      {categories.map((cat) => (
        <div key={cat.key} className="direct-edit-chip-group">
          <span className="direct-edit-chip-group__label">{cat.label}</span>
          <div className="direct-edit-chip-group__chips">
            {cat.items.map(({ skill, index }) => (
              <button
                key={`${skill}:${index}`}
                type="button"
                className="direct-edit-chip direct-edit-chip--removable"
                onClick={() => handleRemove(index)}
              >
                {skill} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="direct-edit-chip-add" onClick={handleAdd}>
        {addLabel}
      </button>
    </>
  )
}
```

- [ ] **Step 2: Style the new chip-group wrapper (global, in `direct-edit.css`)**

Add directly below the existing `.direct-edit-chip-add:hover` rule in
`src/styles/direct-edit.css`:

```css
.direct-edit-chip-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.direct-edit-chip-group__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ds-text-muted, #71717a);
  margin-right: 2px;
}

.direct-edit-chip-group__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
```

Grep-prove the class names match between the component and the CSS:

```bash
grep -n "direct-edit-chip-group" src/components/EditableList.jsx src/styles/direct-edit.css
```

Expected: `direct-edit-chip-group`, `direct-edit-chip-group__label`, and
`direct-edit-chip-group__chips` each appear in both files.

- [ ] **Step 3: Compute `editableSkillCategories` in `CompactShowcase.jsx`**

Add directly below the existing `skillCategories` computation:

```jsx
  const skillCategories = useMemo(
    () => parseSkillCategories(snapshot.skills, isFinnish),
    [snapshot.skills, isFinnish],
  )
  // Editing-branch-only: the same categorization, but computed off the raw
  // formData.skills array (not the trimmed snapshot) and with each item's
  // ORIGINAL flat-array index attached, so EditableCategorizedChip can
  // dispatch REMOVE_SKILL against the right entry regardless of which
  // category group it renders under. Safe to map a skill's text back to
  // its index via a plain Map: ADD_SKILL already rejects a skill whose
  // text case-insensitively matches an existing one, so skill strings are
  // always unique within formData.skills at any point in time.
  const editableSkillCategories = useMemo(() => {
    const grouped = parseSkillCategories(formData.skills, isFinnish)
    const indexByText = new Map(formData.skills.map((skill, index) => [skill, index]))

    return grouped.map((cat) => ({
      ...cat,
      items: cat.items.map((skill) => ({ skill, index: indexByText.get(skill) })),
    }))
  }, [formData.skills, isFinnish])
```

- [ ] **Step 4: Import `EditableCategorizedChip`**

Change the existing `EditableList` import (added in Task 2) to also pull in
the new named export:

```jsx
import EditableList, { EditableCategorizedChip } from '../EditableList'
```

- [ ] **Step 5: Wire the Skills section**

Replace the current `key === 'skills'` block:

```jsx
    if (key === 'skills') {
      return (
        <section key={key} className="compact-showcase__section" data-export-section="skills" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.skills}</h2>
          {skillCategories.length > 0 ? (
            <div className="compact-showcase__skill-groups">
              {skillCategories.map((cat) => (
                <p key={cat.key} className="compact-showcase__skill-group" data-export-skill="true">
                  <span className="compact-showcase__skill-group-label">{cat.label}: </span>
                  <span className="compact-showcase__skill-items">{cat.items.join(', ')}</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="compact-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </section>
      )
    }
```

with:

```jsx
    if (key === 'skills') {
      return (
        <section key={key} className="compact-showcase__section" data-export-section="skills" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.skills}</h2>
          {directEditDispatch ? null : skillCategories.length > 0 ? (
            <div className="compact-showcase__skill-groups">
              {skillCategories.map((cat) => (
                <p key={cat.key} className="compact-showcase__skill-group" data-export-skill="true">
                  <span className="compact-showcase__skill-group-label">{cat.label}: </span>
                  <span className="compact-showcase__skill-items">{cat.items.join(', ')}</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="compact-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
          {directEditDispatch ? (
            <div className="compact-showcase__skill-groups compact-showcase__skill-groups--editing">
              <EditableCategorizedChip
                categories={editableSkillCategories}
                addLabel={isFinnish ? '+ Lisää' : '+ Add'}
              />
            </div>
          ) : null}
        </section>
      )
    }
```

The read-only render is now fully gated behind `directEditDispatch ? null
: ...` (matches the exact shape of the fix for the Phase 1 final review's
Critical #1 — every skill rendering twice — so this template can't ship
that bug on day one).

- [ ] **Step 6: Polish — match the read-only category-label look while editing**

Add to `src/styles/templates/compact.css`, directly below the existing
`.compact-showcase__skill-group-label` rule:

```css
.compact-showcase__skill-groups--editing .direct-edit-chip-group__label {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: var(--tpl-meta-size);
  color: var(--cp-ink);
}
```

This is purely cosmetic (the label is static text, never an
`EditableField`, so it carries no `innerText`/data-corruption risk) —
matches the visual weight of the read-only category headings.

- [ ] **Step 7: Verify no build/lint errors**

Run:
```bash
npm run lint
```
Expected: clean.

- [ ] **Step 8: Manual smoke check**

In the dev server, switch to Compact + Direct Edit: confirm skills render
grouped under category labels (the demo CV's 6 skills — none matching a
category regex — should all land under "Other"/"Muut", a single group);
confirm no skill renders twice (open devtools, confirm zero
`[data-export-skill="true"]` elements are present while editing); click
"+ Add" and confirm a new "New skill N" chip appears (in the "Other"
group); click a chip to remove it and confirm the CORRECT skill disappears
(cross-check against Classic mode's skill tag list before and after).

- [ ] **Step 9: Commit**

```bash
git add src/components/EditableList.jsx src/styles/direct-edit.css src/styles/templates/compact.css src/components/templates/CompactShowcase.jsx
git commit -m "Add categorized-chip Skills editing for Compact (EditableCategorizedChip)"
```

---

### Task 4: Allowlist + e2e tests + full verification pass

**Files:**
- Modify: `src/utils/directEdit.js`
- Modify: `e2e/direct-edit.spec.js`
- Modify: `changes.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: `DIRECT_EDIT_SUPPORTED_TEMPLATES` (`src/utils/directEdit.js`),
  `runDirectEditDemoDataChecks`/`runDirectEditEmptyPlaceholderCheck`/
  `DIRECT_EDIT_TEMPLATES` (`e2e/direct-edit.spec.js`), `DEMO_SKILLS`
  (`e2e/direct-edit.spec.js:16`), `selectTemplate` helper
  (`e2e/direct-edit.spec.js:7`).
- Produces: nothing consumed by later work — this is the round's last task.

- [ ] **Step 1: Add `'compact'` to the allowlist**

In `src/utils/directEdit.js`:

```js
export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional', 'editorial', 'portrait', 'timeline', 'compact']
```

- [ ] **Step 2: Run the allowlist regression check**

Run:
```bash
npm run check:direct-edit
```
Expected: all checks pass (`'compact'` is a real id in `cvTemplates`, no
duplicates).

- [ ] **Step 3: Add Compact to the shared smoke-test loop**

In `e2e/direct-edit.spec.js`, extend the `DIRECT_EDIT_TEMPLATES` array
(currently ending after Modern Timeline):

```js
  const DIRECT_EDIT_TEMPLATES = [
    { label: 'Classic Professional', classPrefix: 'classic-professional-showcase', contactRowSuffix: 'contact', labelOrder: ['Phone', 'Email', 'Location'] },
    { label: 'Editorial', classPrefix: 'editorial-showcase' },
    { label: 'Portrait', classPrefix: 'portrait-showcase' },
    { label: 'Modern Timeline', classPrefix: 'timeline-showcase', contactRowSuffix: 'contact', labelOrder: ['Phone', 'Email', 'Location'] },
    { label: 'Compact', classPrefix: 'compact-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
  ]
```

Compact's `contactRowSuffix` is `'contact'` (its wrapper class is
`.compact-showcase__contact`, matching Classic Professional/Modern
Timeline's naming, not Editorial/Portrait's `__meta`). Its `labelOrder` is
`['Email', 'Phone', 'Location']` — a THIRD distinct order not seen in any
prior round (Compact's own `personalContactItems`/`directEditContactFields`
arrays list email first, then phone, then location; double-check this
against `CompactShowcase.jsx` directly rather than assuming it matches
either existing default before running the test).

This one array addition automatically runs both
`runDirectEditDemoDataChecks('Compact', 'compact-showcase')` and
`runDirectEditEmptyPlaceholderCheck('Compact', 'compact-showcase',
'contact', ['Email', 'Phone', 'Location'])` via the existing loop at the
bottom of the file — no further code needed for those two checks.

- [ ] **Step 4: Write the categorized-skills index-correctness test**

This is the one check the shared smoke tests can't cover — none of them
prove that removing a chip from a *derived category group* removes the
right skill from the flat `formData.skills` array. The demo CV's 6 default
skills (`DEMO_SKILLS`) all fall into a single "Other" bucket (none matches
a category regex), so this test adds one skill that regexes into a
*different* category ("Docker" → the `devops` bucket) via Classic mode's
`TagsInput` (`aria-label="Skill tags"`, `src/components/fields/TagsInput.jsx`
— typing text then pressing Enter commits it as a tag), then removes
specifically that chip in Direct Edit mode, and confirms the original 6
skills all survive untouched.

Add this test to `e2e/direct-edit.spec.js`, directly above the
`DIRECT_EDIT_TEMPLATES` array definition:

```js
  // Compact-only regression guard: EditableCategorizedChip groups skills by
  // a DERIVED category (parseSkillCategories buckets by regex against each
  // skill's own text) but must still dispatch REMOVE_SKILL against each
  // skill's ORIGINAL formData.skills index. The demo CV's 6 default skills
  // (DEMO_SKILLS) all land in one "Other" group, so this test adds a skill
  // that regexes into a DIFFERENT group ("Docker" -> devops) via Classic
  // mode's Skill tags input, removes specifically that chip in Direct Edit
  // mode, and confirms all 6 original skills survive untouched — proving
  // the index mapping is correct, not just that a chip disappeared.
  test('Compact: removing a categorized skill chip removes the correct skill, not a same-category neighbor', async ({ page }) => {
    await selectTemplate(page, 'Compact')

    const skillsInput = page.getByLabel('Skill tags', { exact: true })
    await skillsInput.fill('Docker')
    await skillsInput.press('Enter')

    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const skillsSection = page.locator('[data-export-section="skills"]')
    await expect(skillsSection.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length + 1)

    await skillsSection.getByRole('button', { name: /^Docker/ }).click()

    await expect(skillsSection.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length)

    await page.getByRole('tab', { name: 'Classic' }).click()
    const remainingTags = (await page.locator('.tags-input__tag').allTextContents()).map((text) => text.trim())
    expect(remainingTags).toEqual(DEMO_SKILLS)
  })
```

- [ ] **Step 5: Run the new/updated e2e tests in isolation first**

Run:
```bash
npx playwright test e2e/direct-edit.spec.js -g "Compact"
```
Expected: all Compact-related tests pass — the two loop-generated ones
(`Compact: name persists, skills render once as chips, and a multi-line
description survives editing` and `Compact: an empty contact field shows
its placeholder label...`) plus the new categorized-removal test.

If the empty-placeholder test fails on the `labelOrder` assertion, re-check
`CompactShowcase.jsx`'s actual `directEditContactFields` order (Step 4 of
Task 1) rather than assuming this plan's guess — fix the array in this
test to match reality, not the other way around.

- [ ] **Step 6: Run the full e2e suite**

Run:
```bash
npm run test:e2e
```
Expected: all tests pass, including the pre-existing (documented, unrelated
to this round) intermittent flake on `'the footer never overlaps the CV
preview in Direct Edit mode'` under parallel-worker conditions — re-run in
isolation if it fails and passes alone, per the established pattern from
Round 2's memory.

- [ ] **Step 7: Run the remaining verification commands**

Run:
```bash
npm run lint
npm run check:reducers
npm run check:share
npm run build
```
Expected: all clean/pass.

- [ ] **Step 8: Add the `changes.md` entry**

Add a new entry at the top of the "Running log" in `changes.md`, matching
the style of the Round 4 entry directly below it:

```markdown
## Direct Edit: Compact is now editable, with a new categorized-skills chip design — 2026-09-17

Compact is now editable in Direct Edit mode (Phase 2 Round 5, the last
`oneColumn`-family template), with the same scope every prior round has
used: identity, About, Experience, and Skills are all inline-editable in
the live preview. Compact is this rollout's first genuinely categorized-
skills template — its Skills section groups skills under derived category
headings (Languages, Frameworks, Databases, Cloud, DevOps, Security,
Other) rather than one flat list, so this round adds a new shared
primitive, `EditableCategorizedChip`, alongside the existing flat
`EditableChip`: chips render grouped for display while still removing the
correct skill from the underlying flat array regardless of which group
it's shown under. Compact's Experience entries also get their own local
renderer rather than the three-template shared module from Round 4 —
role, company, and location render together in one row (not two), a
genuinely different shape from Classic Professional/Editorial/Portrait.
```

- [ ] **Step 9: Bump the version**

In `package.json`, bump the patch version (e.g. `1.2.40` → `1.2.41`).

- [ ] **Step 10: Commit**

```bash
git add src/utils/directEdit.js e2e/direct-edit.spec.js changes.md package.json
git commit -m "Add Compact to Direct Edit's supported templates, with e2e coverage"
```

---

## After this plan: final whole-branch review

Per this rollout's established process, dispatch one final whole-branch
review (opus) covering all four tasks' combined diff before considering
Round 5 done — every prior round's final review has found at least one
cross-task issue no single task's own review could see (e.g. Round 2's
`className`-collision bug, Round 4's live `text-transform` bug on Classic
Professional). Pay particular attention, given this round's own novel
surface area, to: whether `EditableCategorizedChip`'s index-to-skill
mapping holds under `MOVE_ARRAY_ITEM_TO_INDEX`-adjacent edge cases (it
doesn't use that action — skills have no reorder UI in Direct Edit mode
today, same as every prior round — but double check `DUPLICATE_SKILL`/
`MOVE_SKILL`, both reachable from Classic mode, can't leave a stale index
behind if a user switches modes mid-edit); and whether Compact's
`useLayoutEffect`-driven density auto-fit (cozy/snug/tight) behaves
correctly while `EditableList`'s drag-and-drop or `EditableCategorizedChip`
add/remove churn is changing the rendered content's height mid-edit (this
mechanism is unique to Compact — no other wired template has it — and was
not exercised by any prior round's review).
