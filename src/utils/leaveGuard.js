// Asks before the builder's page unloads with edits the visitor can't
// get back (1.6.66). Nothing is saved, so closing the tab, going back or
// following a link used to lose the CV without a word. The builder
// registers a check. In-app links and the Back button ask through App.jsx's
// LeaveConfirmDialog (1.6.68/1.6.70), which reads hasUnsavedChanges() and
// leaves through leavePage() or leaveBack(); the browser's own "Leave
// site?" prompt is left for closing the tab or reloading, where browsers
// allow nothing else.

let currentCheck = null
let currentKeptInTab = null
let isLeaving = false

// `keptInTab` (1.6.82): true while session restore holds a copy of the CV
// in this tab. Moving to another page of the site then loses nothing, so
// hasUnsavedChanges() says no and App.jsx doesn't ask. Closing the tab
// still clears that copy, and a page can't tell a close from a reload, so
// the browser's own prompt stays for both.
export function registerUnsavedChangesCheck(check, { keptInTab = () => false } = {}) {
  const handleBeforeUnload = (event) => {
    if (!isLeaving && check()) {
      event.preventDefault()
      // Older browsers only prompt when returnValue is set.
      event.returnValue = ''
    }
  }

  // A page kept in the back/forward cache comes back with its guard on.
  const handlePageShow = (event) => {
    if (event.persisted) {
      isLeaving = false
    }
  }

  currentCheck = check
  currentKeptInTab = keptInTab
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('pageshow', handlePageShow)

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    window.removeEventListener('pageshow', handlePageShow)
    if (currentCheck === check) {
      currentCheck = null
      currentKeptInTab = null
    }
  }
}

export function hasUnsavedChanges() {
  return currentCheck ? currentCheck() && !currentKeptInTab?.() : false
}

// For a move within the site that hasUnsavedChanges() didn't need to ask
// about: the browser's prompt must not ask either.
export function allowUnload() {
  isLeaving = true
}

// A page load the visitor already confirmed in the dialog: no second,
// browser-drawn prompt on the way out.
export function leavePage(url) {
  isLeaving = true
  window.location.assign(url)
}

// Back out of the builder past its guard entry (App.jsx's
// BUILDER_GUARD_STATE), to the page before it. Opened straight at /cv,
// there's no page before it, so the landing page instead; the timer is
// cleared if the page goes (or is kept in the back/forward cache).
export function leaveBack(fallbackUrl) {
  isLeaving = true
  const timer = window.setTimeout(() => window.location.assign(fallbackUrl), 600)
  window.addEventListener('pagehide', () => window.clearTimeout(timer), { once: true })
  window.history.go(-2)
}
