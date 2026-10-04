import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import SectionEditorPopup from './SectionEditorPopup'
import { getSectionSchema } from '../utils/sectionSchema'

// Every Showcase already tags its section wrappers with
// data-export-section (and its header with data-export-header) for the
// PDF exporter. Reusing those as the hover target is what lets this
// overlay reach all 18 templates without touching a single template file.
const SECTION_SELECTOR = '[data-export-section], [data-export-header]'

// One entry of a record-array section. Unlike the section attributes this
// one exists only for Direct Edit, and its value is always a formData
// index (templates map snapshot-relative indices through
// snapshot.sourceIndices), so it can go straight to the popup.
const ENTRY_SELECTOR = '[data-direct-edit-index]'

function resolveSectionKey(target) {
  const match = target.closest?.(SECTION_SELECTOR)

  if (!match) {
    return null
  }

  if (match.hasAttribute('data-export-section')) {
    return match.getAttribute('data-export-section')
  }

  // The header block is not a sectionOrder section; the schema models it
  // under the synthetic key "identity".
  return 'identity'
}

function sectionSelectorFor(sectionKey) {
  // identity is synthetic — it is the header block, which carries
  // data-export-header rather than a data-export-section of its own.
  return sectionKey === 'identity'
    ? '[data-export-header]'
    : `[data-export-section="${sectionKey}"]`
}

