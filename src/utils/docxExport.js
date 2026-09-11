// Word (.docx) export — the ATS-friendly, one-column, monochrome document
// described in docs/superpowers/specs/2026-09-11-word-export-c1-design.md.
// Every section builder here is a pure function: (snapshot, copy) => a flat
// array of docx Paragraph/Table objects. No DOM, no screenshot, no template
// CSS — the document is assembled straight from the same CvData shape every
// other export reads, via createCvSnapshot. Section coverage, ordering and
// visibility rules mirror exportCvAsPdfTextFallback in exporters.js exactly
// (that function is this module's closest sibling — same data walk, aimed
// at docx objects instead of jsPDF draw calls).

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  convertMillimetersToTwip,
} from 'docx'
// 'file-saver' is CommonJS-only — a named `import { saveAs }` fails under
// plain Node ESM (as used by scripts/check-docx-export.mjs), so this takes
// the same default-import-then-destructure shape as exporters.js.
import fileSaverPkg from 'file-saver'
const { saveAs } = fileSaverPkg
import { defaultTemplateId, getCvTemplate } from './cvTemplates'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from './cvForm'
import { createCvSnapshot } from './cvSnapshot'
import { formatDateRange, formatLinkLabel, formatLinkDisplayValue } from './shared'
import { createExportCopy, cropPhotoDataUrlToSquare, getPhotoDataUrl, getImageFormatFromDataUrl } from './exporters'

// Monochrome by design (see the spec) — no hue anywhere, just tonal
// hierarchy within near-black/gray, the same way the PDF text-fallback uses
// a few shades of one slate tone rather than one flat value.
const INK = '1A1A1A'
const INK_SUBTLE = '666666'

// Run sizes are in half-points (docx convention): 21 = 10.5pt.
const META_SIZE = 20
const NAME_SIZE = 40
const ROLE_SIZE = 24
const BODY_SIZE = 21
const SUBHEAD_SIZE = 22
const HEADING_SIZE = 24

const NO_BORDER = { style: BorderStyle.NONE }
const NO_CELL_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }

function buildIdentityText(snapshot, copy) {
  const nameText = snapshot.fullName || copy.yourName
  const titleText = snapshot.title || copy.professionalTitle
  const contactParts = [snapshot.email, snapshot.phone, snapshot.location].filter(Boolean)

  const paragraphs = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 40 },
      children: [new TextRun({ text: nameText, bold: true, size: NAME_SIZE, color: INK })],
    }),
    new Paragraph({
      spacing: { after: contactParts.length > 0 ? 120 : 240 },
      children: [new TextRun({ text: titleText, size: ROLE_SIZE, color: INK_SUBTLE })],
    }),
  ]

  if (contactParts.length > 0) {
    paragraphs.push(new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun({ text: contactParts.join('  ·  '), size: META_SIZE, color: INK_SUBTLE })],
    }))
  }

  return paragraphs
}

function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// Photo, when the template shows one: a borderless 2-cell table (identity
// text left, photo right) — docx has no flex/grid, this is the standard
// way to float an image beside text without fighting older Word layout
// engines. Skipped entirely (plain paragraphs only) when there's no photo.
export async function buildIdentityBlock(snapshot, copy, includePhoto) {
  const identityParagraphs = buildIdentityText(snapshot, copy)
  const rawPhotoDataUrl = includePhoto ? getPhotoDataUrl(snapshot.photo) : ''

  if (!rawPhotoDataUrl) {
    return identityParagraphs
  }

  const croppedDataUrl = await cropPhotoDataUrlToSquare(rawPhotoDataUrl)
  const photoBytes = dataUrlToUint8Array(croppedDataUrl)
  // cropPhotoDataUrlToSquare can fall back to returning the ORIGINAL,
  // un-cropped data URL unchanged (image load failure, zero-dimension
  // image, or no 2D canvas context) instead of always converting to JPEG —
  // sniff the actual bytes rather than assuming 'jpg' so a PNG upload
  // doesn't get packed into the docx mislabeled as image/jpeg.
  const photoType = getImageFormatFromDataUrl(croppedDataUrl) === 'PNG' ? 'png' : 'jpg'

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              borders: NO_CELL_BORDERS,
              children: identityParagraphs,
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: NO_CELL_BORDERS,
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new ImageRun({
                  type: photoType,
                  data: photoBytes,
                  transformation: { width: 79, height: 79 },
                })],
              })],
            }),
          ],
        }),
      ],
    }),
  ]
}

function sectionHeading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: HEADING_SIZE, color: INK })],
  })
}

function boldLine(text, opts = {}) {
  if (!text) {
    return null
  }
  return new Paragraph({
    spacing: { after: opts.after ?? 40 },
    children: [new TextRun({ text, bold: true, size: opts.size ?? SUBHEAD_SIZE, color: INK })],
  })
}

