import { useEffect, useRef, useState } from 'react'

import PanelSection from './PanelSection'
import { getUiTheme } from '../utils/designSystem'
import {
  createEmptyEducation,
  createEmptyExperience,
  linkFields,
} from '../utils/cvForm'

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
  labelClassName = 'text-slate-200',
}) {
  return (
    <label className="block">
      <span className={`text-sm font-medium ${labelClassName}`}>
        {label}
        {required ? <span className="ml-1 text-rose-300">*</span> : null}
      </span>
      {children}
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </label>
  )
}

function InlineTipList({ items = [], theme = 'dark', actionLabel = '', onAction = null }) {
  const ui = getUiTheme(theme)

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
                ? 'border-amber-400/20 bg-amber-400/10 text-amber-100'
                : 'border-amber-300 bg-amber-50 text-amber-800'
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
                {actionLabel || 'Improve text'}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function EntryBadge({ count = 0, theme = 'dark' }) {
  const ui = getUiTheme(theme)

  if (count === 0) {
    return null
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        ui.isDark ? 'bg-amber-400/15 text-amber-100' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {count} tip{count === 1 ? '' : 's'}
    </span>
  )
}

function CVForm({
  formData,
  setFormData,
  errors,
  theme = 'dark',
  feedback,
  onImproveAboutText,
  onImproveExperienceText,
}) {
  const [skillInput, setSkillInput] = useState('')
  const ui = getUiTheme(theme)
  const inputClasses = `mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-ring)] ${ui.input}`
  const textareaClasses = `${inputClasses} resize-none overflow-hidden`
  const actionButtonClasses = `rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`
  const removeButtonClasses = `rounded-full border px-3 py-2 text-xs font-medium transition ${ui.buttonDanger}`
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

  const updateRootField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updateLinkField = (field, value) => {
    setFormData((current) => ({
      ...current,
      links: {
        ...current.links,
        [field]: value,
      },
    }))
  }

  const addSkill = (value) => {
    const normalizedValue = value.trim()

    if (!normalizedValue) {
      return
    }

    setFormData((current) => {
      if (current.skills.some((skill) => skill.toLowerCase() === normalizedValue.toLowerCase())) {
        return current
      }

      return {
        ...current,
        skills: [...current.skills, normalizedValue],
      }
    })

    setSkillInput('')
  }

  const removeSkill = (index) => {
    setFormData((current) => ({
      ...current,
      skills: current.skills.filter((_, skillIndex) => skillIndex !== index),
    }))
  }

  const updateArrayItem = (section, index, field, value) => {
    setFormData((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }))
  }

  const addArrayItem = (section, factory) => {
    setFormData((current) => ({
      ...current,
      [section]: [...current[section], factory()],
    }))
  }

  const removeArrayItem = (section, index) => {
    setFormData((current) => ({
      ...current,
      [section]: current[section].filter((_, itemIndex) => itemIndex !== index),
    }))
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
        eyebrow="Step 01"
        title="Profile"
        description="Add the core information that appears at the top of the CV."
        theme={theme}
        badge={feedback.sectionBadges.profile}
      >
        <div className="space-y-4">
          <Field
            label="Full name"
            error={errors.fullName}
            required
            labelClassName={fieldLabelClassName}
          >
            <input
              className={inputClasses}
              type="text"
              value={formData.fullName}
              onChange={(event) => updateRootField('fullName', event.target.value)}
              placeholder="Alex Morgan"
              aria-invalid={Boolean(errors.fullName)}
            />
          </Field>

          <Field
            label="Professional title"
            error={errors.title}
            required
            labelClassName={fieldLabelClassName}
          >
            <input
              className={inputClasses}
              type="text"
              value={formData.title}
              onChange={(event) => updateRootField('title', event.target.value)}
              placeholder="Product Designer"
              aria-invalid={Boolean(errors.title)}
            />
          </Field>

          <Field label="About" labelClassName={fieldLabelClassName}>
            <AutoGrowTextarea
              className={textareaClasses}
              value={formData.about}
              onChange={(event) => updateRootField('about', event.target.value)}
              placeholder="Summarize your experience, strengths, and the kind of roles you want."
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={improveButtonClasses}
              onClick={onImproveAboutText}
            >
              Improve text
            </button>
            <p className={`text-xs ${helperTextClasses}`}>
              Rule-based cleanup shortens long copy and keeps the summary focused.
            </p>
          </div>
          <InlineTipList
            items={feedback.inlineTips.profile}
            theme={theme}
            actionLabel="Improve text"
            onAction={onImproveAboutText}
          />
        </div>
      </PanelSection>

      <PanelSection
        eyebrow="Step 02"
        title="Skills"
        description="Press Enter or comma to turn each skill into a tag."
        theme={theme}
        badge={feedback.sectionBadges.skills}
      >
        <div className="space-y-3">
          <Field label="Skill tags" labelClassName={fieldLabelClassName}>
            <div className={`mt-2 rounded-xl border px-3 py-3 ${ui.inputShell}`}>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span key={`${skill}-${index}`} className={tagClasses}>
                    {skill}
                    <button
                      type="button"
                      className="text-current/80 transition hover:text-current"
                      onClick={() => removeSkill(index)}
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  className={`min-w-[140px] flex-1 border-0 bg-transparent py-1 text-sm outline-none ${
                    ui.isDark
                      ? 'text-white placeholder:text-slate-500'
                      : 'text-slate-900 placeholder:text-slate-400'
                  }`}
                  type="text"
                  value={skillInput}
                  onChange={(event) => setSkillInput(event.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={() => addSkill(skillInput)}
                  placeholder="Add a skill"
                />
              </div>
            </div>
          </Field>
          <p className={`text-xs ${helperTextClasses}`}>
            Tip: Backspace removes the last tag when the input is empty.
          </p>
          <InlineTipList items={feedback.inlineTips.skills} theme={theme} />
        </div>
      </PanelSection>

      <PanelSection
        eyebrow="Step 03"
        title="Experience"
        description="Capture roles, timelines, and responsibilities for each work experience."
        theme={theme}
        badge={feedback.sectionBadges.experience}
      >
        <div className="space-y-4">
          <InlineTipList items={feedback.inlineTips.experience} theme={theme} />
          {formData.experience.map((item, index) => (
            <div key={`experience-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                    Experience #{index + 1}
                  </p>
                  <EntryBadge count={feedback.inlineTips.experienceItems[index]?.length ?? 0} theme={theme} />
                </div>
                <button
                  type="button"
                  className={removeButtonClasses}
                  onClick={() => removeArrayItem('experience', index)}
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Role" labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.role}
                    onChange={(event) =>
                      updateArrayItem('experience', index, 'role', event.target.value)
                    }
                    placeholder="Senior Product Designer"
                  />
                </Field>
                <Field label="Company" labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.company}
                    onChange={(event) =>
                      updateArrayItem('experience', index, 'company', event.target.value)
                    }
                    placeholder="Studio North"
                  />
                </Field>
                <Field label="Start date" labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.startDate}
                    onChange={(event) =>
                      updateArrayItem('experience', index, 'startDate', event.target.value)
                    }
                    placeholder="Jan 2022"
                  />
                </Field>
                <Field label="End date" labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.endDate}
                    onChange={(event) =>
                      updateArrayItem('experience', index, 'endDate', event.target.value)
                    }
                    placeholder="Present"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description" labelClassName={fieldLabelClassName}>
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
                      placeholder="Describe the work, achievements, and impact."
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
                  Improve text
                </button>
                <p className={`text-xs ${helperTextClasses}`}>
                  Keep each entry short, action-oriented, and easy to scan.
                </p>
              </div>
              <InlineTipList
                items={feedback.inlineTips.experienceItems[index]}
                theme={theme}
                actionLabel="Improve text"
                onAction={() => onImproveExperienceText(index)}
              />
            </div>
          ))}
          <button
            type="button"
            className={actionButtonClasses}
            onClick={() => addArrayItem('experience', createEmptyExperience)}
          >
            Add experience
          </button>
        </div>
      </PanelSection>

      <PanelSection
        eyebrow="Step 04"
        title="Education"
        description="Include degrees, institutions, and timelines for your academic background."
        theme={theme}
      >
        <div className="space-y-4">
          {formData.education.map((item, index) => (
            <div key={`education-${index}`} className={itemCardClasses}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className={`text-sm font-medium ${itemHeadingClasses}`}>
                  Education #{index + 1}
                </p>
                <button
                  type="button"
                  className={removeButtonClasses}
                  onClick={() => removeArrayItem('education', index)}
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="School" labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.school}
                    onChange={(event) =>
                      updateArrayItem('education', index, 'school', event.target.value)
                    }
                    placeholder="University of the Arts"
                  />
                </Field>
                <Field label="Degree" labelClassName={fieldLabelClassName}>
                  <input
                    className={inputClasses}
                    type="text"
                    value={item.degree}
                    onChange={(event) =>
                      updateArrayItem('education', index, 'degree', event.target.value)
                    }
                    placeholder="B.A. Graphic Design"
                  />
                </Field>
                <Field label="Start date" labelClassName={fieldLabelClassName}>
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
                <Field label="End date" labelClassName={fieldLabelClassName}>
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
            onClick={() => addArrayItem('education', createEmptyEducation)}
          >
            Add education
          </button>
        </div>
      </PanelSection>

      <PanelSection
        eyebrow="Step 05"
        title="Links"
        description="Add the platforms and portfolio links that support your CV."
        theme={theme}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {linkFields.map(({ key, label, placeholder }) => (
            <Field key={key} label={label} labelClassName={fieldLabelClassName}>
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
