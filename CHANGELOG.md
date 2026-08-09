# Changelog

All notable changes to PortifyCV are recorded here.

## 1.0.0 — 2026-08-09

First stable release. The app builds, previews, and exports a CV entirely in the
browser, with no account and no CV data leaving the page.

Everything below landed during the run-up to 1.0.0. The reasoning behind the
fixes, and how each was verified, is in [`docs/audit-1.0.0.md`](docs/audit-1.0.0.md).

### Share links

- Rewrote the share payload (version 3). Earlier links carried only name, title,
  about, photo, skills, experience, education, and links; the other twelve
  sections were silently dropped. All twenty sections now travel.
- Empty fields are omitted from the payload and restored to their schema default
  on the way back, which keeps links small despite the wider coverage.
- Version 2 links still decode, so previously shared URLs keep working.
- Raised the size limits to 16,000 characters of data and 18,000 for the whole
  URL. A fully populated demo CV encodes to ~6,100.
- **Uploaded images are excluded from share links.** A profile photo is a data
  URL of tens of kilobytes — a 20KB photo produced a 42,551-character payload
  against a 16,000 limit, so "Copy share link" failed for every user who added
  one. Links now carry the CV text and stay a constant size regardless of image
  size; the app says so when it copies.
- Copy failures caused by the Clipboard API being unavailable (insecure context,
  denied permission) now report a distinct, actionable message instead of
  surfacing a raw `TypeError`.

### Accessibility

- `FloatingField` now ties its label to its control with `id`/`htmlFor`. The
  label was previously a sibling with neither, leaving roughly 27 fields across
  experience, education, certificates, projects, and languages with no
  accessible name and no click-to-focus.
- `AutoGrowTextarea` forwards the props it does not name explicitly. It had been
  dropping the `id` injected by `FloatingField`, orphaning every "Description"
  label.
- Added accessible names to the job-description textarea, the quick-import
  textarea, and the interests inputs.
- The profile-image field is no longer a `<label>`; clicking the hint text or the
  preview image used to reopen the file picker.
- The link fields' hide/show button was moved out of the `<label>`, which had
  folded the button text into each input's accessible name.

### Editing

- Collapsed entry cards track their section and index, and that mapping is now
  remapped when an entry is removed, duplicated, moved, or dragged. Collapsed
  state previously stayed on a position and transferred to a different entry.
- Move actions ignore out-of-range targets rather than reordering past the ends
  of a list.
- Section navigation scrolls the editor panel itself instead of using
  `scrollIntoView`, which dragged the whole page along with it. It falls back to
  an instant jump when a browser accepts a smooth scroll and never performs it,
  which would otherwise leave every nav entry dead.
- The active-section highlight tracks which sections are visible across
  IntersectionObserver callbacks, so scrolling a section out of view no longer
  leaves the previous entry highlighted.
- Section numbering in the editor is contiguous again (it skipped from 05 to 07).

### Exports

- HTML export includes the tagline and the email/phone/location contact line.
- Export filenames fall back to `cv` when a name contains no Latin characters,
  which previously produced files named `.pdf` and `.json`. Accented letters are
  folded rather than dropped, so `Ääkkös Öö` yields `aakkos-oo` instead of the
  lossy `kk-s`.

### Other

- Modals keep their focus trap when a parent re-renders. Passing an inline
  `onClose` used to tear the trap down and bounce focus out of the open dialog.
- Toast timers are cleared from their tracking map on unmount, so toasts are
  still dismissible after a remount.
- Added `npm run check:share`, a browser-free regression check for the share-link
  codec.

### Earlier in the 1.0.0 cycle

- Sanitized project and certificate link hrefs against `javascript:` URIs.
- Updated DOMPurify to a patched version.
- Removed local draft autosave, so nothing persists after the tab closes.
- Removed the dark theme and the Developer template's watermark.
