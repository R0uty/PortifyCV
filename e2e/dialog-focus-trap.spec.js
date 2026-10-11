import { test, expect } from './fixtures/base.js'

// The Tab trap in Modal.jsx and SectionEditorPopup.jsx must wrap at the
// first and last controls Tab really stops on (1.6.13). Of a radio group
// only the checked radio is a tab stop, and a hidden input never is, so
// treating either as the dialog's first or last element let focus walk out
// of the dialog. No current dialog puts one at an edge, so each test adds
// one to an open dialog to recreate that layout.

const focusIsIn = (page, selector) => page.evaluate(
  (sel) => Boolean(document.activeElement?.closest(sel)),
  selector,
)

// Appends (or prepends) a probe radio group to `selector`. The checked
// radio is the group's only tab stop; the unchecked one is never reached
// by Tab but used to sit at the dialog's edge.
const addRadioGroup = (page, selector, { atStart = false } = {}) => page.evaluate(({ sel, start }) => {
  const host = document.querySelector(sel)
  const group = document.createElement('div')
  group.setAttribute('data-probe', 'radios')
  const checked = Object.assign(document.createElement('input'), { type: 'radio', name: 'probe', value: 'a', checked: true })
  checked.setAttribute('aria-label', 'Probe checked')
  const unchecked = Object.assign(document.createElement('input'), { type: 'radio', name: 'probe', value: 'b' })
  unchecked.setAttribute('aria-label', 'Probe unchecked')
  // At the start the unchecked radio comes first, at the end it comes
  // last, so it's the edge element either way.
  group.append(...(start ? [unchecked, checked] : [checked, unchecked]))
  if (start) {
    host.prepend(group)
  } else {
    host.append(group)
  }
}, { sel: selector, start: atStart })

test.describe('Dialog focus trap', () => {
  const openGallery = async (page) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: /^Select template:/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Template gallery' })
    await expect(dialog).toBeVisible()
    return dialog
  }

  test('Tab from the last tab stop wraps when a radio group ends the dialog', async ({ page }) => {
    const dialog = await openGallery(page)
    await addRadioGroup(page, '.modal-panel__body')

    await dialog.getByRole('radio', { name: 'Probe checked' }).focus()
    await page.keyboard.press('Tab')

    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused()
  })

  test('Shift+Tab from the first tab stop wraps when a radio group starts the dialog', async ({ page }) => {
    const dialog = await openGallery(page)
    await addRadioGroup(page, '.modal-panel', { atStart: true })

    await dialog.getByRole('radio', { name: 'Probe checked' }).focus()
    await page.keyboard.press('Shift+Tab')

    await expect(dialog.getByRole('button', { name: 'Get the badge' })).toBeFocused()
  })

  test('Tab from the last control wraps when a hidden input ends the dialog', async ({ page }) => {
    const dialog = await openGallery(page)
    await page.evaluate(() => {
      document.querySelector('.modal-panel__body')
        .append(Object.assign(document.createElement('input'), { type: 'hidden', name: 'probe-hidden' }))
    })

    await dialog.getByRole('button', { name: 'Get the badge' }).focus()
    await page.keyboard.press('Tab')

    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused()
  })

  test('the Direct Edit popup wraps when a radio group ends it', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    // Opened by keyboard, as in direct-edit.spec.js's own trap test.
    await page.getByRole('button', { name: 'Edit About section' }).focus()
    await page.keyboard.press('Enter')
    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()
    await addRadioGroup(page, '.direct-edit-popup')

    await popup.getByRole('radio', { name: 'Probe checked' }).focus()
    await page.keyboard.press('Tab')

    expect(await focusIsIn(page, '.direct-edit-popup')).toBe(true)
    await expect(popup.getByRole('radio', { name: 'Probe checked' })).not.toBeFocused()
  })
})
