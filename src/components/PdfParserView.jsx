import { CircleAlert, CircleCheck, CircleDashed, CircleX, LoaderCircle } from 'lucide-react'

// The PDF preview's "What a parser reads" tab (1.7.4): one row per thing
// the CV says, with what the parser made of the PDF's text
// (utils/parserView.js), then the text itself in reading order.

const FIELD_LABELS = {
  name: { en: 'Name', fi: 'Nimi' },
  headline: { en: 'Job title', fi: 'Titteli' },
  email: { en: 'Email', fi: 'Sähköposti' },
  phone: { en: 'Phone', fi: 'Puhelin' },
  summary: { en: 'Summary', fi: 'Yhteenveto' },
  job: { en: 'Job', fi: 'Työpaikka' },
  education: { en: 'Education', fi: 'Koulutus' },
  skills: { en: 'Skills', fi: 'Taidot' },
  languages: { en: 'Languages', fi: 'Kielet' },
}

const STATUS = {
  ok: { Icon: CircleCheck, en: 'Read correctly', fi: 'Luettiin oikein' },
  partial: { Icon: CircleDashed, en: 'Partly read', fi: 'Luettiin osittain' },
  unrecognised: { Icon: CircleAlert, en: 'In the text, not recognised', fi: 'Tekstissä, mutta ei tunnistettu' },
  missing: { Icon: CircleX, en: 'Not in the PDF’s text', fi: 'Ei PDF:n tekstissä' },
}

function PdfParserView({ state, isFinnish, atsFriendlyMode }) {
  const language = isFinnish ? 'fi' : 'en'

  if (state.status === 'reading') {
    return (
      <p className="pdf-parser__message" role="status">
        <LoaderCircle size={16} strokeWidth={2} className="pdf-preview__spinner" aria-hidden="true" />
        {isFinnish ? 'Luetaan PDF:ää…' : 'Reading the PDF…'}
      </p>
    )
  }

  if (state.status === 'error') {
    return <p className="pdf-parser__message" role="alert">{state.error}</p>
  }

  if (state.status === 'unavailable') {
    return (
      <p className="pdf-parser__message">
        {isFinnish
          ? 'Tämä selain loi pelkistetyn tekstimuotoisen PDF:n, joten luettavaa ulkoasua ei ole.'
          : 'This browser makes a plain, text-only PDF instead, so there is no layout to read back.'}
      </p>
    )
  }

  const { rows, lines } = state.result
  const readCount = rows.filter((row) => row.status === 'ok').length
  const hasProblems = rows.some((row) => row.status === 'missing' || row.status === 'unrecognised')

  return (
    <div className="pdf-parser" data-parser-view>
      <p className="pdf-parser__intro">
        {isFinnish
          ? 'Teksti, jonka rekrytointijärjestelmä voi lukea tästä PDF:stä, luettuna PortifyCV:n oman tuontitoiminnon kautta. Järjestelmät eroavat toisistaan, joten pidä tätä tarkistuksena, ei takuuna.'
          : 'The text an applicant tracking system can read from this PDF, read back by PortifyCV’s own importer. Systems differ, so treat this as a check, not a guarantee.'}
      </p>
      <p className="pdf-parser__summary" role="status">
        {isFinnish
          ? `${readCount}/${rows.length} kohtaa luettiin oikein`
          : `${readCount} of ${rows.length} read correctly`}
      </p>

      <ul className="pdf-parser__rows">
        {rows.map((row, index) => {
          const { Icon, ...labels } = STATUS[row.status]

          return (
            <li key={`${row.field}-${index}`} className={`pdf-parser__row pdf-parser__row--${row.status}`} data-parser-field={row.field} data-parser-status={row.status}>
              <Icon size={16} strokeWidth={2} aria-hidden="true" className="pdf-parser__icon" />
              <div className="pdf-parser__text">
                <p className="pdf-parser__field">
                  {FIELD_LABELS[row.field][language]}
                  {row.count ? ` (${row.count.found}/${row.count.total})` : ''}
                  <span className="pdf-parser__status">{labels[language]}</span>
                </p>
                <p className="pdf-parser__value">{row.value}</p>
              </div>
            </li>
          )
        })}
      </ul>

      {hasProblems ? (
        <p className="pdf-parser__hint">
          {atsFriendlyMode
            ? isFinnish
              ? '"Ei PDF:n tekstissä" voi tarkoittaa, ettei pohja näytä kyseistä osiota. "Ei tunnistettu" tarkoittaa, että teksti on mukana, mutta jäsennin ei tiennyt, mihin kenttään se kuuluu.'
              : '"Not in the PDF’s text" can mean the template doesn’t show that section. "Not recognised" means the words are there, but the parser couldn’t tell which field they belong to.'
            : isFinnish
              ? 'Kokeile ATS-näkymää: sen yksipalstainen asettelu luetaan järjestyksessä. "Ei PDF:n tekstissä" voi myös tarkoittaa, ettei pohja näytä kyseistä osiota.'
              : 'Try ATS view: its one-column layout reads in order. "Not in the PDF’s text" can also mean the template doesn’t show that section.'}
        </p>
      ) : null}

      <details className="pdf-parser__raw">
        <summary>{isFinnish ? 'Näytä teksti lukujärjestyksessä' : 'Show the text in reading order'}</summary>
        <pre className="pdf-parser__lines">
          {lines.length > 0
            ? lines.map((line) => (line === '' ? (isFinnish ? '— seuraava palsta —' : '— next column —') : line)).join('\n')
            : isFinnish ? '(ei tekstiä)' : '(no text)'}
        </pre>
      </details>
    </div>
  )
}

export default PdfParserView
