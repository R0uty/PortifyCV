// Quadrant template config — the one template built around a literal 2x2
// grid instead of a single/split column. Cyan accent (the one primary hue
// none of the other 14 templates use yet — see cvTemplates.js for the
// survey). Non-ATS mode is a fully bespoke Showcase (QuadrantShowcase.jsx);
// everything below is what ATS-friendly mode falls back to, same as every
// other bespoke template.
export default {
  // Outer document border — cyan-tinted, white bg
  preview: () => 'border-cyan-200 bg-white shadow-none',

  // Header strip — cyan-tinted background, dark text
  headerColor: () => 'bg-cyan-50 text-gray-900 border-b border-cyan-200',

  // Full name heading — bold, large
  headerTitle: () => 'mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl',

  // Professional title — medium weight, cyan accent
  headerSubtitle: () => 'mt-1.5 text-sm font-medium leading-6 text-cyan-700',

  // Section headings — small uppercase, wide tracking, cyan accent
  sectionTitle: () => 'text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-700',

  // Main content section wrapper — bottom border separator
  mainSection: () => 'border-b border-gray-200 pb-6',

  // Sidebar container — left border divider
  sideContainer: () => 'space-y-5 border-l border-gray-200 pl-5 print:border-0 print:pl-0 print:p-0',

  // Individual sidebar section — clean spacing, no card wrapper
  sideSection: () => 'py-4 first:pt-0',

  // Skill tag pill — small, cyan-tinted
  skillTag: () => 'rounded-sm border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700',

  // Timeline left-border color — cyan
  timelineBorder: () => 'border-cyan-300',

  // Timeline dot circle color — cyan fill
  timelineDot: () => 'border-white bg-cyan-600',

  // Education card — bottom border separator, no background
  educationCard: () => 'border-b border-gray-100 py-3',

  // Link card — bottom border separator
  linkCard: () => 'border-b border-gray-100 py-2',

  // Split-column grid — standard ratios (used by the ATS-mode flat fallback)
  splitColumns: () => 'grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1.62fr)_minmax(200px,0.88fr)] md:gap-8 print:grid-cols-1',

  // Accent color for ATS badge tinting — cyan
  accentColor: () => ({ light: 'cyan', dark: 'cyan' }),

  // Summary badge — cyan border and fill
  summaryBadge: () => 'border border-cyan-200 bg-cyan-50 text-cyan-700',

  // Profile photo border
  photoBorder: () => 'border border-cyan-200 bg-cyan-50 text-cyan-700',

  // About section header bottom-border color — cyan
  aboutBorder: () => 'border-cyan-100',

  // Experience rendering — role and company shown separately, no timeline dots
  experienceLayout: 'clean',

  // Skills rendering — grouped by category
  skillsLayout: 'categorized',

  // Links rendering — icon + label + value
  linksLayout: 'icon-list',

  // Color class for categorized skill group headings — cyan
  categoryLabelColor: 'text-cyan-600',

  // Color class for link icons and labels — cyan
  linkIconColor: 'text-cyan-600',

  // Header contact line mode — 'personal' renders email/phone/location with icons
  headerContactMode: 'personal',

  headerContactGap: 'gap-x-3',
  headerContactTextSize: 'text-[0.7rem]',
  headerContactTextColor: 'text-cyan-700',
  headerContactIconColor: 'text-cyan-500',

  // ── Quadrant Showcase config (read by QuadrantShowcase.jsx) ──
  // Everything below only applies to the non-ATS "Quadrant" grid mode.
  showPhoto: true,
  printOptimized: true,
}
