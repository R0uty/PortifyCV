import { test, expect } from './fixtures/base.js'
import { pickTemplate } from './helpers/templateGallery.js'

// The demo CV's fixed skill list (src/utils/cvForm.js's DEMO_CV-equivalent
// seed data) — used by the Skills/EditableChip test below so it doesn't
// hardcode a count that would silently go stale if the seed data changes.
const DEMO_SKILLS = ['Product Strategy', 'Design Systems', 'User Research', 'Figma', 'Accessibility', 'Prototyping']

// A 1x1 PNG, inlined rather than committed as a fixture: e2e/ has no
// fixtures directory, and buildProfilePhotoDataUrl only needs bytes the
// browser can decode into an <img> before the canvas resize/re-encode.
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

// Lifted to file scope (was a local closure inside the "PDF export
// succeeds..." test) so the export-safety test below can share it too.
// Behaviour is unchanged — `page` is now a parameter instead of a closed-
// over variable.
async function exportPdfAndExpectSuccess(page) {
  await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('menuitem', { name: 'PDF' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  await expect(page.getByRole('alert')).toHaveCount(0)
}

// Geometry of an open popup relative to the section it edits and the
// preview container, in container-relative terms — the same coordinate
// space SectionEditOverlay measures in.
async function popupGeometry(page, sectionKey) {
  return page.evaluate((key) => {
    const popup = document.querySelector('.direct-edit-popup').getBoundingClientRect()
    const section = document.querySelector(`[data-export-section="${key}"]`).getBoundingClientRect()
    const container = document.querySelector('.direct-edit-preview').getBoundingClientRect()

    return {
      popupWidth: popup.width,
      popupLeft: popup.left,
      popupRight: popup.right,
      sectionLeft: section.left,
      sectionRight: section.right,
      containerLeft: container.left,
      containerRight: container.right,
      roomLeft: section.left - container.left,
      roomRight: container.right - section.right,
    }
  }, sectionKey)
}

// Every template in the gallery, by its English label.
const ALL_TEMPLATES = [
  'Minimalist', 'Developer', 'Creative', 'Modern Professional', 'Executive', 'Modern Timeline',
  'Graduate', 'Compact', 'Portfolio Hybrid', 'Tech Executive', 'Classic Professional',
  'Navy Professional', 'Modern Orange', 'Colorful Compact', 'Quadrant', 'Editorial', 'Portrait', 'European',
]

// The templates that must offer section column moves (cvTemplates.js
// `columnMoves: true`). The sweep below walks ALL_TEMPLATES and asserts the
// Column control appears on exactly these, so a template flagged in
// cvTemplates.js but missing here fails loudly instead of going untested.
const COLUMN_MOVE_TEMPLATES = ['Creative', 'Modern Professional', 'Executive', 'Graduate', 'Portfolio Hybrid', 'Tech Executive', 'Colorful Compact', 'Developer', 'Navy Professional', 'Modern Orange']

// Where a section currently renders: inside the sidebar container
// (every two-column template marks it data-export-secondary) or not,
// plus the placement the PDF exporter will read.
async function sectionColumnState(page, sectionKey) {
  return page.evaluate((key) => {
    const section = document.querySelector(`.direct-edit-preview [data-export-section="${key}"]`)

    if (!section) {
      return null
    }

    return {
      inSidebar: Boolean(section.closest('[data-export-secondary]')),
      placement: section.getAttribute('data-export-placement'),
      movedFrom: section.getAttribute('data-moved-from'),
      height: section.getBoundingClientRect().height,
    }
  }, sectionKey)
}

// The lowest text/background contrast ratio across every piece of text in
// a section, measured against the nearest opaque (or gradient) background.
// Used by the column-move sweep to compare a moved section against the
// sections the template itself designs for that column.
async function minTextContrast(page, selector) {
  return page.evaluate((sel) => {
    // Colours arrive as rgb()/rgba() in 0-255, except color-mix() results,
    // which Chrome reports as `color(srgb r g b [/ a])` in 0-1.
    const parse = (value) => {
      const parts = value.match(/[\d.]+/g).map(Number)
      const scale = value.startsWith('color(srgb') ? 255 : 1
      return { r: parts[0] * scale, g: parts[1] * scale, b: parts[2] * scale, a: parts[3] ?? 1 }
    }
    const backgroundOf = (element) => {
      for (let node = element; node; node = node.parentElement) {
        const style = getComputedStyle(node)
        const gradient = style.backgroundImage.includes('gradient')
          ? style.backgroundImage.match(/rgba?\([^)]+\)/)
          : null

        if (gradient) {
          return parse(gradient[0])
        }

        const color = parse(style.backgroundColor)

        if (color.a >= 0.9) {
          return color
        }
      }

      return { r: 255, g: 255, b: 255, a: 1 }
    }
    const luminance = ({ r, g, b }) => {
      const channel = (v) => {
        const c = v / 255
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    }
    const ratio = (element) => {
      const fg = luminance(parse(getComputedStyle(element).color))
      const bg = luminance(backgroundOf(element))
      return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)
    }

    let lowest = Infinity

    for (const section of document.querySelectorAll(sel)) {
      const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => (node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
      })

      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        lowest = Math.min(lowest, ratio(node.parentElement))
      }
    }

    return lowest
  }, selector)
}

// Opens a section's popup through its keyboard trigger, which exists for
// every section whether or not a pointer can reach it.
async function openSectionPopup(page, sectionKey) {
  await page.locator(`[data-direct-edit-trigger="${sectionKey}"]`).evaluate((button) => button.click())
  await expect(page.locator('.direct-edit-popup')).toBeVisible()
}

