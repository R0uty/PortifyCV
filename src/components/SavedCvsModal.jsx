import { useEffect, useId, useRef, useState } from 'react'
import Modal from './Modal'
import { getUiTheme } from '../utils/designSystem'
import { MAX_CV_NAME_LENGTH } from '../utils/cvLibrary'
import { APPLICATION_STATUSES, MAX_APPLICATION_NOTE_LENGTH, formatAppliedOn } from '../utils/applicationLog'
import { dialogs } from '../i18n/dialogs/index.js'
import { INTL_LOCALES, normalizeLocale } from '../i18n/index.js'

// How long a note waits after the last key before it is stored.
const NOTE_SAVE_DELAY_MS = 600

// Keys in the dialogs namespace, by applicationLog.js's status ids.
const STATUS_LABELS = {
  applied: 'applications.statuses.applied',
  interview: 'applications.statuses.interview',
  offer: 'applications.statuses.offer',
  rejected: 'applications.statuses.rejected',
  'no-reply': 'applications.statuses.noReply',
}

// One application. The note is the row's own until stored: after a pause in
// typing, on blur, and when the row goes away (the dialog closing, a tab
// switch) whatever is still unsaved is written.
//
// Delete keeps the keyboard in place: the confirm step takes focus, Cancel
// gives it back to Delete, and the list (told by `onDeleting` before the
// delete starts) hands it to a neighbour once the row is gone.
function ApplicationRow({ application, locale, onUpdate, onDelete, onDeleting, onView, onStartFrom }) {
  const t = (key, vars) => dialogs.t(locale, key, vars)
  const ui = getUiTheme()
  const labelClassName = `text-xs font-bold uppercase tracking-[0.1em] ${ui.textMuted}`
  const inputClassName = `border px-3 py-2 text-sm transition ${ui.input}`
  const [note, setNote] = useState(application.note ?? '')
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const savedNoteRef = useRef(application.note ?? '')
  const pendingNoteRef = useRef(null)
  const timerRef = useRef(null)
  const deleteButtonRef = useRef(null)
  const confirmButtonRef = useRef(null)
  // Where focus goes when the confirm step opens or closes; null on mount.
  const focusAfterRenderRef = useRef(null)
  useEffect(() => {
    const target = focusAfterRenderRef.current
    focusAfterRenderRef.current = null
    if (target === 'confirm') confirmButtonRef.current?.focus()
    if (target === 'delete') deleteButtonRef.current?.focus()
  }, [isConfirmingDelete])
  const setConfirming = (value) => {
    focusAfterRenderRef.current = value ? 'confirm' : 'delete'
    setIsConfirmingDelete(value)
  }
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
    <li
      className="saved-cvs__item applications__item"
      data-application={application.company}
      data-application-id={application.id}
    >
      <div className="saved-cvs__text">
        <p className="settings-row__label">{application.company}</p>
        <p className="settings-row__hint">
          {application.role} · {formatAppliedOn(application.appliedOn, locale)}
        </p>
      </div>
      <div className="applications__fields">
        <label className="applications__field">
          <span className={labelClassName}>{t('applications.status')}</span>
          <select
            className={inputClassName}
            value={application.status}
            onChange={(event) => onUpdate(application.id, { status: event.target.value })}
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>{t(STATUS_LABELS[status])}</option>
            ))}
          </select>
        </label>
        <label className="applications__field applications__field--note">
          <span className={labelClassName}>{t('applications.note')}</span>
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
            {t('applications.confirmText', { company: application.company })}
          </p>
          <div className="saved-cvs__row-actions">
            <button
              ref={confirmButtonRef}
              type="button"
              className="settings-link saved-cvs__delete saved-cvs__delete--armed"
              disabled={isDeleting}
              onClick={async () => {
                // Nothing to store for a row that is going.
                clearTimeout(timerRef.current)
                pendingNoteRef.current = null
                setIsDeleting(true)
                onDeleting(application.id)
                const deleted = await onDelete(application.id)
                if (!deleted) {
                  onDeleting(null)
                  setIsDeleting(false)
                  setConfirming(false)
                }
              }}
            >
              {t('common.confirmDelete')}
            </button>
            <button type="button" className="settings-link" onClick={() => setConfirming(false)}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="saved-cvs__row-actions">
          {/* Each row has the same three buttons, so each name says whose. */}
          <button
            type="button"
            className="settings-link"
            data-application-view
            aria-label={t('applications.viewSentLabel', { company: application.company })}
            onClick={() => onView(application.id)}
          >
            {t('applications.viewSent')}
          </button>
          <button
            type="button"
            className="settings-link"
            aria-label={t('applications.startFromLabel', { company: application.company })}
            onClick={() => onStartFrom(application.id)}
          >
            {t('common.startNewCvFromIt')}
          </button>
          <button
            ref={deleteButtonRef}
            type="button"
            className="settings-link saved-cvs__delete"
            aria-label={t('applications.deleteLabel', { company: application.company })}
            onClick={() => setConfirming(true)}
          >
            {t('common.delete')}
          </button>
        </div>
      )}
    </li>
  )
}

