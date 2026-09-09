export type HistorialActividadesFilters = {
  fechaInicio?: string
  fechaFin?: string
  page?: number
  limit?: number
}

export const HISTORIAL_PAGE_SIZE = 10

export const HISTORIAL_ESTADOS = ['APROBADA', 'RECHAZADA', 'CORREGIDA'] as const

export type HistorialEstado = (typeof HISTORIAL_ESTADOS)[number]

export const isHistorialEstado = (estado: string): estado is HistorialEstado =>
  (HISTORIAL_ESTADOS as readonly string[]).includes(estado)

export const normalizeHistorialFilters = (
  filters: HistorialActividadesFilters = {},
): Required<Pick<HistorialActividadesFilters, 'page' | 'limit'>> &
  HistorialActividadesFilters => ({
  ...filters,
  page: filters.page && filters.page > 0 ? filters.page : 1,
  limit:
    filters.limit && filters.limit > 0 ? filters.limit : HISTORIAL_PAGE_SIZE,
})

export const hasHistorialPeriodFilter = (
  filters: HistorialActividadesFilters,
): boolean => Boolean(filters.fechaInicio?.trim() || filters.fechaFin?.trim())

export const historialFiltersKey = (
  filters: HistorialActividadesFilters,
): string => {
  const normalized = normalizeHistorialFilters(filters)
  return `${normalized.fechaInicio ?? ''}|${normalized.fechaFin ?? ''}|${normalized.page}|${normalized.limit}`
}
