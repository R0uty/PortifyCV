// Executive template config — premium, understated design for senior leadership.
// Left-border sidebar with slate color palette. Categorized skills, icon-list links.
// Commanding name, clean dividers, generous spacing. No timeline dots on experience.
export default {
  // Outer document border — slate-tinted, white bg
  preview: () => 'border-slate-300 bg-white shadow-none',

  // Header strip — white bg, slate bottom border
  headerColor: () => 'bg-white text-gray-900 border-b border-slate-300',

  // Full name heading — extrabold, large, dark
  headerTitle: () => 'mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem]',

  // Professional title — medium weight, muted gray
  headerSubtitle: () => 'mt-2 text-base font-medium leading-7 sm:text-lg text-gray-500',

  // Section headings — tiny uppercase, wide tracking, slate color
  sectionTitle: () => 'text-[0.7rem] font-bold uppercase tracking-[0.28em] text-slate-600',

  // Main content section wrapper — slate-tinted bottom border, extra padding
  mainSection: () => 'border-b border-slate-200 pb-7',

  // Sidebar container — left border divider (not right like developer)
  sideContainer: () => 'space-y-5 border-l border-slate-200 pl-5 print:border-0 print:pl-0 print:p-0',

  // Individual sidebar section — clean spacing, no card wrapper
  sideSection: () => 'py-4 first:pt-0',

  // Skill tag pill — small, slate-tinted background
  skillTag: () => 'rounded-sm border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700',

  // Timeline left-border color — slate
  timelineBorder: () => 'border-slate-300',

  // Timeline dot circle color — slate fill
  timelineDot: () => 'border-white bg-slate-600',

  // Education card — bottom border separator, no background
  educationCard: () => 'border-b border-slate-100 py-3',

  // Link card — bottom border separator
  linkCard: () => 'border-b border-slate-100 py-2',

  // Split-column grid — standard ratios (same as default)
  splitColumns: () => 'grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1.62fr)_minmax(200px,0.88fr)] md:gap-8 print:grid-cols-1',

  // Accent color — none for executive (uses slate palette directly)
  accentColor: () => null,

  // Summary badge — slate border and fill
  summaryBadge: () => 'border border-slate-200 bg-slate-50 text-slate-700',

  // Profile photo border — slate-tinted with background
  photoBorder: (isDark) => isDark ? 'border border-slate-200 bg-slate-50 text-slate-700' : 'border border-slate-200 bg-slate-50 text-slate-700',

  // About section header bottom-border color
  aboutBorder: () => 'border-slate-100',

  // Experience rendering — role and company separately, no timeline dots
  experienceLayout: 'clean',

  // Skills rendering — grouped by category with slate labels
  skillsLayout: 'categorized',

  // Links rendering — icon + label + value
  linksLayout: 'icon-list',

  // Color class for categorized skill group headings — slate
  categoryLabelColor: 'text-slate-400',

  // Color class for link icons and labels — slate
  linkIconColor: 'text-slate-400',

  // Header contact line mode — 'icons' with slate accent, wider gap
  headerContactMode: 'icons',

  // Gap between contact items in header — wider than other templates
  headerContactGap: 'gap-x-4',

  // Text size for contact items in header
  headerContactTextSize: 'text-[0.72rem]',

  // Text color for contact items in header — slate
  headerContactTextColor: 'text-slate-500',

  // Icon color class for contact icons — slate
  headerContactIconColor: 'text-slate-400',
}
