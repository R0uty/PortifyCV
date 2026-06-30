import { jsPDF } from 'jspdf'

self.onmessage = (event) => {
  const payload = event.data ?? {}

  if (payload.type !== 'export-pdf') {
    return
  }

  const {
    pages = [],
    pdfMode,
    renderedWidth,
  } = payload

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    pages.forEach((page, index) => {
      if (index > 0) {
        pdf.addPage()
      }

      pdf.addImage(
        page.imageDataUrl,
        'PNG',
        pdfMode.marginMm.left,
        pdfMode.marginMm.top,
        renderedWidth,
        page.sliceHeightMm,
      )

      if (page.separatorLineSegments?.length > 0) {
        pdf.setDrawColor(203, 213, 225)
        pdf.setLineWidth(0.3)

        page.separatorLineSegments.forEach((segment) => {
          pdf.line(segment.start, segment.y, segment.end, segment.y)
        })
      }
    })

    const blob = pdf.output('blob')
    self.postMessage({ type: 'success', blob })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Worker PDF export failed.'
    self.postMessage({ type: 'error', message })
  }
}
