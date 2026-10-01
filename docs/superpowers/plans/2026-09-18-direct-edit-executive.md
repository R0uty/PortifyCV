# Direct Edit Phase 2 Round 6: Executive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Executive template's identity, About, Experience, and Skills
sections inline-editable in Direct Edit mode — the first template in the
`railTable` family (left-rail identity + sidebar secondary sections + main
column primary sections), and the second template in the whole rollout
(after Compact) to reuse the categorized-skills chip design.

**Architecture:** Same shape as every prior round: wrap `DirectEditProvider`
locally around `CVPreview.jsx`'s existing Executive delegation branch, thread
a new `directEditDispatch` prop into `ExecutiveShowcase.jsx`, and wire
`EditableField`/`EditableList`/`EditableCategorizedChip` into that
component's own JSX using existing `FORM_ACTION` cases — no new reducer
actions, no changes to the shared primitives themselves. Two things this
round confirms or extends rather than invents: (1) Executive's Skills
section already renders visually as grouped chips in read-only mode
(`<span data-export-skill="true" className="executive-showcase__tag">`
inside a per-category group), so `EditableCategorizedChip` — built for
Compact in Round 5 — is reused completely unchanged, no new component
needed; (2) Executive's Experience entry DOM shape (role+company/location
nested inside an extra `min-w-0` wrapper div, with dates as a sibling
*outside* that wrapper) is close to, but not identical to, the 3-template
shared module (`directEditExperienceEntry.jsx`), so — matching the
established "don't force a near-miss into the shared module" rule from
Rounds 4/5 — this round writes its own local `renderExperienceEntry`
mirroring Executive's exact existing nesting.

