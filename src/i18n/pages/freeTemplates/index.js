import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the Free CV Templates page, read whole with copy(locale); imported only by
// FreeCvTemplatesPage.jsx, so it stays in that page's chunk.
export const freeTemplatesPage = createNamespace('pages/freeTemplates', { en, fi }, { kind: 'page' })
