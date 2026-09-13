# Direct Edit builder — Phase 1 (infrastructure + Minimalist) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working "Direct Edit" builder mode — a toolbar toggle that
swaps the split-pane builder for a single full-width preview where CV text
is editable in place — wired end-to-end against one reference template
(Minimalist), proving the shared editing primitives before the Phase 2
rollout touches the other 17 templates.

**Architecture:** A new `uiReducer` slot (`builderMode`) switches which view
`ResumeBuilderPage` renders; both views share the exact same `formData`/
`dispatchFormData`. A new `EditableField`/`EditableList`/`EditableChip`
primitive set, gated by a `DirectEditContext`, gets threaded into
`CVPreview.jsx`'s existing flat-renderer JSX in place — no parallel
"direct" Showcase files, no new reducer actions. Everything Direct Edit
writes goes through the exact `FORM_ACTION` cases Classic mode's form
already dispatches.

**Tech Stack:** React 19, the existing `cvFormReducer`/`uiReducer`
(`useReducer`), `@dnd-kit/core`+`@dnd-kit/sortable` (already a dependency,
already used by `SortableItemCard` in Classic mode — reused, not
reimplemented), plain CSS (`src/styles/*.css`, no Tailwind build step),
Playwright for e2e, framework-free `scripts/*.mjs` for reducer/module
checks (this project has no unit-test runner — see `CLAUDE.md`).

**Spec:** `docs/superpowers/specs/2026-09-13-direct-edit-builder-design.md`

## Global Constraints

- No new `cvFormReducer` actions or CV data fields. Every Direct Edit
  mutation dispatches one of the existing `FORM_ACTION` cases:
  `SET_ROOT_FIELD { field, value }`, `SET_LINK_FIELD { field, value }`,
  `UPDATE_ARRAY_ITEM { section, index, field, value }`,
  `ADD_ARRAY_ITEM { section }`, `REMOVE_ARRAY_ITEM { section, index }`,
  `MOVE_ARRAY_ITEM_TO_INDEX { section, fromIndex, toIndex }`,
  `ADD_SKILL { skill }`, `REMOVE_SKILL { index }`,
  `MOVE_SKILL { index, direction }`, `TOGGLE_SECTION_VISIBILITY { section }`.
- `builderMode` defaults to `'classic'` and is a real persisted preference
  (`localStorage`, mirroring `UI_NAV_RAIL_COLLAPSED_STORAGE_KEY`'s
  read-in-`createInitialUiState` / write-in-a-`useEffect` pattern in
  `src/pages/ResumeBuilderPage.jsx`) — not an ephemeral per-session toggle
  like `atsFriendlyMode`.
