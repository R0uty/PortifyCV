import CVPreview from './CVPreview'
import SectionsMenu from './SectionsMenu'
import SectionEditOverlay from './SectionEditOverlay'
import { getCvFontStack } from '../utils/cvFonts'
import { hideEmptySections } from '../utils/sectionContent'

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
  overlayApiRef = null,
}) {
  // Shadows the --font-sans token (tokens.css) for this subtree only —
  // matches Classic mode's .preview-zoom-wrapper inline style in
  // ResumeBuilderPage.jsx. Without this, Direct Edit always falls back to
  // the global default font regardless of the user's font choice, and an
  // exported PDF would ignore it too.
  const fontStyle = { '--font-sans': getCvFontStack(cvFontId) }
  const previewProps = {
    formData,
    theme,
    template: selectedTemplate,
    locale,
    atsFriendlyMode: false,
    accentColor,
    headingColor,
    classicNameAlignment,
  }
  // The export-source copy below renders from the empty-section-hidden
  // formData (I-1), so a template's running section numbering (Creative,
  // Editorial) and pill placement (coreStrengths-in-About) match what the
  // export actually contains — never pruned out of a clone after the fact.
  const exportPreviewProps = { ...previewProps, formData: hideEmptySections(formData) }

  return (
    <>
      <div className="direct-edit-preview" style={fontStyle}>
        <SectionsMenu
          formData={formData}
          dispatchFormData={dispatchFormData}
          templateConfig={templateConfig}
          locale={locale}
        />
        <CVPreview {...previewProps} directEditDispatch={dispatchFormData} />
        <SectionEditOverlay
          formData={formData}
          dispatchFormData={dispatchFormData}
          templateConfig={templateConfig}
          locale={locale}
          apiRef={overlayApiRef}
        />
      </div>
      {/* What PDF export captures. The PDF exporter clones previewRef's
          DOM as-is, and the editable CV above carries the editing chrome
          ("+ Add" rows, removable chips, handles, placeholder text), shows
          entries the user hid (EditableList renders formData, not the
          visibility-filtered snapshot) and swaps some templates' comma-
          joined skills for chips. So this renders the same CV read-only —
          no dispatch, exactly as Classic mode would — off-screen, and
          previewRef points here. It sits outside .direct-edit-preview so the
          section overlay and its queries only ever see the editable copy. */}
      <div className="direct-edit-export-source" style={fontStyle} aria-hidden="true" inert>
        <CVPreview {...exportPreviewProps} directEditDispatch={null} previewRef={previewRef} />
      </div>
    </>
  )
}
