import { useRef, useState } from 'react'

import AutoGrowTextarea from './AutoGrowTextarea'
import EntryBadge from './EntryBadge'
import Field from './Field'
import InlineTipList from './InlineTipList'
import PanelSection from './PanelSection'
import { getUiTheme } from '../utils/designSystem'
import { getCvTemplate } from '../utils/cvTemplates'
import {
  createSectionVisibility,
  createSectionItemVisibility,
  normalizeSectionOrder,
  isPhotoVisibleForTemplate,
  getLinkFields,
  getSectionVisibilityFields,
} from '../utils/cvForm'
import { FORM_ACTION } from '../reducers/cvFormReducer'

const MAX_PROFILE_PHOTO_SIZE_BYTES = 2 * 1024 * 1024
const MAX_PROFILE_PHOTO_EDGE_PX = 480
const MAX_PROFILE_PHOTO_DATA_URL_LENGTH = 450_000

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read the selected image file.'))
    reader.readAsDataURL(file)
  })
}

function loadImageElement(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not process the selected image file.'))
    image.src = dataUrl
  })
}

async function buildProfilePhotoDataUrl(file) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Select a valid image file.')
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE_BYTES) {
    throw new Error('Image must be 2MB or smaller.')
  }

  const sourceDataUrl = await readFileAsDataUrl(file)
  const sourceImage = await loadImageElement(sourceDataUrl)
  const maxSide = Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight, 1)
  const scale = Math.min(1, MAX_PROFILE_PHOTO_EDGE_PX / maxSide)
  const width = Math.max(1, Math.round(sourceImage.naturalWidth * scale))
  const height = Math.max(1, Math.round(sourceImage.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Could not process the selected image file.')
  }

  canvas.width = width
  canvas.height = height
  context.drawImage(sourceImage, 0, 0, width, height)

  const normalizedDataUrl = canvas.toDataURL('image/jpeg', 0.86)

  if (normalizedDataUrl.length > MAX_PROFILE_PHOTO_DATA_URL_LENGTH) {
    throw new Error('Image is too large after processing. Try a smaller image.')
  }

  return normalizedDataUrl
}

function localizePhotoErrorMessage(message, locale = 'en') {
  if (locale !== 'fi') {
    return message
  }

  const map = {
    'Could not read the selected image file.': 'Valittua kuvatiedostoa ei voitu lukea.',
    'Could not process the selected image file.': 'Valittua kuvatiedostoa ei voitu käsitellä.',
    'Select a valid image file.': 'Valitse kelvollinen kuvatiedosto.',
    'Image must be 2MB or smaller.': 'Kuvan on oltava enintään 2 Mt.',
    'Image is too large after processing. Try a smaller image.': 'Kuva on käsittelyn jälkeen liian suuri. Kokeile pienempää kuvaa.',
  }

  return map[message] ?? message
}

function isSectionItemVisible(sectionItemVisibility, section, itemKey) {
  return sectionItemVisibility?.[section]?.[String(itemKey)] !== false
}

