import { useEffect, useRef, useState } from 'react'
import { SECTION_SHAPE, getSectionSchema, getColumnNeighbourSection } from '../utils/sectionSchema'
import { FORM_ACTION } from '../reducers/cvFormReducer'
import { isPhotoVisibleForTemplate, normalizeSectionOrder } from '../utils/cvForm'
import { buildProfilePhotoDataUrl, localizePhotoErrorMessage } from '../utils/profilePhoto'

// The popup editor for one section. Renders real <input>/<textarea>
// elements and reads formData directly — never the DOM and never
// snapshot, because createCvSnapshot filters entries by
// sectionItemVisibility, so DOM order diverges from formData order and
// any index derived from the DOM would target the wrong record.

// Everything inside the popup that can take focus, in DOM order. The
// profile-photo file input is sr-only rather than display:none precisely
// so it stays in this list.
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function FieldInput({ field, value, isFinnish, onChange }) {
  const label = isFinnish ? field.labelFi : field.labelEn
  // No <label htmlFor> or anything else references these ids (labels wrap
  // their inputs instead), and a record-array section renders one
  // FieldInput per entry, so a stable id-per-field would duplicate across
  // entries — invalid HTML. Leave data-field (used by tests and geometry
  // lookups) as the only identifier.
  const shared = {
    'data-field': field.key,
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
          // Schema type "month" is a semantic marker, not an HTML input
          // type: this app stores dates as free text ("Jan 2022", "2014"),
          // never ISO YYYY-MM, and <input type="month"> rejects any value
          // that isn't that exact shape — it would render empty for every
          // real CV and silently rewrite the field to ISO on first edit.
          // Render it as text with the same placeholder Classic mode uses
          // (CVForm.jsx's date inputs) instead. Do not "fix" this back to
          // type="month" without also changing how dates are stored.
          type={field.type === 'url' ? 'url' : 'text'}
          placeholder={field.type === 'month' ? (isFinnish ? 'esim. tammikuu 2022' : 'e.g. Jan 2022') : undefined}
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
  const photoInputRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Move focus into the dialog on open. The container itself takes it
  // (tabIndex={-1}) rather than the first field, so screen readers
  // announce the dialog and its label before its contents, and Tab then
  // walks the fields in order.
  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

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

  // Same pipeline Classic mode uses (src/utils/profilePhoto.js), so an
  // image accepted here is accepted there and vice versa. Errors land in
  // the popup's shared `notice` state rather than the app-level toast
  // Classic uses, because the popup owns its own footer line already.
  const handlePhotoUpload = async (event) => {
    const [file] = event.target.files ?? []
    event.target.value = ''

    if (!file) {
      return
    }

    setNotice('')

    try {
      const photoDataUrl = await buildProfilePhotoDataUrl(file)
      dispatchFormData({ type: FORM_ACTION.SET_ROOT_FIELD, field: 'photo', value: photoDataUrl })
    } catch (error) {
      setNotice(
        error instanceof Error
          ? localizePhotoErrorMessage(error.message, locale)
          : isFinnish ? 'Profiilikuvan lataus epäonnistui.' : 'Could not upload profile image.',
      )
    }
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
      {/* Deliberately not a <label> wrapping the hidden file input (the
          same reasoning as CVForm.jsx's profile block): a label would turn
          every click on the hint text or the preview into a file dialog.
          The upload button always renders — a photo-less CV used to get no
          control here at all, forcing a trip to Classic mode. */}
      <div className="direct-edit-popup__photo">
        <span className="direct-edit-popup__label">
          {isFinnish ? 'Profiilikuva' : 'Profile image'}
        </span>
        <input
          ref={photoInputRef}
          type="file"
          className="direct-edit-popup__photo-input"
          accept="image/png,image/jpeg,image/jpg"
          aria-label={isFinnish ? 'Profiilikuva' : 'Profile image'}
          onChange={handlePhotoUpload}
        />
        <button
          type="button"
          className="direct-edit-popup__photo-choose"
          onClick={() => photoInputRef.current?.click()}
        >
          {isFinnish ? 'Valitse kuva' : 'Choose image'}
        </button>
        <p className="direct-edit-popup__photo-hint">
          {isFinnish
            ? 'JPG tai PNG, enintään 2 Mt.'
            : 'JPG or PNG, up to 2MB.'}
        </p>
        {formData.photo ? (
          <div className="direct-edit-popup__photo-row">
            <img
              src={formData.photo}
              alt={isFinnish ? 'Profiilin esikatselu' : 'Profile preview'}
              className="direct-edit-popup__photo-preview"
            />
            <button
              type="button"
              className="direct-edit-popup__photo-remove"
              onClick={() => {
                setNotice('')
                dispatchFormData({ type: FORM_ACTION.SET_ROOT_FIELD, field: 'photo', value: '' })
              }}
            >
              {isFinnish ? 'Poista kuva' : 'Remove image'}
            </button>
          </div>
        ) : null}
        {/* Gated on a photo existing: toggling the visibility of nothing is
            meaningless. Kept beside the upload control on purpose — a
            template that renders no photo, or one whose flag is off, will
            look like the upload did nothing, exactly as Classic behaves. */}
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
      </div>
      {notice ? <p className="direct-edit-popup__notice">{notice}</p> : null}
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

  const renderLinkMap = () => {
    // links has genuine per-key visibility (Classic dispatches
    // TOGGLE_SECTION_ITEM_VISIBILITY keyed by link key, and
    // createCvSnapshot filters on it — see cvSnapshot.js) that
    // renderRecordArray already exposes for array sections. Mirror the
    // same Hide/Show control here, keyed by field.key instead of an
    // array index, so a link hidden in Classic doesn't look editable
    // (and re-typeable, with no visible effect) in the popup.
    const itemVisibility = formData.sectionItemVisibility?.links ?? {}

    return (
      <>
        {schema.fields.map((field) => {
          const isHidden = itemVisibility[field.key] === false

          return (
            <div
              key={field.key}
              className={`direct-edit-popup__entry${isHidden ? ' direct-edit-popup__entry--hidden' : ''}`}
            >
              <div className="direct-edit-popup__entry-bar">
                <button
                  type="button"
                  className="direct-edit-popup__entry-visibility"
                  onClick={() =>
                    dispatchFormData({
                      type: FORM_ACTION.TOGGLE_SECTION_ITEM_VISIBILITY,
                      section: 'links',
                      itemKey: field.key,
                    })
                  }
                >
                  {isHidden ? (isFinnish ? 'Näytä' : 'Show') : (isFinnish ? 'Piilota' : 'Hide')}
                </button>
              </div>
              <FieldInput
                field={field}
                value={formData.links?.[field.key]}
                isFinnish={isFinnish}
                onChange={(value) =>
                  dispatchFormData({ type: FORM_ACTION.SET_LINK_FIELD, field: field.key, value })
                }
              />
            </div>
          )
        })}
      </>
    )
  }

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

  // Focus trap. Without it, Tab walks straight out of the popup into the
  // CV behind it — which is contentEditable on the inline-wired templates,
  // so a keyboard user would silently land in a different editing surface.
  const handleDialogKeyDown = (event) => {
    if (event.key !== 'Tab') {
      return
    }

    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    const focusables = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR))

    if (focusables.length === 0) {
      return
    }

    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement

    if (event.shiftKey) {
      // Backwards off the first element — or off the dialog container
      // itself, which holds focus immediately after opening — wraps to
      // the last.
      if (active === first || active === dialog || !dialog.contains(active)) {
        event.preventDefault()
        last.focus()
      }

      return
    }

    if (active === last) {
      event.preventDefault()
      first.focus()
    }
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
      ref={dialogRef}
      className="direct-edit-popup"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label={isFinnish ? schema.labelFi : schema.labelEn}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={handleDialogKeyDown}
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
