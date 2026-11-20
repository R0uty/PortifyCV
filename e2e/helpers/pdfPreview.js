import { expect } from '@playwright/test'

// PDF export opens a preview first (1.6.74): the Export menu's PDF item shows
// the pages, and its Download PDF button saves them. Call this right after
// clicking the menu item; it resolves with the download. The cover letter's
// preview (1.7.9) has its own title and no fit options.
export async function downloadFromPdfPreview(page, { timeout = 60_000, paper, fit } = {}) {
  const dialog = page.getByRole('dialog', { name: /^(PDF preview|PDF-esikatselu|Cover letter PDF|Hakemuskirjeen PDF)$/ })
  const button = dialog.getByRole('button', { name: /Download PDF|Lataa PDF/ })

  if (paper) {
    await dialog.locator(`input[type="radio"][value="${paper}"]`).check()
  }

  if (fit) {
    await dialog.locator(`input[type="radio"][value="${fit}"]`).check()
  }

  await expect(button).toBeEnabled({ timeout })
  const downloadPromise = page.waitForEvent('download', { timeout })
  await button.click()
  return downloadPromise
}
