// Regression check for the pure reducers (src/reducers/cvFormReducer.js,
// src/reducers/uiReducer.js).
//
// Both are plain (state, action) -> state functions with no side effects, so
// they run the same way the app calls them from a `useReducer` hook - one
// action in, one next state out - without needing a browser or a component tree.
//
//   node scripts/check-reducers.mjs
//
// Exits non-zero if any check fails.

import { registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

// The app's source uses extensionless relative imports, which Vite resolves and
// bare Node does not.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
        return nextResolve(`${specifier}.js`, context)
      }
      throw error
    }
  },
})

const srcDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '../src')
const importSrc = (relativePath) => import(pathToFileURL(resolvePath(srcDir, relativePath)).href)

const { cvFormReducer, FORM_ACTION } = await importSrc('reducers/cvFormReducer.js')
const { uiReducer, UI_ACTION, createInitialUiState } = await importSrc('reducers/uiReducer.js')
const { createInitialCvData, createSectionVisibility, createSectionItemVisibility } =
  await importSrc('utils/cvForm.js')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

// ---------------------------------------------------------------------------
// cvFormReducer
// ---------------------------------------------------------------------------

console.log('\ncvFormReducer\n')

{
  const state = createInitialCvData()
  const next = cvFormReducer(state, { type: FORM_ACTION.SET_ROOT_FIELD, field: 'fullName', value: 'Jane Doe' })
  check('SET_ROOT_FIELD updates only the named field', next.fullName === 'Jane Doe' && next.title === state.title)
  check('SET_ROOT_FIELD does not mutate the previous state', state.fullName === '')
}

{
  const state = createInitialCvData()
  const next = cvFormReducer(state, { type: FORM_ACTION.SET_LINK_FIELD, field: 'linkedin', value: 'jane' })
  check('SET_LINK_FIELD writes into the links sub-object', next.links.linkedin === 'jane')
  check('SET_LINK_FIELD leaves sibling link fields untouched', next.links.github === state.links.github)
}

{
  const state = createInitialCvData()
  const next = cvFormReducer(state, { type: FORM_ACTION.TOGGLE_SECTION_VISIBILITY, section: 'skills' })
  check('TOGGLE_SECTION_VISIBILITY flips only the named section', next.sectionVisibility.skills === false)
  check('TOGGLE_SECTION_VISIBILITY leaves other sections visible', next.sectionVisibility.about === true)
  const backAgain = cvFormReducer(next, { type: FORM_ACTION.TOGGLE_SECTION_VISIBILITY, section: 'skills' })
  check('TOGGLE_SECTION_VISIBILITY is reversible', backAgain.sectionVisibility.skills === true)
}

{
  // The toggle flips a section's *effective* visibility (stored value over
  // the defaults), so a CV with no visibility map at all — the demo CV, or
  // any CV loaded wholesale — hides the section on the first toggle. It used
  // to negate the raw (absent) value, landing on `true`, so the first click
  // on a section's checkbox did nothing.
  const state = { ...createInitialCvData(), sectionVisibility: undefined }
  const next = cvFormReducer(state, { type: FORM_ACTION.TOGGLE_SECTION_VISIBILITY, section: 'about' })
  check('TOGGLE_SECTION_VISIBILITY on a missing map hides the section on the first toggle', next.sectionVisibility.about === false)
  check('TOGGLE_SECTION_VISIBILITY on a missing map keeps other sections visible', next.sectionVisibility.skills === true)
  const backAgain = cvFormReducer(next, { type: FORM_ACTION.TOGGLE_SECTION_VISIBILITY, section: 'about' })
  check('TOGGLE_SECTION_VISIBILITY on a missing map is reversible', backAgain.sectionVisibility.about === true)

  // Same for a map that exists but lacks the section's key.
  const partial = { ...createInitialCvData(), sectionVisibility: { skills: false } }
  const partialNext = cvFormReducer(partial, { type: FORM_ACTION.TOGGLE_SECTION_VISIBILITY, section: 'about' })
  check('TOGGLE_SECTION_VISIBILITY on a key missing from the map hides it on the first toggle', partialNext.sectionVisibility.about === false)
  check('TOGGLE_SECTION_VISIBILITY keeps the map\'s other stored values', partialNext.sectionVisibility.skills === false)
}

