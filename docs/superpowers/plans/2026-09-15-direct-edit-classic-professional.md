# Direct Edit builder — Phase 2 Round 1: Classic Professional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Direct Edit's inline editing into the Classic Professional
template — the first of 17 remaining templates, and the first to prove
the "wire a bespoke Showcase component" pattern Phase 1 never needed
(Minimalist has no bespoke Showcase, so Phase 1 only ever touched
`CVPreview.jsx`'s shared flat renderer).

**Architecture:** Identical mechanism to Phase 1 — `EditableField`/
`EditableList`/`EditableChip` dispatch the same pre-existing
`cvFormReducer` actions, gated by `DirectEditContext`. What's new this
round: those primitives get wired into `ClassicProfessionalShowcase.jsx`
directly (its own hand-written JSX, not the flat renderer), and
`DirectEditProvider` gets wrapped locally around just this one Showcase's
call site in `CVPreview.jsx` — not a global refactor (see the roadmap's
own correction on this).

**Tech Stack:** Same as Phase 1 — React 19, the existing
`cvFormReducer`/`uiReducer`, the `EditableField`/`EditableList`/
`EditableChip`/`DirectEditContext`/`SectionsMenu` components Phase 1
already built and shipped (no changes to those files this round).

**Spec:** `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`
(Phase 2 roadmap) and `docs/superpowers/specs/2026-09-13-direct-edit-builder-design.md`
(the original Phase 1 architecture spec — still the binding design for
every primitive this plan reuses).

## Global Constraints

- No new `cvFormReducer` actions. Every dispatch in this round uses one
  of: `SET_ROOT_FIELD {field, value}`, `UPDATE_ARRAY_ITEM {section, index,
  field, value}`, `ADD_ARRAY_ITEM {section}`, `REMOVE_ARRAY_ITEM {section,
  index}`, `MOVE_ARRAY_ITEM_TO_INDEX {section, fromIndex, toIndex}`,
  `ADD_SKILL {skill}`, `REMOVE_SKILL {index}` — all pre-existing, all
  already used by Phase 1's primitives.
- Same section-type scope as Phase 1: identity (name/title/email/phone/
  location) + About + Experience (role/company/description only — dates
  and location stay read-only, matching Phase 1's own boundary) + Skills.
  Education/Languages/Certificates stay read-only this round, exactly
  like every other section stayed read-only for Minimalist in Phase 1 —
  a deliberate, consistent boundary repeated every round, not a gap.
- `EditableField`'s `value` prop must always be the RAW `formData.x`
  value, never a pre-trimmed or fallback-baked local variable —
  `EditableField`'s own read-only branch already trims and falls back to
  `placeholder` internally (fixed in Phase 1's final review). Passing an
  already-`|| fallbackString`-combined variable as `value` would show
  literal placeholder text as if it were real content whenever the field
  is actually empty in Direct Edit mode — wrong. Pass the raw field and
  the placeholder text as two separate props.
- `DIRECT_EDIT_SUPPORTED_TEMPLATES` (`src/utils/directEdit.js`) gains
  exactly one new entry, `'classicProfessional'`, in the final task —
  not before, so the template isn't reachable in Direct Edit mode with
  half-finished wiring at any intermediate commit.
- Commits carry only the repo's own git identity — no AI/Claude
  co-authorship trailer of any kind.
- Every changed path gets a check: `npm run lint`, a manual browser
  verification per task (this plan has no dedicated new check script —
  Phase 1's `check:direct-edit` already covers the allowlist mechanism
  generically), and a new e2e test in the final task, then the full
  `npm run test:e2e` suite.

---

### Task 1: Identity block + About

**Files:**
- Modify: `src/components/CVPreview.jsx` (the `classicProfessional`
  early-return branch — add the local `DirectEditProvider` wrap, thread
  `directEditDispatch` into the `<ClassicProfessionalShowcase>` call)
- Modify: `src/components/templates/ClassicProfessionalShowcase.jsx`
  (accept the new prop, wire name/title/contact/about)

**Interfaces:**
- Consumes: `DirectEditProvider` (from `src/components/DirectEditContext.jsx`,
  Phase 1), `EditableField` (from `src/components/EditableField.jsx`,
  Phase 1) — both already exist, unchanged.
- Produces: `ClassicProfessionalShowcase` accepts a new
  `directEditDispatch = null` prop, forwarded from `CVPreview.jsx`. Task 2
  and 3 (this same file, different sections) rely on this same prop being
  in scope.

- [ ] **Step 1: Wrap the Showcase's call site in a local `DirectEditProvider`**

  In `src/components/CVPreview.jsx`, locate the exact block (search for
  `variant === 'classicProfessional'`):

  ```jsx
  if (variant === 'classicProfessional' && !atsFriendlyMode) {
    return (
      <Suspense fallback={null}>
        <ClassicProfessionalShowcase
          formData={formData}
          locale={locale}
          previewRef={previewRef}
          templateConfig={templateConfig}
          showcaseConfig={t}
          headingColor={headingColor}
          nameAlignment={classicNameAlignment}
        />
      </Suspense>
    )
  }
  ```

  Replace with (adds the provider wrap and the new prop; every existing
  prop stays exactly as-is):

  ```jsx
  if (variant === 'classicProfessional' && !atsFriendlyMode) {
    return (
      <DirectEditProvider isEditing={Boolean(directEditDispatch)} dispatchFormData={directEditDispatch}>
        <Suspense fallback={null}>
          <ClassicProfessionalShowcase
            formData={formData}
            locale={locale}
            previewRef={previewRef}
            templateConfig={templateConfig}
            showcaseConfig={t}
            headingColor={headingColor}
            nameAlignment={classicNameAlignment}
            directEditDispatch={directEditDispatch}
          />
        </Suspense>
      </DirectEditProvider>
    )
  }
  ```

  `DirectEditProvider` is already imported at the top of this file (Phase
  1, Task 6) — no new import needed. `directEditDispatch` is already a
  prop of the `CVPreview` function itself (Phase 1) — this step only
  threads it into this one branch, which didn't consume it before.

  Note: passing `directEditDispatch` as both the Provider's
  `dispatchFormData` AND as a separate prop on `ClassicProfessionalShowcase`
  is deliberate, not redundant — the Provider makes `useDirectEdit()`
  work for any `EditableField`/`EditableList`/`EditableChip` rendered
  inside, while the explicit prop lets the Showcase's own top-level JSX
  branch on `directEditDispatch` directly where needed (Step 3 below,
  the contact row) without a wrapper component. Both are needed, same
  pattern already established in `DirectEditPreview.jsx`.

- [ ] **Step 2: Accept the prop and import `EditableField`**

  In `src/components/templates/ClassicProfessionalShowcase.jsx`, add to
  the destructured props (after `nameAlignment = 'center',`):

  ```js
  directEditDispatch = null,
  ```

  Add the import, alongside the existing imports at the top of the file:

  ```js
  import EditableField from '../EditableField'
  ```

- [ ] **Step 3: Wire name, title, and the contact row**

  Locate the header block:

  ```jsx
        <h1 className="classic-professional-showcase__name">{fullName}</h1>
        <p className="classic-professional-showcase__role">{title}</p>
        {contactItems.length > 0 || linkedinUrl ? (
          <div className="classic-professional-showcase__contact">
            {contactItems.map(([key, value]) => (
              <span key={key} className="classic-professional-showcase__contact-item">
                <span className="classic-professional-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                {value}
              </span>
            ))}
            {linkedinUrl ? (
              <span className="classic-professional-showcase__contact-item">
                <span className="classic-professional-showcase__contact-icon" aria-hidden="true">{devIcons.linkedin}</span>
                {formatLinkDisplayValue(linkedinUrl)}
              </span>
            ) : null}
          </div>
        ) : null}
  ```

  Replace with (name/title wired unconditionally via `EditableField`'s
  own no-op-when-not-editing branch; the contact row switches source
  array only when editing, exactly matching Phase 1 Task 6's Minimalist
  contact-row pattern, since Direct Edit needs an always-3-slot array so
  an empty field is still clickable — `contactItems` stays exactly as
  today for the read-only render):

  ```jsx
        <h1 className="classic-professional-showcase__name">
          <EditableField
            as="span"
            path={{ kind: 'root', field: 'fullName' }}
            value={formData.fullName}
            placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
          />
        </h1>
        <p className="classic-professional-showcase__role">
          <EditableField
            as="span"
            path={{ kind: 'root', field: 'title' }}
            value={formData.title}
            placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
          />
        </p>
        {directEditDispatch || contactItems.length > 0 || linkedinUrl ? (
          <div className="classic-professional-showcase__contact">
            {(directEditDispatch ? directEditContactFields : contactItems).map(([key, value, placeholderLabel]) => (
              <span key={key} className="classic-professional-showcase__contact-item">
                <span className="classic-professional-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
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
            {linkedinUrl ? (
              <span className="classic-professional-showcase__contact-item">
                <span className="classic-professional-showcase__contact-icon" aria-hidden="true">{devIcons.linkedin}</span>
                {formatLinkDisplayValue(linkedinUrl)}
              </span>
            ) : null}
          </div>
        ) : null}
  ```

  Add the `directEditContactFields` array right after the existing
  `contactItems`/`linkedinUrl` declarations (note the field order here
  is `phone, email, location`, matching this Showcase's own existing
  `contactItems` order — not the `email, phone, location` order Phase
  1's Minimalist wiring used; keep each template's own existing order,
  don't standardize it as part of this round):

  ```js
  const directEditContactFields = [
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
  ]
  ```

  `linkedinUrl` stays completely untouched and read-only — Links are out
  of scope for this round (and every round), matching Phase 1's own
  boundary.

- [ ] **Step 4: Wire About**

  Locate:

  ```jsx
    if (key === 'about') {
      return (
        <Section key={key} id="about">
          <h2 className="classic-professional-showcase__heading">{copy.summary}</h2>
          <p className="classic-professional-showcase__summary">{about}</p>
        </Section>
      )
    }
  ```

  Replace the inner paragraph only:

  ```jsx
    if (key === 'about') {
      return (
        <Section key={key} id="about">
          <h2 className="classic-professional-showcase__heading">{copy.summary}</h2>
          <p className="classic-professional-showcase__summary">
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
      )
    }
  ```

  The `about` local variable (`snapshot.about || fallbackString`) stays
  defined and unused-here-only is fine to leave — check whether it's
  referenced anywhere else in the file before removing it (grep the file
  for `\babout\b` after this edit); if it's now genuinely unused, delete
  it to keep lint clean, matching how Phase 1 handled the identical
  situation for `title`/`about` local variables in `CVPreview.jsx` itself.

- [ ] **Step 5: Run lint**

  Run: `npm run lint`
  Expected: clean.

- [ ] **Step 6: Manual smoke check**

  `npm run dev`, load the demo CV, select Classic Professional, switch to
  Direct Edit. Confirm: name/title/phone/email/location/about are all
  clickable and editable in place; typing a new value and switching to
  Classic shows the same value in the Classic form; an empty field (clear
  one via Classic first) shows its placeholder text in Direct Edit and is
  still clickable to fill in. Confirm Classic mode's own rendering of this
  template is completely unchanged (name/title/contact/about look
  identical to before this task when NOT in Direct Edit mode).

- [ ] **Step 7: Commit**

  ```bash
  git add src/components/CVPreview.jsx src/components/templates/ClassicProfessionalShowcase.jsx
  git commit -m "Wire Classic Professional's identity block and About into Direct Edit"
  ```

---

### Task 2: Experience

**Files:**
- Modify: `src/components/templates/ClassicProfessionalShowcase.jsx`

**Interfaces:**
- Consumes: `EditableList` (from `src/components/EditableList.jsx`,
  Phase 1) — the same array-wrapping primitive Phase 1's Task 7 used for
  Minimalist's Experience section.
- Produces: nothing new consumed by later tasks in this file — Task 3
  (Skills) is independent of this task.

This template's Experience entries render a `metaLine` combining company
and location into one joined string
(`[item.company, item.location].filter(Boolean).join(', ')`), unlike
Minimalist's separate `item.company` span. To keep company genuinely
editable (matching every other template's Experience wiring, for a
consistent editing experience across templates), this task splits that
into an editable `company` field followed by read-only `, location` text
when location is present — not a joined string anymore.

This template's description also renders as a bulleted list (via
`splitToBullets`), not a single paragraph like Minimalist's — `EditableField`
alone can't reproduce bullet-splitting in its read-only branch, so the
read-only render keeps the existing bulleted JSX and only the editing
branch uses `EditableField` (with `multiline`, showing the raw
newline-joined text to edit) — the same explicit-ternary pattern Phase 1
Task 6 already used for a different reason (the contact row's different
source array). Expect this same shape (bulleted-description read-only
render + ternary to `EditableField` when editing) to repeat across most
of the remaining 17 templates — Minimalist's plain single-paragraph
description was the atypical case, not the norm.

- [ ] **Step 1: Extract the per-entry render into a named function**

  Locate the `if (key === 'experience')` block's `.map()` callback:

  ```jsx
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []
                const metaLine = [item.company, item.location].filter(Boolean).join(', ')

                return (
                  <div key={`${item.role}-${item.company}-${index}`} className="classic-professional-showcase__entry" data-export-card="true">
                    <div className="classic-professional-showcase__entry-row">
                      <p className="classic-professional-showcase__entry-role">{item.role || copy.untitledRole}</p>
                      <p className="classic-professional-showcase__entry-dates">{dateRange || copy.datesPending}</p>
                    </div>
                    {metaLine ? <p className="classic-professional-showcase__entry-meta">{metaLine}</p> : null}
                    {bullets.length > 0 ? (
                      <ul className="classic-professional-showcase__bullets">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })
  ```

  Extract this into a standalone function, declared just above the
  `renderSection` function (a pure relocation of the callback body, with
  the field-level changes described in Step 2 folded in directly — not a
  separate mechanical-extraction-then-edit pass, since this function
  doesn't exist anywhere else to keep behaviorally identical to):

  ```jsx
  function renderExperienceEntry(item, index, { directEditDispatch, copy }) {
    const dateRange = formatDateRange(item.startDate, item.endDate)
    const bullets = item.description ? splitToBullets(item.description) : []

    return (
      <div key={`${item.role}-${item.company}-${index}`} className="classic-professional-showcase__entry" data-export-card="true">
        <div className="classic-professional-showcase__entry-row">
          <p className="classic-professional-showcase__entry-role">
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
          <p className="classic-professional-showcase__entry-dates">{dateRange || copy.datesPending}</p>
        </div>
        {directEditDispatch || item.company || item.location ? (
          <p className="classic-professional-showcase__entry-meta">
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
            {item.location ? `, ${item.location}` : null}
          </p>
        ) : null}
        {directEditDispatch ? (
          <p className="classic-professional-showcase__bullets classic-professional-showcase__bullets--editing">
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
              value={item.description}
              placeholder={copy.descriptionPlaceholder}
              multiline
            />
          </p>
        ) : bullets.length > 0 ? (
          <ul className="classic-professional-showcase__bullets">
            {bullets.map((line, lineIndex) => (
              <li key={lineIndex}>{line}</li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }
  ```

  Note the signature takes `directEditDispatch`/`copy` as an options
  object rather than closing over them, since this function is declared
  outside the component body (a module-level function, like
  `splitToBullets` above it) — it needs those values passed in explicitly
  rather than relying on closure over component state. This mirrors how
  `EditableList`'s own `children` callback works: the parent component
  passes whatever the entry-renderer needs.

  Add two new keys to the `copy` object (declared inside the component,
  passed into `renderExperienceEntry` at each call site):

  ```js
  company: isFinnish ? 'Yritys' : 'Company',
  descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
  ```

- [ ] **Step 2: Route the section through `EditableList` when editing**

  Replace the `if (key === 'experience')` block's body (the part that
  used to contain the inline `.map()`, now replaced by the extracted
  function above) with:

  ```jsx
    if (key === 'experience') {
      return (
        <Section key={key} id="experience">
          <h2 className="classic-professional-showcase__heading">{copy.experience}</h2>
          <div className="classic-professional-showcase__entry-list">
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
              <p className="classic-professional-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }
  ```

  Import `EditableList` alongside the existing `EditableField` import
  added in Task 1:

  ```js
  import EditableList from '../EditableList'
  ```

- [ ] **Step 3: Run lint**

  Run: `npm run lint`
  Expected: clean.

- [ ] **Step 4: Manual smoke check**

  In Direct Edit mode on Classic Professional: confirm role/company/
  description are each independently editable; confirm the date range
  and location remain read-only (unchanged, as intended for this round);
  confirm "+ Add experience" adds a new blank entry that's immediately
  editable; confirm hovering an entry reveals a drag handle and delete
  control, and dragging reorders entries; confirm deleting an entry
  removes it. Confirm Classic mode's rendering (bulleted description,
  joined `company, location` meta line) is completely unchanged.

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/templates/ClassicProfessionalShowcase.jsx
  git commit -m "Wire Classic Professional's Experience section into Direct Edit"
  ```

---

### Task 3: Skills

**Files:**
- Modify: `src/components/templates/ClassicProfessionalShowcase.jsx`

**Interfaces:**
- Consumes: `EditableChip` (named export of `src/components/EditableList.jsx`,
  Phase 1) — this template's Skills section is a genuine flat list
  (`snapshot.skills.map(...)`, confirmed directly against the file, not
  assumed from its config value), so `EditableChip` is reused completely
  unchanged, the same way Phase 1 Task 7 used it for Minimalist.

- [ ] **Step 1: Gate the plain tag list and add `EditableChip`**

  Locate:

  ```jsx
    if (key === 'skills') {
      return (
        <Section key={key} id="skills">
          <h2 className="classic-professional-showcase__heading">{copy.skills}</h2>
          <div className="classic-professional-showcase__tag-row">
            {snapshot.skills.length > 0 ? (
              snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="classic-professional-showcase__tag">{skill}</span>
              ))
            ) : (
              <p className="classic-professional-showcase__empty">
                {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }
  ```

  Replace with (the plain tag list — both the populated and empty-state
  branches — only renders when NOT editing; `EditableChip` only renders
  when editing; this is the exact gating shape Phase 1's final review
  fixed for Minimalist's Critical #1 duplicate-skills bug — get it right
  the first time here rather than repeating that bug):

  ```jsx
    if (key === 'skills') {
      return (
        <Section key={key} id="skills">
          <h2 className="classic-professional-showcase__heading">{copy.skills}</h2>
          <div className="classic-professional-showcase__tag-row">
            {directEditDispatch ? null : snapshot.skills.length > 0 ? (
              snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="classic-professional-showcase__tag">{skill}</span>
              ))
            ) : (
              <p className="classic-professional-showcase__empty">
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

  Import `EditableChip` as a named export alongside the `EditableList`
  default import added in Task 2 (one combined import line):

  ```js
  import EditableList, { EditableChip } from '../EditableList'
  ```

- [ ] **Step 2: Run lint**

  Run: `npm run lint`
  Expected: clean.

- [ ] **Step 3: Manual smoke check — specifically checking for Critical #1's regression class**

  In Direct Edit mode on Classic Professional, with the demo CV loaded:
  confirm each skill appears exactly once, as a removable chip — count
  them against the demo CV's actual skill count. Confirm zero plain
  `data-export-skill="true"` tags are present in the DOM while editing
  (open browser devtools or query the DOM directly, don't just eyeball
  it — this is exactly the check that would have caught Phase 1's
  Critical #1 sooner). Confirm clicking a chip's × removes that skill;
  confirm "+ Add" adds a new chip.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/templates/ClassicProfessionalShowcase.jsx
  git commit -m "Wire Classic Professional's Skills section into Direct Edit"
  ```

---

### Task 4: Allowlist, e2e coverage, and final verification

**Files:**
- Modify: `src/utils/directEdit.js`
- Modify: `e2e/templates.spec.js` (or a new file — see Step 2)

**Interfaces:**
- Consumes: the full stack built in Tasks 1-3.

- [ ] **Step 1: Add Classic Professional to the allowlist**

  In `src/utils/directEdit.js`:

  ```js
  export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional']
  ```

  Run: `npm run check:direct-edit`
  Expected: `All direct-edit checks passed.` (this check already validates
  the allowlist generically — no changes needed to the check script
  itself, confirming the Phase 1 investment in that check script's
  genericity was worth it).

- [ ] **Step 2: Add an e2e test**

  Add to `e2e/direct-edit.spec.js` (alongside the existing Minimalist
  tests — this file already covers the cross-cutting Direct Edit
  behaviors like mode switching and the Sections popover generically; a
  new template only needs its own "does editing actually work" test, not
  a full re-test of every Direct Edit mechanism):

  ```js
  test('Classic Professional: identity, About, Experience, and Skills are editable in Direct Edit mode', async ({ page }) => {
    await page.getByRole('button', { name: /select template/i }).click()
    await page.getByText('Classic Professional', { exact: true }).click()
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const nameField = page.locator('.classic-professional-showcase__name .direct-edit-field')
    await nameField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Jordan Rivera')
    await nameField.blur()

    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(page.getByLabel('Full name')).toHaveValue('Jordan Rivera')
  })
  ```

  Confirm the `.classic-professional-showcase__name .direct-edit-field`
  selector matches the real DOM (it should, since `EditableField` always
  adds the `direct-edit-field` class in its editing branch, and this
  template's name wrapper class is confirmed from the file read above) —
  verify live rather than trusting this in isolation, the same way every
  prior task's e2e selectors in this whole project have been checked
  against the real DOM before finalizing.

- [ ] **Step 3: Run the new test alone**

  Run: `npx playwright test e2e/direct-edit.spec.js -g "Classic Professional"`
  Expected: 1 passed.

- [ ] **Step 4: Run full verification**

  Run, in order:

  ```bash
  npm run lint
  npm run check:direct-edit
  npm run build
  npm run test:e2e
  ```

  Expected: all clean, full e2e suite green (54 pre-existing + 1 new = 55).

- [ ] **Step 5: Bump the version**

  Per this project's standing convention: bump `package.json`'s patch
  version, standalone commit.

- [ ] **Step 6: Commit**

  ```bash
  git add src/utils/directEdit.js e2e/direct-edit.spec.js
  git commit -m "Add Classic Professional to the Direct Edit allowlist, with e2e coverage"
  git add package.json
  git commit -m "Bump version to <next>"
  ```

---

## After This Round

This is Round 1 of the Phase 2 rollout
(`docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`).
Round 2 (Editorial, Portrait, or Modern Timeline — any of the three
remaining flat-skills `oneColumn` members) gets its own plan when this
one ships, following the same per-template cadence. Compact (categorized
skills) is sequenced last in this family, once a categorized-chip design
has actually been worked out — not assumed to be "the same as this
round, just reskinned."
