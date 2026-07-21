// Portfolio hybrid template config — project-focused layout for developers and creatives.
// Emerald accent color. Split-column with emerald-tinted sidebar. Traditional timeline experience.
// Emerald header, project cards, card-style links. Ideal for freelancers and designers.
export default {
  // Outer document border — adapts to dark/light mode
  preview: (isDark) => isDark ? 'border-gray-800 bg-black shadow-black/30' : 'border-black/10 bg-white shadow-black/10',

  // Header strip — emerald background, white text, emerald bottom border
  headerColor: (isDark) => isDark
    ? 'bg-emerald-950 text-white border-b-2 border-emerald-800'
    : 'bg-emerald-600 text-white border-b-2 border-emerald-700',

  // Full name heading — bold, extra-large
  headerTitle: () => 'mt-2 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.4rem]',

  // Professional title — emerald-tinted subtitle text
  headerSubtitle: (isDark) => `mt-2 text-base leading-7 sm:text-lg ${isDark ? 'text-emerald-300' : 'text-emerald-100'}`,

  // Section headings — emerald color
  sectionTitle: (previewSectionTitleClasses) => `${previewSectionTitleClasses} text-emerald-600`,

  // Main content section — default dark rounded card
  mainSection: (isDark) => isDark
    ? 'rounded-3xl border border-gray-800 bg-black/50 p-5 sm:p-6 print:border-0 print:px-0'
    : 'rounded-3xl border border-black/10 bg-gray-50/80 p-5 sm:p-6 print:border-0 print:px-0',

  // Sidebar container — emerald-tinted background with rounded corners
  sideContainer: (isDark) => isDark
    ? 'space-y-6 rounded-2xl border border-emerald-900/40 bg-emerald-950/30 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0'
    : 'space-y-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0',

  // Individual sidebar section — emerald-tinted card
  sideSection: (isDark) => isDark
    ? 'rounded-xl border border-emerald-900/30 bg-black/30 p-4 print:border-0 print:px-0'
    : 'rounded-xl border border-emerald-100 bg-white/80 p-4 print:border-0 print:px-0',

  // Skill tag pill — emerald fill with border
  skillTag: (isDark) => isDark
    ? 'rounded-lg border border-emerald-800 bg-emerald-900/40 px-3 py-1.5 text-xs font-semibold text-emerald-300'
    : 'rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700',

  // Timeline left-border color — emerald
  timelineBorder: (isDark) => isDark ? 'border-emerald-800' : 'border-emerald-300',

  // Timeline dot circle color — emerald fill
  timelineDot: (isDark) => isDark ? 'border-gray-950 bg-emerald-400' : 'border-white bg-emerald-600',

  // Education card — default dark card
  educationCard: (isDark) => isDark
    ? 'rounded-2xl border border-gray-800 bg-gray-950/60 px-4 py-4'
    : 'rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4',

  // Link card — emerald-tinted background
  linkCard: (isDark) => isDark
    ? 'rounded-lg border border-emerald-900/30 bg-emerald-950/20 px-4 py-3'
    : 'rounded-lg border border-emerald-100 bg-emerald-50/40 px-4 py-3',

  // Split-column grid — wider main (1.4fr), narrower sidebar (0.9fr)
  splitColumns: () => 'grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(200px,0.9fr)] md:gap-8 print:grid-cols-1',

  // Accent color — emerald for ATS mode badge tinting
  accentColor: () => ({ light: 'emerald', dark: 'emerald' }),

  // Summary badge — emerald border and fill
  summaryBadge: (isDark) => isDark
    ? 'border border-emerald-800 bg-emerald-900/40 text-emerald-300'
    : 'border border-emerald-200 bg-emerald-50 text-emerald-700',

  // Profile photo border — adapts to dark/light mode
  photoBorder: (isDark) => isDark ? 'border-white/15' : 'border-black/10',

  // About section header bottom-border color
  aboutBorder: (isDark) => isDark ? 'border-white/6' : 'border-black/5',

  // Experience rendering — traditional timeline with dots
  experienceLayout: 'timeline',

  // Skills rendering — flat row of tags
  skillsLayout: 'flat',

  // Links rendering — card-style
  linksLayout: 'cards',

  // Color class for categorized skill group headings (unused in flat mode)
  categoryLabelColor: 'text-gray-400',

  // Color class for link icons (unused in cards mode)
  linkIconColor: '',

  // Header contact line — disabled
  headerContactMode: null,
  headerContactGap: null,
  headerContactTextSize: null,
  headerContactTextColor: null,
  headerContactIconColor: null,
}
