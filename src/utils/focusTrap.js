// Shared by the two focus traps (Modal.jsx, SectionEditorPopup.jsx): the
// controls Tab really stops on inside a dialog, in DOM order, so a trap
// wraps at the true first and last ones (1.6.13).
//
// Everything that can take focus. A hidden input matches `input` but can
// never be focused, so it's excluded.
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

const isGroupedRadio = (element) =>
  element instanceof HTMLInputElement && element.type === 'radio' && element.name !== ''

// Of a named radio group, Tab stops only on the checked radio, or on the
// first one when none is checked; the arrow keys reach the rest. Treating
// an unchecked radio as a dialog's first or last element let focus walk
// out of the trap. Groups are keyed by name within `container` (no dialog
// here holds more than one <form>).
export function getTabStops(container) {
  const candidates = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
  const groupStops = new Map()

  for (const element of candidates) {
    if (!isGroupedRadio(element)) {
      continue
    }
    const current = groupStops.get(element.name)
    if (!current || (!current.checked && element.checked)) {
      groupStops.set(element.name, element)
    }
  }

  return candidates.filter((element) => !isGroupedRadio(element) || groupStops.get(element.name) === element)
}
