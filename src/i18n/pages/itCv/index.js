import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the IT CV examples page, read whole with copy(locale); imported only by
// ItCvExamplesPage.jsx, so it stays in that page's chunk.
export const itCvPage = createNamespace('pages/itCv', { en, fi }, { kind: 'page' })