test.describe('Direct Edit builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  })

  test('switching to Direct Edit shows one full-width editable preview', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await expect(page.locator('.direct-edit-preview')).toBeVisible()
    await expect(page.locator('.app-toolbar__template-trigger')).toBeVisible()
  })

  test('editing the name in Direct Edit mode persists after switching back to Classic', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    // The full name lives in the header's <h3>, rendered by EditableField as
    // a contentEditable <span class="direct-edit-field"> once Direct Edit's
    // DirectEditProvider is active (see src/components/CVPreview.jsx and
    // src/components/EditableField.jsx).
    const nameField = page.locator('.direct-edit-preview h3 .direct-edit-field')
    await nameField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Jordan Rivera')
    await nameField.blur()

    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('Jordan Rivera')
  })

  test('hovering a section in Direct Edit reveals a pencil that opens the section popup', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const aboutSection = page.locator('[data-export-section="about"]').first()
    await expect(aboutSection).toBeVisible()

    await aboutSection.hover()

    const pencil = page.locator('.direct-edit-pencil--active')
    await expect(pencil).toBeVisible()

    await pencil.click()

    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()
    await expect(popup).toContainText('About')

    await page.keyboard.press('Escape')
    await expect(popup).toHaveCount(0)
  })

  test('the popup edits an experience entry and lists hidden entries with a visibility toggle', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil--active').click()

    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()

    // Every entry is listed, including any hidden via sectionItemVisibility.
    const entries = popup.locator('.direct-edit-popup__entry')
    await expect(entries.first()).toBeVisible()

    const roleInput = entries.first().locator('input[data-field="role"]')
    await roleInput.fill('Popup Edited Role')

    // The live preview behind the popup reflects the edit immediately.
    await expect(
      page.locator('[data-export-section="experience"]').first(),
    ).toContainText('Popup Edited Role')

    // Adding an entry appends one row.
    const countBefore = await entries.count()
    await popup.locator('.direct-edit-popup__add').click()
    await expect(entries).toHaveCount(countBefore + 1)

    // Hiding an entry KEEPS it listed in the popup, marked hidden. That
    // is the fix for the bug parked since Phase 1: a Classic-hidden entry
    // used to reappear as editable in Direct Edit with no way to see or
    // change its hidden state.
    //
    // Deliberately NOT asserted here: that the entry vanishes from the
    // preview. On inline-wired templates EditableList renders raw
    // formData (unfiltered by sectionItemVisibility) by design, so in
    // Direct Edit the entry stays, marked hidden since 1.6.52 (see "a
    // hidden entry is marked in the editable CV" below).
    const firstEntry = entries.first()
    await firstEntry.locator('.direct-edit-popup__entry-visibility').click()
    await expect(firstEntry).toHaveClass(/direct-edit-popup__entry--hidden/)
    await expect(entries).toHaveCount(countBefore + 1)

    // And it round-trips back to visible.
    await firstEntry.locator('.direct-edit-popup__entry-visibility').click()
    await expect(firstEntry).not.toHaveClass(/direct-edit-popup__entry--hidden/)
  })

  test('the experience popup shows the real stored date text, not a blank month picker', async ({ page }) => {
    // Regression test for a Critical bug: schema type "month" used to be
    // rendered as <input type="month">, which only accepts YYYY-MM and
    // silently renders empty for the free-text dates this app actually
    // stores ("Jan 2022", "2014", ...) — see sectionSchema.js's `month`
    // helper and the demo CV's seed data in cvForm.js. The existing
    // all-template popup loop only ever fills the `role` field, so it
    // never caught this; assert the date input directly against the
    // demo CV's known seed value instead of assuming a shape for it.
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil--active').click()

    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()

    const startDateInput = popup.locator('.direct-edit-popup__entry').first().locator('input[data-field="startDate"]')
    await expect(startDateInput).toHaveValue('Jan 2022')

    // Editing it round-trips back to Classic mode as plain text, not an
    // ISO YYYY-MM value.
    await startDateInput.fill('Mar 2020')
    await page.keyboard.press('Escape')

    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(page.getByPlaceholder('e.g. Jan 2022').first()).toHaveValue('Mar 2020')
  })

  test('the popup edits header fields including tagline, which no template wires inline', async ({ page }) => {
    // Creative is the only Direct-Edit-supported template that renders
    // `tagline` at all, and even there it is a plain read-only <p> off
    // `snapshot.tagline` (CreativeShowcase.jsx), never an EditableField —
    // i.e. no template lets a user type a tagline inline. The default
    // Minimalist template (CVPreview.jsx's shared flat renderer) has no
    // tagline slot anywhere in its header, so this test selects Creative
    // to have somewhere in the DOM to observe the popup's edit land.
    await pickTemplate(page, 'Creative')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-header]').first().hover()
    await page.locator('.direct-edit-pencil--active').click()

    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()

    await popup.locator('input[data-field="tagline"]').fill('Popup tagline')
    await expect(page.locator('[data-export-header]').first()).toContainText('Popup tagline')
  })

  test('the popup opens beside a sidebar section instead of covering it', async ({ page }) => {
    // Creative's right rail holds narrow sections (~248px) with the whole
    // main column free to their left, so this is the case where the old
    // right-align-to-the-section placement put the popup squarely on top
    // of the very content being edited.
    await pickTemplate(page, 'Creative')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const section = page.locator('[data-export-secondary="true"] [data-export-section]').first()
    const sectionKey = await section.getAttribute('data-export-section')

    await section.hover()
    await page.locator('.direct-edit-pencil--active').click()
    await expect(page.locator('.direct-edit-popup')).toBeVisible()

    const geo = await popupGeometry(page, sectionKey)

    // Precondition: this really is a "no room right, plenty left" section.
    // Asserted rather than assumed so a template change that invalidates
    // the premise fails loudly instead of passing vacuously.
    expect(geo.roomRight).toBeLessThan(geo.popupWidth)
    expect(geo.roomLeft).toBeGreaterThanOrEqual(geo.popupWidth)

    // Flipped to the left: clear of the section, still inside the preview.
    expect(geo.popupRight).toBeLessThanOrEqual(geo.sectionLeft + 1)
    expect(geo.popupLeft).toBeGreaterThanOrEqual(geo.containerLeft - 1)
  })

  test('the popup stays inside the preview when neither side has room', async ({ page }) => {
    // The default template's sections nearly fill the container, so no
    // flip is possible and the old clamp is still the right answer. Guards
    // the fallback against the flip logic introduced above.
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil--active').click()
    await expect(page.locator('.direct-edit-popup')).toBeVisible()

    const geo = await popupGeometry(page, 'experience')

    expect(geo.roomRight).toBeLessThan(geo.popupWidth)
    expect(geo.roomLeft).toBeLessThan(geo.popupWidth)

    expect(geo.popupLeft).toBeGreaterThanOrEqual(geo.containerLeft - 1)
    expect(geo.popupRight).toBeLessThanOrEqual(geo.containerRight + 1)
  })

  test('the popup lists, adds and removes experience achievements', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil--active').click()

    const popup = page.locator('.direct-edit-popup')
    const firstEntry = popup.locator('.direct-edit-popup__entry').first()
    const list = firstEntry.locator('.direct-edit-popup__list[data-field="achievements"]')

    // achievements is the bullet list that carries most of a work entry's
    // substance; until now it was editable nowhere in Direct Edit, so a
    // popup-created entry could never get bullets without Classic mode.
    await expect(list).toBeVisible()

    // The demo entry's existing bullets are shown, not just an empty box.
    const rows = list.locator('.direct-edit-popup__list-item')
    const countBefore = await rows.count()
    expect(countBefore).toBeGreaterThan(0)

    await list.locator('.direct-edit-popup__list-add').click()
    await expect(rows).toHaveCount(countBefore + 1)

    await list.locator('input').last().fill('Cut build times by 40%')
    await expect(
      page.locator('[data-export-section="experience"]').first(),
    ).toContainText('Cut build times by 40%')

    await list.locator('.direct-edit-popup__list-remove').last().click()
    await expect(rows).toHaveCount(countBefore)
    await expect(
      page.locator('[data-export-section="experience"]').first(),
    ).not.toContainText('Cut build times by 40%')
  })

  test('a technology added in the popup reaches Classic mode', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil--active').click()

    const popup = page.locator('.direct-edit-popup')
    const list = popup
      .locator('.direct-edit-popup__entry')
      .first()
      .locator('.direct-edit-popup__list[data-field="technologies"]')

    await list.locator('.direct-edit-popup__list-add').click()
    await list.locator('input').last().fill('Rust')
    await page.keyboard.press('Escape')

    // Both surfaces write the same field through the same
    // UPDATE_ARRAY_ITEM action, so Classic's TagsInput shows it.
    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(page.locator('.tags-input__tag', { hasText: 'Rust' }).first()).toBeVisible()
  })

  test('the section popup is reachable and openable by keyboard alone', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    // The hover pencil renders only in response to pointerover, so a
    // keyboard user had no way in at all. The overlay now also renders one
    // real, focusable "Edit <section>" button per editable section, hidden
    // until focused — the same pattern as a skip link.
    const trigger = page.getByRole('button', { name: 'Edit About section' })
    await trigger.focus()
    await expect(trigger).toBeFocused()

    await page.keyboard.press('Enter')

    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()
    await expect(popup).toContainText('About')
  })

  test('opening the popup by keyboard moves focus into it, traps it, and restores it on Escape', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const trigger = page.getByRole('button', { name: 'Edit About section' })
    await trigger.focus()
    await page.keyboard.press('Enter')

    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()
    await expect(popup).toHaveAttribute('aria-modal', 'true')

    const focusIsInPopup = () =>
      page.evaluate(() => Boolean(document.activeElement?.closest('.direct-edit-popup')))

    // Focus lands inside the popup rather than being left behind on a
    // trigger that is no longer rendered.
    expect(await focusIsInPopup()).toBe(true)

    // Tabbing cycles within the popup instead of escaping into the page
    // behind it. 30 presses comfortably exceeds the popup's own focusable
    // count, so an untrapped popup would have walked out long before this.
    for (let i = 0; i < 30; i += 1) {
      await page.keyboard.press('Tab')
    }

    expect(await focusIsInPopup()).toBe(true)

    // Shift+Tab wraps backwards without escaping either.
    await page.keyboard.press('Shift+Tab')
    expect(await focusIsInPopup()).toBe(true)

    await page.keyboard.press('Escape')
    await expect(popup).toHaveCount(0)

    // Focus returns to the control that opened it, not to <body>.
    await expect(trigger).toBeFocused()
  })

  test('the header popup uploads, previews and removes a profile photo on a CV that has none', async ({ page }) => {
    // Portfolio Hybrid is a photo-rendering template (portfolio.js's
    // `showPhoto: true`, and PortfolioShowcase.jsx renders the <img
    // data-export-photo>), so the upload has somewhere visible to land.
    // The demo CV ships with no `photo`, which is exactly the state that
    // used to offer no control at all in Direct Edit.
    await pickTemplate(page, 'Portfolio Hybrid')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await expect(page.locator('[data-export-photo]')).toHaveCount(0)

    await page.locator('[data-export-header]').first().hover()
    await page.locator('.direct-edit-pencil--active').click()

    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()

    // No fixture file: e2e/ has no fixtures directory, and Playwright
    // accepts an in-memory buffer for setInputFiles.
    await popup.locator('input[type="file"]').setInputFiles({
      name: 'profile.png',
      mimeType: 'image/png',
      buffer: PNG_1X1,
    })

    await expect(popup.locator('.direct-edit-popup__photo-preview')).toBeVisible()
    await expect(page.locator('[data-export-photo]').first()).toBeVisible()

    await popup.locator('.direct-edit-popup__photo-remove').click()
    await expect(popup.locator('.direct-edit-popup__photo-preview')).toHaveCount(0)
    await expect(page.locator('[data-export-photo]')).toHaveCount(0)
  })

  test('Classic mode still uploads a profile photo', async ({ page }) => {
    // Guards the extraction of buildProfilePhotoDataUrl out of CVForm.jsx
    // into src/utils/profilePhoto.js: Classic and the Direct Edit popup
    // share that one implementation, so this asserts the move stayed
    // behaviour-neutral. Photo upload had no e2e coverage before.
    await pickTemplate(page, 'Portfolio Hybrid')

    await page
      .getByLabel('Profile image (optional)')
      .setInputFiles({ name: 'profile.png', mimeType: 'image/png', buffer: PNG_1X1 })

    await expect(page.getByAltText('Profile preview')).toBeVisible()
    await expect(page.locator('[data-export-photo]').first()).toBeVisible()
  })

  test('the popup adds, reorders and removes skills, and refuses duplicates', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="skills"]').first().hover()
    await page.locator('.direct-edit-pencil--active').click()

    const popup = page.locator('.direct-edit-popup')
    const rows = popup.locator('.direct-edit-popup__skill')
    const countBefore = await rows.count()

    await popup.locator('.direct-edit-popup__skill-input').fill('Popup Skill')
    await popup.locator('.direct-edit-popup__skill-add').click()
    await expect(rows).toHaveCount(countBefore + 1)

    // A duplicate is rejected by the reducer and reported, not silently dropped.
    await popup.locator('.direct-edit-popup__skill-input').fill('popup skill')
    await popup.locator('.direct-edit-popup__skill-add').click()
    await expect(rows).toHaveCount(countBefore + 1)
    await expect(popup.locator('.direct-edit-popup__notice')).toBeVisible()
  })

  test('moving a sidebar section up swaps it with its own column neighbour, not a main-column section', async ({ page }) => {
    await pickTemplate(page, 'Creative')

    // Interleave a main-column section into the flat sectionOrder before
    // testing the popup's move-up. Fresh demo data's sectionOrder is []
    // (see cvForm.js's createSectionOrder), which normalizes to
    // primarySections-then-secondarySections — already column-contiguous,
    // so a naive flat-neighbour move would coincidentally land on the
    // right key and this test would pass either way. Classic mode's
    // "Visible sections" panel moves flat neighbours with no column
    // awareness (moveSectionByDirection in CVForm.jsx, correct for that
    // one-list nav rail), so pushing Skills up once here swaps it with
    // Projects (main column) in the flat array while leaving both
    // columns' own visual order unchanged — exactly the state where a
    // naive popup move would silently do nothing.
    await page.getByRole('button', { name: 'Visible sections' }).click()
    await page.getByRole('button', { name: 'Move Skills up' }).click()

    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const sidebarOrderBefore = await page
      .locator('[data-export-secondary="true"] [data-export-section]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-export-section')))

    expect(sidebarOrderBefore.length).toBeGreaterThan(1)
    const target = sidebarOrderBefore[1]

    await page.locator(`[data-export-section="${target}"]`).first().hover()
    await page.locator('.direct-edit-pencil--active').click()
    await page.locator('.direct-edit-popup__move-up').click()

    const sidebarOrderAfter = await page
      .locator('[data-export-secondary="true"] [data-export-section]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-export-section')))

    expect(sidebarOrderAfter[0]).toBe(target)
  })

  test('adding an experience entry in Direct Edit mode adds one to the form', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    const before = await page.locator('.direct-edit-preview .direct-edit-entry').count()
    await page.locator('.direct-edit-add-row', { hasText: 'Add experience' }).click()
    await expect(page.locator('.direct-edit-preview .direct-edit-entry')).toHaveCount(before + 1)
  })

  // SidebarBlock in these two templates rendered no data-export-section,
  // so the overlay (which finds sections by that attribute) gave their
  // sidebar sections no pencil at all.
  for (const [label, sectionKey, title] of [
    ['Navy Professional', 'skills', 'Skills'],
    ['Navy Professional', 'languages', 'Languages'],
    ['Modern Orange', 'education', 'Education'],
  ]) {
    test(`${label}'s sidebar ${sectionKey} section opens the popup`, async ({ page }) => {
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
      await pickTemplate(page, label)

      await page.locator(`[data-export-section="${sectionKey}"]`).first().hover()
      await page.locator('.direct-edit-pencil--active').click()

      const popup = page.locator('.direct-edit-popup')
      await expect(popup).toBeVisible()
      await expect(popup.locator('.direct-edit-popup__title')).toHaveText(title)
    })
  }

  test('Navy Professional and Modern Orange still export to PDF with tagged sidebar sections', async ({ page }) => {
    test.setTimeout(90_000)
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    for (const label of ['Navy Professional', 'Modern Orange']) {
      await pickTemplate(page, label)
      await exportPdfAndExpectSuccess(page)
    }
  })

  test('hovering one experience entry reveals an entry pencil that opens the popup on that entry', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await pickTemplate(page, 'Quadrant')

    const secondEntry = page.locator('[data-export-section="experience"] [data-direct-edit-index="1"]').first()
    await secondEntry.hover()

    const entryPencil = page.locator('.direct-edit-entry-pencil')
    await expect(entryPencil).toBeVisible()
    await entryPencil.click()

    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()

    const focusedEntry = popup.locator('.direct-edit-popup__entry--focused')
    await expect(focusedEntry).toHaveCount(1)
    await expect(focusedEntry.locator('.direct-edit-popup__entry-index')).toHaveText('#2')
    await expect(focusedEntry.locator('input[data-field="role"]')).toHaveValue('Product Designer')
    await expect(focusedEntry.locator('input[data-field="role"]')).toBeFocused()
  })

  // Anchored at the section's top instead, the popup for a lower entry on
  // a long section opened a screen above it and the focused field ended
  // up scrolled under the sticky toolbar.
  test('an entry pencil opens the popup beside that entry with its first field visible', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const secondEntry = page.locator('[data-export-section="experience"] [data-direct-edit-index="1"]').first()
    await secondEntry.scrollIntoViewIfNeeded()
    await secondEntry.hover()
    await page.locator('.direct-edit-entry-pencil').click()

    // Both measured after opening: bringing the popup into view may
    // scroll the page, which moves the entry and the popup together.
    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()
    expect(Math.abs((await popup.boundingBox()).y - (await secondEntry.boundingBox()).y)).toBeLessThan(4)

    // Visible means actually hit-testable, not merely inside the viewport:
    // the toolbar is sticky and would still cover a field scrolled under it.
    const roleInput = popup.locator('.direct-edit-popup__entry--focused input[data-field="role"]')
    await expect(roleInput).toBeFocused()
    const isOnTop = await roleInput.evaluate((input) => {
      const rect = input.getBoundingClientRect()
      return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) === input
    })
    expect(isOnTop).toBe(true)
  })

  // The trap this guards: Showcases render createCvSnapshot's output,
  // which drops hidden (and blank) entries, so a template's own map index
  // is NOT the formData index the popup edits. With entry #1 hidden, the
  // first card rendered from the snapshot is formData #2.
  //
  // Experience no longer shows this anywhere: every template now edits it
  // inline through EditableList, which renders hidden entries too (an
  // accepted trade-off since Phase 1). Every other record section still
  // renders from the snapshot on every template, so this uses
  // Certificates, which the demo CV gives two entries.
  test('an entry pencil still targets the right entry when an earlier entry is hidden', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await pickTemplate(page, 'European')

    await page.locator('[data-export-section="certificates"]').first().hover()
    await page.locator('.direct-edit-pencil--active').click()
    const popup = page.locator('.direct-edit-popup')
    await popup.locator('.direct-edit-popup__entry').first().locator('.direct-edit-popup__entry-visibility').click()
    await page.keyboard.press('Escape')
    await expect(popup).toHaveCount(0)

    const firstRendered = page.locator('[data-export-section="certificates"] [data-direct-edit-index]').first()
    await expect(firstRendered).toContainText('UX Design Professional Certificate')
    await firstRendered.hover()
    await page.locator('.direct-edit-entry-pencil').click()

    const focusedEntry = popup.locator('.direct-edit-popup__entry--focused')
    await expect(focusedEntry.locator('.direct-edit-popup__entry-index')).toHaveText('#2')
    await expect(focusedEntry.locator('input[data-field="name"]')).toHaveValue('UX Design Professional Certificate')
  })

  // Every template, with entry #1 hidden so snapshot-driven templates
  // (filtered indices) and inline-wired ones (raw formData indices) both
  // get exercised: each experience card's data-direct-edit-index must name
  // the formData entry whose company it actually shows.
  test('every template tags each experience entry with its formData index', async ({ page }) => {
    test.setTimeout(120_000)
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil--active').click()
    await page.locator('.direct-edit-popup__entry').first().locator('.direct-edit-popup__entry-visibility').click()
    await page.keyboard.press('Escape')

    // A phrase unique to each demo entry's description: both entries share
    // the placeholder employer "Example Oy", and entry 1's role is a
    // substring of entry 0's.
    const companies = ['B2B collaboration suite', 'customer interview loops']

    for (const label of ALL_TEMPLATES) {
      await pickTemplate(page, label)
      await expect(page.locator('[data-export-section="experience"]').first()).toBeVisible()

      const tagged = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll('.direct-edit-preview [data-export-section="experience"] [data-direct-edit-index]'),
          (element) => ({ index: Number(element.getAttribute('data-direct-edit-index')), text: element.textContent }),
        ),
      )

      expect(tagged.length, `${label}: tagged experience entries`).toBeGreaterThan(0)

      for (const { index, text } of tagged) {
        expect(text, `${label}: entry tagged ${index}`).toContain(companies[index])
      }
    }
  })

  test('Creative: Skills moves to the main column from the popup and back', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await pickTemplate(page, 'Creative')

    expect(await sectionColumnState(page, 'skills')).toMatchObject({ inSidebar: true, placement: 'side' })

    await openSectionPopup(page, 'skills')
    const group = page.getByRole('group', { name: 'Column' })
    await expect(group.getByRole('button', { name: 'Sidebar' })).toHaveAttribute('aria-pressed', 'true')

    await group.getByRole('button', { name: 'Main' }).click()
    await expect(group.getByRole('button', { name: 'Main' })).toHaveAttribute('aria-pressed', 'true')
    await expect(group.getByRole('button', { name: 'Main' })).toBeFocused()
    expect(await sectionColumnState(page, 'skills')).toMatchObject({
      inSidebar: false,
      placement: 'main',
      movedFrom: 'side',
    })

    // The popup stays open on the moved section.
    await expect(page.locator('.direct-edit-popup')).toBeVisible()

    await group.getByRole('button', { name: 'Sidebar' }).click()
    expect(await sectionColumnState(page, 'skills')).toMatchObject({
      inSidebar: true,
      placement: 'side',
      movedFrom: null,
    })
  })

  test('Creative: section ↑/↓ follow a moved section into its new column', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await pickTemplate(page, 'Creative')

    await openSectionPopup(page, 'skills')
    await page.getByRole('group', { name: 'Column' }).getByRole('button', { name: 'Main' }).click()

    // The demo CV's sectionOrder is empty, so the order falls back to the
    // effective template order, where a moved section joins the END of its
    // new column. Moving it up must swap it with projects, a MAIN-column
    // neighbour, not with the sidebar section that follows it in the flat
    // order.
    const mainOrder = () =>
      page.evaluate(() =>
        Array.from(
          document.querySelectorAll('.direct-edit-preview [data-export-primary] [data-export-section]'),
          (el) => el.getAttribute('data-export-section'),
        ),
      )
    expect(await mainOrder()).toEqual(['about', 'experience', 'projects', 'skills'])
    await expect(page.locator('.direct-edit-popup__move-down')).toBeDisabled()

    await page.locator('.direct-edit-popup__move-up').click()
    expect(await mainOrder()).toEqual(['about', 'experience', 'skills', 'projects'])
  })

  test('Creative: a column move survives switching to Classic and back', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await pickTemplate(page, 'Creative')

    await openSectionPopup(page, 'education')
    await page.getByRole('group', { name: 'Column' }).getByRole('button', { name: 'Main' }).click()
    await page.keyboard.press('Escape')

    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    expect(await sectionColumnState(page, 'education')).toMatchObject({ inSidebar: false, placement: 'main' })
  })

  test('Creative: PDF export succeeds with a section moved to the main column', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await pickTemplate(page, 'Creative')

    await openSectionPopup(page, 'skills')
    await page.getByRole('group', { name: 'Column' }).getByRole('button', { name: 'Main' }).click()
    await page.keyboard.press('Escape')

    await exportPdfAndExpectSuccess(page)
  })

  test('no column control for sections that cannot move', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await pickTemplate(page, 'Creative')

    await openSectionPopup(page, 'experience')
    await expect(page.getByRole('group', { name: 'Column' })).toHaveCount(0)
    await page.keyboard.press('Escape')

    await pickTemplate(page, 'Minimalist')
    await openSectionPopup(page, 'skills')
    await expect(page.getByRole('group', { name: 'Column' })).toHaveCount(0)
  })


  // Walks every opted-in template and every section its popup offers to
  // move, in both directions. The contrast check is the automated guard
  // against the one thing reusing home markup can get wrong: text styled
  // for one column's surface landing unreadable on the other's. A moved
  // section must read no worse than it did at home, OR no worse than what
  // the template already ships in the target column (its native sections'
  // lowest text contrast there), capped at 3:1. Both escape hatches are
  // needed: Creative's accent numerals sit at 2.97 on its own tan rail, so
  // Projects moved there legitimately drops from 3.35. And a section whose
  // own design sits below its target column's cannot be expected to beat
  // it: Colorful Compact's white-on-teal skill pills read 2.49 at home
  // until v1.2.61 deepened them. Those are pre-existing design matters, not
  // move bugs. White text landing on a white column still fails both (seen
  // caught at 1.04 during development).
  test('every opted-in template moves each movable section into a readable column', async ({ page }) => {
    test.setTimeout(360_000)
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    for (const label of ALL_TEMPLATES) {
      await pickTemplate(page, label)
      const keys = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[data-direct-edit-trigger]'), (b) => b.dataset.directEditTrigger),
      )
      const baseline = {
        sidebar: await minTextContrast(page, '.direct-edit-preview [data-export-secondary] [data-export-section]'),
        main: await minTextContrast(page, '.direct-edit-preview [data-export-primary] [data-export-section]'),
      }
      let movedAny = false

      for (const key of keys) {
        await openSectionPopup(page, key)
        const group = page.locator('.direct-edit-popup__columns')

        if ((await group.count()) === 0) {
          await page.keyboard.press('Escape')
          continue
        }

        movedAny = true
        const sectionSelector = `.direct-edit-preview [data-export-section="${key}"]`
        const contrastBefore = await minTextContrast(page, sectionSelector)
        const before = await sectionColumnState(page, key)
        const target = before.inSidebar ? 'main' : 'sidebar'
        await group.locator(`[data-column="${target}"]`).click()

        const after = await sectionColumnState(page, key)
        const where = `${label} / ${key} -> ${target}`
        expect(after.inSidebar, `${where}: container`).toBe(target === 'sidebar')
        expect(after.placement, `${where}: placement`).toBe(target === 'sidebar' ? 'side' : 'main')
        expect(after.height, `${where}: height`).toBeGreaterThan(0)

        const contrast = await minTextContrast(page, sectionSelector)
        expect(contrast, `${where}: text contrast`).toBeGreaterThanOrEqual(
          Math.min(3, contrastBefore, baseline[target]) - 0.01,
        )

        // Put it back so the next section starts from the template default.
        await group.locator(`[data-column="${before.inSidebar ? 'sidebar' : 'main'}"]`).click()
        await page.keyboard.press('Escape')
      }

      expect(movedAny, `${label}: offers column moves exactly when listed in COLUMN_MOVE_TEMPLATES`).toBe(
        COLUMN_MOVE_TEMPLATES.includes(label),
      )
    }
  })

  // Developer only renders its sidebar when the sidebar has sections, but
  // its body grid always reserved a narrow first track for it, so moving
  // every sidebar section into main squeezed the whole CV into that track.
  test('Developer: moving every sidebar section to main keeps the main column full width', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await pickTemplate(page, 'Developer')

    for (const key of ['skills', 'links', 'certificates', 'education', 'languages']) {
      await openSectionPopup(page, key)
      await page.getByRole('group', { name: 'Column' }).getByRole('button', { name: 'Main' }).click()
      await page.keyboard.press('Escape')
    }

    await expect(page.locator('.dev-showcase__sidebar')).toHaveCount(0)
    const widths = await page.evaluate(() => ({
      body: document.querySelector('.dev-showcase__body').getBoundingClientRect().width,
      main: document.querySelector('.dev-showcase__main').getBoundingClientRect().width,
    }))
    expect(widths.main).toBeGreaterThan(widths.body * 0.95)
  })

  // A popup opened from an entry pencil anchors beside that entry. When the
  // section then moves column, it must follow the entry to its new place,
  // not stay at the height the entry used to have.
  test('an entry-opened popup follows its entry when the section changes column', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await pickTemplate(page, 'Graduate')

    const entry = page.locator('[data-export-section="education"] [data-direct-edit-index="0"]').first()
    await entry.scrollIntoViewIfNeeded()
    await entry.hover()
    await page.locator('.direct-edit-entry-pencil').click()
    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()

    await page.getByRole('group', { name: 'Column' }).getByRole('button', { name: 'Sidebar' }).click()
    expect(await sectionColumnState(page, 'education')).toMatchObject({ inSidebar: true })

    // Both measured in one frame: the popup may scroll itself into view.
    const tops = await page.evaluate(() => ({
      popup: document.querySelector('.direct-edit-popup').getBoundingClientRect().top,
      entry: document
        .querySelector('[data-export-section="education"] [data-direct-edit-index="0"]')
        .getBoundingClientRect().top,
    }))
    expect(Math.abs(tops.popup - tops.entry)).toBeLessThan(4)
  })

  // Navy Professional and Modern Orange render the SAME Showcase in ATS
  // mode, recoloured to monochrome with a transparent sidebar. Their
  // moved-section CSS recolours main-column markup for a dark rail, which
  // must not follow it into ATS mode, where that rail is white. Checked in
  // Classic's preview, which a move made in Direct Edit carries into (Direct
  // Edit's own ATS view renders the same Showcase, 1.6.25).
  for (const [label, sectionKey] of [['Navy Professional', 'education'], ['Modern Orange', 'certificates']]) {
    test(`${label}: a section moved to the sidebar stays readable in ATS mode`, async ({ page }) => {
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
      await pickTemplate(page, label)

      await openSectionPopup(page, sectionKey)
      await page.getByRole('group', { name: 'Column' }).getByRole('button', { name: 'Sidebar' }).click()
      await page.keyboard.press('Escape')

      await page.getByRole('button', { name: 'Settings' }).click()
      const dialog = page.getByRole('dialog', { name: 'Settings' })
      await dialog.locator('.settings-row', { hasText: 'ATS-friendly mode' }).locator('.toggle-switch').click()
      await expect(dialog.locator('.settings-row', { hasText: 'ATS-friendly mode' }).getByRole('checkbox')).toBeChecked()
      await page.getByRole('button', { name: 'Close' }).click()

      await page.getByRole('tab', { name: 'Classic' }).click()
      const section = page.locator(`[data-export-section="${sectionKey}"]`).first()
      await expect(section).toBeVisible()
      // Sanity: this really is the ATS render, with the move carried over.
      await expect(page.locator('[class*="showcase--ats"]').first()).toBeVisible()
      expect(await section.evaluate((el) => Boolean(el.closest('[data-export-secondary]')))).toBe(true)

      expect(await minTextContrast(page, `[data-export-section="${sectionKey}"]`)).toBeGreaterThanOrEqual(4.5)
    })
  }

  // Regression guard: `.builder-section` (app-shell.css) is `flex: 1;
  // min-height: 0` — needed so Classic mode's own AppShell panels can
  // scroll *inside* a viewport-bounded box instead of growing it. Direct
  // Edit has no such internal panel, so with `min-height: 0` still in
  // effect, a CV preview taller than the box's flex-computed share of the
  // viewport just overflowed visually with `overflow: visible`, never
  // forcing `.builder-section` (or `.one-pager`) to actually grow —
  // `.site-footer`, positioned in normal flow right after
  // `.builder-section`, ended up sitting partway down the page instead of
  // after the real content, so the tail of a long CV visually overlapped
  // straight through it. `.one-pager--direct-edit .builder-section` now
  // overrides back to the default `min-height: auto` (direct-edit.css),
  // giving the box its content's height as a floor. The demo CV (multiple
  // experience/education entries) is long enough to overflow one viewport
  // and reproduce this reliably.
  test('the footer never overlaps the CV preview in Direct Edit mode', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const preview = page.locator('.direct-edit-preview')
    const footer = page.locator('.site-footer')
    await expect(preview).toBeVisible()
    await expect(footer).toBeVisible()

    // Both edges come from ONE evaluate, in the same frame. This used to
    // scroll with page.mouse.wheel and then take two separate boundingBox()
    // calls, but the wheel starts an asynchronous smooth scroll: when the
    // scroll landed between the two calls, the preview was measured before
    // it (bottom ~1732) and the footer after it (~668), so a correct layout
    // failed about half the time under parallel load. The footer's position
    // relative to the preview doesn't depend on scroll, so no scroll is
    // needed at all.
    const edges = await page.evaluate(() => ({
      previewBottom: document.querySelector('.direct-edit-preview').getBoundingClientRect().bottom,
      footerTop: document.querySelector('.site-footer').getBoundingClientRect().top,
    }))
    // The footer's top edge must be at or below the preview's bottom edge
    // — i.e. positioned after the content, never over it. A 1px tolerance
    // absorbs subpixel rounding.
    expect(edges.footerTop).toBeGreaterThanOrEqual(edges.previewBottom - 1)
  })

  // Regression guard for Fix 1 (final whole-branch review): the Skills
  // section's 'flat' layout used to render every skill twice in Direct Edit
  // mode — once as a plain, non-interactive <span data-export-skill> (never
  // gated on directEditDispatch) and once as a removable EditableChip. Each
  // skill must now appear exactly once, as a chip, with zero plain tags left
  // in the Skills section.
  // The toolbar's section search only filters Classic mode's nav rail,
  // which Direct Edit does not render, so there it did nothing at all.
  test('the section search box shows in Classic mode only', async ({ page }) => {
    const search = page.getByRole('searchbox', { name: 'Search sections' })
    await expect(search).toBeVisible()

    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await expect(search).toHaveCount(0)

    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(search).toBeVisible()
  })

  test('each skill renders exactly once, as a removable chip, in Direct Edit mode', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    // Scoped to the editable CV: the off-screen read-only copy PDF export
    // captures (DirectEditPreview.jsx) renders the plain skills too.
    const skillsSection = page.locator('.direct-edit-preview [data-export-section="skills"]')
    await expect(skillsSection).toBeVisible()

    // No plain read-only tags left in the Skills section while editing.
    await expect(skillsSection.locator('[data-export-skill="true"]')).toHaveCount(0)

    // Every demo-CV skill shows up exactly once as a chip with its own
    // edit and remove controls.
    const chips = skillsSection.locator('.direct-edit-chip--removable')
    await expect(chips).toHaveCount(DEMO_SKILLS.length)
    for (const skill of DEMO_SKILLS) {
      await expect(skillsSection.getByRole('button', { name: `Edit skill: ${skill}`, exact: true })).toHaveCount(1)
      await expect(skillsSection.getByRole('button', { name: `Remove skill: ${skill}`, exact: true })).toHaveCount(1)
    }
  })

  // Explicitly listed in the spec's testing plan and never written until
  // this fix wave: toggling a section's visibility from the Sections
  // popover must hide/show it in the live preview immediately.
  test('the Sections popover toggles a section\'s visibility in the live preview', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    // The visible checks are scoped to the editable CV (the off-screen
    // read-only export copy also renders a Skills section); the hidden check
    // stays page-wide, since the export copy must drop the section too.
    const editableSkills = page.locator('.direct-edit-preview [data-export-section="skills"]')
    await expect(editableSkills).toBeVisible()

    await page.getByRole('button', { name: 'Sections' }).click()
    const skillsCheckbox = page.getByRole('checkbox', { name: 'Skills' })

    // One click, straight after "Load demo CV": the demo CV carries no
    // sectionVisibility map, and the first toggle from that state used to
    // be a no-op (the reducer flipped the raw missing value to true).
    await skillsCheckbox.click()
    await expect(skillsCheckbox).not.toBeChecked()
    await expect(page.locator('[data-export-section="skills"]')).toHaveCount(0)

    await skillsCheckbox.click()
    await expect(skillsCheckbox).toBeChecked()
    await expect(editableSkills).toBeVisible()
  })

  // Explicitly listed in the spec's testing plan and never written until
  // this fix wave: the existing coverage only exercises a *mode* switch
  // (Direct Edit <-> Classic), not a *template* switch while staying in
  // Direct Edit the whole time. An edit must survive a round-trip through
  // another template and back to Minimalist, and show up inline in both.
  // (This used to go through a template without inline editing; since
  // v1.2.73 every template has it.)
  test('an edit in Direct Edit mode survives switching template and back', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const nameField = page.locator('.direct-edit-preview h3 .direct-edit-field')
    await nameField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Jordan Rivera')
    await nameField.blur()

    await pickTemplate(page, 'European')
    await expect(page.locator('.european-showcase__name .direct-edit-field')).toHaveText('Jordan Rivera')

    await pickTemplate(page, 'Minimalist')
    const nameFieldAgain = page.locator('.direct-edit-preview h3 .direct-edit-field')
    await expect(nameFieldAgain).toHaveText('Jordan Rivera')
    await expect(nameFieldAgain).toHaveAttribute('contenteditable', 'true')
  })

  // The PDF is a raster image, so this inspects what the exporter captured
  // instead: exporters.js deep-clones the export root into its sandbox
  // (cloneNode(true); html2canvas's own clones are shallow). In Direct Edit
  // that root used to be the live editable preview, so the PDF carried the
  // editing chrome, the chips shown in place of Tech Executive's comma
  // lines, and entries the user had hidden.
  test('a PDF exported from Direct Edit captures the read-only CV, not the editor', async ({ page }) => {
    await pickTemplate(page, 'Tech Executive')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await openSectionPopup(page, 'experience')
    await page.locator('.direct-edit-popup__entry').first().locator('.direct-edit-popup__entry-visibility').click()
    await page.keyboard.press('Escape')

    await page.evaluate(() => {
      window.__exportClones = []
      const originalCloneNode = Node.prototype.cloneNode
      Node.prototype.cloneNode = function cloneNode(deep) {
        const copy = originalCloneNode.call(this, deep)
        if (deep && this.getAttribute?.('data-export-root') === 'true') {
          window.__exportClones.push({
            editingChrome: copy.querySelectorAll('[class*="direct-edit-"], [contenteditable]').length,
            hasHiddenEntry: copy.textContent.includes('B2B collaboration suite'),
            hasVisibleEntry: copy.textContent.includes('customer interview loops'),
            commaSkillLines: copy.querySelectorAll('.tech-exec-showcase__skill-items').length,
          })
        }
        return copy
      }
    })

    await exportPdfAndExpectSuccess(page)

    const clones = await page.evaluate(() => window.__exportClones)
    expect(clones.length).toBeGreaterThan(0)
    expect(clones[0]).toEqual({ editingChrome: 0, hasHiddenEntry: false, hasVisibleEntry: true, commaSkillLines: 1 })
  })

  // Regression guard for Fix 2 (final whole-branch review): the export's
  // mode and the preview's must agree, or waitForPreviewModeSync polls for
  // a class the DOM never produces and PDF export fails every time. Direct
  // Edit used to force ATS off on screen while the export read the real
  // toggle; since 1.6.25 both follow the toggle. Both ATS states must
  // succeed.
  test('PDF export succeeds in Direct Edit mode with ATS mode off and on', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    // ATS mode off (the default).
    await exportPdfAndExpectSuccess(page)

    // Settings is reachable on desktop specifically in Direct Edit mode
    // thanks to Fix 5 — toggle ATS mode on from there. Click the
    // .toggle-switch wrapper, not the checkbox input directly — the
    // decorative track/thumb spans sit on top of the input and intercept
    // pointer events (same pattern as e2e/session-restore.spec.js's
    // restoreToggle helper).
    await page.getByRole('button', { name: 'Settings' }).click()
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    await dialog.locator('.settings-row', { hasText: 'ATS-friendly mode' }).locator('.toggle-switch').click()
    await expect(dialog.locator('.settings-row', { hasText: 'ATS-friendly mode' }).getByRole('checkbox')).toBeChecked()
    await page.getByRole('button', { name: 'Close' }).click()

    // ATS mode on — this is the case Fix 2 repairs.
    await exportPdfAndExpectSuccess(page)
  })

  // Regression guard: the Direct Edit overlay (pencil + popup) is rendered
  // in a portal outside the element `previewRef` points at (the export
  // root html2canvas snapshots), specifically so it can never be captured
  // into a PDF. This test proves that structurally, then proves it live
  // with a real export while a popup could plausibly be open.
  test('the popup overlay never appears in an exported PDF', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="about"]').first().hover()
    await expect(page.locator('.direct-edit-pencil--active')).toBeVisible()

    // The overlay must live outside the element previewRef points at, or
    // html2canvas captures the pencil and popup chrome into the PDF.
    const overlayIsInsideExportRoot = await page.evaluate(() => {
      const root = document.querySelector('[data-export-root="true"]')
      const overlay = document.querySelector('.direct-edit-overlay-host')
      return Boolean(root && overlay && root.contains(overlay))
    })

    expect(overlayIsInsideExportRoot).toBe(false)

    await exportPdfAndExpectSuccess(page)
  })

  // Shared smoke-test shape for every Direct-Edit-supported template.
  // Two separate test functions, not one combined test:
  // the demo-data checks (name/skills/description) need the beforeEach's
  // already-loaded demo CV, while the placeholder check needs a
  // genuinely empty form — the two states can't coexist in a single
  // test. (Phase 2 Round 3's final review found a combined test whose
  // NAME claimed both checks but whose body only contained the demo-data
  // ones — this split is the fix, and the reason it's a hard split, not
  // a style preference.)
  function runDirectEditDemoDataChecks(label, classPrefix, titleFieldSuffix = 'role', skillsSectionSelector = '[data-export-section="skills"]', entrySelector = null) {
    // Regression guard for the final whole-branch review's Fix 1
    // (2026-09-15, Classic Professional): the Experience description's
    // editing branch can reference a CSS class with no `white-space:
    // pre-line` rule, silently collapsing a multi-line description to
    // one line in the user's actual saved data on its first edit. Typing
    // a fresh "line 1, Enter, line 2" via the keyboard does NOT reproduce
    // this — a typed Enter inserts a real `<br>`, and `innerText` always
    // reports a `<br>` as a line break regardless of `white-space` CSS.
    // The real trigger is a description that already contains a literal
    // "\n" before the field is ever focused (seeded here through Classic
    // mode's own textarea, which stores a real "\n", same as a user
    // pressing Enter in a plain `<textarea>`), then edited to force a
    // dispatch via `Control+End` — never a typed newline.
    test(`${label}: name persists, skills render once as chips, and a multi-line description survives editing`, async ({ page }) => {
      await pickTemplate(page, label)

      const descriptionInput = page.getByLabel('Description', { exact: true }).first()
      await descriptionInput.fill('Seeded line A\nSeeded line B')

      await page.getByRole('tab', { name: 'Direct Edit' }).click()

      const nameField = page.locator(`.${classPrefix}__name .direct-edit-field`)
      await nameField.click()
      await page.keyboard.press('Control+A')
      await page.keyboard.type('Jordan Rivera')
      await nameField.blur()

      // Regression guard for this round's own Fix (2026-09-17, Modern
      // Timeline): a template whose title field is styled with
      // `text-transform` and whose EditableField isn't overridden to
      // `text-transform: none` will silently save an all-caps version
      // of whatever the user actually typed — EditableField dispatches
      // via `innerText`, which (unlike `textContent`) reflects CSS
      // text-transform. The name check above alone doesn't exercise
      // this: it never existed on any template's name field except
      // Modern Timeline's, which this round's Fix already covers. This
      // check covers the title field on every Direct-Edit-supported
      // template uniformly, since the bug already shipped once
      // (Modern Timeline) and is independently confirmed still present,
      // unfixed, on Classic Professional as of this same round's own
      // final review — this test exists specifically so neither
      // template can regress, and so a future template can't ship the
      // same bug silently again.
      const titleField = page.locator(`.${classPrefix}__${titleFieldSuffix} .direct-edit-field`)
      await titleField.click()
      await page.keyboard.press('Control+A')
      await page.keyboard.type('Staff Engineer')
      await titleField.blur()

      // Regression guard for Critical #1 (final whole-branch review,
      // Phase 1): every skill used to render twice in Direct Edit mode —
      // once as a plain, non-interactive span (never gated on
      // directEditDispatch) and once as a removable chip. Each
      // Direct-Edit-supported template has its own separate Skills
      // gating and needs its own guard.
      // Scoped to the editable CV: the off-screen read-only copy PDF export
      // captures renders the plain, non-chip skills by design.
      const skillsSection = page.locator(`.direct-edit-preview ${skillsSectionSelector}`)
      await expect(skillsSection.locator('[data-export-skill="true"]')).toHaveCount(0)
      await expect(skillsSection.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length)

      // Regression guard for the final whole-branch review's Important #3
      // (2026-09-18, Modern Orange final review): the Experience-divider
      // CSS bug — a stale positional selector (or a same-specificity
      // modifier class losing to one) silently strips the divider from
      // every entry, or leaves it on the true-last entry, in Direct Edit
      // mode. Shipped broken twice (Modern Orange Round 7, retroactively
      // found on Executive Round 6) with no automated coverage catching
      // either. `entrySelector` is opt-in per template (default `null`
      // skips this check) since not every template's entries follow this
      // exact divider pattern.
      if (entrySelector) {
        const entries = page.locator(entrySelector)
        // Any drawn divider counts (Colorful Compact's is dashed); the bug
        // this guards is the divider vanishing, not its style.
        const firstBorderStyle = await entries.first().evaluate((el) => getComputedStyle(el).borderBottomStyle)
        expect(firstBorderStyle).not.toBe('none')
        const lastBorderStyle = await entries.last().evaluate((el) => getComputedStyle(el).borderBottomStyle)
        expect(lastBorderStyle).toBe('none')
      }

      // Force a dispatch against the seeded multi-line description
      // without disturbing its existing content: focus the field, jump
      // to its true end (Control+End, not the line-relative End key),
      // and append a marker.
      const firstEntry = page.locator('[data-export-section="experience"] .direct-edit-entry').first()
      const descriptionField = firstEntry.locator('.direct-edit-field').last()
      await descriptionField.click()
      await page.keyboard.press('Control+End')
      await page.keyboard.type(' X')
      await descriptionField.blur()

      await page.getByRole('tab', { name: 'Classic' }).click()
      await expect(page.getByLabel('Full name')).toHaveValue('Jordan Rivera')
      await expect(page.getByLabel('Professional title')).toHaveValue('Staff Engineer')
      await expect(descriptionInput).toHaveValue('Seeded line A\nSeeded line B X')
    })
  }

  // Regression guard for the final whole-branch review's Important #1
  // (2026-09-16, Editorial): a template's contact row that passes
  // `className` directly into `EditableField` collides the template's
  // own class with `EditableField`'s internal `direct-edit-field--empty`
  // class on the same element — two ::before rules (the template's own
  // separator rule, direct-edit.css's placeholder-text rule) fight at
  // equal specificity, and the placeholder can silently lose, blanking
  // the label for any empty contact field. This only shows up on a
  // genuinely empty value, which `runDirectEditDemoDataChecks` above
  // never exercises (it always starts from the loaded demo CV). Checking
  // the computed ::before content (not just the `data-placeholder`
  // attribute, which is always present regardless of whether the CSS
  // actually renders it) is what makes this a real regression guard.
  //
  // `labelOrder` deviates from the brief's literal hardcoded
  // `['Location', 'Email', 'Phone']`: each template's own field-order
  // array (`directEditContactFields` in Classic Professional/Modern
  // Timeline, built inline in Editorial/Portrait) is authored per
  // template, not shared — Classic Professional and Modern Timeline both
  // order theirs Phone, Email, Location (see
  // ClassicProfessionalShowcase.jsx / TimelineShowcase.jsx), the reverse
  // of Editorial / Portrait. Hardcoding one order made this a false
  // failure for both `__contact`-suffix templates, checking the wrong
  // position's ::before text rather than the CSS-collision bug this
  // guard exists to catch — see
  // docs/superpowers/plans/2026-09-17-direct-edit-modern-timeline.md for
  // the full investigation.
  function runDirectEditEmptyPlaceholderCheck(label, classPrefix, contactRowSuffix = 'meta', labelOrder = ['Location', 'Email', 'Phone']) {
    test(`${label}: an empty contact field shows its placeholder label, not a stray separator, in Direct Edit mode`, async ({ page }) => {
      await page.getByRole('button', { name: 'Reset form' }).click()
      await page.getByRole('button', { name: 'Confirm reset' }).click()

      await pickTemplate(page, label)
      await page.getByRole('tab', { name: 'Direct Edit' }).click()

      const metaFields = page.locator(`.${classPrefix}__${contactRowSuffix} .direct-edit-field`)
      await expect(metaFields).toHaveCount(labelOrder.length)

      for (let i = 0; i < labelOrder.length; i++) {
        const content = await metaFields.nth(i).evaluate((el) => getComputedStyle(el, '::before').content)
        expect(content).toContain(labelOrder[i])
      }
    })
  }

  // Categorized-skills regression guard (one row per inline-wired template
  // that uses EditableCategorizedChip): the chip groups skills by
  // a DERIVED category (parseSkillCategories buckets by regex against each
  // skill's own text) but must still dispatch REMOVE_SKILL against each
  // skill's ORIGINAL formData.skills index. The demo CV's 6 default skills
  // (DEMO_SKILLS) all land in one "Other" group, so this test adds a skill
  // that regexes into a DIFFERENT group ("Docker" -> devops) via Classic
  // mode's Skill tags input, removes specifically that chip in Direct Edit
  // mode, and confirms all 6 original skills survive untouched — proving
  // the index mapping is correct, not just that a chip disappeared.
  for (const label of ['Compact', 'Modern Professional', 'Graduate', 'Portfolio Hybrid', 'Developer', 'Quadrant', 'Tech Executive', 'European']) {
    test(`${label}: removing a categorized skill chip removes the correct skill, not a same-category neighbor`, async ({ page }) => {
      await pickTemplate(page, label)

      const skillsInput = page.getByLabel('Skill tags', { exact: true })
      await skillsInput.fill('Docker')
      await skillsInput.press('Enter')

      await page.getByRole('tab', { name: 'Direct Edit' }).click()

      const skillsSection = page.locator('[data-export-section="skills"]')
      await expect(skillsSection.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length + 1)

      await skillsSection.getByRole('button', { name: 'Remove skill: Docker', exact: true }).click()

      await expect(skillsSection.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length)

      await page.getByRole('tab', { name: 'Classic' }).click()
      // Scoped to #section-skills, not the whole page: the Experience section's
      // "Technologies" field (CVForm.jsx) is also a TagsInput sharing the same
      // .tags-input__tag class, and it's present on every Direct-Edit template
      // already, not just Compact. The demo CV's two experience entries each
      // carry a technologies array, so an unscoped locator here picks up those
      // tags too and produces a false failure — this scoping is required
      // regardless of which template is under test.
      const remainingTags = (await page.locator('#section-skills .tags-input__tag').allTextContents()).map((text) => text.trim())
      expect(remainingTags).toEqual(DEMO_SKILLS)
    })
  }

  // Colorful Compact's header is dark and its name's white comes from the
  // two split spans (name-lead / name-accent), not from the <h1>, which
  // inherits the template's dark ink. The inline field replaces those
  // spans, so without its own colour the name turns dark-on-dark.
  //
  // Tech Executive's navy masthead sets its name's white on the <h1> itself,
  // so it never had this bug; it is here as a guard for its dark header.
  // Only the inline fields are measured here (Colorful Compact's original
  // failure was the name field itself); the kicker label has its own test
  // below.
  for (const { label, classPrefix, headerSuffix } of [
    { label: 'Colorful Compact', classPrefix: 'colorful-compact-showcase', headerSuffix: 'header' },
    { label: 'Tech Executive', classPrefix: 'tech-exec-showcase', headerSuffix: 'masthead' },
  ]) {
    test(`${label}: every inline header field stays readable on the dark header`, async ({ page }) => {
      await pickTemplate(page, label)
      await page.getByRole('tab', { name: 'Direct Edit' }).click()

      await expect(page.locator(`.${classPrefix}__name .direct-edit-field`)).toHaveCount(1)
      const contrast = await minTextContrast(page, `.direct-edit-preview .${classPrefix}__${headerSuffix} .direct-edit-field`)
      expect(contrast).toBeGreaterThanOrEqual(4.5)
    })
  }

  // The website sits in the contact line as a link field — the first
  // inline field to dispatch SET_LINK_FIELD rather than a root field.
  test('Colorful Compact: the website edited inline reaches Classic mode', async ({ page }) => {
    await pickTemplate(page, 'Colorful Compact')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const websiteField = page.locator('.colorful-compact-showcase__contact .direct-edit-field').nth(3)
    await websiteField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('https://jordan.example')
    await websiteField.blur()

    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(page.locator('#link-field-website')).toHaveValue('https://jordan.example')
  })

  // The divider rows used :first-child/:last-child, which EditableList's
  // per-entry wrapper defeats: the first row regained its top padding and
  // the last kept its bottom padding. The runDirectEditDemoDataChecks row
  // covers the divider itself; this covers the padding.
  test('Colorful Compact: the first and last experience rows keep their edge spacing in Direct Edit', async ({ page }) => {
    await pickTemplate(page, 'Colorful Compact')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const rows = page.locator('.direct-edit-preview .colorful-compact-showcase__exp-row')
    await expect(rows).toHaveCount(2)
    expect(await rows.first().evaluate((el) => getComputedStyle(el).paddingTop)).toBe('0px')
    expect(await rows.last().evaluate((el) => getComputedStyle(el).paddingBottom)).toBe('0px')
  })

  // Skills is the one inline-edited section that can change column. Moved
  // to the other column, it renders through its home renderer, and its
  // chips must still be there and still remove the right skill. Skills'
  // home is the sidebar everywhere except Tech Executive, where it is main.
  for (const label of ['Colorful Compact', 'Modern Professional', 'Graduate', 'Portfolio Hybrid', 'Navy Professional', 'Developer', 'Tech Executive']) {
    test(`${label}: Skills moved to the other column is still inline-editable`, async ({ page }) => {
      await pickTemplate(page, label)
      await page.getByRole('tab', { name: 'Direct Edit' }).click()

      const wasInSidebar = (await sectionColumnState(page, 'skills')).inSidebar
      await openSectionPopup(page, 'skills')
      await page.locator(`.direct-edit-popup__columns [data-column="${wasInSidebar ? 'main' : 'sidebar'}"]`).click()
      await page.keyboard.press('Escape')
      expect((await sectionColumnState(page, 'skills')).inSidebar).toBe(!wasInSidebar)

      const skillsSection = page.locator('.direct-edit-preview [data-export-section="skills"]')
      await expect(skillsSection.locator('[data-export-skill="true"]')).toHaveCount(0)
      await expect(skillsSection.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length)

      await skillsSection.getByRole('button', { name: 'Remove skill: Figma', exact: true }).click()
      await expect(skillsSection.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length - 1)

      await page.getByRole('tab', { name: 'Classic' }).click()
      const remainingTags = (await page.locator('#section-skills .tags-input__tag').allTextContents()).map((text) => text.trim())
      expect(remainingTags).toEqual(DEMO_SKILLS.filter((skill) => skill !== 'Figma'))
    })
  }

  // Each template's kicker label ("<Template> Template") is preview-only
  // (excluded from exports), but it is the first thing a user reads, and
  // three sat under WCAG AA's 4.5:1 for text this small: Tech Executive
  // 4.13:1 on its navy masthead, Creative 3.35:1 (its default Coral accent
  // on the peach page) and Executive 4.37:1 on its rail. Portfolio Hybrid
  // passes (4.82:1 at its weakest swatch) but is not listed here:
  // minTextContrast reads a gradient's first stop as the background, and
  // Portfolio's header gradient starts with a translucent accent tint.
  for (const { label, kicker } of [
    { label: 'Tech Executive', kicker: '.tech-exec-showcase__kicker' },
    { label: 'Creative', kicker: '.creative-showcase__kicker' },
    { label: 'Executive', kicker: '.executive-showcase__kicker' },
  ]) {
    test(`${label}: the kicker label meets 4.5:1 contrast`, async ({ page }) => {
      await pickTemplate(page, label)
      const selector = `.preview-document--designer ${kicker}`
      await expect(page.locator(selector).first()).toBeVisible()
      expect(await minTextContrast(page, selector)).toBeGreaterThanOrEqual(4.5)
    })
  }

  // Executive's secondary text (--ex-ink-faint) read 4.37:1 on its rail:
  // the tagline and contact details, which are exported CV content, plus
  // strength descriptions, skill-group labels and certificate details.
  // Measured over the whole rail so any rail text that slips under
  // WCAG AA's 4.5:1 fails here.
  test('Executive: every piece of text on the rail meets 4.5:1 contrast', async ({ page }) => {
    await pickTemplate(page, 'Executive')
    const rail = '.preview-document--designer .executive-showcase__sidebar'
    await expect(page.locator(`${rail} .executive-showcase__tagline`).first()).toBeVisible()
    expect(await minTextContrast(page, rail)).toBeGreaterThanOrEqual(4.5)
  })

  // Dark-sidebar templates put inline controls on a dark rail, where
  // Direct Edit's generic chrome (the "+ Add" chip, chip-group labels) was
  // designed for a white page.
  for (const { label, sidebarSelector } of [
    { label: 'Navy Professional', sidebarSelector: '.navy-professional-showcase__sidebar' },
    { label: 'Developer', sidebarSelector: '.dev-showcase__sidebar' },
  ]) {
    test(`${label}: every inline sidebar control stays readable on the dark sidebar`, async ({ page }) => {
      await pickTemplate(page, label)
      await page.getByRole('tab', { name: 'Direct Edit' }).click()

      await expect(page.locator(`${sidebarSelector} .direct-edit-chip-add`)).toHaveCount(1)
      const contrast = await minTextContrast(page, `.direct-edit-preview ${sidebarSelector}`)
      expect(contrast).toBeGreaterThanOrEqual(4.5)
    })
  }

  // Developer's name is gradient text: `color: transparent` with the
  // gradient clipped to the glyphs. An editable field inside inherits the
  // transparent colour, and the caret follows currentColor, so it vanished.
  test('Developer: the inline name field shows a visible caret', async ({ page }) => {
    await pickTemplate(page, 'Developer')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const caret = await page.locator('.dev-showcase__name .direct-edit-field').evaluate((el) => getComputedStyle(el).caretColor)
    expect(caret).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/)
  })

  // The entry spacing used :not(:first-child)/:last-child, which
  // EditableList's per-entry wrapper defeats (every entry is both).
  for (const { label, classPrefix } of [
    { label: 'Navy Professional', classPrefix: 'navy-professional-showcase' },
    { label: 'Quadrant', classPrefix: 'quadrant-showcase' },
    { label: 'Tech Executive', classPrefix: 'tech-exec-showcase' },
  ]) {
    test(`${label}: experience entries keep their edge spacing in Direct Edit`, async ({ page }) => {
      await pickTemplate(page, label)
      await page.getByRole('tab', { name: 'Direct Edit' }).click()

      const entries = page.locator(`.direct-edit-preview [data-export-section="experience"] .${classPrefix}__entry`)
      await expect(entries).toHaveCount(2)
      expect(await entries.first().evaluate((el) => getComputedStyle(el).paddingTop)).toBe('0px')
      expect(await entries.last().evaluate((el) => getComputedStyle(el).paddingTop)).not.toBe('0px')
      expect(await entries.last().evaluate((el) => getComputedStyle(el).paddingBottom)).toBe('0px')
    })
  }

  // Tech Executive and European show skills as one comma-joined line per
  // category, which no chip reproduces, so Direct Edit shows grouped chips
  // in their place (the agreed "chips while editing" option). A guard, not
  // a bug test: the comma lines must be back as soon as editing ends.
  for (const { label, commaSelector } of [
    { label: 'Tech Executive', commaSelector: '.tech-exec-showcase__skill-items' },
    { label: 'European', commaSelector: '.european-showcase__skill-items' },
  ]) {
    test(`${label}: skills show as chips while editing and comma lines otherwise`, async ({ page }) => {
      await pickTemplate(page, label)
      await page.getByRole('tab', { name: 'Direct Edit' }).click()

      const editingSkills = page.locator('.direct-edit-preview [data-export-section="skills"]')
      await expect(editingSkills.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length)
      await expect(editingSkills.locator(commaSelector)).toHaveCount(0)

      await page.getByRole('tab', { name: 'Classic' }).click()
      const classicSkills = page.locator('[data-export-section="skills"]').first()
      await expect(classicSkills.locator(commaSelector).first()).toContainText(DEMO_SKILLS[0])
      await expect(classicSkills.locator('.direct-edit-chip')).toHaveCount(0)
    })
  }

  // European's rows are spaced by `.row + .row`, but every dated entry
  // (Experience, Education, Projects) wraps its row in its own card div, so
  // that rule never applied between entries: they sat 0px apart in every
  // mode, exports included. Measured in both modes, since Direct Edit adds
  // EditableList's wrapper around each Experience card.
  test('European: experience entries are spaced apart in Classic and Direct Edit', async ({ page }) => {
    await pickTemplate(page, 'European')

    const gapBetweenCards = (scope) => page.evaluate((sel) => {
      const cards = document.querySelectorAll(`${sel} [data-export-section="experience"] [data-export-card]`)
      return cards[1].getBoundingClientRect().top - cards[0].getBoundingClientRect().bottom
    }, scope)

    // At actual size: the Classic preview is scaled to fit its pane.
    await page.locator('.preview-zoom-bar').getByRole('button', { name: '100%' }).click()
    expect(await gapBetweenCards('.european-showcase')).toBeGreaterThanOrEqual(14)

    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await expect(page.locator('.direct-edit-preview .european-showcase')).toBeVisible()
    expect(await gapBetweenCards('.direct-edit-preview .european-showcase')).toBeGreaterThanOrEqual(14)
  })

  // Graduate hides an empty Career Objective section entirely, which in
  // Direct Edit would leave nothing to click into. While editing it shows
  // with a placeholder instead.
  test('Graduate: an empty Career Objective can be written inline', async ({ page }) => {
    await page.getByRole('button', { name: 'Reset form' }).click()
    await page.getByRole('button', { name: 'Confirm reset' }).click()
    await pickTemplate(page, 'Graduate')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const aboutField = page.locator('.direct-edit-preview [data-export-section="about"] .graduate-showcase__summary .direct-edit-field')
    await expect(aboutField).toHaveCount(1)
    await aboutField.click()
    await page.keyboard.type('Aiming for a first role in platform engineering.')
    await aboutField.blur()

    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(page.locator('#section-summary textarea')).toHaveValue('Aiming for a first role in platform engineering.')
  })

  // A timeline rail's connector line runs from each marker down to the
  // next and is hidden on the last entry. That used :last-child, which
  // EditableList's per-entry wrapper defeats — every item becomes a last
  // child and every connector vanishes in Direct Edit.
  for (const { label, classPrefix } of [
    { label: 'Modern Professional', classPrefix: 'modern-showcase' },
    { label: 'Portfolio Hybrid', classPrefix: 'portfolio-showcase' },
    { label: 'Developer', classPrefix: 'dev-showcase' },
  ]) {
    test(`${label}: the timeline connector joins entries and stops at the last one in Direct Edit`, async ({ page }) => {
      await pickTemplate(page, label)
      await page.getByRole('tab', { name: 'Direct Edit' }).click()

      const lines = page.locator(`.direct-edit-preview .${classPrefix}__timeline-line`)
      await expect(lines).toHaveCount(2)
      expect(await lines.first().evaluate((el) => getComputedStyle(el).display)).not.toBe('none')
      expect(await lines.last().evaluate((el) => getComputedStyle(el).display)).toBe('none')
    })
  }

  // One row per Direct-Edit-supported template.
  // `contactRowSuffix` defaults to 'meta' (Editorial, Portrait); Classic
  // Professional, Modern Timeline, and Compact all name their contact-row
  // wrapper class `__contact` instead — a naming choice from each
  // template's original (pre-Direct-Edit) authoring, unrelated to this
  // rollout. `labelOrder` defaults to Location/Email/Phone (Editorial,
  // Portrait); Classic Professional and Modern Timeline both render Phone/
  // Email/Location instead — see the comment above
  // `runDirectEditEmptyPlaceholderCheck`. Compact renders a THIRD distinct
  // order, Email/Phone/Location (its own `directEditContactFields` array
  // in CompactShowcase.jsx), confirmed directly against the component
  // rather than assumed. Executive (Round 6) shares Compact's Email/Phone/
  // Location order and `__contact` suffix, confirmed directly against
  // ExecutiveShowcase.jsx's own `directEditContactFields` array rather
  // than this round's plan's guess (which happened to match).
  //
  // `titleFieldSuffix` defaults to 'role': every Direct-Edit-supported
  // template through Round 6 wraps the header's professional-title field
  // in a `<prefix>__role` element (confirmed across every *Showcase.jsx in
  // the repo, not just the supported ones). Modern Orange (Round 7) is the
  // first to break that convention — its title renders as a pill inside
  // `<span className="modern-orange-showcase__title-badge">`, a more
  // accurate name for what's visually a badge, not a regression — so its
  // row overrides `titleFieldSuffix` to `'title-badge'` rather than
  // assuming the universal-until-now `__role` default still applies.
  //
  // `skillsSectionSelector` defaults to `[data-export-section="skills"]`:
  // every other template's Skills block renders through a `Section`-style
  // wrapper that carries `data-export-section` regardless of whether it's
  // visually in the main column or a sidebar. Modern Orange's Skills block
  // instead renders through `SidebarBlock` (also used for its Languages
  // and Education sidebar blocks), which carries no `data-export-section`
  // at all — a pre-existing gap in that component from the template's
  // original (pre-Direct-Edit) authoring, unrelated to this rollout, and
  // not one this task's file list permits fixing in
  // ModernOrangeShowcase.jsx. Its row overrides the selector to the
  // skill-list's own class instead, which still correctly scopes the "no
  // duplicate skill rendering" assertion.
  const DIRECT_EDIT_TEMPLATES = [
    { label: 'Classic Professional', classPrefix: 'classic-professional-showcase', contactRowSuffix: 'contact', labelOrder: ['Phone', 'Email', 'Location'] },
    { label: 'Editorial', classPrefix: 'editorial-showcase' },
    { label: 'Portrait', classPrefix: 'portrait-showcase' },
    { label: 'Modern Timeline', classPrefix: 'timeline-showcase', contactRowSuffix: 'contact', labelOrder: ['Phone', 'Email', 'Location'] },
    { label: 'Compact', classPrefix: 'compact-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
    { label: 'Executive', classPrefix: 'executive-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'], entrySelector: '.executive-showcase__entry' },
    { label: 'Modern Orange', classPrefix: 'modern-orange-showcase', contactRowSuffix: 'contact-list', labelOrder: ['Location', 'Email', 'Phone'], titleFieldSuffix: 'title-badge', skillsSectionSelector: '.modern-orange-showcase__skill-list', entrySelector: '.modern-orange-showcase__exp-row' },
    { label: 'Creative', classPrefix: 'creative-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
    { label: 'Modern Professional', classPrefix: 'modern-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
    // Navy's contact list sits in the sidebar (Phone, Email, Location, plus
    // LinkedIn as a link field). Its entry class is shared with Education,
    // so the divider check is scoped to Experience.
    { label: 'Navy Professional', classPrefix: 'navy-professional-showcase', contactRowSuffix: 'contact-list', labelOrder: ['Phone', 'Email', 'Location', 'LinkedIn'], entrySelector: '[data-export-section="experience"] .navy-professional-showcase__entry' },
    // European's contact line is `__meta` (Location, Email, Phone, and
    // LinkedIn as a link field), separated by a CSS ::before — the
    // Editorial collision case, so this row's placeholder check matters.
    { label: 'European', classPrefix: 'european-showcase', labelOrder: ['Location', 'Email', 'Phone', 'LinkedIn'] },
    { label: 'Tech Executive', classPrefix: 'tech-exec-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'], entrySelector: '[data-export-section="experience"] .tech-exec-showcase__entry' },
    { label: 'Quadrant', classPrefix: 'quadrant-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'], entrySelector: '[data-export-section="experience"] .quadrant-showcase__entry' },
    { label: 'Developer', classPrefix: 'dev-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
    { label: 'Portfolio Hybrid', classPrefix: 'portfolio-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
    { label: 'Graduate', classPrefix: 'graduate-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Phone', 'Location'] },
    // Colorful Compact's header contact line carries a fourth item, the
    // website (links.website), in the read-only order Email, Location,
    // Phone, Website.
    { label: 'Colorful Compact', classPrefix: 'colorful-compact-showcase', contactRowSuffix: 'contact', labelOrder: ['Email', 'Location', 'Phone', 'Website'], entrySelector: '.colorful-compact-showcase__exp-row' },
  ]

  for (const { label, classPrefix, contactRowSuffix, labelOrder, titleFieldSuffix, skillsSectionSelector, entrySelector } of DIRECT_EDIT_TEMPLATES) {
    runDirectEditDemoDataChecks(label, classPrefix, titleFieldSuffix, skillsSectionSelector, entrySelector)
    runDirectEditEmptyPlaceholderCheck(label, classPrefix, contactRowSuffix, labelOrder)
  }

  // The popup is template-agnostic (it hangs off data-export-section /
  // data-export-header, which every template already carries for the PDF
  // exporter), so coverage inverts from one-test-per-template into one
  // loop across every gallery entry. Labels are copied verbatim from the
  // gallery's real labels in src/utils/cvTemplates.js (checked against
  // every `label:` field there, not guessed) — all 18 templates carry
  // 'experience' in their `primarySections`, so no substitution was
  // needed for any row.
  const ALL_TEMPLATE_LABELS = [
    'Minimalist', 'Classic Professional', 'Editorial', 'Portrait', 'Modern Timeline',
    'Compact', 'Executive', 'Modern Orange', 'Creative', 'Modern Professional',
    'Graduate', 'Portfolio Hybrid', 'Tech Executive', 'Colorful Compact',
    'Developer', 'Navy Professional', 'Quadrant', 'European',
  ]

  for (const label of ALL_TEMPLATE_LABELS) {
    test(`${label}: a section pencil opens a working popup editor`, async ({ page }) => {
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
      await pickTemplate(page, label)

      const section = page.locator('[data-export-section="experience"]').first()
      await expect(section).toBeVisible()

      await section.hover()
      await page.locator('.direct-edit-pencil--active').click()

      const popup = page.locator('.direct-edit-popup')
      await expect(popup).toBeVisible()

      const roleInput = popup.locator('input[data-field="role"]').first()
      await roleInput.fill(`${label} popup role`)
      await expect(section).toContainText(`${label} popup role`)
    })
  }
})

