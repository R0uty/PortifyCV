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
        background: `radial-gradient(circle at top, var(--accent-glow), transparent 34%), ${
          isDark
            ? 'linear-gradient(180deg, #020617 0%, #0f172a 100%)'
            : 'linear-gradient(180deg, #eef6ff 0%, #f8fafc 100%)'
        }`,
        ...shellStyle,
      }}
      className={`app-shell app-shell--${theme} min-h-screen px-0 transition-colors print:px-0 print:py-0 ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      <div
        className={`app-shell__surface page-shadow mx-auto w-full border backdrop-blur transition-all duration-300 print:min-h-0 print:h-auto print:max-w-none print:rounded-none print:border-0 print:bg-white print:shadow-none ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}
      >
        <aside
          className={`app-shell__editor min-w-0 border-b transition-colors print:hidden ${
            isDark ? 'border-white/10' : 'border-slate-200'
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
