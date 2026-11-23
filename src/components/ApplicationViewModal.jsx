import { useEffect, useId, useRef, useState } from 'react'
import { Download, FilePlus2, LoaderCircle } from 'lucide-react'

import Modal from './Modal'
import { PAPER_OPTIONS } from './pdfPreviewOptions'
import { formatAppliedOn } from '../utils/applicationLog'

// View sent (1.7.11): the PDF an application keeps, exactly as it was
// sent. It shows the page images stored with it and downloads the stored
// file byte for byte; nothing is rendered again, so today's CV, template
// or template code can't change what this shows.
//
// Where a stored page image sits on the paper, in mm. These are
// exporters.js's PDF_PAPER_SIZES and its page geometry (getPageGeometry):
// a designer page runs to every edge, an ATS page and the cover letter sit
// inside their mode's margins. Copied rather than imported, since
// exporters.js is a lazy chunk.
const PAPER_MM = {
  a4: { widthMm: 210, heightMm: 297 },
  letter: { widthMm: 215.9, heightMm: 279.4 },
}
const PAGE_INSET_MM = {
  designer: { top: 0, left: 0, right: 0 },
  ats: { top: 16, left: 16, right: 16 },
  letter: { top: 20, left: 22, right: 22 },
}

// Only a web address becomes a link; anything else stored as the ad's
// address (it is free text) is shown as text.
const isWebAddress = (value) => /^https?:\/\//i.test(String(value ?? ''))

