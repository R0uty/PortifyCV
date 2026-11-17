import { Lightbulb } from 'lucide-react'

// The writing hints for one achievement bullet (1.7.3,
// utils/cvFeedback.js's getBulletHints), under the bullet's input. The
// input points at `id` with aria-describedby, so a screen reader reads the
// hint with the field. Shown only while the bullet isn't being typed in;
// the caller decides that.
function BulletHints({ id, hints = [] }) {
  if (hints.length === 0) return null

  return (
    <ul id={id} className="bullet-hints" data-bullet-hints>
      {hints.map((hint) => (
        <li key={hint.id} className="bullet-hints__item" data-hint={hint.id}>
          <Lightbulb size={12} strokeWidth={2} aria-hidden="true" className="bullet-hints__icon" />
          <span>{hint.message}</span>
        </li>
      ))}
    </ul>
  )
}

export default BulletHints
