import {
  formatCoverLetterDate,
  getCoverLetterHeader,
  getCoverLetterRecipient,
  splitCoverLetterParagraphs,
} from '../utils/coverLetter'

// The cover letter as a page in the CV's look (1.7.9). Mounted once in the
// builder, off-screen and inert, and drawn live from the CV and the letter,
// so a template or look change shows on the next export. The PDF preview
// captures it with renderCvPdf(…, { document: 'letter' }).
//
// Only the builder mounts it, so it renders no <h1>/<h2>: the name is a
// paragraph carrying `data-cv-name`. Each body paragraph is a
// `data-export-card`, so a long letter's page break falls between
// paragraphs where it can (and inside one only between its lines).
function CoverLetterPage({
  formData,
  letter,
  template = '',
  atsFriendlyMode = false,
  fontStack,
  headingColor,
  accent,
  locale = 'en',
}) {
  const header = getCoverLetterHeader(formData)
  const recipient = getCoverLetterRecipient(letter)
  const paragraphs = splitCoverLetterParagraphs(letter?.body)

  return (
    <article
      className={`cover-letter-page${atsFriendlyMode ? ' cover-letter-page--ats' : ''}`}
      data-cover-letter=""
      data-export-variant="cover-letter"
      data-template={template}
      lang={locale}
      style={{
        fontFamily: fontStack,
        '--letter-heading': headingColor,
        '--letter-accent': accent,
      }}
    >
      <header className="cover-letter-page__header">
        {header.name ? (
          <p className="cover-letter-page__name tpl-text-wrappable" data-cv-name="">{header.name}</p>
        ) : null}
        {header.title ? (
          <p className="cover-letter-page__title tpl-text-wrappable">{header.title}</p>
        ) : null}
        {header.contacts.length > 0 ? (
          <p className="cover-letter-page__contact">
            {header.contacts.map((value, index) => (
              <span key={`${index}-${value}`} className="cover-letter-page__contact-item">
                {index > 0 ? <span className="cover-letter-page__separator" aria-hidden="true">·</span> : null}
                <span className="tpl-value-breakable">{value}</span>
              </span>
            ))}
          </p>
        ) : null}
      </header>

      <div className="cover-letter-page__rule" data-decorative="" />

      <p className="cover-letter-page__date">{formatCoverLetterDate(locale)}</p>
      {recipient ? (
        <p className="cover-letter-page__recipient tpl-text-wrappable">{recipient}</p>
      ) : null}

      <div className="cover-letter-page__body">
        {paragraphs.map((paragraph, index) => (
          // Paragraphs are rebuilt whole from the body, so index is a stable key.
          <p key={index} className="cover-letter-page__paragraph tpl-text-wrappable" data-export-card="">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  )
}

export default CoverLetterPage
