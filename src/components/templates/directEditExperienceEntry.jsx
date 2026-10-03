// Shared Experience-entry renderer for the oneColumn-family templates
// whose entry markup is identical apart from a CSS class prefix and the
// company/location separator glyph: Classic Professional, Editorial,
// Portrait. Confirmed identical (down to the exact conditional shapes,
// not just the visible output) by directly comparing all three files
// before this module was written — see the Direct Edit Phase 2 roadmap
// and the Round 4 plan for the full reasoning.
//
// Modern Timeline (Phase 2 Round 4) does NOT use this — its entries
// render inside a `TimelineRow` wrapper with the date as an external
// prop, a genuinely different DOM shape discovered while wiring that
// round. See `TimelineShowcase.jsx`'s own local `renderExperienceEntry`
// instead. Any future template whose entry shape doesn't match the one
// below should do the same — get its own local copy, not a forced fit
// into this one.

import EditableField from '../EditableField'
import { formatDateRange } from './shared'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function nonBlank(list) {
  return Array.isArray(list) ? list.map((value) => (typeof value === 'string' ? value.trim() : '')).filter(Boolean) : []
}

// Shared across all 17 bespoke Showcases (3 through this module's own
// renderExperienceEntry, 14 as local copies of the identical pattern) so
// "what bullets/technologies an experience entry shows" has exactly one
// definition — see docs/template-audit-phase2.md F14/G8a. `description`
// bullets come first, then `achievements` (both are further bullets in the
// template's existing bullet-list style); blank/whitespace-only strings
// are dropped from both sources so an empty field never renders an empty
// bullet or line.
export function getExperienceBullets(item) {
  return [...(item.description ? splitToBullets(item.description) : []), ...nonBlank(item.achievements)]
}

// Direct Edit's editing branch shows `description` through its own
// EditableField (not as bullets), so it needs achievements on their own —
// this is that subset of getExperienceBullets().
export function getExperienceAchievements(item) {
  return nonBlank(item.achievements)
}

export function getExperienceTechnologies(item) {
  return nonBlank(item.technologies)
}

// `index` is always formData.experience-relative (only ever read inside
// directEditDispatch-gated branches below) — never assume it lines up with
// snapshot.experience's own (filtered) indices in the read-only call site.
//
// `sourceIndex` is what Direct Edit's entry pencil reads, so it must be the
// formData index: the default covers the EditableList call site, and the
// snapshot call site passes snapshot.sourceIndices.experience[index].
export function renderExperienceEntry(item, index, { directEditDispatch, copy, classPrefix, separator = ' · ', sourceIndex = index }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = getExperienceBullets(item)
  const achievements = getExperienceAchievements(item)
  const technologies = getExperienceTechnologies(item)

  return (
    <div key={`${item.role}-${item.company}-${index}`} className={`${classPrefix}__entry`} data-export-card="true" data-direct-edit-index={sourceIndex}>
      <div className={`${classPrefix}__entry-row`}>
        <p className={`${classPrefix}__entry-role`}>
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'role' }}
              value={item.role}
              placeholder={copy.untitledRole}
            />
          ) : (
            item.role || copy.untitledRole
          )}
        </p>
        <p className={`${classPrefix}__entry-dates`}>{dateRange || copy.datesPending}</p>
      </div>
      {directEditDispatch || item.company || item.location ? (
        <p className={`${classPrefix}__entry-meta`}>
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
              value={item.company}
              placeholder={copy.company}
            />
          ) : (
            item.company
          )}
          {item.company && item.location ? `${separator}${item.location}` : item.location || null}
        </p>
      ) : null}
      {directEditDispatch ? (
        <>
          <p className={`${classPrefix}__bullets ${classPrefix}__bullets--editing`}>
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
              value={item.description}
              placeholder={copy.descriptionPlaceholder}
              multiline
            />
          </p>
          {achievements.length > 0 ? (
            <ul className={`${classPrefix}__bullets`}>
              {achievements.map((line, lineIndex) => (
                <li key={lineIndex}>{line}</li>
              ))}
            </ul>
          ) : null}
        </>
      ) : bullets.length > 0 ? (
        <ul className={`${classPrefix}__bullets`}>
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
      {technologies.length > 0 ? (
        <p className={`${classPrefix}__entry-meta`}>{technologies.join(separator)}</p>
      ) : null}
    </div>
  )
}
