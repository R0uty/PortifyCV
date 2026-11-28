import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The copy of the CV skills examples page, read whole with copy(locale); imported only by
// CvSkillsExamplesPage.jsx, so it stays in that page's chunk.
export const cvSkillsPage = createNamespace('pages/cvSkills', { en, fi }, { kind: 'page', locales: ['en', 'fi'] })
