import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dist-ssr']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['*.config.js', 'e2e/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Cloudflare Workers runtime: not Node, not a browser — HTMLRewriter is
    // a Workers-only global on top of the standard fetch-event globals.
    files: ['worker/**/*.js'],
    languageOptions: {
      globals: { ...globals.worker, HTMLRewriter: 'readonly' },
    },
  },
])
