import {
  createSectionVisibility,
  createSectionItemVisibility,
  isPhotoVisibleForTemplate,
  createInitialCvData,
  createEmptyExperience,
  createEmptyEducation,
} from '../utils/cvForm'

function shiftVisibilityMapAfterRemove(visibilityMap = {}, removedIndex) {
  return Object.entries(visibilityMap).reduce((next, [key, value]) => {
    const index = Number.parseInt(key, 10)

    if (!Number.isInteger(index)) {
      next[key] = value
      return next
    }

    if (index < removedIndex) {
      next[String(index)] = value
      return next
    }

    if (index > removedIndex) {
      next[String(index - 1)] = value
    }

    return next
  }, {})
}

function shiftVisibilityMapAfterInsert(visibilityMap = {}, insertedIndex) {
  return Object.entries(visibilityMap).reduce((next, [key, value]) => {
    const index = Number.parseInt(key, 10)

    if (!Number.isInteger(index)) {
      next[key] = value
      return next
    }

    if (index >= insertedIndex) {
      next[String(index + 1)] = value
      return next
    }

    next[String(index)] = value
    return next
  }, {})
}

function swapVisibilityMapIndexes(visibilityMap = {}, firstIndex, secondIndex) {
  const firstKey = String(firstIndex)
  const secondKey = String(secondIndex)
  const next = { ...visibilityMap }
  const hasFirst = Object.prototype.hasOwnProperty.call(visibilityMap, firstKey)
  const hasSecond = Object.prototype.hasOwnProperty.call(visibilityMap, secondKey)

  if (hasFirst) {
    next[secondKey] = visibilityMap[firstKey]
  } else {
    delete next[secondKey]
  }

  if (hasSecond) {
    next[firstKey] = visibilityMap[secondKey]
  } else {
    delete next[firstKey]
  }

  return next
}

