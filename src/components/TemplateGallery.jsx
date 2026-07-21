import { memo, useMemo } from 'react'

import { getUiTheme } from '../utils/designSystem'

function TemplateThumbnail({ template, isDark }) {
  const frameStyle = {
    borderColor: isDark ? 'rgba(229,229,229,0.15)' : 'rgba(0,0,0,0.12)',
    backgroundColor: isDark ? '#0a0a0a' : '#f9fafb',
  }
  const accentStyle = { backgroundColor: '#111111' }
  const titleLineStyle = { backgroundColor: isDark ? '#e5e5e5' : 'rgba(0,0,0,0.70)' }
  const bodyLineStyle = { backgroundColor: isDark ? 'rgba(229,229,229,0.12)' : 'rgba(0,0,0,0.40)' }
  const chipStyle = {
    width: '100%',
    border: `1px solid ${isDark ? 'rgba(229,229,229,0.15)' : '#111111'}`,
    backgroundColor: isDark ? '#0a0a0a' : '#111111',
    padding: '0.25rem 0.5rem',
    textAlign: 'center',
    fontSize: '0.6rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: isDark ? '#e5e5e5' : '#ffffff',
  }

  return (
    <div className="overflow-hidden border" style={frameStyle}>
      <div className="h-8 w-full" style={accentStyle} />
      <div className="space-y-3 p-3">
        <div className="space-y-2">
          <div className="h-2 w-full" style={titleLineStyle} />
          <div className="h-2 w-full" style={bodyLineStyle} />
        </div>
        <div className={`grid gap-2 ${template.layout === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div className="space-y-2">
            {template.thumbnail.blockWidths.map((_, index) => (
              <div key={index} className="h-2 w-full" style={bodyLineStyle} />
            ))}
          </div>
          {template.layout === 'split' ? (
            <div className="space-y-2">
              {template.thumbnail.chips.map((chip) => (
                <div key={chip} style={chipStyle}>
                  {chip}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {template.layout === 'stacked' ? (
          <div className="grid grid-cols-2 gap-1.5">
            {template.thumbnail.chips.map((chip) => (
              <div key={chip} style={chipStyle}>
                {chip}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function TemplateGallery({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  theme = 'dark',
  locale = 'en',
}) {
  const ui = useMemo(() => getUiTheme(theme), [theme])
  const isDark = ui.isDark
  const isFinnish = locale === 'fi'

  return (
    <section className={`p-4 sm:p-5 ${ui.surface}`} style={{ border: '1px solid var(--app-border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ds-kicker uppercase tracking-[0.14em] accent-text">
            {isFinnish ? 'Pohjagalleria' : 'Template gallery'}
          </p>
          <p className={`mt-3 text-sm ${ui.textSecondary}`}>
            {isFinnish
              ? 'Vaihda asettelua milloin tahansa ilman että jo syöttämäsi sisältö muuttuu.'
              : 'Switch layouts any time without changing the CV content you already entered.'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template.id

          return (
            <button
              key={template.id}
              type="button"
              className={`group h-full w-full p-3 text-left transition ${
                isSelected
                  ? `${ui.buttonActive}`
                  : `${ui.surfaceMuted}`
              }`}
              style={{
                border: `1px solid ${isSelected ? 'var(--accent-border)' : 'var(--app-border)'}`,
                '--hover-bg': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--hover-bg)' }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '' }}
              onClick={() => onSelectTemplate(template.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-bold uppercase tracking-[0.04em] ${ui.textPrimary}`}>{template.label}</p>
                  <p className={`mt-1 text-xs ${ui.textMuted}`}>
                    {template.layout === 'split'
                      ? isFinnish ? 'Jaettu asettelu' : 'Split layout'
                      : isFinnish ? 'Yhden palstan asettelu' : 'Single-column layout'}
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {isSelected ? (
                    <span className="px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--accent-text-strong)', border: '1px solid var(--accent-border)' }}>
                      {isFinnish ? 'AKTIIVINEN' : 'ACTIVE'}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3">
                <TemplateThumbnail template={template} isDark={ui.isDark} />
              </div>

              <p className={`mt-3 text-sm leading-6 ${ui.textSecondary}`}>
                {template.description}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

const MemoizedTemplateGallery = memo(TemplateGallery)

MemoizedTemplateGallery.displayName = 'TemplateGallery'

export default MemoizedTemplateGallery
