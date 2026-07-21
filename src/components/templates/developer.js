// Developer template config — technical two-column layout with a clean sidebar.
// Sidebar holds skills, links, and certifications. Main column focuses on experience.
// Sidebar renders first (order-1) via sidebarFirst flag. Uses categorized skills and icon-list links.
export default {
  // Outer document border and background — white bg, no shadow
  preview: () => 'border-gray-200 bg-white shadow-none',

  // Header strip — white background, dark text, thin bottom border
  headerColor: () => 'bg-white text-gray-900 border-b border-gray-200',

  // Full name heading — bold, large
  headerTitle: () => 'mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl',

  // Professional title — medium weight, muted gray
  headerSubtitle: () => 'mt-1.5 text-sm font-medium leading-6 text-gray-500',

  // Section headings — tiny uppercase, tight tracking
  sectionTitle: () => 'text-[0.65rem] font-bold uppercase tracking-[0.22em] text-gray-500',

  // Main content section wrapper — bottom border separator
  mainSection: () => 'border-b border-gray-200 pb-6',

  // Sidebar container — right border divider, compact padding
  sideContainer: () => 'space-y-5 border-r border-gray-200 pr-5 print:border-0 print:pr-0 print:p-0',

  // Individual sidebar section — clean spacing, no card wrapper
  sideSection: () => 'py-4 first:pt-0',

  // Skill tag pill — small, flat, gray border, monospace feel
  skillTag: () => 'rounded-sm border border-gray-200 bg-transparent px-2 py-0.5 text-[0.68rem] font-medium text-gray-600',

  // Timeline left-border color — adapts to dark/light mode
  timelineBorder: (isDark) => isDark ? 'border-gray-700' : 'border-gray-300',

  // Timeline dot circle color — adapts to dark/light mode
  timelineDot: (isDark) => isDark ? 'border-black bg-gray-400' : 'border-white bg-gray-600',

  // Education card wrapper — simple bottom padding, no background
  educationCard: () => 'py-2',

  // Link card wrapper — minimal padding only
  linkCard: () => 'py-1.5',

  // Split-column grid — narrow sidebar (0.3fr), wide main (0.7fr)
  splitColumns: () => 'grid gap-6 md:grid-cols-[minmax(160px,0.3fr)_minmax(0,0.7fr)] md:gap-8 print:grid-cols-1',

  // Accent color for ATS-friendly mode badge tinting — none for developer
  accentColor: () => null,

  // Summary badge pill in the About section header
  summaryBadge: () => 'border border-gray-200 bg-gray-50 text-gray-600',

  // Profile photo border color
  photoBorder: () => 'border-black/10',

  // About section header bottom-border color
  aboutBorder: () => 'border-slate-100',

  // Experience rendering — role and company shown separately, no timeline dots
  experienceLayout: 'clean',

  // Skills rendering — grouped by category (Languages, Frameworks, etc.)
  skillsLayout: 'categorized',

  // Links rendering — icon + label + value in a vertical list
  linksLayout: 'icon-list',

  // Color class for categorized skill group headings
  categoryLabelColor: 'text-gray-400',

  // Color class for link icons and labels
  linkIconColor: '',

  // Header contact line mode — 'icons' renders icon + value pairs
  headerContactMode: 'icons',

  // Header top-row layout (name/details block + optional photo block)
  headerLayoutClass: 'flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between',

  // Gap between contact items in header
  headerContactGap: 'gap-x-3',

  // Icon-contact wrapper classes (header <div>)
  headerContactContainerClass: 'mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5',

  // Icon-contact item classes (header <span>)
  headerContactItemClass: 'inline-flex items-center gap-1.5 whitespace-nowrap text-[0.7rem] leading-5 text-gray-500',

  // Icon wrapper classes for consistent header icon sizing/alignment
  headerContactIconWrapClass: 'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-gray-400',

  // Text size for contact items in header
  headerContactTextSize: 'text-[0.7rem]',

  // Text color for contact items in header
  headerContactTextColor: 'text-gray-500',

  // Icon color class for contact icons (null = default gray)
  headerContactIconColor: null,

  // Custom content area padding — wider than default for the two-column layout
  contentPadding: 'px-6 py-6 sm:px-8 sm:py-6 print:px-0 print:py-6',

  // Sidebar renders first (order-1) so it appears on the left
  sidebarFirst: true,
}
