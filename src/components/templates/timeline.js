// Modern Timeline template config — single-column, restrained modern layout
// built around a vertical timeline for Experience and Education. One
// customizable accent color (violet by default) — see
// TimelineShowcase.jsx's `accentColor` prop for how the user's swatch
// choice overrides this config's static violet. The generic-path fields
// below are the ATS-mode fallback (CVPreview.jsx falls back to them
// whenever atsFriendlyMode is on, bypassing TimelineShowcase.jsx entirely,
// and ATS mode always renders monochrome regardless of accent — so the
// user's custom color choice never needs to reach this file).

// Lives here (a plain config object, always eagerly bundled — see
// components/templates/index.js) rather than in TimelineShowcase.jsx
// itself, since that component is React.lazy()-loaded and non-component
// callers (uiReducer.js's default state) need this constant without
// pulling the lazy chunk into the eager bundle.
export const TIMELINE_DEFAULT_ACCENT_COLOR = '#6d28d9'

export default {
  // Outer document border — plain white, no shadow
  preview: () => 'border-gray-200 bg-white shadow-none',

  // Header strip — white bg, thin bottom border
  headerColor: () => 'bg-white text-gray-900 border-b border-gray-300',

  // Full name heading — bold, large
  headerTitle: () => 'mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl',

  // Professional title — violet accent, uppercase
  headerSubtitle: () => 'mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-violet-600',

  // Section headings — violet accent
  sectionTitle: () => 'text-xs font-bold uppercase tracking-[0.2em] text-violet-600',

  // Main content section wrapper — thin bottom border
  mainSection: () => 'border-b border-gray-200 pb-6',

  // Sidebar container — unused (single-column layout, no secondary sections)
  sideContainer: () => 'space-y-5',

  // Individual sidebar section — unused
  sideSection: () => 'py-4 first:pt-0',

  // Skill tag pill — small outlined pill, violet
  skillTag: () => 'rounded-md border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700',

  // Timeline left-border and dot — violet
  timelineBorder: () => 'border-violet-300',
  timelineDot: () => 'border-white bg-violet-600',

  // Education card — plain, no background
  educationCard: () => 'py-2',

  // Link card — plain, no background
  linkCard: () => 'py-1.5',

  // Split-column grid — unused (single column), kept for shape consistency
  splitColumns: () => 'grid gap-5 md:grid-cols-1',

  // Accent color — violet for ATS badge tinting
  accentColor: () => ({ light: 'violet', dark: 'violet' }),

  // Summary badge — violet tint
  summaryBadge: () => 'border border-violet-200 bg-violet-50 text-violet-700',

  // Profile photo border — violet
  photoBorder: () => 'border-violet-200',

  // About section header bottom-border color
  aboutBorder: () => 'border-violet-100',

  // Experience rendering — clean entries, no timeline dots (the generic ATS
  // fallback keeps its own simple styling; the real timeline visual only
  // exists in TimelineShowcase.jsx's non-ATS mode)
  experienceLayout: 'clean',

  // Skills rendering — flat row of outlined pills
  skillsLayout: 'flat',

  // Links rendering — plain text list
  linksLayout: 'icon-list',

  // Color classes for the generic-path fallback
  categoryLabelColor: 'text-violet-400',
  linkIconColor: 'text-violet-400',

  // Header contact line — personal (email/phone/location) with icons
  headerContactMode: 'personal',
  headerContactGap: 'gap-x-4',
  headerContactTextSize: 'text-[0.72rem]',
  headerContactTextColor: 'text-gray-600',
  headerContactIconColor: 'text-violet-500',

  // ── Timeline Showcase config (non-ATS mode) ──
  // Read by TimelineShowcase.jsx via CVPreview's `showcaseConfig={t}` prop.
  showPhoto: true,
  printOptimized: true,
}
