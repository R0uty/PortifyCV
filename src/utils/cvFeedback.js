// @ts-check
import { createCvSnapshot } from './cvSnapshot'

/** @typedef {import('../types/cv').CvData} CvData */

const MIN_SKILL_COUNT = 4
const ABOUT_WORD_LIMIT = 60
const EXPERIENCE_WORD_LIMIT = 42
const METRIC_PATTERN = /\b\d+(?:[.,]\d+)?\s?(?:%|x|k|m)?\b/i

// Classic passive/vague resume openers. Matched as a substring anywhere in the
// text (not just the start) since "duties included..." and similar phrases as
// often show up mid-sentence as they do at the front of a bullet.
const WEAK_PHRASES = [
  'responsible for',
  'was responsible',
  'duties included',
  'duties include',
  'in charge of',
  'tasked with',
  'worked on',
  'helped with',
  'helped to',
  'assisted with',
  'assisted in',
  // Finnish (1.6.51): the same passive, duty-list phrasing. "Vastasin" ("I
  // was in charge of") is not on it: it's the usual active way to open a
  // Finnish role description.
  'vastuussa',
  'vastuualue',
  'tehtäviin kuului',
  'tehtäviini kuului',
  'olin mukana',
  'osallistuin',
]

// Common strong resume action verbs, past tense. Used to check the opening
// word of a description or bullet — not exhaustive, just enough to catch the
// common weak openers ("Was...", "Did...", "Worked...") without flagging
// reasonable phrasing this list doesn't happen to include.
const STRONG_ACTION_VERBS = new Set([
  'led', 'built', 'launched', 'reduced', 'increased', 'grew', 'improved', 'designed',
  'shipped', 'delivered', 'managed', 'created', 'implemented', 'streamlined',
  'architected', 'automated', 'negotiated', 'mentored', 'spearheaded', 'optimized',
  'established', 'drove', 'directed', 'coordinated', 'developed', 'engineered',
  'executed', 'achieved', 'accelerated', 'boosted', 'cut', 'decreased', 'doubled',
  'expanded', 'founded', 'generated', 'headed', 'initiated', 'introduced',
  'overhauled', 'pioneered', 'redesigned', 'refactored', 'resolved', 'restructured',
  'revamped', 'scaled', 'secured', 'simplified', 'standardized', 'strengthened',
  'transformed', 'upgraded', 'won', 'authored', 'analyzed', 'consolidated',
  'deployed', 'enhanced', 'facilitated', 'owned', 'partnered', 'presented',
  'trained', 'unified', 'migrated', 'centralized', 'modernized', 'devised',
  'championed', 'orchestrated', 'formulated', 'cultivated', 'defined', 'planned',
  'monitored', 'triaged', 'patched', 'handled', 'wrote', 'broke', 'produced',
  'coauthored',
  // Finnish (1.6.51), first person: past tense, plus the present for a
  // current role ("Johdan", "Vastaan").
  'johdin', 'rakensin', 'lyhensin', 'vastasin', 'kasvatin', 'vähensin', 'uudistin',
  'otin', 'laskin', 'vedin', 'suunnittelin', 'pidin', 'koulutin', 'nostin',
  'toteutin', 'ohjasin', 'siirsin', 'lanseerasin', 'toimitin', 'julkaisin', 'kehitin',
  'tuotin', 'korjasin', 'mentoroin', 'neuvottelin', 'löysin', 'tuin', 'hoidin',
  'valvoin', 'luokittelin', 'automatisoin', 'käsittelin', 'kirjoitin', 'opetin',
  'tutkin', 'ylitin', 'solmin', 'paljastin', 'paransin', 'loin', 'perustin',
  'koordinoin', 'nopeutin', 'puolitin', 'kaksinkertaistin', 'laajensin', 'käynnistin',
  'ratkaisin', 'skaalasin', 'yksinkertaistin', 'standardoin', 'vahvistin', 'päivitin',
  'voitin', 'analysoin', 'yhdistin', 'keskitin', 'modernisoin', 'määrittelin',
  'pienensin', 'tehostin', 'perehdytin', 'esittelin', 'optimoin', 'integroin',
  'organisoin', 'myin', 'hankin', 'säästin', 'hallinnoin', 'sijoituin', 'avustin',
  'johdan', 'vastaan', 'rakennan', 'kehitän', 'suunnittelen', 'ohjaan', 'opetan',
  'koulutan', 'valvon', 'hoidan', 'seuraan', 'annan',
])

