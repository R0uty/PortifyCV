import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'
import sv from './sv.js'

// Imported by src/utils/cvForm.js and src/utils/sectionSchema.js (both in
// the entry chunk; the CV page's
// own text is the `cv` namespace, outside it).
export const cvFormText = createNamespace('cvForm', { en, fi, sv })
