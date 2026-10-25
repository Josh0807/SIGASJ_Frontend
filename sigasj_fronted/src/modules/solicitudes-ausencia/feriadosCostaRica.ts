/**
 * Feriados nacionales de Costa Rica (Código de Trabajo, art. 148).
 * Debe coincidir con Backend `feriados-costa-rica.ts`.
 */

export type FeriadoCostaRica = {
  fecha: string
  nombre: string
}

const FIXED: ReadonlyArray<{ mes: number; dia: number; nombre: string }> = [
  { mes: 1, dia: 1, nombre: 'Año Nuevo' },
  { mes: 4, dia: 11, nombre: 'Batalla de Rivas / Juan Santamaría' },
  { mes: 5, dia: 1, nombre: 'Día del Trabajador' },
  { mes: 7, dia: 25, nombre: 'Anexión del Partido de Nicoya' },
  { mes: 8, dia: 2, nombre: 'Virgen de los Ángeles' },
  { mes: 8, dia: 15, nombre: 'Día de la Madre' },
  {
    mes: 8,
    dia: 31,
    nombre: 'Día de la Persona Negra y la Cultura Afrocostarricense',
  },
  { mes: 9, dia: 15, nombre: 'Día de la Independencia' },
  { mes: 12, dia: 1, nombre: 'Abolición del Ejército' },
  { mes: 12, dia: 25, nombre: 'Navidad' },
]

/** Domingo de Pascua (algoritmo gregoriano Meeus/Jones/Butcher). */
export const domingoPascua = (anio: number): { mes: number; dia: number } => {
  const a = anio % 19
  const b = Math.floor(anio / 100)
  const c = anio % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return { mes, dia }
}

const iso = (anio: number, mes: number, dia: number): string =>
  `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

const sumarDiasUtc = (fechaIso: string, delta: number): string => {
  const [y, m, d] = fechaIso.split('-').map(Number)
  const ms = Date.UTC(y, m - 1, d) + delta * 86_400_000
  const date = new Date(ms)
  return iso(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

export const feriadosDelAnio = (anio: number): FeriadoCostaRica[] => {
  if (!Number.isInteger(anio) || anio < 1900 || anio > 2200) return []
  const pascua = domingoPascua(anio)
  const domingo = iso(anio, pascua.mes, pascua.dia)
  const moviles: FeriadoCostaRica[] = [
    { fecha: sumarDiasUtc(domingo, -3), nombre: 'Jueves Santo' },
    { fecha: sumarDiasUtc(domingo, -2), nombre: 'Viernes Santo' },
  ]
  const fijos = FIXED.map((f) => ({
    fecha: iso(anio, f.mes, f.dia),
    nombre: f.nombre,
  }))
  return [...fijos, ...moviles].sort((a, b) => a.fecha.localeCompare(b.fecha))
}

export const feriadosEnPeriodo = (
  fechaInicio: string,
  fechaFin: string,
): FeriadoCostaRica[] => {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)
  ) {
    return []
  }
  if (fechaFin < fechaInicio) return []

  const anioInicio = Number(fechaInicio.slice(0, 4))
  const anioFin = Number(fechaFin.slice(0, 4))
  const out: FeriadoCostaRica[] = []
  for (let anio = anioInicio; anio <= anioFin; anio += 1) {
    for (const feriado of feriadosDelAnio(anio)) {
      if (feriado.fecha >= fechaInicio && feriado.fecha <= fechaFin) {
        out.push(feriado)
      }
    }
  }
  return out
}

export type ResumenDiasVacaciones = {
  diasCalendario: number
  feriados: FeriadoCostaRica[]
  diasNetos: number
}

export const resumenDiasVacaciones = (
  fechaInicio: string,
  fechaFin: string,
): ResumenDiasVacaciones => {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin) ||
    fechaFin < fechaInicio
  ) {
    return { diasCalendario: 0, feriados: [], diasNetos: 0 }
  }
  const [y1, m1, d1] = fechaInicio.split('-').map(Number)
  const [y2, m2, d2] = fechaFin.split('-').map(Number)
  const diasCalendario =
    Math.floor(
      (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000,
    ) + 1
  const feriados = feriadosEnPeriodo(fechaInicio, fechaFin)
  return {
    diasCalendario,
    feriados,
    diasNetos: Math.max(0, diasCalendario - feriados.length),
  }
}
