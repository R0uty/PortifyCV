import { saveAs } from 'file-saver'
import { defaultTemplateId, getCvTemplate } from './cvTemplates'
import { isPhotoVisibleForTemplate } from './cvForm'
import { createCvSnapshot } from './cvSnapshot'

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
const PAGE_BREAK_SELECTOR = '[data-export-header], [data-export-section], [data-export-card], [data-export-skill="true"]'
const COLOR_STYLE_PROPS = [
  'color',
  'background-color',
  'background-image',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'box-shadow',
]
let html2canvasLoader = null
let jsPdfLoader = null

function loadHtml2Canvas() {
  if (!html2canvasLoader) {
    html2canvasLoader = import('html2canvas').then((module) => module.default)
  }

  return html2canvasLoader
}

function loadJsPdf() {
  if (!jsPdfLoader) {
    jsPdfLoader = import('jspdf').then((module) => module.jsPDF)
  }

  return jsPdfLoader
}

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

async function waitForPreviewVariant(previewElement, expectedVariant, maxWaitMs = 3000) {
  if (!expectedVariant) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return true
  }

  const start = Date.now()
  const exportRoot = resolveExportRoot(previewElement)

  while (Date.now() - start < maxWaitMs) {
    const activeVariant = getExportVariant(exportRoot)

    if (activeVariant === expectedVariant) {
      await new Promise((resolve) => setTimeout(resolve, 150))
      return true
    }

    await new Promise((resolve) => setTimeout(resolve, 60))
  }

  console.warn(
    `PDF Export: Variant mismatch. Expected "${expectedVariant}", got "${getExportVariant(exportRoot)}"`,
  )

  return false
}

