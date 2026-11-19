import { createContext, useContext } from 'react'

// The CV's own language (1.7.5's formData.cvLanguage, resolved) for the
// fields the CV is typed into (1.7.7). The builder provides it around Classic's
// form and Direct Edit's preview; outside it (marketing pages, dialogs about
// the app) there is none and fields keep the page's language.
//
// A field inside it gets `lang`, so the browser checks its spelling in the
// CV's language (a Finnish CV in the English builder is checked in Finnish)
// and a screen reader reads it in that language.
export const CvLanguageContext = createContext(null)

// Where a spell checker only underlines correct text: people's and
// organisations' names, tech names, contact details, links, numbers and
// dates. Field names are cvForm.js's (root and entry fields alike).
const NO_SPELLING_INPUT_TYPES = new Set(['email', 'url', 'tel', 'month', 'date', 'number'])
const NO_SPELLING_FIELDS = /^(fullName|email|phone|link|url|website|company|school|issuer|organization|publisher|conference|author|stack|technologies|grade|year|date|expiry|forks|stars|teamSize)$|Date$|Url$/

/**
 * Props for a control holding CV text: { lang, spellCheck }, or {} outside
 * the builder.
 * @param {{ type?: string, field?: string, spellCheck?: boolean }} [options]
 */
export function useCvTextProps({ type, field, spellCheck } = {}) {
  const lang = useContext(CvLanguageContext)
  if (!lang) return {}
  return {
    lang,
    spellCheck: spellCheck ?? !(NO_SPELLING_INPUT_TYPES.has(type) || (field ? NO_SPELLING_FIELDS.test(field) : false)),
  }
}
