// Colorful Compact template config — a dark editorial header over a tight
// two-column body (wide white main, narrow gray-tinted sidebar), with every
// section given its own accent color from a fixed rainbow cycle. Built
// against docs/Colorfull-compact.png (a hand-mocked reference screenshot,
// not markup — colors/spacing are eyeballed off that image).
//
// The rainbow palette is fixed, not user-customizable (unlike Modern
// Timeline/Modern Orange's single accentColor prop) — the whole point of
// this template is that every section already has its own color. The
// fields below are only the ATS-mode fallback (CVPreview.jsx's generic
// renderer strips almost all of this to grayscale when atsFriendlyMode is
// on — see CVPreview.jsx's atsFriendlyMode ternaries — so this mostly just
// needs to be structurally sane, not color-accurate to the Showcase).
export default {
  // Outer document border — plain white, no shadow
  preview: () => 'border-gray-200 bg-white shadow-none',

  // Header strip — white bg, thin bottom border
  headerColor: () => 'bg-white text-gray-900 border-b border-gray-300',

  // Full name heading — bold, large
  headerTitle: () => 'mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl',

  // Professional title — pink accent
  headerSubtitle: () => 'mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-pink-600',

  // Section headings — pink accent
  sectionTitle: () => 'text-xs font-bold uppercase tracking-[0.2em] text-pink-600',

  // Main content section wrapper — thin bottom border
  mainSection: () => 'border-b border-gray-200 pb-6',

  // Sidebar container — light gray-blue tint
  sideContainer: () => 'space-y-5 rounded-2xl bg-slate-50 p-5 print:bg-transparent print:p-0',

  // Individual sidebar section
  sideSection: () => 'py-3 first:pt-0',

  // Skill tag pill — outlined, pink
  skillTag: () => 'rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-700',

  // Timeline — pink
  timelineBorder: () => 'border-pink-300',
  timelineDot: () => 'border-white bg-pink-500',

  // Education card — plain, thin border
  educationCard: () => 'border-b border-gray-100 py-3',

  // Link card — plain, thin border
  linkCard: () => 'border-b border-gray-100 py-2',

  // Split-column grid — wide main, narrow sidebar
  splitColumns: () => 'grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(200px,0.9fr)] md:gap-8 print:grid-cols-1',

  // Accent color — pink for ATS badge tinting
  accentColor: () => ({ light: 'pink', dark: 'pink' }),

  // Summary badge — pink tint
  summaryBadge: () => 'border border-pink-200 bg-pink-50 text-pink-700',

  // Profile photo border — pink ring
  photoBorder: () => 'border-pink-300',

  // About section header bottom-border color
  aboutBorder: () => 'border-pink-100',

  // Experience rendering — clean entries (the real per-entry accent colors
  // only exist in ColorfulCompactShowcase.jsx's non-ATS mode)
  experienceLayout: 'clean',

  // Skills rendering — flat row of pills
  skillsLayout: 'flat',

  // Links rendering — icon + label + value
  linksLayout: 'icon-list',

  // Color classes for the generic-path fallback
  categoryLabelColor: 'text-pink-400',
  linkIconColor: 'text-pink-500',

  // Header contact line — personal (email/phone/location) with icons
  headerContactMode: 'personal',
  headerContactGap: 'gap-x-4',
  headerContactTextSize: 'text-[0.72rem]',
  headerContactTextColor: 'text-gray-600',
  headerContactIconColor: 'text-pink-500',
}
