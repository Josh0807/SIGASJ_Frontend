const EMPTY_DATE = '—'

const pad = (unit: number) => String(unit).padStart(2, '0')

/**
 * Fecha + hora para el listado. El proyecto no tiene i18n ni un helper
 * compartido de date-time; el formato sigue el de proyectos (dd/mm/yyyy)
 * y agrega hh:mm en hora local.
 */
export const formatAveriaAdminDateTime = (
  value: string | Date | null | undefined,
): string => {
  if (value == null || (typeof value === 'string' && !value.trim())) {
    return EMPTY_DATE
  }

  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return EMPTY_DATE
  }

  return `${pad(parsed.getDate())}/${pad(parsed.getMonth() + 1)}/${parsed.getFullYear()} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`
}

export const formatAveriaAdminDateTimeOrUnavailable = (
  value: string | Date | null | undefined,
  unavailableLabel: string,
): string => {
  if (value == null || (typeof value === 'string' && !value.trim())) {
    return unavailableLabel
  }

  const formatted = formatAveriaAdminDateTime(value)
  return formatted === EMPTY_DATE ? unavailableLabel : formatted
}