test.describe('Direct Edit popup on an empty CV', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv')
  })

  test('a section with no entries can still be edited and given its first entry', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const section = page.locator('[data-export-section="experience"]').first()
    await expect(section).toBeVisible()

    await section.hover()
    await page.locator('.direct-edit-pencil--active').click()

    const popup = page.locator('.direct-edit-popup')
    await popup.locator('.direct-edit-popup__add').click()
    await popup.locator('input[data-field="role"]').first().fill('First ever role')

    await expect(section).toContainText('First ever role')
  })
})

test.describe('Direct Edit column control in Finnish', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ui-locale', 'fi'))
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Lataa demo-CV' }).first().click()
  })

  test('the column control is labelled in Finnish', async ({ page }) => {
    await page.getByRole('tab', { name: 'Suora muokkaus' }).click()
    await pickTemplate(page, 'Luova', { locale: 'fi' })

    await openSectionPopup(page, 'skills')
    const group = page.getByRole('group', { name: 'Sarake' })
    await expect(group.getByRole('button', { name: 'Pääsarake' })).toBeVisible()
    await expect(group.getByRole('button', { name: 'Sivupalkki' })).toHaveAttribute('aria-pressed', 'true')
  })

  // EditableList's drag handle and remove button had English-only
  // aria-labels, so a Finnish UI announced them in English.
  test('the inline entry controls are labelled in Finnish', async ({ page }) => {
    await page.getByRole('tab', { name: 'Suora muokkaus' }).click()

    const firstEntry = page.locator('.direct-edit-preview [data-export-section="experience"] .direct-edit-entry').first()
    await expect(firstEntry.locator('.direct-edit-entry__handle')).toHaveAttribute('aria-label', 'Järjestä vetämällä')
    await expect(firstEntry.locator('.direct-edit-entry__remove')).toHaveAttribute('aria-label', 'Poista kohta')
  })
})

