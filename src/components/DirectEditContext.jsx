/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react'

const DirectEditContext = createContext({ isEditing: false, dispatchFormData: null, locale: 'en' })

// `locale` is for the primitives' own chrome (EditableList's drag and
// remove labels); the templates' text already comes localized.
export function DirectEditProvider({ isEditing, dispatchFormData, locale = 'en', children }) {
  const value = useMemo(
    () => ({ isEditing: Boolean(isEditing && dispatchFormData), dispatchFormData, locale }),
    [isEditing, dispatchFormData, locale],
  )

  return <DirectEditContext.Provider value={value}>{children}</DirectEditContext.Provider>
}

export function useDirectEdit() {
  return useContext(DirectEditContext)
}
