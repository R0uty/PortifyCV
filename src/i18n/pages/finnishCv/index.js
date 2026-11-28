import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the Finnish CV examples page, read whole with copy(locale); imported only by
// FinnishCvExamplesPage.jsx, so it stays in that page's chunk.
export const finnishCvPage = createNamespace('pages/finnishCv', { en, fi }, { kind: 'page', locales: ['en', 'fi'] })
