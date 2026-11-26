import { useId, useRef, useState } from 'react'

import Modal from './Modal'
import { FIT_OPTIONS, PAPER_OPTIONS } from './pdfPreviewOptions'
import { getUiTheme } from '../utils/designSystem'
import { MAX_APPLICATION_NAME_LENGTH } from '../utils/applicationLog'
import { dialogs } from '../i18n/dialogs/index.js'

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

function failureMessage(error, locale) {
  // The builder's own guard against a second save: its message says it.
  if (error?.code === 'busy') return error.message

  if (error?.code === 'full') {
    return dialogs.t(locale, 'markApplied.storageFull')
  }

  if (error?.code === 'unavailable') {
    return dialogs.t(locale, 'common.storageUnavailable')
  }

  // A render error (the preview not ready yet, a page that couldn't be
  // read) says what happened in its own message; storage errors don't.
  const detail = !error?.code && error instanceof Error && error.message ? ` ${error.message}` : ''

  return dialogs.t(locale, 'markApplied.saveFailed', { detail })
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
  const t = (key, vars) => dialogs.t(locale, key, vars)
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
      setError(failureMessage(submitError, locale))
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
      closeLabel={t('common.close')}
      isOpen
      onClose={handleClose}
      isCloseDisabled={isSaving}
      title={t('markApplied.title')}
      description={hasLetter ? t('markApplied.descriptionWithLetter') : t('markApplied.description')}
    >
      {isAvailable ? (
        <form className="mark-applied" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-company`} className={labelClassName}>{t('common.company')}</label>
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
                  {t('markApplied.companyMissing')}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-role`} className={labelClassName}>{t('markApplied.role')}</label>
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
                  {t('markApplied.roleMissing')}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-date`} className={labelClassName}>{t('markApplied.dateApplied')}</label>
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
                  {t('markApplied.dateMissing')}
                </span>
              ) : null}
            </div>

            <label className="flex flex-col gap-1">
              <span className={labelClassName}>
                {t('markApplied.adUrl')}
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
              <legend className={labelClassName}>{t('common.paperSize')}</legend>
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
                    {t(option.label)}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-fit`} className={labelClassName}>{t('common.fit')}</label>
              <select
                id={`${id}-fit`}
                className={inputClassName}
                value={fit}
                aria-describedby={`${id}-fit-hint`}
                onChange={(event) => setFit(event.target.value)}
              >
                {FIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
              <span id={`${id}-fit-hint`} className={`text-xs ${ui.textMuted}`}>
                {fitOption ? t(fitOption.hint) : ''}
              </span>
            </div>
          </div>

          {error ? (
            <p className="mark-applied__error mt-3 text-sm" role="alert">{error}</p>
          ) : null}

          <div className="saved-cvs__actions">
            <button type="submit" className={`ui-button ${ui.buttonActive}`} disabled={isSaving}>
              {isSaving ? t('markApplied.saving') : t('common.save')}
            </button>
          </div>
        </form>
      ) : (
        <p className="settings-row__hint" role="alert">{t('common.storageUnavailable')}</p>
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
