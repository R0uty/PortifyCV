import { defaultTemplateId, getAllTemplateAccents, isValidTemplateId } from './cvTemplates'
import { DEFAULT_CV_FONT_ID } from './cvFonts'
import { DEFAULT_CV_HEADING_COLOR } from './cvHeadingColors'
import { getTemplateVariant, resolveStyleVariantId } from './templateVariants'

// Same mapping as uiReducer's resolveTemplateId, kept here so the read-only
// share page doesn't pull the reducer (and its storage code) into its chunk.
const LEGACY_TEMPLATE_ALIASES = { classic: 'classicProfessional' }

// What the read-only share page paints: every look field is the link's value
// when it carried one, else what the builder's applyStoredLooks would give
// for this CV and template.
export function resolveSharedCvLook(formData, templateId, look = {}) {
  const aliased = LEGACY_TEMPLATE_ALIASES[templateId] ?? templateId
  const template = isValidTemplateId(aliased) ? aliased : defaultTemplateId
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
