import { useLayoutEffect, useState } from 'react'

const VIEWPORT_MARGIN = 8

// Positions a popover panel (a toolbar dropdown, in practice) with
// `position: fixed` clamped to the viewport, instead of relying on the
// panel's own `position: absolute; right: 0;` relative to its trigger.
// That CSS-only approach assumes the trigger sits somewhere with room to
// its left for the panel to hang from — true when the toolbar fits on one
// row, but the toolbar's `flex-wrap` can push a trigger to the far left of
// a wrapped second row (any narrower desktop width, or just one more
// toolbar control added later), at which point a `right: 0`-anchored panel
// renders mostly off-screen and becomes unclickable.
//
// Returns `{ style, ready }`: apply `style` to the panel (it's `undefined`
// until `ready`, during which the caller should keep the panel invisible —
// position can't be computed before both the trigger and the panel
// (for its real rendered width/height) exist in the DOM).
export function useAnchoredPanelPosition(isOpen, triggerRef, panelRef) {
  const [style, setStyle] = useState(undefined)

  useLayoutEffect(() => {
    // No reset-to-undefined here when closing: the caller only renders the
    // panel while `isOpen`, so a stale `style` sitting in state between
    // sessions is harmless, and skipping it avoids a setState call outside
    // the "compute and apply the real position" path below. Reopening
    // recomputes synchronously (useLayoutEffect, before paint) anyway.
    if (!isOpen) {
      return undefined
    }

    function reposition() {
      const trigger = triggerRef.current
      const panel = panelRef.current
      if (!trigger || !panel) {
        return
      }

      const triggerRect = trigger.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Right-align under the trigger by default (matches the panel's old
      // `right: 0` look), clamped so it never runs off either edge.
      let left = triggerRect.right - panelRect.width
      left = Math.max(VIEWPORT_MARGIN, left)
      left = Math.min(left, viewportWidth - panelRect.width - VIEWPORT_MARGIN)

      let top = triggerRect.bottom + 8
      if (top + panelRect.height > viewportHeight - VIEWPORT_MARGIN) {
        const above = triggerRect.top - 8 - panelRect.height
        top = above >= VIEWPORT_MARGIN ? above : Math.max(VIEWPORT_MARGIN, viewportHeight - panelRect.height - VIEWPORT_MARGIN)
      }

      setStyle({ position: 'fixed', top, left })
    }

    reposition()

    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    return () => {
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
    }
  }, [isOpen, triggerRef, panelRef])

  return { style, ready: style !== undefined }
}