{
  const state = createInitialCvData()
  const next = cvFormReducer(state, {
    type: FORM_ACTION.TOGGLE_SECTION_ITEM_VISIBILITY,
    section: 'experience',
    itemKey: 0,
  })
  check('TOGGLE_SECTION_ITEM_VISIBILITY hides an item on first toggle', next.sectionItemVisibility.experience['0'] === false)
  const backAgain = cvFormReducer(next, {
    type: FORM_ACTION.TOGGLE_SECTION_ITEM_VISIBILITY,
    section: 'experience',
    itemKey: 0,
  })
  check(
    'TOGGLE_SECTION_ITEM_VISIBILITY treats anything but false as visible',
    backAgain.sectionItemVisibility.experience['0'] === true,
  )
}

{
  const state = createInitialCvData()
  const next = cvFormReducer(state, { type: FORM_ACTION.TOGGLE_PHOTO_VISIBILITY, template: 'modern' })
  check('TOGGLE_PHOTO_VISIBILITY hides the photo for the named template', next.photoVisibilityByTemplate.modern === false)
  const noTemplate = cvFormReducer(state, { type: FORM_ACTION.TOGGLE_PHOTO_VISIBILITY, template: undefined })
  check('TOGGLE_PHOTO_VISIBILITY without a template is a no-op', noTemplate === state)
}

{
  const state = createInitialCvData()
  check('a new CV stores no style variants', JSON.stringify(state.styleVariantByTemplate) === '{}')

  const picked = cvFormReducer(state, { type: FORM_ACTION.SET_STYLE_VARIANT, templateId: 'developer', variantId: 'graphite' })
  check('SET_STYLE_VARIANT stores the variant for the named template', picked.styleVariantByTemplate.developer === 'graphite')
  check('SET_STYLE_VARIANT does not mutate the previous state', JSON.stringify(state.styleVariantByTemplate) === '{}')

  const both = cvFormReducer(picked, { type: FORM_ACTION.SET_STYLE_VARIANT, templateId: 'creative', variantId: 'sage' })
  check('SET_STYLE_VARIANT leaves other templates untouched',
    both.styleVariantByTemplate.developer === 'graphite' && both.styleVariantByTemplate.creative === 'sage')

  const backToDefault = cvFormReducer(both, { type: FORM_ACTION.SET_STYLE_VARIANT, templateId: 'developer', variantId: 'default' })
  check('choosing variant #1 deletes the entry',
    !('developer' in backToDefault.styleVariantByTemplate) && backToDefault.styleVariantByTemplate.creative === 'sage')

  check('re-picking the stored variant returns the same state',
    cvFormReducer(both, { type: FORM_ACTION.SET_STYLE_VARIANT, templateId: 'creative', variantId: 'sage' }) === both)
  check('picking variant #1 with nothing stored returns the same state',
    cvFormReducer(state, { type: FORM_ACTION.SET_STYLE_VARIANT, templateId: 'developer', variantId: 'default' }) === state)
  check('SET_STYLE_VARIANT ignores a missing template id',
    cvFormReducer(state, { type: FORM_ACTION.SET_STYLE_VARIANT, variantId: 'sage' }) === state)
}

{
  const state = { ...createInitialCvData(), skills: ['Figma'] }
  const added = cvFormReducer(state, { type: FORM_ACTION.ADD_SKILL, skill: '  Design Systems  ' })
  check('ADD_SKILL trims whitespace before storing', added.skills[1] === 'Design Systems')
  const blank = cvFormReducer(state, { type: FORM_ACTION.ADD_SKILL, skill: '   ' })
  check('ADD_SKILL rejects a blank skill', blank === state)
  const dupe = cvFormReducer(state, { type: FORM_ACTION.ADD_SKILL, skill: 'figma' })
  check('ADD_SKILL de-duplicates case-insensitively', dupe === state)
}

