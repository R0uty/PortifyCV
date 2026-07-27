import { useState } from 'react'
import { X } from 'lucide-react'

function TagsInput({
  value = [],
  onChange = () => {},
  placeholder = '',
  ariaLabel = 'Tags',
}) {
  const [draft, setDraft] = useState('')

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

  return (
    <div className="tags-input">
      {value.map((tag, index) => (
        <span className="tags-input__tag" key={`${tag}-${index}`}>
          {tag}
          <button
            type="button"
            className="tags-input__remove"
            onClick={() => removeAt(index)}
            aria-label={`Remove ${tag}`}
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
        onBlur={() => commit(draft)}
        placeholder={value.length === 0 ? placeholder : ''}
        aria-label={ariaLabel}
      />
    </div>
  )
}

export default TagsInput
