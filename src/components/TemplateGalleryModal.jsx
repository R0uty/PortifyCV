import { useMemo, useState } from 'react'

import Modal from './Modal'
import StyleSwatchGroup from './StyleSwatchGroup'
import TemplateThumbnail from './TemplateThumbnail'
import TemplateFieldFilter from './TemplateFieldFilter'
import { buildThumbnailCv } from '../utils/thumbnailCv'
import { getCvFontStack } from '../utils/cvFonts'
import { resolveTemplateAccent } from '../utils/cvTemplates'
import { templatePath } from '../utils/routes'
import { getVariantLook, resolveStyleVariantId, styleVariantSearch } from '../utils/templateVariants'
import { filterTemplatesByField } from '../utils/templateFields'
import { dialogs } from '../i18n/dialogs/index.js'

function TemplateGalleryModal({
  isOpen,
  onClose,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  atsScore,
  formData = null,
  templateAccentColors = null,
  cvFontId = '',
  cvHeadingColor = '',
  locale = 'en',
  onOpenBadge = null,
}) {
  const t = (key, vars) => dialogs.t(locale, key, vars)
  const thumbnailCv = useMemo(() => buildThumbnailCv(formData), [formData])
  // Looks previewed on a card since the modal opened (Phase 4). A card
  // without one shows the look this CV stores for its template. Reset on
  // every open, during render (React's "adjust state on a prop change"
  // pattern), so a reopened gallery never shows a stale preview.
  const [previewedLooks, setPreviewedLooks] = useState({})
  // The field filter (1.6.12) is local and starts on All at every open:
  // the gallery is for switching, not a page to link to.
  const [field, setField] = useState(null)
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setPreviewedLooks({})
      setField(null)
    }
  }
  const shownTemplates = filterTemplatesByField(templates, field)

  return (
    <Modal closeLabel={t('common.close')}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={t('gallery.title')}
      description={t('gallery.description')}
    >
      {atsScore ? (
        <div className="template-gallery__ats-banner">
          <span className="template-gallery__ats-score">{atsScore.score}</span>
          <p className="template-gallery__ats-copy">
            {t('gallery.atsBanner')}
          </p>
        </div>
      ) : null}

      <div className="template-gallery__filter">
        <TemplateFieldFilter
          value={field}
          onChange={setField}
          locale={locale}
          shownCount={shownTemplates.length}
          totalCount={templates.length}
          name="gallery-field"
        />
      </div>

      <div className="template-gallery__grid">
        {shownTemplates.map((template) => {
          const isActive = template.id === selectedTemplateId
          const storedLook = resolveStyleVariantId(formData, template.id)
          const look = previewedLooks[template.id] ?? storedLook
          // The open template on its stored look mirrors the builder
          // preview, Modified tweaks included; any other card shows the
          // look's own accent, font and headings colour.
          const showsLivePreview = isActive && look === storedLook
          const thumbnailLook = showsLivePreview
            ? {
                styleVariantId: look,
                accentColor: resolveTemplateAccent(templateAccentColors, template.id),
                fontId: cvFontId,
                fontStack: getCvFontStack(cvFontId),
                headingColor: cvHeadingColor,
              }
            : getVariantLook(template.id, look)

          // The builder ends up exactly as the card shows: this template
          // in this look (ResumeBuilderPage's handleSelectTemplate).
          const selectTemplate = () => {
            onSelectTemplate(template.id, look)
            onClose()
          }

          let useLabel = t('gallery.useTemplate')
          if (showsLivePreview) {
            useLabel = t('gallery.inUse')
          } else if (isActive) {
            useLabel = t('gallery.useStyle')
          }

          // The card is a container, not one big button: a <button> can't
          // contain links or the look radios, and the thumbnail (a real
          // CV — several templates render <a> links in it), the looks and
          // the examples link all need to live in the card.
          return (
            <div
              key={template.id}
              className={`template-gallery__card${isActive ? ' template-gallery__card--active' : ''}`}
            >
              {/* Clickable, but aria-hidden and out of the tab order: the
                  select button below is the accessible control. */}
              <div className="template-gallery__thumb" aria-hidden="true" onClick={selectTemplate}>
                <TemplateThumbnail
                  templateId={template.id}
                  formData={thumbnailCv}
                  locale={locale}
                  {...thumbnailLook}
                />
              </div>
              <div className="template-gallery__looks">
                <StyleSwatchGroup
                  templateId={template.id}
                  value={look}
                  onChange={(variantId) => setPreviewedLooks((current) => ({ ...current, [template.id]: variantId }))}
                  locale={locale}
                  name={`gallery-look-${template.id}`}
                  label={t('gallery.styleLabel', { template: template.label })}
                />
              </div>
              <button
                type="button"
                className="template-gallery__select"
                onClick={selectTemplate}
              >
                <div className="template-gallery__meta">
                  {isActive ? (
                    <span className="template-gallery__active-badge">
                      {t('gallery.active')}
                    </span>
                  ) : null}
                  <p className="template-gallery__name">{template.label}</p>
                  <p className="template-gallery__desc">{template.description}</p>
                  <span className="template-gallery__use">{useLabel}</span>
                </div>
              </button>
              {/* Opens the template's own page, on the previewed look,
                  which shows every example CV for it, in a new tab — the
                  builder and the user's CV stay exactly as they are. */}
              <a
                className="template-gallery__examples"
                href={`${templatePath(template.slug)}${styleVariantSearch(look)}`}
                target="_blank"
                rel="noopener"
                aria-label={t('gallery.viewExamplesLabel', { template: template.label })}
              >
                {t('gallery.viewExamples')}
              </a>
            </div>
          )
        })}
      </div>

      {onOpenBadge ? (
        <div className="template-gallery__badge-cta">
          <p>
            {t('gallery.badgeCta')}
          </p>
          <button type="button" className="template-gallery__badge-link" onClick={onOpenBadge}>
            {t('gallery.getBadge')}
          </button>
        </div>
      ) : null}
    </Modal>
  )
}

export default TemplateGalleryModal