{
  const state = {
    ...createInitialCvData(),
    skills: ['Figma', 'Research', 'Writing'],
    sectionItemVisibility: { ...createSectionItemVisibility(), skills: { 2: false } },
  }
  const renamed = cvFormReducer(state, { type: FORM_ACTION.UPDATE_SKILL, index: 1, skill: '  User Research  ' })
  check('UPDATE_SKILL replaces the named skill, trimmed', renamed.skills.join('|') === 'Figma|User Research|Writing')
  check('UPDATE_SKILL keeps item visibility (same index)', renamed.sectionItemVisibility.skills['2'] === false)
  const recased = cvFormReducer(state, { type: FORM_ACTION.UPDATE_SKILL, index: 0, skill: 'FIGMA' })
  check('UPDATE_SKILL allows changing only a skill\'s own case', recased.skills[0] === 'FIGMA')
  const dupe = cvFormReducer(state, { type: FORM_ACTION.UPDATE_SKILL, index: 1, skill: 'writing' })
  check('UPDATE_SKILL refuses a duplicate of another skill, case-insensitively', dupe === state)
  const emptied = cvFormReducer(state, { type: FORM_ACTION.UPDATE_SKILL, index: 0, skill: '   ' })
  check('UPDATE_SKILL to an empty skill removes it', emptied.skills.join('|') === 'Research|Writing')
  check('UPDATE_SKILL removal shifts visibility like REMOVE_SKILL', emptied.sectionItemVisibility.skills['1'] === false)
  const unchanged = cvFormReducer(state, { type: FORM_ACTION.UPDATE_SKILL, index: 1, skill: 'Research' })
  check('UPDATE_SKILL with the same text returns the same state', unchanged === state)
  const outOfRange = cvFormReducer(state, { type: FORM_ACTION.UPDATE_SKILL, index: 9, skill: 'X' })
  check('UPDATE_SKILL ignores an out-of-range index', outOfRange === state)
}

{
  const state = {
    ...createInitialCvData(),
    skills: ['Figma', 'Research', 'Writing'],
    sectionItemVisibility: { ...createSectionItemVisibility(), skills: { 1: false, 2: false } },
  }
  const next = cvFormReducer(state, { type: FORM_ACTION.REMOVE_SKILL, index: 0 })
  check('REMOVE_SKILL removes the named index', next.skills.length === 2 && !next.skills.includes('Figma'))
  check(
    'REMOVE_SKILL shifts visibility keys down past the removed index',
    next.sectionItemVisibility.skills['0'] === false && next.sectionItemVisibility.skills['1'] === false,
  )
}

{
  const state = { ...createInitialCvData(), skills: ['Figma', 'Research'] }
  const next = cvFormReducer(state, { type: FORM_ACTION.DUPLICATE_SKILL, index: 0 })
  check('DUPLICATE_SKILL inserts a copy right after the source', next.skills.length === 3 && next.skills[1] === 'Figma')
  const missing = cvFormReducer(state, { type: FORM_ACTION.DUPLICATE_SKILL, index: 9 })
  check('DUPLICATE_SKILL is a no-op for an out-of-range index', missing === state)
}

{
  const state = { ...createInitialCvData(), skills: ['Figma', 'Research', 'Writing'] }
  const next = cvFormReducer(state, { type: FORM_ACTION.MOVE_SKILL, index: 0, direction: 1 })
  check('MOVE_SKILL swaps the item into its new position', next.skills[0] === 'Research' && next.skills[1] === 'Figma')
  const outOfBounds = cvFormReducer(state, { type: FORM_ACTION.MOVE_SKILL, index: 0, direction: -1 })
  check('MOVE_SKILL refuses to move past the start of the list', outOfBounds === state)
}

