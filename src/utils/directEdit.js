// Templates that additionally support INLINE editing — clicking text in
// the preview and typing in place. Popup editing (the hover pencil and
// section editor) works on every template regardless of this list, so a
// template missing from it is not read-only; it simply lacks the inline
// bonus layer.
export const INLINE_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional', 'editorial', 'portrait', 'timeline', 'compact', 'executive', 'modernOrange', 'creative', 'colorfulCompact', 'modern']

export function isInlineEditSupported(templateId) {
  return INLINE_EDIT_SUPPORTED_TEMPLATES.includes(templateId)
}
