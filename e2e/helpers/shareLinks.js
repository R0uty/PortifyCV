import { expect } from '@playwright/test'
import { copyShareLink } from './builderToolbar.js'

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

// The builder's share link for the demo CV, read off the clipboard.
export async function copyLinkFromBuilder(page, context) {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/cv')
  await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  await copyShareLink(page)
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#data=')
  return page.evaluate(() => navigator.clipboard.readText())
}
