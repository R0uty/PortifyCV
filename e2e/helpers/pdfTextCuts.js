// Finds text a PDF export cuts in half at a page break (1.6.59).
//
// The PDF is image-based: html2canvas paints the export sandbox
// (`.pdf-export-page`) onto one tall canvas, and exporters.js copies a slice
// of it onto each page. `installPdfProbe` records, in the page, every text
// line's box in that sandbox (measured the moment it is attached) and the
// slice each page copies (the canvas → page `drawImage`). `findCutLines`
// then lists the lines a page boundary runs through.
export async function installPdfProbe(page) {
  await page.addInitScript(() => {
    window.__pdfProbe = { capture: null, slices: [] }

    const measure = (captureRoot) => {
      const base = captureRoot.getBoundingClientRect()
      const lines = []
      const walker = document.createTreeWalker(captureRoot, NodeFilter.SHOW_TEXT)
      const range = document.createRange()
      let node = walker.nextNode()

      while (node) {
        const element = node.parentElement
        const ignored = element.closest('[data-export-ignore="true"], [data-export-summary-chip="true"]')

        if (node.textContent.trim() && !ignored) {
          range.selectNodeContents(node)
          for (const rect of range.getClientRects()) {
            if (rect.width >= 1 && rect.height >= 1) {
              lines.push({
                top: rect.top - base.top,
                bottom: rect.bottom - base.top,
                text: node.textContent.trim().slice(0, 60),
              })
            }
          }
        }

        node = walker.nextNode()
      }

      window.__pdfProbe.capture = {
        height: Math.max(captureRoot.scrollHeight, captureRoot.offsetHeight),
        lines,
      }
    }

    new MutationObserver((records) => {
      for (const record of records) {
        for (const added of record.addedNodes) {
          const captureRoot = added.querySelector?.('.pdf-export-page')
          if (captureRoot) measure(captureRoot)
        }
      }
    }).observe(document, { childList: true, subtree: true })

    const drawImage = CanvasRenderingContext2D.prototype.drawImage
    CanvasRenderingContext2D.prototype.drawImage = function (...args) {
      const [source, sx, sy, sw, sh, dx, dy] = args
      if (args.length === 9 && source instanceof HTMLCanvasElement && sx === 0 && dx === 0 && dy === 0 && sw === source.width) {
        window.__pdfProbe.slices.push({ top: sy, height: sh, canvasHeight: source.height })
      }
      return drawImage.apply(this, args)
    }
  })
}

// A line counts as cut when a page boundary runs through its body: at least
// a fifth of its box on each side. A tight heading's text box can reach a
// few px above its section's top, where breaks snap, with no ink there.
export async function findCutLines(page) {
  const probe = await page.evaluate(() => window.__pdfProbe)

  if (!probe?.capture || probe.slices.length === 0) {
    throw new Error('The PDF probe recorded no capture or no page slices.')
  }

  const scale = probe.slices[0].canvasHeight / probe.capture.height
  const boundaries = probe.slices.slice(1).map((slice) => slice.top)
  const cut = []

  for (const line of probe.capture.lines) {
    const top = line.top * scale
    const bottom = line.bottom * scale

    for (const y of boundaries) {
      if (Math.min(y - top, bottom - y) > 0.2 * (bottom - top)) {
        cut.push(`page ${boundaries.indexOf(y) + 2}: "${line.text}"`)
      }
    }
  }

  return { pages: probe.slices.length, cut }
}

// Every page of a jsPDF document is A4: its MediaBox is 595.28 × 841.89 pt.
export function pdfPageSizes(bytes) {
  return [...bytes.toString('latin1').matchAll(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/g)]
    .map((match) => [Number(match[1]), Number(match[2])])
}