function trimValue(value) {
  return value.trim()
}

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim()
}

function countWords(text) {
  const normalizedText = normalizeText(text)

  if (!normalizedText) {
    return 0
  }

  return normalizedText.split(/\s+/).length
}

function hasMetric(text) {
  return METRIC_PATTERN.test(text)
}

function findWeakPhrase(text) {
  const lowerText = text.toLowerCase()

  return WEAK_PHRASES.find((phrase) => lowerText.includes(phrase)) ?? null
}

function startsWithActionVerb(text) {
  const firstWord = text.trim().replace(/^[-•*\d.)\s]+/, '').split(/\s+/)[0] ?? ''
  const normalizedWord = firstWord.toLowerCase().replace(/[^a-zäöå]/g, '')

  return STRONG_ACTION_VERBS.has(normalizedWord)
}

function createFeedbackItem({
  id,
  type,
  section,
  title,
  message,
  category = 'quality',
}) {
  return { id, type, section, title, message, category }
}

function createSectionBadge(items, locale = 'en') {
  if (items.length === 0) {
    return null
  }

  const warningCount = items.filter((item) => item.type === 'warning').length

  return {
    label:
      warningCount > 0
        ? locale === 'fi'
          ? `${warningCount} varoitus${warningCount > 1 ? 'ta' : ''}`
          : `${warningCount} warning${warningCount > 1 ? 's' : ''}`
        : locale === 'fi'
          ? `${items.length} vinkkiä`
          : `${items.length} tip${items.length > 1 ? 's' : ''}`,
    tone: warningCount > 0 ? 'warning' : 'tip',
  }
}

/**
 * @param {CvData} formData
 * @param {{ locale?: 'en' | 'fi' }} [options]
 */
