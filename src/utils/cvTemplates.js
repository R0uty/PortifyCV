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
    description: 'Two visual modes in one template: a flat, high-compatibility ATS layout for job applications, and a colorful "Developer Showcase" mode (dark sidebar, gradient accents, project/achievement cards, timeline) for portfolios and networking. Switch instantly with ATS-friendly mode. Designed for software engineers, DevOps, and cloud professionals.',
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
    description: 'A premium magazine-profile / portfolio-style layout suitable for any profession — editorial "About Me" with personality badges, floating experience and project cards, and a profile-panel sidebar with quick facts, skills, certificates, links, languages, and interests. Switch to ATS-friendly mode for a flat, parser-safe layout. One customizable accent color throughout.',
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
    description: 'Two visual modes in one template: a flat, high-compatibility ATS layout, and a premium navy/royal-blue "Showcase" mode (blue timeline, minimal cards, thin dividers, circular photo) styled after a global consulting firm’s executive resume. Switch instantly with ATS-friendly mode. Designed for senior engineers, architects, consultants, and technical leaders.',
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
    description: 'Two visual modes in one template: a flat, high-compatibility ATS layout, and a premium navy/indigo "boardroom" Showcase mode (no decorative timeline, subtle gold-accented Awards, minimal professional cards) styled for C-level leadership. Switch instantly with ATS-friendly mode. Designed for CEOs, CTOs, CISOs, VPs, Directors, and other senior leaders.',
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
    description: 'Two visual modes in one template: a flat, high-compatibility ATS layout, and a premium "career storytelling" Showcase mode where a single continuous, color-coded vertical timeline threads together Career, Education, Certifications, Projects, Awards, Speaking, Publications, and Volunteering. Switch instantly with ATS-friendly mode. Ideal for engineers, researchers, and professionals with a long career to tell.',
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
    description: 'Two visual modes in one template: a flat, high-compatibility ATS layout, and a premium "future potential" Showcase mode where a bright, welcoming indigo/blue design puts Education, Academic Projects, and Internships front and center. Switch instantly with ATS-friendly mode. Ideal for students, recent graduates, apprentices, and career changers.',
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
    description: 'Two visual modes in one template: a flat, high-compatibility ATS layout, and a premium "ultra-efficient one-pager" Showcase mode with smart space optimisation that automatically tightens spacing until your content fits a single page. Ideal for senior professionals with 10-30 years of experience who need maximum information density without sacrificing readability.',
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
    description: 'Two visual modes in one template: a flat, high-compatibility ATS layout, and a premium "portfolio website condensed into a résumé" Showcase mode with hero Featured Project cards, Case Studies, Open Source repos, and colorful Tech Stack badges. Switch instantly with ATS-friendly mode. Ideal for developers, designers, and creators who want their CV to feel like their portfolio site.',
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
    description: 'Premium, annual-report-style layout for software engineers, cybersecurity, AI, and cloud professionals. Navy and royal-blue palette, circular photo, timeline experience, and a dedicated core strengths and projects sidebar. ATS-friendly with strong visual hierarchy.',
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
      description: 'Puhdas valkoinen, typografiaan keskittyvä asettelu ohuilla erotimilla ja ilman koristeellisia elementtejä. Yhteystiedot otsikossa. Parhaimmillaan markkinoinnissa, HR:ssä ja liiketoiminnassa.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Esittely', 'Taidot'],
    },
    developer: {
      label: 'Kehittäjä',
      description: 'Kaksi visuaalista tilaa samassa pohjassa: yksinkertainen ATS-yhteensopiva asettelu työhakemuksiin ja värikäs "Developer Showcase" -tila (tumma sivupalkki, liukuväriaksentit, projekti- ja saavutuskortit, aikajana) portfolioihin ja verkostoitumiseen. Vaihda tilaa välittömästi ATS-ystävällisellä tilalla.',
      summaryBadgeLabel: 'Painotus',
      chips: ['Kokemus', 'Stack'],
    },
    creative: {
      label: 'Luova',
      description: 'Premium-tasoinen lehtiprofiili- ja portfoliotyylinen asettelu, joka sopii mille tahansa ammatille — editorialinen "Minusta"-osio persoonallisuusmerkeillä, kelluvat kokemus- ja projektikortit sekä profiilipaneelin sivupalkki pikatiedoilla, taidoilla, sertifikaateilla, linkeillä, kielillä ja kiinnostuksen kohteilla. Vaihda ATS-ystävälliseen tilaan yksinkertaista, jäsenneltävää asettelua varten.',
      summaryBadgeLabel: 'Huomiot',
      chips: ['Tarina', 'Linkit'],
    },
    modern: {
      label: 'Moderni ammattilainen',
      description: 'Kaksi visuaalista tilaa samassa pohjassa: yksinkertainen ATS-yhteensopiva asettelu ja premium-tasoinen laivastonsininen/kuninkaansininen "Showcase"-tila (sininen aikajana, minimalistiset kortit, ohuet erottimet, pyöreä profiilikuva) johtavan konsulttiyrityksen johtajan ansioluettelon tyyliin. Vaihda tilaa välittömästi ATS-ystävällisellä tilalla.',
      summaryBadgeLabel: 'Yhteenveto',
      chips: ['Kokemus', 'Taidot'],
    },
    executive: {
      label: 'Johtaja',
      description: 'Kaksi visuaalista tilaa samassa pohjassa: yksinkertainen ATS-yhteensopiva asettelu ja premium-tasoinen laivastonsininen/indigo "hallitushuone"-Showcase-tila (ei koristeellista aikajanaa, hienovarainen kultareunus tunnustuksissa, minimalistiset ammattikortit) ylimmälle johdolle. Vaihda tilaa välittömästi ATS-ystävällisellä tilalla.',
      summaryBadgeLabel: 'Johtajaprofiili',
      chips: ['Yhteenveto', 'Johtavuus'],
    },
    timeline: {
      label: 'Aikajana',
      description: 'Kaksi visuaalista tilaa samassa pohjassa: yksinkertainen ATS-yhteensopiva asettelu ja premium-tasoinen "uratarina"-Showcase-tila, jossa yhtenäinen, väri-koodattu pystyaikajana yhdistää uran, koulutuksen, sertifioinnit, projektit, tunnustukset, esiintymiset, julkaisut ja vapaaehtoistyön. Vaihda tilaa välittömästi ATS-ystävällisellä tilalla.',
      summaryBadgeLabel: 'Yleiskatsaus',
      chips: ['Ura', 'Virstanpylväät'],
    },
    graduate: {
      label: 'Tutkinto',
      description: 'Kaksi visuaalista tilaa samassa pohjassa: yksinkertainen ATS-yhteensopiva asettelu ja premium-tasoinen "tulevaisuuden potentiaali"-Showcase-tila, jossa kirkas ja kutsuva indigo/sininen asettelu nostaa koulutuksen, akateemiset projektit ja harjoittelut etusijalle. Vaihda tilaa välittömästi ATS-ystävällisellä tilalla.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Koulutus', 'Taidot'],
    },
    compact: {
      label: 'Tiivis',
      description: 'Kaksi visuaalista tilaa samassa pohjassa: yksinkertainen ATS-yhteensopiva asettelu ja premium-tasoinen "erittäin tehokas yksisivuinen"-Showcase-tila, joka älykkäästi tiivistää välit, kunnes sisältö mahtuu yhdelle sivulle. Ihanteellinen 10-30 vuoden kokemuksen omaaville ammattilaisille.',
      summaryBadgeLabel: 'Profiili',
      chips: ['CV', '1-sivu'],
    },
    portfolio: {
      label: 'Portfoliohybridi',
      description: 'Kaksi visuaalista tilaa samassa pohjassa: yksinkertainen ATS-yhteensopiva asettelu ja premium-tasoinen "portfoliosivusto CV:nä"-Showcase-tila, jossa esittelyprojektit, tapaustutkimukset, avoimen lähdekoodin projektit ja värikkäät teknologiamerkit korostuvat. Ihanteellinen kehittäjille, suunnittelijoille ja luovan alan ammattilaisille.',
      summaryBadgeLabel: 'Esittely',
      chips: ['Portfolio', 'Linkit'],
    },
    techExec: {
      label: 'Tekninen johtaja',
      description: 'Premium, vuosikertomustyylinen asettelu ohjelmistokehittäjille, tietoturva-, tekoäly- ja pilviammattilaisille. Laivastonsininen ja kuninkaansininen väripaletti, pyöreä profiilikuva, aikajanamuotoinen kokemus sekä oma palkki ydinvahvuuksille ja projekteille.',
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
