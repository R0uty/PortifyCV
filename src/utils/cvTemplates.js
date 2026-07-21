export const defaultTemplateId = 'minimal'

const templateMap = {
  minimal: {
    id: 'minimal',
    label: 'Minimalist',
    description: 'Pure white, typography-driven layout with thin dividers and no decorative elements. Contact info in header. Best for marketing, HR, and business.',
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
    description: 'Technical two-column layout with a clean sidebar for skills, links, and certifications. Experience-focused main column with role and company separated. Designed for software engineers and IT professionals.',
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
  creative: {
    id: 'creative',
    label: 'Creative',
    description: 'Editorial magazine-style layout with bold typography, accent colors, and categorized skill badges. Spacious, balanced, and visually distinctive. Best for designers, UI/UX, and creative professionals.',
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
  modern: {
    id: 'modern',
    label: 'Modern Professional',
    description: 'Two-column layout with blue accent color and a skills sidebar. Best for most office jobs.',
    variant: 'modern',
    layout: 'split',
    primarySections: ['about', 'experience', 'education'],
    secondarySections: ['skills', 'links'],
    summaryBadgeLabel: 'Summary',
    thumbnail: {
      accentClassName: 'bg-blue-600',
      surfaceClassName: 'bg-blue-50',
      primaryRatioClassName: 'grid-cols-[1.5fr_0.8fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-20',
      blockWidths: ['w-full', 'w-11/12', 'w-9/12'],
      chips: ['Skills', 'Links'],
    },
  },
  executive: {
    id: 'executive',
    label: 'Executive',
    description: 'Premium, understated layout with commanding typography, clean dividers, and generous whitespace. Designed for senior professionals, directors, and executives.',
    variant: 'executive',
    layout: 'stacked',
    primarySections: ['about', 'experience', 'education', 'skills', 'links'],
    secondarySections: [],
    summaryBadgeLabel: 'Executive Profile',
    thumbnail: {
      accentClassName: 'bg-gray-900',
      surfaceClassName: 'bg-gray-50',
      primaryRatioClassName: 'grid-cols-1',
      titleWidthClassName: 'w-32',
      subtitleWidthClassName: 'w-20',
      blockWidths: ['w-full', 'w-full', 'w-11/12'],
      chips: ['Summary', 'Leadership'],
    },
  },
  timeline: {
    id: 'timeline',
    label: 'Timeline',
    description: 'Chronological storytelling with a bold vertical timeline. Colorful accent nodes mark each section, making your career narrative easy to follow at a glance.',
    variant: 'timeline',
    layout: 'stacked',
    primarySections: ['experience', 'about', 'education', 'skills', 'links'],
    secondarySections: [],
    summaryBadgeLabel: 'Overview',
    thumbnail: {
      accentClassName: 'bg-cyan-500',
      surfaceClassName: 'bg-cyan-50',
      primaryRatioClassName: 'grid-cols-1',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-11/12', 'w-10/12'],
      chips: ['Career', 'Education'],
    },
  },
  graduate: {
    id: 'graduate',
    label: 'Graduate',
    description: 'Education near the top, with coursework, certifications, and projects emphasized. Ideal for entry-level candidates.',
    variant: 'graduate',
    layout: 'stacked',
    primarySections: ['education', 'about', 'experience', 'skills', 'links'],
    secondarySections: [],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-indigo-600',
      surfaceClassName: 'bg-indigo-50',
      primaryRatioClassName: 'grid-cols-1',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-11/12', 'w-10/12'],
      chips: ['Education', 'Skills'],
    },
  },
  compact: {
    id: 'compact',
    label: 'Compact',
    description: 'Dense but readable. Fits experienced candidates onto one page with small margins and efficient spacing.',
    variant: 'compact',
    layout: 'stacked',
    primarySections: ['about', 'experience', 'education', 'skills', 'links'],
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
    description: 'Large name header, featured projects with short descriptions, and portfolio links. Ideal for developers, UX/UI designers, and freelancers.',
    variant: 'portfolio',
    layout: 'split',
    primarySections: ['about', 'experience', 'education'],
    secondarySections: ['links', 'skills'],
    summaryBadgeLabel: 'About',
    thumbnail: {
      accentClassName: 'bg-emerald-600',
      surfaceClassName: 'bg-emerald-50',
      primaryRatioClassName: 'grid-cols-[1.4fr_0.9fr]',
      titleWidthClassName: 'w-28',
      subtitleWidthClassName: 'w-20',
      blockWidths: ['w-full', 'w-11/12', 'w-9/12'],
      chips: ['Portfolio', 'Links'],
    },
  },
}

const templateLocalization = {
  fi: {
    minimal: {
      label: 'Minimalisti',
      description: 'Puhdas valkoinen, typografiaan keskittyvä asettelu ohuilla erotimilla ja ilman koristeellisia elementtejä. Yhteystiedot otsikossa. Parhaimmillaan markkinoinnissa, HR:ssä ja liiketoiminnassa.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Esittely', 'Taidot'],
    },
    developer: {
      label: 'Kehittäjä',
      description: 'Tekninen kahden palstan asettelu puhtaalla sivupalkilla taitoja, linkkejä ja sertifikaatteja varten. Kokemukseen keskittyvä pääpalsta roolin ja yrityksen erotteluilla. Suunniteltu ohjelmistokehittäjille ja IT-ammattilaisille.',
      summaryBadgeLabel: 'Painotus',
      chips: ['Kokemus', 'Stack'],
    },
    creative: {
      label: 'Luova',
      description: 'Lehtimäinen asettelu rohkealla typografialla, korosteväreillä ja kategorisoiduilla taitotageilla.tilava, tasapainoinen ja visuaalisesti ainutlaatuinen. Parhaimmillaan suunnittelijille, UI/UX:lle ja luovan alan ammattilaisille.',
      summaryBadgeLabel: 'Huomiot',
      chips: ['Tarina', 'Linkit'],
    },
    modern: {
      label: 'Moderni ammattilainen',
      description: 'Kahden palstan asettelu sinisellä korostevärillä ja taitopalstalla. Parhaimmillaan toimistotyössä.',
      summaryBadgeLabel: 'Yhteenveto',
      chips: ['Taidot', 'Linkit'],
    },
    executive: {
      label: 'Johtaja',
      description: 'Premium, vaatimaton asettelu komenteivalla typografialla, puhtaailla erotimilla ja runsaalla tilalla. Suunniteltu ylempään johtoon, johtajiin ja asiantuntijoihin.',
      summaryBadgeLabel: 'Johtajaprofiili',
      chips: ['Yhteenveto', 'Johtavuus'],
    },
    timeline: {
      label: 'Aikajana',
      description: 'Kronologinen tarinankerronta rohkealla pystyaikajanalla. Värikkäät solmut jokaisessa osiossa tekevät urastasi tarinan helpposeurattavaksi heti silmäyksellä.',
      summaryBadgeLabel: 'Yleiskatsaus',
      chips: ['Ura', 'Koulutus'],
    },
    graduate: {
      label: 'Tutkinto',
      description: 'Koulutus ylhäällä, opintojen sisältö ja sertifikaatit korostettuina. Ihanteellinen vastavalmistuneille.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Koulutus', 'Taidot'],
    },
    compact: {
      label: 'Tiivis',
      description: 'Tiivis mutta luettava. Mahtuu kokeneet ehdokkaat yhdelle sivulle pienillä marginaaleilla.',
      summaryBadgeLabel: 'Profiili',
      chips: ['CV', '1-sivu'],
    },
    portfolio: {
      label: 'Portfoliohybridi',
      description: 'Suuri nimiotsikko, esitellyt projektit ja portfolio-linkit. Ihanteellinen kehittäjille, UX/UI-suunnittelijille ja freelancereille.',
      summaryBadgeLabel: 'Esittely',
      chips: ['Portfolio', 'Linkit'],
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