export default function SectionEditOverlay({
  formData,
  dispatchFormData,
  templateConfig,
  locale,
  // Filled with { openSectionFromNav(sectionKey) } for the builder's nav
  // rail, which lives outside this component.
  apiRef = null,
}) {
  const containerRef = useRef(null)
  const popupAnchorRef = useRef(null)
  const [hovered, setHovered] = useState(null)
  const [hoveredEntry, setHoveredEntry] = useState(null)
  const [openSectionKey, setOpenSectionKey] = useState(null)
  // The entry an entry pencil opened the popup on, or null when it was
  // opened for the whole section. Its top is captured at click time so the
  // popup opens beside that entry rather than at the section's top, which
  // on a long Experience list can be a whole screen above it.
  const [focusEntry, setFocusEntry] = useState(null)
  const [popupPosition, setPopupPosition] = useState(null)
  // Editable sections in DOM order, used only to render the keyboard
  // triggers below. Derived from the same attributes the pointer path
  // uses, so it stays template-agnostic.
  const [sections, setSections] = useState([])

  // Measured in container coordinates (sectionRect - containerRect), not
  // viewport coordinates: the overlay and the preview scroll together, so
  // this offset is scroll-invariant and needs no scroll listener.
  const measure = useCallback((element, sectionKey) => {
    const container = containerRef.current

    if (!container || !element) {
      return null
    }

    const base = container.getBoundingClientRect()
    const rect = element.getBoundingClientRect()

    return {
      sectionKey,
      top: rect.top - base.top,
      left: rect.left - base.left,
      right: rect.right - base.left,
      width: rect.width,
    }
  }, [])

  // The lookup goes through the HOST's parent: containerRef points at
  // .direct-edit-overlay-host, which only ever contains the overlay's own
  // chrome, never a [data-export-section].
  const findSectionElement = useCallback(
    (sectionKey) =>
      containerRef.current?.parentElement?.querySelector(sectionSelectorFor(sectionKey)) ?? null,
    [],
  )

  // Shared by the keyboard triggers: point the pencil at a section
  // without a pointer ever touching it.
  const focusSection = useCallback(
    (sectionKey) => {
      const measured = measure(findSectionElement(sectionKey), sectionKey)

      if (measured) {
        setHovered(measured)
      }

      return measured
    },
    [findSectionElement, measure],
  )

  // The listener goes on the PARENT (.direct-edit-preview), not on this
  // overlay host. Two reasons, both fatal to the obvious approach:
  //   1. The host is `pointer-events: none` so inline contentEditable
  //      editing keeps working underneath it — a pointer-events:none
  //      element never becomes an event target at all.
  //   2. The host is a SIBLING of <CVPreview>, not its ancestor, so
  //      events from the CV's sections would never bubble to it anyway.
  // The shared parent is the nearest node that actually sees both.
  useEffect(() => {
    const host = containerRef.current
    const parent = host?.parentElement

    if (!parent) {
      return undefined
    }

    const handlePointerOver = (event) => {
      if (openSectionKey) {
        return
      }

      // Ignore our own chrome — it lives inside the host, whose children
      // do take pointer events.
      if (event.target.closest?.('.direct-edit-overlay-host')) {
        return
      }

      const element = event.target.closest?.(SECTION_SELECTOR)

      if (!element) {
        return
      }

      const sectionKey = resolveSectionKey(event.target)

      if (!sectionKey || !getSectionSchema(sectionKey)) {
        return
      }

      setHovered(measure(element, sectionKey))

      // The entry must belong to THIS section: a section nested inside
      // another's wrapper would otherwise pick up its parent's entries.
      const entryElement = event.target.closest?.(ENTRY_SELECTOR)
      const entryIndex = Number(entryElement?.getAttribute('data-direct-edit-index'))

      if (
        entryElement &&
        element.contains(entryElement) &&
        entryElement.closest(SECTION_SELECTOR) === element &&
        Number.isInteger(entryIndex)
      ) {
        const measured = measure(entryElement, sectionKey)
        setHoveredEntry((prev) =>
          prev && prev.index === entryIndex && prev.top === measured.top && prev.right === measured.right
            ? prev
            : { ...measured, index: entryIndex },
        )
      } else {
        setHoveredEntry(null)
      }
    }

    const handlePointerLeave = () => {
      if (!openSectionKey) {
        setHovered(null)
        setHoveredEntry(null)
      }
    }

    const handlePointerDown = (event) => {
      if (!openSectionKey) {
        return
      }

      // Click-outside closes; clicks on the popup or pencil do not.
      if (event.target.closest?.('.direct-edit-popup, .direct-edit-pencil')) {
        return
      }

      setOpenSectionKey(null)
      setHovered(null)
      setHoveredEntry(null)
    }

    parent.addEventListener('pointerover', handlePointerOver)
    parent.addEventListener('pointerleave', handlePointerLeave)
    parent.addEventListener('pointerdown', handlePointerDown)

    return () => {
      parent.removeEventListener('pointerover', handlePointerOver)
      parent.removeEventListener('pointerleave', handlePointerLeave)
      parent.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [measure, openSectionKey])

  // Content reflows as the user types, so re-measure the active section
  // after every formData change to keep the pencil attached to it.
  //
  // The lookup must go through the HOST's parent, not the host itself:
  // containerRef points at .direct-edit-overlay-host, which only ever
  // contains the pencil and popup anchor, never a [data-export-section] —
  // the same reason the pointer listeners above are attached to
  // parentElement (.direct-edit-preview) rather than the host.
  // querySelector on the host itself always returns null here, silently
  // turning this whole effect into a no-op.
  useLayoutEffect(() => {
    if (!hovered) {
      return
    }

    const container = containerRef.current?.parentElement
    const element = container?.querySelector(sectionSelectorFor(hovered.sectionKey))
    const next = measure(element, hovered.sectionKey)

    if (next && (next.top !== hovered.top || next.left !== hovered.left || next.right !== hovered.right)) {
      setHovered(next)
    }
  }, [formData, hovered, measure])

  // Same for the entry an entry pencil opened the popup on: the popup is
  // anchored to its top, so when the entry moves (the section changed
  // column, or content above it reflowed) the anchor has to move with it.
  // The lookup is inline for the same reason as above.
  useLayoutEffect(() => {
    if (!focusEntry || !openSectionKey) {
      return
    }

    const element = containerRef.current?.parentElement?.querySelector(
      `${sectionSelectorFor(openSectionKey)} [data-direct-edit-index="${focusEntry.index}"]`,
    )
    const next = measure(element, openSectionKey)

    if (next && next.top !== focusEntry.top) {
      setFocusEntry({ index: focusEntry.index, top: next.top })
    }
  }, [formData, focusEntry, openSectionKey, measure])

  // Enumerate the editable sections so each can get a real focusable
  // trigger. Re-runs on content and template changes because a template
  // swap renders a different set of sections entirely.
  useLayoutEffect(() => {
    const parent = containerRef.current?.parentElement

    if (!parent) {
      return
    }

    const found = []
    const seen = new Set()

    for (const element of parent.querySelectorAll(SECTION_SELECTOR)) {
      const sectionKey = element.hasAttribute('data-export-section')
        ? element.getAttribute('data-export-section')
        : 'identity'

      if (!sectionKey || seen.has(sectionKey) || !getSectionSchema(sectionKey)) {
        continue
      }

      seen.add(sectionKey)
      found.push(sectionKey)
    }

    setSections((prev) =>
      prev.length === found.length && prev.every((key, index) => key === found[index])
        ? prev
        : found,
    )
  }, [formData, templateConfig])

  const openSection = useCallback(
    (sectionKey) => {
      // The popup renders only while `hovered` describes its section, so
      // measure before opening rather than relying on a pointer having
      // already done it.
      if (focusSection(sectionKey)) {
        setFocusEntry(null)
        setOpenSectionKey(sectionKey)
      }
    },
    [focusSection],
  )

  // Return focus to the trigger that opened the popup, so a keyboard user
  // lands back where they were instead of at the top of the document.
  // Only this path restores focus: the click-outside handler closes by
  // setting state directly, and yanking focus out from under a mouse user
  // who just clicked elsewhere would be wrong.
  const handleClose = useCallback(() => {
    const previousKey = openSectionKey

    setOpenSectionKey(null)
    setHovered(null)
    setHoveredEntry(null)

    if (previousKey) {
      containerRef.current
        ?.querySelector(`[data-direct-edit-trigger="${previousKey}"]`)
        ?.focus()
    }
  }, [openSectionKey])

  // Place the popup beside the section it edits, on whichever side has
  // room, and keep it inside the container.
  //
  // `top` is a plain CSS value here (no transform), so it clamps
  // directly. `left` is the anchor's CSS "left", which the stylesheet
  // shifts by translate(-100%, 0) to make it the popup's *right* edge —
  // so every `left` below reads as "where the popup's RIGHT edge goes",
  // and keeping its visual left edge >= 0 means keeping this value >= the
  // popup's own measured width, not >= 0.
  //
  // Right first, then left, then overlap. The overlap fallback is not
  // dead code: on a full-width template the section nearly fills the
  // container (~765px of 1088 with a 380px popup), so neither side fits
  // and covering part of the section is the only option left.
  useLayoutEffect(() => {
    // No reset-to-null branch here: popupPosition is only read from the
    // render below while `openSectionKey && hovered` is true, so a stale
    // value while closed is harmless, and this effect recomputes a fresh
    // one as soon as a popup opens again.
    if (!openSectionKey || !hovered) {
      return
    }

    const container = containerRef.current
    const anchor = popupAnchorRef.current

    if (!container || !anchor) {
      return
    }

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const popupWidth = anchor.offsetWidth
    const popupHeight = anchor.offsetHeight

    const anchorTop = focusEntry ? focusEntry.top : hovered.top
    const top = Math.max(0, Math.min(anchorTop, containerHeight - popupHeight))

    // hovered.left/right are already container-relative, so these are the
    // gaps between the section and the container's own edges.
    const roomRight = containerWidth - hovered.right
    const roomLeft = hovered.left

    let left

    if (roomRight >= popupWidth) {
      // Popup's left edge sits on the section's right edge.
      left = hovered.right + popupWidth
    } else if (roomLeft >= popupWidth) {
      // Popup's right edge sits on the section's left edge. This is the
      // case that matters most: a narrow sidebar section (Creative's rail
      // is ~248px) used to be covered outright by the popup editing it,
      // with the whole main column sitting free to its left.
      left = hovered.left
    } else {
      left = Math.max(hovered.right, popupWidth)
    }

    setPopupPosition((prev) => (prev && prev.top === top && prev.left === left ? prev : { top, left }))
  }, [openSectionKey, hovered, focusEntry])

  useImperativeHandle(apiRef, () => ({
    openSectionFromNav(sectionKey) {
      const element = findSectionElement(sectionKey)

      if (!element) {
        return
      }

      // Instant rather than smooth: the popup-into-view scroll below runs
      // as soon as the popup opens and would cut a smooth scroll short.
      // scroll-margin-top (direct-edit.css) keeps the section clear of the
      // sticky toolbar.
      element.scrollIntoView({ block: 'start', behavior: 'auto' })
      openSection(sectionKey)
    },
  }), [findSectionElement, openSection])

  // Bring the popup fully into view once it opens (e.g. a section near
  // the bottom of a long, scrollable preview) — complements the clamp
  // above, which only keeps it inside the container's own bounds.
  useEffect(() => {
    if (!openSectionKey) {
      return
    }

    const popupEl = popupAnchorRef.current?.querySelector('.direct-edit-popup')
    popupEl?.scrollIntoView({ block: 'nearest' })
  }, [openSectionKey])

  return (
    <div ref={containerRef} className="direct-edit-overlay-host">
      {/* The pencil below reveals on pointerover only, which left the whole
          editor unreachable without a pointer. These are real buttons,
          visually hidden until focused (the skip-link pattern), so Tab
          walks the editable sections on every template with no
          per-template code. Focusing one also points the pencil at its
          section, so a sighted keyboard user sees where they are. */}
      {sections.length ? (
        <div className="direct-edit-keyboard-triggers">
          {sections.map((sectionKey) => {
            const schema = getSectionSchema(sectionKey)
            const label = locale === 'fi' ? schema.labelFi : schema.labelEn

            return (
              <button
                key={sectionKey}
                type="button"
                className="direct-edit-keyboard-trigger"
                data-direct-edit-trigger={sectionKey}
                onFocus={() => focusSection(sectionKey)}
                onClick={() => openSection(sectionKey)}
              >
                {locale === 'fi' ? `Muokkaa osiota ${label}` : `Edit ${label} section`}
              </button>
            )
          })}
        </div>
      ) : null}

      {hovered && !openSectionKey ? (
        <button
          type="button"
          className="direct-edit-pencil"
          style={{ top: `${hovered.top}px`, left: `${hovered.right}px` }}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => {
            setFocusEntry(null)
            setOpenSectionKey(hovered.sectionKey)
          }}
          aria-label={locale === 'fi' ? 'Muokkaa osiota' : 'Edit section'}
        >
          &#9998;
        </button>
      ) : null}

      {/* Pointer-only on purpose: the section's keyboard trigger already
          reaches every entry, and one extra tab stop per entry would bury
          the section triggers on a long CV. */}
      {hovered && hoveredEntry && !openSectionKey ? (
        <button
          type="button"
          className="direct-edit-entry-pencil"
          style={{ top: `${hoveredEntry.top}px`, left: `${hoveredEntry.right}px` }}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => {
            setFocusEntry({ index: hoveredEntry.index, top: hoveredEntry.top })
            setOpenSectionKey(hoveredEntry.sectionKey)
          }}
          aria-label={
            locale === 'fi'
              ? `Muokkaa kohdetta ${hoveredEntry.index + 1}`
              : `Edit entry ${hoveredEntry.index + 1}`
          }
        >
          &#9998;
        </button>
      ) : null}

      {openSectionKey && hovered ? (
        <div
          ref={popupAnchorRef}
          className="direct-edit-popup-anchor"
          style={{
            top: `${popupPosition ? popupPosition.top : (focusEntry ? focusEntry.top : hovered.top)}px`,
            left: `${popupPosition ? popupPosition.left : hovered.right}px`,
          }}
        >
          <SectionEditorPopup
            sectionKey={openSectionKey}
            formData={formData}
            dispatchFormData={dispatchFormData}
            templateConfig={templateConfig}
            locale={locale}
            focusEntryIndex={focusEntry ? focusEntry.index : null}
            onClose={handleClose}
          />
        </div>
      ) : null}
    </div>
  )
}
