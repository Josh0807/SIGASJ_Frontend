const EMPTY_DATE = '—'

/** Misma zona que el reloj del Backend (`America/Costa_Rica`). */
const ZONA_HORARIA_SIGASJ = 'America/Costa_Rica'

const pad = (unit: string) => unit.padStart(2, '0')

/**
 * Fecha + hora del sistema, en Costa Rica. No usa la zona del navegador:
 * un instante UTC no debe verse como 22:22 si en la ASADA son las 16:22.
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

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: ZONA_HORARIA_SIGASJ,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(parsed)
      .map((part) => [part.type, part.value]),
  )

  return `${pad(parts.day ?? '')}/${pad(parts.month ?? '')}/${parts.year} ${pad(parts.hour ?? '')}:${pad(parts.minute ?? '')}`
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
