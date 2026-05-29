import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { saveAs } from 'file-saver'

const PDF_MODES = {
  designer: {
    fileSuffix: 'designer',
    marginMm: { top: 12, right: 12, bottom: 14, left: 12 },
  },
  ats: {
    fileSuffix: 'ats',
    marginMm: { top: 16, right: 16, bottom: 18, left: 16 },
  },
}
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const PX_PER_INCH = 96
const MM_PER_INCH = 25.4
const MAX_CAPTURE_PIXEL_AREA = 12_000_000

function trimValue(value) {
  return value.trim()
}

function normalizeArray(values) {
  return values.map(trimValue).filter(Boolean)
}

function formatDateRange(startDate, endDate) {
  return [startDate, endDate].map(trimValue).filter(Boolean).join(' - ')
}

function formatLinkLabel(key) {
  if (key === 'github') {
    return 'GitHub'
  }

  if (key === 'linkedin') {
    return 'LinkedIn'
  }

  return key.charAt(0).toUpperCase() + key.slice(1)
}

export function createCvSnapshot(formData) {
  return {
    fullName: trimValue(formData.fullName),
    title: trimValue(formData.title),
    about: trimValue(formData.about),
    skills: normalizeArray(formData.skills),
    experience: formData.experience
      .map((item) => ({
        role: trimValue(item.role),
        company: trimValue(item.company),
        startDate: trimValue(item.startDate),
        endDate: trimValue(item.endDate),
        description: trimValue(item.description),
      }))
      .filter(
        (item) =>
          item.role ||
          item.company ||
          item.startDate ||
          item.endDate ||
          item.description,
      ),
    education: formData.education
      .map((item) => ({
        school: trimValue(item.school),
        degree: trimValue(item.degree),
        startDate: trimValue(item.startDate),
        endDate: trimValue(item.endDate),
      }))
      .filter((item) => item.school || item.degree || item.startDate || item.endDate),
    links: Object.fromEntries(
      Object.entries(formData.links).filter(([, value]) => trimValue(value)),
    ),
  }
}

export function createExportFileName(formData) {
  const baseName = trimValue(formData.fullName) || 'cv'

  return baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function exportCvAsJson(formData, fileName) {
  const blob = new Blob([`${JSON.stringify(formData, null, 2)}\n`], {
    type: 'application/json;charset=utf-8',
  })

  saveAs(blob, `${fileName}.json`)
}

function mmToPx(value) {
  return Math.round((value * PX_PER_INCH) / MM_PER_INCH)
}

function createPdfMode(mode) {
  return PDF_MODES[mode] ?? PDF_MODES.designer
}

function createExportSandbox(previewElement, mode) {
  const pdfMode = createPdfMode(mode)
  const clone = previewElement.cloneNode(true)
  const contentWidthPx = mmToPx(
    A4_WIDTH_MM - pdfMode.marginMm.left - pdfMode.marginMm.right,
  )
  const sandbox = document.createElement('div')
  const captureRoot = document.createElement('div')

  sandbox.style.position = 'fixed'
  sandbox.style.left = '-10000px'
  sandbox.style.top = '0'
  sandbox.style.width = `${contentWidthPx}px`
  sandbox.style.pointerEvents = 'none'
  sandbox.style.opacity = '0'
  sandbox.style.zIndex = '-1'
  sandbox.setAttribute('aria-hidden', 'true')

  captureRoot.className = `pdf-export-page pdf-mode-${mode}`
  captureRoot.style.width = `${contentWidthPx}px`
  captureRoot.style.background = '#ffffff'

  clone.classList.add('pdf-export-root')
  clone.classList.add(`pdf-mode-${mode}`)
  clone.style.width = `${contentWidthPx}px`
  clone.style.maxWidth = 'none'
  clone.style.margin = '0'
  clone.style.background = '#ffffff'
  clone.style.color = '#0f172a'

  captureRoot.appendChild(clone)
  sandbox.appendChild(captureRoot)
  document.body.appendChild(sandbox)

  return { sandbox, captureRoot, pdfMode }
}

function removeExportSandbox(sandbox) {
  if (sandbox.parentNode) {
    sandbox.parentNode.removeChild(sandbox)
  }
}

function createSafeCaptureScale(width, height) {
  const pixelArea = width * height

  if (pixelArea <= 0) {
    return 1
  }

  if (pixelArea <= MAX_CAPTURE_PIXEL_AREA) {
    return 2
  }

  const reducedScale = Math.sqrt(MAX_CAPTURE_PIXEL_AREA / pixelArea)

  return Math.max(1, Math.min(2, reducedScale * 2))
}

function addCanvasPagesToPdf(pdf, canvas, pdfMode) {
  const renderedWidth = A4_WIDTH_MM - pdfMode.marginMm.left - pdfMode.marginMm.right
  const printableHeight = A4_HEIGHT_MM - pdfMode.marginMm.top - pdfMode.marginMm.bottom
  const pageHeightPx = Math.max(1, Math.floor((printableHeight * canvas.width) / renderedWidth))
  const pageCanvas = document.createElement('canvas')
  const pageContext = pageCanvas.getContext('2d')

  if (!pageContext) {
    throw new Error('Unable to prepare page canvas for PDF export.')
  }

  let pageIndex = 0

  for (let offsetY = 0; offsetY < canvas.height; offsetY += pageHeightPx) {
    const sliceHeight = Math.min(pageHeightPx, canvas.height - offsetY)

    pageCanvas.width = canvas.width
    pageCanvas.height = sliceHeight
    pageContext.clearRect(0, 0, pageCanvas.width, pageCanvas.height)
    pageContext.drawImage(
      canvas,
      0,
      offsetY,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    )

    if (pageIndex > 0) {
      pdf.addPage()
    }

    const sliceHeightMm = (sliceHeight * renderedWidth) / canvas.width

    pdf.addImage(
      pageCanvas,
      'PNG',
      pdfMode.marginMm.left,
      pdfMode.marginMm.top,
      renderedWidth,
      sliceHeightMm,
    )

    pageIndex += 1
  }
}

function createFallbackPalette() {
  return {
    headerText: [15, 23, 42],
    headingText: [30, 41, 59],
    bodyText: [51, 65, 85],
    subtleText: [100, 116, 139],
    divider: [203, 213, 225],
  }
}

function ensurePdfCursorSpace(pdf, cursor, heightNeeded, marginMm) {
  const pageBottom = A4_HEIGHT_MM - marginMm.bottom

  if (cursor.y + heightNeeded <= pageBottom) {
    return
  }

  pdf.addPage()
  cursor.y = marginMm.top
}

function drawFallbackHeader(pdf, snapshot, marginMm, palette) {
  const fullWidth = A4_WIDTH_MM - marginMm.left - marginMm.right
  const headerX = marginMm.left
  const headerY = marginMm.top
  const title = snapshot.fullName || 'Your Name'
  const subtitle = snapshot.title || 'Professional Title'

  pdf.setTextColor(...palette.headerText)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.text(title, headerX, headerY + 4.2)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10.5)
  pdf.text(subtitle, headerX, headerY + 9.8)

  pdf.setDrawColor(...palette.divider)
  pdf.setLineWidth(0.35)
  pdf.line(headerX, headerY + 14.3, headerX + fullWidth, headerY + 14.3)

  return headerY + 18.5
}

