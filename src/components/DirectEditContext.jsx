/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react'

const DirectEditContext = createContext({ isEditing: false, dispatchFormData: null, locale: 'en', itemVisibility: null })

// `locale` is for the primitives' own chrome (EditableList's drag and
// remove labels); the templates' text already comes localized.
// `itemVisibility` is formData.sectionItemVisibility, so EditableList can
// mark the entries the user hid (1.6.52): the editable copy renders every
// entry, hidden or not, and without a mark hiding one changed nothing on
// screen.
export function DirectEditProvider({ isEditing, dispatchFormData, locale = 'en', itemVisibility = null, children }) {
  const value = useMemo(
    () => ({ isEditing: Boolean(isEditing && dispatchFormData), dispatchFormData, locale, itemVisibility }),
    [isEditing, dispatchFormData, locale, itemVisibility],
  )

  return <DirectEditContext.Provider value={value}>{children}</DirectEditContext.Provider>
}

export function useDirectEdit() {
  return useContext(DirectEditContext)
}
