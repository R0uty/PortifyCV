// Regression check for the CV text parser (src/utils/cvTextImport.js), the
// half of PDF/Word import that turns extracted lines into CV data.
//
// It's pure — (lines) -> { data, summary } — so it runs here without a
// browser. The other half (reading the file) needs pdf.js and a DOM and is
// covered by e2e/cv-file-import.spec.js.
//
//   node scripts/check-cv-import.mjs
//
// Exits non-zero if any check fails.

import { registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

// The app's source uses extensionless relative imports, which Vite resolves and
// bare Node does not.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
        return nextResolve(`${specifier}.js`, context)
      }
      throw error
    }
  },
})

const srcDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '../src')
const importSrc = (relativePath) => import(pathToFileURL(resolvePath(srcDir, relativePath)).href)

const { parseCvText } = await importSrc('utils/cvTextImport.js')
const { parseImportedCvData } = await importSrc('utils/cvForm.js')
const { COLUMN_BREAK, pdfPagesToLines } = await importSrc('utils/cvFileText.js')
const { ENGLISH_CV_LINES, FINNISH_CV_LINES } = await import('./fixtures/cvImportSamples.mjs')
const { compareParsedCv } = await importSrc('utils/parserView.js')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}
const same = (label, actual, expected) =>
  check(label, JSON.stringify(actual) === JSON.stringify(expected), `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`)
const throws = (label, fn) => {
  try {
    fn()
    check(label, false, 'did not throw')
  } catch {
    check(label, true)
  }
}