function drawFallbackSectionHeading(pdf, heading, cursor, marginMm, palette) {
  ensurePdfCursorSpace(pdf, cursor, 12, marginMm)
  pdf.setTextColor(...palette.headingText)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text(heading.toUpperCase(), marginMm.left, cursor.y)
  cursor.y += 2.2

  pdf.setDrawColor(...palette.divider)
  pdf.setLineWidth(0.35)
  pdf.line(marginMm.left, cursor.y, A4_WIDTH_MM - marginMm.right, cursor.y)
  cursor.y += 5.2
}

function drawFallbackParagraph(pdf, text, cursor, marginMm, palette, options = {}) {
  if (!text) {
    return
  }

  const size = options.size ?? 10.5
  const color = options.subtle ? palette.subtleText : palette.bodyText
  const leftInset = options.leftInset ?? 0
  const maxWidth = A4_WIDTH_MM - marginMm.left - marginMm.right - leftInset
  const lines = pdf.splitTextToSize(text, maxWidth)
  const lineHeight = options.lineHeight ?? 4.9

  lines.forEach((line) => {
    ensurePdfCursorSpace(pdf, cursor, lineHeight + 1, marginMm)
    pdf.setTextColor(...color)
    pdf.setFont('helvetica', options.bold ? 'bold' : 'normal')
    pdf.setFontSize(size)
    pdf.text(line, marginMm.left + leftInset, cursor.y)
    cursor.y += lineHeight
  })

  cursor.y += options.after ?? 1.8
}

function drawFallbackBullets(pdf, values, cursor, marginMm, palette) {
  values.forEach((item) => {
    if (!item) {
      return
    }

    ensurePdfCursorSpace(pdf, cursor, 7, marginMm)
    pdf.setFillColor(...palette.headingText)
    pdf.circle(marginMm.left + 1, cursor.y - 1.2, 0.65, 'F')
    drawFallbackParagraph(pdf, item, cursor, marginMm, palette, { leftInset: 4, after: 0.6 })
  })

  cursor.y += 1.2
}