test.describe('Direct Edit nav rail, entry highlight and placeholders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv')
  })

  test('the nav rail scrolls to a section and opens its popup, including the header', async ({ page }) => {
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const rail = page.getByRole('navigation', { name: 'Section navigation' })
    await expect(rail).toBeVisible()

    await rail.getByRole('button', { name: 'Experience' }).click()
    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()
    await expect(popup).toContainText('Experience')
    await expect(page.locator('[data-export-section="experience"]').first()).toBeInViewport()
    await expect(rail.getByRole('button', { name: 'Experience' })).toHaveAttribute('aria-current', 'true')

    await page.keyboard.press('Escape')
    await expect(popup).toHaveCount(0)

    // "Personal Information" is the header block, not a data-export-section.
    await rail.getByRole('button', { name: 'Personal Information' }).click()
    await expect(popup).toBeVisible()
    await expect(popup.locator('.direct-edit-popup__label', { hasText: 'Full name' })).toBeVisible()
  })

  test('the nav rail lists only the sections the template shows, and not hidden ones', async ({ page }) => {
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const rail = page.getByRole('navigation', { name: 'Section navigation' })
    await expect(rail.getByRole('button', { name: 'Summary' })).toBeVisible()

    await page.getByRole('button', { name: 'Sections', exact: true }).click()
    const aboutCheckbox = page.locator('.direct-edit-sections__row', { hasText: 'About' }).getByRole('checkbox')
    await aboutCheckbox.click()
    await expect(aboutCheckbox).not.toBeChecked()

    await expect(rail.getByRole('button', { name: 'Summary' })).toHaveCount(0)
  })

  test('the entry being edited is highlighted while one of its fields has focus', async ({ page }) => {
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const entries = page.locator('.direct-edit-preview [data-export-section="experience"] .direct-edit-entry')
    const first = entries.nth(0)
    const second = entries.nth(1)
    const highlight = (locator) => locator.evaluate((el) => getComputedStyle(el).boxShadow)

    const unfocused = await highlight(first)
    await first.locator('.direct-edit-field').first().click()

    await expect.poll(() => highlight(first)).not.toBe(unfocused)
    expect(await highlight(second)).toBe(unfocused)

    // Moving the cursor to the next entry moves the highlight with it.
    await second.locator('.direct-edit-field').first().click()
    await expect.poll(() => highlight(second)).not.toBe(unfocused)
    await expect.poll(() => highlight(first)).toBe(unfocused)
  })

  test('an empty field keeps its placeholder on focus until the user types', async ({ page }) => {
    // A first visit to /cv loads the demo CV; the template pages' "Start
    // blank" link (?blank=1) is the way in with every field empty.
    await page.goto('/cv?template=minimal&blank=1')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const nameField = page.locator('.direct-edit-preview h3 .direct-edit-field')
    const placeholderShown = () => nameField.evaluate((el) => getComputedStyle(el, '::before').content !== 'none')

    expect(await placeholderShown()).toBe(true)
    await nameField.click()
    await expect(nameField).toBeFocused()
    expect(await placeholderShown()).toBe(true)

    await page.keyboard.type('J')
    await expect.poll(placeholderShown).toBe(false)

    // Deleting back to empty brings it back, even if the browser leaves a
    // stray <br> behind in the contentEditable.
    await page.keyboard.press('Backspace')
    await expect.poll(placeholderShown).toBe(true)
  })
})

