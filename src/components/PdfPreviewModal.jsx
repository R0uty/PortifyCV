import { useEffect, useId, useState } from 'react'
import { Download, LoaderCircle, TriangleAlert } from 'lucide-react'

import Modal from './Modal'
import PdfParserView from './PdfParserView'
import { FIT_OPTIONS, PAPER_OPTIONS } from './pdfPreviewOptions'
import { dialogs } from '../i18n/dialogs/index.js'

// The PDF before it downloads (1.6.74): the pages exactly as the file will
// have them, with the paper and fit options that change them. `onRender`
// builds the pages (exporters.js renderCvPdf) and runs again whenever an
// option changes; `onDownload` saves the pages on screen, so the file is
// what the preview showed. Mounted only while open, so each opening starts
// from a fresh render.
//
// `kind="letter"` (1.7.9) previews the cover letter: paper only, since a
// letter is never shrunk (no Fit options), and no "What a parser reads" tab.

function OptionGroup({ legend, name, options, value, onChange, disabled, locale }) {
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
            <span className="pdf-preview__option-label">{dialogs.t(locale, option.label)}</span>
            <span className="pdf-preview__option-hint">{dialogs.t(locale, option.hint)}</span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}

function PreviewPage({ page, geometry, index, total, locale }) {
  const pageLabel = dialogs.t(locale, 'common.pageOf', { page: index + 1, total })
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
          alt={pageLabel}
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
        {pageLabel}
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
  const t = (key, vars) => dialogs.t(locale, key, vars)
  const readFailedText = t('pdfPreview.readFailed')
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
              : t('pdfPreview.buildFailed'),
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
              : readFailedText,
          })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [needsParserReading, onReadAsParser, optionsKey, readFailedText, rendered])

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
  const paperOption = PAPER_OPTIONS.find((option) => option.value === paper)
  // The paper's English name, as before (A4 and US Letter read the same in both).
  const paperLabel = paperOption ? dialogs.t('en', paperOption.label) : 'A4'
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
    <Modal closeLabel={t('common.close')}
      isOpen
      onClose={onClose}
      size="xl"
      title={isLetter ? t('pdfPreview.letterTitle') : t('pdfPreview.title')}
      description={isLetter
        ? t('pdfPreview.letterDescription')
        : atsFriendlyMode
          ? t('pdfPreview.atsDescription')
          : t('pdfPreview.description')}
    >
      <div className="pdf-preview">
        <div className="pdf-preview__controls">
          <OptionGroup
            legend={t('common.paperSize')}
            name={`${nameId}-paper`}
            options={PAPER_OPTIONS}
            value={paper}
            onChange={onPaperChange}
            disabled={isDownloading}
            locale={locale}
          />
          {isLetter ? null : (
            <OptionGroup
              legend={t('common.fit')}
              name={`${nameId}-fit`}
              options={FIT_OPTIONS}
              value={fit}
              onChange={onFitChange}
              disabled={isDownloading}
              locale={locale}
            />
          )}

          <div className="pdf-preview__summary" role="status" aria-live="polite">
            {isRendering
              ? t('pdfPreview.building')
              : pageCount > 0
                ? isLetter
                  ? t('common.pageSummary', { count: pageCount, paper: paperLabel })
                  : t('pdfPreview.summaryScaled', { count: pageCount, paper: paperLabel, scale: printScale })
                : ''}
          </div>

          {!isLetter && !isRendering && rendered?.missedFitTarget ? (
            <p className="pdf-preview__notice">
              <TriangleAlert size={14} strokeWidth={2} aria-hidden="true" />
              {fit === 'one-page' ? t('pdfPreview.missedOnePage') : t('pdfPreview.missedTwoPages')}
            </p>
          ) : null}

          <div className="pdf-preview__actions">
            <button type="button" className="pdf-preview__button" onClick={onClose}>
              {t('common.cancel')}
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
              {isDownloading ? t('pdfPreview.downloading') : t('common.downloadPdf')}
            </button>
          </div>
        </div>

        <div className="pdf-preview__main">
        {showParserTab ? (
          <div className="pdf-preview__tabs" role="tablist" aria-label={t('common.view')}>
            {[
              ['pages', t('pdfPreview.pagesTab')],
              ['parser', t('pdfPreview.parserTab')],
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
            <PdfParserView state={parserState} locale={locale} atsFriendlyMode={atsFriendlyMode} />
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
              {t('pdfPreview.fallback')}
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
                  locale={locale}
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