**Tech Stack:** React 19, hand-rolled `contentEditable` primitives
(`EditableField`/`EditableList`/`EditableChip`/`EditableCategorizedChip`),
Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`
(Phase 2 rollout roadmap — see its "Rollout order" table for why
`railTable` is next, and its "Known risk to fix proactively" section for
the two standing bug classes — categorized-skills chip design and
`text-transform`/`innerText` corruption — this plan checks for both).

## Global Constraints

- No new `cvFormReducer` actions — every dispatch uses an existing
  `FORM_ACTION` case (`SET_ROOT_FIELD`, `UPDATE_ARRAY_ITEM`,
  `ADD_ARRAY_ITEM`, `REMOVE_ARRAY_ITEM`, `MOVE_ARRAY_ITEM_TO_INDEX`,
  `ADD_SKILL`, `REMOVE_SKILL`).
- Commits carry only the repo's own git identity (`r0uty
  <yasa.sheva@gmail.com>`) — never an AI/Claude co-authorship trailer.
- Scope is identity (name/title/contact) + About + Experience + Skills only
  — Executive's `tagline` field (a real root field, `formData.tagline`,
  rendered directly under the title in the identity block) is deliberately
  OUT of scope this round, matching the established "identity means
  name/title/contact, not every field near it" boundary from every prior
  round. Leadership/Projects/Achievements/Education/Certificates/Languages/
  Memberships/Links all stay read-only too, exactly as on every other
  wired template.
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
  corrupts the saved value). This is doubly important for the `railTable`
  family per the roadmap's own warning that it "uses uppercase kickers/
  rail labels heavily."
- One e2e test per template (reusing the shared parameterized smoke-test
  functions in `e2e/direct-edit.spec.js` where the template's shape allows
  it — Executive's shape is close enough to reuse both existing helpers
  unchanged, unlike Compact which needed one new dedicated test).

---

## File structure

- **Modify** `src/components/CVPreview.jsx` — wrap the existing Executive
  delegation branch (`variant === 'executive' && !atsFriendlyMode`,
  currently `CVPreview.jsx:159-173`) in `DirectEditProvider` and pass
  `directEditDispatch` into `ExecutiveShowcase`.
- **Modify** `src/components/templates/ExecutiveShowcase.jsx` — accept
  `directEditDispatch`, wire identity/contact/About/Experience/Skills, add
  a local `renderExperienceEntry` (module-scope, Executive's own exact
  nesting, not the shared `directEditExperienceEntry.jsx`).
- **Modify** `src/styles/templates/executive.css` — add
  `.executive-showcase__bullets--editing { white-space: pre-line; }`
  (Round 1's multi-line-description lesson).
- **Modify** `src/utils/directEdit.js` — add `'executive'` to
  `DIRECT_EDIT_SUPPORTED_TEMPLATES`.
- **Modify** `e2e/direct-edit.spec.js` — add Executive's row to the shared
  `DIRECT_EDIT_TEMPLATES` smoke-test loop (no new dedicated test needed —
  see Task 4's design note for why).
- **Modify** `changes.md` — one new entry, matching every prior round's
  own changelog entry.
- **Modify** `package.json` — patch version bump (this project's per-unit-
  of-work convention).

No changes to `src/components/EditableList.jsx` or `src/styles/direct-edit.css`
this round — `EditableCategorizedChip` and its CSS, built for Compact,
are reused completely unchanged.

---

### Task 1: Identity (name/title/contact) + About

**Files:**
- Modify: `src/components/CVPreview.jsx:159-173` (Executive delegation branch)
- Modify: `src/components/templates/ExecutiveShowcase.jsx`

**Interfaces:**
- Consumes: `DirectEditProvider` (`src/components/DirectEditContext.jsx`,
  props `isEditing`, `dispatchFormData`), `EditableField`
  (`src/components/EditableField.jsx`, props `as`, `path`, `value`,
  `placeholder`, `multiline`).
- Produces: `ExecutiveShowcase` now accepts a `directEditDispatch` prop
  (function or `null`) — Task 2 and Task 3 read the same prop from the same
  component signature.

- [ ] **Step 1: Grep Executive's stylesheet for `text-transform` on the identity classes before wiring anything**

Run:
```bash
grep -n -B3 "text-transform" src/styles/templates/executive.css
```

Expected: four matches, on `.executive-showcase__kicker`,
`.executive-showcase__section-title`, `.executive-showcase__skill-group-label`,
and `.executive-showcase__link-label` — **not** on `.executive-showcase__name`,
`.executive-showcase__role`, or `.executive-showcase__contact-item` (the
classes this task wires as `EditableField` hosts). Confirm this by eye
before continuing; if any of those three classes *does* appear (or
inherits a transform from an ancestor — check `.executive-showcase__identity`
and `.executive-showcase__sidebar` too), add a scoped
`.executive-showcase__name .direct-edit-field, .executive-showcase__role
.direct-edit-field, .executive-showcase__contact-item .direct-edit-field
{ text-transform: none; }` rule to `src/styles/templates/executive.css` as
part of this task. As of this plan's writing, none of the three classes
(nor their ancestors) is transformed, so no CSS override is expected to be
needed — this step exists to re-verify against the live file, not to skip
the check because the answer is already known.

- [ ] **Step 2: Wrap the Executive delegation branch in `DirectEditProvider` and pass `directEditDispatch`**

In `src/components/CVPreview.jsx`, replace the current Executive branch:

```jsx
  if (variant === 'executive' && !atsFriendlyMode) {
    return (
      <Suspense fallback={null}>
        <ExecutiveShowcase
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
  if (variant === 'executive' && !atsFriendlyMode) {
    return (
      <DirectEditProvider isEditing={Boolean(directEditDispatch)} dispatchFormData={directEditDispatch}>
        <Suspense fallback={null}>
          <ExecutiveShowcase
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

- [ ] **Step 3: Accept `directEditDispatch` in `ExecutiveShowcase`'s signature**

In `src/components/templates/ExecutiveShowcase.jsx`, change the component
signature from:

```jsx
export default function ExecutiveShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  headingColor = null,
  accentColor = EXECUTIVE_DEFAULT_ACCENT_COLOR,
}) {
```

to:

```jsx
export default function ExecutiveShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  headingColor = null,
  accentColor = EXECUTIVE_DEFAULT_ACCENT_COLOR,
  directEditDispatch = null,
}) {
```

- [ ] **Step 4: Import `EditableField` and add a `directEditContactFields` array**

Add to the top import block:

```jsx
import EditableField from '../EditableField'
```

Add a new array right after the existing `personalContactItems` definition
(the read-only branch keeps using `personalContactItems`, which is built
from `snapshot.*` and filters out empty fields — this new array is
edit-mode-only, built from raw `formData.*`, and always includes all three
fields so an empty one still shows its placeholder while editing):

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

Replace the identity block's name/title/contact JSX (currently):

```jsx
          <h1 className="executive-showcase__name">{fullName}</h1>
          <p className="executive-showcase__role">{title}</p>
          {tagline ? <p className="executive-showcase__tagline">{tagline}</p> : null}
          {personalContactItems.length > 0 ? (
            <div className="executive-showcase__contact">
              {personalContactItems.map(([key, value]) => (
                <span key={key} className="executive-showcase__contact-item">
                  <span className="executive-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {value}
                </span>
              ))}
            </div>
          ) : null}
```

with:

```jsx
          <h1 className="executive-showcase__name">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            ) : fullName}
          </h1>
          <p className="executive-showcase__role">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'title' }}
                value={formData.title}
                placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
              />
            ) : title}
          </p>
          {tagline ? <p className="executive-showcase__tagline">{tagline}</p> : null}
          {directEditDispatch || personalContactItems.length > 0 ? (
            <div className="executive-showcase__contact">
              {(directEditDispatch ? directEditContactFields : personalContactItems).map(([key, value, placeholderLabel]) => (
                <span key={key} className="executive-showcase__contact-item">
                  <span className="executive-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
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

`tagline` is deliberately left untouched (out of scope per the Global
Constraints — it stays read-only, including its `showExecutiveTagline`
config toggle, exactly as before this task).

- [ ] **Step 6: Wire About**

The About section already renders through `renderMainSection('about')`
(gated by `mainSectionKeys`, i.e. only when `'about'` is a primary section
and its visibility is on — no special-casing needed here, unlike Compact's
About which bypasses that gating). Replace:

```jsx
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement="main" title={copy.profile}>
          <p className="executive-showcase__summary">{about}</p>
        </Section>
      )
    }
```

with:

```jsx
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement="main" title={copy.profile}>
          <p className="executive-showcase__summary">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'about' }}
                value={formData.about}
                placeholder={
                  isFinnish
                    ? 'Ammatillinen yhteenvetosi näkyy tässä, kun täytät CV-lomaketta.'
                    : 'Your executive summary will appear here as you fill out the CV form.'
                }
                multiline
              />
            ) : about}
          </p>
        </Section>
      )
    }
