import { Laptop, Moon, Sun } from 'lucide-react'

import Logo from './Logo'

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Laptop,
}

const THEME_LABELS = {
  light: { en: 'Light', fi: 'Vaalea' },
  dark: { en: 'Dark', fi: 'Tumma' },
  system: { en: 'System', fi: 'Järjestelmä' },
}

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
  themePreference = 'system',
  onCycleThemePreference,
  version = '',
}) {
  const isFinnish = locale === 'fi'
  const ThemeIcon = THEME_ICONS[themePreference] ?? Laptop
  const themeLabel = THEME_LABELS[themePreference]?.[locale] ?? THEME_LABELS[themePreference]?.en ?? themePreference

  return (
    <nav className="nav-rail" aria-label={isFinnish ? 'Osionavigointi' : 'Section navigation'}>
      <div className="nav-rail__brand">
        <Logo size={22} />
        <span className="nav-rail__brand-text">PortifyCV</span>
      </div>

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

      <div className="nav-rail__footer">
        <button
          type="button"
          className="nav-rail__theme-toggle"
          onClick={onCycleThemePreference}
          aria-label={isFinnish ? `Teema: ${themeLabel}. Vaihda teemaa.` : `Theme: ${themeLabel}. Click to change.`}
          title={isFinnish ? `Teema: ${themeLabel}` : `Theme: ${themeLabel}`}
        >
          <ThemeIcon size={16} strokeWidth={2} aria-hidden="true" />
          <span>{themeLabel}</span>
        </button>
        {version ? <p className="nav-rail__version">v{version}</p> : null}
      </div>
    </nav>
  )
}

export default NavRail
