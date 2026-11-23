import { useId, useRef, useState } from 'react'

import Modal from './Modal'
import { FIT_OPTIONS, PAPER_OPTIONS } from './pdfPreviewOptions'
import { getUiTheme } from '../utils/designSystem'
import { MAX_APPLICATION_NAME_LENGTH } from '../utils/applicationLog'

// "Mark as applied" (1.7.11): the CV on screen was sent to a company. Asks
// for the company, role, date, the ad's link and the PDF's paper and fit;
// `onSubmit` renders the PDF(s) and stores the application, and rejects
// when nothing was stored. The builder closes the dialog on success; until
// the save ends the dialog can't be closed, so its outcome is always seen.

// Today in the visitor's own time zone, as YYYY-MM-DD (an <input
// type="date"> value). toISOString would give UTC's date, a day off around
// midnight.
function localToday() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function failureMessage(error, isFinnish) {
  // The builder's own guard against a second save: its message says it.
  if (error?.code === 'busy') return error.message

  if (error?.code === 'full') {
    return isFinnish
      ? 'Tallennus epäonnistui: selaimen tallennustila on täynnä. Mitään ei tallennettu.'
      : 'Could not save: this browser\'s storage is full. Nothing was stored.'
  }

  if (error?.code === 'unavailable') {
    return unavailableMessage(isFinnish)
  }

  // A render error (the preview not ready yet, a page that couldn't be
  // read) says what happened in its own message; storage errors don't.
  const detail = !error?.code && error instanceof Error && error.message ? ` ${error.message}` : ''

  return isFinnish
    ? `Haun tallennus epäonnistui, eikä mitään tallennettu.${detail}`
    : `Could not save the application, so nothing was stored.${detail}`
}

// The saved-CV dialog's own wording (SavedCvsModal.jsx): the same browser
// refuses both databases for the same reason.
function unavailableMessage(isFinnish) {
  return isFinnish
    ? 'Tämä selain ei salli tallennusta laitteelle (esimerkiksi yksityisessä ikkunassa). Vie CV JSON-tiedostona, jos haluat säilyttää sen.'
    : 'This browser does not allow saving on the device (a private window, for example). Export the CV as JSON to keep it.'
}

