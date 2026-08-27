function AppShell({
  nav,
  sidebar,
  content,
  shellStyle = {},
  showContentOnMobile = true,
  navCollapsed = false,
}) {
  return (
    <div
      style={shellStyle}
      className="app-shell px-0 transition-colors print:px-0 print:py-0"
    >
      <div
        className="app-shell__surface mx-auto w-full transition-colors print:min-h-0 print:h-auto print:max-w-none print:rounded-none print:border-0 print:bg-white print:shadow-none"
        style={navCollapsed ? { '--nav-width': 'var(--nav-width-collapsed)' } : undefined}
      >
        {nav ? (
          <div className="app-shell__nav print:hidden">
            {nav}
          </div>
        ) : null}
        <aside
          className="app-shell__editor min-w-0 transition-colors print:hidden"
        >
          {sidebar}
        </aside>
        <main
          className={`app-shell__preview min-w-0 transition-colors print:bg-white ${
            showContentOnMobile ? 'block' : 'hidden lg:block'
          }`}
        >
          {content}
        </main>
      </div>
    </div>
  )
}

export default AppShell
