// The PDF's paper sizes and fit modes as the visitor sees them (the values
// are exporters.js's PDF_PAPER_SIZES / PDF_FIT_MODES). Shared by the PDF
// preview and the Mark as applied dialog, so both name them the same way.
// `label` and `hint` are keys in the dialogs namespace (pdfOptions.*):
// read them with dialogs.t(locale, option.label).

export const PAPER_OPTIONS = [
  { value: 'a4', label: 'pdfOptions.paper.a4', hint: 'pdfOptions.paper.a4Hint' },
  { value: 'letter', label: 'pdfOptions.paper.letter', hint: 'pdfOptions.paper.letterHint' },
]

export const FIT_OPTIONS = [
  { value: 'auto', label: 'pdfOptions.fit.auto', hint: 'pdfOptions.fit.autoHint' },
  { value: 'one-page', label: 'pdfOptions.fit.onePage', hint: 'pdfOptions.fit.onePageHint' },
  { value: 'two-pages', label: 'pdfOptions.fit.twoPages', hint: 'pdfOptions.fit.twoPagesHint' },
  { value: 'actual', label: 'pdfOptions.fit.actual', hint: 'pdfOptions.fit.actualHint' },
]
