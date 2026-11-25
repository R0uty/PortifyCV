import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'

// The CV's own text (1.7.13): imported by CVPreview, the Showcases,
// templates/shared.jsx, templates/techExec.js and utils/atsDetails.js, all
// outside the entry chunk. Call cv.t(locale, …) with the CV's language.
export const cv = createNamespace('cv', { en, fi })
