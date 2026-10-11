// Creative template config — editorial two-column layout, single coral
// accent. The non-ATS visual is CreativeShowcase.jsx (numbered section
// headings, cream page, one accent read from --tpl-accent). This config is
// only consumed by the shared flat renderer, which Creative falls through to
// in ATS-friendly mode (fully monochrome there — the accent classes below
// only matter if the flat path is ever taught to render Creative in
// non-ATS mode, which it currently never does).

// Registry default accent — must match `accent.default` for `creative` in
// cvTemplates.js exactly (lowercase hex). See docs/template-design-system.md §6.
export const CREATIVE_DEFAULT_ACCENT_COLOR = '#b43e18'

export default {
  // Outer document border — rose-tinted border, white bg
  preview: () => 'border-rose-200 bg-white shadow-none',

  // Header strip — richer rose tint with rose bottom accent border
  headerColor: () => 'bg-rose-50 text-gray-900 border-b-2 border-rose-300',

  // Full name heading — extrabold, rose color, extra-large
  headerTitle: () => 'mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem] text-rose-600',

  // Professional title — medium weight, rose accent
  headerSubtitle: () => 'mt-2 text-base font-medium leading-7 sm:text-lg text-rose-600',

  // Section headings — bold, rose color, standard tracking
  sectionTitle: () => 'text-sm font-bold tracking-wide text-rose-600',

  // Main content section wrapper — rose-tinted bottom border
  mainSection: () => 'border-b border-rose-100 pb-6',

  // Sidebar container — rose-tinted background with rounded corners
  sideContainer: () => 'space-y-5 rounded-2xl bg-rose-50/60 p-5 sm:space-y-5 sm:p-6 print:rounded-none print:bg-transparent print:p-0',

  // Individual sidebar section — white card with rose border
  sideSection: () => 'rounded-xl border border-rose-100 bg-white/80 p-4 print:border-0 print:px-0',

  // Skill tag pill — rounded-full, rose fill, rose text
  skillTag: () => 'rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700',

  // Timeline left-border color — rose
  timelineBorder: () => 'border-rose-200',

  // Timeline dot circle color — rose fill
  timelineDot: () => 'border-white bg-rose-600',

  // Education card — white card with rose border
  educationCard: () => 'rounded-lg border border-rose-100 bg-white px-4 py-3',

  // Link card — white card with rose border
  linkCard: () => 'rounded-lg border border-rose-100 bg-white px-4 py-3',

  // Split-column grid — wider main (1.3fr), narrower sidebar (0.9fr)
  splitColumns: () => 'grid gap-6 sm:gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(200px,0.9fr)] md:gap-8 print:grid-cols-1',

  // Accent color — rose for ATS mode badge tinting (closest stocked hue to
  // the Showcase's coral; the flat path is monochrome in ATS mode anyway)
  accentColor: () => ({ light: 'rose', dark: 'rose' }),

  // Summary badge — rose border and fill
  summaryBadge: () => 'border border-rose-200 bg-rose-50 text-rose-700',

  // Profile photo border — rose
  photoBorder: () => 'border-rose-200',

  // About section header bottom-border color — rose
  aboutBorder: () => 'border-rose-100',

  // Experience rendering — role and company shown separately
  experienceLayout: 'clean',

  // Skills rendering — grouped by category with rose labels
  skillsLayout: 'categorized',

  // Links rendering — icon + label + value
  linksLayout: 'icon-list',

  // Color class for categorized skill group headings — rose
  categoryLabelColor: 'text-rose-400',

  // Color class for link icons and labels — rose
  linkIconColor: 'text-rose-400',

  // Header contact line mode — 'personal' (email/phone/location) with rose accent.
  // GitHub/LinkedIn/Portfolio/website stay out of the header; they live in Links only.
  headerContactMode: 'personal',

  // Gap between contact items in header
  headerContactGap: 'gap-x-3',

  // Text size for contact items in header
  headerContactTextSize: 'text-[0.72rem]',

  // Text color for contact items in header — rose
  headerContactTextColor: 'text-rose-600',

  // Icon color class for contact icons — rose
  headerContactIconColor: 'text-rose-400',
}
