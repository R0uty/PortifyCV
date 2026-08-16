import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { getUiTheme } from '../utils/designSystem'

function PanelSection({
  id,
  eyebrow,
  title,
  description,
  children,
  theme = 'dark',
  badge = null,
  defaultCollapsed = false,
}) {
  const ui = getUiTheme(theme)
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const badgeClasses =
    badge?.tone === 'warning'
      ? 'bg-gray-100 text-gray-700'
      : 'accent-surface accent-text-strong'

  return (
    <section
      id={id}
      className={`editor-card fade-in-up p-5 transition-all duration-300 sm:p-6 ${ui.surface}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
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
        </div>
        <button
          type="button"
          className="panel-section__toggle"
          onClick={() => setIsCollapsed((previous) => !previous)}
          aria-expanded={!isCollapsed}
          aria-label={typeof title === 'string' ? title : undefined}
        >
          <ChevronDown
            size={18}
            strokeWidth={2}
            className={`panel-section__chevron${isCollapsed ? ' panel-section__chevron--collapsed' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>
      <div className={`panel-section__body${isCollapsed ? ' panel-section__body--collapsed' : ''}`}>
        <div className="panel-section__body-inner">
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </section>
  )
}

export default PanelSection
