// European template config — a Europass-adjacent, genuinely minimal
// one-page layout: every section reads as a label/value table (dates,
// categories, link types) rather than flowing prose. The non-ATS visual is
// EuropeanShowcase.jsx. This config is only consumed by the shared flat
// renderer, which European falls through to in ATS-friendly mode (the
// label/value grid and one-page auto-fit are Showcase-only flourishes,
// never load-bearing for ATS parsing).

// Registry default accent — must match `accent.default` for `european` in
// cvTemplates.js exactly (lowercase hex). See docs/template-design-system.md §6.
export const EUROPEAN_DEFAULT_ACCENT_COLOR = '#1d4ed8'

export default {
  // Outer document border — plain white, no shadow
  preview: () => 'border-gray-200 bg-white shadow-none',

  // Header strip — white bg, thin blue bottom border
  headerColor: () => 'bg-white text-gray-900 border-b-2 border-blue-300',

  // Full name heading — large, left-aligned bold sans
  headerTitle: () => 'mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl',

  // Professional title — blue accent, medium weight
  headerSubtitle: () => 'mt-2 text-base font-semibold text-blue-700',

  // Section headings — uppercase, tracked
  sectionTitle: () => 'text-sm font-bold uppercase tracking-[0.14em] text-gray-900',

  // Main content section wrapper — thin bottom border only
  mainSection: () => 'border-b border-gray-200 pb-6',

  // Sidebar container — unused (single-column layout, no secondary sections)
  sideContainer: () => 'space-y-5',

  // Individual sidebar section — unused
  sideSection: () => 'py-4 first:pt-0',

  // Skill tag pill — small outlined pill
  skillTag: () => 'rounded-sm border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700',

  // Timeline — unused (no timeline dots)
  timelineBorder: () => 'border-gray-300',
  timelineDot: () => 'border-white bg-blue-700',

  // Education card — plain, no background
  educationCard: () => 'py-2',

  // Link card — plain, no background
  linkCard: () => 'py-1.5',

  // Split-column grid — unused (single column), kept for shape consistency
  splitColumns: () => 'grid gap-5 md:grid-cols-1',

  // Accent color — blue, matching the Showcase's default accent
  accentColor: () => ({ light: 'blue', dark: 'blue' }),

  // Summary badge — blue border and fill
  summaryBadge: () => 'border border-blue-200 bg-blue-50 text-blue-700',

  // Profile photo border — blue
  photoBorder: () => 'border-blue-200',

  // About section header bottom-border color
  aboutBorder: () => 'border-gray-200',

  // Experience rendering — clean entries, no timeline dots
  experienceLayout: 'clean',

  // Skills rendering — flat row of outlined pills
  skillsLayout: 'flat',

  // Links rendering — plain text list
  linksLayout: 'icon-list',

  // Color classes for the shared flat renderer
  categoryLabelColor: 'text-gray-400',
  linkIconColor: 'text-blue-400',

  // Header contact line — personal (email/phone/location)
  headerContactMode: 'personal',
  headerContactGap: 'gap-x-4',
  headerContactTextSize: 'text-[0.72rem]',
  headerContactTextColor: 'text-gray-600',
  headerContactIconColor: 'text-blue-400',
}
