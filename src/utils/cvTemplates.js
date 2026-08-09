export const defaultTemplateId = 'minimal'

const templateMap = {
  minimal: {
    id: 'minimal',
    label: 'Minimalist',
    description: 'Typography only, thin dividers, contact details in the header. Best for marketing, HR, and business roles.',
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
    label: 'Developer',
    description: 'Dark sidebar with project and achievement cards. For software engineers, DevOps, and cloud professionals.',
    variant: 'developer',
    layout: 'split',
    primarySections: ['about', 'experience', 'projects', 'achievements', 'openSource', 'publications'],
    secondarySections: ['skills', 'links', 'certificates', 'education', 'languages'],
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
  creative: {
    id: 'creative',
    label: 'Creative',
    description: 'Editorial profile with a quick-facts sidebar and one accent colour you can change. Suits any profession.',
    variant: 'creative',
    layout: 'split',
    primarySections: ['about', 'experience', 'projects', 'education'],
    secondarySections: ['skills', 'certificates', 'links', 'languages', 'interests'],
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
  modern: {
    id: 'modern',
    label: 'Modern Professional',
    description: 'Consulting-style layout with a blue timeline and circular photo. For senior engineers, architects, and consultants.',
    variant: 'modern',
    layout: 'split',
    primarySections: ['about', 'experience', 'education', 'projects', 'achievements'],
    secondarySections: ['skills', 'languages', 'certificates', 'links', 'interests'],
    summaryBadgeLabel: 'Summary',
    thumbnail: {
      accentClassName: 'bg-blue-600',
      surfaceClassName: 'bg-blue-50',
      primaryRatioClassName: 'grid-cols-[1.5fr_0.8fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-20',
      blockWidths: ['w-full', 'w-11/12', 'w-9/12'],
      chips: ['Experience', 'Skills'],
    },
  },
  executive: {
    id: 'executive',
    label: 'Executive',
    description: 'Restrained boardroom layout, gold-accented awards, no timeline. For CEOs, CTOs, VPs, and directors.',
    variant: 'executive',
    layout: 'split',
    primarySections: ['about', 'experience', 'leadership', 'projects', 'education'],
    secondarySections: ['coreStrengths', 'skills', 'certificates', 'languages', 'memberships', 'achievements', 'links'],
    summaryBadgeLabel: 'Executive Profile',
    thumbnail: {
      accentClassName: 'bg-gray-900',
      surfaceClassName: 'bg-gray-50',
      primaryRatioClassName: 'grid-cols-[1.7fr_0.9fr]',
      titleWidthClassName: 'w-32',
      subtitleWidthClassName: 'w-20',
      blockWidths: ['w-full', 'w-full', 'w-11/12'],
      chips: ['Summary', 'Leadership'],
    },
  },
  timeline: {
    id: 'timeline',
    label: 'Timeline',
    description: 'One continuous vertical timeline threading career, education, projects, and awards. For long careers worth walking through.',
    variant: 'timeline',
    layout: 'split',
    primarySections: ['about', 'experience', 'education', 'certificates', 'projects', 'achievements', 'speaking', 'publications', 'volunteering'],
    secondarySections: ['skills', 'links', 'languages', 'interests'],
    summaryBadgeLabel: 'Overview',
    thumbnail: {
      accentClassName: 'bg-cyan-500',
      surfaceClassName: 'bg-cyan-50',
      primaryRatioClassName: 'grid-cols-[1.7fr_0.9fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-11/12', 'w-10/12'],
      chips: ['Career', 'Milestones'],
    },
  },
  graduate: {
    id: 'graduate',
    label: 'Graduate',
    description: 'Bright indigo layout leading with education, academic projects, and internships. For students, graduates, and career changers.',
    variant: 'graduate',
    layout: 'split',
    primarySections: ['about', 'education', 'projects', 'internships', 'experience', 'publications', 'volunteering'],
    secondarySections: ['skills', 'languages', 'certificates', 'links', 'achievements', 'interests', 'memberships'],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-indigo-600',
      surfaceClassName: 'bg-indigo-50',
      primaryRatioClassName: 'grid-cols-[1.7fr_0.9fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-11/12', 'w-10/12'],
      chips: ['Education', 'Skills'],
    },
  },
  compact: {
    id: 'compact',
    label: 'Compact',
    description: 'Tightens spacing automatically until everything fits one page. For 10–30 year careers that need maximum density.',
    variant: 'compact',
    layout: 'stacked',
    primarySections: ['about', 'skills', 'experience', 'projects', 'education', 'certificates', 'languages', 'links', 'interests'],
    secondarySections: [],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-gray-600',
      surfaceClassName: 'bg-gray-50',
      primaryRatioClassName: 'grid-cols-1',
      titleWidthClassName: 'w-20',
      subtitleWidthClassName: 'w-14',
      blockWidths: ['w-full', 'w-full', 'w-11/12'],
      chips: ['CV', '1-Page'],
    },
  },
  portfolio: {
    id: 'portfolio',
    label: 'Portfolio Hybrid',
    description: 'Featured project cards, case studies, and tech-stack badges. For developers, designers, and creators.',
    variant: 'portfolio',
    layout: 'split',
    primarySections: ['about', 'projects', 'experience', 'caseStudies', 'openSource', 'education', 'testimonials'],
    secondarySections: ['skills', 'certificates', 'links', 'languages', 'achievements', 'interests'],
    summaryBadgeLabel: 'About',
    thumbnail: {
      accentClassName: 'bg-emerald-600',
      surfaceClassName: 'bg-emerald-50',
      primaryRatioClassName: 'grid-cols-[1.7fr_0.9fr]',
      titleWidthClassName: 'w-28',
      subtitleWidthClassName: 'w-20',
      blockWidths: ['w-full', 'w-11/12', 'w-9/12'],
      chips: ['Portfolio', 'Links'],
    },
  },
  techExec: {
    id: 'techExec',
    label: 'Tech Executive',
    description: 'Annual-report layout with a timeline and a core-strengths sidebar. For engineering, security, AI, and cloud leaders.',
    variant: 'techExec',
    layout: 'split',
    primarySections: ['about', 'experience', 'education', 'skills'],
    secondarySections: ['coreStrengths', 'certificates', 'projects', 'links', 'languages', 'interests'],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-[#163D7A]',
      surfaceClassName: 'bg-[#EFF6FF]',
      primaryRatioClassName: 'grid-cols-[1.7fr_1fr]',
      titleWidthClassName: 'w-28',
      subtitleWidthClassName: 'w-20',
      blockWidths: ['w-full', 'w-11/12', 'w-9/12'],
      chips: ['Strengths', 'Projects'],
    },
  },
}

