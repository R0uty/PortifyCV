import { useMemo } from 'react'

import Modal from './Modal'
import TemplateThumbnail from './TemplateThumbnail'
import { buildThumbnailCv } from '../utils/thumbnailCv'
import { getCvFontStack } from '../utils/cvFonts'
import { templatePath } from '../utils/routes'

function TemplateGalleryModal({
  isOpen,
  onClose,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  atsScore,
  formData = null,
  cvFontId = '',
  cvHeadingColor = '',
  locale = 'en',
  onOpenBadge = null,
}) {
  const isFinnish = locale === 'fi'
  const thumbnailCv = useMemo(() => buildThumbnailCv(formData), [formData])
  const fontStack = getCvFontStack(cvFontId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isFinnish ? 'Pohjagalleria' : 'Template gallery'}
      description={isFinnish
        ? 'Vaihda asettelua milloin tahansa ilman että jo syöttämäsi sisältö muuttuu.'
        : 'Switch layouts any time without changing the CV content you already entered.'}
    >
      {atsScore ? (
        <div className="template-gallery__ats-banner">
          <span className="template-gallery__ats-score">{atsScore.score}</span>
          <p className="template-gallery__ats-copy">
            {isFinnish
              ? 'Nykyisen sisältösi ATS-pisteet. Pisteet perustuvat sisältöön ja ATS-tilaan, ei valittuun pohjaan — voit vaihtaa pohjaa vapaasti tämän vaikuttamatta pisteisiin.'
              : "Your current content's ATS score. Scoring is based on content and ATS mode, not the visual template — switch freely without affecting it."}
          </p>
        </div>
      ) : null}

      <div className="template-gallery__grid">
        {templates.map((template) => {
          const isActive = template.id === selectedTemplateId

          // The card is a container, not one big button, so it can hold a
          // second control: a link can't be nested inside a <button>.
          return (
            <div
              key={template.id}
              className={`template-gallery__card${isActive ? ' template-gallery__card--active' : ''}`}
            >
              <button
                type="button"
                className="template-gallery__select"
                onClick={() => {
                  onSelectTemplate(template.id)
                  onClose()
                }}
              >
                <div className="template-gallery__thumb">
                  <TemplateThumbnail
                    templateId={template.id}
                    formData={thumbnailCv}
                    locale={locale}
                    fontStack={fontStack}
                    headingColor={cvHeadingColor}
                  />
                </div>
                <div className="template-gallery__meta">
                  {isActive ? (
                    <span className="template-gallery__active-badge">
                      {isFinnish ? 'Käytössä' : 'Active'}
                    </span>
                  ) : null}
                  <p className="template-gallery__name">{template.label}</p>
                  <p className="template-gallery__desc">{template.description}</p>
                  <span className="template-gallery__use">
                    {isActive
                      ? (isFinnish ? 'Käytössä' : 'In use')
                      : (isFinnish ? 'Käytä pohjaa' : 'Use template')}
                  </span>
                </div>
              </button>
              {/* Opens the template's own page, which shows every example CV
                  for it, in a new tab — the builder and the user's CV stay
                  exactly as they are. */}
              <a
                className="template-gallery__examples"
                href={templatePath(template.slug)}
                target="_blank"
                rel="noopener"
                aria-label={`${isFinnish ? 'Katso esimerkit' : 'View examples'}: ${template.label}`}
              >
                {isFinnish ? 'Katso esimerkit' : 'View examples'}
              </a>
            </div>
          )
        })}
      </div>

      {onOpenBadge ? (
        <div className="template-gallery__badge-cta">
          <p>
            {isFinnish
              ? 'Jaatko CV:si muualla? Nappaa "Tehty PortifyCV:llä" -tunnus omalle sivustollesi.'
              : 'Sharing your CV elsewhere? Grab a "Made with PortifyCV" badge for your own site.'}
          </p>
          <button type="button" className="template-gallery__badge-link" onClick={onOpenBadge}>
            {isFinnish ? 'Hae tunnus' : 'Get the badge'}
          </button>
        </div>
      ) : null}
    </Modal>
  )
}

export default TemplateGalleryModal
