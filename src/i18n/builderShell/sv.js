// The builder's toolbar, its design switchers and the leave dialog, in
// Swedish (see index.js for why these are not in `builder`).
export default {
  toolbar: {
    returnLabel: 'Tillbaka till startsidan',
    returnTitle: 'Tillbaka',
    undo: 'Ångra',
    redo: 'Gör om',
    searchPlaceholder: 'Sök avsnitt...',
    searchLabel: 'Sök avsnitt',
  },
  mode: {
    label: 'Redigeringsläge',
    directEdit: 'Direktredigering',
    classic: 'Klassisk',
  },
  template: {
    // Read by a screen reader before the template's name.
    select: 'Välj mall: ',
    caption: 'Mall',
  },
  design: {
    label: 'Utseende',
    modified: 'Ändrad',
    modifiedSr: ', ändrad',
    style: 'Stil',
    font: 'Typsnitt',
    headings: 'Rubriker',
  },
  language: {
    menu: 'Språk',
    code: 'SV',
  },
  save: {
    pausedLabel: 'Sparandet är pausat: {name}. Spara nu',
    pausedTitle: 'Sparandet är pausat. Spara nu',
    pausedMenu: 'Sparandet är pausat. Spara nu',
    savedLabel: 'Sparat på den här enheten: {name}',
    savedMenu: 'Sparat: {name}',
    saveOnDevice: 'Spara på den här enheten',
    saved: 'Sparat',
    save: 'Spara',
  },
  more: {
    label: 'Fler åtgärder',
    narrowPreview: 'Smal förhandsvisning',
    narrowPreviewTitle: 'Visa mallen i smal bredd (som HTML-exporten på en mobil)',
    fullscreenPreview: 'Förhandsvisning i helskärm',
    coverLetter: 'Personligt brev',
    settings: 'Inställningar',
    importCv: 'Importera CV',
    myCvs: 'Mina CV',
    markApplied: 'Markera som sökt',
    confirmClear: 'Bekräfta rensning',
    clearCv: 'Rensa CV',
  },
  export: {
    exporting: 'Exporterar...',
    export: 'Exportera',
    pdfAtsHint: 'ATS-layout: enkel och lätt att tolka',
    pdfDesignHint: 'Ditt utseende, klart att skicka',
    htmlHint: 'En webbsidefil som öppnas i alla webbläsare',
    jsonHint: 'En säkerhetskopia som du kan importera senare',
    docxHint: 'Redigerbar .docx som fungerar med alla ATS',
    shareLink: 'Kopiera delningslänk',
    shareLinkHint: 'CV:t följer med i länken, utan foton',
  },
  styleSwitcher: {
    select: 'Välj stil',
    trigger: 'Välj stil: {variant}',
    triggerModified: 'Välj stil: {variant}, Ändrad',
    modified: 'Ändrad',
  },
  fontSwitcher: {
    // Read by a screen reader before the font's name.
    selectPrefix: 'Välj typsnitt: ',
    select: 'Välj typsnitt',
    font: 'Typsnitt',
  },
  headingColor: {
    // Read by a screen reader before the colour's name.
    selectPrefix: 'Välj rubrikfärg: ',
    select: 'Välj rubrikfärg',
    default: 'Standard',
    presets: 'Färdiga färger',
    colorWheel: 'Färghjul',
    hex: 'Hexfärg',
    useTemplateDefault: 'Använd mallens standard',
  },
  leaveDialog: {
    title: 'Lämna utan att spara?',
    body: 'PortifyCV sparar inte ditt CV någonstans. Om du lämnar nu försvinner dina senaste ändringar.',
    hint: 'Ladda ner en JSON-kopia som du kan importera senare och fortsätta där du slutade.',
    keepEditing: 'Fortsätt redigera',
    downloadAndLeave: 'Ladda ner JSON och lämna',
    leave: 'Lämna utan att spara',
  },
}
