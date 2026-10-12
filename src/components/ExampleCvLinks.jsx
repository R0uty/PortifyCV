import InternalNavLink from './InternalNavLink'
import { getCvTemplate } from '../utils/cvTemplates'
import { EXAMPLES } from '../utils/exampleCvs'
import { templatePageLink } from '../utils/pageMeta'

// A list of full example CVs, each opening a template's page on that
// example ("Frontend developer — Developer"). `examples` is one of
// CONTENT_PAGE_EXAMPLES' [templateId, exampleId] lists; a null exampleId
// links the template page itself, labelled with the template's name.
function ExampleCvLinks({ examples, locale = 'en', onNavigateToView = () => {} }) {
  const resolvedLocale = locale === 'fi' ? 'fi' : 'en'

  return (
    <ul className="example-cv-links">
      {examples.map(([templateId, exampleId]) => {
        const link = templatePageLink(templateId, { example: exampleId ?? undefined })
        const templateLabel = getCvTemplate(templateId, resolvedLocale).label
        const label = exampleId
          ? `${EXAMPLES[exampleId]?.role[resolvedLocale] ?? exampleId} — ${templateLabel}`
          : templateLabel

        return (
          <li key={`${templateId}:${exampleId}`}>
            <InternalNavLink to={link.to} onNavigate={() => onNavigateToView(link.view, { search: link.search })}>
              {label}
            </InternalNavLink>
          </li>
        )
      })}
    </ul>
  )
}

export default ExampleCvLinks
