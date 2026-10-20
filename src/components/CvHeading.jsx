import { useContext } from 'react'
import { DecorativeHeadingsContext } from './cvHeadingContext'

// A CV's own heading (its name, a section title). A real <h1>-<h4>
// normally; a <div data-cv-heading="hN"> inside DecorativeHeadingsContext,
// styled to match the heading it replaces (tokens.css).
export default function CvHeading({ as: Tag = 'h2', ...props }) {
  const decorative = useContext(DecorativeHeadingsContext)

  return decorative ? <div data-cv-heading={Tag} {...props} /> : <Tag {...props} />
}
