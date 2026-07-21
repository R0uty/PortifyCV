// Modern Professional template config — dark blue header with split-column layout.
// Blue accent color. Flat skills, card-style links. Traditional timeline experience.
// Sidebar holds skills and links, main column holds experience and education.
export default {
  // Outer document border — adapts to dark/light mode, rounded with shadow
  preview: (isDark) => isDark ? 'border-gray-800 bg-black shadow-black/30' : 'border-black/10 bg-white shadow-black/10',

  // Header strip — dark slate background, white text
  headerColor: () => 'bg-slate-900 text-white',

  // Full name heading — semibold, large
  headerTitle: () => 'mt-2 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl',

  // Professional title — blue-tinted subtitle text
  headerSubtitle: (isDark) => `mt-2 text-base leading-7 sm:text-lg ${isDark ? 'text-blue-400' : 'text-blue-100'}`,

  // Section headings — blue color, uses shared base classes
  sectionTitle: (previewSectionTitleClasses) => `${previewSectionTitleClasses} text-blue-600`,

  // Main content section — dark rounded card with border
  mainSection: (isDark) => isDark
    ? 'rounded-3xl border border-gray-800 bg-black/50 p-5 sm:p-6 print:border-0 print:px-0'
    : 'rounded-3xl border border-black/10 bg-gray-50/80 p-5 sm:p-6 print:border-0 print:px-0',

  // Sidebar container — blue-tinted background with rounded corners
  sideContainer: (isDark) => isDark
    ? 'space-y-6 rounded-2xl border border-blue-900/40 bg-blue-950/30 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0'
    : 'space-y-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0',

  // Individual sidebar section — blue-tinted card
  sideSection: (isDark) => isDark
    ? 'rounded-xl border border-blue-900/30 bg-black/30 p-4 print:border-0 print:px-0'
    : 'rounded-xl border border-blue-100 bg-white/80 p-4 print:border-0 print:px-0',

  // Skill tag pill — blue fill with border
  skillTag: (isDark) => isDark
    ? 'rounded-lg border border-blue-800 bg-blue-900/40 px-3 py-1.5 text-xs font-semibold text-blue-300'
    : 'rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700',

  // Timeline left-border color — blue
  timelineBorder: (isDark) => isDark ? 'border-blue-800' : 'border-blue-300',

  // Timeline dot circle color — blue fill
  timelineDot: (isDark) => isDark ? 'border-gray-950 bg-blue-400' : 'border-white bg-blue-600',

  // Education card — dark rounded card
  educationCard: (isDark) => isDark
    ? 'rounded-2xl border border-gray-800 bg-gray-950/60 px-4 py-4'
    : 'rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4',

  // Link card — dark rounded card
  linkCard: (isDark) => isDark
    ? 'rounded-2xl border border-gray-800 bg-gray-950/60 px-4 py-3'
    : 'rounded-2xl border border-gray-200 bg-white px-4 py-3',

  // Split-column grid — standard ratios
  splitColumns: () => 'grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1.62fr)_minmax(200px,0.88fr)] md:gap-8 print:grid-cols-1',

  // Accent color — blue for ATS mode badge tinting
  accentColor: () => ({ light: 'blue', dark: 'blue' }),

  // Summary badge — blue border and fill
  summaryBadge: (isDark) => isDark
    ? 'border border-blue-800 bg-blue-900/40 text-blue-300'
    : 'border border-blue-200 bg-blue-50 text-blue-700',

  // Profile photo border — adapts to dark/light mode
  photoBorder: (isDark) => isDark ? 'border-white/15' : 'border-black/10',

  // About section header bottom-border color — adapts to dark/light mode
  aboutBorder: (isDark) => isDark ? 'border-white/6' : 'border-black/5',

  // Experience rendering — traditional timeline with dots and left-border
  experienceLayout: 'timeline',

  // Skills rendering — flat row of tags
  skillsLayout: 'flat',

  // Links rendering — card-style with label and value
  linksLayout: 'cards',

  // Color class for categorized skill group headings (unused in flat mode)
  categoryLabelColor: 'text-gray-400',

  // Color class for link icons (unused in cards mode)
  linkIconColor: '',

  // Header contact line mode — null means no contact line in header
  headerContactMode: null,

  // No contact line properties needed
  headerContactGap: null,
  headerContactTextSize: null,
  headerContactTextColor: null,
  headerContactIconColor: null,
}
