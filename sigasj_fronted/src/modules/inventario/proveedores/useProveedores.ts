import { useCallback, useEffect, useState } from 'react'
import { getProveedores } from './proveedoresApi'
import { proveedorError } from './proveedorUtils'
import type { ProveedoresQuery, ProveedoresResponse } from './types'

export function useProveedores(query: ProveedoresQuery) {
  const { nombre, activo, page = 1, limit = 10 } = query
  const [result, setResult] = useState<ProveedoresResponse>({ data: [], total: 0, page, limit, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const refetch = useCallback(() => setReload((value) => value + 1), [])
  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); setError(null)
    getProveedores({ search: nombre, activo, page, limit }).then((data) => { if (!cancelled) setResult(data) }).catch((caught) => { if (!cancelled) { setError(proveedorError(caught, 'No fue posible cargar los proveedores. Intente nuevamente.')); setResult({ data: [], total: 0, page, limit, totalPages: 0 }) } }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [nombre, activo, page, limit, reload])
  return { result, loading, error, refetch }
}
