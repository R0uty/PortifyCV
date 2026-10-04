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
      const text = event.currentTarget.innerText ?? ''
      // Deleting a field's last character can leave a lone <br> behind,
      // which innerText reports as "\n". Treat that as empty, or the field
      // would never get its placeholder back.
      dispatchFormData(buildAction(path, text === '\n' ? '' : text))
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
      if (event.key === 'Enter') {
        event.preventDefault()
        if (multiline) {
          document.execCommand('insertText', false, '\n')
        } else {
          event.currentTarget.blur()
        }
      }
    },
    [multiline],
  )

  if (!isEditing) {
    const text = typeof value === 'string' ? value.trim() : value
    return <Tag className={className}>{text || placeholder}</Tag>
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