{
  const state = createInitialCvData()
  const next = cvFormReducer(state, {
    type: FORM_ACTION.MOVE_SECTION_ORDER,
    fromSection: 'skills',
    toSection: 'about',
  })
  const aboutIndex = next.sectionOrder.indexOf('about')
  const skillsIndex = next.sectionOrder.indexOf('skills')
  check('MOVE_SECTION_ORDER reorders sections relative to each other', skillsIndex < aboutIndex)
  const noop = cvFormReducer(state, {
    type: FORM_ACTION.MOVE_SECTION_ORDER,
    fromSection: 'skills',
    toSection: 'skills',
  })
  check('MOVE_SECTION_ORDER is a no-op when source equals target', noop === state)
}

{
  const state = createInitialCvData()
  const next = cvFormReducer(state, {
    type: FORM_ACTION.UPDATE_ARRAY_ITEM,
    section: 'experience',
    index: 0,
    field: 'company',
    value: 'Acme',
  })
  check('UPDATE_ARRAY_ITEM edits only the named field of the named item', next.experience[0].company === 'Acme')
  const badSection = cvFormReducer(state, {
    type: FORM_ACTION.UPDATE_ARRAY_ITEM,
    section: 'notASection',
    index: 0,
    field: 'x',
    value: 'y',
  })
  check('UPDATE_ARRAY_ITEM is a no-op for a non-array section', badSection === state)
}

{
  const state = createInitialCvData()
  const next = cvFormReducer(state, { type: FORM_ACTION.ADD_ARRAY_ITEM, section: 'experience' })
  check('ADD_ARRAY_ITEM appends a blank item via the section factory', next.experience.length === state.experience.length + 1)
}

{
  const state = {
    ...createInitialCvData(),
    experience: [{ role: 'A' }, { role: 'B' }, { role: 'C' }],
  }
  const next = cvFormReducer(state, { type: FORM_ACTION.REMOVE_ARRAY_ITEM, section: 'experience', index: 1 })
  check(
    'REMOVE_ARRAY_ITEM drops the named index and keeps the rest in order',
    next.experience.map((e) => e.role).join(',') === 'A,C',
  )
}

{
  const state = { ...createInitialCvData(), experience: [{ role: 'A' }, { role: 'B' }] }
  const next = cvFormReducer(state, { type: FORM_ACTION.DUPLICATE_ARRAY_ITEM, section: 'experience', index: 0 })
  check('DUPLICATE_ARRAY_ITEM inserts a deep copy right after the source', next.experience.length === 3 && next.experience[1].role === 'A')
  next.experience[1].role = 'mutated'
  check('DUPLICATE_ARRAY_ITEM copy is independent of the original', next.experience[0].role === 'A')
}

{
  const state = { ...createInitialCvData(), experience: [{ role: 'A' }, { role: 'B' }, { role: 'C' }] }
  const next = cvFormReducer(state, { type: FORM_ACTION.MOVE_ARRAY_ITEM, section: 'experience', index: 2, direction: -1 })
  check(
    'MOVE_ARRAY_ITEM moves the item by one position',
    next.experience.map((e) => e.role).join(',') === 'A,C,B',
  )
  const outOfBounds = cvFormReducer(state, { type: FORM_ACTION.MOVE_ARRAY_ITEM, section: 'experience', index: 0, direction: -1 })
  check('MOVE_ARRAY_ITEM refuses to move past the start of the list', outOfBounds === state)
}

{
  const state = { ...createInitialCvData(), experience: [{ role: 'A' }, { role: 'B' }, { role: 'C' }] }
  const next = cvFormReducer(state, {
    type: FORM_ACTION.MOVE_ARRAY_ITEM_TO_INDEX,
    section: 'experience',
    fromIndex: 0,
    toIndex: 2,
  })
  check(
    'MOVE_ARRAY_ITEM_TO_INDEX moves the item to an arbitrary position',
    next.experience.map((e) => e.role).join(',') === 'B,C,A',
  )
  const clamped = cvFormReducer(state, {
    type: FORM_ACTION.MOVE_ARRAY_ITEM_TO_INDEX,
    section: 'experience',
    fromIndex: 0,
    toIndex: 99,
  })
  check(
    'MOVE_ARRAY_ITEM_TO_INDEX clamps an out-of-range target to the last index',
    clamped.experience.map((e) => e.role).join(',') === 'B,C,A',
  )
}

