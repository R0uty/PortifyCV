# Direct Edit Phase 2 Round 8: Creative Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Creative template's identity, About, Experience, and
Skills sections inline-editable in Direct Edit mode — the third
`railTable`-family template, and the first of this family's *right-rail*
templates (Executive and Modern Orange, Rounds 6-7, were both left-rail).

**Architecture:** Same shape as every prior round: wrap `DirectEditProvider`
locally around `CVPreview.jsx`'s existing Creative delegation branch, thread
a new `directEditDispatch` prop into `CreativeShowcase.jsx`, and wire
`EditableField`/`EditableList`/`EditableChip` using existing `FORM_ACTION`
cases — no new reducer actions, no changes to any shared primitive. Two
things this round confirms rather than invents, and one genuine trap this
round avoids by reading the real file instead of trusting config:

1. **Creative is clean on both standing CSS risks this rollout keeps
   finding on `railTable` templates.** Grepped `creative.css` for
   `text-transform`: only `.creative-showcase__kicker` and
   `.creative-showcase__section-title` are uppercase, both static (never
   `EditableField` hosts) — the name/role/exp-role classes this round wires
   are clean, no override needed. Grepped for `:first-child`/`:last-child`/
   `:first-of-type`/`:last-of-type`: **zero matches anywhere in the file**
   — Experience entries are bordered "cards" spaced via `flex; gap: 0.9rem`
   on `.creative-showcase__exp-list`, not divider borders removed via a
   positional selector, so the `EditableList`-wrapper bug class Rounds 6-7
   both hit (and the roadmap doc now warns about explicitly) simply doesn't
   apply here — no proactive CSS fix needed this round.
