// Editorial template config — magazine-style single column, no sidebar.
// The non-ATS visual is EditorialShowcase.jsx (numbered section headings,
// an oversized masthead name, one accent read from --tpl-accent). This
// config is only consumed by the shared flat renderer, which Editorial
// falls through to in ATS-friendly mode (fully monochrome-adjacent there —
// the accent classes below only matter if the flat path is ever taught to
// render Editorial in non-ATS mode, which it currently never does).

// Registry default accent — must match `accent.default` for `editorial` in
// cvTemplates.js exactly (lowercase hex). See docs/template-design-system.md §6.
export const EDITORIAL_DEFAULT_ACCENT_COLOR = '#9f1239'

export default {
  // Outer document border — plain white, no shadow
  preview: () => 'border-gray-200 bg-white shadow-none',

  // Header strip — white bg, thin rose bottom border (rose is the closest
  // stocked hue to the Showcase's crimson accent — see accentColor below)
  headerColor: () => 'bg-white text-gray-900 border-b-2 border-rose-300',

  // Full name heading — large, left-aligned bold sans (masthead voice, not
  // Classic Professional's centered serif)
  headerTitle: () => 'mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.2rem]',

  // Professional title — rose accent, medium weight
  headerSubtitle: () => 'mt-2 text-base font-semibold text-rose-700',

  // Section headings — uppercase, tracked, ink only (the numbered ordinal
  // carries the accent, not the label — see EditorialShowcase.jsx)
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
  timelineDot: () => 'border-white bg-rose-700',

  // Education card — plain, no background
  educationCard: () => 'py-2',

  // Link card — plain, no background
  linkCard: () => 'py-1.5',

  // Split-column grid — unused (single column), kept for shape consistency
  splitColumns: () => 'grid gap-5 md:grid-cols-1',

  // Accent color — rose, the closest stocked hue to the Showcase's crimson
  accentColor: () => ({ light: 'rose', dark: 'rose' }),

  // Summary badge — rose border and fill
  summaryBadge: () => 'border border-rose-200 bg-rose-50 text-rose-700',

  // Profile photo border — rose
  photoBorder: () => 'border-rose-200',

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
  linkIconColor: 'text-rose-400',

  // Header contact line — personal (email/phone/location)
  headerContactMode: 'personal',
  headerContactGap: 'gap-x-4',
  headerContactTextSize: 'text-[0.72rem]',
  headerContactTextColor: 'text-gray-600',
  headerContactIconColor: 'text-rose-400',
}
