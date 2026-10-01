import Modal from './Modal'
import ToggleSwitch from './fields/ToggleSwitch'
import { getTemplateAccent, resolveTemplateAccent } from '../utils/cvTemplates'
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
  templateAccentColors = {},
  onTemplateAccentColorChange,
  classicNameAlignment = 'center',
  onClassicNameAlignmentChange,
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
        const active = resolveTemplateAccent(templateAccentColors, selectedTemplate)
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
                // Compare case-insensitively as a belt-and-suspenders guard
                // against a future hex-case typo. The cvTemplates.js registry
                // rule (accent.default is the lowercase hex of the template's
                // *_DEFAULT_ACCENT_COLOR constant) now makes an exact match
                // the norm, so this normally compares two already-equal strings.
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

      {selectedTemplate === 'classicProfessional' ? (
        <div className="settings-row">
          <div>
            <p className="settings-row__label">{isFinnish ? 'Nimen tasaus' : 'Name alignment'}</p>
            <p className="settings-row__hint">
              {isFinnish
                ? 'Keskitä otsikkonimi tai tasaa se vasemmalle kirjelomaketyyliin.'
                : 'Centre the header name, or left-align it letterhead-style.'}
            </p>
          </div>
          <div className="settings-swatch-row" role="group" aria-label={isFinnish ? 'Nimen tasaus' : 'Name alignment'}>
            {[
              ['center', isFinnish ? 'Keskitä' : 'Centre'],
              ['left', isFinnish ? 'Vasen' : 'Left'],
            ].map(([value, label]) => {
              const isActive = classicNameAlignment === value
              return (
                <button
                  key={value}
                  type="button"
                  className={`settings-choice${isActive ? ' settings-choice--active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => onClassicNameAlignmentChange(value)}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

export default SettingsModal
