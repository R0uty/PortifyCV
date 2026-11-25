import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'

// The builder page's own text (ResumeBuilderPage.jsx and what only it
// loads: the nav rail, Direct Edit's bar and overlay, the entry badge and
// the saved-CV, application and session-restore hooks), in the builder's
// lazy chunk. The toolbar and the leave dialog are in the entry chunk and
// use `builderShell`. Call with the app's language (`locale`), except the
// cover letter's file name, which follows the CV's (`cvLocale`).
export const builder = createNamespace('builder', { en, fi })
