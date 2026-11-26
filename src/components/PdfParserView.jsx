import { CircleAlert, CircleCheck, CircleDashed, CircleX, LoaderCircle } from 'lucide-react'

import { dialogs } from '../i18n/dialogs/index.js'

// The PDF preview's "What a parser reads" tab (1.7.4): one row per thing
// the CV says, with what the parser made of the PDF's text
// (utils/parserView.js), then the text itself in reading order.

// Keys in the dialogs namespace, by parserView.js's field and status ids.
const FIELD_LABELS = {
  name: 'parserView.fields.name',
  headline: 'parserView.fields.headline',
  email: 'parserView.fields.email',
  phone: 'parserView.fields.phone',
  summary: 'parserView.fields.summary',
  job: 'parserView.fields.job',
  education: 'parserView.fields.education',
  skills: 'parserView.fields.skills',
  languages: 'parserView.fields.languages',
}

const STATUS = {
  ok: { Icon: CircleCheck, label: 'parserView.statuses.ok' },
  partial: { Icon: CircleDashed, label: 'parserView.statuses.partial' },
  unrecognised: { Icon: CircleAlert, label: 'parserView.statuses.unrecognised' },
  missing: { Icon: CircleX, label: 'parserView.statuses.missing' },
}

function PdfParserView({ state, locale = 'en', atsFriendlyMode }) {
  const t = (key, vars) => dialogs.t(locale, key, vars)

  if (state.status === 'reading') {
    return (
      <p className="pdf-parser__message" role="status">
        <LoaderCircle size={16} strokeWidth={2} className="pdf-preview__spinner" aria-hidden="true" />
        {t('parserView.reading')}
      </p>
    )
  }

  if (state.status === 'error') {
    return <p className="pdf-parser__message" role="alert">{state.error}</p>
  }

  if (state.status === 'unavailable') {
    return (
      <p className="pdf-parser__message">
        {t('parserView.unavailable')}
      </p>
    )
  }

  const { rows, lines } = state.result
  const readCount = rows.filter((row) => row.status === 'ok').length
  const hasProblems = rows.some((row) => row.status === 'missing' || row.status === 'unrecognised')

  return (
    <div className="pdf-parser" data-parser-view>
      <p className="pdf-parser__intro">
        {t('parserView.intro')}
      </p>
      <p className="pdf-parser__summary" role="status">
        {t('parserView.summary', { read: readCount, total: rows.length })}
      </p>

      <ul className="pdf-parser__rows">
        {rows.map((row, index) => {
          const { Icon, label } = STATUS[row.status]

          return (
            <li key={`${row.field}-${index}`} className={`pdf-parser__row pdf-parser__row--${row.status}`} data-parser-field={row.field} data-parser-status={row.status}>
              <Icon size={16} strokeWidth={2} aria-hidden="true" className="pdf-parser__icon" />
              <div className="pdf-parser__text">
                <p className="pdf-parser__field">
                  {t(FIELD_LABELS[row.field])}
                  {row.count ? ` (${row.count.found}/${row.count.total})` : ''}
                  <span className="pdf-parser__status">{t(label)}</span>
                </p>
                <p className="pdf-parser__value">{row.value}</p>
              </div>
            </li>
          )
        })}
      </ul>

      {hasProblems ? (
        <p className="pdf-parser__hint">
          {atsFriendlyMode ? t('parserView.hintAts') : t('parserView.hintDesign')}
        </p>
      ) : null}

      <details className="pdf-parser__raw">
        <summary>{t('parserView.showText')}</summary>
        <pre className="pdf-parser__lines">
          {lines.length > 0
            ? lines.map((line) => (line === '' ? t('parserView.nextColumn') : line)).join('\n')
            : t('parserView.noText')}
        </pre>
      </details>
    </div>
  )
}

export default PdfParserView
