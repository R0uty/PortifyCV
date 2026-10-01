// Copy for the per-template pages (/free-cv-templates/<slug>). Each entry
// is written for that template specifically: who it suits and three
// concrete tips about its own layout. Eighteen pages that differ only by
// template name would read as thin, duplicate content to search engines
// and AdSense review.
//
// metaDescription is English-only, like every VIEW_HEAD description (the
// worker serves it before any locale is known). 50–160 characters;
// check:template-pages enforces the bounds.
export const TEMPLATE_PAGE_COPY = {
  developer: {
    metaDescription:
      'Free Developer CV template: dark sidebar for your stack, project and open-source cards up front. Live examples, PDF and Word export, no login.',
    en: {
      bestFor: 'Frontend developers, data engineers, and junior developers whose best evidence is things they built.',
      tips: [
        'Lead the main column with two or three projects that have a measurable outcome. The cards give each one room for a link and a stack line.',
        'Keep the sidebar skills list to about twelve items. Past that it runs below the fold of page one and pushes Education onto page two.',
        'Put a GitHub link in Links. The header shows it next to your email, which is where a technical reviewer looks first.',
      ],
    },
    fi: {
      bestFor: 'Frontend-kehittäjille, data engineereille ja juniorikehittäjille, joiden vahvin näyttö on itse rakennetut asiat.',
      tips: [
        'Aloita pääpalsta kahdella tai kolmella projektilla, joilla on mitattava tulos. Korteissa jokaiselle mahtuu linkki ja teknologiarivi.',
        'Pidä sivupalkin taitolista noin kahdessatoista kohdassa. Pidempi lista valuu ensimmäisen sivun alaosaan ja työntää Koulutuksen toiselle sivulle.',
        'Lisää GitHub-linkki Linkkeihin. Otsikko näyttää sen sähköpostisi vieressä, josta tekninen arvioija katsoo ensimmäisenä.',
      ],
    },
  },
  minimal: {
    metaDescription:
      'Free Minimalist CV template: typography-only layout, thin dividers, no sidebar at all. Live examples, instant export, no login.',
    en: {
      bestFor: 'Nurses, accountants, and cybersecurity analysts — anyone who wants a CV that reads as competent, not designed.',
      tips: [
        'There is no sidebar to catch overflow, so every section runs the full page width. Keep bullets to one line each so the page stays scannable.',
        'Contact details live in the amber-tinted header band, not a side column — put only phone, email, and location there, nothing else.',
        'Section labels are small, uppercase, and widely spaced on purpose. Resist adding icons or color to them; the restraint is the template\'s whole point.',
      ],
    },
    fi: {
      bestFor: 'Sairaanhoitajille, kirjanpitäjille ja kyberturvallisuusanalyytikoille — kaikille, joiden CV:n halutaan näyttää asialliselta, ei suunnitellulta.',
      tips: [
        'Sivupalkkia ei ole, joten joka osio venyy koko sivun levyiseksi. Pidä rivit lyhyinä, jotta sivu pysyy helposti silmäiltävänä.',
        'Yhteystiedot ovat ambran-sävyisessä otsikkopalkissa, ei sivupalkissa — laita siihen vain puhelin, sähköposti ja paikkakunta, ei muuta.',
        'Osiotunnisteet ovat tarkoituksella pieniä, isoja kirjaimia ja väljästi aseteltuja. Älä lisää niihin ikoneita tai väriä — hillittyys on koko pohjan idea.',
      ],
    },
  },
  creative: {
    metaDescription:
      'Free Creative CV template: editorial two-column layout, numbered sections, one customizable accent color, no login.',
    en: {
      bestFor: 'UX designers, graphic designers, and other creative roles that benefit from a distinct visual personality.',
      tips: [
        'The numbered section headings (01, 02, 03…) set a reading order — put your strongest section at number one, not just Experience by default.',
        'Pick an accent color that matches your personal brand in Settings; it tints every heading and divider, so it does more work here than on other templates.',
        'Keep Projects in the main column and push Education and Certificates into the secondary column — this template is built to foreground recent work.',
      ],
    },
    fi: {
      bestFor: 'UX-suunnittelijoille, graafisille suunnittelijoille ja muihin luoviin rooleihin, joissa omaleimainen ulkoasu on eduksi.',
      tips: [
        'Numeroidut osiotunnisteet (01, 02, 03…) määräävät lukujärjestyksen — laita vahvin osiosi ensimmäiseksi, ei automaattisesti Kokemusta.',
        'Valitse Asetuksista aksenttiväri, joka sopii omaan brändiisi — se sävyttää joka otsikon ja erottimen, niin se vaikuttaa tässä enemmän kuin muissa pohjissa.',
        'Pidä Projektit pääpalstalla ja siirrä Koulutus ja Todistukset sivupalstalle — pohja on rakennettu nostamaan viimeisimmän työn etusijalle.',
      ],
    },
  },
  modern: {
    metaDescription:
      'Free Modern Professional CV template: consulting-style layout with a rose timeline and circular photo, no login.',
    en: {
      bestFor: 'Marketing managers, project managers, and product managers who want a clear, step-by-step career story.',
      tips: [
        'Upload a photo — the circular frame in the header is a deliberate part of this template, unlike most others where a photo is optional chrome.',
        'The rose timeline runs down Experience; keep each role to three or four bullets so the dots line up with distinct, readable steps.',
        'Projects and Achievements sit in the main column after Education — use them for the one or two wins that don\'t fit inside a job bullet.',
      ],
    },
    fi: {
      bestFor: 'Markkinointipäälliköille, projektipäälliköille ja tuotepäälliköille, jotka haluavat selkeän, vaihe vaiheelta etenevän uratarinan.',
      tips: [
        'Lisää valokuva — otsikon pyöreä kuvakehys on tämän pohjan tarkoituksellinen osa, toisin kuin useimmissa muissa, joissa kuva on vapaaehtoinen.',
        'Roosa aikajana kulkee Kokemus-osion läpi; pidä jokainen rooli kolmessa tai neljässä pisteessä, jotta pisteet erottuvat selkeinä askelina.',
        'Projektit ja Saavutukset ovat pääpalstalla Koulutuksen jälkeen — käytä niitä yhteen tai kahteen voittoon, joka ei mahdu työkokemuksen pisteisiin.',
      ],
    },
  },
  executive: {
    metaDescription:
      'Free Executive CV template: boardroom layout, no timeline, one customizable accent — leads with outcomes, no login.',
    en: {
      bestFor: 'Finance directors, operations managers, and engineering directors whose CV leads with outcomes over chronology.',
      tips: [
        'Leadership is its own primary section, separate from Experience — use it for scope (team size, budget, reporting line), not another job history.',
        'The Core Strengths sidebar is built for short keyword phrases, not sentences; four to six phrases read cleanest against the restrained layout.',
        'There is no timeline graphic on purpose — if a role needs dates emphasized over impact, this is the wrong template for that role.',
      ],
    },
    fi: {
      bestFor: 'Talousjohtajille, operatiivisille päälliköille ja kehitysjohtajille, joiden CV nostaa tulokset kronologian edelle.',
      tips: [
        'Johtavuus on omana pääosionaan, erillään Kokemuksesta — käytä sitä vastuualueen laajuuteen (tiimin koko, budjetti, raportointisuhde), ei toisena työhistoriana.',
        'Ydinvahvuudet-sivupalkki on tehty lyhyille avainsanoille, ei virkkeille; neljä–kuusi ilmausta näyttää siistiltä hillityssä asettelussa.',
        'Aikajanagrafiikkaa ei ole tarkoituksella — jos jokin rooli vaatii päivämäärien korostamista vaikutuksen sijaan, tämä ei ole sille oikea pohja.',
      ],
    },
  },
  timeline: {
    metaDescription:
      'Free Modern Timeline CV template: single column with a vertical career timeline, one customizable accent, no login.',
    en: {
      bestFor: 'Project managers, teachers, and operations managers with a long, linear career story worth walking through in order.',
      tips: [
        'Every role becomes a dot on the vertical line — keep role titles short, since the dot and date sit right next to them in a fixed-width column.',
        'Skills, Languages, and Certificates are all primary sections here, not sidebar extras, so budget page length for them below Experience.',
        'There is no secondary column to hide anything in — if a section is thin, consider leaving it out rather than padding it to fill space.',
      ],
    },
    fi: {
      bestFor: 'Projektipäälliköille, opettajille ja operatiivisille päälliköille, joiden pitkä, suoraviivainen uratarina kannattaa käydä läpi järjestyksessä.',
      tips: [
        'Jokaisesta roolista tulee piste pystyviivalle — pidä tehtävänimikkeet lyhyinä, koska piste ja päivämäärä ovat niiden vieressä kiinteänlevyisessä sarakkeessa.',
        'Taidot, Kielet ja Todistukset ovat tässä pääosioita, ei sivupalkin lisukkeita, niin varaa niille sivutilaa Kokemuksen jälkeen.',
        'Sivupalstaa ei ole, johon voisi piilottaa mitään — jos osio jää ohueksi, jätä se mieluummin pois kuin täytä sitä tyhjällä tilalla.',
      ],
    },
  },
  graduate: {
    metaDescription:
      'Free Graduate CV template: education-first layout leading with your degree, projects, and internships, no login.',
    en: {
      bestFor: 'Junior developers and business graduates whose degree, academic projects, and internships are their strongest material.',
      tips: [
        'Education sits above Experience here — put your degree, thesis topic, and relevant coursework first, since that\'s what this layout is built to lead with.',
        'Internships gets its own primary section, separate from Experience; use it even for a single short placement rather than folding it into Experience.',
        'Achievements and Memberships are secondary-column extras — a scholarship, a hackathon placement, or a student society role all belong there.',
      ],
    },
    fi: {
      bestFor: 'Juniorikehittäjille ja kauppatieteiden vastavalmistuneille, joiden vahvin näyttö on tutkinto, opintoprojektit ja harjoittelut.',
      tips: [
        'Koulutus on tässä Kokemuksen yläpuolella — laita tutkinto, opinnäytteen aihe ja olennaiset kurssit ensin, sillä pohja on rakennettu nostamaan ne esiin.',
        'Harjoittelut saa omaan pääosioonsa, erillään Kokemuksesta — käytä sitä vaikka yhdelle lyhyelle harjoittelujaksolle sen niputtamisen sijaan Kokemukseen.',
        'Saavutukset ja Jäsenyydet ovat sivupalstan lisätietoja — apuraha, hackathon-sijoitus tai opiskelijajärjestön rooli kuuluvat tänne.',
      ],
    },
  },
  compact: {
    metaDescription:
      'Free Compact CV template: dense one-pager with a customizable accent that auto-shrinks to fit everything, no login.',
    en: {
      bestFor: 'Data engineers, cybersecurity analysts, and business graduates with a long history that still needs to fit one page.',
      tips: [
        'The template shrinks its own spacing automatically as you add content — don\'t manually trim sections to fit; let the density ramp do that work.',
        'Skills renders as inline comma lists, not tags or bars, so a long skills section costs far less vertical space here than on other templates.',
        'The dark header strip and sky accent are fixed chrome around a single tight column — there\'s no sidebar to move sections into if the page runs long.',
      ],
    },
    fi: {
      bestFor: 'Data engineereille, kyberturvallisuusanalyytikoille ja kauppatieteiden vastavalmistuneille, joiden pitkä historia on saatava mahtumaan yhdelle sivulle.',
      tips: [
        'Pohja pienentää välejään automaattisesti sisällön kasvaessa — älä lyhennä osioita käsin, anna tiiviysasteen hoitaa se puolesta.',
        'Taidot näkyvät pilkuin eroteltuna rivinä, ei tageina tai palkkeina, niin pitkä taito-osio vie tässä huomattavasti vähemmän tilaa kuin muissa pohjissa.',
        'Tumma otsikkopalkki ja taivaansininen aksentti ovat kiinteää kehystä yhden tiiviin palstan ympärillä — sivupalkkia ei ole, johon siirtää osioita jos sivu pitenee.',
      ],
    },
  },
  portfolio: {
    metaDescription:
      'Free Portfolio Hybrid CV template: project cards, case studies, and tech-stack badges lead the page, no login.',
    en: {
      bestFor: 'Frontend developers, UX designers, and product managers whose work speaks for itself through projects.',
      tips: [
        'Lead Projects with a tech-stack badge per card — that\'s the one visual element this template gives you that a plain bullet list can\'t.',
        'Case Studies is a separate primary section from Projects; use it for the one or two pieces of work worth a longer walkthrough, not a repeat list.',
        'Testimonials sits in the secondary column — a short quote from a manager or client there reads as social proof without crowding the main story.',
      ],
    },
    fi: {
      bestFor: 'Frontend-kehittäjille, UX-suunnittelijoille ja tuotepäälliköille, joiden työ puhuu puolestaan projektien kautta.',
      tips: [
        'Aloita Projektit-osio teknologiamerkillä per kortti — se on yksi visuaalinen elementti, jota tavallinen luettelo ei anna.',
        'Tapaustutkimukset on oma pääosionsa, erillään Projekteista; käytä sitä yhteen tai kahteen työhön, joka ansaitsee pidemmän läpikäynnin, ei toistolistaa.',
        'Suositukset on sivupalstalla — lyhyt lainaus esimieheltä tai asiakkaalta toimii siellä sosiaalisena näyttönä ahtaamatta pääkertomusta.',
      ],
    },
  },
  techExec: {
    metaDescription:
      'Free Tech Executive CV template: navy masthead and footer band, core-strengths sidebar, leadership tone, no login.',
    en: {
      bestFor: 'Engineering directors and CTOs who want a leadership narrative with an annual-report, not a resume, feel.',
      tips: [
        'The navy masthead and matching footer band are fixed around the body — treat your name and title as a banner headline, not a header label.',
        'Core Strengths is a sidebar list separate from Skills; use it for leadership capabilities (org design, P&L, platform strategy), not tools.',
        'Keep Experience bullets outcome-first — the royal-blue rule under each heading is doing the visual separation, so the text itself can stay dense.',
      ],
    },
    fi: {
      bestFor: 'Kehitysjohtajille ja teknologiajohtajille, jotka haluavat johtajuustarinan, jossa on vuosikertomuksen, ei ansioluettelon, tuntu.',
      tips: [
        'Laivastonsininen otsikko- ja alapalkki ovat kiinteää kehystä rungon ympärillä — käsittele nimeäsi ja titteliäsi otsikkona, ei vain tunnisteena.',
        'Ydinvahvuudet on Taidoista erillinen sivupalkkilista; käytä sitä johtamiskykyihin (organisaatiosuunnittelu, tulosvastuu, alustastrategia), ei työkaluihin.',
        'Pidä Kokemus-osion tekstit tulosvetoisina — royal-blue-viiva joka otsikon alla hoitaa visuaalisen erottelun, niin itse teksti voi olla tiivistä.',
      ],
    },
  },
  classicProfessional: {
    metaDescription:
      'Free Classic Professional CV template: traditional single column, thin dividers, a serif name you can center, no login.',
    en: {
      bestFor: 'Accountants, finance directors, and research scientists who want a universally safe choice for any industry.',
      tips: [
        'The serif name heading can be centered or left-aligned in Settings — centered reads more formal and suits a longer, conservative job title.',
        'This is single column with no sidebar, so Skills, Languages, and Certificates run in sequence below Education — order them by relevance, not habit.',
        'The thin dividers between sections are the only visual structure here on purpose; don\'t compensate by adding bold text or color the template doesn\'t use.',
      ],
    },
    fi: {
      bestFor: 'Kirjanpitäjille, talousjohtajille ja tutkijoille, jotka haluavat universaalisti turvallisen valinnan mille tahansa alalle.',
      tips: [
        'Seriffityylinen nimiotsikko voidaan keskittää tai tasata vasemmalle Asetuksista — keskitetty näyttää muodollisemmalta ja sopii pidempään, perinteiseen tittelin.',
        'Pohja on yksipalstainen eikä sivupalkkia ole, niin Taidot, Kielet ja Todistukset kulkevat peräkkäin Koulutuksen jälkeen — järjestä ne relevanssin, ei tottumuksen, mukaan.',
        'Ohuet erottimet osioiden välissä ovat tarkoituksella pohjan ainoa visuaalinen rakenne — älä korvaa sitä lihavoinnilla tai väreillä, joita pohja ei käytä.',
      ],
    },
  },
  navyProfessional: {
    metaDescription:
      'Free Navy Professional CV template: dark navy sidebar, blue accents, ATS-friendly two-column layout, no login.',
    en: {
      bestFor: 'CTOs, sales managers, and research scientists who want an ATS-friendly look with a confident dark sidebar.',
      tips: [
        'The navy sidebar is narrow by design — about a third of the page width — so keep Skills and Languages there to short, scannable lines, not paragraphs.',
        'Experience, Education, and Certificates all live in the wider main column; that\'s the order a reviewer scans first, so don\'t duplicate dates in the sidebar.',
        'This template keeps its own structure in ATS-friendly mode rather than falling back to the plain flat layout — one of the few that does.',
      ],
    },
    fi: {
      bestFor: 'Teknologiajohtajille, myyntipäälliköille ja tutkijoille, jotka haluavat ATS-ystävällisen ulkoasun itsevarmalla tummansinisellä sivupalkilla.',
      tips: [
        'Sinivalkoinen sivupalkki on tarkoituksella kapea — noin kolmannes sivun leveydestä — niin pidä Taidot ja Kielet sen sisällä lyhyinä, silmäiltävinä riveinä.',
        'Kokemus, Koulutus ja Todistukset ovat kaikki leveämmällä pääpalstalla; se on järjestys, jonka arvioija silmäilee ensin, niin älä toista päivämääriä sivupalkissa.',
        'Pohja säilyttää oman rakenteensa ATS-ystävällisessä tilassa sen sijaan että vaihtaisi tasaiseen oletusasetteluun — harva pohja tekee niin.',
      ],
    },
  },
  modernOrange: {
    metaDescription:
      'Free Modern Orange CV template: cream sidebar, orange accent, dot-rated skills and dual timelines, no login.',
    en: {
      bestFor: 'Marketing managers, UX designers, and customer success managers who want a warm, premium two-column look.',
      tips: [
        'Skills render as dot-rated bars in the sidebar, not plain tags — rate each one honestly, since a row of five full dots for every skill reads as noise.',
        'Education sits in the sidebar here, not the main column — it\'s a secondary section on this template, so keep it to degree, school, and dates only.',
        'Experience and Projects both get their own timeline in the main column; reserve Projects for work that needs more than a one-line bullet.',
      ],
    },
    fi: {
      bestFor: 'Markkinointipäälliköille, UX-suunnittelijoille ja asiakkuuspäälliköille, jotka haluavat lämpimän, premium-tasoisen kaksipalstaisen ulkoasun.',
      tips: [
        'Taidot näkyvät sivupalkissa pisteytettyinä palkkeina, ei tageina — arvioi joka taito rehellisesti, sillä viisi täyttä pistettä jokaisessa taidossa näyttää kohinalta.',
        'Koulutus on tässä sivupalkissa, ei pääpalstalla — se on tämän pohjan sivuosio, niin pidä siinä vain tutkinto, oppilaitos ja ajankohta.',
        'Kokemus ja Projektit saavat molemmat omat aikajananssa pääpalstalla; varaa Projektit työlle, joka tarvitsee enemmän kuin yhden rivin maininnan.',
      ],
    },
  },
  colorfulCompact: {
    metaDescription:
      'Free Colorful Compact CV template: dark header, tight two-column body, each section in its own accent color, no login.',
    en: {
      bestFor: 'Graphic designers and customer success managers who want a colorful, scannable CV without going sparse on detail.',
      tips: [
        'Each section — Skills, Experience, Projects, Languages — carries its own fixed accent color; there\'s nothing to configure here, so plan content around that rhythm rather than a single brand hue.',
        'The two-column body is tight on purpose; keep Experience bullets to one line so they don\'t fight the rainbow section dividers for attention.',
        'Links and Achievements are secondary-column extras — short entries only, since the column width is narrower than the main one.',
      ],
    },
    fi: {
      bestFor: 'Graafisille suunnittelijoille ja asiakkuuspäälliköille, jotka haluavat värikkään, silmäiltävän CV:n menettämättä yksityiskohtia.',
      tips: [
        'Jokainen osio — Taidot, Kokemus, Projektit, Kielet — saa oman kiinteän aksenttivärinsä; tätä ei voi muuttaa, niin suunnittele sisältö sen rytmin, ei yhden brändivärin, mukaan.',
        'Kaksipalstainen runko on tarkoituksella tiivis; pidä Kokemuksen rivit yhden mittaisina, jotta ne eivät kilpaile sateenkaarierottimien kanssa huomiosta.',
        'Linkit ja Saavutukset ovat sivupalstan lisätietoja — vain lyhyitä merkintöjä, sillä sarake on kapeampi kuin pääpalsta.',
      ],
    },
  },
  quadrant: {
    metaDescription:
      'Free Quadrant CV template: a literal 2x2 grid of identity, summary, work history, and extras, no login.',
    en: {
      bestFor: 'Marketing managers, sales managers, and journalists who want a CV that reads at a glance instead of top to bottom.',
      tips: [
        'The top-left quadrant holds identity (photo, name, contact) and the top-right holds Summary and Skills — keep both short, since each row auto-matches the taller of the two.',
        'Experience fills the bottom-left quadrant alone; trim it to the roles that matter most, since this quadrant can\'t borrow space from its neighbors.',
        'Everything else — Education, Certificates, Languages, Links — shares the bottom-right quadrant, with Links always last in its own bordered box.',
      ],
    },
    fi: {
      bestFor: 'Markkinointipäälliköille, myyntipäälliköille ja toimittajille, jotka haluavat CV:n, joka hahmottuu yhdellä silmäyksellä ylhäältä alas lukemisen sijaan.',
      tips: [
        'Vasen yläneljännes sisältää henkilötiedot (kuva, nimi, yhteystiedot) ja oikea yläneljännes Yhteenvedon ja Taidot — pidä molemmat lyhyinä, sillä rivi venyy korkeamman mukaan.',
        'Kokemus täyttää alavasemman neljänneksen yksin; karsi se tärkeimpiin rooleihin, koska tämä neljännes ei voi lainata tilaa viereiseltä.',
        'Kaikki muu — Koulutus, Todistukset, Kielet, Linkit — jakaa alaoikean neljänneksen, Linkit aina viimeisenä omassa kehystetyssä laatikossaan.',
      ],
    },
  },
  editorial: {
    metaDescription:
      'Free Editorial CV template: magazine-style single column, oversized byline, numbered sections, no login.',
    en: {
      bestFor: 'Journalists and research scientists who want a CV that reads like a publication, not a form.',
      tips: [
        'The oversized byline name sets the tone — treat your title underneath it like a magazine subhead, brief and declarative, not a job description.',
        'Every section is primary and numbered in sequence; order them by what you want read first, since there\'s no sidebar to demote anything to secondary.',
        'The reading measure is wide on purpose — write Experience and About in short flowing sentences rather than clipped fragment bullets, which look out of place here.',
      ],
    },
    fi: {
      bestFor: 'Toimittajille ja tutkijoille, jotka haluavat CV:n, joka muistuttaa julkaisua, ei lomaketta.',
      tips: [
        'Suurikokoinen nimiotsikko asettaa sävyn — käsittele sen alla olevaa titteliä lehden alaotsikkona, lyhyenä ja toteavana, ei tehtävänkuvauksena.',
        'Joka osio on pääosio ja numeroitu järjestyksessä; aseta ne lukujärjestykseen sen mukaan mitä haluat luettavan ensin, koska sivupalkkia ei ole mihin siirtää mitään sivuun.',
        'Lukumitta on tarkoituksella leveä — kirjoita Kokemus ja Esittely lyhyinä, juoksevina virkkeinä katkonaisten iskulauseiden sijaan, jotka näyttävät tässä irrallisilta.',
      ],
    },
  },
  portrait: {
    metaDescription:
      'Free Portrait CV template: a full-height photo fills the left column, every section flows on the right, no login.',
    en: {
      bestFor: 'Brand specialists, chefs, and architects who want their face and personal presence to lead the page.',
      tips: [
        'The photo isn\'t a small avatar here — it fills the entire left column, so use a genuinely high-resolution, well-lit headshot or the whole page suffers.',
        'Every section, from About to Certificates, flows down the right column in one sequence — there\'s no secondary column, so order sections by what matters most first.',
        'If you don\'t have a strong photo, pick a different template; this layout has no fallback treatment for a missing one the way other templates do.',
      ],
    },
    fi: {
      bestFor: 'Brändiasiantuntijoille, keittiöpäälliköille ja arkkitehdeille, jotka haluavat kasvojensa ja persoonansa johtavan sivua.',
      tips: [
        'Valokuva ei ole tässä pieni kuvake — se täyttää koko vasemman palstan, niin käytä aidosti tarkkaa, hyvin valaistua kuvaa, tai koko sivu kärsii siitä.',
        'Jokainen osio Esittelystä Todistuksiin virtaa oikealla palstalla yhtenä jatkumona — sivupalstaa ei ole, niin järjestä osiot tärkeimmän mukaan ensin.',
        'Jos sinulla ei ole vahvaa kuvaa, valitse toinen pohja; tällä asettelulla ei ole varakäsittelyä puuttuvalle kuvalle toisin kuin muissa pohjissa.',
      ],
    },
  },
  european: {
    metaDescription:
      'Free European CV template: a Europass-style label/value table layout that auto-fits one page, no login.',
    en: {
      bestFor: 'Nurses, teachers, and chefs applying with a structured, Europass-adjacent format rather than flowing prose.',
      tips: [
        'Every section reads as a label/value row, not a paragraph — write role descriptions as short, compact lines rather than full sentences, since that\'s the reading pattern here.',
        'Dates sit in their own label column on the left; keep them in one consistent format throughout, since the table layout makes any inconsistency obvious.',
        'The page auto-fits to one sheet, so there\'s no need to trim content yourself — adding a row doesn\'t break the layout the way it would on other templates.',
      ],
    },
    fi: {
      bestFor: 'Sairaanhoitajille, opettajille ja keittiöpäälliköille, jotka hakevat jäsennellyllä, Europass-henkisellä lomakkeella juoksevan tekstin sijaan.',
      tips: [
        'Joka osio esitetään otsikko/arvo-rivinä, ei kappaleena — kirjoita tehtävänkuvaukset lyhyinä, tiiviinä riveinä täysien virkkeiden sijaan, se on tämän pohjan lukutapa.',
        'Päivämäärät ovat omassa vasemman reunan sarakkeessaan; pidä ne läpi CV:n samassa muodossa, koska taulukkoasettelu tuo epäjohdonmukaisuuden näkyvästi esiin.',
        'Sivu sovittuu automaattisesti yhdelle arkille, niin sisältöä ei tarvitse itse karsia — uuden rivin lisääminen ei riko asettelua toisin kuin muissa pohjissa.',
      ],
    },
  },
}
