import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the ATS-friendly CV guide, read whole with copy(locale); imported only by
// AtsFriendlyCvGuidePage.jsx, so it stays in that page's chunk.
export const atsGuidePage = createNamespace('pages/atsGuide', { en, fi }, { kind: 'page' })
