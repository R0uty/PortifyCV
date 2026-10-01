// Executive template config — premium, understated "boardroom" design. The
// non-ATS visual is ExecutiveShowcase.jsx (warm-charcoal ink, one gold accent
// read from --tpl-accent, a warm-neutral left rail, rule-under headings). This
// config is only consumed by the shared flat renderer, which Executive falls
// through to in ATS-friendly mode (monochrome there — the amber-* classes
// below only matter if the flat path renders Executive in non-ATS mode, which
// it never does).

// Registry default accent — must match `accent.default` for `executive` in
// cvTemplates.js exactly (lowercase hex). See docs/template-design-system.md §6.
export const EXECUTIVE_DEFAULT_ACCENT_COLOR = '#b45309'

export default {
  // Outer document border — slate-tinted, white bg
  preview: () => 'border-slate-300 bg-white shadow-none',

  // Header strip — white bg, amber accent border
  headerColor: () => 'bg-white text-gray-900 border-b border-amber-200',

  // Full name heading — extrabold, large, dark
  headerTitle: () => 'mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem]',

  // Professional title — medium weight, muted gray
  headerSubtitle: () => 'mt-2 text-base font-medium leading-7 sm:text-lg text-gray-500',

  // Section headings — tiny uppercase, wide tracking, amber accent
  sectionTitle: () => 'text-[0.7rem] font-bold uppercase tracking-[0.28em] text-amber-600',

  // Main content section wrapper — slate-tinted bottom border, extra padding
  mainSection: () => 'border-b border-slate-200 pb-7',

  // Sidebar container — left border divider (not right like developer)
  sideContainer: () => 'space-y-5 border-l border-slate-200 pl-5 print:border-0 print:pl-0 print:p-0',

  // Individual sidebar section — clean spacing, no card wrapper
  sideSection: () => 'py-4 first:pt-0',

  // Skill tag pill — small, amber-tinted background
  skillTag: () => 'rounded-sm border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700',

  // Timeline left-border color — amber
  timelineBorder: () => 'border-amber-300',

  // Timeline dot circle color — amber fill
  timelineDot: () => 'border-white bg-amber-600',

  // Education card — bottom border separator, no background
  educationCard: () => 'border-b border-slate-100 py-3',

  // Link card — bottom border separator
  linkCard: () => 'border-b border-slate-100 py-2',

  // Split-column grid — standard ratios (same as default)
  splitColumns: () => 'grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1.62fr)_minmax(200px,0.88fr)] md:gap-8 print:grid-cols-1',

  // Accent color — amber for ATS badge tinting
  accentColor: () => ({ light: 'amber', dark: 'amber' }),

  // Summary badge — amber border and fill
  summaryBadge: () => 'border border-amber-200 bg-amber-50 text-amber-700',

  // Profile photo border — slate-tinted with background
  photoBorder: (isDark) => isDark ? 'border border-slate-200 bg-slate-50 text-slate-700' : 'border border-slate-200 bg-slate-50 text-slate-700',

  // About section header bottom-border color — amber
  aboutBorder: () => 'border-amber-100',

  // Experience rendering — role and company separately, no timeline dots
  experienceLayout: 'clean',

  // Skills rendering — grouped by category with slate labels
  skillsLayout: 'categorized',

  // Links rendering — icon + label + value
  linksLayout: 'icon-list',

  // Color class for categorized skill group headings — amber
  categoryLabelColor: 'text-amber-400',

  // Color class for link icons and labels — amber
  linkIconColor: 'text-amber-400',

  // Header contact line mode — 'personal' (email/phone/location) with slate accent,
  // wider gap. GitHub/LinkedIn/Portfolio/website stay out of the header; Links only.
  headerContactMode: 'personal',

  // Gap between contact items in header — wider than other templates
  headerContactGap: 'gap-x-4',

  // Text size for contact items in header
  headerContactTextSize: 'text-[0.72rem]',

  // Text color for contact items in header — amber
  headerContactTextColor: 'text-amber-500',

  // Icon color class for contact icons — amber
  headerContactIconColor: 'text-amber-400',

  // ── Executive Showcase config (non-ATS "boardroom" mode) ──
  // Read by ExecutiveShowcase.jsx via CVPreview's `showcaseConfig={t}` prop.
  // Each flag defaults to true inside the component, so omitting one here
  // still renders a fully-featured showcase.
  showPhoto: true,
  showSidebar: true,
  showExecutiveTagline: true,
  showMetrics: true,
  printOptimized: true,
}
