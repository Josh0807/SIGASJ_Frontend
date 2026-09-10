import { useCallback, useEffect, useState } from 'react'
import { getMateriales } from './materialesApi'
import type { MaterialesQuery, MaterialesResponse } from './types'

const emptyResult = (page: number, limit: number): MaterialesResponse => ({ data: [], total: 0, page, limit, totalPages: 0 })

export function useMateriales(query: MaterialesQuery) {
  const page = query.page ?? 1
  const limit = query.limit ?? 10
  const nombre = query.nombre
  const activo = query.activo
  const idCategoria = query.idCategoria
  const [result, setResult] = useState(() => emptyResult(page, limit))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const refetch = useCallback(() => setReload((value) => value + 1), [])

  useEffect(() => {
    let cancelled = false
    // La consulta cambia de estado antes de iniciar la sincronización remota.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    getMateriales({ nombre, activo, idCategoria, page, limit })
      .then((data) => { if (!cancelled) setResult(data) })
      .catch(() => { if (!cancelled) { setResult(emptyResult(page, limit)); setError('No fue posible cargar los materiales. Intente nuevamente.') } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [nombre, activo, idCategoria, page, limit, reload])

  return { result, loading, error, refetch }
}
