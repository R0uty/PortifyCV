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

// `index` is always formData.experience-relative (only ever read inside
// directEditDispatch-gated branches below) — never assume it lines up with
// snapshot.experience's own (filtered) indices in the read-only call site.
export function renderExperienceEntry(item, index, { directEditDispatch, copy, classPrefix, separator = ' · ' }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <div key={`${item.role}-${item.company}-${index}`} className={`${classPrefix}__entry`} data-export-card="true">
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
        <p className={`${classPrefix}__bullets ${classPrefix}__bullets--editing`}>
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className={`${classPrefix}__bullets`}>
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
