import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          // Deliberately NOT grouping html2canvas/jspdf into a named vendor
          // chunk here, even though they're large (~600KB combined) — both
          // are only ever reached through exporters.js's dynamic import()
          // (idle-prefetched, see prefetchPdfExportAssets), never a static
          // import from the entry graph. A named manualChunks group gets
          // treated as part of the critical graph by Vite's modulepreload
          // injection, which added an eager <link rel="modulepreload"> for
          // it to every page's <head> — undoing the lazy-loading entirely,
          // so every landing-page visitor downloaded the PDF toolchain
          // before ever touching the builder. Leaving these unassigned lets
          // Rollup's default splitting keep them in their own async
          // chunk(s) without that eager hint.
        },
      },
    },
  },
  // Only applies to `vite dev` (and `vite preview`) — a real deployment is a
  // static file server with no Vite middleware in front of it, so these
  // don't reach production. `public/_headers` (Netlify) and `vercel.json`
  // carry the equivalent for the hosts that support custom response headers;
  // see the README's Deployment section for hosts that don't (GitHub Pages).
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
})
