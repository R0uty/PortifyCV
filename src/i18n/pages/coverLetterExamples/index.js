import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the cover letter examples page, read whole with copy(locale); imported only by
// CoverLetterExamplesPage.jsx, so it stays in that page's chunk.
export const coverLetterExamplesPage = createNamespace('pages/coverLetterExamples', { en, fi }, { kind: 'page' })
