import { useMemo } from 'react'

import Modal from './Modal'
import { buildPortifyCvBadgeSnippet } from '../utils/badge'
import { getUiTheme } from '../utils/designSystem'

function BadgeModal({ isOpen, onClose, locale = 'en', onCopy }) {
  const ui = useMemo(() => getUiTheme(), [])
  const isFinnish = locale === 'fi'
  const snippet = useMemo(() => buildPortifyCvBadgeSnippet(locale), [locale])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isFinnish ? 'Sisällytettävä tunnus' : 'Embeddable badge'}
      description={isFinnish
        ? 'Liitä tunnus omalle sivustollesi tai portfolioosi. Se on itsenäinen HTML-pätkä, joka toimii missä tahansa.'
        : 'Add the badge to your own site or portfolio. It\'s a self-contained HTML snippet that works anywhere.'}
    >
      <div
        className={`flex items-center justify-center p-6 ${ui.surfaceMuted}`}
        style={{ border: '1px solid var(--app-border)' }}
        // Renders the exact markup the snippet below copies, so what the user
        // sees is what they get — this is app-authored, fixed markup, never
        // user input, so injecting it directly is safe.
        dangerouslySetInnerHTML={{ __html: snippet }}
      />

      <label className="mt-4 flex flex-col gap-1">
        <span className={`text-xs font-bold uppercase tracking-[0.1em] ${ui.textMuted}`}>
          {isFinnish ? 'HTML-pätkä' : 'HTML snippet'}
        </span>
        <textarea
          readOnly
          className={`min-h-32 w-full border px-4 py-3 font-mono text-xs leading-5 transition ${ui.input}`}
          value={snippet}
          onFocus={(event) => event.target.select()}
        />
      </label>

      <button
        type="button"
        className={`mt-3 border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.buttonActive}`}
        onClick={() => onCopy(snippet)}
      >
        {isFinnish ? 'Kopioi HTML' : 'Copy HTML'}
      </button>
    </Modal>
  )
}

export default BadgeModal
