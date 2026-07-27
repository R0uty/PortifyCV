import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react'

function ReorderableListInput({
  items = [],
  onChange = () => {},
  placeholder = '',
  addLabel = 'Add',
  itemAriaLabel = 'Item',
}) {
  const updateAt = (index, nextValue) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? nextValue : item)))
  }

  const removeAt = (index) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index))
  }

  const moveBy = (index, direction) => {
    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= items.length) {
      return
    }

    const next = [...items]
    const [moved] = next.splice(index, 1)

    next.splice(targetIndex, 0, moved)
    onChange(next)
  }

  const addItem = () => {
    onChange([...items, ''])
  }

  return (
    <div className="reorderable-list">
      {items.map((item, index) => (
        <div className="reorderable-list__row" key={index}>
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
