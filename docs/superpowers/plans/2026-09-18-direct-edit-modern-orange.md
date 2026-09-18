# Direct Edit Phase 2 Round 7: Modern Orange Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Modern Orange template's identity, About, Experience, and
Skills sections inline-editable in Direct Edit mode — the second template in
the `railTable` family, and the first template in the whole rollout that
combines THREE previously-separate lessons in one round: a split-name header
(Modern Timeline's pattern), a flat (not categorized) Skills list inside a
`railTable` layout, and a real, proactively-fixed instance of the
`text-transform` bug class the roadmap specifically predicted for this
family.

**Architecture:** Same shape as every prior round: wrap `DirectEditProvider`
locally around `CVPreview.jsx`'s existing Modern Orange delegation branch,
thread a new `directEditDispatch` prop into `ModernOrangeShowcase.jsx`, and
wire `EditableField`/`EditableList`/`EditableChip` using existing
`FORM_ACTION` cases — no new reducer actions, no changes to any shared
primitive. Four things this round confirms, extends, or fixes proactively
rather than inventing fresh:

1. **The name splits into two visual spans** (`nameFirst`/`nameRest`, joined
   by a `<br>` rather than Modern Timeline's inline color-accent) — the exact
   same shape Modern Timeline hit in Round 4. Wired the same way: a
   read-only-vs-editing ternary (one plain `EditableField` while editing,
   the two-span split while read-only), not an unconditional `EditableField`,
   since `EditableField` can't reproduce a `<br>`-split render on its own.
2. **Skills are genuinely flat** (`skillsLayout: 'flat'` in config, and
   confirmed by reading the actual Showcase — a plain `snapshot.skills.map(...)`
   list, no `parseSkillCategories` anywhere in this file), so this round
   reuses the plain `EditableChip` (Round 1's component), not
   `EditableCategorizedChip` (Round 5's).
3. **The title IS styled `text-transform: uppercase`, with no override** —
   the exact bug class the roadmap predicted for this family
   ("`railTable`... uses uppercase kickers/rail labels heavily — expect to
   hit this again there"), and the first round where the standing grep
   check actually finds a real, unfixed instance before shipping, rather
   than confirming a clean stylesheet. Fixed in the same task that wires
   the title field, per the standing rule.
4. **Experience entries render through `ExperienceRow`, a rail/timeline
   wrapper component** whose CSS uses `.modern-orange-showcase__exp-row:last-child`
   to remove the bottom border/margin from the visually-last entry — this is
   the EXACT bug class Round 6's final review found and fixed on Executive
   (`EditableList` wraps every entry in its own `.direct-edit-entry` div, so
   `:last-child` on the entry's own class matches EVERY entry once wrapped,
   not just the true last one). This round fixes it proactively, in the
   same task that wires Experience, per the note this rollout's roadmap doc
   already carries from Round 6's own final review — not left to be
   rediscovered.

**Tech Stack:** React 19, hand-rolled `contentEditable` primitives
(`EditableField`/`EditableList`/`EditableChip`), Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`
(Phase 2 rollout roadmap — see its "Known risk to fix proactively" section,
which now carries THREE standing risks after Round 6: categorized-skills
chip design — not needed this round, `text-transform`/`innerText`
corruption, and positional-selector breakage under `EditableList` — this
round is checked against, and proactively fixes, the latter two).

## Global Constraints

- No new `cvFormReducer` actions — every dispatch uses an existing
  `FORM_ACTION` case (`SET_ROOT_FIELD`, `UPDATE_ARRAY_ITEM`,
  `ADD_ARRAY_ITEM`, `REMOVE_ARRAY_ITEM`, `MOVE_ARRAY_ITEM_TO_INDEX`,
  `ADD_SKILL`, `REMOVE_SKILL`).
- Commits carry only the repo's own git identity (`r0uty
  <yasa.sheva@gmail.com>`) — never an AI/Claude co-authorship trailer.
- Scope is identity (name/title/contact) + About + Experience + Skills only
  — Education/Projects/Certificates/Languages/website/LinkedIn links all
  stay read-only, exactly as on every other wired template.
- `formData` (raw) is what gets passed as `EditableField`'s `value` prop at
  every new call site — its read-only branch already trims internally, so
  never pre-trim before passing it in.
- Never pass `className` directly into `EditableField` — always wrap it in
  a plain host element (`<span>`/`<p>`) and put the template's styling
  class on that wrapper instead (Round 2's Editorial lesson).
- Any new CSS class introduced for an editing-only branch must be styled in
  the *same task* that introduces it, with a grep proving the class name in
  the JSX and the CSS match exactly (Round 1's lesson).
- Before wiring any identity/title `EditableField`, grep the template's
  stylesheet for `text-transform` on the class hosting it (and check for
  inherited transforms from ancestor classes), in the same task (Round 4's
  lesson). **This round's title field genuinely needs the fix** — see the
  Architecture section above.
- Before wiring `EditableList` around a template's Experience entries, grep
  its stylesheet for `:first-child`/`:last-child`/`:first-of-type`/
  `:last-of-type` on the entry's own class, in the same task (Round 6's
  lesson, now recorded in the roadmap doc). **This round's Experience entry
  genuinely needs the fix** — see the Architecture section above.
- One e2e test per template (reusing the shared parameterized smoke-test
  functions in `e2e/direct-edit.spec.js`).

---

## File structure

- **Modify** `src/components/CVPreview.jsx` — wrap the existing Modern
  Orange delegation branch (`variant === 'modernOrange'`, currently
  `CVPreview.jsx:326-340` — note this branch has NO `!atsFriendlyMode`
  guard, since Modern Orange collapses itself internally in ATS mode
  rather than bypassing to the generic renderer, same as Navy Professional
  and Modern Timeline) in `DirectEditProvider` and pass
  `directEditDispatch` into `ModernOrangeShowcase`.
- **Modify** `src/components/templates/ModernOrangeShowcase.jsx` — accept
  `directEditDispatch`, wire identity (header name/title + sidebar contact
  block, two separate locations)/About/Experience/Skills, add a local
  `renderExperienceEntry` (module-scope, reusing the existing
  `ExperienceRow` wrapper component).
- **Modify** `src/styles/templates/modernOrange.css` — add
  `.modern-orange-showcase__title-badge .direct-edit-field { text-transform: none; }`,
  `.modern-orange-showcase__bullets--editing { white-space: pre-line; }`,
  and the `:last-child`-under-`EditableList` fix for `.exp-row`.
- **Modify** `src/utils/directEdit.js` — add `'modernOrange'` to
  `DIRECT_EDIT_SUPPORTED_TEMPLATES`.
- **Modify** `e2e/direct-edit.spec.js` — add Modern Orange's row to the
  shared `DIRECT_EDIT_TEMPLATES` smoke-test loop.
- **Modify** `changes.md` — one new entry, matching every prior round's
  own changelog entry.
- **Modify** `package.json` — patch version bump.

No changes to `src/components/EditableList.jsx`, `src/styles/direct-edit.css`,
or `src/components/templates/shared.jsx` this round — this round reuses the
flat `EditableChip` (unmodified since Round 1) and needs no categorized-chip
machinery at all.

---

### Task 1: Identity (name/title/contact) + About

**Files:**
- Modify: `src/components/CVPreview.jsx:326-340` (Modern Orange delegation branch)
- Modify: `src/components/templates/ModernOrangeShowcase.jsx`

**Interfaces:**
- Consumes: `DirectEditProvider` (`src/components/DirectEditContext.jsx`),
  `EditableField` (`src/components/EditableField.jsx`, props `as`, `path`,
  `value`, `placeholder`, `multiline`).
- Produces: `ModernOrangeShowcase` now accepts a `directEditDispatch` prop
  (function or `null`) — Task 2 and Task 3 read the same prop from the same
  component signature.

- [ ] **Step 1: Grep Modern Orange's stylesheet for `text-transform` on the identity classes before wiring anything**

Run:
```bash
grep -n -B3 "text-transform" src/styles/templates/modernOrange.css
```

Expected: four matches — `.modern-orange-showcase__sidebar-heading`,
`.modern-orange-showcase__kicker`, `.modern-orange-showcase__title-badge`,
and `.modern-orange-showcase__section-title`. **Unlike every other round so
far, this one is NOT clean**: `.modern-orange-showcase__title-badge` (the
class hosting the title field this task wires) genuinely has
`text-transform: uppercase` with no override. `.modern-orange-showcase__name`
and `.modern-orange-showcase__name-last` do NOT have a transform (confirm
this too), and neither does any ancestor (`.modern-orange-showcase__header`)
— only the title needs the fix.

Add this override to `src/styles/templates/modernOrange.css`, directly
below the existing `.modern-orange-showcase__title-badge` rule:

```css
.modern-orange-showcase__title-badge .direct-edit-field {
  text-transform: none;
}
```

This scopes the fix to ONLY the live editable span — the read-only render
(Classic mode, exports, share links) still shows the title uppercase, since
that text never passes through a `.direct-edit-field` element. Grep-prove
the fix is in place:

```bash
grep -n "title-badge" src/styles/templates/modernOrange.css
```

Expected: the base `.modern-orange-showcase__title-badge` rule plus this
new override rule, both present.

- [ ] **Step 2: Wrap the Modern Orange delegation branch in `DirectEditProvider` and pass `directEditDispatch`**

In `src/components/CVPreview.jsx`, replace the current Modern Orange
branch:

```jsx
  if (variant === 'modernOrange') {
    return (
      <Suspense fallback={null}>
        <ModernOrangeShowcase
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

with:

```jsx
  if (variant === 'modernOrange') {
    return (
      <DirectEditProvider isEditing={Boolean(directEditDispatch)} dispatchFormData={directEditDispatch}>
        <Suspense fallback={null}>
          <ModernOrangeShowcase
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

This branch has no `!atsFriendlyMode` guard (Modern Orange handles ATS mode
internally rather than bypassing to the generic renderer), so the wrap is
unconditional — safe because the app always forces `atsFriendlyMode={false}`
whenever it renders in Direct Edit mode (unchanged, established in Phase 1),
exactly matching Modern Timeline's Round 4 precedent for the same situation.

- [ ] **Step 3: Accept `directEditDispatch` in `ModernOrangeShowcase`'s signature**

In `src/components/templates/ModernOrangeShowcase.jsx`, change the
component signature from:

```jsx
export default function ModernOrangeShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  accentColor = MODERN_ORANGE_DEFAULT_ACCENT_COLOR,
  atsFriendlyMode = false,
  headingColor = null,
}) {
```

to:

```jsx
export default function ModernOrangeShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  accentColor = MODERN_ORANGE_DEFAULT_ACCENT_COLOR,
  atsFriendlyMode = false,
  headingColor = null,
  directEditDispatch = null,
}) {
```

- [ ] **Step 4: Import `EditableField` and add a `directEditContactFields` array**

Add to the top import block:

```jsx
import EditableField from '../EditableField'
```

Add a new array right after the existing `personalItems` definition (the
read-only branch keeps using `personalItems`, which filters out empty
fields — this new array is edit-mode-only, built from raw `formData.*`,
and always includes all three fields):

```jsx
  const personalItems = [
    ['location', snapshot.location],
    ['email', snapshot.email],
    ['phone', snapshot.phone],
  ].filter(([, value]) => value)
  const directEditContactFields = [
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
  ]
```

Note this order (`location, email, phone`) is Modern Orange's own existing
order — different from Compact/Executive's `email, phone, location` — keep
it as-is, don't "normalize" it to match other templates.

- [ ] **Step 5: Wire the name (split-ternary, matching Modern Timeline's pattern) and title (with the text-transform fix from Step 1)**

Replace the header block's name/title JSX (currently):

```jsx
      <header data-export-header="true" className="modern-orange-showcase__header">
        <p className="modern-orange-showcase__kicker" data-export-ignore="true">
          {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
        </p>
        <h1 className="modern-orange-showcase__name">
          <span className="modern-orange-showcase__name-first">{nameFirst}</span>
          {nameRest ? (
            <>
              <br />
              <span className="modern-orange-showcase__name-last">{nameRest}</span>
            </>
          ) : null}
        </h1>
        <span className="modern-orange-showcase__title-badge">{title}</span>
      </header>
```

with:

```jsx
      <header data-export-header="true" className="modern-orange-showcase__header">
        <p className="modern-orange-showcase__kicker" data-export-ignore="true">
          {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
        </p>
        <h1 className="modern-orange-showcase__name">
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'fullName' }}
              value={formData.fullName}
              placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
            />
          ) : (
            <>
              <span className="modern-orange-showcase__name-first">{nameFirst}</span>
              {nameRest ? (
                <>
                  <br />
                  <span className="modern-orange-showcase__name-last">{nameRest}</span>
                </>
              ) : null}
            </>
          )}
        </h1>
        <span className="modern-orange-showcase__title-badge">
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'title' }}
              value={formData.title}
              placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
            />
          ) : title}
        </span>
      </header>
