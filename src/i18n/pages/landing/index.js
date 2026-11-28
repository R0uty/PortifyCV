import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the front page, read whole with copy(locale); imported only by
// LandingPage.jsx and its templates section (LandingTemplatesByField.jsx,
// which reads templateCardAlt with t()). LandingPage is in the entry chunk,
// so this is too, as its text was before.
export const landingPage = createNamespace('pages/landing', { en, fi }, { kind: 'page', locales: ['en', 'fi'] })
