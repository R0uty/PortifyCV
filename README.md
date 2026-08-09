# PortifyCV

A modern, minimal CV builder for creating and exporting professional resumes in real-time.

## Features

- **Live Preview**: See your CV update instantly as you edit
- **10 Templates**: Minimalist, Developer, Creative, Modern Professional, Executive,
  Timeline, Graduate, Compact, Portfolio Hybrid, and Tech Executive
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
- **Tailwind CSS 4**: Utility-first styling
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
```

`check:share` round-trips a full CV through the share-link encoder and decoder.
Run it after touching `src/utils/shareLinks.js` or the CV schema in
`src/utils/cvForm.js` — a mistyped short key silently drops a field from every
link the app generates.

## Production Build

The production build outputs to `/dist/`:

```bash
npm run build
```

Static files are ready to be served:
- `dist/index.html` - Main entry point
- `dist/assets/` - JS and CSS bundles
- `dist/favicon.svg` - Site icon
- `dist/icons.svg` - Icon sprite

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

## Google SEO Setup

After deployment, complete Google indexing and performance monitoring:

1. Open Google Search Console and add your production domain.
2. Verify ownership with your preferred method (DNS TXT is recommended).
3. Submit `https://your-domain/sitemap.xml`.
4. Use Search Console "Page indexing" and "Core Web Vitals" reports to track visibility and performance.

If your live domain is not `https://portifycv.app`, update canonical/OG URLs in `index.html` and the domain in `public/sitemap.xml` and `public/robots.txt`.

## Performance

- The PDF dependencies (html2canvas + jsPDF) dominate the bundle and are loaded lazily,
  only when an export is triggered
- Gzipped CSS: ~21KB; initial gzipped JS: ~75KB
- Page-sliced PDF rendering for large multi-page CVs
- Adaptive rendering scale to prevent memory overflow

## Routes

- `/` — landing page
- `/cv` — opens the builder directly
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

## License

Built as a portfolio CV builder.
