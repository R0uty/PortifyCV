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
  styleVariantId,
  classicNameAlignment,
  previewRef,
  cvFontId,
  overlayApiRef = null,
  onLoadDemo = null,
  // The app-wide ATS-friendly mode (also in Settings and Classic's ATS
  // panel). When on, both copies below render the ATS layout, so the CV
  // you edit is the one that exports.
  atsFriendlyMode = false,
  onToggleAtsFriendlyMode = null,
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
    atsFriendlyMode,
    accentColor,
    headingColor,
    styleVariantId,
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
        {/* The preview's own top-right controls. Classic mode keeps "Load
            demo CV" in its form column, which Direct Edit doesn't have.
            Clear CV lives in the toolbar's More menu (1.6.67), away from
            these harmless ones. */}
        <div className="direct-edit-actions">
          <SectionsMenu
            formData={formData}
            dispatchFormData={dispatchFormData}
            templateConfig={templateConfig}
            locale={locale}
          />
          {onToggleAtsFriendlyMode ? (
            <button
              type="button"
              className={`direct-edit-sections__trigger direct-edit-ats-toggle${atsFriendlyMode ? ' direct-edit-ats-toggle--on' : ''}`}
              aria-pressed={atsFriendlyMode}
              onClick={onToggleAtsFriendlyMode}
            >
              {locale === 'fi' ? 'ATS-näkymä' : 'ATS view'}
            </button>
          ) : null}
          {onLoadDemo ? (
            <button type="button" className="direct-edit-sections__trigger" onClick={onLoadDemo}>
              {locale === 'fi' ? 'Lataa demo-CV' : 'Load demo CV'}
            </button>
          ) : null}
        </div>
        <CVPreview {...previewProps} directEditDispatch={dispatchFormData} />
        {/* Keyed by template (1.6.52): a template switch from the toolbar
            used to leave an open section popup where it was, over the new
            template's content, editing a section that may no longer be
            there. A new template starts with the overlay closed. */}
        <SectionEditOverlay
          key={templateConfig.id}
          formData={formData}
          dispatchFormData={dispatchFormData}
          templateConfig={templateConfig}
          locale={locale}
          apiRef={overlayApiRef}
          atsFriendlyMode={atsFriendlyMode}
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
