import { useEffect } from 'react'
import { SECTION_SHAPE, getSectionSchema } from '../utils/sectionSchema'
import { FORM_ACTION } from '../reducers/cvFormReducer'

// The popup editor for one section. Renders real <input>/<textarea>
// elements and reads formData directly — never the DOM and never
// snapshot, because createCvSnapshot filters entries by
// sectionItemVisibility, so DOM order diverges from formData order and
// any index derived from the DOM would target the wrong record.

function FieldInput({ field, value, isFinnish, onChange }) {
  const label = isFinnish ? field.labelFi : field.labelEn
  const shared = {
    'data-field': field.key,
    id: `direct-edit-field-${field.key}`,
    className: 'direct-edit-popup__input',
  }

  if (field.type === 'checkbox') {
    return (
      <label className="direct-edit-popup__field direct-edit-popup__field--inline">
        <input
          {...shared}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="direct-edit-popup__label">{label}</span>
      </label>
    )
  }

  return (
    <label className="direct-edit-popup__field">
      <span className="direct-edit-popup__label">{label}</span>
      {field.type === 'textarea' ? (
        <textarea
          {...shared}
          rows={3}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          {...shared}
          type={field.type === 'month' ? 'month' : field.type === 'url' ? 'url' : 'text'}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  )
}

export default function SectionEditorPopup({
  sectionKey,
  formData,
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

  const renderRecordArray = () => {
    const items = Array.isArray(formData[sectionKey]) ? formData[sectionKey] : []
    const itemVisibility = formData.sectionItemVisibility?.[sectionKey] ?? {}

    return (
      <>
        {items.map((item, index) => {
          // index is formData-relative and stays that way: it is read
          // straight off this map over formData[sectionKey], never off
          // the DOM or a snapshot-filtered list.
          const isHidden = itemVisibility[String(index)] === false

          return (
            <div
              key={index}
              className={`direct-edit-popup__entry${isHidden ? ' direct-edit-popup__entry--hidden' : ''}`}
            >
              <div className="direct-edit-popup__entry-bar">
                <span className="direct-edit-popup__entry-index">#{index + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    dispatchFormData({ type: FORM_ACTION.MOVE_ARRAY_ITEM, section: sectionKey, index, direction: -1 })
                  }
                  disabled={index === 0}
                  aria-label={isFinnish ? 'Siirrä ylös' : 'Move up'}
                >
                  &uarr;
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatchFormData({ type: FORM_ACTION.MOVE_ARRAY_ITEM, section: sectionKey, index, direction: 1 })
                  }
                  disabled={index === items.length - 1}
                  aria-label={isFinnish ? 'Siirrä alas' : 'Move down'}
                >
                  &darr;
                </button>
                <button
                  type="button"
                  className="direct-edit-popup__entry-visibility"
                  onClick={() =>
                    dispatchFormData({
                      type: FORM_ACTION.TOGGLE_SECTION_ITEM_VISIBILITY,
                      section: sectionKey,
                      itemKey: index,
                    })
                  }
                >
                  {isHidden ? (isFinnish ? 'Näytä' : 'Show') : (isFinnish ? 'Piilota' : 'Hide')}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatchFormData({ type: FORM_ACTION.DUPLICATE_ARRAY_ITEM, section: sectionKey, index })
                  }
                >
                  {isFinnish ? 'Kopioi' : 'Duplicate'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatchFormData({ type: FORM_ACTION.REMOVE_ARRAY_ITEM, section: sectionKey, index })
                  }
                >
                  {isFinnish ? 'Poista' : 'Remove'}
                </button>
              </div>
              {schema.fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={item[field.key]}
                  isFinnish={isFinnish}
                  onChange={(value) =>
                    dispatchFormData({
                      type: FORM_ACTION.UPDATE_ARRAY_ITEM,
                      section: sectionKey,
                      index,
                      field: field.key,
                      value,
                    })
                  }
                />
              ))}
            </div>
          )
        })}
        <button
          type="button"
          className="direct-edit-popup__add"
          onClick={() => dispatchFormData({ type: FORM_ACTION.ADD_ARRAY_ITEM, section: sectionKey })}
        >
          {isFinnish ? '+ Lisää' : '+ Add'}
        </button>
      </>
    )
  }

  const renderBody = () => {
    switch (schema.shape) {
      case SECTION_SHAPE.recordArray:
        return renderRecordArray()
      default:
        return (
          <p className="direct-edit-popup__empty">
            {isFinnish ? 'Ei vielä muokattavia kenttiä.' : 'No editable fields yet.'}
          </p>
        )
    }
  }

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
