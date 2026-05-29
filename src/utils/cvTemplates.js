export const defaultTemplateId = 'minimal'

const templateMap = {
  minimal: {
    id: 'minimal',
    label: 'Minimal A',
    description: 'Balanced single-column flow with clean editorial spacing.',
    variant: 'minimal',
    mostPopular: true,
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
    label: 'Minimal B',
    description: 'Split layout with experience-forward ordering and compact side notes.',
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
    label: 'Minimal C',
    description: 'Structured single-column rhythm tuned for predictable scanning.',
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
    label: 'Minimal D',
    description: 'Split layout with softer grouping between primary and supporting sections.',
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
