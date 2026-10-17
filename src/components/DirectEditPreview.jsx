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
  // Classic's two-step "Reset form" (ResumeBuilderPage's handleResetForm):
  // the first click arms it (`clearArmed`), a second one within its
  // window clears the CV.
  onClear = null,
  clearArmed = false,
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
            demo CV" in its form column, which Direct Edit doesn't have. */}
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
          {onClear ? (
            <button
              type="button"
              className={`direct-edit-sections__trigger direct-edit-clear${clearArmed ? ' direct-edit-clear--armed' : ''}`}
              aria-live="polite"
              onClick={onClear}
            >
              {clearArmed
                ? locale === 'fi' ? 'Vahvista tyhjennys' : 'Confirm clear'
                : locale === 'fi' ? 'Tyhjennä CV' : 'Clear CV'}
            </button>
          ) : null}
        </div>
        <CVPreview {...previewProps} directEditDispatch={dispatchFormData} />
        <SectionEditOverlay
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
