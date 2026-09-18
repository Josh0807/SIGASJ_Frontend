import { getHttpErrorStatus } from '../solicitudes-materiales/solicitudMaterialesUtils'
import type { MovimientoInventario, MovimientosListResponse } from './types'

export { getHttpErrorStatus }

export const normalizeMovimientosList = (
  response: MovimientosListResponse | MovimientoInventario[],
) => (Array.isArray(response) ? response : response.data ?? [])

export const formatMovimientoFecha = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export const formatMovimientoTipo = (tipo?: string | null) => {
  if (tipo === 'ENTRADA') return 'Entrada'
  if (tipo === 'SALIDA') return 'Salida'
  return tipo ?? '—'
}

export const formatMovimientoCantidad = (movimiento: MovimientoInventario) => {
  const unidad = movimiento.material?.unidadMedida?.trim()
  const cantidad = movimiento.cantidad
  if (!unidad) return String(cantidad)
  return `${cantidad} ${unidad}`
}

export const getMovimientoMaterialNombre = (movimiento: MovimientoInventario) =>
  movimiento.material?.nombre?.trim() || `Material #${movimiento.idMaterial}`

export const getMovimientoResponsable = (movimiento: MovimientoInventario) =>
  movimiento.usuario?.nombre?.trim() || `Usuario #${movimiento.idUsuario}`

export const getMovimientoReferencia = (movimiento: MovimientoInventario) => {
  if (movimiento.referencia?.trim()) {
    return movimiento.referencia.trim()
  }
  if (movimiento.averia?.codigo?.trim()) {
    return movimiento.averia.codigo.trim()
  }
  if (movimiento.reposicion?.codigo?.trim()) {
    return movimiento.reposicion.codigo.trim()
  }
  if (movimiento.solicitudMaterial?.codigo?.trim()) {
    return movimiento.solicitudMaterial.codigo.trim()
  }
  return 'Sin referencia'
}

export const movimientoErrorMessage = (error: unknown) => {
  const status = getHttpErrorStatus(error)
  if (status === 403) {
    return 'No tiene permiso para consultar el historial de movimientos.'
  }
  if (status === 404) {
    return 'El movimiento indicado no existe en el sistema.'
  }
  if (status === 400) {
    return 'Los filtros de consulta no son válidos. Revise las fechas e inténtelo de nuevo.'
  }
  return 'No fue posible consultar el historial. Compruebe su conexión e inténtelo de nuevo.'
}
