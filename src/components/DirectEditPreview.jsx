import CVPreview from './CVPreview'
import SectionsMenu from './SectionsMenu'
import SectionEditOverlay from './SectionEditOverlay'
import { isInlineEditSupported } from '../utils/directEdit'
import { getCvFontStack } from '../utils/cvFonts'

export default function DirectEditPreview({
  formData,
  dispatchFormData,
  selectedTemplate,
  templateConfig,
  locale,
  theme,
  accentColor,
  headingColor,
  classicNameAlignment,
  previewRef,
  cvFontId,
}) {
  const isInlineSupported = isInlineEditSupported(selectedTemplate)

  return (
    <div
      className="direct-edit-preview"
      style={{
        // Shadows the --font-sans token (tokens.css) for this subtree only —
        // matches Classic mode's .preview-zoom-wrapper inline style in
        // ResumeBuilderPage.jsx. Without this, Direct Edit always falls back
        // to the global default font regardless of the user's font choice,
        // and an exported PDF (which captures whatever is in the DOM) would
        // ignore it too.
        '--font-sans': getCvFontStack(cvFontId),
      }}
    >
      <SectionsMenu
        formData={formData}
        dispatchFormData={dispatchFormData}
        templateConfig={templateConfig}
        locale={locale}
      />
      <CVPreview
        formData={formData}
        theme={theme}
        template={selectedTemplate}
        locale={locale}
        atsFriendlyMode={false}
        accentColor={accentColor}
        headingColor={headingColor}
        classicNameAlignment={classicNameAlignment}
        directEditDispatch={isInlineSupported ? dispatchFormData : null}
        previewRef={previewRef}
      />
      <SectionEditOverlay
        formData={formData}
        dispatchFormData={dispatchFormData}
        templateConfig={templateConfig}
        locale={locale}
      />
    </div>
  )
}
