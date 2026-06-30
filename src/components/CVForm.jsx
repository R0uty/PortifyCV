import { useEffect, useRef, useState } from 'react'

import PanelSection from './PanelSection'
import { getUiTheme } from '../utils/designSystem'
import {
  createSectionVisibility,
  createSectionItemVisibility,
  isPhotoVisibleForTemplate,
  getLinkFields,
  getSectionVisibilityFields,
} from '../utils/cvForm'

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

function AutoGrowTextarea({
  className,
  value,
  onChange,
  placeholder,
  minHeight = 112,
}) {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!textareaRef.current) {
      return
    }

    textareaRef.current.style.height = '0px'
    textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, minHeight)}px`
  }, [minHeight, value])

  return (
    <textarea
      ref={textareaRef}
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
    />
  )
}

function Field({
  label,
  error,
  required = false,
  children,
  labelClassName = 'text-gray-300',
}) {
  return (
    <label className="block">
      <span className={`text-sm font-medium ${labelClassName}`}>
        {label}
        {required ? <span className="ml-1 text-gray-500">*</span> : null}
      </span>
      {children}
      {error ? <p className="mt-2 text-xs text-gray-500">{error}</p> : null}
    </label>
  )
}

function InlineTipList({
  items = [],
  theme = 'dark',
  locale = 'en',
  actionLabel = '',
  onAction = null,
}) {
  const ui = getUiTheme(theme)
  const isFinnish = locale === 'fi'

  if (items.length === 0) {
    return null
  }

  return (
    <div className="mt-3 space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`rounded-2xl border px-4 py-3 ${
            item.type === 'warning'
              ? ui.isDark
                ? 'border-gray-400/20 bg-gray-400/10 text-gray-100'
                : 'border-gray-300 bg-gray-50 text-gray-800'
              : `${ui.surfaceMuted} ${ui.textSecondary}`
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-sm/6 opacity-90">{item.message}</p>
            </div>
            {item.action && onAction ? (
              <button
                type="button"
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
                onClick={onAction}
              >
                {actionLabel || (isFinnish ? 'Paranna tekstiä' : 'Improve text')}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function EntryBadge({ count = 0, theme = 'dark', locale = 'en' }) {
  const ui = getUiTheme(theme)
  const isFinnish = locale === 'fi'

  if (count === 0) {
    return null
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        ui.isDark ? 'bg-gray-400/15 text-gray-100' : 'bg-gray-100 text-gray-700'
      }`}
    >
      {isFinnish
        ? `${count} vinkkiä`
        : `${count} tip${count === 1 ? '' : 's'}`}
    </span>
  )
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
  const photoInputRef = useRef(null)
  const ui = getUiTheme(theme)
  const isFinnish = locale === 'fi'
  const sectionVisibilityFields = getSectionVisibilityFields(locale)
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
  const inputClasses = `mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-ring)] ${ui.input}`
  const textareaClasses = `${inputClasses} resize-none overflow-hidden`
  const actionButtonClasses = `rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`
  const removeButtonClasses = `rounded-full border px-3 py-2 text-xs font-medium transition ${ui.buttonDanger}`
  const utilityButtonClasses = `rounded-full border px-3 py-2 text-xs font-medium transition ${ui.button}`
  const improveButtonClasses = `rounded-full border px-3 py-2 text-xs font-semibold transition ${ui.button}`
  const tagClasses = `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
    ui.isDark
      ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
      : 'bg-[var(--accent-soft)] text-[var(--accent-text-strong)]'
  }`
  const fieldLabelClassName = ui.textSoft
  const itemCardClasses = `rounded-[1.4rem] border p-4 ${ui.surfaceMuted}`
  const itemHeadingClasses = ui.textPrimary
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
    on: isFinnish ? 'Päällä' : 'On',
    off: isFinnish ? 'Pois' : 'Off',
  }

  const updateRootField = (field, value) => {
    dispatchFormData({ type: 'SET_ROOT_FIELD', field, value })
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
    dispatchFormData({ type: 'SET_LINK_FIELD', field, value })
  }

  const toggleSectionVisibility = (section) => {
    dispatchFormData({ type: 'TOGGLE_SECTION_VISIBILITY', section })
  }

  const toggleSectionItemVisibility = (section, itemKey) => {
    dispatchFormData({ type: 'TOGGLE_SECTION_ITEM_VISIBILITY', section, itemKey })
  }

  const togglePhotoVisibilityForSelectedTemplate = () => {
    if (!selectedTemplate) {
      return
    }

    dispatchFormData({ type: 'TOGGLE_PHOTO_VISIBILITY', template: selectedTemplate })
  }

  const addSkill = (value) => {
    if (!value.trim()) {
      return
    }

    dispatchFormData({ type: 'ADD_SKILL', skill: value })
    setSkillInput('')
  }

  const removeSkill = (index) => {
    dispatchFormData({ type: 'REMOVE_SKILL', index })
  }

  const duplicateSkill = (index) => {
    dispatchFormData({ type: 'DUPLICATE_SKILL', index })
  }

  const moveSkill = (index, direction) => {
    dispatchFormData({ type: 'MOVE_SKILL', index, direction })
  }

  const updateArrayItem = (section, index, field, value) => {
    dispatchFormData({ type: 'UPDATE_ARRAY_ITEM', section, index, field, value })
  }

  const addArrayItem = (section) => {
    dispatchFormData({ type: 'ADD_ARRAY_ITEM', section })
  }

  const removeArrayItem = (section, index) => {
    dispatchFormData({ type: 'REMOVE_ARRAY_ITEM', section, index })
  }

  const duplicateArrayItem = (section, index) => {
    dispatchFormData({ type: 'DUPLICATE_ARRAY_ITEM', section, index })
  }

  const moveArrayItem = (section, index, direction) => {
    dispatchFormData({ type: 'MOVE_ARRAY_ITEM', section, index, direction })
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
        <div className="flex flex-wrap gap-2">
          {sectionVisibilityFields.map((field) => {
            const isVisible = sectionVisibility[field.key]

            return (
              <button
                key={field.key}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isVisible ? ui.buttonActive : ui.button
                }`}
                onClick={() => toggleSectionVisibility(field.key)}
              >
                {field.label}: {isVisible ? copy.on : copy.off}
              </button>
            )
          })}
          <button
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
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
              className={`mt-2 rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`}
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
                  className={`rounded-2xl border ${ui.isDark ? 'border-gray-700' : 'border-gray-300'}`}
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
            <div className={`mt-2 rounded-xl border px-3 py-3 ${ui.inputShell}`}>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span key={`${skill}-${index}`} className={tagClasses}>
                    {skill}
                    <button
                      type="button"
                      className="rounded-full border px-2 py-0.5 text-[10px] font-semibold text-current/80 transition hover:text-current"
                      onClick={() => toggleSectionItemVisibility('skills', index)}
                      aria-label={`${isSectionItemVisible(sectionItemVisibility, 'skills', index) ? copy.hide : copy.show} ${skill}`}
                    >
                      {isSectionItemVisible(sectionItemVisibility, 'skills', index) ? copy.hide : copy.show}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border px-2 py-0.5 text-[10px] font-semibold text-current/80 transition hover:text-current"
                      onClick={() => moveSkill(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${skill} ${copy.up.toLowerCase()}`}
                    >
                      {copy.up}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border px-2 py-0.5 text-[10px] font-semibold text-current/80 transition hover:text-current"
                      onClick={() => moveSkill(index, 1)}
                      disabled={index === formData.skills.length - 1}
                      aria-label={`Move ${skill} ${copy.down.toLowerCase()}`}
                    >
                      {copy.down}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border px-2 py-0.5 text-[10px] font-semibold text-current/80 transition hover:text-current"
                      onClick={() => duplicateSkill(index)}
                      aria-label={`${copy.duplicate} ${skill}`}
                    >
                      {copy.duplicateShort}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border px-2 py-0.5 text-[10px] font-semibold text-current/80 transition hover:text-current"
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
                      : 'text-gray-900 placeholder:text-gray-400'
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
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'experience', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('experience', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('experience', index, 1)}
                    disabled={index === formData.experience.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => duplicateArrayItem('experience', index)}
                  >
                    {copy.duplicate}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('experience', index)}
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
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'education', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('education', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('education', index, 1)}
                    disabled={index === formData.education.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => duplicateArrayItem('education', index)}
                  >
                    {copy.duplicate}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('education', index)}
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
                    className="rounded-full border px-2 py-0.5 text-[10px] font-semibold transition"
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
