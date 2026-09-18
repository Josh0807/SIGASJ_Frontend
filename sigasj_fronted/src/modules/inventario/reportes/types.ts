import type { MovimientoInventario, TipoMovimientoInventario } from '../movimientos/types'

export type ReporteInventarioIndicadores = {
  totalMateriales: number
  materialesActivos: number
  materialesStockBajo: number
  entradasRegistradas: number
  salidasRegistradas: number
}

export type ReporteInventarioPorCategoria = {
  idCategoria: number | null
  nombre: string
  totalMateriales: number
  materialesStockBajo: number
}

export type ReporteInventarioMaterial = {
  id: number
  nombre: string
  unidadMedida: string
  stockActual: number
  stockMinimo: number
  activo: boolean
  categoria?: { id: number; nombre: string | null } | null
}

export type ReporteInventarioResponse = {
  indicadores: ReporteInventarioIndicadores
  porCategoria: ReporteInventarioPorCategoria[]
  materiales: ReporteInventarioMaterial[]
  movimientos: MovimientoInventario[]
}

export type ReporteInventarioFilters = {
  fechaDesde?: string
  fechaHasta?: string
  idMaterial?: number
  idCategoria?: number
  tipo?: TipoMovimientoInventario
}

export const EMPTY_REPORTE_INVENTARIO: ReporteInventarioResponse = {
  indicadores: {
    totalMateriales: 0,
    materialesActivos: 0,
    materialesStockBajo: 0,
    entradasRegistradas: 0,
    salidasRegistradas: 0,
  },
  porCategoria: [],
  materiales: [],
  movimientos: [],
}
