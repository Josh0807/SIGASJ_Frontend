import { useEffect, useState } from 'react'
import { getMaterial } from './materialesApi'
import type { Material } from './types'

export function useMaterial(id: number | null, initialMaterial?: Material) {
  const [material, setMaterial] = useState<Material | null>(initialMaterial ?? null)
  const [loading, setLoading] = useState(!initialMaterial)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id === null || initialMaterial) return
    let cancelled = false
    getMaterial(id)
      .then((result) => { if (!cancelled) setMaterial(result) })
      .catch((caught) => {
        if (cancelled) return
        const status = caught instanceof Error ? /^HTTP (\d+):/.exec(caught.message)?.[1] : null
        setError(status === '404' ? 'El material solicitado no existe.' : status === '400' ? 'El identificador del material no es válido.' : 'No fue posible cargar el material.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, initialMaterial])

  return { material, loading, error }
}
