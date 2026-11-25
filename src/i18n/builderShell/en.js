// The builder's toolbar, its design switchers and the leave dialog, in
// English (see index.js for why these are not in `builder`).
export default {
  toolbar: {
    returnLabel: 'Return to landing',
    returnTitle: 'Return',
    undo: 'Undo',
    redo: 'Redo',
    searchPlaceholder: 'Search sections...',
    searchLabel: 'Search sections',
  },
  mode: {
    label: 'Builder mode',
    directEdit: 'Direct Edit',
    classic: 'Classic',
  },
  template: {
    // Read by a screen reader before the template's name.
    select: 'Select template: ',
    caption: 'Template',
  },
  design: {
    label: 'Design',
    modified: 'Modified',
    modifiedSr: ', modified',
    style: 'Style',
    font: 'Font',
    headings: 'Headings',
  },
  language: {
    switch: 'Switch language',
    code: 'EN',
  },
  save: {
    pausedLabel: 'Saving paused: {name}. Save now',
    pausedTitle: 'Saving is paused. Save now',
    pausedMenu: 'Saving paused. Save now',
    savedLabel: 'Saved on this device: {name}',
    savedMenu: 'Saved: {name}',
    saveOnDevice: 'Save on this device',
    saved: 'Saved',
    save: 'Save',
  },
  more: {
    label: 'More actions',
    narrowPreview: 'Narrow preview',
    narrowPreviewTitle: 'Show the template at a narrow width (like the HTML export on a phone)',
    fullscreenPreview: 'Fullscreen preview',
    coverLetter: 'Cover letter',
    settings: 'Settings',
    importCv: 'Import CV',
    myCvs: 'My CVs',
    markApplied: 'Mark as applied',
    confirmClear: 'Confirm clear',
    clearCv: 'Clear CV',
  },
  export: {
    exporting: 'Exporting...',
    export: 'Export',
    pdfAtsHint: 'ATS layout: plain and easy to parse',
    pdfDesignHint: 'Your design, ready to send',
    htmlHint: 'One web-page file, opens in any browser',
    jsonHint: 'Backup you can import again later',
    docxHint: 'Editable .docx, works with any ATS',
    shareLink: 'Copy share link',
    shareLinkHint: 'The CV travels in the link, without photos',
  },
  styleSwitcher: {
    select: 'Select style',
    trigger: 'Select style: {variant}',
    triggerModified: 'Select style: {variant}, Modified',
    modified: 'Modified',
  },
  fontSwitcher: {
    // Read by a screen reader before the font's name.
    selectPrefix: 'Select font: ',
    select: 'Select font',
    font: 'Font',
  },
  headingColor: {
    // Read by a screen reader before the colour's name.
    selectPrefix: 'Select heading color: ',
    select: 'Select heading color',
    default: 'Default',
    presets: 'Preset colors',
    colorWheel: 'Color wheel',
    hex: 'Hex color',
    useTemplateDefault: 'Use template default',
  },
  leaveDialog: {
    title: 'Leave without saving?',
    body: "PortifyCV doesn't store your CV anywhere. If you leave now, your latest changes are gone.",
    hint: 'Download a JSON copy to import later and pick up where you left off.',
    keepEditing: 'Keep editing',
    downloadAndLeave: 'Download JSON & leave',
    leave: 'Leave without saving',
  },
}
