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
} from 'docx'
import { cropPhotoDataUrlToSquare, getPhotoDataUrl } from './exporters'
import { formatDateRange, formatLinkLabel, formatLinkDisplayValue } from './shared'

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
                  type: 'jpg',
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
  const lines = snapshot.languages.map((item) => plainLine(item.level ? `${item.language} — ${item.level}` : item.language))
  return [sectionHeading(copy.languages), ...lines]
}

export function buildInterestsSection(snapshot, copy) {
  if (snapshot.interests.length === 0) {
    return [sectionHeading(copy.interests)]
  }
  return [sectionHeading(copy.interests), plainLine(snapshot.interests.map((item) => item.name).join('  ·  '))]
}

export function buildCoreStrengthsSection(snapshot, copy) {
  const entries = snapshot.coreStrengths.flatMap((item) => [
    boldLine(item.title),
    plainLine(item.description),
  ].filter(Boolean))
  return [sectionHeading(copy.coreStrengths), ...entries]
}

export function buildCertificatesSection(snapshot, copy) {
  if (snapshot.certificates.length === 0) {
    return [sectionHeading(copy.certificates)]
  }
  const lines = snapshot.certificates.map((item) => {
    const meta = [item.issuer, item.year].filter(Boolean).join(', ')
    const expiry = item.expiry ? ` (expires ${item.expiry})` : ''
    return (meta ? `${item.name} — ${meta}` : item.name) + expiry
  })
  return [sectionHeading(copy.certificates), ...bulletLines(lines)]
}

export function buildAchievementsSection(snapshot, copy) {
  const entries = snapshot.achievements.flatMap((item) => {
    const heading = item.year ? `${item.title}  —  ${item.year}` : item.title
    return [boldLine(heading), plainLine(item.description)].filter(Boolean)
  })
  return [sectionHeading(copy.achievements), ...entries]
}

export function buildMembershipsSection(snapshot, copy) {
  if (snapshot.memberships.length === 0) {
    return [sectionHeading(copy.memberships)]
  }
  const lines = snapshot.memberships.map((item) => {
    const meta = [item.role, item.year].filter(Boolean).join(', ')
    return meta ? `${item.organization} — ${meta}` : item.organization
  })
  return [sectionHeading(copy.memberships), ...bulletLines(lines)]
}

export function buildPublicationsSection(snapshot, copy) {
  const entries = snapshot.publications.flatMap((item) => {
    const meta = [item.publisher, item.year].filter(Boolean).join(' · ')
    return [
      boldLine(item.title),
      meta ? plainLine(meta, { subtle: true, size: META_SIZE }) : null,
    ].filter(Boolean)
  })
  return [sectionHeading(copy.publications), ...entries]
}
