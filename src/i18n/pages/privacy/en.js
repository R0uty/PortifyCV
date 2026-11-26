// The privacy policy in English.
export default {
  kicker: 'Legal',
  title: 'Privacy Policy',
  effectiveDateLabel: 'Effective date',
  effectiveDate: '17 November 2026',
  intro:
    'PortifyCV is a free, browser-based CV builder. It has no user '
    + 'accounts and no server-side database — this policy explains '
    + 'exactly what that means for your data, and which advertising '
    + "cookies the site's ads use.",
  sections: [
    {
      heading: 'Your CV content',
      paragraphs: [
        "Everything you type into PortifyCV — your name, work history, "
        + "education, and every other field — stays in your browser's "
        + 'memory for the duration of your session, unless you choose to save '
        + 'it on this device (see "CVs saved on this device" below). It is '
        + 'never uploaded to '
        + 'a server, because PortifyCV does not have one to upload it to. It '
        + 'leaves your device only if you explicitly choose to export a file '
        + '(PDF, Word, HTML, or JSON) or generate a share link, and even then it '
        + 'goes directly to your own downloads folder or into the URL you '
        + 'choose to share — not to PortifyCV.',
        {
          parts: [
            'Share links encode your CV inside the link itself (the part '
            + 'after ',
            { code: '#' },
            '), which browsers never send to a server as part of a normal '
            + 'page load. Anyone you send that link to can decode it in '
            + 'their own browser the same way yours created it. The link '
            + 'opens a view-only page where the recipient can download a '
            + 'PDF or open a copy to edit in their own browser. Besides '
            + 'your CV data it carries your chosen font and colours, ATS '
            + 'mode, and the PDF paper size and fit; photos and the cover '
            + 'letter never travel in it.',
          ],
        },
      ],
    },
    {
      heading: 'What PortifyCV stores locally',
      paragraphs: [
        "PortifyCV stores five small preferences in your browser's local "
        + 'storage, so they persist between visits:',
      ],
      list: [
        'which interface language you last selected (English or Finnish)',
        'whether you have already seen the one-time onboarding tip',
        'whether the "Restore last session" feature is turned on (see below)',
        'which builder mode (Direct Edit or Classic) you last used',
        "whether the builder's section menu is collapsed",
      ],
      paragraphsAfterList: [
        "None of these contain any part of your CV. All five can be "
        + "cleared at any time by clearing your browser's site data for "
        + 'this domain. Your advertising-cookie consent choice is stored '
        + "separately by Google's consent tool (see \"Cookies and "
        + 'advertising" below).',
      ],
    },
    {
      heading: 'Restore last session',
      paragraphs: [
        'Settings includes a feature that is on by default: "Restore '
        + 'last session." While it is on, a working copy of the CV you '
        + "have edited is kept in your browser tab's session storage — "
        + 'not local storage — so an accidental refresh or tab crash '
        + 'does not lose your work. The copy stays in your own browser '
        + 'and is not sent anywhere. You can turn the feature off in '
        + 'Settings.',
        'Session storage differs from the local storage described above '
        + 'in one important way: your browser permanently clears it the '
        + 'moment you close the tab. It does not carry over to your next '
        + 'visit, even in the same browser, and it is never sent '
        + 'anywhere. Turning the feature back off clears the saved copy '
        + 'immediately.',
      ],
    },
    {
      heading: 'CVs saved on this device',
      paragraphs: [
        'Nothing is saved unless you choose to. When you press Save in the '
        + 'builder and name a CV, it is stored in your browser\'s IndexedDB '
        + 'storage on this device, and your later edits to it are saved '
        + 'there automatically. It does not leave your device, and '
        + 'PortifyCV never sees it.',
        'Saved CVs stay between visits until you delete them: one at a '
        + 'time from My CVs, all at once from Settings, or by clearing '
        + "your browser's site data for this domain. They do not move to "
        + 'another browser or device; export JSON if you want a copy '
        + 'elsewhere.',
        'When you mark a CV as applied (Mark as applied), the application '
        + 'is stored in its own IndexedDB database in this browser: the '
        + 'company, role, date applied, ad link, status and your notes, the '
        + 'PDF of the CV that was sent (and of the cover letter, when it has '
        + 'text) with pictures of its pages, and the CV data, template and '
        + 'look it was made from. None of it is sent anywhere. Applications '
        + 'stay until you delete them: one at a time from My CVs › '
        + 'Applications, all at once from Settings, or by clearing your '
        + "browser's site data for this domain. Deleting your saved CVs "
        + 'does not delete applications, and deleting applications does not '
        + 'delete your saved CVs.',
      ],
    },
    {
      heading: 'Cookies and advertising (Google AdSense)',
      paragraphs: [
        'PortifyCV shows ads through Google AdSense to fund the running of '
        + 'the site. Serving those ads involves cookies, set in your '
        + 'browser by Google and its partners.',
        {
          parts: [
            'Google, as a third party, uses cookies to '
            + "serve ads based on your prior visits to this and other "
            + "websites. Google's use of advertising cookies enables it "
            + 'and its partners to serve ads based on your visit to this '
            + 'site and/or other sites on the internet. You can opt out of '
            + 'personalized advertising by visiting ',
            { link: 'https://adssettings.google.com', text: 'Google Ads Settings' },
            ", or opt out of a third-party vendor's use of cookies for "
            + 'personalized advertising by visiting ',
            { link: 'https://www.aboutads.info', text: 'www.aboutads.info' },
            '. More detail on how Google uses information from sites that '
            + 'use its services is available at ',
            {
              link: 'https://policies.google.com/technologies/partner-sites',
              text: 'policies.google.com/technologies/partner-sites',
            },
            '.',
          ],
        },
        'In the EEA, the UK, and Switzerland, a Google-certified consent '
        + 'message is shown so you can grant or refuse consent for '
        + 'advertising cookies before any are set.',
        'Advertising cookies relate to ad delivery and measurement only. '
        + 'They are unrelated to, and cannot access, the CV content '
        + 'described above.',
      ],
    },
    {
      heading: 'Analytics (Cloudflare)',
      paragraphs: [
        'PortifyCV uses Cloudflare Web Analytics to see aggregate traffic '
        + 'to this site: how many people visit, which pages are popular, '
        + 'and how fast pages load. Cloudflare is the same company that '
        + 'serves this site. It does not use cookies, local storage, or '
        + 'any other client-side tracking identifier, and it does not '
        + 'follow you across other websites.',
        'The data it collects is aggregated and anonymized — things like '
        + 'the page you visited, the site that referred you, your '
        + 'approximate country, and your device or browser type. It has '
        + 'no access to anything you type into the CV builder; that stays '
        + 'in your own browser exactly as described above, and Cloudflare '
        + 'never sees it.',
      ],
    },
    {
      heading: "Children's privacy",
      paragraphs: [
        'PortifyCV is not directed at children under 13 and does not '
        + 'knowingly collect personal information from them.',
      ],
    },
    {
      heading: 'Your choices',
      paragraphs: [
        'Because nothing about your CV is ever stored outside your own '
        + 'browser, there is nothing on our end to request, correct, or '
        + 'delete. You can delete your saved CVs and clear the local '
        + 'preferences above, or opt '
        + 'out of personalized ads, at any time using the links in this '
        + 'policy.',
      ],
    },
    {
      heading: 'Changes to this policy',
      paragraphs: [
        'If this policy changes, the effective date at the top of this '
        + 'page will be updated to reflect it.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        {
          parts: [
            'Questions about this policy can be sent to ',
            { link: 'mailto:portifycv@gmail.com', text: 'portifycv@gmail.com' },
            '.',
          ],
        },
      ],
    },
  ],
}
