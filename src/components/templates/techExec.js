// Tech Executive template config. The non-ATS visual is now a bespoke
// TechExecShowcase.jsx (navy masthead + navy footer band around a right-rail
// body, royal-blue accent from --tpl-accent, rule-under headings). This
// config drives the shared flat renderer, which Tech Executive falls
// through to in ATS-friendly mode — its arbitrary `bg-[#163D7A]` /
// `bg-[#2563EB]` classes are stocked in utilities.css.
// Palette: Deep Navy #163D7A, Royal Blue #2563EB, Slate Gray #64748B.

// Registry default accent — must match `accent.default` for `techExec` in
// cvTemplates.js exactly (lowercase hex). See docs/template-design-system.md §6.
export const TECHEXEC_DEFAULT_ACCENT_COLOR = '#2563eb'

export default {
  // Outer document border and background — pure white, no shadow
  preview: () => 'border-[#E5E7EB] bg-white shadow-none',

  // Header strip — light royal-blue tint, thin royal-blue divider spanning the header
  headerColor: () => 'bg-[#EFF6FF] text-gray-900 border-b border-[#2563EB]',

  // Full name heading — large, extra bold, deep navy
  headerTitle: () => 'mt-2 text-4xl font-extrabold tracking-tight text-[#163D7A] sm:text-5xl',

  // Professional title — uppercase, medium weight, royal blue, wide tracking
  headerSubtitle: () => 'mt-2 text-base font-semibold uppercase tracking-[0.2em] text-[#2563EB]',

  // Section headings — small, bold, uppercase, deep navy, large tracking
  sectionTitle: () => 'text-[0.68rem] font-bold uppercase tracking-[0.26em] text-[#163D7A]',

  // Main content section wrapper — thin bottom border separator
  mainSection: () => 'border-b border-[#E5E7EB] pb-7',

  // Sidebar container — thin left border divider, comfortable padding
  sideContainer: () => 'space-y-6 border-l border-[#E5E7EB] pl-7 print:border-0 print:pl-0 print:p-0',

  // Individual sidebar section — thin bottom divider between stacked sections
  sideSection: () => 'py-4 first:pt-0 border-b border-[#E5E7EB] last:border-0',

  // Skill tag pill — subtle border, no fill color beyond a faint tint
  skillTag: () => 'rounded-sm border border-[#E5E7EB] bg-[#F8FAFC] px-2 py-1 text-[0.68rem] font-medium text-[#163D7A]',

  // Timeline left-border color — light blue
  timelineBorder: () => 'border-[#BFDBFE]',

  // Timeline dot circle — small filled royal blue circle
  timelineDot: () => 'border-white bg-[#2563EB]',

  // Education card wrapper — simple layout, no large cards
  educationCard: () => 'py-2',

  // Link card wrapper — unused by icon-list layout, kept for consistency
  linkCard: () => 'py-1.5',

  // Split-column grid — left column 65%, right column 35%, generous gap
  splitColumns: () => 'grid gap-8 md:grid-cols-[1.85fr_1fr] md:gap-9 print:grid-cols-1',

  // Accent color for ATS-friendly mode badge tinting — blue
  accentColor: () => ({ light: 'blue', dark: 'blue' }),

  // Summary badge pill in the About section header — light blue tint
  summaryBadge: () => 'border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]',

  // Profile photo border — thin blue ring
  photoBorder: () => 'border-[#BFDBFE]',

  // About section header bottom-border color
  aboutBorder: () => 'border-[#E5E7EB]',

  // Experience rendering — timeline dot + border, with role/company/location on
  // separate lines (role bold, company blue)
  experienceLayout: 'timeline-clean',
  experienceCompanyColor: 'text-[#2563EB]',

  // Skills rendering — grouped by category (Security, Development, Cloud, etc.)
  skillsLayout: 'categorized',

  // Links rendering — icon + label + value in a vertical list
  linksLayout: 'icon-list',

  // Color class for categorized skill group headings — slate gray
  categoryLabelColor: 'text-[#64748B]',

  // Color class for link icons and labels
  linkIconColor: '',

  // Header contact line — email, phone, location only (GitHub/LinkedIn/Portfolio
  // live in the Links section, never in the header)
  headerContactMode: 'personal',

  // Header top-row layout (name/title/contact block + photo block)
  headerLayoutClass: 'flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between',

  // Gap between contact items in header
  headerContactGap: 'gap-x-4',

  // Personal-contact wrapper classes (header <div>)
  headerContactContainerClass: 'mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5',

  // Personal-contact item classes (header <span>)
  headerContactItemClass: 'inline-flex items-center gap-1.5 whitespace-nowrap text-[0.75rem] leading-5 text-[#64748B]',

  // Icon wrapper classes for consistent header icon sizing/alignment
  headerContactIconWrapClass: 'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[#2563EB]',

  // Text size for contact items in header
  headerContactTextSize: 'text-[0.75rem]',

  // Text color for contact items in header
  headerContactTextColor: 'text-[#64748B]',

  // Icon color class for contact icons
  headerContactIconColor: 'text-[#2563EB]',

  // Custom content area padding
  contentPadding: 'px-6 py-7 sm:px-9 sm:py-8 print:px-0 print:py-7',

  // Small circular monochrome section icon badge (blue tint, blue glyph)
  showSectionIcons: true,
  sectionIconBg: 'bg-[#EFF6FF]',
  sectionIconColor: 'text-[#2563EB]',

  // Accent text color for project names, etc.
  accentTextClass: 'text-[#2563EB]',

  // Bullet color for the plain certificates list
  bulletColor: 'bg-[#2563EB]',

  // Circular profile photo with a thin ring and small decorative accent lines
  photoShape: 'circle',
  photoSize: '8.5rem',
  photoDecoration: true,
  photoRingColor: '#2563EB',

  // Thin navy footer strip with an optional inspirational quote
  hasFooter: true,
  footerClasses: 'bg-[#163D7A] text-white',
  footerQuote: (isFinnish) =>
    isFinnish
      ? '"Turvallisuus ei ole tuote, vaan prosessi."'
      : '"Security is not a product, but a process."',
}
