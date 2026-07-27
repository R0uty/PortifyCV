import Modal from './Modal'
import ToggleSwitch from './fields/ToggleSwitch'

const THEME_OPTIONS = [
  { id: 'light', en: 'Light', fi: 'Vaalea' },
  { id: 'dark', en: 'Dark', fi: 'Tumma' },
  { id: 'system', en: 'System', fi: 'Järjestelmä' },
]

function SettingsModal({
  isOpen,
  onClose,
  locale = 'en',
  themePreference,
  onSetThemePreference,
  atsFriendlyMode,
  onToggleAtsFriendlyMode,
  onManageSections,
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
          <p className="settings-row__label">{isFinnish ? 'Teema' : 'Theme'}</p>
          <p className="settings-row__hint">
            {isFinnish
              ? 'Vaikuttaa vain työkalun ulkoasuun, ei vietyyn CV:hen.'
              : 'Affects the app chrome only, not the exported CV.'}
          </p>
        </div>
        <div className="settings-segmented" role="radiogroup" aria-label={isFinnish ? 'Teema' : 'Theme'}>
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={themePreference === option.id}
              className={`settings-segmented__option${themePreference === option.id ? ' settings-segmented__option--active' : ''}`}
              onClick={() => onSetThemePreference(option.id)}
            >
              {isFinnish ? option.fi : option.en}
            </button>
          ))}
        </div>
      </div>

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
    </Modal>
  )
}

export default SettingsModal
