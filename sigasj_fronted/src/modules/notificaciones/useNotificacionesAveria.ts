import { useCallback, useEffect, useState } from 'react'
import { getAccessToken } from '../auth/utils/authStorage'
import {
  getNotificacionesPropias,
  marcarNotificacionLeida,
} from './notificacionesApi'
import type { NotificacionesAveriaListado } from './types'

export type NotificacionesAveriaState = {
  listado: NotificacionesAveriaListado
  loading: boolean
  error: string | null
  recargar: () => Promise<void>
  marcarLeida: (id: number) => Promise<void>
}

const empty: NotificacionesAveriaListado = { data: [], noLeidas: 0 }

export function useNotificacionesAveria(): NotificacionesAveriaState {
  const [listado, setListado] = useState<NotificacionesAveriaListado>(empty)
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()?.trim()))
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    if (!getAccessToken()?.trim()) {
      setListado(empty)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    try {
      const next = await getNotificacionesPropias()
      setListado(next)
      setError(null)
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'No se pudieron cargar las notificaciones.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!getAccessToken()?.trim()) {
      return undefined
    }

    let cancelled = false
    void getNotificacionesPropias()
      .then((next) => {
        if (!cancelled) {
          setListado(next)
          setError(null)
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : 'No se pudieron cargar las notificaciones.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const marcarLeida = useCallback(
    async (id: number) => {
      await marcarNotificacionLeida(id)
      await recargar()
    },
    [recargar],
  )

  return { listado, loading, error, recargar, marcarLeida }
}
