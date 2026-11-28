// The cover letter draft's sentences in Swedish (see en.js). No serial
// comma before "och", and no comma after the sign-off, as Swedish letters
// are written.
export default {
  join: {
    pair: '{first} och {second}',
    series: '{head} och {last}',
  },
  greeting: {
    named: 'Hej {name},',
    unnamed: 'Hej,',
  },
  opening: {
    roleAtCompany: 'Jag söker härmed tjänsten som {role} hos {company}.',
    role: 'Jag söker härmed tjänsten som {role}.',
    company: 'Jag söker härmed den lediga tjänsten hos {company}.',
    plain: 'Jag söker härmed den lediga tjänsten.',
  },
  experience: {
    roleAtCompany: '{role} hos {company}',
    current: 'I min nuvarande roll som {roleCompany}: {detail}',
    previous: 'I min senaste roll som {roleCompany}: {detail}',
  },
  skills: {
    fromAd: 'Min erfarenhet motsvarar det som tjänsten kräver: {terms}.',
    fromCv: 'Min kompetens omfattar bland annat {skills}.',
  },
  closing: {
    company: 'Jag berättar gärna mer om hur min erfarenhet kan bidra till {company}. Tack för att du tog dig tid att läsa min ansökan.',
    team: 'Jag berättar gärna mer om hur min erfarenhet kan bidra till ert team. Tack för att du tog dig tid att läsa min ansökan.',
  },
  signOff: 'Med vänlig hälsning\n{name}',
}
