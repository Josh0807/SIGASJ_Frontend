/** Contrato alineado con GET .../actividades/resumen */

export type ResumenActividadesFilters = {
  fechaInicio?: string
  fechaFin?: string
}

export type ResumenActividadesResponse = {
  total: number
  porEstado: Record<string, number>
}

export const EMPTY_RESUMEN_ACTIVIDADES: ResumenActividadesResponse = {
  total: 0,
  porEstado: {},
}
