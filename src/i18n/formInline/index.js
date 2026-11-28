import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'
import sv from './sv.js'

// EditableList.jsx's own text. EditableList is imported by CVPreview and the
// Showcases, so it sits in the CV preview's shared chunk (template pages
// load it too); keeping its few strings here keeps the `form` namespace in
// the builder's chunk.
export const formInline = createNamespace('formInline', { en, fi, sv })
