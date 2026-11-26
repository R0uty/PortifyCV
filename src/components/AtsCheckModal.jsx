import ATSScorePanel from './ATSScorePanel'
import CVSuggestionsPanel from './CVSuggestionsPanel'
import Modal from './Modal'
import { dialogs } from '../i18n/dialogs/index.js'

// The ATS score, keyword match and writing suggestions for Direct Edit
// (1.6.80). Classic shows the same two panels in its form column, which
// Direct Edit doesn't render.
function AtsCheckModal({ isOpen, onClose, locale = 'en', feedback, ...atsPanelProps }) {
  const t = (key, vars) => dialogs.t(locale, key, vars)

  return (
    <Modal closeLabel={t('common.close')}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={t('atsCheck.title')}
      description={t('atsCheck.description')}
    >
      <div className="stack-5">
        <ATSScorePanel locale={locale} {...atsPanelProps} />
        <CVSuggestionsPanel feedback={feedback} locale={locale} />
      </div>
    </Modal>
  )
}

export default AtsCheckModal
