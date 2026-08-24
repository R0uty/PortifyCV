// Client-side PDF text extraction for the "Upload PDF" quick-import button
// (ResumeBuilderPage.jsx) — extracted text is dropped into the same
// paste-CV-text textarea that already exists, so parsePastedCvText and
// MERGE_FORM_DATA (cvForm.js / cvFormReducer.js) handle it unchanged. This
// file only gets text out of the PDF; it never parses CV structure itself.
//
// pdfjs-dist is reached exclusively through a memoized dynamic import(),
// mirroring loadHtml2Canvas/loadJsPdf in exporters.js — see vite.config.js's
// manualChunks comment for why: a named vendor chunk gets an eager
// <link rel="modulepreload"> injected on every page, which would undo the
// lazy-loading this is built around. Nothing here is added to manualChunks.
let pdfJsLoader = null

function loadPdfJs() {
  if (!pdfJsLoader) {
    pdfJsLoader = import('pdfjs-dist').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString()

      return pdfjs
    })
  }

  return pdfJsLoader
}

// A scanned/image-only PDF (no real text layer) is a common real case, not
// an edge case — worth a specific message rather than silently handing back
// an empty or near-empty string for the textarea.
const MIN_EXTRACTED_TEXT_LENGTH = 20

// pdf.js's getTextContent() returns a flat list of positioned glyph runs —
// it does NOT insert line breaks for visually separate lines. Naively
// joining item.str with a space collapses an entire page into one line,
// which would defeat parsePastedCvText's line-based heuristics (name on
// line 1, title on line 2, section headers on their own line) for every
// real multi-line resume. Reconstruct line breaks from each item's Y
// position (transform[5]) — the standard technique for this pdf.js gap.
function joinTextItemsPreservingLines(items) {
  let text = ''
  let lastY = null

  for (const item of items) {
    if (!item.str) {
      continue
    }

    const y = item.transform?.[5]

    if (lastY !== null && typeof y === 'number' && Math.abs(y - lastY) > 1) {
      text += '\n'
    } else if (text && !text.endsWith('\n')) {
      text += ' '
    }

    text += item.str
    lastY = typeof y === 'number' ? y : lastY
  }

  return text.trim()
}

/**
 * Extracts plain text from every page of a PDF file, client-side only.
 * @param {File} file
 * @param {{ locale?: 'en' | 'fi' }} [options]
 * @returns {Promise<string>}
 */
export async function extractTextFromPdfFile(file, { locale = 'en' } = {}) {
  const isFinnish = locale === 'fi'
  let pdfjs

  try {
    pdfjs = await loadPdfJs()
  } catch {
    throw new Error(
      isFinnish
        ? 'PDF-lukijaa ei voitu ladata. Tarkista verkkoyhteytesi ja yritä uudelleen.'
        : 'Could not load the PDF reader. Check your connection and try again.',
    )
  }

  let pdf

  try {
    const arrayBuffer = await file.arrayBuffer()
    pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  } catch {
    throw new Error(
      isFinnish
        ? 'Tiedostoa ei voitu lukea. Varmista, että se on kelvollinen PDF-tiedosto.'
        : 'Could not read this file. Make sure it is a valid PDF.',
    )
  }

  const pageTexts = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    pageTexts.push(joinTextItemsPreservingLines(textContent.items))
  }

  const text = pageTexts.filter(Boolean).join('\n\n').trim()

  if (text.length < MIN_EXTRACTED_TEXT_LENGTH) {
    // A common real case here: PortifyCV's own "Export PDF" button
    // (pdf-designer, exporters.js/pdfExportWorker.js) rasterizes the styled
    // preview via html2canvas and embeds it as an image — that PDF has no
    // text layer at all, by design, same as a scanned/photographed page.
    // Re-uploading a PortifyCV export here is a natural thing to try, so
    // this message names that case specifically and points at the actual
    // fix (JSON export/import) rather than leaving a confusing dead end.
    throw new Error(
      isFinnish
        ? 'Tästä PDF:stä ei löytynyt tekstiä. Näin käy skannatuille sivuille, mutta myös PortifyCV:n omalla "Vie PDF" -napilla luoduille tiedostoille, koska ne ovat kuvia, ei tekstiä. Jos tuot omaa PortifyCV-CV:täsi takaisin, käytä sen sijaan "Vie JSON" ja "Tuo JSON" -toimintoja.'
        : 'Couldn\'t find any text in this PDF. This happens for scanned pages, but also for files created by PortifyCV\'s own "Export PDF" button — those are images, not text. If you\'re trying to reload your own PortifyCV CV, use "Export JSON" and "Import JSON" instead.',
    )
  }

  return text
}
