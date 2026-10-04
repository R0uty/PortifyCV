import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: executive, timeline.
const shared = {
  fullName: 'Laura Peltonen',
  email: 'laura.peltonen@example.com',
  phone: '+358 40 000 2101',
  links: {
    linkedin: 'https://linkedin.com/in/example-lpeltonen',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Operations Manager',
  location: 'Pori, Finland',
  about:
    'Operations manager with 12 years running warehouse and fulfillment operations for retail and e-commerce. I measure everything on the floor weekly, so a problem is a line on a chart before it becomes a customer complaint.',
  skills: ['Supply chain management', 'Lean & Six Sigma', 'Warehouse management systems', 'Workforce planning', 'Vendor negotiation', 'KPI reporting', 'Process improvement', 'Safety compliance'],
  experience: [
    {
      role: 'Operations Manager',
      company: 'Satalahti Fulfillment',
      location: 'Pori, Finland',
      employmentType: 'Full-time',
      startDate: 'May 2018',
      endDate: '',
      isCurrent: true,
      description: 'Run day-to-day operations across 2 fulfillment centers shipping 18,000 orders a day.',
      achievements: [
        'Cut average order-to-ship time from 36 hours to 9 hours by redesigning the pick-pack workflow around zone picking.',
        'Reduced warehouse labor cost per order by 19% through a shift-scheduling overhaul tied to hourly order-volume forecasts.',
        'Brought the on-time shipment rate from 91% to 98.6% over 2 peak seasons.',
      ],
      technologies: [],
    },
    {
      role: 'Warehouse Operations Supervisor',
      company: 'Rantasilta Retail Group',
      location: 'Turku, Finland',
      employmentType: 'Full-time',
      startDate: 'Feb 2014',
      endDate: 'Apr 2018',
      isCurrent: false,
      description: 'Supervised a 45-person warehouse team for a regional retail chain\'s distribution center.',
      achievements: [
        'Led the rollout of a new WMS across the distribution center, cutting inventory discrepancies by 70%.',
        'Reduced workplace injury incidents from 11 to 2 per year by rebuilding the safety-induction program.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Satakunta University of Applied Sciences',
      degree: 'B.Eng. Logistics Engineering',
      location: 'Pori, Finland',
      startDate: '2010',
      endDate: '2014',
      honors: '',
      coursework: 'Supply chain management, Operations research, Quality management',
      grade: '',
    },
  ],
  leadership: [
    {
      role: 'Mentor',
      organization: 'Satakunta Logistics Network',
      description: 'Mentor early-career operations supervisors on workforce planning and safety programs.',
      startDate: '2020',
      endDate: '',
    },
  ],
  projects: [
    {
      name: 'Zone-picking redesign',
      description: 'Redesigned the pick-pack workflow around zone picking across 2 fulfillment centers.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Satalahti Fulfillment',
      impact: 'Order-to-ship time cut from 36 to 9 hours.',
      date: '2021',
      teamSize: '14',
      contribution: 'Project lead, coordinating with 3 shift supervisors.',
      image: '',
    },
  ],
  achievements: [
    { title: 'Operational Excellence Award', description: 'Regional award for the fulfillment center turnaround at Satalahti Fulfillment.', year: '2022' },
  ],
  languages: [
    { language: 'Finnish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
  ],
  certificates: [
    { name: 'Lean Six Sigma Green Belt', issuer: 'ASQ', year: '2019', credentialUrl: '', expiry: '' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Operatiivinen päällikkö',
  location: 'Pori',
  about:
    'Operatiivinen päällikkö, jolla on 12 vuoden kokemus varasto- ja toimitustoiminnan johtamisesta vähittäiskaupassa ja verkkokaupassa. Mittaan kaiken lattiatasolla viikoittain, jotta ongelma näkyy kaaviossa ennen kuin se näkyy asiakasvalituksena.',
  skills: ['Toimitusketjun hallinta', 'Lean ja Six Sigma', 'Varastonhallintajärjestelmät', 'Työvoimasuunnittelu', 'Toimittajaneuvottelut', 'KPI-raportointi', 'Prosessien kehittäminen', 'Työturvallisuus'],
  experience: [
    {
      role: 'Operatiivinen päällikkö',
      company: 'Satalahti Fulfillment',
      location: 'Pori',
      employmentType: 'Full-time',
      startDate: '05/2018',
      endDate: '',
      isCurrent: true,
      description: 'Vastaan päivittäisestä toiminnasta kahdessa toimituskeskuksessa, jotka lähettävät 18 000 tilausta päivässä.',
      achievements: [
        'Lyhensin tilauksen keskimääräisen käsittelyajan 36 tunnista 9 tuntiin uudistamalla keräily- ja pakkausprosessin vyöhykekeräilyn pohjalta.',
        'Vähensin varaston työvoimakustannusta tilausta kohti 19 % uudistamalla vuorosuunnittelun tuntikohtaisten tilausennusteiden mukaan.',
        'Nostin ajallaan lähetettyjen tilausten osuuden 91 %:sta 98,6 %:iin kahden sesonkipiikin aikana.',
      ],
      technologies: [],
    },
    {
      role: 'Varaston toiminnan esimies',
      company: 'Rantasilta Retail Group',
      location: 'Turku',
      employmentType: 'Full-time',
      startDate: '02/2014',
      endDate: '04/2018',
      isCurrent: false,
      description: 'Johdin 45 hengen varastotiimiä alueellisen vähittäiskauppaketjun jakelukeskuksessa.',
      achievements: [
        'Johdin uuden varastonhallintajärjestelmän käyttöönoton jakelukeskuksessa, vähentäen varastoeroja 70 %.',
        'Vähensin työtapaturmia 11:stä 2:een vuodessa uudistamalla turvallisuusperehdytysohjelman.',
      ],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Satakunnan ammattikorkeakoulu',
      degree: 'Insinööri (AMK), logistiikka',
      location: 'Pori',
      startDate: '2010',
      endDate: '2014',
      honors: '',
      coursework: 'Toimitusketjun hallinta, operaatiotutkimus, laadunhallinta',
      grade: '',
    },
  ],
  leadership: [
    {
      role: 'Mentori',
      organization: 'Satakunnan logistiikkaverkosto',
      description: 'Mentoroin uran alkuvaiheessa olevia operatiivisia esimiehiä työvoimasuunnittelussa ja turvallisuusohjelmissa.',
      startDate: '2020',
      endDate: '',
    },
  ],
  projects: [
    {
      name: 'Vyöhykekeräilyn uudistus',
      description: 'Uudistin keräily- ja pakkausprosessin vyöhykekeräilyn pohjalta kahdessa toimituskeskuksessa.',
      stack: '',
      githubUrl: '',
      demoUrl: '',
      organization: 'Satalahti Fulfillment',
      impact: 'Tilauksen käsittelyaika laski 36 tunnista 9 tuntiin.',
      date: '2021',
      teamSize: '14',
      contribution: 'Projektivastaava, yhteistyössä 3 vuoroesimiehen kanssa.',
      image: '',
    },
  ],
  achievements: [
    { title: 'Operatiivisen erinomaisuuden palkinto', description: 'Alueellinen palkinto toimituskeskuksen käänteestä Satalahti Fulfillmentissa.', year: '2022' },
  ],
  languages: [
    { language: 'Suomi', level: 'Äidinkieli' },
    { language: 'Englanti', level: 'Sujuva' },
  ],
  certificates: [
    { name: 'Lean Six Sigma Green Belt', issuer: 'ASQ', year: '2019', credentialUrl: '', expiry: '' },
  ],
})

export default { en, fi }
