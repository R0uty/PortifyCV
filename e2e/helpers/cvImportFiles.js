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

/** A sidebar on the left, the name and the main column on the right. */
export function makeTwoColumnPdf({ name, main, sidebar }) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  pdf.setFontSize(24)
  pdf.text(name, 220, 64)
  pdf.setFontSize(10)
  main.forEach((line, index) => pdf.text(line, 220, 100 + index * 16))
  sidebar.forEach((line, index) => pdf.text(line, 40, 104 + index * 15))
  return Buffer.from(pdf.output('arraybuffer'))
}

/** A .docx with one paragraph per entry. */
export function makeDocx(lines) {
  return Packer.toBuffer(new Document({ sections: [{ children: lines.map((line) => new Paragraph(line)) }] }))
}

export const PDF_MIME = 'application/pdf'
export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
