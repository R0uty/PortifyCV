import { test, expect } from '@playwright/test'

// Same pattern as e2e/templates.spec.js's selectTemplate helper: the
// toolbar's template trigger exposes "Select template: <name>" to screen
// readers (an sr-only prefix span plus the visible label span), and opens
// the shared TemplateGalleryModal.
async function selectTemplate(page, label) {
  await page.getByRole('button', { name: /^Select template:/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Template gallery' })
  await dialog.getByText(label, { exact: true }).click()
}

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

// Templates that have opted into section column moves (cvTemplates.js
// `columnMoves: true`). The sweep test below walks every one of them;
// each template's rollout task appends its label here.
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
    const parse = (value) => {
      const parts = value.match(/[\d.]+/g).map(Number)
      return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 }
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

    const pencil = page.locator('.direct-edit-pencil')
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
    await page.locator('.direct-edit-pencil').click()

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
    // Direct Edit the entry stays visible — a documented, accepted
    // trade-off since Phase 1 that this task does not change. Asserting
    // otherwise would encode a false expectation and fail.
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
    await page.locator('.direct-edit-pencil').click()

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
    await selectTemplate(page, 'Creative')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-header]').first().hover()
    await page.locator('.direct-edit-pencil').click()

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
    await selectTemplate(page, 'Creative')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const section = page.locator('[data-export-secondary="true"] [data-export-section]').first()
    const sectionKey = await section.getAttribute('data-export-section')

    await section.hover()
    await page.locator('.direct-edit-pencil').click()
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
    await page.locator('.direct-edit-pencil').click()
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
    await page.locator('.direct-edit-pencil').click()

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
    await page.locator('.direct-edit-pencil').click()

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
    await selectTemplate(page, 'Portfolio Hybrid')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await expect(page.locator('[data-export-photo]')).toHaveCount(0)

    await page.locator('[data-export-header]').first().hover()
    await page.locator('.direct-edit-pencil').click()

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
    await selectTemplate(page, 'Portfolio Hybrid')

    await page
      .getByLabel('Profile image (optional)')
      .setInputFiles({ name: 'profile.png', mimeType: 'image/png', buffer: PNG_1X1 })

    await expect(page.getByAltText('Profile preview')).toBeVisible()
    await expect(page.locator('[data-export-photo]').first()).toBeVisible()
  })

  test('the popup adds, reorders and removes skills, and refuses duplicates', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="skills"]').first().hover()
    await page.locator('.direct-edit-pencil').click()

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
    await selectTemplate(page, 'Creative')

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
    await page.locator('.direct-edit-pencil').click()
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

  test('an inline-unwired template is still fully editable through the popup', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Quadrant')

    await expect(page.locator('.direct-edit-preview__notice')).toHaveCount(0)

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil').click()
    await expect(page.locator('.direct-edit-popup')).toBeVisible()
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
      await selectTemplate(page, label)

      await page.locator(`[data-export-section="${sectionKey}"]`).first().hover()
      await page.locator('.direct-edit-pencil').click()

      const popup = page.locator('.direct-edit-popup')
      await expect(popup).toBeVisible()
      await expect(popup.locator('.direct-edit-popup__title')).toHaveText(title)
    })
  }

  test('Navy Professional and Modern Orange still export to PDF with tagged sidebar sections', async ({ page }) => {
    test.setTimeout(90_000)
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    for (const label of ['Navy Professional', 'Modern Orange']) {
      await selectTemplate(page, label)
      await exportPdfAndExpectSuccess(page)
    }
  })

  test('hovering one experience entry reveals an entry pencil that opens the popup on that entry', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Quadrant')

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
    await expect(focusedEntry.locator('input[data-field="company"]')).toHaveValue('Atlas Labs')
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
  // first card rendered on a snapshot-driven template is formData #2.
  test('an entry pencil still targets the right entry when an earlier entry is hidden', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Quadrant')

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil').click()
    const popup = page.locator('.direct-edit-popup')
    await popup.locator('.direct-edit-popup__entry').first().locator('.direct-edit-popup__entry-visibility').click()
    await page.keyboard.press('Escape')
    await expect(popup).toHaveCount(0)

    const firstRendered = page.locator('[data-export-section="experience"] [data-direct-edit-index]').first()
    await expect(firstRendered).toContainText('Atlas Labs')
    await firstRendered.hover()
    await page.locator('.direct-edit-entry-pencil').click()

    const focusedEntry = popup.locator('.direct-edit-popup__entry--focused')
    await expect(focusedEntry.locator('.direct-edit-popup__entry-index')).toHaveText('#2')
    await expect(focusedEntry.locator('input[data-field="company"]')).toHaveValue('Atlas Labs')
  })

  // Every template, with entry #1 hidden so snapshot-driven templates
  // (filtered indices) and inline-wired ones (raw formData indices) both
  // get exercised: each experience card's data-direct-edit-index must name
  // the formData entry whose company it actually shows.
  test('every template tags each experience entry with its formData index', async ({ page }) => {
    test.setTimeout(120_000)
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil').click()
    await page.locator('.direct-edit-popup__entry').first().locator('.direct-edit-popup__entry-visibility').click()
    await page.keyboard.press('Escape')

    const companies = ['Studio North', 'Atlas Labs']
    const templates = [
      'Minimalist', 'Developer', 'Creative', 'Modern Professional', 'Executive', 'Modern Timeline',
      'Graduate', 'Compact', 'Portfolio Hybrid', 'Tech Executive', 'Classic Professional',
      'Navy Professional', 'Modern Orange', 'Colorful Compact', 'Quadrant', 'Editorial', 'Portrait', 'European',
    ]

    for (const label of templates) {
      await selectTemplate(page, label)
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
    await selectTemplate(page, 'Creative')

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
    await selectTemplate(page, 'Creative')

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
    await selectTemplate(page, 'Creative')

    await openSectionPopup(page, 'education')
    await page.getByRole('group', { name: 'Column' }).getByRole('button', { name: 'Main' }).click()
    await page.keyboard.press('Escape')

    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    expect(await sectionColumnState(page, 'education')).toMatchObject({ inSidebar: false, placement: 'main' })
  })

  test('Creative: PDF export succeeds with a section moved to the main column', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Creative')

    await openSectionPopup(page, 'skills')
    await page.getByRole('group', { name: 'Column' }).getByRole('button', { name: 'Main' }).click()
    await page.keyboard.press('Escape')

    await exportPdfAndExpectSuccess(page)
  })

  test('no column control for sections that cannot move', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Creative')

    await openSectionPopup(page, 'experience')
    await expect(page.getByRole('group', { name: 'Column' })).toHaveCount(0)
    await page.keyboard.press('Escape')

    await selectTemplate(page, 'Minimalist')
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
    test.setTimeout(240_000)
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    for (const label of COLUMN_MOVE_TEMPLATES) {
      await selectTemplate(page, label)
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

      expect(movedAny, `${label}: offered at least one move`).toBe(true)
    }
  })

  // Navy Professional and Modern Orange render the SAME Showcase in ATS
  // mode, recoloured to monochrome with a transparent sidebar. Their
  // moved-section CSS recolours main-column markup for a dark rail, which
  // must not follow it into ATS mode, where that rail is white. Direct Edit
  // itself always renders the designer layout (DirectEditPreview passes
  // atsFriendlyMode={false}), so ATS mode is checked in Classic's preview,
  // which a move made in Direct Edit carries into.
  for (const [label, sectionKey] of [['Navy Professional', 'education'], ['Modern Orange', 'certificates']]) {
    test(`${label}: a section moved to the sidebar stays readable in ATS mode`, async ({ page }) => {
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
      await selectTemplate(page, label)

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

    await page.mouse.wheel(0, 20000)

    const previewBox = await preview.boundingBox()
    const footerBox = await footer.boundingBox()
    // The footer's top edge must be at or below the preview's bottom edge
    // — i.e. positioned after the content, never over it. A 1px tolerance
    // absorbs subpixel rounding between the two boundingBox() calls.
    expect(footerBox.y).toBeGreaterThanOrEqual(previewBox.y + previewBox.height - 1)
  })

  // Regression guard for Fix 1 (final whole-branch review): the Skills
  // section's 'flat' layout used to render every skill twice in Direct Edit
  // mode — once as a plain, non-interactive <span data-export-skill> (never
  // gated on directEditDispatch) and once as a removable EditableChip. Each
  // skill must now appear exactly once, as a chip, with zero plain tags left
  // in the Skills section.
  test('each skill renders exactly once, as a removable chip, in Direct Edit mode', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const skillsSection = page.locator('[data-export-section="skills"]')
    await expect(skillsSection).toBeVisible()

    // No plain read-only tags left in the Skills section while editing.
    await expect(skillsSection.locator('[data-export-skill="true"]')).toHaveCount(0)

    // Every demo-CV skill shows up exactly once as a removable chip.
    const chips = skillsSection.locator('.direct-edit-chip--removable')
    await expect(chips).toHaveCount(DEMO_SKILLS.length)
    for (const skill of DEMO_SKILLS) {
      await expect(skillsSection.getByRole('button', { name: new RegExp(`^${skill}`) })).toHaveCount(1)
    }
  })

  // Explicitly listed in the spec's testing plan and never written until
  // this fix wave: toggling a section's visibility from the Sections
  // popover must hide/show it in the live preview immediately.
  test('the Sections popover toggles a section\'s visibility in the live preview', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await expect(page.locator('[data-export-section="skills"]')).toBeVisible()

    await page.getByRole('button', { name: 'Sections' }).click()
    const skillsCheckbox = page.getByRole('checkbox', { name: 'Skills' })

    // TOGGLE_SECTION_VISIBILITY negates the raw (possibly unset) visibility
    // map, not the merged default — see scripts/check-reducers.mjs's pinned
    // "TOGGLE_SECTION_VISIBILITY on a missing map resolves to the
    // (coincidental) default of true" check. Loading the demo CV replaces
    // formData wholesale with an object that carries no sectionVisibility
    // map at all (src/utils/cvForm.js's demoCvData never sets one), so the
    // very first toggle of any section from that state lands back on
    // "visible" instead of flipping — documented, intentional reducer
    // behavior, not a Direct Edit bug. The second click, now against an
    // explicit map, behaves normally, which is what the rest of this test
    // actually exercises.
    await skillsCheckbox.click()
    await skillsCheckbox.click()
    await expect(skillsCheckbox).not.toBeChecked()
    await expect(page.locator('[data-export-section="skills"]')).toHaveCount(0)

    await skillsCheckbox.click()
    await expect(skillsCheckbox).toBeChecked()
    await expect(page.locator('[data-export-section="skills"]')).toBeVisible()
  })

  // Explicitly listed in the spec's testing plan and never written until
  // this fix wave: the existing coverage only exercises a *mode* switch
  // (Direct Edit <-> Classic), not a *template* switch while staying in
  // Direct Edit the whole time. An edit must survive a round-trip through
  // a template without the inline bonus layer (Developer, not in
  // INLINE_EDIT_SUPPORTED_TEMPLATES — see src/utils/directEdit.js) and
  // back to Minimalist.
  test('an edit in Direct Edit mode survives switching to an inline-unwired template and back', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const nameField = page.locator('.direct-edit-preview h3 .direct-edit-field')
    await nameField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Jordan Rivera')
    await nameField.blur()

    // Developer is not in INLINE_EDIT_SUPPORTED_TEMPLATES, so it has no
    // inline contentEditable fields, but it's still fully editable via the
    // popup — this test only checks the edit survives the round-trip.
    await selectTemplate(page, 'Developer')

    await selectTemplate(page, 'Minimalist')
    const nameFieldAgain = page.locator('.direct-edit-preview h3 .direct-edit-field')
    await expect(nameFieldAgain).toHaveText('Jordan Rivera')
    await expect(nameFieldAgain).toHaveAttribute('contenteditable', 'true')
  })

  // Regression guard for Fix 2 (final whole-branch review): DirectEditPreview
  // hardcodes atsFriendlyMode={false} on its CVPreview call, but
  // handleExport used to compute exportPdfMode from the app's real
  // atsFriendlyMode toggle regardless of builderMode — so with ATS mode ON
  // while in Direct Edit, waitForPreviewModeSync polled for a
  // `preview-document--ats` class the DOM would never produce, timed out,
  // and PDF export failed every time with no way to recover (see Fix 5:
  // Settings, where the ATS toggle lives, was itself unreachable on desktop
  // in Direct Edit mode until this same fix wave). Both ATS states must now
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
    await expect(page.locator('.direct-edit-pencil')).toBeVisible()

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
      await selectTemplate(page, label)

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
      const skillsSection = page.locator(skillsSectionSelector)
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
        const firstBorderStyle = await entries.first().evaluate((el) => getComputedStyle(el).borderBottomStyle)
        expect(firstBorderStyle).toBe('solid')
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

      await selectTemplate(page, label)
      await page.getByRole('tab', { name: 'Direct Edit' }).click()

      const metaFields = page.locator(`.${classPrefix}__${contactRowSuffix} .direct-edit-field`)
      await expect(metaFields).toHaveCount(3)

      for (let i = 0; i < labelOrder.length; i++) {
        const content = await metaFields.nth(i).evaluate((el) => getComputedStyle(el, '::before').content)
        expect(content).toContain(labelOrder[i])
      }
    })
  }

  // Compact-only regression guard: EditableCategorizedChip groups skills by
  // a DERIVED category (parseSkillCategories buckets by regex against each
  // skill's own text) but must still dispatch REMOVE_SKILL against each
  // skill's ORIGINAL formData.skills index. The demo CV's 6 default skills
  // (DEMO_SKILLS) all land in one "Other" group, so this test adds a skill
  // that regexes into a DIFFERENT group ("Docker" -> devops) via Classic
  // mode's Skill tags input, removes specifically that chip in Direct Edit
  // mode, and confirms all 6 original skills survive untouched — proving
  // the index mapping is correct, not just that a chip disappeared.
  test('Compact: removing a categorized skill chip removes the correct skill, not a same-category neighbor', async ({ page }) => {
    await selectTemplate(page, 'Compact')

    const skillsInput = page.getByLabel('Skill tags', { exact: true })
    await skillsInput.fill('Docker')
    await skillsInput.press('Enter')

    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const skillsSection = page.locator('[data-export-section="skills"]')
    await expect(skillsSection.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length + 1)

    await skillsSection.getByRole('button', { name: /^Docker/ }).click()

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
      await selectTemplate(page, label)

      const section = page.locator('[data-export-section="experience"]').first()
      await expect(section).toBeVisible()

      await section.hover()
      await page.locator('.direct-edit-pencil').click()

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
    await page.locator('.direct-edit-pencil').click()

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
    await page.getByRole('button', { name: /^Valitse pohja:/ }).click()
    await page.getByRole('dialog', { name: 'Pohjagalleria' }).getByText('Luova', { exact: true }).click()

    await openSectionPopup(page, 'skills')
    const group = page.getByRole('group', { name: 'Sarake' })
    await expect(group.getByRole('button', { name: 'Pääsarake' })).toBeVisible()
    await expect(group.getByRole('button', { name: 'Sivupalkki' })).toHaveAttribute('aria-pressed', 'true')
  })
})
