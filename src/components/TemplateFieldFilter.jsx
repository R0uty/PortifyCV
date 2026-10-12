import { ALL_FIELDS_LABEL, TEMPLATE_FIELDS } from '../utils/templateFields'

// The field chips (1.6.12) above the Free CV Templates grid and the
// builder's template gallery. Native radios styled as chips, the same
// pattern as StyleSwatchGroup: Tab enters the group, the arrow keys move
// between fields, and each input covers its whole chip at opacity 0. The
// caller owns the value (the grid keeps it in ?field=, the gallery in
// local state); `null` is All. The status line is announced politely after
// each change.
function TemplateFieldFilter({ value, onChange, locale = 'en', shownCount, totalCount, name }) {
  const lang = locale === 'fi' ? 'fi' : 'en'
  const options = [{ id: null, label: ALL_FIELDS_LABEL }, ...TEMPLATE_FIELDS]

  let statusText
  if (value === null) {
    statusText = lang === 'fi' ? `Kaikki ${totalCount} pohjaa` : `All ${totalCount} templates`
  } else {
    statusText = lang === 'fi'
      ? `Näytetään ${shownCount}/${totalCount} pohjaa`
      : `Showing ${shownCount} of ${totalCount} templates`
  }

  return (
    <div className="template-fields">
      <div role="radiogroup" aria-label={lang === 'fi' ? 'Ala' : 'Field'} className="template-fields__chips">
        {options.map((option) => (
          <label key={option.id ?? 'all'} className="template-fields__chip">
            <input
              type="radio"
              name={name}
              value={option.id ?? ''}
              checked={option.id === value}
              onChange={() => onChange(option.id)}
            />
            <span>{option.label[lang]}</span>
          </label>
        ))}
      </div>
      <p className="template-fields__status" aria-live="polite">{statusText}</p>
    </div>
  )
}

export default TemplateFieldFilter