// --- English CV -----------------------------------------------------------
{
  const { data, summary } = parseCvText(ENGLISH_CV_LINES, { locale: 'en' })

  same('en: name', data.fullName, 'Jane Example')
  same('en: title', data.title, 'Senior Software Engineer')
  same('en: email', data.email, 'jane@example.com')
  same('en: phone', data.phone, '+358 40 123 4567')
  same('en: location', data.location, 'Helsinki, Finland')
  same('en: linkedin', data.links.linkedin, 'https://linkedin.com/in/janeexample')
  same('en: github', data.links.github, 'https://github.com/janeexample')
  check('en: summary text', data.about.startsWith('Engineer with nine years') && data.about.endsWith('small teams.'), data.about)

  same('en: two jobs', data.experience.length, 2)
  same('en: job 1 role', data.experience[0].role, 'Senior Software Engineer')
  same('en: job 1 company', data.experience[0].company, 'Northwind Oy')
  same('en: job 1 start', data.experience[0].startDate, 'Jan 2020')
  same('en: job 1 end is empty', data.experience[0].endDate, '')
  same('en: job 1 is current', data.experience[0].isCurrent, true)
  same('en: job 1 bullets', data.experience[0].achievements, [
    'Cut checkout latency by 40% by moving pricing to an edge cache.',
    'Led a team of five through a migration to TypeScript.',
  ])
  same('en: job 2 role', data.experience[1].role, 'Software Engineer')
  same('en: job 2 company', data.experience[1].company, 'Contoso Ltd')
  same('en: job 2 dates', [data.experience[1].startDate, data.experience[1].endDate, data.experience[1].isCurrent], ['2017', '2019', false])
  same('en: job 2 bullets', data.experience[1].achievements.length, 1)
  same('en: job 2 technologies', data.experience[1].technologies, ['Python', 'PostgreSQL'])

  same('en: one degree', data.education.length, 1)
  same('en: school', data.education[0].school, 'Aalto University')
  same('en: degree', data.education[0].degree, 'M.Sc. Computer Science')
  same('en: degree dates', [data.education[0].startDate, data.education[0].endDate], ['2012', '2017'])

  same('en: skills', data.skills, ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'])
  same('en: languages', data.languages, [
    { language: 'English', level: 'Native' },
    { language: 'Finnish', level: 'B2' },
  ])
  same('en: summary counts', summary, { hasName: true, experience: 2, education: 1, skills: 5, languages: 2 })
  check('en: a "References" section is not poured into another section', !JSON.stringify(data).includes('Available on request'))

  let roundTrip = true
  try {
    parseImportedCvData(JSON.parse(JSON.stringify(data)))
  } catch {
    roundTrip = false
  }
  check('en: the result passes the JSON import validator', roundTrip)
}

// --- Finnish CV -----------------------------------------------------------
{
  const { data, summary } = parseCvText(FINNISH_CV_LINES, { locale: 'fi' })

  same('fi: name', data.fullName, 'Matti Esimerkki')
  same('fi: title', data.title, 'Sairaanhoitaja')
  same('fi: email', data.email, 'matti.esimerkki@example.fi')
  same('fi: phone', data.phone, '040 123 4567')
  check('fi: summary text', data.about.startsWith('Kokenut sairaanhoitaja'), data.about)
  same('fi: two jobs', data.experience.length, 2)
  same('fi: job 1 role', data.experience[0].role, 'Sairaanhoitaja')
  same('fi: job 1 company', data.experience[0].company, 'HUS')
  same('fi: job 1 dates', [data.experience[0].startDate, data.experience[0].endDate, data.experience[0].isCurrent], ['1/2020', '', true])
  same('fi: job 1 bullets', data.experience[0].achievements.length, 2)
  same('fi: job 2 dates', [data.experience[1].startDate, data.experience[1].endDate, data.experience[1].isCurrent], ['8/2015', '12/2019', false])
  same('fi: school', data.education[0].school, 'Metropolia Ammattikorkeakoulu')
  same('fi: degree', data.education[0].degree, 'Sairaanhoitaja (AMK)')
  same('fi: skills', data.skills, ['Triage', 'Lääkehoito', 'Potilasohjaus'])
  same('fi: languages', data.languages, [
    { language: 'Suomi', level: 'äidinkieli' },
    { language: 'Englanti', level: 'hyvä' },
  ])
  same('fi: summary counts', summary, { hasName: true, experience: 2, education: 1, skills: 3, languages: 2 })
}

// --- Date forms -----------------------------------------------------------
{
  const job = (dateLine) =>
    parseCvText(['Pat Example', 'Experience', 'Analyst', 'Fabrikam Inc', dateLine, '- Did the work.']).data.experience[0]
  const dates = (dateLine) => {
    const entry = job(dateLine)
    return [entry.startDate, entry.endDate, entry.isCurrent]
  }

  same('dates: year range with an en dash', dates('2019–2021'), ['2019', '2021', false])
  same('dates: numeric months', dates('03/2018 - 06/2020'), ['03/2018', '06/2020', false])
  same('dates: Finnish "nykyinen"', dates('1/2020 – nykyinen'), ['1/2020', '', true])
  same('dates: month names', dates('March 2018 to June 2020'), ['March 2018', 'June 2020', false])
  same('dates: "current"', dates('Sep 2021 - Current'), ['Sep 2021', '', true])
  same('dates: an open range means current', dates('5/2022 –'), ['5/2022', '', true])
  same('dates: a single year is the start', dates('2019'), ['2019', '', false])
  same('dates: role and company survive every date form', [job('2019–2021').role, job('2019–2021').company], ['Analyst', 'Fabrikam Inc'])
}

// --- Entry layouts --------------------------------------------------------
{
  const first = (lines) => parseCvText(['Pat Example', 'Experience', ...lines]).data.experience[0]

  const oneLine = first(['Product Manager at Fabrikam Inc, Jan 2020 – Present', '• Shipped it.'])
  same('layout: role, company and dates on one line', [oneLine.role, oneLine.company, oneLine.startDate, oneLine.isCurrent], ['Product Manager', 'Fabrikam Inc', 'Jan 2020', true])

  const dateFirst = first(['2018 – 2020', 'Product Manager, Fabrikam Inc', '• Shipped it.'])
  same('layout: dates first, then role and company', [dateFirst.role, dateFirst.company, dateFirst.startDate], ['Product Manager', 'Fabrikam Inc', '2018'])

  const companyFirst = first(['Fabrikam Inc | Product Manager | 2018 – 2020'])
  same('layout: company before the role', [companyFirst.role, companyFirst.company], ['Product Manager', 'Fabrikam Inc'])

  const prose = first(['Product Manager', 'Fabrikam Inc', '2018 – 2020', 'Owned the roadmap for the billing product and its two integrations.'])
  same('layout: a paragraph becomes the description', prose.description, 'Owned the roadmap for the billing product and its two integrations.')
  same('layout: a paragraph is not a bullet', prose.achievements, [])
}

// --- Layouts found by re-importing this app's own PDF exports ---------------
{
  const cv = (lines) => parseCvText(['Pat Example', 'Experience', ...lines]).data
  const first = (lines) => cv(lines).experience[0]

  const below = cv([
    'Product Manager  Jan 2022 - Present', 'Fabrikam Inc · Helsinki, Finland · Full-time',
    'Owned the roadmap for the billing product and its two integrations.', 'Figma · Design Systems · Storybook',
    'Analyst  Jun 2019 - Dec 2021', 'Contoso Ltd · Remote', 'Built the reporting pipeline.',
  ]).experience
  same('company row below the role: job 1', [below[0].role, below[0].company, below[0].location, below[0].employmentType], ['Product Manager', 'Fabrikam Inc', 'Helsinki, Finland', 'Full-time'])
  same('an unlabelled row of short items is the job\'s technologies', below[0].technologies, ['Figma', 'Design Systems', 'Storybook'])
  same('a technology row is not the next job\'s role', [below[1].role, below[1].company, below[1].location], ['Analyst', 'Contoso Ltd', 'Remote'])
  check('the description keeps single spaces', !below[0].description.includes('  '), below[0].description)

  const leading = first(['Jan 2022  Product Manager', 'Fabrikam Inc · Helsinki, Finland'])
  same('a date before the role', [leading.role, leading.company, leading.startDate], ['Product Manager', 'Fabrikam Inc', 'Jan 2022'])

  const trailing = first(['Product Manager  Jan 2022', 'Fabrikam Inc · Helsinki, Finland'])
  same('a lone date after the role', [trailing.role, trailing.company, trailing.startDate], ['Product Manager', 'Fabrikam Inc', 'Jan 2022'])

  const sentence = cv(['Product Manager', 'Fabrikam Inc', '2018 – 2020', 'Shipped the new roadmap in 2020']).experience
  same('a sentence ending in a year is not a new job', sentence.length, 1)

  const wrapped = first(['Jun 2019 - Dec  Product Manager', '2021  Fabrikam Inc · Remote', 'Built the reporting pipeline.'])
  same('a date range wrapped over two rows', [wrapped.role, wrapped.company, wrapped.startDate, wrapped.endDate], ['Product Manager', 'Fabrikam Inc', 'Jun 2019', 'Dec 2021'])

  const degree = parseCvText(['Pat Example', 'Education', 'B.A. Graphic Design  2014 - 2018', 'Example University · Helsinki, Finland']).data.education[0]
  same('education with the school row below', [degree.degree, degree.school, degree.location, degree.startDate, degree.endDate], ['B.A. Graphic Design', 'Example University', 'Helsinki, Finland', '2014', '2018'])

  const chips = parseCvText(['Pat Example', 'Key Skills', 'Other', 'Product Strategy  Design Systems  Figma', 'Language Skills', 'English  Fluent']).data
  same('skill chips separated only by gaps, minus the "Other" group label', chips.skills, ['Product Strategy', 'Design Systems', 'Figma'])
  same('a language and its level separated by a gap', chips.languages, [{ language: 'English', level: 'Fluent' }])

  const decorated = parseCvText(['Pat Example', 'Featured Projects', 'Atlas', 'Professional Experience', 'Analyst', 'Fabrikam Inc', '2019 – 2021']).data
  same('"Professional Experience" is the experience heading', decorated.experience[0].role, 'Analyst')
  check('"Featured Projects" is a heading, not content', !JSON.stringify(decorated).includes('Atlas'))

  const twoLineName = parseCvText(['Pat', 'Example', 'Data Analyst', 'pat@example.com']).data
  same('a name set on two lines', [twoLineName.fullName, twoLineName.title], ['Pat Example', 'Data Analyst'])
}

// --- Two-column PDFs --------------------------------------------------------
{
  // The sidebar came first; the name is above the other column's first heading.
  const sidebarFirst = parseCvText([
    'Tech Stack', 'SQL  Excel', 'Languages', 'English  Fluent',
    COLUMN_BREAK,
    'Pat Example', 'Data Analyst', 'pat@example.com  +358 50 555 0100  Helsinki, Finland',
    'Experience', 'Analyst  2019 – 2021', 'Fabrikam Inc · Remote',
  ]).data
  same('name and title from the second column', [sidebarFirst.fullName, sidebarFirst.title], ['Pat Example', 'Data Analyst'])
  same('contact details from the second column', [sidebarFirst.email, sidebarFirst.phone, sidebarFirst.location], ['pat@example.com', '+358 50 555 0100', 'Helsinki, Finland'])
  same('skills from the sidebar', sidebarFirst.skills, ['SQL', 'Excel'])

  const mainFirst = parseCvText([
    'Pat Example', 'Data Analyst', 'Experience', 'Analyst  2019 – 2021', 'Fabrikam Inc · Remote', 'Built dashboards.',
    COLUMN_BREAK,
    'Personal Info', 'Helsinki, Finland', 'pat@example.com', 'Skills', 'SQL',
  ]).data
  same('a column break ends the open section', mainFirst.experience[0].description, 'Built dashboards.')
  same('a location on its own line under a contact heading', mainFirst.location, 'Helsinki, Finland')
  same('e-mail from the sidebar', mainFirst.email, 'pat@example.com')

  // pdf.js text items: x, y (from the bottom), width, height.
  const item = (str, x, y, height = 10) => ({ str, transform: [height, 0, 0, height, x, y], width: str.length * height * 0.5, height })
  const column = (x, top, texts) => texts.map((text, index) => item(text, x, top - index * 14))
  const sidebar = column(40, 700, ['Skills', 'SQL', 'Excel', 'Tableau', 'Python', 'Languages', 'English', 'Finnish', 'Swedish', 'German', 'Contact', 'Helsinki'])
  const main = [
    item('Pat Example', 220, 760, 22),
    ...column(220, 700, ['Experience', 'Analyst at Fabrikam Inc', '2019 – 2021', 'Built the reporting pipeline', 'for the whole finance team', 'Education', 'Example University', 'B.Sc. Statistics', '2015 – 2019', 'Projects', 'Dashboards', 'Forecasts']),
  ]
  const lines = pdfPagesToLines([[...sidebar, ...main]])
  same('columns are read one after the other, the name\'s column first', lines.slice(0, 3), ['Pat Example', 'Experience', 'Analyst at Fabrikam Inc'])
  same('a column break separates them', [lines.indexOf(COLUMN_BREAK), lines[lines.indexOf(COLUMN_BREAK) + 1]], [13, 'Skills'])

  const dated = [
    item('Pat Example', 40, 760, 22),
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].flatMap((row) => [
      item(row % 4 === 0 ? 'Analyst at Fabrikam Inc' : 'Built the reporting pipeline for the finance team', 40, 700 - row * 14),
      ...(row % 4 === 0 ? [item('2019 – 2021', 480, 700 - row * 14)] : []),
    ]),
  ]
  const single = pdfPagesToLines([dated])
  check('right-aligned dates are not a second column', !single.includes(COLUMN_BREAK), JSON.stringify(single.slice(0, 3)))
  same('the date stays on its row, after a gap', single[1], 'Analyst at Fabrikam Inc  2019 – 2021')

  const chipsOnPageTwo = [item('Product Strategy', 40, 700), item('Design Systems', 120, 700), item('Figma', 300, 700)]
  check('a later page is not split when page one has no columns', !pdfPagesToLines([dated, chipsOnPageTwo]).includes(COLUMN_BREAK))
}

