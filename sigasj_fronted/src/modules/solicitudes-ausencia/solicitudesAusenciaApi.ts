import { fetchWithAuth } from '../../services/http/httpClient'
import type {
  CorrelacionAusencia,
  EstadoSolicitudAusencia,
  SolicitudAusencia,
  SolicitudAusenciaFontanero,
  SolicitudesAusenciaListado,
  TipoSolicitudAusencia,
} from './types'

const ENDPOINT = '/rrhh/solicitudes-ausencia'
/** PBI 6.5.3 — consulta propia; el Backend resuelve Colaborador vía JWT. */
const FONTANERO_ENDPOINT = '/fontanero/solicitudes-ausencia'

export const emitirCorrelacionAusencia = () =>
  fetchWithAuth<CorrelacionAusencia>(`${ENDPOINT}/correlacion`, {
    method: 'POST',
  })

/** Listado propio del Fontanero. No envía colaboradorId. */
export const getMisSolicitudesAusencia = (signal?: AbortSignal) =>
  fetchWithAuth<SolicitudAusenciaFontanero[]>(FONTANERO_ENDPOINT, { signal })

/** Detalle propio del Fontanero. */
export const getMiSolicitudAusencia = (id: number, signal?: AbortSignal) =>
  fetchWithAuth<SolicitudAusenciaFontanero>(`${FONTANERO_ENDPOINT}/${id}`, {
    signal,
  })

/** Alta nativa Fontanero → PENDIENTE (sin colaboradorId del cliente). */
export const crearMiSolicitudAusencia = (payload: {
  tipo: TipoSolicitudAusencia
  fechaInicio: string
  fechaFin: string
  correo: string
  motivo?: string | null
}) =>
  fetchWithAuth<SolicitudAusenciaFontanero>(FONTANERO_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      tipo: payload.tipo,
      fechaInicio: payload.fechaInicio,
      fechaFin: payload.fechaFin,
      correo: payload.correo.trim().toLowerCase(),
      motivo: payload.motivo?.trim() || null,
    }),
  })

export const getSolicitudesAusencia = (filtros: {
  estado?: EstadoSolicitudAusencia | ''
  tipo?: TipoSolicitudAusencia | ''
  colaboradorId?: string
  page: number
}, signal?: AbortSignal) =>
  fetchWithAuth<SolicitudesAusenciaListado>(ENDPOINT, {
    params: {
      estado: filtros.estado || undefined,
      tipo: filtros.tipo || undefined,
      colaboradorId: filtros.colaboradorId?.trim() || undefined,
      page: filtros.page,
      limit: 10,
    },
    signal,
  })

export const getSolicitudAusencia = (id: number, signal?: AbortSignal) =>
  fetchWithAuth<SolicitudAusencia>(`${ENDPOINT}/${id}`, { signal })

export const aprobarSolicitudAusencia = (id: number) =>
  fetchWithAuth<SolicitudAusencia>(`${ENDPOINT}/${id}/aprobar`, {
    method: 'PATCH',
  })

export const rechazarSolicitudAusencia = (id: number, motivoRechazo?: string) =>
  fetchWithAuth<SolicitudAusencia>(`${ENDPOINT}/${id}/rechazar`, {
    method: 'PATCH',
    body: JSON.stringify({
      motivoRechazo: motivoRechazo?.trim() || null,
    }),
  })
