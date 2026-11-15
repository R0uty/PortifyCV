// Reads the text out of someone's existing CV file, a PDF or a Word
// document, as lines in reading order. cvTextImport.js turns those lines
// into CV data.
//
// Everything happens in the browser: the file is never uploaded. pdf.js and
// jszip are imported inside the functions that need them, and this module
// itself is only reached through a dynamic import() in ResumeBuilderPage's
// upload handler, so neither library is in the entry chunk or downloaded
// before someone actually picks a file. (No manualChunks entry for them
// either — see the comment in vite.config.js on why that would preload
// them on every page.)

const MAX_PDF_PAGES = 20
// A .docx is a zip, so a small file can unpack into a huge one.
const MAX_DOCX_XML_BYTES = 25 * 1024 * 1024

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/** `code` lets the caller show its own localized message. */
function importError(code, cause) {
  const error = new Error(`CV file import failed: ${code}`, cause ? { cause } : undefined)
  error.code = code
  return error
}

/**
 * @param {File} file
 * @returns {'pdf' | 'docx' | null}
 */
export function getCvFileKind(file) {
  const name = (file?.name ?? '').toLowerCase()

  if (name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.docx')) return 'docx'
  if (file?.type === 'application/pdf') return 'pdf'
  if (file?.type === DOCX_MIME) return 'docx'
  return null
}

// A PDF has no lines, only positioned text runs. Runs on (nearly) the same
// baseline become one line; a wide horizontal gap inside a line is kept as
// two spaces, which the parser reads as a column separator.
function pdfItemsToLines(items) {
  const runs = items
    .filter((item) => typeof item.str === 'string' && item.str.trim())
    .map((item) => ({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width,
      height: item.height || Math.abs(item.transform[3]) || 10,
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x)

  const rows = []

  for (const run of runs) {
    const row = rows[rows.length - 1]

    if (row && Math.abs(row.y - run.y) < Math.max(2, row.height * 0.5)) {
      row.runs.push(run)
    } else {
      rows.push({ y: run.y, height: run.height, runs: [run] })
    }
  }

  return rows.map((row) => {
    let line = ''
    let end = null

    for (const run of row.runs.sort((a, b) => a.x - b.x)) {
      if (end !== null) {
        const gap = run.x - end
        if (gap > run.height * 3) line += '  '
        else if (gap > run.height * 0.15 && !/\s$/.test(line) && !/^\s/.test(run.text)) line += ' '
      }
      line += run.text
      end = run.x + run.width
    }

    return line
  })
}

async function extractPdfLines(file) {
  // The legacy build: the default one assumes a browser newer than this
  // app's es2020 target.
  const [pdfjs, { default: workerSrc }] = await Promise.all([
    import('pdfjs-dist/legacy/build/pdf.min.mjs'),
    // Bundled with the app and served from our own origin, never a CDN.
    import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
  ])

  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    isEvalSupported: false,
    disableFontFace: true,
    useSystemFonts: false,
    useWorkerFetch: false,
  })

  try {
    const pdf = await loadingTask.promise
    const lines = []

    for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, MAX_PDF_PAGES); pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      lines.push(...pdfItemsToLines(content.items))
    }

    return lines
  } finally {
    await loadingTask.destroy().catch(() => {})
  }
}

// word/document.xml: every w:p is a paragraph, its text in w:t runs.
function collectDocxLines(node, lines, buffer) {
  for (const child of node.childNodes) {
    if (child.nodeType !== 1) continue

    switch (child.nodeName) {
      case 'w:p': {
        const paragraph = []
        collectDocxLines(child, lines, paragraph)
        lines.push(...paragraph.join('').split('\n'))
        break
      }
      case 'w:t':
        buffer?.push(child.textContent ?? '')
        break
      case 'w:tab':
        buffer?.push('\t')
        break
      case 'w:br':
      case 'w:cr':
        buffer?.push('\n')
        break
      // The compatibility copy of a text box: its text is already read from
      // the mc:Choice branch beside it.
      case 'mc:Fallback':
      // Tracked deletions are text the author removed.
      // eslint-disable-next-line no-fallthrough
      case 'w:del':
        break
      default:
        collectDocxLines(child, lines, buffer)
    }
  }
}

async function extractDocxLines(file) {
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const entry = zip.file('word/document.xml')

  if (!entry) throw importError('unreadable')
  if ((entry._data?.uncompressedSize ?? 0) > MAX_DOCX_XML_BYTES) throw importError('unreadable')

  const xml = new DOMParser().parseFromString(await entry.async('string'), 'application/xml')

  if (xml.getElementsByTagName('parsererror').length > 0) throw importError('unreadable')

  const lines = []
  collectDocxLines(xml, lines, null)
  return lines
}

/**
 * Read a PDF or .docx CV into text lines, top to bottom.
 * Throws an Error whose `code` is 'unsupported' (not a PDF or .docx),
 * 'unreadable' (damaged, password-protected, or not what its name says) or
 * 'no-text' (nothing to read: typically a scanned PDF).
 * @param {File} file
 * @returns {Promise<string[]>}
 */
export async function extractCvFileText(file) {
  const kind = getCvFileKind(file)

  if (!kind) throw importError('unsupported')

  let lines

  try {
    lines = kind === 'pdf' ? await extractPdfLines(file) : await extractDocxLines(file)
  } catch (error) {
    if (error?.code) throw error
    throw importError('unreadable', error)
  }

  const text = lines.map((line) => line.trim()).filter(Boolean)

  if (text.length === 0) throw importError('no-text')

  return text
}
