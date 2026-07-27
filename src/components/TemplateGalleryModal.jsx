import Modal from './Modal'

function TemplateThumbnail({ template }) {
  return (
    <div className="template-gallery__thumb-frame">
      <div className="template-gallery__thumb-accent" />
      <div className="template-gallery__thumb-body">
        {template.thumbnail.blockWidths.map((widthClassName, index) => (
          <div
            key={index}
            className={`template-gallery__thumb-line ${widthClassName}`}
          />
        ))}
      </div>
    </div>
  )
}

function TemplateGalleryModal({
  isOpen,
  onClose,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  atsScore,
  locale = 'en',
}) {
  const isFinnish = locale === 'fi'

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

          return (
            <button
              key={template.id}
              type="button"
              className={`template-gallery__card${isActive ? ' template-gallery__card--active' : ''}`}
              onClick={() => {
                onSelectTemplate(template.id)
                onClose()
              }}
            >
              <div className="template-gallery__thumb">
                <TemplateThumbnail template={template} />
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
          )
        })}
      </div>
    </Modal>
  )
}

export default TemplateGalleryModal