```

While editing, the name collapses to ONE plain editable span (no `<br>`
split, no color-accent) — exactly Modern Timeline's precedent for the same
situation, since `EditableField` can't reproduce a split render across two
separate spans on its own.

- [ ] **Step 6: Wire the contact row (in the sidebar's "Personal Info" block — a separate location from the header)**

Unlike every prior wired template, Modern Orange's contact fields live in
the SIDEBAR's `SidebarBlock`, not the header — name/title are in
`<header>` (Step 5 above), contact is in `<aside>`. Replace the sidebar's
Personal Info block (currently):

```jsx
        {personalItems.length > 0 || websiteUrl || linkedinUrl ? (
          <SidebarBlock title={copy.personalInfo}>
            <div className="modern-orange-showcase__contact-list">
              {personalItems.map(([key, value]) => (
                <div key={key} className="modern-orange-showcase__contact-item">
                  <span className="modern-orange-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  <span>{value}</span>
                </div>
              ))}
              {websiteUrl ? (
                <div className="modern-orange-showcase__contact-item">
                  <span className="modern-orange-showcase__contact-icon" aria-hidden="true">{devIcons.website}</span>
                  <span>{formatLinkDisplayValue(websiteUrl)}</span>
                </div>
              ) : null}
              {linkedinUrl ? (
                <div className="modern-orange-showcase__contact-item">
                  <span className="modern-orange-showcase__contact-icon" aria-hidden="true">{devIcons.linkedin}</span>
                  <span>{formatLinkDisplayValue(linkedinUrl)}</span>
                </div>
              ) : null}
            </div>
          </SidebarBlock>
        ) : null}
