import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the developer CV examples page, read whole with copy(locale); imported only by
// DeveloperCvExamplesPage.jsx, so it stays in that page's chunk.
export const developerCvPage = createNamespace('pages/developerCv', { en, fi }, { kind: 'page', locales: ['en', 'fi'] })