function trimValue(value) {
  return value.trim()
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

function createExportCopy(locale = 'en') {
  const isFinnish = locale === 'fi'

  return {
    lang: isFinnish ? 'fi' : 'en',
    yourName: isFinnish ? 'Nimesi' : 'Your Name',
    professionalTitle: isFinnish ? 'Ammattinimike' : 'Professional Title',
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    educationEntry: isFinnish ? 'Koulutusmerkintä' : 'Education entry',
    about: isFinnish ? 'Esittely' : 'About',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    education: isFinnish ? 'Koulutus' : 'Education',
    skills: isFinnish ? 'Taidot' : 'Skills',
    links: isFinnish ? 'Linkit' : 'Links',
    addSummary: isFinnish ? 'Lisää ammatillinen yhteenveto.' : 'Add a professional summary.',
    addSkills: isFinnish ? 'Lisää taitoja' : 'Add skills',
    noExperience: isFinnish ? 'Työkokemusta ei ole vielä lisätty.' : 'No experience added yet.',
    noEducation: isFinnish ? 'Koulutusta ei ole vielä lisätty.' : 'No education added yet.',
    noLinks: isFinnish ? 'Linkkejä ei ole vielä lisätty.' : 'No links added yet.',
    cv: isFinnish ? 'CV' : 'CV',
  }
}

function getPhotoDataUrl(value) {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmedValue = value.trim()

  if (!/^data:image\/(png|jpe?g);base64,/i.test(trimmedValue)) {
    return ''
  }

  return trimmedValue
}

function getImageFormatFromDataUrl(dataUrl) {
  if (/^data:image\/png;base64,/i.test(dataUrl)) {
    return 'PNG'
  }

  return 'JPEG'
}

export function exportCvAsJson(formData, fileName) {
  const blob = new Blob([`${JSON.stringify(formData, null, 2)}\n`], {
    type: 'application/json;charset=utf-8',
  })

  saveAs(blob, `${fileName}.json`)
}

export function exportCvAsHtml(formData, fileName, options = {}) {
  const locale = options.locale === 'fi' ? 'fi' : 'en'
  const copy = createExportCopy(locale)
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
      const heading = [item.role, item.company].filter(Boolean).join(' at ') || copy.untitledRole
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
        [item.degree, item.school].filter(Boolean).join(', ') || copy.educationEntry
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
      ? `<section>\n  <h2 class="section-heading">${copy.about}</h2>\n  <p class="about-text">${esc(snapshot.about)}</p>\n</section>`
      : '',
    snapshot.experience.length > 0
      ? `<section>\n  <h2 class="section-heading">${copy.experience}</h2>\n${experienceItems}\n</section>`
      : '',
    snapshot.education.length > 0
      ? `<section>\n  <h2 class="section-heading">${copy.education}</h2>\n${educationItems}\n</section>`
      : '',
    snapshot.skills.length > 0
      ? `<section>\n  <h2 class="section-heading">${copy.skills}</h2>\n  <div class="skills">\n    ${skillTags}\n  </div>\n</section>`
      : '',
    Object.keys(snapshot.links).length > 0
      ? `<section>\n  <h2 class="section-heading">${copy.links}</h2>\n${linkItems}\n</section>`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const html = `<!doctype html>
<html lang="${copy.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(snapshot.fullName || copy.cv)}</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0f172a; background: #fff; max-width: 820px; margin: 0 auto; padding: 2.5rem 2rem; line-height: 1.7; }
header { padding-bottom: 1.75rem; margin-bottom: 2.5rem; border-bottom: 2px solid #0f172a; }
.cv-name { font-size: 2.75rem; font-weight: 700; line-height: 1; letter-spacing: -0.04em; }
.cv-job-title { margin-top: 0.625rem; font-size: 1.1rem; color: #475569; }
section { margin-bottom: 2.5rem; }
.section-heading { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.26em; text-transform: uppercase; color: #64748b; padding-bottom: 0.625rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
.about-text { color: #334155; font-size: 0.975rem; line-height: 1.8; }
.xp-item { margin-bottom: 1.75rem; padding-left: 1.375rem; border-left: 2px solid #cbd5e1; }
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
  <p class="cv-name">${esc(snapshot.fullName || copy.yourName)}</p>
  <p class="cv-job-title">${esc(snapshot.title || copy.professionalTitle)}</p>
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

function createExportSandbox(previewElement, mode, expectedVariant = '') {
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
  clone.setAttribute('data-export-variant', mode === 'ats' ? 'ats' : expectedVariant || '')
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

  return { sandbox, captureRoot, clone, pdfMode }
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

async function renderCaptureCanvas(captureRoot, captureOptions = {}) {
  const html2canvas = await loadHtml2Canvas()
  const captureWidth = Math.max(captureRoot.scrollWidth, captureRoot.offsetWidth, 1)
  const captureHeight = Math.max(captureRoot.scrollHeight, captureRoot.offsetHeight, 1)
  const captureScale = createSafeCaptureScale(captureWidth, captureHeight)

  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  return html2canvas(captureRoot, {
    scale: captureScale,
    useCORS: true,
    backgroundColor: '#ffffff',
    width: captureWidth,
    height: captureHeight,
    windowWidth: captureWidth,
    windowHeight: captureHeight,
    scrollX: 0,
    scrollY: 0,
    imageTimeout: 0,
    ignoreElements: (element) => element?.getAttribute?.('data-export-ignore') === 'true',
    ...captureOptions,
  })
}

function applyComputedColorFallbackStyles(sourceRoot, cloneRoot) {
  if (!sourceRoot || !cloneRoot) {
    return
  }

  const sourceNodes = [sourceRoot, ...sourceRoot.querySelectorAll('*')]
  const cloneNodes = [cloneRoot, ...cloneRoot.querySelectorAll('*')]
  const count = Math.min(sourceNodes.length, cloneNodes.length)

  for (let index = 0; index < count; index += 1) {
    const sourceNode = sourceNodes[index]
    const cloneNode = cloneNodes[index]
    const computed = window.getComputedStyle(sourceNode)

    COLOR_STYLE_PROPS.forEach((prop) => {
      const value = computed.getPropertyValue(prop)

      if (value) {
        cloneNode.style.setProperty(prop, value, 'important')
      }
    })
  }
}

function isCanvasLikelyBlank(canvas) {
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context || canvas.width <= 0 || canvas.height <= 0) {
    return true
  }

  const sampleColumns = 8
  const sampleRows = 10
  let nonWhitePixelCount = 0

  for (let row = 0; row < sampleRows; row += 1) {
    for (let column = 0; column < sampleColumns; column += 1) {
      const x = Math.min(
        canvas.width - 1,
        Math.floor(((column + 0.5) / sampleColumns) * canvas.width),
      )
      const y = Math.min(
        canvas.height - 1,
        Math.floor(((row + 0.5) / sampleRows) * canvas.height),
      )
      const [r, g, b, a] = context.getImageData(x, y, 1, 1).data
      const isTransparent = a < 8
      const isNearWhite = r > 248 && g > 248 && b > 248

      if (!isTransparent && !isNearWhite) {
        nonWhitePixelCount += 1
      }
    }
  }

  return nonWhitePixelCount === 0
}

function collectCanvasPageBreakpoints(captureRoot, canvas) {
  if (!captureRoot || !canvas) {
    return []
  }

  const sourceHeight = Math.max(captureRoot.scrollHeight, captureRoot.offsetHeight, 1)
  const sourceRect = captureRoot.getBoundingClientRect()
  const scaleY = canvas.height / sourceHeight
  const breakpoints = new Set([0, canvas.height])
  const candidates = captureRoot.querySelectorAll(PAGE_BREAK_SELECTOR)

  candidates.forEach((element) => {
    const rect = element.getBoundingClientRect()
    const top = rect.top - sourceRect.top
    const bottom = rect.bottom - sourceRect.top
    const scaledTop = Math.round(top * scaleY)
    const scaledBottom = Math.round(bottom * scaleY)

    if (scaledTop > 0 && scaledTop < canvas.height) {
      breakpoints.add(scaledTop)
    }

    if (scaledBottom > 0 && scaledBottom < canvas.height) {
      breakpoints.add(scaledBottom)
    }
  })

  return Array.from(breakpoints).sort((a, b) => a - b)
}

function collectCanvasContentBlocks(captureRoot, canvas) {
  if (!captureRoot || !canvas) {
    return []
  }

  const sourceHeight = Math.max(captureRoot.scrollHeight, captureRoot.offsetHeight, 1)
  const sourceRect = captureRoot.getBoundingClientRect()
  const scaleY = canvas.height / sourceHeight
  const anchors = captureRoot.querySelectorAll('[data-export-header], [data-export-section]')
  const ranges = []
  let hasSidePlacement = false

  anchors.forEach((anchor) => {
    const rect = anchor.getBoundingClientRect()
    const top = Math.max(0, Math.round((rect.top - sourceRect.top) * scaleY))
    const bottom = Math.min(canvas.height, Math.round((rect.bottom - sourceRect.top) * scaleY))

    if (bottom > top) {
      const placement = anchor.getAttribute('data-export-placement')

      if (placement === 'side') {
        hasSidePlacement = true
      }

      ranges.push({ top, bottom, placement })
    }
  })

  if (ranges.length === 0) {
    return [{ top: 0, bottom: canvas.height }]
  }

  ranges.sort((a, b) => a.top - b.top)

  if (!hasSidePlacement) {
    const blocks = []
    let cursorTop = 0

    for (let index = 0; index < ranges.length; index += 1) {
      const current = ranges[index]
      const next = ranges[index + 1]
      const blockTop = Math.max(cursorTop, current.top)

      if (blockTop > cursorTop) {
        blocks.push({ top: cursorTop, bottom: blockTop })
      }

      const blockBottom = Math.max(
        blockTop,
        Math.min(canvas.height, next ? next.top : canvas.height),
      )

      if (blockBottom > blockTop) {
        blocks.push({ top: blockTop, bottom: blockBottom })
      }

      cursorTop = blockBottom
    }

    if (cursorTop < canvas.height) {
      blocks.push({ top: cursorTop, bottom: canvas.height })
    }

    return blocks.filter((block) => block.bottom > block.top)
  }

  const blocks = []
  let cursorTop = 0

  for (let index = 0; index < ranges.length; index += 1) {
    const current = ranges[index]
    const next = ranges[index + 1]

    if (current.top > cursorTop) {
      blocks.push({ top: cursorTop, bottom: current.top })
    }

    const blockBottom = Math.max(current.bottom, next ? next.top : canvas.height)
    blocks.push({ top: current.top, bottom: Math.min(canvas.height, blockBottom) })
    cursorTop = Math.min(canvas.height, blockBottom)
  }

  if (cursorTop < canvas.height) {
    blocks.push({ top: cursorTop, bottom: canvas.height })
  }

  return blocks.filter((block) => block.bottom > block.top)
}

function collectCanvasSectionRanges(captureRoot, canvas) {
  if (!captureRoot || !canvas) {
    return []
  }

  const sourceHeight = Math.max(captureRoot.scrollHeight, captureRoot.offsetHeight, 1)
  const sourceWidth = Math.max(captureRoot.scrollWidth, captureRoot.offsetWidth, 1)
  const sourceRect = captureRoot.getBoundingClientRect()
  const scaleY = canvas.height / sourceHeight
  const scaleX = canvas.width / sourceWidth
  const sections = captureRoot.querySelectorAll('[data-export-section]')

  return Array.from(sections)
    .map((section) => {
      const rect = section.getBoundingClientRect()
      const top = Math.max(0, Math.round((rect.top - sourceRect.top) * scaleY))
      const bottom = Math.min(canvas.height, Math.round((rect.bottom - sourceRect.top) * scaleY))
      const left = Math.max(0, Math.round((rect.left - sourceRect.left) * scaleX))
      const right = Math.min(canvas.width, Math.round((rect.right - sourceRect.left) * scaleX))

      return { top, bottom, left, right }
    })
    .filter((range) => range.bottom > range.top && range.right > range.left)
}

function resolvePageSliceHeight(offsetY, pageHeightPx, totalHeight, breakpoints) {
  const remainingHeight = totalHeight - offsetY

  if (remainingHeight <= pageHeightPx) {
    return remainingHeight
  }

  const naturalBreakY = offsetY + pageHeightPx
  let selectedBreakY = 0

  for (let index = breakpoints.length - 1; index >= 0; index -= 1) {
    const breakpoint = breakpoints[index]

    if (breakpoint <= offsetY) {
      break
    }

    if (breakpoint > naturalBreakY) {
      continue
    }

    selectedBreakY = breakpoint
    break
  }

  if (!selectedBreakY) {
    return pageHeightPx
  }

  return Math.max(1, selectedBreakY - offsetY)
}

function splitRangeIntoSlices(rangeTop, rangeBottom, pageHeightPx, breakpoints = []) {
  const slices = []
  let offsetY = rangeTop

  while (offsetY < rangeBottom) {
    const sliceHeight = resolvePageSliceHeight(
      offsetY,
      pageHeightPx,
      rangeBottom,
      breakpoints,
    )

    const nextY = Math.min(rangeBottom, offsetY + sliceHeight)
    slices.push({ top: offsetY, bottom: nextY })
    offsetY = nextY
  }

  return slices
}

function buildPageSlicesFromBlocks(pageHeightPx, contentBlocks, breakpoints = []) {
  if (!contentBlocks.length) {
    return []
  }

  const pages = []
  let currentPageTop = 0
  let currentPageBottom = 0
  let currentPageHeight = 0

  const pushCurrentPage = () => {
    if (currentPageBottom > currentPageTop) {
      pages.push({ top: currentPageTop, bottom: currentPageBottom })
      currentPageTop = currentPageBottom
      currentPageHeight = 0
    }
  }

  contentBlocks.forEach((block) => {
    const blockHeight = block.bottom - block.top

    if (blockHeight <= pageHeightPx) {
      if (currentPageHeight === 0) {
        currentPageTop = block.top
        currentPageBottom = block.bottom
        currentPageHeight = blockHeight
        return
      }

      const projectedBottom = Math.max(currentPageBottom, block.bottom)
      const projectedHeight = projectedBottom - currentPageTop

      if (projectedHeight > pageHeightPx) {
        if (block.top > currentPageBottom) {
          currentPageBottom = block.top
          currentPageHeight = currentPageBottom - currentPageTop
        }
        pushCurrentPage()
        currentPageTop = block.top
        currentPageBottom = block.bottom
        currentPageHeight = blockHeight
        return
      }

      currentPageBottom = projectedBottom
      currentPageHeight = projectedHeight
      return
    }

    pushCurrentPage()
    const slices = splitRangeIntoSlices(block.top, block.bottom, pageHeightPx, breakpoints)
    slices.forEach((slice) => pages.push(slice))
  })

  pushCurrentPage()
  return pages
}

function doesBoundarySplitRange(boundaryY, ranges) {
  return ranges.some((range) => boundaryY > range.top && boundaryY < range.bottom)
}

function mergeRanges(ranges) {
  if (!ranges.length) {
    return []
  }

  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const merged = [sorted[0]]

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index]
    const last = merged[merged.length - 1]

    if (current.start <= last.end + 0.2) {
      last.end = Math.max(last.end, current.end)
      continue
    }

    merged.push(current)
  }

  return merged
}

function addCanvasPagesToPdf(
  pdf,
  canvas,
  pdfMode,
  breakpoints = [],
  contentBlocks = [],
  sectionRanges = [],
) {
  const renderedWidth = A4_WIDTH_MM - pdfMode.marginMm.left - pdfMode.marginMm.right
  const printableHeight = A4_HEIGHT_MM - pdfMode.marginMm.top - pdfMode.marginMm.bottom
  const pageBottomY = A4_HEIGHT_MM - pdfMode.marginMm.bottom
  const pageHeightPx = Math.max(1, Math.floor((printableHeight * canvas.width) / renderedWidth))
  const pageCanvas = document.createElement('canvas')
  const pageContext = pageCanvas.getContext('2d')

  if (!pageContext) {
    throw new Error('Unable to prepare page canvas for PDF export.')
  }

  const pageSlices = buildPageSlicesFromBlocks(
    pageHeightPx,
    contentBlocks.length > 0 ? contentBlocks : [{ top: 0, bottom: canvas.height }],
    breakpoints,
  )
  const effectiveContentBlocks = contentBlocks.length > 0
    ? contentBlocks
    : [{ top: 0, bottom: canvas.height }]

  pageSlices.forEach((slice, pageIndex) => {
    const sliceHeight = slice.bottom - slice.top

    pageCanvas.width = canvas.width
    pageCanvas.height = sliceHeight
    pageContext.clearRect(0, 0, pageCanvas.width, pageCanvas.height)
    pageContext.drawImage(
      canvas,
      0,
      slice.top,
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

    const nextSlice = pageSlices[pageIndex + 1]
    const boundaryY = slice.bottom
    const continuedSections = nextSlice
      ? sectionRanges.filter((section) => boundaryY > section.top && boundaryY < section.bottom)
      : []
    const shouldDrawFallbackLine = Boolean(
      nextSlice
      && continuedSections.length === 0
      && doesBoundarySplitRange(boundaryY, effectiveContentBlocks),
    )

    if (continuedSections.length > 0 || shouldDrawFallbackLine) {
      const lineY = Math.min(pageBottomY, pdfMode.marginMm.top + sliceHeightMm)
      pdf.setDrawColor(203, 213, 225)
      pdf.setLineWidth(0.3)

      if (continuedSections.length > 0) {
        const lineRanges = mergeRanges(
          continuedSections.map((section) => ({
            start: pdfMode.marginMm.left + (section.left * renderedWidth) / canvas.width,
            end: pdfMode.marginMm.left + (section.right * renderedWidth) / canvas.width,
          })),
        )

        lineRanges.forEach((range) => {
          pdf.line(range.start, lineY, range.end, lineY)
        })
      } else {
        pdf.line(
          pdfMode.marginMm.left,
          lineY,
          A4_WIDTH_MM - pdfMode.marginMm.right,
          lineY,
        )
      }
    }
  })
}

function createWorkerPageSlices(canvas, pdfMode, breakpoints = [], contentBlocks = [], sectionRanges = []) {
  const renderedWidth = A4_WIDTH_MM - pdfMode.marginMm.left - pdfMode.marginMm.right
  const printableHeight = A4_HEIGHT_MM - pdfMode.marginMm.top - pdfMode.marginMm.bottom
  const pageBottomY = A4_HEIGHT_MM - pdfMode.marginMm.bottom
  const pageHeightPx = Math.max(1, Math.floor((printableHeight * canvas.width) / renderedWidth))
  const pageCanvas = document.createElement('canvas')
  const pageContext = pageCanvas.getContext('2d')

  if (!pageContext) {
    throw new Error('Unable to prepare page canvas for PDF export.')
  }

  const pageSlices = buildPageSlicesFromBlocks(
    pageHeightPx,
    contentBlocks.length > 0 ? contentBlocks : [{ top: 0, bottom: canvas.height }],
    breakpoints,
  )
  const effectiveContentBlocks = contentBlocks.length > 0
    ? contentBlocks
    : [{ top: 0, bottom: canvas.height }]

  return pageSlices.map((slice, pageIndex) => {
    const sliceHeight = slice.bottom - slice.top

    pageCanvas.width = canvas.width
    pageCanvas.height = sliceHeight
    pageContext.clearRect(0, 0, pageCanvas.width, pageCanvas.height)
    pageContext.drawImage(
      canvas,
      0,
      slice.top,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    )

    const sliceHeightMm = (sliceHeight * renderedWidth) / canvas.width
    const nextSlice = pageSlices[pageIndex + 1]
    const boundaryY = slice.bottom
    const continuedSections = nextSlice
      ? sectionRanges.filter((section) => boundaryY > section.top && boundaryY < section.bottom)
      : []
    const shouldDrawFallbackLine = Boolean(
      nextSlice
      && continuedSections.length === 0
      && doesBoundarySplitRange(boundaryY, effectiveContentBlocks),
    )

    let separatorLineSegments = []

    if (continuedSections.length > 0 || shouldDrawFallbackLine) {
      const lineY = Math.min(pageBottomY, pdfMode.marginMm.top + sliceHeightMm)

      if (continuedSections.length > 0) {
        separatorLineSegments = mergeRanges(
          continuedSections.map((section) => ({
            start: pdfMode.marginMm.left + (section.left * renderedWidth) / canvas.width,
            end: pdfMode.marginMm.left + (section.right * renderedWidth) / canvas.width,
          })),
        ).map((segment) => ({
          start: segment.start,
          end: segment.end,
          y: lineY,
        }))
      } else {
        separatorLineSegments = [{
          start: pdfMode.marginMm.left,
          end: A4_WIDTH_MM - pdfMode.marginMm.right,
          y: lineY,
        }]
      }
    }

    return {
      imageDataUrl: pageCanvas.toDataURL('image/png'),
      sliceHeightMm,
      separatorLineSegments,
    }
  })
}

async function exportPdfInWorker(pages, pdfMode) {
  if (typeof Worker === 'undefined') {
    throw new Error('Web Worker is not available in this browser.')
  }

  const worker = new Worker(
    new URL('../workers/pdfExportWorker.js', import.meta.url),
    { type: 'module' },
  )

  return new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      const { type, blob, message } = event.data ?? {}

      worker.terminate()

      if (type === 'success' && blob) {
        resolve(blob)
        return
      }

      reject(new Error(message || 'Worker PDF export failed.'))
    }

    worker.onerror = () => {
      worker.terminate()
      reject(new Error('Worker PDF export crashed.'))
    }

    worker.postMessage({
      type: 'export-pdf',
      pages,
      pdfMode,
      renderedWidth: A4_WIDTH_MM - pdfMode.marginMm.left - pdfMode.marginMm.right,
    })
  })
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

async function drawFallbackHeader(pdf, snapshot, marginMm, palette, includePhoto = true, copy = createExportCopy()) {
  const fullWidth = A4_WIDTH_MM - marginMm.left - marginMm.right
  const headerX = marginMm.left
  const headerY = marginMm.top
  const title = snapshot.fullName || copy.yourName
  const subtitle = snapshot.title || copy.professionalTitle
  const photoDataUrl = getPhotoDataUrl(snapshot.photo)
  const photoSize = 21
  const photoGap = 6
  const hasPhoto = includePhoto && Boolean(photoDataUrl)
  const photoX = A4_WIDTH_MM - marginMm.right - photoSize
  const photoY = headerY
  const availableTextWidth = hasPhoto
    ? Math.max(56, photoX - photoGap - headerX)
    : fullWidth

  pdf.setTextColor(...palette.headerText)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  const titleLines = pdf.splitTextToSize(title, availableTextWidth)
  pdf.text(titleLines, headerX, headerY + 4.2)
  const titleLineCount = Array.isArray(titleLines) ? titleLines.length : 1

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10.5)
  const subtitleY = headerY + 4.2 + titleLineCount * 5.2
  const subtitleLines = pdf.splitTextToSize(subtitle, availableTextWidth)
  pdf.text(subtitleLines, headerX, subtitleY)
  const subtitleLineCount = Array.isArray(subtitleLines) ? subtitleLines.length : 1
  const textBottomY = subtitleY + subtitleLineCount * 4.6

  if (hasPhoto) {
    pdf.addImage(
      photoDataUrl,
      getImageFormatFromDataUrl(photoDataUrl),
      photoX,
      photoY,
      photoSize,
      photoSize,
    )
  }

  pdf.setDrawColor(...palette.divider)
  pdf.setLineWidth(0.35)
  const dividerY = hasPhoto
    ? Math.max(headerY + photoSize + 2.4, textBottomY + 2.6)
    : textBottomY + 2.6
  pdf.line(headerX, dividerY, headerX + fullWidth, dividerY)

  return dividerY + 4.2
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

async function exportCvAsPdfTextFallback(
  formData,
  fileName,
  mode,
  templateId = defaultTemplateId,
  locale = 'en',
) {
  const jsPDF = await loadJsPdf()
  const pdfMode = createPdfMode(mode)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })
  const snapshot = createCvSnapshot(formData)
  const copy = createExportCopy(locale)
  const templateConfig = getCvTemplate(templateId)
  const sectionVisibility = {
    about: true,
    experience: true,
    education: true,
    skills: true,
    links: true,
    ...(formData.sectionVisibility ?? {}),
  }
  const templateSectionOrder = [
    ...templateConfig.primarySections,
    ...templateConfig.secondarySections,
  ]
  const palette = createFallbackPalette()
  const includePhoto = isPhotoVisibleForTemplate(
    formData.photoVisibilityByTemplate,
    templateConfig.id,
  )
  const cursor = {
    y: await drawFallbackHeader(pdf, snapshot, pdfMode.marginMm, palette, includePhoto, copy),
  }

  const isVisible = (section) => sectionVisibility[section] !== false

  const renderAbout = () => {
    drawFallbackSectionHeading(pdf, copy.about, cursor, pdfMode.marginMm, palette)
    drawFallbackParagraph(
      pdf,
      snapshot.about || copy.addSummary,
      cursor,
      pdfMode.marginMm,
      palette,
      { size: 10.6, lineHeight: 5.1 },
    )
  }

  const renderSkills = () => {
    drawFallbackSectionHeading(pdf, copy.skills, cursor, pdfMode.marginMm, palette)
    if (snapshot.skills.length > 0) {
      drawFallbackBullets(pdf, snapshot.skills, cursor, pdfMode.marginMm, palette)
    } else {
      drawFallbackParagraph(pdf, copy.addSkills, cursor, pdfMode.marginMm, palette, { subtle: true })
    }
  }

  const renderExperience = () => {
    drawFallbackSectionHeading(pdf, copy.experience, cursor, pdfMode.marginMm, palette)
    if (snapshot.experience.length > 0) {
      snapshot.experience.forEach((item) => {
        const heading = [item.role, item.company].filter(Boolean).join(' @ ') || copy.untitledRole
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
      drawFallbackParagraph(pdf, copy.noExperience, cursor, pdfMode.marginMm, palette, { subtle: true })
    }
  }

  const renderEducation = () => {
    drawFallbackSectionHeading(pdf, copy.education, cursor, pdfMode.marginMm, palette)
    if (snapshot.education.length > 0) {
      snapshot.education.forEach((item) => {
        const heading = [item.degree, item.school].filter(Boolean).join(', ') || copy.educationEntry
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
      drawFallbackParagraph(pdf, copy.noEducation, cursor, pdfMode.marginMm, palette, { subtle: true })
    }
  }

  const renderLinks = () => {
    drawFallbackSectionHeading(pdf, copy.links, cursor, pdfMode.marginMm, palette)
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
      drawFallbackParagraph(pdf, copy.noLinks, cursor, pdfMode.marginMm, palette, { subtle: true })
    }
  }

  const sectionRenderers = {
    about: renderAbout,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
    links: renderLinks,
  }

  const renderedSections = new Set()

  templateSectionOrder.forEach((section) => {
    const render = sectionRenderers[section]

    if (render && !renderedSections.has(section) && isVisible(section)) {
      render()
      renderedSections.add(section)
    }
  })

  Object.keys(sectionRenderers).forEach((section) => {
    if (!renderedSections.has(section) && isVisible(section)) {
      sectionRenderers[section]()
      renderedSections.add(section)
    }
  })

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

  const didMatchExpectedVariant = await waitForPreviewVariant(exportRoot, expectedVariant)

  if (expectedVariant && !didMatchExpectedVariant) {
    // Do not hard-fail export; proceed with the active preview to avoid blocking users.
    await waitForAnimationFrame()
    await waitForAnimationFrame()
  }

  // Keep export variant aligned with the selected template before capture.
  if (expectedVariant && exportRoot) {
    exportRoot.setAttribute('data-export-variant', expectedVariant)

    exportRoot.style.display = 'none'
    void exportRoot.offsetHeight
    exportRoot.style.display = ''

    await new Promise((resolve) => setTimeout(resolve, 120))
  }

  const { sandbox, captureRoot, clone, pdfMode } = createExportSandbox(
    exportRoot,
    mode,
    expectedVariant,
  )

  try {
    let canvas = await renderCaptureCanvas(captureRoot, {
      foreignObjectRendering: false,
    })

    if (isCanvasLikelyBlank(canvas)) {
      canvas = await renderCaptureCanvas(captureRoot, {
        foreignObjectRendering: true,
      })
    }

    if (isCanvasLikelyBlank(canvas)) {
      applyComputedColorFallbackStyles(exportRoot, clone)
      canvas = await renderCaptureCanvas(captureRoot, {
        foreignObjectRendering: false,
      })
    }

    if (isCanvasLikelyBlank(canvas) && options.formData) {
      await exportCvAsPdfTextFallback(
        options.formData,
        fileName,
        mode,
        options.template,
        options.locale === 'fi' ? 'fi' : 'en',
      )
      return
    }

    if (canvas.width <= 0 || canvas.height <= 0) {
      throw new Error('Captured preview is empty. Open preview and try exporting again.')
    }

    const breakpoints = collectCanvasPageBreakpoints(captureRoot, canvas)
    const contentBlocks = collectCanvasContentBlocks(captureRoot, canvas)
    const sectionRanges = collectCanvasSectionRanges(captureRoot, canvas)
    const exportName =
      mode === 'designer' ? fileName : `${fileName}-${createPdfMode(mode).fileSuffix}`
    const workerPages = createWorkerPageSlices(
      canvas,
      pdfMode,
      breakpoints,
      contentBlocks,
      sectionRanges,
    )

    try {
      const workerBlob = await exportPdfInWorker(workerPages, pdfMode)
      saveAs(workerBlob, `${exportName}.pdf`)
      return
    } catch {
      const jsPDF = await loadJsPdf()
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      addCanvasPagesToPdf(pdf, canvas, pdfMode, breakpoints, contentBlocks, sectionRanges)
      const blob = pdf.output('blob')
      saveAs(blob, `${exportName}.pdf`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    const isUnsupportedColorError = /unsupported color|oklch/i.test(message)

    if (isUnsupportedColorError && options.formData) {
      await exportCvAsPdfTextFallback(
        options.formData,
        fileName,
        mode,
        options.template,
        options.locale === 'fi' ? 'fi' : 'en',
      )
      return
    }

    throw error
  } finally {
    removeExportSandbox(sandbox)
  }
}
