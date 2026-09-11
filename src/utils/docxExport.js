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

// Monochrome by design (see the spec) — no hue anywhere, just tonal
// hierarchy within near-black/gray, the same way the PDF text-fallback uses
// a few shades of one slate tone rather than one flat value.
const INK = '1A1A1A'
const INK_SUBTLE = '666666'

// Run sizes are in half-points (docx convention): 21 = 10.5pt.
const META_SIZE = 20
const NAME_SIZE = 40
const ROLE_SIZE = 24

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
