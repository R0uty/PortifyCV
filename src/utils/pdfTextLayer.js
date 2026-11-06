// Real text and links for the image-based PDF export (1.6.71). Each page is
// a picture of the CV, which nothing can read: no selecting or searching,
// and an ATS gets an empty document. So every line of the export sandbox is
// also written on its page as invisible text, right over its picture, and
// every URL and email becomes a clickable link.
//
// Measured in canvas px from the sandbox's DOM, placed in mm per page slice.
// html2canvas paints text a few px off the DOM's position, too little to
// matter for selecting a line.

const IGNORED_SELECTOR = '[data-export-ignore="true"], [data-export-summary-chip="true"], [data-decorative]'
const SAFE_LINK_PROTOCOL = /^(https?:|mailto:)/i
const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi
// A URL with a scheme, or a lowercase bare domain with a path or a common
// ending. Anything looser turns "Node.js" or "ASP.NET" into a link.
const URL_PATTERN = /\bhttps?:\/\/[^\s]+|\bwww\.[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|org|net|io|dev|app|fi|se|no|dk|ee|de|uk|eu|co|me|ai)(?:\/[^\s]*)?(?![a-z0-9-])/g
const TRAILING_PUNCTUATION = /[.,;:!?)\]'"]+$/
const MIN_FONT_SCALE = 0.5
const MAX_FONT_SCALE = 1.6
// Baseline of a line, up from the bottom of its box.
const BASELINE_FROM_BOTTOM = 0.22
const PT_PER_MM = 72 / 25.4

function findTextLinks(text) {
  const found = []
  const addMatches = (pattern, toHref) => {
    for (const match of text.matchAll(pattern)) {
      const value = match[0].replace(TRAILING_PUNCTUATION, '')
      const overlaps = found.some((link) => match.index < link.end && link.start < match.index + value.length)

      if (value && !overlaps) {
        found.push({ start: match.index, end: match.index + value.length, url: toHref(value) })
      }
    }
  }

  addMatches(EMAIL_PATTERN, (value) => `mailto:${value}`)
  addMatches(URL_PATTERN, (value) => (/^https?:/i.test(value) ? value : `https://${value}`))
  return found
}

