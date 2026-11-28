// The builder toolbar's Design panel and More menu (1.6.67). Style, Font
// and Headings sit in the Design panel, and Clear CV in the More menu,
// so a test opens those first.

const banner = (page) => page.getByRole('banner')

// Opens the Design panel unless it's already open. Clicking anywhere
// else (the CV, the gallery, another toolbar menu) closes it, so each
// trigger helper below calls this again.
export async function openDesign(page) {
  const trigger = banner(page).getByRole('button', { name: /^(Design|Ulkoasu)\b/ })
  if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
    await trigger.click()
  }
}

export async function styleTrigger(page) {
  await openDesign(page)
  return banner(page).getByRole('button', { name: /^(Select style|Valitse tyyli):/ })
}

export async function fontTrigger(page) {
  await openDesign(page)
  return banner(page).getByRole('button', { name: /^(Select font|Valitse fontti):/ })
}

export async function headingColorTrigger(page) {
  await openDesign(page)
  return banner(page).getByRole('button', { name: /^Select heading color:/ })
}

// Clear CV is two-step: the first pick arms it, the second clears.
export async function clearCv(page) {
  await banner(page).getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: 'Clear CV' }).click()
  await page.getByRole('menuitem', { name: 'Confirm clear' }).click()
}

// Copy share link sits at the bottom of the Export menu.
export async function copyShareLink(page) {
  await banner(page).getByRole('button', { name: 'Export', exact: true }).click()
  await page.getByRole('menuitem', { name: /^Copy share link/ }).click()
}

// Opens the toolbar's language menu (1.7.14) and picks a builder language
// by its own name: 'English', 'Suomi' or 'Svenska'.
export async function chooseBuilderLanguage(page, name) {
  await banner(page).getByRole('button', { name: /^(Language|Kieli|Språk)\b/ }).click()
  await page.getByRole('menuitemradio', { name: new RegExp(`^${name}\\b`) }).click()
}
