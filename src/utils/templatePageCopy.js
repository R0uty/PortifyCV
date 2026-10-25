// Bilingual copy for the per-template pages (/free-cv-templates/<slug>),
// read only by TemplateDetailPage.jsx (lazy-loaded, not in the entry
// chunk). Each entry is written for that template specifically: who it
// suits, two paragraphs about it and three questions with answers
// (1.6.57), and three concrete tips about its own layout. Eighteen pages
// that differ only by template name would read as thin, duplicate
// content to search engines and AdSense review.
//
// The English-only metaDescription that VIEW_HEAD needs lives separately
// in templateMetaDescriptions.js, so pageMeta.js (which IS in the entry
// chunk, via App.jsx) doesn't have to pull in this whole bilingual file
// just to read that one string.
export const TEMPLATE_PAGE_COPY = {
  developer: {
    en: {
      bestFor: 'Frontend developers, data engineers, and junior developers whose best evidence is things they built.',
      intro: [
        'Developer puts your work before your job titles. A dark sidebar holds skills, links, certificates, education and languages, and the main column is built from cards: projects with their stack and a link, achievements, open-source work and publications alongside your experience.',
        'It suits developers and data people whose strongest evidence is something they built or shipped: a product, a library, a pipeline, a side project with real users. For a junior developer the project cards can carry most of the page; for a senior one they sit beside a longer experience section.',
      ],
      faq: [
        ['Is the dark sidebar a problem for applicant tracking systems?', 'It can be for some parsers, which is why the ATS view exists: it rebuilds the same content as one plain column with standard headings. Use it for online application forms and keep the designed version for email and print.'],
        ['How many projects should I show?', 'Two or three with a measurable outcome usually beat six without one. Each card has room for a stack line and a link, so pick the projects you would happily be asked about in an interview.'],
        ['Can I move sections between the sidebar and the main column?', 'Yes. Open a section in Direct Edit and choose Main or Sidebar. Moving Skills into the main column, for example, gives a long technical list more room.'],
      ],
      tips: [
        'Lead the main column with two or three projects that have a measurable outcome. The cards give each one room for a link and a stack line.',
        'Keep the sidebar skills list to about twelve items. Past that it runs below the fold of page one and pushes Education onto page two.',
        'Put your GitHub URL in Links. It renders as its own icon row in the sidebar, right after Skills — not in the header, which only shows email, phone, and location.',
      ],
    },
    fi: {
      bestFor: 'Frontend-kehittäjille, data engineereille ja juniorikehittäjille, joiden vahvin näyttö on itse rakennetut asiat.',
      intro: [
        'Kehittäjä nostaa työsi tehtävänimikkeiden edelle. Tumma sivupalkki kokoaa taidot, linkit, sertifikaatit, koulutuksen ja kielet, ja pääpalsta rakentuu korteista: projektit teknologioineen ja linkkeineen, saavutukset, avoimen lähdekoodin työ ja julkaisut työkokemuksen rinnalla.',
        'Se sopii kehittäjille ja data-alan ammattilaisille, joiden vahvin näyttö on jotain itse rakennettua tai julkaistua: tuote, kirjasto, dataputki tai sivuprojekti oikeine käyttäjineen. Juniorikehittäjällä projektikortit voivat kantaa suurimman osan sivusta, kokeneemmalla ne kulkevat pidemmän työhistorian rinnalla.',
      ],
      faq: [
        ['Onko tumma sivupalkki ongelma hakijaseurantajärjestelmille?', 'Joillekin järjestelmille voi olla, ja siksi ATS-näkymä on olemassa: se kokoaa saman sisällön yhdeksi tavalliseksi palstaksi vakio-otsikoin. Käytä sitä verkkolomakkeissa ja pidä suunniteltu versio sähköpostiin ja tulosteeseen.'],
        ['Kuinka monta projektia kannattaa näyttää?', 'Kaksi tai kolme projektia mitattavine tuloksineen voittaa yleensä kuusi ilman tulosta. Jokaisessa kortissa on tilaa teknologiariville ja linkille, joten valitse projektit, joista kertoisit mielelläsi haastattelussa.'],
        ['Voinko siirtää osioita sivupalkin ja pääpalstan välillä?', 'Voit. Avaa osio Suora muokkaus -tilassa ja valitse Pääsarake tai Sivupalkki. Kun siirrät esimerkiksi Taidot pääpalstaan, pitkä tekninen lista saa enemmän tilaa.'],
      ],
      tips: [
        'Aloita pääpalsta kahdella tai kolmella projektilla, joilla on mitattava tulos. Korteissa jokaiselle mahtuu linkki ja teknologiarivi.',
        'Pidä sivupalkin taitolista noin kahdessatoista kohdassa. Pidempi lista valuu ensimmäisen sivun alaosaan ja työntää Koulutuksen toiselle sivulle.',
        'Lisää GitHub-osoitteesi Linkkeihin. Se näkyy omana ikonirivinään sivupalkissa, suoraan Taitojen jälkeen — ei otsikossa, joka näyttää vain sähköpostin, puhelimen ja paikkakunnan.',
      ],
    },
  },
  minimal: {
    en: {
      bestFor: 'Nurses, accountants, and cybersecurity analysts — anyone who wants a CV that reads as competent, not designed.',
      intro: [
        'Minimalist is the template to choose when you want the content to do all the work. It uses one column, one type family and thin rules between sections; the only colour is a soft amber band behind your name and contact details. Nothing on the page competes with what you write.',
        'That restraint suits fields where a CV is read for facts and reliability rather than personality: nursing, accounting, IT support, security and the public sector. It also suits anyone unsure which template to pick, because it looks deliberate rather than plain at any length.',
      ],
      faq: [
        ['Will an applicant tracking system read it?', 'Yes. It is already a single column with standard section names, and the ATS view removes the header band and the remaining styling for a version any system can parse.'],
        ['How long should a Minimalist CV be?', 'One page for up to about five years of experience, two after that. Because every section runs the full width, long bullets add lines quickly; keeping each to one line is the easiest way to stay within two pages.'],
        ['Which sections does it include?', 'About, Experience, Education, Skills and Links. Certificates, languages and the other optional sections stay in your data but are not shown here, so choose Classic Professional or Compact if you need them on the page.'],
      ],
      tips: [
        'There is no sidebar to catch overflow, so every section runs the full page width. Keep bullets to one line each so the page stays scannable.',
        'Contact details live in the amber-tinted header band, not a side column — put only phone, email, and location there, nothing else.',
        'Section labels are small, uppercase, and widely spaced on purpose. Resist adding icons or color to them; the restraint is the template\'s whole point.',
      ],
    },
    fi: {
      bestFor: 'Sairaanhoitajille, kirjanpitäjille ja kyberturvallisuusanalyytikoille — kaikille, joiden CV:n halutaan näyttää asialliselta, ei suunnitellulta.',
      intro: [
        'Minimalisti on pohja silloin, kun haluat sisällön tekevän kaiken työn. Siinä on yksi palsta, yksi kirjasinperhe ja ohuet viivat osioiden välissä; ainoa väri on pehmeä meripihkan sävy nimesi ja yhteystietojesi takana. Mikään sivulla ei kilpaile kirjoittamasi kanssa.',
        'Pidättyvyys sopii aloille, joilla CV:stä luetaan faktoja ja luotettavuutta eikä persoonaa: hoitotyöhön, taloushallintoon, IT-tukeen, tietoturvaan ja julkiselle sektorille. Se sopii myös, jos et tiedä mikä pohja valita, sillä se näyttää harkitulta eikä tylsältä minkä pituisena tahansa.',
      ],
      faq: [
        ['Lukeeko hakijaseurantajärjestelmä sen?', 'Kyllä. Se on valmiiksi yksipalstainen ja käyttää tavallisia osioiden nimiä, ja ATS-näkymä poistaa otsikkokaistan ja muun muotoilun, jolloin jäljelle jää versio, jonka mikä tahansa järjestelmä lukee.'],
        ['Kuinka pitkä Minimalisti-CV:n kannattaa olla?', 'Yksi sivu noin viiden vuoden kokemukseen asti, sen jälkeen kaksi. Koska jokainen osio on koko sivun levyinen, pitkät kohdat lisäävät rivejä nopeasti; kun pidät jokaisen kohdan yhdellä rivillä, pysyt helpoimmin kahdessa sivussa.'],
        ['Mitä osioita siinä on?', 'Esittely, Kokemus, Koulutus, Taidot ja Linkit. Sertifikaatit, kielet ja muut valinnaiset osiot säilyvät tiedoissasi mutta eivät näy tässä pohjassa, joten valitse Klassinen ammattilainen tai Tiivis, jos tarvitset niitä sivulla.'],
      ],
      tips: [
        'Sivupalkkia ei ole, joten joka osio venyy koko sivun levyiseksi. Pidä rivit lyhyinä, jotta sivu pysyy helposti silmäiltävänä.',
        'Yhteystiedot ovat ambran-sävyisessä otsikkopalkissa, ei sivupalkissa — laita siihen vain puhelin, sähköposti ja paikkakunta, ei muuta.',
        'Osiotunnisteet ovat tarkoituksella pieniä, isoja kirjaimia ja väljästi aseteltuja. Älä lisää niihin ikoneita tai väriä — hillittyys on koko pohjan idea.',
      ],
    },
  },
  creative: {
    en: {
      bestFor: 'UX designers, graphic designers, and other creative roles that benefit from a distinct visual personality.',
      intro: [
        'Creative is laid out like an editorial spread: a full-width header, numbered section headings (01, 02, 03…) and a single accent colour that runs through every heading and divider. Experience and projects take the wide main column; skills, education, certificates, links, languages and interests sit in the narrower one.',
        'It suits designers, illustrators, writers and other creative professionals who want the CV itself to show some judgement about layout, without turning it into a poster. The numbering gives the page a reading order, so it works best when your strongest section comes first.',
      ],
      faq: [
        ['Does the accent colour matter?', 'More than on most templates, because it tints every heading and divider. Pick one of the template\'s three looks or set your own heading colour, and keep it close to the colours in your portfolio.'],
        ['Should I still include a portfolio link?', 'Yes, near the top. A CV for creative work points to the portfolio rather than replacing it; put the link in Links and mention the projects it shows in your experience.'],
        ['Is it ATS-friendly?', 'The designed version is meant for people. The ATS view turns the same content into one plain column with standard headings for online application systems.'],
      ],
      tips: [
        'The numbered section headings (01, 02, 03…) set a reading order — put your strongest section at number one, not just Experience by default.',
        'Pick an accent color that matches your personal brand in Settings; it tints every heading and divider, so it does more work here than on other templates.',
        'Keep Projects in the main column and push Education and Certificates into the secondary column — this template is built to foreground recent work.',
      ],
    },
    fi: {
      bestFor: 'UX-suunnittelijoille, graafisille suunnittelijoille ja muihin luoviin rooleihin, joissa omaleimainen ulkoasu on eduksi.',
      intro: [
        'Luova on taitettu kuin lehden aukeama: koko leveyden otsikko, numeroidut osiot (01, 02, 03…) ja yksi korostusväri, joka kulkee jokaisessa otsikossa ja erottimessa. Kokemus ja projektit saavat leveän pääpalstan; taidot, koulutus, sertifikaatit, linkit, kielet ja kiinnostuksen kohteet ovat kapeammassa.',
        'Se sopii suunnittelijoille, kuvittajille, kirjoittajille ja muille luovan alan ammattilaisille, jotka haluavat CV:n itsessään näyttävän harkintaa taiton suhteen tekemättä siitä julistetta. Numerointi antaa sivulle lukujärjestyksen, joten pohja toimii parhaiten, kun vahvin osiosi tulee ensin.',
      ],
      faq: [
        ['Onko korostusvärillä väliä?', 'Enemmän kuin useimmissa pohjissa, sillä se sävyttää jokaisen otsikon ja erottimen. Valitse jokin pohjan kolmesta tyylistä tai oma otsikkoväri, ja pidä se lähellä portfoliosi värejä.'],
        ['Kannattaako portfoliolinkki silti lisätä?', 'Kyllä, lähelle alkua. Luovan työn CV ohjaa portfolioon eikä korvaa sitä; lisää linkki Linkkeihin ja mainitse kokemuksessa projektit, jotka portfolio näyttää.'],
        ['Onko se ATS-ystävällinen?', 'Suunniteltu versio on tarkoitettu ihmisille. ATS-näkymä muuttaa saman sisällön yhdeksi tavalliseksi palstaksi vakio-otsikoin verkkohakujärjestelmiä varten.'],
      ],
      tips: [
        'Numeroidut osiotunnisteet (01, 02, 03…) määräävät lukujärjestyksen — laita vahvin osiosi ensimmäiseksi, ei automaattisesti Kokemusta.',
        'Valitse Asetuksista aksenttiväri, joka sopii omaan brändiisi — se sävyttää joka otsikon ja erottimen, niin se vaikuttaa tässä enemmän kuin muissa pohjissa.',
        'Pidä Projektit pääpalstalla ja siirrä Koulutus ja Todistukset sivupalstalle — pohja on rakennettu nostamaan viimeisimmän työn etusijalle.',
      ],
    },
  },
  modern: {
    en: {
      bestFor: 'Marketing managers, project managers, and product managers who want a clear, step-by-step career story.',
      intro: [
        'Modern Professional is a consulting-style layout: a circular photo in the header, a rose-coloured timeline running down your experience, and a sidebar for skills, languages, certificates, links and interests. The timeline makes the order of your roles easy to follow at a glance.',
        'It suits people whose career is a clear progression, such as marketing, project and product managers moving from specialist to lead roles, and anyone whose CV should read as a story with steps. Education, projects and achievements share the main column with experience.',
      ],
      faq: [
        ['Do I need a photo?', 'No. The header works with or without one, and you can hide the photo for this template in the header\'s editor if the employer or country prefers CVs without photos.'],
        ['How long can it be?', 'Two pages is comfortable. The timeline makes each role a separate step, so older roles can shrink to a title, dates and one line without breaking the rhythm.'],
        ['Is it ATS-friendly?', 'Use the ATS view for online forms: it keeps the content and drops the timeline, photo and sidebar for a single standard column.'],
      ],
      tips: [
        'Upload a photo — the circular frame in the header is a deliberate part of this template, unlike most others where a photo is optional chrome.',
        'The rose timeline runs down Experience; keep each role to three or four bullets so the dots line up with distinct, readable steps.',
        'Projects and Achievements sit in the main column after Education — use them for the one or two wins that don\'t fit inside a job bullet.',
      ],
    },
    fi: {
      bestFor: 'Markkinointipäälliköille, projektipäälliköille ja tuotepäälliköille, jotka haluavat selkeän, vaihe vaiheelta etenevän uratarinan.',
      intro: [
        'Moderni ammattilainen on konsulttityylinen pohja: pyöreä kuva otsikossa, ruusunsävyinen aikajana kokemuksen vierellä ja sivupalkki taidoille, kielille, sertifikaateille, linkeille ja kiinnostuksen kohteille. Aikajana tekee tehtäviesi järjestyksestä helpon seurata yhdellä silmäyksellä.',
        'Se sopii, kun urasi on selvä eteneminen, esimerkiksi markkinointi-, projekti- tai tuotepäällikölle, joka on edennyt asiantuntijasta vetäjäksi, ja kenelle tahansa, jonka CV:n kuuluu kertoa tarina vaihe vaiheelta. Koulutus, projektit ja saavutukset jakavat pääpalstan kokemuksen kanssa.',
      ],
      faq: [
        ['Tarvitsenko kuvan?', 'Et. Otsikko toimii kuvan kanssa ja ilman, ja voit piilottaa kuvan tästä pohjasta otsikon muokkaimessa, jos työnantaja tai maa suosii CV:itä ilman kuvaa.'],
        ['Kuinka pitkä siitä voi tulla?', 'Kaksi sivua on luonteva pituus. Aikajanalla jokainen tehtävä on oma vaiheensa, joten vanhemmat tehtävät voi tiivistää nimikkeeseen, päivämääriin ja yhteen riviin rikkomatta rytmiä.'],
        ['Onko se ATS-ystävällinen?', 'Käytä verkkolomakkeissa ATS-näkymää: se säilyttää sisällön mutta jättää pois aikajanan, kuvan ja sivupalkin, jolloin jäljelle jää yksi tavallinen palsta.'],
      ],
      tips: [
        'Lisää valokuva — otsikon pyöreä kuvakehys on tämän pohjan tarkoituksellinen osa, toisin kuin useimmissa muissa, joissa kuva on vapaaehtoinen.',
        'Roosa aikajana kulkee Kokemus-osion läpi; pidä jokainen rooli kolmessa tai neljässä pisteessä, jotta pisteet erottuvat selkeinä askelina.',
        'Projektit ja Saavutukset ovat pääpalstalla Koulutuksen jälkeen — käytä niitä yhteen tai kahteen voittoon, joka ei mahdu työkokemuksen pisteisiin.',
      ],
    },
  },
  executive: {
    en: {
      bestFor: 'Finance directors, operations managers, and engineering directors whose CV leads with outcomes over chronology.',
      intro: [
        'Executive is deliberately restrained: no timeline, no icons, one accent colour and a sidebar for core strengths, skills, certificates, languages and memberships. The main column leads with your summary and experience, followed by a separate Leadership section, projects, achievements and education.',
        'It is built for senior managers and directors whose CV should lead with outcomes and scope rather than a chronological story: the budget, the team, the turnaround. The separate Leadership section lets you show board roles, mentoring or transformation programmes without crowding your job history.',
      ],
      faq: [
        ['What goes in Leadership rather than Experience?', 'Experience is your job history. Leadership is for scope that cuts across it: teams you built, programmes you led, board or committee roles. Give it numbers, such as team size, budget or the number of countries.'],
        ['What are core strengths?', 'A short list of what you are hired for, such as financial planning, post-merger integration or operational turnaround. Four to six items of a few words each read better than a long list of skills.'],
        ['Is it ATS-friendly?', 'The layout is conservative already, and the ATS view removes the sidebar for a single standard column when an online application system needs it.'],
      ],
      tips: [
        'Leadership is its own primary section, separate from Experience — use it for scope (team size, budget, reporting line), not another job history.',
        'The Core Strengths sidebar is built for short keyword phrases, not sentences; four to six phrases read cleanest against the restrained layout.',
        'There is no timeline graphic on purpose — if a role needs dates emphasized over impact, this is the wrong template for that role.',
      ],
    },
    fi: {
      bestFor: 'Talousjohtajille, operatiivisille päälliköille ja kehitysjohtajille, joiden CV nostaa tulokset kronologian edelle.',
      intro: [
        'Johtaja on tarkoituksella pidättyvä: ei aikajanaa, ei ikoneita, yksi korostusväri ja sivupalkki vahvuuksille, taidoille, sertifikaateille, kielille ja jäsenyyksille. Pääpalsta alkaa esittelyllä ja kokemuksella, ja niitä seuraavat erillinen Johtamiskokemus-osio, projektit, saavutukset ja koulutus.',
        'Se on tehty ylemmille esihenkilöille ja johtajille, joiden CV:n kuuluu alkaa tuloksista ja vastuun laajuudesta eikä aikajärjestyksestä: budjetti, tiimi, käänne. Erillisessä Johtamiskokemus-osiossa voit näyttää hallitustehtävät, mentoroinnin tai muutosohjelmat ilman, että työhistoria täyttyy.',
      ],
      faq: [
        ['Mitä kuuluu Johtamiskokemukseen eikä Kokemukseen?', 'Kokemus on työhistoriasi. Johtamiskokemus on vastuuta, joka ulottuu sen yli: rakentamasi tiimit, vetämäsi ohjelmat, hallitus- tai toimikuntatehtävät. Anna sille lukuja, kuten tiimin koko, budjetti tai maiden määrä.'],
        ['Mitä vahvuuksiin kirjoitetaan?', 'Lyhyt lista siitä, mihin sinut palkataan, esimerkiksi taloussuunnittelu, yritysostojen integrointi tai toiminnan käänne. Neljästä kuuteen muutaman sanan kohtaa toimii paremmin kuin pitkä taitolista.'],
        ['Onko se ATS-ystävällinen?', 'Asettelu on jo valmiiksi hillitty, ja ATS-näkymä poistaa sivupalkin, jolloin jäljelle jää yksi tavallinen palsta, kun verkkohakujärjestelmä sitä vaatii.'],
      ],
      tips: [
        'Johtavuus on omana pääosionaan, erillään Kokemuksesta — käytä sitä vastuualueen laajuuteen (tiimin koko, budjetti, raportointisuhde), ei toisena työhistoriana.',
        'Ydinvahvuudet-sivupalkki on tehty lyhyille avainsanoille, ei virkkeille; neljä–kuusi ilmausta näyttää siistiltä hillityssä asettelussa.',
        'Aikajanagrafiikkaa ei ole tarkoituksella — jos jokin rooli vaatii päivämäärien korostamista vaikutuksen sijaan, tämä ei ole sille oikea pohja.',
      ],
    },
  },
  timeline: {
    en: {
      bestFor: 'Project managers, teachers, and operations managers with a long, linear career story worth walking through in order.',
      intro: [
        'Modern Timeline is a single column with a vertical line running through your career: each role, degree or project is a point on it, with its dates beside it. The accent colour marks the timeline and the headings and nothing else.',
        'Because it is one column, it reads straight down like a story and suits almost any field: teachers, project managers, operations managers, and people changing direction who want the sequence of their roles to explain itself. Skills, languages and certificates follow at the end of the page.',
      ],
      faq: [
        ['Is a timeline ATS-friendly?', 'Yes. The ATS view keeps this template\'s own design in a simplified form rather than switching to a different layout, so the order and dates stay as you see them and the decoration is removed.'],
        ['What if I have gaps between roles?', 'A timeline makes gaps visible, so name them: a line such as "Parental leave" or "Full-time studies" with dates is better than a silent gap.'],
        ['How long should it be?', 'One to two pages. The timeline gives every entry the same weight, so shorten older roles to a title and dates rather than letting them take as much space as recent ones.'],
      ],
      tips: [
        'Every role becomes a dot on the vertical line — keep role titles short, since the dot and date sit right next to them in a fixed-width column.',
        'Skills, Languages, and Certificates are all primary sections here, not sidebar extras, so budget page length for them below Experience.',
        'There is no secondary column to hide anything in — if a section is thin, consider leaving it out rather than padding it to fill space.',
      ],
    },
    fi: {
      bestFor: 'Projektipäälliköille, opettajille ja operatiivisille päälliköille, joiden pitkä, suoraviivainen uratarina kannattaa käydä läpi järjestyksessä.',
      intro: [
        'Moderni aikajana on yksipalstainen pohja, jonka urasi läpi kulkee pystysuora viiva: jokainen tehtävä, tutkinto tai projekti on piste sillä, päivämäärät vieressä. Korostusväri merkitsee aikajanan ja otsikot eikä mitään muuta.',
        'Koska se on yksipalstainen, se luetaan suoraan alaspäin kuin tarina ja sopii lähes mille alalle tahansa: opettajille, projektipäälliköille, operatiivisille päälliköille ja alanvaihtajille, jotka haluavat tehtäviensä järjestyksen selittävän itse itsensä. Taidot, kielet ja sertifikaatit tulevat sivun lopussa.',
      ],
      faq: [
        ['Onko aikajana ATS-ystävällinen?', 'On. ATS-näkymä säilyttää pohjan oman ilmeen yksinkertaistettuna sen sijaan, että vaihtaisi toiseen asetteluun, joten järjestys ja päivämäärät pysyvät näkemässäsi muodossa ja koristeet poistuvat.'],
        ['Entä jos tehtävieni välissä on taukoja?', 'Aikajana tuo tauot näkyviin, joten nimeä ne: rivi kuten "Vanhempainvapaa" tai "Päätoimiset opinnot" päivämäärineen on parempi kuin selittämätön aukko.'],
        ['Kuinka pitkä sen kannattaa olla?', 'Yhdestä kahteen sivua. Aikajana antaa jokaiselle kohdalle saman painon, joten tiivistä vanhemmat tehtävät nimikkeeseen ja päivämääriin sen sijaan, että ne veisivät yhtä paljon tilaa kuin tuoreet.'],
      ],
      tips: [
        'Jokaisesta roolista tulee piste pystyviivalle — pidä tehtävänimikkeet lyhyinä, koska piste ja päivämäärä ovat niiden vieressä kiinteänlevyisessä sarakkeessa.',
        'Taidot, Kielet ja Todistukset ovat tässä pääosioita, ei sivupalkin lisukkeita, niin varaa niille sivutilaa Kokemuksen jälkeen.',
        'Sivupalstaa ei ole, johon voisi piilottaa mitään — jos osio jää ohueksi, jätä se mieluummin pois kuin täytä sitä tyhjällä tilalla.',
      ],
    },
  },
  graduate: {
    en: {
      bestFor: 'Junior developers and business graduates whose degree, academic projects, and internships are their strongest material.',
      intro: [
        'Graduate turns the usual order around: education comes first, followed by academic projects, internships, experience, publications and volunteering. Skills, languages, certificates, links, achievements, interests and memberships sit in the side column, and one accent colour ties the page together.',
        'It suits students, recent graduates and career changers coming out of a degree or a bootcamp, whose strongest evidence is what they studied and built rather than years in a job. A thesis, a capstone project or an internship with a real result can fill the space a long work history would.',
      ],
      faq: [
        ['What if I have no work experience yet?', 'Keep Experience short or hide it, and let Projects and Internships carry the page. Describe each project like a job: what you built, with what, and what came of it, such as a grade, a user count or a client who used it.'],
        ['Should I list my courses?', 'Only the ones relevant to the job, in a single line under the degree. A thesis or capstone with its topic and result says more than a full list of modules.'],
        ['Is it ATS-friendly?', 'The ATS view rebuilds the same content as one plain column with standard headings for online application systems.'],
      ],
      tips: [
        'Education sits above Experience here — put your degree, thesis topic, and relevant coursework first, since that\'s what this layout is built to lead with.',
        'Internships gets its own primary section, separate from Experience; use it even for a single short placement rather than folding it into Experience.',
        'Achievements and Memberships are secondary-column extras — a scholarship, a hackathon placement, or a student society role all belong there.',
      ],
    },
    fi: {
      bestFor: 'Juniorikehittäjille ja kauppatieteiden vastavalmistuneille, joiden vahvin näyttö on tutkinto, opintoprojektit ja harjoittelut.',
      intro: [
        'Tutkinto kääntää tavallisen järjestyksen: ensin tulee koulutus, sitten opintoprojektit, harjoittelut, kokemus, julkaisut ja vapaaehtoistyö. Taidot, kielet, sertifikaatit, linkit, saavutukset, kiinnostuksen kohteet ja jäsenyydet ovat sivupalstassa, ja yksi korostusväri sitoo sivun yhteen.',
        'Se sopii opiskelijoille, vastavalmistuneille ja alanvaihtajille, joiden vahvin näyttö on opiskeltu ja rakennettu eivätkä vuodet työpaikassa. Opinnäytetyö, päättöprojekti tai tulokseen johtanut harjoittelu voi täyttää tilan, jonka pitkä työhistoria muuten veisi.',
      ],
      faq: [
        ['Entä jos minulla ei ole vielä työkokemusta?', 'Pidä Kokemus lyhyenä tai piilota se ja anna Projektien ja Harjoittelujen kantaa sivua. Kuvaa jokainen projekti kuin työtehtävä: mitä rakensit, millä välineillä ja mitä siitä seurasi, esimerkiksi arvosana, käyttäjämäärä tai asiakas, joka otti sen käyttöön.'],
        ['Kannattaako kurssit luetella?', 'Vain työhön liittyvät, yhdellä rivillä tutkinnon alla. Opinnäytetyö tai päättöprojekti aiheineen ja tuloksineen kertoo enemmän kuin koko kurssilista.'],
        ['Onko se ATS-ystävällinen?', 'ATS-näkymä kokoaa saman sisällön yhdeksi tavalliseksi palstaksi vakio-otsikoin verkkohakujärjestelmiä varten.'],
      ],
      tips: [
        'Koulutus on tässä Kokemuksen yläpuolella — laita tutkinto, opinnäytteen aihe ja olennaiset kurssit ensin, sillä pohja on rakennettu nostamaan ne esiin.',
        'Harjoittelut saa omaan pääosioonsa, erillään Kokemuksesta — käytä sitä vaikka yhdelle lyhyelle harjoittelujaksolle sen niputtamisen sijaan Kokemukseen.',
        'Saavutukset ja Jäsenyydet ovat sivupalstan lisätietoja — apuraha, hackathon-sijoitus tai opiskelijajärjestön rooli kuuluvat tänne.',
      ],
    },
  },
  compact: {
    en: {
      bestFor: 'Data engineers, cybersecurity analysts, and business graduates with a long history that still needs to fit one page.',
      intro: [
        'Compact is a one-column, one-page format that adjusts its own spacing: as you add content, it tightens line height, margins and gaps in steps until everything fits on a single page. Skills come straight after the summary, followed by experience, projects, education, certificates, languages, links and interests.',
        'It suits people with a long or detailed history who are applying where a one-page CV is expected, such as data engineers, IT specialists and security analysts with many tools, certifications and short projects to list. It also makes a good second, shorter version of a CV you keep in a roomier template.',
      ],
      faq: [
        ['What happens when my content no longer fits?', 'Compact first tightens its spacing in steps. Once it is at its tightest, extra content runs onto a second page, which is the signal to cut the oldest or least relevant lines rather than keep adding.'],
        ['Why are skills near the top?', 'For technical roles the first thing a reader checks is whether you use the right tools. Putting skills straight after the summary answers that before the experience section starts.'],
        ['Is it ATS-friendly?', 'Yes. It is a single column with standard headings, and the ATS view removes the remaining colour and styling for application systems.'],
      ],
      tips: [
        'The template shrinks its own spacing automatically as you add content — don\'t manually trim sections to fit; let the density ramp do that work.',
        'Skills renders as inline comma lists, not tags or bars, so a long skills section costs far less vertical space here than on other templates.',
        'The accent-tinted header band and the single tight column are the template\'s only fixed chrome — there\'s no sidebar to move sections into if the page runs long.',
      ],
    },
    fi: {
      bestFor: 'Data engineereille, kyberturvallisuusanalyytikoille ja kauppatieteiden vastavalmistuneille, joiden pitkä historia on saatava mahtumaan yhdelle sivulle.',
      intro: [
        'Tiivis on yksipalstainen yhden sivun pohja, joka säätää omia välejään: kun lisäät sisältöä, se tiivistää riviväliä, marginaaleja ja välistyksiä portaittain, kunnes kaikki mahtuu yhdelle sivulle. Taidot tulevat heti esittelyn jälkeen, ja niitä seuraavat kokemus, projektit, koulutus, sertifikaatit, kielet, linkit ja kiinnostuksen kohteet.',
        'Se sopii, kun sinulla on pitkä tai yksityiskohtainen historia ja haet paikkaa, jossa odotetaan yhden sivun CV:tä, esimerkiksi data engineerille, IT-asiantuntijalle tai tietoturva-analyytikolle, jolla on paljon työkaluja, sertifikaatteja ja lyhyitä projekteja. Se toimii myös toisena, lyhyempänä versiona CV:stä, jota pidät väljemmässä pohjassa.',
      ],
      faq: [
        ['Mitä tapahtuu, kun sisältö ei enää mahdu?', 'Tiivis tiivistää ensin välejään portaittain. Kun se on tiiveimmillään, ylimääräinen sisältö jatkuu toiselle sivulle, ja se on merkki karsia vanhimpia tai vähiten olennaisia rivejä eikä lisätä uusia.'],
        ['Miksi taidot ovat ylhäällä?', 'Teknisissä tehtävissä lukija tarkistaa ensimmäiseksi, käytätkö oikeita työkaluja. Kun taidot tulevat heti esittelyn jälkeen, vastaus löytyy ennen kokemusta.'],
        ['Onko se ATS-ystävällinen?', 'Kyllä. Se on yksipalstainen ja käyttää vakio-otsikoita, ja ATS-näkymä poistaa jäljellä olevan värin ja muotoilun hakujärjestelmiä varten.'],
      ],
      tips: [
        'Pohja pienentää välejään automaattisesti sisällön kasvaessa — älä lyhennä osioita käsin, anna tiiviysasteen hoitaa se puolesta.',
        'Taidot näkyvät pilkuin eroteltuna rivinä, ei tageina tai palkkeina, niin pitkä taito-osio vie tässä huomattavasti vähemmän tilaa kuin muissa pohjissa.',
        'Aksenttivärinen otsikkopalkki ja yksi tiivis palsta ovat pohjan ainoa kiinteä kehys — sivupalkkia ei ole, johon siirtää osioita jos sivu pitenee.',
      ],
    },
  },
  portfolio: {
    en: {
      bestFor: 'Frontend developers, UX designers, and product managers whose work speaks for itself through projects.',
      intro: [
        'Portfolio Hybrid is built around featured work. Project cards with tech-stack badges lead the main column, followed by experience, case studies, open-source work, education and testimonials; skills, certificates, links, languages, achievements and interests sit in the side column.',
        'It suits product managers, designers and developers who can point to specific pieces of work and want them read before the job history: a launch, a redesign, a case study with numbers. The case-study and testimonial sections make room for the context and the quotes a plain experience list leaves out.',
      ],
      faq: [
        ['What makes a good case study here?', 'The problem, what you did and the result, in three or four lines: for example a checkout redesign that cut drop-off by a fifth. Link to the full write-up in your portfolio rather than pasting it in.'],
        ['Should I include testimonials?', 'One or two short quotes from a manager or client, with their role, add credibility if they say something specific. A generic "great to work with" adds nothing; leave the section out instead.'],
        ['Is it ATS-friendly?', 'The cards and badges are for people. The ATS view turns the same content into one plain column with standard headings for online application systems.'],
      ],
      tips: [
        'Lead Projects with a tech-stack badge per card — that\'s the one visual element this template gives you that a plain bullet list can\'t.',
        'Case Studies is a separate primary section from Projects; use it for the one or two pieces of work worth a longer walkthrough, not a repeat list.',
        'Testimonials closes out the main column, after Education — a short quote from a manager or client there reads as social proof right before the page ends.',
      ],
    },
    fi: {
      bestFor: 'Frontend-kehittäjille, UX-suunnittelijoille ja tuotepäälliköille, joiden työ puhuu puolestaan projektien kautta.',
      intro: [
        'Portfoliohybridi rakentuu esiteltyjen töiden ympärille. Projektikortit teknologiamerkkeineen aloittavat pääpalstan, ja niitä seuraavat kokemus, tapaustutkimukset, avoimen lähdekoodin työ, koulutus ja suositukset; taidot, sertifikaatit, linkit, kielet, saavutukset ja kiinnostuksen kohteet ovat sivupalstassa.',
        'Se sopii tuotepäälliköille, suunnittelijoille ja kehittäjille, jotka voivat osoittaa tiettyjä töitä ja haluavat ne luettavan ennen työhistoriaa: lanseerauksen, uudistuksen tai tapaustutkimuksen lukuineen. Tapaustutkimukset ja suositukset antavat tilaa taustalle ja lainauksille, jotka pelkkä työkokemuslista jättää pois.',
      ],
      faq: [
        ['Millainen on hyvä tapaustutkimus?', 'Ongelma, mitä teit ja tulos kolmella tai neljällä rivillä: esimerkiksi kassasivun uudistus, joka vähensi keskeytyksiä viidenneksellä. Linkitä koko kuvaus portfolioosi sen sijaan, että liittäisit sen tähän.'],
        ['Kannattaako suosituksia lisätä?', 'Yksi tai kaksi lyhyttä lainausta esihenkilöltä tai asiakkaalta tehtävänimikkeineen lisää uskottavuutta, jos ne sanovat jotain konkreettista. Yleinen "mukava työskennellä yhdessä" ei lisää mitään; jätä osio silloin pois.'],
        ['Onko se ATS-ystävällinen?', 'Kortit ja merkit on tehty ihmisille. ATS-näkymä muuttaa saman sisällön yhdeksi tavalliseksi palstaksi vakio-otsikoin verkkohakujärjestelmiä varten.'],
      ],
      tips: [
        'Aloita Projektit-osio teknologiamerkillä per kortti — se on yksi visuaalinen elementti, jota tavallinen luettelo ei anna.',
        'Tapaustutkimukset on oma pääosionsa, erillään Projekteista; käytä sitä yhteen tai kahteen työhön, joka ansaitsee pidemmän läpikäynnin, ei toistolistaa.',
        'Suositukset päättävät pääpalstan, Koulutuksen jälkeen — lyhyt lainaus esimieheltä tai asiakkaalta toimii sosiaalisena näyttönä juuri ennen sivun loppua.',
      ],
    },
  },
  techExec: {
    en: {
      bestFor: 'Engineering directors and CTOs who want a leadership narrative with an annual-report, not a resume, feel.',
      intro: [
        'Tech Executive is laid out like an annual report: a deep-navy masthead and footer band frame a two-column body, with core strengths in a sidebar beside your summary, experience, education and skills. Certificates, projects, links, languages and interests share the sidebar with the strengths.',
        'It suits engineering directors, CTOs and other technology leaders whose CV should read as a record of scope and decisions rather than a list of tools. With a typical leadership history it fits on one page, which is often what a board or an executive search expects.',
      ],
      faq: [
        ['How do I keep it to one page?', 'Lead each role with its scope (team size, budget, platforms) and keep two or three outcome bullets per role. Roles older than ten to fifteen years can shrink to a title, company and dates.'],
        ['What should the core strengths say?', 'Four to six areas you are hired for, such as platform strategy, engineering hiring or cloud cost control, each in a few words. They sit next to the summary, so they are the first thing a reader checks against the role.'],
        ['Is it ATS-friendly?', 'The masthead and sidebar are for people. The ATS view rebuilds the content as one plain column with standard headings for application systems.'],
      ],
      tips: [
        'The navy masthead and matching footer band are fixed around the body — treat your name and title as a banner headline, not a header label.',
        'Core Strengths is a sidebar list separate from Skills; use it for leadership capabilities (org design, P&L, platform strategy), not tools.',
        'Keep Experience bullets outcome-first — the royal-blue rule under each heading is doing the visual separation, so the text itself can stay dense.',
      ],
    },
    fi: {
      bestFor: 'Kehitysjohtajille ja teknologiajohtajille, jotka haluavat johtajuustarinan, jossa on vuosikertomuksen, ei ansioluettelon, tuntu.',
      intro: [
        'Tekninen johtaja on taitettu kuin vuosikertomus: tummansininen yläkaista ja alakaista kehystävät kaksipalstaisen rungon, jossa vahvuudet ovat sivupalkissa esittelyn, kokemuksen, koulutuksen ja taitojen vierellä. Sertifikaatit, projektit, linkit, kielet ja kiinnostuksen kohteet jakavat sivupalkin vahvuuksien kanssa.',
        'Se sopii kehitysjohtajille, teknologiajohtajille ja muille teknologia-alan johtajille, joiden CV:n kuuluu kertoa vastuusta ja päätöksistä eikä luetella työkaluja. Tavallisella johtajahistorialla se mahtuu yhdelle sivulle, mitä hallitus tai johdon rekrytointi usein odottaa.',
      ],
      faq: [
        ['Miten pidän sen yhdessä sivussa?', 'Aloita jokainen tehtävä vastuun laajuudella (tiimin koko, budjetti, alustat) ja pidä kaksi tai kolme tuloskohtaa tehtävää kohden. Yli 10–15 vuotta vanhat tehtävät voi tiivistää nimikkeeseen, yritykseen ja päivämääriin.'],
        ['Mitä vahvuuksiin kirjoitetaan?', 'Neljästä kuuteen aluetta, joihin sinut palkataan, esimerkiksi alustastrategia, kehittäjärekrytointi tai pilvikustannusten hallinta, kukin muutamalla sanalla. Ne ovat esittelyn vieressä, joten lukija vertaa niitä tehtävään ensimmäisenä.'],
        ['Onko se ATS-ystävällinen?', 'Yläkaista ja sivupalkki on tehty ihmisille. ATS-näkymä kokoaa sisällön yhdeksi tavalliseksi palstaksi vakio-otsikoin hakujärjestelmiä varten.'],
      ],
      tips: [
        'Laivastonsininen otsikko- ja alapalkki ovat kiinteää kehystä rungon ympärillä — käsittele nimeäsi ja titteliäsi otsikkona, ei vain tunnisteena.',
        'Ydinvahvuudet on Taidoista erillinen sivupalkkilista; käytä sitä johtamiskykyihin (organisaatiosuunnittelu, tulosvastuu, alustastrategia), ei työkaluihin.',
        'Pidä Kokemus-osion tekstit tulosvetoisina — royal-blue-viiva joka otsikon alla hoitaa visuaalisen erottelun, niin itse teksti voi olla tiivistä.',
      ],
    },
  },
  classicProfessional: {
    en: {
      bestFor: 'Accountants, finance directors, and research scientists who want a universally safe choice for any industry.',
      intro: [
        'Classic Professional is the traditional CV: one column, thin dividers, a serif name you can centre or left-align, and sections in the order recruiters expect: summary, experience, education, skills, languages and certificates. Its three looks stay within a narrow, restrained range of colours.',
        'It suits accountants, finance professionals, researchers, lawyers and anyone applying to conservative employers or the public sector, where a CV that looks unusual can count against you. It is also the safest choice when you don\'t know who will read the CV, or how.',
      ],
      faq: [
        ['Centred or left-aligned name?', 'Centred reads as more formal and suits a one-page CV; left-aligned lines the name up with the rest of the page and uses less space on a two-page CV. You can switch between the two and see which suits your length.'],
        ['Does it work for an academic CV?', 'For a short one, yes. Put your research focus in the summary, list degrees with thesis titles under Education, and use Certificates for fellowships or professional qualifications. A long publication list works better as a separate document linked from Links.'],
        ['Is it ATS-friendly?', 'It is about as plain as a designed CV gets: one column and standard headings. The ATS view removes the last of the styling for systems that need plain text.'],
      ],
      tips: [
        'The serif name heading can be centered or left-aligned in Settings — centered reads more formal and suits a longer, conservative job title.',
        'This is single column with no sidebar, so Skills, Languages, and Certificates run in sequence below Education — order them by relevance, not habit.',
        'The thin dividers between sections are the only visual structure here on purpose; don\'t compensate by adding bold text or color the template doesn\'t use.',
      ],
    },
    fi: {
      bestFor: 'Kirjanpitäjille, talousjohtajille ja tutkijoille, jotka haluavat universaalisti turvallisen valinnan mille tahansa alalle.',
      intro: [
        'Klassinen ammattilainen on perinteinen CV: yksi palsta, ohuet erottimet, serif-kirjaimin kirjoitettu nimi keskitettynä tai vasemmalla ja osiot rekrytoijan odottamassa järjestyksessä: esittely, kokemus, koulutus, taidot, kielet ja sertifikaatit. Sen kolme tyyliä pysyvät kapeassa, hillityssä värivalikoimassa.',
        'Se sopii taloushallinnon ammattilaisille, tutkijoille, juristeille ja kaikille, jotka hakevat perinteisiin organisaatioihin tai julkiselle sektorille, missä erikoisen näköinen CV voi kääntyä itseään vastaan. Se on myös turvallisin valinta, kun et tiedä kuka CV:n lukee tai miten.',
      ],
      faq: [
        ['Nimi keskelle vai vasemmalle?', 'Keskitetty näyttää muodollisemmalta ja sopii yhden sivun CV:hen; vasemmalle tasattu nimi linjautuu muun sivun kanssa ja vie vähemmän tilaa kahden sivun CV:ssä. Voit vaihtaa näiden välillä ja katsoa, kumpi sopii pituuteesi.'],
        ['Sopiiko se akateemiseen CV:hen?', 'Lyhyeen sopii. Kerro tutkimusalasi esittelyssä, luettele tutkinnot opinnäytteiden nimineen Koulutuksessa ja käytä Sertifikaatteja apurahoille tai ammatillisille pätevyyksille. Pitkä julkaisuluettelo toimii paremmin erillisenä asiakirjana, johon linkität Linkeistä.'],
        ['Onko se ATS-ystävällinen?', 'Se on niin pelkistetty kuin suunniteltu CV voi olla: yksi palsta ja vakio-otsikot. ATS-näkymä poistaa viimeisetkin muotoilut järjestelmiä varten, jotka tarvitsevat pelkkää tekstiä.'],
      ],
      tips: [
        'Seriffityylinen nimiotsikko voidaan keskittää tai tasata vasemmalle Asetuksista — keskitetty näyttää muodollisemmalta ja sopii pidempään, perinteiseen tittelin.',
        'Pohja on yksipalstainen eikä sivupalkkia ole, niin Taidot, Kielet ja Todistukset kulkevat peräkkäin Koulutuksen jälkeen — järjestä ne relevanssin, ei tottumuksen, mukaan.',
        'Ohuet erottimet osioiden välissä ovat tarkoituksella pohjan ainoa visuaalinen rakenne — älä korvaa sitä lihavoinnilla tai väreillä, joita pohja ei käytä.',
      ],
    },
  },
  navyProfessional: {
    en: {
      bestFor: 'CTOs, sales managers, and research scientists who want an ATS-friendly look with a confident dark sidebar.',
      intro: [
        'Navy Professional pairs a dark navy sidebar for skills and languages with a white main column for your summary, experience, education and certificates, with blue accents on headings and dates. It is one of the more compact two-column layouts: with a typical history it fits on one page.',
        'It suits technology leaders, sales managers, researchers and other professionals who want a modern look that still reads as corporate. Because the sidebar holds only skills and languages, the main column carries nearly all the content and stays easy to scan.',
      ],
      faq: [
        ['Is the dark sidebar ATS-friendly?', 'Its ATS view keeps this template\'s own design in a simplified form rather than switching to a different layout: the content and order stay as you see them, without the decorative colour blocks.'],
        ['Can I move sections into the sidebar?', 'Yes. Open a section in Direct Edit and choose Main or Sidebar. Certificates, for example, can move to the sidebar if the main column runs long.'],
        ['How long can it be?', 'It is at its best on one page. If yours runs to two, shorten older roles to a title, dates and one line before cutting anything recent.'],
      ],
      tips: [
        'The navy sidebar is narrow by design — about a third of the page width — so keep Skills and Languages there to short, scannable lines, not paragraphs.',
        'Experience, Education, and Certificates all live in the wider main column; that\'s the order a reviewer scans first, so don\'t duplicate dates in the sidebar.',
        'This template keeps its own structure in ATS-friendly mode rather than falling back to the plain flat layout — one of the few that does.',
      ],
    },
    fi: {
      bestFor: 'Teknologiajohtajille, myyntipäälliköille ja tutkijoille, jotka haluavat ATS-ystävällisen ulkoasun itsevarmalla tummansinisellä sivupalkilla.',
      intro: [
        'Laivastonsininen ammattilainen yhdistää tummansinisen sivupalkin taidoille ja kielille ja valkoisen pääpalstan esittelylle, kokemukselle, koulutukselle ja sertifikaateille, ja otsikoissa ja päivämäärissä on sinisiä korostuksia. Se on tiiviimpiä kaksipalstaisia pohjia: tavallisella historialla se mahtuu yhdelle sivulle.',
        'Se sopii teknologiajohtajille, myyntipäälliköille, tutkijoille ja muille ammattilaisille, jotka haluavat modernin ilmeen, joka silti näyttää asialliselta. Koska sivupalkissa ovat vain taidot ja kielet, pääpalsta kantaa lähes kaiken sisällön ja pysyy helppona silmäillä.',
      ],
      faq: [
        ['Onko tumma sivupalkki ATS-ystävällinen?', 'Sen ATS-näkymä säilyttää pohjan oman ilmeen yksinkertaistettuna sen sijaan, että vaihtaisi toiseen asetteluun: sisältö ja järjestys pysyvät ennallaan ilman koristeellisia värialueita.'],
        ['Voinko siirtää osioita sivupalkkiin?', 'Voit. Avaa osio Suora muokkaus -tilassa ja valitse Pääsarake tai Sivupalkki. Sertifikaatit voivat esimerkiksi siirtyä sivupalkkiin, jos pääpalsta venyy pitkäksi.'],
        ['Kuinka pitkä siitä voi tulla?', 'Se on parhaimmillaan yhden sivun mittaisena. Jos omasi venyy kahdelle, tiivistä vanhemmat tehtävät nimikkeeseen, päivämääriin ja yhteen riviin ennen kuin karsit mitään tuoreempaa.'],
      ],
      tips: [
        'Sinivalkoinen sivupalkki on tarkoituksella kapea — noin kolmannes sivun leveydestä — niin pidä Taidot ja Kielet sen sisällä lyhyinä, silmäiltävinä riveinä.',
        'Kokemus, Koulutus ja Todistukset ovat kaikki leveämmällä pääpalstalla; se on järjestys, jonka arvioija silmäilee ensin, niin älä toista päivämääriä sivupalkissa.',
        'Pohja säilyttää oman rakenteensa ATS-ystävällisessä tilassa sen sijaan että vaihtaisi tasaiseen oletusasetteluun — harva pohja tekee niin.',
      ],
    },
  },
  modernOrange: {
    en: {
      bestFor: 'Marketing managers, UX designers, and customer success managers who want a warm, premium two-column look.',
      intro: [
        'Modern Orange combines a warm cream sidebar with orange accents. The sidebar holds dot-rated skills, languages and education on a small timeline of its own; the main column holds your summary, experience, projects and certificates on a second timeline.',
        'It suits customer success, marketing and design professionals and anyone who wants a friendly, polished CV that still looks professional. The dots make strengths visible at a glance, so it works best with a short, honest skills list.',
      ],
      faq: [
        ['Where does education go?', 'In the sidebar, on its own small timeline, so the main column stays free for experience and projects. Move it to the main column in Direct Edit if your degree is your strongest point.'],
        ['Is it ATS-friendly?', 'Its ATS view keeps this template\'s own design in a simplified form, with the content and order unchanged and the decoration removed, so the version a system reads still matches the one you designed.'],
        ['How long can it be?', 'Two pages is comfortable. The timelines give every entry a clear start, so older roles can be shortened to a title, dates and one line without looking unfinished.'],
      ],
      tips: [
        'Skills render as dot-rated bars in the sidebar, not plain tags — rate each one honestly, since a row of five full dots for every skill reads as noise.',
        'Education sits in the sidebar here, not the main column — it\'s a secondary section on this template, so keep it to degree, school, and dates only.',
        'Experience and Projects both get their own timeline in the main column; reserve Projects for work that needs more than a one-line bullet.',
      ],
    },
    fi: {
      bestFor: 'Markkinointipäälliköille, UX-suunnittelijoille ja asiakkuuspäälliköille, jotka haluavat lämpimän, premium-tasoisen kaksipalstaisen ulkoasun.',
      intro: [
        'Moderni oranssi yhdistää lämpimän kermanvärisen sivupalkin ja oranssit korostukset. Sivupalkissa ovat pisteillä merkityt taidot, kielet ja koulutus omalla pienellä aikajanallaan; pääpalstassa ovat esittely, kokemus, projektit ja sertifikaatit toisella aikajanalla.',
        'Se sopii asiakkuus-, markkinointi- ja suunnitteluammattilaisille ja kaikille, jotka haluavat ystävällisen ja viimeistellyn CV:n, joka näyttää silti ammattimaiselta. Pisteet tuovat vahvuudet esiin yhdellä silmäyksellä, joten pohja toimii parhaiten lyhyellä ja rehellisellä taitolistalla.',
      ],
      faq: [
        ['Mihin koulutus sijoittuu?', 'Sivupalkkiin omalle pienelle aikajanalleen, jotta pääpalsta jää kokemukselle ja projekteille. Siirrä se pääpalstaan Suora muokkaus -tilassa, jos tutkintosi on vahvin kohtasi.'],
        ['Onko se ATS-ystävällinen?', 'Sen ATS-näkymä säilyttää pohjan oman ilmeen yksinkertaistettuna: sisältö ja järjestys pysyvät samoina ja koristeet poistuvat, joten järjestelmän lukema versio vastaa suunnittelemaasi.'],
        ['Kuinka pitkä siitä voi tulla?', 'Kaksi sivua on luonteva pituus. Aikajanat antavat jokaiselle kohdalle selvän alun, joten vanhemmat tehtävät voi tiivistää nimikkeeseen, päivämääriin ja yhteen riviin ilman, että ne näyttävät keskeneräisiltä.'],
      ],
      tips: [
        'Taidot näkyvät sivupalkissa pisteytettyinä palkkeina, ei tageina — arvioi joka taito rehellisesti, sillä viisi täyttä pistettä jokaisessa taidossa näyttää kohinalta.',
        'Koulutus on tässä sivupalkissa, ei pääpalstalla — se on tämän pohjan sivuosio, niin pidä siinä vain tutkinto, oppilaitos ja ajankohta.',
        'Kokemus ja Projektit saavat molemmat omat aikajananssa pääpalstalla; varaa Projektit työlle, joka tarvitsee enemmän kuin yhden rivin maininnan.',
      ],
    },
  },
  colorfulCompact: {
    en: {
      bestFor: 'Graphic designers and customer success managers who want a colorful, scannable CV without going sparse on detail.',
      intro: [
        'Colorful Compact puts a dark editorial header over a tight two-column body and gives each section its own accent colour, so skills, experience, projects and languages are easy to tell apart at a glance. Summary, experience and projects take the main column; skills, education, languages, links and achievements the other.',
        'It suits graphic designers, product people and customer-facing roles where a CV with some energy is welcome, and it fits a typical history on one page. The colours carry the structure, so the writing itself can stay short and direct.',
      ],
      faq: [
        ['Is it too colourful for some employers?', 'For banks, law firms and the public sector, probably; choose Classic Professional or Minimalist there. For creative agencies, start-ups and product teams the colour reads as confidence rather than decoration.'],
        ['How do I keep it to one page?', 'Keep the summary to two or three lines, give each role two or three bullets, and list projects only if they add something your experience doesn\'t already show.'],
        ['Is it ATS-friendly?', 'The ATS view drops the colours and the header block and rebuilds the content as one plain column with standard headings for application systems.'],
      ],
      tips: [
        'Each section — Skills, Experience, Projects, Languages — carries its own fixed accent color; there\'s nothing to configure here, so plan content around that rhythm rather than a single brand hue.',
        'The two-column body is tight on purpose; keep Experience bullets to one line so they don\'t fight the rainbow section dividers for attention.',
        'Links and Achievements are secondary-column extras — short entries only, since the column width is narrower than the main one.',
      ],
    },
    fi: {
      bestFor: 'Graafisille suunnittelijoille ja asiakkuuspäälliköille, jotka haluavat värikkään, silmäiltävän CV:n menettämättä yksityiskohtia.',
      intro: [
        'Värikäs tiivis asettaa tumman, lehtimäisen otsikon tiiviin kaksipalstaisen rungon päälle ja antaa jokaiselle osiolle oman korostusvärinsä, joten taidot, kokemus, projektit ja kielet erottuvat yhdellä silmäyksellä. Esittely, kokemus ja projektit ovat pääpalstassa; taidot, koulutus, kielet, linkit ja saavutukset toisessa.',
        'Se sopii graafisille suunnittelijoille, tuoteihmisille ja asiakasrajapinnan tehtäviin, joissa hieman energiaa sisältävä CV on tervetullut, ja tavallinen historia mahtuu sillä yhdelle sivulle. Värit kantavat rakenteen, joten itse teksti voi pysyä lyhyenä ja suorana.',
      ],
      faq: [
        ['Onko se joillekin työnantajille liian värikäs?', 'Pankeille, lakitoimistoille ja julkiselle sektorille luultavasti; valitse silloin Klassinen ammattilainen tai Minimalisti. Luoville toimistoille, startupeille ja tuotetiimeille väri näyttää itsevarmuudelta eikä koristelulta.'],
        ['Miten pidän sen yhdessä sivussa?', 'Pidä esittely kahdessa tai kolmessa rivissä, anna jokaiselle tehtävälle kaksi tai kolme kohtaa ja listaa projektit vain, jos ne kertovat jotain, mitä kokemus ei jo kerro.'],
        ['Onko se ATS-ystävällinen?', 'ATS-näkymä jättää värit ja otsikkolohkon pois ja kokoaa sisällön yhdeksi tavalliseksi palstaksi vakio-otsikoin hakujärjestelmiä varten.'],
      ],
      tips: [
        'Jokainen osio — Taidot, Kokemus, Projektit, Kielet — saa oman kiinteän aksenttivärinsä; tätä ei voi muuttaa, niin suunnittele sisältö sen rytmin, ei yhden brändivärin, mukaan.',
        'Kaksipalstainen runko on tarkoituksella tiivis; pidä Kokemuksen rivit yhden mittaisina, jotta ne eivät kilpaile sateenkaarierottimien kanssa huomiosta.',
        'Linkit ja Saavutukset ovat sivupalstan lisätietoja — vain lyhyitä merkintöjä, sillä sarake on kapeampi kuin pääpalsta.',
      ],
    },
  },
  quadrant: {
    en: {
      bestFor: 'Marketing managers, sales managers, and journalists who want a CV that reads at a glance instead of top to bottom.',
      intro: [
        'Quadrant splits the page into a literal two-by-two grid: your identity, your summary and skills, your work history, and everything else (projects, education, certificates, languages and links) each get a quarter. A single accent colour marks the headings.',
        'It suits sales managers, marketers, journalists and others whose CV is likely to be skimmed in seconds, because each quarter can be read on its own. It works best on one page, with the four quarters filled roughly evenly.',
      ],
      faq: [
        ['What if one quarter is much longer than the others?', 'Usually that is the work history. Trim older roles to a title and dates, or move detail into a cover letter; the grid looks best, and reads fastest, when the quarters are of similar length.'],
        ['Can I move sections between quarters?', 'No. The grid is fixed so that it stays balanced, which is why the Main/Sidebar choice doesn\'t appear on this template.'],
        ['Is it ATS-friendly?', 'The ATS view rebuilds the content as one plain column with standard headings, in reading order, for application systems.'],
      ],
      tips: [
        'The top-left quadrant holds identity (photo, name, contact) and the top-right holds Summary, Skills, and Languages — keep them short, since each row auto-matches the taller of the two.',
        'Experience and Projects share the bottom-left quadrant; trim whichever runs longer, since the pair can\'t borrow space from their neighbors.',
        'Education, Certificates, and Links share the bottom-right quadrant, with Links always last in its own bordered box — Languages lives up in the Skills quadrant instead.',
      ],
    },
    fi: {
      bestFor: 'Markkinointipäälliköille, myyntipäälliköille ja toimittajille, jotka haluavat CV:n, joka hahmottuu yhdellä silmäyksellä ylhäältä alas lukemisen sijaan.',
      intro: [
        'Neliö jakaa sivun kirjaimellisesti kahdesti kahteen ruutuun: henkilötietosi, esittelysi ja taitosi, työhistoriasi sekä kaikki muu (projektit, koulutus, sertifikaatit, kielet ja linkit) saavat kukin neljänneksen. Yksi korostusväri merkitsee otsikot.',
        'Se sopii myyntipäälliköille, markkinoijille, toimittajille ja muille, joiden CV todennäköisesti silmäillään sekunneissa, koska jokaisen neljänneksen voi lukea erikseen. Se toimii parhaiten yhden sivun mittaisena, kun neljännekset ovat suunnilleen yhtä täynnä.',
      ],
      faq: [
        ['Entä jos yksi neljännes on paljon muita pidempi?', 'Yleensä se on työhistoria. Tiivistä vanhemmat tehtävät nimikkeeseen ja päivämääriin tai siirrä yksityiskohdat saatekirjeeseen; ruudukko näyttää parhaalta ja luetaan nopeimmin, kun neljännekset ovat suunnilleen samanpituisia.'],
        ['Voinko siirtää osioita neljännesten välillä?', 'Et. Ruudukko on kiinteä, jotta se pysyy tasapainossa, ja siksi Pääsarake/Sivupalkki-valintaa ei ole tässä pohjassa.'],
        ['Onko se ATS-ystävällinen?', 'ATS-näkymä kokoaa sisällön yhdeksi tavalliseksi palstaksi vakio-otsikoin ja lukujärjestyksessä hakujärjestelmiä varten.'],
      ],
      tips: [
        'Vasen yläneljännes sisältää henkilötiedot (kuva, nimi, yhteystiedot) ja oikea yläneljännes Yhteenvedon, Taidot ja Kielet — pidä molemmat lyhyinä, sillä rivi venyy korkeamman mukaan.',
        'Kokemus ja Projektit jakavat alavasemman neljänneksen; karsi pidempi niistä, koska pari ei voi lainata tilaa viereiseltä.',
        'Koulutus, Todistukset ja Linkit jakavat alaoikean neljänneksen, Linkit aina viimeisenä omassa kehystetyssä laatikossaan — Kielet asuvat sen sijaan Taidot-neljänneksessä.',
      ],
    },
  },
  editorial: {
    en: {
      bestFor: 'Journalists and research scientists who want a CV that reads like a publication, not a form.',
      intro: [
        'Editorial is set like a magazine feature: an oversized byline-style name, numbered sections and a wide single column with a comfortable reading measure. There is no sidebar; summary, experience, education, skills, projects, links, languages and certificates follow each other down the page.',
        'It suits journalists, writers, researchers and others whose work is words, and whose CV is likely to be read properly rather than scanned. The wide measure gives longer descriptions room to breathe, so it fits when your achievements need a sentence of context.',
      ],
      faq: [
        ['Can I write longer descriptions here?', 'A little longer, yes: a sentence of context before the result reads naturally in this layout. Still keep each role to three or four bullets; a magazine layout makes long blocks of text more visible, not less.'],
        ['Where do I put published work?', 'Link a portfolio or a list of clips in Links, and name two or three pieces with their outlet in your experience. That shows range without turning the CV into a bibliography.'],
        ['Is it ATS-friendly?', 'It is already one column. The ATS view removes the large name and the section numbering for a plain version with standard headings.'],
      ],
      tips: [
        'The oversized byline name sets the tone — treat your title underneath it like a magazine subhead, brief and declarative, not a job description.',
        'Every section is primary and numbered in sequence; order them by what you want read first, since there\'s no sidebar to demote anything to secondary.',
        'The reading measure is wide on purpose — write Experience and About in short flowing sentences rather than clipped fragment bullets, which look out of place here.',
      ],
    },
    fi: {
      bestFor: 'Toimittajille ja tutkijoille, jotka haluavat CV:n, joka muistuttaa julkaisua, ei lomaketta.',
      intro: [
        'Toimituksellinen on taitettu kuin lehtijuttu: suurikokoinen nimi kuin kirjoittajan byline, numeroidut osiot ja leveä yksi palsta mukavalla rivinpituudella. Sivupalkkia ei ole; esittely, kokemus, koulutus, taidot, projektit, linkit, kielet ja sertifikaatit seuraavat toisiaan sivulla alaspäin.',
        'Se sopii toimittajille, kirjoittajille, tutkijoille ja muille, joiden työ on sanoja ja joiden CV todennäköisesti luetaan kunnolla eikä vain silmäillä. Leveä palsta antaa pidemmille kuvauksille tilaa, joten se sopii, kun saavutuksesi tarvitsevat lauseen taustaa.',
      ],
      faq: [
        ['Voinko kirjoittaa tähän pidempiä kuvauksia?', 'Hieman pidempiä, kyllä: lause taustaa ennen tulosta luetaan tässä asettelussa luontevasti. Pidä silti jokaisessa tehtävässä kolme tai neljä kohtaa; lehtimäinen taitto tekee pitkistä tekstilohkoista näkyvämpiä, ei huomaamattomampia.'],
        ['Mihin julkaistut työt kuuluvat?', 'Linkitä portfolioon tai juttulistaan Linkeissä ja mainitse kokemuksessa kaksi tai kolme juttua julkaisijoineen. Se näyttää laajuuden muuttamatta CV:tä lähdeluetteloksi.'],
        ['Onko se ATS-ystävällinen?', 'Se on valmiiksi yksipalstainen. ATS-näkymä poistaa suuren nimen ja osioiden numeroinnin, jolloin jäljelle jää pelkistetty versio vakio-otsikoin.'],
      ],
      tips: [
        'Suurikokoinen nimiotsikko asettaa sävyn — käsittele sen alla olevaa titteliä lehden alaotsikkona, lyhyenä ja toteavana, ei tehtävänkuvauksena.',
        'Joka osio on pääosio ja numeroitu järjestyksessä; aseta ne lukujärjestykseen sen mukaan mitä haluat luettavan ensin, koska sivupalkkia ei ole mihin siirtää mitään sivuun.',
        'Lukumitta on tarkoituksella leveä — kirjoita Kokemus ja Esittely lyhyinä, juoksevina virkkeinä katkonaisten iskulauseiden sijaan, jotka näyttävät tässä irrallisilta.',
      ],
    },
  },
  portrait: {
    en: {
      bestFor: 'Brand specialists, chefs, and architects who want their face and personal presence to lead the page.',
      intro: [
        'Portrait is built around a photo: a full-height image fills the left column, and your name, title and every section flow down the right, with one accent colour on the headings. The photo is the structure rather than a detail, so this is the template to choose when you want your face to lead.',
        'It suits people whose appearance is part of the job or of the first impression they want to make: brand and communications specialists, chefs, hospitality and front-of-house staff, performers, and architects and designers presenting themselves alongside their work.',
      ],
      faq: [
        ['What kind of photo works best?', 'A portrait-orientation photo with your head and shoulders in the upper half, against a plain or softly blurred background. The column is tall and narrow, so a wide landscape shot is cropped heavily.'],
        ['Should I use a photo-led CV at all?', 'In Finland and much of Europe a photo on a CV is common and accepted; in the UK, the US and Ireland many employers prefer CVs without one. If you are applying there, choose another template rather than hiding the photo here.'],
        ['Is it ATS-friendly?', 'The ATS view drops the photo column and rebuilds the content as one plain column with standard headings, which is what application systems need.'],
      ],
      tips: [
        'The photo isn\'t a small avatar here — it fills the entire left column, so use a genuinely high-resolution, well-lit headshot or the whole page suffers.',
        'Every section, from About to Certificates, flows down the right column in one sequence — there\'s no secondary column, so order sections by what matters most first.',
        'Without a photo, the left column doesn\'t break — it becomes a solid accent-tinted panel with a single-letter monogram instead of an empty hole. A real headshot still reads far stronger, so add one when you can.',
      ],
    },
    fi: {
      bestFor: 'Brändiasiantuntijoille, keittiöpäälliköille ja arkkitehdeille, jotka haluavat kasvojensa ja persoonansa johtavan sivua.',
      intro: [
        'Muotokuva rakentuu valokuvan ympärille: täyskorkea kuva täyttää vasemman palstan, ja nimesi, nimikkeesi ja kaikki osiot jatkuvat oikealla, otsikoissa yksi korostusväri. Kuva on rakenne eikä yksityiskohta, joten pohja sopii, kun haluat kasvojesi johtavan.',
        'Se sopii, kun ulkonäkö on osa työtä tai ensivaikutelmaa, jonka haluat antaa: brändi- ja viestintäasiantuntijoille, kokeille, ravintola- ja asiakaspalvelun työntekijöille, esiintyjille sekä arkkitehdeille ja suunnittelijoille, jotka esittelevät itsensä töidensä rinnalla.',
      ],
      faq: [
        ['Millainen kuva toimii parhaiten?', 'Pystysuuntainen kuva, jossa pää ja hartiat ovat yläpuoliskossa tasaista tai pehmeästi sumennettua taustaa vasten. Palsta on korkea ja kapea, joten leveä vaakakuva rajautuu voimakkaasti.'],
        ['Kannattaako kuvalla alkavaa CV:tä käyttää?', 'Suomessa ja suuressa osassa Eurooppaa kuva CV:ssä on tavallinen ja hyväksytty; Isossa-Britanniassa, Yhdysvalloissa ja Irlannissa moni työnantaja suosii CV:tä ilman kuvaa. Jos haet sinne, valitse toinen pohja sen sijaan, että piilottaisit kuvan tästä.'],
        ['Onko se ATS-ystävällinen?', 'ATS-näkymä jättää kuvapalstan pois ja kokoaa sisällön yhdeksi tavalliseksi palstaksi vakio-otsikoin, mitä hakujärjestelmät tarvitsevat.'],
      ],
      tips: [
        'Valokuva ei ole tässä pieni kuvake — se täyttää koko vasemman palstan, niin käytä aidosti tarkkaa, hyvin valaistua kuvaa, tai koko sivu kärsii siitä.',
        'Jokainen osio Esittelystä Todistuksiin virtaa oikealla palstalla yhtenä jatkumona — sivupalstaa ei ole, niin järjestä osiot tärkeimmän mukaan ensin.',
        'Jos kuvaa ei ole, vasen palsta ei jää tyhjäksi — siitä tulee aksenttivärinen laatikko yhden kirjaimen tunnuksella. Aito muotokuva näyttää silti huomattavasti vahvemmalta, niin lisää sellainen kun voit.',
      ],
    },
  },
  european: {
    en: {
      bestFor: 'Nurses, teachers, and chefs applying with a structured, Europass-adjacent format rather than flowing prose.',
      intro: [
        'European follows the logic of the Europass format without copying its look: every section reads as a table of labels and values, with dates, categories and link types in a narrow left column and the content beside them. One accent colour marks the headings, and the layout tightens its own spacing to keep as much as possible on the first page.',
        'It suits teachers, nurses, chefs and anyone applying to public-sector employers, EU institutions or employers across Europe who are used to structured CVs. Because everything lines up in columns, a reader can compare dates, qualifications and languages quickly.',
      ],
      faq: [
        ['Is it the official Europass CV?', 'No. It borrows Europass\'s label-and-value structure but is its own design. If an employer asks for an actual Europass CV, use the official tool; elsewhere this format gives the same clarity with a cleaner look.'],
        ['How should I write the descriptions?', 'In short lines rather than paragraphs: the table layout is read row by row. Keep dates in one consistent format, since the column makes any inconsistency stand out.'],
        ['Is it ATS-friendly?', 'The ATS view turns the table into one plain column with standard headings for application systems; the content stays the same.'],
      ],
      tips: [
        'Every section reads as a label/value row, not a paragraph — write role descriptions as short, compact lines rather than full sentences, since that\'s the reading pattern here.',
        'Dates sit in their own label column on the left; keep them in one consistent format throughout, since the table layout makes any inconsistency obvious.',
        'The page auto-fits to one sheet, so there\'s no need to trim content yourself — adding a row doesn\'t break the layout the way it would on other templates.',
      ],
    },
    fi: {
      bestFor: 'Sairaanhoitajille, opettajille ja keittiöpäälliköille, jotka hakevat jäsennellyllä, Europass-henkisellä lomakkeella juoksevan tekstin sijaan.',
      intro: [
        'Eurooppalainen noudattaa Europass-muodon logiikkaa kopioimatta sen ulkoasua: jokainen osio on taulukko otsikoista ja arvoista, ja päivämäärät, luokat ja linkkityypit ovat kapeassa vasemmassa sarakkeessa sisällön vieressä. Yksi korostusväri merkitsee otsikot, ja asettelu tiivistää välejään pitääkseen mahdollisimman paljon ensimmäisellä sivulla.',
        'Se sopii opettajille, sairaanhoitajille, kokeille ja kaikille, jotka hakevat julkiselle sektorille, EU-toimielimiin tai eri puolilla Eurooppaa toimiville työnantajille, jotka ovat tottuneet jäsenneltyihin CV:ihin. Koska kaikki asettuu sarakkeisiin, lukija vertaa nopeasti päivämääriä, pätevyyksiä ja kieliä.',
      ],
      faq: [
        ['Onko tämä virallinen Europass-CV?', 'Ei. Se lainaa Europassin otsikko–arvo-rakenteen mutta on oma muotoilunsa. Jos työnantaja pyytää nimenomaan Europass-CV:tä, käytä virallista työkalua; muualla tämä muoto antaa saman selkeyden siistimmällä ilmeellä.'],
        ['Miten kuvaukset kannattaa kirjoittaa?', 'Lyhyinä riveinä kappaleiden sijaan: taulukkoasettelu luetaan rivi kerrallaan. Pidä päivämäärät yhdessä johdonmukaisessa muodossa, koska sarake tuo epäjohdonmukaisuudet esiin.'],
        ['Onko se ATS-ystävällinen?', 'ATS-näkymä muuttaa taulukon yhdeksi tavalliseksi palstaksi vakio-otsikoin hakujärjestelmiä varten; sisältö pysyy samana.'],
      ],
      tips: [
        'Joka osio esitetään otsikko/arvo-rivinä, ei kappaleena — kirjoita tehtävänkuvaukset lyhyinä, tiiviinä riveinä täysien virkkeiden sijaan, se on tämän pohjan lukutapa.',
        'Päivämäärät ovat omassa vasemman reunan sarakkeessaan; pidä ne läpi CV:n samassa muodossa, koska taulukkoasettelu tuo epäjohdonmukaisuuden näkyvästi esiin.',
        'Sivu sovittuu automaattisesti yhdelle arkille, niin sisältöä ei tarvitse itse karsia — uuden rivin lisääminen ei riko asettelua toisin kuin muissa pohjissa.',
      ],
    },
  },
}