export function evaluateCvFeedback(formData, options = {}) {
  const locale = options.locale === 'fi' ? 'fi' : 'en'
  const isFinnish = locale === 'fi'
  const snapshot = createCvSnapshot(formData)
  const profileItems = []
  const skillsItems = []
  const experienceItems = []
  const experienceItemTips = formData.experience.map(() => [])
  const metricsItems = []

  if (!snapshot.about) {
    profileItems.push(
      createFeedbackItem({
        id: 'about-missing',
        type: 'tip',
        section: 'profile',
        title: isFinnish ? 'Lisää vahvempi yhteenveto' : 'Add a stronger summary',
        message: isFinnish
          ? 'Kirjoita 2-3 riviä vahvuuksistasi, painotuksestasi ja tuottamastasi arvosta.'
          : 'Write 2-3 lines about your strengths, focus, and the kind of value you deliver.',
      }),
    )
  }

  if (countWords(snapshot.about) > ABOUT_WORD_LIMIT) {
    profileItems.push(
      createFeedbackItem({
        id: 'about-too-long',
        type: 'warning',
        section: 'profile',
        title: isFinnish ? 'Tiivistä yhteenvetoa' : 'Tighten your summary',
        message: isFinnish
          ? 'Pidä esittelyosio tiiviinä, jotta rekrytoija pystyy silmäilemään sen nopeasti.'
          : 'Keep the About section concise so recruiters can scan it quickly.',
      }),
    )
  }

  if (snapshot.about && !hasMetric(snapshot.about)) {
    metricsItems.push(
      createFeedbackItem({
        id: 'about-metrics',
        type: 'tip',
        section: 'profile',
        title: isFinnish ? 'Lisää mitattava tulos' : 'Add a quantified outcome',
        message: isFinnish
          ? 'Mainitse esimerkiksi kasvu, säästetty aika tai konversioparannus vahvistaaksesi yhteenvetoa.'
          : 'Mention a result such as growth, time saved, or conversion lift to make the summary stronger.',
        category: 'metrics',
      }),
    )
  }

  if (snapshot.skills.length === 0) {
    skillsItems.push(
      createFeedbackItem({
        id: 'skills-missing',
        type: 'warning',
        section: 'skills',
        title: isFinnish ? 'Lisää ydintaidot' : 'Add core skills',
        message: isFinnish
          ? 'CV tarvitsee näkyvän taito-osion, jotta rekrytointi voi kohdistaa sinut rooleihin nopeammin.'
          : 'Your CV needs a visible skills section so hiring teams can match you to roles faster.',
      }),
    )
  } else if (snapshot.skills.length < MIN_SKILL_COUNT) {
    skillsItems.push(
      createFeedbackItem({
        id: 'skills-thin',
        type: 'warning',
        section: 'skills',
        title: isFinnish ? 'Laajenna taitolistaa' : 'Expand your skills list',
        message: isFinnish
          ? `Pyri vähintään ${MIN_SKILL_COUNT} relevanttiin taitoon osaamisen laajuuden ja avainsanojen kattavuuden parantamiseksi.`
          : `Aim for at least ${MIN_SKILL_COUNT} relevant skills to show range and improve keyword coverage.`,
      }),
    )
  }

  if (snapshot.experience.length === 0) {
    experienceItems.push(
      createFeedbackItem({
        id: 'experience-empty',
        type: 'warning',
        section: 'experience',
        title: isFinnish ? 'Lisää työkokemusta' : 'Add work experience',
        message: isFinnish
          ? 'Jo yksi vahva rooli tuloskeskeisellä kuvauksella tekee CV:stä uskottavamman.'
          : 'Even one strong role with a result-focused description makes the CV more credible.',
      }),
    )
  }

  formData.experience.forEach((item, index) => {
    const role = trimValue(item.role)
    const company = trimValue(item.company)
    const description = trimValue(item.description)
    const hasEntryContent =
      role ||
      company ||
      trimValue(item.startDate) ||
      trimValue(item.endDate) ||
      description

    if (!hasEntryContent) {
      return
    }

    if (!description) {
      experienceItemTips[index].push(
        createFeedbackItem({
          id: `experience-description-${index}`,
          type: 'warning',
          section: 'experience',
          title: isFinnish ? `Lisää vaikutus rooliin ${index + 1}` : `Add impact for role ${index + 1}`,
          message: isFinnish
            ? 'Kuvaa mitä toimitit, paransit tai omistit, jotta rooli näkyy aidosti kokemuksena.'
            : 'Describe what you shipped, improved, or owned so this role reads as real experience.',
        }),
      )

      return
    }

    if (countWords(description) > EXPERIENCE_WORD_LIMIT) {
      experienceItemTips[index].push(
        createFeedbackItem({
          id: `experience-too-long-${index}`,
          type: 'warning',
          section: 'experience',
          title: isFinnish ? `Tiivistä kokemus ${index + 1}` : `Trim experience ${index + 1}`,
          message: isFinnish
            ? 'Lyhyet saavutuksia kuvaavat lauseet ovat helpommin silmäiltäviä kuin pitkät kappaleet.'
            : 'Shorter accomplishment statements are easier to scan than long paragraphs.',
        }),
      )
    }

    if (!hasMetric(description)) {
      metricsItems.push(
        createFeedbackItem({
          id: `experience-metrics-${index}`,
          type: 'tip',
          section: 'experience',
          title: isFinnish ? `Lisää lukuja kokemukseen ${index + 1}` : `Add numbers to experience ${index + 1}`,
          message: isFinnish
            ? 'Lisää mittari, kuten käyttöönotto, liikevaihto, säästetty aika tai kasvu, osoittamaan mitattava vaikutus.'
            : 'Include a metric like adoption, revenue, time saved, or growth to show measurable impact.',
          category: 'metrics',
        }),
      )
    }

    const bulletTexts = [description, ...item.achievements.map(trimValue)].filter(Boolean)
    const weakPhrase = bulletTexts.map(findWeakPhrase).find(Boolean)

    if (weakPhrase) {
      experienceItemTips[index].push(
        createFeedbackItem({
          id: `experience-weak-phrase-${index}`,
          type: 'tip',
          section: 'experience',
          title: isFinnish ? `Vahvista sanamuotoa roolissa ${index + 1}` : `Strengthen the wording in role ${index + 1}`,
          message: isFinnish
            ? `Korvaa passiivinen ilmaisu kuten "${weakPhrase}" konkreettisella tuloksella, esim. "Paransin..." tai "Toteutin...".`
            : `Swap passive phrasing like "${weakPhrase}" for a specific outcome, e.g. "Reduced...", "Led...", or "Built...".`,
          category: 'phrasing',
        }),
      )
    }

    if (bulletTexts.length > 0 && bulletTexts.every((text) => !startsWithActionVerb(text))) {
      experienceItemTips[index].push(
        createFeedbackItem({
          id: `experience-action-verb-${index}`,
          type: 'tip',
          section: 'experience',
          title: isFinnish ? `Aloita toimintaverbillä roolissa ${index + 1}` : `Open with an action verb in role ${index + 1}`,
          message: isFinnish
            ? 'Aloita kuvaus tai luetelmakohta vahvalla verbillä, kuten "Johdin", "Rakensin" tai "Paransin", passiivisen kielen sijaan.'
            : 'Start the description or bullet with a strong verb like "Led," "Built," or "Improved" instead of a passive opener.',
          category: 'phrasing',
        }),
      )
    }
  })

  const flattenedExperienceItems = experienceItemTips.flat()
  const allPriorityItems = [...profileItems, ...skillsItems, ...experienceItems, ...flattenedExperienceItems]

  return {
    warningCount: [...allPriorityItems, ...metricsItems].filter((item) => item.type === 'warning').length,
    tipCount: [...allPriorityItems, ...metricsItems].filter((item) => item.type === 'tip').length,
    metricsCount: metricsItems.length,
    priorityItems: allPriorityItems,
    metricsItems,
    inlineTips: {
      profile: profileItems,
      skills: skillsItems,
      experience: experienceItems,
      experienceItems: experienceItemTips,
    },
    sectionBadges: {
    profile: createSectionBadge(profileItems, locale),
    skills: createSectionBadge(skillsItems, locale),
    experience: createSectionBadge([...experienceItems, ...flattenedExperienceItems], locale),
    },
  }
}

