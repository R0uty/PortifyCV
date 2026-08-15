// Navy Professional template config — modern two-column CV with a full-height
// dark navy left sidebar (photo, name, contact, skills, languages) and a
// white main column (profile, experience, education, certifications) with
// blue accent headings. The generic-path fields below are the ATS-mode
// fallback (CVPreview.jsx falls back to them whenever atsFriendlyMode is
// on, bypassing NavyProfessionalShowcase.jsx entirely).
export default {
  // Outer document border — plain white, no shadow
  preview: () => 'border-gray-200 bg-white shadow-none',

  // Header strip — dark navy, white text
  headerColor: () => 'bg-slate-900 text-white',

  // Full name heading — bold, large
  headerTitle: () => 'mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl',

  // Professional title — blue accent
  headerSubtitle: () => 'mt-2 text-base leading-7 sm:text-lg text-blue-300',

  // Section headings — blue accent
  sectionTitle: () => 'text-xs font-bold uppercase tracking-[0.2em] text-blue-600',

  // Main content section wrapper — thin bottom border
  mainSection: () => 'border-b border-gray-200 pb-6',

  // Sidebar container — dark navy
  sideContainer: () => 'space-y-5 rounded-2xl bg-slate-900 p-5 text-white print:bg-transparent print:p-0 print:text-inherit',

  // Individual sidebar section
  sideSection: () => 'py-3 first:pt-0',

  // Skill tag pill — outlined, blue
  skillTag: () => 'rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700',

  // Timeline — unused (this template uses a divided entry list, not dots)
  timelineBorder: () => 'border-blue-300',
  timelineDot: () => 'border-white bg-blue-600',

  // Education card — plain, thin border
  educationCard: () => 'border-b border-gray-100 py-3',

  // Link card — plain, thin border
  linkCard: () => 'border-b border-gray-100 py-2',

  // Split-column grid — narrow sidebar, wide main (~31% / ~69%)
  splitColumns: () => 'grid gap-6 md:grid-cols-[minmax(180px,0.31fr)_minmax(0,0.69fr)] md:gap-8 print:grid-cols-1',

  // Accent color — blue for ATS badge tinting
  accentColor: () => ({ light: 'blue', dark: 'blue' }),

  // Summary badge — blue tint
  summaryBadge: () => 'border border-blue-200 bg-blue-50 text-blue-700',

  // Profile photo border — white ring (reads against the dark sidebar)
  photoBorder: () => 'border-white',

  // About section header bottom-border color
  aboutBorder: () => 'border-blue-100',

  // Experience rendering — clean entries, no timeline dots
  experienceLayout: 'clean',

  // Skills rendering — flat row of outlined pills
  skillsLayout: 'flat',

  // Links rendering — icon + label + value
  linksLayout: 'icon-list',

  // Color classes for the generic-path fallback
  categoryLabelColor: 'text-blue-400',
  linkIconColor: 'text-blue-500',

  // Header contact line — personal (email/phone/location) with icons
  headerContactMode: 'personal',
  headerContactGap: 'gap-x-4',
  headerContactTextSize: 'text-[0.72rem]',
  headerContactTextColor: 'text-blue-200',
  headerContactIconColor: 'text-blue-300',

  // Sidebar renders first (order-1) so it appears on the left
  sidebarFirst: true,

  // ── Navy Professional Showcase config (non-ATS mode) ──
  // Read by NavyProfessionalShowcase.jsx via CVPreview's
  // `showcaseConfig={t}` prop.
  showPhoto: true,
  printOptimized: true,
}
