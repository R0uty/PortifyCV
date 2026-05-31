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
const DEBUG_PDF_EXPORT = true

function resolveExportRoot(previewElement) {
  if (!previewElement) {
    return null
  }

  if (previewElement.getAttribute?.('data-export-root') === 'true') {
    return previewElement
  }

  return previewElement.querySelector?.('[data-export-root="true"]') ?? previewElement
}

function getExportVariant(previewElement) {
  if (!previewElement) {
    return ''
  }

  const ownVariant = previewElement.getAttribute?.('data-export-variant')

  if (ownVariant) {
    return ownVariant
  }

  return (
    previewElement.querySelector?.('[data-export-variant]')?.getAttribute('data-export-variant')
    ?? ''
  )
}

function waitForAnimationFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

async function waitForPreviewVariant(previewElement, expectedVariant, maxFrames = 48) {
  if (!expectedVariant) {
    await waitForAnimationFrame()
    await waitForAnimationFrame()
    return true
  }

  const exportRoot = resolveExportRoot(previewElement)

  for (let frame = 0; frame < maxFrames; frame += 1) {
    const activeVariant = getExportVariant(exportRoot)

    if (activeVariant === expectedVariant) {
      // Give layout one extra frame after the variant flips.
      await waitForAnimationFrame()
      return true
    }

    await waitForAnimationFrame()
  }

  return false
}

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

