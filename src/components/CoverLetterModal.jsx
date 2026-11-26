import { useMemo } from 'react'

import Modal from './Modal'
import { getUiTheme } from '../utils/designSystem'
import { useCvTextProps } from './cvLanguageContext'
import { dialogs } from '../i18n/dialogs/index.js'

function CoverLetterModal({
  isOpen,
  onClose,
  locale = 'en',
  fullName = '',
  companyName,
  roleTitle,
  hiringManagerName,
  letterBody,
  hasJobAd = false,
  onCompanyNameChange,
  onRoleTitleChange,
  onHiringManagerNameChange,
  onLetterBodyChange,
  onGenerate,
  onCopy,
  onDownloadText,
  onDownloadPdf,
}) {
  const ui = useMemo(() => getUiTheme(), [])
  const t = (key, vars) => dialogs.t(locale, key, vars)
  const textProps = useCvTextProps()
  const companyProps = useCvTextProps({ field: 'company' })
  const managerProps = useCvTextProps({ field: 'organization' })
  const hasBody = letterBody.trim().length > 0

  return (
    <Modal closeLabel={t('common.close')}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={t('common.coverLetter')}
      description={t('coverLetter.description')}
    >
      {hasJobAd ? (
        <p className={`mb-3 text-xs ${ui.textMuted}`}>
          {t('coverLetter.usingJobAd')}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={`text-xs font-bold uppercase tracking-[0.1em] ${ui.textMuted}`}>
            {t('common.company')}
          </span>
          <input
            type="text"
            className={`border px-3 py-2 text-sm transition ${ui.input}`}
            {...companyProps}
            value={companyName}
            onChange={(event) => onCompanyNameChange(event.target.value)}
            placeholder={t('coverLetter.companyPlaceholder')}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={`text-xs font-bold uppercase tracking-[0.1em] ${ui.textMuted}`}>
            {t('coverLetter.role')}
          </span>
          <input
            type="text"
            className={`border px-3 py-2 text-sm transition ${ui.input}`}
            {...textProps}
            value={roleTitle}
            onChange={(event) => onRoleTitleChange(event.target.value)}
            placeholder={t('coverLetter.rolePlaceholder')}
          />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className={`text-xs font-bold uppercase tracking-[0.1em] ${ui.textMuted}`}>
            {t('coverLetter.manager')}
          </span>
          <input
            type="text"
            className={`border px-3 py-2 text-sm transition ${ui.input}`}
            {...managerProps}
            value={hiringManagerName}
            onChange={(event) => onHiringManagerNameChange(event.target.value)}
            placeholder={t('coverLetter.managerPlaceholder')}
          />
        </label>
      </div>

      <button
        type="button"
        className={`mt-4 ui-button ${ui.buttonActive}`}
        onClick={onGenerate}
        disabled={!fullName.trim()}
      >
        {hasBody ? t('coverLetter.regenerate') : t('coverLetter.generate')}
      </button>
      {!fullName.trim() ? (
        <p className={`mt-2 text-xs ${ui.textMuted}`}>
          {t('coverLetter.needName')}
        </p>
      ) : null}

      <label className="mt-4 flex flex-col gap-1">
        <span className={`text-xs font-bold uppercase tracking-[0.1em] ${ui.textMuted}`}>
          {t('coverLetter.draft')}
        </span>
        <textarea
          className={`min-h-72 w-full border px-4 py-3 text-sm leading-6 transition ${ui.input}`}
          {...textProps}
          value={letterBody}
          onChange={(event) => onLetterBodyChange(event.target.value)}
          placeholder={t('coverLetter.draftPlaceholder')}
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={`ui-button ${ui.button}`}
          onClick={onCopy}
          disabled={!hasBody}
        >
          {t('coverLetter.copy')}
        </button>
        <button
          type="button"
          className={`ui-button ${ui.button}`}
          onClick={onDownloadText}
          disabled={!hasBody}
        >
          {t('coverLetter.downloadText')}
        </button>
        <button
          type="button"
          className={`ui-button ${ui.button}`}
          onClick={onDownloadPdf}
          disabled={!hasBody}
        >
          {t('common.downloadPdf')}
        </button>
      </div>
    </Modal>
  )
}

export default CoverLetterModal
