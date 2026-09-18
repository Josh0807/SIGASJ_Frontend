import { fetchWithAuth } from '../../../services/http/httpClient'
import type { ReporteInventarioFilters, ReporteInventarioResponse } from './types'

const REPORTES_ADMIN_PATH = '/admin/inventario/reportes/resumen'

export const getReporteInventarioAdmin = (filters: ReporteInventarioFilters = {}) =>
  fetchWithAuth<ReporteInventarioResponse>(REPORTES_ADMIN_PATH, {
    params: {
      ...(filters.fechaDesde ? { fechaDesde: filters.fechaDesde } : {}),
      ...(filters.fechaHasta ? { fechaHasta: filters.fechaHasta } : {}),
      ...(filters.idMaterial ? { idMaterial: filters.idMaterial } : {}),
      ...(filters.idCategoria ? { idCategoria: filters.idCategoria } : {}),
      ...(filters.tipo ? { tipo: filters.tipo } : {}),
    },
  })
