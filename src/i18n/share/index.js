import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'

// The share page's own text, in its lazy chunk. The bad-link message takes
// the app's language; everything around a CV takes the CV's language
// (resolveCvLocale), like the CV itself.
export const share = createNamespace('share', { en, fi })
