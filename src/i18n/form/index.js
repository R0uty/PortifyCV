import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'

// The editing form and Direct Edit's popup (CVForm.jsx,
// SectionEditorPopup.jsx, fields/*, sectionSchema.js's labels), all in the
// builder's lazy chunk. EditableList.jsx sits in the CV preview's shared
// chunk and has its own small namespace, `formInline`. Call with the app's
// language (`locale`).
export const form = createNamespace('form', { en, fi })
