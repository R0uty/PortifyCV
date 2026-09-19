import { useEffect } from 'react'
import { getSectionSchema } from '../utils/sectionSchema'

// The popup editor for one section. Renders real <input>/<textarea>
// elements and reads formData directly — never the DOM and never
// snapshot, because createCvSnapshot filters entries by
// sectionItemVisibility, so DOM order diverges from formData order and
// any index derived from the DOM would target the wrong record.
export default function SectionEditorPopup({
  sectionKey,
  // formData/dispatchFormData/templateConfig are unused until Tasks 3-6 add
  // real field renderers to renderBody() — kept in the signature now so
  // those tasks don't have to change it.
  // eslint-disable-next-line no-unused-vars
  formData,
  // eslint-disable-next-line no-unused-vars
  dispatchFormData,
  // eslint-disable-next-line no-unused-vars
  templateConfig,
  locale,
  onClose,
}) {
  const isFinnish = locale === 'fi'
  const schema = getSectionSchema(sectionKey)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!schema) {
    return null
  }

  const renderBody = () => (
    <p className="direct-edit-popup__empty">
      {isFinnish ? 'Ei vielä muokattavia kenttiä.' : 'No editable fields yet.'}
    </p>
  )

  return (
    <div
      className="direct-edit-popup"
      role="dialog"
      aria-label={isFinnish ? schema.labelFi : schema.labelEn}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="direct-edit-popup__header">
        <span className="direct-edit-popup__title">
          {isFinnish ? schema.labelFi : schema.labelEn}
        </span>
        <button
          type="button"
          className="direct-edit-popup__close"
          onClick={onClose}
          aria-label={isFinnish ? 'Sulje' : 'Close'}
        >
          &times;
        </button>
      </div>
      <div className="direct-edit-popup__body">{renderBody()}</div>
    </div>
  )
}