```

(The placeholder text matches the existing `about` fallback string exactly
— `about` itself, defined earlier in the component as `snapshot.about ||
'<same fallback>'`, is untouched and still used for the read-only branch.)

- [ ] **Step 7: Verify no build/lint errors**

Run:
```bash
npm run lint
```
Expected: no new errors in `CVPreview.jsx` or `ExecutiveShowcase.jsx`.

- [ ] **Step 8: Manual smoke check in the dev server**

Run `npm run dev`, open the app, load the demo CV, switch to the Executive
template, switch to Direct Edit mode, and confirm: the name is editable in
place, the title is editable, all three contact fields show (with
placeholders for any that are empty), About is editable, and the tagline
(if the demo CV has one) still renders as plain read-only text. Also
confirm Classic mode is completely unaffected (contact row still hides
empty fields there, matching current behavior).

- [ ] **Step 9: Commit**

```bash
git add src/components/CVPreview.jsx src/components/templates/ExecutiveShowcase.jsx
git commit -m "Wire Executive's identity, contact, and About fields into Direct Edit mode"
```

---

### Task 2: Experience

**Files:**
- Modify: `src/components/templates/ExecutiveShowcase.jsx`
- Modify: `src/styles/templates/executive.css`

**Interfaces:**
- Consumes: `EditableList` (`src/components/EditableList.jsx`, props
  `section`, `items`, `addLabel`, render-prop `children(item, index)`),
  `EditableField` (imported in Task 1), `directEditDispatch` (from Task 1's
  component signature).
- Produces: none consumed by later tasks — Skills (Task 3) is independent.

- [ ] **Step 1: Confirm Executive's Experience entry shape is close to, but not identical to, `directEditExperienceEntry.jsx`**

Run:
```bash
sed -n '159,199p' src/components/templates/ExecutiveShowcase.jsx
```

Confirm the read-only shape: `.executive-showcase__entry-row` contains a
`min-w-0` div wrapping BOTH `.executive-showcase__entry-role` AND the
conditional `.executive-showcase__entry-meta` paragraph, with
`.executive-showcase__entry-dates` as a sibling of that `min-w-0` div (not
a sibling of `entry-role` directly). The shared module
(`src/components/templates/directEditExperienceEntry.jsx`) has role and
dates as DIRECT siblings inside `entry-row`, with no wrapping div — a real
structural difference, even though the *visual* result (role+dates on one
line, company·location on the next) looks similar. Per the established
rule from Rounds 4/5 ("don't force a near-miss into the shared module —
get its own local copy"), this task writes Executive's own local
`renderExperienceEntry`, mirroring the exact existing nesting including
the `min-w-0` wrapper.

- [ ] **Step 2: Add the `copy` entries this task needs**

Extend the `copy` object (currently lines 132-148) with two more keys —
`company` and `descriptionPlaceholder` — matching the exact strings used
by every prior round:

```jsx
  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
    viewCredential: isFinnish ? 'Näytä todennus' : 'View credential',
    profile: isFinnish ? 'Johtajaprofiili' : 'Executive Profile',
    experience: isFinnish ? 'Työkokemus' : 'Professional Experience',
    leadership: isFinnish ? 'Johtamiskokemus' : 'Leadership Experience',
    projects: isFinnish ? 'Strategiset hankkeet' : 'Major Projects',
    education: isFinnish ? 'Koulutus' : 'Education',
    coreStrengths: isFinnish ? 'Ydinosaaminen' : 'Core Competencies',
    skills: isFinnish ? 'Johtamistaidot' : 'Executive Skills',
    certificates: isFinnish ? 'Sertifioinnit' : 'Certifications',
    languages: isFinnish ? 'Kielet' : 'Languages',
    memberships: isFinnish ? 'Ammattijäsenyydet' : 'Professional Memberships',
    achievements: isFinnish ? 'Tunnustukset' : 'Awards',
    links: isFinnish ? 'Linkit' : 'Links',
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
// Executive's own Experience-entry renderer — deliberately NOT
// directEditExperienceEntry.jsx (the shared module for Classic
// Professional/Editorial/Portrait). Executive's read-only shape nests
// role AND the company/location meta line together inside one `min-w-0`
// div, with dates as a sibling of THAT div (not of role directly) — a
// real structural difference from the shared module's flat two-children
// entry-row, even though the visual result looks similar. Only role and
// company are independently editable, matching the shared module's own
// precedent — location stays read-only-appended text.
function renderExperienceEntry(item, index, { directEditDispatch, copy, showMetrics }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <div key={`${item.role}-${item.company}-${index}`} className="executive-showcase__entry" data-export-card="true">
      <div className="executive-showcase__entry-row">
        <div className="min-w-0">
          <p className="executive-showcase__entry-role">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'arrayItem', section: 'experience', index, field: 'role' }}
                value={item.role}
                placeholder={copy.untitledRole}
              />
            ) : item.role || copy.untitledRole}
          </p>
          {directEditDispatch || item.company || item.location ? (
            <p className="executive-showcase__entry-meta">
              {directEditDispatch ? (
                <EditableField
                  as="span"
                  path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
                  value={item.company}
                  placeholder={copy.company}
                />
              ) : item.company}
              {item.company && item.location ? ` · ${item.location}` : item.location || null}
            </p>
          ) : null}
        </div>
        <p className="executive-showcase__entry-dates">{dateRange || copy.datesPending}</p>
      </div>
      {directEditDispatch ? (
        <p className="executive-showcase__bullets executive-showcase__bullets--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="executive-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{highlightMetrics(line, showMetrics)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
```

`showMetrics` is read from the enclosing component's scope in the original
read-only branch — since this function is now module-scope (not a closure
over the component), it must be passed in explicitly, as shown above in
the function's own parameter destructuring. Every call site (Step 5 below)
passes it through.

- [ ] **Step 4: Style the new `--editing` class in the same step it's introduced**

Add to `src/styles/templates/executive.css`, directly below the existing
`.executive-showcase__bullets` rule (find it with
`grep -n "executive-showcase__bullets " src/styles/templates/executive.css`
first to confirm the exact surrounding rule to insert after):

```css
.executive-showcase__bullets--editing {
  white-space: pre-line;
}
```

Grep-prove the class name matches exactly between the JSX and the CSS:

```bash
grep -n "bullets--editing" src/components/templates/ExecutiveShowcase.jsx src/styles/templates/executive.css
```

Expected: one match in the JSX (the `className` on the editing `<p>`), one
match in the CSS (the new rule's selector) — both spelled
`executive-showcase__bullets--editing`.

- [ ] **Step 5: Replace the Experience section's render logic**

Replace the current `key === 'experience'` block in `renderMainSection`:

```jsx
    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement="main" title={copy.experience}>
          <div className="executive-showcase__entry-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []

                return (
                  <div key={`${item.role}-${item.company}-${index}`} className="executive-showcase__entry" data-export-card="true">
                    <div className="executive-showcase__entry-row">
                      <div className="min-w-0">
                        <p className="executive-showcase__entry-role">{item.role || copy.untitledRole}</p>
                        {item.company || item.location ? (
                          <p className="executive-showcase__entry-meta">
                            {[item.company, item.location].filter(Boolean).join(' · ')}
                          </p>
                        ) : null}
                      </div>
                      <p className="executive-showcase__entry-dates">{dateRange || copy.datesPending}</p>
                    </div>
                    {bullets.length > 0 ? (
                      <ul className="executive-showcase__bullets">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{highlightMetrics(line, showMetrics)}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="executive-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }
```

with:

```jsx
    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement="main" title={copy.experience}>
          <div className="executive-showcase__entry-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
              >
                {(item, index) => renderExperienceEntry(item, index, { directEditDispatch, copy, showMetrics })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, { directEditDispatch, copy, showMetrics }))
            ) : (
              <p className="executive-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
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

In the dev server, switch to Executive + Direct Edit, confirm: role and
company are editable in place; location and dates stay read-only text;
typing a multi-line description (seed it via Classic mode's textarea,
switch to Direct Edit, append at the end with `Ctrl+End` — never
type-then-Enter, per the project's own proven-safe test pattern) survives
the round trip back to Classic mode without collapsing to one line;
adding/removing/dragging entries works via `EditableList`'s existing
add/remove/drag controls; the `Leadership` section (a separate, similarly-
shaped array this round does NOT touch) remains fully read-only.

- [ ] **Step 8: Commit**

```bash
git add src/components/templates/ExecutiveShowcase.jsx src/styles/templates/executive.css
git commit -m "Wire Executive's Experience entries into Direct Edit mode"
```

---

### Task 3: Skills — reusing the categorized chip design from Round 5

**Files:**
- Modify: `src/components/templates/ExecutiveShowcase.jsx`

**Interfaces:**
- Consumes: `EditableCategorizedChip` (`src/components/EditableList.jsx`,
  already built and shipped in Round 5 — props `categories`, `addLabel`;
  `categories` shape: `[{ key, label, items: [{ skill, index }] }]`),
  `parseSkillCategories` (`src/components/templates/shared.jsx`, already
  imported in this file).
- Produces: nothing new — this task is pure reuse, no new shared code.

**Design note (read before implementing):** Unlike Compact, where Skills
rendered as comma-separated text and needed a genuinely new visual
treatment, Executive's read-only Skills section ALREADY renders one
`<span data-export-skill="true" className="executive-showcase__tag">` per
skill, grouped under a `.executive-showcase__skill-group-label`, inside a
`.executive-showcase__tag-row` — visually, this is already a chip layout.
`EditableCategorizedChip` (built for Compact, unchanged since) renders
exactly this shape (a group wrapper + label + a row of chip buttons), so
this task is straightforward reuse: compute the same `{skill, index}`-
tagged categories Compact computed, using the exact same "per-text queue"
approach (fixed during Round 5's final review to handle duplicate skill
text correctly — do not regress to a plain `Map`), and swap in
`EditableCategorizedChip` for the read-only tag row when editing.

One interaction specific to Executive, not present on Compact: Skills is a
SECONDARY (sidebar) section, and the whole sidebar's *section list*
(`coreStrengths`/`skills`/`certificates`/`languages`/`memberships`/`links`)
is hidden entirely when the template's `showSidebar` config toggle is off
(`showcaseConfig.showSidebar !== false` — see `ExecutiveShowcase.jsx`
around where `showSidebar` is read). This is pre-existing behavior,
unrelated to Direct Edit, and this task does not change it — if a user has
turned the sidebar off, Skills (along with every other secondary section)
simply doesn't render, in Direct Edit or Classic mode alike, exactly as
today.

- [ ] **Step 1: Import `EditableCategorizedChip`**

Change the existing `EditableList` import (added in Task 2) to also pull
in the categorized-chip component:

```jsx
import EditableList, { EditableCategorizedChip } from '../EditableList'
```

- [ ] **Step 2: Compute `editableSkillCategories`**

Add directly below the existing `skillCategories` computation:

```jsx
  const skillCategories = useMemo(
    () => parseSkillCategories(snapshot.skills, isFinnish),
    [snapshot.skills, isFinnish],
  )
  // Editing-branch-only: the same categorization, but computed off the raw
  // formData.skills array (not the trimmed snapshot) and with each item's
  // ORIGINAL flat-array index attached via a per-text QUEUE (not a plain
  // Map — a Map collapses duplicate skill text to one index, which Round
  // 5's final review found reachable via the app's JSON-import feature
  // and fixed; this task reuses that fix, not the earlier, unsafe version).
  const editableSkillCategories = useMemo(() => {
    const grouped = parseSkillCategories(formData.skills, isFinnish)
    const indexQueueByText = new Map()
    formData.skills.forEach((skill, index) => {
      const queue = indexQueueByText.get(skill)
      if (queue) {
        queue.push(index)
      } else {
        indexQueueByText.set(skill, [index])
      }
    })

    return grouped.map((cat) => ({
      ...cat,
      items: cat.items.map((skill) => ({ skill, index: indexQueueByText.get(skill).shift() })),
    }))
  }, [formData.skills, isFinnish])
```

- [ ] **Step 3: Wire the Skills section**

Replace the current `key === 'skills'` block in `renderSidebarSection`:

```jsx
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement="side" title={copy.skills}>
          {skillCategories.length > 0 ? (
            skillCategories.map((cat) => (
              <div key={cat.key} className="executive-showcase__skill-group">
                <p className="executive-showcase__skill-group-label">{cat.label}</p>
                <div className="executive-showcase__tag-row">
                  {cat.items.map((skill) => (
                    <span key={skill} data-export-skill="true" className="executive-showcase__tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="executive-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }
```

with:

```jsx
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement="side" title={copy.skills}>
          {directEditDispatch ? null : skillCategories.length > 0 ? (
            skillCategories.map((cat) => (
              <div key={cat.key} className="executive-showcase__skill-group">
                <p className="executive-showcase__skill-group-label">{cat.label}</p>
                <div className="executive-showcase__tag-row">
                  {cat.items.map((skill) => (
                    <span key={skill} data-export-skill="true" className="executive-showcase__tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="executive-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
          {directEditDispatch ? (
            <div className="executive-showcase__skill-group">
              <EditableCategorizedChip
                categories={editableSkillCategories}
                addLabel={isFinnish ? '+ Lisää' : '+ Add'}
              />
            </div>
          ) : null}
        </Section>
      )
    }
```

The read-only render is now fully gated behind `directEditDispatch ? null
: ...` (matches the exact shape of the fix for the Phase 1 final review's
Critical #1 — every skill rendering twice — so this template can't ship
that bug on day one). Reusing the existing `.executive-showcase__skill-group`
wrapper class for the editing block (rather than inventing a new one) is
deliberate — it already provides the right spacing between the Skills
section and neighboring sidebar sections, and `EditableCategorizedChip`'s
own internal classes (`direct-edit-chip-group` etc., styled globally in
`src/styles/direct-edit.css` since Round 5) render inside it without
needing any Executive-specific CSS.

- [ ] **Step 4: Verify no build/lint errors**

Run:
```bash
npm run lint
```
Expected: clean.

- [ ] **Step 5: Manual smoke check**

In the dev server, switch to Executive + Direct Edit: confirm skills
render grouped under category labels; confirm no skill renders twice (open
devtools, confirm zero `[data-export-skill="true"]` elements are present
while editing); click "+ Add" and confirm a new "New skill N" chip
appears; click a chip to remove it and confirm the CORRECT skill
disappears (cross-check against Classic mode's skill tag list before and
after); toggle the template's "Show sidebar" setting off in Classic mode
and confirm Skills (and every other secondary section) simply disappears
from Direct Edit too, matching Classic mode's own behavior.

- [ ] **Step 6: Commit**

```bash
git add src/components/templates/ExecutiveShowcase.jsx
git commit -m "Reuse categorized-chip Skills editing for Executive"
```

---

### Task 4: Allowlist + e2e coverage + full verification pass

**Files:**
- Modify: `src/utils/directEdit.js`
- Modify: `e2e/direct-edit.spec.js`
- Modify: `changes.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: `DIRECT_EDIT_SUPPORTED_TEMPLATES` (`src/utils/directEdit.js`),
  `runDirectEditDemoDataChecks`/`runDirectEditEmptyPlaceholderCheck`/
  `DIRECT_EDIT_TEMPLATES` (`e2e/direct-edit.spec.js`), `selectTemplate`
  helper (`e2e/direct-edit.spec.js:7`).
- Produces: nothing consumed by later work — this is the round's last task.

**Design note:** Unlike Compact (which needed a brand-new dedicated e2e
test for categorized-skill index correctness, since it was the first
template to introduce that mechanism), Executive reuses a mechanism
already proven correct and tested in Round 5. No new dedicated test is
needed this round — adding Executive's row to the existing parameterized
loop is sufficient, exactly as Rounds 1-4 did for the shared
`directEditExperienceEntry.jsx` mechanism before Round 5 introduced
something new.

- [ ] **Step 1: Add `'executive'` to the allowlist**

In `src/utils/directEdit.js`:

```js
export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional', 'editorial', 'portrait', 'timeline', 'compact', 'executive']
```

- [ ] **Step 2: Run the allowlist regression check**

Run:
```bash
npm run check:direct-edit
```
Expected: all checks pass (`'executive'` is a real id in `cvTemplates`, no
duplicates).

- [ ] **Step 3: Verify Executive's real contact-row values before trusting this plan's guess**

Before adding Executive's row to the e2e loop, open the CURRENT
`src/components/templates/ExecutiveShowcase.jsx` (after Tasks 1-3's edits)
and confirm the actual order of the `directEditContactFields` array (added
in Task 1) and the contact row's wrapper class. This plan's own reading of
the file (before any edits) shows `directEditContactFields` ordered
`['email', 'phone', 'location']` with English labels `'Email'`/`'Phone'`/
`'Location'`, and the wrapper class is `.executive-showcase__contact`
(suffix `'contact'`) — but re-verify against the real file rather than
trusting this guess, the same discipline Round 5's Task 4 used.

- [ ] **Step 4: Add Executive's row to the shared smoke-test loop**

In `e2e/direct-edit.spec.js`, extend the `DIRECT_EDIT_TEMPLATES` array
(currently ending after Compact):

```js
  const DIRECT_EDIT_TEMPLATES = [
    { label: 'Classic Professional', classPrefix: 'classic-professional-showcase', contactRowSuffix: 'contact', labelOrder: ['Phone', 'Email', 'Location'] },
    { label: 'Editorial', classPrefix: 'editorial-showcase' },
    { label: 'Portrait', classPrefix: 'portrait-showcase' },
    { label: 'Modern Timeline', classPrefix: 'timeline-showcase', contactRowSuffix: 'contact', labelOrder: ['Phone', 'Email', 'Location'] },
    { label: 'Compact', classPrefix: 'compact-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
    { label: 'Executive', classPrefix: 'executive-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
  ]
```

Use the values you actually verified in Step 3, not this guess, if they
differ. This one array addition automatically runs both
`runDirectEditDemoDataChecks('Executive', 'executive-showcase')` and
`runDirectEditEmptyPlaceholderCheck('Executive', 'executive-showcase',
'contact', ['Email', 'Phone', 'Location'])` via the existing loop at the
bottom of the file.

- [ ] **Step 5: Run the Executive-related e2e tests in isolation first**

Run:
```bash
npx playwright test e2e/direct-edit.spec.js -g "Executive"
```
Expected: both loop-generated tests pass — `Executive: name persists,
skills render once as chips, and a multi-line description survives
editing` and `Executive: an empty contact field shows its placeholder
label, not a stray separator, in Direct Edit mode`.

If the empty-placeholder test fails on the `labelOrder`/`contactRowSuffix`
assertion, re-check `ExecutiveShowcase.jsx`'s actual
`directEditContactFields` order and wrapper class (Step 3) rather than
assuming this plan's guess — fix the array in this test to match reality,
not the other way around.

- [ ] **Step 6: Run the full e2e suite**

Run:
```bash
npm run test:e2e
```
Expected: all tests pass. If the pre-existing, documented, unrelated
intermittent flake on `'the footer never overlaps the CV preview in
Direct Edit mode'` appears under parallel-worker conditions, re-run in
isolation to confirm it's the known flake, not a regression.

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
the style of the Round 5 entry directly below it:

```markdown
## Direct Edit: Executive is now editable, reusing Round 5's categorized-chip design — 2026-09-18

Executive is now editable in Direct Edit mode (Phase 2 Round 6, the first
`railTable`-family template), with the same scope every prior round has
used: identity, About, Experience, and Skills are all inline-editable in
the live preview. Executive's read-only Skills section already rendered
as grouped chips, so this round reuses `EditableCategorizedChip` (built
for Compact in Round 5) completely unchanged — the first proof that
component generalizes across templates as intended. Executive's
Experience entries needed their own local renderer rather than the
three-template shared module, since its DOM nests role and the company/
location line together inside one wrapper div, with dates as a sibling
of that wrapper rather than of role directly — a real structural
difference from the shared module's flat layout, even though the two
look similar on screen.
```

- [ ] **Step 9: Bump the version**

In `package.json`, bump the patch version (e.g. `1.2.41` → `1.2.42`).

- [ ] **Step 10: Commit**

```bash
git add src/utils/directEdit.js e2e/direct-edit.spec.js changes.md package.json
git commit -m "Add Executive to Direct Edit's supported templates, with e2e coverage"
```

---

## After this plan: final whole-branch review

Per this rollout's established process, dispatch one final whole-branch
review (opus) covering all four tasks' combined diff before considering
Round 6 done. Pay particular attention to: whether `EditableCategorizedChip`
really did generalize cleanly with zero changes (if the implementer found
they needed to modify it, that's a signal worth flagging loudly — it was
designed and reviewed once already, in Round 5, specifically so it
wouldn't need per-template changes); whether the `min-w-0`-wrapper
distinction that justified a local `renderExperienceEntry` instead of the
shared module actually holds up under scrutiny (re-derive it, don't just
trust this plan's claim); and whether Executive's `tagline` field being
left read-only creates any visually jarring inconsistency in the identity
block worth flagging for a future round's consideration (not a defect to
fix this round — a UX observation to record, matching how Round 5's final
review logged non-blocking recommendations for the roadmap).
