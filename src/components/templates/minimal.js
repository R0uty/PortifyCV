// Minimal template config — clean white design with thin separators, no decorative elements.
// Contact info shown as pipe-separated text in the header.
// Flat skill tags, inline link labels, clean experience layout without timeline dots.
export default {
  // Outer document border and background — white bg, subtle shadow
  preview: () => 'border-black/10 bg-white shadow-none',

  // Header strip — warm neutral background, dark text, thin bottom border
  headerColor: () => 'bg-stone-100 text-gray-900 border-b border-stone-300',

  // Full name heading — bold, large, tight tracking
  headerTitle: () => 'mt-1 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl',

  // Professional title / subtitle — muted gray, standard weight
  headerSubtitle: () => 'mt-1.5 text-sm leading-6 text-gray-500',

  // Section headings — tiny uppercase with wide letter-spacing
  sectionTitle: () => 'text-[0.65rem] font-bold uppercase tracking-[0.28em] text-gray-500',

  // Main content section wrapper — bottom border separator
  mainSection: () => 'border-b border-gray-200 pb-6',

  // Sidebar container — minimal has no split layout, so empty
  sideContainer: () => '',

  // Individual sidebar section — unused for stacked layout
  sideSection: () => '',

  // Skill tag pill — small, flat, gray border, no fill
  skillTag: () => 'rounded-sm border border-gray-200 bg-transparent px-2.5 py-1 text-[0.7rem] font-medium text-gray-600',

  // Timeline left-border color for experience entries (timeline-dot layout only)
  timelineBorder: () => 'border-gray-300',

  // Timeline dot circle color (timeline-dot layout only)
  timelineDot: () => 'border-white bg-gray-400',

  // Education card wrapper — simple bottom border, no background
  educationCard: () => 'py-2',

  // Link card wrapper — minimal padding only
  linkCard: () => 'py-1.5',

  // Split-column grid ratios (used when templateConfig.layout === 'split')
  splitColumns: () => 'grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1.62fr)_minmax(200px,0.88fr)] md:gap-8 print:grid-cols-1',

  // Accent color for ATS-friendly mode badge tinting — none for minimal
  accentColor: () => null,

  // Summary badge pill in the About section header
  summaryBadge: () => 'bg-gray-100 text-gray-500',

  // Profile photo border color
  photoBorder: () => 'border-black/10',

  // About section header bottom-border color
  aboutBorder: () => 'border-slate-100',

  // Experience rendering mode — 'clean' shows role/company separately, no timeline dots
  experienceLayout: 'clean',

  // Skills rendering mode — 'flat' shows all tags in a single flex row
  skillsLayout: 'flat',

  // Links rendering mode — 'minimal-inline' shows label:value pairs inline
  linksLayout: 'minimal-inline',

  // Color class for categorized skill group headings (unused in flat mode)
  categoryLabelColor: 'text-gray-400',

  // Color class for link icons in icon-list mode (unused in minimal-inline mode)
  linkIconColor: '',

  // Header contact line mode — 'piped' renders pipe-separated values
  headerContactMode: 'piped',

  // Gap between contact items in header
  headerContactGap: 'gap-x-2',

  // Text size for contact items in header
  headerContactTextSize: 'text-[0.7rem]',

  // Text color for contact items in header
  headerContactTextColor: 'text-gray-500',

  // Icon color class for contact icons (null = no icons rendered)
  headerContactIconColor: null,
}
