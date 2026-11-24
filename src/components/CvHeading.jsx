import { useContext } from 'react'
import { CvIsPageContext, DecorativeHeadingsContext } from './cvHeadingContext'

// A CV's own heading (its name, a section title). A real <h1>-<h4>
// normally; a <div data-cv-heading="hN"> inside DecorativeHeadingsContext,
// styled to match the heading it replaces (tokens.css). Inside
// CvIsPageContext the name (data-cv-name) is always an <h1>; every
// template's name sets its own size and weight, so the tag doesn't
// change its look.
export default function CvHeading({ as = 'h2', ...props }) {
  const decorative = useContext(DecorativeHeadingsContext)
  const isPage = useContext(CvIsPageContext)
  const Tag = isPage && props['data-cv-name'] !== undefined ? 'h1' : as

  return decorative ? <div data-cv-heading={Tag} {...props} /> : <Tag {...props} />
}
