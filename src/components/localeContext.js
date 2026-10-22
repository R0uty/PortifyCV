import { createContext } from 'react'

// The language of the page being shown (1.6.35). InternalNavLink reads it
// to point every in-app link at that language's address (/fi/… on a
// Finnish page), so the ~30 places that link with English ROUTES paths
// don't each need to know about Finnish URLs.
export const LocaleContext = createContext('en')
