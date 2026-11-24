import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import CVPreview from '../components/CVPreview'
import ScaledPreview from '../components/ScaledPreview'
import { readCvStateFromLocation, shareEditUrl } from '../utils/shareLinks'
import { resolveSharedCvLook } from '../utils/sharedCvLook'
import { hideEmptySections } from '../utils/sectionContent'
import { resolveCvLocale } from '../utils/cvForm'
import { createExportFileName } from '../utils/cvSnapshot'
import { getCvFontStack, loadCvFont } from '../utils/cvFonts'
import { localizePath } from '../utils/routes'

// The read-only page a share link opens (/view#data=…, 1.7.12). The CV
// lives in the address's fragment, which only the browser has: the address
// is read as an external store (null without a window, so render never
// touches it there), and again when the fragment changes in the same tab.
// A link with no data, or one that doesn't decode, shows a short message
// instead of a CV.
function BadLinkMessage({ locale }) {
  const isFinnish = locale === 'fi'
  return (
    <div className="landing-section" style={{ textAlign: 'center' }}>
      <h1 className="landing-section__title">
        {isFinnish ? 'Tätä CV-linkkiä ei voi avata' : "This CV link can't be opened"}
      </h1>
      <p className="landing-section__subtitle">
        {isFinnish
          ? 'Linkki on voinut katketa tai muuttua. Pyydä lähettäjältä uusi linkki.'
          : 'The link may have been cut short or changed. Ask the sender for a new one.'}
      </p>
      <a href={localizePath('/', locale)}>
        {isFinnish ? 'Siirry PortifyCV:hen' : 'Go to PortifyCV'}
      </a>
    </div>
  )
}

const subscribeToHash = (onChange) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}
const readHref = () => window.location.href
const readNoHref = () => null

// The link's CV, or null for a missing or corrupt link.
function readSharedCv(href) {
  try {
    return readCvStateFromLocation(href)
  } catch {
    return null
  }
}

const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(resolve))

// The CV itself: a bar with the name, Download PDF and Edit a copy, the CV
// scaled to the page's width, and an off-screen, inert copy that the PDF is
// captured from, exactly like the builder's export source. Everything on it
// follows the CV's own language, not the visitor's; nothing is written to
// this browser.
function SharedCv({ shared, href, locale }) {
  const { formData, templateId, look, pdf } = shared
  const cvLocale = resolveCvLocale(formData, locale)
  const isFinnish = cvLocale === 'fi'
  const resolved = useMemo(
    () => resolveSharedCvLook(formData, templateId, look),
    [formData, templateId, look],
  )
  const shownCv = useMemo(() => hideEmptySections(formData), [formData])
  const fontStack = getCvFontStack(resolved.cvFontId)
  const fullName = formData.fullName?.trim() ?? ''
  const exportRef = useRef(null)
  const isBusyRef = useRef(false)
  const [isBusy, setIsBusy] = useState(false)
  const [hasError, setHasError] = useState(false)

  const documentTitle = fullName
    ? `${fullName} — CV`
    : isFinnish ? 'Jaettu CV - PortifyCV' : 'Shared CV - PortifyCV'

  useEffect(() => {
    document.title = documentTitle
  }, [documentTitle])

  const handleDownload = useCallback(async () => {
    // A ref as well as the state: a second click in the same frame sees the
    // ref before React has disabled the button.
    if (isBusyRef.current) {
      return
    }
    isBusyRef.current = true
    setIsBusy(true)
    setHasError(false)

    try {
      const { renderCvPdf, saveRenderedCvPdf } = await import('../utils/exporters')
      await loadCvFont(resolved.cvFontId)
      await document.fonts.ready
      await nextFrame()
      await nextFrame()

      const ats = resolved.atsFriendlyMode
      const rendered = await renderCvPdf(exportRef.current, createExportFileName(formData) || 'cv', {
        mode: ats ? 'ats' : 'designer',
        formData,
        template: resolved.template,
        variant: resolved.template,
        atsFriendlyMode: ats,
        locale: cvLocale,
        paper: pdf.paper,
        fit: pdf.fit,
      })
      // A page that can't be captured comes back as the text-only fallback,
      // which this writes too.
      await saveRenderedCvPdf(rendered)
    } catch {
      setHasError(true)
    } finally {
      isBusyRef.current = false
      setIsBusy(false)
    }
  }, [cvLocale, formData, pdf.fit, pdf.paper, resolved])

  const previewProps = {
    template: resolved.template,
    locale,
    atsFriendlyMode: resolved.atsFriendlyMode,
    accentColor: resolved.accentColor,
    headingColor: resolved.cvHeadingColor,
    styleVariantId: resolved.styleVariantId,
    classicNameAlignment: resolved.classicNameAlignment,
  }

  return (
    <div className="shared-cv" lang={cvLocale}>
      <div className="shared-cv__bar">
        <h1 className="shared-cv__name">{fullName || (isFinnish ? 'Jaettu CV' : 'Shared CV')}</h1>
        <div className="shared-cv__actions">
          <button
            type="button"
            className="shared-cv__button shared-cv__button--primary"
            onClick={handleDownload}
            disabled={isBusy}
          >
            {isBusy
              ? (isFinnish ? 'Valmistellaan PDF:ää…' : 'Preparing PDF…')
              : (isFinnish ? 'Lataa PDF' : 'Download PDF')}
          </button>
          <a
            className="shared-cv__button"
            href={shareEditUrl(href)}
            target="_blank"
            rel="noopener"
            title={isFinnish ? 'Avaa CV:n muokattavaksi uuteen välilehteen' : 'Opens the CV in the builder in a new tab'}
          >
            {isFinnish ? 'Muokkaa kopiota' : 'Edit a copy'}
          </a>
        </div>
      </div>
      {hasError && (
        <p className="shared-cv__error" role="alert">
          {isFinnish ? 'PDF:ää ei voitu tehdä. Yritä uudelleen.' : 'The PDF could not be made. Try again.'}
        </p>
      )}

      <div className="shared-cv__preview">
        <ScaledPreview
          formData={shownCv}
          {...previewProps}
          fontId={resolved.cvFontId}
          fontStack={fontStack}
        />
      </div>

      <p className="shared-cv__footer">
        <a href={localizePath('/', cvLocale)}>{isFinnish ? 'Tehty PortifyCV:llä' : 'Made with PortifyCV'}</a>
      </p>

      {/* What Download PDF captures: the builder's off-screen, inert,
          read-only export source (ResumeBuilderPage.jsx), at full size. */}
      <div
        className="direct-edit-export-source"
        style={{ '--font-sans': fontStack }}
        aria-hidden="true"
        inert
      >
        <CVPreview formData={shownCv} previewRef={exportRef} {...previewProps} />
      </div>
    </div>
  )
}

export default function SharedCvPage({ locale = 'en' }) {
  const href = useSyncExternalStore(subscribeToHash, readHref, readNoHref)
  const shared = useMemo(() => (href ? readSharedCv(href) : null), [href])

  if (!href) {
    return null
  }
  if (!shared) {
    return <BadLinkMessage locale={locale} />
  }
  return <SharedCv shared={shared} href={href} locale={locale} />
}
