// Timeline template config — chronological storytelling with a bold vertical timeline.
// Cyan accent color throughout. Categorized skills, icon-list links.
// Clean white header, bold name, colored nodes marking sections.
export default {
  // Outer document border — cyan-tinted, white bg
  preview: () => 'border-cyan-200 bg-white shadow-none',

  // Header strip — white bg, transparent bottom border (gradient applied via CSS)
  headerColor: () => 'bg-white text-gray-900 border-b-2 border-transparent',

  // Full name heading — extrabold, large, commanding
  headerTitle: () => 'mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem]',

  // Professional title — medium weight, muted gray
  headerSubtitle: () => 'mt-2 text-base font-medium leading-7 sm:text-lg text-gray-500',

  // Section headings — tiny uppercase, cyan color
  sectionTitle: () => 'text-[0.7rem] font-bold uppercase tracking-[0.22em] text-cyan-600',

  // Main content section wrapper — cyan-tinted bottom border
  mainSection: () => 'border-b border-cyan-100 pb-6',

  // Sidebar container — cyan-tinted background with rounded corners
  sideContainer: () => 'space-y-5 rounded-xl border border-cyan-100 bg-cyan-50/40 p-5 sm:space-y-5 sm:p-6 print:rounded-none print:bg-transparent print:p-0',

  // Individual sidebar section — white card with cyan border
  sideSection: () => 'rounded-lg border border-cyan-100 bg-white p-4 print:border-0 print:px-0',

  // Skill tag pill — rounded-full, cyan fill, cyan text
  skillTag: () => 'rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700',

  // Timeline left-border color — vibrant cyan
  timelineBorder: () => 'border-cyan-300',

  // Timeline dot circle color — vibrant cyan fill
  timelineDot: () => 'border-white bg-cyan-500',

  // Education card — cyan-tinted background with rounded corners
  educationCard: () => 'rounded-lg border border-cyan-100 bg-cyan-50/40 px-4 py-3',

  // Link card — cyan-tinted background with rounded corners
  linkCard: () => 'rounded-lg border border-cyan-100 bg-cyan-50/40 px-4 py-3',

  // Split-column grid — standard ratios
  splitColumns: () => 'grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1.62fr)_minmax(200px,0.88fr)] md:gap-8 print:grid-cols-1',

  // Accent color — cyan for ATS mode badge tinting
  accentColor: () => ({ light: 'cyan', dark: 'cyan' }),

  // Summary badge — cyan border and fill
  summaryBadge: () => 'border border-cyan-200 bg-cyan-50 text-cyan-700',

  // Profile photo border — cyan
  photoBorder: () => 'border-cyan-200',

  // About section header bottom-border color
  aboutBorder: () => 'border-slate-100',

  // Experience rendering — role and company shown separately
  experienceLayout: 'clean',

  // Skills rendering — grouped by category with cyan labels
  skillsLayout: 'categorized',

  // Links rendering — icon + label + value
  linksLayout: 'icon-list',

  // Color class for categorized skill group headings — cyan
  categoryLabelColor: 'text-cyan-400',

  // Color class for link icons and labels — cyan
  linkIconColor: 'text-cyan-400',

  // Header contact line mode — 'icons' with cyan accent
  headerContactMode: 'icons',

  // Gap between contact items in header
  headerContactGap: 'gap-x-3',

  // Text size for contact items in header
  headerContactTextSize: 'text-[0.72rem]',

  // Text color for contact items in header
  headerContactTextColor: 'text-gray-500',

  // Icon color class for contact icons — cyan
  headerContactIconColor: 'text-cyan-500',
}