- Phase 1 wires exactly 4 section types on exactly 1 template
  (Minimalist / `variant === 'minimal'`): identity (name, title, email,
  phone, location), About, Experience (the `experienceLayout: 'clean'`
  branch — confirmed Minimalist's own value in
  `src/components/templates/minimal.js`), Skills (the `skillsLayout:
  'flat'` branch — also Minimalist's own value). Every other section type,
  and every other template, is Phase 2 scope — not a gap, a boundary.
  `EditableList`/`EditableChip`/`EditableField` are still built fully
  generic in this phase so Phase 2 only wires call sites, not new
  primitives.
- Any template not in `DIRECT_EDIT_SUPPORTED_TEMPLATES`
  (`src/utils/directEdit.js`) renders read-only in Direct Edit mode (no
  `contenteditable`, no crash, no data loss) — this is the fallback for
  the other 17 templates until Phase 2 adds them one at a time.
- Direct Edit always renders the bespoke/flat Showcase with
  `atsFriendlyMode` forced to `false` for the purposes of `CVPreview`'s
  own render — ATS mode is an export concern, not an editing surface (see
  spec, "ATS mode").
- Every changed path gets a check: `npm run check:reducers` for the new
  `uiReducer` action, a new `npm run check:direct-edit` for the
  supported-templates module, `npm run lint`, `npm run build`, and a new
  `e2e/direct-edit.spec.js` for the interactive behavior itself.
- Commits carry only the repo's own git identity — no AI/Claude
  co-authorship trailer of any kind, per this project's standing rule.

---

### Task 1: `uiReducer` — `builderMode` state, persistence, action

**Files:**
- Modify: `src/utils/designSystem.js`
- Modify: `src/reducers/uiReducer.js`
- Modify: `scripts/check-reducers.mjs`

**Interfaces:**
- Produces: `UI_ACTION.SET_BUILDER_MODE` (`{ mode: 'classic' | 'direct' }`),
  `state.builderMode` (`'classic' | 'direct'`, default `'classic'`),
  `UI_BUILDER_MODE_STORAGE_KEY` (exported from `designSystem.js`). Every
  later task in this plan reads `state.builderMode` and dispatches
  `SET_BUILDER_MODE` exactly this way.

- [ ] **Step 1: Add the storage key**

  In `src/utils/designSystem.js`, alongside the existing keys:

  ```js
  export const UI_ACCENT_STORAGE_KEY = 'portifycv-ui-accent'
  export const UI_LOCALE_STORAGE_KEY = 'ui-locale'
  export const UI_NAV_RAIL_COLLAPSED_STORAGE_KEY = 'portifycv-nav-rail-collapsed'
  export const UI_BUILDER_MODE_STORAGE_KEY = 'portifycv-builder-mode'
  ```

- [ ] **Step 2: Add the action, initial-state read, and reducer case**

  In `src/reducers/uiReducer.js`:

  1. Extend the import: `UI_LOCALE_STORAGE_KEY, UI_NAV_RAIL_COLLAPSED_STORAGE_KEY, UI_BUILDER_MODE_STORAGE_KEY` from `'../utils/designSystem'`.
  2. Add to `UI_ACTION`: `SET_BUILDER_MODE: 'SET_BUILDER_MODE',`
  3. In `createInitialUiState`, alongside `storedNavRailCollapsed`:

     ```js
     const storedBuilderMode = safeStorageGet(UI_BUILDER_MODE_STORAGE_KEY, 'classic').value
     ```

     and in the returned object, alongside `navRailCollapsed`:

     ```js
     builderMode: storedBuilderMode === 'direct' ? 'direct' : 'classic',
     ```

  4. Add the reducer case, next to `SET_CLASSIC_NAME_ALIGNMENT` (same
     validated-fallback shape — an unrecognized value never produces an
     invalid mode):

     ```js
     case UI_ACTION.SET_BUILDER_MODE:
       return { ...state, builderMode: action.mode === 'direct' ? 'direct' : 'classic' }
     ```

- [ ] **Step 3: Add regression coverage**

  In `scripts/check-reducers.mjs`, in the `uiReducer` section (after the
  `SET_CLASSIC_NAME_ALIGNMENT` block, before the "unknown action type"
  block at the end):

  ```js
  {
    const state = createInitialUiState({})
    check('createInitialUiState defaults the builder mode to classic', state.builderMode === 'classic')
    const direct = uiReducer(state, { type: UI_ACTION.SET_BUILDER_MODE, mode: 'direct' })
    check('SET_BUILDER_MODE switches to direct', direct.builderMode === 'direct')
    const backClassic = uiReducer(direct, { type: UI_ACTION.SET_BUILDER_MODE, mode: 'classic' })
    check('SET_BUILDER_MODE switches back to classic', backClassic.builderMode === 'classic')
    const garbage = uiReducer(direct, { type: UI_ACTION.SET_BUILDER_MODE, mode: 'sideways' })
    check('SET_BUILDER_MODE falls back to classic for an unknown value', garbage.builderMode === 'classic')
  }
  ```

- [ ] **Step 4: Run the check**

  Run: `npm run check:reducers`
  Expected: `All reducer checks passed.`

- [ ] **Step 5: Commit**

  ```bash
  git add src/utils/designSystem.js src/reducers/uiReducer.js scripts/check-reducers.mjs
  git commit -m "Add builderMode to uiReducer (Direct Edit builder, Phase 1)"
  ```

---

### Task 2: Direct Edit template-support allowlist

**Files:**
- Create: `src/utils/directEdit.js`
- Create: `scripts/check-direct-edit.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `DIRECT_EDIT_SUPPORTED_TEMPLATES` (array of template id
  strings), `isDirectEditSupported(templateId)` (boolean). Task 8's
  `DirectEditPreview` is the consumer.
- Consumes: `cvTemplates` from `src/utils/cvTemplates.js` (the real
  template registry — same import `scripts/check-docx-export.mjs` already
  uses for its own registry-validity checks, same pattern here).

- [ ] **Step 1: Write the module**

  Create `src/utils/directEdit.js`:

  ```js
  // Templates wired for Direct Edit's inline-editable preview. Grows one
  // entry at a time as Phase 2 rolls the shared EditableField/EditableList
  // primitives out to each remaining template — see
  // docs/superpowers/specs/2026-09-13-direct-edit-builder-design.md.
  // A template NOT in this list still renders in Direct Edit mode, just
  // read-only, until it's added here.
  export const DIRECT_EDIT_SUPPORTED_TEMPLATES = ['minimal']

  export function isDirectEditSupported(templateId) {
    return DIRECT_EDIT_SUPPORTED_TEMPLATES.includes(templateId)
  }
  ```

- [ ] **Step 2: Write the check script**

  Create `scripts/check-direct-edit.mjs` (mirrors
  `scripts/check-docx-export.mjs`'s registry-validity pattern — the exact
  shape that caught a real regression once already this project, see
  `changes.md`'s "Follow-up fix wave" entry):

  ```js
  // Regression check for src/utils/directEdit.js's supported-template
  // allowlist. Framework-free, run directly:
  //
  //   node scripts/check-direct-edit.mjs

  import { registerHooks } from 'node:module'
  import { fileURLToPath, pathToFileURL } from 'node:url'
  import { dirname, resolve as resolvePath } from 'node:path'

  registerHooks({
    resolve(specifier, context, nextResolve) {
      try {
        return nextResolve(specifier, context)
      } catch (error) {
        if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
          return nextResolve(`${specifier}.js`, context)
        }
        throw error
      }
    },
  })

  const srcDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '../src')
  const importSrc = (relativePath) => import(pathToFileURL(resolvePath(srcDir, relativePath)).href)

  const { DIRECT_EDIT_SUPPORTED_TEMPLATES, isDirectEditSupported } = await importSrc('utils/directEdit.js')
  const { cvTemplates } = await importSrc('utils/cvTemplates.js')

  let failures = 0
  function check(label, passed, detail = '') {
    if (!passed) failures += 1
    console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
    if (!passed && detail) console.log(`        ${detail}`)
  }

  console.log('\ndirectEdit: supported-template allowlist\n')

  {
    const registryIds = new Set(cvTemplates.map((template) => template.id))
    const unknownIds = DIRECT_EDIT_SUPPORTED_TEMPLATES.filter((id) => !registryIds.has(id))
    check(
      'every id in DIRECT_EDIT_SUPPORTED_TEMPLATES is a real template id',
      unknownIds.length === 0,
      `unknown ids: ${unknownIds.join(', ')}`,
    )
    check(
      'DIRECT_EDIT_SUPPORTED_TEMPLATES has no duplicate entries',
      new Set(DIRECT_EDIT_SUPPORTED_TEMPLATES).size === DIRECT_EDIT_SUPPORTED_TEMPLATES.length,
    )
    check('Minimalist (the Phase 1 reference template) is supported', isDirectEditSupported('minimal'))
    check('an unknown template id is not supported', isDirectEditSupported('not-a-real-template') === false)
  }

  console.log(`\n${failures === 0 ? 'All direct-edit checks passed.' : `${failures} check(s) failed.`}`)
  process.exit(failures === 0 ? 0 : 1)
  ```

- [ ] **Step 3: Wire the npm script**

  In `package.json`'s `"scripts"`, alongside `"check:docx-export"`:

  ```json
  "check:direct-edit": "node scripts/check-direct-edit.mjs",
  ```

- [ ] **Step 4: Run the check**

  Run: `npm run check:direct-edit`
  Expected: `All direct-edit checks passed.`

- [ ] **Step 5: Commit**

  ```bash
  git add src/utils/directEdit.js scripts/check-direct-edit.mjs package.json
  git commit -m "Add the Direct Edit supported-template allowlist"
  ```

---

### Task 3: `DirectEditContext`

**Files:**
- Create: `src/components/DirectEditContext.jsx`

**Interfaces:**
- Produces: `DirectEditProvider` (props: `isEditing: boolean`,
  `dispatchFormData: function | null`, `children`), `useDirectEdit()`
  (returns `{ isEditing, dispatchFormData }`). Tasks 4 and 5's
  `EditableField`/`EditableList`/`EditableChip` are the consumers; Task 6
  is where the provider first gets mounted (wrapping `CVPreview`'s
  return).
- Outside any `DirectEditProvider`, `useDirectEdit()` returns
  `{ isEditing: false, dispatchFormData: null }` — this is what makes
  Classic mode, PDF/html2canvas export, the thumbnail gallery, and the
  print stylesheet automatically render every `EditableField` as plain,
  inert text with zero extra wiring at those call sites.

- [ ] **Step 1: Write the file**

  Create `src/components/DirectEditContext.jsx`:

  ```jsx
  import { createContext, useContext, useMemo } from 'react'

  const DirectEditContext = createContext({ isEditing: false, dispatchFormData: null })

  export function DirectEditProvider({ isEditing, dispatchFormData, children }) {
    const value = useMemo(
      () => ({ isEditing: Boolean(isEditing && dispatchFormData), dispatchFormData }),
      [isEditing, dispatchFormData],
    )

    return <DirectEditContext.Provider value={value}>{children}</DirectEditContext.Provider>
  }

  export function useDirectEdit() {
    return useContext(DirectEditContext)
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/components/DirectEditContext.jsx
  git commit -m "Add DirectEditContext for the Direct Edit builder"
  ```

---

### Task 4: `EditableField` — the scalar-field primitive

**Files:**
- Create: `src/components/EditableField.jsx`
- Create: `src/styles/direct-edit.css`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `useDirectEdit()` from Task 3; `FORM_ACTION` from
  `src/reducers/cvFormReducer.js`.
- Produces: `<EditableField as="h1" path={{ kind: 'root', field: 'fullName' }} value={formData.fullName} placeholder="Your Name" className="..." />`
  and the `multiline` variant. `path.kind` is one of `'root'`, `'link'`,
  `'arrayItem'`. Task 6/7 are the consumers (identity/About/Experience
  fields); Task 9's Sections menu does not use this component.

- [ ] **Step 1: Write the component**

  Create `src/components/EditableField.jsx`:

  ```jsx
  import { useCallback, useEffect, useRef } from 'react'
  import { useDirectEdit } from './DirectEditContext'
  import { FORM_ACTION } from '../reducers/cvFormReducer'

  function buildAction(path, value) {
    switch (path.kind) {
      case 'root':
        return { type: FORM_ACTION.SET_ROOT_FIELD, field: path.field, value }
      case 'link':
        return { type: FORM_ACTION.SET_LINK_FIELD, field: path.field, value }
      case 'arrayItem':
        return {
          type: FORM_ACTION.UPDATE_ARRAY_ITEM,
          section: path.section,
          index: path.index,
          field: path.field,
          value,
        }
      default:
        throw new Error(`EditableField: unknown path.kind "${path.kind}"`)
    }
  }

  // as="h1"|"p"|"span"|... — the exact tag the read-only render already
  // used at each call site, so swapping in EditableField never changes
  // the surrounding CSS's element-selector assumptions.
  export default function EditableField({
    as: Tag = 'span',
    path,
    value,
    placeholder = '',
    className,
    multiline = false,
  }) {
    const { isEditing, dispatchFormData } = useDirectEdit()
    const elementRef = useRef(null)

    // Seed/update the DOM's text imperatively instead of via React
    // children. A contentEditable element must own its own text node
    // once mounted — if React re-renders {value} as children on every
    // keystroke's resulting dispatch, the diff can reset the caret to
    // the start of the field on every character typed. Skipping the
    // write entirely while the field is focused is what lets the user's
    // own in-progress edit alone; an external formData change (undo,
    // template switch, Classic-mode edit of the same field) still lands
    // once the field is blurred.
    useEffect(() => {
      const el = elementRef.current

      if (!el || !isEditing || document.activeElement === el) {
        return
      }

      const text = value || ''

      if (el.textContent !== text) {
        el.textContent = text
      }
    }, [value, isEditing])

    const handleInput = useCallback(
      (event) => {
        dispatchFormData(buildAction(path, event.currentTarget.textContent ?? ''))
      },
      [dispatchFormData, path],
    )

    // Paste as plain text only — a contentEditable field left to its
    // default paste behavior can pull in the source's own markup
    // (font, color, links), which would silently break the template's
    // own styling for that one field.
    const handlePaste = useCallback((event) => {
      event.preventDefault()
      const text = event.clipboardData.getData('text/plain')
      document.execCommand('insertText', false, text)
    }, [])

    const handleKeyDown = useCallback(
      (event) => {
        if (!multiline && event.key === 'Enter') {
          event.preventDefault()
          event.currentTarget.blur()
        }
      },
      [multiline],
    )

    if (!isEditing) {
      return <Tag className={className}>{value || placeholder}</Tag>
    }

    return (
      <Tag
        ref={elementRef}
        className={`${className ?? ''} direct-edit-field${!value ? ' direct-edit-field--empty' : ''}`.trim()}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
      />
    )
  }
  ```

- [ ] **Step 2: Write the base styles**

  Create `src/styles/direct-edit.css`:

  ```css
  /* Direct Edit builder — styles for the inline-editable preview
     (EditableField/EditableList/EditableChip) and the Sections popover.
     Scoped to `.direct-edit-*` classes so it never collides with any
     bespoke Showcase's own `.<template>-showcase__*` classes. */

  .direct-edit-field {
    outline: none;
    border-radius: 3px;
    cursor: text;
  }

  .direct-edit-field:hover {
    box-shadow: 0 0 0 1.5px var(--ds-border-strong, #d4d4d8);
  }

  .direct-edit-field:focus {
    box-shadow: 0 0 0 1.5px var(--ds-accent, #0f766e);
  }

  .direct-edit-field--empty:not(:focus)::before {
    content: attr(data-placeholder);
    color: var(--ds-text-muted, #a1a1aa);
    pointer-events: none;
  }
  ```

- [ ] **Step 3: Import the stylesheet**

  In `src/index.css`, add the import alongside the other `@import`s for
  `styles/*.css` (utilities/app-shell/tokens):

  ```css
  @import './styles/direct-edit.css';
  ```

- [ ] **Step 4: Run lint**

  Run: `npm run lint`
  Expected: clean.

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/EditableField.jsx src/styles/direct-edit.css src/index.css
  git commit -m "Add EditableField, the Direct Edit builder's scalar-field primitive"
  ```

---

### Task 5: `EditableList` and `EditableChip`

**Files:**
- Create: `src/components/EditableList.jsx`
- Modify: `src/styles/direct-edit.css`

**Interfaces:**
- Consumes: `useDirectEdit()` (Task 3), `FORM_ACTION` (`ADD_ARRAY_ITEM`,
  `REMOVE_ARRAY_ITEM`, `MOVE_ARRAY_ITEM_TO_INDEX`, `ADD_SKILL`,
  `REMOVE_SKILL`), `DndContext`/`closestCenter`/`KeyboardSensor`/
  `PointerSensor`/`useSensor`/`useSensors` from `@dnd-kit/core`,
  `SortableContext`/`sortableKeyboardCoordinates`/
  `verticalListSortingStrategy`/`useSortable` from `@dnd-kit/sortable`,
  `CSS` from `@dnd-kit/utilities` — the identical dnd-kit primitives
  `SortableItemCard`/`CVForm.jsx`'s `makeArrayDragEndHandler` already use
  for Classic mode's own drag-to-reorder, reused here rather than
  reimplemented.
- Produces: `<EditableList section="experience" items={formData.experience} dispatchFormData={dispatchFormData} addLabel="+ Add experience" onAdd={...}>{(item, index) => <>...entry JSX...</>}</EditableList>`
  and `<EditableChip skills={formData.skills} dispatchFormData={dispatchFormData} addLabel="+ Add" />`.
  Task 7 is the consumer (Experience and Skills).
- `EditableList` does not know or care what an entry's JSX looks like —
  it wraps whatever `children(item, index)` returns with, in editing mode
  only, a hover-revealed drag handle and delete control, plus a trailing
  "+ Add" row. In read-only mode it renders `children(item, index)`
  directly with no wrapper at all — a plain passthrough, byte-identical
  to what every call site already renders today.

- [ ] **Step 1: Write the component**

  Create `src/components/EditableList.jsx`:

  ```jsx
  import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
  } from '@dnd-kit/core'
  import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
  } from '@dnd-kit/sortable'
  import { CSS } from '@dnd-kit/utilities'
  import { useDirectEdit } from './DirectEditContext'
  import { FORM_ACTION } from '../reducers/cvFormReducer'

  function EditableListEntry({ id, onRemove, removeLabel, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`direct-edit-entry${isDragging ? ' direct-edit-entry--dragging' : ''}`}
      >
        <button
          type="button"
          className="direct-edit-entry__handle"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <button type="button" className="direct-edit-entry__remove" aria-label={removeLabel} onClick={onRemove}>
          ×
        </button>
        {children}
      </div>
    )
  }

  export default function EditableList({ section, items, addLabel, removeLabel = 'Remove entry', children }) {
    const { isEditing, dispatchFormData } = useDirectEdit()
    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    if (!isEditing) {
      return <>{items.map((item, index) => children(item, index))}</>
    }

    const ids = items.map((_, index) => `${section}:${index}`)

    const handleDragEnd = (event) => {
      const { active, over } = event

      if (!over || active.id === over.id) {
        return
      }

      const fromIndex = Number(String(active.id).split(':').pop())
      const toIndex = Number(String(over.id).split(':').pop())

      if (Number.isInteger(fromIndex) && Number.isInteger(toIndex)) {
        dispatchFormData({ type: FORM_ACTION.MOVE_ARRAY_ITEM_TO_INDEX, section, fromIndex, toIndex })
      }
    }

    const handleRemove = (index) => {
      dispatchFormData({ type: FORM_ACTION.REMOVE_ARRAY_ITEM, section, index })
    }

    const handleAdd = () => {
      dispatchFormData({ type: FORM_ACTION.ADD_ARRAY_ITEM, section })
    }

    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <EditableListEntry
              key={ids[index]}
              id={ids[index]}
              onRemove={() => handleRemove(index)}
              removeLabel={removeLabel}
            >
              {children(item, index)}
            </EditableListEntry>
          ))}
        </SortableContext>
        <button type="button" className="direct-edit-add-row" onClick={handleAdd}>
          {addLabel}
        </button>
      </DndContext>
    )
  }

  export function EditableChip({ skills, addLabel = '+ Add' }) {
    const { isEditing, dispatchFormData } = useDirectEdit()

    if (!isEditing) {
      return null
    }

    const handleRemove = (index) => {
      dispatchFormData({ type: FORM_ACTION.REMOVE_SKILL, index })
    }

    const handleAdd = () => {
      const nextLabel = `New skill ${skills.length + 1}`
      dispatchFormData({ type: FORM_ACTION.ADD_SKILL, skill: nextLabel })
    }

    return (
      <>
        {skills.map((skill, index) => (
          <button
            key={`${skill}-${index}`}
            type="button"
            className="direct-edit-chip direct-edit-chip--removable"
            onClick={() => handleRemove(index)}
          >
            {skill} <span aria-hidden="true">×</span>
          </button>
        ))}
        <button type="button" className="direct-edit-chip-add" onClick={handleAdd}>
          {addLabel}
        </button>
      </>
    )
  }
  ```

  `EditableChip` intentionally renders nothing in read-only mode — Task 7
  keeps the existing plain skill-tag `.map()` for the non-editing render
  and appends `<EditableChip>` only inside the editing branch (skills
  themselves stay plain text, matching the mockup's read-then-click-×
  pattern rather than inline rename, since `ADD_SKILL`/`REMOVE_SKILL`
  operate on the whole string, not a sub-field — renaming a skill in
  place is add-new-plus-remove-old, not a text edit, and is explicitly
  Phase 2/3 polish, not required for Phase 1's "prove the mechanism"
  goal).

- [ ] **Step 2: Add the entry/chip styles**

  Append to `src/styles/direct-edit.css`:

  ```css
  .direct-edit-entry {
    position: relative;
    padding-left: 22px;
    margin-left: -22px;
    border-radius: 8px;
  }

  .direct-edit-entry:hover {
    background: var(--ds-surface-muted, #fafaf9);
  }

  .direct-edit-entry--dragging {
    opacity: 0.6;
  }

  .direct-edit-entry__handle,
  .direct-edit-entry__remove {
    position: absolute;
    top: 2px;
    border: none;
    background: transparent;
    color: var(--ds-text-muted, #a1a1aa);
    font-size: 13px;
    opacity: 0;
    cursor: pointer;
  }

  .direct-edit-entry__handle {
    left: 0;
    cursor: grab;
  }

  .direct-edit-entry__remove {
    right: 0;
  }

  .direct-edit-entry:hover .direct-edit-entry__handle,
  .direct-edit-entry:hover .direct-edit-entry__remove {
    opacity: 1;
  }

  .direct-edit-entry__remove:hover {
    color: var(--ds-danger, #b3261e);
  }

  .direct-edit-add-row {
    display: block;
    width: 100%;
    margin-top: 8px;
    padding: 7px 11px;
    border: 1px dashed var(--ds-border-strong, #d4d4d8);
    border-radius: 7px;
    background: none;
    color: var(--ds-text-muted, #71717a);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
  }

  .direct-edit-add-row:hover {
    border-color: var(--ds-accent, #0f766e);
    color: var(--ds-accent, #0f766e);
  }

  .direct-edit-chip,
  .direct-edit-chip-add {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font: inherit;
    font-size: 0.8125rem;
    padding: 5px 11px;
    border-radius: 999px;
    cursor: pointer;
  }

  .direct-edit-chip--removable {
    border: none;
    background: var(--ds-accent-soft, #e1f5ee);
    color: var(--ds-accent-ink, #04342c);
  }

  .direct-edit-chip-add {
    border: 1px dashed var(--ds-border-strong, #d4d4d8);
    background: none;
    color: var(--ds-text-muted, #71717a);
  }

  .direct-edit-chip-add:hover {
    border-color: var(--ds-accent, #0f766e);
    color: var(--ds-accent, #0f766e);
  }
  ```

- [ ] **Step 3: Run lint**

  Run: `npm run lint`
  Expected: clean.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/EditableList.jsx src/styles/direct-edit.css
  git commit -m "Add EditableList and EditableChip, the Direct Edit builder's array-section primitives"
  ```

---

### Task 6: Wire `CVPreview.jsx` — the provider and the identity block

**Files:**
- Modify: `src/components/CVPreview.jsx`

**Interfaces:**
- Consumes: `DirectEditProvider` (Task 3), `EditableField` (Task 4).
- Produces: `CVPreview` accepts a new optional prop,
  `directEditDispatch = null`. Task 8's `DirectEditPreview` is the only
  caller that ever passes a non-null value.

This task touches a large existing file (`CVPreview.jsx`, ~1960 lines).
Locate each insertion point by the exact surrounding code quoted below —
do not reformat or restructure anything else in the file.

- [ ] **Step 1: Accept the new prop**

  In `CVPreview`'s destructured props (starts `function CVPreview({`,
  currently ending `classicNameAlignment = 'center',\n}) {`), add one
  more prop:

  ```js
  // Direct Edit builder: a dispatch function only when (a) the app is in
  // Direct Edit mode AND (b) the current template is in
  // DIRECT_EDIT_SUPPORTED_TEMPLATES (src/utils/directEdit.js) — null in
  // every other case (Classic mode, PDF/html2canvas export, the
  // thumbnail gallery, an unsupported template). EditableField/
  // EditableList/EditableChip read this indirectly via DirectEditContext
  // — see the wrap in the final return below.
  directEditDispatch = null,
  ```

- [ ] **Step 2: Import the new pieces**

  Add near `CVPreview.jsx`'s existing top-of-file imports:

  ```js
  import { DirectEditProvider } from './DirectEditContext'
  import EditableField from './EditableField'
  ```

- [ ] **Step 3: Wrap the flat renderer's outer return in the provider**

  `CVPreview`'s bespoke-Showcase branches (`if (variant === 'developer' &&
  ...)`, `'creative'`, `'modern'`, …, `'european'`, each `return`-ing
  early) come before the flat renderer's own return. Find the flat
  renderer's own outermost JSX — the `<div>` whose immediate child is the
  `<header data-export-header="true" ...>` block containing `{fullName}`
  (see Step 4 below) — and wrap that whole returned JSX tree in the
  provider, e.g.:

  ```jsx
  return (
    <DirectEditProvider isEditing={Boolean(directEditDispatch)} dispatchFormData={directEditDispatch}>
      <div
        ref={previewRef}
        {/* ...every existing prop on this div, unchanged... */}
      >
        {/* ...every existing child, unchanged except Steps 4-5 below... */}
      </div>
    </DirectEditProvider>
  )
  ```

  Only the wrapping provider is new here — every prop and child inside
  stays exactly as it is except the specific `EditableField` swaps below.

- [ ] **Step 4: Wire the identity block**

  Locate this exact block (the header's name/title/contact):

  ```jsx
            {/* Full name heading — uses template-specific font size and weight */}
            <h3
              className={`leading-none ${
                atsFriendlyMode ? 'mt-2 text-4xl font-semibold tracking-tight text-gray-900' : t.headerTitle()
              }`}
              style={headingColor ? { color: headingColor } : undefined}
            >
              {fullName}
            </h3>

            {/* Professional title / subtitle */}
            <p className={resolvedHeaderSubtitleClasses}>
              {title}
            </p>
  ```

  Replace the two inner text nodes only (keep every className/style
  expression exactly as-is):

  ```jsx
            {/* Full name heading — uses template-specific font size and weight */}
            <h3
              className={`leading-none ${
                atsFriendlyMode ? 'mt-2 text-4xl font-semibold tracking-tight text-gray-900' : t.headerTitle()
              }`}
              style={headingColor ? { color: headingColor } : undefined}
            >
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            </h3>

            {/* Professional title / subtitle */}
            <p className={resolvedHeaderSubtitleClasses}>
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'title' }}
                value={formData.title}
                placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
              />
            </p>
  ```

  Note `as="span"` here, not `as="h3"`/`as="p"` — the parent `<h3>`/`<p>`
  tag stays exactly where it already is; `EditableField` only replaces
  the text node inside it, so its own `className` prop is left unset
  (`undefined`, matching every other identity field below).

- [ ] **Step 5: Wire the contact row (email/phone/location) — always
  present, even when empty, in Direct Edit mode**

  The existing `personalContactItems` array (`[['email', snapshot.email],
  ['phone', snapshot.phone], ['location', snapshot.location]].filter(([,
  value]) => value)`) drops empty fields — correct for the read-only
  render (nothing to show), wrong for Direct Edit (a user must be able to
  click an empty field to type their first email address). Add a small
  second array right after `personalContactItems` is defined:

  ```js
  // Direct Edit needs a slot to click even when the field is empty
  // (personalContactItems above filters those out for the read-only
  // render, which is correct there and wrong here).
  const directEditContactFields = [
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
  ]
  ```

  Then, in the `t.headerContactMode === 'piped'` branch — **this is the
  one Minimalist actually uses** (`src/components/templates/minimal.js`
  sets `headerContactMode: 'piped'`, confirmed directly against the
  source; `'personal'` is a different, separately-rendered branch used by
  other templates, not Minimalist — do not edit `'personal'` for this
  task). Developer/Creative/Executive/Timeline use `'icons'` and are
  untouched by this task either way. Locate:

  ```jsx
            {t.headerContactMode === 'piped' && personalContactItems.length > 0 ? (
              <p className={`mt-3 flex flex-wrap items-center ${t.headerContactGap} gap-y-1 ${t.headerContactTextSize} leading-5 ${resolvedHeaderContactTextColor}`}>
                {personalContactItems.map(([key, value], i, arr) => (
                  <span key={key} className="flex items-center gap-x-2">
                    <span>{value}</span>
                    {i < arr.length - 1 ? <span className="text-gray-300">|</span> : null}
                  </span>
                ))}
              </p>
            ) : null}
  ```

  Replace with a version that switches source array only when editing,
  and wires the inner value through `EditableField` — the pipe-separator
  logic (`i < arr.length - 1`) is unchanged either way, since
  `directEditContactFields` also has exactly 3 entries:

  ```jsx
            {t.headerContactMode === 'piped' && (directEditDispatch ? true : personalContactItems.length > 0) ? (
              <p className={`mt-3 flex flex-wrap items-center ${t.headerContactGap} gap-y-1 ${t.headerContactTextSize} leading-5 ${resolvedHeaderContactTextColor}`}>
                {(directEditDispatch ? directEditContactFields : personalContactItems).map(([key, value, placeholderLabel], i, arr) => (
                  <span key={key} className="flex items-center gap-x-2">
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
                    {i < arr.length - 1 ? <span className="text-gray-300">|</span> : null}
                  </span>
                ))}
              </p>
            ) : null}
  ```

  (`placeholderLabel` is `undefined` for the `personalContactItems`
  2-tuples — harmless, since that branch of the ternary never reaches
  `EditableField` at all.)

- [ ] **Step 6: Run lint**

  Run: `npm run lint`
  Expected: clean.

- [ ] **Step 7: Manual smoke check**

  `npm run dev`, open the builder, load the demo CV, select Minimalist.
  This task alone doesn't yet add a way to enter Direct Edit mode (that's
  Task 8) — confirm instead that Classic mode's preview is pixel-identical
  to before this task (no visual regression from the provider wrap or the
  `directEditContactFields`/ternary additions when `directEditDispatch` is
  `null`, which it always is until Task 8 lands).

- [ ] **Step 8: Commit**

  ```bash
  git add src/components/CVPreview.jsx
  git commit -m "Wire CVPreview's identity block into Direct Edit (name, title, contact)"
  ```

---

### Task 7: Wire `CVPreview.jsx` — About, Experience, Skills

**Files:**
- Modify: `src/components/CVPreview.jsx`

**Interfaces:**
- Consumes: `EditableField` (Task 4), `EditableList`/`EditableChip`
  (Task 5).

- [ ] **Step 1: Import `EditableList`/`EditableChip`**

  Add to `CVPreview.jsx`'s imports, alongside Task 6's `EditableField`
  import:

  ```js
  import EditableList, { EditableChip } from './EditableList'
  ```

- [ ] **Step 2: Wire the About section**

  Locate:

  ```jsx
            <p className={`mt-4 whitespace-pre-line ${aboutTextSize} ${bodyTextClasses}`}>
              {about}
            </p>
  ```

  (inside the `if (section === 'about')` block). Replace the child:

  ```jsx
            <p className={`mt-4 whitespace-pre-line ${aboutTextSize} ${bodyTextClasses}`}>
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
  ```

- [ ] **Step 3: Wire the Experience section's `'clean'` layout**

  Locate the `if (t.experienceLayout === 'clean') { return ( ... ) }`
  block inside `if (section === 'experience')`. Its outer element is:

  ```jsx
                  if (t.experienceLayout === 'clean') {
                    return (
                      <div
                        key={`${item.role}-${item.company}-${index}`}
                        className="relative pl-0"
                        data-export-card="true"
                      >
  ```

  This `.map()` callback (`experience.map((item, index) => { ... })`) is
  what `EditableList` needs to wrap. Change the *outer* `.map()` call —
  not this inner `if` block — from:

  ```jsx
              {experience.length > 0 ? (
                experience.map((item, index) => {
  ```

  to route through `EditableList` when editing, and to keep today's exact
  `.map()` behavior otherwise:

  ```jsx
              {directEditDispatch ? (
                <EditableList section="experience" items={formData.experience} addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}>
                  {(item, index) => renderExperienceEntry(item, index)}
                </EditableList>
              ) : experience.length > 0 ? (
                experience.map((item, index) => renderExperienceEntry(item, index))
              ) : (
  ```

  This requires factoring the existing `.map()` callback body (the whole
  `(item, index) => { const dateRange = ...; ...; return (...) }`
  function, currently inline) out into a named function,
  `renderExperienceEntry`, declared just above the
  `{experience.length > 0 ? (` line, with the exact same body — a pure
  extraction, not a rewrite. Both branches above call the same function,
  so `'clean'`/`'timeline'`/`'timeline-clean'` all keep working exactly
  as today; `EditableList` only changes when the *outer* list gets a drag
  handle, delete button, and "+ Add" row, never the entry markup itself.

  Then, inside the `'clean'` branch specifically (the layout Minimalist
  uses), wire its two text fields — role/company heading and the
  description paragraph. Locate:

  ```jsx
                            <p
                              className={`${experienceTitleSize} font-semibold tracking-tight text-gray-900`}
                            >
                              {item.role.trim() || (isFinnish ? 'Nimeämätön rooli' : 'Untitled role')}
                            </p>
                            {item.company.trim() ? (
                              <p className="text-sm text-gray-500">
                                {item.company}
                              </p>
                            ) : null}
                            {item.description.trim() ? (
                              <p className={`mt-2 whitespace-pre-line ${experienceDescSize} ${bodyTextClasses}`}>
                                {item.description}
                              </p>
                            ) : null}
  ```

  Replace with (each field now dispatches through `EditableField` when
  editing; read-only rendering is untouched by wrapping the *existing*
  conditionals rather than replacing them):

  ```jsx
                            <p
                              className={`${experienceTitleSize} font-semibold tracking-tight text-gray-900`}
                            >
                              {directEditDispatch ? (
                                <EditableField
                                  as="span"
                                  path={{ kind: 'arrayItem', section: 'experience', index, field: 'role' }}
                                  value={item.role}
                                  placeholder={isFinnish ? 'Nimeämätön rooli' : 'Untitled role'}
                                />
                              ) : (
                                item.role.trim() || (isFinnish ? 'Nimeämätön rooli' : 'Untitled role')
                              )}
                            </p>
                            {directEditDispatch || item.company.trim() ? (
                              <p className="text-sm text-gray-500">
                                {directEditDispatch ? (
                                  <EditableField
                                    as="span"
                                    path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
                                    value={item.company}
                                    placeholder={isFinnish ? 'Yritys' : 'Company'}
                                  />
                                ) : (
                                  item.company
                                )}
                              </p>
                            ) : null}
                            {directEditDispatch || item.description.trim() ? (
                              <p className={`mt-2 whitespace-pre-line ${experienceDescSize} ${bodyTextClasses}`}>
                                {directEditDispatch ? (
                                  <EditableField
                                    as="span"
                                    path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
                                    value={item.description}
                                    placeholder={isFinnish ? 'Kuvaus' : 'Description'}
                                    multiline
                                  />
                                ) : (
                                  item.description
                                )}
                              </p>
                            ) : null}
  ```

  `item.role`/`item.company`/`item.description` are the exact three
  `UPDATE_ARRAY_ITEM` fields this entry supports — `startDate`/
  `endDate`/`isCurrent`/`achievements`/`technologies` (the date range and
  `renderExtras()`) stay read-only in Phase 1, explicitly deferred per
  this plan's Global Constraints (date-range editing needs its own small
  UI, not a bare `EditableField` — real Phase 2/3 work, not a Phase 1
  gap).

- [ ] **Step 4: Wire the Skills section's `'flat'` layout**

  Locate (inside `if (section === 'skills')`, after the `'categorized'`
  branch, the fall-through `'flat'` return):

  ```jsx
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    data-export-skill="true"
                    className={resolvedSkillTagClasses}
                  >
                    {skill}
                  </span>
                ))
              ) : (
  ```

  Add `<EditableChip>` after the existing `.map()`, inside the same
  wrapping `<div>` (skills stay plain read/click-to-remove text per Task
  5's note — no rename-in-place in Phase 1):

  ```jsx
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    data-export-skill="true"
                    className={resolvedSkillTagClasses}
                  >
                    {skill}
                  </span>
                ))
              ) : directEditDispatch ? null : (
  ```

  and, right after the closing `)}` of that ternary (still inside the
  `<div className="mt-4 flex flex-wrap gap-2">`), add:

  ```jsx
              {directEditDispatch ? (
                <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
              ) : null}
  ```

- [ ] **Step 5: Run lint**

  Run: `npm run lint`
  Expected: clean.

- [ ] **Step 6: Commit**

  ```bash
  git add src/components/CVPreview.jsx
  git commit -m "Wire CVPreview's About, Experience, and Skills sections into Direct Edit"
  ```

---

### Task 8: `DirectEditPreview`, the toolbar switcher, and `ResumeBuilderPage` wiring

**Files:**
- Create: `src/components/DirectEditPreview.jsx`
- Modify: `src/components/Toolbar.jsx`
- Modify: `src/pages/ResumeBuilderPage.jsx`
- Modify: `src/App.jsx` — **found during implementation, not anticipated
  when this plan was written:** `<Toolbar>` is not rendered directly in
  `ResumeBuilderPage.jsx`. It's rendered in `App.jsx`, fed by a pre-existing
  `headerProps`/`onHeaderChange` bridge object `ResumeBuilderPage.jsx`
  builds and lifts up — every existing Toolbar prop already flows through
  that bridge, not a literal `<Toolbar .../>` call in this file. Thread
  `builderMode`/`onSetBuilderMode` through that same bridge (add them to
  the `headerProps` object and its effect's dependency array in
  `ResumeBuilderPage.jsx`), then add the same two prop lines to `App.jsx`'s
  existing `<Toolbar .../>` call, matching the exact pattern every one of
  its other dozen props already uses.

**Interfaces:**
- Consumes: `isDirectEditSupported` (Task 2), `CVPreview` (with the new
  `directEditDispatch` prop from Tasks 6-7).
- Produces: `DirectEditPreview` (props: `formData`, `dispatchFormData`,
  `selectedTemplate`, `templateConfig`, `locale`, `accentColor`,
  `headingColor`, `onOpenTemplateGallery`, `onOpenSectionsMenu` — the
  last one is a Task 9 hook-up, passed through but not yet implemented
  until Task 9). `ResumeBuilderPage` renders this in place of the
  Classic-mode two-column layout when `uiState.builderMode === 'direct'`.

- [ ] **Step 1: Write `DirectEditPreview`**

  Create `src/components/DirectEditPreview.jsx`:

  ```jsx
  import CVPreview from './CVPreview'
  import { isDirectEditSupported } from '../utils/directEdit'

  export default function DirectEditPreview({
    formData,
    dispatchFormData,
    selectedTemplate,
    templateConfig,
    locale,
    theme,
    accentColor,
    headingColor,
    classicNameAlignment,
  }) {
    const isFinnish = locale === 'fi'
    const isSupported = isDirectEditSupported(selectedTemplate)

    return (
      <div className="direct-edit-preview">
        {!isSupported ? (
          <p className="direct-edit-preview__notice">
            {isFinnish
              ? `Suora muokkaus ei ole vielä käytössä pohjalle "${templateConfig.label}". Vaihda Classic-tilaan muokataksesi, tai valitse toinen pohja.`
              : `Direct Edit isn't available yet for "${templateConfig.label}". Switch to Classic to edit, or pick a different template.`}
          </p>
        ) : null}
        <CVPreview
          formData={formData}
          theme={theme}
          template={selectedTemplate}
          locale={locale}
          atsFriendlyMode={false}
          accentColor={accentColor}
          headingColor={headingColor}
          classicNameAlignment={classicNameAlignment}
          directEditDispatch={isSupported ? dispatchFormData : null}
        />
      </div>
    )
  }
  ```

- [ ] **Step 2: Style the wrapper and notice**

  Append to `src/styles/direct-edit.css`:

  ```css
  .direct-edit-preview {
    max-width: var(--preview-paper-width, 56rem);
    margin: 0 auto;
  }

  .direct-edit-preview__notice {
    margin: 0 0 1rem;
    padding: 10px 14px;
    border-radius: 8px;
    background: var(--ds-surface-muted, #fafaf9);
    border: 1px solid var(--ds-border, #e4e4e7);
    font-size: 0.8125rem;
    color: var(--ds-text-secondary, #52525b);
  }
  ```

- [ ] **Step 3: Add the toolbar mode switcher**

  In `src/components/Toolbar.jsx`, add two new props to the destructured
  signature (alongside the existing `onOpenTemplateGallery`):

  ```js
  builderMode = 'classic',
  onSetBuilderMode = () => {},
  ```

  Add the switcher control next to the template trigger (find the
  `className="app-toolbar__template-trigger"` button and add this
  sibling immediately before it):

  ```jsx
  <div className="app-toolbar__mode-switch" role="tablist" aria-label={locale === 'fi' ? 'Muokkaustila' : 'Builder mode'}>
    <button
      type="button"
      role="tab"
      aria-selected={builderMode === 'classic'}
      className={`app-toolbar__mode-switch-btn${builderMode === 'classic' ? ' app-toolbar__mode-switch-btn--active' : ''}`}
      onClick={() => onSetBuilderMode('classic')}
    >
      {locale === 'fi' ? 'Klassinen' : 'Classic'}
    </button>
    <button
      type="button"
      role="tab"
      aria-selected={builderMode === 'direct'}
      className={`app-toolbar__mode-switch-btn${builderMode === 'direct' ? ' app-toolbar__mode-switch-btn--active' : ''}`}
      onClick={() => onSetBuilderMode('direct')}
    >
      {locale === 'fi' ? 'Suora muokkaus' : 'Direct Edit'}
    </button>
  </div>
  ```

  (`locale` must already be in scope in `Toolbar.jsx` — confirm via its
  existing props before adding; every other toolbar control already
  branches EN/FI text the same way.)

- [ ] **Step 4: Style the toolbar switcher**

  Append to `src/styles/direct-edit.css`:

  ```css
  .app-toolbar__mode-switch {
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    border-radius: 8px;
    background: var(--ds-surface-muted, #fafaf9);
    border: 1px solid var(--ds-border, #e4e4e7);
  }

  .app-toolbar__mode-switch-btn {
    border: none;
    background: transparent;
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--ds-text-secondary, #52525b);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
  }

  .app-toolbar__mode-switch-btn--active {
    background: var(--ds-surface, #ffffff);
    color: var(--ds-text-primary, #18181b);
    box-shadow: 0 0 0 1px var(--ds-border-strong, #d4d4d8);
  }
  ```

- [ ] **Step 5: Wire `ResumeBuilderPage.jsx`**

  1. Import: `import DirectEditPreview from '../components/DirectEditPreview'`
     and `UI_BUILDER_MODE_STORAGE_KEY` from `'../utils/designSystem'`
     (extend the existing import line).
  2. Destructure `builderMode` out of `uiState` alongside the existing
     `selectedTemplate` etc.
  3. Add a persistence effect next to the existing
     `UI_NAV_RAIL_COLLAPSED_STORAGE_KEY` one:

     ```js
     useEffect(() => {
       setStorageValue(UI_BUILDER_MODE_STORAGE_KEY, builderMode)
     }, [builderMode, setStorageValue])
     ```

  4. Add a handler next to the other `handleToggleXxx`/`handleSetXxx`
     callbacks:

     ```js
     const handleSetBuilderMode = useCallback(
       (mode) => dispatchUi({ type: UI_ACTION.SET_BUILDER_MODE, mode }),
       [dispatchUi],
     )
     ```

  5. Pass `builderMode={builderMode}` and
     `onSetBuilderMode={handleSetBuilderMode}` to the existing `<Toolbar
     .../>` element.
  6. At the top-level return — search for where the memoized form column
     (`formColumn`, the `useMemo` block containing `<CVForm ...>`, see
     Task-adjacent context above) and the preview column are composed
     together into the page's two-column layout — wrap that composition:

     ```jsx
     {builderMode === 'direct' ? (
       <DirectEditPreview
         formData={formData}
         dispatchFormData={dispatchFormData}
         selectedTemplate={selectedTemplate}
         templateConfig={currentTemplate}
         locale={locale}
         theme={theme}
         accentColor={resolvedAccentColor}
         headingColor={resolvedHeadingColor}
         classicNameAlignment={classicNameAlignment}
       />
     ) : (
       <>
         {formColumn}
         {previewColumn}
       </>
     )}
     ```

     Match the exact prop names/variables already in scope at that point
     in the file (`resolvedAccentColor`/`resolvedHeadingColor` or
     whatever `<CVPreview>`'s own existing call site already passes for
     `accentColor`/`headingColor` — copy those exact expressions rather
     than the placeholder names above if they differ).

- [ ] **Step 6: Run lint and build**

  Run: `npm run lint && npm run build`
  Expected: both clean.

- [ ] **Step 7: Manual smoke check**

  `npm run dev`, load the demo CV, select Minimalist, click "Direct
  Edit" in the toolbar. Confirm: the two-column layout disappears in
  favor of one full-width preview; clicking the name/title/contact/
  about/experience role/company/description text edits it in place;
  typing in the name field and switching back to "Classic" shows the
  same new name in the Classic form's Full Name field; switching to a
  template other than Minimalist while in Direct Edit mode shows the
  "isn't available yet" notice and a read-only preview, with no crash and
  no lost data when switching back to Minimalist.

- [ ] **Step 8: Commit**

  ```bash
  git add src/components/DirectEditPreview.jsx src/components/Toolbar.jsx src/pages/ResumeBuilderPage.jsx src/styles/direct-edit.css
  git commit -m "Add the Direct Edit builder mode: toolbar switcher and page wiring"
  ```

---

### Task 9: Sections menu (visibility)

**Files:**
- Create: `src/components/SectionsMenu.jsx`
- Modify: `src/components/DirectEditPreview.jsx`
- Modify: `src/styles/direct-edit.css`

**Interfaces:**
- Consumes: `FORM_ACTION.TOGGLE_SECTION_VISIBILITY` (existing action,
  `{ section }`), `templateConfig.primarySections`/`secondarySections`,
  `normalizeSectionOrder` from `src/utils/cvForm.js` (the same helper
  `CVForm.jsx` already uses to build its own ordered section-key list —
  confirm the exact import path/name before use).
- Produces: `<SectionsMenu formData={formData} dispatchFormData={dispatchFormData} templateConfig={templateConfig} locale={locale} />`,
  a small toolbar-adjacent popover. Mounted inside `DirectEditPreview`,
  not the app's global `Toolbar.jsx` (it needs `templateConfig`/
  `formData`, which are already in scope in `DirectEditPreview`, not
  threaded into `Toolbar`).

- [ ] **Step 1: Write the component**

  Create `src/components/SectionsMenu.jsx`:

  ```jsx
  import { useState } from 'react'
  import { normalizeSectionOrder } from '../utils/cvForm'
  import { FORM_ACTION } from '../reducers/cvFormReducer'

  // Wording here must stay in sync with `sectionVisibilityFieldsEn`/`Fi` in
  // `src/utils/cvForm.js` (CVForm.jsx's own nav rail source), so the Direct
  // Edit menu and the Classic "Visible sections" panel never disagree on a
  // label for the same section key. Note `coreStrengths: 'Core Strengths'`
  // (capital S) — matches `cvForm.js`'s own field exactly, not a lowercase
  // guess.
  const SECTION_LABELS_EN = {
    about: 'About', experience: 'Experience', education: 'Education', skills: 'Skills',
    projects: 'Projects', links: 'Links', languages: 'Languages', certificates: 'Certificates',
    coreStrengths: 'Core Strengths', achievements: 'Achievements', interests: 'Interests',
    openSource: 'Open Source', publications: 'Publications', leadership: 'Leadership Experience',
    memberships: 'Professional Memberships', speaking: 'Speaking', volunteering: 'Volunteering',
    internships: 'Internships', caseStudies: 'Case Studies', testimonials: 'Testimonials',
  }
  const SECTION_LABELS_FI = {
    about: 'Esittely', experience: 'Kokemus', education: 'Koulutus', skills: 'Taidot',
    projects: 'Projektit', links: 'Linkit', languages: 'Kielet', certificates: 'Sertifikaatit',
    coreStrengths: 'Vahvuudet', achievements: 'Saavutukset', interests: 'Kiinnostuksen kohteet',
    openSource: 'Avoin lähdekoodi', publications: 'Julkaisut', leadership: 'Johtamiskokemus',
    memberships: 'Ammattijäsenyydet', speaking: 'Esiintymiset', volunteering: 'Vapaaehtoistyö',
    internships: 'Harjoittelut', caseStudies: 'Tapaustutkimukset', testimonials: 'Suositukset',
  }

  export default function SectionsMenu({ formData, dispatchFormData, templateConfig, locale }) {
    const [isOpen, setIsOpen] = useState(false)
    const isFinnish = locale === 'fi'
    const labels = isFinnish ? SECTION_LABELS_FI : SECTION_LABELS_EN
    const templateSectionOrder = [
      ...templateConfig.primarySections,
      ...templateConfig.secondarySections,
    ]
    // normalizeSectionOrder always appends every CV_SECTION_ORDER_KEYS entry
    // at the end (not just the ones passed as its fallback argument), so —
    // exactly like CVForm.jsx's own nav rail does — its raw output has to be
    // filtered back down to the sections this template actually supports.
    // Skipping this filter would offer toggles for sections the template
    // never renders at all.
    const templateSectionKeySet = new Set(templateSectionOrder)
    const sections = normalizeSectionOrder(formData.sectionOrder, templateSectionOrder)
      .filter((section) => templateSectionKeySet.has(section))

    return (
      <div className="direct-edit-sections">
        <button
          type="button"
          className="direct-edit-sections__trigger"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
        >
          {isFinnish ? 'Osiot' : 'Sections'}
        </button>
        {isOpen ? (
          <div className="direct-edit-sections__panel">
            {sections.map((section) => (
              <label key={section} className="direct-edit-sections__row">
                <input
                  type="checkbox"
                  checked={formData.sectionVisibility?.[section] !== false}
                  onChange={() => dispatchFormData({ type: FORM_ACTION.TOGGLE_SECTION_VISIBILITY, section })}
                />
                {labels[section] || section}
              </label>
            ))}
          </div>
        ) : null}
      </div>
    )
  }
  ```

  `SECTION_LABELS_EN`/`SECTION_LABELS_FI` cover the sections Minimalist's
  own `primarySections`/`secondarySections` actually list (confirm the
  exact set in `src/components/templates/minimal.js` — add any missing
  key using the same English/Finnish label text `CVForm.jsx`'s own nav
  rail already uses for that section, so the two controls never disagree
  on wording).

- [ ] **Step 2: Style it**

  Append to `src/styles/direct-edit.css`:

  ```css
  .direct-edit-sections {
    position: absolute;
    top: 14px;
    right: 14px;
    /* z-index:auto is not enough here: the CV preview's header content it
       overlaps is a plain, non-positioned element, yet real-browser paint/
       hit-testing still puts that content above this popover without an
       explicit z-index, making the trigger unclickable — verified via
       elementsFromPoint. */
    z-index: 5;
  }

  .direct-edit-sections__trigger {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--ds-text-secondary, #52525b);
    background: var(--ds-surface, #ffffff);
    border: 1px solid var(--ds-border, #e4e4e7);
    border-radius: 999px;
    padding: 6px 11px;
    cursor: pointer;
  }

  .direct-edit-sections__panel {
    position: absolute;
    top: 38px;
    right: 0;
    min-width: 168px;
    background: var(--ds-surface, #ffffff);
    border: 1px solid var(--ds-border, #e4e4e7);
    border-radius: 10px;
    padding: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .direct-edit-sections__row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8125rem;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
  }

  .direct-edit-sections__row:hover {
    background: var(--ds-surface-muted, #fafaf9);
  }
  ```

  Add `position: relative;` to `.direct-edit-preview` in the same file
  (Task 8's rule) so `.direct-edit-sections`'s `position: absolute`
  anchors to the preview wrapper, not the page.

- [ ] **Step 3: Mount it in `DirectEditPreview`**

  In `src/components/DirectEditPreview.jsx`, import and render
  `SectionsMenu` only when the template is supported (an unsupported
  template's fallback notice has nothing for it to control yet):

  ```jsx
  import SectionsMenu from './SectionsMenu'
  ```

  and, inside the returned `<div className="direct-edit-preview">`,
  before `<CVPreview .../>`:

  ```jsx
  {isSupported ? (
    <SectionsMenu
      formData={formData}
      dispatchFormData={dispatchFormData}
      templateConfig={templateConfig}
      locale={locale}
    />
  ) : null}
  ```

- [ ] **Step 4: Run lint**

  Run: `npm run lint`
  Expected: clean.

- [ ] **Step 5: Manual smoke check**

  In Direct Edit mode on Minimalist, open "Sections", toggle Skills off —
  confirm the Skills block disappears from the preview immediately;
  toggle it back on. Switch to Classic mode and confirm the nav rail's
  own "Visible sections" panel shows the same on/off state (same
  `formData.sectionVisibility`, no divergence).

- [ ] **Step 6: Commit**

  ```bash
  git add src/components/SectionsMenu.jsx src/components/DirectEditPreview.jsx src/styles/direct-edit.css
  git commit -m "Add the Direct Edit builder's Sections visibility menu"
  ```

---

### Task 10: html2canvas export spike, e2e coverage, and final verification

**Files:**
- Create: `e2e/direct-edit.spec.js`
- Modify: `src/components/DirectEditPreview.jsx`, `src/pages/ResumeBuilderPage.jsx`
  — **found while attempting this task's own spike, not anticipated when
  this plan was written:** `DirectEditPreview.jsx`'s `<CVPreview>` call
  never forwarded a `previewRef` prop, unlike Classic mode's call site
  (`ResumeBuilderPage.jsx`, which does pass `previewRef={previewRef}`).
  `CVPreview.jsx` defaults `previewRef` to `null` and wires it onto the
  export-root DOM node via `ref={previewRef}` — so PDF export was
  completely broken in Direct Edit mode for every user (`exportCvAsPdf`
  throws immediately when the ref is unpopulated), independent of the
  spike's own focus-state question. This was a gap in Task 8, not
  something this task introduced. Fix: thread `previewRef` through both
  `ResumeBuilderPage.jsx`'s `<DirectEditPreview>` call and
  `DirectEditPreview.jsx`'s own `<CVPreview>` call, as a prerequisite to
  running the spike at all.

**Interfaces:**
- Consumes: the full stack built in Tasks 1-9. Originally scoped as
  verification-only (no new production code) — amended above once a real,
  blocking production bug surfaced while attempting to run this task's own
  spike.

- [ ] **Step 1: html2canvas export risk spike (spec-mandated, do not skip)**

  The spec (`docs/superpowers/specs/2026-09-13-direct-edit-builder-design.md`,
  "Open risk to verify in Phase 1") flags that `html2canvas`-based PDF
  export reads `data-export-*` attributes off the same Showcase DOM nodes
  `EditableField` now makes `contenteditable`, and that whether a PDF
  exported *while actively in Direct Edit mode* picks up any editing
  chrome (spellcheck underline styling, `-webkit-user-modify`, a stray
  caret) needs a real check, not an assumption.

  Manual verification:
  1. `npm run dev`, load the demo CV, select Minimalist, switch to Direct
     Edit mode.
  2. Click into the About paragraph (leave it focused, mid-edit — the
     highest-risk state, since a focused `contenteditable` element is
     where a browser is most likely to inject visible editing UI) and, in
     a second action without blurring it, trigger PDF export from the
     toolbar's Export menu.
  3. Open the resulting PDF and visually inspect the About section:
     confirm there is no visible caret, no dotted/wavy spellcheck
     underline, no focus outline, and the text renders in the template's
     normal ink color (not a browser default like `-webkit-focus-ring-color`
     leaking through).
  4. Repeat once more with the name field mid-edit instead of About.
  5. Record the result directly in this plan file's own commit message
     for this step (below) — "leak" or "clean" — so it's on record for
     whoever reads Phase 2's history.

  **If clean:** no code change needed, proceed to Step 2.

  **If it leaks:** the fix is narrow and was anticipated in the spec —
  make `handleExportClick`'s existing export flow blur the currently
  focused element before capturing (`document.activeElement?.blur?.()`,
  called once at the top of the export handler in
  `src/pages/ResumeBuilderPage.jsx`, before the existing export logic
  runs) so `html2canvas` never captures a genuinely-focused
  `contenteditable` node. Add this one line, re-run this spike's manual
  check to confirm it resolves the leak, then continue.

  Commit whichever outcome occurred:

  ```bash
  git commit --allow-empty -m "Verify html2canvas export is clean with a focused Direct Edit field (spike, no leak found)"
  ```

  (or, if the blur fix was needed, fold it into a real commit with
  `git add src/pages/ResumeBuilderPage.jsx` and a message describing the
  fix instead of the empty commit above).

- [ ] **Step 2: Write the spec**

  Create `e2e/direct-edit.spec.js`, following this project's existing
  Playwright conventions (see `e2e/templates.spec.js`/`e2e/editor.spec.js`
  for the exact demo-CV-load and template-selection helpers already in
  use — reuse them rather than re-deriving selectors):

  ```js
  import { test, expect } from '@playwright/test'

  test.describe('Direct Edit builder', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/cv')
      await page.getByRole('button', { name: 'Load demo CV' }).click()
    })

    test('switching to Direct Edit shows one full-width editable preview', async ({ page }) => {
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
      await expect(page.locator('.direct-edit-preview')).toBeVisible()
      await expect(page.locator('.app-toolbar__template-trigger')).toBeVisible()
    })

    test('editing the name in Direct Edit mode persists after switching back to Classic', async ({ page }) => {
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
      const nameField = page.locator('.direct-edit-preview [data-placeholder], .direct-edit-preview h3 .direct-edit-field').first()
      await nameField.click()
      await page.keyboard.press('Control+A')
      await page.keyboard.type('Jordan Rivera')
      await nameField.blur()

      await page.getByRole('tab', { name: 'Classic' }).click()
      await expect(page.getByLabel('Full name')).toHaveValue('Jordan Rivera')
    })

    test('adding an experience entry in Direct Edit mode adds one to the form', async ({ page }) => {
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
      const before = await page.locator('.direct-edit-preview .direct-edit-entry').count()
      await page.locator('.direct-edit-add-row', { hasText: 'Add experience' }).click()
      await expect(page.locator('.direct-edit-preview .direct-edit-entry')).toHaveCount(before + 1)
    })

    test('an unsupported template shows the read-only notice and no crash', async ({ page }) => {
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
      await page.getByRole('button', { name: /select template/i }).click()
      await page.getByText('Executive', { exact: true }).click()
      await expect(page.locator('.direct-edit-preview__notice')).toBeVisible()
      await expect(page.locator('.direct-edit-preview [contenteditable="true"]')).toHaveCount(0)
    })
  })
  ```

  Adjust selectors that don't match this project's real DOM (confirm the
  template gallery's trigger `aria-label` and Classic-mode's "Full name"
  field label against `e2e/templates.spec.js`'s existing `selectTemplate`
  helper and `e2e/editor.spec.js` before finalizing — do not guess where
  a working example already exists in the repo).

- [ ] **Step 3: Run the new spec alone**

  Run: `npx playwright test e2e/direct-edit.spec.js`
  Expected: all 4 tests pass.

- [ ] **Step 4: Run full verification**

  Run, in order:

  ```bash
  npm run lint
  npm run check:reducers
  npm run check:direct-edit
  npm run build
  npm run test:e2e
  ```

  Expected: all clean, full e2e suite green (existing tests plus the 4
  new ones).

- [ ] **Step 5: Bump the version**

  Per this project's standing convention
  ([[feedback-version-bump-cadence]]): bump `package.json`'s patch
  version, standalone commit.

- [ ] **Step 6: Commit**

  ```bash
  git add e2e/direct-edit.spec.js
  git commit -m "Add e2e coverage for the Direct Edit builder (Phase 1)"
  git add package.json
  git commit -m "Bump version to <next>"
  ```

---

## After Phase 1

Phase 1 proves the mechanism on one template. Phase 2 (rollout to the
other 17 templates, grouped by structural family per the spec) and
Phase 3 (keyboard/mobile/accessibility polish, the default-mode decision)
each get their own implementation plan when this one ships — same
per-template cadence this branch's parent (`v1.2.0`) already used for
Editorial/Portrait/European.
