import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'
import sv from './sv.js'

// TemplateFieldFilter.jsx's text. The filter sits on the Free CV Templates
// page, the front page's templates-by-field strip and the builder's
// template gallery, so its few strings get their own namespace rather than
// pulling `dialogs` into the marketing pages' chunks. Call with the page's
// language (`locale`).
export const fieldFilter = createNamespace('fieldFilter', { en, fi, sv })
