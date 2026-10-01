// Portrait template config — a full-height, full-bleed photo fills the left
// column; identity and every section flow in the main column on the right.
// The non-ATS visual is PortraitShowcase.jsx. This config is only consumed
// by the shared flat renderer, which Portrait falls through to in
// ATS-friendly mode (a modest circular photo there, same generic handling
// every other bespoke template gets — the full-bleed hero photo is a
// Showcase-only flourish, never load-bearing for ATS parsing).

// Registry default accent — must match `accent.default` for `portrait` in
// cvTemplates.js exactly (lowercase hex). See docs/template-design-system.md §6.
export const PORTRAIT_DEFAULT_ACCENT_COLOR = '#0f766e'

export default {
  // Outer document border — plain white, no shadow
  preview: () => 'border-gray-200 bg-white shadow-none',

  // Header strip — white bg, thin teal bottom border
  headerColor: () => 'bg-white text-gray-900 border-b-2 border-teal-300',

  // Full name heading — large, left-aligned bold sans
  headerTitle: () => 'mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl',

  // Professional title — teal accent, medium weight
  headerSubtitle: () => 'mt-2 text-base font-semibold text-teal-700',

  // Section headings — uppercase, tracked, with a rule-under hairline
  // (handled generically by the shared renderer's border classes)
  sectionTitle: () => 'text-sm font-bold uppercase tracking-[0.14em] text-gray-900',

  // Main content section wrapper — thin bottom border only
  mainSection: () => 'border-b border-gray-200 pb-6',

  // Sidebar container — unused (single-column content layout, no secondary
  // sections; the photo rail is a Showcase-only structural element)
  sideContainer: () => 'space-y-5',

  // Individual sidebar section — unused
  sideSection: () => 'py-4 first:pt-0',

  // Skill tag pill — small outlined pill
  skillTag: () => 'rounded-sm border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700',

  // Timeline — unused (no timeline dots)
  timelineBorder: () => 'border-gray-300',
  timelineDot: () => 'border-white bg-teal-700',

  // Education card — plain, no background
  educationCard: () => 'py-2',

  // Link card — plain, no background
  linkCard: () => 'py-1.5',

  // Split-column grid — unused (single column), kept for shape consistency
  splitColumns: () => 'grid gap-5 md:grid-cols-1',

  // Accent color — teal, matching the Showcase's default accent
  accentColor: () => ({ light: 'teal', dark: 'teal' }),

  // Summary badge — teal border and fill
  summaryBadge: () => 'border border-teal-200 bg-teal-50 text-teal-700',

  // Profile photo border — teal
  photoBorder: () => 'border-teal-200',

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
  linkIconColor: 'text-teal-400',

  // Header contact line — personal (email/phone/location)
  headerContactMode: 'personal',
  headerContactGap: 'gap-x-4',
  headerContactTextSize: 'text-[0.72rem]',
  headerContactTextColor: 'text-gray-600',
  headerContactIconColor: 'text-teal-400',
}
