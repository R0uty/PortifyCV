import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, Copy, Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react'

function SortableItemCard({
  id,
  title,
  badge = null,
  isCollapsed = false,
  onToggleCollapse = () => {},
  isHidden = false,
  onToggleVisibility,
  onDuplicate,
  onRemove,
  canRemove = true,
  hideLabel = 'Hide',
  showLabel = 'Show',
  duplicateLabel = 'Duplicate',
  removeLabel = 'Remove',
  dragLabel = 'Drag to reorder',
  children,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-card${isDragging ? ' sortable-card--dragging' : ''}${isHidden ? ' sortable-card--hidden' : ''}`}
    >
      <div className="sortable-card__header">
        <button
          type="button"
          className="sortable-card__drag-handle"
          aria-label={dragLabel}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="sortable-card__title"
          onClick={onToggleCollapse}
          aria-expanded={!isCollapsed}
        >
          <ChevronDown
            size={15}
            strokeWidth={2}
            className={`sortable-card__chevron${isCollapsed ? ' sortable-card__chevron--collapsed' : ''}`}
            aria-hidden="true"
          />
          <span className="sortable-card__title-text">{title}</span>
          {badge}
        </button>
        <div className="sortable-card__actions">
          {onToggleVisibility ? (
            <button
              type="button"
              className="sortable-card__icon-button"
              onClick={onToggleVisibility}
              aria-label={isHidden ? showLabel : hideLabel}
              title={isHidden ? showLabel : hideLabel}
            >
              {isHidden ? (
                <EyeOff size={15} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Eye size={15} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          ) : null}
          {onDuplicate ? (
            <button
              type="button"
              className="sortable-card__icon-button"
              onClick={onDuplicate}
              aria-label={duplicateLabel}
              title={duplicateLabel}
            >
              <Copy size={15} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              className="sortable-card__icon-button sortable-card__icon-button--danger"
              onClick={onRemove}
              disabled={!canRemove}
              aria-label={removeLabel}
              title={removeLabel}
            >
              <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
      <div className={`sortable-card__body${isCollapsed ? ' sortable-card__body--collapsed' : ''}`}>
        <div className="sortable-card__body-inner">{children}</div>
      </div>
    </div>
  )
}

export default SortableItemCard
