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
      accentClassName: 'bg-slate-900',
      surfaceClassName: 'bg-slate-100',
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
      accentClassName: 'bg-sky-700',
      surfaceClassName: 'bg-slate-100',
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
      accentClassName: 'bg-slate-700',
      surfaceClassName: 'bg-slate-100',
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
      accentClassName: 'bg-gradient-to-r from-fuchsia-500 to-sky-500',
      surfaceClassName: 'bg-gradient-to-br from-fuchsia-50 to-sky-50',
      primaryRatioClassName: 'grid-cols-[1.35fr_0.95fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-10/12', 'w-8/12'],
      chips: ['Story', 'Links'],
    },
  },
}

export const cvTemplates = Object.values(templateMap)

export function getCvTemplate(templateId) {
  return templateMap[templateId] ?? templateMap[defaultTemplateId]
}
