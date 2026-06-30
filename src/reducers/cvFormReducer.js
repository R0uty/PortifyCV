import {
  createSectionVisibility,
  createSectionItemVisibility,
  isPhotoVisibleForTemplate,
  createInitialCvData,
  createEmptyExperience,
  createEmptyEducation,
} from '../utils/cvForm'

export const FORM_ACTION = {
  SET_ROOT_FIELD: 'SET_ROOT_FIELD',
  SET_LINK_FIELD: 'SET_LINK_FIELD',
  TOGGLE_SECTION_VISIBILITY: 'TOGGLE_SECTION_VISIBILITY',
  TOGGLE_SECTION_ITEM_VISIBILITY: 'TOGGLE_SECTION_ITEM_VISIBILITY',
  TOGGLE_PHOTO_VISIBILITY: 'TOGGLE_PHOTO_VISIBILITY',
  ADD_SKILL: 'ADD_SKILL',
  REMOVE_SKILL: 'REMOVE_SKILL',
  DUPLICATE_SKILL: 'DUPLICATE_SKILL',
  MOVE_SKILL: 'MOVE_SKILL',
  UPDATE_ARRAY_ITEM: 'UPDATE_ARRAY_ITEM',
  ADD_ARRAY_ITEM: 'ADD_ARRAY_ITEM',
  REMOVE_ARRAY_ITEM: 'REMOVE_ARRAY_ITEM',
  DUPLICATE_ARRAY_ITEM: 'DUPLICATE_ARRAY_ITEM',
  MOVE_ARRAY_ITEM: 'MOVE_ARRAY_ITEM',
  SET_FORM_DATA: 'SET_FORM_DATA',
  RESET_FORM: 'RESET_FORM',
  MERGE_FORM_DATA: 'MERGE_FORM_DATA',
}

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
    case FORM_ACTION.SET_ROOT_FIELD:
      return { ...state, [action.field]: action.value }

    case FORM_ACTION.SET_LINK_FIELD:
      return {
        ...state,
        links: { ...state.links, [action.field]: action.value },
      }

    case FORM_ACTION.TOGGLE_SECTION_VISIBILITY:
      return {
        ...state,
        sectionVisibility: {
          ...createSectionVisibility(),
          ...(state.sectionVisibility ?? {}),
          [action.section]: !(state.sectionVisibility ?? {})[action.section],
        },
      }

    case FORM_ACTION.TOGGLE_SECTION_ITEM_VISIBILITY: {
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

    case FORM_ACTION.TOGGLE_PHOTO_VISIBILITY:
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

    case FORM_ACTION.ADD_SKILL: {
      const trimmed = action.skill.trim()

      if (!trimmed) {
        return state
      }

      if (state.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        return state
      }

      return { ...state, skills: [...state.skills, trimmed] }
    }

    case FORM_ACTION.REMOVE_SKILL:
      return {
        ...state,
        skills: state.skills.filter((_, i) => i !== action.index),
        sectionItemVisibility: {
          ...createSectionItemVisibility(),
          ...(state.sectionItemVisibility ?? {}),
          skills: shiftVisibilityMapAfterRemove(state.sectionItemVisibility?.skills, action.index),
        },
      }

    case FORM_ACTION.DUPLICATE_SKILL: {
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

    case FORM_ACTION.MOVE_SKILL: {
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

    case FORM_ACTION.UPDATE_ARRAY_ITEM:
      return {
        ...state,
        [action.section]: state[action.section].map((item, i) =>
          i === action.index ? { ...item, [action.field]: action.value } : item,
        ),
      }

    case FORM_ACTION.ADD_ARRAY_ITEM: {
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

    case FORM_ACTION.REMOVE_ARRAY_ITEM: {
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

    case FORM_ACTION.DUPLICATE_ARRAY_ITEM: {
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

    case FORM_ACTION.MOVE_ARRAY_ITEM: {
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

    case FORM_ACTION.SET_FORM_DATA:
      return action.formData

    case FORM_ACTION.RESET_FORM:
      return createInitialCvData()

    case FORM_ACTION.MERGE_FORM_DATA:
      return { ...state, ...action.partialData }

    default:
      return state
  }
}
