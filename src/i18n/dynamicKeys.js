// Keys built at runtime, e.g. ns.t(locale, `sections.${id}`). check:i18n
// counts every key under `${prefix}.` as used, and requires a key
// `${prefix}.${id}` in `namespace` for every id. Import `ids` from the app
// module that owns them (section ids, template ids), so a new id without a
// key fails the check.
//
//   { namespace: 'cv', prefix: 'sections', ids: SECTION_IDS }
import { CV_SECTION_ORDER_KEYS, createEmptyLinks } from '../utils/cvForm.js'

const LINK_KEYS = Object.keys(createEmptyLinks())

export const DYNAMIC_KEYS = [
  // cvForm.js's getSectionVisibilityFields and getLinkFields.
  { namespace: 'cvForm', prefix: 'sections', ids: CV_SECTION_ORDER_KEYS },
  { namespace: 'cvForm', prefix: 'linkLabels', ids: LINK_KEYS },
  { namespace: 'cvForm', prefix: 'linkPlaceholders', ids: LINK_KEYS },
]