```

with:

```jsx
        {directEditDispatch || personalItems.length > 0 || websiteUrl || linkedinUrl ? (
          <SidebarBlock title={copy.personalInfo}>
            <div className="modern-orange-showcase__contact-list">
              {(directEditDispatch ? directEditContactFields : personalItems).map(([key, value, placeholderLabel]) => (
                <div key={key} className="modern-orange-showcase__contact-item">
                  <span className="modern-orange-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {directEditDispatch ? (
                    <EditableField
                      as="span"
                      path={{ kind: 'root', field: key }}
                      value={value}
                      placeholder={placeholderLabel}
                    />
                  ) : (
                    <span>{value}</span>
                  )}
                </div>
              ))}
              {websiteUrl ? (
                <div className="modern-orange-showcase__contact-item">
                  <span className="modern-orange-showcase__contact-icon" aria-hidden="true">{devIcons.website}</span>
                  <span>{formatLinkDisplayValue(websiteUrl)}</span>
                </div>
              ) : null}
              {linkedinUrl ? (
                <div className="modern-orange-showcase__contact-item">
                  <span className="modern-orange-showcase__contact-icon" aria-hidden="true">{devIcons.linkedin}</span>
                  <span>{formatLinkDisplayValue(linkedinUrl)}</span>
                </div>
              ) : null}
            </div>
          </SidebarBlock>
        ) : null}
