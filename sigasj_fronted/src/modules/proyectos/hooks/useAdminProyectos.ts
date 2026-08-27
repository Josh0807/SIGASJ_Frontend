import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_PROYECTOS_LIMIT,
  DEFAULT_PROYECTOS_PAGE,
  EMPTY_PROYECTOS_LISTADO,
  type ProyectosAdminListado,
  type QueryProyectosAdmin,
} from '../admin/types'
import { getAdminProyectos } from '../services/proyectosApi'

export type UseAdminProyectosResult = {
  listado: ProyectosAdminListado
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAdminProyectos(
  query: QueryProyectosAdmin,
): UseAdminProyectosResult {
  const [listado, setListado] = useState<ProyectosAdminListado>(
    EMPTY_PROYECTOS_LISTADO,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const nombre = query.nombre
  const estado = query.estado
  const activo = query.activo
  const page = query.page ?? DEFAULT_PROYECTOS_PAGE
  const limit = query.limit ?? DEFAULT_PROYECTOS_LIMIT

  const refetch = useCallback(() => {
    setReloadTrigger((current) => current + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await getAdminProyectos({
          nombre,
          estado,
          activo,
          page,
          limit,
        })

        if (!cancelled) {
          setListado(result)
        }
      } catch {
        if (!cancelled) {
          setError('No fue posible cargar los proyectos.')
          setListado({
            ...EMPTY_PROYECTOS_LISTADO,
            page,
            limit,
          })
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
  }, [nombre, estado, activo, page, limit, reloadTrigger])

  return { listado, loading, error, refetch }
}
