import { memo, useMemo } from 'react'

import { getUiTheme } from '../utils/designSystem'

function TemplateThumbnail({ template, isDark }) {
  const frameClassName = isDark
    ? 'border-white/15 bg-slate-950/70'
    : 'border-slate-200 bg-slate-50'
  const accentClassName = isDark ? 'bg-slate-200' : 'bg-slate-800'
  const titleLineClassName = isDark ? 'bg-slate-500' : 'bg-slate-300'
  const bodyLineClassName = isDark ? 'bg-slate-700' : 'bg-slate-200'
  const chipClassName = isDark
    ? 'w-full rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-center text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-300'
    : 'w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-center text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-500'

  return (
    <div className={`overflow-hidden rounded-2xl border ${frameClassName}`}>
      <div className={`h-8 w-full ${accentClassName}`} />
      <div className="space-y-3 p-3">
        <div className="space-y-2">
          <div className={`h-2 w-full rounded-full ${titleLineClassName}`} />
          <div className={`h-2 w-full rounded-full ${bodyLineClassName}`} />
        </div>
        <div className={`grid gap-2 ${template.layout === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div className="space-y-2">
            {template.thumbnail.blockWidths.map((_, index) => (
              <div key={index} className={`h-2 w-full rounded-full ${bodyLineClassName}`} />
            ))}
          </div>
          {template.layout === 'split' ? (
            <div className="space-y-2">
              {template.thumbnail.chips.map((chip) => (
                <div key={chip} className={chipClassName}>
                  {chip}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {template.layout === 'stacked' ? (
          <div className="grid grid-cols-2 gap-1.5">
            {template.thumbnail.chips.map((chip) => (
              <div key={chip} className={chipClassName}>
                {chip}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function TemplateGallery({ templates, selectedTemplateId, onSelectTemplate, theme = 'dark' }) {
  const ui = useMemo(() => getUiTheme(theme), [theme])

  return (
    <section className={`surface-shadow rounded-[var(--radius-card)] border p-4 sm:p-5 ${ui.surface}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`ds-kicker ${ui.textMuted}`}>Template gallery</p>
          <p className={`mt-3 text-sm ${ui.textSecondary}`}>
            Switch layouts any time without changing the CV content you already entered.
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
              className={`group h-full w-full rounded-[1.5rem] border p-3 text-left transition ${
                isSelected
                  ? `${ui.buttonActive} shadow-[0_10px_30px_-18px_var(--accent-border)]`
                  : `${ui.surfaceMuted} hover:border-[var(--accent-border)] ${ui.isDark ? 'hover:bg-white/8' : 'hover:bg-white'}`
              }`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold ${ui.textPrimary}`}>{template.label}</p>
                  <p className={`mt-1 text-xs ${ui.textMuted}`}>
                    {template.layout === 'split' ? 'Split layout' : 'Single-column layout'}
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {isSelected ? (
                    <span className="rounded-full border border-[var(--accent-border)] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent-text-strong)]">
                      Active
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
