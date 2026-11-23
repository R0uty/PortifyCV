import { useEffect, useId, useRef, useState } from 'react'
import Modal from './Modal'
import { getUiTheme } from '../utils/designSystem'
import { MAX_CV_NAME_LENGTH } from '../utils/cvLibrary'
import { APPLICATION_STATUSES, MAX_APPLICATION_NOTE_LENGTH } from '../utils/applicationLog'

// How long a note waits after the last key before it is stored.
const NOTE_SAVE_DELAY_MS = 600

const STATUS_LABELS = {
  applied: ['Applied', 'Haettu'],
  interview: ['Interview', 'Haastattelu'],
  offer: ['Offer', 'Tarjous'],
  rejected: ['Rejected', 'Hylätty'],
  'no-reply': ['No reply', 'Ei vastausta'],
}

const unavailableText = (isFinnish) => (isFinnish
  ? 'Tämä selain ei salli tallennusta laitteelle (esimerkiksi yksityisessä ikkunassa). Vie CV JSON-tiedostona, jos haluat säilyttää sen.'
  : 'This browser does not allow saving on the device (a private window, for example). Export the CV as JSON to keep it.')

// 'YYYY-MM-DD' is a calendar day, not an instant: read it in local time.
function formatAppliedOn(appliedOn, isFinnish) {
  const [year, month, day] = String(appliedOn).split('-').map(Number)
  if (!year || !month || !day) return appliedOn
  return new Date(year, month - 1, day).toLocaleDateString(isFinnish ? 'fi-FI' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// One application. The note is the row's own until stored: after a pause in
// typing, on blur, and when the row goes away (the dialog closing, a tab
// switch) whatever is still unsaved is written.
function ApplicationRow({ application, isFinnish, onUpdate, onDelete, onView, onStartFrom }) {
  const ui = getUiTheme()
  const labelClassName = `text-xs font-bold uppercase tracking-[0.1em] ${ui.textMuted}`
  const inputClassName = `border px-3 py-2 text-sm transition ${ui.input}`
  const [note, setNote] = useState(application.note ?? '')
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const savedNoteRef = useRef(application.note ?? '')
  const pendingNoteRef = useRef(null)
  const timerRef = useRef(null)
  const latestRef = useRef({ id: application.id, onUpdate })
  useEffect(() => {
    latestRef.current = { id: application.id, onUpdate }
  })

  const flushNote = () => {
    clearTimeout(timerRef.current)
    timerRef.current = null
    const pending = pendingNoteRef.current
    pendingNoteRef.current = null
    if (pending === null || pending === savedNoteRef.current) return
    savedNoteRef.current = pending
    latestRef.current.onUpdate(latestRef.current.id, { note: pending })
  }
  const flushRef = useRef(flushNote)
  useEffect(() => {
    flushRef.current = flushNote
  })
  useEffect(() => () => flushRef.current(), [])

  const changeNote = (value) => {
    setNote(value)
    pendingNoteRef.current = value
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => flushRef.current(), NOTE_SAVE_DELAY_MS)
  }

  return (
    <li className="saved-cvs__item applications__item" data-application={application.company}>
      <div className="saved-cvs__text">
        <p className="settings-row__label">{application.company}</p>
        <p className="settings-row__hint">
          {application.role} · {formatAppliedOn(application.appliedOn, isFinnish)}
        </p>
      </div>
      <div className="applications__fields">
        <label className="applications__field">
          <span className={labelClassName}>{isFinnish ? 'Tila' : 'Status'}</span>
          <select
            className={inputClassName}
            value={application.status}
            onChange={(event) => onUpdate(application.id, { status: event.target.value })}
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>{STATUS_LABELS[status][isFinnish ? 1 : 0]}</option>
            ))}
          </select>
        </label>
        <label className="applications__field applications__field--note">
          <span className={labelClassName}>{isFinnish ? 'Muistiinpano' : 'Note'}</span>
          <textarea
            className={`${inputClassName} applications__note`}
            rows={2}
            value={note}
            maxLength={MAX_APPLICATION_NOTE_LENGTH}
            onChange={(event) => changeNote(event.target.value)}
            onBlur={flushNote}
          />
        </label>
      </div>
      {isConfirmingDelete ? (
        <div className="applications__confirm">
          <p className="settings-row__hint">
            {isFinnish
              ? `Poistetaanko haku yritykseen ${application.company}? Lähetetty PDF poistuu sen mukana.`
              : `Delete the application to ${application.company}? The PDF that was sent goes with it.`}
          </p>
          <div className="saved-cvs__row-actions">
            <button
              type="button"
              className="settings-link saved-cvs__delete saved-cvs__delete--armed"
              disabled={isDeleting}
              onClick={async () => {
                // Nothing to store for a row that is going.
                clearTimeout(timerRef.current)
                pendingNoteRef.current = null
                setIsDeleting(true)
                const deleted = await onDelete(application.id)
                if (!deleted) {
                  setIsDeleting(false)
                  setIsConfirmingDelete(false)
                }
              }}
            >
              {isFinnish ? 'Vahvista poisto' : 'Confirm delete'}
            </button>
            <button type="button" className="settings-link" onClick={() => setIsConfirmingDelete(false)}>
              {isFinnish ? 'Peruuta' : 'Cancel'}
            </button>
          </div>
        </div>
      ) : (
        <div className="saved-cvs__row-actions">
          <button type="button" className="settings-link" onClick={() => onView(application.id)}>
            {isFinnish ? 'Näytä lähetetty' : 'View sent'}
          </button>
          <button type="button" className="settings-link" onClick={() => onStartFrom(application.id)}>
            {isFinnish ? 'Aloita uusi CV tästä' : 'Start new CV from it'}
          </button>
          <button type="button" className="settings-link saved-cvs__delete" onClick={() => setIsConfirmingDelete(true)}>
            {isFinnish ? 'Poista' : 'Delete'}
          </button>
        </div>
      )}
    </li>
  )
}