// --- Inputs the parser must survive ---------------------------------------
{
  const headingless = parseCvText(['Pat Example', 'Data Analyst', 'pat@example.com', 'Worked at Fabrikam for two years doing analysis.', 'Built dashboards.'])
  same('no headings: name', headingless.data.fullName, 'Pat Example')
  same('no headings: title', headingless.data.title, 'Data Analyst')
  same('no headings: email', headingless.data.email, 'pat@example.com')
  same('no headings: experience stays the single empty entry', [headingless.data.experience.length, headingless.data.experience[0].role], [1, ''])
  same('no headings: nothing is guessed into the summary', headingless.data.about, '')

  // Columns the extractor could not separate: sidebar and main column interleave.
  const interleaved = parseCvText([
    'Pat Example', 'Contact Experience', 'pat@example.com Analyst, Fabrikam Inc', '+358 50 555 0100 2019 – 2021',
    'Skills • Built dashboards.', 'SQL, Excel',
  ])
  same('two columns: still finds the email', interleaved.data.email, 'pat@example.com')
  same('two columns: still finds the name', interleaved.data.fullName, 'Pat Example')

  const titled = parseCvText(['Curriculum Vitae', 'Pat Example', 'Data Analyst', 'pat@example.com'])
  same('a "Curriculum Vitae" title line is not the name', titled.data.fullName, 'Pat Example')

  const inline = parseCvText(['Pat Example', 'Skills: SQL, Excel, Tableau', 'Languages: English (C1), Swedish (B1)'])
  same('a heading with its content on the same line', inline.data.skills, ['SQL', 'Excel', 'Tableau'])
  same('languages with the level in brackets', inline.data.languages, [
    { language: 'English', level: 'C1' },
    { language: 'Swedish', level: 'B1' },
  ])

  const noisy = parseCvText(['Pat Example', 'Page 1 of 2', 'Experience', 'Analyst', 'Fabrikam Inc', '2019 – 2021', '• Kept 2019 - 2021 budgets within 3%.'])
  same('a date range inside a bullet does not start a new job', noisy.data.experience.length, 1)
  same('a date range in the body is not read as a phone number', noisy.data.phone, '')
  check('page numbers are dropped', !JSON.stringify(noisy.data).includes('Page 1'))

  const techy = parseCvText(['Pat Example', 'Summary', 'I build with Node.js and ASP.NET daily.'])
  same('"Node.js" in prose is not a website link', techy.data.links.website, '')

  const site = parseCvText(['Pat Example', 'pat@example.com | www.patexample.dev | behance.net/pat'])
  same('a personal site becomes the website link', site.data.links.website, 'https://www.patexample.dev')
  same('a known host fills its own link', site.data.links.behance, 'https://behance.net/pat')

  throws('empty input throws', () => parseCvText([]))
  throws('whitespace-only lines throw', () => parseCvText(['  ', '\t']))
  throws('text with nothing recognisable throws', () => parseCvText(['12345', '---']))
  let message = ''
  try {
    parseCvText([], { locale: 'fi' })
  } catch (error) {
    message = error.message
  }
  check('the error is in Finnish for the Finnish locale', /CV/.test(message) && /ei|löytynyt/i.test(message), message)
}

