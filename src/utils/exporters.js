// 'file-saver' is CommonJS-only — a named import { saveAs } fails under
// plain Node ESM (as used by scripts/check-docx-export.mjs), so this takes
// the default-import-then-destructure shape instead.
import fileSaverPkg from 'file-saver'
const { saveAs } = fileSaverPkg
import { defaultTemplateId } from './cvTemplates'
import { getEffectiveCvTemplate } from './sectionColumns'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from './cvForm'
import { createCvSnapshot } from './cvSnapshot'
import { formatDateRange, formatLinkLabel } from './shared'

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
// Must match --preview-paper-width in src/styles/tokens.css. The live preview
// pane is only ever this wide on a roomy desktop viewport — on mobile (and in
// the narrower split-pane layout) it's clamped down to fit the screen via
// `width: min(100%, var(--preview-paper-width))`. Designer-mode capture needs
// the *designed* page width regardless of the device it's exported from, so
// it must not read the live on-screen width (see createExportSandbox).
const DESIGNER_PAPER_WIDTH_MM = 220
const PX_PER_INCH = 96
const MM_PER_INCH = 25.4
const MAX_CAPTURE_PIXEL_AREA = 12_000_000
// The capture canvas always has an opaque white background (see renderCaptureCanvas),
// so JPEG's lack of an alpha channel costs nothing here — and it shrinks a multi-page
// resume PDF from tens of MB (lossless PNG) down to a fraction of that.
const PDF_PAGE_IMAGE_FORMAT = 'JPEG'
const PDF_PAGE_IMAGE_MIME = 'image/jpeg'
// Measured against real exports (2-4 page A4, 192-227 effective PPI): dropping
// from 0.85 to 0.72 saves ~20% of file size with no visible difference at 100%
// zoom, even on flat-color sidebar panels where JPEG banding would show up
// first. Pushed further (0.65 tested) savings grow but the margin for
// templates/content not covered by that test shrinks, so 0.72 is the
// conservative stopping point.
const PDF_PAGE_IMAGE_QUALITY = 0.72
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

let pdfAssetsPrefetched = false

/**
 * Warms the html2canvas/jsPDF bundle and the PDF export worker chunk so the
 * first real export doesn't pay for ~1.4MB of lazy-loaded code on top of the
 * render work. Safe to call speculatively: it only downloads and evaluates
 * the modules, it never captures the DOM or produces a file.
 */
export function prefetchPdfExportAssets() {
  if (pdfAssetsPrefetched) {
    return
  }

  pdfAssetsPrefetched = true

  loadHtml2Canvas().catch(() => {})
  loadJsPdf().catch(() => {})

  if (typeof Worker === 'undefined') {
    return
  }

  try {
    // Deliberately never terminated: the worker's own script fetch (and its
    // nested `import { jsPDF } from 'jspdf'`) needs to run to completion for
    // the cache to actually warm, and it never receives a message so it does
    // no work while idle. A real export still spins up its own worker.
    new Worker(new URL('../workers/pdfExportWorker.js', import.meta.url), { type: 'module' })
  } catch {
    // Worker construction can fail (e.g. blocked by a restrictive CSP) -
    // prefetching is a pure optimization, so failures here are silent.
  }
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

  if (import.meta.env.DEV) {
    console.warn(
      `PDF Export: Variant mismatch. Expected "${expectedVariant}", got "${getExportVariant(exportRoot)}"`,
    )
  }

  return false
}

export function createExportCopy(locale = 'en') {
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
    coreStrengths: isFinnish ? 'Vahvuudet' : 'Core Strengths',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certificates',
    projects: isFinnish ? 'Projektit' : 'Projects',
    languages: isFinnish ? 'Kielet' : 'Languages',
    interests: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
    achievements: isFinnish ? 'Saavutukset' : 'Achievements',
    openSource: isFinnish ? 'Avoin lähdekoodi' : 'Open Source',
    publications: isFinnish ? 'Julkaisut' : 'Publications',
    leadership: isFinnish ? 'Johtamiskokemus' : 'Leadership Experience',
    memberships: isFinnish ? 'Ammattijäsenyydet' : 'Professional Memberships',
    speaking: isFinnish ? 'Esiintymiset' : 'Speaking',
    volunteering: isFinnish ? 'Vapaaehtoistyö' : 'Volunteering',
    internships: isFinnish ? 'Harjoittelut' : 'Internships',
    caseStudies: isFinnish ? 'Tapaustutkimukset' : 'Case Studies',
    testimonials: isFinnish ? 'Suositukset' : 'Testimonials',
    problem: isFinnish ? 'Ongelma' : 'Problem',
    solution: isFinnish ? 'Ratkaisu' : 'Solution',
    technologies: isFinnish ? 'Teknologiat' : 'Technologies',
    outcome: isFinnish ? 'Tulos' : 'Outcome',
    lessonsLearned: isFinnish ? 'Opitut asiat' : 'Lessons Learned',
    addSummary: isFinnish ? 'Lisää ammatillinen yhteenveto.' : 'Add a professional summary.',
    addSkills: isFinnish ? 'Lisää taitoja' : 'Add skills',
    noExperience: isFinnish ? 'Työkokemusta ei ole vielä lisätty.' : 'No experience added yet.',
    noEducation: isFinnish ? 'Koulutusta ei ole vielä lisätty.' : 'No education added yet.',
    noLinks: isFinnish ? 'Linkkejä ei ole vielä lisätty.' : 'No links added yet.',
    cv: isFinnish ? 'CV' : 'CV',
  }
}

export function getPhotoDataUrl(value) {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmedValue = value.trim()

  if (!/^data:image\/(png|jpe?g);base64,/i.test(trimmedValue)) {
    return ''
  }

  return trimmedValue
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not load photo for PDF export.'))
    image.src = dataUrl
  })
}

// Every other rendering surface (on-screen preview, HTML export, the
// html2canvas-based PDF) crops the profile photo with CSS `object-fit:
// cover`, centering on the shorter edge. This text-based fallback instead
// draws straight into jsPDF's `addImage`, which stretches the source image
// to fill the given width/height rather than cropping it — a non-square
// upload (the common case; there is no crop step on upload) would come out
// visibly squished. Center-cropping to a square here first keeps the
// fallback's proportions consistent with every other export path.
export async function cropPhotoDataUrlToSquare(dataUrl) {
  try {
    const image = await loadImageFromDataUrl(dataUrl)
    const side = Math.min(image.naturalWidth, image.naturalHeight)

    if (!side) {
      return dataUrl
    }

    const canvas = document.createElement('canvas')
    canvas.width = side
    canvas.height = side
    const context = canvas.getContext('2d')

    if (!context) {
      return dataUrl
    }

    context.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      side,
      side,
    )

    return canvas.toDataURL('image/jpeg', 0.92)
  } catch {
    return dataUrl
  }
}

