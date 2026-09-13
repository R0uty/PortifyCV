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
          key={`${skill}:${index}`}
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