// ── Bullet hints (1.7.3) ──
// One achievement bullet at a time, shown under that bullet where it is
// edited (Classic's Achievements list, Direct Edit's entry popup). The
// role-level tips above say a role needs work; these say which bullet and
// why. Every rule is a closed list or a count, so a bullet the lists don't
// cover gets no hint rather than a wrong one.

// Stands in for a figure in an example bullet the visitor has to fill in.
export const BULLET_BLANK = '[__]'

const BULLET_WORD_LIMIT = 30
const MAX_HINTS_PER_BULLET = 2
// A bullet this short is still being written, or a label; no number hint.
const NUMBER_HINT_MIN_WORDS = 6

// Openers that describe the person or a duty, not what they did.
const WEAK_OPENERS = new Set([
  'i', 'my', 'we', 'our', 'was', 'were', 'did', 'worked', 'helped', 'assisted',
  'participated', 'involved', 'tasked', 'took',
  // Not "tein": "Tein 90+ asiakashaastattelua" is how Finnish says "Ran".
  'minä', 'me', 'olin', 'olen', 'työskentelin', 'autoin', 'osallistuin',
])

// Words that take space without saying anything a reader can check.
const FILLER_WORDS = [
  'successfully', 'various', 'a variety of', 'etc', 'and more', 'and so on',
  'menestyksekkäästi', 'onnistuneesti', 'erilaisia', 'erilaisten', 'yms', 'jne',
]

