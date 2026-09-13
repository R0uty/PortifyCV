import CVPreview from './CVPreview'
import SectionsMenu from './SectionsMenu'
import { isDirectEditSupported } from '../utils/directEdit'

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
}) {
  const isFinnish = locale === 'fi'
  const isSupported = isDirectEditSupported(selectedTemplate)

  return (
    <div className="direct-edit-preview">
      {!isSupported ? (
        <p className="direct-edit-preview__notice">
          {isFinnish
            ? `Suora muokkaus ei ole vielä käytössä pohjalle "${templateConfig.label}". Vaihda Classic-tilaan muokataksesi, tai valitse toinen pohja.`
            : `Direct Edit isn't available yet for "${templateConfig.label}". Switch to Classic to edit, or pick a different template.`}
        </p>
      ) : null}
      {isSupported ? (
        <SectionsMenu
          formData={formData}
          dispatchFormData={dispatchFormData}
          templateConfig={templateConfig}
          locale={locale}
        />
      ) : null}
      <CVPreview
        formData={formData}
        theme={theme}
        template={selectedTemplate}
        locale={locale}
        atsFriendlyMode={false}
        accentColor={accentColor}
        headingColor={headingColor}
        classicNameAlignment={classicNameAlignment}
        directEditDispatch={isSupported ? dispatchFormData : null}
        previewRef={previewRef}
      />
    </div>
  )
}
