import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'
import sv from './sv.js'

// Imported only by src/utils/exporters.js (a lazy chunk; docxExport.js reads
// it through createExportCopy). Call with the CV's language.
export const exportsText = createNamespace('exports', { en, fi, sv })
