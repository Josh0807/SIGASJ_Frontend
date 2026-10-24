const fechaFormatter = new Intl.DateTimeFormat('es-CR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const horaFormatter = new Intl.DateTimeFormat('es-CR', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'UTC',
})

const HORA_PATTERN = /^(\d{1,2}):([0-5]\d)/

export const formatActividadFecha = (fecha: string | null | undefined): string => {
  if (!fecha?.trim()) {
    return 'Sin fecha'
  }

  const parsed = new Date(`${fecha.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return fecha
  }

  return fechaFormatter.format(parsed)
}

export const formatHoraActividad = (hora: string | null | undefined): string => {
  if (!hora?.trim()) {
    return '—'
  }

  const match = HORA_PATTERN.exec(hora.trim())
  if (!match) {
    return hora.trim()
  }

  const horas = Number(match[1])
  const minutos = Number(match[2])
  if (horas > 23) {
    return hora.trim()
  }

  const parsed = new Date(Date.UTC(1970, 0, 1, horas, minutos))
  return horaFormatter.format(parsed).toLocaleUpperCase('es-CR')
}

type PeriodoActividad = {
  fechaActividad?: string | null
  horaInicio?: string | null
  fechaFin?: string | null
  horaFin?: string | null
}

export type PeriodoActividadPartes = {
  fecha: string
  hora: string
}

const mismaFechaCalendario = (
  inicio?: string | null,
  fin?: string | null,
): boolean => {
  const finFecha = fin?.trim() ?? ''
  return !finFecha || finFecha.slice(0, 10) === (inicio ?? '').trim().slice(0, 10)
}

export const formatPeriodoActividadPartes = ({
  fechaActividad,
  horaInicio,
  fechaFin,
  horaFin,
}: PeriodoActividad): PeriodoActividadPartes => {
  const inicioFecha = formatActividadFecha(fechaActividad)
  const fecha = mismaFechaCalendario(fechaActividad, fechaFin)
    ? inicioFecha
    : `${inicioFecha} – ${formatActividadFecha(fechaFin)}`

  const inicioHora = horaInicio?.trim() ? formatHoraActividad(horaInicio) : ''
  const finHora = horaFin?.trim() ? formatHoraActividad(horaFin) : ''
  const hora =
    inicioHora && finHora
      ? `${inicioHora} – ${finHora}`
      : inicioHora || finHora || '—'

  return { fecha, hora }
}

/** Resume inicio y fin para listados que aún usan un solo texto. */
export const formatPeriodoActividad = (periodo: PeriodoActividad): string => {
  const { fecha, hora } = formatPeriodoActividadPartes(periodo)
  return hora === '—' ? fecha : `${fecha} · ${hora}`
}
