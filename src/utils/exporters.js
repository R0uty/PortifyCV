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

export function convertCvToMarkdown(formData) {
  const snapshot = createCvSnapshot(formData)
  const lines = [
    `# ${snapshot.fullName || 'Your Name'}`,
    '',
    snapshot.title || 'Professional Title',
    '',
    '## About',
    '',
    snapshot.about || 'Add a professional summary.',
    '',
    '## Skills',
    '',
  ]

  if (snapshot.skills.length > 0) {
    snapshot.skills.forEach((skill) => {
      lines.push(`- ${skill}`)
    })
  } else {
    lines.push('- Add skills')
  }

  lines.push('', '## Experience', '')

  if (snapshot.experience.length > 0) {
    snapshot.experience.forEach((item) => {
      lines.push(`### ${[item.role, item.company].filter(Boolean).join(' @ ') || 'Untitled role'}`)
      lines.push('')
      lines.push(formatDateRange(item.startDate, item.endDate) || 'Dates pending')
      lines.push('')

      if (item.description) {
        lines.push(item.description)
        lines.push('')
      }
    })
  } else {
    lines.push('No experience added yet.', '')
  }

  lines.push('## Education', '')

  if (snapshot.education.length > 0) {
    snapshot.education.forEach((item) => {
      lines.push(
        `- ${[item.degree, item.school].filter(Boolean).join(', ') || 'Education entry'}${
          formatDateRange(item.startDate, item.endDate)
            ? ` (${formatDateRange(item.startDate, item.endDate)})`
            : ''
        }`,
      )
    })
  } else {
    lines.push('- No education added yet.')
  }

  lines.push('', '## Links', '')

  const links = Object.entries(snapshot.links)

  if (links.length > 0) {
    links.forEach(([key, value]) => {
      lines.push(`- **${formatLinkLabel(key)}:** ${value}`)
    })
  } else {
    lines.push('- No links added yet.')
  }

  lines.push('')

  return lines.join('\n')
}

export function convertCvToPlainText(formData) {
  const snapshot = createCvSnapshot(formData)
  const lines = [
    snapshot.fullName || 'Your Name',
    snapshot.title || 'Professional Title',
    '',
    'ABOUT',
    snapshot.about || 'Add a professional summary.',
    '',
    'SKILLS',
  ]

  if (snapshot.skills.length > 0) {
    snapshot.skills.forEach((skill) => {
      lines.push(`- ${skill}`)
    })
  } else {
    lines.push('- Add skills')
  }

  lines.push('', 'EXPERIENCE')

  if (snapshot.experience.length > 0) {
    snapshot.experience.forEach((item) => {
      lines.push(
        `- ${[item.role, item.company].filter(Boolean).join(' @ ') || 'Untitled role'}`,
      )

      const dateRange = formatDateRange(item.startDate, item.endDate)

      if (dateRange) {
        lines.push(`  ${dateRange}`)
      }

      if (item.description) {
        lines.push(`  ${item.description}`)
      }
    })
  } else {
    lines.push('- No experience added yet.')
  }

  lines.push('', 'EDUCATION')

  if (snapshot.education.length > 0) {
    snapshot.education.forEach((item) => {
      lines.push(
        `- ${[item.degree, item.school].filter(Boolean).join(', ') || 'Education entry'}`,
      )

      const dateRange = formatDateRange(item.startDate, item.endDate)

      if (dateRange) {
        lines.push(`  ${dateRange}`)
      }
    })
  } else {
    lines.push('- No education added yet.')
  }

  lines.push('', 'LINKS')

  const links = Object.entries(snapshot.links)

  if (links.length > 0) {
    links.forEach(([key, value]) => {
      lines.push(`- ${formatLinkLabel(key)}: ${value}`)
    })
  } else {
    lines.push('- No links added yet.')
  }

  lines.push('')

  return lines.join('\n')
}

export function exportCvAsJson(formData, fileName) {
  const blob = new Blob([`${JSON.stringify(formData, null, 2)}\n`], {
    type: 'application/json;charset=utf-8',
  })

  saveAs(blob, `${fileName}.json`)
}

export function exportCvAsMarkdown(formData, fileName) {
  const blob = new Blob([convertCvToMarkdown(formData)], {
    type: 'text/markdown;charset=utf-8',
  })

  saveAs(blob, `${fileName}.md`)
}

export function exportCvAsText(formData, fileName) {
  const blob = new Blob([convertCvToPlainText(formData)], {
    type: 'text/plain;charset=utf-8',
  })

  saveAs(blob, `${fileName}.txt`)
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

export async function exportCvAsPdf(previewElement, fileName, options = {}) {
  if (!previewElement) {
    throw new Error('Preview element is unavailable for PDF export.')
  }

  const mode = options.mode === 'ats' ? 'ats' : 'designer'
  const { sandbox, captureRoot, pdfMode } = createExportSandbox(previewElement, mode)

  try {
    const canvas = await html2canvas(captureRoot, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: captureRoot.scrollWidth,
      height: captureRoot.scrollHeight,
      windowWidth: captureRoot.scrollWidth,
      windowHeight: captureRoot.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: false,
      imageTimeout: 0,
      ignoreElements: (element) => element.dataset.exportIgnore === 'true',
    })

    const imageData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })
    const renderedWidth = A4_WIDTH_MM - pdfMode.marginMm.left - pdfMode.marginMm.right
    const renderedHeight = (canvas.height * renderedWidth) / canvas.width
    const printableHeight = A4_HEIGHT_MM - pdfMode.marginMm.top - pdfMode.marginMm.bottom

    let remainingHeight = renderedHeight
    let position = pdfMode.marginMm.top

    pdf.addImage(
      imageData,
      'PNG',
      pdfMode.marginMm.left,
      position,
      renderedWidth,
      renderedHeight,
    )
    remainingHeight -= printableHeight

    while (remainingHeight > 0) {
      position -= printableHeight
      pdf.addPage()
      pdf.addImage(
        imageData,
        'PNG',
        pdfMode.marginMm.left,
        position,
        renderedWidth,
        renderedHeight,
      )
      remainingHeight -= printableHeight
    }

    const blob = pdf.output('blob')
    const exportName =
      mode === 'designer' ? fileName : `${fileName}-${createPdfMode(mode).fileSuffix}`
    saveAs(blob, `${exportName}.pdf`)
  } finally {
    removeExportSandbox(sandbox)
  }
}
