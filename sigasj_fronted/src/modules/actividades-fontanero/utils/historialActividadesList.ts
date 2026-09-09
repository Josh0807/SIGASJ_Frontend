import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import {
  normalizeHistorialFilters,
  type HistorialActividadesFilters,
} from '../types/actividadHistorial'

export type HistorialListadoApi = {
  data: ActividadFontaneroRegistrada[]
  total: number
}

/**
 * El Back-end ya filtra y pagina. Deriva totalPages y ajusta page si supera el rango.
 */
export const deriveHistorialPagination = (
  result: HistorialListadoApi,
  filters: HistorialActividadesFilters = {},
) => {
  const normalized = normalizeHistorialFilters(filters)
  const total = typeof result.total === 'number' ? result.total : 0
  const totalPages = Math.max(1, Math.ceil(total / normalized.limit))
  const page = Math.min(normalized.page, totalPages)

  return {
    actividades: Array.isArray(result.data) ? result.data : [],
    total,
    page,
    totalPages,
    limit: normalized.limit,
  }
}

/** @deprecated Usar deriveHistorialPagination */
export const resolveHistorialListado = deriveHistorialPagination
