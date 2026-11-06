// Reads the text and links jsPDF writes into an exported PDF. Its content
// streams aren't compressed, so both can be read straight out of the file.
const unescapePdf = (value) => value.replace(/\\([()\\])/g, '$1')

export const pdfText = (pdf) => [...pdf.matchAll(/\(((?:[^()\\]|\\.)*)\)\s*Tj/g)]
  .map((match) => unescapePdf(match[1]))
  .join(' ')
  .replace(/\s+/g, ' ')

export const pdfLinks = (pdf) => [...pdf.matchAll(/\/URI \(((?:[^()\\]|\\.)*)\)/g)].map((match) => unescapePdf(match[1]))