// ── "What a parser reads" (1.7.4, src/utils/parserView.js) ──
// The PDF preview's second tab: the CV on screen against what the parser
// made of the PDF's text.
console.log('\ncompareParsedCv\n')
{
  // The CV as the builder holds it: what the sample lines were made from.
  const parsed = parseCvText(ENGLISH_CV_LINES).data
  const builderCv = parseImportedCvData(JSON.parse(JSON.stringify(parsed)))
  const status = (rows, field) => rows.filter((row) => row.field === field).map((row) => row.status)

  const allRead = compareParsedCv(builderCv, parsed, ENGLISH_CV_LINES)
  check('a CV read back from its own text: every row is ok', allRead.every((row) => row.status === 'ok'), JSON.stringify(allRead.filter((row) => row.status !== 'ok')))
  same('rows follow the CV: one per job and school', allRead.map((row) => row.field), ['name', 'headline', 'email', 'phone', 'summary', 'job', 'job', 'education', 'skills', 'languages'])
  same('skills carry a count', allRead.find((row) => row.field === 'skills').count, { found: 5, total: 5 })

  // The parser placed nothing: everything is still in the text.
  const unplaced = compareParsedCv(builderCv, null, ENGLISH_CV_LINES)
  check('nothing parsed, all in the text: unrecognised, not missing', unplaced.every((row) => row.status === 'unrecognised'), JSON.stringify(unplaced.filter((row) => row.status !== 'unrecognised')))

  // A PDF whose text lost the contact line and the school.
  const lossy = ENGLISH_CV_LINES.filter((line) => !line.includes('@') && line !== 'M.Sc. Computer Science' && line !== 'Aalto University')
  const lossyRows = compareParsedCv(builderCv, parseCvText(lossy).data, lossy)
  same('a line missing from the text: email and phone are missing', [...status(lossyRows, 'email'), ...status(lossyRows, 'phone')], ['missing', 'missing'])
  same('a school missing from the text is missing; the jobs still read', [...status(lossyRows, 'education'), ...status(lossyRows, 'job')], ['missing', 'ok', 'ok'])

  // Skills partly read.
  const someSkills = { ...parsed, skills: parsed.skills.slice(0, 2) }
  const partial = compareParsedCv(builderCv, someSkills, ENGLISH_CV_LINES).find((row) => row.field === 'skills')
  same('some skills read: partial, with the count', [partial.status, partial.count], ['partial', { found: 2, total: 5 }])

  // Phone numbers compare by digits; an empty CV field gets no row.
  const reformatted = { ...parsed, phone: '+358401234567' }
  same('a phone written differently still reads', status(compareParsedCv(builderCv, reformatted, ENGLISH_CV_LINES), 'phone'), ['ok'])
  same('a field the CV leaves empty has no row', compareParsedCv({ ...builderCv, email: '', phone: '' }, parsed, ENGLISH_CV_LINES).some((row) => row.field === 'email' || row.field === 'phone'), false)
}

console.log()
if (failures > 0) {
  console.log(`${failures} check(s) failed.`)
  process.exit(1)
}

console.log('All CV import checks passed.')
