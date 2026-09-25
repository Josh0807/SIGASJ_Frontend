import type { AveriasReporteResumen } from './types'

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export type AveriasReporteIndicador = {
  id: string
  titulo: string
  cantidad: number
}

const ESTADOS_REPORTE = [
  { id: 'RECIBIDA', titulo: 'Recibidas' },
  { id: 'ASIGNADA', titulo: 'Asignadas' },
  { id: 'PENDIENTE', titulo: 'Pendientes de atención' },
  { id: 'EN_ATENCION', titulo: 'En atención' },
  { id: 'RESUELTA', titulo: 'Resueltas' },
] as const

const ESTADOS_EXTRA = [
  { id: 'EN_REVISION', titulo: 'En revisión' },
  { id: 'CANCELADA', titulo: 'Canceladas' },
] as const

export function parseReporteFechas(search: string): {
  fechaDesde: string
  fechaHasta: string
} {
  const raw = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(raw)
  const iso = (value: string | null) =>
    value && ISO_DATE_ONLY.test(value) ? value : ''
  return {
    fechaDesde: iso(params.get('fechaDesde')),
    fechaHasta: iso(params.get('fechaHasta')),
  }
}

export function buildReporteFechas(fechas: {
  fechaDesde: string
  fechaHasta: string
}): string {
  const params = new URLSearchParams()
  if (ISO_DATE_ONLY.test(fechas.fechaDesde)) {
    params.set('fechaDesde', fechas.fechaDesde)
  }
  if (ISO_DATE_ONLY.test(fechas.fechaHasta)) {
    params.set('fechaHasta', fechas.fechaHasta)
  }
  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export function reporteRangoInvalido(fechaDesde: string, fechaHasta: string): boolean {
  return Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta)
}

export function formatFechaReporte(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export function formatRangoReporte(
  fechaDesde: string | null,
  fechaHasta: string | null,
): string {
  if (fechaDesde && fechaHasta) {
    return `${formatFechaReporte(fechaDesde)} - ${formatFechaReporte(fechaHasta)}`
  }
  if (fechaDesde) {
    return `Desde ${formatFechaReporte(fechaDesde)}`
  }
  if (fechaHasta) {
    return `Hasta ${formatFechaReporte(fechaHasta)}`
  }
  return 'Todas las fechas'
}

export function indicadoresReporte(
  resumen: AveriasReporteResumen,
): AveriasReporteIndicador[] {
  const porEstado = resumen.porEstado
  const indicadores: AveriasReporteIndicador[] = [
    { id: 'total', titulo: 'Total registradas', cantidad: resumen.total },
    ...ESTADOS_REPORTE.map((estado) => ({
      id: estado.id,
      titulo: estado.titulo,
      cantidad: porEstado[estado.id] ?? 0,
    })),
  ]

  for (const estado of ESTADOS_EXTRA) {
    const cantidad = porEstado[estado.id] ?? 0
    if (cantidad > 0) {
      indicadores.push({ id: estado.id, titulo: estado.titulo, cantidad })
    }
  }

  if (resumen.otros > 0) {
    indicadores.push({
      id: 'otros',
      titulo: 'Otros estados',
      cantidad: resumen.otros,
    })
  }

  return indicadores
}

export function sumaEstadosReporte(resumen: AveriasReporteResumen): number {
  return (
    Object.values(resumen.porEstado).reduce((sum, value) => sum + value, 0) +
    resumen.otros
  )
}
