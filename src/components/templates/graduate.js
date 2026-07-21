// Graduate template config — education-focused for entry-level candidates.
// Indigo accent color. Education section listed first. Traditional timeline experience.
// Indigo-tinted header, rounded section cards, flat skills, card-style links.
export default {
  // Outer document border — adapts to dark/light mode
  preview: (isDark) => isDark ? 'border-gray-800 bg-black shadow-black/30' : 'border-black/10 bg-white shadow-black/10',

  // Header strip — indigo background, white text, indigo bottom border
  headerColor: (isDark) => isDark
    ? 'bg-indigo-950 text-white border-b-2 border-indigo-800'
    : 'bg-indigo-600 text-white border-b-2 border-indigo-700',

  // Full name heading — semibold, large
  headerTitle: () => 'mt-2 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl',

  // Professional title — indigo-tinted subtitle text
  headerSubtitle: (isDark) => `mt-2 text-base leading-7 sm:text-lg ${isDark ? 'text-indigo-300' : 'text-indigo-100'}`,

  // Section headings — indigo color
  sectionTitle: (previewSectionTitleClasses) => `${previewSectionTitleClasses} text-indigo-600`,

  // Main content section — indigo-tinted rounded card
  mainSection: (isDark) => isDark
    ? 'rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-5 sm:p-6 print:border-0 print:px-0'
    : 'rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 sm:p-6 print:border-0 print:px-0',

  // Sidebar container — default dark rounded container
  sideContainer: (isDark) => isDark
    ? 'space-y-6 rounded-3xl bg-black/60 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0'
    : 'space-y-6 rounded-3xl bg-gray-50 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0',

  // Individual sidebar section — default dark card
  sideSection: (isDark) => isDark
    ? 'rounded-3xl border border-gray-800 bg-black/50 p-5 transition-colors print:border-0 print:px-0'
    : 'rounded-3xl border border-black/10 bg-white/80 p-5 transition-colors print:border-0 print:px-0',

  // Skill tag pill — indigo fill with border
  skillTag: (isDark) => isDark
    ? 'rounded-lg border border-indigo-800 bg-indigo-900/40 px-3 py-1.5 text-xs font-semibold text-indigo-300'
    : 'rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700',

  // Timeline left-border color — indigo
  timelineBorder: (isDark) => isDark ? 'border-indigo-700' : 'border-indigo-300',

  // Timeline dot circle color — indigo fill
  timelineDot: (isDark) => isDark ? 'border-gray-950 bg-indigo-400' : 'border-white bg-indigo-600',

  // Education card — indigo-tinted rounded card
  educationCard: (isDark) => isDark
    ? 'rounded-xl border border-indigo-900/30 bg-indigo-950/30 px-4 py-3'
    : 'rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3',

  // Link card — default dark card
  linkCard: (isDark) => isDark
    ? 'rounded-2xl border border-gray-800 bg-gray-950/60 px-4 py-3'
    : 'rounded-2xl border border-gray-200 bg-white px-4 py-3',

  // Split-column grid — standard ratios
  splitColumns: () => 'grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1.62fr)_minmax(200px,0.88fr)] md:gap-8 print:grid-cols-1',

  // Accent color — indigo for ATS mode badge tinting
  accentColor: () => ({ light: 'indigo', dark: 'indigo' }),

  // Summary badge — indigo border and fill
  summaryBadge: (isDark) => isDark
    ? 'border border-indigo-800 bg-indigo-900/40 text-indigo-300'
    : 'border border-indigo-200 bg-indigo-50 text-indigo-700',

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
