import Logo from './Logo'

function NavItem({ item, isActive, locale, onNavigate }) {
  const Icon = item.icon

  return (
    <li>
      <button
        type="button"
        className={`nav-rail__item${isActive ? ' nav-rail__item--active' : ''}`}
        aria-current={isActive ? 'true' : undefined}
        onClick={() => onNavigate(item)}
      >
        <span className="nav-rail__item-indicator" aria-hidden="true" />
        <Icon size={17} strokeWidth={2} aria-hidden="true" />
        <span className="nav-rail__item-label">{item.label[locale] ?? item.label.en}</span>
      </button>
    </li>
  )
}

function NavRail({
  sections = [],
  utilityItems = [],
  activeSectionId,
  onNavigate,
  locale = 'en',
  version = '',
}) {
  const isFinnish = locale === 'fi'

  return (
    <nav className="nav-rail" aria-label={isFinnish ? 'Osionavigointi' : 'Section navigation'}>
      <div className="nav-rail__brand">
        <Logo size={22} />
        <span className="nav-rail__brand-text">PortifyCV</span>
      </div>

      {sections.length ? (
        <p className="nav-rail__group-label">{isFinnish ? 'Osiot' : 'Sections'}</p>
      ) : null}
      <ul className="nav-rail__list" role="list">
        {sections.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            locale={locale}
            isActive={item.id === activeSectionId}
            onNavigate={onNavigate}
          />
        ))}
      </ul>

      <div className="nav-rail__divider" role="separator" />

      {utilityItems.length ? (
        <p className="nav-rail__group-label">{isFinnish ? 'Työkalut' : 'Tools'}</p>
      ) : null}
      <ul className="nav-rail__list" role="list">
        {utilityItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            locale={locale}
            isActive={item.id === activeSectionId}
            onNavigate={onNavigate}
          />
        ))}
      </ul>

      {version ? (
        <div className="nav-rail__footer">
          <p className="nav-rail__version">v{version}</p>
        </div>
      ) : null}
    </nav>
  )
}

export default NavRail
