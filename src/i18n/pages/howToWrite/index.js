import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the How to write a CV guide, read whole with copy(locale); imported only by
// HowToWriteACvPage.jsx, so it stays in that page's chunk.
export const howToWritePage = createNamespace('pages/howToWrite', { en, fi }, { kind: 'page', locales: ['en', 'fi'] })
