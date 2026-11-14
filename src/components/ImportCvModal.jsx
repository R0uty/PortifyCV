import Modal from './Modal'
import { getUiTheme } from '../utils/designSystem'

// Import for Direct Edit (1.6.80). Classic has the same two imports in its
// form column, which Direct Edit doesn't render, so a JSON backup made
// from the Export menu had no way back in from the default mode.
function ImportCvModal({
  isOpen,
  onClose,
  locale = 'en',
  pastedCvText = '',
  onPastedCvTextChange,
  onPasteImport,
  onImportJson,
  isImporting = false,
  isBusy = false,
}) {
  const isFinnish = locale === 'fi'
  const ui = getUiTheme()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isFinnish ? 'Tuo CV' : 'Import CV'}
      description={isFinnish
        ? 'Tiedosto ja teksti käsitellään selaimessasi. Mitään ei lähetetä minnekään.'
        : 'The file and the text are read in your browser. Nothing is sent anywhere.'}
    >
      <div className="settings-row">
        <div>
          <p className="settings-row__label">{isFinnish ? 'PortifyCV:n JSON-tiedosto' : 'PortifyCV JSON file'}</p>
          <p className="settings-row__hint">
            {isFinnish
              ? 'Vie-valikosta tallennettu varmuuskopio. Korvaa nykyisen CV:n; kumoa-nuoli palauttaa sen.'
              : 'A backup saved from the Export menu. It replaces the current CV; the undo arrow brings that back.'}
          </p>
        </div>
        <button type="button" className="settings-link" disabled={isBusy} onClick={onImportJson}>
          {isImporting
            ? isFinnish ? 'Tuodaan JSON...' : 'Importing JSON...'
            : isFinnish ? 'Tuo JSON' : 'Import JSON'}
        </button>
      </div>

      <div className="settings-row settings-row--stacked">
        <div>
          <p className="settings-row__label">{isFinnish ? 'Liitä CV-teksti' : 'Paste CV text'}</p>
          <p className="settings-row__hint">
            {isFinnish
              ? 'Liitä CV-katkelma nimen, tittelin, taitojen ja lyhyen yhteenvedon tunnistamiseksi.'
              : 'Paste a resume snippet to detect a name, title, skills, and a short summary.'}
          </p>
        </div>
        <textarea
          className={`min-h-32 w-full border px-4 py-3 text-sm transition ${ui.input}`}
          value={pastedCvText}
          disabled={isBusy}
          onChange={onPastedCvTextChange}
          aria-label={isFinnish ? 'Liitetty CV-teksti' : 'Pasted CV text'}
          placeholder={isFinnish
            ? `Matti Meikäläinen\nSenior Product Designer\nTaidot: Figma, käyttäjätutkimus, design systemit`
            : `John Doe\nSenior Product Designer\nSkills: Figma, User Research, Design Systems`}
        />
        <div>
          <button
            type="button"
            className="settings-link"
            disabled={isBusy || !pastedCvText.trim()}
            onClick={onPasteImport}
          >
            {isFinnish ? 'Tuo liitetty teksti' : 'Import pasted text'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ImportCvModal
