# PortifyCV

[![CI](https://github.com/R0uty/PortifyCV/actions/workflows/ci.yml/badge.svg)](https://github.com/R0uty/PortifyCV/actions/workflows/ci.yml)

![PortifyCV — build your CV, land your dream job](public/PortifyCV2.jpg)

A modern, minimal CV builder for creating and exporting professional resumes in real-time.

## Features

- **Live Preview**: See your CV update instantly as you edit
- **10 Templates**: Minimalist, Developer, Creative, Modern Professional, Executive,
  Timeline, Graduate, Compact, Portfolio Hybrid, and Tech Executive — each template
  supports its own set of CV sections (e.g. Minimalist covers 5, Developer 11), and
  the editor and nav rail only show what the selected template actually renders
- **ATS Optimization**: Parser-readiness score, job-description keyword matching, and a
  dedicated ATS-friendly mode that flattens any template for applicant tracking systems
- **CV Suggestions**: Rule-based feedback on clarity, impact, and completeness
- **Export**: PDF (rendered, with a text-based fallback), standalone HTML, and JSON
- **Share & Import**: Generate a shareable link that carries the CV text in the URL,
  or import a JSON backup / paste raw resume text
- **Bilingual UI**: English and Finnish
- **No persistence**: No CV data is saved to a server or to browser storage; the CV lives
  in the page for as long as the tab is open. Only the UI language preference and a flag
  recording that onboarding was dismissed are remembered.

## Tech Stack

- **React 19**: UI framework with hooks
- **Vite 8**: Build tool with HMR
- **Hand-written utility CSS**: `src/index.css` is a Tailwind-alike utility layer
  (`px-4`, `flex`, `text-xs`, ...) written by hand — there is no Tailwind build step
  or dependency in this project
- **@fontsource-variable/inter**: Self-hosted variable-weight Inter, so the only
  network requests the app makes are for its own same-origin assets
- **lucide-react**: Icon set used throughout the toolbar, nav rail, and editor
- **html2canvas**: PDF design rendering
- **jsPDF**: PDF generation (page assembly runs in a Web Worker)
- **@dnd-kit**: Drag-and-drop reordering of CV entries
- **ESLint**: Code quality checks

## Development

```bash
# Install dependencies
npm install

# Start dev server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Verify the share-link codec (no browser needed)
npm run check:share

# Verify the form/UI reducers (no browser needed)
npm run check:reducers

# Run the end-to-end smoke suite against a production build
npm run test:e2e
```

`check:share` round-trips a full CV through the share-link encoder and decoder.
Run it after touching `src/utils/shareLinks.js` or the CV schema in
`src/utils/cvForm.js` — a mistyped short key silently drops a field from every
link the app generates.

`check:reducers` covers every action `cvFormReducer` and `uiReducer` handle —
field updates, array-item add/remove/duplicate/move, section reordering,
merge/reset/import, and unknown-action no-ops. Both scripts are framework-free
Node harnesses, no test runner required.

`test:e2e` runs the Playwright suite in `e2e/` (landing page, live preview,
template-gated sections, the Export menu) against `npm run build` +
`npm run preview`, not the dev server, so it exercises the app the way a real
user gets it — lazy chunks, manual vendor chunking, and all. Downloads and
installs a Chromium build the first time it runs
(`npx playwright install chromium`).

## Production Build

The production build outputs to `/dist/`:

```bash
npm run build
```

Static files are ready to be served:
- `dist/index.html` - Main entry point
- `dist/assets/` - JS and CSS bundles
- `dist/logo-mark.png` - Site icon (favicon and apple-touch-icon)
- `dist/PortifyCV.jpg` / `dist/PortifyCV2.jpg` - Brand and marketing images
  (landing page header, `og:image`/`twitter:image`, this README)

## Deployment

Deploy the `dist/` folder to any static hosting:

```bash
# GitHub Pages
npm run build
# Push dist/ to gh-pages branch

# Vercel/Netlify
npm run build
# Connect your repository and auto-deploy from main

# Traditional server
npm run build
scp -r dist/* user@server:/var/www/portifycv/
```

### Security response headers

`X-Frame-Options` and `X-Content-Type-Options` only take effect as real HTTP
response headers — browsers ignore them entirely when set via a `<meta>` tag
(Chrome logs a console error and drops it), so they can't live in
`index.html`. This repo ships the equivalent for hosts that support custom
headers:

- **Netlify** reads [`public/_headers`](public/_headers) automatically.
- **Vercel** reads [`vercel.json`](vercel.json) automatically.
- **GitHub Pages** has no custom-header mechanism at all — this protection
  isn't available on that host.
- **Traditional server**: add the same three headers (see either file above)
  in your nginx/Apache/Caddy config.

`vite.config.js`'s `server.headers`/`preview.headers` set the same headers
for `npm run dev` and `npm run preview`, but that's local-only — it doesn't
reach a real deployment.

### SPA routing fallback

PortifyCV has no server, so client-side routes like `/cv` and `/privacy`
only resolve if the host serves `index.html` for any path that isn't a real
static file. Without this, a direct visit, a page refresh, or a crawler
fetching one of those URLs gets a 404 instead of the app.

- **Netlify** reads [`public/_redirects`](public/_redirects) automatically.
- **Vercel** reads the `rewrites` block in [`vercel.json`](vercel.json)
  automatically.
- **GitHub Pages** has no rewrite mechanism, but `npm run build` already
  copies `dist/index.html` to `dist/404.html` — GitHub Pages serves
  `404.html` for any unmatched path, so `/cv` and `/privacy` resolve there
  too without extra setup.
- **Traditional server**: add an equivalent try-files/fallback rule in your
  nginx/Apache/Caddy config.

## Google SEO Setup

After deployment, complete Google indexing and performance monitoring:

1. Open Google Search Console and add your production domain.
2. Verify ownership with your preferred method (DNS TXT is recommended).
3. Submit `https://your-domain/sitemap.xml`.
4. Use Search Console "Page indexing" and "Core Web Vitals" reports to track visibility and performance.

If your live domain is not `https://portifycv.app`, update canonical/OG URLs in `index.html`, the `SITE_ORIGIN` constant in `src/App.jsx`, and the domain in `public/sitemap.xml` and `public/robots.txt`.

### AdSense readiness

The site is prepared for a Google AdSense application (privacy policy,
consent-gated ad loader, per-route canonical/title/description, working
`/cv` and `/privacy` on a direct visit) but ships with no publisher ID and
loads no ads until one is configured — see
[`docs/adsense-indexing-readiness.md`](docs/adsense-indexing-readiness.md)
for exactly what's done versus what still requires your own Google account.

## Performance

- The PDF dependencies (html2canvas + jsPDF) dominate the bundle and are loaded lazily,
  only when an export is triggered
- Gzipped CSS: ~23KB; initial gzipped JS: ~75KB
- Page-sliced PDF rendering for large multi-page CVs
- Adaptive rendering scale to prevent memory overflow

## Routes

- `/` — landing page
- `/cv` — opens the builder directly
- `/privacy` — privacy policy
- `#data=<payload>` — restores a CV from a share link (works on either route)

Share links carry the CV in the URL fragment, so it is never sent to a server. Uploaded
images (profile photo, project images) are left out of the link — a single photo is many
times larger than a URL can hold — so the recipient sees the CV without them. Export JSON
when the images need to travel too.

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge) with ES2020+ support.

## Project Documentation

- [`CHANGELOG.md`](CHANGELOG.md) — release history
- [`docs/audit-1.0.0.md`](docs/audit-1.0.0.md) — the 1.0.0 pre-release audit: what
  was checked, what was fixed, and which behaviours are deliberate
- [`docs/audit-1.0.1.md`](docs/audit-1.0.1.md) — the 1.0.1 pass: template-gated
  sections, the nav rail sync fix, and the release-readiness verdict
- [`docs/audit-1.0.2.md`](docs/audit-1.0.2.md) — a fresh audit pass: a mobile
  toolbar overflow bug, Export menu keyboard accessibility, and non-functional
  security meta tags
- [`docs/adsense-indexing-readiness.md`](docs/adsense-indexing-readiness.md) —
  what's done for Google AdSense approval and indexing versus what still
  needs a real Google account and production domain

## License

Built as a portfolio CV builder.
