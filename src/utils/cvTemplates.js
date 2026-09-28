export const defaultTemplateId = 'minimal'

const templateMap = {
  minimal: {
    id: 'minimal',
    // Wiring a new template's accent is a 3-step opt-in — see docs/template-design-system.md §6.
    // `accent.default` must be the lowercase hex of that template's
    // `*_DEFAULT_ACCENT_COLOR` constant in `src/components/templates/<id>.js`
    // (same colour, exact string match — CSS hex is case-insensitive but the
    // registry and the constant should agree exactly).
    accent: null,
    label: 'Minimalist',
    description: 'Typography only, thin dividers, contact details in the header — a clean, no-frills layout that works for any role.',
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
    // Opts out of the Settings accent swatch (§6): the fixed teal→blue→purple
    // cool-spectrum gradient is the template's concept, like Colorful Compact's
    // capped rainbow — not a single configurable hue.
    accent: null,
    label: 'Developer',
    description: 'Dark sidebar with project and achievement cards — a strong fit if your work is naturally project-based.',
    variant: 'developer',
    layout: 'split',
    columnMoves: true,
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
    accent: { default: '#e2572a', swatchSet: 'warmCoral' },
    label: 'Creative',
    description: 'Editorial two-column layout with numbered section headings, a full-width header, and a single customizable accent color. Suits any creative profession.',
    variant: 'creative',
    layout: 'split',
    columnMoves: true,
    primarySections: ['about', 'experience', 'projects'],
    secondarySections: ['skills', 'education', 'certificates', 'links', 'languages', 'interests'],
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
    accent: null,
    label: 'Modern Professional',
    description: 'Consulting-style layout with a rose timeline and circular photo — built for a clear, step-by-step career story.',
    variant: 'modern',
    layout: 'split',
    columnMoves: true,
    primarySections: ['about', 'experience', 'education', 'projects', 'achievements'],
    secondarySections: ['skills', 'languages', 'certificates', 'links', 'interests'],
    summaryBadgeLabel: 'Summary',
    thumbnail: {
      accentClassName: 'bg-rose-600',
      surfaceClassName: 'bg-rose-50',
      primaryRatioClassName: 'grid-cols-[1.5fr_0.8fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-20',
      blockWidths: ['w-full', 'w-11/12', 'w-9/12'],
      chips: ['Experience', 'Skills'],
    },
  },
  executive: {
    id: 'executive',
    accent: { default: '#b45309', swatchSet: 'warmGold' },
    label: 'Executive',
    description: 'Restrained boardroom layout with one customizable accent and no timeline — suits a CV that leads with outcomes over a chronological story.',
    variant: 'executive',
    layout: 'split',
    columnMoves: true,
    primarySections: ['about', 'experience', 'leadership', 'projects', 'achievements', 'education'],
    secondarySections: ['coreStrengths', 'skills', 'certificates', 'languages', 'memberships', 'links'],
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
    accent: { default: '#6d28d9', swatchSet: 'cool' },
    label: 'Modern Timeline',
    description: 'Single-column layout with a clean vertical timeline for your career story and a customizable accent color — restrained, modern, and suited to almost any profession.',
    variant: 'timeline',
    layout: 'stacked',
    primarySections: ['about', 'experience', 'education', 'projects', 'skills', 'languages', 'certificates'],
    secondarySections: [],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-violet-600',
      surfaceClassName: 'bg-violet-50',
      primaryRatioClassName: 'grid-cols-1',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-11/12', 'w-10/12'],
      chips: ['Timeline', 'Projects'],
    },
  },
  graduate: {
    id: 'graduate',
    accent: { default: '#4f46e5', swatchSet: 'coolIndigo' },
    label: 'Graduate',
    description: 'An education-first layout that leads with your degree, academic projects, and internships, with a customizable accent color — a strong fit when those are the strongest part of your story.',
    variant: 'graduate',
    layout: 'split',
    columnMoves: true,
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
    accent: { default: '#0284c7', swatchSet: 'coolBlue' },
    label: 'Compact',
    description: 'A tight single-column one-pager with a customizable accent that shrinks its own spacing until everything fits one page — built for a long, detailed history.',
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
    accent: { default: '#047857', swatchSet: 'forestGreen' },
    label: 'Portfolio Hybrid',
    description: 'Featured project cards, case studies, and tech-stack badges — a strong fit when your work speaks for itself through projects.',
    variant: 'portfolio',
    layout: 'split',
    columnMoves: true,
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
    accent: { default: '#2563eb', swatchSet: 'royalBlue' },
    label: 'Tech Executive',
    description: 'An annual-report layout — a deep-navy masthead and footer band around a two-column body, with a core-strengths sidebar and a customizable accent. Built for leadership-style narratives.',
    variant: 'techExec',
    layout: 'split',
    columnMoves: true,
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
  classicProfessional: {
    id: 'classicProfessional',
    accent: null,
    label: 'Classic Professional',
    description: 'Traditional single-column layout with thin dividers and a serif name you can centre or left-align — a universally safe choice for any industry.',
    variant: 'classicProfessional',
    layout: 'stacked',
    primarySections: ['about', 'experience', 'education', 'skills', 'languages', 'certificates'],
    secondarySections: [],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-gray-900',
      surfaceClassName: 'bg-gray-50',
      primaryRatioClassName: 'grid-cols-1',
      titleWidthClassName: 'w-28',
      subtitleWidthClassName: 'w-20',
      blockWidths: ['w-full', 'w-full', 'w-11/12'],
      chips: ['Summary', 'Experience'],
    },
  },
  navyProfessional: {
    id: 'navyProfessional',
    accent: null,
    label: 'Navy Professional',
    description: 'Modern two-column layout with a dark navy sidebar and blue accents — professional and ATS-friendly.',
    variant: 'navyProfessional',
    layout: 'split',
    columnMoves: true,
    primarySections: ['about', 'experience', 'education', 'certificates'],
    secondarySections: ['skills', 'languages'],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-[#16233A]',
      surfaceClassName: 'bg-blue-50',
      primaryRatioClassName: 'grid-cols-[0.31fr_0.69fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-11/12', 'w-9/12'],
      chips: ['Contact', 'Skills'],
    },
  },
  modernOrange: {
    id: 'modernOrange',
    accent: { default: '#f28c00', swatchSet: 'warm' },
    label: 'Modern Orange',
    description: 'Premium two-column layout with a warm cream sidebar, orange accents, dot-rated skills, and timelines for education and experience — suits almost any profession.',
    variant: 'modernOrange',
    layout: 'split',
    primarySections: ['about', 'experience', 'projects', 'certificates'],
    secondarySections: ['skills', 'languages', 'education'],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-[#F28C00]',
      surfaceClassName: 'bg-orange-50',
      primaryRatioClassName: 'grid-cols-[0.29fr_0.71fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-11/12', 'w-9/12'],
      chips: ['Skills', 'Timeline'],
    },
  },
  colorfulCompact: {
    id: 'colorfulCompact',
    accent: null,
    label: 'Colorful Compact',
    description: 'Dark editorial header over a tight two-column body, with every section — Skills, Experience, Projects, Languages — in its own rainbow accent color. Suits any creative or product profile.',
    variant: 'colorfulCompact',
    layout: 'split',
    columnMoves: true,
    primarySections: ['about', 'experience', 'projects'],
    secondarySections: ['skills', 'education', 'languages', 'links', 'achievements'],
    summaryBadgeLabel: 'About',
    thumbnail: {
      accentClassName: 'bg-[#16132A]',
      surfaceClassName: 'bg-gray-50',
      primaryRatioClassName: 'grid-cols-[1.65fr_1fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-11/12', 'w-9/12'],
      chips: ['Skills', 'Projects'],
    },
  },
  quadrant: {
    id: 'quadrant',
    accent: { default: '#0e7490', swatchSet: 'coolCyan' },
    label: 'Quadrant',
    description: 'A literal 2x2 grid — identity, summary and skills, work history, and everything else split into four scannable quarters, with a single customizable accent. A strong fit if you want your CV to read at a glance rather than top to bottom.',
    variant: 'quadrant',
    layout: 'split',
    primarySections: ['about', 'experience', 'projects'],
    secondarySections: ['skills', 'education', 'certificates', 'languages', 'links'],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-cyan-600',
      surfaceClassName: 'bg-gray-50',
      primaryRatioClassName: 'grid-cols-2',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-11/12', 'w-9/12'],
      chips: ['Skills', 'Education'],
    },
  },
  editorial: {
    id: 'editorial',
    accent: { default: '#9f1239', swatchSet: 'inkCrimson' },
    label: 'Editorial',
    description: 'A magazine-style single column — an oversized byline name, numbered sections, and a wide reading measure. No sidebar, no clutter.',
    variant: 'editorial',
    layout: 'stacked',
    primarySections: ['about', 'experience', 'education', 'skills', 'projects', 'links', 'languages', 'certificates'],
    secondarySections: [],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-rose-800',
      surfaceClassName: 'bg-gray-50',
      primaryRatioClassName: 'grid-cols-1',
      titleWidthClassName: 'w-28',
      subtitleWidthClassName: 'w-20',
      blockWidths: ['w-full', 'w-full', 'w-11/12'],
      chips: ['Byline', 'Sections'],
    },
  },
  portrait: {
    id: 'portrait',
    accent: { default: '#0f766e', swatchSet: 'quietTeal' },
    label: 'Portrait',
    description: 'A full-height photo fills the left column; identity and every section flow on the right, with one customizable accent. The photo is the structure, not an accent — the strongest fit if you want your face to lead.',
    variant: 'portrait',
    layout: 'stacked',
    primarySections: ['about', 'experience', 'education', 'skills', 'projects', 'links', 'languages', 'certificates'],
    secondarySections: [],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-teal-700',
      surfaceClassName: 'bg-gray-50',
      primaryRatioClassName: 'grid-cols-[0.4fr_0.6fr]',
      titleWidthClassName: 'w-24',
      subtitleWidthClassName: 'w-16',
      blockWidths: ['w-full', 'w-11/12', 'w-9/12'],
      chips: ['Photo', 'Sections'],
    },
  },
  european: {
    id: 'european',
    accent: { default: '#1d4ed8', swatchSet: 'civicBlue' },
    label: 'European',
    description: 'A Europass-adjacent, genuinely minimal one-page format — every section reads as a label/value table (dates, categories, link types) instead of flowing prose, with one customizable accent. Auto-fits one page.',
    variant: 'european',
    layout: 'stacked',
    primarySections: ['about', 'experience', 'education', 'skills', 'projects', 'links', 'languages', 'certificates'],
    secondarySections: [],
    summaryBadgeLabel: 'Profile',
    thumbnail: {
      accentClassName: 'bg-blue-700',
      surfaceClassName: 'bg-gray-50',
      primaryRatioClassName: 'grid-cols-1',
      titleWidthClassName: 'w-28',
      subtitleWidthClassName: 'w-20',
      blockWidths: ['w-full', 'w-full', 'w-11/12'],
      chips: ['Table', 'One page'],
    },
  },
}