```

- [ ] **Step 7: Wire About**

The About section already renders through `renderMainSection('about')`
(gated by `mainSectionKeys` — the standard case, matching Executive/Classic
Professional, not Compact's special-cased bypass). Replace:

```jsx
    if (key === 'about') {
      return (
        <Section key={key} id="about" icon="about" title={copy.profile}>
          <p className="modern-orange-showcase__summary">{about}</p>
        </Section>
      )
    }
```

with:

```jsx
    if (key === 'about') {
      return (
        <Section key={key} id="about" icon="about" title={copy.profile}>
          <p className="modern-orange-showcase__summary">
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
        </Section>
      )
    }
```

- [ ] **Step 8: Verify no build/lint errors**

Run:
```bash
npm run lint
```
Expected: no new errors in `CVPreview.jsx` or `ModernOrangeShowcase.jsx`.

- [ ] **Step 9: Manual smoke check in the dev server**

Run `npm run dev`, open the app, load the demo CV, switch to the Modern
Orange template, switch to Direct Edit mode, and confirm: the name is
editable as ONE plain span while editing (no `<br>` visible mid-edit, no
color-accent), reverting to the split first/last visual when you blur back
to Classic mode; the title is editable and, critically, typing lowercase
text and blurring shows it STILL LOWERCASE in Classic mode's "Professional
title" field (this is the specific regression this task's Step 1 fix
prevents — if it shows ALL CAPS in Classic mode, the CSS fix didn't take);
all three contact fields show in the sidebar's Personal Info block (with
placeholders for any that are empty); About is editable.

- [ ] **Step 10: Commit**

```bash
git add src/components/CVPreview.jsx src/components/templates/ModernOrangeShowcase.jsx src/styles/templates/modernOrange.css
git commit -m "Wire Modern Orange's identity, contact, and About fields into Direct Edit mode"
```

---

### Task 2: Experience

**Files:**
- Modify: `src/components/templates/ModernOrangeShowcase.jsx`
- Modify: `src/styles/templates/modernOrange.css`

**Interfaces:**
- Consumes: `EditableList` (`src/components/EditableList.jsx`, props
  `section`, `items`, `addLabel`, render-prop `children(item, index)`),
  `EditableField` (imported in Task 1), `directEditDispatch` (from Task 1's
  component signature), the existing `ExperienceRow` module-scope component
  (already defined in this file — reuse it, don't duplicate its JSX).
- Produces: none consumed by later tasks — Skills (Task 3) is independent.

- [ ] **Step 1: Confirm the `:last-child` risk before touching any code**

Run:
```bash
grep -n -B2 -A4 "exp-row" src/styles/templates/modernOrange.css
```

Confirm the base rule (`padding-bottom`, `border-bottom`, `margin-bottom`
on every `.modern-orange-showcase__exp-row`) and the
`.modern-orange-showcase__exp-row:last-child` override that removes those
three properties for the visually-last entry. `EditableList`
(`src/components/EditableList.jsx:19-44`) wraps each entry's rendered
content in `<div class="direct-edit-entry">` containing `[drag-handle
button, remove button, {children}]` — since `{children}` (this task's
`ExperienceRow` output) is always the LAST of those three children, `.exp-row`
becomes `:last-child` of ITS OWN wrapper for every single entry, not just
the true last one, once `EditableList` is in play. Left unfixed, every
entry in Direct Edit mode would lose its divider/spacing, not just skip it
correctly for the true last one — the exact bug class Round 6's final
review found and fixed on Executive (see
`docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`'s "Known
risk to fix proactively" section, added after that finding, which already
names `modernOrange.css` as a template expected to hit this).

- [ ] **Step 2: Fix the `:last-child` risk proactively, in this same step, before wiring anything**

Add to `src/styles/templates/modernOrange.css`, directly below the existing
`.modern-orange-showcase__exp-row:last-child` rule:

> **SUPERSEDED during execution**: the `:last-of-type`-on-wrapper approach
> below was found broken (see `changes.md`'s 2026-09-18 entry and the
> comment above `.modern-orange-showcase__exp-row--last` in
> `modernOrange.css`) — `EditableList`'s `DndContext` mounts extra
> unclassed `<div>` siblings that defeat `:last-of-type`. The shipped
> code uses an `isLast`-driven modifier class instead.

```css
.modern-orange-showcase__exp-list .direct-edit-entry .modern-orange-showcase__exp-row {
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--mo-border);
  margin-bottom: 1.25rem;
}

