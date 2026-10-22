import { useContext } from 'react'
import { LocaleContext } from './localeContext'
import { walkthroughImagePath } from '../utils/thumbnailImages'

// A screenshot of the real builder for one step of "How to use the
// builder", also used by the front page's "How it works" (1.6.50; until
// then hand-drawn line figures). `npm run thumbnails` captures them with
// the demo CV, in the page's language; `number` shows the step's number
// on the front page, where nothing else does.
export default function BuilderWalkthroughFigure({ step, label, number = null }) {
  const locale = useContext(LocaleContext)

  return (
    <div className="builder-walkthrough__shot">
      <img
        className="builder-walkthrough__image"
        src={`/${walkthroughImagePath(step, locale)}`}
        width="960"
        height="600"
        alt={label}
        loading="lazy"
        decoding="async"
      />
      {number ? <span className="builder-walkthrough__badge" aria-hidden="true">{number}</span> : null}
    </div>
  )
}