function firstWordOf(text) {
  const word = text.trim().replace(/^[-•*–\d.)\s]+/, '').split(/\s+/)[0] ?? ''
  return word.toLowerCase().replace(/[^a-zäöå]/g, '')
}

function findFiller(text) {
  const lowerText = ` ${text.toLowerCase().replace(/[.,;:!?()]/g, ' ')} `
  return FILLER_WORDS.find((word) => lowerText.includes(` ${word} `)) ?? null
}

/**
 * Hints for each bullet of one experience entry, in the bullets' order.
 * @param {string[]} bullets the entry's achievements
 * @param {{ locale?: 'en' | 'fi' }} [options] the UI language of the hints
 * @returns {{ id: string, message: string }[][]}
 */
export function getBulletHints(bullets, options = {}) {
  const isFinnish = options.locale === 'fi'
  const openers = (Array.isArray(bullets) ? bullets : []).map((bullet) => firstWordOf(String(bullet ?? '')))

  return (Array.isArray(bullets) ? bullets : []).map((bullet, index) => {
    const text = normalizeText(String(bullet ?? ''))
    if (!text) return []

    const hints = []
    const words = countWords(text)
    const opener = openers[index]
    const weakPhrase = findWeakPhrase(text)

    if (weakPhrase) {
      hints.push({
        id: 'weak-phrase',
        message: isFinnish
          ? `"${weakPhrase}" kuulostaa tehtävälistalta. Kerro, mitä teit ja mitä siitä seurasi.`
          : `"${weakPhrase}" reads like a duty list. Say what you did and what came of it.`,
      })
    } else if (WEAK_OPENERS.has(opener)) {
      hints.push({
        id: 'weak-opener',
        message: isFinnish
          ? 'Aloita sillä, mitä teit, esim. "Johdin", "Rakensin" tai "Lyhensin".'
          : 'Start with what you did, e.g. "Led", "Built" or "Cut".',
      })
    }

    const filler = findFiller(text)
    if (filler) {
      hints.push({
        id: 'filler',
        message: isFinnish
          ? `"${filler}" ei kerro lukijalle mitään. Poista se tai nimeä asia.`
          : `"${filler}" tells the reader nothing. Cut it or name the thing.`,
      })
    }

    if (words > BULLET_WORD_LIMIT) {
      hints.push({
        id: 'too-long',
        message: isFinnish
          ? `${words} sanaa yhdessä kohdassa. Yksi tulos per kohta, noin ${BULLET_WORD_LIMIT} sanaa.`
          : `${words} words in one bullet. One result per bullet, about ${BULLET_WORD_LIMIT} words.`,
      })
    }

    const earlier = opener ? openers.slice(0, index).indexOf(opener) : -1
    if (earlier !== -1 && !WEAK_OPENERS.has(opener)) {
      hints.push({
        id: 'repeated-opener',
        message: isFinnish
          ? `Alkaa samalla sanalla kuin kohta ${earlier + 1}. Vaihtele verbiä.`
          : `Starts with the same word as bullet ${earlier + 1}. Vary the verb.`,
      })
    }

    if (words >= NUMBER_HINT_MIN_WORDS && !/\d/.test(text)) {
      hints.push({
        id: 'no-number',
        message: isFinnish
          ? 'Lisää luku, jos sinulla on: kuinka moni, kuinka paljon tai kuinka nopeasti.'
          : 'Add a number if you have one: how many, how much, or how fast.',
      })
    }

    return hints.slice(0, MAX_HINTS_PER_BULLET)
  })
}
