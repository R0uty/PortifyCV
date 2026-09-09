import Modal from './Modal'
import ToggleSwitch from './fields/ToggleSwitch'
import { getTemplateAccent } from '../utils/cvTemplates'
import { getAccentSwatches } from '../utils/templateAccents'

function SettingsModal({
  isOpen,
  onClose,
  locale = 'en',
  atsFriendlyMode,
  onToggleAtsFriendlyMode,
  onManageSections,
  sessionRestoreEnabled,
  onToggleSessionRestore,
  selectedTemplate,
  templateAccentColors,
  onTemplateAccentColorChange,
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

      {(() => {
        const accentConfig = getTemplateAccent(selectedTemplate)
        if (!accentConfig) return null
        const active = templateAccentColors[selectedTemplate] ?? accentConfig.default
        return (
          <div className="settings-row">
            <div>
              <p className="settings-row__label">{isFinnish ? 'Aksenttiväri' : 'Accent color'}</p>
              <p className="settings-row__hint">
                {isFinnish
                  ? 'Väri näkyy nimessä, otsikoissa ja aksenteissa.'
                  : 'Colors the name, headings, and accents.'}
              </p>
            </div>
            <div className="settings-swatch-row" role="group" aria-label={isFinnish ? 'Aksenttiväri' : 'Accent color'}>
              {getAccentSwatches(accentConfig.swatchSet).map((swatch) => {
                // Compare case-insensitively: a template's `accent.default`
                // and its swatch-set entries can differ only in hex case
                // (e.g. Modern Orange's default `#F28C00` vs the warm set's
                // `#f28c00`), which should still read as the same swatch.
                const isActive = swatch.color.toLowerCase() === active.toLowerCase()
                return (
                  <button
                    key={swatch.color}
                    type="button"
                    className={`settings-swatch${isActive ? ' settings-swatch--active' : ''}`}
                    style={{ backgroundColor: swatch.color }}
                    aria-pressed={isActive}
                    aria-label={swatch.label[locale] ?? swatch.label.en}
                    title={swatch.label[locale] ?? swatch.label.en}
                    onClick={() => onTemplateAccentColorChange(swatch.color)}
                  />
                )
              })}
            </div>
          </div>
        )
      })()}
    </Modal>
  )
}

export default SettingsModal
