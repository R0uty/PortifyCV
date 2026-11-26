import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'

// The site shell that App.jsx draws around every content page (header,
// menus, site map, footer, not-found page). App.jsx is the entry chunk, so
// this holds only what the shell shows; a page's own text is its
// `pages/<page>` namespace. Call with the app's language.
export const common = createNamespace('common', { en, fi })
