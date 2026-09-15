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

  test('adding an experience entry in Direct Edit mode adds one to the form', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    const before = await page.locator('.direct-edit-preview .direct-edit-entry').count()
    await page.locator('.direct-edit-add-row', { hasText: 'Add experience' }).click()
    await expect(page.locator('.direct-edit-preview .direct-edit-entry')).toHaveCount(before + 1)
  })

  test('an unsupported template shows the read-only notice and no crash', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Executive')
    await expect(page.locator('.direct-edit-preview__notice')).toBeVisible()
    await expect(page.locator('.direct-edit-preview [contenteditable="true"]')).toHaveCount(0)
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
  // an unsupported template (Executive, not in DIRECT_EDIT_SUPPORTED_TEMPLATES
  // — see src/utils/directEdit.js) and back to Minimalist.
  test('an edit in Direct Edit mode survives switching to an unsupported template and back', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const nameField = page.locator('.direct-edit-preview h3 .direct-edit-field')
    await nameField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Jordan Rivera')
    await nameField.blur()

    await selectTemplate(page, 'Executive')
    await expect(page.locator('.direct-edit-preview__notice')).toBeVisible()

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

    async function exportPdfAndExpectSuccess() {
      await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
      const downloadPromise = page.waitForEvent('download')
      await page.getByRole('menuitem', { name: 'PDF' }).click()
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/\.pdf$/)
      await expect(page.getByRole('alert')).toHaveCount(0)
    }

    // ATS mode off (the default).
    await exportPdfAndExpectSuccess()

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
    await exportPdfAndExpectSuccess()
  })

  // First template added to DIRECT_EDIT_SUPPORTED_TEMPLATES after Minimalist
  // (the Phase 1 reference template) — Phase 2 Round 1. Only needs its own
  // "does editing actually work" smoke test; the mechanisms above (mode
  // switching, Sections popover, template-switch survival, etc.) are already
  // covered generically and don't need re-testing per template.
  test('Classic Professional: name persists, skills render once as chips, and a multi-line description survives editing', async ({ page }) => {
    await selectTemplate(page, 'Classic Professional')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    // Name round-trips to Classic mode's form.
    const nameField = page.locator('.classic-professional-showcase__name .direct-edit-field')
    await nameField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Jordan Rivera')
    await nameField.blur()

    // Regression guard for the same Critical #1 class of bug Minimalist
    // already guards against ('each skill renders exactly once...' above) —
    // Classic Professional's Skills section has its own separate gating in
    // ClassicProfessionalShowcase.jsx and needs its own guard.
    const skillsSection = page.locator('[data-export-section="skills"]')
    await expect(skillsSection.locator('[data-export-skill="true"]')).toHaveCount(0)
    await expect(skillsSection.locator('.direct-edit-chip--removable')).toHaveCount(DEMO_SKILLS.length)

    // Regression guard for the final whole-branch review's Fix 1
    // (2026-09-15): the Experience description's editing branch referenced
    // a CSS class with no rule, so newlines collapsed to spaces via
    // EditableField's innerText-based dispatch — corrupting the user's
    // actual data, not just the display. Type two lines, switch to Classic
    // mode, and confirm the textarea (which preserves value verbatim,
    // unlike a rendered element) still holds both lines.
    const firstEntry = page.locator('[data-export-section="experience"] .direct-edit-entry').first()
    const descriptionField = firstEntry.locator('.direct-edit-field').last()
    await descriptionField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Led the redesign')
    await page.keyboard.press('Enter')
    await page.keyboard.type('Shipped it two weeks early')
    await descriptionField.blur()

    await page.getByRole('tab', { name: 'Classic' }).click()
    await expect(page.getByLabel('Full name')).toHaveValue('Jordan Rivera')
    // getByLabel('Description') alone would also match the unrelated
    // "Job description" ATS keyword-match textarea (its aria-label contains
    // "description" and Playwright's default label matching is a
    // case-insensitive substring) — { exact: true } scopes this to the
    // FloatingField-labeled textarea only. A trailing "\n" is tolerated:
    // the contentEditable field's execCommand('insertText', '\n') leaves an
    // implicit trailing newline in the DOM after the final keystroke, which
    // is unrelated to the collapsed-to-one-line defect this test guards.
    await expect(page.getByLabel('Description', { exact: true }).first()).toHaveValue(
      /^Led the redesign\nShipped it two weeks early\n?$/,
    )
  })
})
