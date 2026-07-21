// Creative template config — magazine-style layout with violet accents.
// Two-column split with a violet-tinted sidebar. Categorized skills, icon-list links.
// Bold violet name, violet section titles, and violet-tinted cards throughout.
export default {
  // Outer document border — violet-tinted border, white bg
  preview: () => 'border-violet-200 bg-white shadow-none',

  // Header strip — richer violet tint with violet bottom accent border
  headerColor: () => 'bg-violet-100 text-gray-900 border-b-2 border-violet-500',

  // Full name heading — extrabold, violet color, extra-large
  headerTitle: () => 'mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem] text-violet-600',

  // Professional title — medium weight, muted gray
  headerSubtitle: () => 'mt-2 text-base font-medium leading-7 sm:text-lg text-gray-500',

  // Section headings — bold, violet color, standard tracking
  sectionTitle: () => 'text-sm font-bold tracking-wide text-violet-600',

  // Main content section wrapper — violet-tinted bottom border
  mainSection: () => 'border-b border-violet-100 pb-6',

  // Sidebar container — violet-tinted background with rounded corners
  sideContainer: () => 'space-y-5 rounded-2xl bg-violet-50/60 p-5 sm:space-y-5 sm:p-6 print:rounded-none print:bg-transparent print:p-0',

  // Individual sidebar section — white card with violet border
  sideSection: () => 'rounded-xl border border-violet-100 bg-white/80 p-4 print:border-0 print:px-0',

  // Skill tag pill — rounded-full, violet fill, violet text
  skillTag: () => 'rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700',

  // Timeline left-border color — violet
  timelineBorder: () => 'border-violet-200',

  // Timeline dot circle color — violet fill
  timelineDot: () => 'border-white bg-violet-500',

  // Education card — white card with violet border
  educationCard: () => 'rounded-lg border border-violet-100 bg-white px-4 py-3',

  // Link card — white card with violet border
  linkCard: () => 'rounded-lg border border-violet-100 bg-white px-4 py-3',

  // Split-column grid — wider main (1.3fr), narrower sidebar (0.9fr)
  splitColumns: () => 'grid gap-6 sm:gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(200px,0.9fr)] md:gap-8 print:grid-cols-1',

  // Accent color — violet for ATS mode badge tinting
  accentColor: () => ({ light: 'violet', dark: 'violet' }),

  // Summary badge — violet border and fill
  summaryBadge: () => 'border border-violet-200 bg-violet-50 text-violet-700',

  // Profile photo border — violet
  photoBorder: () => 'border-violet-200',

  // About section header bottom-border color
  aboutBorder: () => 'border-slate-100',

  // Experience rendering — role and company shown separately
  experienceLayout: 'clean',

  // Skills rendering — grouped by category with violet labels
  skillsLayout: 'categorized',

  // Links rendering — icon + label + value
  linksLayout: 'icon-list',

  // Color class for categorized skill group headings — violet
  categoryLabelColor: 'text-violet-400',

  // Color class for link icons and labels — violet
  linkIconColor: 'text-violet-400',

  // Header contact line mode — 'icons' with violet accent
  headerContactMode: 'icons',

  // Gap between contact items in header
  headerContactGap: 'gap-x-3',

  // Text size for contact items in header
  headerContactTextSize: 'text-[0.72rem]',

  // Text color for contact items in header
  headerContactTextColor: 'text-gray-500',

  // Icon color class for contact icons — violet
  headerContactIconColor: 'text-violet-400',
}
