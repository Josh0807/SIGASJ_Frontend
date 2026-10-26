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
  const idSolicitudMateriales = isNullableId(row.idSolicitudMateriales)
    ? row.idSolicitudMateriales
    : null
  const idSalidaInventario = isNullableId(row.idSalidaInventario)
    ? row.idSalidaInventario
    : null
  const idReposicion = isNullableId(row.idReposicion) ? row.idReposicion : null
  const idActividad = isNullableId(row.idActividad) ? row.idActividad : null

  // Exactamente una referencia válida (o ítem legado solo con idAveria).
  const hasAveria = idAveria != null && idAveria > 0
  const hasSolicitud = idSolicitudAusencia != null && idSolicitudAusencia > 0
  const hasSolicitudMateriales =
    idSolicitudMateriales != null && idSolicitudMateriales > 0
  const hasSalidaInventario = idSalidaInventario != null && idSalidaInventario > 0
  const hasReposicion = idReposicion != null && idReposicion > 0
  const hasActividad = idActividad != null && idActividad > 0
  const referenceCount = [
    hasAveria,
    hasSolicitud,
    hasSolicitudMateriales,
    hasSalidaInventario,
    hasReposicion,
    hasActividad,
  ].filter(Boolean).length
  if (referenceCount === 0) {
    return null
  }
  if (referenceCount > 1) {
    return null
  }

  return {
    id: row.id,
    idAveria: hasAveria ? idAveria : null,
    idSolicitudAusencia: hasSolicitud ? idSolicitudAusencia : null,
    idSolicitudMateriales: hasSolicitudMateriales
      ? idSolicitudMateriales
      : null,
    idSalidaInventario: hasSalidaInventario ? idSalidaInventario : null,
    idReposicion: hasReposicion ? idReposicion : null,
    idActividad: hasActividad ? idActividad : null,
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
