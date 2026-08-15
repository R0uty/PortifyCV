import { useMemo } from 'react'

import Modal from './Modal'
import { getUiTheme } from '../utils/designSystem'

function CoverLetterModal({
  isOpen,
  onClose,
  locale = 'en',
  fullName = '',
  companyName,
  roleTitle,
  hiringManagerName,
  letterBody,
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
  const isFinnish = locale === 'fi'
  const hasBody = letterBody.trim().length > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isFinnish ? 'Hakemuskirje' : 'Cover letter'}
      description={isFinnish
        ? 'Luo hakemuskirjeen luonnos CV:si tiedoista. Kaikki pysyy selaimessasi, aivan kuten muukin sovellus.'
        : 'Draft a cover letter from your CV data. Everything stays in your browser, same as the rest of the app.'}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={`text-xs font-bold uppercase tracking-[0.1em] ${ui.textMuted}`}>
            {isFinnish ? 'Yritys' : 'Company'}
          </span>
          <input
            type="text"
            className={`border px-3 py-2 text-sm transition ${ui.input}`}
            value={companyName}
            onChange={(event) => onCompanyNameChange(event.target.value)}
            placeholder={isFinnish ? 'esim. Acme Oy' : 'e.g. Acme Inc'}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={`text-xs font-bold uppercase tracking-[0.1em] ${ui.textMuted}`}>
            {isFinnish ? 'Haettava tehtävä' : 'Role you\'re applying for'}
          </span>
          <input
            type="text"
            className={`border px-3 py-2 text-sm transition ${ui.input}`}
            value={roleTitle}
            onChange={(event) => onRoleTitleChange(event.target.value)}
            placeholder={isFinnish ? 'Oletuksena CV:n ammattinimike' : 'Defaults to your CV title'}
          />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className={`text-xs font-bold uppercase tracking-[0.1em] ${ui.textMuted}`}>
            {isFinnish ? 'Rekrytoijan nimi (valinnainen)' : 'Hiring manager name (optional)'}
          </span>
          <input
            type="text"
            className={`border px-3 py-2 text-sm transition ${ui.input}`}
            value={hiringManagerName}
            onChange={(event) => onHiringManagerNameChange(event.target.value)}
            placeholder={isFinnish ? 'esim. Jane Doe' : 'e.g. Jane Doe'}
          />
        </label>
      </div>

      <button
        type="button"
        className={`mt-4 border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.buttonActive}`}
        onClick={onGenerate}
        disabled={!fullName.trim()}
      >
        {hasBody
          ? isFinnish ? 'Luo luonnos uudelleen' : 'Regenerate draft'
          : isFinnish ? 'Luo luonnos' : 'Generate draft'}
      </button>
      {!fullName.trim() ? (
        <p className={`mt-2 text-xs ${ui.textMuted}`}>
          {isFinnish
            ? 'Lisää koko nimesi Henkilötiedot-osioon ennen luonnoksen luomista.'
            : 'Add your full name in Personal Information before generating a draft.'}
        </p>
      ) : null}

      <label className="mt-4 flex flex-col gap-1">
        <span className={`text-xs font-bold uppercase tracking-[0.1em] ${ui.textMuted}`}>
          {isFinnish ? 'Luonnos (muokattavissa)' : 'Draft (editable)'}
        </span>
        <textarea
          className={`min-h-72 w-full border px-4 py-3 text-sm leading-6 transition ${ui.input}`}
          value={letterBody}
          onChange={(event) => onLetterBodyChange(event.target.value)}
          placeholder={isFinnish
            ? 'Paina "Luo luonnos" aloittaaksesi, tai kirjoita oma kirjeesi tähän.'
            : 'Press "Generate draft" to start, or write your own letter here.'}
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={`border px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`}
          onClick={onCopy}
          disabled={!hasBody}
        >
          {isFinnish ? 'Kopioi leikepöydälle' : 'Copy to clipboard'}
        </button>
        <button
          type="button"
          className={`border px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`}
          onClick={onDownloadText}
          disabled={!hasBody}
        >
          {isFinnish ? 'Lataa .txt' : 'Download .txt'}
        </button>
        <button
          type="button"
          className={`border px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`}
          onClick={onDownloadPdf}
          disabled={!hasBody}
        >
          {isFinnish ? 'Lataa PDF' : 'Download PDF'}
        </button>
      </div>
    </Modal>
  )
}

export default CoverLetterModal
