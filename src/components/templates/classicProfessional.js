// Classic Professional template config — traditional single-column CV.
// White background, black/gray typography only, no accent color, no sidebar.
// Centered serif-style name, uppercase section headings, thin dividers.
// The generic-path fields below are the ATS-mode fallback (CVPreview.jsx
// falls back to them whenever atsFriendlyMode is on, bypassing
// ClassicProfessionalShowcase.jsx entirely) — kept monochrome to match.
export default {
  // Outer document border — plain white, no shadow (matches the reference's
  // flat, no-decoration brief)
  preview: () => 'border-gray-200 bg-white shadow-none',

  // Header strip — white bg, thin bottom border, no color
  headerColor: () => 'bg-white text-gray-900 border-b border-gray-300',

  // Full name heading — large, centered. (The bespoke Showcase applies a
  // system serif font-family via CSS for the traditional look the
  // reference image calls for; this generic-path fallback stays on the
  // app's one self-hosted typeface, Inter, per item 9/14's "no new font
  // files" constraint — bold weight substitutes for serif here.)
  headerTitle: () => 'mt-2 text-center text-4xl font-bold tracking-tight sm:text-5xl',

  // Professional title — centered, uppercase, letter-spaced
  headerSubtitle: () => 'mt-2 text-center text-sm font-medium uppercase tracking-[0.2em] text-gray-500',

  // Section headings — uppercase, no accent color
  sectionTitle: () => 'text-xs font-bold uppercase tracking-[0.2em] text-gray-900',

  // Main content section wrapper — thin bottom border only
  mainSection: () => 'border-b border-gray-200 pb-6',

  // Sidebar container — unused (single-column layout, no secondary sections)
  sideContainer: () => 'space-y-5',

  // Individual sidebar section — unused
  sideSection: () => 'py-4 first:pt-0',

  // Skill tag pill — small outlined pill, monochrome
  skillTag: () => 'rounded-sm border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700',

  // Timeline — unused (this template has no timeline dots)
  timelineBorder: () => 'border-gray-300',
  timelineDot: () => 'border-white bg-gray-700',

  // Education card — plain, no background
  educationCard: () => 'py-2',

  // Link card — plain, no background
  linkCard: () => 'py-1.5',

  // Split-column grid — unused (single column), kept for shape consistency
  splitColumns: () => 'grid gap-5 md:grid-cols-1',

  // Accent color — neutral gray only, no color anywhere in this template
  accentColor: () => ({ light: 'gray', dark: 'gray' }),

  // Summary badge — plain gray
  summaryBadge: () => 'border border-gray-300 bg-gray-50 text-gray-700',

  // Profile photo — not used by this template (no photo in the reference)
  photoBorder: () => 'border-black/10',

  // About section header bottom-border color
  aboutBorder: () => 'border-gray-200',

  // Experience rendering — clean entries, no timeline dots
  experienceLayout: 'clean',

  // Skills rendering — flat row of outlined pills
  skillsLayout: 'flat',

  // Links rendering — plain text list
  linksLayout: 'icon-list',

  // Color classes — unused (monochrome template)
  categoryLabelColor: 'text-gray-400',
  linkIconColor: 'text-gray-400',

  // Header contact line — personal (email/phone/location) with icons, plus
  // LinkedIn pulled in via the Showcase directly (see component)
  headerContactMode: 'personal',
  headerContactGap: 'gap-x-4',
  headerContactTextSize: 'text-[0.72rem]',
  headerContactTextColor: 'text-gray-600',
  headerContactIconColor: 'text-gray-500',

  // ── Classic Professional Showcase config (non-ATS mode) ──
  // Read by ClassicProfessionalShowcase.jsx via CVPreview's
  // `showcaseConfig={t}` prop. This template deliberately has no photo and
  // no sidebar — single traditional column, per the "no sidebar, no
  // colored background" brief.
  showPhoto: false,
  printOptimized: true,
}
