import { getUiTheme } from '../utils/designSystem'

export default function InlineTipList({
  items = [],
  theme = 'dark',
  locale = 'en',
  actionLabel = '',
  onAction = null,
}) {
  const ui = getUiTheme(theme)
  const isFinnish = locale === 'fi'

  if (items.length === 0) {
    return null
  }

  return (
    <div className="mt-3 space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`px-4 py-3 ${
            item.type === 'warning'
              ? ui.isDark
                ? 'bg-red-500/8 text-red-400'
                : 'bg-gray-50 text-gray-800'
              : `${ui.surfaceMuted} ${ui.textSecondary}`
          }`}
          style={{ border: '1px solid var(--app-border)' }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.04em]">{item.title}</p>
              <p className="mt-1 text-sm/6 opacity-90">{item.message}</p>
            </div>
            {item.action && onAction ? (
              <button
                type="button"
                className={`shrink-0 border px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`}
                onClick={onAction}
              >
                {actionLabel || (isFinnish ? 'Paranna tekstiä' : 'Improve text')}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
