import { useCallback, useEffect, useRef, useState } from 'react'
import {
  parseProyectoSubmitError,
  type ProyectoSubmitError,
} from '../admin/proyectoSubmitError'
import type { AdminProyectoDetalle } from '../admin/types'
import { getAdminProyecto, parseAdminProyectoId } from '../services/proyectosApi'
import { subscribeAdminProyectosQueries } from './proyectosAdminQuery'

export type UseAdminProyectoResult = {
  proyecto: AdminProyectoDetalle | null
  loading: boolean
  error: string | null
  missing: boolean
  unauthorized: boolean
  forbidden: boolean
  refetch: () => void
  replaceProyecto: (next: AdminProyectoDetalle) => void
}

export function useAdminProyecto(
  id: string | number | null | undefined,
): UseAdminProyectoResult {
  const proyectoId = parseAdminProyectoId(
    id === null || id === undefined ? undefined : id,
  )
  const [proyecto, setProyecto] = useState<AdminProyectoDetalle | null>(null)
  const [loadedId, setLoadedId] = useState<number | null>(proyectoId)
  const [loading, setLoading] = useState(proyectoId !== null)
  const [error, setError] = useState<string | null>(null)
  const [missing, setMissing] = useState(proyectoId === null)
  const [statusKind, setStatusKind] = useState<ProyectoSubmitError['kind'] | null>(
    proyectoId === null ? 'not-found' : null,
  )
  const [reloadTrigger, setReloadTrigger] = useState(0)

  if (loadedId !== proyectoId) {
    setLoadedId(proyectoId)
    setProyecto(null)
    setLoading(proyectoId !== null)
    setError(null)
    setMissing(proyectoId === null)
    setStatusKind(proyectoId === null ? 'not-found' : null)
  }

  const hasVisibleProyectoRef = useRef(false)
  hasVisibleProyectoRef.current =
    proyecto !== null && proyecto.id === proyectoId

  const refetch = useCallback(() => {
    setReloadTrigger((current) => current + 1)
  }, [])

  const replaceProyecto = useCallback((next: AdminProyectoDetalle) => {
    setLoadedId(next.id)
    setProyecto(next)
    setLoading(false)
    setError(null)
    setMissing(false)
    setStatusKind(null)
  }, [])

  useEffect(() => subscribeAdminProyectosQueries(refetch), [refetch])

  useEffect(() => {
    if (proyectoId === null) {
      setProyecto(null)
      setLoading(false)
      setError(null)
      setMissing(true)
      setStatusKind('not-found')
      return
    }

    let cancelled = false

    const load = async () => {
      if (!hasVisibleProyectoRef.current) {
        setLoading(true)
      }
      setError(null)
      setMissing(false)
      setStatusKind(null)

      try {
        const detalle = await getAdminProyecto(proyectoId)
        if (!cancelled) {
          setProyecto(detalle)
          setMissing(false)
        }
      } catch (caught) {
        if (cancelled) {
          return
        }

        const parsed = parseProyectoSubmitError(caught)
        setProyecto(null)
        setStatusKind(parsed.kind)

        if (parsed.kind === 'not-found') {
          setMissing(true)
          setError(null)
        } else if (parsed.kind === 'unauthorized' || parsed.kind === 'forbidden') {
          setMissing(false)
          setError(null)
        } else {
          setMissing(false)
          setError('No fue posible cargar el proyecto.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [proyectoId, reloadTrigger])

  const visibleProyecto =
    proyecto !== null && proyecto.id === proyectoId ? proyecto : null

  return {
    proyecto: visibleProyecto,
    loading: loading || (proyecto !== null && proyecto.id !== proyectoId),
    error,
    missing,
    unauthorized: statusKind === 'unauthorized',
    forbidden: statusKind === 'forbidden',
    refetch,
    replaceProyecto,
  }
}
