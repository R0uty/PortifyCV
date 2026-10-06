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
import { useState } from 'react'
import { useDirectEdit } from './DirectEditContext'
import InlineTagEditor from './fields/InlineTagEditor'
import { FORM_ACTION } from '../reducers/cvFormReducer'

function EditableListEntry({ id, onRemove, dragLabel, removeLabel, children }) {
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
        aria-label={dragLabel}
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

export default function EditableList({ section, items, addLabel, removeLabel, children }) {
  const { isEditing, dispatchFormData, locale } = useDirectEdit()
  const isFinnish = locale === 'fi'
  const dragLabel = isFinnish ? 'Järjestä vetämällä' : 'Drag to reorder'
  const resolvedRemoveLabel = removeLabel ?? (isFinnish ? 'Poista kohta' : 'Remove entry')
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
            dragLabel={dragLabel}
            removeLabel={resolvedRemoveLabel}
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

// Is `text` already one of `allSkills`, other than the skill at `ownIndex`?
// Same case-insensitive rule ADD_SKILL and UPDATE_SKILL apply.
function isDuplicateSkill(allSkills, text, ownIndex = -1) {
  const lower = text.toLowerCase()
  return allSkills.some((skill, index) => index !== ownIndex && skill.toLowerCase() === lower)
}

function skillCopy(locale) {
  const isFinnish = locale === 'fi'
  return {
    edit: (skill) => (isFinnish ? `Muokkaa taitoa: ${skill}` : `Edit skill: ${skill}`),
    remove: (skill) => (isFinnish ? `Poista taito: ${skill}` : `Remove skill: ${skill}`),
    newSkill: isFinnish ? 'Uusi taito' : 'New skill',
    duplicate: isFinnish ? 'Jo listalla' : 'Already listed',
  }
}

// One skill chip: its text is a button that turns into an inline editor,
// and the × is a separate button. (The whole chip used to be the remove
// button, so any click on a skill deleted it and nothing could rename it.)
// The outer element keeps .direct-edit-chip because template stylesheets
// select on it (e.g. modernOrange.css's `:has(> .direct-edit-chip)`).
function SkillChip({ skill, index, allSkills }) {
  const { dispatchFormData, locale } = useDirectEdit()
  const [isEditing, setIsEditing] = useState(false)
  const copy = skillCopy(locale)

  return (
    <span className="direct-edit-chip direct-edit-chip--removable">
      {isEditing ? (
        <InlineTagEditor
          value={skill}
          className="direct-edit-chip__editor"
          ariaLabel={copy.edit(skill)}
          duplicateMessage={copy.duplicate}
          onCommit={(text) => {
            if (text && isDuplicateSkill(allSkills, text, index)) return false
            dispatchFormData({ type: FORM_ACTION.UPDATE_SKILL, index, skill: text })
            return true
          }}
          onDone={() => setIsEditing(false)}
        />
      ) : (
        <button
          type="button"
          className="direct-edit-chip__label"
          aria-label={copy.edit(skill)}
          onClick={() => setIsEditing(true)}
        >
          {skill}
        </button>
      )}
      <button
        type="button"
        className="direct-edit-chip__remove"
        aria-label={copy.remove(skill)}
        onClick={() => dispatchFormData({ type: FORM_ACTION.REMOVE_SKILL, index })}
      >
        <span aria-hidden="true">×</span>
      </button>
    </span>
  )
}

// "+ Add" opens an empty chip with the cursor in it; nothing is added until
// the user types a skill, and leaving it empty adds nothing.
function AddSkillChip({ allSkills, addLabel }) {
  const { dispatchFormData, locale } = useDirectEdit()
  const [isAdding, setIsAdding] = useState(false)
  const copy = skillCopy(locale)

  if (!isAdding) {
    return (
      <button type="button" className="direct-edit-chip-add" onClick={() => setIsAdding(true)}>
        {addLabel}
      </button>
    )
  }

  return (
    <span className="direct-edit-chip direct-edit-chip--removable direct-edit-chip--new">
      <InlineTagEditor
        value=""
        className="direct-edit-chip__editor"
        ariaLabel={copy.newSkill}
        duplicateMessage={copy.duplicate}
        onCommit={(text) => {
          if (!text) return true
          if (isDuplicateSkill(allSkills, text)) return false
          dispatchFormData({ type: FORM_ACTION.ADD_SKILL, skill: text })
          return true
        }}
        onDone={() => setIsAdding(false)}
      />
    </span>
  )
}

export function EditableChip({ skills, addLabel = '+ Add' }) {
  const { isEditing } = useDirectEdit()

  if (!isEditing) {
    return null
  }

  return (
    <>
      {skills.map((skill, index) => (
        <SkillChip key={`${skill}:${index}`} skill={skill} index={index} allSkills={skills} />
      ))}
      <AddSkillChip allSkills={skills} addLabel={addLabel} />
    </>
  )
}

// Categorized sibling of EditableChip above, for templates whose Skills
// display groups skills by a DERIVED category (parseSkillCategories in
// templates/shared.jsx buckets by regex against each skill's own text —
// there is no stored per-skill category field). `categories` items carry
// each skill's ORIGINAL formData.skills index (computed by the caller,
// since categorization loses positional order) so REMOVE_SKILL always
// targets the correct flat-array entry regardless of which group it's
// displayed under. This component just consumes the {skill, index} pairs
// it's given — it does no text->index lookup itself. Skill text is NOT
// guaranteed unique within formData.skills (ADD_SKILL and the TagsInput UI
// both dedup on that entry path, but JSON import via parseImportedCvData
// does not), so the caller assigns indices positionally via a per-text
// queue in encounter order, giving each duplicate-text entry its own
// distinct index rather than collapsing them. One shared "+ Add" button
// for the whole section, not one per category — a newly added skill is
// appended to the end of the flat array and re-categorized on the next
// render, so a per-category add button would misleadingly imply the new
// chip lands in that group.
export function EditableCategorizedChip({ categories, addLabel = '+ Add' }) {
  const { isEditing } = useDirectEdit()

  if (!isEditing) {
    return null
  }

  // Back to the flat list, in formData order, for the duplicate check.
  const allSkills = []
  categories.forEach((cat) => cat.items.forEach(({ skill, index }) => { allSkills[index] = skill }))

  return (
    <>
      {categories.map((cat) => (
        <div key={cat.key} className="direct-edit-chip-group">
          <span className="direct-edit-chip-group__label">{cat.label}</span>
          <div className="direct-edit-chip-group__chips">
            {cat.items.map(({ skill, index }) => (
              <SkillChip key={`${skill}:${index}`} skill={skill} index={index} allSkills={allSkills} />
            ))}
          </div>
        </div>
      ))}
      <AddSkillChip allSkills={allSkills} addLabel={addLabel} />
    </>
  )
}
