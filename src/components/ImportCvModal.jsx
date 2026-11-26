import Modal from './Modal'
import { getUiTheme } from '../utils/designSystem'
import { dialogs } from '../i18n/dialogs/index.js'

// Import for Direct Edit (1.6.80). Classic has the same imports in its
// form column, which Direct Edit doesn't render, so a JSON backup made
// from the Export menu had no way back in from the default mode. The first
// row (1.7.0) takes the user's existing CV as a PDF or Word file.
function ImportCvModal({
  isOpen,
  onClose,
  locale = 'en',
  pastedCvText = '',
  onPastedCvTextChange,
  onPasteImport,
  onImportJson,
  onImportCvFile,
  isImporting = false,
  isBusy = false,
}) {
  const t = (key, vars) => dialogs.t(locale, key, vars)
  const ui = getUiTheme()

  return (
    <Modal closeLabel={t('common.close')}
      isOpen={isOpen}
      onClose={onClose}
      title={t('importCv.title')}
      description={t('importCv.description')}
    >
      <div className="settings-row">
        <div>
          <p className="settings-row__label">{t('importCv.uploadLabel')}</p>
          <p className="settings-row__hint">
            {t('importCv.uploadHint')}
          </p>
          <p className="settings-row__hint">
            {t('importCv.linkedInHint')}
          </p>
        </div>
        <button type="button" className="settings-link" disabled={isBusy} onClick={onImportCvFile}>
          {t('importCv.choose')}
        </button>
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row__label">{t('importCv.jsonLabel')}</p>
          <p className="settings-row__hint">
            {t('importCv.jsonHint')}
          </p>
        </div>
        <button type="button" className="settings-link" disabled={isBusy} onClick={onImportJson}>
          {isImporting ? t('importCv.importingJson') : t('importCv.importJson')}
        </button>
      </div>

      <div className="settings-row settings-row--stacked">
        <div>
          <p className="settings-row__label">{t('importCv.pasteLabel')}</p>
          <p className="settings-row__hint">
            {t('importCv.pasteHint')}
          </p>
        </div>
        <textarea
          className={`min-h-32 w-full border px-4 py-3 text-sm transition ${ui.input}`}
          value={pastedCvText}
          disabled={isBusy}
          onChange={onPastedCvTextChange}
          aria-label={t('importCv.pastedAria')}
          placeholder={t('importCv.pastePlaceholder')}
        />
        <div>
          <button
            type="button"
            className="settings-link"
            disabled={isBusy || !pastedCvText.trim()}
            onClick={onPasteImport}
          >
            {t('importCv.importPasted')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ImportCvModal
