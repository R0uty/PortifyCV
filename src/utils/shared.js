export function formatDateRange(startDate, endDate, isCurrent = false, presentLabel = 'Present') {
  const resolvedEndDate = isCurrent ? presentLabel : endDate

  return [startDate, resolvedEndDate].map((value) => value.trim()).filter(Boolean).join(' - ')
}

export function formatLinkLabel(key) {
  if (key === 'github') {
    return 'GitHub'
  }

  if (key === 'linkedin') {
    return 'LinkedIn'
  }

  return key.charAt(0).toUpperCase() + key.slice(1)
}
