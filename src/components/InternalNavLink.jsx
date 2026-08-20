// A plain <a> with a real href (so right-click/open-in-new-tab/no-JS all
// work), but its click is intercepted for an in-app SPA transition via
// App.jsx's goToView/goToBuilder instead of a full page reload — same
// pattern as the footer's guide links and the privacy page's logo link.
function InternalNavLink({ to, onNavigate, className, children }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        event.preventDefault()
        onNavigate()
      }}
    >
      {children}
    </a>
  )
}

export default InternalNavLink