// Lines and links in a sandbox, in canvas px and in DOM order, which is the
// order the text is written and so the order a parser reads it.
export function collectPdfTextLayer(captureRoot, canvas) {
  const sourceWidth = Math.max(captureRoot.scrollWidth, captureRoot.offsetWidth, 1)
  const sourceHeight = Math.max(captureRoot.scrollHeight, captureRoot.offsetHeight, 1)
  const sourceRect = captureRoot.getBoundingClientRect()
  const scaleX = canvas.width / sourceWidth
  const scaleY = canvas.height / sourceHeight
  const toBox = (rect) => ({
    left: (rect.left - sourceRect.left) * scaleX,
    right: (rect.right - sourceRect.left) * scaleX,
    top: (rect.top - sourceRect.top) * scaleY,
    bottom: (rect.bottom - sourceRect.top) * scaleY,
  })
  const lines = []
  const links = []
  const range = document.createRange()
  const addLink = (url, rects) => {
    Array.from(rects).forEach((rect) => {
      if (rect.width >= 1 && rect.height >= 1) {
        links.push({ ...toBox(rect), url })
      }
    })
  }

  const walker = document.createTreeWalker(captureRoot, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()

  while (node) {
    const element = node.parentElement
    const text = node.textContent

    if (text.trim() && !element.closest(IGNORED_SELECTOR) && getComputedStyle(element).visibility !== 'hidden') {
      let line = null

      for (const word of text.matchAll(/\S+/g)) {
        range.setStart(node, word.index)
        range.setEnd(node, word.index + word[0].length)
        const rects = range.getClientRects()
        const first = rects[0]

        if (!first || first.width < 1 || first.height < 1) {
          continue
        }

        const start = toBox(first)
        const { right } = toBox(rects[rects.length - 1])

        if (line && Math.abs(start.top - line.top) < (line.bottom - line.top) / 2) {
          line.text += ` ${word[0]}`
          line.right = right
        } else {
          line = { text: word[0], ...start, right }
          lines.push(line)
        }
      }

      if (!element.closest('a[href]')) {
        findTextLinks(text).forEach(({ start, end, url }) => {
          range.setStart(node, start)
          range.setEnd(node, end)
          addLink(url, range.getClientRects())
        })
      }
    }

    node = walker.nextNode()
  }

  captureRoot.querySelectorAll('a[href]').forEach((anchor) => {
    const url = anchor.getAttribute('href').trim()

    if (SAFE_LINK_PROTOCOL.test(url) && !anchor.closest(IGNORED_SELECTOR)) {
      addLink(url, anchor.getClientRects())
    }
  })

  return { lines, links }
}

// What of the layer falls on one page slice, in mm on that page. A line
// goes on the page holding its middle, so a line is never written twice.
export function placePdfTextLayer(layer, slice, marginMm, mmPerCanvasPx) {
  const toPage = (box) => ({
    x: marginMm.left + box.left * mmPerCanvasPx,
    width: (box.right - box.left) * mmPerCanvasPx,
    y: marginMm.top + (box.top - slice.top) * mmPerCanvasPx,
    height: (box.bottom - box.top) * mmPerCanvasPx,
  })
  const isOnSlice = (box) => {
    const middle = (box.top + box.bottom) / 2
    return middle >= slice.top && middle < slice.bottom
  }

  return {
    lines: layer.lines.filter(isOnSlice).map((line) => ({ text: line.text, ...toPage(line) })),
    links: layer.links.filter(isOnSlice).map((link) => ({ url: link.url, ...toPage(link) })),
  }
}

// jsPDF's built-in font only has Windows-1252 (all of Finnish and western
// Europe), and writes anything else as garbage. Other Latin letters lose
// their accent so "Čapek" can still be found as "Capek"; other scripts are
// left out, since nothing beats garbage for a parser. They still show on the
// page, in its picture.
const WIN_1252_EXTRAS = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'
const LATIN_WITHOUT_ACCENT_FORM = { Ł: 'L', ł: 'l', Đ: 'D', đ: 'd', ı: 'i', Ħ: 'H', ħ: 'h' }
const isWin1252 = (char) => {
  const code = char.codePointAt(0)
  return (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_1252_EXTRAS.includes(char)
}

export function toPdfText(text) {
  return Array.from(text.replace(/\u00a0/g, ' '), (char) => {
    if (isWin1252(char)) {
      return char
    }

    const plain = LATIN_WITHOUT_ACCENT_FORM[char] ?? char.normalize('NFD').replace(/\p{M}/gu, '')
    return Array.from(plain).every(isWin1252) ? plain : ''
  }).join('').replace(/\s+/g, ' ').trim()
}

// Writes one page's lines and links on the jsPDF document's current page.
// Each line's font size is fitted to its width, instead of spacing letters
// out, which would read back as "E X P E R I E N C E". The text is invisible,
// so the size only sets how far a selection reaches.
export function drawPdfTextLayer(pdf, { lines = [], links = [] } = {}) {
  pdf.setFont('helvetica', 'normal')

  lines.forEach(({ text: rawText, x, y, width, height }) => {
    const text = toPdfText(rawText)

    if (!text) {
      return
    }

    const baseSize = height * PT_PER_MM
    const unitWidthMm = (pdf.getStringUnitWidth(text) * baseSize) / PT_PER_MM
    const fit = unitWidthMm > 0 ? width / unitWidthMm : 1
    const scale = Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, fit))

    pdf.setFontSize(baseSize * scale)
    pdf.text(text, x, y + height * (1 - BASELINE_FROM_BOTTOM), { renderingMode: 'invisible' })
  })

  links.forEach(({ url, x, y, width, height }) => {
    pdf.link(x, y, width, height, { url })
  })
}
