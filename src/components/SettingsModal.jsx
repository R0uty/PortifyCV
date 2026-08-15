import Modal from './Modal'
import ToggleSwitch from './fields/ToggleSwitch'

function SettingsModal({
  isOpen,
  onClose,
  locale = 'en',
  atsFriendlyMode,
  onToggleAtsFriendlyMode,
  onManageSections,
  sessionRestoreEnabled,
  onToggleSessionRestore,
}) {
  const isFinnish = locale === 'fi'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isFinnish ? 'Asetukset' : 'Settings'}
      description={isFinnish
        ? 'Muutokset päivittyvät esikatseluun välittömästi.'
        : 'Changes apply to the live preview instantly.'}
    >
      <div className="settings-row">
        <div>
          <p className="settings-row__label">{isFinnish ? 'ATS-ystävällinen tila' : 'ATS-friendly mode'}</p>
          <p className="settings-row__hint">
            {isFinnish
              ? 'Yksinkertaistaa esikatselun muotoilun jäsentelyohjelmia varten.'
              : 'Simplifies the preview formatting for applicant-tracking parsers.'}
          </p>
        </div>
        <ToggleSwitch checked={atsFriendlyMode} onChange={onToggleAtsFriendlyMode} />
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row__label">{isFinnish ? 'Osioiden järjestys ja näkyvyys' : 'Section order & visibility'}</p>
          <p className="settings-row__hint">
            {isFinnish
              ? 'Raahaa osioita, piilota tai näytä niitä poistamatta tietoja.'
              : 'Drag sections to reorder, or hide/show them without deleting data.'}
          </p>
        </div>
        <button type="button" className="settings-link" onClick={onManageSections}>
          {isFinnish ? 'Hallinnoi' : 'Manage'}
        </button>
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row__label">{isFinnish ? 'Palauta viimeisin istunto' : 'Restore last session'}</p>
          <p className="settings-row__hint">
            {isFinnish
              ? 'Pois päältä oletuksena. Päällä ollessaan CV:stäsi pidetään työkopiota vain tässä selainvälilehdessä, jotta vahinkopäivitys ei tuhoa työtäsi — kopio poistuu automaattisesti heti kun suljet välilehden, eikä sitä koskaan lähetetä minnekään.'
              : "Off by default. When on, keeps a working copy of your CV in this browser tab only, so an accidental refresh doesn't lose your work — it's cleared automatically the moment you close the tab and is never sent anywhere."}
          </p>
        </div>
        <ToggleSwitch checked={sessionRestoreEnabled} onChange={onToggleSessionRestore} />
      </div>
    </Modal>
  )
}

export default SettingsModal
