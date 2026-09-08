/** Contrato alineado con GET /api/v1/admin/actividades/reportes */

export type ReporteActividadesFilters = {
  fechaInicio?: string
  fechaFin?: string
  fontaneroId?: string
  tipoActividadId?: number
}

export type ReporteActividadPorTipo = {
  tipoActividadId: number | null
  tipoActividadNombre: string
  cantidad: number
}

export type ReporteActividadPorFontanero = {
  fontaneroId: string
  cantidad: number
}

export type ReporteActividadDetalle = {
  id: number
  fechaActividad: string | null
  estado: string
  tipoActividadId: number | null
  tipoActividadNombre: string
  fontaneroId: string
}

export type ReporteActividadesResponse = {
  total: number
  porEstado: Record<string, number>
  porTipo: ReporteActividadPorTipo[]
  porFontanero: ReporteActividadPorFontanero[]
  actividades: ReporteActividadDetalle[]
}

export const EMPTY_REPORTE_ACTIVIDADES: ReporteActividadesResponse = {
  total: 0,
  porEstado: {},
  porTipo: [],
  porFontanero: [],
  actividades: [],
}