export function getImageFormatFromDataUrl(dataUrl) {
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

export function exportCoverLetterAsText(letterText, fileName) {
  const blob = new Blob([`${letterText.trim()}\n`], { type: 'text/plain;charset=utf-8' })

  saveAs(blob, `${fileName}.txt`)
}

/**
 * Renders the letter as plain wrapped paragraphs on A4 pages — no header,
 * palette, or layout machinery, since a cover letter is body text meant to
 * be dropped into any letterhead, not a styled document like the CV export.
 */
export async function exportCoverLetterAsPdf(letterText, fileName) {
  const jsPDF = await loadJsPdf()
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const marginMm = { top: 22, right: 22, bottom: 22, left: 22 }
  const maxWidth = A4_WIDTH_MM - marginMm.left - marginMm.right
  const lineHeight = 6
  const cursor = { y: marginMm.top }

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.setTextColor(20, 20, 20)

  const paragraphs = letterText.trim().split(/\n{2,}/)

  paragraphs.forEach((paragraph, index) => {
    const paragraphLines = paragraph.split('\n').flatMap((line) => pdf.splitTextToSize(line, maxWidth))

    paragraphLines.forEach((line) => {
      if (cursor.y + lineHeight > A4_HEIGHT_MM - marginMm.bottom) {
        pdf.addPage()
        cursor.y = marginMm.top
      }

      pdf.text(line, marginMm.left, cursor.y)
      cursor.y += lineHeight
    })

    if (index < paragraphs.length - 1) {
      cursor.y += lineHeight
    }
  })

  saveAs(pdf.output('blob'), `${fileName}.pdf`)
}

export function exportCvAsHtml(formData, fileName, options = {}) {
  const locale = options.locale === 'fi' ? 'fi' : 'en'
  const copy = createExportCopy(locale)
  const snapshot = createCvSnapshot(formData)
  const sectionVisibility = {
    ...createSectionVisibility(),
    ...(formData.sectionVisibility ?? {}),
  }
  const sectionOrder = normalizeSectionOrder(formData.sectionOrder)

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

      const gradeLine = [item.grade, item.coursework].filter(Boolean).join(' · ')

      return `  <div class="edu-item">
    <p class="edu-degree">${esc(heading)}</p>${dateRange ? `<p class="edu-date">${esc(dateRange)}</p>` : ''}${item.honors ? `<p class="edu-honors">${esc(item.honors)}</p>` : ''}${gradeLine ? `<p class="edu-honors">${esc(gradeLine)}</p>` : ''}
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

  const coreStrengthItems = snapshot.coreStrengths
    .map(
      (item) =>
        `  <div class="strength-item">${item.title ? `<p class="strength-title">${esc(item.title)}</p>` : ''}${item.description ? `<p class="strength-desc">${esc(item.description)}</p>` : ''}</div>`,
    )
    .join('\n')

  const certificateItems = snapshot.certificates
    .map((item) => {
      const meta = [item.issuer, item.year].filter(Boolean).join(', ')
      const expiry = item.expiry ? ` (expires ${item.expiry})` : ''
      return `<li>${esc(item.name)}${meta ? ` — ${esc(meta)}` : ''}${esc(expiry)}</li>`
    })
    .join('\n    ')

  const projectItems = snapshot.projects
    .map((item) => {
      const linkLine = [item.githubUrl, item.demoUrl].filter(Boolean).join('  ·  ')
      const contributionLine = [item.teamSize, item.contribution].filter(Boolean).join(' · ')
      return `  <div class="project-item">${item.name ? `<p class="project-name">${esc(item.name)}</p>` : ''}${item.description ? `<p class="project-desc">${esc(item.description)}</p>` : ''}${item.stack ? `<p class="project-stack">${esc(item.stack)}</p>` : ''}${contributionLine ? `<p class="project-stack">${esc(contributionLine)}</p>` : ''}${linkLine ? `<p class="project-links">${esc(linkLine)}</p>` : ''}</div>`
    })
    .join('\n')

  const languageItems = snapshot.languages
    .map(
      (item) =>
        `  <p class="language-item">${esc(item.language)}${item.level ? ` — ${esc(item.level)}` : ''}</p>`,
    )
    .join('\n')

  const interestItems = snapshot.interests
    .map((item) => `<span class="interest-chip">${esc(item.name)}</span>`)
    .join('\n    ')

  const achievementItems = snapshot.achievements
    .map(
      (item) =>
        `  <div class="achievement-item">${item.title ? `<p class="achievement-title">${esc(item.title)}${item.year ? ` <span class="achievement-year">${esc(item.year)}</span>` : ''}</p>` : ''}${item.description ? `<p class="achievement-desc">${esc(item.description)}</p>` : ''}</div>`,
    )
    .join('\n')

  const openSourceItems = snapshot.openSource
    .map((item) => {
      const meta = [item.language, item.stars ? `★ ${item.stars}` : '', item.forks ? `⑂ ${item.forks}` : '']
        .filter(Boolean)
        .join('   ')
      return `  <div class="opensource-item">${item.name ? `<p class="opensource-name">${esc(item.name)}</p>` : ''}${meta ? `<p class="opensource-meta">${esc(meta)}</p>` : ''}${item.description ? `<p class="opensource-desc">${esc(item.description)}</p>` : ''}${item.url ? `<p class="opensource-url">${esc(item.url)}</p>` : ''}</div>`
    })
    .join('\n')

  const publicationItems = snapshot.publications
    .map((item) => {
      const meta = [item.publisher, item.year].filter(Boolean).join(' · ')
      return `  <div class="publication-item">${item.title ? `<p class="publication-title">${esc(item.title)}</p>` : ''}${meta ? `<p class="publication-meta">${esc(meta)}</p>` : ''}${item.url ? `<p class="publication-url">${esc(item.url)}</p>` : ''}</div>`
    })
    .join('\n')

  const leadershipItems = snapshot.leadership
    .map((item) => {
      const heading = [item.role, item.organization].filter(Boolean).join(' — ')
      const dateRange = formatDateRange(item.startDate, item.endDate)
      return `  <div class="leadership-item">${heading ? `<p class="leadership-role">${esc(heading)}</p>` : ''}${dateRange ? `<p class="leadership-date">${esc(dateRange)}</p>` : ''}${item.description ? `<p class="leadership-desc">${esc(item.description)}</p>` : ''}</div>`
    })
    .join('\n')

  const membershipItems = snapshot.memberships
    .map((item) => {
      const meta = [item.role, item.year].filter(Boolean).join(', ')
      return `<li>${esc(item.organization)}${meta ? ` — ${esc(meta)}` : ''}</li>`
    })
    .join('\n    ')

  const speakingItems = snapshot.speaking
    .map((item) => {
      const meta = [item.conference, item.date].filter(Boolean).join(' · ')
      return `  <div class="speaking-item">${item.topic ? `<p class="speaking-topic">${esc(item.topic)}</p>` : ''}${meta ? `<p class="speaking-meta">${esc(meta)}</p>` : ''}${item.audience ? `<p class="speaking-audience">${esc(item.audience)}</p>` : ''}</div>`
    })
    .join('\n')

  const volunteeringItems = snapshot.volunteering
    .map((item) => {
      const heading = [item.role, item.organization].filter(Boolean).join(' — ')
      return `  <div class="volunteer-item">${heading ? `<p class="volunteer-role">${esc(heading)}</p>` : ''}${item.description ? `<p class="volunteer-desc">${esc(item.description)}</p>` : ''}</div>`
    })
    .join('\n')

  const internshipItems = snapshot.internships
    .map((item) => {
      const heading = [item.role, item.company].filter(Boolean).join(' at ') || copy.untitledRole
      const dateRange = formatDateRange(item.startDate, item.endDate)

      return `  <div class="xp-item">
    <div class="xp-head"><p class="xp-role">${esc(heading)}</p>${dateRange ? `<p class="xp-date">${esc(dateRange)}</p>` : ''}</div>
    ${item.description ? `<p class="xp-desc">${esc(item.description)}</p>` : ''}${item.technologies ? `<p class="project-stack">${esc(item.technologies)}</p>` : ''}
  </div>`
    })
    .join('\n')

  const caseStudyItems = snapshot.caseStudies
    .map((item) => {
      const rows = [
        [copy.problem, item.problem],
        [copy.solution, item.solution],
        [copy.technologies, item.technologies],
        [copy.outcome, item.outcome],
        [copy.lessonsLearned, item.lessons],
      ].filter(([, value]) => value)

      return `  <div class="project-item">${item.title ? `<p class="project-name">${esc(item.title)}</p>` : ''}${rows.map(([label, value]) => `<p class="project-desc"><strong>${esc(label)}:</strong> ${esc(value)}</p>`).join('')}</div>`
    })
    .join('\n')

  const testimonialItems = snapshot.testimonials
    .map((item) => {
      const meta = [item.author, item.role].filter(Boolean).join(', ')
      return `  <div class="strength-item">${item.quote ? `<p class="strength-desc">“${esc(item.quote)}”</p>` : ''}${meta ? `<p class="strength-title">${esc(meta)}</p>` : ''}</div>`
    })
    .join('\n')

  const contactLine = [snapshot.email, snapshot.phone, snapshot.location]
    .filter(Boolean)
    .map((value) => `<span>${esc(value)}</span>`)
    .join('')

  const isVisible = (section) => sectionVisibility[section] !== false
  const sectionMarkupByKey = {
    about: () =>
      snapshot.about
      && isVisible('about')
      && `<section>\n  <h2 class="section-heading">${copy.about}</h2>\n  <p class="about-text">${esc(snapshot.about)}</p>\n</section>`,
    experience: () =>
      snapshot.experience.length > 0
      && isVisible('experience')
      && `<section>\n  <h2 class="section-heading">${copy.experience}</h2>\n${experienceItems}\n</section>`,
    education: () =>
      snapshot.education.length > 0
      && isVisible('education')
      && `<section>\n  <h2 class="section-heading">${copy.education}</h2>\n${educationItems}\n</section>`,
    skills: () =>
      snapshot.skills.length > 0
      && isVisible('skills')
      && `<section>\n  <h2 class="section-heading">${copy.skills}</h2>\n  <div class="skills">\n    ${skillTags}\n  </div>\n</section>`,
    links: () =>
      Object.keys(snapshot.links).length > 0
      && isVisible('links')
      && `<section>\n  <h2 class="section-heading">${copy.links}</h2>\n${linkItems}\n</section>`,
    coreStrengths: () =>
      snapshot.coreStrengths.length > 0
      && isVisible('coreStrengths')
      && `<section>\n  <h2 class="section-heading">${copy.coreStrengths}</h2>\n${coreStrengthItems}\n</section>`,
    certificates: () =>
      snapshot.certificates.length > 0
      && isVisible('certificates')
      && `<section>\n  <h2 class="section-heading">${copy.certificates}</h2>\n  <ul class="certificate-list">\n    ${certificateItems}\n  </ul>\n</section>`,
    projects: () =>
      snapshot.projects.length > 0
      && isVisible('projects')
      && `<section>\n  <h2 class="section-heading">${copy.projects}</h2>\n${projectItems}\n</section>`,
    languages: () =>
      snapshot.languages.length > 0
      && isVisible('languages')
      && `<section>\n  <h2 class="section-heading">${copy.languages}</h2>\n${languageItems}\n</section>`,
    interests: () =>
      snapshot.interests.length > 0
      && isVisible('interests')
      && `<section>\n  <h2 class="section-heading">${copy.interests}</h2>\n  <div class="interests">\n    ${interestItems}\n  </div>\n</section>`,
    achievements: () =>
      snapshot.achievements.length > 0
      && isVisible('achievements')
      && `<section>\n  <h2 class="section-heading">${copy.achievements}</h2>\n${achievementItems}\n</section>`,
    openSource: () =>
      snapshot.openSource.length > 0
      && isVisible('openSource')
      && `<section>\n  <h2 class="section-heading">${copy.openSource}</h2>\n${openSourceItems}\n</section>`,
    publications: () =>
      snapshot.publications.length > 0
      && isVisible('publications')
      && `<section>\n  <h2 class="section-heading">${copy.publications}</h2>\n${publicationItems}\n</section>`,
    leadership: () =>
      snapshot.leadership.length > 0
      && isVisible('leadership')
      && `<section>\n  <h2 class="section-heading">${copy.leadership}</h2>\n${leadershipItems}\n</section>`,
    memberships: () =>
      snapshot.memberships.length > 0
      && isVisible('memberships')
      && `<section>\n  <h2 class="section-heading">${copy.memberships}</h2>\n  <ul class="membership-list">\n    ${membershipItems}\n  </ul>\n</section>`,
    speaking: () =>
      snapshot.speaking.length > 0
      && isVisible('speaking')
      && `<section>\n  <h2 class="section-heading">${copy.speaking}</h2>\n${speakingItems}\n</section>`,
    volunteering: () =>
      snapshot.volunteering.length > 0
      && isVisible('volunteering')
      && `<section>\n  <h2 class="section-heading">${copy.volunteering}</h2>\n${volunteeringItems}\n</section>`,
    internships: () =>
      snapshot.internships.length > 0
      && isVisible('internships')
      && `<section>\n  <h2 class="section-heading">${copy.internships}</h2>\n${internshipItems}\n</section>`,
    caseStudies: () =>
      snapshot.caseStudies.length > 0
      && isVisible('caseStudies')
      && `<section>\n  <h2 class="section-heading">${copy.caseStudies}</h2>\n${caseStudyItems}\n</section>`,
    testimonials: () =>
      snapshot.testimonials.length > 0
      && isVisible('testimonials')
      && `<section>\n  <h2 class="section-heading">${copy.testimonials}</h2>\n${testimonialItems}\n</section>`,
  }

  const sections = sectionOrder
    .map((section) => sectionMarkupByKey[section]?.())
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
.cv-tagline { margin-top: 0.375rem; font-size: 0.9rem; color: #64748b; font-style: italic; }
.cv-contact { margin-top: 0.875rem; display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; font-size: 0.85rem; color: #475569; }
section { margin-bottom: 2.5rem; }
.section-heading { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.26em; text-transform: uppercase; color: #64748b; padding-bottom: 0.625rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
.about-text { color: #334155; font-size: 0.975rem; line-height: 1.8; white-space: pre-line; }
.xp-item { margin-bottom: 1.75rem; padding-left: 1.375rem; border-left: 2px solid #cbd5e1; }
.xp-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem; align-items: baseline; }
.xp-role { font-weight: 600; font-size: 1.05rem; }
.xp-date { font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; white-space: nowrap; }
.xp-desc { margin-top: 0.625rem; font-size: 0.9rem; color: #334155; line-height: 1.75; white-space: pre-line; }
.edu-item { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem; align-items: baseline; padding: 0.875rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-bottom: 0.75rem; }
.edu-degree { font-weight: 600; font-size: 0.975rem; }
.edu-date { font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; }
.skills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.skill { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 999px; padding: 0.3rem 0.875rem; font-size: 0.78rem; font-weight: 600; color: #334155; }
.link-item { margin-bottom: 0.875rem; }
.link-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #94a3b8; margin-bottom: 0.25rem; }
.link-url { font-size: 0.9rem; color: #0284c7; word-break: break-all; }
.strength-item { margin-bottom: 1.125rem; }
.strength-title { font-weight: 600; font-size: 0.95rem; }
.strength-desc { margin-top: 0.25rem; font-size: 0.85rem; color: #334155; line-height: 1.6; white-space: pre-line; }
.certificate-list { padding-left: 1.125rem; }
.certificate-list li { font-size: 0.9rem; color: #334155; margin-bottom: 0.5rem; }
.project-item { margin-bottom: 1.25rem; }
.project-name { font-weight: 600; font-size: 0.975rem; color: #0284c7; }
.project-desc { margin-top: 0.25rem; font-size: 0.875rem; color: #334155; line-height: 1.6; white-space: pre-line; }
.project-stack { margin-top: 0.25rem; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; }
.language-item { font-size: 0.9rem; color: #334155; margin-bottom: 0.4rem; }
.interests { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.interest-chip { font-size: 0.85rem; color: #334155; }
.interest-chip:not(:last-child)::after { content: '·'; margin-left: 0.5rem; color: #cbd5e1; }
.achievement-item { margin-bottom: 1.125rem; }
.achievement-title { font-weight: 600; font-size: 0.95rem; }
.achievement-year { font-weight: 400; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
.achievement-desc { margin-top: 0.25rem; font-size: 0.85rem; color: #334155; line-height: 1.6; white-space: pre-line; }
.opensource-item { margin-bottom: 1.25rem; }
.opensource-name { font-weight: 600; font-size: 0.975rem; color: #0284c7; }
.opensource-meta { margin-top: 0.15rem; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; }
.opensource-desc { margin-top: 0.25rem; font-size: 0.875rem; color: #334155; line-height: 1.6; white-space: pre-line; }
.opensource-url { margin-top: 0.25rem; font-size: 0.8rem; color: #334155; word-break: break-all; }
.publication-item { margin-bottom: 1.125rem; }
.publication-title { font-weight: 600; font-size: 0.95rem; }
.publication-meta { margin-top: 0.15rem; font-size: 0.78rem; color: #94a3b8; }
.publication-url { margin-top: 0.25rem; font-size: 0.8rem; color: #334155; word-break: break-all; }
.project-links { margin-top: 0.25rem; font-size: 0.8rem; color: #334155; word-break: break-all; }
.leadership-item { margin-bottom: 1.125rem; }
.leadership-role { font-weight: 600; font-size: 0.95rem; }
.leadership-date { margin-top: 0.15rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; }
.leadership-desc { margin-top: 0.25rem; font-size: 0.85rem; color: #334155; line-height: 1.6; white-space: pre-line; }
.membership-list { padding-left: 1.125rem; }
.membership-list li { font-size: 0.9rem; color: #334155; margin-bottom: 0.5rem; }
.edu-honors { margin-top: 0.15rem; font-size: 0.8rem; color: #334155; font-style: italic; }
.speaking-item { margin-bottom: 1.125rem; }
.speaking-topic { font-weight: 600; font-size: 0.95rem; }
.speaking-meta { margin-top: 0.15rem; font-size: 0.78rem; color: #94a3b8; }
.speaking-audience { margin-top: 0.15rem; font-size: 0.8rem; color: #334155; }
.volunteer-item { margin-bottom: 1.125rem; }
.volunteer-role { font-weight: 600; font-size: 0.95rem; }
.volunteer-desc { margin-top: 0.25rem; font-size: 0.85rem; color: #334155; line-height: 1.6; white-space: pre-line; }
@media print { body { padding: 0; max-width: none; } }
</style>
</head>
<body>
<header>
  <p class="cv-name">${esc(snapshot.fullName || copy.yourName)}</p>
  <p class="cv-job-title">${esc(snapshot.title || copy.professionalTitle)}</p>${snapshot.tagline ? `\n  <p class="cv-tagline">${esc(snapshot.tagline)}</p>` : ''}${contactLine ? `\n  <div class="cv-contact">${contactLine}</div>` : ''}
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

// `previewElement` (Classic mode: ResumeBuilderPage.jsx's dedicated
// off-screen export-source CVPreview; Direct Edit: DirectEditPreview.jsx's)
// already rendered from `hideEmptySections(formData)`, so its DOM never
// contains a template's editing-affordance placeholder ("… will appear
// here") for an empty section in the first place — see
// docs/template-audit-phase2.md F12/I-1 for why this moved upstream of the
// clone instead of pruning `[data-export-section]` nodes out of it here
// after the fact (that ordering is what broke Creative/Editorial's running
// section numbers whenever a middle section was empty).
function createExportSandbox(previewElement, mode, expectedVariant = '') {
  const pdfMode = createPdfMode(mode)
  const exportRoot = resolveExportRoot(previewElement)

  if (!exportRoot) {
    throw new Error('Unable to resolve active export template root.')
  }

  const clone = exportRoot.cloneNode(true)
  const designerContentWidthPx = mmToPx(DESIGNER_PAPER_WIDTH_MM)
  const a4ContentWidthPx = mmToPx(
    A4_WIDTH_MM - pdfMode.marginMm.left - pdfMode.marginMm.right,
  )
  const contentWidthPx = mode === 'designer' ? designerContentWidthPx : a4ContentWidthPx
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
  clone.style.color = '#111111'
  clone.style.setProperty('--app-text', '#111111', 'important')
  clone.style.setProperty('--app-text-muted', 'rgba(17, 17, 17, 0.45)', 'important')

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
    // html2canvas lays the clone out in its own virtual window before
    // cropping to width/height, and that virtual window is what sm:/md:/lg:
    // utility classes evaluate their @media queries against. The clone
    // itself is only as wide as the live preview pane (captureWidth — often
    // well under common breakpoints, e.g. ~615px at 100% zoom in the
    // split-pane layout), but on screen those same classes evaluate against
    // the real browser window, which is almost always wider. Without this,
    // a template can visibly reflow between the live preview and the
    // exported PDF (an experience entry's date column dropping onto its
    // own line, etc.) purely because the capture's virtual window is
    // narrower than the real one was.
    windowWidth: Math.max(captureWidth, window.innerWidth),
    windowHeight: Math.max(captureHeight, window.innerHeight),
    scrollX: 0,
    scrollY: 0,
    imageTimeout: 0,
    ignoreElements: (element) =>
      element?.getAttribute?.('data-export-ignore') === 'true'
      || element?.getAttribute?.('data-export-summary-chip') === 'true',
    ...captureOptions,
  })
}

// html2canvas can reject instead of resolving with a blank canvas — e.g. a
// CSS color function it can't parse throws synchronously during style
// resolution. Folding that into the same "no usable canvas yet" signal as a
// blank capture lets the caller run through its full recapture/fallback
// chain (foreignObjectRendering toggle, then color-normalized retry) instead
// of a single failed attempt skipping straight past it.
async function captureCanvasOrNull(captureRoot, captureOptions) {
  try {
    return await renderCaptureCanvas(captureRoot, captureOptions)
  } catch {
    return null
  }
}

let colorNormalizationContext = null

function getColorNormalizationContext() {
  if (!colorNormalizationContext) {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    colorNormalizationContext = canvas.getContext('2d')
  }
  return colorNormalizationContext
}

// html2canvas 1.x can't parse CSS Color 4 functions (oklch/oklab/lch/lab/
// color/color-mix) — and some browsers (notably Firefox) can report those
// from getComputedStyle even when the source rule only used color-mix() to
// derive an otherwise ordinary color. Round-tripping through a canvas 2D
// context's fillStyle normalizes any of those to a plain rgb()/rgba() string
// html2canvas understands, without changing the color it resolves to.
function normalizeCssColor(value) {
  try {
    const context = getColorNormalizationContext()
    context.fillStyle = '#000000'
    context.fillStyle = value
    return context.fillStyle
  } catch {
    return value
  }
}

const MODERN_COLOR_FUNCTION_PATTERN =
  /(?:oklch|oklab|lch|lab|color-mix|color)\([^()]*(?:\([^()]*\)[^()]*)*\)/gi

function normalizeCssColorFunctions(value) {
  if (!value || !MODERN_COLOR_FUNCTION_PATTERN.test(value)) {
    return value
  }

  MODERN_COLOR_FUNCTION_PATTERN.lastIndex = 0
  return value.replace(MODERN_COLOR_FUNCTION_PATTERN, (match) => normalizeCssColor(match))
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
      if (prop === 'color') {
        return
      }

      const value = computed.getPropertyValue(prop)

      if (value) {
        cloneNode.style.setProperty(prop, normalizeCssColorFunctions(value), 'important')
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

  try {
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
  } catch {
    // A canvas can be "tainted" (e.g. by a cross-origin resource html2canvas
    // drew into it) in a way that only surfaces here, as a SecurityError from
    // getImageData, rather than at draw time. Treat it the same as blank so
    // the caller runs the same recapture/fallback chain instead of crashing.
    return true
  }

  return nonWhitePixelCount === 0
}

// Every `[data-export-section]` also carries `data-export-placement="main"`
// or `"side"` (see each bespoke Showcase's `Section` wrapper). In a
// two-column layout the main column and sidebar are independent content
// streams that merely happen to share the same Y-axis once rasterized onto
// one canvas — a breakpoint that lands cleanly between two sidebar items
// (say, between two certificates) can fall in the middle of a main-column
// card at that exact same Y, and vice-versa. Rather than trying to satisfy
// both streams' rhythms at once (which isn't always possible), the
// page-break decision is driven by the main column only — it typically
// carries the denser, more narrative content a mid-cut is most jarring
// for — and the sidebar is left to fall wherever that decision lands.
// `collectCanvasSectionRanges` (used only to draw a "content continues"
// line under whichever column got cut) is deliberately NOT filtered this
// way, since that cosmetic feature is meant to cover both columns.
function isSidebarPlacedElement(element) {
  return Boolean(element.closest('[data-export-placement="side"]'))
}

function collectCanvasPageBreakpoints(captureRoot, canvas) {
  if (!captureRoot || !canvas) {
    return []
  }

  const sourceHeight = Math.max(captureRoot.scrollHeight, captureRoot.offsetHeight, 1)
  const sourceRect = captureRoot.getBoundingClientRect()
  const scaleY = canvas.height / sourceHeight
  const breakpoints = new Set([0, canvas.height])
  const candidates = Array.from(captureRoot.querySelectorAll(PAGE_BREAK_SELECTOR))
    .filter((element) => !isSidebarPlacedElement(element))

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
  // Main-column only — see `isSidebarPlacedElement`'s comment above.
  const anchors = Array.from(captureRoot.querySelectorAll('[data-export-header], [data-export-section]'))
    .filter((element) => !isSidebarPlacedElement(element))
  const ranges = []

  anchors.forEach((anchor) => {
    const rect = anchor.getBoundingClientRect()
    const top = Math.max(0, Math.round((rect.top - sourceRect.top) * scaleY))
    const bottom = Math.min(canvas.height, Math.round((rect.bottom - sourceRect.top) * scaleY))

    if (bottom > top) {
      ranges.push({ top, bottom })
    }
  })

  if (ranges.length === 0) {
    return [{ top: 0, bottom: canvas.height }]
  }

  ranges.sort((a, b) => a.top - b.top)

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

// For each `[data-export-section]`, maps its own top (canvas px, matching
// the `top` a content block built from that same section will carry) to
// the bottom edge of just its *first child* — the heading/title row every
// template's `Section` wrapper renders before the divider and real body
// content. Used to stop the page-fill logic below from "filling" the tail
// of a page with nothing but an orphaned section heading.
function collectCanvasSectionHeadingBottoms(captureRoot, canvas) {
  const headingBottoms = new Map()

  if (!captureRoot || !canvas) {
    return headingBottoms
  }

  const sourceHeight = Math.max(captureRoot.scrollHeight, captureRoot.offsetHeight, 1)
  const sourceRect = captureRoot.getBoundingClientRect()
  const scaleY = canvas.height / sourceHeight
  // Main-column only, matching `collectCanvasContentBlocks` — a sidebar
  // section's top never appears as a `block.top` for lookup once that
  // filtering is in place, so this mirrors it for consistency.
  const sections = Array.from(captureRoot.querySelectorAll('[data-export-section]'))
    .filter((element) => !isSidebarPlacedElement(element))

  sections.forEach((section) => {
    const sectionRect = section.getBoundingClientRect()
    const sectionTop = Math.max(0, Math.round((sectionRect.top - sourceRect.top) * scaleY))
    const headingEl = section.firstElementChild
    const headingRect = headingEl ? headingEl.getBoundingClientRect() : sectionRect
    const headingBottom = Math.min(
      canvas.height,
      Math.round((headingRect.bottom - sourceRect.top) * scaleY),
    )

    headingBottoms.set(sectionTop, headingBottom)
  })

  return headingBottoms
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

function findFillBreakpoint(breakpoints, blockTop, blockBottom, limitY) {
  let snapY = 0

  for (let index = breakpoints.length - 1; index >= 0; index -= 1) {
    const breakpoint = breakpoints[index]

    if (breakpoint <= blockTop) {
      break
    }

    if (breakpoint > limitY || breakpoint > blockBottom) {
      continue
    }

    snapY = breakpoint
    break
  }

  return snapY
}

function buildPageSlicesFromBlocks(pageHeightPx, contentBlocks, breakpoints = [], headingBottoms = new Map()) {
  if (!contentBlocks.length) {
    return []
  }

  const pages = []
  let currentPageTop = 0
  let currentPageBottom = 0
  let currentPageHeight = 0

  // A snap-fill breakpoint that lands at or before a section's own heading
  // is worthless — it "fills" the page with a title and divider but none
  // of the section's actual content, orphaning the heading alone at the
  // bottom of one page while everything it introduces starts fresh on the
  // next. Only accept a fill that reaches past the heading. Blocks that
  // aren't a whole section (e.g. a gap-filler) have no entry in
  // `headingBottoms`, so they're unaffected.
  const clearsOrphanedHeading = (snapY, blockTop) => {
    const headingBottom = headingBottoms.get(blockTop)
    return headingBottom === undefined || snapY > headingBottom
  }

  const pushCurrentPage = () => {
    if (currentPageBottom > currentPageTop) {
      pages.push({ top: currentPageTop, bottom: currentPageBottom })
      currentPageTop = currentPageBottom
      currentPageHeight = 0
    }
  }

  // Commits every slice but the last as a finished page, and leaves the
  // last slice as the in-progress page — so a short remainder (e.g. one
  // job entry left over after a snap-fill split) can still be topped up
  // by whatever content block comes next, instead of stranding it alone
  // on an otherwise-empty page.
  const commitSlices = (slices) => {
    if (!slices.length) {
      return
    }

    const lastSlice = slices[slices.length - 1]

    slices.slice(0, -1).forEach((slice) => pages.push(slice))
    currentPageTop = lastSlice.top
    currentPageBottom = lastSlice.bottom
    currentPageHeight = lastSlice.bottom - lastSlice.top
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
        // The whole block (e.g. an Experience section with several entries)
        // doesn't fit in the space left on the current page. Rather than
        // deferring it wholesale — which can strand most of the page blank —
        // snap-fill using an inner breakpoint (e.g. a single job entry) when
        // one exists, then carry the remainder onto later pages.
        const remainingPx = pageHeightPx - currentPageHeight
        const minFillDepth = Math.max(50, Math.floor(pageHeightPx * 0.05))

        if (remainingPx >= minFillDepth) {
          const naturalEnd = currentPageBottom + remainingPx
          const snapY = findFillBreakpoint(breakpoints, block.top, block.bottom, naturalEnd)

          if (snapY >= block.top + minFillDepth && clearsOrphanedHeading(snapY, block.top)) {
            currentPageBottom = snapY
            currentPageHeight = currentPageBottom - currentPageTop
            pushCurrentPage()

            if (currentPageTop < block.bottom) {
              commitSlices(splitRangeIntoSlices(currentPageTop, block.bottom, pageHeightPx, breakpoints))
            }
            return
          }
        }

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

    if (currentPageHeight > 0 && currentPageHeight < pageHeightPx) {
      const remainingPx = pageHeightPx - currentPageHeight
      const naturalEnd = block.top + remainingPx
      const minFillDepth = Math.max(50, Math.floor(pageHeightPx * 0.05))
      const snapY = findFillBreakpoint(breakpoints, block.top, block.bottom, naturalEnd)

      if (snapY >= block.top + minFillDepth && clearsOrphanedHeading(snapY, block.top)) {
        currentPageBottom = Math.max(currentPageBottom, Math.min(snapY, block.bottom))
        currentPageHeight = currentPageBottom - currentPageTop
        pushCurrentPage()
        if (currentPageTop < block.bottom) {
          commitSlices(splitRangeIntoSlices(currentPageTop, block.bottom, pageHeightPx, breakpoints))
        }
        return
      }
    }
    pushCurrentPage()
    commitSlices(splitRangeIntoSlices(block.top, block.bottom, pageHeightPx, breakpoints))
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
  headingBottoms = new Map(),
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
    headingBottoms,
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
      pageCanvas.toDataURL(PDF_PAGE_IMAGE_MIME, PDF_PAGE_IMAGE_QUALITY),
      PDF_PAGE_IMAGE_FORMAT,
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

function createWorkerPageSlices(canvas, pdfMode, breakpoints = [], contentBlocks = [], sectionRanges = [], headingBottoms = new Map()) {
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
    headingBottoms,
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
      imageDataUrl: pageCanvas.toDataURL(PDF_PAGE_IMAGE_MIME, PDF_PAGE_IMAGE_QUALITY),
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
      imageFormat: PDF_PAGE_IMAGE_FORMAT,
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
  const rawPhotoDataUrl = getPhotoDataUrl(snapshot.photo)
  const photoDataUrl = rawPhotoDataUrl ? await cropPhotoDataUrlToSquare(rawPhotoDataUrl) : ''
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
  // Only section lists are read here, so the locale is irrelevant.
  const templateConfig = getEffectiveCvTemplate(templateId, 'en', formData)
  const sectionVisibility = {
    about: true,
    experience: true,
    education: true,
    skills: true,
    links: true,
    coreStrengths: true,
    certificates: true,
    projects: true,
    languages: true,
    interests: true,
    achievements: true,
    openSource: true,
    publications: true,
    leadership: true,
    memberships: true,
    speaking: true,
    volunteering: true,
    internships: true,
    caseStudies: true,
    testimonials: true,
    ...(formData.sectionVisibility ?? {}),
  }
  const templateSectionOrder = [
    ...templateConfig.primarySections,
    ...templateConfig.secondarySections,
  ]
  const sectionOrder = normalizeSectionOrder(formData.sectionOrder, templateSectionOrder)
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
          after: dateRange ? 0.5 : (item.honors ? 0.5 : 1.3),
        })

        if (dateRange) {
          drawFallbackParagraph(pdf, dateRange, cursor, pdfMode.marginMm, palette, {
            subtle: true,
            size: 9.8,
            after: item.honors ? 0.5 : 1.3,
          })
        }

        const gradeLine = [item.grade, item.coursework].filter(Boolean).join(' · ')

        if (item.honors) {
          drawFallbackParagraph(pdf, item.honors, cursor, pdfMode.marginMm, palette, {
            subtle: true,
            size: 9.8,
            after: gradeLine ? 0.5 : 1.3,
          })
        }

        if (gradeLine) {
          drawFallbackParagraph(pdf, gradeLine, cursor, pdfMode.marginMm, palette, {
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

  const renderCoreStrengths = () => {
    drawFallbackSectionHeading(pdf, copy.coreStrengths, cursor, pdfMode.marginMm, palette)
    if (snapshot.coreStrengths.length > 0) {
      snapshot.coreStrengths.forEach((item) => {
        if (item.title) {
          drawFallbackParagraph(pdf, item.title, cursor, pdfMode.marginMm, palette, {
            bold: true,
            size: 10.5,
            after: item.description ? 0.5 : 1.3,
          })
        }
        if (item.description) {
          drawFallbackParagraph(pdf, item.description, cursor, pdfMode.marginMm, palette, {
            size: 10,
            lineHeight: 4.7,
            after: 1.3,
          })
        }
      })
    }
  }

  const renderCertificates = () => {
    drawFallbackSectionHeading(pdf, copy.certificates, cursor, pdfMode.marginMm, palette)
    if (snapshot.certificates.length > 0) {
      drawFallbackBullets(
        pdf,
        snapshot.certificates.map((item) => {
          const meta = [item.issuer, item.year].filter(Boolean).join(', ')
          const expiry = item.expiry ? ` (expires ${item.expiry})` : ''
          return (meta ? `${item.name} — ${meta}` : item.name) + expiry
        }),
        cursor,
        pdfMode.marginMm,
        palette,
      )
    }
  }

  const renderProjects = () => {
    drawFallbackSectionHeading(pdf, copy.projects, cursor, pdfMode.marginMm, palette)
    snapshot.projects.forEach((item) => {
      if (item.name) {
        drawFallbackParagraph(pdf, item.name, cursor, pdfMode.marginMm, palette, {
          bold: true,
          size: 10.5,
          after: 0.5,
        })
      }
      if (item.organization) {
        drawFallbackParagraph(pdf, item.organization, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.8,
          after: 0.5,
        })
      }
      if (item.description) {
        drawFallbackParagraph(pdf, item.description, cursor, pdfMode.marginMm, palette, {
          size: 10,
          lineHeight: 4.7,
          after: 0.5,
        })
      }
      if (item.impact) {
        drawFallbackParagraph(pdf, item.impact, cursor, pdfMode.marginMm, palette, {
          bold: true,
          size: 9.8,
          after: 0.5,
        })
      }
      const contributionLine = [item.teamSize, item.contribution].filter(Boolean).join(' · ')
      if (contributionLine) {
        drawFallbackParagraph(pdf, contributionLine, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.2,
          after: 0.5,
        })
      }
      if (item.stack) {
        drawFallbackParagraph(pdf, item.stack, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.2,
          after: item.githubUrl || item.demoUrl ? 0.5 : 1.3,
        })
      }
      const linkLine = [item.githubUrl, item.demoUrl].filter(Boolean).join('  ·  ')
      if (linkLine) {
        drawFallbackParagraph(pdf, linkLine, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.2,
          after: 1.3,
        })
      }
    })
  }

  const renderLanguages = () => {
    drawFallbackSectionHeading(pdf, copy.languages, cursor, pdfMode.marginMm, palette)
    snapshot.languages.forEach((item) => {
      const line = item.level ? `${item.language} — ${item.level}` : item.language
      drawFallbackParagraph(pdf, line, cursor, pdfMode.marginMm, palette, { size: 10.2, after: 1.1 })
    })
  }

  const renderInterests = () => {
    drawFallbackSectionHeading(pdf, copy.interests, cursor, pdfMode.marginMm, palette)
    if (snapshot.interests.length > 0) {
      drawFallbackParagraph(
        pdf,
        snapshot.interests.map((item) => item.name).join('  ·  '),
        cursor,
        pdfMode.marginMm,
        palette,
        { size: 10.2, after: 1.1 },
      )
    }
  }

  const renderAchievements = () => {
    drawFallbackSectionHeading(pdf, copy.achievements, cursor, pdfMode.marginMm, palette)
    snapshot.achievements.forEach((item) => {
      const heading = item.year ? `${item.title}  —  ${item.year}` : item.title
      if (heading) {
        drawFallbackParagraph(pdf, heading, cursor, pdfMode.marginMm, palette, {
          bold: true,
          size: 10.5,
          after: item.description ? 0.5 : 1.3,
        })
      }
      if (item.description) {
        drawFallbackParagraph(pdf, item.description, cursor, pdfMode.marginMm, palette, {
          size: 10,
          lineHeight: 4.7,
          after: 1.3,
        })
      }
    })
  }

  const renderOpenSource = () => {
    drawFallbackSectionHeading(pdf, copy.openSource, cursor, pdfMode.marginMm, palette)
    snapshot.openSource.forEach((item) => {
      if (item.name) {
        drawFallbackParagraph(pdf, item.name, cursor, pdfMode.marginMm, palette, {
          bold: true,
          size: 10.5,
          after: 0.5,
        })
      }
      const meta = [item.language, item.stars ? `★ ${item.stars}` : '', item.forks ? `⑂ ${item.forks}` : '']
        .filter(Boolean)
        .join('   ')
      if (meta) {
        drawFallbackParagraph(pdf, meta, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.2,
          after: 0.5,
        })
      }
      if (item.description) {
        drawFallbackParagraph(pdf, item.description, cursor, pdfMode.marginMm, palette, {
          size: 10,
          lineHeight: 4.7,
          after: 1.3,
        })
      }
    })
  }

  const renderPublications = () => {
    drawFallbackSectionHeading(pdf, copy.publications, cursor, pdfMode.marginMm, palette)
    snapshot.publications.forEach((item) => {
      if (item.title) {
        drawFallbackParagraph(pdf, item.title, cursor, pdfMode.marginMm, palette, {
          bold: true,
          size: 10.5,
          after: 0.5,
        })
      }
      const meta = [item.publisher, item.year].filter(Boolean).join(' · ')
      if (meta) {
        drawFallbackParagraph(pdf, meta, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.8,
          after: 1.3,
        })
      }
    })
  }

  const renderLeadership = () => {
    drawFallbackSectionHeading(pdf, copy.leadership, cursor, pdfMode.marginMm, palette)
    snapshot.leadership.forEach((item) => {
      const heading = [item.role, item.organization].filter(Boolean).join(' — ')
      if (heading) {
        drawFallbackParagraph(pdf, heading, cursor, pdfMode.marginMm, palette, {
          bold: true,
          size: 10.5,
          after: 0.5,
        })
      }
      const dateRange = formatDateRange(item.startDate, item.endDate)
      if (dateRange) {
        drawFallbackParagraph(pdf, dateRange, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.8,
          after: 0.5,
        })
      }
      if (item.description) {
        drawFallbackParagraph(pdf, item.description, cursor, pdfMode.marginMm, palette, {
          size: 10,
          lineHeight: 4.7,
          after: 1.3,
        })
      }
    })
  }

  const renderMemberships = () => {
    drawFallbackSectionHeading(pdf, copy.memberships, cursor, pdfMode.marginMm, palette)
    if (snapshot.memberships.length > 0) {
      drawFallbackBullets(
        pdf,
        snapshot.memberships.map((item) => {
          const meta = [item.role, item.year].filter(Boolean).join(', ')
          return meta ? `${item.organization} — ${meta}` : item.organization
        }),
        cursor,
        pdfMode.marginMm,
        palette,
      )
    }
  }

  const renderSpeaking = () => {
    drawFallbackSectionHeading(pdf, copy.speaking, cursor, pdfMode.marginMm, palette)
    snapshot.speaking.forEach((item) => {
      if (item.topic) {
        drawFallbackParagraph(pdf, item.topic, cursor, pdfMode.marginMm, palette, {
          bold: true,
          size: 10.5,
          after: 0.5,
        })
      }
      const meta = [item.conference, item.date].filter(Boolean).join(' · ')
      if (meta) {
        drawFallbackParagraph(pdf, meta, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.8,
          after: item.audience ? 0.5 : 1.3,
        })
      }
      if (item.audience) {
        drawFallbackParagraph(pdf, item.audience, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.8,
          after: 1.3,
        })
      }
    })
  }

  const renderVolunteering = () => {
    drawFallbackSectionHeading(pdf, copy.volunteering, cursor, pdfMode.marginMm, palette)
    snapshot.volunteering.forEach((item) => {
      const heading = [item.role, item.organization].filter(Boolean).join(' — ')
      if (heading) {
        drawFallbackParagraph(pdf, heading, cursor, pdfMode.marginMm, palette, {
          bold: true,
          size: 10.5,
          after: item.description ? 0.5 : 1.3,
        })
      }
      if (item.description) {
        drawFallbackParagraph(pdf, item.description, cursor, pdfMode.marginMm, palette, {
          size: 10,
          lineHeight: 4.7,
          after: 1.3,
        })
      }
    })
  }

  const renderInternships = () => {
    drawFallbackSectionHeading(pdf, copy.internships, cursor, pdfMode.marginMm, palette)
    snapshot.internships.forEach((item) => {
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
          after: item.technologies ? 0.5 : 1.5,
        })
      }

      if (item.technologies) {
        drawFallbackParagraph(pdf, item.technologies, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.2,
          after: 1.3,
        })
      }
    })
  }

  const renderCaseStudies = () => {
    drawFallbackSectionHeading(pdf, copy.caseStudies, cursor, pdfMode.marginMm, palette)
    snapshot.caseStudies.forEach((item) => {
      if (item.title) {
        drawFallbackParagraph(pdf, item.title, cursor, pdfMode.marginMm, palette, {
          bold: true,
          size: 10.5,
          after: 0.6,
        })
      }
      const rows = [
        [copy.problem, item.problem],
        [copy.solution, item.solution],
        [copy.technologies, item.technologies],
        [copy.outcome, item.outcome],
        [copy.lessonsLearned, item.lessons],
      ].filter(([, value]) => value)

      rows.forEach(([label, value], rowIndex) => {
        drawFallbackParagraph(pdf, `${label}: ${value}`, cursor, pdfMode.marginMm, palette, {
          size: 10,
          lineHeight: 4.7,
          after: rowIndex === rows.length - 1 ? 1.3 : 0.5,
        })
      })
    })
  }

  const renderTestimonials = () => {
    drawFallbackSectionHeading(pdf, copy.testimonials, cursor, pdfMode.marginMm, palette)
    snapshot.testimonials.forEach((item) => {
      if (item.quote) {
        drawFallbackParagraph(pdf, `“${item.quote}”`, cursor, pdfMode.marginMm, palette, {
          size: 10.3,
          lineHeight: 4.85,
          after: 0.5,
        })
      }
      const meta = [item.author, item.role].filter(Boolean).join(', ')
      if (meta) {
        drawFallbackParagraph(pdf, meta, cursor, pdfMode.marginMm, palette, {
          subtle: true,
          size: 9.8,
          after: 1.3,
        })
      }
    })
  }

  const sectionRenderers = {
    about: renderAbout,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
    links: renderLinks,
    coreStrengths: renderCoreStrengths,
    certificates: renderCertificates,
    projects: renderProjects,
    languages: renderLanguages,
    interests: renderInterests,
    achievements: renderAchievements,
    openSource: renderOpenSource,
    publications: renderPublications,
    leadership: renderLeadership,
    memberships: renderMemberships,
    speaking: renderSpeaking,
    volunteering: renderVolunteering,
    internships: renderInternships,
    caseStudies: renderCaseStudies,
    testimonials: renderTestimonials,
  }

  const renderedSections = new Set()

  sectionOrder.forEach((section) => {
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
    let canvas = await captureCanvasOrNull(captureRoot, {
      foreignObjectRendering: false,
    })

    if (!canvas || isCanvasLikelyBlank(canvas)) {
      canvas = await captureCanvasOrNull(captureRoot, {
        foreignObjectRendering: true,
      })
    }

    if (!canvas || isCanvasLikelyBlank(canvas)) {
      applyComputedColorFallbackStyles(exportRoot, clone)
      canvas = await captureCanvasOrNull(captureRoot, {
        foreignObjectRendering: false,
      })
    }

    if ((!canvas || isCanvasLikelyBlank(canvas)) && options.formData) {
      await exportCvAsPdfTextFallback(
        options.formData,
        fileName,
        mode,
        options.template,
        options.locale === 'fi' ? 'fi' : 'en',
      )
      return
    }

    if (!canvas || canvas.width <= 0 || canvas.height <= 0) {
      throw new Error('Captured preview is empty. Open preview and try exporting again.')
    }

    const breakpoints = collectCanvasPageBreakpoints(captureRoot, canvas)
    const contentBlocks = collectCanvasContentBlocks(captureRoot, canvas)
    const sectionRanges = collectCanvasSectionRanges(captureRoot, canvas)
    const headingBottoms = collectCanvasSectionHeadingBottoms(captureRoot, canvas)
    const exportName =
      mode === 'designer' ? fileName : `${fileName}-${createPdfMode(mode).fileSuffix}`
    const workerPages = createWorkerPageSlices(
      canvas,
      pdfMode,
      breakpoints,
      contentBlocks,
      sectionRanges,
      headingBottoms,
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

      addCanvasPagesToPdf(pdf, canvas, pdfMode, breakpoints, contentBlocks, sectionRanges, headingBottoms)
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
