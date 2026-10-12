import { expect } from '../fixtures/base.js'

// Picks a template in the builder's template gallery by its card name and
// waits for the gallery to close. Shared by every spec that switches
// templates through the gallery (1.6.15; it used to be copied in three).
// It matches only the card names, exactly: the gallery's field chips
// (1.6.12) share labels such as "Creative" and "Graduate" with cards.
const GALLERY = {
  en: { trigger: /^Select template:/, dialog: 'Template gallery' },
  fi: { trigger: /^Valitse pohja:/, dialog: 'Pohjagalleria' },
}

export async function pickTemplate(page, label, { locale = 'en' } = {}) {
  const names = GALLERY[locale]
  await page.getByRole('button', { name: names.trigger }).click()
  const dialog = page.getByRole('dialog', { name: names.dialog })
  await dialog.locator('.template-gallery__name').getByText(label, { exact: true }).click()
  await expect(dialog).toBeHidden()
}
