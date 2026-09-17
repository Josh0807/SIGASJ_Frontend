import { formatSolicitudDate, getHttpErrorStatus } from '../solicitudes-materiales/solicitudMaterialesUtils'
import type {
  ReposicionDetalle,
  ReposicionMaterial,
  ReposicionesListResponse,
  EstadoReposicion,
  OrigenReposicion,
} from './types'

export const ESTADO_REPOSICION_LABELS: Record<EstadoReposicion, string> = {
  PENDIENTE: 'Pendiente',
  EN_GESTION: 'En gestión',
  COMPRA_REGISTRADA: 'Compra registrada',
  PENDIENTE_RECEPCION: 'Pendiente de recepción',
  RECIBIDA: 'Recibida',
  COMPLETADA: 'Completada',
}

export const ORIGEN_REPOSICION_LABELS: Record<OrigenReposicion, string> = {
  ALERTA_STOCK_MINIMO: 'Stock mínimo',
  SOLICITUD_APROBADA: 'Solicitud aprobada',
  ADMINISTRATIVA: 'Administrativa',
}

export const normalizeReposicionesList = (
  response: ReposicionesListResponse,
): ReposicionMaterial[] => (Array.isArray(response) ? response : response.data ?? [])

export const formatReposicionFecha = (value: string | null | undefined) =>
  value ? formatSolicitudDate(value) : '—'

export const formatReposicionEstado = (estado: string) => {
  const normalized = estado.trim().toUpperCase().replace(/\s+/g, '_') as EstadoReposicion
  return ESTADO_REPOSICION_LABELS[normalized] ?? estado
}

export const formatReposicionOrigen = (origen: string) => {
  const normalized = origen.trim().toUpperCase().replace(/\s+/g, '_') as OrigenReposicion
  return ORIGEN_REPOSICION_LABELS[normalized] ?? origen
}

export const getReposicionCodigo = (reposicion: ReposicionMaterial) =>
  reposicion.codigo?.trim() || `REP-${reposicion.id}`

export const getReposicionResponsable = (reposicion: ReposicionMaterial) => {
  const nombre = reposicion.usuarioResponsable?.nombre?.trim()
  if (nombre) return nombre
  return reposicion.idUsuarioResponsable
    ? `Usuario #${reposicion.idUsuarioResponsable}`
    : '—'
}

export const resumenMaterialesReposicion = (detalles: ReposicionDetalle[]) => {
  if (!detalles.length) return '—'
  return detalles
    .map((detalle) => {
      const nombre = detalle.material?.nombre?.trim() || `Material #${detalle.idMaterial}`
      return `${nombre} (${detalle.cantidad})`
    })
    .join(', ')
}

export const normalizeReposicionEstado = (estado: string) =>
  estado.trim().toUpperCase().replace(/\s+/g, '_')

export const puedeRegistrarCompra = (estado: string) => {
  const normalized = normalizeReposicionEstado(estado)
  return normalized === 'PENDIENTE' || normalized === 'EN_GESTION'
}

export const puedeConfirmarRecepcion = (estado: string) =>
  normalizeReposicionEstado(estado) === 'PENDIENTE_RECEPCION'

export const siguienteEstadoReposicion = (
  estado: string,
): EstadoReposicion | null => {
  const normalized = normalizeReposicionEstado(estado)
  if (normalized === 'PENDIENTE') return 'EN_GESTION'
  if (normalized === 'RECIBIDA') return 'COMPLETADA'
  return null
}

export const etiquetaAccionReposicion = (estado: string) => {
  const siguiente = siguienteEstadoReposicion(estado)
  if (siguiente === 'EN_GESTION') return 'Poner en gestión'
  if (siguiente === 'COMPLETADA') return 'Completar reposición'
  return null
}

export const getReposicionProveedorNombre = (reposicion: ReposicionMaterial) =>
  reposicion.proveedor?.nombre?.trim() || 'Sin definir'

export const toIsoFechaCompra = (fecha: string) => {
  const parsed = new Date(`${fecha}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Fecha de compra inválida')
  }
  return parsed.toISOString()
}

export const reposicionErrorMessage = (
  error: unknown,
  accion: 'consultar' | 'detalle' | 'compra' | 'estado' | 'recepcion' = 'consultar',
) => {
  const status = getHttpErrorStatus(error)
  if (status === 403) {
    return accion === 'detalle'
      ? 'No tiene permiso para consultar esta reposición.'
      : 'No tiene permiso para consultar las reposiciones.'
  }
  if (status === 401) return 'Su sesión expiró. Inicie sesión de nuevo.'
  if (status === 404) return 'La reposición ya no está disponible.'
  if (status === 409) return 'Esta reposición ya tiene una compra registrada.'
  if (status === 400) {
    if (accion === 'compra') return 'No fue posible registrar la compra. Revise proveedor, fecha y cantidades.'
    if (accion === 'estado' || accion === 'recepcion') {
      return 'No fue posible actualizar el estado de la reposición.'
    }
  }
  if (accion === 'compra') return 'No fue posible registrar la compra de la reposición.'
  if (accion === 'estado' || accion === 'recepcion') {
    return 'No fue posible actualizar el estado de la reposición.'
  }
  return accion === 'detalle'
    ? 'No fue posible cargar el detalle de la reposición.'
    : 'No fue posible cargar las reposiciones de materiales.'
}

export { getHttpErrorStatus }
