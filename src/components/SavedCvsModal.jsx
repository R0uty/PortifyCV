import { useState } from 'react'
import Modal from './Modal'
import { getUiTheme } from '../utils/designSystem'
import { MAX_CV_NAME_LENGTH } from '../utils/cvLibrary'

// "Save on this device" and "My CVs" (1.7.1): the CVs the visitor chose to
// keep in this browser. One dialog with two views, because the first save
// ends in the list and the list offers the save.
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
}) {
  const isFinnish = locale === 'fi'
  const ui = getUiTheme()
  const [name, setName] = useState(suggestedName)
  const [renaming, setRenaming] = useState(null)
  const [armed, setArmed] = useState(null)
  const [isWorking, setIsWorking] = useState(false)

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
              {isFinnish
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
          <p className="settings-row__hint" role="alert">
            {isFinnish
              ? 'Tämä selain ei salli tallennusta laitteelle (esimerkiksi yksityisessä ikkunassa). Vie CV JSON-tiedostona, jos haluat säilyttää sen.'
              : 'This browser does not allow saving on the device (a private window, for example). Export the CV as JSON to keep it.'}
          </p>
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
    </Modal>
  )
}

// Mounted only while open, and again for each view, so the name field, a
// half-typed rename and an armed button never carry over.
function SavedCvsModal(props) {
  return props.isOpen ? <SavedCvsView key={props.view ?? 'list'} {...props} /> : null
}

export default SavedCvsModal
