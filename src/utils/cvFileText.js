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

// Sent between the two columns of a two-column PDF. cvTextImport.js reads it
// as "whatever section was open has ended".
export const COLUMN_BREAK = '\f'

const toRuns = (items) =>
  items
    .filter((item) => typeof item.str === 'string' && item.str.trim())
    .map((item) => ({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width,
      height: item.height || Math.abs(item.transform[3]) || 10,
    }))

// A PDF has no lines, only positioned text runs. Runs on (nearly) the same
// baseline become one line. A gap wider than any word space (skill chips, a
// right-aligned date) is kept as two spaces, which the parser reads as a
// separator.
// In font sizes. A word space is about 0.3; the gap between two skill chips
// measured 0.8 in this app's own tightest export.
const WIDE_GAP = 0.7

function runsToLines(runs) {
  const rows = []

  for (const run of [...runs].sort((a, b) => b.y - a.y || a.x - b.x)) {
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
        if (gap > run.height * WIDE_GAP) line += '  '
        else if (gap > run.height * 0.15 && !/\s$/.test(line) && !/^\s/.test(run.text)) line += ' '
      }
      line += run.text
      end = run.x + run.width
    }

    return line
  })
}

// Most designed CVs have a sidebar. Read row by row, its lines interleave
// with the main column's ("Experience  Skills"), so a page is first split
// at its gutter: the vertical line almost no text crosses, with a real
// share of the page's text on each side. That share is what tells a
// sidebar from a column of right-aligned dates, which is a few characters
// per job and stays part of its row.
function findGutter(runs) {
  if (runs.length < 20) return null

  const left = Math.min(...runs.map((run) => run.x))
  const right = Math.max(...runs.map((run) => run.x + run.width))
  const span = right - left
  const totalChars = runs.reduce((sum, run) => sum + run.text.length, 0)
  const maxCrossing = runs.length * 0.06
  let best = null
  let band = null

  const close = () => {
    if (band && (!best || band.crossing < best.crossing || (band.crossing === best.crossing && band.to - band.from > best.to - best.from))) {
      best = band
    }
    band = null
  }

  for (let x = left + span * 0.2; x <= left + span * 0.8; x += 2) {
    let crossing = 0
    let leftChars = 0
    let rightChars = 0

    for (const run of runs) {
      if (run.x + run.width <= x + 1) leftChars += run.text.length
      else if (run.x >= x - 1) rightChars += run.text.length
      else crossing += 1
    }

    const isValid = crossing <= maxCrossing && leftChars >= totalChars * 0.15 && rightChars >= totalChars * 0.15

    if (!isValid) {
      close()
    } else if (band && band.crossing === crossing) {
      band.to = x
    } else {
      close()
      band = { crossing, from: x, to: x }
    }
  }

  close()
  return best ? { x: (best.from + best.to) / 2, leftWidth: (best.from + best.to) / 2 - left, rightWidth: right - (best.from + best.to) / 2 } : null
}

/**
 * Text lines of a PDF from each page's pdf.js text items, in reading order:
 * the column holding the name (the largest text on page one) across all
 * pages, then a COLUMN_BREAK, then the other column across all pages.
 * @param {Array<Array<object>>} pages
 * @returns {string[]}
 */
export function pdfPagesToLines(pages) {
  const first = []
  const second = []
  let firstIsWider = null
  let firstPageGutter

  for (const items of pages) {
    const runs = toRuns(items)
    let gutter = findGutter(runs)

    // Page one decides whether the CV has columns and where. A later page
    // is often short, and a short page of chips or links has accidental
    // gaps that look like a gutter.
    if (firstPageGutter === undefined) firstPageGutter = gutter
    else if (!firstPageGutter || (gutter && Math.abs(gutter.x - firstPageGutter.x) > 40)) gutter = null

    if (!gutter) {
      first.push(...runsToLines(runs))
      continue
    }

    const center = (run) => run.x + run.width / 2
    const leftIsWider = gutter.leftWidth >= gutter.rightWidth

    if (firstIsWider === null) {
      // The name: the largest text in the top third of the page. (Lower
      // down, a sidebar label can be set larger than a modest name.)
      const top = Math.max(...runs.map((run) => run.y))
      const bottom = Math.min(...runs.map((run) => run.y))
      const largest = runs
        .filter((run) => run.y >= top - (top - bottom) / 3)
        .reduce((a, b) => (b.height > a.height ? b : a))
      firstIsWider = (center(largest) < gutter.x) === leftIsWider
    }

    const firstIsLeft = leftIsWider === firstIsWider
    first.push(...runsToLines(runs.filter((run) => (center(run) < gutter.x) === firstIsLeft)))
    second.push(...runsToLines(runs.filter((run) => (center(run) < gutter.x) !== firstIsLeft)))
  }

  return second.length > 0 ? [...first, COLUMN_BREAK, ...second] : first
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
    const pages = []

    for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, MAX_PDF_PAGES); pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      pages.push((await page.getTextContent()).items)
    }

    return pdfPagesToLines(pages)
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

  const text = lines.map((line) => (line === COLUMN_BREAK ? line : line.trim())).filter(Boolean)

  if (!text.some((line) => line !== COLUMN_BREAK)) throw importError('no-text')

  return text
}
