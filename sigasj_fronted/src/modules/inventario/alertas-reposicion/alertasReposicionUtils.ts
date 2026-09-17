import { formatSolicitudDate, getHttpErrorStatus } from '../solicitudes-materiales/solicitudMaterialesUtils'
import type { AlertaReposicion, AlertasReposicionListResponse, EstadoAlertaReposicion } from './types'

export const ESTADO_ALERTA_LABELS: Record<EstadoAlertaReposicion, string> = {
  PENDIENTE: 'Pendiente',
  EN_GESTION: 'En gestión',
  RESUELTA: 'Resuelta',
}

export const normalizeAlertasReposicionList = (
  response: AlertasReposicionListResponse,
): AlertaReposicion[] => (Array.isArray(response) ? response : response.data ?? [])

export const getAlertaMaterialNombre = (alerta: AlertaReposicion) =>
  alerta.material?.nombre?.trim() || `Material #${alerta.idMaterial}`

export const getAlertaUnidadMedida = (alerta: AlertaReposicion) =>
  alerta.material?.unidadMedida?.trim() || '—'

export const getAlertaResponsable = (alerta: AlertaReposicion) => {
  const nombre = alerta.usuarioGestiona?.nombre?.trim()
  if (nombre) return nombre
  return alerta.idUsuarioGestiona ? `Usuario #${alerta.idUsuarioGestiona}` : '—'
}

export const formatAlertaFecha = (value: string) => formatSolicitudDate(value)

export const formatAlertaEstado = (estado: string) => {
  const normalized = estado.trim().toUpperCase().replace(/\s+/g, '_') as EstadoAlertaReposicion
  return ESTADO_ALERTA_LABELS[normalized] ?? estado
}

export const siguienteEstadoAlerta = (
  estado: string,
): EstadoAlertaReposicion | null => {
  const normalized = estado.trim().toUpperCase().replace(/\s+/g, '_')
  if (normalized === 'PENDIENTE') return 'EN_GESTION'
  if (normalized === 'EN_GESTION') return 'RESUELTA'
  return null
}

export const etiquetaAccionAlerta = (estado: string) => {
  const siguiente = siguienteEstadoAlerta(estado)
  if (siguiente === 'EN_GESTION') return 'Poner en gestión'
  if (siguiente === 'RESUELTA') return 'Marcar resuelta'
  return null
}

export const puedeGenerarReposicionDesdeAlerta = (estado: string) => {
  const normalized = estado.trim().toUpperCase().replace(/\s+/g, '_')
  return normalized === 'PENDIENTE' || normalized === 'EN_GESTION'
}

export const alertaReposicionErrorMessage = (
  error: unknown,
  accion: 'consultar' | 'actualizar' | 'generar' = 'consultar',
) => {
  const status = getHttpErrorStatus(error)
  if (status === 403) {
    return accion === 'actualizar'
      ? 'No tiene permiso para gestionar las alertas de reposición.'
      : 'No tiene permiso para consultar las alertas de reposición.'
  }
  if (status === 401) return 'Su sesión expiró. Inicie sesión de nuevo.'
  if (status === 404) return 'La alerta de reposición ya no está disponible.'
  if (status === 409) return 'Ya existe una reposición activa para esta alerta.'
  if (status === 400) {
    return accion === 'generar'
      ? 'No fue posible generar la reposición desde esta alerta.'
      : 'No fue posible actualizar el estado de la alerta. Revise la transición indicada.'
  }
  if (accion === 'generar') return 'No fue posible generar la reposición desde la alerta.'
  return accion === 'actualizar'
    ? 'No fue posible actualizar el estado de la alerta.'
    : 'No fue posible cargar las alertas de reposición.'
}

export { getHttpErrorStatus }
