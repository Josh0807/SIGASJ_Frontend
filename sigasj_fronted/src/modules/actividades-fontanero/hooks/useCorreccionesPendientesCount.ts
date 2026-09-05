import { useEffect, useState } from 'react'
import { getCorreccionesPendientes } from '../services/actividadesFontaneroApi'

export type CorreccionesPendientesState = {
  count: number | null
  isLoading: boolean
  isError: boolean
  isUnauthorized: boolean
  isForbidden: boolean
  refetch: () => void
}

const parseHttpStatus = (error: unknown): number | null => {
  if (!(error instanceof Error)) {
    return null
  }
  const match = error.message.match(/HTTP\s+(\d+)/i)
  return match ? Number(match[1]) : null
}

export function useCorreccionesPendientesCount(): CorreccionesPendientesState {
  const [count, setCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [isForbidden, setIsForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setIsError(false)
      setIsUnauthorized(false)
      setIsForbidden(false)

      try {
        const result = await getCorreccionesPendientes()
        if (!cancelled) {
          setCount(result.total)
        }
      } catch (error) {
        if (cancelled) {
          return
        }
        const status = parseHttpStatus(error)
        setCount(null)
        setIsError(true)
        setIsUnauthorized(status === 401)
        setIsForbidden(status === 403)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  return {
    count,
    isLoading,
    isError,
    isUnauthorized,
    isForbidden,
    refetch: () => setReloadKey((value) => value + 1),
  }
}
