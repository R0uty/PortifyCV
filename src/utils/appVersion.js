import { version } from '../../package.json'

// Single source of truth for the version badge in SiteFooter — bump
// package.json's version, not this file, when cutting a release.
export const APP_VERSION = `v${version}`