export function exportCvAsHtml(formData, fileName) {
  const snapshot = createCvSnapshot(formData)

  function esc(text) {
    return String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  const experienceItems = snapshot.experience
    .map((item) => {
      const heading = [item.role, item.company].filter(Boolean).join(' at ') || 'Untitled role'
      const dateRange = formatDateRange(item.startDate, item.endDate)

      return `  <div class="xp-item">
    <div class="xp-head"><p class="xp-role">${esc(heading)}</p>${dateRange ? `<p class="xp-date">${esc(dateRange)}</p>` : ''}</div>
    ${item.description ? `<p class="xp-desc">${esc(item.description)}</p>` : ''}
  </div>`
    })
    .join('\n')

  const educationItems = snapshot.education
    .map((item) => {
      const heading =
        [item.degree, item.school].filter(Boolean).join(', ') || 'Education entry'
      const dateRange = formatDateRange(item.startDate, item.endDate)

      return `  <div class="edu-item">
    <p class="edu-degree">${esc(heading)}</p>${dateRange ? `<p class="edu-date">${esc(dateRange)}</p>` : ''}
  </div>`
    })
    .join('\n')

  const skillTags = snapshot.skills
    .map((skill) => `<span class="skill">${esc(skill)}</span>`)
    .join('\n    ')

  const linkItems = Object.entries(snapshot.links)
    .map(
      ([key, value]) =>
        `  <div class="link-item"><p class="link-label">${esc(formatLinkLabel(key))}</p><p class="link-url">${esc(value)}</p></div>`,
    )
    .join('\n')

  const sections = [
    snapshot.about
      ? `<section>\n  <h2 class="section-heading">About</h2>\n  <p class="about-text">${esc(snapshot.about)}</p>\n</section>`
      : '',
    snapshot.experience.length > 0
      ? `<section>\n  <h2 class="section-heading">Experience</h2>\n${experienceItems}\n</section>`
      : '',
    snapshot.education.length > 0
      ? `<section>\n  <h2 class="section-heading">Education</h2>\n${educationItems}\n</section>`
      : '',
    snapshot.skills.length > 0
      ? `<section>\n  <h2 class="section-heading">Skills</h2>\n  <div class="skills">\n    ${skillTags}\n  </div>\n</section>`
      : '',
    Object.keys(snapshot.links).length > 0
      ? `<section>\n  <h2 class="section-heading">Links</h2>\n${linkItems}\n</section>`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(snapshot.fullName || 'CV')}</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0f172a; background: #fff; max-width: 820px; margin: 0 auto; padding: 2.5rem 2rem; line-height: 1.7; }
header { padding-bottom: 1.75rem; margin-bottom: 2.5rem; border-bottom: 2px solid #0f172a; }
.cv-name { font-size: 2.75rem; font-weight: 700; line-height: 1; letter-spacing: -0.04em; }
.cv-job-title { margin-top: 0.625rem; font-size: 1.1rem; color: #475569; }
section { margin-bottom: 2.5rem; }
.section-heading { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.26em; text-transform: uppercase; color: #64748b; padding-bottom: 0.625rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
.about-text { color: #334155; font-size: 0.975rem; line-height: 1.8; }
.xp-item { margin-bottom: 1.75rem; padding-left: 1.125rem; border-left: 2px solid #cbd5e1; }
.xp-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem; align-items: baseline; }
.xp-role { font-weight: 600; font-size: 1.05rem; }
.xp-date { font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; white-space: nowrap; }
.xp-desc { margin-top: 0.625rem; font-size: 0.9rem; color: #334155; line-height: 1.75; }
.edu-item { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem; align-items: baseline; padding: 0.875rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-bottom: 0.75rem; }
.edu-degree { font-weight: 600; font-size: 0.975rem; }
.edu-date { font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; }
.skills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.skill { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 999px; padding: 0.3rem 0.875rem; font-size: 0.78rem; font-weight: 600; color: #334155; }
.link-item { margin-bottom: 0.875rem; }
.link-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #94a3b8; margin-bottom: 0.25rem; }
.link-url { font-size: 0.9rem; color: #0284c7; word-break: break-all; }
@media print { body { padding: 0; max-width: none; } }
</style>
</head>
<body>
<header>
  <p class="cv-name">${esc(snapshot.fullName || 'Your Name')}</p>
  <p class="cv-job-title">${esc(snapshot.title || 'Professional Title')}</p>
</header>

${sections}
</body>
</html>
`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })

  saveAs(blob, `${fileName}.html`)
}

function mmToPx(value) {
  return Math.round((value * PX_PER_INCH) / MM_PER_INCH)
}

function createPdfMode(mode) {
  return PDF_MODES[mode] ?? PDF_MODES.designer
}

function createExportSandbox(previewElement, mode) {
  const pdfMode = createPdfMode(mode)
  const exportRoot = resolveExportRoot(previewElement)

  if (!exportRoot) {
    throw new Error('Unable to resolve active export template root.')
  }

  const clone = exportRoot.cloneNode(true)
  const previewWidthPx = Math.max(1, Math.round(exportRoot.getBoundingClientRect().width))
  const a4ContentWidthPx = mmToPx(
    A4_WIDTH_MM - pdfMode.marginMm.left - pdfMode.marginMm.right,
  )
  const contentWidthPx = mode === 'designer' ? previewWidthPx : a4ContentWidthPx
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

  // Inject resolved accent CSS variables so the PDF reflects the active accent palette
  const rootComputedStyle = getComputedStyle(document.documentElement)
  const accentVars = [
    '--accent-solid',
    '--accent-text',
    '--accent-text-strong',
    '--accent-border',
    '--accent-soft',
    '--accent-soft-strong',
    '--accent-ring',
    '--accent-glow',
  ]
  accentVars.forEach((prop) => {
    const value = rootComputedStyle.getPropertyValue(prop).trim()
    if (value) {
      clone.style.setProperty(prop, value)
    }
  })

  captureRoot.appendChild(clone)
  sandbox.appendChild(captureRoot)
  document.body.appendChild(sandbox)

  if (DEBUG_PDF_EXPORT) {
    console.debug('[PDF DEBUG] createExportSandbox', {
      mode,
      sourceVariant: getExportVariant(exportRoot) || null,
      clonedVariant: getExportVariant(clone) || null,
      contentWidthPx,
    })
  }

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

  const exportRoot = resolveExportRoot(previewElement)

  if (!exportRoot) {
    throw new Error('Active template preview root is unavailable for PDF export.')
  }

  const mode = options.mode === 'ats' ? 'ats' : 'designer'
  const expectedVariant =
    typeof options.variant === 'string'
      ? options.variant
      : typeof options.template === 'string'
        ? options.template
        : ''

  if (DEBUG_PDF_EXPORT) {
    console.debug('[PDF DEBUG] exportCvAsPdf inputs', {
      fileName,
      mode,
      selectedTemplate: options.template,
      optionsTemplate: options.template,
      optionsVariant: options.variant,
      expectedVariant,
      previewDatasetExportVariant: previewElement.dataset.exportVariant || null,
      previewAttrExportVariant: previewElement.getAttribute('data-export-variant') || null,
      rootDatasetExportVariant: exportRoot.dataset.exportVariant || null,
      rootAttrExportVariant: exportRoot.getAttribute('data-export-variant') || null,
      queryVariant:
        previewElement.querySelector?.('[data-export-variant]')?.getAttribute('data-export-variant') || null,
    })
  }

  const didMatchExpectedVariant = await waitForPreviewVariant(exportRoot, expectedVariant)

  if (expectedVariant && !didMatchExpectedVariant) {
    // Do not hard-fail export; proceed with the active preview to avoid blocking users.
    await waitForAnimationFrame()
    await waitForAnimationFrame()
  }

  const { sandbox, captureRoot, pdfMode } = createExportSandbox(exportRoot, mode)

  try {
    if (DEBUG_PDF_EXPORT) {
      console.debug('[PDF DEBUG] before html2canvas', {
        previewVariant: getExportVariant(exportRoot) || null,
        previewInnerHTML: exportRoot.innerHTML,
        previewInnerHTMLLength: exportRoot.innerHTML.length,
      })
    }

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
