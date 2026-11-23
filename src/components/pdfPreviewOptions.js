// The PDF's paper sizes and fit modes as the visitor sees them (the values
// are exporters.js's PDF_PAPER_SIZES / PDF_FIT_MODES). Shared by the PDF
// preview and the Mark as applied dialog, so both name them the same way.

export const PAPER_OPTIONS = [
  { value: 'a4', en: 'A4', fi: 'A4', hintEn: '210 × 297 mm', hintFi: '210 × 297 mm' },
  { value: 'letter', en: 'US Letter', fi: 'US Letter', hintEn: '8.5 × 11 in', hintFi: '8,5 × 11 in' },
]

export const FIT_OPTIONS = [
  {
    value: 'auto',
    en: 'Auto',
    fi: 'Automaattinen',
    hintEn: 'Shrinks a little to avoid a nearly empty last page',
    hintFi: 'Pienentää hieman, ettei viimeinen sivu jää lähes tyhjäksi',
  },
  {
    value: 'one-page',
    en: 'Fit to 1 page',
    fi: 'Sovita 1 sivulle',
    hintEn: 'Shrinks the CV onto one page if the text stays readable',
    hintFi: 'Pienentää CV:n yhdelle sivulle, jos teksti pysyy luettavana',
  },
  {
    value: 'two-pages',
    en: 'Fit to 2 pages',
    fi: 'Sovita 2 sivulle',
    hintEn: 'Shrinks the CV onto two pages at most',
    hintFi: 'Pienentää CV:n enintään kahdelle sivulle',
  },
  {
    value: 'actual',
    en: 'Actual size',
    fi: 'Todellinen koko',
    hintEn: 'No shrinking, however many pages it takes',
    hintFi: 'Ei pienennystä, sivuja tulee tarpeen mukaan',
  },
]
