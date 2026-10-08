export default {
  // Document
  preview: () => 'min-doc border border-black/10 shadow-sm',

  // Header
  headerColor: () => 'min-header border-b',

  headerTitle: () =>
    'text-4xl font-bold tracking-tight min-ink lg:text-5xl',

  headerSubtitle: () =>
    'mt-2 text-base min-muted',

  // Section headings
  sectionTitle: () =>
    'text-[0.7rem] font-bold uppercase tracking-[0.32em] min-accent-ink',

  // Content sections
  mainSection: () =>
    'border-b min-border pb-7 last:border-none',

  sideContainer: () => '',
  sideSection: () => '',

  // Skills
  skillTag: () =>
    'rounded border min-tag px-2.5 py-1 text-[0.72rem] font-medium',

  // Experience
  timelineBorder: () => 'min-rule',
  timelineDot: () => 'border-white bg-amber-500',

  // Cards
  educationCard: () => 'py-2.5',
  linkCard: () => 'py-2',

  // Layout
  splitColumns: () =>
    'grid gap-8 md:grid-cols-[minmax(0,1.7fr)_minmax(220px,0.85fr)] print:grid-cols-1',

  // Accent
  accentTextClass: 'min-accent-text',
  accentColor: () => ({
    light: 'amber',
    dark: 'amber',
  }),

  summaryBadge: () =>
    'rounded min-badge px-2 py-1 text-xs font-medium',

  photoBorder: () => 'border min-border',

  aboutBorder: () => 'min-border',

  // Rendering modes
  experienceLayout: 'clean',
  skillsLayout: 'flat',

  // Links appear ONLY in the dedicated Links section
  linksLayout: 'minimal-inline',

  categoryLabelColor: 'min-accent-ink',
  linkIconColor: '',

  // Header contact — plain pipe-separated email/phone/location, no icons (matches
  // the minimalist "no decorative elements" philosophy). GitHub/LinkedIn/Portfolio/
  // website never appear here; they live exclusively in the dedicated Links section.
  headerContactMode: 'piped',
  headerContactGap: 'gap-x-3',
  headerContactTextSize: 'text-xs',
  headerContactTextColor: 'min-muted',
  headerContactIconColor: null,
}