// Skills used to be add-or-remove only: clicking anywhere on a chip deleted
// it, "+ Add" inserted "New skill N" that nothing could rename, and the
// popup and Classic's tags had no way to edit a skill's text.
test.describe('Editing a skill', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  })

  // Creative uses plain chips (EditableChip); Compact groups them by a
  // category derived from each skill's text (EditableCategorizedChip).
  for (const template of ['Creative', 'Compact']) {
    test(`renames, refuses a duplicate, cancels and removes a skill on the CV (${template})`, async ({ page }) => {
      await pickTemplate(page, template)
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
      const skills = page.locator('.direct-edit-preview [data-export-section="skills"]')

      // Rename with Enter.
      await skills.getByRole('button', { name: 'Edit skill: Figma', exact: true }).click()
      const editor = skills.getByRole('textbox', { name: 'Edit skill: Figma' })
      await expect(editor).toBeFocused()
      await editor.fill('Figma Prototyping')
      await editor.press('Enter')
      await expect(skills.getByRole('button', { name: 'Edit skill: Figma Prototyping', exact: true })).toHaveCount(1)
      await expect(skills.getByRole('button', { name: 'Edit skill: Figma', exact: true })).toHaveCount(0)

      // A duplicate of another skill is refused and the editor stays open.
      await skills.getByRole('button', { name: 'Edit skill: Figma Prototyping', exact: true }).click()
      const again = skills.getByRole('textbox', { name: 'Edit skill: Figma Prototyping' })
      await again.fill('user research')
      await again.press('Enter')
      await expect(skills.getByText('Already listed')).toBeVisible()
      await expect(again).toBeVisible()

      // Escape cancels without changing anything.
      await again.press('Escape')
      await expect(skills.getByRole('button', { name: 'Edit skill: Figma Prototyping', exact: true })).toHaveCount(1)
      await expect(skills.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length)

      // Clicking away (blurring the input) saves.
      await skills.getByRole('button', { name: 'Edit skill: Accessibility', exact: true }).click()
      const blurred = skills.getByRole('textbox', { name: 'Edit skill: Accessibility' })
      await blurred.fill('Accessibility (WCAG)')
      await blurred.blur()
      await expect(skills.getByRole('button', { name: 'Edit skill: Accessibility (WCAG)', exact: true })).toHaveCount(1)

      // Emptying a skill removes it.
      await skills.getByRole('button', { name: 'Edit skill: Prototyping', exact: true }).click()
      const emptied = skills.getByRole('textbox', { name: 'Edit skill: Prototyping' })
      await emptied.fill('')
      await emptied.press('Enter')
      await expect(skills.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length - 1)

      // The × still removes, on its own.
      await skills.getByRole('button', { name: 'Remove skill: Design Systems', exact: true }).click()
      await expect(skills.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length - 2)
    })
  }

  test('"+ Add" opens an empty chip and adds nothing if left empty', async ({ page }) => {
    await pickTemplate(page, 'Creative')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    const skills = page.locator('.direct-edit-preview [data-export-section="skills"]')

    await skills.getByRole('button', { name: '+ Add' }).click()
    const newSkill = skills.getByRole('textbox', { name: 'New skill' })
    await expect(newSkill).toBeFocused()
    await newSkill.fill('Docker')
    await newSkill.press('Enter')
    await expect(skills.getByRole('button', { name: 'Edit skill: Docker', exact: true })).toHaveCount(1)

    await skills.getByRole('button', { name: '+ Add' }).click()
    await expect(skills.getByRole('textbox', { name: 'New skill' })).toBeFocused()
    await skills.getByRole('textbox', { name: 'New skill' }).blur()
    await expect(skills.getByRole('textbox', { name: 'New skill' })).toHaveCount(0)
    await expect(skills.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length + 1)
    await expect(skills).not.toContainText('New skill')
  })

  test('the Skills popup edits a skill in place', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await openSectionPopup(page, 'skills')
    const popup = page.locator('.direct-edit-popup')

    const first = popup.getByRole('textbox', { name: 'Skill 1' })
    await expect(first).toHaveValue(DEMO_SKILLS[0])
    await first.fill('Product Discovery')
    await first.press('Enter')
    await expect(page.locator('.direct-edit-preview [data-export-section="skills"]')).toContainText('Product Discovery')

    // Escape reverts an unsaved edit without closing the popup.
    const second = popup.getByRole('textbox', { name: 'Skill 2' })
    await second.fill('Something else')
    await second.press('Escape')
    await expect(second).toHaveValue(DEMO_SKILLS[1])
    await expect(popup).toBeVisible()

    // A duplicate is refused with a notice.
    await second.fill('figma')
    await second.press('Enter')
    await expect(popup.getByText('That skill is already listed.')).toBeVisible()
  })

  test('Classic mode edits a skill tag in place', async ({ page }) => {
    const skillsSection = page.locator('#section-skills')
    await skillsSection.getByRole('button', { name: 'Edit Figma', exact: true }).click()
    const editor = skillsSection.getByRole('textbox', { name: 'Edit Figma' })
    await expect(editor).toBeFocused()
    await editor.fill('Figma Prototyping')
    await editor.press('Enter')

    await expect(skillsSection.getByRole('button', { name: 'Edit Figma Prototyping', exact: true })).toHaveCount(1)
    await expect(page.locator('.app-shell__preview [data-export-section="skills"]')).toContainText('Figma Prototyping')
  })
})

