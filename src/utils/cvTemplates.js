export const defaultTemplateId = 'minimal'

const templateMap = {
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean editorial spacing with a wider single-column flow.',
    variant: 'minimal',
    mostPopular: true,
    layout: 'stacked',
    primarySections: ['about', 'experience', 'education', 'skills', 'links'],
    secondarySections: [],
    summaryBadgeLabel: 'Summary',
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
    label: 'Developer',
    description: 'Code-inspired hierarchy with experience-first ordering.',
    variant: 'developer',
    layout: 'split',
    primarySections: ['experience', 'about', 'education'],
    secondarySections: ['skills', 'links'],
    summaryBadgeLabel: 'Readme',
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
    label: 'Corporate',
    description: 'Structured business layout with a single flowing column.',
    variant: 'corporate',
    layout: 'stacked',
    primarySections: ['about', 'experience', 'education', 'skills', 'links'],
    secondarySections: [],
    summaryBadgeLabel: 'Profile',
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
    description: 'Expressive visual treatment with flexible supporting panels.',
    variant: 'creative',
    layout: 'split',
    primarySections: ['about', 'experience', 'education'],
    secondarySections: ['links', 'skills'],
    summaryBadgeLabel: 'Story',
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