function plainLine(text, opts = {}) {
  if (!text) {
    return null
  }
  return new Paragraph({
    spacing: { after: opts.after ?? 160 },
    children: [new TextRun({
      text,
      size: opts.size ?? BODY_SIZE,
      color: opts.subtle ? INK_SUBTLE : INK,
      italics: opts.italics ?? false,
    })],
  })
}

function bulletLines(items) {
  return items.map((item) => new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text: item, size: BODY_SIZE, color: INK })],
  }))
}

function emptyNotice(text) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text, size: BODY_SIZE, color: INK_SUBTLE, italics: true })],
  })
}

// Multi-line fields (experience/internship descriptions, etc.) render as
// real bullets when they have more than one line, matching how every DOM
// Showcase already treats these \n-separated fields — a deliberate
// improvement over the PDF text-fallback's single-wrapped-paragraph
// approach (see Global Constraints in the plan).
function descriptionLines(text) {
  if (!text) {
    return []
  }
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  return lines.length > 1 ? bulletLines(lines) : [plainLine(lines[0])]
}

export function buildAboutSection(snapshot, copy) {
  const body = snapshot.about ? plainLine(snapshot.about) : emptyNotice(copy.addSummary)
  return [sectionHeading(copy.about), body]
}

export function buildSkillsSection(snapshot, copy) {
  if (snapshot.skills.length === 0) {
    return [sectionHeading(copy.skills), emptyNotice(copy.addSkills)]
  }
  return [sectionHeading(copy.skills), ...bulletLines(snapshot.skills)]
}

export function buildExperienceSection(snapshot, copy) {
  if (snapshot.experience.length === 0) {
    return [sectionHeading(copy.experience), emptyNotice(copy.noExperience)]
  }
  const entries = snapshot.experience.flatMap((item) => {
    const heading = [item.role, item.company].filter(Boolean).join(' @ ') || copy.untitledRole
    const dateRange = formatDateRange(item.startDate, item.endDate)
    return [
      boldLine(heading),
      dateRange ? plainLine(dateRange, { subtle: true, size: META_SIZE, after: 120 }) : null,
      ...descriptionLines(item.description),
    ].filter(Boolean)
  })
  return [sectionHeading(copy.experience), ...entries]
}

