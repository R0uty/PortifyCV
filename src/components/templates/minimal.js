export default {
  // Document
  preview: () => 'border border-black/10 bg-white shadow-sm',

  // Header
  headerColor: () => 'bg-white text-gray-900 border-b border-gray-200',

  headerTitle: () =>
    'text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl',

  headerSubtitle: () =>
    'mt-2 text-base text-gray-500',

  // Section headings
  sectionTitle: () =>
    'text-[0.7rem] font-bold uppercase tracking-[0.32em] text-amber-700',

  // Content sections
  mainSection: () =>
    'border-b border-gray-200 pb-7 last:border-none',

  sideContainer: () => '',
  sideSection: () => '',

  // Skills
  skillTag: () =>
    'rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-[0.72rem] font-medium text-amber-700',

  // Experience
  timelineBorder: () => 'border-amber-300',
  timelineDot: () => 'border-white bg-amber-500',

  // Cards
  educationCard: () => 'py-2.5',
  linkCard: () => 'py-2',

  // Layout
  splitColumns: () =>
    'grid gap-8 md:grid-cols-[minmax(0,1.7fr)_minmax(220px,0.85fr)] print:grid-cols-1',

  // Accent
  accentColor: () => ({
    light: 'amber',
    dark: 'amber',
  }),

  summaryBadge: () =>
    'rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700',

  photoBorder: () => 'border border-gray-200',

  aboutBorder: () => 'border-gray-200',

  // Rendering modes
  experienceLayout: 'clean',
  skillsLayout: 'flat',

  // Links appear ONLY in the dedicated Links section
  linksLayout: 'minimal-inline',

  categoryLabelColor: 'text-amber-700',
  linkIconColor: '',

  // Header contact (email • phone • location only)
  headerContactMode: 'piped',
  headerContactGap: 'gap-x-3',
  headerContactTextSize: 'text-xs',
  headerContactTextColor: 'text-gray-500',
  headerContactIconColor: null,

  // Don't display portfolio/GitHub/LinkedIn in the header
  showHeaderLinks: false,
  showHeaderSocials: false,
}