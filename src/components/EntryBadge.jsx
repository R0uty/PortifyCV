import { builder } from '../i18n/builder'

export default function EntryBadge({ count = 0, locale = 'en' }) {
  if (count === 0) {
    return null
  }

  return (
    <span
      className="px-3 py-1 text-xs font-bold uppercase tracking-[0.06em]"
      style={{
        backgroundColor: 'rgba(0,0,0,0.06)',
        color: '#111111',
        border: '1px solid var(--app-border)',
      }}
    >
      {builder.t(locale, 'entryBadge.tips', { count })}
    </span>
  )
}
