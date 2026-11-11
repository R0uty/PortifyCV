import { test, expect } from './fixtures/base.js'

// 1.6.66: the builder asks before a page load would lose edits (in its own
// dialog since 1.6.68), its touch targets are big enough for a finger, and
// its toasts sit at the bottom of a phone screen instead of over the CV.

const returnButton = (page) => page.getByRole('button', { name: 'Return to landing' })

// Records every browser-drawn dialog, answering "Stay" to a "Leave site?"
// prompt; the app's own leave dialog never shows up here.
const recordDialogs = (page) => {
  const dialogs = []
  page.on('dialog', (dialog) => {
    dialogs.push(dialog.type())
    void dialog.dismiss()
  })
  return dialogs
}

test.describe('Leaving the builder', () => {
  const leaveDialog = (page) => page.getByRole('alertdialog', { name: 'Leave without saving?' })
  const editName = async (page) => {
    await page.goto('/cv')
    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.getByLabel('Full name').fill('Jordan Rivera')
  }

  // Session restore is on by default (1.6.82) and keeps the CV in the tab,
  // so the app has nothing to ask about. These cover the switch turned
  // off, except the tests at the end, which turn it back on.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('portifycv-session-restore', 'false'))
  })

  // 1.6.68: the app's own dialog, not the browser's "Leave site?" prompt.
  test('with an edit, the app asks first and Keep editing keeps the CV', async ({ page }) => {
    await editName(page)
    const dialogs = recordDialogs(page)

    await returnButton(page).click()

    await expect(leaveDialog(page)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Keep editing' })).toBeFocused()
    await page.getByRole('button', { name: 'Keep editing' }).click()
    await expect(leaveDialog(page)).toBeHidden()
    await expect(page).toHaveURL(/\/cv$/)
    await expect(page.getByLabel('Full name')).toHaveValue('Jordan Rivera')
    expect(dialogs).toEqual([])
  })

  test('Leave without saving goes without a second, browser prompt', async ({ page }) => {
    await editName(page)
    const dialogs = recordDialogs(page)

    await returnButton(page).click()
    await page.getByRole('button', { name: 'Leave without saving' }).click()

    await expect(page).toHaveURL(/\/$/)
    expect(dialogs).toEqual([])
  })

  test('Download JSON & leave saves a copy, then goes', async ({ page }) => {
    await editName(page)
    const dialogs = recordDialogs(page)

    await returnButton(page).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download JSON & leave' }).click()

    expect((await downloadPromise).suggestedFilename()).toMatch(/\.json$/)
    await expect(page).toHaveURL(/\/$/)
    expect(dialogs).toEqual([])
  })

  // 1.6.70: the browser's Back button too, not its plain prompt.
  test('Back asks in the same dialog, and Keep editing stays', async ({ page }) => {
    await page.goto('/about')
    await page.locator('.project-header__actions').getByRole('button', { name: 'Build my CV' }).click()
    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.getByLabel('Full name').fill('Jordan Rivera')
    const dialogs = recordDialogs(page)

    await page.goBack()
    await expect(leaveDialog(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(leaveDialog(page)).toBeHidden()
    await expect(page).toHaveURL(/\/cv$/)
    await expect(page.getByLabel('Full name')).toHaveValue('Jordan Rivera')

    // Asks again on a second Back, and Leave goes to the page before.
    await page.goBack()
    await page.getByRole('button', { name: 'Leave without saving' }).click()
    await expect(page).toHaveURL(/\/about$/)
    expect(dialogs).toEqual([])
  })

  test('Back without an edit just goes back', async ({ page }) => {
    await page.goto('/about')
    await page.locator('.project-header__actions').getByRole('button', { name: 'Build my CV' }).click()
    await expect(page.getByRole('tab', { name: 'Direct Edit' })).toBeVisible()

    await page.goBack()
    await expect(page).toHaveURL(/\/about$/)
  })

  test('without an edit, it leaves without asking', async ({ page }) => {
    await page.goto('/cv')
    const dialogs = recordDialogs(page)

    await returnButton(page).click()

    await expect(page).toHaveURL(/\/$/)
    expect(dialogs).toEqual([])
  })

  test('after a JSON export, it leaves without asking', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.getByLabel('Full name').fill('Jordan Rivera')
    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'JSON' }).click()
    await downloadPromise
    const dialogs = recordDialogs(page)

    await returnButton(page).click()

    await expect(page).toHaveURL(/\/$/)
    expect(dialogs).toEqual([])
  })

  test('with session restore on, it leaves without asking and the CV is there on the way back', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('portifycv-session-restore', 'true'))
    await page.goto('/cv')
    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.getByLabel('Full name').fill('Jordan Rivera')
    const dialogs = recordDialogs(page)

    // Straight away, before the debounced copy is written.
    await returnButton(page).click()

    await expect(page).toHaveURL(/\/$/)
    expect(dialogs).toEqual([])

    await page.goto('/cv')
    await expect(page.getByLabel('Full name')).toHaveValue('Jordan Rivera')
  })

  test('with session restore on, Back leaves without asking', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('portifycv-session-restore', 'true'))
    await page.goto('/about')
    await page.locator('.project-header__actions').getByRole('button', { name: 'Build my CV' }).click()
    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.getByLabel('Full name').fill('Jordan Rivera')
    const dialogs = recordDialogs(page)

    await page.goBack()
    await expect(page).toHaveURL(/\/about$/)
    await expect(leaveDialog(page)).toHaveCount(0)
    expect(dialogs).toEqual([])
  })

  // Closing the tab clears the kept copy, and a page can't tell a close
  // from a reload, so the browser's prompt stays for both.
  test('with session restore on, closing or reloading the tab still asks', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('portifycv-session-restore', 'true'))
    await page.goto('/cv')
    const asks = () => page.evaluate(() => {
      const event = new Event('beforeunload', { cancelable: true })
      window.dispatchEvent(event)
      return event.defaultPrevented
    })
    expect(await asks()).toBe(false)

    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.getByLabel('Full name').fill('Jordan Rivera')
    expect(await asks()).toBe(true)
  })
})

