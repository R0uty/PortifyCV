import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the CV examples hub, read whole with copy(locale); imported only by
// CvExamplesHubPage.jsx, so it stays in that page's chunk.
export const cvExamplesPage = createNamespace('pages/cvExamples', { en, fi }, { kind: 'page', locales: ['en', 'fi'] })
