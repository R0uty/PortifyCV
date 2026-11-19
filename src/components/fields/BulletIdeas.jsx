import { useContext, useEffect, useId, useMemo, useState } from 'react'
import { ChevronDown, Lightbulb, Plus } from 'lucide-react'
import { CvLanguageContext } from '../cvLanguageContext'
import { loadBulletIdeas, rankIdeaRoles } from '../../utils/bulletIdeas'

const VISIBLE_BULLETS = 6

// "Get ideas" under a job's achievements (1.7.8): example bullets from the
// closest role, numbers blanked to [__], added with one click. Nothing is
// loaded until the panel is opened (utils/bulletIdeas.js loads the example
// CVs lazily). `onAdd` appends through the list's own onChange, so an added
// bullet is one undoable edit, like typing.
function BulletIdeas({ roleText = '', items = [], onAdd, locale = 'en' }) {
  const cvLocale = useContext(CvLanguageContext) ?? locale
  const isFinnish = locale === 'fi'
  const panelId = useId()
  const pickerId = useId()
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(null)
  const [failedKey, setFailedKey] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [expanded, setExpanded] = useState(false)
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

  return (
    <div className="bullet-ideas" data-bullet-ideas>
      <button
        type="button"
        className="bullet-ideas__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <Lightbulb size={14} strokeWidth={2} aria-hidden="true" />
        {isFinnish ? 'Hae ideoita' : 'Get ideas'}
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" className={open ? 'bullet-ideas__chevron bullet-ideas__chevron--open' : 'bullet-ideas__chevron'} />
      </button>
      {open && (
        <div id={panelId} className="bullet-ideas__panel">
          {failed ? (
            <p className="bullet-ideas__note" role="alert">
              {isFinnish ? 'Ideoita ei voitu ladata.' : "Couldn't load ideas."}
              {' '}
              <button type="button" className="bullet-ideas__link" onClick={() => setAttempt(attempt + 1)}>
                {isFinnish ? 'Yritä uudelleen' : 'Try again'}
              </button>
            </p>
          ) : !roles ? (
            <p className="bullet-ideas__note" role="status">{isFinnish ? 'Ladataan ideoita…' : 'Loading ideas…'}</p>
          ) : (
            <>
              <div className="bullet-ideas__picker">
                <label htmlFor={pickerId} className="bullet-ideas__label">{isFinnish ? 'Ideat roolista' : 'Ideas from'}</label>
                <select
                  id={pickerId}
                  className="bullet-ideas__select"
                  value={selectedId}
                  onChange={(event) => { setChosen(event.target.value); setExpanded(false) }}
                >
                  <option value="">{isFinnish ? 'Valitse rooli' : 'Choose a role'}</option>
                  {ranked.map((role) => (
                    <option key={role.roleId} value={role.roleId}>{role.roleLabel}</option>
                  ))}
                </select>
              </div>
              {selected && remaining.length === 0 && (
                <p className="bullet-ideas__note">
                  {isFinnish ? 'Kaikki tämän roolin ideat ovat jo tässä työssä.' : 'All ideas from this role are in this job.'}
                </p>
              )}
              {shown.length > 0 && (
                <ul className="bullet-ideas__list">
                  {shown.map((bullet) => (
                    <li key={bullet} className="bullet-ideas__item">
                      <span className="bullet-ideas__text">{bullet}</span>
                      <button
                        type="button"
                        className="bullet-ideas__add"
                        aria-label={isFinnish ? `Lisää: ${bullet}` : `Add: ${bullet}`}
                        onClick={() => onAdd(bullet)}
                      >
                        <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
                        {isFinnish ? 'Lisää' : 'Add'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!expanded && remaining.length > VISIBLE_BULLETS && (
                <button type="button" className="bullet-ideas__link" onClick={() => setExpanded(true)}>
                  {isFinnish ? 'Näytä lisää' : 'Show more'}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default BulletIdeas
