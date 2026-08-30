const EMPTY_DATE = '—'

export const formatProyectoAdminDate = (value: string | null | undefined): string => {
  if (!value?.trim()) {
    return EMPTY_DATE
  }

  const datePart = value.split('T')[0]
  const parts = datePart.split('-')
  if (parts.length === 3) {
    const [year, month, day] = parts
    const numeric = [year, month, day].every((part) => /^\d+$/.test(part))
    if (numeric) {
      return `${day}/${month}/${year}`
    }
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return EMPTY_DATE
  }

  const pad = (unit: number) => String(unit).padStart(2, '0')
  return `${pad(parsed.getUTCDate())}/${pad(parsed.getUTCMonth() + 1)}/${parsed.getUTCFullYear()}`
}
