import { useEffect, useRef, useState } from 'react'

// One tag's text as an editable input — shared by Classic's TagsInput, Direct
// Edit's skill chips and the Skills popup, so renaming a skill behaves the
// same everywhere. Enter or clicking away saves, Escape cancels.
//
// `onCommit(text)` gets the trimmed text and returns false to refuse it (a
// duplicate): Enter then keeps the editor open with `duplicateMessage`
// shown, while clicking away gives up and restores the original, so the user
// is never stuck in an editor they've left. Empty text is passed through;
// callers treat it as "remove this tag" (or "add nothing" for a new one).
//
// `persistent` keeps the input on screen after saving or cancelling (the
// popup's always-editable rows); otherwise `onDone()` closes the editor.
export default function InlineTagEditor({
  value = '',
  onCommit,
  onDone = () => {},
  ariaLabel,
  className = '',
  duplicateMessage = '',
  persistent = false,
  autoFocus = true,
}) {
  const [draft, setDraft] = useState(value)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const inputRef = useRef(null)
  // Enter and Escape blur a non-persistent editor as they close it; this
  // stops that blur from committing a second time.
  const settledRef = useRef(false)

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [autoFocus])

  const settle = () => {
    settledRef.current = true
    onDone()
  }

  const commit = ({ fromBlur }) => {
    const text = draft.trim()

    if (text === value) {
      setDraft(value)
      setIsDuplicate(false)
      if (!persistent) settle()
      return
    }

    if (onCommit(text) === false) {
      if (fromBlur) {
        setDraft(value)
        setIsDuplicate(false)
        if (!persistent) settle()
      } else {
        setIsDuplicate(true)
      }
      return
    }

    setIsDuplicate(false)
    if (persistent) setDraft(text)
    else settle()
  }

  const cancel = () => {
    setDraft(value)
    setIsDuplicate(false)
    if (persistent) {
      // The blur below would otherwise commit the typed text: the reset
      // above hasn't rendered yet when its handler runs.
      settledRef.current = true
      inputRef.current?.blur()
    } else {
      settle()
    }
  }

  return (
    <span className={`inline-tag-editor ${className}`.trim()}>
      <input
        ref={inputRef}
        type="text"
        className="inline-tag-editor__input"
        value={draft}
        size={Math.max(draft.length, 4)}
        aria-label={ariaLabel}
        aria-invalid={isDuplicate || undefined}
        onChange={(event) => {
          setDraft(event.target.value)
          setIsDuplicate(false)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit({ fromBlur: false })
          } else if (event.key === 'Escape') {
            event.preventDefault()
            // Don't let Escape also close a surrounding popup or modal.
            event.stopPropagation()
            cancel()
          }
        }}
        onBlur={() => {
          if (settledRef.current) {
            settledRef.current = false
            return
          }
          commit({ fromBlur: true })
        }}
      />
      {isDuplicate && duplicateMessage ? (
        <span className="inline-tag-editor__notice" role="status">{duplicateMessage}</span>
      ) : null}
    </span>
  )
}
