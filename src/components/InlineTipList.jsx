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
          className={`rounded-2xl border px-4 py-3 ${
            item.type === 'warning'
              ? ui.isDark
                ? 'border-gray-400/20 bg-gray-400/10 text-gray-100'
                : 'border-gray-300 bg-gray-50 text-gray-800'
              : `${ui.surfaceMuted} ${ui.textSecondary}`
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-sm/6 opacity-90">{item.message}</p>
            </div>
            {item.action && onAction ? (
              <button
                type="button"
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
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
