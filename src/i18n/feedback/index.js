import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'
import sv from './sv.js'

// The CV checks' messages (cvFeedback.js, atsScore.js, ATSScorePanel.jsx,
// CVSuggestionsPanel.jsx) and cvTextImport.js's error, all in the builder's
// chunks (cvTextImport.js is lazy, reached from the builder only). Plain
// functions: check:feedback and check:cv-import run these modules in Node.
// Call with the app's language, as the checks always have.
export const feedback = createNamespace('feedback', { en, fi, sv })