function ApplicationsList({ locale, isAvailable, applications, tabId, ...handlers }) {
  const listRef = useRef(null)
  // A delete under way: the row going, and the id of the row whose View
  // sent takes focus once it has gone (null: the tab).
  const pendingDeleteRef = useRef(null)
  useEffect(() => {
    const pending = pendingDeleteRef.current
    if (!pending || applications.some((item) => String(item.id) === pending.deletedId)) return
    pendingDeleteRef.current = null
    const button = pending.focusId === null
      ? null
      : [...(listRef.current?.querySelectorAll('[data-application-id]') ?? [])]
        .find((row) => row.dataset.applicationId === pending.focusId)
        ?.querySelector('[data-application-view]')
    ;(button ?? document.getElementById(tabId))?.focus()
  }, [applications, tabId])

  // The next row, else the previous one, else the tab; null when the
  // delete failed.
  const handleDeleting = (id) => {
    if (id === null) {
      pendingDeleteRef.current = null
      return
    }
    const index = applications.findIndex((item) => item.id === id)
    const neighbour = applications[index + 1] ?? applications[index - 1]
    pendingDeleteRef.current = { deletedId: String(id), focusId: neighbour ? String(neighbour.id) : null }
  }

  if (!isAvailable) {
    return (
      <p className="settings-row__hint saved-cvs__empty" role="alert">{dialogs.t(locale, 'common.storageUnavailable')}</p>
    )
  }

  if (applications.length === 0) {
    return (
      <p className="settings-row__hint saved-cvs__empty">
        {dialogs.t(locale, 'applications.empty')}
      </p>
    )
  }

  return (
    <ul ref={listRef} className="saved-cvs__list">
      {applications.map((application) => (
        <ApplicationRow
          key={application.id}
          application={application}
          locale={locale}
          onDeleting={handleDeleting}
          {...handlers}
        />
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
  const t = (key, vars) => dialogs.t(locale, key, vars)
  const ui = getUiTheme()
  const [name, setName] = useState(suggestedName)
  const [renaming, setRenaming] = useState(null)
  const [armed, setArmed] = useState(null)
  const [isWorking, setIsWorking] = useState(false)
  const tabsId = useId()

  const formatDate = (time) =>
    new Intl.DateTimeFormat(INTL_LOCALES[normalizeLocale(locale)], {
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

  const storageNote = t('savedCvs.storageNote')

  const tabs = [
    ['list', t('savedCvs.title')],
    ['applications', t('savedCvs.applicationsTab', { count: applications.length })],
  ]
  const activeTab = view === 'applications' ? 'applications' : 'list'
  const selectTab = (next) => {
    setArmed(null)
    setRenaming(null)
    onViewChange(next)
  }

  if (view === 'save') {
    return (
      <Modal closeLabel={t('common.close')}
        isOpen={isOpen}
        onClose={onClose}
        title={t('savedCvs.saveTitle')}
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
              {t('savedCvs.nameLabel')}
            </label>
            <p className="settings-row__hint">
              {activeCv
                ? t('savedCvs.saveHintCopy', { name: activeCv.name })
                : t('savedCvs.saveHintNew')}
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
                {t('common.save')}
              </button>
              {savedCvs.length > 0 ? (
                <button type="button" className="settings-link" onClick={() => onViewChange('list')}>
                  {t('savedCvs.titleCount', { count: savedCvs.length })}
                </button>
              ) : null}
            </div>
          </form>
        ) : (
          <p className="settings-row__hint" role="alert">{t('common.storageUnavailable')}</p>
        )}
      </Modal>
    )
  }

  return (
    <Modal closeLabel={t('common.close')}
      isOpen={isOpen}
      onClose={onClose}
      title={t('savedCvs.title')}
      description={storageNote}
    >
      <div className="pdf-preview__tabs saved-cvs__tabs" role="tablist" aria-label={t('common.view')}>
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
          locale={locale}
          isAvailable={isApplicationLogAvailable}
          applications={applications}
          tabId={`${tabsId}-applications-tab`}
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
            {t('savedCvs.saveCurrent')}
          </button>
        ) : null}
        <button
          type="button"
          className="settings-link"
          disabled={isWorking}
          onClick={() => confirmThen('new', hasUnsavedChanges, onNewCv)}
        >
          {armed === 'new' ? t('savedCvs.discardAndNew') : t('savedCvs.newCv')}
        </button>
      </div>

      {savedCvs.length === 0 ? (
        <p className="settings-row__hint saved-cvs__empty">
          {t('savedCvs.empty')}
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
                      aria-label={t('savedCvs.renameLabel', { name: cv.name })}
                      // The visitor just pressed Rename on this row.
                      autoFocus
                      onChange={(event) => setRenaming({ id: cv.id, name: event.target.value })}
                    />
                    <button type="submit" className="settings-link" disabled={isWorking || !renaming.name.trim()}>
                      {t('savedCvs.saveName')}
                    </button>
                    <button type="button" className="settings-link" onClick={() => setRenaming(null)}>
                      {t('common.cancel')}
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="saved-cvs__text">
                      <p className="settings-row__label">
                        {cv.name}
                        {isActive ? <span className="saved-cvs__badge">{t('savedCvs.openNow')}</span> : null}
                      </p>
                      <p className="settings-row__hint">
                        {[templateLabels[cv.templateId], t('savedCvs.edited', { date: formatDate(cv.updatedAt) })]
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
                            ? t('savedCvs.discardAndOpen')
                            : t('savedCvs.open')}
                        </button>
                      )}
                      <button
                        type="button"
                        className="settings-link"
                        disabled={isWorking}
                        onClick={() => confirmThen(`duplicate:${cv.id}`, hasUnsavedChanges && !isActive, () => onDuplicate(cv.id))}
                      >
                        {armed === `duplicate:${cv.id}`
                          ? t('savedCvs.discardAndDuplicate')
                          : t('savedCvs.duplicate')}
                      </button>
                      <button
                        type="button"
                        className="settings-link"
                        disabled={isWorking}
                        onClick={() => setRenaming({ id: cv.id, name: cv.name })}
                      >
                        {t('savedCvs.rename')}
                      </button>
                      <button
                        type="button"
                        className={`settings-link saved-cvs__delete${armed === `delete:${cv.id}` ? ' saved-cvs__delete--armed' : ''}`}
                        disabled={isWorking}
                        onClick={() => confirmThen(`delete:${cv.id}`, true, () => onDelete(cv.id))}
                      >
                        {armed === `delete:${cv.id}`
                          ? t('common.confirmDelete')
                          : t('common.delete')}
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
