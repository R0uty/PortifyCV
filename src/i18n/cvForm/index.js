import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'

// Imported only by src/utils/cvForm.js (in the entry chunk; the CV page's
// own text is the `cv` namespace, outside it).
export const cvFormText = createNamespace('cvForm', { en, fi })
