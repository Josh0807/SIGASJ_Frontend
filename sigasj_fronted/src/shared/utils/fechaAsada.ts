/**
 * Fechas y horas del sistema, siempre en la zona de la ASADA (Costa Rica, UTC-6).
 *
 * El API devuelve instantes en UTC (con sufijo Z) y fechas de calendario sin hora
 * (YYYY-MM-DD). Nada debe depender de la zona del navegador ni de las funciones
 * "locales" de Date: un instante de las 02:35Z es el día anterior a las 20:35 en
 * Costa Rica.
 */
export const ZONA_HORARIA_ASADA = 'America/Costa_Rica'

const VACIO = '—'
const FECHA_CALENDARIO = /^\d{4}-\d{2}-\d{2}$/

const partesEnAsada = (fecha: Date, opciones: Intl.DateTimeFormatOptions) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: ZONA_HORARIA_ASADA,
      hourCycle: 'h23',
      ...opciones,
    })
      .formatToParts(fecha)
      .map((parte) => [parte.type, parte.value]),
  ) as Record<string, string>

const aInstante = (valor: string | Date | null | undefined): Date | null => {
  if (valor == null) {
    return null
  }
  const fecha = valor instanceof Date ? valor : new Date(valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

/** `true` si el texto es una fecha de calendario sin hora (YYYY-MM-DD). */
export const esFechaCalendario = (valor: unknown): valor is string =>
  typeof valor === 'string' && FECHA_CALENDARIO.test(valor.trim())

/** Día de hoy en Costa Rica como YYYY-MM-DD (para valores por defecto de formularios). */
export const hoyEnAsada = (ahora: Date = new Date()): string => {
  const p = partesEnAsada(ahora, { year: 'numeric', month: '2-digit', day: '2-digit' })
  return `${p.year}-${p.month}-${p.day}`
}

/** Año actual en Costa Rica. */
export const anioEnAsada = (ahora: Date = new Date()): number =>
  Number(hoyEnAsada(ahora).slice(0, 4))

/**
 * DD/MM/AAAA. Una fecha de calendario (YYYY-MM-DD) se muestra tal cual, sin
 * correr el día; un instante se convierte al día de Costa Rica.
 */
export const formatearFechaAsada = (
  valor: string | Date | null | undefined,
  vacio: string = VACIO,
): string => {
  if (typeof valor === 'string' && esFechaCalendario(valor)) {
    const [anio, mes, dia] = valor.trim().split('-')
    return `${dia}/${mes}/${anio}`
  }
  const fecha = aInstante(valor)
  if (!fecha) {
    return vacio
  }
  const p = partesEnAsada(fecha, { year: 'numeric', month: '2-digit', day: '2-digit' })
  return `${p.day}/${p.month}/${p.year}`
}

/** DD/MM/AAAA HH:mm (24 horas) en hora de Costa Rica. */
export const formatearFechaHoraAsada = (
  valor: string | Date | null | undefined,
  vacio: string = VACIO,
): string => {
  const fecha = aInstante(valor)
  if (!fecha) {
    return vacio
  }
  const p = partesEnAsada(fecha, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}
