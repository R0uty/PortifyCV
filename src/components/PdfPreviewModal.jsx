import { useEffect, useId, useState } from 'react'
import { Download, LoaderCircle, TriangleAlert } from 'lucide-react'

import Modal from './Modal'
import PdfParserView from './PdfParserView'
import { FIT_OPTIONS, PAPER_OPTIONS } from './pdfPreviewOptions'

// The PDF before it downloads (1.6.74): the pages exactly as the file will
// have them, with the paper and fit options that change them. `onRender`
// builds the pages (exporters.js renderCvPdf) and runs again whenever an
// option changes; `onDownload` saves the pages on screen, so the file is
// what the preview showed. Mounted only while open, so each opening starts
// from a fresh render.
//
// `kind="letter"` (1.7.9) previews the cover letter: paper only, since a
// letter is never shrunk (no Fit options), and no "What a parser reads" tab.

function OptionGroup({ legend, name, options, value, onChange, disabled, isFinnish }) {
  return (
    <fieldset className="pdf-preview__group">
      <legend className="pdf-preview__legend">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={`pdf-preview__option${value === option.value ? ' pdf-preview__option--checked' : ''}`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            onChange={() => onChange(option.value)}
          />
          <span className="pdf-preview__option-text">
            <span className="pdf-preview__option-label">{isFinnish ? option.fi : option.en}</span>
            <span className="pdf-preview__option-hint">{isFinnish ? option.hintFi : option.hintEn}</span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}

function PreviewPage({ page, geometry, index, total, isFinnish }) {
  const { paper, marginMm, renderedWidth } = geometry
  const percentX = (mm) => `${(mm / paper.widthMm) * 100}%`
  const percentY = (mm) => `${(mm / paper.heightMm) * 100}%`

  return (
    <figure className="pdf-preview__page-frame">
      <div
        className="pdf-preview__page"
        style={{ aspectRatio: `${paper.widthMm} / ${paper.heightMm}` }}
        data-pdf-preview-page={index + 1}
      >
        <img
          src={page.imageDataUrl}
          alt={isFinnish ? `Sivu ${index + 1} / ${total}` : `Page ${index + 1} of ${total}`}
          style={{
            left: percentX(marginMm.left),
            top: percentY(marginMm.top),
            width: percentX(renderedWidth),
            height: percentY(page.sliceHeightMm),
          }}
          draggable="false"
        />
        {page.separatorLineSegments.map((segment) => (
          <span
            key={`${segment.start}-${segment.y}`}
            className="pdf-preview__separator"
            aria-hidden="true"
            style={{
              left: percentX(segment.start),
              top: percentY(segment.y),
              width: percentX(segment.end - segment.start),
            }}
          />
        ))}
      </div>
      <figcaption className="pdf-preview__page-number">
        {isFinnish ? `Sivu ${index + 1} / ${total}` : `Page ${index + 1} of ${total}`}
      </figcaption>
    </figure>
  )
}

function PdfPreviewModal({
  kind = 'cv',
  onClose,
  locale = 'en',
  atsFriendlyMode = false,
  paper,
  fit,
  onPaperChange,
  onFitChange,
  onRender,
  onDownload,
  // Reads the rendered PDF back as a parser would (1.7.4); optional.
  onReadAsParser = null,
}) {
  const isFinnish = locale === 'fi'
  const isLetter = kind === 'letter'
  const nameId = useId()
  // The last finished render, and the options it was made with. While the
  // options differ from those, a new render is on its way.
  const [result, setResult] = useState({ key: '', rendered: null, error: '' })
  const [isDownloading, setIsDownloading] = useState(false)
  const optionsKey = `${paper}|${fit}`
  // 'pages' or 'parser' ("What a parser reads").
  const [view, setView] = useState('pages')
  // The last finished parser reading, keyed like `result`.
  const [parserResult, setParserResult] = useState({ key: '', result: null, error: '' })
  const tabsId = useId()

  useEffect(() => {
    let isCurrent = true

    onRender({ paper, fit })
      .then((rendered) => {
        if (isCurrent) {
          setResult({ key: optionsKey, rendered, error: '' })
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setResult({
            key: optionsKey,
            rendered: null,
            error: error instanceof Error && error.message
              ? error.message
              : isFinnish ? 'Esikatselua ei voitu luoda.' : 'Could not build the preview.',
          })
        }
      })

    return () => {
      isCurrent = false
    }
    // onRender changes identity with the CV, which can't change while this is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsKey])

  const { rendered, error } = result
  const isRendering = result.key !== optionsKey
  const showParserTab = Boolean(onReadAsParser) && !isLetter
  const canReadAsParser = showParserTab && !isRendering && Boolean(rendered) && !rendered.fallback
  const needsParserReading = view === 'parser' && canReadAsParser && parserResult.key !== optionsKey

  // Reads this render's PDF once the tab is open; again after a new render.
  useEffect(() => {
    if (!needsParserReading) return undefined

    let isCurrent = true
    const key = optionsKey

    onReadAsParser(rendered)
      .then((reading) => {
        if (isCurrent) setParserResult({ key, result: reading, error: '' })
      })
      .catch((readError) => {
        if (isCurrent) {
          setParserResult({
            key,
            result: null,
            error: readError instanceof Error && readError.message
              ? readError.message
              : isFinnish ? 'PDF:ää ei voitu lukea.' : 'Could not read the PDF.',
          })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [isFinnish, needsParserReading, onReadAsParser, optionsKey, rendered])

  const parserState = rendered?.fallback && !isRendering
    ? { status: 'unavailable' }
    : isRendering || parserResult.key !== optionsKey
      ? { status: 'reading' }
      : parserResult.error
        ? { status: 'error', error: parserResult.error }
        : { status: 'ready', result: parserResult.result }
  const status = isRendering ? 'rendering' : error ? 'error' : 'ready'
  const canDownload = status === 'ready' && Boolean(rendered) && !isDownloading
  const pageCount = rendered && !rendered.fallback ? rendered.pageCount : 0
  const paperLabel = PAPER_OPTIONS.find((option) => option.value === paper)?.en ?? 'A4'
  const printScale = rendered && !rendered.fallback ? Math.round(rendered.printScale * 100) : null

  const handleDownload = async () => {
    if (!canDownload) {
      return
    }

    setIsDownloading(true)

    try {
      await onDownload(rendered)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Modal closeLabel={isFinnish ? 'Sulje' : 'Close'}
      isOpen
      onClose={onClose}
      size="xl"
      title={isLetter
        ? isFinnish ? 'Hakemuskirjeen PDF' : 'Cover letter PDF'
        : isFinnish ? 'PDF-esikatselu' : 'PDF preview'}
      description={isLetter
        ? isFinnish
          ? 'Hakemuskirje CV:si ulkoasussa, juuri sellaisena kuin se tallentuu. Valitse paperikoko ennen latausta.'
          : 'Your cover letter in your CV\'s design, exactly as it will be saved. Pick the paper, then download.'
        : atsFriendlyMode
        ? isFinnish
          ? 'ATS-asettelu, juuri sellaisena kuin se tallentuu. Valitse paperikoko ja sovitus ennen latausta.'
          : 'Your ATS layout, exactly as it will be saved. Pick the paper and fit, then download.'
        : isFinnish
          ? 'Oma ulkoasusi, juuri sellaisena kuin se tallentuu. Valitse paperikoko ja sovitus ennen latausta.'
          : 'Your design, exactly as it will be saved. Pick the paper and fit, then download.'}
    >
      <div className="pdf-preview">
        <div className="pdf-preview__controls">
          <OptionGroup
            legend={isFinnish ? 'Paperikoko' : 'Paper size'}
            name={`${nameId}-paper`}
            options={PAPER_OPTIONS}
            value={paper}
            onChange={onPaperChange}
            disabled={isDownloading}
            isFinnish={isFinnish}
          />
          {isLetter ? null : (
            <OptionGroup
              legend={isFinnish ? 'Sovitus' : 'Fit'}
              name={`${nameId}-fit`}
              options={FIT_OPTIONS}
              value={fit}
              onChange={onFitChange}
              disabled={isDownloading}
              isFinnish={isFinnish}
            />
          )}

          <div className="pdf-preview__summary" role="status" aria-live="polite">
            {isRendering
              ? isFinnish ? 'Luodaan esikatselua…' : 'Building preview…'
              : pageCount > 0
                ? isFinnish
                  ? `${pageCount} ${pageCount === 1 ? 'sivu' : 'sivua'} · ${paperLabel}${isLetter ? '' : ` · tekstin koko ${printScale} %`}`
                  : `${pageCount} ${pageCount === 1 ? 'page' : 'pages'} · ${paperLabel}${isLetter ? '' : ` · text at ${printScale}%`}`
                : ''}
          </div>

          {!isLetter && !isRendering && rendered?.missedFitTarget ? (
            <p className="pdf-preview__notice">
              <TriangleAlert size={14} strokeWidth={2} aria-hidden="true" />
              {isFinnish
                ? `CV ei mahdu ${fit === 'one-page' ? 'yhdelle sivulle' : 'kahdelle sivulle'} ilman, että teksti pienenee liikaa. Esikatselu näyttää automaattisen sovituksen. Lyhennä sisältöä tai valitse tiiviimpi pohja.`
                : `Your CV doesn't fit on ${fit === 'one-page' ? 'one page' : 'two pages'} without the text getting too small, so this shows the Auto fit. Shorten some content or try a more compact template.`}
            </p>
          ) : null}

          <div className="pdf-preview__actions">
            <button type="button" className="pdf-preview__button" onClick={onClose}>
              {isFinnish ? 'Peruuta' : 'Cancel'}
            </button>
            <button
              type="button"
              className="pdf-preview__button pdf-preview__button--primary"
              onClick={handleDownload}
              disabled={!canDownload}
            >
              {isDownloading
                ? <LoaderCircle size={15} strokeWidth={2} className="pdf-preview__spinner" aria-hidden="true" />
                : <Download size={15} strokeWidth={2} aria-hidden="true" />}
              {isDownloading
                ? isFinnish ? 'Ladataan…' : 'Downloading…'
                : isFinnish ? 'Lataa PDF' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div className="pdf-preview__main">
        {showParserTab ? (
          <div className="pdf-preview__tabs" role="tablist" aria-label={isFinnish ? 'Näkymä' : 'View'}>
            {[
              ['pages', isFinnish ? 'Sivut' : 'Pages'],
              ['parser', isFinnish ? 'Mitä jäsennin lukee' : 'What a parser reads'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                id={`${tabsId}-${value}-tab`}
                aria-controls={`${tabsId}-${value}`}
                aria-selected={view === value}
                tabIndex={view === value ? 0 : -1}
                className={`pdf-preview__tab${view === value ? ' pdf-preview__tab--active' : ''}`}
                onClick={() => setView(value)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault()
                    const next = value === 'pages' ? 'parser' : 'pages'
                    setView(next)
                    document.getElementById(`${tabsId}-${next}-tab`)?.focus()
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        {view === 'parser' && showParserTab ? (
          <div
            className="pdf-preview__pages pdf-preview__pages--parser"
            role="tabpanel"
            id={`${tabsId}-parser`}
            aria-labelledby={`${tabsId}-parser-tab`}
            aria-busy={parserState.status === 'reading'}
          >
            <PdfParserView state={parserState} isFinnish={isFinnish} atsFriendlyMode={atsFriendlyMode} />
          </div>
        ) : (
        <div
          className="pdf-preview__pages"
          aria-busy={isRendering}
          {...(showParserTab ? { role: 'tabpanel', id: `${tabsId}-pages`, 'aria-labelledby': `${tabsId}-pages-tab` } : {})}
        >
          {status === 'error' ? (
            <p className="pdf-preview__message pdf-preview__message--error" role="alert">{error}</p>
          ) : null}

          {rendered?.fallback && !isRendering ? (
            <p className="pdf-preview__message">
              {isFinnish
                ? 'Tämä selain ei pystynyt kuvaamaan ulkoasua, joten esikatselua ei ole. Lataus luo pelkistetyn tekstimuotoisen A4-PDF:n.'
                : 'This browser couldn\'t capture the design, so there\'s no preview. Downloading makes a plain, text-only A4 PDF instead.'}
            </p>
          ) : null}

          {rendered && !rendered.fallback ? (
            <div className={`pdf-preview__page-list${isRendering ? ' pdf-preview__page-list--stale' : ''}`}>
              {rendered.pages.map((page, index) => (
                <PreviewPage
                  // Pages are rebuilt whole on every render, so index is a stable key.
                  key={index}
                  page={page}
                  geometry={rendered.geometry}
                  index={index}
                  total={rendered.pages.length}
                  isFinnish={isFinnish}
                />
              ))}
            </div>
          ) : null}

          {isRendering ? (
            <div className="pdf-preview__loading" aria-hidden="true">
              <LoaderCircle size={22} strokeWidth={2} className="pdf-preview__spinner" />
            </div>
          ) : null}
        </div>
        )}
        </div>
      </div>
    </Modal>
  )
}

export default PdfPreviewModal
