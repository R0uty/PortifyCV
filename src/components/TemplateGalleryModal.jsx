import { memo, useMemo } from 'react'

import Modal from './Modal'
import CVPreview from './CVPreview'
import { demoCvData } from '../utils/cvForm'

// Each thumbnail renders a real CVPreview, so the card shows the layout the user
// is actually choosing rather than an abstract skeleton. Ten full previews would
// be needlessly heavy, so the CV is trimmed to what survives being shrunk to
// thumbnail size — the header, a couple of entries, and a few skills.
const THUMBNAIL_EXPERIENCE_COUNT = 2
const THUMBNAIL_EDUCATION_COUNT = 1
const THUMBNAIL_ITEM_COUNT = 3
const THUMBNAIL_SKILL_COUNT = 6
const THUMBNAIL_ABOUT_LENGTH = 240

function hasContent(formData) {
  if (!formData) {
    return false
  }

  return Boolean(
    formData.fullName?.trim()
      || formData.title?.trim()
      || formData.about?.trim()
      || formData.experience?.some((item) => item.role?.trim() || item.company?.trim()),
  )
}

function buildThumbnailCv(formData) {
  const source = hasContent(formData) ? formData : demoCvData
  const take = (value, count) => (Array.isArray(value) ? value.slice(0, count) : [])

  return {
    ...source,
    about: (source.about ?? '').slice(0, THUMBNAIL_ABOUT_LENGTH),
    experience: take(source.experience, THUMBNAIL_EXPERIENCE_COUNT),
    education: take(source.education, THUMBNAIL_EDUCATION_COUNT),
    skills: take(source.skills, THUMBNAIL_SKILL_COUNT),
    projects: take(source.projects, THUMBNAIL_ITEM_COUNT),
    certificates: take(source.certificates, THUMBNAIL_ITEM_COUNT),
    coreStrengths: take(source.coreStrengths, THUMBNAIL_ITEM_COUNT),
    languages: take(source.languages, THUMBNAIL_ITEM_COUNT),
  }
}

// memo keeps the ten previews from re-rendering while the user hovers around the
// grid — the trimmed CV is a stable reference for the modal's lifetime.
const TemplateThumbnail = memo(function TemplateThumbnail({ templateId, formData, locale }) {
  return (
    <div className="template-gallery__thumb-frame">
      <div className="template-gallery__thumb-page" aria-hidden="true">
        <CVPreview formData={formData} template={templateId} locale={locale} />
      </div>
    </div>
  )
})

function TemplateGalleryModal({
  isOpen,
  onClose,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  atsScore,
  formData = null,
  locale = 'en',
}) {
  const isFinnish = locale === 'fi'
  const thumbnailCv = useMemo(() => buildThumbnailCv(formData), [formData])

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
                <TemplateThumbnail
                  templateId={template.id}
                  formData={thumbnailCv}
                  locale={locale}
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
          )
        })}
      </div>
    </Modal>
  )
}

export default TemplateGalleryModal
