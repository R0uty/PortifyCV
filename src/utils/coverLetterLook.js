import { DEFAULT_CV_FONT_ID, getCvFontStack } from './cvFonts'
import { NAME_OWN_COLOR_VARIABLES, nameTakesHeadingColor } from './cvHeadingColors'
import { resolveTemplateAccent } from './cvTemplates'
import { getVariantLook, getVariantPaletteStyle } from './templateVariants'

const FALLBACK_LETTER_COLOR = '#1f2937'

// The cover letter page's look (1.7.9), from the same builder state the CV
// preview reads, so the two can't disagree: the CV's font (the chosen
// `cvFontId`, else the look's), the headings colour (the chosen one, else
// the look's, else the accent) and the accent (the template's chosen
// swatch, else the headings colour). A template whose name ignores the
// headings colour (cvHeadingColors.js's NAME_OWN_COLOR_VARIABLES) gives the
// letter the solid colour its own name shows, from the look's palette.
// ATS-friendly mode is plain, like the ATS CV: the default font, black, no
// accent colour.
export function resolveCoverLetterLook({
  templateId,
  styleVariantId,
  atsFriendlyMode = false,
  templateAccentColors,
  cvFontId,
  cvHeadingColor,
}) {
  if (atsFriendlyMode) {
    return {
      fontStack: getCvFontStack(DEFAULT_CV_FONT_ID),
      headingColor: '#000000',
      accent: '#000000',
    }
  }

  const look = getVariantLook(templateId, styleVariantId)
  const templateAccent = resolveTemplateAccent(templateAccentColors, templateId) || ''
  const ownNameColor = nameTakesHeadingColor(templateId)
    ? ''
    : getVariantPaletteStyle(templateId, styleVariantId)[NAME_OWN_COLOR_VARIABLES[templateId]] ?? ''
  const headingColor = ownNameColor
    || cvHeadingColor || look.headingColor || templateAccent || FALLBACK_LETTER_COLOR

  return {
    fontStack: getCvFontStack(cvFontId || look.fontId),
    headingColor,
    accent: templateAccent || headingColor,
  }
}
