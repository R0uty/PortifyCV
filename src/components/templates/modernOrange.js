// Modern Orange template config — premium two-column CV with a light warm
// cream/orange left sidebar (photo, personal info, skills, languages,
// education timeline) and a white main column (name header with an orange
// title badge, profile, experience timeline, project cards, certifications).
// One customizable accent color (orange by default) — see
// ModernOrangeShowcase.jsx's `accentColor` prop for how the user's swatch
// choice overrides this config's static orange, same pattern as the Modern
// Timeline template. The generic-path fields below are the ATS-mode
// fallback (CVPreview.jsx falls back to them whenever atsFriendlyMode is on
// and the bespoke Showcase itself isn't rendering — though this template's
// Showcase renders in both modes, same as Navy Professional, so these
// mostly matter as a defensive default).
export const MODERN_ORANGE_DEFAULT_ACCENT_COLOR = '#a56000'

export default {
  // Outer document border — plain white, no shadow
  preview: () => 'border-gray-200 bg-white shadow-none',

  // Header strip — white bg, thin bottom border
  headerColor: () => 'bg-white text-gray-900 border-b border-gray-300',

  // Full name heading — bold, large
  headerTitle: () => 'mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl',

  // Professional title — orange accent
  headerSubtitle: () => 'mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-orange-600',

  // Section headings — orange accent
  sectionTitle: () => 'text-xs font-bold uppercase tracking-[0.2em] text-orange-600',

  // Main content section wrapper — thin bottom border
  mainSection: () => 'border-b border-gray-200 pb-6',

  // Sidebar container — warm cream tint
  sideContainer: () => 'space-y-5 rounded-2xl bg-orange-50 p-5 print:bg-transparent print:p-0',

  // Individual sidebar section
  sideSection: () => 'py-3 first:pt-0',

  // Skill tag pill — outlined, orange
  skillTag: () => 'rounded-md border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700',

  // Timeline — orange
  timelineBorder: () => 'border-orange-300',
  timelineDot: () => 'border-white bg-orange-500',

  // Education card — plain, thin border
  educationCard: () => 'border-b border-gray-100 py-3',

  // Link card — plain, thin border
  linkCard: () => 'border-b border-gray-100 py-2',

  // Split-column grid — narrow sidebar, wide main (~29% / ~71%)
  splitColumns: () => 'grid gap-6 md:grid-cols-[minmax(180px,0.29fr)_minmax(0,0.71fr)] md:gap-8 print:grid-cols-1',

  // Accent color — orange for ATS badge tinting
  accentColor: () => ({ light: 'orange', dark: 'orange' }),

  // Summary badge — orange tint
  summaryBadge: () => 'border border-orange-200 bg-orange-50 text-orange-700',

  // Profile photo border — orange ring
  photoBorder: () => 'border-orange-400',

  // About section header bottom-border color
  aboutBorder: () => 'border-orange-100',

  // Experience rendering — clean entries (the real timeline visual only
  // exists in ModernOrangeShowcase.jsx's non-ATS mode)
  experienceLayout: 'clean',

  // Skills rendering — flat row of outlined pills
  skillsLayout: 'flat',

  // Links rendering — icon + label + value
  linksLayout: 'icon-list',

  // Color classes for the generic-path fallback
  categoryLabelColor: 'text-orange-400',
  linkIconColor: 'text-orange-500',

  // Header contact line — personal (email/phone/location) with icons
  headerContactMode: 'personal',
  headerContactGap: 'gap-x-4',
  headerContactTextSize: 'text-[0.72rem]',
  headerContactTextColor: 'text-gray-600',
  headerContactIconColor: 'text-orange-500',

  // Sidebar renders first (order-1) so it appears on the left
  sidebarFirst: true,

  // ── Modern Orange Showcase config (non-ATS mode) ──
  // Read by ModernOrangeShowcase.jsx via CVPreview's `showcaseConfig={t}` prop.
  showPhoto: true,
  printOptimized: true,
}