function MarkAppliedView({
  onClose,
  locale = 'en',
  initialCompany = '',
  initialRole = '',
  initialPaper = 'a4',
  initialFit = 'auto',
  onSubmit,
  isAvailable = true,
  hasLetter = false,
}) {
  const isFinnish = locale === 'fi'
  const ui = getUiTheme()
  const id = useId()
  const [company, setCompany] = useState(initialCompany)
  const [role, setRole] = useState(initialRole)
  const [appliedOn, setAppliedOn] = useState(localToday)
  const [adUrl, setAdUrl] = useState('')
  const [paper, setPaper] = useState(initialPaper)
  const [fit, setFit] = useState(initialFit)
  const [showRequired, setShowRequired] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  // A second press before the disabled state has painted is a no-op.
  const savingRef = useRef(false)

  const companyMissing = !company.trim()
  const roleMissing = !role.trim()
  const dateMissing = !appliedOn
  const fitOption = FIT_OPTIONS.find((option) => option.value === fit)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (savingRef.current) return

    if (companyMissing || roleMissing || dateMissing) {
      setShowRequired(true)
      return
    }

    savingRef.current = true
    setIsSaving(true)
    setError('')

    try {
      await onSubmit({ company, role, appliedOn, adUrl, paper, fit })
    } catch (submitError) {
      setError(failureMessage(submitError, isFinnish))
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!savingRef.current) onClose()
  }

  const labelClassName = `text-xs font-bold uppercase tracking-[0.1em] ${ui.textMuted}`
  const inputClassName = `border px-3 py-2 text-sm transition ${ui.input}`

  return (
    <Modal
      closeLabel={isFinnish ? 'Sulje' : 'Close'}
      isOpen
      onClose={handleClose}
      isCloseDisabled={isSaving}
      title={isFinnish ? 'Merkitse haetuksi' : 'Mark as applied'}
      description={hasLetter
        ? isFinnish
          ? 'Tämän CV:n ja sen hakemuskirjeen PDF, sellaisina kuin ne nyt näyttävät, säilytetään haun mukana tässä selaimessa.'
          : 'A PDF of this CV and its cover letter, as they look now, is kept with the application in this browser.'
        : isFinnish
          ? 'Tämän CV:n PDF, sellaisena kuin se nyt näyttää, säilytetään haun mukana tässä selaimessa.'
          : 'A PDF of this CV, as it looks now, is kept with the application in this browser.'}
    >
      {isAvailable ? (
        <form className="mark-applied" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-company`} className={labelClassName}>{isFinnish ? 'Yritys' : 'Company'}</label>
              <input
                id={`${id}-company`}
                type="text"
                className={inputClassName}
                value={company}
                maxLength={MAX_APPLICATION_NAME_LENGTH}
                autoComplete="off"
                aria-invalid={showRequired && companyMissing ? 'true' : undefined}
                aria-describedby={showRequired && companyMissing ? `${id}-company-error` : undefined}
                onChange={(event) => setCompany(event.target.value)}
              />
              {showRequired && companyMissing ? (
                <span id={`${id}-company-error`} className="mark-applied__error text-xs">
                  {isFinnish ? 'Kirjoita yritys.' : 'Enter the company.'}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-role`} className={labelClassName}>{isFinnish ? 'Tehtävä' : 'Role'}</label>
              <input
                id={`${id}-role`}
                type="text"
                className={inputClassName}
                value={role}
                maxLength={MAX_APPLICATION_NAME_LENGTH}
                autoComplete="off"
                aria-invalid={showRequired && roleMissing ? 'true' : undefined}
                aria-describedby={showRequired && roleMissing ? `${id}-role-error` : undefined}
                onChange={(event) => setRole(event.target.value)}
              />
              {showRequired && roleMissing ? (
                <span id={`${id}-role-error`} className="mark-applied__error text-xs">
                  {isFinnish ? 'Kirjoita tehtävä.' : 'Enter the role.'}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-date`} className={labelClassName}>{isFinnish ? 'Hakupäivä' : 'Date applied'}</label>
              <input
                id={`${id}-date`}
                type="date"
                className={inputClassName}
                value={appliedOn}
                required
                aria-invalid={showRequired && dateMissing ? 'true' : undefined}
                aria-describedby={showRequired && dateMissing ? `${id}-date-error` : undefined}
                onChange={(event) => setAppliedOn(event.target.value)}
              />
              {showRequired && dateMissing ? (
                <span id={`${id}-date-error`} className="mark-applied__error text-xs">
                  {isFinnish ? 'Valitse päivämäärä.' : 'Choose a date.'}
                </span>
              ) : null}
            </div>

            <label className="flex flex-col gap-1">
              <span className={labelClassName}>
                {isFinnish ? 'Linkki työpaikkailmoitukseen (valinnainen)' : 'Link to the job ad (optional)'}
              </span>
              <input
                type="url"
                className={inputClassName}
                value={adUrl}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => setAdUrl(event.target.value)}
              />
            </label>

            <fieldset className="flex flex-col gap-1">
              <legend className={labelClassName}>{isFinnish ? 'Paperikoko' : 'Paper size'}</legend>
              <div className="mark-applied__radios">
                {PAPER_OPTIONS.map((option) => (
                  <label key={option.value} className="mark-applied__radio text-sm">
                    <input
                      type="radio"
                      name={`${id}-paper`}
                      value={option.value}
                      checked={paper === option.value}
                      onChange={() => setPaper(option.value)}
                    />
                    {isFinnish ? option.fi : option.en}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-fit`} className={labelClassName}>{isFinnish ? 'Sovitus' : 'Fit'}</label>
              <select
                id={`${id}-fit`}
                className={inputClassName}
                value={fit}
                aria-describedby={`${id}-fit-hint`}
                onChange={(event) => setFit(event.target.value)}
              >
                {FIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {isFinnish ? option.fi : option.en}
                  </option>
                ))}
              </select>
              <span id={`${id}-fit-hint`} className={`text-xs ${ui.textMuted}`}>
                {fitOption ? (isFinnish ? fitOption.hintFi : fitOption.hintEn) : ''}
              </span>
            </div>
          </div>

          {error ? (
            <p className="mark-applied__error mt-3 text-sm" role="alert">{error}</p>
          ) : null}

          <div className="saved-cvs__actions">
            <button type="submit" className={`ui-button ${ui.buttonActive}`} disabled={isSaving}>
              {isSaving
                ? isFinnish ? 'Tallennetaan PDF:ää…' : 'Saving the PDF…'
                : isFinnish ? 'Tallenna' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <p className="settings-row__hint" role="alert">{unavailableMessage(isFinnish)}</p>
      )}
    </Modal>
  )
}

// Mounted only while open, so each opening starts from the CV's current
// prefill and today's date.
function MarkAppliedModal({ isOpen, ...props }) {
  return isOpen ? <MarkAppliedView {...props} /> : null
}

export default MarkAppliedModal
