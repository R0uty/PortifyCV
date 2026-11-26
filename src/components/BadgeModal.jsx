import { useMemo } from 'react'

import Modal from './Modal'
import { buildPortifyCvBadgeSnippet } from '../utils/badge'
import { getUiTheme } from '../utils/designSystem'
import { dialogs } from '../i18n/dialogs/index.js'

function BadgeModal({ isOpen, onClose, locale = 'en', onCopy }) {
  const ui = useMemo(() => getUiTheme(), [])
  const t = (key, vars) => dialogs.t(locale, key, vars)
  const snippet = useMemo(() => buildPortifyCvBadgeSnippet(locale), [locale])

  return (
    <Modal closeLabel={t('common.close')}
      isOpen={isOpen}
      onClose={onClose}
      title={t('badge.title')}
      description={t('badge.description')}
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
          {t('badge.snippet')}
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
        className={`mt-3 ui-button ${ui.buttonActive}`}
        onClick={() => onCopy(snippet)}
      >
        {t('badge.copy')}
      </button>
    </Modal>
  )
}

export default BadgeModal
