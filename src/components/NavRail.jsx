import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

function NavItem({ item, isActive, locale, isCollapsed, onNavigate }) {
  const Icon = item.icon
  const label = item.label[locale] ?? item.label.en

  return (
    <li>
      <button
        type="button"
        className={`nav-rail__item${isActive ? ' nav-rail__item--active' : ''}`}
        aria-current={isActive ? 'true' : undefined}
        // Doubles as the accessible name once the label text is hidden
        // (display:none) in collapsed mode — a screen reader would
        // otherwise announce nothing but the icon.
        aria-label={isCollapsed ? label : undefined}
        title={isCollapsed ? label : undefined}
        onClick={() => onNavigate(item)}
      >
        <span className="nav-rail__item-indicator" aria-hidden="true" />
        <Icon size={17} strokeWidth={2} aria-hidden="true" />
        <span className="nav-rail__item-label">{label}</span>
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
  isCollapsed = false,
  onToggleCollapsed = () => {},
}) {
  const isFinnish = locale === 'fi'
  const toggleLabel = isCollapsed
    ? (isFinnish ? 'Laajenna navigointi' : 'Expand navigation')
    : (isFinnish ? 'Tiivistä navigointi' : 'Collapse navigation')

  return (
    <nav
      className={`nav-rail${isCollapsed ? ' nav-rail--collapsed' : ''}`}
      aria-label={isFinnish ? 'Osionavigointi' : 'Section navigation'}
    >
      <button
        type="button"
        className="nav-rail__collapse-toggle"
        onClick={onToggleCollapsed}
        aria-label={toggleLabel}
        title={toggleLabel}
      >
        {isCollapsed ? (
          <PanelLeftOpen size={15} strokeWidth={2} aria-hidden="true" />
        ) : (
          <PanelLeftClose size={15} strokeWidth={2} aria-hidden="true" />
        )}
      </button>

      {sections.length && !isCollapsed ? (
        <p className="nav-rail__group-label">{isFinnish ? 'Osiot' : 'Sections'}</p>
      ) : null}
      <ul className="nav-rail__list" role="list">
        {sections.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            locale={locale}
            isActive={item.id === activeSectionId}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </ul>

      <div className="nav-rail__divider" role="separator" />

      {utilityItems.length && !isCollapsed ? (
        <p className="nav-rail__group-label">{isFinnish ? 'Työkalut' : 'Tools'}</p>
      ) : null}
      <ul className="nav-rail__list" role="list">
        {utilityItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            locale={locale}
            isActive={item.id === activeSectionId}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </ul>

      {version && !isCollapsed ? (
        <div className="nav-rail__footer">
          <p className="nav-rail__version">v{version}</p>
        </div>
      ) : null}
    </nav>
  )
}

export default NavRail