{
  const state = createInitialCvData()
  const replacement = { ...createInitialCvData(), fullName: 'Replaced' }
  const next = cvFormReducer(state, { type: FORM_ACTION.SET_FORM_DATA, formData: replacement })
  check('SET_FORM_DATA replaces the whole state', next === replacement)
}

{
  const state = { ...createInitialCvData(), fullName: 'Someone' }
  const next = cvFormReducer(state, { type: FORM_ACTION.RESET_FORM })
  check('RESET_FORM returns a fresh initial CV', next.fullName === '' && next !== state)
}

{
  const state = { ...createInitialCvData(), fullName: 'Original', skills: ['Figma'] }
  const next = cvFormReducer(state, {
    type: FORM_ACTION.MERGE_FORM_DATA,
    partialData: { fullName: 'Imported', skills: ['figma', 'Research'] },
  })
  check('MERGE_FORM_DATA overwrites scalar fields present in the partial data', next.fullName === 'Imported')
  check(
    'MERGE_FORM_DATA merges skills without duplicating an existing one case-insensitively',
    next.skills.join(',') === 'Figma,Research',
  )
  const untouched = cvFormReducer(state, { type: FORM_ACTION.MERGE_FORM_DATA, partialData: {} })
  check('MERGE_FORM_DATA leaves fields absent from the partial data untouched', untouched.fullName === 'Original')
}

{
  const state = createInitialCvData()
  const next = cvFormReducer(state, { type: 'NOT_A_REAL_ACTION' })
  check('An unknown action type returns the same state reference', next === state)
}

// ---------------------------------------------------------------------------
// uiReducer
// ---------------------------------------------------------------------------

console.log('\nuiReducer\n')

{
  const state = createInitialUiState({})
  check('createInitialUiState defaults to English without a stored locale', state.locale === 'en')
  check('createInitialUiState starts with no toasts', state.toasts.length === 0)
  const withToast = createInitialUiState({ initialToast: { id: 't1', message: 'hi' } })
  check('createInitialUiState seeds an initial toast when given one', withToast.toasts.length === 1)
  check('createInitialUiState defaults session restore to off', state.sessionRestoreEnabled === false)
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.ADD_TOAST, toast: { id: '1', message: 'Saved' } })
  check('ADD_TOAST appends to the toast list', next.toasts.length === 1)
  const removed = uiReducer(next, { type: UI_ACTION.REMOVE_TOAST, toastId: '1' })
  check('REMOVE_TOAST removes only the named toast', removed.toasts.length === 0)
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.SET_ACTIVE_EXPORT, value: 'pdf' })
  check('SET_ACTIVE_EXPORT stores the export kind', next.activeExport === 'pdf')
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.SET_IMPORTING, value: true })
  check('SET_IMPORTING flips the importing flag', next.isImporting === true)
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.TOGGLE_ATS_MODE })
  check('TOGGLE_ATS_MODE flips ATS mode on', next.atsFriendlyMode === true)
  const backAgain = uiReducer(next, { type: UI_ACTION.TOGGLE_ATS_MODE })
  check('TOGGLE_ATS_MODE is reversible', backAgain.atsFriendlyMode === false)
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.TOGGLE_MOBILE_PREVIEW })
  check('TOGGLE_MOBILE_PREVIEW flips the mobile preview flag', next.mobilePreviewVisible === true)
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.SET_SELECTED_TEMPLATE, templateId: 'modern' })
  check('SET_SELECTED_TEMPLATE stores the chosen template id', next.selectedTemplate === 'modern')
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.SET_LOCALE, locale: 'fi' })
  check('SET_LOCALE stores the chosen locale', next.locale === 'fi')
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.SET_PASTED_CV_TEXT, value: 'pasted text' })
  check('SET_PASTED_CV_TEXT stores the pasted text', next.pastedCvText === 'pasted text')
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.SET_JOB_DESCRIPTION, value: 'job text' })
  check('SET_JOB_DESCRIPTION stores the job description', next.jobDescription === 'job text')
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.SET_COVER_LETTER_COMPANY, value: 'Acme Inc' })
  check('SET_COVER_LETTER_COMPANY stores the company name', next.coverLetterCompany === 'Acme Inc')
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.SET_COVER_LETTER_ROLE, value: 'Product Designer' })
  check('SET_COVER_LETTER_ROLE stores the target role', next.coverLetterRole === 'Product Designer')
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.SET_COVER_LETTER_HIRING_MANAGER, value: 'Jane Doe' })
  check('SET_COVER_LETTER_HIRING_MANAGER stores the hiring manager name', next.coverLetterHiringManager === 'Jane Doe')
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.SET_COVER_LETTER_BODY, value: 'Dear Hiring Manager,' })
  check('SET_COVER_LETTER_BODY stores the letter draft', next.coverLetterBody === 'Dear Hiring Manager,')
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: UI_ACTION.TOGGLE_SESSION_RESTORE })
  check('TOGGLE_SESSION_RESTORE flips session restore on', next.sessionRestoreEnabled === true)
  const backAgain = uiReducer(next, { type: UI_ACTION.TOGGLE_SESSION_RESTORE })
  check('TOGGLE_SESSION_RESTORE is reversible', backAgain.sessionRestoreEnabled === false)
}