.modern-orange-showcase__exp-list .direct-edit-entry:last-of-type .modern-orange-showcase__exp-row {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
```

`:last-of-type` (not `:last-child`) on `.direct-edit-entry` itself is
required because `EditableList` also renders a trailing
`<button class="direct-edit-add-row">` as the list's final sibling —
`:last-child` on `.direct-edit-entry` would never match anything, since the
add-row button is always the true last child. `:last-of-type` still
correctly matches the last `div.direct-edit-entry` specifically, ignoring
the differently-tagged button. Grep-prove the values match the base rule
exactly (border color variable, padding/margin values):

```bash
grep -n -A3 "exp-row:last-child\|direct-edit-entry .modern-orange-showcase__exp-row\|direct-edit-entry:last-of-type" src/styles/templates/modernOrange.css
```

Confirm all three rules (base `:last-child`, the new unconditional
wrapped-mode rule, and the new `:last-of-type` wrapped-mode override) use
identical property values.

- [ ] **Step 3: Add the `copy` entries this task needs**

Add two new keys to the `copy` object (currently lines 205-217):

```jsx
  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    personalInfo: isFinnish ? 'Henkilötiedot' : 'Personal Info',
    profile: isFinnish ? 'Profiili' : 'Profile',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    education: isFinnish ? 'Koulutus' : 'Education',
    projects: isFinnish ? 'Projektit' : 'Projects',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certifications',
    skills: isFinnish ? 'Taidot' : 'Skills',
    languages: isFinnish ? 'Kielet' : 'Languages',
    viewProject: isFinnish ? 'Näytä projekti' : 'View project',
  }
