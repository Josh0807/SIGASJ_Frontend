import { useCallback, useEffect, useState } from 'react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import { getPublicProyectos, type PublicProyecto } from '../services/proyectosApi'

export function usePublicProyectos() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [proyectos, setProyectos] = useState<PublicProyecto[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchProyectos = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const data = await getPublicProyectos()
      setProyectos(data)
      setStatus('success')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible consultar los proyectos.',
      )
      setStatus('error')
    }
  }, [])

  useEffect(() => runAfterEffect(() => {
    void fetchProyectos()
  }), [fetchProyectos])

  return {
    status,
    proyectos,
    error,
    retry: fetchProyectos,
  }
}
