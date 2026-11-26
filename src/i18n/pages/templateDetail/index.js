import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of each template page's own UI (the per-template copy stays in templatePageCopy.js), read whole with copy(locale); imported only by
// TemplateDetailPage.jsx, so it stays in that page's chunk.
export const templateDetailPage = createNamespace('pages/templateDetail', { en, fi }, { kind: 'page' })