```

- [ ] **Step 4: Import `EditableList` and write the local `renderExperienceEntry`**

Add to the import block:

```jsx
import EditableList from '../EditableList'
```

Add this function at module scope, directly below the existing
`EducationRow` component (both are pure module-scope helpers above the
main component):

```jsx
// Modern Orange's own Experience-entry renderer — reuses the existing
// ExperienceRow wrapper (the rail marker + connecting line), which already
// takes `isLast` as an explicit prop rather than relying on CSS position —
// safe for EditableList's own reordering/removal, since `isLast` is
// recomputed from `index === items.length - 1` on every render regardless
// of DOM wrapping. Only role and company are independently editable —
// location and dates stay read-only-appended text, matching every other
// template's Experience wiring in this rollout. `index` here is always
// formData.experience-relative (only ever read inside directEditDispatch-
// gated branches or the React key) — never assume it lines up with
// snapshot.experience's own (filtered) indices in the read-only call site.
function renderExperienceEntry(item, index, { directEditDispatch, copy, isLast }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <ExperienceRow
      key={`${item.role}-${item.company}-${index}`}
      date={dateRange || copy.datesPending}
      isLast={isLast}
    >
      <p className="modern-orange-showcase__exp-role">
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
        <p className="modern-orange-showcase__exp-meta">
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
      {directEditDispatch ? (
        <p className="modern-orange-showcase__bullets modern-orange-showcase__bullets--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="modern-orange-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
    </ExperienceRow>
  )
}
```

Note `isLast` is now passed in explicitly (both call sites in Step 5
compute it the same way the original inline code did:
`index === items.length - 1`, where `items` is `formData.experience` when
editing, `snapshot.experience` when read-only).

- [ ] **Step 5: Style the new `--editing` class in the same step it's introduced**

Add to `src/styles/templates/modernOrange.css`, directly below the existing
`.modern-orange-showcase__bullets` rule:

```css
.modern-orange-showcase__bullets--editing {
  white-space: pre-line;
}
```

Grep-prove the class name matches exactly between the JSX and the CSS:

```bash
grep -n "bullets--editing" src/components/templates/ModernOrangeShowcase.jsx src/styles/templates/modernOrange.css
```

Expected: one match in the JSX, one match in the CSS, both spelled
`modern-orange-showcase__bullets--editing`.

- [ ] **Step 6: Replace the Experience section's render logic**

Replace the current `key === 'experience'` block in `renderMainSection`:

```jsx
    if (key === 'experience') {
      return (
        <Section key={key} id="experience" icon="experience" title={copy.experience}>
          <div className="modern-orange-showcase__exp-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []
                const metaLine = [item.company, item.location].filter(Boolean).join(' · ')

                return (
                  <ExperienceRow
                    key={`${item.role}-${item.company}-${index}`}
                    date={dateRange || copy.datesPending}
                    isLast={index === snapshot.experience.length - 1}
                  >
                    <p className="modern-orange-showcase__exp-role">{item.role || copy.untitledRole}</p>
                    {metaLine ? <p className="modern-orange-showcase__exp-meta">{metaLine}</p> : null}
                    {bullets.length > 0 ? (
                      <ul className="modern-orange-showcase__bullets">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </ExperienceRow>
                )
              })
            ) : (
              <p className="modern-orange-showcase__empty">
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
        <Section key={key} id="experience" icon="experience" title={copy.experience}>
          <div className="modern-orange-showcase__exp-list">
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
              <p className="modern-orange-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }
```

- [ ] **Step 7: Verify no build/lint errors**

Run:
```bash
npm run lint
```
Expected: clean.

- [ ] **Step 8: Manual smoke check**

In the dev server, switch to Modern Orange + Direct Edit, confirm: role and
company are editable in place; location and dates stay read-only text;
**every entry keeps its bottom divider/spacing except the true last one**
(this is the specific regression Step 2's CSS fix prevents — check this
carefully with at least 3 experience entries, not just 1, since the bug
only shows with 2+ entries); typing a multi-line description (seed it via
Classic mode's textarea, switch to Direct Edit, append at the end with
`Ctrl+End`) survives the round trip back to Classic mode without
collapsing to one line; adding/removing/dragging entries works via
`EditableList`'s existing controls, and the divider/spacing stays correct
after a drag-reorder too (drag the last entry to the middle, confirm the
NEW last entry loses its divider and the moved one gains one).

- [ ] **Step 9: Commit**

```bash
git add src/components/templates/ModernOrangeShowcase.jsx src/styles/templates/modernOrange.css
git commit -m "Wire Modern Orange's Experience entries into Direct Edit mode"
```

---

### Task 3: Skills — flat, reusing the Round 1 `EditableChip`

**Files:**
- Modify: `src/components/templates/ModernOrangeShowcase.jsx`

**Interfaces:**
- Consumes: `EditableChip` (`src/components/EditableList.jsx`, already
  built in Round 1 — props `skills`, `addLabel`).
- Produces: nothing new — pure reuse, no new shared code, same as every
  flat-skills round before Compact.

**Design note:** Modern Orange's Skills section is genuinely flat — a
`snapshot.skills.map((skill, index) => ...)` list rendering each skill as a
name plus a stylized "dot rating" (`DotRow`, a purely decorative visual
flourish reading list order as emphasis — see the file's own extensive
comment on `skillOrderDotCount`). There is no `parseSkillCategories`
anywhere in this file. This means Task 3 is the SAME kind of reuse Rounds
1-4 already did for their own flat-skills sections — swap in the plain
`EditableChip`, which does NOT reproduce the dot-rating visual while
editing (matching every flat-skills round's precedent: editing mode always
shows plain removable pill chips, never the read-only visual flourish,
since `EditableChip` has no concept of "this skill's list position").

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
        <SidebarBlock key={key} title={copy.skills}>
          <div className="modern-orange-showcase__skill-list">
            {snapshot.skills.length > 0 ? (
              snapshot.skills.map((skill, index) => (
                <div key={skill} data-export-skill="true" className="modern-orange-showcase__skill-row">
                  <span className="modern-orange-showcase__skill-name">{skill}</span>
                  <DotRow count={skillOrderDotCount(index, snapshot.skills.length)} />
                </div>
              ))
            ) : (
              <p className="modern-orange-showcase__empty modern-orange-showcase__empty--sidebar">
                {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
              </p>
            )}
          </div>
        </SidebarBlock>
      )
    }
```

with:

```jsx
    if (key === 'skills') {
      return (
        <SidebarBlock key={key} title={copy.skills}>
          <div className="modern-orange-showcase__skill-list">
            {directEditDispatch ? null : snapshot.skills.length > 0 ? (
              snapshot.skills.map((skill, index) => (
                <div key={skill} data-export-skill="true" className="modern-orange-showcase__skill-row">
                  <span className="modern-orange-showcase__skill-name">{skill}</span>
                  <DotRow count={skillOrderDotCount(index, snapshot.skills.length)} />
                </div>
              ))
            ) : (
              <p className="modern-orange-showcase__empty modern-orange-showcase__empty--sidebar">
                {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
              </p>
            )}
            {directEditDispatch ? (
              <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
            ) : null}
          </div>
        </SidebarBlock>
      )
    }
```

The read-only render is now fully gated behind `directEditDispatch ? null
: ...` — the same shape as the fix for Phase 1's Critical #1 (every skill
rendering twice), so this template can't ship that bug on day one.

- [ ] **Step 3: Verify no build/lint errors**

Run:
```bash
npm run lint
```
Expected: clean.

- [ ] **Step 4: Manual smoke check**

In the dev server, switch to Modern Orange + Direct Edit: confirm skills
render as plain removable chips (no dot rating while editing — expected,
matches every other flat-skills template); confirm no skill renders twice
(zero `[data-export-skill="true"]` elements present while editing); click
"+ Add" and confirm a new "New skill N" chip appears; click a chip to
remove it and confirm the correct skill disappears; switch back to Classic
mode and confirm the dot-rating visual returns correctly (the read-only
render is unaffected by any of this).

- [ ] **Step 5: Commit**

```bash
git add src/components/templates/ModernOrangeShowcase.jsx
git commit -m "Wire Modern Orange's Skills editing (flat chips, Round 1 pattern)"
```

---

### Task 4: Allowlist + e2e coverage + full verification pass

**Files:**
- Modify: `src/utils/directEdit.js`
- Modify: `e2e/direct-edit.spec.js`
- Modify: `changes.md`
- Modify: `package.json`
- Add: `docs/superpowers/plans/2026-09-18-direct-edit-modern-orange.md` (this
  plan file itself — Round 5's final review had to catch and fix this same
  omission after the fact; Round 6's own plan repeated the mistake by not
  saying so explicitly. Commit it as part of this task, don't let it stay
  untracked for a future review to rediscover a third time.)

**Interfaces:**
- Consumes: `DIRECT_EDIT_SUPPORTED_TEMPLATES` (`src/utils/directEdit.js`),
  `runDirectEditDemoDataChecks`/`runDirectEditEmptyPlaceholderCheck`/
  `DIRECT_EDIT_TEMPLATES` (`e2e/direct-edit.spec.js`), `selectTemplate`
  helper (`e2e/direct-edit.spec.js:7`).
- Produces: nothing consumed by later work — this is the round's last task.

**Design note:** No new dedicated e2e test is needed this round — Modern
Orange reuses mechanisms already proven correct (flat `EditableChip` since
Round 1, `EditableList` since Phase 1, the split-name ternary pattern
proven on Modern Timeline in Round 4). Adding Modern Orange's row to the
existing parameterized loop is sufficient. The loop's own multi-line-
description check will also exercise this round's two proactive CSS fixes
indirectly (a real Direct Edit session with 2+ experience entries would
surface the `:last-child` bug immediately if the fix were wrong) — but
consider whether the demo CV has enough experience entries to actually
exercise the divider-fix regression; if it has only one, the loop's
existing checks won't catch a broken fix, since the bug only shows with 2+
entries (see Task 2's own manual-smoke-check note).

- [ ] **Step 1: Add `'modernOrange'` to the allowlist**

In `src/utils/directEdit.js`:

```js
export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional', 'editorial', 'portrait', 'timeline', 'compact', 'executive', 'modernOrange']
```

- [ ] **Step 2: Run the allowlist regression check**

Run:
```bash
npm run check:direct-edit
```
Expected: all checks pass.

- [ ] **Step 3: Verify Modern Orange's real contact-row values before trusting this plan's guess**

Before adding Modern Orange's row to the e2e loop, open the CURRENT
`src/components/templates/ModernOrangeShowcase.jsx` (after Tasks 1-3's
edits) and confirm the actual order of the `directEditContactFields` array
(added in Task 1) and the contact row's wrapper class. This plan's own
reading of the file shows `directEditContactFields` ordered `['location',
'email', 'phone']` with English labels `'Location'`/`'Email'`/`'Phone'`
(which happens to match the shared e2e helper's own DEFAULT `labelOrder`,
`['Location', 'Email', 'Phone']` — but still pass it explicitly for
clarity, matching every prior round's style), and the wrapper class is
`.modern-orange-showcase__contact-list` (suffix `'contact-list'`, NOT the
helper's default `'meta'`) — re-verify against the real file rather than
trusting this guess.

- [ ] **Step 4: Add Modern Orange's row to the shared smoke-test loop**

In `e2e/direct-edit.spec.js`, extend the `DIRECT_EDIT_TEMPLATES` array
(currently ending after Executive):

```js
  const DIRECT_EDIT_TEMPLATES = [
    { label: 'Classic Professional', classPrefix: 'classic-professional-showcase', contactRowSuffix: 'contact', labelOrder: ['Phone', 'Email', 'Location'] },
    { label: 'Editorial', classPrefix: 'editorial-showcase' },
    { label: 'Portrait', classPrefix: 'portrait-showcase' },
    { label: 'Modern Timeline', classPrefix: 'timeline-showcase', contactRowSuffix: 'contact', labelOrder: ['Phone', 'Email', 'Location'] },
    { label: 'Compact', classPrefix: 'compact-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
    { label: 'Executive', classPrefix: 'executive-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
    { label: 'Modern Orange', classPrefix: 'modern-orange-showcase', contactRowSuffix: 'contact-list', labelOrder: ['Location', 'Email', 'Phone'] },
  ]
```

Use the values you actually verified in Step 3, not this guess, if they
differ.

- [ ] **Step 5: Run the Modern-Orange-related e2e tests in isolation first**

Run:
```bash
npx playwright test e2e/direct-edit.spec.js -g "Modern Orange"
```
Expected: both loop-generated tests pass. Pay particular attention to
whether the name-persistence assertion works correctly given the
split-ternary name field from Task 1 — the shared helper's assertion
selector is `.${classPrefix}__name .direct-edit-field`, which should still
resolve correctly since the editing branch renders exactly one
`EditableField` there (same shape Modern Timeline already proved works
with this exact helper).

If the empty-placeholder test fails on the `labelOrder`/`contactRowSuffix`
assertion, re-check `ModernOrangeShowcase.jsx`'s actual
`directEditContactFields` order and wrapper class (Step 3) rather than
assuming this plan's guess.

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
the style of the Round 6 entry directly below it:

```markdown
## Direct Edit: Modern Orange is now editable, with two risks fixed proactively — 2026-09-18

Modern Orange is now editable in Direct Edit mode (Phase 2 Round 7, the
second `railTable`-family template), with the same scope every prior
round has used: identity, About, Experience, and Skills are all
inline-editable in the live preview. This round is the rollout's first
concrete hit on the `text-transform` bug class the roadmap predicted for
this family — the title field sits inside a class styled
`text-transform: uppercase` with no override, and was fixed in the same
task that wired it, before shipping, rather than discovered afterward.
It's also the second concrete hit on the positional-CSS-selector risk
Round 6's final review found on Executive: Experience entries render
through a rail/timeline wrapper whose CSS removes the bottom divider from
the visually-last entry via `:last-child`, which `EditableList`'s own
wrapper div breaks (every entry becomes technically "last" once
wrapped) — fixed proactively this round rather than rediscovered, using
the exact pattern Round 6's fix established. Skills stay flat here
(unlike Compact/Executive's categorized display), so this round reuses
the plain `EditableChip` from Round 1 unchanged. The name field splits
into two visual lines (first/last name) — matching Modern Timeline's own
precedent for the same shape — collapsing to one plain editable field
while actively editing.
```

- [ ] **Step 9: Bump the version**

In `package.json`, bump the patch version (e.g. `1.2.42` → `1.2.43`).

- [ ] **Step 10: Commit**

```bash
git add src/utils/directEdit.js e2e/direct-edit.spec.js changes.md package.json docs/superpowers/plans/2026-09-18-direct-edit-modern-orange.md
git commit -m "Add Modern Orange to Direct Edit's supported templates, with e2e coverage"
```

---

## After this plan: final whole-branch review

Per this rollout's established process, dispatch one final whole-branch
review (opus) covering all four tasks' combined diff before considering
Round 7 done. Pay particular attention to: whether the `text-transform`
fix is scoped correctly (only the live `.direct-edit-field`, not the
read-only badge) — re-verify by reading the CSS, not by trusting Task 1's
own report; whether the `:last-child`-under-`EditableList` fix is
correct for every entry count (0, 1, 2, 3+ entries, and after a
drag-reorder) — this is the second time this exact bug class has been
fixed in this rollout, so the review should confirm the fix generalizes
correctly rather than assume Round 6's pattern was copied verbatim without
verification; and whether any THIRD instance of either bug class exists
elsewhere in this same file that neither task noticed (e.g. check
`.modern-orange-showcase__edu-row:last-child` and
`.modern-orange-showcase__cert-item:first-child`/`:last-child` — both are
currently out of scope since Education/Certificates aren't wired this
round, but confirm neither is accidentally affected by this round's changes,
and flag them for whichever future round DOES wire Education or
Certificates on this template).
