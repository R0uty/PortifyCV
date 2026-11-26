import { privacyPage } from '../i18n/pages/privacy'

function RichParagraph({ parts }) {
  return (
    <p>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>
        }

        if (part.code) {
          return <code key={index}>{part.code}</code>
        }

        if (part.link) {
          return (
            <a key={index} href={part.link} target={part.link.startsWith('mailto:') ? undefined : '_blank'} rel={part.link.startsWith('mailto:') ? undefined : 'noreferrer'}>
              {part.text}
            </a>
          )
        }

        return null
      })}
    </p>
  )
}

function PrivacyPolicyPage({ locale = 'en' }) {
  const copy = privacyPage.copy(locale)

  return (
    <section className="legal-page">
      <div className="legal-page__inner">
        <p className="legal-page__kicker">{copy.kicker}</p>
        <h1 className="legal-page__title">{copy.title}</h1>
        <p className="legal-page__meta">
          {copy.effectiveDateLabel}: {copy.effectiveDate}
        </p>

        <p>{copy.intro}</p>

        {copy.sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, index) =>
              typeof paragraph === 'string' ? (
                <p key={index}>{paragraph}</p>
              ) : (
                <RichParagraph key={index} parts={paragraph.parts} />
              ),
            )}
            {section.list ? (
              <ul>
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.paragraphsAfterList?.map((paragraph, index) => (
              <p key={`after-${index}`}>{paragraph}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default PrivacyPolicyPage