{
  const state = createInitialUiState({})
  check(
    'createInitialUiState seeds templateAccentColors for accent-capable templates',
    typeof state.templateAccentColors === 'object'
      && typeof state.templateAccentColors.timeline === 'string'
      && typeof state.templateAccentColors.modernOrange === 'string',
  )
  const nextAccent = uiReducer(state, {
    type: UI_ACTION.SET_TEMPLATE_ACCENT_COLOR,
    templateId: 'timeline',
    color: '#2563eb',
  })
  check(
    'SET_TEMPLATE_ACCENT_COLOR updates only the named template',
    nextAccent.templateAccentColors.timeline === '#2563eb'
      && nextAccent.templateAccentColors.modernOrange === state.templateAccentColors.modernOrange,
  )
}

{
  const state = createInitialUiState({})
  check('createInitialUiState defaults the CV font', typeof state.cvFontId === 'string' && state.cvFontId.length > 0)
  const next = uiReducer(state, { type: UI_ACTION.SET_CV_FONT, fontId: 'georgia' })
  check('SET_CV_FONT stores the chosen font id', next.cvFontId === 'georgia')
}

{
  const state = createInitialUiState({})
  check('createInitialUiState defaults the CV heading color to "template default"', state.cvHeadingColor === '')
  const next = uiReducer(state, { type: UI_ACTION.SET_CV_HEADING_COLOR, color: '#1e3a8a' })
  check('SET_CV_HEADING_COLOR stores the chosen hex color', next.cvHeadingColor === '#1e3a8a')
  const reset = uiReducer(next, { type: UI_ACTION.SET_CV_HEADING_COLOR, color: '' })
  check('SET_CV_HEADING_COLOR can reset back to "template default"', reset.cvHeadingColor === '')
}

{
  const state = createInitialUiState({})
  check('createInitialUiState defaults the nav rail to expanded', state.navRailCollapsed === false)
  const next = uiReducer(state, { type: UI_ACTION.TOGGLE_NAV_RAIL_COLLAPSED })
  check('TOGGLE_NAV_RAIL_COLLAPSED collapses the nav rail', next.navRailCollapsed === true)
  const backAgain = uiReducer(next, { type: UI_ACTION.TOGGLE_NAV_RAIL_COLLAPSED })
  check('TOGGLE_NAV_RAIL_COLLAPSED is reversible', backAgain.navRailCollapsed === false)
}

