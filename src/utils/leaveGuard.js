// Asks before the builder's page unloads with edits the visitor can't
// get back (1.6.66). Nothing is saved, so closing the tab, going back or
// following a link used to lose the CV without a word. The builder
// registers a check. In-app links and back/forward ask through App.jsx's
// LeaveConfirmDialog (1.6.68), which reads hasUnsavedChanges() and leaves
// through leavePage(); the browser's own "Leave site?" prompt is left for
// closing the tab or reloading, where nothing else is allowed.

let currentCheck = null
let isLeaving = false

export function registerUnsavedChangesCheck(check) {
  const handleBeforeUnload = (event) => {
    if (!isLeaving && check()) {
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

// A page load the visitor already confirmed in the dialog: no second,
// browser-drawn prompt on the way out.
export function leavePage(url) {
  isLeaving = true
  window.location.assign(url)
}
