import { useState } from 'react'
import Modal from './Modal'
import ToggleSwitch from './fields/ToggleSwitch'
import { getTemplateAccent, resolveTemplateAccent } from '../utils/cvTemplates'
import { getAccentSwatches } from '../utils/templateAccents'
import { dialogs } from '../i18n/dialogs/index.js'

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
  cvLanguage = '',
  onCvLanguageChange,
  savedCvCount = 0,
  onDeleteAllSavedCvs,
  applicationCount = 0,
  onDeleteAllApplications,
}) {
  const t = (key, vars) => dialogs.t(locale, key, vars)
  const [isDeleteAllArmed, setIsDeleteAllArmed] = useState(false)
  const [isDeleteApplicationsArmed, setIsDeleteApplicationsArmed] = useState(false)

  return (
    <Modal closeLabel={t('common.close')}
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.title')}
      description={t('settings.description')}
    >
      <div className="settings-row">
        <div>
          <p className="settings-row__label">{t('settings.atsLabel')}</p>
          <p className="settings-row__hint">
            {t('settings.atsHint')}
          </p>
        </div>
        <ToggleSwitch checked={atsFriendlyMode} onChange={onToggleAtsFriendlyMode} />
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row__label">{t('settings.sectionsLabel')}</p>
          <p className="settings-row__hint">
            {t('settings.sectionsHint')}
          </p>
        </div>
        <button type="button" className="settings-link" onClick={onManageSections}>
          {t('settings.manage')}
        </button>
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row__label">{t('settings.restoreLabel')}</p>
          <p className="settings-row__hint">
            {t('settings.restoreHint')}
          </p>
        </div>
        <ToggleSwitch checked={sessionRestoreEnabled} onChange={onToggleSessionRestore} />
      </div>

      {onCvLanguageChange ? (
        <div className="settings-row">
          <div>
            <p className="settings-row__label" id="settings-cv-language">{t('settings.cvLanguageLabel')}</p>
            <p className="settings-row__hint">
              {t('settings.cvLanguageHint')}
            </p>
          </div>
          <div className="settings-swatch-row" role="group" aria-labelledby="settings-cv-language">
            {[
              ['', t('settings.cvLanguageApp')],
              ['en', 'English'],
              ['fi', 'Suomi'],
            ].map(([value, label]) => {
              const isActive = cvLanguage === value
              return (
                <button
                  key={value || 'app'}
                  type="button"
                  lang={value || undefined}
                  className={`settings-choice${isActive ? ' settings-choice--active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => onCvLanguageChange(value)}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {(() => {
        const accentConfig = getTemplateAccent(selectedTemplate)
        if (!accentConfig) return null
        const active = resolveTemplateAccent(templateAccentColors, selectedTemplate)
        return (
          <div className="settings-row">
            <div>
              <p className="settings-row__label">{t('settings.accentLabel')}</p>
              <p className="settings-row__hint">
                {t('settings.accentHint')}
              </p>
            </div>
            <div className="settings-swatch-row" role="group" aria-label={t('settings.accentLabel')}>
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
            <p className="settings-row__label">{t('settings.nameAlignmentLabel')}</p>
            <p className="settings-row__hint">
              {t('settings.nameAlignmentHint')}
            </p>
          </div>
          <div className="settings-swatch-row" role="group" aria-label={t('settings.nameAlignmentLabel')}>
            {[
              ['center', t('settings.alignCenter')],
              ['left', t('settings.alignLeft')],
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
      {savedCvCount > 0 && onDeleteAllSavedCvs ? (
        <div className="settings-row">
          <div>
            <p className="settings-row__label">
              {t('settings.savedCvsLabel', { count: savedCvCount })}
            </p>
            <p className="settings-row__hint">
              {t('settings.savedCvsHint')}
            </p>
          </div>
          <button
            type="button"
            className={`settings-link${isDeleteAllArmed ? ' settings-link--armed' : ''}`}
            onClick={() => {
              if (!isDeleteAllArmed) {
                setIsDeleteAllArmed(true)
                return
              }
              setIsDeleteAllArmed(false)
              onDeleteAllSavedCvs()
            }}
          >
            {isDeleteAllArmed ? t('settings.confirmDeleteAll') : t('settings.deleteAllSavedCvs')}
          </button>
        </div>
      ) : null}
      {applicationCount > 0 && onDeleteAllApplications ? (
        <div className="settings-row">
          <div>
            <p className="settings-row__label">
              {t('settings.applicationsLabel', { count: applicationCount })}
            </p>
            <p className="settings-row__hint">
              {t('settings.applicationsHint')}
            </p>
          </div>
          <button
            type="button"
            className={`settings-link${isDeleteApplicationsArmed ? ' settings-link--armed' : ''}`}
            onClick={() => {
              if (!isDeleteApplicationsArmed) {
                setIsDeleteApplicationsArmed(true)
                return
              }
              setIsDeleteApplicationsArmed(false)
              onDeleteAllApplications()
            }}
          >
            {isDeleteApplicationsArmed ? t('settings.confirmDeleteAllApplications') : t('settings.deleteAllApplications')}
          </button>
        </div>
      ) : null}
    </Modal>
  )
}

export default SettingsModal