const templateLocalization = {
  fi: {
    minimal: {
      label: 'Minimalisti',
      description: 'Pelkkää typografiaa, ohuet erottimet, yhteystiedot otsikossa — selkeä, koruton asettelu joka sopii mihin tahansa rooliin.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Esittely', 'Taidot'],
    },
    developer: {
      label: 'Kehittäjä',
      description: 'Tumma sivupalkki sekä projekti- ja saavutuskortit — toimii hyvin, jos työsi rakentuu luontevasti projektien ympärille.',
      summaryBadgeLabel: 'Painotus',
      chips: ['Kokemus', 'Stack'],
    },
    creative: {
      label: 'Luova',
      description: 'Toimituksellinen kaksipalstainen asettelu numeroiduilla osiootsikoilla, koko leveyden otsikkoalue ja yksi muokattava korostusväri. Sopii mille tahansa luovalle ammatille.',
      summaryBadgeLabel: 'Huomiot',
      chips: ['Tarina', 'Linkit'],
    },
    modern: {
      label: 'Moderni ammattilainen',
      description: 'Konsulttityylinen asettelu, roosa aikajana ja pyöreä profiilikuva — selkeä, vaihe vaiheelta etenevä uratarina.',
      summaryBadgeLabel: 'Yhteenveto',
      chips: ['Kokemus', 'Taidot'],
    },
    executive: {
      label: 'Johtaja',
      description: 'Hillitty hallitushuoneasettelu yhdellä muokattavalla aksenttivärillä, ei aikajanaa — sopii, kun CV:si nostaa tulokset kronologian edelle.',
      summaryBadgeLabel: 'Johtajaprofiili',
      chips: ['Yhteenveto', 'Johtavuus'],
    },
    timeline: {
      label: 'Moderni aikajana',
      description: 'Yksipalstainen asettelu selkeällä pystyaikajanalla urallesi ja muokattavalla aksenttivärillä — hillitty, moderni ja sopii lähes mille tahansa ammatille.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Aikajana', 'Projektit'],
    },
    graduate: {
      label: 'Tutkinto',
      description: 'Koulutuksen etusijalle nostava asettelu, joka aloittaa tutkinnostasi, akateemisista projekteista ja harjoitteluista — muokattavalla aksenttivärillä. Sopii, kun ne ovat tarinasi vahvin osa.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Koulutus', 'Taidot'],
    },
    compact: {
      label: 'Tiivis',
      description: 'Tiivis yksipalstainen yhden sivun CV muokattavalla aksenttivärillä, joka pienentää välejään automaattisesti kunnes sisältö mahtuu yhdelle sivulle — pitkälle, yksityiskohtaiselle uralle.',
      summaryBadgeLabel: 'Profiili',
      chips: ['CV', '1-sivu'],
    },
    portfolio: {
      label: 'Portfoliohybridi',
      description: 'Esittelyprojektit, tapaustutkimukset ja teknologiamerkit — sopii, kun työsi puhuu puolestaan projektien kautta.',
      summaryBadgeLabel: 'Esittely',
      chips: ['Portfolio', 'Linkit'],
    },
    techExec: {
      label: 'Tekninen johtaja',
      description: 'Vuosikertomustyylinen asettelu — syvän laivastonsininen otsikko- ja alapalkki kaksipalstaisen rungon ympärillä, ydinvahvuuksien sivupalkki ja muokattava aksenttiväri. Rakennettu johtajuustarinoille.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Vahvuudet', 'Projektit'],
    },
    classicProfessional: {
      label: 'Klassinen ammattilainen',
      description: 'Perinteinen yksipalstainen asettelu ohuilla erottimilla ja seriffinimellä, jonka voit keskittää tai tasata vasemmalle — universaalisti turvallinen valinta mille tahansa alalle.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Yhteenveto', 'Kokemus'],
    },
    navyProfessional: {
      label: 'Laivastonsininen ammattilainen',
      description: 'Moderni kaksipalstainen asettelu tummansinisellä sivupalkilla ja sinisillä aksenteilla — ammattimainen ja ATS-ystävällinen.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Yhteystiedot', 'Taidot'],
    },
    modernOrange: {
      label: 'Moderni oranssi',
      description: 'Premium-tasoinen kaksipalstainen asettelu lämpimällä kermanvärisellä sivupalkilla, oranssilla aksentilla, pisteytetyillä taidoilla sekä koulutus- ja kokemusaikajanoilla — sopii lähes mille tahansa ammatille.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Taidot', 'Aikajana'],
    },
    colorfulCompact: {
      label: 'Värikäs tiivis',
      description: 'Tumma otsikko tiiviin kaksipalstaisen rungon päällä, jossa jokainen osio — Taidot, Kokemus, Projektit, Kielet — saa oman sateenkaariväriaksentin. Sopii mille tahansa luovalle tai tuoteprofiilille.',
      summaryBadgeLabel: 'Esittely',
      chips: ['Taidot', 'Projektit'],
    },
    quadrant: {
      label: 'Neliö',
      description: 'Kirjaimellinen 2x2-ruudukko — henkilötiedot, yhteenveto ja taidot, työkokemus sekä loput tiedot omissa neljänneksissään, yhdellä muokattavalla aksenttivärillä. Sopii hyvin, jos haluat CV:n hahmottuvan yhdellä silmäyksellä ylhäältä alas lukemisen sijaan.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Taidot', 'Koulutus'],
    },
    editorial: {
      label: 'Toimituksellinen',
      description: 'Aikakauslehtityylinen yksipalstainen asettelu — suuri nimiotsikko, numeroidut osiot ja leveä lukumitta. Ei sivupalkkia, ei sotkua.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Nimiö', 'Osiot'],
    },
    portrait: {
      label: 'Muotokuva',
      description: 'Täyskorkuinen valokuva täyttää vasemman palstan; henkilötiedot ja kaikki osiot virtaavat oikealla, yhdellä muokattavalla aksenttivärillä. Kuva on itse rakenne, ei koriste — vahvin valinta, jos haluat kasvojesi johtavan.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Kuva', 'Osiot'],
    },
    european: {
      label: 'Eurooppalainen',
      description: 'Europass-henkinen, todella minimalistinen yksisivuinen muoto — jokainen osio esitetään otsikko/arvo-taulukkona (päivämäärät, luokat, linkkityypit) juoksevan tekstin sijaan, yhdellä muokattavalla aksenttivärillä. Sovittuu automaattisesti yhdelle sivulle.',
      summaryBadgeLabel: 'Profiili',
      chips: ['Taulukko', 'Yksi sivu'],
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

export function isValidTemplateId(templateId) {
  return typeof templateId === 'string' && Object.hasOwn(templateMap, templateId)
}

// A template's accent-color config: `{ default, swatchSet }` for templates
// that expose a customizable accent, or `null` for those that don't (yet).
//
// Registry rule: `accent.default` must be the lowercase hex of that
// template's `*_DEFAULT_ACCENT_COLOR` constant in
// `src/components/templates/<id>.js` — same colour, exact string match.
// Adding this entry is only step 1 of a 3-step opt-in (registry entry →
// CVPreview.jsx delegation forwards `accentColor` → the Showcase writes
// `--tpl-accent` + an ATS-mode override); see docs/template-design-system.md
// §6. A template with no `*Showcase.jsx` (only the flat renderer path, e.g.
// Minimalist) keeps `accent: null` — the flat path uses Tailwind colour
// tokens, not hex.
export function getTemplateAccent(templateId) {
  return templateMap[templateId]?.accent ?? null
}

// The accent color to render `templateId` with: the user's per-template
// override from the UI reducer's `templateAccentColors` map, else the
// template's registry default. One resolver for both call sites
// (ResumeBuilderPage.jsx's CVPreview `accentColor` prop, SettingsModal's
// active swatch).
export function resolveTemplateAccent(templateAccentColors, templateId) {
  return templateAccentColors?.[templateId] ?? getTemplateAccent(templateId)?.default
}

// `{ [templateId]: accent.default }` for every template with a non-null
// accent config. Used to seed the UI reducer's `templateAccentColors` map.
export function getAllTemplateAccents() {
  return Object.fromEntries(
    Object.values(templateMap)
      .filter((template) => template.accent)
      .map((template) => [template.id, template.accent.default]),
  )
}
