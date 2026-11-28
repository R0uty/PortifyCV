import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'
import sv from './sv.js'

// The builder's parts that App.jsx imports statically, so they sit in the
// entry chunk: the toolbar (Toolbar.jsx), its Style/Font/Headings
// switchers and the leave dialog (LeaveConfirmDialog.jsx). Everything else
// the builder shows is the `builder` namespace, in the builder's own chunk.
// Call with the app's language (the components' `locale` prop).
export const builderShell = createNamespace('builderShell', { en, fi, sv })
