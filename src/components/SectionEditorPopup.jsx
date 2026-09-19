import { useEffect, useState } from 'react'
import { SECTION_SHAPE, getSectionSchema, getColumnNeighbourSection } from '../utils/sectionSchema'
import { FORM_ACTION } from '../reducers/cvFormReducer'
import { isPhotoVisibleForTemplate, normalizeSectionOrder } from '../utils/cvForm'

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
  templateConfig,
  locale,
  onClose,
}) {
  const isFinnish = locale === 'fi'
  const schema = getSectionSchema(sectionKey)
  const [draftSkill, setDraftSkill] = useState('')
  const [notice, setNotice] = useState('')

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

  // identity is not a sectionOrder section, so it has no neighbours and
  // cannot be hidden — the header always renders.
  const isOrderableSection = sectionKey !== 'identity'
  const templateSectionOrder = [
    ...templateConfig.primarySections,
    ...templateConfig.secondarySections,
  ]
  const orderedSections = normalizeSectionOrder(formData.sectionOrder, templateSectionOrder)
    .filter((key) => templateSectionOrder.includes(key))

  const moveSection = (direction) => {
    const toSection = getColumnNeighbourSection(sectionKey, direction, orderedSections, templateConfig)

    if (!toSection) {
      return
    }

    dispatchFormData({
      type: FORM_ACTION.MOVE_SECTION_ORDER,
      fromSection: sectionKey,
      toSection,
      fallbackOrder: templateSectionOrder,
    })
  }

  const canMoveUp =
    isOrderableSection && Boolean(getColumnNeighbourSection(sectionKey, -1, orderedSections, templateConfig))
  const canMoveDown =
    isOrderableSection && Boolean(getColumnNeighbourSection(sectionKey, 1, orderedSections, templateConfig))

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

  const renderRootGroup = () => (
    <>
      {schema.fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={formData[field.key]}
          isFinnish={isFinnish}
          onChange={(value) =>
            dispatchFormData({ type: FORM_ACTION.SET_ROOT_FIELD, field: field.key, value })
          }
        />
      ))}
      {formData.photo ? (
        <label className="direct-edit-popup__field direct-edit-popup__field--inline">
          <input
            type="checkbox"
            className="direct-edit-popup__input"
            data-field="photoVisible"
            checked={isPhotoVisibleForTemplate(formData.photoVisibilityByTemplate, templateConfig.id)}
            onChange={() =>
              dispatchFormData({ type: FORM_ACTION.TOGGLE_PHOTO_VISIBILITY, template: templateConfig.id })
            }
          />
          <span className="direct-edit-popup__label">
            {isFinnish ? 'Näytä valokuva' : 'Show photo'}
          </span>
        </label>
      ) : null}
    </>
  )

  const renderRootScalar = () => {
    const field = schema.fields[0]

    return (
      <FieldInput
        field={field}
        value={formData[field.key]}
        isFinnish={isFinnish}
        onChange={(value) =>
          dispatchFormData({ type: FORM_ACTION.SET_ROOT_FIELD, field: field.key, value })
        }
      />
    )
  }

  const renderLinkMap = () => (
    <>
      {schema.fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={formData.links?.[field.key]}
          isFinnish={isFinnish}
          onChange={(value) =>
            dispatchFormData({ type: FORM_ACTION.SET_LINK_FIELD, field: field.key, value })
          }
        />
      ))}
    </>
  )

  const renderStringArray = () => {
    const items = Array.isArray(formData[sectionKey]) ? formData[sectionKey] : []

    const handleAdd = () => {
      const candidate = draftSkill.trim()

      if (!candidate) {
        return
      }

      const isDuplicate = items.some((skill) => skill.toLowerCase() === candidate.toLowerCase())

      if (isDuplicate) {
        setNotice(isFinnish ? 'Tämä taito on jo listalla.' : 'That skill is already listed.')
        return
      }

      dispatchFormData({ type: FORM_ACTION.ADD_SKILL, skill: candidate })
      setDraftSkill('')
      setNotice('')
    }

    return (
      <>
        {items.map((skill, index) => (
          <div key={`${skill}-${index}`} className="direct-edit-popup__skill">
            <span className="direct-edit-popup__skill-text">{skill}</span>
            <button
              type="button"
              onClick={() => dispatchFormData({ type: FORM_ACTION.MOVE_SKILL, index, direction: -1 })}
              disabled={index === 0}
              aria-label={isFinnish ? 'Siirrä ylös' : 'Move up'}
            >
              &uarr;
            </button>
            <button
              type="button"
              onClick={() => dispatchFormData({ type: FORM_ACTION.MOVE_SKILL, index, direction: 1 })}
              disabled={index === items.length - 1}
              aria-label={isFinnish ? 'Siirrä alas' : 'Move down'}
            >
              &darr;
            </button>
            <button
              type="button"
              onClick={() => dispatchFormData({ type: FORM_ACTION.REMOVE_SKILL, index })}
              aria-label={isFinnish ? 'Poista' : 'Remove'}
            >
              &times;
            </button>
          </div>
        ))}
        <div className="direct-edit-popup__skill-row">
          <input
            type="text"
            className="direct-edit-popup__input direct-edit-popup__skill-input"
            value={draftSkill}
            placeholder={isFinnish ? 'Uusi taito' : 'New skill'}
            onChange={(event) => {
              setDraftSkill(event.target.value)
              setNotice('')
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleAdd()
              }
            }}
          />
          <button
            type="button"
            className="direct-edit-popup__skill-add"
            onClick={handleAdd}
            disabled={!draftSkill.trim()}
          >
            {isFinnish ? 'Lisää' : 'Add'}
          </button>
        </div>
        {notice ? <p className="direct-edit-popup__notice">{notice}</p> : null}
      </>
    )
  }

  const renderBody = () => {
    switch (schema.shape) {
      case SECTION_SHAPE.recordArray:
        return renderRecordArray()
      case SECTION_SHAPE.rootGroup:
        return renderRootGroup()
      case SECTION_SHAPE.rootScalar:
        return renderRootScalar()
      case SECTION_SHAPE.linkMap:
        return renderLinkMap()
      case SECTION_SHAPE.stringArray:
        return renderStringArray()
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
        {isOrderableSection ? (
          <div className="direct-edit-popup__section-controls">
            <button
              type="button"
              className="direct-edit-popup__move-up"
              onClick={() => moveSection(-1)}
              disabled={!canMoveUp}
              aria-label={isFinnish ? 'Siirrä osiota ylös' : 'Move section up'}
            >
              &uarr;
            </button>
            <button
              type="button"
              className="direct-edit-popup__move-down"
              onClick={() => moveSection(1)}
              disabled={!canMoveDown}
              aria-label={isFinnish ? 'Siirrä osiota alas' : 'Move section down'}
            >
              &darr;
            </button>
            <button
              type="button"
              className="direct-edit-popup__hide-section"
              onClick={() => {
                dispatchFormData({ type: FORM_ACTION.TOGGLE_SECTION_VISIBILITY, section: sectionKey })
                onClose()
              }}
            >
              {isFinnish ? 'Piilota' : 'Hide'}
            </button>
          </div>
        ) : null}
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