// One stored page. The image's object URL lives as long as the page does.
function StoredPage({ image, paper, inset, index, total, isFinnish }) {
  const imageRef = useRef(null)
  const label = isFinnish ? `Sivu ${index + 1} / ${total}` : `Page ${index + 1} of ${total}`

  useEffect(() => {
    const url = URL.createObjectURL(image)
    if (imageRef.current) imageRef.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [image])

  const percentX = (mm) => `${(mm / paper.widthMm) * 100}%`

  return (
    <figure className="pdf-preview__page-frame">
      <div className="pdf-preview__page" style={{ aspectRatio: `${paper.widthMm} / ${paper.heightMm}` }}>
        <img
          ref={imageRef}
          alt={label}
          data-stored-page={index + 1}
          style={{
            left: percentX(inset.left),
            top: `${(inset.top / paper.heightMm) * 100}%`,
            width: percentX(paper.widthMm - inset.left - inset.right),
            height: 'auto',
          }}
          draggable="false"
        />
      </div>
      <figcaption className="pdf-preview__page-number">{label}</figcaption>
    </figure>
  )
}

function ApplicationViewModal({ application, locale = 'en', onClose, onStartNewCv }) {
  const isFinnish = locale === 'fi'
  const tabsId = useId()
  // 'cv' or 'letter'; the switch shows only when a letter is stored.
  const [documentKind, setDocumentKind] = useState('cv')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadFailed, setDownloadFailed] = useState(false)

  if (!application) return null

  const hasLetter = Boolean(application.letter?.pdf)
  const kind = hasLetter ? documentKind : 'cv'
  const file = kind === 'letter' ? application.letter : application.cv
  const pages = Array.isArray(file?.pages) ? file.pages.filter((page) => page?.image instanceof Blob) : []
  const paper = PAPER_MM[file?.paper] ?? PAPER_MM.a4
  const inset = kind === 'letter'
    ? PAGE_INSET_MM.letter
    : application.source?.look?.atsFriendlyMode ? PAGE_INSET_MM.ats : PAGE_INSET_MM.designer
  const paperLabel = PAPER_OPTIONS.find((option) => option.value === file?.paper)?.en ?? 'A4'
  const adUrl = String(application.adUrl ?? '').trim()

  const handleDownload = async () => {
    if (!file?.pdf || isDownloading) return
    setIsDownloading(true)
    setDownloadFailed(false)
    try {
      // 'file-saver' is CommonJS-only: default import, then saveAs (as
      // exporters.js does). Loaded here, on the first download.
      const { default: fileSaver } = await import('file-saver')
      fileSaver.saveAs(file.pdf, file.fileName || 'CV.pdf')
    } catch {
      // The chunk didn't load (offline, a new deploy) or the save threw.
      setDownloadFailed(true)
    } finally {
      setIsDownloading(false)
    }
  }

  const tabs = [
    ['cv', 'CV'],
    ['letter', isFinnish ? 'Hakemuskirje' : 'Cover letter'],
  ]

  return (
    <Modal closeLabel={isFinnish ? 'Sulje' : 'Close'}
      isOpen
      onClose={onClose}
      size="xl"
      title={isFinnish ? `Lähetetty: ${application.company}` : `Sent to ${application.company}`}
      description={`${application.role} · ${formatAppliedOn(application.appliedOn, isFinnish)}`}
    >
      <div className="pdf-preview">
        <div className="pdf-preview__controls">
          {adUrl ? (
            <p className="application-view__ad">
              <span className="pdf-preview__legend">{isFinnish ? 'Työpaikkailmoitus' : 'Job ad'}</span>
              {isWebAddress(adUrl) ? (
                <a href={adUrl} target="_blank" rel="noopener noreferrer" className="settings-link application-view__ad-value">
                  {adUrl}
                </a>
              ) : (
                <span className="application-view__ad-value">{adUrl}</span>
              )}
            </p>
          ) : null}

          <div className="pdf-preview__summary">
            {pages.length > 0
              ? isFinnish
                ? `${pages.length} ${pages.length === 1 ? 'sivu' : 'sivua'} · ${paperLabel}`
                : `${pages.length} ${pages.length === 1 ? 'page' : 'pages'} · ${paperLabel}`
              : ''}
          </div>

          <div className="pdf-preview__actions">
            <button
              type="button"
              className="pdf-preview__button"
              onClick={() => onStartNewCv(application.id)}
            >
              <FilePlus2 size={15} strokeWidth={2} aria-hidden="true" />
              {isFinnish ? 'Aloita uusi CV tästä' : 'Start new CV from it'}
            </button>
            <button
              type="button"
              className="pdf-preview__button pdf-preview__button--primary"
              onClick={handleDownload}
              disabled={!file?.pdf || isDownloading}
            >
              {isDownloading
                ? <LoaderCircle size={15} strokeWidth={2} className="pdf-preview__spinner" aria-hidden="true" />
                : <Download size={15} strokeWidth={2} aria-hidden="true" />}
              {isFinnish ? 'Lataa PDF' : 'Download PDF'}
            </button>
          </div>

          {downloadFailed ? (
            <p className="mark-applied__error text-sm" role="alert">
              {isFinnish ? 'PDF:ää ei voitu ladata. Yritä uudelleen.' : 'The PDF couldn\'t be downloaded. Try again.'}
            </p>
          ) : null}
        </div>

        <div className="pdf-preview__main">
          {hasLetter ? (
            <div className="pdf-preview__tabs" role="tablist" aria-label={isFinnish ? 'Tiedosto' : 'File'}>
              {tabs.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  id={`${tabsId}-${value}-tab`}
                  aria-controls={`${tabsId}-panel`}
                  aria-selected={kind === value}
                  tabIndex={kind === value ? 0 : -1}
                  className={`pdf-preview__tab${kind === value ? ' pdf-preview__tab--active' : ''}`}
                  onClick={() => setDocumentKind(value)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                      event.preventDefault()
                      const next = value === 'cv' ? 'letter' : 'cv'
                      setDocumentKind(next)
                      document.getElementById(`${tabsId}-${next}-tab`)?.focus()
                    }
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          <div
            className="pdf-preview__pages"
            {...(hasLetter ? { role: 'tabpanel', id: `${tabsId}-panel`, 'aria-labelledby': `${tabsId}-${kind}-tab` } : {})}
          >
            {pages.length > 0 ? (
              <div className="pdf-preview__page-list">
                {pages.map((page, index) => (
                  <StoredPage
                    // A stored record never changes, so index is a stable key.
                    key={`${kind}-${index}`}
                    image={page.image}
                    paper={paper}
                    inset={inset}
                    index={index}
                    total={pages.length}
                    isFinnish={isFinnish}
                  />
                ))}
              </div>
            ) : (
              <p className="pdf-preview__message">
                {isFinnish
                  ? 'Tästä PDF:stä ei ole kuvaa. Lataa se nähdäksesi sen.'
                  : 'There\'s no picture of this PDF. Download it to see it.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ApplicationViewModal
