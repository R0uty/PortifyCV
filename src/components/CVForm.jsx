import { useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

import AutoGrowTextarea from './AutoGrowTextarea'
import EntryBadge from './EntryBadge'
import InlineTipList from './InlineTipList'
import { getBulletHints } from '../utils/cvFeedback'
import PanelSection from './PanelSection'
import SortableItemCard from './SortableItemCard'
import DragDropUpload from './fields/DragDropUpload'
import FloatingField from './fields/FloatingField'
import ReorderableListInput from './fields/ReorderableListInput'
import TagsInput from './fields/TagsInput'
import ToggleSwitch from './fields/ToggleSwitch'
import { getUiTheme } from '../utils/designSystem'
import { getEffectiveCvTemplate } from '../utils/sectionColumns'
import {
  createSectionVisibility,
  createSectionItemVisibility,
  normalizeSectionOrder,
  isPhotoVisibleForTemplate,
  getLinkFields,
  getSectionVisibilityFields,
  PRIMARY_LINK_KEYS,
  EMPLOYMENT_TYPE_OPTIONS,
} from '../utils/cvForm'
import { FORM_ACTION } from '../reducers/cvFormReducer'
import { buildProfilePhotoDataUrl, localizePhotoErrorMessage } from '../utils/profilePhoto'
import { useCvTextProps } from './cvLanguageContext'
import { form } from '../i18n/form'
import { normalizeLocale } from '../i18n/index.js'

function isSectionItemVisible(sectionItemVisibility, section, itemKey) {
  return sectionItemVisibility?.[section]?.[String(itemKey)] !== false
}

function SectionEmptyState({ title, body, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <Sparkles size={18} strokeWidth={2} aria-hidden="true" />
      </span>
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__body">{body}</p>
      {actionLabel ? (
        <button type="button" className="empty-state__action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

function CVForm({
  formData,
  dispatchFormData,
  errors,
  theme = 'dark',
  locale = 'en',
  feedback,
  onPhotoError,
  selectedTemplate = '',
  selectedTemplateLabel = 'Current template',
  sectionSettingsExpandSignal = 0,
}) {
  // The interests rows are the form's only CV text outside a FloatingField.
  const cvTextProps = useCvTextProps()
  const [draggedSectionKey, setDraggedSectionKey] = useState('')
  const [collapsedItems, setCollapsedItems] = useState(() => new Set())
  // Only surface the "required" message once the user has left the field —
  // a blank form on load shouldn't greet a first-time visitor with two red
  // errors for fields they haven't reached yet.
  const [identityTouched, setIdentityTouched] = useState({ fullName: false, title: false })
  const markIdentityTouched = (field) =>
    setIdentityTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }))
  const [showAllLinks, setShowAllLinks] = useState(false)
  const photoInputRef = useRef(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const ui = getUiTheme(theme)
  const t = (key, vars) => form.t(locale, key, vars)
  const sectionVisibilityFields = getSectionVisibilityFields(locale)
  const templateConfig = getEffectiveCvTemplate(selectedTemplate, locale, formData)
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
  const templateSectionKeySet = new Set(templateSectionOrder)
  const orderedSectionFields = sectionOrderKeys
    .map((sectionKey) => sectionFieldByKey[sectionKey])
    .filter(Boolean)
    .filter((field) => templateSectionKeySet.has(field.key))
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
  const actionButtonClasses = `ui-button ${ui.button}`
  const removeButtonClasses = `ui-button ${ui.buttonDanger}`
  const utilityButtonClasses = `ui-button ${ui.button}`
  const sectionMoveButtonClasses = `section-move-button inline-flex h-7 w-7 items-center justify-center border transition ${ui.button}`
  const sectionDragDotClasses = 'h-1 w-1 bg-gray-500'
  const fieldLabelClassName = `${ui.textSoft} uppercase tracking-[0.06em] text-xs font-semibold`
  const itemCardClasses = `border p-4 ${ui.surfaceMuted}`
  const itemHeadingClasses = `${ui.textPrimary} uppercase tracking-[0.04em] text-xs font-bold`
  const helperTextClasses = ui.textMuted
  const copy = {
    hide: t('common.hide'),
    show: t('common.show'),
    up: t('common.up'),
    down: t('common.down'),
    duplicate: t('common.duplicate'),
    remove: t('common.remove'),
    drag: t('common.drag'),
    on: t('common.on'),
    off: t('common.off'),
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
            : t('common.photoUploadFailed'),
        )
      }
    }
  }

  const handleProjectImageUpload = async (index, file) => {
    try {
      const imageDataUrl = await buildProfilePhotoDataUrl(file)
      updateArrayItem('projects', index, 'image', imageDataUrl)
    } catch (error) {
      if (onPhotoError) {
        onPhotoError(
          error instanceof Error
            ? localizePhotoErrorMessage(error.message, locale)
            : t('common.imageUploadFailed'),
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

  const updateArrayItem = (section, index, field, value) => {
    dispatchFormData({ type: FORM_ACTION.UPDATE_ARRAY_ITEM, section, index, field, value })
  }

  // Collapsed cards are tracked as "<section>:<index>". Every structural change
  // to a list has to remap those indexes, otherwise the collapsed state stays
  // behind on a position and silently transfers to a different entry.
  const remapCollapsedItems = (section, mapIndex) => {
    setCollapsedItems((previous) => {
      const next = new Set()

      previous.forEach((itemKey) => {
        const separatorIndex = itemKey.lastIndexOf(':')
        const itemSection = itemKey.slice(0, separatorIndex)

        if (itemSection !== section) {
          next.add(itemKey)
          return
        }

        const nextIndex = mapIndex(Number(itemKey.slice(separatorIndex + 1)))

        if (nextIndex !== null) {
          next.add(`${section}:${nextIndex}`)
        }
      })

      return next
    })
  }

  const addArrayItem = (section) => {
    dispatchFormData({ type: FORM_ACTION.ADD_ARRAY_ITEM, section })
  }

  const removeArrayItem = (section, index) => {
    dispatchFormData({ type: FORM_ACTION.REMOVE_ARRAY_ITEM, section, index })
    remapCollapsedItems(section, (itemIndex) => {
      if (itemIndex === index) {
        return null
      }

      return itemIndex > index ? itemIndex - 1 : itemIndex
    })
  }

  const duplicateArrayItem = (section, index) => {
    dispatchFormData({ type: FORM_ACTION.DUPLICATE_ARRAY_ITEM, section, index })
    remapCollapsedItems(section, (itemIndex) => (itemIndex > index ? itemIndex + 1 : itemIndex))
  }

  const moveArrayItem = (section, index, direction) => {
    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= (formData[section]?.length ?? 0)) {
      return
    }

    dispatchFormData({ type: FORM_ACTION.MOVE_ARRAY_ITEM, section, index, direction })
    remapCollapsedItems(section, (itemIndex) => {
      if (itemIndex === index) {
        return targetIndex
      }

      return itemIndex === targetIndex ? index : itemIndex
    })
  }

  const moveArrayItemToIndex = (section, fromIndex, toIndex) => {
    const itemCount = formData[section]?.length ?? 0

    if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= itemCount || toIndex < 0 || toIndex >= itemCount) {
      return
    }

    dispatchFormData({ type: FORM_ACTION.MOVE_ARRAY_ITEM_TO_INDEX, section, fromIndex, toIndex })
    remapCollapsedItems(section, (itemIndex) => {
      if (itemIndex === fromIndex) {
        return toIndex
      }

      if (fromIndex < toIndex && itemIndex > fromIndex && itemIndex <= toIndex) {
        return itemIndex - 1
      }

      if (fromIndex > toIndex && itemIndex >= toIndex && itemIndex < fromIndex) {
        return itemIndex + 1
      }

      return itemIndex
    })
  }

  const makeArrayDragEndHandler = (section) => (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const fromIndex = Number(String(active.id).split(':').pop())
    const toIndex = Number(String(over.id).split(':').pop())

    if (Number.isInteger(fromIndex) && Number.isInteger(toIndex)) {
      moveArrayItemToIndex(section, fromIndex, toIndex)
    }
  }

  const toggleItemCollapsed = (itemKey) => {
    setCollapsedItems((previous) => {
      const next = new Set(previous)

      if (next.has(itemKey)) {
        next.delete(itemKey)
      } else {
        next.add(itemKey)
      }

      return next
    })
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

  const visibleSectionCount = orderedSectionFields.filter((field) => sectionVisibility[field.key]).length

  return (
    <form className="mt-8 space-y-4 sm:space-y-5">
      <PanelSection
        id="section-settings"
        title={t('settings.heading')}
        badge={{ label: t('settings.visibleCount', { visible: visibleSectionCount, total: orderedSectionFields.length }) }}
        defaultCollapsed
        expandSignal={sectionSettingsExpandSignal}
        description={t('settings.intro')}
        theme={theme}
      >
        <div className="space-y-3">
          <p className={`text-xs ${helperTextClasses}`}>
            {t('settings.dragHint')}
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
                  className={`flex items-center justify-between gap-3 border px-3 py-2 transition ${
                    draggedSectionKey === field.key ? 'border-[var(--accent-border)] opacity-70' : ''
                  } ${ui.surfaceMuted}`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`grid shrink-0 cursor-grab grid-cols-2 gap-0.5 ${ui.textMuted}`}
                      title={copy.drag}
                      aria-hidden="true"
                    >
                      <span className={sectionDragDotClasses} />
                      <span className={sectionDragDotClasses} />
                      <span className={sectionDragDotClasses} />
                      <span className={sectionDragDotClasses} />
                      <span className={sectionDragDotClasses} />
                      <span className={sectionDragDotClasses} />
                    </span>
                    <span className={`truncate text-sm font-semibold ${ui.textPrimary}`}>{field.label}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      className={sectionMoveButtonClasses}
                      onClick={() => moveSectionByDirection(field.key, -1)}
                      disabled={index === 0}
                      aria-label={t('settings.moveUp', { section: field.label })}
                    >
                      <ChevronUp size={15} strokeWidth={2.5} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={sectionMoveButtonClasses}
                      onClick={() => moveSectionByDirection(field.key, 1)}
                      disabled={index === orderedSectionFields.length - 1}
                      aria-label={t('settings.moveDown', { section: field.label })}
                    >
                      <ChevronDown size={15} strokeWidth={2.5} aria-hidden="true" />
                    </button>
                    <ToggleSwitch
                      checked={isVisible}
                      onChange={() => toggleSectionVisibility(field.key)}
                      ariaLabel={`${field.label}: ${isVisible ? copy.on : copy.off}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className={`flex items-center justify-between gap-3 border px-3 py-2 ${ui.surfaceMuted}`}>
            <span className={`truncate text-sm font-semibold ${ui.textPrimary}`}>
              {t('settings.photoForTemplate', { template: selectedTemplateLabel })}
            </span>
            <ToggleSwitch
              checked={isPhotoVisibleInSelectedTemplate}
              onChange={togglePhotoVisibilityForSelectedTemplate}
              disabled={!selectedTemplate}
              ariaLabel={`${t('settings.photo')}: ${isPhotoVisibleInSelectedTemplate ? copy.on : copy.off}`}
            />
          </div>
        </div>
      </PanelSection>

      <PanelSection
        id="section-personal"
        title={t('personal.heading')}
        description={t('personal.intro')}
        theme={theme}
        badge={feedback.sectionBadges.profile}
      >
        <div className="space-y-4">
          <FloatingField
            label={t('personal.fullName')}
            error={identityTouched.fullName ? errors.fullName : ''}
            required
          >
            <input
              type="text"
              autoComplete="name"
              spellCheck={false}
              value={formData.fullName}
              onChange={(event) => updateRootField('fullName', event.target.value)}
              onBlur={() => markIdentityTouched('fullName')}
              aria-invalid={identityTouched.fullName && Boolean(errors.fullName)}
            />
          </FloatingField>

          <FloatingField
            label={t('personal.professionalTitle')}
            error={identityTouched.title ? errors.title : ''}
            required
          >
            <input
              type="text"
              value={formData.title}
              onChange={(event) => updateRootField('title', event.target.value)}
              onBlur={() => markIdentityTouched('title')}
              aria-invalid={identityTouched.title && Boolean(errors.title)}
            />
          </FloatingField>

          <FloatingField label={t('personal.tagline')}>
            <input
              type="text"
              value={formData.tagline}
              onChange={(event) => updateRootField('tagline', event.target.value)}
            />
          </FloatingField>

          <div className="grid gap-4 sm:grid-cols-3">
            <FloatingField label={t('personal.email')}>
              <input
                type="email"
                autoComplete="email"
                spellCheck={false}
                value={formData.email}
                onChange={(event) => updateRootField('email', event.target.value)}
              />
            </FloatingField>
            <FloatingField label={t('personal.phone')}>
              <input
                type="tel"
                autoComplete="tel"
                spellCheck={false}
                value={formData.phone}
                onChange={(event) => updateRootField('phone', event.target.value)}
              />
            </FloatingField>
            <FloatingField label={t('personal.location')}>
              <input
                type="text"
                autoComplete="address-level2"
                value={formData.location}
                onChange={(event) => updateRootField('location', event.target.value)}
              />
            </FloatingField>
          </div>
          <div id="section-summary">
            <FloatingField label={t('summary.about')}>
              <AutoGrowTextarea
                value={formData.about}
                onChange={(event) => updateRootField('about', event.target.value)}
              />
            </FloatingField>
          </div>
          {/* Deliberately not a <FloatingField>: that renders a <label>, and a
              label wrapping the hidden file input turns every click on the
              hint text or the preview image into a file-picker dialog. */}
          <div className="block">
            <span className={`text-xs font-semibold uppercase tracking-[0.06em] ${fieldLabelClassName}`}>
              {t('summary.profileImage')}
            </span>
            <input
              ref={photoInputRef}
              className="hidden"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              aria-label={t('summary.profileImage')}
              onChange={handlePhotoUpload}
            />
            <button
              type="button"
              className={`mt-2 ui-button ${ui.button}`}
              onClick={() => photoInputRef.current?.click()}
            >
              {t('common.chooseImage')}
            </button>
            <p className={`mt-2 text-xs ${helperTextClasses}`}>
              {t('summary.imageHint')}
            </p>
            {formData.photo ? (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={formData.photo}
                  alt={t('common.profilePreview')}
                  className="border border-gray-300"
                  style={{ width: '5.75rem', height: '5.75rem', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className={removeButtonClasses}
                  onClick={() => updateRootField('photo', '')}
                >
                  {t('common.removeImage')}
                </button>
              </div>
            ) : null}
          </div>
          <InlineTipList
            items={feedback.inlineTips.profile}
            theme={theme}
            locale={locale}
          />
        </div>
      </PanelSection>

      {templateSectionKeySet.has('skills') ? (
      <PanelSection
        id="section-skills"
        title={t('skills.heading')}
        description={t('skills.intro')}
        theme={theme}
        badge={feedback.sectionBadges.skills}
      >
        <div className="space-y-3">
          <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.06em] ${fieldLabelClassName}`}>
            {t('skills.skillTags')}
          </p>
          <TagsInput
            value={formData.skills}
            onChange={(nextSkills) =>
              dispatchFormData({ type: FORM_ACTION.SET_ROOT_FIELD, field: 'skills', value: nextSkills })
            }
            ariaLabel={t('skills.skillTags')}
            locale={locale}
          />
          <p className={`text-xs ${helperTextClasses}`}>
            {t('skills.backspaceTip')}
          </p>
          <InlineTipList items={feedback.inlineTips.skills} theme={theme} locale={locale} />
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('experience') ? (
      <PanelSection
        id="section-experience"
        title={t('experience.heading')}
        description={t('experience.intro')}
        theme={theme}
        badge={feedback.sectionBadges.experience}
      >
        <div className="space-y-4">
          <InlineTipList items={feedback.inlineTips.experience} theme={theme} locale={locale} />
          {formData.experience.length === 0 ? (
            <SectionEmptyState
              title={t('experience.emptyTitle')}
              body={t('experience.emptyBody')}
              actionLabel={t('experience.addExperience')}
              onAction={() => addArrayItem('experience')}
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={makeArrayDragEndHandler('experience')}
            >
              <SortableContext
                items={formData.experience.map((_, index) => `experience:${index}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {formData.experience.map((item, index) => {
                    const itemKey = `experience:${index}`

                    return (
                      <SortableItemCard
                        key={itemKey}
                        id={itemKey}
                        title={`${t('experience.heading')} #${index + 1}${item.role ? ` — ${item.role}` : ''}`}
                        badge={(
                          <EntryBadge
                            count={feedback.inlineTips.experienceItems[index]?.length ?? 0}
                            theme={theme}
                            locale={locale}
                          />
                        )}
                        isCollapsed={collapsedItems.has(itemKey)}
                        onToggleCollapse={() => toggleItemCollapsed(itemKey)}
                        isHidden={!isSectionItemVisible(sectionItemVisibility, 'experience', index)}
                        onToggleVisibility={() => toggleSectionItemVisibility('experience', index)}
                        onDuplicate={() => duplicateArrayItem('experience', index)}
                        onRemove={() => removeArrayItem('experience', index)}
                        canRemove={formData.experience.length > 1}
                        hideLabel={copy.hide}
                        showLabel={copy.show}
                        duplicateLabel={copy.duplicate}
                        removeLabel={copy.remove}
                        dragLabel={copy.drag}
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FloatingField label={t('experience.role')}>
                            <input
                              type="text"
                              value={item.role}
                              onChange={(event) =>
                                updateArrayItem('experience', index, 'role', event.target.value)
                              }
                            />
                          </FloatingField>
                          <FloatingField label={t('experience.company')}>
                            <input
                              type="text"
                              spellCheck={false}
                              value={item.company}
                              onChange={(event) =>
                                updateArrayItem('experience', index, 'company', event.target.value)
                              }
                            />
                          </FloatingField>
                          <FloatingField label={t('experience.location')}>
                            <input
                              type="text"
                              value={item.location}
                              onChange={(event) =>
                                updateArrayItem('experience', index, 'location', event.target.value)
                              }
                            />
                          </FloatingField>
                          <FloatingField label={t('experience.employmentType')} alwaysFloat>
                            <select
                              value={item.employmentType}
                              onChange={(event) =>
                                updateArrayItem('experience', index, 'employmentType', event.target.value)
                              }
                            >
                              <option value="">{t('experience.select')}</option>
                              {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </FloatingField>
                          <FloatingField label={t('experience.startDate')}>
                            <input
                              type="text"
                              spellCheck={false}
                              value={item.startDate}
                              placeholder={t('experience.startDatePlaceholder')}
                              onChange={(event) =>
                                updateArrayItem('experience', index, 'startDate', event.target.value)
                              }
                            />
                          </FloatingField>
                          <FloatingField label={t('experience.endDate')}>
                            <input
                              type="text"
                              spellCheck={false}
                              value={item.isCurrent ? '' : item.endDate}
                              disabled={item.isCurrent}
                              placeholder={
                                item.isCurrent
                                  ? t('experience.present')
                                  : (t('experience.endDatePlaceholder'))
                              }
                              onChange={(event) =>
                                updateArrayItem('experience', index, 'endDate', event.target.value)
                              }
                            />
                          </FloatingField>
                        </div>
                        <div className="mt-4">
                          <ToggleSwitch
                            checked={item.isCurrent}
                            label={t('experience.isCurrent')}
                            onChange={(checked) => {
                              updateArrayItem('experience', index, 'isCurrent', checked)
                              if (checked) {
                                updateArrayItem('experience', index, 'endDate', '')
                              }
                            }}
                          />
                        </div>
                        <div className="mt-4">
                          <FloatingField label={t('experience.description')}>
                            <AutoGrowTextarea
                              value={item.description}
                              minHeight={160}
                              onChange={(event) =>
                                updateArrayItem('experience', index, 'description', event.target.value)
                              }
                            />
                          </FloatingField>
                        </div>
                        <div className="mt-4">
                          <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.06em] ${fieldLabelClassName}`}>
                            {t('experience.achievements')}
                          </p>
                          <ReorderableListInput
                            items={item.achievements}
                            onChange={(next) => updateArrayItem('experience', index, 'achievements', next)}
                            placeholder={t('experience.achievementPlaceholder')}
                            addLabel={t('experience.addAchievement')}
                            itemAriaLabel={t('experience.achievement')}
                            locale={normalizeLocale(locale)}
                            hints={getBulletHints(item.achievements, { locale: normalizeLocale(locale) })}
                            ideas={{ roleText: item.role || formData.title }}
                          />
                        </div>
                        <div className="mt-4">
                          <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.06em] ${fieldLabelClassName}`}>
                            {t('experience.technologies')}
                          </p>
                          <TagsInput
                            spellCheck={false}
                            value={item.technologies}
                            onChange={(next) => updateArrayItem('experience', index, 'technologies', next)}
                            placeholder={t('experience.technologyPlaceholder')}
                            ariaLabel={t('experience.technologies')}
                            locale={locale}
                          />
                        </div>
                        <div className="mt-4">
                          <p className={`text-xs ${helperTextClasses}`}>
                            {t('experience.achievementsHint')}
                          </p>
                        </div>
                        <InlineTipList
                          items={feedback.inlineTips.experienceItems[index]}
                          theme={theme}
                          locale={locale}
                        />
                      </SortableItemCard>
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('experience')}
          >
            {t('experience.addExperience')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('education') ? (
      <PanelSection
        id="section-education"
        title={t('education.heading')}
        description={t('education.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          {formData.education.length === 0 ? (
            <SectionEmptyState
              title={t('education.emptyTitle')}
              body={t('education.emptyBody')}
              actionLabel={t('education.addEducation')}
              onAction={() => addArrayItem('education')}
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={makeArrayDragEndHandler('education')}
            >
              <SortableContext
                items={formData.education.map((_, index) => `education:${index}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {formData.education.map((item, index) => {
                    const itemKey = `education:${index}`

                    return (
                      <SortableItemCard
                        key={itemKey}
                        id={itemKey}
                        title={`${t('education.heading')} #${index + 1}${item.school ? ` — ${item.school}` : ''}`}
                        isCollapsed={collapsedItems.has(itemKey)}
                        onToggleCollapse={() => toggleItemCollapsed(itemKey)}
                        isHidden={!isSectionItemVisible(sectionItemVisibility, 'education', index)}
                        onToggleVisibility={() => toggleSectionItemVisibility('education', index)}
                        onDuplicate={() => duplicateArrayItem('education', index)}
                        onRemove={() => removeArrayItem('education', index)}
                        canRemove={formData.education.length > 1}
                        hideLabel={copy.hide}
                        showLabel={copy.show}
                        duplicateLabel={copy.duplicate}
                        removeLabel={copy.remove}
                        dragLabel={copy.drag}
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FloatingField label={t('education.school')}>
                            <input
                              type="text"
                              spellCheck={false}
                              value={item.school}
                              onChange={(event) =>
                                updateArrayItem('education', index, 'school', event.target.value)
                              }
                            />
                          </FloatingField>
                          <FloatingField label={t('education.degree')}>
                            <input
                              type="text"
                              value={item.degree}
                              onChange={(event) =>
                                updateArrayItem('education', index, 'degree', event.target.value)
                              }
                            />
                          </FloatingField>
                          <FloatingField label={t('education.location')}>
                            <input
                              type="text"
                              value={item.location}
                              onChange={(event) =>
                                updateArrayItem('education', index, 'location', event.target.value)
                              }
                            />
                          </FloatingField>
                          <FloatingField label={t('education.grade')}>
                            <input
                              type="text"
                              spellCheck={false}
                              value={item.grade}
                              onChange={(event) =>
                                updateArrayItem('education', index, 'grade', event.target.value)
                              }
                            />
                          </FloatingField>
                          <FloatingField label={t('education.startDate')}>
                            <input
                              type="text"
                              spellCheck={false}
                              value={item.startDate}
                              placeholder={t('education.startDatePlaceholder')}
                              onChange={(event) =>
                                updateArrayItem('education', index, 'startDate', event.target.value)
                              }
                            />
                          </FloatingField>
                          <FloatingField label={t('education.endDate')}>
                            <input
                              type="text"
                              spellCheck={false}
                              value={item.endDate}
                              placeholder={t('education.endDatePlaceholder')}
                              onChange={(event) =>
                                updateArrayItem('education', index, 'endDate', event.target.value)
                              }
                            />
                          </FloatingField>
                          <div className="sm:col-span-2">
                            <FloatingField label={t('education.honors')}>
                              <input
                                type="text"
                                value={item.honors}
                                onChange={(event) =>
                                  updateArrayItem('education', index, 'honors', event.target.value)
                                }
                              />
                            </FloatingField>
                          </div>
                          <div className="sm:col-span-2">
                            <FloatingField label={t('education.coursework')}>
                              <input
                                type="text"
                                value={item.coursework}
                                onChange={(event) =>
                                  updateArrayItem('education', index, 'coursework', event.target.value)
                                }
                              />
                            </FloatingField>
                          </div>
                        </div>
                      </SortableItemCard>
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('education')}
          >
            {t('education.addEducation')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('coreStrengths') ? (
      <PanelSection
        id="section-coreStrengths"
        title={t('coreStrengths.heading')}
        description={t('coreStrengths.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.coreStrengths.map((item, index) => (
            <div key={`core-strength-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  {t('coreStrengths.strength')} #{index + 1}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('coreStrengths', index)}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'coreStrengths', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('coreStrengths', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('coreStrengths', index, 1)}
                    disabled={index === formData.coreStrengths.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => duplicateArrayItem('coreStrengths', index)}
                  >
                    {copy.duplicate}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('coreStrengths', index)}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <FloatingField label={t('coreStrengths.title')}>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(event) =>
                      updateArrayItem('coreStrengths', index, 'title', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('coreStrengths.description')}>
                  <AutoGrowTextarea
                    value={item.description}
                    onChange={(event) =>
                      updateArrayItem('coreStrengths', index, 'description', event.target.value)
                    }
                  />
                </FloatingField>
              </div>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('coreStrengths')}
          >
            {t('coreStrengths.addStrength')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('certificates') ? (
      <PanelSection
        id="section-certificates"
        title={t('certificates.heading')}
        description={t('certificates.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          {formData.certificates.length === 0 ? (
            <SectionEmptyState
              title={t('certificates.emptyTitle')}
              body={t('certificates.emptyBody')}
              actionLabel={t('certificates.addCertificate')}
              onAction={() => addArrayItem('certificates')}
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={makeArrayDragEndHandler('certificates')}
            >
              <SortableContext
                items={formData.certificates.map((_, index) => `certificates:${index}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {formData.certificates.map((item, index) => {
                    const itemKey = `certificates:${index}`

                    return (
                      <SortableItemCard
                        key={itemKey}
                        id={itemKey}
                        title={`${t('certificates.certificate')} #${index + 1}${item.name ? ` — ${item.name}` : ''}`}
                        isCollapsed={collapsedItems.has(itemKey)}
                        onToggleCollapse={() => toggleItemCollapsed(itemKey)}
                        isHidden={!isSectionItemVisible(sectionItemVisibility, 'certificates', index)}
                        onToggleVisibility={() => toggleSectionItemVisibility('certificates', index)}
                        onRemove={() => removeArrayItem('certificates', index)}
                        canRemove={formData.certificates.length > 1}
                        hideLabel={copy.hide}
                        showLabel={copy.show}
                        removeLabel={copy.remove}
                        dragLabel={copy.drag}
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <FloatingField label={t('certificates.name')}>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(event) =>
                                  updateArrayItem('certificates', index, 'name', event.target.value)
                                }
                              />
                            </FloatingField>
                          </div>
                          <FloatingField label={t('certificates.issuer')}>
                            <input
                              type="text"
                              spellCheck={false}
                              value={item.issuer}
                              onChange={(event) =>
                                updateArrayItem('certificates', index, 'issuer', event.target.value)
                              }
                            />
                          </FloatingField>
                          <FloatingField label={t('certificates.year')}>
                            <input
                              type="text"
                              spellCheck={false}
                              value={item.year}
                              onChange={(event) =>
                                updateArrayItem('certificates', index, 'year', event.target.value)
                              }
                            />
                          </FloatingField>
                          <FloatingField label={t('certificates.expiry')}>
                            <input
                              type="text"
                              spellCheck={false}
                              value={item.expiry}
                              onChange={(event) =>
                                updateArrayItem('certificates', index, 'expiry', event.target.value)
                              }
                            />
                          </FloatingField>
                          <div className="sm:col-span-2">
                            <FloatingField label={t('certificates.credentialUrl')}>
                              <input
                                type="url"
                                spellCheck={false}
                                value={item.credentialUrl}
                                onChange={(event) =>
                                  updateArrayItem('certificates', index, 'credentialUrl', event.target.value)
                                }
                              />
                            </FloatingField>
                          </div>
                        </div>
                      </SortableItemCard>
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('certificates')}
          >
            {t('certificates.addCertificate')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('projects') ? (
      <PanelSection
        id="section-projects"
        title={t('projects.heading')}
        description={t('projects.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          {formData.projects.length === 0 ? (
            <SectionEmptyState
              title={t('projects.emptyTitle')}
              body={t('projects.emptyBody')}
              actionLabel={t('projects.addProject')}
              onAction={() => addArrayItem('projects')}
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={makeArrayDragEndHandler('projects')}
            >
              <SortableContext
                items={formData.projects.map((_, index) => `projects:${index}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {formData.projects.map((item, index) => {
                    const itemKey = `projects:${index}`

                    return (
                      <SortableItemCard
                        key={itemKey}
                        id={itemKey}
                        title={`${t('projects.project')} #${index + 1}${item.name ? ` — ${item.name}` : ''}`}
                        isCollapsed={collapsedItems.has(itemKey)}
                        onToggleCollapse={() => toggleItemCollapsed(itemKey)}
                        isHidden={!isSectionItemVisible(sectionItemVisibility, 'projects', index)}
                        onToggleVisibility={() => toggleSectionItemVisibility('projects', index)}
                        onDuplicate={() => duplicateArrayItem('projects', index)}
                        onRemove={() => removeArrayItem('projects', index)}
                        canRemove={formData.projects.length > 1}
                        hideLabel={copy.hide}
                        showLabel={copy.show}
                        duplicateLabel={copy.duplicate}
                        removeLabel={copy.remove}
                        dragLabel={copy.drag}
                      >
                        <div className="space-y-4">
                          <div>
                            <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.06em] ${fieldLabelClassName}`}>
                              {t('projects.image')}
                            </p>
                            <DragDropUpload
                              label={t('projects.imageUpload')}
                              hint={t('projects.imageHint')}
                              previewUrl={item.image}
                              onFileSelected={(file) => handleProjectImageUpload(index, file)}
                              onRemove={() => updateArrayItem('projects', index, 'image', '')}
                            />
                          </div>
                          <FloatingField label={t('projects.name')}>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(event) =>
                                updateArrayItem('projects', index, 'name', event.target.value)
                              }
                            />
                          </FloatingField>
                          <FloatingField label={t('projects.description')}>
                            <AutoGrowTextarea
                              value={item.description}
                              onChange={(event) =>
                                updateArrayItem('projects', index, 'description', event.target.value)
                              }
                            />
                          </FloatingField>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FloatingField label={t('projects.stack')}>
                              <input
                                type="text"
                                spellCheck={false}
                                value={item.stack}
                                onChange={(event) =>
                                  updateArrayItem('projects', index, 'stack', event.target.value)
                                }
                              />
                            </FloatingField>
                            <FloatingField label={t('projects.date')}>
                              <input
                                type="text"
                                spellCheck={false}
                                value={item.date}
                                onChange={(event) =>
                                  updateArrayItem('projects', index, 'date', event.target.value)
                                }
                              />
                            </FloatingField>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FloatingField label={t('projects.organization')}>
                              <input
                                type="text"
                                spellCheck={false}
                                value={item.organization}
                                onChange={(event) =>
                                  updateArrayItem('projects', index, 'organization', event.target.value)
                                }
                              />
                            </FloatingField>
                            <FloatingField label={t('projects.impact')}>
                              <input
                                type="text"
                                value={item.impact}
                                onChange={(event) =>
                                  updateArrayItem('projects', index, 'impact', event.target.value)
                                }
                              />
                            </FloatingField>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FloatingField label={t('projects.teamSize')}>
                              <input
                                type="text"
                                spellCheck={false}
                                value={item.teamSize}
                                onChange={(event) =>
                                  updateArrayItem('projects', index, 'teamSize', event.target.value)
                                }
                              />
                            </FloatingField>
                            <FloatingField label={t('projects.contribution')}>
                              <input
                                type="text"
                                value={item.contribution}
                                onChange={(event) =>
                                  updateArrayItem('projects', index, 'contribution', event.target.value)
                                }
                              />
                            </FloatingField>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FloatingField label={t('projects.githubUrl')}>
                              <input
                                type="url"
                                spellCheck={false}
                                value={item.githubUrl}
                                onChange={(event) =>
                                  updateArrayItem('projects', index, 'githubUrl', event.target.value)
                                }
                              />
                            </FloatingField>
                            <FloatingField label={t('projects.demoUrl')}>
                              <input
                                type="url"
                                spellCheck={false}
                                value={item.demoUrl}
                                onChange={(event) =>
                                  updateArrayItem('projects', index, 'demoUrl', event.target.value)
                                }
                              />
                            </FloatingField>
                          </div>
                        </div>
                      </SortableItemCard>
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('projects')}
          >
            {t('projects.addProject')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('languages') ? (
      <PanelSection
        id="section-languages"
        title={t('languages.heading')}
        description={t('languages.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.languages.map((item, index) => (
            <div key={`language-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
              <FloatingField label={t('languages.language')}>
                <input
                  type="text"
                  value={item.language}
                  onChange={(event) =>
                    updateArrayItem('languages', index, 'language', event.target.value)
                  }
                />
              </FloatingField>
              <FloatingField label={t('languages.level')}>
                <input
                  type="text"
                  value={item.level}
                  onChange={(event) =>
                    updateArrayItem('languages', index, 'level', event.target.value)
                  }
                />
              </FloatingField>
              <button
                type="button"
                className={utilityButtonClasses}
                onClick={() => toggleSectionItemVisibility('languages', index)}
              >
                {isSectionItemVisible(sectionItemVisibility, 'languages', index) ? copy.hide : copy.show}
              </button>
              <button
                type="button"
                className={removeButtonClasses}
                onClick={() => removeArrayItem('languages', index)}
              >
                {copy.remove}
              </button>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('languages')}
          >
            {t('languages.addLanguage')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('interests') ? (
      <PanelSection
        id="section-interests"
        title={t('interests.heading')}
        description={t('interests.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.interests.map((item, index) => (
            <div key={`interest-${index}`} className="flex items-center gap-2">
              <input
                {...cvTextProps}
                className={inputClasses.replace('mt-2 ', '')}
                type="text"
                value={item.name}
                onChange={(event) =>
                  updateArrayItem('interests', index, 'name', event.target.value)
                }
                aria-label={`${t('interests.interest')} ${index + 1}`}
                placeholder={t('interests.placeholder')}
              />
              <button
                type="button"
                className={utilityButtonClasses}
                onClick={() => toggleSectionItemVisibility('interests', index)}
              >
                {isSectionItemVisible(sectionItemVisibility, 'interests', index) ? copy.hide : copy.show}
              </button>
              <button
                type="button"
                className={removeButtonClasses}
                onClick={() => removeArrayItem('interests', index)}
              >
                {copy.remove}
              </button>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('interests')}
          >
            {t('interests.addInterest')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('achievements') ? (
      <PanelSection
        id="section-achievements"
        title={t('achievements.heading')}
        description={t('achievements.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.achievements.map((item, index) => (
            <div key={`achievement-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  {t('achievements.achievement')} #{index + 1}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('achievements', index)}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'achievements', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('achievements', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('achievements', index, 1)}
                    disabled={index === formData.achievements.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('achievements', index)}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingField label={t('achievements.title')}>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(event) =>
                      updateArrayItem('achievements', index, 'title', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('achievements.year')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.year}
                    onChange={(event) =>
                      updateArrayItem('achievements', index, 'year', event.target.value)
                    }
                  />
                </FloatingField>
                <div className="sm:col-span-2">
                  <FloatingField label={t('achievements.description')}>
                    <AutoGrowTextarea
                      value={item.description}
                      onChange={(event) =>
                        updateArrayItem('achievements', index, 'description', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
              </div>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('achievements')}
          >
            {t('achievements.addAchievement')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('openSource') ? (
      <PanelSection
        id="section-openSource"
        title={t('openSource.heading')}
        description={t('openSource.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.openSource.map((item, index) => (
            <div key={`open-source-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  {t('openSource.repository')} #{index + 1}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('openSource', index)}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'openSource', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('openSource', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('openSource', index, 1)}
                    disabled={index === formData.openSource.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('openSource', index)}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FloatingField label={t('openSource.repositoryName')}>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(event) =>
                        updateArrayItem('openSource', index, 'name', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
                <div className="sm:col-span-2">
                  <FloatingField label={t('openSource.description')}>
                    <AutoGrowTextarea
                      value={item.description}
                      onChange={(event) =>
                        updateArrayItem('openSource', index, 'description', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
                <FloatingField label={t('openSource.language')}>
                  <input
                    type="text"
                    value={item.language}
                    onChange={(event) =>
                      updateArrayItem('openSource', index, 'language', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('openSource.url')}>
                  <input
                    type="url"
                    spellCheck={false}
                    value={item.url}
                    onChange={(event) =>
                      updateArrayItem('openSource', index, 'url', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('openSource.stars')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.stars}
                    onChange={(event) =>
                      updateArrayItem('openSource', index, 'stars', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('openSource.forks')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.forks}
                    onChange={(event) =>
                      updateArrayItem('openSource', index, 'forks', event.target.value)
                    }
                  />
                </FloatingField>
              </div>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('openSource')}
          >
            {t('openSource.addRepository')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('publications') ? (
      <PanelSection
        id="section-publications"
        title={t('publications.heading')}
        description={t('publications.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.publications.map((item, index) => (
            <div key={`publication-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  {t('publications.publication')} #{index + 1}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('publications', index)}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'publications', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('publications', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('publications', index, 1)}
                    disabled={index === formData.publications.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('publications', index)}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FloatingField label={t('publications.title')}>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(event) =>
                        updateArrayItem('publications', index, 'title', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
                <FloatingField label={t('publications.publisher')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.publisher}
                    onChange={(event) =>
                      updateArrayItem('publications', index, 'publisher', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('publications.year')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.year}
                    onChange={(event) =>
                      updateArrayItem('publications', index, 'year', event.target.value)
                    }
                  />
                </FloatingField>
                <div className="sm:col-span-2">
                  <FloatingField label={t('publications.url')}>
                    <input
                      type="url"
                      spellCheck={false}
                      value={item.url}
                      onChange={(event) =>
                        updateArrayItem('publications', index, 'url', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
              </div>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('publications')}
          >
            {t('publications.addPublication')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('links') ? (
      <PanelSection
        id="section-links"
        title={t('links.heading')}
        description={t('links.intro')}
        theme={theme}
      >
        {(() => {
          // Show the common platforms and any field that already holds a
          // value; keep the rest (~11 niche platforms) behind a toggle so
          // the section isn't a wall of 15 empty URL inputs on open.
          const isAlwaysShown = (key) =>
            showAllLinks || PRIMARY_LINK_KEYS.includes(key) || formData.links[key]?.trim()
          const shownFields = linkFields.filter(({ key }) => isAlwaysShown(key))
          const hiddenCount = linkFields.length - shownFields.length

          return (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* The hide/show button is kept outside the <label>: nesting a
                    button inside one is invalid markup and folds the button text
                    into the input's accessible name. It only appears once a field
                    has a value — an empty field has nothing to hide from the CV. */}
                {shownFields.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor={`link-field-${key}`}
                        className={`text-xs font-semibold uppercase tracking-[0.06em] ${fieldLabelClassName}`}
                      >
                        {label}
                      </label>
                      {formData.links[key]?.trim() ? (
                        <button
                          type="button"
                          className="border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] transition"
                          onClick={() => toggleSectionItemVisibility('links', key)}
                        >
                          {isSectionItemVisible(sectionItemVisibility, 'links', key) ? copy.hide : copy.show}
                        </button>
                      ) : null}
                    </div>
                    <input
                      id={`link-field-${key}`}
                      className={inputClasses}
                      type="url"
                      value={formData.links[key]}
                      onChange={(event) => updateLinkField(key, event.target.value)}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>

              {hiddenCount > 0 || showAllLinks ? (
                <button
                  type="button"
                  className="mt-4 ui-button"
                  onClick={() => setShowAllLinks((value) => !value)}
                >
                  {showAllLinks
                    ? t('links.showFewerPlatforms')
                    : t('links.showMorePlatforms', { count: hiddenCount })}
                </button>
              ) : null}
            </>
          )
        })()}
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('leadership') ? (
      <PanelSection
        id="section-leadership"
        title={t('leadership.heading')}
        description={t('leadership.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.leadership.map((item, index) => (
            <div key={`leadership-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  {t('leadership.role')} #{index + 1}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('leadership', index)}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'leadership', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('leadership', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('leadership', index, 1)}
                    disabled={index === formData.leadership.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('leadership', index)}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FloatingField label={t('leadership.role')}>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(event) =>
                        updateArrayItem('leadership', index, 'role', event.target.value)
                      }
                    />
                  </FloatingField>
                  <FloatingField label={t('leadership.organization')}>
                    <input
                      type="text"
                      spellCheck={false}
                      value={item.organization}
                      onChange={(event) =>
                        updateArrayItem('leadership', index, 'organization', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
                <FloatingField label={t('leadership.description')}>
                  <AutoGrowTextarea
                    value={item.description}
                    onChange={(event) =>
                      updateArrayItem('leadership', index, 'description', event.target.value)
                    }
                  />
                </FloatingField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FloatingField label={t('leadership.startDate')}>
                    <input
                      type="text"
                      spellCheck={false}
                      value={item.startDate}
                      onChange={(event) =>
                        updateArrayItem('leadership', index, 'startDate', event.target.value)
                      }
                    />
                  </FloatingField>
                  <FloatingField label={t('leadership.endDate')}>
                    <input
                      type="text"
                      spellCheck={false}
                      value={item.endDate}
                      onChange={(event) =>
                        updateArrayItem('leadership', index, 'endDate', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
              </div>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('leadership')}
          >
            {t('leadership.addLeadershipRole')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('memberships') ? (
      <PanelSection
        id="section-memberships"
        title={t('memberships.heading')}
        description={t('memberships.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.memberships.map((item, index) => (
            <div key={`membership-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  {t('memberships.membership')} #{index + 1}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('memberships', index)}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'memberships', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('memberships', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('memberships', index, 1)}
                    disabled={index === formData.memberships.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('memberships', index)}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FloatingField label={t('memberships.organization')}>
                    <input
                      type="text"
                      spellCheck={false}
                      value={item.organization}
                      onChange={(event) =>
                        updateArrayItem('memberships', index, 'organization', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
                <FloatingField label={t('memberships.role')}>
                  <input
                    type="text"
                    value={item.role}
                    onChange={(event) =>
                      updateArrayItem('memberships', index, 'role', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('memberships.year')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.year}
                    onChange={(event) =>
                      updateArrayItem('memberships', index, 'year', event.target.value)
                    }
                  />
                </FloatingField>
              </div>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('memberships')}
          >
            {t('memberships.addMembership')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('speaking') ? (
      <PanelSection
        id="section-speaking"
        title={t('speaking.heading')}
        description={t('speaking.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.speaking.map((item, index) => (
            <div key={`speaking-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  {t('speaking.speakingEngagement')} #{index + 1}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('speaking', index)}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'speaking', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('speaking', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('speaking', index, 1)}
                    disabled={index === formData.speaking.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('speaking', index)}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingField label={t('speaking.conference')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.conference}
                    onChange={(event) =>
                      updateArrayItem('speaking', index, 'conference', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('speaking.date')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.date}
                    onChange={(event) =>
                      updateArrayItem('speaking', index, 'date', event.target.value)
                    }
                  />
                </FloatingField>
                <div className="sm:col-span-2">
                  <FloatingField label={t('speaking.topic')}>
                    <input
                      type="text"
                      value={item.topic}
                      onChange={(event) =>
                        updateArrayItem('speaking', index, 'topic', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
                <div className="sm:col-span-2">
                  <FloatingField label={t('speaking.audience')}>
                    <input
                      type="text"
                      value={item.audience}
                      onChange={(event) =>
                        updateArrayItem('speaking', index, 'audience', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
              </div>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('speaking')}
          >
            {t('speaking.addSpeakingEngagement')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('volunteering') ? (
      <PanelSection
        id="section-volunteering"
        title={t('volunteering.heading')}
        description={t('volunteering.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.volunteering.map((item, index) => (
            <div key={`volunteering-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  {t('volunteering.volunteerRole')} #{index + 1}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('volunteering', index)}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'volunteering', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('volunteering', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('volunteering', index, 1)}
                    disabled={index === formData.volunteering.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('volunteering', index)}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingField label={t('volunteering.organization')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.organization}
                    onChange={(event) =>
                      updateArrayItem('volunteering', index, 'organization', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('volunteering.role')}>
                  <input
                    type="text"
                    value={item.role}
                    onChange={(event) =>
                      updateArrayItem('volunteering', index, 'role', event.target.value)
                    }
                  />
                </FloatingField>
                <div className="sm:col-span-2">
                  <FloatingField label={t('volunteering.description')}>
                    <AutoGrowTextarea
                      value={item.description}
                      onChange={(event) =>
                        updateArrayItem('volunteering', index, 'description', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
              </div>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('volunteering')}
          >
            {t('volunteering.addVolunteerRole')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('internships') ? (
      <PanelSection
        id="section-internships"
        title={t('internships.heading')}
        description={t('internships.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.internships.map((item, index) => (
            <div key={`internship-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  {t('internships.internship')} #{index + 1}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('internships', index)}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'internships', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('internships', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('internships', index, 1)}
                    disabled={index === formData.internships.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('internships', index)}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingField label={t('internships.role')}>
                  <input
                    type="text"
                    value={item.role}
                    onChange={(event) =>
                      updateArrayItem('internships', index, 'role', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('internships.company')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.company}
                    onChange={(event) =>
                      updateArrayItem('internships', index, 'company', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('internships.location')}>
                  <input
                    type="text"
                    value={item.location}
                    onChange={(event) =>
                      updateArrayItem('internships', index, 'location', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('internships.technologies')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.technologies}
                    onChange={(event) =>
                      updateArrayItem('internships', index, 'technologies', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('internships.startDate')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.startDate}
                    onChange={(event) =>
                      updateArrayItem('internships', index, 'startDate', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('internships.endDate')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.endDate}
                    onChange={(event) =>
                      updateArrayItem('internships', index, 'endDate', event.target.value)
                    }
                  />
                </FloatingField>
                <div className="sm:col-span-2">
                  <FloatingField label={t('internships.description')}>
                    <AutoGrowTextarea
                      value={item.description}
                      onChange={(event) =>
                        updateArrayItem('internships', index, 'description', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
              </div>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('internships')}
          >
            {t('internships.addInternship')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('caseStudies') ? (
      <PanelSection
        id="section-caseStudies"
        title={t('caseStudies.heading')}
        description={t('caseStudies.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.caseStudies.map((item, index) => (
            <div key={`case-study-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  {t('caseStudies.caseStudy')} #{index + 1}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('caseStudies', index)}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'caseStudies', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('caseStudies', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('caseStudies', index, 1)}
                    disabled={index === formData.caseStudies.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('caseStudies', index)}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <FloatingField label={t('caseStudies.title')}>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(event) =>
                      updateArrayItem('caseStudies', index, 'title', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('caseStudies.problem')}>
                  <AutoGrowTextarea
                    value={item.problem}
                    onChange={(event) =>
                      updateArrayItem('caseStudies', index, 'problem', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('caseStudies.solution')}>
                  <AutoGrowTextarea
                    value={item.solution}
                    onChange={(event) =>
                      updateArrayItem('caseStudies', index, 'solution', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('caseStudies.technologies')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.technologies}
                    onChange={(event) =>
                      updateArrayItem('caseStudies', index, 'technologies', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('caseStudies.outcome')}>
                  <AutoGrowTextarea
                    value={item.outcome}
                    onChange={(event) =>
                      updateArrayItem('caseStudies', index, 'outcome', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('caseStudies.lessons')}>
                  <AutoGrowTextarea
                    value={item.lessons}
                    onChange={(event) =>
                      updateArrayItem('caseStudies', index, 'lessons', event.target.value)
                    }
                  />
                </FloatingField>
              </div>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('caseStudies')}
          >
            {t('caseStudies.addCaseStudy')}
          </button>
        </div>
      </PanelSection>
      ) : null}

      {templateSectionKeySet.has('testimonials') ? (
      <PanelSection
        id="section-testimonials"
        title={t('testimonials.heading')}
        description={t('testimonials.intro')}
        theme={theme}
      >
        <div className="space-y-4">
          <div className="space-y-3">
          {formData.testimonials.map((item, index) => (
            <div key={`testimonial-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  {t('testimonials.testimonial')} #{index + 1}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => toggleSectionItemVisibility('testimonials', index)}
                  >
                    {isSectionItemVisible(sectionItemVisibility, 'testimonials', index) ? copy.hide : copy.show}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('testimonials', index, -1)}
                    disabled={index === 0}
                  >
                    {copy.up}
                  </button>
                  <button
                    type="button"
                    className={utilityButtonClasses}
                    onClick={() => moveArrayItem('testimonials', index, 1)}
                    disabled={index === formData.testimonials.length - 1}
                  >
                    {copy.down}
                  </button>
                  <button
                    type="button"
                    className={removeButtonClasses}
                    onClick={() => removeArrayItem('testimonials', index)}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FloatingField label={t('testimonials.quote')}>
                    <AutoGrowTextarea
                      value={item.quote}
                      onChange={(event) =>
                        updateArrayItem('testimonials', index, 'quote', event.target.value)
                      }
                    />
                  </FloatingField>
                </div>
                <FloatingField label={t('testimonials.author')}>
                  <input
                    type="text"
                    spellCheck={false}
                    value={item.author}
                    onChange={(event) =>
                      updateArrayItem('testimonials', index, 'author', event.target.value)
                    }
                  />
                </FloatingField>
                <FloatingField label={t('testimonials.role')}>
                  <input
                    type="text"
                    value={item.role}
                    onChange={(event) =>
                      updateArrayItem('testimonials', index, 'role', event.target.value)
                    }
                  />
                </FloatingField>
              </div>
            </div>
          ))}
          </div>
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('testimonials')}
          >
            {t('testimonials.addTestimonial')}
          </button>
        </div>
      </PanelSection>
      ) : null}
    </form>
  )
}

export default CVForm
