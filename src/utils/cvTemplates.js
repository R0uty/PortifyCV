export const defaultTemplateId = 'minimal'

const templateMap = {
  minimal: {
    id: 'minimal',
    label: 'Editorial',
    description: 'Single-column with rounded section cards, clean spacing, and a bold dark header.',
    variant: 'minimal',
    layout: 'stacked',
    primarySections: ['about', 'experience', 'education', 'skills', 'links'],
    secondarySections: [],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-gray-900',
      surfaceClassName: 'bg-gray-100',
      primaryRatioClassName: 'grid-cols-[1.45fr_0.85fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-11/12', 'w-10/12'],
      chips: ['About', 'Skills'],
    },
  },
  developer: {
    id: 'developer',
    label: 'Technical',
    description: 'Split layout with experience on the left and a compact sidebar. Monospace skill tags.',
    variant: 'developer',
    layout: 'split',
    primarySections: ['experience', 'about', 'education'],
    secondarySections: ['skills', 'links'],
    summaryBadgeLabel: 'Focus',
    thumbnail: {
      accentClassName: 'bg-gray-700',
      surfaceClassName: 'bg-gray-100',
      primaryRatioClassName: 'grid-cols-[1.55fr_0.75fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-20',
      blockWidths: ['w-full', 'w-10/12', 'w-9/12'],
      chips: ['Experience', 'Stack'],
    },
  },
  corporate: {
    id: 'corporate',
    label: 'Classic',
    description: 'Single-column with flat section rules and no card chrome — clean and formal.',
    variant: 'corporate',
    layout: 'stacked',
    primarySections: ['about', 'experience', 'education', 'skills', 'links'],
    secondarySections: [],
    summaryBadgeLabel: 'Outline',
    thumbnail: {
      accentClassName: 'bg-gray-700',
      surfaceClassName: 'bg-gray-100',
      primaryRatioClassName: 'grid-cols-1',
      titleWidthClassName: 'w-28',
      subtitleWidthClassName: 'w-18',
      blockWidths: ['w-full', 'w-full', 'w-11/12'],
      chips: ['Profile', 'Timeline'],
    },
  },
  creative: {
    id: 'creative',
    label: 'Creative',
    description: 'Split layout with accent-tinted sidebar, coloured skill tags, and a gradient header.',
    variant: 'creative',
    layout: 'split',
    primarySections: ['about', 'experience', 'education'],
    secondarySections: ['links', 'skills'],
    summaryBadgeLabel: 'Notes',
    thumbnail: {
      accentClassName: 'bg-gradient-to-r from-gray-500 to-gray-500',
      surfaceClassName: 'bg-gradient-to-br from-gray-50 to-gray-50',
      primaryRatioClassName: 'grid-cols-[1.35fr_0.95fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-10/12', 'w-8/12'],
      chips: ['Story', 'Links'],
    },
  },
}

const templateLocalization = {
  fi: {
    minimal: {
      label: 'Editorial',
      description: 'Yhden palstan asettelu pyöristetyillä osioilla, selkeällä rytmillä ja vahvalla tummalla otsikolla.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Esittely', 'Taidot'],
    },
    developer: {
      label: 'Technical',
      description: 'Jaettu asettelu: kokemus vasemmalla ja tiivis sivupalsta. Monospace-osaamistagit.',
      summaryBadgeLabel: 'Painotus',
      chips: ['Kokemus', 'Stack'],
    },
    corporate: {
      label: 'Classic',
      description: 'Yhden palstan asettelu ilman korttikehyksiä - selkeä ja muodollinen.',
      summaryBadgeLabel: 'Yhteenveto',
      chips: ['Profiili', 'Aikajana'],
    },
    creative: {
      label: 'Creative',
      description: 'Jaettu asettelu korostevärisellä sivupalstalla, värillisillä tageilla ja liukuvalla otsikolla.',
      summaryBadgeLabel: 'Huomiot',
      chips: ['Tarina', 'Linkit'],
    },
  },
}

function localizeTemplate(template, locale = 'en') {
  if (locale !== 'fi') {
    return template
  }

  const localized = templateLocalization.fi[template.id]

  if (!localized) {
    return template
  }

  return {
    ...template,
    label: localized.label,
    description: localized.description,
    summaryBadgeLabel: localized.summaryBadgeLabel,
    thumbnail: {
      ...template.thumbnail,
      chips: localized.chips,
    },
  }
}

export function getCvTemplates(locale = 'en') {
  return Object.values(templateMap).map((template) => localizeTemplate(template, locale))
}

export const cvTemplates = getCvTemplates('en')

export function getCvTemplate(templateId, locale = 'en') {
  const template = templateMap[templateId] ?? templateMap[defaultTemplateId]
  return localizeTemplate(template, locale)
}
