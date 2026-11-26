import { aboutPage } from '../i18n/pages/about'

function RichParagraph({ parts, onNavigateToView }) {
  return (
    <p>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>
        }

        if (part.link) {
          const isExternal = part.link.startsWith('http')
          const isMailto = part.link.startsWith('mailto:')

          return (
            <a
              key={index}
              href={part.link}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noreferrer' : undefined}
              onClick={
                part.view && !isExternal && !isMailto
                  ? (event) => {
                      if (
                        event.defaultPrevented
                        || event.button !== 0
                        || event.metaKey
                        || event.ctrlKey
                        || event.shiftKey
                        || event.altKey
                      ) {
                        return
                      }
                      event.preventDefault()
                      onNavigateToView(part.view)
                    }
                  : undefined
              }
            >
              {part.text}
            </a>
          )
        }

        return null
      })}
    </p>
  )
}

function AboutPage({ locale = 'en', onNavigateToView = () => {} }) {
  const copy = aboutPage.copy(locale)

  return (
    <section className="legal-page">
      <div className="legal-page__inner">
        <p className="legal-page__kicker">{copy.kicker}</p>
        <h1 className="legal-page__title">{copy.title}</h1>

        <p>{copy.intro}</p>

        {copy.sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, index) =>
              typeof paragraph === 'string' ? (
                <p key={index}>{paragraph}</p>
              ) : (
                <RichParagraph key={index} parts={paragraph.parts} onNavigateToView={onNavigateToView} />
              ),
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default AboutPage
