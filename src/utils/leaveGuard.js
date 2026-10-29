// Asks before the builder's page unloads with edits the visitor can't
// get back (1.6.66). Nothing is saved, so closing the tab, going back or
// following a link used to lose the CV without a word. The builder
// registers a check; the browser's own "Leave site?" prompt does the
// asking, and App.jsx reads hasUnsavedChanges() for back/forward, which
// it turns into a page load.

let currentCheck = null

export function registerUnsavedChangesCheck(check) {
  const handleBeforeUnload = (event) => {
    if (check()) {
      event.preventDefault()
      // Older browsers only prompt when returnValue is set.
      event.returnValue = ''
    }
  }

  currentCheck = check
  window.addEventListener('beforeunload', handleBeforeUnload)

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    if (currentCheck === check) {
      currentCheck = null
    }
  }
}

export function hasUnsavedChanges() {
  return currentCheck ? currentCheck() : false
}
