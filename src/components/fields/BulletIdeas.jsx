import { useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, Lightbulb, Plus } from 'lucide-react'
import { CvLanguageContext } from '../cvLanguageContext'
import { loadBulletIdeas, rankIdeaRoles } from '../../utils/bulletIdeas'
import { form } from '../../i18n/form'

const VISIBLE_BULLETS = 6

// "Get ideas" under a job's achievements (1.7.8): example bullets from the
// closest role, numbers blanked to [__], added with one click. Nothing is
// loaded until the panel is opened (utils/bulletIdeas.js loads the example
// CVs lazily). `onAdd` appends through the list's own onChange, so an added
// bullet is one undoable edit, like typing.
function BulletIdeas({ roleText = '', items = [], onAdd, locale = 'en' }) {
  const cvLocale = useContext(CvLanguageContext) ?? locale
  const t = (key, vars) => form.t(locale, key, vars)
  const panelId = useId()
  const pickerId = useId()
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(null)
  const [failedKey, setFailedKey] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState('')
  const toggleRef = useRef(null)
  const listRef = useRef(null)
  // The clicked Add button leaves with its idea, so focus would drop to the
  // page (and out of Direct Edit's modal popup). Once the idea is in `items`,
  // focus the Add button now in its place, else the one before, else the toggle.
  const pendingFocus = useRef(null)
  const loadKey = `${cvLocale}:${attempt}`
  const roles = loaded?.locale === cvLocale ? loaded.roles : null
  const failed = failedKey === loadKey

  useEffect(() => {
    if (!open) return undefined
    let cancelled = false
    loadBulletIdeas(cvLocale).then(
      (result) => { if (!cancelled) setLoaded({ locale: cvLocale, roles: result }) },
      () => { if (!cancelled) setFailedKey(loadKey) },
    )
    return () => { cancelled = true }
  }, [open, cvLocale, loadKey])

  const ranked = useMemo(() => (roles ? rankIdeaRoles(roleText, roles, cvLocale) : []), [roles, roleText, cvLocale])
  const defaultRoleId = ranked[0]?.score > 0 ? ranked[0].roleId : ''
  const selectedId = chosen ?? defaultRoleId
  const selected = ranked.find((role) => role.roleId === selectedId)
  const remaining = selected ? selected.bullets.filter((bullet) => !items.includes(bullet)) : []
  const shown = expanded ? remaining : remaining.slice(0, VISIBLE_BULLETS)

  useEffect(() => {
    const pending = pendingFocus.current
    if (!pending || !items.includes(pending.bullet)) return
    pendingFocus.current = null
    const buttons = listRef.current ? [...listRef.current.querySelectorAll('.bullet-ideas__add')] : []
    const target = buttons[pending.index] ?? buttons[pending.index - 1] ?? toggleRef.current
    target?.focus()
  })

  function handleAdd(bullet, index) {
    pendingFocus.current = { bullet, index }
    // The count changes with every Add, so a screen reader announces each
    // one (a live region repeating the same text is usually not re-read).
    const count = items.length + 1
    setStatus(t('ideas.added', { count }))
    onAdd(bullet)
  }

  function handleToggle() {
    setOpen(!open)
    setStatus('')
  }

  return (
    <div className="bullet-ideas" data-bullet-ideas>
      <button
        type="button"
        className="bullet-ideas__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        ref={toggleRef}
        onClick={handleToggle}
      >
        <Lightbulb size={14} strokeWidth={2} aria-hidden="true" />
        {t('ideas.toggle')}
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" className={open ? 'bullet-ideas__chevron bullet-ideas__chevron--open' : 'bullet-ideas__chevron'} />
      </button>
      {open && (
        <div id={panelId} className="bullet-ideas__panel">
          {failed ? (
            <p className="bullet-ideas__note" role="alert">
              {t('ideas.loadFailed')}
              {' '}
              <button type="button" className="bullet-ideas__link" onClick={() => setAttempt(attempt + 1)}>
                {t('ideas.retry')}
              </button>
            </p>
          ) : !roles ? (
            <p className="bullet-ideas__note" role="status">{t('ideas.loading')}</p>
          ) : (
            <>
              <div className="bullet-ideas__picker">
                <label htmlFor={pickerId} className="bullet-ideas__label">{t('ideas.from')}</label>
                <select
                  id={pickerId}
                  className="bullet-ideas__select"
                  value={selectedId}
                  onChange={(event) => { setChosen(event.target.value); setExpanded(false); setStatus('') }}
                >
                  <option value="">{t('ideas.chooseRole')}</option>
                  {ranked.map((role) => (
                    <option key={role.roleId} value={role.roleId}>{role.roleLabel}</option>
                  ))}
                </select>
              </div>
              {selected && remaining.length === 0 && (
                <p className="bullet-ideas__note">
                  {t('ideas.allAdded')}
                </p>
              )}
              {shown.length > 0 && (
                <ul className="bullet-ideas__list" ref={listRef}>
                  {shown.map((bullet, index) => (
                    <li key={bullet} className="bullet-ideas__item">
                      <span className="bullet-ideas__text">{bullet}</span>
                      <button
                        type="button"
                        className="bullet-ideas__add"
                        aria-label={t('ideas.addBullet', { bullet })}
                        onClick={() => handleAdd(bullet, index)}
                      >
                        <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
                        {t('ideas.add')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!expanded && remaining.length > VISIBLE_BULLETS && (
                <button type="button" className="bullet-ideas__link" onClick={() => setExpanded(true)}>
                  {t('ideas.showMore')}
                </button>
              )}
              <p className={status ? 'bullet-ideas__note' : 'sr-only'} role="status">{status}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default BulletIdeas
