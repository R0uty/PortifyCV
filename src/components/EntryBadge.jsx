import { getUiTheme } from '../utils/designSystem'

export default function EntryBadge({ count = 0, theme = 'dark', locale = 'en' }) {
  const ui = getUiTheme(theme)
  const isFinnish = locale === 'fi'

  if (count === 0) {
    return null
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        ui.isDark ? 'bg-gray-400/15 text-gray-100' : 'bg-gray-100 text-gray-700'
      }`}
    >
      {isFinnish
        ? `${count} vinkkiä`
        : `${count} tip${count === 1 ? '' : 's'}`}
    </span>
  )
}