const templateLocalization = {
  fi: {
    minimal: {
      label: 'Minimalisti',
      description: 'Pelkkää typografiaa, ohuet erottimet, yhteystiedot otsikossa. Sopii markkinointiin, HR:ään ja liiketoimintaan.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Esittely', 'Taidot'],
    },
    developer: {
      label: 'Kehittäjä',
      description: 'Tumma sivupalkki sekä projekti- ja saavutuskortit. Ohjelmistokehittäjille, DevOps- ja pilviammattilaisille.',
      summaryBadgeLabel: 'Painotus',
      chips: ['Kokemus', 'Stack'],
    },
    creative: {
      label: 'Luova',
      description: 'Lehtiprofiili, pikatietojen sivupalkki ja yksi vaihdettava aksenttiväri. Sopii mille tahansa ammatille.',
      summaryBadgeLabel: 'Huomiot',
      chips: ['Tarina', 'Linkit'],
    },
    modern: {
      label: 'Moderni ammattilainen',
      description: 'Konsulttityylinen asettelu, sininen aikajana ja pyöreä profiilikuva. Vanhemmille insinööreille, arkkitehdeille ja konsulteille.',
      summaryBadgeLabel: 'Yhteenveto',
      chips: ['Kokemus', 'Taidot'],
    },
    executive: {
      label: 'Johtaja',
      description: 'Hillitty hallitushuoneasettelu, kultareunaiset tunnustukset, ei aikajanaa. Ylimmälle johdolle.',
      summaryBadgeLabel: 'Johtajaprofiili',
      chips: ['Yhteenveto', 'Johtavuus'],
    },
    timeline: {
      label: 'Aikajana',
      description: 'Yhtenäinen pystyaikajana yhdistää uran, koulutuksen, projektit ja tunnustukset. Pitkille urille.',
      summaryBadgeLabel: 'Yleiskatsaus',
      chips: ['Ura', 'Virstanpylväät'],
    },
    graduate: {
      label: 'Tutkinto',
      description: 'Kirkas indigoasettelu nostaa koulutuksen, akateemiset projektit ja harjoittelut etusijalle. Opiskelijoille ja vastavalmistuneille.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Koulutus', 'Taidot'],
    },
    compact: {
      label: 'Tiivis',
      description: 'Tiivistää välit automaattisesti, kunnes sisältö mahtuu yhdelle sivulle. 10–30 vuoden kokemukselle.',
      summaryBadgeLabel: 'Profiili',
      chips: ['CV', '1-sivu'],
    },
    portfolio: {
      label: 'Portfoliohybridi',
      description: 'Esittelyprojektit, tapaustutkimukset ja teknologiamerkit. Kehittäjille, suunnittelijoille ja luoville tekijöille.',
      summaryBadgeLabel: 'Esittely',
      chips: ['Portfolio', 'Linkit'],
    },
    techExec: {
      label: 'Tekninen johtaja',
      description: 'Vuosikertomustyylinen asettelu, aikajana ja ydinvahvuuksien sivupalkki. Tekniikan, tietoturvan, tekoälyn ja pilven johtajille.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Vahvuudet', 'Projektit'],
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
