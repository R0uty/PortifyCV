import { useState } from 'react'
import { X } from 'lucide-react'

import InlineTagEditor from './InlineTagEditor'

function TagsInput({
  value = [],
  onChange = () => {},
  placeholder = '',
  ariaLabel = 'Tags',
  locale = 'en',
}) {
  const isFinnish = locale === 'fi'
  const [draft, setDraft] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)

  const commit = (rawTag) => {
    const tag = rawTag.trim()

    if (!tag) {
      setDraft('')
      return
    }

    if (value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      setDraft('')
      return
    }

    onChange([...value, tag])
    setDraft('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit(draft)
      return
    }

    if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeAt = (index) => {
    onChange(value.filter((_, itemIndex) => itemIndex !== index))
  }

  // Renames one tag in place: empty removes it, and a case-insensitive
  // duplicate of another tag is refused (same rule as adding one).
  const renameAt = (index, text) => {
    if (!text) {
      removeAt(index)
      return true
    }

    if (value.some((existing, itemIndex) => itemIndex !== index && existing.toLowerCase() === text.toLowerCase())) {
      return false
    }

    onChange(value.map((existing, itemIndex) => (itemIndex === index ? text : existing)))
    return true
  }

  // Pasting a comma- or newline-separated list (e.g. copied from a job post)
  // should split into separate tags instead of landing as one tag with
  // commas in it. A single pasted word falls through to the default paste
  // behavior and just fills the draft as normal.
  const handlePaste = (event) => {
    const text = event.clipboardData.getData('text')

    if (!/[,\n]/.test(text)) {
      return
    }

    event.preventDefault()

    const seen = new Set(value.map((existing) => existing.toLowerCase()))
    const additions = []

    for (const part of text.split(/[,\n]/).map((piece) => piece.trim()).filter(Boolean)) {
      const key = part.toLowerCase()

      if (!seen.has(key)) {
        seen.add(key)
        additions.push(part)
      }
    }

    if (additions.length > 0) {
      onChange([...value, ...additions])
    }

    setDraft('')
  }

  return (
    <div className="tags-input">
      {value.map((tag, index) => (
        <span className="tags-input__tag" key={`${tag}-${index}`}>
          {editingIndex === index ? (
            <InlineTagEditor
              value={tag}
              onCommit={(text) => renameAt(index, text)}
              onDone={() => setEditingIndex(null)}
              ariaLabel={isFinnish ? `Muokkaa: ${tag}` : `Edit ${tag}`}
              duplicateMessage={isFinnish ? 'Tämä on jo listalla.' : 'Already listed.'}
            />
          ) : (
            <button
              type="button"
              className="tags-input__label"
              onClick={() => setEditingIndex(index)}
              aria-label={isFinnish ? `Muokkaa: ${tag}` : `Edit ${tag}`}
              title={isFinnish ? 'Muokkaa' : 'Edit'}
            >
              {tag}
            </button>
          )}
          <button
            type="button"
            className="tags-input__remove"
            onClick={() => removeAt(index)}
            aria-label={isFinnish ? `Poista: ${tag}` : `Remove ${tag}`}
          >
            <X size={12} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        type="text"
        className="tags-input__input"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => commit(draft)}
        placeholder={value.length === 0 ? placeholder : ''}
        aria-label={ariaLabel}
      />
    </div>
  )
}

export default TagsInput
