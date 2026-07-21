export default function EntryBadge({ count = 0, locale = 'en' }) {
  const isFinnish = locale === 'fi'

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
      {isFinnish
        ? `${count} vinkkiä`
        : `${count} tip${count === 1 ? '' : 's'}`}
    </span>
  )
}
