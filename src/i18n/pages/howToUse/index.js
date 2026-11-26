import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the builder guide, read whole with copy(locale); imported only by
// HowToUseTheBuilderPage.jsx, so it stays in that page's chunk.
export const howToUsePage = createNamespace('pages/howToUse', { en, fi }, { kind: 'page' })