{
  const state = createInitialUiState({})
  check('createInitialUiState defaults the classic name alignment to centre', state.classicNameAlignment === 'center')
  const left = uiReducer(state, { type: UI_ACTION.SET_CLASSIC_NAME_ALIGNMENT, alignment: 'left' })
  check('SET_CLASSIC_NAME_ALIGNMENT switches to left', left.classicNameAlignment === 'left')
  const backCentre = uiReducer(left, { type: UI_ACTION.SET_CLASSIC_NAME_ALIGNMENT, alignment: 'center' })
  check('SET_CLASSIC_NAME_ALIGNMENT switches back to centre', backCentre.classicNameAlignment === 'center')
  const garbage = uiReducer(left, { type: UI_ACTION.SET_CLASSIC_NAME_ALIGNMENT, alignment: 'diagonal' })
  check('SET_CLASSIC_NAME_ALIGNMENT falls back to centre for an unknown value', garbage.classicNameAlignment === 'center')
}

{
  const state = createInitialUiState({})
  check('createInitialUiState defaults the builder mode to direct', state.builderMode === 'direct')
  const direct = uiReducer(state, { type: UI_ACTION.SET_BUILDER_MODE, mode: 'direct' })
  check('SET_BUILDER_MODE switches to direct', direct.builderMode === 'direct')
  const backClassic = uiReducer(direct, { type: UI_ACTION.SET_BUILDER_MODE, mode: 'classic' })
  check('SET_BUILDER_MODE switches back to classic', backClassic.builderMode === 'classic')
  const garbage = uiReducer(direct, { type: UI_ACTION.SET_BUILDER_MODE, mode: 'sideways' })
  check('SET_BUILDER_MODE falls back to classic for an unknown value', garbage.builderMode === 'classic')
}

{
  const state = createInitialUiState({})
  const next = uiReducer(state, { type: 'NOT_A_REAL_ACTION' })
  check('An unknown action type returns the same state reference', next === state)
}

{
  const state = createInitialUiState({})
  const look = { id: 'sage', accent: '#1f7a6c', fontId: 'lato', headingColor: '#166534', palette: {}, label: { en: 'Sage', fi: 'Salvia' } }
  const next = uiReducer(state, { type: UI_ACTION.APPLY_STYLE_VARIANT_LOOK, templateId: 'creative', variant: look })
  check('APPLY_STYLE_VARIANT_LOOK sets the template accent', next.templateAccentColors.creative === '#1f7a6c')
  check('APPLY_STYLE_VARIANT_LOOK leaves other accents alone', next.templateAccentColors.timeline === state.templateAccentColors.timeline)
  check('APPLY_STYLE_VARIANT_LOOK sets the font and headings colour', next.cvFontId === 'lato' && next.cvHeadingColor === '#166534')

  const accentless = uiReducer(state, {
    type: UI_ACTION.APPLY_STYLE_VARIANT_LOOK, templateId: 'developer', variant: { ...look, accent: null },
  })
  check('an accent-less variant adds no accent entry', !('developer' in accentless.templateAccentColors))
  check('APPLY_STYLE_VARIANT_LOOK with no variant is a no-op',
    uiReducer(state, { type: UI_ACTION.APPLY_STYLE_VARIANT_LOOK, templateId: 'creative', variant: null }) === state)

  const fresh = createInitialUiState({ formData: createInitialCvData() })
  check('a session without stored variants starts on Inter with no headings colour',
    fresh.cvFontId === 'inter' && fresh.cvHeadingColor === '')
  check('an unknown stored variant starts on variant #1',
    createInitialUiState({ formData: { ...createInitialCvData(), styleVariantByTemplate: { minimal: 'fromTheFuture' } } }).cvFontId === 'inter')
}

{
  const { getTemplateVariants } = await importSrc('utils/templateVariants.js')
  const stored = getTemplateVariants('minimal')[1]
  const restored = createInitialUiState({ formData: { ...createInitialCvData(), styleVariantByTemplate: { minimal: stored.id } } })
  check('a restored CV opens in its stored variant\'s font', restored.cvFontId === stored.fontId)
}

console.log(`\n${failures === 0 ? 'All reducer checks passed.' : `${failures} check(s) failed.`}`)
process.exit(failures === 0 ? 0 : 1)
