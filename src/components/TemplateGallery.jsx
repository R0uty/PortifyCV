import { memo, useMemo } from 'react'

import { getUiTheme } from '../utils/designSystem'

function TemplateThumbnail({ template, isDark }) {
  const frameClassName = isDark
    ? 'border-white/12 bg-black/50'
    : 'border-black/12 bg-gray-50'
  const accentClassName = isDark ? 'bg-white/80' : 'bg-black/70'
  const titleLineClassName = isDark ? 'bg-white/80' : 'bg-black/60'
  const bodyLineClassName = isDark ? 'bg-white/6' : 'bg-black/40'
  const chipClassName = isDark
    ? 'w-full rounded-md border border-white bg-white px-2 py-1 text-center text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-black'
    : 'w-full rounded-md border border-black bg-black px-2 py-1 text-center text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white'

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

function TemplateGallery({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  theme = 'dark',
  locale = 'en',
}) {
  const ui = useMemo(() => getUiTheme(theme), [theme])
  const isFinnish = locale === 'fi'

  return (
    <section className={`surface-shadow rounded-[var(--radius-card)] border p-4 sm:p-5 ${ui.surface}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`ds-kicker ${ui.textMuted}`}>
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
                    {template.layout === 'split'
                      ? isFinnish ? 'Jaettu asettelu' : 'Split layout'
                      : isFinnish ? 'Yhden palstan asettelu' : 'Single-column layout'}
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {isSelected ? (
                    <span className="rounded-full border border-[var(--accent-border)] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent-text-strong)]">
                      {isFinnish ? 'Aktiivinen' : 'Active'}
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
