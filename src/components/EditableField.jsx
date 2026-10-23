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

// The field's text as it should be stored. A lone "\n" is what deleting
// the last character can leave behind (a stray <br>), so it counts as
// empty. A one-line field never stores a line break (1.6.52): a pasted or
// typed one became part of the name, which Classic's <input> then showed
// with the words run together.
function normalizeFieldText(text, multiline) {
  if (text === '\n') {
    return ''
  }

  return multiline ? text : text.replace(/\n+$/, '').replace(/\s*\n+\s*/g, ' ')
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
  // The latest value, for the blur handler below.
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

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
      dispatchFormData(buildAction(path, normalizeFieldText(event.currentTarget.innerText ?? '', multiline)))
    },
    [dispatchFormData, path, multiline],
  )

  // The effect above leaves a focused field alone, and nothing re-runs it
  // once focus leaves. So a change that lands while the field has focus
  // (Undo clicked in Safari or Firefox on a Mac, where clicking a button
  // doesn't take focus from the field) used to stay invisible: the field
  // kept its old text, and the next keystroke saved it again (1.6.52).
  // Leaving the field shows what is stored.
  const handleBlur = useCallback(
    (event) => {
      const el = event.currentTarget
      const stored = valueRef.current || ''

      if (normalizeFieldText(el.innerText ?? '', multiline) !== stored) {
        el.textContent = stored
      }
    },
    [multiline],
  )

  // Paste as plain text only — a contentEditable field left to its
  // default paste behavior can pull in the source's own markup
  // (font, color, links), which would silently break the template's
  // own styling for that one field. A one-line field gets the text on
  // one line.
  const handlePaste = useCallback((event) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, multiline ? text : text.replace(/\s*\r?\n+\s*/g, ' ').trim())
  }, [multiline])

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
      onBlur={handleBlur}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
    />
  )
}
