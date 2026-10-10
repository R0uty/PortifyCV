import { getTemplateVariants, getVariantSwatches } from '../utils/templateVariants'

// A template's looks (Phase 3) as a row of colour strips, for the places
// outside the builder that show them: gallery cards, the Free CV Templates
// grid and the template pages (Phase 4). Native radios, so Tab enters the
// group and the arrow keys move between looks; each input covers its whole
// option at opacity 0, so the strip itself is the click target. Choosing
// only reports the id: the caller decides what it means (a card preview,
// a URL, the builder).
//
// The `card` size shows only colour strips, so it names the checked look in
// a caption after them (1.6.7): touch users can't hover for the tooltip.
// The caption is aria-hidden — each radio already announces its own name.
function StyleSwatchGroup({ templateId, value, onChange, locale = 'en', name, label, size = 'card' }) {
  const lang = locale === 'fi' ? 'fi' : 'en'
  const variants = getTemplateVariants(templateId)

  if (variants.length < 2) {
    return null
  }

  const checkedLabel = (variants.find((variant) => variant.id === value) ?? variants[0]).label[lang]

  return (
    <div role="radiogroup" aria-label={label} className={`style-swatches style-swatches--${size}`}>
      {variants.map((variant) => (
        <label key={variant.id} className="style-swatches__option" title={variant.label[lang]}>
          <input
            type="radio"
            name={name}
            value={variant.id}
            checked={variant.id === value}
            onChange={() => onChange(variant.id)}
            aria-label={variant.label[lang]}
          />
          <span className="style-swatches__strip" aria-hidden="true">
            {getVariantSwatches(templateId, variant).map((color, index) => (
              <span key={index} className="style-swatches__chip" style={{ background: color }} />
            ))}
          </span>
          {size === 'page' ? (
            <span className="style-swatches__label" aria-hidden="true">{variant.label[lang]}</span>
          ) : null}
        </label>
      ))}
      {size === 'card' ? (
        <span className="style-swatches__caption" aria-hidden="true">{checkedLabel}</span>
      ) : null}
    </div>
  )
}

export default StyleSwatchGroup