export function cvFormReducer(state, action) {
  switch (action.type) {
    case 'SET_ROOT_FIELD':
      return { ...state, [action.field]: action.value }

    case 'SET_LINK_FIELD':
      return {
        ...state,
        links: { ...state.links, [action.field]: action.value },
      }

    case 'TOGGLE_SECTION_VISIBILITY':
      return {
        ...state,
        sectionVisibility: {
          ...createSectionVisibility(),
          ...(state.sectionVisibility ?? {}),
          [action.section]: !(state.sectionVisibility ?? {})[action.section],
        },
      }

    case 'TOGGLE_SECTION_ITEM_VISIBILITY': {
      const normalizedItemKey = String(action.itemKey)
      const nextSectionItemVisibility = {
        ...createSectionItemVisibility(),
        ...(state.sectionItemVisibility ?? {}),
      }
      const currentSection = nextSectionItemVisibility[action.section] ?? {}

      return {
        ...state,
        sectionItemVisibility: {
          ...nextSectionItemVisibility,
          [action.section]: {
            ...currentSection,
            [normalizedItemKey]: currentSection[normalizedItemKey] === false,
          },
        },
      }
    }

    case 'TOGGLE_PHOTO_VISIBILITY':
      if (!action.template) {
        return state
      }

      return {
        ...state,
        photoVisibilityByTemplate: {
          ...(state.photoVisibilityByTemplate ?? {}),
          [action.template]: !isPhotoVisibleForTemplate(
            state.photoVisibilityByTemplate,
            action.template,
          ),
        },
      }

    case 'ADD_SKILL': {
      const trimmed = action.skill.trim()

      if (!trimmed) {
        return state
      }

      if (state.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        return state
      }

      return { ...state, skills: [...state.skills, trimmed] }
    }

    case 'REMOVE_SKILL':
      return {
        ...state,
        skills: state.skills.filter((_, i) => i !== action.index),
        sectionItemVisibility: {
          ...createSectionItemVisibility(),
          ...(state.sectionItemVisibility ?? {}),
          skills: shiftVisibilityMapAfterRemove(state.sectionItemVisibility?.skills, action.index),
        },
      }

    case 'DUPLICATE_SKILL': {
      const currentSkill = state.skills[action.index]

      if (!currentSkill) {
        return state
      }

      return {
        ...state,
        skills: state.skills.flatMap((skill, i) =>
          i === action.index ? [skill, currentSkill] : [skill],
        ),
        sectionItemVisibility: {
          ...createSectionItemVisibility(),
          ...(state.sectionItemVisibility ?? {}),
          skills: shiftVisibilityMapAfterInsert(
            state.sectionItemVisibility?.skills,
            action.index + 1,
          ),
        },
      }
    }

    case 'MOVE_SKILL': {
      const nextIndex = action.index + action.direction

      if (nextIndex < 0 || nextIndex >= state.skills.length) {
        return state
      }

      const nextSkills = [...state.skills]
      const [movedSkill] = nextSkills.splice(action.index, 1)

      nextSkills.splice(nextIndex, 0, movedSkill)

      return {
        ...state,
        skills: nextSkills,
        sectionItemVisibility: {
          ...createSectionItemVisibility(),
          ...(state.sectionItemVisibility ?? {}),
          skills: swapVisibilityMapIndexes(
            state.sectionItemVisibility?.skills,
            action.index,
            nextIndex,
          ),
        },
      }
    }

    case 'UPDATE_ARRAY_ITEM':
      return {
        ...state,
        [action.section]: state[action.section].map((item, i) =>
          i === action.index ? { ...item, [action.field]: action.value } : item,
        ),
      }

    case 'ADD_ARRAY_ITEM': {
      const factory = action.section === 'experience' ? createEmptyExperience : createEmptyEducation

      return {
        ...state,
        [action.section]: [...state[action.section], factory()],
        sectionItemVisibility: {
          ...createSectionItemVisibility(),
          ...(state.sectionItemVisibility ?? {}),
        },
      }
    }

    case 'REMOVE_ARRAY_ITEM': {
      const currentItemVisibility = {
        ...createSectionItemVisibility(),
        ...(state.sectionItemVisibility ?? {}),
      }

      return {
        ...state,
        [action.section]: state[action.section].filter((_, i) => i !== action.index),
        sectionItemVisibility: {
          ...currentItemVisibility,
          [action.section]: shiftVisibilityMapAfterRemove(
            currentItemVisibility[action.section],
            action.index,
          ),
        },
      }
    }

    case 'DUPLICATE_ARRAY_ITEM': {
      const currentItem = state[action.section][action.index]

      if (!currentItem) {
        return state
      }

      return {
        ...state,
        [action.section]: state[action.section].flatMap((item, i) =>
          i === action.index ? [item, structuredClone(currentItem)] : [item],
        ),
        sectionItemVisibility: {
          ...createSectionItemVisibility(),
          ...(state.sectionItemVisibility ?? {}),
          [action.section]: shiftVisibilityMapAfterInsert(
            state.sectionItemVisibility?.[action.section],
            action.index + 1,
          ),
        },
      }
    }

    case 'MOVE_ARRAY_ITEM': {
      const nextIndex = action.index + action.direction

      if (nextIndex < 0 || nextIndex >= state[action.section].length) {
        return state
      }

      const nextItems = [...state[action.section]]
      const [movedItem] = nextItems.splice(action.index, 1)

      nextItems.splice(nextIndex, 0, movedItem)

      return {
        ...state,
        [action.section]: nextItems,
        sectionItemVisibility: {
          ...createSectionItemVisibility(),
          ...(state.sectionItemVisibility ?? {}),
          [action.section]: swapVisibilityMapIndexes(
            state.sectionItemVisibility?.[action.section],
            action.index,
            nextIndex,
          ),
        },
      }
    }

    case 'SET_FORM_DATA':
      return action.formData

    case 'RESET_FORM':
      return createInitialCvData()

    case 'MERGE_FORM_DATA':
      return { ...state, ...action.partialData }

    default:
      return state
  }
}