export function buildEducationSection(snapshot, copy) {
  if (snapshot.education.length === 0) {
    return [sectionHeading(copy.education), emptyNotice(copy.noEducation)]
  }
  const entries = snapshot.education.flatMap((item) => {
    const heading = [item.degree, item.school].filter(Boolean).join(', ') || copy.educationEntry
    const dateRange = formatDateRange(item.startDate, item.endDate)
    const gradeLine = [item.grade, item.coursework].filter(Boolean).join(' · ')
    return [
      boldLine(heading),
      dateRange ? plainLine(dateRange, { subtle: true, size: META_SIZE }) : null,
      item.honors ? plainLine(item.honors, { subtle: true, size: META_SIZE }) : null,
      gradeLine ? plainLine(gradeLine, { subtle: true, size: META_SIZE, after: 160 }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.education), ...entries]
}

export function buildLinksSection(snapshot, copy) {
  const links = Object.entries(snapshot.links)
  if (links.length === 0) {
    return [sectionHeading(copy.links), emptyNotice(copy.noLinks)]
  }
  const lines = links.map(([key, value]) => plainLine(`${formatLinkLabel(key)}: ${formatLinkDisplayValue(value)}`))
  return [sectionHeading(copy.links), ...lines]
}

export function buildLanguagesSection(snapshot, copy) {
  if (snapshot.languages.length === 0) {
    return []
  }
  const lines = snapshot.languages.map((item) => plainLine(item.level ? `${item.language} — ${item.level}` : item.language))
  return [sectionHeading(copy.languages), ...lines]
}

export function buildInterestsSection(snapshot, copy) {
  if (snapshot.interests.length === 0) {
    return []
  }
  return [sectionHeading(copy.interests), plainLine(snapshot.interests.map((item) => item.name).join('  ·  '))]
}

export function buildCoreStrengthsSection(snapshot, copy) {
  if (snapshot.coreStrengths.length === 0) {
    return []
  }
  const entries = snapshot.coreStrengths.flatMap((item) => [
    boldLine(item.title),
    plainLine(item.description),
  ].filter(Boolean))
  return [sectionHeading(copy.coreStrengths), ...entries]
}

export function buildCertificatesSection(snapshot, copy) {
  if (snapshot.certificates.length === 0) {
    return []
  }
  const lines = snapshot.certificates.map((item) => {
    const meta = [item.issuer, item.year].filter(Boolean).join(', ')
    const expiry = item.expiry ? ` (expires ${item.expiry})` : ''
    return (meta ? `${item.name} — ${meta}` : item.name) + expiry
  })
  return [sectionHeading(copy.certificates), ...bulletLines(lines)]
}

export function buildAchievementsSection(snapshot, copy) {
  if (snapshot.achievements.length === 0) {
    return []
  }
  const entries = snapshot.achievements.flatMap((item) => {
    const heading = item.year ? `${item.title}  —  ${item.year}` : item.title
    return [boldLine(heading), plainLine(item.description)].filter(Boolean)
  })
  return [sectionHeading(copy.achievements), ...entries]
}

export function buildMembershipsSection(snapshot, copy) {
  if (snapshot.memberships.length === 0) {
    return []
  }
  const lines = snapshot.memberships.map((item) => {
    const meta = [item.role, item.year].filter(Boolean).join(', ')
    return meta ? `${item.organization} — ${meta}` : item.organization
  })
  return [sectionHeading(copy.memberships), ...bulletLines(lines)]
}

export function buildPublicationsSection(snapshot, copy) {
  if (snapshot.publications.length === 0) {
    return []
  }
  const entries = snapshot.publications.flatMap((item) => {
    const meta = [item.publisher, item.year].filter(Boolean).join(' · ')
    return [
      boldLine(item.title),
      meta ? plainLine(meta, { subtle: true, size: META_SIZE }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.publications), ...entries]
}

export function buildProjectsSection(snapshot, copy) {
  if (snapshot.projects.length === 0) {
    return []
  }
  const entries = snapshot.projects.flatMap((item) => {
    const contributionLine = [item.teamSize, item.contribution].filter(Boolean).join(' · ')
    const linkLine = [item.githubUrl, item.demoUrl].filter(Boolean).join('  ·  ')
    return [
      boldLine(item.name),
      item.organization ? plainLine(item.organization, { subtle: true, size: META_SIZE }) : null,
      plainLine(item.description),
      item.impact ? boldLine(item.impact, { size: META_SIZE }) : null,
      contributionLine ? plainLine(contributionLine, { subtle: true, size: META_SIZE }) : null,
      item.stack ? plainLine(item.stack, { subtle: true, size: META_SIZE }) : null,
      linkLine ? plainLine(linkLine, { subtle: true, size: META_SIZE, after: 240 }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.projects), ...entries]
}

export function buildOpenSourceSection(snapshot, copy) {
  if (snapshot.openSource.length === 0) {
    return []
  }
  const entries = snapshot.openSource.flatMap((item) => {
    const meta = [item.language, item.stars ? `★ ${item.stars}` : '', item.forks ? `⑂ ${item.forks}` : '']
      .filter(Boolean)
      .join('   ')
    return [
      boldLine(item.name),
      meta ? plainLine(meta, { subtle: true, size: META_SIZE }) : null,
      plainLine(item.description),
    ].filter(Boolean)
  })
  return [sectionHeading(copy.openSource), ...entries]
}

export function buildLeadershipSection(snapshot, copy) {
  if (snapshot.leadership.length === 0) {
    return []
  }
  const entries = snapshot.leadership.flatMap((item) => {
    const heading = [item.role, item.organization].filter(Boolean).join(' — ')
    const dateRange = formatDateRange(item.startDate, item.endDate)
    return [
      boldLine(heading),
      dateRange ? plainLine(dateRange, { subtle: true, size: META_SIZE }) : null,
      plainLine(item.description),
    ].filter(Boolean)
  })
  return [sectionHeading(copy.leadership), ...entries]
}

export function buildSpeakingSection(snapshot, copy) {
  if (snapshot.speaking.length === 0) {
    return []
  }
  const entries = snapshot.speaking.flatMap((item) => {
    const meta = [item.conference, item.date].filter(Boolean).join(' · ')
    return [
      boldLine(item.topic),
      meta ? plainLine(meta, { subtle: true, size: META_SIZE }) : null,
      item.audience ? plainLine(item.audience, { subtle: true, size: META_SIZE }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.speaking), ...entries]
}

export function buildVolunteeringSection(snapshot, copy) {
  if (snapshot.volunteering.length === 0) {
    return []
  }
  const entries = snapshot.volunteering.flatMap((item) => {
    const heading = [item.role, item.organization].filter(Boolean).join(' — ')
    return [boldLine(heading), plainLine(item.description)].filter(Boolean)
  })
  return [sectionHeading(copy.volunteering), ...entries]
}

export function buildInternshipsSection(snapshot, copy) {
  if (snapshot.internships.length === 0) {
    return []
  }
  const entries = snapshot.internships.flatMap((item) => {
    const heading = [item.role, item.company].filter(Boolean).join(' @ ') || copy.untitledRole
    const dateRange = formatDateRange(item.startDate, item.endDate)
    return [
      boldLine(heading),
      dateRange ? plainLine(dateRange, { subtle: true, size: META_SIZE }) : null,
      ...descriptionLines(item.description),
      item.technologies ? plainLine(item.technologies, { subtle: true, size: META_SIZE }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.internships), ...entries]
}

export function buildCaseStudiesSection(snapshot, copy) {
  if (snapshot.caseStudies.length === 0) {
    return []
  }
  const entries = snapshot.caseStudies.flatMap((item) => {
    const rows = [
      [copy.problem, item.problem],
      [copy.solution, item.solution],
      [copy.technologies, item.technologies],
      [copy.outcome, item.outcome],
      [copy.lessonsLearned, item.lessons],
    ].filter(([, value]) => value)
    return [
      boldLine(item.title),
      ...rows.map(([label, value]) => plainLine(`${label}: ${value}`)),
    ].filter(Boolean)
  })
  return [sectionHeading(copy.caseStudies), ...entries]
}

export function buildTestimonialsSection(snapshot, copy) {
  if (snapshot.testimonials.length === 0) {
    return []
  }
  const entries = snapshot.testimonials.flatMap((item) => {
    const meta = [item.author, item.role].filter(Boolean).join(', ')
    return [
      item.quote ? plainLine(`“${item.quote}”`, { italics: true }) : null,
      meta ? plainLine(meta, { subtle: true, size: META_SIZE, after: 240 }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.testimonials), ...entries]
}

const PAGE_MARGIN_MM = { top: 16, right: 16, bottom: 18, left: 16 }

export async function buildDocxDocument(formData, options = {}) {
  const { template = defaultTemplateId, locale = 'en' } = options
  const snapshot = createCvSnapshot(formData)
  const copy = createExportCopy(locale)
  const templateConfig = getCvTemplate(template)
  const sectionVisibility = { ...createSectionVisibility(), ...(formData.sectionVisibility ?? {}) }
  const templateSectionOrder = [...templateConfig.primarySections, ...templateConfig.secondarySections]
  const sectionOrder = normalizeSectionOrder(formData.sectionOrder, templateSectionOrder)
  const isVisible = (section) => sectionVisibility[section] !== false
  const includePhoto = isPhotoVisibleForTemplate(formData.photoVisibilityByTemplate, templateConfig.id)

  const sectionBuilders = {
    about: () => buildAboutSection(snapshot, copy),
    skills: () => buildSkillsSection(snapshot, copy),
    experience: () => buildExperienceSection(snapshot, copy),
    education: () => buildEducationSection(snapshot, copy),
    links: () => buildLinksSection(snapshot, copy),
    languages: () => buildLanguagesSection(snapshot, copy),
    interests: () => buildInterestsSection(snapshot, copy),
    coreStrengths: () => buildCoreStrengthsSection(snapshot, copy),
    certificates: () => buildCertificatesSection(snapshot, copy),
    achievements: () => buildAchievementsSection(snapshot, copy),
    memberships: () => buildMembershipsSection(snapshot, copy),
    publications: () => buildPublicationsSection(snapshot, copy),
    projects: () => buildProjectsSection(snapshot, copy),
    openSource: () => buildOpenSourceSection(snapshot, copy),
    leadership: () => buildLeadershipSection(snapshot, copy),
    speaking: () => buildSpeakingSection(snapshot, copy),
    volunteering: () => buildVolunteeringSection(snapshot, copy),
    internships: () => buildInternshipsSection(snapshot, copy),
    caseStudies: () => buildCaseStudiesSection(snapshot, copy),
    testimonials: () => buildTestimonialsSection(snapshot, copy),
  }

  const renderedSections = new Set()
  const children = [...(await buildIdentityBlock(snapshot, copy, includePhoto))]

  const appendSection = (section) => {
    const build = sectionBuilders[section]
    if (build && !renderedSections.has(section) && isVisible(section)) {
      children.push(...build())
      renderedSections.add(section)
    }
  }

  sectionOrder.forEach(appendSection)
  Object.keys(sectionBuilders).forEach(appendSection)

  return new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: convertMillimetersToTwip(210),
            height: convertMillimetersToTwip(297),
          },
          margin: {
            top: convertMillimetersToTwip(PAGE_MARGIN_MM.top),
            right: convertMillimetersToTwip(PAGE_MARGIN_MM.right),
            bottom: convertMillimetersToTwip(PAGE_MARGIN_MM.bottom),
            left: convertMillimetersToTwip(PAGE_MARGIN_MM.left),
          },
        },
      },
      children,
    }],
  })
}

export async function exportCvAsDocx(formData, fileName, options = {}) {
  const doc = await buildDocxDocument(formData, options)
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${fileName}.docx`)
}
