import ATSScorePanel from './ATSScorePanel'
import CVSuggestionsPanel from './CVSuggestionsPanel'
import Modal from './Modal'

// The ATS score, keyword match and writing suggestions for Direct Edit
// (1.6.80). Classic shows the same two panels in its form column, which
// Direct Edit doesn't render.
function AtsCheckModal({ isOpen, onClose, locale = 'en', feedback, ...atsPanelProps }) {
  const isFinnish = locale === 'fi'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isFinnish ? 'ATS-pisteet ja ehdotukset' : 'ATS score & suggestions'}
      description={isFinnish
        ? 'Pisteet riippuvat CV:n sisällöstä ja ATS-tilasta, eivät pohjasta.'
        : 'The score depends on what the CV says and on ATS mode, not on the template.'}
    >
      <div className="stack-5">
        <ATSScorePanel locale={locale} {...atsPanelProps} />
        <CVSuggestionsPanel feedback={feedback} locale={locale} />
      </div>
    </Modal>
  )
}

export default AtsCheckModal