function ApplicationsList({ isFinnish, isAvailable, applications, ...handlers }) {
  if (!isAvailable) {
    return (
      <p className="settings-row__hint saved-cvs__empty" role="alert">{unavailableText(isFinnish)}</p>
    )
  }

  if (applications.length === 0) {
    return (
      <p className="settings-row__hint saved-cvs__empty">
        {isFinnish
          ? 'Merkitse CV haetuksi valikosta, niin lähettämäsi PDF säilyy täällä.'
          : 'Mark a CV as applied from the menu to keep the PDF you sent here.'}
      </p>
    )
  }

  return (
    <ul className="saved-cvs__list">
      {applications.map((application) => (
        <ApplicationRow key={application.id} application={application} isFinnish={isFinnish} {...handlers} />
      ))}
    </ul>
  )
}

// "Save on this device" and "My CVs" (1.7.1): the CVs the visitor chose to
// keep in this browser. One dialog with two views, because the first save
// ends in the list and the list offers the save. My CVs has a second tab,
// Applications (1.7.11, view 'applications'): what Mark as applied kept.
//
// Open, New CV and Delete take a second click when they would lose
// something: the armed button says what the second click does.
function SavedCvsView({
  isOpen,
  view = 'list',
  onViewChange,
  onClose,
  locale = 'en',
  isAvailable = true,
  savedCvs = [],
  activeCv = null,
  suggestedName = '',
  hasUnsavedChanges = false,
  templateLabels = {},
  onSaveAs,
  onOpen,
  onDuplicate,
  onRename,
  onDelete,
  onNewCv,
  isApplicationLogAvailable = true,
  applications = [],
  onUpdateApplication,
  onDeleteApplication,
  onViewApplication,
  onStartFromApplication,
}) {
  const isFinnish = locale === 'fi'
  const ui = getUiTheme()
  const [name, setName] = useState(suggestedName)
  const [renaming, setRenaming] = useState(null)
  const [armed, setArmed] = useState(null)
  const [isWorking, setIsWorking] = useState(false)
  const tabsId = useId()

  const formatDate = (time) =>
    new Intl.DateTimeFormat(isFinnish ? 'fi-FI' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(time))

  const run = async (action) => {
    setIsWorking(true)
    try {
      await action()
    } finally {
      setIsWorking(false)
      setArmed(null)
    }
  }

  // First click arms, second click (the same button) acts.
  const confirmThen = (key, needsConfirm, action) => {
    if (needsConfirm && armed !== key) {
      setArmed(key)
      return
    }
    run(action)
  }

  const storageNote = isFinnish
    ? 'Tallennetaan vain tähän selaimeen, ei minnekään muualle. Sivuston tietojen tyhjentäminen poistaa ne; vie JSON, jos haluat varmuuskopion.'
    : 'Saved in this browser only, nowhere else. Clearing site data removes them; export JSON if you want a backup.'

  const tabs = [
    ['list', isFinnish ? 'Omat CV:t' : 'My CVs'],
    ['applications', isFinnish ? `Haut (${applications.length})` : `Applications (${applications.length})`],
  ]
  const activeTab = view === 'applications' ? 'applications' : 'list'
  const selectTab = (next) => {
    setArmed(null)
    setRenaming(null)
    onViewChange(next)
  }

  if (view === 'save') {
    return (
      <Modal closeLabel={isFinnish ? 'Sulje' : 'Close'}
        isOpen={isOpen}
        onClose={onClose}
        title={isFinnish ? 'Tallenna tälle laitteelle' : 'Save on this device'}
        description={storageNote}
      >
        {isAvailable ? (
          <form
            className="saved-cvs__save"
            onSubmit={(event) => {
              event.preventDefault()
              if (name.trim()) run(() => onSaveAs(name))
            }}
          >
            <label className="settings-row__label" htmlFor="saved-cv-name">
              {isFinnish ? 'CV:n nimi' : 'Name for this CV'}
            </label>
            <p className="settings-row__hint">
              {activeCv
                ? isFinnish
                  ? `Tallentaa uuden kopion, ja muutokset tallentuvat siihen itsestään. "${activeCv.name}" pysyy sellaisena kuin se tallennettiin.`
                  : `Saves a new copy, and your edits save to it by themselves. "${activeCv.name}" stays as it was saved.`
                : isFinnish
                  ? 'Vain sinulle, esim. työpaikan tai yrityksen mukaan. Tämän jälkeen muutokset tallentuvat itsestään.'
                  : 'Only for you, e.g. the job or the company. After this, your edits to it save themselves.'}
            </p>
            <input
              id="saved-cv-name"
              type="text"
              className={`mt-3 w-full border px-4 py-3 text-sm transition ${ui.input}`}
              value={name}
              maxLength={MAX_CV_NAME_LENGTH}
              autoComplete="off"
              onChange={(event) => setName(event.target.value)}
            />
            <div className="saved-cvs__actions">
              <button type="submit" className={`ui-button ${ui.button}`} disabled={isWorking || !name.trim()}>
                {isFinnish ? 'Tallenna' : 'Save'}
              </button>
              {savedCvs.length > 0 ? (
                <button type="button" className="settings-link" onClick={() => onViewChange('list')}>
                  {isFinnish ? `Omat CV:t (${savedCvs.length})` : `My CVs (${savedCvs.length})`}
                </button>
              ) : null}
            </div>
          </form>
        ) : (
          <p className="settings-row__hint" role="alert">{unavailableText(isFinnish)}</p>
        )}
      </Modal>
    )
  }

  return (
    <Modal closeLabel={isFinnish ? 'Sulje' : 'Close'}
      isOpen={isOpen}
      onClose={onClose}
      title={isFinnish ? 'Omat CV:t' : 'My CVs'}
      description={storageNote}
    >
      <div className="pdf-preview__tabs saved-cvs__tabs" role="tablist" aria-label={isFinnish ? 'Näkymä' : 'View'}>
        {tabs.map(([value, label], index) => (
          <button
            key={value}
            type="button"
            role="tab"
            id={`${tabsId}-${value}-tab`}
            aria-controls={`${tabsId}-panel`}
            aria-selected={activeTab === value}
            tabIndex={activeTab === value ? 0 : -1}
            className={`pdf-preview__tab${activeTab === value ? ' pdf-preview__tab--active' : ''}`}
            onClick={() => selectTab(value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault()
                const [next] = tabs[(index + 1) % tabs.length]
                selectTab(next)
                document.getElementById(`${tabsId}-${next}-tab`)?.focus()
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${tabsId}-panel`} aria-labelledby={`${tabsId}-${activeTab}-tab`}>
      {activeTab === 'applications' ? (
        <ApplicationsList
          isFinnish={isFinnish}
          isAvailable={isApplicationLogAvailable}
          applications={applications}
          onUpdate={onUpdateApplication}
          onDelete={onDeleteApplication}
          onView={onViewApplication}
          onStartFrom={onStartFromApplication}
        />
      ) : (
      <>
      <div className="saved-cvs__actions saved-cvs__actions--top">
        {!activeCv && isAvailable ? (
          <button type="button" className={`ui-button ${ui.button}`} onClick={() => onViewChange('save')}>
            {isFinnish ? 'Tallenna nykyinen CV' : 'Save the current CV'}
          </button>
        ) : null}
        <button
          type="button"
          className="settings-link"
          disabled={isWorking}
          onClick={() => confirmThen('new', hasUnsavedChanges, onNewCv)}
        >
          {armed === 'new'
            ? isFinnish ? 'Hylkää muutokset ja aloita uusi' : 'Discard changes and start new'
            : isFinnish ? 'Uusi CV' : 'New CV'}
        </button>
      </div>

      {savedCvs.length === 0 ? (
        <p className="settings-row__hint saved-cvs__empty">
          {isFinnish ? 'Et ole vielä tallentanut yhtään CV:tä tälle laitteelle.' : 'You have not saved a CV on this device yet.'}
        </p>
      ) : (
        <ul className="saved-cvs__list">
          {savedCvs.map((cv) => {
            const isActive = activeCv?.id === cv.id
            const isRenaming = renaming?.id === cv.id

            return (
              <li key={cv.id} className="saved-cvs__item" data-saved-cv={cv.name}>
                {isRenaming ? (
                  <form
                    className="saved-cvs__rename"
                    onSubmit={(event) => {
                      event.preventDefault()
                      if (renaming.name.trim()) run(async () => {
                        await onRename(cv.id, renaming.name)
                        setRenaming(null)
                      })
                    }}
                  >
                    <input
                      type="text"
                      className={`w-full border px-3 py-2 text-sm transition ${ui.input}`}
                      value={renaming.name}
                      maxLength={MAX_CV_NAME_LENGTH}
                      autoComplete="off"
                      aria-label={isFinnish ? `Uusi nimi: ${cv.name}` : `New name for ${cv.name}`}
                      // The visitor just pressed Rename on this row.
                      autoFocus
                      onChange={(event) => setRenaming({ id: cv.id, name: event.target.value })}
                    />
                    <button type="submit" className="settings-link" disabled={isWorking || !renaming.name.trim()}>
                      {isFinnish ? 'Tallenna nimi' : 'Save name'}
                    </button>
                    <button type="button" className="settings-link" onClick={() => setRenaming(null)}>
                      {isFinnish ? 'Peruuta' : 'Cancel'}
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="saved-cvs__text">
                      <p className="settings-row__label">
                        {cv.name}
                        {isActive ? <span className="saved-cvs__badge">{isFinnish ? 'Auki nyt' : 'Open now'}</span> : null}
                      </p>
                      <p className="settings-row__hint">
                        {[templateLabels[cv.templateId], `${isFinnish ? 'muokattu' : 'edited'} ${formatDate(cv.updatedAt)}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <div className="saved-cvs__row-actions">
                      {isActive ? null : (
                        <button
                          type="button"
                          className="settings-link"
                          disabled={isWorking}
                          onClick={() => confirmThen(`open:${cv.id}`, hasUnsavedChanges, () => onOpen(cv.id))}
                        >
                          {armed === `open:${cv.id}`
                            ? isFinnish ? 'Hylkää muutokset ja avaa' : 'Discard changes and open'
                            : isFinnish ? 'Avaa' : 'Open'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="settings-link"
                        disabled={isWorking}
                        onClick={() => confirmThen(`duplicate:${cv.id}`, hasUnsavedChanges && !isActive, () => onDuplicate(cv.id))}
                      >
                        {armed === `duplicate:${cv.id}`
                          ? isFinnish ? 'Hylkää muutokset ja monista' : 'Discard changes and duplicate'
                          : isFinnish ? 'Monista' : 'Duplicate'}
                      </button>
                      <button
                        type="button"
                        className="settings-link"
                        disabled={isWorking}
                        onClick={() => setRenaming({ id: cv.id, name: cv.name })}
                      >
                        {isFinnish ? 'Nimeä uudelleen' : 'Rename'}
                      </button>
                      <button
                        type="button"
                        className={`settings-link saved-cvs__delete${armed === `delete:${cv.id}` ? ' saved-cvs__delete--armed' : ''}`}
                        disabled={isWorking}
                        onClick={() => confirmThen(`delete:${cv.id}`, true, () => onDelete(cv.id))}
                      >
                        {armed === `delete:${cv.id}`
                          ? isFinnish ? 'Vahvista poisto' : 'Confirm delete'
                          : isFinnish ? 'Poista' : 'Delete'}
                      </button>
                    </div>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
      </>
      )}
      </div>
    </Modal>
  )
}

// Mounted only while open, and again between the Save prompt and the list,
// so the name field, a half-typed rename and an armed button never carry
// over. The two tabs of My CVs share one mount (switching resets them).
function SavedCvsModal(props) {
  return props.isOpen ? <SavedCvsView key={props.view === 'save' ? 'save' : 'list'} {...props} /> : null
}

export default SavedCvsModal
