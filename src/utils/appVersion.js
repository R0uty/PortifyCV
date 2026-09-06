import { version } from '../../package.json'

// Single source of truth for every version badge in the app (SiteFooter,
// NavRail) — bump package.json's version, not this file or any caller, when
// cutting a release.
export const APP_VERSION_RAW = version
export const APP_VERSION = `v${version}`
