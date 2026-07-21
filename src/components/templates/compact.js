// Compact template config — dense single-column layout for fitting more content on one page.
// Dark header, small margins, tight spacing throughout. Traditional timeline experience.
// Flat skills, card-style links. All sizes reduced for maximum information density.
export default {
  // Outer document border — adapts to dark/light mode
  preview: (isDark) => isDark ? 'border-gray-800 bg-black shadow-black/30' : 'border-black/10 bg-white shadow-black/10',

  // Header strip — dark background, white text, subtle bottom border
  headerColor: (isDark) => isDark
    ? 'bg-gray-900 text-white border-b border-gray-700'
    : 'bg-gray-800 text-white border-b border-gray-600',

  // Full name heading — bold, smaller than other templates
  headerTitle: () => 'mt-1 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl',

  // Professional title — small, gray text
  headerSubtitle: (isDark) => `mt-1 text-sm leading-6 sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-300'}`,

  // Section headings — tiny uppercase, tight tracking
  sectionTitle: () => 'text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gray-500',

  // Main content section — thin bottom border, minimal padding
  mainSection: (isDark) => isDark
    ? 'border-b border-gray-800 pb-3'
    : 'border-b border-gray-200 pb-3',

  // Sidebar container — default dark rounded container
  sideContainer: (isDark) => isDark
    ? 'space-y-6 rounded-3xl bg-black/60 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0'
    : 'space-y-6 rounded-3xl bg-gray-50 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0',

  // Individual sidebar section — default dark card
  sideSection: (isDark) => isDark
    ? 'rounded-3xl border border-gray-800 bg-black/50 p-5 transition-colors print:border-0 print:px-0'
    : 'rounded-3xl border border-black/10 bg-white/80 p-5 transition-colors print:border-0 print:px-0',

  // Skill tag pill — tiny, flat, gray border
  skillTag: (isDark) => isDark
    ? 'rounded-sm border border-gray-700 bg-transparent px-2 py-1 text-[0.65rem] font-semibold text-gray-300'
    : 'rounded-sm border border-gray-300 bg-transparent px-2 py-1 text-[0.65rem] font-semibold text-gray-700',

  // Timeline left-border color — adapts to dark/light mode
  timelineBorder: (isDark) => isDark ? 'border-gray-700' : 'border-black/10',

  // Timeline dot circle color — adapts to dark/light mode
  timelineDot: (isDark) => isDark ? 'border-black bg-gray-400' : 'border-white bg-gray-600',

  // Education card — thin bottom border, minimal padding
  educationCard: (isDark) => isDark
    ? 'border-b border-gray-800 py-2'
    : 'border-b border-gray-200 py-2',

  // Link card — thin bottom border, minimal padding
  linkCard: (isDark) => isDark
    ? 'border-b border-gray-800 py-1.5'
    : 'border-b border-gray-200 py-1.5',

  // Split-column grid — standard ratios
  splitColumns: () => 'grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1.62fr)_minmax(200px,0.88fr)] md:gap-8 print:grid-cols-1',

  // Accent color — none for compact
  accentColor: () => null,

  // Summary badge — dark fill, muted text
  summaryBadge: (isDark) => isDark
    ? 'bg-gray-900 text-gray-300'
    : 'bg-gray-100 text-gray-500',

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

  // Marks this as the compact variant — triggers smaller sizes and tighter spacing
  isCompact: true,
}