test.describe('Direct Edit pencils and Load demo CV', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  })

  // The section pencil used to appear only while the pointer was over a
  // section, which was easy to miss and near-unreachable on touch.
  test('every section shows its pencil without hovering, and each opens its own section', async ({ page }) => {
    await pickTemplate(page, 'Creative')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await page.mouse.move(0, 0)

    const sectionKeys = await page.locator('.direct-edit-preview [data-export-section]').evaluateAll(
      (nodes) => [...new Set(nodes.map((node) => node.getAttribute('data-export-section')))],
    )
    expect(sectionKeys.length).toBeGreaterThan(3)
    for (const key of [...sectionKeys, 'identity']) {
      await expect(page.locator(`[data-direct-edit-pencil="${key}"]`)).toBeVisible()
    }

    // Each pencil sits at its own section's top-right corner: just outside
    // it where there's room (1.6.53), otherwise just inside it.
    const geometry = await page.evaluate(() => {
      const pencil = document.querySelector('[data-direct-edit-pencil="experience"]')
      const box = pencil.getBoundingClientRect()
      const section = document.querySelector('.direct-edit-preview [data-export-section="experience"]').getBoundingClientRect()
      return {
        outside: pencil.classList.contains('direct-edit-pencil--outside'),
        pencilTop: box.top, pencilLeft: box.left, pencilRight: box.right, sectionTop: section.top, sectionRight: section.right,
      }
    })
    expect(Math.abs(geometry.pencilTop - geometry.sectionTop)).toBeLessThan(6)
    if (geometry.outside) {
      expect(Math.abs(geometry.pencilLeft - geometry.sectionRight - 6)).toBeLessThan(6)
    } else {
      expect(Math.abs(geometry.pencilRight - geometry.sectionRight)).toBeLessThan(6)
    }

    await page.locator('[data-direct-edit-pencil="experience"]').click()
    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()
    await expect(popup).toContainText('Experience')
    await page.keyboard.press('Escape')

    await page.locator('[data-direct-edit-pencil="identity"]').click()
    await expect(popup.locator('.direct-edit-popup__label', { hasText: 'Full name' })).toBeVisible()
  })

  test('pencils follow their sections when an edit moves them', async ({ page }) => {
    await pickTemplate(page, 'Modern Timeline')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const offset = (key) => page.evaluate((sectionKey) => {
      const pencil = document.querySelector(`[data-direct-edit-pencil="${sectionKey}"]`).getBoundingClientRect()
      const section = document.querySelector(`.direct-edit-preview [data-export-section="${sectionKey}"]`).getBoundingClientRect()
      return { dy: Math.round(pencil.top - section.top), sectionTop: Math.round(section.top) }
    }, key)

    const before = await offset('education')

    // Making the summary much longer pushes every later section down.
    const summary = page.locator('.direct-edit-preview [data-export-section="about"] .direct-edit-field').first()
    await summary.click()
    await page.keyboard.press('End')
    await page.keyboard.type(' A much longer summary sentence that adds several more lines of text to this section.'.repeat(4))

    await expect.poll(async () => (await offset('education')).sectionTop).toBeGreaterThan(before.sectionTop + 20)
    await expect.poll(async () => (await offset('education')).dy).toBe(before.dy)
  })

  // Two-step, like Classic's "Reset form": one stray click can't wipe the CV.
  test('Clear CV arms on the first click, clears on the second, and Undo restores the CV', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    const actions = page.locator('.direct-edit-actions')
    const nameField = page.locator('.direct-edit-preview h3 .direct-edit-field')
    await expect(nameField).toHaveText('John Doe')
    // Let the demo load settle into its own undo step (HISTORY_COMMIT_DELAY_MS).
    await page.waitForTimeout(800)

    await actions.getByRole('button', { name: 'Clear CV' }).click()
    await expect(actions.getByRole('button', { name: 'Confirm clear' })).toBeVisible()
    await expect(nameField).toHaveText('John Doe')

    await actions.getByRole('button', { name: 'Confirm clear' }).click()
    await expect(page.getByText('CV cleared. Restore it with the toolbar undo arrow.')).toBeVisible()
    await expect(nameField).toHaveText('')
    await expect(page.locator('.direct-edit-preview [data-export-section="experience"]').first())
      .not.toContainText('Senior Product Designer')
    await expect(actions.getByRole('button', { name: 'Clear CV' })).toBeVisible()

    await page.getByRole('banner').getByRole('button', { name: 'Undo' }).click()
    await expect(nameField).toHaveText('John Doe')
  })

  test('Load demo CV is available in Direct Edit, and Undo restores the previous CV', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const nameField = page.locator('.direct-edit-preview h3 .direct-edit-field')
    await nameField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Someone Else')
    await nameField.blur()
    await expect(nameField).toHaveText('Someone Else')
    // Undo history groups changes made within HISTORY_COMMIT_DELAY_MS
    // (600 ms, ResumeBuilderPage.jsx) into one step; wait past it so the
    // name edit and the demo load are separate steps, as for a real user.
    await page.waitForTimeout(800)

    await page.locator('.direct-edit-actions').getByRole('button', { name: 'Load demo CV' }).click()
    // .last(): the beforeEach's own Load demo CV toast may still be up.
    await expect(page.getByText('Demo CV loaded.').last()).toBeVisible()
    await expect(nameField).toHaveText('John Doe')

    await page.getByRole('banner').getByRole('button', { name: 'Undo' }).click()
    await expect(nameField).toHaveText('Someone Else')
  })
})

