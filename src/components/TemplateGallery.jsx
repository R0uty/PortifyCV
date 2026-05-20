import { memo, useMemo } from 'react'

import { getUiTheme } from '../utils/designSystem'

function TemplateThumbnail({ template }) {
  const thumbnail = template.thumbnail

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 ${thumbnail.surfaceClassName}`}>
      <div className={`h-8 w-full ${thumbnail.accentClassName}`} />
      <div className="space-y-3 p-3">
        <div className="space-y-2">
          <div className={`h-2 rounded-full bg-slate-300 ${thumbnail.titleWidthClassName}`} />
          <div className={`h-2 rounded-full bg-slate-200 ${thumbnail.subtitleWidthClassName}`} />
        </div>
        <div className={`grid gap-2 ${thumbnail.primaryRatioClassName}`}>
          <div className="space-y-2">
            {thumbnail.blockWidths.map((widthClassName) => (
              <div key={widthClassName} className={`h-2 rounded-full bg-slate-200 ${widthClassName}`} />
            ))}
          </div>
          {template.layout === 'split' ? (
            <div className="space-y-2">
              {thumbnail.chips.map((chip) => (
                <div
                  key={chip}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-500"
                >
                  {chip}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {template.layout === 'stacked' ? (
          <div className="flex flex-wrap gap-1.5">
            {thumbnail.chips.map((chip) => (
              <div
                key={chip}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-500"
              >
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
              className={`group rounded-[1.5rem] border p-3 text-left transition ${
                isSelected
                  ? `${ui.buttonActive} shadow-[0_10px_30px_-18px_var(--accent-border)]`
                  : `${ui.surfaceMuted} hover:border-[var(--accent-border)] hover:bg-white/80`
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
                  {template.mostPopular ? (
                    <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent-text-strong)]">
                      Most popular
                    </span>
                  ) : null}
                  {isSelected ? (
                    <span className="rounded-full border border-[var(--accent-border)] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent-text-strong)]">
                      Active
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3">
                <TemplateThumbnail template={template} />
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