function CVForm({
  formData,
  dispatchFormData,
  errors,
  theme = 'dark',
  locale = 'en',
  feedback,
  onImproveAboutText,
  onImproveExperienceText,
  onPhotoError,
  selectedTemplate = '',
  selectedTemplateLabel = 'Current template',
}) {
  const [skillInput, setSkillInput] = useState('')
  const [draggedSectionKey, setDraggedSectionKey] = useState('')
  const photoInputRef = useRef(null)
  const ui = getUiTheme(theme)
  const isFinnish = locale === 'fi'
  const sectionVisibilityFields = getSectionVisibilityFields(locale)
  const templateConfig = getCvTemplate(selectedTemplate, locale)
  const templateSectionOrder = [
    ...templateConfig.primarySections,
    ...templateConfig.secondarySections,
  ]
  const sectionOrderKeys = normalizeSectionOrder(
    formData.sectionOrder,
    templateSectionOrder,
  )
  const sectionFieldByKey = Object.fromEntries(
    sectionVisibilityFields.map((field) => [field.key, field]),
  )
  const orderedSectionFields = sectionOrderKeys
    .map((sectionKey) => sectionFieldByKey[sectionKey])
    .filter(Boolean)
  const linkFields = getLinkFields(locale)
  const sectionVisibility = {
    ...createSectionVisibility(),
    ...(formData.sectionVisibility ?? {}),
  }
  const sectionItemVisibility = {
    ...createSectionItemVisibility(),
    ...(formData.sectionItemVisibility ?? {}),
  }
  const isPhotoVisibleInSelectedTemplate = isPhotoVisibleForTemplate(
    formData.photoVisibilityByTemplate,
    selectedTemplate,
  )
  const inputClasses = `mt-2 w-full border px-4 py-3 text-sm transition ${ui.input}`
  const textareaClasses = `${inputClasses} resize-none overflow-hidden`
  const actionButtonClasses = `border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`
  const removeButtonClasses = `border px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.buttonDanger}`
  const utilityButtonClasses = `border px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`
  const improveButtonClasses = `border px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`
  const sectionDragHandleClasses = `inline-flex cursor-grab select-none items-center gap-2 border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] ${ui.button}`
  const sectionDragDotClasses = `h-1 w-1 ${ui.isDark ? 'bg-gray-300' : 'bg-gray-500'}`
  const tagClasses = `inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold ${
    ui.isDark
      ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
      : 'bg-[var(--accent-soft)] text-[var(--accent-text-strong)]'
  }`
  const fieldLabelClassName = `${ui.textSoft} uppercase tracking-[0.06em] text-xs font-semibold`
  const itemCardClasses = `border p-4 ${ui.surfaceMuted}`
  const itemHeadingClasses = `${ui.textPrimary} uppercase tracking-[0.04em] text-xs font-bold`
  const helperTextClasses = ui.textMuted
  const copy = {
    improveText: isFinnish ? 'Paranna tekstiä' : 'Improve text',
    hide: isFinnish ? 'Piilota' : 'Hide',
    show: isFinnish ? 'Näytä' : 'Show',
    up: isFinnish ? 'Ylös' : 'Up',
    down: isFinnish ? 'Alas' : 'Down',
    duplicate: isFinnish ? 'Monista' : 'Duplicate',
    duplicateShort: isFinnish ? 'Kopioi' : 'Dup',
    remove: isFinnish ? 'Poista' : 'Remove',
    move: isFinnish ? 'Siirrä' : 'Move',
    drag: isFinnish ? 'Raahaa' : 'Drag',
    on: isFinnish ? 'Päällä' : 'On',
    off: isFinnish ? 'Pois' : 'Off',
  }

  const updateRootField = (field, value) => {
    dispatchFormData({ type: FORM_ACTION.SET_ROOT_FIELD, field, value })
  }

  const handlePhotoUpload = async (event) => {
    const [file] = event.target.files ?? []
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      const photoDataUrl = await buildProfilePhotoDataUrl(file)
      updateRootField('photo', photoDataUrl)
    } catch (error) {
      if (onPhotoError) {
        onPhotoError(
          error instanceof Error
            ? localizePhotoErrorMessage(error.message, locale)
            : isFinnish ? 'Profiilikuvan lataus epäonnistui.' : 'Could not upload profile image.',
        )
      }
    }
  }

  const updateLinkField = (field, value) => {
    dispatchFormData({ type: FORM_ACTION.SET_LINK_FIELD, field, value })
  }

  const toggleSectionVisibility = (section) => {
    dispatchFormData({ type: FORM_ACTION.TOGGLE_SECTION_VISIBILITY, section })
  }

  const toggleSectionItemVisibility = (section, itemKey) => {
    dispatchFormData({ type: FORM_ACTION.TOGGLE_SECTION_ITEM_VISIBILITY, section, itemKey })
  }

  const togglePhotoVisibilityForSelectedTemplate = () => {
    if (!selectedTemplate) {
      return
    }

    dispatchFormData({ type: FORM_ACTION.TOGGLE_PHOTO_VISIBILITY, template: selectedTemplate })
  }

  const addSkill = (value) => {
    if (!value.trim()) {
      return
    }

    dispatchFormData({ type: FORM_ACTION.ADD_SKILL, skill: value })
    setSkillInput('')
  }

  const removeSkill = (index) => {
    dispatchFormData({ type: FORM_ACTION.REMOVE_SKILL, index })
  }

  const duplicateSkill = (index) => {
    dispatchFormData({ type: FORM_ACTION.DUPLICATE_SKILL, index })
  }

  const moveSkill = (index, direction) => {
    dispatchFormData({ type: FORM_ACTION.MOVE_SKILL, index, direction })
  }

  const updateArrayItem = (section, index, field, value) => {
    dispatchFormData({ type: FORM_ACTION.UPDATE_ARRAY_ITEM, section, index, field, value })
  }

  const addArrayItem = (section) => {
    dispatchFormData({ type: FORM_ACTION.ADD_ARRAY_ITEM, section })
  }

  const removeArrayItem = (section, index) => {
    dispatchFormData({ type: FORM_ACTION.REMOVE_ARRAY_ITEM, section, index })
  }

  const duplicateArrayItem = (section, index) => {
    dispatchFormData({ type: FORM_ACTION.DUPLICATE_ARRAY_ITEM, section, index })
  }

  const moveArrayItem = (section, index, direction) => {
    dispatchFormData({ type: FORM_ACTION.MOVE_ARRAY_ITEM, section, index, direction })
  }

  const moveSectionOrder = (fromSection, toSection) => {
    dispatchFormData({
      type: FORM_ACTION.MOVE_SECTION_ORDER,
      fromSection,
      toSection,
      fallbackOrder: sectionOrderKeys,
    })
  }

  const moveSectionByDirection = (section, direction) => {
    const sectionIndex = sectionOrderKeys.indexOf(section)
    const targetSection = sectionOrderKeys[sectionIndex + direction]

    if (!targetSection) {
      return
    }

    moveSectionOrder(section, targetSection)
  }

  const handleSectionDragStart = (section) => {
    setDraggedSectionKey(section)
  }

  const handleSectionDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleSectionDrop = (event, section) => {
    event.preventDefault()

    if (!draggedSectionKey || draggedSectionKey === section) {
      return
    }

    moveSectionOrder(draggedSectionKey, section)
    setDraggedSectionKey('')
  }

  const handleSectionDragEnd = () => {
    setDraggedSectionKey('')
  }

  const handleSkillKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addSkill(skillInput)
    }

    if (event.key === 'Backspace' && !skillInput && formData.skills.length > 0) {
      removeSkill(formData.skills.length - 1)
    }
  }

  return (
    <form className="mt-8 space-y-4 sm:space-y-5">
      <PanelSection
        eyebrow="Section 00"
        title={isFinnish ? 'Näkyvät osiot' : 'Visible sections'}
        description={
          isFinnish
            ? 'Kytke osioita tai yksittäisiä kohtia pois ilman tietojen poistamista.'
            : 'Toggle whole sections or specific section items without deleting your data.'
        }
        theme={theme}
      >
        <div className="space-y-3">
          <p className={`text-xs ${helperTextClasses}`}>
            {isFinnish
              ? 'Raahaa osioita muuttaaksesi niiden järjestystä.'
              : 'Drag sections to change their order.'}
          </p>
          <div className="space-y-2">
            {orderedSectionFields.map((field, index) => {
              const isVisible = sectionVisibility[field.key]

              return (
                <div
                  key={field.key}
                  draggable
                  onDragStart={() => handleSectionDragStart(field.key)}
                  onDragOver={handleSectionDragOver}
                  onDrop={(event) => handleSectionDrop(event, field.key)}
                  onDragEnd={handleSectionDragEnd}
                  className={`flex cursor-grab items-center justify-between gap-3 border px-3 py-2 transition ${
                    draggedSectionKey === field.key ? 'border-[var(--accent-border)] opacity-70' : ''
                  } ${ui.surfaceMuted}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={sectionDragHandleClasses} aria-hidden="true">
                      <span className="grid grid-cols-2 gap-0.5">
                        <span className={sectionDragDotClasses} />
                        <span className={sectionDragDotClasses} />
                        <span className={sectionDragDotClasses} />
                        <span className={sectionDragDotClasses} />
                        <span className={sectionDragDotClasses} />
                        <span className={sectionDragDotClasses} />
                      </span>
                      <span>{copy.drag}</span>
                    </div>
                    <button
                      type="button"
                      className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${
                        isVisible ? ui.buttonActive : ui.button
                      }`}
                      onClick={() => toggleSectionVisibility(field.key)}
                    >
                      {field.label}: {isVisible ? copy.on : copy.off}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className={utilityButtonClasses}
                      onClick={() => moveSectionByDirection(field.key, -1)}
                      disabled={index === 0}
                      aria-label={`${copy.move} ${field.label} ${copy.up.toLowerCase()}`}
                    >
                      {copy.up}
                    </button>
                    <button
                      type="button"
                      className={utilityButtonClasses}
                      onClick={() => moveSectionByDirection(field.key, 1)}
                      disabled={index === orderedSectionFields.length - 1}
                      aria-label={`${copy.move} ${field.label} ${copy.down.toLowerCase()}`}
                    >
                      {copy.down}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <button
            type="button"
            className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${
              isPhotoVisibleInSelectedTemplate ? ui.buttonActive : ui.button
            }`}
            onClick={togglePhotoVisibilityForSelectedTemplate}
            disabled={!selectedTemplate}
          >
            {isFinnish ? 'Kuva' : 'Photo'} ({selectedTemplateLabel}): {isPhotoVisibleInSelectedTemplate ? copy.on : copy.off}
          </button>
        </div>
      </PanelSection>

      <PanelSection
        eyebrow="Section 01"
        title={isFinnish ? 'Profiili' : 'Profile'}
        description={
          isFinnish
            ? 'Lisää CV:n yläosassa näkyvät perustiedot.'
            : 'Add the core information that appears at the top of the CV.'
        }
        theme={theme}
        badge={feedback.sectionBadges.profile}
      >
        <div className="space-y-4">
          <Field
            label={isFinnish ? 'Koko nimi' : 'Full name'}
            error={errors.fullName}
            required
            labelClassName={fieldLabelClassName}
          >
            <input
              className={inputClasses}
              type="text"
              value={formData.fullName}
              onChange={(event) => updateRootField('fullName', event.target.value)}
              placeholder={isFinnish ? 'Matti Meikäläinen' : 'Alex Morgan'}
              aria-invalid={Boolean(errors.fullName)}
            />
          </Field>

          <Field
            label={isFinnish ? 'Ammattinimike' : 'Professional title'}
            error={errors.title}
            required
            labelClassName={fieldLabelClassName}
          >
            <input
              className={inputClasses}
              type="text"
              value={formData.title}
              onChange={(event) => updateRootField('title', event.target.value)}
              placeholder={isFinnish ? 'Tuotesuunnittelija' : 'Product Designer'}
              aria-invalid={Boolean(errors.title)}
            />
          </Field>

          <Field label={isFinnish ? 'Esittely' : 'About'} labelClassName={fieldLabelClassName}>
            <AutoGrowTextarea
              className={textareaClasses}
              value={formData.about}
              onChange={(event) => updateRootField('about', event.target.value)}
              placeholder={isFinnish
                ? 'Tiivistä kokemuksesi, vahvuutesi ja tavoittelemasi roolit.'
                : 'Summarize your experience, strengths, and the kind of roles you want.'}
            />
          </Field>
          <Field label={isFinnish ? 'Profiilikuva (valinnainen)' : 'Profile image (optional)'} labelClassName={fieldLabelClassName}>
            <input
              ref={photoInputRef}
              className="hidden"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handlePhotoUpload}
            />
            <button
              type="button"
              className={`mt-2 border px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`}
              onClick={() => photoInputRef.current?.click()}
            >
              {isFinnish ? 'Valitse kuva' : 'Choose image'}
            </button>
            <p className={`mt-2 text-xs ${helperTextClasses}`}>
              {isFinnish
                ? 'JPG tai PNG, enintään 2 Mt. Kuva skaalataan vientiä varten.'
                : 'JPG or PNG, up to 2MB. Image is resized for exports.'}
            </p>
            {formData.photo ? (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={formData.photo}
                  alt={isFinnish ? 'Profiilin esikatselu' : 'Profile preview'}
                  className={`border ${ui.isDark ? 'border-gray-700' : 'border-gray-300'}`}
                  style={{ width: '5.75rem', height: '5.75rem', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className={removeButtonClasses}
                  onClick={() => updateRootField('photo', '')}
                >
                  {isFinnish ? 'Poista kuva' : 'Remove image'}
                </button>
              </div>
            ) : null}
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={improveButtonClasses}
              onClick={onImproveAboutText}
            >
              {copy.improveText}
            </button>
            <p className={`text-xs ${helperTextClasses}`}>
              {isFinnish
                ? 'Sääntöpohjainen siivous lyhentää pitkää tekstiä ja pitää yhteenvedon fokusoituna.'
                : 'Rule-based cleanup shortens long copy and keeps the summary focused.'}
            </p>
          </div>
          <InlineTipList
            items={feedback.inlineTips.profile}
            theme={theme}
            locale={locale}
            actionLabel={copy.improveText}
            onAction={onImproveAboutText}
          />
        </div>
      </PanelSection>

      <PanelSection
        eyebrow="Section 02"
        title={isFinnish ? 'Taidot' : 'Skills'}
        description={isFinnish ? 'Paina Enter tai pilkku muuttaaksesi taidon tagiksi.' : 'Press Enter or comma to turn each skill into a tag.'}
        theme={theme}
        badge={feedback.sectionBadges.skills}
      >
        <div className="space-y-3">
          <Field label={isFinnish ? 'Taitotagit' : 'Skill tags'} labelClassName={fieldLabelClassName}>
            <div className={`mt-2 border px-3 py-3 ${ui.inputShell}`}>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span key={`${skill}-${index}`} className={tagClasses}>
                    {skill}
                    <button
                      type="button"
                      className="border px-2 py-0.5 text-[10px] font-bold text-current/80 transition hover:text-current"
                      onClick={() => toggleSectionItemVisibility('skills', index)}
                      aria-label={`${isSectionItemVisible(sectionItemVisibility, 'skills', index) ? copy.hide : copy.show} ${skill}`}
                    >
                      {isSectionItemVisible(sectionItemVisibility, 'skills', index) ? copy.hide : copy.show}
                    </button>
                    <button
                      type="button"
                      className="border px-2 py-0.5 text-[10px] font-bold text-current/80 transition hover:text-current"
                      onClick={() => moveSkill(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${skill} ${copy.up.toLowerCase()}`}
                    >
                      {copy.up}
                    </button>
                    <button
                      type="button"
                      className="border px-2 py-0.5 text-[10px] font-bold text-current/80 transition hover:text-current"
                      onClick={() => moveSkill(index, 1)}
                      disabled={index === formData.skills.length - 1}
                      aria-label={`Move ${skill} ${copy.down.toLowerCase()}`}
                    >
                      {copy.down}
                    </button>
                    <button
                      type="button"
                      className="border px-2 py-0.5 text-[10px] font-bold text-current/80 transition hover:text-current"
                      onClick={() => duplicateSkill(index)}
                      aria-label={`${copy.duplicate} ${skill}`}
                    >
                      {copy.duplicateShort}
                    </button>
                    <button
                      type="button"
                      className="border px-2 py-0.5 text-[10px] font-bold text-current/80 transition hover:text-current"
                      onClick={() => removeSkill(index)}
                      aria-label={`${copy.remove} ${skill}`}
                    >
                      X
                    </button>
                  </span>
                ))}
                <input
                  className={`min-w-[140px] flex-1 border-0 bg-transparent py-1 text-sm outline-none ${
                    ui.isDark
                      ? 'text-white placeholder:text-gray-500'
                      : 'text-black placeholder:text-gray-400'
                  }`}
                  type="text"
                  value={skillInput}
                  onChange={(event) => setSkillInput(event.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={() => addSkill(skillInput)}
                  placeholder={isFinnish ? 'Lisää taito' : 'Add a skill'}
                />
              </div>
            </div>
          </Field>
          <p className={`text-xs ${helperTextClasses}`}>
            {isFinnish
              ? 'Vinkki: Backspace poistaa viimeisen tagin, kun kenttä on tyhjä.'
              : 'Tip: Backspace removes the last tag when the input is empty.'}
          </p>
          <InlineTipList items={feedback.inlineTips.skills} theme={theme} locale={locale} />
        </div>
      </PanelSection>

      <PanelSection
        eyebrow="Section 03"
        title={isFinnish ? 'Kokemus' : 'Experience'}
        description={
          isFinnish
            ? 'Kuvaa roolit, ajanjaksot ja vastuut jokaisesta työkokemuksesta.'
            : 'Capture roles, timelines, and responsibilities for each work experience.'
        }
        theme={theme}
        badge={feedback.sectionBadges.experience}
      >
        <div className="space-y-4">
          <InlineTipList items={feedback.inlineTips.experience} theme={theme} locale={locale} />
          {formData.experience.map((item, index) => (
            <div key={`experience-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                    {isFinnish ? 'Kokemus' : 'Experience'} #{index + 1}
                  </p>
                  <EntryBadge
                    count={feedback.inlineTips.experienceItems[index]?.length ?? 0}
                    theme={theme}
                    locale={locale}
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('experience', index)}
                    aria-label={`${isSectionItemVisible(sectionItemVisibility, 'experience', index) ? copy.hide : copy.show} ${isFinnish ? 'kokemus' : 'experience'} ${index + 1}`}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'experience', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('experience', index, -1)}
                    disabled={index === 0}
                    aria-label={`${copy.move} ${isFinnish ? 'kokemus' : 'experience'} ${index + 1} ${copy.up.toLowerCase()}`}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('experience', index, 1)}
                    disabled={index === formData.experience.length - 1}
                    aria-label={`${copy.move} ${isFinnish ? 'kokemus' : 'experience'} ${index + 1} ${copy.down.toLowerCase()}`}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => duplicateArrayItem('experience', index)}
                    aria-label={`${copy.duplicate} ${isFinnish ? 'kokemus' : 'experience'} ${index + 1}`}
                  >
                    {copy.duplicate}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('experience', index)}
                    aria-label={`${copy.remove} ${isFinnish ? 'kokemus' : 'experience'} ${index + 1}`}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={isFinnish ? 'Rooli' : 'Role'} labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.role}
                    onChange={(event) =>
                      updateArrayItem('experience', index, 'role', event.target.value)
                    }
                    placeholder={isFinnish ? 'Senior Product Designer' : 'Senior Product Designer'}
                  />
                </Field>
                <Field label={isFinnish ? 'Yritys' : 'Company'} labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.company}
                    onChange={(event) =>
                      updateArrayItem('experience', index, 'company', event.target.value)
                    }
                    placeholder={isFinnish ? 'Studio North' : 'Studio North'}
                  />
                </Field>
                <Field label={isFinnish ? 'Aloituspäivä' : 'Start date'} labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.startDate}
                    onChange={(event) =>
                      updateArrayItem('experience', index, 'startDate', event.target.value)
                    }
                    placeholder={isFinnish ? 'Tammi 2022' : 'Jan 2022'}
                  />
                </Field>
                <Field label={isFinnish ? 'Lopetuspäivä' : 'End date'} labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.endDate}
                    onChange={(event) =>
                      updateArrayItem('experience', index, 'endDate', event.target.value)
                    }
                    placeholder={isFinnish ? 'Nykyinen' : 'Present'}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label={isFinnish ? 'Kuvaus' : 'Description'} labelClassName={fieldLabelClassName}>
                    <AutoGrowTextarea
                      className={textareaClasses}
                      value={item.description}
                      onChange={(event) =>
                        updateArrayItem(
                          'experience',
                          index,
                          'description',
                          event.target.value,
                        )
                      }
                      placeholder={isFinnish
                        ? 'Kuvaa työ, saavutukset ja vaikutus.'
                        : 'Describe the work, achievements, and impact.'}
                    />
                  </Field>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className={improveButtonClasses}
                  onClick={() => onImproveExperienceText(index)}
                >
                  {copy.improveText}
                </button>
                <p className={`text-xs ${helperTextClasses}`}>
                  {isFinnish
                    ? 'Pidä jokainen kohta lyhyenä, toimintakeskeisenä ja helposti silmäiltävänä.'
                    : 'Keep each entry short, action-oriented, and easy to scan.'}
                </p>
              </div>
              <InlineTipList
                items={feedback.inlineTips.experienceItems[index]}
                theme={theme}
                locale={locale}
                actionLabel={copy.improveText}
                onAction={() => onImproveExperienceText(index)}
              />
            </div>
          ))}
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('experience')}
          >
            {isFinnish ? 'Lisää kokemus' : 'Add experience'}
          </button>
        </div>
      </PanelSection>

      <PanelSection
        eyebrow="Section 04"
        title={isFinnish ? 'Koulutus' : 'Education'}
        description={
          isFinnish
            ? 'Lisää tutkinto, oppilaitos ja ajanjakso koulutustaustastasi.'
            : 'Include degrees, institutions, and timelines for your academic background.'
        }
        theme={theme}
      >
        <div className="space-y-4">
          {formData.education.map((item, index) => (
            <div key={`education-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  {isFinnish ? 'Koulutus' : 'Education'} #{index + 1}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('education', index)}
                    aria-label={`${isSectionItemVisible(sectionItemVisibility, 'education', index) ? copy.hide : copy.show} ${isFinnish ? 'koulutus' : 'education'} ${index + 1}`}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'education', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('education', index, -1)}
                    disabled={index === 0}
                    aria-label={`${copy.move} ${isFinnish ? 'koulutus' : 'education'} ${index + 1} ${copy.up.toLowerCase()}`}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('education', index, 1)}
                    disabled={index === formData.education.length - 1}
                    aria-label={`${copy.move} ${isFinnish ? 'koulutus' : 'education'} ${index + 1} ${copy.down.toLowerCase()}`}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => duplicateArrayItem('education', index)}
                    aria-label={`${copy.duplicate} ${isFinnish ? 'koulutus' : 'education'} ${index + 1}`}
                  >
                    {copy.duplicate}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('education', index)}
                    aria-label={`${copy.remove} ${isFinnish ? 'koulutus' : 'education'} ${index + 1}`}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={isFinnish ? 'Oppilaitos' : 'School'} labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.school}
                    onChange={(event) =>
                      updateArrayItem('education', index, 'school', event.target.value)
                    }
                    placeholder={isFinnish ? 'Taideyliopisto' : 'University of the Arts'}
                  />
                </Field>
                <Field label={isFinnish ? 'Tutkinto' : 'Degree'} labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.degree}
                    onChange={(event) =>
                      updateArrayItem('education', index, 'degree', event.target.value)
                    }
                    placeholder={isFinnish ? 'BA Graafinen suunnittelu' : 'B.A. Graphic Design'}
                  />
                </Field>
                <Field label={isFinnish ? 'Aloituspäivä' : 'Start date'} labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.startDate}
                    onChange={(event) =>
                      updateArrayItem('education', index, 'startDate', event.target.value)
                    }
                    placeholder="2016"
                  />
                </Field>
                <Field label={isFinnish ? 'Lopetuspäivä' : 'End date'} labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.endDate}
                    onChange={(event) =>
                      updateArrayItem('education', index, 'endDate', event.target.value)
                    }
                    placeholder="2020"
                  />
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('education')}
          >
            {isFinnish ? 'Lisää koulutus' : 'Add education'}
          </button>
        </div>
      </PanelSection>

      <PanelSection
        eyebrow="Section 05"
        title={isFinnish ? 'Linkit' : 'Links'}
        description={
          isFinnish
            ? 'Lisää alustat ja portfolio-linkit, jotka tukevat CV:täsi.'
            : 'Add the platforms and portfolio links that support your CV.'
        }
        theme={theme}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {linkFields.map(({ key, label, placeholder }) => (
            <Field
              key={key}
              label={
                <span className="inline-flex items-center gap-2">
                  <span>{label}</span>
                  <button
                    type="button"
                    className="border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] transition"
                    onClick={() => toggleSectionItemVisibility('links', key)}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'links', key) ? copy.hide : copy.show}
                  </button>
                </span>
              }
              labelClassName={fieldLabelClassName}
            >
              <input
                className={inputClasses}
                type="url"
                value={formData.links[key]}
                onChange={(event) => updateLinkField(key, event.target.value)}
                placeholder={placeholder}
              />
            </Field>
          ))}
        </div>
      </PanelSection>
    </form>
  )
}

export default CVForm
