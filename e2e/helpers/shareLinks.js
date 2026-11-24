import { expect } from '@playwright/test'
import { copyShareLink, fontTrigger, styleTrigger } from './builderToolbar.js'
import { pickTemplate } from './templateGallery.js'

// Share links in e2e (1.7.12). A copied link opens the read-only /view
// page; a spec that wants the builder opens the link's edit address, the
// same rewrite as shareLinks.js's shareEditUrl, kept here so specs don't
// import app code: /view#data=X becomes /cv#data=X&edit=1.
export function shareEditUrl(shareUrl) {
  const url = new URL(shareUrl)
  const data = new URLSearchParams(url.hash.replace(/^#/, '')).get('data') ?? ''
  url.pathname = '/cv'
  url.search = ''
  url.hash = `data=${data}&edit=1`
  return url.toString()
}

// The builder's share link for the demo CV, read off the clipboard. The
// options set what the sender sends: a template (its gallery label), that
// template's look by index (`variants` is its getTemplateVariants list), a
// font label, a paper ('letter') picked in the PDF preview, and a CV
// language button label in Settings ('Suomi').
export async function copyLinkFromBuilder(page, context, {
  template, variants, variantIndex, font, paper, cvLanguage,
} = {}) {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/cv')
  await page.getByRole('button', { name: 'Load demo CV' }).first().click()

  if (template) {
    await pickTemplate(page, template)
  }
  if (variants && variantIndex !== undefined) {
    await (await styleTrigger(page)).click()
    await page.getByRole('radiogroup', { name: 'Select style' })
      .getByRole('radio', { name: variants[variantIndex].label.en }).click()
  }
  if (font) {
    await (await fontTrigger(page)).click()
    await page.getByRole('option', { name: font, exact: true }).click()
    await expect(await fontTrigger(page)).toHaveAccessibleName(`Select font: ${font}`)
  }
  if (paper) {
    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    await page.getByRole('menuitem', { name: 'PDF' }).click()
    const dialog = page.getByRole('dialog', { name: 'PDF preview' })
    await dialog.locator(`input[type="radio"][value="${paper}"]`).check()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  }
  if (cvLanguage) {
    await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
    await page.getByRole('menuitem', { name: 'Settings' }).click()
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    await dialog.getByRole('button', { name: cvLanguage, exact: true }).click()
    await expect(dialog.getByRole('button', { name: cvLanguage, exact: true })).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('Escape')
  }

  await copyShareLink(page)
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#data=')
  return page.evaluate(() => navigator.clipboard.readText())
}
