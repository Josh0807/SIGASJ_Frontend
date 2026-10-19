import { fetchWithAuth } from '../../services/http/httpClient'
import type {
  NotificacionAveriaItem,
  NotificacionesAveriaListado,
} from './types'

/** Ruta relativa al prefijo `api/v1`. */
export const NOTIFICACIONES_ENDPOINT = '/notificaciones'

const emptyListado = (): NotificacionesAveriaListado => ({
  data: [],
  noLeidas: 0,
})

const isNullableId = (value: unknown): value is number | null =>
  value === null || (typeof value === 'number' && Number.isInteger(value))

const normalizeItem = (value: unknown): NotificacionAveriaItem | null => {
  if (!value || typeof value !== 'object') {
    return null
  }
  const row = value as Partial<NotificacionAveriaItem>
  if (
    typeof row.id !== 'number' ||
    typeof row.titulo !== 'string' ||
    typeof row.mensaje !== 'string' ||
    typeof row.leida !== 'boolean'
  ) {
    return null
  }

  const idAveria = isNullableId(row.idAveria) ? row.idAveria : null
  const idSolicitudAusencia = isNullableId(row.idSolicitudAusencia)
    ? row.idSolicitudAusencia
    : null

  // Exactamente una referencia válida (o ítem legado solo con idAveria).
  const hasAveria = idAveria != null && idAveria > 0
  const hasSolicitud = idSolicitudAusencia != null && idSolicitudAusencia > 0
  if (!hasAveria && !hasSolicitud) {
    return null
  }
  if (hasAveria && hasSolicitud) {
    return null
  }

  return {
    id: row.id,
    idAveria: hasAveria ? idAveria : null,
    idSolicitudAusencia: hasSolicitud ? idSolicitudAusencia : null,
    tipo: typeof row.tipo === 'string' ? row.tipo : '',
    titulo: row.titulo,
    mensaje: row.mensaje,
    leida: row.leida,
    fechaCreacion:
      typeof row.fechaCreacion === 'string' ? row.fechaCreacion : '',
    fechaLectura:
      row.fechaLectura === null || typeof row.fechaLectura === 'string'
        ? row.fechaLectura
        : null,
  }
}

export const parseNotificacionesListado = (
  payload: unknown,
): NotificacionesAveriaListado => {
  if (!payload || typeof payload !== 'object') {
    return emptyListado()
  }
  const raw = payload as { data?: unknown; noLeidas?: unknown }
  if (!Array.isArray(raw.data)) {
    return emptyListado()
  }
  const data = raw.data
    .map(normalizeItem)
    .filter((item): item is NotificacionAveriaItem => item != null)
  const noLeidas =
    typeof raw.noLeidas === 'number'
      ? raw.noLeidas
      : data.filter((item) => !item.leida).length
  return { data, noLeidas }
}

export async function getNotificacionesPropias(
  signal?: AbortSignal,
): Promise<NotificacionesAveriaListado> {
  const payload = await fetchWithAuth<unknown>(NOTIFICACIONES_ENDPOINT, {
    signal,
  })
  return parseNotificacionesListado(payload)
}

export async function marcarNotificacionLeida(
  id: number,
  signal?: AbortSignal,
): Promise<NotificacionAveriaItem> {
  return fetchWithAuth<NotificacionAveriaItem>(
    `${NOTIFICACIONES_ENDPOINT}/${id}/lectura`,
    {
      method: 'PATCH',
      signal,
    },
  )
}
