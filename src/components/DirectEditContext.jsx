/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react'

const DirectEditContext = createContext({ isEditing: false, dispatchFormData: null })

export function DirectEditProvider({ isEditing, dispatchFormData, children }) {
  const value = useMemo(
    () => ({ isEditing: Boolean(isEditing && dispatchFormData), dispatchFormData }),
    [isEditing, dispatchFormData],
  )

  return <DirectEditContext.Provider value={value}>{children}</DirectEditContext.Provider>
}

export function useDirectEdit() {
  return useContext(DirectEditContext)
}