// ATS view in Direct Edit (1.6.25): the app-wide ATS-friendly mode now
// applies here too, so the CV you edit is the ATS layout you export.
test.describe('ATS view in Direct Edit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
  })

  const atsToggle = (page) => page.locator('.direct-edit-actions').getByRole('button', { name: 'ATS view' })

  test('the toggle switches the editable CV and its export copy to the ATS layout, and back', async ({ page }) => {
    await pickTemplate(page, 'Developer')
    await expect(atsToggle(page)).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('.direct-edit-preview .preview-document--ats')).toHaveCount(0)

    await atsToggle(page).click()
    await expect(atsToggle(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.direct-edit-preview .preview-document--ats')).toBeVisible()
    await expect(page.locator('.direct-edit-export-source .preview-document--ats')).toHaveCount(1)

    // One setting app-wide: Settings and Classic follow it.
    await page.getByRole('button', { name: 'Settings' }).click()
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    await expect(dialog.locator('.settings-row', { hasText: 'ATS-friendly mode' }).getByRole('checkbox')).toBeChecked()
    await page.getByRole('button', { name: 'Close' }).click()
    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(page.locator('.app-shell__preview .preview-document--ats')).toBeVisible()

    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await atsToggle(page).click()
    await expect(atsToggle(page)).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('.direct-edit-preview .preview-document--ats')).toHaveCount(0)
    await expect(page.locator('.direct-edit-export-source .preview-document--ats')).toHaveCount(0)
  })

  test('text stays editable in place in the ATS layout', async ({ page }) => {
    await pickTemplate(page, 'Developer')
    await atsToggle(page).click()

    const nameField = page.locator('.direct-edit-preview [data-cv-name] .direct-edit-field')
    await expect(nameField).toHaveAttribute('contenteditable', 'true')
    await nameField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Jordan Rivera')
    await nameField.blur()

    await expect(page.locator('.direct-edit-export-source [data-cv-name]')).toHaveText('Jordan Rivera')
    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('Jordan Rivera')
  })

  // The ATS layout is one column, so the popup drops its Main/Sidebar
  // control there; everything else in it still works.
  test('section pencils open their popups, without the column control', async ({ page }) => {
    await pickTemplate(page, 'Developer')

    await openSectionPopup(page, 'education')
    await expect(page.getByRole('group', { name: 'Column' })).toBeVisible()
    await page.keyboard.press('Escape')

    await atsToggle(page).click()
    await page.locator('[data-direct-edit-pencil="education"]').click()
    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()
    await expect(popup).toContainText('Education')
    await expect(page.getByRole('group', { name: 'Column' })).toHaveCount(0)
  })

  for (const label of ['Minimalist', 'Navy Professional', 'Modern Orange', 'Creative']) {
    test(`${label}: a PDF exported with ATS view on uses the ATS layout`, async ({ page }) => {
      await pickTemplate(page, label)
      await atsToggle(page).click()
      await expect(page.locator('.direct-edit-export-source [data-export-variant]').first()).toBeAttached()
      // Navy Professional and Modern Orange render their own Showcase
      // simplified (a `showcase--ats` class); the rest use the flat ATS
      // document. Either way the export copy is in ATS mode.
      const isAts = await page.locator('.direct-edit-export-source').evaluate(
        (root) => Boolean(root.querySelector('.preview-document--ats, [class*="showcase--ats"]')),
      )
      expect(isAts).toBe(true)
      await exportPdfAndExpectSuccess(page)
    })
  }
})

