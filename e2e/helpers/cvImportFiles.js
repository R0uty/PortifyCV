import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph } from 'docx'

// Real files for the CV file import tests, written with the same two
// libraries the app exports with, so nothing binary is checked in.

/** A one-page text PDF, one line of text per entry. */
export function makePdf(lines) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  pdf.setFontSize(11)
  lines.forEach((line, index) => pdf.text(line, 56, 64 + index * 18))
  return Buffer.from(pdf.output('arraybuffer'))
}

/** A .docx with one paragraph per entry. */
export function makeDocx(lines) {
  return Packer.toBuffer(new Document({ sections: [{ children: lines.map((line) => new Paragraph(line)) }] }))
}

export const PDF_MIME = 'application/pdf'
export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
