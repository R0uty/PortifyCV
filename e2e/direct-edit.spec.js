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

  test('adding an experience entry in Direct Edit mode adds one to the form', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    const before = await page.locator('.direct-edit-preview .direct-edit-entry').count()
    await page.locator('.direct-edit-add-row', { hasText: 'Add experience' }).click()
    await expect(page.locator('.direct-edit-preview .direct-edit-entry')).toHaveCount(before + 1)
  })

  test('an unsupported template shows the read-only notice and no crash', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    // Executive was this test's original example template, but Round 6
    // added it to DIRECT_EDIT_SUPPORTED_TEMPLATES, so it no longer shows
    // the read-only notice. Developer remains genuinely unsupported.
    await selectTemplate(page, 'Developer')
    await expect(page.locator('.direct-edit-preview__notice')).toBeVisible()
    await expect(page.locator('.direct-edit-preview [contenteditable="true"]')).toHaveCount(0)
  })

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
  // an unsupported template (Developer, not in DIRECT_EDIT_SUPPORTED_TEMPLATES
  // — see src/utils/directEdit.js) and back to Minimalist.
  test('an edit in Direct Edit mode survives switching to an unsupported template and back', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const nameField = page.locator('.direct-edit-preview h3 .direct-edit-field')
    await nameField.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Jordan Rivera')
    await nameField.blur()

    // Executive was this test's original example template, but Round 6
    // added it to DIRECT_EDIT_SUPPORTED_TEMPLATES, so it no longer shows
    // the read-only notice. Developer remains genuinely unsupported.
    await selectTemplate(page, 'Developer')
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
})
