// Classic template config — a calm, left-aligned letterhead CV. Ink on
// ivory: near-black typography, thin warm-gray rules, no accent color, no
// sidebar, no photo, no timeline. A sibling to Classic Professional, but
// left-aligned rather than centered and with roomier whitespace.
// The generic-path fields below are the ATS-mode fallback (CVPreview.jsx
// falls back to them whenever atsFriendlyMode is on, bypassing
// ClassicShowcase.jsx entirely) — kept monochrome to match.
export default {
  // Outer document border — plain, no shadow
  preview: () => 'border-stone-200 bg-white shadow-none',

  // Header strip — plain bg, thin bottom border, no color, left-aligned
  headerColor: () => 'bg-white text-stone-900 border-b border-stone-300',

  // Full name heading — large, left-aligned. (The bespoke Showcase applies
  // a system serif font-family via CSS for the calm classic look; this
  // generic-path fallback stays on the app's one self-hosted typeface,
  // Inter — bold weight substitutes for serif here.)
  headerTitle: () => 'mt-2 text-4xl font-bold tracking-tight sm:text-5xl',

  // Professional title — left-aligned, uppercase, letter-spaced
  headerSubtitle: () => 'mt-2 text-sm font-medium uppercase tracking-[0.2em] text-stone-500',

  // Section headings — uppercase, no accent color
  sectionTitle: () => 'text-xs font-bold uppercase tracking-[0.2em] text-stone-900',

  // Main content section wrapper — thin bottom border only
  mainSection: () => 'border-b border-stone-200 pb-6',

  // Sidebar container — unused (single-column layout)
  sideContainer: () => 'space-y-5',

  // Individual sidebar section — unused
  sideSection: () => 'py-4 first:pt-0',

  // Skill tag pill — small outlined pill, monochrome
  skillTag: () => 'rounded-sm border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700',

  // Timeline — unused (no timeline dots)
  timelineBorder: () => 'border-stone-300',
  timelineDot: () => 'border-white bg-stone-700',

  // Education card — plain, no background
  educationCard: () => 'py-2',

  // Link card — plain, no background
  linkCard: () => 'py-1.5',

  // Split-column grid — unused (single column), kept for shape consistency
  splitColumns: () => 'grid gap-5 md:grid-cols-1',

  // Accent color — neutral only, no color anywhere in this template
  accentColor: () => ({ light: 'stone', dark: 'stone' }),

  // Summary badge — plain
  summaryBadge: () => 'border border-stone-300 bg-stone-50 text-stone-700',

  // Profile photo — not used by this template
  photoBorder: () => 'border-black/10',

  // About section header bottom-border color
  aboutBorder: () => 'border-stone-200',

  // Experience rendering — clean entries, no timeline dots
  experienceLayout: 'clean',

  // Skills rendering — flat row of outlined pills
  skillsLayout: 'flat',

  // Links rendering — plain text list
  linksLayout: 'icon-list',

  // Color classes — unused (monochrome template)
  categoryLabelColor: 'text-stone-400',
  linkIconColor: 'text-stone-400',

  // Header contact line — personal (email/phone/location) with icons, plus
  // LinkedIn pulled in via the Showcase directly (see component)
  headerContactMode: 'personal',
  headerContactGap: 'gap-x-4',
  headerContactTextSize: 'text-[0.72rem]',
  headerContactTextColor: 'text-stone-600',
  headerContactIconColor: 'text-stone-500',

  // ── Classic Showcase config (non-ATS mode) ──
  // Read by ClassicShowcase.jsx via CVPreview's `showcaseConfig={t}` prop.
  // No photo, no sidebar — single calm column.
  showPhoto: false,
  printOptimized: true,
}
