function AppShell({
  sidebar,
  content,
  theme = 'dark',
  shellStyle = {},
  showContentOnMobile = true,
}) {
  const isDark = theme === 'dark'

  return (
    <div
      style={{
        background: isDark ? '#1a1a1a' : '#ffffff',
        ...shellStyle,
      }}
      className={`app-shell app-shell--${theme} min-h-screen px-0 transition-colors print:px-0 print:py-0 ${
        isDark ? 'text-gray-100' : 'text-gray-900'
      }`}
    >
      <div
        className={`app-shell__surface mx-auto w-full border transition-colors print:min-h-0 print:h-auto print:max-w-none print:rounded-none print:border-0 print:bg-white print:shadow-none ${
          isDark ? 'border-white/12' : 'border-black/10'
        }`}
      >
        <aside
          className={`app-shell__editor min-w-0 border-b transition-colors print:hidden ${
            isDark ? 'border-white/12' : 'border-black/10'
          }`}
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
