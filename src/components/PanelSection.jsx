import { getUiTheme } from '../utils/designSystem'

function PanelSection({
  eyebrow,
  title,
  description,
  children,
  theme = 'dark',
  badge = null,
}) {
  const ui = getUiTheme(theme)
  const badgeClasses =
    badge?.tone === 'warning'
      ? ui.isDark
        ? 'bg-gray-400/15 text-gray-100'
        : 'bg-gray-100 text-gray-700'
      : 'accent-surface accent-text-strong'

  return (
    <section
      className={`editor-card fade-in-up p-5 transition-all duration-300 sm:p-6 ${ui.surface}`}
    >
      <p className="ds-kicker accent-text uppercase tracking-[0.14em]">{eyebrow}</p>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h2 className={`ds-section-title font-bold uppercase tracking-[-0.02em] sm:text-2xl ${ui.textPrimary}`}>{title}</h2>
        {badge ? (
          <span className={`shrink-0 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${badgeClasses}`}>
            {badge.label}
          </span>
        ) : null}
      </div>
      <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default PanelSection
