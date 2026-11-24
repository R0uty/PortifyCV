import { defaultTemplateId, getAllTemplateAccents, resolveTemplateId } from './cvTemplates'
import { DEFAULT_CV_FONT_ID } from './cvFonts'
import { DEFAULT_CV_HEADING_COLOR } from './cvHeadingColors'
import { getTemplateVariant, resolveStyleVariantId } from './templateVariants'

// What the read-only share page paints: every look field is the link's value
// when it carried one, else what the builder's applyStoredLooks would give
// for this CV and template.
export function resolveSharedCvLook(formData, templateId, look = {}) {
  const template = resolveTemplateId(templateId) ?? defaultTemplateId
  const styleVariantId = resolveStyleVariantId(formData, template)
  const variant = getTemplateVariant(template, styleVariantId)

  return {
    template,
    accentColor: look.accent ?? variant?.accent ?? getAllTemplateAccents()[template],
    cvFontId: look.fontId ?? variant?.fontId ?? DEFAULT_CV_FONT_ID,
    cvHeadingColor: look.headingColor ?? variant?.headingColor ?? DEFAULT_CV_HEADING_COLOR,
    classicNameAlignment: look.nameAlignment ?? 'center',
    atsFriendlyMode: look.atsFriendlyMode ?? false,
    styleVariantId,
  }
}
