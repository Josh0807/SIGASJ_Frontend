import { useCallback, useEffect, useState } from 'react'
import { getCategorias } from './categoriasApi'
import type { CategoriasQuery, CategoriasResponse } from './types'

export function useCategorias(query: CategoriasQuery) {
  const { nombre, activo, page = 1, limit = 20 } = query
  const [result, setResult] = useState<CategoriasResponse>({ data: [], total: 0, page, limit, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const refetch = useCallback(() => setReload((value) => value + 1), [])
  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); setError(null)
    getCategorias({ nombre, activo, page, limit }).then((data) => { if (!cancelled) setResult(data) }).catch(() => { if (!cancelled) { setError('No fue posible cargar las categorías.'); setResult({ data: [], total: 0, page, limit, totalPages: 0 }) } }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [nombre, activo, page, limit, reload])
  return { result, loading, error, refetch }
}
