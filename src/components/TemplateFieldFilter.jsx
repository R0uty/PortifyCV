import { ALL_FIELDS_LABEL, TEMPLATE_FIELDS } from '../utils/templateFields'
import { fieldFilter } from '../i18n/fieldFilter/index.js'

// The field chips (1.6.12) above the Free CV Templates grid and the
// builder's template gallery. Native radios styled as chips, the same
// pattern as StyleSwatchGroup: Tab enters the group, the arrow keys move
// between fields, and each input covers its whole chip at opacity 0. The
// caller owns the value (the grid keeps it in ?field=, the gallery in
// local state); `null` is All. The status line is announced politely after
// each change.
function TemplateFieldFilter({ value, onChange, locale = 'en', shownCount, totalCount, name }) {
  // The field names come from templateFields.js's label maps ({ en, fi, sv }); the text follows the app.
  const labelOf = (label) => label[locale] ?? label.en
  const t = (key, vars) => fieldFilter.t(locale, key, vars)
  const options = [{ id: null, label: ALL_FIELDS_LABEL }, ...TEMPLATE_FIELDS]

  let statusText
  if (value === null) {
    statusText = t('all', { total: totalCount })
  } else {
    statusText = t('showing', { shown: shownCount, total: totalCount })
  }

  return (
    <div className="template-fields">
      <div role="radiogroup" aria-label={t('label')} className="template-fields__chips">
        {options.map((option) => (
          <label key={option.id ?? 'all'} className="template-fields__chip">
            <input
              type="radio"
              name={name}
              value={option.id ?? ''}
              checked={option.id === value}
              onChange={() => onChange(option.id)}
            />
            <span>{labelOf(option.label)}</span>
          </label>
        ))}
      </div>
      <p className="template-fields__status" aria-live="polite">{statusText}</p>
    </div>
  )
}

export default TemplateFieldFilter
