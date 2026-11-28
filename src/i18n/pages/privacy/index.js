import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the privacy policy, read whole with copy(locale); imported only by
// PrivacyPolicyPage.jsx, so it stays in that page's chunk.
export const privacyPage = createNamespace('pages/privacy', { en, fi }, { kind: 'page', locales: ['en', 'fi'] })
