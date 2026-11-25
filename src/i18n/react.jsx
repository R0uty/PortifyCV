import { Fragment, useCallback, useContext } from 'react'
import { LocaleContext } from '../components/localeContext'

// t(key, vars) in the page's language (LocaleContext). Text drawn on the CV
// uses the CV's language instead: call ns.t(cvLocale, …) there. (The hook
// shares this file with <T>, as DirectEditContext.jsx does; fast refresh
// reloads the page for it.)
// eslint-disable-next-line react-refresh/only-export-components
export function useT(ns) {
  const locale = useContext(LocaleContext)
  return useCallback((key, vars) => ns.t(locale, key, vars), [ns, locale])
}

const RICH_TAG_RE = /<(\d+)>([\s\S]*?)<\/\1>/g

// A string with numbered tags, 'Read the <0>guide</0>.', rendered with
// parts[0]('guide') in place of the tag (a link, <strong>…). A tag with no
// part renders its inner text.
export function T({ ns, k, vars, parts = [], locale }) {
  const contextLocale = useContext(LocaleContext)
  const text = ns.t(locale ?? contextLocale, k, vars)
  if (typeof text !== 'string') return text
  const nodes = []
  let last = 0
  for (const match of text.matchAll(RICH_TAG_RE)) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const render = parts[Number(match[1])]
    nodes.push(<Fragment key={match.index}>{render ? render(match[2]) : match[2]}</Fragment>)
    last = match.index + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return <>{nodes}</>
}
