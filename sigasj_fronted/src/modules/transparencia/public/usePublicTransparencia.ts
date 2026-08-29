import { useCallback, useEffect, useState } from 'react'
import type { TransparencyPublication } from './TransparencySectionProps'
import { getPublicTransparencia } from '../services/transparenciaApi'

export type PublicTransparenciaQueryStatus = 'loading' | 'success' | 'error'

type UsePublicTransparenciaResult = {
  status: PublicTransparenciaQueryStatus
  publications: TransparencyPublication[]
  total: number
  retry: () => void
}

export function usePublicTransparencia(
  enabled: boolean,
): UsePublicTransparenciaResult {
  const [status, setStatus] = useState<PublicTransparenciaQueryStatus>(
    enabled ? 'loading' : 'success',
  )
  const [publications, setPublications] = useState<TransparencyPublication[]>([])

  const load = useCallback(async () => {
    if (!enabled) {
      setStatus('success')
      setPublications([])
      return
    }

    setStatus('loading')

    try {
      const data = await getPublicTransparencia()
      setPublications(data)
      setStatus('success')
    } catch {
      setPublications([])
      setStatus('error')
    }
  }, [enabled])

  useEffect(() => {
    void load()
  }, [load])

  return {
    status: status === 'error' ? 'success' : status,
    publications,
    total: publications.length,
    retry: () => {
      void load()
    },
  }
}
