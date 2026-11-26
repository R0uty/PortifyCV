import { createNamespace } from '../../index.js'
import en from './en.js'
import fi from './fi.js'

// The text of GuideLayout.jsx (breadcrumb, reading time, "On this page",
// the "try it" box, Related), read whole with copy(locale). Only
// GuideLayout imports it, so it sits in the guide pages' shared chunk.
export const guideLayout = createNamespace('pages/guideLayout', { en, fi }, { kind: 'page' })
