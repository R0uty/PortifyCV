import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of About, read whole with copy(locale); imported only by
// AboutPage.jsx, so it stays in that page's chunk.
export const aboutPage = createNamespace('pages/about', { en, fi }, { kind: 'page' })
