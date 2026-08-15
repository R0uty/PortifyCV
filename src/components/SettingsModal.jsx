import Modal from './Modal'
import ToggleSwitch from './fields/ToggleSwitch'

// Preset swatches for the Modern Timeline template's customizable accent
// color — a small curated set rather than a free-form color input, so
// every choice stays "subtle" per that template's own design brief.
const TIMELINE_ACCENT_SWATCHES = [
  { color: '#6d28d9', label: { en: 'Violet', fi: 'Violetti' } },
  { color: '#2563eb', label: { en: 'Blue', fi: 'Sininen' } },
  { color: '#0d9488', label: { en: 'Teal', fi: 'Sinivihreä' } },
  { color: '#059669', label: { en: 'Emerald', fi: 'Smaragdi' } },
  { color: '#b45309', label: { en: 'Amber', fi: 'Meripihka' } },
  { color: '#be123c', label: { en: 'Rose', fi: 'Ruusu' } },
]

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
  timelineAccentColor,
  onTimelineAccentColorChange,
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

      {selectedTemplate === 'timeline' ? (
        <div className="settings-row">
          <div>
            <p className="settings-row__label">{isFinnish ? 'Aikajanan aksenttiväri' : 'Timeline accent color'}</p>
            <p className="settings-row__hint">
              {isFinnish
                ? 'Vain Moderni aikajana -pohjassa. Väri näkyy nimessä, otsikoissa, aikajanassa ja tunnisteissa.'
                : 'Only for the Modern Timeline template. Colors the name, headings, timeline, and tags.'}
            </p>
          </div>
          <div className="settings-swatch-row" role="group" aria-label={isFinnish ? 'Aikajanan aksenttiväri' : 'Timeline accent color'}>
            {TIMELINE_ACCENT_SWATCHES.map((swatch) => (
              <button
                key={swatch.color}
                type="button"
                className={`settings-swatch${swatch.color === timelineAccentColor ? ' settings-swatch--active' : ''}`}
                style={{ backgroundColor: swatch.color }}
                aria-pressed={swatch.color === timelineAccentColor}
                aria-label={swatch.label[locale] ?? swatch.label.en}
                title={swatch.label[locale] ?? swatch.label.en}
                onClick={() => onTimelineAccentColorChange(swatch.color)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

export default SettingsModal
