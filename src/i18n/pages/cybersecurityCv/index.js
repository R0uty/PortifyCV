import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the cybersecurity CV examples page, read whole with copy(locale); imported only by
// CybersecurityCvExamplesPage.jsx, so it stays in that page's chunk.
export const cybersecurityCvPage = createNamespace('pages/cybersecurityCv', { en, fi }, { kind: 'page' })
