# Saved CVs on the device — design

Date: 2026-11-15. Branch: `v1.7.0`. Approved in conversation on 2026-11-15.

## Intent

People applying for jobs keep several CVs: a master and a tailored copy
per application. Today a CV lives only in the tab, so a returning visitor
starts from a JSON file or from nothing. Keeping CVs on the visitor's own
device, with no login and no server, is what makes PortifyCV usable for
more than one sitting, and it is the base the job-tailoring flow (roadmap
item 3) builds on.

## Decided by the user

**Save only on click.** Nothing is stored until the visitor presses "Save
on this device" and names the CV. A visitor who never does gets exactly
today's behaviour. Rejected: an auto-save switch (someone turns it on,
forgets, and leaves a CV on a shared computer) and auto-save by default
(drops the product's promise).

## Goals

- Save the current CV under a name; after that, edits to it save
  themselves.
- "My CVs": open, duplicate, rename, delete; New CV.
- The site's "no data saved" copy becomes true again: "Nothing saved
  unless you choose to", everywhere it is stated, in both locales.

## Non-goals

- Sync between devices, accounts, any server.
- A history of older states of one CV.
- The job-tailoring flow.

## Anti-goals

- Anything written to IndexedDB before the first explicit save.
- Undo carrying one CV's content into another saved CV.
- One tab silently overwriting what another tab saved.

## Approaches

1. **IndexedDB, one record per CV (picked).** No practical size limit, so
   photos and project images are kept; asynchronous, so a large CV does
   not block typing.
2. **localStorage.** Simpler, but capped at about 5 MB per origin, which
   one CV with images can exceed. Rejected.
3. **File System Access API (a folder of JSON files).** Real files the
   user owns, but Chromium-only and a permission prompt per session.
   Rejected.

## Design (the builder's calls unless marked)

**Record** — store `cvs` in database `portifycv`, key `id`:
`{ id, name, data: CvData, templateId, createdAt, updatedAt }`. `data`
goes through `parseImportedCvData` on the way out, the same validation a
JSON import gets.

**Library module** — `src/utils/cvLibrary.js`: the IndexedDB calls plus the
pure naming rules (`normalizeCvName`, `nextCopyName`, `defaultCvName`).
A write names the `updatedAt` it expects to replace; a mismatch is a
conflict, not an overwrite.

**Hook** — `src/hooks/useCvLibrary.js` owns the active saved CV, the
auto-save (debounced, same delay as session restore), the list, and the
actions. The active CV's id is kept in `sessionStorage` so a reload of
the tab (session restore) stays attached to it.

**UI**

- Toolbar: one button. "Save" when the CV is not saved; a check and
  "Saved" when it is, opening My CVs.
- More actions: "My CVs".
- `SavedCvsModal.jsx`: the name prompt for a first save, and the list
  with Open, Duplicate, Rename, Delete (second click confirms) and New CV.
  It says the CVs are in this browser only and that clearing site data
  removes them.
- Settings: "Delete all saved CVs" (second click confirms), shown when
  there are any.
- Arriving with saved CVs and none open: an info toast saying how many
  and where to find them. The builder never loads one by itself, so share
  links, examples and session restore behave as before.

**Rules**

- Open and New CV replace the CV on screen. If it has changes saved
  nowhere, the button asks for a second click first.
- Open and New CV reset undo history.
- A successful save marks the CV saved for the leave guard.
- On a conflict (another tab saved the same CV) auto-save stops and a
  toast says so; "Save" again overwrites deliberately.
- IndexedDB unavailable: the Save button says so; nothing else changes.
- The first save asks the browser for persistent storage
  (`navigator.storage.persist()`), best effort.

**Copy** — "No login. No data saved." → "No login. Nothing saved unless
you choose to." in the footer, landing page, `index.html`, `pageMeta.js`,
the guide pages and the builder's status pill; a privacy-policy paragraph
on what is stored, where, and how to delete it.

**Checks**

- `scripts/check-cv-library.mjs` (`npm run check:cv-library`, in CI): the
  naming rules and record shape.
- `e2e/saved-cvs.spec.js`: nothing in IndexedDB before a save; save,
  auto-save, reload; open, duplicate, rename, delete, delete all; undo
  does not cross CVs; two tabs; the leave guard.
