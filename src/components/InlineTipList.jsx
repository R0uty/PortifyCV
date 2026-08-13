import { getUiTheme } from '../utils/designSystem'

export default function InlineTipList({
  items = [],
  theme = 'dark',
}) {
  const ui = getUiTheme(theme)

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
          <p className="text-sm font-bold uppercase tracking-[0.04em]">{item.title}</p>
          <p className="mt-1 text-sm/6 opacity-90">{item.message}</p>
        </div>
      ))}
    </div>
  )
}