2. **`skillsLayout: 'categorized'` in `creative.js`'s config is misleading
   — the actual Showcase renders skills FLAT, with no category labels.**
   `CreativeShowcase.jsx` computes `flatSkills = parseSkillCategories(...).flatMap((cat) => cat.items)`,
   with its own comment explaining why: *"Flattened, not grouped by
   category — the 'Toolkit' pill row has no category labels above it."*
   This is exactly the "config value doesn't predict a bespoke Showcase's
   actual rendering — always open the actual file" trap the Phase 2
   roadmap warned about from Round 1 onward, now confirmed a second time
   (Compact's config said `'flat'` but rendered categorized; Creative's
   says `'categorized'` but renders flat — the inverse case). This round
   reuses the plain `EditableChip` (Round 1's component), **not**
   `EditableCategorizedChip` (Round 5's) — do not assume Creative needs
   the categorized component just because its config or its roadmap-table
   mention ("Creative and Tech Executive and Executive are also this
   rollout's first `categorized`-skills templates") says so.
3. **Experience entries nest role+company inside a `min-w-0` div with
   dates as a sibling of that div** — structurally identical to Executive's
   shape (Round 6), not the 3-template shared module's flat two-children
   row. This round writes its own local `renderExperienceEntry`, matching
   Executive's precedent, confirmed by reading the actual JSX before
   assuming either way.

**Tech Stack:** React 19, hand-rolled `contentEditable` primitives
(`EditableField`/`EditableList`/`EditableChip`), Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`
(Phase 2 rollout roadmap — see its "Known risk to fix proactively" section,
now carrying three standing risks; this round is checked against all three
and confirmed clean on two of them by reading the real files, not assumed).

## Global Constraints

- No new `cvFormReducer` actions — every dispatch uses an existing
  `FORM_ACTION` case (`SET_ROOT_FIELD`, `UPDATE_ARRAY_ITEM`,
  `ADD_ARRAY_ITEM`, `REMOVE_ARRAY_ITEM`, `MOVE_ARRAY_ITEM_TO_INDEX`,
  `ADD_SKILL`, `REMOVE_SKILL`).
- Commits carry only the repo's own git identity (`r0uty
  <yasa.sheva@gmail.com>`) — never an AI/Claude co-authorship trailer.
- Scope is identity (name/title/contact) + About + Experience + Skills only
  — Projects/Education/Certificates/Links/Languages/Interests all stay
  read-only, exactly as on every other wired template. Creative's `tagline`
  field (a real root field, rendered between the title and the contact
  row) is deliberately OUT of scope too, matching the same boundary every
  prior round drew around this exact field on Executive/Modern Orange.
  Creative's About section also renders up to 3 `coreStrengths` titles as
  a read-only pill row directly below the About paragraph, in the SAME
  `Section` — leave that pill row completely untouched; only the About
  paragraph text itself becomes editable.
- `formData` (raw) is what gets passed as `EditableField`'s `value` prop at
  every new call site — its read-only branch already trims internally, so
  never pre-trim before passing it in. For Skills specifically: the
  editing branch must use raw `formData.skills` directly, NOT the
  `flatSkills` variable (which is a `snapshot`-derived, category-bucketed,
  re-ordered array built for the read-only pill row's display order —
  passing it to `EditableChip` would dispatch `REMOVE_SKILL` against the
  wrong index).
- Never pass `className` directly into `EditableField` — always wrap it in
  a plain host element (`<span>`/`<p>`) and put the template's styling
  class on that wrapper instead (Round 2's Editorial lesson). Creative's
  contact-item spans have no icon child (unlike every other wired
  template) — just `<span className="creative-showcase__contact-item">{value}</span>`
  — so the wrap is a single level: keep the class on that outer span, put
  `EditableField` inside it with no className of its own.
- Any new CSS class introduced for an editing-only branch must be styled in
  the *same task* that introduces it, with a grep proving the class name in
  the JSX and the CSS match exactly (Round 1's lesson).
- Before wiring any identity/title `EditableField`, grep the template's
  stylesheet for `text-transform` on the class hosting it (and check for
  inherited transforms from ancestor classes), in the same task (Round 4's
  lesson) — already done for this round in the Architecture section above;
  the task should still re-verify live, not skip the check because the
  answer is already known.
- Before wiring `EditableList` around a template's Experience entries, grep
  its stylesheet for `:first-child`/`:last-child`/`:first-of-type`/
  `:last-of-type` on the entry's own class, in the same task (Round 6's
  lesson, now recorded correctly in the roadmap doc) — already done for
  this round above (zero matches); the task should still re-verify live.
- One e2e test per template (reusing the shared parameterized smoke-test
  functions in `e2e/direct-edit.spec.js`, including the `entrySelector`
  parameter added in Round 7 for divider regression coverage — Creative
  has no divider mechanism to guard, so this round's row should NOT pass
  `entrySelector`, matching every pre-Round-7 template's row).

---

## File structure

- **Modify** `src/components/CVPreview.jsx` — wrap the existing Creative
  delegation branch (`variant === 'creative' && !atsFriendlyMode`,
  currently `CVPreview.jsx:123-136`) in `DirectEditProvider` and pass
  `directEditDispatch` into `CreativeShowcase`.
- **Modify** `src/components/templates/CreativeShowcase.jsx` — accept
  `directEditDispatch`, wire identity/contact/About/Experience/Skills, add
  a local `renderExperienceEntry` (module-scope, matching Executive's
  nesting, not the shared `directEditExperienceEntry.jsx`).
- **Modify** `src/utils/directEdit.js` — add `'creative'` to
  `DIRECT_EDIT_SUPPORTED_TEMPLATES`.
- **Modify** `e2e/direct-edit.spec.js` — add Creative's row to the shared
  `DIRECT_EDIT_TEMPLATES` smoke-test loop.
- **Modify** `changes.md` — one new entry, matching every prior round's
  own changelog entry.
- **Modify** `package.json` — patch version bump.
- **Add** `docs/superpowers/plans/2026-09-19-direct-edit-creative.md` —
  this plan file itself, committed as part of Task 4 (Round 6's plan sat
  uncommitted for a full session before being caught and fixed — see
  Round 7's memory; every round's Task 4 must explicitly `git add` this
  file, not rely on remembering to do it separately).

No changes to `src/components/EditableList.jsx`, `src/styles/direct-edit.css`,
or `src/components/templates/shared.jsx` this round — this round reuses the
flat `EditableChip` (unmodified since Round 1) and needs no categorized-chip
machinery and no divider-CSS fix.

---

### Task 1: Identity (name/title/contact) + About

**Files:**
- Modify: `src/components/CVPreview.jsx:123-136` (Creative delegation branch)
- Modify: `src/components/templates/CreativeShowcase.jsx`

**Interfaces:**
- Consumes: `DirectEditProvider` (`src/components/DirectEditContext.jsx`),
  `EditableField` (`src/components/EditableField.jsx`, props `as`, `path`,
  `value`, `placeholder`, `multiline`).
- Produces: `CreativeShowcase` now accepts a `directEditDispatch` prop
  (function or `null`) — Task 2 and Task 3 read the same prop from the same
  component signature.

- [ ] **Step 1: Grep Creative's stylesheet for `text-transform` on the identity classes before wiring anything**

Run:
```bash
grep -n -B3 "text-transform" src/styles/templates/creative.css
```

Expected: two matches, `.creative-showcase__kicker` and
`.creative-showcase__section-title` — **not** on `.creative-showcase__name`,
`.creative-showcase__role`, or `.creative-showcase__contact-item` (the
classes this task wires as `EditableField` hosts). Confirm this by eye
before continuing, including checking for an inherited transform from
`.creative-showcase__header` (none expected). As of this plan's writing,
no override is needed — this step exists to re-verify against the live
file, not to skip the check because the answer is already known.

- [ ] **Step 2: Wrap the Creative delegation branch in `DirectEditProvider` and pass `directEditDispatch`**

In `src/components/CVPreview.jsx`, replace the current Creative branch:

```jsx
  if (variant === 'creative' && !atsFriendlyMode) {
    return (
      <Suspense fallback={null}>
        <CreativeShowcase
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

with:

```jsx
  if (variant === 'creative' && !atsFriendlyMode) {
    return (
      <DirectEditProvider isEditing={Boolean(directEditDispatch)} dispatchFormData={directEditDispatch}>
        <Suspense fallback={null}>
          <CreativeShowcase
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

(`DirectEditProvider` is already imported at the top of `CVPreview.jsx` —
every other wired template's branch uses the same import.)

- [ ] **Step 3: Accept `directEditDispatch` in `CreativeShowcase`'s signature**

In `src/components/templates/CreativeShowcase.jsx`, change the component
signature from:

```jsx
export default function CreativeShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  headingColor = null,
  accentColor = CREATIVE_DEFAULT_ACCENT_COLOR,
}) {
```

to:

```jsx
export default function CreativeShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  headingColor = null,
  accentColor = CREATIVE_DEFAULT_ACCENT_COLOR,
  directEditDispatch = null,
}) {
```

- [ ] **Step 4: Import `EditableField` and add a `directEditContactFields` array**

Add to the top import block:

```jsx
import EditableField from '../EditableField'
```

Add a new array right after the existing `personalContactItems` definition
(the read-only branch keeps using `personalContactItems`, which filters
out empty fields — this new array is edit-mode-only, built from raw
`formData.*`, and always includes all three fields):

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
          <h1 className="creative-showcase__name">{fullName}</h1>
          <p className="creative-showcase__role">{title}</p>
          {tagline ? <p className="creative-showcase__tagline">{tagline}</p> : null}
          {personalContactItems.length > 0 ? (
            <div className="creative-showcase__contact">
              {personalContactItems.map(([key, value]) => (
                <span key={key} className="creative-showcase__contact-item">{value}</span>
              ))}
            </div>
          ) : null}
```

with:

```jsx
          <h1 className="creative-showcase__name">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            ) : fullName}
          </h1>
          <p className="creative-showcase__role">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'title' }}
                value={formData.title}
                placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
              />
            ) : title}
          </p>
          {tagline ? <p className="creative-showcase__tagline">{tagline}</p> : null}
          {directEditDispatch || personalContactItems.length > 0 ? (
            <div className="creative-showcase__contact">
              {(directEditDispatch ? directEditContactFields : personalContactItems).map(([key, value, placeholderLabel]) => (
                <span key={key} className="creative-showcase__contact-item">
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

The placeholder for the title EditableField is the generic `'Professional
Title'`/`'Ammattinimike'` string — deliberately NOT Creative's own
whimsical read-only fallback (`'Creative Problem Solver'`), matching the
established convention from Compact's Round 5 plan (a placeholder should
say "type here", not pretend to be real content). `tagline` is left
completely untouched (out of scope per the Global Constraints).

- [ ] **Step 6: Wire About (leaving the coreStrengths pill row untouched)**

The About section already renders through `renderMainSection('about')`
(gated by `mainSectionKeys` — the standard case). Replace:

```jsx
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement="main" number={sectionNumber(key)} title={copy.about}>
          <p className="creative-showcase__intro">{about}</p>
          {snapshot.coreStrengths.length > 0 ? (
            <div className="creative-showcase__pill-row">
              {snapshot.coreStrengths.slice(0, 3).map((item, index) => (
                item.title ? (
                  <span key={`${item.title}-${index}`} className="creative-showcase__pill">
                    {item.title}
                  </span>
                ) : null
              ))}
            </div>
          ) : null}
        </Section>
      )
    }
```

with:

```jsx
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement="main" number={sectionNumber(key)} title={copy.about}>
          <p className="creative-showcase__intro">
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
          {snapshot.coreStrengths.length > 0 ? (
            <div className="creative-showcase__pill-row">
              {snapshot.coreStrengths.slice(0, 3).map((item, index) => (
                item.title ? (
                  <span key={`${item.title}-${index}`} className="creative-showcase__pill">
                    {item.title}
                  </span>
                ) : null
              ))}
            </div>
          ) : null}
        </Section>
      )
    }
```

The `coreStrengths` pill row is completely unchanged — it always renders
from `snapshot` regardless of `directEditDispatch`, exactly as before this
task.

- [ ] **Step 7: Verify no build/lint errors**

Run:
```bash
npm run lint
```
Expected: no new errors in `CVPreview.jsx` or `CreativeShowcase.jsx`.

- [ ] **Step 8: Manual smoke check in the dev server**

Run `npm run dev`, open the app, load the demo CV, switch to the Creative
template, switch to Direct Edit mode, and confirm: the name is editable in
place, the title is editable (placeholder reads "Professional Title" when
empty, not "Creative Problem Solver"), all three contact fields show (with
placeholders for any that are empty), About is editable, and the
coreStrengths pill row (if the demo CV has any) still renders unaffected
below the About text. Also confirm Classic mode is completely unaffected.

- [ ] **Step 9: Commit**

```bash
git add src/components/CVPreview.jsx src/components/templates/CreativeShowcase.jsx
git commit -m "Wire Creative's identity, contact, and About fields into Direct Edit mode"
```

---

### Task 2: Experience

**Files:**
- Modify: `src/components/templates/CreativeShowcase.jsx`

**Interfaces:**
- Consumes: `EditableList` (`src/components/EditableList.jsx`, props
  `section`, `items`, `addLabel`, render-prop `children(item, index)`),
  `EditableField` (imported in Task 1), `directEditDispatch` (from Task 1's
  component signature).
- Produces: none consumed by later tasks — Skills (Task 3) is independent.

- [ ] **Step 1: Confirm Creative's Experience entry shape and the absence of any positional-selector risk**

Run:
```bash
sed -n '150,192p' src/components/templates/CreativeShowcase.jsx
grep -n ":first-child\|:last-child\|:first-of-type\|:last-of-type" src/styles/templates/creative.css
```

Confirm the read-only shape: `.creative-showcase__exp-row` contains a
`min-w-0` div wrapping role AND the conditional company/location meta
paragraph together, with `.creative-showcase__exp-dates` as a sibling of
that `min-w-0` div — the same nesting Executive (Round 6) has, genuinely
different from the shared `directEditExperienceEntry.jsx` module's flat
two-children row. Confirm the grep returns NO matches — Creative's entries
are spaced via `flex; gap` on `.creative-showcase__exp-list`
(`creative.css:272-277`), with a full border on every card
(`.creative-showcase__exp-card`, `creative.css:279-285`), not a
divider-removal rule that could break under `EditableList`'s wrapper div.
**No CSS fix is needed this task** — unlike Rounds 6-7, this template has
no instance of that bug class to proactively fix.

- [ ] **Step 2: Add the `copy` entries this task needs**

Add two new keys to the `copy` object (currently lines 116-128):

```jsx
  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    about: isFinnish ? 'Hei' : 'Hello',
    experience: isFinnish ? 'Työ' : 'Work',
    projects: isFinnish ? 'Projektit' : 'Projects',
    education: isFinnish ? 'Koulutus' : 'School',
    skills: isFinnish ? 'Työkalut' : 'Toolkit',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certificates',
    links: isFinnish ? 'Löydä minut' : 'Find me',
    languages: isFinnish ? 'Kielet' : 'Languages',
    interests: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
  }
```

- [ ] **Step 3: Import `EditableList` and write the local `renderExperienceEntry`**

Add to the import block:

```jsx
import EditableList from '../EditableList'
```

Add this function at module scope, directly below `splitToBullets`:

```jsx
// Creative's own Experience-entry renderer — deliberately NOT
// directEditExperienceEntry.jsx (the shared module for Classic
// Professional/Editorial/Portrait). Creative's read-only shape nests role
// AND the company/location meta line together inside one `min-w-0` div,
// with dates as a sibling of THAT div (not of role directly) — the same
// structural shape Executive (Round 6) has, genuinely different from the
// shared module's flat two-children entry-row. Only role and company are
// independently editable, matching the shared module's own precedent —
// location stays read-only-appended text. `index` is always
// formData.experience-relative (only ever read inside
// directEditDispatch-gated branches below) — never assume it lines up
// with snapshot.experience's own (filtered) indices in the read-only
// call site.
function renderExperienceEntry(item, index, { directEditDispatch, copy }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <div
      key={`${item.role}-${item.company}-${index}`}
      className="creative-showcase__exp-card"
      data-export-card="true"
    >
      <div className="creative-showcase__exp-row">
        <div className="min-w-0">
          <p className="creative-showcase__exp-role">
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
            <p className="creative-showcase__exp-company">
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
        <p className="creative-showcase__exp-dates">{dateRange || copy.datesPending}</p>
      </div>
      {directEditDispatch ? (
        <p className="creative-showcase__exp-desc creative-showcase__exp-desc--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="creative-showcase__exp-desc">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 4: Style the new `--editing` class in the same step it's introduced**

Add to `src/styles/templates/creative.css`, directly below the existing
`.creative-showcase__exp-desc li` rule. Its typography (confirmed by
reading the live file — don't re-guess, but do re-verify the values are
still current before pasting this in) is `font-size: var(--tpl-body-size);
line-height: 1.6; color: var(--cr-ink-muted);` — the editing branch's
`<span>`-in-`<p>` shape has no `<li>` at all, so without re-declaring
these explicitly it would silently inherit the wrong (larger, default-
colored) type, exactly the gap Round 7's own final review found and fixed
on two other templates:

```css
.creative-showcase__exp-desc--editing {
  white-space: pre-line;
  display: block;
  padding-left: 0;
  font-size: var(--tpl-body-size);
  line-height: 1.6;
  color: var(--cr-ink-muted);
}
```

Grep-prove the class name matches exactly between the JSX and the CSS:

```bash
grep -n "exp-desc--editing" src/components/templates/CreativeShowcase.jsx src/styles/templates/creative.css
```

Expected: one match in the JSX, one match in the CSS, both spelled
`creative-showcase__exp-desc--editing`.

- [ ] **Step 5: Replace the Experience section's render logic**

Replace the current `key === 'experience'` block in `renderMainSection`:

```jsx
    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement="main" number={sectionNumber(key)} title={copy.experience}>
          <div className="creative-showcase__exp-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []

                return (
                  <div
                    key={`${item.role}-${item.company}-${index}`}
                    className="creative-showcase__exp-card"
                    data-export-card="true"
                  >
                    <div className="creative-showcase__exp-row">
                      <div className="min-w-0">
                        <p className="creative-showcase__exp-role">{item.role || copy.untitledRole}</p>
                        {item.company || item.location ? (
                          <p className="creative-showcase__exp-company">
                            {[item.company, item.location].filter(Boolean).join(' · ')}
                          </p>
                        ) : null}
                      </div>
                      <p className="creative-showcase__exp-dates">{dateRange || copy.datesPending}</p>
                    </div>
                    {bullets.length > 0 ? (
                      <ul className="creative-showcase__exp-desc">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="creative-showcase__empty">
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
        <Section key={key} id="experience" placement="main" number={sectionNumber(key)} title={copy.experience}>
          <div className="creative-showcase__exp-list">
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
              <p className="creative-showcase__empty">
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

In the dev server, switch to Creative + Direct Edit, confirm: role and
company are editable in place; location and dates stay read-only text;
each entry keeps its own full bordered "card" look (border, shadow, accent
left-edge) regardless of edit mode, since spacing here is `gap`-based, not
divider-based — there should be nothing to visually break, unlike Rounds
6-7's divider bug; typing a multi-line description (seed it via Classic
mode's textarea, switch to Direct Edit, append at the end with `Ctrl+End`)
survives the round trip back to Classic mode without collapsing to one
line and renders at the correct type size (not oversized); adding/
removing/dragging entries works via `EditableList`'s existing controls.

- [ ] **Step 8: Commit**

```bash
git add src/components/templates/CreativeShowcase.jsx src/styles/templates/creative.css
git commit -m "Wire Creative's Experience entries into Direct Edit mode"
```

---

### Task 3: Skills — flat, reusing the Round 1 `EditableChip`

**Files:**
- Modify: `src/components/templates/CreativeShowcase.jsx`

**Interfaces:**
- Consumes: `EditableChip` (`src/components/EditableList.jsx`, already
  built in Round 1 — props `skills`, `addLabel`).
- Produces: nothing new — pure reuse, no new shared code.

**Design note (read before implementing):** Despite `creative.js`'s config
saying `skillsLayout: 'categorized'`, the actual read-only render is a flat
pill row with NO category grouping or labels (`flatSkills`, computed via
`parseSkillCategories(...).flatMap((cat) => cat.items)` purely to get a
consistent display ORDER, not to group visually — see the file's own
comment above that line). This means Task 3 is the SAME kind of reuse
Rounds 1-4 and 7 did for their own flat-skills sections — swap in the
plain `EditableChip`. **Do not use `formData.skills` filtered through
`parseSkillCategories`/`flatMap` for the editing branch** — pass raw
`formData.skills` directly to `EditableChip`, exactly as every other
flat-skills template does, so `REMOVE_SKILL`'s dispatched index lines up
with the real array position (the read-only `flatSkills` variable
re-orders items by category-match for display, which would desync the
index if reused for editing).

- [ ] **Step 1: Import `EditableChip`**

Change the existing `EditableList` import (added in Task 2) to also pull in
the flat chip component:

```jsx
import EditableList, { EditableChip } from '../EditableList'
```

- [ ] **Step 2: Wire the Skills section**

Replace the current `key === 'skills'` block in `renderSidebarSection`:

```jsx
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement="side" number={sectionNumber(key)} title={copy.skills}>
          {flatSkills.length > 0 ? (
            <div className="creative-showcase__pill-row">
              {flatSkills.map((skill) => (
                <span key={skill} data-export-skill="true" className="creative-showcase__pill">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="creative-showcase__empty">
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
        <Section key={key} id="skills" placement="side" number={sectionNumber(key)} title={copy.skills}>
          <div className="creative-showcase__pill-row">
            {directEditDispatch ? null : flatSkills.length > 0 ? (
              flatSkills.map((skill) => (
                <span key={skill} data-export-skill="true" className="creative-showcase__pill">
                  {skill}
                </span>
              ))
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
              </p>
            )}
            {directEditDispatch ? (
              <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
            ) : null}
          </div>
        </Section>
      )
    }
```

Note the empty-state `<p>` moved inside the wrapping `.pill-row` div in
this version (it was a sibling of it before) — this is a deliberate,
harmless restructuring so the div always exists as a stable mount point
for both the read-only pills and the editing chips, matching the pattern
other rounds use when a template's read-only branch didn't originally
wrap its empty state in the same container. Verify visually in Step 4 that
this doesn't change the empty-state's read-only appearance (it shouldn't
— `.pill-row`'s only CSS is flex-wrap layout, and a lone `<p>` child
inside a flex container renders identically to one outside it here).

- [ ] **Step 3: Verify no build/lint errors**

Run:
```bash
npm run lint
```
Expected: clean.

- [ ] **Step 4: Manual smoke check**

In the dev server, switch to Creative + Direct Edit: confirm skills render
as plain removable chips (no pill styling while editing — expected, matches
every other flat-skills template); confirm no skill renders twice (zero
`[data-export-skill="true"]` elements present while editing); click "+ Add"
and confirm a new "New skill N" chip appears; click a chip to remove it and
confirm the CORRECT skill disappears (cross-check against Classic mode's
skill tag list before and after — this is the check that would catch a
`flatSkills`-vs-`formData.skills` index mismatch if Step 2 used the wrong
array); switch back to Classic mode and confirm the read-only pill-row
visual (and its empty-state message, if you clear all skills) both still
render exactly as before this task.

- [ ] **Step 5: Commit**

```bash
git add src/components/templates/CreativeShowcase.jsx
git commit -m "Wire Creative's Skills editing (flat chips, Round 1 pattern)"
```

---

### Task 4: Allowlist + e2e coverage + full verification pass

**Files:**
- Modify: `src/utils/directEdit.js`
- Modify: `e2e/direct-edit.spec.js`
- Modify: `changes.md`
- Modify: `package.json`
- Add: `docs/superpowers/plans/2026-09-19-direct-edit-creative.md` (this
  plan file itself — commit it as part of this task; do not leave it
  untracked, per the lesson Round 6's plan taught the hard way).

**Interfaces:**
- Consumes: `DIRECT_EDIT_SUPPORTED_TEMPLATES` (`src/utils/directEdit.js`),
  `runDirectEditDemoDataChecks`/`runDirectEditEmptyPlaceholderCheck`/
  `DIRECT_EDIT_TEMPLATES` (`e2e/direct-edit.spec.js`), `selectTemplate`
  helper (`e2e/direct-edit.spec.js:7`).
- Produces: nothing consumed by later work — this is the round's last task.

**Design note:** No new dedicated e2e test is needed this round — Creative
reuses mechanisms already proven correct (flat `EditableChip` since Round
1, `EditableList` since Phase 1, the standard identity/About/Experience
wiring shape). Adding Creative's row to the existing parameterized loop is
sufficient. Do NOT pass the `entrySelector` parameter (added in Round 7 for
divider-regression coverage) on Creative's row — Creative has no divider
mechanism to guard (confirmed in Task 2: no positional CSS selectors exist
on its Experience entries at all), so passing `entrySelector` would either
be a no-op or, worse, silently assert against the wrong thing if
`.creative-showcase__exp-row` happens to match some unrelated element.

- [ ] **Step 1: Add `'creative'` to the allowlist**

In `src/utils/directEdit.js`:

```js
export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional', 'editorial', 'portrait', 'timeline', 'compact', 'executive', 'modernOrange', 'creative']
```

- [ ] **Step 2: Run the allowlist regression check**

Run:
```bash
npm run check:direct-edit
```
Expected: all checks pass.

- [ ] **Step 3: Verify Creative's real contact-row values before trusting this plan's guess**

Before adding Creative's row to the e2e loop, open the CURRENT
`src/components/templates/CreativeShowcase.jsx` (after Tasks 1-3's edits)
and confirm the actual order of the `directEditContactFields` array (added
in Task 1) and the contact row's wrapper class. This plan's own reading of
the file shows `directEditContactFields` ordered `['email', 'phone',
'location']` with English labels `'Email'`/`'Phone'`/`'Location'`, and the
wrapper class is `.creative-showcase__contact` (suffix `'contact'`) — same
suffix as Compact/Executive but note Creative's own order matches those
two as well (`email, phone, location`), NOT Modern Orange's
`location, email, phone` order. Re-verify against the real file rather
than trusting this guess.

- [ ] **Step 4: Add Creative's row to the shared smoke-test loop**

In `e2e/direct-edit.spec.js`, extend the `DIRECT_EDIT_TEMPLATES` array
(currently ending after Modern Orange):

```js
  const DIRECT_EDIT_TEMPLATES = [
    { label: 'Classic Professional', classPrefix: 'classic-professional-showcase', contactRowSuffix: 'contact', labelOrder: ['Phone', 'Email', 'Location'] },
    { label: 'Editorial', classPrefix: 'editorial-showcase' },
    { label: 'Portrait', classPrefix: 'portrait-showcase' },
    { label: 'Modern Timeline', classPrefix: 'timeline-showcase', contactRowSuffix: 'contact', labelOrder: ['Phone', 'Email', 'Location'] },
    { label: 'Compact', classPrefix: 'compact-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
    { label: 'Executive', classPrefix: 'executive-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'], entrySelector: '.executive-showcase__entry' },
    { label: 'Modern Orange', classPrefix: 'modern-orange-showcase', contactRowSuffix: 'contact-list', labelOrder: ['Location', 'Email', 'Phone'], titleFieldSuffix: 'title-badge', skillsSectionSelector: '.modern-orange-showcase__skill-list', entrySelector: '.modern-orange-showcase__exp-row' },
    { label: 'Creative', classPrefix: 'creative-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
  ]
```

(Copy the exact current array from the live file rather than this
plan's snapshot of it — this plan was written before Task 4 landed, and
the real file is the source of truth for Executive's/Modern Orange's
existing rows. Only Creative's new row, appended last, is this task's
own addition.) Use the values you actually verified in Step 3 for
Creative's own row, not this plan's guess, if they differ.

- [ ] **Step 5: Run the Creative-related e2e tests in isolation first**

Run:
```bash
npx playwright test e2e/direct-edit.spec.js -g "Creative"
```
Expected: both loop-generated tests pass — `Creative: name persists,
skills render once as chips, and a multi-line description survives
editing` and `Creative: an empty contact field shows its placeholder
label, not a stray separator, in Direct Edit mode`.

If the empty-placeholder test fails on the `labelOrder`/`contactRowSuffix`
assertion, re-check `CreativeShowcase.jsx`'s actual `directEditContactFields`
order and wrapper class (Step 3) rather than assuming this plan's guess.

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
the style of the Round 7 entry directly below it:

```markdown
## Direct Edit: Creative is now editable, and clean on both standing CSS risks — 2026-09-19

Creative is now editable in Direct Edit mode (Phase 2 Round 8, the third
`railTable`-family template and the first of its right-rail templates),
with the same scope every prior round has used: identity, About,
Experience, and Skills are all inline-editable in the live preview.
Creative's config claims `skillsLayout: 'categorized'`, but its actual
Showcase deliberately flattens skills with no category labels (confirmed
by reading the real file, not the config) — so this round reuses the
plain `EditableChip` from Round 1, not the categorized component built
for Compact/Executive. Creative is also the first `railTable` template
confirmed clean on both of this family's standing CSS risks: no
`text-transform` on any field this round wires, and — unlike Executive
and Modern Orange — no positional CSS selector on its Experience entries
at all (spacing is `flex; gap`-based, not divider-removal-based), so no
proactive CSS fix was needed this round.
```

- [ ] **Step 9: Bump the version**

In `package.json`, bump the patch version.

- [ ] **Step 10: Commit**

```bash
git add src/utils/directEdit.js e2e/direct-edit.spec.js changes.md package.json docs/superpowers/plans/2026-09-19-direct-edit-creative.md
git commit -m "Add Creative to Direct Edit's supported templates, with e2e coverage"
```

---

## After this plan: final whole-branch review

Per this rollout's established process, dispatch one final whole-branch
review (opus) covering all four tasks' combined diff before considering
Round 8 done. Pay particular attention to: whether the `flatSkills`-vs-
`formData.skills` distinction in Task 3 actually holds under scrutiny (re-
derive it — does `parseSkillCategories(...).flatMap(...)` ever reorder or
drop items relative to `formData.skills`, and does that matter for
anything other than the read-only display order?); whether the "no CSS fix
needed" claim from Task 2 holds up under a live multi-entry check (add 3+
experience entries, confirm nothing visually breaks in Direct Edit mode,
since this round claims immunity rather than proving a fix); and whether
Creative's `coreStrengths` pill row (explicitly left untouched in Task 1)
is genuinely unaffected by anything in this round's diff.
