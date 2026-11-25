import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'

// Imported only by src/utils/coverLetter.js (the builder's chunk, never the
// entry). Call with the letter's language, the CV's (`cvLocale`).
export const letterText = createNamespace('letter', { en, fi })
