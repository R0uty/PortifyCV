export function formatDateRange(startDate, endDate) {
  return [startDate, endDate].map((value) => value.trim()).filter(Boolean).join(' - ')
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
