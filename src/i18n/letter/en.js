// The cover letter draft's sentences in English (utils/coverLetter.js's
// generateCoverLetterDraft), drafted in the CV's language. Each sentence is
// whole, with its own case for a missing company or role.
export default {
  join: {
    pair: '{first} and {second}',
    series: '{head}, and {last}',
  },
  greeting: {
    named: 'Dear {name},',
    unnamed: 'Dear Hiring Manager,',
  },
  opening: {
    roleAtCompany: "I'm writing to apply for the {role} position at {company}.",
    role: "I'm writing to apply for the {role} position.",
    company: "I'm writing to apply for this position at {company}.",
    plain: "I'm writing to apply for this position.",
  },
  experience: {
    // Role and company together; a single one stands alone.
    roleAtCompany: '{role} at {company}',
    current: 'In my current role as {roleCompany}: {detail}',
    previous: 'In my most recent role as {roleCompany}: {detail}',
  },
  skills: {
    fromAd: 'My experience covers what this role asks for: {terms}.',
    fromCv: 'My background includes {skills}.',
  },
  closing: {
    company: "I'd welcome the opportunity to discuss how my experience could contribute to {company}. Thank you for your time and consideration.",
    team: "I'd welcome the opportunity to discuss how my experience could contribute to your team. Thank you for your time and consideration.",
  },
  signOff: 'Sincerely,\n{name}',
}
