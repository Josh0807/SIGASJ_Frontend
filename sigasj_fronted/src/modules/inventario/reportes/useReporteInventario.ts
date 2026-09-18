import { useEffect, useRef, useState } from 'react'
import { getHttpErrorStatus } from '../solicitudes-materiales/solicitudMaterialesUtils'
import { getReporteInventarioAdmin } from './reportesApi'
import {
  EMPTY_REPORTE_INVENTARIO,
  type ReporteInventarioFilters,
  type ReporteInventarioResponse,
} from './types'

export const useReporteInventario = (filters: ReporteInventarioFilters) => {
  const [reporte, setReporte] = useState<ReporteInventarioResponse>(EMPTY_REPORTE_INVENTARIO)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const requestIdRef = useRef(0)

  const { fechaDesde, fechaHasta, idMaterial, idCategoria, tipo } = filters

  useEffect(() => {
    const requestId = ++requestIdRef.current
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await getReporteInventarioAdmin({
          fechaDesde,
          fechaHasta,
          idMaterial,
          idCategoria,
          tipo,
        })
        if (cancelled || requestId !== requestIdRef.current) return
        setReporte(result)
      } catch (requestError) {
        if (cancelled || requestId !== requestIdRef.current) return
        const status = getHttpErrorStatus(requestError)
        if (status === 403) {
          setError('No tiene permiso para consultar los reportes de inventario.')
        } else if (status === 400) {
          setError('Los filtros del reporte no son válidos. Revise las fechas e inténtelo de nuevo.')
        } else {
          setError('No fue posible cargar el reporte de inventario. Intente nuevamente.')
        }
        setReporte(EMPTY_REPORTE_INVENTARIO)
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [fechaDesde, fechaHasta, idMaterial, idCategoria, tipo, reloadKey])

  return {
    reporte,
    loading,
    error,
    refetch: () => setReloadKey((value) => value + 1),
  }
}
