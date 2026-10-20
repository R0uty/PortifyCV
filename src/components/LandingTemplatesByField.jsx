import { useMemo, useState } from 'react'

import InternalNavLink from './InternalNavLink'
import TemplateFieldFilter from './TemplateFieldFilter'
import TemplateThumbnailImage from './TemplateThumbnailImage'
import { getCvTemplates } from '../utils/cvTemplates'
import { TEMPLATE_VIEW_PREFIX } from '../utils/pageMeta'
import { templatePath } from '../utils/routes'
import { fieldSearch, filterTemplatesByField } from '../utils/templateFields'
import { getTemplateVariants, styleVariantSearch } from '../utils/templateVariants'

// The front page's templates section (1.6.33): the same field chips as the
// Free CV Templates page over up to six matching templates, each a link to
// its template page. Card n shows its template's look n mod 3 (the images
// are pre-rendered), named under it, to show that every template comes in
// three looks. "Browse all" keeps the chosen field.
const MAX_CARDS = 6

function LandingTemplatesByField({ locale = 'en', browseLabel, onNavigateToView = () => {} }) {
  const lang = locale === 'fi' ? 'fi' : 'en'
  const [field, setField] = useState(null)
  const templates = useMemo(() => getCvTemplates(lang), [lang])
  const shown = useMemo(() => filterTemplatesByField(templates, field), [templates, field])

  return (
    <div className="landing-templates">
      <TemplateFieldFilter
        value={field}
        onChange={setField}
        locale={lang}
        shownCount={shown.length}
        totalCount={templates.length}
        name="landing-field"
      />
      <ul className="landing-templates__grid">
        {shown.slice(0, MAX_CARDS).map((template, index) => {
          const variants = getTemplateVariants(template.id)
          const look = variants[index % variants.length]
          const search = styleVariantSearch(look.id)
          const lookLabel = look.label[lang]

          return (
            <li key={template.id}>
              <InternalNavLink
                to={`${templatePath(template.slug)}${search}`}
                onNavigate={() => onNavigateToView(`${TEMPLATE_VIEW_PREFIX}${template.id}`, { search })}
                className="landing-templates__card"
              >
                <TemplateThumbnailImage
                  templateId={template.id}
                  styleVariantId={look.id}
                  locale={lang}
                  alt={lang === 'fi' ? `${template.label} -CV-pohja, ${lookLabel}` : `${template.label} CV template, ${lookLabel}`}
                />
                <span className="landing-templates__name">{template.label}</span>
                <span className="landing-templates__look">{lookLabel}</span>
              </InternalNavLink>
            </li>
          )
        })}
      </ul>
      <InternalNavLink
        to={`/free-cv-templates${fieldSearch(field)}`}
        onNavigate={() => onNavigateToView('freeTemplates', { search: fieldSearch(field) })}
        className="landing-secondary-cta"
      >
        {browseLabel}
      </InternalNavLink>
    </div>
  )
}

export default LandingTemplatesByField
