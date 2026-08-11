import { useEffect, useState } from 'react'
import { getPublicTransparencia } from '../api/getPublicTransparencia'
import type { TransparencyPublication } from './TransparencySectionProps'

export type PublicTransparenciaQueryStatus = 'loading' | 'success' | 'error'

type UsePublicTransparenciaResult = {
  status: PublicTransparenciaQueryStatus
  publications: TransparencyPublication[]
  total: number
  retry: () => void
}

/**
 * Consulta transparencia pública. Los errores no se propagan: quedan en status "error".
 */
export function usePublicTransparencia(
  enabled: boolean,
): UsePublicTransparenciaResult {
  const [status, setStatus] = useState<PublicTransparenciaQueryStatus>(
    enabled ? 'loading' : 'success',
  )
  const [publications, setPublications] = useState<TransparencyPublication[]>(
    [],
  )
  const [total, setTotal] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const controller = new AbortController()
    let cancelled = false

    setStatus('loading')

    getPublicTransparencia({ signal: controller.signal })
      .then((result) => {
        if (cancelled) {
          return
        }

        setPublications(result.publications)
        setTotal(result.total)
        setStatus('success')
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setPublications([])
        setTotal(0)
        setStatus('error')
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [enabled, retryCount])

  return {
    status,
    publications,
    total,
    retry: () => setRetryCount((count) => count + 1),
  }
}
