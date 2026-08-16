import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react'

function ReorderableListInput({
  items = [],
  onChange = () => {},
  placeholder = '',
  addLabel = 'Add',
  itemAriaLabel = 'Item',
}) {
  // Items are plain strings with no identity of their own, but reordering
  // needs a key that follows the moved value (not its slot) so keyboard
  // focus stays on the row the user just moved. `ids` mirrors every
  // add/remove/move below in lockstep, so ids track values across renders
  // instead of being re-derived from position.
  const [ids, setIds] = useState(() => items.map((_, index) => index))
  const [prevItems, setPrevItems] = useState(items)
  const [nextId, setNextId] = useState(items.length)

  // Reconcile when `items` changes for a reason other than the handlers
  // below (e.g. the parent resets the whole list) — our own handlers
  // already keep `ids` the same length as `items`, so this only fires on
  // an external replacement.
  if (items !== prevItems) {
    setPrevItems(items)

    if (items.length !== ids.length) {
      let allocated = nextId
      const reconciled = items.map((_, index) => {
        if (index < ids.length) {
          return ids[index]
        }

        return allocated++
      })

      setIds(reconciled)
      setNextId(allocated)
    }
  }

  const updateAt = (index, nextValue) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? nextValue : item)))
  }

  const removeAt = (index) => {
    setIds(ids.filter((_, itemIndex) => itemIndex !== index))
    onChange(items.filter((_, itemIndex) => itemIndex !== index))
  }

  const moveBy = (index, direction) => {
    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= items.length) {
      return
    }

    const nextItems = [...items]
    const [movedItem] = nextItems.splice(index, 1)
    nextItems.splice(targetIndex, 0, movedItem)

    const nextIds = [...ids]
    const [movedId] = nextIds.splice(index, 1)
    nextIds.splice(targetIndex, 0, movedId)

    setIds(nextIds)
    onChange(nextItems)
  }

  const addItem = () => {
    setIds([...ids, nextId])
    setNextId(nextId + 1)
    onChange([...items, ''])
  }

  return (
    <div className="reorderable-list">
      {items.map((item, index) => (
        <div className="reorderable-list__row" key={ids[index] ?? index}>
          <input
            type="text"
            className="reorderable-list__input"
            value={item}
            placeholder={placeholder}
            aria-label={`${itemAriaLabel} ${index + 1}`}
            onChange={(event) => updateAt(index, event.target.value)}
          />
          <div className="reorderable-list__actions">
            <button
              type="button"
              className="reorderable-list__icon-button"
              onClick={() => moveBy(index, -1)}
              disabled={index === 0}
              aria-label={`Move ${itemAriaLabel.toLowerCase()} ${index + 1} up`}
            >
              <ChevronUp size={14} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="reorderable-list__icon-button"
              onClick={() => moveBy(index, 1)}
              disabled={index === items.length - 1}
              aria-label={`Move ${itemAriaLabel.toLowerCase()} ${index + 1} down`}
            >
              <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="reorderable-list__icon-button reorderable-list__icon-button--danger"
              onClick={() => removeAt(index)}
              aria-label={`Remove ${itemAriaLabel.toLowerCase()} ${index + 1}`}
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="reorderable-list__add" onClick={addItem}>
        <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
        {addLabel}
      </button>
    </div>
  )
}

export default ReorderableListInput