// 1.6.52: the Direct Edit audit's fixes.
test.describe('Direct Edit audit fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
  })

  const nameField = (page) => page.locator('.direct-edit-preview [data-export-header] [contenteditable]').first()
  const experienceEntries = (page) => page.locator('.direct-edit-preview [data-export-section="experience"] .direct-edit-entry')

  test('a hidden entry is marked in the editable CV, left out of the export, and shown again from its mark', async ({ page }) => {
    await openSectionPopup(page, 'experience')
    await page.locator('.direct-edit-popup__entry').first().locator('.direct-edit-popup__entry-visibility').click()
    await page.keyboard.press('Escape')

    const first = experienceEntries(page).first()
    await expect(first).toHaveClass(/direct-edit-entry--hidden/)
    await expect(page.locator('.direct-edit-export-source [data-export-section="experience"]')).not.toContainText('Senior Product Designer')

    await first.getByRole('button', { name: 'Hidden from export · Show' }).click()
    await expect(first).not.toHaveClass(/direct-edit-entry--hidden/)
    await expect(page.locator('.direct-edit-export-source [data-export-section="experience"]')).toContainText('Senior Product Designer')
  })

  test('text pasted with line breaks into a one-line field is stored on one line', async ({ page }) => {
    const field = nameField(page)
    await field.click()
    await page.keyboard.press('Control+A')
    await field.evaluate((el) => {
      const data = new DataTransfer()
      data.setData('text/plain', 'Jane\nSmith\n')
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }))
    })
    await field.blur()
    await expect(field).toHaveText('Jane Smith')

    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('Jane Smith')
  })

  test('a field that had focus during Undo shows the undone text once it loses focus', async ({ page }) => {
    const field = nameField(page)
    await field.click()
    await page.keyboard.press('End')
    await page.keyboard.type(' Jr')
    await expect(page.getByRole('button', { name: 'Undo' })).toBeEnabled()
    // Safari and Firefox on a Mac leave focus in the field when a button is
    // clicked; a click from script does the same in Chromium.
    await page.getByRole('button', { name: 'Undo' }).evaluate((button) => button.click())
    await expect(field).toBeFocused()
    await field.blur()
    await expect(field).toHaveText('John Doe')
    await expect(page.locator('.direct-edit-export-source [data-export-header]')).toContainText('John Doe')
  })

  test('switching template closes an open section popup', async ({ page }) => {
    await openSectionPopup(page, 'experience')
    await pickTemplate(page, 'Developer')
    await expect(page.locator('.direct-edit-popup')).toHaveCount(0)
    await expect(page.locator('[data-direct-edit-pencil="experience"]')).toBeVisible()
  })

  test('Tab out of a renamed skill in the popup keeps focus in the popup', async ({ page }) => {
    await openSectionPopup(page, 'skills')
    const skill = page.getByRole('textbox', { name: 'Skill 2' })
    await skill.fill('Design Ops')
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('.direct-edit-popup')))).toBe(true)
    await expect(page.getByRole('textbox', { name: 'Skill 2' })).toHaveValue('Design Ops')
    await expect(page.locator('.direct-edit-preview [data-export-section="skills"]')).toContainText('Design Ops')
  })

  test("an entry's drag handle and remove button show on keyboard focus and sit clear of its content", async ({ page }) => {
    const entry = experienceEntries(page).first()
    const remove = entry.locator('.direct-edit-entry__remove')
    await remove.focus()
    await expect(remove).toHaveCSS('opacity', '1')
    await expect(entry.locator('.direct-edit-entry__handle')).toHaveCSS('opacity', '1')

    // Nothing of the entry's own content covers it (on Minimalist it used
    // to sit under the dates, top-right).
    const onTop = await remove.evaluate((button) => {
      const rect = button.getBoundingClientRect()
      return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) === button
    })
    expect(onTop).toBe(true)
  })
})

// 1.6.53: the preview's own buttons sit above the CV and the section
// pencils beside it, so neither covers the CV at any width.
test.describe('Direct Edit chrome stays off the CV', () => {
  const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

  for (const size of [{ width: 1280, height: 800 }, { width: 1024, height: 768 }, { width: 375, height: 812 }]) {
    test(`at ${size.width}px the buttons cover no section and no pencil`, async ({ page }) => {
      await page.setViewportSize(size)
      await page.goto('/cv')
      await page.getByRole('button', { name: 'Load demo CV' }).first().click()
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
      await expect(page.locator('[data-direct-edit-pencil="about"]')).toBeVisible()

      const found = await page.evaluate(() => {
        const box = (el) => el.getBoundingClientRect()
        const buttons = [...document.querySelectorAll('.direct-edit-actions button')].map(box)
        const sections = [...document.querySelectorAll('.direct-edit-preview [data-export-section], .direct-edit-preview [data-export-header]')].map(box)
        const pencils = [...document.querySelectorAll('.direct-edit-pencil')].map(box)
        return { buttons, sections, pencils }
      })
      const clash = found.buttons.filter((button) => [...found.sections, ...found.pencils].some((other) => overlaps(button, other)))
      expect(clash).toEqual([])
    })
  }

  test("on a wide screen a section's pencil sits outside the section", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    const pencil = page.locator('[data-direct-edit-pencil="about"]')
    await expect(pencil).toHaveClass(/direct-edit-pencil--outside/)
    const [pencilBox, sectionBox] = await Promise.all([
      pencil.boundingBox(),
      page.locator('.direct-edit-preview [data-export-section="about"]').first().boundingBox(),
    ])
    expect(pencilBox.x).toBeGreaterThanOrEqual(sectionBox.x + sectionBox.width)
  })
})
