import { createNamespace } from '../index.js'
import en from './en.js'
import fi from './fi.js'
import sv from './sv.js'

// The builder's dialogs and their helpers' messages (SettingsModal,
// SavedCvsModal, MarkAppliedModal, ApplicationViewModal, CoverLetterModal,
// PdfPreviewModal, PdfParserView, pdfPreviewOptions.js, ImportCvModal,
// AtsCheckModal, BadgeModal, TemplateGalleryModal, cvLibrary.js, badge.js,
// profilePhoto.js), all in the builder's lazy chunk. TemplateFieldFilter,
// which the Free CV Templates page and the front page load too, has its own
// small namespace, `fieldFilter`. Call with the app's language (`locale`).
export const dialogs = createNamespace('dialogs', { en, fi, sv })
