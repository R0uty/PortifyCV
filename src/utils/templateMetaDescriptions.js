// English-only meta descriptions for the per-template pages
// (/free-cv-templates/<slug>), read by pageMeta.js's VIEW_HEAD. Split out
// of templatePageCopy.js so the entry chunk (which imports pageMeta.js)
// only pulls in this small, English-only map instead of every template's
// bilingual bestFor/tips copy too — those are only needed by
// TemplateDetailPage.jsx, which is lazy-loaded.
//
// English-only like every other VIEW_HEAD description (the worker serves
// it before any locale is known). 50–160 characters; check:template-pages
// enforces the bounds.
export const TEMPLATE_META_DESCRIPTIONS = {
  developer:
    'Free Developer CV template: dark sidebar for your stack, project and open-source cards up front. Live examples, PDF and Word export, no login.',
  minimal:
    'Free Minimalist CV template: typography-only layout, thin dividers, no sidebar at all. Live examples, instant export, no login.',
  creative:
    'Free Creative CV template: editorial two-column layout, numbered sections, one customizable accent color, no login.',
  modern:
    'Free Modern Professional CV template: consulting-style layout with a rose timeline and circular photo, no login.',
  executive:
    'Free Executive CV template: boardroom layout, no timeline, one customizable accent — leads with outcomes, no login.',
  timeline:
    'Free Modern Timeline CV template: single column with a vertical career timeline, one customizable accent, no login.',
  graduate:
    'Free Graduate CV template: education-first layout leading with your degree, projects, and internships, no login.',
  compact:
    'Free Compact CV template: dense one-pager with a customizable accent that auto-shrinks to fit everything, no login.',
  portfolio:
    'Free Portfolio Hybrid CV template: project cards, case studies, and tech-stack badges lead the page, no login.',
  techExec:
    'Free Tech Executive CV template: navy masthead and footer band, core-strengths sidebar, leadership tone, no login.',
  classicProfessional:
    'Free Classic Professional CV template: traditional single column, thin dividers, a serif name you can center, no login.',
  navyProfessional:
    'Free Navy Professional CV template: dark navy sidebar, blue accents, a clear two-column layout, no login.',
  modernOrange:
    'Free Modern Orange CV template: cream sidebar, orange accent, dot-rated skills and dual timelines, no login.',
  colorfulCompact:
    'Free Colorful Compact CV template: dark header, tight two-column body, each section in its own accent color, no login.',
  quadrant:
    'Free Quadrant CV template: a literal 2x2 grid of identity, summary, work history, and extras, no login.',
  editorial:
    'Free Editorial CV template: magazine-style single column, oversized byline, numbered sections, no login.',
  portrait:
    'Free Portrait CV template: a full-height photo fills the left column, every section flows on the right, no login.',
  european:
    'Free European CV template: a Europass-style label/value table layout that auto-fits one page, no login.',
}