function exportCvAsPdfTextFallback(formData, fileName, mode) {
  const pdfMode = createPdfMode(mode)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })
  const snapshot = createCvSnapshot(formData)
  const palette = createFallbackPalette()
  const cursor = { y: drawFallbackHeader(pdf, snapshot, pdfMode.marginMm, palette) }

  drawFallbackSectionHeading(pdf, 'About', cursor, pdfMode.marginMm, palette)
  drawFallbackParagraph(
    pdf,
    snapshot.about || 'Add a professional summary.',
    cursor,
    pdfMode.marginMm,
    palette,
    { size: 10.6, lineHeight: 5.1 },
  )

  drawFallbackSectionHeading(pdf, 'Skills', cursor, pdfMode.marginMm, palette)
  if (snapshot.skills.length > 0) {
    drawFallbackBullets(pdf, snapshot.skills, cursor, pdfMode.marginMm, palette)
  } else {
    drawFallbackParagraph(pdf, 'Add skills', cursor, pdfMode.marginMm, palette, { subtle: true })
  }

  drawFallbackSectionHeading(pdf, 'Experience', cursor, pdfMode.marginMm, palette)
  if (snapshot.experience.length > 0) {
    snapshot.experience.forEach((item) => {
      const heading = [item.role, item.company].filter(Boolean).join(' @ ') || 'Untitled role'
      drawFallbackParagraph(pdf, heading, cursor, pdfMode.marginMm, palette, {
        bold: true,
        size: 10.7,
        after: 0.6,
      })

      const dateRange = formatDateRange(item.startDate, item.endDate)
      if (dateRange) {
        drawFallbackParagraph(pdf, dateRange, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.8,
          after: 0.8,
        })
      }

      if (item.description) {
        drawFallbackParagraph(pdf, item.description, cursor, pdfMode.marginMm, palette, {
          size: 10.3,
          lineHeight: 4.85,
          after: 1.5,
        })
      } else {
        cursor.y += 1.2
      }
    })
  } else {
    drawFallbackParagraph(pdf, 'No experience added yet.', cursor, pdfMode.marginMm, palette, { subtle: true })
  }

  drawFallbackSectionHeading(pdf, 'Education', cursor, pdfMode.marginMm, palette)
  if (snapshot.education.length > 0) {
    snapshot.education.forEach((item) => {
      const heading = [item.degree, item.school].filter(Boolean).join(', ') || 'Education entry'
      const dateRange = formatDateRange(item.startDate, item.endDate)

      drawFallbackParagraph(pdf, heading, cursor, pdfMode.marginMm, palette, {
        bold: true,
        size: 10.5,
        after: dateRange ? 0.5 : 1.3,
      })

      if (dateRange) {
        drawFallbackParagraph(pdf, dateRange, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.8,
          after: 1.3,
        })
      }
    })
  } else {
    drawFallbackParagraph(pdf, 'No education added yet.', cursor, pdfMode.marginMm, palette, { subtle: true })
  }

  drawFallbackSectionHeading(pdf, 'Links', cursor, pdfMode.marginMm, palette)
  const links = Object.entries(snapshot.links)
  if (links.length > 0) {
    links.forEach(([key, value]) => {
      drawFallbackParagraph(
        pdf,
        `${formatLinkLabel(key)}: ${value}`,
        cursor,
        pdfMode.marginMm,
        palette,
        { size: 10.2, after: 1.1 },
      )
    })
  } else {
    drawFallbackParagraph(pdf, 'No links added yet.', cursor, pdfMode.marginMm, palette, { subtle: true })
  }

  const blob = pdf.output('blob')
  const exportName = mode === 'designer'
    ? `${fileName}-styled-fallback`
    : `${fileName}-${createPdfMode(mode).fileSuffix}-styled`

  saveAs(blob, `${exportName}.pdf`)
}

export async function exportCvAsPdf(previewElement, fileName, options = {}) {
  if (!previewElement) {
    throw new Error('Preview element is unavailable for PDF export.')
  }

  const mode = options.mode === 'ats' ? 'ats' : 'designer'
  const { sandbox, captureRoot, pdfMode } = createExportSandbox(previewElement, mode)

  try {
    const captureWidth = Math.max(captureRoot.scrollWidth, captureRoot.offsetWidth, 1)
    const captureHeight = Math.max(captureRoot.scrollHeight, captureRoot.offsetHeight, 1)
    const captureScale = createSafeCaptureScale(captureWidth, captureHeight)

    if (document.fonts?.ready) {
      await document.fonts.ready
    }

    const canvas = await html2canvas(captureRoot, {
      scale: captureScale,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: captureWidth,
      height: captureHeight,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: false,
      imageTimeout: 0,
      ignoreElements: (element) => element?.getAttribute?.('data-export-ignore') === 'true',
    })

    if (canvas.width <= 0 || canvas.height <= 0) {
      throw new Error('Captured preview is empty. Open preview and try exporting again.')
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    addCanvasPagesToPdf(pdf, canvas, pdfMode)

    const blob = pdf.output('blob')
    const exportName =
      mode === 'designer' ? fileName : `${fileName}-${createPdfMode(mode).fileSuffix}`
    saveAs(blob, `${exportName}.pdf`)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    const isUnsupportedColorError = /unsupported color|oklch/i.test(message)

    if (isUnsupportedColorError && options.formData) {
      exportCvAsPdfTextFallback(options.formData, fileName, mode)
      return
    }

    throw error
  } finally {
    removeExportSandbox(sandbox)
  }
}
