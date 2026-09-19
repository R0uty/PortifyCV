import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import SectionEditorPopup from './SectionEditorPopup'
import { getSectionSchema } from '../utils/sectionSchema'

// Every Showcase already tags its section wrappers with
// data-export-section (and its header with data-export-header) for the
// PDF exporter. Reusing those as the hover target is what lets this
// overlay reach all 18 templates without touching a single template file.
const SECTION_SELECTOR = '[data-export-section], [data-export-header]'

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

export default function SectionEditOverlay({
  formData,
  dispatchFormData,
  templateConfig,
  locale,
}) {
  const containerRef = useRef(null)
  const popupAnchorRef = useRef(null)
  const [hovered, setHovered] = useState(null)
  const [openSectionKey, setOpenSectionKey] = useState(null)
  const [popupPosition, setPopupPosition] = useState(null)

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
    }

    const handlePointerLeave = () => {
      if (!openSectionKey) {
        setHovered(null)
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
    const selector =
      hovered.sectionKey === 'identity'
        ? '[data-export-header]'
        : `[data-export-section="${hovered.sectionKey}"]`
    const element = container?.querySelector(selector)
    const next = measure(element, hovered.sectionKey)

    if (next && (next.top !== hovered.top || next.left !== hovered.left || next.right !== hovered.right)) {
      setHovered(next)
    }
  }, [formData, hovered, measure])

  const handleClose = useCallback(() => {
    setOpenSectionKey(null)
    setHovered(null)
  }, [])

  // Clamp the popup so it stays inside the container instead of opening
  // off-screen: a section low in a long CV would otherwise anchor a
  // popup (up to 70vh tall) entirely below the fold, and a narrow
  // left-sidebar section can push `left` negative. This is the cheap
  // mitigation — clamping, not side-flipping. True side-flipping (opening
  // on whichever side actually has room) is deferred to a later phase.
  //
  // `top` is a plain CSS value here (no transform), so it clamps
  // directly. `left` is the anchor's CSS "left", which the stylesheet
  // shifts by translate(-100%, 0) to make it the popup's *right* edge —
  // so clamping the popup's visual left edge to >= 0 means clamping this
  // value to >= the popup's own measured width, not to >= 0.
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

    const containerHeight = container.clientHeight
    const popupWidth = anchor.offsetWidth
    const popupHeight = anchor.offsetHeight

    const top = Math.max(0, Math.min(hovered.top, containerHeight - popupHeight))
    const left = Math.max(hovered.right, popupWidth)

    setPopupPosition((prev) => (prev && prev.top === top && prev.left === left ? prev : { top, left }))
  }, [openSectionKey, hovered])

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
      {hovered && !openSectionKey ? (
        <button
          type="button"
          className="direct-edit-pencil"
          style={{ top: `${hovered.top}px`, left: `${hovered.right}px` }}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setOpenSectionKey(hovered.sectionKey)}
          aria-label={locale === 'fi' ? 'Muokkaa osiota' : 'Edit section'}
        >
          &#9998;
        </button>
      ) : null}

      {openSectionKey && hovered ? (
        <div
          ref={popupAnchorRef}
          className="direct-edit-popup-anchor"
          style={{
            top: `${popupPosition ? popupPosition.top : hovered.top}px`,
            left: `${popupPosition ? popupPosition.left : hovered.right}px`,
          }}
        >
          <SectionEditorPopup
            sectionKey={openSectionKey}
            formData={formData}
            dispatchFormData={dispatchFormData}
            templateConfig={templateConfig}
            locale={locale}
            onClose={handleClose}
          />
        </div>
      ) : null}
    </div>
  )
}
