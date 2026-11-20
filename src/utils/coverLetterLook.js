import { DEFAULT_CV_FONT_ID, getCvFontStack } from './cvFonts'
import { NAME_DEFAULT_COLOR_VARIABLES, NAME_OWN_COLOR_VARIABLES, nameTakesHeadingColor } from './cvHeadingColors'
import { resolveTemplateAccent } from './cvTemplates'
import { getVariantLook, getVariantPaletteStyle } from './templateVariants'

const FALLBACK_LETTER_COLOR = '#1f2937'

// The cover letter page's look (1.7.9), from the same builder state the CV
// preview reads, so the two can't disagree: the CV's font (the chosen
// `cvFontId`, else the look's), the headings colour and the accent. The
// headings colour is exactly what the CV paints its name in: a template
// whose name ignores the headings colour (cvHeadingColors.js's
// NAME_OWN_COLOR_VARIABLES) gives the solid colour its own name shows;
// every other template the chosen headings colour, else its own default
// name colour (NAME_DEFAULT_COLOR_VARIABLES), both read from the current
// look's palette. A look's own headings colour is not a fallback here:
// picking the look sets `cvHeadingColor` to it (uiReducer.js), and once the
// visitor resets it to '' the CV's name goes back to the palette colour.
// The accent (the template's chosen swatch, else the headings colour) is
// only the thin rule under the letter's header. ATS-friendly mode is plain,
// like the ATS CV: the default font, black, no accent colour.
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
  const palette = getVariantPaletteStyle(templateId, styleVariantId)
  const headingColor = (nameTakesHeadingColor(templateId)
    ? cvHeadingColor || palette[NAME_DEFAULT_COLOR_VARIABLES[templateId]]
    : palette[NAME_OWN_COLOR_VARIABLES[templateId]])
    || FALLBACK_LETTER_COLOR

  return {
    fontStack: getCvFontStack(cvFontId || look.fontId),
    headingColor,
    accent: templateAccent || headingColor,
  }
}
