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

export const puedeRegistrarCompra = (estado: string) => {
  const normalized = estado.trim().toUpperCase().replace(/\s+/g, '_')
  return normalized === 'PENDIENTE' || normalized === 'EN_GESTION'
}

export const reposicionErrorMessage = (
  error: unknown,
  accion: 'consultar' | 'detalle' = 'consultar',
) => {
  const status = getHttpErrorStatus(error)
  if (status === 403) {
    return accion === 'detalle'
      ? 'No tiene permiso para consultar esta reposición.'
      : 'No tiene permiso para consultar las reposiciones.'
  }
  if (status === 401) return 'Su sesión expiró. Inicie sesión de nuevo.'
  if (status === 404) return 'La reposición ya no está disponible.'
  return accion === 'detalle'
    ? 'No fue posible cargar el detalle de la reposición.'
    : 'No fue posible cargar las reposiciones de materiales.'
}

export { getHttpErrorStatus }
