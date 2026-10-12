# Template in share links — design (v1.6, Phase 4 follow-up)

**Date:** 2026-10-10
**Branch:** `v1.6.0` (PR R0uty/PortifyCV#2), based on 1.6.7 (`7ac7c61`)
**Status:** approved 2026-10-10

## Goal

A share link carries the CV and each template's stored look (`va`), but
not which template the sender had open. `buildShareUrl` writes the CV
into the `#data=` fragment and clears the query string, so every share
link opens on Minimalist. A non-Minimalist look's font and headings
colour therefore can't travel, because those are global and come from
the open template's look.

This change makes a share link carry the sender's selected template and
open on it, with that template's look complete.

## Decisions (made 2026-10-10)

- **Scope:** the selected template only.
  - Not Classic Professional's name alignment.
  - Not ATS-friendly mode.
  - JSON export is unchanged.
- **Placement:** a new permanent short key `tp` inside the `#data=`
  payload, next to `va`. The share link stays entirely in the fragment,
  which browsers never send to the server.
- **Version:** 1.6.8, a patch bump on `v1.6.0`.

## Non-goals

- Carrying the template, name alignment or ATS mode in JSON export or
  session restore.
- Carrying tab-only tweaks (a hand-picked accent, font or headings
  colour). A share link still carries looks, not tweaks.
- Changing the payload version, the size limits or any existing key.

## 1. Codec (`src/utils/shareLinks.js`)

- **`tp` key:**
  - `encodeCvStateForUrl(formData, templateId)` adds `d.tp = templateId`
    when `templateId` is a non-empty string.
  - `tp` is unused anywhere in the codec today (root keys, list keys and
    item-field keys all checked). It gets a comment saying it's permanent
    once shipped, like `va`.
- **Payload version:** `SHARE_PAYLOAD_VERSION` stays 3. The key is
  additive, and `expandCurrentPayload` (in this app and in older
  versions of it) ignores keys it doesn't know.
- **`buildShareUrl(formData, { templateId, currentHref } = {})`:**
  - `currentHref` defaults to `window.location.href`, as before; it moves
    into the options object.
  - The builder is the only caller.
  - The size limits apply to the result exactly as before. `tp` adds
    about 20 characters.
- **`readCvStateFromLocation(currentHref)`** returns
  `{ formData, templateId }`, or `null` when there's no share data.
  - `templateId` is the raw `tp` string.
  - It's `null` for a link without `tp` (every link made before 1.6.8) or
    with a non-string `tp`.
  - Validation happens in the builder (§2), not in the codec.
- **`decodeCvStateFromUrl(encoded)`** keeps returning only the CV, so its
  callers and `check:share`'s existing cases are unchanged. Both readers
  share one private parse step (base64url, then JSON), so the payload is
  decoded in one place.

## 2. Opening a shared link (builder)

- **`resolveTemplateId(raw)`** (in `src/reducers/uiReducer.js`, exported):
  - It is `readInitialTemplateId`'s current logic, factored out: apply
    `LEGACY_TEMPLATE_ALIASES`, then `isValidTemplateId`.
  - It returns a valid template id, or `null`.
  - `readInitialTemplateId()` becomes
    `resolveTemplateId(?template=) ?? defaultTemplateId`.
- **`loadInitialCvSession`** (`ResumeBuilderPage.jsx`): the share-link
  branch adds `sharedTemplateId: templateId` to the session object it
  returns. Every other branch leaves it out.
- **`createInitialUiState(initialSession)`:**
  - `selectedTemplate` is `resolveTemplateId(initialSession?.sharedTemplateId)`
    if that resolves, else `readInitialTemplateId()`.
  - **Precedence:** the link's template wins over a `?template=` in the
    same URL, because it's the sender's choice.
  - **Retired id:** goes through the alias (`classic` →
    `classicProfessional`).
  - **Unknown or missing id:** falls back exactly as today (`?template=`,
    then the default).
- **Classic Professional's name alignment:** still starts centred for a
  shared link. Only a literal `?template=classic` deep link starts
  left-aligned, as today.
- **The look arrives complete:** `createInitialUiState` already runs
  `applyStoredLooks` for the selected template. With the shared template
  selected, its stored look's palette, accent, font and headings colour
  all apply.

## 3. Sending

`handleCopyShareLink` calls
`buildShareUrl(formData, { templateId: selectedTemplate })`. The button,
the toasts and the missing-images warning are unchanged.

## 4. Testing and docs

- **`check:share`:**
  - a CV encoded with a template decodes through `readCvStateFromLocation`
    to the same CV plus that `templateId`;
  - a payload without `tp` gives `templateId: null`;
  - a non-string `tp` (a hand-built payload) gives `null`;
  - `decodeCvStateFromUrl` still returns only the CV;
  - the existing round trips are unchanged.
- **`check:reducers`:** `createInitialUiState` with
  - `sharedTemplateId: 'creative'` → `creative`;
  - `'classic'` → `classicProfessional`;
  - an unknown id → the default;
  - none → the default.
- **e2e (`style-variants.spec.js`):**
  - **New:** a link copied on Developer with look #2 opens on Developer,
    with that look's name in the Style picker and its font in the font
    picker.
  - **Changed:** "a share link restores another template's look accent"
    sends its link from Minimalist after picking Creative's look. It
    therefore still proves that another template's stored accent is
    seeded, now that a link no longer always opens on Minimalist.
- **Docs:**
  - `CLAUDE.md`'s share-link paragraph mentions `tp`;
  - `changes.md` gets a 1.6.8 entry;
  - the "share links don't carry the selected template" known gap is
    marked fixed in `todo.md`.
- **Gate before the bump commit:** `npm run lint`, all 8 `check:*`,
  `CI=1 npm run test:e2e`, `npm run build`. Then ask before pushing to
  `origin v1.6.0`.
