import { useEffect, useId, useState } from 'react'
import { Download, LoaderCircle, TriangleAlert } from 'lucide-react'

import Modal from './Modal'

// The PDF before it downloads (1.6.74): the pages exactly as the file will
// have them, with the paper and fit options that change them. `onRender`
// builds the pages (exporters.js renderCvPdf) and runs again whenever an
// option changes; `onDownload` saves the pages on screen, so the file is
// what the preview showed. Mounted only while open, so each opening starts
// from a fresh render.

const PAPER_OPTIONS = [
  { value: 'a4', en: 'A4', fi: 'A4', hintEn: '210 × 297 mm', hintFi: '210 × 297 mm' },
  { value: 'letter', en: 'US Letter', fi: 'US Letter', hintEn: '8.5 × 11 in', hintFi: '8,5 × 11 in' },
]

const FIT_OPTIONS = [
  {
    value: 'auto',
    en: 'Auto',
    fi: 'Automaattinen',
    hintEn: 'Shrinks a little to avoid a nearly empty last page',
    hintFi: 'Pienentää hieman, ettei viimeinen sivu jää lähes tyhjäksi',
  },
  {
    value: 'one-page',
    en: 'Fit to 1 page',
    fi: 'Sovita 1 sivulle',
    hintEn: 'Shrinks the CV onto one page if the text stays readable',
    hintFi: 'Pienentää CV:n yhdelle sivulle, jos teksti pysyy luettavana',
  },
  {
    value: 'two-pages',
    en: 'Fit to 2 pages',
    fi: 'Sovita 2 sivulle',
    hintEn: 'Shrinks the CV onto two pages at most',
    hintFi: 'Pienentää CV:n enintään kahdelle sivulle',
  },
  {
    value: 'actual',
    en: 'Actual size',
    fi: 'Todellinen koko',
    hintEn: 'No shrinking, however many pages it takes',
    hintFi: 'Ei pienennystä, sivuja tulee tarpeen mukaan',
  },
]

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
  onClose,
  locale = 'en',
  atsFriendlyMode = false,
  paper,
  fit,
  onPaperChange,
  onFitChange,
  onRender,
  onDownload,
}) {
  const isFinnish = locale === 'fi'
  const nameId = useId()
  // The last finished render, and the options it was made with. While the
  // options differ from those, a new render is on its way.
  const [result, setResult] = useState({ key: '', rendered: null, error: '' })
  const [isDownloading, setIsDownloading] = useState(false)
  const optionsKey = `${paper}|${fit}`

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
    <Modal
      isOpen
      onClose={onClose}
      size="xl"
      title={isFinnish ? 'PDF-esikatselu' : 'PDF preview'}
      description={atsFriendlyMode
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
          <OptionGroup
            legend={isFinnish ? 'Sovitus' : 'Fit'}
            name={`${nameId}-fit`}
            options={FIT_OPTIONS}
            value={fit}
            onChange={onFitChange}
            disabled={isDownloading}
            isFinnish={isFinnish}
          />

          <div className="pdf-preview__summary" role="status" aria-live="polite">
            {isRendering
              ? isFinnish ? 'Luodaan esikatselua…' : 'Building preview…'
              : pageCount > 0
                ? isFinnish
                  ? `${pageCount} ${pageCount === 1 ? 'sivu' : 'sivua'} · ${paperLabel} · tekstin koko ${printScale} %`
                  : `${pageCount} ${pageCount === 1 ? 'page' : 'pages'} · ${paperLabel} · text at ${printScale}%`
                : ''}
          </div>

          {!isRendering && rendered?.missedFitTarget ? (
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

        <div className="pdf-preview__pages" aria-busy={isRendering}>
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
      </div>
    </Modal>
  )
}

export default PdfPreviewModal
