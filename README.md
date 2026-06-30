# PortifyCV

A modern, minimal CV builder for creating and exporting professional resumes in real-time.

## Features

- **Live Preview**: See your CV update instantly as you edit
- **Multiple Templates**: Choose from four unified minimal design variants (A-D)
- **Theme System**: 7 accent color themes with dark/light mode support
- **Smart Export**: PDF (with design fallback) and JSON export
- **ATS Optimization**: Feedback and dedicated ATS-friendly mode
- **CV Suggestions**: Smart feedback on clarity, impact, and completeness
- **Share & Import**: Generate shareable links and import JSON backups
- **Local Storage**: All changes auto-save to browser storage

## Tech Stack

- **React 19.2.6**: UI framework with hooks
- **Vite 8.0.13**: Build tool with HMR
- **Tailwind CSS 4.3.0**: Utility-first styling
- **html2canvas 1.4.1**: PDF design rendering
- **jsPDF 4.2.1**: PDF generation
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
```

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

- Bundle size: ~860KB (html2canvas + jsPDF are large dependencies)
- Gzipped CSS: ~10KB
- Gzipped JS (after chunking): ~48KB + 257KB
- Page-sliced PDF rendering for large multi-page CVs
- Adaptive rendering scale to prevent memory overflow

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge) with ES2020+ support.

## License

Built as a portfolio CV builder.
