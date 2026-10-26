import { fetchRawWithAuth, fetchWithAuth } from '../../services/http/httpClient'
import type {
  CorrelacionAusencia,
  DocumentoSolicitudAusencia,
  EstadoSolicitudAusencia,
  SolicitudAusencia,
  SolicitudAusenciaFontanero,
  SolicitudesAusenciaListado,
  TipoSolicitudAusencia,
} from './types'

const ENDPOINT = '/rrhh/solicitudes-ausencia'
/** PBI 6.5.3 — consulta propia; el Backend resuelve Colaborador vía JWT. */
const FONTANERO_ENDPOINT = '/fontanero/solicitudes-ausencia'

const RUTA_DOC_FONTANERO =
  /^\/api\/v1\/fontanero\/solicitudes-ausencia\/\d+\/documentos\/[A-Za-z0-9._-]+$/
const RUTA_DOC_ADMIN =
  /^\/api\/v1\/rrhh\/solicitudes-ausencia\/\d+\/documentos\/[A-Za-z0-9._-]+$/
const RUTA_DOC_UPLOADS =
  /^\/uploads\/solicitudes-ausencia\/(\d+)\/([A-Za-z0-9._-]+)$/

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
  documentos?: File[]
}) => {
  const documentos = payload.documentos ?? []
  if (documentos.length > 0) {
    const body = new FormData()
    body.append('tipo', payload.tipo)
    body.append('fechaInicio', payload.fechaInicio)
    body.append('fechaFin', payload.fechaFin)
    body.append('correo', payload.correo.trim().toLowerCase())
    if (payload.motivo?.trim()) {
      body.append('motivo', payload.motivo.trim())
    }
    for (const file of documentos) {
      body.append('documentos', file)
    }
    return fetchWithAuth<SolicitudAusenciaFontanero>(FONTANERO_ENDPOINT, {
      method: 'POST',
      body,
    })
  }
  return fetchWithAuth<SolicitudAusenciaFontanero>(FONTANERO_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      tipo: payload.tipo,
      fechaInicio: payload.fechaInicio,
      fechaFin: payload.fechaFin,
      correo: payload.correo.trim().toLowerCase(),
      motivo: payload.tipo === 'VACACIONES' ? null : payload.motivo?.trim() || null,
    }),
  })
}

/** Adjunta evidencia (PDF/JPG/PNG) a una solicitud propia pendiente. */
export const adjuntarEvidenciaMiSolicitudAusencia = (
  solicitudId: number,
  file: File,
) => {
  const body = new FormData()
  body.append('archivo', file)
  return fetchWithAuth<DocumentoSolicitudAusencia>(
    `${FONTANERO_ENDPOINT}/${solicitudId}/documentos`,
    { method: 'POST', body },
  )
}

/**
 * Abre evidencia con JWT. Las rutas guardadas apuntan a Fontanero;
 * en vista admin se reescriben a `/rrhh/...`.
 */
export async function abrirEvidenciaSolicitudAusencia(
  rutaReferenciaArchivo: string,
  vista: 'fontanero' | 'admin' = 'fontanero',
) {
  let ruta = rutaReferenciaArchivo
  const uploads = ruta.match(RUTA_DOC_UPLOADS)
  if (uploads) {
    const [, solicitudId, filename] = uploads
    ruta =
      vista === 'admin'
        ? `/api/v1/rrhh/solicitudes-ausencia/${solicitudId}/documentos/${filename}`
        : `/api/v1/fontanero/solicitudes-ausencia/${solicitudId}/documentos/${filename}`
  }
  if (vista === 'admin' && RUTA_DOC_FONTANERO.test(ruta)) {
    ruta = ruta.replace(
      '/api/v1/fontanero/solicitudes-ausencia/',
      '/api/v1/rrhh/solicitudes-ausencia/',
    )
  }
  if (
    (!RUTA_DOC_FONTANERO.test(ruta) && !RUTA_DOC_ADMIN.test(ruta)) ||
    ruta.includes('..')
  ) {
    throw new Error('La referencia del documento no es válida.')
  }
  const endpoint = ruta.replace(/^\/api\/v1/, '')
  const response = await fetchRawWithAuth(endpoint)
  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: No fue posible abrir la evidencia.`,
    )
  }
  const blobUrl = URL.createObjectURL(await response.blob())
  window.open(blobUrl, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 300_000)
}

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