test.describe('Builder on a phone', () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true })

  // The suite opens the builder in Classic mode (playwright.config.js).
  const useDirectEdit = (page) => page.addInitScript(
    () => window.localStorage.setItem('portifycv-builder-mode', 'direct'),
  )
  const openingToast = (page) => page.getByRole('status').filter({ hasText: 'Loaded a sample CV' })

  test('in Direct Edit the opening toast sits at the bottom, in sentence case', async ({ page }) => {
    await useDirectEdit(page)
    await page.goto('/cv')
    const toast = openingToast(page)
    await expect(toast).toBeVisible()

    const box = await toast.boundingBox()
    expect(915 - (box.y + box.height)).toBeLessThanOrEqual(24)
    expect(await toast.locator('p').evaluate((node) => getComputedStyle(node).textTransform)).toBe('none')
  })

  test('in Classic the opening toast sits above the bottom bar', async ({ page }) => {
    await page.goto('/cv')
    const toast = openingToast(page)
    await expect(toast).toBeVisible()

    const toastBox = await toast.boundingBox()
    const barBox = await page.getByRole('tablist', { name: 'View selector' }).locator('xpath=..').boundingBox()
    expect(toastBox.y + toastBox.height).toBeLessThanOrEqual(barBox.y)
  })

  test('the opening toast speaks Finnish on a Finnish builder', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('ui-locale', 'fi'))
    await page.goto('/cv')
    await expect(page.getByRole('status').filter({ hasText: 'Esimerkki-CV ladattu' })).toBeVisible()
  })

  test('a skill chip\'s × and an entry\'s handles are big enough to tap', async ({ page }) => {
    await useDirectEdit(page)
    await page.goto('/cv')
    const chip = page.locator('.direct-edit-preview .direct-edit-chip--removable').first()
    await expect(chip).toBeVisible()
    await chip.evaluate((node) => node.scrollIntoView({ block: 'center' }))

    // What a tap at each point hits: the chip's right padding removes the
    // skill, the end of its name still renames it.
    const hits = await chip.evaluate((node) => {
      const label = node.querySelector('.direct-edit-chip__label').getBoundingClientRect()
      const chipBox = node.getBoundingClientRect()
      const at = (x, y) => document.elementFromPoint(x, y)?.className ?? ''
      const middle = chipBox.top + chipBox.height / 2
      return {
        rightPadding: at(chipBox.right - 2, middle),
        chipTop: at(chipBox.right - 6, chipBox.top + 1),
        nameEnd: at(label.right - 1, middle),
      }
    })
    expect(hits).toEqual({
      rightPadding: 'direct-edit-chip__remove',
      chipTop: 'direct-edit-chip__remove',
      nameEnd: 'direct-edit-chip__label',
    })

    const entry = page.locator('[data-export-section="experience"] .direct-edit-entry').first()
    await entry.evaluate((node) => node.scrollIntoView({ block: 'center' }))
    const targets = await entry.evaluate((node) => {
      // The area a tap reaches: from the hit area's edges inward.
      const reach = (button) => {
        const box = button.getBoundingClientRect()
        const hit = (x, y) => button.contains(document.elementFromPoint(x, y))
        const middleY = box.top + box.height / 2
        const middleX = box.left + box.width / 2
        let left = 0
        while (hit(box.left - left - 1, middleY)) left += 1
        let up = 0
        while (hit(middleX, box.top - up - 1)) up += 1
        let down = 0
        while (hit(middleX, box.bottom + down)) down += 1
        return { width: box.width + left, height: box.height + up + down }
      }
      return {
        handle: reach(node.querySelector('.direct-edit-entry__handle')),
        remove: reach(node.querySelector('.direct-edit-entry__remove')),
      }
    })
    for (const target of Object.values(targets)) {
      expect(target.width).toBeGreaterThanOrEqual(32)
      expect(target.height).toBeGreaterThanOrEqual(32)
    }
  })
})
