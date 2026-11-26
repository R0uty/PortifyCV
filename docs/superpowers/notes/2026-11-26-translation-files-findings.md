# Translation files (1.7.13): findings for later fixes

Collected while moving the interface text into `src/i18n/` (1.7.13). The
release changed no visible text, so none of these is fixed yet. Each is a
visible change and needs its own commit. Keys are given as
`namespace:key`.

## Typos and grammar (Finnish unless noted)

- `builder:import.tooLarge`: "Tuetun koko on enintään 5 Mt." should be
  "Tuettu koko …".
- `builder:share.copyFailed`: "osoiterivilta" should be "osoiteriviltä".
- `builder:share.copiedNoImages`: "jos ne tarvitaan" reads better as "jos
  niitä tarvitaan".
- `builder:sidebar.suggestionCount` (English): always plural, so one
  suggestion reads "1 suggestions". It is a plain string, not a plural.
- `builder:entryBadge.tips` and `feedback:sectionBadge.tips`: Finnish is
  "{count} vinkkiä" for every count, so 1 reads "1 vinkkiä" ("1 vinkki").
- `cv:fitWarning`: "Sisältö saattaa ylittää yhden sivun edes tiiveimmällä
  asettelulla": "edes" reads wrong ("vielä tiiveimmälläkin asettelulla").
- `cv:templates.graduate.memberships` "Extracurricular Activities" is "Ylimääräinen
  toiminta" ("superfluous activity"); "Opintojen ulkopuolinen toiminta"
  would read better.
- `cv:certificate.viewCredential` "View credential" is "Näytä todennus";
  "Näytä sertifikaatti" or "Näytä todistus" would be clearer.
- `fieldFilter`: "Kaikki 1 pohjaa" / "Näytetään 1/1 pohjaa" would be
  ungrammatical for a count of 1. Unreachable today (18 templates, every
  field has more than one), and not a plural.

## Finnish that isn't a translation of the English

- `cv:titleFallbacks.creative` ("Creative Problem Solver") and
  `cv:titleFallbacks.senior` ("Senior Professional") are both
  "Ammattinimike" ("Professional title") in Finnish.
- Portfolio's "Professional Experience" is "Kokemus"; Executive's is
  "Työkokemus".
- "Live Demo" is "Demo".
- The Executive summary placeholder shares its Finnish ("Ammatillinen
  yhteenvetosi …") with the professional summary placeholder.
- `dialogs:settings` "Delete all saved CVs" is "Poista kaikki" ("Delete
  all"); the applications button is the fuller "Poista kaikki haut".
- `dialogs:gallery` "In use" and "Active" are both "Käytössä" (kept as two
  keys).
- The cover letter's hiring-manager placeholder stays "esim. Jane Doe" in
  Finnish, while the company one is "esim. Acme Oy".

## Same thing, different Finnish words

Classic's form and Direct Edit's popup name the same fields differently:

| Field | Classic (`form:*`) | Popup (`form:schema.*`) |
|---|---|---|
| Forks | Haarautumat | Haarat |
| Honors | Kunniamaininta (valinnainen) | Kunniamaininnat |
| Expiry | Vanhenee | Voimassaolo |
| Credential URL | Todennuslinkki | Todistuksen osoite |
| Outcome | Tulos | Lopputulos |
| Leadership/internship dates | Alkoi / Päättyi | Aloituspäivä / Lopetuspäivä |
| Duplicate | Monista | Kopioi |
| Dev.to link | Dev.to (`cvForm:linkLabels`) | dev.to |

Also:
- The ATS panel kicker is "ATS-pisteet" while its intro says "Piste
  kertoo…" (singular); the gallery banner also says "ATS-pisteet".
- The export files' section headings (`exports:sections.*`, e.g. `about`
  "Esittely") differ from how some templates word the same section on the
  CV (`cv:*`).

## English shown in a Finnish interface (never had a Finnish pair)

- `ATSScorePanel.jsx`: "ATS-friendly mode" is hard-coded English. Settings
  calls it "ATS-ystävällinen tila".
- `ResumeBuilderPage.jsx` (`loadInitialCvSession`): the fallback "Shared CV
  link could not be loaded."
- The export labels "ATS PDF" / "Designer PDF" inside Finnish toasts.
- English-only prop defaults, used only when a caller omits the prop
  (no current caller does): CVForm's `selectedTemplateLabel = 'Current
  template'`, ReorderableListInput's `addLabel = 'Add'` and `itemAriaLabel
  = 'Item'`, TagsInput's `ariaLabel = 'Tags'`.

## Text in the CV's language that belongs to the editor

These are drawn inside the CV preview, so they follow the CV's language
rather than the app's (a Finnish CV in an English builder shows Finnish
editing hints):
- Direct Edit's add buttons ("+ Add", "+ Add experience") and the empty
  field placeholders ("Your Name", "Professional Title", "Company",
  "Description", "Untitled role", "Dates pending", "… will appear here.")
  in every template.
- The kicker above the name ("<Template> Template" / "ATS-friendly mode")
  and Compact's and European's `fitWarning`.

And the reverse: the date placeholders in the form ("e.g. Jan 2022" /
"esim. tammikuu 2022") hint at text typed into the CV but follow the app's
language.

## Code notes (no visible effect)

- `useT` and `<T>` in `src/i18n/react.jsx` are not used anywhere yet; every
  call site calls `ns.t(locale, …)` directly.
- The content pages' language files repeat a few non-text values per
  language (`SAFE_TEMPLATES`, `TEMPLATE_COUNT`, `TECH_SEARCH`,
  `DEVELOPER_TEMPLATE`), so a third language copies them too.
- "New skill" is duplicated in `form` and `formInline`; about 20 section
  names are duplicated in `cv` and `cvForm`.
- `cvTextImport.js`'s header comment still says "no dependencies"; it
  imports the `feedback` and `cvForm` namespaces.
- `src/i18n/pages/templateDetail/index.js` has an overlong comment line;
  `SharedCvPage.jsx`'s comment on its moved title block could name the lint
  rule (`react-hooks/preserve-manual-memoization`).
