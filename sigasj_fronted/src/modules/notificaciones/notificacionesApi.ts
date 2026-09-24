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

const isItem = (value: unknown): value is NotificacionAveriaItem => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const row = value as Partial<NotificacionAveriaItem>
  return (
    typeof row.id === 'number' &&
    typeof row.idAveria === 'number' &&
    typeof row.titulo === 'string' &&
    typeof row.mensaje === 'string' &&
    typeof row.leida === 'boolean'
  )
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
  const data = raw.data.filter(isItem)
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
